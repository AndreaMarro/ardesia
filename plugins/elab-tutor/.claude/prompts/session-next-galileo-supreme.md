# 🧠 SESSIONE: GALILEO SUPREME — Da Chatbot a Cervello Onnipotente

## CHI SEI E COSA FAI
Sei l'AI architect del progetto ELAB Tutor — piattaforma educativa italiana di elettronica per ragazzi 10-14 anni. Il prodotto ha un simulatore di circuiti (React), un backend AI chiamato "nanobot" (FastAPI su Render), e un assistente AI chiamato **UNLIM** (ex Galileo) che aiuta studenti e docenti.

## LO STATO ATTUALE (14 Marzo 2026)
L'architettura AI attuale funziona ma ha limiti strutturali:

### Cosa c'è ORA (e funziona bene):
- **Nanobot v5.3.0**: FastAPI server su Render (Docker), 3442 righe
- **Multi-specialist routing**: 4 specialisti (circuit/code/tutor/vision) con prompt YAML separati + shared context
- **Intent classifier ibrido**: keyword matching (~1ms) → Groq flash fallback per casi ambigui
- **Provider racing**: DeepSeek + Groq per testo (race parallelo), Gemini riservato per vision
- **Deterministic fallback**: 20+ regex patterns che iniettano [AZIONE:...] quando l'LLM dimentica i tag
- **Complexity classifier**: simple/complex/multi_domain → chain specialisti o Reasoner (DeepSeek R1)
- **Memory system**: JSON file-based, 2 livelli (individuale per sessione + collettivo per esperimento)
- **48 action tags**: [AZIONE:play/pause/clearall/compile/...] + [INTENT:{...}] per placement
- **69 esperimenti**, 3 volumi, 21 componenti SVG, Scratch/Blockly editor

### Cosa NON va (limiti strutturali):
1. **Dipendenza cloud totale**: ogni messaggio → API call (DeepSeek/Groq) = latenza 2-8s, costi, offline impossibile
2. **Intent classifier fragile**: keyword matching con 200+ regex, manutenzione incubo, false positive frequenti
3. **Memoria primitiva**: JSON su filesystem, no learning reale, no graph, no decay
4. **No personalizzazione**: tutti gli studenti ricevono le stesse risposte, no adaptive learning
5. **Nessun modello proprio**: 100% dipendente da API terze (DeepSeek, Groq, Google)
6. **School Edition impossibile**: senza internet, ELAB non ha AI

### Fine-tuning tentato (PoC):
- **Galileo Brain PoC (Session 75)**: Qwen3-4B fine-tuned con Unsloth LoRA su 500 esempi ChatML
  - Training: 189 steps, 3 epochs, loss 1.48→0.013, 57min, 6.12GB VRAM
  - Inference 3/3 PASS: action routing, circuit intent, tutor needs_llm
  - GGUF q4_k_m scaricato (~2.5GB)
- **Training successivi (Session 116+)**: 10K dataset base + 3.8K hardmode + 9.2K extreme
  - Training 1: loss 0.1845, 1.5 epochs, early stopping corretto
  - Training 2+3: in corso su Colab A100
- **Datasets esistenti**: `datasets/` folder con 67K righe totali tra tutti i .jsonl

## L'UTENTE PRINCIPALE: IL DOCENTE
Il target NON è lo studente da solo. L'utente principale è il **DOCENTE** — di qualunque materia (matematica, italiano, storia) — che usa ELAB alla LIM/proiettore per insegnare elettronica alla classe. Il docente può essere:
- **Completamente incompetente** di elettronica (non sa cos'è un resistore)
- **Svogliato** (vuole il minimo sforzo per fare lezione)
- **Entusiasta ma inesperto** (vuole fare bella figura ma non sa da dove partire)
- **Esperto** (sa tutto e vuole andare veloce)

**FILOSOFIA FONDAMENTALE**: UNLIM NON sostituisce il docente. UNLIM **mette il docente nelle condizioni di spiegare**, a prescindere dalle sue competenze. Il docente resta SEMPRE al centro — è lui che parla alla classe, è lui che fa la lezione. UNLIM gli fornisce le parole giuste, le analogie perfette, il prossimo passo, la risposta alla domanda dello studente che lo mette in difficoltà. Il docente deve sentirsi **empowered**, non sostituito.

UNLIM è un **suggeritore invisibile**: prepara tutto (carica esperimento, suggerisce come spiegare, anticipa le domande), ma il MERITO della lezione è del docente. L'obiettivo è che il docente si **diverta** a insegnare elettronica e che la classe si **diverta** a impararla.

**TONO E LINGUAGGIO**: Quello dei volumi ELAB — entusiasta, divertente, pieno di analogie quotidiane e metafore vivaci. "La corrente è come l'acqua in un tubo!", "Il resistore è una strettoia — se stringi il tubo l'acqua scorre più lenta!", "Il LED è un rubinetto magico che quando l'acqua passa... si accende una luce! 💡". Mai noioso, mai accademico, mai intimidatorio. Se un concetto è difficile, semplificalo finché anche un prof di italiano che non ha mai visto un circuito può spiegarlo con sicurezza alla sua classe.

Lo studente può anche usare ELAB da solo — in quel caso UNLIM guida allo stesso modo, con lo stesso linguaggio divertente e coinvolgente dei volumi.

## L'OBIETTIVO: GALILEO SUPREME

Trasformare UNLIM da "chatbot con regex" a **cervello AI onnipotente** con queste proprietà:

### 🔮 Onnipotente (sa fare TUTTO)
- Capisce QUALSIASI input: dialetti, parolacce, errori di battitura, frasi troncate, emoji, voice-to-text garbled
- Routing perfetto su 48+ action tags con zero false positive
- Multi-step commands: "pulisci, metti 3 LED, compila e avvia" → 5 azioni in sequenza
- Context-aware: usa lo stato del simulatore per risposte intelligenti

### 🧠 Onnisciente (sa TUTTO di elettronica per ragazzi E per docenti)
- Conosce tutti i 69 esperimenti, 21 componenti, pin maps, breadboard rules
- Spiega con analogie (corrente=acqua, resistore=strettoia, LED=rubinetto con luce)
- Adapta il livello: principiante totale → esperto
- Knowledge base internalizzata nel modello, non nei prompt
- **Suggeritore docente**: suggerisce come presentare il concetto alla classe, fornisce le parole giuste, anticipa domande degli studenti. Il docente resta al centro — UNLIM lo prepara, non lo sostituisce.
- **Lezione guidata**: "Fammi una lezione sul LED" → carica esperimento + fornisce spunti di spiegazione con analogie + guida costruzione passo passo + quiz finale. Il docente parla alla classe usando i suggerimenti di UNLIM.

### 💾 Memoria Docente (NO memoria studente)
- Ricorda il **docente** tra sessioni (preferenze, ultimo esperimento, livello di competenza)
- Collective patterns per esperimento: "Il 45% sbaglia qui" → avvisa il docente PRIMA
- NO profili studente, NO tracking individuale studenti — GDPR-friendly, zero complessità

### 📈 Scalabile
- Funziona con 1 studente o 10.000 in contemporanea
- Costi proporzionali, non esplosivi
- CDN/edge per assets statici, compute centralizzato per AI

### 🏫 Orientato al Locale (School Edition roadmap)
- Obiettivo finale: ELAB funziona OFFLINE su PC scolastici (8-16GB RAM, no GPU)
- Docker Compose: frontend + nanobot + Ollama + modello locale
- Zero dipendenze cloud, zero dati che escono dalla scuola (GDPR)

---

## ARCHITETTURA TARGET: 5 LAYER INTELLIGENCE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  Simulatore + Chat + Canvas + Editor + Scratch              │
│  window.__ELAB_API (unified) → WebSocket/HTTP → Backend     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 L0: DETERMINISTIC LAYER (<1ms)               │
│  Regex patterns per azioni inequivocabili                    │
│  "▶" → play, "⏸" → pause, "🗑" → clearall                  │
│  Copre ~30% dei messaggi (quelli ovvi)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ (non matchato)
┌────────────────────────▼────────────────────────────────────┐
│            L1: SEMANTIC CACHE (<50ms)                        │
│  Embedding locale (all-MiniLM-L6-v2, 22MB)                  │
│  Cache delle ultime 10K query→response                       │
│  Cosine similarity > 0.92 → cache hit                        │
│  Copre ~25% (domande ripetute tra studenti)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ (cache miss)
┌────────────────────────▼────────────────────────────────────┐
│          L2: GALILEO BRAIN — Router Locale (1-3s)            │
│  Qwen3-4B fine-tuned (GGUF q4_k_m, ~2.5GB)                  │
│  Ollama inference locale                                     │
│  Input: messaggio + contesto simulatore                      │
│  Output: JSON {intent, entities, actions, needs_llm,         │
│               response, llm_hint}                            │
│  Se needs_llm=false → risponde direttamente (80% dei casi)  │
│  Se needs_llm=true → passa a L3 con hint                    │
└────────────────────────┬────────────────────────────────────┘
                         │ (needs_llm=true, ~20%)
┌────────────────────────▼────────────────────────────────────┐
│       L3: SPECIALIST MODELS (Cloud, 3-8s)                    │
│  DeepSeek/Groq per testo (race parallelo)                    │
│  Gemini per vision (immagini)                                │
│  DeepSeek R1 per ragionamento complesso                      │
│  Prompt specializzati (circuit.yml, code.yml, tutor.yml)     │
│  ┌─────────────────────────────────────────┐                │
│  │ SCHOOL EDITION: L3 locale con           │                │
│  │ Qwen3-8B o Phi-4 (GGUF q4, ~5GB)       │                │
│  │ Più lento (5-15s) ma offline            │                │
│  └─────────────────────────────────────────┘                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│       L4: MEMORY LAYER (async, background)                   │
│  Memoria DOCENTE (NO studenti)                               │
│  Profilo docente: livello, preferenze, ultimo esperimento    │
│  Collective: per-experiment error patterns                   │
│  School Edition: SQLite locale, zero dati personali studenti │
└─────────────────────────────────────────────────────────────┘
```

---

## TASK PER QUESTA SESSIONE

### FASE 1: Dataset Definitivo (priorità massima)
Il Galileo Brain ha bisogno di un dataset di training MASSICCIO e DIVERSISSIMO.

**Stato attuale dei dataset:**
- `galileo-brain-10k.jsonl` (10K esempi, 18MB) — base, usato per T1+T2
- `galileo-brain-hardmode-5k.jsonl` (3.8K esempi, 6.8MB) — typos, slang, corruzioni
- `galileo-brain-extreme-10k.jsonl` (9.2K esempi, 17MB) — dialetti, parolacce, esperto, ignorante, troncate

**Cosa serve:**
Riscrivere `generate-brain-extreme.py` per produrre **15.000+ esempi unici** coprendo:
- 13 dialetti italiani × 20+ frasi ciascuno × 6 livelli corruzione = 1500+
- Parolacce/frustrazione × varianti = 500+
- Esperto (pin-specific, FSM, I2C, PWM duty cycle) = 500+
- Ignorante totale (prima volta, paura, confusione) = 500+
- Frasi troncate (1-4 char) per ogni azione/componente = 500+
- Task tripli/quadrupli/quintupli = 1000+
- Context maintenance (pronomi, "ancora", "e poi?") = 500+
- Scritto malissimo (typo multipli simultanei) = 500+
- Azioni rare (highlightpin, serialwrite, setvalue, removewire) = 500+
- Contraddizioni contesto (simulazione già attiva ma chiede play) = 200+
- Combinazioni dinamiche random 2-4 componenti = 2000+
- **NUOVE SEZIONI:**
  - Emoji e emoticon come input ("▶️", "💡", "😡") = 300+
  - Inglese misto ("play the simulation", "compile") = 300+
  - Formale eccessivo ("Gentilissimo Galileo, potrebbe...") = 200+
  - Voice-to-text garbled ("metti un letto rosso" → led rosso) = 300+
  - Fuori scope ("che ore sono", "chi è il presidente") = 200+
  - Esperimenti specifici per nome/capitolo = 300+
  - Build mode switching continuo = 200+
  - Chained experiment sequences = 300+
  - LCD Blockly blocks (lcd_init, lcd_print, lcd_set_cursor, lcd_clear) = 200+

**Formato output**: ChatML JSONL (system/user/assistant), stessa struttura dei dataset esistenti.

**Il system prompt** è già definito nei dataset precedenti — riutilizzalo identico.

**Approccio**: esplosione combinatoriale. Poche frasi template × molte varianti programmatiche × corruzione multilivello = diversità massima con script compatto.

### FASE 2: Training Pipeline Robusta su Colab
Dopo il dataset, serve una pipeline di training Colab che:
1. **Training 1** (base 10K, lr=2e-4, 5 epochs max, early stopping patience=3)
2. **Training 2** (hardmode 3.8K, lr=5e-5, 3 epochs, early stopping)
3. **Training 3** (extreme 15K+, lr=2e-5, 3 epochs, early stopping)
4. **Test dopo ogni training** con 30+ query diverse
5. **Export GGUF q4_k_m** → Google Drive → download locale
6. **Resiliente ai crash**: checkpoints su Google Drive, auto-recovery

**Modello**: Qwen3-4B (o il migliore disponibile ~4B params che gira su Colab A100)
**Tecnica**: Unsloth + LoRA (r=32, alpha=32) + SFTTrainer con packing
**Formato**: ChatML

### FASE 3: Integrazione Ollama nel Nanobot
Una volta che il GGUF è pronto:
1. Creare `Modelfile` per Ollama
2. Aggiungere endpoint `/brain` al nanobot server.py
3. Il Brain riceve messaggio + contesto → restituisce JSON routing
4. Se `needs_llm=false` → risposta diretta (bypass LLM cloud)
5. Se `needs_llm=true` → passa a specialist con `llm_hint`
6. Fallback: se Ollama non risponde in 5s → vecchio routing keyword

### FASE 4: Memory Layer Docente (se c'è tempo)
Memoria per il docente (NO studenti):
1. Profilo docente persistente (JSON → poi SQLite): livello competenza, preferenze, ultimi esperimenti
2. Dopo ogni sessione: aggiorna profilo docente
3. Prima di rispondere: inietta profilo nel contesto ("Questo docente è alle prime armi, spiega tutto")
4. Collective patterns: conta errori per esperimento, genera avvisi preventivi per il docente

---

## FILE CRITICI DA CONOSCERE

```
elab-builder/
├── nanobot/
│   ├── server.py              — 3442 righe, FastAPI, routing, racing, fallback
│   ├── nanobot.yml             — System prompt principale (UNLIM)
│   ├── memory.py               — Memory system (individuale + collettivo)
│   ├── prompts/
│   │   ├── shared.yml          — Contesto condiviso (identity, action_tags, experiments)
│   │   ├── circuit.yml         — Specialist circuiti
│   │   ├── code.yml            — Specialist codice
│   │   ├── tutor.yml           — Specialist tutor
│   │   ├── vision.yml          — Specialist visione
│   │   └── scratch.yml         — Knowledge Scratch/Blockly
│   └── Dockerfile
├── datasets/
│   ├── generate_brain_dataset.py      — Generatore 10K base
│   ├── generate-brain-hardmode.py     — Generatore 3.8K hardmode
│   ├── generate-brain-extreme.py      — Generatore 9.2K extreme (DA RISCRIVERE → 15K+)
│   ├── galileo-brain-10k.jsonl        — Dataset base
│   ├── galileo-brain-hardmode-5k.jsonl — Dataset hardmode
│   └── galileo-brain-extreme-10k.jsonl — Dataset extreme attuale
├── src/components/simulator/
│   ├── NewElabSimulator.jsx    — Simulatore principale (~2000 righe)
│   └── ai/ElabTutorV4.jsx     — Chat component (action tag parsing, vision, quiz)
└── docs/plans/
    └── 2026-03-06-galileo-brain-dataset-poc-design.md — Design originale PoC
```

## STATO DELL'ARTE (Ricerca Marzo 2026)

### Modelli Piccoli per CPU (no GPU, 8-16GB RAM)
| Modello | Params | RAM Q4_K_M | Punti di forza |
|---------|--------|------------|-----------------|
| **Qwen3-4B** | 4B | ~2.5 GB | Miglior base fine-tuning, dual thinking/fast, 119 lingue |
| **Phi-4-mini** | 3.8B | ~2.5 GB | Miglior reasoning-per-GB (83.7% ARC-C) |
| **Gemma 3n E4B** | 4B | ~3 GB | Multimodale nativo (testo+immagine+audio) |
| **SmolLM3 3B** | 3B | ~2 GB | Pipeline training completamente open |
| **Qwen3-0.6B** | 0.6B | <1 GB | Ultra-light, thinking mode toggle |

**Scelta**: Qwen3-4B Q4_K_M per 8GB, Qwen3-8B Q4_K_M per 16GB. Un modello più grande a Q4 batte uno più piccolo a Q8.

### Fine-Tuning
- **Unsloth + QLoRA**: standard 2026, 2x più veloce, 70% meno VRAM. Il nostro PoC (Qwen3-4B, loss 1.48→0.013) segue già le best practice.
- **LoRA r=32, alpha=32**: applicare sia ad attention CHE MLP layers
- **Learning rate**: 2e-4 per T1, scalare a 2e-5 per training successivi

### Inference Locale
- **Ollama**: setup più semplice (pull-and-run), API OpenAI-compatibile, tool calling
- **Llamafile**: zero-install, singolo eseguibile, perfetto per distribuzione studenti
- **MLX**: migliore su Apple Silicon (~230 tok/s su M-series)
- Ollama ha ~10-15% overhead vs llama.cpp grezzo, ma la comodità vale

### Memoria Persistente (novità 2026)
- **Mem0**: il più popolare ($24M funding), multi-store (KV + vector + graph). Graph memory da Gennaio 2026.
- **Letta (MemGPT)**: paradigma OS — agent gestisce la propria memoria (core + archival + conversational)
- **Pattern 2026**: vector store da solo NON basta. Serve: vector (knowledge) + structured (preferenze) + graph (relazioni)
- **Per ELAB scuola**: SQLite (core memory) + ChromaDB (knowledge RAG) — leggero, no server

### Routing Multi-Agent
- **Semantic Router** (Aurelio Labs): <10ms, embedding lookup, 92-96% precision
- **Pattern vincente**: classifier leggero per routing iniziale → escalation a LLM solo quando confidence bassa
- Il nostro keyword+regex è già questo pattern — upgrade: Semantic Router con embedding pre-computati

### Quantizzazione GGUF
- **Q4_K_M**: default, ~95% di FP16, migliore bilanciamento qualità/dimensione
- **Q5_K_M**: upgrade per reasoning/math, ~97% di FP16
- **Q6_K**: consigliato per modelli con thinking mode (reasoning chain amplifica errori quantizzazione)
- K-quants sempre meglio dei legacy (Q4_0, Q4_1) — mantengono attention layers a precisione più alta

## VINCOLI TECNICI
- **Colab A100** per training (40GB VRAM, sessioni max ~12h)
- **Ollama** per inference locale (CPU-only su PC scolastici)
- **Qwen3-4B GGUF q4_k_m** (~2.5GB) per il Brain router, considerare **Q5_K_M** per reasoning migliore
- **Render free/starter** per il nanobot (512MB-1GB RAM)
- **React 19 + Vite 7** frontend, no react-router
- **Ragazzi 10-14 anni** — linguaggio semplice, analogie, entusiasmo
- **Alternativa modello**: se Qwen3-4B non performa abbastanza, provare **Phi-4-mini** (3.8B) o **SmolLM3 3B**

## REGOLA D'ORO
Il Brain deve essere un **router intelligente**, NON un chatbot. Output SOLO JSON strutturato.
Per l'80% dei messaggi (azioni, navigazione, componenti) risponde da solo senza LLM cloud.
Per il 20% (spiegazioni teoriche, diagnosi complesse, visione) passa il lavoro a L3 con un hint contestuale.

---

## COME PROCEDERE
1. Leggi `datasets/generate-brain-extreme.py` per capire la struttura attuale
2. Riscrivilo per produrre 15K+ esempi (esplosione combinatoriale, non frasi a mano)
3. Eseguilo: `cd datasets && python generate-brain-extreme.py`
4. Verifica: conta esempi, distribuzione intent, % needs_llm, % multi-step
5. Poi passa alle celle Colab per il training
