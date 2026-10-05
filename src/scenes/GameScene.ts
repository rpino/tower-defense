import Phaser from 'phaser';
import { computeLayout, type Layout } from '../render/layout';
import { drawMap, type MapView } from '../render/mapView';

/** World view: the map (and, from T-7, the simulation and its entities). */
export class GameScene extends Phaser.Scene {
  layout!: Layout;
  mapView!: MapView;

  constructor() {
    super('Game');
  }

  create(): void {
    this.mapView = drawMap(this);
    this.applyLayout();
    // AC-10.3: re-fit on resize/rotation without touching the run.
    this.scale.on(Phaser.Scale.Events.RESIZE, this.applyLayout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.applyLayout, this);
    });
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
