import { Entity } from "./Entity";
import type { GamePalette } from "./Player";

/**
 * Platform — extends Entity as a static, collidable surface.
 * No movement; draw renders a styled rectangle.
 */
export class Platform extends Entity {
  private _palette: GamePalette;

  constructor(x: number, y: number, w: number, h: number, palette: GamePalette) {
    super(x, y, w, h);
    this._palette = palette;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dt: number): void {
    // Static — nothing to update
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Filled body
    ctx.fillStyle = this._palette.signal + "33"; // 20% opacity tint
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Top edge highlight
    ctx.fillStyle = this._palette.signal;
    ctx.fillRect(this.x, this.y, this.width, 2);
  }
}
