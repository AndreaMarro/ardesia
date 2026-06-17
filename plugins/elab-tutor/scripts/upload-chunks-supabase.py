#!/usr/bin/env python3
"""Upload RAG chunks to Supabase via Management API."""

import json
import urllib.request
import urllib.error
import time

SUPABASE_TOKEN = 'sbp_REVOKED_20260423_REDACTED'
PROJECT_REF = 'euqpdueopmlllqjmqnyb'
CHUNKS_FILE = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/data/rag/all-chunks.json'
EMBEDDINGS_FILE = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/data/rag/embeddings-cache.json'
API_URL = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query'

def execute_sql(query):
    payload = json.dumps({'query': query}).encode('utf-8')
    req = urllib.request.Request(API_URL, data=payload, headers={
        'Authorization': f'Bearer {SUPABASE_TOKEN}',
        'Content-Type': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f"  SQL ERROR {e.code}: {body[:200]}")
        return None

def main():
    # Load chunks
    with open(CHUNKS_FILE, 'r') as f:
        chunks = json.load(f)

    # Load embeddings cache
    with open(EMBEDDINGS_FILE, 'r') as f:
        cache = json.load(f)

    # Build embedding lookup
    embedding_map = {}
    for key, val in cache.items():
        if 'embedding' in val and 'chunk_index' in val:
            embedding_map[val['chunk_index']] = val['embedding']

    print(f"Chunks: {len(chunks)}, Embeddings: {len(embedding_map)}")

    # Check existing count
    result = execute_sql("SELECT count(*) as cnt FROM volume_chunks;")
    existing = result[0]['cnt'] if result else 0
    print(f"Existing rows: {existing}")

    if existing >= len(chunks):
        print("Already uploaded. Skipping.")
        return

    # Clear existing if partial
    if existing > 0:
        print(f"Clearing {existing} partial rows...")
        execute_sql("DELETE FROM volume_chunks;")

    # Upload in batches of 5
    uploaded = 0
    errors = 0
    batch_size = 5

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        values = []
        for j, chunk in enumerate(batch):
            idx = i + j
            content_escaped = chunk['content'].replace("'", "''")
            chapter_escaped = chunk['chapter'].replace("'", "''")
            section_val = f"'{chunk.get('section', '').replace(chr(39), chr(39)+chr(39))}'" if chunk.get('section') else 'NULL'

            emb = embedding_map.get(idx)
            if emb:
                emb_str = f"'[{','.join(str(v) for v in emb)}]'"
            else:
                emb_str = 'NULL'

            values.append(
                f"(uuid_generate_v4(), {chunk['volume']}, '{chapter_escaped}', {section_val}, "
                f"'{content_escaped}', {chunk.get('page_number', 'NULL')}, "
                f"{chunk.get('token_count', 'NULL')}, {emb_str}, now())"
            )

        sql = (
            "INSERT INTO volume_chunks (id, volume, chapter, section, content, page_number, token_count, embedding, created_at) VALUES "
            + ", ".join(values) + ";"
        )

        result = execute_sql(sql)
        if result is not None:
            uploaded += len(batch)
            if uploaded % 25 == 0:
                print(f"  Uploaded {uploaded}/{len(chunks)}")
        else:
            errors += len(batch)
            print(f"  BATCH FAILED at index {i}")
            # Try one by one
            for j, chunk in enumerate(batch):
                idx = i + j
                content_escaped = chunk['content'].replace("'", "''")
                chapter_escaped = chunk['chapter'].replace("'", "''")
                section_val = f"'{chunk.get('section', '').replace(chr(39), chr(39)+chr(39))}'" if chunk.get('section') else 'NULL'
                single_sql = (
                    f"INSERT INTO volume_chunks (volume, chapter, section, content, page_number, token_count) VALUES "
                    f"({chunk['volume']}, '{chapter_escaped}', {section_val}, "
                    f"'{content_escaped}', {chunk.get('page_number', 'NULL')}, "
                    f"{chunk.get('token_count', 'NULL')});"
                )
                r = execute_sql(single_sql)
                if r is not None:
                    uploaded += 1
                    errors -= 1

        time.sleep(0.2)  # Rate limit

    print(f"\nDone: {uploaded} uploaded, {errors} errors")

    # Verify
    result = execute_sql("SELECT volume, count(*) as cnt FROM volume_chunks GROUP BY volume ORDER BY volume;")
    print(f"Verification: {result}")

if __name__ == '__main__':
    main()
