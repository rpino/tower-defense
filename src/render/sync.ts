// Pure helpers for keeping display objects in step with the simulation (ADR-002).
import { STEP_DT } from '../sim/step';

/** Ids that appeared (create a view) and ids that vanished (destroy the view). */
export function diffEntities(prevIds: Iterable<number>, nextIds: Iterable<number>): { create: number[]; destroy: number[] } {
  const prev = new Set(prevIds);
  const next = new Set(nextIds);
  return {
    create: [...next].filter((id) => !prev.has(id)),
    destroy: [...prev].filter((id) => !next.has(id)),
  };
}

/** Longest frame we simulate; anything longer (tab was hidden) is dropped (AC-10.5). */
export const MAX_FRAME_MS = 250;

/** Fixed-step accumulator: how many 1/60 s steps to run for this frame. */
export function accumulate(acc: number, frameMs: number): { steps: number; acc: number } {
  let a = acc + Math.min(frameMs, MAX_FRAME_MS) / 1000;
  let steps = 0;
  while (a >= STEP_DT - 1e-9) {
    a -= STEP_DT;
    steps++;
  }
  return { steps, acc: Math.max(0, a) };
}

/**
 * Height above ground (world px) of a projectile at flight progress `t` (0..1):
 * arrows fly straight down from the tower top; cannonballs arc.
 */
export function projectileHeight(kind: 'arrow' | 'ball', t: number, fromH: number, toH: number): number {
  const p = Math.min(1, Math.max(0, t));
  const line = fromH + (toH - fromH) * p;
  return kind === 'ball' ? line + 4 * 40 * p * (1 - p) : line;
}
