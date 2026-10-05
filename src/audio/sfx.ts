// Sound-effect presets (AC-9.1, AC-9.2): ZzFX parameter lists, rendered once
// to buffers at unlock (ADR-003). Tune by ear; keep them short.
import type { SimEvent } from '../sim/state';
import type { ZzfxParams } from './zzfxSynth';

export const SFX = {
  // Rising two-step "clunk" when a tower goes up.
  build: [1.1, 0, 392, 0.01, 0.06, 0.18, 1, 1.6, 0, 0, 196, 0.06, 0, 0, 0, 0, 0, 0.8],
  // Quick thin whoosh for an arrow.
  arrow: [0.5, 0.05, 1300, 0, 0.02, 0.07, 2, 2.2, -40, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.5],
  // Low thump for the cannon firing.
  cannon: [1.3, 0.05, 110, 0.005, 0.04, 0.22, 4, 1.4, -6, 0, 0, 0, 0, 0.9, 0, 0.15, 0, 0.6],
  // Noisy boom for the cannonball landing.
  explode: [1.5, 0.1, 70, 0.01, 0.12, 0.45, 4, 2, -2, 0, 0, 0, 0, 1.4, 0, 0.35, 0.08, 0.5],
  // Short downward pop when an enemy dies.
  death: [0.8, 0.08, 520, 0.005, 0.03, 0.12, 0, 1.4, -45, 0, 0, 0, 0, 0, 0, 0, 0, 0.7],
  // Sad low buzz when an enemy gets through.
  lifeLost: [1, 0.02, 196, 0.02, 0.12, 0.3, 3, 2, -3, 0, 0, 0, 0.12, 0, 0, 0.1, 0, 0.6],
  // Bright horn call when a wave starts.
  waveStart: [1, 0, 330, 0.04, 0.22, 0.3, 1, 1.2, 0, 0, 165, 0.1, 0.12, 0, 0, 0, 0, 0.9],
} satisfies Record<string, ZzfxParams>;

export type SfxKey = keyof typeof SFX;

/** Which sound (if any) a simulation event makes. */
export function sfxForEvent(ev: SimEvent): SfxKey | null {
  switch (ev.type) {
    case 'built':
      return 'build';
    case 'shot':
      return ev.towerType === 'archer' ? 'arrow' : 'cannon';
    case 'explode':
      return 'explode';
    case 'death':
      return 'death';
    case 'lifeLost':
      return 'lifeLost';
    case 'waveStart':
      return 'waveStart';
    default:
      return null;
  }
}
