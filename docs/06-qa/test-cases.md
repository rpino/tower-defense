# Test Cases — Tower Defense Project (Game Jam Entry)

| Field | Value |
|---|---|
| Requirements | docs/02-requirements/requirements.md (v0.3, approved) |
| Build | `main` @ 49befcc + QA branch `qa/test-pass` |
| Date | 2026-10-04 |

**Levels:**
- **unit:** Vitest on pure modules.
- **headless:** whole games simulated in Vitest.
- **manual-dev:** Claude in desktop Chrome via browser automation. Evidence is in `docs/05-build/build-log.md`.
- **device:** Pino on desktop Chrome and iPhone Safari (T-12, re-checked after T-15).

**Results:** ✅ pass, ❌ fail. Automated tests are named after their AC, so the file is enough to find them.

## US-1 Start screen
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-01 | AC-1.1 | manual-dev, device | Load the page | Title, goal line and Start button shown | no (T-6 checklist, screenshot) | ✅ |
| TC-02 | AC-1.2 | manual-dev | Load the page | Loading bar first; no Start until loaded | no (T-6 checklist) | ✅ |
| TC-03 | AC-1.3 | unit, manual-dev | `createRun()`; press Start | Build phase, wave 1, 10 lives, 150 gold | yes, `commands.test.ts`; `hud.test.ts` | ✅ |
| TC-04 | AC-1.4 | manual-dev | Look at the title screen | "Art by Kenney (kenney.nl)" | no (T-6 screenshot) | ✅ |
| TC-05 | AC-1.5 | manual-dev | Rename `towers_red_sheet.png`, load | "Couldn't load the game — please refresh", no Start | no (T-6; found and fixed a processing-error bug) | ✅ |
| TC-06 | AC-1.6 | unit | AudioContext factory throws | Engine goes silent; every call is a no-op; no throw | yes, `audio.test.ts` | ✅ |

## US-2 Battlefield view
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-07 | AC-2.1 | unit | Inspect the map data | One continuous path of 22–26 tiles, entry and exit on the edge, scenery off the path, every frame exists in the atlas | yes, `map.test.ts` (6 tests) | ✅ |
| TC-08 | AC-2.2 | unit, device | Layout at 360×640, 640×360, 390×844, 1280×720, 1920×1080 | Whole map between the HUD bands; centred; no scroll | yes, `layout.test.ts`; device T-12 | ✅ |
| TC-09 | AC-2.3 | unit, manual-dev | Map data; look at the map | 10 spots off the path, visibly outlined | yes, `map.test.ts`; T-6 screenshot | ✅ |
| TC-10 | AC-2.4 | manual-dev | Look at the exit | Red flag at the path exit | no (T-6 screenshot) | ✅ |
| TC-11 | AC-2.5 | manual-dev | Enemy walks behind a tower | The tower hides the enemy correctly | no (T-7 zoomed screenshot) | ✅ |

## US-3 Build towers
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-12 | AC-3.1 | unit, manual-dev | Tap an empty spot; spots in all 4 corners at 360×640 | Picker with Archer 50 / Cannon 80, fully on screen | yes, `picker.test.ts`; T-8 | ✅ |
| TC-13 | AC-3.2 | unit | Build affordable / exactly-affordable | Tower placed, cost deducted, `built` event | yes, `commands.test.ts`, `qa.test.ts` TC-QA-01 | ✅ |
| TC-14 | AC-3.3 | unit, manual-dev | Gold < cost; 0 gold; tap the dimmed option | Option dimmed; refused; state unchanged | yes, `commands.test.ts`, `hud.test.ts`, TC-QA-02; T-8 | ✅ |
| TC-15 | AC-3.4 | manual-dev | Picker open; tap empty ground | Picker closes, nothing built | no (T-8) | ✅ |
| TC-16 | AC-3.5 | manual-dev | Picker open; tap another empty spot | Picker moves there | no (T-8 behaviour via `spot:tap`) | ✅ |
| TC-17 | AC-3.6 | unit | Build on an occupied spot / not a spot | Refused (`occupied` / `not-a-spot`) | yes, `commands.test.ts`, `iso.test.ts` | ✅ |
| TC-18 | AC-3.7 | unit | Build during a wave | Allowed | yes, `commands.test.ts` | ✅ |
| TC-19 | AC-3.8 | unit, manual-dev | Run ends with the picker open; build after the end | Picker closes; build refused (`run-over`) | yes, `commands.test.ts`; T-8 | ✅ |
| TC-20 | AC-3.9 | unit | List the commands | Only `build` and `startWave` exist | yes, `commands.test.ts` | ✅ |
| TC-21 | AC-3.10 *(Should)* | unit, manual-dev | Open the picker | Archer range solid, Cannon range dashed, correct size | yes, `polish.test.ts`; T-14 screenshot | ✅ |

## US-4 Towers attack
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-22 | AC-4.1 | unit, manual-dev | Archer with an enemy in range | Fires at 1.5/s; homing arrows; kill after ceil(hp/dmg) hits | yes, `combat.test.ts` | ✅ |
| TC-23 | AC-4.1/4.4 boundary | unit | Enemy ±0.05 tiles around the range edge | Inside → shot; outside → none | yes, `qa.test.ts` TC-QA-03/04 | ✅ |
| TC-24 | AC-4.2 | unit, manual-dev | Cannon with 3 enemies at 0, 0.8 and 1.6 tiles | Explosion hits the first two only | yes, `combat.test.ts`; T-7 | ✅ |
| TC-25 | AC-4.3 | unit | 3 enemies in range | Targets the one furthest along the path | yes, `combat.test.ts` | ✅ |
| TC-26 | AC-4.4 | unit | No enemy in range | No shots | yes, `combat.test.ts` | ✅ |
| TC-27 | AC-4.5 | unit, device | Tower fires | Archer and Cannon each have their own sound | yes, `audio.test.ts` (mapping); device (audible) | ✅ |
| TC-28 | AC-4.6 | unit | Arrow target vanishes | Arrow removed, no damage to others | yes, `combat.test.ts` | ✅ |
| TC-29 | AC-4.7 | unit | Cannonball target vanishes | Lands at the last position, splash applied | yes, `combat.test.ts` | ✅ |

## US-5 Enemies
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-30 | AC-5.1 | unit | Spawn and walk | Starts at the entry; moves at its type's speed | yes, `step.test.ts` | ✅ |
| TC-31 | AC-5.2 | manual-dev | Look at Grunt, Runner, Brute | Different shape **and** size | no (T-7 screenshot) | ✅ |
| TC-32 | AC-5.3 | manual-dev | Damage an enemy | Health bar appears only once hurt | no (T-7 screenshot) | ✅ |
| TC-33 | AC-5.4 | unit, manual-dev | Kill an enemy | Removed, reward credited once, death event, puff, sound | yes, `combat.test.ts`; T-7/T-9 | ✅ |
| TC-34 | AC-5.5 *(Should)* | unit, manual-dev | Kill an enemy | "+N" floats for ~1 s | yes, `polish.test.ts` (label); T-14 | ✅ |
| TC-35 | AC-5.6 | unit | Enemy reaches the exit | Removed; lives − cost; `lifeLost` event with lives left | yes, `step.test.ts`, TC-QA-07 | ✅ |
| TC-36 | AC-5.7 *(Should)* | manual-dev | Enemy leaks | Heart and lives counter flash | no (T-14 screenshot) | ✅ |
| TC-37 | AC-5.8 | unit | Track positions | Always on the path polyline; never blocked | yes, `step.test.ts` | ✅ |

## US-6 Waves
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-38 | AC-6.1 | unit, manual-dev | Build phase | Button "Start wave N"; nothing spawns | yes, `step.test.ts`; T-8 | ✅ |
| TC-39 | AC-6.2 | unit | Start a wave | Exact order and timings, including the pause before the Brutes; can't start twice | yes, `step.test.ts`, `commands.test.ts` | ✅ |
| TC-40 | AC-6.3 | unit, manual-dev | Clear waves 1 and 2 | Bonus, "Wave N cleared!", next build phase | yes, `step.test.ts`, TC-QA-06; T-8 | ✅ |
| TC-41 | AC-6.4 | unit | Compare waves | More total HP and shorter gap each wave | yes, `step.test.ts` | ✅ |
| TC-42 | AC-6.5 | unit, manual-dev | Start each wave | `waveStart` with the right number; banner 1.5 s; sound | yes, TC-QA-06; T-8/T-9 | ✅ |
| TC-43 | AC-6.6 | headless | 4 aggressive players + the barely-winning player, each wave pressed 5 s after it appears | Victory in 150–240 s for all | yes, `balance.test.ts` (169–213 s) | ✅ |

## US-7 HUD
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-44 | AC-7.1 | unit, manual-dev | Before and during waves | Lives, gold, "Wave N / 3" (next wave in the build phase) always visible | yes, `hud.test.ts`, `picker.test.ts` (picker below the top bar) | ✅ |
| TC-45 | AC-7.2 | manual-dev | Gold or lives change | HUD updates the same frame (`update()` reads state every frame) | no (T-8) | ✅ |
| TC-46 | AC-7.3 | manual-dev | Compare the HUD with the art | Kenney-sampled palette; PO accepted at demos | no (Pino, M1–M4 demos) | ✅ |

## US-8 Win, lose, restart
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-47 | AC-8.1 | unit, manual-dev | Lives reach 0 | Stops immediately; "Defeated on wave N"; Restart | yes, `step.test.ts`, `hud.test.ts`; T-8 | ✅ |
| TC-48 | AC-8.2 | unit, manual-dev | Clear wave 3 | "Victory!", lives remaining, Restart | yes, `step.test.ts`, `hud.test.ts`; T-8 | ✅ |
| TC-49 | AC-8.3 | unit, manual-dev | Result screen | Simulation frozen; music stops; jingle plays | yes, `step.test.ts`, `music.test.ts`; T-10 | ✅ |
| TC-50 | AC-8.4 | unit, manual-dev | Restart | Fresh state shares nothing with the old run; music from bar 1 | yes, TC-QA-05, `music.test.ts`; T-8/T-10 | ✅ |
| TC-51 | AC-8.5 | unit | Last enemy leaks with 1 life left | Defeat, not victory | yes, `step.test.ts` | ✅ |

## US-9 Sound and music
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-52 | AC-9.1 | unit | Build samples | Generated in code; no audio files | yes, `audio.test.ts` | ✅ |
| TC-53 | AC-9.2 | unit, device | Each event | 7 distinct effects plus victory/defeat jingles; audible | yes, `audio.test.ts`, `music.test.ts`; device | ✅ |
| TC-54 | AC-9.3 | unit, device | Start → waves | Music loops until the result screen | yes, `music.test.ts`; T-10; device | ✅ |
| TC-55 | AC-9.4 | unit, manual-dev | Before the first tap | No AudioContext | yes, `audio.test.ts`; T-9 | ✅ |
| TC-56 | AC-9.5 *(Should)* | unit, manual-dev | Toggle mute; Restart | Silences; stays muted across Restart; 48 px button in the bottom bar | yes, `mute.test.ts`; T-13 | ✅ |
| TC-57 | AC-9.6 *(Should)* | unit | 7 plays of one sound | At most 4 at once | yes, `audio.test.ts` | ✅ |

## US-10 Phones and desktop
| TC | AC | Level | Steps | Expected | Automated? | Result |
|---|---|---|---|---|---|---|
| TC-58 | AC-10.1 | device | Play everything with only taps or clicks | Works; no hover, keyboard or drag needed | no (T-12 device) | ✅ |
| TC-59 | AC-10.2 | unit, device | Tap areas on 360×640 | Buttons ≥ 44 px; nearest spot wins; ≥ 20 px exclusive radius | yes, `layout.test.ts`, `iso.test.ts`, `picker.test.ts`, `mute.test.ts`; device | ✅ |
| TC-60 | AC-10.3 | unit, manual-dev, device | Resize or rotate mid-run | Re-fits, run continues | yes, `layout.test.ts`; T-15 (390×844 at DPR 2); device | ✅ |
| TC-61 | AC-10.4 | device | Tap, double-tap, pinch on iPhone | No scroll, zoom or selection | no (T-12 device) | ✅ |
| TC-62 | AC-10.5 | unit, device | Hide the tab or lock the phone mid-wave | Paused, no jump (250 ms cap), audio suspended and back, mute kept | yes, `sync.test.ts`, `audio.test.ts`; device | ✅ |

## Non-functional
| TC | NFR | Level | Check | Result |
|---|---|---|---|---|
| TC-63 | NFR-1 | headless, device | Peak ≤ 30 enemies (actual ≤ 12); Pino: FPS fine on iPhone at DPR 2 with `?debug=1` | ✅ |
| TC-64 | NFR-2 | build | Download ≈ 0.85 MB (JS 321 KB gzip + 519 KB images) → ≈ 0.7 s at 10 Mbps | ✅ |
| TC-65 | NFR-3 | device | Must browsers (desktop Chrome, iPhone Safari): pass. Should browsers (Edge, Firefox, desktop Safari, Android Chrome): **not tested** | ✅ Must / ⚠ Should untested |
| TC-66 | NFR-4 | code scan | No fetch/XHR/WebSocket/beacon, no storage or cookies, no external URLs except comments and banner strings | ✅ |
| TC-67 | NFR-5 | build | Static `dist/`; `vite preview` serves all files 200 | ✅ |
| TC-68 | NFR-6 | review | Kenney credit on the title and in the README; ZzFX MIT notice kept; licence file shipped | ✅ |
| TC-69 | NFR-7 | unit | All text pairs ≥ 4.5:1; fonts never below 14 px | ✅ |
| TC-70 | NFR-8 | manual-dev, device | No console errors in the dev and preview runs; Pino reported none | ✅ |
| TC-71 | NFR-9 | — | Local playable: ✅. Live on Vercel before 2026-10-05 20:00 Pacific: pending (Release phase) | ⏳ |

## Gaps found (not covered by any AC)
None that need a Product Owner decision. Scenarios I explored, and why none is a gap:

| Scenario | Why it isn't a gap |
|---|---|
| Player double-taps "Start wave" | `startWave` refuses outside the build phase (BR-5, tested) |
| Player never presses "Start wave" | Intended: there's no automatic timer (BR-5, RD-4) |
| Screens narrower than 360 px (e.g. 320 px iPhone SE 1) | Outside the agreed 360–1920 range (AC-2.2). The map still fits, but tap areas shrink below 20 px. Noted as a risk |
| Rotation while the picker is open | `UIScene.build()` reopens the picker on rebuild |
| Gold piling up after all 10 spots are full | Harmless; nothing to spend it on, by design (BR-2, BR-4) |
| Tampering with the client (devtools) | No accounts, scores or backend, so nothing to protect (NFR-4) |

## Defects
| DEF | Severity | AC | Summary | Status |
|---|---|---|---|---|
| DEF-01 | Major | AC-1.5 | A missing atlas left the loading bar on screen forever, because a processing failure doesn't fire `loaderror` | Fixed in T-6 (texture-existence check); TC-05 |
| DEF-02 | Major | AC-6.6, balance | Cannon not worth buying; 2 Archers beat the whole game | Fixed in T-11 (BR-10 retune); TC-43 |
| DEF-03 | Minor | test quality | The DPR test "same viewport gives the same layout" was tautological (always passes) | Removed in QA |

No open defects.
