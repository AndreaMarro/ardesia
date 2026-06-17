# GALILEO BRAIN — Master Prompt di Training, Test e Raffinamento

**Versione**: 3.0.0 — META-TRAINER EDITION
**Data**: 07/03/2026
**Autore**: Andrea Marro + Claude Opus 4.6
**Schema**: [The Anatomy of a Claude Prompt] — 8 sezioni

---

## ═══ SEZIONE 1: TASK ═══

Voglio creare un **sistema AI auto-evolutivo** (il "Galileo Brain") che abbia **DUE capacità fondamentali**:

### CAPACITÀ 1: Routing Brain (Operativa)
Il modello Qwen3-4B fine-tuned serve da **cervello di routing/intent-classification** per ELAB Tutor:
1. **Classifica** ogni messaggio dello studente in uno dei 6 intent (action, circuit, code, tutor, vision, navigation)
2. **Risolve localmente** le azioni deterministiche (play, pause, addcomponent...) senza LLM cloud → latenza ~50ms
3. **Delega al LLM cloud** le richieste complesse con contesto preciso (`llm_hint`)

### CAPACITÀ 2: Meta-Trainer (Evolutiva) — LA PIÙ IMPORTANTE
Il sistema Galileo Brain **SA ADDESTRARE MODELLI FUTURI**:
1. **Genera dataset** di training per qualsiasi modello base (Qwen, Llama, Mistral, Gemma, Phi, o futuro)
2. **Valuta autonomamente** le performance di un modello su 200+ test cases
3. **Identifica weak areas** e genera dati di raffinamento mirati
4. **Orchestrare il ciclo** Test → Analisi → Refinement → Re-Train → Re-Test fino al grado S
5. **Si adatta** a nuove architetture, nuovi format di chat (ChatML, Llama3, Mistral, custom), nuove API
6. **Documenta sé stesso** — ogni iterazione produce report, checkpoint, changelog versionati
7. **Insegna** — il Master Prompt contiene TUTTA la conoscenza necessaria per ricreare il sistema da zero

### Visione
```
┌─────────────────────────────────────────────────────────┐
│              GALILEO BRAIN META-SYSTEM                   │
│                                                          │
│  ┌──────────────┐    ┌──────────────────────────┐       │
│  │  OPERATIVO   │    │  META-TRAINER             │       │
│  │  (runtime)   │    │  (evoluzione)             │       │
│  │              │    │                            │       │
│  │  Studente    │    │  ┌──────┐  ┌──────────┐  │       │
│  │    │         │    │  │GENERA│─▶│ ADDESTRA │  │       │
│  │    ▼         │    │  │dataset│  │ modello  │  │       │
│  │  Brain       │    │  └──────┘  └────┬─────┘  │       │
│  │  ┌──────┐   │    │       ▲          │        │       │
│  │  │intent│   │    │       │     ┌────▼─────┐  │       │
│  │  │JSON  │   │    │  ┌────┴───┐│  TESTA   │  │       │
│  │  └──┬───┘   │    │  │RAFFINA ││  200+    │  │       │
│  │     │       │    │  │mirato  ││  test    │  │       │
│  │  ┌──▼───┐   │    │  └────────┘└────┬─────┘  │       │
│  │  │action│   │    │       ▲          │        │       │
│  │  │o LLM │   │    │       └──────────┘        │       │
│  │  └──────┘   │    │   ciclo autonomo           │       │
│  └──────────────┘    └──────────────────────────┘       │
│                                                          │
│  SCALABILE A QUALSIASI MODELLO FUTURO                   │
│  Il Brain oggi è Qwen3-4B. Domani può essere            │
│  Llama 4, Gemma 3, Phi-4, o un modello che              │
│  ancora non esiste. Il Meta-Trainer sa come              │
│  addestrare QUALSIASI modello a fare routing ELAB.       │
└─────────────────────────────────────────────────────────┘
```

### Criterio di successo DUPLICE
1. **Operativo**: Il modello raggiunge grado **S (≥98%)** su 200+ test, latenza P95 <200ms
2. **Meta-Trainer**: Il sistema può prendere UN QUALSIASI modello base nuovo e portarlo a grado S in <5 iterazioni di raffinamento, senza intervento umano oltre il setup iniziale

Prima di procedere, leggi COMPLETAMENTE i file elencati nella sezione Context Files.

---

## ═══ SEZIONE 2: CONTEXT FILES ═══

Leggi OGNI file indicato prima di qualsiasi azione. Non saltarne nessuno.

### 2.1 File del Modello

| File | Contenuto | Priorità |
|------|-----------|----------|
| `models/Modelfile` | Template Ollama: system prompt, ChatML template, parametri inference (temp=0.1, top_p=0.9, num_predict=512) | 🔴 CRITICO |
| `models/galileo-brain-v2-gguf.Q4_K_M.gguf` | Modello quantizzato GGUF (~2.5GB). Creato da LoRA fine-tune di Qwen3-4B | 🔴 CRITICO |
| `models/README.md` | Quick-start guide per Ollama | 🟡 UTILE |

### 2.2 File del Dataset

| File | Contenuto | Priorità |
|------|-----------|----------|
| `datasets/galileo-brain-v2.jsonl` | 2000 esempi ChatML di training (V2 — con fix unicode, vision, canvas, balance intent) | 🔴 CRITICO |
| `datasets/evaluation-suite.jsonl` | 120 test cases con expected_intent, expected_actions, expected_needs_llm | 🔴 CRITICO |
| `datasets/quality-report-v2.md` | Confronto V1→V2: fix applicati, statistiche distribuzione | 🟡 UTILE |
| `datasets/galileo-brain-poc.jsonl` | 500 esempi V1 originali (solo per confronto storico) | ⚪ STORICO |

### 2.3 Script di Automazione

| File | Contenuto | Priorità |
|------|-----------|----------|
| `scripts/generate-brain-dataset-v2.py` | Generatore dataset V2: 1530 linee, 21 componenti, 69 esperimenti, 10 tab, pin map completa | 🔴 CRITICO |
| `scripts/test-brain-complete.py` | Test automatico: 120 eval + 80 stress = 200 test, grading S/A/B/C/D/F, report dettagliato | 🔴 CRITICO |
| `scripts/generate-refinement.py` | Generatore dati di raffinamento: 8 aree deboli, targeted examples | 🔴 CRITICO |
| `scripts/evaluate-brain.py` | Runner di valutazione base | 🟡 UTILE |

### 2.4 Documentazione

| File | Contenuto | Priorità |
|------|-----------|----------|
| `docs/GALILEO-BRAIN-TEST-GUIDE.md` | Guida 10 sezioni: setup, test auto/manuale, analisi, refinement, integrazione nanobot | 🔴 CRITICO |
| `docs/GALILEO-BRAIN-MASTER-PROMPT.md` | **QUESTO FILE** — il master prompt strutturato | 🔴 CRITICO |
| `docs/plans/2026-03-06-galileo-brain-dataset-poc-design.md` | Design originale del PoC | 🟡 UTILE |
| `docs/plans/GALILEO-BRAIN-KICKOFF.txt` | Kickoff del progetto Brain | ⚪ STORICO |

### 2.5 Notebook di Training

| File | Contenuto | Priorità |
|------|-----------|----------|
| `notebooks/galileo-brain-finetune-v2.ipynb` | Colab notebook: Unsloth LoRA fine-tune, 11 celle, hyperparams V2 | 🔴 CRITICO |

### 2.6 Contesto del Simulatore (frontend)

| File | Contenuto | Priorità |
|------|-----------|----------|
| `src/components/ElabTutorV4.jsx` | Chat overlay — handler action tags, dispatch [AZIONE:*] al simulatore | 🟢 RIFERIMENTO |
| `src/components/NewElabSimulator.jsx` | Simulatore principale — 69 esperimenti, componenti, build steps | 🟢 RIFERIMENTO |
| `nanobot/server.py` | Backend AI — routing attuale, specialist YAML, deterministic fallback | 🟢 RIFERIMENTO |

---

## ═══ SEZIONE 3: REFERENCE ═══

### 3.1 Cosa stiamo cercando di ottenere

Il Galileo Brain è un **pre-LLM routing brain** che si posiziona tra lo studente e il LLM cloud:

```
┌─────────┐     ┌──────────────┐     ┌────────────────┐
│ Studente │────▶│ GALILEO BRAIN│────▶│ LLM Cloud      │
│ "Avvia"  │     │ (locale, 50ms)│     │ (se needs_llm) │
└─────────┘     │              │     └────────────────┘
                │ intent:action│
                │ [AZIONE:play]│
                │ needs_llm:❌ │──── Risposta diretta
                └──────────────┘     (nessun costo API)
```

### 3.2 Modello di riferimento attuale (V2)

Il modello V2 è stato addestrato con:
- **Base**: Qwen3-4B (3.8B parametri)
- **Metodo**: Unsloth LoRA (r=64, alpha=128, dropout=0.05)
- **Dataset**: 2000 esempi ChatML in `galileo-brain-v2.jsonl`
- **Training**: 3 epoche, 189 steps, loss 1.48→0.013, 57 minuti, 6.12GB VRAM
- **Quantizzazione**: GGUF Q4_K_M (~2.5GB)

### 3.3 Cosa rende il riferimento efficace — Regole reverse-engineered

Dall'analisi del dataset V2 e del sistema attuale:

- **Always** rispondi in JSON valido puro — nessun testo, markdown o commento fuori dal JSON
- **Always** usa esattamente uno dei 6 intent: `action`, `circuit`, `code`, `tutor`, `vision`, `navigation`
- **Always** metti `needs_llm: false` quando l'azione è deterministica (play, pause, reset, clearall, compile, loadexp, opentab, openvolume, addwire, removewire, addcomponent, removecomponent, interact, highlight, measure, setvalue, movecomponent, diagnose, quiz)
- **Always** metti `needs_llm: true` quando serve ragionamento pedagogico (spiegazioni, teoria, debug codice, domande concettuali)
- **Always** includi una `response` breve e utile quando `needs_llm: false`
- **Always** includi un `llm_hint` informativo e specifico quando `needs_llm: true`
- **Always** usa il formato esatto `[AZIONE:tag]` per le azioni (con parentesi quadre)
- **Always** usa il formato esatto `[INTENT:{"action":"place_and_wire",...}]` per il piazzamento componenti
- **Always** riconosci varianti italiane informali (es. "accendi"→play, "spegni"→pause, "lucina"→LED)
- **Always** popola `entities` con i componenti/pin/esperimenti menzionati nel messaggio
- **Never** generare JSON con campi extra non previsti dallo schema
- **Never** confondere `reset` (ricarica esperimento) con `clearall` (svuota breadboard)
- **Never** usare pin names errati — il pin map è SACRO (LED=anode/cathode, MAI positive/negative)
- **Never** classificare una domanda "come funziona X?" come action — è sempre `tutor`
- **Never** classificare "guarda/analizza il circuito" senza verbo di azione come `action` — è `vision`
- **Never** omettere le azioni quando l'intent è action/circuit/navigation/code
- **Never** generare `setcode` senza codice Arduino valido dentro il tag
- **Never** confondere `compile` (verifica codice) con `play` (avvia simulazione)

---

## ═══ SEZIONE 4: SUCCESS BRIEF ═══

### Tipo di output + lunghezza
**Output del Brain**: JSON strutturato, 200-800 caratteri per risposta
**Output del sistema**: Framework completo di training/test/refinement

### Reazione del destinatario
Lo studente (10-16 anni, italiano) NON vede mai il JSON del Brain.
Vede: l'azione eseguita (LED si accende) o la risposta del LLM (spiegazione).
Il Brain deve essere **invisibile e istantaneo**.

### Non deve sembrare
- ❌ Generico AI — risposte vaghe tipo "Certo, posso aiutarti con quello"
- ❌ Troppo verboso — risposte da 500 parole dove ne bastano 20
- ❌ Inconsistente — stessa domanda → risposte diverse
- ❌ Lento — latenza >200ms percepita dall'utente
- ❌ Fragile — si rompe con typo, slang, o input inaspettati

### Successo significa
| Metrica | Target | Come si misura |
|---------|--------|----------------|
| Intent accuracy | ≥98% | `test-brain-complete.py` — intent corretto su 200 test |
| Action tag accuracy | ≥97% | Tag [AZIONE:*] corretti e completi |
| needs_llm accuracy | ≥98% | false per deterministici, true per pedagogici |
| JSON validity | 100% | Ogni risposta è JSON parsabile |
| Latency P95 | <200ms | Misurata in locale via Ollama |
| Response quality | Non vuota, utile | `response` ha senso quando needs_llm=false |
| LLM hint quality | Informativo | `llm_hint` dà contesto sufficiente al LLM |
| Edge case handling | ≥90% | Typo, slang, mix lingue, catene multi-azione |
| **Grado finale** | **S (≥98%)** | Media pesata di tutte le metriche |

---

## ═══ SEZIONE 5: RULES ═══

Le seguenti regole sono **immutabili**. Se stai per violarne una, FERMATI e segnalalo.

### 5.1 Regole del Modello

```
R1-JSON:    OGNI risposta DEVE essere JSON valido puro. ZERO eccezioni.
R2-INTENT:  I 6 intent sono fissi e immutabili:
            action | circuit | code | tutor | vision | navigation
R3-SCHEMA:  Lo schema di output ha esattamente 6 campi:
            intent, entities, actions, needs_llm, response, llm_hint
R4-ACTIONS: I 23 action tag VALIDI sono:
            play, pause, reset, clearall, compile, diagnose,
            loadexp, opentab, openvolume,
            addwire, removewire, addcomponent, removecomponent,
            interact, highlight, measure, setvalue, movecomponent,
            setcode, quiz, youtube, createnotebook, INTENT
R5-COMPS:   I 21 tipi di componente VALIDI sono:
            led, resistor, push-button, buzzer-piezo, capacitor,
            potentiometer, photo-resistor, diode, mosfet-n, rgb-led,
            motor-dc, servo, reed-switch, phototransistor,
            battery9v, multimeter, lcd16x2, nano-r4-board,
            breadboard-half, breadboard-full, wire
R6-PINS:    Il PIN MAP è SACRO e non modificabile:
            LED: anode, cathode
            Resistor: pin1, pin2
            PushButton: pin1, pin2
            BuzzerPiezo: positive, negative
            Potentiometer: vcc, signal, gnd
            Capacitor: positive, negative
            PhotoResistor: pin1, pin2
            Diode: anode, cathode
            MosfetN: gate, drain, source
            RgbLed: red, common, green, blue
            MotorDC: positive, negative
            Servo: signal, vcc, gnd
            ReedSwitch: pin1, pin2
            Phototransistor: collector, emitter
R7-TABS:    I 10 tab VALIDI sono:
            simulator, manual, video, canvas, editor,
            taccuini, detective, poe, reverse, review
R8-EXPS:    Gli esperimenti seguono il formato: v{VOL}-cap{CAP}-esp{NUM}
            Totale: 69 esperimenti (38 Vol1, 18 Vol2, 13 Vol3 + extra)
R9-WINGS:   I wing pins Arduino VALIDI sono:
            W_A0, W_A1, W_A2, W_A3, W_D3, W_D5, W_D6, W_D9,
            W_D10, W_D11, W_D12, W_D13, W_A4/SDA, W_A5/SCL,
            W_D0/RX, W_D1/TX
R10-BUS:    I bus della breadboard sono:
            bus-bot-plus, bus-bot-minus (NON bus-bottom-plus/minus)
```

### 5.2 Regole di Training

```
T1-CHATML:  Il formato di training è ChatML JSONL:
            {"messages": [{"role":"system",...}, {"role":"user",...}, {"role":"assistant",...}]}
T2-BALANCE: Il dataset deve essere bilanciato per intent:
            action ~30%, circuit ~20%, tutor ~15%, navigation ~15%,
            code ~10%, vision ~10%
T3-CONTEXT: Ogni esempio deve avere un contesto realistico:
            [CONTESTO]\ntab: X\nesperimento: Y\ncomponenti: [...]\nfili: N\nvolume_attivo: V
T4-UNICODE: ensure_ascii=True per TUTTI i json.dumps() — evita surrogati Unicode
T5-VARIETY: Ogni intent deve avere almeno 15 formulazioni diverse
T6-EDGE:    Almeno il 10% del dataset deve essere edge cases:
            typo, slang, mix italiano/inglese, abbreviazioni, catene multi-azione
T7-VOLUMES: Distribuzione volumi: ~40% Vol1, ~35% Vol2, ~25% Vol3
T8-TABS:    Distribuzione tab: ~25% simulator, ~15% manual/editor, ~12% canvas,
            ~10% video, ~5% ciascuno detective/poe/taccuini/reverse/review
```

### 5.3 Regole di Evaluation

```
E1-200:     Il test deve coprire ALMENO 200 test cases
E2-CATEGORY:Ogni categoria deve avere almeno 5 test
E3-WILDCARD:[AZIONE:*] e [INTENT:*] sono wildcard valide nell'evaluation
E4-GRADE:   Grading: S≥98%, A≥95%, B≥90%, C≥80%, D≥70%, F<70%
E5-LATENCY: P95 <200ms è un requisito NON negoziabile
E6-REPORT:  Ogni test run genera un report con: grade, per-category, per-metric,
            latency stats, failed tests, weak areas, recommendations
E7-REPRO:   Ogni test è riproducibile (seed fisso o input deterministi)
```

### 5.4 Regole di Scalabilità (META)

```
S1-AGNOSTIC:  Il framework NON dipende da Qwen3. Deve funzionare con:
              Llama 3.x, Mistral, Gemma 2, Phi-3/4, DeepSeek, o qualsiasi
              futuro modello che supporti ChatML o format compatibile
S2-TEMPLATE:  Il Modelfile/template è parametrizzato — cambiare modello base
              richiede SOLO: (a) nuovo GGUF, (b) aggiornare FROM in Modelfile
S3-EVOLVE:    Il dataset generator è modulare — aggiungere nuovi componenti,
              tab, esperimenti, o action tag richiede SOLO aggiornare le
              costanti (COMPONENT_TYPES, TABS, EXPERIMENTS, etc.)
S4-CYCLE:     Il ciclo di raffinamento è automatizzabile:
              Test → Analisi → Genera dati mirati → Ri-addestra → Ri-testa
S5-VERSION:   Ogni iterazione produce file versionati:
              galileo-brain-v{N}.jsonl, galileo-brain-v{N}-gguf.Q4_K_M.gguf
S6-BENCHMARK: I benchmark sono fissi e cumulativi — i nuovi test si AGGIUNGONO
              all'evaluation suite, non la sostituiscono
S7-PLUGIN:    Il sistema usa plugin/tool per context maintenance:
              - Serena memories per stato progetto
              - Context7 per documentazione framework
              - JSONL versionati come checkpoint
              - Report markdown come audit trail
```

---

## ═══ SEZIONE 6: CONVERSATION ═══

### Domande di chiarimento PRIMA di eseguire

Prima di iniziare qualsiasi fase del training/test/refinement, verifica:

1. **Quale modello base usi?** → Se diverso da Qwen3-4B, adatta gli hyperparameters
2. **Quale hardware hai?** → GPU VRAM determina: batch_size, max_seq_length, quantizzazione
3. **Quale versione del dataset?** → V1 (500), V2 (2000), o custom?
4. **Qual è il target di grado?** → S (98%), A (95%), B (90%)?
5. **Ci sono nuovi componenti/tab/esperimenti da aggiungere?** → Aggiorna costanti prima di generare

### Approccio iterativo step-by-step

```
╔══════════════════════════════════════════════╗
║  CICLO DI TRAINING GALILEO BRAIN             ║
║                                              ║
║  ┌──────────┐    ┌──────────┐               ║
║  │ 1. GENERA │───▶│ 2. TRAIN │               ║
║  │  dataset  │    │  LoRA    │               ║
║  └──────────┘    └──────────┘               ║
║       ▲               │                      ║
║       │          ┌────▼─────┐               ║
║  ┌────┴─────┐    │ 3. EXPORT│               ║
║  │ 6. REFINE│    │  GGUF    │               ║
║  │ dataset  │    └──────────┘               ║
║  └──────────┘         │                      ║
║       ▲          ┌────▼─────┐               ║
║       │          │ 4. TEST  │               ║
║       │          │ 200 cases│               ║
║  ┌────┴─────┐    └──────────┘               ║
║  │5. ANALYZE│         │                      ║
║  │ weak area│◀────────┘                      ║
║  └──────────┘                                ║
║                                              ║
║  Ripeti fino a Grado S (≥98%)                ║
╚══════════════════════════════════════════════╝
```

---

## ═══ SEZIONE 7: PLAN ═══

### Le 3 regole più importanti per questo task

1. **R1-JSON** — JSON validity 100% è il prerequisito non negoziabile; un modello che genera anche UN SOLO output non-JSON è inutilizzabile in produzione
2. **S1-AGNOSTIC** — Ogni decisione deve essere model-agnostic; oggi Qwen3-4B, domani potrebbe essere Llama 4 o Gemma 3
3. **S4-CYCLE** — Il ciclo test→analyze→refine→retrain deve essere COMPLETAMENTE automatizzabile

### Piano di esecuzione (5 fasi)

```
FASE 1: SETUP & VALIDAZIONE (30 min)
├── 1.1 Verifica file GGUF presente e dimensione corretta
├── 1.2 Crea modello Ollama: ollama create galileo-brain -f models/Modelfile
├── 1.3 Test manuale rapido: 6 query (una per intent)
└── 1.4 Verifica che il JSON output sia valido

FASE 2: TEST AUTOMATICO COMPLETO (45 min)
├── 2.1 Esegui: python3 scripts/test-brain-complete.py --full --report --verbose
├── 2.2 Analizza il report generato in datasets/brain-test-report-*.md
├── 2.3 Identifica il grado complessivo e per categoria
└── 2.4 Cataloga le aree deboli (weak areas)

FASE 3: RAFFINAMENTO MIRATO (2-4 ore)
├── 3.1 Per ogni weak area: python3 scripts/generate-refinement.py --weak-area X --count N
├── 3.2 Unisci dati originali + refinement: cat v2.jsonl refinement.jsonl > v3.jsonl
├── 3.3 Ri-addestra su Colab con notebook V2 (aggiorna DATASET_PATH)
├── 3.4 Esporta nuovo GGUF Q4_K_M
└── 3.5 Scarica e sostituisci in models/

FASE 4: RE-TEST & VALIDAZIONE (30 min)
├── 4.1 Ricrea modello Ollama: ollama create galileo-brain -f models/Modelfile
├── 4.2 Ri-esegui test completo: python3 scripts/test-brain-complete.py --full --report
├── 4.3 Confronta grado V2 vs V3
└── 4.4 Se grado < S (98%): torna a FASE 3

FASE 5: INTEGRAZIONE NANOBOT (1-2 ore)
├── 5.1 Shadow mode: Brain classifica in parallelo, log comparison
├── 5.2 Hybrid mode: Brain per intent deterministici, nanobot per LLM
├── 5.3 Full mode: Brain come router primario
└── 5.4 Deploy su Render con Ollama container
```

---

## ═══ SEZIONE 8: ALIGNMENT ═══

### Verifica di allineamento

Prima di procedere con qualsiasi fase, conferma:

- [ ] Il file GGUF è in `models/galileo-brain-v2-gguf.Q4_K_M.gguf` ed è ~2.5GB
- [ ] Ollama è installato e funzionante (`ollama --version`)
- [ ] Python 3 + requests sono disponibili
- [ ] Il target è grado **S (≥98%)**
- [ ] Il framework deve rimanere **model-agnostic** (non hardcoded per Qwen3)
- [ ] Ogni iterazione produce file **versionati** (v2, v3, v4...)
- [ ] Il ciclo di raffinamento è **automatizzabile**

### Checkpoint di progressione

| Checkpoint | Criterio | Azione se FAIL |
|------------|----------|----------------|
| CP1: Setup | Modello Ollama creato + 6 test manuali OK | Fix Modelfile o GGUF path |
| CP2: Baseline | Grado ≥B (90%) sul test automatico | Dataset V2 potrebbe essere insufficiente |
| CP3: Refinement | Grado migliora di almeno 3% per iterazione | Aumenta conteggio dati o rivedi weak areas |
| CP4: Target | Grado S (≥98%) raggiunto | ✅ Passa a integrazione nanobot |
| CP5: Production | Zero regressioni dopo integrazione | Rollback a routing attuale se fallisce |

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE A: MAPPA COMPLETA DELLE FUNZIONI ELAB TUTOR
# ═══════════════════════════════════════════════════════════════

## A.1 — I 23 Action Tag

| # | Tag | Formato | Intent | needs_llm | Esempio input studente |
|---|-----|---------|--------|-----------|----------------------|
| 1 | `play` | `[AZIONE:play]` | action | false | "Avvia", "accendi", "start", "dai corrente", "prova" |
| 2 | `pause` | `[AZIONE:pause]` | action | false | "Ferma", "stop", "pausa", "basta", "spegni" |
| 3 | `reset` | `[AZIONE:reset]` | action | false | "Reset", "ricomincia", "ricomincia da capo" |
| 4 | `clearall` | `[AZIONE:clearall]` | action | false | "Cancella tutto", "svuota", "togli tutto", "pulisci" |
| 5 | `compile` | `[AZIONE:compile]` | action | false | "Compila", "verifica codice", "carica programma" |
| 6 | `diagnose` | `[AZIONE:diagnose]` | action | false | "Diagnostica", "cosa c'è che non va?", "controlla errori" |
| 7 | `loadexp` | `[AZIONE:loadexp:ID]` | navigation | false | "Carica esperimento X", "apri cap7 esp2" |
| 8 | `opentab` | `[AZIONE:opentab:NOME]` | navigation | false | "Apri simulatore", "vai al manuale", "mostra video" |
| 9 | `openvolume` | `[AZIONE:openvolume:N]` | navigation | false | "Vai al volume 2", "apri vol3" |
| 10 | `addwire` | `[AZIONE:addwire:C1:P1:C2:P2]` | circuit | false | "Collega LED a pin D3", "metti filo da X a Y" |
| 11 | `removewire` | `[AZIONE:removewire:INDEX]` | circuit | false | "Togli il filo", "rimuovi collegamento" |
| 12 | `addcomponent` | `[AZIONE:addcomponent:TYPE]` | circuit | false | "Aggiungi un LED", "metti resistore" |
| 13 | `removecomponent` | `[AZIONE:removecomponent:ID]` | circuit | false | "Togli il LED", "rimuovi il buzzer" |
| 14 | `interact` | `[AZIONE:interact:ID:ACT:VAL]` | action | false | "Premi il pulsante", "gira il pot" |
| 15 | `highlight` | `[AZIONE:highlight:ID]` | action | false | "Evidenzia il LED", "mostrami il resistore" |
| 16 | `measure` | `[AZIONE:measure:ID:PROP]` | action | false | "Misura tensione", "quanti volt?" |
| 17 | `setvalue` | `[AZIONE:setvalue:ID:PROP:VAL]` | action | false | "Imposta resistenza a 470 ohm" |
| 18 | `movecomponent` | `[AZIONE:movecomponent:ID:X:Y]` | circuit | false | "Sposta il LED a destra" |
| 19 | `setcode` | `[AZIONE:setcode:CODICE]` | code | false | "Scrivi codice blink", "programma LED pin 13" |
| 20 | `quiz` | `[AZIONE:quiz]` | action | false | "Fammi un quiz", "testami" |
| 21 | `youtube` | `[AZIONE:youtube:QUERY]` | action | false | "Cerca video su LED", "tutorial Arduino" |
| 22 | `createnotebook` | `[AZIONE:createnotebook:NOME]` | action | false | "Crea un taccuino", "nuovo appunto" |
| 23 | `INTENT` | `[INTENT:{...}]` | circuit | false* | "Costruisci circuito con LED e resistore" |

*Nota: `INTENT` con piazzamento semplice è `needs_llm: false`. Se il circuito richiede logica complessa (es. "costruisci il semaforo"), può essere `needs_llm: true` con `llm_hint` per guidare il LLM.

## A.2 — I 6 Intent

| Intent | Descrizione | needs_llm tipico | Trigger tipici |
|--------|-------------|-------------------|----------------|
| `action` | Comandi diretti del simulatore | false | play, pause, reset, clearall, compile, diagnose, quiz, interact, highlight, measure, setvalue, youtube, createnotebook |
| `circuit` | Costruzione/modifica circuiti | false (semplice) / true (complesso) | "metti", "aggiungi", "collega", "costruisci", "togli componente", "sposta" |
| `code` | Scrittura/modifica codice Arduino | false (setcode) / true (debug) | "scrivi codice", "programma", "blink", errori compilazione |
| `tutor` | Domande teoriche/pedagogiche | true (sempre) | "cos'è", "come funziona", "perché", "spiega", "a cosa serve" |
| `vision` | Analisi visiva screenshot | true (sempre) | "guarda", "analizza", "cosa vedi", "controlla il mio circuito" (senza verbo azione) |
| `navigation` | Navigazione nell'app | false | "carica", "apri", "vai a", "mostra", esperimento/tab/volume |

## A.3 — I 21 Componenti con Alias Italiani

| # | Tipo tecnico | Alias italiani | Pin | Volume |
|---|-------------|----------------|-----|--------|
| 1 | `led` | LED, lucina, lampadina, diodo luminoso | anode, cathode | 1+ |
| 2 | `resistor` | resistore, resistenza | pin1, pin2 | 1+ |
| 3 | `push-button` | pulsante, bottone, tasto | pin1, pin2 | 1+ |
| 4 | `buzzer-piezo` | buzzer, cicalino, ronzatore | positive, negative | 1+ |
| 5 | `capacitor` | condensatore, capacitor | positive, negative | 2+ |
| 6 | `potentiometer` | potenziometro, pot, manopola | vcc, signal, gnd | 1+ |
| 7 | `photo-resistor` | fotoresistore, fotoresistenza, LDR, sensore di luce | pin1, pin2 | 1+ |
| 8 | `diode` | diodo | anode, cathode | 2+ |
| 9 | `mosfet-n` | mosfet, transistor | gate, drain, source | 2+ |
| 10 | `rgb-led` | LED RGB, led multicolore | red, common, green, blue | 1+ |
| 11 | `motor-dc` | motore, motorino, motore DC | positive, negative | 2+ |
| 12 | `servo` | servo, servomotore | signal, vcc, gnd | 3+ |
| 13 | `reed-switch` | reed, sensore magnetico | pin1, pin2 | 1+ |
| 14 | `phototransistor` | fototransistor, sensore ottico | collector, emitter | 2+ |
| 15 | `battery9v` | batteria, pila, batteria 9V | — | infra |
| 16 | `multimeter` | multimetro, tester | probe-positive, probe-negative | infra |
| 17 | `lcd16x2` | LCD, display LCD, schermo | — | 3+ |
| 18 | `nano-r4-board` | Arduino, scheda, Nano, board | — | infra |
| 19 | `breadboard-half` | breadboard piccola | — | infra |
| 20 | `breadboard-full` | breadboard, basetta | — | infra |
| 21 | `wire` | filo, cavo, connessione | — | infra |

## A.4 — I 10 Tab con Sinonimi

| Tab | Sinonimi italiani |
|-----|-------------------|
| `simulator` | simulatore, il simulatore, sim |
| `manual` | manuale, il manuale, il libro |
| `video` | video, i video, tutorial |
| `canvas` | lavagna, la lavagna, canvas, disegno |
| `editor` | editor, codice, il codice, l'editor |
| `taccuini` | taccuini, i taccuini, gli appunti |
| `detective` | detective, modalità detective |
| `poe` | poe, modalità poe |
| `reverse` | reverse, reverse engineering |
| `review` | review, ripasso |

## A.5 — I 69 Esperimenti Completi

### Volume 1 (38 esperimenti)
| ID | Titolo | Capitolo |
|----|--------|----------|
| v1-cap6-esp1 | Accendi il tuo primo LED | Cap 6 |
| v1-cap6-esp2 | LED senza resistore | Cap 6 |
| v1-cap6-esp3 | Cambia luminosità con resistenze diverse | Cap 6 |
| v1-cap7-esp1 | Accendi il rosso del RGB | Cap 7 |
| v1-cap7-esp2 | Accendi il verde del RGB | Cap 7 |
| v1-cap7-esp3 | Accendi il blu del RGB | Cap 7 |
| v1-cap7-esp4 | Mescola 2 colori: il viola | Cap 7 |
| v1-cap7-esp5 | Tutti e 3: bianco | Cap 7 |
| v1-cap7-esp6 | Crea il tuo colore | Cap 7 |
| v1-cap8-esp1 | LED con pulsante | Cap 8 |
| v1-cap8-esp2 | Cambia colore e luminosità | Cap 8 |
| v1-cap8-esp3 | RGB + pulsante = viola | Cap 8 |
| v1-cap8-esp4 | 3 pulsanti, 3 colori RGB | Cap 8 |
| v1-cap8-esp5 | Mix avanzato con resistori diversi | Cap 8 |
| v1-cap9-esp1 | Dimmer LED con potenziometro | Cap 9 |
| v1-cap9-esp2 | Inverti la rotazione | Cap 9 |
| v1-cap9-esp3 | LED di colore diverso con pot | Cap 9 |
| v1-cap9-esp4 | Dimmer RGB azzurrino | Cap 9 |
| v1-cap9-esp5 | Pot miscelatore blu rosso | Cap 9 |
| v1-cap9-esp6 | Lampada RGB con 3 potenziometri | Cap 9 |
| v1-cap9-esp7 | Sfida: aggiungi pulsanti alla lampada | Cap 9 |
| v1-cap9-esp8 | Sfida: combina esperimenti 5+6 | Cap 9 |
| v1-cap9-esp9 | Sfida: aggiungi pulsante all'esp 8 | Cap 9 |
| v1-cap10-esp1 | LED controllato dalla luce | Cap 10 |
| v1-cap10-esp2 | LED diverso colore con LDR | Cap 10 |
| v1-cap10-esp3 | 3 LDR controllano RGB | Cap 10 |
| v1-cap10-esp4 | LED bianco illumina LDR, LED blu | Cap 10 |
| v1-cap10-esp5 | Aggiungi pot per controllare LED bianco | Cap 10 |
| v1-cap10-esp6 | Aggiungi pulsante al circuito LDR | Cap 10 |
| v1-cap11-esp1 | Buzzer suona continuo | Cap 11 |
| v1-cap11-esp2 | Campanello con pulsante | Cap 11 |
| v1-cap12-esp1 | LED con reed switch | Cap 12 |
| v1-cap12-esp2 | Cambia luminosità con magnete | Cap 12 |
| v1-cap12-esp3 | Sfida: RGB + reed switch | Cap 12 |
| v1-cap12-esp4 | Sfida: pot + RGB + reed switch | Cap 12 |
| v1-cap13-esp1 | LED nell'elettropongo | Cap 13 |
| v1-cap13-esp2 | Circuiti artistici con plastilina | Cap 13 |
| v1-cap14-esp1 | Il Primo Robot ELAB | Cap 14 |

### Volume 2 (18 esperimenti)
| ID | Titolo | Capitolo |
|----|--------|----------|
| v2-cap6-esp1 | LED in serie con 1 resistore | Cap 6 |
| v2-cap6-esp2 | LED in serie colori diversi | Cap 6 |
| v2-cap6-esp3 | Tre LED in serie | Cap 6 |
| v2-cap6-esp4 | Misurare Vf con multimetro | Cap 6 |
| v2-cap7-esp1 | Scarica condensatore + multimetro | Cap 7 |
| v2-cap7-esp2 | Scarica con LED rosso | Cap 7 |
| v2-cap7-esp3 | Condensatori in parallelo | Cap 7 |
| v2-cap7-esp4 | Variare R nella scarica RC | Cap 7 |
| v2-cap8-esp1 | MOSFET come interruttore | Cap 8 |
| v2-cap8-esp2 | MOSFET e carica del corpo | Cap 8 |
| v2-cap8-esp3 | MOSFET + pot + tensione soglia | Cap 8 |
| v2-cap9-esp1 | Fototransistor come sensore | Cap 9 |
| v2-cap9-esp2 | Luce notturna automatica | Cap 9 |
| v2-cap10-esp1 | Far girare il motore | Cap 10 |
| v2-cap10-esp2 | Invertire la rotazione | Cap 10 |
| v2-cap10-esp3 | Motore con pulsante | Cap 10 |
| v2-cap10-esp4 | Motore + pulsante + LED indicatore | Cap 10 |
| v2-cap12-esp1 | Robot Segui Luce | Cap 12 |

### Volume 3 (13 esperimenti)
| ID | Titolo | Capitolo |
|----|--------|----------|
| v3-cap6-blink | LED Blink esterno | Cap 6 |
| v3-cap6-pin5 | Cambia pin (D5) | Cap 6 |
| v3-cap6-morse | SOS Morse | Cap 6 |
| v3-cap6-sirena | Sirena 2 LED | Cap 6 |
| v3-cap6-semaforo | Semaforo 3 LED | Cap 6 |
| v3-cap7-pullup | Pulsante INPUT_PULLUP | Cap 7 |
| v3-cap7-pulsante | Pulsante accende LED | Cap 7 |
| v3-cap7-mini | 2 LED + Pulsante toggle | Cap 7 |
| v3-cap8-id | Trova A0 sulla board | Cap 8 |
| v3-cap8-pot | Collegare potenziometro ad A0 | Cap 8 |
| v3-cap8-serial | analogRead + Serial Monitor | Cap 8 |
| v3-extra-lcd-hello | LCD Hello World | Extra |
| v3-extra-servo-sweep | Servo Sweep | Extra |

## A.6 — Wing Pin Map (Arduino Nano R4 su NanoBreakout V1.1)

```
Pin fisico    →  Wing pin  →  Funzione
─────────────────────────────────────────
Analog A0     →  W_A0      →  analogRead
Analog A1     →  W_A1      →  analogRead
Analog A2     →  W_A2      →  analogRead
Analog A3     →  W_A3      →  analogRead
Analog A4/SDA →  W_A4/SDA  →  I2C Data
Analog A5/SCL →  W_A5/SCL  →  I2C Clock
Digital D0/RX →  W_D0/RX   →  Serial RX
Digital D1/TX →  W_D1/TX   →  Serial TX
Digital D3    →  W_D3      →  PWM / interrupt
Digital D5    →  W_D5      →  PWM
Digital D6    →  W_D6      →  PWM
Digital D9    →  W_D9      →  PWM
Digital D10   →  W_D10     →  PWM / SPI SS
Digital D11   →  W_D11     →  PWM / SPI MOSI
Digital D12   →  W_D12     →  SPI MISO
Digital D13   →  W_D13     →  LED_BUILTIN / SPI SCK
```

## A.7 — Formato JSON di Output (Schema Esatto)

```json
{
  "intent": "action|circuit|code|tutor|vision|navigation",
  "entities": ["componente1", "pin_name", "esperimento_id"],
  "actions": [
    "[AZIONE:play]",
    "[AZIONE:loadexp:v1-cap6-esp1]",
    "[AZIONE:opentab:simulator]",
    "[AZIONE:addwire:led1:anode:nano-r4-board:W_D3]",
    "[INTENT:{\"action\":\"place_and_wire\",\"components\":[{\"type\":\"led\"},{\"type\":\"resistor\"}],\"wires\":\"auto\"}]",
    "[AZIONE:setcode:void setup(){...}void loop(){...}]"
  ],
  "needs_llm": false,
  "response": "Simulazione avviata ▶",
  "llm_hint": null
}
```

## A.8 — Contesto Simulatore (Formato Input)

```
[CONTESTO]
tab: simulator
esperimento: v1-cap6-esp1
componenti: [led1, resistor1]
fili: 2
volume_attivo: 1
simulationMode: circuit

[MESSAGGIO]
Avvia la simulazione
```

Campi del contesto:
- `tab`: tab attualmente visibile (uno dei 10)
- `esperimento`: ID esperimento caricato o "nessuno"
- `componenti`: array di ID componenti sulla breadboard (con stato opzionale: `:ON`, `:220ohm`)
- `fili`: numero di fili collegati
- `volume_attivo`: 1, 2, o 3
- `simulationMode`: "circuit" (Vol1/2) o "avr" (Vol3 con codice Arduino)
- `step_corrente`: (opzionale) step del build passo-passo

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE B: FRAMEWORK META-TRAINING (SCALABILITÀ)
# ═══════════════════════════════════════════════════════════════

## B.1 — Come adattare a un nuovo modello base

```bash
# 1. Scarica il nuovo modello base (esempio: Llama 3.2 3B)
# 2. Aggiorna il notebook Colab:
#    - Cambia MODEL_NAME = "unsloth/llama-3.2-3b-bnb-4bit"
#    - Verifica chat_template compatibility
#    - Adatta max_seq_length se necessario
# 3. Addestra con lo STESSO dataset (galileo-brain-v2.jsonl)
# 4. Esporta GGUF
# 5. Aggiorna Modelfile:
#    - FROM ./nuovo-modello.gguf
#    - Aggiorna TEMPLATE se il formato chat è diverso
# 6. Testa con lo STESSO evaluation suite
# 7. Confronta grado
```

## B.2 — Come aggiungere nuove funzionalità

### Aggiungere un nuovo componente
```python
# In generate-brain-dataset-v2.py:
# 1. Aggiungi a COMPONENT_TYPES:
COMPONENT_TYPES["nuovo-comp"] = ["nome italiano", "alias1", "alias2"]
# 2. Aggiungi a PLACEABLE (se va sulla breadboard):
PLACEABLE.append("nuovo-comp")
# 3. Aggiungi a PIN_MAP:
PIN_MAP["nuovo-comp"] = ["pin_a", "pin_b"]
# 4. Aggiungi a COMP_ID_MAP:
COMP_ID_MAP["nuovo-comp"] = "nuovocomp"
# 5. Rigenera dataset + re-train
```

### Aggiungere un nuovo action tag
```python
# 1. Aggiungi esempi nel generatore appropriato
# 2. Aggiungi al BRAIN_SYSTEM_PROMPT nella sezione actions
# 3. Aggiungi al Modelfile SYSTEM prompt
# 4. Aggiungi test cases all'evaluation suite
# 5. Rigenera + re-train + re-test
```

### Aggiungere un nuovo tab
```python
# In generate-brain-dataset-v2.py:
# 1. Aggiungi a TABS
TABS.append("nuovo-tab")
# 2. Aggiungi a TAB_ALIASES:
TAB_ALIASES["nuovo-tab"] = ["nome italiano", "alias"]
# 3. Genera esempi di navigazione
# 4. Rigenera + re-train
```

### Aggiungere un nuovo esperimento
```python
# In generate-brain-dataset-v2.py:
# 1. Aggiungi a EXPERIMENTS:
EXPERIMENTS.append(("v3-cap9-esp1", "Nuovo Esperimento", 3))
# 2. Rigenera dataset
```

## B.3 — Hyperparameters per modelli diversi

| Parametro | Qwen3-4B (attuale) | Llama 3.2 3B | Mistral 7B | Gemma 2 2B | Phi-3 mini |
|-----------|---------------------|--------------|------------|------------|------------|
| r (LoRA rank) | 64 | 32 | 64 | 32 | 32 |
| alpha | 128 | 64 | 128 | 64 | 64 |
| dropout | 0.05 | 0.05 | 0.05 | 0.05 | 0.05 |
| lr | 2e-4 | 3e-4 | 1e-4 | 3e-4 | 2e-4 |
| epochs | 3 | 3-5 | 2-3 | 3-5 | 3 |
| batch_size | 2 | 2-4 | 1-2 | 4 | 2-4 |
| max_seq | 2048 | 2048 | 4096 | 2048 | 2048 |
| VRAM min | 6GB | 5GB | 12GB | 4GB | 5GB |
| Quantizzazione | Q4_K_M | Q4_K_M | Q4_K_M | Q4_K_M | Q4_K_M |
| Chat template | ChatML | Llama 3 | Mistral | Gemma | Phi-3 |

## B.4 — Checklist di versioning

Per ogni nuova versione del Brain:
```
[ ] Dataset: datasets/galileo-brain-v{N}.jsonl
[ ] GGUF: models/galileo-brain-v{N}-gguf.Q4_K_M.gguf
[ ] Report: datasets/brain-test-report-v{N}-{DATE}.md
[ ] Notebook: notebooks/galileo-brain-finetune-v{N}.ipynb
[ ] Modelfile: models/Modelfile (aggiornato FROM)
[ ] Changelog: docs/GALILEO-BRAIN-CHANGELOG.md (nuova entry)
```

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE C: TECNICHE DI MANTENIMENTO DEL CONTESTO
# ═══════════════════════════════════════════════════════════════

## C.1 — Memory Files (Persistenza tra sessioni)

```
~/.claude/projects/.../memory/MEMORY.md
├── Sezione "Galileo Brain PoC COMPLETO"
├── Score tracking (Session 75: AI 10/10)
└── Known issues (P0, P1, P2, P3)

elab-builder/docs/
├── GALILEO-BRAIN-MASTER-PROMPT.md     ← QUESTO FILE
├── GALILEO-BRAIN-TEST-GUIDE.md        ← Guida operativa
└── plans/
    ├── 2026-03-06-galileo-brain-dataset-poc-design.md
    └── GALILEO-BRAIN-KICKOFF.txt
```

## C.2 — Serena Memories (Plugin MCP)

```
Memories disponibili:
├── architecture          ← Architettura ELAB
├── galileo-brain/status  ← Stato attuale del Brain
├── galileo-brain/scores  ← Score per versione
└── galileo-brain/issues  ← Bug aperti
```

## C.3 — JSONL come Checkpoint

Ogni file JSONL è un checkpoint riproducibile:
- `galileo-brain-v1.jsonl` → PoC originale (500 esempi)
- `galileo-brain-v2.jsonl` → V2 con fix (2000 esempi)
- `galileo-brain-v3.jsonl` → Dopo primo raffinamento
- `evaluation-suite.jsonl` → Test fissi (mai modificati, solo aggiunti)

## C.4 — Report come Audit Trail

Ogni esecuzione di `test-brain-complete.py --report` genera:
```
datasets/brain-test-report-{MODEL}-{TIMESTAMP}.md
```

Formato:
```markdown
# Test Report — {MODEL} — {DATE}
## Overall Grade: {GRADE} ({SCORE}%)
## Per-Category Breakdown
## Per-Metric Accuracy
## Latency Statistics
## Failed Tests (dettaglio)
## Weak Areas
## Recommendations
```

## C.5 — Git come Version Control

```bash
# Ogni iterazione = un commit
git add datasets/galileo-brain-v{N}.jsonl
git add datasets/brain-test-report-v{N}-*.md
git commit -m "Brain V{N}: {GRADE} ({SCORE}%) - {IMPROVEMENTS}"
```

## C.6 — Plugin e Strumenti per Context Maintenance

| Plugin/Tool | Uso nel Brain Training |
|-------------|----------------------|
| **Serena MCP** | Memories per stato progetto, search codebase |
| **Context7** | Lookup documentazione Ollama, Unsloth, Qwen3 |
| **TodoWrite** | Tracking fasi di training |
| **Task agents** | Test paralleli, analisi multi-categoria |
| **Git** | Versioning dataset/modelli/report |
| **Bash** | Esecuzione Ollama, script Python, deploy |

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE D: COMANDI RAPIDI
# ═══════════════════════════════════════════════════════════════

## D.1 — Setup
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
ollama create galileo-brain -f models/Modelfile
```

## D.2 — Test rapido (6 intent)
```bash
# Action
curl -s http://localhost:11434/api/chat -d '{"model":"galileo-brain","messages":[{"role":"user","content":"[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1\n\n[MESSAGGIO]\nAvvia la simulazione"}],"stream":false}' | python3 -m json.tool

# Circuit
curl -s http://localhost:11434/api/chat -d '{"model":"galileo-brain","messages":[{"role":"user","content":"[CONTESTO]\ntab: simulator\nesperimento: nessuno\ncomponenti: []\nfili: 0\nvolume_attivo: 1\n\n[MESSAGGIO]\nMetti un LED sulla breadboard"}],"stream":false}' | python3 -m json.tool

# Tutor
curl -s http://localhost:11434/api/chat -d '{"model":"galileo-brain","messages":[{"role":"user","content":"[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1]\nfili: 1\nvolume_attivo: 1\n\n[MESSAGGIO]\nCos'\''è un LED?"}],"stream":false}' | python3 -m json.tool

# Navigation
curl -s http://localhost:11434/api/chat -d '{"model":"galileo-brain","messages":[{"role":"user","content":"[CONTESTO]\ntab: simulator\nesperimento: nessuno\ncomponenti: []\nfili: 0\nvolume_attivo: 1\n\n[MESSAGGIO]\nApri il volume 2"}],"stream":false}' | python3 -m json.tool

# Code
curl -s http://localhost:11434/api/chat -d '{"model":"galileo-brain","messages":[{"role":"user","content":"[CONTESTO]\ntab: editor\nesperimento: v3-cap6-blink\ncomponenti: [led1]\nfili: 1\nvolume_attivo: 3\nsimulationMode: avr\n\n[MESSAGGIO]\nScrivi il codice per il blink"}],"stream":false}' | python3 -m json.tool

# Vision
curl -s http://localhost:11434/api/chat -d '{"model":"galileo-brain","messages":[{"role":"user","content":"[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1\n\n[MESSAGGIO]\nGuarda il mio circuito, è giusto?"}],"stream":false}' | python3 -m json.tool
```

## D.3 — Test automatico completo
```bash
# Test base (120 eval suite)
python3 scripts/test-brain-complete.py

# Test completo (200 test)
python3 scripts/test-brain-complete.py --full

# Con report salvato
python3 scripts/test-brain-complete.py --full --report --verbose

# Solo una categoria
python3 scripts/test-brain-complete.py --category action
python3 scripts/test-brain-complete.py --category circuit
python3 scripts/test-brain-complete.py --category tutor
```

## D.4 — Raffinamento mirato
```bash
# Vedi aree deboli disponibili
python3 scripts/generate-refinement.py --list

# Genera dati per area debole specifica
python3 scripts/generate-refinement.py --weak-area play_pause --count 50
python3 scripts/generate-refinement.py --weak-area circuit_placement --count 30

# Genera per tutte le aree
python3 scripts/generate-refinement.py --weak-area all --count 200

# Unisci al dataset esistente
cat datasets/galileo-brain-v2.jsonl datasets/refinement-*.jsonl > datasets/galileo-brain-v3.jsonl
```

## D.5 — Re-training su Colab
```
1. Carica galileo-brain-v3.jsonl su Google Drive
2. Apri notebooks/galileo-brain-finetune-v2.ipynb
3. Modifica DATASET_PATH = "/content/drive/MyDrive/galileo-brain-v3.jsonl"
4. Esegui tutte le celle
5. Scarica il nuovo GGUF dalla cella di export
6. Rinomina: galileo-brain-v3-gguf.Q4_K_M.gguf
7. Aggiorna models/Modelfile → FROM ./galileo-brain-v3-gguf.Q4_K_M.gguf
8. Ricrea: ollama create galileo-brain -f models/Modelfile
9. Re-test: python3 scripts/test-brain-complete.py --full --report
```

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE E: TEMPLATE DI ESEMPIO (ChatML Training)
# ═══════════════════════════════════════════════════════════════

## E.1 — Esempio: Action → play
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sei il Galileo Brain, il cervello di routing dell'assistente AI ELAB Tutor..."
    },
    {
      "role": "user",
      "content": "[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1\n\n[MESSAGGIO]\nAvvia la simulazione"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"action\", \"entities\": [], \"actions\": [\"[AZIONE:play]\"], \"needs_llm\": false, \"response\": \"Simulazione avviata \\u25b6\", \"llm_hint\": null}"
    }
  ]
}
```

## E.2 — Esempio: Circuit → multi-component
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sei il Galileo Brain..."
    },
    {
      "role": "user",
      "content": "[CONTESTO]\ntab: simulator\nesperimento: nessuno\ncomponenti: []\nfili: 0\nvolume_attivo: 1\n\n[MESSAGGIO]\nCostruisci un circuito con LED e resistore"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"circuit\", \"entities\": [\"led\", \"resistor\"], \"actions\": [\"[INTENT:{\\\"action\\\":\\\"place_and_wire\\\",\\\"components\\\":[{\\\"type\\\":\\\"led\\\"},{\\\"type\\\":\\\"resistor\\\"}],\\\"wires\\\":\\\"auto\\\"}]\"], \"needs_llm\": false, \"response\": \"Piazzo LED e resistore con cablaggio automatico\", \"llm_hint\": null}"
    }
  ]
}
```

## E.3 — Esempio: Tutor → spiegazione (needs_llm=true)
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sei il Galileo Brain..."
    },
    {
      "role": "user",
      "content": "[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1\n\n[MESSAGGIO]\nPerché serve un resistore con il LED?"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"tutor\", \"entities\": [\"resistor\", \"led\"], \"actions\": [], \"needs_llm\": true, \"response\": null, \"llm_hint\": \"Lo studente chiede perche serve un resistore con il LED. Spiega: il LED ha una resistenza interna molto bassa, senza resistore la corrente sarebbe troppo alta e brucerebbe il LED. Il resistore limita la corrente. Usa analogie con l'acqua (tubo stretto). Livello: principiante, Volume 1.\"}"
    }
  ]
}
```

## E.4 — Esempio: Vision (needs_llm=true)
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sei il Galileo Brain..."
    },
    {
      "role": "user",
      "content": "[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1\n\n[MESSAGGIO]\nGuarda il mio circuito e dimmi se è giusto"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"vision\", \"entities\": [\"led1\", \"resistor1\"], \"actions\": [], \"needs_llm\": true, \"response\": null, \"llm_hint\": \"Lo studente chiede di analizzare visivamente il circuito. Contesto: esperimento v1-cap6-esp1 (primo LED), componenti presenti: led1, resistor1 con 2 fili. Analizza lo screenshot per verificare: 1) LED orientato correttamente (anodo verso positivo), 2) Resistore in serie, 3) Collegamenti corretti alla breadboard.\"}"
    }
  ]
}
```

## E.5 — Esempio: Edge case — catena multi-azione
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Sei il Galileo Brain..."
    },
    {
      "role": "user",
      "content": "[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1, resistor1]\nfili: 2\nvolume_attivo: 1\n\n[MESSAGGIO]\nRicomincia tutto e poi avvia"
    },
    {
      "role": "assistant",
      "content": "{\"intent\": \"action\", \"entities\": [], \"actions\": [\"[AZIONE:clearall]\", \"[AZIONE:play]\"], \"needs_llm\": false, \"response\": \"Breadboard svuotata e simulazione avviata \\u25b6\", \"llm_hint\": null}"
    }
  ]
}
```

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE F: META-TRAINER — IL CUORE DEL SISTEMA
# ═══════════════════════════════════════════════════════════════

Il Meta-Trainer è ciò che rende il Galileo Brain **auto-evolutivo**.
Non è un semplice modello fine-tuned — è un **sistema che sa addestrare altri modelli**.

## F.1 — Architettura del Meta-Trainer

```
╔══════════════════════════════════════════════════════════╗
║              META-TRAINER PIPELINE                        ║
║                                                          ║
║  INPUT: Qualsiasi modello base (GGUF, HF, ONNX)         ║
║  OUTPUT: Modello specializzato ELAB con grado S          ║
║                                                          ║
║  ┌─────────────────────────────────────────────────┐     ║
║  │ FASE 0: DISCOVERY                                │     ║
║  │ • Identifica architettura modello                 │     ║
║  │ • Determina chat template (ChatML/Llama3/Mistral) │     ║
║  │ • Calcola VRAM richiesta → hyperparams            │     ║
║  │ • Genera Modelfile/config appropriato             │     ║
║  └──────────────────────┬──────────────────────────┘     ║
║                         │                                 ║
║  ┌──────────────────────▼──────────────────────────┐     ║
║  │ FASE 1: DATASET GENERATION                       │     ║
║  │ • Usa BRAIN_SYSTEM_PROMPT come base              │     ║
║  │ • Genera N esempi per ogni intent (bilanciati)   │     ║
║  │ • Adatta formato al chat template del modello    │     ║
║  │ • Include edge cases (10%+), varianti italiane   │     ║
║  │ • Validazione automatica: JSON, intent, actions  │     ║
║  └──────────────────────┬──────────────────────────┘     ║
║                         │                                 ║
║  ┌──────────────────────▼──────────────────────────┐     ║
║  │ FASE 2: TRAINING                                 │     ║
║  │ • LoRA fine-tune con Unsloth (o equivalente)     │     ║
║  │ • Hyperparams adattati al modello (vedi B.3)     │     ║
║  │ • 3-5 epoche, early stopping su val loss         │     ║
║  │ • Export GGUF Q4_K_M                             │     ║
║  └──────────────────────┬──────────────────────────┘     ║
║                         │                                 ║
║  ┌──────────────────────▼──────────────────────────┐     ║
║  │ FASE 3: EVALUATION                               │     ║
║  │ • 200+ test cases (eval suite + stress)          │     ║
║  │ • Per-intent, per-metric, per-action breakdown   │     ║
║  │ • Latency profiling (P50, P95, P99, max)         │     ║
║  │ • Grado: S/A/B/C/D/F                            │     ║
║  └──────────────────────┬──────────────────────────┘     ║
║                         │                                 ║
║              ┌──────────▼──────────┐                     ║
║              │ Grado ≥ S (98%) ?   │                     ║
║              └──────┬──────┬───────┘                     ║
║                  SÌ │      │ NO                          ║
║          ┌──────────▼┐  ┌──▼──────────────────────┐     ║
║          │ DEPLOY    │  │ FASE 4: REFINEMENT       │     ║
║          │ Produzione│  │ • Analizza weak areas    │     ║
║          └───────────┘  │ • Genera dati mirati     │     ║
║                         │ • Merge dataset           │     ║
║                         │ • TORNA A FASE 2          │     ║
║                         └──────────────────────────┘     ║
║                                                          ║
║  Max iterazioni: 5 (se dopo 5 non è S → cambia modello)║
╚══════════════════════════════════════════════════════════╝
```

## F.2 — Script di Orchestrazione Automatica

Il Meta-Trainer si materializza in uno script che automatizza TUTTO il ciclo:

```python
# scripts/meta-trainer.py (da creare)
#
# USO:
#   python3 scripts/meta-trainer.py --base-model qwen3-4b --target-grade S
#   python3 scripts/meta-trainer.py --base-model llama-3.2-3b --target-grade A
#   python3 scripts/meta-trainer.py --base-model mistral-7b --iterations 3
#
# FASI:
#   1. Discovery: identifica modello → genera config
#   2. Generate: crea dataset adatto al modello
#   3. Train: fine-tune LoRA (richiede Colab/GPU)
#   4. Test: 200+ test automatici
#   5. Analyze: identifica weak areas
#   6. Refine: genera dati mirati per weak areas
#   7. Loop: torna a 3 fino a grado target
#
# COMANDI DISPONIBILI:
#   --discover    Solo fase 0 (identifica modello)
#   --generate    Solo fase 1 (genera dataset)
#   --test        Solo fase 3 (testa modello esistente)
#   --analyze     Solo fase 4 (analizza ultimo report)
#   --refine      Solo fasi 4-5 (analizza + genera refinement)
#   --full-cycle  Tutte le fasi in sequenza
```

## F.3 — Chat Templates per Modelli Diversi

Il Meta-Trainer sa adattare il dataset al formato chat di qualsiasi modello:

### ChatML (Qwen3, Yi, internlm)
```
<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{user_message}<|im_end|>
<|im_start|>assistant
{assistant_response}<|im_end|>
```

### Llama 3 format
```
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>
{user_message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{assistant_response}<|eot_id|>
```

### Mistral format
```
[INST] {system_prompt}

{user_message} [/INST]{assistant_response}</s>
```

### Gemma format
```
<start_of_turn>user
{system_prompt}\n{user_message}<end_of_turn>
<start_of_turn>model
{assistant_response}<end_of_turn>
```

### Phi-3 format
```
<|system|>
{system_prompt}<|end|>
<|user|>
{user_message}<|end|>
<|assistant|>
{assistant_response}<|end|>
```

## F.4 — Matrice di Compatibilità Modello

| Modello | Parametri | VRAM min | Template | Unsloth? | Note |
|---------|-----------|----------|----------|----------|------|
| Qwen3-4B | 3.8B | 6GB | ChatML | ✅ | **Attuale** — proven V1 |
| Qwen3-8B | 8B | 10GB | ChatML | ✅ | Più potente, stesso template |
| Llama 3.2 3B | 3.2B | 5GB | Llama3 | ✅ | Efficiente, ottimo reasoning |
| Llama 3.2 1B | 1.2B | 3GB | Llama3 | ✅ | Ultra-leggero, potrebbe non bastare |
| Mistral 7B | 7.3B | 12GB | Mistral | ✅ | Forte su struttura, verboso |
| Gemma 2 2B | 2.6B | 4GB | Gemma | ✅ | Google, compatto, buon JSON |
| Gemma 2 9B | 9B | 14GB | Gemma | ✅ | Eccellente, richiede GPU forte |
| Phi-3 mini | 3.8B | 5GB | Phi | ✅ | Microsoft, forte reasoning |
| Phi-3.5 mini | 3.8B | 5GB | Phi | ✅ | Migliorato su JSON |
| DeepSeek-R1 1.5B | 1.5B | 3GB | ChatML | ✅ | Reasoning model, compatto |

## F.5 — Regole di Adattamento Automatico

Il Meta-Trainer applica queste regole quando incontra un nuovo modello:

```
RULE MT-1: Se VRAM < 6GB → r=32, alpha=64, batch_size=1, gradient_accumulation=8
RULE MT-2: Se VRAM >= 6GB < 12GB → r=64, alpha=128, batch_size=2, gradient_accumulation=4
RULE MT-3: Se VRAM >= 12GB → r=128, alpha=256, batch_size=4, gradient_accumulation=2
RULE MT-4: Se modello < 3B parametri → epochs=5, lr=3e-4 (impara più lentamente)
RULE MT-5: Se modello >= 3B < 8B parametri → epochs=3, lr=2e-4 (sweet spot)
RULE MT-6: Se modello >= 8B parametri → epochs=2, lr=1e-4 (meno epochs, già potente)
RULE MT-7: max_seq_length = min(4096, max supportato dal modello)
RULE MT-8: Se il template NON è ChatML → converti TUTTI i dataset dal formato ChatML
RULE MT-9: Se dopo 3 iterazioni il grado non migliora → aumenta dataset del 50%
RULE MT-10: Se dopo 5 iterazioni non raggiunge il target → CAMBIA MODELLO BASE
```

## F.6 — Il Dataset come "DNA" del Sistema

Il dataset è il **DNA immutabile** — la conoscenza di ELAB Tutor codificata:

```
galileo-brain-v2.jsonl (2000 esempi)
├── 30% action (600 esempi)
│   ├── play (80) — "avvia", "accendi", "start", "dai corrente", "prova"...
│   ├── pause (60) — "ferma", "stop", "pausa", "basta", "spegni"...
│   ├── reset (40) — "reset", "ricomincia", "da capo"...
│   ├── clearall (60) — "cancella tutto", "svuota", "togli tutto"...
│   ├── compile (50) — "compila", "verifica", "carica programma"...
│   ├── diagnose (40) — "diagnostica", "cosa non va", "controlla"...
│   ├── quiz (30) — "quiz", "testami", "interrogami"...
│   ├── interact (50) — "premi pulsante", "gira pot", "accendi LED"...
│   ├── highlight (40) — "evidenzia", "mostrami", "dove è"...
│   ├── measure (30) — "misura", "quanti volt", "tensione"...
│   ├── setvalue (30) — "imposta", "cambia resistenza", "metti 470 ohm"...
│   ├── movecomponent (20) — "sposta", "muovi", "a destra"...
│   ├── youtube (20) — "cerca video", "tutorial"...
│   └── createnotebook (10) — "crea taccuino", "nuovo appunto"...
│
├── 20% circuit (400 esempi)
│   ├── single_placement (150) — tutti i 14 componenti piazzabili
│   ├── multi_component (100) — combinazioni 2-5 componenti
│   ├── wiring (100) — addwire con pin corretti
│   └── removal (50) — removecomponent, removewire
│
├── 15% tutor (300 esempi)
│   ├── explanation (200) — "cos'è", "come funziona", "perché"
│   ├── greeting (30) — "ciao", "buongiorno", saluti
│   └── off_topic (70) — fuori tema, non ELAB
│
├── 15% navigation (300 esempi)
│   ├── loadexp (120) — tutti i 69 esperimenti
│   ├── opentab (120) — tutti i 10 tab con sinonimi
│   └── openvolume (60) — volume 1, 2, 3
│
├── 10% code (200 esempi)
│   ├── setcode (80) — codice Arduino reale (blink, fade, serial)
│   ├── compile (30) — compilazione
│   ├── error_debug (50) — errori, scope, syntax
│   └── scratch (40) — editor blocchi, Blockly
│
└── 10% vision (200 esempi)
    ├── direct (80) — "guarda", "analizza", "controlla"
    ├── canvas (40) — dal tab canvas
    ├── implicit (40) — senza verbo esplicito
    └── debug (40) — "è giusto?", "cosa manca?"
```

## F.7 — Processo di Raffinamento Autonomo

Quando il test rivela weak areas, il Meta-Trainer sa ESATTAMENTE cosa fare:

| Weak Area Rilevata | Azione Automatica | Script |
|--------------------|-------------------|--------|
| Intent confusion action↔tutor | Genera 50+ esempi boundary ("come faccio a..." vs "come funziona...") | `--weak-area tutor_theory` |
| play/pause/reset confusi | Genera 100+ varianti con sinonimi italiani estremi | `--weak-area play_pause` |
| Pin names errati | Genera 50+ esempi con OGNI combinazione componente-pin | `--weak-area circuit_placement` |
| Navigazione imprecisa | Genera 80+ esempi con tutti i 69 esperimenti + 10 tab | `--weak-area navigation` |
| Vision non riconosciuta | Genera 40+ trigger impliciti ("il mio circuito è OK?") | `--weak-area vision` |
| setcode senza codice | Genera 30+ esempi con codice Arduino completo embedded | `--weak-area code` |
| Multi-azione fallisce | Genera 30+ catene 2-4 azioni ("resetta e poi avvia") | `--weak-area multi_action` |
| Typo/slang non gestiti | Genera 40+ varianti con errori ortografici e slang | `--weak-area edge_typo` |

## F.8 — Evoluzione Temporale Prevista

```
2026 Q1: Galileo Brain V2 (Qwen3-4B) — Routing brain base
2026 Q2: Galileo Brain V3 (raffinato) — Grado S raggiunto
2026 Q3: Meta-Trainer script completo — addestramento automatico
2026 Q4: Test con Llama 3.2 e Gemma 2 — conferma model-agnostic
2027+:   Il Meta-Trainer addestra qualsiasi nuovo modello rilasciato,
         adattando hyperparams e template automaticamente.
         Il DNA (dataset) cresce con nuovi esperimenti/componenti.
```

## F.9 — Come usare il Meta-Trainer (Step-by-Step)

### Scenario: Arriva Llama 4 e vuoi migrare

```bash
# 1. Il Meta-Trainer identifica il modello
python3 scripts/meta-trainer.py --discover --base-model llama-4-3b
# Output: template=llama4, vram=5GB, suggerito: r=32, epochs=4

# 2. Genera dataset nel formato corretto
python3 scripts/meta-trainer.py --generate --base-model llama-4-3b --count 2000
# Output: datasets/galileo-brain-llama4-v1.jsonl (2000 esempi in formato Llama4)

# 3. Addestra (su Colab o locale)
python3 scripts/meta-trainer.py --train --base-model llama-4-3b
# Output: models/galileo-brain-llama4-v1-gguf.Q4_K_M.gguf

# 4. Testa
python3 scripts/meta-trainer.py --test --model galileo-brain-llama4
# Output: Grado B (91.3%) — weak: circuit_placement (82%), vision (85%)

# 5. Raffina automaticamente
python3 scripts/meta-trainer.py --refine --model galileo-brain-llama4
# Output: datasets/refinement-llama4-circuit-50.jsonl + refinement-llama4-vision-30.jsonl

# 6. Re-addestra con dati mirati
python3 scripts/meta-trainer.py --train --base-model llama-4-3b --dataset merged
# Output: models/galileo-brain-llama4-v2-gguf.Q4_K_M.gguf

# 7. Re-testa
python3 scripts/meta-trainer.py --test --model galileo-brain-llama4
# Output: Grado A (96.8%) — in miglioramento

# 8. Ciclo completo automatico (fa tutto da solo)
python3 scripts/meta-trainer.py --full-cycle --base-model llama-4-3b --target-grade S
# Si ferma solo quando raggiunge S o dopo 5 iterazioni
```

---

# ═══════════════════════════════════════════════════════════════
# APPENDICE G: INTEGRAZIONE CON PLUGIN E TOOL
# ═══════════════════════════════════════════════════════════════

## G.1 — Plugin utilizzati nel workflow

| Plugin | Uso | Comando/API |
|--------|-----|-------------|
| **Serena MCP** | Memoria progetto, search codice, find symbol | `write_memory`, `read_memory`, `find_symbol` |
| **Context7** | Documentazione Ollama, Unsloth, PyTorch | `resolve-library-id`, `query-docs` |
| **Playwright** | Test UI del simulatore dopo integrazione | `browser_navigate`, `browser_snapshot` |
| **Firebase** | (futuro) Storage modelli su cloud | `firebase_init` |
| **Pinecone** | (futuro) Vector search su dataset di training | `search-records` |
| **Notion** | Tracking iterazioni, report condivisi | `notion-create-pages`, `notion-search` |
| **Git (Bash)** | Versioning dataset, modelli, report | `git add`, `git commit`, `git push` |
| **Ollama (Bash)** | Inference locale, creazione modelli | `ollama create`, `ollama run` |
| **Python (Bash)** | Script di training, test, refinement | `python3 scripts/*.py` |
| **Colab (Web)** | GPU training (T4/A100) | Upload notebook + dataset |

## G.2 — Tecniche di Context Maintenance

### 1. Memory Files (Persistenza inter-sessione)
```
MEMORY.md → Score, architettura, known issues (aggiornato ogni sessione)
docs/GALILEO-BRAIN-MASTER-PROMPT.md → QUESTO FILE (singolo punto di verità)
```

### 2. Serena Memories (Plugin MCP)
```bash
# Salva stato attuale
mcp__serena__write_memory("galileo-brain/current-version", "V2, Grado: TBD, ...")
# Leggi prima di iniziare
mcp__serena__read_memory("galileo-brain/current-version")
```

### 3. JSONL Checkpoint (Riproducibilità)
```
datasets/galileo-brain-v1.jsonl → 500 esempi (PoC)
datasets/galileo-brain-v2.jsonl → 2000 esempi (current)
datasets/galileo-brain-v3.jsonl → 2000+ esempi (dopo refinement)
evaluation-suite.jsonl → 120 test (mai modificati, solo aggiunti)
```

### 4. Report Markdown (Audit Trail)
```
datasets/brain-test-report-{MODEL}-{TIMESTAMP}.md
→ Grado, per-category, per-metric, latency, failed, recommendations
```

### 5. Git Version Control
```bash
git tag galileo-brain-v2 -m "V2: 2000 examples, pre-test"
git tag galileo-brain-v3 -m "V3: refined, Grade S (98.5%)"
```

### 6. TodoWrite (Tracking fasi in-session)
```
[ ] FASE 1: Setup Ollama
[ ] FASE 2: Test baseline
[ ] FASE 3: Refinement round 1
[ ] FASE 4: Re-test → Grado?
[ ] FASE 5: Integration
```

### 7. Task Agents (Parallelismo)
```
Agent 1: Testa categoria "action" (80 test)
Agent 2: Testa categoria "circuit" (40 test)
Agent 3: Testa categoria "tutor" (30 test)
→ Risultati combinati per report finale
```

---

**Fine del Master Prompt — Versione 3.0.0 META-TRAINER EDITION**
**Questo documento è il singolo punto di verità per il training, test, raffinamento e EVOLUZIONE del Galileo Brain.**
**Il sistema sa addestrare sé stesso e qualsiasi modello futuro.**
**Aggiornalo OGNI volta che cambi componenti, tab, esperimenti, action tag, modelli supportati, o regole.**
