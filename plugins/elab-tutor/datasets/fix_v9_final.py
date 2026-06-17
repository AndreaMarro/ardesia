#!/usr/bin/env python3
"""Final fixes: boost low action tags to >=500, fix response repetition."""
import json, random, hashlib
from pathlib import Path
from collections import Counter

random.seed(2026_03_21)
V9_PATH = Path(__file__).parent / "galileo-brain-v9.jsonl"

def load():
    with open(V9_PATH) as f: return [json.loads(l) for l in f]

def save(ds):
    random.shuffle(ds)
    with open(V9_PATH, "w") as f:
        for ex in ds: f.write(json.dumps(ex, ensure_ascii=False) + "\n")

def ctx():
    TABS = ["simulator", "editor", "canvas"]
    EXPS = ["v1-cap6-primo-circuito","v1-cap8-pulsante-led","v2-cap10-motordc-base",
            "v3-cap6-led-blink","v3-cap7-pulsante-digitale","v1-cap11-buzzer"]
    COMPS = ["led1","resistor1","push-button1","buzzer-piezo1","servo1"]
    tab = random.choice(TABS)
    exp = random.choice(EXPS)
    n = random.randint(1,4)
    comps = random.sample(COMPS, min(n, len(COMPS)))
    return (f"[CONTESTO]\ntab: {tab}\nesperimento: {exp}\ncomponenti: [{', '.join(comps)}]\n"
            f"fili: {random.randint(0,6)}\nvolume_attivo: {random.choice([1,2,3])}\n"
            f"simulazione: {random.choice(['running','stopped','paused'])}\n"
            f"build_mode: {random.choice(['sandbox','passopasso'])}\n"
            f"editor_mode: {random.choice(['scratch','arduino'])}\n"
            f"codice_presente: {'true' if random.random()>0.5 else 'false'}")

def mk(sp, msg, out_dict):
    c = ctx()
    return {"messages": [
        {"role":"system","content":sp},
        {"role":"user","content":f"{c}\n\n[MESSAGGIO]\n{msg}"},
        {"role":"assistant","content":json.dumps(out_dict, ensure_ascii=False)}
    ]}

def main():
    ds = load()
    sp = ds[0]["messages"][0]["content"]
    print(f"Loaded: {len(ds):,}")
    new = []

    # Boost undo to 500 (need ~260 more)
    undo_phrases = ["annulla","ctrl z","undo","torna indietro","annulla l'ultima azione",
                    "rifai indietro","annulla quello","un passo indietro","torna come prima",
                    "rimetti come era","annulla la modifica","ctrl+z"]
    undo_responses = ["Annullato!","Torno indietro.","Ctrl+Z! Fatto.","Annullata l'ultima azione.",
                      "Un passo indietro.","Come se non fosse successo.","Cancellata l'ultima mossa."]
    for p in undo_phrases:
        for _ in range(25):
            new.append(mk(sp, p, {"intent":"action","entities":[],"actions":["[AZIONE:undo]"],
                                   "needs_llm":False,"response":random.choice(undo_responses),"llm_hint":None}))

    # Boost redo to 500
    redo_phrases = ["rifai","ctrl y","redo","rimetti","rifai l'ultima azione",
                    "ripristina","rimetti come era","rifallo","riapplica","ctrl+y"]
    redo_responses = ["Rifatto!","Rimesso!","Ctrl+Y! Ripristinato.","Azione ripristinata.",
                      "Rimessa l'ultima azione.","Ecco, rifatto.","Redo! Fatto."]
    for p in redo_phrases:
        for _ in range(30):
            new.append(mk(sp, p, {"intent":"action","entities":[],"actions":["[AZIONE:redo]"],
                                   "needs_llm":False,"response":random.choice(redo_responses),"llm_hint":None}))

    # Boost diagnose to 500
    diag_phrases = ["diagnostica il circuito","controlla il circuito","verifica i collegamenti",
                    "analizza il circuito","testa il circuito","check il circuito",
                    "c'e' un errore?","controlla se funziona","verifica","diagnostica",
                    "cosa c'e' che non va?","controlla i fili","analizza i collegamenti"]
    diag_responses = ["Vediamo cosa non va...","Controllo il circuito!","Diagnosi in corso!",
                      "Analizzo i collegamenti...","Un attimo, verifico tutto.","Cerco il problema...",
                      "Diagnosi avviata!","Check in corso!","Ispeziono il circuito."]
    for p in diag_phrases:
        for _ in range(30):
            new.append(mk(sp, p, {"intent":"action","entities":[],"actions":["[AZIONE:diagnose]"],
                                   "needs_llm":False,"response":random.choice(diag_responses),"llm_hint":None}))

    # Boost removewire to 500
    rw_phrases = ["togli il filo","rimuovi il filo","scollega","stacca il filo",
                  "elimina il collegamento","togli il collegamento","rimuovi il cavo",
                  "disconnetti","scollega quel filo","togli quel filo",
                  "stacca il collegamento","rimuovi il wire"]
    rw_responses = ["Filo rimosso.","Scollegato.","Staccato!","Filo via.",
                    "Disconnesso.","Tolto il filo.","Collegamento rimosso.","Filo eliminato."]
    for p in rw_phrases:
        for _ in range(15):
            new.append(mk(sp, p, {"intent":"circuit","entities":["wire"],"actions":["[AZIONE:removewire]"],
                                   "needs_llm":False,"response":random.choice(rw_responses),"llm_hint":None}))

    # Boost closeeditor to 500
    ce_phrases = ["chiudi l'editor","nascondi il codice","non mi serve il codice",
                  "chiudi il pannello codice","toglielo","chiudi tutto",
                  "nascondi l'editor","basta codice","chiudi editor",
                  "togli il codice","nascondi"]
    ce_responses = ["Editor chiuso!","Nascosto.","OK, chiuso.","Pannello codice chiuso.",
                    "Fatto, codice nascosto.","Editor via!","Chiuso!"]
    for p in ce_phrases:
        for _ in range(10):
            new.append(mk(sp, p, {"intent":"action","entities":[],"actions":["[AZIONE:closeeditor]"],
                                   "needs_llm":False,"response":random.choice(ce_responses),"llm_hint":None}))

    # Boost youtube to 500
    yt_phrases = ["cercami un video","voglio un video","video tutorial","cerca su YouTube",
                  "video su questo argomento","mostrami un video","YouTube!",
                  "video per capire","hai un video?","fammi vedere un video",
                  "tutorial video","video spiegazione","filmato"]
    yt_responses = ["Cerco un video per te!","Ecco un video!","Video in arrivo!",
                    "Ti trovo un tutorial.","Video trovato!","Ecco un filmato utile.",
                    "Video pronto!","Tutorial in arrivo!","Ti mostro un video."]
    for p in yt_phrases:
        for _ in range(25):
            new.append(mk(sp, p, {"intent":"navigation","entities":[],"actions":["[AZIONE:youtube]"],
                                   "needs_llm":False,"response":random.choice(yt_responses),"llm_hint":None}))

    print(f"Added: {len(new):,} boost examples")
    ds.extend(new)

    # FIX response repetition: diversify "Scratch!" and "Arduino C++!"
    switch_scratch_resp = ["Ecco i blocchi!","Scratch attivato!","Modalita' blocchi!",
                           "Ora usi i blocchi!","Programmazione visuale attiva!",
                           "Blocchi pronti!","Editor Scratch aperto!","Scratch mode!",
                           "Ora programmi con i blocchi!","Blockly attivato!"]
    switch_arduino_resp = ["Codice C++ attivo!","Editor Arduino!","Modalita' testo!",
                           "Ora scrivi il codice!","Arduino mode!","Editor di codice aperto!",
                           "C++ pronto!","Coding mode!","Editor testuale attivo!","Testo!"]

    fixed = 0
    for ex in ds:
        try:
            out = json.loads(ex["messages"][2]["content"])
            resp = out.get("response")
            changed = False
            if resp == "Scratch!":
                out["response"] = random.choice(switch_scratch_resp)
                changed = True
            elif resp == "Arduino C++!":
                out["response"] = random.choice(switch_arduino_resp)
                changed = True
            elif resp and "{mode}" in resp:
                mode = "Scratch" if random.random() > 0.5 else "Arduino C++"
                out["response"] = resp.replace("{mode}", mode)
                changed = True
            if changed:
                ex["messages"][2]["content"] = json.dumps(out, ensure_ascii=False)
                fixed += 1
        except: pass

    print(f"Diversified: {fixed} responses")

    # Check max repetition
    rc = Counter()
    for ex in ds:
        try:
            out = json.loads(ex["messages"][2]["content"])
            r = out.get("response")
            if r: rc[r] += 1
        except: pass
    top = rc.most_common(3)
    print(f"Max repetition: {top[0][1] if top else 0}")
    for r, c in top:
        print(f"  [{c}x] {str(r)[:50]}")

    print(f"Final: {len(ds):,}")
    save(ds)

if __name__ == "__main__":
    main()
