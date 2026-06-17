# Sprint T iter 18 — Comprehensive Master Plan
## ELAB Tutor — 29/04/2026 → Fiera Trieste 06/05 → post-Fiera 14-30/05/2026

**Data**: 2026-04-29 (planning) — esecuzione 29/04 → 30/05/2026
**Iter master-plan-opus**: 18
**Repo HEAD**: `98974d8` (iter 18 P1 close, Sprint S iter 12 PHASE 1 score 9.30/10 ONESTO)
**Score onesto sessione iter 12-17**: ~7.5-8.0/10 (cross-verify G45 honest deflate 1.5-2 punti vs auto-claim 9.55 inflato)
**Andrea mandate iter 18 PM**: «MOLTISSIMI ESPERIMENTI NON FUNZIONANO + bad components disposti male + non funzionano» — testing sistematico OBBLIGATORIO

NO inflation. NO compiacenza. Andrea reputazione dipende da onestà brutale + esecuzione misurabile.

Fiera Trieste 06/05/2026 con Omaric + Giovanni + Davide = D-day. Domani sera 30/04 schema demo + slides DEVE essere pronto.

---

## §1 — Onestà session iter 12-17 close

### 1.1 Cosa È stato shipped (verificabile filesystem)

**18 commits totali iter 12-18** branch principale + branch worktree.

**23 strategy docs ~9300 LOC** in `docs/strategy/2026-04-28-*/`:
- `2026-04-28-pricing-strategy/` (4 docs ~2200 LOC)
- `2026-04-28-research/` (3 docs ~1500 LOC)
- `2026-04-28-financial-statements/` (4 docs ~1800 LOC)
- `2026-04-28-brand-voice/` (5 docs ~1100 LOC)
- `2026-04-28-software-pricing/` (3 docs ~1400 LOC)
- `2026-04-28-cost-stack/` (3 docs ~1300 LOC)
- `2026-04-28-MASTER-SYNTHESIS.md` (~900 LOC)

**ADR-022 ACCEPTED**: VPS GPU GDPR-compliant production stack Sprint T iter 17+. Decision Andrea cross-iter 18. Commit verificato.

**ADR-020 REJECTED** (decommission VPS GPU prematura): Andrea overrule iter 17 su evidence MNA 1.2s solver requires GPU acceleration medium-term per scuole 50+. Decision FORMAL.

**Pricing pure-market deciso (NO PNRR cushion)**:
- Light €190/anno (Y2+ €120)
- Standard €290/anno (Y2+ €190) ⭐ default sotto soglia €300 dirigente scolastico
- Pro €490/anno (Y2+ €290)
- Premium Lifetime €890 one-time (PNRR-friendly Y3 cushion ammortizzato)

**Cost stack ottimizzato**: €19-25/scuola/anno infra+ops + €15 OpEx Andrea = **€34-40/scuola/anno cost totale steady-state**.

**Margin Standard €290**: (290 - 34) / 290 = 88.3% margin gross | netto post tax IT 24% IRES = 67.1%. Numero 91% citato strategy docs = **inflato leggermente, reale 88%**.

**Wiki concepts**: 100/100 raggiunti iter 5 close, oggi iter 18 cumulative ~125 (+25 batch Mac Mini overnight Apr 27-28 inclusi `accelerometro`, `bluetooth`, `encoder`, `ir`, `rfid`, `gps`, `stepper`).

**RAG ingest LIVE prod**: 1881 chunks Voyage 1024-dim + Together Llama 3.3 70B contextualization, Supabase pgvector. Iter 7 close confermato.

**R0 91.80% PASS Edge Function** (ufficiale 12-rule scorer). R5 91.80% PASS. ENTRAMBE in production.

**N8n compile fix iter 17**: webhook `/compile` dropped 502 error retry strategy. Iter 17 fix verified prod via curl smoke.

**Vision E2E spec Playwright** (`tests/e2e/02-vision-flow.spec.js` 332 LOC): latency measured iter 14 ~2.3s avg. **NON verificato accuracy topology** o "esperimento funziona davvero".

### 1.2 Cosa NON È stato testato (gap onestà)

Andrea mandate iter 18 PM esplicito: questi gap NON colmati session iter 12-17:

1. **Esperimenti uno per uno**: 92 esperimenti `lesson-paths/` mai stati validati per:
   - Mount → component placement automatico → topology corretta?
   - Simulator run → bridge AVR8JS HEX upload → output observable?
   - Compile C++ → n8n webhook → HEX successful?
   - Vision UNLIM ask "spiegami" → retrieval RAG corretto + risposta canonica?

2. **Topology accuracy**: vision iter 14 misurato latency, NON misurato "vision dice circuito corretto vs sbagliato accuracy %". Es. circuito LED+R+battery → vision deve dire "OK Vol1 pag29" o "manca resistore". Non testato.

3. **Design grafica/estetica**: skill `/impeccable:critique` + `/frontend-design` mai applicati systematic ogni pagina critica (Lavagna/Dashboard/Esperimento/Onboarding/Auth).

4. **Voce wake word "Ehi UNLIM" live**: Edge TTS Isabella deployed iter 6 close, MA wake word real-time mic listener mai testato classe simulata 5 min consecutive.

5. **Esperimenti broken**: count attuale broken / 92 = **UNKNOWN**. Sospetto Andrea: maggioranza ha bad component placement (PlacementEngine.js bug) o non funzionano end-to-end.

### 1.3 Score onesto sessione

**Auto-score iter 12-17 narrative claim**: 9.55/10 (Sprint S iter 12 PHASE 1 ONESTO 9.30 + bonus iter 13-17 narrative).

**Cross-verify metodologia G45**: deflate 1.5-2 punti vs auto-claim quando NON cross-verified da agent indipendente.

**Score onesto reale Sprint T iter 18 entrance**: **~7.5-8.0/10**.

Razionale:
- Cose REALI shipped (RAG ingest 1881 chunks, R5 91.80%, ADR-022 accepted, 23 strategy docs) = 7.0 base
- Bonus pricing finalized + cost stack + Sense 1.5 ADR-019 = +0.5
- Penalty esperimenti non testati + design non audit + wake word non verified = -0.5 a -1.0
- **Range realistico**: 7.5 a 8.0, NON 9.55.

**Andrea mandate explicit**: «MAI PIU auto-assegnare score >7 senza verifica con agenti indipendenti» (G45 audit brutale).

### 1.4 Implicazioni Sprint T iter 18+

1. **Esperimenti testing systematic = P0 assoluto** (dettaglio §4)
2. **Demo Fiera DEVE evitare esperimenti broken** (§6)
3. **Volumi narrative refactor** = effort 30-50h post-Fiera (§3)
4. **Skill ad-hoc** = strumenti per sessioni future (§8)
5. **Mac Mini delegation** = 24/7 testing + audit + ingest (§9)
6. **Design improve sistematic** ogni pagina critica (§5)

---

## §2 — TEA PDFs analysis (3 NEW Glossario)

**Source**: cross-doc dettaglio in `docs/strategy/2026-04-28-tea-pdf-analysis.md` (~600 LOC narrative + estratti VERBATIM + bank analogie).

### 2.1 Sintesi 3 PDF Tea

| Volume | Termini | Capitoli | File bytes |
|---|---|---|---|
| 1 "Le Basi" | 66 | 14 | 32796 |
| 2 "Approfondiamo" | 59 | 12 | 29830 |
| 3 "Arduino" | 55 | 12 | 28685 |
| **TOT** | **180** | **38** | **91KB** |

Estratto via `pdftotext -layout` poppler 26.04.0 → `/tmp/tea-pdfs/{vol1,vol2,vol3}.txt` (1951 righe totali).

### 2.2 Pattern strutturale Tea

Ogni termine 180× pattern canonico:
```
[NOME TERMINE]
[ICONA]   SPIEGAZIONE TECNICA
          [paragrafo tecnico 2-4 righe]
          PER BAMBINI
          [paragrafo bambini 8-14 con ANALOGIA concreta]
```

**Caratteristiche**:
- Doppio registro tecnico+kids OBBLIGATORIO
- Analogia concreta SEMPRE (cascata, fiume, traffico, telecomando, ecc.)
- Citazione kit fisico esplicita
- Cross-reference Vol1↔Vol2 ("Approfondimento")
- Marker simbolico unicode visual aid
- Lingua scuola pubblica plurale informale

### 2.3 ~58 analogie distinte mappate (catalogo riusabile UNLIM)

Esempi cardine:
- Tensione = cascata (più alta = più forte cade)
- Corrente = fiume elettricità nei fili
- Resistenza = traffico stradale (220Ω larga vs 10kΩ strettissima)
- Resistore = guardiano del circuito
- Breadboard = tagliere del pane (etimologia letterale)
- Multimetro = coltellino svizzero (V+A+Ω)
- Condensatore = micro-batteria ricaricabile (flash macchina foto)
- Transistor = interruttore intelligente
- Gate MOSFET = cancello automatico telecomandato
- Compilatore = professore severo che controlla
- Algoritmo = ricetta del programma
- Hardware = tutto quello che puoi toccare
- Software = tutto quello che NON puoi toccare
- Microcontrollore = cervello Arduino
- Pin Arduino = dita Arduino
- Setup() = vestirsi mattina (una volta sola)
- Loop() = cuore (batte sempre 60-80/min)
- Funzione = mini-programma con nome
- HIGH = lampada accesa
- LOW = lampada spenta
- INPUT_PULLUP = trucco resistenza interna 5V default
- Falsi valori = "fantasmi" pin galleggiante
- Punto e virgola = punto fermo italiano fine istruzione
- Parentesi graffe = pareti stanza che racchiudono blocco
- Bassa tensione = 9V kit non fa male vs 220V casa

### 2.4 Confronto vs RAG ELAB current

**RAG attuale**: 1881 chunks (Vol1 203 + Vol2 292 + Vol3 198 + Wiki 100) Voyage 1024-dim.

**Glossario Tea**: 180 termini × 2 register = 360 chunks aggiuntivi potenziali.

**5 gap identificati**:

1. **Coverage**: ELAB chunks volumi grezzi narrative; Tea aggregato + indicizzato + dual register pre-split. Tea = retrieval più preciso, less hallucination.

2. **Lessico canonico bambini**: ELAB UNLIM rischia inventare analogia diversa libro vs Tea ha lista canonica 58 analogie distinte.

3. **Cross-volume references**: ELAB no grafo concettuale ponti Vol1↔2↔3. Tea esplicito (es. resistenza Vol1 cap2 → serie/parallelo Vol2 cap4 → calcolo R LED Vol2 cap6 → digitalWrite Vol3 cap5).

4. **Capstone projects mapping**: ELAB lesson-paths flat 92. Tea marca capstone esplicito (Vol1 cap14 robot, Vol2 cap12 marciante, Vol3 cap12 segui luce, borderline Vol1 cap13 elettropongo).

5. **Onestà ricostruzione**: ELAB no provenance metadata. Tea sì («termini ricostruiti» Vol3 cap9-12, 12 termini su 180 = 6.7% inferred).

### 2.5 Action ingest iter 19+

| # | Action | Owner | Effort |
|---|---|---|---|
| 1 | Parser regex pattern Tea termini → JSONL chunks | gen-app-opus | 2h |
| 2 | Schema migration `rag_chunks` campo register + analogia_kind + capstone_flag + provenance | architect-opus + Andrea apply | 30 min |
| 3 | Voyage ingest 360 chunks Tea | gen-app + run | ~30 min runtime |
| 4 | Verify recall@5 lift hybrid-gold-30 fixture post-ingest | gen-test-opus | 1h |
| 5 | UNLIM prompt v4 update: register=kids retrieval priority bambini | gen-app-opus | 1h |
| 6 | Mac Mini D2 cron Wiki Analogia Glossario ingest 22:30 | mac-mini-script | 0 (already cron, queue) |
| 7 | Documenta Tea co-dev formal credit | scribe-opus | 30 min |

**Totale effort iter 19**: ~5h dev + 30 min runtime + Andrea ratify migration ~5 min.

**Voyage cost**: 360 chunks × 1024 tokens / 50M free tier = trascurabile <$0.01.

### 2.6 Onestà Tea contribution

180 termini × ~50 parole/termine = ~9000 parole originali = ~1 settimana strutturazione manuale equivalente. Tea = co-dev + tester + creativa via Claude Code.

**Andrea decision queue iter 19+**: formal credit Tea (commit co-author? equity stake? `docs/team/tea-de-venere-credits.md` formale?).

---

## §3 — Volumi narrative continuum vs ELAB flat 92 esperimenti

### 3.1 Insight Andrea critico

**User insight iter 18 PM**:
> «Volumi cartacei = esperimenti come VARIAZIONI dello stesso tema-capitolo (narrative continuum). ELAB Tutor = 92 pezzi staccati flat = ROMPE Morfismo Sense 2.»

**Interpretazione operativa**:
- Volume cartaceo Vol1 cap6 LED non è "10 esperimenti separati flat", è UNA storia narrativa continua dove ogni esperimento è una VARIAZIONE progressiva del tema "diodo LED" (es. LED basic → LED + R → LED RGB → LED dimmer → ecc.).
- ELAB current `lesson-paths/v1-cap6-esp1.json`, `esp2.json`, ... = card flat staccate = perde narrativa libro = viola Morfismo Sense 2 ("software morfico al kit fisico + volumi cartacei + stesso ordine").

### 3.2 Audit narrative continuum Vol1 (esempio dettagliato)

**Vol1 cap6 LED** (10 termini Glossario Tea, ~10 esperimenti correlati lesson-paths):

Narrative continuum implicita libro Davide:
1. Cos'è un diodo? (concetto base)
2. Catodo vs anodo (orientazione)
3. Tensione di soglia
4. Senza resistore = LED brucia
5. Calcolo R = (V_batt - V_LED) / I_LED → primo esperimento concreto
6. Variazione: cambia colore LED (rosso 1.8V vs verde 2V vs blu 3V) → R diverso
7. Variazione: cambia batteria (9V vs 6V) → R diverso
8. Variazione: 2 LED in parallelo (R per ciascuno)
9. Variazione: 2 LED in serie (somma V_soglia)
10. Capstone: lampeggio LED (anticipa Vol3 Arduino)

ELAB current lesson-paths Vol1 cap6:
- Esperimenti flat numbered esp1-esp4 (~4 esperimenti, NON 10)
- Ognuno card indipendente
- No narrative bridge tra esp1 e esp4
- Studente non vede "stiamo esplorando variazioni di un singolo tema"

**Conseguenza**: docente che apre cap6 esperimento 3 da solo non capisce contesto narrativo; gap pedagogico vs Morfismo Sense 2.

### 3.3 Refactor proposal: lesson-paths grouped by tema-capitolo

Schema dati nuovo proposto:

```javascript
// src/data/capitoli-narrative.js (NEW iter 19+)
export const CAPITOLI_NARRATIVE = [
  {
    id: 'v1-cap6-led',
    volume: 1,
    chapter: 6,
    title: 'Cos\'è il diodo LED?',
    narrative_intro: 'Il LED è la prima vera magia dell\'elettronica: piccolo, colorato, si accende solo nel verso giusto. In questo capitolo vediamo come funziona, come collegarlo bene, e perché ha sempre bisogno del suo guardiano: il resistore.',
    page_start: 27,
    page_end: 36,
    variazioni: [
      { id: 'esp1', title: 'Il primo LED che si accende', page: 28, narrative_bridge: '...' },
      { id: 'esp2', title: 'Cambia colore, cambia resistore', page: 30, narrative_bridge: 'Hai visto il LED rosso. E se invece volessimo un LED verde? Il calcolo cambia perché...' },
      { id: 'esp3', title: 'Due LED in parallelo', page: 32, narrative_bridge: 'Un LED ti basta. Ma se ne vogliamo accendere due insieme?' },
      { id: 'esp4', title: 'Due LED in serie', page: 34, narrative_bridge: 'Parallelo è una via. Serie è un\'altra. Qual è la differenza?' },
      // ... fino a 10 variazioni
    ],
    capstone: false,
    related_terms_tea: ['Diodo', 'LED', 'Anodo', 'Catodo', 'Tensione di soglia', 'Calcolo del resistore'],
  },
  // ... 38 capitoli totali Vol1+2+3
];
```

### 3.4 3 modalità UI nuove (Andrea proposal iter 18 PM)

#### 3.4.1 Modalità "Percorso" — lettura libro page-by-page

UX:
- Apri cap → schermo presenta narrative_intro full screen (font 16+, palette ELAB Navy Lime Orange)
- Scroll narrativo continuo (NON click next per ogni esperimento)
- Embedded inline: simulator preview piccolo + componenti visualizzati man mano
- Citazione page numbers VERBATIM dai volumi (es. "Vol.1 pag.28")
- Docente può interrompere ogni momento e passare a Passo-Passo

UI elements:
- Top: progress bar capitolo (% lettura completata)
- Body: testo scroll + simulator inline
- Bottom: bottoni "Passa a Passo-Passo" + "Sandbox Libero"

Implementazione:
- New component `src/components/lavagna/ModePercorso.jsx`
- Source data: `CAPITOLI_NARRATIVE[capId].narrative_intro` + variazioni narrative_bridge
- Scroll continuo via Intersection Observer per "page tracking"
- TTS Isabella optional read-aloud (toggle)

#### 3.4.2 Modalità "Passo-Passo" — variazione sequenziale dentro capitolo

UX:
- Capitolo aperto → presenta variazione 1 di N (es. "Variazione 1/10: Il primo LED che si accende")
- Step preparazione kit fisico (componenti necessari list)
- Step montaggio simulator (componenti drag su breadboard, OR auto-placement con verifica step-by-step)
- Step verifica circuito (vision UNLIM "guarda cosa hai fatto")
- Step variation jump → next variazione (con narrative_bridge spiegazione "cosa cambiamo ora")

UI:
- Top: stepper variazione (1/10, 2/10, ...)
- Left panel: kit fisico componenti list + checkbox preparati
- Center: simulator + breadboard + componenti
- Right: codice (Arduino sketch o no) + UNLIM hint contextual

Implementazione:
- Existing `lesson-paths/v1-cap6-esp1.json` → migrate to `variazioni[0]` di `CAPITOLI_NARRATIVE['v1-cap6-led']`
- New component `src/components/lavagna/ModePassoPasso.jsx`
- Stepper component reutilize lavagna existing

#### 3.4.3 Modalità "Libero" — sandbox post-capitolo

UX:
- Aperto solo POST completion modalità Percorso o Passo-Passo (gate state Supabase)
- Simulator vuoto + tutti componenti capitolo disponibili sidebar
- UNLIM proattivo suggerisce sfide: "Hai completato cap6. Ora prova a costruire un semaforo con 3 LED" (sfida creativa coerente narrativa)
- Mode diary: studente può salvare creazioni custom Supabase

UI:
- Top: "Modalità Libero - cap.6 completato"
- Center: simulator vuoto + tutti 21 componenti disponibili drag
- Right: UNLIM mascotte + sfide proattive

Implementazione:
- Existing simulator NewElabSimulator.jsx senza vincoli lesson-path
- Gate completion via Supabase column `capitolo_completion` table users
- UNLIM proattivo via prompt template specifico mode_libero

### 3.5 Effort stima refactor

| Component | Effort | Owner |
|---|---|---|
| Schema dati `CAPITOLI_NARRATIVE` 38 capitoli | 6h | gen-app + ingest Tea metadata |
| Migration lesson-paths existing → variazioni | 8h | gen-app |
| ModePercorso.jsx component + CSS | 10h | gen-app + design |
| ModePassoPasso.jsx component + stepper | 12h | gen-app + design |
| ModeLibero.jsx component | 6h | gen-app |
| Supabase migration `capitolo_completion` table | 1h | architect SQL + Andrea apply |
| UNLIM prompt template mode-aware | 3h | gen-app |
| Tests E2E Playwright 3 mode flow | 6h | gen-test |
| Design audit `/impeccable:critique` 3 mode UI | 4h | design |

**Totale effort refactor**: **~56h** (~2 settimane dev intensive 4h/giorno).

**Timeline**: post-Fiera 14-30/05/2026 fascia tempo dedicata. NON pre-Fiera (rischio rompere demo).

### 3.6 Beneficio strategico

**Morfismo Sense 2 ripristinato**: software morfico al kit + volumi + ordine narrativo.

**Differenziatore competitor**: nessun Tinkercad/Wokwi/LabsLand offre lettura narrativa libro page-by-page. Tutti = card flat lesson list. ELAB unique = "scuola con il libro fisico" digitalizzato fedelmente.

**Demo selling point**: «Aprite la modalità Percorso → vedete il vostro Volume 1 cap6 sullo schermo proiettato sulla LIM, IDENTICO. Nessun adattamento, nessuna parafrasi.»

---

## §4 — Esperimenti testing SYSTEMATIC Playwright + Control Chrome

### 4.1 Andrea mandate iter 18 PM

> «MOLTISSIMI ESPERIMENTI NON FUNZIONANO + bad components disposti male + non funzionano»

**Stato attuale**: 92 esperimenti `lesson-paths/` mai stati validati end-to-end uno per uno. Score onesto auto-claim 9.55 = inflato perché test sistematico assente.

### 4.2 Test plan systematic

Per OGNI 92 esperimento, esecuzione checklist 6-step:

#### Step 1: Mount esperimento (~5 sec)

```javascript
// Playwright spec
await page.goto('https://www.elabtutor.school/lavagna');
await page.waitForLoadState('networkidle');
await page.evaluate((id) => {
  return window.__ELAB_API.mountExperiment(id);
}, experimentId);
await page.waitForTimeout(2000); // simulator settle
```

Verify: mount returns success + simulator canvas populated + components rendered.

#### Step 2: Component placement (~10 sec)

```javascript
const placement = await page.evaluate(() => {
  return window.__ELAB_API.unlim.getCircuitState();
});
```

Verify:
- All expected components present (LED, R, battery, Arduino Nano se applicable)
- Pin connections correct (es. LED anode → Nano D13, LED cathode → R 220Ω → GND)
- Component positions on breadboard NOT overlapping
- Wire endpoints valid (no orphan wires)

**Score per esperimento**: PASS / FAIL_MISSING_COMPONENTS / FAIL_BAD_PLACEMENT / FAIL_BROKEN_WIRES.

#### Step 3: Simulator run (~5 sec)

```javascript
await page.evaluate(() => {
  // trigger simulator solve cycle
  window.__ELAB_API.simulator?.solve?.();
});
const state = await page.evaluate(() => window.__ELAB_API.unlim.getCircuitState());
```

Verify:
- Solver MNA converges (no 'Solver did not converge' error)
- Voltages/currents reasonable (LED V_drop ~2V, current 10-20mA)
- LED lights up if expected by experiment

**Score**: PASS / FAIL_SOLVER_DIVERGE / FAIL_NO_LIGHT.

#### Step 4: Compile (if Vol3 Arduino esperimento) (~15 sec)

```javascript
const code = await page.evaluate(() => {
  return window.__ELAB_API.getCode?.();
});
const compileResult = await fetch('https://n8n.srv1022317.hstgr.cloud/compile', {
  method: 'POST',
  body: JSON.stringify({ code }),
});
const hex = await compileResult.text();
```

Verify:
- HTTP 200 from n8n webhook
- HEX file returned (non-empty, valid Intel HEX format starting `:`)
- avr8js bridge accepts HEX upload
- Simulator pin states change post-upload (es. D13 toggling)

**Score**: PASS / FAIL_HTTP_500 / FAIL_INVALID_HEX / FAIL_BRIDGE_REJECT.

#### Step 5: Vision UNLIM analysis (~10 sec)

```javascript
const screenshot = await page.evaluate(() => {
  return window.__ELAB_API.captureScreenshot();
});
const visionResp = await fetch('https://elab-galileo.onrender.com/diagnose', {
  method: 'POST',
  body: JSON.stringify({ image: screenshot, experiment_id: experimentId }),
});
```

Verify:
- Response includes plurale "Ragazzi"
- Response cites Vol/pag VERBATIM
- Topology diagnosis correct (es. "LED collegato pin 13, resistore 220Ω, polarizzazione OK")
- Latency < 5 sec

**Score**: PASS / FAIL_TIMEOUT / FAIL_NO_PLURALE / FAIL_NO_CITATION / FAIL_BAD_TOPOLOGY.

#### Step 6: UNLIM ask "spiega" (~8 sec)

```javascript
const askResp = await fetch('SUPABASE_URL/functions/v1/unlim-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: `Spiegami questo esperimento`,
    experiment_id: experimentId,
    class_key: 'test-systematic',
  }),
});
```

Verify:
- Response < 5 sec
- Plurale "Ragazzi"
- Cita Vol/pag VERBATIM corretto per cap esperimento
- Max 60 parole + max 1 analogia
- Risposta canonical (ricetta/cascata/fiume/multimetro/ecc. da bank Tea)

**Score**: PASS / FAIL_TIMEOUT / FAIL_INFLATED_LENGTH / FAIL_NO_PLURALE / FAIL_NO_CITATION.

### 4.3 Output report systematic

Schema JSON output per 92 esperimenti:

```json
{
  "test_run_id": "iter-18-systematic-2026-04-29T14-00-00Z",
  "results": [
    {
      "experiment_id": "v1-cap6-esp1",
      "volume": 1, "chapter": 6, "variation": 1,
      "title": "Lampeggia LED",
      "step1_mount": "PASS",
      "step2_placement": "PASS",
      "step3_simulator": "PASS",
      "step4_compile": "N/A",
      "step5_vision": "PASS",
      "step6_unlim": "PASS",
      "overall": "PASS"
    },
    {
      "experiment_id": "v3-cap10-esp1",
      "volume": 3, "chapter": 10, "variation": 1,
      "title": "Pulsante e LED",
      "step1_mount": "PASS",
      "step2_placement": "FAIL_BAD_PLACEMENT",
      "step2_details": "Pulsante non collegato alla breadboard correttamente, fila E pin sbagliata",
      "step3_simulator": "FAIL_SOLVER_DIVERGE",
      "overall": "FAIL"
    }
    // ... 92 entries
  ],
  "summary": {
    "total": 92,
    "pass": 0,
    "fail": 0,
    "fail_breakdown": {
      "FAIL_MISSING_COMPONENTS": 0,
      "FAIL_BAD_PLACEMENT": 0,
      "FAIL_BROKEN_WIRES": 0,
      "FAIL_SOLVER_DIVERGE": 0,
      "FAIL_HTTP_500": 0,
      "FAIL_NO_CITATION": 0
    }
  }
}
```

### 4.4 Identificare broken + fix priority

Post-test run, ranking esperimenti broken:

**P0 (broken core, alta visibilità)**:
- Esperimenti Vol1 cap6 LED (4 esperimenti) — primo capitolo critico onboarding docente
- Esperimenti Vol3 cap5 Blink (1 esperimento) — primo Arduino sketch demo
- Esperimenti Vol3 cap10 Pulsante (2 esperimenti) — INPUT_PULLUP fondamentale

**P1 (broken intermedio)**:
- Vol2 cap3 Multimetro (3 esperimenti) — strumento essenziale
- Vol2 cap8 Transistor MOSFET (4 esperimenti) — Tea segnalato problematico
- Vol3 cap8 Pin analogici (3 esperimenti) — fotoresistore + potenziometro

**P2 (broken edge)**:
- Esperimenti capstone Vol1 cap14 Robot, Vol2 cap12 Marciante, Vol3 cap12 Segui Luce
- Esperimenti rare Vol1 cap13 Elettropongo

### 4.5 Mac Mini delegation testing background

**Task M1**: cron Mac Mini ogni 4h esegue Playwright test systematic 92 esperimenti.

```bash
# crontab Mac Mini
0 */4 * * * cd /home/progettibelli/elab-builder && npx playwright test tests/e2e/systematic-92.spec.js --reporter=json > /tmp/systematic-result-$(date +%s).json && cp /tmp/systematic-result-*.json automa/state/systematic-history/
```

**Output**: history results in `automa/state/systematic-history/result-YYYYMMDD-HHMMSS.json`. Trend grafico via dashboard agent (P2).

### 4.6 Effort stima

| Component | Effort | Owner |
|---|---|---|
| Playwright spec systematic-92.spec.js | 8h | gen-test |
| Helper functions (mount, verify placement, ecc.) | 4h | gen-test |
| n8n compile mock per CI test (avoid prod hammering) | 3h | gen-app + n8n config |
| Vision endpoint test fixture (avoid Render cold start) | 2h | gen-test |
| Mac Mini cron setup | 1h | mac-mini-script |
| Dashboard results trend (Sprint U+) | 6h | gen-app |
| Fix priority list documentation | 2h | scribe |

**Totale**: **~26h** + ~4h fix priority list.

### 4.7 Pre-Fiera urgency

**P0 entro 03/05/2026**: identificare top-10 esperimenti broken + fix entro 04/05 → demo Fiera 06/05 NON mostra esperimenti rotti.

Se 50% esperimenti broken (sospetto Andrea), demo Fiera DEVE limitarsi top-10 esperimenti VERIFIED working:
- Vol1 cap6 esp1-2 LED basic
- Vol1 cap2 Legge Ohm verify
- Vol2 cap3 Multimetro misura V batteria
- Vol3 cap5 Blink LED_BUILTIN
- Vol3 cap6 digitalWrite() pin output
- Vol3 cap10 Pulsante INPUT_PULLUP

7 esperimenti × 5 min ciclo = sufficienti 30-45 min demo continuo.

---

## §5 — Design grafica improvement

### 5.1 Skills da applicare

**Skill catalog Anthropic + impeccable**:
- `/frontend-design` — distinctive production-grade frontend
- `/algorithmic-art` — p5.js algorithmic art (per ELAB SVG component artistry?)
- `/web-artifacts-builder` — multi-page artifacts
- `/canvas-design` — visual art .png/.svg
- `/figma-generate-design` — Figma generation MCP-backed
- `/design-critique` — structured feedback usability
- `/impeccable:critique` — UX evaluation
- `/impeccable:typeset` — typography fix
- `/impeccable:arrange` — layout spacing visual rhythm
- `/impeccable:colorize` — strategic color
- `/impeccable:audit` — accessibility WCAG check

### 5.2 Component palette ELAB verify

**Palette canonica** (CLAUDE.md regole immutabili #16):
- Navy `#1E4D8C` — titoli, navigazione primaria
- Lime `#4A7A25` — successi, conferme, OK
- Orange `#E8941C` — warning, attenzione
- Red `#E54B3D` — errori, blocchi, alert critici

**Verify task**:
1. Run script CSS analyzer → identifica colori non-palette in src/components/
2. Output: `docs/audits/2026-04-29-palette-audit.md` con counts per file
3. Top 10 violazioni → fix sistematico

**Atteso**: ~15-30 viol minor (fontSize hardcoded vs design tokens, qualche grigio/azzurro generic).

### 5.3 LIM legibility (font 14+)

CLAUDE.md regola immutabile #8: «Font minimo 13px testi, 10px label secondarie».

**Iter 14 partial fix**: ~50% componenti applicano. Iter 12 quality audit raw signal: «435 font<14 CSS + 1326 fontSize<14 JSX» violations.

**Action iter 19**:
1. Script auto-fix: `node scripts/font-size-fix.cjs --dry-run` → preview
2. Apply CSS modules: replace `font-size: 12px` → `font-size: 13px` (testi) o `font-size: 14px` (LIM-first)
3. Apply JSX inline: replace `style={{ fontSize: '12px' }}` → `style={{ fontSize: 'var(--font-base)' }}` con CSS var
4. Verify LIM proiezione 1080p readable da fondo classe (~5m distance)

**Effort**: 4h script + 2h manual review + 1h LIM verify.

### 5.4 Touch target 44px (iter 14+15 partial)

CLAUDE.md regola #9: «Touch target minimo 44x44px per bottoni interattivi».

**Iter 12 quality audit**: «103 touch<44» violazioni.

**Action iter 19**:
1. Script auditor: `node scripts/touch-target-audit.cjs` → report violazioni con file:line
2. Fix priority: bottoni primary action (Compila, Esegui, Salva) → 48x48px
3. Fix bottoni secondary (Toggle, Filter) → 44x44px minimo
4. Verify iPad touch + Lavagna interattiva touch (proiezione 65"+ con touch overlay)

**Effort**: 3h script + 4h fix.

### 5.5 Brand voice Affidabile/Didattico/Accogliente

**3 parole personalità Andrea-confirmed iter 8 close 2026-04-27**: Affidabile + Didattico + Accogliente.

**Action iter 19**:
1. Audit CSS animations + microcopy via `/impeccable:critique`
2. Identifica violazioni:
   - Animazioni "gaming RGB" (vietato anti-reference): NO
   - Animazioni Disney cartoon: NO
   - Linguaggio enterprise B2B Salesforce: NO
3. Microcopy review tutte UI strings → conformi voce italiano scuola pubblica plurale "Ragazzi"

**Effort**: 5h audit + 4h microcopy refinement.

### 5.6 Critical pages systematic improvement

Skills applicare per ogni pagina:

#### 5.6.1 Lavagna (`src/components/lavagna/`)

- `/impeccable:audit` → check WCAG accessibility
- `/impeccable:typeset` → fontSize Lavagna LIM 16-18px primary
- `/impeccable:arrange` → 3 zone Tea schema (panel sx + canvas centro + UNLIM dx)
- `/design-critique` → docente UX usability test fictional

**Output**: `docs/audits/2026-04-29-lavagna-design-audit.md`.

#### 5.6.2 Dashboard docente (`src/components/dashboard/`)

**Stato**: vuoto (CLAUDE.md bug #1). Sprint S iter 7+ pending.

- `/figma-generate-design` → mockup wireframe Dashboard MVP
- Componenti: classi list + studenti progressi + nudge pending + export CSV
- Effort: 12h design + 24h impl Sprint U.

#### 5.6.3 Esperimento (Modalità Passo-Passo)

- `/impeccable:onboard` → onboarding flow primo accesso esperimento
- `/impeccable:delight` → joy moments completamento variazione (animazione check + sound success)
- `/impeccable:clarify` → microcopy step instructions

**Effort**: 6h design + 8h impl.

#### 5.6.4 Onboarding 3-click (existing iter G39-G40 partial)

- `/impeccable:onboard` review pattern Khan Academy + Lego Education reference
- 3 click max: Volume → Capitolo → Esperimento
- Mascotte UNLIM benvenuto (1 frase)

**Effort**: 4h refine.

#### 5.6.5 Auth pages

**Stato**: class_key localStorage (NON Supabase Auth). Onboarding low-friction.

- Verify class_key flow first-time user
- Handle "Codice classe" input UX (4-6 chars, easy memorize)
- Gate vs Lavagna libera (no class_key → mode demo limit)

**Effort**: 3h refine.

### 5.7 Effort totale design improvement

| Page/Area | Effort |
|---|---|
| Palette audit + fix | 4h |
| Font 14+ fix | 7h |
| Touch 44+ fix | 7h |
| Brand voice audit + microcopy | 9h |
| Lavagna systematic | 8h |
| Dashboard mockup + impl | 36h |
| Esperimento onboarding | 14h |
| Onboarding 3-click | 4h |
| Auth pages | 3h |

**Totale design**: **~92h** (~3 settimane intensive).

**Timeline**: spalmato Sprint T iter 18 → Sprint U fine Maggio 2026. Critical path Fiera = solo top-3 fix (palette + font + Lavagna iter 19+).

---

## §6 — Demo Fiera Trieste 30/04 schema preparation

### 6.1 Demo target

**Fiera Trieste 06/05/2026** con Omaric (kit fisico) + Giovanni (sales) + Davide (autore + MePA).

**Audience**: docenti scuole pubbliche italiane + dirigenti scolastici + distributori didattica.

**Setup**:
- Laptop Andrea (MacBook Pro)
- LIM esterna (HDMI/USB-C)
- Speaker audio (Isabella Neural TTS audible da fondo stand)
- Kit fisico Omaric su tavolo
- Volumi cartacei Vol1+2+3 portata mano

### 6.2 Demo script existente

File: `docs/demo/2026-05-06-fiera-trieste-demo-script.md` (creato pre-iter 18).

**Struttura attuale**:
- §1 Apertura "il problema docente" (60 sec)
- §2 Apri ELAB + Lavagna (45 sec)
- §3 Mount esperimento Vol1 cap6 LED (60 sec)
- §4 UNLIM voice "spiegami il LED" (90 sec)
- §5 Compila + carica circuito (90 sec)
- §6 Vision: "guarda cosa abbiamo fatto" (75 sec)
- §7 Modalità Percorso + Passo-Passo (60 sec)
- §8 Q&A (variabile)

### 6.3 Update demo post-realtà esperimenti tested

Post-§4 systematic test, **DEMO DEVE evitare esperimenti broken**.

**Demo pool 7 esperimenti VERIFIED working** (placeholder, da confermare post-test):
1. Vol1 cap6 esp1 LED basic
2. Vol1 cap6 esp2 LED + R calcolo
3. Vol1 cap2 Legge Ohm
4. Vol2 cap3 Multimetro misura batteria
5. Vol3 cap5 Blink LED_BUILTIN
6. Vol3 cap6 digitalWrite() pin output
7. Vol3 cap10 Pulsante INPUT_PULLUP

**Cycle demo 5 min**: scegli 1 esperimento per ciclo, ripeti diverso visitatore.

### 6.4 Pacchetti pricing pure-market shipped

**3 slides max post-demo**:

#### Slide 1 — Cosa è ELAB Tutor

«ELAB Tutor è il primo software didattico italiano morfico ai volumi cartacei. Ogni esperimento sullo schermo cita VERBATIM la pagina del libro. Il tutor AI (UNLIM) parla la stessa lingua del docente. Si integra al kit fisico Omaric. Tre prodotti, una sola esperienza unificata.»

#### Slide 2 — Pricing pure-market 4 tier

| Pacchetto | Y1 | Y2+ | Caratteristiche |
|---|---|---|---|
| Light | €190 | €120 | 1 docente, 1 classe, esperimenti base |
| **Standard ⭐** | **€290** | **€190** | 2 docenti, 5 classi, tutti 92 esperimenti, voice, vision |
| Pro | €490 | €290 | 5 docenti, illimitate classi, dashboard avanzata, priority support |
| Premium Lifetime | €890 | — | One-time, lock-in tutto + future features |

**Add-ons modulari €49-69**:
- Compile Arduino unlimited
- Multi-class license
- Backup Cloud 30gg
- Voice premium ElevenLabs

**Default raccomandato**: Standard €290 sotto soglia €300 dirigente scolastico (PNRR voucher copre 100%).

#### Slide 3 — Differenziatore + Roadmap

**Differenziatore vs Tinkercad/Wokwi/LabsLand**:
- Morfismo triplet (software ↔ kit ↔ volumi) NON copiabile
- Italiano scuola pubblica nativo (UNLIM cita Volume + pagina)
- Kit fisico filiera Omaric (Strambino, vendita PA Davide MePA)
- Voce Isabella Neural italiana
- Vision diagnosi circuiti studenti

**Roadmap pubblica**:
- 06/05/2026 (oggi): Fiera launch
- 30/06/2026: PNRR Piano Scuola 4.0 deadline (voucher disponibili)
- Settembre 2026: pacchetto Premium Lifetime push
- 2027: Vol4 (TBD post-feedback Davide)

### 6.5 Push videolezioni differenziatore

**Andrea sample**: 1 video settimana prossima (target 06/05 stesso o subito post).

**Concept**: Andrea registra 5-min video "Come usare ELAB Tutor in 1 minuto" (screencast + voce off). Mostra:
- Apri Lavagna
- Mount esperimento
- UNLIM ask
- Compila

**Push commerciale**: «Ogni settimana 1 nuovo video. 92 esperimenti × video = libreria didattica completa entro fine 2026. Incluso in Standard+».

### 6.6 Schema 30/04 pronto

**Action 30/04 entro fine giornata**:

1. **3 slides PowerPoint/Canva**: cosa è + pricing + differenziatore (effort 2h Andrea)
2. **Demo script update post-test**: rimuovi esperimenti broken (effort 1h scribe + Andrea review)
3. **1-pager brochure**: stessi 3 messaggi + QR code https://elabtutor.school + Andrea contact (effort 2h Canva)
4. **Stand setup checklist**: laptop + cavi HDMI + speaker + power bank + kit Omaric x2 spare + volumi 3 copie (effort 30 min)
5. **Voice Isabella prove finali**: TTS deployed + audio amplificato test stand (effort 1h)
6. **Internet contingency**: hotspot 4G/5G fallback + offline mode HEX se internet failure (effort 1h verify)

**Totale effort 30/04**: ~7h Andrea + 1h scribe = **8h day completo**.

### 6.7 Demo rehearsal Tea + Andrea

**Data**: 02/05/2026 evening (4 giorni pre-Fiera).

**Format**:
- Tea fa visitatore docente. Andrea fa demo. Tea pone obiezioni reali docente ("e se non ho Wi-Fi?", "il mio kit è diverso", "i bambini di 8 anni capiscono?", "quanto costa Y2?").
- Andrea risponde + cronometra ciclo. Target 5 min.
- 3 cicli rehearsal con 3 esperimenti diversi.
- Feedback Tea brutalmente onesto.

**Output**: `docs/demo/2026-05-02-rehearsal-feedback.md` con fix list pre-06/05.

**Effort**: 2h rehearsal + 1h fix list.

---

## §7 — RunPod $13 strategic usage

### 7.1 Stato attuale RunPod

- Pod `5ren6xbrprhkl5` RTX A6000 TERMINATED iter 5 P3 (Andrea Path A confirmed)
- Storage $0.33/mo (volume 50GB persisted) iter 5 close
- Pod nuovo `felby5z84fk3ly` RTX 6000 Ada EXITED iter 1+2

**Discipline cost**: $0.74/h RUNNING vs $0.33/mo EXITED. Resume only when work active.

### 7.2 RunPod $13 strategic usage iter 18+

**Budget**: $13 = ~17h RTX A6000 (a $0.74/h). Spendere PRE-Fiera per dev intensive.

#### Task R1 — Voxtral training audio Andrea voice clone (~3h)

- Andrea record 1 sample voice 3-min (free read story italiano + tutorial style)
- Voxtral 4B fine-tune voice cloning Andrea voice
- Output: voice clone Andrea per UNLIM TTS (alternative Isabella per "voce Andrea founder")
- Use case Fiera: «Senti, sono Andrea. Ti spiego ELAB Tutor in 30 secondi.» Personalizzazione differenziatore.

**Effort GPU**: 2h training + 1h verify quality.

#### Task R2 — Bench R5/R6 stress final (~2h)

- R5 fixture 50 prompts execution: Edge Function deployed iter 5 P3, R5 91.80% PASS confermato
- R6 fixture 100 prompts (RAG-aware): Hybrid RAG retriever live post-RAG-ingest iter 7
- Verify recall@5 ≥ 0.55 + R6 score ≥ 90%

**Effort GPU**: 1h R5 + 1h R6.

#### Task R3 — 92 esperimenti simulator parallel test (~4h)

- Spin up Playwright Docker on RunPod GPU instance
- Run systematic-92.spec.js × 4 parallel workers
- Output JSON results all 92 esperimenti
- Identifica broken pre-Fiera

**Effort GPU**: 4h test execution.

#### Task R4 — Vision UNLIM diagnosis quality real circuit photos (~3h)

- Andrea/Tea scattano 20 foto kit fisico Omaric circuiti reali (LED basic, Pulsante, Multimetro misura, ecc.)
- Upload foto a Vision endpoint Render
- Verify response quality: cita Vol/pag, identifica componenti, analizza topology, diagnose errori
- Score accuracy: 20 foto × 6 step = 120 verify points

**Effort GPU**: 1h foto upload + 2h verify.

#### Task R5 — Re-run B2 hybrid RAG measure post deploy iter 18 fixes (~2h)

- Hybrid RAG retriever Box 6 iter 12 0.85 (impl shipped, NON live verified)
- Run hybrid-gold-30 fixture queries vs Edge Function deployed
- Measure recall@5 + precision@5 + RRF k=60 + reranker output quality
- Save to `/tmp/runpod-iter18-results.json`

**Effort GPU**: 1h env setup + 1h run.

### 7.3 Output strategy

Save findings to:
```
/tmp/runpod-iter18-results.json
{
  "voxtral_voice_clone": {"andrea_sample_3min": "OK", "quality_subjective": "TBD Andrea"},
  "r5_stress": {"score": 91.8, "fixture_50": "PASS"},
  "r6_stress": {"score": "TBD", "fixture_100": "TBD"},
  "systematic_92": {"pass": "TBD", "fail": "TBD", "fail_breakdown": {...}},
  "vision_quality": {"foto_count": 20, "accuracy_topology": "TBD", "accuracy_citation": "TBD"},
  "hybrid_rag": {"recall_at_5": "TBD", "precision_at_5": "TBD"}
}
```

### 7.4 Budget RunPod allocation

| Task | Hours | Cost | Priority |
|---|---|---|---|
| R1 Voxtral voice clone | 3h | $2.22 | P1 |
| R2 R5/R6 stress | 2h | $1.48 | P1 |
| R3 92 systematic test | 4h | $2.96 | **P0** |
| R4 Vision quality | 3h | $2.22 | P0 |
| R5 Hybrid RAG verify | 2h | $1.48 | P1 |
| Buffer 3h | 3h | $2.22 | -- |

**Total**: 17h × $0.74 = **$12.58** ≤ $13 budget. ✅

### 7.5 Resume + run schedule

**Window dev intensive**: 30/04 mattina-pomeriggio (8h) + 02/05 mattina (5h) = 13h totale → adatta agli 17h con buffer.

```bash
export ELAB_RUNPOD_POD_ID="felby5z84fk3ly"
bash scripts/runpod-resume.sh $ELAB_RUNPOD_POD_ID  # ~2 min boot
# ... run R1-R5 sequentially or parallel
bash scripts/runpod-stop.sh $ELAB_RUNPOD_POD_ID    # max savings post-task
```

---

## §8 — Skills ad-hoc da creare per future sessioni

### 8.1 Skill 1: cost-analysis-competitor

**Scope**: ongoing competitor pricing tracker + chart generator.

**Structure**:
```
.claude/skills/cost-analysis-competitor/
├── SKILL.md
├── reference/
│   ├── competitor-pricing-2026-Q2.md
│   ├── pricing-history.jsonl
│   └── chart-templates.md
└── scripts/
    ├── fetch-competitor-pricing.mjs (web scrape Tinkercad/Wokwi/LabsLand official sites)
    └── generate-pricing-chart.mjs (output PNG/SVG via canvas-design)
```

**SKILL.md description**:
> «Tracks competitor pricing periodically (Tinkercad/Wokwi/LabsLand/CampuStore/MIT App Inventor pricing tier), generates pricing position chart vs ELAB Tutor pricing, alerts on competitor price changes.»

**Commands**:
- `/cost-analysis-competitor refresh` — re-scrape all competitors
- `/cost-analysis-competitor chart` — generate PNG positioning chart
- `/cost-analysis-competitor alert` — diff vs last run, output significant changes

**When invoke**: monthly review pricing strategy, pre-Fiera positioning, post-major-competitor-launch news.

**Output format**: markdown report + PNG chart + jsonl history append.

### 8.2 Skill 2: experiment-testing-orchestrator

**Scope**: Playwright + Control Chrome ogni esperimento + fix tracker.

**Structure**:
```
.claude/skills/experiment-testing-orchestrator/
├── SKILL.md
├── reference/
│   ├── 92-experiments-catalog.md
│   ├── failure-modes-taxonomy.md
│   └── fix-priority-matrix.md
└── scripts/
    ├── run-systematic-92.mjs (orchestrate Playwright + verify all 6 steps)
    ├── parse-results.mjs (build fix priority list)
    └── update-tracker.mjs (Supabase persist run results)
```

**SKILL.md description**:
> «Run systematic 92-experiments end-to-end test (mount + placement + simulator + compile + vision + UNLIM ask), generate fix priority list, persist to tracker. Use pre-Fiera or post-major-refactor.»

**Commands**:
- `/experiment-testing-orchestrator run-all` — full systematic 92 spec
- `/experiment-testing-orchestrator run-volume 1` — only Vol1 esperimenti
- `/experiment-testing-orchestrator run-broken` — re-run last failures
- `/experiment-testing-orchestrator fix-list` — output P0/P1/P2 priority

**When invoke**: Sprint T iter 19+ before each release, monthly QA, pre-demo.

**Output**: JSON results + markdown fix list + Supabase tracker append.

### 8.3 Skill 3: volumi-alignment-checker

**Scope**: audit narrative continuum vs flat lesson-paths.

**Structure**:
```
.claude/skills/volumi-alignment-checker/
├── SKILL.md
├── reference/
│   ├── volumi-narrative-canon.md (38 capitoli structure expected)
│   ├── morfismo-sense-2-rules.md
│   └── violation-taxonomy.md
└── scripts/
    ├── audit-narrative-continuum.mjs
    ├── compare-vs-volumi-pdf.mjs (extract via pdftotext + diff vs lesson-paths)
    └── generate-refactor-plan.mjs
```

**SKILL.md description**:
> «Compare ELAB lesson-paths flat vs volumi narrative continuum. Identify violations Morfismo Sense 2. Generate refactor plan grouping flat → CAPITOLI_NARRATIVE schema.»

**Commands**:
- `/volumi-alignment-checker audit` — full audit + violation list
- `/volumi-alignment-checker compare-cap 1 6` — specific cap (Vol1 cap6)
- `/volumi-alignment-checker refactor-plan` — output migration JSON

**When invoke**: pre-major-refactor lesson-paths, after volumi v2 release, monthly Morfismo verify.

**Output**: violation report + refactor migration JSON + ETA stima.

### 8.4 Skill 4: demo-rehearsal-runner

**Scope**: live demo timing + voice over check.

**Structure**:
```
.claude/skills/demo-rehearsal-runner/
├── SKILL.md
├── reference/
│   ├── demo-script-canon.md (current demo script)
│   ├── timing-targets.md (5 min cycle, sub-section budgets)
│   └── voice-prompts-library.md (Isabella Neural common phrases)
└── scripts/
    ├── timer-rehearsal.mjs (interactive timer per section)
    ├── voice-over-check.mjs (TTS Isabella + audio quality verify)
    └── feedback-collector.mjs (Tea/Andrea feedback structured)
```

**SKILL.md description**:
> «Run demo rehearsal with timer per section + voice over Isabella check + feedback collection structured. Generate final pre-Fiera fix list.»

**Commands**:
- `/demo-rehearsal-runner timer` — interactive timer demo cycle
- `/demo-rehearsal-runner voice-check` — Isabella TTS amplified test
- `/demo-rehearsal-runner feedback` — collect Tea/Andrea feedback structured

**When invoke**: 2-4 giorni pre-Fiera, prima evento major, post demo script update.

**Output**: timing report + voice quality + feedback fix list.

### 8.5 Skill 5: market-trends-researcher

**Scope**: future market+tech analysis monthly.

**Structure**:
```
.claude/skills/market-trends-researcher/
├── SKILL.md
├── reference/
│   ├── market-segments-italy-edu.md (PNRR + Mepa + scuola pubblica trends)
│   ├── tech-trends-watch.md (LLM open source, RAG advances, voice cloning)
│   └── news-sources-curated.md (italian + international edu-tech)
└── scripts/
    ├── fetch-news-curated.mjs (RSS + scrape major edu-tech news)
    ├── tech-radar-update.mjs (track LLM model releases, RAG paper)
    └── synthesize-monthly-brief.mjs
```

**SKILL.md description**:
> «Monthly market + tech trends research for ELAB Tutor strategic planning. Fetch news, track tech, synthesize brief Andrea decision support.»

**Commands**:
- `/market-trends-researcher monthly-brief` — synthesize last 30 days
- `/market-trends-researcher tech-radar` — LLM/RAG/voice update
- `/market-trends-researcher news-quick` — last 7 days news edu-tech

**When invoke**: monthly strategic planning, pre-major-decision, post-Fiera de-brief.

**Output**: markdown brief + tech radar table + decision support points.

### 8.6 Skill 6: principio-zero-validator-runtime

**Scope**: online check ogni response UNLIM compliance Principio Zero.

**Structure**:
```
.claude/skills/principio-zero-validator-runtime/
├── SKILL.md
├── reference/
│   ├── pz-rules-canon.md (6 PZ rules from ADR-009)
│   ├── violation-examples.md
│   └── auto-fix-suggestions.md
└── scripts/
    ├── live-validator.mjs (websocket subscribe Edge Function responses)
    ├── violation-tracker.mjs (Supabase persist violations)
    └── auto-suggest-fix.mjs (LLM-suggest fix violation)
```

**SKILL.md description**:
> «Live runtime validator Principio Zero on UNLIM responses prod. Subscribe Edge Function output stream, check 6 PZ rules, persist violations, auto-suggest fix Andrea review.»

**Commands**:
- `/principio-zero-validator-runtime live` — start websocket monitor
- `/principio-zero-validator-runtime violations-7d` — last 7 days report
- `/principio-zero-validator-runtime auto-suggest` — LLM-suggest fix top violations

**When invoke**: continuous prod monitoring (cron Mac Mini hourly), pre-deploy verify, post-prompt-update sanity check.

**Output**: violations log + fix suggestions + alert Andrea email.

### 8.7 Effort skill creation

| Skill | Effort | Owner |
|---|---|---|
| 1. cost-analysis-competitor | 4h | scribe + skill-creator |
| 2. experiment-testing-orchestrator | 8h | gen-test + skill-creator |
| 3. volumi-alignment-checker | 6h | gen-app + skill-creator |
| 4. demo-rehearsal-runner | 4h | gen-app + skill-creator |
| 5. market-trends-researcher | 5h | scribe + skill-creator |
| 6. principio-zero-validator-runtime | 6h | gen-app + skill-creator |

**Totale**: **~33h** spalmato Sprint T iter 18-25.

**Critical path Fiera**: solo Skill 4 demo-rehearsal-runner pre-06/05. Altri post-Fiera.

---

## §9 — Mac Mini delegation iter 18+ proattivo critico

### 9.1 Stato cron alive

**4 cron alive verified iter 13+**:
1. R5 stress test daily (verify ≥90% baseline)
2. R6 stress test weekly (verify recall@5)
3. Wiki Analogia 22:30 (Mac Mini autonomous loop concept generator)
4. Heartbeat ogni 5 min (`automa/state/heartbeat`)

**Volumi PDF Sun cron**: weekly Sunday parse PDF aggiornamenti.

### 9.2 NEW tasks dispatch iter 18+

#### Task D1 — ToolSpec L2 expand 72→80 (8 templates remaining)

**Scope**: completare 8 ToolSpec L2 template per OpenClaw Onnipotenza Morfica v4.

**8 templates remaining** (verify catalog):
- multi-step assembly verification
- anomaly-detection circuit thermal
- session-replay narrative summary
- multi-class progression aggregator
- volumi-pdf-parse incremental update
- nudge-cooldown personalized timing
- export-csv structured progress
- voice-prompt-context-aware

**Mac Mini cron**: nightly 02:00 dispatch 1-2 templates → ToolSpec generator → verify schema → commit branch `mac-mini/toolspec-L2-batch-YYYYMMDD`.

**Effort**: 8 templates × ~30 min = 4h totale, spalmato 4-8 nights.

#### Task D2 — Wiki Analogia Glossario Tea ingest (3 PDF)

**Scope**: dopo §2 ingest pipeline shipped iter 19, Mac Mini cron consuma batch Tea Glossario overnight.

**Cron 22:30 nightly**:
- Source: `/tmp/tea-pdfs/{vol1,vol2,vol3}.txt` (already extracted)
- Parse termini regex pattern → ~50 termini/notte
- Voyage embedding batch + Supabase insert
- Branch `mac-mini/wiki-analogia-tea-batch-YYYYMMDD`
- 3-4 notti totale 360 chunks ingested

**Effort autonomous**: 0 Andrea/Tea (cron only).

#### Task D3 — Esperimenti test continuous via __ELAB_API simulator

**Scope**: cron Mac Mini ogni 4h esegue Playwright systematic 92 (vedi §4.5).

**Cron `0 */4 * * *`**:
- Run Playwright headless on Mac Mini Linux
- Output JSON `automa/state/systematic-history/result-YYYYMMDD-HHMMSS.json`
- Compute delta vs last run → flag regression Andrea email
- Post-Fiera maintenance background

**Effort**: 1h cron setup + ongoing $0 (Mac Mini Tailscale already always-on).

#### Task D4 — Volumi narrative audit (sequenziale Vol1+2+3)

**Scope**: skill `/volumi-alignment-checker` (§8.3) cron monthly.

**Cron mensile primo Lunedì 04:00**:
- Audit 38 capitoli vs lesson-paths flat
- Output violation report + ETA refactor stima
- Branch `mac-mini/volumi-audit-YYYY-MM`
- Andrea review monthly review

**Effort**: 0 ongoing post skill creation.

#### Task D5 — Cost competitor monitor monthly

**Scope**: skill `/cost-analysis-competitor` (§8.1) cron monthly.

**Cron primo del mese 03:00**:
- Scrape Tinkercad/Wokwi/LabsLand/CampuStore official sites
- Diff vs last run
- Generate PNG chart positioning ELAB
- Branch `mac-mini/cost-competitor-YYYY-MM`
- Andrea email alert significant changes

**Effort**: 0 ongoing post skill creation.

### 9.3 Critical: NON dire che ha fatto cosa se non verified output state file

**Onestà mandatory iter 18+**:

Mac Mini cron output → MUST verify branch existence + commit hash + automa/state file present BEFORE claiming task done.

**Pattern verifica**:
```bash
# Andrea verify Mac Mini D2 done
git fetch origin mac-mini/wiki-analogia-tea-batch-20260429
git log origin/mac-mini/wiki-analogia-tea-batch-20260429 --oneline -5
ls -la automa/state/wiki-analogia-tea-progress.json
# Se entrambi present + commit msg conforme → DONE
# Se assenti → cron failed silently, investigate logs
```

**Anti-pattern**: scribe-opus narrative claim "Mac Mini D2 done" senza filesystem verify → score iter 7+ inflato precedente. NEVER repeat.

### 9.4 Mac Mini SSH stability

**Stato iter 18**: `progettibelli@100.124.198.59` via Tailscale + key `~/.ssh/id_ed25519_elab` (MacBook only).

**SSH key policy ENFORCED CLAUDE.md**:
- `id_ed25519_elab`: SOLO MacBook locale, MAI archive GitHub/cloud
- `id_ed25519_runpod`: dedicated RunPod
- Mac Mini ha SOLO `authorized_keys` (public key MacBook)

**Iter 12 issue**: Mac Mini SSH timeout (Tailscale unreachable) → autonomous loop probabilmente DEAD.

**Action iter 18+**: Andrea verify Mac Mini alive + Tailscale connected + cron heartbeat last 24h. Se DEAD, debug Tailscale + restart launchctl `com.elab.mac-mini-autonomous-loop`.

**Effort**: 30 min Andrea verify + restart se needed.

---

## §10 — Multi-agent orchestration CoV continuous

### 10.1 Pattern S 5-agent OPUS PHASE-PHASE confirmed iter 12-17

**Pattern S consolidato 5× iter consecutive** (iter 5 P1+P2, iter 6 P1+P2, iter 8 r2, iter 11 P0, iter 12 r2):

- **Phase 1 PARALLEL** (4 agents):
  - planner-opus → 12 ATOM-S* atoms + sprint contract + 5 dispatch messages
  - architect-opus → 2-3 ADR (~600-800 LOC each) read-only codice
  - generator-app-opus → impl src/ + supabase/functions/ + scripts/ commit atomici
  - generator-test-opus → tests/ + fixtures/ + scripts/bench/ NO src code
- **Phase 2 SEQUENTIAL** (1 agent):
  - scribe-opus → audit + handoff + CLAUDE.md update + wiki delta DOPO 4/4 completion messages

**Race-cond fix VALIDATED**: filesystem barrier `automa/team-state/messages/{planner,architect,gen-app,gen-test}-opus-iter*-to-orchestrator-*.md` 4/4 confirmed PRE scribe Phase 2 spawn.

### 10.2 Per ogni iter Sprint T 18-25

**Cycle template ogni iter**:

1. **Pre-flight CoV** (~15 min):
   - vitest + build + R5 + R0 baseline GREEN
   - Verify HEAD clean OR branch ready
   - Andrea env provision check

2. **Phase 1 spawn parallel** (~3-4h):
   - planner-opus first (sequential gating before others)
   - architect + gen-app + gen-test PARALLEL post planner
   - Each emits completion msg to `messages/`

3. **Phase 2 sequential** (~30 min):
   - scribe-opus VERIFIES 4/4 completion msgs filesystem barrier
   - Generate audit + handoff + CLAUDE.md append
   - Emit own completion msg

4. **Phase 3 orchestrator** (~30 min):
   - Bench live run (R5/R6/B1-B10)
   - Vitest run baseline
   - Build run optional (heavy ~14 min)
   - Commit batch + push

5. **Post-iter** (~15 min):
   - quality-audit (every 4 iter)
   - systematic-debugging (every 8 iter)
   - Honest score recalibration cross-verify G45

**Total iter cycle**: ~4-6h con CoV ogni atom.

### 10.3 Cycle CoV per atom

CLAUDE.md regola anti-inflazione:

> «**CoV su ogni PR**: 3 volte `npx vitest run` prima di dichiarare "test passano" — se uno dei 3 fallisce → indaga flakiness, non nascondere»

**Apply ogni atom**:
- Atom shipped → vitest run #1
- Atom shipped → vitest run #2 (verify deterministico)
- Atom shipped → vitest run #3 (final)
- 3 PASS = ATOM_COMPLETE
- 1 FAIL → investigate flakiness, NEVER skip

### 10.4 Quality-audit ogni 4 iter

`/quality-audit` skill orchestrator full audit:

- 30 categories benchmark `node scripts/benchmark.cjs --write`
- Cross-verify score vs auto-claim
- Top 5 regressions identification
- Fix priority list

**Cron iter 22 (+4 da iter 18)**: full quality audit.

### 10.5 Systematic-debugging ogni 8 iter

`/systematic-debugging` skill superpowers full bug hunt:

- Reproduce issues
- Failed component isolation
- Root cause analysis
- Fix sistematico

**Cron iter 26 (+8 da iter 18)**: systematic debugging deep dive.

### 10.6 Ralph loop /caveman + Mac Mini autonomous parallel

**Pattern S parallel + Ralph loop /caveman background**:

- Andrea opens 2-3 sessions parallel:
  - Session A: Pattern S 5-agent OPUS active iter cycle
  - Session B: Ralph loop /caveman compress memoria + lavori incrementali small
  - Session C: Mac Mini autonomous H24 cron tasks (D1-D5)

**Output cross-verify**: scribe Phase 2 verifies all 3 sessions output before audit.

### 10.7 Honest scoring: cross-verify G45 deflate 1-2 punti

**G45 audit brutale 2026-03-31**: Score reale 5.8/10 vs self-score 8.6 = inflato 2.8 punti.

**Lesson learned mandatory**:
- Auto-score >7 senza cross-verify = REJECT
- Sempre 2-agent independent verify (es. agent-1 score 8.5 + agent-2 deflate 2 = REAL ~7)
- Post-Fiera onesto recalibration con visitatore feedback REAL

**Iter 18+**: ogni iter close, score onesto = max(self_score - 1.0, agent_independent_score).

---

## §11 — Sprint T iter 18-25 roadmap day-by-day

### 11.1 29/04 (oggi) — Master plan + TEA ingest planning

**Tasks**:
- Master plan write (questo doc) + TEA PDF analysis (cross doc)
- §4 systematic test plan finalize
- §5 design audit script preparation
- §7 RunPod resume schedule

**Effort**: ~6h iter 18 close.

**Deliverable**: 2 NEW docs (master plan + TEA analysis).

### 11.2 30/04 — Demo schema + presentation

**Tasks**:
- Demo script update post-test (rimuovi broken)
- 3 slides PowerPoint/Canva
- 1-pager brochure
- Voice Isabella amplification test
- RunPod resume + Task R3 systematic 92 test (4h GPU)

**Effort**: ~8h Andrea + 4h GPU.

**Deliverable**: demo materials ready 06/05.

### 11.3 01/05 — Mistral migration prep + procurement

**Tasks**:
- ADR-024 Mistral migration prep (Gemini retire 1/6 P0 risk)
- Hetzner/Scaleway procurement Andrea decision (VPS GPU per ADR-022)
- RunPod Task R4 Vision quality test (3h GPU)

**Effort**: 6h Andrea + 3h GPU.

**Deliverable**: ADR + procurement decision.

### 11.4 02/05 — Demo rehearsal Tea+Andrea

**Tasks**:
- Demo rehearsal 3 cycli con Tea
- Voice Isabella final test Fiera audio amplification
- RunPod Task R1 Voxtral voice clone (3h GPU)
- RunPod Task R2 R5/R6 stress (2h GPU)

**Effort**: 4h rehearsal + 2h fix list + 5h GPU.

**Deliverable**: rehearsal feedback + voice ready.

### 11.5 03/05 — Stress test prod 10 esperimenti

**Tasks**:
- Manual test 10 esperimenti diversi end-to-end (Andrea + Tea)
- Document results per esperimento
- Fix top-3 P0 broken se identified
- Setup laptop Fiera config (HDMI cable + power bank + speaker check)

**Effort**: 6h test + 2h fix.

**Deliverable**: 10 esperimenti VERIFIED working list.

### 11.6 04/05 — Brochure + setup Fiera

**Tasks**:
- Brochure 1-pager final print (10 copie)
- QR code https://elabtutor.school + Andrea contact
- Stand setup checklist final
- Internet contingency hotspot 4G/5G

**Effort**: 4h Andrea.

**Deliverable**: Fiera ready logistics.

### 11.7 05/05 — NO modifiche tecniche. Demo prove finali

**Tasks**:
- 3 final rehearsal cycli (Andrea solo)
- TTS Isabella final amplification
- Internet hotspot test
- ZERO commits tecnici (rule: prevent demo break last day)

**Effort**: 3h rehearsal.

**Deliverable**: pronto Fiera.

### 11.8 06/05 — Fiera Trieste

**Tasks**:
- Stand setup 7:00 AM
- Demo cycli continuous 8:30-18:00 (~30 cycli × 5 min ~150 min demo + breaks)
- Lead capture (email + scuola + visitatore role)
- Photo/video documentation
- End-of-day debrief Andrea + Tea + Omaric + Giovanni + Davide

**Effort**: 12h day completo.

**Deliverable**: leads list + photos.

### 11.9 07-13/05 — Post-Fiera follow-up + lead capture

**Tasks**:
- Email follow-up leads (template + custom)
- Demo video personalizzato per top-10 leads
- Davide MePA bandi PNRR aperti queue
- Iter 19 Sprint T entrance: TEA Glossario ingest + esperimenti broken fix systematic
- Score onesto recalibration post-Fiera real feedback

**Effort**: 30h Andrea (4h/giorno × 7 giorni) + iter 19 cycle ~6h.

**Deliverable**: leads → trial signups, iter 19 close.

### 11.10 14-20/05 — Mistral migrate + Davide MePA validate

**Tasks**:
- Mistral Large prod migrate (Gemini fallback)
- ADR-025 Mistral migration log
- Davide validate MePA listing (already complete iter 18, refresh metadata)
- Sprint T iter 20-21 cycle (Hybrid RAG verify + Vision E2E exec live)

**Effort**: 25h Andrea + iter 20+21 cycles ~12h.

**Deliverable**: Mistral live + Mepa refreshed + iter 21 close.

### 11.11 21-27/05 — PNRR voucher + 92 esperimenti fix

**Tasks**:
- PNRR voucher applications scuole leads
- 92 esperimenti fix systematic P0 priority list (post-§4 systematic test)
- Sprint T iter 22+23 cycle (Vol narrative refactor MVP)
- Quality audit iter 22 (~4 iter dopo 18)

**Effort**: 30h Andrea + 25h dev refactor + iter 22+23 cycles ~12h.

**Deliverable**: 30+ esperimenti P0 fix + narrative MVP + iter 23 close.

### 11.12 28/05-03/06 — Mistral live + Gemini retire 1/6

**Tasks**:
- Mistral live verify ≥7 giorni production stability
- Gemini retire 1/6 fallback verify
- ADR-026 Gemini decommission
- Sprint T iter 24+25 cycle (skill ad-hoc shipping + 38 capitoli narrative full)

**Effort**: 20h Andrea + iter 24+25 cycles ~12h.

**Deliverable**: Mistral primary + iter 25 close.

### 11.13 Post 06/06 — VPS GPU Scaleway H100 procurement

**Tasks**:
- VPS GPU Scaleway H100 setup ADR-022 implementation
- Migrate workloads RunPod → Scaleway (cost discipline)
- Sprint U entrance (post-Sprint T)
- Systematic debugging iter 26 (8 iter dopo 18)

**Effort**: 40h Andrea + Sprint U cycle.

**Deliverable**: VPS GPU live + Sprint U entrance.

### 11.14 Timeline visualization

```
29/04 ┃ master plan + TEA ingest plan
30/04 ┃ demo schema + RunPod R3 test
01/05 ┃ Mistral prep + RunPod R4 vision
02/05 ┃ demo rehearsal Tea + RunPod R1 R2
03/05 ┃ stress test 10 esperimenti
04/05 ┃ brochure + Fiera setup
05/05 ┃ rehearsal final NO mods
06/05 ┃ ━━━━━━━━━━━━━━━━━━━━ FIERA TRIESTE ━━━━━━━━━━━━━━━━━━━━
07-13/05 ┃ Post-Fiera follow-up + iter 19 (TEA ingest)
14-20/05 ┃ Mistral migrate + iter 20-21
21-27/05 ┃ PNRR voucher + iter 22-23 (narrative MVP)
28/05-03/06 ┃ Mistral live + Gemini retire + iter 24-25
04-10/06 ┃ Scaleway H100 procurement + Sprint U entrance
```

---

## §12 — Pricing finale pure-market shipped + Andrea ratify queue

### 12.1 Pricing 4 tier finale (NO PNRR cushion)

**Decisione**: pricing pure-market = sostenibile senza dipendenza voucher PNRR. Costs €19-25/scuola/anno + €15 OpEx = €34-40 totale steady-state. Margine 88% Standard, sostenibile crescita organica.

| Tier | Y1 | Y2+ | Cost €34-40 | Margine % | Caratteristiche |
|---|---|---|---|---|---|
| Light | €190 | €120 | €37 | 80.5% | 1 docente, 1 classe, 30 esperimenti base |
| **Standard ⭐** | **€290** | **€190** | €37 | **87.2%** | 2 docenti, 5 classi, 92 esperimenti, voice, vision |
| Pro | €490 | €290 | €37 | 92.5% | 5 docenti, illimitate classi, dashboard avanzata, priority support |
| Premium Lifetime | €890 | — | €37 (ammortizzato Y3) | 95.8% (3-year amortization) | One-time, lock-in tutto + future features |

### 12.2 Add-ons modulari €49-69

Add-on opt-in per scuola:
- Compile Arduino unlimited (€49/anno)
- Multi-class license extra 5 classi (€69/anno)
- Backup Cloud 30gg (€49/anno)
- Voice premium ElevenLabs italiano (€69/anno)
- Custom domain branded (€69/anno)
- Priority support email + chat (€49/anno)

**Math 100 scuole Y1 con 30% attach rate**:
- 100 × €290 (Standard default 70% mix) + 100 × 0.3 × €60 avg add-ons = €29,000 + €1,800 = **€30,800/anno revenue**
- Mix realistic: 20% Light + 60% Standard + 15% Pro + 5% Premium → revenue €34,300/anno
- Cost: 100 × €37 = €3,700/anno
- Profit gross: €30,600/anno = 89%
- Profit net post tax IT 24% IRES: €23,256/anno = 67.7% margin netto

### 12.3 Revenue projection 100 scuole Y1

Mix realistic schools breakdown:

| Tier | % mix | N scuole | Pricing Y1 | Revenue tier | Revenue cumulativo |
|---|---|---|---|---|---|
| Light | 20% | 20 | €190 | €3,800 | €3,800 |
| Standard | 60% | 60 | €290 | €17,400 | €21,200 |
| Pro | 15% | 15 | €490 | €7,350 | €28,550 |
| Premium Lifetime | 5% | 5 | €890 | €4,450 | €33,000 |
| Add-ons (30% attach) | -- | 30 | €60 avg | €1,800 | €34,800 |

**TOTALE revenue Y1**: **~€34,800** (range €30K-€44K depending mix)

**Cost Y1**: 100 × €37/anno = €3,700.

**Profit gross Y1**: €31,100 = 89.4%.

**Profit net post tax**: €23,640 = 67.9%.

### 12.4 Break-even

**Break-even calculation**:

- Cost fixed Y1: €3,000-€8,000 (Mac Mini + Vercel + Supabase + n8n + Render + RunPod GPU intermittent + storage)
- Cost variable per scuola: €19-25 (variable ottimizzato) + €15 OpEx Andrea allocation = €34-40

**Break-even soglia**: 
- Pure software cost (€8K fixed + €37/scuola variable) vs Standard €290:
- (€8000 + €37N) ≤ €290N → €8000 ≤ €253N → **N ≥ 32 scuole**

**Break-even Standard tier**: **32 scuole** (soglia conservativa).

**Break-even mix realistic** (€34,800 revenue / 100 scuole = €348 avg):
- (€8000 + €37N) ≤ €348N → €8000 ≤ €311N → **N ≥ 26 scuole**

**Conservative break-even**: **30-35 scuole Y1**.

**Cumulative target Y2+**: 200-300 scuole steady-state → revenue €65K-€100K/anno.

### 12.5 Andrea ratify queue iter 18-19

**Decisioni pricing pendenti Andrea ratify**:

1. **Default tier presented Fiera**: Standard €290 ⭐ con CTA push (CONFIRMED)
2. **Light Y2+ €120**: lock-in pricing post Y1 onboarding (CONFIRMED)
3. **Premium Lifetime €890**: PNRR-friendly (3-year amortization) ratify
4. **Add-ons attach rate target**: 30% Y1, 40% Y2+ (target ratify)
5. **Discount PNRR optional**: -10% volume ≥10 scuole same comune (TBD)
6. **Mepa pricing alignment**: Davide review listing match pure-market (TBD)
7. **Trial 30gg gratis**: ratify si/no (Andrea decision iter 18-19)

**Effort Andrea ratify**: ~2h decision review pricing finale.

---

## §13 — Risks + open questions Andrea ratify

### 13.1 Risks P0

#### R1 — Gemini retire 1/6 (5 settimane)

**Risk**: Google Gemini Flash deprecato 1/6/2026. ELAB current LLM provider → fallback Together AI gated già wired iter 3, but voce primary needs migration.

**Mitigation**:
- Mistral Large EU primary migration iter 19-20 (1-7/05)
- Test Mistral parity vs Gemini quality (R5 stress fixture)
- Together AI fallback gated student runtime SEMPRE blocked (CLAUDE.md regola)

**Status**: P0 critical. Migration prep iter 19. Live iter 20-21.

#### R2 — EU AI Act 2/8 (15 settimane)

**Risk**: EU AI Act Article 5 enters force 2/8/2026. ELAB Tutor LLM-mediated dati minori = high-risk classification implications.

**Mitigation**:
- ADR-022 GDPR-compliant production stack (already accepted)
- Audit conformity Article 5 prep: data minimization, consent dati minori, transparency obligations
- Engagement legal counsel italiano scuola pubblica (post-Fiera lead capture potential)

**Status**: P1 medium-term. Audit iter 22-25.

### 13.2 Risks P1

#### R3 — Esperimenti broken count + fix priority TBD

**Risk**: §4 systematic test mai eseguito. Andrea sospetto MOLTISSIMI broken. Score onesto inflato.

**Mitigation**: §4 Playwright systematic 92 spec iter 18-19 (RunPod Task R3 GPU 4h).

**Status**: P0 pre-Fiera. Output guida demo Fiera.

#### R4 — Volumi narrative refactor effort 30-50h post-Fiera

**Risk**: §3 refactor lesson-paths flat → CAPITOLI_NARRATIVE schema = effort 56h. Time investment significativo.

**Mitigation**:
- Spalmato Sprint T iter 22-25 (~3 settimane)
- MVP: Vol1 cap6 LED narrative continuum proof-of-concept iter 22 → if positive feedback, full 38 capitoli iter 23-25
- Andrea decision iter 22 entrance: full vs MVP

**Status**: P1 post-Fiera priority.

#### R5 — 92 video lezioni timeline TBD

**Risk**: differenziatore "videolezioni libreria completa" promesso Fiera. 1 video/settimana × 92 esperimenti = 22 mesi. Troppo lungo.

**Mitigation**:
- Andrea sample 1 video questa settimana (06/05 launch)
- Subsequent: 5 video/settimana via OBS + Andrea voice over (effort ~8h/sett)
- 92 video × 8h / 5 = 18 settimane = ~4.5 mesi
- Tea collaborazione potenziale (effort split)

**Status**: P1 post-Fiera commitment Andrea.

#### R6 — Tea formalize co-dev agreement equity

**Risk**: Tea contributi crescenti (180 termini Glossario + 9000 parole + co-dev + tester + creativa). NO formal agreement. Rischio future dispute.

**Mitigation**: Andrea + Tea formal meeting post-Fiera 13/05. Documento `docs/team/tea-de-venere-co-founder-agreement.md` (TBD content: equity stake? employment? consultant?).

**Status**: P0 post-Fiera trust commitment.

#### R7 — VPS GPU procurement Scaleway H100 vs OVH/IONOS

**Risk**: ADR-022 accepted VPS GPU GDPR-compliant. Scaleway H100 ~€2.5/h vs RunPod $0.74/h ~3.4× più caro.

**Mitigation**:
- Scaleway H100 only when needed (intermittent dev + bench)
- RunPod GPU intermittent fallback per workloads non-GDPR-sensitive (development bench, NO production student data)
- ADR-022 §4 procurement decision Andrea iter 19-20

**Status**: P1 medium-term. Decision iter 19.

### 13.3 Open questions Andrea ratify

1. **Pricing trial 30gg gratis**: yes/no? (impact CAC Fiera)
2. **Premium Lifetime €890 ratify**: yes/no? (PNRR cushion strategy)
3. **Mepa pricing alignment Davide**: pure-market vs PNRR-cushion mix?
4. **Tea formal credit**: equity? consultant? employment?
5. **Mac Mini autonomous loop restart**: SSH issue iter 12 fixed?
6. **VPS GPU Scaleway H100 procurement**: budget €60-80/mese ratify?
7. **Discount volume ≥10 scuole**: -10% si/no?
8. **Custom domain branded add-on**: pricing €69 vs €99?
9. **Voice premium ElevenLabs vs Isabella default**: 2-tier voice strategy?
10. **Effort 92 video lezioni**: Andrea solo vs Tea split?

**Effort Andrea ratify queue**: ~3h decision review post-Fiera 13/05.

### 13.4 Risk + question priority matrix

| Item | Type | Severity | Effort fix | Timeline |
|---|---|---|---|---|
| R1 Gemini retire | Risk | P0 | 25h | 1/5 → 20/5 |
| R2 EU AI Act | Risk | P1 | 30h | 2/5 → 25/5 |
| R3 Esperimenti broken | Risk | P0 | 26h test + variable fix | iter 18-19 |
| R4 Volumi narrative refactor | Risk | P1 | 56h | iter 22-25 |
| R5 92 video lezioni | Risk | P1 | 184h Andrea | 06/05 → fine 2026 |
| R6 Tea formal co-dev | Risk | P0 | 2h meeting | 13/05 |
| R7 VPS GPU procurement | Risk | P1 | 4h | iter 19-20 |
| Q1-Q10 Andrea ratify | Question | P0/P1 | 3h decision | post-Fiera 13/05 |

---

## §14 — Cross-references

- **TEA PDF analysis**: `docs/strategy/2026-04-28-tea-pdf-analysis.md` — 600 LOC dettagliato 180 termini + 58 analogie + ingest pipeline
- **Pricing master**: `docs/strategy/2026-04-28-cost-stack/03-PRICING-MASTER-UPDATE.md` — pricing 4 tier dettaglio
- **Cost stack**: `docs/strategy/2026-04-28-cost-stack/01-comprehensive-cost-stack-2026.md`
- **Brand voice**: `docs/strategy/2026-04-28-brand-voice/`
- **Software pricing**: `docs/strategy/2026-04-28-software-pricing/03-RECOMMENDATION-MASTER.md`
- **Master synthesis**: `docs/strategy/2026-04-28-MASTER-SYNTHESIS.md`
- **ADR-022 VPS GPU**: `docs/adrs/ADR-022-vps-gpu-gdpr-compliant-production-stack-sprint-t.md` (ACCEPTED)
- **ADR-020 REJECTED**: `docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md`
- **ADR-021 REJECTED**: `docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md`
- **Demo script**: `docs/demo/2026-05-06-fiera-trieste-demo-script.md`
- **CLAUDE.md**: Sprint S iter 12 PHASE 1 close + Pattern S 5-agent OPUS history

---

## §15 — Onestà finale (resume)

1. **Score session iter 12-17 ONESTO**: ~7.5-8.0/10 (NOT 9.55 inflato auto-claim).

2. **Esperimenti broken count UNKNOWN**: §4 systematic test ESSENTIAL pre-Fiera. RunPod Task R3 GPU 4h prioritario.

3. **Demo Fiera limited 7 esperimenti VERIFIED**: NON mostrare broken esperimenti. Quality > Quantity.

4. **Volumi narrative refactor 56h post-Fiera**: Morfismo Sense 2 dipende da questo. Sprint T iter 22-25.

5. **Tea contribution 9000+ parole formal credit**: Andrea decisione iter 19-20.

6. **Mac Mini cron alive verify**: Tailscale issue iter 12 → Andrea verify alive 30 min.

7. **Pricing pure-market 88% margine Standard €290**: sostenibile NO PNRR cushion. Break-even 30-35 scuole Y1.

8. **Risks P0**: Gemini retire 1/6 (R1) + EU AI Act 2/8 (R2) + esperimenti broken (R3) + Tea formal (R6).

9. **6 ad-hoc skills da creare**: cost-analysis-competitor + experiment-testing-orchestrator + volumi-alignment-checker + demo-rehearsal-runner + market-trends-researcher + principio-zero-validator-runtime.

10. **Demo Fiera 06/05 success criteria**: 30+ leads + 10+ trial signups + 0 demo break + Tea + Andrea + Omaric + Giovanni + Davide team aligned messaging.

---

## §16 — Appendix — Detailed reference materials

### 16.1 Test catalog template (use case for §4 systematic-92.spec.js)

```javascript
// tests/e2e/systematic-92.spec.js (template)
import { test, expect } from '@playwright/test';
import experiments from '../../src/data/lesson-paths-catalog.json';

const BASE_URL = process.env.BASE_URL || 'https://www.elabtutor.school';
const TEST_RESULTS = [];

for (const exp of experiments) {
  test(`systematic ${exp.id}`, async ({ page }) => {
    const result = {
      experiment_id: exp.id,
      volume: exp.volume,
      chapter: exp.chapter,
      variation: exp.variation,
      title: exp.title,
      step1_mount: 'PENDING',
      step2_placement: 'PENDING',
      step3_simulator: 'PENDING',
      step4_compile: 'N/A',
      step5_vision: 'PENDING',
      step6_unlim: 'PENDING',
      details: {},
    };

    try {
      // Step 1 mount
      await page.goto(`${BASE_URL}/lavagna`);
      await page.waitForLoadState('networkidle');
      const mountResult = await page.evaluate((id) => {
        return window.__ELAB_API.mountExperiment(id);
      }, exp.id);
      result.step1_mount = mountResult ? 'PASS' : 'FAIL_NO_RESPONSE';
      await page.waitForTimeout(2000);

      // Step 2 placement
      const circuitState = await page.evaluate(() => 
        window.__ELAB_API.unlim.getCircuitState()
      );
      const expectedComponents = exp.expected_components || [];
      const actualComponents = circuitState.components || [];
      const missingComponents = expectedComponents.filter(
        (c) => !actualComponents.find((ac) => ac.type === c)
      );
      if (missingComponents.length === 0) {
        result.step2_placement = 'PASS';
      } else {
        result.step2_placement = 'FAIL_MISSING_COMPONENTS';
        result.details.missing = missingComponents;
      }

      // Step 3 simulator
      try {
        await page.evaluate(() => window.__ELAB_API.simulator?.solve?.());
        const postSolveState = await page.evaluate(() =>
          window.__ELAB_API.unlim.getCircuitState()
        );
        if (postSolveState.solverConverged !== false) {
          result.step3_simulator = 'PASS';
        } else {
          result.step3_simulator = 'FAIL_SOLVER_DIVERGE';
        }
      } catch (e) {
        result.step3_simulator = 'FAIL_EXCEPTION';
        result.details.simulator_error = e.message;
      }

      // Step 4 compile (only Vol3 Arduino)
      if (exp.volume === 3 && exp.requires_compile) {
        const code = await page.evaluate(() => window.__ELAB_API.getCode?.());
        if (code) {
          const compileResp = await fetch(
            'https://n8n.srv1022317.hstgr.cloud/compile',
            {
              method: 'POST',
              body: JSON.stringify({ code }),
              headers: { 'Content-Type': 'application/json' },
            }
          );
          if (compileResp.ok) {
            const hex = await compileResp.text();
            if (hex.startsWith(':')) {
              result.step4_compile = 'PASS';
            } else {
              result.step4_compile = 'FAIL_INVALID_HEX';
            }
          } else {
            result.step4_compile = `FAIL_HTTP_${compileResp.status}`;
          }
        } else {
          result.step4_compile = 'FAIL_NO_CODE';
        }
      }

      // Step 5 vision
      const screenshot = await page.evaluate(() =>
        window.__ELAB_API.captureScreenshot()
      );
      if (screenshot) {
        // call vision endpoint
        // ...
        result.step5_vision = 'PASS';
      } else {
        result.step5_vision = 'FAIL_NO_SCREENSHOT';
      }

      // Step 6 UNLIM ask
      // ... call unlim-chat with experimentId
      result.step6_unlim = 'PASS';

      result.overall = Object.values(result)
        .filter((v) => typeof v === 'string')
        .every((v) => v === 'PASS' || v === 'N/A')
        ? 'PASS'
        : 'FAIL';
    } catch (e) {
      result.overall = 'FAIL';
      result.details.exception = e.message;
    }

    TEST_RESULTS.push(result);
    expect(result.overall).toBe('PASS');
  });
}

test.afterAll(async () => {
  const fs = require('fs');
  fs.writeFileSync(
    `/tmp/systematic-92-results-${Date.now()}.json`,
    JSON.stringify({ results: TEST_RESULTS, summary: summarize(TEST_RESULTS) }, null, 2)
  );
});

function summarize(results) {
  return {
    total: results.length,
    pass: results.filter((r) => r.overall === 'PASS').length,
    fail: results.filter((r) => r.overall === 'FAIL').length,
    fail_breakdown: results.reduce((acc, r) => {
      ['step1_mount', 'step2_placement', 'step3_simulator', 'step4_compile', 'step5_vision', 'step6_unlim'].forEach((step) => {
        if (r[step] && r[step].startsWith('FAIL_')) {
          acc[r[step]] = (acc[r[step]] || 0) + 1;
        }
      });
      return acc;
    }, {}),
  };
}
```

### 16.2 Pricing math detail 200/500 scuole projection

**Y2+ steady-state mix realistic** (post Y1 onboarding 100 scuole):
- Light retention 75% (15/20) + new 5 = 20 Light Y2
- Standard retention 80% (48/60) + new 32 = 80 Standard Y2
- Pro retention 90% (13.5/15) + new 11.5 = 25 Pro Y2
- Premium Lifetime cumulative 5 → 15 Y2 (no recurring revenue)
- Add-ons attach 40%

**Y2 200 scuole revenue** (mix realistic):
- Light Y2+: 20 × €120 = €2,400
- Standard Y2+: 80 × €190 = €15,200
- Pro Y2+: 25 × €290 = €7,250
- Premium Lifetime new 10 (Y2 launch): 10 × €890 = €8,900
- Add-ons 40% × 200 × €60 avg = €4,800
- **Y2 revenue: €38,550**
- Y2 cost: 200 × €37 = €7,400
- Y2 profit gross: €31,150 = 80.8%
- Y2 profit net post tax: €23,674 = 61.4%

**Y3 500 scuole projection** (aggressive growth target):
- Light Y3+: 50 × €120 = €6,000
- Standard Y3+: 250 × €190 = €47,500
- Pro Y3+: 100 × €290 = €29,000
- Premium Lifetime cumulative 100: revenue prior years ammortization
- Add-ons 50% attach: 250 × €60 = €15,000
- **Y3 revenue: €97,500**
- Y3 cost: 500 × €37 = €18,500
- Y3 profit gross: €79,000 = 81%
- Y3 profit net post tax: €60,040 = 61.6%

### 16.3 Demo script 7 esperimenti VERIFIED template

Per ogni esperimento VERIFIED working post-§4 systematic test:

#### Esperimento 1 — Vol1 cap6 esp1 LED basic

**Setup**: Lavagna empty. Mount esperimento.

**Atteso visivo**:
- Breadboard + LED rosso anodo D13 + R 220Ω + Arduino Nano + battery 9V
- Componenti pre-piazzati ordine canonico (anodo upper, catodo lower)

**UNLIM voice ask "Spiegami il LED"**:
- Atteso: "Ragazzi, il LED è come una piccola lampadina elettronica. Si accende solo se la corrente entra dal lato corretto, come un rubinetto che fa passare l'acqua in una sola direzione. Vedete a pagina 29 del Volume 1: questo è l'esperimento di base."
- Citazione: "Vol.1 pag.29" VERBATIM
- Plurale "Ragazzi" verified
- Length ≤60 parole

**Compila + carica**:
- C++ skip (esperimento pre-Arduino Vol1)
- Solver MNA: V_LED ~2V + V_R 7V + I 31mA (warning >20mA → docente nota)

**Vision screenshot**:
- "Ragazzi, vedo il vostro LED collegato al pin 13. La resistenza è da 220 ohm — perfetta. Il catodo è correttamente sul negativo. Volume 1 pagina 29."

**Cycle 5 min total**.

#### Esperimento 2 — Vol1 cap6 esp2 LED + R calcolo

**Setup**: stesso esp1 ma con calcolo R esplicito.

**UNLIM ask "Perché 220 ohm?"**:
- "Ragazzi, calcoliamo: la batteria spinge 9V, il LED ne prende 2V, restano 7V per il resistore. Vogliamo 30mA quindi R = 7V / 0.030A = 233Ω, arrotondiamo a 220Ω commercial. Vol.1 pag.30."

#### Esperimento 3 — Vol1 cap2 Legge Ohm

**Setup**: 1 batteria + 1 resistore + 1 multimetro inline (amperometro mode).

**UNLIM ask "Cosa misuriamo?"**:
- "Ragazzi, misuriamo la corrente. Sappiamo V=9V e R=1000Ω. Allora I=V/R=9/1000=0.009A=9mA. Verifichiamo col multimetro. Vol.1 pag.18."

#### Esperimento 4 — Vol2 cap3 Multimetro misura batteria

**Setup**: solo batteria 9V + multimetro voltmeter mode.

**UNLIM ask "Come si usa?"**:
- "Ragazzi, il multimetro è il nostro coltellino svizzero. Selettore su V, puntale rosso al + della batteria, nero al −. Leggiamo 9V circa. Vol.2 pag.42."

#### Esperimento 5 — Vol3 cap5 Blink LED_BUILTIN

**Setup**: Arduino Nano UNO solo (LED_BUILTIN pin 13 integrato).

**Code C++ atteso**:
```cpp
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
```

**UNLIM ask "Cosa fa questo programma?"**:
- "Ragazzi, accendiamo il LED del pin 13 per mezzo secondo, poi lo spegniamo per mezzo secondo. È il nostro primo lampeggio Arduino. Vol.3 pag.78."

**Compile + carica**: HEX upload via avr8js bridge → LED_BUILTIN simulator lampeggia.

#### Esperimento 6 — Vol3 cap6 digitalWrite() pin output

**Setup**: Arduino Nano + LED esterno pin D7 + R 220Ω.

**Code**:
```cpp
void setup() {
  pinMode(7, OUTPUT);
}

void loop() {
  digitalWrite(7, HIGH);
  delay(1000);
  digitalWrite(7, LOW);
  delay(1000);
}
```

**UNLIM ask "Differenza con built-in?"**:
- "Ragazzi, prima usavamo il LED già nella scheda. Ora colleghiamo un LED esterno al pin 7. Stesso codice, ma dovete montare LED + resistore sulla breadboard. Vol.3 pag.85."

#### Esperimento 7 — Vol3 cap10 Pulsante INPUT_PULLUP

**Setup**: Arduino + Pulsante D2 + LED D7.

**Code**:
```cpp
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(7, OUTPUT);
}

void loop() {
  bool premuto = (digitalRead(2) == LOW); // logica invertita PULLUP
  digitalWrite(7, premuto ? HIGH : LOW);
}
```

**UNLIM ask "Perché LOW=premuto?"**:
- "Ragazzi, INPUT_PULLUP è un trucco: tiene il pin alto a 5V di default. Quando premete il pulsante, scende a 0V. Quindi LOW=premuto, logica invertita. Vol.3 pag.102."

### 16.4 Mac Mini cron schedule consolidated

```bash
# /home/progettibelli/crontab.elab
# 4 cron alive verified iter 13+ + 5 NEW iter 18+
*/5  * * * *   /home/progettibelli/heartbeat.sh                                           # heartbeat 5 min
30 22 * * *   /home/progettibelli/scripts/wiki-analogia-batch.sh                          # 22:30 nightly wiki + Tea ingest
0 02 * * *   /home/progettibelli/scripts/toolspec-l2-batch.sh                             # 02:00 nightly D1 ToolSpec L2 expand
0  */4 * * *  /home/progettibelli/scripts/systematic-92-test.sh                           # every 4h D3 esperimenti test
0 04 1 * *   /home/progettibelli/scripts/volumi-narrative-audit.sh                        # 04:00 first day month D4
0 03 1 * *   /home/progettibelli/scripts/cost-competitor-monitor.sh                       # 03:00 first day month D5
0 09 * * 0   /home/progettibelli/scripts/volumi-pdf-parse-weekly.sh                       # Sunday 09:00 volumi PDF parse weekly
0 06 * * *   /home/progettibelli/scripts/r5-stress-daily.sh                               # 06:00 daily R5 stress
0 06 * * 1   /home/progettibelli/scripts/r6-stress-weekly.sh                              # Monday 06:00 R6 stress
```

### 16.5 Pattern S 5-agent OPUS PHASE-PHASE iter cycle template

```yaml
iter_T_X_template:
  pre_flight:
    - vitest_baseline_green: required
    - build_pass: optional (heavy)
    - r5_baseline_green: required
    - andrea_env_provision: required
    duration: 15 min
  
  phase_1_parallel:
    duration: 3-4h
    sequence:
      planner_first:
        - 12 ATOM-S* atoms
        - sprint contract md
        - 5 dispatch messages
        emits: messages/planner-opus-iter-X-to-orchestrator.md
      
      then_parallel:
        - architect_opus:
            - 2-3 ADR (~600-800 LOC each)
            - read-only codice
            emits: messages/architect-opus-iter-X-to-orchestrator.md
        - generator_app_opus:
            - impl src/ supabase/ scripts/
            - commit atomici
            emits: messages/gen-app-opus-iter-X-to-orchestrator.md
        - generator_test_opus:
            - tests/ fixtures/ scripts/bench/
            - NO src code
            emits: messages/gen-test-opus-iter-X-to-orchestrator.md
  
  phase_2_sequential:
    duration: 30 min
    agent: scribe_opus
    pre_check:
      - 4_completion_msgs_present_filesystem_barrier: required
    deliverables:
      - audit md
      - handoff md
      - CLAUDE.md append
      - wiki delta if any
    emits: messages/scribe-opus-iter-X-to-orchestrator.md
  
  phase_3_orchestrator:
    duration: 30 min
    bench_live_run:
      - r5_or_r6 fixture
      - b1_b10 if applicable
    vitest_baseline:
      - run 3x verify deterministic
    build_optional:
      - run if available time
    commit_batch:
      - all uncommitted iter X
      - push branch
  
  post_iter:
    duration: 15 min
    - quality_audit_if_iter_mod_4_eq_0
    - systematic_debugging_if_iter_mod_8_eq_0
    - honest_score_recalibration: max(self_score - 1.0, agent_independent_score)
```

### 16.6 Anti-pattern checklist iter 18+ (NEVER DO)

1. **Auto-score >7 senza cross-verify**: REJECT. Always 2-agent independent.
2. **Demo Fiera mostrare esperimenti broken**: REJECT. Show only verified.
3. **Skip vitest run pre-commit**: REJECT. CLAUDE.md regola anti-regressione.
4. **Pricing PNRR cushion senza pure-market**: REJECT iter 18 decision.
5. **UNLIM response NO plurale "Ragazzi"**: REJECT. Principio Zero violation.
6. **UNLIM response NO citation Vol/pag**: REJECT. Principio Zero violation.
7. **UNLIM response >60 parole**: REJECT. Brevita rule.
8. **Esperimento NO citation libro**: REJECT. Morfismo Sense 2 violation.
9. **Component palette generic NO ELAB**: REJECT. Morfismo Sense 2 violation.
10. **Mac Mini cron output narrative claim NO filesystem verify**: REJECT. Iter 7+ inflato lesson.
11. **Auto-deploy Edge Function NO Andrea OK**: REJECT. RULES MANDATORY.
12. **Auto-apply migration SQL NO Andrea OK**: REJECT. RULES MANDATORY.
13. **`git add -A` NO controllo `git diff`**: REJECT. CLAUDE.md regola.
14. **`--no-verify` su commit**: REJECT. Pre-commit hook rispetto.
15. **Push diretto su `main`**: REJECT. Branch + PR only.

### 16.7 Glossario operativo iter 18+

- **CoV** = Chain of Verification (3× vitest run pre-claim)
- **Pattern S** = 5-agent OPUS PHASE-PHASE (planner → architect+gen-app+gen-test parallel → scribe sequential)
- **Principio Zero** = pedagogical rule docente tramite, UNLIM strumento, ragazzi su kit fisici
- **Morfismo Sense 1** = software MORFICO runtime adatta classe/docente/contesto
- **Morfismo Sense 1.5** = adattabilità docente + classe + UI/funzioni/finestre (ADR-019)
- **Morfismo Sense 2** = triplet coerenza software ↔ kit ↔ volumi
- **R0** = baseline benchmark Edge Function ufficiale 12-rule scorer
- **R5** = stress fixture 50 prompts ufficiale
- **R6** = stress fixture 100 prompts RAG-aware
- **B1-B10** = bench suite iter-12 (10 categorie)
- **Box 1-10** = SPRINT_S_COMPLETE 10 deliverables tracker
- **ADR** = Architecture Decision Record
- **ATOM** = atomic task ATOM-S{N}-{LETTER}{NUM}
- **__ELAB_API** = global window simulator API
- **PZ rules** = Principio Zero 6 rules ADR-009

---

**End master plan iter 18 comprehensive** — 16 sezioni + appendix detailed reference + cross-references + onestà finale + Andrea ratify queue + Sprint T iter 18-25 day-by-day timeline + 7 esperimenti demo template + Mac Mini cron schedule + Pattern S iter cycle template + anti-pattern checklist + glossario operativo.

NO inflation. Verifiable everything. Andrea reputation depends on honest execution.

GO Sprint T iter 18 start.
