#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
  GALILEO BRAIN — Test Completo Automatico
═══════════════════════════════════════════════════════════════════
  Testa il modello GGUF via Ollama su TUTTI i 120 test cases
  dell'evaluation suite + 80 test aggiuntivi di stress.

  USO:
    # Test rapido (solo 120 eval suite)
    python3 scripts/test-brain-complete.py

    # Test completo (120 eval + 80 stress)
    python3 scripts/test-brain-complete.py --full

    # Test specifico per categoria
    python3 scripts/test-brain-complete.py --category action

    # Test con output dettagliato
    python3 scripts/test-brain-complete.py --verbose

    # Salva report
    python3 scripts/test-brain-complete.py --full --report

    # Usa un modello diverso
    python3 scripts/test-brain-complete.py --model galileo-brain-v3

  (c) Andrea Marro — 06/03/2026
═══════════════════════════════════════════════════════════════════
"""

import json
import argparse
import re
import sys
import time
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

# ─────────────────── PATHS ───────────────────
BASE_DIR = Path(__file__).parent.parent
EVAL_PATH = BASE_DIR / "datasets" / "evaluation-suite.jsonl"
REPORT_DIR = BASE_DIR / "reports"
COMPAT_REPORT_DIR = BASE_DIR / "datasets"  # backward compat with meta-trainer

# ─────────────────── SYSTEM PROMPT ───────────────────
BRAIN_SYSTEM_PROMPT = """Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
Ricevi il messaggio dello studente + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura esatta:
{
  "intent": "action|circuit|code|tutor|vision|navigation",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tag1]", "[AZIONE:tag2]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}

REGOLE:
1. Rispondi SEMPRE in JSON valido, nessun testo fuori dal JSON
2. "intent" deve essere uno dei 6 valori esatti
3. "actions" contiene tag [AZIONE:...] o [INTENT:{...}] per costruire circuiti
4. "needs_llm"=false per azioni deterministiche, true per spiegazioni/educativi
5. Se needs_llm=false, "response" contiene la risposta breve
6. Se needs_llm=true, "llm_hint" contiene il contesto per il modello grande"""

# ─────────────────── CONTEXTS ───────────────────
CONTEXTS = {
    "default": "tab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1",
    "empty": "tab: simulator\nesperimento: nessuno\ncomponenti: []\nfili: 0\nvolume_attivo: 1",
    "vol2": "tab: simulator\nesperimento: v2-cap1-esp1\ncomponenti: [led1, resistor1, pushbutton1]\nfili: 3\nvolume_attivo: 2",
    "vol3_avr": "tab: simulator\nesperimento: v3-cap1-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 3\nsimulationMode: avr",
    "canvas": "tab: canvas\nesperimento: nessuno\ncomponenti: []\nfili: 0\nvolume_attivo: 1",
    "manual": "tab: manual\nesperimento: nessuno\ncomponenti: []\nfili: 0\nvolume_attivo: 1",
    "editor": "tab: editor\nesperimento: v3-cap1-esp1\ncomponenti: [led1]\nfili: 1\nvolume_attivo: 3\nsimulationMode: avr",
    "complex": "tab: simulator\nesperimento: v1-cap8-esp2\ncomponenti: [led1, led2, resistor1, resistor2, pushbutton1, buzzer1]\nfili: 8\nvolume_attivo: 1",
}

# ─────────────────── STRESS TESTS (80 extra) ───────────────────
STRESS_TESTS = [
    # ── S01-S10: Action tag precision ──
    {"test_id": "S001", "category": "stress_action", "subcategory": "play_variants",
     "input": "vai vai vai!", "expected_intent": "action", "expected_actions": ["[AZIONE:play]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S002", "category": "stress_action", "subcategory": "play_variants",
     "input": "prova il circuito", "expected_intent": "action", "expected_actions": ["[AZIONE:play]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S003", "category": "stress_action", "subcategory": "pause_variants",
     "input": "basta", "expected_intent": "action", "expected_actions": ["[AZIONE:pause]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S004", "category": "stress_action", "subcategory": "clearall_variants",
     "input": "togli tutto dalla breadboard per favore", "expected_intent": "action", "expected_actions": ["[AZIONE:clearall]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S005", "category": "stress_action", "subcategory": "clearall_variants",
     "input": "elimina tutti i componenti", "expected_intent": "action", "expected_actions": ["[AZIONE:clearall]"], "expected_needs_llm": False,
     "context": "complex"},
    {"test_id": "S006", "category": "stress_action", "subcategory": "compile_variants",
     "input": "carica il programma sulla scheda", "expected_intent": "action", "expected_actions": ["[AZIONE:compile]"], "expected_needs_llm": False,
     "context": "vol3_avr"},
    {"test_id": "S007", "category": "stress_action", "subcategory": "diagnose_variants",
     "input": "perche il LED non funziona?", "expected_intent": "action", "expected_actions": ["[AZIONE:diagnose]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S008", "category": "stress_action", "subcategory": "quiz_variants",
     "input": "interrogami su questo esperimento", "expected_intent": "action", "expected_actions": ["[AZIONE:quiz]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S009", "category": "stress_action", "subcategory": "quiz_variants",
     "input": "verificami le conoscenze", "expected_intent": "action", "expected_actions": ["[AZIONE:quiz]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S010", "category": "stress_action", "subcategory": "multi_action",
     "input": "resetta il circuito e poi avvia", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default", "note": "Should emit reset + play"},

    # ── S11-S20: Circuit placement ──
    {"test_id": "S011", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Metti un LED rosso", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S012", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Aggiungi un diodo", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S013", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Piazza un MOSFET", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S014", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Aggiungi un motore DC", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S015", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Metti un LED RGB", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S016", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Piazza un interruttore reed", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S017", "category": "stress_circuit", "subcategory": "single_all_types",
     "input": "Aggiungi un fototransistor", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S018", "category": "stress_circuit", "subcategory": "multi_build",
     "input": "Costruisci un circuito con LED, resistore, pulsante e buzzer", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty", "note": "4 components"},
    {"test_id": "S019", "category": "stress_circuit", "subcategory": "multi_build",
     "input": "Fammi un circuito con 2 LED in parallelo e un resistore", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S020", "category": "stress_circuit", "subcategory": "wiring",
     "input": "Collega l'anodo del LED al pin D13 dell'Arduino", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "default"},

    # ── S21-S30: Navigation ──
    {"test_id": "S021", "category": "stress_nav", "subcategory": "tab",
     "input": "Portami al detective", "expected_intent": "navigation", "expected_actions": ["[AZIONE:opentab:detective]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S022", "category": "stress_nav", "subcategory": "tab",
     "input": "Andiamo al POE", "expected_intent": "navigation", "expected_actions": ["[AZIONE:opentab:poe]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S023", "category": "stress_nav", "subcategory": "tab",
     "input": "Apri i taccuini", "expected_intent": "navigation", "expected_actions": ["[AZIONE:opentab:taccuini]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S024", "category": "stress_nav", "subcategory": "tab",
     "input": "Vai alla reverse engineering", "expected_intent": "navigation", "expected_actions": ["[AZIONE:opentab:reverse]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S025", "category": "stress_nav", "subcategory": "tab",
     "input": "Apri la revisione circuito", "expected_intent": "navigation", "expected_actions": ["[AZIONE:opentab:review]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S026", "category": "stress_nav", "subcategory": "experiment",
     "input": "Carica cap 9 esp 1 del volume 1", "expected_intent": "navigation", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S027", "category": "stress_nav", "subcategory": "experiment",
     "input": "Voglio provare l'esperimento del motore", "expected_intent": "navigation", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S028", "category": "stress_nav", "subcategory": "volume",
     "input": "Apri il volume 1 a pagina 45", "expected_intent": "navigation", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S029", "category": "stress_nav", "subcategory": "youtube",
     "input": "Cerca su YouTube come funziona il PWM", "expected_intent": "action", "expected_actions": ["[AZIONE:youtube:*]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S030", "category": "stress_nav", "subcategory": "notebook",
     "input": "Crea un nuovo taccuino chiamato 'Appunti LED'", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},

    # ── S31-S40: Code & Scratch ──
    {"test_id": "S031", "category": "stress_code", "subcategory": "setcode",
     "input": "Scrivi un programma che fa lampeggiare il LED", "expected_intent": "code", "expected_needs_llm": False,
     "context": "vol3_avr"},
    {"test_id": "S032", "category": "stress_code", "subcategory": "setcode",
     "input": "Programma il fade del LED con PWM", "expected_intent": "code", "expected_needs_llm": False,
     "context": "vol3_avr"},
    {"test_id": "S033", "category": "stress_code", "subcategory": "scratch",
     "input": "Apri i blocchi per programmare", "expected_intent": "code", "expected_needs_llm": False,
     "context": "vol3_avr"},
    {"test_id": "S034", "category": "stress_code", "subcategory": "scratch",
     "input": "Voglio usare l'editor visuale", "expected_intent": "code", "expected_needs_llm": False,
     "context": "vol3_avr"},
    {"test_id": "S035", "category": "stress_code", "subcategory": "error",
     "input": "Il compilatore dice expected ';' before '}' token", "expected_intent": "code", "expected_needs_llm": True,
     "context": "vol3_avr"},
    {"test_id": "S036", "category": "stress_code", "subcategory": "error",
     "input": "Errore: 'ledPin' was not declared in this scope", "expected_intent": "code", "expected_needs_llm": True,
     "context": "vol3_avr"},
    {"test_id": "S037", "category": "stress_code", "subcategory": "explain",
     "input": "Cosa fa digitalWrite?", "expected_intent": "code", "expected_needs_llm": True,
     "context": "vol3_avr"},
    {"test_id": "S038", "category": "stress_code", "subcategory": "explain",
     "input": "Come si usa Serial.print?", "expected_intent": "code", "expected_needs_llm": True,
     "context": "vol3_avr"},
    {"test_id": "S039", "category": "stress_code", "subcategory": "switch_editor",
     "input": "Torna al codice Arduino", "expected_intent": "code", "expected_needs_llm": False,
     "context": "vol3_avr"},
    {"test_id": "S040", "category": "stress_code", "subcategory": "compile_play",
     "input": "Compila e avvia", "expected_intent": "action", "expected_needs_llm": False,
     "context": "vol3_avr", "note": "Should emit compile + play"},

    # ── S41-S50: Tutor (theory, pedagogy) ──
    {"test_id": "S041", "category": "stress_tutor", "subcategory": "theory",
     "input": "Spiegami cos'e la tensione elettrica", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S042", "category": "stress_tutor", "subcategory": "theory",
     "input": "Qual e la differenza tra serie e parallelo?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S043", "category": "stress_tutor", "subcategory": "theory",
     "input": "Come funziona un condensatore?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S044", "category": "stress_tutor", "subcategory": "theory",
     "input": "Perche il MOSFET ha 3 pin?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S045", "category": "stress_tutor", "subcategory": "safety",
     "input": "Posso collegare 220V alla breadboard?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S046", "category": "stress_tutor", "subcategory": "safety",
     "input": "Cosa succede se metto il LED senza resistenza?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S047", "category": "stress_tutor", "subcategory": "motivation",
     "input": "Non capisco niente, aiutami", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S048", "category": "stress_tutor", "subcategory": "redirect",
     "input": "Puoi fare i compiti di matematica?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S049", "category": "stress_tutor", "subcategory": "redirect",
     "input": "Chi sei?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S050", "category": "stress_tutor", "subcategory": "history",
     "input": "Chi ha inventato il LED?", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default"},

    # ── S51-S60: Vision ──
    {"test_id": "S051", "category": "stress_vision", "subcategory": "screenshot",
     "input": "Fai una foto del circuito", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S052", "category": "stress_vision", "subcategory": "screenshot",
     "input": "Scatta uno screenshot", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S053", "category": "stress_vision", "subcategory": "canvas",
     "input": "Guarda il mio disegno sulla lavagna", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "canvas"},
    {"test_id": "S054", "category": "stress_vision", "subcategory": "verify",
     "input": "E' giusto il collegamento?", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S055", "category": "stress_vision", "subcategory": "verify",
     "input": "Ho messo il diodo nel verso giusto?", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S056", "category": "stress_vision", "subcategory": "debug",
     "input": "Guarda perche non funziona e correggilo", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default", "note": "Vision + action chain"},
    {"test_id": "S057", "category": "stress_vision", "subcategory": "compare",
     "input": "Confronta il mio circuito con quello del libro", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S058", "category": "stress_vision", "subcategory": "describe",
     "input": "Descrivi cosa vedi", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},
    {"test_id": "S059", "category": "stress_vision", "subcategory": "canvas_art",
     "input": "Ho disegnato uno schema elettrico, analizzalo", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "canvas"},
    {"test_id": "S060", "category": "stress_vision", "subcategory": "mixed",
     "input": "Vedi il circuito e dimmi quali componenti servono", "expected_intent": "vision", "expected_needs_llm": True,
     "context": "default"},

    # ── S61-S70: Edge cases (hard) ──
    {"test_id": "S061", "category": "stress_edge", "subcategory": "chain_3",
     "input": "Pulisci tutto, costruisci un LED con resistore e avvia", "expected_intent": "action", "expected_needs_llm": False,
     "context": "complex", "note": "3-action chain: clearall + build + play"},
    {"test_id": "S062", "category": "stress_edge", "subcategory": "chain_5",
     "input": "Resetta, aggiungi un LED rosso, collegalo a D13, compila il blink e avvia", "expected_intent": "action", "expected_needs_llm": False,
     "context": "vol3_avr", "note": "5-action chain"},
    {"test_id": "S063", "category": "stress_edge", "subcategory": "italian_slang",
     "input": "buttaci un leddo", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty", "note": "Informal Italian"},
    {"test_id": "S064", "category": "stress_edge", "subcategory": "english_mix",
     "input": "run the simulation please", "expected_intent": "action", "expected_actions": ["[AZIONE:play]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S065", "category": "stress_edge", "subcategory": "english_mix",
     "input": "add a LED and a resistor", "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "empty"},
    {"test_id": "S066", "category": "stress_edge", "subcategory": "empty_msg",
     "input": "...", "expected_intent": "tutor", "expected_needs_llm": True,
     "context": "default", "note": "Minimal input"},
    {"test_id": "S067", "category": "stress_edge", "subcategory": "emoji",
     "input": "accendi tutto!", "expected_intent": "action", "expected_actions": ["[AZIONE:play]"], "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S068", "category": "stress_edge", "subcategory": "negation",
     "input": "Non toccare il resistore, rimuovi solo il LED", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default", "note": "Selective negation"},
    {"test_id": "S069", "category": "stress_edge", "subcategory": "context_switch",
     "input": "Stavo guardando il manuale, ora torna al simulatore", "expected_intent": "navigation", "expected_needs_llm": False,
     "context": "manual"},
    {"test_id": "S070", "category": "stress_edge", "subcategory": "long_input",
     "input": "Allora, vorrei che tu mi aiutassi a costruire un circuito completo con un LED collegato attraverso un resistore da 220 ohm al pin digitale 13 dell'Arduino, poi vorrei che tu compilassi il codice del blink e lo avviassi per vedere se funziona tutto correttamente",
     "expected_intent": "circuit", "expected_needs_llm": False,
     "context": "vol3_avr", "note": "Very long input"},

    # ── S71-S80: Component interactions ──
    {"test_id": "S071", "category": "stress_interact", "subcategory": "button",
     "input": "Tieni premuto il pulsante", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S072", "category": "stress_interact", "subcategory": "pot",
     "input": "Gira il potenziometro al massimo", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S073", "category": "stress_interact", "subcategory": "value",
     "input": "Cambia la resistenza a 1 kilohm", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S074", "category": "stress_interact", "subcategory": "value",
     "input": "Imposta il condensatore a 100 microfarad", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S075", "category": "stress_interact", "subcategory": "measure",
     "input": "Quanta corrente passa nel resistore?", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S076", "category": "stress_interact", "subcategory": "measure",
     "input": "Qual e la tensione ai capi del LED?", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S077", "category": "stress_interact", "subcategory": "highlight",
     "input": "Dove si trova il catodo del LED?", "expected_intent": "action", "expected_needs_llm": False,
     "context": "default"},
    {"test_id": "S078", "category": "stress_interact", "subcategory": "highlight",
     "input": "Mostrami tutti i componenti", "expected_intent": "action", "expected_needs_llm": False,
     "context": "complex"},
    {"test_id": "S079", "category": "stress_interact", "subcategory": "move",
     "input": "Sposta il buzzer vicino al LED", "expected_intent": "action", "expected_needs_llm": False,
     "context": "complex"},
    {"test_id": "S080", "category": "stress_interact", "subcategory": "remove_selective",
     "input": "Rimuovi il secondo LED ma lascia il primo", "expected_intent": "action", "expected_needs_llm": False,
     "context": "complex"},
]


# ─────────────────── HELPER FUNCTIONS ───────────────────

def load_eval_suite() -> List[Dict]:
    """Load evaluation test cases from JSONL."""
    tests = []
    with open(EVAL_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                tests.append(json.loads(line))
    return tests


def make_user_message(input_text: str, context_key: str = "default") -> str:
    """Create user message with context."""
    ctx = CONTEXTS.get(context_key, CONTEXTS["default"])
    return f"[CONTESTO]\n{ctx}\n\n[MESSAGGIO]\n{input_text}"


def call_ollama(model: str, user_msg: str, timeout: int = 300) -> Tuple[Optional[Dict], float, str]:
    """
    Call Ollama API using STREAMING mode and return (parsed_json, latency_ms, raw_response).
    Streaming avoids HTTP timeout issues on slow hardware (e.g., 8GB M1).
    Returns (None, latency, raw) if parsing fails.
    """
    import requests

    url = "http://localhost:11434/api/chat"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": BRAIN_SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        "stream": True,
        "options": {"temperature": 0.1, "num_predict": 512},
    }

    t0 = time.time()
    try:
        resp = requests.post(url, json=payload, timeout=timeout, stream=True)
        resp.raise_for_status()

        # Collect streaming chunks
        content = ""
        for line in resp.iter_lines():
            if line:
                chunk = json.loads(line)
                if "message" in chunk and "content" in chunk["message"]:
                    content += chunk["message"]["content"]
                if chunk.get("done", False):
                    break

        latency = (time.time() - t0) * 1000  # ms

        # Strip thinking tags (Qwen3 sometimes emits <think>...</think>)
        clean = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()

        # Try to parse JSON
        try:
            parsed = json.loads(clean)
            return parsed, latency, clean
        except json.JSONDecodeError:
            # Try to extract JSON from text
            match = re.search(r'\{.*\}', clean, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group())
                    return parsed, latency, clean
                except json.JSONDecodeError:
                    pass
            return None, latency, clean

    except Exception as e:
        latency = (time.time() - t0) * 1000
        return None, latency, str(e)


def check_json_valid(parsed: Optional[Dict]) -> bool:
    """Check if response is valid JSON with required fields."""
    if parsed is None:
        return False
    required = {"intent", "entities", "actions", "needs_llm", "response", "llm_hint"}
    return required.issubset(set(parsed.keys()))


def check_intent(predicted: Dict, expected: Dict) -> bool:
    """Check if intent matches."""
    return predicted.get("intent") == expected.get("expected_intent")


def check_actions(predicted: Dict, expected: Dict) -> bool:
    """Check if actions match (supports wildcards)."""
    if "expected_actions" not in expected:
        return True

    pred_actions = predicted.get("actions", [])
    exp_actions = expected["expected_actions"]

    if not exp_actions:
        return len(pred_actions) == 0

    for exp in exp_actions:
        if exp.endswith("*]"):
            prefix = exp[:-2]
            if not any(a.startswith(prefix) for a in pred_actions):
                return False
        else:
            if exp not in pred_actions:
                return False
    return True


def check_needs_llm(predicted: Dict, expected: Dict) -> bool:
    """Check if needs_llm matches."""
    if "expected_needs_llm" not in expected:
        return True
    return predicted.get("needs_llm") == expected["expected_needs_llm"]


def check_response_not_empty(predicted: Dict) -> bool:
    """If needs_llm=false, response should not be null/empty."""
    if predicted.get("needs_llm") is False:
        resp = predicted.get("response")
        return resp is not None and len(str(resp).strip()) > 0
    return True


def check_llm_hint_not_empty(predicted: Dict) -> bool:
    """If needs_llm=true, llm_hint should not be null/empty."""
    if predicted.get("needs_llm") is True:
        hint = predicted.get("llm_hint")
        return hint is not None and len(str(hint).strip()) > 0
    return True


def evaluate_single(predicted: Optional[Dict], expected: Dict, latency: float, raw: str) -> Dict:
    """Evaluate a single test case."""
    result = {
        "test_id": expected["test_id"],
        "category": expected["category"],
        "subcategory": expected.get("subcategory", ""),
        "input": expected["input"],
        "latency_ms": round(latency, 1),
        "json_valid": check_json_valid(predicted),
    }

    if predicted is None:
        result.update({
            "intent_correct": False,
            "actions_correct": False,
            "needs_llm_correct": False,
            "response_valid": False,
            "hint_valid": False,
            "pass": False,
            "raw_response": raw[:200],
            "failure_reasons": ["JSON_PARSE_FAILED"],
        })
        return result

    result["intent_correct"] = check_intent(predicted, expected)
    result["actions_correct"] = check_actions(predicted, expected)
    result["needs_llm_correct"] = check_needs_llm(predicted, expected)
    result["response_valid"] = check_response_not_empty(predicted)
    result["hint_valid"] = check_llm_hint_not_empty(predicted)
    result["predicted_intent"] = predicted.get("intent")
    result["predicted_actions"] = predicted.get("actions", [])
    result["predicted_needs_llm"] = predicted.get("needs_llm")

    # Determine failure reasons
    reasons = []
    if not result["json_valid"]:
        reasons.append("INVALID_JSON_SCHEMA")
    if not result["intent_correct"]:
        reasons.append(f"INTENT:{predicted.get('intent')}!={expected.get('expected_intent')}")
    if not result["actions_correct"]:
        reasons.append(f"ACTIONS:{predicted.get('actions')}!={expected.get('expected_actions', [])}")
    if not result["needs_llm_correct"]:
        reasons.append(f"NEEDS_LLM:{predicted.get('needs_llm')}!={expected.get('expected_needs_llm')}")
    if not result["response_valid"]:
        reasons.append("EMPTY_RESPONSE_WHEN_NO_LLM")
    if not result["hint_valid"]:
        reasons.append("EMPTY_HINT_WHEN_LLM_NEEDED")

    result["failure_reasons"] = reasons
    result["pass"] = len(reasons) == 0

    return result


# ─────────────────── MAIN RUNNER ───────────────────

def run_tests(tests: List[Dict], model: str, verbose: bool = False) -> List[Dict]:
    """Run all tests against Ollama model."""
    import requests

    # Check Ollama is running (generous timeout for cold start)
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=30)
        r.raise_for_status()
        models = [m["name"] for m in r.json().get("models", [])]
        if not any(model in m for m in models):
            print(f"\n  ERRORE: Modello '{model}' non trovato in Ollama!")
            print(f"  Modelli disponibili: {models}")
            print(f"\n  Crealo con: ollama create {model} -f models/Modelfile")
            sys.exit(1)
        print(f"  Ollama OK - modello '{model}' trovato")
    except Exception as e:
        print(f"\n  ERRORE: Ollama non raggiungibile! ({e})")
        print(f"  Assicurati che Ollama sia in esecuzione: ollama serve")
        sys.exit(1)

    results = []
    total = len(tests)
    passed = 0
    start_time = time.time()

    print(f"\n{'='*70}")
    print(f"  RUNNING {total} TESTS against '{model}'")
    print(f"{'='*70}\n")

    for i, test in enumerate(tests):
        ctx_key = test.get("context", "default")
        user_msg = make_user_message(test["input"], ctx_key)
        predicted, latency, raw = call_ollama(model, user_msg)
        result = evaluate_single(predicted, test, latency, raw)
        results.append(result)

        status = "PASS" if result["pass"] else "FAIL"
        icon = "+" if result["pass"] else "x"

        if result["pass"]:
            passed += 1

        # Print progress
        if verbose or not result["pass"]:
            print(f"  [{icon}] {i+1:3d}/{total} {test['test_id']} {status} ({latency:.0f}ms)")
            print(f"      Input: {test['input'][:60]}")
            if not result["pass"]:
                for reason in result["failure_reasons"]:
                    print(f"      >> {reason}")
                if predicted:
                    print(f"      Got: intent={predicted.get('intent')}, actions={predicted.get('actions')}, needs_llm={predicted.get('needs_llm')}")
            if verbose and result["pass"]:
                print(f"      OK: intent={result.get('predicted_intent')}, actions={result.get('predicted_actions', [])}")
        else:
            # Compact progress
            sys.stdout.write(f"\r  [{passed}/{i+1}] {test['test_id']} {status} ({latency:.0f}ms)     ")
            sys.stdout.flush()

    elapsed = time.time() - start_time
    print(f"\n\n  Completed in {elapsed:.1f}s (avg {elapsed/total*1000:.0f}ms/test)")

    return results


# ─────────────────── REPORT GENERATION ───────────────────

def print_report(results: List[Dict], model: str, save_to_file: bool = False):
    """Print comprehensive test report."""
    total = len(results)
    passed = sum(1 for r in results if r["pass"])
    failed = total - passed
    json_valid = sum(1 for r in results if r["json_valid"])
    avg_latency = sum(r["latency_ms"] for r in results) / total if total > 0 else 0

    lines = []
    def p(s=""):
        lines.append(s)
        print(s)

    p()
    p("=" * 70)
    p(f"  GALILEO BRAIN TEST REPORT")
    p(f"  Model: {model}")
    p(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    p("=" * 70)

    # Overall score
    pct = passed / total * 100 if total > 0 else 0
    grade = "S" if pct >= 98 else "A" if pct >= 95 else "B" if pct >= 90 else "C" if pct >= 80 else "D" if pct >= 70 else "F"
    p(f"\n  OVERALL: {passed}/{total} ({pct:.1f}%) — Grade: {grade}")
    p(f"  JSON Valid: {json_valid}/{total} ({json_valid/total*100:.1f}%)")
    p(f"  Avg Latency: {avg_latency:.0f}ms")

    # By category
    p(f"\n  {'CATEGORY':<25s} {'PASS':>5s} {'TOTAL':>5s} {'PCT':>7s}  {'BAR'}")
    p(f"  {'-'*60}")
    categories = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"total": 0, "pass": 0}
        categories[cat]["total"] += 1
        if r["pass"]:
            categories[cat]["pass"] += 1

    for cat, stats in sorted(categories.items()):
        pct_cat = stats["pass"] / stats["total"] * 100
        bar = "+" * int(pct_cat / 5) + "-" * (20 - int(pct_cat / 5))
        p(f"  {cat:<25s} {stats['pass']:5d} {stats['total']:5d} {pct_cat:6.1f}%  [{bar}]")

    # By metric
    intent_ok = sum(1 for r in results if r.get("intent_correct", False))
    actions_ok = sum(1 for r in results if r.get("actions_correct", False))
    nlm_ok = sum(1 for r in results if r.get("needs_llm_correct", False))
    resp_ok = sum(1 for r in results if r.get("response_valid", True))
    hint_ok = sum(1 for r in results if r.get("hint_valid", True))

    p(f"\n  METRICS:")
    p(f"  Intent accuracy:      {intent_ok:3d}/{total} ({intent_ok/total*100:.1f}%)")
    p(f"  Action accuracy:      {actions_ok:3d}/{total} ({actions_ok/total*100:.1f}%)")
    p(f"  needs_llm accuracy:   {nlm_ok:3d}/{total} ({nlm_ok/total*100:.1f}%)")
    p(f"  Response non-empty:   {resp_ok:3d}/{total} ({resp_ok/total*100:.1f}%)")
    p(f"  Hint non-empty:       {hint_ok:3d}/{total} ({hint_ok/total*100:.1f}%)")

    # Latency stats
    latencies = [r["latency_ms"] for r in results]
    latencies.sort()
    p(f"\n  LATENCY:")
    p(f"  Min: {min(latencies):.0f}ms | P50: {latencies[len(latencies)//2]:.0f}ms | P95: {latencies[int(len(latencies)*0.95)]:.0f}ms | Max: {max(latencies):.0f}ms")

    # Failed tests detail
    failed_results = [r for r in results if not r["pass"]]
    if failed_results:
        p(f"\n  FAILED TESTS ({len(failed_results)}):")
        p(f"  {'-'*60}")
        for r in failed_results:
            reasons = ", ".join(r.get("failure_reasons", ["unknown"]))
            p(f"  {r['test_id']} [{r['category']}/{r['subcategory']}]:")
            p(f"    Input:   {r['input'][:70]}")
            p(f"    Reason:  {reasons}")
            if r.get("predicted_intent"):
                p(f"    Got:     intent={r.get('predicted_intent')}, actions={r.get('predicted_actions', [])}, needs_llm={r.get('predicted_needs_llm')}")

    # Weak areas analysis
    p(f"\n  WEAK AREAS ANALYSIS:")
    p(f"  {'-'*60}")
    weak_cats = {cat: stats for cat, stats in categories.items()
                 if stats["pass"] < stats["total"]}
    if weak_cats:
        for cat, stats in sorted(weak_cats.items(), key=lambda x: x[1]["pass"]/x[1]["total"]):
            pct_cat = stats["pass"] / stats["total"] * 100
            p(f"  {cat}: {pct_cat:.0f}% — needs {stats['total'] - stats['pass']} more correct")

            # Show specific failures in this category
            cat_fails = [r for r in failed_results if r["category"] == cat]
            failure_types = {}
            for r in cat_fails:
                for reason in r.get("failure_reasons", []):
                    key = reason.split(":")[0]
                    failure_types[key] = failure_types.get(key, 0) + 1
            if failure_types:
                p(f"    Failure breakdown: {failure_types}")
    else:
        p(f"  No weak areas detected! All categories at 100%")

    # Recommendations
    p(f"\n  RECOMMENDATIONS:")
    p(f"  {'-'*60}")
    if json_valid < total:
        p(f"  [CRITICAL] {total - json_valid} responses had invalid JSON — retrain with stricter JSON enforcement")
    if intent_ok < total * 0.95:
        intent_fails = [r for r in failed_results if not r.get("intent_correct", False)]
        confused = {}
        for r in intent_fails:
            key = f"{r.get('expected_intent', '?')}->{r.get('predicted_intent', '?')}"
            confused[key] = confused.get(key, 0) + 1
        if confused:
            p(f"  [HIGH] Intent confusion matrix: {confused}")
            p(f"  -> Add more examples for confused intent pairs in training data")
    if actions_ok < total * 0.90:
        p(f"  [HIGH] Action tag accuracy below 90% — add more tag-specific examples")
    if avg_latency > 2000:
        p(f"  [MEDIUM] Average latency {avg_latency:.0f}ms is high — consider smaller quantization or GPU")
    if pct >= 95:
        p(f"  [OK] Model performance is excellent! Ready for production integration.")

    p(f"\n{'='*70}")

    # Save report
    if save_to_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # Ensure directories exist
        REPORT_DIR.mkdir(exist_ok=True)
        COMPAT_REPORT_DIR.mkdir(exist_ok=True)

        report_path = REPORT_DIR / f"test-report-{timestamp}.md"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"\n  Report saved: {report_path}")

        # Also save raw results as JSONL
        results_path = REPORT_DIR / f"test-results-{timestamp}.jsonl"
        with open(results_path, "w", encoding="utf-8") as f:
            for r in results:
                f.write(json.dumps(r, ensure_ascii=True) + "\n")
        print(f"  Results saved: {results_path}")

        # Backward compat: copy report to datasets/ for meta-trainer analyze
        compat_report = COMPAT_REPORT_DIR / f"brain-test-report-{timestamp}.md"
        with open(compat_report, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"  Compat report: {compat_report}")


# ─────────────────── CLI ───────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Galileo Brain — Test Completo Automatico",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Esempi:
  python3 scripts/test-brain-complete.py                    # 120 eval tests
  python3 scripts/test-brain-complete.py --full             # 120 + 80 stress = 200
  python3 scripts/test-brain-complete.py --category action  # Solo azioni
  python3 scripts/test-brain-complete.py --full --report    # Salva report
  python3 scripts/test-brain-complete.py --verbose          # Output dettagliato
        """
    )
    parser.add_argument("--model", default="galileo-tutor", help="Ollama model name (default: galileo-tutor)")
    parser.add_argument("--full", action="store_true", help="Include 80 stress tests (200 total)")
    parser.add_argument("--category", help="Filter by category (e.g., action, circuit, tutor)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show all test details")
    parser.add_argument("--report", action="store_true", help="Save report to datasets/")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout per request in seconds")
    args = parser.parse_args()

    # Load tests
    tests = load_eval_suite()
    print(f"\n  Loaded {len(tests)} eval tests from {EVAL_PATH}")

    if args.full:
        tests.extend(STRESS_TESTS)
        print(f"  Added {len(STRESS_TESTS)} stress tests (total: {len(tests)})")

    if args.category:
        tests = [t for t in tests if args.category.lower() in t["category"].lower()]
        print(f"  Filtered to {len(tests)} tests for category '{args.category}'")

    if not tests:
        print("  No tests to run!")
        sys.exit(0)

    # Run
    results = run_tests(tests, args.model, verbose=args.verbose)

    # Report
    print_report(results, args.model, save_to_file=args.report)
