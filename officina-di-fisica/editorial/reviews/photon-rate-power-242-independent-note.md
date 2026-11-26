# Revisione indipendente photon-rate-power-242

Primaria prompt-only 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 482111220cd352709a44d2150f3e9cda0773c4fc, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L06 copre fase, lunghezze d’onda e potenza dai campi; C5-L07 copre fotoni, tassi e bilancio radiativo, con fondazioni reali L02/L04.

XML and full 640×1480 native read. At equal 33 pW, bars 250/125 at originx 150 represent 50/25 million photons/s with 5 coordinates per million/s. The logical arrow separates power from per-photon energy. Fixed-frequency graph origin 150, 1280 has 10 coordinates/pW horizontally and 5 coordinates/(million/s) vertically; endpoint 480, 1030 gives 33 pW, 50 million/s. Open origin and labels outside axes; no clipping/overlap or scale defect.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

## AR-u7-photon-rate-power-01

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Per fotoni monocromatici P=dotN·hf. h f=(33/5)×10⁻¹⁹ J per f₁₅=1, e 33 pW=33×10⁻¹² J/s. Quindi dotN=5×10⁷ s⁻¹=50 milioni al secondo. In generale dotN/(10⁶ s⁻¹)=50 P_pW/(33 f₁₅). È un tasso medio, non un conteggio istantaneo obbligatoriamente intero.

Distrattori: 100 raddoppia 50, 33 copia p e 5 perde un fattore 10 nella scala del tasso. P/(hf) ha s⁻¹ e dà 50 milioni/s.

Didattica: Legge motivata e unità normalizzate distinte dalle grandezze fisiche.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 220e022c01fbd427acfa7f6b40cff943f32f45c777ae76507671832f949f0cb8.

## AR-u7-photon-rate-power-02

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Un tasso di numero di fotoni ha dimensione T⁻¹ e unità s⁻¹. Il fotone è un conteggio, mentre il prefisso milioni cambia la scala numerica.

Distrattori: J, W, s sono energia, potenza, tempo; 1 è adatto a r. Tasso e frequenza condividono dimensioneT⁻¹ ma non significato.

Didattica: Dimensione ricostruita e prefisso distinto dall’unità fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 50681311dd27eda92c20f8f45e34abb2452278a9438eb617fce61dbc1f0e51f3.

## AR-u7-photon-rate-power-03

Ipotesi: Evento elementare di assorbimento a un solo fotone: hf rispetto alla soglia di ionizzazione è condizione energetica necessaria. Nessuna ipotesi su potenza 33 pW o frequenza 10¹⁵Hz, nessuna certezza di assorbimento e nessuna estensione a eventi multifotonici.

Derivazione manuale: Nel modello elementare a singolo fotone conta l’energia del singolo fotone E=hf, confrontata con la soglia di ionizzazione. Aumentare soltanto il numero di fotoni sotto soglia non rende energeticamente possibile quell’evento a un fotone; non si escludono qui processi multifotonici fuori modello.

Distrattori: Potenza, tasso, durata e area non sostituiscono hf nel bilancio energetico del singolo evento. Non si invocano processi multifotonici; sopra soglia non si garantisce assorbimento certo.

Didattica: Caso autonomo o legge riconosciuta dalle ipotesi effettive.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma df23b2ed45d657026bf32442ee9cea78b62ff3482cfe2364fe8227039a8c55d8.

## AR-u7-photon-rate-power-04

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: A f fissata, raddoppiare P da 33 a 66 pW raddoppia il tasso medio da 50 a 100 milioni/s.

Distrattori: 25 inverte P, 200 applica un quadrato, 66 copia p_B e 50 ignora il cambiamento. Il denominatore hf rimane fisso.

Didattica: Confronto controllato a un solo parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma c56f48aec9d0990a48b40ab03b798537fc5c5cff333c925595c2eb6cac3a949e.

## AR-u7-photon-rate-power-05

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Isolo P=dotN hf. Con tasso normalizzato 50 e f₁₅=1, P_pW=(33/50)·50=33.

Distrattori: 50 copia r senza energia per fotone; 66 pW dà r 100 e 33/2 pW r 25. Serve moltiplicare il tasso per hf.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f1a23f6de3ef38804935172588a02f0fa321656a2cd9cbcfa33bb2a8f5bcbe6e.

## AR-u7-photon-rate-power-06

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Isolo f₁₅=50 P_pW/(33 q), q=dotN/(10⁶ s⁻¹). Con P=33 e q=50 si ha f₁₅=1.

Distrattori: U 2 darebbe r 25 e u 1/2 darebbe r 100 a 33 pW. U 33 copia p senza risolvere la relazione.

Didattica: Seconda inversa con dominio e unità verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 580bab7a74db2f9929ab11d28dfd5bbaf5092aa25a72f979a20889fa1ce49173.

## AR-u7-photon-rate-power-07

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: A potenza costante, raddoppiare la frequenza dimezza il tasso: q_A=50, q_B=25, rapporto 1/2.

Distrattori: 2 rende diretto l’effetto di f; 1/4 introduce un quadrato e 1 ignora il raddoppio. Potenza positiva e f finita escludono zero.

Didattica: Due uscite ricostruite prima del rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 23eb4188802ad3755ca115d47b051194c05ef59e5a3530d181a4c956dc9d7c56.

## AR-u7-photon-rate-power-08

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Proposto 100 meno corretto 50 dà +50 milioni/s. La frequenza non è cambiata nel confronto di scarto.

Distrattori: −50 q_R scambia l’ordine, 2 è rapporto, 100 q_R proposta e 0 q_R l’accetta. L’uscita è un tasso, non una potenza.

Didattica: Differenza ordinata distinta da un rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0d2580be4975105bf5d284cbb1a29c2ceff799dc640f1cc13bf39505e853168b.

## AR-u7-photon-rate-power-09

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: P=dotN hf. Nella forma numerica P_pW=(33/50)qf₁₅; si moltiplica per f, non si divide nuovamente.

Distrattori: dotN/(hf) ha 1/(J·s); hf/dotN haJ·s. I fattori h e f si moltiplicano a dotN per ricostruire una potenza.

Didattica: Inversa simbolica con dimensioni e dominio.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 2922d4c9767bbd7de95c34d8e8aa5d4ea040519189907920a40efbc0980de47e.

## AR-u7-photon-rate-power-10

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Il rapporto fra tassi è κ₁/κ₂. P, f>0 in entrambe le preparazioni; non occorre che dotN normalizzato sia un intero perché è una media di eventi per unità di tempo.

Distrattori: Prodotto e reciproco confondono la dipendenza inversa da f; κ₂² aggiunge una potenza assente e la somma fallisce per stati identici. Nessuna integralità è richiesta al tasso medio.

Didattica: Fattori inseriti nella legge effettiva, senza analogie improprie.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 670e4dc049b7ac8571f30adce088eedd939891c0dd8acd7a7bea06d3969f2289.

## AR-u7-photon-rate-power-11

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: A=50; B=50/(33·2)=25/33 milioni/s. Il rapporto è 1/66. La potenza B è 1 pW, non 66 pW: serve rileggere questo dato autonomamente.

Distrattori: 66 inverte il rapporto, 1/33 considera solo P, 1/2 solo f e 1 nessuno. I due tassi 50 e 25/33 danno 1/66 senza arrotondare a conteggi.

Didattica: Entrambi gli ingressi considerati nel nuovo stato.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma adb22bcb162722dcc3e68038075973afac15faddb6e2ca309f61e6c4f9d28336.

## AR-u7-photon-rate-power-12

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Media uscite: (50+25/33)/2=1675/66 milioni/s. Agli ingressi medi P=17 pW e f₁₅=3/2, il modello dà 1700/99 milioni/s. La differenza è 1625/198 milioni/s, dunque mediare ingressi non sostituisce la procedura richiesta.

Distrattori: 1700/99 usa gli ingressi medi; 1675/33 è somma, 1625/66 semidifferenza e 25/33 solo B. La media richiesta 1675/66 differisce dal modello ai dati medi.

Didattica: Media delle uscite distinta dagli ingressi medi.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0f265b5c8837ef1ca5dc2aeeb89c3bffce8c93cb8db63f5557e4e984b19cb074.

## AR-u7-photon-rate-power-13

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Rapporto target 1/66=(P_B/P_A)/(f_B/f_A)=(1/33)/(f_B/f_A): f_B/f_A=2.

Distrattori: 1/2 inverte il confronto, 66 ignora il cambio di potenza e 1/33 copia il suo rapporto. A frequenza invariata B avrebbe r 50/33, doppio del bersaglio.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 12266883b0120c9df60a91552ebce3973f2d20c55de3942e5deaf12d7cd4cc8a.

## AR-u7-photon-rate-power-14

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Il riferimento q=50 e S=150 dà guadagno 3. S=25/11 implica q=25/33; con f₁₅=2 si ricava P=(33/50)(25/33)·2=1 pW.

Distrattori: 3 pW tratta D come r e predice 75/11. Mezzo pW perde u_B 2 dopo la taratura; 33 pW ripete A. Il tasso resta continuo e la frazione del display è ammessa.

Didattica: Taratura rimossa prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c47c819a39849be3055065493526e6dd5e316e53f5e7cdc9e6dff8b6f13954bf.

## AR-u7-photon-rate-power-15

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Riferimenti q_A=50, q_B=25/33 e letture 101, 83/33. ΔS=−3250/33 e Δq=−1625/33 danno a=2, b=1. S_C=201 dà q_C=100; f₁₅=1 implica P_C=66 pW.

Distrattori: 6633/100 pW omette b e predice D 202; 132 pW omette il guadagno dopo b e 33 pW predice D 101. P 66 pW ricostruisce D 201.

Didattica: Guadagno e offset identificati da due riferimenti distinti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma a3b665b96b89f8bf9e5e3f40edc742a9614d213fbd491a7718be10c86618c500.

## AR-u7-photon-rate-power-16

Ipotesi: Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.

Derivazione manuale: Il vincolo numerico P_pW=33 f₁₅ rende q=50 per ogni f₁₅>0. La misura è ridondante: infinite coppie continue positive potenza/frequenza, nessuna quantizzazione del tasso medio imposta.

Distrattori: Una o due coppie richiederebbero un dato indipendente; gli esempi smentiscono nessuna coppia.50 è il valore normalizzato del tasso, non il numero di coppie. P=33 u pW con ogni u>0 lascia una famiglia continua.

Didattica: Vincolo sostituito prima di decidere numero e dominio delle soluzioni.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 238e3df6be8e796de530dd818c36f2866caf9afcac2aa3b1b39b2c528d23cacb.
