# D — contratto concordato

La decisione è stata approvata nel messaggio di coordinamento prima della modifica del prodotto e dei relativi RED/GREEN. Questo file è la sua registrazione successiva, non una prova retrodatata.

- Donatore: un parametro modificato collega stato del controllo, quantità numeriche e visuale. CircuitJS Voltage5→2.5 V produce correnti50→25 mA e5→2.5 mA; non è osservazione di Taylor, convergenza o apprendimento.
- Originale Ardesia: riusare il modello bounded `taylor-exp-v1` esistente. Un solo POST `/activities/evaluate`, soltanto dopo previsione e gesto esplicito. Parametri x[-1,1], grado intero0..12.
- Il Core aggiunge `x`, `referenceValue`, `absoluteError`, `plot:{schemaVersion:1,domain:[-1,1],samples:[{x,value,referenceValue,absoluteError,remainderBound}]}` con41 campioni. Pn e bound usano lo stesso calcolo Fraction già presente. exp è riferimento numerico esclusivamente Core; il bound di Lagrange comprende l’arrotondamento del polinomio e non deriva dallo scarto numerico.
- Il browser valida risposta finita, identità dei parametri, ordine/dominio/massimo41 campioni e intervallo geometrico finito. Rende soltanto segmenti fra campioni canonici e fascia del bound. Nessun solver, exp o polinomio frontend.
- Variazione grado per input nativo o comandi±1: invalida grafico e commit, nessuna chiamata automatica. La previsione resta da confrontare al gesto. Risposte stale dopo modifiche/unmount non ripristinano grafico o commit.
- Risposta legacy senza plot: risultato numerico ancora consegnabile; messaggio esplicito grafico non disponibile. Non si inventano curve schematiche.
- Tabella dei campioni e legenda testuale; input/focus nativi, nessuna animazione. Nessuna autorità scientifica umana attribuita.
- Ownership: TaylorLab.tsx, nuovi TaylorPlot.tsx/CSS e test; taylor.py e test Taylor. Nessuna modifica nostra a experienceTypes, PoiseuilleEpisode, activities.py, composizione Core, auth/store, memoria o styles.css globale.
