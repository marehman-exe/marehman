import { Entity } from "./Entity";

/**
 * Collectible extends Entity with a collected state and a
 * spinning pixel-diamond draw animation.
 */
export class Collectible extends Entity {
  private _collected = false;
  private spinT = 0;
  private color: string;
  private glowColor: string;

  constructor(x: number, y: number, color: string, glowColor: string) {
    super(x, y, 14, 14);
    this.color = color;
    this.glowColor = glowColor;
  }

  get collected(): boolean {
    return this._collected;
  }

  collect(): void {
    this._collected = true;
  }

  override update(dt: number): void {
    if (!this._collected) {
      this.spinT += dt;
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    if (this._collected) return;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = 6;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.spinT * 2); // spin ~0.3 rev/s

    // Outer glow ring
    ctx.strokeStyle = this.glowColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(this.spinT * 4);

    // Draw a diamond (rotated square)
    ctx.beginPath();
    ctx.moveTo(0, -r - 2);
    ctx.lineTo(r + 2, 0);
    ctx.lineTo(0, r + 2);
    ctx.lineTo(-r - 2, 0);
    ctx.closePath();
    ctx.stroke();

    // Filled diamond
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = this.glowColor;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-2, -3, 4, 3);

    ctx.restore();
  }
}
