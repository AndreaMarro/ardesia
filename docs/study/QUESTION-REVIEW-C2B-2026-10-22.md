# C2-B — revisione scientifica privata e pubblicazione esplicita

Incremento costruito sullo SHA `eee007d265f89f55b1ba0d08b092f2de1d3603c8`
(PR #277). Nessuna modifica ai 4.000 quesiti originali, ai CoursePack o ai
relativi stati editoriali; nessuna approvazione di materiale reale e nessuna
migrazione eseguita su servizi remoti.

## Problema e contratto

Il comando preesistente `ApprovalGate.approve(decision='APPROVED')` pubblica
immediatamente il quesito. Il vincolo dello schema7 lega `APPROVED` a
`PUBLISHED`: una schermata con due pulsanti che usasse soltanto quel comando
non separerebbe la valutazione scientifica dalla decisione editoriale.

Lo schema10 aggiunge `study_question_bank_reviews`: osservazioni e decisioni
scientifiche private, in revisioni immutabili. Ogni riga riferisce edizione,
banca, ID, versione e SHA del contenuto; **non copia il quesito**. Gli stati
sono `PENDING`, `APPROVED`, `REJECTED`. Un salvataggio positivo non scrive
approvazioni o eventi di pubblicazione e non rende nulla visibile agli studenti.

Il registro preesistente di approvazioni, revoche ed eventi resta il confine
editoriale. La pubblicazione esplicita verifica, nella stessa transazione e
sotto lo stesso lock del salvataggio, che la revisione indicata sia quella
corrente, positiva e riferita ai byte correnti. L'evento editoriale conserva
il `reviewId` di origine. Una ripetizione del comando restituisce la medesima
pubblicazione attiva; dopo la sua revoca restituisce
`409 review_publication_revoked`. Una nuova pubblicazione richiede di salvare
esplicitamente una nuova revisione, poi confermarla di nuovo.
Se esiste già una pubblicazione di un'altra revisione, il nuovo comando
restituisce `409 question_already_published`; non attribuisce falsamente quella
pubblicazione alla revisione nuova.

## Superficie docente

Nell'aula di fisica, il docente proprietario trova una coda privata con ricerca,
filtri di unità/difficoltà/formato/pubblicazione e paginazione. La selezione
porta il focus al dettaglio: testo, opzioni, risposta, unità, soluzione integrale
e passaggi strutturati. Il renderer riusa quello della banca e non interpreta
HTML eseguibile.

Le osservazioni, fino a 2.000 caratteri, e l'esito si salvano sul server e si
ritrovano riaprendo la pagina. `expectedReviewId` impedisce di sovrascrivere una
revisione concorrente. In caso di conflitto, **Carica la revisione corrente**
mantiene il testo locale, mostra le note già salvate per confronto e aggiorna
la precondizione prima di un nuovo salvataggio. Le note private non sono
persistite nel browser.

La pubblicazione richiede una revisione positiva già salvata, il pulsante
**Prepara pubblicazione**, una conferma selezionata e un secondo comando.
Cambiare le osservazioni o l'esito invalida quella conferma. Una versione
nuova del contenuto e una revisione la cui pubblicazione è stata revocata
richiedono un nuovo salvataggio esplicito, anche se il testo delle note è uguale.
La revoca richiede una motivazione. Lo storico mostra le revisioni scientifiche
e le decisioni editoriali, comprese le revoche.

La lettura studente continua a usare solo la proiezione pubblicata dal server.
Il tipo `PUBLISHED`/`APPROVED` e il testo della schermata ora descrivono questa
proiezione; non attribuiscono una revisione all'intero corpus.

## API e compatibilità

Il prefisso è `/study/editions/{edition}/question-banks/{bank}`.

| Operazione | Endpoint | Precondizioni |
| --- | --- | --- |
| Coda e dettaglio privati | `GET /review/questions`, `GET /review/questions/{id}` | Docente proprietario dell'edizione |
| Salvataggio scientifico | `POST /review/reviews` | ID/versione/SHA correnti, esito, note, `expectedReviewId` obbligatorio e nullable |
| Pubblicazione | `POST /review/reviews/{reviewId}/publish` | Revisione positiva corrente; `confirmPublication: true` |
| Revoca | `POST /review/approvals/{approvalId}/revoke` | Approvazione pubblicata e motivazione |
| Storico privato | `GET /review/questions/{id}/history` | Revisioni e approvazioni, solo docente proprietario |

L'endpoint legacy `POST /review/approvals` e il comando Core `approve` rimangono
disponibili per i chiamanti editoriali esistenti. **Compatibilità deliberatamente
ristretta:** il caso HTTP `decision: "APPROVED"` richiede ora il booleano
`confirmPublication: true`; un chiamante precedente che lo ometta riceve
`409 publication_confirmation_required`. La conferma non viene aggiunta
silenziosamente. Le fixture che pubblicano intenzionalmente la includono.
Un comando legacy esplicito continua a poter riapprovare dopo una revoca.

## Dati e autorizzazione

La migrazione PostgreSQL `20261022010000_study_scientific_reviews.sql` è
additiva e ripetibile. Conserva tabelle/OID/dati del registro editoriale.
SQLite converge allo stesso schema10; lettura e backup rifiutano uno schema
incompleto. Il backup/restore include le revisioni private e ne conserva la
catena dei predecessori.

La nuova tabella concede al ruolo applicativo soltanto `SELECT` e `INSERT`.
Le policy RLS richiedono il docente proprietario e legano `actor_id`
all'identità autenticata. Studenti iscritti, compagni non iscritti e altri
docenti non possono leggere o scrivere le revisioni via API. I test PostgreSQL
verificano anche il confine sotto HTTP; trigger e vincolo del predecessore
impediscono modifiche, cancellazioni e catene tra quesiti differenti. Nessun
permesso studente preesistente viene ampliato.

## Verifiche riproducibili

Usare l'ambiente bloccato di `services/study-api`, dipendenze Web del lockfile e
un PostgreSQL **disposable** indicato esplicitamente. I test con
`ARDESIA_TEST_POSTGRES_URL` creano e rimuovono propri database sintetici.

```sh
uv sync --project services/study-api --frozen --python 3.13
PYTHONPATH=packages/engine:services/study-api \
  ARDESIA_TEST_POSTGRES_URL=postgresql://postgres@127.0.0.1:55432/postgres \
  services/study-api/.venv/bin/python -m pytest \
  packages/engine/tests/study services/study-api/tests -q -ra
npm run test:web
npm run typecheck:web
npm run build:web
```

Il percorso browser usa Web compilato e API reale sulla stessa origine. Il
nuovo harness riusa soltanto il generatore sintetico C1, senza eseguirne il seed
di pubblicazione. Usare una directory nuova per ogni esecuzione del test:

```sh
services/study-api/.venv/bin/python bin/study-demo/serve-review.py \
  --data-dir /tmp/ardesia-c2b-new-run --port 5441
ARDESIA_WEB_URL=http://127.0.0.1:5441 \
  ARDESIA_BROWSER=/path/to/chromium \
  ARDESIA_C2B_ACTORS=/tmp/ardesia-c2b-new-run/review-actors.json \
  npm run e2e --workspace @ardesia/web -- question-review-c2b.spec.ts
```

Il test verifica ricerca e filtri, salvataggio e ricarica delle osservazioni,
valutazione positiva ancora privata, conferma distinta, pubblicazione,
isolamento dello studente, revoca e storico. Controlla assenza di overflow
orizzontale a 390/820/1440 px ed errori JavaScript; salva screenshot e trace.
Il file degli attori è privato e non va committato né condiviso.

Il percorso RED→GREEN include API di revisione mancante, pubblicazione legacy
non confermata, etichetta studente inesatta, recupero del conflitto senza
perdita delle note e replay della pubblicazione dopo revoca. I test concorrenti
PostgreSQL verificano che due salvataggi con lo stesso predecessore producano
una sola nuova revisione.

Esiti del collaudo sintetico del 22 ottobre 2026:

| Verifica | Esito |
| --- | --- |
| Study Core + Study API, incluso PostgreSQL16.15 locale | 803 PASS; 18 SKIP dei contratti Supabase live |
| Web unit/component | 251 PASS, 36 file |
| TypeScript Web | PASS |
| Build Web privata | PASS; avviso per il bundle di matematica oltre 500 kB |
| Browser C2-B con API reale, viewport 390/820/1440 | 1 PASS; nessun overflow orizzontale o errore JavaScript |
| Coerenza del diff | `git diff --check` PASS |

## Limiti dell'incremento

Il collaudo usa esclusivamente identità, note, banche e database sintetici.
PostgreSQL locale copre migrazione, RLS e concorrenza; i contratti che richiedono
il servizio Auth/Storage Supabase rimangono separati e richiedono
`ARDESIA_SUPABASE_ENV_FILE`. Non è stata eseguita una migrazione o una verifica
con credenziali reali. Questo incremento non corregge né approva scientificamente
il corpus e non abilita un processo pubblico di revisione. Le note non ancora
salvate si perdono lasciando la schermata; il recupero da conflitto rimane
nella stessa schermata e le conserva.

## Screenshot reali del collaudo locale sintetico

Queste immagini provengono dal browser collegato alla Study API locale; non sono un deployment pubblico né nuove catture REA. Identità, banca e osservazioni sono fixture sintetiche.

- [Revisione privata, 390 px](../deliveries/2026-10-22-c2b/private-review-390.png)
- [Revisione privata, 820 px](../deliveries/2026-10-22-c2b/private-review-820.png)
- [Revisione privata, 1440 px](../deliveries/2026-10-22-c2b/private-review-1440.png)
- [Storico dopo la revoca, 1440 px](../deliveries/2026-10-22-c2b/revoked-history-1440.png)
