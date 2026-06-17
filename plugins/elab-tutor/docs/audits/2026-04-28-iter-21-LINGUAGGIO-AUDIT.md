# Iter 21 — Audit Linguaggio ELAB Tutor (Principio Zero V3)

**Date**: 2026-04-28
**Mode**: caveman audit, readonly grep, NO compiacenza
**Mandate Andrea iter 18 PM**: linguaggio TUTTO plurale "Ragazzi," + Vol/pag verbatim + percorso/passo-passo target docente-classe
**Score Principio Zero V3**: **2.5/10 ONESTO** (massive non-compliance UI auth/dashboard/privacy + lesson-paths singolare-leak)

---

## 1. Inventario file scanned

| Layer | Count |
|---|---|
| `src/components/**/*.jsx` | 154 |
| `src/services/*.js` | 37 |
| `src/data/lesson-paths/*.json` | 94 |
| `supabase/functions/**/*.ts` | 21 |
| `src/data/*.js` (volume-references, lesson-groups, experiments-volN, capitoli, concept-graph, mystery-circuits, poe-challenges, review-circuits, curriculumData, rag-chunks-v2.json) | ~25 |
| **TOTALE file scannati** | **~330** |

Total user-facing message fields (`teacher_message` + `teacher_tip` + `step_corrente` + UI strings): ~1410+ count via grep aggregato.

---

## 2. Imperative singolare violations — TOP 15 worst

Pattern grep: `\b(fai|devi|tuo|tuoi|tua|tue|sei|vai)\b` su components/.

| Rank | File | Count |
|---|---|---|
| 1 | `src/components/common/PrivacyPolicy.jsx` | **15** |
| 2 | `src/components/student/StudentDashboard.jsx` | **13** |
| 3 | `src/components/teacher/TeacherDashboard.jsx` | **12** |
| 4 | `src/components/common/ConsentBanner.jsx` | 8 |
| 5 | `src/components/auth/DataDeletion.jsx` | 7 |
| 6 | `src/components/tutor/PredictObserveExplain.jsx` | 6 |
| 7 | `src/components/tutor/ContextualHints.jsx` | 5 |
| 8 | `src/components/tutor/CircuitDetective.jsx` | 4 |
| 9 | `src/components/report/SessionReportPDF.jsx` | 4 |
| 10 | `src/components/tutor/ElabTutorV4.jsx` | 3 |
| 11 | `src/components/tutor/CircuitReview.jsx` | 3 |
| 12 | `src/components/auth/LoginPage.jsx` | 3 |
| 13 | `src/components/WelcomePage.jsx` | 3 |
| 14 | `src/components/LandingPNRR.jsx` | 3 |
| 15 | `src/components/admin/gestionale/modules/SetupWizard.jsx` | 2 |

### Sample violations (file:line — context — fix suggested)

- `src/components/auth/DataDeletion.jsx:62` — `setError('Inserisci la tua password per confermare');` → "Ragazzi, inserite la password della classe per confermare"
- `src/components/auth/RegisterPage.jsx:119` — `<p>Crea il tuo account ELAB</p>` → "Crea l'account classe ELAB"
- `src/components/common/PrivacyPolicy.jsx:712` — `<h4>La tua Privacy è Importante!</h4>` → "La privacy della classe è importante"
- `src/components/common/PrivacyPolicy.jsx:714` — `proteggiamo i tuoi dati come se fossero tesori` → "proteggiamo i dati della classe come tesori"
- `src/components/common/ConsentBanner.jsx:185` — `chiedi al tuo insegnante` → "chiedete al docente"
- `src/components/student/StudentDashboard.jsx:548` — `placeholder="Scrivi la tua domanda..."` → "Scrivete una domanda della classe..."
- `src/components/tutor/PredictObserveExplain.jsx:122` — `Prima fai la tua previsione` → "Ragazzi, prima fate una previsione"
- `src/components/tutor/CircuitDetective.jsx:145` — `Il tuo compito: trovarlo!` → "Il vostro compito ragazzi: trovarlo!"
- `src/components/tutor/ContextualHints.jsx:23` — `'Il tuo manuale ELAB'` → "Il vostro manuale ELAB"
- `src/components/lavagna/useGalileoChat.js:19` — `'Ciao! Sono UNLIM, il tuo assistente'` → "Ciao Ragazzi! Sono UNLIM, il vostro assistente"
- `src/components/lavagna/useGalileoChat.js:700` — `Dici "inizia" quando sei pronto!` → "Dite 'inizia' quando siete pronti, Ragazzi!"
- `src/components/teacher/TeacherDashboard.jsx:1729` — `'Crea la tua classe'` → "Crea la classe" (docente neutro accettabile)
- `src/components/report/SessionReportPDF.jsx:194` — `La tua avventura con` → "La vostra avventura con" (PDF student facing)
- `src/components/tutor/CircuitReview.jsx:205` — `il tuo compito è rivederlo` → "il vostro compito Ragazzi è rivederlo"
- `src/components/simulator/utils/errorTranslator.js:60` — `Il tuo programma non ha le funzioni setup() e loop()` → "Il programma non ha le funzioni setup() e loop()"

### Pattern verb singolare (grep components services supabase)

- `controlla` (singular) — 4 hit `simulator/utils/errorTranslator.js`+`friendlyError.js` (acceptable error-msg neutro, no fix)
- `monta` (singular) — `services/voiceCommands.js:174,184,196,224,236` voice patterns ACCEPTED (regex match user-input)
- `collega` (singular) — `experiments-vol2.js:1566,1568,1643,1659,1769,1995` data layer book steps. Refactor: "Collegate" plurale.
- `premi` — `services/voiceCommands.js` voice patterns OK, `data/experiments-vol3.js:1648` `cosa devi cambiare` SINGULAR.

Cumulato imperative singolare violations: **~150-200 hit unique lines** (components + services + data).

---

## 3. Vol/pag verbatim violations

Format atteso: `Vol.X pag.Y "testo verbatim"`.

### Verbatim presence (positive)

- `src/services/api.js:61,68,80` — `Come dice il libro a pagina 29: "..."` PATTERN OK (single-source canonical example).
- `src/services/bookCitation.js:25` — regex match `pagina 29|pag. 29|Vol. 1|Volume 2|V1P45` PATTERN OK.
- `src/data/volume-references.js` — 92 entries `bookText: "..."` campo dedicato (verificato lines 30,43,52,64,78,89,100,111,122 verbatim). PASS.
- `src/data/experiments-vol3.js:1115,1219,1237,1357` — comments `ALLINEATO al libro Vol3 p.56 ESPERIMENTO 1` + `unlimPrompt: "...pagina 56"` PASS.

### Parafrasi violations (negative — Vol citation senza pag.X)

- `src/data/lesson-paths/v3-extra-simon.json:106` — "PROGETTO FINALE del Volume 3" (NO pag.).
- `src/data/lesson-paths/v2-cap12-esp1.json:8,29,110` — "Volume 2", "Volume 3" senza pagina.
- `src/data/lesson-paths/v1-cap14-esp1.json:117` — "Nel Volume 2 scoprirete..." NO pag.
- `src/data/mystery-circuits.js:31,54,77,102,125,151,176,199,223,246` — `Capitolo X del Volume Y` NO pagina.
- `src/data/poe-challenges.js:8,85,132` — sezioni `Volume 1/2/3` solo header NO pagina.
- `supabase/functions/knowledge-base.json` — 30+ entries `Volume X — Cap Y Esp Z` NO pagina specifica per l'esperimento (canonical citation gap).

**Cumulato**: ~80-100 mention `Volume N` o `Capitolo N` SENZA pagina specifica → parafrasi/riferimento generico, NON verbatim quote.

`bookText` field nei 94 lesson-paths JSON: NESSUN `bookText` campo trovato (vs `volume-references.js` che ce l'ha). Lesson-paths usa `teacher_message` + `teacher_tip` + `class_hook` (non strutturato per Vol/pag verbatim). GAP iter 22+: aggiungere `book_quote: { vol, pag, text_verbatim }` schema.

---

## 4. "Ragazzi," presence missing

Grep `\bRagazzi\b` (case-sensitive):
- **services/data/components/supabase totale**: ~13 hit components + 2 hit data + ~10 services/supabase = ~25 hit totale.
- 21 file lesson-paths su 94 contengono "Ragazzi" — solo `v3-cap5-esp1.json` (1 hit) e `v3-extra-simon.json` (1 hit) verificati.
- **94 lesson-paths × ~15 messaggi medi = ~1410 message fields**, di cui solo ~25-50 contengono "Ragazzi," → **<2% compliance**.

### Sample missing "Ragazzi,"

- `src/components/auth/LoginPage.jsx:91` — "Accedi al tuo laboratorio" → "Ragazzi, accedete al laboratorio"
- `src/components/student/StudentDashboard.jsx:168` — "Inizia la tua avventura!" → "Ragazzi, iniziamo l'avventura!"
- `src/components/lavagna/LavagnaShell.jsx:308` — "Accendi il tuo primo LED" → "Ragazzi, accendiamo il primo LED"
- `src/components/lavagna/useGalileoChat.js:19` — "Ciao! Sono UNLIM, il tuo assistente" → "Ciao Ragazzi! Sono UNLIM, il vostro assistente"
- `src/data/lesson-paths/v2-cap6-esp1.json:93` — "Benvenuti al Volume 2! Iniziamo con qualcosa..." NO "Ragazzi," prefix (acceptable plurale "Benvenuti" + "Iniziamo" plurale OK).

### Positive coverage (Ragazzi,)

- `src/services/unlimProactivity.js:218,223,237,242,254,259,264,273,278` — 9 messaggi nudge UNLIM TUTTI con "Ragazzi," PASS.
- `src/components/lavagna/SessionReportComic.jsx:81` — `<h2>Ragazzi, ecco cosa abbiamo fatto oggi!</h2>` PASS.
- `src/services/api.js:56` — esempio prompt PASS.
- `supabase/functions/_shared/system-prompt.ts:18` — base prompt UNLIM "Ragazzi," PASS LIVE deploy iter 5 P3.

**Score "Ragazzi,"**: positive su ~25-50 / 1410 messaggi = **~2-4% compliance** → 0.2/1.0 box.

---

## 5. Lunghezza risposta UNLIM (>60 parole) violations

Enforcement codificato:
- `src/services/api.js:66` — `'MASSIMO 3 frasi + 1 analogia. Mai superare 60 parole.'` PASS rule esplicita
- `src/services/api.js:656` — `BREVITY_RULE = 'REGOLA: Rispondi in MASSIMO 3 frasi + 1 analogia. Mai superare 60 parole. I tag [AZIONE:...] non contano.'` PASS
- `src/services/capitoloPromptBuilder.js:11,24` — `max 60 parole risposta` PASS
- `supabase/functions/unlim-chat/index.ts:71` — `Cap response to ~60 words (ELAB brevity rule)` PASS LIVE
- `supabase/functions/_shared/system-prompt.ts:25,101` — `MASSIMO 3 frasi + 1 analogia. Mai superare 60 parole.` PASS LIVE
- `supabase/functions/_shared/principio-zero-validator.ts:122` — `suggestion: 'Riduci a max 60 parole + 1 analogia'` PASS runtime validator

Bench R0/R5 measure: 91.80% PASS Edge Function (iter 5 P3 verified). avg words 35 (vs 55 Render legacy).

### Violations (lunghezza)

- `src/data/lesson-paths/v2-cap12-esp1.json:29` `teacher_message` ~150 parole (lezione narrativa, NOT chat UNLIM, accettabile docente legge classe).
- `src/data/lesson-paths/v3-extra-simon.json:106-107` `teacher_message` 60+ parole + `teacher_tip` 80+ parole (classe lettura collettiva, accettabile).

**Distinguish**: regola 60 parole = chat UNLIM runtime, NOT lesson-paths static narrative (lettura docente). 60-word rule LIVE in production prompts (PASS) + measured 91.80% R5 conformità.

**Score**: 0.85/1.0 box (rule encoded + measured PASS, lesson-paths narrative OUT-OF-SCOPE).

---

## 6. Analogia mancante per concetto tecnico

Grep `(come se|simile a|pensate? a|immagina|come un)` in lesson-paths: **183 hit** (positive analogie esplicite).
Grep `analogy|metafora|metaphor` in data: **302 hit** (campo strutturato).

### Positive analogy coverage

- `src/data/concept-graph.js:35` — Resistenza: "Immagina un tubo stretto" PASS
- `src/data/concept-graph.js:59` — `metaphor: 'Come le porte di uscita di un cinema'` PASS
- `src/data/curriculumData.js:130` — Potenziometro: "rubinetto della doccia" PASS
- `supabase/functions/knowledge-base.json` 30+ entries con `analogie adatte a bambini di 8-12 anni` clausola PASS
- `src/data/lesson-paths/v1-cap9-esp2.json:197` — `"analogy": "Come leggere un libro al contrario"` PASS

### Concetti senza analogia esplicita (sample)

- `src/data/experiments-vol2.js:493-494` — Resistori serie: ha analogia ("tre porte strette in fila"). PASS
- `src/data/experiments-vol2.js:2787` — MOSFET: "manopola del volume", "rubinetto". PASS
- LCD, Servo, Simon Says, MOSFET-Vth, INPUT_PULLUP, debounce: verificare iter 22 — alcuni concetti avanzati (PWM, debounce, INPUT_PULLUP) potrebbero mancare analogia esplicita.

**Score**: 0.7/1.0 box (483+ analogy hit verifica positiva, gap concetti PWM/debounce iter 22 audit dedicato).

---

## 7. Modalità Percorso + Passo-Passo language fitness

`src/components/lavagna/` componenti:
- `LavagnaShell.jsx:308` — `Accendi il tuo primo LED` SINGULAR (fix: "Accendiamo il primo LED Ragazzi")
- `useGalileoChat.js:19` — `il tuo assistente` SINGULAR
- `useGalileoChat.js:700` — `quando sei pronto` SINGULAR
- `SessionReportComic.jsx:81` — `Ragazzi, ecco cosa abbiamo fatto` PASS (header report fumetto plurale)

Modalità Percorso = scorrimento occhio docente lettura libro. Test: lesson-paths v3-cap5-esp1 `teacher_message` "Ragazzi, oggi Arduino farà..." + "Guardate la scheda: vedete..." → PASS plurale collettivo, target docente legge classe.

Modalità Passo-Passo build sequential: `experiments-vol2.js:1566,1643,1659,1769,1995` → "Collega l'uscita..." SINGULAR → fix "Collegate" plurale.

**Score**: 0.4/1.0 box (Lavagna shell singular leak + experiments-vol2/3 build steps singular cumulato).

---

## 8. Top 20 file worst — fix list iter 22+ priority ordered

| Rank | File | Violations | Priority |
|---|---|---|---|
| 1 | `src/components/common/PrivacyPolicy.jsx` | 15 (tuo/tua) | P1 user-facing |
| 2 | `src/components/student/StudentDashboard.jsx` | 13 | P0 student-facing |
| 3 | `src/components/teacher/TeacherDashboard.jsx` | 12 | P2 docente-facing OK neutro |
| 4 | `src/components/common/ConsentBanner.jsx` | 8 | P1 GDPR critical |
| 5 | `src/components/auth/DataDeletion.jsx` | 7 | P1 user-facing |
| 6 | `src/components/tutor/PredictObserveExplain.jsx` | 6 | P0 tutor lavagna |
| 7 | `src/components/tutor/ContextualHints.jsx` | 5 | P0 tutor lavagna |
| 8 | `src/components/tutor/CircuitDetective.jsx` | 4 | P0 tutor lavagna |
| 9 | `src/components/report/SessionReportPDF.jsx` | 4 | P1 PDF report |
| 10 | `src/components/tutor/ElabTutorV4.jsx` | 3 | P1 chat overlay |
| 11 | `src/components/tutor/CircuitReview.jsx` | 3 | P0 tutor |
| 12 | `src/components/auth/LoginPage.jsx` | 3 | P1 |
| 13 | `src/components/WelcomePage.jsx` | 3 | P0 entry-point |
| 14 | `src/components/LandingPNRR.jsx` | 3 | P2 marketing |
| 15 | `src/data/lesson-paths/v2-cap8-esp1.json` | 9 (data) | P0 lesson content |
| 16 | `src/data/lesson-paths/v1-cap11-esp2.json` | 8 | P0 |
| 17 | `src/data/lesson-paths/v3-cap7-mini.json` | 7 | P0 |
| 18 | `src/data/lesson-paths/v3-cap6-esp6.json` | 7 | P0 |
| 19 | `src/data/lesson-paths/v1-cap12-esp2.json` | 6 | P0 |
| 20 | `src/data/experiments-vol2.js` (build steps) | ~20 (collega/inserisci) | P0 simulator UX |

---

## 9. Score linguaggio Principio Zero V3 honest

Calcolo box-by-box (10 rule mandate):

| # | Rule | Score | Note |
|---|------|------:|------|
| 1 | Plurale "Ragazzi," | 0.2/1.0 | <2% messaggi UI/data |
| 2 | Vol/pag VERBATIM | 0.5/1.0 | volume-references.js OK, lesson-paths gap |
| 3 | ≤60 parole risposte UNLIM | 0.85/1.0 | LIVE encoded + R5 91.80% |
| 4 | Analogia esplicita | 0.7/1.0 | 483 hit positive |
| 5 | Italian semplice (Flesch ≤8th) | 0.6/1.0 | NOT measured iter 21, infer ~70% lesson-paths |
| 6 | NO volgari NO off-topic | 1.0/1.0 | system-prompt rule LIVE |
| 7 | NO complessità lessicale | 0.5/1.0 | vocabulary forbidden field present lesson-paths, enforce gap |
| 8 | Modalità Percorso (occhio docente) | 0.4/1.0 | Lavagna shell singular leak |
| 9 | Modalità Passo-Passo build seq | 0.3/1.0 | experiments-vol2/3 build steps singular |
| 10 | Onboarding/auth user-facing plurale | 0.0/1.0 | NESSUN auth/dashboard usa "Ragazzi," |

**Subtotal**: 5.05/10. Caveman correction G45 anti-inflation -2.5 (massive UI singular leak privacy/dashboard 1410+ messaggi).

**SCORE FINALE LINGUAGGIO PRINCIPIO ZERO V3**: **2.5/10 ONESTO**.

Compare with overall ELAB benchmark 9.30/10 iter 12 close: **GAP -6.8 punti** linguaggio vs sprint orchestration. Iter 21 mandate critical Andrea: questo è l'asse #1 da chiudere.

---

## 10. Recommendation auto-fix script

### Codemod sed proposed (iter 22 P0)

```bash
# 1. Singular "tuo/tua/tuoi/tue" → "vostro/vostra/vostri/vostre" (Italian agreement)
# DRY-RUN first: grep -rln pattern → review by file
# THEN: per-file context-aware (NO blind sed, perché "tuo padre" valido)

# 2. "fai/devi/sei/vai" singolare → plurale "fate/dovete/siete/andate"
# Context: solo in user-facing strings (NOT in regex pattern matching code)
# Marker: cerca dentro JSX text content + JSON .teacher_message/.teacher_tip/.step_corrente fields

# 3. Add "Ragazzi," prefix where missing
# Heuristic: ogni teacher_message + step_corrente + chat UNLIM message senza "Ragazzi," → prepend
# AVOID: error messages, technical labels, button text

# 4. "controlla/monta/collega/premi/inserisci" singular → "controllate/montate/collegate/premete/inserite"
# Context: experiments-volN.js build steps + lesson-paths phases
```

### Concrete codemod skeleton (ESM Node.js script — proposed `scripts/codemod-linguaggio-plurale.mjs`)

```js
// Input: glob src/data/lesson-paths/*.json + src/data/experiments-vol[123].js
// For each:
//   - Read JSON/JS
//   - Extract message fields (teacher_message, teacher_tip, step_corrente, observe, code, hint, options, explanation)
//   - Apply morphological transforms:
//     - tuo→vostro, tua→vostra, tuoi→vostri, tue→vostre
//     - fai→fate, devi→dovete, sei→siete, vai→andate
//     - controlla→controllate, monta→montate, collega→collegate, premi→premete, inserisci→inserite
//   - PRESERVE: code blocks (between ```...```), regex patterns, valid Italian compound (es. "il tuo padre" → keep)
//   - PREPEND "Ragazzi, " to user-facing messages without it (heuristic: starts with capital + IT verb)
// Output: dry-run diff per file → review Andrea → apply with --write flag
// CoV: vitest 12290 PASS preserved + build PASS + grep delta count
```

### Manual review required (NOT codemod-safe)

- `src/components/common/PrivacyPolicy.jsx` (15 hit) — GDPR legal text, manual rewrite
- `src/components/auth/*.jsx` (auth flow) — context-dependent (utente classe vs docente)
- `src/components/student/StudentDashboard.jsx` (13 hit) — student vs class identity ambiguity
- `src/components/teacher/TeacherDashboard.jsx` — docente neutro accettabile NO fix

### Ordine fix iter 22 (mandate critical Andrea)

1. **P0 (4h iter 22)**: lesson-paths 94 JSON `teacher_message` + `teacher_tip` plurale conversion via codemod + manual QA 5 file random.
2. **P0 (3h)**: experiments-vol2.js + experiments-vol3.js build steps `Collega→Collegate` etc.
3. **P1 (4h iter 23)**: components/tutor 5 file (PredictObserveExplain, ContextualHints, CircuitDetective, CircuitReview, ElabTutorV4) UI strings.
4. **P1 (2h)**: components/lavagna LavagnaShell + useGalileoChat onboarding strings.
5. **P2 (6h iter 24)**: PrivacyPolicy + ConsentBanner + DataDeletion + auth user-facing GDPR rewrite manual.
6. **P2 (2h)**: components/student/StudentDashboard student-vs-class linguaggio review Andrea.
7. **P3 deferred Sprint T**: marketing pages (LandingPNRR + WelcomePage) marketing tone OK (compromesso).

### Vol/pag verbatim schema iter 22+ proposed

Aggiungere a lesson-paths JSON schema (`src/data/lesson-paths/*.json`):

```json
{
  "phases": [{
    "name": "PREPARA",
    "book_quote": {
      "vol": 3,
      "pag": 56,
      "text_verbatim": "Per accendere il LED esterno..."
    },
    "teacher_message": "Ragazzi, ..."
  }]
}
```

Then UI Lavagna `BookQuoteCard.jsx` componente nuovo (iter 23) renderizza inline citation.

### Bench iter 22 close mandate

- Re-run grep singolare count: target -80% violations
- Re-run "Ragazzi," coverage: target >40% messaggi user-facing
- Vol/pag verbatim schema: target 30/94 lesson-paths con `book_quote` field
- Score Principio Zero V3: target **5.0/10** iter 22 close (lift +2.5)
- Iter 23 target: **7.0/10** Principio Zero V3
- Iter 25 target: **9.0/10** matched master ELAB benchmark

---

**End of audit iter 21 — 600 LOC cap respected.**

**Mandate iter 22 Andrea ratify queue**:
1. Approve codemod script proposed §10
2. Approve `book_quote` schema lesson-paths
3. Approve fix priority order (P0 lesson-paths → P0 experiments → P1 tutor UI → P2 GDPR auth)
4. Approve Sprint T budget +24h iter 22-25 dedicato linguaggio
5. NO auto-merge, NO --no-verify, fix per-file con CoV vitest 12290 PASS preserved

**Honesty**: questo audit è readonly grep, NON ha eseguito test funzionali. Il bench R5 91.80% misura UNLIM Edge Function output (LIVE production, system-prompt v3 + post-LLM validator). UI/data layer NON misurato dal bench R5. Iter 22 needs UI-specific automated lint (proposed: `scripts/lint-principio-zero.mjs` ESLint custom rule).
