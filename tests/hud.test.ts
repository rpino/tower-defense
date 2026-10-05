import { describe, expect, it } from 'vitest';
import { START_GOLD, TOWERS } from '../src/config/balance';
import { affordable, hudText, resultText } from '../src/render/hud';
import { createRun } from '../src/sim/state';

describe('T-8 HUD text (AC-7.1, AC-8.1, AC-8.2)', () => {
  it('AC-7.1: before the first wave the HUD shows "Wave 1 / 3" with starting lives and gold', () => {
    const s = createRun();
    expect(hudText(s)).toEqual({ lives: '10', gold: String(START_GOLD), wave: 'Wave 1 / 3' });
  });

  it('AC-7.1: during a wave it shows the current wave', () => {
    const s = createRun();
    s.phase = 'wave';
    s.wave = 2;
    expect(hudText(s).wave).toBe('Wave 2 / 3');
  });

  it('AC-8.1: the defeat screen says which wave was reached', () => {
    const s = createRun();
    s.phase = 'defeat';
    s.wave = 2;
    s.lives = 0;
    expect(resultText(s)).toEqual({ title: 'Defeat', line: 'Defeated on wave 2' });
  });

  it('AC-8.2: the victory screen shows the lives remaining', () => {
    const s = createRun();
    s.phase = 'victory';
    s.wave = 3;
    s.lives = 7;
    expect(resultText(s)).toEqual({ title: 'Victory!', line: 'Lives remaining: 7' });
  });

  it('AC-8.2: one life left reads naturally', () => {
    const s = createRun();
    s.phase = 'victory';
    s.lives = 1;
    expect(resultText(s)?.line).toBe('Lives remaining: 1');
  });

  it('no result text while the run is still going', () => {
    expect(resultText(createRun())).toBeNull();
  });
});

describe('T-8 picker affordability (AC-3.3)', () => {
  it('dims exactly the towers the player cannot pay for', () => {
    expect(affordable(TOWERS.archer.cost)).toEqual({ archer: true, cannon: false });
    expect(affordable(TOWERS.cannon.cost)).toEqual({ archer: true, cannon: true });
    expect(affordable(TOWERS.archer.cost - 1)).toEqual({ archer: false, cannon: false });
  });
});
