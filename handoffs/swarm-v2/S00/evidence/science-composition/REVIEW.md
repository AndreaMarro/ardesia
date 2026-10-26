# S00 PR317 — review indipendente

Ambito: HEAD base f7086162465e22aa45712c8b28cf401b0f145123 più file di lavoro del receipt `reviewed-source-receipt.json`. Nessuna modifica nel repository, gate o ownership. Non è approvazione umana né attestazione CI/browser.

## Finding e correzione verificata

P1 nella candidata owner: digest del file prima di un import normale non garantisce identità del codice caricato. Una cache `.pyc` TIMESTAMP valida per dimensione e mtime può eseguire il vecchio modello e dichiarare il digest del nuovo. Controprova su copie temporanee reali, nessun handler scientifico mock: codice 9e9 restituisce 100, hash dichiara codice 8e9 che restituirebbe 88,8888889. Riprodotto con CPython 3.13.14 del lock API e 3.14.6 locale.

S00 ha sostituito il doppio accesso con una lettura unica: SHA e compile/exec usano gli stessi byte first-party, registrati nel modulo canonico `models`. Cleanup su errore. Controprova indipendente `--source-init` su Python3.13.14 GREEN: valore88,8888889 e hash del medesimo file. Restart richiesto per cambiare modello; hot reload in-process non supportato. Nessun altro finding concreto sul delta loader iniziale.

## Mount applicativo

Lettura statica del diff: Materials conserva filtro group/owner, key attore/ruolo/edizione, disabilita editor generico sui payload science. SourceViewer conserva lookup esatto e guardia risposta tardiva, sopprime sia textarea `onSelect` sia fallback plain JSON. ScienceResourceView proietta solo riepilogo e link esatto, senza eseguire modello o rivendicare disponibilità. ScienceLibrary ha già child keyed attore/ruolo/edizione/risorsa/revisione. API installer usa store e auth della factory esistente prima degli static mount. Nessun finding P0/P1 ulteriore dimostrato. Non equivale a prova remota, Postgres o effettivo replay audio.

## Evidenza browser da correggere o circoscrivere

P2: nella versione del runner registrata dal receipt, listeners `pageerror` e richieste esterne coprono solo la pagina studente principale; la pagina `f` fallback touch non li registra. L'asserzione finale non certifica quindi assenza errori/reti esterne del fallback. Segnalato a S00 per estendere listeners o ridurre claim. `built` è una stringa path sempre truthy, quindi il ramo dev è morto (non blocco prodotto). Reduced motion è configurato, ma non risulta ancora una prova del comportamento delle animazioni. Screenshot e controprove browser non eseguiti dal revisore in questo checkpoint.

## Riproduzione autonoma

`services/study-api/.venv/bin/python /Users/andreamarro/Developer/ardesia-s00-20261026/evidence/science-review/stale-pyc-counterproof.py` ricostruisce candidata owner e mostra mismatch. Aggiungere `--source-init` usa il loader attuale e mostra GREEN. Tutte le mutazioni sono in TemporaryDirectory, mai sul checkout.
