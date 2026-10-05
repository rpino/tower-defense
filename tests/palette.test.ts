import { describe, expect, it } from 'vitest';
import { TEXT_PAIRS, contrastRatio } from '../src/render/palette';

describe('T-6 palette', () => {
  it('contrastRatio matches known WCAG values', () => {
    expect(contrastRatio(0xffffff, 0x000000)).toBeCloseTo(21, 5);
    expect(contrastRatio(0x777777, 0xffffff)).toBeCloseTo(4.48, 2);
  });

  it.each(Object.entries(TEXT_PAIRS))('NFR-7: %s text has at least 4.5:1 contrast', (_name, [fg, bg]) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
