# Problem Brief — Tower Defense Project (Game Jam Entry)

| Field | Value |
|---|---|
| Requested by | Pino |
| Product Owner | Pino |
| Date | 2026-10-04 |
| Jam deadline | 2026-10-05 20:00 Pacific |
| Status | In review |

## 1. Problem statement
Pino wants to enter a 48-hour game jam, working solo, with a finished, cool-looking browser tower defense game. The entry must be finished and playable by the deadline, look polished, and run for anyone who opens the link on desktop or mobile. Pino can't make sprites, so the art comes from the Kenney "Tower Defense (isometric)" pack (CC0) in `assets/kenney_tower-defense`. There is no external evidence such as player data; this is a creative goal measured by finishing and polishing the game.

## 2. Affected users & stakeholders
- Primary users: Anyone with the link, playing in a web browser on a desktop/laptop (mouse) or a mobile phone (touch).
- Secondary / impacted: Game jam judges and participants (they rate the entry); Pino (solo developer, artist and designer).

## 3. Why now
The jam has a fixed 48-hour window that ends at **2026-10-05 20:00 Pacific**. If the game isn't finished and deployed when it closes, there is no entry. Scope has to stay small enough to finish and polish in time.

## 4. Hypothesis
We believe that **a short, polished 8-bit tower defense game with 3 escalating waves on one map, playable in any browser** for **people opening a jam link** will result in **a complete, enjoyable jam entry**. We will know we are right when **the game runs locally, and then on Vercel, before 2026-10-05 20:00 Pacific, and a player can play from Start through all 3 waves (about 3 minutes) on desktop and mobile without blocking bugs.**

## 5. Success metrics
| Metric | Baseline | Target | Measured how / when |
|---|---|---|---|
| Game finished and playable locally | Nothing exists | Full playthrough works on local dev server | Before deploy discussion |
| Game deployed | Nothing exists | Live Vercel URL before 2026-10-05 20:00 Pacific | Deadline check |
| Playable length | 0 | 3 waves, each harder than the last; about 3 minutes of play to survive | Timed playthrough |
| Platform coverage | — | Fully playable on desktop browser (mouse) and mobile browser (touch) | Manual playthrough on 1 desktop + 1 phone |
| Visual/audio polish | — | Consistent art style (Kenney low-poly isometric), sound effects and music present | Self-review before submission; jam ratings afterwards |

## 6. Constraints
- Business / contractual: Game jam rules: none beyond the time limit (any tools, engines and assets allowed).
- Regulatory / compliance: Assets must have licences that allow use in the jam entry. The Kenney pack is CC0; credit Kenney anyway (optional but nice). Any extra assets must also be CC0 or credited.
- Technical / legacy systems: Must run in the browser on desktop and mobile. Built and tested **locally first**; the Vercel deployment is decided afterwards. No backend is needed.
- Assets on hand (Kenney Tower Defense, isometric, CC0): 40 isometric landscape tiles (grass, dirt path pieces, water, bridges, slopes; 132×99 px), 24 details (trees, rocks, crystals), and modular stacking tower pieces in 3 colours (grey/brown/red, 55 each: bases, middles, tops, roofs). PNGs plus spritesheets with XML atlases. **Not included: enemies, projectiles, effects, UI/HUD and audio.**
- Timeline / capacity: 48 hours total (ends 2026-10-05 20:00 Pacific), one developer. Pino can't make sprites.

## 7. Scope
**In scope (first release):**
- One map with a fixed enemy path
- 3 waves of increasing difficulty (about 3 minutes of total play), ending in a win or a loss
- 1–2 simple tower types
- Visual style: Kenney low-poly isometric pack for map, scenery and towers; enemies, projectiles, effects and UI drawn in code to match
- Sound effects and music synthesized in code (no audio files)
- Start screen and Restart (after a win or loss)
- Mouse and touch controls; layout that fits phone screens

**Out of scope:**
- Accounts, logins, online leaderboards
- Saving progress between sessions
- Multiple maps
- Tower upgrade trees or more than 2 tower types
- Settings or menus beyond Start/Restart

## 8. Assumptions & risks
| # | Assumption or risk | Impact if wrong | How we'll validate |
|---|---|---|---|
| A1 | Code-drawn enemies, projectiles and UI can look consistent next to the Kenney sprites | Mismatched look hurts the "cool looking" goal | Use the same flat, low-poly colour palette as the pack; review a screenshot early |
| A2b | Sound synthesized in code sounds good enough for a jam | Sound feels thin or annoying | Keep effects short; add a mute toggle only if time allows |
| R4 | Isometric rendering (depth sorting, converting screen taps to tiles) is harder than a flat grid | Time lost on rendering and input bugs | Address in design; keep the map small and fixed |
| A2 | One codebase can handle both touch and mouse placement on small screens | Mobile is unplayable, which loses part of the audience | Test on a real phone early (first deploy) |
| R1 | 48 hours solo is tight for gameplay + art + audio + mobile | Unfinished entry | Get a playable game with placeholder graphics working first, then polish; deploy to Vercel early and often |
| R2 | Wave balance (too easy or too hard) | Players finish too quickly, or no one survives the 3 minutes | Do several timed playthroughs before submitting |
| R3 | Audio autoplay is blocked on mobile browsers | Silent game on phones | Start audio after the first tap on Start |

## 9. Open questions (need a human decision)
- [x] ~~Art source~~: Kenney Tower Defense (isometric) pack, CC0 (DIS-1).
- [x] ~~Deadline~~: 2026-10-05 20:00 Pacific; local first, Vercel afterwards (DIS-2).
- [x] ~~Art style~~: drop 8-bit; use the Kenney low-poly isometric look (DIS-3).
- [x] ~~Missing assets~~: enemies, projectiles, effects and UI drawn in code; sound effects and music synthesized in code (DIS-4).

No open questions remain.
