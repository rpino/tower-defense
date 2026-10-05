import { describe, expect, it } from 'vitest';
import { AGGRESSIVE, barelyWinning, minimal, play } from './autoplay';

// AC-6.6: a player who presses Start, presses each "Start wave N" within 5 s,
// and survives all 3 waves reaches Victory 150–240 s after Start. It must hold
// for any winning player, so we check the fastest (aggressive) and the slowest
// (barely winning) players we can script. Design §3.6, T-11.
const MIN_S = 150;
const MAX_S = 240;

describe('T-11 balance: run length (AC-6.6)', () => {
  it.each(Object.entries(AGGRESSIVE))('aggressive player "%s" wins in 150–240 s', (_name, strategy) => {
    const r = play(strategy);
    expect(r.outcome).toBe('victory');
    expect(r.seconds).toBeGreaterThanOrEqual(MIN_S);
    expect(r.seconds).toBeLessThanOrEqual(MAX_S);
  });

  it('the barely-winning player also wins in 150–240 s', () => {
    const b = barelyWinning();
    expect(b).not.toBeNull();
    expect(b!.result.seconds).toBeGreaterThanOrEqual(MIN_S);
    expect(b!.result.seconds).toBeLessThanOrEqual(MAX_S);
  });
});

describe('T-11 balance: difficulty', () => {
  it('the game is not trivial: winning needs at least 3 towers', () => {
    const b = barelyWinning();
    expect(b!.max).toBeGreaterThanOrEqual(3);
    expect(play(minimal(1)).outcome).toBe('defeat');
    expect(play(minimal(2)).outcome).toBe('defeat');
  });

  it('every opening is viable: an aggressive player never loses, whatever they buy first', () => {
    for (const strategy of Object.values(AGGRESSIVE)) expect(play(strategy).outcome).toBe('victory');
  });

  it('NFR-1: no more than 30 enemies are ever on screen at once', () => {
    for (const strategy of [...Object.values(AGGRESSIVE), minimal(barelyWinning()!.max)]) {
      expect(play(strategy).peakEnemies).toBeLessThanOrEqual(30);
    }
  });
});
