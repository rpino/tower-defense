// Looping chiptune music and result jingles (AC-9.3, AC-8.3, AC-8.4).
// A lookahead step sequencer: a timer calls tick(), which schedules every note
// starting within the next LOOKAHEAD seconds on the audio clock.

/** Seconds of notes scheduled ahead of the audio clock. */
export const LOOKAHEAD = 0.25;

export const midiToFreq = (m: number) => 440 * 2 ** ((m - 69) / 12);

export type Voice = 'lead' | 'bass';

export interface NoteScheduler {
  now(): number;
  note(freq: number, start: number, dur: number, voice: Voice): { stop(): void };
}

/** 4 bars of 8th notes in A minor (Am – G – F – E). null = rest. */
export const SONG = {
  bpm: 132,
  // prettier-ignore
  lead: [
    69, 72, 76, 72, 69, 72, 76, 81,
    67, 71, 74, 71, 67, 71, 74, 79,
    65, 69, 72, 69, 65, 69, 72, 77,
    64, 68, 71, 76, 74, 72, 71, null,
  ] as (number | null)[],
  // prettier-ignore
  bass: [
    45, null, 57, null, 45, null, 57, null,
    43, null, 55, null, 43, null, 55, null,
    41, null, 53, null, 41, null, 53, null,
    40, null, 52, null, 40, null, 52, null,
  ] as (number | null)[],
};

export const JINGLES = {
  victory: [
    { midi: 72, at: 0, dur: 0.12 },
    { midi: 76, at: 0.12, dur: 0.12 },
    { midi: 79, at: 0.24, dur: 0.12 },
    { midi: 84, at: 0.36, dur: 0.6 },
  ],
  defeat: [
    { midi: 64, at: 0, dur: 0.3 },
    { midi: 63, at: 0.3, dur: 0.3 },
    { midi: 62, at: 0.6, dur: 0.3 },
    { midi: 57, at: 0.9, dur: 0.9 },
  ],
} as const;

export class Music {
  playing = false;
  private step = 0;
  private nextTime = 0;
  private scheduled: { start: number; handle: { stop(): void } }[] = [];
  private readonly stepDur = 60 / SONG.bpm / 2;

  constructor(private sched: NoteScheduler) {}

  /** Start (or restart) the loop from bar 1. */
  start(): void {
    this.stop();
    this.playing = true;
    this.step = 0;
    this.nextTime = this.sched.now() + 0.05;
    this.tick();
  }

  /** Cancel every note that hasn't started yet. */
  stop(): void {
    this.playing = false;
    const now = this.sched.now();
    for (const n of this.scheduled) if (n.start > now) n.handle.stop();
    this.scheduled = [];
  }

  /** Call every ~50 ms while the page is running. */
  tick(): void {
    if (!this.playing) return;
    const now = this.sched.now();
    if (this.nextTime < now) this.nextTime = now; // fell behind (e.g. a long frame)
    while (this.nextTime < now + LOOKAHEAD) {
      const i = this.step % SONG.lead.length;
      const lead = SONG.lead[i];
      const bass = SONG.bass[i];
      if (lead !== null) this.add(midiToFreq(lead), this.nextTime, this.stepDur * 0.9, 'lead');
      if (bass !== null) this.add(midiToFreq(bass), this.nextTime, this.stepDur * 1.8, 'bass');
      this.step++;
      this.nextTime += this.stepDur;
    }
    // Forget notes that have already finished.
    this.scheduled = this.scheduled.filter((n) => n.start > now - 2);
  }

  /** AC-8.3: stop the music and play the result jingle. */
  jingle(kind: keyof typeof JINGLES): void {
    this.stop();
    const t0 = this.sched.now() + 0.05;
    for (const n of JINGLES[kind]) this.sched.note(midiToFreq(n.midi), t0 + n.at, n.dur, 'lead');
  }

  private add(freq: number, start: number, dur: number, voice: Voice): void {
    this.scheduled.push({ start, handle: this.sched.note(freq, start, dur, voice) });
  }
}

/** Real scheduler: one oscillator + envelope per note into the music bus. */
export function webAudioScheduler(ctx: AudioContext, out: AudioNode): NoteScheduler {
  return {
    now: () => ctx.currentTime,
    note(freq, start, dur, voice) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = voice === 'lead' ? 'square' : 'triangle';
      osc.frequency.value = freq;
      const peak = voice === 'lead' ? 0.18 : 0.35;
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(peak, start + 0.01);
      env.gain.setValueAtTime(peak, start + Math.max(0.02, dur - 0.04));
      env.gain.linearRampToValueAtTime(0, start + dur);
      osc.connect(env).connect(out);
      osc.start(start);
      osc.stop(start + dur + 0.02);
      return {
        stop: () => {
          try {
            osc.stop();
          } catch {
            /* already stopped */
          }
          env.disconnect();
        },
      };
    },
  };
}
