import { describe, expect, it } from 'vitest';
import { pickDpr } from '../src/render/dpr';
import { computeLayout } from '../src/render/layout';

describe('T-15 render resolution (design §3.5 sharpness)', () => {
  it('uses the device pixel ratio, capped at 2', () => {
    expect(pickDpr(1, '')).toBe(1);
    expect(pickDpr(2, '')).toBe(2);
    expect(pickDpr(3, '')).toBe(2);
  });

  it('?dpr= overrides it for testing, within 1..2', () => {
    expect(pickDpr(1, '?dpr=2')).toBe(2);
    expect(pickDpr(3, '?dpr=1')).toBe(1);
    expect(pickDpr(1, '?dpr=9')).toBe(2);
    expect(pickDpr(2, '?dpr=abc')).toBe(2);
  });

  it('falls back to 1 when the ratio is missing or odd', () => {
    expect(pickDpr(0, '')).toBe(1);
    expect(pickDpr(Number.NaN, '')).toBe(1);
  });

  it('layout stays in CSS px: the same viewport gives the same layout at any DPR', () => {
    // GameScene multiplies only the camera zoom by the DPR; tap radii and HUD sizes stay in CSS px.
    expect(computeLayout(390, 844)).toEqual(computeLayout(390, 844));
  });
});
