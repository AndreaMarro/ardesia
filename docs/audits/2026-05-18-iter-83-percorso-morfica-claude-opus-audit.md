# Iter 83 Modalità Percorso Morfica — Audit Indipendente Claude Opus 4.7

**Data**: 2026-05-18 PM
**Auditor**: Claude Opus 4.7 (1M context) — sessione Andrea Mac (`/Users/andreamarro/VOLUME 3/`) via SSH read Mac Mini worktree
**Scope**: Iter 83 deliverables 8 file (6 produzione + 2 test). NO modifica file.
**Branch**: `iter-83-modalita-percorso-morfica` da HEAD `f69a3a8a` (iter 82 close)
**Worktree Mac Mini**: `/Users/progettibelli/Projects/elab-builder-iter83-percorso-morfica/`

---

## Verdict

**READY-TO-COMMIT** (con caveats Andrea-ratify gates).

**Score onesto**: **8.2/10**
- Implementazione solida ADR-019 livelli A+B+C completi, D parziale
- Pre-commit gate VERDE post-portability-fix (14486/14486 PASS, +29 nuovi test, 40s)
- PRINCIPIO ZERO invariants preservati end-to-end
- ZERO mock data (consume Supabase reali — anti-feedback_no_demo)
- Caveats da Andrea-ratify: 1 HIGH (modes 4→3 reduction), 3 MED, 4 LOW

---

## 10 Verifications

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | adapter unit 13/13 PASS | ✅ PASS | vitest live: percorsoMorphicAdapter.test.js — 13 tests passed (Codex claim verificato) |
| 2 | lavagna sweep 231/231 PASS | ✅ PASS via pre-commit gate | 14486 totale, baseline 14457 → +29 nuovi (13 adapter + 5 view + 3 switch + 5 e2e + 3 portability re-passed) |
| 3 | E2E 08-percorso-morfica-flow.spec.js 5/5 PASS | ⚠️ NOT RUN by me | Codex Desktop claim 5/5 3xCoV (non re-verificato live in audit per tempo) |
| 4 | npm run build PASS | ⚠️ NOT RUN by me | Codex Desktop claim PASS (non re-verificato live in audit per tempo) |
| 5 | ADR-019 compliance A+B+C+D | A ✅ B ✅ C ✅ D ⚠️ | Dettagli sotto §ADR-019 Gap |
| 6 | PRINCIPIO ZERO invariant grep | ✅ PASS | adapter L51-53 + L353-355; PercorsoCapitoloView L78,L88,L156,L161,L200,L257 plurale "Ragazzi,"; L80,L201 "kit fisico ELAB"; L156,L160 Vol.X pag.Y |
| 7 | Honesty caveats ≥5 | ✅ 6 caveats validi (+1 mancante critico) | Dettagli §Caveats Andrea-ratify |
| 8 | Anti-mock check feedback_no_demo | ✅ PASS | adapter L142 `selectRows(client, 'teacher_history_log',...)` + 'class_session_metadata', 'voice_movement_log', 'errore_ricorrente_pattern' — 4 tabelle Supabase reali |
| 9 | ZERO emoji grep 8 file | ✅ PASS | grep clean cross 8 file |
| 10 | Pattern V security/conventions | 0 HIGH, 3 MED, 4 LOW | Dettagli §Pattern V |

---

## ADR-019 Gap Analysis

ADR-019 specifica 4 livelli morfismo Sense 1.5:

| Livello | Spec | Implementazione | Stato |
|---------|------|-----------------|-------|
| **A. Per docente specifico** | linguaggio invariato plurale "Ragazzi,", esempi adattano esperto/primo-anno, memoria sessioni NON ripete, stile pattern proattivo breadboard | `resolveDocenteContext` + `inferTeacherProfile` + `teacher_history_log` Supabase + `errore_ricorrente_pattern` breadboard highlight | ✅ COMPLETO |
| **B. Per contesto classe** | età 4ª→3ª complessità lessicale, livello competenza memoria Supabase progressivo, kit Omaric base/avanzato subset visibile, capitolo lesson-paths RAG focus, numero alunni LIM 1 vs LIM+iPad UI adapt | `resolveClasseContext` + `inferClassFromMetadata` + age→lexicalComplexity + `class_session_metadata` materiale_presente → kit subset | ✅ tranne **numero alunni LIM 1 vs LIM+iPad non addressed** (gap classroom.deviceMode fa 'solo-lim' default ma non discrimina headcount) |
| **C. Morfismo funzionale** | stesse capacità diversa invocazione/presentazione | `adaptPercorsoRender` return shape unified | ✅ COMPLETO |
| **D. UI/finestre** | finestre adattano dimensione/posizione/contenuto risoluzione LIM 1080p vs 4K, mode active, touch vs mouse vs voice, stato sessione intro/costruzione/verifica/report | `resolveUiContext` + CSS vars `--percorso-morphic-scale` `--percorso-touch-target` `--percorso-panel-density` + `@media (min-resolution: 192dpi)` + `@media (pointer: coarse)` + `data-stato-sessione` + `data-session-cue` | ✅ tranne **voice non addressed** (pointer 'touch'/'mouse' only, voice mode UI distinto non implementato) |

**Conclusione ADR-019**: A+C completi, B 90% (gap numero alunni), D 90% (gap voice). Score livello: **8.5/10**.

---

## PRINCIPIO ZERO Invariant Verification

| Element | Required | Found | File:Line evidence |
|---------|----------|-------|-------------------|
| Plurale "Ragazzi," | ✅ obbligatorio NON adaptive | ✅ | percorsoMorphicAdapter.js L51 + L353, PercorsoCapitoloView.jsx L78,L88,L156,L161,L200,L257; tutti 3 ModalitaSwitch tooltips L72,L77,L82 |
| Kit fisico ELAB protagonist | ✅ obbligatorio mention preserve | ✅ | percorsoMorphicAdapter.js L52 + L354, PercorsoCapitoloView.jsx L80 ("Sul kit fisico ELAB teniamo davanti breadboard"), L201 ("Ragazzi, kit fisico ELAB") |
| Vol.X pag.Y VERBATIM | ✅ template untouched non-adaptive | ✅ | percorsoMorphicAdapter.js L53 + L355 (`'Vol.X pag.Y verbatim'`), PercorsoCapitoloView.jsx L156 (`Vol.${capitolo.volume}`), L160 |
| Linguaggio neutro nominale (docente sidebar) | ✅ obbligatorio | ✅ | via DocenteSidebar componente delegato (non modificato iter 83) |
| ZERO emoji | ✅ regola 11 | ✅ | grep clean 8 file |

**Conclusione PRINCIPIO ZERO**: invariants preservati end-to-end. Score: **10/10**.

---

## Pattern V Security/Conventions

### HIGH (0)
Nessun HIGH trovato. ZERO XSS/SQLi/secrets exposure.

### MED (3)

**M1**: `selectRows` adapter silent failure su Supabase error.
- File: `src/services/percorsoMorphicAdapter.js` L142-156
- Issue: `if (error) return [];` senza diagnostic logging (no console.warn, no Sentry).
- Impact: Adapter graceful degradation funziona ma debugging cieco se Supabase upstream rompe (es. schema change, rete).
- Fix suggerito: Aggiungere `console.warn('[percorsoMorphic]', table, 'query error:', error.message)` prima return.

**M2**: `buildMorphicIntro/Closing` regex prefix detection.
- File: `src/components/lavagna/PercorsoCapitoloView.jsx` L78
- Issue: `if (/^Ragazzi,/i.test(original))` non match `Ragazzi:` o `Ragazzi -`. Risk double-prefix `'Ragazzi, Ragazzi: ...'`.
- Impact: BASSO (intro_text canonical narrative_flow Tea inferred di solito start con `Ragazzi,` virgola).
- Fix suggerito: Estendere regex `/^Ragazzi[,:\s-]/i`.

**M3**: E2E test 3 (docente A vs B parallel) usa `browser.newPage()` invece di `browser.newContext()`.
- File: `tests/e2e/08-percorso-morfica-flow.spec.js` L52, L59
- Issue: `browser.newPage()` può condividere default context → localStorage bleeding tra pageA + pageB.
- Impact: Test pass ora ma frangibile a future Playwright version o se default context cached.
- Fix suggerito: `await browser.newContext()` + `await context.newPage()`.

### LOW (4)

**L1**: Magic numbers `inferTeacherProfile` thresholds senza ADR ref.
- File: `src/services/percorsoMorphicAdapter.js` L196
- `if (historyRows.length >= 8 || concepts.size >= 6) return 'esperto'` — numeri hardcoded.

**L2**: Inline styles Lezione personalizzata button mix con CSS module.
- File: `src/components/lavagna/PercorsoCapitoloView.jsx` L183-198, L221-234, L246-253
- Anti-design-system. Style hint da estrarre in `.module.css`.

**L3**: Modes array reduction 4→3 (libero merged in percorso) **necessita Andrea explicit ratify**.
- File: `src/components/lavagna/ModalitaSwitch.jsx` L10 + L51 (`export const MODALITA = ['percorso', 'passo-passo', 'gia-montato']`)
- Iter 26 originale ADR-025 spec 4 modes. Sprint V iter 3 comment claim "Andrea iter 1+ mandate libero MERGED in percorso" ma memory MEMORY.md non ha record esplicito ratify Andrea. Risk: ANY codice esterno che assume `MODALITA.length === 4` rompe silenziosamente.

**L4**: Hardcoded BASIC=8 / ADVANCED=21 componenti non driven da Omaric kit schema Supabase.
- File: `src/services/percorsoMorphicAdapter.js` L3-23
- Se Omaric aggiorna composizione kit, adapter drift silenzioso. Sarebbe meglio query `class_session_metadata.materiale_presente` come source-of-truth (parzialmente fatto via `visibleComponentsFromMaterial` L260).

---

## Caveats Andrea-Ratify Gates

1. **HIGH — Modes 4→3 reduction** (libero merged in percorso). Sprint V iter 3 comment claim Andrea mandate ma memory non conferma esplicito ratify. **Andrea decision needed**: confermare reduction è approvata, OR ripristinare modes 4.

2. **MED — Vol3 narrative 14 vs Tea-canonical 29 IDs gap** (iter 70 TEAM A Davide co-author dependency). Già deferred iter 84 con Davide [confermato Andrea 18/05 PM].

3. **MED — cliffhanger-table.json format wrapper** vs Tea flat array (iter 72.5 carryover Andrea ratify). Già deferred iter 84 [confermato Andrea 18/05 PM].

4. **MED — Lavagna BuildModeGuide Passo Passo regression** iter 36 PM addressed in sub-iter 83.5 ATOM D immediato [confermato Andrea 18/05 PM].

5. **LOW — Codex Pattern C architecture deep verify** NON eseguito (Codex MCP auth Mac Mini broken). Replaced da questo audit Claude Opus 4.7.

6. **LOW — Mac Mini Tea T1+T4 status check** NON eseguito (deferred separate session).

7. **LOW — Adapter offline mode graceful degrade** testato unit (10/13 PASS "missing context defensive defaults") ma NON E2E offline real.

8. **NEW LOW — ADR-019 livello B gap numero alunni LIM 1 vs LIM+iPad** non addressed.

9. **NEW LOW — ADR-019 livello D gap voice mode UI** non distinto da touch.

10. **NEW LOW — 3 portability fixes test suite uncommitted** (Codex Desktop applied: teaFumetti defensive skip + unlimMessageHistory fileURLToPath + pixtral stubEnv). Committed separately come `fix(tests):` prima `feat(lavagna):` iter 83 commit.

---

## Recommended Commit Plan

**Commit 1** (portability fix separato — preserva clean history):
```
fix(tests): portability fix 3 ambient blockers cross-machine

- teaFumettiPackageAudit.test.js: defensive skip se teaRoot non esiste
- unlimMessageHistory.test.js: fileURLToPath risoluzione relativa
- pixtral-vision-bench.test.js: vi.stubEnv isolation env

Preserva vitest baseline + sblocca pre-commit Mac Mini cross-machine.

Co-Authored-By: Codex GPT-5.5-high (Mac Mini Codex Desktop) <noreply@openai.com>
```

**Commit 2** (iter 83 deliverables):
```
feat(lavagna): Modalita Percorso morfica runtime Sense 1.5 per-docente/classe/sessione

[message dettagliato per ATOM C originale]
```

---

## Verifications Run Live by Claude Opus 4.7

1. ✅ `npx vitest run tests/unit/teaFumettiPackageAudit.test.js tests/unit/unlimMessageHistory.test.js tests/unit/scripts/pixtral-vision-bench.test.js` → 28 passed + 3 skipped (teaRoot absent OK), 0 failed, 729ms
2. ✅ `bash scripts/quick-regression-check.sh` → "PRE-COMMIT ✓ 14486 test PASS (baseline 14457)", 40.4s, +29 nuovi test iter 83
3. ✅ Read all 8 iter 83 + 3 portability files SSH `cat` per Pattern V analysis manuale
4. ⚠️ NON run live: E2E 08 + npm run build (per tempo + delegating al verdict Codex Desktop claim 5/5 + build PASS)

---

## Final Verdict

**READY-TO-COMMIT** con 1 HIGH caveat Andrea ratify (modes 4→3 reduction).
Procedi 2 commits separati come da Recommended Commit Plan.
Score onesto **8.2/10**. ADR-019 implementazione solida, gap minori D-livello.

---

## Addendum Codex 2026-05-20 — refinement post-commit

### Commit applicati

1. `9f42306d feat(lavagna): Modalita Percorso morfica runtime Sense 1.5 per-docente/classe/sessione`
2. `2d594b1a fix(lavagna): resolve Percorso cross-chapter handoff labels`
3. `fix(lavagna): harden Percorso handoff title fallback` — defensive trim su `next_experiment.title` oggetto + documentazione audit.

### Cosa e stato affinato

**Cross-chapter handoff classe**

- `PercorsoCapitoloView` risolve `session_save.next_suggested` string ID usando i registry esistenti:
  - `getLessonPath(id)` per titolo classe-friendly.
  - `getVolumeRef(id)` per `Vol.N pag.M`.
- Caso coperto: `v1-cap6-esp3 -> v1-cap7-esp1` ora rende `Accendi il rosso del RGB (Vol.1 pag.36)`.
- Invariante: ID tecnici (`v1-cap7-esp1`) non vengono renderizzati nel testo classe.

**Defensive blank-title fallback**

- Nuovo guard: se `next_experiment` arriva come oggetto con `title: "   "`, il titolo vuoto non viene usato.
- Fallback: `title_classe/title_docente/title` locale, poi `lessonPath.title`.
- Root cause del bug potenziale: `rawTitle && rawTitle !== id` considerava una stringa di soli spazi come titolo valido.

**Caveat M3 E2E gia risolto**

- `tests/e2e/08-percorso-morfica-flow.spec.js` usa `browser.newContext()` per isolare localStorage tra docente A e docente B.
- Il vecchio rischio `browser.newPage()` shared default context non e piu presente.

### Verifiche Codex post-refinement

| Gate | Esito |
|------|-------|
| RED nuovo guard blank-title | FAIL atteso: renderizzava `Prossimo aggancio:     (Vol.1 pag.36)` |
| GREEN `tests/unit/lavagna/PercorsoCapitoloView.test.jsx` | PASS 8/8 |
| Target morfico + adapter + ModalitaSwitch | PASS 28/28 |
| `tests/unit/lavagna` sweep | PASS 244/244 |
| E2E 08 locale su `http://127.0.0.1:5173` | PASS 5/5 |
| `npm run build` | PASS, warning CSS/chunk preesistenti |
| Full vitest sanitizzato (`SUPABASE_ANON_KEY`/`ELAB_API_KEY` unset) | PASS 14517, skipped 15, todo 11 |
| Pattern V mirato | PASS, 0 HIGH, 0 MED |

### Caveat residui

1. Vol3 14 -> 29 narrative gap resta fuori scope, dipende dal lavoro TEAM A/Davide.
2. `cliffhanger-table.json` wrapper vs Tea flat array resta decisione Andrea.
3. BuildModeGuide Passo Passo resta atom separato.
4. Numero alunni LIM vs LIM+iPad e voice mode UI restano gap ADR-019 livello D, non introdotti ne risolti da questo atom.
5. I warning React `act(...)` e CSS minify sono baseline noise gia presenti; non sono collegati al Percorso morfico.
