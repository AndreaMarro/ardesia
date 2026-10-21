# Incremento C1 — esame reale, percorso browser e limiti

Data: 2026-10-21. Branch: `codex/study-exam-c1-20261021`. Base: `178a737c`
(head della PR #275, `codex/study-exam-integrated-20261021`). Worktree:
`/tmp/opencode/ardesia-wt/examint`.

Nessun merge, deploy, pubblicazione o approvazione reale è stato eseguito.

## Perimetro

C1 chiude i difetti materiali dell'esame già integrato in #275:

1. la validità di un tentativo non deve poter risorgere dopo revoca e
   riapprovazione dello stesso contenuto;
2. la disponibilità mostrata in elenco deve coincidere con la composizione
   reale della prova, non con il solo conteggio delle approvazioni;
3. il percorso browser deve essere eseguito su API reale, non solo su unit
   test, con schermate 390/820/1440 px, tastiera, reload e due schede;
4. la banca reale da 4.000 quesiti resta immutata e `DRAFT`; la shortlist
   privata non crea approvazioni.

## Modifiche

### P0 — validità dopo revoca/riapprovazione

`result_validity` confronta ora l'`approvalId` congelato nello snapshot del
tentativo, non l'approvazione attiva. Una revoca rende invalido il vecchio
tentativo; una nuova approvazione dello stesso contenuto non lo riabilità.
Il test `test_reapproval_cannot_resurrect_a_revoked_snapshot` copre il ciclo
completo: consegna valida, revoca, invalidazione, riapprovazione, vecchio
tentativo ancora invalido, nuovo tentativo valido.

### P0 — readiness veritiera

`pack_summary` esegue la stessa composizione di un avvio reale con seed
`readiness-probe`. `ready` è vero solo se la prova da 31 quesiti è realmente
componibile (21 scelte + 10 completamenti, famiglie distinte). Il sottotitolo
distingue:

- meno di 31 approvazioni: `N/31 quesiti approvati · prova non disponibile`;
- almeno 31 approvazioni ma composizione impossibile:
  `N quesiti approvati · composizione non disponibile`.

La UI usa lo stesso criterio: messaggio sui 21+10 e bottone
`Composizione non disponibile` quando il conteggio basta ma la composizione no.

### UI e coerenza editoriale

- Il formato `completion` non è più mostrato raw: la label è `Testo o numero`.
- La spiegazione completa è sempre visibile nel risultato, anche quando sono
  presenti `solutionSteps`.
- I messaggi di indisponibilità non promettono una prova che il server
  rifiuterebbe.
- `Da correggere` resta la coda di feedback sul tentativo dello studente, non
  la revisione scientifica della banca. La banca resta `DRAFT`; ogni
  approvazione è legata a edizione, revisione e digest del contenuto.
- Non esiste ancora un ruolo globale di revisore scientifico separato dal
  docente proprietario dell'edizione. `scientific_status` ed
  `editorial_status` restano persistiti separatamente.
- Nessuna approvazione, rifiuto o revoca è stata eseguita; nessun quesito è
  stato modificato.

### Harness browser C1

- `bin/study-demo/exam_c1_fixture.py`: banca sintetica `physics-semestre-2026`
  con 31 quesiti (`c1-synth-000..030`), 21 scelte A–E e 10 completamenti,
  profilo `semestre-2026`, 3000 secondi, famiglie uniche; esegue `seed()`,
  iscrive `student-01` a `fluidi`, approva i 31 quesiti via `ApprovalGate` e
  scrive `c1-actors.json`.
- `bin/study-demo/serve-c1.py`: patcha `question_bank.BANK_PATHS` sulla banca
  sintetica, pulisce la cache, avvia `create_app(demo=True)` senza frontend
  (non esiste `apps/studio/dist`), default `.study-demo-c1`, porta 5321.
- `apps/web/e2e/exam-c1.spec.ts`: percorso completo su UI reale. Il dettaglio
  del tentativo usa `/study/exams/{id}` perché la lista non espone `answers`.
  Il quesito omesso è identificato dal prompt `Quesito sintetico C1 31`, non
  dalla posizione. La prova zoom usa viewport `720x450` equivalente al 200% di
  1440: il CSS `zoom` produceva falsi overflow.

## Prove eseguite

| Area | Comando | Esito |
|---|---|---|
| Engine | `env -u KIMI_API_KEY -u DEEPSEEK_API_KEY uv --directory packages/engine run pytest -q --no-header` | **2544 passed, 26 skipped** in 109.82s |
| Study API | `PYTHONPATH=packages/engine:services/study-api uv run --project services/study-api pytest services/study-api/tests -q --no-header -rs` | **250 passed** in 47.28s |
| Web | `npm run test:web` | **35 file, 246 test passed** in 19.02s |
| Web typecheck | `npm run typecheck:web` | **passato** |
| Web build | `npm run build:web` | **passato**; solo warning pre-esistente sui chunk >500 kB |
| Engine mirato | `uv --directory packages/engine run pytest -q tests/study/test_exam_bank.py` | **15 passed** in 1.65s |
| Web mirato | `npm --prefix apps/web test -- --run src/__tests__/exam-bank.test.tsx` | **1 passed** |
| PostgreSQL 16.15 | test di convergenza con `ARDESIA_TEST_POSTGRES_URL` sul cluster locale | **9 passed** |
| Browser C1 | `ARDESIA_C1_ACTORS=... npx playwright test e2e/exam-c1.spec.ts --reporter=line` | **1 passed** in 19.3s |

### Nota di esecuzione

I primi tentativi di suite completa usavano il venv del servizio anche per
l'Engine/API e sono falliti in raccolta con `ModuleNotFoundError: networkx` e
`ModuleNotFoundError: lessonos`. Non erano regressioni: i comandi ufficiali
sono quelli in `bin/monorepo.sh` e `docs/study/README.md`, riportati sopra.
Un primo run web completo ha mostrato un flake in `session-boundary.test.tsx`
(Work page ancora in caricamento); il rerun completo è verde 246/246 senza
modifiche al test.

## Percorso browser verificato

La spec copre:

- login studente via UI e apertura della prova da 31 quesiti;
- 21 scelte con opzioni A–E e 10 completamenti con label `Testo o numero`;
- selezione da tastiera;
- autosave e riapertura con risposte e revisione persistenti;
- due schede: il salvataggio concorrente riceve `409`, la seconda ricarica la
  revisione server e il salvataggio successivo riesce;
- consegna e risultato `28,9`: 29 corrette, 1 errata, 1 omessa;
- tutte le 31 spiegazioni non vuote, con `solutionSteps` quando presenti;
- revoca di un'approvazione: il risultato diventa `Prova non valida.`;
- riapprovazione: il vecchio tentativo resta invalido, la lista torna pronta e
  un nuovo tentativo è valido;
- viewport 390, 820, 1440 e 720x450 (equivalente 200%);
- screenshot e trace Playwright.

Artefatti locali (fuori dal repo):
`/tmp/opencode/ardesia-wt/web-qa/e2e-artifacts/exam-c1-C1-real-Study-API--4b894-anent-revocation-invalidity/`.
SHA-256 principali:

- `exam-runner-390.png`: `7156d7bfc9e5483142b543f50a04263470adad3ebc0887977c3fd3bb4e1c1af7`
- `exam-runner-820.png`: `c4e4ee9d8cdaca5f526bccd883ef5b99a10c0bdbc6524ec30dfe962cc850b646`
- `exam-result-1440.png`: `f981da29df4d26138a805a78e2e8c5c21b0f465672e6d522235519d0fd33e812`
- `exam-result-zoom-200.png`: `c56e7c7393ca41bc58e46351bb117d7e7b946beabb3a03c325ed9695aaa7eea9`
- `exam-invalid-1440.png`: `d04731530ab2db96052c6a5588b374039fa2ac3249873dd8c5a0dc94db262e0d`
- `trace.zip`: `71f78508abc47631e2fe8398c48b4cab27cf218a4b47ee368f4ab5d68f6b8430`

## PostgreSQL, RLS e backup/restore

- I 9 test di convergenza girano su PostgreSQL 16.15 locale (socket
  `/tmp/opencode/ardesia-pg-socket`, porta 55432), non su Supabase.
- Coprono schema v9, approvazioni, eventi append-only, immutabilità delle
  approvazioni, guardia dei tentativi, isolamento RLS studente/docente e
  immutabilità dei tentativi chiusi.
- Backup/restore manuale verificato: schema v9, riga marker preservata,
  trigger `study_bank_approval_event_append_only`,
  `study_bank_approval_immutable`, `study_exam_attempt_guard`, tabelle
  `study_exam_attempts`, `study_question_bank_approval_events`,
  `study_question_bank_approvals`.
- GoTrue, PostgREST, Storage, JWT e contratto Supabase reale restano
  `NOT_RUN`: nell'ambiente non esistono questi servizi e non è stata usata la
  produzione.

## Shortlist privata C1

Generata fuori dal repository pubblico, in
`/Users/andreamarro/VOLUME 3/.ardesia-semestre-control/c1-20261021/`:

- 56 quesiti reali dalla banca `physics-semestre-2026` (4.000 record);
- 35 scelte + 21 completamenti;
- 8 quesiti per unità U1–U7;
- livelli: 15 base, 14 facile, 14 medio, 13 difficile;
- 56 famiglie e 56 firme semantiche uniche;
- manifest SHA-256:
  `15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`;
- `exam-c1-shortlist-private.json` SHA-256:
  `6a74714a768b4f577016595fc97c03a5a0d665a91b88420a5879fda7e82363c3`;
- `exam-c1-shortlist-private.md` SHA-256:
  `dc162ffcbd279ec1182cf016e5e8ae61d3a9b9f3f12aafec2f9cac676ba634b8`.

La shortlist contiene solo metadati (niente prompt, opzioni, risposte o
soluzioni), non crea approvazioni, non modifica stati e non scrive sul
database. È un campione di lavoro per la revisione umana, non una
certificazione scientifica. **Non va committata**: il repository è pubblico.

## Matrice NOT_RUN

| Superficie | Stato | Motivo |
|---|---|---|
| Auth GoTrue, PostgREST, Storage, JWT reali | `NOT_RUN` | Servizi non disponibili in locale; produzione vietata |
| Contratto Supabase live | `NOT_RUN` | Nessun `ARDESIA_SUPABASE_ENV_FILE` |
| RLS/trigger PostgreSQL | **PASS locale** | 9 test su PostgreSQL 16.15; non Supabase |
| Backup/restore PostgreSQL | **PASS locale** | Restore manuale su cluster usa-e-getta |
| Browser Chromium 390/820/1440 | **PASS** | Playwright su API reale e banca sintetica |
| WebKit/Firefox | `NOT_RUN` | Non eseguiti in questo incremento |
| Dispositivi fisici, screen reader, Pencil | `NOT_RUN` | Fuori dal perimetro locale |
| Revisione scientifica umana dei 4.000 quesiti | `NOT_RUN` | Nessuna approvazione reale |
| Calibrazione empirica della difficoltà | `NOT_RUN` | La banca dichiara `editorial_not_student_calibrated` |
| Merge, deploy, produzione | `NOT_RUN` | Non autorizzati |

## Rischi residui

- `validate_exam_pack` richiede ancora `questionVersion == 1`: revisioni
  future dei quesiti non sono servibili finché il contratto non viene esteso.
- Il percorso browser usa una banca sintetica, non i 4.000 quesiti reali: la
  banca reale resta `DRAFT` e non è approvata.
- I test RLS girano su PostgreSQL locale con ruoli di test, non su Supabase
  con JWT GoTrue.
- La shortlist è deterministica ma non è un campione statistico calibrato; è
  un punto di partenza per la revisione umana.
- Il flake web osservato una volta in `session-boundary.test.tsx` non è stato
  riprodotto nel rerun completo; resta un rischio di instabilità noto.

## Riproduzione

```sh
env -u KIMI_API_KEY -u DEEPSEEK_API_KEY \
  uv --directory packages/engine run pytest -q --no-header

PYTHONPATH=packages/engine:services/study-api \
  uv run --project services/study-api pytest services/study-api/tests -q --no-header -rs

npm run test:web
npm run typecheck:web
npm run build:web
```

Browser C1 (da `apps/web`, con API su 5321 e Vite su 5320):

```sh
ARDESIA_C1_ACTORS=/tmp/opencode/ardesia-c1-run/c1-actors.json \
  npx playwright test e2e/exam-c1.spec.ts --reporter=line
```

Il test è stateful: azzerare la data directory e riavviare l'API prima di ogni
run.
