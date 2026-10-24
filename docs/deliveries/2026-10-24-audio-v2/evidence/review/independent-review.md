# Revisione indipendente — AUDIO-V2 e Poiseuille

24 ottobre 2026, base `ae25b93bec826539940e0226da1f0cd8cebff0b1` + diff del ramo
`codex/ardesia-audio-v2-poiseuille-20261024`. Il revisore ha scritto il fix
catalogo, ma non audio, bundle, Room, replay o esperienza Poiseuille. Durante
questa review ha modificato soltanto `AudioV2_independent.test.ts` e le prove
in questa directory; le correzioni prodotto sono degli autori.

## Esito sullo scope verificato

**Nessun finding aperto nei casi indipendenti eseguiti.** Sono conservati i RED
precedenti alle correzioni: non vengono sostituiti dai GREEN. Non è una
certificazione generale del prodotto né del singolo run CI catalogo storico.

- `audio-independent-start-errors-recheck.log`: **14 PASS**, 0 FAIL, 10.01 s.
- `independent-typecheck-final.log`: Studio `tsc -b --noEmit`, exit 0, include
  il file dei 14 test.
- `source-budget-green.log`: input fuori budget rifiutato prima della consegna;
  quattro fonti + originale = cinque, export Core riuscito.
- `status.json`: hash dei sorgenti del candidato al checkpoint. Nessun commit
  nuovo viene attribuito ai test: sono esecuzioni sulla base + diff locale.

## Finding riprodotti e corretti

| ID | Difetto osservato | RED conservato | Controprova corrente |
| --- | --- | --- | --- |
| R1 / P2 | Errore nativo + onstop fermano le tracce ma lasciano lo stato `recording`; errore non visibile senza un secondo gesto. | `audio-independent-red.log`, 1 FAIL / 2 PASS | Il test ora vede subito `error`; stop spontaneo conserva il tail senza richiedere il bottone. |
| R2 / P1 | Import già validato e preparato, revoca OFF+purge completata, ripresa import: vecchio ON e media vengono riscritti. La validazione iniziale della revisione non protegge il commit. | `audio-independent-import-race.log`, 1 FAIL / 5 PASS; confermato anche in `audio-independent-hostile.log` | Fence sotto il lock di WorkspaceStore, guard di stage/backup, purge delle copie import e rollback che preserva CAS successivi. Lo stesso interleaving resta OFF. |
| R3 / P1 | Un bundle precedente ON con revisione falsificata a 999 e manifest ricalcolato supera il confronto numerico e sovrascrive OFF locale. | `audio-independent-forged-revision.log`, 1 FAIL / 9 PASS | Un input non autenticato non riabilita un OFF locale esplicito con revisione > 0. Import su store nuovo resta consentito. |
| R4 / P2 | `MediaRecorder.start()` sincrono fallito lascia `requesting`; seconda CAS dopo l'avvio fallita diventa `idle` dopo il tail, nascondendo l'errore. Nel primo caso il drain può attendere un onstop che non arriverà. | `audio-independent-start-errors-red.log`, 2 FAIL / 12 PASS | Entrambi mostrano `error`; lo start mai avvenuto chiude il take senza aspettare un evento nativo inesistente; il take realmente avviato attende il tail. |
| R5 / P2 | Cinque source_refs legali + activityEvidence producono sei riferimenti dopo l'aggiunta dell'originale; il notebook portabile ne ammette cinque e l'export fallisce. | `source-budget-red.log`: submissionAccepted=true, storedSourceCount=6, notebook_budget_exceeded | Guard prima della transazione per evidence+>4 riferimenti, mantenendo il limite del consumer; quattro input restano esportabili con l'originale. |

R5 era un'ipotesi segnalata dall'autore, poi riprodotta autonomamente dal
revisore. Anche R4 è stato suggerito dall'autore prima dei due RED indipendenti.
L'origine dell'ipotesi non sostituisce l'esecuzione della controprova.

## I 14 contratti avversariali eseguiti

1. Errore nativo osservabile senza gesto stop aggiuntivo.
2. OFF serializzato dietro la seconda CAS ON bloccata: nessun marker o byte.
3. Versione oggetto mai registrata rifiutata senza marcarla come evidenza verificata.
4. Stop nativo spontaneo: tail persistito e marker disponibile senza nuovo gesto.
5. Bundle vecchio importato dopo revoca già completata: rifiuto.
6. Revoca completata dopo preflight/prepare dell'import ma prima dei target: OFF preservato.
7. Byte audio alterati con manifest esterno ricalcolato: rifiuto prima di scritture sul target.
8. Sottoalbero di sessione B introdotto nel bundle A, con manifest coerente: rifiuto prima di scritture.
9. Annotazione aggiunta durante il take: endpoint finale risolvibile con ID registrazione,
   sessione, digest, ID/versione oggetto; ogni pin alterato e l'istante antecedente
   alla creazione dell'oggetto sono rifiutati.
10. Revisione importata falsificata non supera una revoca locale esplicita.
11. Dispose durante permesso pendente: stream tardivo rilasciato, nessun take o
    media; dispose non viene spacciato per revoca persistente.
12. Purge fallito: errore visibile, byte residui esplicitamente non disponibili
    al replay per consenso OFF; nuovo gesto di revoca completa la cancellazione.
13. Eccezione sincrona di native start: errore visibile, tracce rilasciate,
    dispose drainabile.
14. Seconda CAS fallita dopo l'avvio nativo: errore visibile anche dopo onstop,
    nessun marker prodotto.

La disponibilità del replay viene verificata sullo store reale in memoria e
sui validator/journal effettivi. I byte e il recorder sono sintetici; il test
non dichiara decodifica, microfono fisico o comportamento di un browser nativo.
Le prove native dell'integratore sono separate.

## Lettura indipendente dei consumer

Sono stati letti piano esecutivo, contratti multimodali, AGENTS Studio,
SessionAudioRecorder, schema audioRecording, journal, timeline, replay,
WorkspaceStore, bundle/transazione/fence e i collegamenti Room/PassageAuthor.

Nel verticale Poiseuille sono stati letti manifest delle due varianti,
learning_experiences, submissions, componenti episodio/fonte, test Core/HTTP/Web
degli autori e consumer del notebook portabile. Le previsioni vengono congelate
nella ricevuta prima di mostrare il risultato. Il Core distingue aiuti dichiarati
e risultati precedenti disponibili, senza trasformare NO_SUPPORT_REQUESTED in
padronanza autonoma verificata. La fonte viene risolta per resource/revision
esatte tramite autorizzazioni Core; l'ID di edizione viene controllato. La
Classroom è ricreata con `courseScope`, evitando il riuso del percorso tra scope.

Un'osservazione sul passaggio da URL al tempo iniziale a URL al tempo finale è
stata comunicata mentre lo sviluppo era in corso. Root e autore hanno aggiornato
producer e validator prima del checkpoint: ora `session`, `sha`, `objectVersion`
devono corrispondere, e il tempo deve appartenere al take. Non si attribuisce
un RED indipendente a quel disallineamento transitorio. Il test indipendente 9
copre il resolver corrente con un oggetto realmente aggiunto durante il take.

Font: letti `main.tsx`, Vite e `build/localExcalidrawFonts.ts`. L'asset path
locale è impostato prima della canvas lazy e il plugin serve/emette i woff2
della dipendenza bloccata. Questo controllo è di configurazione; richieste
HTTP e resa mobile sono prove browser dell'integratore.

## Riproduzione e limiti

Dal checkout, senza lanciare contemporaneamente altre suite complete:

```sh
cd apps/studio
PATH=/opt/homebrew/bin:$PATH npm exec -- vitest run src/__tests__/AudioV2_independent.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
PATH=/opt/homebrew/bin:$PATH npm run typecheck
cd ../..
services/study-api/.venv/bin/python docs/deliveries/2026-10-24-audio-v2/evidence/review/probe-source-budget.py
```

Il primo tentativo Studio aveva cwd root e mancava le define Vite del package:
`audio-independent-runner-cwd-error.log` è un errore del runner, non un RED
prodotto. È stato corretto il cwd prima di attribuire R1. Un successivo comando
di append del probe usò erroneamente un path root da cwd Studio: non modificò
il test, poi il percorso venne corretto. Il log di finding è quello indicato
nelle tabelle, non l'errore di invocazione. L'avviso Node 26 sulla disponibilità
iniziale di localStorage è conservato; i test installano lo stub esplicito.

`probe-source-budget-original.py` conserva il probe che produceva il RED
precedente alla guardia; quello corrente verifica il nuovo limite atomicamente.
I due limiti vengono documentati senza estendere il consumer portabile.

Non verificati da questa ownership: microfono fisico, FSA, altri browser,
crash/power-loss reali, restore Auth/Storage remoto, cancellazione retroattiva di
copie già esportate, efficacia didattica, approvazione scientifica umana,
deploy o gate marketing/beta. Full suite, build, browser e CI finale restano
prove dell'integratore. Nessun merge, deploy, spesa o inferenza eseguiti.
