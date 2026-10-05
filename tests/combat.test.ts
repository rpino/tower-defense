import { describe, expect, it } from 'vitest';
import { ENEMIES, TOWERS, type EnemyType, type TowerType } from '../src/config/balance';
import { pathPoint } from '../src/sim/path';
import { createRun, type GameState, type SimEvent } from '../src/sim/state';
import { STEP_DT, step } from '../src/sim/step';

// Tower at spot s1 = (1,2). The first path straight runs along r = 1 from c = -0.5,
// so path distance d is at grid (d - 0.5, 1): one row away from the tower.
const SPOT = 's1';

function arena(towerType: TowerType): GameState {
  const s = createRun();
  s.phase = 'wave';
  s.spawnQueue = [{ type: 'grunt', at: 1e9 }]; // keeps the wave from ending
  s.towers.push({ id: 1, spotId: SPOT, type: towerType, cooldown: 0 });
  s.nextId = 100;
  return s;
}

function addEnemy(s: GameState, dist: number, type: EnemyType = 'grunt', hp = ENEMIES[type].hp) {
  const e = { id: s.nextId++, type, hp, maxHp: ENEMIES[type].hp, dist };
  s.enemies.push(e);
  return e;
}

/** Step `seconds`, pinning every enemy at its starting distance (they don't walk). */
function runFrozen(s: GameState, seconds: number): SimEvent[] {
  const pinned = new Map(s.enemies.map((e) => [e.id, e.dist]));
  const events: SimEvent[] = [];
  for (let t = 0; t < seconds; t += STEP_DT) {
    events.push(...step(s, STEP_DT));
    for (const e of s.enemies) e.dist = pinned.get(e.id) ?? e.dist;
  }
  return events;
}

const ofType = <T extends SimEvent['type']>(events: SimEvent[], type: T) =>
  events.filter((e): e is Extract<SimEvent, { type: T }> => e.type === type);

describe('T-5 targeting and firing', () => {
  it('AC-4.4: a tower does not fire while no enemy is in range', () => {
    const s = arena('archer');
    addEnemy(s, 6.5 + 1.5); // far down the second straight, out of range
    expect(ofType(runFrozen(s, 3), 'shot')).toHaveLength(0);
  });

  it('AC-4.1: an Archer fires at its fire rate while an enemy is in range', () => {
    const s = arena('archer');
    addEnemy(s, 1.5, 'grunt', 1e9);
    const shots = ofType(runFrozen(s, 10), 'shot');
    expect(shots.length).toBeGreaterThanOrEqual(Math.floor(10 * TOWERS.archer.fireRate));
    expect(shots.length).toBeLessThanOrEqual(Math.ceil(10 * TOWERS.archer.fireRate) + 1);
    expect(shots[0]).toMatchObject({ towerId: 1, towerType: 'archer' });
  });

  it('AC-4.3: with several enemies in range the tower targets the one furthest along the path', () => {
    const s = arena('archer');
    addEnemy(s, 1.0);
    const front = addEnemy(s, 2.5);
    addEnemy(s, 1.8);
    runFrozen(s, STEP_DT);
    expect(s.projectiles).toHaveLength(1);
    expect(s.projectiles[0].targetId).toBe(front.id);
  });

  it('AC-4.1: arrows home in and a Grunt dies after ceil(hp / damage) hits', () => {
    const s = arena('archer');
    const g = addEnemy(s, 1.5);
    const hitsNeeded = Math.ceil(ENEMIES.grunt.hp / TOWERS.archer.damage);
    const events = runFrozen(s, hitsNeeded / TOWERS.archer.fireRate + 2);
    const hits = ofType(events, 'hit').filter((h) => h.enemyId === g.id);
    expect(hits).toHaveLength(Math.ceil(ENEMIES.grunt.hp / TOWERS.archer.damage));
    expect(s.enemies).not.toContain(g);
  });
});

describe('T-5 cannon splash', () => {
  it('AC-4.2: a cannonball damages every enemy within the splash radius of the impact and none outside', () => {
    const s = arena('cannon');
    const target = addEnemy(s, 2.6, 'grunt', 1e9); // furthest along → targeted
    const near = addEnemy(s, 2.6 - 0.8, 'grunt', 1e9); // 0.8 tiles away → inside 1.0
    const far = addEnemy(s, 2.6 - 1.6, 'grunt', 1e9); // 1.6 tiles away → outside
    const events = runFrozen(s, 1.0); // one shot lands
    const explode = ofType(events, 'explode');
    expect(explode).toHaveLength(1);
    const hitIds = new Set(ofType(events, 'hit').map((h) => h.enemyId));
    expect(hitIds.has(target.id)).toBe(true);
    expect(hitIds.has(near.id)).toBe(true);
    expect(hitIds.has(far.id)).toBe(false);
    expect(target.hp).toBe(1e9 - TOWERS.cannon.damage);
  });
});

describe('T-5 projectile edge cases', () => {
  it('AC-4.6: an arrow whose target is gone is removed without dealing damage', () => {
    const s = arena('archer');
    const target = addEnemy(s, 2.5);
    const other = addEnemy(s, 2.4, 'grunt', 1e9);
    runFrozen(s, STEP_DT); // arrow fired at `target`
    expect(s.projectiles[0].targetId).toBe(target.id);
    s.enemies = s.enemies.filter((e) => e !== target); // target vanishes (e.g. leaked)
    s.towers[0].cooldown = 1e9; // no new shots
    const events = runFrozen(s, 2);
    expect(s.projectiles).toHaveLength(0);
    expect(ofType(events, 'hit')).toHaveLength(0);
    expect(other.hp).toBe(1e9);
  });

  it('AC-4.7: a cannonball whose target is gone lands at the last position and still splashes there', () => {
    const s = arena('cannon');
    const target = addEnemy(s, 2.6);
    const bystander = addEnemy(s, 2.3, 'grunt', 1e9);
    runFrozen(s, STEP_DT);
    const p = s.projectiles[0];
    expect(p.targetId).toBe(target.id);
    const last = pathPoint(target.dist);
    s.enemies = s.enemies.filter((e) => e !== target);
    s.towers[0].cooldown = 1e9;
    const events = runFrozen(s, 2);
    const ex = ofType(events, 'explode');
    expect(ex).toHaveLength(1);
    expect(ex[0].c).toBeCloseTo(last.c, 1);
    expect(ex[0].r).toBeCloseTo(last.r, 1);
    expect(bystander.hp).toBe(1e9 - TOWERS.cannon.damage);
  });
});

describe('T-5 rewards', () => {
  it('AC-5.4: killing an enemy credits its reward exactly once and emits a death event', () => {
    const s = arena('cannon');
    const g = addEnemy(s, 2.0, 'grunt', 1); // dies to the first hit
    const goldBefore = s.gold;
    const events = runFrozen(s, 3);
    const deaths = ofType(events, 'death');
    expect(deaths).toHaveLength(1);
    expect(deaths[0]).toMatchObject({ enemyId: g.id, enemyType: 'grunt', reward: ENEMIES.grunt.reward });
    expect(s.gold).toBe(goldBefore + ENEMIES.grunt.reward);
  });
});
