import { describe, expect, it } from 'vitest';
import { SPOTS } from '../src/config/map';
import { gridToWorld } from '../src/sim/iso';
import { MAP_WORLD_BOUNDS, SPOT_TAP_RADIUS_CSS, computeLayout, screenToWorld, worldToScreen } from '../src/render/layout';

const VIEWPORTS: Array<[number, number]> = [
  [360, 640],
  [640, 360],
  [390, 844],
  [1280, 720],
  [1920, 1080],
];

describe('T-3 layout', () => {
  it.each(VIEWPORTS)('AC-2.2: at %ix%i the whole map fits between the HUD bands', (w, h) => {
    const L = computeLayout(w, h);
    const tl = worldToScreen(L, MAP_WORLD_BOUNDS.x, MAP_WORLD_BOUNDS.y);
    const br = worldToScreen(L, MAP_WORLD_BOUNDS.x + MAP_WORLD_BOUNDS.w, MAP_WORLD_BOUNDS.y + MAP_WORLD_BOUNDS.h);
    expect(tl.x).toBeGreaterThanOrEqual(-0.001);
    expect(br.x).toBeLessThanOrEqual(w + 0.001);
    expect(tl.y).toBeGreaterThanOrEqual(L.topBar.h - 0.001);
    expect(br.y).toBeLessThanOrEqual(h - L.bottomBar.h + 0.001);
  });

  it.each(VIEWPORTS)('AC-10.3: screen ↔ world conversions are inverses at %ix%i', (w, h) => {
    const L = computeLayout(w, h);
    const s = worldToScreen(L, 123, -45);
    const back = screenToWorld(L, s.x, s.y);
    expect(back.x).toBeCloseTo(123, 6);
    expect(back.y).toBeCloseTo(-45, 6);
  });

  it('AC-2.2: the map is centred horizontally in the view', () => {
    const L = computeLayout(360, 640);
    const left = worldToScreen(L, MAP_WORLD_BOUNDS.x, 0).x;
    const right = worldToScreen(L, MAP_WORLD_BOUNDS.x + MAP_WORLD_BOUNDS.w, 0).x;
    expect(left).toBeCloseTo(360 - right, 6);
  });

  it('AC-10.2 / DES-1: on the smallest phone each spot keeps an exclusive tap radius of at least 20 CSS px', () => {
    const L = computeLayout(360, 640);
    for (const a of SPOTS) {
      const pa = gridToWorld(a.c, a.r);
      let nearest = Infinity;
      for (const b of SPOTS) {
        if (b === a) continue;
        const pb = gridToWorld(b.c, b.r);
        nearest = Math.min(nearest, Math.hypot(pa.x - pb.x, pa.y - pb.y));
      }
      // With "nearest spot wins", a spot owns every tap closer to it than half-way to its neighbour.
      const exclusiveCss = Math.min(SPOT_TAP_RADIUS_CSS, (nearest / 2) * L.zoom);
      expect(exclusiveCss, `spot ${a.id}`).toBeGreaterThanOrEqual(20);
    }
  });

  it('AC-10.2: the tap radius in world px scales inversely with zoom', () => {
    const L = computeLayout(360, 640);
    expect(L.spotTapRadiusWorld * L.zoom).toBeCloseTo(SPOT_TAP_RADIUS_CSS, 6);
  });
});
