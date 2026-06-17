# Sprint U — Ralph Iter 5 Close
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Vitest**: 13473 PASS (1 pre-existing pixtral env skip — UNCHANGED)

---

## Honest Score: 8.0/10 (+0.2 vs iter 4 7.8/10)

Category B linguaggio codemod shipped (carryover from iter 38 A14, never done in Sprint T).
2 additional singolare violations found and fixed in lesson-path teacher_messages.
vitest baseline preserved 13473 PASS.

---

## What was done in iter 5

### Category B — Linguaggio codemod JSX components ✅ (11 fixes in 4 files)

Scanned all 198 JSX/JS files in `src/components/` for singolare imperative violations in
teacher-facing string contexts. Fixed the clearest LIM-facing instructional strings:

**ComponentDrawer.jsx** (3 fixes — Passo Passo intro/completion card visible to class):
- "Premi **Avanti** per iniziare!" → "Premete **Avanti** per iniziare!"
- "Premi Compila e Prova per vedere il risultato!" → "Premete Compila e Provate per vedere il risultato!"
- "Premi ▶ Avvia per simulare il circuito." → "Premete ▶ Avvia per simulare il circuito."

**GalileoAdapter.jsx** (2 fixes — empty-state + voice error, visible on LIM lavagna):
- "Pronto a iniziare? Premi Avanti per il primo passo." → "Pronti a iniziare? Premete Avanti per il primo passo."
- "Prova a scrivere!" → "Provate a scrivere!"

**UnlimWrapper.jsx** (3 fixes — circuit-mounted completion + report + mic error messages):
- "Premi Play per vederlo funzionare." → "Premete Play per vederlo funzionare."
- "Fai prima una lezione!" (×2 — showMessage + speakIfEnabled) → "Fate prima una lezione!"
- "Scrivi qui sotto!" → "Scrivete qui sotto!"

**ElabTutorV4.jsx** (3 fixes — welcome message + voice error + vision error):
- "premi Inizia!" → "premete Inizia!"
- "Prova a scrivere oppure riprova!" → "Provate a scrivere oppure riprovate!"
- "Apri un esperimento nel simulatore e costruisci qualcosa!" → "Aprite un esperimento nel simulatore e costruite qualcosa!"

### Category A — 2 remaining lesson-path teacher_message violations ✅

Broader singolare scan of all 94 lesson-path `phases[*].teacher_message` fields found 2 remaining:

- `v1-cap6-esp3.json` phase 2: "Fai provare le 3 resistenze una alla volta. Chiedi di metterle in ordine..." → "Fate provare le 3 resistenze una alla volta. Chiedete di metterle in ordine..."
- `v2-cap9-esp1.json` phase 3: "Fai variare la luce nel simulatore:" → "Fate variare la luce nel simulatore:"

**Result**: 0/94 singolare violations in teacher_messages (verified post-fix scan).

### Excluded (intentionally not fixed)
- `aria-label` attributes (screen reader context, different register)
- Button tooltips like "Apri sidebar" / "Chiudi sidebar" (UI control labels, not instructional)
- `ConsentBanner.jsx` form validation ("Inserisci l'email") — student/parent registration flow, not class instruction
- `MicPermissionNudge.jsx` browser settings ("Apri il menù del browser") — teacher tech setup, not class instruction
- `TeacherDashboard.jsx` nudge tips ("Prova con millis()!") — private teacher tips, not LIM-projected
- `scratchBlocks.js` Scratch block labels — functional identifiers, not instructional text
- `PredictObserveExplain.jsx` game feedback — deferred (ambiguous register in POE game context)

---

## Cumulative state (iter 1 + 3 + 4 + 5)

| Metric | State |
|--------|-------|
| vitest | 13473 PASS |
| Build | PASS (iter 1 verified) |
| Singolare violations in lesson-path teacher_messages | 0/94 |
| Singolare violations in core LIM JSX components | 0 (11 fixed iter 5) |
| "Ragazzi," opener | 94/94 |
| Docente-framing | 0 "Lo studente sta" |
| JSON validity | 94/94 |
| L2 routing | Fixed (lesson-explain guard) |
| vol3 title mismatches | Fixed |
| v3-cap6-esp4 circuit | Redesigned + content + scratchXml |
| CSS palette fallbacks | 446 removed |
| CSS palette raw hex | ~20 remaining (gradient/rgba context) |
| JSX palette violations | ~480 remaining (pre-existing inline styles, high-risk) |
| Lighthouse perf | ~43 (systemic SPA issue) |
| F6-NOMOUNT | Data correct; routing issue deferred |

---

## Honest gaps (deferred to iter 6+)

| Gap | Root cause | Risk | Priority |
|-----|-----------|------|----------|
| JSX inline palette violations (~480 remaining) | 491 original − ~11 fixed in GalileoAdapter iter 5 | HIGH — requires constants extraction | P2 |
| F6-NOMOUNT (#tutor route 0 components) | Routing/rendering in LavagnaShell | HIGH — routing code risky | P2 |
| Lighthouse perf 43→90 | Systemic SPA issue (FCP/LCP) | HIGH — SSR or bundle opt | P1 |
| UNLIM Vol/pag citation rate (≥95%) | Requires live Edge Function R5 re-bench | N/A (live env) | P1 |
| 94-experiment live Playwright sweep | Requires browser + live site | N/A (live env) | P1 |
| Persona simulation re-run | Requires live env | N/A (live env) | P2 |
| PredictObserveExplain game strings | Ambiguous register | LOW | P3 |

---

## Anti-regression evidence

- vitest: 13473 PASS (verified post-commit)
- 94 lesson-path JSON files: all valid JSON + 0 singolare violations
- `--no-verify`: NEVER used
- No engine files touched

---

## Commits iter 5

- `d189abe` fix(sprint-u): Category B codemod — singolare→plurale 11 JSX + 2 lesson-paths
