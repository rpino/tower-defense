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

// Review R-04: size from the game container both at startup and on resize, so
// the first frame matches later ones (iOS address bar / 100dvh).
const container = document.getElementById('game')!;
const viewSize = () => ({ w: container.clientWidth || window.innerWidth, h: container.clientHeight || window.innerHeight });

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: hex(COLORS.sky),
  // T-15: draw at DPR× the CSS size and show it at CSS size (sharp on iPhone).
  scale: {
    mode: Phaser.Scale.NONE,
    width: viewSize().w * DPR,
    height: viewSize().h * DPR,
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
  const { w, h } = viewSize();
  game.scale.resize(w * DPR, h * DPR);
};
window.addEventListener('resize', fit);
window.visualViewport?.addEventListener('resize', fit);

// Dev-only handle for manual checks in the browser console.
if (import.meta.env.DEV) Object.assign(window, { __game: game, __audio: audio });
