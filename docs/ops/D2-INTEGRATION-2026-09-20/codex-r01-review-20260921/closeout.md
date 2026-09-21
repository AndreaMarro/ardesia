# Chiusura review R-01 — 21 settembre 2026

Esito del revisore separato: **APPROVE, limitato alla patch**. Nessun nuovo
finding azionabile; questa ricezione non aggiunge una self-approval del builder.

- Timestamp di conservazione: 2026-09-21T17:34:29.838462+00:00.
- Base: `705284acc4322db4d241032de071437ab0473cc1`.
- Codice revisionato: `d8e360389addb8a4339290a38763cd6dea58358b`.
- HEAD documentale precedente: `975f2368d1d8f0e7d2d5b4a15f4a4c7ff42632f7`.
- Branch locale: `codex/restart-review-postlesson-20260921`.
- Revisore: task `/root/r01_independent_review`, contesto nuovo
  (`fork_turns=none`), copia isolata al commit esatto.
- Routing richiesto: `gpt-5.6-terra/high`, ruolo audit. Modello effettivo:
  `inherited/unknown`; non dedotto dalla richiesta di routing.
- Coordinatore: autore della patch precedente; ha verificato corrispondenza
  dei byte, sorgente/log della controprova e riferimenti puntuali del verbale.

## Evidenza ricevuta

Il [verbale del revisore](reviewer.md) è copiato senza modifiche. Conservati
anche [sorgente della controprova](R01DigestDelayedReadProbe.test.tsx.txt) e
[comando/output](R01DigestDelayedReadProbe.log.txt), byte per byte.
La prova sospende la lettura già avviata del log di A, apre B, attende il digest
B e rilascia A; verifica che A non ricompaia e che entrambe le handle si chiudano.
È distinta dal caso già presente di apertura del log ritardata.
Per riprodurla, in una copia isolata dello SHA revisionato collocare il sorgente
nella directory dei test Studio con il nome indicato nel log, eseguire quel comando
e rimuovere soltanto la propria copia temporanea dopo aver conservato il risultato.

Esecuzioni dichiarate dal revisore sullo SHA esatto: 25 test digest/UI, 56 test
IndexedDB/HTML, 1 controprova nuova, `tsc -b --noEmit` e build: tutti exit 0.
Node 22.14.0, dipendenze dal lockfile, credenziali provider rimosse dai processi.
Il sorgente e l'output durevole della nuova prova sono stati letti dal coordinatore;
per gli altri controlli la ricevuta del revisore è la fonte. Nessun conteggio del
builder viene presentato come nuova esecuzione indipendente. Nessuna nuova suite
completa o E2E in questa review; il verbale dichiara questo limite.

SHA-256 delle copie conservate:

- `docs/ops/D2-INTEGRATION-2026-09-20/codex-r01-review-20260921/reviewer.md`: `891ee9d32d01593cc8a86b446d0390deb6a86d403ce886dcf46c458f32d871d0`
- `R01DigestDelayedReadProbe.test.tsx.txt`: `f91de6de2a95f3412892afa61f7f963e073f00d63f7e072800a8d136630b0e14`
- `R01DigestDelayedReadProbe.log.txt`: `868f4fd76cae2a4b407e379ff0183c2d15f658ae8837b993fe96e0169749d15f`

## Indipendenza e incidente di perimetro

Separazione effettiva: agente, contesto e worktree distinti; nessuna storia della
conversazione builder ereditata. Restano condivisi piattaforma Codex, repository,
briefing scritto dal builder e vincoli di scopo. Non è una review fra provider o
famiglie differenti e non soddisfa il quorum separato richiesto per Kirchhoff.

Il briefing iniziale vietava già letture del vault esterno. Il revisore ha letto
per errore `/Users/andreamarro/ARDESIA-KNOWLEDGE/40-Capability-Evolution/00-INDEX.md`
seguendo il preflight della skill; il successivo messaggio ha ribadito il divieto.
Il revisore ha dichiarato di non usare quel contenuto come evidenza sul codice e
ha interrotto ulteriori accessi. L'utente è stato informato durante il lavoro.
La lettura di `/Users/andreamarro/.codex/skills/persistent-capability-evolution/SKILL.md` era invece prevista dalle
istruzioni sulle skill; non va confusa con la lettura non autorizzata del canon.
Nessun contenuto del vault è riportato qui. Nessuna scrittura al vault eseguita.

## Stato e singola prossima azione

La review indipendente **locale** di R-01 è conclusa sullo SHA indicato.
Questo commit aggiunge soltanto verbale e prove documentali; il codice della patch,
i test committati e i receipt congelati precedenti sono invariati. Non modifica
l'interpretazione dei vecchi checkpoint: il loro stato PENDING era storico.

PR #256 ancora OPEN/DRAFT a `705284acc4322db4d241032de071437ab0473cc1`, zero
review GitHub sottomesse al controllo di questa sessione. Il nuovo commit non è
pubblicato né coperto dalla vecchia CI remota. Non si dichiara il prodotto pronto.
Restano R-02 journal per-room/parser v2, R-03 export live dal riepilogo, R-04 claim
documentali e il limite provider/pilot già registrati. Kirchhoff resta separato.

**Prossima unità:** R-02, far leggere al riepilogo il journal della lezione nel
formato v2 prodotto dal recorder, con RED su byte del producer reale prima della
correzione. È il prossimo ostacolo concreto al post-lezione; non è stato avviato
in questa review e non richiede di integrare Kirchhoff.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; EXTERNAL_PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r01-independent-review-20260921`; preregistrazione e provenienza sotto
`artifacts/r01-review` locali. Capability: revisore Codex nativo con contesto nuovo,
runner del repository, skill `persistent-capability-evolution` già disponibile.
Un agente audit effettivamente avviato; nessun nuovo plugin, promozione o quota
50/30/20 dichiarata. Unità di review accettata limitatamente a R-01; il modello
risolto resta non esposto. Registry/canon esterno non aggiornato per il mandato
senza vault; questo append conserva last-use/esito/next-gate. `INDEX_SYNC_DEFERRED`.
AgentMemory `RETIRED_NO_READ_NO_WRITE`, nessun probe. Gate e soglie invariati.
