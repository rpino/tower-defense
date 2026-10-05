// Headless scripted players for the balance test (AC-6.6, design §3.6).
import { TOWERS, type TowerType } from '../src/config/balance';
import { SPOTS } from '../src/config/map';
import { build, startWave } from '../src/sim/commands';
import { PATH_LENGTH, pathPoint } from '../src/sim/path';
import { createRun, type GameState } from '../src/sim/state';
import { STEP_DT, step } from '../src/sim/step';

/** Seconds the player waits after "Start wave N" appears (AC-6.6). */
export const START_DELAY = 5;

/** Spots ranked by how much of the path an Archer there would cover. */
export const RANKED_SPOTS: string[] = (() => {
  const samples = Array.from({ length: 200 }, (_, i) => pathPoint((i / 199) * PATH_LENGTH));
  const cover = (s: { c: number; r: number }) =>
    samples.filter((p) => (p.c - s.c) ** 2 + (p.r - s.r) ** 2 <= TOWERS.archer.range ** 2).length;
  return [...SPOTS].sort((a, b) => cover(b) - cover(a)).map((s) => s.id);
})();

export interface RunResult {
  outcome: 'victory' | 'defeat' | 'timeout';
  seconds: number;
  lives: number;
  towers: number;
  waveSeconds: number[];
  peakEnemies: number;
}

export interface Strategy {
  /** Called every step; may build. `inWave` is false during build phases. */
  build(s: GameState, inWave: boolean): void;
}

function freeSpots(s: GameState): string[] {
  return RANKED_SPOTS.filter((id) => !s.towers.some((t) => t.spotId === id));
}

/** Greedy player: fills the best free spots as soon as `pick` says what to buy. */
function greedy(pick: (s: GameState) => TowerType | null): Strategy {
  return {
    build(s) {
      for (;;) {
        const spot = freeSpots(s)[0];
        const type = spot ? pick(s) : null;
        if (!spot || !type || !build(s, spot, type).ok) return;
      }
    },
  };
}

const canAfford = (s: GameState, t: TowerType) => s.gold >= TOWERS[t].cost;

/** (a) Aggressive players: spend everything immediately, in different tower mixes. */
export const AGGRESSIVE: Record<string, Strategy> = {
  archersOnly: greedy((s) => (canAfford(s, 'archer') ? 'archer' : null)),
  cannonFirst: greedy((s) => (canAfford(s, 'cannon') ? 'cannon' : s.towers.length > 0 && canAfford(s, 'archer') ? 'archer' : null)),
  threeArchersThenCannons: greedy((s) =>
    s.towers.length < 3 ? (canAfford(s, 'archer') ? 'archer' : null) : canAfford(s, 'cannon') ? 'cannon' : null,
  ),
  alternating: greedy((s) =>
    s.towers.length % 2 === 0 ? (canAfford(s, 'archer') ? 'archer' : null) : canAfford(s, 'cannon') ? 'cannon' : null,
  ),
};

/** (b) Minimal: at most `max` Archers, bought only between waves. */
export function minimal(max: number): Strategy {
  return {
    build(s, inWave) {
      if (inWave) return;
      while (s.towers.length < max && s.gold >= TOWERS.archer.cost) {
        const spot = freeSpots(s)[0];
        if (!spot || !build(s, spot, 'archer').ok) return;
      }
    },
  };
}

export function play(strategy: Strategy, limitSeconds = 600): RunResult {
  const s = createRun();
  let t = 0;
  let waitUntil = START_DELAY;
  let waveStart = 0;
  const waveSeconds: number[] = [];
  let peakEnemies = 0;
  while (t < limitSeconds) {
    if (s.phase === 'build') {
      strategy.build(s, false);
      if (t >= waitUntil) {
        startWave(s);
        waveStart = t;
      }
    } else if (s.phase === 'wave') {
      strategy.build(s, true);
    }
    const wasWave = s.phase === 'wave';
    step(s, STEP_DT);
    t += STEP_DT;
    peakEnemies = Math.max(peakEnemies, s.enemies.length);
    if (wasWave && s.phase !== 'wave') {
      waveSeconds.push(t - waveStart);
      waitUntil = t + START_DELAY;
    }
    if (s.phase === 'victory' || s.phase === 'defeat') {
      return { outcome: s.phase, seconds: t, lives: s.lives, towers: s.towers.length, waveSeconds, peakEnemies };
    }
  }
  return { outcome: 'timeout', seconds: t, lives: s.lives, towers: s.towers.length, waveSeconds, peakEnemies };
}

/** The fewest Archers (bought between waves) that still win, and that run. */
export function barelyWinning(): { max: number; result: RunResult } | null {
  for (let max = 1; max <= SPOTS.length; max++) {
    const result = play(minimal(max));
    if (result.outcome === 'victory') return { max, result };
  }
  return null;
}
