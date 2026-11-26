# Diagnosi indipendente di visibilità — SIM-C1-L005-05

Diagnosi completata sul CORE HEAD `6d6d7bc151675c769bb13a5922600a9eb685688b`, runtime `c177aba9dfdbfd8296addd3583ce487e8f43ed1b52cef784636a2d1cd40f0744`. Questa cartella contiene solo nuove prove diagnostiche: nessuna approvazione, nessun cambio di stato delle verifiche già accettate, nessun pin precedente riscritto, nessuna modifica a runtime, registri, sorgenti o candidati.

Sono confermati due difetti del consumer nativo nella vista obliqua iniziale. La legge fisica e i valori dello strumento sono corretti; il problema è l’occlusione delle frecce usate per la lettura dei versi e il confronto delle forze.

## Verifica reale

Il percorso utente effettivo è stato aperto in Chrome con il consumer del CORE. Sono stati eseguiti 16 casi: edizione sorgente pubblicata v1 e DRAFT140 v2, inclinazioni 0° e 75°, viewport 320 e 1280 px, renderer nativo e fallback WebGL indisponibile. Ogni caso ha PNG della scena e dell’intero strumento; gli otto fallback conservano anche l’SVG effettivo. Nel nativo il display dichiara realmente «3D interattivo», nel fallback «Tavola di misura».

La fonte v1 locale è identica al pin Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`. La bozza è importata due volte con l’importatore canonico in SQLite temporaneo, poi letta dall’endpoint autore; il solo trasporto privato del test porta quel payload al normale lettore del banco. Nessuna route o pubblicazione del prodotto è stata cambiata. Le otto coppie di screenshot di scena source/DRAFT hanno **zero pixel differenti**; controlli, formule, riferimenti, geometria e valori coincidono. Il cambio di edizione non elimina il difetto condiviso.

Il processo diagnostico è terminato realmente con exit 0; il browser e il server figli del test sono stati chiusi. I 991 pubblicati, tutte le versioni storiche e i tentativi sono conservati; dopo il run i tentativi nel database usa e getta restano zero. Il fingerprint completo prima/dopo e lo SHA del package restano uguali.

## Normale a 75°

Il consumer fornisce `N=20 cosθ`, stato `normale=N/20`, vettore grafico di lunghezza `L=(3/4)cosθ`. A 75° il modulo fisico esatto è `5(√6−√2) N`; la lunghezza grafica è `3(√6−√2)/16`, circa 0,194114 unità di scena. La sfera ha raggio 0,22 e il vettore parte dal suo centro.

Non basta confrontare il segmento centrale con il raggio: è stata controllata l’intera geometria realmente usata per asta e punta. L’asta è un cilindro di raggio 0,028; la punta è il cono con raggio di base 0,0812 e lunghezza `min(0,24; 0,32L)`. Il raggio massimo di tutti i vertici delle due mesh rispetto al centro è 0,1941142838. Il minimo raggio delle facce dell’effettiva `SphereGeometry(0.22,24,16)` è 0,2170853356. L’intera freccia, inclusa tutta la punta, è dunque dentro la superficie opaca, non solo dentro la sua sfera ideale esterna. Materiale: opacity 1, transparent false, depthWrite true e depthTest true.

Nei quattro PNG nativi a 75° resta visibile l’etichetta «Normale», che è uno sprite separato senza depth test, ma non la freccia verde né la sua punta. L’etichetta non prova che il vettore sia visibile. Il contenimento completo nella sfera non dipende dall’inquadratura.

Un controllo manuale del semplice raggio non richiede decimali: `√6<5/2` e `√2>7/5` implicano `L<33/160<11/50=0,22`. La prova sulle facce e sui vertici delle mesh è più forte del solo confronto dei raggi.

## Peso a 0°

Il centro della sfera è `(0,35; 0,40; 0)` e il peso ha vettore `(0; −0,75; 0)`: punta a y=−0,35. La punta conica inizia a y=−0,11; quindi tutta la punta occupa y fra −0,35 e −0,11. La base opaca del tavolo, aggiunta dal consumer nativo, ha centro y=−0,11, spessore 0,22, piano superiore y=0 e inferiore y=−0,22.

Per ciascun vertice del cono è stato intersecato il raggio ortografico verso la camera obliqua iniziale, di direzione proporzionale a `(2,6; 1,9; 6,1)`, con il piano superiore del tavolo. Tutte le intersezioni cadono all’interno della faccia di dimensioni 6,75×3,45. La punta intera è nascosta dal tavolo; il fatto che l’estremo sia anche sotto il fondo non la rende visibile da sopra.

Nei quattro PNG nativi a 0° non si vede una freccia rossa completa con terminale leggibile. Può restare una parte dell’asta al di sopra del tavolo e si vede l’etichetta rossa, che non ripristina la punta. Non è stata estesa questa conclusione sul tavolo a ogni possibile rotazione manuale della camera: i 16 casi riguardano la vista obliqua iniziale richiesta. La normale a 0° è diretta verso l’alto, mentre i due moduli matematici sono entrambi 20 N; la comparabilità di due vettori non può essere dedotta soltanto dal rapporto delle loro lunghezze prima dell’occlusione.

## Fallback

Il fallback SVG dipinge le frecce dopo la sfera e non aggiunge il tavolo nativo. Perciò peso e normale a 0° sono completi e opposti. A 75° la normale verde è realmente dipinta dentro il disco della sfera: il painter order la rende visibile dove il depth test nativo la nasconde.

La proiezione usa x=229+47x+16z, y=156−44y+11z. A 75° la freccia normale ha lunghezza circa 9,0855 unità SVG. Con l’effettiva scala uniforme del viewBox risulta lunga circa 16,55 CSS px a viewport 1280 e 5,81 CSS px a 320. A 320 anche la punta è molto piccola: questa diagnosi ne registra la presenza, senza trasformarla in una certificazione generale di leggibilità o accessibilità.

## Evidenze e limiti

- `diagnose-normal-visibility.mjs`: consumer reale, database temporaneo, confronto di edizioni, 16 casi e guardie pre/post.
- `diagnostic.json`: parametri e letture effettivi, elementi, proiezioni e hash dei 32 PNG; nessun cookie o ticket salvato.
- `derive-geometry.mjs` e `geometry.json`: contenimento completo delle mesh, raggi della camera sul tavolo e scale del fallback.
- `compare-editions.mjs` e `edition-comparison.json`: confronto pixel per pixel degli otto abbinamenti source/DRAFT.
- `run.log`: output originale del processo effettivo; nessun marker di approvazione generato.
- `manifest.json`: hash di tutti gli altri file della cartella e perimetro della diagnosi.

Questa prova identifica il problema e fornisce un punto di sospensione: nessun replay039/040 è stato iniziato. Una successiva correzione deve esporre l’intero vettore, inclusa la punta, conservando modulo, verso, scala comune e modello fisico; richiederà una rilettura e un nuovo replay sui byte corretti. La scelta della patch e l’eventuale invalidazione delle vecchie evidenze spettano all’integratore. Non sono state applicate correzioni o cambiati stati scientifici in questa diagnosi.
