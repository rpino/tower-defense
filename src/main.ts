import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';
import { UIScene } from './scenes/UIScene';
import { DPR } from './render/dpr';
import { COLORS, hex } from './render/palette';
import { audio } from './audio/instance';
import { wireAudio } from './audio/wire';

// AC-10.4: block iOS pinch-zoom (Safari ignores user-scalable=no).
document.addEventListener('gesturestart', (e) => e.preventDefault());

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: hex(COLORS.sky),
  // T-15: draw at DPR× the CSS size and show it at CSS size (sharp on iPhone).
  scale: {
    mode: Phaser.Scale.NONE,
    width: window.innerWidth * DPR,
    height: window.innerHeight * DPR,
    zoom: 1 / DPR,
  },
  // ADR-003: we run our own AudioContext, so Phaser must not create one.
  audio: { noAudio: true },
  // Scenes later in the list draw on top and receive input first.
  scene: [BootScene, GameScene, UIScene, TitleScene],
});

wireAudio(game, audio);

// AC-10.3: follow window resizes and rotation (Scale.NONE doesn't do it for us).
const fit = () => {
  const el = document.getElementById('game')!;
  game.scale.resize(el.clientWidth * DPR, el.clientHeight * DPR);
};
window.addEventListener('resize', fit);
window.visualViewport?.addEventListener('resize', fit);

// Dev-only handle for manual checks in the browser console.
if (import.meta.env.DEV) Object.assign(window, { __game: game, __audio: audio });
