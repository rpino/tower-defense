// Isometric geometry (design §3.5). Pure: no Phaser, no state.
// Grid cell (c, r) maps to the centre of the tile's top diamond in world px.

/** Half the width and half the height of a tile's top diamond (132×66). */
export const TILE_HALF_W = 66;
export const TILE_HALF_H = 33;

export interface Point {
  x: number;
  y: number;
}

export function gridToWorld(c: number, r: number): Point {
  return { x: (c - r) * TILE_HALF_W, y: (c + r) * TILE_HALF_H };
}

export function worldToGrid(x: number, y: number): { c: number; r: number } {
  const a = x / TILE_HALF_W;
  const b = y / TILE_HALF_H;
  return { c: (a + b) / 2, r: (b - a) / 2 };
}

/**
 * AC-10.2 / DES-1: the spot nearest to `pt`, if it is within `maxDist` world px.
 * Returns spots of any state; callers reject occupied ones.
 */
export function nearestSpot<S extends { c: number; r: number }>(
  pt: Point,
  spots: readonly S[],
  maxDist: number,
): S | null {
  let best: S | null = null;
  let bestD = maxDist;
  for (const s of spots) {
    const w = gridToWorld(s.c, s.r);
    const d = Math.hypot(pt.x - w.x, pt.y - w.y);
    if (d <= bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}

/**
 * A circle of `radiusTiles` on the ground grid, as a screen-aligned ellipse in
 * world px (used for range circles and the splash ring).
 */
export function groundEllipse(radiusTiles: number): { rx: number; ry: number } {
  return { rx: radiusTiles * TILE_HALF_W * Math.SQRT2, ry: radiusTiles * TILE_HALF_H * Math.SQRT2 };
}
