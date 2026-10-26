# PR317 — review visuale indipendente della composizione App/Materials

Sono stati aperti realmente i PNG del prodotto 1440,820,390,360; 390/820 anche a risoluzione originale. Il report browser riporta17gruppi PASS: risultato del runner S00 letto, non esecuzione del revisore. Riferimenti esatti e hash in visual-review-receipt.json. Nessun sorgente modificato dal revisore.

## Riscontro sui pixel

Gerarchia e palette sono coerenti con la Shell; testo, form, risultato e legenda rimangono leggibili a390/360. Nei PNG esaminati non ho osservato sovrapposizioni o tagli di controlli. Questo non certifica eccellenza visuale, focus nativo, contrasto misurato, Safari o tastiera fisica. Gli screenshot sono dello stato dopo confronto e riapertura, non dello stato iniziale vuoto.

P2, ciclo mobile: in una colonna, risultato, grafico, caption, legenda e due disclosure precedono tutti i dati modificabili. Per cambiare parametri dopo un confronto e osservare l'effetto lo studente deve attraversare molto contenuto verticale. Nel390 i primi dati del sistema sono verso la metà della pagina molto lunga. La struttura del CSS conferma ordine science-main prima di science-controls. Minimo intervento proposto: controls prima della vista sulla singola colonna e focus/scroll senza animazione al risultato quando il confronto termina; verificare che modifica→previsione→risultato non richieda salti manuali ripetuti. Alternativa: vista compatta e grafico espandibile. Non è un guasto scientifico o un P1.

P2, ritrovamento di più salvataggi: il diff rende tutti i titoli science-resource uguali a “Esperimento scientifico”, con sottotitolo “Privata · Materiale”. Il PNG contiene un solo salvataggio; il limite su due salvataggi è dimostrato dal codice displaySourceTitle (ramo costante), non da una nuova prova browser. Usare una proiezione testuale sicura del ragionamento annotato come titolo, con fallback, distinguendo le risorse senza esporre JSON. Testare due note diverse e payload malformato.

P3: tre introduzioni Materiali/Prevedi…/Libreria consumano molto spazio sul primo viewport mobile. Il disegno della lente rappresenta raggi e scale diverse dichiarate, ma non disegna lente e frecce oggetto/immagine: miglioramento didattico possibile, non errore numerico qui provato.

## Limiti

Nessuna nuova esecuzione browser o prova fisica del revisore. Nessuna review umana o approvazione editoriale. Il CSS reduced motion è presente e il runner configura reducedMotion; l'assenza effettiva di movimento deve restare distinta dalla sola configurazione. Nessun giudizio su audio, import di nuovo archivio o backend remoto è dedotto da queste immagini.
