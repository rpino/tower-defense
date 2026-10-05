# Release Notes — Tower Defense v1.0

## For players (jam page / share text)
**Tower Defense** is a short browser game for desktop and phone. Build Archer and Cannon towers on the glowing spots, then survive three waves of Grunts, Runners and armoured Brutes before they reach the red flag. A game takes about three minutes.

- Tap or click a spot to build. Archers are fast with long range; Cannons are slow and hit groups.
- Press **Start wave** when you're ready; you can keep building mid-wave.
- Kills earn gold; enemies that get through cost lives.
- Sound and music are generated live in your browser. Use the speaker button to mute.
- Works on phones (portrait or landscape) and desktop browsers. Nothing to install, no account.

Art by Kenney (kenney.nl), CC0. Sound synth based on ZzFX by Frank Force (MIT).

## For support / anyone answering player questions
- **"No sound"**: sound starts on the first tap (browser rule). Check the in-game mute button and the device volume. On older iPhones (before iOS 17) the silent switch also mutes the game.
- **"The map is small on my phone"**: it's sized to fit the whole map. Rotate to landscape for a bigger view.
- **"It says 'Couldn't load the game — please refresh'"**: a download failed; refreshing fixes it.
- **"Can I save or see a leaderboard?"**: no. This jam version has no accounts, saving or leaderboards (by design).
- **Known limitations:**
  - one map and three waves;
  - no pause button (switching tabs or apps pauses automatically);
  - only tested on Chrome (desktop) and Safari (iPhone);
  - screens narrower than 360 px work but are cramped.
- **Escalate to:** Pino. Include device, browser and what happened. Opening the game with `?debug=1` shows FPS.

## For engineering
- **Stack:** Phaser 3.90 (pinned, ADR-001), Vite 8, TypeScript 5.9, Vitest 5. Static output `dist/`, no backend.
- **Architecture:** a pure fixed-step simulation in `src/sim/` (ADR-002), Phaser scenes for rendering and input, Web Audio synthesis with a vendored ZzFX generator plus a custom sequencer (ADR-003).
- **Config added at release:** `vercel.json` (framework vite, `npm run build`, `dist/`, header `X-Content-Type-Options: nosniff`) and `.vercelignore`.
- **No** migrations, env vars, secrets or feature flags.
- **Quality:** 142 automated tests, including a headless balance test (AC-6.6: every scripted winning player takes 169–213 s). See `docs/06-qa/test-report.md` and `docs/07-review/review-report.md`.
- **Debug switches:** `?debug=1` (FPS/enemy overlay), `?dpr=1|2` (render resolution).
- **Tuning:** all balance numbers are in `src/config/balance.ts`. Re-run `npm test` after changes; the balance test guards run length.
- **History:** one commit per task T-1 … T-16 (`docs/05-build/build-log.md`), QA `6d807a4`, review fixes `791fa00`.
