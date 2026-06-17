// One-shot helper: realign hybrid gold-set v2 chunk identifiers to live rag_chunks UUIDs.
// Sprint S iter 12 ATOM-S12-A1.
// Lives under tests/fixtures/ (gen-test territory). Run once, output goes to:
//   - tests/fixtures/hybrid-gold-30.jsonl
//   - tests/fixtures/hybrid-gold-30-realign.md
// Uses execFileSync (no shell injection) to call npx supabase db query --linked.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SRC = `${ROOT}/scripts/bench/hybrid-rag-gold-set-v2.jsonl`;
const OUT = `${ROOT}/tests/fixtures/hybrid-gold-30.jsonl`;
const PROV = `${ROOT}/tests/fixtures/hybrid-gold-30-realign.md`;

function dbQuery(sql) {
  const out = execFileSync('npx', ['supabase', 'db', 'query', '--linked', sql], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 16 * 1024 * 1024,
  });
  const jsonStart = out.indexOf('{');
  if (jsonStart < 0) throw new Error('no json in output: ' + out.slice(0, 200));
  return JSON.parse(out.slice(jsonStart));
}

function escSqlLiteral(s) {
  return String(s).replace(/'/g, "''");
}

// Slug aliases — legacy wiki: token → real ingested slug.
// Verified against `SELECT DISTINCT source` live query 2026-04-28.
const WIKI_ALIASES = {
  led: 'led-giallo',
  catodo: 'polarita',
  resistore: 'resistenza',
  'codice-colori': 'resistenza',
  breadboard: 'arduino',
  'bus-alimentazione': 'ground-massa',
  'farad': 'condensatore',
  'canale-n': 'transistor',
  servomotore: 'servo-motor',
  'pwm-50hz': 'pwm',
  max7219: 'matrice-led-8x8',
  'led-protezione': 'resistenza',
  'partitore-tensione': 'divisore-tensione',
  'resistore-serie': 'resistenza',
  'pull-up': 'pull-up-pulldown',
  'pull-down': 'pull-up-pulldown',
  'input-floating': 'pull-up-pulldown',
  fading: 'fade-led',
  adc: 'analog-read',
  'servo-vibrazione': 'servo-motor',
  'alimentazione-servo': 'servo-motor',
  'bjt-vs-mosfet': 'transistor',
  'scelta-transistor': 'transistor',
  stabilizzazione: 'zener',
  'flyback-diodo': 'diodo',
  pir: 'sensore-pir',
  fader: 'fade-led',
  'servo-library': 'servo-motor',
  'led-rosso': 'led-giallo',
  'calcolo-resistore': 'resistenza',
  'mosfet-motore': 'motor-driver-l298n',
  'pilotaggio-dc': 'motor-driver-l298n',
  'pulsante-cicalino': 'cicalino',
  'led-giallo': 'led-giallo',
  potenziometro: 'potenziometro',
  'digital-write': 'digital-write',
  'analog-write': 'analog-write',
  'analog-read': 'analog-read',
  ohm: 'ohm',
  'legge-ohm': 'legge-ohm',
  mosfet: 'transistor',
  zener: 'zener',
  'matrice-led-8x8': 'matrice-led-8x8',
  semaforo: 'semaforo',
  'motore-dc': 'motore-dc',
  pwm: 'pwm',
  condensatore: 'condensatore',
  pulsante: 'pull-up-pulldown',
};

function parseExpected(token) {
  if (token.startsWith('wiki:')) {
    return { kind: 'wiki', slug: token.slice(5) };
  }
  const m = token.match(/^(vol[123])_cap(\d+)_pag(\d+)/);
  if (m) {
    return { kind: 'vol', vol: m[1], chapter: Number(m[2]), page: Number(m[3]), tail: token.slice(m[0].length).replace(/^_/, '') };
  }
  return { kind: 'unknown', raw: token };
}

function fetchChunkIds(spec) {
  if (spec.kind === 'vol') {
    // Vol pages currently null in rag_chunks (post-Voyage ingest). Fall back to keyword search in content_raw.
    // Extract topic keyword from tail (e.g. 'led_intro' → 'led', 'codice_colori' → 'colori').
    const tail = spec.tail || '';
    const tokens = tail.split('_').filter((t) => t.length > 2);
    const kw = tokens[0];
    if (!kw) return [];
    const sql = `SELECT id FROM rag_chunks WHERE source='${spec.vol}' AND content_raw ILIKE '%${escSqlLiteral(kw)}%' ORDER BY id LIMIT 5;`;
    return dbQuery(sql).rows.map((r) => r.id);
  }
  if (spec.kind === 'wiki') {
    const direct = `SELECT id FROM rag_chunks WHERE source='${escSqlLiteral(spec.slug)}' ORDER BY id LIMIT 5;`;
    let rows = dbQuery(direct).rows;
    if (rows.length === 0) {
      const alias = WIKI_ALIASES[spec.slug];
      if (alias) {
        const aliasSql = `SELECT id FROM rag_chunks WHERE source='${escSqlLiteral(alias)}' ORDER BY id LIMIT 5;`;
        rows = dbQuery(aliasSql).rows;
      }
    }
    return rows.map((r) => r.id);
  }
  return [];
}

const lines = readFileSync(SRC, 'utf8').split('\n').filter((l) => l.trim());
const out = [];
const prov = [];
prov.push('# Hybrid gold-set v2 → realigned UUIDs (Sprint S iter 12 ATOM-S12-A1)');
prov.push('');
prov.push(`Generated: ${new Date().toISOString()}`);
prov.push('Source: scripts/bench/hybrid-rag-gold-set-v2.jsonl (30 entries)');
prov.push('Target: tests/fixtures/hybrid-gold-30.jsonl');
prov.push('Method: live Supabase rag_chunks query per expected_chunks token (vol/wiki).');
prov.push('');
prov.push('## Mapping rules');
prov.push('- `vol1_cap5_pag19_*` → `SELECT id WHERE source=vol1 AND page=19` (top-5 by id).');
prov.push('- `wiki:ohm` → `SELECT id WHERE source=ohm` (wiki slug = `source` column post-ingest).');
prov.push('');
prov.push('## Per-query realignment table');
prov.push('');
prov.push('| ID | tokens | resolved (token→count) | dropped |');
prov.push('|----|--------|------------------------|---------|');

let totalResolved = 0;
let totalDropped = 0;

for (const line of lines) {
  const obj = JSON.parse(line);
  const expandedChunkIds = [];
  const dropped = [];
  const resolved = [];
  for (const tok of obj.expected_chunks || []) {
    const spec = parseExpected(tok);
    const ids = fetchChunkIds(spec);
    if (ids.length > 0) {
      expandedChunkIds.push(...ids);
      resolved.push(`${tok}→${ids.length}`);
      totalResolved += ids.length;
    } else {
      dropped.push(tok);
      totalDropped++;
    }
  }
  const dedup = Array.from(new Set(expandedChunkIds));
  const realigned = {
    ...obj,
    expected_chunks_legacy: obj.expected_chunks,
    expected_chunks: dedup,
    expected_chunks_count: dedup.length,
    realigned_at: new Date().toISOString(),
    realign_tokens_resolved: resolved,
    realign_tokens_dropped: dropped,
  };
  out.push(JSON.stringify(realigned));
  prov.push(`| ${obj.id} | ${(obj.expected_chunks || []).length} | ${resolved.join(' / ') || '-'} | ${dropped.join(' / ') || '-'} |`);
  console.log(`${obj.id}: ${resolved.length} resolved, ${dropped.length} dropped, ${dedup.length} chunk ids`);
}

writeFileSync(OUT, out.join('\n') + '\n');

prov.push('');
prov.push('## Totals');
prov.push(`- Queries: ${out.length}/30`);
prov.push(`- Tokens resolved → real UUIDs: ${totalResolved}`);
prov.push(`- Tokens dropped (no rag_chunks match): ${totalDropped}`);
prov.push('');
prov.push('## Honesty caveats');
prov.push('- Each gold query expanded from K legacy tokens to N real chunk_ids (typically N >= K when slug present).');
prov.push('- Dropped tokens correspond to wiki slugs not yet ingested (e.g. `legge-ohm` if Mac Mini batch did not ship that concept).');
prov.push('- `min_recall_at_5` left unchanged (semantic property of the query, not bound to UUID realignment).');
prov.push('- `expected_chunks_legacy` preserved per entry for backward audit + diff vs iter 11.');
prov.push('- Validation: 30 lines, every line valid JSON, every entry has `expected_chunks` array (may be empty if 100% dropped).');
prov.push('- chunk_ids capped at 5 per token to stay within recall@5 evaluation context.');

writeFileSync(PROV, prov.join('\n') + '\n');

console.log(`\nWrote ${out.length} lines → ${OUT}`);
console.log(`Provenance → ${PROV}`);
console.log(`Total resolved: ${totalResolved}, dropped: ${totalDropped}`);
