# Build Log — Tower Defense Project (Game Jam Entry)

| Date | Task | Branch / PR | ACs covered | Tests added | Reviewed by | Notes |
|---|---|---|---|---|---|---|
| 2026-10-04 | T-1 | `feature/T-1-scaffold` (no remote; no PR) | NFR-4, NFR-5, AC-10.4 (page CSS) | `tests/smoke.test.ts` | — | See T-1 notes |
| 2026-10-04 | T-2 | `feature/T-2-map` | AC-2.1, AC-2.3, AC-10.2 (spacing), DES-1 | `tests/map.test.ts` | — | See T-2 notes |
| 2026-10-04 | T-3 | `feature/T-3-iso-layout` | AC-2.2, AC-10.2, AC-10.3 (maths) | `tests/iso.test.ts`, `tests/layout.test.ts` | — | See T-3 notes |
| 2026-10-04 | T-4 | `feature/T-4-sim-core` | AC-1.3, 3.2, 3.3, 3.6–3.9, 5.1, 5.6, 5.8, 6.1–6.4, 8.1–8.5; BR-1–8, BR-10 | `tests/commands.test.ts`, `tests/step.test.ts`, `tests/purity.test.ts` | — | See T-4 notes |
| 2026-10-04 | T-5 | `feature/T-5-combat` | AC-4.1–4.4, 4.6, 4.7, 5.4 | `tests/combat.test.ts` | — | See T-5 notes |
| 2026-10-04 | T-6 | `feature/T-6-boot-title-map` | AC-1.1, 1.2, 1.4, 1.5, 2.1–2.5, 10.3 | `tests/palette.test.ts` + manual checklist | — | See T-6 notes |

## T-1 notes
- **Stack:** Phaser 3.90.0 (pinned per ADR-001; npm `latest` is now Phaser 4.2.1, which we deliberately don't use), Vite 8.3.2, Vitest 5.0.3, TypeScript 5.9.3, zzfx 1.4.0.
- **Vite 8 / rolldown:** `rollupOptions.output.manualChunks` must be a function now. Chunk splitting was dropped since it isn't needed.
- **Build:** `npm run build` succeeds. `dist/` is 1.7 MB in total, JS 1.2 MB (320 KB gzip), so NFR-2 (≤ 5 MB) is met.
- **Manual check:** the dev server serves `index.html`, `/src/main.ts` and `/assets/landscape_sheet.xml` (200). `npm run dev` uses `--host`, so the iPhone can reach it over LAN.
- **Finding for T-9:** the `zzfx` package runs `new AudioContext` **when it is imported**. That would create a second context before the first tap (against ADR-003 and AC-9.4) and crash Vitest under Node. T-9 will vendor only ZzFX's `buildSamples` (MIT, with attribution) into `src/audio/` and drop the package import. This stays within ADR-003 (ZzFX for sound effects, pre-rendered buffers).
- **Assets:** copied `landscape_sheet`, `towers_grey_sheet` and `towers_red_sheet` (PNG + XML) and the Kenney licence into `public/assets/`.

## T-2 notes
- **Spike approach:** I picked frames using offline contact sheets of the atlases (Python/PIL) and a static mock render, not an in-game `?atlas=1` scene. That was faster, and nothing temporary has to be removed from the game later (T-16).
- **Path pieces** (by open sides; NW = c−1, SE = c+1, NE = r−1, SW = r+1): `landscape_32` straight along c, `landscape_29` straight along r, corners `31` (SE+SW), `39` (NW+NE), `34` (NE+SE), `35` (NW+SW). Grass: `landscape_13`.
- **Towers:** Archer = grey `tower_07` + `tower_01` + `tower_41` (green spire); Cannon = red `tower_50` + `tower_44` + `tower_24` (battlement; the barrel is drawn in code later). Piece rises are 30 px and 33 px; the base sits 45 px below the tile's top-face centre.
- **Bottom anchor** `top = y + 66 − h` checked on 99, 115 and 130 px frames in the mock. Scenery frames are full tiles that include grass.
- **Map:** 23-tile path (entry at the top-left edge, exit at the bottom); 10 spots; every spot pair is ≥ 2 tiles apart, and no spot pair is a same-sign knight move (those are only 119 world px apart).
- **Build-spot look (AC-2.3):** uses grass plus a code-drawn pulsing diamond outline. No distinct Kenney tile read clearly enough against grass or path; the outline alone is clear (see mock).
- **Mock:** ![T-2 map mock](img/T-2-map-mock.png)

## T-3 notes
- `src/sim/iso.ts`: projection `x = (c − r)·66`, `y = (c + r)·33`, its inverse, and `nearestSpot` (the nearest spot wins; any state).
- `src/render/layout.ts`: 48 px top HUD band, 64 px bottom band and 8 px padding. The map's world bounds (1056×600) are zoom-fitted into the rest and centred (letterboxed). It also provides `screenToWorld`/`worldToScreen`.
- **At 360×640:** zoom ≈ 0.326, tap radius 22 CSS px ≈ 67.5 world px. The closest spot pair (132 world px) gives each spot an exclusive radius of ≈ 21.5 CSS px, so DES-1's ≥ 20 px holds (tested).
- Viewports tested: 360×640, 640×360, 390×844, 1280×720 and 1920×1080.

## T-4 notes
- `src/config/balance.ts` holds every BR-10 number. The wave tables start from the design §3.6 retune proposal (15 / 26 / 38 enemies; gaps 2.0 / 1.5 / 1.3 s; 2 s pause before the 6 Brutes). T-11 finalises them under RD-5.
- `src/sim/state.ts` (types, `SimEvent`, `createRun`), `path.ts` (`pathPoint`, 23-tile path), `commands.ts` (`build`, `startWave`), `step.ts` (spawning, movement, leaks, wave end, defeat-before-victory, no-op after the run ends).
- The state is mutated in place, and commands leave it untouched when they refuse (tested with `structuredClone` before/after).
- `tests/purity.test.ts` enforces ADR-002: no Phaser or DOM imports under `src/sim` and `src/config`.

## T-5 notes
- Step order: spawn → move enemies (leaks) → towers fire → projectiles fly and hit → end check (defeat before victory).
- Range and splash use Euclidean distance on the ground grid, in tiles (design §3.6), not screen distance.
- Towers stay "ready" (cooldown 0) while no enemy is in range, so they fire as soon as one enters.
- Projectiles home in on the target's current position. When the target is gone: arrows vanish (AC-4.6), cannonballs finish their flight to the last seen position and splash there (AC-4.7).
- The `damage()` guard (`hp <= 0` → ignore) makes sure a reward is credited only once, even when an enemy is hit by a splash and an arrow in the same step.

## T-6 notes
- **Scenes:** `BootScene` (loading bar, then start `Game` and launch `Title` on top) → `GameScene` (map, camera fitted from `computeLayout` and re-fitted on resize) → `TitleScene` (dimmed overlay: title, goal line, Start button 200×60, Kenney credit; rebuilt on resize). Starting emits `title:start`, which T-8 and T-9 hook into.
- **Depth:** ground tiles at −1,000,000 + y; scenery tiles (trees, rocks, crystals) sort at their world y with other objects; spot markers sit above the ground and below objects. The flag and spot markers are tweened Graphics.
- **Load-error bug found and fixed:** a missing atlas PNG fails at Phaser's *processing* step, so `loaderror` never fires. That left the loading bar on screen forever. `create()` now also checks that every atlas texture exists.
- **Phaser banner:** it prints "Web Audio" even with `noAudio: true`. Its banner logic checks device support first, but `SoundManagerCreator` checks `noAudio` first, so no Phaser AudioContext is created. This is noted so the banner doesn't mislead anyone.
- **Dev-only handle:** `window.__game` exists in `import.meta.env.DEV` only, for manual checks.
- **Manual checklist (desktop Chrome, 1459×812 and 360×640 via a resized container):**
  - Loading bar shows, then the title: pass.
  - Renaming `towers_red_sheet.png` shows "Couldn't load the game — please refresh" and no Start button: pass.
  - The whole map is visible, centred and correctly sorted at 360×640 (letterboxed): pass.
  - Resize re-fits the camera and rebuilds the title without reloading: pass.
  - Real rotation on the iPhone is checked in T-12.
- **Screenshot:** ![T-6 title](img/T-6-title.jpg)
