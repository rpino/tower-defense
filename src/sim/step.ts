// One fixed simulation step (design §3.6, ADR-002). Mutates `state` and
// returns what happened as events for rendering and audio.
import { ENEMIES, WAVES } from '../config/balance';
import { PATH_LENGTH } from './path';
import type { GameState, SimEvent } from './state';

/** Fixed step length in seconds (60 Hz). */
export const STEP_DT = 1 / 60;

export function step(state: GameState, dt: number): SimEvent[] {
  if (state.phase === 'victory' || state.phase === 'defeat') return []; // AC-8.3
  const events: SimEvent[] = [];
  state.time += dt;
  if (state.phase !== 'wave') return events;

  state.waveTime += dt;
  spawnDue(state, events);
  moveEnemies(state, dt, events);
  checkEnd(state, events);
  return events;
}

/** AC-6.2: spawn every queued enemy whose time has come, at the path entry. */
function spawnDue(state: GameState, events: SimEvent[]): void {
  while (state.spawnQueue.length > 0 && state.spawnQueue[0].at <= state.waveTime) {
    const entry = state.spawnQueue.shift()!;
    const hp = ENEMIES[entry.type].hp;
    const enemy = { id: state.nextId++, type: entry.type, hp, maxHp: hp, dist: 0 };
    state.enemies.push(enemy);
    events.push({ type: 'spawn', enemyId: enemy.id, enemyType: enemy.type });
  }
}

/** AC-5.1, AC-5.6, BR-7: walk the path; leaking at the exit costs lives (never below 0). */
function moveEnemies(state: GameState, dt: number, events: SimEvent[]): void {
  state.enemies = state.enemies.filter((e) => {
    e.dist += ENEMIES[e.type].speed * dt;
    if (e.dist < PATH_LENGTH) return true;
    const cost = ENEMIES[e.type].lifeCost;
    state.lives = Math.max(0, state.lives - cost);
    events.push({ type: 'lifeLost', enemyId: e.id, cost, lives: state.lives });
    return false;
  });
}

/** AC-6.3, AC-8.1, AC-8.2, AC-8.5: defeat is checked before victory. */
function checkEnd(state: GameState, events: SimEvent[]): void {
  if (state.lives <= 0) {
    state.phase = 'defeat';
    events.push({ type: 'defeat', wave: state.wave });
    return;
  }
  if (state.spawnQueue.length > 0 || state.enemies.length > 0) return;

  if (state.wave >= WAVES.length) {
    state.phase = 'victory';
    events.push({ type: 'victory', lives: state.lives });
    return;
  }
  const bonus = WAVES[state.wave - 1].bonus;
  state.gold += bonus;
  events.push({ type: 'waveCleared', wave: state.wave, bonus });
  state.wave += 1;
  state.phase = 'build';
  state.projectiles = [];
}
