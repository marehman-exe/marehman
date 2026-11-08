import { Player }      from "./entities/Player";
import { Platform }    from "./entities/Platform";
import { Collectible } from "./entities/Collectible";
import type { GamePalette } from "./entities/Player";

const TOTAL_COLLECTIBLES = 5;

/**
 * Game — orchestrates the loop, input, collision, score, and reset.
 * Composes Player, Platform[], and Collectible[]; never inherits from Entity.
 *
 * Polymorphism: update() and draw() are called on every Entity via the
 * unified arrays without caring about the concrete type.
 */
export class Game {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _palette: GamePalette;

  private _player!: Player;
  private _platforms: Platform[] = [];
  private _collectibles: Collectible[] = [];

  private _score = 0;
  private _won = false;

  private _keys = new Set<string>();
  private _rafId = 0;
  private _lastTime = 0;

  // Bound handlers kept as fields for clean removeEventListener
  private _onKeyDown = (e: KeyboardEvent) => {
    this._keys.add(e.key);
    // Prevent page scroll while game is active
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  };
  private _onKeyUp = (e: KeyboardEvent) => this._keys.delete(e.key);

  constructor(canvas: HTMLCanvasElement, palette: GamePalette) {
    this._canvas = canvas;
    this._ctx    = canvas.getContext("2d")!;
    this._palette = palette;
    this._build();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  start(): void {
    document.addEventListener("keydown", this._onKeyDown, { passive: false });
    document.addEventListener("keyup",   this._onKeyUp);
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._loop);
  }

  stop(): void {
    cancelAnimationFrame(this._rafId);
    document.removeEventListener("keydown", this._onKeyDown);
    document.removeEventListener("keyup",   this._onKeyUp);
  }

  reset(): void {
    this._score = 0;
    this._won   = false;
    this._keys.clear();
    this._build();
  }

  get score(): number  { return this._score; }
  get won():   boolean { return this._won; }
  get total(): number  { return TOTAL_COLLECTIBLES; }

  // ── Construction ──────────────────────────────────────────────────────────

  private _build(): void {
    const W = this._canvas.width;
    const H = this._canvas.height;
    const p = this._palette;

    // Player starts center-top area
    this._player = new Player(W / 2 - 10, H * 0.1, this._keys, p);

    // Platforms — positions chosen to sit in the negative-space of a typical
    // portfolio page (center-column layout, wide margins on desktop).
    // Two ground-level anchor platforms + 5 floating ones.
    this._platforms = [
      // Ground
      new Platform(0,          H - 18, W,       18, p),
      // Left wall shelf
      new Platform(20,         H * 0.72, 110,    8, p),
      // Right wall shelf
      new Platform(W - 130,    H * 0.72, 110,    8, p),
      // Mid-left
      new Platform(W * 0.15,   H * 0.55, 140,    8, p),
      // Mid-right
      new Platform(W * 0.68,   H * 0.50, 140,    8, p),
      // High center
      new Platform(W * 0.38,   H * 0.35, 160,    8, p),
      // High left
      new Platform(W * 0.05,   H * 0.30, 100,    8, p),
      // High right
      new Platform(W * 0.78,   H * 0.28, 100,    8, p),
    ];

    // Collectibles — placed above each floating platform
    const spots: [number, number][] = [
      [W * 0.15 + 60,  H * 0.55 - 28],
      [W * 0.68 + 60,  H * 0.50 - 28],
      [W * 0.38 + 70,  H * 0.35 - 28],
      [W * 0.05 + 40,  H * 0.30 - 28],
      [W * 0.78 + 40,  H * 0.28 - 28],
    ];
    this._collectibles = spots.map(([cx, cy]) => new Collectible(cx, cy, p));
  }

  // ── Loop ─────────────────────────────────────────────────────────────────

  private _loop = (now: number): void => {
    const dt = Math.min((now - this._lastTime) / 1000, 0.05); // cap at 50 ms
    this._lastTime = now;

    this._update(dt);
    this._draw();

    this._rafId = requestAnimationFrame(this._loop);
  };

  // ── Update ────────────────────────────────────────────────────────────────

  private _update(dt: number): void {
    if (this._won) return;

    const W = this._canvas.width;
    const H = this._canvas.height;

    // Polymorphic update — Entity contract
    this._player.update(dt);
    for (const plat of this._platforms)    plat.update(dt);
    for (const col  of this._collectibles) col.update(dt);

    // Platform collision
    this._player.setAirborne();
    for (const plat of this._platforms) {
      if (this._overlaps(this._player, plat)) {
        const pFeet = this._player.y + this._player.height;
        const pTop  = this._player.y;
        const platTop = plat.y;

        // Only land if falling onto the top surface
        if (pFeet - platTop < 16 && pTop < platTop) {
          this._player.land(platTop);
        }
      }
    }

    this._player.clampToCanvas(W, H);

    // Collectible pickup
    for (const col of this._collectibles) {
      if (!col.collected && this._overlaps(this._player, col)) {
        col.collect();
        this._score++;
      }
    }

    if (this._score >= TOTAL_COLLECTIBLES) this._won = true;
  }

  // ── Draw ─────────────────────────────────────────────────────────────────

  private _draw(): void {
    const ctx = this._ctx;
    const W   = this._canvas.width;
    const H   = this._canvas.height;
    const p   = this._palette;

    ctx.clearRect(0, 0, W, H);

    // Polymorphic draw — Entity contract
    for (const plat of this._platforms)    plat.draw(ctx);
    for (const col  of this._collectibles) col.draw(ctx);
    this._player.draw(ctx);

    // HUD — score counter
    ctx.font = "bold 13px 'IBM Plex Mono', monospace";
    ctx.fillStyle = p.ink;
    ctx.globalAlpha = 0.75;
    ctx.fillText(`${this._score} / ${TOTAL_COLLECTIBLES}`, 12, H - 28);
    ctx.globalAlpha = 1;

    // Win overlay
    if (this._won) {
      ctx.fillStyle = p.signal + "22";
      ctx.fillRect(0, 0, W, H);

      ctx.font = "bold 20px 'IBM Plex Mono', monospace";
      ctx.fillStyle = p.signal;
      ctx.textAlign = "center";
      ctx.fillText("ALL COLLECTED!", W / 2, H / 2 - 12);
      ctx.font = "12px 'IBM Plex Mono', monospace";
      ctx.fillStyle = p.ink;
      ctx.fillText("press R to reset", W / 2, H / 2 + 12);
      ctx.textAlign = "left";
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _overlaps(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): boolean {
    return (
      a.x < b.x + b.width  &&
      a.x + a.width > b.x  &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
