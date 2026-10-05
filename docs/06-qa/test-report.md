# Test Report — Tower Defense Project (Game Jam Entry)

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Build under test | `main` @ 49befcc (+ QA tests on `qa/test-pass`) |
| Test cases | docs/06-qa/test-cases.md (TC-01 … TC-71) |
| QA Lead | Pino |
| Recommendation | **Ready for review and release** |

## 1. Results
| Suite | Result |
|---|---|
| Automated (Vitest, 20 files) | **137 / 137 passed**, run 4 times in a row with no flakes |
| Type check (`tsc --noEmit`) | Clean |
| Production build | OK. `dist/` 1.8 MB on disk, ≈ 0.85 MB transferred |
| Manual (desktop Chrome, browser automation) | Checklists in the build log for T-6, T-7, T-8, T-9, T-10, T-13, T-14, T-15 and T-16: all pass |
| Device (Pino: desktop Chrome + iPhone Safari) | T-12 pass; re-checked after T-15 (high-DPI): pass |

## 2. AC coverage matrix
Every AC has at least one passing test case. Of the 62 functional test cases, **47 are automated**. The other **15** are visual or device-only and have recorded manual evidence: TC-01, 02, 04, 05, 10, 11, 15, 16, 31, 32, 36, 45, 46, 58 and 61 (covering AC-1.1, 1.2, 1.4, 1.5, 2.4, 2.5, 3.4, 3.5, 5.2, 5.3, 5.7, 7.2, 7.3, 10.1 and 10.4).

| Story | ACs | Automated | Manual / device only | Result |
|---|---|---|---|---|
| US-1 Start screen | 1.1–1.6 | 1.3, 1.6 | 1.1, 1.2, 1.4, 1.5 | ✅ |
| US-2 Battlefield | 2.1–2.5 | 2.1, 2.2, 2.3 | 2.4, 2.5 | ✅ |
| US-3 Build towers | 3.1–3.10 | 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 3.9, 3.10 | 3.4, 3.5 | ✅ |
| US-4 Towers attack | 4.1–4.7 | all (4.5 mapping automated; audible on device) | — | ✅ |
| US-5 Enemies | 5.1–5.8 | 5.1, 5.4, 5.5, 5.6, 5.8 | 5.2, 5.3, 5.7 | ✅ |
| US-6 Waves | 6.1–6.6 | all (6.5 banner duration manual) | — | ✅ |
| US-7 HUD | 7.1–7.3 | 7.1 | 7.2, 7.3 | ✅ |
| US-8 Result & restart | 8.1–8.5 | all | — | ✅ |
| US-9 Sound | 9.1–9.6 | all (audibility on device) | — | ✅ |
| US-10 Devices | 10.1–10.5 | 10.2, 10.3, 10.5 | 10.1, 10.4 | ✅ |

Non-functional: NFR-1 to NFR-8 pass. In NFR-3 only the Must browsers were tested. NFR-9 (live before the deadline) is pending the Release phase.

## 3. Tests added in QA
`tests/qa.test.ts`:
- **TC-QA-01/02:** building with exactly the cost, and with 0 gold.
- **TC-QA-03/04:** range edge ±0.05 tiles.
- **TC-QA-05:** Restart shares nothing with the previous run.
- **TC-QA-06:** wave-start numbering for every wave, and the wave 2 → 3 bonus.
- **TC-QA-07:** the `lifeLost` event reports the lives left.

## 4. False-green review
- **Removed:** the DPR test "same viewport gives the same layout" compared a function's output with itself, so it could never fail (DEF-03).
- **Weak but valid:** `mute.test.ts` "survives Restart" only checks the engine's own state. It holds by construction, because a code scan shows `GameScene` and `src/sim` never touch mute. The device pass also confirmed it.
- **Trivial by design:** `smoke.test.ts` checks the toolchain and BR-1 constants.
- No test mocks the unit under test. The audio tests use a fake AudioContext only as the platform boundary, and the music tests use a fake clock. Balance numbers that tests depend on are derived from `balance.ts`, not hard-coded, except where a test checks the tuned value itself (BR-1).

## 5. Defects
- Found during Build and fixed: **DEF-01** (load-error message never showed), **DEF-02** (balance: weak Cannon, game too easy).
- Found during QA and fixed: **DEF-03** (tautological test).
- **Open defects: none.**

## 6. Risks
| Risk | Level | Note |
|---|---|---|
| Should-browsers untested (Edge, Firefox, desktop Safari, Android Chrome) | Low | Same engine families; they're Should in NFR-3. Worth a quick open in Firefox or Edge after deploy if time allows |
| Difficulty for real players | Low–Med | Scripted players win with all 10 lives; Pino found it fine. Retuning is quick under RD-5 and the balance test keeps timing honest |
| Screens narrower than 360 px | Low | Outside the agreed range; tap areas shrink below 20 px |
| iPhone FPS at DPR 2 on older phones | Low | Pino's iPhone was fine. `?dpr=1` exists, and capping DPR at 1.5 is a one-line change |
| Automation-only quirk: first click after navigation sometimes not delivered | None for players | Not reproducible on real devices; noted in the build log |

## 7. Recommendation
**Ready.** All ACs pass, there are no open defects, and NFR-9 depends only on the deploy. Proceed to Review (code and security review), then Release (Vercel).
