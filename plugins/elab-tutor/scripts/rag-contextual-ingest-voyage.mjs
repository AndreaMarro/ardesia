#!/usr/bin/env node
// ELAB Sprint S iter 6 — RAG Contextual Ingest via Anthropic + Voyage AI stack
// Ingest 6000+ chunks Vol1+Vol2+Vol3 + wiki concepts → contextualized → embedded → Supabase pgvector
//
// Architecture (no GPU dependency):
// - Contextualization: Anthropic Claude Haiku 4.5 (~$0.25/M input + $1.25/M output)
// - Embedding: Voyage AI voyage-multilingual-2 (FREE 50M tokens/mo, BEST per italiano)
// - Storage: Supabase pgvector (1024-dim Voyage)
//
// Estimated cost: ~$0.50-1.00 one-time (well within free Voyage tier + small Anthropic spend)
//
// Usage:
//   source ~/.zshrc
//   source ~/.elab-credentials/sprint-s-tokens.env
//   node scripts/rag-contextual-ingest-voyage.mjs
//
// Requirements env:
//   ANTHROPIC_API_KEY ✅ (already SET)
//   VOYAGE_API_KEY ❌ (Andrea signup voyageai.com FREE → add to env)
//   SUPABASE_ACCESS_TOKEN ✅ (already SET)
//   SUPABASE_URL = https://euqpdueopmlllqjmqnyb.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY (NOT in env — Andrea aggiunge da Dashboard Settings → API)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY || '').trim();
const VOYAGE_API_KEY = (process.env.VOYAGE_API_KEY || '').trim();
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co').trim();
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Note: ANTHROPIC_API_KEY no longer required (replaced by TOGETHER_API_KEY for contextualization)
const TOGETHER_API_KEY = (process.env.TOGETHER_API_KEY || '').trim();
if (!TOGETHER_API_KEY) { console.error('ERROR: TOGETHER_API_KEY required (contextualization)'); process.exit(1); }
if (!VOYAGE_API_KEY) { console.error('ERROR: VOYAGE_API_KEY required (signup voyageai.com FREE 50M tokens/mo)'); process.exit(1); }
if (!SUPABASE_SERVICE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY required (recovered tick 52 via Management API)'); process.exit(1); }

const SOURCES = {
  vol1_txt: path.join(REPO_ROOT, '..', '..', 'CONTENUTI', 'volumi-pdf', 'vol1.txt'),
  vol2_txt: path.join(REPO_ROOT, '..', '..', 'CONTENUTI', 'volumi-pdf', 'vol2.txt'),
  vol3_txt: path.join(REPO_ROOT, '..', '..', 'CONTENUTI', 'volumi-pdf', 'vol3.txt'),
  wiki_dir: path.join(REPO_ROOT, 'docs', 'unlim-wiki', 'concepts'),
};

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;
const TARGET_CHUNKS = 6000;

// Helper: split text into overlapping chunks
function chunkText(text, source_id, source_type) {
  const chunks = [];
  for (let i = 0; i < text.length; i += (CHUNK_SIZE - CHUNK_OVERLAP)) {
    const piece = text.slice(i, i + CHUNK_SIZE);
    if (piece.trim().length < 100) continue;  // skip tiny chunks
    chunks.push({
      source_id,
      source_type,
      chunk_index: chunks.length,
      content: piece.trim(),
      char_start: i,
      char_end: Math.min(i + CHUNK_SIZE, text.length),
    });
  }
  return chunks;
}

// Helper: contextualize chunk via Together AI Llama 3.3 70B (cheaper than Anthropic)
async function contextualizeChunk(fullDoc, chunkText) {
  const docPreview = fullDoc.slice(0, 4000);
  const TOGETHER_KEY = (process.env.TOGETHER_API_KEY || '').trim();
  if (!TOGETHER_KEY) throw new Error('TOGETHER_API_KEY required');
  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOGETHER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      max_tokens: 100,
      temperature: 0.3,
      messages: [{
        role: 'system',
        content: 'Genera descrizioni contestuali brevi (max 50 parole) per chunk di documenti italiani. Solo la descrizione, nessun preambolo.',
      }, {
        role: 'user',
        content: `<document>\n${docPreview}\n</document>\n\n<chunk>\n${chunkText}\n</chunk>\n\nDescrizione contestuale del chunk dentro al documento (max 50 parole):`,
      }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Together ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// Helper: embed BATCH texts via Voyage AI (max 15 per request to stay <10K TPM)
async function embedBatch(texts) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: texts,  // array OK
      model: 'voyage-multilingual-2',
      input_type: 'document',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.data.map(d => d.embedding);  // array of 1024-dim
}

// Helper: single text fallback
async function embedText(text) {
  const r = await embedBatch([text]);
  return r[0];
}

// Helper: store chunk to Supabase pgvector (schema rag_chunks_hybrid)
async function storeChunk(chunk, contextualText, embedding) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rag_chunks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      content: `${contextualText}\n\n${chunk.content}`,  // contextualized prepend
      content_raw: chunk.content,                          // raw for citation
      embedding: embedding,
      source: chunk.source_id,                             // 'vol1'/'vol2'/'vol3'/'wiki'/'concept_id'
      contextual_summary: contextualText,
      metadata: {
        chunk_index: chunk.chunk_index,
        char_start: chunk.char_start,
        char_end: chunk.char_end,
        source_type: chunk.source_type,
      },
    }),
  });
  if (!res.ok && res.status !== 409) {
    const err = await res.text();
    throw new Error(`Supabase ${res.status}: ${err.slice(0, 200)}`);
  }
}

async function ingestSource(source_id, source_type, text) {
  const chunks = chunkText(text, source_id, source_type);
  console.log(`[${source_id}] ${chunks.length} chunks`);

  let processed = 0;
  let errors = 0;
  for (const chunk of chunks) {
    try {
      const contextualText = await contextualizeChunk(text, chunk.content);
      const embedding = await embedText(`${contextualText}\n\n${chunk.content}`);
      await storeChunk(chunk, contextualText, embedding);
      processed++;
      if (processed % 10 === 0) {
        process.stdout.write(`[${source_id}] ${processed}/${chunks.length}\r`);
      }
    } catch (err) {
      errors++;
      console.error(`\n[${source_id}#${chunk.chunk_index}] ERROR: ${err.message}`);
      if (errors > 10) {
        console.error('Too many errors, halting');
        return { processed, errors, halted: true };
      }
    }
  }
  console.log(`\n[${source_id}] DONE: ${processed} processed, ${errors} errors`);
  return { processed, errors };
}

async function main() {
  console.log('=== RAG Contextual Ingest — Anthropic + Voyage stack ===');
  console.log(`Target: ${TARGET_CHUNKS} chunks (Vol1+Vol2+Vol3 + wiki)`);
  console.log(`Chunk size: ${CHUNK_SIZE} chars, overlap ${CHUNK_OVERLAP}`);

  let total = { processed: 0, errors: 0 };

  // 1. Volumi PDF text
  for (const [vol, txtPath] of [['vol1', SOURCES.vol1_txt], ['vol2', SOURCES.vol2_txt], ['vol3', SOURCES.vol3_txt]]) {
    if (!fs.existsSync(txtPath)) {
      console.error(`SKIP ${vol}: ${txtPath} not found`);
      continue;
    }
    const text = fs.readFileSync(txtPath, 'utf8');
    const r = await ingestSource(vol, 'volume', text);
    total.processed += r.processed;
    total.errors += r.errors;
  }

  // 2. Wiki concepts
  if (fs.existsSync(SOURCES.wiki_dir)) {
    const wikiFiles = fs.readdirSync(SOURCES.wiki_dir).filter(f => f.endsWith('.md'));
    for (const f of wikiFiles) {
      const concept_id = f.replace(/\.md$/, '');
      const text = fs.readFileSync(path.join(SOURCES.wiki_dir, f), 'utf8');
      const r = await ingestSource(concept_id, 'wiki', text);
      total.processed += r.processed;
      total.errors += r.errors;
    }
  }

  console.log(`\n=== TOTAL: ${total.processed} chunks ingested, ${total.errors} errors ===`);
  console.log(`Costs estimate:`);
  console.log(`  Anthropic Haiku: ~$${(total.processed * 200 / 1_000_000 * 0.25).toFixed(2)} (input) + ~$${(total.processed * 80 / 1_000_000 * 1.25).toFixed(2)} (output)`);
  console.log(`  Voyage embedding: $0 (free tier 50M tokens/mo, used ~${(total.processed * 300 / 1_000).toFixed(0)}K tokens)`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
