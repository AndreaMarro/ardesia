#!/usr/bin/env python3
"""
GALILEO BRAIN — DATASET EXTREME v3 (Training 3+)
15000+ esempi: dialetti, parolacce, esperto, ignorante, troncate,
task tripli, context, scritte male, azioni rare, emoji, inglese,
voice-to-text, fuori-scope, combinazioni dinamiche,
LCD/Blockly, formale eccessivo, docente, build mode switching,
chained experiments, quantità numeriche, cross-component wiring.
"""

import json, random, hashlib, itertools
from pathlib import Path

random.seed(2026_05)

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

TABS = ["simulatore","manuale","video","lavagna","taccuini","detective","poe","reverse","review"]
VOLUMES = ["1","2","3"]
BUILD_MODES = ["montato","passopasso","libero"]
EXPERIMENTS = {
    "1":["v1-cap6-primo-circuito","v1-cap6-led-rosso","v1-cap6-led-bruciato",
         "v1-cap7-rgb-base","v1-cap7-rgb-mix","v1-cap7-rgb-arcobaleno",
         "v1-cap8-pulsante-led","v1-cap8-semaforo-pulsante","v1-cap8-pulsante-doppio",
         "v1-cap9-dimmer","v1-cap9-barra-led","v1-cap9-joystick",
         "v1-cap10-ldr-base","v1-cap10-ldr-led","v1-cap10-notturno",
         "v1-cap11-buzzer","v1-cap11-allarme",
         "v1-cap12-reed-base","v1-cap12-reed-allarme"],
    "2":["v2-cap6-led-avanzato","v2-cap6-led-parallelo",
         "v2-cap7-condensatore-base","v2-cap7-rc-timer",
         "v2-cap8-mosfet-base","v2-cap8-mosfet-motore",
         "v2-cap9-fototransistor","v2-cap9-inseguitore",
         "v2-cap10-motordc-base","v2-cap10-motordc-pwm"],
    "3":["v3-cap6-led-blink","v3-cap6-led-fade","v3-cap6-sos-morse",
         "v3-cap6-semaforo-auto","v3-cap6-knight-rider",
         "v3-cap7-pulsante-digitale","v3-cap7-debounce","v3-cap7-toggle",
         "v3-cap8-analog-read","v3-cap8-servo-pot","v3-cap8-termometro"],
}
ALL_EXPS = [e for v in EXPERIMENTS.values() for e in v]
COMPONENTS = ["led","resistor","push-button","buzzer-piezo","capacitor",
              "potentiometer","photo-resistor","diode","mosfet-n",
              "rgb-led","motor-dc","servo","reed-switch","phototransistor","battery9v"]

COMP_SLANG = {
    "led":["led","LED","lucina","lucetta","lampadina","luce","diodo luminoso","ledino","leddone","lucettina","la lucina","quel coso che si accende"],
    "resistor":["resistenza","resistore","res","resistore da 220","ohm","impedenza","R","la res","quella con le strisce"],
    "push-button":["pulsante","bottone","tasto","switch","pulsantino","btn","tastino","interruttore","button","il bottone","il tastino"],
    "buzzer-piezo":["buzzer","cicalino","speaker","suonatore","coso che suona","beep","piezo","cicalina","il beep","la trombetta","quello che fa bip"],
    "capacitor":["condensatore","capacitore","cap","capacitor","il cap","il condensatore","il cilindretto"],
    "potentiometer":["potenziometro","pot","manopola","rotella","dimmer","il coso che giri","knob","trimmer","la rotellina"],
    "photo-resistor":["fotoresistore","fotoresistenza","ldr","sensore di luce","il coso della luce","light sensor","sensore luminoso"],
    "diode":["diodo","il diodo","1N4007","diodo raddrizzatore","il componente nero con la striscia"],
    "mosfet-n":["mosfet","transistor","il mosfet","interruttore elettronico","mos-fet","fet","transistore","il coso con 3 gambe"],
    "rgb-led":["led rgb","rgb","led colorato","led tricolore","led che cambia colore","lucina rgb","il led con 4 gambe"],
    "motor-dc":["motore","motorino","motor dc","motore dc","motorino elettrico","motoretto","quello che gira"],
    "servo":["servo","servomotore","servo motore","braccetto","motorino di precisione","servetto","il servo"],
    "reed-switch":["reed switch","reed","interruttore magnetico","sensore magnetico","coso del magnete","il sensore magnetico"],
    "phototransistor":["fototransistor","sensore ottico","transistor della luce","quello che vede la luce"],
    "battery9v":["batteria","pila","batteria 9v","la 9 volt","alimentazione","la pila","la batteria"],
}

# ============================================================
# CORRUTTORI
# ============================================================
def typo_swap(t):
    c=list(t);i=random.randint(1,max(1,len(c)-2))
    if i+1<len(c):c[i],c[i+1]=c[i+1],c[i]
    return "".join(c)
def typo_drop(t):
    c=list(t)
    if len(c)>4:c.pop(random.randint(1,len(c)-2))
    return "".join(c)
def typo_double(t):
    c=list(t);i=random.randint(0,max(0,len(c)-1));c.insert(i,c[i])
    return "".join(c)
def sms(t):
    R={"che ":"ke ","per ":"x ","perché":"xke","non ":"nn ","cosa ":"kosa ",
       "come ":"cm ","questo":"qst","anche":"anke","voglio":"vojo",
       "con ":"cn ","fammi":"fmmi","dove":"dv","quando":"qnd","sono":"sn",
       "quello":"qll","adesso":"ades","tutto":"ttt","niente":"nnt"}
    for o,n in R.items():
        if random.random()<0.5:t=t.replace(o,n)
    return t
def caps(t):
    m=random.choice(["up","rand","low"])
    if m=="up":return t.upper()
    if m=="rand":return "".join(c.upper() if random.random()<0.3 else c for c in t)
    return t.lower()
def filler(t):
    F=["tipo","cioè","praticamente","boh","eh","insomma","vabbe","senti","ma","dai",
       "niente","ecco","ok","mah","allora","vabbè","uffa","emm","ehm","aspetta"]
    return f"{random.choice(F)} {t}" if random.random()<0.5 else f"{t} {random.choice(F)}"
def emoji_inject(t):
    E=["😂","🤔","😡","💡","🔥","👀","❓","‼️","🙏","😭","🤷","✨","🎯","💀","🫠"]
    pos=random.choice(["pre","post","both"])
    e1,e2=random.choice(E),random.choice(E)
    if pos=="pre":return f"{e1} {t}"
    if pos=="post":return f"{t} {e2}"
    return f"{e1} {t} {e2}"
def truncate_word(t):
    words=t.split()
    if len(words)>2:
        cut=random.randint(max(1,len(words)//2),len(words)-1)
        return " ".join(words[:cut])
    return t

def corrupt(text,level):
    if level==0:return text
    fns=[typo_swap,typo_drop,typo_double,sms,caps,filler,truncate_word,emoji_inject]
    for fn in random.sample(fns,k=min(level,len(fns))):
        text=fn(text)
    return text

# ============================================================
examples = []

def gen_ctx():
    v=random.choice(VOLUMES);tab=random.choice(TABS)
    exp=random.choice(EXPERIMENTS[v]) if random.random()<0.7 else None
    cs=random.sample(COMPONENTS,k=random.randint(0,5))
    cl=[f"{c}{i+1}" for i,c in enumerate(cs)]
    L=[f"[CONTESTO]",f"tab: {tab}"]
    if exp:L.append(f"esperimento: {exp}")
    L.append(f"volume_attivo: {v}")
    if cl:L.append(f"componenti: [{', '.join(cl)}]");L.append(f"fili: {random.randint(0,len(cl)*2)}")
    if random.random()<0.3:L.append(f"costruzione: {random.choice(BUILD_MODES)}")
    if random.random()<0.2:L.append(f"simulazione: {'▶ In esecuzione' if random.random()<0.5 else '⏸ In pausa'}")
    if random.random()<0.15:L.append(f"editor: {'Arduino C++' if random.random()<0.6 else 'Scratch/Blockly'}")
    return "\n".join(L)

def add(msg,intent,entities,actions,needs_llm,response,llm_hint):
    ctx=gen_ctx()
    full=f"{ctx}\n\n[MESSAGGIO]\n{msg}"
    a=json.dumps({"intent":intent,"entities":entities,"actions":actions,
        "needs_llm":needs_llm,"response":response,"llm_hint":llm_hint},ensure_ascii=False)
    examples.append({"messages":[
        {"role":"system","content":SYSTEM_PROMPT},
        {"role":"user","content":full},
        {"role":"assistant","content":a}]})

def intent_j(*comps):
    return json.dumps({"action":"place_and_wire","components":[{"type":c} if isinstance(c,str) else c for c in comps],"wires":"auto"},ensure_ascii=False)

# Helper: generate N variants of each phrase tuple
def gen_section(data, repeats, max_corrupt):
    for item in data:
        phrase,intent,entities,actions,nl,resp,hint = item
        for _ in range(repeats):
            add(corrupt(phrase,random.randint(0,max_corrupt)),intent,entities,actions,nl,resp,hint)

def gen_section_multi(data, repeats, max_corrupt):
    """For items where first element is a list of phrase variants"""
    for item in data:
        phrases,intent,entities,actions,nl,resp,hint = item
        for phrase in phrases:
            for _ in range(repeats):
                add(corrupt(phrase,random.randint(0,max_corrupt)),intent,entities,actions,nl,resp,hint)

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE A: DIALETTI ITALIANI (1200+)                     ║
# ╚════════════════════════════════════════════════════════════╝

# Template per generare frasi dialettali sistematicamente
# Ogni dialetto ha: play, pause, clearall, diagnose, LED, buzzer, motore+res,
# quiz, manuale, compila+avvia, visione, editor, esperimento, volume, tutor-question
DIALECT_TEMPLATES = {
    "napoletano": {
        "play":["fà partì 'o circuito","fallo ji","daje fa partì"],
        "pause":["ferma tutt cos","ferma nu poc","statte fermo"],
        "clearall":["levame tutt cosa 'a miezz","pulisci tutt","leva tutt"],
        "diagnose":["nun funziona nient","che è succieso","è rott"],
        "led":["miett nu LED ncopp 'a breadboard","metteme na lucetta","daje miett o LED"],
        "buzzer":["miett o cicalino","voglio o buzzer","metteme o beep"],
        "motor_res":["mietteme 'o motore e 'a resistenza","motore con resistenza daje"],
        "quiz":["famme 'o quiz","interrogame","quiz daje"],
        "manuale":["apre 'o manuale","famme vedé 'o libro","voglio o manuale"],
        "compile_play":["compilam 'o programm e fallo ji","compila e parti","fa partì o codice"],
        "vision":["'o circuito è sbagliato, guarda nu poc","guarda che cazz ho fatto","talia nu poc"],
        "editor":["voglio vedé 'o codice","apri l'editor","famme vedè o programma"],
        "experiment":["caricame l'esperimento","apri chello la","metti l'esperimento nuovo"],
        "tutor":["che cazz è na resistenza?","spiegame sta cosa","nun capisco nient"],
        "reset":["ricomincia da capo","rifallo tutto","azzera tutt cos"],
    },
    "romano": {
        "play":["daje fallo partì","fallo annà","avvialo daje"],
        "pause":["fermalo daje","stoppalo","fermo un attimo"],
        "clearall":["leva tutto da mezzo","sgombra tutto","pulisci daje"],
        "diagnose":["nun funziona un cazzo","che je succede","è tutto sbajato"],
        "led":["mettece un LED","piazza na lucina","daje metti er LED"],
        "buzzer":["mettece er buzzer","piazza er cicalino","voglio er beep"],
        "motor_res":["mettece er motore co' la resistenza","motore e resistenza daje"],
        "quiz":["famme er quiz daje","interrogame va","fai er quiz"],
        "manuale":["apri er manuale","er libro daje","famme vedé er manuale"],
        "compile_play":["compila e fallo annà","compilalo e partì","fai partì er codice"],
        "vision":["guarda n'attimo er circuito","daje guarda er circuito","controlla n'attimo"],
        "editor":["famme vedé er codice","apri l'editor daje","famme vedé er programma"],
        "experiment":["carica l'esperimento daje","apri quell'esperimento","metti quello novo"],
        "tutor":["che cazzo è sto coso?","spiegame un po'","nun capisco niente daje"],
        "reset":["rifallo da capo","ricomincia daje","azzera tutto"],
    },
    "milanese": {
        "play":["fal partì el circuìt","fal andà","mettilo in moto"],
        "pause":["ferma un moment","stoppalo lì","ferma el circuìt"],
        "clearall":["porta via tütt","cancella tütt","sgombra la board"],
        "diagnose":["el funziona minga","l'è minga giüst","gh'è un problema"],
        "led":["mett un LED lì","piazza un LED","mett la lucina"],
        "buzzer":["mett el buzzer","piazza el cicalino","el buzzer daj"],
        "motor_res":["mett el motore e el buzzer","motore con resistenza"],
        "quiz":["fam el quiz","interrogami un poo","quiz daj"],
        "manuale":["fam vedè el manual","apri el liber","el manual daj"],
        "compile_play":["compila e fal girà","compilalo e partì","fai partì el codice"],
        "vision":["dagh un'occiada al circuìt","controlla un poo","guarda el circuìt"],
        "editor":["fam vedè el codice","apri l'editor","el programma daj"],
        "experiment":["carica l'esperiment","apri quell lì","mett l'esperiment"],
        "tutor":["cus'è una resistenza?","spiegamm un poo","capisi minga"],
        "reset":["ricomincià de cap","rifal da zero","azzera tütt"],
    },
    "siciliano": {
        "play":["fallo partiri u circuitu","fallo jiri","avvialu"],
        "pause":["fermalu","stoppalu","ferma tuttu"],
        "clearall":["leva tuttu","pulisci a breadboard","sgombra tuttu"],
        "diagnose":["un funziona nenti","chi successi","è ruttu"],
        "led":["metti nu LED supra a breadboard","piazza na lucetta","metti u LED"],
        "buzzer":["metti u buzzer","u cicalino","u beep mettilu"],
        "motor_res":["mittimi u motori e u pulsanti","motore cu resistenza"],
        "quiz":["fammillu u quiz","interrogami","quiz dai"],
        "manuale":["apri u manuali","u libru","fammillu vidiri u manuali"],
        "compile_play":["compila e fallo jiri","compilalu e parti","fai partiri u codici"],
        "vision":["talìa u circuitu se è giustu","guarda chi combinai","controlla u circuitu"],
        "editor":["fammillu vidiri u codici","apri l'editor","u programma"],
        "experiment":["carica l'esperimentu","apri chiddu","metti l'esperimentu"],
        "tutor":["chi minchia è na resistenza?","spiegami sta cosa","un capisciu nenti"],
        "reset":["ricomincià da capu","rifàllu tuttu","azzera"],
    },
    "toscano": {
        "play":["fallo andà 'l circuito","avvialo icché","mandalo via"],
        "pause":["fermalo un po'","stoppalo icché","fermo"],
        "clearall":["leva tutto 'odio","sgombra via","pulisci tutto icché"],
        "diagnose":["un funziona 'n cavolo","che gl'è successo","è rotto icché"],
        "led":["mettici un LED icché","piazza una lucina","metti 'l LED"],
        "buzzer":["mettici i' buzzer","piazza i' cicalino","i' buzzer icché"],
        "motor_res":["mettici i' motore e i' buzzer","motore con resistenza icché"],
        "quiz":["fammi i' quiz","interrogami icché","quiz dé"],
        "manuale":["fammi vedé i' manuale","apri i' libro","i' manuale icché"],
        "compile_play":["compila e mandalo via","compilalo e fallo andà","fai partì i' codice"],
        "vision":["guarda un po' i' circuito","controlla icché","vedi se è giusto"],
        "editor":["fammi vedé i' codice","apri l'editor icché","i' programma"],
        "experiment":["carica l'esperimento icché","apri quello","metti l'esperimento"],
        "tutor":["icché gli è una resistenza?","spiegami un po'","un capisco nulla"],
        "reset":["ricomincia da capo icché","rifallo tutto","azzera icché"],
    },
    "veneto": {
        "play":["falo partir el circuito","falo andar","mandalo via"],
        "pause":["fermelo un momento","stopa","ferma tuto"],
        "clearall":["porta via tuto","cava tuto","neta la board"],
        "diagnose":["no'l funziona gnente","cossa xè successo","l'è roto"],
        "led":["mettime un LED là","piassa un LED","meti la luseta"],
        "buzzer":["mettime el buzzer","piassa el cicalino","el buzzer"],
        "motor_res":["mettime el motore e el pulsante","motore con resistensa"],
        "quiz":["fame el quiz","interogame","quiz dai"],
        "manuale":["fame vedar el manuale","versi el libro","el manuale dai"],
        "compile_play":["compila e falo andar","compilalo e parti","fai partir el codice"],
        "vision":["vardà el circuito","controla un momento","varda se l'è giusto"],
        "editor":["fame vedar el codice","versi l'editor","el programma"],
        "experiment":["carica l'esperimento","versi quelo là","meti l'esperimento"],
        "tutor":["cossa xè na resistensa?","spiegame un fià","no capiso gnente"],
        "reset":["ricominsiar da capo","rifalo tuto","azera tuto"],
    },
    "piemontese": {
        "play":["falo andé ël circuit","mandalo via","avvialo"],
        "pause":["ferma-lo","stòpa","ferma tut"],
        "clearall":["porta via tut","cava tut","dëscombra"],
        "diagnose":["a marcia nen","a l'è nen giust","a l'è rot"],
        "led":["buta-me un LED lì","piassa un LED","met la lus"],
        "buzzer":["buta-me ël buzzer","met ël cicalin","ël buzzer"],
        "motor_res":["buta-me ël motor e la resistensa"],
        "quiz":["fame ël quiz","interògame","quiz dai"],
        "manuale":["fame vëdde ël manual","deurbe ël lìber","ël manual"],
        "compile_play":["compila e falo andé","compilalo e part","fai partì ël còdes"],
        "vision":["varda ël circuit","contròla","varda s'a l'è giust"],
        "editor":["fame vëdde ël còdes","deurbe l'editor","ël programa"],
        "experiment":["caria l'esperiment","deurbe col lì","met l'esperiment"],
        "tutor":["cos'è-lo na resistensa?","spiegame un pòch","i capisso nen"],
        "reset":["torna da cap","rifalo tut","azera tut"],
    },
    "sardo": {
        "play":["faghe partire su circuitu","mandalu","avvialu"],
        "pause":["firma totu","firma unu momentu","stopa"],
        "clearall":["boga totu","lìmpia sa breadboard","boga totu cosa"],
        "diagnose":["no funtzionat nudda","ite est sutzessu","est segau"],
        "led":["pone unu LED in sa breadboard","pone sa luxetta","pone su LED"],
        "buzzer":["pone su buzzer","su cicalinu","su beep ponelu"],
        "motor_res":["pone su motore e sa resistèntzia"],
        "quiz":["faghe su quiz","interrogami","quiz dai"],
        "manuale":["faghe bìdere su manuale","aberi su lìberu","su manuale"],
        "compile_play":["compila e faghe partire","compilalu e parti"],
        "vision":["càstia su circuitu","controlla","bide si est giustu"],
        "editor":["faghe bìdere su còdighe","aberi s'editor","su programa"],
        "experiment":["càrriga s'esperimentu","aberi cussu","pone s'esperimentu"],
        "tutor":["ita est una resistèntzia?","ispiegami","no cumprendu nudda"],
        "reset":["torra dae su primu","rifaghe totu","azera totu"],
    },
    "pugliese": {
        "play":["falle partì u circuite","falle ji","avviele"],
        "pause":["firme","stòppe","ferme nu mumende"],
        "clearall":["leve tutte cose","pulisce tutte","sgombre"],
        "diagnose":["nan fungiscje ninde","che è succisse","s'è rutte"],
        "led":["mitte nu LED","piazze na lucine","u LED mèttele"],
        "buzzer":["mitte u buzzer","u cicaline","u beep"],
        "motor_res":["mitte u motore cu a resistenze"],
        "quiz":["famme u quiz","interrogeme","quiz dai"],
        "manuale":["apre u manuale","u libre","famme vedè u manuale"],
        "compile_play":["compile e falle ji","compilele e parte","fai partì u codice"],
        "vision":["uarde u circuite","controlla nu poc","vide se è giuste"],
        "editor":["famme vedè u codice","apre l'editor","u programma"],
        "experiment":["cariche l'esperimende","apre quidde","mitte l'esperimende"],
        "tutor":["che cazze jè na resistenz?","spìgheme","nan capisce ninde"],
        "reset":["ricumenze da cape","rifalle tutte","azzere"],
    },
    "calabrese": {
        "play":["fàllu partiri u circuitu","fàllu jiri","avvialu"],
        "pause":["fèrmalu","stòppalu","ferma tuttu"],
        "clearall":["lèvami tuttu","pulisci tuttu","sgòmbra"],
        "diagnose":["non funziona nènti","chi succedìu","è ruttu"],
        "led":["mèttimi nu LED","piazza na lucètta","u LED mèttilu"],
        "buzzer":["mèttimi u buzzèr","u cicalinu","u beep"],
        "motor_res":["mèttimi u motòri e a resistènza"],
        "quiz":["fàmmilu u quiz","intèrrogami","quiz dai"],
        "manuale":["àpri u manuàli","u lìbbru","fàmmilu vìdiri u manuàli"],
        "compile_play":["compìla e fàllu jiri","compìlalu e parti"],
        "vision":["guàrda u circùitu","contròlla","vìdi si è giùstu"],
        "editor":["fàmmilu vìdiri u còdici","àpri l'editòr","u progràmma"],
        "experiment":["càrrica l'esperimèntu","àpri chìddu","mètti l'esperimèntu"],
        "tutor":["chi è na resistènza?","spìegami","non capìsciu nènti"],
        "reset":["ricumìncia da càpu","rifàllu tuttu","àzzera"],
    },
    "genovese": {
        "play":["falo andà o circuito","mandalo via","avvialo"],
        "pause":["fermalo un momento","stoppalo","ferma tutto"],
        "clearall":["porta via tutto","pulisci tutto","sgombra"],
        "diagnose":["o no fonsiöna","cös'è successo","o l'è rotto"],
        "led":["mettimme un LED","piassa uña lusetta","metti o LED"],
        "buzzer":["mettimme o buzzer","o cicaliño","o beep"],
        "motor_res":["mettimme o motore con a resistensa"],
        "quiz":["famme o quiz","interrogamme","quiz dai"],
        "manuale":["famme vedde o manuale","arvi o libbro","o manuale"],
        "compile_play":["compila e falo andà","compilalo e parti"],
        "vision":["guarda o circuito","controlla","veddi se o l'è giusto"],
        "editor":["famme vedde o codice","arvi l'editor","o programma"],
        "experiment":["carega l'esperimento","arvi quello","metti l'esperimento"],
        "tutor":["cös'è uña resistensa?","spiegamme","no capiscio ninte"],
        "reset":["ricominscia da capo","rifalo tutto","azera tutto"],
    },
    "emiliano": {
        "play":["fal partir al circuìt","fal andèr","mandal via"],
        "pause":["fermèl un mumèint","stòpa","ferma tòt"],
        "clearall":["tira via tòt","pulìs tòt","sgómbra"],
        "diagnose":["an funziona brisa","cs'èl sucès","l'è ròt"],
        "led":["mèt un LED","piàsa una lusèta","mèt al LED"],
        "buzzer":["mèt al buzzer","al cicalìn","al beep"],
        "motor_res":["mèt al motóre e la resistèinsa"],
        "quiz":["fam al quiz","interògam","quiz dai"],
        "manuale":["fam vèder al manuèl","aversi al lìber","al manuèl"],
        "compile_play":["compìla e fal andèr","compìlal e partì"],
        "vision":["guèrda al circuìt","contròla","vèd s'al è giùst"],
        "editor":["fam vèder al còdice","aversi l'editòr","al programma"],
        "experiment":["cèrga l'esperimèint","aversi quel lè","mèt l'esperimèint"],
        "tutor":["cs'èl una resistèinsa?","spiègam","an capìs brisa"],
        "reset":["ricumìnsia da chèp","rifàl tòt","azèra tòt"],
    },
    "friulano": {
        "play":["fâslu lâ il circuît","mandilu vie","inviilu"],
        "pause":["fermilu un moment","stope","ferme dut"],
        "clearall":["puarte vie dut","netee dut","sgombre"],
        "diagnose":["nol funzione","ce isal sucedût","al è rot"],
        "led":["met un LED","plase une lusute","met il LED"],
        "buzzer":["met il buzzer","il cicalin","il beep"],
        "motor_res":["met il motôr e la resistense"],
        "quiz":["fasmi il quiz","interogami","quiz dai"],
        "manuale":["fasmi viodi il manuâl","vierç il libri","il manuâl"],
        "compile_play":["compile e fâslu lâ","compililu e part"],
        "vision":["cjale il circuît","controle","viôt se al è just"],
        "editor":["fasmi viodi il codiç","vierç l'editôr","il program"],
        "experiment":["cjame l'esperiment","vierç chel","met l'esperiment"],
        "tutor":["ce isal une resistense?","spiegami","no capìs nuie"],
        "reset":["torne di cjâf","rifâs dut","azere dut"],
    },
}

# Map template keys to (intent, entities, actions, needs_llm, response, llm_hint)
DIALECT_KEY_MAP = {
    "play":     ("action",[],["[AZIONE:play]"],False,"Simulazione avviata.",None),
    "pause":    ("action",[],["[AZIONE:pause]"],False,"In pausa.",None),
    "clearall": ("action",[],["[AZIONE:clearall]"],False,"Breadboard svuotata.",None),
    "diagnose": ("circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    "led":      ("circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"Posiziono LED.",None),
    "buzzer":   ("circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    "motor_res":("circuit",["motor-dc","resistor"],[f'[INTENT:{intent_j("motor-dc","resistor")}]'],False,"Motore+resistenza.",None),
    "quiz":     ("action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    "manuale":  ("navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Apro manuale.",None),
    "compile_play":("code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    "vision":   ("vision",[],[],True,None,"Analisi visiva richiesta."),
    "editor":   ("code",[],["[AZIONE:openeditor]"],False,"Apro editor.",None),
    "experiment":("navigation",[],[],True,None,"Vuole caricare un esperimento — chiedere quale."),
    "tutor":    ("tutor",[],[],True,None,"Domanda di teoria — serve spiegazione."),
    "reset":    ("action",[],["[AZIONE:reset]"],False,"Reset.",None),
}

for dialect_name, templates in DIALECT_TEMPLATES.items():
    for key, phrases in templates.items():
        intent,entities,actions,nl,resp,hint = DIALECT_KEY_MAP[key]
        for phrase in phrases:
            for lvl in range(6):  # 6 corruption levels each
                add(corrupt(phrase,lvl),intent,entities,actions,nl,resp,hint)

print(f"  A: Dialetti = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE B: PAROLACCE E FRUSTRAZIONE (500+)               ║
# ╚════════════════════════════════════════════════════════════╝

PAROLACCE = [
    ("cazzo non funziona","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("merda si è rotto tutto","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("madonna che schifo non va un cazzo","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("porco giuda non parte","action",[],["[AZIONE:play]"],False,"Avvio.",None),
    ("dio bestia compila sto cazzo di codice","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("vaffanculo non capisco niente","tutor",[],[],True,None,"Studente frustrato, spiegazione paziente."),
    ("che cazzo devo fare","tutor",[],[],True,None,"Studente confuso, serve guida."),
    ("metti sto cazzo di LED","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("levami sta merda dalla breadboard","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("fanculo resetta tutto","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("sto programma di merda non funziona","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("ma che cazzo è un mosfet","tutor",["mosfet-n"],[],True,None,"Cos'è un MOSFET."),
    ("porco il led non si accende","circuit",["led"],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("cazzo metti 3 LED e fallo partire","circuit",["led"],[f'[INTENT:{intent_j("led","led","led")}]',"[AZIONE:play]"],False,"3 LED e avvio.",None),
    ("mannaggia compila e vai","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    ("porca vacca fammi il quiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("maledizione apri il manuale","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("accidenti non ho capito un tubo","tutor",[],[],True,None,"Non ha capito, semplificare."),
    ("cavolo non mi viene il codice","code",[],[],True,None,"Difficoltà col codice."),
    ("oddio ho cancellato tutto aiuto","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("che programma del cazzo","tutor",[],[],True,None,"Frustrato, offrire aiuto concreto."),
    ("fa schifo sto simulatore","tutor",[],[],True,None,"Frustrato, offrire assistenza."),
    ("sei inutile","tutor",[],[],True,None,"Frustrato con AI, mostrare disponibilità."),
    ("non servi a niente galileo","tutor",[],[],True,None,"Frustrazione AI, offrire alternative."),
    ("ma funziona sto coso o no","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    # Nuove parolacce espanse
    ("porca miseria il buzzer non suona","circuit",["buzzer-piezo"],["[AZIONE:diagnose]"],False,"Diagnosi buzzer.",None),
    ("cristo santo metti una resistenza","circuit",["resistor"],[f'[INTENT:{intent_j("resistor")}]'],False,"Resistenza.",None),
    ("ma vaffanculo apri scratch","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("che schifo di codice riscrivi tutto","code",[],[],True,None,"Vuole riscrivere il codice."),
    ("madonna santa il motore non gira","circuit",["motor-dc"],["[AZIONE:diagnose]"],False,"Diagnosi motore.",None),
    ("porcaccia il servo non si muove","circuit",["servo"],["[AZIONE:diagnose]"],False,"Diagnosi servo.",None),
    ("che palle sta breadboard non capisco dove mettere le cose","tutor",["breadboard-half"],[],True,None,"Non capisce la breadboard."),
    ("uffa ma perché non compila mai","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("basta non ce la faccio più","tutor",[],[],True,None,"Scoraggiato, incoraggiare."),
    ("ma che cavolo vuol dire analogWrite","tutor",[],[],True,None,"Domanda su analogWrite."),
    ("porco mondo carica l'esperimento del semaforo","navigation",["v1-cap8-semaforo-pulsante"],["[AZIONE:loadexp:v1-cap8-semaforo-pulsante]"],False,"Semaforo.",None),
    ("madonna il potenziometro non fa niente","circuit",["potentiometer"],["[AZIONE:diagnose]"],False,"Diagnosi pot.",None),
    ("cazzarola fammi vedere il serial monitor","action",[],["[AZIONE:showserial]"],False,"Serial.",None),
    ("merda ho sbagliato i fili","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi fili.",None),
    ("dio cane togli il LED","circuit",["led"],["[AZIONE:removecomponent:led1]"],False,"LED rimosso.",None),
    ("porca puttana metti il volume 3","navigation",["volume_3"],["[AZIONE:openvolume:3:1]"],False,"Volume 3.",None),
    ("che cazzo di errore è questo","code",[],[],True,None,"Errore di compilazione, spiegare."),
    ("mannaggia la miseria non capisco il PWM","tutor",[],[],True,None,"Domanda PWM."),
    ("ma vaffanculo funzionava prima e ora no","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
]

gen_section(PAROLACCE, 8, 4)
print(f"  B: +Parolacce = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE C: ESPERTO TOTALE (500+)                         ║
# ╚════════════════════════════════════════════════════════════╝

EXPERT = [
    ("collega l'anodo del LED al pin D3 tramite una resistenza da 220 ohm","circuit",["led","resistor"],
     [f'[INTENT:{intent_j({"type":"led","connectTo":"W_D3"},{"type":"resistor","value":"220"})}]'],False,"LED+R220 su D3.",None),
    ("configura un partitore di tensione con due resistenze da 10k e 4.7k","circuit",["resistor"],
     [f'[INTENT:{intent_j({"type":"resistor","value":"10000"},{"type":"resistor","value":"4700"})}]'],True,None,"Partitore 10k/4.7k."),
    ("implementa il debounce software con millis() al posto di delay()","code",[],[],True,None,"Debounce con millis()."),
    ("misura la caduta di tensione sul LED","circuit",["led"],["[AZIONE:measure:led1]"],False,"Misuro tensione LED.",None),
    ("voglio un ponte H con 4 MOSFET per il motore DC bidirezionale","circuit",["mosfet-n","motor-dc"],
     [f'[INTENT:{intent_j({"type":"mosfet-n"},{"type":"mosfet-n"},{"type":"mosfet-n"},{"type":"mosfet-n"},{"type":"motor-dc"})}]'],True,None,"Ponte H 4 MOSFET."),
    ("scrivi il codice per analogRead su A0 mappato a PWM pin D5","code",["potentiometer","led"],
     ["[AZIONE:setcode:void setup(){pinMode(5,OUTPUT);}void loop(){int val=analogRead(A0);analogWrite(5,val/4);delay(10);}]","[AZIONE:compile]"],False,"Codice analogRead→PWM.",None),
    ("analizza la dissipazione di potenza sulla resistenza","tutor",["resistor"],[],True,None,"P=I²R."),
    ("verifica il duty cycle del PWM sul pin 5","code",[],[],True,None,"Verifica PWM."),
    ("carica il circuito RC timer e mostrami tau","navigation",["v2-cap7-rc-timer"],
     ["[AZIONE:loadexp:v2-cap7-rc-timer]"],True,None,"RC timer + tau=RC."),
    ("compila con flag di ottimizzazione e mostrami consumo memoria","code",[],["[AZIONE:compile]"],True,None,"Compilazione e memoria."),
    ("implementa una macchina a stati finiti per il semaforo","code",[],[],True,None,"FSM semaforo."),
    ("max corrente dal pin D13 senza danneggiare l'ATmega328p?","tutor",[],[],True,None,"Max 40mA, 20mA raccomandati."),
    ("usa I2C per pilotare il display LCD","code",["lcd16x2"],[],True,None,"I2C + LCD."),
    ("frequency sweep del buzzer da 200Hz a 5000Hz step 100Hz","code",["buzzer-piezo"],
     ["[AZIONE:setcode:void setup(){pinMode(9,OUTPUT);}void loop(){for(int f=200;f<=5000;f+=100){tone(9,f);delay(100);}noTone(9);delay(1000);}]","[AZIONE:compile]"],False,"Sweep buzzer.",None),
    ("calcola il valore della resistenza di pull-up per D3","tutor",["resistor","push-button"],[],True,None,"Pull-up 10kΩ."),
    ("differenza tra analogWrite e digitalWrite nel PWM","tutor",[],[],True,None,"analogWrite PWM 0-255 vs HIGH/LOW."),
    # Nuovi esperti
    ("imposta il timer1 per generare un interrupt ogni 500ms","code",[],[],True,None,"Timer1 interrupt avanzato."),
    ("usa la modulazione sigma-delta per simulare un DAC a 10 bit","code",[],[],True,None,"Sigma-delta DAC."),
    ("collega il fototransistor in configurazione darlington","circuit",["phototransistor"],
     [f'[INTENT:{intent_j({"type":"phototransistor","config":"darlington"})}]'],True,None,"Darlington phototransistor."),
    ("calcola la frequenza di taglio del filtro RC con R=10k C=100nF","tutor",["resistor","capacitor"],[],True,None,"f=1/(2πRC)."),
    ("implementa la comunicazione SPI con il display","code",["lcd16x2"],[],True,None,"SPI + display."),
    ("voglio un circuito trigger di Schmitt con MOSFET","circuit",["mosfet-n","resistor"],
     [f'[INTENT:{intent_j({"type":"mosfet-n"},{"type":"resistor"},{"type":"resistor"})}]'],True,None,"Schmitt trigger."),
    ("scrivi il codice per leggere 3 ADC in sequenza con media mobile","code",[],[],True,None,"Multi-ADC + moving average."),
    ("implementa un PID controller per il servo basato sul potenziometro","code",["servo","potentiometer"],[],True,None,"PID controller."),
    ("misura il tempo di carica del condensatore e plotta su serial","code",["capacitor","resistor"],
     ["[AZIONE:compile]","[AZIONE:play]","[AZIONE:showserial]"],True,None,"RC charge time + serial plot."),
    ("configura il watchdog timer per reset automatico in caso di hang","code",[],[],True,None,"Watchdog timer."),
    ("usa le interrupt esterne su pin 2 e 3 per contare gli impulsi","code",[],[],True,None,"External interrupts."),
    ("ottimizza il consumo energetico usando sleep mode e wake on interrupt","code",[],[],True,None,"Power saving."),
    ("implementa un protocollo di comunicazione one-wire per il sensore di temperatura","code",[],[],True,None,"One-wire protocol."),
    ("crea una lookup table per le note musicali e suona una melodia","code",["buzzer-piezo"],
     ["[AZIONE:compile]"],True,None,"LUT note musicali."),
    ("usa il PWM a 16 bit del timer1 per controllo fine del servo","code",["servo"],[],True,None,"PWM 16-bit servo."),
]

gen_section(EXPERT, 8, 2)
print(f"  C: +Expert = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE D: IGNORANTE TOTALE (500+)                       ║
# ╚════════════════════════════════════════════════════════════╝

IGNORANT = [
    ("come si usa questo programma","tutor",[],[],True,None,"Primo utilizzo."),
    ("non so cosa sto facendo","tutor",[],[],True,None,"Completamente perso."),
    ("cos'è questa scheda con i buchi","tutor",["breadboard-half"],[],True,None,"Non sa cos'è una breadboard."),
    ("dove metto le cose","tutor",[],[],True,None,"Non sa dove piazzare."),
    ("quei fili colorati cosa sono","tutor",["wire"],[],True,None,"Non conosce i fili."),
    ("il rettangolino con le strisce è la resistenza?","tutor",["resistor"],[],True,None,"Identifica resistenza."),
    ("la cosa lunga con le gambette corte e lunghe","tutor",["led"],[],True,None,"Descrive LED."),
    ("devo fare qualcosa col computer o è tutto sulla scheda?","tutor",[],[],True,None,"Non sa che serve software."),
    ("ho paura di rompere qualcosa","tutor",[],[],True,None,"Rassicurare."),
    ("si può prendere la scossa?","tutor",[],[],True,None,"5V è sicuro."),
    ("io non sono portato per queste cose","tutor",[],[],True,None,"Incoraggiare."),
    ("il mio compagno ha già finito e io sono ancora qui","tutor",[],[],True,None,"Confronto, rassicurare."),
    ("non ho mai toccato un circuito in vita mia","tutor",[],[],True,None,"Primo contatto."),
    ("ma a cosa serve fare tutto questo","tutor",[],[],True,None,"Motivare."),
    ("è come i Lego ma con l'elettricità?","tutor",[],[],True,None,"Buona analogia, confermare."),
    ("quella cosa rotonda che gira cos'è","tutor",["potentiometer"],[],True,None,"Descrive potenziometro."),
    ("il coso nero quadrato con tanti piedini","tutor",["nano-r4-board"],[],True,None,"Descrive Arduino."),
    ("prof io non ci capisco niente davvero","tutor",[],[],True,None,"Sconforto, approccio graduale."),
    ("ma posso solo guardare senza toccare niente?","tutor",[],[],True,None,"Suggerire già montato."),
    ("come faccio a fare il primo esercizio","navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:loadexp:v1-cap6-primo-circuito]","[AZIONE:setbuildmode:passopasso]"],False,"Primo esperimento.",None),
    ("aiutami a cominciare dall'inizio","navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:loadexp:v1-cap6-primo-circuito]","[AZIONE:setbuildmode:passopasso]"],False,"Inizio guidato.",None),
    ("io premo i tasti ma non succede niente","tutor",[],[],True,None,"Problemi interazione."),
    ("dove si scrive? non trovo dove scrivere il codice","code",[],["[AZIONE:openeditor]"],False,"Apro editor.",None),
    ("ma il led si mette così dritto o piegato","tutor",["led"],[],True,None,"Posizionamento LED."),
    ("le gambette del led sono diverse? una lunga e una corta","tutor",["led"],[],True,None,"Polarità LED."),
    # Nuovi ignoranti
    ("cosa vuol dire quella freccia verde in alto","tutor",[],[],True,None,"Non sa cos'è il tasto play."),
    ("perché ci sono dei numeri sulla breadboard","tutor",["breadboard-half"],[],True,None,"Numerazione righe breadboard."),
    ("il coso cilindrico azzurro con i numeri scritti sopra","tutor",["capacitor"],[],True,None,"Descrive condensatore."),
    ("ma la corrente elettrica si vede?","tutor",[],[],True,None,"Domanda sulla visibilità corrente."),
    ("cos'è quel triangolino nel disegno","tutor",[],[],True,None,"Simbolo diodo o transistor."),
    ("la prof ha detto di accendere un led ma non so come","tutor",["led"],[],True,None,"Istruzioni base LED."),
    ("ma devo collegare i fili per forza?","tutor",["wire"],[],True,None,"Importanza collegamenti."),
    ("cos'è quel coso grigio con la rotella","tutor",["potentiometer"],[],True,None,"Descrive pot."),
    ("si rompe se lo metto al contrario?","tutor",[],[],True,None,"Polarità componenti."),
    ("ma è pericoloso collegare la batteria?","tutor",["battery9v"],[],True,None,"Sicurezza batteria."),
    ("che differenza c'è tra i fili rossi e quelli neri","tutor",["wire"],[],True,None,"Convenzione colori."),
    ("perché il mio LED non si accende e quello del mio amico sì","tutor",["led"],[],True,None,"Debug principiante."),
    ("cos'è Arduino?","tutor",["nano-r4-board"],[],True,None,"Introduzione Arduino."),
    ("ma io devo scrivere in inglese?","code",[],[],True,None,"Il codice è in inglese."),
    ("non so cosa vuol dire void e setup","code",[],[],True,None,"Basi C++."),
    ("cos'è un circuito in serie?","tutor",[],[],True,None,"Serie vs parallelo."),
    ("e uno in parallelo?","tutor",[],[],True,None,"Parallelo."),
    ("perché si chiama breadboard?","tutor",["breadboard-half"],[],True,None,"Storia breadboard."),
    ("ma il simulatore è uguale alla realtà?","tutor",[],[],True,None,"Simulatore vs reale."),
    ("che voti si prendono con questo?","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("io vorrei fare un videogioco non un circuito","tutor",[],[],True,None,"Motivare verso elettronica."),
    ("posso collegare il telefono alla breadboard?","tutor",[],[],True,None,"No, spiegare."),
    ("ma i robot si fanno così?","tutor",[],[],True,None,"Collegamento robotica."),
    ("è tutto in italiano almeno?","tutor",[],[],True,None,"Interfaccia in italiano."),
]

gen_section(IGNORANT, 8, 3)
print(f"  D: +Ignorant = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE E: FRASI TRONCATE (400+)                         ║
# ╚════════════════════════════════════════════════════════════╝

TRUNCATED = [
    ("metti un","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],True,None,"Frase troncata, probabilmente componente."),
    ("avvia","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("apri","navigation",[],[],True,None,"Apri cosa?"),
    ("compil","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("led ros","circuit",["led"],[f'[INTENT:{intent_j({"type":"led","color":"red"})}]'],False,"LED rosso.",None),
    ("metti resist","circuit",["resistor"],[f'[INTENT:{intent_j("resistor")}]'],False,"Resistenza.",None),
    ("carica esper","navigation",[],[],True,None,"Quale esperimento?"),
    ("vol 2","navigation",["volume_2"],["[AZIONE:openvolume:2:1]"],False,"Volume 2.",None),
    ("diagn","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("quiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("paus","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("scratc","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("ard","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:arduino]"],False,"Arduino.",None),
    ("und","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("clea","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("buz","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("mot","circuit",["motor-dc"],[f'[INTENT:{intent_j("motor-dc")}]'],False,"Motore.",None),
    ("serv","circuit",["servo"],[f'[INTENT:{intent_j("servo")}]'],False,"Servo.",None),
    ("pot","circuit",["potentiometer"],[f'[INTENT:{intent_j("potentiometer")}]'],False,"Potenziometro.",None),
    ("rgb","circuit",["rgb-led"],[f'[INTENT:{intent_j("rgb-led")}]'],False,"LED RGB.",None),
    ("vid","navigation",["video"],["[AZIONE:opentab:video]"],False,"Video.",None),
    ("man","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("det","navigation",["detective"],["[AZIONE:opentab:detective]"],False,"Detective.",None),
    ("lav","navigation",["lavagna"],["[AZIONE:opentab:lavagna]"],False,"Lavagna.",None),
    ("ser mon","action",[],["[AZIONE:showserial]"],False,"Serial monitor.",None),
    ("bom","action",[],["[AZIONE:showbom]"],False,"BOM.",None),
    ("next","action",[],["[AZIONE:nextstep]"],False,"Prossimo.",None),
    ("prev","action",[],["[AZIONE:prevstep]"],False,"Precedente.",None),
    ("mont","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("pass","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("lib","action",[],["[AZIONE:setbuildmode:libero]"],False,"Libero.",None),
    # Nuove troncate
    ("play","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("stop","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("go","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("res","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("cap","circuit",["capacitor"],[f'[INTENT:{intent_j("capacitor")}]'],False,"Condensatore.",None),
    ("dio","circuit",["diode"],[f'[INTENT:{intent_j("diode")}]'],False,"Diodo.",None),
    ("mos","circuit",["mosfet-n"],[f'[INTENT:{intent_j("mosfet-n")}]'],False,"MOSFET.",None),
    ("bat","circuit",["battery9v"],[f'[INTENT:{intent_j("battery9v")}]'],False,"Batteria.",None),
    ("reed","circuit",["reed-switch"],[f'[INTENT:{intent_j("reed-switch")}]'],False,"Reed.",None),
    ("foto","circuit",["photo-resistor"],[f'[INTENT:{intent_j("photo-resistor")}]'],False,"Fotoresistenza.",None),
    ("lcd","circuit",["lcd16x2"],[f'[INTENT:{intent_j("lcd16x2")}]'],False,"LCD.",None),
    ("metti 2","circuit",["led"],[f'[INTENT:{intent_j("led","led")}]'],True,None,"2 di cosa?"),
    ("aggiungi 3","circuit",[],[],True,None,"3 di cosa?"),
    ("taccui","navigation",["taccuini"],["[AZIONE:opentab:taccuini]"],False,"Taccuini.",None),
    ("rev","navigation",["review"],["[AZIONE:opentab:review]"],False,"Review.",None),
    ("poe","navigation",["poe"],["[AZIONE:opentab:poe]"],False,"POE.",None),
    ("semaf","navigation",["v1-cap8-semaforo-pulsante"],["[AZIONE:loadexp:v1-cap8-semaforo-pulsante]"],False,"Semaforo.",None),
    ("blink","navigation",["v3-cap6-led-blink"],["[AZIONE:loadexp:v3-cap6-led-blink]"],False,"Blink.",None),
    ("fade","navigation",["v3-cap6-led-fade"],["[AZIONE:loadexp:v3-cap6-led-fade]"],False,"Fade.",None),
    ("knight","navigation",["v3-cap6-knight-rider"],["[AZIONE:loadexp:v3-cap6-knight-rider]"],False,"Knight Rider.",None),
    ("sos","navigation",["v3-cap6-sos-morse"],["[AZIONE:loadexp:v3-cap6-sos-morse]"],False,"SOS Morse.",None),
    ("dimm","navigation",["v1-cap9-dimmer"],["[AZIONE:loadexp:v1-cap9-dimmer]"],False,"Dimmer.",None),
]

gen_section(TRUNCATED, 6, 2)
print(f"  E: +Troncate = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE F: TASK TRIPLI E QUADRUPLI (800+)                ║
# ╚════════════════════════════════════════════════════════════╝

TRIPLE_TASKS = [
    (["pulisci tutto, metti 2 LED con resistenze, scrivi il codice per lampeggio alternato, compila e avvia",
      "svuota, costruisci due led con resistenze, programma il lampeggio alternato, compila e manda",
      "da zero: 2 led 2 resistenze codice alternato compila start",
      "ricomincia, metti due lucine con le resistenze, fai il codice che lampeggiano una sì una no, e avvia"],
     "circuit",["led","resistor"],
     ["[AZIONE:clearall]",f'[INTENT:{intent_j({"type":"led"},{"type":"led"},{"type":"resistor"},{"type":"resistor"})}]',"[AZIONE:compile]","[AZIONE:play]"],
     True,None,"Build 2 LED alternati + codice."),

    (["carica il dimmer, metti in passo passo, avanza due passi e avvia",
      "dimmer → passo passo → avanti → avanti → play",
      "esperimento dimmer guidato, vai avanti due volte poi prova"],
     "navigation",["v1-cap9-dimmer"],
     ["[AZIONE:loadexp:v1-cap9-dimmer]","[AZIONE:setbuildmode:passopasso]","[AZIONE:nextstep]","[AZIONE:nextstep]","[AZIONE:play]"],
     False,"Dimmer guidato.",None),

    (["costruiscimi un allarme: reed switch, buzzer e LED rosso",
      "allarme magnetico: reed + buzzer + led rosso, codice allarme, compila e avvia",
      "fammi il circuito dell'allarme con il sensore magnetico, il suono e la luce"],
     "circuit",["reed-switch","buzzer-piezo","led","resistor"],
     [f'[INTENT:{intent_j({"type":"reed-switch"},{"type":"buzzer-piezo"},{"type":"led","color":"red"},{"type":"resistor"})}]'],
     True,None,"Circuito allarme."),

    (["il circuito non funziona: diagnostica, correggi i fili, ricompila e provalo",
      "trova gli errori, sistema tutto, compile e play",
      "debug completo: diagnosi → fix → compilazione → test"],
     "circuit",[],["[AZIONE:diagnose]","[AZIONE:compile]","[AZIONE:play]"],True,None,"Pipeline debug."),

    (["apri scratch, compila il codice, avvia e apri il serial monitor",
      "blocchi → compile → play → serial monitor",
      "programma a blocchi, compila, avvia e mostrami la seriale"],
     "code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]","[AZIONE:compile]","[AZIONE:play]","[AZIONE:showserial]"],
     False,"Scratch+serial.",None),

    (["pulisci, carica l'esperimento rgb base, mostralo già montato e poi fammi il quiz",
      "clearall → rgb base → montato → quiz",
      "via tutto, apri rgb, già montato, interrogami"],
     "navigation",["v1-cap7-rgb-base"],
     ["[AZIONE:clearall]","[AZIONE:loadexp:v1-cap7-rgb-base]","[AZIONE:setbuildmode:montato]","[AZIONE:quiz]"],
     False,"RGB montato + quiz.",None),

    (["costruisci un mini robot inseguitore: fotoresistore, motore e LED",
      "robot inseguitore di luce: LDR + motore DC + LED",
      "fammi il robot che va verso la luce"],
     "circuit",["photo-resistor","motor-dc","led","resistor"],
     [f'[INTENT:{intent_j({"type":"photo-resistor"},{"type":"motor-dc"},{"type":"led"},{"type":"resistor"})}]'],
     True,None,"Robot inseguitore."),

    (["guarda il mio circuito, trova cosa non va, sistema e rifai tutto bene",
      "analizza la foto del circuito, diagnostica e correggi",
      "screenshot → diagnosi → fix → play"],
     "vision",[],["[AZIONE:diagnose]"],True,None,"Vision + diagnosi."),

    (["apri il manuale, poi fammi vedere un video sul LED e poi torna al simulatore",
      "manuale → video LED → simulatore",
      "prima il libro poi un video poi torno a lavorare"],
     "navigation",["manuale","video","simulatore"],
     ["[AZIONE:opentab:manuale]","[AZIONE:opentab:video]","[AZIONE:opentab:simulatore]"],
     False,"Tab hopping.",None),

    (["fai uno screenshot del circuito e crea un taccuino con gli appunti",
      "salva il circuito come foto e apri un nuovo notebook"],
     "action",[],["[AZIONE:createnotebook:Lezione]"],True,None,"Screenshot + notebook."),

    # Nuovi task multipli
    (["metti un LED rosso, una resistenza, collega tutto, compila il blink e avvia",
      "LED + resistenza + fili + codice blink + compile + play",
      "costruisci il circuito blink completo da zero e fallo andare"],
     "circuit",["led","resistor"],
     [f'[INTENT:{intent_j({"type":"led","color":"red"},{"type":"resistor"})}]',"[AZIONE:compile]","[AZIONE:play]"],
     True,None,"Blink completo."),

    (["carica il knight rider, mettilo passo passo, fammi vedere il codice e poi avvia",
      "knight rider → passo passo → editor → play"],
     "navigation",["v3-cap6-knight-rider"],
     ["[AZIONE:loadexp:v3-cap6-knight-rider]","[AZIONE:setbuildmode:passopasso]","[AZIONE:openeditor]","[AZIONE:play]"],
     False,"Knight rider guidato.",None),

    (["togli tutto, metti 5 LED con 5 resistenze in riga, programma il knight rider e compila",
      "clear + 5 LED + 5 res + codice knight rider + compile"],
     "circuit",["led","resistor"],
     ["[AZIONE:clearall]",f'[INTENT:{intent_j({"type":"led"},{"type":"led"},{"type":"led"},{"type":"led"},{"type":"led"},{"type":"resistor"},{"type":"resistor"},{"type":"resistor"},{"type":"resistor"},{"type":"resistor"})}]',"[AZIONE:compile]"],
     True,None,"5 LED knight rider."),

    (["apri il volume 3, carica il servo-pot, modalità già montato, avvia e apri il serial monitor",
      "vol3 → servo-pot → montato → play → serial"],
     "navigation",["v3-cap8-servo-pot"],
     ["[AZIONE:openvolume:3:1]","[AZIONE:loadexp:v3-cap8-servo-pot]","[AZIONE:setbuildmode:montato]","[AZIONE:play]","[AZIONE:showserial]"],
     False,"Servo-pot completo.",None),

    (["metti un buzzer, scrivi il codice per suonare Do Re Mi, compila, avvia e fammi sentire",
      "buzzer + codice note musicali + compile + play"],
     "circuit",["buzzer-piezo"],
     [f'[INTENT:{intent_j("buzzer-piezo")}]',"[AZIONE:compile]","[AZIONE:play]"],
     True,None,"Buzzer melodia."),

    (["pulisci, carica primo-circuito volume 1, passo passo, e spiegami ogni cosa",
      "reset → v1 primo circuito → passo passo → tutor mode"],
     "navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:clearall]","[AZIONE:loadexp:v1-cap6-primo-circuito]","[AZIONE:setbuildmode:passopasso]"],
     True,None,"Primo circuito guidato con spiegazioni."),

    (["switch a arduino c++, scrivi il codice per il fade LED, compila e testa",
      "arduino → codice fade → compile → play"],
     "code",[],
     ["[AZIONE:openeditor]","[AZIONE:switcheditor:arduino]","[AZIONE:compile]","[AZIONE:play]"],
     True,None,"Fade LED codice."),

    (["metti un RGB LED, 3 resistenze, programma un arcobaleno ciclico e avvia",
      "RGB + 3 res + codice rainbow + compile + play"],
     "circuit",["rgb-led","resistor"],
     [f'[INTENT:{intent_j({"type":"rgb-led"},{"type":"resistor"},{"type":"resistor"},{"type":"resistor"})}]',"[AZIONE:compile]","[AZIONE:play]"],
     True,None,"RGB arcobaleno."),
]

gen_section_multi(TRIPLE_TASKS, 6, 4)
print(f"  F: +Triple = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE G: CONTEXT MAINTENANCE (400+)                    ║
# ╚════════════════════════════════════════════════════════════╝

CONTEXT_TESTS = [
    ("avvia questo","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("fermalo","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("ricomincialo","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("aggiungine un altro","circuit",[],[],True,None,"Altro dello stesso tipo."),
    ("togline uno","circuit",[],[],True,None,"Rimuovere componente."),
    ("e poi?","action",[],["[AZIONE:nextstep]"],False,"Prossimo.",None),
    ("avanti","action",[],["[AZIONE:nextstep]"],False,"Avanti.",None),
    ("torna indietro","action",[],["[AZIONE:prevstep]"],False,"Indietro.",None),
    ("rifallo","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("mettine un altro uguale","circuit",[],[],True,None,"Duplicare ultimo."),
    ("quello che ho appena messo toglilo","circuit",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("cambia colore","circuit",[],[],True,None,"Cambio colore."),
    ("spostalo più a destra","circuit",[],[],True,None,"Spostamento."),
    ("collegali","circuit",[],[],True,None,"Collega ultimi componenti."),
    ("scollegali","circuit",[],[],True,None,"Rimuovi filo."),
    ("il primo","circuit",[],[],True,None,"Primo componente."),
    ("l'altro","circuit",[],[],True,None,"Componente alternativo."),
    ("fai come prima","action",[],[],True,None,"Ripeti."),
    ("ancora","action",[],[],True,None,"Ripeti."),
    ("di nuovo","action",[],[],True,None,"Ripeti."),
    ("ok e adesso?","tutor",[],[],True,None,"Prossimo step."),
    ("ho finito, che faccio?","tutor",[],[],True,None,"Prossimo task."),
    ("e dopo questo esperimento cosa faccio?","navigation",[],[],True,None,"Prossimo esperimento."),
    ("il prossimo","navigation",[],[],True,None,"Prossimo esperimento."),
    ("quello dopo","navigation",[],[],True,None,"Successivo."),
    ("il precedente","navigation",[],[],True,None,"Precedente."),
    ("torna a quello di prima","navigation",[],[],True,None,"Esperimento precedente."),
    # Nuovi context
    ("sì","action",[],[],True,None,"Conferma — contesto."),
    ("no","action",[],[],True,None,"Rifiuto — contesto."),
    ("ok","action",[],[],True,None,"Conferma — contesto."),
    ("va bene","action",[],[],True,None,"Conferma — contesto."),
    ("un altro","circuit",[],[],True,None,"Altro componente."),
    ("lo stesso","circuit",[],[],True,None,"Stesso componente."),
    ("uguale","circuit",[],[],True,None,"Duplicato."),
    ("il contrario","circuit",[],[],True,None,"Inverti."),
    ("più grande","circuit",[],[],True,None,"Valore più grande."),
    ("più piccolo","circuit",[],[],True,None,"Valore più piccolo."),
    ("cambia valore","circuit",[],[],True,None,"Modifica valore."),
    ("questo va bene?","tutor",[],[],True,None,"Chiede conferma circuito."),
    ("è giusto così?","tutor",[],[],True,None,"Verifica."),
    ("e se metto un altro LED?","circuit",["led"],[],True,None,"Ipotetica."),
    ("cosa succede se tolgo la resistenza?","tutor",["resistor"],[],True,None,"Ipotetica pericolosa."),
    ("perché quello del mio compagno è diverso?","tutor",[],[],True,None,"Confronto."),
    ("ripeti","action",[],[],True,None,"Ripeti ultima azione."),
    ("aspetta","action",[],[],True,None,"Pausa nella conversazione."),
    ("non quello, l'altro","circuit",[],[],True,None,"Correzione selezione."),
    ("quello rosso","circuit",[],[],True,None,"Riferimento a colore."),
    ("quello grande","circuit",[],[],True,None,"Riferimento a dimensione."),
    ("così?","tutor",[],[],True,None,"Chiede se va bene."),
]

gen_section(CONTEXT_TESTS, 7, 3)
print(f"  G: +Context = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE H: COSE SCRITTE MALISSIMO (400+)                 ║
# ╚════════════════════════════════════════════════════════════╝

TERRIBLE = [
    ("abia la simolazione","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("meti un leddd roso","circuit",["led"],[f'[INTENT:{intent_j({"type":"led","color":"red"})}]'],False,"LED rosso.",None),
    ("cm funzina 1 rezistnza","tutor",["resistor"],[],True,None,"Come funziona una resistenza."),
    ("nn funnziona nnt","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("garda il circito","vision",[],[],True,None,"Guarda il circuito."),
    ("apri i bloci","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("konpila il koddice","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("meta il buzer","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("ferma tuto","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("levva tuto via","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("kerkka un vidio su i led","action",[],["[AZIONE:youtube:LED]"],False,"Video LED.",None),
    ("seriale","action",[],["[AZIONE:showserial]"],False,"Serial.",None),
    ("anulla","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("kuiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("manualle","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("simmulatore","navigation",["simulatore"],["[AZIONE:opentab:simulatore]"],False,"Simulatore.",None),
    ("mi serbe un motorre","circuit",["motor-dc"],[f'[INTENT:{intent_j("motor-dc")}]'],False,"Motore.",None),
    ("agiungi il servo","circuit",["servo"],[f'[INTENT:{intent_j("servo")}]'],False,"Servo.",None),
    ("esprerimento dimmer","navigation",["v1-cap9-dimmer"],["[AZIONE:loadexp:v1-cap9-dimmer]"],False,"Dimmer.",None),
    ("volio il volune 3","navigation",["volume_3"],["[AZIONE:openvolume:3:1]"],False,"Volume 3.",None),
    ("passo passo","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("gia montato","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("detecttive","navigation",["detective"],["[AZIONE:opentab:detective]"],False,"Detective.",None),
    ("rewerse enginiiring","navigation",["reverse"],["[AZIONE:opentab:reverse]"],False,"Reverse.",None),
    ("il kondensattore","circuit",["capacitor"],[f'[INTENT:{intent_j("capacitor")}]'],False,"Condensatore.",None),
    ("fotorresistensa","circuit",["photo-resistor"],[f'[INTENT:{intent_j("photo-resistor")}]'],False,"Fotoresistore.",None),
    ("baateria","circuit",["battery9v"],[f'[INTENT:{intent_j("battery9v")}]'],False,"Batteria.",None),
    ("el diiodo","circuit",["diode"],[f'[INTENT:{intent_j("diode")}]'],False,"Diodo.",None),
    ("mossfet","circuit",["mosfet-n"],[f'[INTENT:{intent_j("mosfet-n")}]'],False,"MOSFET.",None),
    ("riid switc","circuit",["reed-switch"],[f'[INTENT:{intent_j("reed-switch")}]'],False,"Reed.",None),
    # Nuove scritte male
    ("metim un leed bllu","circuit",["led"],[f'[INTENT:{intent_j({"type":"led","color":"blue"})}]'],False,"LED blu.",None),
    ("fototranzistor","circuit",["phototransistor"],[f'[INTENT:{intent_j("phototransistor")}]'],False,"Fototransistor.",None),
    ("potenzommetro","circuit",["potentiometer"],[f'[INTENT:{intent_j("potentiometer")}]'],False,"Pot.",None),
    ("pulsantee","circuit",["push-button"],[f'[INTENT:{intent_j("push-button")}]'],False,"Pulsante.",None),
    ("el circuitto nn va","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("vorrei un leed verdde","circuit",["led"],[f'[INTENT:{intent_j({"type":"led","color":"green"})}]'],False,"LED verde.",None),
    ("konpilla e avvvia","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    ("apsri leditor","code",[],["[AZIONE:openeditor]"],False,"Editor.",None),
    ("karica lesperimentto","navigation",[],[],True,None,"Quale esperimento?"),
    ("la diaggnosi","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("fammi il kuizz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("la lavagnia","navigation",["lavagna"],["[AZIONE:opentab:lavagna]"],False,"Lavagna.",None),
    ("i takkuini","navigation",["taccuini"],["[AZIONE:opentab:taccuini]"],False,"Taccuini.",None),
    ("resetta tuto","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("il blinnk","navigation",["v3-cap6-led-blink"],["[AZIONE:loadexp:v3-cap6-led-blink]"],False,"Blink.",None),
    ("l ardruino","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:arduino]"],False,"Arduino.",None),
    ("voglo lo scracth","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("el breedboard","tutor",["breadboard-half"],[],True,None,"Breadboard."),
]

gen_section(TERRIBLE, 6, 3)
print(f"  H: +Terrible = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE I: AZIONI RARE (300+)                            ║
# ╚════════════════════════════════════════════════════════════╝

RARE = [
    ("evidenzia l'anodo del LED","action",["led"],["[AZIONE:highlightpin:led1:anode]"],False,"Evidenzio.",None),
    ("mostrami il pin signal del potenziometro","action",["potentiometer"],["[AZIONE:highlightpin:pot1:signal]"],False,"Signal.",None),
    ("dov'è il gate del mosfet?","action",["mosfet-n"],["[AZIONE:highlightpin:mosfet1:gate]"],False,"Gate.",None),
    ("collega il LED alla resistenza","circuit",["led","resistor"],["[AZIONE:addwire:led1:cathode:r1:pin1]"],False,"Collegati.",None),
    ("togli il primo filo","circuit",[],["[AZIONE:removewire:0]"],False,"Rimosso.",None),
    ("rimuovi il filo numero 2","circuit",[],["[AZIONE:removewire:1]"],False,"Rimosso.",None),
    ("resistenza a 100 ohm","action",["resistor"],["[AZIONE:setvalue:r1:resistance:100]"],False,"R=100Ω.",None),
    ("resistenza a 1k","action",["resistor"],["[AZIONE:setvalue:r1:resistance:1000]"],False,"R=1kΩ.",None),
    ("resistenza a 10k","action",["resistor"],["[AZIONE:setvalue:r1:resistance:10000]"],False,"R=10kΩ.",None),
    ("resistenza a 47k","action",["resistor"],["[AZIONE:setvalue:r1:resistance:47000]"],False,"R=47kΩ.",None),
    ("luce ambiente al 75%","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:75]"],False,"Luce 75%.",None),
    ("servo a 45 gradi","action",["servo"],["[AZIONE:interact:servo1:setAngle:45]"],False,"45°.",None),
    ("servo a 135 gradi","action",["servo"],["[AZIONE:interact:servo1:setAngle:135]"],False,"135°.",None),
    ("potenziometro a un quarto","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:25]"],False,"25%.",None),
    ("potenziometro a tre quarti","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:75]"],False,"75%.",None),
    ("scrivi hello sulla seriale","action",[],["[AZIONE:serialwrite:hello]"],False,"Inviato.",None),
    ("manda test alla seriale","action",[],["[AZIONE:serialwrite:test]"],False,"Inviato.",None),
    ("aggiungi delay(500); al codice","code",[],["[AZIONE:appendcode:delay(500);]"],False,"Aggiunto.",None),
    ("fammi leggere il codice attuale","code",[],["[AZIONE:getcode]"],False,"Codice.",None),
    ("chiudi l'editor","code",[],["[AZIONE:closeeditor]"],False,"Chiuso.",None),
    ("apri il volume 1 a pagina 45","navigation",["volume_1"],["[AZIONE:openvolume:1:45]"],False,"V1 p.45.",None),
    ("vai a pagina 30 del volume 2","navigation",["volume_2"],["[AZIONE:openvolume:2:30]"],False,"V2 p.30.",None),
    ("togli il buzzer","circuit",["buzzer-piezo"],["[AZIONE:removecomponent:buzzer1]"],False,"Rimosso.",None),
    ("rimuovi la resistenza","circuit",["resistor"],["[AZIONE:removecomponent:r1]"],False,"Rimossa.",None),
    ("elimina il LED","circuit",["led"],["[AZIONE:removecomponent:led1]"],False,"Rimosso.",None),
    ("leva il motore","circuit",["motor-dc"],["[AZIONE:removecomponent:motor1]"],False,"Rimosso.",None),
    # Nuove rare
    ("servo a 0 gradi","action",["servo"],["[AZIONE:interact:servo1:setAngle:0]"],False,"0°.",None),
    ("servo a 180 gradi","action",["servo"],["[AZIONE:interact:servo1:setAngle:180]"],False,"180°.",None),
    ("servo a 90 gradi","action",["servo"],["[AZIONE:interact:servo1:setAngle:90]"],False,"90°.",None),
    ("resistenza a 220 ohm","action",["resistor"],["[AZIONE:setvalue:r1:resistance:220]"],False,"R=220Ω.",None),
    ("resistenza a 330 ohm","action",["resistor"],["[AZIONE:setvalue:r1:resistance:330]"],False,"R=330Ω.",None),
    ("luce ambiente al 0%","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:0]"],False,"Buio.",None),
    ("luce ambiente al 100%","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:100]"],False,"Luce max.",None),
    ("luce ambiente al 50%","action",["photo-resistor"],["[AZIONE:setvalue:ldr1:lightlevel:50]"],False,"Luce 50%.",None),
    ("potenziometro al minimo","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:0]"],False,"Pot 0%.",None),
    ("potenziometro al massimo","action",["potentiometer"],["[AZIONE:setvalue:pot1:position:100]"],False,"Pot 100%.",None),
    ("cerca un video sul buzzer su youtube","action",["buzzer-piezo"],["[AZIONE:youtube:buzzer]"],False,"Video buzzer.",None),
    ("cerca un video sulle resistenze","action",["resistor"],["[AZIONE:youtube:resistenza]"],False,"Video resistenze.",None),
    ("premi il pulsante","action",["push-button"],["[AZIONE:interact:btn1:press]"],False,"Premuto.",None),
    ("rilascia il pulsante","action",["push-button"],["[AZIONE:interact:btn1:release]"],False,"Rilasciato.",None),
    ("togli il servo","circuit",["servo"],["[AZIONE:removecomponent:servo1]"],False,"Rimosso.",None),
    ("togli il condensatore","circuit",["capacitor"],["[AZIONE:removecomponent:cap1]"],False,"Rimosso.",None),
    ("togli il potenziometro","circuit",["potentiometer"],["[AZIONE:removecomponent:pot1]"],False,"Rimosso.",None),
    ("evidenzia il catodo del LED","action",["led"],["[AZIONE:highlightpin:led1:cathode]"],False,"Catodo.",None),
    ("evidenzia il pin positivo del buzzer","action",["buzzer-piezo"],["[AZIONE:highlightpin:buzzer1:positive]"],False,"Positivo.",None),
    ("dov'è il drain del mosfet","action",["mosfet-n"],["[AZIONE:highlightpin:mosfet1:drain]"],False,"Drain.",None),
    ("dov'è il source del mosfet","action",["mosfet-n"],["[AZIONE:highlightpin:mosfet1:source]"],False,"Source.",None),
]

gen_section(RARE, 5, 3)
print(f"  I: +Rare = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE J: CONTESTO CONTRADDITTORIO (150+)               ║
# ╚════════════════════════════════════════════════════════════╝

CONTRADICTIONS = [
    ("avvia","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("pausa","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("metti un LED","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("prossimo passo","action",[],["[AZIONE:nextstep]"],False,"Prossimo.",None),
    ("compila","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    # Nuovi contraddittori
    ("resetta","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("togli tutto","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("apri il manuale","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("fammi il quiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("chiudi l'editor","code",[],["[AZIONE:closeeditor]"],False,"Chiuso.",None),
    ("apri l'editor","code",[],["[AZIONE:openeditor]"],False,"Editor.",None),
    ("undo","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("metti un buzzer","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("carica il blink","navigation",["v3-cap6-led-blink"],["[AZIONE:loadexp:v3-cap6-led-blink]"],False,"Blink.",None),
    ("switch a scratch","code",[],["[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
]

gen_section(CONTRADICTIONS, 8, 3)
print(f"  J: +Contradictions = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE K: COMBINAZIONI DINAMICHE RANDOM (2000)          ║
# ╚════════════════════════════════════════════════════════════╝

VERBS = ["metti","aggiungi","piazza","dammi","servimi","voglio","costruisci con","fammi",
         "piazzami","inserisci","posiziona","monta","mettimi","colloca","sistema"]
CONNECTORS = ["e","con","più","insieme a","vicino a","collegato a","+","poi",
              "dopo metti anche","e anche","insieme con","e poi","e aggiungi"]

for _ in range(4500):
    n = random.randint(2, 4)
    chosen = random.sample(COMPONENTS, k=n)
    names = [random.choice(COMP_SLANG.get(c, [c])) for c in chosen]
    verb = random.choice(VERBS)
    conn = random.choice(CONNECTORS)

    if n == 2:
        phrase = f"{verb} {names[0]} {conn} {names[1]}"
    elif n == 3:
        phrase = f"{verb} {names[0]}, {names[1]} {conn} {names[2]}"
    else:
        phrase = f"{verb} " + ", ".join(names[:-1]) + f" {conn} {names[-1]}"

    add(corrupt(phrase, random.randint(0,4)), "circuit", chosen,
        [f'[INTENT:{intent_j(*chosen)}]'], False, f"{n} componenti.", None)

print(f"  K: +DynCombo = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE L: EMOJI E EMOTICON (300+)                       ║
# ╚════════════════════════════════════════════════════════════╝

EMOJI_MSGS = [
    ("▶️","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("⏸","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("⏹","action",[],["[AZIONE:pause]"],False,"Stop.",None),
    ("🔄","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("🗑️","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("💡","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("💡 metti","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("🔊","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("❓ come funziona","tutor",[],[],True,None,"Domanda generica."),
    ("👀 guarda","vision",[],[],True,None,"Vision."),
    ("😡 non funziona","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("😭 aiuto","tutor",[],[],True,None,"Ha bisogno di aiuto."),
    ("🎯 quiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("📖 manuale","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("🎬 video","navigation",["video"],["[AZIONE:opentab:video]"],False,"Video.",None),
    ("⚡ compila","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("⚡ compila e ▶️","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    ("🔙 indietro","action",[],["[AZIONE:prevstep]"],False,"Indietro.",None),
    ("▶️ avanti","action",[],["[AZIONE:nextstep]"],False,"Avanti.",None),
    ("😤 sto coso non va","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("🤔 cos'è una resistenza","tutor",["resistor"],[],True,None,"Cos'è resistenza."),
    ("✨ bello! e adesso?","tutor",[],[],True,None,"Prossimo step."),
    ("🗑️ togli tutto","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("💀 ho rotto tutto","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("🙏 aiutami","tutor",[],[],True,None,"Richiesta aiuto generica."),
    (":)","tutor",[],[],True,None,"Emoticon positiva."),
    (":(","tutor",[],[],True,None,"Emoticon triste, incoraggiare."),
    (":D funziona!","tutor",[],[],True,None,"Successo, congratulare."),
    ("xD che bello","tutor",[],[],True,None,"Entusiasmo."),
]

gen_section(EMOJI_MSGS, 7, 2)
print(f"  L: +Emoji = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE M: INGLESE MISTO / ITANGLESE (300+)              ║
# ╚════════════════════════════════════════════════════════════╝

ENGLISH_MIX = [
    ("play the simulation","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("stop it","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("put a LED please","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("add a resistor","circuit",["resistor"],[f'[INTENT:{intent_j("resistor")}]'],False,"Resistenza.",None),
    ("compile the code","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("what is a resistor","tutor",["resistor"],[],True,None,"What is a resistor."),
    ("how does this work","tutor",[],[],True,None,"How does it work."),
    ("clear all","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("reset everything","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("open the manual","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("start the quiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("undo please","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("next step","action",[],["[AZIONE:nextstep]"],False,"Prossimo.",None),
    # Itanglese
    ("fai il play","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("metti in pause","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("fammi il reset","action",[],["[AZIONE:reset]"],False,"Reset.",None),
    ("fai clear all","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("metti un button","circuit",["push-button"],[f'[INTENT:{intent_j("push-button")}]'],False,"Pulsante.",None),
    ("aggiungi uno switch","circuit",["push-button"],[f'[INTENT:{intent_j("push-button")}]'],False,"Switch.",None),
    ("fai il compile and run","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    ("apri il code editor","code",[],["[AZIONE:openeditor]"],False,"Editor.",None),
    ("open scratch please","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("switch to arduino","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:arduino]"],False,"Arduino.",None),
    ("show me the serial monitor","action",[],["[AZIONE:showserial]"],False,"Serial.",None),
    ("diagnose the circuit","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("is this circuit correct?","vision",[],[],True,None,"Verifica circuito."),
    ("help me please","tutor",[],[],True,None,"Richiesta aiuto."),
    ("I don't understand","tutor",[],[],True,None,"Non capisce."),
    ("what's wrong","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("load the blink experiment","navigation",["v3-cap6-led-blink"],["[AZIONE:loadexp:v3-cap6-led-blink]"],False,"Blink.",None),
]

gen_section(ENGLISH_MIX, 7, 2)
print(f"  M: +English = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE N: VOICE-TO-TEXT GARBLED (300+)                   ║
# ╚════════════════════════════════════════════════════════════╝
# Errori tipici del riconoscimento vocale

VOICE = [
    ("avvia la simulazione per favore","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("a via la simulazione","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("metti un letto rosso","circuit",["led"],[f'[INTENT:{intent_j({"type":"led","color":"red"})}]'],False,"LED rosso.",None),
    ("metti un leader","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("la resistenza","circuit",["resistor"],[f'[INTENT:{intent_j("resistor")}]'],False,"Resistenza.",None),
    ("ferma tutto quanto","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("pulisci la breadboard","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("non funziona niente aiuto","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("compila il programma","code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    ("apri il manuale digitale","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("fammi la diagnosi del circuito","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("metti il pulsante nella bread","circuit",["push-button"],[f'[INTENT:{intent_j("push-button")}]'],False,"Pulsante.",None),
    ("aggiungi un busser","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("fammi vedere il seriale","action",[],["[AZIONE:showserial]"],False,"Serial.",None),
    ("metti il motore elettrico","circuit",["motor-dc"],[f'[INTENT:{intent_j("motor-dc")}]'],False,"Motore.",None),
    ("il condensatore grande","circuit",["capacitor"],[f'[INTENT:{intent_j("capacitor")}]'],False,"Condensatore.",None),
    ("carica l'esperimento del sole","tutor",[],[],True,None,"Non chiaro quale esperimento."),
    ("il filo rosso va al più","tutor",["wire"],[],True,None,"Collegamento filo."),
    ("la cosa che suona","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("il coso che gira il motore","circuit",["motor-dc"],[f'[INTENT:{intent_j("motor-dc")}]'],False,"Motore.",None),
    ("galileo aiutami col circuito","tutor",[],[],True,None,"Richiesta aiuto."),
    ("il led non si accende perché","tutor",["led"],[],True,None,"Debug LED."),
    ("guarda se ho fatto bene","vision",[],[],True,None,"Verifica visiva."),
    ("controlla il circuito per me","vision",[],[],True,None,"Analisi visiva."),
    ("il potenziometro non risponde","circuit",["potentiometer"],["[AZIONE:diagnose]"],False,"Diagnosi pot.",None),
    ("fammi il cuiz","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("carica il fade","navigation",["v3-cap6-led-fade"],["[AZIONE:loadexp:v3-cap6-led-fade]"],False,"Fade.",None),
    ("metti la batteria","circuit",["battery9v"],[f'[INTENT:{intent_j("battery9v")}]'],False,"Batteria.",None),
    ("il display","circuit",["lcd16x2"],[f'[INTENT:{intent_j("lcd16x2")}]'],False,"LCD.",None),
]

gen_section(VOICE, 7, 3)
print(f"  N: +Voice = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE O: FUORI SCOPE (200+)                            ║
# ╚════════════════════════════════════════════════════════════╝
# Domande che NON riguardano il simulatore

OUT_OF_SCOPE = [
    ("che ore sono","tutor",[],[],True,None,"Fuori scope — reindirizzare all'elettronica."),
    ("qual è la capitale della Francia","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("mi racconti una barzelletta","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("chi è il presidente","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("quanto fa 7 per 8","tutor",[],[],True,None,"Fuori scope ma vicino (matematica)."),
    ("mi aiuti con i compiti di italiano","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("come si dice ciao in inglese","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("mi fai un disegno","tutor",[],[],True,None,"Fuori scope, suggerire la lavagna."),
    ("posso giocare a un videogioco","tutor",[],[],True,None,"Fuori scope, suggerire detective/poe."),
    ("chi ti ha creato","tutor",[],[],True,None,"Sono Galileo, di ELAB Tutor."),
    ("sei un robot","tutor",[],[],True,None,"Sono Galileo, assistente AI."),
    ("come ti chiami","tutor",[],[],True,None,"Sono Galileo."),
    ("mi annoio","tutor",[],[],True,None,"Suggerire esperimento divertente."),
    ("è ora di ricreazione","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("mi piace la pizza","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("ho fame","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("il mio gatto si chiama Micio","tutor",[],[],True,None,"Fuori scope."),
    ("fa caldo oggi","tutor",[],[],True,None,"Fuori scope."),
    ("mi dai il wifi","tutor",[],[],True,None,"Fuori scope."),
    ("come funziona Minecraft","tutor",[],[],True,None,"Fuori scope, collegare a circuiti."),
    ("voglio andare a casa","tutor",[],[],True,None,"Fuori scope, motivare."),
    ("la prof è antipatica","tutor",[],[],True,None,"Fuori scope, reindirizzare."),
    ("quando finisce la lezione","tutor",[],[],True,None,"Fuori scope."),
    ("posso usare il cellulare","tutor",[],[],True,None,"Fuori scope."),
    ("mi fai copiare","tutor",[],[],True,None,"No, ma posso aiutarti a capire."),
]

gen_section(OUT_OF_SCOPE, 6, 3)
print(f"  O: +OutOfScope = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE P: OGNI ESPERIMENTO × OGNI AZIONE (500+)         ║
# ╚════════════════════════════════════════════════════════════╝
# Generazione sistematica: ogni esperimento con load/montato/passopasso/quiz

LOAD_VERBS = ["carica","apri","metti","fammi","voglio","mostrami","fai vedere"]
for vol, exps in EXPERIMENTS.items():
    for exp in exps:
        short = exp.split("-",2)[-1].replace("-"," ")
        # Load
        for _ in range(3):
            v = random.choice(LOAD_VERBS)
            add(corrupt(f"{v} l'esperimento {short}", random.randint(0,3)),
                "navigation",[exp],
                [f"[AZIONE:loadexp:{exp}]"],False,f"Carico {short}.",None)
        # Load + montato
        add(corrupt(f"carica {short} già montato", random.randint(0,2)),
            "navigation",[exp],
            [f"[AZIONE:loadexp:{exp}]","[AZIONE:setbuildmode:montato]"],False,f"{short} montato.",None)
        # Load + passopasso
        add(corrupt(f"fammi {short} passo passo", random.randint(0,2)),
            "navigation",[exp],
            [f"[AZIONE:loadexp:{exp}]","[AZIONE:setbuildmode:passopasso]"],False,f"{short} guidato.",None)

print(f"  P: +Experiments = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE Q: AZIONI BASE × VARIANTI LINGUISTICHE (500+)    ║
# ╚════════════════════════════════════════════════════════════╝
# Ogni azione base con tante forme diverse

ACTION_VARIANTS = {
    "play": (["avvia","parti","inizia","start","vai","fallo andare","fallo partire",
              "metti play","avvia la simulazione","accendi","premi play","fai partire",
              "comincia","metti in moto","dacci dentro","inizia la simulazione",
              "esegui","lancia","attiva","premi il triangolino verde"],
             "action",[],["[AZIONE:play]"],False,"Avviato.",None),
    "pause": (["pausa","ferma","stop","fermalo","metti in pausa","stoppalo",
               "blocca","aspetta","tieni fermo","freezalo","metti stop",
               "interrompi","sospendi","fermati","basta"],
              "action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    "reset": (["reset","resetta","ricomincia","riavvia","riparti","da capo",
               "ricomincia da zero","riavvia tutto","restart","refresh"],
              "action",[],["[AZIONE:reset]"],False,"Reset.",None),
    "clearall": (["pulisci","svuota","cancella tutto","togli tutto","leva tutto",
                  "clear","sgombra","via tutto","elimina tutto","rimuovi tutto",
                  "butta via tutto","fai pulizia","tabula rasa"],
                 "action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    "compile": (["compila","compilalo","fai il compile","build","costruisci il codice",
                 "processa il codice","converti in programma","fai la compilazione"],
                "code",[],["[AZIONE:compile]"],False,"Compilo.",None),
    "undo": (["annulla","torna indietro","undo","ctrl z","indietro","ripristina",
              "cancella l'ultimo","togli l'ultimo"],
             "action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    "diagnose": (["diagnostica","diagnosi","trova il problema","cosa c'è che non va",
                  "perché non funziona","check","controlla","verifica","debug",
                  "analizza il circuito","trova l'errore","cos'è rotto"],
                 "circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    "quiz": (["quiz","fammi il quiz","interrogami","test","verifica","domande",
              "mettimi alla prova","sfidami","quanto ne so"],
             "action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
}

for action_name, (phrases, intent, entities, actions, nl, resp, hint) in ACTION_VARIANTS.items():
    for phrase in phrases:
        for _ in range(4):
            add(corrupt(phrase, random.randint(0,4)), intent, entities, actions, nl, resp, hint)

print(f"  Q: +ActionVariants = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE R: FORMALE ECCESSIVO (200+)                      ║
# ╚════════════════════════════════════════════════════════════╝

FORMAL = [
    ("Gentilissimo Galileo, sarebbe così cortese da avviare la simulazione?","action",[],["[AZIONE:play]"],False,"Avviato.",None),
    ("Egregio assistente, desidererei posizionare un diodo ad emissione luminosa sulla scheda sperimentale","circuit",["led"],[f'[INTENT:{intent_j("led")}]'],False,"LED.",None),
    ("La prego, potrebbe cortesemente interrompere l'esecuzione del circuito?","action",[],["[AZIONE:pause]"],False,"Pausa.",None),
    ("Mi permetto di chiederLe di ripulire interamente la breadboard","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("Sarebbe possibile ottenere una diagnosi dello stato attuale del circuito?","circuit",[],["[AZIONE:diagnose]"],False,"Diagnosi.",None),
    ("Desidererei comprendere il funzionamento di un resistore, se non Le è di disturbo","tutor",["resistor"],[],True,None,"Cos'è un resistore."),
    ("Mi farebbe la cortesia di compilare il programma e successivamente avviarlo?","code",[],["[AZIONE:compile]","[AZIONE:play]"],False,"Compilo e avvio.",None),
    ("Con il Suo permesso, vorrei accedere al manuale didattico","navigation",["manuale"],["[AZIONE:opentab:manuale]"],False,"Manuale.",None),
    ("Illustrissimo Galileo, mi sottoponga ad una verifica di apprendimento","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("La disturbo per chiederLe di caricare l'esperimento relativo al semaforo","navigation",["v1-cap8-semaforo-pulsante"],["[AZIONE:loadexp:v1-cap8-semaforo-pulsante]"],False,"Semaforo.",None),
    ("Spettabile assistente, potrebbe analizzare visivamente il mio elaborato circuitale?","vision",[],[],True,None,"Analisi visiva."),
    ("Gentilissimo, mi consenta di aggiungere un componente buzzer piezoelettrico","circuit",["buzzer-piezo"],[f'[INTENT:{intent_j("buzzer-piezo")}]'],False,"Buzzer.",None),
    ("La prego di predisporre l'ambiente di programmazione a blocchi Scratch","code",[],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],False,"Scratch.",None),
    ("Sarei lieto se potesse mostrarmi il monitor seriale","action",[],["[AZIONE:showserial]"],False,"Serial.",None),
    ("Le chiedo scusa per il disturbo, ma non riesco a comprendere il concetto di corrente elettrica","tutor",[],[],True,None,"Corrente elettrica."),
    ("Potrebbe per favore ripristinare la configurazione precedente?","action",[],["[AZIONE:undo]"],False,"Annullo.",None),
    ("Mi permetto di richiedere il posizionamento di un motore a corrente continua","circuit",["motor-dc"],[f'[INTENT:{intent_j("motor-dc")}]'],False,"Motore.",None),
    ("Vorrei cortesemente passare alla modalità di costruzione guidata","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("Con il massimo rispetto, Le chiedo di caricare il Volume 3","navigation",["volume_3"],["[AZIONE:openvolume:3:1]"],False,"Volume 3.",None),
    ("Se non è troppo disturbo, potrebbe spiegarmi cosa sia un condensatore?","tutor",["capacitor"],[],True,None,"Cos'è condensatore."),
    ("Distinto Galileo, La prego di inserire un servomotore nel circuito","circuit",["servo"],[f'[INTENT:{intent_j("servo")}]'],False,"Servo.",None),
    ("Avrei l'esigenza di comprendere la differenza tra circuito serie e parallelo","tutor",[],[],True,None,"Serie vs parallelo."),
    ("Onorevole assistente, sarebbe possibile visualizzare l'elenco dei componenti?","action",[],["[AZIONE:showbom]"],False,"BOM.",None),
    ("Le porgo i miei ossequi e Le chiedo di resettare il tutto","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("Con il Suo gentile consenso, desidererei esaminare il codice sorgente","code",[],["[AZIONE:openeditor]"],False,"Editor.",None),
]

gen_section(FORMAL, 7, 2)
print(f"  R: +Formale = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE S: LCD / BLOCKLY BLOCKS (200+)                   ║
# ╚════════════════════════════════════════════════════════════╝

LCD_BLOCKLY = [
    ("inizializza il display LCD","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_init block — inizializza LCD 16x2."),
    ("scrivi ciao sul display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_print block — scrivi testo."),
    ("lcd print hello","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_print 'hello'."),
    ("metti il cursore alla riga 2 colonna 0","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_set_cursor(0,1)."),
    ("pulisci il display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_clear block."),
    ("scrivi il valore del sensore sul display","code",["lcd16x2","potentiometer"],["[AZIONE:compile]"],True,None,"lcd_print con analogRead."),
    ("metti un LCD e scrivi temperatura","circuit",["lcd16x2"],[f'[INTENT:{intent_j("lcd16x2")}]'],True,None,"LCD + codice temperatura."),
    ("inizializza lcd a 16 colonne e 2 righe","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd.begin(16,2)."),
    ("cancella lo schermo del display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd.clear()."),
    ("scrivi sulla prima riga del display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_set_cursor(0,0) + print."),
    ("scrivi sulla seconda riga del display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_set_cursor(0,1) + print."),
    ("mostra il valore analogico sul LCD","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"analogRead → lcd_print."),
    ("blocco lcd init","code",["lcd16x2"],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],True,None,"Blockly lcd_init block."),
    ("blocco lcd stampa","code",["lcd16x2"],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],True,None,"Blockly lcd_print block."),
    ("blocco lcd cursore","code",["lcd16x2"],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],True,None,"Blockly lcd_set_cursor block."),
    ("blocco lcd cancella","code",["lcd16x2"],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],True,None,"Blockly lcd_clear block."),
    ("come uso i blocchi LCD in scratch","code",["lcd16x2"],[],True,None,"Spiegare blocchi LCD in Blockly."),
    ("programma il display con scratch","code",["lcd16x2"],["[AZIONE:openeditor]","[AZIONE:switcheditor:scratch]"],True,None,"Scratch + LCD."),
    ("display lcd non funziona","circuit",["lcd16x2"],["[AZIONE:diagnose]"],False,"Diagnosi LCD.",None),
    ("come collego il display","tutor",["lcd16x2"],[],True,None,"Collegamento LCD 16x2."),
    ("il display non mostra niente","circuit",["lcd16x2"],["[AZIONE:diagnose]"],False,"Diagnosi LCD.",None),
    ("scrivi ELAB sul display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"lcd_print 'ELAB'."),
    ("metti lcd e scrivi il mio nome","circuit",["lcd16x2"],[f'[INTENT:{intent_j("lcd16x2")}]'],True,None,"LCD + nome."),
    ("il blocchetto del display dove lo trovo in scratch","code",["lcd16x2"],[],True,None,"Categoria LCD in Blockly."),
    ("voglio fare un contatore sul display","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"Contatore su LCD."),
    ("aggiorna il display ogni secondo","code",["lcd16x2"],["[AZIONE:compile]"],True,None,"LCD + delay(1000)."),
    ("display mostra la temperatura dal sensore","code",["lcd16x2","photo-resistor"],["[AZIONE:compile]"],True,None,"LCD + sensore."),
    ("metti un lcd16x2","circuit",["lcd16x2"],[f'[INTENT:{intent_j("lcd16x2")}]'],False,"LCD.",None),
]

gen_section(LCD_BLOCKLY, 6, 3)
print(f"  S: +LCD/Blockly = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE T: BUILD MODE SWITCHING (200+)                   ║
# ╚════════════════════════════════════════════════════════════╝

BUILD_MODE = [
    ("metti già montato","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("modalità passo passo","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("modalità libera","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("voglio costruirlo io","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("fammi vedere il circuito finito","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("guidami passo per passo","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("switch a montato","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("switch a libero","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("passopasso","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("montato","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("libero","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("da montato a passo passo","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("da passo passo a libero","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("da libero a montato","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("come si cambia la modalità di costruzione","tutor",[],[],True,None,"Spiegare le 3 modalità build."),
    ("che differenza c'è tra montato e passo passo","tutor",[],[],True,None,"Montato vs passo passo."),
    ("non voglio seguire i passaggi, voglio farlo da solo","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("è troppo difficile, fammi vedere come deve venire","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("torna a passo passo che non ci capisco","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("fammi costruire da zero senza aiuto","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
    ("mostrami il risultato finale","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("la prof ha detto passo passo","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("la prof ha detto già montato","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("costruzione guidata","action",[],["[AZIONE:setbuildmode:passopasso]"],False,"Passo passo.",None),
    ("costruzione automatica","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("costruzione manuale","action",[],["[AZIONE:setbuildmode:libero]"],False,"Modo libero.",None),
]

gen_section(BUILD_MODE, 6, 3)
print(f"  T: +BuildMode = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE U: CHAINED EXPERIMENT SEQUENCES (300+)           ║
# ╚════════════════════════════════════════════════════════════╝

# Sequenze esperimento: "fai A poi B poi C"
EXP_CHAINS = [
    (["carica il primo circuito, poi il led rosso, poi il led bruciato",
      "voglio fare i 3 esperimenti del capitolo 6 in ordine",
      "inizia dal primo circuito e poi vai avanti coi LED"],
     "navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:loadexp:v1-cap6-primo-circuito]"],True,None,"Sequenza cap6 — 3 esperimenti."),

    (["dopo questo esperimento caricami il prossimo",
      "prossimo esperimento del capitolo",
      "vai al prossimo",
      "avanti con gli esperimenti"],
     "navigation",[],[],True,None,"Prossimo esperimento nella sequenza."),

    (["torna all'esperimento precedente",
      "l'esperimento di prima",
      "quello che avevo prima"],
     "navigation",[],[],True,None,"Esperimento precedente."),

    (["facciamo tutti gli esperimenti del volume 1",
      "inizia dal primo del volume 1",
      "voglio fare tutto il volume 1 dall'inizio"],
     "navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:openvolume:1:1]","[AZIONE:loadexp:v1-cap6-primo-circuito]"],True,None,"Inizio sequenza volume 1."),

    (["carica il semaforo e poi il semaforo con pulsante",
      "prima il semaforo semplice poi quello avanzato"],
     "navigation",["v1-cap6-primo-circuito","v1-cap8-semaforo-pulsante"],
     ["[AZIONE:loadexp:v1-cap8-semaforo-pulsante]"],True,None,"Sequenza semaforo."),

    (["facciamo prima il blink e poi il fade",
      "blink → fade → sos morse",
      "i primi tre del volume 3 in ordine"],
     "navigation",["v3-cap6-led-blink"],
     ["[AZIONE:loadexp:v3-cap6-led-blink]"],True,None,"Sequenza Vol3 cap6."),

    (["carica il mosfet base e poi il mosfet motore",
      "prima impariamo il mosfet poi lo usiamo col motore"],
     "navigation",["v2-cap8-mosfet-base"],
     ["[AZIONE:loadexp:v2-cap8-mosfet-base]"],True,None,"Sequenza MOSFET."),

    (["inizia dal rgb base, poi il mix, poi l'arcobaleno",
      "tutti gli esperimenti RGB in ordine"],
     "navigation",["v1-cap7-rgb-base"],
     ["[AZIONE:loadexp:v1-cap7-rgb-base]"],True,None,"Sequenza RGB."),

    (["ricomincia l'esperimento da capo e fallo in passo passo questa volta",
      "ricarica questo esperimento ma in passo passo"],
     "navigation",[],["[AZIONE:setbuildmode:passopasso]"],True,None,"Ricarica in passo passo."),

    (["quale esperimento mi consigli dopo questo",
      "qual è il prossimo logico",
      "cosa faccio dopo"],
     "tutor",[],[],True,None,"Consiglio esperimento successivo."),
]

gen_section_multi(EXP_CHAINS, 8, 3)
print(f"  U: +ExpChains = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE V: DOCENTE MODE (400+)                           ║
# ╚════════════════════════════════════════════════════════════╝
# Frasi tipiche di un DOCENTE che usa ELAB alla LIM

DOCENTE = [
    ("come spiego la corrente ai ragazzi","tutor",[],[],True,None,"Suggerimento didattico: analogia acqua."),
    ("preparami la lezione sul LED","tutor",["led"],[],True,None,"Preparazione lezione LED per docente."),
    ("cosa dico alla classe su questo esperimento","tutor",[],[],True,None,"Suggerimenti per spiegazione in classe."),
    ("carica l'esperimento e spiegami come presentarlo","navigation",[],[],True,None,"Vuole preparare la lezione."),
    ("fammi una lezione sul buzzer","tutor",["buzzer-piezo"],[],True,None,"Lezione guidata buzzer per docente."),
    ("quali domande mi faranno i ragazzi su questo argomento","tutor",[],[],True,None,"Anticipare domande studenti."),
    ("come rispondo se mi chiedono perché il LED ha bisogno della resistenza","tutor",["led","resistor"],[],True,None,"Risposta per studente curioso."),
    ("un alunno mi ha chiesto cos'è la corrente e non sapevo rispondere","tutor",[],[],True,None,"Spiegazione corrente per docente."),
    ("non so niente di elettronica ma devo fare la lezione","tutor",[],[],True,None,"Docente inesperto, guida completa."),
    ("ho solo 20 minuti, carica qualcosa di veloce","navigation",[],[],True,None,"Esperimento rapido per tempo limitato."),
    ("i ragazzi si annoiano, cosa posso fare di divertente","tutor",[],[],True,None,"Suggerimento attività coinvolgente."),
    ("fammi il quiz per la classe","action",[],["[AZIONE:quiz]"],False,"Quiz.",None),
    ("proietta l'esperimento sulla LIM","tutor",[],[],True,None,"Suggerire già montato su LIM."),
    ("metti l'esperimento già montato così lo mostro ai ragazzi","action",[],["[AZIONE:setbuildmode:montato]"],False,"Già montato.",None),
    ("carica il primo circuito per la classe","navigation",["v1-cap6-primo-circuito"],
     ["[AZIONE:loadexp:v1-cap6-primo-circuito]","[AZIONE:setbuildmode:montato]"],False,"Primo circuito per classe.",None),
    ("è la prima volta che uso questo programma, come funziona","tutor",[],[],True,None,"Onboarding docente."),
    ("come faccio a far lavorare i ragazzi in autonomia","tutor",[],[],True,None,"Modalità lavoro autonomo studenti."),
    ("un ragazzo ha bloccato tutto, come resetto","action",[],["[AZIONE:clearall]"],False,"Svuotato.",None),
    ("aiutami a capire come funziona la breadboard prima della lezione","tutor",["breadboard-half"],[],True,None,"Breadboard per docente."),
    ("prepara un percorso di 3 lezioni per la mia classe","tutor",[],[],True,None,"Programmazione didattica."),
    ("come valuto i ragazzi con ELAB","tutor",[],[],True,None,"Valutazione con ELAB."),
    ("un alunno DSA ha difficoltà, come lo aiuto","tutor",[],[],True,None,"Inclusione DSA."),
    ("la classe è rumorosa e non mi ascolta, aiutami a catturare l'attenzione","tutor",[],[],True,None,"Gestione classe + esperimento wow."),
    ("ho una supplenza e non so niente di tecnologia, cosa faccio","tutor",[],[],True,None,"Supplente senza competenze."),
    ("suggeriscimi un'analogia per spiegare il resistore","tutor",["resistor"],[],True,None,"Analogia resistore = strettoia."),
    ("suggeriscimi un'analogia per spiegare il condensatore","tutor",["capacitor"],[],True,None,"Analogia condensatore = secchio."),
    ("come spiego la legge di Ohm senza formule","tutor",[],[],True,None,"Ohm senza formule."),
    ("devo far fare un circuito a coppie, come organizzo","tutor",[],[],True,None,"Organizzazione lavoro a coppie."),
    ("quanto tempo ci vuole per fare questo esperimento","tutor",[],[],True,None,"Tempistica esperimento."),
    ("i ragazzi hanno finito l'esperimento, cosa faccio dopo","tutor",[],[],True,None,"Esperimento successivo."),
    ("carica qualcosa di spettacolare per la classe","navigation",[],[],True,None,"Esperimento wow."),
    ("come funziona la modalità detective per i ragazzi","tutor",[],[],True,None,"Spiegare gioco detective."),
    ("apri il detective per la classe","navigation",["detective"],["[AZIONE:opentab:detective]"],False,"Detective.",None),
    ("metti il POE per la classe","navigation",["poe"],["[AZIONE:opentab:poe]"],False,"POE.",None),
    ("cos'è questa modalità review","tutor",[],[],True,None,"Spiegare review mode."),
    ("fammi una lezione guidata completa sull'RGB LED","tutor",["rgb-led"],[],True,None,"Lezione completa RGB."),
    ("un ragazzo ha chiesto se si può prendere la scossa, cosa rispondo","tutor",[],[],True,None,"Sicurezza 5V."),
    ("devo fare l'open day e mostrare il progetto, cosa carico","navigation",[],[],True,None,"Demo open day."),
    ("il dirigente vuole vedere cosa facciamo, preparami qualcosa di bello","navigation",[],[],True,None,"Demo per dirigente."),
    ("uno studente ha collegato il LED al contrario, cosa gli dico","tutor",["led"],[],True,None,"Polarità LED + spiegazione."),
]

gen_section(DOCENTE, 7, 2)
print(f"  V: +Docente = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE W: QUANTITÀ NUMERICHE (300+)                     ║
# ╚════════════════════════════════════════════════════════════╝
# "metti N di X" con varianti numeriche

QUANTITIES = ["2","3","4","5","due","tre","quattro","cinque"]
COMP_FOR_QTY = [
    ("led",["LED","lucine","lucette","led","luci"]),
    ("resistor",["resistenze","resistori","resistenze da 220"]),
    ("push-button",["pulsanti","bottoni","tasti"]),
    ("buzzer-piezo",["buzzer","cicalini"]),
    ("capacitor",["condensatori","capacitori"]),
]
QTY_VERBS = ["metti","aggiungi","piazza","voglio","dammi","servono","mettimi"]

for _ in range(400):
    q = random.choice(QUANTITIES)
    n = int(q) if q.isdigit() else {"due":2,"tre":3,"quattro":4,"cinque":5}[q]
    comp_key, comp_names = random.choice(COMP_FOR_QTY)
    name = random.choice(comp_names)
    verb = random.choice(QTY_VERBS)
    phrase = f"{verb} {q} {name}"
    comps_list = [comp_key] * n
    add(corrupt(phrase, random.randint(0,3)), "circuit", [comp_key],
        [f'[INTENT:{intent_j(*comps_list)}]'], False, f"{n} {comp_key}.", None)

print(f"  W: +Quantities = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE X: CROSS-COMPONENT WIRING COMMANDS (300+)        ║
# ╚════════════════════════════════════════════════════════════╝

WIRE_CMDS = [
    ("collega il LED alla resistenza","circuit",["led","resistor"],["[AZIONE:addwire:led1:cathode:r1:pin1]"],False,"Collegati.",None),
    ("collega il pulsante al LED","circuit",["push-button","led"],["[AZIONE:addwire:btn1:pin2:led1:anode]"],False,"Collegati.",None),
    ("collega il buzzer al pin D9","circuit",["buzzer-piezo"],["[AZIONE:addwire:buzzer1:positive:W_D9]"],False,"Collegato.",None),
    ("collega il motore al mosfet","circuit",["motor-dc","mosfet-n"],["[AZIONE:addwire:motor1:positive:mosfet1:drain]"],False,"Collegati.",None),
    ("metti un filo dal LED al pin 13","circuit",["led"],["[AZIONE:addwire:led1:anode:W_D13]"],False,"Filo.",None),
    ("filo rosso dal 5V all'anodo","circuit",[],["[AZIONE:addwire:POWER_5V:led1:anode]"],False,"Filo.",None),
    ("collega tutto al GND","circuit",[],[],True,None,"Collegamento GND."),
    ("metti i fili come nel libro","circuit",[],[],True,None,"Fili come nel libro."),
    ("togli il filo rosso","circuit",[],["[AZIONE:removewire:0]"],False,"Filo rimosso.",None),
    ("togli tutti i fili","circuit",[],[],True,None,"Rimuovi tutti i fili."),
    ("collega il potenziometro ad A0","circuit",["potentiometer"],["[AZIONE:addwire:pot1:signal:W_A0]"],False,"Collegato.",None),
    ("collega il servo al pin 9","circuit",["servo"],["[AZIONE:addwire:servo1:signal:W_D9]"],False,"Collegato.",None),
    ("il filo va dal catodo al GND","circuit",[],["[AZIONE:addwire:led1:cathode:W_GND]"],False,"Filo.",None),
    ("filo giallo dal sensore ad A1","circuit",["photo-resistor"],["[AZIONE:addwire:ldr1:pin1:W_A1]"],False,"Collegato.",None),
    ("metti un filo tra il condensatore e la resistenza","circuit",["capacitor","resistor"],["[AZIONE:addwire:cap1:pin1:r1:pin2]"],False,"Collegati.",None),
    ("collega il display ai pin 7 8 9 10 11 12","circuit",["lcd16x2"],[],True,None,"Collegamento LCD multi-pin."),
]

gen_section(WIRE_CMDS, 7, 3)
print(f"  X: +WireCmds = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE Y: COMPONENT+ACTION COMBOS DINAMICHE (1000)      ║
# ╚════════════════════════════════════════════════════════════╝
# "metti COMP + fai AZIONE" combinazioni generate

COMP_ACTIONS = [
    ("play","[AZIONE:play]","e avvia"),
    ("compile","[AZIONE:compile]","e compila"),
    ("compile_play","[AZIONE:compile],[AZIONE:play]","compila e avvia"),
    ("diagnose","[AZIONE:diagnose]","e controlla"),
    ("quiz","[AZIONE:quiz]","e fammi il quiz"),
]

for _ in range(1500):
    comp = random.choice(COMPONENTS)
    comp_name = random.choice(COMP_SLANG.get(comp, [comp]))
    verb = random.choice(VERBS)
    action_key, action_tags, action_phrase = random.choice(COMP_ACTIONS)
    phrase = f"{verb} {comp_name} {action_phrase}"
    tags = [f'[INTENT:{intent_j(comp)}]'] + [f"[{t.strip()}]" if not t.startswith("[") else t for t in action_tags.split(",")]
    # Clean up tags
    clean_tags = [f'[INTENT:{intent_j(comp)}]']
    for t in action_tags.split(","):
        t = t.strip()
        if not t.startswith("["):
            t = f"[{t}]"
        clean_tags.append(t)
    add(corrupt(phrase, random.randint(0,3)), "circuit", [comp], clean_tags, False, f"{comp} + azione.", None)

print(f"  Y: +CompActionCombo = {len(examples)}")

# ╔════════════════════════════════════════════════════════════╗
# ║  SEZIONE Z: DOMANDE SU CONCETTI SPECIFICI (300+)          ║
# ╚════════════════════════════════════════════════════════════╝

CONCEPT_QS = [
    ("cos'è la tensione","tutor",[],[],True,None,"Tensione = pressione acqua."),
    ("cos'è la corrente","tutor",[],[],True,None,"Corrente = flusso acqua."),
    ("cos'è la resistenza","tutor",["resistor"],[],True,None,"Resistenza = strettoia."),
    ("cos'è un circuito","tutor",[],[],True,None,"Circuito = percorso chiuso."),
    ("cos'è la breadboard","tutor",["breadboard-half"],[],True,None,"Breadboard = basetta prototipi."),
    ("cos'è un LED","tutor",["led"],[],True,None,"LED = Light Emitting Diode."),
    ("cos'è Arduino","tutor",["nano-r4-board"],[],True,None,"Arduino = microcontrollore."),
    ("cos'è il codice","tutor",[],[],True,None,"Codice = istruzioni per Arduino."),
    ("cos'è void setup","code",[],[],True,None,"setup() = inizializzazione."),
    ("cos'è void loop","code",[],[],True,None,"loop() = ciclo infinito."),
    ("cos'è pinMode","code",[],[],True,None,"pinMode = configura pin."),
    ("cos'è digitalWrite","code",[],[],True,None,"digitalWrite = accendi/spegni."),
    ("cos'è analogRead","code",[],[],True,None,"analogRead = leggi sensore."),
    ("cos'è analogWrite","code",[],[],True,None,"analogWrite = PWM."),
    ("cos'è il PWM","tutor",[],[],True,None,"PWM = impulsi rapidi."),
    ("cos'è il GND","tutor",[],[],True,None,"GND = polo negativo."),
    ("cos'è il 5V","tutor",[],[],True,None,"5V = alimentazione."),
    ("cos'è un pin digitale","tutor",[],[],True,None,"Pin digitale = ON/OFF."),
    ("cos'è un pin analogico","tutor",[],[],True,None,"Pin analogico = 0-1023."),
    ("cos'è un filo","tutor",["wire"],[],True,None,"Filo = conduttore."),
    ("cos'è un condensatore","tutor",["capacitor"],[],True,None,"Condensatore = accumula carica."),
    ("cos'è un MOSFET","tutor",["mosfet-n"],[],True,None,"MOSFET = interruttore elettronico."),
    ("cos'è un servomotore","tutor",["servo"],[],True,None,"Servo = motore di precisione."),
    ("cos'è un potenziometro","tutor",["potentiometer"],[],True,None,"Potenziometro = resistenza variabile."),
    ("cos'è un diodo","tutor",["diode"],[],True,None,"Diodo = senso unico."),
    ("cos'è un buzzer","tutor",["buzzer-piezo"],[],True,None,"Buzzer = cicalino sonoro."),
    ("cos'è il serial monitor","tutor",[],[],True,None,"Serial = comunicazione Arduino-PC."),
    ("cos'è Scratch","code",[],[],True,None,"Scratch = programmazione a blocchi."),
    ("cos'è la compilazione","code",[],[],True,None,"Compilazione = traduzione codice."),
    ("che differenza c'è tra serie e parallelo","tutor",[],[],True,None,"Serie = uno dopo l'altro."),
    ("che differenza c'è tra digitale e analogico","tutor",[],[],True,None,"Digitale ON/OFF, Analogico graduale."),
    ("che differenza c'è tra input e output","tutor",[],[],True,None,"Input = legge, Output = scrive."),
    ("che differenza c'è tra Arduino e Scratch","code",[],[],True,None,"Arduino C++ vs blocchi visuali."),
    ("perché il LED ha bisogno della resistenza","tutor",["led","resistor"],[],True,None,"Limita corrente, protegge LED."),
    ("perché il circuito deve essere chiuso","tutor",[],[],True,None,"Corrente circola solo in circuito chiuso."),
    ("come funziona un pulsante","tutor",["push-button"],[],True,None,"Pulsante = interruttore momentaneo."),
    ("come funziona un fotoresistore","tutor",["photo-resistor"],[],True,None,"LDR = resistenza varia con luce."),
    ("come funziona un reed switch","tutor",["reed-switch"],[],True,None,"Reed = interruttore magnetico."),
    ("la legge di Ohm","tutor",[],[],True,None,"V = I × R."),
    ("a cosa serve delay","code",[],[],True,None,"delay(ms) = aspetta millisecondi."),
]

gen_section(CONCEPT_QS, 6, 3)
print(f"  Z: +Concepts = {len(examples)}")

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

output_file = Path(__file__).parent / "galileo-brain-extreme-10k.jsonl"
with open(output_file, "w", encoding="utf-8") as f:
    for ex in unique:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")

print(f"\n{'='*60}")
print(f"✅ Dataset EXTREME v2: {len(unique)} esempi unici")
print(f"   (rimossi {len(examples) - len(unique)} duplicati su {len(examples)} generati)")
print(f"   File: {output_file}")
print(f"   Size: {output_file.stat().st_size / 1e6:.1f} MB")

from collections import Counter
intents = Counter(json.loads(ex["messages"][2]["content"])["intent"] for ex in unique)
print(f"\n   Intent:")
for i, c in intents.most_common():
    print(f"     {i}: {c} ({c/len(unique)*100:.1f}%)")

nl = sum(1 for ex in unique if json.loads(ex["messages"][2]["content"])["needs_llm"])
print(f"\n   needs_llm=true: {nl} ({nl/len(unique)*100:.1f}%)")
ms = sum(1 for ex in unique if len(json.loads(ex["messages"][2]["content"])["actions"])>1)
print(f"   Multi-step (>1 azione): {ms} ({ms/len(unique)*100:.1f}%)")
