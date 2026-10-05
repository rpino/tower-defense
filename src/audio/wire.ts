// Connects the audio engine to the page and the game (design §3.7).
import Phaser from 'phaser';
import { EV } from '../scenes/GameScene';
import type { SimEvent } from '../sim/state';
import type { AudioEngine } from './audio';
import { sfxForEvent } from './sfx';

export function wireAudio(game: Phaser.Game, engine: AudioEngine): void {
  // Unlock/resume from native gesture handlers so iOS Safari counts them as
  // user gestures no matter how Phaser schedules its own input (AC-9.4, R3).
  // Before the first tap nothing exists, so nothing can play.
  const gesture = () => engine.unlock();
  document.addEventListener('pointerup', gesture, true);
  document.addEventListener('touchend', gesture, true);

  // AC-10.5: Phaser pauses its loop on these; audio follows.
  game.events.on(Phaser.Core.Events.HIDDEN, () => engine.onHidden());
  game.events.on(Phaser.Core.Events.VISIBLE, () => engine.onVisible());

  // AC-9.2: gameplay sounds.
  game.events.on(EV.sim, (ev: SimEvent) => {
    const key = sfxForEvent(ev);
    if (key) engine.play(key);
  });
}
