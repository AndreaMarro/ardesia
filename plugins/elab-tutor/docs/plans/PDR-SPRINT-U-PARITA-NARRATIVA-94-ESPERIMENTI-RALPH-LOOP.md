# PDR Sprint U — Parità Narrativa Volumi + 94 Esperimenti UNO PER UNO + Ralph Loop 8→1 Agent

**Date**: 2026-05-01
**Sprint**: U (post Sprint T close iter 38 = 8.0/10 ONESTO, A10 Onnipotenza Deno port pending iter 40+)
**Pattern**: Ralph Loop multi-cycle 8 agents → 4 → 2 → 1 (consolidation funnel) — repeating sweep di tutti 94 esperimenti UNO PER UNO ad ogni cycle
**Target**: Sprint U close 9.5/10 ONESTO conditional (1) ZERO esperimenti broken + (2) parità narrativa volumi-software 100% verificata + (3) Lighthouse perf ≥90 + (4) UNLIM Onnipotenza+Onniscenza VERIFIED live ogni esperimento + (5) Modalità 4 (Percorso + Passo Passo + Libero + Già Montato) tutte funzionanti

> **For agentic workers**: This plan is executed by the **Mac Mini autonomous agent** via SSH session orchestration. Activation prompt in §15 paste-ready. Each cycle re-sweeps 94 experiments — pattern Ralph Loop. Use `superpowers:executing-plans` + `superpowers:systematic-debugging` + `claude-code-design:design-critique` + `playwright-mcp` + `Control_Chrome` MCP to verify EVERYTHING. ZERO tolerance per cose non funzionanti, divergenze, incomprensibilità.

---

## §1 GOAL CRITICO PILASTRO CENTRALE

**Parità totale esperimenti virtuali ↔ narrativa libri di testo Davide Fagherazzi**.

### Pilastro 1.1 — Discrepanza VARIAZIONI vs PEZZI STACCATI

**Scoperta Andrea iter 38 PM (CRITICA)**: I libri di testo presentano gli esperimenti come **VARIAZIONI DI UN TEMA** all'interno di un capitolo (continuo narrativo). ELAB Tutor li propone come **PEZZI STACCATI** (card flat indipendenti).

**Esempio Volume 1 Cap 6 "I LED"**:
- **Libro**: 1 narrativa continua "Accendere il primo LED" → poi variazione "ora con 2 LED" → poi "LED che lampeggia" → poi "LED RGB" — UNICO TEMA che evolve
- **ELAB Tutor**: card v1-cap6-esp1 + v1-cap6-esp2 + v1-cap6-esp3 + v1-cap6-esp4 — separate, no evolution narrative

**Impatto sulle 4 modalità**:
| Modalità | Comportamento ATTESO (parity) | Comportamento ATTUALE |
|----------|-------------------------------|----------------------|
| **Percorso** | Sequenza guidata cap-by-cap = stesso flusso libro, variazioni in cascata, docente legge a voce alta verbatim libro | Card flat, salti random, docente perde parità |
| **Passo Passo** | Micro-step intra-esperimento (es: "Ragazzi, prendete il LED rosso. Inseritelo in fila E2." → "Ora prendete la resistenza 220Ω..." → ...) | Spesso assenti o non numerati |
| **Libero** | Lavagna pulita PERSISTENTE — docente costruisce da zero quello che vuole | "Pulita" che spesso NON è pulita — drawings residui, componenti pre-mounted |
| **Già Montato** | Pre-built circuit visualizzato per spiegazione frontale + UNLIM evidenzia componenti + spiega Vol/pag verbatim | Visualizzato ma componenti spesso brutti/disposti male/non funzionanti |

### Pilastro 1.2 — Linguaggio plurale "Ragazzi," + docente-first

**Mandatory PRINCIPIO ZERO**:
- UNLIM si rivolge al **docente** che proietta su LIM, NON allo studente
- Stile: "Ragazzi, ora osservate come..." (docente legge a voce alta) + "Mostriamo ai ragazzi che..." (UNLIM al docente)
- **Percorso** specialmente: docente DEVE capire con UN OCCHIO cosa fare next, classe DEVE leggere e capire
- **Passo Passo**: micro-step letti dal docente con classe — sequenza chiara

### Pilastro 1.3 — "Lavagna pulita" che NON è pulita

**Bug critico**: Modalità Libero / clearCircuit / nuova sessione → spesso lavagna mostra componenti residui, drawings stale, stato precedente non resettato. Test rigoroso UNO PER UNO obbligatorio.

---

## §2 TEAM RALPH LOOP — 8 agenti orchestrati → funnel 1 agente

### Cycle Pattern (ripetuto N volte, ogni cycle re-sweeps 94 esperimenti)

```
Cycle 1 (8 agents parallel):
  Audit-1  Audit-2  LiveTest-1  LiveTest-2
  UNLIMVerify  Persona  DesignCritique  Scribe

Cycle 2 (4 agents consolidation):
  Audit-merge  LiveTest-merge  UNLIMVerify-merge  Scribe-merge

Cycle 3 (2 agents):
  Fix-orchestrator  Verifier

Cycle 4 (1 agent):
  Close-orchestrator (handoff iter +1)
```

### Agent roles 8-agent cycle

| Agent | Skill | File ownership | Per-cycle deliverable |
|-------|-------|----------------|----------------------|
| **Audit-1** (vol1+vol2) | `superpowers:systematic-debugging` + `feature-dev:code-architect` | READ `src/data/lesson-paths/v1-*.json` + `v2-*.json` + `volume-references.js` | Audit matrix vol1+vol2 esperimenti — file-system verified count broken/working |
| **Audit-2** (vol3) | same | READ `v3-*.json` + extra esperimenti | Audit matrix vol3 esperimenti |
| **LiveTest-1** (vol1+vol2 prod) | `playwright-mcp` + `Control_Chrome` MCP + `mcp__plugin_playwright_*` | E2E browser verify | UNO PER UNO Playwright sweep vol1+vol2 — record video/screenshot ogni esperimento |
| **LiveTest-2** (vol3 prod) | same | E2E browser verify | UNO PER UNO Playwright sweep vol3 |
| **UNLIMVerify** | `mcp__plugin_playwright_*` + curl Edge Function | Test UNLIM Onnipotenza (intent dispatch via __ELAB_API) + Onniscenza (RAG retrieve + classifier + 7-layer aggregator) ogni esperimento | UNLIM matrix: per esperimento — Vol/pag verbatim cited? + plurale Ragazzi? + intent dispatch (highlightComponent + mountExperiment + captureScreenshot)? + Onniscenza category correctly classified? |
| **Persona** | `playwright-mcp` simulazione utenti | 4 personas × random 5 esperimenti × 4 modalità = 80 scenarios | Comprehensibility score per persona — flag confusing UX |
| **DesignCritique** | `impeccable:design-critique` + `impeccable:critique` + `impeccable:audit` + `impeccable:typeset` + `impeccable:colorize` + `impeccable:arrange` | READ `src/components/**` + `src/styles/**` + Lighthouse | Design audit matrix — palette violations, typography drift, alignment issues, contrast WCAG, ordering |
| **Scribe** | `general-purpose` (claude-mem orchestration) | docs/audits/ + automa/team-state/messages/ | Per-cycle audit + handoff doc + CLAUDE.md append |

### Funnel consolidation cycles

**Cycle 2** (4 agents): merge findings cycle 1 → consolidated audit + live evidence + UNLIM matrix + design recommendations

**Cycle 3** (2 agents): Fix-orchestrator applica patches in batch (lesson-path JSON fixes + linguaggio codemod + design palette/typography fixes + UNLIM Vol/pag enrichment) + Verifier re-runs subset of broken experiments + verifies fix effective

**Cycle 4** (1 agent): close ralph loop iteration — score 94 esperimenti broken count + handoff next ralph iter

---

## §3 PHASE 0 — Documentation Discovery + State Mapping

**MANDATORY first step ogni Mac Mini ralph cycle entrance**.

### 3.1 Map filesystem 94 esperimenti

Run shell commands:
- `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"` (or Mac Mini equivalent path)
- `ls src/data/lesson-paths/ | grep -E "^v[123]-" | wc -l` (expected 94: 38 vol1 + 27 vol2 + 29 vol3)
- `ls src/data/lesson-paths/v1-*.json | wc -l` (expected 38)
- `ls src/data/lesson-paths/v2-*.json | wc -l` (expected 27)
- `ls src/data/lesson-paths/v3-*.json | wc -l` (expected 29)
- `grep -c "^export const" src/data/volume-references.js` (expected ~94 entries 1 per esperimento)

### 3.2 Map narrativa volumi cartacei (estrazione PDF)

- `pdftotext "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Volume1.pdf" /tmp/vol1.txt`
- `pdftotext "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Volume2.pdf" /tmp/vol2.txt`
- `pdftotext "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Volume3.pdf" /tmp/vol3.txt`
- `wc -l /tmp/vol*.txt` (expected vol1 ~2000+ + vol2 ~1500+ + vol3 ~1800+)

### 3.3 Map modalità 4

- `grep -rn "modalita\|modalità" src/components/lavagna/*.jsx | head`
- Files key: `ModalitaSwitch.jsx` + `PercorsoCapitoloView.jsx` + `PassoPassoPanel.jsx` (?) + `GiaMontato.jsx` + `LavagnaShell.jsx` (default 'percorso')

### 3.4 Map UNLIM Onnipotenza + Onniscenza

Onnipotenza (intent dispatch 12-tool whitelist):
- `cat supabase/functions/_shared/intent-tools-schema.ts`
- `cat src/components/lavagna/intentsDispatcher.js`
- `cat src/services/simulator-api.js | grep -E "mountExperiment|highlightComponent|captureScreenshot"`

Onniscenza (classifier + 7-layer aggregator):
- `cat supabase/functions/_shared/onniscenza-classifier.ts`
- `cat supabase/functions/_shared/onniscenza-bridge.ts`
- `cat scripts/openclaw/state-snapshot-aggregator.ts`

### 3.5 Output Phase 0

`docs/audits/sprint-u-cycleN-phase0-state-map.md` con:
- Conteggio reale esperimenti per volume (38+27+29 expected)
- Conteggio narrativa volumi (paragrafi PDF estratti)
- Mapping esperimento ↔ narrativa libro (variazioni-tema vs pezzi-staccati)
- Stato modalità 4 (Percorso/Passo Passo/Libero/Già Montato) — funzionalità live
- Stato UNLIM Onnipotenza (12-tool whitelist live verified) + Onniscenza (classifier 6 categorie + aggregator wired prod)

---

## §4 PHASE 1 — Audit UNO PER UNO 94 esperimenti (read-only baseline)

### 4.1 Per ogni esperimento (94 iterazioni)

Audit matrix `docs/audits/sprint-u-cycleN-94-esperimenti-audit-baseline.md`:

| ID | Volume | Cap | Esperimento | lesson-path JSON valid? | bookText VERBATIM enriched? | components count | connections count | parity_narrative_score (0-10) | linguaggio_plurale (0-10) | flag |
|----|--------|-----|-------------|-------------------------|----------------------------|-------------------|--------------------|-------------------------------|---------------------------|------|
| 1 | v1 | 6 | esp1 (LED rosso) | ✅ | ✅ Vol1 pag.42 "...verbatim" | 4 | 5 | 8 | 9 | OK |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 94 | v3 | 8 | serial | ⚠️ | ❌ NOT enriched | 6 | 8 | 5 | 4 | FIX |

### 4.2 Parity narrative score criterion

Ogni esperimento deve essere allineato a:
- **VARIAZIONI-TEMA** (capitolo libro presenta come narrativa continua): es. "Accendere LED" → "2 LED" → "LED lampeggia" — parity_score ALTO se lesson-paths sequence rispetta variazioni
- **PEZZI-STACCATI** (libro presenta come esperimenti distinti): parity_score ALTO se lesson-paths sono entità autonome con bookText completo

Discrepanza variazioni-tema vs pezzi-staccati → `parity_score < 6` → FLAG FIX cycle 3+.

### 4.3 Linguaggio plurale score criterion

Per ogni esperimento `lesson-path.json`, scan `description` + `steps[]` + `intro` + `hints` per:
- ✅ Plurale "Ragazzi," / "Voi" / "vediamo insieme"
- ❌ Singolare imperativo "fai" / "clicca" / "premi" / "monta"
- ❌ Riferimento al singolo studente

Punteggio:
- 10/10: tutto plurale + docente-first
- 6/10: misto (qualche singolare)
- <6/10: prevalente singolare → FLAG FIX

---

## §5 PHASE 2 — Live test UNO PER UNO via Playwright + Control Chrome

### 5.1 Per ogni esperimento — Playwright spec sequence

**MANDATORY tools**: `mcp__plugin_playwright_playwright__browser_navigate` + `browser_evaluate` + `browser_take_screenshot`. Plus `Control_Chrome` MCP for hand verification.

For each of 94 experiments, run Playwright spec with this sequence (pseudocode prose):

1. **Navigate** prod `https://www.elabtutor.school/#tutor` via `browser_navigate`.
2. **Mount experiment** via browser_evaluate calling `window.__ELAB_API.mountExperiment(experimentId)` where experimentId is e.g. `'v1-cap6-esp1'`.
3. **Wait simulator render** via `browser_wait_for` selector `[data-component-id]` with 5s timeout.
4. **Verify components count** via browser_evaluate getting `document.querySelectorAll('[data-component-id]').length` — assert ≥4 (LED + R + 2 wires + nano).
5. **Verify connections present** via browser_evaluate calling `window.__ELAB_API.getCircuitState().connections.length` — assert > 0.
6. **Run simulation** via `browser_click` on Play button.
7. **Wait LED ON** via browser_wait_for: poll querySelector `[data-component-id="led1"]` for class `led-on` with 10s timeout.
8. **Screenshot evidence** via `browser_take_screenshot` save to `docs/audits/sprint-u-cycle{N}-screenshots/v1-cap6-esp1.png`.
9. **Test UNLIM "Spiega questo esperimento"** via browser_type into UNLIM input + browser_press_key Enter. Wait for response selector. Assert response text matches `/Ragazzi/i` (PLURALE), `/Vol\.?\s*1/i` (Vol/pag verbatim), and word count ≤80 (~60 + tolerance).
10. **Test UNLIM action "Evidenzia il LED rosso"** via browser_type + Enter. Wait for `[data-component-id="led1"]` to gain class `highlighted` with 10s timeout.
11. **Test modalità switch** for each of `'percorso'`, `'passo-passo'`, `'libero'`, `'gia-montato'`: browser_click on `[data-modalita="<name>"]`, wait for `[data-modalita-active="<name>"]`, screenshot save to `docs/audits/sprint-u-cycle{N}-screenshots/v1-cap6-esp1-<modalita>.png`.
12. **Lavagna pulita test**: switch to Libero modalità, browser_evaluate calling `window.__ELAB_API.clearCircuit()`. Then assert `document.querySelectorAll('[data-component-id]').length === 1` (solo Arduino Nano remains) AND `document.querySelectorAll('[data-drawing-path]').length === 0` (zero residual drawings).

### 5.2 Output Phase 2

`docs/audits/sprint-u-cycle{N}-94-esperimenti-live-test.md` matrix:

| ID | mount? | render? | components placed correctly? | simulation runs? | UNLIM citation? | UNLIM action? | modalità Percorso? | modalità Passo Passo? | modalità Libero? | modalità Già Montato? | clearCircuit clean? | broken_score (0-10) | screenshot evidence path |

Plus `docs/audits/sprint-u-cycle{N}-screenshots/` con N PNG per esperimento × 4 modalità = ~376 PNG totali (94 × 4).

### 5.3 Broken count target

- **Cycle 1 baseline**: aspettato ~30-50 broken (parità con Andrea iter 21+ feedback)
- **Cycle 2-N progressive**: ridurre del 30% per cycle (50→35→25→17→12→8→5→3→1→0)
- **Sprint U close target**: ≤10 broken irrecuperabili (con explicit reason documented per ognuno)

---

## §6 PHASE 3 — Persona simulation 4 utenti psychology test

### 6.1 4 Personas

**P1 Docente Primaria 4ª — Maria, 45 anni**:
- Bassa esperienza Arduino (mai usato simulator)
- Cerca: micro-step espliciti, analogie semplici (LED = lampadina), Vol/pag verbatim per leggere ad alta voce
- Frustrazione se: passi saltati, tecnicismi non spiegati, modalità unclear

**P2 Docente Secondaria 1ª — Giovanni, 38 anni**:
- Esperienza intermedia (ha usato Tinkercad)
- Cerca: efficienza, ordine logico, ELAB > Tinkercad differentiation
- Frustrazione se: lentezza, parità libro non rispettata, simulazione bug

**P3 Docente Esperto 3ª media — Lucia, 52 anni**:
- Esperienza avanzata Arduino (insegna da 10 anni)
- Cerca: spunti avanzati, no hand-holding, modalità Libero potente
- Frustrazione se: micro-step inutili, suggerimenti banali, lavagna non pulita

**P4 Sostituto last-minute — Marco, 28 anni**:
- Zero contesto (mai aperto ELAB Tutor)
- Cerca: onboarding immediato, "tell me what to do" + "open the right experiment", modalità Già Montato per spiegazione frontale rapida
- Frustrazione se: interfaccia complessa, voci modalità confuse, UNLIM non guida

### 6.2 Test scenarios

Per ogni persona × 4 modalità × 5 random esperimenti = 80 scenarios.

Score user comprehensibility 0-10:
- ≥9: persona riesce eseguire scenario senza aiuto esterno + capisce parità libro + UNLIM aiuta proattivamente
- 6-8: persona ci riesce con qualche frizione (UI confusa, modalità unclear)
- ≤5: persona si blocca / abbandona / chiede aiuto

### 6.3 Output Phase 3

`docs/audits/sprint-u-cycle{N}-persona-simulation.md` con:
- 80 scenario × screenshot evidence
- Score per persona × modalità
- Top 10 friction points UX
- Top 10 confusion points narrative parity

---

## §7 PHASE 4 — Fix sweep batch (Cycle 3 — 2 agents Fix-orchestrator + Verifier)

### 7.1 Fix categories

**Category A — Lesson-path JSON fixes** (Fix-orchestrator):
- Add missing `bookText` VERBATIM da PDF estratto Phase 0
- Fix `description` plurale "Ragazzi" + docente-first
- Add missing `steps[]` micro-step Passo Passo
- Fix `components[].position` placement (snap to grid 7.5px)
- Fix `connections[]` invalid endpoints
- Refactor narrative parity (variazioni-tema sequence dove libro lo richiede)

**Category B — Linguaggio codemod** (carryover iter 38 A14):
- Scan `src/data/lesson-paths/**` + `src/components/**` + `src/data/volume-references.js`
- Replace 200+ violations singolare → plurale (vedi PDR iter 38 A14 patterns)
- Skip false positives (code identifiers, URL slugs, Vol/pag VERBATIM citations)

**Category C — Design overhaul** (impeccable skills):
- `/colorize` palette violations Navy/Lime/Orange/Red → fix hex hardcoded
- `/typeset` font ≥14px enforcement (435 font<14 CSS + 1326 fontSize<14 JSX flagged iter 12)
- `/arrange` layout improvements — alignment + spacing
- `/normalize` design-system compliance
- `/polish` final pass

**Category D — Esperimenti SVG fixes** (broken components disposed unclear):
- Fix component placement coordinates (overlap fixes)
- Fix component palette per Omaric kit (NO generic blue/red)
- Fix wire colors Omaric standard (red+/black-)
- Fix labels typography ≥13px

**Category E — UNLIM enrichment**:
- Aggiunge `bookText` VERBATIM volume-references.js dove mancante
- Aggiorna `system-prompt.ts` few-shot Esempio per coverage tutti 94 esperimenti
- Verifica RAG chunks coverage Vol1+2+3 (currently 1881 chunks)

**Category F — Modalità 4 fixes**:
- **Percorso**: garantisce sequence parity libro (variazioni-tema cap-by-cap)
- **Passo Passo**: aggiunge micro-step numerati ogni esperimento
- **Libero**: VERIFICA clearCircuit lascia veramente lavagna pulita (zero residual components/drawings)
- **Già Montato**: pre-built circuit visualizzato OK + UNLIM evidenzia componenti automaticamente al mount

### 7.2 Verifier role

Re-run subset of broken experiments post-fix:
- Verifica fix effective (re-screenshot diff)
- Verifica vitest 13474+ baseline preservato
- Verifica build PASS pre-deploy

---

## §8 PHASE 5 — Verification + Close

### 8.1 Final verification matrix

| Metric | Target | Measurement |
|--------|--------|-------------|
| 94 esperimenti broken count | **≤10** (irrecuperabili explicit reason) | Live test sweep cycle finale |
| Parity narrative score avg | **≥8/10** | Audit narrative matrix |
| Linguaggio plurale Ragazzi avg | **≥9/10** | Codemod scan + audit |
| UNLIM Vol/pag VERBATIM citation rate | **≥95%** | UNLIM matrix per esperimento |
| UNLIM action dispatch verified live | **≥90%** | UNLIMVerify matrix |
| Modalità Percorso functional | **100%** | Persona simulation P1+P2+P3+P4 |
| Modalità Passo Passo functional | **100%** | Persona simulation |
| Modalità Libero clearCircuit clean | **100%** | clearCircuit test post each esperimento |
| Modalità Già Montato visualization | **≥95%** | Visual verify + screenshot |
| Lighthouse perf (chatbot+easter) | **≥90** | Iter 38 carryover A6 |
| Lighthouse a11y | ≥95 | preserve iter 38 |
| Lighthouse SEO | ≥100 | preserve iter 38 |
| Persona comprehensibility avg | **≥8/10** | Persona simulation 80 scenarios |
| vitest baseline | **13474+ NEVER scendere** | pre-commit hook |
| Build PASS | mandatory | pre-commit + pre-push hooks |

### 8.2 Anti-inflation G45 mandate

- **NO claim "94 esperimenti tutti funzionanti"** se broken count > 10 verified live
- **NO claim "parity 100%"** senza Audit-1+Audit-2 cross-verification
- **NO claim "UNLIM ≥95%"** senza UNLIMVerify matrix evidence
- **NO claim "lavagna pulita"** senza clearCircuit test passed UNO PER UNO
- **NO claim "iter close 9.5"** senza Opus-indipendente review (G45 mandate)

### 8.3 Sprint U cycle counts realistic

- Cycle 1 baseline: ~10-15h Mac Mini autonomous (94 esperimenti × ~8min each in parallel)
- Cycle 2 consolidation: ~3-5h
- Cycle 3 fix batch: ~6-10h (depending broken count)
- Cycle 4 close: ~2h

**Total Sprint U single ralph iteration**: ~25-35h Mac Mini autonomous H24.
**Sprint U projection**: 2-3 ralph iterations needed to hit broken count ≤10 + parity ≥8.

---

## §9 ANTI-PATTERNS Sprint U vietati

1. **NO inflation**: Mac Mini agent NEVER claim "fixed" senza re-run live verify post-fix.
2. **NO compiacenza**: Mac Mini agent NEVER says "works fine" se persona simulation flagga friction.
3. **NO --no-verify**: pre-commit hook + pre-push hook NEVER bypassed (mandato Andrea iter 32).
4. **NO push main**: solo branch `mac-mini/sprint-u-cycle{N}-{ISO}-{slug}` + PR via gh CLI.
5. **NO modifying engine files**: `CircuitSolver.js` + `AVRBridge.js` + `PlacementEngine.js` SOLO con marker authorized-engine-change esplicito.
6. **NO inventing APIs**: usa SOLO `__ELAB_API` documentato in CLAUDE.md "API globale simulatore" sezione.
7. **NO assuming structure**: ogni cycle entrance MANDATORY Phase 0 doc discovery file-system verified.
8. **NO ignoring user friction**: persona simulation P1-P4 score < 6 → MANDATORY flag fix cycle next.

---

## §10 PRINCIPIO ZERO + MORFISMO compliance gate (8/8 INVARIATO Sprint U)

1. ✅ Linguaggio plurale "Ragazzi," + Vol/pag verbatim ≤60 parole + analogia (Phase 4 Cat B codemod)
2. ✅ Kit fisico mention ogni response/tooltip/empty state (UNLIM enrichment Cat E)
3. ✅ Palette CSS var Navy/Lime/Orange/Red NO hex hardcoded (Cat C `/colorize`)
4. ✅ Iconografia ElabIcons SVG NO material-design NO emoji (Cat D)
5. ✅ Morphic runtime (NO static config) — preserve iter 36-38 wire-up
6. ✅ Cross-pollination Onniscenza L1+L4+L7 (UNLIM matrix verify)
7. ✅ Triplet coerenza kit Omaric SVG + volumi cartacei + software Sense 2 (parity narrative)
8. ✅ Multimodale Voxtral voice clone Andrea + Vision Pixtral + STT (preserve iter 31-38)

---

## §11 Files refs critical Sprint U

- `src/data/lesson-paths/v[123]-*.json` — 94 file lesson-path
- `src/data/volume-references.js` — 94/94 entries bookText VERBATIM
- `src/data/experiments-vol[123].js` — esperimenti aggregator
- `src/data/lesson-groups.js` — 27 Lezioni grouping (preserve iter 28+)
- `src/components/lavagna/ModalitaSwitch.jsx` — modalità 4 selector
- `src/components/lavagna/PercorsoCapitoloView.jsx` — Percorso modalità
- `src/components/lavagna/GiaMontato.jsx` — Già Montato modalità
- `src/components/lavagna/LavagnaShell.jsx` — orchestrator + clearCircuit handler
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — render esperimenti
- `src/services/simulator-api.js` — `__ELAB_API` mountExperiment + clearCircuit + highlightComponent
- `src/components/lavagna/intentsDispatcher.js` — UNLIM Onnipotenza 12-tool whitelist (iter 37)
- `supabase/functions/_shared/intent-tools-schema.ts` — canonical schema iter 38
- `supabase/functions/_shared/onniscenza-classifier.ts` — UNLIM Onniscenza 6-categorie classifier
- `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Volume[123].pdf` — narrativa libro
- `tests/e2e/29-92-esperimenti-audit.spec.js` — existing audit harness (extend Sprint U)
- `tests/e2e/helpers/wire-count.js` — canonical helper (iter 29)

---

## §12 Skill ELAB-specific Sprint U

| Skill | Use case Sprint U |
|-------|------------------|
| `elab-harness-real-runner` | Phase 2 Playwright UNO PER UNO sweep |
| `elab-quality-gate` | Cycle entrance + close gate verify |
| `elab-principio-zero-validator` | Linguaggio plurale runtime score per esperimento |
| `elab-benchmark` | Score 30 categorie post-fix sweep |
| `volume-replication` | Phase 4 Cat A bookText VERBATIM enrichment |
| `tinkercad-simulator` | Reference simulator competitor analysis |
| `lavagna-benchmark` | Modalità 4 redesign benchmark |
| `analisi-simulatore` | Phase 0+1 audit simulator state |
| `elab-cost-monitor` | Mistral Scale tier €18/mese budget tracking |
| `elab-macmini-controller` | Cycle dispatch orchestration |

Plus impeccable skills (Phase 4 Cat C+D):
- `impeccable:design-critique` `/critique` `/colorize` `/typeset` `/arrange` `/normalize` `/polish` `/audit` `/harden` `/extract` `/clarify` `/animate` `/onboard`
- `frontend-design`
- `figma:figma-generate-design` (se Figma access)
- `claude-design` (canvas-design, algorithmic-art, web-artifacts-builder)

---

## §13 Mac Mini autonomous H24 dispatch context

- **SSH**: `ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59`
- **PATH project**: `/Users/progettibelli/elab-builder/` (Mac Mini clone main)
- **Branch pattern**: `mac-mini/sprint-u-cycle{N}-{ISO}-{slug}`
- **Cron**: 4 entries LIVE iter 36 user-sim curriculum (L1+L2+L3 + aggregator) — Sprint U adds new cron entries cycle dispatch
- **Cost discipline**: Mac Mini M4 16GB always-on Strambino, no GPU. Keep budget €50/mese.
- **PR via**: `gh pr create --base main --head mac-mini/sprint-u-cycle{N}-...` (Andrea reviews + merge)
- **Heartbeat**: `automa/state/heartbeat` updated every cycle PID alive
- **Tailscale fallback**: se SSH timeout via Tailscale `100.124.198.59`, retry via local IP
- **Monitor**: `automa/team-state/messages/macmini-cycle{N}-*.md` live status

---

## §14 SUCCESS CRITERIA Sprint U close (G45 anti-inflation MANDATORY)

Sprint U close 9.5/10 ONESTO conditional ALL of (no compromise):

1. ✅ 94 esperimenti broken count ≤10 (irrecuperabili explicit reason documented per ognuno)
2. ✅ Parity narrative score avg ≥8/10 (variazioni-tema cap-by-cap dove libro lo richiede)
3. ✅ UNLIM Vol/pag VERBATIM citation rate ≥95% live verified
4. ✅ UNLIM action dispatch ≥90% live verified
5. ✅ Modalità 4 (Percorso/Passo Passo/Libero/Già Montato) tutte funzionanti per 94 esperimenti
6. ✅ Modalità Libero clearCircuit lascia lavagna VERAMENTE pulita (zero residual)
7. ✅ Linguaggio codemod 200+ violations applied (Andrea iter 21+ mandate carryover closed)
8. ✅ Lighthouse perf ≥90 + a11y ≥95 + SEO ≥100 (carryover iter 38 A6)
9. ✅ Persona simulation 4 personas × 4 modalità × 5 esperimenti = 80 scenarios avg comprehensibility ≥8/10
10. ✅ vitest 13474+ baseline preservato
11. ✅ Build PASS
12. ✅ Opus-indipendente review G45 mandate

**NO inflation. NO compiacenza. NO claim senza live evidence Playwright + Control Chrome.**

---

## §15 ACTIVATION STRING Mac Mini paste-ready

Vedi file dedicato: `docs/plans/MACMINI-ACTIVATION-PROMPT-SPRINT-U.md` (paste-ready single-block).

---

**Status**: Sprint U PROPOSED post iter 38 close (8.0/10). Cascade target Sprint U close 9.5/10 ONESTO via Ralph Loop multi-cycle 8→1 agent funnel.
