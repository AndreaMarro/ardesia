#!/usr/bin/env node
/**
 * Tea Glossario Embedding Generator — iter 22
 *
 * Reads automa/state/tea-glossario-180.json and produces 1024-dim embeddings
 * (BGE-M3 default) per termine. Output writes to:
 *   automa/state/tea-glossario-embeddings.json
 *
 * Provider strategy (waterfall):
 *   1. BGE-M3 RunPod V2  → primary (free, deferred until pod alive iter 22+)
 *   2. Voyage AI         → fallback (paid ~$0.05 for 180 termini)
 *   3. OpenAI            → last resort (text-embedding-3-large 3072d → truncate)
 *
 * Embedding text strategy:
 *   `${term}: ${technical}. ${kids_explanation}`
 * Reasoning: term first → highest TF-IDF weight; tech provides domain anchor;
 * kids extends paraphrase coverage (queries often phrased childlike).
 *
 * Usage:
 *   PROVIDER=bge node scripts/tea-glossario-embed.mjs
 *   PROVIDER=voyage VOYAGE_API_KEY=... node scripts/tea-glossario-embed.mjs
 *   PROVIDER=openai OPENAI_API_KEY=... node scripts/tea-glossario-embed.mjs
 *
 * NB: NOT executed in iter 21. Run only after RunPod V2 pod alive OR Voyage
 *     key configured. Embeddings inserted via:
 *       UPDATE wiki_concepts SET embedding = $1 WHERE vol=$2 AND cap=$3 AND term=$4;
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dirname, '..', '..', '..', 'automa', 'state');
const INPUT = join(STATE_DIR, 'tea-glossario-180.json');
const OUTPUT = join(STATE_DIR, 'tea-glossario-embeddings.json');

const PROVIDER = (process.env.PROVIDER || 'bge').toLowerCase();
const RUNPOD_URL = process.env.RUNPOD_BGE_URL || 'http://runpod-v2:8000/embed';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'text-embedding-3-large';

function buildText(t) {
  return `${t.term}: ${t.technical} ${t.kids_explanation}`.trim();
}

async function embedBgeM3(texts) {
  // BGE-M3 RunPod V2 endpoint (FastAPI custom).
  // POST {texts: [...]} -> {embeddings: [[...1024 floats], ...]}
  const res = await fetch(RUNPOD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, model: 'bge-m3' }),
  });
  if (!res.ok) throw new Error(`BGE-M3 ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.embeddings;
}

async function embedVoyage(texts) {
  if (!VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY missing');
  // voyage-3 → 1024d native. Cost: $0.06 / 1M tokens.
  // 180 termini avg ~80 tokens = 14400 tokens → ~$0.001 negligible.
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texts, model: 'voyage-3', input_type: 'document' }),
  });
  if (!res.ok) throw new Error(`Voyage ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

async function embedOpenAI(texts) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texts, model: OPENAI_MODEL, dimensions: 1024 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

const PROVIDERS = { bge: embedBgeM3, voyage: embedVoyage, openai: embedOpenAI };

async function main() {
  const data = JSON.parse(readFileSync(INPUT, 'utf8'));
  console.log(`Loaded ${data.length} termini from ${INPUT}`);
  console.log(`Provider: ${PROVIDER}`);
  if (!PROVIDERS[PROVIDER]) {
    console.error(`Unknown PROVIDER=${PROVIDER}. Use bge|voyage|openai.`);
    process.exit(1);
  }

  const texts = data.map(buildText);
  // Batch in groups of 32 (provider-friendly).
  const BATCH = 32;
  const embeddings = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    process.stdout.write(`  embedding batch ${i / BATCH + 1}/${Math.ceil(texts.length / BATCH)}...`);
    const t0 = Date.now();
    const vecs = await PROVIDERS[PROVIDER](slice);
    embeddings.push(...vecs);
    console.log(` ok (${Date.now() - t0}ms, ${vecs.length} vecs)`);
  }

  const output = data.map((t, i) => ({
    vol: t.vol,
    cap: t.cap,
    term: t.term,
    embedding: embeddings[i],
    dim: embeddings[i]?.length || 0,
    provider: PROVIDER,
  }));

  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${output.length} embeddings (dim=${output[0]?.dim}) to ${OUTPUT}`);
  console.log('Next step: load embeddings into wiki_concepts via UPDATE statements.');
}

main().catch((err) => {
  console.error('Embedding failed:', err);
  process.exit(1);
});
