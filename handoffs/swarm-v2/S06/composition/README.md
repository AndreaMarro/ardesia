# S06 — raccordo App / factory / lettore, 26 ottobre 2026

Continua la stessa PR309 e il codice2401f4c9; non riscrive il primo batch o l'acquisizione FSRS. Il nuovo reader è nel namespace S06. I tre raccordi condivisi sono una **patch proposta**, applicata soltanto a una copia temporanea isolata per provarla: nessun writer S06 su App/factory/SourceViewer del checkout owner, nessun merge/deploy.

## Patch esatta e dipendenza reale

`shared-composition.patch.gz` contiene una patch unificata lossless contro App/factory/SourceViewer della main992d1a0b (byte uguali nel ramoS06 prima del raccordo). source-manifest.json riporta SHA256 prima/dopo, hash patch decompressa e fileS06 richiesti. La v1 a due file è conservata come proposta storica SUPERSEDED_NOT_APPLIED. Usare soltanto la patch corrente a tre file.

Serve il contratto Shell316, head3326ac2e30624248c01b67f2ac876671e5ed3886: View include independent-study ed enabledViews è input del root. Il codice della Shell non viene modificato da S06. Il ramo S06 rimane compilabile senza questi hook: la dipendenza316 diventa necessaria per la composizione proposta. Non importare un App intero da un altro filone o forzare patch su un candidatoS00 già cambiato: riconciliare prima gli hash e le altre route montate.

I tre interventi:

1. App: lazy IndependentStudy, voce disponibile soltanto allo studente iscritto con workspace corrente; fallback delle route non disponibili; key/props actor-edition-session correnti. Proiezione memoizzata che esclude esattamente i tre kind macchina dalle viste ordinarie, lasciando note e fattiCore intatti.
2. FactoryAPI: import/install dell'installer S06 con store_dependency/authenticate reali, due righe, senza nuovo auth/store/schema o monkeypatch.
3. SourceViewer: reader tipizzato S06 prima dei rami generici. Fonte editoriale e planner non mostrano JSON o svolgimenti futuri. Il tentativo mostra risposta/procedimento e aiuti **riportati nella fonte**, senza attestare emissione o assenza di aiuti. Citazione dell'originale del tentativo valida e opt-in, chiusa di default; indici DOM UTF16 convertiti in codepoint del Core. Nessun indice assegnato al testo riformattato. Fonti editoriali/planner non sono citabili in questa vista; restano revisioni originali nel Core.

Il reader non è un verificatore di provenienza: i kind generici sono caller-writable. Solo il dominio S06 ricostruisce fatti canonici da eventi/ricevute; questa proiezione non aggiunge una seconda autorità. Le risorse malformate falliscono senza mostrare rawJSON. Le note ordinarie conservano il lettore esistente. La conversione Unicode proposta riguarda soltanto citazioni S06; il precedente contratto dei reader generici non viene riscritto qui.

## Riproduzione in ambiente isolato

Prerequisiti: Python>=3.12 con FastAPI/HTTPX/pytest, Node e dipendenzeWeb/Playwright già installate dal repository. Nessuna installazione o fetch implicito. Rispettare lo slot host; un solo build/browser per volta. Leggere source-manifest.json e scegliere la SHA esatta S06 consegnata, non presumere che una branch mobile sia immutabile.

Eseguire prepare.py passando il Git common dir, la SHA S06 contenente questi file, una destinazione **nuova** e i node_modules esistenti:

```sh
python prepare.py --git-dir /repo/.git --s06-ref SHA_CONSEGNATA --target /scratch/nuovo-snapshot --dependencies /repo/node_modules
```

Il programma estrae sorgenti Git ai pin, sovrappone la sola Shell316, verifica gli hash, applica la patch solo al nuovo snapshot e ricontrolla gli hash. Copia il test SourceViewer opt-in nel namespace dello snapshot. Non modifica ref Git, checkout owner, dipendenze o database esistenti. Una destinazione già esistente o una deriva dei file ferma la composizione.

Nella root dello snapshot:

```sh
PYTHONPATH=packages/engine:services/study-api python -m pytest handoffs/swarm-v2/S06/composition/test_factory_composition.py -q
npm run test --workspace @ardesia/web -- src/features/independent-study --maxWorkers=1
npm run build --workspace @ardesia/web
```

Poi avviare il server con `PYTHONPATH=packages/engine:services/study-api python -m uvicorn server:app --app-dir handoffs/swarm-v2/S06/composition --host 127.0.0.1 --port 5361`, specificando `S06_COMPOSITION_DATA` come directory nuova e vuota. Il server rifiuta fixture già popolate: non reimpiega token revocati, non resetta DB storici. Attendere che il server abbia completato lo startup e che `/study/me` risponda401 senza cookie. In un secondo terminale usare lo **stesso** S06_COMPOSITION_DATA e `node handoffs/swarm-v2/S06/composition/browser.mjs`; S06_OUTPUTS opzionale cambia la destinazione delle prove. Il runner revoca le sessioni sintetiche alla fine. Chiudere server/browser propri dopo la prova.

Il middlewareCSP del solo harness impone script-src self senza unsafe-eval per la controprova; non si afferma che tali header siano già configurati in produzione. La fixture è locale e sintetica. Il pointer seleziona il frammento nel textarea reale; non imposta anchor o fatti applicativi. Il Core riceve e valida la citazione attraverso il form docente originario, come propostaCANDIDATE non approvazione umana. Tastiera provata sulla navigazioneApp, touch sul ripasso; citazione parziale da tastiera NON_VERIFIED. I limiti sono nel registro prove.

## Applicazione da S00/S10

Confrontare i tre hashbefore e integrare prima il contrattoShell316. Ispezionare la patch con decompressione, poi `gzip -dc shared-composition.patch.gz | git apply --check -`; solo il writer delegato la applica allo stesso modo senza --check. Ricontrollare afterhash, typecheck/test/build e percorso sul commit risultante. Se altri filoni hanno già esteso App o SourceViewer, riconciliare i pochi hunk nel candidatoS00, senza sovrascrivere i loro consumer.

La compressione conserva il patchtestuale byte-esatto senza introdurre trailing-whitespace dei contextblank nei gate documentali. Non sono indeboliti gate, autorizzazioni o protezioni. Rimozione dei soli hook è rollback del consumer: fonti, card, receipt e diario rimangono nel Core. Disponibilità remota e ambiente appropriato restano decisioni S00/S10.


## Aggiornamento successivo: delega umana e installazione

La fase proposta sopra descrive il checkpoint c6453718. Dopo «Delega S06 sui tre file», il raccordo è installato nella stessa PR309 con Shell316@28d70a5. Per lo stato successivo usare [installed-2026-10-26.md](installed-2026-10-26.md); la patch e il manifest precedenti rimangono storici, non vanno riapplicati al ramo installato.


**Aggiornamento su maina00f2f4:** la base è avanzata con314 durante la consegna. Merge ordinario nel ramoS06 su3ea05cce, nuova verifica130test/build e34browserPASS/9.479s. [Prove dopo aggiornamento](after-main-a00/README.md). I checkpoint132/e0 rimangono storia, nuovaCI da leggere sulla headsuccessiva di sola consegna.
