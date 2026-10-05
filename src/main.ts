import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';

// AC-10.4: block iOS pinch-zoom (Safari ignores user-scalable=no).
document.addEventListener('gesturestart', (e) => e.preventDefault());

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#3b6fb6',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  // ADR-003: we run our own AudioContext, so Phaser must not create one.
  audio: { noAudio: true },
  scene: [BootScene],
});
