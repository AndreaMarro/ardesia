# interface-temperature-181 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 178–182 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u5-transfer-178-182-primary-source-only.md, SHA256 c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG ROOT confrontati con i byte finali dell’autore alla SHA 9df91921f903cdd4f9d313944277a6f75ca0133a. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u5-interface-temperature-01

Derivazione e calcolo manuale: P=100/(1+1)=50 W; Θ=P R_c=50 K e T_i=50 °C, ossia 323, 15 K.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 100 o 0 coincidono con un estremo e annullano una caduta positiva; 323, 15 è numero kelvin del medesimo punto.

Didattica: Legge motivata dalle ipotesi prima del risultato, con unità conservate.

Figura: Rete superiore schematica, contatto senza resistenza aggiuntiva. Profilo sull’ascissa resistenza cumulativa, non spessore: punti(0, 100 °C), (1 K/W, 50 °C), (2 K/W, 0 °C), segmenti da x100, 300, 500 e y575, 675, 775. Scale indipendenti 200 unità/(K/W) e 2 unità/grado. Barre Celsius 50/60/55 lunghe 250/300/275 da medesimo zero convenzionale 0 °C, non assoluto. XML completo e rendering asset-only letti.

Modalità EXACT_ORACLE. Risultato indipendente: `50`. Firma: `c6f76548fe2406998213b0889fad4db5a3dc6114294cd6f480e4c94d9796c21a`.

## AR-u5-interface-temperature-02

Derivazione e calcolo manuale: Si richiede un punto Celsius, unità °C. Differenze in K hanno lo stesso incremento numerico, non lo stesso zero.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: K/W resistenza, W/K conduttanza, W potenza, J energia non sono punti termometrici.

Didattica: Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `°C`. Firma: `c638865d857dc4f10bc807b5a65c0f9afb8c449464813189756aa52eb53d6c51`.

## AR-u5-interface-temperature-03

Derivazione e calcolo manuale: Θ=P R_c e P=ΔT/(R_h+R_c), quindi Θ=ΔT R_c/(R_h+R_c), strettamente tra 0 e 100 K.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: R_h al numeratore è caduta calda; rapporto inverso supera salto; ΔT/R è watt e prodotto resistenze altera dimensione.

Didattica: Legge o meccanismo fisico ricostruiti separatamente dalla chiave.

Figura: Rete superiore schematica, contatto senza resistenza aggiuntiva. Profilo sull’ascissa resistenza cumulativa, non spessore: punti(0, 100 °C), (1 K/W, 50 °C), (2 K/W, 0 °C), segmenti da x100, 300, 500 e y575, 675, 775. Scale indipendenti 200 unità/(K/W) e 2 unità/grado. Barre Celsius 50/60/55 lunghe 250/300/275 da medesimo zero convenzionale 0 °C, non assoluto. XML completo e rendering asset-only letti.

Modalità AI_CONCEPTUAL. Risultato indipendente: `Θ = ΔT R_c / (R_h + R_c)`. Firma: `dde48274b27bbbb4511238c648080ee07aacb40560bb0f3d8b7ebf269d92048d`.

## AR-u5-interface-temperature-04

Derivazione e calcolo manuale: B ha totale 4 K/W, P=25 W; con R_c=1 la caduta fredda è25 K e T_i25 °C.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 75 copia caduta calda; 100 e 150 non stanno fra le facce; 50 ignora cambio.

Didattica: Confronto controllato fra prove mantenendo fissi i parametri dichiarati.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 50 a 25 °C`. Firma: `a041144253ba6758dceceaa17c3e041b3a52131eb9e18cf45359ec7cc38cd7d7`.

## AR-u5-interface-temperature-05

Derivazione e calcolo manuale: A Θ=50 K e R_c=1 danno P=50 W; residuo caldo 50 K implica R_h=1 K/W.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 2 attribuisce tutto salto al tratto caldo; zero rende interfaccia uguale al caldo.

Didattica: Inversa derivata prima della sostituzione, con dominio strettamente positivo.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `bf706e79b97b8ffa2bc241104cb376212d906e1c942981742364e7381b7b3fab`.

## AR-u5-interface-temperature-06

Derivazione e calcolo manuale: Dal tratto caldo: P=(100−50)/1=50 W. R_c=50/50=1 K/W.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: Sottrarre Celsius da resistenza è eterogeneo; resistenza negativa è fuori dominio passivo.

Didattica: Seconda inversa e verifica dimensionale del residuo o del denominatore.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `ac5edc1c38788e03d0c23e2d0fd28a6bc7d3c6393838235659aa48fe8dbc6e45`.

## AR-u5-interface-temperature-07

Derivazione e calcolo manuale: B con R_c=3 e R_h=1 ha P=25 W, lettura 75 °C; rapporto Celsius 75/50=3/2, non rapporto 348, 15/323, 15.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 3 segue solo R_c senza P; 2/3 è reciproco; 1/2 inverte verso; 1 ignora ripartizione.

Didattica: Le due prove ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3/2`. Firma: `3778ac9bc15333b6e416a7d288877df3b96aa3e4e17b1aeddbecade571b5d8e0`.

## AR-u5-interface-temperature-08

Derivazione e calcolo manuale: 100−50=+50 K di scarto tra punti Celsius; il rapporto 2 non è una differenza.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: −50 inverte ordine; 100 copia proposta; zero accetta; 2 è rapporto puro.

Didattica: Ordine dello scarto mantenuto e distinto da un rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `50`. Firma: `c15da13cfb690e79f70236cbe1193e74571d39349584336e487bf43f82ff1111`.

## AR-u5-interface-temperature-09

Derivazione e calcolo manuale: Θ(R_h+R_c)=ΔT R_c; R_h=R_c(ΔT−Θ)/Θ, positivo solo per 0<Θ<ΔT.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: Reciproco scambia ripartizione; R_cΔT/Θ è totale, non R_h; dividere per R_c dà potenza; più è bilancio errato.

Didattica: Inversa simbolica con geometria e divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `R_h = R_c (ΔT − Θ) / Θ`. Firma: `91f271d676c55135030e016531699738e6bfe088362d73f3eda32f942d2762d6`.

## AR-u5-interface-temperature-10

Derivazione e calcolo manuale: Rapporto θ_B/θ_A=b(R_h+R_c)/(a R_h+b R_c); fattori comuni si cancellano lasciando 1.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: Reciproco scambia prove; prodotto e somma non danno 1 per fattore comune arbitrario; quoziente solo non pesa resistenze.

Didattica: Scalature sostituite nel modello completo, senza cancellare pesi diversi.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₂ (R_h + R_c) / (κ₁ R_h + κ₂ R_c)`. Firma: `e7b00c62db9dc26cee9209e8cd8d1140f832ed35f7f12113ac768b2b99d14d8d`.

## AR-u5-interface-temperature-11

Derivazione e calcolo manuale: B con R_h=2, R_c=3 ha P=20 W e Θ=60 K, lettura 60 °C; rapporto 60/50=6/5.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 3/2 è R_c B/R_h B, non rapporto delle letture; 5/6 inverte; 2 e 1 non ricostruiscono ripartizione.

Didattica: Entrambi gli ingressi variati inclusi nel medesimo bilancio.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6/5`. Firma: `17e3ac1e15d8f333089b3241ba874bca93b52b1fc63d360798f4c86e7ca02f25`.

## AR-u5-interface-temperature-12

Derivazione e calcolo manuale: Media(50+60)/2=55 °C. Alle resistenze medie 3/2 e 2 si trova 400/7 °C, diverso.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 400/7 usa ingressi medi; 110 non dimezza; 5 dimezza differenza; 50 ignora B. Media punti non è miscela fisica.

Didattica: Media delle uscite distinta dalla risposta agli ingressi medi.

Figura: Rete superiore schematica, contatto senza resistenza aggiuntiva. Profilo sull’ascissa resistenza cumulativa, non spessore: punti(0, 100 °C), (1 K/W, 50 °C), (2 K/W, 0 °C), segmenti da x100, 300, 500 e y575, 675, 775. Scale indipendenti 200 unità/(K/W) e 2 unità/grado. Barre Celsius 50/60/55 lunghe 250/300/275 da medesimo zero convenzionale 0 °C, non assoluto. XML completo e rendering asset-only letti.

Modalità EXACT_ORACLE. Risultato indipendente: `55`. Firma: `8d118324b54c78ff36e5389dd25592d1068d3b268a956c29315783b1bcbcb1df`.

## AR-u5-interface-temperature-13

Derivazione e calcolo manuale: Target 60 °C; R_h B2 sostiene 40 K, P=20 W; R_c B60/20=3 K/W e rapporto 3.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 3/2 è rapporto fra resistenze B e non rispetto ad A; 1/3 inverte; 2 segue R_h; 6/5 copia bersaglio lettura.

Didattica: Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `0f5f1e11cc55aac718223ae6bcb8f64e112277b4eabb2f80c928790ee1246c1f`.

## AR-u5-interface-temperature-14

Derivazione e calcolo manuale: q=150/50=3 sulla lettura numerica Celsius; S180→60 °C, P=60/3=20 W; R_h B40/20=2 K/W.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 180 come Celsius supera faccia calda e forza resistenza negativa; serve prima decodifica del display.

Didattica: Display continuo tarato prima di invertire la relazione fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `bff7373cdb98f6ec8248b9ab0a40e801ed7aaccc488a080ba089aa7788598703`.

## AR-u5-interface-temperature-15

Derivazione e calcolo manuale: q=(121−101)/(60−50)=2, b=1; S51→25 °C; P=25 W, residuo caldo 75 K e R_h=3 K/W.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: 149/51 ignora b e predice S52; 1 torna ad A; 2 dà 100/3 °C; 25 copia lettura come resistenza.

Didattica: Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `21a4d0f897682474368c6a60cb94be045b48a159201e3a47d1b5389559c084a1`.

## AR-u5-interface-temperature-16

Derivazione e calcolo manuale: R_h=R_c=r>0 dà Θ=100 r/(2 r)=50 K per ogni r. Esempi r1 e 2 danno P=50 e 25 W, stessa lettura: infinite coppie positive.

Ipotesi e dominio: Due resistenze passive positive in serie fra facce mantenute a 100 e 0 °C, salto 100 K. Contatto perfetto, lati isolati, assenza di sorgenti, regime stazionario e potenza comune. Θ è intervallo interfaccia-freddo; θ_i è il numero della lettura Celsius e qui Θ=θ_i K perché T_c=0 °C. Rapporti di letture esplicitamente riferiti a Celsius, non assoluti. Display continuo e vincoli fra preparazioni.

Distrattori: r1 e r50 sono esempi, non unicità; zero annulla denominatore e viola dominio. P non è noto e la scala non è identificata.

Didattica: Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite: ogni R_h=R_c>0`. Firma: `5e2ec5c06b0f379d9e924ff7df4ebc8f6037feae2ccd4db4c50f32968ee0ee28`.
