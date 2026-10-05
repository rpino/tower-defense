// Draws the static map in world space (AC-2.1, 2.3, 2.4, 2.5).
import Phaser from 'phaser';
import { GRID_SIZE, SPOTS, tileFrameAt } from '../config/map';
import { gridToWorld, TILE_HALF_H, TILE_HALF_W } from '../sim/iso';
import { PATH_LENGTH, pathPoint } from '../sim/path';
import { COLORS } from './palette';

/** Ground tiles always sit under every object; objects sort by world y (AC-2.5). */
export const GROUND_DEPTH = -1_000_000;
const SPOT_MARKER_DEPTH = -500_000;

/** Scenery frames are tall full tiles; they sort with objects instead of ground. */
const isScenery = (frame: string) => /^(trees|rocks|crystals)_/.test(frame);

export interface MapView {
  spotMarkers: Map<string, Phaser.GameObjects.Graphics>;
}

export function drawMap(scene: Phaser.Scene): MapView {
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < GRID_SIZE; r++) {
      const frame = tileFrameAt(c, r);
      const { x, y } = gridToWorld(c, r);
      const img = scene.add.image(x, y, 'landscape', frame);
      // Bottom anchor: the top-face centre of a 99 px tile lands on (x, y), and
      // taller/shorter frames line up by their base (design §3.5).
      img.setOrigin(0.5, (img.height - 2 * TILE_HALF_H) / img.height);
      img.setDepth(isScenery(frame) ? y : GROUND_DEPTH + y);
    }
  }

  const spotMarkers = new Map<string, Phaser.GameObjects.Graphics>();
  for (const s of SPOTS) {
    const { x, y } = gridToWorld(s.c, s.r);
    const g = scene.add.graphics({ x, y });
    const w = TILE_HALF_W * 0.68;
    const h = TILE_HALF_H * 0.68;
    g.fillStyle(COLORS.stone, 0.18);
    g.fillPoints([new Phaser.Math.Vector2(0, -h), new Phaser.Math.Vector2(w, 0), new Phaser.Math.Vector2(0, h), new Phaser.Math.Vector2(-w, 0)], true);
    g.lineStyle(4, COLORS.spotOutline, 1);
    g.strokePoints([new Phaser.Math.Vector2(0, -h), new Phaser.Math.Vector2(w, 0), new Phaser.Math.Vector2(0, h), new Phaser.Math.Vector2(-w, 0)], true);
    g.setDepth(SPOT_MARKER_DEPTH + y);
    scene.tweens.add({ targets: g, alpha: { from: 0.95, to: 0.4 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    spotMarkers.set(s.id, g);
  }

  drawExitFlag(scene);
  return { spotMarkers };
}

/** AC-2.4: a banner on a pole where the path leaves the map. */
function drawExitFlag(scene: Phaser.Scene): void {
  const end = pathPoint(PATH_LENGTH);
  const { x, y } = gridToWorld(end.c, end.r);
  const px = x + 40;
  const g = scene.add.graphics({ x: px, y });
  g.fillStyle(0x5a4632, 1);
  g.fillRect(-3, -86, 6, 86);
  g.fillStyle(COLORS.danger, 1);
  g.fillTriangle(3, -84, 50, -68, 3, -52);
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(0, 0, 22, 9);
  g.setDepth(y + 1);
  scene.tweens.add({ targets: g, scaleX: { from: 1, to: 0.92 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}
