# Sprint U Cycle 2 — Handoff from Cycle 1
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Vitest baseline**: 13473 PASS (Mac Mini env, 1 pre-existing pixtral env failure)
**Source of truth**: `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md`

---

## Cycle 1 Top Findings (3 bullets)

1. **BLOCKER — L2 template routing serves LED blink for ALL 94 experiments**: `selectTemplate()` in `clawbot-template-router.ts` has a catch-all that returns `L2-explain-led-blink` for every `lesson-explain` category query regardless of `experimentId`. 100% of tested experiments (20/20) receive identical wrong content. Fix required before any meaningful UNLIM quality measurement is possible.

2. **73/94 lesson-path JSONs have singolare imperative violations**: Dominant pattern is `"Premi Play e osserva cosa succede."` in OSSERVA teacher_message (appears in ~50 files). Additional patterns: `fai/clicca/inserisci/collega` singolare imperatives. These are the messages teachers read aloud during lessons — PRINCIPIO ZERO linguaggio broken for 78% of experiments.

3. **Lighthouse perf=43 and 833 palette hex violations**: `react-pdf` (407KB) and `mammoth` (70KB) are eager-loaded on every page, blocking initial render. This is a separate codebase issue not related to experiment data. Palette CSS variable system exists (`--elab-*`) but 833 components bypass it with raw hex values.

---

## Cycle 2 Scope: 4 Agents

### Agent 1 — Audit-merge (Scribe-class agent)
**Task**: Synthesize all Cycle 1 static audit findings into a machine-readable findings JSON.
**Input**: `docs/audits/sprint-u-cycle1-iter1-audit-vol1-vol2.md` + `sprint-u-cycle1-iter1-audit-vol3.md` + this consolidated audit
**Output**: `automa/state/sprint-u-findings.json` — structured list of all violations with IDs, severity, fix category
**No src/ changes**

### Agent 2 — LiveTest-merge (LiveTest-class agent)
**Task**: Execute the full 94-experiment Playwright specs created in Cycle 1.
**Input**: `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js` + `tests/e2e/sprint-u-cycle1-iter1-vol3-full.spec.js`
**Config**: `tests/e2e/sprint-u.config.js` — prod target `https://www.elabtutor.school`, auth bypass via `tests/e2e/helpers/sprint-u-auth.js`
**Recommended route**: Use `#lavagna` route for Vol3 AVR experiments (v3-cap7-mini + v3-cap8-serial showed 0 components on `#tutor` route — hypothesis is they require ExperimentPicker init on `#lavagna`)
**Output**: Full JSONL + summary JSON in `docs/audits/sprint-u-cycle1-iter1-livetest-vol1-vol2-full.json` + `vol3-full.json`
**No src/ changes**

### Agent 3 — UNLIMFix (Maker-class agent)
**Task**: Fix L2 template routing catch-all + fix vol/pag citation format in L2 templates.
**Files to modify**:
1. `scripts/openclaw/clawbot-template-router.ts` — fix `selectTemplate()` fall-through
2. `scripts/openclaw/clawbot-templates.ts` — fix citation format in L2-explain-led-blink template
**See exact code fix §4 below**
**Anti-regression**: Run `npx vitest run -c vitest.openclaw.config.ts` before and after. Run `npx vitest run tests/unit/` before and after. Zero regression tolerance.

### Agent 4 — Codemod (Maker-class agent)
**Task**: Apply batch linguaggio fix to lesson-path JSON files.
**Files to modify**: ~73 JSON files in `src/data/lesson-paths/`
**See codemod commands §5 below**
**Anti-regression**: Vitest does NOT cover lesson-path JSON files directly. Run `node scripts/validate-lesson-paths.js` if it exists, else grep verify post-codemod.

---

## Section 4 — Exact Code Fix: L2 Template Routing

### Current behavior (broken)

In `scripts/openclaw/clawbot-template-router.ts`, the `selectTemplate()` function likely looks like:

```typescript
// CURRENT (broken) — pseudocode based on observed behavior
export function selectTemplate(category: string, experimentId?: string): string | null {
  if (category === 'lesson-explain') {
    // All lesson-explain requests hit this — returns LED blink for EVERYTHING
    return 'L2-explain-led-blink';
  }
  // ... other categories
  return null;
}
```

### Required fix

The `selectTemplate()` function must check if a specific template exists for the given `experimentId` FIRST, and only fall back to a generic template (or `null` to trigger LLM) if no specific mapping exists:

```typescript
// FIXED — template router with experiment-specific mapping
const EXPERIMENT_TEMPLATE_MAP: Record<string, string> = {
  'v1-cap6-esp1': 'L2-explain-led-blink',
  'v1-cap6-esp2': 'L2-explain-led-blink',
  // Add entries for experiments that have specific templates
  // All others fall through to LLM
};

export function selectTemplate(category: string, experimentId?: string): string | null {
  if (category === 'lesson-explain') {
    if (experimentId && EXPERIMENT_TEMPLATE_MAP[experimentId]) {
      // Only serve template if explicitly mapped
      return EXPERIMENT_TEMPLATE_MAP[experimentId];
    }
    // No specific template → fall through to LLM (return null = use callLLM)
    return null;
  }
  // ... other categories
  return null;
}
```

**Key principle**: Returning `null` from `selectTemplate` must cause `executeTemplate` / the dispatcher to fall through to `callLLM()`. Verify this is the case in `unlim-chat/index.ts` step 5 (pre-LLM L2 check block). If `null` does not trigger LLM fallback, add the fallback branch.

### Vol/pag citation fix in template

In `scripts/openclaw/clawbot-templates.ts`, find the `L2-explain-led-blink` template's response text. The current citation is:

```
Vol.1 pag. '{{RAG_CHUNK_TEXT}}'
```

Replace with:

```
Vol.{{VOLUME_NUM}} pag. {{PAGE_NUMBER}}
```

Where `VOLUME_NUM` and `PAGE_NUMBER` are extracted from the RAG chunk metadata fields:
- `rag_chunks.volume_id` → volume number
- `rag_chunks.page_number` → integer page number

If the template engine does not currently pass these metadata fields, the fix must also update `executeTemplate()` to pass chunk metadata through the template variables.

---

## Section 5 — Exact Codemod Commands: Linguaggio Fix

The codemod targets all JSON files in `src/data/lesson-paths/`. These commands must be run from the project root.

### Primary fix — "Premi Play" (appears in ~50 files)

```bash
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Premi Play/Premete Play/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/premi Play/premete Play/g' {} \;
```

### Additional singolare → plurale mappings

```bash
# Direct imperative singolare → plurale
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Premi il pulsante/Premete il pulsante/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Clicca su/Cliccate su/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Clicca il/Cliccate il/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Fai clic/Fate clic/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Inserisci /Inserite /g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Collega /Collegate /g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Monta /Montate /g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Collega il/Collegate il/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Collega la/Collegate la/g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Guarda /Guardate /g' {} \;
find src/data/lesson-paths -name "*.json" -exec sed -i '' 's/Osserva /Osservate /g' {} \;
```

**Note on "osserva"**: `"osserva cosa succede"` → `"osservate cosa succede"` is safe as a batch replace in teacher_message context, but verify it does not accidentally transform phrases where "osserva" is used as a noun or in description contexts. Run a grep verification:

```bash
# Verify after codemod — check for remaining violations
grep -rn '"Premi\|"Clicca\|"Collega\|"Inserisci\|"Monta\|"Fai ' src/data/lesson-paths/ | grep -v "Premete\|Cliccate\|Collegate\|Inserite\|Montate"
```

### docente-framing fix for unlimPrompts (in experiments-vol*.js)

The "Lo studente sta guardando" → "Il docente sta mostrando alla classe" fix requires editing three files:
- `src/data/experiments-vol1.js`
- `src/data/experiments-vol2.js`
- `src/data/experiments-vol3.js`

```bash
# Run from project root
sed -i '' 's/Lo studente sta guardando l'\''esperimento/Il docente sta mostrando alla classe l'\''esperimento/g' \
  src/data/experiments-vol1.js \
  src/data/experiments-vol2.js \
  src/data/experiments-vol3.js

# Verify
grep -c "Lo studente sta" src/data/experiments-vol{1,2,3}.js  # should all be 0
grep -c "Il docente sta mostrando" src/data/experiments-vol{1,2,3}.js  # should sum to 94
```

**Additional unlimPrompt fix** — change "Spiega in modo semplice...adatte a bambini" framing to docente-first:
```bash
sed -i '' 's/Spiega al docente in modo semplice,/Aiuta il docente a spiegare alla classe,/g' \
  src/data/experiments-vol1.js \
  src/data/experiments-vol2.js \
  src/data/experiments-vol3.js
```

---

## Cycle 3 Verifier Scope

After Cycle 2 agents complete, Cycle 3 verifiers confirm the fixes held:

### UNLIMVerify-2
Re-run the 20-experiment matrix from Cycle 1 (same IDs, same Edge Function endpoint).
**Pass gates**:
- Template diversity: ≥2 distinct `template_id` values across 20 responses (was 1/20)
- vol/pag strict citation: ≥15/20 (was 0/20)
- Experiment-specific content: ≥10/20 different response bodies (was 1/20)
- plurale_ragazzi: maintain 20/20 (was 20/20)
- brevita ≤80w: maintain 20/20 (was 20/20)

### LinguaggioVerify
Grep-based verification across all 94 lesson-path JSONs.
**Pass gates**:
- Zero remaining `"Premi Play"` occurrences
- Zero remaining singolare imperative patterns in teacher_message
- "Ragazzi" presence in teacher_message: ≥50/94 (stretch: ≥85/94)
- `grep -c "Il docente sta mostrando" src/data/experiments-vol{1,2,3}.js` = 94 total

### PersonaVerify (NEW — da simulazione Persona offline Cycle 1)
Re-run 20 scenari selezionati dalla simulazione Persona (5 per persona) post-fix Cycle 2.
**Pass gates**:
- Score comprehensibility ≥6.0/10 media globale (pre-fix 4.35/10)
- P1 Maria Percorso score ≥5.5/10 (pre-fix 3.6/10)
- P4 Marco Percorso score ≥4.0/10 (pre-fix 2.4/10)
- F6-NOMOUNT risolto: v3-cap7-mini + v3-cap8-serial mostrano componenti
- F8-TITLEDUP risolto: zero confusion points su title mismatch in test scenari P4

---

## Cycle 3 UX Fix Priorities (da Simulazione Persona — Fix-Orchestrator)

Le seguenti fix sono state identificate dalla simulazione persona offline e NON erano in scope
Cycle 2. Fix-Orchestrator Cycle 3 deve valutare se includere queste nel batch Cycle 3:

### UX-01 — P4 Onboarding Quick-Start (LOW complexity, HIGH impact)
**Source**: P4 Marco score 2.9/10 — zero contesto = zero comprensione
**Fix**: Aggiungere un tooltip/overlay "Benvenuto!" per i nuovi utenti con 3 step:
1. "Scegli un esperimento dalla lista"
2. "UNLIM ti guida — segui i passi"
3. "I ragazzi lavorano sul kit fisico mentre tu proietti"
**File candidato**: `src/components/WelcomePage.jsx` o nuovo `src/components/OnboardingOverlay.jsx`
**Effort**: ~2h (nuovo componente, localStorage hide-after-first)

### UX-02 — Modalità Libero Rinomina (ZERO complexity, MEDIUM impact)
**Source**: P1 Maria + P4 Marco confusi da "Libero" senza contesto
**Fix**: Rinominare "Libero" in "Esplora" o aggiungere sottotitolo "Scegli tu cosa fare"
**File candidato**: `src/data/modalita-config.js` (o dove è definita la label)
**Effort**: 15 min (string change)

### UX-03 — Extra Experiments Label (LOW complexity, LOW impact)
**Source**: P3 Lucia confusa da v3-extra-* non allineati al libro
**Fix**: Aggiungere badge "Extra — non nel volume standard" a v3-extra-lcd-hello, v3-extra-servo-sweep, v3-extra-simon
**File candidato**: `src/data/experiments-vol3.js` (aggiungere campo `isExtra: true`) + UI badge
**Effort**: ~1h

### UX-04 — CORS Error Console Vol3 (MEDIUM complexity, MEDIUM impact)
**Source**: P4 Marco: "C'è scritto errore in rosso — si è rotto qualcosa?"
**Fix**: Aggiungere `Access-Control-Allow-Origin: https://www.elabtutor.school` a n8n Hostinger compile endpoint OR filtrare l'errore CORS dalla console UI del simulatore
**File candidato**: n8n Hostinger config (infra, non src/) OR `src/components/simulator/NewElabSimulator.jsx`
**Effort**: 30 min (infra) o 1h (UI filter)

### UX-05 — v3-cap7-mini + v3-cap8-serial Route Fix (MEDIUM complexity, CRITICAL impact)
**Source**: F6-NOMOUNT = score 1/10 per P3 Lucia — lezione completamente bloccata
**Già in Cycle 2 scope**: LiveTest-2 ha suggerito di testare su #lavagna route
**Cycle 3 verifica**: Confermare che su #lavagna i componenti sono visibili e l'editor AVR funziona.
Se confermato, aggiornare la documentazione experiment (aggiungere `routeHint: "lavagna"` al JSON?).

---

## Anti-Regression Mandate

- **Vitest baseline**: 13473 PASS (Mac Mini env). NO regressions introduced.
- **No engine files touched**: `CircuitSolver.js`, `AVRBridge.js`, `PlacementEngine.js`, `SimulatorCanvas.jsx` — NEVER modified by Cycle 2 agents.
- **No Supabase functions touched**: Edge Functions require separate deploy + Andrea ratify.
- **JSON codemod safety**: Lesson-path JSONs are data files, not code. Codemod cannot break Vitest. Verify JSON validity post-codemod with `node -e "require('./src/data/lesson-paths/v1-cap6-esp1.json')"`.
- **Build check**: `npm run build` must pass before any PR commit.
- **Pre-commit hook**: NEVER use `--no-verify`.

---

## Andrea Action Items Before Cycle 2

None strictly required. The L2 template fix in `clawbot-template-router.ts` is a `scripts/openclaw/` file — outside the guarded engine files. The codemod targets `src/data/lesson-paths/` JSON files only. Both are in the free-work-areas per CLAUDE.md.

Optional Andrea ratify (not blocking Cycle 2 execution):
1. Confirm whether Vol2 Chapter 11 requires simulator coverage (Davide Fagherazzi consultation)
2. Confirm if `v3-cap7-mini` and `v3-cap8-serial` (iter37 new experiments) should be tested via `#lavagna` route only
3. Confirm voice clone fix scope (separate from Cycle 2 linguaggio codemod)

---

*Handoff generated by Scribe agent — Sprint U Cycle 1 Iter 1 — 2026-05-01*
