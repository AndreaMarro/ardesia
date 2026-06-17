#!/usr/bin/env python3
"""
GALILEO BRAIN — DATASET HARD MODE (Training 3)
5000+ esempi con frasi rotte, slang, multi-step, ambigue, multilingue.
Ogni funzionalità mappata in decine di formulazioni diverse.
"""

import json, random, hashlib, re
from pathlib import Path

random.seed(2026)

SYSTEM_PROMPT = """Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor.
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
1. "intent" classifica: action (play/pause/reset), circuit (componenti/fili), code (Arduino/Scratch), tutor (teoria/spiegazioni), vision (analisi immagini), navigation (carica esperimenti/tab)
2. "entities": componenti, pin, esperimenti menzionati
3. "actions": array di [AZIONE:...] o [INTENT:{...}]
4. "needs_llm": false se deterministica, true se serve ragionamento
5. "response": risposta breve se needs_llm=false, null se true
6. "llm_hint": contesto per LLM se needs_llm=true, null se false

COMPONENTI VALIDI: led, resistor, push-button, buzzer-piezo, capacitor, potentiometer, photo-resistor, diode, mosfet-n, rgb-led, motor-dc, servo, reed-switch, phototransistor, battery9v, multimeter, lcd16x2, nano-r4-board, breadboard-half, breadboard-full, wire"""

# ============================================================
TABS = ["simulatore", "manuale", "video", "lavagna", "taccuini", "detective", "poe", "reverse", "review"]
VOLUMES = ["1", "2", "3"]
BUILD_MODES = ["montato", "passopasso", "libero"]

EXPERIMENTS = {
    "1": ["v1-cap6-primo-circuito","v1-cap6-led-rosso","v1-cap6-led-bruciato",
          "v1-cap7-rgb-base","v1-cap7-rgb-mix","v1-cap7-rgb-arcobaleno",
          "v1-cap8-pulsante-led","v1-cap8-semaforo-pulsante","v1-cap8-pulsante-doppio",
          "v1-cap9-dimmer","v1-cap9-barra-led","v1-cap9-joystick",
          "v1-cap10-ldr-base","v1-cap10-ldr-led","v1-cap10-notturno",
          "v1-cap11-buzzer","v1-cap11-allarme",
          "v1-cap12-reed-base","v1-cap12-reed-allarme"],
    "2": ["v2-cap6-led-avanzato","v2-cap6-led-parallelo",
          "v2-cap7-condensatore-base","v2-cap7-rc-timer",
          "v2-cap8-mosfet-base","v2-cap8-mosfet-motore",
          "v2-cap9-fototransistor","v2-cap9-inseguitore",
          "v2-cap10-motordc-base","v2-cap10-motordc-pwm"],
    "3": ["v3-cap6-led-blink","v3-cap6-led-fade","v3-cap6-sos-morse",
          "v3-cap6-semaforo-auto","v3-cap6-knight-rider",
          "v3-cap7-pulsante-digitale","v3-cap7-debounce","v3-cap7-toggle",
          "v3-cap8-analog-read","v3-cap8-servo-pot","v3-cap8-termometro"],
}

COMPONENTS = ["led","resistor","push-button","buzzer-piezo","capacitor",
              "potentiometer","photo-resistor","diode","mosfet-n",
              "rgb-led","motor-dc","servo","reed-switch","phototransistor","battery9v"]

COMP_SLANG = {
    "led": ["led","LED","lucina","lucetta","lampadina","luce","diodo luminoso","ledino","la lucina","il led","leddone","ledd","lucettina","il leddo"],
    "resistor": ["resistenza","resistore","res","la resistenza","resistore da 220","ohm","quella che limita","impedenza","R"],
    "push-button": ["pulsante","bottone","tasto","switch","il bottone","pulsantino","btn","il tastino","interruttore","button"],
    "buzzer-piezo": ["buzzer","cicalino","speaker","suonatore","coso che suona","beep","altoparlante","il beep","piezo","cicalina"],
    "capacitor": ["condensatore","capacitore","cap","il condensatore","capacitor","il cap"],
    "potentiometer": ["potenziometro","pot","manopola","la rotella","dimmer","il coso che giri","knob","il pot","trimmer"],
    "photo-resistor": ["fotoresistore","fotoresistenza","ldr","sensore di luce","il coso della luce","resistenza luminosa","light sensor"],
    "diode": ["diodo","il diodo","diodo normale","1N4007"],
    "mosfet-n": ["mosfet","transistor","il mosfet","interruttore elettronico","mos-fet","transistore","fet"],
    "rgb-led": ["led rgb","rgb","led colorato","led tricolore","il led che cambia colore","lucina rgb","led arcobaleno"],
    "motor-dc": ["motore","motorino","motor dc","motore dc","motorino elettrico","il motore","motoretto"],
    "servo": ["servo","servomotore","servo motore","il braccetto","motorino di precisione","servetto"],
    "reed-switch": ["reed switch","reed","interruttore magnetico","sensore magnetico","il coso del magnete","reed-switch"],
    "phototransistor": ["fototransistor","sensore ottico","il transistor della luce","fototr"],
    "battery9v": ["batteria","pila","batteria 9v","la 9 volt","alimentazione","la pila"],
}

# ============================================================
# CORRUTTORI DI TESTO
# ============================================================
def typo_swap(t):
    c=list(t)
    if len(c)>3:i=random.randint(1,len(c)-2);c[i],c[i-1]=c[i-1],c[i]
    return "".join(c)

def typo_drop(t):
    c=list(t)
    if len(c)>4:c.pop(random.randint(1,len(c)-2))
    return "".join(c)

def typo_double(t):
    c=list(t)
    if len(c)>3:i=random.randint(0,len(c)-1);c.insert(i,c[i])
    return "".join(c)

def sms_style(t):
    R={"che ":"ke ","per ":"x ","perché":"xke","non ":"nn ","cosa ":"kosa ","come ":"cm ",
       "questo":"qst","anche":"anke","voglio":"vojo","sono":"sn","quando":"qnd",
       "con ":"cn ","molto":"mlt","più":"piu","comunque":"cmq","fammi":"fmmi",
       "dove":"dv","quanto":"qnt","qualcosa":"qlcs","vorrei":"vorei"}
    for o,n in R.items():
        if random.random()<0.5: t=t.replace(o,n)
    return t

def caps_random(t):
    m=random.choice(["up","rand","low"])
    if m=="up":return t.upper()
    if m=="rand":return "".join(c.upper() if random.random()<0.3 else c for c in t)
    return t.lower()

def add_filler(t):
    F=["tipo","cioè","praticamente","boh","eh","insomma","vabbe","ok allora","senti","ma","dai","ecco","niente"]
    f=random.choice(F)
    p=random.choice(["s","e","b"])
    if p=="s":return f"{f} {t}"
    if p=="e":return f"{t} {f}"
    return f"{random.choice(F)} {t} {random.choice(F)}"

def corrupt(text, level):
    if level==0: return text
    fns=[typo_swap,typo_drop,typo_double,sms_style,caps_random,add_filler]
    n=min(level,len(fns))
    for fn in random.sample(fns, k=n):
        text=fn(text)
    return text

# ============================================================
# GENERATORE
# ============================================================
examples = []

def gen_ctx():
    v=random.choice(VOLUMES)
    tab=random.choice(TABS)
    exp=random.choice(EXPERIMENTS[v]) if random.random()<0.7 else None
    cs=random.sample(COMPONENTS,k=random.randint(0,5))
    cl=[f"{c}{i+1}" for i,c in enumerate(cs)]
    L=[f"[CONTESTO]",f"tab: {tab}"]
    if exp: L.append(f"esperimento: {exp}")
    L.append(f"volume_attivo: {v}")
    if cl: L.append(f"componenti: [{', '.join(cl)}]"); L.append(f"fili: {random.randint(0,len(cl)*2)}")
    if random.random()<0.3: L.append(f"costruzione: {random.choice(BUILD_MODES)}")
    if random.random()<0.2: L.append(f"simulazione: {'▶ In esecuzione' if random.random()<0.5 else '⏸ In pausa'}")
    return "\n".join(L)

def add_ex(msg, intent, entities, actions, needs_llm, response, llm_hint):
    ctx=gen_ctx()
    full=f"{ctx}\n\n[MESSAGGIO]\n{msg}"
    assistant=json.dumps({"intent":intent,"entities":entities,"actions":actions,
        "needs_llm":needs_llm,"response":response,"llm_hint":llm_hint},ensure_ascii=False)
    examples.append({"messages":[
        {"role":"system","content":SYSTEM_PROMPT},
        {"role":"user","content":full},
        {"role":"assistant","content":assistant},
    ]})

def gen_variants(base_phrases, n_target, intent, entities, actions, needs_llm, resp, hint):
    """Genera n_target varianti da una lista di frasi base con corruzione crescente."""
    generated = 0
    while generated < n_target:
        phrase = random.choice(base_phrases)
        level = random.randint(0, 4)
        msg = corrupt(phrase, level)
        add_ex(msg, intent, entities, actions, needs_llm, resp, hint)
        generated += 1

# ============================================================
# CATEGORIA 1: PLAY (150 varianti)
# ============================================================
PLAY = [
    "avvia la simulazione","fallo partire","play","vai","go","start",
    "fai partire","avvia","mandalo","fallo andare","premi play",
    "accendi tutto","inizia","comincia","parti","run","esegui",
    "fallo funzionare","attiva il circuito","metti in moto",
    "prova a farlo andare","vediamo se funziona","ok prova",
    "dai che proviamo","fai girare","simula","simulazione on","attiva",
    "come lo accendo?","come si fa partire sto coso",
    "il bottone verde dove sta","e adesso che faccio per farlo andare",
    "vorrei vedere se funziona il circuito","fammi vedere se funziona",
    "prova il circuito","test","testing","fallo partireee","avviaaaa",
    "gooo","plai","pley","vai vaiii","starta","fal partire","acendi",
    "non so come si fa ma vorrei avviare","si può far partire questo?",
    "ma come cavolo si avvia","eh si dai facciamolo partire",
    "lancio","lancia","manda in esecuzione","esecuzione",
]
gen_variants(PLAY, 150, "action", [], ["[AZIONE:play]"], False, "Simulazione avviata.", None)

# CATEGORIA 2: PAUSE (100)
PAUSE = [
    "pausa","stop","ferma","fermalo","basta","pause","fermo","stoppa",
    "stoppalo","fermati","alt","aspetta","metti in pausa","blocca","hold",
    "non andare più","fallo fermare","sospendi","ok basta così",
    "fermalo un attimo","wait","stooop","pausaaa","frma","fermlo",
    "bastaaaa","ok stop dai","come lo fermo","dove si spegne",
    "stop stop stop","non voglio che continui","eh basta","halt",
    "stap","sttop","pauzza","freeza","congela",
]
gen_variants(PAUSE, 100, "action", [], ["[AZIONE:pause]"], False, "Simulazione in pausa.", None)

# CATEGORIA 3: RESET (80)
RESET = [
    "reset","ricomincia","da capo","resetta","riavvia","ricomincia tutto",
    "reboot","restart","torna all'inizio","ripristina","rimetti come prima",
    "stato iniziale","torna come era","rifai tutto","azzera",
    "come torno all'inizio","si può ricominciare?","resettta","da kapoo",
    "rikominca","resett","resset","rset","da zero",
]
gen_variants(RESET, 80, "action", [], ["[AZIONE:reset]"], False, "Circuito resettato.", None)

# CATEGORIA 4: CLEARALL (80)
CLEARALL = [
    "pulisci tutto","cancella tutto","svuota","clearall","clear all",
    "togli tutto","rimuovi tutto","elimina tutto","leva tutti i componenti",
    "via tutto","ricomincia da zero","tabula rasa","clean","sgombra la breadboard",
    "breadboard vuota","voglio la breadboard pulita","come tolgo tutti i pezzi",
    "non voglio più niente sulla scheda","levami tutto sto casino",
    "pulisci tt","via ttt","clear","clr","togli tutto sto bordello",
    "leva sta roba","pulisc","togli ttt","rimuov tt","eliminaaa",
]
gen_variants(CLEARALL, 80, "action", [], ["[AZIONE:clearall]"], False, "Breadboard svuotata.", None)

# CATEGORIA 5: UNDO/REDO (60)
UNDO = [
    "annulla","undo","ctrl z","torna indietro","ho sbagliato annulla",
    "ops annulla","no no torna come prima","aaah undo","indietro",
    "cancella l'ultima cosa","torna al passo prima","annulla ultima azione",
    "undoo","anulla","annull","ctrl+z","cmd z","annulla annulla",
]
gen_variants(UNDO, 40, "action", [], ["[AZIONE:undo]"], False, "Annullo l'ultima azione.", None)

REDO = [
    "rifai","redo","ctrl y","avanti","rimetti","ripristina l'azione",
    "ridai","rifo","ctrl+y","cmd shift z",
]
gen_variants(REDO, 20, "action", [], ["[AZIONE:redo]"], False, "Ripristino l'azione.", None)

# CATEGORIA 6: SINGOLO COMPONENTE (300 — 20 per tipo)
ADD_VERBS = ["metti","aggiungi","piazza","posiziona","inserisci","mettimi",
    "mettici","dammi","servimi","fammi avere","ho bisogno di","mi serve",
    "vorrei","puoi mettere","sarebbe possibile avere","ci vuole",
    "mettmi","agiungi","piaza","damme","servme","voglio",
    "ci metti","potresti piazzare","per favore metti",
    "quella cosa che","il coso","quel pezzo","come si mette"]

for comp, slangs in COMP_SLANG.items():
    for _ in range(20):
        verb = random.choice(ADD_VERBS)
        name = random.choice(slangs)
        templates = [
            f"{verb} un {name}", f"{verb} {name} sulla breadboard",
            f"{name}", f"mi serve un {name}", f"voglio un {name}",
            f"ci metti un {name}?", f"un {name} lo puoi mettere?",
            f"ho bisogno di {name}", f"per favore {verb} {name}",
            f"{verb} {name} qui", f"dammi {name}",
        ]
        phrase = random.choice(templates)
        level = random.randint(0, 4)
        intent_j = json.dumps({"action":"place_and_wire","components":[{"type":comp}],"wires":"auto"},ensure_ascii=False)
        add_ex(corrupt(phrase, level), "circuit", [comp],
            [f'[INTENT:{intent_j}]'], False, f"Posiziono {comp}.", None)

# CATEGORIA 7: MULTI-COMPONENTE (400)
for _ in range(400):
    n = random.randint(2, 5)
    chosen = random.sample(COMPONENTS, k=min(n, len(COMPONENTS)))
    slangs = [random.choice(COMP_SLANG.get(c, [c])) for c in chosen]

    if len(chosen) == 2:
        t = random.choice([
            f"metti un {slangs[0]} e un {slangs[1]}",
            f"aggiungi {slangs[0]} con {slangs[1]}",
            f"mi servono {slangs[0]} e {slangs[1]}",
            f"{slangs[0]} e {slangs[1]}",
            f"voglio {slangs[0]} + {slangs[1]}",
            f"piazza {slangs[0]} poi {slangs[1]}",
            f"mettimi {slangs[0]} vicino a {slangs[1]}",
            f"{slangs[0]} insieme a {slangs[1]}",
            f"prima {slangs[0]} poi {slangs[1]}",
        ])
    elif len(chosen) == 3:
        t = random.choice([
            f"metti {slangs[0]}, {slangs[1]} e {slangs[2]}",
            f"aggiungi {slangs[0]} {slangs[1]} {slangs[2]}",
            f"voglio {slangs[0]} con {slangs[1]} e {slangs[2]}",
            f"costruisci: {slangs[0]}, {slangs[1]}, {slangs[2]}",
            f"{slangs[0]} + {slangs[1]} + {slangs[2]}",
            f"servono {slangs[0]} {slangs[1]} e {slangs[2]}",
        ])
    else:
        t = "metti " + ", ".join(slangs[:-1]) + f" e {slangs[-1]}"

    intent_j = json.dumps({"action":"place_and_wire","components":[{"type":c} for c in chosen],"wires":"auto"},ensure_ascii=False)
    add_ex(corrupt(t, random.randint(0,4)), "circuit", chosen,
        [f'[INTENT:{intent_j}]'], False, f"Posiziono {len(chosen)} componenti.", None)

# CATEGORIA 8: QUANTITÀ SPECIFICHE (100)
for _ in range(100):
    comp = random.choice(COMPONENTS[:8])  # componenti comuni
    name = random.choice(COMP_SLANG[comp])
    qty = random.randint(2, 6)
    templates = [
        f"voglio {qty} {name}", f"metti {qty} {name}",
        f"aggiungi {qty} {name} sulla breadboard",
        f"mi servono {qty} {name}", f"{qty} {name} per favore",
        f"ho bisogno di {qty} {name}", f"piazza {qty} {name}",
        f"dammi {qty} {name}", f"{qty}x {name}",
        f"ne voglio {qty} di {name}",
    ]
    phrase = random.choice(templates)
    comps = [{"type": comp} for _ in range(qty)]
    intent_j = json.dumps({"action":"place_and_wire","components":comps,"wires":"auto"},ensure_ascii=False)
    add_ex(corrupt(phrase, random.randint(0,3)), "circuit", [comp],
        [f'[INTENT:{intent_j}]'], False, f"Posiziono {qty} {comp}.", None)

# CATEGORIA 9: NAVIGAZIONE ESPERIMENTI (250)
for vol, exps in EXPERIMENTS.items():
    for exp in exps:
        exp_name = exp.split("-", 2)[-1].replace("-", " ")
        phrases = [
            f"carica l'esperimento {exp_name}", f"apri {exp_name}",
            f"voglio fare {exp_name}", f"mostrami {exp_name}",
            f"carica {exp}", f"portami a {exp_name}",
            f"esperimento {exp_name}", f"fai vedere {exp_name}",
            f"apri l'esp {exp_name}", f"caricami {exp_name}",
        ]
        for phrase in random.sample(phrases, min(5, len(phrases))):
            add_ex(corrupt(phrase, random.randint(0,3)), "navigation", [exp],
                [f"[AZIONE:loadexp:{exp}]"], False, f"Carico {exp}.", None)

# CATEGORIA 10: NAVIGAZIONE TAB (120)
TAB_SLANG = {
    "simulatore":["simulatore","il simulatore","torna al simulatore","la scheda","circuiti","il sim"],
    "manuale":["manuale","il libro","il pdf","apri il manuale","il testo","manule"],
    "video":["video","youtube","filmati","tutorial video","i video","filmato"],
    "lavagna":["lavagna","disegno","canvas","la lavagna","voglio disegnare","disegnamo"],
    "taccuini":["taccuini","appunti","notebook","i miei appunti","note","notes"],
    "detective":["detective","gioco detective","trova l'errore","bug hunt","detectiv"],
    "poe":["poe","predict observe explain","prevedi osserva spiega","p.o.e."],
    "reverse":["reverse engineering","reverse","ingegneria inversa","reversee"],
    "review":["review","ripasso","revisione","controlla circuito","riviu"],
}

for tab, names in TAB_SLANG.items():
    for name in names:
        for v in ["apri","vai a","mostrami","portami su","cambia tab","switch a","apri il"]:
            phrase = f"{v} {name}"
            add_ex(corrupt(phrase, random.randint(0,3)), "navigation", [tab],
                [f"[AZIONE:opentab:{tab}]"], False, f"Apro {tab}.", None)

# CATEGORIA 11: NAVIGAZIONE VOLUMI (40)
for vol in VOLUMES:
    phrases = [f"apri il volume {vol}",f"vai al volume {vol}",f"carica volume {vol}",
               f"mostrami il libro {vol}",f"portami al vol {vol}",f"volume {vol}",
               f"vol {vol}",f"libro {vol}",f"cambia al volume {vol}",f"v{vol}"]
    for p in phrases:
        add_ex(corrupt(p, random.randint(0,3)), "navigation", [f"volume_{vol}"],
            [f"[AZIONE:openvolume:{vol}:1]"], False, f"Apro Volume {vol}.", None)

# CATEGORIA 12: COMPILA (100)
COMPILE = [
    "compila","compila il codice","compile","fai la compilazione",
    "prova a compilare","build","verifica il codice","manda il codice",
    "controlla se il codice è giusto","upload","carica il programma",
    "come si fa a far funzionare il programma","il codice è pronto?",
    "compilaaaa","compla","bilda","builda","kompila","comp",
    "fai il build","make","verifica","controlla il programma",
    "invia alla scheda","manda alla scheda","programma la scheda",
]
gen_variants(COMPILE, 100, "code", [], ["[AZIONE:compile]"], False, "Compilo il codice.", None)

# CATEGORIA 13: EDITOR (80)
EDITOR = [
    "apri l'editor","mostrami il codice","vedi il codice",
    "fammi vedere il programma","editor","apri il pannello codice",
    "voglio scrivere codice","apri la finestra del codice",
    "dove scrivo il programma","come apro il codice",
    "si può vedere il codice arduino?","apri editore","code",
    "mostrami cod","codice","fai vedere il codice","pannello codice",
]
gen_variants(EDITOR, 80, "code", [], ["[AZIONE:openeditor]"], False, "Apro l'editor.", None)

# CATEGORIA 14: SCRATCH (80)
SCRATCH = [
    "apri scratch","blocchi","programma a blocchi","blockly",
    "voglio usare scratch","modalità blocchi","switch a scratch",
    "cambia a blocchi","visual programming","quello con i pezzi colorati",
    "il programma tipo puzzle","drag and drop codice",
    "senza scrivere codice con i blocchetti","scratch plz",
    "aprimi i blocchi","blocchetti","skratch","bloki","blockli",
    "programma visuale","i mattoncini","lego del codice",
]
gen_variants(SCRATCH, 80, "code", [],
    ["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"], False, "Apro Scratch.", None)

# CATEGORIA 15: ARDUINO MODE (50)
ARDUINO = [
    "torna ad arduino","modalità codice","scrivi in c++","switch a arduino",
    "voglio scrivere in c","testo normale","codice scritto",
    "non blocchi codice vero","voglio scrivere il programma a mano",
    "basta blocchi voglio il codice","codice testuale","arduino",
    "c++","cpp","text mode","editor testuale",
]
gen_variants(ARDUINO, 50, "code", [],
    ["[AZIONE:openeditor]","[AZIONE:switcheditor:arduino]"], False, "Editor Arduino C++.", None)

# CATEGORIA 16: TUTOR — domande teoria (300)
TUTOR_QS = [
    "cos'è un LED?","come funziona una resistenza?","spiegami la legge di ohm",
    "a cosa serve un condensatore?","cos'è un transistor?","come funziona un motore DC?",
    "spiegami i circuiti in serie","e quelli in parallelo?","cos'è la corrente elettrica?",
    "cos'è il voltaggio?","cosa sono gli ampere?","cos'è un cortocircuito?",
    "perché si mette la resistenza col LED?","che differenza c'è tra AC e DC?",
    "come funziona Arduino?","cos'è il PWM?","spiegami il debounce",
    "cos'è un pin digitale?","differenza tra analogico e digitale?",
    "come si legge uno schema elettrico?","non capisco niente aiutami",
    "sono proprio negato spiegami le basi","come funziona sta roba?",
    "non ho mai fatto elettronica","prof non ho capito niente",
    "mi sento perso da dove comincio?","il led ha il + e il -?",
    "xke la resistenza nn ha polarità?","se metto il led al contrario esplode?",
    "l'elettricità fa male?","posso toccare i fili?",
    "senza la resistenza il led si brucia?","kosa è un elleidi",
    "cm funziona 1 rezistenza","spiegami la lege di om",
    "il kondensatore a ke serve","mosfet ke roba è",
    "il potenzometro nn capisco","riassunto elettronica base",
    "panoramica dei componenti","quali sono i componenti principali",
    "differenze tra tutti i sensori","cos'è la breadboard?",
    "a cosa servono i fili?","come si collegano i componenti?",
    "cos'è il GND?","cos'è il VCC?","cos'è un pin analogico?",
    "come si misura la corrente?","cos'è la potenza?","watt cosa sono?",
    "cos'è un circuito aperto?","e uno chiuso?","come funziona un buzzer?",
    "cos'è la frequenza?","hertz cosa sono?","cos'è un servo?",
    "come funziona il fotoresistore?","cos'è un reed switch?",
    "a cosa serve il diodo?","cos'è la polarità?",
    "positivo e negativo cosa significano?","cos'è la massa?",
    "cos'è un microcontrollore?","differenza tra arduino e raspberry?",
]
for q in TUTOR_QS:
    for _ in range(5):
        add_ex(corrupt(q, random.randint(0,4)), "tutor", [],
            [], True, None, f"Domanda teoria: '{q}'")

# CATEGORIA 17: VISION (100)
VISION = [
    "guarda il mio circuito","analizza il circuito","cosa vedi?",
    "controlla se è giusto","il circuito è corretto?","dimmi se ci sono errori",
    "guarda questa foto","analizza l'immagine","vedi qualcosa di sbagliato?",
    "check visivo","puoi vedere quello che ho fatto?","guarda un po' qui",
    "controlla sto coso","secondo te va bene?","fammi un check",
    "vedi se ho sbagliato qualcosa","guarda qua","dai un occhio",
    "occhio al circuito","look","vedi vedi","controlla plz",
    "guarda e dimmi cosa manca","analizza e correggi",
    "controlla il circuito e aggiusta","foto del circuito",
]
gen_variants(VISION, 100, "vision", [], [], True, None, "Analisi visiva del circuito.")

# CATEGORIA 18: DIAGNOSI (100)
DIAG = [
    "non funziona","cosa c'è che non va","perché non va",
    "il circuito è sbagliato","trova l'errore","diagnosi",
    "c'è un problema","help non funziona niente","è rotto?",
    "qualcosa non torna","errore nel circuito",
    "boh non va e non so perché","ho collegato tutto ma non succede niente",
    "il led non si accende perché?","aiuto è tutto spento",
    "ho fatto come dice il libro ma non va","nn funzia","nn va",
    "aiutooo","rotto!!","ke schifo nn va niente","perkeee",
    "ho provato mille volte ma non funziona","uffa non va mai",
    "ma è impossibile fare sta roba","argh non funziona!!",
    "diagnostica","debug","find bug","errore",
]
gen_variants(DIAG, 100, "circuit", [], ["[AZIONE:diagnose]"], False, "Avvio diagnosi.", None)

# CATEGORIA 19: QUIZ (60)
QUIZ = [
    "quiz","fammi il quiz","verificami","testami",
    "domande sull'esperimento","voglio fare il test",
    "prova di verifica","interrogami","c'è un test?",
    "verifica di comprensione","autovalutazione",
    "quizzami","fai quiz","quizzz","test plz",
    "interrogazione dai","prova se ho capito",
    "domandami","esame","verifica",
]
gen_variants(QUIZ, 60, "action", [], ["[AZIONE:quiz]"], False, "Lancio il quiz.", None)

# CATEGORIA 20: YOUTUBE (60)
TOPICS = ["LED","Arduino","resistenze","circuiti","breadboard","elettronica",
          "legge di Ohm","PWM","servo motore","buzzer","condensatore","motore DC"]
for _ in range(60):
    topic = random.choice(TOPICS)
    templates = [
        f"cerca un video su {topic}",f"video di {topic}",
        f"youtube {topic}",f"tutorial video {topic}",
        f"mostrami un video su {topic}",f"filmato su {topic}",
        f"cerca su youtube {topic}",f"video {topic} plz",
    ]
    phrase = random.choice(templates)
    add_ex(corrupt(phrase, random.randint(0,3)), "action", [],
        [f"[AZIONE:youtube:{topic}]"], False, f"Cerco video su {topic}.", None)

# CATEGORIA 21: MISURA (50)
MEASURE = [
    "misura la tensione","quanta corrente passa?","misura il componente",
    "voltaggio?","amperaggio?","quanti volt ci sono?","misura ohm",
    "come faccio a sapere quanta corrente c'è","si può misurare qualcosa?",
    "misura il led","misura la resistenza","quanti ohm?",
    "tensione sul circuito","corrente totale",
]
gen_variants(MEASURE, 50, "circuit", [], ["[AZIONE:measure:led1]"], False, "Misuro.", None)

# CATEGORIA 22: INTERAZIONE COMPONENTI (100)
INTERACT = [
    ("premi il pulsante","action",["push-button"],["[AZIONE:interact:btn1:press:1]"],False,"Premo il pulsante.",None),
    ("rilascia il bottone","action",["push-button"],["[AZIONE:interact:btn1:release:0]"],False,"Rilascio.",None),
    ("gira il potenziometro al 50%","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:50]"],False,"Pot al 50%.",None),
    ("potenziometro tutto a destra","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:100]"],False,"Pot al max.",None),
    ("potenziometro tutto a sinistra","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:0]"],False,"Pot al min.",None),
    ("metti la resistenza a 330 ohm","action",["resistor"],["[AZIONE:setvalue:r1:resistance:330]"],False,"R=330Ω.",None),
    ("imposta la luce al massimo","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:100]"],False,"Luce 100%.",None),
    ("abbassa la luce","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:20]"],False,"Luce 20%.",None),
    ("ruota il servo a 90 gradi","action",["servo"],["[AZIONE:interact:servo1:setAngle:90]"],False,"Servo 90°.",None),
    ("gira la manopola","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:50]"],False,"Pot al 50%.",None),
    ("schiaccia il coso","action",["push-button"],["[AZIONE:interact:btn1:press:1]"],False,"Premo.",None),
    ("fai buio","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:0]"],False,"Buio totale.",None),
    ("accendi la luce del sensore","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:100]"],False,"Luce 100%.",None),
    ("resistenza a 1000 ohm","action",["resistor"],["[AZIONE:setvalue:r1:resistance:1000]"],False,"R=1kΩ.",None),
    ("servo a 180","action",["servo"],["[AZIONE:interact:servo1:setAngle:180]"],False,"Servo 180°.",None),
    ("servo a zero","action",["servo"],["[AZIONE:interact:servo1:setAngle:0]"],False,"Servo 0°.",None),
]
for item in INTERACT:
    for _ in range(6):
        add_ex(corrupt(item[0], random.randint(0,4)), item[1], item[2], item[3], item[4], item[5], item[6])

# CATEGORIA 23: BUILD MODE (60)
BUILDMODE = [
    ("metti in modalità già montato","montato"),
    ("mostrami il circuito completo","montato"),
    ("voglio vederlo montato","montato"),
    ("skip alla fine mostrami tutto","montato"),
    ("non voglio costruire fammi vedere il risultato","montato"),
    ("già montato","montato"),
    ("modalità passo passo","passopasso"),
    ("guidami passo per passo","passopasso"),
    ("costruzione guidata","passopasso"),
    ("step by step","passopasso"),
    ("passo dopo passo","passopasso"),
    ("modalità libera","libero"),
    ("esplora libero","libero"),
    ("voglio costruire da solo","libero"),
    ("freestyle","libero"),
    ("sandbox","libero"),
    ("modalità sandbox","libero"),
]
for phrase, mode in BUILDMODE:
    for _ in range(4):
        add_ex(corrupt(phrase, random.randint(0,3)), "action", [],
            [f"[AZIONE:setbuildmode:{mode}]"], False, f"Modalità {mode}.", None)

# CATEGORIA 24: STEP NAVIGATION (50)
NEXT = ["prossimo passo","avanti","next","step successivo","vai avanti",
        "continua","prossimo","avanti col passo passo","e adesso?",
        "next step","go ahead","prosegui","ancora","un altro passo"]
PREV = ["passo precedente","indietro","previous","torna indietro di un passo",
        "back","prima","un passo indietro"]
gen_variants(NEXT, 35, "action", [], ["[AZIONE:nextstep]"], False, "Prossimo passo.", None)
gen_variants(PREV, 15, "action", [], ["[AZIONE:prevstep]"], False, "Passo precedente.", None)

# CATEGORIA 25: SERIAL MONITOR (40)
SERIAL = [
    "apri il monitor seriale","serial monitor","mostrami la seriale",
    "voglio vedere l'output","apri la console","dove vedo i dati",
    "output seriale","console","terminale","serial",
]
gen_variants(SERIAL, 40, "action", [], ["[AZIONE:showserial]"], False, "Apro serial monitor.", None)

# CATEGORIA 26: BOM (30)
BOM = [
    "lista componenti","BOM","bill of materials","cosa mi serve",
    "quali pezzi mi servono","elenco materiali","lista della spesa",
    "componenti necessari","che materiale serve","elenco pezzi",
]
gen_variants(BOM, 30, "action", [], ["[AZIONE:showbom]"], False, "Lista componenti.", None)

# CATEGORIA 27: HIGHLIGHT (30)
HIGHLIGHT = [
    "evidenzia il LED","mostrami dov'è la resistenza","highlight led1",
    "illumina il componente","fammi vedere dove sta il buzzer",
    "indica il pulsante","dov'è il LED?","trova la resistenza",
    "segnami il componente","mostra dove",
]
gen_variants(HIGHLIGHT, 30, "action", ["led"], ["[AZIONE:highlight:led1]"], False, "Evidenzio.", None)

# CATEGORIA 28: GETSTATE / LISTCOMPONENTS (30)
STATE = ["stato del circuito","stato attuale","cosa c'è sulla breadboard",
         "elenca tutto","dimmi cosa ho","riepilogo","lista piazzati"]
gen_variants(STATE, 15, "action", [], ["[AZIONE:getstate]"], False, "Stato circuito.", None)
gen_variants(["quali componenti ci sono?","cosa ho messo?","elenco piazzati",
    "lista di quello che c'è","componenti sulla breadboard"],
    15, "action", [], ["[AZIONE:listcomponents]"], False, "Elenco componenti.", None)

# CATEGORIA 29: NOTEBOOK (20)
NOTEBOOK = ["crea un taccuino","nuovo notebook","crea appunti",
            "fammi un taccuino","voglio prendere appunti","note","nuovi appunti"]
gen_variants(NOTEBOOK, 20, "action", [], ["[AZIONE:createnotebook:Lezione]"], False, "Creo taccuino.", None)

# CATEGORIA 30: RESET CODE (20)
RESETCODE = ["rimetti il codice originale","codice di default","resetta il programma",
             "torna al codice iniziale","codice dell'esperimento","ripristina codice"]
gen_variants(RESETCODE, 20, "code", [], ["[AZIONE:resetcode]"], False, "Codice originale.", None)

# CATEGORIA 31: GIOCHI (40)
for _ in range(8):
    add_ex(corrupt("gioca a detective", random.randint(0,3)), "navigation", ["detective"],
        ["[AZIONE:opentab:detective]"], False, "Apro Detective.", None)
    add_ex(corrupt("reverse engineering", random.randint(0,3)), "navigation", ["reverse"],
        ["[AZIONE:opentab:reverse]"], False, "Apro Reverse Engineering.", None)
    add_ex(corrupt("fammi il POE", random.randint(0,3)), "navigation", ["poe"],
        ["[AZIONE:opentab:poe]"], False, "Apro POE.", None)
    add_ex(corrupt("controlla circuito review", random.randint(0,3)), "navigation", ["review"],
        ["[AZIONE:opentab:review]"], False, "Apro Review.", None)
    add_ex(corrupt("trova il guasto nel circuito", random.randint(0,3)), "navigation", ["detective"],
        ["[AZIONE:opentab:detective]"], False, "Apro Detective.", None)

# ============================================================
# CATEGORIA 32-40: MULTI-STEP COMPLESSI (500+)
# ============================================================

MULTISTEP = [
    # Build + Code + Run (50)
    (["costruisci LED e resistenza scrivi il blink e avvia",
      "metti led e resistenza programma il lampeggio e play",
      "fammi tutto: monta LED resistenza codice blink avvia",
      "LED + resistenza + codice lampeggio + vai",
      "voglio far lampeggiare una lucina fai tutto tu",
      "costruiscimi il lampeggio e fallo partire",
      "fammi il circuito blink completo",
      "led resistenza blink play tutto insieme",
      "fai il circuito del blink dall'inizio alla fine",
      "metti il led scrivi il codice e avvialo",],
     "circuit",["led","resistor"],
     ['[INTENT:{"action":"place_and_wire","components":[{"type":"led"},{"type":"resistor"}],"wires":"auto"}]',
      "[AZIONE:setcode:void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);delay(1000);digitalWrite(13,LOW);delay(1000);}]",
      "[AZIONE:compile]","[AZIONE:play]"],
     False,"Costruisco LED+resistenza, blink, compilo e avvio.",None),

    # Clear + Load + Passo Passo (50)
    (["pulisci tutto carica il primo circuito passo passo",
      "ricomincia da zero apri primo esperimento guidato",
      "clearall poi carica v1-cap6-primo-circuito step by step",
      "svuota breadboard primo esercizio passo per passo",
      "voglio rifare il primo esperimento dall'inizio guidato",
      "via tutto e fammi fare il primo circuito step by step",
      "azzera e carica l'esperimento base guidato",
      "pulisci e iniziamo il primo passo passo",
      "reset totale poi primo circuito modalità guidata",
      "da capo col primo esperimento costruzione guidata",],
     "navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:clearall]","[AZIONE:loadexp:v1-cap6-primo-circuito]","[AZIONE:setbuildmode:passopasso]"],
     False,"Pulisco, carico primo circuito passo passo.",None),

    # Compile + Play (50)
    (["compila e avvia","compile and run","compila poi fai partire",
      "verifica il codice e mandalo","build e play",
      "controlla il programma e avvialo","compilazione + avvio",
      "compila e fai girare","build run","make e go",
      "programma e avvia","verifica e start",],
     "code",[],["[AZIONE:compile]","[AZIONE:play]"],
     False,"Compilo e avvio.",None),

    # Open Scratch + Compile + Play (40)
    (["apri scratch compila e avvia",
      "blocchi poi compila e play",
      "modalità scratch compilazione e avvio",
      "scratch compile run",
      "voglio programmare a blocchi e far andare",
      "apri i blocchetti compila e fai partire",],
     "code",[],
     ["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]","[AZIONE:compile]","[AZIONE:play]"],
     False,"Scratch, compilo e avvio.",None),

    # Load + Quiz (40)
    (["carica il dimmer e fammi il quiz",
      "apri l'esperimento del potenziometro e interrogami",
      "vai al dimmer e poi verificami",
      "carica esperimento dimmer + quiz",
      "voglio fare il test sul dimmer",
      "dimmer poi quiz subito",],
     "navigation",["v1-cap9-dimmer"],
     ["[AZIONE:loadexp:v1-cap9-dimmer]","[AZIONE:quiz]"],
     False,"Carico dimmer e quiz.",None),

    # Diagnose + Play (40)
    (["controlla il circuito e poi provalo",
      "diagnostica e avvia","diagnosi poi play",
      "trova errori e fai partire",
      "verifica il circuito e mandalo",
      "check circuito e start",],
     "circuit",[],["[AZIONE:diagnose]","[AZIONE:play]"],
     False,"Diagnostico e avvio.",None),

    # Semaforo complesso (30)
    (["costruisci il semaforo con 3 LED buzzer e pulsante",
      "semaforo completo: rosso giallo verde suono bottone",
      "metti 3 led rosso giallo verde con buzzer e pulsante",
      "voglio fare il semaforo tipo quello della strada con suono e bottone pedone",
      "facciamo il semaforo bello con luci suono e bottone",],
     "circuit",["led","buzzer-piezo","push-button","resistor"],
     ['[INTENT:{"action":"place_and_wire","components":[{"type":"led","color":"red"},{"type":"led","color":"yellow"},{"type":"led","color":"green"},{"type":"buzzer-piezo"},{"type":"push-button"},{"type":"resistor"},{"type":"resistor"},{"type":"resistor"}],"wires":"auto"}]'],
     True,None,"Semaforo complesso multi-componente con code."),

    # Clearall + Build da zero (40)
    (["pulisci tutto e metti un motore con un potenziometro",
      "svuota e costruisci motore + pot",
      "via tutto poi metti motorino e manopola",
      "reset e fammi il circuito del motore controllato dal pot",
      "clearall poi motore con potenziometro",],
     "circuit",["motor-dc","potentiometer"],
     ["[AZIONE:clearall]",'[INTENT:{"action":"place_and_wire","components":[{"type":"motor-dc"},{"type":"potentiometer"}],"wires":"auto"}]'],
     False,"Pulisco e monto motore+potenziometro.",None),
]

for phrases, intent, entities, actions, needs_llm, resp, hint in MULTISTEP:
    for phrase in phrases:
        for _ in range(5):
            add_ex(corrupt(phrase, random.randint(0,4)), intent, entities,
                actions, needs_llm, resp, hint)

# ============================================================
# CATEGORIA 41-45: FRASI IMPOSSIBILI (200)
# ============================================================

IMPOSSIBLE = [
    # Parola singola
    ("led","circuit",["led"],['[INTENT:{"action":"place_and_wire","components":[{"type":"led"}],"wires":"auto"}]'],False,"Posiziono LED.",None),
    ("resistenza","circuit",["resistor"],['[INTENT:{"action":"place_and_wire","components":[{"type":"resistor"}],"wires":"auto"}]'],False,"Posiziono resistenza.",None),
    ("play","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("stop","action",[],["[AZIONE:pause]"],False,"In pausa.",None),
    ("quiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("compila","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("undo","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("motore","circuit",["motor-dc"],['[INTENT:{"action":"place_and_wire","components":[{"type":"motor-dc"}],"wires":"auto"}]'],False,"Posiziono motore.",None),
    ("buzzer","circuit",["buzzer-piezo"],['[INTENT:{"action":"place_and_wire","components":[{"type":"buzzer-piezo"}],"wires":"auto"}]'],False,"Posiziono buzzer.",None),
    ("servo","circuit",["servo"],['[INTENT:{"action":"place_and_wire","components":[{"type":"servo"}],"wires":"auto"}]'],False,"Posiziono servo.",None),

    # Emoji
    ("▶️","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("⏸","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("🗑","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("❓","tutor",[],[],True,None,"Aiuto generico."),
    ("💡","circuit",["led"],['[INTENT:{"action":"place_and_wire","components":[{"type":"led"}],"wires":"auto"}]'],False,"LED.",None),

    # Storpiature estreme
    ("avai la simuazone","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("met un lde roso","circuit",["led"],['[INTENT:{"action":"place_and_wire","components":[{"type":"led","color":"red"}],"wires":"auto"}]'],False,"LED rosso.",None),
    ("cosè 1 rezstenza","tutor",["resistor"],[],True,None,"Domanda: cos'è una resistenza."),
    ("il crcuito nn fnziona","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("gaurda il moi circutio","vision",[],[],True,None,"Analisi visiva."),
    ("famme vdere il codce","code",[],["[AZIONE:openeditor]"],False,"Editor.",None),
    ("skratch bloki","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("cmplila e avvia tt","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),

    # Mix lingue
    ("start la simulation please","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("put a led on the breadboard per favore","circuit",["led"],['[INTENT:{"action":"place_and_wire","components":[{"type":"led"}],"wires":"auto"}]'],False,"LED.",None),
    ("what is a resistor? in italiano","tutor",["resistor"],[],True,None,"Cos'è una resistenza, in italiano."),
    ("compile and run grazie","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    ("clear everything pls","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),

    # Descrizioni senza terminologia
    ("quella cosa che gira e regola la luce","circuit",["potentiometer"],['[INTENT:{"action":"place_and_wire","components":[{"type":"potentiometer"}],"wires":"auto"}]'],False,"Potenziometro.",None),
    ("il pezzo che fa rumore","circuit",["buzzer-piezo"],['[INTENT:{"action":"place_and_wire","components":[{"type":"buzzer-piezo"}],"wires":"auto"}]'],False,"Buzzer.",None),
    ("il sensore che capisce se c'è luce","circuit",["photo-resistor"],['[INTENT:{"action":"place_and_wire","components":[{"type":"photo-resistor"}],"wires":"auto"}]'],False,"Fotoresistore.",None),
    ("quel coso con il magnete","circuit",["reed-switch"],['[INTENT:{"action":"place_and_wire","components":[{"type":"reed-switch"}],"wires":"auto"}]'],False,"Reed switch.",None),
    ("il motorino che si muove preciso","circuit",["servo"],['[INTENT:{"action":"place_and_wire","components":[{"type":"servo"}],"wires":"auto"}]'],False,"Servo.",None),
    ("la cosa che accumula energia","circuit",["capacitor"],['[INTENT:{"action":"place_and_wire","components":[{"type":"capacitor"}],"wires":"auto"}]'],False,"Condensatore.",None),
    ("il pezzo che fa passare corrente solo in un verso","circuit",["diode"],['[INTENT:{"action":"place_and_wire","components":[{"type":"diode"}],"wires":"auto"}]'],False,"Diodo.",None),
    ("l'interruttore elettronico","circuit",["mosfet-n"],['[INTENT:{"action":"place_and_wire","components":[{"type":"mosfet-n"}],"wires":"auto"}]'],False,"MOSFET.",None),

    # Sequenze verbose confuse
    ("ok facciamo così prima pulisci poi metti led e resistenza poi fai il codice e poi prova","circuit",["led","resistor"],
     ['[AZIONE:clearall]','[INTENT:{"action":"place_and_wire","components":[{"type":"led"},{"type":"resistor"}],"wires":"auto"}]',"[AZIONE:compile]","[AZIONE:play]"],
     False,"Pulisco, monto, compilo, avvio.",None),

    ("senti io vorrei provare a fare quel circuito lì quello del volume 1 il primo poi me lo spieghi passo passo","navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:loadexp:v1-cap6-primo-circuito]","[AZIONE:setbuildmode:passopasso]"],
     False,"Primo circuito passo passo.",None),

    # Quantità
    ("voglio 4 LED rossi e 4 resistenze da 220","circuit",["led","resistor"],
     ['[INTENT:{"action":"place_and_wire","components":[{"type":"led","color":"red"},{"type":"led","color":"red"},{"type":"led","color":"red"},{"type":"led","color":"red"},{"type":"resistor","value":"220"},{"type":"resistor","value":"220"},{"type":"resistor","value":"220"},{"type":"resistor","value":"220"}],"wires":"auto"}]'],
     False,"4 LED + 4 resistenze.",None),

    ("2 buzzer","circuit",["buzzer-piezo"],
     ['[INTENT:{"action":"place_and_wire","components":[{"type":"buzzer-piezo"},{"type":"buzzer-piezo"}],"wires":"auto"}]'],
     False,"2 buzzer.",None),

    # Confuso totale
    ("non so cosa fare","tutor",[],[],True,None,"Studente confuso, serve guida."),
    ("aiuto","tutor",[],[],True,None,"Richiesta aiuto generico."),
    ("help","tutor",[],[],True,None,"Help generico."),
    ("sono perso","tutor",[],[],True,None,"Studente smarrito."),
    ("boh","tutor",[],[],True,None,"Studente incerto."),
    ("???","tutor",[],[],True,None,"Confusione totale."),
    ("ke devo fa","tutor",[],[],True,None,"Non sa cosa fare."),
    ("è la prima volta che uso questa cosa","tutor",[],[],True,None,"Primo utilizzo."),
    ("ma come si usa sto programma","tutor",[],[],True,None,"Non sa usare la piattaforma."),

    # Ripetizioni
    ("pulisci cancella resetta tutto via ricomincia","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("play play play play","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("led led led ne voglio tre","circuit",["led"],
     ['[INTENT:{"action":"place_and_wire","components":[{"type":"led"},{"type":"led"},{"type":"led"}],"wires":"auto"}]'],
     False,"3 LED.",None),
]

for item in IMPOSSIBLE:
    phrase, intent, entities, actions, needs_llm, resp, hint = item
    for level in range(5):
        add_ex(corrupt(phrase, level), intent, entities, actions, needs_llm, resp, hint)


# ============================================================
# DEDUPLICAZIONE + SALVATAGGIO
# ============================================================
seen = set()
unique = []
for ex in examples:
    h = hashlib.md5(ex["messages"][1]["content"].encode()).hexdigest()
    if h not in seen:
        seen.add(h)
        unique.append(ex)

random.shuffle(unique)

output_file = Path(__file__).parent / "galileo-brain-hardmode-5k.jsonl"
with open(output_file, "w", encoding="utf-8") as f:
    for ex in unique:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")

print(f"✅ Dataset hard mode: {len(unique)} esempi unici")
print(f"   (rimossi {len(examples) - len(unique)} duplicati su {len(examples)} generati)")
print(f"   File: {output_file}")
print(f"   Size: {output_file.stat().st_size / 1e6:.1f} MB")

from collections import Counter
intents = Counter(json.loads(ex["messages"][2]["content"])["intent"] for ex in unique)
print(f"\n   Intent distribution:")
for i, c in intents.most_common():
    print(f"     {i}: {c} ({c/len(unique)*100:.1f}%)")

nl = sum(1 for ex in unique if json.loads(ex["messages"][2]["content"])["needs_llm"])
print(f"\n   needs_llm=true: {nl} ({nl/len(unique)*100:.1f}%)")
ms = sum(1 for ex in unique if len(json.loads(ex["messages"][2]["content"])["actions"])>1)
print(f"   Multi-step (>1 azione): {ms} ({ms/len(unique)*100:.1f}%)")
