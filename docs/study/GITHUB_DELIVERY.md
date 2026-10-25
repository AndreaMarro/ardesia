# ARDESIA Fisica — consegna M1 e preparazione locale M2

Pubblicazione su GitHub richiesta dall’owner il 19 ottobre 2026. Il codice prodotto verificato è il commit `d966863eba06a735ad01e1da1211033642a5bc98`; i commit successivi di consegna aggiungono documentazione, archivio delle prove e il blocco dei deploy automatici per questo branch. Nessun merge o deploy è autorizzato da questa consegna.

## Cosa contiene

- Studio `?vista=fisica`: post-it contestuali, laboratorio deterministico, consegne private multimodali, ricevute/idempotenza, review del tutor, nuovo tentativo e memoria LessonOS persistente.
- Gestione transazionale della capienza; isolamento di studenti/tutor; inviti monouso e revoca accessi; backup v2, ripristino a freddo e cancellazione logica nel perimetro Study con replay su backup precedenti.
- Banco originale DRAFT: 24 esercizi, quattro modelli manipolabili e due prove di trasferimento con sei nuovi quesiti. I modelli/ID RF/TR sono anteprime editoriali; la pipeline di consegna/review attuale traccia `poiseuille-v1`.
- Piano, runbook, rubriche e schede per le decisioni scientifiche, operative e commerciali umane. Nessuna firma scientifica, prova umana, vendita o efficacia educativa è stata inventata.

## Prove locali

| Controllo sul codice prodotto | Esito |
| --- | --- |
| Studio | 2.155 passati, 5 skip |
| Engine | 2.114 passati, 7 skip dichiarati |
| API Study | 12 passati |
| Gate Studio congelato, incluso replay | 2.156 passati, 0 errori |
| Typecheck, build e 12 controlli hygiene | PASS |
| Percorso con tutor e dieci contesti studente, cold reopen, nuovo banco/inviti | PASS su build |
| Restore HTTP e cancellazione riapplicata a backup precedente | PASS su copie sintetiche |

La review indipendente ha individuato quattro difetti materiali, tutti riprodotti e corretti con prove RED/GREEN. Le correzioni e una successiva regressione di compatibilità HTTP hanno verifica dell’autore e suite complete; non si rivendica una seconda review indipendente dei fix. Gli skip comprendono provider live assenti, corpus reale non disponibile e integrazione con un checkout sibling non presente. Nuovo consumo API prodotto: 0 USD.

## Archivio completo della sessione

Scaricare [ardesia-m1-m2-evidence.zip](evidence/2026-10-19/ardesia-m1-m2-evidence.zip). Il [manifest esterno](evidence/2026-10-19/archive-manifest.json) contiene dimensione e SHA256 dell’archivio.

Il pacchetto comprende i quattro file di partenza, report/ricevute M1 e M2, log e casi RED/GREEN, manifest dei run, screenshot/video sintetici, quaderni sintetici, packet di revisione scientifica, patch e bundle Git. Sono conservati anche i tentativi precedenti e i relativi errori: le ricevute finali indicano quali run costituiscono la prova accettata.

Dopo l’estrazione:

- `artifacts/study-m2/FINAL_REPORT.md` e `final-receipt.json`: consegna finale M2 locale sullo SHA indicato.
- `artifacts/study-m2/final-checks/`: comandi, exit code e log finali.
- `artifacts/study-m2/run-2026-10-19T21-21-02-985Z/`: build/browser, restore/cancellazione e schede di revisione del contenuto.
- `artifacts/study-demo/final-receipt.json`: ricevuta storica M1, non sovrascritta.
- `source-dossier/`: HTML e tre documenti di partenza, trattati come fonti e distinti dalle autorizzazioni dirette dell’owner.
- `PUBLICATION-MANIFEST.json`: inventario con SHA256 originali e pubblicati per ogni file.

Le directory runtime, i database e le credenziali sono esclusi. Prima della compressione sono stati controllati i pattern di segreti del repository e l’assenza dei token di accesso runtime effettivi. Nei file di testo i percorsi locali diventano `REPO_ROOT`, `SOURCE_DOWNLOADS`, `CODEX_HOME` e `USER_HOME`. Le ricevute conservano gli hash originali come prove storiche: usare `publishedSha256` nel manifest per verificare i file dopo questa sola normalizzazione dei percorsi. I quaderni esportati e i media sintetici non sono alterati.

## Avvio e limiti del pilot

Vedere [README](README.md), [runbook M2](m2-runbook.md), [scheda umana](m2-human-kit.md), [decisioni ancora aperte](m2-decisions.json) e [review](m2-fresh-review.md). Il backend si avvia soltanto in modalità sintetica e loopback. M2 umana/commerciale resta aperta: review scientifica, prova personale tutor, privacy/diritti/conservazione, identità/TLS/storage del deployment scelto, calendario/condizioni/supporto e accessibilità su dispositivi reali.

Il repository ha una integrazione Vercel che ha prodotto preview in passato. `vercel.json` imposta `git.deploymentEnabled` a `false` soltanto per `codex/semestre-filtro-m1-20261019`, usando la [configurazione ufficiale Vercel](https://vercel.com/docs/project-configuration/git-configuration). Gli altri branch conservano il comportamento precedente. La PR resta draft, senza auto-merge. Il riesame dei quattro file ogni 60 minuti continua nel task locale.
