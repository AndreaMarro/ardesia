#!/usr/bin/env python3
"""
ELAB RAG Builder — Estrae testo dai 3 volumi PDF e crea chunk strutturati.
Output: JSON con chunk pronti per embeddings + upload Supabase.
"""

import pdfplumber
import json
import re
import os
import sys

VOLUMES = [
    {
        'path': '/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf',
        'volume': 1,
        'name': 'Volume 1 — Circuiti Base'
    },
    {
        'path': '/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf',
        'volume': 2,
        'name': 'Volume 2 — Arduino Base'
    },
    {
        'path': '/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Manuale VOLUME 3 V0.8.1.pdf',
        'volume': 3,
        'name': 'Volume 3 — Arduino Avanzato'
    },
]

OUTPUT_DIR = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/data/rag'
MAX_CHUNK_CHARS = 2000  # ~500 tokens
MIN_CHUNK_CHARS = 50


def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF, page by page."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ''
            if text.strip():
                pages.append({
                    'page': i + 1,
                    'text': text.strip()
                })
    return pages


def detect_chapter(text):
    """Detect chapter headers in text."""
    patterns = [
        r'(?i)^(?:CAPITOLO|CAP\.?|CHAPTER)\s*(\d+)',
        r'^(\d+)\.\s+[A-Z]',
        r'(?i)^UNITA\'\s*(\d+)',
        r'(?i)^MODULO\s*(\d+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            return match.group(0).strip()
    return None


def detect_experiment(text):
    """Detect experiment headers."""
    patterns = [
        r'(?i)(?:ESPERIMENTO|ESP\.?|EXPERIMENT)\s*(\d+)',
        r'(?i)(?:ATTIVITA\'?|ATTIVIT[AÀ])\s*(\d+)',
        r'(?i)(?:ESERCIZIO)\s*(\d+)',
        r'(?i)(?:PROVA|PROGETTO)\s*(\d+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            return match.group(0).strip()
    return None


def chunk_pages(pages, volume_num):
    """Smart chunking: split by chapters/experiments, respecting MAX_CHUNK_CHARS."""
    chunks = []
    current_chapter = f'Volume {volume_num}'
    current_section = None
    current_text = ''
    current_start_page = 1

    for page_data in pages:
        page_num = page_data['page']
        text = page_data['text']

        # Detect chapter change
        chapter = detect_chapter(text)
        if chapter:
            # Save current chunk
            if current_text.strip() and len(current_text.strip()) >= MIN_CHUNK_CHARS:
                chunks.append({
                    'volume': volume_num,
                    'chapter': current_chapter,
                    'section': current_section,
                    'content': current_text.strip(),
                    'page_number': current_start_page,
                    'token_count': len(current_text.strip()) // 4,
                })
            current_chapter = chapter
            current_section = None
            current_text = ''
            current_start_page = page_num

        # Detect experiment/section
        experiment = detect_experiment(text)
        if experiment:
            # Save current chunk if substantial
            if current_text.strip() and len(current_text.strip()) >= MIN_CHUNK_CHARS:
                chunks.append({
                    'volume': volume_num,
                    'chapter': current_chapter,
                    'section': current_section,
                    'content': current_text.strip(),
                    'page_number': current_start_page,
                    'token_count': len(current_text.strip()) // 4,
                })
            current_section = experiment
            current_text = ''
            current_start_page = page_num

        # Add text to current chunk
        current_text += '\n' + text

        # Split if too long
        while len(current_text) > MAX_CHUNK_CHARS:
            # Find a good split point (paragraph break)
            split_at = current_text.rfind('\n\n', 0, MAX_CHUNK_CHARS)
            if split_at < MIN_CHUNK_CHARS:
                split_at = current_text.rfind('\n', 0, MAX_CHUNK_CHARS)
            if split_at < MIN_CHUNK_CHARS:
                split_at = MAX_CHUNK_CHARS

            chunk_text = current_text[:split_at].strip()
            if len(chunk_text) >= MIN_CHUNK_CHARS:
                chunks.append({
                    'volume': volume_num,
                    'chapter': current_chapter,
                    'section': current_section,
                    'content': chunk_text,
                    'page_number': current_start_page,
                    'token_count': len(chunk_text) // 4,
                })
            current_text = current_text[split_at:].strip()
            current_start_page = page_num

    # Final chunk
    if current_text.strip() and len(current_text.strip()) >= MIN_CHUNK_CHARS:
        chunks.append({
            'volume': volume_num,
            'chapter': current_chapter,
            'section': current_section,
            'content': current_text.strip(),
            'page_number': current_start_page,
            'token_count': len(current_text.strip()) // 4,
        })

    return chunks


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_chunks = []
    stats = []

    for vol in VOLUMES:
        print(f"\n{'='*60}")
        print(f"Processando: {vol['name']}")
        print(f"File: {vol['path']}")

        if not os.path.exists(vol['path']):
            print(f"  ERRORE: File non trovato!")
            continue

        # Extract
        pages = extract_text_from_pdf(vol['path'])
        print(f"  Pagine estratte: {len(pages)}")

        total_chars = sum(len(p['text']) for p in pages)
        print(f"  Caratteri totali: {total_chars:,}")

        # Chunk
        chunks = chunk_pages(pages, vol['volume'])
        print(f"  Chunk creati: {len(chunks)}")

        avg_tokens = sum(c['token_count'] for c in chunks) / max(len(chunks), 1)
        print(f"  Token medi per chunk: {avg_tokens:.0f}")

        # Save per-volume
        vol_file = os.path.join(OUTPUT_DIR, f"volume-{vol['volume']}-chunks.json")
        with open(vol_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        print(f"  Salvato: {vol_file}")

        # Save raw text too
        raw_file = os.path.join(OUTPUT_DIR, f"volume-{vol['volume']}-raw.txt")
        with open(raw_file, 'w', encoding='utf-8') as f:
            for page in pages:
                f.write(f"\n{'='*40} PAGINA {page['page']} {'='*40}\n")
                f.write(page['text'])
                f.write('\n')
        print(f"  Testo raw: {raw_file}")

        all_chunks.extend(chunks)
        stats.append({
            'volume': vol['volume'],
            'name': vol['name'],
            'pages': len(pages),
            'chars': total_chars,
            'chunks': len(chunks),
            'avg_tokens': round(avg_tokens),
        })

    # Save combined
    combined_file = os.path.join(OUTPUT_DIR, 'all-chunks.json')
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"\n{'='*60}")
    print(f"TOTALE: {len(all_chunks)} chunk da {len(stats)} volumi")
    print(f"File combinato: {combined_file}")
    for s in stats:
        print(f"  Vol {s['volume']}: {s['pages']} pagine, {s['chunks']} chunk, ~{s['avg_tokens']} tok/chunk")

    # Save stats
    stats_file = os.path.join(OUTPUT_DIR, 'extraction-stats.json')
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_chunks': len(all_chunks),
            'volumes': stats,
        }, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
