# GALILEO ONNISCIENTE — Design Document Definitivo
**Data:** 13/03/2026 — Session 116
**Obiettivo:** Rendere Galileo onnipotente e onnisciente sulla piattaforma ELAB, poi aggiungere controllo vocale
**Prerequisito:** Documento S115 `2026-03-12-galileo-queen-platform-mastery.md` (mappatura completa)

---

## EXECUTIVE SUMMARY

Il progetto si divide in **4 Fasi** sequenziali:

| Fase | Nome | Scopo | Effort |
|------|------|-------|--------|
| **FASE 1** | Context Mastery | Galileo sa TUTTO ciò che succede in tempo reale | 6h |
| **FASE 2** | Memory Evolution | Galileo ricorda, impara, e riprende le sessioni | 8h |
| **FASE 3** | Qwen Training V3 | Modello fine-tuned che classifica PERFETTAMENTE | 10h |
| **FASE 4** | Voice Control | Input/output vocale in italiano | 16h |

**Lezione dal PoC (S75):** Il Qwen V2 ha FALLITO (20.8% accuracy) perché:
1. Dataset generato con troppa variazione linguistica e poca consistenza nei tag
2. Il modello "allucina" tag plausibili (`[AZIONE:avviaSimulator]` invece di `[AZIONE:play]`)
3. 2000 esempi sono insufficienti per un modello 4B

**Nuova strategia:** PRIMA implementare Context Mastery + Memory (FASI 1-2) nel sistema ATTUALE (regex + LLM racing), POI usare i dati REALI raccolti dal sistema in produzione per generare un dataset di training PERFETTO per Qwen V3.

---

## FASE 1 — CONTEXT MASTERY (6h)

### Obiettivo
Galileo riceve in ogni messaggio lo stato COMPLETO della piattaforma: cosa l'utente sta facendo, ha fatto, e vede.

### 1.1 Activity Ring Buffer (nuovo)

**File:** `src/services/activityTracker.js` (NUOVO)

```javascript
// Singleton globale — traccia le ultime 20 azioni dell'utente
class ActivityTracker {
  constructor() {
    this.buffer = [];        // [{type, detail, timestamp}]
    this.maxSize = 20;
  }

  push(type, detail = {}) {
    this.buffer.push({
      type,                   // 'component_added' | 'wire_added' | 'compile_success' | 'compile_error' | ...
      detail,                 // {componentId, componentType, error, ...}
      ts: Date.now()
    });
    if (this.buffer.length > this.maxSize) this.buffer.shift();
  }

  getRecent(n = 5) {
    return this.buffer.slice(-n);
  }

  getForContext() {
    // Formato compatto per il contesto Galileo
    return this.getRecent(5).map(a => {
      const age = Math.round((Date.now() - a.ts) / 1000);
      return `[${age}s ago] ${a.type}: ${JSON.stringify(a.detail)}`;
    }).join('\n');
  }
}

export const activityTracker = new ActivityTracker();
window.__ELAB_ACTIVITY = activityTracker;
```

**Dove iniettare push():**

| Evento | type | detail | File |
|--------|------|--------|------|
| Componente aggiunto | `component_added` | `{id, type}` | NewElabSimulator.jsx |
| Componente rimosso | `component_removed` | `{id, type}` | NewElabSimulator.jsx |
| Componente spostato | `component_moved` | `{id, from, to}` | NewElabSimulator.jsx |
| Filo aggiunto | `wire_added` | `{from, to, color}` | NewElabSimulator.jsx |
| Filo rimosso | `wire_removed` | `{index}` | NewElabSimulator.jsx |
| Compilazione OK | `compile_success` | `{bytes, percent}` | NewElabSimulator.jsx |
| Compilazione errore | `compile_error` | `{errors: [...]}` | NewElabSimulator.jsx |
| Simulazione avviata | `simulation_started` | `{}` | NewElabSimulator.jsx |
| Simulazione fermata | `simulation_stopped` | `{}` | NewElabSimulator.jsx |
| Tab cambiata | `tab_changed` | `{from, to}` | App.jsx / NewElabSimulator.jsx |
| Esperimento caricato | `experiment_loaded` | `{id, title}` | NewElabSimulator.jsx |
| Build step avanzato | `build_step_advanced` | `{step, total}` | NewElabSimulator.jsx |
| Interazione componente | `component_interacted` | `{id, action, value}` | NewElabSimulator.jsx |
| Editor aperto/chiuso | `editor_toggled` | `{visible, mode}` | NewElabSimulator.jsx |
| Quiz completato | `quiz_completed` | `{score, total}` | ElabTutorV4.jsx |
| Disegno canvas | `canvas_draw` | `{tool}` | CanvasTab |
| Undo/Redo | `undo` / `redo` | `{}` | NewElabSimulator.jsx |

### 1.2 Contesto Esteso per Galileo

**File da modificare:** `src/services/api.js` → funzione `buildTutorContext()`

**Nuovo formato del contesto (aggiunto ai campi esistenti):**

```
[ATTIVITÀ RECENTE]
1. [5s fa] compile_error: {"errors":["line 5: undefined reference to 'loop'"]}
2. [12s fa] component_added: {"id":"led1","type":"led"}
3. [18s fa] wire_added: {"from":"led1:anode","to":"r1:pin1"}
4. [30s fa] experiment_loaded: {"id":"v1-cap6-esp1"}
5. [45s fa] tab_changed: {"to":"simulatore"}

[COMPONENTE SELEZIONATO]
id: led1, tipo: led, colore: rosso, stato: OFF

[ERRORI COMPILAZIONE]
status: error
errori: ["line 5: undefined reference to 'loop'"]
timestamp: 12:03:15

[OUTPUT SERIALE]
ultime 5 righe:
> Hello World!
> LED: ON
> Temp: 23.5C

[EDITOR]
modo: arduino | visibile: true | codice: 42 righe

[SESSIONE]
tempo_su_esperimento: 180s | tentativi_compilazione: 3 | compilazioni_fallite: 2
```

**Budget token:** ~300-400 token aggiuntivi (da ~200 attuali a ~500-600 totali). Accettabile per DeepSeek/Groq (128K context).

### 1.3 Nuovi Campi circuitState

**File:** `src/services/simulator-api.js` → `getSimulatorContext()`

```javascript
// Aggiungere al return di getSimulatorContext():
return {
  // ... campi esistenti ...

  // NUOVI:
  selectedComponent: selectedComponentId ? {
    id: selectedComponentId,
    type: components[selectedComponentId]?.type,
    properties: components[selectedComponentId]?.properties
  } : null,

  compilationResult: lastCompilationResult, // {status, errors, warnings, bytes, timestamp}

  serialOutput: {
    lastLines: serialBuffer.slice(-10),
    lineCount: serialBuffer.length,
    hasErrors: serialBuffer.some(l => l.includes('ERROR'))
  },

  editorState: {
    mode: editorMode,          // 'arduino' | 'scratch'
    visible: isEditorVisible,
    lineCount: editorCode?.split('\n').length || 0
  },

  sessionMetrics: {
    timeOnExperiment: Math.round((Date.now() - experimentLoadTime) / 1000),
    compilationAttempts: compilationCount,
    failedCompilations: failedCompilationCount,
    lastInteractionAge: Math.round((Date.now() - lastInteractionTime) / 1000)
  },

  recentActivity: activityTracker.getForContext()
};
```

### 1.4 Criteri PASS Sprint 1

- [ ] `[ATTIVITÀ RECENTE]` presente in ogni chat request (ultime 5 azioni)
- [ ] Galileo risponde "Vedo che hai appena avuto un errore..." dopo compile_error
- [ ] "Cos'è questo?" con componente selezionato → risposta corretta
- [ ] Errori di compilazione auto-inviati nel contesto
- [ ] Serial output visibile a Galileo (ultime 10 righe)
- [ ] Editor mode (scratch/arduino) nel contesto
- [ ] Session metrics (tempo, tentativi) nel contesto
- [ ] Token budget context ≤ 600 token
- [ ] Build 0 errori + deploy Vercel + Render

---

## FASE 2 — MEMORY EVOLUTION (8h)

### 2.1 Memoria a 3 Livelli (Architettura)

```
┌──────────────────────────────────────────────────────────────┐
│ LIVELLO 1: Sessione (React state + ActivityTracker)          │
│ ├─ Chat history (messages[])                                  │
│ ├─ Circuit state (components, wires, code)                    │
│ ├─ Activity buffer (ultime 20 azioni)                         │
│ ├─ Session metrics (tempo, tentativi, errori)                 │
│ └─ TTL: durata del tab browser                                │
├──────────────────────────────────────────────────────────────┤
│ LIVELLO 2: Persistente Locale (localStorage)                  │
│ ├─ Preferenze UI (editor mode, font size, volume, theme)      │
│ ├─ Ultimo stato circuito per esperimento                      │
│ ├─ lastSessionContext (per ripresa sessione)                  │
│ ├─ Circuiti custom salvati dall'utente                        │
│ └─ TTL: indefinito (fino a clear cache)                       │
├──────────────────────────────────────────────────────────────┤
│ LIVELLO 3: Persistente Remoto (nanobot /memory/)              │
│ ├─ Profilo studente evoluto                                   │
│ │   ├─ livello (1-5, calcolato da pattern)                    │
│ │   ├─ esperimenti completati (lista + date)                  │
│ │   ├─ punti forti (categorie: "circuiti passivi", "C++")     │
│ │   ├─ punti deboli (categorie: "polarità", "variabili")      │
│ │   └─ stile apprendimento (visivo/pratico/teorico)           │
│ ├─ Pattern di errore analizzati                               │
│ │   ├─ errori_ricorrenti: [{tipo, count, ultimo}]             │
│ │   ├─ misconceptions: ["LED non ha polarità"]                │
│ │   └─ errori_corretti: [{tipo, sessione}]                    │
│ ├─ Riassunti sessione (ultimi 10)                             │
│ │   ├─ esperimento, durata, risultato                         │
│ │   ├─ keywords principali                                    │
│ │   └─ mood (frustrato/entusiasta/neutro)                     │
│ └─ TTL: 90 giorni rolling                                     │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Session Resume (lastSessionContext)

**File:** `src/services/galileoMemory.js`

```javascript
// Salva su sendBeacon (tab close) + ogni 60s sync
const lastSessionContext = {
  experimentId: "v1-cap6-esp1",
  experimentTitle: "Accendi il tuo primo LED",
  buildMode: "guided",
  buildStep: 4,
  buildStepTotal: 7,
  editorMode: "arduino",
  compilationStatus: "success",
  lastMessage: "Come collego il resistore?",
  circuitComponents: ["bat1", "bb1", "r1", "led1"],
  timestamp: new Date().toISOString()
};

// Al rientro, Galileo riceve:
// "L'ultima volta l'utente stava lavorando sull'esperimento
//  'Accendi il tuo primo LED', era al passo 4/7 della costruzione
//  guidata. Il suo ultimo messaggio era: 'Come collego il resistore?'"
```

### 2.3 Error Pattern Analysis

**File:** `nanobot/server.py` → endpoint `/memory/sync`

```python
def analyze_error_patterns(memory_data):
    """Analizza i pattern di errore dello studente."""
    errors = memory_data.get('recent_errors', [])
    patterns = {}

    for err in errors:
        err_type = classify_error(err)  # 'polarity', 'missing_resistor', 'syntax', etc.
        if err_type not in patterns:
            patterns[err_type] = {'count': 0, 'last_seen': None, 'examples': []}
        patterns[err_type]['count'] += 1
        patterns[err_type]['last_seen'] = err.get('timestamp')
        if len(patterns[err_type]['examples']) < 3:
            patterns[err_type]['examples'].append(err.get('detail'))

    # Genera insight per Galileo
    insights = []
    for err_type, data in patterns.items():
        if data['count'] >= 3:
            insights.append({
                'type': err_type,
                'count': data['count'],
                'message': ERROR_INSIGHTS[err_type]  # "Noto che sbagli spesso la polarità del LED..."
            })

    return insights

ERROR_INSIGHTS = {
    'polarity': "Noto che hai avuto difficoltà con la polarità dei componenti. Ricorda: il LED ha l'anodo (+) più lungo e il catodo (-) più corto!",
    'missing_resistor': "Hai dimenticato il resistore alcune volte. È fondamentale: senza resistore, il LED si brucia!",
    'syntax_semicolon': "Gli errori di punto e virgola sono comuni all'inizio. Ogni istruzione in Arduino C++ finisce con ;",
    'undefined_variable': "Ricorda di dichiarare le variabili prima di usarle. Esempio: int ledPin = 13;",
    'wrong_pin': "Controlla sempre i numeri dei pin. Nell'Arduino Nano R4: D0-D13 sono digitali, A0-A5 sono analogici."
}
```

### 2.4 Proactive Help System

**File:** `src/components/ElabTutorV4.jsx`

```javascript
// Timer che controlla ogni 60 secondi se lo studente è bloccato
useEffect(() => {
  const proactiveTimer = setInterval(() => {
    const metrics = window.__ELAB_API?.getSimulatorContext()?.sessionMetrics;
    if (!metrics) return;

    // Studente inattivo da >5 minuti
    if (metrics.lastInteractionAge > 300 && !proactiveHintSent.current) {
      appendSystemMessage("Hai bisogno di un suggerimento per questo passo? 💡");
      proactiveHintSent.current = true;
    }

    // 3+ errori compilazione consecutivi
    if (metrics.failedCompilations > 3 && !compileHelpSent.current) {
      appendSystemMessage("Vedo che il codice dà problemi. Vuoi che ti aiuti a correggerlo? 🔧");
      compileHelpSent.current = true;
    }

    // Circuito completo ma non avviato
    const ctx = window.__ELAB_API?.getSimulatorContext();
    if (ctx?.allStepsComplete && !ctx?.isSimulating && !runHintSent.current) {
      appendSystemMessage("Il circuito è completo! Premi ▶ per provarlo! 🎉");
      runHintSent.current = true;
    }

  }, 60000);

  return () => clearInterval(proactiveTimer);
}, []);
```

### 2.5 Criteri PASS Sprint 2

- [ ] Al rientro: "Bentornato! L'ultima volta stavamo lavorando su [esperimento]"
- [ ] lastSessionContext salvato su sendBeacon (tab close)
- [ ] Error pattern: dopo 3+ errori "polarità" → insight personalizzato
- [ ] Preferenze UI persistenti (editor mode, font size, ultimo volume)
- [ ] Proactive help: studente inattivo >5min → suggerimento
- [ ] Proactive help: 3+ compile error → offerta auto-fix
- [ ] NO false positive proattivi

---

## FASE 3 — QWEN TRAINING V3 (10h)

### 3.1 Cambio di Strategia Fondamentale

**PoC V2 (FALLITO):**
- 2000 esempi generati programmaticamente con alta variazione linguistica
- Training end-to-end: messaggio → routing JSON completo
- Risultato: 20.8% accuracy (modello allucina tag)

**V3 (NUOVA STRATEGIA):**
- **Dataset da dati REALI** raccolti dalla Fase 1-2 in produzione
- **Approccio ibrido**: Qwen classifica SOLO l'intent (6 classi), il sistema regex genera i tag
- **Constrained decoding** per impedire allucinazioni

### 3.2 Nuova Architettura Hybrid Brain

```
MESSAGGIO UTENTE
       │
       ▼
┌─────────────────────────────┐
│ QWEN BRAIN (fine-tuned)     │
│                             │
│ Input: messaggio + contesto │
│ Output: {                   │
│   "intent": "circuit",      │ ← 1 di 6 classi
│   "confidence": 0.95,       │ ← soglia per fallback
│   "entities": ["led","r1"], │ ← NER semplice
│   "needs_llm": false        │ ← determinismo?
│ }                           │
└──────────┬──────────────────┘
           │
     confidence > 0.85?
     ┌─────┴──────┐
     │ YES        │ NO
     ▼            ▼
┌──────────┐  ┌──────────────┐
│ FAST PATH│  │ FULL LLM     │
│ Regex +  │  │ Racing       │
│ Template │  │ (DeepSeek +  │
│ Engine   │  │  Groq)       │
└──────────┘  └──────────────┘
```

**Vantaggi:**
- Qwen fa SOLO classificazione (6 classi → problema molto più semplice di generazione libera)
- Il sistema regex ESISTENTE (95% accurate) genera i tag
- Se Qwen è incerto (confidence < 0.85), usa il full LLM come oggi
- Nessuna allucinazione possibile: Qwen non genera tag, solo classifica

### 3.3 Dataset V3 — Struttura

**Formato:** ChatML JSONL (come V2, ma output semplificato)

```json
{
  "messages": [
    {
      "role": "system",
      "content": "Classifica l'intent del messaggio dello studente. Rispondi SOLO con JSON."
    },
    {
      "role": "user",
      "content": "[CONTESTO]\ntab: simulator\nesperimento: v1-cap6-esp1\ncomponenti: [led1:OFF, r1:470ohm]\nfili: 3\nattivita_recente: compile_error 5s fa\n\n[MESSAGGIO]\nPerché non funziona il mio LED?"
    },
    {
      "role": "assistant",
      "content": "{\"intent\":\"circuit\",\"confidence\":0.95,\"entities\":[\"led\"],\"needs_llm\":true,\"reason\":\"diagnosi circuito\"}"
    }
  ]
}
```

### 3.4 Categorie di Esempi (target: 20K)

| Categoria | Intent | needs_llm | Esempi Target | Esempio Input |
|-----------|--------|-----------|---------------|---------------|
| **Simulazione diretta** | `action` | `false` | 2000 | "Avvia", "Ferma", "Reset" |
| **Navigazione diretta** | `navigation` | `false` | 1500 | "Apri il manuale", "Carica esp1" |
| **Piazzamento componenti** | `circuit` | `false` | 3000 | "Metti un LED", "Aggiungi resistore" |
| **Cablaggio** | `circuit` | `false` | 2000 | "Collega il LED al resistore" |
| **Diagnosi circuito** | `circuit` | `true` | 2000 | "Perché non funziona?", "Cosa c'è che non va?" |
| **Codice Arduino** | `code` | `true` | 2000 | "Scrivi il codice per il blink" |
| **Errori compilazione** | `code` | `true` | 1000 | "Non compila, aiutami" |
| **Teoria/spiegazione** | `tutor` | `true` | 2500 | "Cos'è un resistore?", "Spiega la legge di Ohm" |
| **Quiz/giochi** | `tutor` | `false` | 1000 | "Facciamo un quiz", "Gioco detective" |
| **Vision** | `vision` | `true` | 1500 | "Guarda il mio circuito", "Analizza questo" |
| **Ambigui / edge case** | vari | vari | 1500 | "Quello rosso", "Fai qualcosa" |

**Distribuzione linguistica per ogni categoria:**
- 40% linguaggio naturale standard ("Puoi avviare la simulazione?")
- 25% imperativo diretto ("Avvia")
- 15% informale/slang ("Fallo partire", "Fai andare")
- 10% con errori di battitura ("aviva", "rezistenza", "costrusci")
- 10% multi-intent ("Metti un LED e avvia") — split in intent primario

### 3.5 Generazione Dataset da Dati Reali

**Step 1 — Raccolta dati (durante Fasi 1-2, ~1 settimana):**
- Log di produzione: ogni messaggio utente + intent classificato dal regex attuale
- ActivityTracker: azioni reali degli studenti
- Memory: pattern di errore reali

**Step 2 — Arricchimento programmatico:**
```python
# generate_v3_dataset.py

TEMPLATES = {
    "action_play": {
        "intent": "action",
        "needs_llm": False,
        "variations": [
            "Avvia la simulazione",
            "Fai partire",
            "Play",
            "Avvia",
            "Fallo andare",
            "Accendi il circuito",
            "Premi play",
            "Fammi vedere se funziona",
            # ... 200+ variazioni
        ]
    },
    # ... per ogni intent
}

CONTEXT_VARIATIONS = [
    {"tab": "simulator", "components": [], "wires": 0},                    # Empty
    {"tab": "simulator", "components": ["led1:OFF"], "wires": 1},          # Simple
    {"tab": "simulator", "components": ["led1:ON","r1:470"], "wires": 3},  # Running
    {"tab": "editor", "editorMode": "arduino"},                            # In editor
    {"tab": "canvas"},                                                      # Drawing
    {"tab": "manual", "page": 42, "volume": 1},                           # Reading
    # ... 50+ contesti diversi
]

def generate_examples():
    examples = []
    for template_id, template in TEMPLATES.items():
        for variation in template["variations"]:
            for context in CONTEXT_VARIATIONS:
                examples.append(make_example(variation, context, template))
    return examples
```

**Step 3 — Validazione automatica:**
```python
# Ogni esempio validato contro:
# 1. JSON output valido?
# 2. Intent è uno dei 6 ammessi?
# 3. Confidence è un float 0-1?
# 4. needs_llm è boolean?
# 5. entities sono componenti/pin validi?
# 6. Coerenza intent ↔ messaggio (cross-check con regex attuale)
```

### 3.6 Training Configuration V3

| Parametro | Valore | Motivazione |
|-----------|--------|-------------|
| **Modello base** | Qwen3-4B-Instruct | Già testato, buon rapporto size/performance |
| **LoRA rank** | 128 | Più capacità (da 64 V2) |
| **LoRA alpha** | 256 | α = 2r standard |
| **LoRA dropout** | 0.1 | Più regolarizzazione |
| **Batch size** | 8 | Con gradient accumulation 4 → effective 32 |
| **Learning rate** | 1e-4 | Più conservativo (da 2e-4) |
| **Scheduler** | cosine con warmup 5% | Warm start |
| **Epochs** | 5 | Più training (da 3) |
| **Eval split** | 85/15 | 15% per validation |
| **Eval strategy** | every 50 steps | Monitor overfit |
| **Early stopping** | patience 3 | Stop se val_loss non migliora |
| **train_on_responses_only** | ✅ | Solo JSON output, non system/user |

### 3.7 Constrained Decoding

```python
# Con la libreria Outlines (https://github.com/dottxt-ai/outlines)
import outlines

# Schema JSON fisso — il modello PUÒ SOLO generare questo formato
BRAIN_SCHEMA = {
    "type": "object",
    "properties": {
        "intent": {"type": "string", "enum": ["action", "circuit", "code", "tutor", "vision", "navigation"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "entities": {"type": "array", "items": {"type": "string"}},
        "needs_llm": {"type": "boolean"},
        "reason": {"type": "string", "maxLength": 50}
    },
    "required": ["intent", "confidence", "needs_llm"]
}

model = outlines.models.transformers("qwen3-4b-lora-merged")
generator = outlines.generate.json(model, BRAIN_SCHEMA)

# Il modello FISICAMENTE non può generare tag sbagliati
result = generator(prompt)  # → sempre JSON valido con intent valido
```

### 3.8 Evaluation Suite V3 (300 test cases)

| Categoria | Test Cases | Target Accuracy |
|-----------|-----------|-----------------|
| action (deterministico) | 50 | > 98% |
| navigation (deterministico) | 30 | > 98% |
| circuit (piazzamento) | 40 | > 95% |
| circuit (diagnosi) | 30 | > 90% |
| code (generazione) | 30 | > 90% |
| code (debug) | 20 | > 90% |
| tutor (teoria) | 30 | > 95% |
| tutor (quiz/giochi) | 20 | > 98% |
| vision | 20 | > 90% |
| ambigui/edge | 30 | > 80% |
| **TOTALE** | **300** | **> 93%** |

### 3.9 Criteri PASS Sprint 3

- [ ] Dataset V3: ≥ 20K esempi validati
- [ ] JSON validity: 100% (via constrained decoding)
- [ ] Intent accuracy complessiva: > 93% (300 test)
- [ ] needs_llm accuracy: > 95%
- [ ] Nessuna allucinazione di tag (0 tag inventati)
- [ ] Latenza inference: < 200ms (GGUF q4_k_m su Render GPU o Ollama)
- [ ] A/B test: Brain + regex ≥ regex-only accuracy
- [ ] Rollback: flag `USE_BRAIN=false` per disabilitare

---

## FASE 4 — VOICE CONTROL (16h)

### 4.1 Architettura

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│  Microfono   │────▶│ Web Speech API │────▶│ Galileo Chat     │
│  (browser)   │     │ SpeechRecog.   │     │ (testo normale)  │
└──────────────┘     │ lang: it-IT    │     │ → routing → tag  │
                     └────────────────┘     └────────┬─────────┘
                                                     │
┌──────────────┐     ┌────────────────┐     ┌────────▼─────────┐
│  Speaker     │◀────│ Web Speech     │◀────│ TTS Formatter    │
│  (browser)   │     │ Synthesis API  │     │ (strip tags,     │
└──────────────┘     │ lang: it-IT    │     │  abbrevia)       │
                     └────────────────┘     └──────────────────┘
```

### 4.2 Componente VoiceControl

**File:** `src/components/VoiceControl.jsx` (NUOVO)

```jsx
import { useState, useRef, useCallback, useEffect } from 'react';

export function VoiceControl({ onTranscript, onSpeakResponse, enabled }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Inizializzazione Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        onTranscript(text);
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [onTranscript]);

  // Toggle microfono
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript('');
    }
  }, [isListening]);

  // Text-to-Speech
  const speak = useCallback((text) => {
    if (!text || isSpeaking) return;

    // Strip action tags e markdown
    const cleanText = text
      .replace(/\[AZIONE:[^\]]+\]/g, '')
      .replace(/\[INTENT:[^\]]+\]/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .trim();

    if (!cleanText) return;

    // Abbrevia per TTS (max 200 chars per utterance)
    const shortText = cleanText.length > 200
      ? cleanText.substring(0, 197) + '...'
      : cleanText;

    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = 'it-IT';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    // Preferisci voci italiane di qualità
    const voices = speechSynthesis.getVoices();
    const italianVoice = voices.find(v => v.lang === 'it-IT' && v.name.includes('Google'))
      || voices.find(v => v.lang === 'it-IT');
    if (italianVoice) utterance.voice = italianVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  // Esponi speak per uso esterno
  useEffect(() => {
    if (onSpeakResponse) onSpeakResponse(speak);
  }, [speak, onSpeakResponse]);

  if (!enabled) return null;

  return (
    <button
      className={`voice-btn ${isListening ? 'voice-btn--active' : ''} ${isSpeaking ? 'voice-btn--speaking' : ''}`}
      onClick={toggleListening}
      title={isListening ? 'Clicca per fermare' : 'Clicca per parlare'}
      aria-label={isListening ? 'Ferma registrazione vocale' : 'Avvia registrazione vocale'}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 'none',
        background: isListening ? '#E54B3D' : isSpeaking ? '#7CB342' : '#F0F4FF',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}
    >
      {isListening ? '⏹' : isSpeaking ? '🔊' : '🎤'}
    </button>
  );
}
```

### 4.3 Feedback Vocale per Azioni

```javascript
const ACTION_VOICE_FEEDBACK = {
  'play': 'Simulazione avviata!',
  'pause': 'Simulazione in pausa.',
  'reset': 'Circuito resettato.',
  'clearall': 'Breadboard pulita.',
  'compile': null, // feedback specifico basato su risultato
  'compile_success': 'Compilazione riuscita!',
  'compile_error': 'Errore di compilazione.',
  'addcomponent': 'Componente aggiunto.',
  'removecomponent': 'Componente rimosso.',
  'loadexp': 'Esperimento caricato.',
  'quiz': 'Quiz avviato!',
  'nextstep': null, // legge il testo dello step
  'undo': 'Annullato.',
  'redo': 'Ripristinato.'
};
```

### 4.4 Conferma Vocale per Azioni Critiche

```javascript
const CRITICAL_ACTIONS = ['clearall', 'resetcode', 'loadexp'];

async function handleVoiceAction(actionTag, speakFn) {
  const action = actionTag.replace('[AZIONE:', '').replace(']', '').split(':')[0];

  if (CRITICAL_ACTIONS.includes(action)) {
    speakFn('Vuoi davvero ' + ACTION_CONFIRMATIONS[action] + '?');
    // Attendi risposta vocale "sì" o "no"
    const confirmed = await listenForConfirmation();
    if (!confirmed) {
      speakFn('Annullato.');
      return false;
    }
  }

  return true; // Procedi con l'azione
}

const ACTION_CONFIRMATIONS = {
  'clearall': 'cancellare tutto dalla breadboard',
  'resetcode': 'ripristinare il codice originale',
  'loadexp': 'cambiare esperimento (perderai le modifiche)'
};
```

### 4.5 Wake Word (Opzionale — P3)

```javascript
// "Ehi Galileo" detection semplice
// Usa continuous recognition con keyword spotting
const WAKE_WORDS = ['ehi galileo', 'hey galileo', 'galileo'];

function checkWakeWord(transcript) {
  const lower = transcript.toLowerCase().trim();
  for (const wake of WAKE_WORDS) {
    if (lower.startsWith(wake)) {
      return lower.substring(wake.length).trim(); // Restituisce il comando dopo il wake word
    }
  }
  return null;
}
```

### 4.6 Criteri PASS Sprint 4

- [ ] 🎤 button visibile nella chat (44px, touch-friendly)
- [ ] "Avvia la simulazione" → [AZIONE:play] → "Simulazione avviata!" (voce)
- [ ] "Metti un LED" → [INTENT:place_and_wire] → "LED aggiunto" (voce)
- [ ] "Cancella tutto" → conferma vocale → clearall
- [ ] "Cos'è un resistore?" → testo libero → risposta letta a voce
- [ ] Timeout 5s senza parlato → "Non ho capito, puoi ripetere?"
- [ ] iPad Safari: microfono funzionante
- [ ] TTS: strip tag e markdown prima di leggere
- [ ] Volume/rate/pitch configurabili
- [ ] Nessun conflitto con shortcut tastiera

---

## APPENDICE: SEQUENZA DI IMPLEMENTAZIONE RACCOMANDATA

```
Settimana 1: FASE 1 (Context Mastery)
  ├─ Giorno 1: ActivityTracker + injection hooks (17 eventi)
  ├─ Giorno 2: Contesto esteso in buildTutorContext() + test
  └─ Giorno 3: Deploy Vercel + Render + verifica in produzione

Settimana 2: FASE 2 (Memory Evolution)
  ├─ Giorno 1: lastSessionContext + sendBeacon
  ├─ Giorno 2: Error Pattern Analysis in nanobot
  ├─ Giorno 3: Proactive Help System
  └─ Giorno 4: Deploy + raccolta dati reali (inizio)

Settimana 3: Raccolta dati reali + FASE 3 prep
  ├─ Giorno 1-3: Log in produzione, raccolta messaggi reali
  ├─ Giorno 4: generate_v3_dataset.py (20K esempi)
  └─ Giorno 5: Validazione dataset + eval suite (300 test)

Settimana 4: FASE 3 (Qwen Training V3)
  ├─ Giorno 1: Training su Colab/RunPod (5 epoche, ~2h GPU)
  ├─ Giorno 2: Eval suite + constrained decoding
  ├─ Giorno 3: GGUF export + integration in nanobot
  └─ Giorno 4: A/B test + deploy

Settimana 5-6: FASE 4 (Voice Control)
  ├─ Giorno 1-2: VoiceControl.jsx + integration chat
  ├─ Giorno 3: TTS feedback + action mapping
  ├─ Giorno 4: Conferma vocale azioni critiche
  ├─ Giorno 5: iPad Safari testing
  └─ Giorno 6: Wake word (opzionale) + deploy finale
```

---

## METRICHE DI SUCCESSO FINALI

| Metrica | Prima (S115) | Dopo (target) |
|---------|-------------|---------------|
| Context tokens | ~200 | ~500 |
| Info che Galileo "sa" | 10 campi | 20+ campi |
| Azioni tracciabili | 0 (nessun buffer) | 17 tipi, ultime 20 |
| Sessione resume | ❌ | ✅ "Bentornato!" |
| Error patterns | ❌ | ✅ dopo 3+ errori |
| Proactive help | ❌ | ✅ (bloccato/errori/completato) |
| Intent classification | 95% (regex) | 98% (Qwen + regex hybrid) |
| Tag hallucination | 0% (regex) | 0% (constrained) |
| Voice input | ❌ | ✅ (Web Speech API IT) |
| Voice output | ❌ | ✅ (TTS IT) |
| Total action tags | 39 | 39 (nessuno nuovo necessario) |
| Response latency | ~2s (racing) | ~1.5s (Brain fast-path + racing) |

---

**Autore:** Claude Opus 4.6 + Andrea Marro
**Documento precedente:** `2026-03-12-galileo-queen-platform-mastery.md`
