import { Entity } from "./Entity";

/** Palette values read from CSS custom properties at runtime. */
export interface GamePalette {
  ink: string;
  signal: string;
  paper: string;
}

const GRAVITY = 1400;      // px/s²
const JUMP_VEL = -520;     // px/s  (negative = up)
const MOVE_SPEED = 220;    // px/s
const MAX_FALL = 900;      // terminal velocity px/s

/**
 * Player — extends Entity with keyboard-driven movement, jumping, and gravity.
 * Encapsulates velocity and grounded state as private fields.
 */
export class Player extends Entity {
  private vx = 0;
  private vy = 0;
  private _grounded = false;
  private _keys: Set<string>;
  private _palette: GamePalette;

  constructor(x: number, y: number, keys: Set<string>, palette: GamePalette) {
    super(x, y, 20, 28);
    this._keys = keys;
    this._palette = palette;
  }

  get grounded(): boolean {
    return this._grounded;
  }

  /** Called by Game after platform collision resolution. */
  land(surfaceY: number): void {
    this.y = surfaceY - this.height;
    this.vy = 0;
    this._grounded = true;
  }

  /** Mark player as airborne (no platform underfoot this frame). */
  setAirborne(): void {
    this._grounded = false;
  }

  update(dt: number): void {
    // Horizontal input
    const left  = this._keys.has("ArrowLeft")  || this._keys.has("a") || this._keys.has("A");
    const right = this._keys.has("ArrowRight") || this._keys.has("d") || this._keys.has("D");
    this.vx = right ? MOVE_SPEED : left ? -MOVE_SPEED : 0;

    // Jump
    const jump = this._keys.has("ArrowUp") || this._keys.has("w") || this._keys.has("W") || this._keys.has(" ");
    if (jump && this._grounded) {
      this.vy = JUMP_VEL;
      this._grounded = false;
    }

    // Gravity
    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);

    // Integrate
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Clamp to canvas width (wrap-around handled by Game which passes canvasW)
  }

  /** Apply canvas boundary so the player doesn't leave the screen. */
  clampToCanvas(canvasW: number, canvasH: number): void {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasW) this.x = canvasW - this.width;
    // If player falls off the bottom, reset to top
    if (this.y > canvasH + 60) {
      this.y = -this.height;
      this.vy = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height } = this;

    // Body
    ctx.fillStyle = this._palette.signal;
    ctx.fillRect(x, y + 8, width, height - 8);

    // Head
    ctx.fillStyle = this._palette.ink;
    ctx.fillRect(x + 2, y, width - 4, 10);

    // Eyes
    ctx.fillStyle = this._palette.paper;
    ctx.fillRect(x + 5,  y + 2, 3, 3);
    ctx.fillRect(x + 12, y + 2, 3, 3);

    // Legs (two rects that alternate when moving)
    ctx.fillStyle = this._palette.signal;
    if (this.vx !== 0 && this._grounded) {
      const frame = Math.floor(Date.now() / 120) % 2;
      ctx.fillRect(x + (frame === 0 ? 2 : 8),  y + height - 6, 5, 6);
      ctx.fillRect(x + (frame === 0 ? 8 : 2),  y + height - 6, 5, 6);
    } else {
      ctx.fillRect(x + 2, y + height - 6, 5, 6);
      ctx.fillRect(x + 8, y + height - 6, 5, 6);
    }
  }
}
