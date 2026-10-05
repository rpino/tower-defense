import { describe, expect, it } from 'vitest';
import { pickDpr } from '../src/render/dpr';

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

});
