import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';
import { UIScene } from './scenes/UIScene';
import { COLORS, hex } from './render/palette';
import { audio } from './audio/instance';
import { wireAudio } from './audio/wire';

// AC-10.4: block iOS pinch-zoom (Safari ignores user-scalable=no).
document.addEventListener('gesturestart', (e) => e.preventDefault());

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: hex(COLORS.sky),
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  // ADR-003: we run our own AudioContext, so Phaser must not create one.
  audio: { noAudio: true },
  // Scenes later in the list draw on top and receive input first.
  scene: [BootScene, GameScene, UIScene, TitleScene],
});

wireAudio(game, audio);

// Dev-only handle for manual checks in the browser console.
if (import.meta.env.DEV) Object.assign(window, { __game: game, __audio: audio });
