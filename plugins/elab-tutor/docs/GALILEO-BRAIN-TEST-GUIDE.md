# Galileo Brain — Guida Completa di Test, Validazione e Raffinamento

**Data**: 06/03/2026 — Session 76
**Autore**: Andrea Marro + Claude Opus 4.6

---

## INDICE

1. [Prerequisiti](#1-prerequisiti)
2. [Setup GGUF + Ollama](#2-setup-gguf--ollama)
3. [Test Automatico (200 test)](#3-test-automatico-200-test)
4. [Test Manuale Interattivo](#4-test-manuale-interattivo)
5. [Analisi dei Risultati](#5-analisi-dei-risultati)
6. [Mappa Completa delle Funzioni](#6-mappa-completa-delle-funzioni)
7. [Strategia di Raffinamento](#7-strategia-di-raffinamento)
8. [Test della LoRA (ZIP)](#8-test-della-lora-zip)
9. [Integrazione nel Nanobot](#9-integrazione-nel-nanobot)
10. [Checklist Finale](#10-checklist-finale)

---

## 1. PREREQUISITI

### Software necessario
```bash
# Verifica Ollama installato
ollama --version
# Se non installato: https://ollama.com/download

# Verifica Python 3
python3 --version

# Installa dipendenza
pip3 install requests
```

### File necessari
```
elab-builder/
  models/
    galileo-brain-v2-gguf.Q4_K_M.gguf   <- Il GGUF scaricato (~2.5 GB)
    Modelfile                             <- Template Ollama (gia creato)
  datasets/
    evaluation-suite.jsonl                <- 120 test cases
    galileo-brain-v2.jsonl                <- 2000 training examples
  scripts/
    test-brain-complete.py                <- Script di test automatico
    evaluate-brain.py                     <- Evaluation runner base
```

### Verifica che il GGUF sia al posto giusto
```bash
ls -la "VOLUME 3/PRODOTTO/elab-builder/models/galileo-brain-v2-gguf.Q4_K_M.gguf"
# Deve mostrare ~2.5 GB
```

---

## 2. SETUP GGUF + OLLAMA

### Passo 1: Crea il modello Ollama
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
ollama create galileo-brain -f models/Modelfile
```

Output atteso:
```
transferring model data
using existing layer sha256:abc123...
creating new layer sha256:def456...
writing manifest
success
```

### Passo 2: Verifica che il modello esista
```bash
ollama list
```
Deve mostrare `galileo-brain` nella lista.

### Passo 3: Test rapido manuale
```bash
ollama run galileo-brain
```

Scrivi nel prompt:
```
[CONTESTO]
tab: simulator
esperimento: v1-cap6-esp1
componenti: [led1, resistor1]
fili: 2
volume_attivo: 1

[MESSAGGIO]
Avvia la simulazione
```

**Risposta attesa** (JSON valido):
```json
{
  "intent": "action",
  "entities": [],
  "actions": ["[AZIONE:play]"],
  "needs_llm": false,
  "response": "Simulazione avviata!",
  "llm_hint": null
}
```

**COSA VERIFICARE:**
- [ ] La risposta e JSON valido (nessun testo fuori dalle graffe)
- [ ] `intent` e `"action"` (non `"circuit"` o `"tutor"`)
- [ ] `actions` contiene `"[AZIONE:play]"`
- [ ] `needs_llm` e `false`
- [ ] `response` non e null (ha un testo)

### Passo 4: Test dei 6 intent
Prova ciascuno di questi messaggi (uno alla volta):

| # | Messaggio | Intent Atteso | actions Attese |
|---|-----------|---------------|----------------|
| 1 | `Avvia la simulazione` | action | `[AZIONE:play]` |
| 2 | `Metti un LED sulla breadboard` | circuit | `[INTENT:{...}]` |
| 3 | `Scrivi il codice per il blink` | code | `[AZIONE:setcode:...]` |
| 4 | `Come funziona un LED?` | tutor | nessuna (needs_llm=true) |
| 5 | `Cosa vedi nel mio circuito?` | vision | nessuna (needs_llm=true) |
| 6 | `Apri il manuale` | navigation | `[AZIONE:opentab:manual]` |

Esci con `/bye` o Ctrl+D.

---

## 3. TEST AUTOMATICO (200 TEST)

### Test base (120 test dall'evaluation suite)
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
python3 scripts/test-brain-complete.py
```

### Test completo con stress (200 test)
```bash
python3 scripts/test-brain-complete.py --full --verbose --report
```

### Test per categoria specifica
```bash
# Solo azioni (play/pause/reset/clearall/compile/etc.)
python3 scripts/test-brain-complete.py --category action --verbose

# Solo circuiti (placement/wiring)
python3 scripts/test-brain-complete.py --category circuit --verbose

# Solo tutor (spiegazioni/teoria)
python3 scripts/test-brain-complete.py --category tutor --verbose

# Solo vision
python3 scripts/test-brain-complete.py --category vision --verbose

# Solo navigazione
python3 scripts/test-brain-complete.py --category navigation --verbose

# Solo edge cases
python3 scripts/test-brain-complete.py --category edge --verbose

# Solo stress tests
python3 scripts/test-brain-complete.py --full --category stress --verbose
```

### Interpretazione output

L'output mostra per ogni test:
```
  [+] 001/200 E001 PASS (145ms)
      Input: Avvia la simulazione
      OK: intent=action, actions=['[AZIONE:play]']

  [x] 095/200 E095 FAIL (234ms)
      Input: costrusci un cirquito con un leddd
      >> INTENT:circuit!=action
      Got: intent=action, actions=[], needs_llm=True
```

**Simboli:**
- `[+]` = PASS
- `[x]` = FAIL
- Il report finale mostra le aree deboli e le raccomandazioni

### Soglie di qualita

| Grade | Percentuale | Significato |
|-------|-------------|-------------|
| **S** | >= 98% | Produzione immediata |
| **A** | >= 95% | Quasi pronto, piccoli fix |
| **B** | >= 90% | Buono, serve raffinamento |
| **C** | >= 80% | Funzionale, serve lavoro |
| **D** | >= 70% | Insufficiente per produzione |
| **F** | < 70% | Necessita ri-training |

---

## 4. TEST MANUALE INTERATTIVO

Dopo i test automatici, fai questi 10 test manuali per verificare la **qualita** delle risposte:

### Test 1: Catena di 3 azioni
```
[CONTESTO]
tab: simulator
componenti: [led1, resistor1, pushbutton1]
fili: 3
volume_attivo: 1

[MESSAGGIO]
Pulisci tutto, metti un LED con resistore e avvia
```
**Atteso**: 3 action tags (clearall + INTENT + play), needs_llm=false

### Test 2: Typo robusto
```
[MESSAGGIO]
costrusci un cirquito con un leddd e una resistensa
```
**Atteso**: intent=circuit, [INTENT:{...}] con LED e resistore

### Test 3: Negazione
```
[MESSAGGIO]
Non avviare la simulazione
```
**Atteso**: intent=action, NESSUN tag [AZIONE:play]

### Test 4: Domanda + Azione
```
[MESSAGGIO]
Come funziona un LED? Mettine uno sulla breadboard
```
**Atteso**: Il modello deve decidere — preferibilmente tutor con needs_llm=true

### Test 5: Inglese misto
```
[MESSAGGIO]
run the simulation please
```
**Atteso**: intent=action, [AZIONE:play]

### Test 6: Input minimo
```
[MESSAGGIO]
LED
```
**Atteso**: Il modello deve interpretare — probabilmente circuit

### Test 7: Richiesta complessa Vol3
```
[CONTESTO]
tab: simulator
volume_attivo: 3
simulationMode: avr

[MESSAGGIO]
Apri l'editor a blocchi e programma il blink del LED sul pin 13
```
**Atteso**: intent=code, azioni per aprire editor scratch

### Test 8: Vision + Azione
```
[MESSAGGIO]
Guarda il mio circuito e se e sbagliato corregilo
```
**Atteso**: intent=vision, needs_llm=true

### Test 9: Off-topic
```
[MESSAGGIO]
Chi ha vinto la Champions League?
```
**Atteso**: intent=tutor, needs_llm=true, nessun action tag

### Test 10: Sequenza Dio Mode
```
[MESSAGGIO]
Resetta, aggiungi LED, resistore e batteria, collegali, compila il blink e avvia la simulazione
```
**Atteso**: Multipli action tags in sequenza

---

## 5. ANALISI DEI RISULTATI

### Come leggere il report

Il report salvato da `--report` contiene:

1. **Overall Score**: Percentuale totale e grade (S/A/B/C/D/F)
2. **By Category**: Breakdown per tipo (action, circuit, tutor, etc.)
3. **By Metric**: Intent, Actions, needs_llm accuracy separatamente
4. **Latency**: Min/P50/P95/Max in millisecondi
5. **Failed Tests**: Lista dettagliata con motivi del fallimento
6. **Weak Areas**: Categorie sotto il 100% con analisi dei pattern di errore
7. **Recommendations**: Suggerimenti automatici per migliorare

### Pattern di errore comuni

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `JSON_PARSE_FAILED` | Modello emette testo fuori dal JSON | Piu esempi con JSON puro nel training |
| `INTENT:tutor!=action` | Confonde domande con azioni | Piu esempi di "action verbs" nel training |
| `INTENT:action!=circuit` | Non riconosce placement | Piu esempi "metti/aggiungi" = circuit |
| `ACTIONS:[]!=["[AZIONE:play]"]` | Non emette tag azione | Rinforzare deterministic actions |
| `NEEDS_LLM:true!=false` | Invia al LLM quando non serve | Piu esempi deterministici |
| `EMPTY_RESPONSE_WHEN_NO_LLM` | Risposta vuota | Verificare "response" nei training data |

### Come diagnosticare un fallimento

1. Prendi il test_id fallito (es. E095)
2. Trova il test case corrispondente in `evaluation-suite.jsonl`
3. Eseguilo manualmente con `ollama run galileo-brain`
4. Analizza la risposta raw:
   - E JSON valido?
   - L'intent e corretto?
   - Le actions sono presenti?
5. Cerca esempi simili nel dataset `galileo-brain-v2.jsonl`
6. Se mancano, aggiungili al training set e ri-allena

---

## 6. MAPPA COMPLETA DELLE FUNZIONI

### 6.1 — Action Tags (23 totali)

| # | Tag | Parametri | Quando Usarlo |
|---|-----|-----------|---------------|
| 1 | `[AZIONE:play]` | - | "avvia", "start", "vai", "prova" |
| 2 | `[AZIONE:pause]` | - | "ferma", "stop", "pausa", "basta" |
| 3 | `[AZIONE:reset]` | - | "resetta", "ricomincia", "riavvia" |
| 4 | `[AZIONE:clearall]` | - | "pulisci", "cancella tutto", "svuota" |
| 5 | `[AZIONE:compile]` | - | "compila", "verifica codice", "carica programma" |
| 6 | `[AZIONE:diagnose]` | - | "diagnostica", "cosa non va", "perche non funziona" |
| 7 | `[AZIONE:quiz]` | `[exp_id]` | "quiz", "testami", "interrogami" |
| 8 | `[AZIONE:loadexp:ID]` | exp ID | "carica esperimento", "apri cap X esp Y" |
| 9 | `[AZIONE:opentab:TAB]` | tab name | "apri simulatore/manuale/video/..." |
| 10 | `[AZIONE:openvolume:N]` | 1-3 | "apri volume 2" |
| 11 | `[AZIONE:addcomponent:TYPE:X:Y]` | type, coords | "aggiungi LED" (legacy) |
| 12 | `[AZIONE:addwire:FROM:PIN:TO:PIN:COLOR]` | IDs, pins | "collega LED a D13" |
| 13 | `[AZIONE:removewire:INDEX]` | wire index | "scollega", "rimuovi filo" |
| 14 | `[AZIONE:removecomponent:ID]` | comp ID | "rimuovi LED", "togli buzzer" |
| 15 | `[AZIONE:movecomponent:ID:X:Y]` | comp ID, coords | "sposta LED a destra" |
| 16 | `[AZIONE:interact:ID:ACTION:VALUE]` | comp ID | "premi pulsante", "accendi LED" |
| 17 | `[AZIONE:highlight:ID1,ID2]` | comma-sep IDs | "dov'e il LED?", "evidenzia" |
| 18 | `[AZIONE:measure:ID]` | comp ID | "quanti volt?", "misura corrente" |
| 19 | `[AZIONE:setvalue:ID:PARAM:VALUE]` | comp ID, param | "cambia a 470 ohm" |
| 20 | `[AZIONE:setcode:CODE]` | Arduino C++ | "scrivi codice blink" |
| 21 | `[AZIONE:youtube:QUERY]` | search query | "cerca video su LED" |
| 22 | `[AZIONE:createnotebook:NAME]` | name | "crea taccuino" |
| 23 | `[INTENT:{json}]` | placement JSON | "costruisci circuito con..." |

### 6.2 — Intent Types (6 totali)

| Intent | Quando | needs_llm | Tipiche actions |
|--------|--------|-----------|-----------------|
| **action** | Comandi diretti (play/stop/quiz/highlight/etc.) | false | Tag specifici |
| **circuit** | Costruire/modificare circuiti | false | [INTENT:] o addwire/addcomponent |
| **code** | Programmazione Arduino/Scratch | false/true | setcode, compile, openeditor |
| **tutor** | Spiegazioni, teoria, off-topic | true | Nessuna (o quiz) |
| **vision** | Analisi immagini/screenshot | true | Nessuna |
| **navigation** | Navigazione tra tab/esperimenti/volumi | false | loadexp, opentab, openvolume |

### 6.3 — Componenti (21 tipi)

**Piazzabili (14):**
```
led, resistor, push-button, buzzer-piezo, capacitor,
potentiometer, photo-resistor, diode, mosfet-n, rgb-led,
motor-dc, servo, reed-switch, phototransistor
```

**Infrastruttura (7):**
```
battery9v, multimeter, lcd16x2, nano-r4-board,
breadboard-half, breadboard-full, wire
```

### 6.4 — Pin Map

```
LED:              anode, cathode
Resistor:         pin1, pin2
PushButton:       pin1, pin2
BuzzerPiezo:      positive, negative
Potentiometer:    vcc, signal, gnd
Capacitor:        positive, negative
PhotoResistor:    pin1, pin2
Diode:            anode, cathode
MosfetN:          gate, drain, source
RgbLed:           red, common, green, blue
MotorDC:          positive, negative
Servo:            signal, vcc, gnd
ReedSwitch:       pin1, pin2
Phototransistor:  collector, emitter
Battery9V:        positive, negative
Multimeter:       probe-positive, probe-negative
```

### 6.5 — Tab (10)

```
simulator, manual, video, canvas, editor,
taccuini, detective, poe, reverse, review
```

### 6.6 — Volumi e Esperimenti

- **Volume 1**: 38 esperimenti (v1-cap6-esp1 ... v1-cap13-espN)
- **Volume 2**: 18 esperimenti (v2-cap1-esp1 ... v2-cap5-espN)
- **Volume 3**: 14 esperimenti (v3-cap1-esp1 ... v3-cap3-espN)
- **Totale**: 70 esperimenti

---

## 7. STRATEGIA DI RAFFINAMENTO

### 7.1 — Ciclo di raffinamento

```
1. Testa il modello          ->  python3 scripts/test-brain-complete.py --full --report
2. Analizza i fallimenti     ->  Leggi il report, identifica weak areas
3. Genera dati mirati        ->  python3 scripts/generate-refinement.py --weak-area ACTION
4. Unisci al dataset         ->  cat refinement.jsonl >> galileo-brain-v2.jsonl
5. Ri-allena su Colab        ->  notebooks/galileo-brain-finetune-v2.ipynb
6. Scarica nuovo GGUF        ->  galileo-brain-v3-gguf.Q4_K_M.gguf
7. Aggiorna Modelfile        ->  FROM ./galileo-brain-v3-gguf.Q4_K_M.gguf
8. Ricrea modello Ollama     ->  ollama create galileo-brain -f models/Modelfile
9. Ri-testa                  ->  Ripeti dal punto 1
```

### 7.2 — Hyperparameters consigliati per raffinamento

Se il modello ha >= 90% ma < 98%, usa questi parametri per il fine-tuning incrementale:

| Param | V2 Base | V3 Refinement |
|-------|---------|---------------|
| Dataset | 2000 | 2000 + N refinement |
| Learning rate | 2e-4 | 1e-4 (dimezzato) |
| Epochs | 3 | 2 (meno per evitare overfitting) |
| LoRA rank | 64 | 64 (mantieni) |
| Warmup steps | 30 | 20 |
| Weight decay | 0.01 | 0.01 |

### 7.3 — Generare dati mirati per aree deboli

Se il report mostra che la categoria `action` ha fallimenti su `play/pause`:

```bash
# Genera 50 esempi aggiuntivi di play/pause
python3 scripts/generate-refinement.py --weak-area play_pause --count 50

# Genera 30 esempi per circuit placement
python3 scripts/generate-refinement.py --weak-area circuit_placement --count 30

# Genera 20 esempi per edge cases
python3 scripts/generate-refinement.py --weak-area edge_typo --count 20
```

### 7.4 — Regole d'oro per il raffinamento

1. **Non aggiungere piu di 500 esempi** per ciclo (rischio overfitting)
2. **Mantieni il bilanciamento**: se aggiungi 50 `action`, aggiungi anche 20-30 per le altre categorie
3. **Verifica ogni esempio manualmente** prima di includerlo
4. **Testa PRIMA del deploy**: non sostituire mai il modello senza test >= 95%
5. **Versiona i dataset**: `galileo-brain-v2.jsonl`, `galileo-brain-v3.jsonl`, etc.
6. **Salva i checkpoint**: scarica sia LoRA che GGUF da ogni training run

---

## 8. TEST DELLA LoRA (ZIP)

### Cos'e la LoRA ZIP

La ZIP contiene gli adapter weights LoRA (Low-Rank Adaptation). NON e un modello completo — e un delta che si applica sopra il modello base Qwen3-4B.

### Contenuto della ZIP

```
lora_adapter/
  adapter_config.json       <- Configurazione LoRA (rank, alpha, target_modules)
  adapter_model.safetensors <- Pesi LoRA (~50-100 MB)
  tokenizer.json            <- Tokenizer
  tokenizer_config.json     <- Config tokenizer
  special_tokens_map.json   <- Token speciali
```

### Come testare la LoRA direttamente

#### Opzione A: Su Colab (CONSIGLIATO)

1. Carica la ZIP su Google Drive
2. Apri il notebook `galileo-brain-finetune-v2.ipynb`
3. Nella Cella 7, carica il modello base + LoRA:
   ```python
   from peft import PeftModel
   from transformers import AutoModelForCausalLM, AutoTokenizer

   # Carica il modello base
   base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen3-4B")
   tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3-4B")

   # Applica la LoRA
   model = PeftModel.from_pretrained(base_model, "/content/drive/MyDrive/lora_adapter")
   ```

#### Opzione B: Localmente con Python

```bash
pip3 install torch transformers peft accelerate
```

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base = AutoModelForCausalLM.from_pretrained("Qwen/Qwen3-4B", device_map="auto")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3-4B")
model = PeftModel.from_pretrained(base, "./lora_adapter")
```

**NOTA**: Richiede ~8 GB RAM + GPU con almeno 6 GB VRAM. Se non hai GPU, usa Colab.

### Quando usare la LoRA vs il GGUF

| Scenario | Usa |
|----------|-----|
| Testing locale rapido | **GGUF** via Ollama |
| Testing in produzione | **GGUF** via Ollama |
| Raffinamento/retraining | **LoRA** su Colab |
| Merge con modello base | **LoRA** + merge script |
| Condivisione pesi | **LoRA** (piu leggera) |

---

## 9. INTEGRAZIONE NEL NANOBOT

### Architettura finale

```
Studente -> Frontend -> Nanobot -> [Galileo Brain (GGUF/Ollama)]
                                      |
                                      +-- intent=action     -> Deterministic Response
                                      +-- intent=circuit    -> Circuit Specialist (LLM)
                                      +-- intent=code       -> Code Specialist (LLM)
                                      +-- intent=tutor      -> Tutor Specialist (LLM)
                                      +-- intent=vision     -> Vision Specialist (Gemini)
                                      +-- intent=navigation -> Deterministic Response
```

### Pre-requisiti per integrazione

1. **Brain >= 95% accuracy** sul test suite completo
2. **Latency < 500ms** (P95) per non rallentare l'UX
3. **JSON validity >= 99%** per evitare crash nel parser

### Fasi di integrazione

**Fase 1 (Shadow Mode)**: Il Brain classifica in parallelo ma NON controlla il routing. Logga le differenze tra Brain e keyword-based per analisi.

**Fase 2 (Hybrid)**: Il Brain controlla il routing per le categorie dove ha >= 98% accuracy. Le altre restano keyword-based.

**Fase 3 (Full)**: Il Brain controlla tutto il routing. Keyword-based diventa fallback.

---

## 10. CHECKLIST FINALE

### Pre-test
- [ ] GGUF scaricato e nella cartella `models/`
- [ ] Ollama installato e in esecuzione (`ollama serve`)
- [ ] Modello creato (`ollama create galileo-brain -f models/Modelfile`)
- [ ] Python 3 + requests installato

### Test automatico
- [ ] `python3 scripts/test-brain-complete.py` eseguito
- [ ] `python3 scripts/test-brain-complete.py --full --report` eseguito
- [ ] Report salvato e analizzato

### Test manuale
- [ ] 6 intent testati (action/circuit/code/tutor/vision/navigation)
- [ ] 10 test interattivi completati
- [ ] JSON sempre valido (nessun testo fuori dalle graffe)
- [ ] Latenza accettabile (< 500ms P95)

### Qualita
- [ ] Overall >= 95% (Grade A o S)
- [ ] JSON validity >= 99%
- [ ] Intent accuracy >= 95%
- [ ] Action accuracy >= 90%
- [ ] needs_llm accuracy >= 95%

### Se serve raffinamento
- [ ] Identificate le aree deboli dal report
- [ ] Generati dati mirati (max 500 per ciclo)
- [ ] Ri-allenato su Colab con parametri V3
- [ ] Scaricato nuovo GGUF
- [ ] Ri-testato con >= 95%

### Per produzione
- [ ] Brain integrato in nanobot (shadow mode)
- [ ] Confronto Brain vs keyword-based per 1 settimana
- [ ] Passaggio a hybrid mode
- [ ] Monitoring latenza e accuracy in produzione

---

## COMANDI RAPIDI (COPIA-INCOLLA)

```bash
# === SETUP ===
cd "VOLUME 3/PRODOTTO/elab-builder"
ollama create galileo-brain -f models/Modelfile

# === TEST RAPIDO ===
python3 scripts/test-brain-complete.py

# === TEST COMPLETO CON REPORT ===
python3 scripts/test-brain-complete.py --full --verbose --report

# === TEST PER CATEGORIA ===
python3 scripts/test-brain-complete.py --category action --verbose
python3 scripts/test-brain-complete.py --category circuit --verbose
python3 scripts/test-brain-complete.py --category tutor --verbose

# === EVALUATION SUITE STATS ===
python3 scripts/evaluate-brain.py --dry-run

# === TEST INTERATTIVO ===
ollama run galileo-brain

# === RICREA MODELLO DOPO AGGIORNAMENTO ===
ollama rm galileo-brain
ollama create galileo-brain -f models/Modelfile
```

---

**Fine della guida. Buon testing!**
