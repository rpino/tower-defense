import Phaser from 'phaser';
import type { TowerType } from '../config/balance';
import { SPOTS } from '../config/map';
import { TOWERS } from '../config/balance';
import { drawRangeCircles } from '../render/effects';
import { createEnemyTextures } from '../render/enemies';
import { EntityView } from '../render/entities';
import { computeLayout, type Layout } from '../render/layout';
import { drawMap, type MapView } from '../render/mapView';
import { accumulate } from '../render/sync';
import { build, startWave } from '../sim/commands';
import { gridToWorld, nearestSpot } from '../sim/iso';
import { createRun, type GameState, type SimEvent } from '../sim/state';
import { STEP_DT, step } from '../sim/step';

/** game.events names shared with UIScene and audio (design §3.1 ownership). */
export const EV = {
  sim: 'sim:event',
  spotTap: 'spot:tap',
  runStarted: 'run:started',
  pickerOpen: 'picker:open',
  pickerClose: 'picker:close',
} as const;

/**
 * World view and owner of the run: runs the fixed-step simulation, applies
 * commands, draws entities and re-emits every SimEvent on game.events.
 */
export class GameScene extends Phaser.Scene {
  layout!: Layout;
  mapView!: MapView;
  state: GameState | null = null;
  private entities!: EntityView;
  private acc = 0;
  private rangeCircles!: Phaser.GameObjects.Graphics;
  /** performance.now() when the current run began; earlier presses (Start/Restart) are ignored. */
  private runStartedAt = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    createEnemyTextures(this);
    this.mapView = drawMap(this);
    this.entities = new EntityView(this);
    this.applyLayout();
    // AC-10.3: re-fit on resize/rotation without touching the run.
    this.scale.on(Phaser.Scale.Events.RESIZE, this.applyLayout, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.applyLayout, this);
    });
    this.game.events.on('title:start', () => this.startRun());
    // AC-3.10: show both tower ranges while the picker is open.
    this.rangeCircles = this.add.graphics().setDepth(-400_000).setVisible(false);
    this.game.events.on(EV.pickerOpen, (spotId: string) => {
      const spot = SPOTS.find((s) => s.id === spotId);
      if (!spot) return;
      const w = gridToWorld(spot.c, spot.r);
      drawRangeCircles(this.rangeCircles, { archer: TOWERS.archer.range, cannon: TOWERS.cannon.range }, this.cameras.main.zoom);
      this.rangeCircles.setPosition(w.x, w.y).setVisible(true);
    });
    this.game.events.on(EV.pickerClose, () => this.rangeCircles.setVisible(false));
  }

  /** AC-1.3 / AC-8.4: a fresh run (also used by Restart). */
  startRun(): void {
    this.state = createRun();
    this.runStartedAt = performance.now();
    this.acc = 0;
    this.entities.clear();
    for (const m of this.mapView.spotMarkers.values()) m.setVisible(true);
    this.tweens.resumeAll();
    this.game.events.emit(EV.runStarted, this.state);
  }

  /** Commands from UIScene (design §3.1: UI never mutates state directly). */
  command(cmd: { type: 'build'; spotId: string; tower: TowerType } | { type: 'startWave' }): boolean {
    if (!this.state) return false;
    const res = cmd.type === 'build' ? build(this.state, cmd.spotId, cmd.tower) : startWave(this.state);
    if (res.ok) this.dispatch(res.events);
    return res.ok;
  }

  update(time: number, delta: number): void {
    if (!this.state) return;
    const { steps, acc } = accumulate(this.acc, delta);
    this.acc = acc;
    for (let i = 0; i < steps; i++) {
      const events = step(this.state, STEP_DT);
      if (events.length) this.dispatch(events);
    }
    this.entities.sync(this.state, time);
  }

  private dispatch(events: SimEvent[]): void {
    for (const ev of events) {
      this.entities.onEvent(ev);
      if (ev.type === 'built') this.mapView.spotMarkers.get(ev.spotId)?.setVisible(false);
      if (ev.type === 'victory' || ev.type === 'defeat') this.tweens.pauseAll(); // AC-8.3 freeze
      this.game.events.emit(EV.sim, ev);
    }
  }

  /** Map taps: nearest empty build spot within the tap radius, or null (AC-3.1, 3.6, 10.2). */
  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    // Design §3.5: taps on the HUD, picker or result screen belong to UIScene.
    const ui = this.scene.get('UI') as { isOverUi?: (x: number, y: number) => boolean } | null;
    if (this.scene.isActive('UI') && ui?.isOverUi?.(pointer.x, pointer.y)) return;
    if (!this.state || this.state.phase === 'victory' || this.state.phase === 'defeat') return;
    // The press that hit Start/Restart must not also act on the map underneath.
    if (pointer.downTime < this.runStartedAt) return;
    const pt = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const spot = nearestSpot(pt, SPOTS, this.layout.spotTapRadiusWorld);
    const free = spot && !this.state.towers.some((t) => t.spotId === spot.id) ? spot : null;
    this.game.events.emit(EV.spotTap, free?.id ?? null);
  }

  private applyLayout(): void {
    const { width, height } = this.scale;
    this.layout = computeLayout(width, height);
    const cam = this.cameras.main;
    cam.setSize(width, height);
    cam.setZoom(this.layout.zoom);
    cam.centerOn(this.layout.cameraCenter.x, this.layout.cameraCenter.y);
  }
}
