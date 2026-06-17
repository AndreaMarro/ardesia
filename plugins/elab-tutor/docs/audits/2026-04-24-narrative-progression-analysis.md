# Analisi Narrative Progression Volume↔Tutor + Decisioni operative Q1

**Data:** 2026-04-24
**Sprint:** Q0 → Q1 gate
**Richiesta Andrea:** "gli esperimenti sui volumi non sono proposti come su elabtutor: in uno sono variazioni di uno stesso tema, nell'altro pezzi staccati"
**Scope:** Analisi minuziosa + decisioni operative autonome Q1 schema Capitolo
**Metodologia:** lettura completa v1-cap6-esp{1,2,3}.json (258+249+270 righe) + estrazione Vol1 Cap 6 body PDF pag 27-34 (213 righe) + audit codice 3 modalità esistenti

---

## TL;DR — scoperta chiave

**Il tutor HA la progression encoded nei JSON** (prerequisites + next_experiment + class_hook "L'ultima volta...") **ma la UI attuale surface come card isolate**, perdendo il filo narrativo del volume.

**Risultato**: docente legge il libro come storia continua (Cap 6: teoria LED → accende → brucia → luminosità in 8 pagine), il tutor mostra 3 card separate senza filo visibile. Classe non percepisce lo stesso racconto.

**Tre mismatch critici identificati**:

1. **Montaggio passo-passo**: volume insegna "incremental" (parti da prima modifica X), tutor rebuild ogni volta
2. **Percorso UI**: attuale = per-esperimento (PercorsoPanel.jsx), dovrebbe essere per-Capitolo scroll narrativo
3. **Linguaggio duale encoded ma non surfaced**: JSON ha teacher_message + class_hook + summary_for_class, UI non separa display centrale classe vs sidebar docente

---

## 1. Struttura volume Vol1 Cap 6 (8 pagine narrative)

```
Pag 27  — TEORIA: "Cos'è il diodo LED?"
         • Funzione (emette luce con corrente)
         • Polarizzazione (anodo/catodo, gambetta lunga/corta)
         • Identificazione taglio su testa

Pag 28  — TEORIA cont: "Come funziona?"
         • Diodo = senso unico elettronica
         • LED = diodo che emette luce
         • Simbolo con freccette

Pag 29  — TEORIA cont: "Come emette luce?" + "Dove lo troviamo?"
         + ESPERIMENTO 1 (bottom pag)
         • "ora siamo arrivati alla domanda: come lo accendo?"
         • Lista componenti: LED + breadboard + batteria 9V + clip + resistore 470Ω

Pag 30  — ESPERIMENTO 1 cont: passo-passo montaggio con figure
         • Collega clip a batteria
         • Positivo batteria → striscia rossa
         • Resistore 470Ω tra rossa e sotto
         • LED (gambetta lunga → resistore, corta → parte sotto)

Pag 31  — ESPERIMENTO 1 conclusione:
         • "Collega negativo batteria ... e MAGIA!"
         • "Il LED si è acceso!"
         • Invito variazione: cambia colore LED

Pag 32  — ESPERIMENTO 2: "Perché il resistore?"
         • Callback esplicito ESP 1: "Il nostro circuito include un resistore, ma perché?"
         • Spiegazione rottura senza resistore
         • Figura LED esploso
         • "NON collegare MAI il LED direttamente alla batteria"

Pag 33  — ESPERIMENTO 3: "Più/meno luminoso"
         • Callback esplicito ESP 1: "partire dal circuito che abbiamo realizzato"
         • Cambia resistore 470Ω → 220Ω (più luminoso)
         • Cambia 220Ω → 1kΩ (meno luminoso)
         • Invito sperimentare: "cambia valore ma NON sotto 100Ω"

Pag 34  — NOTE (pagina appunti vuota)
```

**Flusso narrativo lineare**: teoria → esperimento base → "e se togliamo?" → "e se cambiamo?". Ogni esperimento è **variazione incrementale** dello stesso tema LED+resistore.

## 2. Struttura tutor v1-cap6 (3 file JSON, 777 righe totali)

### v1-cap6-esp1.json (258 righe)
- `title`: "Accendi il tuo primo LED"
- `prerequisites`: `[]`
- `next_experiment`: `{ id: "v1-cap6-esp2", ... preview: "...LED è in pericolo!" }`
- `components_needed`: LED rosso + resistore 470Ω + breadboard + batteria 9V + 4 fili
- `build_circuit.intent`: 4 componenti + 6 wires (COMPLETO montaggio da zero)
- `phases`: 5 fasi PREPARA → MOSTRA → CHIEDI → OSSERVA → CONCLUDI
- Linguaggio duale:
  - `teacher_message` (docente): "Oggi i ragazzi scoprono che un circuito deve essere CHIUSO..."
  - `teacher_tip` (docente): "Non dare il resistore subito..."
  - `class_hook` (classe): "Avete mai provato ad accendere una lampadina con una pila?"
  - `provocative_question` (classe via docente): "Se giro il LED al contrario, si accende ancora?"
  - `summary_for_class` (classe): "Il LED è come una porta girevole..."
  - `observation_prompt` (classe): "Guardate il LED! Si accende quando..."
- `analogies`: porta girevole, circuito F1
- `common_mistakes` + `teacher_response`
- `next_preview`: "...il LED è in pericolo! 😱"

### v1-cap6-esp2.json (249 righe)
- `title`: "LED senza resistore (cosa NON fare!)"
- `prerequisites`: `["v1-cap6-esp1"]`
- `next_experiment`: `{ id: "v1-cap6-esp3", preview: "Il LED cambia luminosità!" }`
- `build_circuit.intent`: 3 componenti + 6 wires (RICOSTRUITO da zero senza resistore)
- `class_hook`: "L'ultima volta abbiamo acceso il LED con il resistore. Ma cosa succede se lo togliamo?" → **CONTINUITY EXPLICIT**
- Analogia: rubinetto (troppa acqua rompe tubo), uovo+cuscino
- `session_save.resume_message`: "L'ultima volta abbiamo visto che il LED si brucia senza protezione! Oggi scopriamo..."

### v1-cap6-esp3.json (270 righe)
- `title`: "Cambia luminosità con resistenze diverse"
- `prerequisites`: `["v1-cap6-esp1", "v1-cap6-esp2"]`
- `next_experiment`: `{ id: "v1-cap7-esp1", ... }` → **cross-Cap link**
- `build_circuit.intent`: 4 componenti + 6 wires (RICOSTRUITO con resistore 220Ω)
- Components: 3 resistori (220Ω, 470Ω, 1kΩ) — multipli per sperimentare
- `class_hook`: "L'ultima volta abbiamo acceso un LED e scoperto che serve un resistore per proteggerlo. Ma cosa succede se cambiamo il resistore?"
- `teacher_tip`: "Dopo aver montato con 220Ω, chiedi: 'Provate a cambiare il valore del resistore nel simulatore — cosa succede?'"

## 3. Mismatch identificati

### 3.1 Montaggio: volume INCREMENTAL, tutor REBUILD

**Volume esp 3 pag 33**:
> "Per rendere il led più luminoso ci basta **partire dal circuito che abbiamo realizzato**. Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm."

**Tutor v1-cap6-esp3.json `build_circuit.intent`**:
```json
"components": [
  { "type": "battery9v", "id": "bat1" },
  { "type": "breadboard-half", "id": "bb1" },
  { "type": "resistor", "id": "r1", "value": 220 },
  { "type": "led", "id": "led1", "color": "green" }
],
"wires": [ ...6 wires ricostruiti... ]
```

**Tutor ricostruisce TUTTO da zero**, inclusi i 6 wires identici a esp1. Non c'è nozione di "delta da esp2".

**Impatto pedagogico**: la classe mentalmente "parte da nuovo" ogni volta, invece di vedere evoluzione del circuito. Perde il gesto di **sostituzione** (swap resistore), impara solo **costruzione from scratch**.

### 3.2 Percorso: file attuale per-esperimento, non per-Capitolo

**`src/components/lavagna/PercorsoPanel.jsx` (94 righe)**:
- Title: "Guida Esperimento" (SINGOLARE)
- Wraps `LessonPathPanel` (pannello phases PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI di **un singolo esperimento**)
- Comment header: "Principio Zero: only the teacher sees this"
- Floating window 380x550 px (dimensioni sidebar, non full-view)

**Problema**: docente apre Cap 6, seleziona esp1, vede Percorso esp1. Per vedere "tutto Cap 6 come storia" deve cliccare esp1 → esp2 → esp3 separatamente. Perde il **colpo d'occhio cosa fare in questa lezione di 1h30'**.

### 3.3 Linguaggio: duale in JSON, NON in UI

JSON già distingue:
- **Campi docente**: `teacher_message`, `teacher_tip`, `common_mistakes.teacher_response`, `provocative_question`, `assessment_invisible`
- **Campi classe**: `class_hook`, `summary_for_class`, `observation_prompt`, `analogies[].text`, `next_preview`

**UI attuale** (PercorsoPanel + LessonPathPanel): rende il contenuto in un floating window unico, senza separazione visiva tra "cosa il docente legge ad alta voce alla classe" e "cosa il docente fa/dice in silenzio".

**Andrea esplicita richiesta**:
> "Percorso ... è strumento che serve alla classe per leggere e capire e al docente per capire con la cosa dell'occhio cosa deve fare (in particolare percorso)"

**Gap**: il doppio livello linguistico esiste nei dati, manca nell'interfaccia.

## 4. 3 modalità — stato attuale e destinazione

| Modalità | Codice esistente | Stato | Q1/Q2 destinazione |
|----------|------------------|-------|----------------------|
| **Passo Passo** (`passopasso` / `guided`) | `BuildModeGuide.jsx` (294 righe), `useGalileoChat.js:222` mapping, `buildSteps` array | Funziona per-esperimento con steps progressivi | **Aggiungere `mode: incremental_from_prev`**. Se esperimento N parte da N-1, NON pulire canvas, mostra delta ("Sostituisci resistore 470Ω con 220Ω"). |
| **Percorso** (`montato` / `complete`) | `PercorsoPanel.jsx` (94 righe) = wrapper `LessonPathPanel` per-esperimento | Per-esperimento floating 380x550 | **Sostituire con `PercorsoCapitoloView.jsx`** scroll verticale Cap intero (teoria + esp1→esp2→esp3 + quiz). Display centrale 70% (classe) + sidebar destra 25% (docente colpo d'occhio sticky). |
| **Libero** (`libero` / `sandbox`) | canvas aperto, no chain | Sandbox libero | **Aggiungere tier "Progetti Bonus"** che contiene v3-extras (lcd-hello, servo-sweep) + futuri freestyle. |

## 5. Decisioni operative (autonomy Andrea-grantata)

### Decisione 1 — Q1 Capitolo schema NARRATIVE-PRESERVING

File `src/data/schemas/Capitolo.ts` (NEW) aggiunge campi a schema base PDR:

```typescript
CapitoloSchema = {
  id: string,                    // "v1-cap6"
  volume: number,
  capitolo: number,
  titolo: string,
  titolo_classe: string,         // stessa frase del libro, per display
  pageStart: number,
  pageEnd: number,

  theory: {
    testo_classe: string,        // narrativo, stile libro, letto alla classe
    citazioni_volume: [{         // testo esatto + pag
      page: number,
      quote: string,
      context: "opening" | "after_fig_N" | "closing"
    }],
    figure_refs: [{
      page, caption, image_path?
    }],
    analogies_classe: [{
      concept, text, evidence
    }]
  },

  narrative_flow: {              // CATENA CAPITOLO
    intro_text: string,          // pre-esperimento 1, setup Cap
    transitions: [{              // una per ogni esperimento dopo il primo
      between: [from_esp_id, to_esp_id],
      text_classe: string,       // "Abbiamo acceso il LED, ma senza resistore?"
      text_docente_action: string, // "Togliete il resistore. Chiedete cosa cambia."
      incremental_mode: "from_scratch" | "add_component" | "remove_component" | "modify_component"
    }],
    closing_text: string         // "Oggi abbiamo scoperto come usare il LED..."
  },

  esperimenti: [{
    id, num,
    title_classe, title_docente,
    volume_ref: { page_start, page_end, fig_refs },
    duration_minutes,
    components_needed,

    build_circuit: {
      mode: "from_scratch" | "incremental_from_prev",
      incremental_delta?: {      // solo se incremental
        base_experiment_id,
        operations: [{
          op: "add" | "remove" | "modify",
          target: component_id,
          params?
        }]
      },
      intent: { components, wires }  // full state if from_scratch
    },

    phases: [{
      name: "PREPARA" | "MOSTRA" | "CHIEDI" | "OSSERVA" | "CONCLUDI",
      duration_minutes,

      classe_display: {          // DISPLAY CENTRALE — letto ad alta voce
        text_hook: string,
        volume_quote?: { page, quote },
        observation_prompt,
        analogies
      },

      docente_sidebar: {         // SIDEBAR DESTRA — colpo d'occhio
        ora_fai: string,         // imperativo breve 1-2 righe
        chiedi_alla_classe?: string,
        attenzione_a: string[],  // bullet short
        common_mistakes_short: [{ mistake, fix }]
      },

      action_tags: string[],
      auto_action: string | null
    }],

    assessment_invisible: string[],
    session_save: { concepts_covered, next_suggested, resume_message }
  }],

  quiz_finale?: [{ question, options, correct }]
}
```

**Rationale**:
- Preserves ALL tutor JSON data (no info loss in migration)
- ADDS explicit narrative_flow + classe_display/docente_sidebar duality
- ADDS incremental build mode (matching volume progression)
- ADDS volume citations with exact pag ref

### Decisione 2 — Vol3 Cap 9 WIP fill: promote v3-extra-simon

`v3-extra-simon.json` → **renominare in Q1 migration come `v3-cap9-esp1`** e:
- `chapter: 99` → `chapter: 9`
- Aggiungere `volume_ref: { page_start: 85, page_end: 92, note: "body volume WIP, contenuto tutor self-contained" }`
- Mantenere "PROGETTO FINALE Vol3" come titolo

**Rationale**:
- Pattern coerente: Cap 14 Vol1 = Robot primo (capstone), Cap 12 Vol2 = Robot segui luce (capstone), Cap 9 Vol3 = Simon Says (capstone)
- Zero work wasted: tutor file completo già esiste
- Tea può scrivere body volume Cap 9 in seguito senza blocare Q1
- Tutti 3 volumi hanno capstone finale coerente

### Decisione 3 — v3-extras lcd/servo: nuovo tier "Progetti Bonus Vol3"

Schema Capitolo nuovo type `bonus`:
- `type: "bonus"`
- `capitolo: null`
- `volume: 3`
- `order: 1 (lcd), 2 (servo)` per ordinamento UI
- Display in UI Libero mode, sezione "Progetti Bonus" sotto Cap numerati
- No narrative_flow (esperimenti standalone)

**Rationale**:
- LCD display e Servo motor sono HW presenti nel breakout Nano ELAB (confermato docs/ e kit BOM) ma non coperti in ODT volume
- Valore pedagogico reale: LCD = output visuale, Servo = motore controllato
- Non forzarli dentro Cap 5-8 (che hanno scope preciso: Blink, Digital, Analog, Serial)
- Non promuoverli a Cap WIP (Cap 9 è simon, Cap 10-12 sono phantom)
- Tier separato "Bonus" è pattern pulito

### Decisione 4 — Passo Passo incremental mode

`BuildModeGuide.jsx` estendere con:
- Prop `mode: "from_scratch" | "incremental_from_prev"`
- Se incremental: canvas NON pulito, state precedente mantenuto
- UI mostra operations list invece di steps fresh:
  ```
  Da qui:
  [component snapshot]
  ────────
  Passo 1: Clicca sul resistore 470Ω per sostituirlo
  Passo 2: Inserisci resistore 220Ω stesso posto
  ✓ Fatto!
  ```
- Usa `incremental_delta.operations` da schema Capitolo

**Q1 migration**: script infer incremental vs from_scratch:
- Confronta `build_circuit.intent` esp N vs esp N-1
- Se delta componenti ≤ 2 + stessa breadboard/batteria = `incremental_from_prev`
- Se componenti cambiano >50% = `from_scratch`
- Override manuale per casi edge

### Decisione 5 — Percorso Capitolo UI (Q2)

File `src/components/lavagna/PercorsoCapitoloView.jsx` (NEW) + `DocenteSidebar.jsx` (NEW):

```
┌──────────────────────────────────────────────────┬─────────────────┐
│                                                  │  DOCENTE OGGI    │
│  CAP 6 — COS'È IL DIODO LED?                     │  (sticky)        │
│                                                  │                  │
│  [TEORIA CLASSE — 24px narrativo]                │  Ora: Teoria LED │
│  "Un diodo LED è un piccolo dispositivo          │  (Vol.1 pag.27)  │
│  elettronico che produce luce quando...          │                  │
│  Il suo simbolo è una freccia."                  │  Cosa fai:       │
│                                                  │  • Leggi alla    │
│  [fig.1 anatomia LED, Vol.1 pag.27]              │    classe        │
│                                                  │  • Mostra LED    │
│  ──────────────────────────────────────          │    reale         │
│                                                  │                  │
│  TRANSIZIONE (incrementale narrativo):           │  [▼ scroll]      │
│  "E ora come si accende?"                        │                  │
│                                                  │  Prossimo:       │
│  ESPERIMENTO 1 — Accendi il tuo primo LED        │  Esperimento 1   │
│  [componenti: LED rosso + R 470Ω + batteria]     │                  │
│  [passo-passo montaggio inline]                  │                  │
│                                                  │                  │
│  PROVOCATIVA (classe):                           │                  │
│  "Se giro il LED al contrario, si accende?"      │                  │
│                                                  │                  │
│  [MAGIA! Il LED si accende.]                     │                  │
│  (Vol.1 pag.31)                                  │                  │
│                                                  │                  │
│  ──────────────────────────────────────          │                  │
│                                                  │                  │
│  TRANSIZIONE:                                    │                  │
│  "E se togliamo il resistore?"                   │                  │
│                                                  │                  │
│  ESPERIMENTO 2 — LED senza resistore             │                  │
│  ...                                             │                  │
│                                                  │                  │
│  [continua fino ESP 3 + quiz finale]             │                  │
└──────────────────────────────────────────────────┴─────────────────┘
 display centrale 70% (classe legge + ascolta)       sidebar 25%
                                                     (docente colpo d'occhio)
```

- Display centrale: font 24px+, layout class-readable (LIM projection grade)
- Sidebar docente: sticky right, reactive a scroll position = mostra "ora: Esp X step Y"
- Ogni citazione inline ha badge `(Vol.1 pag.27)` cliccabile → apre VolumeViewer

### Decisione 6 — Bug editoriali volume = flag Tea, NO blocco Q1

Bug già scoperti e documentati in `docs/data/volume-structure.json` v1.1 `bugs_editorial_found[]`:
1. Vol3 ESERCIZIO 6.4 duplicato (MEDIUM)
2. Vol3 ESERCIZIO 7.8 marker mancante (LOW)
3. Vol3 PDF V0.8.1 phantom TOC (HIGH)
4. Vol2 PDF Cap 8 ESP 2 dup (LOW)

**Azione**: mail/Slack a Tea con questa lista. Tea corregge in prossima versione ODT. Q1 procede con volume-structure.json v1.1 body-verified, queste sono correzioni volume-side che non influenzano tutor migration.

## 6. Impatto Q1 scope

PDR Sprint Q1 originale: schema Capitolo base + migrazione.
**Nuovo Q1 scope espanso**:
- Q1.A schema Capitolo base (PDR) ← **estendere con narrative_flow + classe_display/docente_sidebar**
- Q1.B migrate lesson-paths → capitoli (PDR) ← **aggiungere infer incremental vs from_scratch + split classe/docente da teacher_message**
- Q1.C percorsoService refactor (PDR) ← **aggiungere get narrative_flow per Cap**
- **Q1.G (NEW) migrate simon → v3-cap9-esp1 + new tier bonus v3-extras**

Timeline Q1: PDR stimava 2-3 giorni. Con estensioni stimo 3-4 giorni.

## 7. Ordinamento finale (priorità Andrea: "rendere tutto bene ordinato")

**Struttura app post-Q1-Q2**:
```
Volumi ELAB
├── Vol 1 (14 Cap)
│   ├── Cap 1-5 (teoria) — Percorso solo lettura + citazioni volume
│   ├── Cap 6-13 (esperimenti) — Percorso narrativo + Passo Passo incremental
│   └── Cap 14 (progetto capstone Robot primo)
├── Vol 2 (12 Cap)
│   ├── Cap 1-2 (teoria)
│   ├── Cap 3-10 (esperimenti)
│   ├── Cap 11 (teoria Diodi) — teoria + demo visiva
│   └── Cap 12 (progetto capstone Robot segui luce)
├── Vol 3 (9 Cap)
│   ├── Cap 1-4 (teoria Arduino/IDE)
│   ├── Cap 5-8 (esperimenti programmazione)
│   └── Cap 9 (progetto capstone Simon Says, ex v3-extra-simon)
└── Progetti Bonus Vol 3
    ├── LCD Hello (lcd-hello)
    └── Servo Sweep (servo-sweep)
```

**Totale**: 35 Capitoli + 2 progetti bonus = 37 unità accessibili, 100% catalogate.

## 8. CoV v1.1 + Decisioni

| Check | Metodo | Risultato |
|-------|--------|-----------|
| JSON Capitolo schema proposal | Type schema review | PASS — copre tutti campi tutor JSON + narrative |
| Simon Says chapter 99 → 9 | Read v3-extra-simon.json field | PASS feasible |
| v3-extras preservation | Tier bonus design | PASS — 0 data loss |
| Passo Passo incremental feasibility | Read BuildModeGuide.jsx | PASS — prop addition straightforward |
| Percorso Cap-wide view | Read PercorsoPanel.jsx current | REQUIRES NEW — 94 righe attuale sostituite da ~300 righe nuovo PercorsoCapitoloView |
| Language duality encoded | Read v1-cap6-esp1.json phases | PASS — campi già presenti in JSON |

## 9. Prossimi passi

1. **Subito** (this PR #34): commit analysis doc + update volume-structure.json v1.2 con decisioni
2. **Q1 partenza** (Andrea OK): schema Capitolo.ts + migration script lesson-paths → capitoli con narrative extraction
3. **Q1 parallel**: flag Tea con 4 bug editoriali volume
4. **Q2**: PercorsoCapitoloView + DocenteSidebar + incremental Passo Passo + Progetti Bonus tier

---

**Verdetto**: gap volume↔tutor reale e strutturale. Q1 schema Capitolo narrative-preserving **necessario** per onorare Principio Zero v3.1 (classe legge + docente colpo d'occhio). 6 decisioni operative prese autonomamente, allineate con PDR esistente + estensioni minimal-invasive.
