# Sprint U Cycle 2 — Task 5 Volumi Vol2 Audit Design

**Date**: 2026-05-07
**Author**: Andrea Marro (orchestrator)
**Status**: PROPOSED — awaiting user review before writing-plans skill invocation
**Volume in scope**: Vol2 (multimetro + resistori + parallelo, 27 esperimenti dichiarati CLAUDE.md)
**Cycle scope**: audit-only, ZERO src/ modifications. Cycle 3 = fix wave separato.
**Output principale**: `automa/state/task5-volumi-vol2.json`

---

## 1. Problem Statement

Andrea (feedback iter 21+ mandate carryover): "interpretato troppo alla lettera, hai spiattellato le cose tutte di fila". I 94 esperimenti software non rispecchiano la struttura narrativa dei 3 volumi cartacei. I libri raggruppano per CONCETTO con variazioni multiple all'interno; il software li espone come lista flat sequenziale.

Esempio Vol2 (auditato `task5-parita.json` 2026-04-14, score 6.5/10): primi 4 esperimenti cap3 sono variazioni del concetto "misura tensione DC" con multimetro, ma nel codice esistono come 4 record separati `v2-cap3-esp{1..4}` mentre nel libro sono raccontati come UN flusso narrativo continuo con casistiche.

Tre problemi distinti da auditare in questo Cycle:
1. **Allineamento dati** (esperimento per esperimento): titolo, componenti, ordine, descrizione tra PDF e codice
2. **Funzionamento live** (anti-G45 mandate Andrea): esperimenti effettivamente montano correttamente sul prod, collegamenti perfetti, simulazione funziona
3. **Concept grouping** (refactor proposal): `lesson-groups.js` 27 Lezioni totali — Vol2 section ha N Lezioni ma narrativa libro suggerisce M ≠ N concept-group ottimali

## 2. Goals & Non-Goals

**Goals**:
- Audit completo Vol2 PDF vs `experiments-vol2.js` + `lesson-groups.js`
- Live functional test 27 esperimenti via Control Chrome MCP su `https://www.elabtutor.school`
- Wire/component verify per esperimento (collegamenti perfetti)
- Concept-grouping refactor proposal (`concept_grouping_proposed[]`)
- CoV 3x verify + quality gate
- Output `automa/state/task5-volumi-vol2.json` machine-readable per Cycle 3 fix automation
- Output `docs/audits/2026-05-07-task5-volumi-vol2-audit.md` narrative leggibile

**Non-Goals** (esplicito):
- ZERO src/ modifications questo Cycle (audit-only)
- Vol1 + Vol3 NON in scope — iter successivi dopo metodologia validata su Vol2
- Fix automatici esperimenti broken — Cycle 3 separato
- Refactor `lesson-groups.js` immediato — Cycle 3 con review Andrea
- Davide co-author refactor narrative ADR-027 — deferred Sprint U successivo

## 3. Approach

**Hybrid (Approach 3 user-approved)**: PDF audit parallel via 2 BG agents (`general-purpose` subagent_type) + live test inline serial via Control Chrome (browser singolo naturalmente serial) + Figma cross-ref opzionale + Documenter consolidation inline (no BG agent post iter 38 PM org-limit lesson).

**Pattern S race-cond fix**: file ownership rigid (Maker-1 ch3-4, Maker-2 ch5+) + filesystem barrier `automa/team-state/messages/`.

**Anti-inflation G45 mandate**: tutti dati misurati live, zero synthesis. NO claim senza evidence committed (screenshot, file, output tool). NO score self-attribuiti — solo `/elab-quality-gate` skill output esatto.

## 4. Architecture (5 Phases)

### Phase 0 — Pre-flight (~5 min, inline)

1. `npx vitest run` baseline → record `automa/state/task5-vol2-baseline.txt`
2. `cat src/data/experiments-vol2.js | grep -c "^  id:"` → confirm count (atteso 27 — see E8)
3. `mcp__Control_Chrome__tabs_context_mcp` → confirm tab available (request_access se necessario)
4. Smoke test 1 esperimento Vol2 (es. v2-cap3-esp1) end-to-end via Control Chrome prima dispatch full
5. Read existing audits: `automa/state/task5-parita.json` (Vol2 section) + `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md` + Sprint U Cycle 1 consolidated

**Gate 0 PASS condition**: 4 checks green (vitest baseline recorded, count match, browser ready, smoke OK).

### Phase 1 — Parallel PDF + structural audit (~30 min)

**Maker-1 BG agent** (`subagent_type: general-purpose`):
- Tools: `Read`, `Bash`, `Write`
- Owns: Vol2 ch3 + ch4 (multimetro + resistori basic)
- Tasks:
  - `pdftotext "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf" /tmp/vol2.txt`
  - Read `experiments-vol2.js` cap3+cap4 entries
  - Read `lesson-groups.js` Vol2 section
  - Per esperimento, fill markdown template (sezione 6 Data Format)
- Output: `automa/state/maker1-vol2-ch3-4-audit.md`
- Completion msg: `automa/team-state/messages/maker1-vol2-phase1-completed.md`

**Maker-2 BG agent** (parallel a Maker-1):
- Same tools/type
- Owns: Vol2 ch5 + ch6 + capstone (resistori parallelo + applicazioni)
- Output: `automa/state/maker2-vol2-ch5-capstone-audit.md`
- Completion msg: `automa/team-state/messages/maker2-vol2-phase1-completed.md`

**Gate 1 PASS condition**: 2/2 file output non-empty, 2/2 completion msgs, ≥80% esperimenti coperti (allow E1/E2 partial).

### Phase 2 — Live functional test inline serial (~45 min)

Per ogni Vol2 esperimento (target 27):

```javascript
// Pseudo-flow Control Chrome MCP
1. navigate("https://www.elabtutor.school#tutor", tabId)
2. execute_javascript(`window.__ELAB_API.mountExperiment("${experimentId}")`, tabId)
3. wait(1500ms) per render
4. screenshot → docs/audits/screenshots/task5-vol2-{id}.png
5. execute_javascript(`window.__ELAB_API.getCircuitDescription()`, tabId)
   → record components_count, wires_count, components_list, wires_list
6. Compare wires/components vs PDF (Maker-1/2 output) → wires_correct, components_correct
7. Append entry markdown automa/state/inline-vol2-functional-test.md
```

Wire verify logic: `circuit.connections[]` deve contenere coppie pin che corrispondono a wiring diagram PDF capitolo. Componente verify: `circuit.components[]` count + types match PDF lista materiali.

**Gate 2 PASS condition**: ≥85% (24/27) esperimenti live test executed con screenshot evidence committed.

### Phase 3 — Figma cross-ref + concept-grouping refactor proposal (~20 min, inline)

**Figma cross-ref** (CONDITIONAL):
- Se Andrea fornisce Figma file ID/URL Vol2 brand assets → `mcp__Figma__get_design_context` → cross-ref simulator components SVG vs Vol2 design (Morfismo Sense 2 triplet)
- Se non disponibile → skip honestly: `figma_cross_ref: { status: "skipped", reason: "no_figma_file_id" }`

**Concept-grouping refactor proposal** (sempre eseguito):
- Read PDF Vol2 narrative structure (output Maker-1+2 already extracted)
- Identifica concetti pedagogici primari (es. "Misura tensione DC", "Misura corrente", "Resistori in serie", "Resistori in parallelo")
- Mappa raw esperimenti `v2-cap{N}-esp{M}` come `variations[]` di ogni concetto
- Output: `concept_grouping_proposed[]` array nel JSON main

Format proposed:
```json
{
  "concept": "Misura tensione DC",
  "pdf_pages": "45-52",
  "current_lesson_group_id": "lezione-X" (da lesson-groups.js),
  "current_lesson_group_problem": "raggruppa solo cap3-esp1+esp2, lascia esp3+esp4 in altra lezione",
  "variations": [
    { "raw_id": "v2-cap3-esp1", "pdf_subtitle": "Tensione batteria 9V", "pdf_pages": "45" },
    { "raw_id": "v2-cap3-esp2", "pdf_subtitle": "Tensione batteria stilo", "pdf_pages": "47" },
    { "raw_id": "v2-cap3-esp3", "pdf_subtitle": "Tensione partitore", "pdf_pages": "49" }
  ],
  "rationale": "Libro presenta come UN concetto con casistiche fonti diverse. Spiattellato in 3 record con titoli generici."
}
```

### Phase 4 — Documenter consolidation + CoV (~15 min, inline)

1. Merge Maker-1 + Maker-2 + inline functional test + Figma → unified `audit_findings[]` array
2. Consolidate concept-grouping proposal section
3. Run CoV 3x verify (sezione 5.2)
4. Invoke `/elab-quality-gate` skill (args: `vol2 audit-only Cycle2`) → record `quality_audit` section verbatim skill output (NO self-attribution)
5. Anti-regression final check: `npx vitest run` + `git status --porcelain`
6. Write `automa/state/task5-volumi-vol2.json` (MAIN deliverable)
7. Write `docs/audits/2026-05-07-task5-volumi-vol2-audit.md` (narrative report)

**Gate 3 PASS condition**: JSON valid (jq parse OK), all required fields present, schema match sezione 6.

## 5. Testing & Quality Gates

### 5.1 Phase-level gates (cumulative)

| Gate | Phase | PASS condition |
|------|-------|---------------|
| 0 | Pre-flight | vitest baseline recorded + count match + browser ready + smoke OK |
| 1 | Maker-1+2 | 2/2 file non-empty + 2/2 completion msgs + ≥80% esperimenti coperti |
| 2 | Live test | ≥85% (24/27) esperimenti live test + screenshots committed |
| 3 | JSON main | jq parse OK + all required fields + schema valid |
| 4 | Quality | `/elab-quality-gate` skill output PASS or documented WARN |
| 5 | Anti-regression | vitest ≥ baseline + zero src/ modified |

### 5.2 CoV 3x verify (Phase 4 step)

Sample 3 esperimenti random tramite `shuf -n 3 ids.txt` (NOT cherry-picked):

| Run | Source | Method |
|-----|--------|--------|
| 1 | Maker-1 deliverable | Already shipped Phase 1 |
| 2 | Manual re-extract | re-`pdftotext` + re-`Read` js + manual diff inline |
| 3 | Live re-test | Control Chrome re-mount + re-screenshot + re-getCircuitDescription |

Divergence thresholds:
- `pdf_concept` text similarity ≥95% → PASS
- `mounted` boolean stable across 3 runs → PASS
- `components_count` integer stable → PASS
- `screenshot` perceptual hash diff ≤2 (allow 1 frame jitter) → PASS

Output: `cov_log: { iterations: 3, sample_ids: [...], divergence_pct: X.X, pass: bool, details: [...] }`

### 5.3 Acceptance criteria (plan completato successo)

1. All 5 gates PASS
2. JSON main deliverable schema valid
3. ≥80% esperimenti structural audit + ≥85% live functional test
4. CoV divergence within thresholds
5. Quality gate skill output PASS or documented WARN
6. Vitest baseline preserved
7. Zero src/ modifications

## 6. Data Format

### 6.1 Phase 1 markdown template (per esperimento)

```markdown
## v2-cap3-esp1
- pdf_pages: 45-47
- pdf_concept: "Misura tensione DC con multimetro"
- pdf_components: ["batteria 9V", "multimetro", "puntali"]
- pdf_wires: ["puntale_rosso → batteria_+", "puntale_nero → batteria_-"]  # extracted from PDF text descriptions OR figure captions; if unreadable → null + reason
- pdf_variations: ["scala 10V", "scala 50V"]
- code_id: "v2-cap3-esp1"
- code_components: ["battery_9v", "multimeter"]
- code_title: "Misuriamo la tensione"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor|medium|high|critical
- notes: "..."
```

**Note on `pdf_wires`**: PDF wiring info often lives in text descriptions ("collega puntale rosso al positivo della batteria") OR figure captions. Maker-1/2 extract from text — figure-only diagrams without textual description → record `pdf_wires: null, pdf_wires_reason: "figure_only_no_text"` + screenshot of figure if needed. NO synthesis if unreadable.

### 6.2 Phase 2 markdown template (per esperimento)

```markdown
## v2-cap3-esp1
- mounted: true|false
- mount_error: null | "..."
- circuit_description_components_count: 3
- circuit_description_wires_count: 2
- wires_correct_per_pdf: true|false
- components_correct_per_pdf: true|false
- screenshot: docs/audits/screenshots/task5-vol2-cap3-esp1.png
- screenshot_sha256: ...
- live_issue: null | "Pin LED non allineato fila E5 breadboard"
- timestamp: 2026-05-07T...Z
```

### 6.3 Main JSON schema (`task5-volumi-vol2.json`)

```json
{
  "task": "volumi-vol2",
  "timestamp": "2026-05-07T...",
  "volume": 2,
  "pdf_path": "CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf",
  "esperimenti_count_declared": 27,
  "esperimenti_count_actual": "RUNTIME_FILL_FROM_GREP",
  "esperimenti_audited": "RUNTIME_FILL",
  "summary": "...",
  "audit_findings": [
    {
      "id": "v2-cap3-esp1",
      "pdf_pages": "45-47",
      "pdf_concept": "...",
      "pdf_components": [...],
      "code_id": "v2-cap3-esp1",
      "code_components": [...],
      "code_title": "...",
      "structural_diff": {
        "title_match": true,
        "components_in_book_missing_in_code": [],
        "components_in_code_missing_in_book": [],
        "order_match": true,
        "variations_collapsed_to_separate_esp": false
      },
      "live_test": {
        "mounted": true,
        "mount_error": null,
        "components_count": 3,
        "wires_count": 2,
        "wires_correct": true,
        "components_correct": true,
        "screenshot": "docs/audits/screenshots/task5-vol2-cap3-esp1.png",
        "screenshot_sha256": "...",
        "live_issue": null
      },
      "figma_alignment": null | {...},
      "severity": "minor|medium|high|critical",
      "notes": "..."
    }
  ],
  "concept_grouping_current": {
    "lessons_count": "RUNTIME_FILL_FROM_LESSON_GROUPS_JS",
    "esperimenti_in_lessons": "RUNTIME_FILL",
    "source": "src/data/lesson-groups.js"
  },
  "concept_grouping_proposed": [
    {
      "concept": "Misura tensione DC",
      "pdf_pages": "45-52",
      "current_lesson_group_id": "...",
      "current_lesson_group_problem": "...",
      "variations": [
        {"raw_id": "v2-cap3-esp1", "pdf_subtitle": "...", "pdf_pages": "..."},
        {"raw_id": "v2-cap3-esp2", "pdf_subtitle": "...", "pdf_pages": "..."}
      ],
      "rationale": "..."
    }
  ],
  "figma_cross_ref": {
    "status": "completed|skipped",
    "reason": "..." (if skipped),
    "findings": [...] (if completed)
  },
  "quality_audit": {
    "score": "...",
    "gate": "PASS|FAIL|WARN",
    "skill_output_raw": "..."
  },
  "cov_log": {
    "iterations": 3,
    "sample_ids": ["v2-cap3-esp1", "v2-cap5-esp2", "v2-capstone-esp1"],
    "divergence_pct": 2.3,
    "pass": true,
    "details": [...]
  },
  "verdetto": {
    "score": "RUNTIME_FILL_FROM_QUALITY_GATE_SKILL",
    "giudizio": "...",
    "top_fix": ["...", "...", "..."]
  }
}
```

**Note on `RUNTIME_FILL_*` markers**: NOT TBD/placeholder. They mark fields filled at runtime via measurement (grep count, skill output, file read). Spec is complete; values get written via tools during execution per "non inventare nulla" mandate sezione 11.

## 7. Error Handling

10 failure modes con mitigations:

**E1 — Maker-1/2 BG agent org limit fail mid-task**
- Symptom: agent returns "You've hit your org's monthly usage limit" (Pattern S iter 38 PM precedent)
- Mitigation: file-system verify `automa/state/maker{1,2}-vol2-*-audit.md` partial output + flag `audit_findings[].partial_data: true` + reason. NO inline retry (org-wide).

**E2 — PDF parse fail (pdftotext error / OCR-only image PDF)**
- Symptom: pdftotext exits non-zero OR output empty
- Mitigation: fallback `Read` tool with `pages:` param. Still fails → `pdf_extract_failed: true` per esperimento, skip + document gap.

**E3 — Control Chrome browser tab dies / Chrome MCP not connected**
- Symptom: `tabs_context_mcp` empty/error
- Mitigation: prompt user reconnect. Still down → degrade Phase 2 a "static-only audit", flag `live_test: { status: "degraded", reason: "control_chrome_unavailable" }`.

**E4 — `__ELAB_API.mountExperiment(id)` fail**
- Symptom: console error / mount false / circuit empty
- Sprint U Cycle 1 precedent: v3-cap7-mini + v3-cap8-serial richiedono `#lavagna` route NOT `#tutor`
- Mitigation: try fallback nav `#lavagna` then re-mount. Still fails → `mounted: false` + `mount_error: "..."` + screenshot error state + continue next esperimento.

**E5 — Screenshot capture fail**
- Symptom: tool errors OR image 0 bytes
- Mitigation: fallback inject html2canvas via `execute_javascript` OR record `document.documentElement.outerHTML` text snapshot. Worst case `screenshot: null, reason: "capture_failed"`.

**E6 — Figma MCP no file ID / unauthorized**
- Symptom: `get_design_context` empty/auth error
- Mitigation: skip Phase 3 Figma part graceful → `figma_cross_ref: { status: "skipped", reason: "..." }`. Phase 3 still produces `concept_grouping_proposed[]` from PDF reasoning.

**E7 — Vitest baseline DROPS post-audit**
- Symptom: vitest count <baseline Phase 0
- Mitigation: `git stash && npx vitest run` per CLAUDE.md mandate. Passes after stash → audit work problem (shouldn't happen, audit is automa/+docs/ only). REVERT IMMEDIATE.

**E8 — `experiments-vol2.js` count != 27 declared CLAUDE.md**
- Symptom: real array length diverges
- Mitigation: STOP plan immediato. Update count + flag CLAUDE.md drift. Adjust Phase 1 scope. Document drift in audit.

**E9 — pdftotext page numbers shift vs PDF reader**
- Symptom: cited page X JSON doesn't match book
- Mitigation: Maker-1+2 use page RANGES not single pages + cross-check chapter heading text match. CoV Phase 4 verifies sample first ~100 chars chapter vs claimed page.

**E10 — Pattern S filesystem barrier missing**
- Symptom: no `automa/team-state/messages/maker{1,2}-vol2-phase1-completed.md`
- Mitigation: orchestrator verify file existence + content via `Bash ls + cat` before Phase 2 spawn. Missing → file-system verify deliverable directly + author completion msg on behalf (Pattern S iter 38 PM precedent).

**Halt conditions** (stop full plan):
- E1 BOTH Maker-1+2 fail completely (no partial output) → halt, defer next session
- E3 Control Chrome unrecoverable AND live test mandatory → ask Andrea
- E7 vitest baseline regression irrecoverabile → halt + git revert + diagnose
- E8 count drift severo → halt, scope review

**Acceptable degradations** (continue, flag gap):
- E2 1-3 esperimenti PDF unreadable → skip + reason field
- E4 1-3 esperimenti mount fail → record + screenshot error state + continue
- E5 occasional screenshot fail → text-only fallback (DOM state)
- E6 Figma unavailable → skip Phase 3 Figma part
- E9 page shift ±2 pagine → use ranges, accept

## 8. Time Budget & Resource

| Phase | Time | Token est | Tool calls est |
|-------|------|-----------|----------------|
| 0 Pre-flight | 5 min | 5k | 8 |
| 1 PDF parallel | 30 min | 40k (BG agents) | 30 |
| 2 Live test inline | 45 min | 30k | 200 (27 esp × ~7 calls) |
| 3 Figma + grouping | 20 min | 15k | 20 |
| 4 Consolidation + CoV | 15 min | 20k | 25 |
| **Total** | **~115 min** | **~110k** | **~280** |

Risk mitigation token budget: dispatch BG agents EARLY when fresh context, inline work later.

## 9. Deliverables (final list)

1. `automa/state/task5-volumi-vol2.json` — MAIN deliverable
2. `docs/audits/2026-05-07-task5-volumi-vol2-audit.md` — narrative report
3. `automa/state/maker1-vol2-ch3-4-audit.md` — raw Phase 1 Maker-1
4. `automa/state/maker2-vol2-ch5-capstone-audit.md` — raw Phase 1 Maker-2
5. `automa/state/inline-vol2-functional-test.md` — raw Phase 2
6. `docs/audits/screenshots/task5-vol2-{id}.png` × ~24-27 — live evidence
7. `automa/team-state/messages/maker{1,2}-vol2-phase1-completed.md` — Pattern S barrier
8. `automa/state/task5-vol2-baseline.txt` — vitest baseline reference

## 10. Success Definition (binary)

PASS = tutti 7 acceptance criteria sezione 5.3 verificati true.
FAIL = qualunque criterio false → handoff Andrea decision next iter.

## 11. Non-Inventions Mandate

Esplicito (per "non inventare nulla" Andrea iter 21+):
- Tutti dati JSON misurati live (PDF extract, code read, Control Chrome live)
- NO synthesis se PDF illeggibile → flag + skip + reason
- NO score self-attribuiti → solo skill `/elab-quality-gate` output
- NO claim "PASS" senza evidence committed (file, screenshot, tool output)
- NO assumption Figma availability → verify first
- NO assumption `lesson-groups.js` correttezza → audit attivo
- NO conteggi inflazionati → count via `grep|wc` preciso

## 12. Cycle 3 Handoff (out of scope here)

Output principale `task5-volumi-vol2.json` machine-readable per Cycle 3 fix automation:
- Esperimenti `severity: critical|high` → Cycle 3 fix priority
- `concept_grouping_proposed[]` → Cycle 3 `lesson-groups.js` refactor draft (Andrea review mandatory)
- `live_test.live_issue` field → Cycle 3 component/wire fix list

---

**End of design spec**.
