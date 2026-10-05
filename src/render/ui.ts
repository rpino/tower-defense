// Small UI helpers for screen-space scenes (AC-10.1, AC-10.2, NFR-7).
import Phaser from 'phaser';
import { DPR } from './dpr';
import { COLORS, hex } from './palette';

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif';

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color: number = COLORS.text,
  bold = true,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, value, {
      fontFamily: FONT,
      fontSize: `${Math.max(14, Math.round(size))}px`, // NFR-7: never below 14 px
      fontStyle: bold ? 'bold' : 'normal',
      color: hex(color),
      align: 'center',
      resolution: DPR, // sharp text when the camera scales it up
    })
    .setOrigin(0.5);
}

export interface Button {
  container: Phaser.GameObjects.Container;
  setEnabled(on: boolean): void;
  setLabel(label: string): void;
}

/** A rounded button that fires on pointerup (design §3.5). Min 44×44 px (AC-10.2). */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  opts: { width?: number; height?: number; fontSize?: number } = {},
): Button {
  const w = Math.max(44, opts.width ?? 180);
  const h = Math.max(44, opts.height ?? 52);
  const bg = scene.add.graphics();
  const t = text(scene, 0, 0, label, opts.fontSize ?? 22, COLORS.buttonText);
  const container = scene.add.container(x, y, [bg, t]);
  container.setSize(w, h);
  let enabled = true;

  const draw = (fill: number) => {
    bg.clear();
    bg.fillStyle(COLORS.panelEdge, 0.6);
    bg.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 12);
    bg.fillStyle(fill, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(2, 0xffffff, enabled ? 0.35 : 0.12);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
  };
  draw(COLORS.button);

  container.setInteractive({ useHandCursor: true });
  container.on('pointerover', () => enabled && draw(COLORS.buttonHover));
  container.on('pointerout', () => draw(enabled ? COLORS.button : COLORS.buttonDisabled));
  container.on('pointerup', () => {
    if (enabled) onClick();
  });

  return {
    container,
    setEnabled(on) {
      enabled = on;
      t.setColor(hex(on ? COLORS.buttonText : COLORS.buttonTextDisabled));
      draw(on ? COLORS.button : COLORS.buttonDisabled);
    },
    setLabel(label) {
      t.setText(label);
    },
  };
}
