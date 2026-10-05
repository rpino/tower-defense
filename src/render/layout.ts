// Screen layout (design §3.5, AC-2.2, AC-10.2, AC-10.3). Pure maths: GameScene
// applies the result to its camera; UIScene uses the bands for the HUD.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * World-px box that contains every map sprite: 8×8 tile images (±528 px wide)
 * from the tallest scenery at the back (y ≈ −64) to the front tile's base (y = 528).
 */
export const MAP_WORLD_BOUNDS: Rect = { x: -528, y: -70, w: 1056, h: 600 };

export const TOP_BAR_H = 48;
export const BOTTOM_BAR_H = 64;
const PAD = 8;

/** AC-10.2: a build spot answers taps within this many CSS px of its centre. */
export const SPOT_TAP_RADIUS_CSS = 22;

export interface Layout {
  viewW: number;
  viewH: number;
  topBar: Rect;
  bottomBar: Rect;
  /** Area the map is fitted into. */
  mapArea: Rect;
  /** Camera zoom (CSS px per world px). */
  zoom: number;
  /** World point shown at the centre of the view (for camera.centerOn). */
  cameraCenter: { x: number; y: number };
  /** AC-10.2 tap radius converted to world px at this zoom. */
  spotTapRadiusWorld: number;
}

export function computeLayout(viewW: number, viewH: number): Layout {
  const topBar = { x: 0, y: 0, w: viewW, h: TOP_BAR_H };
  const bottomBar = { x: 0, y: viewH - BOTTOM_BAR_H, w: viewW, h: BOTTOM_BAR_H };
  const mapArea = {
    x: PAD,
    y: TOP_BAR_H + PAD,
    w: Math.max(1, viewW - 2 * PAD),
    h: Math.max(1, viewH - TOP_BAR_H - BOTTOM_BAR_H - 2 * PAD),
  };
  const zoom = Math.min(mapArea.w / MAP_WORLD_BOUNDS.w, mapArea.h / MAP_WORLD_BOUNDS.h);

  // Put the bounds' centre at the map area's centre; the leftover is letterbox.
  const boundsCx = MAP_WORLD_BOUNDS.x + MAP_WORLD_BOUNDS.w / 2;
  const boundsCy = MAP_WORLD_BOUNDS.y + MAP_WORLD_BOUNDS.h / 2;
  const areaCx = mapArea.x + mapArea.w / 2;
  const areaCy = mapArea.y + mapArea.h / 2;
  const cameraCenter = {
    x: boundsCx - (areaCx - viewW / 2) / zoom,
    y: boundsCy - (areaCy - viewH / 2) / zoom,
  };

  return {
    viewW,
    viewH,
    topBar,
    bottomBar,
    mapArea,
    zoom,
    cameraCenter,
    spotTapRadiusWorld: SPOT_TAP_RADIUS_CSS / zoom,
  };
}

export function worldToScreen(L: Layout, x: number, y: number): { x: number; y: number } {
  return {
    x: (x - L.cameraCenter.x) * L.zoom + L.viewW / 2,
    y: (y - L.cameraCenter.y) * L.zoom + L.viewH / 2,
  };
}

export function screenToWorld(L: Layout, sx: number, sy: number): { x: number; y: number } {
  return {
    x: (sx - L.viewW / 2) / L.zoom + L.cameraCenter.x,
    y: (sy - L.viewH / 2) / L.zoom + L.cameraCenter.y,
  };
}
