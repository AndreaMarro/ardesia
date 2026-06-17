#!/usr/bin/env python3
"""
RAG Contextual Ingest LOCALE — sentence-transformers + Together AI

Zero signup needed (Voyage skipped). Embedding 100% locale via BGE-M3.

Setup (UNA volta):
    pip install sentence-transformers torch requests psycopg2-binary
    # Apple Silicon (M-series): torch usa MPS auto

Run:
    cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
    source ~/.zshrc
    source ~/.elab-credentials/sprint-s-tokens.env
    export TOGETHER_API_KEY SUPABASE_SERVICE_ROLE_KEY
    python3 scripts/rag-ingest-local.py

Cost stimato:
    - Together AI Llama 3.3 70B contextualization: ~$0.22 (6000 × 200 tokens × $0.18/M)
    - Embedding BGE-M3 locale: $0 (CPU/MPS)
    - Supabase pgvector storage: $0 (free tier)
    - TOTAL: ~$0.22

Tempo stimato:
    - Apple Silicon M4: ~30-50 min (6000 chunks)
    - Older Mac CPU: 1-2 ore

Output: 6000+ row in rag_chunks Supabase (1024-dim BGE-M3 embeddings)
"""

import os
import sys
import json
import time
import requests
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
    'vol1': REPO_ROOT / '..' / '..' / 'CONTENUTI' / 'volumi-pdf' / 'vol1.txt',
    'vol2': REPO_ROOT / '..' / '..' / 'CONTENUTI' / 'volumi-pdf' / 'vol2.txt',
    'vol3': REPO_ROOT / '..' / '..' / 'CONTENUTI' / 'volumi-pdf' / 'vol3.txt',
    'wiki_dir': REPO_ROOT / 'docs' / 'unlim-wiki' / 'concepts',
}

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

TOGETHER_API_KEY = os.environ.get('TOGETHER_API_KEY', '').strip()
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://euqpdueopmlllqjmqnyb.supabase.co').strip()
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()

if not TOGETHER_API_KEY:
    print("ERROR: TOGETHER_API_KEY required (contextualization)", file=sys.stderr)
    sys.exit(1)
if not SUPABASE_SERVICE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY required", file=sys.stderr)
    sys.exit(1)

# Lazy import (heavy)
print("Loading sentence-transformers BGE-M3 (~2GB download first time)...")
from sentence_transformers import SentenceTransformer
import torch

device = 'mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Device: {device}")
model = SentenceTransformer('BAAI/bge-m3', device=device)
print("Model ready.")


def chunk_text(text, source_id, source_type):
    chunks = []
    for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP):
        piece = text[i:i + CHUNK_SIZE].strip()
        if len(piece) < 100:
            continue
        chunks.append({
            'source_id': source_id,
            'source_type': source_type,
            'chunk_index': len(chunks),
            'content': piece,
            'char_start': i,
            'char_end': min(i + CHUNK_SIZE, len(text)),
        })
    return chunks


def contextualize(full_doc, chunk_text):
    """Together AI Llama 3.3 70B contextualization."""
    doc_preview = full_doc[:4000]
    res = requests.post(
        'https://api.together.xyz/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {TOGETHER_API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'model': 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            'max_tokens': 80,
            'temperature': 0.3,
            'messages': [
                {'role': 'system', 'content': 'Genera descrizioni contestuali brevi (max 50 parole) per chunk italiani. Solo descrizione.'},
                {'role': 'user', 'content': f'<doc>\n{doc_preview}\n</doc>\n\n<chunk>\n{chunk_text}\n</chunk>\n\nDescrizione contesto chunk dentro doc (max 50 parole):'},
            ],
        },
        timeout=30,
    )
    res.raise_for_status()
    return res.json()['choices'][0]['message']['content'].strip()


def store(chunk, contextual, embedding):
    res = requests.post(
        f'{SUPABASE_URL}/rest/v1/rag_chunks',
        headers={
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        json={
            'content': f'{contextual}\n\n{chunk["content"]}',
            'content_raw': chunk['content'],
            'embedding': embedding,
            'source': chunk['source_id'],
            'contextual_summary': contextual,
            'metadata': {
                'chunk_index': chunk['chunk_index'],
                'char_start': chunk['char_start'],
                'char_end': chunk['char_end'],
                'source_type': chunk['source_type'],
            },
        },
        timeout=30,
    )
    if not res.ok and res.status_code != 409:
        raise Exception(f'Supabase {res.status_code}: {res.text[:200]}')


def ingest_source(source_id, source_type, text):
    chunks = chunk_text(text, source_id, source_type)
    print(f'\n[{source_id}] {len(chunks)} chunks')

    BATCH = 32  # embedding batch size (BGE-M3 efficient batches)
    processed = 0
    errors = 0

    for batch_start in range(0, len(chunks), BATCH):
        batch = chunks[batch_start:batch_start + BATCH]

        # 1. Contextualize batch sequentially (Together rate ~10 RPM)
        contextuals = []
        for c in batch:
            try:
                ctx = contextualize(text, c['content'])
                contextuals.append(ctx)
            except Exception as e:
                print(f'  [ctx err] {c["chunk_index"]}: {e}', file=sys.stderr)
                contextuals.append('')  # fallback empty
                errors += 1
                if errors > 20:
                    print(f'\n[{source_id}] HALT errors > 20')
                    return processed, errors
            time.sleep(0.5)  # rate limit Together (be polite)

        # 2. Embed batch (BGE-M3 fast on MPS)
        texts_to_embed = [f'{contextuals[i]}\n\n{batch[i]["content"]}' for i in range(len(batch))]
        embeddings = model.encode(texts_to_embed, normalize_embeddings=True, show_progress_bar=False)

        # 3. Store batch
        for i, c in enumerate(batch):
            try:
                store(c, contextuals[i], embeddings[i].tolist())
                processed += 1
            except Exception as e:
                print(f'  [store err] {c["chunk_index"]}: {e}', file=sys.stderr)
                errors += 1

        sys.stdout.write(f'\r[{source_id}] {processed}/{len(chunks)} (errors {errors})')
        sys.stdout.flush()

    print(f'\n[{source_id}] DONE: {processed} processed, {errors} errors')
    return processed, errors


def main():
    print(f'\n=== RAG Contextual Ingest LOCAL — sentence-transformers + Together ===')
    print(f'Chunk size: {CHUNK_SIZE}, overlap: {CHUNK_OVERLAP}')
    print(f'Embedding: BGE-M3 (1024-dim, locale {device})')
    print(f'Contextualization: Together Llama 3.3 70B')
    print(f'Storage: Supabase pgvector\n')

    total_processed = 0
    total_errors = 0

    # Volumi PDFs
    for vol in ['vol1', 'vol2', 'vol3']:
        path = SOURCES[vol]
        if not path.exists():
            print(f'SKIP {vol}: {path} missing')
            continue
        text = path.read_text(encoding='utf-8')
        p, e = ingest_source(vol, 'volume', text)
        total_processed += p
        total_errors += e

    # Wiki concepts
    wiki_dir = SOURCES['wiki_dir']
    if wiki_dir.exists():
        for f in sorted(wiki_dir.glob('*.md')):
            concept_id = f.stem
            text = f.read_text(encoding='utf-8')
            p, e = ingest_source(concept_id, 'wiki', text)
            total_processed += p
            total_errors += e

    print(f'\n=== TOTAL: {total_processed} chunks ingested, {total_errors} errors ===')
    cost_together = (total_processed * 200 / 1_000_000) * 0.18 + (total_processed * 80 / 1_000_000) * 0.18
    print(f'Cost Together: ~${cost_together:.2f}')
    print(f'Cost embedding: $0 (local BGE-M3 on {device})')


if __name__ == '__main__':
    main()
