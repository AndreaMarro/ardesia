# Raccordo installato S06 — 26 ottobre 2026

Questo aggiornamento supera il solo stato «patch proposta» del checkpoint c6453718. Conserva README, manifest, risultati e FAIL precedenti come storia, senza attribuire loro una nuova prova.

La risposta umana «Delega S06 sui tre file» autorizza App.tsx, SourceViewer.tsx e study_api/app.py, con contratto Shell316 nella stessa PR309. Delega comunicata nel rendez-vous [6414774127](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6414774127). Merge, configurazione remota e distribuzione restano S00/S10.

Shell316@28d70a549b73bebffee42e200aa7f1fb1ac2b1d5 è composta con un merge ordinario: serve tecnicamente al mount e all'input enabledViews del root. Il codice Shell non è stato riscritto. I tre file condivisi sono stati confrontati prima con source-manifest.json e poi modificati dalla patch gzip già valutata: tutti gli hash dopo corrispondono. API installata dalla create_app effettiva; rimosso il monkeypatch dell'installer dai cinque test HTTP S06. I sette test del lettore sono promossi nella suite Web ordinaria.

Verifiche locali del raccordo: sette HTTP PASS sulla factory installata, 41 Web PASS (26 S06 e 15 Shell). Le altre prove, SHA e CI finali vengono registrate in una consegna successiva; non sono anticipate qui. Sei contenuti DRAFT, nessuna approvazione scientifica, nessuna mastery inferita.

## Riproduzione del ramo installato

Fare checkout della SHA consegnata della PR309, installare le dipendenze del repository e usare Python>=3.12 con le dipendenze API. Su questa versione non applicare di nuovo shared-composition.patch.gz e non usare il preparatore storico per costruire un altro candidato. I pin e le istruzioni precedenti riproducono soltanto lo stadio c6453718.

Eseguire in sequenza, con un solo slot pesante sul medesimo host:

```sh
PYTHONPATH=packages/engine:services/study-api python -m pytest services/study-api/tests/test_independent_study_http.py handoffs/swarm-v2/S06/composition/test_factory_composition.py -q
npm run test --workspace @ardesia/web -- src/features/independent-study src/features/product-shell --maxWorkers=1
npm run build --workspace @ardesia/web
```

Avviare server.py come indicato nel README, con S06_COMPOSITION_DATA nuovo e vuoto. Attendere startup, access.json e risposta401 su /study/me. Eseguire browser.mjs nello stesso checkout con S06_EXPECTED_SHA impostato alla SHA consegnata e S06_OUTPUTS esterno. Il runner controlla HEAD, sorgenti pulite e hash dei tre raccordi prima della prova e ricontrolla HEAD/sorgenti alla fine; registra la SHA nel risultato. Nessuna route API sostituita e nessun App alternativo. Il server usa dati sintetici locali e middleware CSP di test; non certifica header o disponibilità di produzione. Il Core conserva una citazione proposta CANDIDATE; nessuna approvazione umana simulata.

## Recupero e limiti

Il checkout precedente in /private/tmp non era più disponibile alla ripresa; recuperato il commit pubblicato c6453718 da GitHub in un checkout isolato nuovo. Prima del merge Shell una sparse-checkout ancora in corso ha causato index.lock: nessun lock o processo altrui eliminato; attesa la fine dell'operazione e ripetuto il merge con successo. Nessun reset o force-push. Dipendenze installate nel nuovo ambiente da manifest/lock esistenti; nessun file di dipendenza prodotto modificato.

READY_FOR_INTEGRATION resta distinto da INTEGRATO o DISTRIBUITO. La delega rimuove il blocco dei tre writer, non autorizza S06 a integrare in main. Richieste tutor/contestazioni sono private RECORDED_NOT_SENT. Backend remoto, PostgreSQL/RLS, Safari/device fisico, efficacia personale FSRS, 38 attività qualitative e 200 target rimangono lacune dichiarate.

## Prossimi passi per S00

1. Verificare il commit consegnato, la dipendenza316 e il merge tree con gli altri consumer; accettazione: stessi percorsi, autorizzazioni e required check verdi sulla base integrata.
2. Provare il flusso sul backend remoto autorizzato con due sessioni, ripresa, revoca e fonti esatte; accettazione: ricevute canoniche e restore reali, nessuna copia locale presentata come sincronizzazione.
3. Con S04/S10 collegare contenuti approvati e richieste tutor a un consumer docente; accettazione: revisione umana delle revisioni e richiesta effettivamente ricevuta, senza mock score.

**Verifica successiva prima del commit:** 78 test Core/adapter/upstream PASS; build Web con typecheck PASS (196 moduli, Vite654ms). Warning bundle superiore a500kB e Starlette/httpx conservati nei log, nessun gate modificato.

**Review successiva:** revisore separato ha ispezionato il delta e riprodotto un P2: unit/reasoning validati con lunghezza UTF16 anziché code point del Core. Due casi di confine RED (4000simboli nel procedimento,32nell’unità), due oltre limite già negati; limiti del reader allineati con Array.from. Il primo comando per aggiungere i test aveva un percorso duplicato rispetto al cwd apps/web: corretto il comando, nessuna falsa attribuzione del PASS precedente alla regressione. Nessun altro problema materiale emerso dalla review; ispezione+aritmetica, senza suite o browser del revisore.

**Esito dopo correzione:**45Web S06+Shell PASS (inclusi4nuovi casiUnicode), build/typecheck PASS. Revisore ha riletto il delta e il RED e non segnala finding residui. Prove native/CI finali ancora distinte e da registrare. Log raw compressi lossless in installed-evidence/ con hash e round-trip.

**Prova nativa successiva su132755936f41849a2d36e7eb3750f17cde30db26:**34PASS/9.315s/0errori sull’App compilata effettiva, Core/Auth/SQLite veri. Inventario427sorgenti/291filedist verificato prima/dopo, HEAD e sorgenti pulite. [Risultato e limiti](installed-validation.md), screenshot e rawlog nel namespace installed-evidence. Server/browser chiusi, slot rilasciato. La CI finale resta da verificare sulla prossima head di consegna.


**Aggiornamento su maina00f2f4:** la base è avanzata con314 durante la consegna. Merge ordinario nel ramoS06 su3ea05cce, nuova verifica130test/build e34browserPASS/9.479s. [Prove dopo aggiornamento](after-main-a00/README.md). I checkpoint132/e0 rimangono storia, nuovaCI da leggere sulla headsuccessiva di sola consegna.
