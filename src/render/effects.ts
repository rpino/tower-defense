// Short visual effects in world space (AC-4.2 explosion, AC-5.4 death puff).
import Phaser from 'phaser';
import { TILE_HALF_H, TILE_HALF_W } from '../sim/iso';

export function deathPuff(scene: Phaser.Scene, x: number, y: number, color: number): void {
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const dot = scene.add.circle(x, y - 14, 5, i % 2 ? 0xffffff : color, 1).setDepth(y + 2);
    scene.tweens.add({
      targets: dot,
      x: x + Math.cos(a) * 26,
      y: y - 14 + Math.sin(a) * 16 - 10,
      alpha: 0,
      scale: 0.3,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => dot.destroy(),
    });
  }
}

/** Splash radius is in tiles; drawn as a ground ellipse of the same size. */
export function explosion(scene: Phaser.Scene, x: number, y: number, radiusTiles: number): void {
  const rx = radiusTiles * TILE_HALF_W * Math.SQRT2;
  const ry = radiusTiles * TILE_HALF_H * Math.SQRT2;
  const ring = scene.add.ellipse(x, y, rx * 2, ry * 2, 0xffb347, 0.45).setDepth(y + 1).setScale(0.2);
  scene.tweens.add({ targets: ring, scale: 1, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  const flash = scene.add.circle(x, y - 10, 18, 0xfff1a8, 1).setDepth(y + 2);
  scene.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 220, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
}
