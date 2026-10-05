import { describe, expect, it } from 'vitest';
import { JINGLES, LOOKAHEAD, Music, SONG, midiToFreq, type NoteScheduler } from '../src/audio/music';

interface Scheduled {
  freq: number;
  start: number;
  dur: number;
  voice: string;
  stopped: boolean;
}

class FakeScheduler implements NoteScheduler {
  time = 0;
  notes: Scheduled[] = [];
  now() {
    return this.time;
  }
  note(freq: number, start: number, dur: number, voice: 'lead' | 'bass') {
    const n: Scheduled = { freq, start, dur, voice, stopped: false };
    this.notes.push(n);
    return { stop: () => (n.stopped = true) };
  }
}

const stepDur = 60 / SONG.bpm / 2;
const loopLen = SONG.lead.length * stepDur;

/** Advance the fake clock in 50 ms ticks, like the real timer. */
function advance(m: Music, s: FakeScheduler, seconds: number) {
  for (let t = 0; t < seconds; t += 0.05) {
    s.time += 0.05;
    m.tick();
  }
}

describe('T-10 music', () => {
  it('midiToFreq: A4 = 440 Hz, A5 = 880 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 6);
    expect(midiToFreq(81)).toBeCloseTo(880, 6);
  });

  it('AC-9.3: start() schedules notes ahead of the clock, but no further than the lookahead', () => {
    const s = new FakeScheduler();
    const m = new Music(s);
    m.start();
    expect(s.notes.length).toBeGreaterThan(0);
    for (const n of s.notes) expect(n.start).toBeLessThanOrEqual(s.time + LOOKAHEAD + 1e-9);
  });

  it('AC-9.3: the song loops: after one full loop the first bar is scheduled again', () => {
    const s = new FakeScheduler();
    const m = new Music(s);
    m.start();
    advance(m, s, loopLen + 0.5);
    const firstLead = SONG.lead.find((n) => n !== null)!;
    const leadStarts = s.notes.filter((n) => n.voice === 'lead' && Math.abs(n.freq - midiToFreq(firstLead)) < 1e-6).map((n) => n.start);
    expect(leadStarts.some((t) => t >= loopLen - 1e-6)).toBe(true);
  });

  it('AC-8.3: stop() cancels notes that have not started yet and schedules nothing more', () => {
    const s = new FakeScheduler();
    const m = new Music(s);
    m.start();
    advance(m, s, 1);
    m.stop();
    const future = s.notes.filter((n) => n.start > s.time);
    expect(future.every((n) => n.stopped)).toBe(true);
    const count = s.notes.length;
    advance(m, s, 2);
    expect(s.notes.length).toBe(count);
  });

  it('AC-8.4: start() after stop() restarts from bar 1', () => {
    const s = new FakeScheduler();
    const m = new Music(s);
    m.start();
    advance(m, s, 3);
    m.stop();
    const before = s.notes.length;
    m.start();
    const first = s.notes[before];
    expect(first.voice === 'lead' || first.voice === 'bass').toBe(true);
    const firstLead = s.notes.slice(before).find((n) => n.voice === 'lead')!;
    expect(firstLead.freq).toBeCloseTo(midiToFreq(SONG.lead.find((n) => n !== null)!), 6);
    expect(firstLead.start).toBeGreaterThanOrEqual(s.time);
  });

  it('AC-8.3: jingles stop the music and play their own short note sequence', () => {
    for (const kind of ['victory', 'defeat'] as const) {
      const s = new FakeScheduler();
      const m = new Music(s);
      m.start();
      advance(m, s, 1);
      const before = s.notes.length;
      m.jingle(kind);
      const added = s.notes.slice(before);
      expect(added).toHaveLength(JINGLES[kind].length);
      expect(m.playing).toBe(false);
    }
  });

  it('victory and defeat jingles differ (rising vs falling)', () => {
    const v = JINGLES.victory.map((n) => n.midi);
    const d = JINGLES.defeat.map((n) => n.midi);
    expect(v[v.length - 1]).toBeGreaterThan(v[0]);
    expect(d[d.length - 1]).toBeLessThan(d[0]);
  });
});
