# Sprint U Cycle 1 Iter 1 — Phase 0 State Map
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Baseline vitest**: 13473 PASS (1 pre-existing env-specific failure: pixtral ELAB_API_KEY set)

---

## 1. Experiment Count Verification

| Volume | experiments-vol*.js | volume-references.js | lesson-paths/*.json | Cross-ref |
|--------|--------------------|--------------------|---------------------|-----------|
| Vol1   | 38                 | 38                 | 38                  | ✅ ALIGNED |
| Vol2   | 27                 | 27                 | 27                  | ✅ ALIGNED |
| Vol3   | 29                 | 29                 | 29                  | ✅ ALIGNED |
| **Total** | **94**          | **94**             | **94**              | ✅ PERFECT |

No missing cross-references. All 94 experiments have: circuit definition + volume reference + lesson-path.

---

## 2. Data Architecture (Important for agents)

Three separate data sources per experiment:

1. **`src/data/experiments-vol*.js`** — Simulator circuit definition
   - `components[]`: array of {type, id, value, color}
   - `connections[]`: array of {from, to, color}  
   - `layout{}`: x/y positions per component
   - `unlimPrompt`: string (CONTEXT for UNLIM Edge Function)
   - `simulationMode`: "circuit" | "arduino" | "scratch"
   - `code`: Arduino sketch (Vol3 Arduino experiments)

2. **`src/data/volume-references.js`** — Book content mapping
   - `bookText`: 1-3 sentences verbatim from physical book
   - `bookInstructions[]`: step-by-step from book
   - `bookQuote`: memorable quote after experiment
   - `bookContext`: narrative position in book

3. **`src/data/lesson-paths/v*-*.json`** — Pedagogical phases
   - `phases[]`: 5 phases (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI)
   - Each phase: `teacher_message`, `teacher_tip`, `class_hook`, `action_tags`, `auto_action`

---

## 3. CRITICAL ISSUE: Linguaggio PRINCIPIO ZERO Violation

### 3.1 unlimPrompts (experiments-vol*.js) — MASSIVA VIOLAZIONE

All 94 experiments have `unlimPrompt` beginning with:
```
"Sei UNLIM, il tutor AI di ELAB. Lo studente sta guardando l'esperimento..."
```

**Problem**: Says "Lo STUDENTE sta guardando" — PRINCIPIO ZERO says gli studenti NON interagiscono con UNLIM direttamente. UNLIM è lo strumento del DOCENTE.

**Required fix**: Change to docente-first framing:
```
"Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento..."
```

Also: `unlimPrompts` say "Spiega in modo semplice... adatte a bambini" — this is addressing a student persona, not helping a teacher explain.

**Fix needed**: 94 unlimPrompts need docente-first rewrite.

### 3.2 lesson-path teacher_messages — VIOLAZIONE LINGUAGGIO

Scan results:
- **78/94** lesson-paths have singolare imperative violations (fai/clicca/premi/monta/inserisci/collega)
- **63/94** lesson-paths DON'T contain "Ragazzi" in teacher_messages
- Worst offenders: v1-cap13-esp1, v1-cap13-esp2, v2-cap8-esp1, v2-cap8-esp2 (3 violations each)

**Required**: All teacher_messages should use plurale docente-first:
- ❌ "Collega il resistore alla breadboard"
- ✅ "Ragazzi, ora colleghiamo il resistore alla breadboard"

This is the **codemod 200 violations** from Andrea iter 21 mandate. Sprint U Cycle 3 Fix-orchestrator will apply batch fix.

---

## 4. Modalità 4 Status

All 4 modes implemented in `LavagnaShell.jsx`:
- **Percorso** (default): `useState(() => ...)` with localStorage persistence
- **Passo Passo**: Panel shown at `{modalita === 'passo-passo'}`
- **Già Montato**: Sets circuit to final_assembled_state
- **Libero**: clearCircuit + persistent canvas

clearCircuit: `_simulatorRef?.clearAll?.()` — simple delegate, correctness to verify live.

All lesson-paths support `"modes_supported": ["percorso", "passo-passo", "gia-montato", "libero"]` (verified in template).

---

## 5. Volume References Completeness

All 94 entries in `volume-references.js` have:
- `bookText`: ✅ ALL (94/94 — confirmed CLAUDE.md "94/94 enriched iter 37")
- `bookInstructions[]`: ✅ most
- `bookQuote`: ✅ most
- `bookContext`: ✅ most

---

## 6. Phase 0 Audit Findings Summary

### Priority P0 (Sprint U Cycle 3 Fix):
1. **94 unlimPrompts**: Change "Lo studente sta guardando" → "Il docente mostra alla classe" (PRINCIPIO ZERO violation)
2. **78/94 teacher_messages**: Remove singolare imperatives → plural docente-first (linguaggio codemod)
3. **63/94 teacher_messages**: Add "Ragazzi," opener where missing

### Priority P1 (Cycle 3 Fix):
4. Circuit quality audit: See Audit-1+Audit-2 agent outputs (components/connections correctness)
5. Modalità Libero clearCircuit live test: Verify zero residual components

### Priority P2 (Cycle 3 if time):
6. Design palette violations: See DesignCritique agent output
7. UNLIM quality per experiment: See UNLIMVerify agent output

---

## 7. Next Steps

Waiting for 7/7 Cycle 1 agent completion messages:
- audit1, audit2, livetest1, livetest2, unlimverify, persona, designcritique

After 7/7 completion → Cycle 2 (4 merge agents) → Cycle 3 (2 fix agents: linguaggio codemod + verify)

---

## 8. Files for Agents Reference

| File | Purpose | Lines |
|------|---------|-------|
| `src/data/experiments-vol1.js` | Vol1 38 experiments (circuit + unlimPrompt) | ~1000 |
| `src/data/experiments-vol2.js` | Vol2 27 experiments | ~800 |
| `src/data/experiments-vol3.js` | Vol3 29 experiments (Arduino+Scratch+circuit) | ~900 |
| `src/data/volume-references.js` | 94 bookText entries | ~1280 |
| `src/data/lesson-paths/v*-*.json` | 94 pedagogical phase files | 5-50 lines each |
| `/tmp/vol1.txt` | PDF text Vol1 extracted (pdftotext) | 2622 lines |
| `/tmp/vol2.txt` | PDF text Vol2 extracted | 3004 lines |
| `/tmp/vol3.txt` | PDF text Vol3 extracted | 2067 lines |
