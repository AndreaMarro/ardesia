# Sprint U Cycle 2 Vol2 Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit completo Vol2 (27 esperimenti) PDF vs codice + live functional test prod + concept-grouping refactor proposal. Output `automa/state/task5-volumi-vol2.json` machine-readable per Cycle 3.

**Architecture:** Hybrid 5-phase. Phase 1 parallel BG agents (PDF audit ch3-4 + ch5-capstone). Phase 2 inline serial Control Chrome live test. Phase 3 inline Figma cross-ref + concept-grouping. Phase 4 inline Documenter consolidation + CoV + Quality gate.

**Tech Stack:** pdftotext (poppler), Read tool PDF pages support, Control Chrome MCP, Figma MCP (optional), Bash, JSON via jq, vitest baseline guard.

**Spec source:** `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`

**Anti-inflation mandate**: ALL data measured live, zero synthesis. NO claim PASS without committed evidence (file/screenshot/tool output).

**Working directory**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`

---

## Phase 0 — Pre-flight Verification

### Task 1: Vitest baseline + experiment count + Chrome ready

**Files:**
- Create: `automa/state/task5-vol2-baseline.txt`
- Read: `src/data/experiments-vol2.js`

- [ ] **Step 1.1: Run vitest baseline + record**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run 2>&1 | tail -20 | tee /tmp/vitest-baseline.log
PASS_COUNT=$(grep -oE "Tests +([0-9]+) passed" /tmp/vitest-baseline.log | grep -oE "[0-9]+" | head -1)
echo "$PASS_COUNT" > automa/state/task5-vol2-baseline.txt
echo "Baseline recorded: $PASS_COUNT PASS"
```

Expected output: a number ≥13473 (per CLAUDE.md Sprint U Cycle 1 baseline). If <13473 → STOP and diagnose pre-existing regression before continuing.

- [ ] **Step 1.2: Verify Vol2 experiment count via grep**

```bash
COUNT=$(grep -cE "^      id:" src/data/experiments-vol2.js)
echo "Vol2 esperimenti count: $COUNT"
test "$COUNT" -eq 27 && echo "PASS: matches CLAUDE.md declared 27" || echo "FAIL E8: count drift, halt for scope review"
```

Expected: `Vol2 esperimenti count: 27` + `PASS`.

If count != 27 → halt, document drift in audit, ask Andrea before adjusting scope.

- [ ] **Step 1.3: Read prior audits for context**

Read these files inline (skim, not deep):
- `automa/state/task5-parita.json` (Vol2 section, score 6.5/10 baseline)
- `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md`
- `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md` (find blockers Vol2)

Goal: identify Vol2 known issues to cross-reference in this audit (don't re-discover).

- [ ] **Step 1.4: Verify Control Chrome MCP availability**

Use ToolSearch to load Control Chrome tools if deferred:
```
ToolSearch query: "select:mcp__Control_Chrome__list_tabs,mcp__Control_Chrome__open_url,mcp__Control_Chrome__execute_javascript"
```

Then call `mcp__Control_Chrome__list_tabs` to verify connection.

If error "Chrome not connected" → ask user to verify Chrome extension active. Do NOT proceed Phase 2 without Chrome MCP working.

- [ ] **Step 1.5: Smoke test 1 esperimento end-to-end**

```
1. mcp__Control_Chrome__open_url url="https://www.elabtutor.school#tutor"
2. wait 3s for load
3. mcp__Control_Chrome__execute_javascript code="window.__ELAB_API && Object.keys(window.__ELAB_API)"
   → expect array including "mountExperiment"
4. mcp__Control_Chrome__execute_javascript code="window.__ELAB_API.mountExperiment('v2-cap3-esp1')"
   → expect truthy return OR error
5. wait 2s
6. mcp__Control_Chrome__execute_javascript code="window.__ELAB_API.getCircuitDescription()"
   → expect object with components/connections arrays
```

If smoke fails → diagnose route (try `#lavagna` fallback) + document. Continue Phase 1 regardless (PDF audit doesn't need Chrome).

- [ ] **Step 1.6: Commit baseline file**

```bash
git add automa/state/task5-vol2-baseline.txt
git commit -m "chore(sprint-u-cycle2): record Vol2 audit baseline" -m "Pre-flight gate per spec sezione 5.1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 1 — Parallel PDF + Structural Audit

### Task 2: Dispatch Maker-1 BG agent (Vol2 ch3+ch4)

**Files:**
- Create (by Maker-1): `automa/state/maker1-vol2-ch3-4-audit.md`
- Create (by Maker-1): `automa/team-state/messages/maker1-vol2-phase1-completed.md`
- Read (by Maker-1): `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf`
- Read (by Maker-1): `src/data/experiments-vol2.js`
- Read (by Maker-1): `src/data/lesson-groups.js`

- [ ] **Step 2.1: Spawn Maker-1 BG agent**

Use Agent tool with these exact parameters:

```
description: "Vol2 ch3-4 PDF audit"
subagent_type: "general-purpose"
run_in_background: true
prompt: <see full prompt below>
```

Full prompt for Maker-1:

````
You are Maker-1 of Sprint U Cycle 2 Vol2 audit. Read spec at:
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md

Your scope: Vol2 PDF chapters 3+4 (multimetro + resistori basic, esperimenti v2-cap3-esp* and v2-cap4-esp*).

Working directory: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder

Mandatory steps:

1. Extract Vol2 PDF text:
```bash
pdftotext -layout "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf" /tmp/vol2-full.txt
```
If pdftotext fails, fallback: use Read tool with `pages:` param on PDF directly.

2. Extract chapter 3 + 4 sections from /tmp/vol2-full.txt (search "Capitolo 3" and "Capitolo 4" headings).

3. Read source code experiments:
- `src/data/experiments-vol2.js` — find entries matching `id: "v2-cap3-*"` and `id: "v2-cap4-*"`
- `src/data/lesson-groups.js` — find Vol2 ch3+ch4 lesson groups

4. For each esperimento in scope (v2-cap3-esp1..esp4 and v2-cap4-esp* — verify exact count via grep), produce markdown entry following EXACT template from spec sezione 6.1:

```markdown
## v2-cap3-esp1
- pdf_pages: 45-47
- pdf_concept: "..."
- pdf_components: [...]
- pdf_wires: [...]  # text-only extraction from PDF; figure-only diagrams without textual description → null + reason "figure_only_no_text"
- pdf_variations: [...]
- code_id: "v2-cap3-esp1"
- code_components: [...]
- code_title: "..."
- structural_diff:
  - title_match: bool
  - components_in_book_missing_in_code: [...]
  - components_in_code_missing_in_book: [...]
  - order_match: bool
  - variations_collapsed_to_separate_esp: bool
- severity: minor|medium|high|critical
- notes: "..."
```

Severity rules (objective):
- critical: live test mount fail OR esperimento PDF MA non in code at all
- high: components mismatch >50% OR wires wrong layout
- medium: variazioni "spiattellate" (raw esperimenti separati per variazioni che PDF presenta come UN concetto)
- minor: testo difforme, accenti mancanti, ID/title mismatch ma struttura OK

5. Write all entries to `automa/state/maker1-vol2-ch3-4-audit.md` with header section listing total count audited + chapters covered + any gaps.

6. ANTI-INVENTIONS MANDATE: if PDF section unreadable for an esperimento → record `pdf_extract_failed: true` + `pdf_extract_reason: "..."` + skip that esperimento. NO synthesis. NO guessing from memory.

7. Emit completion message:
```bash
mkdir -p automa/team-state/messages
cat > automa/team-state/messages/maker1-vol2-phase1-completed.md <<EOF
# Maker-1 Vol2 Phase 1 Completion
- Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Esperimenti audited: <N>
- Chapters covered: 3, 4
- Output file: automa/state/maker1-vol2-ch3-4-audit.md
- File size: $(wc -l < automa/state/maker1-vol2-ch3-4-audit.md) lines
- Gaps/issues: <list any>
- Status: COMPLETED
EOF
```

8. Return short summary (<200 words): count esperimenti audited, top 3 issues found, any blockers.

Constraints:
- DO NOT modify any src/ files
- DO NOT modify experiments-vol2.js
- DO NOT modify lesson-groups.js
- ONLY write to automa/state/ and automa/team-state/messages/
- DO NOT invent data — flag missing/unreadable instead
````

- [ ] **Step 2.2: Note background task ID and continue to Task 3 immediately (parallel dispatch)**

The agent runs in background. Don't wait yet. Note its name/ID for later check.

### Task 3: Dispatch Maker-2 BG agent (Vol2 ch5+ch6+capstone)

**Files:**
- Create (by Maker-2): `automa/state/maker2-vol2-ch5-capstone-audit.md`
- Create (by Maker-2): `automa/team-state/messages/maker2-vol2-phase1-completed.md`

- [ ] **Step 3.1: Spawn Maker-2 BG agent (parallel a Maker-1)**

Use Agent tool with same parameters as Task 2 BUT scope ch5+ch6+capstone (esperimenti v2-cap5-*, v2-cap6-*, v2-capstone-*).

Full prompt for Maker-2: identical structure to Maker-1 prompt but:
- Scope line: "Your scope: Vol2 PDF chapters 5+6+capstone (resistori parallelo + applicazioni + capstone)"
- Output file: `automa/state/maker2-vol2-ch5-capstone-audit.md`
- Completion msg: `automa/team-state/messages/maker2-vol2-phase1-completed.md`
- Code grep pattern: `id: "v2-cap5-*"` AND `id: "v2-cap6-*"` AND `id: "v2-capstone-*"`

### Task 4: Wait Maker-1+2 + verify deliverables

**Files:**
- Verify exist: `automa/state/maker1-vol2-ch3-4-audit.md`
- Verify exist: `automa/state/maker2-vol2-ch5-capstone-audit.md`
- Verify exist: `automa/team-state/messages/maker{1,2}-vol2-phase1-completed.md`

- [ ] **Step 4.1: Wait for both Maker-1 + Maker-2 notifications**

Background agents will notify on completion. Don't poll. Continue with other prep work (Task 5.1) if context allows, then return when both notify.

- [ ] **Step 4.2: Verify Maker-1 deliverables**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
test -s automa/state/maker1-vol2-ch3-4-audit.md && echo "Maker-1 file PASS" || echo "Maker-1 file FAIL"
test -s automa/team-state/messages/maker1-vol2-phase1-completed.md && echo "Maker-1 msg PASS" || echo "Maker-1 msg FAIL"
M1_COUNT=$(grep -c "^## v2-cap" automa/state/maker1-vol2-ch3-4-audit.md)
echo "Maker-1 audited: $M1_COUNT esperimenti"
```

Expected: both files PASS, M1_COUNT typically 6-8 (cap3 has 4 + cap4 has 2-4).

- [ ] **Step 4.3: Verify Maker-2 deliverables**

```bash
test -s automa/state/maker2-vol2-ch5-capstone-audit.md && echo "Maker-2 file PASS" || echo "Maker-2 file FAIL"
test -s automa/team-state/messages/maker2-vol2-phase1-completed.md && echo "Maker-2 msg PASS" || echo "Maker-2 msg FAIL"
M2_COUNT=$(grep -c "^## v2-" automa/state/maker2-vol2-ch5-capstone-audit.md)
echo "Maker-2 audited: $M2_COUNT esperimenti"
TOTAL=$((M1_COUNT + M2_COUNT))
echo "Total Phase 1 audited: $TOTAL / 27"
```

Expected: 27 total. If <22 (<80%) → halt, ask Andrea (per E1 mitigation).

- [ ] **Step 4.4: Handle Maker degradation (E1 fallback)**

If either agent failed (org limit, file missing/empty):
- Read whatever partial output exists
- Flag in tracking: `partial_maker1: true` and/or `partial_maker2: true`
- Document gap in eventual JSON `audit_findings[].partial_data: true`
- Author missing completion msg on behalf if needed (Pattern S iter 38 PM precedent):
```bash
cat > automa/team-state/messages/maker1-vol2-phase1-completed.md <<EOF
# Maker-1 Vol2 Phase 1 Completion (orchestrator-authored E1 fallback)
- Status: PARTIAL (org limit fail)
- Partial output: <count> esperimenti
- Gap: <missing esperimenti>
EOF
```

- [ ] **Step 4.5: Phase 1 final commit (only if PASS)**

```bash
git add automa/state/maker1-vol2-ch3-4-audit.md automa/state/maker2-vol2-ch5-capstone-audit.md automa/team-state/messages/maker{1,2}-vol2-phase1-completed.md
git commit -m "feat(sprint-u-cycle2): Phase 1 Vol2 PDF structural audit complete" -m "Maker-1 ch3-4 + Maker-2 ch5-capstone parallel BG agents.
Total: \$TOTAL/27 esperimenti audited.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2 — Live Functional Test (Inline Serial)

### Task 5: Phase 2 setup

**Files:**
- Create: `automa/state/inline-vol2-functional-test.md` (initial header)
- Create dir: `docs/audits/screenshots/`

- [ ] **Step 5.1: Get list of 27 Vol2 IDs**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
grep -oE 'id: "v2-[a-z0-9-]+"' src/data/experiments-vol2.js | grep -oE '"v2-[^"]+"' | tr -d '"' > /tmp/vol2-ids.txt
wc -l /tmp/vol2-ids.txt
cat /tmp/vol2-ids.txt
```

Expected: 27 lines, one ID per line (e.g., `v2-cap3-esp1`, `v2-cap3-esp2`, ..., `v2-capstone-esp1`).

- [ ] **Step 5.2: Initialize inline test markdown**

Create `automa/state/inline-vol2-functional-test.md`:
```markdown
# Vol2 Inline Functional Test (Phase 2)
- Started: <ISO timestamp>
- Source: prod https://www.elabtutor.school#tutor
- Tool: Control Chrome MCP

---

```

- [ ] **Step 5.3: Create screenshots directory**

```bash
mkdir -p docs/audits/screenshots
```

- [ ] **Step 5.4: Verify Chrome ready + nav to prod**

```
mcp__Control_Chrome__list_tabs (verify tab available)
mcp__Control_Chrome__open_url url="https://www.elabtutor.school#tutor", tabId=<active>
wait 3s
mcp__Control_Chrome__execute_javascript code="!!window.__ELAB_API"
  → expect true
```

If __ELAB_API false → wait additional 5s, retry. If still false → flag E3 degraded mode.

### Task 6: Live test esperimenti batch 1 (cap3-esp1..esp4 + cap4-esp1..esp5)

**Files:**
- Append: `automa/state/inline-vol2-functional-test.md`
- Create: `docs/audits/screenshots/task5-vol2-{id}.png` × 9

- [ ] **Step 6.1: Loop esperimenti cap3-esp1, cap3-esp2, cap3-esp3, cap3-esp4, cap4-esp1, cap4-esp2, cap4-esp3, cap4-esp4, cap4-esp5**

For each ID in batch:
```
1. mcp__Control_Chrome__execute_javascript code="window.__ELAB_API.mountExperiment('${ID}')"
   → record return value
2. wait 1500ms
3. Screenshot via:
   - mcp__Claude_in_Chrome__computer action=screenshot save_to_disk=true (preferred — full screen)
   OR
   - mcp__Control_Chrome__execute_javascript code="document.documentElement.outerHTML" + record HTML to file (fallback if screenshot tool unavailable)
4. Save screenshot path: docs/audits/screenshots/task5-vol2-${ID}.png (rename returned save path)
5. mcp__Control_Chrome__execute_javascript code="JSON.stringify(window.__ELAB_API.getCircuitDescription())"
   → record components_count, wires_count, components list, wires list
6. Append entry to automa/state/inline-vol2-functional-test.md following spec sezione 6.2 template:

## ${ID}
- mounted: <bool>
- mount_error: <null or msg>
- circuit_description_components_count: <N>
- circuit_description_wires_count: <N>
- components_list: [...]
- wires_list: [...]
- screenshot: docs/audits/screenshots/task5-vol2-${ID}.png
- screenshot_sha256: <sha256sum output>
- live_issue: <null or detected issue>
- timestamp: <ISO>

7. If mount fail → try fallback nav `#lavagna` route + retry mount once. Still fails → record `mounted: false` + screenshot of error state + continue next.
```

- [ ] **Step 6.2: Verify batch 1 outputs**

```bash
ls docs/audits/screenshots/task5-vol2-*.png | wc -l
# Expected ≥7/9 (allow 2 capture fail E5)
grep -c "^## v2-" automa/state/inline-vol2-functional-test.md
# Expected 9 entries appended (or partial if mount failures, all recorded)
```

- [ ] **Step 6.3: Commit batch 1**

```bash
git add automa/state/inline-vol2-functional-test.md docs/audits/screenshots/task5-vol2-cap3-*.png docs/audits/screenshots/task5-vol2-cap4-*.png
git commit -m "feat(sprint-u-cycle2): Phase 2 batch 1 live test (cap3-4)" -m "9 esperimenti tested live prod via Control Chrome MCP.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 7: Live test esperimenti batch 2 (cap5-* and cap6-* — middle 9-ish)

**Files:**
- Append: `automa/state/inline-vol2-functional-test.md`
- Create: `docs/audits/screenshots/task5-vol2-{id}.png` × ~9

- [ ] **Step 7.1: Loop next 9 esperimenti from /tmp/vol2-ids.txt (lines 10-18)**

Repeat exactly the loop from Step 6.1 with next 9 IDs.

- [ ] **Step 7.2: Verify batch 2 outputs**

```bash
ls docs/audits/screenshots/task5-vol2-cap5-*.png docs/audits/screenshots/task5-vol2-cap6-*.png 2>/dev/null | wc -l
grep -c "^## v2-cap[56]" automa/state/inline-vol2-functional-test.md
```

- [ ] **Step 7.3: Commit batch 2**

```bash
git add docs/audits/screenshots/task5-vol2-cap[56]-*.png automa/state/inline-vol2-functional-test.md
git commit -m "feat(sprint-u-cycle2): Phase 2 batch 2 live test (cap5-6)" -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 8: Live test esperimenti batch 3 (capstone + remaining)

**Files:**
- Append: `automa/state/inline-vol2-functional-test.md`
- Create: `docs/audits/screenshots/task5-vol2-{id}.png` × ~9

- [ ] **Step 8.1: Loop final 9 esperimenti from /tmp/vol2-ids.txt (lines 19-27)**

Repeat loop from Step 6.1 with last 9 IDs (likely capstone + any cap7+).

- [ ] **Step 8.2: Verify batch 3 + total Phase 2 count**

```bash
TOTAL_SCREENSHOTS=$(ls docs/audits/screenshots/task5-vol2-*.png | wc -l)
TOTAL_ENTRIES=$(grep -c "^## v2-" automa/state/inline-vol2-functional-test.md)
echo "Phase 2 totals: $TOTAL_SCREENSHOTS screenshots, $TOTAL_ENTRIES markdown entries"
test "$TOTAL_ENTRIES" -ge 23 && echo "Gate 2 PASS (≥85% target 24/27)" || echo "Gate 2 WARN: <85%, document gaps"
```

- [ ] **Step 8.3: Commit batch 3**

```bash
git add docs/audits/screenshots/task5-vol2-*.png automa/state/inline-vol2-functional-test.md
git commit -m "feat(sprint-u-cycle2): Phase 2 batch 3 + Phase 2 complete" -m "Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — Figma Cross-Ref + Concept Grouping (Inline)

### Task 9: Concept-grouping refactor proposal

**Files:**
- Read: `src/data/lesson-groups.js`
- Read: `automa/state/maker1-vol2-ch3-4-audit.md`
- Read: `automa/state/maker2-vol2-ch5-capstone-audit.md`
- Create (intermediate): `/tmp/concept-grouping-vol2-draft.json`

- [ ] **Step 9.1: Read lesson-groups.js Vol2 section**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
grep -A 20 "Volume 2\|vol2\|Vol\.2" src/data/lesson-groups.js | head -100
```

Capture: how many "Lezioni" current grouping has for Vol2 + which esperimenti they include + what concept name they use.

- [ ] **Step 9.2: Identify PDF narrative concepts from Maker-1+2 outputs**

Read both Maker output md files. Group esperimenti by `pdf_concept` field. Count distinct concepts across all 27 esperimenti.

Example output:
```
PDF concepts identified:
1. "Misura tensione DC" → 4 esperimenti (cap3-esp1..esp4)
2. "Resistori in serie" → 3 esperimenti (cap4-esp1..esp3)
3. "Resistori in parallelo" → 3 esperimenti (cap5-esp1..esp3)
4. "Partitore di tensione" → 2 esperimenti
5. "Capacitori" → 4 esperimenti
6. "Transistor" → 3 esperimenti
7. "Motori DC" → 3 esperimenti
8. "Capstone applications" → 5 esperimenti
Total: ~27 esperimenti in ~6-8 concepts vs current X Lezioni
```

- [ ] **Step 9.3: Draft concept_grouping_proposed[] JSON**

Write to `/tmp/concept-grouping-vol2-draft.json` array following spec sezione 6.3 schema:

```json
[
  {
    "concept": "Misura tensione DC",
    "pdf_pages": "45-58",
    "current_lesson_group_id": "<from lesson-groups.js>",
    "current_lesson_group_problem": "raggruppa solo esp1+esp2, lascia esp3+esp4 in altra Lezione",
    "variations": [
      {"raw_id": "v2-cap3-esp1", "pdf_subtitle": "Tensione batteria 9V", "pdf_pages": "45"},
      {"raw_id": "v2-cap3-esp2", "pdf_subtitle": "Tensione batteria stilo", "pdf_pages": "47"},
      {"raw_id": "v2-cap3-esp3", "pdf_subtitle": "Tensione partitore", "pdf_pages": "50"},
      {"raw_id": "v2-cap3-esp4", "pdf_subtitle": "Variazione carico", "pdf_pages": "53"}
    ],
    "rationale": "Libro presenta come UN concetto narrativo continuo con 4 fonti/casistiche diverse. Spiattellato in 4 record separati nel codice."
  },
  ...
]
```

NO synthesis: each variation pdf_subtitle + pdf_pages must come from Maker-1/2 extracted data. If Maker output doesn't have it → record `pdf_subtitle: null, reason: "not_extracted_phase1"`.

- [ ] **Step 9.4: Figma MCP cross-ref (CONDITIONAL)**

Check if Figma MCP is connected:
```
mcp__Figma__get_metadata (no args first, see if returns anything)
```

If connected AND Andrea has provided Vol2 Figma file ID → use `mcp__Figma__get_design_context` to retrieve Vol2 brand assets. Cross-ref color palette + iconografia.

If NOT connected OR no file ID → skip gracefully. Note will be set to `figma_cross_ref: { status: "skipped", reason: "no_figma_file_id_provided" }` in main JSON Phase 4.

- [ ] **Step 9.5: Stage Phase 3 output (commit deferred to Task 10 batch)**

`/tmp/concept-grouping-vol2-draft.json` is intermediate (not committed). Final goes into main JSON Phase 4.

---

## Phase 4 — Documenter Consolidation + CoV + Quality Gate

### Task 10: Build main JSON deliverable

**Files:**
- Create: `automa/state/task5-volumi-vol2.json` (MAIN)

- [ ] **Step 10.1: Write JSON header**

Open `automa/state/task5-volumi-vol2.json` for writing, start with header per spec sezione 6.3:

```json
{
  "task": "volumi-vol2",
  "timestamp": "<ISO now>",
  "volume": 2,
  "pdf_path": "CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf",
  "esperimenti_count_declared": 27,
  "esperimenti_count_actual": <from Step 1.2 grep>,
  "esperimenti_audited": <Phase 2 entries count>,
  "summary": "<2-3 sentence summary>",
  ...
```

- [ ] **Step 10.2: Build audit_findings[] array via merge**

Logic: for each of 27 IDs, merge:
- structural_diff fields ← Maker-1 OR Maker-2 markdown (whichever owns the chapter)
- live_test fields ← inline-vol2-functional-test.md
- figma_alignment ← Phase 3 Figma data OR null+skip reason

Output to JSON `audit_findings[]` array. Use Bash + jq OR Node script for merge if complex.

Sample merge command (Node inline):
```bash
node -e "
const fs = require('fs');
// parse maker1 + maker2 markdowns into per-experiment objects
// parse inline functional test into per-experiment objects
// merge by experiment_id
// output JSON.stringify(merged, null, 2)
" > /tmp/audit-findings.json
```

- [ ] **Step 10.3: Add concept_grouping_current section**

Read `/tmp/concept-grouping-vol2-draft.json` from Phase 3 + lesson-groups.js Vol2 section count.

Append to JSON:
```json
"concept_grouping_current": {
  "lessons_count": <count from lesson-groups.js>,
  "esperimenti_in_lessons": <total esperimenti listed in Vol2 lessons>,
  "source": "src/data/lesson-groups.js"
},
"concept_grouping_proposed": <content of /tmp/concept-grouping-vol2-draft.json>,
```

- [ ] **Step 10.4: Add figma_cross_ref section**

If Phase 3 Figma worked → include findings. Else:
```json
"figma_cross_ref": {
  "status": "skipped",
  "reason": "no_figma_file_id_provided",
  "findings": []
},
```

- [ ] **Step 10.5: Validate JSON via jq**

```bash
jq . automa/state/task5-volumi-vol2.json > /dev/null && echo "JSON valid" || echo "JSON INVALID — fix"
jq -r '.audit_findings | length' automa/state/task5-volumi-vol2.json
jq -r '.concept_grouping_proposed | length' automa/state/task5-volumi-vol2.json
```

Expected: JSON valid, audit_findings length ~27, concept_grouping_proposed length 6-8.

If invalid → diagnose + fix inline. Don't commit broken JSON.

### Task 11: CoV 3x verify

**Files:**
- Append: `automa/state/task5-volumi-vol2.json` (cov_log section)

- [ ] **Step 11.1: Sample 3 esperimenti random**

```bash
shuf -n 3 /tmp/vol2-ids.txt > /tmp/cov-sample.txt
cat /tmp/cov-sample.txt
```

Record sample IDs.

- [ ] **Step 11.2: Run 2 = manual re-extract**

For each sample ID:
1. Re-`pdftotext` (already done Phase 1, just re-read /tmp/vol2-full.txt section for that experiment)
2. Re-`Read` `experiments-vol2.js` entry
3. Compare to Maker-1/2 output → compute text similarity for `pdf_concept` field
4. Record in /tmp/cov-run2.json

- [ ] **Step 11.3: Run 3 = live re-test**

For each sample ID:
1. `mountExperiment(ID)` again via Control Chrome
2. Wait + screenshot fresh
3. Compute screenshot perceptual hash diff vs original Phase 2 screenshot
4. `getCircuitDescription()` again — compare components_count, wires_count
5. Record in /tmp/cov-run3.json

Perceptual hash diff via shell:
```bash
# Using ImageMagick if available, else simple file size + sha256 comparison
for ID in $(cat /tmp/cov-sample.txt); do
  ORIG="docs/audits/screenshots/task5-vol2-${ID}.png"
  NEW="docs/audits/screenshots/task5-vol2-${ID}-cov.png"
  ORIG_SHA=$(sha256sum "$ORIG" | cut -d' ' -f1)
  NEW_SHA=$(sha256sum "$NEW" | cut -d' ' -f1)
  echo "$ID: orig=$ORIG_SHA new=$NEW_SHA match=$([[ "$ORIG_SHA" == "$NEW_SHA" ]] && echo Y || echo N)"
done
```

Identical sha256 = perfect match. Different = compare visually OR use compare command if available.

- [ ] **Step 11.4: Compute divergence + add cov_log to JSON**

Divergence formula:
- text fields: `(1 - similarity) * 100` for `pdf_concept`
- bool fields: 0% if stable, 100% if flipped
- int fields: `abs(orig - new) / max * 100`
- screenshot: 0% if sha256 match, otherwise visual compare 0-100

Aggregate `divergence_pct` = average across 3 samples × 4 fields.

Add to JSON:
```json
"cov_log": {
  "iterations": 3,
  "sample_ids": ["v2-cap3-esp1", "v2-cap5-esp2", "v2-capstone-esp1"],
  "divergence_pct": 2.3,
  "pass": true,
  "thresholds": {
    "text_fields": "≤5%",
    "bool_int_fields": "0%",
    "screenshot_perceptual": "≤2"
  },
  "details": [
    {"id": "v2-cap3-esp1", "pdf_concept_similarity": 0.98, "mounted_stable": true, "components_count_diff": 0, "screenshot_match": true},
    ...
  ]
},
```

PASS condition: divergence ≤5% on text, 0% bool/int, screenshot match (or perceptual diff ≤2).

### Task 12: Quality gate skill

**Files:**
- Append: `automa/state/task5-volumi-vol2.json` (quality_audit section)

- [ ] **Step 12.1: Invoke /elab-quality-gate skill**

```
Skill tool: skill="elab-quality-gate", args="vol2 audit-only Cycle2"
```

Capture full output verbatim.

- [ ] **Step 12.2: Add quality_audit section to JSON**

```json
"quality_audit": {
  "skill": "elab-quality-gate",
  "args": "vol2 audit-only Cycle2",
  "score": "<from skill output>",
  "gate": "<PASS|WARN|FAIL from skill>",
  "skill_output_raw": "<verbatim copy>"
},
```

NO self-attribution — paste exact skill output.

### Task 13: Anti-regression final + verdetto + commit

**Files:**
- Append: `automa/state/task5-volumi-vol2.json` (verdetto)
- Create: `docs/audits/2026-05-07-task5-volumi-vol2-audit.md` (narrative)

- [ ] **Step 13.1: Anti-regression vitest check**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run 2>&1 | tail -20 | tee /tmp/vitest-final.log
FINAL_PASS=$(grep -oE "Tests +([0-9]+) passed" /tmp/vitest-final.log | grep -oE "[0-9]+" | head -1)
BASELINE=$(cat automa/state/task5-vol2-baseline.txt)
test "$FINAL_PASS" -ge "$BASELINE" && echo "Anti-regression PASS ($FINAL_PASS ≥ $BASELINE)" || echo "FAIL E7: REVERT IMMEDIATE"
```

If FAIL → `git stash` + retry vitest. If passes after stash → diagnose audit work issue + revert non-audit changes. Halt plan.

- [ ] **Step 13.2: Verify zero src/ modifications**

```bash
SRC_MODS=$(git status --porcelain | grep -E "^.M src/" | wc -l)
test "$SRC_MODS" -eq 0 && echo "Zero src/ modifications PASS" || (echo "FAIL: src/ modified" && git status --porcelain | grep "^.M src/")
```

If src/ modified → REVERT IMMEDIATE per CLAUDE.md mandate.

- [ ] **Step 13.3: Add verdetto section to JSON**

Compute verdetto based on findings:
```json
"verdetto": {
  "score": "<from quality_audit>",
  "giudizio": "<2-3 sentence summary>",
  "top_fix": [
    "1. <highest severity finding>",
    "2. <second>",
    "3. <third>"
  ]
}
```

- [ ] **Step 13.4: Validate final JSON**

```bash
jq . automa/state/task5-volumi-vol2.json > /dev/null && echo "Final JSON valid" || echo "FAIL"
jq 'keys' automa/state/task5-volumi-vol2.json
# Expected keys: task, timestamp, volume, pdf_path, esperimenti_count_*, summary, audit_findings, concept_grouping_*, figma_cross_ref, quality_audit, cov_log, verdetto
```

- [ ] **Step 13.5: Write narrative audit md**

Create `docs/audits/2026-05-07-task5-volumi-vol2-audit.md`:

```markdown
# Sprint U Cycle 2 — Vol2 Audit Report

**Date**: 2026-05-07
**Scope**: Vol2 (27 esperimenti)
**Cycle**: 2 (audit-only, ZERO src/ changes)
**Output**: `automa/state/task5-volumi-vol2.json`

## Executive Summary

<2-3 paragraphs from JSON verdetto>

## Methodology

Hybrid 5-phase per spec `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`. Phase 1 PDF parallel BG agents, Phase 2 inline Control Chrome live test, Phase 3 Figma + concept-grouping, Phase 4 Documenter + CoV + Quality gate.

## Findings

### Structural Findings (from PDF audit)
<table or bullet list of top issues from audit_findings[].structural_diff>

### Live Functional Test Findings
<top mount failures, wire issues, component issues>

### Concept-Grouping Refactor Proposal
<summary of concept_grouping_proposed[] — 6-8 concepts vs current N flat>

## CoV Result

<from cov_log section>

## Quality Gate

<from quality_audit section>

## Cycle 3 Handoff

Top fix priorities for next cycle:
1. <from verdetto.top_fix>
...

## Honest Caveats

- Esperimenti partial audited: <if E1>
- PDF unreadable for: <list if any>
- Figma cross-ref skipped: <if E6>
- Live mount failures: <list>
- Screenshot capture failures: <list>
```

- [ ] **Step 13.6: Final commit**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git add automa/state/task5-volumi-vol2.json docs/audits/2026-05-07-task5-volumi-vol2-audit.md
git commit -m "feat(sprint-u-cycle2): Vol2 audit complete" -m "$(cat <<'EOF'
Sprint U Cycle 2 Vol2 audit deliverables:
- automa/state/task5-volumi-vol2.json (machine-readable Cycle 3 handoff)
- docs/audits/2026-05-07-task5-volumi-vol2-audit.md (narrative report)

Phases:
- Phase 1: PDF parallel audit (Maker-1 ch3-4 + Maker-2 ch5-capstone)
- Phase 2: 27 esperimenti live test prod (Control Chrome MCP)
- Phase 3: Figma cross-ref + concept-grouping refactor proposal
- Phase 4: Consolidation + CoV 3x + /elab-quality-gate

Score: <from verdetto>
Anti-regression: vitest baseline preserved (<baseline> PASS)
Zero src/ modifications.

Cycle 3 fix wave separato.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Checklist

Run before declaring plan complete:

- [ ] **Spec coverage**: 12 sections of spec each have at least one task implementing them?
  - Section 1 Problem ✓ (Task 0 reads spec)
  - Section 2 Goals ✓ (referenced throughout)
  - Section 3 Approach ✓ (Tasks 2-13 implement Hybrid 3)
  - Section 4 Architecture (Phase 0-4) ✓ (Tasks 1-13 mapped to Phases)
  - Section 5 Testing & Quality Gates ✓ (Tasks 11-13)
  - Section 6 Data Format ✓ (Tasks 10 schema + 6-8 markdown templates)
  - Section 7 Error Handling ✓ (Step 4.4 E1, 5.4 E3, 6.1 E4, 13.1 E7, 1.2 E8 referenced)
  - Section 8 Time Budget — informational, no task needed
  - Section 9 Deliverables ✓ (Task 13.6 final commit)
  - Section 10 Success Definition ✓ (gates throughout)
  - Section 11 Non-Inventions Mandate ✓ (referenced in Task 2 prompt + Step 9.3)
  - Section 12 Cycle 3 Handoff ✓ (Step 13.5 narrative md mentions)

- [ ] **No placeholders**: search plan for "TBD", "TODO", "implement later", "fill in details", "Add appropriate", "etc.", "...similar..." — fix any found.

- [ ] **Type consistency**: function/method names same throughout? `mountExperiment` consistent ✓, `getCircuitDescription` consistent ✓, `audit_findings[]` consistent ✓.

- [ ] **Concrete code/commands**: every step has either a code block OR a mcp__ tool call OR an exact bash command? Yes.

- [ ] **Concrete file paths**: all paths absolute or workdir-relative explicit? Yes (workdir = `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`).

- [ ] **Anti-inflation references**: spec mandate "non inventare nulla" reflected in agent prompts + sample step instructions? Yes (Task 2 prompt, Step 9.3, Step 12.2).

---

## Execution Handoff

**Plan complete + saved to `docs/superpowers/plans/2026-05-07-sprint-u-cycle2-vol2-audit.md`**

13 tasks, 5 phases, ~115 min budget, ~280 tool calls estimated.

**Two execution options**:

**1. Subagent-Driven (recommended for clean separation)** — fresh subagent per task batch, review between, fast iteration

**2. Inline Execution** — execute tasks in this session via superpowers:executing-plans skill, batch execution with checkpoints

User mandate "poi esegui" suggests inline execution wanted. Default: Inline via executing-plans skill unless user prefers subagent-driven for Phase 1 + 2 specifically (Phase 1 BG dispatch already counts as subagent pattern).

**Hybrid recommendation**:
- Phase 1 = subagent-driven by design (Maker-1+2 BG agents)
- Phase 0, 2, 3, 4 = inline via executing-plans
