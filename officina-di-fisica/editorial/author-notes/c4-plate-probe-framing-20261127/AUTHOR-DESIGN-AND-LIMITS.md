# Inquadratura iniziale dei tre esperimenti fra piastre

Autore della correzione: agente AI `review_corpus_increment`. Sono ricusato dall’accettazione scientifica finale dei tre ID. Nessuna approvazione umana, pubblicazione o credito attività. Revisione visiva del candidato e peer distinta: **NOT_RUN/PENDING**.

Base immutabile `b9994b9116e87478905191d85cca8037d17ae4bd`. I sei PNG indipendenti Root a 320/1280 sono conservati byte per byte nella sottocartella `independent-baseline-negative`: segnale viola parzialmente coperto dalla piastra destra agli estremi di SIM-C4-L02-03, SIM-C4-L03-02 e SIM-C4-L03-03; nel terzo anche la punta di una freccia. Il dossier non deduce ulteriori occlusioni raster da una semplice sovrapposizione degli intervalli proiettati.

## Correzione circoscritta

Solo per i tre ID nativi, la vista iniziale usa eye `[0,1.9,6.1]` anziché `[2.6,1.9,6.1]`. Target, estensione, posizioni, dimensioni, colori, quantità fisiche, controlli, grading e viste Alto/Laterale restano identici. La legenda nativa spiega l’inquadratura frontale rialzata e offre Ripristina vista/Alto/Laterale se una rotazione manuale riporta una piastra davanti al punto. La legenda fallback resta identica e non ordina l’uso di comandi disabilitati. La modifica non garantisce visibilità da ogni orbita arbitraria.

## Verifica geometrica effettiva

Con camera ortografica e componente x dell’eye nulla, l’ascissa schermo coincide con x del mondo. La faccia interna destra è `d−11/200`; il punto di raggio `13/100` arriva al massimo a `d−1/5+13/100=d−7/100`: distanza ideale `3/200 = 0,015` world. Il modello fisico e la posizione longitudinale del punto restano invariati.

Il protocollo eseguito ricostruisce i buffer Float32 reali di Three sia per mesh statiche sia per primitive unitarie scalate dal percorso mobile: sfere, piastre, shaft e coni completi con tutti i rim vertices. Per ogni triangolo l’inviluppo proiettato dei vertici contiene la faccia nel modello CPU. Sono eseguiti 102 casi (3 ID × 17 valori × 2 canvas effettivamente acquisiti: 294×341 e 839×451). Gap minimo positivo osservato: **0,5444444444444452 CSS px**. Tale margine subpixel è dichiarato: non costituisce certificazione GPU, antialiasing, rasterizzazione o leggibilità percepita. Il nuovo browser resta necessario.

Gli estremi di entrambi i canvas sono inoltre controllati in Obliqua/Alto/Laterale per i corpi opachi completi e il banco base. Le etichette e le interazioni DOM non sono coperte da questa prova CPU.

## Prove e compatibilità

Il test finale eseguito sulla sorgente Git b999 autentica produce 1 PASS/4 FAIL, poi 5/5 sul candidato. La prima general suite ha prodotto davvero 327/328 per il vecchio hash che comprendeva l’eye intenzionalmente cambiato: il negativo è conservato. Il contratto storico ora ammette esattamente i tre eye nuovi, li asserisce prima di confrontare il resto con la fixture originale; nessun byte della fixture è cambiato. Finale: 328/328 Node e 2/2 contratti, exit0.

Il confronto con un namespace ESM immutabile b999 copre 181 record, 2838 valori e 19659 scene: modelli, dati, assegnazioni, clock, elementi e grading sono identici. Le altre 178 camere e legende sono identiche. Questa è parità tecnica autoriale nello stesso Node, non una seconda risoluzione scientifica né un oracolo browser isolato.

Runtime prima/dopo il protocollo geometrico: `ba48962eeb9f3e6d4988dbd93accd3bbc529e4e4f094bb53b8236c2d4c895538`, uguale. I supervisori effettivamente eseguiti sono archiviati con percorsi operativi originali; non sono dichiarati un nuovo motore di collaudo. Tutti i log negativi restano conservati. Nessun Chrome è stato avviato per questa correzione.

Peer richiesta: osservare gli estremi originali e almeno i due canvas nel consumer reale, verificare controllo Ripristina/viste native, fallback senza istruzioni impossibili, punto e tre frecce interi, overflow/axe e preservazione dei compiti. Nessuna chiusura di ledger da questo dossier autoriale.
