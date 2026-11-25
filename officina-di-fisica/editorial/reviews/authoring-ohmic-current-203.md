# Authoring DRAFT — ohmic-current-203

Letti individualmente tutti gli 80 prompt A200–204 della fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-02 SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. I compiti e gli ID originali sono conservati e si rendono espliciti segni, domini, conversioni e svolgimenti. Riletti i testi reali C4-L02/L05/L06/L09 per campo vettoriale, corrente, leggi di Ohm, resistività e campo magnetico del filo. Prima dei candidati A, il revisore distinto B ha confermato primaria prompt-only 80 SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6; quella primaria non è stata aperta dall’autore. La primaria A dei futuri 80 B205–209 è congelata separatamente SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, senza esposizione U6 a chiavi altrui.

Autore soltanto: DRAFT; revisione scientifica indipendente NOT_RUN, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica.

Due assemblaggi in processi separati dell’assembler unico producono gli stessi byte package e binding. Importatore canonico ROOT su SQLite temporaneo: 16 nuovi, poi 0 nuovi e 16 invariati; tutti i 991 pubblicati e le versioni storiche rimangono invariati. Questo è collaudo tecnico strutturale e non giudizio scientifico.

UI prodotto NOT_RUN: per mandato dell’integratore non si avvia il browser dell’app durante il collaudo globale congelato. Non è stato creato o riusato alcun marker UI. Il diagramma SVG è stato letto come XML e sono state controllate le proporzioni intrinseche dei dati. La resa nativa Quick Look a piena altezza è stata realmente prodotta e letta, con log e PNG conservati: è asset-only, non un replay dell’app o una prova di layout a 320 px. Nessun CSS, runtime, registro, checkpoint o file candidato ROOT modificato.

## AR-u6-ohmic-current-01 — La tensione divisa per la resistenza

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Con V=12 V e R=3 Ω, quanto vale I in A?

Procedimento d’autore: La relazione del resistore è V=RI. Dividiamo per R>0: I=V/R=12/3=4 A. Il generatore mantiene la tensione assegnata e fornisce la corrente richiesta dal carico. La temperatura fissata permette di usare lo stesso R nella misura.

Passaggi: V=RI;  I=\frac VR;  I=4\,\mathrm A.

Distrattori: Trentasei moltiplica V e R; un quarto inverte V/R. Dodici copia la tensione e tre copia la resistenza. Un valore negativo cambierebbe la convenzione dichiarata per corrente e caduta.

Hint: Isola I nella relazione V=RI e controlla V/Ω=A.

Fonte canonica SHA256 d0edb65da94a00c1fdd7c8ca45e7c9b594e1f5b0a178a569a49ea6dd50641b2a. Candidato SHA256 db8c8c90e6005c9e657d2bcb67504ad5ad4b9ba877902ffc0ad82dc19291826b. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-02 — L’unità della corrente

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Quale unità è dimensionalmente compatibile con I?

Procedimento d’autore: Un ohm è un volt per ampere. Il rapporto V/Ω restituisce quindi A. La corrente non è né la tensione del generatore né la carica totale trasferita durante un intervallo; per quest’ultima servirebbe anche il tempo.

Passaggi: 1\,\Omega=1\,\mathrm{V/A};  [I]=\frac{\mathrm V}{\Omega};  [I]=\mathrm A.

Distrattori: V misura potenziale, Ω resistenza, C carica e W potenza. Queste grandezze possono essere collegate alla corrente da altre leggi, ma non ne sono unità.

Hint: Sostituisci la definizione dell’ohm nel rapporto V/R.

Fonte canonica SHA256 cfdc9c6eec5f42e92a84527886886adef6ca33648bf3a2e29e712fa80d76bfbd. Candidato SHA256 ed0959666b389b8fc096e4ebefaa8c3e855a9faca365c7a47b844b9d2779e363. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-03 — La forma corretta di Ohm

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Quale relazione dà I?

Procedimento d’autore: Nel modello ohmico V è proporzionale a I con coefficiente R. Per lasciare I da sola si divide per R. La resistenza non è un fattore al numeratore: a tensione assegnata un carico maggiore lascia passare meno corrente.

Passaggi: V=RI;  \frac VR=I;  I=\frac VR.

Distrattori: R/V ha dimensione A⁻¹; VR non è corrente. R² introduce una resistenza in più al denominatore. La radice di V/R avrebbe dimensione A alla potenza un mezzo e non deriva dalla legge lineare.

Hint: Non confondere la pendenza V/I con l’inversa I/V.

Fonte canonica SHA256 b7fd51674ea90551f03af32a62cbfb45365f22a0e642f2141e9c405ec209ee90. Candidato SHA256 cc7157dd330143125629c2af863b3edfec19fb56c04d29523e7fe5db95b1c5cb. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-04 — Una tensione più piccola

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. V passa da 12 a 1 V, mentre R resta 3 Ω. Come cambia I?

Procedimento d’autore: La resistenza non cambia e I è direttamente proporzionale a V. Nel primo caso 12/3=4 A; nel secondo 1/3 A. Il fattore fra le tensioni è 1/12 e lo stesso fattore vale per le correnti, a temperatura fissata.

Passaggi: I_A=4\,\mathrm A;  I_B=\frac13\,\mathrm A;  \frac{I_B}{I_A}=\frac1{12}.

Distrattori: Quarantotto rende inversa la dipendenza da V. Quattro ignora la nuova tensione; uno copia V_B senza dividerla per R e tre copia la resistenza.

Hint: Mantieni il denominatore R e cambia soltanto la caduta.

Fonte canonica SHA256 111f8bf455d393afcd8191173b77d37aa977c0edb69cde1f749413203be94257. Candidato SHA256 42d1d3a5d5e5f8a4e492258a66d5c07a5a2a3e4408e36c20212f9e64069d5225. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-05 — Il generatore necessario

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Si vuole I=4 A con R=3 Ω. Quanto vale V in volt?

Procedimento d’autore: La legge V=RI è già isolata per la tensione. Moltiplichiamo 3 Ω per 4 A e otteniamo 12 V. La convenzione passiva dà una caduta positiva nel verso in cui entra la corrente nel resistore.

Passaggi: V=RI;  V=3\cdot4\,\mathrm V;  V=12\,\mathrm V.

Distrattori: 3/4 divide invece di moltiplicare. Quattro copia la corrente, tre la resistenza. Una caduta negativa non corrisponde al resistore passivo con I positiva nella convenzione assegnata.

Hint: Usa Ω·A=V e non il rapporto fra R e I.

Fonte canonica SHA256 55429997b7a7648fa3f4e6dc602414b0d521cc98353d924d1a1f11023d2ac019. Candidato SHA256 2910ceec5705df28f4f0bede03b76afb6ed55aaeb57885fb9daadb1db41895e4. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-06 — La resistenza dal rapporto V/I

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Si misura I=4 A con V=12 V. Quanto vale R in Ω?

Procedimento d’autore: Dividendo V=RI per I>0 troviamo R=V/I. Il rapporto 12 V/(4 A)=3 Ω. Si tratta della resistenza del componente nelle condizioni della prova, non di una resistività del materiale.

Passaggi: R=\frac VI;  R=\frac{12}4\,\Omega;  R=3\,\Omega.

Distrattori: Un terzo ha unità di conduttanza se ricavato come I/V. Quarantotto moltiplica V e I e darebbe una potenza. Non si assegna a R l’unità Ω·m, propria della resistività.

Hint: Il rapporto della tensione sulla corrente dà Ω, non Ω⁻¹.

Fonte canonica SHA256 cada116b225776c06761d29b7dfa2e17aabb2fd5bad60e1af2c9368a313b68a5. Candidato SHA256 f42d1020f7d9868d5ae1106bb2fd5b0a530938ac685926da16b4929fbb55ca4e. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-07 — Meno resistenza, più corrente

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. A ha V=12 V e R_A=3 Ω. B mantiene V e usa R_B=1 Ω. Quanto vale I_B/I_A?

Procedimento d’autore: A ha 4 A; B ha 12 A. A tensione fissa il rapporto è R_A/R_B=3. È un cambiamento del carico fra preparazioni: non si conserva anche la corrente quando un generatore ideale conserva la tensione.

Passaggi: I_A=4\,\mathrm A;  I_B=12\,\mathrm A;  \frac{I_B}{I_A}=3.

Distrattori: Un terzo rende diretta la dipendenza da R. Uno imporrebbe contemporaneamente V e I nonostante R diversa. Nove introduce un quadrato e il segno negativo non rappresenta i due moduli positivi.

Hint: Con V invariata confronta le resistenze nell’ordine inverso.

Fonte canonica SHA256 6beeccc7e5e3eff6774086fd5aba9316faca5ee14c7ad36e08aa1420b0ea2aca. Candidato SHA256 5cf028da9446897ea46c90fe44d3833adfb3fb85734a9429147584beb97f511f. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-08 — Errore in ampere

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Con V=12 V e R=3 Ω si propone I=8 A. Quanto vale proposta meno corretto?

Procedimento d’autore: Il corretto è 12/3=4 A. La proposta lo supera di 8−4=4 A, positivo. Il rapporto proposta/corretto sarebbe due: è puro e non lo scarto richiesto.

Passaggi: I=4\,\mathrm A;  e=(8-4)\,\mathrm A;  e=4\,\mathrm A.

Distrattori: −4 cambia l’ordine. Otto copia la proposta e zero la accetta. Due è un rapporto senza unità, diverso dalla differenza di correnti.

Hint: Trova I dal resistore prima di confrontarla con il valore proposto.

Fonte canonica SHA256 54afd688cc80a982caaf53ebaae9d33beee67c11c3dd084e8e8c68c33bc6bfb5. Candidato SHA256 b6d040df7d253cb8220a123ca9267105723c71e698769f179e21dcb98f4fb6bf. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-09 — Isolare la caduta

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Sono noti I e R. Quale formula ricava V?

Procedimento d’autore: Moltiplicare I=V/R per R>0 restituisce V=IR. La dimensione è A·Ω=V. Il risultato è la caduta di tensione ai capi del resistore nella convenzione passiva, non l’energia dissipata.

Passaggi: I=\frac VR;  IR=V;  V=IR.

Distrattori: I/R e R/I non hanno dimensione V. IR² aggiunge una resistenza; I²R è invece la potenza Joule in watt. Il fatto che quest’ultima sia una legge corretta non la rende la risposta alla domanda sulla tensione.

Hint: Controlla quale grandezza è incognita prima di usare una relazione del circuito.

Fonte canonica SHA256 342689c07ca8f179389eb44b9a8f74d891d3823125a02516279b487179101ff2. Candidato SHA256 0cf5f422794a0046b01dc7f114a9349ea4106bcb84d1196d1b45741e51e9eafb. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-10 — Scalare tensione e resistenza

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. B ha V_B=κ₁V_A e R_B=κ₂R_A, con fattori positivi. Quanto vale I_B/I_A?

Procedimento d’autore: Il nuovo numeratore porta κ₁ e il nuovo denominatore κ₂. Dividendo I_B per I_A tutti i valori iniziali si cancellano e rimane κ₁/κ₂. I due fattori uguali lasciano I invariata.

Passaggi: I_B=\frac{\kappa_1V_A}{\kappa_2R_A};  \frac{I_B}{I_A}=\frac{\kappa_1}{\kappa_2}.

Distrattori: Il prodotto rende diretta la dipendenza dalla resistenza. Il reciproco inverte B/A e il quadrato del denominatore non compare nella legge. La somma vale due per configurazioni identiche, non uno.

Hint: Inserisci i fattori nel quoziente originale prima di semplificare.

Fonte canonica SHA256 a170114061eaf9bc951b3271b53ccd72df8d671e4b9336e987228a5147e2d57c. Candidato SHA256 1b7f0d2c16bcff4b14a99cf3daf1305b3dd45444436966cc888cbab544a4bc7f. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-11 — Due carichi, due tensioni

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. A usa V=12 V, R=3 Ω. B usa V=15 V, R=5 Ω. Quanto vale I_B/I_A?

Procedimento d’autore: A richiede 4 A e B richiede 15/5=3 A. La tensione maggiore non implica da sola corrente maggiore, perché cresce anche la resistenza. Il rapporto corretto è 3/4.

Passaggi: I_A=4\,\mathrm A;  I_B=3\,\mathrm A;  \frac{I_B}{I_A}=\frac34.

Distrattori: 4/3 inverte il confronto. 5/4 segue solo le tensioni; 3/5 segue solo le resistenze nel rapporto inverso. Uno presume una compensazione esatta dei due cambiamenti.

Hint: Calcola ciascun rapporto V/R con i dati della stessa prova.

Fonte canonica SHA256 f2b03a9fdd03ec7b82f6a516309614ba6d7aa70363fb3d993fa62f54eccaf96e. Candidato SHA256 72ec986ff306a7d7c01c84afd3a828c8723ff25346241548de9eb35229a40771. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-12 — La media di due correnti

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. A usa V=12 V, R=3 Ω; B usa V=15 V, R=5 Ω. Qual è la media aritmetica delle due I con uguale peso?

Procedimento d’autore: I valori sono 4 e 3 A. La loro media è 7/2 A. Ai dati medi V=27/2 V e R=4 Ω si avrebbe I=27/8 A, mentre 7/2=28/8: differiscono di 1/8 A. Il quoziente non conserva in generale la media degli ingressi.

Passaggi: \overline I=\frac{4+3}{2}\,\mathrm A;  \overline I=\frac72\,\mathrm A;  I_{\rm dati\ medi}=\frac{27}8\,\mathrm A.

Distrattori: 27/8 usa gli ingressi medi. Sette non dimezza; un mezzo è metà differenza e tre copia B. Non si collegano i due resistori per ottenere una nuova corrente: si mediano due misure separate.

Hint: Media le due uscite solo dopo aver risolto le due configurazioni.

Fonte canonica SHA256 e085461ca6ed4ac687b738a0840fe305dcc5c2c470f60600954045bab63adde8. Candidato SHA256 b3621c397a7a294061802a7766e466af0cd166076130f63e5f6a409e60a983d7. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-13 — La resistenza per il bersaglio

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. A ha V=12 V, R_A=3 Ω. B usa V=15 V e deve dare I_B=(3/4)I_A. Quanto vale R_B/R_A?

Procedimento d’autore: Il bersaglio è I_B=3 A. Con V_B=15 V serve R_B=15/3=5 Ω. Il rapporto con la resistenza iniziale è 5/3. Non si copia il rapporto delle tensioni perché è imposto anche un nuovo valore di corrente.

Passaggi: I_B=3\,\mathrm A;  R_B=5\,\Omega;  \frac{R_B}{R_A}=\frac53.

Distrattori: 3/5 inverte B/A. 5/4 confronta solo le tensioni e 3/4 copia il bersaglio delle correnti. Uno lascerebbe R=3 Ω e produrrebbe 5 A, non 3 A.

Hint: Trova la corrente bersaglio e poi isola R_B dalla sua legge di Ohm.

Fonte canonica SHA256 d723c0d0d94f1b04aadbe0960e9280c8cc56e28cd65e8539bc49436164406944. Candidato SHA256 bd6dcc7d1269df08a3685becc4ec8c195e2f181457ee35ad3560a0be4e6623b3. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-14 — Tarare e risalire alla tensione

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Il display continuo adimensionale D=aI ha a>0 e nessun offset. A con V=12 V, R=3 Ω dà D=12. C dà D=9 e ha R_C=5 Ω. Quanto vale V_C in volt?

Procedimento d’autore: Il riferimento ha I_A=4 A e guadagno a=3 A⁻¹. La lettura nove restituisce I_C=3 A. Per il nuovo resistore V_C=R_CI_C=5·3=15 V. La tensione si ricava solo dopo la corrente fisica.

Passaggi: a=3\,\mathrm{A^{-1}};  I_C=3\,\mathrm A;  V_C=15\,\mathrm V.

Distrattori: Quarantacinque V usa D=9 come ampere. Nove V copia il display, cinque V la resistenza e tre V il numero della corrente. La taratura non è una resistenza elettrica.

Hint: Decodifica D, poi moltiplica la corrente per il nuovo R.

Fonte canonica SHA256 96784c8c4bf293c7202d765577acbf29ec212e37da087b90a182f41f515534d3. Candidato SHA256 a808c8d088f1ac315413c4b8bd90ee4df7d23a4b574c08efcc339a0efc6e8e22. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-15 — Un offset prima della tensione

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. D=aI+b è continuo e adimensionale, a>0. A: V=12 V, R=3 Ω, D=9. B: V=15 V, R=5 Ω, D=7. C: R=4 Ω, D=4. Quanto vale V_C?

Procedimento d’autore: A e B danno correnti 4 e 3 A. Il guadagno è (9−7)/(4−3)=2 A⁻¹ e l’offset b=1. C ha I_C=(4−1)/2=3/2 A. Il prodotto con 4 Ω è 6 V.

Passaggi: a=2\,\mathrm{A^{-1}};  b=1;  I_C=\frac32\,\mathrm A;  V_C=6\,\mathrm V.

Distrattori: Otto V omette b e predice D=5. 3/2 V copia il numero della corrente; quattro V copia il display e darebbe D=3. Dodici V sottrae b senza dividere per a e predice D=7.

Hint: Sottrai b e dividi per a prima di usare V=RI.

Fonte canonica SHA256 c41355d9bd501ca92a659589b7a38b4a22b41a4822c4673cde3da833aefb9c59. Candidato SHA256 b8dcb652e90671cc7871c05a0f9741a903da0b81d0d704880f5500128c5cbb6b. Revisione indipendente e human NOT_RUN.

## AR-u6-ohmic-current-16 — Il rapporto V/R lascia una scala

Un resistore ohmico ideale ha resistenza R>0 in Ω e temperatura mantenuta fissa. Un generatore ideale impone ai suoi capi una caduta V>0 in volt, costante durante ogni prova. La corrente I>0 in ampere entra nel morsetto a potenziale maggiore: usiamo la convenzione passiva V=RI. Fili e altri elementi hanno resistenza trascurabile. Fra prove si possono preparare V o R diversi; non si attribuisce a un riscaldamento incontrollato la variazione di R. Fra preparazioni si impone V=βR, con β=4 V/Ω=4 A. Si misura inoltre I=4 A. Quante coppie positive (V,R) sono determinate?

Procedimento d’autore: Inserire il vincolo in I=V/R dà I=β per ogni R>0. La misura non aggiunge una condizione indipendente: per esempio 12 V con 3 Ω e 4 V con 1 Ω danno entrambe 4 A. Le coppie sono configurazioni diverse di generatore e carico, ciascuna ohmica a temperatura fissata.

Passaggi: V=\beta R;  I=\frac{\beta R}R;  I=4\,\mathrm A.

Distrattori: Le coppie singole sono esempi, non una soluzione unica. V e R non sono liberi indipendentemente: il rapporto deve restare β. R nulla è esclusa e non si usa un cortocircuito ideale per creare altre soluzioni.

Hint: Sostituisci il vincolo e controlla se la misura fissa ancora una scala.

Fonte canonica SHA256 f2325f0e5edd25755376c8db9a03e1efb3b5210d5b887e68f06811e03d024150. Candidato SHA256 80b28c2d84fef39114d55881c145b6c81392a5ff0cc57246899693fe26e44c2e. Revisione indipendente e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 6337c956dacbaa5191266c76c4c13032a93b6b59c321e6cb62c8bf0a810511d6. Package file SHA256 0bc8c8e8c76840d1c60efb5ad87525a186cf8fd91cb574733fbfc97f5db4d94a. Binding file SHA256 94cecf9b7d4b6f9d002289d8bad0ee991e078c1dcf1eecf01606e151e16427cb. Prova strutturale SHA256 373e7a76a619ae7a038f40e536cfb14e7b6b93fe69689b61700c38656d3570d8. Asset-only manifest SHA256 9f59e9bec5abf5daa136d165d58283429acb28bb123f78f5afc7d09d12cd2580.

Le coordinate intrinseche dell’SVG documentano proporzioni geometriche nella sorgente, non una misura in pixel fisici dopo ridimensionamento. I testi visibili usano soltanto grandezze fisiche e valori pertinenti. Le origini e le etichette sono separate dagli assi; la direzione di ciascuna freccia è letta insieme alla sua didascalia.

## Geometria e convenzioni

Lo schema circuitale collega il polo positivo superiore del generatore al morsetto superiore del resistore; la freccia convenzionale entra in quel morsetto. I contatti toccano i capi del simbolo del resistore e non attraversano il corpo. Il grafico I(V) tiene R=3 Ω: coordinate V=0,3,12 e I=0,1,4 sulle scale30 coordinate/V e60 coordinate/A. La pendenza fisica I/V è1/3 Ω⁻¹, non3 Ω. L’origine rappresenta il limite V→0 della legge lineare; le prove numeriche restano V>0.

Le barre finali4,3,7/2 A hanno larghezze320,240,280 da origine130, scala comune80 coordinate/A. B usa R=5 Ω, come dichiarato, e non è un punto della retta a R=3 Ω. Lo zero a104 è separato dall’asse. Le coordinate sono conservate solo come documentazione tecnica; nel testo studente sono visibili grandezze fisiche e unità. Rendering nativo integrale letto, nessuna UI prodotto o approvazione scientifica propria.
