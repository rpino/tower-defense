# ADR-003: Synthesized audio — ZzFX for sound effects + custom music sequencer

- **Status:** Proposed
- **Date:** 2026-10-04
- **Deciders:** Pino (Tech Lead)
- **Related:** AC-9.1–9.6, AC-8.3, AC-1.6, AC-10.5, NFR-6; brief R3 (iOS audio unlock)

## Context
All sound must be generated in code (DIS-4, AC-9.1): 9+ distinct sound effects, a looping music track and two jingles, working on iPhone Safari, where audio only starts after a user gesture.

## Options considered
### Option A — ZzFX (≈ 1 KB, MIT) for sound effects + a small hand-written oscillator sequencer for music
- Pros: ZzFX makes good retro sound effects from a single parameter array, with presets easy to tweak; the music sequencer is ~80 lines with two oscillators; both share one AudioContext and gain graph we control (mute, limits, suspend).
- Cons: one small dependency; music is simple (chiptune loop).
### Option B — Fully hand-written oscillator and noise sound effects + music
- Pros: no dependency.
- Cons: designing 9+ good-sounding effects by hand takes much longer.
### Option C — ZzFXM (tracker-style music) for music as well
- Pros: richer music.
- Cons: song data is fiddly to write by hand in the time available; more to debug.

## Decision
**Option A.** It gives the best sound for the time spent, while keeping the AudioContext under our control for the iOS unlock, mute (AC-9.5), the 4-copy limit (AC-9.6) and suspending when the tab is hidden (AC-10.5). ZzFX's MIT licence is credited in the README (NFR-6).

## Consequences
- Easier: adding or tuning sound effects.
- Harder: ZzFX must be pointed at our AudioContext and gain node rather than its default output (wrap `zzfxG` → buffer → our graph).
- Must do: create and resume the context only inside the Start or Restart pointer handler; if that throws, set `silent`.
- Amended after design review: set Phaser `audio: { noAudio: true }` so it doesn't create a second AudioContext. Pre-render every ZzFX preset to an `AudioBuffer` once at unlock, rather than generating samples on every play (NFR-1 on iPhone). Retry `resume()` on every `pointerup` while the context isn't `running` (iOS interruptions).
