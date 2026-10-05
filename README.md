# Tower Defense

A small browser tower defense game made for a 48-hour game jam. It runs on desktop and mobile browsers. Build Archer and Cannon towers on the marked spots, then hold off three waves of enemies. Each wave is harder than the last, and a full game lasts about 3 minutes.

## How to play
- Press **Start**.
- **Tap or click a glowing build spot** to open the tower picker, then choose a tower:
  - **Archer:** 50 gold. Fast single shots and long range.
  - **Cannon:** 80 gold. Slow shots that hit every enemy in a small area.

  The range circles show how far each tower reaches.
- Press **Start wave N** when you're ready. You can keep building during a wave.
- Every kill earns gold, and clearing a wave pays a bonus.
- Each enemy that reaches the red flag costs lives: Grunts and Runners cost 1, Brutes cost 2. Survive wave 3 to win.
- The speaker button at the bottom right mutes all sound.

## Run it locally
Requires Node.js 20 or newer (developed on Node 24).

```bash
npm install
npm run dev       # dev server, also reachable on your LAN (test on a phone)
npm test          # unit tests, including the headless balance test
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

Debug switches (URL parameters): `?debug=1` shows an FPS and enemy counter; `?dpr=1` or `?dpr=2` forces the render resolution.

## How it's built
- **Engine and tooling:** [Phaser 3](https://phaser.io), Vite and TypeScript. The output is static files with no backend.
- **Game rules:** a pure, fixed-step simulation in `src/sim/`, with no Phaser in it. It's unit-tested, and a headless test plays whole games to check balance (`tests/balance.test.ts`).
- **Graphics:** enemies, projectiles, effects and the HUD are drawn in code. Map tiles and towers come from the Kenney pack.
- **Sound:** all sound is generated at runtime with the Web Audio API; there are no audio files.
- **Process docs:** requirements, design and planning are in `docs/` (an Agentic SDLC project).

## Credits and licences
- **Art:** [Kenney](https://kenney.nl), *Tower Defense (isometric)* pack, CC0 (public domain). Licence: `public/assets/KENNEY_LICENSE.txt`.
- **Sound synthesis:** the sample generator in `src/audio/zzfxSynth.ts` is ported from [ZzFX](https://github.com/KilledByAPixel/ZzFX) by Frank Force, MIT licence (the full notice is in that file).
- **Phaser:** MIT licence.
