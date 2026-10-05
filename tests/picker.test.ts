import { describe, expect, it } from 'vitest';
import { PICKER_SIZE, pickerOptionRect, placePicker } from '../src/render/hud';
import { computeLayout } from '../src/render/layout';

const L = computeLayout(360, 640);
const inside = (p: { x: number; y: number }) => {
  expect(p.x).toBeGreaterThanOrEqual(0);
  expect(p.y).toBeGreaterThanOrEqual(L.topBar.h);
  expect(p.x + PICKER_SIZE.w).toBeLessThanOrEqual(L.viewW);
  expect(p.y + PICKER_SIZE.h).toBeLessThanOrEqual(L.viewH - L.bottomBar.h);
};

describe('T-8 picker placement (AC-3.1)', () => {
  it('opens above the spot when there is room', () => {
    const p = placePicker({ x: 180, y: 400 }, L);
    expect(p.y + PICKER_SIZE.h).toBeLessThanOrEqual(400);
    inside(p);
  });

  it.each([
    ['top-left', { x: 5, y: L.topBar.h + 5 }],
    ['top-right', { x: 355, y: L.topBar.h + 5 }],
    ['bottom-left', { x: 5, y: 640 - L.bottomBar.h - 5 }],
    ['bottom-right', { x: 355, y: 640 - L.bottomBar.h - 5 }],
  ])('stays fully on screen for a spot in the %s corner', (_name, spot) => {
    inside(placePicker(spot, L));
  });

  it('AC-10.2: picker option buttons are at least 44×44 CSS px', () => {
    expect(PICKER_SIZE.optionW).toBeGreaterThanOrEqual(44);
    expect(PICKER_SIZE.optionH).toBeGreaterThanOrEqual(44);
  });
});

describe('Review R-03: one source of truth for picker option geometry', () => {
  it('both options sit inside the picker, side by side without overlapping, each ≥ 44×44', () => {
    const a = pickerOptionRect(0);
    const b = pickerOptionRect(1);
    for (const r of [a, b]) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(PICKER_SIZE.w);
      expect(r.y + r.h).toBeLessThanOrEqual(PICKER_SIZE.h);
      expect(r.w).toBeGreaterThanOrEqual(44);
      expect(r.h).toBeGreaterThanOrEqual(44);
    }
    expect(a.x + a.w).toBeLessThanOrEqual(b.x);
  });
});
