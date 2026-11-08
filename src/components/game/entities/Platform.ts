import { Entity } from "./Entity";

/**
 * Platform extends Entity as a static surface.
 * update() is a no-op; draw() renders a thin rect styled to the
 * site's line/signal palette.
 */
export class Platform extends Entity {
  private color: string;
  private accentColor: string;

  constructor(
    x: number,
    y: number,
    width: number,
    color: string,
    accentColor: string,
  ) {
    super(x, y, width, 6);
    this.color = color;
    this.accentColor = accentColor;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dt: number): void {
    // static — nothing to do
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Top accent stripe
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(this.x, this.y, this.width, 2);

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + 2, this.width, this.height - 2);

    ctx.restore();
  }
}
