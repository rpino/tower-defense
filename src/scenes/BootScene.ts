import Phaser from 'phaser';
import { COLORS } from '../render/palette';
import { text } from '../render/ui';

const ATLAS_KEYS = ['landscape', 'towers-grey', 'towers-red'];

/** Loads the Kenney atlases with a loading bar (AC-1.2) and reports load errors (AC-1.5). */
export class BootScene extends Phaser.Scene {
  private failed = false;

  constructor() {
    super('Boot');
  }

  preload(): void {
    const { width, height } = this.scale;
    const barW = Math.min(320, width * 0.7);
    const frame = this.add.graphics();
    frame.lineStyle(3, COLORS.text, 0.9);
    frame.strokeRoundedRect(width / 2 - barW / 2, height / 2 - 12, barW, 24, 8);
    const bar = this.add.graphics();
    text(this, width / 2, height / 2 - 40, 'Loading…', 20);

    this.load.on('progress', (p: number) => {
      bar.clear();
      bar.fillStyle(COLORS.gold, 1);
      bar.fillRoundedRect(width / 2 - barW / 2 + 4, height / 2 - 8, Math.max(8, (barW - 8) * p), 16, 6);
    });
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.failed = true;
      console.error(`Failed to load ${file.key} (${file.src})`);
    });

    this.load.atlasXML('landscape', 'assets/landscape_sheet.png', 'assets/landscape_sheet.xml');
    this.load.atlasXML('towers-grey', 'assets/towers_grey_sheet.png', 'assets/towers_grey_sheet.xml');
    this.load.atlasXML('towers-red', 'assets/towers_red_sheet.png', 'assets/towers_red_sheet.xml');
  }

  create(): void {
    // A missing or corrupt image can fail at the processing stage without a
    // 'loaderror' event, so also confirm every texture really exists.
    const missing = ATLAS_KEYS.filter((k) => !this.textures.exists(k));
    if (this.failed || missing.length > 0) {
      if (missing.length > 0) console.error(`Missing textures: ${missing.join(', ')}`);
      this.children.removeAll(true);
      const { width, height } = this.scale;
      text(this, width / 2, height / 2, 'Couldn’t load the game —\nplease refresh', 22);
      return;
    }
    this.scene.start('Game');
    this.scene.launch('Title');
  }
}
