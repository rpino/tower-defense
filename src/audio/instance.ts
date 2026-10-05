// The single audio engine for the page (design §3.7: one AudioContext).
import { AudioEngine } from './audio';

export const audio = new AudioEngine();
