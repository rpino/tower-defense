# Implementation Plan — Tower Defense Project (Game Jam Entry)

| Field | Value |
|---|---|
| Requirements | docs/02-requirements/requirements.md (v0.3, approved) |
| Design | docs/03-design/design.md (v0.2, approved 2026-10-04) + ADR-001..003 |
| Deadline | 2026-10-05 20:00 Pacific |
| Status | In review |

**Estimates** are the agent's guess for building with Claude in Pino's environment (S ≈ ≤ 1 h, M ≈ 1–2 h, L ≈ 2–3 h), excluding Pino's own playtesting time. Pino adjusts them.

**Order rule:** Must work in M1–M3 comes first. M4 (Should) starts only when M3 is green. If time runs short, M4 tasks are dropped from the bottom up and M5 still happens.

**Every task ends with a commit that includes test changes.** This is a project rule, enforced by a hook. Rendering-only tasks add tests for any pure helpers they introduce (layout, palette, frame constants), and record their manual checks in `docs/05-build/build-log.md`.

## Milestones
1. **M1 — Playable, silent game on desktop:** start → build → 3 waves → victory or defeat → restart, in desktop Chrome on `npm run dev`. (T-1 … T-8)
2. **M2 — Sound and music:** every Must sound and the music loop, unlocked correctly on iPhone. (T-9, T-10)
3. **M3 — Balanced and verified on iPhone:** AC-6.6 balance test green; full playthrough on desktop Chrome and iPhone Safari over LAN. (T-11, T-12)
4. **M4 — Polish (Should):** Brute, mute, sound limit, range circles, floating gold, lives flash, high-DPI. (T-13 … T-15)
5. **M5 — Ship:** README and credits, production build check, then the Vercel deploy discussion. (T-16)

## Tasks
| ID | Title | ACs / NFRs | Depends on | Est. | Owner | Status |
|---|---|---|---|---|---|---|
| T-1 | Scaffold project (Vite + TS + Phaser + Vitest, git, mobile CSS, assets) | NFR-4, NFR-5, AC-10.4 (CSS) | — | S | Claude + Pino | done (awaiting review) |
| T-2 | Atlas spike + map data (`map.ts`, tower frames) — time-box 45 min | AC-2.1, AC-2.3, AC-10.2 (spacing), DES-1 | T-1 | M | Claude + Pino | done (awaiting review) |
| T-3 | Isometric math + layout (`iso.ts`, `layout.ts`) | AC-2.2, AC-10.2, AC-10.3 | T-1 | S | Claude | done (awaiting review) |
| T-4 | Simulation core: run, economy, spawning, movement, waves, win/lose | AC-1.3, 3.2, 3.3, 3.6, 3.7, 3.9, 5.1, 5.6, 5.8, 6.1–6.4, 8.1, 8.2, 8.4, 8.5; BR-1–8, BR-10 | T-2, T-3 | M | Claude | done (awaiting review) |
| T-5 | Simulation combat: targeting, arrows, cannon splash, rewards | AC-4.1–4.4, 4.6, 4.7, 5.4 | T-4 | M | Claude | done (awaiting review) |
| T-6 | Boot + Title scenes, map rendering | AC-1.1, 1.2, 1.4, 1.5, 2.1–2.5, 10.3 | T-2, T-3 | M | Claude | done (awaiting review) |
| T-7 | GameScene loop + entity rendering (enemies, towers, projectiles, effects) | AC-4.1, 4.2 (visuals), 5.2 (Grunt, Runner), 5.3, 5.4 (effect), 10.5 (dt cap) | T-5, T-6 | L | Claude | done (awaiting review) |
| T-8 | UIScene: HUD, picker, wave button and banners, result overlay, restart, input ownership | AC-1.3, 3.1, 3.3–3.5, 3.7, 3.8, 6.1, 6.3, 6.5 (banner), 7.1–7.3, 8.1–8.4, 10.1, 10.2; NFR-7 | T-7 | L | Claude | done (awaiting review) |
| T-9 | Audio core + sound effects (unlock, silent fallback, gain graph, iOS resume, pre-rendered ZzFX) | AC-1.6, 3.2 (sound), 4.5, 5.4 (sound), 5.6 (sound), 6.5 (sound), 9.1, 9.2, 9.4, 10.5 (audio) | T-8 | M | Claude | done (awaiting review) |
| T-10 | Music loop + victory and defeat jingles | AC-9.3, 8.3 (music/jingle), 8.4 (music restart) | T-9 | S | Claude | todo |
| T-11 | Balance test (two strategies) + BR-10 retune | AC-6.4, AC-6.6; NFR-1 (peak count) | T-5 | M | Claude | todo |
| T-12 | Device pass: desktop Chrome + iPhone Safari over LAN, fix issues | NFR-1, 3, 7, 8; AC-10.1–10.5, AC-2.2 | T-10, T-11 | M | **Pino** + Claude | todo |
| T-13 | *(Should)* Brute visuals, mute toggle, sound limit | AC-5.2 (Brute), 9.5, 9.6 | T-12 | S | Claude | todo |
| T-14 | *(Should)* Range circles, floating gold text, lives flash | AC-3.10, 5.5, 5.7 | T-12 | S | Claude | todo |
| T-15 | *(Should)* High-DPI rendering on iPhone — time-box 45 min | Design §3.5 (sharpness) | T-12 | S | Claude | todo |
| T-16 | Ship prep: README + credits, `npm run build` + preview, size check, deploy discussion | NFR-2, NFR-6, NFR-9, AC-1.4 | T-12 (and any M4 done) | S | Claude + **Pino** | todo |

Critical path: T-1 → T-2 → T-4 → T-5 → T-7 → T-8 → T-9 → T-10 → T-12 → T-16. T-3 runs alongside T-2. T-11 can run once T-5 is done, alongside T-6 to T-10.

---

### T-1: Scaffold project
- **What:**
  - `git init`, `.gitignore`.
  - Vite `vanilla-ts` template in the repo root; add `phaser` (pinned latest 3.x), `zzfx`, and `vitest` (dev).
  - Scripts: `dev` (`vite --host`, so the iPhone can reach it over LAN), `build`, `preview`, `test`.
  - `index.html` with the viewport meta and the CSS from design §3.1 (`touch-action:none` on html, body and canvas; `user-select:none`; `100dvh`; no scroll), plus `gesturestart` `preventDefault`.
  - Copy `landscape_sheet`, `towers_grey_sheet` and `towers_red_sheet` (PNG + XML) to `public/assets/`.
  - `src/main.ts`: Phaser config with `Scale.RESIZE`, `audio.noAudio: true`, and an empty BootScene.
  - Folder skeleton `src/{config,sim,audio,scenes,render}`, `tests/`.
- **Satisfies:** NFR-4, NFR-5, AC-10.4 (page CSS part).
- **Tests that prove it:** `tests/smoke.test.ts` (Vitest runs; `config/balance.ts` exports the BR-1 starting values). Manual: `npm run dev` shows a blank Phaser canvas that fills the window with no page scroll.
- **Definition of done:** `npm test` green; dev server runs; first commit.

### T-2: Atlas spike + map data (time-box 45 min)
- **What:**
  - Quick temporary preview (a debug scene behind `?atlas=1`) that shows every landscape and tower frame with its name.
  - Pick the grass, path pieces (straights, corners), build-spot tile, exit marker, scenery, and 2–3 stacked pieces each for the Archer (grey) and Cannon (red).
  - Check the bottom anchor `originY = (h − 66)/h` on 83, 99 and 115 px frames.
  - Write `src/config/map.ts`: an 8×8 grid of frame names; path waypoints, about 24 tiles, entry at the edge; 10 build spots beside the path, ≥ 2 tiles apart (DES-1); scenery placements; tower frame constants.
- **Satisfies:** AC-2.1, AC-2.3 (data), AC-10.2 (spacing), DES-1.
- **Tests that prove it:** `tests/map.test.ts`:
  - the path is continuous (each waypoint step is horizontal or vertical on the grid) and 22–26 tiles long;
  - entry and exit are on the map edge;
  - no spot or scenery is on the path;
  - exactly 10 spots;
  - every pair of spots is ≥ 2 tiles apart;
  - every frame name exists in the atlas XML.
- **Definition of done:** tests green; screenshot of the preview attached to the build log; Pino agrees the map looks right.

### T-3: Isometric math + layout
- **What:**
  - `src/sim/iso.ts`: `gridToWorld`, `worldToGrid`, and `nearestSpot(pt, spots, maxDist)`, where the nearest spot wins.
  - `src/render/layout.ts`: pure `computeLayout(viewW, viewH)` → HUD band rectangles, camera zoom and centre for the map's world bounds, letterboxing, portrait and landscape.
- **Satisfies:** AC-2.2, AC-10.2, AC-10.3 (the maths).
- **Tests that prove it:** `tests/iso.test.ts`:
  - grid → world → grid round trip;
  - the nearest spot wins between two close spots;
  - `null` beyond `maxDist`.

  `tests/layout.test.ts`:
  - the map plus HUD fits inside 360×640, 640×360, 1280×720 and 1920×1080;
  - zoom_min at 360×640 is computed;
  - each spot in `map.ts` gets an exclusive tap radius of ≥ 20 CSS px (DES-1).
- **Definition of done:** tests green.

### T-4: Simulation core
- **What:**
  - `src/config/balance.ts`: every BR-10 value (all 3 enemy types, data-driven).
  - `src/sim/state.ts`: types and `createRun()`.
  - `src/sim/commands.ts`: `build` (refuses with `occupied`, `not-a-spot`, `insufficient-gold`, `run-over`) and `startWave` (refuses with `not-build-phase`).
  - `src/sim/step.ts`:
    - a spawn queue from the wave tables, including the pause before the Brutes;
    - movement via `pathPoint(dist)`;
    - exit leaks cost lives, clamped at 0;
    - wave cleared → bonus + build phase; wave 3 → victory;
    - defeat checked first, so a tie gives Defeat;
    - no-op after the run ends;
    - events.
- **Satisfies:** AC-1.3, 3.2, 3.3, 3.6, 3.7, 3.9, 5.1, 5.6, 5.8, 6.1–6.4, 8.1, 8.2, 8.4 (fresh state), 8.5; BR-1–8, BR-10.
- **Tests that prove it:** `tests/commands.test.ts`, `tests/step.test.ts`:
  - start values;
  - build deducts gold, and each refusal reason leaves the state unchanged;
  - building allowed in both phases;
  - startWave only in the build phase;
  - spawn order and timing for each wave;
  - a leak costs 1, or 2 for a Brute, and lives never go negative;
  - wave clear gives the bonus;
  - victory after wave 3;
  - same-step tie → Defeat;
  - `step` returns `[]` after the run ends;
  - `createRun()` resets everything.
- **Definition of done:** tests green; no Phaser imports under `src/sim/`.

### T-5: Simulation combat
- **What:** In `step.ts`:
  - tower cooldowns;
  - targeting in range, using ground-grid distance and the furthest `dist`;
  - homing arrows that do damage on contact, and are removed with no damage if the target is gone;
  - homing cannonballs with splash damage on impact, landing at the last target position if the target is gone;
  - kill → gold reward + `death` event;
  - `shot`, `hit` and `explode` events.
- **Satisfies:** AC-4.1–4.4, 4.6, 4.7, 5.4 (gold and event).
- **Tests that prove it:** `tests/combat.test.ts`:
  - no fire without a target;
  - fire-rate cadence;
  - targeting picks the enemy furthest along;
  - an arrow kills a Grunt in 4 hits;
  - cannon splash hits every enemy within 1 tile and none outside;
  - arrow whose target is gone → no damage;
  - cannonball whose target is gone → splash at the last position;
  - reward credited once.
- **Definition of done:** tests green.

### T-6: Boot + Title scenes, map rendering
- **What:**
  - `BootScene`: `load.atlasXML` for the 3 sheets, a loading bar, and the `loaderror` message.
  - `TitleScene`: title, goal line, Start button (≥ 44 px), Kenney credit.
  - `GameScene` map pass: tiles with the bottom anchor and depth from world `y`, scenery, pulsing spot outlines, exit marker.
  - Resize hook calls `computeLayout` and re-fits the camera.
  - `src/render/palette.ts` with colours sampled from the sheets.
- **Satisfies:** AC-1.1, 1.2, 1.4, 1.5, 2.1–2.5, 10.3.
- **Tests that prove it:** `tests/palette.test.ts` (each HUD text/background pair has ≥ 4.5:1 contrast, for NFR-7). Manual checklist in the build log:
  - Title shows on load, and the loading bar shows first;
  - renaming an asset shows the error message;
  - the map is fully visible and sorted correctly at 360×640 and 1920×1080 (Chrome device mode);
  - rotating the device re-fits within 0.5 s.
- **Definition of done:** tests green; screenshots in the build log.

### T-7: GameScene loop + entity rendering
- **What:**
  - Fixed 60 Hz accumulator with a 250 ms cap (ADR-002).
  - `GameScene` owns the state and re-emits `SimEvent`s on `game.events`.
  - Sprite sync by `id`:
    - enemies drawn with Graphics and cached as textures (Grunt, Runner; placeholder for the Brute);
    - health bars;
    - tower containers;
    - projectiles;
    - death puff and explosion effects (`src/render/enemies.ts`, `effects.ts`).
  - Map tap → `nearestSpot`, rejected if occupied.
  - Temporary keyboard dev shortcuts (build, start wave), removed in T-8.
- **Satisfies:** AC-4.1, 4.2 (visible projectiles and explosion), 5.2 (Grunt, Runner shapes differ in shape and size), 5.3, 5.4 (death effect), 10.5 (no time jump).
- **Tests that prove it:** `tests/sync.test.ts` (the pure `diffEntities(prevIds, nextIds)` helper reports what to create and destroy). Manual: a scripted wave plays with correct depth sorting; switching tabs mid-wave and back makes no jump.
- **Definition of done:** tests green; a wave visibly plays out in Chrome.

### T-8: UIScene (end of M1)
- **What:**
  - HUD: lives, gold, "Wave N / 3".
  - Tower picker:
    - placed above or below the spot, clamped on screen;
    - unaffordable options dimmed, re-checked on gold events;
    - a tap on another spot moves it; a tap outside closes it; it closes when the run ends.
  - "Start wave N" button; "Wave N" banner (1.5 s) and "Wave N cleared!".
  - Victory and Defeat overlays with Restart.
  - Input ownership: UIScene handles `pointerup` first and marks it consumed; every action fires on `pointerup`.
  - Remove the dev shortcuts.
- **Satisfies:** AC-1.3, 3.1, 3.3–3.5, 3.7, 3.8, 6.1, 6.3, 6.5 (banner), 7.1–7.3, 8.1–8.4, 10.1, 10.2 (button sizes); NFR-7.
- **Tests that prove it:** `tests/picker.test.ts` (pure `placePicker(spotScreen, pickerSize, view)` stays fully on screen in the corners at 360×640) and `tests/hud.test.ts` (pure `hudText(state)`: "Wave 1 / 3" in the build phase before wave 1; "Defeated on wave N"). Manual M1 playthrough in desktop Chrome: start → build → 3 waves → Victory; a deliberate loss → Defeat; Restart → clean state; a tap on a picker button never moves the picker.
- **Definition of done:** tests green; **M1 demo to Pino**.

### T-9: Audio core + sound effects
- **What:** `src/audio/audio.ts`:
  - the AudioContext is created and resumed on the Start `pointerup`;
  - `silent` fallback on failure;
  - `audioSession.type='playback'` where available;
  - gain graph (sound effects, music, master);
  - suspend and resume on Phaser `hidden`/`visible`;
  - `resume()` retried on every `pointerup`.

  `src/audio/sfx.ts`: ZzFX presets for built, archer shot, cannon shot, explosion, death, life lost, wave start; pre-rendered to `AudioBuffer`s at unlock; wired to `game.events`.
- **Satisfies:** AC-1.6, 3.2 (sound), 4.5, 5.4 (sound), 5.6 (sound), 6.5 (sound), 9.1, 9.2, 9.4, 10.5 (audio).
- **Tests that prove it:** `tests/audio.test.ts`, using a fake AudioContext:
  - no context is created before `unlock()`;
  - `unlock()` throwing → `silent`, and later calls do nothing;
  - every AC-9.2 event key has a preset;
  - `hidden` suspends, `visible` resumes;
  - the mute value is kept across suspend.
- **Definition of done:** tests green; every sound plays in desktop Chrome.

### T-10: Music loop + jingles (end of M2)
- **What:** `src/audio/music.ts`:
  - a lookahead step sequencer (square-wave melody + triangle bass, 2–4 bars, looping);
  - `start` on Start and Restart; `stop` on a result screen;
  - victory and defeat jingles.
- **Satisfies:** AC-9.3, 8.3 (music stop + jingle), 8.4 (music restarts).
- **Tests that prove it:** `tests/music.test.ts` (scheduling with a fake clock: notes are scheduled ahead in a loop; `stop()` cancels future notes; `start()` after `stop()` restarts from bar 1).
- **Definition of done:** tests green; music plays through all waves and stops at the result screen.

### T-11: Balance test + BR-10 retune
- **What:** `tests/balance.test.ts` drives `createRun`/`build`/`startWave`/`step` headlessly with two scripted strategies, each pressing "Start wave" 5 s after it appears:
  - **(a) strongest:** greedy builds on the best spots;
  - **(b) minimal:** builds as little as possible while still winning.

  Retune `balance.ts`, starting from design §3.6's proposed waves (15 / 26 / 38 enemies), until both strategies end in Victory within 150–240 s and each wave is harder. Record the final table in the build log; RD-5 means no re-approval is needed.
- **Satisfies:** AC-6.4, AC-6.6; NFR-1 (records the peak enemy count for T-12).
- **Tests that prove it:** the balance test itself.
- **Definition of done:** test green; final BR-10 values recorded.

### T-12: Device pass (end of M3)
- **What:** Pino plays the full game on desktop Chrome and on iPhone Safari via `npm run dev -- --host` over Wi-Fi. Check:
  - FPS with `?debug=1` at the wave 3 peak;
  - rotation;
  - tap accuracy on build spots;
  - no page scroll or zoom;
  - audio unlocks and comes back after lock screen or app switch;
  - ringer switch behaviour;
  - no console errors (desktop DevTools; Safari Web Inspector if available).

  Claude fixes what's found; each fix comes with a test where the cause is in pure code.
- **Satisfies:** NFR-1, NFR-3, NFR-7, NFR-8; AC-2.2, AC-10.1–10.5 (verified on a real device).
- **Tests that prove it:** the manual device checklist in the build log, plus regression tests for each fix.
- **Definition of done:** both Must browsers pass a full Victory run, a Defeat run and a Restart.

### T-13: *(Should)* Brute visuals, mute toggle, sound limit
- **What:**
  - A Brute drawn as a large, bulky shape (sim support already exists from T-4).
  - Mute toggle in UIScene (≥ 44 px), kept across Restart.
  - A per-key limit of 4 copies of the same sound.
- **Satisfies:** AC-5.2 (Brute), AC-9.5, AC-9.6.
- **Tests that prove it:** audio tests (a 5th copy is skipped; mute is kept across `createRun`); manual Brute check.
- **Definition of done:** tests green.

### T-14: *(Should)* Range circles, floating gold, lives flash
- **What:**
  - Archer and Cannon range circles (solid and dashed) while the picker is open.
  - "+N" floating text on a kill (1 s).
  - Lives counter flashes on a leak.
- **Satisfies:** AC-3.10, AC-5.5, AC-5.7.
- **Tests that prove it:** pure helper tests (range circle radius in world px = range × tile factor); manual visual check.
- **Definition of done:** tests green; screenshots.

### T-15: *(Should)* High-DPI rendering — time-box 45 min
- **What:** Render at `min(devicePixelRatio, 2)`. Scale camera zoom, font sizes and input coordinates to match. Revert if it isn't stable within the time box.
- **Satisfies:** design §3.5 (sharpness); no AC.
- **Tests that prove it:** `computeLayout` tests extended with a DPR parameter; tap accuracy re-checked on the iPhone.
- **Definition of done:** sharp on the iPhone with no input regression, or reverted and noted.

### T-16: Ship prep (end of M5)
- **What:**
  - `README.md` with how to run, credits ("Art by Kenney (kenney.nl), CC0"; ZzFX, MIT) and controls.
  - `npm run build` + `npm run preview` smoke run.
  - Check `dist/` size is ≤ 5 MB and loads in ≤ 5 s.
  - Remove the atlas debug scene.
  - Then **stop for the Vercel deploy discussion with Pino** (NFR-9).
- **Satisfies:** NFR-2, NFR-6, NFR-9, AC-1.4.
- **Tests that prove it:** full `npm test` green; preview playthrough; size recorded in the build log.
- **Definition of done:** a production build ready to deploy.

## Coverage check
| AC / NFR | Tasks |
|---|---|
| AC-1.1, 1.2 | T-6 |
| AC-1.3 | T-4, T-8 |
| AC-1.4 | T-6, T-16 |
| AC-1.5 | T-6 |
| AC-1.6 | T-9 |
| AC-2.1 | T-2, T-6 |
| AC-2.2 | T-3, T-6, T-12 |
| AC-2.3 | T-2, T-6 |
| AC-2.4, 2.5 | T-6 |
| AC-3.1 | T-8 |
| AC-3.2 | T-4, T-9 (sound) |
| AC-3.3 | T-4, T-8 |
| AC-3.4, 3.5 | T-8 |
| AC-3.6 | T-4, T-7 |
| AC-3.7 | T-4, T-8 |
| AC-3.8 | T-8 |
| AC-3.9 | T-4 |
| AC-3.10 *(Should)* | T-14 |
| AC-4.1, 4.2 | T-5, T-7 |
| AC-4.3, 4.4, 4.6, 4.7 | T-5 |
| AC-4.5 | T-9 |
| AC-5.1 | T-4 |
| AC-5.2 | T-7 (Grunt, Runner), T-13 (Brute, *Should*) |
| AC-5.3 | T-7 |
| AC-5.4 | T-5, T-7, T-9 |
| AC-5.5 *(Should)* | T-14 |
| AC-5.6 | T-4, T-9 |
| AC-5.7 *(Should)* | T-14 |
| AC-5.8 | T-4 |
| AC-6.1, 6.2, 6.3 | T-4, T-8 |
| AC-6.4 | T-4, T-11 |
| AC-6.5 | T-8, T-9 |
| AC-6.6 | T-11 |
| AC-7.1–7.3 | T-8 |
| AC-8.1, 8.2 | T-4, T-8 |
| AC-8.3 | T-8, T-10 |
| AC-8.4 | T-4, T-8, T-10 |
| AC-8.5 | T-4 |
| AC-9.1, 9.2, 9.4 | T-9 |
| AC-9.3 | T-10 |
| AC-9.5, 9.6 *(Should)* | T-13 |
| AC-10.1 | T-8, T-12 |
| AC-10.2 | T-2, T-3, T-8, T-12 |
| AC-10.3 | T-3, T-6, T-12 |
| AC-10.4 | T-1, T-12 |
| AC-10.5 | T-7, T-9, T-12 |
| NFR-1 | T-11, T-12 |
| NFR-2 | T-16 |
| NFR-3 | T-12 |
| NFR-4, NFR-5 | T-1 |
| NFR-6 | T-16 |
| NFR-7 | T-6, T-8, T-12 |
| NFR-8 | T-12 |
| NFR-9 | T-16 |

Every AC and NFR is covered.

## Risks / spikes
- **T-2 atlas spike** is the main unknown (finding the right path and tower frames); it's time-boxed and done first.
- **iPhone-only problems** (audio, touch, fps) only show up in T-12. *Mitigation:* Pino can open the LAN dev URL on the iPhone after any task from T-6 onwards for an early look; please do this at least after T-8.
- **Schedule:** the Must path (T-1 … T-12) is about 13–16 h of agent-paced work plus Pino's testing time. If it slips past roughly 2026-10-05 14:00 Pacific, cut M4 and go straight to T-16.
- **Tickets:** no Jira or Linear connector is set up, so no tickets were created. This file is the backlog.
