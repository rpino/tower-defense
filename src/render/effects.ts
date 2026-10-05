// Short visual effects in world space (AC-4.2 explosion, AC-5.4 death puff).
import Phaser from 'phaser';
import { groundEllipse } from '../sim/iso';
import { DPR } from './dpr';
import { COLORS, hex } from './palette';
import { FONT } from './ui';

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
  const { rx, ry } = groundEllipse(radiusTiles);
  const ring = scene.add.ellipse(x, y, rx * 2, ry * 2, 0xffb347, 0.45).setDepth(y + 1).setScale(0.2);
  scene.tweens.add({ targets: ring, scale: 1, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  const flash = scene.add.circle(x, y - 10, 18, 0xfff1a8, 1).setDepth(y + 2);
  scene.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 220, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
}

/** AC-5.5: "+N" gold rising from a kill for about 1 s; sized to stay readable at any zoom. */
export function floatingText(scene: Phaser.Scene, x: number, y: number, label: string): void {
  const zoom = (scene.cameras.main.zoom || 1) / DPR; // CSS px per world px
  const t = scene.add
    .text(x, y - 40, label, {
      fontFamily: FONT,
      fontSize: `${Math.round(24 / zoom)}px`,
      fontStyle: 'bold',
      color: hex(COLORS.gold),
      stroke: hex(COLORS.panelEdge),
      strokeThickness: Math.max(3, Math.round(5 / zoom)),
    })
    .setOrigin(0.5)
    .setDepth(1_000_000);
  scene.tweens.add({ targets: t, y: y - 40 - 30 / zoom, alpha: 0, duration: 1000, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
}

/** AC-3.10: Archer range solid, Cannon range dashed, around a build spot. */
export function drawRangeCircles(g: Phaser.GameObjects.Graphics, ranges: { archer: number; cannon: number }, zoom: number): void {
  g.clear();
  const width = Math.max(2, 3 / zoom);
  const a = groundEllipse(ranges.archer);
  g.fillStyle(0xffffff, 0.08).fillEllipse(0, 0, a.rx * 2, a.ry * 2);
  g.lineStyle(width, 0xffffff, 0.85).strokeEllipse(0, 0, a.rx * 2, a.ry * 2);
  const c = groundEllipse(ranges.cannon);
  g.lineStyle(width, 0xffb347, 0.95);
  const dashes = 28;
  for (let i = 0; i < dashes; i++) {
    const t0 = (i / dashes) * Math.PI * 2;
    const t1 = ((i + 0.55) / dashes) * Math.PI * 2;
    g.lineBetween(Math.cos(t0) * c.rx, Math.sin(t0) * c.ry, Math.cos(t1) * c.rx, Math.sin(t1) * c.ry);
  }
}
