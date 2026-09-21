# Chiusura review R-03b — 21 settembre 2026

**APPROVE**, limitato alla patch R-03b sul candidate indicato. Nessun finding
del revisore indipendente. Il finding di acquisizione persistente emerso nella
review R-03 è risolto in questa patch; il coordinatore non aggiunge self-approval.

## Identità e perimetro

- Candidate prodotto: `a90d3563014c5cd995630a37ea164f42f4c40b9c`.
- Base: `b76611be7bcfd738d31c9b845a6be1acd95ded74`.
- Head documentale prima della review: `54635723e61fac72e7f7727e9a29e0fb33541660`.
  Dopo il candidate sono stati aggiunti soltanto checkpoint e probe browser.
- Coordinatore/builder: `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`,
  branch `codex/restart-review-postlesson-20260921`.
- Reviewer: `/root/r03b_independent_review`, contesto nuovo (`fork_turns=none`),
  checkout separato `/Users/andreamarro/VOLUME 3/ardesia-codex-r03b-review-20260921`.
  Routing richiesto `gpt-5.6-terra/high`; modello/effort effettivi non esposti,
  `inherited/unknown`, come nel receipt del revisore.

La [preregistrazione](preregistration.md) precede la delega. La review riguarda
l'acquisizione persistente nell'export Recap e il rilascio delle connessioni,
con conservazione dei percorsi validi. Non certifica l'intero workflow docente.
Il precedente REQUEST_CHANGES e i receipt R-01/R-02/R-03 restano immutati;
il PENDING nel checkpoint del builder descrive lo stato precedente alla review.

## Prove indipendenti

Il [receipt originale](reviewer-original/manifest.txt) e il
[probe indipendente](reviewer-original/probes/R03bIndependentPostOpenProbe.temp.test.tsx)
documentano una controprova nuova: dopo l'apertura riuscita del database, la
transazione di lettura avviata dall'exporter viene fatta fallire. Attraverso
RecapView, adapter, WorkspaceStore e ZIP reali su fake-indexeddb, la prova verifica
alert, zero download, close() sulla precisa handle appena aperta e pulsante
riattivato. Ripristinata la transazione, il retry contiene il fatto corrente.
Il nuovo probe verifica la presenza di quel fatto; non misura da solo l'assenza
di ogni possibile evento estraneo. La distinzione è esplicitata
nell'[addendum del revisore](reviewer-original/clarification.txt), che mantiene
APPROVE e attribuisce le prove di isolamento ai test committati rieseguiti.

| Esecuzione indipendente | Risultato |
|---|---|
| Nuovo probe dopo apertura | exit 0; 1 test, 2 s nel runner |
| RecapLiveExport, RecapView, LessonOsLiveSnapshot | exit 0; 29 test, 3 file, 5 s |
| npm run typecheck | exit 0; 15 s |
| npm run build | exit 0; 15 s, warning Vite sui chunk |

I 29 casi committati sono distinti dalla nuova controprova. I quattro casi di
errore in acquisizione aggiunti dal builder sono regressioni rieseguite, non
nuovi controesempi del reviewer. Node v22.14.0, npm 10.9.2, Vitest 4.1.8;
flag deterministici e comandi effettivi nei metadati dei log. I tempi sono quelli
interi del runner, non la durata complessiva del lavoro.

I primi due tentativi del probe restano conservati: un'asserzione contava anche
la chiusura concorrente della handle del digest; la versione finale identifica
la handle dell'export. Il primo runner usava inoltre una variabile zsh riservata,
quindi mancano exit/durata finali nei suoi metadati. Non sono finding prodotto
e non vengono presentati come RED della patch. Nessuna asserzione committata o
gate è cambiato. Il probe temporaneo è stato rimosso prima di regressioni,
typecheck e build; checkout e byte del candidato risultano invariati.

Suite completa, gate congelato, browser nativo ed Engine/PDF non sono rieseguiti
dal reviewer. I risultati del builder rimangono storici e separati; in particolare
il suo gate usava l'opzione ambientale Web Storage già documentata. Non c'è una
nuova certificazione dell'ambiente Node 26 ordinario o della pipeline completa.

## Provenienza, ambiente e limiti

I 30 file originali sono preservati nell'[archivio](reviewer-original/raw-artifacts.zip),
con verifica di ogni byte e hash contro il [manifest](reviewer-original/SHA256SUMS)
prodotto dal revisore. Estrarre l'archivio in una cartella vuota e, dalla cartella
estratta, eseguire `shasum -a 256 -c SHA256SUMS` per ripetere il controllo.
Receipt, addendum, runner, probe e manifest hanno anche copie testuali identiche.
Il [record della copia](evidence-copy.json) conserva anche l'hash del manifest e
il controllo su tutti gli artifact, inclusi i log, per NUL e pattern di segreti.
Nessun originale è stato ripulito o ricostruito dai riassunti.

Il coordinatore ha verificato la [provenienza delle prove del builder](builder-evidence-provenance.json):
dieci record di comando con hash dei log, identità dei byte prodotto,
quattro archivi A/B con memoria identica fra Recap e Materiali, più l'archivio
del retry contenente memoria corrente. Questo è un controllo di conservazione,
non una riesecuzione indipendente. La review iniziale D2 resta byte-identica.

Il checkout del revisore è sparse, al candidate, con i pack richiesti inclusi.
Studio usa un collegamento alle dipendenze già installate del builder; lockfile
identico, SHA-256 `0f7c344b16bab89fb7312a4375533cc7f7715e217837a32cf165b1ee3ccf21d4`.
Separati agente, contesto e sorgenti; condivisi macchina e dipendenze. Nessuna
nuova installazione. Il coordinatore non ha eseguito Studio in parallelo.
Questa review Codex non soddisfa il distinto quorum fra provider di Kirchhoff.

Il [preflight](preflight.json) registra la rilettura di PR #256: OPEN/DRAFT,
head `705284acc4322db4d241032de071437ab0473cc1`, base/main remoto
`b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse. I check
remoti riportati appartengono alla PR precedente, non al nuovo candidate locale.
Nessuna nuova misura del deploy; stato generato locale/offline.

Root ha eseguito i gate boundary e workflow con exit 0. Il primo conserva
i 12 offender storici senza aggiunte. I controlli finali di documentazione, NUL,
pattern di segreti e spazi Git passano con exit 0.
La prima importazione testuale dei log produceva exit 2 nel controllo Git degli
spazi: sette righe vuote finali e uno spazio emesso da Vite. Il gate documentale
segnalava inoltre exit 1 sul percorso abbreviato del README originale del reviewer.
Gli originali sono quindi conservati integralmente nell'archivio, senza modificarne
i byte; le copie testuali di consultazione non includono README e log grezzi.
Nessuna regola del gate o allowlist è stata cambiata. I tentativi iniziali restano
registrati in artifacts/restart/commands.jsonl con prefisso r03b-review-root.
Le variabili dei provider sono rimosse dai processi di verifica senza stamparle.
Nessun vault, Basic Memory, AgentMemory, dato studente o chiamata LLM esterna.

## Stato e unica prossima azione

`PATCH_INDEPENDENT_REVIEW=APPROVE` sul solo candidate R-03b. I percorsi Recap
corretti da R-01, R-02 e R-03/R-03b hanno ora receipt indipendenti per i rispettivi
ambiti. Factory generale e altri chiamanti mantengono i limiti già dichiarati;
non viene introdotta una garanzia globale di persistenza, integrità o flush.

**Unica prossima unità proposta: R-04, riconciliazione documentale.** Riallineare
i claim D2 su check richiesti, copertura delle azioni utente, differenze F-03 e
inclusioni/esclusioni dell'ack alle prove congelate e allo stato reale. Questo
chiude il debito documentale prima di una decisione di rilascio, senza cambiare
branch protection o prodotto. È una nuova unità, non implementata nella review.
Il pilot richiede ancora input reali autorizzati e una decisione esplicita sul
provider/configurazione/spesa; resta preparato e non eseguito. Kirchhoff invariato.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r03b-independent-review-20260921`; skill persistent-capability-evolution,
revisore Codex nativo con contesto nuovo e runner del repository. Root registra
modello/effort `inherited/unknown`. Esito della capability: controprova aggiuntiva
e APPROVE circoscritto, con limiti e tentativi non riusciti conservati.
Nessuna quota di routing dichiarata raggiunta, promozione, riscrittura di gate
o dipendenza aggiornata. Preregistrazione, receipt, last-use e next-gate aggiunti
localmente senza riscrivere i precedenti. Nessun registro esterno consultato;
`INDEX_SYNC_DEFERRED`, AgentMemory `RETIRED_NO_READ_NO_WRITE`.
