# Nuove edizioni sperimentali 118, 119 e 140

Autore: ROOT. Verificatore scientifico distinto: ancora NOT_RUN. Approvazione umana NOT_RUN. Nessuna pubblicazione.

Tre pacchetti astra/1 passano dall’importatore esistente. La sorgente è il commit Cric 5d1dc8dc7b601aef959d10d564c75462be74708d; ogni binding conserva SHA-256 della fonte e della candidata. Gli ID, la competenza, l’apparato, il controllo, le unità, i riferimenti e la legge installata restano quelli della fonte; si crea la versione 2 DRAFT. La nuova metadata seleziona soltanto due input sulla griglia, senza contenere risposte.

118: SIM-C1-L001-06 usa 90° e 180°, con conti 4·0=0 e 4·(−1)=−4 m/s. I paragrafi distinguono rapidità, componente orientata e segno del sensore. Diagramma in tre orientamenti a scala costante; inverse con condizioni di esistenza.

119: SIM-C1-L002-04 usa 90° e 180°, con prodotti 3·2·0=0 e 3·2·(−1)=−6 m². Svolgimento distinto dal caso cinematico: proiezione, commutatività, area orientata, mano destra e limite degenere del prodotto vettoriale. Non si attribuisce al prodotto scalare una direzione o l’unità m/s.

140: SIM-C1-L005-05 usa 60° e 0°, con 20·1/2=10 N e 20·1=20 N. Il bilancio è perpendicolare al piano: non si presume equilibrio lungo il piano. Massa inversa 10/(10·1/2)=2 kg, controllo delle unità e dei segni. La scena progressiva installata mostra il piano e i vettori; il fix delle scale è soggetto a revisione separata.

La correzione dei vettori interviene nell’apparato condiviso 3D/fallback. Nel piano entrambe le forze normalizzate a 20 N usano 0,75 unità di scena. Nel caso del filo T/30 viene convertito allo stesso fattore 0,42/20 usato dal peso. Si mantengono i dati del modello, i valori scalari e i campi delle edizioni originali. Lettura completa dei tre utilizzatori caduta e dell’unico utilizzatore piano: la nuova etichetta del peso è condizionata al filo e non cambia le altre scene di caduta. Test RED: 27 confronti di scala falliti su 2 test; GREEN dopo correzione, senza ridurre tolleranze o dominio.

Due preview tecniche118/119 furono eseguite prima del fix delle frecce: quelle prove hanno un fingerprint superato e non devono contribuire al checkpoint. Le nuove prove devono essere realmente rieseguite sul runtime finale. Il primo import di118/119 salva1 e il secondo0/unchanged1, con991 pubblicati, live head e storia invariati. Queste sono evidenze tecniche di importazione, non approvazioni scientifiche.

I trasferimenti storici a95° e40° restano nelle vecchie edizioni e nei finding negativi. Nessuna risposta storica, tolleranza o parser numerico è riscritta. Le attività assegnate usano soltanto angoli notevoli; gli altri input restano esplorazioni osservabili e non conti manuali obbligatori.

Durante la lettura visiva dell’anteprima119 l’autore ha rilevato una scala errata del primo SVG:3 m erano88 px e2 m erano72 px. Corretto a90 px e60 px in tutti i pannelli, riletti gli endpoint XML e rigenerati asset, pacchetto, binding, import e tre anteprime. Nessun PASS scientifico era stato attribuito. Il report119 precedente è superato e non contribuisce ai conteggi.
