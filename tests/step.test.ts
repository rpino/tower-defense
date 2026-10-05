import { describe, expect, it } from 'vitest';
import { ENEMIES, START_LIVES, WAVES, waveSchedule } from '../src/config/balance';
import { pathLengthTiles } from '../src/config/map';
import { startWave } from '../src/sim/commands';
import { pathPoint } from '../src/sim/path';
import { SimEvent, createRun, type GameState } from '../src/sim/state';
import { STEP_DT, step } from '../src/sim/step';

/** Step until `done` or `maxSeconds` of game time pass; returns all events. */
function run(s: GameState, maxSeconds: number, done: (s: GameState) => boolean = () => false): SimEvent[] {
  const events: SimEvent[] = [];
  for (let t = 0; t < maxSeconds && !done(s); t += STEP_DT) events.push(...step(s, STEP_DT));
  return events;
}

const ofType = <T extends SimEvent['type']>(events: SimEvent[], type: T) =>
  events.filter((e): e is Extract<SimEvent, { type: T }> => e.type === type);

describe('T-4 path', () => {
  it('AC-5.1: distance 0 is the entry point and the full length is the exit point', () => {
    const start = pathPoint(0);
    const end = pathPoint(pathLengthTiles());
    expect(start).toEqual({ c: -0.5, r: 1 });
    expect(end).toEqual({ c: 6, r: 7.5 });
  });

  it('AC-5.8: enemies stay on the path polyline', () => {
    const p = pathPoint(3); // 3 tiles in along the first straight (r = 1)
    expect(p).toEqual({ c: 2.5, r: 1 });
    const q = pathPoint(6.5 + 1); // 1 tile past the first corner (6,1), heading +r
    expect(q.c).toBeCloseTo(6, 9);
    expect(q.r).toBeCloseTo(2, 9);
  });
});

describe('T-4 waves', () => {
  it('AC-6.2: wave enemies spawn in the configured order at the configured times', () => {
    const s = createRun();
    startWave(s);
    const schedule = waveSchedule(0);
    const spawns = ofType(run(s, schedule[schedule.length - 1].at + 0.5), 'spawn');
    expect(spawns.map((e) => e.enemyType)).toEqual(schedule.map((e) => e.type));
  });

  it('AC-6.2: a pause entry delays the following spawn', () => {
    const sched = waveSchedule(2);
    const idx = sched.findIndex((e) => e.type === 'brute');
    expect(idx).toBeGreaterThan(0);
    const gap = WAVES[2].gap;
    expect(sched[idx].at - sched[idx - 1].at).toBeCloseTo(gap + (WAVES[2].pauseBeforeBrutes ?? 0), 9);
  });

  it('AC-6.4: each wave is harder: more total enemy health and a shorter spawn gap', () => {
    const totalHp = (i: number) => waveSchedule(i).reduce((sum, e) => sum + ENEMIES[e.type].hp, 0);
    for (let i = 1; i < WAVES.length; i++) {
      expect(totalHp(i)).toBeGreaterThan(totalHp(i - 1));
      expect(WAVES[i].gap).toBeLessThan(WAVES[i - 1].gap);
    }
    expect(WAVES).toHaveLength(3);
  });

  it('AC-5.1: an enemy moves along the path at its type speed', () => {
    const s = createRun();
    startWave(s);
    step(s, STEP_DT); // first spawn at t=0
    const e = s.enemies[0];
    const d0 = e.dist;
    run(s, 1);
    expect(e.dist - d0).toBeCloseTo(ENEMIES[e.type].speed * 1, 1);
  });
});

describe('T-4 leaks, wave end, win and lose', () => {
  it('AC-5.6 / BR-7: an enemy reaching the exit is removed and costs its life cost', () => {
    const s = createRun();
    startWave(s);
    step(s, STEP_DT);
    const first = s.enemies[0];
    const events = run(s, 200, () => !s.enemies.includes(first));
    const lost = ofType(events, 'lifeLost');
    expect(lost[0]).toMatchObject({ enemyId: first.id, cost: ENEMIES[first.type].lifeCost });
    expect(s.lives).toBe(START_LIVES - ENEMIES[first.type].lifeCost);
  });

  it('BR-7: lives never go below 0 (a brute leaking with 1 life left)', () => {
    const s = createRun();
    s.phase = 'wave';
    s.lives = 1;
    s.enemies.push({ id: 99, type: 'brute', hp: 1, maxHp: 1, dist: pathLengthTiles() - 0.001 });
    s.spawnQueue = [{ type: 'grunt', at: 999 }];
    step(s, STEP_DT);
    expect(s.lives).toBe(0);
    expect(s.phase).toBe('defeat');
  });

  it('AC-8.1: when lives reach 0 the run stops immediately with a defeat event', () => {
    const s = createRun();
    startWave(s);
    s.lives = 1;
    const events = run(s, 300, () => s.phase !== 'wave');
    expect(s.phase).toBe('defeat');
    expect(ofType(events, 'defeat')).toEqual([{ type: 'defeat', wave: 1 }]);
  });

  it('AC-6.3: clearing wave 1 awards the bonus and returns to the build phase for wave 2', () => {
    const s = createRun();
    startWave(s);
    s.lives = 9999; // let everything leak
    const goldBefore = s.gold;
    const events = run(s, 300, () => s.phase !== 'wave');
    expect(s.phase).toBe('build');
    expect(s.wave).toBe(2);
    expect(s.gold).toBe(goldBefore + WAVES[0].bonus);
    expect(ofType(events, 'waveCleared')).toEqual([{ type: 'waveCleared', wave: 1, bonus: WAVES[0].bonus }]);
  });

  it('AC-8.2: clearing wave 3 with lives left is a victory', () => {
    const s = createRun();
    s.lives = 9999;
    const events: SimEvent[] = [];
    for (let w = 0; w < 3; w++) {
      startWave(s);
      events.push(...run(s, 400, () => s.phase !== 'wave'));
    }
    expect(s.phase).toBe('victory');
    expect(ofType(events, 'victory')).toHaveLength(1);
    expect(ofType(events, 'waveCleared').map((e) => e.wave)).toEqual([1, 2]);
  });

  it('AC-8.5: if the last enemy leaks and lives hit 0 in the same step, it is a defeat', () => {
    const s = createRun();
    s.phase = 'wave';
    s.wave = 3;
    s.lives = 1;
    s.spawnQueue = [];
    s.enemies.push({ id: 1, type: 'grunt', hp: 40, maxHp: 40, dist: pathLengthTiles() - 0.001 });
    const events = step(s, STEP_DT);
    expect(s.phase).toBe('defeat');
    expect(ofType(events, 'victory')).toHaveLength(0);
  });

  it('AC-8.3: after the run ends, step does nothing', () => {
    const s = createRun();
    s.phase = 'victory';
    s.enemies.push({ id: 1, type: 'grunt', hp: 40, maxHp: 40, dist: 1 });
    const before = structuredClone(s);
    expect(step(s, STEP_DT)).toEqual([]);
    expect(s).toEqual(before);
  });

  it('AC-6.1: nothing spawns during the build phase', () => {
    const s = createRun();
    const events = run(s, 10);
    expect(ofType(events, 'spawn')).toHaveLength(0);
    expect(s.enemies).toHaveLength(0);
  });
});
