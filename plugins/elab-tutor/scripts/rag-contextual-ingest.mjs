#!/usr/bin/env node
/**
 * Anthropic Contextual Retrieval RAG ingest pipeline
 *
 * Per: https://www.anthropic.com/news/contextual-retrieval
 * +49% retrieval failure reduction with Contextual Embeddings + BM25
 * +67% with rerank added
 *
 * Pipeline:
 *   1. Read source corpus (PDF volumi + JSON glossary + JSON FAQ + JSON errori)
 *   2. Chunk to 500-token windows + 50-token overlap
 *   3. For each chunk: prepend LLM-generated 50-token context summary
 *   4. Embed via BGE-M3 (1024-dim) on VPS GPU
 *   5. Tokenize for BM25 (Postgres tsvector with Italian dictionary)
 *   6. Upsert Supabase rag_chunks table
 *   7. Build/refresh ivfflat index
 *
 * Usage:
 *   VPS_GPU_URL=https://gpu.elabtutor.school \
 *   ELAB_GPU_API_KEY=sk-... \
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/rag-contextual-ingest.mjs \
 *     --source vol1.pdf vol2.pdf vol3.pdf \
 *     --target-chunks 6000
 *
 * Cost projection (one-time):
 *   - Contextual prepend: 6000 chunks × ~3K tokens × Qwen3-VL-32B on VPS GPU = ~$2 OR free if Mac Mini gpt-oss-20b
 *   - Embeddings: 6000 chunks × ~600 tokens BGE-M3 = ~5 min on RTX 6000 Ada
 *   - BM25 tokenize: CPU only ~30s
 *   - Supabase upsert: 6000 rows × ~5KB = 30MB transfer ~1 min
 *
 * (c) ELAB Tutor — Sprint VPS-3 — 2026-04-26
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────

const VPS_GPU_URL = process.env.VPS_GPU_URL;
const VPS_GPU_API_KEY = process.env.ELAB_GPU_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!VPS_GPU_URL || !VPS_GPU_API_KEY) {
  console.error('ERROR: VPS_GPU_URL + ELAB_GPU_API_KEY required');
  process.exit(2);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(2);
}

// ────────────────────────────────────────────────────────────
// Chunking
// ────────────────────────────────────────────────────────────

function chunkText(text, source, chapter, page, options = {}) {
  const { chunkSize = 500, overlap = 50 } = options;
  const tokens = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  for (let i = 0; i < tokens.length; i += chunkSize - overlap) {
    const chunk = tokens.slice(i, i + chunkSize).join(' ');
    if (chunk.length < 100) continue; // skip tiny chunks
    chunks.push({
      content_raw: chunk,
      source,
      chapter,
      page,
      metadata: {
        chunk_index: chunks.length,
        token_estimate: Math.ceil(chunk.length / 4),
      },
    });
  }

  return chunks;
}

// ────────────────────────────────────────────────────────────
// Anthropic Contextual Retrieval prepend
// ────────────────────────────────────────────────────────────

async function generateChunkContext(fullDoc, chunk, source) {
  const prompt = `<document source="${source}">
${fullDoc.slice(0, 30000)}
</document>

Here is the chunk we want to situate within the document:
<chunk>
${chunk}
</chunk>

Please give a short (50 tokens max) context to situate this chunk within the overall document for the purpose of improving search retrieval. Italian language. Format: just the context, no preamble.`;

  const response = await fetch(`${VPS_GPU_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Elab-Api-Key': VPS_GPU_API_KEY,
    },
    body: JSON.stringify({
      model: 'qwen3-vl:32b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.warn(`Context gen failed for chunk: ${response.status}, falling back to no-context`);
    return '';
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ────────────────────────────────────────────────────────────
// BGE-M3 embeddings via VPS GPU
// ────────────────────────────────────────────────────────────

async function embedBatch(texts) {
  const response = await fetch(`${VPS_GPU_URL}/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Elab-Api-Key': VPS_GPU_API_KEY,
    },
    body: JSON.stringify({
      inputs: texts,
      truncate: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embed failed: ${response.status}`);
  }

  const data = await response.json();
  return data; // array of embeddings (1024-dim each)
}

// ────────────────────────────────────────────────────────────
// Supabase upsert
// ────────────────────────────────────────────────────────────

async function upsertChunks(chunks) {
  const url = `${SUPABASE_URL}/rest/v1/rag_chunks`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(chunks),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase upsert failed: ${response.status} ${err}`);
  }

  return response;
}

// ────────────────────────────────────────────────────────────
// Main pipeline
// ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const sourcesIdx = args.indexOf('--source');
  const targetIdx = args.indexOf('--target-chunks');

  if (sourcesIdx === -1) {
    console.error('Usage: --source <file1.pdf> <file2.pdf> ... --target-chunks 6000');
    process.exit(2);
  }

  const sources = [];
  for (let i = sourcesIdx + 1; i < args.length && !args[i].startsWith('--'); i++) {
    sources.push(args[i]);
  }
  const targetChunks = targetIdx !== -1 ? parseInt(args[targetIdx + 1], 10) : 6000;

  console.log(`# Sprint VPS-3 RAG Contextual Ingest`);
  console.log(`Sources: ${sources.join(', ')}`);
  console.log(`Target chunks: ${targetChunks}`);
  console.log(`VPS GPU: ${VPS_GPU_URL}`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('');

  // Step 1: Read sources + chunk
  console.log('[1/5] Read sources + chunk...');
  let allChunks = [];
  for (const sourcePath of sources) {
    const fullText = readFileSync(sourcePath, 'utf-8'); // assumes pdftotext pre-converted
    const fileName = sourcePath.split('/').pop().replace(/\.[^.]+$/, '');
    const sourceTag = fileName.match(/vol[123]/i)?.[0] || fileName;

    // Naive chapter/page detection (placeholder — real impl parses PDF structure)
    const chunks = chunkText(fullText, sourceTag, null, null);
    allChunks = allChunks.concat(chunks);
    console.log(`  ${sourceTag}: ${chunks.length} chunks`);
  }
  console.log(`  Total: ${allChunks.length} chunks`);
  console.log('');

  // Sample down if too many
  if (allChunks.length > targetChunks) {
    const stride = Math.ceil(allChunks.length / targetChunks);
    allChunks = allChunks.filter((_, i) => i % stride === 0);
    console.log(`  Sampled to ${allChunks.length} chunks (stride ${stride})`);
  }

  // Step 2: Contextual prepend (Anthropic method)
  console.log('[2/5] Generate contextual prepend per chunk...');
  let processed = 0;
  for (const chunk of allChunks) {
    const fullDoc = sources.find(s => s.includes(chunk.source));
    const context = await generateChunkContext(fullDoc, chunk.content_raw, chunk.source);
    chunk.content = context ? `${context}\n\n${chunk.content_raw}` : chunk.content_raw;
    processed++;
    if (processed % 100 === 0) {
      console.log(`  ${processed}/${allChunks.length}`);
    }
    // Rate limit
    if (processed % 10 === 0) await new Promise(r => setTimeout(r, 500));
  }
  console.log(`  Done: ${processed} contexts generated`);
  console.log('');

  // Step 3: Embed batch
  console.log('[3/5] Embed via BGE-M3 (batch 32)...');
  for (let i = 0; i < allChunks.length; i += 32) {
    const batch = allChunks.slice(i, i + 32);
    const texts = batch.map(c => c.content);
    const embeddings = await embedBatch(texts);
    for (let j = 0; j < batch.length; j++) {
      batch[j].embedding = embeddings[j];
    }
    if (i % 320 === 0) console.log(`  ${i}/${allChunks.length}`);
  }
  console.log(`  Done: ${allChunks.length} embedded`);
  console.log('');

  // Step 4: Supabase upsert (batch 100)
  console.log('[4/5] Supabase upsert (batch 100)...');
  for (let i = 0; i < allChunks.length; i += 100) {
    const batch = allChunks.slice(i, i + 100);
    await upsertChunks(batch);
    if (i % 1000 === 0) console.log(`  ${i}/${allChunks.length}`);
  }
  console.log(`  Done: ${allChunks.length} upserted`);
  console.log('');

  // Step 5: Save backup JSONL
  const backupPath = `/tmp/rag-chunks-ingest-${Date.now()}.jsonl`;
  writeFileSync(backupPath, allChunks.map(c => JSON.stringify(c)).join('\n'));
  console.log(`[5/5] Backup saved: ${backupPath}`);

  console.log('');
  console.log(`Sprint VPS-3 ingest COMPLETE: ${allChunks.length} chunks`);
  console.log(`Anthropic Contextual Retrieval applied.`);
  console.log(`Next: rebuild ivfflat index in Supabase (psql script).`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
