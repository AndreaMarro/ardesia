# ohmic-current-203 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 200–204 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u6-circuits-200-204-primary-source-only.md, SHA256 d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG finali confrontati con i byte finali dell’autore alla SHA 0ecd111f18033e67350a8dc8f3de29c7bbdc629b. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Il decoder numerico usa il lessema AST esatto del helper canonico exact_arithmetic_literals.exact_literal, con SHA congelato e riportato in ogni record; non converte il valore float AST in stringa. Le controprove includono una scelta a distanza10⁻¹⁸ dal valore corretto, con pin, binding e token tutti rinnovati soltanto nel test.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u6-ohmic-current-01

Derivazione e calcolo manuale: Per un resistore ohmico a temperatura costante e generatore ideale, V=RI. Con V 12 V e R 3 Ω, I=12/3=4 A, orientata secondo il verso convenzionale di caduta di potenziale nel resistore. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 36 moltiplica V e R; 1/4 è il reciproco del valore corretto. Dodici e tre copiano i dati; il negativo non segue la convenzione passiva assegnata.

Didattica: Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.

Figura: XML e rendering integrale: schema con generatore positivo in alto e corrente convenzionale nel ramo alto verso destra, entrante nel resistore dal lato ad alto potenziale. RettaI(V)R3Ω da(0, 0) a(12V, 4A), coordinate 130850→490610, scale 30 unità/V e 60 unità/A. Punto 3V, 1A coerente. Barre 4/3/7/2A lunghe 320/240/280, scala 80; provaB haR5Ω e non appartiene alla retta.

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `bde3160cf2c225c832b7120e4b783999751ec3dd64baf71ae4ab93a199ad256c`.

## AR-u6-ohmic-current-02

Derivazione e calcolo manuale: La corrente ha unità A=V/Ω=C/s. Resistenza, tensione e potenza sono grandezze diverse; si aspetteranno le alternative effettive prima di fissare una stringa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: Volt, ohm, coulomb e watt misurano tensione, resistenza, carica e potenza. La corrente ha unità A=V/Ω.

Didattica: Dimensione e unità determinate indipendentemente, poi opzioni finali lette.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `A`. Firma: `42a76be8229198040f105dd566d59cbf1b764323515dc00381be6e38cc68082b`.

## AR-u6-ohmic-current-03

Derivazione e calcolo manuale: Da V=RI con R>0 segue I=V/R. È una relazione costitutiva ohmica nel regime e alla temperatura assegnati, non una legge universale per qualsiasi componente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: R/V ha unità A⁻¹; VR non è corrente. R² aggiunge un fattore e la radice di V/R avrebbe dimensione A alla potenza 1/2.

Didattica: Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.

Figura: XML e rendering integrale: schema con generatore positivo in alto e corrente convenzionale nel ramo alto verso destra, entrante nel resistore dal lato ad alto potenziale. RettaI(V)R3Ω da(0, 0) a(12V, 4A), coordinate 130850→490610, scale 30 unità/V e 60 unità/A. Punto 3V, 1A coerente. Barre 4/3/7/2A lunghe 320/240/280, scala 80; provaB haR5Ω e non appartiene alla retta.

Modalità AI_CONCEPTUAL. Risultato indipendente: `I = V/R`. Firma: `98977e26d5f424111096b448f4b89cf2d50c6705f9b2d54c255d8e22449acd5e`.

## AR-u6-ohmic-current-04

Derivazione e calcolo manuale: A dà 12/3=4 A. A V_B=1 V con R 3 Ω si ottiene 1/3 A, dodici volte minore. Nessun cambio della resistenza è implicato dal confronto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 48 A rende inversa la dipendenza da V. Quattro ignora la modifica; uno copia V e tre copia R.

Didattica: Confronto controllato con parametro fissato e risultato esatto anche se radicale.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 4 a 1/3 A`. Firma: `c5d36f8f6c61f151a65845bc970b3870b446bbed60f72c4da2776c97dc1d4f07`.

## AR-u6-ohmic-current-05

Derivazione e calcolo manuale: V=IR=4 A·3 Ω=12 V. Unità V e dominio positivo conservati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 3/4 usa R/I anziché il prodotto RI. Quattro copia la corrente, tre la resistenza. Una caduta negativa non descrive il ramo passivo dichiarato.

Didattica: Prima inversa derivata e reinserita nella legge diretta.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `12`. Firma: `e18e95e1730734dfcd6b0eaab9eec6f9c66ffc3589d30ceded1d4a52992f071d`.

## AR-u6-ohmic-current-06

Derivazione e calcolo manuale: R=V/I=12 V/(4 A)=3 Ω. La divisione richiede corrente non nulla e qui positiva. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 1/3 è il valore della conduttanza I/V. 48 V·A sarebbe una potenza. Ω·m misura resistività, non resistenza.

Didattica: Seconda inversa o angolo autonomo con dominio e orientazione espliciti.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `2fb05e4abf0e6d6e42cd47db639a83cd8f81829062b75354a9ff8bb909819642`.

## AR-u6-ohmic-current-07

Derivazione e calcolo manuale: A I 4 A; B con R 1 Ω eV 12 V dà 12 A. Rapporto 3, inverso al fattore 1/3 della resistenza. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 1/3 rende diretta la dipendenza da R; uno ignora il carico nuovo. Nove introduce un quadrato, il segno negativo contraddice le correnti positive.

Didattica: Due configurazioni ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3`. Firma: `ca8870c29c5f8f4b6fedf013eb5cf574d410f7de6f6864a4322bd8ac4ba10931`.

## AR-u6-ohmic-current-08

Derivazione e calcolo manuale: Proposta 8 A meno corretta 4 A dà+4 A. Il rapporto 2 è diverso e adimensionale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: −4 A inverte la sottrazione; 8 A copia la proposta e zero la accetta. Due è un rapporto puro.

Didattica: Ordine della differenza mantenuto e distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `4`. Firma: `09ce1283e917e5438cc4337acb368a83ed88f25d9995f713bd942b06c3772e5b`.

## AR-u6-ohmic-current-09

Derivazione e calcolo manuale: Isolando V da I=V/R si ha V=IR, A·Ω=V. Moltiplicare e non dividere perR ricostruisce la tensione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: I/R e R/I non hanno unità volt. IR² aggiunge un fattore resistivo e I²R è potenza in watt, non tensione.

Didattica: Inversa simbolica con controllo delle unità e delle divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `V = I R`. Firma: `1526fa90b4ba6f3afe5ddfb8391eedd4931ca33d3cb01766fa30f042108179f0`.

## AR-u6-ohmic-current-10

Derivazione e calcolo manuale: V_B=κ₁V_A eR_B=κ₂R_A danno I_B/I_A=κ₁/κ₂, per fattori e resistenze positive e stesso regime ohmico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: Il prodotto rende diretta R, il reciproco scambia B/A. Il denominatore al quadrato è assente; la somma dei fattori dà due per prove identiche.

Didattica: Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `κ₁/κ₂`. Firma: `98d4e2904fb4f3f36a4a434c185000843300ef10115ad38153e993f360aa3669`.

## AR-u6-ohmic-current-11

Derivazione e calcolo manuale: A dà 4 A; B con 15 V e 5 Ω dà 3 A. Rapporto 3/4: maggiore tensione non garantisce maggiore corrente se cambia ancheR. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 4/3 è il reciproco; 5/4 segue solo le tensioni e 3/5 solo le resistenze nell’ordine inverso. Uno presume una compensazione inesistente.

Didattica: Entrambi gli ingressi nuovi usati prima del confronto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `3/4`. Firma: `d85cb5c775adc1e383f860b728ebf62bc3fbb496511389d35b6b3064c5bd7529`.

## AR-u6-ohmic-current-12

Derivazione e calcolo manuale: Media aritmetica=(4+3)/2=7/2 A. Agli ingressi medi V=27/2 V, R 4 Ω si avrebbe 27/8 A, diverso da 28/8 A. Si trattano le due prove con uguale peso statistico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 27/8 A usa gli ingressi medi; sette somma, 1/2 è semidifferenza e tre copia B. La differenza esatta fra le medie è 1/8 A.

Didattica: Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.

Figura: XML e rendering integrale: schema con generatore positivo in alto e corrente convenzionale nel ramo alto verso destra, entrante nel resistore dal lato ad alto potenziale. RettaI(V)R3Ω da(0, 0) a(12V, 4A), coordinate 130850→490610, scale 30 unità/V e 60 unità/A. Punto 3V, 1A coerente. Barre 4/3/7/2A lunghe 320/240/280, scala 80; provaB haR5Ω e non appartiene alla retta.

Modalità EXACT_ORACLE. Risultato indipendente: `7/2`. Firma: `207f363869bad45d743c96887c0289b39088b43f30893a869697413963c71eba`.

## AR-u6-ohmic-current-13

Derivazione e calcolo manuale: Bersaglio I_B=(3/4)4=3 A. Con V_B 15 V serve R_B=5 Ω. Rapporto con R_A 3 Ω uguale 5/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 3/5 inverte B/A; 5/4 copia le tensioni e 3/4 le correnti. Un rapporto delle resistenze uguale a uno darebbe 5 A invece di 3 A.

Didattica: Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5/3`. Firma: `3c39556b435f838c76d5270c1fdda99b9c6453ead2d2869766a4a1ddbd016507`.

## AR-u6-ohmic-current-14

Derivazione e calcolo manuale: Riferimento 4 A conS 12: a=3 perA nella scala strumentale. S 9 decodifica 3 A. A R_B 5 Ω, V_B=15 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 45 V usa D come ampere; nove copia il display, cinque R e tre I. La taratura non è una resistenza elettrica.

Didattica: Guadagno strumentale rimosso prima dell’inversa fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `15`. Firma: `f8d1d48b0328e942efe01d23a6165d13e6fd94584c51fde16a55b47561b86114`.

## AR-u6-ohmic-current-15

Derivazione e calcolo manuale: Riferimenti 4 e 3 A e letture 9, 7: a=(9−7)/(4−3)=2, b=1. S_C 4 dà I_C=3/2 A. ConR_C 4 Ω, V_C=6 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: 8 V omette b e predice D=5. 3/2 copia I; quattro copia D e predice D=3. Dodici V non divide per a e predice D=7.

Didattica: Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `6`. Firma: `e6d762ff17ea88d2ff039260f0c0865dfe4ba177ba442d0ea64bdf8c04e82e55`.

## AR-u6-ohmic-current-16

Derivazione e calcolo manuale: Il vincolo fra prove V=(4 A)R rende I=4 A per qualsiasi R>0. Infinite coppie continue positive(V, R) compatibili: misura e vincolo non identificano la scala. Non è un generatore ideale unico che vari da solo entro una prova. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.

Ipotesi e dominio: Resistore ohmico ideale R>0 a temperatura mantenuta fissa, generatore ideale con cadutaV>0 e corrente positiva entrante nel morsetto ad alto potenziale. V=RI convenzione passiva, fili trascurabili. Parametri cambiati fra prove, non riscaldamento incontrollato. Display continuo, vincolo fra generatori e carichi diversi.

Distrattori: Le coppie elencate sono esempi; V e R non sono libere indipendentemente. R=0 è esclusa, quindi un corto ideale non crea altre soluzioni.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Infinite coppie positive`. Firma: `66ebf55aa9f14004923696bf78395d0de3c17608c82c545439aac94ac30f46f4`.
