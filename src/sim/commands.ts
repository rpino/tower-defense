// Player commands (design §3.3). Each validates first and leaves the state
// untouched when it refuses. There is no sell/move/upgrade (BR-4, AC-3.9).
import { TOWERS, waveSchedule, type TowerType } from '../config/balance';
import { SPOTS } from '../config/map';
import type { GameState, SimEvent } from './state';

export type CommandResult<R extends string> = { ok: true; events: SimEvent[] } | { ok: false; reason: R };

export type BuildRefusal = 'run-over' | 'not-a-spot' | 'occupied' | 'insufficient-gold';

/** AC-3.2, AC-3.3, AC-3.6, AC-3.7, BR-3. */
export function build(state: GameState, spotId: string, type: TowerType): CommandResult<BuildRefusal> {
  if (state.phase === 'victory' || state.phase === 'defeat') return { ok: false, reason: 'run-over' };
  if (!SPOTS.some((s) => s.id === spotId)) return { ok: false, reason: 'not-a-spot' };
  if (state.towers.some((t) => t.spotId === spotId)) return { ok: false, reason: 'occupied' };
  const cost = TOWERS[type].cost;
  if (state.gold < cost) return { ok: false, reason: 'insufficient-gold' };

  state.gold -= cost;
  const tower = { id: state.nextId++, spotId, type, cooldown: 0 };
  state.towers.push(tower);
  return { ok: true, events: [{ type: 'built', towerId: tower.id, spotId, towerType: type }] };
}

/** AC-6.2, BR-5: only from the build phase. */
export function startWave(state: GameState): CommandResult<'not-build-phase'> {
  if (state.phase !== 'build') return { ok: false, reason: 'not-build-phase' };
  state.phase = 'wave';
  state.waveTime = 0;
  state.spawnQueue = waveSchedule(state.wave - 1);
  return { ok: true, events: [{ type: 'waveStart', wave: state.wave }] };
}
