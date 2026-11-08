import { Entity } from "./entities/Entity";
import { Player } from "./entities/Player";
import { Platform } from "./entities/Platform";
import { Collectible } from "./entities/Collectible";

// ---------------------------------------------------------------------------
// Color palette — resolved once from CSS custom properties at Game creation.
// ---------------------------------------------------------------------------
interface Palette {
  signal: string;
  live: string;
  ink: string;
  paper: string;
  muted: string;
  line: string;
}

function resolvePalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();
  return {
    signal: get("--color-signal") || "#0a6e68",
    live:   get("--color-live")   || "#16a34a",
    ink:    get("--color-ink")    || "#0f1210",
    paper:  get("--color-paper")  || "#ffffff",
    muted:  get("--color-muted")  || "#52615d",
    line:   get("--color-line")   || "#dde0dc",
  };
}

// ---------------------------------------------------------------------------
// Input snapshot — updated by keydown/keyup handlers in Game.
// ---------------------------------------------------------------------------
interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

// ---------------------------------------------------------------------------
// Platform layout — expressed as fractions of canvas width/height so they
// scale when the canvas is resized.
// ---------------------------------------------------------------------------
interface PlatformDef {
  xFrac: number;
  yFrac: number;
  wFrac: number;
}

const PLATFORM_DEFS: PlatformDef[] = [
  { xFrac: 0.08, yFrac: 0.72, wFrac: 0.18 }, // left low
  { xFrac: 0.30, yFrac: 0.55, wFrac: 0.16 }, // left mid
  { xFrac: 0.52, yFrac: 0.40, wFrac: 0.18 }, // center
  { xFrac: 0.72, yFrac: 0.60, wFrac: 0.14 }, // right mid
  { xFrac: 0.55, yFrac: 0.75, wFrac: 0.12 }, // right low
  { xFrac: 0.20, yFrac: 0.35, wFrac: 0.14 }, // left high
  { xFrac: 0.75, yFrac: 0.30, wFrac: 0.16 }, // right high
];

// Collectible positions — placed above platforms (index into PLATFORM_DEFS).
const COLLECTIBLE_ON: number[] = [0, 1, 2, 3, 5]; // 5 gems on 5 platforms

const TOTAL = 5;

// ---------------------------------------------------------------------------
// Game — owns the loop, entities, input, collision, score, and reset.
// Composition: Game holds arrays of Entity references and calls
// update() / draw() polymorphically.
// ---------------------------------------------------------------------------
export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private palette: Palette;

  private player!: Player;
  private platforms: Platform[] = [];
  private collectibles: Collectible[] = [];

  /** The full entity list for polymorphic update/draw. */
  private entities: Entity[] = [];

  private input: InputState = { left: false, right: false, jump: false };
  private jumpConsumed = false; // one-shot jump per keypress

  private score = 0;
  private _won = false;

  private rafId = 0;
  private lastTime = 0;
  private running = false;

  private onScoreChange: (score: number) => void;
  private onWin: () => void;

  // Key handler refs stored so we can remove them on destroy.
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundVisChange: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    onScoreChange: (score: number) => void,
    onWin: () => void,
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;

    this.palette = resolvePalette();
    this.onScoreChange = onScoreChange;
    this.onWin = onWin;

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundVisChange = this.handleVisibilityChange.bind(this);

    this.buildEntities();
    this.attachListeners();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  reset(): void {
    this.stop();
    this.score = 0;
    this._won = false;
    this.input = { left: false, right: false, jump: false };
    this.jumpConsumed = false;
    this.buildEntities();
    this.onScoreChange(0);
    this.start();
  }

  /** Call when the canvas is resized so entities reposition. */
  resize(): void {
    this.buildEntities();
  }

  destroy(): void {
    this.stop();
    this.detachListeners();
  }

  get won(): boolean {
    return this._won;
  }

  get total(): number {
    return TOTAL;
  }

  // ── Entity construction ───────────────────────────────────────────────────

  private buildEntities(): void {
    const { width: W, height: H } = this.canvas;
    const { signal, live, ink, line, muted } = this.palette;

    this.platforms = PLATFORM_DEFS.map(
      ({ xFrac, yFrac, wFrac }) =>
        new Platform(
          Math.round(xFrac * W),
          Math.round(yFrac * H),
          Math.round(wFrac * W),
          line,
          signal,
        ),
    );

    this.collectibles = COLLECTIBLE_ON.map((pIdx) => {
      const p = this.platforms[pIdx];
      return new Collectible(
        p.x + p.width / 2 - 7,
        p.y - 22,
        live,
        signal,
      );
    });

    // Ground platform spans full width
    const ground = new Platform(0, H - 4, W, line, signal);

    // Spawn player at center-bottom above ground
    this.player = new Player(
      Math.round(W / 2 - 9),
      H - 4 - 26,
      { body: ink, accent: signal },
    );

    this.entities = [ground, ...this.platforms, ...this.collectibles, this.player];

    // Suppress unused-variable warnings for muted (palette is read once above)
    void muted;
  }

  // ── Main loop ─────────────────────────────────────────────────────────────

  private loop(now: number): void {
    if (!this.running) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50 ms
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number): void {
    if (this._won) return;

    // Feed input to player
    this.player.applyInput(this.input.left, this.input.right, this.input.jump);

    // Polymorphic update — every entity updates itself
    for (const e of this.entities) {
      e.update(dt);
    }

    // Clamp player horizontally
    this.player.clampX(this.canvas.width);

    // Wrap player if they fall below canvas
    if (this.player.y > this.canvas.height + 40) {
      this.player.x = this.canvas.width / 2 - 9;
      this.player.y = 0;
    }

    // Platform collision (AABB top-surface only)
    this.resolvePlatformCollisions();

    // Collectible pickup
    this.resolveCollectibles();
  }

  private resolvePlatformCollisions(): void {
    // All platforms including the ground (which is also a Platform in entities[0])
    const surfaces = this.entities.filter((e) => e instanceof Platform);
    const p = this.player;
    const { vy } = p.getVelocity();

    for (const plat of surfaces) {
      if (!p.overlaps(plat)) continue;

      const prevBottom = p.y + p.height - vy * (1 / 60); // approx prev bottom
      const platTop = plat.y;

      // Only land when falling and approaching from above
      if (vy >= 0 && prevBottom <= platTop + 8) {
        p.land(platTop);
      }
    }
  }

  private resolveCollectibles(): void {
    for (const c of this.collectibles) {
      if (!c.collected && this.player.overlaps(c)) {
        c.collect();
        this.score += 1;
        this.onScoreChange(this.score);
        if (this.score >= TOTAL) {
          this._won = true;
          this.onWin();
        }
      }
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  private render(): void {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Polymorphic draw — every entity draws itself
    for (const e of this.entities) {
      e.draw(ctx);
    }
  }

  // ── Input handling ────────────────────────────────────────────────────────

  private static isGameKey(key: string): boolean {
    return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "w", "a", "s", "d", " "].includes(key);
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

    // preventDefault only while game is running and not won
    if (!this._won) {
      e.preventDefault();
    }

    switch (e.key) {
      case "ArrowLeft":  case "a": this.input.left  = true;  break;
      case "ArrowRight": case "d": this.input.right = true;  break;
      case "ArrowUp":    case "w":
      case " ":
        if (!this.jumpConsumed) {
          this.input.jump = true;
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
        this.input.jump = false;
        this.jumpConsumed = false;
        break;
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stop();
    } else if (!this._won) {
      this.lastTime = performance.now();
      this.start();
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  private attachListeners(): void {
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup",   this.boundKeyUp);
    document.addEventListener("visibilitychange", this.boundVisChange);
  }

  private detachListeners(): void {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup",   this.boundKeyUp);
    document.removeEventListener("visibilitychange", this.boundVisChange);
  }
}
