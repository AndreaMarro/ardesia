# ARDESIA V4 — Implementation Plan, task verificabili

> For agentic workers: use a separate reviewer per functional slice when available. Write tests that fail first, implement minimal passing code, run relevant checks, commit with exact SHA. No agent's review substitutes for a real tutor's approval.

**Goal:** first Fisica Semestre Filtro mini-course with max 10, permanent private student spaces, Error Diary and four sessions; one Core for Analisi. Then G1 pilot. **Spec:** `GOAL.md`, `specs/01–14`, `contracts/spec.schema.json`, `contracts/REA_MISSIONS.json` and `tests/ACCEPTANCE.json`.

**Architecture:** modular monorepo; thin Vercel web, Supabase Auth/Postgres/Storage/RLS, Render API/MCP/worker; reuse LessonOS+board and scoped Kirchhoff adapter later. No second authoritative memory. Current files are *proposed* where indicated; agents must reconcile with actual HEAD before writing.

## Global constraints
- Product = create, sell, schedule, manage and deliver mini-courses; always start from Fisica Semestre Filtro; Analisi is next CoursePack. Max 10 seats with transaction, prices 39/49 € only proposals.
- Teacher, private learner and classroom are views over canonical resources/learning events. Error diary has source-linked evidence and transfer exercise, not arbitrary mastery score.
- Data isolated per user/org (cross-tenant and same-course cross-user negatives). No real learner data in competitor captures, fixture logs, previews or unapproved provider calls.
- REA G0 mission R0/R1/R2/R3/R8/R6 **requires true receipts** and tested implementation; never PASS for blocked vendor, screenshot only, docs only, or unrun research.
- Preserve copyrights, licenses and third-party TOS. Existing Ardesia/Kirchhoff ref SHA are snapshots, not permanent HEADs. Avoid second app core and wholesale importing external stacks.
- Each task: RED test, minimal implementation, GREEN test, reviewer, commit/receipt. Never remove required checks or claim passes from `--passWithNoTests`.

## Review focus (pin each to tests)
1. Two simultaneous bookings on tenth seat -> exactly one; other waitlisted, idempotent.
2. Learner A tries to read learner B's diary/source, including same group and signed storage URL -> denied without metadata leakage.
3. AI mistakenly identifies handwritten symbol/ambiguous quiz -> candidate/contestable, no confirmed deficit from OCR or LLM alone.
4. Error closed without distinct transfer task -> rejected; later recurrence reopens without destroying history.
5. Source revoked or changed mid-worker, browser restarted or network retry -> stale output not current; work resumes safely.

## REA bind points in the schedule
- T01=R0; T02=R1; T04=R3; T06=R2; **T07B=R8**; T08→R4 on G1; T09 official adapter contract R5; T12=R6.
- G0 gate: `python factory/rea/check_rea_gates.py --gate G0 --sha <ACTUAL_40HEX_SHA>` after all 6 receipt/test chains. A blocked mission cannot be used to pass.
- A public lead-collection landing can be released with explicit preview status if independently ready/authorized; never equate it with G0.


## T01 — Baseline eseguibile e confini del rilascio
**Dipendenze:** nessuna.
**Leggere/riusare:** `package.json`; `apps/studio/package.json`; `packages/engine/pyproject.toml`; `docs/ops/PROJECT-CONVERGENCE.md (branch corretta se non in main)`.
**File proposti:** `apps/web/package.json`; `state/baseline.json`; `factory/rea/capabilities.json`.
**Interfacce:** recoverBaseline(): BaselineReceipt; discovery REA produce capability/versione/host e stato, non un prodotto.

- [ ] Verificare SHA remoto/local patch 53782a1, tag e working tree senza modificare i file dell’utente.
- [ ] Eseguire i gate esistenti nel loro ambiente; conservare fallimenti e skip come baseline.
- [ ] Creare la shell minima apps/web con package @ardesia/web e script test=vitest run, typecheck e e2e; nessun passWithNoTests.
- [ ] Riprodurre export/reopen della microdemo recuperata o documentare fallback minimo.
- [ ] Preparare runtime REA adatto e acquisire il catalogo; nessun privilegio o modello pagato richiesto.
- [ ] Eseguire prima `/rea --version`/help effettivi, studiare i contratti ufficiali del commit fissato e preparare i receipt R0. Non considerare il solo setup come studio REA concluso.

**Verifica:**
```bash
npm --prefix apps/studio run typecheck; npm --prefix apps/studio test; npm --prefix apps/studio run build; python --version; node --version
```
**Completamento verificabile:** Il receipt contiene SHA, test realmente eseguiti e blocchi. La shell mostra solo dati sintetici dichiarati; i vecchi gate restano invariati.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T02 — Contratti condivisi, risorse e post-it contestuali
**Dipendenze:** T01.
**Leggere/riusare:** `apps/studio/src/toolhost/postitObject.ts`; `apps/studio/src/toolhost/subPostitObject.ts`; `apps/studio/src/lessonos/eventlog.ts`.
**File proposti:** `packages/board/package.json`; `packages/domain/package.json`; `packages/contracts/package.json`; `packages/contracts/src/resources.ts`; `packages/contracts/src/commands.ts`; `packages/domain/src/morphisms.ts`; `packages/board/src/resourceViews.ts`; `packages/contracts/tests/resource-contracts.test.ts`.
**Interfacce:** present(resource: ResourceRef, context: AuthorizedContext, prefs: ViewPreferences): ViewModel; adapt(input, target): AdapterResult. ResourceRef e AdapterResult seguono contracts/spec.schema.json.

- [ ] Collegare missione REA R1 con Evidence acquisita a una decisione riuso/adattamento che indica file e test del Core.
- [ ] Scrivere RED: due viste mantengono resource_id; move/resize non cambia revision_id o policy; child detach conserva provenance.
- [ ] Creare i manifest workspace @ardesia/contracts, @ardesia/domain e @ardesia/board con dipendenze dichiarate e script test=vitest run e typecheck; aggiornare un solo lockfile con il manager già adottato.
- [ ] Allineare ID e envelope vecchi tramite adapter versionato, non mutazione silenziosa.
- [ ] Produrre schemi TS/Python senza duplicare regole a mano.
- [ ] Implementare la minima estrazione del modello post-it e trasformazione mobile.
- [ ] GREEN su serializzazione, invalidazione e permessi; commit del confine.

**Verifica:**
```bash
npm run test --workspace @ardesia/contracts -- resource-contracts.test.ts
```
**Completamento verificabile:** Test nominati passano, inclusi input malformati e reference cross-tenant rifiutate dalla boundary. Lo schema da solo non è autorizzazione.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T03 — Persistenza e identità multi-tenant
**Dipendenze:** T02.
**Leggere/riusare:** `packages/engine/lessonos/store/base.py (adapter se necessario)`.
**File proposti:** `supabase/migrations/<generata-dalla-CLI>.sql`; `supabase/tests/access_control.test.sql`; `services/api/pyproject.toml`; `services/api/app/auth.py`; `services/api/app/resources.py`; `services/api/tests/test_access.py`.
**Interfacce:** authorize(actor, action, resource): AuthorizationDecision; finalize_upload(actor, request, key): PersistedReceipt. Letture e scritture con auth effettiva, non teacherId dichiarato.

- [ ] RED su 2 tenant, 2 tutor e studenti: bozza privata, consegna privata e biblioteca.
- [ ] Avviare DB locale isolato, migrazione generata tramite CLI attuale e test grant/RLS/storage.
- [ ] Creare manifest esplicito dei servizi API; non presumere FastAPI già nel pyproject Engine.
- [ ] Implementare transazione resource/version/event/outbox con idempotenza e validazione file.
- [ ] GREEN via identità reali sintetiche, non service-role; rollback/ripristino della fixture e commit.

**Verifica:**
```bash
supabase test db; uv run --project services/api pytest services/api/tests/test_access.py -q
```
**Completamento verificabile:** Nessun accesso fra compagni o tenant. Richiesta non autorizzata non espone metadati né signed URL.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T04 — Gestionale corsi, prenotazioni e tutte le date
**Dipendenze:** T03.
**Leggere/riusare:** .
**File proposti:** `packages/domain/src/courses.ts`; `services/api/app/courses.py`; `supabase/tests/booking_races.test.sql`; `apps/web/src/features/courses/`; `apps/web/e2e/course-booking.spec.ts`.
**Interfacce:** proposeEdition(intake, availability): EditionProposal; reserveSeat(actor, edition_id, expected_revision, key): BookingReceipt; confirmManualPayment(actor, reference, key): PaymentRecord.

- [ ] Collegare missione REA R3 con evidenze di un calendario/class management autorizzato o donor equivalente, e test delle quattro date/posti/area individuale.
- [ ] RED: due utenti contendono posto10, nessun posto11; hold scaduto/pagamento tardivo portano a riconciliazione.
- [ ] Implementare CourseTemplate/Edition/Session distinti; scheduler verifica quattro date.
- [ ] Aggiungere lista interesse/offerte/attesa e pannello tutor, senza nomi finti in prod.
- [ ] Definire mutazione booking privilegiata e minima secondo spec10, non INSERT diretto libero.
- [ ] GREEN: retry postcommit non duplica; nessun pagamento da un clic; commit.

**Verifica:**
```bash
supabase test db; npm run e2e --workspace @ardesia/web -- course-booking.spec.ts
```
**Completamento verificabile:** Una edizione completa è gestibile; prezzi/stati sono server-derived, calendario coerente e lista attesa vera.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T05 — Area individuale, aula e ingressi multimodali
**Dipendenze:** T04.
**Leggere/riusare:** `apps/studio/src/Room.tsx (solo confine necessario)`.
**File proposti:** `services/worker/pyproject.toml`; `apps/web/src/features/learner/`; `apps/web/src/features/classroom/`; `packages/board/src/`; `services/worker/app/media_jobs.py`; `apps/web/e2e/private-workspace.spec.ts`.
**Interfacce:** createDraft(actor, resource): DraftRef; submitRevision(actor, assignment_id, refs, key): SubmissionReceipt; openClassroom(actor, session_id): ScopedWorkspace.

- [ ] RED su privato/consegnato/condiviso, file troncato, offline e ripresa.
- [ ] Dichiarare il servizio worker nel proprio pyproject e usare lo stesso contratto/versione dell’API; nessuna libreria disponibile solo nel computer dello sviluppatore.
- [ ] Implementare upload diretto con finalizzazione, fonte e testo/trascrizione separati.
- [ ] Aula comune e overlay personali hanno riferimenti ma non pubblicano automaticamente bozze.
- [ ] Audio breve con job async; mock ASR esplicito se non disponibile, mai testo finto dichiarato trascrizione.
- [ ] GREEN dopo reload/browser pulito; commit con screenshot significativi.

**Verifica:**
```bash
npm run e2e --workspace @ardesia/web -- private-workspace.spec.ts
```
**Completamento verificabile:** Immagine/PDF/audio/testo hanno ricevute reali o errori espliciti. Cambiare account svuota cache privata.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T06 — Laboratorio Fisica e prima estensione Analisi
**Dipendenze:** T02, T03.
**Leggere/riusare:** .
**File proposti:** `content/physics-filter/poiseuille.json`; `content/analysis1/taylor.json`; `packages/domain/src/assessment.ts`; `packages/board/src/labs/`; `packages/domain/tests/labs.test.ts`; `apps/web/e2e/interactive-lab.spec.ts`.
**Interfacce:** evaluateAttempt(activity_version, attempt): AssessmentResult; updateModel(activity_version, controls): ModelState; ActivityManifest schema versionato.

- [ ] Collegare missione REA R2 a previsione→manipolazione→hint→riprova, con contratti osservati o donor OSS e test di attività originali.
- [ ] RED: Δp fissa vs Q fissa, r e L variati; unità e valori fuori dominio.
- [ ] Implementare formule deterministiche e seed originali con DRAFT editoriale.
- [ ] Aggiungere previsione → manipolazione → spiegazione → nuovo problema, senza soluzione automatica imposta.
- [ ] Implementare un solo secondo template Taylor con range e validità; punteggio esame separato dal legacy correct-count.
- [ ] GREEN scientifico/browser; nessuna approvazione umana inventata.

**Verifica:**
```bash
npm run test --workspace @ardesia/domain -- labs.test.ts; npm run e2e --workspace @ardesia/web -- interactive-lab.spec.ts
```
**Completamento verificabile:** La stessa infrastruttura funziona per due pack e manual-review fallback senza branch per materia nel Core.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T07 — Consegne, rubriche, feedback e nuovi tentativi
**Dipendenze:** T05, T06.
**Leggere/riusare:** .
**File proposti:** `services/api/app/feedback.py`; `services/worker/app/feedback_jobs.py`; `apps/web/src/features/review/`; `services/api/tests/test_feedback_versions.py`; `apps/web/e2e/feedback-cycle.spec.ts`.
**Interfacce:** proposeFeedback(actor, submission_revision, policy): JobReceipt; publishFeedback(actor, draft_revision, expected_source, key): FeedbackRevision; resubmit(): nuova SubmissionRevision.

- [ ] RED: feedback per vecchia revisione, rispostaAI tardiva e cambio rubrica.
- [ ] Implementare inbox, originale+proposta e decisione del tutor; nessun grading bulk cieco.
- [ ] Provider stub/quota0 per G0 con etichetta visibile; vero modello solo con budget e dataset consentito.
- [ ] Collegare nuova correzione/ripresentazione senza cancellare passaggi precedenti.
- [ ] GREEN ciclo completo, costo sconosciuto rifiutato e outage fallback; commit.

**Verifica:**
```bash
uv run --project services/api pytest services/api/tests/test_feedback_versions.py -q; npm run e2e --workspace @ardesia/web -- feedback-cycle.spec.ts
```
**Completamento verificabile:** Lo studente riceve la correzione della versione giusta e può lavorare sul passo senza riscrivere il problema.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T07B — Diario degli errori personale e ripasso controllato
**Dipendenze:** T07.
**Leggere/riusare:** `apps/studio/src/lessonos/eventlog.ts`; `apps/studio/src/lessonos/learningDebtProjection.ts`; `apps/studio/src/lessonos/mistakeObservation.ts`; `apps/studio/src/lessonos/teacherDashboardProjection.ts`.
**File proposti:** `packages/domain/src/errorJournal.ts`; `packages/domain/src/errorJournalProjector.ts`; `packages/domain/tests/error-journal.test.ts`; `services/api/app/error_journal.py`; `services/api/tests/test_error_journal_access.py`; `apps/web/src/features/learner/error-diary/`; `apps/web/src/features/teacher/group-error-review/`; `apps/web/e2e/error-diary.spec.ts`.
**Interfacce:** proposeError/confirmObservation/attachTransferAttempt/verifyTransfer/dismissObservation/getMyDiary, con principal da sessione; DiaryProjection=funzione pura sugli eventi versionati. Spec: specs/13_DIARIO_ERRORI_E_RIPASSO.md.

- [ ] Eseguire missione REA R8 (ricevuta PASS su prodotto o OSS esterno autorizzato, confrontata con existing learningDebtProjection) prima di accettare la task. Se non accessibile, usare alternativa della stessa famiglia senza fingere PASS.
- [ ] Scrivere RED sul progetto: proposta AI non cambia stato confermato; conferma e thread idempotenti; OCR sbagliato e domanda ambigua contestabili.
- [ ] Riutilizzare error.observed/exercise.completed dove compatibili, aggiungendo nuovi eventi versionati senza secondo ledger.
- [ ] Implementare osservazione ancorata a tentativo e ResourceVersion; stati CANDIDATE→OPEN→PRACTISING→VERIFIED_RESOLVED→RECURRED/DISMISSED con prova di trasferimento.
- [ ] Realizzare UI studente Oggi/Il mio lavoro/Diario; nel gruppo una sintesi del docente senza esposizione di casi personali.
- [ ] GREEN su isolamento cross-user, corso Fisica→Analisi, mutazione fonte→STALE, contestazione, AI offline, nuovo esercizio, rete lenta e ripresa.

**Verifica:**
```bash
npm run test --workspace @ardesia/domain -- error-journal.test.ts; uv run --project services/api pytest services/api/tests/test_error_journal_access.py -q; npm run e2e --workspace @ardesia/web -- error-diary.spec.ts
```
**Completamento verificabile:** Diario persistente per studente, non una tabella statica; nessuna soluzione per caso è padroneggiata automaticamente. R8 PASS con evidenza di implementazione, oppure task/G0 rimangono non completati.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T08 — LessonOS, invalidazione e ripresa del contesto
**Dipendenze:** T07B.
**Leggere/riusare:** `packages/engine/lessonos/mcp/grounded_memory.py`; `apps/studio/src/lessonos/learningDebtProjection.ts`; `apps/studio/src/lessonos/studentPackArtifact.ts`.
**File proposti:** `services/api/app/learning_context.py`; `packages/engine/tests/test_student_context_adapter.py`; `packages/domain/tests/morphism-laws.test.ts`; `apps/web/e2e/context-resume.spec.ts`.
**Interfacce:** recallAuthorizedContext(actor, query, source_versions): GroundedContext; projectTrajectory(events, scope): LearningProjection; invalidate(source_version): DerivedStateChanges.

- [ ] Per G1, R4 deve documentare ripresa/audio-fonte su applicazione propria e, ove accessibile, un riferimento esterno. Per G0 il recupero della memoria resta comunque provato con test reali.
- [ ] RED: docente non assegnato, eventi non attribuiti, fonte rimossa, stale cache.
- [ ] Adattare la memoria esistente al filtro accessi server; non creare un nuovo storeRAG indipendente.
- [ ] Conservare la proiezione Diario errori legata alle evidenze e al CoursePack, attraversando Fisica→Analisi senza creare una seconda memoria.
- [ ] Collegare note/postit, fonte e metodo alle successive lezioni.
- [ ] Implementare loss report per export e trasformazioni di vista; grafo on-demand.
- [ ] GREEN riapertura fredda e richiami con evidenza; commit.

**Verifica:**
```bash
uv run --project packages/engine pytest packages/engine/tests/test_student_context_adapter.py -q; npm run e2e --workspace @ardesia/web -- context-resume.spec.ts
```
**Completamento verificabile:** Il recupero mostra solo fonti accessibili e versione attuale. Nessuna conoscenza inventata per riempire un pannello.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T09 — Calendar e MCP con gli stessi contratti
**Dipendenze:** T04, T08.
**Leggere/riusare:** .
**File proposti:** `packages/integrations/package.json`; `packages/integrations/src/calendar/`; `services/api/app/mcp.py`; `services/api/tests/test_mcp_scopes.py`; `packages/integrations/tests/calendar.test.ts`; `packages/integrations/tests/adapter-laws.test.ts`.
**Interfacce:** calendar.previewSchedule(): ScheduleIntent; calendar.commit(intent_hash): SyncReceipt; MCP delega ai medesimi application services.

- [ ] R5 prova i contratti delle API ufficiali e gli adapter con test; REA solo quando pertinente e autorizzato, non inventare una chiamata REA per Calendar.
- [ ] RED: timezoneDST, duplicate notification, etag conflict, syncToken410, scopeMCP altrui.
- [ ] Creare il package @ardesia/integrations con script di test e dipendenze esplicite; Calendar, MCP ed export riusano i medesimi tipi canonici.
- [ ] Implementare ICS e Calendar mock, poi OAuth solo per account autorizzato.
- [ ] Implementare discovery e tool minimi; SDK/spec versionata, fallbacktext se host senzaUI.
- [ ] Provare 1 client MCP reale di laboratorio e matricehost; nessuna integrazione dichiarata se non eseguita.
- [ ] GREEN mock/contratti, registrare separatamente prova esterna reale o BLOCKED.

**Verifica:**
```bash
npm run test --workspace @ardesia/integrations -- calendar.test.ts adapter-laws.test.ts; uv run --project services/api pytest services/api/tests/test_mcp_scopes.py -q
```
**Completamento verificabile:** Gli adapter non aumentano permessi e dichiarano le perdite. Calendar non diventa database delle lezioni.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T10 — Interfaccia professionale e percorso promozionale
**Dipendenze:** T05, T06, T07, T07B.
**Leggere/riusare:** .
**File proposti:** `packages/ui/package.json`; `packages/ui/src/`; `apps/web/src/app/(public)/`; `apps/web/src/features/share/`; `apps/web/e2e/a11y.spec.ts`; `apps/web/e2e/public-course.spec.ts`.
**Interfacce:** publicCourseProjection(edition): PublicCourseView; renderSharedCard(view): SocialPreview; solo campi pubblici.

- [ ] RED: nomi/compiti nella scheda pubblica, focus perso, mobileoverflow, tema senza contrasto.
- [ ] La pagina personale mostra Diario degli errori e prossimo esercizio; da regia vista di gruppo separa errori AI proposti da osservazioni confermate.
- [ ] Creare @ardesia/ui solo per i componenti realmente condivisi; non duplicare i controlli della lavagna o importare un intero nuovo design system.
- [ ] Applicare token e componenti del design system senza cambiare semantica.
- [ ] Pagina Fisica attiva e Analisi secondo modulo/reperibilità; stato interesse distinto da prenotazione.
- [ ] Lazy-load board/librerie; misurare bundle baseline e caricamento sulla fixture.
- [ ] GREEN axe/keyboard/mobile più ispezione visiva; documentare prove hardware non eseguite.

**Verifica:**
```bash
npm run e2e --workspace @ardesia/web -- a11y.spec.ts public-course.spec.ts
```
**Completamento verificabile:** La pagina promozionale è un punto d’ingresso reale, non un link a una demo scollegata.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T11 — Staging Vercel, Supabase, Render e backup
**Dipendenze:** T09, T10.
**Leggere/riusare:** .
**File proposti:** `infra/render.yaml`; `infra/DEPLOYMENT.md`; `services/api/Dockerfile`; `services/worker/Dockerfile`; `.github/workflows/pilot-contracts.yml`; `supabase/tests/restore.test.sql`.
**Interfacce:** DeploymentReceipt = repo/branch/SHA/serviceIDs/environment/artifacts/gates; configurazione senza segreti.

- [ ] RED o preflight esplicito per mancanza accessi, reteprivataerrata e variabili non impostate.
- [ ] Riconciliare target esistenti; workspaceRender e costi eventuali richiedono le conferme dovute.
- [ ] Generare/validare blueprint con CLI corrente e build locale; migrations solo in ambiente isolato.
- [ ] Deploy preview autorizzato; test remoto di due identità, upload e coda; restorebackup.
- [ ] Conservare receipt e rollbackplan. Se bloccato, non marcare G1 ma proseguire G0.

**Verifica:**
```bash
render blueprints validate infra/render.yaml (verificare sintassi --help corrente); npm run build --workspace @ardesia/web; test remoto sullo SHA candidato
```
**Completamento verificabile:** Nessuna funzione lunga sui limiti Vercel, nessun worker con endpointinventato, nessun progetto reale creato con costo implicito.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## T12 — Ciclo completo, marketing e chiusura del Goal
**Dipendenze:** T08, T09, T10, T11.
**Leggere/riusare:** .
**File proposti:** `apps/web/e2e/mini-course-full.spec.ts`; `factory/receipts/final.json`; `state/STATUS.json`; `docs/START_HERE.md`.
**Interfacce:** runFullCourseScenario(seed): AcceptanceReceipt; G0/G1/G2 hanno valori indipendenti e prooflinks.

- [ ] Eseguire `python factory/rea/check_rea_gates.py --gate G0 --sha <SHA_DEL_BUILD>`; il prodotto non supera G0 se manca una delle 6 missioni reali R0/R1/R2/R3/R8/R6. Un blocco documentato non è PASS.
- [ ] Eseguire il ciclo sintetico con 10 studenti +2 interessati, quattro sessioni e dueaccountdocenti; no logout condiviso finto.
- [ ] Confrontare stato iniziale/finale e perdita dati, riapertura browser/server, eventi/costi.
- [ ] Produrre breve demo dal runtime vero, pagina e testo marketing senza promesse non provate.
- [ ] Aggiornare GitHub solo con commit/prove di questa esecuzione, non conteggi storici.
- [ ] Concludere G0 e passare a G1 dove permesso; elencare gate umani per G2.
- [ ] REA R6 confronta la baseline con il nuovo percorso e dimostra assenza di regression sulle funzionalità critiche; receipt con copertura e unknown.

**Verifica:**
```bash
npm run e2e --workspace @ardesia/web -- mini-course-full.spec.ts; eseguire suite completa del repository sullo SHA finale
```
**Completamento verificabile:** Micro-corso realmente attraversabile e receipt verificabile. Iscritti reali, qualità pedagogica e avvio non sono simulati come successi.
**Receipt:** test effettivamente eseguiti, SHA, branch, provider/costo se presente, eventuale Evidence REA.


## Report e collaudo finale
Controllare l’ordine delle dipendenze, che ogni AC del registro appartenga a una task, che test nominali e file siano reali in HEAD, che le missioni REA richieste abbiano receipt e non solo documenti. In G1 includere prova fisica/tutor sui contenuti e su dispositivi reali. G2 richiede iscritti e corso realmente iniziato.


## Priorità esecutiva V4.1 — autonomia online e chiusura dei lavori
L'ultima richiesta rende operativa l'autonomia non finanziaria: ogni task può visitare siti, usare trial certamente gratuiti senza carta/addebiti, lavorare via GitHub e creare preview/staging Vercel dopo preflight. Quando un target REA è inaccessibile, confrontare e scegliere due alternative, registrare decisione e portare a termine la stessa task. **Non** usare `BLOCKED` come scusa generale per fermarsi; non falsificare Evidence.

In ogni task creare una riga di `docs/ops/ARDESIA-RUNLOG.md` e aggiornare `docs/ops/ARDESIA-STATE.json` con SHA, test e URL effettivi. Il monitor ChatGPT è orario; i suoi commenti vanno letti e verificati senza bloccare l'esecuzione. Milestone speciale entro **mercoledì 21 ottobre 2026 sera**: `MARKETING_PREVIEW_READY` con demo Fisica + pagina richiesta reale, senza dichiarare G0 o G1 per un sito incompleto. Aggiunte operativamente verificabili AC-078–AC-085 in `tests/ACCEPTANCE.json`. Per tutti gli altri dettagli leggere `specs/15_AUTONOMIA_TRIAL_E_LANCIO.md`.
