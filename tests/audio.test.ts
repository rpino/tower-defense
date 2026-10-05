import { describe, expect, it, vi } from 'vitest';
import { AudioEngine, MAX_VOICES } from '../src/audio/audio';
import { SFX, sfxForEvent, type SfxKey } from '../src/audio/sfx';
import { buildSamples } from '../src/audio/zzfxSynth';

/** Minimal stand-in for the Web Audio API, enough for the engine's needs. */
class FakeSource {
  buffer: unknown = null;
  playbackRate = { value: 1 };
  onended: (() => void) | null = null;
  started = false;
  connect() {
    return this;
  }
  start() {
    this.started = true;
  }
  stop() {
    this.onended?.();
  }
}

class FakeCtx {
  state: 'suspended' | 'running' | 'closed' | 'interrupted' = 'suspended';
  sampleRate = 8000;
  currentTime = 0;
  destination = {};
  sources: FakeSource[] = [];
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  createGain() {
    return { gain: { value: 1 }, connect: () => ({}) };
  }
  createBuffer(_ch: number, len: number) {
    const data = new Float32Array(len);
    return { length: len, getChannelData: () => data };
  }
  createBufferSource() {
    const s = new FakeSource();
    this.sources.push(s);
    return s;
  }
}

const make = () => {
  const ctx = new FakeCtx();
  const factory = vi.fn(() => ctx as unknown as AudioContext);
  return { ctx, factory, engine: new AudioEngine(factory) };
};

describe('T-9 ZzFX synth port', () => {
  it('AC-9.1: builds samples in code (no audio files) of the expected length', () => {
    // attack .01 + sustain .05 + release .1 = .16 s at 8 kHz ≈ 1280 samples
    const s = buildSamples(8000, 1, 0, 440, 0.01, 0.05, 0.1);
    expect(s).toBeInstanceOf(Float32Array);
    expect(s.length).toBe(Math.floor((0.01 + 0.05 + 0.1) * 8000));
    expect(Math.max(...Array.from(s).map(Math.abs))).toBeGreaterThan(0.1);
  });

  it('every preset renders a non-empty, finite sound', () => {
    for (const [key, params] of Object.entries(SFX)) {
      const s = buildSamples(8000, ...params);
      expect(s.length, key).toBeGreaterThan(0);
      expect(s.every(Number.isFinite), key).toBe(true);
    }
  });
});

describe('T-9 event → sound mapping (AC-9.2)', () => {
  it('maps every required gameplay event to a distinct sound', () => {
    const keys = [
      sfxForEvent({ type: 'built', towerId: 1, spotId: 's0', towerType: 'archer' }),
      sfxForEvent({ type: 'shot', towerId: 1, towerType: 'archer', projectileId: 2 }),
      sfxForEvent({ type: 'shot', towerId: 1, towerType: 'cannon', projectileId: 2 }),
      sfxForEvent({ type: 'explode', c: 0, r: 0, radius: 1 }),
      sfxForEvent({ type: 'death', enemyId: 1, enemyType: 'grunt', reward: 5, c: 0, r: 0 }),
      sfxForEvent({ type: 'lifeLost', enemyId: 1, cost: 1, lives: 9 }),
      sfxForEvent({ type: 'waveStart', wave: 1 }),
    ];
    expect(keys.every((k) => k !== null)).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(SFX[k as SfxKey]).toBeDefined();
  });

  it('events without a sound map to null', () => {
    expect(sfxForEvent({ type: 'hit', enemyId: 1, damage: 10 })).toBeNull();
  });
});

describe('T-9 audio engine', () => {
  it('AC-9.4: no AudioContext exists before unlock()', () => {
    const { factory, engine } = make();
    engine.play('build');
    expect(factory).not.toHaveBeenCalled();
  });

  it('unlock() creates and resumes one context, and pre-renders every preset', () => {
    const { ctx, factory, engine } = make();
    engine.unlock();
    engine.unlock();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(ctx.resume).toHaveBeenCalled();
    expect(engine.preparedCount()).toBe(Object.keys(SFX).length);
  });

  it('AC-1.6: if the context cannot be created the engine goes silent and later calls do nothing', () => {
    const engine = new AudioEngine(() => {
      throw new Error('no audio');
    });
    expect(() => engine.unlock()).not.toThrow();
    expect(engine.silent).toBe(true);
    expect(() => engine.play('build')).not.toThrow();
    expect(() => engine.onHidden()).not.toThrow();
    expect(() => engine.ensureRunning()).not.toThrow();
  });

  it('plays a buffer source for a sound once unlocked', () => {
    const { ctx, engine } = make();
    engine.unlock();
    engine.play('build');
    expect(ctx.sources.at(-1)?.started).toBe(true);
  });

  it('AC-9.6: at most MAX_VOICES copies of the same sound play at once; extras are skipped', () => {
    const { ctx, engine } = make();
    engine.unlock();
    for (let i = 0; i < MAX_VOICES + 3; i++) engine.play('arrow');
    expect(ctx.sources.filter((s) => s.started)).toHaveLength(MAX_VOICES);
    ctx.sources[0].stop(); // one finishes → room for one more
    engine.play('arrow');
    expect(ctx.sources.filter((s) => s.started)).toHaveLength(MAX_VOICES + 1);
  });

  it('AC-10.5: hidden suspends, visible resumes, and the mute setting survives both', () => {
    const { ctx, engine } = make();
    engine.unlock();
    engine.setMuted(true);
    engine.onHidden();
    expect(ctx.suspend).toHaveBeenCalled();
    engine.onVisible();
    expect(ctx.resume).toHaveBeenCalledTimes(2);
    expect(engine.muted).toBe(true);
    expect(engine.masterGainValue()).toBe(0);
    engine.setMuted(false);
    expect(engine.masterGainValue()).toBe(1);
  });

  it('iOS: ensureRunning() resumes a suspended or interrupted context, and leaves a running one alone', () => {
    const { ctx, engine } = make();
    engine.unlock();
    ctx.resume.mockClear();
    ctx.state = 'running';
    engine.ensureRunning();
    expect(ctx.resume).not.toHaveBeenCalled();
    ctx.state = 'interrupted';
    engine.ensureRunning();
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });
});
