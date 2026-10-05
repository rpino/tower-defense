// QA phase: boundary and negative cases added on top of the Build-phase tests.
import { describe, expect, it } from 'vitest';
import { ENEMIES, START_GOLD, TOWERS, WAVES } from '../src/config/balance';
import { SPOTS } from '../src/config/map';
import { build, startWave } from '../src/sim/commands';
import { pathPoint } from '../src/sim/path';
import { createRun, type GameState, type SimEvent } from '../src/sim/state';
import { STEP_DT, step } from '../src/sim/step';

const ofType = <T extends SimEvent['type']>(events: SimEvent[], type: T) =>
  events.filter((e): e is Extract<SimEvent, { type: T }> => e.type === type);

function runWave(s: GameState): SimEvent[] {
  const events: SimEvent[] = [];
  const res = startWave(s);
  if (res.ok) events.push(...res.events);
  for (let t = 0; t < 600 && s.phase === 'wave'; t += STEP_DT) events.push(...step(s, STEP_DT));
  return events;
}

describe('QA boundaries: gold (AC-3.2, AC-3.3)', () => {
  it('TC-QA-01: building with exactly the tower cost succeeds and leaves 0 gold', () => {
    const s = createRun();
    s.gold = TOWERS.cannon.cost;
    expect(build(s, SPOTS[0].id, 'cannon').ok).toBe(true);
    expect(s.gold).toBe(0);
  });

  it('TC-QA-02: with 0 gold nothing can be built', () => {
    const s = createRun();
    s.gold = 0;
    expect(build(s, SPOTS[0].id, 'archer')).toEqual({ ok: false, reason: 'insufficient-gold' });
  });
});

describe('QA boundaries: range (AC-4.1, AC-4.4)', () => {
  // Archer at spot s1 = (1,2); the first path straight is r = 1, so an enemy at
  // path distance d sits at grid (d - 0.5, 1). Range edge: (c-1)^2 + 1 = R^2.
  const edgeDist = 1 + Math.sqrt(TOWERS.archer.range ** 2 - 1) + 0.5;

  function arenaWith(dist: number): GameState {
    const s = createRun();
    s.phase = 'wave';
    s.spawnQueue = [{ type: 'grunt', at: 1e9 }];
    s.towers.push({ id: 1, spotId: 's1', type: 'archer', cooldown: 0 });
    s.enemies.push({ id: 2, type: 'grunt', hp: 1e9, maxHp: 1e9, dist });
    return s;
  }

  it('TC-QA-03: the edge point is exactly one range away', () => {
    const p = pathPoint(edgeDist);
    expect(Math.hypot(p.c - 1, p.r - 2)).toBeCloseTo(TOWERS.archer.range, 9);
  });

  it('TC-QA-04: an enemy just inside range is shot; just outside is not', () => {
    // Enemies move ~0.013 tiles per step, so stay a little clear of the edge.
    const inside = arenaWith(edgeDist - 0.05);
    expect(ofType(step(inside, STEP_DT), 'shot')).toHaveLength(1);
    const outside = arenaWith(edgeDist + 0.05);
    expect(ofType(step(outside, STEP_DT), 'shot')).toHaveLength(0);
  });
});

describe('QA: restart and wave flow (AC-8.4, AC-6.3, AC-6.5)', () => {
  it('TC-QA-05: Restart gives a fresh run that shares nothing with the previous one', () => {
    const old = createRun();
    build(old, SPOTS[0].id, 'archer');
    old.lives = 0;
    old.phase = 'defeat';
    const fresh = createRun();
    expect(fresh).toEqual(createRun());
    expect(fresh.towers).not.toBe(old.towers);
    expect(fresh.gold).toBe(START_GOLD);
    fresh.towers.push({ id: 9, spotId: 's9', type: 'cannon', cooldown: 0 });
    expect(createRun().towers).toHaveLength(0);
  });

  it('TC-QA-06: each wave start announces its own number, and wave 2 clears into wave 3 with its bonus', () => {
    const s = createRun();
    s.lives = 1e6; // let everything leak so the waves end on their own
    const w1 = runWave(s);
    const goldBefore2 = s.gold;
    const w2 = runWave(s);
    expect(ofType(w1, 'waveStart')).toEqual([{ type: 'waveStart', wave: 1 }]);
    expect(ofType(w2, 'waveStart')).toEqual([{ type: 'waveStart', wave: 2 }]);
    expect(ofType(w2, 'waveCleared')).toEqual([{ type: 'waveCleared', wave: 2, bonus: WAVES[1].bonus }]);
    expect(s.wave).toBe(3);
    expect(s.phase).toBe('build');
    expect(s.gold).toBe(goldBefore2 + WAVES[1].bonus);
    const w3 = runWave(s);
    expect(ofType(w3, 'waveStart')).toEqual([{ type: 'waveStart', wave: 3 }]);
    expect(s.phase).toBe('victory');
  });

  it('TC-QA-07: the life-lost event reports the lives left, so the HUD and flash stay in sync (AC-5.6, AC-5.7)', () => {
    const s = createRun();
    startWave(s);
    const events: SimEvent[] = [];
    for (let t = 0; t < 200 && ofType(events, 'lifeLost').length === 0; t += STEP_DT) events.push(...step(s, STEP_DT));
    const lost = ofType(events, 'lifeLost')[0];
    expect(lost.lives).toBe(s.lives);
    expect(lost.cost).toBe(ENEMIES.grunt.lifeCost);
  });
});
