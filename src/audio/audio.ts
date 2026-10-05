// The one AudioContext and its gain graph (design §3.7, ADR-003):
// sources → sfx / music gain → master gain (mute) → speakers.
import { SFX, type SfxKey } from './sfx';
import { buildSamples } from './zzfxSynth';

/** AC-9.6: copies of one sound allowed to play at once. */
export const MAX_VOICES = 4;

const SFX_VOLUME = 0.35;
const MUSIC_VOLUME = 0.22;

export class AudioEngine {
  ctx: AudioContext | null = null;
  /** AC-1.6: true when audio couldn't start; every call becomes a no-op. */
  silent = false;
  muted = false;
  private master: GainNode | null = null;
  sfxBus: GainNode | null = null;
  musicBus: GainNode | null = null;
  private buffers = new Map<SfxKey, AudioBuffer>();
  private voices = new Map<SfxKey, number>();

  constructor(private makeContext: () => AudioContext = () => new AudioContext()) {}

  /**
   * Must run inside a user gesture (AC-9.4; iOS Safari only starts audio from
   * one). Safe to call repeatedly; only the first call creates the context.
   */
  unlock(): void {
    if (this.silent) return;
    if (this.ctx) {
      this.ensureRunning();
      return;
    }
    try {
      const nav = (globalThis as { navigator?: { audioSession?: { type: string } } }).navigator;
      // iOS 17+: play even when the ringer switch is on silent.
      if (nav?.audioSession) nav.audioSession.type = 'playback';
      const ctx = this.makeContext();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(ctx.destination);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = SFX_VOLUME;
      this.sfxBus.connect(this.master);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = MUSIC_VOLUME;
      this.musicBus.connect(this.master);
      this.ensureRunning();
      for (const [key, params] of Object.entries(SFX) as [SfxKey, (typeof SFX)[SfxKey]][]) {
        const samples = buildSamples(ctx.sampleRate, ...params);
        const buf = ctx.createBuffer(1, Math.max(1, samples.length), ctx.sampleRate);
        buf.getChannelData(0).set(samples);
        this.buffers.set(key, buf);
      }
    } catch (err) {
      console.error('Audio unavailable; continuing silently.', err);
      this.silent = true;
      this.ctx = null;
    }
  }

  /** iOS can leave the context suspended or 'interrupted'; retried on every tap. */
  ensureRunning(): void {
    const ctx = this.ctx;
    if (!ctx || this.silent || ctx.state === 'running' || ctx.state === 'closed') return;
    ctx.resume().catch(() => {});
  }

  onHidden(): void {
    this.ctx?.suspend().catch(() => {});
  }

  onVisible(): void {
    this.ensureRunning();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 1;
  }

  masterGainValue(): number {
    return this.master?.gain.value ?? (this.muted ? 0 : 1);
  }

  preparedCount(): number {
    return this.buffers.size;
  }

  play(key: SfxKey): void {
    const ctx = this.ctx;
    const buf = this.buffers.get(key);
    if (!ctx || !buf || !this.sfxBus || this.silent) return;
    const playing = this.voices.get(key) ?? 0;
    if (playing >= MAX_VOICES) return; // AC-9.6
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 1 + (Math.random() * 2 - 1) * 0.05; // ZzFX-style variety
    src.connect(this.sfxBus);
    this.voices.set(key, playing + 1);
    src.onended = () => this.voices.set(key, Math.max(0, (this.voices.get(key) ?? 1) - 1));
    src.start();
  }
}
