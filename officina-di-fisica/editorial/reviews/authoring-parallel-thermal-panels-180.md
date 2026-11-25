# Authoring DRAFT — parallel-thermal-panels-180

Letti individualmente tutti gli 80 prompt A178–182 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U5-04 SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. La fonte conserva i compiti e gli ID; la nuova edizione rende esplicite ipotesi, unità, segni, domini e procedimenti. Riletti i testi reali C3-L01/L05/L06 per scale, trasferimento e bilancio stazionario. La primaria degli 80 futuri ID B è stata salvata separatamente prima di candidati o chiavi B; non è un’approvazione di questi lotti A.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. Per coordinamento risorse il render nativo è NOT_RUN: non si attribuisce alcuna verifica visiva delle etichette o di layout a 320 px senza una prova reale successiva. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u5-parallel-thermal-panels-01 — Due percorsi fra le stesse temperature

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Con A₁=A₂=1 m², quanto vale P in W?

Procedimento d’autore: Il primo pannello ha conduttanza 1 W/K e conduce 10 W; il secondo ha conduttanza 2 W/K e conduce 20 W. Entrambi ricevono l’intero salto di dieci kelvin. La potenza totale è la somma dei due contributi, 30 W: l’energia si ripartisce fra due percorsi distinti.

Passaggi: P_1=G_1\Delta T;  P_1=10\,\mathrm W;  P_2=G_2\Delta T;  P_2=20\,\mathrm W;  P=P_1+P_2;  P=30\,\mathrm W.

Distrattori: 10 W o 20 W considerano un solo pannello. Un collegamento in serie condividerebbe la stessa potenza e ripartirebbe ΔT, mentre qui accade il contrario: i salti sono uguali e le potenze si sommano.

Hint: Applica il salto completo a ogni ramo e somma le due potenze.

Fonte canonica SHA256 ebfbcac9aa7e1af2deb0feb58ab035d8ecf125f172dca1472accb4436bfa53e8. Candidato SHA256 89c10c72739dbdbf7698796e7491ae4b1bd4b603e1be2292b5500115356f6410. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-02 — Potenza totale e coefficienti

La grandezza richiesta è la potenza termica totale attraverso due pannelli. Quale unità è appropriata?

Procedimento d’autore: Ogni ramo trasferisce energia per secondo e ha potenza in watt. La somma di due contributi espressi in watt rimane una potenza in watt. La conduttanza totale va ancora moltiplicata per un intervallo termico.

Passaggi: [G_1+G_2]=\mathrm{W/K};  [P]=\mathrm{W/K}\cdot\mathrm K;  [P]=\mathrm W.

Distrattori: J è energia, m² area, W/K conduttanza e W/(m·K) conducibilità. Non si sommano due aree o due conducibilità per ottenere direttamente watt.

Hint: Controlla l’unità di ciascun contributo prima di sommarlo.

Fonte canonica SHA256 7dd3383cb29a80f85dab4ec16e24a6274789e8e8c755d2280019cb51d1ad14e2. Candidato SHA256 fa3d5e6aedd31743c8dfbf5ad54551fc0fe2130ebcdb1f4094fcb2887b47a06d. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-03 — La relazione del parallelo termico

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Quale espressione dà P?

Procedimento d’autore: Ogni potenza è G_iΔT, con lo stesso ΔT. Raccogliendo il salto si trova P=ΔT(G₁+G₂). La conduttanza equivalente è la somma delle conduttanze, non il reciproco della loro somma.

Passaggi: P=P_1+P_2;  P=G_1\Delta T+G_2\Delta T;  P=\Delta T(G_1+G_2).

Distrattori: Dividere per la somma delle conduttanze non dà potenza. Sottrarre renderebbe il secondo ramo una sorgente opposta, mentre entrambi trasferiscono dal caldo al freddo. Il prodotto ha un fattore di conduttanza in più; dividere per ΔT dà W/K².

Hint: Raccogli il fattore termico comune ai due rami.

Fonte canonica SHA256 2509e912b8d3573c36a36a74d96578e0072bf63719d0d9707acc1b32012af5a6. Candidato SHA256 dd91885ae517b27572599f097e722b3c42432ce0b26f296823ac07ad3423d808. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-04 — Aumenta soltanto il primo pannello

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. A ha A₁=A₂=1 m². In B A₁=2 m² e A₂ resta 1 m². Come cambia P?

Procedimento d’autore: Il primo contributo raddoppia da 10 a 20 W. Il secondo rimane 20 W. Il totale passa quindi da 30 a 40 W, senza raddoppiare: è cambiata soltanto una parte della conduttanza complessiva.

Passaggi: P_{1,A}=10\,\mathrm W;  P_{1,B}=20\,\mathrm W;  P_{2,B}=20\,\mathrm W;  P_B=40\,\mathrm W.

Distrattori: 60 W raddoppierebbe anche il pannello invariato. 15 W rende inversa la dipendenza dall’area; 20 W ignora uno dei due percorsi della prova B.

Hint: Aggiorna il ramo modificato e conserva l’altro contributo.

Fonte canonica SHA256 42c9a420f3f54c7c5471eaa14cd686c777e24e702e5e7ff9d716a827aef7826d. Candidato SHA256 5e6ee40f848f537541e761f8a1e598b81f11de0613cac631d9a425d092b2f6ee. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-05 — L’area che completa trenta watt

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. P=30 W e A₂=1 m². Quanto vale A₁ in m²?

Procedimento d’autore: Il secondo pannello conduce già 20 W. Al primo restano 10 W, che devono essere prodotti con k₁=1 W/(m·K), ΔT=10 K e L=1 m. L’inversa A₁=P₁L/(k₁ΔT) dà 1 m². Il residuo positivo è necessario per un’area positiva.

Passaggi: P_1=P-P_2;  P_1=10\,\mathrm W;  A_1=\frac{P_1L}{k_1\Delta T};  A_1=1\,\mathrm{m^2}.

Distrattori: 3 m² attribuirebbero tutti i 30 W al primo ramo, aggiungendo poi erroneamente il secondo. Due metri quadrati darebbero 40 W totali. Non si sottrae un’area da una potenza.

Hint: Togli la potenza del ramo noto prima di invertire quello incognito.

Fonte canonica SHA256 de65ffb8390f32837a185e701278d9052afc04ba654c2a0758bc84b4a311cd13. Candidato SHA256 1c012c6fb649b681a0b651063ec5ead1df7d421c3cf488ac04bfe57af92c7caf. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-06 — Il materiale migliore richiede meno area

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. P=30 W e A₁=1 m². Quanto vale A₂ in m²?

Procedimento d’autore: Il primo pannello conduce 10 W e restano 20 W al secondo. Per k₂=2 W/(m·K), ogni metro quadrato conduce 20 W nelle condizioni assegnate, quindi A₂=1 m². Il maggiore valore di k₂ è già incluso e non va aggiunto un secondo fattore due.

Passaggi: P_2=P-P_1;  P_2=20\,\mathrm W;  A_2=\frac{P_2L}{k_2\Delta T};  A_2=1\,\mathrm{m^2}.

Distrattori: 3/2 m² userebbe tutta la potenza nel secondo ramo. Due metri quadrati userebbero k₁ al posto di k₂ dopo aver trovato il residuo e darebbero 50 W totali. Zero annullerebbe il ramo che deve fornire 20 W.

Hint: Usa la conducibilità del pannello del quale cerchi l’area.

Fonte canonica SHA256 59c2289bd67a14ed76e29e59bc7c8acdf56c4f9755aa010f648e184a20bdb539. Candidato SHA256 65348794c096a4d03aff4ed33587c279ad21d8b9c2aeb202715fdfd48e819f5b. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-07 — Raddoppia il ramo che conduce di più

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. A ha A₁=A₂=1 m². B conserva A₁=1 m² e ha A₂=2 m². Quanto vale P_B/P_A?

Procedimento d’autore: A conduce 10+20=30 W. B conduce 10+40=50 W. Il rapporto 50/30 si riduce a cinque terzi, perché il primo ramo resta invariato mentre raddoppia solo il secondo.

Passaggi: P_A=30\,\mathrm W;  P_B=50\,\mathrm W;  P_B/P_A=\frac53.

Distrattori: Due raddoppierebbe l’intera parete. Tre quinti è il reciproco; un mezzo rende inversa la dipendenza dall’area e uno ignora il contributo aggiuntivo.

Hint: Confronta le somme complete, non soltanto A₂.

Fonte canonica SHA256 a3ba9cc1225ae4cdbec07b19119c0ec9726fbcb5e89d59e8b8f36c7cf192da8a. Candidato SHA256 0cf0eb0d9fd42ab662a9118c6507f9eead5e86d81366ef9edf7fc1ee1da52445. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-08 — Una proposta che raddoppia la parete

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Con A₁=A₂=1 m² si propone P=60 W. Quanto vale proposta meno valore corretto?

Procedimento d’autore: Il totale corretto è 30 W, non sessanta. La differenza richiesta è 60−30=30 W. Una potenza di 60 W sarebbe coerente con entrambe le aree doppie, non con quelle assegnate qui.

Passaggi: P=30\,\mathrm W;  e=(60-30)\,\mathrm W;  e=30\,\mathrm W.

Distrattori: −30 W cambia l’ordine, 60 W copia la proposta, zero la accetta e due è il rapporto puro tra i due numeri.

Hint: Ricostruisci il totale della configurazione assegnata.

Fonte canonica SHA256 5a55fd568ef322d59228641413a17dff84eded26b0607b91b3f44d08337c3ef0. Candidato SHA256 2748ba1786ac4956710bba37c623492f1205f72c17b530f3b40e66ea3dfc19f5. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-09 — Isolare l’area del primo ramo

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Sono noti P e A₂, quindi G₂. Quale relazione isola A₁?

Procedimento d’autore: Dividendo la potenza per ΔT si ricava la conduttanza totale. Tolta G₂ resta G₁=k₁A₁/L. Moltiplichiamo per L e dividiamo per k₁: A₁=L(P/ΔT−G₂)/k₁. Il residuo deve essere positivo e il risultato è in metri quadrati.

Passaggi: G_1=\frac P{\Delta T}-G_2;  A_1=\frac{LG_1}{k_1}.

Distrattori: Il segno più aggiunge il ramo che bisogna togliere. PL/(k₁ΔT) attribuisce tutto P al primo pannello. Scambiare k₁ e L non dà area; l’ultima relazione dipende solo dal pannello noto e trascura la misura P.

Hint: Isola prima la conduttanza del ramo incognito.

Fonte canonica SHA256 4d57c721c28ac595ca90ca81f508b3e2c993ffe2f5325703cf0f65345c281f5f. Candidato SHA256 dfddeb335d42660f3a70c3834a465edc413a2481b5d43c51c885e1510542d869. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-10 — Aree diverse, stessa differenza termica

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. B ha A₁,B=κ₁A₁,A e A₂,B=κ₂A₂,A, con fattori positivi. Quanto vale P_B/P_A?

Procedimento d’autore: Ogni conduttanza cresce linearmente con la propria area. Il totale B è κ₁G₁+κ₂G₂. Il salto comune si cancella nel rapporto con P_A=ΔT(G₁+G₂), lasciando una media dei fattori pesata con le conduttanze iniziali.

Passaggi: G_B=\kappa_1G_1+\kappa_2G_2;  \frac{P_B}{P_A}=\frac{\kappa_1G_1+\kappa_2G_2}{G_1+G_2}.

Distrattori: Il prodotto tratterebbe le aree come fattori della stessa potenza, ma appartengono a rami distinti. Il reciproco inverte il confronto. Per un fattore comune κ il rapporto è κ, non uno o 2κ.

Hint: La somma delle potenze deve restare anche dopo la sostituzione dei fattori.

Fonte canonica SHA256 304d3c60b1a11aacaeda09514707d3d1f1ac6d4af9034b72e316816116e6258e. Candidato SHA256 5e9cc13d765aa51c9c23b1a4873cda04b9790af4f72114ab2aed7425b44e8fb5. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-11 — Raddoppiare tutta l’area dei due rami

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. A ha A₁=A₂=1 m². B ha A₁=A₂=2 m². Quanto vale P_B/P_A?

Procedimento d’autore: I contributi da 10 e 20 W diventano 20 e 40 W. Il totale passa da 30 a 60 W: raddoppia come entrambe le aree. Sommare due contributi doppi non produce un fattore quattro sul totale.

Passaggi: P_A=30\,\mathrm W;  P_B=60\,\mathrm W;  P_B/P_A=2.

Distrattori: Quattro moltiplica due raddoppi che vanno invece distribuiti su una somma. Un mezzo è il reciproco; tre confonde la somma numerica dei coefficienti di conducibilità con il rapporto delle prove.

Hint: Raccogli il fattore due dalla somma dei contributi.

Fonte canonica SHA256 6b23283992acde69fb571db1cb60124052dd77bbe3709840f3fc849745eb0f33. Candidato SHA256 ec452ad6c0e3a3750bd88dffd74973a323ee7bb4736f3317184aea6ad9d570ae. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-12 — Una media che qui commuta con il modello

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. A usa A₁=A₂=1 m²; B usa A₁=A₂=2 m². Qual è la media aritmetica delle potenze con uguale peso?

Procedimento d’autore: Le potenze sono 30 e 60 W. La metà della somma 90 W è 45 W. In questo modello lineare nelle due aree, anche le aree medie 3/2 m² e 3/2 m² danno 15+30=45 W. L’uguaglianza segue dalla linearità con k, L e ΔT fissati, non da una regola universale per ogni formula fisica.

Passaggi: \overline P=\frac{30+60}{2}\,\mathrm W;  \overline P=45\,\mathrm W;  P(\overline A_1,\overline A_2)=45\,\mathrm W.

Distrattori: 90 W è la somma senza metà. 15 W è metà della differenza; 30 W o 60 W tengono soltanto uno dei due risultati. La media delle uscite è la grandezza richiesta anche quando coincide con il calcolo agli ingressi medi.

Hint: Dopo la media, verifica separatamente perché qui gli ingressi medi danno lo stesso numero.

Fonte canonica SHA256 c359d678f8b5d89ff2deb7d9aef971f34e2313a95972ad636edaea0d328e1736. Candidato SHA256 fe97825c6546ff6530e674dfbaa7603d82ce6238deb38d4b89eeb5fcc75fc9c7. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-13 — Una potenza doppia con A₁ già assegnata

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. A ha A₁=A₂=1 m². B ha A₁=2 m² e deve condurre due volte P_A. Quanto vale A₂,B/A₂,A?

Procedimento d’autore: Il bersaglio è 60 W. Il primo pannello B ne conduce 20; il secondo deve fornire 40 W. Con venti watt per metro quadrato occorrono 2 m² nel secondo ramo, il doppio dell’area iniziale.

Passaggi: P_B=60\,\mathrm W;  P_{2,B}=40\,\mathrm W;  A_{2,B}=2\,\mathrm{m^2};  A_{2,B}/A_{2,A}=2.

Distrattori: Un mezzo capovolge il rapporto. Quattro darebbe 100 W totali con il primo pannello già raddoppiato; uno darebbe 40 W. Sessanta copia il valore della potenza bersaglio.

Hint: Togli dal bersaglio il contributo del primo pannello.

Fonte canonica SHA256 b949dc52c2d21699ef829cdf5503ff398f934dfc6990f4b981a789552345fd19. Candidato SHA256 3abee590913d9b5fc1e3857fe690fa970dd99ca09df28a8ccd0b33d06339db44. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-14 — Tarare la somma prima dell’area

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Il display continuo adimensionale è S=qP, q>0. A con A₁=A₂=1 m² dà S=90. B dà S=180 e ha A₂=2 m². Quanto vale A₁,B in m²?

Procedimento d’autore: Il riferimento conduce 30 W, quindi q=3 W⁻¹. La lettura 180 indica 60 W. Il secondo pannello B conduce già 40 W, perciò al primo ne restano 20, che richiedono un’area di 2 m².

Passaggi: q=3\,\mathrm{W^{-1}};  P_B=60\,\mathrm W;  P_{1,B}=20\,\mathrm W;  A_{1,B}=2\,\mathrm{m^2}.

Distrattori: Senza taratura si userebbero 180 W, lasciando 140 W al primo pannello e ottenendo 14 m². Un metro quadrato darebbe 50 W totali e S=150, non 180.

Hint: Il display legge il totale: prima decodificalo, poi sottrai il ramo noto.

Fonte canonica SHA256 369400317bd6cb9eb6a1c75afecb054caab0c41d1ab4dc9de2846f04b5652bc9. Candidato SHA256 3b357572ed4fddf70e01b31d0b414f505313a36d63e0ff663500e2073acd702a. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-15 — Offset e potenza del pannello noto

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Il display è S=qP+b, continuo e adimensionale, q>0. A: A₁=A₂=1 m²,S=61. B: A₁=A₂=2 m²,S=121. C: A₂=1 m²,S=81. Quanto vale A₁,C?

Procedimento d’autore: I riferimenti conducono 30 e 60 W. q=(121−61)/(60−30)=2 W⁻¹ e b=1. C conduce (81−1)/2=40 W. Venti watt vengono dal secondo pannello noto; i venti restanti richiedono A₁,C=2 m².

Passaggi: q=2\,\mathrm{W^{-1}};  b=1;  P_C=40\,\mathrm W;  P_{1,C}=20\,\mathrm W;  A_{1,C}=2\,\mathrm{m^2}.

Distrattori: 41/20 m² omette b, usa 81/2 W e predice S=82. Un metro quadrato torna ad A; quattro metri quadrati darebbero totale 60 W e S=121. Quaranta copia il numero della potenza.

Hint: Dopo aver tolto l’offset resta ancora da separare il contributo del secondo pannello.

Fonte canonica SHA256 40c3e040bd8e708c6dbe4d001da1a438192430c5b6732d4c9c1faea444a2b453. Candidato SHA256 99e348384f4024f77baf5f08cc60e0921633d58525b49a24353d031dde0a89e1. Revisione indipendente e human NOT_RUN.

## AR-u5-parallel-thermal-panels-16 — Aree uguali e scala determinata dalla potenza

Due pannelli affiancati collegano direttamente gli stessi lati caldo e freddo, mantenuti a differenza ΔT=10 K. Hanno spessore comune L=1 m, aree A₁,A₂>0 in m² e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Il flusso in ciascun pannello è monodimensionale e stazionario, senza sorgenti e con scambi laterali trascurati. Definiamo le conduttanze G₁=k₁A₁/L e G₂=k₂A₂/L, in W/K. P>0 è la potenza totale dal caldo al freddo. Le aree possono cambiare fra apparati diversi: non è imposto un valore fisso di A₁+A₂. Si impone A₁=A₂ e si misura P=30 W. Quanto vale A₂>0?

Procedimento d’autore: Con aree uguali, P=[(k₁+k₂)ΔT/L]A₂. Il coefficiente vale 30 W/m². La misura di 30 W impone A₂=1 m² e dunque anche A₁=1 m². Il rapporto delle aree da solo non fisserebbe la scala, ma la potenza totale lo fa.

Passaggi: P=\frac{(k_1+k_2)\Delta T}{L}A_2;  P=(30\,\mathrm{W/m^2})A_2;  A_2=1\,\mathrm{m^2}.

Distrattori: Due metri quadrati darebbero 60 W e tre 90 W. Trenta copia la potenza come area. Non sono infinite possibilità con entrambe le condizioni imposte: il totale cresce con la scala comune delle aree.

Hint: Sostituisci l’uguaglianza delle aree prima di usare la misura.

Fonte canonica SHA256 129599e5b91fbbf36de880dae11e41620544dfb2d5bc262973be01aa5da12ace. Candidato SHA256 2dcaaabd777773fdbbfcb5da7946533ae59c0af894d6fd1e070dc54f6c69a87a. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 304c86a85353fa99ffad1b7bbcaf611235f433f20ea660c825d2f6d6ecdde9ba. Package file SHA256 453a134c052d3ace00548e31c36e64e012d4bc0f94553bb80feecc2d7a2e60db. Binding file SHA256 49e774c985e1516ec17705b2419082b6c7a83c3411ab5bfbaef18ebfdebec223. Prova strutturale SHA256 e92e208739614c5dfa2ded72b0357ad77cd5724a75a4764666bb9d6eca2be7a6. Asset-only manifest SHA256 e1498efee469c133f275a78f39dc503986f468029acde63e49e25cda9615d653.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Supplemento di resa nativa

Dopo la riapertura delle operazioni limitate è stato eseguito realmente Quick Look sotto mutex condiviso e guardia di spazio libero di 2 GiB. Exit 0 osservato; PNG integrale letto: collegamenti schematici, barre proporzionate e testi separati dagli assi. Il precedente manifest NOT_RUN è conservato byte per byte in initial-not-run-manifest.json. Package, binding e prova strutturale restano immutati. La prova è asset-only; UI prodotto e revisione scientifica indipendente restano NOT_RUN.

Manifest corrente SHA256 58a1b2c929dc1a7da5fa2dce2169fdd938a993224210b1f997f2f7fbf960a8e1.
