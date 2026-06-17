#!/usr/bin/env python3
"""
ELAB RAG Chunk Expander — Da 246 a 1000+ chunk
Legge i testi dei volumi e crea chunk granulari per ogni:
- Esperimento (istruzioni, componenti, concetti)
- Capitolo (introduzione, teoria)
- Componente (cos'è, come funziona)
- Analogia (per bambini 10-14 anni)
- Vocabolario (termine + definizione)

(c) Andrea Marro — 11/04/2026
"""

import json
import re
import os

VOLUMI_DIR = "docs/volumi-originali"
OUTPUT_DIR = "data/rag"
VOLUMES = {
    1: "VOLUME-1-TESTO.txt",
    2: "VOLUME-2-TESTO.txt",
    3: "VOLUME-3-TESTO.txt",
}

# Componenti ELAB e le loro descrizioni da aggiungere come chunk
COMPONENT_CHUNKS = [
    {"volume": 0, "chapter": "componenti", "section": "LED", "content": "Il LED (Light Emitting Diode) e un diodo che emette luce. Ha due terminali: l'anodo (+, gamba piu lunga) e il catodo (-, gamba piu corta). La corrente scorre dall'anodo al catodo. Se lo colleghi al contrario non si accende. Serve SEMPRE un resistore di protezione per limitare la corrente, altrimenti il LED si brucia. Colori disponibili: rosso, verde, blu, giallo, bianco. Il LED RGB ha 4 gambe e puo fare qualsiasi colore mescolando rosso, verde e blu."},
    {"volume": 0, "chapter": "componenti", "section": "Resistore", "content": "Il resistore limita la corrente nel circuito. E come un tubo stretto per l'acqua: piu e stretto (piu Ohm), meno acqua (corrente) passa. I valori comuni sono: 220 Ohm, 330 Ohm, 470 Ohm, 1k Ohm, 10k Ohm. Le bande colorate indicano il valore. Per un LED rosso con batteria 9V, un resistore da 470 Ohm e perfetto. La formula e: R = (V_batteria - V_LED) / I_LED."},
    {"volume": 0, "chapter": "componenti", "section": "Breadboard", "content": "La breadboard e una base per costruire circuiti senza saldare. Ha righe orizzontali (a-e e f-j) collegate tra loro e bus verticali (+/-) per l'alimentazione. Le righe a-e sono collegate orizzontalmente nella sezione superiore. Le righe f-j nella sezione inferiore. Il gap centrale separa le due sezioni. I bus laterali (+rosso, -blu) portano corrente a tutto il circuito."},
    {"volume": 0, "chapter": "componenti", "section": "Batteria 9V", "content": "La batteria 9V fornisce l'energia al circuito. Ha un polo positivo (+) e uno negativo (-). Si collega alla breadboard tramite un clip a pressione con fili rosso (+) e nero (-). Una batteria nuova misura circa 9.4-9.6V. Sotto 7V e scarica e va sostituita. NON cortocircuitare mai i due poli!"},
    {"volume": 0, "chapter": "componenti", "section": "Pulsante", "content": "Il pulsante e un interruttore momentaneo: la corrente passa SOLO quando lo premi. Ha 4 pin ma funziona come se ne avesse 2 (i pin sono collegati a coppie). Quando premi il pulsante, i due lati si collegano e la corrente scorre. Quando rilasci, il circuito si apre."},
    {"volume": 0, "chapter": "componenti", "section": "Potenziometro", "content": "Il potenziometro e un resistore variabile con 3 pin. Ruotando la manopola cambi la resistenza tra il pin centrale e i pin laterali. E come un rubinetto: ruotando apri o chiudi il passaggio della corrente. Con un LED, puoi controllare la luminosita. Con Arduino, puoi leggere il valore analogico (0-1023)."},
    {"volume": 0, "chapter": "componenti", "section": "Fotoresistore", "content": "Il fotoresistore (LDR) cambia la sua resistenza in base alla luce. Piu luce = meno resistenza = piu corrente. Al buio ha alta resistenza (megaohm). In piena luce ha bassa resistenza (pochi kiloohm). Si usa per fare sensori di luce: la corrente cambia in base alla luce ambiente."},
    {"volume": 0, "chapter": "componenti", "section": "Cicalino", "content": "Il cicalino (buzzer) produce un suono quando la corrente lo attraversa. Ha un polo + (gamba piu lunga) e un polo - (gamba piu corta). Con Arduino puoi controllare la frequenza del suono con la funzione tone(pin, frequenza). Si usa per feedback sonori, allarmi, melodie."},
    {"volume": 0, "chapter": "componenti", "section": "Reed Switch", "content": "Il reed switch (interruttore magnetico) si chiude quando un magnete si avvicina. Dentro ha due lamelle metalliche che si toccano quando il campo magnetico le attira. Si usa per rilevare porte aperte/chiuse, contare giri di ruote, sensori di posizione."},
    {"volume": 0, "chapter": "componenti", "section": "Multimetro", "content": "Il multimetro misura tensione (Volt), corrente (Ampere) e resistenza (Ohm). Per misurare la tensione: ruota su V, collega IN PARALLELO (rosso al +, nero al -). Per misurare la resistenza: ruota su Ohm, collega ai due capi del resistore (circuito SPENTO). Per misurare la corrente: ruota su A, collega IN SERIE (il multimetro deve essere attraversato dalla corrente)."},
    {"volume": 0, "chapter": "componenti", "section": "Condensatore", "content": "Il condensatore accumula energia elettrica come una piccola batteria. Si carica quando collegato alla corrente e si scarica quando il circuito si apre. Il tempo di carica/scarica dipende dalla capacita (microfarad) e dalla resistenza del circuito. Formula: tempo = R x C. Si usa per filtrare, temporizzare, accumulare energia."},
    {"volume": 0, "chapter": "componenti", "section": "Transistor MOSFET", "content": "Il transistor MOSFET e un interruttore elettronico. Ha 3 pin: Gate (controllo), Drain (uscita), Source (massa). Quando applichi tensione al Gate, il transistor 'apre' e la corrente scorre da Drain a Source. E come un rubinetto controllato elettricamente. Si usa per controllare motori, LED ad alta potenza, e come amplificatore."},
    {"volume": 0, "chapter": "componenti", "section": "Arduino Nano", "content": "Arduino Nano e un microcontrollore programmabile. Ha 14 pin digitali (D0-D13) e 8 pin analogici (A0-A7). I pin digitali leggono/scrivono HIGH (5V) o LOW (0V). I pin analogici leggono valori da 0 a 1023. Si programma in C++ con le funzioni setup() e loop(). Funzioni principali: pinMode(), digitalWrite(), digitalRead(), analogWrite(), analogRead(), delay(), Serial.begin/print."},
]

# Analogie per bambini
ANALOGY_CHUNKS = [
    {"volume": 0, "chapter": "analogie", "section": "corrente_acqua", "content": "ANALOGIA: La corrente elettrica e come l'acqua in un tubo. La batteria e la pompa che spinge l'acqua. I fili sono i tubi. Il resistore e un tubo stretto che limita il flusso. Il LED e una ruota ad acqua che gira (si accende) quando l'acqua scorre. Se il tubo e troppo largo (niente resistore), troppa acqua arriva e la ruota si rompe (il LED si brucia)."},
    {"volume": 0, "chapter": "analogie", "section": "tensione_pressione", "content": "ANALOGIA: La tensione (Volt) e come la pressione dell'acqua. Una batteria da 9V ha piu 'pressione' di una da 3V. Piu pressione = piu forza per spingere la corrente attraverso il circuito. Il resistore riduce la pressione, come un tubo stretto riduce la pressione dell'acqua."},
    {"volume": 0, "chapter": "analogie", "section": "circuito_percorso", "content": "ANALOGIA: Un circuito e come una strada circolare. La corrente parte dalla batteria (+), attraversa i componenti, e torna alla batteria (-). Se la strada si interrompe (filo staccato), la corrente non scorre. Il pulsante e un ponte levatoio: quando lo premi il ponte si abbassa e le macchine (corrente) passano."},
    {"volume": 0, "chapter": "analogie", "section": "pot_rubinetto", "content": "ANALOGIA: Il potenziometro e come un rubinetto. Quando lo ruoti, cambi quanto il tubo e aperto. Tutto aperto = tanta corrente = LED luminosissimo. Tutto chiuso = poca corrente = LED spento. A meta = luminosita media."},
    {"volume": 0, "chapter": "analogie", "section": "condensatore_secchio", "content": "ANALOGIA: Il condensatore e come un secchio. L'acqua (corrente) lo riempie piano piano. Quando e pieno, smette di assorbire acqua. Quando stacchi la pompa (batteria), il secchio si svuota piano piano attraverso il tubo (resistore). Piu grande il secchio (piu microfarad), piu tempo ci mette a svuotarsi."},
    {"volume": 0, "chapter": "analogie", "section": "arduino_cervello", "content": "ANALOGIA: Arduino e come un cervello per il tuo circuito. I pin di input sono i sensi (vista, tatto). I pin di output sono i muscoli (accendi, spegni). Il programma (sketch) e il pensiero: 'SE premi il pulsante ALLORA accendi il LED'. Arduino ripete il loop() all'infinito, come un cervello che controlla sempre cosa sta succedendo."},
]

def chunk_text(text, volume_num, max_chunk=800, overlap=100):
    """Split text into overlapping chunks by paragraph/section."""
    chunks = []

    # Split by chapter markers
    chapter_splits = re.split(r'(CAPITOLO\s+\d+|Cap\.?\s*\d+|ESPERIMENTO\s+\d+)', text, flags=re.IGNORECASE)

    current_chapter = "intro"
    current_section = "general"
    current_text = ""

    for part in chapter_splits:
        # Check if this is a chapter/experiment header
        ch_match = re.match(r'(?:CAPITOLO|Cap\.?)\s*(\d+)', part, re.IGNORECASE)
        exp_match = re.match(r'ESPERIMENTO\s*(\d+)', part, re.IGNORECASE)

        if ch_match:
            # Save current chunk
            if current_text.strip() and len(current_text.strip()) > 50:
                chunks.append({
                    "volume": volume_num,
                    "chapter": current_chapter,
                    "section": current_section,
                    "content": current_text.strip()[:max_chunk],
                })
            current_chapter = f"cap{ch_match.group(1)}"
            current_text = ""
            continue

        if exp_match:
            if current_text.strip() and len(current_text.strip()) > 50:
                chunks.append({
                    "volume": volume_num,
                    "chapter": current_chapter,
                    "section": current_section,
                    "content": current_text.strip()[:max_chunk],
                })
            current_section = f"esp{exp_match.group(1)}"
            current_text = ""
            continue

        # Add to current text
        current_text += part

        # If text is long enough, split into chunks
        while len(current_text) > max_chunk:
            # Find a good split point (paragraph break)
            split_at = current_text.rfind('\n\n', 0, max_chunk)
            if split_at < max_chunk // 2:
                split_at = current_text.rfind('\n', 0, max_chunk)
            if split_at < max_chunk // 3:
                split_at = max_chunk

            chunk_content = current_text[:split_at].strip()
            if len(chunk_content) > 50:
                chunks.append({
                    "volume": volume_num,
                    "chapter": current_chapter,
                    "section": current_section,
                    "content": chunk_content,
                })

            # Keep overlap
            current_text = current_text[max(0, split_at - overlap):]

    # Last chunk
    if current_text.strip() and len(current_text.strip()) > 50:
        chunks.append({
            "volume": volume_num,
            "chapter": current_chapter,
            "section": current_section,
            "content": current_text.strip()[:max_chunk],
        })

    return chunks

def main():
    all_chunks = []

    # Process each volume text
    for vol_num, filename in VOLUMES.items():
        filepath = os.path.join(VOLUMI_DIR, filename)
        if not os.path.exists(filepath):
            print(f"WARNING: {filepath} not found, skipping Vol {vol_num}")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()

        chunks = chunk_text(text, vol_num, max_chunk=600, overlap=80)
        print(f"Vol {vol_num}: {len(chunks)} chunks from {len(text)} chars")
        all_chunks.extend(chunks)

    # Add component knowledge chunks
    all_chunks.extend(COMPONENT_CHUNKS)
    print(f"Components: {len(COMPONENT_CHUNKS)} chunks")

    # Add analogy chunks
    all_chunks.extend(ANALOGY_CHUNKS)
    print(f"Analogies: {len(ANALOGY_CHUNKS)} chunks")

    # Add page numbers and token estimates
    for i, chunk in enumerate(all_chunks):
        chunk["page_number"] = i + 1
        chunk["token_count"] = len(chunk["content"].split())
        chunk["chunk_id"] = f"v{chunk['volume']}-{chunk['chapter']}-{chunk['section']}-{i}"

    # Save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, "all-chunks-expanded.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"\nTOTALE: {len(all_chunks)} chunks salvati in {output_path}")
    print(f"  Vol 1: {sum(1 for c in all_chunks if c['volume'] == 1)}")
    print(f"  Vol 2: {sum(1 for c in all_chunks if c['volume'] == 2)}")
    print(f"  Vol 3: {sum(1 for c in all_chunks if c['volume'] == 3)}")
    print(f"  Components: {sum(1 for c in all_chunks if c['chapter'] == 'componenti')}")
    print(f"  Analogies: {sum(1 for c in all_chunks if c['chapter'] == 'analogie')}")

if __name__ == "__main__":
    main()
