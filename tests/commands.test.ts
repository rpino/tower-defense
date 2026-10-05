import { describe, expect, it } from 'vitest';
import { START_GOLD, START_LIVES, TOWERS } from '../src/config/balance';
import { SPOTS } from '../src/config/map';
import { build, startWave } from '../src/sim/commands';
import { createRun } from '../src/sim/state';

describe('T-4 createRun', () => {
  it('AC-1.3 / BR-1: a new run is in the build phase before wave 1 with starting lives and gold', () => {
    const s = createRun();
    expect(s.phase).toBe('build');
    expect(s.wave).toBe(1);
    expect(s.lives).toBe(START_LIVES);
    expect(s.gold).toBe(START_GOLD);
    expect(s.towers).toEqual([]);
    expect(s.enemies).toEqual([]);
    expect(s.projectiles).toEqual([]);
  });
});

describe('T-4 build command', () => {
  it('AC-3.2: building an affordable tower places it and deducts its cost', () => {
    const s = createRun();
    const res = build(s, SPOTS[0].id, 'archer');
    expect(res.ok).toBe(true);
    expect(s.gold).toBe(START_GOLD - TOWERS.archer.cost);
    expect(s.towers).toHaveLength(1);
    expect(s.towers[0]).toMatchObject({ spotId: SPOTS[0].id, type: 'archer' });
    expect(res.ok && res.events).toEqual([
      expect.objectContaining({ type: 'built', spotId: SPOTS[0].id, towerType: 'archer' }),
    ]);
  });

  it('AC-3.3: building without enough gold is refused and changes nothing', () => {
    const s = createRun();
    s.gold = TOWERS.cannon.cost - 1;
    const before = structuredClone(s);
    expect(build(s, SPOTS[0].id, 'cannon')).toEqual({ ok: false, reason: 'insufficient-gold' });
    expect(s).toEqual(before);
  });

  it('BR-3 / AC-3.6: a spot holds one tower; building on an occupied spot is refused', () => {
    const s = createRun();
    build(s, SPOTS[0].id, 'archer');
    const before = structuredClone(s);
    expect(build(s, SPOTS[0].id, 'archer')).toEqual({ ok: false, reason: 'occupied' });
    expect(s).toEqual(before);
  });

  it('BR-3 / AC-3.6: building anywhere that is not a build spot is refused', () => {
    const s = createRun();
    expect(build(s, 'nope', 'archer')).toEqual({ ok: false, reason: 'not-a-spot' });
    expect(s.towers).toHaveLength(0);
  });

  it('AC-3.7: building is allowed while a wave is in progress', () => {
    const s = createRun();
    startWave(s);
    expect(s.phase).toBe('wave');
    expect(build(s, SPOTS[1].id, 'archer').ok).toBe(true);
  });

  it('AC-3.8: building is refused once the run is over', () => {
    const s = createRun();
    s.phase = 'defeat';
    expect(build(s, SPOTS[0].id, 'archer')).toEqual({ ok: false, reason: 'run-over' });
  });

  it('AC-3.9 / BR-4: there is no sell, move or upgrade command', async () => {
    const commands = await import('../src/sim/commands');
    expect(Object.keys(commands).sort()).toEqual(['build', 'startWave']);
  });
});

describe('T-4 startWave command', () => {
  it('AC-6.2 / BR-5: starting a wave in the build phase switches to the wave phase', () => {
    const s = createRun();
    const res = startWave(s);
    expect(res.ok).toBe(true);
    expect(s.phase).toBe('wave');
    expect(res.ok && res.events).toEqual([{ type: 'waveStart', wave: 1 }]);
  });

  it('BR-5: a wave cannot be started while one is running or after the run ends', () => {
    const s = createRun();
    startWave(s);
    expect(startWave(s)).toEqual({ ok: false, reason: 'not-build-phase' });
    s.phase = 'victory';
    expect(startWave(s)).toEqual({ ok: false, reason: 'not-build-phase' });
  });
});
