import { Entity } from "./Entity";
import type { GamePalette } from "./Player";

/**
 * Collectible — extends Entity with a collected state and a float animation.
 * Demonstrates polymorphism: the Game loop calls update()/draw() uniformly.
 */
export class Collectible extends Entity {
  private _collected = false;
  private _age = 0;           // seconds since spawn, drives float animation
  private _palette: GamePalette;

  constructor(x: number, y: number, palette: GamePalette) {
    super(x, y, 14, 14);
    this._palette = palette;
  }

  get collected(): boolean {
    return this._collected;
  }

  collect(): void {
    this._collected = true;
  }

  update(dt: number): void {
    if (!this._collected) this._age += dt;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this._collected) return;

    // Floating bob: oscillate vertically ±4 px
    const floatY = this.y + Math.sin(this._age * 3) * 4;

    // Outer glow ring
    ctx.strokeStyle = this._palette.signal;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      floatY + this.height / 2,
      this.width / 2 + 3,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Inner diamond (rotated square)
    const cx = this.x + this.width / 2;
    const cy = floatY + this.height / 2;
    const r  = this.width / 2;

    ctx.fillStyle = this._palette.signal;
    ctx.beginPath();
    ctx.moveTo(cx,     cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx,     cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
  }
}
