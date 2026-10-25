# PostgreSQL: convergenza e sicurezza dei tentativi

Data: 2026-10-21. Ambito: migrazioni Study, RLS, trigger e compatibilità con la
vecchia #269. Nessun database di produzione è stato usato.

## Ambiente

- PostgreSQL **16.15** (Homebrew), cluster isolato in `/tmp/opencode/ardesia-pg`.
- Database temporanei `ardesia_conv_<uuid>` creati e distrutti dal test.
- Ruoli `anon`, `authenticated`, `ardesia_app`, `postgres`; schema `auth` e
  `storage` minimi per applicare le migrazioni Supabase.
- Comando:

```sh
ARDESIA_TEST_POSTGRES_URL='postgresql://user@127.0.0.1:55432/ardesia_test' \
  uv run --project services/study-api python -m pytest -q \
  packages/engine/tests/study/test_postgres_schema_convergence.py -rs
```

Esito locale: **8 passed**.

## Difetto riprodotto

La #273 gestiva la forma v7 "solo esame" nella migrazione delle approvazioni,
ma la migrazione d'esame eseguiva ancora un `CREATE TABLE` incondizionato. Su un
database che aveva già applicato la vecchia #269:

1. la migrazione approvazioni creava le tabelle del gate e lasciava la versione
   a 7;
2. la migrazione esame tentava di ricreare `study_exam_attempts`;
3. PostgreSQL rispondeva `DuplicateTable: relation "study_exam_attempts"
   already exists` e l'intera transazione veniva annullata.

Riproduzione verificata su PostgreSQL reale prima della correzione.

## Correzione

- `20261021120000_study_question_bank_approvals.sql`
  - accetta v6, v7 canonica, v7 legacy exam-only e v8 già completo;
  - usa `CREATE TABLE IF NOT EXISTS`, indici idempotenti, trigger ricreati e
    policy ricreate in modo deterministico;
  - valida la forma esatta delle colonne e fallisce senza scritture se diverge;
  - incrementa a 7 solo da v6.
- `20261021130000_study_exam_attempts.sql`
  - accetta v7 e v8;
  - se la tabella esiste non la ricrea: ne verifica le 16 colonne canoniche;
  - installa indici, RLS, grant, policy e trigger mancanti;
  - incrementa a 8 solo da v7.
- Nuovo trigger `study_exam_attempt_guard`:
  - vieta `DELETE`;
  - rende immutabili identità, pack, snapshot, ordine, `started_at` e
    `deadline_at`;
  - impedisce qualsiasi update dopo `submitted`/`expired`;
  - consente solo la transizione `in_progress` → `submitted`/`expired` con
    risultato completo;
  - vieta di scrivere risultati su un tentativo ancora aperto.
- I grant non includono `DELETE` su approvazioni, eventi o tentativi: il divieto
  è applicato sia dal privilegio sia dal trigger.

## Scenari verificati

| Scenario | Esito |
| --- | --- |
| database nuovo | v8, tre tabelle, tre trigger |
| v6 con dati preesistenti | dati preservati, v8 |
| v7 canonico con approvazione | decisione preservata, v8 |
| v7 legacy con solo esame | OID e tentativo preservati, v8 |
| v6 parziale con tabelle approvazioni | retry ripara e arriva a v8 |
| tabella esame incompatibile | errore, rollback a v7, nessun ledger |
| retry dopo rimozione tabella incompatibile | v8 |
| RLS approvazioni | docente approva/revoca, studente legge solo la propria edizione, peer non vede nulla |
| eventi approvazione | update/delete negati |
| RLS tentativi | studente vede solo i propri; update del peer non modifica righe |
| tentativo chiuso | update successivo negato dal trigger |

## Limiti

- Non è stato eseguito lo stack Supabase completo (Auth, PostgREST, Storage,
  `NOTIFY pgrst`). I test HTTP live restano `NOT_RUN` senza
  `ARDESIA_SUPABASE_ENV_FILE`.
- Il test usa uno schema `auth`/`storage` minimo, non GoTrue/Storage reali.
- La copia di backup/restore PostgreSQL end-to-end non è stata eseguita; i test
  SQLite della #273 restano validi per il percorso applicativo SQLite.
- La migrazione non sana una tabella con colonne mancanti o diverse: fallisce
  intenzionalmente e richiede un intervento esplicito.
