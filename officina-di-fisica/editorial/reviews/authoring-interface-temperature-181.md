# Authoring DRAFT — interface-temperature-181

Letti individualmente tutti gli 80 prompt A178–182 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U5-04 SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. La fonte conserva i compiti e gli ID; la nuova edizione rende esplicite ipotesi, unità, segni, domini e procedimenti. Riletti i testi reali C3-L01/L05/L06 per scale, trasferimento e bilancio stazionario. La primaria degli 80 futuri ID B è stata salvata separatamente prima di candidati o chiavi B; non è un’approvazione di questi lotti A.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u5-interface-temperature-01 — Metà del salto cade su ciascuna resistenza

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Con R_h=R_c=1 K/W, quanto vale T_i in °C?

Procedimento d’autore: La resistenza totale è 2 K/W e la potenza 100/2=50 W. Il tratto verso il freddo sostiene la caduta Θ=PR_c=50 K. Poiché il freddo è a 0 °C, l’interfaccia è a 50 °C. L’uguaglianza delle resistenze divide a metà il salto, non la temperatura assoluta.

Passaggi: P=\frac{\Delta T}{R_h+R_c};  P=50\,\mathrm W;  \Theta=PR_c;  \Theta=50\,\mathrm K;  T_i=50\,{}^\circ\mathrm C.

Distrattori: Cento gradi coinciderebbero con il lato caldo e non lascerebbero caduta sul tratto caldo di resistenza positiva. Zero coinciderebbe con il freddo. 323,15 è il numero del medesimo punto in kelvin, non la lettura richiesta in °C.

Hint: Ricava la potenza comune e la caduta fra interfaccia e freddo.

Fonte canonica SHA256 eae439fa3a134ea0660583c723408e8fa981e0a62dda6d2cc4b95e86c07017f6. Candidato SHA256 bba9444df7e624a3a1f22e74041b6c1c674a7630146c2ba37ceb891e280d0b07. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-02 — L’unità della lettura richiesta

La temperatura di contatto viene richiesta come lettura sulla scala Celsius. Quale unità la esprime?

Procedimento d’autore: Una temperatura puntuale letta sulla scala Celsius si esprime in gradi Celsius. Le differenze possono essere espresse in kelvin con lo stesso numero, ma il punto corrispondente in kelvin ha uno zero diverso.

Passaggi: 50\,{}^\circ\mathrm C\longleftrightarrow323{,}15\,\mathrm K;  \Delta T=50\,\mathrm K.

Distrattori: K/W è resistenza, W/K conduttanza, W potenza e J energia. Nessuna di queste quattro unità misura una temperatura. La freccia nella conversione indica lo stesso punto, non una differenza di 273,15 K nel corpo.

Hint: Distingui il punto termometrico da resistenze e intervalli.

Fonte canonica SHA256 26f07d67098470b370a1d4c5c72c74f3b10b3a0ccfb9b1f531b2213ae0283455. Candidato SHA256 1298329c830816f9f6c735ab5f27de94beb3fb936b45e904871bbb06d6f6b5b2. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-03 — Usare il tratto giusto per l’intervallo

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Quale relazione ricava Θ, da cui segue la lettura θ_i=Θ/(1 K)?

Procedimento d’autore: La differenza fra interfaccia e freddo è la caduta sul tratto R_c, cioè PR_c. Sostituendo P=ΔT/(R_h+R_c) si trova Θ=ΔT R_c/(R_h+R_c). Il rapporto di resistenze è puro e sta fra zero e uno, quindi l’interfaccia resta strettamente fra le due facce.

Passaggi: \Theta=PR_c;  P=\frac{\Delta T}{R_h+R_c};  \Theta=\frac{\Delta T R_c}{R_h+R_c};  0<\Theta<100\,\mathrm K.

Distrattori: R_h al numeratore darebbe la caduta dal caldo all’interfaccia, non Θ. L’inverso del rapporto supererebbe il salto totale. ΔT/(R_h+R_c) è una potenza e il prodotto delle resistenze non restituisce un intervallo.

Hint: Θ è misurato a partire dalla faccia fredda, non da quella calda.

Fonte canonica SHA256 91358c132e8a2d94f2a90c8000e4f5e51f8d067c454bdd9ce80b9599683b573b. Candidato SHA256 bc431b0a62ef041ded04d1f740ff16d81df3f3b9012998d4e9f682d276bd7991. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-04 — Una barriera maggiore dalla parte calda

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. A ha R_h=R_c=1 K/W. B ha R_h=3 K/W e R_c=1 K/W. Come cambia T_i?

Procedimento d’autore: In B la potenza è 100/4=25 W. Sul tratto freddo, rimasto 1 K/W, cadono 25 K: l’interfaccia scende a 25 °C. I restanti 75 K cadono sul tratto caldo più resistente. Il punto di contatto si avvicina alla temperatura del lato al quale resta meglio collegato.

Passaggi: P_B=25\,\mathrm W;  \Theta_B=P_BR_c;  \Theta_B=25\,\mathrm K;  T_{i,B}=25\,{}^\circ\mathrm C.

Distrattori: 75 °C confonde la caduta sul tratto caldo con la temperatura dal riferimento freddo. 100 o 150 °C non sono punti interni compatibili con due resistenze positive e nessuna sorgente.

Hint: Calcola prima la nuova potenza, poi usa il tratto R_c invariato.

Fonte canonica SHA256 46da38165ecddab564dde4f378c2f7ec64061cdfffc2411ca5d09c035eed31f4. Candidato SHA256 08e82fa76860cf70e49b7441e5b92062788cbab365c74640a3b3c3e859ab7258. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-05 — Il tratto caldo da una lettura interna

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. T_i=50 °C e R_c=1 K/W. Quanto vale R_h in K/W?

Procedimento d’autore: L’intervallo dal freddo è Θ=50 K. Dal tratto noto ricaviamo P=Θ/R_c=50 W. Il tratto caldo sostiene altri 50 K, quindi R_h=(100 K−50 K)/(50 W)=1 K/W. Le due cadute uguali sulla stessa potenza producono resistenze uguali.

Passaggi: \Theta=50\,\mathrm K;  P=\Theta/R_c;  P=50\,\mathrm W;  R_h=\frac{\Delta T-\Theta}{P};  R_h=1\,\mathrm{K/W}.

Distrattori: Due K/W assegnerebbero al tratto caldo tutto il salto esterno senza sottrarre la parte fredda. Zero annullerebbe la caduta sul lato caldo e porterebbe l’interfaccia a 100 °C.

Hint: Usa il tratto noto per trovare P, poi la caduta residua per trovare R_h.

Fonte canonica SHA256 4f5af20c4b3a51f92717833e356141b1ceb3339dc0dc859e3d65fb9d3afeadf7. Candidato SHA256 574c49cd83c073e00c59fb5da6bc83b94c06d81ce3b401657e5b66584ef9c9f8. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-06 — Ricostruire la resistenza verso il freddo

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. T_i=50 °C e R_h=1 K/W. Quanto vale R_c in K/W?

Procedimento d’autore: La caduta dal caldo è 100−50=50 K. Divisa per R_h dà P=50 W. Dal freddo all’interfaccia ci sono ancora 50 K, perciò R_c=Θ/P=1 K/W. Si deve usare lo stesso valore di P nei due tratti.

Passaggi: P=\frac{\Delta T-\Theta}{R_h};  P=50\,\mathrm W;  R_c=\frac{\Theta}{P};  R_c=1\,\mathrm{K/W}.

Distrattori: Sottrarre una lettura Celsius da una resistenza non ha senso dimensionale. Un valore negativo di R_c non appartiene al modello passivo e non può sostenere il flusso caldo-freddo assegnato.

Hint: Ricava la potenza dal tratto caldo, poi passa a quello freddo.

Fonte canonica SHA256 7d14a09096adacace9da8df5ab4950b2ddc825cb601e3c077bd9da4b6c5079af. Candidato SHA256 1b7dccba1de38d24e9a9283be16f7e5213679a1d5041902352b4a92a3ca417d0. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-07 — Una resistenza maggiore verso il freddo

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. A ha R_h=R_c=1 K/W. B mantiene R_h=1 K/W e ha R_c=3 K/W. Quanto vale θ_i,B/θ_i,A?

Procedimento d’autore: A ha lettura 50 °C. In B P=25 W e Θ_B=25·3=75 K, quindi lettura 75 °C. Il rapporto numerico Celsius è 75/50=3/2. Il rapporto fra le temperature assolute sarebbe 348,15/323,15 e non è quello richiesto.

Passaggi: \theta_{i,A}=50;  \theta_{i,B}=75;  \theta_{i,B}/\theta_{i,A}=\frac32.

Distrattori: Tre segue soltanto R_c, dimenticando che P diminuisce. Due terzi è il reciproco; un mezzo ha il verso contrario e uno ignora il cambio di ripartizione.

Hint: Ricostruisci la lettura dal salto prima di fare il rapporto sulla scala dichiarata.

Fonte canonica SHA256 3b10fec2537d1a4ba1420b4980d43bd088f5fd0c19c41fec741577003ed37a9e. Candidato SHA256 259414298f5b0b6404d6df55bd62d3bfd6dd76641bb00482054a63d098d85249. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-08 — Lo scarto di una temperatura proposta

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Con R_h=R_c=1 K/W si propone T_i=100 °C. Quanto vale proposta meno risultato corretto?

Procedimento d’autore: La lettura corretta è 50 °C. La proposta 100 °C la supera di 50 gradi, cioè 50 K di differenza. Il rapporto due tra le letture Celsius è un’altra quantità e non misura questo scarto.

Passaggi: T_i=50\,{}^\circ\mathrm C;  e=T_{i,\rm proposto}-T_i;  e=50\,\mathrm K.

Distrattori: −50 K scambia l’ordine, 100 K copia la proposta e zero la accetta. Due è un rapporto puro, non una differenza termica.

Hint: Per una differenza Celsius e kelvin hanno lo stesso intervallo numerico.

Fonte canonica SHA256 31a55065a15b420fefb6ae0704770af435a6c43122b575ed1ee0251a887d31d4. Candidato SHA256 654f815a98aa345ad2f88c1d34083b28ba90fb48512584f7ec8112fb990bd434. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-09 — L’inversa richiede una temperatura fra le facce

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Sono noti Θ con 0<Θ<100 K e R_c. Quale formula ricava R_h?

Procedimento d’autore: Moltiplichiamo Θ=ΔT R_c/(R_h+R_c) per il totale e raccogliamo ΘR_h=R_c(ΔT−Θ). Dividendo per Θ>0 otteniamo R_h=R_c(ΔT−Θ)/Θ. Il rapporto termico è puro e positivo soltanto per un punto fra le facce.

Passaggi: \Theta(R_h+R_c)=\Delta T R_c;  \Theta R_h=R_c(\Delta T-\Theta);  R_h=\frac{R_c(\Delta T-\Theta)}{\Theta}.

Distrattori: Il reciproco del rapporto termico scambia la ripartizione. R_cΔT/Θ è la resistenza totale, non R_h. Dividere il salto residuo per R_c dà una potenza; il segno più aggiunge invece di sottrarre la caduta fredda.

Hint: Non dimenticare il termine ΘR_c quando isoli ΘR_h.

Fonte canonica SHA256 ec5af1770215409d2751e27b3724be3272486463d87698e089d77ad6d7d43616. Candidato SHA256 4dcf11aed8c479289c5ec89bab906037b1700afb7bb3c3470b60b1cab2813501. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-10 — Un rapporto di letture con due resistenze nuove

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. B usa R_h,B=κ₁R_h,A e R_c,B=κ₂R_c,A, fattori positivi. Quanto vale θ_i,B/θ_i,A?

Procedimento d’autore: Il numeratore della legge per Θ cambia di κ₂ e il denominatore diventa κ₁R_h+κ₂R_c. Rapportando con A si ottiene κ₂(R_h+R_c)/(κ₁R_h+κ₂R_c). Qui è anche il rapporto delle letture Celsius perché la faccia fredda è a 0 °C. Un fattore comune sulle resistenze lascia immutata la temperatura di contatto.

Passaggi: \Theta_A=\frac{\Delta T R_c}{R_h+R_c};  \Theta_B=\frac{\Delta T\kappa_2R_c}{\kappa_1R_h+\kappa_2R_c};  \frac{\theta_{i,B}}{\theta_{i,A}}=\frac{\kappa_2(R_h+R_c)}{\kappa_1R_h+\kappa_2R_c}.

Distrattori: Il rapporto inverso scambia A e B. Il prodotto e la somma non restituiscono uno per un fattore comune arbitrario. Il solo quoziente κ₁/κ₂ trascura la somma delle due resistenze.

Hint: Confronta le due ripartizioni del medesimo salto totale.

Fonte canonica SHA256 2c6de497c1fd951664eab02893ef173e12d0d6f53c545ed6c1923086169dc1e4. Candidato SHA256 c4d292ca164c6cf06e344b1013ec6bf9b674e08dc07cf1276fdc4e430486128f. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-11 — Due cambiamenti che non si cancellano

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. A ha R_h=R_c=1 K/W. B ha R_h=2 K/W,R_c=3 K/W. Quanto vale θ_i,B/θ_i,A?

Procedimento d’autore: A ha lettura 50 °C. B ha P=100/5=20 W e Θ_B=20·3=60 K, quindi lettura 60 °C. Il rapporto delle letture è 60/50=6/5. Il totale aumenta, ma aumenta anche la frazione del salto sul tratto freddo.

Passaggi: P_B=20\,\mathrm W;  \Theta_B=60\,\mathrm K;  \theta_{i,B}/\theta_{i,A}=\frac65.

Distrattori: Tre mezzi usa il rapporto R_c/R_h della sola B senza ricostruire il punto termico. Cinque sesti è il reciproco; due e uno non riflettono la nuova ripartizione 2:3.

Hint: Trova prima il totale delle resistenze B e la sua potenza.

Fonte canonica SHA256 5a607d8c5742e8a56ccdec8f674aee8dca53ef640d6f37ad6b2cce7707f67972. Candidato SHA256 e61f2f95c067ce542cf9c9f2e64369d65ecf5d11d35d3890cfd528bcdeedcb1d. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-12 — Media di due punti sulla stessa scala

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. A ha R_h=R_c=1 K/W; B ha R_h=2 K/W,R_c=3 K/W. Qual è la media aritmetica delle letture T_i con uguale peso?

Procedimento d’autore: Le letture sono 50 e 60 °C: media 55 °C. Le resistenze medie R_h=3/2 K/W e R_c=2 K/W darebbero invece Θ=100·2/(7/2)=400/7 K e lettura 400/7 °C. Mediare due punti Celsius è lecito; convertire il punto medio in kelvin conserva la media, ma non rende uguali queste due operazioni sui dati.

Passaggi: \overline\theta_i=\frac{50+60}{2};  \overline\theta_i=55;  \theta_i(\overline R_h,\overline R_c)=\frac{400}{7}.

Distrattori: 400/7 °C usa gli ingressi medi. 110 °C non dimezza, 5 °C è metà della differenza e 50 °C ignora B. Il risultato statistico non è una nuova temperatura d’equilibrio ottenuta mettendo insieme le pareti.

Hint: Calcola i due punti e fai solo dopo la media delle letture.

Fonte canonica SHA256 2ccdc8574eb300f5bc7e7347fc39edb7b5a760cf4b084dbe5c180cdb8f29c89e. Candidato SHA256 f11acbd4d9e42a2305157bc5f10e0cb727cf3d5a2e6b7e852ce2be7750653221. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-13 — La lettura bersaglio fissa una resistenza

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. A ha R_h=R_c=1 K/W. B ha R_h=2 K/W e deve avere θ_i,B=(6/5)θ_i,A. Quanto vale R_c,B/R_c,A?

Procedimento d’autore: Il bersaglio è 60 °C, quindi Θ_B=60 K. Sul tratto caldo cadono 40 K: con R_h=2 K/W la potenza è 20 W. Per sostenere i 60 K del tratto freddo occorre R_c,B=60/20=3 K/W. Il rapporto con 1 K/W iniziale è tre.

Passaggi: \Theta_B=60\,\mathrm K;  P_B=\frac{40\,\mathrm K}{2\,\mathrm{K/W}};  P_B=20\,\mathrm W;  R_{c,B}=3\,\mathrm{K/W};  R_{c,B}/R_{c,A}=3.

Distrattori: Tre mezzi è il rapporto R_c,B/R_h,B e non quello richiesto rispetto ad A. Un terzo inverte la risposta, due segue soltanto R_h e sei quinti copia il bersaglio sulla lettura.

Hint: Usa la caduta calda e la resistenza già nota per trovare P_B.

Fonte canonica SHA256 634fba50b6d1abd1084db8dab7026b1453cbf491dc10ffcb854022d4de8999a4. Candidato SHA256 bccdf1b7f5cee7c00d80d3377db890736767354c9129af5d16dac53a2213e812. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-14 — Un display tarato sulle letture Celsius

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Il display continuo adimensionale è S=qθ_i, q>0. A con R_h=R_c=1 K/W dà S=150. B dà S=180 e ha R_c=3 K/W. Quanto vale R_h,B in K/W?

Procedimento d’autore: A indica 50 °C, dunque q=150/50=3 per unità della lettura Celsius. B indica 180/3=60 °C e Θ_B=60 K. Dal tratto freddo si ottiene P_B=60/3=20 W; i restanti 40 K sul lato caldo richiedono R_h,B=2 K/W. Il display non misura un rapporto termodinamico assoluto.

Passaggi: q=3;  \theta_{i,B}=60;  P_B=20\,\mathrm W;  R_{h,B}=2\,\mathrm{K/W}.

Distrattori: Usare 180 come lettura Celsius porrebbe l’interfaccia sopra la faccia calda e darebbe una resistenza negativa nell’inversa. Prima si deve rimuovere il guadagno, poi usare il punto nel dominio 0<θ_i<100.

Hint: Decodifica la lettura prima di ripartire le cadute.

Fonte canonica SHA256 bed550880aa0da2ddf3fee16ddf85da6c8911a61242295982d45c4a492cdd1e7. Candidato SHA256 62c5a3b158f2e252ed1ff20c9268609ae0234b4b7e0f6e2ded7004190ead7ba4. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-15 — Offset e resistenza del lato caldo

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Il display è S=qθ_i+b, continuo e adimensionale, q>0. A: R_h=R_c=1 K/W,S=101. B: R_h=2 K/W,R_c=3 K/W,S=121. C: R_c=1 K/W,S=51. Quanto vale R_h,C?

Procedimento d’autore: I riferimenti indicano 50 e 60 °C. Il guadagno è (121−101)/(60−50)=2 e l’offset è uno. C indica (51−1)/2=25 °C: sul tratto freddo da 1 K/W passano 25 W, mentre il tratto caldo sostiene 75 K. La sua resistenza è 75/25=3 K/W.

Passaggi: q=2;  b=1;  \theta_{i,C}=25;  P_C=25\,\mathrm W;  R_{h,C}=3\,\mathrm{K/W}.

Distrattori: 149/51 K/W omette b, usa θ_i=51/2 e produce lettura S=52. Un K/W torna ad A; 2 K/W con R_c=1 darebbero θ_i=100/3 e non 25. Venticinque copia il numero della lettura.

Hint: Tolto l’offset, usa sia la caduta fredda sia quella calda del punto trovato.

Fonte canonica SHA256 c4bd0815215d2718d7caa17e44073a26607125604f5a1ca711ba93f6828d5cc0. Candidato SHA256 f14fd74a03cf81c478e1e5cee27d831cf73d501d1415f1ab1905163221533bab. Revisione indipendente e human NOT_RUN.

## AR-u5-interface-temperature-16 — Resistenze uguali senza una scala assegnata

Due strati conduttivi in serie collegano una faccia a T_h=100 °C e una a T_c=0 °C, quindi ΔT=100 K. Le resistenze dal caldo all’interfaccia e dall’interfaccia al freddo sono R_h,R_c>0, in K/W. Contatto perfetto, lati isolati, nessuna generazione interna e regime stazionario: la stessa potenza P attraversa i due strati. T_i è la temperatura comune di contatto; poniamo Θ=T_i−T_c in K e θ_i il numero della sua lettura Celsius. Qui Θ=(θ_i K), perché T_c=0 °C. I rapporti fra θ_i sono rapporti di letture Celsius, dipendenti dallo zero scelto, non rapporti di temperature assolute. Fra preparazioni si impone R_h=R_c. Si misura T_i=50 °C. Quante coppie positive di resistenze soddisfano questi dati?

Procedimento d’autore: Sostituendo resistenze uguali nella ripartizione, Θ=ΔT/2=50 K per qualunque valore comune positivo. La misura ripete la conseguenza del vincolo e non fissa la scala. Per esempio 1 e 1 K/W danno P=50 W, mentre 2 e 2 K/W danno P=25 W: la temperatura d’interfaccia resta 50 °C.

Passaggi: R_h=R_c;  \Theta=\frac{\Delta T R_c}{2R_c};  \Theta=50\,\mathrm K.

Distrattori: La coppia 1 e 1 è un esempio e non l’unica soluzione. Cinquanta copia una lettura come resistenza; zero viola il dominio e annulla il denominatore. Senza una misura di P o una resistenza nota non si ricava una scala assoluta.

Hint: Sostituisci il vincolo e osserva se il valore comune si cancella.

Fonte canonica SHA256 0dc27c696e2c502a1204b019a7a2f045e2a427edfc51949d7dcaef3d72c4d2ef. Candidato SHA256 7275e7005135e732ca8f9fe55ca2f3515b760335ccbdb46932b5b2ba265e5598. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 ffdb5512d03ed91cbe7b8fb77380581c2814a776ec3b74805116cd3658a98795. Package file SHA256 49f9862ab7d90326915fefc6146646854f59062306fa8831e6db77ebe0c2e470. Binding file SHA256 f6a5ff3939dc8d1782a11e42c605492f83dda2576cffc496c287d81350aee1b9. Prova strutturale SHA256 5bdbabac3d32279d287ba93f96d1e030fc77e33377b898ae9d9db96da963ecc6. Asset-only manifest SHA256 613a61a6c8586721bb7f0c3751850099457576aa2a6c6473d096b80b9afcefd5.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

Il precedente import avviato dopo un preflight risorse fallito è conservato byte per byte in interface-temperature-181-prior-resource-preflight e resta storico, non conforme a quella guardia. Il controllo è stato realmente ripetuto sotto flock condiviso con 5.953.961.984 byte liberi prima del child e uscita 0. Le due assembly e l’import sono nuovamente riusciti; il record di risorse è separato dalla prova strutturale e non è un marker UI.
