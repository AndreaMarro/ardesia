#!/usr/bin/env python3
"""
Generate v9 YAML sections using yaml.dump() — NEVER manual YAML.
Creates 10 new sections for the Galileo Brain v9 dataset.
"""
import yaml
import os

SECTIONS_DIR = os.path.join(os.path.dirname(__file__), "configs", "sections")


def save_section(filename: str, section: dict):
    """Save section dict as YAML using yaml.dump (safe quoting)."""
    path = os.path.join(SECTIONS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(section, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
    print(f"  ✅ {filename} ({len(section.get('templates', []))} templates)")


# ═══════════════════════════════════════════════════════════════
# 1. GAMES — DETECTIVE (trova il guasto)
# ═══════════════════════════════════════════════════════════════
def gen_games_detective():
    return {
        "id": "games_detective",
        "name": "Gioco Detective — Trova il Guasto",
        "intent": "tutor",
        "needs_llm": True,
        "templates": [
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": ["[AZIONE:diagnose]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "giochiamo a detective",
                        "facciamo il gioco del detective",
                        "voglio trovare il guasto",
                        "trova il guasto",
                        "gioco trova l'errore",
                        "facciamo detective",
                        "giochiamo a trova il guasto",
                        "detective mode",
                        "modalita' detective",
                        "voglio fare il detective",
                        "trova l'errore nel circuito",
                        "cos'e' rotto?",
                        "cerca il guasto",
                        "c'e' un errore, trovalo",
                        "che cos'ha che non va?",
                        "perche' non funziona? aiutami a trovare l'errore",
                        "facciamo un gioco: trova il problema",
                        "detective del circuito",
                        "investigiamo il circuito",
                        "mi aiuti a trovare cosa non va?",
                        "qualcosa non funziona, giochiamo a detective",
                        "il circuito ha un bug",
                        "debugging!",
                        "facciamo il debug",
                        "scova il guasto",
                        "il detective dei circuiti",
                    ],
                    "hint": [
                        "Gioco Detective: guida lo studente a trovare il guasto con domande. Non dare subito la soluzione.",
                        "Detective: fai notare i sintomi (LED spento, buzzer silenzioso) e chiedi cosa potrebbe causarli.",
                        "Troubleshooting guidato. Usa il metodo scientifico: osserva, ipotizza, verifica.",
                        "Gioco a indizi. Dai un indizio alla volta. Festeggia quando lo studente trova l'errore.",
                        "Detective mode. Analizza il circuito e dai indizi progressivi: 'Guarda i fili...', 'Controlla la polarita'...'",
                        "Trova il guasto. Checklist: alimentazione OK? Fili collegati? Polarita' corretta? Codice caricato?",
                        "Investigazione circuito. Parti dal sintomo, risali alla causa. Lo studente deve ragionare, non te.",
                    ],
                },
            },
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": ["[AZIONE:diagnose]"],
                "entities": ["{comp}"],
                "vars": {
                    "frase": [
                        "il {comp_nome} non funziona, facciamo detective",
                        "perche' {comp_nome} non si accende? trova l'errore",
                        "il {comp_nome} non fa niente, aiutami a capire",
                        "detective: {comp_nome} e' rotto?",
                        "trovala: cosa c'e' di sbagliato con {comp_nome}?",
                        "il {comp_nome} sembra morto",
                    ],
                    "comp_nome": [
                        "il LED", "la resistenza", "il buzzer", "il motore",
                        "il servo", "il display", "il pulsante", "il potenziometro",
                        "il fotoresistore", "il fototransistor",
                    ],
                    "comp": [
                        "led", "resistor", "buzzer-piezo", "motor-dc",
                        "servo", "lcd16x2", "push-button", "potentiometer",
                        "photo-resistor", "phototransistor",
                    ],
                    "hint": [
                        "Detective con componente specifico. Verifica: collegamento corretto? Pin giusti? Polarita'?",
                        "Troubleshooting componente. Guida domande: 'E' collegato al pin giusto?', 'C'e' la resistenza?'",
                        "Gioco detective per componente. Controlla alimentazione, GND, pin, codice.",
                        "Debug componente. Non dare la soluzione subito — fai ragionare lo studente.",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.25,
            "emoji": 0.15,
            "filler": 0.1,
            "voice": 0.1,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 2. GAMES — POE (Predici-Osserva-Spiega)
# ═══════════════════════════════════════════════════════════════
def gen_games_poe():
    return {
        "id": "games_poe",
        "name": "Gioco POE — Predici Osserva Spiega",
        "intent": "tutor",
        "needs_llm": True,
        "templates": [
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "giochiamo a predici e spiega",
                        "facciamo il gioco POE",
                        "predici cosa succede",
                        "cosa pensi che succeda?",
                        "facciamo predici-osserva-spiega",
                        "voglio fare il gioco della previsione",
                        "proviamo a prevedere",
                        "secondo te cosa succede se premo play?",
                        "indovina cosa fara' il circuito",
                        "POE!",
                        "che succede se avvio?",
                        "previsione!",
                        "facciamo un esperimento mentale",
                        "dimmi prima cosa succede",
                        "cosa prevedi?",
                        "prova a indovinare cosa fa",
                        "prima di avviare, cosa ti aspetti?",
                        "fai la tua previsione",
                        "che succedera' secondo te?",
                        "scommettiamo su cosa fa?",
                    ],
                    "hint": [
                        "Gioco POE fase 1 PREDICI: chiedi allo studente cosa pensa che succedera'. NON dare la risposta.",
                        "POE: lo studente deve fare la previsione PRIMA di avviare. Poi osservare. Poi spiegare la differenza.",
                        "Predici-Osserva-Spiega. Metodo scientifico per bambini. Fase 1: ipotesi prima dell'esperimento.",
                        "POE: guida le 3 fasi. 1) Che prevedi? 2) Avvia e osserva. 3) La previsione era giusta? Perche' si/no?",
                        "Gioco previsione. Stimola il pensiero critico: non esiste risposta sbagliata nella previsione!",
                        "POE fase predizione. Chiedi: Se premo play, il LED si accendera'? Perche' pensi di si/no?",
                    ],
                },
            },
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "perche' e' successo questo?",
                        "non e' come me lo aspettavo",
                        "la mia previsione era sbagliata",
                        "avevo ragione!",
                        "non capisco perche' ha fatto cosi'",
                        "spiegami perche' e' diverso da quello che pensavo",
                        "ho previsto giusto?",
                        "come faccio a spiegare quello che e' successo?",
                        "perche' il LED si e' acceso quando pensavo di no?",
                        "pensavo che non funzionasse e invece va!",
                        "ma io avevo detto che si accendeva e invece no",
                        "la mia teoria era giusta?",
                    ],
                    "hint": [
                        "POE fase 3 SPIEGA: aiuta lo studente a spiegare la differenza tra previsione e risultato.",
                        "POE fase osserva/spiega. Se la previsione era sbagliata, e' un momento di apprendimento fantastico!",
                        "Fase spiegazione POE. Collega il risultato alla teoria. Normalizza gli errori: 'Anche gli scienziati sbagliano!'",
                        "POE riflessione. Guida lo studente a capire PERCHE' il risultato e' diverso dalla previsione.",
                        "Spiegazione post-esperimento. Festeggia sia le previsioni giuste che quelle sbagliate (imparare dall'errore).",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.3,
            "emoji": 0.15,
            "filler": 0.15,
            "voice": 0.1,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 3. GAMES — REVERSE ENGINEERING
# ═══════════════════════════════════════════════════════════════
def gen_games_reverse():
    return {
        "id": "games_reverse",
        "name": "Gioco Reverse Engineering",
        "intent": "tutor",
        "needs_llm": True,
        "templates": [
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "giochiamo a reverse engineering",
                        "che circuito e'?",
                        "indovina il componente nascosto",
                        "facciamo il circuito misterioso",
                        "cos'e' questo circuito?",
                        "riesci a capire cosa fa?",
                        "analizza questo circuito",
                        "gioco del mistero",
                        "cosa fa questo circuito secondo te?",
                        "decodifica il circuito",
                        "indovinello: cosa fa?",
                        "reverse engineering!",
                        "scopri cosa fa il circuito",
                        "a cosa serve questo circuito?",
                        "facciamo un quiz sul circuito",
                        "riconosci questo schema?",
                        "sfida: di' cosa fa senza avviarlo",
                        "mistero del circuito",
                        "facciamo gli ingegneri al contrario",
                        "smonta il circuito mentalmente",
                        "analizza e indovina",
                    ],
                    "hint": [
                        "Reverse Engineering: guida lo studente ad analizzare il circuito pezzo per pezzo. Parti dai componenti, poi i collegamenti.",
                        "Gioco mistero. Fai domande: 'Quanti componenti vedi? Che tipi sono? Come sono collegati?'",
                        "Reverse: non rivelare subito. Dai indizi: 'C'e' un LED e una resistenza... cosa potrebbe fare?'",
                        "Analisi circuito. Metodo: 1) Elenca componenti 2) Segui i fili 3) Ipotizza la funzione 4) Verifica.",
                        "Circuito misterioso. Lo studente deve dedurre la funzione dai componenti. Festeggia il ragionamento.",
                        "Ingegneria inversa per bambini. Parti da: 'Vedo un sensore e un attuatore... cosa potrebbe collegare?'",
                    ],
                },
            },
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "il circuito e' corretto?",
                        "valuta il mio lavoro",
                        "controlla se ho fatto bene",
                        "dammi un voto",
                        "com'e' il mio circuito?",
                        "ho costruito bene?",
                        "e' giusto cosi'?",
                        "puoi valutare il circuito?",
                        "revisione del mio circuito",
                        "dammi un feedback",
                        "correggi il mio circuito",
                        "review!",
                        "controlla il circuito che ho fatto",
                        "va bene cosi'?",
                        "e' pronto per essere avviato?",
                        "ho finito, controllalo",
                    ],
                    "hint": [
                        "Review circuito. Dai feedback costruttivo: cosa va bene, cosa si puo' migliorare. Mai demolire.",
                        "Valutazione. Punti di forza PRIMA delle critiche. Suggerimenti gentili: 'Potresti anche provare...'",
                        "Review. Checklist: alimentazione corretta? Componenti giusti? Fili collegati bene? Codice OK?",
                        "Feedback circuito. Sii incoraggiante ma onesto. Se c'e' un errore, guidalo a trovarlo da solo.",
                        "Revisione lavoro. Festeggia i progressi, suggerisci migliorie. Non dire 'sbagliato' — di' 'potresti provare...'",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.25,
            "emoji": 0.12,
            "filler": 0.1,
            "voice": 0.08,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 4. MEASURE — Multimetro
# ═══════════════════════════════════════════════════════════════
def gen_measure():
    return {
        "id": "measure",
        "name": "Misurazioni con Multimetro",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:measure]"],
                "entities": ["multimeter"],
                "vars": {
                    "frase": [
                        "misura la tensione",
                        "misura il voltaggio",
                        "quanti volt ci sono?",
                        "misura i volt",
                        "usa il multimetro",
                        "misura la corrente",
                        "quanti ampere passano?",
                        "misura gli ampere",
                        "misura la resistenza",
                        "quanti ohm ha?",
                        "misura gli ohm",
                        "voglio misurare",
                        "fammi vedere la tensione",
                        "attacca il tester",
                        "usa il tester",
                        "metti il multimetro",
                        "collega il multimetro",
                        "misura qui",
                        "prendi la misura",
                        "quanto misura?",
                        "fai una misurazione",
                        "voglio sapere quanti volt",
                        "controlla la tensione",
                        "controlla la corrente",
                        "leggi il valore",
                        "che valore c'e'?",
                        "dimmi la tensione ai capi del LED",
                        "misura la tensione sulla resistenza",
                        "quanta corrente passa nel circuito?",
                        "misura tra questi due punti",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:measure]"],
                "entities": ["multimeter", "{comp}"],
                "vars": {
                    "frase": [
                        "misura la tensione sul {comp_nome}",
                        "quanti volt ci sono sul {comp_nome}?",
                        "misura la corrente che passa nel {comp_nome}",
                        "quanti ampere attraversano {comp_nome}?",
                        "misura {comp_nome} con il tester",
                        "controlla {comp_nome} col multimetro",
                    ],
                    "comp_nome": [
                        "LED", "resistenza", "buzzer", "motore",
                        "condensatore", "diodo", "potenziometro",
                    ],
                    "comp": [
                        "led", "resistor", "buzzer-piezo", "motor-dc",
                        "capacitor", "diode", "potentiometer",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.25,
            "voice": 0.15,
            "filler": 0.1,
            "emoji": 0.05,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 5. SETVALUE — Impostare valori componenti
# ═══════════════════════════════════════════════════════════════
def gen_setvalue():
    return {
        "id": "setvalue",
        "name": "Imposta Valore Componente",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:setvalue]"],
                "entities": ["resistor"],
                "vars": {
                    "frase": [
                        "metti la resistenza a 220 ohm",
                        "imposta la resistenza a 1k",
                        "cambia la resistenza a 330 ohm",
                        "voglio una resistenza da 10k",
                        "metti 4.7k ohm",
                        "cambia il valore della resistenza",
                        "imposta 100 ohm",
                        "metti la resistenza a 470",
                        "resistenza 1000 ohm",
                        "fai 220 ohm la resistenza",
                        "imposta R a 150 ohm",
                        "voglio 2.2k",
                        "cambiami il valore a 560 ohm",
                        "setta la resistenza a 680",
                        "la resistenza deve essere da 330",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:setvalue]"],
                "entities": ["buzzer-piezo"],
                "vars": {
                    "frase": [
                        "metti la frequenza a 440 Hz",
                        "cambia il tono del buzzer",
                        "imposta il buzzer a 1000 Hz",
                        "voglio un suono piu' acuto",
                        "abbassa la frequenza",
                        "alza il tono",
                        "metti il buzzer a 262 Hz",
                        "la nota Do",
                        "fammi sentire il La (440)",
                        "cambia frequenza buzzer",
                        "imposta il tono a 880 Hz",
                        "suono grave",
                        "suono acuto",
                        "buzzer 523 Hz",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:setvalue]"],
                "entities": ["capacitor"],
                "vars": {
                    "frase": [
                        "metti il condensatore a 100 microfarad",
                        "imposta capacita' 47uF",
                        "cambia il condensatore a 10uF",
                        "condensatore da 220 microfarad",
                        "imposta 1000uF",
                        "cambia valore condensatore",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:setvalue]"],
                "entities": ["led"],
                "vars": {
                    "frase": [
                        "cambia il colore del LED in rosso",
                        "LED verde",
                        "metti il LED blu",
                        "voglio un LED giallo",
                        "cambia colore a bianco",
                        "LED rosso",
                        "fai il LED arancione",
                        "colore LED: verde",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:setvalue]"],
                "entities": ["battery9v"],
                "vars": {
                    "frase": [
                        "imposta la tensione a 5V",
                        "cambia la batteria a 9V",
                        "metti 3.3 volt",
                        "voltaggio a 12V",
                        "imposta alimentazione 5 volt",
                        "cambia la tensione della batteria",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.25,
            "voice": 0.12,
            "filler": 0.1,
            "sms": 0.1,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 6. INTERACT — Pulsanti, potenziometri, slider
# ═══════════════════════════════════════════════════════════════
def gen_interact():
    return {
        "id": "interact",
        "name": "Interazione Componenti",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {
                "input": "{frase}",
                "response": "@interact",
                "actions": ["[AZIONE:interact]"],
                "entities": ["push-button"],
                "vars": {
                    "frase": [
                        "premi il pulsante",
                        "schiaccia il bottone",
                        "clicca il pulsante",
                        "premi il tasto",
                        "tieni premuto il pulsante",
                        "spingi il bottone",
                        "pigia il tasto",
                        "dai un click al pulsante",
                        "fai click sul bottone",
                        "premi il button",
                        "pulsante!",
                        "schiaccia!",
                        "premilo",
                        "clicka il pulsante",
                        "premi e tieni",
                        "pigia",
                        "dai, premilo!",
                        "spingi il tasto",
                        "fai pressione sul pulsante",
                        "attiva il pulsante",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@interact",
                "actions": ["[AZIONE:interact]"],
                "entities": ["potentiometer"],
                "vars": {
                    "frase": [
                        "gira il potenziometro",
                        "ruota la manopola",
                        "muovi il potenziometro",
                        "gira la rotella",
                        "alza il potenziometro",
                        "abbassa il potenziometro",
                        "giralo al massimo",
                        "metti il pot a meta'",
                        "ruota il pot",
                        "muovi la manopola",
                        "gira il pot verso destra",
                        "gira il pot verso sinistra",
                        "metti il potenziometro a zero",
                        "potenziometro al massimo",
                        "gira piano il pot",
                        "la rotellina!",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@interact",
                "actions": ["[AZIONE:interact]"],
                "entities": ["photo-resistor"],
                "vars": {
                    "frase": [
                        "copri il sensore di luce",
                        "illumina il fotoresistore",
                        "cambia la luce",
                        "metti buio",
                        "metti luce",
                        "simula luce sul sensore",
                        "copri il LDR",
                        "fai buio sul sensore",
                        "accendi la luce sul fotoresistore",
                        "muovi lo slider della luce",
                        "cambia luminosita'",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@interact",
                "actions": ["[AZIONE:interact]"],
                "entities": ["reed-switch"],
                "vars": {
                    "frase": [
                        "avvicina il magnete",
                        "usa il magnete",
                        "attiva il reed switch",
                        "metti il magnete vicino",
                        "simula il magnete",
                        "togli il magnete",
                        "allontana il magnete",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.3,
            "voice": 0.15,
            "emoji": 0.15,
            "filler": 0.12,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 7. SCRATCH BLOCKS — Tutti i 38 blocchi
# ═══════════════════════════════════════════════════════════════
def gen_scratch_blocks():
    return {
        "id": "scratch_blocks",
        "name": "Scratch/Blockly — 38 Blocchi Arduino",
        "intent": "code",
        "needs_llm": True,
        "templates": [
            # I/O digitale
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come accendo un LED con i blocchi?",
                        "blocco per scrivere su un pin digitale",
                        "dove trovo digitalWrite nei blocchi?",
                        "come faccio HIGH su un pin?",
                        "blocco per spegnere un pin",
                        "come leggo un pin digitale con i blocchi?",
                        "blocco digitalRead",
                        "leggere un pulsante con Scratch",
                        "il blocco per accendere e spegnere",
                        "come metto HIGH o LOW?",
                        "come imposto un pin come output?",
                        "pinMode nei blocchi",
                        "come leggo il pulsante con i blocchi?",
                        "blocco per leggere input digitale",
                    ],
                    "hint": [
                        "Blocchi I/O digitali: digitalWrite(pin, HIGH/LOW), digitalRead(pin), pinMode(pin, OUTPUT/INPUT). Mostra dove trovarli nella palette.",
                        "I/O Scratch. Categoria 'Input/Output'. Il blocco 'Imposta pin digitale' equivale a digitalWrite.",
                        "Blocchi digitali. Spiega la differenza tra INPUT (leggere pulsante) e OUTPUT (accendere LED).",
                        "Blocco digitale. HIGH=5V=acceso, LOW=0V=spento. Il blocco ha un menu a tendina per scegliere.",
                    ],
                },
            },
            # I/O analogico
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come leggo il potenziometro con i blocchi?",
                        "blocco analogRead",
                        "leggere un valore analogico con Scratch",
                        "come faccio analogWrite con i blocchi?",
                        "blocco PWM",
                        "come controllo la luminosita' del LED coi blocchi?",
                        "il blocco per leggere il sensore di luce",
                        "come leggo un valore da 0 a 1023?",
                        "blocco per il fotoresistore",
                        "analogico nei blocchi",
                        "come faccio il fade del LED con i blocchi?",
                    ],
                    "hint": [
                        "Blocchi analogici: analogRead(pin) ritorna 0-1023, analogWrite(pin, valore) per PWM 0-255.",
                        "Analogico Scratch. Il blocco 'Leggi pin analogico' e' in categoria Input/Output.",
                        "PWM via blocchi. analogWrite accetta 0 (spento) a 255 (massimo). Solo pin 3,5,6,9,10,11.",
                        "Sensori analogici. Il blocco legge un valore 0-1023. Mappalo su 0-255 per controllare un LED.",
                    ],
                },
            },
            # Logica e condizioni
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come faccio un if con i blocchi?",
                        "blocco se...allora",
                        "condizione if-else nei blocchi",
                        "come metto una condizione?",
                        "blocco 'se' dove lo trovo?",
                        "come faccio un confronto nei blocchi?",
                        "il blocco per maggiore di",
                        "come faccio uguale a nei blocchi?",
                        "blocchi logici AND OR",
                        "come combino due condizioni?",
                        "il blocco NOT dove sta?",
                    ],
                    "hint": [
                        "Blocchi logica: se/allora/altrimenti, confronti (<, >, =, !=), operatori (e, o, non). Categoria 'Logica'.",
                        "If-else in Scratch. Il blocco 'Se...allora...altrimenti' e' giallo. Si compone come un sandwich.",
                        "Condizioni Blockly. Il blocco 'Se' accetta un esagono (condizione). I confronti creano esagoni.",
                        "Logica. AND = entrambe vere, OR = almeno una vera, NOT = inverti. Costruisci passo passo.",
                    ],
                },
            },
            # Loop e cicli
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come faccio un ciclo con i blocchi?",
                        "blocco per ripetere",
                        "ciclo infinito nei blocchi",
                        "come faccio un for loop coi blocchi?",
                        "blocco 'ripeti per sempre'",
                        "come ripeto 10 volte?",
                        "blocco while in Scratch",
                        "come faccio un ciclo che conta?",
                        "il blocco loop",
                        "come faccio lampeggiare il LED con un ciclo?",
                    ],
                    "hint": [
                        "Blocchi ciclo: 'ripeti per sempre' (while true), 'ripeti N volte' (for), 'ripeti mentre' (while condizione).",
                        "Loop Scratch. Il blocco verde 'ripeti' crea il ciclo. Il setup e' fuori dal loop, il loop e' dentro.",
                        "Cicli Blockly. 'ripeti per sempre' = loop(), 'ripeti N volte' = for(i=0; i<N; i++). Spiega la differenza.",
                        "Ciclo infinito. In Arduino, loop() gira per sempre. Il blocco 'ripeti per sempre' fa esattamente questo.",
                    ],
                },
            },
            # Variabili
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come creo una variabile nei blocchi?",
                        "variabili in Scratch",
                        "come salvo un valore?",
                        "blocco per creare variabile",
                        "come uso una variabile?",
                        "dove trovo le variabili?",
                        "come cambio il valore di una variabile?",
                        "variabile contatore nei blocchi",
                        "come incremento una variabile?",
                    ],
                    "hint": [
                        "Variabili Blockly: clicca 'Crea variabile', poi usa i blocchi 'imposta' e 'modifica di'. Categoria 'Variabili'.",
                        "Variabili Scratch. Creare la variabile, poi 'imposta' per darle un valore iniziale.",
                        "Variabili. Come una scatola con un'etichetta: la crei, ci metti un numero, lo cambi quando vuoi.",
                    ],
                },
            },
            # Servo, LCD, Serial
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": ["servo"],
                "vars": {
                    "frase": [
                        "blocco per il servo",
                        "come controllo il servo con i blocchi?",
                        "muovi il servo a 90 gradi con Scratch",
                        "blocco servoWrite",
                        "come imposto l'angolo del servo coi blocchi?",
                    ],
                    "hint": [
                        "Blocco Servo: 'Muovi servo su pin X a Y gradi'. Angolo 0-180. Categoria I/O.",
                        "Servo Scratch. Un solo blocco: imposta pin e angolo. 0=tutto a sinistra, 180=tutto a destra.",
                    ],
                },
            },
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": ["lcd16x2"],
                "vars": {
                    "frase": [
                        "blocco per il display LCD",
                        "come scrivo sul display con i blocchi?",
                        "blocco LCD init",
                        "blocco LCD print",
                        "come cancello il display coi blocchi?",
                        "come cambio riga sul display coi blocchi?",
                        "blocco setCursor LCD",
                        "inizializzare LCD con Scratch",
                    ],
                    "hint": [
                        "Blocchi LCD: lcd_init, lcd_print, lcd_set_cursor, lcd_clear. Categoria 'LCD' nella palette.",
                        "LCD Scratch. Prima inizializza con lcd_init, poi usa lcd_print per scrivere testo.",
                        "Display con blocchi. 4 blocchi: init, print, setCursor(colonna, riga), clear. Init va nel setup.",
                    ],
                },
            },
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "blocco per il serial monitor",
                        "come stampo sul serial con i blocchi?",
                        "blocco Serial.println",
                        "il blocco per scrivere sulla seriale",
                        "come faccio debug con i blocchi?",
                        "stampare valori con Scratch",
                    ],
                    "hint": [
                        "Blocco Serial: 'Stampa su seriale' equivale a Serial.println(). Categoria 'Seriale'.",
                        "Serial Scratch. Il blocco stampa il valore sul Serial Monitor. Utile per debug dei sensori.",
                    ],
                },
            },
            # Math
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "blocco per fare calcoli",
                        "come faccio addizione nei blocchi?",
                        "operazioni matematiche in Scratch",
                        "blocco map",
                        "come converto un valore da 0-1023 a 0-255?",
                        "blocco per numeri random",
                        "come faccio la media con i blocchi?",
                    ],
                    "hint": [
                        "Blocchi math: somma, sottrazione, moltiplicazione, divisione, map(), random, modulo. Categoria 'Matematica'.",
                        "Map Scratch. Il blocco 'mappa' converte un range in un altro: 0-1023 → 0-255 per PWM.",
                        "Matematica Blockly. I blocchi rotondi restituiscono numeri. Si incastrano dentro altri blocchi.",
                    ],
                },
            },
            # Delay/tempo
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come metto un delay nei blocchi?",
                        "blocco aspetta",
                        "come faccio una pausa nel codice coi blocchi?",
                        "blocco delay",
                        "il blocco per aspettare un secondo",
                        "ritardo nei blocchi",
                        "come faccio lampeggiare con un delay?",
                        "blocco millis",
                    ],
                    "hint": [
                        "Blocco delay: 'Aspetta X millisecondi'. 1000ms = 1 secondo. Per lampeggiare: HIGH, delay, LOW, delay.",
                        "Delay Scratch. Il blocco giallo 'aspetta' ferma l'esecuzione. 1000 = 1 secondo, 500 = mezzo secondo.",
                        "Tempo nei blocchi. delay() blocca tutto il programma. Per cose avanzate c'e' millis() ma e' complesso.",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.2,
            "voice": 0.1,
            "filler": 0.1,
            "emoji": 0.08,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 8. TEACHER LIM — Domande docente su LIM e lezione
# ═══════════════════════════════════════════════════════════════
def gen_teacher_lim():
    return {
        "id": "teacher_lim",
        "name": "Domande Docente su LIM e Lezione",
        "intent": "teacher",
        "needs_llm": True,
        "templates": [
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come preparo la lezione?",
                        "come uso la LIM con ELAB?",
                        "suggeriscimi una lezione per la terza elementare",
                        "quale esperimento faccio per primo?",
                        "come presento ELAB ai ragazzi?",
                        "quanto dura una lezione con ELAB?",
                        "posso usare ELAB senza sapere niente di elettronica?",
                        "quali esperimenti per la quinta elementare?",
                        "come faccio se non so niente di Arduino?",
                        "mi serve un piano lezione",
                        "come organizzo il laboratorio?",
                        "quanti studenti possono usare ELAB contemporaneamente?",
                        "serve il collegamento internet?",
                        "funziona sulla LIM della scuola?",
                        "come faccio se i bambini non hanno mai visto un circuito?",
                        "quale volume per la seconda media?",
                        "quale volume per la terza media?",
                        "da dove parto con bambini di 8 anni?",
                        "quale esperimento per spiegare la legge di Ohm?",
                        "come valuto gli studenti?",
                        "posso assegnare compiti con ELAB?",
                        "come faccio a far lavorare a gruppi?",
                        "quanto costa ELAB?",
                        "dove compro i kit?",
                        "serve formazione per i docenti?",
                        "c'e' un manuale per l'insegnante?",
                        "come faccio a mostrare il simulatore alla LIM?",
                        "posso proiettare ELAB?",
                        "funziona su tablet?",
                        "funziona su iPad?",
                    ],
                    "hint": [
                        "Docente sulla LIM. Rispondi come esperto ELAB. ELAB funziona su qualsiasi browser (LIM, tablet, PC).",
                        "Preparazione lezione. Suggerisci Volume 1 per principianti, Volume 2 per intermedi, Volume 3 (AVR) per avanzati.",
                        "Docente inesperto. Rassicuralo: ELAB e' pensato per docenti senza formazione tecnica. Galileo aiuta.",
                        "Piano lezione. Struttura: 5min intro, 15min esperimento guidato, 10min esplorazione libera, 5min quiz.",
                        "Uso LIM. ELAB e' web: basta aprire il browser. No installazione. Proiettare sulla LIM e far seguire.",
                        "Scelta volume. Vol1 (base, 38 esp): da 8 anni. Vol2 (intermedio, 18 esp): da 10 anni. Vol3 (AVR, 14 esp): da 12 anni.",
                        "Docente. Rispondi con sicurezza. ELAB su Amazon, kit fisici opzionali, simulatore gratis online.",
                    ],
                },
            },
            {
                "input": "{frase}",
                "llm_hint": "{hint}",
                "actions": [],
                "entities": [],
                "vars": {
                    "frase": [
                        "come spiego il concetto di circuito ai bambini?",
                        "qual e' il modo migliore per introdurre l'elettronica?",
                        "come rendo la lezione divertente?",
                        "idee per un progetto di classe",
                        "come motivo gli studenti?",
                        "i bambini si annoiano, come faccio?",
                        "come gestisco livelli diversi in classe?",
                        "suggerimenti per una verifica",
                        "come collego l'elettronica alle altre materie?",
                        "attivita' STEM con ELAB",
                        "come faccio coding unplugged con ELAB?",
                        "suggerimenti per il PCTO",
                        "come faccio una relazione di laboratorio?",
                    ],
                    "hint": [
                        "Pedagogia STEM. Suggerisci attivita' pratiche, giochi (Detective, POE), lavoro a coppie.",
                        "Motivazione. I bambini adorano accendere un LED! Parti da li'. Successo immediato = motivazione.",
                        "Didattica differenziata. Studenti avanzati: Scratch + esperimenti Vol3. Principianti: Vol1 guidato.",
                        "Cross-curricolare. Matematica (Ohm), scienze (elettricita'), tecnologia (Arduino), arte (LED RGB).",
                        "Lezione coinvolgente. Usa i giochi di Galileo: Detective, POE. Quiz alla fine. Sfida a gruppi.",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.15,
            "voice": 0.08,
            "filler": 0.1,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 9. SWITCHEDITOR — Cambiare tra Arduino e Scratch
# ═══════════════════════════════════════════════════════════════
def gen_switcheditor():
    return {
        "id": "switcheditor",
        "name": "Cambia Editor Arduino/Scratch",
        "intent": "action",
        "needs_llm": False,
        "templates": [
            {
                "input": "{frase}",
                "response": "@editor_mode_switch",
                "actions": ["[AZIONE:switcheditor:scratch]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "passa a Scratch",
                        "voglio i blocchi",
                        "apri Scratch",
                        "modalita' blocchi",
                        "blockly",
                        "voglio programmare con i blocchi",
                        "switch a Scratch",
                        "passa alla programmazione visuale",
                        "apri l'editor a blocchi",
                        "fammi i blocchi",
                        "metti Scratch",
                        "passa ai blocchi",
                        "voglio i blocchetti",
                        "apri blockly",
                        "modalita' visuale",
                        "usa i blocchi",
                        "preferisco i blocchi",
                        "cambia a Scratch",
                        "metti la modalita' blocchi",
                        "editor visuale",
                        "non voglio scrivere codice, usa i blocchi",
                        "e' troppo difficile il codice, metti i blocchi",
                        "voglio trascinare i blocchi",
                        "drag and drop",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@editor_mode_switch",
                "actions": ["[AZIONE:switcheditor:arduino]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "passa ad Arduino",
                        "torna al codice",
                        "voglio scrivere in C++",
                        "modalita' codice",
                        "switch ad Arduino",
                        "apri l'editor di testo",
                        "codice testuale",
                        "esci da Scratch",
                        "chiudi i blocchi",
                        "voglio scrivere il codice",
                        "passa al codice C++",
                        "torna all'editor normale",
                        "metti Arduino",
                        "modalita' Arduino",
                        "voglio il codice vero",
                        "editor di codice",
                        "non voglio i blocchi",
                        "sono pronto per il codice",
                        "cambia a C++",
                        "modalita' testo",
                        "coding!",
                        "metti la modalita' codice",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@editor_open",
                "actions": ["[AZIONE:openeditor]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "apri l'editor",
                        "voglio scrivere codice",
                        "apri il pannello codice",
                        "mostra l'editor",
                        "dov'e' l'editor?",
                        "fammi scrivere",
                        "apri dove si scrive",
                        "editor!",
                        "mostrami il codice",
                        "voglio vedere il codice",
                        "apri il codice",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@generic_done",
                "actions": ["[AZIONE:closeeditor]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "chiudi l'editor",
                        "nascondi il codice",
                        "non mi serve il codice",
                        "chiudi il pannello codice",
                        "toglielo",
                        "chiudi tutto",
                        "nascondi l'editor",
                        "basta codice",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.25,
            "voice": 0.12,
            "emoji": 0.1,
            "filler": 0.1,
        },
    }


# ═══════════════════════════════════════════════════════════════
# 10. YOUTUBE — Cercare video educativi
# ═══════════════════════════════════════════════════════════════
def gen_youtube():
    return {
        "id": "youtube",
        "name": "Video Educativi YouTube",
        "intent": "navigation",
        "needs_llm": False,
        "templates": [
            {
                "input": "{frase}",
                "response": "@navigation",
                "actions": ["[AZIONE:youtube]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "cercami un video",
                        "voglio vedere un video",
                        "mostrami un video tutorial",
                        "c'e' un video su questo?",
                        "video su YouTube",
                        "apri un video",
                        "fammi vedere un video",
                        "tutorial video",
                        "video spiegazione",
                        "c'e' un filmato?",
                        "posso guardare un video?",
                        "video su questo argomento",
                        "YouTube!",
                        "cerca su YouTube",
                        "video per capire meglio",
                        "hai un video da mostrarmi?",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@navigation",
                "actions": ["[AZIONE:youtube]"],
                "entities": ["{comp}"],
                "vars": {
                    "frase": [
                        "video su come funziona {comp_nome}",
                        "cercami un video su {comp_nome}",
                        "tutorial video su {comp_nome}",
                        "voglio un video che spiega {comp_nome}",
                        "video su {comp_nome} per principianti",
                        "mostrami un video su {comp_nome}",
                    ],
                    "comp_nome": [
                        "il LED", "la resistenza", "il buzzer", "il servo",
                        "il display LCD", "il motore", "Arduino",
                        "i circuiti", "la legge di Ohm", "la breadboard",
                        "il potenziometro", "il PWM", "il condensatore",
                    ],
                    "comp": [
                        "led", "resistor", "buzzer-piezo", "servo",
                        "lcd16x2", "motor-dc", "nano-r4-board",
                        "", "", "",
                        "potentiometer", "", "capacitor",
                    ],
                },
            },
            {
                "input": "{frase}",
                "response": "@navigation",
                "actions": ["[AZIONE:youtube]"],
                "entities": [],
                "vars": {
                    "frase": [
                        "video su come fare il blink",
                        "tutorial Arduino per bambini",
                        "video su come montare un circuito",
                        "video su come usare la breadboard",
                        "video su come collegare i fili",
                        "video su come programmare Arduino",
                        "video su Scratch per Arduino",
                        "video su come leggere uno schema",
                        "video su esperimenti di elettronica",
                        "video su come si fa un semaforo con Arduino",
                    ],
                },
            },
        ],
        "corruptions": {
            "typo_swap": 0.2,
            "voice": 0.15,
            "emoji": 0.12,
            "filler": 0.1,
        },
    }


# ═══════════════════════════════════════════════════════════════
# MAIN — Genera tutte le sezioni
# ═══════════════════════════════════════════════════════════════
def main():
    print("\n" + "=" * 60)
    print("  Galileo Brain v9 — Generazione sezioni YAML")
    print("=" * 60 + "\n")

    sections = [
        ("22_games_detective.yml", gen_games_detective()),
        ("23_games_poe.yml", gen_games_poe()),
        ("24_games_reverse.yml", gen_games_reverse()),
        ("25_measure.yml", gen_measure()),
        ("26_setvalue.yml", gen_setvalue()),
        ("27_interact.yml", gen_interact()),
        ("28_scratch_blocks.yml", gen_scratch_blocks()),
        ("29_teacher_lim.yml", gen_teacher_lim()),
        ("30_switcheditor.yml", gen_switcheditor()),
        ("31_youtube.yml", gen_youtube()),
    ]

    total_templates = 0
    total_phrases = 0
    for filename, section in sections:
        save_section(filename, section)
        for tmpl in section.get("templates", []):
            total_templates += 1
            for key, values in tmpl.get("vars", {}).items():
                if key in ("frase", "comp_nome"):
                    total_phrases += len(values)

    print(f"\n  📊 Totale: {len(sections)} sezioni, {total_templates} template, ~{total_phrases} frasi base")
    print(f"  📁 Directory: {SECTIONS_DIR}")
    print(f"\n{'=' * 60}\n")


if __name__ == "__main__":
    main()
