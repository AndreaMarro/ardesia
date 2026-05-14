#!/usr/bin/env node
/**
 * EPIC 1 / ATOM A3 — Narrative canon per-experiment verification (READ-ONLY).
 *
 * Builds a 3-way alignment record per experiment: repo lesson-path claim vs
 * Tea narrative_map/metadata claim vs verbatim search against the physical
 * volume text. Output: scripts/epic1/alignment-records.json (input for the
 * per-volume subagent verdict pass). Mutates nothing under src/.
 *
 * Volume text is referenced by absolute path (Davide's raw IP — not vendored).
 * Reproducible on Andrea's machine; not portable. See ADR-047.
 *
 * Usage: node scripts/epic1/build-alignment-records.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

export const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

export function findVerbatimInVolume(volumeText, claimedText, contextChars = 240) {
  const haystack = norm(volumeText);
  const needle = norm(claimedText);
  if (!needle || needle.length < 12) return { found: false, reason: 'claim too short' };
  let idx = haystack.indexOf(needle);
  if (idx >= 0) {
    return {
      found: true, matchType: 'full',
      context: haystack.slice(Math.max(0, idx - contextChars), idx + needle.length + contextChars),
    };
  }
  const firstWords = needle.split(' ').slice(0, 8).join(' ');
  if (firstWords.length >= 12) {
    idx = haystack.indexOf(firstWords);
    if (idx >= 0) {
      return {
        found: true, matchType: 'prefix-8w',
        context: haystack.slice(Math.max(0, idx - contextChars), idx + contextChars + 400),
      };
    }
  }
  return { found: false, reason: 'not in volume text' };
}
