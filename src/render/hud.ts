// Pure HUD helpers (AC-3.1, 3.3, 7.1, 8.1, 8.2), tested without Phaser.
import { TOWERS, WAVES, type TowerType } from '../config/balance';
import type { GameState } from '../sim/state';
import type { Layout } from './layout';

/** Tower picker: two options side by side; each option ≥ 44×44 (AC-10.2). */
export const PICKER_SIZE = { w: 216, h: 92, optionW: 100, optionH: 76 } as const;
const GAP = 14;
const EDGE = 6;

/** Top-left corner for the picker: above the spot if it fits, else below; always on screen. */
export function placePicker(spot: { x: number; y: number }, L: Layout): { x: number; y: number } {
  const minY = L.topBar.h + EDGE;
  const maxY = L.viewH - L.bottomBar.h - EDGE - PICKER_SIZE.h;
  let y = spot.y - GAP - PICKER_SIZE.h;
  if (y < minY) y = spot.y + GAP;
  y = Math.min(Math.max(y, minY), Math.max(minY, maxY));
  const x = Math.min(Math.max(spot.x - PICKER_SIZE.w / 2, EDGE), Math.max(EDGE, L.viewW - EDGE - PICKER_SIZE.w));
  return { x, y };
}

export function hudText(s: GameState): { lives: string; gold: string; wave: string } {
  return { lives: String(s.lives), gold: String(s.gold), wave: `Wave ${s.wave} / ${WAVES.length}` };
}

export function resultText(s: GameState): { title: string; line: string } | null {
  if (s.phase === 'defeat') return { title: 'Defeat', line: `Defeated on wave ${s.wave}` };
  if (s.phase === 'victory') return { title: 'Victory!', line: `Lives remaining: ${s.lives}` };
  return null;
}

export function affordable(gold: number): Record<TowerType, boolean> {
  return { archer: gold >= TOWERS.archer.cost, cannon: gold >= TOWERS.cannon.cost };
}

/** AC-9.5 / AC-10.2: mute toggle at the right end of the bottom bar, 48×48. */
export function muteButtonRect(L: Layout): { x: number; y: number; w: number; h: number } {
  const size = 48;
  return { x: L.viewW - 8 - size, y: L.bottomBar.y + (L.bottomBar.h - size) / 2, w: size, h: size };
}
