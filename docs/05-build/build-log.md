# Build Log — Tower Defense Project (Game Jam Entry)

| Date | Task | Branch / PR | ACs covered | Tests added | Reviewed by | Notes |
|---|---|---|---|---|---|---|
| 2026-10-04 | T-1 | `feature/T-1-scaffold` (no remote; no PR) | NFR-4, NFR-5, AC-10.4 (page CSS) | `tests/smoke.test.ts` | — | See T-1 notes |

## T-1 notes
- **Stack:** Phaser 3.90.0 (pinned per ADR-001; npm `latest` is now Phaser 4.2.1, which we deliberately don't use), Vite 8.3.2, Vitest 5.0.3, TypeScript 5.9.3, zzfx 1.4.0.
- **Vite 8 / rolldown:** `rollupOptions.output.manualChunks` must be a function now. Chunk splitting was dropped since it isn't needed.
- **Build:** `npm run build` succeeds. `dist/` is 1.7 MB in total, JS 1.2 MB (320 KB gzip), so NFR-2 (≤ 5 MB) is met.
- **Manual check:** the dev server serves `index.html`, `/src/main.ts` and `/assets/landscape_sheet.xml` (200). `npm run dev` uses `--host`, so the iPhone can reach it over LAN.
- **Finding for T-9:** the `zzfx` package runs `new AudioContext` **when it is imported**. That would create a second context before the first tap (against ADR-003 and AC-9.4) and crash Vitest under Node. T-9 will vendor only ZzFX's `buildSamples` (MIT, with attribution) into `src/audio/` and drop the package import. This stays within ADR-003 (ZzFX for sound effects, pre-rendered buffers).
- **Assets:** copied `landscape_sheet`, `towers_grey_sheet` and `towers_red_sheet` (PNG + XML) and the Kenney licence into `public/assets/`.
