// Code-drawn enemies (AC-5.2): each type differs in shape and size, not only
// colour. Drawn once into textures so many enemies stay cheap (NFR-1).
import Phaser from 'phaser';
import type { EnemyType } from '../config/balance';

export interface EnemyLook {
  texture: string;
  /** Body height in world px, used for health bar and projectile aim. */
  height: number;
}

export const ENEMY_LOOKS: Record<EnemyType, EnemyLook> = {
  grunt: { texture: 'enemy-grunt', height: 34 },
  runner: { texture: 'enemy-runner', height: 26 },
  brute: { texture: 'enemy-brute', height: 50 },
};

const OUTLINE = 0x2a1f2d;

export function createEnemyTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(ENEMY_LOOKS.grunt.texture)) return;
  const g = scene.make.graphics({}, false);

  // Grunt: a round purple blob with eyes and little feet.
  g.clear();
  g.fillStyle(OUTLINE, 1);
  g.fillCircle(20, 20, 17);
  g.fillStyle(0x9b59b6, 1);
  g.fillCircle(20, 20, 14);
  g.fillStyle(0xb57edc, 1);
  g.fillCircle(15, 14, 5);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(15, 20, 4);
  g.fillCircle(25, 20, 4);
  g.fillStyle(OUTLINE, 1);
  g.fillCircle(16, 21, 2);
  g.fillCircle(26, 21, 2);
  g.fillRect(10, 35, 7, 5);
  g.fillRect(23, 35, 7, 5);
  g.generateTexture(ENEMY_LOOKS.grunt.texture, 40, 40);

  // Runner: a small, pointy orange dart.
  g.clear();
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(14, 0, 28, 26, 0, 26);
  g.fillStyle(0xf39c12, 1);
  g.fillTriangle(14, 5, 24, 23, 4, 23);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(11, 17, 3);
  g.fillCircle(17, 17, 3);
  g.fillStyle(OUTLINE, 1);
  g.fillCircle(11, 18, 1.5);
  g.fillCircle(17, 18, 1.5);
  g.generateTexture(ENEMY_LOOKS.runner.texture, 28, 28);

  // Brute: a big armoured block with horns.
  g.clear();
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(2, 10, 50, 44, 8);
  g.fillTriangle(6, 14, 0, 0, 16, 10);
  g.fillTriangle(48, 14, 54, 0, 38, 10);
  g.fillStyle(0x6d7b8d, 1);
  g.fillRoundedRect(6, 14, 42, 36, 6);
  g.fillStyle(0x8e9bab, 1);
  g.fillRect(10, 18, 34, 8);
  g.fillStyle(0xff5e5e, 1);
  g.fillRect(14, 30, 8, 5);
  g.fillRect(32, 30, 8, 5);
  g.generateTexture(ENEMY_LOOKS.brute.texture, 54, 56);

  // Shared soft shadow.
  g.clear();
  g.fillStyle(0x000000, 0.28);
  g.fillEllipse(20, 8, 40, 16);
  g.generateTexture('shadow', 40, 16);

  g.destroy();
}
