/**
 * Entity — abstract base class for all game objects.
 * Encapsulates position and dimensions; declares the polymorphic
 * update / draw contract that the Game loop calls uniformly.
 */
export abstract class Entity {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /** Called once per frame before drawing. */
  abstract update(dt: number): void;

  /** Called once per frame to paint onto the canvas. */
  abstract draw(ctx: CanvasRenderingContext2D): void;

  /** Axis-aligned bounding-box overlap test. */
  overlaps(other: Entity): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
