# Gate di pubblicazione scientifica/editoriale — P0

Data: 2026-10-21. Base: `codex/physics-bank-approval-gate-20261021`, SHA
`e9c87b072913744f6cc6df21217b8856cddfef1f` (PR #270). PR in bozza #272. Worktree isolato:
`/Users/andreamarro/VOLUME 3/ardesia-bank-approval-20261021`.

## Perimetro

Il corpus di 4.000 quesiti resta immutabile. Il gate decide, per edizione, quali
quesiti possono raggiungere uno studente. La banca non viene rigenerata, non
viene modificata e non riceve approvazioni implicite. Nessun merge, deploy,
push su `main` o comunicazione a studenti è stato eseguito.

## Modifiche

- Schema 7 additivo (`schema.sql`, `schema_contract.py`, `store.py`,
  `postgres.py`, `operations.py`): tabelle `study_question_bank_approvals` e
  `study_question_bank_approval_events`, indici, CHECK, trigger append-only e
  divieto di DELETE. Upgrade v6→v7 senza ricostruire dati.
- `question_bank.py`: digest SHA-256 del contenuto autoriale (esclusi solo
  `status` e `reviewer`), binding a versione + digest, filtri `published_ids`,
  `review_record` privato e `bank_access_for_edition`.
- `question_bank_approvals.py`: `ApprovalGate` con default deny, approvazione,
  rifiuto, revoca, stato di revisione e storico.
- `question_bank_routes.py`: route di pratica filtrate dal gate; anteprima
  privata del docente proprietario; endpoint di review/approvazione/revoca/audit.
- Migrazione `supabase/migrations/20261021120000_study_question_bank_approvals.sql`
  con RLS, trigger e grant minimi.
- Test: 11 engine + 7 HTTP dedicati al gate, più aggiornamento del contratto
  schema e della fixture HTTP esistente.

## Invarianti

1. Default deny: nessuna approvazione persistita = nessun quesito servito.
2. L'approvazione è legata a `edition_id`, `bank_id`, `question_id`,
   `question_version` e allo SHA-256 del contenuto. Un contenuto o una versione
   diversi invalidano l'approvazione senza cancellare la storia.
3. Solo il docente proprietario dell'edizione può approvare, rifiutare,
   revocare e leggere l'audit. Gli studenti ricevono 403 sulle route di review.
4. La revoca è una transizione `PUBLISHED → REVOKED`; le righe e gli eventi non
   sono cancellabili. Il ripristino da backup conserva le approvazioni; la
   cancellazione di uno studente non tocca le decisioni editoriali.
5. Nessuna soluzione, formula, opzione corretta o firma semantica compare nelle
   proiezioni studente (lista, dettaglio, esame). Il feedback compare solo dopo
   un tentativo su un quesito pubblicato.
6. Un esame senza famiglie sufficienti fallisce con `409
   insufficient_distinct_families`: non viene mai composto un esame parziale.
7. Il corpus non viene riscritto e nessun endpoint approva in blocco.

## Modello dei ruoli

Per l'MVP il revisore autorizzato è il docente proprietario dell'edizione
(`teacher_only=True`). Non esiste ancora un ruolo globale di revisore
scientifico separato dal titolare dell'edizione. I due stati
(`scientific_status`, `editorial_status`) sono persistiti separatamente per
consentire in seguito un flusso a due figure senza migrare i dati.

## Evidenza

### Validatore del produttore

Con le versioni dichiarate in `bin/content/physics_bank/requirements.txt`
(`jsonschema==4.23.0`) e `psycopg[binary]==3.3.3`:

```sh
.venv/bin/python bin/content/physics_bank/validate_bank.py
```

Esito: `ok: true`, 4.000 record, 4.000 proiezioni studente, 4.000 round-trip di
correzione, 1.000 per livello, 2.537 scelte multiple / 1.463 completamenti,
`manifestSha256=15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`,
`humanScientificReview: NOT_RUN`. Il file `delivery-validation.json` è stato
ripristinato dopo l'esecuzione: l'unica differenza prodotta era `elapsedSeconds`.

### Suite

```sh
PYTHONPATH=packages/engine:services/study-api .venv/bin/python -m pytest -q \
  packages/engine/tests/study services/study-api/tests
```

Esito: **714 passed, 18 skipped**. I 18 skip sono i test di contratto Supabase
live, saltati perché `ARDESIA_SUPABASE_ENV_FILE` non è fornito; nessuno skip è
stato introdotto dal gate.

### Probe sulla banca reale (SQLite sintetico, 4.000 record)

Con lo studente membro e nessuna approvazione:

```json
{
  "bankSha256": "15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896",
  "records": 4000,
  "approvalRowsBefore": 0,
  "draftPageStatus": 200,
  "draftPageTotal": 0,
  "draftIds": [],
  "examStatus": 409,
  "examError": "insufficient_distinct_families",
  "catalogPublished": 0,
  "approvedTotal": 1,
  "approvedId": "u1-area-conversion-01",
  "approvedStatus": "PUBLISHED",
  "attemptStatus": "APPROVED",
  "attemptEditorial": "PUBLISHED",
  "afterRevokeTotal": 0,
  "approvalRowsAfter": 1,
  "eventRows": 2
}
```

Il leak precedente (`u1-area-conversion-01`, `u1-area-conversion-02` visibili
allo studente) non è più riproducibile: la pagina è vuota, l'esame è negato in
modo esplicito, l'approvazione di una revisione esatta pubblica un solo quesito
e la revoca lo ritira lasciando una riga e due eventi di audit.

### Probe #271

Il probe originale `bin/pro-regia/test_bank_publication_gate.py` non è stato
modificato. Il suo primo test (`students_cannot_receive_unapproved_drafts`) è
soddisfatto dal gate. Il secondo test presuppone un esame `200` con 31 quesiti
prima di qualsiasi approvazione: quel comportamento era la baseline vulnerabile
che il P0 deve negare. Post-fix il probe si interrompe nella fixture perché
l'esame restituisce `409`. La divergenza è attesa ed è coperta dal test
`test_default_deny_blocks_list_detail_attempt_and_exam`; non è un
indebolimento del probe.

## Convergenza schemi con #269

La convergenza è tracciata in `docs/study/SCHEMA-CONVERGENCE-2026-10-21.md`.
Il gate resta **schema 7** e la sua migrazione resta
`20261021120000_study_question_bank_approvals.sql`; l'esame della PR #269 è
rinumerato a **schema 8** con
`20261021130000_study_exam_attempts.sql`. La forma v7 "solo esame" è accettata
solo come upgrade additivo, mai come forma canonica. Il corpus e il gate non
sono stati modificati nel merito.

## PostgreSQL: NOT_RUN

La migrazione è stata scritta e confrontata con lo schema SQLite, ma non è stata
eseguita contro un'istanza PostgreSQL/Supabase reale: nell'ambiente non è
disponibile un runtime PostgreSQL e i test di contratto live si saltano senza
`ARDESIA_SUPABASE_ENV_FILE`. La verifica RLS/trigger Postgres resta un gate
esplicito prima del deploy.

## Rischi residui

- Il gate non è ancora provato su PostgreSQL live (vedi sopra).
- Il revisore è il docente proprietario; non c'è ancora separazione tra
  revisore scientifico e pubblicatore editoriale.
- Il ruolo DB `ardesia_app` può leggere i metadati delle approvazioni; la
  separazione colonna-per-colonna non è implementata. L'API non li espone agli
  studenti.
- La banca resta `DRAFT`/`NOT_RUN` come corpus; la pubblicazione è per edizione
  e per revisione, non un'attestazione globale della banca.
- Nessuna revisione umana reale è stata eseguita: il gate è pronto, ma i 4.000
  quesiti non sono approvati.

## Prossimi passi

1. Applicare la migrazione su un Supabase locale e aggiungere i test di
   contratto RLS/trigger (approvazione, revoca, append-only, isolamento).
2. Aggiungere il ruolo di revisore scientifico distinto dal titolare
   dell'edizione, se richiesto dal flusso 2026/27.
3. Progettare l'interfaccia web di review (la API è pronta) e la coda dei
   quesiti pendenti.
4. Definire il piano di campionamento e la revisione umana dei 4.000 quesiti;
   fino ad allora il gate deve restare chiuso.
