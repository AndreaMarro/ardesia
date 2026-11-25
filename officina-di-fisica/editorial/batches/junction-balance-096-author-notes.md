# Note d’autore — junction-balance-096

Letti singolarmente tutti i 16 originali U3-03 alla fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Riletta C2-L005 sul bilancio di massa a un nodo e sulla continuità volumetrica a densità comune. Primaria C2-L005, prerequisiti C2-L001/L005, riuso C6; assembler unico course C2, unit u3, source_path U3-03.

Nodo rigido in regime stazionario, stesso liquido omogeneo incomprimibile in tutti i rami, nessun accumulo o fuga di liquido. Q_e entra; Q₁ e Q₂ escono e sono moduli positivi. Dominio Q_e > Q₁ > 0. Il bilancio Q_e − Q₁ − Q₂ = 0 conserva la massa; non presuppone assenza di dissipazione meccanica né pressioni uguali. Portate diverse appartengono a prove stazionarie distinte.

01: 10 − 4 = 6 L/s; controllo 4 + 6 = 10. 02: unità di volume per tempo, L/s. 03: i versi assegnati danno Q₂ = Q_e − Q₁; nessuna ripartizione uniforme richiesta. 04: ingresso 10→12 L/s con prima uscita 4 L/s porta la seconda da 6 a 8 L/s. Il fattore di ingresso 6/5 non moltiplica l’intero residuo, perché Q₁ non scala.

05: ingresso come somma 4 + 6 = 10 L/s. 06: prima uscita 10 − 6 = 4 L/s. 07: prima uscita 4→5 L/s, ingresso 10, dà residui 6→5 L/s e rapporto 5/6; diminuzione relativa −1/6, distinta dal rapporto finale. 08: proposta 12 meno corretto 6 = +6 L/s; le uscite proposte richiederebbero ingresso 16 L/s.

09: aggiungendo Q₁ ai due membri si isola Q_e = Q₁ + Q₂. 10: U = Q_e − Q₁ > 0, D = κ₁Q_e − κ₂Q₁ > 0; rapporto D/U. Non si sostituisce una sottrazione con una legge di fattori puri. 11: stati (10,4) e (12,5) L/s danno uscite 6 e 7 L/s, rapporto 7/6. 12: media (6+7)/2 = 13/2 L/s. La differenza degli ingressi medi 11 − 9/2 coincide qui esattamente: linearità del bilancio. Pesi statistici uguali, nessuna media temporale implicita.

13: il bersaglio (7/6)·6 = 7 L/s con ingresso 12 richiede prima uscita 5 L/s; rapporto 5/4. 14: q = 18/(6 L/s) = 3 s/L; lettura 21 dà seconda uscita 7 L/s; con prima uscita 5 l’ingresso è 12 L/s. 15: riferimenti 6 e 7 L/s con letture 13 e 15 danno q = 2 s/L e b = 1. Lettura 17 dà 8 L/s alla seconda uscita e ingresso 12 L/s. Ingressi 10,11,13 con Q₁ = 4 darebbero letture 13,15,19. L’offset non è una portata fisica aggiunta al nodo.

16: Q_e = (5/2)Q₁ porta a Q₂ = (3/2)Q₁. Dato Q₂ = 6 L/s, si ha Q₁ = 4 L/s e Q_e = 10 L/s. Il coefficiente 5/2 è adimensionale e supera uno, lasciando residuo positivo. Il vincolo determina una coppia, senza ridondanza.

SVG 01/03: frecce di portata lunghe 200,80,120 px per 10,4,6 L/s alla stessa scala 20 px/(L/s), ciascuna in un proprio path. Raccordi topologici, geometria non in scala. Barre in A 200 = 80 + 120 px; in B 240 = 100 + 140 px, cioè 12 = 5 + 7 L/s. Dodici celle da 20 px danno visivamente cinque più sette unità di portata. Nessuna freccia viene interpretata come forza o pressione. XML e rendering completo letti.

Assembly e binding riprodotti identici, metadati C2 controllati. Import canonico ROOT con SQLite temporaneo: 16 DRAFT, seconda importazione 0 nuove e 16 invariate; 991 pubblicati e storico invariati, SHA256 pubblicati 99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee. Pacchetto SHA256 476aa8dd7fc85e30f8c073a92ccf75a7f320f7920f492ca38839c4cf908b5285. Anteprima tecnica autore: 48 casi a 1440/768/320 px senza failure; il protocollo finale dell’integratore resta separato. Nessun verdetto scientifico proprio: independentReview NOT_RUN, human NOT_RUN, publication NONE.

Rilievo del reviewer distinto sul feedback 16: otto non è l’esito della moltiplicazione per 3/2 al posto della divisione, che darebbe nove. Eliminata l’attribuzione falsa; ora l’alternativa otto viene confutata sostituendo nel vincolo: (3/2)·8 = 12 L/s anziché 6 L/s. Solo feedback/error.message e binding del record 16 cambiati; tutte le formule, risposte, figure e altri 15 record identici. Nuovo package SHA256 0d750c2132817ebb6f9bac07885bb8dc11567836d535fd0c11b648165dda3c44. L’autore non congela la nuova firma scientifica.
