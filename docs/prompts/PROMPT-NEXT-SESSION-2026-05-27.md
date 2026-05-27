# PROMPT NEXT SESSION — 2026-05-27 — MULTI-AGENT ORCHESTRATION

**Sessione precedente firma**: Claude Opus 4.7 — 26/05/2026 PM — 3 commit shipped (`ddd123b1` esp5 semaforo topology + `93c70260` Pot/LDR slider clip + `bb504a00` PropertiesPanel default-comp edit) — deploy prod `https://elab-tutor-11yrauphl-andreas-projects-6d4e9791.vercel.app` + elabtutor.school HTTP 200.

---

## /goal MODE — 3 FEATURE PARALLELE CON ADVERSARIAL CODEX REVIEW

Andrea esplicita: usare team di agenti paralleli (`agent-teams:team-lead` + `agent-teams:team-implementer` × N) + Codex adversarial (`codex:codex-rescue`).

### Goal A — Manuale ↔ Passo Passo auto-sync
Quando docente è in modalità Passo Passo e currentStep cambia → VolumeViewer (se aperto) salta auto a pagina libro corrispondente da `buildSteps[currentStep].bookRef` OR `experiment.bookRef`.

**Behavior atteso**:
- Mount v1-cap6-esp1 → click Passo Passo → step 1 (R1) → premi Avanti → step 2 (LED) → VolumeViewer auto-aggiorna pagina
- Se VolumeViewer CHIUSO, NON aprire automaticamente (rispetto attenzione docente)
- Se buildStep manca bookRef, fallback su experiment.bookRef
- Event-based: emit `elab-step-change {experimentId, stepIndex, bookPage}` da LavagnaShell

### Goal B — JSON Export sessione (§2 spec design approved 25/05 PM)
Schema v1.0 minimal LLM-friendly:
```json
{
  "elab_session_export": {
    "version": "1.0",
    "exportedAt": "ISO8601",
    "experiment": { "id": "v1-cap6-esp1", "title": "...", "volume": 1, "chapter": 6 },
    "modalita": "passo-passo|gia-montato|percorso",
    "components": [{ "id": "led1", "type": "led", "x": 240, "y": 180, "rotation": 0, "color": "red", "value": null }],
    "wires": [{ "id": "w1", "from": "led1:anode", "to": "bb1:row-5-a", "color": "red" }]
  }
}
```

UI: AppHeader "Salva" → modal 3 options (Supabase / Esporta JSON / Importa JSON).

**6 atoms**:
- B1: `src/services/sessionExporter.js` ~80 LOC (read state → JSON)
- B2: `src/services/sessionImporter.js` ~120 LOC (parse JSON → restore state via __ELAB_API)
- B3: `src/components/lavagna/SessionExportModal.jsx` + module css ~150 LOC
- B4: localStorage auto-snapshot ogni 30s hook (`useSessionAutosnapshot.js`)
- B5: Unit tests vitest: `tests/unit/services/sessionExporter.test.js` + `sessionImporter.test.js`
- B6: E2E Playwright spec: `tests/e2e/session-export.spec.js`

### Goal C — Play / Pause / Stop 3-button UX redesign
Andrea verbatim: "play e pausa e stop". Currently MinimalControlBar.jsx 211-241 = 1 toggle (Play↔Pause) + 1 Reset.

**New 3-button distinct**:
- **Play** (Avvia): start simulation. Visible when stopped/paused.
- **Pause** (Sospendi): suspend AVR + circuit solver. Preserve component states. Resume on Play.
- **Stop** (Ferma): halt + reset to t=0. Clear pin states + serial buffer. NOT same as Reset (which clears full custom state).

Map current → new:
- Play (existing) → Play (extend: if paused, resume; if stopped, start)
- Pause (existing toggle on Play btn) → DEDICATED Pause button (always visible per Arduino esp)
- Reset → rename "Stop" semantic OR keep Reset as separate 4th button

**Decisione UX** lock in spec atom prima di code: 3 dist + 1 Reset, OR 3 dist + Reset folded into Stop.

---

## REGOLE FERREE PRE-SESSIONE (invariate)

1. **NO DOMANDE A ANDREA**. Esegui autonomia. Solo ambiguità reale documentata + bloccante → 1 domanda telegrafica.
2. **MOLTI TEST** non parole. Ogni claim → vitest output OR live preview OR DOM inspect.
3. **NON ricadere modifiche demo**. CLAUDE.md "REVERT POST-DEMO 25/05/2026 — STATO IMMUTABILE".
4. **8 esp whitelist FISSO** unless Andrea OK. Source `src/data/experiment-visibility.js`.
5. **Caveman mode**. Code/commit: write normal.
6. **Verify before completion** mandatory via preview_eval OR vitest OR DOM inspect.
7. **CoV 3× vitest** prima claim "test passano".
8. **Battery9V.jsx INTOCCABILE**.

---

## ORCHESTRATION 5-PHASE WORKFLOW

### PHASE 0 — Spec lock + file ownership matrix (30 min)
Lead agent: `agent-teams:team-lead` opus.

**Output deliverable**: `docs/plans/2026-05-27-3-features-multi-agent-plan.md` containing:
- 3 atoms decomposition con LOC stimate
- File ownership matrix ZERO overlap (impl agents NON possono toccare stessi file)
- Integration sync points (es. AppHeader Salva button = single coord point)
- Test baseline 26/05: **44 fail | 15859 pass | 15 skip | 10 todo**
- UX decision lock per Goal C (3 vs 4 button layout)

**File ownership matrix proposed** (lead può raffinare):

| Agent | Files (exclusive write) |
|---|---|
| Impl-A Manuale↔PP | `src/components/lavagna/LavagnaShell.jsx` (sub-region currentStep+VolumeViewer wire) + `src/components/lavagna/VolumeViewer.jsx` |
| Impl-B1+B2+B4 services | NEW `src/services/sessionExporter.js` + `sessionImporter.js` + `src/hooks/useSessionAutosnapshot.js` |
| Impl-B3 modal | NEW `src/components/lavagna/SessionExportModal.jsx` + `SessionExportModal.module.css` + edit `src/components/lavagna/AppHeader.jsx` Salva button wire |
| Impl-B5 unit tests | NEW `tests/unit/services/sessionExporter.test.js` + `sessionImporter.test.js` + `tests/unit/hooks/useSessionAutosnapshot.test.js` |
| Impl-B6 E2E | NEW `tests/e2e/session-export.spec.js` + `playwright.prod.config.js` extend |
| Impl-C Play/Pause/Stop | `src/components/simulator/panels/MinimalControlBar.jsx` (211-300) + `src/components/simulator/panels/ControlBar.jsx` |

**Sync points** (cross-agent message passing):
- Impl-B3 (AppHeader) ↔ Impl-A (LavagnaShell event emitter) — AppHeader passes elab-step-change context to SessionExportModal for capture
- Impl-C → Impl-A — Play/Pause/Stop state may affect Passo Passo step navigation? NO (UI control vs step logic separate). Sync solo per anti-regression test.

### PHASE 1 — Parallel implementation (90 min)
6 implementer atomically. Lead dispatch via `mcp__plugin_serena_serena` OR direct Task tool.

**Mandate ogni implementer**:
- TDD red→green (test fails first → impl → test pass)
- ZERO modifica file fuori ownership matrix
- Commit atomic per atom (es. `feat(session-export): B1 sessionExporter service`)
- Live verify before claim done
- Cite test count delta vs baseline 44 fail

### PHASE 2 — Parallel testing + DOM verify (30 min)
- `test-automator` per generare missing tests
- `team-debugger` per ANY test failure hypothesis-driven
- Live preview_eval check ogni feature path

### PHASE 3 — Codex ADVERSARIAL review (45 min)
**MANDATORY**: invocare `codex:codex-rescue` con prompt esplicito adversarial:

> "Tu sei reviewer adversarial Codex. Branch fix/unlim-compile-helper-mascot-tweak-2026-05-24 ha 3 nuove feature: Manuale↔PassoPasso sync, JSON Export sessione (6 atoms), Play/Pause/Stop 3-button. Cerca bug, edge case missed, anti-pattern, race condition, security issue (input validation JSON import!), regressioni. NO compiacenza. Report finding con file:line + severity + suggested fix. Anche se 'tutto sembra ok', cerca harder."

**Codex MUST check**:
- JSON Import validation (malicious JSON, missing fields, schema version mismatch)
- localStorage quota for auto-snapshot 30s × N sessions
- Race condition Pause→Resume per AVR worker
- VolumeViewer auto-sync infinite loop risk
- Test coverage delta (line coverage decreased?)
- Anti-pattern: hardcoded magic numbers, missing types, copy-paste

### PHASE 4 — Integration + deploy (30 min)
- Apply Codex findings → fix loop until adversarial PASS
- CoV 3× `npx vitest run` IDENTICAL output (no flakiness)
- `npm run build` × 2 entrambe exit 0
- Live preview verify 5 user flows
- `npx vercel --prod --yes` → URL + curl 200
- `curl elabtutor.school` 200
- Memory observation_add session summary
- Update CLAUDE.md if new pattern introdotto

---

## DEFERRED dal sessione 26/05 (P0.3 + P0.4 + 44 test fail baseline)

NOT in scope this session unless time permits dopo Phase 4 deploy:

- **P0.3** Vol3 v0.16 resync 23 hidden esp (pdftotext + compare per esp)
- **P0.4** Vol2 verify 25 hidden esp vs `MANUALE VOLUME 2 ITALIANO.pdf`
- **Baseline 44 fail** investigation (pre-existing dal 12/05 revert, NON introdotti)
- **esp5 label overlap** LED1/LED2/LED3 stagger y per component (cosmetic)
- **Working tree uncommitted 21 file** (book-geometry deletes + 7 modified, prior session) — Andrea decide se committare cleanup OR lasciare come da prior sessione design

---

## EVIDENCE REQUIREMENTS

Ogni atom implementer FATTO produce:
1. **BEFORE**: file content snippet OR DOM state
2. **CHANGE**: `git diff --stat`
3. **AFTER**: vitest output OR live preview screenshot OR DOM inspect
4. **Anti-regression**: vitest count delta vs 44 fail baseline

Ogni Codex finding REQUIRES:
1. file:line citation
2. severity HIGH|MED|LOW
3. suggested fix (diff OR pseudocode)
4. Applied|Deferred decision

---

## SUCCESS CRITERIA

- [ ] 3 features deployed prod + verified HTTP 200
- [ ] CoV 3× vitest IDENTICAL output (NO flakiness)
- [ ] Build 2× pass
- [ ] Test count delta ≤ 0 fail (no regression) + ideally +N pass for new tests
- [ ] Codex adversarial review report with all HIGH findings addressed
- [ ] Plan doc + per-atom commits + final integration commit on branch
- [ ] Andrea ratify live state via screenshot
- [ ] observation_add memory + update PROMPT-NEXT-SESSION-2026-05-28.md

---

## ANTI-PATTERN red flags STOP

- Tentato implementare TUTTO single-agent (no team) → STOP, leggi orchestration phases
- Tentato skip Codex review "for speed" → NO, adversarial mandatory
- Tentato skip CoV 3× → STOP, CoV mandatory
- Tentato re-introdurre bookGeometry/demo-mode → REGRESSION
- Tentato toccare Battery9V.jsx → INTOCCABILE
- Tentato auto-aggiungere ID VISIBLE_EXP_IDS → require Andrea OK
- Tentato commit con baseline test peggiore → indaga delta
- Tentato 1 implementer scrive file di un altro → BREAK ownership matrix

---

## ENVIRONMENT

- Working dir: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
- Branch: `fix/unlim-compile-helper-mascot-tweak-2026-05-24` (10 commit ahead main)
- Test baseline: 44 fail | 15859 pass (DO NOT regress)
- Whitelist 8 esp invariata
- Preview server pr163-dev port 5173 already running (preview_list to confirm)
- Build time ~3-7 min, vitest run ~3-12 min

## TIPS

- `agent-teams:team-lead` per decompose + dispatch
- `Task tool subagent_type=agent-teams:team-implementer` per parallel impl (each w/ exclusive file list)
- `codex:codex-rescue` for adversarial review
- `superpowers:dispatching-parallel-agents` skill se >2 task indipendenti
- `superpowers:test-driven-development` per ogni atom
- `superpowers:verification-before-completion` mandatory pre-deploy
- `claude-mem:make-plan` per plan doc Phase 0
- Context menu buttons use **onPointerDown** not onClick — `preview_click` works, `dispatchEvent('click')` no
- `getCurrentExperiment` returns ORIGINAL `currentExperimentRef`, NOT merged — for live state read `mergedExperiment` directly in components

FINE PROMPT. Vai. Niente domande. Multi-agent orchestration mandatory. Adversarial Codex review mandatory. Andrea aspetta 3 feature shipped + adversarial review report.
