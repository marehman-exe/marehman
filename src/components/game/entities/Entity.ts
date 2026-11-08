/**
 * Entity — abstract base class for all game objects.
 * Encapsulates position, size, and the update/draw contract.
 */
export abstract class Entity {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  /** Called once per frame before drawing. */
  abstract update(dt: number): void;

  /** Called once per frame to render to the canvas. */
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
