# Release Plan — Tower Defense v1.0 (Game Jam Entry)

| Field | Value |
|---|---|
| Target date | Live before **2026-10-05 20:00 Pacific** (jam deadline, NFR-9) |
| Feature flag | None. A jam game ships whole; the "rollout" is preview → production (below) |
| Release owner | Pino (runs the Vercel login; approves each deploy) |
| Deploys executed by | Claude, through the Vercel CLI, only after Pino's explicit go for each step |
| Go/no-go approver | Pino (Product Owner) |
| Build | `main` @ ec0be0f + release commit (vercel.json, .vercelignore) |

## Scope
| Included | Deferred / out of scope |
|---|---|
| All Must stories US-1 … US-10 (AC-1.1 … AC-10.5) | Accounts, saving, leaderboards, extra maps, upgrades/selling, settings (brief §7) |
| All Should items: Brute, range circles, floating gold, lives flash, mute toggle, sound limit (AC-3.10, 5.2 Brute, 5.5, 5.7, 9.5, 9.6) | Content-Security-Policy (REV-2: `nosniff` only) |
| High-DPI rendering (T-15), `?debug=1` overlay | Should-browser testing (Edge, Firefox, desktop Safari, Android Chrome): untested, low risk |

## Rollout stages
| Stage | Audience | How | Advance when | Owner |
|---|---|---|---|---|
| 0. Setup | — | Pino: `! npm i -g vercel`, `! vercel login`. Claude: `vercel link` (creates or links the project; Vite is auto-detected) | CLI logged in, project linked | Pino |
| 1. Preview | Pino only | Claude: `vercel deploy` (preview URL) | Smoke checklist below passes on desktop Chrome **and** iPhone Safari | Pino |
| 2. Production | Anyone with the link (jam) | Claude: `vercel deploy --prod` (or `vercel promote <preview-url>`) | Production smoke test passes; link submitted to the jam | Pino |

**Note:** new Vercel projects often turn on *Deployment Protection* (Vercel Authentication) for **preview** URLs. Pino can open them while logged in, but other people get a login page. The **production** URL is public by default, so share only the production link with the jam.

## Pre-flight checklist
- [x] No migrations, secrets or environment variables needed (static site, NFR-4/5)
- [x] `vercel.json`: framework `vite`, `npm run build`, output `dist/`, header `X-Content-Type-Options: nosniff` (tested in `tests/vercel.test.ts`)
- [x] `.vercelignore` keeps the raw art pack, docs and SDLC state out of the upload
- [x] Production build passes locally: 142/142 tests, type check clean, ≈ 0.85 MB transferred
- [x] Credits in game and README (NFR-6)
- [ ] Vercel CLI installed and logged in (Pino)
- [ ] Release notes read by Pino (`docs/08-release/release-notes.md`)

## Smoke checklist (preview, then production)
1. URL loads over HTTPS; loading bar → title. No console errors (desktop DevTools).
2. Response headers include `x-content-type-options: nosniff` (Claude checks with `curl -I`).
3. Start → music; build an Archer and a Cannon; start wave 1; kills give "+N" gold.
4. iPhone Safari: taps land on the right spots, no zoom or scroll, sound plays, sharp rendering.
5. Restart after a result screen works.

## Monitoring
- **Health:** this is a static site, so health means the URL loads. Use the Vercel dashboard (deployment status, build logs) and a manual smoke test after each deploy. There's no in-game analytics by design (NFR-4), and `?debug=1` gives an on-device FPS check.
- **Success metric (brief §5):** game live on Vercel before 2026-10-05 20:00 Pacific, and a full 3-wave playthrough works on desktop and mobile. Afterwards: jam ratings.

## Rollback
1. **Production broken after a deploy:** `vercel rollback` (instantly restores the previous production deployment), or in the dashboard choose Deployments → the previous one → "Promote". Pino can trigger it from the dashboard; Claude can run the CLI command on Pino's go.
2. **First production deploy broken** (nothing to roll back to): fix on `main`, redeploy the preview, re-run the smoke checklist, then promote.
3. **Data implications:** none. Nothing is stored server-side or client-side.

## Go / No-go
- Preview deploy: ____ by Pino on ____
- Production deploy: ____ by Pino on ____
