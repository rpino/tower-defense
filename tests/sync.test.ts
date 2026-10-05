import { describe, expect, it } from 'vitest';
import { accumulate, diffEntities, projectileHeight } from '../src/render/sync';
import { STEP_DT } from '../src/sim/step';

describe('T-7 sprite sync', () => {
  it('reports which ids to create and which to destroy', () => {
    const d = diffEntities([1, 2, 3], [2, 3, 4, 5]);
    expect(d.create).toEqual([4, 5]);
    expect(d.destroy).toEqual([1]);
  });

  it('nothing changes when the id sets are equal', () => {
    expect(diffEntities([7, 8], [8, 7])).toEqual({ create: [], destroy: [] });
  });
});

describe('T-7 fixed-step accumulator (ADR-002, AC-10.5)', () => {
  it('runs one step per 1/60 s and keeps the remainder', () => {
    const r = accumulate(0, 1000 / 60 * 2.5);
    expect(r.steps).toBe(2);
    expect(r.acc).toBeCloseTo(STEP_DT * 0.5, 9);
  });

  it('AC-10.5: a long frame (tab came back) is capped at 250 ms, so there is no time jump', () => {
    const r = accumulate(0, 30_000);
    expect(r.steps).toBe(Math.floor(0.25 / STEP_DT));
  });
});

describe('T-7 projectile height', () => {
  it('starts at the tower top and ends at the target body height', () => {
    expect(projectileHeight('arrow', 0, 90, 12)).toBeCloseTo(90, 9);
    expect(projectileHeight('arrow', 1, 90, 12)).toBeCloseTo(12, 9);
  });

  it('cannonballs arc above the straight line mid-flight', () => {
    const straight = (90 + 12) / 2;
    expect(projectileHeight('ball', 0.5, 90, 12)).toBeGreaterThan(straight + 20);
  });
});
