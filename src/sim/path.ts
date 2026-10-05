// Position along the enemy path (AC-5.1, AC-5.8), in grid units.
import { pathLengthTiles, pathPolyline } from '../config/map';

const POINTS = pathPolyline();
const SEGMENTS = POINTS.slice(1).map((p, i) => {
  const a = POINTS[i];
  return { a, b: p, len: Math.hypot(p[0] - a[0], p[1] - a[1]) };
});

export const PATH_LENGTH = pathLengthTiles();

/** Grid position after travelling `dist` tiles from the entry (clamped to the path). */
export function pathPoint(dist: number): { c: number; r: number } {
  let d = Math.max(0, dist);
  for (const s of SEGMENTS) {
    if (d <= s.len) {
      const t = d / s.len;
      return { c: s.a[0] + (s.b[0] - s.a[0]) * t, r: s.a[1] + (s.b[1] - s.a[1]) * t };
    }
    d -= s.len;
  }
  const last = POINTS[POINTS.length - 1];
  return { c: last[0], r: last[1] };
}
