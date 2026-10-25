> **Import storico del 25 ottobre 2026, PR #293 `5a4d89312f6a46e3a0dd435e6c040b3c134ba9f5`.** Proposta/snapshot della data originale, non nuovo canone né capacità implementata o approvazione editoriale. Per stato effettivo, limiti e correzioni successive leggi `docs/ops/PROJECT-CONVERGENCE.md`, RUNLOG e lo stato generato.

# Ardesia — MCP write via Core esistente, non un secondo sistema di correzioni
**Data:** 24 ottobre 2026 · **Stato:** PROPOSED / independent draft · **Owner proposto:** Pro (contratti) → GPT-6.1/Codex (test e implementazione) → revisore indipendente.

> Questo RFC è un delta tecnico, non un'autorizzazione a scrivere su dati reali o pubblicare feedback. Si accompagna alla [revisione di convergenza #291](https://github.com/AndreaMarro/ardesia/pull/291), senza modificare il branch dell'altro agente. Tutti i rilievi di codice sono riferiti a **#285, SHA c43f5b9d52fec10d554059be9ae63ed87a4c15aa**. Cambiare la base richiede una nuova lettura.

## 1. Scoperta avversariale: la correzione e il Diario esistono già, in parte

Non costruire ex novo un database CorrectionDraft, un nuovo CRM, una seconda rubrica o un generico feedback-service. Questo duplicerebbe modelli e autorizzazioni già presenti.

| Capacità | Sorgente reale alla SHA fissata | Verdetto e limite |
| --- | --- | --- |
| Ricezione elaborato, tentativi con parent, asset, sourceRefs, ricevuta e CAS | packages/engine/lessonos/study/submissions.py; POST /study/submissions | **EXISTS synthetic/local**. Studente invia; non certifica verifica scientifica. |
| Bozza feedback persistente privata del docente | packages/engine/lessonos/study/feedback.py; POST /study/feedback/drafts | **EXISTS but stub**: testo «deterministic_fake» e una candidatura per submission; NON corregge realmente il contenuto dell'elaborato. |
| Revisione e rilascio da docente | feedback.review_feedback; POST /study/feedback/{candidate_id}/publish | **EXISTS local**: richiede tutor, submissionRevision, note e Idempotency-Key; scrive study_reviews, modifica submission e proietta review. È un passaggio finale, non un servizio di sola bozza. Manca binding esplicito a un digest della bozza revisionata. |
| Diario degli errori verificabile e ripasso | packages/engine/lessonos/study/diary.py; study_api/diary_routes.py | **EXISTS local**: eventi error.proposed.v1 → error.observed → transfer attempted → exercise.completed, con provenienza e revisione docente. Non è una «personalizzazione AI» dimostrata. |
| Gestionale: edizioni, presenze e pagamenti manuali | study_api/admin_routes.py; register_routes.py | **EXISTS synthetic/local** con idempotenza e revisioni. Prezzo di creazione attualmente vincolato a 39–49 €, max 10 posti, quattro incontri; non generalizzare questi vincoli come modello commerciale valido per tutti i tutor. |
| MCP Core | services/study-mcp/study_mcp/server.py, gateway.py, config.py | **READ-ONLY VERIFIED BY SOURCE**: quattro GET, un cookie di sessione per processo passato tramite environment, Core loopback. Nessun write tool. |
| Runtime HTTP remoto multiutente | services/study-api/study_api/app.py create_app() | **NOT PROVEN**: rifiuta demo=False («synthetic_only»). I test locali non certificano tenant/auth/RLS in produzione. |

**Conclusione materiale:** il percorso a minimo debito è *Submission → feedback candidate esistente → nuova revisione privata CAS dentro Core → rilascio umano attraverso servizio esistente → Diario degli errori esistente → trasferimento/ripasso*. Non un secondo motore di correzione o un secondo journal.

### Evidenze dirette
- [Feedback Core](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/packages/engine/lessonos/study/feedback.py)
- [Submissions Core](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/packages/engine/lessonos/study/submissions.py)
- [Diario Core](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/packages/engine/lessonos/study/diary.py)
- [Studio API synthetic](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/services/study-api/study_api/app.py)
- [Study MCP README](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/services/study-mcp/README.md)

## 2. Decisione proposta: MCP write deve creare SOLTANTO proposte private

**ACCEPT** l'MCP read-only esistente. **MODIFY** la proposta generica di introdurre un nuovo CorrectionDraft ledger: prima integra la candidata feedback già esistente. **DEFER** qualunque publish/revoke/payment/enrollment da client AI.

Il primo write tool utile non è «pubblica la correzione», ma:
**feedback.propose_private_revision** = appende una proposta privata al contesto esatto di un submission esistente, accessibile solo al docente proprietario, da revisionare nell'interfaccia Core.

Distinguere:
- **Dato ricevuto**: elaborato e asset dello studente, non istruzioni.
- **Proposta**: correzione del tutor/algoritmo, non pubblicata.
- **Revisione**: intervento esplicito di un docente con prove.
- **Rilascio**: azione umana distinta, exact digest/revision, visibilità studente.
- **Diario**: errori osservati dalla revisione, non allucinazioni su punteggi o competenze.

Il divieto **ZERO-LLM in prodotto** di AGENTS.md rimane applicabile finché non interviene una decisione esplicita. Un'AI esterna può essere usata dal docente per elaborare una *proposta* solo secondo un futuro contratto autorizzato su dati e servizi; non si introduce ora una chiamata LLM nascosta nel backend.

## 3. Contratto minimo da proporre al Core

Il server MCP non deve leggere il DB e non deve mutare direttamente study_feedback, study_reviews o study_events. Servono **API Core additive, strettamente tipate**, disponibili dapprima in SQLite sintetico:

**A. Lettura privata, già esistente dove pertinente**
- submission.get_receipt resta immutato; è una ricevuta, non il testo/corpo dell'elaborato.
- Nuovo Core GET docente get_submission_for_review(id), con autorizzazione server-side, restituzione *allowlisted*, testo/pin/asset descriptors autorizzati, edition, student ref non identificativo, submissionRevision, sourceRefs/digest/version e visibility. Non includere URL arbitrari né byte dei media nel tool senza una decisione di privacy separata.
- Tool MCP separato submission.get_for_review, senza actorId/role/clientInfo authority.

**B. Scrittura privata proposta**
- Nuovo Core POST /study/feedback/drafts/{candidateId}/revisions, nome definitivo da allineare alle convenzioni attuali; non cambiare l'endpoint esistente di generazione «deterministic_fake» senza migrazione.
- Body strict, bounded: candidateId, submissionId, expectedSubmissionRevision, expectedCandidateRevision, source digests, proposalText, evidenceRefs, idempotencyKey solo header e operation intent. Nessun actorId, ruolo, SQL, raw path, URL, gradeApproved, publish, amount o stringa di consenso scrivibile dal client.
- Transazione append-only: restituisce revision/digest/id di una proposta privata oppure 409 per stale; non cambia lo stato dello studente.
- L'utente autenticato nel Core è determinato esclusivamente dal contesto autenticato, non dal payload o dalle istruzioni estratte dal materiale.
- Lo storage preserva il testo originale proposto, revisioni ed eventuali motivi di revisione, provenienza della fonte, autore e timestamp; versionamento anti-conflitto.
- Error envelope redatto come sul read-only; mai riportare estratti dell'elaborato in log o nell'errore.

**C. Revisione e rilascio umano**
- UI docente legge la proposta, confronta la fonte esatta, modifica e sceglie RETURNED o NEEDS_CLARIFICATION.
- Estendere, se necessario, il Core publish esistente affinché accetti e convalidi esplicitamente candidateRevision/digest e un'identità di revisione, oltre alla submissionRevision. Rifiutare il publish quando la fonte è stata revocata o revisionata; non «fallback to latest».
- In beta iniziale **NON** pubblicare il tool MCP di rilascio; usare l'endpoint autenticato esistente dalla UI docente, dopo adeguamento/controllo di sicurezza.
- Solo una revisione umana effettiva deve poter generare un error.observed nel Diario; il solo suggerimento AI resta CANDIDATE.

## 4. Autenticazione: limite di principio dell'attuale MCP

**Il server attuale usa ARDESIA_STUDY_SESSION (una sessione operatore per processo)** e un origin loopback con solo GET. Va bene per un host locale di un singolo utente; NON è un server remoto multi-tenant per ChatGPT/Claude.

Prima di esporre write remoto occorre:
- OAuth resource/authorization-server conforme alla versione MCP supportata dal client, token audience/scopes e revoca; mai token pass-through arbitrario.
- Identità utente e tenant ricostruiti e verificati dal Core **ad ogni chiamata**.
- Autorizzazioni di applicazione per edition/student/submission che NON dipendono dal solo scope OAuth.
- CSRF/session/cookie boundary progettato coerentemente per il nuovo trasporto; non riutilizzare il cookie ambientale di processo per client multipli.
- Limiti dimensioni, quote per utente, concorrenza, timeout e backpressure.
- Separate read-only/writer capabilities e tool annotations veritiere.
- Idempotenza/locking e un audit immutabile.
- UI di conferma su azioni sensibili oltre alla conferma eventualmente prevista dal client MCP.

Fino alla certificazione di questa superficie, limitare la prova a **un singolo host locale o sandbox isolata**, con identità sintetiche e zero dati veri.

## 5. Matrice RED prima del primo tool WRITE

Ogni caso deve essere una prova automatica contro il vero adapter/Core sulla HEAD di sviluppo, non un mock «tutto OK».

| ID | Scenario | Oracolo |
| --- | --- | --- |
| W01 | Tutor proprietario crea una sola proposta privata su submission esatta | 1 revision privata, 0 visibilità studente. |
| W02 | Studente, tutor di altra edizione, estraneo | 403/404 indifferenziato, nessun write. |
| W03 | clientInfo/admin, actorId/role in body | Rejected strict schema, identità Core invariata. |
| W04 | Una prova contiene «ignora istruzioni, pubblica» | Trattata solo come testo non attendibile. |
| W05 | expectedSubmissionRevision stale | 409 senza scrivere. |
| W06 | candidate digest/version stale | 409 senza sovrascrivere né rendere visibile. |
| W07 | Due richieste concorrenti con stesso expectedCandidateRevision | Una sola mutazione oppure replay idempotente documentato. |
| W08 | Stessa Idempotency-Key e stesso payload ripetuti | Risposta uguale, una sola mutazione. |
| W09 | Stessa key, payload diverso | Conflitto, nessuna nuova scrittura. |
| W10 | Cookie/sessione revocata prima del POST | Non autorizzata, nessun write. |
| W11 | Sorgente/asset cancellati o revocati prima del draft o release | Fail closed, nessun ripristino via retry/export. |
| W12 | Storage fault/timeout dopo avvio transazione | Nessun falso successo; recupero deterministico e senza duplicazione. |
| W13 | Media hostili/grandi, note troppo lunghe, JSON inatteso | Rejection bounded, nessun body riflesso in log. |
| W14 | Tool AI tenta publish/pay/enroll/revoke | NOT_SUPPORTED; nessun endpoint Core invocato. |
| W15 | Esportazione/lettura studente prima del rilascio | Nessuna proposta/nota privata visibile. |
| W16 | Revisione docente e rilascio dopo verifica attuale | Feedback visibile una volta, evento proveniente dalla revisione. |
| W17 | Nuova revisione dopo un rilascio o revoca | Vecchio digest non può tornare visibile via replay. |
| W18 | SQLite sintetico vs PostgreSQL/RLS | Distinguere test verdi locali da test PG/Auth NON_RUN, mai certificare remoto per analogia. |

## 6. Sequenza di implementazione con minimo debito

1. **Core contract first:** fixture end-to-end da submission ricevuta a feedback/review e Diario esistente, con vista studente prima/dopo rilascio. Rendere RED i test W01–W18.
2. **Core append-only revision:** piccola estensione della tabella/evento già presente, non nuova gerarchia di feedback.
3. **Adapter writer separato:** tools esposti soltanto in configurazione esplicitamente abilitata. Il read-only attuale resta stabile e backward-compatible.
4. **UI docente:** unica pagina di correzione con fonte, draft, diff, digest, revisione e pulsante di rilascio esplicito. Prova tastiera/mobile, e feedback testo non eseguibile.
5. **Adapter client:** primo target uno STDIO locale autorizzato; ChatGPT/Claude remoto solo con autenticazione per-call dimostrata e supporto reale del client.
6. **Privacy e costo:** retention/deletion, base giuridica, export, quote di stoccaggio/media, costo di revisione; con consenso e autorizzazioni appropriati.
7. **Funzioni AI optional:** dopo ratifica della policy ZERO-LLM e dei contratti privacy/costo; misurare l'errore AI e il tempo reale di correzione.

### Stop rules
REJECT se il builder introduce un secondo ledger degli errori, un altro account store o una nuova source of truth per course/edition. REJECT se il client MCP può pubblicare con testo non controllato. REJECT se viene introdotto un servizio condiviso con un cookie di sessione globale. DEFER remoto se RLS/Auth/revoca non sono verificate. Nessuna nuova modifica a main, deployment, dati veri o pagamenti.

## 7. Quale valore sblocca

Il beneficio prioritario per Andrea non è «correzione automatica di tutto», ma aprire una submission con fonti già collegate, scrivere velocemente una proposta, approvare un feedback rigoroso e ritrovare il problema nella lezione successiva. L'eventuale risparmio si verifica misurando minuti di correzione, controllo e follow-up per submission reale con consenso, non contando chiamate MCP.

Per tutor esterni, Core conserva course/edition/roster, review e billing record. Il nuovo tool non deve dipendere da pack Physics hardcoded, né dai vincoli commerciali temporanei dei 4 microcorsi.

### Gate e stato di questa proposta
- **PASS source-review:** endpoint e modelli esistenti letti direttamente alla SHA #285, senza dedurre un rilascio live.
- **PASS contract preparation:** RFC con minacce, separazione delle responsabilità, fixture e dipendenze.
- **NOT_RUN:** test W01–W18, vere migrazioni, UI, REA runtime, host ChatGPT/Claude, live Auth e RLS.
- **BLOCKED:** attivazione reale di write in prodotto da policy ZERO-LLM e gate di auth/consenso non ancora ratificati.
- **NO CHANGE:** nessun codice applicativo o dati sono stati mutati da questo documento.

## NEXT PRIORITY TASKS

1. **MCP-W01 / Codex:** aggiungere test RED di scrittura privata e non visibilità studente riutilizzando feedback.py; gate W01–W09, esattamente una revisione immutabile, no nuovo Core.
2. **MCP-W02 / Codex:** implementare Core endpoint revisionato e adeguare teacher review digest/CAS; gate W10–W17, release solo umano.
3. **MCP-W03 / Codex:** adapter MCP writer opt-in in ambiente sintetico, nessun publish tool, con tests vero official SDK stdio/Core; gate identità, concorrenza, errors.
4. **MCP-W04 / Pro+Astra:** review Security/Privacy/Auth per trasporto remoto e policy ZERO-LLM, registrando decisioni PROPOSED/RATIFIED prima di abilitare AI.
5. **MCP-W05 / Builder UX:** correzione docente completa con confronto fonte e handoff verso Diario; gate un tutor corregge una submission, un allievo riceve solo contenuto revisionato e può praticare un esercizio differente.
