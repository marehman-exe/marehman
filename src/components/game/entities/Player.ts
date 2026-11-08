import { Entity } from "./Entity";

/** Resolved at runtime from CSS custom properties. */
export interface PlayerColors {
  body: string;
  accent: string;
}

const GRAVITY = 1400;       // px/s²
const JUMP_VELOCITY = -520; // px/s (negative = up)
const MOVE_SPEED = 200;     // px/s
const MAX_FALL = 900;       // terminal velocity px/s

/**
 * Player extends Entity with movement, jumping, and gravity.
 * Private fields encapsulate physics state; public methods expose
 * only the inputs the Game needs to drive the player.
 */
export class Player extends Entity {
  private vx = 0;
  private vy = 0;
  private onGround = false;
  private colors: PlayerColors;

  /** Leg-bob animation timer (seconds). */
  private animT = 0;

  constructor(x: number, y: number, colors: PlayerColors) {
    super(x, y, 18, 26);
    this.colors = colors;
  }

  /** Called by Game with the current input snapshot. */
  applyInput(left: boolean, right: boolean, jump: boolean): void {
    if (left && !right) {
      this.vx = -MOVE_SPEED;
    } else if (right && !left) {
      this.vx = MOVE_SPEED;
    } else {
      this.vx = 0;
    }

    if (jump && this.onGround) {
      this.vy = JUMP_VELOCITY;
      this.onGround = false;
    }
  }

  /** Called by Game after collision resolution to land the player. */
  land(surfaceY: number): void {
    this.y = surfaceY - this.height;
    this.vy = 0;
    this.onGround = true;
  }

  isOnGround(): boolean {
    return this.onGround;
  }

  getVelocity(): { vx: number; vy: number } {
    return { vx: this.vx, vy: this.vy };
  }

  /** Clamp within canvas bounds (horizontal wrap). */
  clampX(canvasWidth: number): void {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
  }

  override update(dt: number): void {
    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.onGround = false; // will be set back by collision in Game

    if (this.vx !== 0) {
      this.animT += dt;
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height, animT } = this;
    const cx = x + width / 2;

    ctx.save();

    // Body
    ctx.fillStyle = this.colors.body;
    ctx.fillRect(x, y + 8, width, height - 8);

    // Head
    ctx.fillStyle = this.colors.accent;
    ctx.fillRect(x + 2, y, width - 4, 10);

    // Eyes (two tiny dots)
    ctx.fillStyle = this.colors.body;
    ctx.fillRect(cx - 4, y + 2, 2, 2);
    ctx.fillRect(cx + 1, y + 2, 2, 2);

    // Legs (animated bob)
    const bob = Math.sin(animT * 10) * 2;
    ctx.fillStyle = this.colors.accent;
    ctx.fillRect(x + 2, y + height - 6 + bob, 5, 6 - bob);
    ctx.fillRect(x + width - 7, y + height - 6 - bob, 5, 6 + bob);

    ctx.restore();
  }
}
