// Render resolution (T-15). The canvas is drawn at DPR× the CSS size and shown
// at CSS size, so it's sharp on high-density screens. Layout stays in CSS px.

/** Device pixel ratio to render at: capped at 2; `?dpr=1|2` overrides it for testing. */
export function pickDpr(devicePixelRatio: number, search: string): number {
  const forced = Number(new URLSearchParams(search).get('dpr'));
  const raw = Number.isFinite(forced) && forced > 0 ? forced : devicePixelRatio;
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.min(2, Math.max(1, raw));
}

export const DPR = typeof window === 'undefined' ? 1 : pickDpr(window.devicePixelRatio, window.location.search);

/** The view size in CSS px (the canvas itself is DPR× larger). */
export function cssSize(scale: { width: number; height: number }): { width: number; height: number } {
  return { width: scale.width / DPR, height: scale.height / DPR };
}

/** Screen-space scenes lay out in CSS px; their camera scales that up to device px. */
export function useCssCamera(cam: { setOrigin(x: number, y: number): unknown; setZoom(z: number): unknown }): void {
  cam.setOrigin(0, 0);
  cam.setZoom(DPR);
}
