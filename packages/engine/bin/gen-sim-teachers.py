#!/usr/bin/env python3
"""Genera 10 finte trascrizioni ASR di Fisica 1 — Cinematica (ordine Andrea 11/06).
10 docenti, STESSO tema, stili diversi → driver di personalizzazione per-docente (M1)
+ stress-test del motore. DeepSeek scrive il monologo (stile), python lo segmenta in
ASR JSONL e inietta rumore ASR per-persona (omofoni, parole droppate, filler).
Output: ~/maestro-data/fisica1-sim/derived/asr/<id>.speech.segment.jsonl
Costo: ~$0.01/docente (DeepSeek, NON tocca la quota Max).
"""
import json
import os
import random
import re
import sys

sys.path.insert(0, os.path.expanduser("~/lessonos"))
from lessonos.llm.deepseek import DeepSeekProvider  # noqa: E402

OUT = os.path.expanduser("~/maestro-data/fisica1-sim/derived/asr")
os.makedirs(OUT, exist_ok=True)

# (id, stile per DeepSeek, livello rumore 0-3). Stessa fisica, 10 voci diverse.
PERSONAS = [
    ("prof_rigoroso", "rigoroso e formale: definizioni precise, linguaggio matematico controllato, pochi fronzoli", 0),
    ("prof_caotico", "caotico e divagante: salti di argomento, tangenti, ogni tanto 'dove eravamo rimasti?', si corregge", 1),
    ("prof_dialettale", "colloquiale e dialettale: intercalari ('no?', 'capito?', 'allora ragazzi'), tono informale", 1),
    ("prof_veloce", "veloce e sintetico: frasi brevi, salta passaggi intermedi, ritmo serrato", 1),
    ("prof_pedante", "pedante e ripetitivo: ripete i concetti chiave piu volte, 'come dicevo', sovra-spiega", 0),
    ("prof_socratico", "socratico: pone CONTINUE domande alla classe ('secondo voi?', 'chi mi sa dire?'), stimola risposte", 1),
    ("prof_pratico", "pratico: esempi numerici continui, 'facciamo un esempio', valori concreti, applicazioni quotidiane", 1),
    ("prof_aneddotico", "aneddotico: aneddoti di storia della fisica (Galileo, Newton), digressioni storiche tra i concetti", 1),
    ("prof_esitante", "esitante e insicuro: molti 'ehm', 'cioe', auto-correzioni 'no scusate', pause, riformulazioni", 2),
    ("prof_audiopessimo", "parlato normale e chiaro (il degrado lo aggiunge l'ASR dopo, non lo stile)", 3),
]

PROMPT = (
    "Sei il professore {pid}. Tieni una lezione UNIVERSITARIA di Fisica 1 sulla CINEMATICA DEL PUNTO MATERIALE "
    "(posizione e spostamento, velocita media e istantanea, accelerazione, moto rettilineo uniforme, moto "
    "uniformemente accelerato, caduta dei gravi, grafici spazio-tempo e velocita-tempo). "
    "Stile del docente: {stile}. "
    "Scrivi il PARLATO REALE della lezione (monologo, prima persona, come trascritto da un microfono: frasi "
    "parlate, non testo scritto), 1800-2400 parole, in italiano. Includi naturalmente qualche domanda agli "
    "studenti e qualche esercizio detto a voce. NON usare elenchi puntati, titoli o markdown: SOLO il discorso "
    "continuo come lo direbbe a lezione. Inizia subito a parlare."
)

# Errori ASR plausibili (omofoni/storpiature tipiche del parlato italiano trascritto).
ASR_SWAP = {
    "velocità": "velocita", "accelerazione": "accellerazione", "spostamento": "sposamento",
    "istantanea": "istantania", "uniforme": "uniforma", "grandezza": "grandeza",
    "traiettoria": "traettoria", "ampiezza": "ampienza", "rettilineo": "retilineo",
    "Galileo": "galileo", "componente": "componenta", "derivata": "derivato",
    "modulo": "modello", "vettore": "vettori", "secondo": "secando",
}
FILLER = ["ehm", "cioè", "no?", "diciamo", "appunto", "ecco"]


def segment(text, lesson_id, noise):
    """Spezza il monologo in segmenti ASR-like con timestamp finti + rumore."""
    rng = random.Random(hash(lesson_id) & 0xFFFFFFFF)
    # split su confini di frase/virgola, poi accorpa a ~6-16 parole/segmento
    parts = re.split(r"(?<=[.?!,;:])\s+", text.replace("\n", " "))
    segs, t = [], 0.0
    for p in parts:
        p = p.strip()
        if not p:
            continue
        words = p.split()
        i = 0
        while i < len(words):
            n = rng.randint(6, 16)
            chunk = words[i:i + n]
            i += n
            seg = " ".join(chunk)
            seg = inject_noise(seg, noise, rng)
            if not seg.strip():
                continue
            dur = max(1.0, len(seg) / 14.0)  # ~14 char/s parlato
            conf = round(rng.uniform(0.55, 0.92) - 0.07 * noise, 4)
            segs.append({"start": round(t, 2), "end": round(t + dur, 2),
                         "text": seg, "confidence": max(0.2, conf), "speaker": None})
            t += dur + rng.uniform(0.0, 0.6)
    return segs


def inject_noise(seg, noise, rng):
    if noise <= 0:
        return seg
    words = seg.split()
    out = []
    for w in words:
        low = w.lower().strip(".,;:?!")
        # omofono ASR
        if low in ASR_SWAP and rng.random() < 0.25 * noise:
            w = w.replace(low, ASR_SWAP[low])
        # parola droppata
        if rng.random() < 0.04 * noise:
            continue
        out.append(w)
    # filler insertion (esitante / rumore alto)
    if noise >= 2 and rng.random() < 0.18:
        out.insert(rng.randint(0, len(out)), rng.choice(FILLER))
    return " ".join(out)


def main():
    prov = DeepSeekProvider(model="deepseek-chat")
    manifest = []
    for pid, stile, noise in PERSONAS:
        print(f"[gen] {pid} (noise={noise})...", flush=True)
        resp = prov.complete(PROMPT.format(pid=pid, stile=stile), model="deepseek-chat")
        mono = resp.text.strip()
        segs = segment(mono, pid, noise)
        path = os.path.join(OUT, f"{pid}.speech.segment.jsonl")
        with open(path, "w", encoding="utf-8") as f:
            for s in segs:
                f.write(json.dumps(s, ensure_ascii=False) + "\n")
        manifest.append((pid, len(segs), noise, len(mono)))
        print(f"      → {len(segs)} segmenti, {len(mono)} char monologo → {path}", flush=True)
    print("\n=== MANIFEST ===")
    for pid, n, noise, chars in manifest:
        print(f"{pid}: {n} segmenti (noise {noise}, {chars} char)")


if __name__ == "__main__":
    main()
