// Simulation state (design §3.2, ADR-002). Pure data; nothing is saved (BR-8).
import { START_GOLD, START_LIVES, type EnemyType, type SpawnEntry, type TowerType } from '../config/balance';

export type Phase = 'build' | 'wave' | 'victory' | 'defeat';

export interface Tower {
  id: number;
  spotId: string;
  type: TowerType;
  /** Seconds until it may fire again. */
  cooldown: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  /** Tiles travelled along the path. */
  dist: number;
}

export interface Projectile {
  id: number;
  kind: 'arrow' | 'ball';
  towerId: number;
  targetId: number;
  /** Position in grid units. */
  c: number;
  r: number;
  /** Where the target was last seen (AC-4.7). */
  lastC: number;
  lastR: number;
  speed: number;
  damage: number;
  splash: number;
}

export interface GameState {
  phase: Phase;
  /** Current wave during a wave; next wave during the build phase (AC-7.1). 1..3 */
  wave: number;
  lives: number;
  gold: number;
  /** Seconds since the run started. */
  time: number;
  /** Seconds since the current wave started. */
  waveTime: number;
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  /** Remaining spawns of the current wave, in order. */
  spawnQueue: SpawnEntry[];
  nextId: number;
}

export type SimEvent =
  | { type: 'built'; towerId: number; spotId: string; towerType: TowerType }
  | { type: 'waveStart'; wave: number }
  | { type: 'spawn'; enemyId: number; enemyType: EnemyType }
  | { type: 'shot'; towerId: number; towerType: TowerType; projectileId: number }
  | { type: 'hit'; enemyId: number; damage: number }
  | { type: 'explode'; c: number; r: number; radius: number }
  | { type: 'death'; enemyId: number; enemyType: EnemyType; reward: number; c: number; r: number }
  | { type: 'lifeLost'; enemyId: number; cost: number; lives: number }
  | { type: 'waveCleared'; wave: number; bonus: number }
  | { type: 'victory'; lives: number }
  | { type: 'defeat'; wave: number };

/** AC-1.3 / AC-8.4: a fresh run in the build phase before wave 1. */
export function createRun(): GameState {
  return {
    phase: 'build',
    wave: 1,
    lives: START_LIVES,
    gold: START_GOLD,
    time: 0,
    waveTime: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    spawnQueue: [],
    nextId: 1,
  };
}
