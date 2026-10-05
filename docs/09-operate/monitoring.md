# Post-release Health Check — Tower Defense v1.0

| Field | Value |
|---|---|
| Checked | 2026-10-04 23:10 PDT |
| Production | https://tower-defense-weld.vercel.app (deployment `xwrcineit`, promoted from preview `jow2r52qf`) |
| Rollout stage | Production: 100% (a single static site, no flags) |
| Incidents | RCA-2026-01 (resolved): the first deploy went to production without art for ≈ 2 minutes |

## Health vs. expectations
| Check | Expectation | Observed | Status |
|---|---|---|---|
| Page + JS | 200 | 200 (0.11 s, 0.15 s) | ✅ |
| All atlases (3 PNG + 3 XML) | 200 | 200 (0.08–0.17 s) | ✅ |
| Download size (NFR-2) | ≤ 5 MB, ≤ 5 s at 10 Mbps | ≈ 0.85 MB transferred | ✅ |
| Headers (REV-2) | `X-Content-Type-Options: nosniff` | present, plus Vercel HSTS | ✅ |
| Private files not exposed (NFR-4) | 404 | `/docs/…`, `/.sdlc/state.json`, `/.env.local`, raw art pack: all 404 | ✅ |
| Console errors (NFR-8) | none | none on load / Start / picker (Chrome) | ✅ |
| Deployments | Ready | `vercel ls`: production `xwrcineit` Ready | ✅ |
| Real device on production | full game on iPhone | **pending (Pino)** | ⏳ |

There's no runtime telemetry by design (NFR-4: no analytics). Health here means "loads and plays", checked manually and with `curl`.

## Success metric vs. the brief (§5)
| Metric | Target | Status |
|---|---|---|
| Game finished and playable locally | full playthrough | ✅ (M1–M4, T-12) |
| Game deployed | live on Vercel before 2026-10-05 20:00 Pacific | ✅ live 2026-10-04 23:04 PDT, about 21 h early |
| Playable length | 3 waves, ~3 min | ✅ 169–213 s across scripted players (AC-6.6) |
| Platform coverage | desktop + mobile | ✅ desktop Chrome and iPhone Safari (local); production iPhone check pending |
| Visual/audio polish | consistent art, sound and music | ✅ (PO accepted at demos) |

## Open defects
None. RCA-2026-01 is resolved; its follow-ups F-2/F-3 go to the Knowledge phase, and F-4 is optional.

## Recommendation
**Hold at production (stable). No rollback needed.** Remaining human actions:
1. Pino plays one full game on the production URL on the iPhone.
2. Submit the production link to the jam.

If a problem shows up, `vercel rollback` returns to the previous production deployment. Note: the only earlier production deployment is the broken first one, so it's better to fix forward and redeploy.
