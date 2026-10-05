// One fixed simulation step (design §3.6, ADR-002). Mutates `state` and
// returns what happened as events for rendering and audio.
import { ENEMIES, TOWERS, WAVES } from '../config/balance';
import { SPOTS } from '../config/map';
import { PATH_LENGTH, pathPoint } from './path';
import type { Enemy, GameState, Projectile, SimEvent } from './state';

const SPOT_POS = new Map(SPOTS.map((s) => [s.id, { c: s.c, r: s.r }]));

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
  fireTowers(state, dt, events);
  moveProjectiles(state, dt, events);
  checkEnd(state, events);
  return events;
}

const dist2 = (a: { c: number; r: number }, b: { c: number; r: number }) => (a.c - b.c) ** 2 + (a.r - b.r) ** 2;

/** AC-4.1–4.4: each ready tower fires at the in-range enemy furthest along the path. */
function fireTowers(state: GameState, dt: number, events: SimEvent[]): void {
  for (const t of state.towers) {
    t.cooldown = Math.max(0, t.cooldown - dt);
    if (t.cooldown > 0) continue;
    const stats = TOWERS[t.type];
    const pos = SPOT_POS.get(t.spotId)!;
    let target: Enemy | null = null;
    for (const e of state.enemies) {
      if (dist2(pathPoint(e.dist), pos) > stats.range ** 2) continue;
      if (!target || e.dist > target.dist) target = e;
    }
    if (!target) continue; // AC-4.4: stays ready, doesn't fire

    const at = pathPoint(target.dist);
    const p: Projectile = {
      id: state.nextId++,
      kind: t.type === 'archer' ? 'arrow' : 'ball',
      towerId: t.id,
      targetId: target.id,
      c: pos.c,
      r: pos.r,
      lastC: at.c,
      lastR: at.r,
      speed: stats.projectileSpeed,
      damage: stats.damage,
      splash: stats.splash,
    };
    state.projectiles.push(p);
    t.cooldown = 1 / stats.fireRate;
    events.push({ type: 'shot', towerId: t.id, towerType: t.type, projectileId: p.id });
  }
}

/** AC-4.1, 4.2, 4.6, 4.7: homing flight, impact, splash. */
function moveProjectiles(state: GameState, dt: number, events: SimEvent[]): void {
  state.projectiles = state.projectiles.filter((p) => {
    const target = state.enemies.find((e) => e.id === p.targetId);
    if (target) {
      const at = pathPoint(target.dist);
      p.lastC = at.c;
      p.lastR = at.r;
    } else if (p.kind === 'arrow') {
      return false; // AC-4.6: target gone → arrow vanishes, no damage
    }
    const dc = p.lastC - p.c;
    const dr = p.lastR - p.r;
    const d = Math.hypot(dc, dr);
    const travel = p.speed * dt;
    if (d > travel) {
      p.c += (dc / d) * travel;
      p.r += (dr / d) * travel;
      return true;
    }
    // Impact.
    p.c = p.lastC;
    p.r = p.lastR;
    if (p.kind === 'arrow') {
      if (target) damage(state, target, p.damage, events);
    } else {
      events.push({ type: 'explode', c: p.c, r: p.r, radius: p.splash });
      const victims = state.enemies.filter((e) => dist2(pathPoint(e.dist), p) <= p.splash ** 2);
      for (const e of victims) damage(state, e, p.damage, events);
    }
    return false;
  });
}

/** AC-5.4: damage; on death remove the enemy and credit its reward once. */
function damage(state: GameState, e: Enemy, amount: number, events: SimEvent[]): void {
  if (e.hp <= 0) return;
  e.hp -= amount;
  events.push({ type: 'hit', enemyId: e.id, damage: amount });
  if (e.hp > 0) return;
  const reward = ENEMIES[e.type].reward;
  state.gold += reward;
  const at = pathPoint(e.dist);
  state.enemies = state.enemies.filter((x) => x !== e);
  events.push({ type: 'death', enemyId: e.id, enemyType: e.type, reward, c: at.c, r: at.r });
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
