#!/usr/bin/env python3
"""Latency bench 7 capabilities ELAB UNLIM prod (v67 Edge Function).

Capabilities (Andrea mandate 2026-05-13):
  1. chat (basic LLM)
  2. chat + thinking (Pro routing medium thinking)
  3. Onnipotenza basic (single INTENT setComponentValue)
  4. Onnipotenza avanzata (composite multi-INTENT)
  5. Vision (Pixtral 12B EU)
  6. Vision avanzata (Vision + chat continuation)
  7. Interfacciamento (Edge full chain + intent_parsed surface verify)

Outputs p50, p95, p99, avg, min, max per capability.
Parallel 4 workers per capability (avoid rate-limit burst).
"""
import json
import subprocess
import time
import uuid
import os
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict

# Read keys
with open('/tmp/vercel.env') as f:
    for line in f:
        if line.startswith('VITE_ELAB_API_KEY='):
            API_KEY = line.split('=', 1)[1].strip().strip('"')
            break

EDGE_URL = "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat"
VISION_URL = "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-vision"

# 1x1 transparent PNG base64 (smallest valid image)
TINY_PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

CIRCUIT_STATE = {
    "components": [
        {"type": "led", "id": "led1"},
        {"type": "resistor", "id": "r1"},
        {"type": "battery9v", "id": "bat1"}
    ],
    "wires": [{"from": "bat1:plus", "to": "r1:a"}, {"from": "r1:b", "to": "led1:anode"}]
}

# Capability test scenarios
CAPABILITIES = {
    "1_chat_basic": [
        "Cosa è un LED?",
        "Spiegami il resistore",
        "Come funziona la breadboard?",
        "Cosa è la corrente elettrica?",
        "Spiegami il circuito chiuso",
        "Che cosa è la tensione?",
        "Cosa serve un condensatore?",
        "Spiegami la massa GND",
        "Cosa è il LED RGB?",
        "Spiegami il pulsante",
    ],
    "2_chat_thinking": [
        "Spiegami nel dettaglio come funziona la legge di Ohm con un esempio numerico passo passo",
        "Approfondisci il principio di funzionamento di un transistor MOSFET e come lo applichiamo in classe con il kit ELAB",
        "Analizza in profondità perché un LED richiede sempre un resistore in serie e calcola il valore per 9V e LED rosso",
        "Spiegami in modo dettagliato il funzionamento del partitore di tensione con esempi numerici e applicazioni",
        "Approfondisci come funziona un potenziometro come divisore variabile e fai un esempio di calcolo completo",
        "Analizza il principio di funzionamento di un buzzer piezoelettrico e di un buzzer attivo con confronto",
        "Spiegami in dettaglio come Arduino comunica con i componenti via PWM con esempio di codice e formula",
        "Approfondisci la differenza tra serie e parallelo con calcoli completi per resistori e condensatori",
        "Analizza in profondità come il codice Morse converte testo in segnali e fai un esempio completo con LED",
        "Spiegami nel dettaglio come il sensore di temperatura legge la temperatura e converte in valore digitale",
    ],
    "3_onnipotenza_basic": [
        "metti led verde",
        "imposta resistenza 470 ohm",
        "fai partire il circuito",
        "ferma simulazione",
        "compila il codice",
        "scatta foto del circuito",
        "evidenzia led1",
        "cambia led a blu",
        "metti resistenza 1k",
        "vai play",
    ],
    "4_onnipotenza_avanzata": [
        "accendi led, evidenzia r1 e compila",
        "metti led verde, imposta r1 a 220, fai play",
        "carica esperimento blink poi mostra il led",
        "ferma, compila il codice, e poi fai partire",
        "scatta foto, poi cambia led a rosso, poi compila",
        "evidenzia il pulsante, poi metti r1 a 470, poi play",
        "apri arduino, carica blink, compila e fai partire",
        "imposta led verde, resistenza 1k, e schermata",
        "carica potenziometro dimmer, metti pulsante in evidenza, compila",
        "porta volume 3, accendi led, fai partire simulazione",
    ],
    "5_vision_basic": [
        "Analizza questo circuito",
        "Cosa vedi nell'immagine?",
        "Descrivi i componenti visibili",
        "Identifica i collegamenti",
        "Che esperimento mostra l'immagine?",
    ],
    "6_vision_avanzata": [
        "Guarda l'immagine: il LED è collegato correttamente? Spiega cosa controllare passo passo.",
        "Analizza il circuito in foto e dimmi se la polarità del LED è giusta. Se no, cosa correggere?",
        "Vedi l'immagine del circuito: il resistore è del valore giusto per proteggere il LED? Calcola.",
        "Guarda la foto e dimmi se ci sono errori di collegamento sulla breadboard. Lista dettagliata.",
        "Analizza l'immagine: identifica i componenti, valuta i collegamenti, suggerisci miglioramenti pedagogici.",
    ],
    "7_interfacciamento": [
        "carica esperimento blink",
        "vai al volume 3",
        "evidenzia il led",
        "compila e poi play",
        "metti led rosso e fai partire",
    ],
}

def call_chat(query, scenario):
    sess = "bench-" + uuid.uuid4().hex[:10]
    payload = {
        "message": query,
        "sessionId": sess,
        "experimentId": None,
        "history": [],
        "circuitState": CIRCUIT_STATE if "onnipotenza" in scenario or "interfacc" in scenario else None,
    }
    body = json.dumps(payload)
    t0 = time.perf_counter()
    try:
        result = subprocess.run([
            "curl", "-s", "-X", "POST", EDGE_URL,
            "-H", "Content-Type: application/json",
            "-H", f"x-elab-api-key: {API_KEY}",
            "-d", body,
            "--max-time", "30",
        ], capture_output=True, text=True, timeout=35)
        elapsed = time.perf_counter() - t0
        if result.returncode != 0:
            return {"q": query, "ok": False, "elapsed_s": elapsed, "err": result.stderr[:100]}
        resp = json.loads(result.stdout) if result.stdout.startswith('{') else {}
        text = resp.get("response", "")
        return {
            "q": query, "ok": True, "elapsed_s": elapsed,
            "source": resp.get("source", "unknown"),
            "len": len(text),
            "intents_parsed": len(resp.get("intents_parsed", []) or []),
            "has_ragazzi": "ragazzi" in text.lower(),
            "has_intent": "[INTENT:" in text or "[AZIONE:" in text,
        }
    except Exception as e:
        return {"q": query, "ok": False, "elapsed_s": time.perf_counter() - t0, "err": str(e)[:100]}

def call_vision(query, scenario):
    sess = "bench-vis-" + uuid.uuid4().hex[:10]
    payload = {
        "message": query,
        "sessionId": sess,
        "experimentId": None,
        "history": [],
        "circuitState": CIRCUIT_STATE,
        "images": [{"data": TINY_PNG_B64, "mime": "image/png"}],
    }
    body = json.dumps(payload)
    t0 = time.perf_counter()
    try:
        result = subprocess.run([
            "curl", "-s", "-X", "POST", EDGE_URL,
            "-H", "Content-Type: application/json",
            "-H", f"x-elab-api-key: {API_KEY}",
            "-d", body,
            "--max-time", "30",
        ], capture_output=True, text=True, timeout=35)
        elapsed = time.perf_counter() - t0
        if result.returncode != 0:
            return {"q": query, "ok": False, "elapsed_s": elapsed, "err": result.stderr[:100]}
        resp = json.loads(result.stdout) if result.stdout.startswith('{') else {}
        text = resp.get("response", "")
        return {
            "q": query, "ok": True, "elapsed_s": elapsed,
            "source": resp.get("source", "unknown"),
            "len": len(text),
            "has_ragazzi": "ragazzi" in text.lower(),
        }
    except Exception as e:
        return {"q": query, "ok": False, "elapsed_s": time.perf_counter() - t0, "err": str(e)[:100]}

def stats(values):
    if not values:
        return {"n": 0}
    v = sorted(values)
    return {
        "n": len(v),
        "avg_ms": round(statistics.mean(v) * 1000),
        "p50_ms": round(statistics.median(v) * 1000),
        "p95_ms": round(v[int(len(v)*0.95)-1] * 1000) if len(v) >= 5 else round(max(v) * 1000),
        "p99_ms": round(v[int(len(v)*0.99)-1] * 1000) if len(v) >= 10 else round(max(v) * 1000),
        "min_ms": round(min(v) * 1000),
        "max_ms": round(max(v) * 1000),
    }

print("=" * 70)
print(f"ELAB UNLIM 7-Capability Latency Bench — Edge v67 prod")
print(f"Target: {EDGE_URL}")
print(f"API key: {API_KEY[:12]}...")
print("=" * 70)

all_results = {}
for scenario, queries in CAPABILITIES.items():
    is_vision = "vision" in scenario
    fn = call_vision if is_vision else call_chat
    print(f"\n[{scenario}] {len(queries)} probes parallel-4...")
    results = []
    t_start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as ex:
        futures = {ex.submit(fn, q, scenario): q for q in queries}
        for fut in as_completed(futures):
            results.append(fut.result())
    wall_s = time.perf_counter() - t_start
    successes = [r for r in results if r["ok"]]
    failures = [r for r in results if not r["ok"]]
    elapsed_values = [r["elapsed_s"] for r in successes]
    s = stats(elapsed_values)
    all_results[scenario] = {
        "queries_count": len(queries),
        "successes": len(successes),
        "failures": len(failures),
        "wall_s": round(wall_s, 1),
        "stats": s,
        "sources": defaultdict(int),
        "raw": results,
    }
    for r in successes:
        all_results[scenario]["sources"][r.get("source", "unknown")] += 1
    print(f"  PASS {len(successes)}/{len(queries)} | wall {wall_s:.1f}s | avg {s.get('avg_ms','-')}ms p50 {s.get('p50_ms','-')}ms p95 {s.get('p95_ms','-')}ms max {s.get('max_ms','-')}ms")
    print(f"  Sources: {dict(all_results[scenario]['sources'])}")
    if failures:
        print(f"  FAILS: {[(r['q'][:30], r.get('err','?')[:40]) for r in failures[:3]]}")

print("\n" + "=" * 70)
print("FINAL TABLE p50 / p95 / avg per capability (ms)")
print("=" * 70)
print(f"{'Capability':<28} {'n':>4} {'avg':>7} {'p50':>7} {'p95':>7} {'p99':>7} {'max':>7}")
print("-" * 70)
for scenario, data in all_results.items():
    s = data["stats"]
    print(f"{scenario:<28} {s.get('n',0):>4} {s.get('avg_ms','-'):>7} {s.get('p50_ms','-'):>7} {s.get('p95_ms','-'):>7} {s.get('p99_ms','-'):>7} {s.get('max_ms','-'):>7}")

# Save full results JSON
out_path = "/tmp/bench-7-capabilities-results.json"
with open(out_path, "w") as f:
    # Convert defaultdicts to dict for JSON
    serializable = {k: {**v, "sources": dict(v["sources"])} for k, v in all_results.items()}
    json.dump(serializable, f, indent=2, default=str)
print(f"\nFull results → {out_path}")
