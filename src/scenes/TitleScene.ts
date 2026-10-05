import Phaser from 'phaser';
import { cssSize, useCssCamera } from '../render/dpr';
import { COLORS } from '../render/palette';
import { button, text } from '../render/ui';

export const GAME_TITLE = 'Tower Defense';
export const GOAL_LINE = 'Stop the enemies before they reach the end of the path';

/** Start screen over the map (AC-1.1, AC-1.4). */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    this.build();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.build, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.build, this);
    });
  }

  /** (Re)builds the screen for the current size (AC-10.3). */
  private build(): void {
    this.children.removeAll(true);
    useCssCamera(this.cameras.main);
    const { width, height } = cssSize(this.scale);
    const panelW = Math.min(width - 32, 460);
    const titleSize = Math.min(48, panelW / 8);

    this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0);
    const panelH = 300;
    const cx = width / 2;
    const cy = height / 2;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.92);
    panel.fillRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 18);
    panel.lineStyle(3, COLORS.gold, 0.8);
    panel.strokeRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 18);

    text(this, cx, cy - 92, GAME_TITLE, titleSize, COLORS.gold);
    text(this, cx, cy - 30, GOAL_LINE, 17, COLORS.text, false).setWordWrapWidth(panelW - 40);
    button(this, cx, cy + 46, 'Start', () => this.start(), { width: 200, height: 60, fontSize: 28 });
    text(this, cx, cy + panelH / 2 - 22, 'Art by Kenney (kenney.nl)', 14, COLORS.textMuted, false);
  }

  private start(): void {
    // T-9 unlocks audio in this same pointerup.
    if (!this.scene.isActive('UI')) this.scene.launch('UI');
    this.game.events.emit('title:start');
    this.scene.stop();
  }
}
