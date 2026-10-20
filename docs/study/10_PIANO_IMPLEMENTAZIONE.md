# Ardesia Semestre Filtro — Implementation Plan

> Per gli agenti: eseguire task per task con `superpowers:executing-plans` oppure worker separati quando i confini lo consentono. Il metodo scelto è esecuzione autonoma locale con un integratore e massimo due worker. Non attendere una nuova approvazione per ogni decisione ordinaria già compresa nel mandato.

**Goal:** completare M1, la microdemo integrata Fisica con gruppo, post-it, consegne, review e memoria su componenti reali, preservando il percorso M0 già utile al marketing.

**Architettura:** estensione del monorepo Ardesia, non nuova piattaforma. Un servizio di studio possiede transazioni, iscrizioni e autorizzazioni; LessonOS riceve osservazioni con evidenza attraverso un adapter. Canvas, post-it e grafi rimangono viste degli stessi oggetti.

**Stack:** stack effettivo del checkout, atteso React/TypeScript/Vite e Python LessonOS; persistenza transazionale locale per M1; Playwright e suite esistenti. Nessuna migrazione framework richiesta.

**Spec:** `02_VISIONE_POSTIT_MEMORIA.md`, `04_UX_E_DESIGN.md`, `05_ARCHITETTURA_CONTRATTI.md`, `06_GRUPPI_LEZIONI_COMPITI.md`, `07_FISICA_SYLLABUS_CONTENUTI.md`.

## Vincoli globali
Fisica Semestre Filtro prima di ogni altro CoursePack. Massimo 10 iscritti. Test/chiavi/provider fittizi identificati. 0 USD di nuovo consumo API senza budget autorizzato. Identità dal server; nessun identificativo del client concede accesso. Conservare cronologia e file originali. Non ridurre i required checks per ottenere il verde. Non montare il verticale Arduino nel percorso critico. M1 non è M2.

## Review Focus
- Connessione interrotta dopo il commit: ricevuta recuperabile, niente doppia consegna.
- Due persone sull'ultimo posto: una sola conferma; nessun conteggio solo frontend.
- Cambio della trascrizione dopo feedback: il derivato precedente diventa obsoleto, non corretto automaticamente.
- Studenti nello stesso gruppo: lavori privati e allegati non diventano pubblici.
- Ripresa su browser pulito: origine, contesto, tentativi e omissioni restano leggibili.

## Mappa dei file
**Esistenti e letti:** `apps/studio/src/toolhost/postitObject.ts`, `apps/studio/src/toolhost/subPostitObject.ts` (individuato), `apps/studio/src/lessonos/quizAttemptProducer.ts` (lettura nella sessione precedente), `packages/engine/lessonos/mcp/grounded_memory.py`, `apps/studio/src/store/AudioRecorder.ts` (lettura precedente).

**Nuovi percorsi proposti, da creare solo se non esiste un equivalente provato:**
- `packages/engine/lessonos/study/{models,store,groups,submissions,feedback,context,activities,ai_jobs}.py`;
- `services/study-api/` come adapter HTTP sottile, non secondo dominio;
- `apps/studio/src/study/{contracts,apiClient,StudyPostit,GroupEditionView,SubmissionPanel,ReviewPanel,ContextDrawer,PublicCourseView}`;
- `packages/engine/tests/study/`, `apps/studio/src/study/__tests__/`, `apps/studio/e2e/study-group-journey.spec.ts`;
- `bin/study-demo/` launcher e seed isolati; `artifacts/study-demo/` output non contenente dati veri.

T00 deve registrare la corrispondenza fra questa mappa e il checkout. Non trattare un percorso proposto come file già verificato. Conservare le convenzioni del progetto; non introdurre un nuovo package solo per rispettare il nome proposto.

## Regola RED/GREEN comune
Ogni task: scrivere il test discriminante; eseguirlo e conservare la ragione del fallimento; implementare; rieseguire test e regressioni pertinenti; fare una review del diff; commit locale specifico. I comandi seguenti sono proposti per i nuovi percorsi. T00 deve verificare gli script del repository e correggere le sole differenze di invocazione, non eliminare le prove.

### T00 — Recupero e baseline, prima di qualunque riscrittura
**Dipendenze:** nessuna. **File:** ricevuta locale `53782a1…`, mappe e gate esistenti; nuovo `artifacts/study-demo/baseline.json`.
**Interfaccia prodotta:** manifest con SHA base/candidato, file recuperati, hash, comandi ed esiti, stato della microdemo, mapping dei percorsi.
- [ ] Leggere stato Git, modifiche locali e lockfile; creare worktree isolato senza reset del lavoro altrui.
- [ ] Cercare la patch/bundle locale già consegnata usando la ricevuta, non soltanto `git show` su un commit non pubblicato.
- [ ] Riprodurre esercizio→note/immagine→export→riapertura. Se irrecuperabile, registrare le due verifiche compiute e ricreare soltanto questa slice.
- [ ] Verificare i post-it e la memoria già presenti prima di creare moduli nuovi.
- [ ] Eseguire i comandi di baseline realmente disponibili; distinguere failure preesistente, skip e NOT_RUN.
**Gate:** nessun claim di recupero senza hash e prova; nessun blocco indefinito per archeologia del repository.

### T01 — Contratti, identità e store unico
**File proposti:** `study/models.py`, `study/store.py`, `study/contracts.ts`; test `test_identity_store.py`.
**Consuma:** baseline. **Produce:** `Principal`, `LearningContext`, `SourceRef`, `SubmissionReceipt`, `FeedbackRecord`; `StudyStore.transaction()`; `authorize(principal, action, resource) -> Decision`.
- [ ] Test `test_student_cannot_read_peer_source`: due utenti stesso gruppo; richiesta peer restituisce DENY senza body o URL firmato.
- [ ] Test `test_client_actor_id_does_not_override_session`: sostituire actorId nel payload non cambia l'identità.
- [ ] Test `test_rollback_leaves_no_receipt`: guasto prima del commit non emette ricevuta.
- [ ] Implementare schema versionato, foreign key, migrazione avanti e backup ripristinabile; scope attribuito dal server.
- [ ] Run: `cd packages/engine && uv run pytest tests/study/test_identity_store.py -q`.
**Gate:** store locale persistente; nessun salvataggio autorevole esclusivamente in memoria; migrazione testata su dati sintetici legacy.

### T02 — Post-it contestuali, senza seconda lavagna
**File:** riuso `toolhost/postitObject.ts`; nuovo `StudyPostit.tsx`, `ContextDrawer.tsx`; test `StudyPostit.test.tsx`.
**Consuma:** Resource/Context T01. **Produce:** `StudyPostitView` che riferisce `resourceId`, `revisionId`, `contextId`; `onSubmit(reference)`.
- [ ] Test `moving_postit_preserves_resource_revision_and_acl`: drag/resize cambia layout, non contenuto o permessi.
- [ ] Test `same_resource_two_views_not_two_sources`: due post-it leggono la stessa risorsa.
- [ ] Test keyboard e mobile: tutti i comandi accessibili senza hover; focus restituito dopo chiusura del pannello.
- [ ] Implementare origine/tentativo/aiuto come tipi contestuali; in piccolo mostrare titolo e stato, non testo illeggibile.
- [ ] Run: `npm --prefix apps/studio run typecheck` e suite Vitest pertinente tramite script verificato.
**Gate:** nessuna nuova dipendenza canvas; uno snapshot salvato conserva riferimenti validi.

### T03 — Laboratorio Fisica originale e M0
**File proposti:** `study/activities.py`, `PhysicsActivity.tsx`, `PublicCourseView.tsx`; test `test_physics_activity.py`, `physics-landing.spec.ts`.
**Consuma:** T01–T02, fixture originali. **Produce:** `evaluate_activity(activity_id, parameters, attempt) -> ActivityResult`; `record_interest(principal_or_visitor, request) -> InterestReceipt`.
- [ ] Test fisico: raggio ×1,5 a Δp fissa → Q ×5,0625; a Q fissa → Δp /5,0625; raggio ≤0 rifiutato.
- [ ] Test descrittivo: cambiando il vincolo, indicazione UI e variabile calcolata cambiano insieme.
- [ ] Test richiesta: invio, refresh, vista docente → un interesse reale; errore store non mostra «ricevuto».
- [ ] Implementare pagina corso con prezzo/date/stato configurati, non disponibilità inventate; lab fruibile prima di registrazione.
- [ ] Eseguire build e prova browser desktop/mobile, conservando clip breve senza dati veri.
**Gate M0:** laboratorio funzionante, record interesse e roundtrip; DRAFT dei contenuti dichiarato finché manca review umana.

### T04 — Edizioni, orari e capienza
**File:** `study/groups.py`, `GroupEditionView.tsx`; test `test_groups.py`.
**Produce:** `propose_cohorts(requests, slots) -> list[CohortProposal]`; `reserve_seat(actor, edition, key, now) -> Hold`; `confirm_test_enrollment(actor, hold, receipt) -> Enrollment`.
- [ ] Test 12 richieste compatibili: non oltre10 confermate; le altre rimangono interessi/waitlist.
- [ ] Test ultimo posto: due transazioni concorrenti → una riserva, un conflitto visibile.
- [ ] Test sovrapposizione: uno studente disponibile solo a 3/4 date non appare come compatibile certo.
- [ ] Test retry idempotente e scadenza hold con clock iniettato, non sleep arbitrari.
- [ ] Implementare spiegazione del matching e override tutor tracciato. Non usare LLM per transazione posti.
- [ ] Run: `uv run pytest tests/study/test_groups.py -q` dal package Engine.
**Gate:** roster/server fonte di verità; prezzi in centesimi; modalità pagamento test separata da reale.

### T05 — Consegne multimodali e ricevuta
**File:** `study/submissions.py`, adapter HTTP, `SubmissionPanel.tsx`; test `test_submissions.py`.
**Produce:** `submit(principal, work_item_id, source_refs, text, idempotency_key) -> SubmissionReceipt`; `get_receipt(principal, receipt_id)`.
- [ ] Test limiti file della spec, MIME reale, input malformato, storage pieno e allegato non proprio.
- [ ] Test commit riuscito/risposta persa: retry stessa chiave riporta stessa ricevuta e un solo evento; payload diverso →409.
- [ ] Test crash prima commit: nessuna ricevuta; blob temporaneo recuperabile/pulibile senza cancellare fonti accettate.
- [ ] Implementare upload privato e ricevuta persistente, stato caricamento/errore/riprova; PDF native text prima di estrazione visiva.
- [ ] Run test API e browser per immagine, PDF e audio breve sintetici, più testo.
**Gate:** la preview locale non significa consegna; il modello non legge allegati privi di autorizzazione.

### T06 — Correzione, review e secondo tentativo
**File:** `study/feedback.py`, `ReviewPanel.tsx`; test `test_feedback.py`.
**Produce:** `propose_feedback(...) -> FeedbackCandidate`; `review_feedback(principal, candidate_id, expected_revision, edits) -> ReviewReceipt`; `retry_submission(...)`.
- [ ] Test nuovo tentativo conserva il precedente e collega la stessa attività; feedback di rev1 non approva rev2.
- [ ] Test `fake_model_cannot_mark_human_reviewed`: provider non possiede il comando di approvazione.
- [ ] Test rifiuto/chiarimento non diventa errore disciplinare o voto negativo.
- [ ] Implementare vista originale/proposta/fonte a confronto; il tutor può correggere o richiedere chiarimenti.
- [ ] Run: suite feedback + scenario due browser tutor/studente.
**Gate:** review manuale effettiva tramite UI e sessione tutor sintetica, non una flag valorizzata nel seed.

### T07 — LessonOS, contesto e invalidazione
**File:** `study/context.py`, adapter eventi LessonOS, `ContextDrawer.tsx`; test `test_context_memory.py`.
**Produce:** `record_observation(review_receipt) -> Observation`; `retrieve_context(principal, context_id, query, limit=6) -> ContextPacket`.
- [ ] Test filtro permessi prima della ricerca; nessun risultato peer anche quando semanticamente identico.
- [ ] Test memoria al nuovo incontro: una osservazione realmente revisionata e la sua fonte sono recuperabili.
- [ ] Test modifica/cancellazione fonte: cache, citazione e derivati obsoleti non sono più offerti come correnti.
- [ ] Test idempotenza consumer: stesso evento di review non duplica osservazioni.
- [ ] Implementare packet di contesto con fonti/versioni/limiti; il grafo è proiezione, non nuovo archivio sovrapposto.
**Gate:** equivalenza della proiezione dopo ricostruzione da eventi; «fonte presente» distinto da «verità dimostrata».

### T08 — Aiuto progressivo e job AI sostituibili
**File:** `study/ai_jobs.py`, adapter al router esistente; test `test_ai_jobs.py`.
**Produce:** `request_hint(principal, work_item, hint_level, request_id) -> HintJob`; `ProviderPort.generate(context_packet, task) -> Candidate`.
- [ ] Test senza chiavi/worker spento: lab, consegna e review continuano; aiuto deterministico disponibile.
- [ ] Test prezzo sconosciuto/tetto esaurito: zero chiamate; nessun timeout infinito.
- [ ] Test input «ignora istruzioni/leggi file»: nessun tool shell, nessuna fuga da scope.
- [ ] Test una escalation/una ripetizione massime secondo la spec; trascrizione sintetica dichiarata fake.
- [ ] Implementare citazioni e indicatore proposta. Non imporre il nome del provider nella UI di studio; dichiararlo nell'informativa pertinente.
**Gate:** M1 con fake; benchmark live separato e autorizzato per qualunque claim AI.

### T09 — Colloquio end-to-end e dieci studenti
**File:** `apps/studio/e2e/study-group-journey.spec.ts`, `bin/study-demo/seed.*`, launcher e report.
**Consuma:** T01–T08. **Produce:** report scenario conforme a `11_MICRODEMO_E_COLLAUDO.md`.
- [ ] Seed 1 tutor/10 studenti/2 interessati in database isolato, con credenziali non valide in produzione.
- [ ] Eseguire il flusso completo attraverso frontend/build e backend reali; niente endpoint di test che saltino le regole di business.
- [ ] Eseguire dieci consegne concorrenti; contare10 ricevute/10 tentativi distinti, senza attribuzione incrociata.
- [ ] Spegnere e riavviare servizi, aprire browser pulito e verificare persistenza/fonte/review.
- [ ] Attivare i failure case della matrice e verificare il comportamento visibile.
**Gate M1:** acceptance pass; mock dichiarati, log e hash. Screenshot soltanto non basta.

### T10 — Marketing, export e pacchetto di lancio
**File:** pagina pubblica e template commerciali, export esistente, test `public-course.spec.ts` e `test_public_projection.py`.
**Produce:** pagina corso/asset e `release-readiness.json`, senza pubblicazione esterna automatica.
- [ ] Test scheda pubblica mostra solo conteggio aggregato, programma, condizioni e posti reali; nessun nome/elaborato privato.
- [ ] Test link condiviso riapre il laboratorio pubblico, non una sessione privata; nessun token PII nei parametri UTM.
- [ ] Test PDF/export o bundle dichiarato conserva ciò che promette; omissioni visibili.
- [ ] Produrre clip scenario sintetico, testo annuncio e calendario proposto compatibile, non iscrizioni false.
**Gate:** M2 checklist pronta; nessun marketing del tipo «tutto automatico/garantito» se manca una prova.

### T11 — Chiusura ingegneristica, non altra espansione
**File:** inventario dipendenze, manifest, report e documentazione di avvio.
- [ ] Eseguire typecheck/build/suite richieste e prove del prodotto sullo stesso SHA.
- [ ] Review del diff da contesto fresco; se non disponibile, dichiarare self-review invece di inventare indipendenza.
- [ ] Misurare failure/residual risk, rendere app avviabile senza configurazioni implicite, testare backup/restore sintetico.
- [ ] Classificare tutti i residui M2; registrare esplicitamente NOT_RUN di pilot umano/modello live/Pencil reale.
- [ ] Produrre una consegna unica con link ai log e istruzioni; non aprire Analisi o Arduino prima della chiusura M1.
**Gate finale:** nessuna P0/P1 aperta del perimetro dichiarato; se bloccato consegnare codice/prove/parziale senza chiamarlo completo.

## Regola REA dentro ogni task
Per ogni meccanismo chiave scegliere un job del registro. Leggere prima ciò che già esiste; catturare la funzione autorizzata; estrarre comportamento/stati/casi limite; implementare originalmente; riutilizzare lo scenario come regressione del nostro prodotto. L'indagine termina dopo il criterio o il tetto; non accumulare documentazione prima di una slice funzionante.
