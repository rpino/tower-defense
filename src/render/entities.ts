// Draws simulation entities (towers, enemies, projectiles) and syncs them by id
// every frame (ADR-002). Depth = world y at the ground point (AC-2.5).
import Phaser from 'phaser';
import { ENEMIES } from '../config/balance';
import { SPOTS, TOWER_BASE_OFFSET_Y, TOWER_FRAMES } from '../config/map';
import { gridToWorld } from '../sim/iso';
import { pathPoint } from '../sim/path';
import type { GameState, Projectile, SimEvent } from '../sim/state';
import { ENEMY_LOOKS } from './enemies';
import { deathPuff, explosion } from './effects';
import { diffEntities, projectileHeight } from './sync';

const SPOT_POS = new Map(SPOTS.map((s) => [s.id, gridToWorld(s.c, s.r)]));

/** Launch heights above the tile centre, in world px. */
const LAUNCH_H = { arrow: 112, ball: 96 } as const;

interface EnemyView {
  body: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;
  bar: Phaser.GameObjects.Graphics;
  phase: number;
}

interface ProjectileView {
  g: Phaser.GameObjects.Graphics;
  startDist: number;
}

const DEATH_COLORS = { grunt: 0x9b59b6, runner: 0xf39c12, brute: 0x6d7b8d } as const;

export class EntityView {
  private towers = new Map<number, Phaser.GameObjects.Container>();
  private enemies = new Map<number, EnemyView>();
  private projectiles = new Map<number, ProjectileView>();

  constructor(private scene: Phaser.Scene) {}

  clear(): void {
    for (const t of this.towers.values()) t.destroy();
    for (const e of this.enemies.values()) this.destroyEnemy(e);
    for (const p of this.projectiles.values()) p.g.destroy();
    this.towers.clear();
    this.enemies.clear();
    this.projectiles.clear();
  }

  /** One-off visuals for simulation events. */
  onEvent(ev: SimEvent): void {
    if (ev.type === 'death') {
      const w = gridToWorld(ev.c, ev.r);
      deathPuff(this.scene, w.x, w.y, DEATH_COLORS[ev.enemyType]);
    } else if (ev.type === 'explode') {
      const w = gridToWorld(ev.c, ev.r);
      explosion(this.scene, w.x, w.y, ev.radius);
    }
  }

  sync(state: GameState, timeMs: number): void {
    this.syncTowers(state);
    this.syncEnemies(state, timeMs);
    this.syncProjectiles(state);
  }

  private syncTowers(state: GameState): void {
    const { create, destroy } = diffEntities(this.towers.keys(), state.towers.map((t) => t.id));
    for (const id of destroy) {
      this.towers.get(id)!.destroy();
      this.towers.delete(id);
    }
    for (const id of create) {
      const t = state.towers.find((x) => x.id === id)!;
      const pos = SPOT_POS.get(t.spotId)!;
      const look = TOWER_FRAMES[t.type];
      const parts: Phaser.GameObjects.GameObject[] = [];
      let y = TOWER_BASE_OFFSET_Y;
      look.pieces.forEach((frame, i) => {
        if (i > 0) y -= look.rises[i - 1];
        const img = this.scene.add.image(0, y, look.atlas, frame).setOrigin(0.5, 1);
        parts.push(img);
        if (i === look.pieces.length - 1 && t.type === 'cannon') {
          // A code-drawn barrel on the battlement.
          const barrel = this.scene.add.graphics();
          barrel.fillStyle(0x2b2b33, 1);
          barrel.fillRoundedRect(-6, y - img.height + 6, 26, 12, 5);
          barrel.fillStyle(0x4a4a55, 1);
          barrel.fillCircle(-2, y - img.height + 12, 9);
          parts.push(barrel);
        }
      });
      const c = this.scene.add.container(pos.x, pos.y, parts).setDepth(pos.y + 0.1);
      c.setScale(0.6);
      this.scene.tweens.add({ targets: c, scale: 1, duration: 220, ease: 'Back.easeOut' });
      this.towers.set(id, c);
    }
  }

  private syncEnemies(state: GameState, timeMs: number): void {
    const { create, destroy } = diffEntities(this.enemies.keys(), state.enemies.map((e) => e.id));
    for (const id of destroy) {
      this.destroyEnemy(this.enemies.get(id)!);
      this.enemies.delete(id);
    }
    for (const id of create) {
      const e = state.enemies.find((x) => x.id === id)!;
      const look = ENEMY_LOOKS[e.type];
      this.enemies.set(id, {
        shadow: this.scene.add.image(0, 0, 'shadow').setScale(e.type === 'brute' ? 1.3 : e.type === 'runner' ? 0.7 : 1),
        body: this.scene.add.image(0, 0, look.texture).setOrigin(0.5, 1),
        bar: this.scene.add.graphics(),
        phase: Math.random() * Math.PI * 2,
      });
    }
    for (const e of state.enemies) {
      const v = this.enemies.get(e.id)!;
      const p = pathPoint(e.dist);
      const w = gridToWorld(p.c, p.r);
      const speed = ENEMIES[e.type].speed;
      const bob = Math.abs(Math.sin(timeMs / 1000 * 6 * speed + v.phase)) * 4;
      v.shadow.setPosition(w.x, w.y).setDepth(w.y - 0.2);
      v.body.setPosition(w.x, w.y - bob).setDepth(w.y);
      // AC-5.3: health bar only once damaged.
      v.bar.clear();
      if (e.hp < e.maxHp) {
        const bw = 34;
        const top = w.y - ENEMY_LOOKS[e.type].height - 14;
        v.bar.fillStyle(0x1b2638, 0.9);
        v.bar.fillRect(w.x - bw / 2 - 2, top - 2, bw + 4, 8);
        v.bar.fillStyle(e.hp / e.maxHp > 0.4 ? 0x6ad06a : 0xff6b6b, 1);
        v.bar.fillRect(w.x - bw / 2, top, bw * Math.max(0, e.hp / e.maxHp), 4);
        v.bar.setDepth(w.y + 0.3);
      }
    }
  }

  private syncProjectiles(state: GameState): void {
    const { create, destroy } = diffEntities(this.projectiles.keys(), state.projectiles.map((p) => p.id));
    for (const id of destroy) {
      this.projectiles.get(id)!.g.destroy();
      this.projectiles.delete(id);
    }
    for (const id of create) {
      const p = state.projectiles.find((x) => x.id === id)!;
      this.projectiles.set(id, { g: this.scene.add.graphics(), startDist: Math.max(0.01, remaining(p)) });
    }
    for (const p of state.projectiles) {
      const v = this.projectiles.get(p.id)!;
      const t = 1 - remaining(p) / v.startDist;
      const h = projectileHeight(p.kind, t, LAUNCH_H[p.kind], 16);
      const ground = gridToWorld(p.c, p.r);
      const target = gridToWorld(p.lastC, p.lastR);
      v.g.clear();
      v.g.setPosition(ground.x, ground.y - h).setDepth(ground.y + 0.5);
      if (p.kind === 'arrow') {
        const ang = Math.atan2(target.y - 16 - (ground.y - h), target.x - ground.x);
        const dx = Math.cos(ang) * 10;
        const dy = Math.sin(ang) * 10;
        v.g.lineStyle(3, 0x5a3b1e, 1).lineBetween(-dx, -dy, dx, dy);
        v.g.fillStyle(0xe8e8e8, 1).fillCircle(dx, dy, 2.5);
      } else {
        v.g.fillStyle(0x1e1e24, 1).fillCircle(0, 0, 7);
        v.g.fillStyle(0x6b6b78, 1).fillCircle(-2, -2, 2.5);
      }
    }
  }

  private destroyEnemy(v: EnemyView): void {
    v.body.destroy();
    v.shadow.destroy();
    v.bar.destroy();
  }
}

function remaining(p: Projectile): number {
  return Math.hypot(p.lastC - p.c, p.lastR - p.r);
}
