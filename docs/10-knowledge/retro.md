# Retrospective — Tower Defense v1.0 (48-hour game jam)

| Field | Value |
|---|---|
| Period | 2026-10-04 20:04 → 23:14 PDT (from `.sdlc/state.json` history) |
| Participants | Pino (PO, Tech Lead, QA Lead), Claude (agent) |
| Outcome | Live at https://tower-defense-weld.vercel.app on 2026-10-04 23:04 PDT, about 21 h before the 2026-10-05 20:00 deadline |

## Metrics
| Metric | Value | Notes |
|---|---|---|
| Total cycle time | **3 h 00 m** from project created to production live; 3 h 10 m to Operate approved | |
| Phase time (draft → approved) | Discovery 19 m · Requirements 7 m · Design 11 m · Planning 5 m · **Build 82 m** · QA 5 m · Review 8 m · **Release 40 m** · Operate 4 m | Build covered 16 tasks. Release included the CLI install/login and the incident |
| Reopen events | **0** | No later phase sent work back to an earlier one |
| Revision cycles (in review → draft) | 5 (Discovery 2, Requirements 1, Design 1, Review 1) | All were driven by PO answers to open questions, not rework |
| Human decisions recorded | 11 open issues raised, 11 resolved (DIS-1…4, REQ-1…3, DES-1, REV-1…2, OPE-1) plus RD-1…7 decision log | |
| Gaps caught before production | **Requirements review:** 15 findings (2 critical: phone tap targets vs. map fit; untestable run length). **Design review:** 12 (1 critical: run length set by spawn time; false spot-spacing claim). **Build:** DEF-01 (stuck loading bar), DEF-02 (Cannon a trap, game too easy, caught by the headless balance test). **QA:** DEF-03 (tautological test). **Code review:** 7 findings (3 fixed, 0 Blocker/Major). **Security:** 1 Low | |
| Escaped defects | **1**: RCA-2026-01, first deploy to production without art, ~2 min, likely 0 users | Found by the agent's own post-deploy check in < 1 min |
| Automated tests | 145 (22 files), 0 flaky over 4 runs | |
| Commits | 30, one per task plus phase docs | |

## What went well
- **Upfront decisions (Pino).** Short rounds of decisions saved rework later: art source and style (DIS-1…4), game rules (lives, gold, spots, waves), priorities and test devices (REQ-1…3), spot spacing (DES-1). There were no reopens at all.
- **Speed to live (Pino).** Live about 21 hours early. Reviewing per milestone (M1–M4), instead of after every task, kept the build moving.
- **The headless balance test** found a real design problem (Cannon not worth buying; 2 Archers won the game) that playtesting might have missed, and made retuning safe.
- **Independent reviewer agents** found critical issues on paper: in requirements, phone tap targets that couldn't fit with the whole map on screen; in design, the run-length estimate (spawn time, not walking time), before any code existed.
- **Device pass on real iPhone Safari** confirmed audio unlock, touch and high-DPI rendering with no surprises.

## What didn't
- **Documents were longer than a jam needs (Pino).** Requirements (52 ACs), the design (plus 3 ADRs) and QA (71 TCs) were thorough, but heavy to read for a 48-hour solo project.
- **Design and Planning gates felt like overhead** for a project this size (Pino would keep Discovery/Requirements, QA/Review and Release/Operate/Retro).
- **Release incident (RCA-2026-01):** an unanchored `.vercelignore` pattern, plus Vercel sending a project's first deploy to production.
- **Browser automation was unreliable** for real-time checks. The first click after navigation sometimes didn't register, frames were stale in throttled tabs, and a long-running dev server served stale `public/` files after git branch operations. Workarounds (stepping frames from script, `vercel curl`, restarting the server) cost time.

## Where AI helped / missed
| Phase | Helped | Missed |
|---|---|---|
| Discovery | Spotted that the Kenney pack is isometric low-poly, not 8-bit, and has no enemies, UI or audio (DIS-3/4) | Stale "8-bit" wording was left in the approved brief §4 (noted downstream) |
| Requirements | Reviewer agent: 15 findings, including 2 critical | — |
| Design | Reviewer agent: 12 findings, including the run-length math and a false spot-spacing claim | — |
| Build | ZzFX imports a live AudioContext at load (found in T-1); load-error bug (T-6); balance problems (T-11) | Wrote one test that could never fail (caught in QA); a wrong coverage count in the first QA draft (self-corrected) |
| QA / Review | Boundary tests; removed the tautological test; 3 minor fixes (R-01 audio while suspended) | — |
| Release | Detected the broken production deploy within a minute, fixed it and verified before promoting | Didn't check Vercel's first-deploy-to-production behaviour; unanchored ignore pattern with no test |

## Proposed standing rules
| # | Rule | Source | Decision |
|---|---|---|---|
| SR-1 | A Vercel project's **first** `vercel deploy` goes to production. Treat it as a production deploy (it needs the production go/no-go), or create the project and deploy a throwaway first. | RCA-2026-01 F-2 | **Adopted** (Pino, 2026-10-04) |
| SR-2 | Anchor ignore-file patterns to the root (`/dir/`) unless matching at any depth is intended, and keep a test asserting that `public/` ships (`tests/vercelignore.test.ts`). | RCA-2026-01 F-3 | **Adopted** (Pino, 2026-10-04) |
| SR-3 | Before saying a deploy is done, fetch the page **and every asset URL** on the deployed URL (`vercel curl` for protected previews) and require all 200s. | RCA-2026-01 | **Adopted** (Pino, 2026-10-04) |
| SR-4 | Every new test must be able to fail. Never assert a function's result against the same call (`f(x) === f(x)`). | QA DEF-03 | **Adopted** (Pino, 2026-10-04) |
| SR-5 | Never import an audio library that creates an `AudioContext` at module load. Create the context only inside a native `pointerup`/`touchend` handler (iOS). | T-1/T-9 finding | **Adopted** (Pino, 2026-10-04) |
| SR-6 | Any change to `src/config/balance.ts` must keep `tests/balance.test.ts` green (every scripted winning player takes 150–240 s). | T-11 | **Adopted** (Pino, 2026-10-04) |
| SR-7 | After git operations that remove or re-create `public/` (branch switches, fast-forwards from an older `main`), restart the dev server before any browser check. | Review re-check | **Adopted** (Pino, 2026-10-04) |
| SR-8 | For jam-size projects: keep each phase document to about one page, and merge Design and Planning into a single "design + task list" document with one approval. | Pino's retro feedback | **Adopted** (Pino, 2026-10-04) |

## Action items
| Action | Owner | Due |
|---|---|---|
| Play one full game on the production URL on iPhone | Pino | Before submitting to the jam |
| Submit https://tower-defense-weld.vercel.app to the jam, with the player text from `docs/08-release/release-notes.md` | Pino | Before 2026-10-05 20:00 PDT |
| Decide which standing rules SR-1 … SR-8 to adopt; Claude writes the adopted ones into `CLAUDE.md` | Pino → Claude | This phase |
| Optional: commit `.sdlc/state.json`. A project hook blocks shell edits to it, so the agent can't commit it | Pino | Any time |
