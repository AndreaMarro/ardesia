#!/usr/bin/env python3
"""
ELAB RAG Uploader — Genera embeddings con Gemini e carica su Supabase pgvector.
Prerequisito: aver eseguito extract-volumes-rag.py
"""

import json
import os
import time
import sys
import urllib.request
import urllib.error

# Config
GEMINI_API_KEY = 'AIzaSyB3IjfrHeG9u_yscwHamo7lT1zoWJ0ii1g'
SUPABASE_URL = 'https://euqpdueopmlllqjmqnyb.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ'
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')  # Need service role for inserts

CHUNKS_FILE = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/data/rag/all-chunks-expanded.json'
EMBEDDINGS_CACHE = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/data/rag/embeddings-cache.json'

EMBEDDING_MODEL = 'gemini-embedding-001'
EMBEDDING_DIM = 3072
BATCH_DELAY = 0.3  # seconds between API calls (rate limit)


def generate_embedding(text):
    """Generate embedding using Gemini API."""
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{EMBEDDING_MODEL}:embedContent?key={GEMINI_API_KEY}'

    payload = json.dumps({
        'model': f'models/{EMBEDDING_MODEL}',
        'content': {'parts': [{'text': text[:2048]}]},  # Limit text length
    }).encode('utf-8')

    req = urllib.request.Request(url, data=payload, headers={
        'Content-Type': 'application/json',
    })

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            values = data.get('embedding', {}).get('values', [])
            if len(values) == EMBEDDING_DIM:
                return values
            else:
                print(f"  WARNING: Got {len(values)} dims, expected {EMBEDDING_DIM}")
                return None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"  ERROR {e.code}: {body[:200]}")
        return None
    except Exception as e:
        print(f"  ERROR: {e}")
        return None


def upload_to_supabase(chunk, embedding):
    """Upload a single chunk with embedding to Supabase via REST API."""
    url = f'{SUPABASE_URL}/rest/v1/volume_chunks'

    payload = json.dumps({
        'volume': chunk['volume'],
        'chapter': chunk['chapter'],
        'section': chunk.get('section'),
        'content': chunk['content'],
        'page_number': chunk.get('page_number'),
        'token_count': chunk.get('token_count'),
        'embedding': embedding,
    }).encode('utf-8')

    # Use service role key for inserts, fall back to anon key
    auth_key = SUPABASE_SERVICE_KEY or SUPABASE_KEY

    req = urllib.request.Request(url, data=payload, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {auth_key}',
        'apikey': auth_key,
        'Prefer': 'return=minimal',
    })

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"  SUPABASE ERROR {e.code}: {body[:200]}")
        return False
    except Exception as e:
        print(f"  SUPABASE ERROR: {e}")
        return False


def main():
    # Load chunks
    with open(CHUNKS_FILE, 'r', encoding='utf-8') as f:
        chunks = json.load(f)

    print(f"Chunk totali: {len(chunks)}")

    # Load cache if exists
    cache = {}
    if os.path.exists(EMBEDDINGS_CACHE):
        with open(EMBEDDINGS_CACHE, 'r') as f:
            cache = json.load(f)
        print(f"Cache caricata: {len(cache)} embeddings")

    # Phase 1: Generate embeddings
    print(f"\n=== FASE 1: Generazione embeddings ({EMBEDDING_MODEL}) ===")
    new_embeddings = 0
    errors = 0

    for i, chunk in enumerate(chunks):
        cache_key = f"v{chunk['volume']}-p{chunk.get('page_number', 0)}-{hash(chunk['content'][:100])}"

        if cache_key in cache:
            continue  # Already cached

        print(f"  [{i+1}/{len(chunks)}] Vol{chunk['volume']} p{chunk.get('page_number', '?')} "
              f"({chunk.get('token_count', '?')} tok)...", end=' ')

        embedding = generate_embedding(chunk['content'])
        if embedding:
            cache[cache_key] = {
                'embedding': embedding,
                'chunk_index': i,
            }
            new_embeddings += 1
            print("OK")
        else:
            errors += 1
            print("FAIL")

        # Rate limit
        time.sleep(BATCH_DELAY)

        # Save cache periodically
        if new_embeddings % 20 == 0 and new_embeddings > 0:
            with open(EMBEDDINGS_CACHE, 'w') as f:
                json.dump(cache, f)
            print(f"  Cache salvata ({len(cache)} embeddings)")

    # Final cache save
    with open(EMBEDDINGS_CACHE, 'w') as f:
        json.dump(cache, f)

    print(f"\nEmbeddings: {new_embeddings} nuovi, {errors} errori, {len(cache)} totali in cache")

    # Phase 2: Upload to Supabase (if service key available)
    if not SUPABASE_SERVICE_KEY:
        print(f"\n=== FASE 2: Upload Supabase SKIPPATO ===")
        print(f"  SUPABASE_SERVICE_KEY non configurata.")
        print(f"  Per caricare: export SUPABASE_SERVICE_KEY='...' && python3 {sys.argv[0]}")
        print(f"  Alternativa: caricare via SQL Editor di Supabase Dashboard")

        # Generate SQL for manual upload
        sql_file = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/data/rag/insert-chunks.sql'
        print(f"\n=== Generando SQL per upload manuale ===")

        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- ELAB RAG Chunks — Auto-generated\n")
            f.write("-- Esegui in Supabase SQL Editor\n\n")

            # Create table + extension first
            f.write("""
-- Step 1: Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create table
CREATE TABLE IF NOT EXISTS volume_chunks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volume      INTEGER NOT NULL,
    chapter     TEXT NOT NULL,
    section     TEXT,
    content     TEXT NOT NULL,
    page_number INTEGER,
    token_count INTEGER,
    embedding   vector(3072),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON volume_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS idx_chunks_volume ON volume_chunks(volume);

-- Step 4: Create search function
CREATE OR REPLACE FUNCTION search_chunks(
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    volume INTEGER,
    chapter TEXT,
    section TEXT,
    content TEXT,
    page_number INTEGER,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        vc.id,
        vc.volume,
        vc.chapter,
        vc.section,
        vc.content,
        vc.page_number,
        1 - (vc.embedding <=> query_embedding) AS similarity
    FROM volume_chunks vc
    WHERE 1 - (vc.embedding <=> query_embedding) > match_threshold
    ORDER BY vc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

""")

            # Insert chunks (without embeddings for now — too large for SQL)
            f.write("-- Step 5: Insert chunks (senza embeddings — troppo grandi per SQL diretto)\n")
            f.write("-- Usa lo script Python con SUPABASE_SERVICE_KEY per caricare embeddings\n\n")

            uploaded = 0
            for i, chunk in enumerate(chunks):
                content_escaped = chunk['content'].replace("'", "''")
                chapter_escaped = chunk['chapter'].replace("'", "''")
                section_val = f"'{chunk.get('section', '').replace(chr(39), chr(39)+chr(39))}'" if chunk.get('section') else 'NULL'

                f.write(f"INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES "
                        f"({chunk['volume']}, '{chapter_escaped}', {section_val}, "
                        f"'{content_escaped}', {chunk.get('page_number', 'NULL')}, "
                        f"{chunk.get('token_count', 'NULL')});\n")
                uploaded += 1

        print(f"  SQL generato: {sql_file} ({uploaded} INSERT statements)")
        print(f"  Dimensione: {os.path.getsize(sql_file) / 1024:.1f} KB")
        return

    # Upload to Supabase
    print(f"\n=== FASE 2: Upload a Supabase ===")
    uploaded = 0
    upload_errors = 0

    for i, chunk in enumerate(chunks):
        cache_key = f"v{chunk['volume']}-p{chunk.get('page_number', 0)}-{hash(chunk['content'][:100])}"
        cached = cache.get(cache_key)

        if not cached or 'embedding' not in cached:
            print(f"  [{i+1}] SKIP — no embedding")
            continue

        print(f"  [{i+1}/{len(chunks)}] Uploading Vol{chunk['volume']} p{chunk.get('page_number', '?')}...", end=' ')

        success = upload_to_supabase(chunk, cached['embedding'])
        if success:
            uploaded += 1
            print("OK")
        else:
            upload_errors += 1
            print("FAIL")

        time.sleep(0.1)

    print(f"\nUpload: {uploaded} OK, {upload_errors} errori")


if __name__ == '__main__':
    main()
