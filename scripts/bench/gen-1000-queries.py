#!/usr/bin/env python3
"""Iter 50 ELAB UNLIM 1000-query matrix generator.

Regenerated from /tmp/gen-1000-queries.py (lost system cleanup) to commit repo.
Per CLAUDE.md iter 41 v67 close: 10 categories totaling 1000 queries.

Categories:
  concept (200): foundational Q "spiega/cosa è/come funziona X"
  color (100): visual recognition LED green/red/yellow
  volpag (100): cite Vol.X pag.Y verbatim queries
  offtopic (100): off-topic redirect (TV/film/sports/politics)
  control (80): play/pause/compile/reset/screenshot intents
  highlight (60): highlight component LED/R/breadboard pin
  diag (100): "non funziona/perché/errore" diagnostic
  amb (100): ambiguous chit_chat "ok/bene/certo/si/no"
  expnav (80): experiment nav "vai a esp 5/cap 3"
  volnav (80): volume nav "Vol.1/2/3"

Output: scripts/bench/1000-queries.jsonl
Schema: {"id": str, "category": str, "userMessage": str, "experimentId": str|null, "expectedIntent": str|null}

(c) Andrea Marro 2026-05-13 — ELAB Tutor iter 50 regenerated from iter 41 spec.
"""
import json
import random
import os

# Fixed seed for reproducibility iter 50
random.seed(42)

OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '1000-queries.jsonl')


def gen_concept(n=200):
    topics = [
        ("LED", "luce"), ("resistenza", "Ohm"), ("condensatore", "carica"),
        ("transistor", "amplificazione"), ("diodo", "giunzione"), ("Arduino", "microcontrollore"),
        ("breadboard", "connessione"), ("voltmetro", "tensione"), ("amperometro", "corrente"),
        ("oscilloscopio", "forma d'onda"), ("PWM", "duty cycle"), ("MOSFET", "gate"),
        ("relè", "interruttore"), ("buzzer", "suono"), ("sensore PIR", "movimento"),
        ("encoder", "posizione"), ("stepper", "passo"), ("servo", "angolo"),
        ("LCD", "display"), ("Bluetooth", "wireless"),
    ]
    templates = [
        "Spiega cosa è un {0}",
        "Cosa è un {0}?",
        "Come funziona un {0}",
        "Come funziona il {0}",
        "Spiegami il principio del {0}",
        "Perché serve un {0} in un circuito?",
        "A cosa serve un {0}",
        "Differenza tra {0} e batteria",
        "Esempio uso {0} kit ELAB",
        "Approfondisci {1} del {0}",
    ]
    out = []
    i = 0
    while len(out) < n:
        topic, key = topics[i % len(topics)]
        tmpl = templates[i % len(templates)]
        out.append({
            "id": f"concept-{len(out)+1:03d}",
            "category": "concept",
            "userMessage": tmpl.format(topic, key),
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": None,
        })
        i += 1
    return out


def gen_color(n=100):
    colors = ["verde", "rosso", "giallo", "blu", "bianco"]
    templates = [
        "Metti un LED {0} nel circuito",
        "Cambia LED in {0}",
        "Aggiungi un LED {0}",
        "Vorrei LED {0}",
        "Sostituisci con LED {0}",
        "Il LED dovrebbe essere {0}",
        "Posso usare {0}?",
        "Voglio colore {0}",
        "Imposta {0}",
        "LED colore {0} grazie",
    ]
    out = []
    i = 0
    while len(out) < n:
        col = colors[i % len(colors)]
        tmpl = templates[i % len(templates)]
        out.append({
            "id": f"color-{len(out)+1:03d}",
            "category": "color",
            "userMessage": tmpl.format(col),
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": "setComponentValue:color",
        })
        i += 1
    return out


def gen_volpag(n=100):
    vols = [1, 2, 3]
    pages = [12, 18, 25, 27, 34, 45, 52, 67, 89, 102, 134, 156]
    templates = [
        "Cosa dice il libro a pagina {1}?",
        "Riferisci Volume {0} pagina {1}",
        "Vol.{0} pag.{1} cosa spiega?",
        "Apri Vol.{0} pag.{1}",
        "Leggi Volume {0} pagina {1}",
        "Cita testo Vol.{0} pag.{1}",
        "Riferimento al Volume {0}",
        "Vai a pagina {1} Volume {0}",
        "Estratto Vol.{0} pag.{1}",
        "Cosa contiene pagina {1} del Volume {0}?",
    ]
    out = []
    i = 0
    while len(out) < n:
        vol = vols[i % len(vols)]
        page = pages[i % len(pages)]
        tmpl = templates[i % len(templates)]
        out.append({
            "id": f"volpag-{len(out)+1:03d}",
            "category": "volpag",
            "userMessage": tmpl.format(vol, page),
            "experimentId": f"v{vol}-cap6-esp1",
            "expectedIntent": None,
        })
        i += 1
    return out


def gen_offtopic(n=100):
    queries = [
        "Quale film stasera?", "Risultato partita Juve?", "Tempo Roma domani",
        "Chi vince elezioni?", "Borsa Tokyo apertura", "Bitcoin oggi prezzo",
        "Storia Roma antica", "Ricetta carbonara", "Come dimagrire velocemente",
        "Migliore smartphone 2026", "Cantante più famoso", "Calciatore numero 10",
        "Prossimo Papa", "Cura raffreddore", "Cosa mangiare cena",
        "Tendenze moda autunno", "Cuore battiti normali", "Cinema Milano stasera",
        "Concerto Vasco Rossi", "Tour de France classifica", "Ricetta tiramisu",
        "Vacanze Sardegna agosto", "Auto elettrica migliore", "Casa prezzo Roma",
        "Università ingegneria classifica", "Banca conto migliore", "Pensione anticipata",
        "Tax credit 2026", "Mercato immobiliare Milano", "Inflazione previsione",
        "Notizie Ucraina oggi", "Meloni governo", "Trump America 2026",
        "Cina economia", "Russia sanzioni", "EU parlamento",
        "ChatGPT migliore", "Tesla azioni", "Apple nuovo iPhone",
        "Google AI Gemini", "Mistral francese", "Anthropic Claude",
        "Microsoft Azure", "Amazon AWS", "Netflix serie",
        "Spotify musica", "TikTok algoritmo", "Instagram reels",
        "YouTube monetizzazione", "Facebook Meta", "Twitter X Musk",
    ]
    out = []
    i = 0
    while len(out) < n:
        q = queries[i % len(queries)]
        out.append({
            "id": f"offtopic-{len(out)+1:03d}",
            "category": "offtopic",
            "userMessage": q,
            "experimentId": None,
            "expectedIntent": "offtopic_redirect",
        })
        i += 1
    return out


def gen_control(n=80):
    cmds = [
        ("play", "Avvia simulazione"), ("play", "Premi play"), ("play", "Esegui"),
        ("pause", "Metti in pausa"), ("pause", "Stop simulazione"),
        ("compile", "Compila il codice"), ("compile", "Compila Arduino"),
        ("reset", "Reset circuito"), ("reset", "Riparti da zero"),
        ("screenshot", "Cattura schermo"), ("screenshot", "Foto del circuito"),
        ("clearCircuit", "Cancella tutto"), ("clearCircuit", "Pulisci"),
        ("undo", "Annulla ultima azione"), ("redo", "Rifai"),
    ]
    out = []
    i = 0
    while len(out) < n:
        intent, msg = cmds[i % len(cmds)]
        out.append({
            "id": f"control-{len(out)+1:03d}",
            "category": "control",
            "userMessage": msg,
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": intent,
        })
        i += 1
    return out


def gen_highlight(n=60):
    targets = ["LED", "resistore R1", "breadboard pin 13", "Arduino D13",
               "GND", "5V", "pulsante", "potenziometro"]
    templates = [
        "Evidenzia {0}",
        "Mostrami dove è {0}",
        "Dov'è {0}?",
        "Indica {0}",
        "Fai vedere {0}",
        "Cerchia {0}",
    ]
    out = []
    i = 0
    while len(out) < n:
        target = targets[i % len(targets)]
        tmpl = templates[i % len(templates)]
        out.append({
            "id": f"highlight-{len(out)+1:03d}",
            "category": "highlight",
            "userMessage": tmpl.format(target),
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": "highlightComponent",
        })
        i += 1
    return out


def gen_diag(n=100):
    issues = [
        "Il LED non si accende",
        "Errore compilazione",
        "Circuito non funziona",
        "Schermo nero simulatore",
        "Resistenza brucia",
        "Arduino non risponde",
        "Codice non parte",
        "Pulsante non rileva",
        "Sensore valore strano",
        "Display LCD vuoto",
    ]
    templates = [
        "{0}",
        "Aiuto: {0}",
        "Perché {0}?",
        "Cosa sbaglio? {0}",
        "Debug: {0}",
        "Dove sbaglio? {0}",
        "Non capisco perché {0}",
        "{0}, suggerimenti?",
        "Trova il problema: {0}",
        "Analizza: {0}",
    ]
    out = []
    i = 0
    while len(out) < n:
        issue = issues[i % len(issues)]
        tmpl = templates[i % len(templates)]
        out.append({
            "id": f"diag-{len(out)+1:03d}",
            "category": "diag",
            "userMessage": tmpl.format(issue),
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": None,
        })
        i += 1
    return out


def gen_amb(n=100):
    responses = ["ok", "bene", "certo", "si", "no", "va bene", "ok grazie",
                 "perfetto", "capito", "ah"]
    out = []
    i = 0
    while len(out) < n:
        resp = responses[i % len(responses)]
        out.append({
            "id": f"amb-{len(out)+1:03d}",
            "category": "amb",
            "userMessage": resp,
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": "chit_chat",
        })
        i += 1
    return out


def gen_expnav(n=80):
    templates = [
        "Apri esperimento {0}",
        "Vai a esp {0}",
        "Carica esperimento {0}",
        "Esp {0} per favore",
        "Mostra {0}",
        "Esperimento numero {0}",
        "Voglio fare {0}",
        "Iniziamo con {0}",
    ]
    exps = ["accendi-led", "potenziometro", "pulsante", "condensatore",
            "mosfet", "morse", "semaforo", "led-blink"]
    out = []
    i = 0
    while len(out) < n:
        tmpl = templates[i % len(templates)]
        exp = exps[i % len(exps)]
        out.append({
            "id": f"expnav-{len(out)+1:03d}",
            "category": "expnav",
            "userMessage": tmpl.format(exp),
            "experimentId": "v1-cap6-esp1",
            "expectedIntent": "mountExperiment",
        })
        i += 1
    return out


def gen_volnav(n=80):
    templates = [
        "Apri Vol.{0}",
        "Vai al Volume {0}",
        "Carica Vol {0}",
        "Volume {0}",
        "Mostra Volume {0}",
        "Apriamo Vol.{0}",
        "Andiamo al Volume {0}",
        "Volume numero {0}",
    ]
    vols = [1, 2, 3]
    out = []
    i = 0
    while len(out) < n:
        tmpl = templates[i % len(templates)]
        vol = vols[i % len(vols)]
        out.append({
            "id": f"volnav-{len(out)+1:03d}",
            "category": "volnav",
            "userMessage": tmpl.format(vol),
            "experimentId": None,
            "expectedIntent": "loadVolume",
        })
        i += 1
    return out


def main():
    queries = []
    queries.extend(gen_concept(200))
    queries.extend(gen_color(100))
    queries.extend(gen_volpag(100))
    queries.extend(gen_offtopic(100))
    queries.extend(gen_control(80))
    queries.extend(gen_highlight(60))
    queries.extend(gen_diag(100))
    queries.extend(gen_amb(100))
    queries.extend(gen_expnav(80))
    queries.extend(gen_volnav(80))

    # Sanity check
    assert len(queries) == 1000, f"expected 1000 got {len(queries)}"

    with open(OUT_PATH, 'w') as f:
        for q in queries:
            f.write(json.dumps(q, ensure_ascii=False) + '\n')

    print(f"Wrote {len(queries)} queries to {OUT_PATH}")
    # Category breakdown
    from collections import Counter
    cats = Counter(q['category'] for q in queries)
    for c, n in sorted(cats.items()):
        print(f"  {c}: {n}")


if __name__ == '__main__':
    main()
