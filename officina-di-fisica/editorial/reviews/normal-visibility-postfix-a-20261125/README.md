# Revisione indipendente del piano dopo la correzione

Esito positivo nel perimetro verificato: SIM-C1-L005-05, griglia completa 0°–75° a passi di 5°, sorgente pubblicata v1 e DRAFT140 v2, renderer nativo e fallback, viewport 320 e 1280 px. Le immagini reali e la verifica geometrica confermano che entrambe le frecce hanno asta e punta visibili, con verso, modulo e linea d’azione preservati. La legenda HTML è presente e leggibile senza overflow nelle due larghezze. Nessun difetto residuo è emerso in questo perimetro.

La patch di produzione esaminata è `27610cc9d625d291d9522251e18061aa755c5ab9`, sul CORE con HEAD iniziale `b925c3c45308681943fd7e316f73b79979356807` e runtime `b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f`. I risultati dell’autore non sono stati usati come approvazione indipendente. I 49 file negativi precedenti sul runtime c177 sono conservati byte per byte e restano prove del difetto precedente.

## Fisica e trasformazione geometrica

La legge non cambia: sul verso normale uscente dal piano il secondo principio dà N−mg cosθ=0, perché l’accelerazione perpendicolare è nulla e la forza che trattiene il blocco è parallela. Con mg=20 N, il peso è verticale verso il basso e N=20 cosθ, positiva nel dominio installato. Il mantenimento lungo la guida era già dichiarato nella sorgente v1; la nuova legenda rende esplicito che la relativa forza non è disegnata. La deduzione della normale richiede soltanto il bilancio perpendicolare, non un’ulteriore forza normale nascosta.

Il guadagno comune dei vettori è 0,75/20=0,0375 unità di scena per newton. Per ogni angolo sono stati verificati indipendentemente ΔP=(0;−0,75;0) e ΔN=0,75 cosθ(−sinθ;cosθ;0), non soltanto il loro rapporto. La normale è perpendicolare al vettore tangente del piano; il peso rimane verticale. Il rapporto delle lunghezze è cosθ, con uguaglianza a 0°. Le letture sono corrette: 20 N a 0°,10 N a 60° e 5(√6−√2) N a 75°.

La normale intera viene traslata di 0,25 lungo il suo stesso verso rispetto al centro della sfera opaca r=0,22. Il peso intero è traslato verso l’alto lungo la stessa verticale passante per quel centro, in modo che il suo estremo basso superi il punto più alto della normale di 0,18 unità verticali. A 0° i vettori sono collineari e opposti ma separati: il peso non viene più tagliato dal tavolo e non copre la normale. Per entrambe le forze il prodotto vettoriale fra lo spostamento dell’origine e il vettore è nullo; la linea d’azione e il momento rispetto a un’origine arbitraria sono preservati. Non sono stati aggiunti fattori diversi alle due forze o accorciati i vettori per superare il controllo.

## Verifica delle mesh complete

`check-complete-glyphs.mjs` ricostruisce indipendentemente le mesh con i parametri effettivi del consumer: sfera24×16, cilindri32 lati, spessore dell’asta0,028 e raggio della base del cono0,0812, lunghezza della punta min(0,24;0,32L). Include il tavolo opaco 6,75×0,22×3,45 e tutti i corpi e le guide dell’apparato. Ogni glifo è controllato rispetto a tutti gli altri occludenti, compresa l’altra forza; la sua normale auto-occlusione delle superfici posteriori non è classificata come difetto.

Per i 32 casi nativi distinti angolo/larghezza, cioè64 glifi, risultano liberi da occludenti esterni: l’estremo finale, tutti i vertici dell’intera punta conica,101 punti lungo l’asse completo, e anche tutti i vertici del bordo dell’asta. Tutte le mesh complete sono dentro il frustum della larghezza effettiva. La prova non si limita al solo segmento fra origine e punta né al rapporto di lunghezze pre-rendering.

## Replay reali e lettura delle immagini

Il consumer reale è avviato su SQLite temporaneo. Il package140 viene importato con l’importatore canonico e riletto dall’endpoint autore; una fixture privata di trasporto consegna quel payload alla normale UI del banco. Non viene cambiata alcuna route o pubblicazione del prodotto. La sorgente locale v1 è confrontata integralmente con il pin Cric5d1dc8dc. Fra v1 e DRAFT sono identici i controlli, il modello, i riferimenti, la formula e la geometria fisica.

Il run comprende128 casi e256 PNG originali: per ciascuna combinazione sono conservate scena e intero strumento, inclusa la legenda HTML aperta. I64 fallback conservano anche l’SVG effettivo. Nel nativo lo stato è realmente «3D interattivo»; il fallback è ottenuto senza WebGL e dichiara «Tavola di misura». Il processo è terminato con exit0, senza errori browser e senza deriva del fingerprint o del package. Browser e server figli del test sono chiusi. I991 pubblicati, le versioni storiche e i tentativi sono conservati nel database usa e getta; nessun dato di studenti è stato aperto.

Sono state lette le quattro griglie complete delle immagini DRAFT, oltre alle immagini originali a0° e75° e agli strumenti a320 px. Le64 coppie source/DRAFT hanno geometria e misure esattamente uguali.63 coppie di scena sono identiche pixel per pixel; nella sola coppia fallback320,10° differisce un singolo canale blu di un singolo pixel: da208 a209 alla posizione(158,178). I due SVG sono byte-identici. La differenza di rasterizzazione è registrata, senza alterare le immagini o dichiararle tutte byte-identiche.

Nel fallback la normale a75° resta piccola per la scala fisica dichiarata, circa5,81 CSS px a320; ora è separata dal disco della sfera e la sua punta è riconoscibile. Nel nativo a320 si osserva anch’essa completa fuori dal corpo. L’ispezione qui certifica il percorso e il perimetro dichiarati, non l’esperienza di ogni utente o ogni possibile rotazione manuale della camera; la vista nativa provata è l’obliqua iniziale. Nessuna dichiarazione clinica o generale di accessibilità deriva dal replay.

La legenda HTML nomina peso rosso20 N e normale verde, spiega la separazione lungo le linee d’azione e la scala comune, e dichiara la forza parallela non disegnata. È raggiungibile nel controllo reale «Legenda e gesti» e ha scrollWidth non superiore a clientWidth in tutti128 casi. Non vi sono sprite di nome che coprano le frecce.

## Provenienza e limiti

`diagnostic.json` è il report grezzo del replay reale; `complete-glyph-geometry.json` conserva i controlli delle mesh e delle rette d’azione; `edition-comparison.json` conserva tutti64 confronti. Le quattro `grid-*.png` sono pagine HTML di raccolta delle immagini originali, senza ritocchi. I tre log conservano le esecuzioni effettive.

La revisione riguarda il nuovo consumer b963. Non riabilita automaticamente le vecchie prove c177/5405, né corregge l’originale v1 che chiedeva un conto non notevole a40°. Il DRAFT140 mantiene i conti esatti a60° e0°. Nessun file di produzione, candidato, registro, pin o vecchio report è modificato da questa revisione. L’integratore e il revisore titolare del gruppo140 gestiranno il nuovo binding delle evidenze. Human NOT_RUN, publicationAction NONE.
