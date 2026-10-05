// Connects the audio engine to the page and the game (design §3.7).
import Phaser from 'phaser';
import { EV } from '../scenes/GameScene';
import type { SimEvent } from '../sim/state';
import type { AudioEngine } from './audio';
import { Music, webAudioScheduler } from './music';
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

  // AC-9.3: music starts with each run (Start and Restart) and loops.
  let music: Music | null = null;
  const getMusic = () => {
    if (!music && engine.ctx && engine.musicBus && !engine.silent) {
      music = new Music(webAudioScheduler(engine.ctx, engine.musicBus));
    }
    return music;
  };
  window.setInterval(() => music?.tick(), 50);
  game.events.on(EV.runStarted, () => getMusic()?.start());

  game.events.on(EV.sim, (ev: SimEvent) => {
    // AC-9.2: gameplay sounds.
    const key = sfxForEvent(ev);
    if (key) engine.play(key);
    // AC-8.3: music stops and the result jingle plays.
    if (ev.type === 'victory' || ev.type === 'defeat') getMusic()?.jingle(ev.type);
  });
}
