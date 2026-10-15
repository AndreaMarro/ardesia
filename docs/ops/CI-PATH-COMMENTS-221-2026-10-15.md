# Commenti CI sui filtri di path — recupero PR #221

Stato locale precommit: commenti integrati e verificati; APPROVE tecnico separato sul solo hash, pin del futuro commit ancora pendente. Base locale e1216fd87dbb7dad05cfcf64a7b2ff35346402b0, parent originale ee597a19d469248dabe6f95af67851942c30fce9. Nessuna nuova esecuzione GitHub o integrazione in main.

## Contributo e genealogia

Il nucleo #220, commit f546ce6cf8fe5fc966720d34783d3bb74e6ccc1a, è già antenato del candidato; i commenti della #221 sono invece assenti nel workflow corrente. La PR contiene 529ba86c (commenti), 3076c87c (esperimento temporaneo filtro base) ed ee597a19 (suo revert): tutti preservati con merge conservativo, senza applicare il tree vecchio sul nuovo. Il confronto diretto con la base PR attuale5c0a2822 include arretratezza su altri tre file (simulation, test e gate): non è il contributo incrementale. Merge-base reale f546ce6c e confronto three-dot: un solo workflow, sei righe di commenti. Il merge riuscito senza conflitti ha confermato quell'unico delta.

Il valore dei commenti è nel punto d'uso: distinguono filtro sulla base PR e filtro sui file cambiati; ricordano il Pending che un workflow saltato può lasciare se il suo check fosse required. La distinzione è già coerente con docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md e con il gate corrente; non crea una nuova norma o nuova protezione.

Precisata la raccomandazione finale: un job aggiunto allo stesso workflow filtrato non risolve il Pending. Prima di un'eventuale promozione occorrerebbe un workflow eleggibile per ogni PR, con selezione interna e check che riporti sempre. Questa unità aggiunge soltanto il commento: nessun trigger, condizione, job o branch protection è cambiato. [Documentazione GitHub consultata il 15 ottobre 2026](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushpull_requestpull_request_targetpathspaths-ignore): i filtri path dipendono dai file cambiati e un workflow filtrato può lasciare i check richiesti Pending. È un supporto alla descrizione, non una prova della configurazione amministrativa remota del repository.

## Verifiche proporzionate

- YAML prima/dopo semanticamente identico in memoria con PyYAML. Unico file modificato prima dei documenti: .github/workflows/studio-preview-readiness.yml, solo commenti.
- workflow_trigger_gate.py exit0; self-test esistente20PASS; diff-check staged exit0. Nessun nuovo test tautologico per commenti.
- Applicazione, test prodotto, solver, gate e tutti gli altri workflow byte-identici alla base e1216fd8. Il Node pin corrente22.12.0 e la nuova lane244 restano conservati.
- Nessuna nuova suite app/build/browser ripetuta per questo delta documentale. Il gate2474/0 con replay1PASS appartiene all'unità244 precedente e non viene riclassificato come nuova esecuzione221.
- L'esperimento storico stacked5vs5 e il rosso temporaneo fanno parte della provenienza PR; non sono nuove misure della CI odierna. Nessun esperimento rosso deliberatamente pubblicato in questa tranche.

Hash del workflow finale precommit:

```text
865c29d897c659e2315bb6d6588ced1219b005a658bc1f35d4426976da58fe2b  .github/workflows/studio-preview-readiness.yml
```

Review tecnica in contesto Codex separato: APPROVE sul solo hash, nessun nuovo P0/P1/P2/P3 individuato. Report privato SHA256 ea7955782305842e7f1a652579d234627d00f38eee38ce046ae725cde1bf5c5d. Pin commit/receipt/ledger: PENDING; verrà registrato separatamente. L'identificatore specifico del modello non è esposto; non è quorum non-Codex o approvazione GitHub.

## Destinazione e limiti

Contributo non ancora assorbito in main e PR non chiusa. Recupero nel singolo candidato locale Ardesia, senza code push, merge in main, deploy, modifica delle protezioni o attivazione di nuovi servizi. Prima della pubblicazione restano effetti automatici Vercel verificabili, CI sul commit esatto e approvazione GitHub distinta richiesta. Non attestiamo la configurazione remota dei filtri oltre al sorgente locale letto. Log e assessment restano nel workspace privato; nessuna chat personale è riversata nel repository.
