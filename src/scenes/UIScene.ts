import Phaser from 'phaser';
import { TOWERS, type TowerType } from '../config/balance';
import { SPOTS, TOWER_FRAMES } from '../config/map';
import { audio } from '../audio/instance';
import { PICKER_SIZE, affordable, hudText, muteButtonRect, placePicker, resultText } from '../render/hud';
import { isDebug } from '../render/debug';
import { useCssCamera } from '../render/dpr';
import { worldToScreen, type Rect } from '../render/layout';
import { COLORS, hex } from '../render/palette';
import { button, text, type Button } from '../render/ui';
import { gridToWorld } from '../sim/iso';
import type { SimEvent } from '../sim/state';
import { EV, type GameScene } from './GameScene';

const TOWER_NAMES: Record<TowerType, string> = { archer: 'Archer', cannon: 'Cannon' };

interface PickerView {
  spotId: string;
  container: Phaser.GameObjects.Container;
  rect: Rect;
  options: Record<TowerType, { bg: Phaser.GameObjects.Graphics; parts: Phaser.GameObjects.GameObject[] }>;
}

/**
 * Screen-space UI over the map (AC-3.x, 6.x, 7.x, 8.x, 10.1, 10.2): HUD bars,
 * tower picker, wave button and banners, result overlay. It never mutates the
 * run itself; it sends commands to GameScene.
 */
export class UIScene extends Phaser.Scene {
  private gs!: GameScene;
  private hud!: { lives: Phaser.GameObjects.Text; gold: Phaser.GameObjects.Text; wave: Phaser.GameObjects.Text };
  private waveButton!: Button;
  private picker: PickerView | null = null;
  private overlay: Phaser.GameObjects.Container | null = null;
  private lastHud = '';
  private heartIcon: Phaser.GameObjects.Graphics | null = null;
  private fps: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('UI');
  }

  create(): void {
    this.gs = this.scene.get('Game') as GameScene;
    this.build();
    const on = (name: string, fn: (...args: never[]) => void) => {
      this.game.events.on(name, fn, this);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(name, fn, this));
    };
    on(EV.sim, (ev: SimEvent) => this.onSim(ev));
    on(EV.spotTap, (id: string | null) => (id ? this.openPicker(id) : this.closePicker()));
    on(EV.runStarted, () => {
      this.closePicker();
      this.hideOverlay();
    });
    this.scale.on(Phaser.Scale.Events.RESIZE, this.build, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.build, this));
  }

  /** Design §3.5: GameScene ignores taps that land on UI. */
  isOverUi(x: number, y: number): boolean {
    if (this.overlay) return true;
    const L = this.gs.layout;
    const hit = (r: Rect) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    return hit(L.topBar) || hit(L.bottomBar) || (this.picker !== null && hit(this.picker.rect));
  }

  update(): void {
    const s = this.gs.state;
    if (!s) return;
    const t = hudText(s);
    const key = `${t.lives}|${t.gold}|${t.wave}`;
    if (key !== this.lastHud) {
      this.lastHud = key;
      this.hud.lives.setText(t.lives);
      this.hud.gold.setText(t.gold);
      this.hud.wave.setText(t.wave);
    }
    // AC-6.1: the wave button only exists in the build phase.
    this.waveButton.container.setVisible(s.phase === 'build');
    this.waveButton.setLabel(`Start wave ${s.wave}`);
    if (this.picker) this.paintPicker(this.picker);
    if (this.fps) {
      const g = this.gs.state;
      this.fps.setText(`${Math.round(this.game.loop.actualFps)} fps · ${g ? g.enemies.length : 0} enemies`);
    }
  }

  // ---------------------------------------------------------------- layout

  /** (Re)build everything for the current screen size (AC-10.3). */
  private build(): void {
    const reopen = this.picker?.spotId ?? null;
    this.picker = null;
    this.overlay = null;
    this.children.removeAll(true);
    useCssCamera(this.cameras.main);
    const L = this.gs.layout;

    // Top bar: lives, wave, gold (AC-7.1).
    const top = this.add.graphics();
    top.fillStyle(COLORS.panel, 0.88).fillRect(0, 0, L.viewW, L.topBar.h);
    top.fillStyle(COLORS.panelEdge, 0.9).fillRect(0, L.topBar.h - 3, L.viewW, 3);
    const cy = L.topBar.h / 2;
    const inset = Math.min(70, L.viewW * 0.12);
    this.heartIcon = this.heart(inset - 26, cy);
    this.coin(L.viewW - inset - 26, cy);
    this.hud = {
      lives: text(this, inset + 4, cy, '', 22, COLORS.lives),
      wave: text(this, L.viewW / 2, cy, '', 20, COLORS.text),
      gold: text(this, L.viewW - inset + 4, cy, '', 22, COLORS.gold),
    };
    this.lastHud = '';

    // Bottom bar: wave button (AC-6.1).
    const bottom = this.add.graphics();
    bottom.fillStyle(COLORS.panel, 0.88).fillRect(0, L.bottomBar.y, L.viewW, L.bottomBar.h);
    this.waveButton = button(this, L.viewW / 2, L.bottomBar.y + L.bottomBar.h / 2, 'Start wave 1', () => this.gs.command({ type: 'startWave' }), {
      width: 210,
      height: 50,
      fontSize: 22,
    });

    this.muteButton();

    if (isDebug(window.location.search)) {
      this.fps = text(this, 8, L.bottomBar.y - 14, '', 14, COLORS.text, false).setOrigin(0, 0.5).setStroke('#000000', 4);
    }

    if (reopen) this.openPicker(reopen);
    const s = this.gs.state;
    if (s && resultText(s)) this.showOverlay();
  }

  /** AC-9.5: speaker icon; a red slash when muted. The setting lives in the audio engine, so it survives Restart. */
  private muteButton(): void {
    const r = muteButtonRect(this.gs.layout);
    const g = this.add.graphics({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
    const draw = () => {
      g.clear();
      g.fillStyle(COLORS.button, 1).fillRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 10);
      g.lineStyle(2, 0xffffff, 0.35).strokeRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 10);
      g.fillStyle(COLORS.text, 1);
      g.fillRect(-12, -5, 7, 10);
      g.fillTriangle(-6, -5, 4, -13, 4, 13).fillTriangle(-6, -5, 4, 13, -6, 5);
      if (audio.muted) {
        g.lineStyle(4, COLORS.danger, 1).lineBetween(-14, -14, 14, 14);
      } else {
        g.lineStyle(2.5, COLORS.text, 1);
        g.beginPath().arc(4, 0, 7, -0.9, 0.9).strokePath();
        g.beginPath().arc(4, 0, 12, -0.9, 0.9).strokePath();
      }
    };
    draw();
    const hit = this.add.zone(r.x, r.y, r.w, r.h).setOrigin(0).setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => {
      audio.setMuted(!audio.muted);
      draw();
    });
  }

  private heart(x: number, y: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics({ x, y });
    g.fillStyle(0xe25555, 1);
    g.fillCircle(-5, -3, 6).fillCircle(5, -3, 6).fillTriangle(-11, -1, 11, -1, 0, 11);
    return g;
  }

  /** AC-5.7: the lives counter flashes when an enemy gets through. */
  private flashLives(): void {
    const targets = [this.hud.lives, this.heartIcon].filter((t) => t !== null);
    this.tweens.killTweensOf(targets);
    for (const t of targets) t.setScale(1);
    this.tweens.add({ targets, scale: 1.45, duration: 110, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    this.hud.lives.setColor('#ffffff');
    this.time.delayedCall(450, () => this.hud.lives.setColor(hex(COLORS.lives)));
  }

  private coin(x: number, y: number): void {
    const g = this.add.graphics({ x, y });
    g.fillStyle(0xb8860b, 1).fillCircle(0, 0, 11);
    g.fillStyle(COLORS.gold, 1).fillCircle(0, 0, 8);
    g.fillStyle(0xfff3c4, 1).fillRect(-1.5, -5, 3, 10);
  }

  // ---------------------------------------------------------------- picker

  /** AC-3.1 / AC-3.5: open next to the spot, or move there if already open. */
  private openPicker(spotId: string): void {
    const s = this.gs.state;
    if (!s || s.phase === 'victory' || s.phase === 'defeat') return;
    this.closePicker();
    const spot = SPOTS.find((x) => x.id === spotId)!;
    const w = gridToWorld(spot.c, spot.r);
    const at = worldToScreen(this.gs.layout, w.x, w.y);
    const pos = placePicker(at, this.gs.layout);

    const container = this.add.container(pos.x, pos.y);
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.95).fillRoundedRect(0, 0, PICKER_SIZE.w, PICKER_SIZE.h, 14);
    panel.lineStyle(2, COLORS.gold, 0.7).strokeRoundedRect(0, 0, PICKER_SIZE.w, PICKER_SIZE.h, 14);
    container.add(panel);

    const options = {} as PickerView['options'];
    (['archer', 'cannon'] as TowerType[]).forEach((type, i) => {
      const ox = 8 + i * (PICKER_SIZE.optionW + 0) + (i ? 0 : 0);
      const oy = (PICKER_SIZE.h - PICKER_SIZE.optionH) / 2;
      const bg = this.add.graphics();
      const look = TOWER_FRAMES[type];
      const icon = this.add
        .image(ox + 26, oy + PICKER_SIZE.optionH / 2 + 18, look.atlas, look.pieces[look.pieces.length - 1])
        .setOrigin(0.5, 1)
        .setScale(0.42);
      const name = text(this, ox + 68, oy + 24, TOWER_NAMES[type], 16, COLORS.text);
      const cost = text(this, ox + 68, oy + 50, String(TOWERS[type].cost), 18, COLORS.gold);
      const hit = this.add.zone(ox, oy, PICKER_SIZE.optionW, PICKER_SIZE.optionH).setOrigin(0).setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => this.pick(type));
      container.add([bg, icon, name, cost, hit]);
      options[type] = { bg, parts: [icon, name, cost] };
    });

    this.picker = { spotId, container, options, rect: { x: pos.x, y: pos.y, w: PICKER_SIZE.w, h: PICKER_SIZE.h } };
    this.game.events.emit(EV.pickerOpen, spotId);
    this.paintPicker(this.picker);
    container.setScale(0.85).setAlpha(0);
    this.tweens.add({ targets: container, scale: 1, alpha: 1, duration: 120, ease: 'Quad.easeOut' });
  }

  /** AC-3.3: unaffordable options are dimmed (re-checked every frame as gold changes). */
  private paintPicker(p: PickerView): void {
    const can = affordable(this.gs.state?.gold ?? 0);
    (['archer', 'cannon'] as TowerType[]).forEach((type, i) => {
      const o = p.options[type];
      const ox = 8 + i * PICKER_SIZE.optionW;
      const oy = (PICKER_SIZE.h - PICKER_SIZE.optionH) / 2;
      o.bg.clear();
      o.bg.fillStyle(can[type] ? COLORS.button : COLORS.buttonDisabled, 1).fillRoundedRect(ox + 2, oy, PICKER_SIZE.optionW - 4, PICKER_SIZE.optionH, 10);
      for (const part of o.parts) (part as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(can[type] ? 1 : 0.45);
    });
  }

  private pick(type: TowerType): void {
    if (!this.picker) return;
    if (!affordable(this.gs.state?.gold ?? 0)[type]) return; // AC-3.3: does nothing
    this.gs.command({ type: 'build', spotId: this.picker.spotId, tower: type });
    this.closePicker();
  }

  private closePicker(): void {
    if (this.picker) this.game.events.emit(EV.pickerClose);
    this.picker?.container.destroy();
    this.picker = null;
  }

  // ---------------------------------------------------------------- events, banners, results

  private onSim(ev: SimEvent): void {
    if (ev.type === 'lifeLost') this.flashLives();
    else if (ev.type === 'waveStart') this.banner(`Wave ${ev.wave}`, COLORS.text); // AC-6.5
    else if (ev.type === 'waveCleared') this.banner(`Wave ${ev.wave} cleared!`, COLORS.gold); // AC-6.3
    else if (ev.type === 'victory' || ev.type === 'defeat') {
      this.closePicker(); // AC-3.8
      this.showOverlay();
    }
  }

  private banner(value: string, color: number): void {
    const L = this.gs.layout;
    const t = text(this, L.viewW / 2, L.mapArea.y + 40, value, Math.min(40, L.viewW / 10), color);
    t.setStroke(hex(COLORS.panelEdge), 6).setAlpha(0).setScale(0.8);
    this.tweens.chain({
      targets: t,
      tweens: [
        { alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' },
        { alpha: 1, duration: 1100 },
        { alpha: 0, duration: 200 },
      ],
      onComplete: () => t.destroy(),
    });
  }

  /** AC-8.1 / AC-8.2: result screen with Restart (AC-8.4). */
  private showOverlay(): void {
    const s = this.gs.state;
    const r = s && resultText(s);
    if (!r) return;
    this.hideOverlay();
    const L = this.gs.layout;
    const w = Math.min(L.viewW - 32, 380);
    const h = 230;
    const cx = L.viewW / 2;
    const cy = L.viewH / 2;
    const dim = this.add.rectangle(0, 0, L.viewW, L.viewH, 0x000000, 0.45).setOrigin(0).setInteractive();
    const panel = this.add.graphics();
    const victory = s.phase === 'victory';
    panel.fillStyle(COLORS.panel, 0.96).fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 18);
    panel.lineStyle(3, victory ? COLORS.gold : COLORS.danger, 0.9).strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 18);
    const title = text(this, cx, cy - 62, r.title, 40, victory ? COLORS.gold : COLORS.lives);
    const line = text(this, cx, cy - 12, r.line, 20, COLORS.text, false);
    const restart = button(this, cx, cy + 58, 'Restart', () => this.gs.startRun(), { width: 190, height: 56, fontSize: 24 });
    this.overlay = this.add.container(0, 0, [dim, panel, title, line, restart.container]).setAlpha(0);
    this.tweens.add({ targets: this.overlay, alpha: 1, duration: 250 });
  }

  private hideOverlay(): void {
    this.overlay?.destroy();
    this.overlay = null;
  }
}
