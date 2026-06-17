#!/usr/bin/env python3
"""
Augmentation Engine for Galileo Brain Dataset Factory.
Massive linguistic variety: dialects, synonyms, reformulations, long confused messages.
"""
import random
import re

# ============================================================
# ITALIAN DIALECTS / REGIONAL EXPRESSIONS
# ============================================================
DIALECT_TRANSFORMS = {
    # Romano
    "romano": {
        "cosa": "che",
        "come": "come",
        "fare": "fa'",
        "questo": "sto",
        "quella": "quella",
        "non": "nun",
        "adesso": "mo",
        "subito": "de botto",
        "molto": "un botto",
        "bene": "bbene",
        "tutto": "tutto",
        "fammi": "famme",
        "dimmi": "dimme",
        "metti": "metti",
        "togli": "leva",
        "perche": "perche'",
        "voglio": "vojo",
        "devo": "devo",
        "puoi": "poi",
        "fallo": "fallo",
        "guarda": "guarda",
        "aiutami": "aiutame",
        "spiegami": "spiegame",
    },
    # Napoletano
    "napoletano": {
        "cosa": "che",
        "come": "comme",
        "fare": "fa'",
        "questo": "chist",
        "non": "nun",
        "adesso": "mo",
        "molto": "assaje",
        "bene": "buono",
        "fammi": "famme",
        "dimmi": "dimme",
        "metti": "miette",
        "togli": "leva",
        "voglio": "voglio",
        "guarda": "uarda",
        "aiutami": "aiutame",
        "capire": "capi'",
    },
    # Milanese / Nord
    "milanese": {
        "cosa": "cosa",
        "come": "come",
        "questo": "sto",
        "non": "minga",
        "adesso": "adess",
        "molto": "un casino",
        "bene": "ben",
        "tutto": "tutt",
        "fammi": "famm",
        "guarda": "guarda",
        "capire": "capire",
    },
    # Siciliano
    "siciliano": {
        "cosa": "chi",
        "come": "comu",
        "fare": "fari",
        "questo": "chistu",
        "non": "nun",
        "adesso": "ora",
        "molto": "assai",
        "bene": "bonu",
        "fammi": "fammi",
        "dimmi": "dimmi",
        "metti": "metti",
        "togli": "leva",
        "voglio": "vogghiu",
        "guarda": "talìa",
        "aiutami": "aiutami",
    },
    # Toscano
    "toscano": {
        "cosa": "icche",
        "come": "come",
        "la": "la",
        "il": "ir",
        "non": "un",
        "niente": "nulla",
        "molto": "tanto",
        "bene": "bene",
        "fare": "fare",
        "capire": "capire",
    },
}

def apply_dialect(text: str, dialect: str, rng: random.Random) -> str:
    """Apply a regional dialect transformation to text."""
    if dialect not in DIALECT_TRANSFORMS:
        return text
    transforms = DIALECT_TRANSFORMS[dialect]
    words = text.split()
    result = []
    for w in words:
        w_lower = w.lower().rstrip("?!.,;:")
        punct = w[len(w_lower):] if len(w_lower) < len(w) else ""
        if w_lower in transforms and rng.random() < 0.6:
            result.append(transforms[w_lower] + punct)
        else:
            result.append(w)
    return " ".join(result)

# ============================================================
# SYNONYM BANK — verbs, nouns, expressions
# ============================================================
VERB_SYNONYMS = {
    "avvia": ["avvia", "fai partire", "metti in moto", "attiva", "lancia", "accendi", "starta", "inizia", "esegui", "runna", "premi play", "dai il via", "fa' andare"],
    "ferma": ["ferma", "stoppa", "blocca", "metti in pausa", "congela", "freezza", "sospendi", "arresta", "interrompi", "hold", "frena"],
    "resetta": ["resetta", "azzera", "ripristina", "riavvia", "reimposta", "rimetti a zero", "ricomincia", "riporta all'inizio", "reinizializza"],
    "pulisci": ["pulisci", "svuota", "cancella", "elimina", "togli", "rimuovi", "spazza via", "butta via", "fai piazza pulita", "sgombra", "libera"],
    "compila": ["compila", "builda", "verifica", "controlla", "testa", "prova", "esegui il build", "fai il check", "manda al compilatore", "processa"],
    "aggiungi": ["aggiungi", "metti", "inserisci", "piazza", "posiziona", "appoggia", "infila", "ficca", "sistema", "colloca", "disponi", "posa"],
    "togli": ["togli", "rimuovi", "elimina", "cancella", "leva", "butta", "porta via", "fai sparire", "disintegra"],
    "collega": ["collega", "connetti", "unisci", "attacca", "metti un filo", "cabla", "wira", "fai il collegamento", "congiungi", "linka"],
    "sposta": ["sposta", "muovi", "trascina", "trasferisci", "porta", "ridisponi", "riposiziona", "rimetti"],
    "mostra": ["mostra", "fammi vedere", "visualizza", "fai apparire", "apri", "presenta", "esponi", "rivela", "fai comparire"],
    "spiega": ["spiega", "dimmi", "raccontami", "illustrami", "chiariscimi", "fammi capire", "parlami di", "descrivi", "insegnami"],
    "guarda": ["guarda", "osserva", "controlla", "esamina", "analizza", "ispeziona", "scruta", "dai un'occhiata", "verifica visivamente"],
    "carica": ["carica", "apri", "metti", "seleziona", "vai a", "porta su", "tira su", "prendi"],
    "evidenzia": ["evidenzia", "illumina", "sottolinea", "indica", "segna", "marca", "cerchia", "fai brillare", "metti in risalto"],
    "misura": ["misura", "calcola", "leggi", "rileva", "determina", "controlla il valore", "dimmi quanto"],
}

NOUN_SYNONYMS = {
    "simulazione": ["simulazione", "sim", "esecuzione", "esperimento", "prova", "test", "circuito"],
    "circuito": ["circuito", "schema", "progetto", "montaggio", "assemblaggio", "creazione", "lavoro"],
    "componente": ["componente", "pezzo", "parte", "elemento", "oggetto", "cosa", "coso", "aggeggio", "roba"],
    "breadboard": ["breadboard", "basetta", "piastra", "tavola", "tavoletta", "basettina", "la board"],
    "codice": ["codice", "programma", "sketch", "software", "script", "listato", "programmino", "istruzioni"],
    "editor": ["editor", "editore", "finestra del codice", "pannello codice", "area di programmazione", "dove si scrive"],
    "errore": ["errore", "sbaglio", "problema", "bug", "difetto", "malfunzionamento", "casino", "guaio", "pasticcio"],
    "filo": ["filo", "cavo", "cavetto", "collegamento", "connessione", "link", "ponte", "jumper", "filo elettrico"],
    "valore": ["valore", "numero", "parametro", "impostazione", "setting", "dato", "cifra"],
    "pin": ["pin", "piedino", "contatto", "terminale", "connettore", "attacco", "punto di connessione"],
    "esperimento": ["esperimento", "esercizio", "attivita", "prova", "laboratorio", "lab", "lezione pratica"],
    "manuale": ["manuale", "libro", "guida", "istruzioni", "documentazione", "dispensa", "testo"],
}

def synonym_replace(text: str, rng: random.Random, intensity: float = 0.3) -> str:
    """Replace words with synonyms at given intensity."""
    words = text.split()
    result = []
    for w in words:
        w_lower = w.lower().rstrip("?!.,;:")
        punct = w[len(w_lower):] if len(w_lower) < len(w) else ""
        replaced = False
        if rng.random() < intensity:
            for key, syns in VERB_SYNONYMS.items():
                if w_lower == key or w_lower in syns:
                    result.append(rng.choice(syns) + punct)
                    replaced = True
                    break
            if not replaced:
                for key, syns in NOUN_SYNONYMS.items():
                    if w_lower == key or w_lower in syns:
                        result.append(rng.choice(syns) + punct)
                        replaced = True
                        break
        if not replaced:
            result.append(w)
    return " ".join(result)

# ============================================================
# SENTENCE REFORMULATION TEMPLATES
# ============================================================
REFORMULATION_PATTERNS = [
    # Question forms
    ("^(.+)$", "come faccio a {0}?"),
    ("^(.+)$", "si puo' {0}?"),
    ("^(.+)$", "e' possibile {0}?"),
    ("^(.+)$", "riesci a {0}?"),
    ("^(.+)$", "mi aiuti a {0}?"),
    ("^(.+)$", "potresti {0}?"),
    ("^(.+)$", "sapresti {0}?"),
    ("^(.+)$", "ti dispiace {0}?"),
    ("^(.+)$", "non so come {0}, me lo fai tu?"),
    ("^(.+)$", "scusa ma come si fa a {0}?"),

    # Command forms
    ("^(.+)$", "per favore {0}"),
    ("^(.+)$", "{0} subito"),
    ("^(.+)$", "{0} quando puoi"),
    ("^(.+)$", "dai {0}"),
    ("^(.+)$", "su {0}"),
    ("^(.+)$", "forza {0}"),
    ("^(.+)$", "eddai {0}"),

    # Padded / hesitant
    ("^(.+)$", "allora... {0}"),
    ("^(.+)$", "ehm... {0}"),
    ("^(.+)$", "senti una cosa... {0}"),
    ("^(.+)$", "scusa se ti disturbo ma {0}"),
    ("^(.+)$", "non vorrei sbagliare ma {0}"),
    ("^(.+)$", "forse devo {0}? non sono sicuro"),
    ("^(.+)$", "secondo te devo {0}?"),
    ("^(.+)$", "il libro dice di {0} ma non so come"),
]

def reformulate(text: str, rng: random.Random) -> str:
    """Apply a random reformulation pattern."""
    if rng.random() > 0.4:
        return text
    pattern = rng.choice(REFORMULATION_PATTERNS)
    return pattern[1].format(text)

# ============================================================
# LONG CONFUSED MESSAGES — Prof inesperto & Bambino
# ============================================================
LONG_CONFUSED_TEMPLATES = [
    # Prof inesperto — primo giorno
    "salve sono {prof_name} insegno {materia} alla scuola {scuola} e la preside mi ha detto di usare questo simulatore per le ore di STEM ma io non ho mai fatto elettronica in vita mia e non so neanche da dove si comincia potete aiutarmi a capire come funziona questa cosa?",
    "buongiorno sono un insegnante di {materia} e vorrei usare il vostro simulatore con la mia classe di {classe} ma non capisco bene come si fa a {azione} potete spiegarmi passo passo come se fossi un bambino di 5 anni?",
    "scusate io sono una professoressa di {materia} e mi hanno chiesto di fare un progetto STEM con i ragazzi usando questo simulatore ma non so nemmeno cos'e' un {componente} cioe' l'ho visto sul libro ma non ho mai toccato un circuito vero in vita mia come faccio?",
    "allora io ho provato a fare l'esperimento {esp_num} del volume {vol} ma non mi funziona niente cioe' ho messo tutti i pezzi dove dice il libro ma quando premo avvia non succede nulla e i ragazzi mi guardano e io non so cosa dire aiutatemi",
    "buonasera sono il prof {prof_name} e sto cercando di preparare una lezione sui circuiti per domani mattina ma non riesco a far funzionare il simulatore cioe' ho aperto la pagina e vedo la breadboard ma non so come si aggiungono i componenti e come si collegano i fili mi potete dare una mano veloce?",

    # Bambino confuso
    "prof io ho messo la lucina e il resistore come dice il libro ma poi quando faccio andare la simulazione non si accende e non capisco perche' cioe' i fili li ho messi ma forse sono nel posto sbagliato?",
    "scusa galileo ma io volevo fare il circuito con {comp1} e {comp2} ma non trovo dove si mettono i fili e poi il mio compagno dice che devo mettere anche {comp3} ma sul libro non c'e' chi ha ragione?",
    "allora io stavo facendo l'esperimento del {esperimento} e praticamente ho fatto tutto quello che diceva il libro cioe' ho messo {comp1} e poi {comp2} e ho collegato i fili ma quando premo il pulsante non succede niente e non so se ho sbagliato i fili o se manca qualcosa",
    "galileo io non capisco niente di questa cosa cioe' cos'e' un {componente}? a che serve? perche' devo metterlo? il prof ha detto di farlo ma io non ho capito il motivo",
    "ma scusa io ho fatto l'esperimento e funzionava tutto bene poi ho chiuso e riaperto e adesso non c'e' piu' niente come faccio a ritrovare il mio circuito?",

    # Genitore che aiuta il figlio
    "buonasera sono la mamma di {nome_studente} e mio figlio deve fare i compiti di tecnologia usando questo simulatore ma non riesce a far funzionare il circuito del LED potete aiutarci? lui dice che ha collegato tutto bene ma la lucina non si accende",
    "salve il mio ragazzo deve completare un esercizio per scuola con il simulatore di circuiti ma non sa come si fa a {azione} io ci ho provato ma non ci capisco niente neanche io potete spiegarci?",

    # Prof che fa domande strane
    "senta ma questo simulatore si puo' usare anche senza Internet? cioe' i ragazzi a casa hanno tutti una connessione diversa e alcuni sono molto lenti funziona lo stesso?",
    "ma se io faccio vedere il simulatore sulla LIM e un ragazzo fa il circuito sbagliato si brucia qualcosa? cioe' nel simulatore ovviamente non nella realta'",
    "posso usare questo strumento per la prova invalsi di tecnologia? cioe' i ragazzi possono fare i circuiti come prova pratica?",
    "ma i componenti del kit reale corrispondono esattamente a quelli del simulatore? cioe' se faccio l'esperimento 1 nel simulatore e poi i ragazzi lo fanno col kit vero viene uguale?",

    # SUPER LUNGHI — prof inesperto che racconta la vita
    "buongiorno mi chiamo {prof_name} e insegno {materia} alla {scuola} da {anno} anni e quest'anno la preside mi ha chiesto di integrare le attivita STEM nel curricolo e io ho pensato di usare il vostro simulatore di circuiti perche' l'ho visto su internet e mi sembrava adatto ai ragazzi della mia {classe} che sono circa 25 e hanno livelli molto diversi cioe' ci sono alcuni che sono bravissimi col computer e altri che non sanno neanche accendere il tablet quindi volevo chiedervi se c'e' un modo per differenziare le attivita e se avete suggerimenti su come organizzare le lezioni in modo che tutti possano partecipare anche quelli piu' in difficolta' grazie mille",
    "allora io sto cercando di fare l'esperimento numero {esp_num} del volume {vol} e praticamente ho aperto il simulatore e ho messo la {comp1} sulla breadboard e poi ho messo anche il {comp2} e ho provato a collegare i fili come dice il libro ma non sono sicuro di aver capito bene perche' il libro dice di collegare il pin positivo alla riga rossa ma io non vedo una riga rossa sulla breadboard del simulatore e poi dice di mettere il resistore in serie ma io non so cosa vuol dire in serie cioe' vicini? attaccati? aiutatemi che domani devo farlo fare ai ragazzi e non posso fare brutta figura",
    "buonasera scusate il disturbo ma io sono il papa' di {nome_studente} che frequenta la {classe} alla scuola {scuola} e la professoressa {prof_name} gli ha assegnato un compito da fare a casa usando questo simulatore di circuiti e il ragazzo dice che non riesce a far funzionare niente e io ci ho provato ad aiutarlo ma sinceramente non ci capisco nulla di elettronica cioe' io faccio il {mestiere} nella vita e queste cose non le ho mai studiate potete per cortesia spiegarci passo passo come si fa l'esercizio che deve consegnare per lunedi'?",
    "ciao galileo io sono {nome_studente} e sto in {classe} e devo fare un progetto di tecnologia usando il simulatore e la prof ci ha detto di costruire un circuito con {comp1} e {comp2} e {comp3} e poi di farlo funzionare e poi di scrivere una relazione su come funziona ma io non ho capito quasi niente della lezione perche' stavo seduto in fondo e non sentivo bene e poi il mio compagno di banco mi disturbava continuamente e adesso devo fare tutto da solo a casa e non so da dove partire mi puoi aiutare dall'inizio per favore?",
    "salve sono un'insegnante di sostegno e seguo un ragazzo con DSA nella classe di tecnologia e il collega sta usando il vostro simulatore per le lezioni sui circuiti e il ragazzo ha difficolta' a seguire i passaggi perche' sono troppo veloci e le scritte sono piccole volevo sapere se c'e' un modo per rallentare la simulazione e ingrandire i componenti e magari avere delle istruzioni vocali o comunque piu' semplificate perche' il ragazzo e' molto motivato ma si frustra quando non riesce a seguire il ritmo degli altri",
    "prof io e il mio gruppo dobbiamo presentare il progetto finale alla classe e abbiamo scelto di fare un circuito con il semaforo usando i tre LED rosso giallo e verde e Arduino ma non sappiamo come scrivere il codice cioe' abbiamo provato a copiare quello del libro ma ci da errore e non capiamo cosa vuol dire l'errore e poi dobbiamo anche fare la presentazione in PowerPoint e il video e non ci resta molto tempo perche' la scadenza e' venerdi' potete aiutarci a far funzionare almeno il codice?",
]

MESTIERI = ["muratore", "idraulico", "commerciante", "impiegato", "autista", "cuoco", "meccanico", "elettricista", "infermiere", "avvocato"]
ANNI = ["5", "10", "15", "20", "25", "30"]

PROF_NAMES = ["Rossi", "Bianchi", "Russo", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti"]
MATERIE = ["tecnologia", "scienze", "matematica", "matematica e scienze", "fisica", "informatica", "arte e tecnologia", "STEM"]
SCUOLE = ["media Garibaldi", "media Manzoni", "media Dante", "media Leopardi", "media Verdi", "comprensivo Kennedy", "comprensivo Europa", "paritaria San Giuseppe", "media statale Volta", "IC Montessori"]
CLASSI = ["prima media", "seconda media", "terza media", "quinta elementare", "prima superiore", "quarta elementare"]
NOMI_STUDENTI = ["Marco", "Giulia", "Alessandro", "Sofia", "Lorenzo", "Emma", "Matteo", "Chiara", "Luca", "Anna", "Francesco", "Sara", "Andrea", "Martina", "Davide", "Elena", "Tommaso", "Giorgia", "Riccardo", "Valentina"]

def generate_long_confused(rng: random.Random, comp_names: dict) -> str:
    """Generate a long confused message from templates."""
    template = rng.choice(LONG_CONFUSED_TEMPLATES)

    active_comps = [k for k in comp_names.keys() if k not in ("wire", "breadboard-full", "breadboard-half", "battery9v", "nano-r4")]

    comp1 = rng.choice(comp_names.get(rng.choice(active_comps), {}).get("it", ["LED"]))
    comp2 = rng.choice(comp_names.get(rng.choice(active_comps), {}).get("it", ["resistore"]))
    comp3 = rng.choice(comp_names.get(rng.choice(active_comps), {}).get("it", ["buzzer"]))
    componente = rng.choice(comp_names.get(rng.choice(active_comps), {}).get("it", ["condensatore"]))

    azioni = ["aggiungere i componenti", "collegare i fili", "avviare la simulazione",
              "scrivere il codice", "compilare il programma", "cambiare esperimento",
              "usare il potenziometro", "far suonare il buzzer", "misurare la tensione"]

    esperimenti = ["LED", "LED con resistore", "semaforo", "buzzer con pulsante",
                   "dimmer con potenziometro", "RGB", "motore", "servo"]

    msg = template.format(
        prof_name=rng.choice(PROF_NAMES),
        materia=rng.choice(MATERIE),
        scuola=rng.choice(SCUOLE),
        classe=rng.choice(CLASSI),
        nome_studente=rng.choice(NOMI_STUDENTI),
        comp1=comp1, comp2=comp2, comp3=comp3,
        componente=componente,
        azione=rng.choice(azioni),
        esperimento=rng.choice(esperimenti),
        esp_num=rng.randint(1, 6),
        vol=rng.randint(1, 3),
        anno=rng.choice(ANNI) if "{anno}" in template else "10",
        mestiere=rng.choice(MESTIERI) if "{mestiere}" in template else "impiegato",
    )
    return msg

# ============================================================
# TYPO ENGINE — more realistic
# ============================================================
KEYBOARD_NEIGHBORS = {
    'q': 'wa', 'w': 'qeas', 'e': 'wrds', 'r': 'etfs', 't': 'rygf',
    'y': 'tuhg', 'u': 'yijh', 'i': 'uokj', 'o': 'iplk', 'p': 'ol',
    'a': 'qwsz', 's': 'awedxz', 'd': 'serfcx', 'f': 'drtgvc',
    'g': 'ftyhbv', 'h': 'gyujnb', 'j': 'huiknm', 'k': 'jiolm',
    'l': 'kop', 'z': 'asx', 'x': 'zsdc', 'c': 'xdfv',
    'v': 'cfgb', 'b': 'vghn', 'n': 'bhjm', 'm': 'njk',
}

COMMON_TYPOS = {
    "simulazione": ["simulazone", "siulazione", "simulazzione", "simualzione", "simulasione", "simulaxione"],
    "resistore": ["resistroe", "reisstore", "resistor", "resitore", "rsistore"],
    "componente": ["componenete", "componnte", "conponente", "compoente", "componemte"],
    "potenziometro": ["potenziomerto", "potenziomentro", "poteniometro", "potenziometero"],
    "condensatore": ["condesatore", "condensatroe", "condnesatore", "condensatre"],
    "breadboard": ["bredboard", "breadbord", "breadboadr", "bredboard", "braedboard"],
    "collegamento": ["collegamneto", "collegaemnto", "colegamento", "collegamnto"],
    "esperimento": ["esperimeno", "esperiemnto", "esprimento", "espermento"],
    "pulsante": ["pulsnte", "pusante", "pulsanre", "pulsamte"],
    "collegare": ["colegare", "collegrae", "collagare", "colelgare"],
    "aggiungere": ["aggiunegre", "aggiugnere", "agiungere", "aggiungeer"],
    "avviare": ["avvirae", "avvaire", "aviare", "avvirae"],
    "compila": ["complila", "commpila", "copila", "complia"],
    "circuito": ["circuiot", "circutio", "circuio", "ciruito"],
}

def add_realistic_typo(text: str, rng: random.Random, intensity: float = 0.15) -> str:
    """Add realistic typos — keyboard proximity + common misspellings."""
    if rng.random() > intensity:
        return text

    words = text.split()
    if len(words) < 2:
        return text

    # Try common typo replacement first
    for i, w in enumerate(words):
        w_lower = w.lower()
        if w_lower in COMMON_TYPOS and rng.random() < 0.5:
            words[i] = rng.choice(COMMON_TYPOS[w_lower])
            return " ".join(words)

    # Keyboard proximity typo
    idx = rng.randint(0, len(words) - 1)
    word = words[idx]
    if len(word) < 3:
        return text

    char_idx = rng.randint(1, len(word) - 1)
    ch = word[char_idx].lower()
    if ch in KEYBOARD_NEIGHBORS:
        replacement = rng.choice(KEYBOARD_NEIGHBORS[ch])
        word = word[:char_idx] + replacement + word[char_idx+1:]
        words[idx] = word

    return " ".join(words)

# ============================================================
# MEGA AUGMENTATION — combines everything
# ============================================================
PREFIXES_EXTENDED = [
    "", "", "", "", "", "", "",  # High weight for no prefix
    "senti ", "ehi ", "scusa ", "ok ", "allora ", "dai ",
    "per favore ", "perfavore ", "puoi ", "potresti ",
    "mi sai dire ", "dimmi ", "fammi ", "vorrei ",
    "ho bisogno che tu ", "mi serve che ", "prova a ",
    "come faccio a ", "dove trovo ", "si puo' ",
    "e' possibile ", "riesci a ", "ma ", "e se ",
    "prof ", "galileo ", "aiutami a ", "prova ",
    "volevo chiederti ", "una domanda: ",
    "scusami ma ", "non so come si fa a ",
    "ho un problema: ", "ti chiedo una cosa: ",
    "ma scusa ", "senta ", "senti un po' ",
    "aspetta ", "oh ", "oi ", "hey ", "yo ",
    "comunque ", "tra l'altro ", "a proposito ",
    "vabbe' ", "niente ", "bo ", "mah ",
    "cioe' ", "tipo ", "praticamente ",
    "dottore ", "ingegnere ", "maestro ",
    "caro galileo ", "gentile assistente ",
    "una curiosita': ", "domandina veloce: ",
    "urgente: ", "AIUTO ", "SOS ",
    "raga ", "fra ", "bro ",
]

SUFFIXES_EXTENDED = [
    "", "", "", "", "", "",  # High weight for no suffix
    "?", " per favore", " grazie", " dai", " pls",
    " perfavore", " se puoi", " quando puoi",
    "? non ho capito bene", " aiutami", " help",
    " e' urgente", " veloce", "!!!", " subito",
    "? grazie mille", " ti prego", " pleeease",
    " ok?", " va bene?", " capito?",
    " ...non so se mi spiego",
    " (se non e' troppo disturbo)",
    " mi raccomando", " e' importante",
    " please", " thx", " thank you",
    " lol", " ahaha", " xD",
    " <3", " :)", " :D",
    "? dimmi", " rispondimi", " aspetto",
    "? cioe' non ho capito", "? boh",
]

FILLER_PHRASES_EXTENDED = [
    "praticamente", "in pratica", "cioe'", "tipo",
    "come dire", "ecco", "insomma", "diciamo",
    "fondamentalmente", "sostanzialmente",
    "a dire il vero", "sinceramente",
    "non so se mi spiego", "capisci?",
    "sai", "vedi", "guarda", "senti",
    "come posso dire", "mi spiego",
    "in poche parole", "per farla breve",
    "tra virgolette", "per cosi' dire",
    "oddio", "mamma mia", "madonna",
    "figurati", "vabbe'", "niente",
    "aspetta che ci penso", "fammi pensare",
    "ehm", "uhm", "mmm", "boh", "mah",
]

def mega_augment(base: str, rng: random.Random, force_long: bool = False) -> str:
    """
    Apply maximum augmentation:
    1. Synonym replacement
    2. Dialect (20% chance)
    3. Reformulation (30% chance)
    4. Prefix/suffix
    5. Filler words
    6. Typos (15% chance)
    7. Case variation
    8. Repetition/emphasis (10% chance)
    """
    text = base

    # 1. Synonym replacement (30%)
    if rng.random() < 0.3:
        text = synonym_replace(text, rng, intensity=0.3)

    # 2. Dialect (20%)
    if rng.random() < 0.2:
        dialect = rng.choice(list(DIALECT_TRANSFORMS.keys()))
        text = apply_dialect(text, dialect, rng)

    # 3. Reformulation (30%)
    if rng.random() < 0.3:
        text = reformulate(text, rng)

    # 4. Random case
    case_roll = rng.random()
    if case_roll < 0.25:
        text = text.lower()
    elif case_roll < 0.3:
        text = text.upper()
    elif case_roll < 0.35:
        text = text.capitalize()

    # 5. Filler words (25% chance, more if force_long)
    filler_chance = 0.4 if force_long else 0.25
    if rng.random() < filler_chance:
        filler = rng.choice(FILLER_PHRASES_EXTENDED)
        words = text.split()
        if len(words) > 2:
            pos = rng.randint(1, len(words) - 1)
            words.insert(pos, filler)
            text = " ".join(words)
    # Second filler for long messages
    if force_long and rng.random() < 0.3:
        filler2 = rng.choice(FILLER_PHRASES_EXTENDED)
        words = text.split()
        if len(words) > 3:
            pos = rng.randint(2, len(words) - 1)
            words.insert(pos, filler2)
            text = " ".join(words)

    # 6. Prefix/suffix
    text = rng.choice(PREFIXES_EXTENDED) + text + rng.choice(SUFFIXES_EXTENDED)

    # 7. Typos (15%)
    text = add_realistic_typo(text, rng, intensity=0.15)

    # 8. Repetition/emphasis (10%)
    if rng.random() < 0.1:
        words = text.split()
        if len(words) > 3:
            emphasis = rng.choice(["dai dai", "su su", "no no", "si si",
                                   "aspetta aspetta", "ecco ecco",
                                   "cioe cioe", "ma ma",
                                   "help help", "sos sos"])
            words.insert(0, emphasis)
            text = " ".join(words)

    return text.strip()
