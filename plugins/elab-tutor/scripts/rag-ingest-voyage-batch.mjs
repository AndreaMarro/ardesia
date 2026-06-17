#!/usr/bin/env node
// ELAB RAG Ingest BATCH overnight (Voyage 3 RPM no-payment)
// Sprint S iter 7 — batch 15 chunks/call + sleep 21s rate limit
// 6000 chunks ~2.2h overnight

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const TOGETHER_API_KEY = (process.env.TOGETHER_API_KEY || '').trim();
const VOYAGE_API_KEY = (process.env.VOYAGE_API_KEY || '').trim();
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co').trim();
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!TOGETHER_API_KEY || !VOYAGE_API_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: TOGETHER_API_KEY + VOYAGE_API_KEY + SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const SOURCES = {
  vol1: path.join(REPO_ROOT, '..', '..', 'CONTENUTI', 'volumi-pdf', 'vol1.txt'),
  vol2: path.join(REPO_ROOT, '..', '..', 'CONTENUTI', 'volumi-pdf', 'vol2.txt'),
  vol3: path.join(REPO_ROOT, '..', '..', 'CONTENUTI', 'volumi-pdf', 'vol3.txt'),
  wiki: path.join(REPO_ROOT, 'docs', 'unlim-wiki', 'concepts'),
};

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;
const BATCH_SIZE = 15;
const RATE_DELAY_MS = 21000;  // Voyage 3 RPM no-payment

function chunkText(text, source_id, source_type) {
  const out = [];
  for (let i = 0; i < text.length; i += (CHUNK_SIZE - CHUNK_OVERLAP)) {
    const piece = text.slice(i, i + CHUNK_SIZE).trim();
    if (piece.length < 100) continue;
    out.push({ source_id, source_type, chunk_index: out.length, content: piece, char_start: i, char_end: Math.min(i + CHUNK_SIZE, text.length) });
  }
  return out;
}

async function contextualize(fullDoc, chunkText) {
  const docPreview = fullDoc.slice(0, 4000);
  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      max_tokens: 80,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Genera descrizioni contestuali brevi (max 50 parole) per chunk italiani. Solo descrizione.' },
        { role: 'user', content: `<doc>\n${docPreview}\n</doc>\n\n<chunk>\n${chunkText}\n</chunk>\n\nDescrizione contesto chunk dentro doc (max 50 parole):` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Together ${res.status}: ${(await res.text()).slice(0, 150)}`);
  return (await res.json()).choices[0].message.content.trim();
}

async function embedBatch(texts) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VOYAGE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: texts, model: 'voyage-multilingual-2', input_type: 'document' }),
  });
  if (!res.ok) throw new Error(`Voyage ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).data.map(d => d.embedding);
}

async function storeChunk(chunk, contextual, embedding) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rag_chunks`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      content: `${contextual}\n\n${chunk.content}`,
      content_raw: chunk.content,
      embedding,
      source: chunk.source_id,
      contextual_summary: contextual,
      metadata: {
        chunk_index: chunk.chunk_index,
        char_start: chunk.char_start,
        char_end: chunk.char_end,
        source_type: chunk.source_type,
      },
    }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 150)}`);
}

async function ingest(source_id, source_type, text) {
  const chunks = chunkText(text, source_id, source_type);
  console.log(`[${source_id}] ${chunks.length} chunks (batch ${BATCH_SIZE}, rate ${RATE_DELAY_MS}ms)`);

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const ctxs = [];
    for (const c of batch) {
      try { ctxs.push(await contextualize(text, c.content)); }
      catch (e) { ctxs.push(''); errors++; }
    }
    let embs;
    try {
      const texts = batch.map((c, j) => `${ctxs[j]}\n\n${c.content}`);
      embs = await embedBatch(texts);
    } catch (e) {
      errors++;
      console.error(`\n[${source_id}@batch ${i}] EMBED: ${e.message.slice(0, 150)}`);
      if (errors > 8) { console.error(`\n[${source_id}] HALT errors > 8`); return { processed, errors }; }
      await new Promise(r => setTimeout(r, RATE_DELAY_MS));
      continue;
    }
    for (let j = 0; j < batch.length; j++) {
      try { await storeChunk(batch[j], ctxs[j], embs[j]); processed++; }
      catch (e) { errors++; }
    }
    process.stdout.write(`[${source_id}] ${processed}/${chunks.length} (err ${errors})  \r`);
    if (i + BATCH_SIZE < chunks.length) await new Promise(r => setTimeout(r, RATE_DELAY_MS));
  }
  console.log(`\n[${source_id}] DONE: ${processed} processed, ${errors} errors`);
  return { processed, errors };
}

async function main() {
  console.log('=== RAG Ingest Voyage BATCH overnight ===');
  console.log(`Batch ${BATCH_SIZE} chunks/call, sleep ${RATE_DELAY_MS}ms (3 RPM Voyage no-payment)\n`);

  let total = { processed: 0, errors: 0 };

  for (const vol of ['vol1', 'vol2', 'vol3']) {
    if (!fs.existsSync(SOURCES[vol])) { console.log(`SKIP ${vol}: not found`); continue; }
    const text = fs.readFileSync(SOURCES[vol], 'utf8');
    const r = await ingest(vol, 'volume', text);
    total.processed += r.processed;
    total.errors += r.errors;
  }

  if (fs.existsSync(SOURCES.wiki)) {
    const files = fs.readdirSync(SOURCES.wiki).filter(f => f.endsWith('.md')).sort();
    for (const f of files) {
      const concept_id = f.replace(/\.md$/, '');
      const text = fs.readFileSync(path.join(SOURCES.wiki, f), 'utf8');
      const r = await ingest(concept_id, 'wiki', text);
      total.processed += r.processed;
      total.errors += r.errors;
    }
  }

  console.log(`\n=== TOTAL: ${total.processed} chunks, ${total.errors} errors ===`);
  console.log(`Cost Together: ~$${((total.processed * 0.18 / 1_000_000) * (200 + 80)).toFixed(2)}`);
  console.log(`Voyage embedding: $0 (free tier 50M tokens/mo)`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
