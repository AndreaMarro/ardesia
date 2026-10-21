# Convergenza schemi Study: gate editoriale + esame persistente

Data: 2026-10-21. Branch: `codex/study-schema-convergence-20261021`.
Base: PR #272 (`73121ef0a1835495cef173749c77a5969831302d`), che contiene la
PR #270 (`e9c87b072913744f6cc6df21217b8856cddfef1f`) e i 4.000 quesiti.
Integrazione tecnica: PR #269 (`b9764d2e1785c26893f424ea547d2df081e0aca2`).

Nessun merge in `main`, nessun deploy, nessuna approvazione automatica del
corpus, nessun test o gate disabilitato.

## HEAD verificati

| PR | Branch | HEAD | Ruolo |
| --- | --- | --- | --- |
| #268 | `codex/ardesia-public-rea-20261020` | `61e7f00be9fc4ecfdf5eb362275b3b8a566d92bf` | base comune |
| #269 | `codex/semestre-filtro-exam-20261021` | `b9764d2e1785c26893f424ea547d2df081e0aca2` | esame persistente v7 dichiarato |
| #270 | `codex/physics-bank-4000-20261021` | `e9c87b072913744f6cc6df21217b8856cddfef1f` | banca 4.000 |
| #271 | `codex/ardesia-pro-regia-20261021` | `fe245fd803aaf072721d3f27beeea3bf9f9da9d5` | probe storica, non modificata |
| #272 | `codex/physics-bank-approval-gate-20261021` | `73121ef0a1835495cef173749c77a5969831302d` | gate v7 dichiarato |

Il conflitto era reale: #269 e #272 dichiaravano entrambe `CURRENT_SCHEMA=7`,
creavano tabelle diverse e usavano lo stesso prefisso di migrazione
`20261021120000`.

## Sequenza canonica

```
v6  study core + admin registers + notebook
 └─ 20261021120000_study_question_bank_approvals.sql   → v7
      ├─ study_question_bank_approvals
      └─ study_question_bank_approval_events
 └─ 20261021130000_study_exam_attempts.sql              → v8
      └─ study_exam_attempts
```

- **v7 = gate di pubblicazione** (PR #272, invariata).
- **v8 = tentativi d'esame** (PR #269, rinumerata).
- `CURRENT_SCHEMA=8`.
- Le due migrazioni SQLite sono nello stesso `schema.sql`, con
  `UPDATE study_schema SET version=7 WHERE version=6` prima delle tabelle
  d'esame e `version=8 WHERE version=7` in coda.
- Le due migrazioni PostgreSQL hanno prefissi distinti e guardie di versione.

### Compatibilità con i database già creati

| Forma trovata | Comportamento |
| --- | --- |
| v6 senza tabelle v7/v8 | crea gate, poi esame; v8 |
| v7 canonica (solo gate) | aggiunge `study_exam_attempts` vuota; v8 |
| v7 pre-convergenza (solo esame) | aggiunge le tabelle gate vuote; v8 |
| v7 parziale o corrotta | `database_integrity_failure`, nessuna scrittura |
| v8 | apertura normale |

La forma v7 "solo esame" è riconosciuta solo durante un upgrade esplicito
(`allow_upgrade=True`) e solo se `study_exam_attempts` è completa. Non è mai
accettata come forma canonica in sola lettura. L'upgrade è additivo: le tabelle
del gate nascono vuote, quindi il default-deny resta attivo e nessuna
approvazione viene inventata.

La migrazione PostgreSQL del gate accetta anche la forma v7 "solo esame"
quando `public.study_exam_attempts` esiste e le tabelle del gate non esistono;
in quel caso non incrementa la versione e lascia che la migrazione d'esame
successiva completi v8. Su un database con ledger delle migrazioni, la vecchia
migrazione d'esame `20261021120000_study_exam_attempts.sql` resta registrata
come storia e non viene rieseguita.

## Test eseguiti

Ambiente: macOS, Python 3.13.14 via `uv`, SQLite locale.

| Ambito | Comando | Esito |
| --- | --- | --- |
| Engine completo | `cd packages/engine && uv run pytest -q -rs` | **2529 passed, 25 skipped** |
| API completa | `cd services/study-api && PYTHONPATH=../../packages/engine:. uv run pytest -q -rs` | **248 passed** |
| Studio mirato | `uv run --project services/study-api python -m pytest packages/engine/tests/study services/study-api/tests -q -rs` | **733 passed, 18 skipped** |
| Web typecheck | `npm run typecheck:web` | pass |
| Web build | `npm run build:web` | pass |
| Web test | `npm run test:web` | 243/244; 1 flake pre-esistente |

Gli skip engine/API sono i contratti Supabase live, i modelli live e il corpus
dispense non presenti in CI; nessuno è un test di convergenza. Il flake web è
`session-boundary.test.tsx` ("Consegne e feedback" non trovato entro il timeout
di 1 s sotto carico parallelo): passa da solo e fallisce anche sul HEAD #272
`73121ef0` con lo stesso comando, quindi non è introdotto da questa convergenza.
Non è stato disabilitato né modificato.

`packages/engine/tests/study/test_schema_convergence.py` copre:

1. database nuovo → v8 con entrambe le famiglie di tabelle;
2. v6 → v8 preservando edizione, membro e righe pre-esistenti;
3. v7 canonica (gate) → v8 preservando la decisione editoriale;
4. v7 pre-convergenza (solo esame) → v8 preservando il tentativo;
5. upgrade fallito su tabella d'esame malformata: byte del file invariati,
   versione ancora 7, decisione intatta;
6. backup/restore con gate e tentativo insieme;
7. erasure dello studente: rimuove il tentativo, conserva la decisione;
8. contratto v7/v8: distingue la forma canonica da quella legacy e rifiuta
   v8 senza esame;
9. migrazioni PostgreSQL: prefissi unici, ordine canonico, guardie 7/8.

Il probe originale #271 non è stato modificato. Le regressioni post-correzione
sono nel file separato `test_schema_convergence.py` e nei test già presenti del
gate (`test_question_bank_approvals.py`, `test_question_bank_approval_http.py`).

## PostgreSQL: NOT_RUN

Nell'ambiente non esiste un runtime PostgreSQL (`psql`, `initdb`, Docker o
Supabase CLI non disponibili) e i contratti live si saltano senza
`ARDESIA_SUPABASE_ENV_FILE`. Quindi **non** sono stati eseguiti su PostgreSQL
reale:

- applicazione delle due migrazioni e dei loro `DO $$` guard;
- trigger di immutabilità/append-only delle approvazioni;
- RLS e grant di `study_question_bank_approvals`,
  `study_question_bank_approval_events`, `study_exam_attempts`;
- `NOTIFY pgrst` e ricaricamento schema.

Questi restano gate espliciti prima di qualsiasi deploy. La verifica statica
delle migrazioni è inclusa nei test, ma non sostituisce un collaudo live.

## Incompatibilità residue con MCQ, grading e autosalvataggio

1. **Forma MCQ diversa.** La banca #270 usa 5 opzioni con id `A`–`E`, campo
   `format: multiple_choice` e `answer.correctOptionId`. L'esame #269 usa
   esattamente 4 opzioni come stringhe, `type: "mcq"` e `answer` intero 0–3.
   `validate_exam_pack` rifiuta un pack che non abbia 4 opzioni. Non è possibile
   passare direttamente un quesito della banca all'esame #269: serve un adapter
   di proiezione (e una decisione esplicita se la prova resta a 4 opzioni).
2. **Grading compatibile nei numeri, non nel contratto.** Entrambi usano
   +1,00 / −0,10 / 0,00 e 31 quesiti (21 MCQ + 10 completamenti), ma #269
   calcola in decimi interi con `score_tenths` e accetta risposte numeriche con
   tolleranza; la banca #272 espone `bank.attempt` per singolo quesito e profili
   d'esame senza persistenza. Non esiste ancora una funzione di grading
   condivisa né un tentativo persistente per l'esame generato dalla banca.
3. **Autosalvataggio non collegato al gate.** #269 salva l'intera mappa
   risposte con `PUT /study/exams/{id}/answers` (debounce client 700 ms, grazia
   10 s) e corregge dal `pack_snapshot`. Il gate #272 filtra domande e prove, ma
   non persiste tentativi; l'esame della banca (#272) non è collegato a
   `study_exam_attempts`. Un'integrazione futura deve legare ogni tentativo alla
   revisione approvata (`question_version` + `content_sha256` + `bank_sha256`) e
   ri-verificare il gate alla consegna, non solo alla composizione.
4. **Pack fisso vs banca.** `exam.py` accetta solo `PACK_ID =
   fisica-semestre-filtro-v1`, versione 1, e carica il JSON dal filesystem. Non
   può ospitare oggi un esame composto dai 4.000 quesiti. Il gate #272 non
   protegge il pack fisso #269: sono due corpus distinti. Il pack resta
   `DRAFT`/`NOT_RUN` e non è una prova MUR.
5. **RLS d'esame più permissiva del dominio.** La policy PostgreSQL
   `exam_attempt_update` consente l'update al proprietario iscritto; il vincolo
   "non modificare un tentativo chiuso" è applicativo, non un trigger DB. Da
   irrobustire se si vuole la stessa garanzia del gate.

## Limiti

- Nessun collaudo PostgreSQL reale (vedi `NOT_RUN`).
- Nessuna integrazione semantica tra esame #269 e banca #270: la convergenza è
  di schema e di test, non di formato MCQ né di grading condiviso.
- Nessuna revisione umana dei 4.000 quesiti e nessuna approvazione automatica.
- #271 resta una PR separata e storica; il suo probe non è stato corretto o
  riscritto.
