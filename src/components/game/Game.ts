import { Entity } from "./entities/Entity";
import { Player } from "./entities/Player";
import { Platform } from "./entities/Platform";
import { Collectible } from "./entities/Collectible";

// ---------------------------------------------------------------------------
// Physics constants (must match Player.ts)
// ---------------------------------------------------------------------------
const GRAVITY        = 1400;  // px/s²  (matches Player.ts)
const JUMP_VELOCITY  = 520;   // px/s magnitude
// Max jump height: v²/(2g) ≈ 96 px.  Use 80 % as the reachable-gap threshold.
const MAX_JUMP_HEIGHT = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY); // ~96
const GAP_THRESHOLD   = MAX_JUMP_HEIGHT * 0.8;                           // ~77

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
interface Palette {
  signal: string;
  live:   string;
  ink:    string;
  muted:  string;
  line:   string;
}

function resolvePalette(): Palette {
  const s   = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();
  return {
    signal: get("--color-signal") || "#0a6e68",
    live:   get("--color-live")   || "#16a34a",
    ink:    get("--color-ink")    || "#0f1210",
    muted:  get("--color-muted")  || "#52615d",
    line:   get("--color-line")   || "#dde0dc",
  };
}

// ---------------------------------------------------------------------------
// DOM platform extraction
// ---------------------------------------------------------------------------
const DOM_SELECTOR =
  "h1, h2, h3, button, " +
  "a[role='button'], a[class*='btn'], a[class*='button'], " +
  "img, [class*='card'], [class*='project'], [class*='panel']";

const MAX_DOM_PLATFORMS  = 40;
const Y_DEDUP_THRESHOLD  = 30; // px — skip platforms within this gap of another

interface PlatformSpec {
  x: number;
  y: number;  // document-space
  w: number;
  fromDom: boolean;
}

/** Returns document-space platform specs derived from visible DOM elements. */
function buildDomPlatforms(canvasWidth: number): PlatformSpec[] {
  const specs: PlatformSpec[] = [];
  const els = document.querySelectorAll<HTMLElement>(DOM_SELECTOR);

  for (const el of Array.from(els)) {
    if (specs.length >= MAX_DOM_PLATFORMS) break;

    // Skip hidden elements
    if (!el.offsetParent && el.tagName.toLowerCase() !== "body") continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const pos = style.position;
    if (pos === "fixed" || pos === "sticky") continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < 60 || rect.height < 20) continue;

    // Clamp platform width to canvas; skip if element is mostly off-screen
    const x = Math.max(0, rect.left);
    const w = Math.min(rect.width, canvasWidth - x);
    if (w < 60) continue;

    const y = rect.top + window.scrollY; // document-space top edge

    // Y-dedup: skip if a platform already exists within Y_DEDUP_THRESHOLD
    const duplicate = specs.some((s) => Math.abs(s.y - y) < Y_DEDUP_THRESHOLD);
    if (duplicate) continue;

    specs.push({ x, y, w, fromDom: true });
  }

  return specs;
}

/** Auto-insert stepping platforms in gaps > GAP_THRESHOLD between sorted specs. */
function fillGaps(specs: PlatformSpec[], canvasWidth: number): PlatformSpec[] {
  if (specs.length === 0) return specs;

  // Sort by y ascending (top = small y in document space)
  const sorted = [...specs].sort((a, b) => a.y - b.y);
  const result: PlatformSpec[] = [...sorted];

  for (let i = 0; i < sorted.length - 1; i++) {
    const upper = sorted[i];
    const lower = sorted[i + 1];
    let gap = lower.y - upper.y;
    let prevY = upper.y;

    while (gap > GAP_THRESHOLD) {
      const stepY = prevY + GAP_THRESHOLD * 0.9;
      const stepX = Math.round(((canvasWidth * 0.15) + Math.random() * canvasWidth * 0.6));
      const stepW = Math.round(80 + Math.random() * 60);
      const clamped = Math.min(stepX, canvasWidth - stepW);
      result.push({ x: Math.max(0, clamped), y: stepY, w: stepW, fromDom: false });
      gap -= GAP_THRESHOLD * 0.9;
      prevY = stepY;
    }
  }

  // Re-sort after insertion
  return result.sort((a, b) => a.y - b.y);
}

// ---------------------------------------------------------------------------
// Collectible placement — one per section, spread across the page
// ---------------------------------------------------------------------------
const TOTAL_COLLECTIBLES = 5;

function placeCollectibles(
  platforms: PlatformSpec[],
  docHeight: number,
  palette: Palette,
): Collectible[] {
  if (platforms.length === 0) return [];

  // Divide document height into TOTAL_COLLECTIBLES equal bands
  const bandH = docHeight / TOTAL_COLLECTIBLES;
  const chosen: PlatformSpec[] = [];

  for (let band = 0; band < TOTAL_COLLECTIBLES; band++) {
    const lo = band * bandH;
    const hi = lo + bandH;
    // Find platforms whose y falls in this band
    const inBand = platforms.filter((p) => p.y >= lo && p.y < hi);
    if (inBand.length === 0) {
      console.warn(`[GameMode] No reachable platform in section ${band + 1}/${TOTAL_COLLECTIBLES}`);
      continue;
    }
    // Pick one — prefer DOM-derived ones first
    const dom = inBand.filter((p) => p.fromDom);
    chosen.push(dom.length > 0 ? dom[Math.floor(dom.length / 2)] : inBand[Math.floor(inBand.length / 2)]);
  }

  return chosen.map(
    (p) => new Collectible(p.x + p.w / 2 - 7, p.y - 22, palette.live, palette.signal),
  );
}

// ---------------------------------------------------------------------------
// Input state
// ---------------------------------------------------------------------------
interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------
export class Game {
  private canvas: HTMLCanvasElement;
  private ctx:    CanvasRenderingContext2D;
  private palette: Palette;

  private player!:       Player;
  private platforms:     Platform[] = [];
  private collectibles:  Collectible[] = [];
  private platformSpecs: PlatformSpec[] = [];

  /** Unified polymorphic list for update + draw. */
  private entities: Entity[] = [];

  private input:        InputState = { left: false, right: false, jump: false };
  private jumpConsumed  = false;

  private score   = 0;
  private _won    = false;
  private _fell   = false;

  private rafId    = 0;
  private lastTime = 0;
  private running  = false;

  /** Timestamp of the last scroll we initiated (to distinguish from user scroll). */
  private lastGameScrollTime = 0;
  /** Timestamp of the last scroll event we received. */
  private lastScrollEventTime = 0;

  private onScoreChange: (score: number) => void;
  private onWin:         () => void;
  private onFell:        () => void;

  private boundKeyDown:    (e: KeyboardEvent) => void;
  private boundKeyUp:      (e: KeyboardEvent) => void;
  private boundVisChange:  () => void;
  private boundScroll:     () => void;

  private rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    onScoreChange: (score: number) => void,
    onWin:         () => void,
    onFell:        () => void,
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx     = ctx;
    this.palette = resolvePalette();

    this.onScoreChange = onScoreChange;
    this.onWin         = onWin;
    this.onFell        = onFell;

    this.boundKeyDown   = this.handleKeyDown.bind(this);
    this.boundKeyUp     = this.handleKeyUp.bind(this);
    this.boundVisChange = this.handleVisibilityChange.bind(this);
    this.boundScroll    = () => { this.lastScrollEventTime = performance.now(); };

    this.rebuildPlatforms();
    this.attachListeners();
    this.scheduleRebuildOnSettle();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  start(): void {
    if (this.running) return;
    this.running  = true;
    this.lastTime = performance.now();
    this.rafId    = requestAnimationFrame(this.loop.bind(this));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  reset(): void {
    this.stop();
    this.score  = 0;
    this._won   = false;
    this._fell  = false;
    this.input  = { left: false, right: false, jump: false };
    this.jumpConsumed = false;
    this.rebuildPlatforms();
    this.onScoreChange(0);
    this.start();
  }

  /** Respawn player at start WITHOUT resetting score (for "try again" after fall). */
  respawn(): void {
    this._fell = false;
    this.input = { left: false, right: false, jump: false };
    this.jumpConsumed = false;
    const spawnY = this.platformSpecs.length > 0
      ? this.platformSpecs[0].y - this.player.height - 2
      : 60;
    this.player.x = this.canvas.width / 2 - 9;
    this.player.y = spawnY;
    this.start();
  }

  /** Called when canvas logical size changes. Re-reads DOM layout. */
  resize(): void {
    this.scheduleRebuild();
  }

  destroy(): void {
    this.stop();
    this.detachListeners();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.rebuildTimer !== null) {
      clearTimeout(this.rebuildTimer);
      this.rebuildTimer = null;
    }
  }

  get won():   boolean { return this._won;   }
  get fell():  boolean { return this._fell;  }
  get total(): number  { return TOTAL_COLLECTIBLES; }

  // ── Platform rebuild ──────────────────────────────────────────────────────

  /**
   * Build all platforms from DOM + gap-fill, then place collectibles.
   * NEVER called inside the rAF loop — only from event/observer callbacks.
   */
  private rebuildPlatforms(): void {
    const W = this.canvas.width;   // logical px (already divided by DPR)
    const palette = this.palette;

    // 1. DOM-derived platforms
    const domSpecs = buildDomPlatforms(W);

    // 2. Ground platform at very top of page (y=0) as a spawn surface, and a
    //    guaranteed low platform near the very bottom to give the player ground.
    const docH = document.body.scrollHeight;
    const extraSpecs: PlatformSpec[] = [
      { x: 0,               y: 10,         w: W,                    fromDom: false },
      { x: Math.round(W * 0.1), y: docH - 60, w: Math.round(W * 0.8), fromDom: false },
    ];

    // 3. Fill gaps
    const allSpecs = fillGaps([...domSpecs, ...extraSpecs], W);
    this.platformSpecs = allSpecs;

    // 4. Build Platform entities
    this.platforms = allSpecs.map(
      ({ x, y, w }) => new Platform(x, y, w, palette.line, palette.signal),
    );

    // 5. Place collectibles
    this.collectibles = placeCollectibles(allSpecs, docH, palette);

    // 6. Compose entity list (platforms first so player renders on top)
    this.rebuildEntityList();

    // 7. Spawn player above the topmost platform
    const spawnSpec = allSpecs[0] ?? { x: W / 2 - 9, y: 30, w: 18 };
    if (!this.player) {
      this.player = new Player(
        spawnSpec.x + spawnSpec.w / 2 - 9,
        spawnSpec.y - 28,
        { body: palette.ink, accent: palette.signal },
      );
    } else {
      // Snap player to new surface if its previous ground platform moved
      this.snapPlayerToGround();
    }

    this.rebuildEntityList();
  }

  private rebuildEntityList(): void {
    if (!this.player) return;
    this.entities = [...this.platforms, ...this.collectibles, this.player];
  }

  /**
   * If the player is standing on a platform that has moved during a rebuild,
   * snap their y to the new surface.
   */
  private snapPlayerToGround(): void {
    if (!this.player.isOnGround()) return;
    for (const plat of this.platforms) {
      if (this.player.overlaps(plat)) {
        const { vy } = this.player.getVelocity();
        if (vy >= 0) {
          this.player.land(plat.y);
          return;
        }
      }
    }
  }

  private scheduleRebuild(): void {
    if (this.rebuildTimer !== null) clearTimeout(this.rebuildTimer);
    this.rebuildTimer = setTimeout(() => {
      this.rebuildTimer = null;
      this.rebuildPlatforms();
    }, 100);
  }

  /** Fire a rebuild on `load` and once images/fonts have had time to settle. */
  private scheduleRebuildOnSettle(): void {
    // Rebuild after window load (fonts/images may not have been ready at init)
    const onLoad = () => { this.scheduleRebuild(); };
    if (document.readyState === "complete") {
      this.scheduleRebuild();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    // Also trigger after document.fonts if available
    if (document.fonts && typeof document.fonts.ready !== "undefined") {
      document.fonts.ready.then(() => this.scheduleRebuild());
    }

    // ResizeObserver on body to catch layout shifts
    this.resizeObserver = new ResizeObserver(() => this.scheduleRebuild());
    this.resizeObserver.observe(document.body);
  }

  // ── Main loop ─────────────────────────────────────────────────────────────

  private loop(now: number): void {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt);
    this.render();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number): void {
    if (this._won || this._fell) return;

    this.player.applyInput(this.input.left, this.input.right, this.input.jump);

    // Polymorphic update
    for (const e of this.entities) e.update(dt);

    this.player.clampX(this.canvas.width);

    // Fall detection: more than 200 px below visible viewport bottom
    const viewportBottom = window.scrollY + window.innerHeight;
    if (this.player.y > viewportBottom + 200) {
      this._fell = true;
      this.stop();
      this.onFell();
      return;
    }

    this.resolvePlatformCollisions();
    this.resolveCollectibles();
    this.cameraFollow();
  }

  // ── Collision ─────────────────────────────────────────────────────────────

  private resolvePlatformCollisions(): void {
    const p = this.player;
    const { vy } = p.getVelocity();

    for (const plat of this.platforms) {
      if (!p.overlaps(plat)) continue;
      // Only land when falling and the player's previous bottom was above the surface
      const prevBottom = p.y + p.height - vy / 60;
      if (vy >= 0 && prevBottom <= plat.y + 8) {
        p.land(plat.y);
      }
    }
  }

  private resolveCollectibles(): void {
    for (const c of this.collectibles) {
      if (!c.collected && this.player.overlaps(c)) {
        c.collect();
        this.score += 1;
        this.onScoreChange(this.score);
        if (this.score >= TOTAL_COLLECTIBLES) {
          this._won = true;
          this.onWin();
        }
      }
    }
  }

  // ── Camera follow ─────────────────────────────────────────────────────────

  /**
   * Soft camera follow using lerp.  The player's viewport-Y is
   * player.y - window.scrollY.  We want to keep it in [20 %, 70 %]
   * of window.innerHeight.  Nudge with scrollBy only when the user
   * has not manually scrolled in the last 200 ms.
   */
  private cameraFollow(): void {
    const now = performance.now();
    const userScrolledRecently =
      this.lastScrollEventTime > this.lastGameScrollTime &&
      now - this.lastScrollEventTime < 200;
    if (userScrolledRecently) return;

    const viewportH  = window.innerHeight;
    const playerViewY = this.player.y - window.scrollY;
    const zoneTop    = viewportH * 0.20;
    const zoneBot    = viewportH * 0.70;

    let delta = 0;
    if (playerViewY < zoneTop) delta = playerViewY - zoneTop;
    if (playerViewY > zoneBot) delta = playerViewY - zoneBot;
    if (delta === 0) return;

    // Lerp: scroll proportionally to distance (feels natural, no fixed cap)
    const nudge = delta * 0.12;
    if (Math.abs(nudge) < 0.5) return;

    this.lastGameScrollTime = now;
    window.scrollBy({ top: nudge, behavior: "auto" });
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  private render(): void {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Translate into document space so entities at absolute y render correctly
    ctx.save();
    ctx.translate(0, -window.scrollY);

    // Polymorphic draw
    for (const e of this.entities) e.draw(ctx);

    ctx.restore();
  }

  // ── Input handling ────────────────────────────────────────────────────────

  private static isGameKey(key: string): boolean {
    return ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown",
            "w","a","s","d"," "].includes(key);
  }

  private static isFocusedInField(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if ((el as HTMLElement).isContentEditable) return true;
    return false;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!Game.isGameKey(e.key)) return;
    if (Game.isFocusedInField()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!this._won && !this._fell) e.preventDefault();

    switch (e.key) {
      case "ArrowLeft":  case "a": this.input.left  = true;  break;
      case "ArrowRight": case "d": this.input.right = true;  break;
      case "ArrowUp":    case "w":
      case " ":
        if (!this.jumpConsumed) {
          this.input.jump   = true;
          this.jumpConsumed = true;
        }
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.key) {
      case "ArrowLeft":  case "a": this.input.left  = false; break;
      case "ArrowRight": case "d": this.input.right = false; break;
      case "ArrowUp":    case "w":
      case " ":
        this.input.jump   = false;
        this.jumpConsumed = false;
        break;
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stop();
    } else if (!this._won && !this._fell) {
      this.lastTime = performance.now();
      this.start();
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  private attachListeners(): void {
    window.addEventListener("keydown",          this.boundKeyDown);
    window.addEventListener("keyup",            this.boundKeyUp);
    window.addEventListener("scroll",           this.boundScroll, { passive: true });
    document.addEventListener("visibilitychange", this.boundVisChange);
  }

  private detachListeners(): void {
    window.removeEventListener("keydown",          this.boundKeyDown);
    window.removeEventListener("keyup",            this.boundKeyUp);
    window.removeEventListener("scroll",           this.boundScroll);
    document.removeEventListener("visibilitychange", this.boundVisChange);
  }
}
