// Game balance (BR-10). The single place to tune numbers; RD-5 allows tuning
// during playtest as long as AC-6.4 (each wave harder) and AC-6.6 (150–240 s) hold.
// Wave tables start from the design §3.6 retune proposal; T-11 finalises them.

export type TowerType = 'archer' | 'cannon';
export type EnemyType = 'grunt' | 'runner' | 'brute';

/** BR-1: starting lives for a run. */
export const START_LIVES = 10;

/** BR-1: starting gold for a run. */
export const START_GOLD = 100;

export interface TowerStats {
  cost: number;
  damage: number;
  /** Tiles, measured on the ground grid. */
  range: number;
  /** Shots per second. */
  fireRate: number;
  /** Tiles per second. */
  projectileSpeed: number;
  /** Splash radius in tiles; 0 = single target. */
  splash: number;
}

export const TOWERS: Record<TowerType, TowerStats> = {
  archer: { cost: 50, damage: 10, range: 2.5, fireRate: 1.5, projectileSpeed: 8, splash: 0 },
  cannon: { cost: 80, damage: 25, range: 2.0, fireRate: 0.5, projectileSpeed: 5, splash: 1.0 },
};

export interface EnemyStats {
  hp: number;
  /** Tiles per second along the path. */
  speed: number;
  /** Gold when killed. */
  reward: number;
  /** BR-7: lives lost when it reaches the exit. */
  lifeCost: number;
}

export const ENEMIES: Record<EnemyType, EnemyStats> = {
  grunt: { hp: 40, speed: 0.8, reward: 5, lifeCost: 1 },
  runner: { hp: 25, speed: 1.6, reward: 6, lifeCost: 1 },
  brute: { hp: 160, speed: 0.5, reward: 15, lifeCost: 2 },
};

export interface WaveDef {
  /** Enemies in spawn order. */
  order: EnemyType[];
  /** Seconds between consecutive spawns. */
  gap: number;
  /** Extra seconds before the first brute. */
  pauseBeforeBrutes?: number;
  /** Gold awarded when the wave is cleared (waves 1–2). */
  bonus: number;
}

const repeat = <T>(items: T[], times: number): T[] => Array.from({ length: times }, () => items).flat();

export const WAVES: WaveDef[] = [
  { order: repeat<EnemyType>(['grunt'], 15), gap: 2.0, bonus: 40 },
  { order: [...repeat<EnemyType>(['grunt', 'runner'], 12), 'grunt', 'grunt'], gap: 1.5, bonus: 60 },
  {
    order: [...repeat<EnemyType>(['grunt', 'runner'], 15), 'grunt', 'grunt', ...repeat<EnemyType>(['brute'], 6)],
    gap: 1.3,
    pauseBeforeBrutes: 2,
    bonus: 0,
  },
];

export interface SpawnEntry {
  type: EnemyType;
  /** Seconds after the wave starts. */
  at: number;
}

/** AC-6.2: exact spawn times for wave index `i` (0-based). */
export function waveSchedule(i: number): SpawnEntry[] {
  const def = WAVES[i];
  const out: SpawnEntry[] = [];
  let t = 0;
  let paused = false;
  def.order.forEach((type, n) => {
    if (n > 0) t += def.gap;
    if (type === 'brute' && !paused && n > 0) {
      t += def.pauseBeforeBrutes ?? 0;
      paused = true;
    }
    out.push({ type, at: t });
  });
  return out;
}
