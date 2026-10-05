# Requirements — Tower Defense Project (Game Jam Entry)

| Field | Value |
|---|---|
| Source brief | docs/01-discovery/problem-brief.md (approved 2026-10-04) |
| Product Owner | Pino |
| Version / date | v0.3 — 2026-10-04 (reviewer findings applied; REQ-1..3 decided) |
| Jam deadline | 2026-10-05 20:00 Pacific |
| Status | In review |

## 1. Summary
A short browser tower defense game for a 48-hour solo jam. One isometric map built from the Kenney pack, 2 tower types (Archer and Cannon) on marked build spots, and 3 waves that get harder, for about 3 minutes of play, ending in a win or a loss. The player defends with **lives and gold**. Enemies, projectiles, effects and UI are drawn in code, and sound effects and music are generated in code. It must be playable with a mouse on desktop and with touch on a phone.

> Note: §4 of the brief still says "8-bit". That was superseded by decision DIS-3 (Kenney low-poly isometric look).

**Priorities.** Must = needed for a playable, finished entry. Should = polish, built after every Must is working (brief risk R1). Could = only if time remains. Individual ACs tagged *(Should)* or *(Could)* override their story's priority.

## 2. User stories & acceptance criteria

Terms: **player** = anyone who opens the game link. **Run** = one game from Start until the result screen. **Tile** = one map tile. Numbers in *italics* come from the balance table (BR-10) and can be tuned during playtesting (see Q1).

### US-1: Start screen · Priority: Must · Traces to: Brief §7, §5 (playable)
As a **player**, I want **a title screen with a Start button** so that **I know what the game is and choose when to begin**.

**Acceptance criteria**
- **AC-1.1** WHEN the game page finishes loading THE SYSTEM SHALL show a start screen with the game title, the line "Stop the enemies before they reach the end of the path" and a Start button.
- **AC-1.2** WHILE game assets are still loading THE SYSTEM SHALL show a loading indicator and SHALL NOT show the Start button.
- **AC-1.3** WHEN the player clicks or taps Start THE SYSTEM SHALL begin a new run in the build phase before wave 1 (see US-6), with lives and gold at their starting values.
- **AC-1.4** THE SYSTEM SHALL show the credit line "Art by Kenney (kenney.nl)" on the start screen.
- **AC-1.5** IF an image asset fails to load THEN THE SYSTEM SHALL show "Couldn't load the game — please refresh" instead of the Start button.
- **AC-1.6** IF browser audio is unavailable or fails to start THEN THE SYSTEM SHALL let the run go ahead silently, with no error shown.

### US-2: Battlefield view · Priority: Must · Traces to: Brief §7, §5 (polish)
As a **player**, I want **to see the whole map, the enemy path and where I can build** so that **I can plan my defence**.

**Acceptance criteria**
- **AC-2.1** WHILE a run is in progress THE SYSTEM SHALL show one isometric map of *8×8 tiles* built from the Kenney pack: grass tiles, one continuous dirt path of *about 24 tiles* from an entry point at the map edge to an exit point, and scenery (trees, rocks, crystals) that doesn't block the path or build spots.
- **AC-2.2** THE SYSTEM SHALL show the whole map and the HUD on screen at once, with no scrolling or zooming needed, on any viewport from 360×640 px up to 1920×1080 px, in portrait and landscape. Extra space is filled with background colour (letterboxing).
- **AC-2.3** THE SYSTEM SHALL visibly mark every empty build spot (*10 spots*, no two next to each other) so they look different from plain grass.
- **AC-2.4** THE SYSTEM SHALL visibly mark the path's exit point (the place the player defends).
- **AC-2.5** THE SYSTEM SHALL draw sprites in depth order, so objects nearer the bottom of the screen appear in front of objects behind them (no tower or enemy wrongly drawn on top of something in front of it).

### US-3: Build towers · Priority: Must · Traces to: Brief §7 (1–2 towers), §4
As a **player**, I want **to choose a build spot and a tower type and pay gold for it** so that **I can set up my defence**.

**Acceptance criteria**
- **AC-3.1** WHEN the player clicks or taps an empty build spot THE SYSTEM SHALL open a tower picker next to that spot, showing Archer and Cannon with their gold costs. The picker SHALL always appear fully inside the visible game area.
- **AC-3.2** WHEN the player picks a tower they can afford THE SYSTEM SHALL place that tower on the spot, subtract its cost from gold, close the picker and play a build sound.
- **AC-3.3** WHILE the player's gold is less than a tower's cost THE SYSTEM SHALL show that option as disabled (dimmed) in the picker, and picking it SHALL do nothing.
- **AC-3.4** WHEN the picker is open and the player clicks or taps anywhere outside the picker and outside empty build spots THE SYSTEM SHALL close the picker without building.
- **AC-3.5** WHEN the picker is open and the player clicks or taps a different empty build spot THE SYSTEM SHALL move the picker to that spot.
- **AC-3.6** IF the player clicks or taps a build spot that already has a tower, or any place that isn't a build spot, THEN THE SYSTEM SHALL NOT open the picker.
- **AC-3.7** THE SYSTEM SHALL allow building during the build phase and while a wave is in progress. The game SHALL keep running while the picker is open.
- **AC-3.8** WHEN the run ends (victory or defeat) THE SYSTEM SHALL close the picker if it is open.
- **AC-3.9** THE SYSTEM SHALL NOT offer selling, moving or upgrading towers.
- **AC-3.10** WHILE the picker is open THE SYSTEM SHALL show the Archer and Cannon range circles around the chosen spot in two clearly different styles (e.g. solid and dashed). *(Should)*

### US-4: Towers attack enemies · Priority: Must · Traces to: Brief §7, §4
As a **player**, I want **my towers to shoot enemies in range automatically** so that **my placement choices matter**.

**Acceptance criteria**
- **AC-4.1** WHILE an enemy is within an Archer's range THE SYSTEM SHALL have the Archer fire a visible arrow at one enemy at the Archer's fire rate. The arrow SHALL home in on its target at the arrow speed and deal its damage on contact.
- **AC-4.2** WHILE one or more enemies are within a Cannon's range THE SYSTEM SHALL have the Cannon fire a visible cannonball at one enemy at the Cannon's fire rate. The cannonball SHALL home in on its target at the cannonball speed. On impact it SHALL damage every enemy within the splash radius of the impact point and show an explosion effect.
- **AC-4.3** WHEN more than one enemy is in range THE SYSTEM SHALL target the enemy furthest along the path.
- **AC-4.4** WHILE no enemy is in range THE SYSTEM SHALL NOT fire.
- **AC-4.5** WHEN a tower fires THE SYSTEM SHALL play that tower type's shot sound.
- **AC-4.6** IF an arrow's target dies or leaves the map before contact THEN THE SYSTEM SHALL remove the arrow without dealing damage.
- **AC-4.7** IF a cannonball's target dies or leaves the map before impact THEN THE SYSTEM SHALL land the cannonball at the target's last position and apply splash damage there.

### US-5: Enemies move along the path · Priority: Must (Grunt, Runner) / Should (Brute) · Traces to: Brief §7, §4
As a **player**, I want **enemies that walk the path, show their health and hurt me if they get through** so that **there is a threat to defend against**.

**Acceptance criteria**
- **AC-5.1** WHEN a wave spawns an enemy THE SYSTEM SHALL place it at the path's entry point and move it along the path toward the exit at its type's speed.
- **AC-5.2** THE SYSTEM SHALL draw each enemy type in code. Types SHALL differ in shape or size, not only colour. Must: Grunt and Runner. *(Should)*: Brute.
- **AC-5.3** WHILE an enemy has less than full health THE SYSTEM SHALL show a health bar above it.
- **AC-5.4** WHEN an enemy's health reaches 0 THE SYSTEM SHALL remove it, show a death effect, add its gold reward to the player's gold and play a death sound.
- **AC-5.5** WHEN an enemy dies THE SYSTEM SHALL show its gold reward as floating text (e.g. "+5") for about 1 s. *(Should)*
- **AC-5.6** WHEN an enemy reaches the exit THE SYSTEM SHALL remove it, subtract its life cost from lives and play a "life lost" sound.
- **AC-5.7** WHEN the player loses a life THE SYSTEM SHALL flash the lives counter. *(Should)*
- **AC-5.8** THE SYSTEM SHALL keep enemies on the path. Enemies SHALL NOT be blocked by towers or by each other.

### US-6: Three escalating waves · Priority: Must · Traces to: Brief §5 (playable length), §7
As a **player**, I want **three waves that each get harder, started when I'm ready** so that **the game has a build-up and a clear end**.

**Acceptance criteria**
- **AC-6.1** WHILE in the build phase (before a wave starts) THE SYSTEM SHALL show a "Start wave N" button, where N is the next wave number.
- **AC-6.2** WHEN the player presses "Start wave N" THE SYSTEM SHALL hide the button and spawn that wave's enemies in the exact order and spawn gaps listed in BR-10.
- **AC-6.3** WHEN every enemy of the current wave has died or reached the exit, and lives are above 0, and the wave was wave 1 or 2, THE SYSTEM SHALL award the end-of-wave gold bonus, show "Wave N cleared!" and return to the build phase for the next wave.
- **AC-6.4** THE SYSTEM SHALL make each wave harder than the previous one through more enemies, faster or tougher enemy types, and shorter spawn gaps, as defined in BR-10.
- **AC-6.5** WHEN a wave starts THE SYSTEM SHALL play a wave-start sound and show "Wave N" on screen for 1.5 s (±0.2 s).
- **AC-6.6** Timed check: WHEN a player presses Start, presses each "Start wave N" within 5 s of it appearing, and survives all 3 waves THE SYSTEM SHALL reach the Victory screen 150–240 s after Start was pressed.

### US-7: Status display (HUD) · Priority: Must · Traces to: Brief §7
As a **player**, I want **to always see my lives, gold and the current wave** so that **I can make decisions**.

**Acceptance criteria**
- **AC-7.1** WHILE a run is in progress THE SYSTEM SHALL show lives, gold and "Wave N / 3" on screen at all times, never hidden by the map or the picker. N is the current wave during a wave and the next wave during a build phase (so "Wave 1 / 3" before the first wave).
- **AC-7.2** WHEN lives or gold change THE SYSTEM SHALL update the displayed value within the same frame.
- **AC-7.3** THE SYSTEM SHALL draw the HUD in code using colours taken from the Kenney pack. The PO judges the match against a reference screenshot (brief A1).

### US-8: Win, lose and restart · Priority: Must · Traces to: Brief §4, §7
As a **player**, I want **a clear result at the end and a way to play again** so that **the run feels finished and I can retry**.

**Acceptance criteria**
- **AC-8.1** WHEN lives reach 0 THE SYSTEM SHALL stop the run immediately and show a "Defeat" screen reading "Defeated on wave N" (N as in AC-7.1) and a Restart button.
- **AC-8.2** WHEN every wave-3 enemy has died or reached the exit and lives are above 0 THE SYSTEM SHALL show a "Victory" screen with the lives remaining and a Restart button.
- **AC-8.3** WHEN a result screen appears THE SYSTEM SHALL freeze the battlefield behind it (no movement, firing or sounds from it), stop the music and play the matching victory or defeat jingle.
- **AC-8.4** WHEN the player presses Restart THE SYSTEM SHALL start a new run: all towers, enemies and projectiles removed; lives, gold and wave number back to their starting values; music restarted; build phase before wave 1.
- **AC-8.5** IF lives reach 0 and the last wave-3 enemy dies in the same frame THEN THE SYSTEM SHALL show Defeat.

### US-9: Sound effects and music · Priority: Must · Traces to: Brief §5 (polish: "sound effects and music present"), §7
As a **player**, I want **sound effects and background music** so that **the game feels alive**.

**Acceptance criteria**
- **AC-9.1** THE SYSTEM SHALL generate all sounds in code, with no audio files.
- **AC-9.2** THE SYSTEM SHALL play distinct sounds for at least these events: tower built, Archer shot, Cannon shot, cannonball explosion, enemy death, life lost, wave start, victory and defeat.
- **AC-9.3** WHEN the player presses Start or Restart THE SYSTEM SHALL begin looping background music, and SHALL keep it playing across waves and build phases until a result screen appears.
- **AC-9.4** THE SYSTEM SHALL NOT start any sound before the player's first click or tap (browsers block audio until then).
- **AC-9.5** THE SYSTEM SHALL show a mute toggle during a run that silences all sound and music when on and restores it when off. The setting SHALL stay the same across Restart within the same page load. *(Should)*
- **AC-9.6** THE SYSTEM SHALL play at most 4 copies of the same sound at once, and skip any extra copies. *(Should)*

### US-10: Works on phones and desktop · Priority: Must · Traces to: Brief §5 (platform coverage), §2
As a **player on a phone or a computer**, I want **the game to fit my screen and respond to touch or mouse** so that **I can play wherever I opened the link**.

**Acceptance criteria**
- **AC-10.1** THE SYSTEM SHALL support every interaction (Start, build, pick tower, cancel, start wave, mute, Restart) with a single click (mouse) or a single tap (touch). No hover, right-click, keyboard, drag or multi-touch SHALL be required.
- **AC-10.2** On a 360×640 viewport THE SYSTEM SHALL give every button a tap area of at least 44×44 CSS px. Each build spot SHALL respond to a tap within 22 CSS px of its centre, even if the drawn tile is smaller. Spot tap areas SHALL NOT overlap.
- **AC-10.3** WHEN the browser window is resized or the phone is rotated THE SYSTEM SHALL re-fit the game to the new viewport within 0.5 s without restarting the run.
- **AC-10.4** WHILE a run is in progress on a touch device THE SYSTEM SHALL NOT scroll, zoom or select text on the page when the player taps or double-taps the game.
- **AC-10.5** WHEN the browser tab becomes hidden THE SYSTEM SHALL pause the game and silence sound. WHEN the tab becomes visible again it SHALL resume from the same state and restore the player's own mute setting.

## 3. Business rules
| ID | Rule | Source |
|---|---|---|
| BR-1 | A run starts with *10* lives and *100* gold. | RD-1 (lives and gold); values RD-5 |
| BR-2 | Gold is only earned by killing enemies and from end-of-wave bonuses. Gold is only spent on building towers. | RD-1 |
| BR-3 | Towers can only be built on empty marked build spots. Each spot holds one tower. | RD-2 (marked spots) |
| BR-4 | Towers can't be sold, moved or upgraded. | RD-4; Brief §7 out of scope |
| BR-5 | Waves start only when the player presses "Start wave N". There is no automatic timer. | RD-4 |
| BR-6 | Exactly 3 waves. Surviving wave 3 with lives > 0 is a win; lives reaching 0 at any time is a loss. | Brief §7 |
| BR-7 | Each enemy that reaches the exit costs its life cost (Grunt 1, Runner 1, Brute *2*). Lives never go below 0. | RD-1; Brute value RD-5 |
| BR-8 | Nothing is saved between page loads. | Brief §7 out of scope |
| BR-9 | Kenney art is credited on the start screen. | Brief §6 |
| BR-10 | Starting balance values below; tunable during playtest. | RD-5 |

**Decision log (PO answers in the requirements interview, 2026-10-04):** RD-1 lives and gold economy · RD-2 towers on marked build spots only · RD-3 Archer and Cannon towers · RD-4 the player starts each wave; no selling · RD-5 BR-10 values are tunable starting values (REQ-1) · RD-6 Must/Should priority split (REQ-2) · RD-7 required browsers: desktop Chrome and iPhone Safari (REQ-3).

**BR-10 starting balance** (speeds in tiles per second; fire rate in shots per second)

| Item | Cost / reward | Health | Speed | Damage | Range (tiles) | Fire rate | Other |
|---|---|---|---|---|---|---|---|
| Archer | 50 gold | — | arrow 8 | 10 | 2.5 | 1.5 | single target, homing arrow |
| Cannon | 80 gold | — | cannonball 5 | 25 | 2.0 | 0.5 | splash radius 1.0 tile, homing cannonball |
| Grunt (G) | +5 gold | 40 | 0.8 | — | — | — | costs 1 life |
| Runner (R) | +6 gold | 25 | 1.6 | — | — | — | costs 1 life |
| Brute (B) | +15 gold | 160 | 0.5 | — | — | — | costs 2 lives |

| Wave | Exact spawn order | Spawn gap | End-of-wave bonus |
|---|---|---|---|
| 1 | G×10 | 1.5 s | +40 gold |
| 2 | (G, R)×8, then G, G | 1.1 s | +60 gold |
| 3 | (G, R)×10, then G, G, then a 2 s pause, then B×4 | 0.9 s | — |

If the Brute is cut (it is a Should), wave 3 ends after the last G. Rough timing check with a 24-tile path: wave 1 ≈ 15 s spawning + 30 s walking ≈ 45 s; wave 2 ≈ 20 + 30 ≈ 50 s; wave 3 ≈ 25 + 48 (Brute) ≈ 73 s. Adding ≈ 15 s of build phases gives ≈ 183 s, inside AC-6.6's 150–240 s.

## 4. Non-functional requirements
| ID | Category | Requirement (measurable) |
|---|---|---|
| NFR-1 | Performance | Runs at ≥ 55 fps in desktop Chrome and ≥ 30 fps on the PO's iPhone (Safari) during wave 3 at peak (≈ 26 enemies + 10 towers on screen). |
| NFR-2 | Load time | From opening the URL to the Start button showing: ≤ 5 s on a 10 Mbps connection. Total download ≤ 5 MB. |
| NFR-3 | Browser support | **Must:** fully playable in the latest desktop Chrome and in Safari on the PO's iPhone. *(Should)* playable in the latest desktop Edge, Firefox and Safari, and Chrome on Android. |
| NFR-4 | Privacy / security | No accounts, cookies, tracking or analytics. The game makes no network requests other than loading its own files. No secrets in the client. |
| NFR-5 | Hosting | Runs fully as static files: locally (dev server) first, then on Vercel. No backend. |
| NFR-6 | Licensing | Every asset used is CC0 or credited. The Kenney credit is visible (BR-9). |
| NFR-7 | Readability | HUD text is at least 14 CSS px on a 360×640 viewport. Text keeps at least 4.5:1 contrast against its background. |
| NFR-8 | Stability | No uncaught errors in the browser console during a full run (Start → Victory, Start → Defeat, then Restart) on the NFR-3 Must browsers. |
| NFR-9 | Delivery | Playable build running locally before the deploy discussion, and live before 2026-10-05 20:00 Pacific. |

## 5. Out of scope
- Accounts, logins, online leaderboards
- Saving progress, scores or settings between page loads
- More than one map; level select
- More than 2 tower types; tower upgrades, selling or moving
- Settings or menus beyond Start, Restart and the mute toggle
- Fast-forward, a pause button, keyboard shortcuts, hover-only features
- Audio files or extra downloaded art packs

## 6. Open questions (need a PO decision)
- [x] Q1 (REQ-1) — **Accepted.** Do you accept the BR-10 balance numbers, the 8×8 map, the ~24-tile path and the 10 build spots as **starting values that may be tuned during playtesting** without re-approval, as long as AC-6.4 (each wave harder) and AC-6.6 (150–240 s) still hold?
- [x] Q2 (REQ-2) — **Accepted.** Do you accept the proposed priority split, so a playable game comes first? **Should:** Brute enemy, range circles, floating gold text, lives flash, mute toggle, sound limit. **Must:** everything else, **including music** (it is in the brief's success metric).
- [x] Q3 (REQ-3) — **Accepted; the PO's phone is an iPhone with Safari.** Do you accept testing **desktop Chrome plus your own phone** as the required browsers, with the other browsers as best effort? Which phone and browser do you have?

## 7. Traceability
| AC | Story | Brief metric / section |
|---|---|---|
| AC-1.1–1.6 | US-1 | §7 Start screen; §5 playable; §6 Kenney credit |
| AC-2.1–2.5 | US-2 | §7 one map, visual style; §5 polish; §8 R4 |
| AC-3.1–3.10 | US-3 | §7 1–2 towers; §4 hypothesis |
| AC-4.1–4.7 | US-4 | §7 towers; §4 hypothesis |
| AC-5.1–5.8 | US-5 | §7 enemies drawn in code; §4 |
| AC-6.1–6.6 | US-6 | §5 playable length (3 waves, ~3 min); §8 R2 |
| AC-7.1–7.3 | US-7 | §7 UI drawn in code; §8 A1 |
| AC-8.1–8.5 | US-8 | §7 win/loss, Restart; §4 |
| AC-9.1–9.6 | US-9 | §5 audio polish; §7 sound in code; §8 R3 |
| AC-10.1–10.5 | US-10 | §5 platform coverage; §2 users; §8 A2 |
| NFR-1–3, 7, 8 | all | §5 platform coverage, polish |
| NFR-5, 9 | all | §5 game deployed; §6 constraints |
