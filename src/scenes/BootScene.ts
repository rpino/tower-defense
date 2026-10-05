import Phaser from 'phaser';

/** Loads the Kenney atlases. Loading bar, error message and hand-off to the title come in T-6. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.atlasXML('landscape', 'assets/landscape_sheet.png', 'assets/landscape_sheet.xml');
    this.load.atlasXML('towers-grey', 'assets/towers_grey_sheet.png', 'assets/towers_grey_sheet.xml');
    this.load.atlasXML('towers-red', 'assets/towers_red_sheet.png', 'assets/towers_red_sheet.xml');
  }
}
