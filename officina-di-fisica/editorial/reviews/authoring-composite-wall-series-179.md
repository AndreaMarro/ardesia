# Authoring DRAFT — composite-wall-series-179

Letti individualmente tutti gli 80 prompt A178–182 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U5-04 SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. La fonte conserva i compiti e gli ID; la nuova edizione rende esplicite ipotesi, unità, segni, domini e procedimenti. Riletti i testi reali C3-L01/L05/L06 per scale, trasferimento e bilancio stazionario. La primaria degli 80 futuri ID B è stata salvata separatamente prima di candidati o chiavi B; non è un’approvazione di questi lotti A.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e in una resa nativa Quick Look a piena altezza, conservata nella prova asset-only: non è un replay dell’app né una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u5-composite-wall-series-01 — Due cadute termiche sulla stessa corrente

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Con L₁=1 m e L₂=2 m, quanto vale P in W?

Procedimento d’autore: Ogni strato ha resistenza 1 K/W: il secondo è spesso il doppio ma conduce due volte meglio. Le resistenze in serie si sommano perché la stessa potenza attraversa entrambi senza accumulo. Il totale è 2 K/W e i sessanta kelvin danno 30 W. Ciascuno strato sostiene una caduta di 30 K.

Passaggi: R_1=1\,\mathrm{K/W};  R_2=1\,\mathrm{K/W};  R=R_1+R_2;  P=\frac{\Delta T}{R};  P=30\,\mathrm W.

Distrattori: 60 W considererebbero un solo strato. Sommare due potenze calcolate usando su ciascuno l’intero salto di 60 K descriverebbe due percorsi in parallelo e darebbe 120 W. Il calore non attraversa qui due pareti indipendenti.

Hint: Ricava entrambe le resistenze prima di usare il salto totale.

Fonte canonica SHA256 3de9219b5b1d3283201d6bd1c1b3f701029c0e3b9b29b9e54b01480f0a540d45. Candidato SHA256 254b32e9b75e3ff506874c1f1469571a99a0e6f1d0059990d53b84aadbe65f85. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-02 — Potenza e resistenza termica

Una parete composta conduce una potenza termica P. Quale unità esprime P?

Procedimento d’autore: Il salto totale in kelvin diviso una resistenza in kelvin al watt lascia watt. Il risultato è energia trasferita ogni secondo e non l’energia complessiva, che dipenderebbe dalla durata.

Passaggi: [P]=\frac{\mathrm K}{\mathrm{K/W}};  [P]=\mathrm W.

Distrattori: J è energia, K/W resistenza, W/K conduttanza e W/(m·K) conducibilità. L’inverso della resistenza non è ancora una potenza: va moltiplicato per la differenza termica.

Hint: Semplifica le unità di ΔT/R.

Fonte canonica SHA256 7465dac53e5ca3e4d795334816bc3258ae1bc68475c337a6e590715f85aa17b2. Candidato SHA256 813a75a8d36e00df69958f9b33d49d4a2cd6316b6a4a2dc1758c55f89825d65e. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-03 — La legge della serie nasce dalla stazionarietà

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Quale relazione è corretta?

Procedimento d’autore: Il primo strato ha caduta PR₁ e il secondo PR₂. Sommando le cadute si ottiene ΔT=P(R₁+R₂), quindi P=ΔT/(R₁+R₂). Nel contatto ideale la temperatura è continua; non c’è una caduta aggiuntiva di contatto.

Passaggi: \Delta T_1=PR_1;  \Delta T_2=PR_2;  \Delta T=P(R_1+R_2);  P=\frac{\Delta T}{R_1+R_2}.

Distrattori: Moltiplicare per la resistenza ha unità K²/W. La somma dei due quozienti assegna erroneamente a ogni strato tutto ΔT. La differenza può annullarsi anche con una parete reale; l’ultimo quoziente è il reciproco della potenza.

Hint: Somma le cadute di temperatura, non due potenze indipendenti.

Fonte canonica SHA256 1fbf73b34b6fefecfab2136664d7bdfe9e1a448debd95bb5e2907c07bf8d0d4b. Candidato SHA256 950d675acfcdffddb68d200939fdcc14a4e669ef7b88a58bddb76a552a476dcd. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-04 — Aumentare soltanto il primo spessore

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. A ha L₁=1 m,L₂=2 m. B ha L₁=2 m e lo stesso L₂=2 m. Come cambia P?

Procedimento d’autore: In A le due resistenze valgono 1 e 1 K/W, totale 2. In B valgono 2 e 1 K/W, totale 3. A salto fissato, la potenza passa da 60/2=30 W a 60/3=20 W. Il totale della resistenza cresce di tre mezzi, non raddoppia.

Passaggi: R_A=2\,\mathrm{K/W};  R_B=3\,\mathrm{K/W};  P_A=30\,\mathrm W;  P_B=20\,\mathrm W.

Distrattori: 15 W raddoppierebbero tutta la resistenza, compreso lo strato rimasto invariato. 60 W rendono diretta la dipendenza dallo spessore; 40 W va anch’esso nel verso opposto all’aumento di resistenza.

Hint: Cambia solo R₁, poi ricostruisci il totale.

Fonte canonica SHA256 fb66f681573fe58eb50cf74eebfa7d91dfb07c3bebe5c3f270b5069664e44f17. Candidato SHA256 348e3d0ffbba235c0cb9aa3e64ab9f77a1041cc3a96a51d146fea41eb44b2f4a. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-05 — Togliere la resistenza già nota

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Si misura P=30 W e si conosce L₂=2 m. Quanto vale L₁ in m?

Procedimento d’autore: La resistenza totale è ΔT/P=60/30=2 K/W. Lo strato noto ne occupa 1 K/W; resta R₁=1 K/W. Dalla definizione L₁=k₁AR₁ si trova uno spessore di 1 m. Il residuo deve essere strettamente positivo.

Passaggi: R=\frac{\Delta T}{P};  R=2\,\mathrm{K/W};  R_1=R-R_2;  R_1=1\,\mathrm{K/W};  L_1=k_1AR_1;  L_1=1\,\mathrm m.

Distrattori: Due metri assegnerebbero al primo strato tutta la resistenza, dimenticando il secondo. Una resistenza negativa non darebbe uno spessore fisico positivo. Non si sottrae direttamente L₂ da ΔT/P: hanno unità diverse.

Hint: Sottrai prima resistenze omogenee e converti il residuo in lunghezza.

Fonte canonica SHA256 a40e11f8da4516465b6336fdaaca339fee5a7f043597dd56874a7861ece205dc. Candidato SHA256 22809577280395a32f872425333ddc79fde2a1f4e7c0f721cbc91693e6c08eb4. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-06 — Il secondo materiale conduce meglio

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. P=30 W e L₁=1 m. Quanto vale L₂ in m?

Procedimento d’autore: Il totale è 2 K/W e il primo strato ne usa 1. La resistenza restante del secondo è quindi 1 K/W. Poiché k₂A=2 W·m/K, lo spessore che produce quella resistenza è L₂=k₂AR₂=2 m.

Passaggi: R_2=\frac{\Delta T}{P}-R_1;  R_2=1\,\mathrm{K/W};  L_2=k_2AR_2;  L_2=2\,\mathrm m.

Distrattori: Un metro userebbe k₁ anche per il secondo materiale e darebbe resistenza 1/2 K/W. Quattro metri ignorerebbero la resistenza del primo strato. La conducibilità è un dato del materiale, non una resistenza da sommare.

Hint: Dopo il residuo, usa k₂ e non k₁ per tornare allo spessore.

Fonte canonica SHA256 5abee3252809999b2627ad1831a1b35592f7265fa16ad41a80e15700fd90feab. Candidato SHA256 4f9f36f2071a14c3df4e72fbfd02796c167a32b11727b5947ae1f6cd333477ca. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-07 — Raddoppiare soltanto il secondo strato

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. A ha L₁=1 m,L₂=2 m. B mantiene L₁=1 m e ha L₂=4 m. Quanto vale P_B/P_A?

Procedimento d’autore: A ha resistenza totale 2 K/W e potenza 30 W. In B, R₂ diventa 2 K/W e il totale 3 K/W, quindi P_B=20 W. Il rapporto 20/30 si riduce a due terzi.

Passaggi: R_A=2\,\mathrm{K/W};  R_B=3\,\mathrm{K/W};  P_B/P_A=\frac23.

Distrattori: Un mezzo segue inversamente solo il raddoppio di L₂, perdendo lo strato rimasto uguale. Tre mezzi capovolge il rapporto delle potenze; due rende diretta la dipendenza dallo spessore.

Hint: Il rapporto delle potenze è l’inverso del rapporto delle resistenze totali.

Fonte canonica SHA256 4650fdb72bb74049f9fbc2d235e2c66ef1e971e3a1a7141cfa6e360c0f179008. Candidato SHA256 d0ddf7333aca198b263246e9fdab347a6378d3531b41e7b45eb95d88f7f9d007. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-08 — Una proposta che perde uno strato

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Con L₁=1 m,L₂=2 m si propone P=60 W. Quanto vale proposta meno potenza corretta?

Procedimento d’autore: La resistenza totale è 2 K/W, dunque P=30 W. La proposta di 60 W è maggiore di trenta watt. Essa avrebbe usato soltanto una resistenza da 1 K/W, invece della serie completa.

Passaggi: P=30\,\mathrm W;  e=(60-30)\,\mathrm W;  e=30\,\mathrm W.

Distrattori: −30 W inverte lo scarto, 60 W copia la proposta e zero la accetta. Due è il rapporto puro proposta/corretto, non una differenza in watt.

Hint: Controlla quanti strati compaiono nella resistenza della proposta.

Fonte canonica SHA256 3c8e602339860cecc6847a76a1bcbcf3e519524aa9c4e4e86e7e1bb2e5c06e93. Candidato SHA256 2517bdd05caefc9d296f21766fb3a45a98a4f5cd7c263ecb7a171f45acd4491a. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-09 — Isolare uno spessore dopo il bilancio

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Sono noti P e L₂, quindi R₂. Quale formula ricava L₁?

Procedimento d’autore: Dal totale ΔT/P togliamo R₂ per isolare R₁. Poi L₁=k₁AR₁. Ne segue L₁=k₁A(ΔT/P−R₂), ammissibile soltanto se ΔT/P>R₂. Il prodotto ha unità metri.

Passaggi: R_1+R_2=\frac{\Delta T}{P};  R_1=\frac{\Delta T}{P}-R_2;  L_1=k_1AR_1.

Distrattori: Il segno più aggiunge lo strato noto invece di rimuoverlo. P/ΔT è conduttanza e non resistenza. Dividere il residuo per k₁A non dà metri; l’ultima formula omette completamente il secondo strato.

Hint: Trova R₁ e solo dopo converti resistenza in spessore.

Fonte canonica SHA256 c78765fef6962e6c01b52f4cfd15f52423bb0c27c03187c532100c08a25ab581. Candidato SHA256 bdffcad5be9f3ae9f677d8abd2a6811c85478a53f33fb942aa9ffc3b7cb19890. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-10 — Due spessori scalati indipendentemente

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. B usa L₁,B=κ₁L₁,A e L₂,B=κ₂L₂,A, con fattori positivi. Quanto vale P_B/P_A?

Procedimento d’autore: Ogni resistenza cresce con lo spessore del suo strato, perciò in B il totale è κ₁R₁+κ₂R₂. Il salto esterno resta lo stesso. Nel rapporto delle potenze i sessanta kelvin si cancellano, lasciando resistenza totale A divisa per quella B.

Passaggi: R_B=\kappa_1R_1+\kappa_2R_2;  \frac{P_B}{P_A}=\frac{R_1+R_2}{\kappa_1R_1+\kappa_2R_2}.

Distrattori: Il rapporto opposto rende la potenza crescente con resistenza. Prodotto, quoziente e somma dei soli fattori non pesano i due strati; un fattore comune κ deve dare 1/κ, non κ², uno o 2κ.

Hint: Trasforma i due spessori in resistenze prima del rapporto.

Fonte canonica SHA256 6f9dc5afcbd0ab77570681116b6973a2a31d8f16d07f047776dcbb5a420f16ea. Candidato SHA256 99a2d91b662fc85c57158056e2c89976f00086482119aed6c055f6997af29e21. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-11 — Tutta la parete diventa più spessa

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. A ha L₁=1 m,L₂=2 m; B ha L₁=2 m,L₂=4 m. Quanto vale P_B/P_A?

Procedimento d’autore: Le due resistenze raddoppiano insieme, così il totale passa da 2 a 4 K/W. La potenza si dimezza: 30 W in A e 15 W in B. Due strati raddoppiati non producono un fattore quattro sulla somma delle resistenze.

Passaggi: R_B=2R_A;  P_A=30\,\mathrm W;  P_B=15\,\mathrm W;  P_B/P_A=\frac12.

Distrattori: Due scambia resistenza e potenza. Un quarto raddoppia due volte lo stesso totale; quattro e uno non rispettano la dipendenza inversa dal totale.

Hint: Un fattore comune esce dalla somma delle resistenze una sola volta.

Fonte canonica SHA256 09143ffdd3de398a7a8e46c2eb8a70f8b9e80631ccbcf175a3aa98e4f1fb278d. Candidato SHA256 f106b2a845a1cb930cda8b70d97dd4ee1074edc043cc649b08332662cc333b55. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-12 — La media di un quoziente non è il quoziente medio

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. A usa L₁=1 m,L₂=2 m; B usa L₁=2 m,L₂=4 m. Qual è la media aritmetica delle potenze con uguale peso?

Procedimento d’autore: Le potenze sono 30 e 15 W. Sommandole si ottiene 45 W e dividendo per due 45/2 W. Agli spessori medi 3/2 e 3 m il totale è invece 3 K/W e la potenza 20 W. La media statistica va fatta sulle uscite già calcolate.

Passaggi: \overline P=\frac{30+15}{2}\,\mathrm W;  \overline P=\frac{45}{2}\,\mathrm W;  P(\overline L_1,\overline L_2)=20\,\mathrm W.

Distrattori: 20 W usa gli ingressi medi; 45 W dimentica il dimezzamento. 15/2 W fa metà della differenza e 30 W trascura B.

Hint: Calcola prima le due resistenze totali e le due potenze.

Fonte canonica SHA256 f845a66c31389c59815c92da633aa4bc54187d42e0d8e3c21b16c229f2543d60. Candidato SHA256 da4caaf7824c00ff49e87975c1dead6c0ba849acf0c6f3e9588f980e52c862a4. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-13 — Metà potenza con il primo spessore assegnato

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. A ha L₁=1 m,L₂,A=2 m. B ha L₁=2 m e deve condurre metà di P_A. Quanto vale L₂,B/L₂,A?

Procedimento d’autore: Il bersaglio è 15 W, che richiede 4 K/W totali. Il primo strato B occupa già 2 K/W; restano 2 K/W al secondo, quindi L₂,B=4 m. Rispetto ai due metri iniziali il rapporto è due.

Passaggi: P_B=15\,\mathrm W;  R_B=4\,\mathrm{K/W};  R_{2,B}=2\,\mathrm{K/W};  L_{2,B}=4\,\mathrm m;  L_{2,B}/L_{2,A}=2.

Distrattori: Un mezzo inverte il confronto; quattro copia il numero di metri di B. Uno darebbe totale 3 K/W e potenza 20 W; quindici copia il numero del bersaglio in watt.

Hint: Trova la resistenza richiesta dal bersaglio e sottrai il primo strato.

Fonte canonica SHA256 fc8d0e1d490ffdd31d2069fad772615211127aec2ba26c1cb5c211b2bc2c619e. Candidato SHA256 94201ecf2e60ec08652268178a35187c39e8ab66435e725772c0e9b536c2266b. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-14 — Taratura prima della resistenza totale

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Il display continuo è S=qP, adimensionale con q>0. A con L₁=1 m,L₂=2 m dà S=90. B dà S=45 e ha L₂=4 m. Quanto vale L₁,B in m?

Procedimento d’autore: A conduce 30 W e dà q=3 W⁻¹. La lettura 45 significa P_B=15 W, dunque totale 4 K/W. Il secondo strato B ha resistenza 2 K/W; restano 2 K/W al primo e L₁,B=2 m.

Passaggi: q=3\,\mathrm{W^{-1}};  P_B=15\,\mathrm W;  R_B=4\,\mathrm{K/W};  R_{1,B}=2\,\mathrm{K/W};  L_{1,B}=2\,\mathrm m.

Distrattori: Usare 45 come watt darebbe resistenza totale 4/3 K/W, già minore dei 2 K/W del secondo strato: produrrebbe uno spessore negativo. La taratura è necessaria anche per controllare il dominio.

Hint: Decodifica P e confronta il totale con la parte già nota.

Fonte canonica SHA256 2d38c7c6d790774f084c793add75d5115766dfe7c7db5f2a959af0e5556098fe. Candidato SHA256 901b2533708d05b9d0b80bf9e018ca68d632f0b10231fc4d3b913e4dd164c8f9. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-15 — L’offset va tolto prima dell’inversa

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Il display è S=qP+b, continuo e adimensionale, q>0. A: L₁=1 m,L₂=2 m,S=61. B: L₁=2 m,L₂=4 m,S=31. C: L₂=2 m,S=41. Quanto vale L₁,C?

Procedimento d’autore: A e B conducono 30 e 15 W. Le differenze danno q=(61−31)/(30−15)=2 W⁻¹ e poi b=1. C conduce 20 W e ha resistenza totale 3 K/W. Il secondo strato occupa 1 K/W: L₁,C=2 m.

Passaggi: q=2\,\mathrm{W^{-1}};  b=1;  P_C=20\,\mathrm W;  R_C=3\,\mathrm{K/W};  L_{1,C}=2\,\mathrm m.

Distrattori: 79/41 m omette b: usa P=41/2 W e L₁=(120/41−1) m, ma la lettura fisica ricostruita sarebbe 42. Un metro torna ad A; tre metri darebbero 15 W e S=31. Venti copia il numero della potenza.

Hint: La lettura di C richiede la stessa sottrazione dell’offset trovata sui riferimenti.

Fonte canonica SHA256 7d1c8071b9534b045ae1a6e7c51a41bcdedde1b2b6738e52e989d955fef30412. Candidato SHA256 bf57f23c301dd6a7bab7d47b574d666682194b9cc4fd24e2e0d86d8d40fe6d2f. Revisione indipendente e human NOT_RUN.

## AR-u5-composite-wall-series-16 — Un rapporto fra spessori determina la scala

Una parete a facce quadrate di lato 1 m, area A=1 m², ha due strati omogenei in serie, con spessori L₁,L₂>0 in m e conducibilità costanti k₁=1 W/(m·K), k₂=2 W/(m·K). Le facce esterne sono mantenute a differenza ΔT=60 K. Contatto perfetto, lati isolati, regime stazionario monodimensionale e nessuna generazione interna. Definiamo R₁=L₁/(k₁A) e R₂=L₂/(k₂A), in K/W. P>0 è il modulo della potenza dal caldo al freddo, uguale nei due strati. Fra preparazioni si impone L₁=L₂/2. Si misura P=30 W. Quanto vale L₂>0?

Procedimento d’autore: Il vincolo rende uguali le due resistenze: R₁=L₂/(2k₁A) e R₂=L₂/(k₂A), con k₂=2k₁. Il totale è L₂/(k₁A). La misura richiede 2 K/W, quindi L₂=k₁A·2 K/W=2 m e L₁=1 m. Il rapporto da solo non fissava la scala, ma la potenza misurata la determina.

Passaggi: R_1=R_2;  R=\frac{L_2}{k_1A};  R=\frac{60\,\mathrm K}{30\,\mathrm W};  L_2=2\,\mathrm m.

Distrattori: Un metro scambia L₁ con L₂ e quattro metri darebbero 15 W. Trenta copia la potenza come lunghezza. Non sono infinite possibilità dopo aver imposto anche P=30 W: il totale non è invariante per un fattore comune degli spessori.

Hint: Sostituisci il rapporto nella resistenza e usa la potenza per fissare la scala.

Fonte canonica SHA256 484b466de909d32623f7b59033cd42d7092cf72803033f1b525952f2e7a2c03d. Candidato SHA256 432c4db98191b3c56fb7a1ca71b4fe40de369678e3d05a226c1747c0ecce2af5. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 8a3235324782da1868733e1176b07f30869ced27de64c7b9c05c776a689f0ea1. Package file SHA256 9e6f0b5946134c4483ea6ce71b591c880a85c3427976ac7e5c364a1327622df7. Binding file SHA256 0b10dfc9e5b63966a33d734133aa67bb2ecbc8d1e2d35c5260cccf4446afead7. Prova strutturale SHA256 b0dc9e0110f054e458843af8f595c996e8cba691f047bda20210e1f5d887c4af. Asset-only manifest SHA256 5998bc228f94b1d662666fb2a857b6886c04c7d9c98182fb03499da20e726d2c.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.
