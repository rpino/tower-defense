# ADR-001: Game framework — Phaser 3 + Vite + TypeScript

- **Status:** Proposed
- **Date:** 2026-10-04
- **Deciders:** Pino (Tech Lead)
- **Related:** AC-2.2, AC-2.5, AC-10.1–10.3, NFR-1, NFR-2, NFR-5, NFR-9

## Context
48 hours, solo, a browser game on desktop and iPhone Safari. It needs atlas loading (Kenney Starling XML), depth-sorted isometric sprites, scaling to any viewport, unified mouse and touch input, tweens for effects, and text for the HUD. It must build to static files for local testing and then Vercel. The download budget is ≤ 5 MB.

## Options considered
### Option A — Phaser 3 (pinned 3.x) + Vite + TypeScript
- Pros: `load.atlasXML` reads the Kenney sheets as they are; scale manager (`RESIZE`), camera zoom, depth sorting, unified pointer input, tweens, Graphics and Text are all built in; mature and well documented; Vite gives instant reload and a static `dist/`.
- Cons: ≈ 1.2 MB minified (≈ 0.35 MB gzip); learning its scene system; its own audio isn't needed (we synthesize).
### Option B — Plain Canvas 2D + Vite + TypeScript (no engine)
- Pros: tiny bundle; full control; nothing to learn.
- Cons: atlas parsing, sorting, input mapping, high-DPI scaling, text, tweens and the resize logic would all be hand-written. That costs hours we don't have.
### Option C — PixiJS + Vite
- Pros: fast WebGL renderer, smaller than Phaser.
- Cons: a renderer, not a game framework: no scenes, camera or tweens; Starling XML needs a converter or custom loader.

## Decision
**Option A.** It removes the most hand-written plumbing (atlas, sorting, scaling, input), which is where a 48-hour schedule is most at risk. Pin to the latest Phaser 3.x so no breaking changes arrive mid-jam. Game rules stay outside Phaser (ADR-002), so the engine only draws.

## Consequences
- Easier: rendering, layout, input, effects.
- Harder: Phaser must not leak into `src/sim/` (enforced by keeping it out of the sim imports, and by the sim tests running without Phaser).
- Must do: scaffold with Vite's `vanilla-ts` template, add `phaser` and `vitest`, and copy the needed sheets to `public/assets/`.
