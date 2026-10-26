# PR317 — verifica dei due P2 su b701e531

Appendice alla review precedente; non la sostituisce. Letti soltanto diff mirato e PNG richiesti science-390/science-1440 della cartella browser-final, più report associato. Hash in final-review-receipt.json. Nessun browser pesante, test o edit del repository eseguito dal revisore.

## Due correzioni riscontrate

I controlli precedono ora la rappresentazione nella singola colonna390; “Modifica i dati” offre un ritorno esplicito ai parametri. Il diff mostra focus e scroll instant al risultato e al primo input. Questo corregge l'ordine visivo segnalato; l'esito del gesto resta prova del runner S00, non nuova esecuzione del revisore.

Le due risorse hanno titoli diversi, proiettati dalle note tramite parser condiviso; il sottotitolo dice Esperimento. I pixel mostrano due voci distinguibili; raw JSON non esposto. Il limite delle voci tutte omonime è corretto per le note esaminate.

## Nuovo finding P2 — grafico mobile tagliato

Nel PNG390 finale il grafico dei raggi è quasi interamente bianco: si vede una striscia stretta a sinistra con griglia e valore−3,5, mentre raggi, assi e immagine sono tagliati/fuori area. Il PNG1440 mostra invece l'intera geometria. Il precedente PNG390 della prima review aveva un grafico completo. Non è sufficiente count(svg)==1 o assenza overflow orizzontale per dichiarare grafico mobile PASS.

La causa non è dimostrata: potrebbe trattarsi di dimensionamento JSXGraph dopo la sequenza di resize oppure di cattura prima dell'assestamento. Questo finding non prova da solo un guasto permanente all'apertura mobile, ma impedisce di certificare il comportamento e i pixel attuali come corretti.

Primo passo consigliato: nuova apertura diretta a390 e verifica dimensioni SVG/container e geometria visibile; ripetere anche desktop→390 attendendo un criterio di stabilità reale. Se è difetto di resize, correggere nel lifecycle del renderer; se solo cattura prematura, rendere l'asserzione capace di rilevare la condizione e acquisire una prova stabile. Non eliminare l'asserzione né ribattezzare il caso flaky.

Esito: due P2 originali affrontati, ma rimane questo nuovo P2 da verificare prima di dichiarare accettazione visuale mobile. Nessun nuovo P0/P1 dimostrato, nessuna approvazione umana o CI attribuita al revisore.
