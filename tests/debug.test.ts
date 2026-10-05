import { describe, expect, it } from 'vitest';
import { isDebug } from '../src/render/debug';

describe('T-12 debug flag (design §6)', () => {
  it('is on only with ?debug=1', () => {
    expect(isDebug('?debug=1')).toBe(true);
    expect(isDebug('?x=2&debug=1')).toBe(true);
    expect(isDebug('')).toBe(false);
    expect(isDebug('?debug=0')).toBe(false);
  });
});
