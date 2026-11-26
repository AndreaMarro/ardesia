# Revisione indipendente wavelength-in-medium-240

Primaria prompt-only 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione fdd8e1a3ea1b278f0813d5f0f4c9c9b1e758d87e, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L06 copre fase, lunghezze d’onda e potenza dai campi; C5-L07 copre fotoni, tassi e bilancio radiativo, con fondazioni reali L02/L04.

XML and full 640×1480 native read. Phase-front spacing 180/90 represents 600/300 nm with common 0.3 coordinates/nm. Bars 135/240/187.5 represent 300, 1600/3, 1250/3 nm with common 0.45 coordinates/nm and originx 150. Graph origin 150, 1280 has 0.5 coordinates/nm on both axes, A at 450, 1130 represents 600 nm, 300 nm withn 2; open origin and no label/path overlap.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

## AR-u7-wavelength-in-medium-01

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: All’interfaccia ferma la frequenza è conservata. Da v=c/n e λ=v/f, mentre λ₀=c/f, segue λ=λ₀/n. Con 600 nm e n=2 si ottiene 300 nm; λ resta positiva e non supera λ₀ per n≥1.

Distrattori: 1200 nm usa nλ₀ invece di λ₀/n; 600 nm conserva la lunghezza nel mezzo e 150 nm divide per n due volte. Indice finito e λ₀>0 escludono zero.

Didattica: Legge motivata e unità normalizzate distinte dalle grandezze fisiche.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 9f047c4b1c06df1cb60233542046645cc11a14fb8cd9d47746ff1c0559a5870a.

## AR-u7-wavelength-in-medium-02

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: La lunghezza d’onda ha dimensione di lunghezza L. Metro, e relativi prefissi come nm, sono dimensionalmente adatti; frequenza e velocità hanno dimensioni diverse. Non servono opzioni per stabilire questa dimensione.

Distrattori: Hz è frequenza, m/s velocità, s periodo; n è puro ma la divisione per n non elimina la dimensione L di λ.

Didattica: Dimensione ricostruita e prefisso distinto dall’unità fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma f3c8117c285c14bf133389c1988cf2ad344ca4f61309a1a8e452dac6e47235bf.

## AR-u7-wavelength-in-medium-03

Ipotesi: Caso autonomo aria/vetro: luce monocromatica e interfaccia trasparente stazionaria; continuità temporale della frequenza. Non si impone assenza di riflessione né invariabilità dell’intensità trasmessa.

Derivazione manuale: La frequenza, fissata dall’oscillazione della sorgente, resta invariata attraverso una superficie ferma fra mezzi trasparenti stazionari. Cambiano velocità di fase e lunghezza d’onda; la direzione può cambiare ma non è necessario a incidenza normale.

Distrattori: All’interfaccia ferma resta la frequenza. λ e velocità variano con il mezzo; intensità e ampiezza possono cambiare per riflessione e impedenza anche in trasparenza.

Didattica: Caso autonomo o legge riconosciuta dalle ipotesi effettive.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma f27165c1777cdf83109120cc79f07e3c957750678fbd2cd109ba2c9b325d1a94.

## AR-u7-wavelength-in-medium-04

Ipotesi: Caso autonomo: n=3/2 e c=3×10⁸m/s come dato assegnato; velocità di fase c/n. Non servono λ₀600 nm, numero di fotoni o velocità di gruppo.

Derivazione manuale: Dalla definizione n=c/v, v=c/n=(3×10⁸ m/s)/(3/2)=2×10⁸ m/s. Questo è un caso autonomo: l’indice è assegnato e non si ricava dalla geometria.

Distrattori: Moltiplicare c per 3/2 dà 9/2×10⁸m/s; ignorare n dà 3×10⁸. Copiare il valore 3/2 dell’indice nella velocità non risolve n=c/v. Zero è impossibile con c>0 e n finito.

Didattica: Confronto controllato a un solo parametro fissato.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 9d5d3d2d7d7a16f5117e165920d2392471890574b83d8f5f370637842fd959e0.

## AR-u7-wavelength-in-medium-05

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Inverto λ=λ₀/n moltiplicando per l’indice: λ₀=nλ. Quindi 2·300 nm=600 nm. L’indice non ha unità.

Distrattori: 150 nm ripete la divisione; 300 nm omette n e 1200 nm lo applica due volte. Solo 600/2=300 nm ricostruisce la misura.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma af9ad6d439699810a46eac111fdd525227c57a8e344b69273356e61b9da219fc.

## AR-u7-wavelength-in-medium-06

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Isolo n=λ₀/λ: 600 nm/300 nm=2. Il risultato è adimensionale e soddisfa n≥1.

Distrattori: 1/2 inverte λ₀/λ e viola n≥1.300 e 600 sono valori numerici delle lunghezze, non il rapporto puro; la legge non richiede radici.

Didattica: Seconda inversa con dominio e unità verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 8e8823a90aa48c03b473bda62e799ddd8599b46fcf38b6fb7d9f2126a96e728d.

## AR-u7-wavelength-in-medium-07

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: A vale 600/2=300 nm; B vale 600/(3/2)=400 nm. Il rapporto B/A è 4/3. Ridurre n aumenta λ a λ₀ costante.

Distrattori: 3/4 segue n_B/n_A senza invertirlo. Le due uscite 300/400 nm impongono 4/3; 2, 1/2 e 1 non confrontano questi dati.

Didattica: Due uscite ricostruite prima del rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0f8bc41b1a31af7e3c5ddbc2d805d9a928aab7f1e72d671b33958592c6efd7f2.

## AR-u7-wavelength-in-medium-08

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Il valore corretto è 300 nm e la proposta è 600 nm. Lo scarto ordinato proposto meno corretto è +300 nm, una sovrastima.

Distrattori: −300 nm scambia l’ordine, 2 è rapporto, 600 nm proposta e 0 nm l’accetta. La differenza corretta è positiva 300 nm.

Didattica: Differenza ordinata distinta da un rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma bf3c1652209f6e51d5f7cf2e8d07567eaaf4fbc01d2bec64f1dea7ffb87d5a60.

## AR-u7-wavelength-in-medium-09

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: λ₀=nλ è l’inversa simbolica. Il prodotto ha dimensione L; dividere nuovamente per n non ricostruisce λ₀.

Distrattori: n/λ ha L⁻¹ e nλ² ha L²; λ−n mescola una lunghezza e un numero puro. λ/n ripete la legge diretta invece di isolarne λ₀.

Didattica: Inversa simbolica con dimensioni e dominio.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 32bed9304e2767ac8fd00058a67fbeb8cb0920196b934922627c05c57d06f2aa.

## AR-u7-wavelength-in-medium-10

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Sostituendo λ₀, B=κ₁λ₀, A e n_B=κ₂n_A si trova λ_B/λ_A=κ₁/κ₂. Occorre conservare n_A≥1 e κ₂n_A≥1, non soltanto κ₂>0.

Distrattori: Il prodotto rende diretta la dipendenza da n; reciproco scambia i due stati e il quadrato cambia la legge. κ₂n_A≥1 è richiesto anche per κ₂<1.

Didattica: Fattori inseriti nella legge effettiva, senza analogie improprie.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 18fd829d691b831c866270070f5513d3e39cb915249e1ed9cc1baeb2d1641f07.

## AR-u7-wavelength-in-medium-11

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: A=300 nm, B=800/(3/2)=1600/3 nm. Il rapporto è (1600/3)/300=16/9, senza arrotondare.

Distrattori: 9/16 è il reciproco di 16/9, 4/3 considera un solo effetto e 3/4 il rapporto diretto degli indici. I due effetti si rinforzano, non si compensano.

Didattica: Entrambi gli ingressi considerati nel nuovo stato.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b9f454b233c186124c374c25f2c04993b44c55d0fe84e03ea36281d532529236.

## AR-u7-wavelength-in-medium-12

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Le due uscite sono 300 e 1600/3 nm; la media con pesi uguali è 1250/3 nm. Gli ingressi medi darebbero 700/(7/4)=400 nm: differenza media uscite meno modello agli ingressi medi 50/3 nm. Non si confondono i procedimenti.

Distrattori: 400 nm valuta gli ingressi medi, 2500/3 nm somma, 350/3 nm semidifferenza e 1600/3 nm solo B. Media uscite 1250/3 nm e modello ai dati medi 400 nm differiscono di 50/3 nm.

Didattica: Media delle uscite distinta dagli ingressi medi.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c089d5ea71056aee28830c134bdf4cdbaabc08471511cffcbcc13de3e0c875ff.

## AR-u7-wavelength-in-medium-13

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Il bersaglio è (16/9)·300=1600/3 nm. Con λ₀, B=800 nm, n_B=800/(1600/3)=3/2; n_B/n_A=3/4, entrambi ammissibili.

Distrattori: 4/3 inverte il rapporto degli indici; 16/9 e 9/16 riguardano il bersaglio di λ. n_B=2 darebbe 400 nm, non 1600/3 nm.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 4cdba59e8ae4f2530b9aaac1b923ee022c161b8cbc02ab1f40ab772d596cc30c.

## AR-u7-wavelength-in-medium-14

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Il riferimento λ=300 nm e S=900 dà a=3 unità strumentali/nm. S=1600 implica λ=1600/3 nm; con n=3/2, λ₀=800 nm.

Distrattori: 2400 nm usa D come λ e poi moltiplica per n; 1600 nm copia il display e 600 nm il vecchio riferimento. La taratura 3 nm⁻¹ precede l’inversa.

Didattica: Taratura rimossa prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma cfbef301a25cff3741c16be6a83148af8da81194b99f33ca674f71844fb20614.

## AR-u7-wavelength-in-medium-15

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: I riferimenti sono λ_A=300 nm e λ_B=1600/3 nm. ΔS=1400/3 e Δλ=700/3 nm, dunque a=2 per nm e b=1. S_C=801 implica λ_C=400 nm; n=2 dà λ₀, C=800 nm.

Distrattori: λ₀801 nm, ottenuta senza sottrarre b, predice D 802.1600 nm omette il guadagno e 400 nm si ferma a λ nel mezzo. Il finale 800 nm dà λ400 nm e D 801.

Didattica: Guadagno e offset identificati da due riferimenti distinti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 73c953d4d231d9af8ffa3a7e22ae8170d0002b2f60d16d3c4521ad02f0ea9225.

## AR-u7-wavelength-in-medium-16

Ipotesi: Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.

Derivazione manuale: Il vincolo dimensionato λ₀=(300 nm)n rende λ=300 nm per ogni n≥1. La misura è ridondante; infinite coppie continue λ₀=300 n nm, n≥1, non una scala unica.

Distrattori: Un numero finito di coppie richiederebbe un altro dato indipendente. Gli esempi n 1 e 2 smentiscono nessuna coppia; indici reali n≥1 sono ammessi, senza integralità.

Didattica: Vincolo sostituito prima di decidere numero e dominio delle soluzioni.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 84a4c4bbd0d633667a0a7156ea553b1e8bc907d95c186be5f7a44246564ff775.
