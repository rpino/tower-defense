# Tower Defense Project — Agentic SDLC rules

This project follows the **Agentic SDLC** process (sdlc-core plugin).

## Always
- Before doing any work, read `.sdlc/state.json` (or run `/sdlc-core:status`) to know the current phase.
- Work only on the current phase. Never skip ahead.
- Every phase produces its artifact in `docs/NN-<phase>/`. The artifact of one phase is the input of the next.
- Every requirement, design element, task, test and PR must trace back to an acceptance criterion ID (e.g. `AC-1.2`).
- When you finish a phase artifact, set it to `in_review` and STOP. A human approves with `/sdlc-core:approve`.
- If you find a gap in an earlier phase (missing AC, wrong design), reopen that phase — don't silently patch around it.

## Never
- Never edit `.sdlc/state.json` directly. Use the sdlc-core skills.
- Never approve a phase on a human's behalf.
- Never write code under `src/`, `app/`, `lib/`, `tests/` … before Planning is approved (a hook enforces this).
- Never commit code without a test change (a hook enforces this).

## Standing rules learned on this project
<!-- sdlc-knowledge:knowledge-updater appends lessons here after each retro -->
- Treat a Vercel project's first `vercel deploy` as a production deploy (it needs the production go/no-go). (RCA-2026-01, SR-1)
- Anchor deploy/ignore-file patterns to the root (`/dir/`) unless any-depth matching is intended; keep `tests/vercelignore.test.ts` proving `public/` ships. (RCA-2026-01, SR-2)
- A deploy is done only when the page and every asset URL return 200 on the deployed URL (`vercel curl` for protected previews). (RCA-2026-01, SR-3)
- Every new test must be able to fail; never assert a call's result against the same call. (QA DEF-03, SR-4)
- Never import an audio library that creates an `AudioContext` at module load; create the context only inside a native `pointerup`/`touchend` handler. (T-1/T-9, SR-5)
- Any change to `src/config/balance.ts` must keep `tests/balance.test.ts` green (every scripted winning player takes 150–240 s). (T-11, SR-6)
- After git operations that remove or re-create `public/` (branch switches, fast-forwards), restart the dev server before any browser check. (Review re-check, SR-7)
- Jam-size projects: keep each phase document to about one page, and merge Design and Planning into one "design + task list" document with one approval. (Retro, SR-8)
