// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Map experimentId → photo filename relative to /brand/foto-esperimenti/
 * Photos sourced from TRES JOLIE folders ("/ELAB - TRES JOLIE/FOTO/N FOTO VOL N/").
 *
 * Initial mapping is conservative — only experiments with verified photos.
 * Falls back to volume-generic cover if specific photo missing.
 *
 * To extend: add entries as photos audited from TRES JOLIE assets.
 */

const EXPERIMENT_PHOTO_MAP = {
  // Vol 1 — initial sample mappings (extend as TRES JOLIE photos audited)
  'v1-cap6-esp1': 'vol1/led-primo-accendi.webp',
  'v1-cap6-esp2': 'vol1/led-resistore.webp',
  'v1-cap7-esp1': 'vol1/led-rgb.webp',
};

const FALLBACK_PHOTOS = {
  1: 'vol1/_generic-vol1-cover.webp',
  2: 'vol2/_generic-vol2-cover.webp',
  3: 'vol3/_generic-vol3-cover.webp',
};

export function getPhotoFor(experimentId) {
  return EXPERIMENT_PHOTO_MAP[experimentId] || null;
}

export function getFallbackPhoto(volume) {
  return FALLBACK_PHOTOS[volume] || null;
}

export function buildPhotoUrl(experimentId, volume) {
  const specific = getPhotoFor(experimentId);
  if (specific) return `/brand/foto-esperimenti/${specific}`;
  const fallback = getFallbackPhoto(volume);
  return fallback ? `/brand/foto-esperimenti/${fallback}` : null;
}

export default EXPERIMENT_PHOTO_MAP;
