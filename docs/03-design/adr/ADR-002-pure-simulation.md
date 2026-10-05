# ADR-002: Pure, fixed-step simulation separate from rendering

- **Status:** Proposed
- **Date:** 2026-10-04
- **Deciders:** Pino (Tech Lead)
- **Related:** AC-3.x, AC-4.x, AC-5.x, AC-6.x (esp. AC-6.6), AC-8.x, AC-10.5; project rule "never commit code without a test change"

## Context
The project's hooks require a test with every code change. The game's rules (economy, targeting, waves, win/lose) are the riskiest logic, and AC-6.6 (150–240 s run) can only be checked reliably by playing a whole run. Doing that by hand for every balance tweak is too slow.

## Options considered
### Option A — Rules in a pure TS module (`src/sim/`), fixed 60 Hz step, events out
- Pros: unit-testable in Vitest with no browser; repeatable runs; a headless full-run balance test in milliseconds; the renderer can be rewritten without touching the rules.
- Cons: a small "glue" layer that turns events into sprites and sounds; state is duplicated between sim objects and display objects.
### Option B — Rules inside Phaser game objects and scenes (typical Phaser style)
- Pros: less glue; quick to start.
- Cons: tests need a browser or Phaser mocks; frame-rate-dependent behaviour; balance can only be checked by playing.

## Decision
**Option A.** The test-per-commit rule and AC-6.6 make it decisive. The glue is small: one `syncSprites()` pass, plus a switch on event types.

## Consequences
- Easier: TDD for every rule, the balance test, reasoning about timing.
- Harder: keep display objects in sync by `id` (create on first sight, destroy when gone).
- Must do: `src/sim/` never imports Phaser; `step()` takes `dt ≤ 1/60`; GameScene caps the accumulated time at 250 ms.
