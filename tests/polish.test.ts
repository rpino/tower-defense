import { describe, expect, it } from 'vitest';
import { TOWERS } from '../src/config/balance';
import { rewardLabel } from '../src/render/hud';
import { gridToWorld, groundEllipse } from '../src/sim/iso';

describe('T-14 range circles (AC-3.10)', () => {
  it('a ground circle of R tiles is an ellipse of R·66√2 by R·33√2 world px', () => {
    const e = groundEllipse(TOWERS.archer.range);
    expect(e.rx).toBeCloseTo(TOWERS.archer.range * 66 * Math.SQRT2, 9);
    expect(e.ry).toBeCloseTo(TOWERS.archer.range * 33 * Math.SQRT2, 9);
  });

  it('a point exactly R tiles away on the grid lands on the ellipse edge', () => {
    const R = 2;
    const e = groundEllipse(R);
    for (const [dc, dr] of [
      [R / Math.SQRT2, -R / Math.SQRT2], // screen-right
      [R / Math.SQRT2, R / Math.SQRT2], // screen-down
      [R, 0],
    ]) {
      const p = gridToWorld(dc, dr);
      expect((p.x / e.rx) ** 2 + (p.y / e.ry) ** 2).toBeCloseTo(1, 9);
    }
  });

  it('the Archer reaches further than the Cannon, so its circle is the bigger one', () => {
    expect(groundEllipse(TOWERS.archer.range).rx).toBeGreaterThan(groundEllipse(TOWERS.cannon.range).rx);
  });
});

describe('T-14 floating gold (AC-5.5)', () => {
  it('shows the reward as "+N"', () => {
    expect(rewardLabel(6)).toBe('+6');
    expect(rewardLabel(20)).toBe('+20');
  });
});
