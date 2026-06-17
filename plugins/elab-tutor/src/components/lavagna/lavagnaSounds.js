// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * lavagnaSounds — Lightweight feedback sounds for the Lavagna
 * Uses Web Audio API (no external files). All sounds are optional and toggleable.
 * (c) Andrea Marro — 02/04/2026
 */

const STORAGE_KEY = 'elab_sounds_enabled';

let ctx = null;

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  return ctx;
}

function isEnabled() {
  try { return localStorage.getItem(STORAGE_KEY) !== 'false'; }
  catch { return true; }
}

export function setSoundsEnabled(enabled) {
  try { localStorage.setItem(STORAGE_KEY, String(enabled)); }
  catch { /* noop */ }
}

export function getSoundsEnabled() { return isEnabled(); }

function playTone(freq, duration, type = 'sine', volume = 0.08) {
  if (!isEnabled()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

/** Click on component — light tick */
export function soundTick() { playTone(800, 0.06, 'sine', 0.05); }

/** Play simulation — short ascending */
export function soundPlay() {
  playTone(440, 0.1, 'sine', 0.06);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.06), 80);
  setTimeout(() => playTone(880, 0.12, 'sine', 0.06), 160);
}

/** Pause simulation */
export function soundPause() { playTone(440, 0.15, 'sine', 0.05); }

/** Error — short buzz */
export function soundError() { playTone(200, 0.2, 'square', 0.04); }

/** Experiment completed — fanfare */
export function soundComplete() {
  playTone(523, 0.12, 'sine', 0.06);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.06), 120);
  setTimeout(() => playTone(784, 0.12, 'sine', 0.06), 240);
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.06), 360);
}
