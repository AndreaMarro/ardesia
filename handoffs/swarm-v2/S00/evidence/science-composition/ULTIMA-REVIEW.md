# PR317 — riscontro successivo sul grafico mobile

Appendice datata26ottobre2026. Preserva FINAL-REVIEW.md e i PNG precedenti: la precedente prova18PASS non era sufficiente per certificare la geometria. Il finding precedente era un taglio reale nel PNG, senza attribuzione certa a un guasto permanente.

## Nuove prove lette

Aperti realmente via view_image, a risoluzione originale, browser-settled/science-390.png e science-fresh-390.png. Entrambi mostrano adesso tutti i raggi, gli assi e i punti previsti, dentro l'area del grafico. Parametri prima della vista, ritorno “Modifica i dati” e titoli distinti restano presenti.

Leggi gli hash in ultima-review-receipt.json. Il prodotto rimane b701e531e62037da2acd0f75a75e50659b0f682b: git diff dei sorgenti Web, runtime scientifico e installerAPI contro quel commit è vuoto. È cambiata la verifica, non il renderer.

La controprova resize-red misura a820, subito dopo resize, SVG largo549,890625 contro container369,125: fitted=false. Nel campione a500ms si assesta a369,125 e fitted=true. Nel contesto nuovo390 già il campione iniziale è288×300 coerente con container e forma. Questo dimostra uno stato transitorio misurato del ridimensionamento; non riproduce un bug permanente di apertura mobile e non attribuisce retroattivamente ogni pixel precedente a un'unica causa.

Il runner aggiornato non attende500ms arbitrari: expect.poll aspetta SVG e container concordi nelle dimensioni e bounding box delle forme scientifiche entro l'area. Ho letto il predicato: filtra i tratti/punti con colori delle serie scientifiche e controlla presenza, dimensioni e limiti. Il report19gruppi PASS comprende sequenza1440→820→390→360 e contesto mobile390 nuovo, con fitted=true finale per tutti. Risultati del runner S00 letti, non nuova esecuzione del revisore.

## Esito e limiti

Il gap di verifica che lasciava passare il grafico tagliato è affrontato da una condizione più forte e da nuovi pixel effettivi; nessun ulteriore P1/P2 dimostrato sui due grafici richiesti. Le due correzioni originarie sono riscontrate. Non chiamare il caso flaky né rivendicare una correzione runtime che non è avvenuta. Il transitorio di resize esiste; una garanzia di assenza di qualunque frame intermedio tagliato non è provata né ottenuta con questa modifica del test.

Il PNG del contesto nuovo comprende il link “Vai al contenuto” visibile nello stato di focus/cattura; non è una fotografia del primo accesso senza focus. Il grafico completo resta leggibile. Non è stata investigata una regressione autonoma del link da questo solo screenshot.

Persistono i P3 e limiti precedenti: introduzioni mobile lunghe, nessuna lente/freccia oggetto-immagine nel disegno, Safari e dispositivo reale non verificati, nessuna firma scientifica/editoriale o approvazione umana del revisore. Non si deduce completamento dei quattro corsi o backend remoto.
