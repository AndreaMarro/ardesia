# D2-J3B Material Convergence Readiness — audit read-only

> Stato revisionato e data sono in testa a ogni sezione che lo richiede.
> Questo documento NON implementa nulla: decide cosa il prossimo slice
> implementativo deve riusare. Regola: prima riusare, poi adattare, mai
> duplicare una pipeline esistente.

## 1. Exact SHA audited

- `415bc11618bbae71b2fe9dca4870a808abd3a244` (base D2-J3A.1, per i path
  Studio/engine esistenti) + `86cdfe6e` (A2 closure: role identity
  centralizzata in `ensure_concept`) + `3efe9d66` (re-ingest failure-safe,
  branch `fix/d2-j3a-3-reingest-material-readiness`).
- Data audit: 2026-09-18. Nessuna modifica Studio in questa sessione.

## 2. Files read

`apps/studio/src/store/lessonRecap.ts`, `lessonOutcome.ts`,
`recapHtml.ts`, `lessonos/studyDigest.ts`, `RecapView.tsx`;
`packages/engine/lessonos/summarizer.py`, `dispensa.py`, `style.py`,
`teacher_book.py`, `recap_export.py`, `capsule/extraction.py`,
`capsule/assembly.py`, `course/atoms.py`, `course/lineage.py`,
`course/teacher_review.py`, `course/planner.py`, `course/blueprint.py`,
`course/schema.py`, `export/markdown_course.py`, `export/quarto.py`,
`store/base.py`, `store/sqlite.py`, `ingest/bundle.py`,
`models/entities.py`, `asr/adapter.py`, `SCHEMA.md`;
tests: `test_summarizer.py`, `test_dispensa.py`, `test_style.py`,
`test_export_markdown.py`, `test_export_quarto.py`,
`test_course_p0a/b/c.py`, `test_course_planner.py`,
`test_course_lineage.py`, `test_course_teacher_review.py`,
`test_lessonos_snapshot.py`, `test_ingest_bundle.py`,
`apps/studio/src/__tests__/recapHtml.test.ts`.

## 3. Capability matrix (YES / PARTIAL / NO / NOT PROVEN — solo da codice)

| capability | RecapHtml | SummaryPack | DispensaDoc |
|---|---|---|---|
| scope single-lesson | YES (`room`, RecapView) | YES (`lesson_id`) | NO (`teacher_id`) |
| scope cross-lesson/teacher | NO | NO | YES (TeacherBook+resolution) |
| deterministic input projection | PARTIAL (store reads; digest deterministico) | PARTIAL (prompt deterministico, output LLM no) | PARTIAL (idem) |
| LLM required | NO | YES | YES |
| grounding/evidence | PARTIAL (EvidenceRef mostrati, nessun gate) | YES (verbatim gate ≤20% `assert_grounding_threshold`) | YES (`GroundingReport`, dropped paragraphs) |
| lesson activity | YES (journal: elementi/durata) | PARTIAL (solo via testo capsule) | NO |
| math formulas | YES (verbatim `mathFormulas`) | PARTIAL (se nel testo) | NO (`math_density` è metrica di stile, non contenuto) |
| manual pages | YES (`pdfPagesViewed` + evidence digest) | NO | NO |
| concepts | YES (digest) | YES (capsule) | YES (TeacherBook) |
| concept status | NO | NOT PROVEN (status nel prompt, rendering sezioni non verificato) | NOT PROVEN |
| errors | YES (digest) | NO | NO |
| error corrected/unresolved | YES (`corretto`/`da rivedere`) | NO | NO |
| exercise prompt | NO | YES (capped 10) | NOT PROVEN (prompt cita "apri con esercizio svolto": istruzione, non struttura) |
| exercise solution | NO | NO (solo prompt, riga 190) | NO |
| student questions | NO | YES (capped 10) | NOT PROVEN |
| homework | NO | YES (count+list, capped 10) | NOT PROVEN |
| worked derivation | NO | NO | NO |
| drawings/images/SVG | PARTIAL (conteggi tipi) | NO | NO |
| pedagogical style | NO | NO | YES (`StyleProfile`) |
| written style | NO | NO | YES (`WrittenStyleProfile` da corpus dispense) |
| truncation/caps | NO | YES (25/10/30 + 200 segmenti) | YES (`dropped_paragraphs`) |
| human review contract | NO (render diretto) | NO | NO (`TeacherReviewSet` è course-level, non consumato dalla dispensa) |
| artifact lineage | NO | NO (`files` soltanto) | NO (lineage vive negli exporter course) |
| Markdown output | NO (HTML) | YES (`files{lesson.md}`) | YES (`render_dispensa_md`, dispensa.py:715) |
| HTML output | YES | NO | NO |
| Quarto/PDF path | PARTIAL (print browser; niente .qmd) | NO | NO (quarto exporter vuole blueprint; runtime quarto assente sulla macchina) |
| ability to reopen | PARTIAL (re-render statico) | YES (file) | YES (file) |
| PII assumptions | ZERO PII (documentato nel modulo) | NOT PROVEN (capsule senza studentId; digest non incluso) | NOT PROVEN (corpus docente proprio) |
| known information loss | digest-null → niente sezioni (by design) | caps + solution drop + no errors | aggregazione teacher-level |
| tests proving the claim | recapHtml.test.ts | test_summarizer.py | test_dispensa.py + test_style.py |

## 4. Exact information-loss map

- `ExerciseExtraction.solution`: estratta nella capsule, persa in
  `capsule_to_atoms` (solo `prompt`) e nel summary prompt (solo prompt,
  riga 190). LOSS BUG non classificato — richiede decisione, non fix
  opportunistico qui.
- Errori/correzioni/eventi LessonOS: assenti da capsule/atoms/summary/
  dispensa/exporters (solo Studio digest). È il gap che D2-J3A ha
  iniziato a chiudere lato dati.
- Caps summary: 25 concetti / 10 item / 30 timeline / 200 segmenti —
  INTENZIONALI (bounding prompt, anti-confetti).
- Disegni lavagna: solo testo arriva ai segmenti (design T8).
- Formule: solo come testo; nessuna entità formula in nessun percorso.
- Board/audio→ASR non wired; ASR+board coniano entrambi `<lesson>#sN`
  da contatori locali e `ingest_asr_jsonl` non fa purge → collisione
  LATENTE (oggi irraggiungibile, nessuna dual-ingest in produzione).

## 5. RecapHtml findings

- Unico consumer production: RecapView; input unico LessonOutcome
  (boundary D1). Puro, deterministico, XSS-escaped, print CSS.
- Porta error/correzioni/formule/pagine: è OGGI la superficie materiale
  più completa per la singola lezione. Limite: niente sintesi LLM,
  niente cross-lezione, niente PDF nativo (solo print browser).

## 6. SummaryPack findings

- Il percorso Capsule→materiale umano PIÙ CORTO esistente, già wired in
  `bin/ingest-bundle.sh` → `derived/wiki/<lesson>.md`, grounded e gated.
- Limiti: niente errori/correzioni/soluzioni; output solo su disco Mini
  (nessun ponte verso Studio); richiede chiamata LLM per ogni lezione.

## 7. DispensaDoc findings

- Teacher/path-oriented (`teacher_id` + style + resolution): NON
  utilizzabile così com'è per una singola lezione appena conclusa senza
  bootstrap di profilo e corpus.
- NON vede: solution, errori StudyDigest, formule come entità, disegni,
  pagine manuale. Ha markdown renderer proprio (`render_dispensa_md`).
- Da NON sopravvalutare: il candidato più vicino al "materiale
  editoriale completo" per forma, il più lontano per input single-lesson.

## 8. Supporting primitives (valutazione riuso per J3B)

- `TeacherReviewSet`: KEEP FOR LATER (human-review course-level; J3B
  single-lesson non lo richiede).
- `GeneratedArtifact`: REUSE AFTER ADAPTER (record lineage già corretto;
  utile quando J3B produrrà file, non prima).
- Quarto exporter: KEEP FOR LATER (vuole blueprint course-level +
  runtime assente).
- Markdown exporter: REUSE AFTER ADAPTER (vuole CourseBlueprint; vedi
  sotto la slice minima).
- `WrittenStyleProfile`: DO NOT USE FOR J3B (stile docente da corpus:
  fuori scala per una lezione).

## 9. Contradictions in old docs

- `docs/PRODUCT-CANON.md` dichiara la route study-pack `/v1/saved-lessons`
  ESISTENTE/PARTIAL: nel monorepo non esiste implementazione (solo docs).
  Non costruirci sopra. Nessuna riscrittura docs in questa sessione.

## 10. Chosen candidate path

Nessuna pipeline esistente copre da sola "singola lezione → materiale
completo revisionabile": RecapHtml manca di sintesi, SummaryPack manca
di errori/soluzioni/delivery, DispensaDoc manca di input single-lesson.
La convergenza NON è "sceglierne una": è comporre D2-J3A digest +
SummaryPack esistente. Dettaglio nella slice sotto. Non è una decisione
di architettura nuova: è wiring di accumulatori esistenti.

## 11. Smallest possible J3B implementation slice (aggiornato: implementato in PR #254)

Narrazione grounded invariata + deterministic structured appendix DOPO di
essa (NON dentro il prompt LLM): (a) soluzioni esercizi già estratte in
capsula, con citation verificate via verify_citation; (b) errori
aperti/correzioni dal digest D2-J3A con EvidenceRef mostrate come
provenienza plain, mai convertite in citazioni seg_id. Riuso totale di
prompt-gating-render esistenti. Niente blueprint, niente quarto, niente
PDF in J3B. Dettaglio implementativo e prove: PR #254
(feat/d2-j3b-hybrid-lesson-material).

## 12. Exact files J3B would likely touch

- `packages/engine/lessonos/summarizer.py` (sezioni + prompt, riuso gate)
- `packages/engine/tests/test_summarizer.py` (prove)
- Eventuale passerella digest→summary input (1 funzione pura, da
  decidere in J3B se dentro summarizer o modulo piccolo)

## 13. Acceptance tests for J3B

- digest con errore aperto → sezione errori nel markdown con EvidenceRef
  verbatim, mai come citazione seg_id;
- errore corretto → marcato corretto, non riproposto come aperto;
- solution capsula → presente nel materiale (chiude il loss bug);
- summary senza digest → identico a oggi (nessuna regressione);
- grounding gate invariato (fail-closed).

## 14. Deferred decisions

- Seg_id namespacing ASR/board (schema-level → decision record futura).
- Re-ingest failure compensation: PROVATO solo per post-purge save/assembly
  failure con restore riuscito (test dedicati) + contratto Store allineato
  (tutti i public mutators onorano _in_transaction, test parametrizzato).
  NON PROVATO / NON GARANTITO: full failure atomicity, concurrent reader
  isolation, same-lesson concurrent ingest, recovery se il backend viola le
  assunzioni, restore success in presenza di restore failure (in quel caso
  l'errore originale resta incatenato in __context__, non è più la top-level
  exception). "Original error re-raised unchanged" vale SOLO a restore
  riuscito — mai inteso come atomicità generale.
- `readEnvelopesByLesson` index perf; live-Kimi 404 esterni.
- Study-pack route: verificare nel repo che la ospita o dichiararla
  greenfield.

## 15. Explicit non-goals (questa sessione)

LessonDocument/IR, PDF/LaTeX/Markdown renderer nuovi, CLI nuova, nuovo
DB/schema, Kirchhoff/Numeria/ELAB integration, Room/hashchange fix,
marketplace/SaaS/MCP/LMS/factory, rewrite Studio/engine/ELAB,
DevOS/control plane, merge, deploy.

## 16. Truth alignment 2026-09-18 (D2-J3B-TRUTH-PDF-POC)

Le sezioni 1-15 restano il record dell'audit scritto a `671cbfcf`.
Questa sezione le corregge senza riscrivere la storia.

- §11 SUPERSEDED. J3B NON è stato implementato come estensione del
  prompt pack. Implementato in PR #254 (`0a5b33f5` + `6157e663`):
  `generate_lesson_summary` mantiene la narrazione grounded
  byte-identica, poi appende `render_structured_appendix`
  (`packages/engine/lessonos/summarizer.py:447`) — deterministico, senza
  LLM — costruito da errori/correzioni di `LessonOsStudyDigest`
  (`packages/engine/lessonos/ingest/lessonos_snapshot.py:76`) +
  `ExerciseExtraction.solution`
  (`packages/engine/lessonos/capsule/extraction.py:162`) con gating via
  `verify_citation`. Guardie: digest di altra lezione → `ValueError`;
  citazioni senza excerpt verificato scartate da `is_verified_excerpt`
  PRIMA di `verify_citation`.
- Output invariato come outer type: `SummaryPack`
  (`files{<lesson>.md}`); appendix `""` quando non applicabile →
  output legacy byte-identici (test exact-output pre-esistente).
- §14 SUPERSEDED ("atomicity CHIUSA"). Solo bounded post-purge
  compensation. Contratto Store: i public mutators committano
  eagerly fuori da transazioni esplicite, suppressi dentro
  (`if not self._in_transaction`, `store/sqlite.py`); snapshot di
  vecchi segments+capsule PRIMA della purge; purge = singolo DELETE
  fuori dal try (se fallisce: stato intatto, niente da ripristinare);
  fallimento save/assembly post-purge → restore old+old + errore
  originale ri-sollevato; fallimento del restore → propaga con
  l'originale incatenato in `__context__`. NON GARANTITO: atomicità
  generale, isolamento dei lettori concorrenti (stato transiente
  osservabile), ingest concorrente stessa lezione (nessun lock in
  `ingest/bundle.py`). Staged atomic replacement futura = FUTURE, non
  implementata.
- Epistemica: `EvidenceRef` = provenienza mostrata come riga plain
  `Provenienza:`, mai convertita in citazioni seg_id; `Citation` =
  grounding testuale via `verify_citation` su excerpt di segmento;
  solution etichettata "estratta", mai "verificata" (non esiste un
  verificatore di dominio); Kirchhoff claim = verifica di dominio
  futura, fuori scope.
- Exporter Quarto (`export/quarto.py`) è CourseBlueprint-oriented
  (course-level), contiene `"Soluzione da sviluppare."` hardcoded
  (`quarto.py:359`), richiede runtime quarto esterno (assente): NON è
  il truth path single-lesson J3B.
