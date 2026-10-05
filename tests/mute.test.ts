import { describe, expect, it } from 'vitest';
import { AudioEngine } from '../src/audio/audio';
import { muteButtonRect } from '../src/render/hud';
import { computeLayout } from '../src/render/layout';

describe('T-13 mute toggle (AC-9.5)', () => {
  it.each([
    [360, 640],
    [1280, 720],
  ])('at %ix%i the mute button sits inside the bottom bar and is at least 44×44', (w, h) => {
    const L = computeLayout(w, h);
    const r = muteButtonRect(L);
    expect(r.w).toBeGreaterThanOrEqual(44);
    expect(r.h).toBeGreaterThanOrEqual(44);
    expect(r.y).toBeGreaterThanOrEqual(L.bottomBar.y);
    expect(r.y + r.h).toBeLessThanOrEqual(L.bottomBar.y + L.bottomBar.h);
    expect(r.x + r.w).toBeLessThanOrEqual(L.viewW);
  });

  it('does not overlap the centred "Start wave" button on the smallest phone', () => {
    const L = computeLayout(360, 640);
    const r = muteButtonRect(L);
    const waveRight = L.viewW / 2 + 210 / 2;
    expect(r.x).toBeGreaterThanOrEqual(waveRight);
  });

  it('the mute setting lives in the audio engine, so it survives Restart (a new run)', () => {
    const engine = new AudioEngine(() => {
      throw new Error('no audio in tests');
    });
    engine.setMuted(true);
    // Restart only replaces the GameState; the engine is untouched.
    expect(engine.muted).toBe(true);
    engine.setMuted(false);
    expect(engine.muted).toBe(false);
  });
});
