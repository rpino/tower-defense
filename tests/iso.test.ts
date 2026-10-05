import { describe, expect, it } from 'vitest';
import { gridToWorld, nearestSpot, worldToGrid } from '../src/sim/iso';

describe('T-3 isometric math', () => {
  it('grid (0,0) is the world origin; +c goes right-down, +r goes left-down', () => {
    expect(gridToWorld(0, 0)).toEqual({ x: 0, y: 0 });
    expect(gridToWorld(1, 0)).toEqual({ x: 66, y: 33 });
    expect(gridToWorld(0, 1)).toEqual({ x: -66, y: 33 });
  });

  it('grid → world → grid round-trips, including fractions', () => {
    for (const [c, r] of [
      [0, 0],
      [3, 5],
      [7, 7],
      [2.5, 0.25],
      [-0.5, 1],
    ]) {
      const w = gridToWorld(c, r);
      const g = worldToGrid(w.x, w.y);
      expect(g.c).toBeCloseTo(c, 9);
      expect(g.r).toBeCloseTo(r, 9);
    }
  });

  const spots = [
    { id: 'a', c: 3, r: 2 },
    { id: 'b', c: 5, r: 4 },
  ];

  it('AC-10.2: the nearest spot wins when a tap is between two spots', () => {
    const a = gridToWorld(3, 2);
    const b = gridToWorld(5, 4);
    const nearA = { x: a.x + (b.x - a.x) * 0.4, y: a.y + (b.y - a.y) * 0.4 };
    const nearB = { x: a.x + (b.x - a.x) * 0.6, y: a.y + (b.y - a.y) * 0.6 };
    expect(nearestSpot(nearA, spots, 1000)?.id).toBe('a');
    expect(nearestSpot(nearB, spots, 1000)?.id).toBe('b');
  });

  it('AC-10.2: returns null when no spot is within maxDist', () => {
    const a = gridToWorld(3, 2);
    expect(nearestSpot({ x: a.x + 50, y: a.y }, spots, 49)).toBeNull();
    expect(nearestSpot({ x: a.x + 50, y: a.y }, spots, 51)?.id).toBe('a');
  });
});
