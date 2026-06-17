#!/usr/bin/env python3
"""
Convert Galileo Brain V10 dataset → V14 dataset.

Key changes:
1. Remap 20+ old action tags → 4 simplified production tags [AZIONE:tipo:dettagli]
2. Update system prompt to V14 (7 intents, 4 action categories)
3. Enrich empty responses for needs_llm=false cases
4. Validate and clean all examples

Usage:
    python3 convert-v10-to-v14.py \
        --input datasets/galileo-brain-v10.jsonl \
        --output datasets/galileo-brain-v14.jsonl \
        --eval-input datasets/galileo-brain-v10-eval.jsonl \
        --eval-output datasets/galileo-brain-v14-eval.jsonl
"""

import json
import random
import argparse
import sys
from collections import Counter
from pathlib import Path

random.seed(20260326014)

# ============================================================
# V14 SYSTEM PROMPT — aligned with production shared-optimized.yml v5.6
# ============================================================
SYSTEM_PROMPT_V14 = """Sei il Galileo Brain, il cervello di routing di ELAB Tutor.
ELAB Tutor e' una piattaforma educativa di elettronica per ragazzi 10-14 anni e per i loro docenti.

Ricevi il messaggio dell'utente (studente O docente) + contesto del simulatore.
Rispondi SOLO in JSON valido con questa struttura:
{
  "intent": "action|circuit|code|tutor|vision|navigation|teacher",
  "entities": ["componente1", "pin1"],
  "actions": ["[AZIONE:tipo:dettagli]"],
  "needs_llm": true/false,
  "response": "risposta breve se needs_llm=false, null altrimenti",
  "llm_hint": "contesto per il modello grande se needs_llm=true, null altrimenti"
}

REGOLE:
1. "intent" classifica: action (play/pause/reset/interact), circuit (componenti/fili), code (Arduino/Scratch), tutor (teoria/spiegazioni), vision (analisi immagini), navigation (carica esperimenti/tab), teacher (richieste didattiche docente)
2. "entities": componenti, pin, esperimenti menzionati
3. "actions": array di [AZIONE:tipo:dettagli] — 4 tipi:
   - [AZIONE:play:start/pause/reset/clearall] → controllo simulazione
   - [AZIONE:build:add/remove/wire/setvalue/interact] → costruisci/modifica circuito
   - [AZIONE:code:compile/switch/open/write] → codice Arduino/Scratch
   - [AZIONE:show:loadexp/tab/highlight/measure/screenshot/quiz/nextstep/prevstep] → mostra/carica/evidenzia
4. "needs_llm": false se puoi rispondere da solo, true se serve ragionamento
5. "response": frase breve calda (max 15 parole). Linguaggio 10-14 anni. Analogie quotidiane.
6. "llm_hint": se needs_llm=true, descrivi contesto per LLM grande

COMPONENTI VALIDI: led, resistor, push-button, buzzer-piezo, capacitor, potentiometer, photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo, reed-switch, phototransistor, battery9v, multimeter, lcd16x2, nano-r4-board, breadboard-half, breadboard-full, wire"""

# ============================================================
# ACTION TAG MAPPING: old → new [AZIONE:tipo:dettagli]
# ============================================================
TAG_MAP = {
    # play category
    "play":           "[AZIONE:play:start]",
    "pause":          "[AZIONE:play:pause]",
    "reset":          "[AZIONE:play:reset]",
    "clearall":       "[AZIONE:play:clearall]",
    # build category
    "addcomponent":   "[AZIONE:build:add]",
    "removecomponent":"[AZIONE:build:remove]",
    "addwire":        "[AZIONE:build:wire]",
    "setvalue":       "[AZIONE:build:setvalue]",
    "interact":       "[AZIONE:build:interact]",
    # code category
    "compile":        "[AZIONE:code:compile]",
    "switcheditor":   "[AZIONE:code:switch]",
    "openeditor":     "[AZIONE:code:open]",
    # show category
    "screenshot":     "[AZIONE:show:screenshot]",
    "loadexp":        "[AZIONE:show:loadexp]",
    "opentab":        "[AZIONE:show:tab]",
    "highlight":      "[AZIONE:show:highlight]",
    "measure":        "[AZIONE:show:measure]",
    "quiz":           "[AZIONE:show:quiz]",
    "nextstep":       "[AZIONE:show:nextstep]",
    "prevstep":       "[AZIONE:show:prevstep]",
    "diagnose":       "[AZIONE:show:highlight]",
    # additional tags found in V10
    "undo":           "[AZIONE:build:undo]",
    "redo":           "[AZIONE:build:redo]",
    "removewire":     "[AZIONE:build:removewire]",
    "youtube":        "[AZIONE:show:youtube]",
    "searchvideo":    "[AZIONE:show:youtube]",
    "getcode":        "[AZIONE:code:get]",
    "closeeditor":    "[AZIONE:code:close]",
    "loadblocks":     "[AZIONE:code:loadblocks]",
    "move":           "[AZIONE:build:move]",
}

# ============================================================
# RESPONSE ENRICHMENT — short warm responses for needs_llm=false
# Language: 10-14 years, max 15 words, warm + encouraging
# ============================================================
RESPONSE_TEMPLATES = {
    # play
    "play:start":     ["Simulazione partita! Guarda cosa succede.", "Via! Osserva il circuito.", "Fatto! Guarda le luci.", "Ecco, parte! Osserva bene."],
    "play:pause":     ["In pausa. Prendi fiato!", "Pausa! Guarda con calma.", "Fermo! Puoi osservare bene."],
    "play:reset":     ["Reset! Tutto come nuovo.", "Riparte da zero! Pronto?", "Resettato. Via di nuovo!"],
    "play:clearall":  ["Tutto pulito! Pronto per un nuovo circuito.", "Via tutto! Tavolo sgombro.", "Pulito! Ricomincia da capo."],
    # build
    "build:add":      ["Pezzo aggiunto! Mettilo al posto giusto.", "Ecco il pezzo! Ora collegalo.", "Aggiunto! Dove lo metti?"],
    "build:remove":   ["Tolto! Uno in meno.", "Rimosso! Il circuito e' piu' leggero.", "Via! Non serviva piu'."],
    "build:wire":     ["Filo pronto! Collega i punti.", "Ecco il filo! Unisci bene.", "Filo aggiunto!"],
    "build:setvalue": ["Valore cambiato! Prova ora.", "Fatto! Guarda la differenza.", "Regolato! Vedi il cambio?"],
    "build:interact": ["Interazione! Guarda l'effetto.", "Fatto! Osserva cosa cambia.", "Ecco! Nota la differenza."],
    # code
    "code:compile":   ["Compilo il codice! Un attimo...", "Preparo il programma! Aspetta...", "Lo sto preparando!"],
    "code:switch":    ["Cambio editor! Ecco.", "Pronto con l'altro editor!", "Fatto! Nuovo editor."],
    "code:open":      ["Editor aperto! Scrivi il codice.", "Ecco l'editor! Pronto a programmare?", "Aperto! Scrivi qui."],
    "code:write":     ["Codice scritto! Prova a compilare.", "Ecco il codice! Guarda.", "Scritto! Ora compila."],
    # show
    "show:loadexp":   ["Esperimento caricato! Leggi la guida.", "Ecco l'esperimento! Pronto?", "Caricato! Segui i passi."],
    "show:tab":       ["Ecco la schermata!", "Aperto! Guarda qui.", "Pronto! Eccola."],
    "show:highlight": ["Guarda qui, lo evidenzio!", "Ecco, lo vedi?", "Evidenziato! Nota questo pezzo."],
    "show:measure":   ["Misura fatta! Leggi il valore.", "Ecco il risultato!", "Misurato!"],
    "show:screenshot":["Foto scattata! La puoi salvare.", "Screenshot fatto!", "Ecco la foto del circuito!"],
    "show:quiz":      ["Quiz pronto! Prova a rispondere.", "Sfida! Sei pronto?", "Gioco! Pensa bene..."],
    "show:nextstep":  ["Passo avanti! Leggi bene.", "Prossimo passo! Dai!", "Avanti! Ecco cosa fare."],
    "show:prevstep":  ["Torniamo indietro. Riguarda.", "Passo prima! Rileggi.", "Indietro! Riguardiamo."],
    "show:youtube":   ["Ecco il video! Guardalo.", "Video trovato! Buona visione.", "Ecco! Guarda e impara."],
    # build extras
    "build:undo":     ["Annullato! Come prima.", "Torno indietro! Fatto.", "Undo! Era meglio prima."],
    "build:redo":     ["Rifatto! Ecco.", "Avanti! Rimesso.", "Redo! Torna com'era."],
    "build:removewire":["Filo tolto!", "Via il filo!", "Rimosso!"],
    "build:move":     ["Spostato! Meglio cosi'.", "Ecco, l'ho mosso.", "Fatto! Ora sta meglio."],
    # code extras
    "code:get":       ["Ecco il codice!", "Codice pronto! Leggilo.", "Eccolo! Guarda il codice."],
    "code:close":     ["Editor chiuso!", "Chiuso! Torniamo al circuito.", "Ok, chiuso!"],
    "code:loadblocks":["Blocchi caricati! Pronto.", "Ecco i blocchi Scratch!", "Caricati! Trascina i blocchi."],
}


def remap_action(old_action: str) -> str:
    """Convert old action tag format to new [AZIONE:tipo:dettagli] format."""
    if not old_action or not isinstance(old_action, str):
        return old_action

    # Keep [INTENT:{...}] as-is — circuit build instructions
    if "[INTENT:" in old_action:
        return old_action

    # Extract tag and extra from [AZIONE:tag:extra] format
    tag = old_action
    extra = ""
    if "[AZIONE:" in old_action:
        inner = old_action.split("[AZIONE:")[1].rstrip("]")
        parts = inner.split(":")
        tag = parts[0]
        extra = ":".join(parts[1:]) if len(parts) > 1 else ""

    tag = tag.strip().lower()

    # Already in new 4-category format? (play/build/code/show)
    if tag in ("play", "build", "code", "show") and extra:
        return old_action  # Already correct format

    if tag in TAG_MAP:
        new_tag = TAG_MAP[tag]
        # Append extra details (e.g., addcomponent:led → build:add:led)
        if extra:
            base = new_tag.rstrip("]")
            return f"{base}:{extra}]"
        return new_tag

    # Unknown tag — best effort categorization
    if any(k in tag for k in ["add", "wire", "component", "connect", "set", "remove"]):
        detail = f"{tag}:{extra}" if extra else tag
        return f"[AZIONE:build:{detail}]"
    if any(k in tag for k in ["compile", "code", "editor", "scratch"]):
        detail = f"{tag}:{extra}" if extra else tag
        return f"[AZIONE:code:{detail}]"
    if any(k in tag for k in ["play", "pause", "stop", "reset", "start"]):
        detail = f"{tag}:{extra}" if extra else tag
        return f"[AZIONE:play:{detail}]"
    detail = f"{tag}:{extra}" if extra else tag
    return f"[AZIONE:show:{detail}]"


def get_action_category(action: str) -> str:
    """Extract category from [AZIONE:tipo:dettagli]."""
    if "[AZIONE:" not in action:
        return "unknown"
    inner = action.split("[AZIONE:")[1].rstrip("]")
    parts = inner.split(":")
    if len(parts) >= 2:
        return f"{parts[0]}:{parts[1]}"
    return parts[0]


def enrich_response(asst_data: dict, actions: list) -> str:
    """Generate a warm, kid-friendly response for needs_llm=false cases."""
    if asst_data.get("needs_llm", True):
        return asst_data.get("response") or None

    existing = asst_data.get("response")
    if existing and existing != "null" and len(existing.strip()) > 5:
        return existing  # Keep good existing responses

    # Generate from action category
    if actions:
        cat = get_action_category(actions[0])
        templates = RESPONSE_TEMPLATES.get(cat, [])
        if templates:
            return random.choice(templates)

    # Fallback by intent
    intent = asst_data.get("intent", "")
    fallbacks = {
        "action": ["Fatto! Guarda cosa succede.", "Ecco! Pronto.", "Fatto!"],
        "circuit": ["Circuito aggiornato! Guarda.", "Fatto! Controlla il circuito."],
        "code": ["Codice pronto!", "Fatto! Prova a compilare."],
        "navigation": ["Ecco! Caricato.", "Pronto! Guarda qui."],
    }
    if intent in fallbacks:
        return random.choice(fallbacks[intent])

    return existing


def convert_example(example: dict) -> dict:
    """Convert a single V10 example to V14 format."""
    msgs = example["messages"]

    # 1. Update system prompt
    msgs[0]["content"] = SYSTEM_PROMPT_V14

    # 2. Parse and transform assistant response
    try:
        asst_data = json.loads(msgs[2]["content"])
    except (json.JSONDecodeError, KeyError):
        return None  # Skip malformed

    # 3. Remap actions
    old_actions = asst_data.get("actions", [])
    new_actions = [remap_action(a) for a in old_actions]
    asst_data["actions"] = new_actions

    # 4. Enrich response
    new_resp = enrich_response(asst_data, new_actions)
    asst_data["response"] = new_resp

    # 5. Ensure all required fields
    for field in ["intent", "entities", "actions", "needs_llm", "response", "llm_hint"]:
        if field not in asst_data:
            if field == "entities":
                asst_data[field] = []
            elif field == "actions":
                asst_data[field] = []
            elif field == "needs_llm":
                asst_data[field] = True
            elif field in ("response", "llm_hint"):
                asst_data[field] = None

    # 6. Validate intent
    valid_intents = {"action", "circuit", "code", "tutor", "vision", "navigation", "teacher"}
    if asst_data.get("intent") not in valid_intents:
        return None  # Skip invalid intent

    msgs[2]["content"] = json.dumps(asst_data, ensure_ascii=False)
    return {"messages": msgs}


def convert_dataset(input_path: str, output_path: str) -> dict:
    """Convert entire dataset and return stats."""
    stats = {
        "total_in": 0, "total_out": 0, "skipped": 0,
        "intents": Counter(), "tag_cats": Counter(),
        "resp_filled": 0, "resp_empty": 0,
    }

    with open(input_path) as fin, open(output_path, "w") as fout:
        for line in fin:
            stats["total_in"] += 1
            try:
                example = json.loads(line)
                converted = convert_example(example)
                if converted is None:
                    stats["skipped"] += 1
                    continue

                fout.write(json.dumps(converted, ensure_ascii=False) + "\n")
                stats["total_out"] += 1

                # Collect stats
                asst = json.loads(converted["messages"][2]["content"])
                stats["intents"][asst.get("intent", "?")] += 1
                for a in asst.get("actions", []):
                    cat = get_action_category(a)
                    stats["tag_cats"][cat] += 1
                resp = asst.get("response")
                if resp and resp != "null" and str(resp).strip():
                    stats["resp_filled"] += 1
                else:
                    stats["resp_empty"] += 1

            except Exception as e:
                stats["skipped"] += 1
                if stats["skipped"] <= 5:
                    print(f"  SKIP line {stats['total_in']}: {e}", file=sys.stderr)

    return stats


def main():
    parser = argparse.ArgumentParser(description="Convert V10 → V14 dataset")
    parser.add_argument("--input", "-i", default="datasets/galileo-brain-v10.jsonl")
    parser.add_argument("--output", "-o", default="datasets/galileo-brain-v14.jsonl")
    parser.add_argument("--eval-input", default="datasets/galileo-brain-v10-eval.jsonl")
    parser.add_argument("--eval-output", default="datasets/galileo-brain-v14-eval.jsonl")
    args = parser.parse_args()

    print("=" * 60)
    print("Galileo Brain V10 → V14 Conversion")
    print("=" * 60)

    # Convert training set
    print(f"\n[TRAIN] {args.input} → {args.output}")
    train_stats = convert_dataset(args.input, args.output)

    print(f"\n  In:      {train_stats['total_in']:,}")
    print(f"  Out:     {train_stats['total_out']:,}")
    print(f"  Skipped: {train_stats['skipped']:,}")
    print(f"  Responses filled: {train_stats['resp_filled']:,} ({100*train_stats['resp_filled']/max(1,train_stats['total_out']):.1f}%)")

    print(f"\n  Intent distribution:")
    for intent, count in sorted(train_stats["intents"].items(), key=lambda x: -x[1]):
        pct = 100 * count / train_stats["total_out"]
        print(f"    {intent:15} {count:6,} ({pct:.1f}%)")

    print(f"\n  Action tag categories (top 15):")
    for cat, count in sorted(train_stats["tag_cats"].items(), key=lambda x: -x[1])[:15]:
        print(f"    {cat:25} {count:6,}")

    # Convert eval set
    if Path(args.eval_input).exists():
        print(f"\n[EVAL] {args.eval_input} → {args.eval_output}")
        eval_stats = convert_dataset(args.eval_input, args.eval_output)
        print(f"  In: {eval_stats['total_in']:,} → Out: {eval_stats['total_out']:,}")
    else:
        print(f"\n[EVAL] {args.eval_input} not found, skipping")

    # Final size
    import os
    train_size = os.path.getsize(args.output)
    print(f"\n{'=' * 60}")
    print(f"V14 Dataset: {args.output}")
    print(f"  Size: {train_size / 1024**2:.0f} MB | Lines: {train_stats['total_out']:,}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
