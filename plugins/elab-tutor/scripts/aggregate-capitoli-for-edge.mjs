#!/usr/bin/env node
/**
 * Aggregator — 37 capitoli JSON → 1 capitoli.json for Edge Function (Deno)
 * Andrea Marro 2026-04-25 (Sprint Q3.B)
 *
 * Output: supabase/functions/capitoli.json
 * Consumed by: supabase/functions/_shared/capitoli-loader.ts
 *
 * Why: Vite import.meta.glob non funziona in Deno. Pre-build 1 JSON.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src/data/capitoli');
const DEST = join(ROOT, 'supabase/functions/capitoli.json');

const files = readdirSync(SRC).filter((f) => f.endsWith('.json'));
const capitoli = files.map((f) => JSON.parse(readFileSync(join(SRC, f), 'utf8')));
capitoli.sort((a, b) => {
  if (a.volume !== b.volume) return a.volume - b.volume;
  if (a.type === 'bonus' && b.type !== 'bonus') return 1;
  if (b.type === 'bonus' && a.type !== 'bonus') return -1;
  return (a.capitolo ?? 0) - (b.capitolo ?? 0);
});

writeFileSync(DEST, JSON.stringify({ generated: new Date().toISOString(), count: capitoli.length, capitoli }, null, 2) + '\n', 'utf8');
console.log(`[aggregate] wrote ${capitoli.length} Capitoli to ${DEST}`);
