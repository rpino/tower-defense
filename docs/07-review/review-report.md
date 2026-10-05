# Review Report — Tower Defense Project (Game Jam Entry)

**Scope:** all of `src/`, `index.html`, `vite.config.ts` and `package.json` on `main` @ 6d807a4 (T-1 … T-16 plus QA). There is no remote, so no PRs. Each task was one commit on a stacked `feature/T-n-*` branch, all fast-forwarded into `main`. **Reviewer:** Claude (AI first pass). **Human approver:** Pino (Tech Lead).

| Commits | Tasks | ACs | Reviewer (AI first pass) | Human approver | Decision |
|---|---|---|---|---|---|
| f30c997 … 49befcc | T-1 … T-16 | all of US-1 … US-10, NFR-1 … 9 | Claude | Pino | Approve, pending the minor fixes decision (REV-1) |
| 6d807a4 | QA tests | boundary cases | Claude | Pino | Approve |

## Findings
| ID | File:line | Severity | Finding | Suggested fix | Status |
|---|---|---|---|---|---|
| R-01 | `src/audio/audio.ts:92-105` | Minor | `play()` starts buffer sources while the AudioContext isn't `running` (e.g. iOS `interrupted`, or suspended while the tab is hidden). Their `onended` doesn't fire until resume, so a key can hit the 4-copy cap, and the queued sounds play as a burst when audio resumes. | Return early from `play()` when `ctx.state !== 'running'`, and add a unit test with the fake context. | Open (REV-1) |
| R-02 | `src/audio/music.ts:96-100` | Nit | `jingle()` cancels only notes that haven't started, so up to ~0.25 s of already-started music overlaps the jingle's start. | Accept; it's barely audible. Alternatively, fade the music bus over 50 ms. | Accept as-is |
| R-03 | `src/scenes/UIScene.ts:206,234-235` | Nit | Picker option geometry is computed twice: `openPicker` (with dead arithmetic `(PICKER_SIZE.optionW + 0) + (i ? 0 : 0)`) and again in `paintPicker`. The two could drift apart. | Extract `pickerOptionRect(i)` into `render/hud.ts` and use it in both places. | Open (REV-1) |
| R-04 | `src/main.ts:19-24, 34-39` | Nit | The initial size comes from `window.innerWidth/innerHeight`; later resizes use `#game` client size. On iOS the two can differ (address bar / `100dvh`) until the first resize event. | Size from `#game` at startup as well. | Open (REV-1) |
| R-05 | `index.html:6` | Minor (accepted) | `maximum-scale=1, user-scalable=no` blocks page zoom (WCAG 1.4.4). This is deliberate: AC-10.4 requires no zoom during play. | None; requirement-driven. | Accept (AC-10.4) |
| R-06 | `src/main.ts:14` | Nit | Phaser prints its console banner in production. It isn't an error, but clutters the console. | `banner: false` in the game config. | Optional |
| R-07 | `src/sim/step.ts:38-41` | Info | `pathPoint()` is called per tower × enemy every step (≈ 7k calls/s at the peak of 12 enemies and 10 towers). That's fine at this scale; NFR-1 passed on iPhone. | None now. If enemy counts grow, cache each enemy's position once per step. | No action |

**Correctness:** the step order is spawn → move/leak → fire → projectiles → end check, with defeat checked before victory (AC-8.5). Rewards are credited once (the `hp <= 0` guard in `damage()`). Commands leave the state untouched when they refuse. The Start/Restart tap is not passed through to the map (`downTime < runStartedAt`). Taps on UI are excluded through `isOverUi`, with DPR-correct coordinates.

**Tests:** meaningful per AC (see `docs/06-qa/test-report.md`); one tautological test was removed in QA.

**Design conformance:** every deviation is recorded in the build log, and none needs a new ADR:
- T-2: offline atlas contact sheets instead of an in-game atlas scene.
- T-8: `isOverUi` plus `downTime` instead of a "consumed" flag.
- T-9: a vendored ZzFX `buildSamples` instead of the npm package, within ADR-003.
- T-15: `Scale.NONE` with manual resize instead of `Scale.RESIZE`, for high-DPI rendering.

**Conventions:** consistent naming; comments cite ACs; no dead code apart from R-03; no debug leftovers in the production build (dev handles stripped; `?debug=1` overlay by design).

## Security
| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Access control | N/A | No endpoints or backend; static files only (NFR-5) |
| 2 | Authentication & session | N/A | No accounts (brief §7 out of scope) |
| 3 | Input validation | Pass | The only external inputs are `?debug` (string equals `'1'`, `render/debug.ts:2`) and `?dpr` (parsed as a number, non-finite rejected, clamped to 1–2, `render/dpr.ts:5-10`, tested), plus pointer coordinates handled by Phaser |
| 4 | Injection / XSS | Pass | No `innerHTML`, `document.write`, `eval` or `new Function` anywhere in `src/` or `index.html`. All text is drawn to canvas by Phaser |
| 5 | Secrets | Pass | Scan for key/secret/token/password found nothing; no `.env` files |
| 6 | Sensitive data / PII | Pass | No storage, cookies, analytics or network requests (code scan in QA, TC-66) |
| 7 | Dependencies | Pass | `npm audit`: 0 vulnerabilities (all and prod-only). Prod dependency: `phaser@3.90.0` (MIT, pinned). ZzFX code vendored with its MIT notice |
| 8 | Error handling | Pass | Users see friendly messages only ("Couldn't load the game — please refresh"; silent audio fallback). Details go to `console.error` |
| 9 | Logging & audit | N/A | No security-relevant actions |
| 10 | Abuse cases | Pass | No scores, leaderboards or economy outside the browser, so client tampering only affects the tamperer |
| 11 | Configuration | Low | No security headers configured (CSP, `X-Content-Type-Options`, `frame-ancestors`). Vercel serves static files over HTTPS by default. Optional hardening: a `vercel.json`/`vercel.ts` with `X-Content-Type-Options: nosniff` and a CSP of `default-src 'self'; style-src 'self' 'unsafe-inline'`, tested before release because Phaser uses inline styles and blob/data URLs for textures |

**Security findings:** one **Low** (S-01, check 11, missing security headers), which is optional for a static game with no data. **No Critical/High/Medium.**

## Sign-off
- [x] No open Blocker/Major findings
- [x] No open Critical/High security findings
- [ ] Decision REV-1: fix R-01, R-03 and R-04 before release (≈ 15 min, with a test for R-01), or accept them as-is
- Approved by: ____ on ____
