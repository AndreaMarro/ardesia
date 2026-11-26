# Revisione indipendente force-current-wire-230

Primaria prompt-only 51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione b3e15de8c92ed04ae12fcf83a41dc581b480a196, separata dalle prove automatiche.

Il catalogo C4 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; il caso autonomo 234-03 usa L09, gli altri flussi L10, e le quattro famiglie meccaniche magnetiche L09.

XML e PNG indipendente completo 640×1480 letti. I verso destra e B entrante danno F verso l’alto; vettori di grandezze diverse dichiarati schematici. Barre da x 150 lunghe 300/200/250 rappresentano 60/40/50 mN a 5 coordinate/mN. Grafico con origine(150, 1300), 140 coordinate/A e 3 coordinate/mN: punto(430, 1120) per I 2 A, F 60 mN; origine aperta e dominio 0<I≤2 A. Scale dei due pannelli quantitative esplicitamente distinte.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

## AR-u6-force-current-wire-01

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: La forza sul tratto rettilineo è il modulo di Iℓ×B: F=BIL perché filo e campo sono perpendicolari. Convertendo 3 cm in 3/100 m, F=1·2·3/100 N=6/100 N=60 mN. È la forza sul segmento, non necessariamente la risultante su un circuito chiuso.

Distrattori: Sei mN perde un fattore dieci nella conversione complessiva; 6000 mN corrisponde a usare 3 m invece di 3 cm. Centoventi aggiunge un fattore due. Calcolo SI indipendente: 2·3/100 N=60 mN.

Didattica: Legge motivata prima della sostituzione, unità e variabile richiesta distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 2effafaf995615de7333fe5bee2a9340f3d0ed7f95e23835eb226196345ed2d7.

## AR-u6-force-current-wire-02

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Una forza si esprime in newton: N=kg·m/s². Il millinewton è 10⁻³ N e conserva la stessa dimensione. Tesla, ampere e lunghezza compaiono nel prodotto BIL, non sono separatamente unità di forza.

Distrattori: A, T, J e C sono corrente, campo, energia e carica. mN è un prefisso di newton e mantiene la dimensione di forza. Il lavoro richiederebbe anche lo spostamento orientato.

Didattica: Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 9cfa0fd3656207a35d0f0386e403cf88ecf662b6ebe8d1dde9e03140ffc71b05.

## AR-u6-force-current-wire-03

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Il prodotto vettoriale dà F=BIL sin 90°=BIL. Se i simboli denotano i soli valori numerici nelle unità richieste, F/(mN)=10[I/(A)][L/(cm)]. Il fattore 10 nasce da 10⁻² m/cm e 10³ mN/N; non è un fattore fisico adimensionale da usare indiscriminatamente con simboli SI.

Distrattori: Il fattore dieci nasce dalla conversione di centimetri in metri e newton in mN. Dividere per i o λ inverte una dipendenza diretta; i² introduce una diversa legge, non giustificata dal filo in campo esterno fissato.

Didattica: Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 8656786ccab58e6d93ddaa2d9a7ebe2e39e5f16cea6ec6ec57074f3866225e0e.

## AR-u6-force-current-wire-04

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: A B e L fissati, F è proporzionale a I. Passando da 2 A a 1 A si passa da 60 mN a 30 mN: F_B/F_A=1/2. La linearità riguarda il modulo nelle condizioni perpendicolari assegnate.

Distrattori: Centoventi inverte la proporzionalità, quindici applica il quadrato di 1/2, sessanta ignora il nuovo I e zero viola I>0 e perpendicolarità.

Didattica: Confronto controllato a parametro fissato, non evoluzione dinamica inventata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma f9918a710d5427611d659bc4ecc8d46cec9a58a08c2af4fbef010ec140d8c398.

## AR-u6-force-current-wire-05

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Da F=BIL si ottiene I=F/(BL). In SI, I=(60/1000 N)/[(1 T)(3/100 m)]=2 A. Il denominatore è positivo e non nullo nel dominio dichiarato.

Distrattori: Venti A omette dieci nella forma numerica. Un mezzo A ricostruisce 15 mN, sessanta A confonde il numero di forza con una corrente prima dell’inversa.

Didattica: Prima inversa ricavata e reinserita nella legge diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 91fefc29d5e79ad98ee3e51e684706de1d9b26d90b8b5b26ebcf68019f95ab09.

## AR-u6-force-current-wire-06

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Isolo L=F/(BI). La sostituzione dà (60/1000 N)/[(1 T)(2 A)]=3/100 m=3 cm. La conversione finale è necessaria perché il quesito chiede centimetri.

Distrattori: Trenta cm omette il coefficiente dieci e dà 600 mN. Un terzo cm dà 20/3 mN; due cm dà 40 mN. Tre cm ricostruisce esattamente il dato.

Didattica: Seconda inversa con denominatori positivi e distinzione fra modulo e verso.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 05e71dc52dac30f4b65b030aa70d0325da3d177464b0e4ee826eb73235fcbd21.

## AR-u6-force-current-wire-07

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Con B e I invariati il rapporto delle forze coincide con quello delle lunghezze: F_B/F_A=L_B/L_A=1/3. Separatamente si trovano 20 mN e 60 mN; il rapporto non ha unità.

Distrattori: Tre è il rapporto inverso; 1/9 e nove importano un quadrato, uno ignora la lunghezza diversa. I due moduli verificati sono 20 e 60 mN.

Didattica: Due uscite ricostruite prima del rapporto adimensionale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c819b58cc7501eff1c1743a7fe5fee2410cde2f0e8082aba61a99d1df25eec58.

## AR-u6-force-current-wire-08

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Il valore fisico corretto è 60 mN. Lo scarto ordinato come proposto meno corretto è 120−60=+60 mN. Il segno positivo identifica la sovrastima, non una direzione spaziale della forza.

Distrattori: −60 mN scambia l’ordine, due è il rapporto puro, 120 copia la proposta e zero la accetta. Nessuno rappresenta lo scarto richiesto di 60 mN.

Didattica: Ordine dello scarto preservato, separato dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 926e2d4f2b3658807888b1cbd07269d8ccb5d4b3cf20f79da7e4e169bddf965b.

## AR-u6-force-current-wire-09

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Dividendo F=BIL per BL, positivo, si ottiene I=F/(BL). Per i valori numerici normalizzati si ha I/(A)=[F/(mN)]/{10[L/(cm)]}. Scrivere soltanto F/L con grandezze fisiche ometterebbe B e altererebbe le dimensioni.

Distrattori: FL/B ha A·m², BL/F A⁻¹, F/B A·m e F/(BL²) A/m. Solo F/(BL) isola una corrente nel dominio positivo.

Didattica: Inversa simbolica con coefficienti dimensionali espliciti.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 2e890bd02bcf846f0a93e49aeb345f31372bdc61aa13de0ab503d1daa8f1c114.

## AR-u6-force-current-wire-10

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Nei due stati B, orientazione e geometria rettilinea restano le stesse. Dividendo B(κ₁I)(κ₂L) per BIL si cancellano tutti i parametri originari e resta κ₁κ₂. I fattori sono positivi e il denominatore è non nullo.

Distrattori: I quozienti rendono inverso un fattore diretto. κ₁² modifica la legge, mentre κ₁+κ₂ dà due in prove identiche. Il rapporto corretto è il prodotto dei fattori.

Didattica: Fattori inseriti nella legge effettiva prima di semplificare.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma d091df13b8f05cc268382f1605645fd0b36060197d59f5ed4271bdc6b326b842.

## AR-u6-force-current-wire-11

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Calcolo prima entrambe le forze: F_A=10·2·3=60 mN e F_B=10·1·4=40 mN. Il rapporto F_B/F_A è 40/60=2/3. La variazione della lunghezza impedisce di usare soltanto il rapporto delle correnti.

Distrattori: 3/2 è reciproco; 1/2 segue solo I e 4/3 solo L. Uno non ricostruisce i prodotti 60 e 40 mN.

Didattica: Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 03db89f52d08a9905802b3dbbacdafc62b7664feb56337d05b69bab13ffae7f2.

## AR-u6-force-current-wire-12

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Le due letture sono 60 e 40 mN e hanno uguale peso: la media è (60+40)/2=50 mN. Come controllo di non linearità congiunta, il modello agli ingressi medi I=3/2 A e L=7/2 cm dà 10·(3/2)·(7/2)=105/2 mN; media delle uscite meno questo valore è −5/2 mN. Non si scambiano i due procedimenti.

Distrattori: 105/2 mN usa gli ingressi medi, cento è la somma e dieci la semidifferenza. Zero non media questi due moduli positivi. La differenza dal valore ai dati medi è −5/2 mN.

Didattica: Media delle uscite distinta da modello agli ingressi medi e da media temporale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d983190e98afe155cbbe3304610353cc71ea02578df223b067f19e223186ad90.

## AR-u6-force-current-wire-13

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: La forza richiesta è (2/3)·60=40 mN. Con I_B=1 A, 10·1·L_B/(cm)=40 impone L_B=4 cm. Il rapporto cercato è 4/3; sostituendo si recupera esattamente il fattore 2/3 nell’uscita.

Distrattori: 3/4 inverte il rapporto, 2/3 copia il bersaglio della forza e 1/2 segue il solo I. Sei cm, implicati dal fattore due, darebbe 60 mN, non 40.

Didattica: Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma a8035ed3ce084f7f7c16b7082159e1eebda24f4d955e3cf34f9a85bd4e9835f5.

## AR-u6-force-current-wire-14

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Il riferimento dà F=60 mN e S=180, quindi il guadagno è 3 unità strumentali per mN. La nuova lettura S=120 corrisponde a F=40 mN; con L=4 cm, I=40/(10·4) A=1 A. Le unità strumentali restano le medesime, non sono implicitamente newton.

Distrattori: Tre A usa il display 120 come 120 mN. Quaranta copia la forza decodificata e 1/4 A dà F=10 mN e D=30. L’uscita positiva da decodificare è 40 mN.

Didattica: Guadagno del display rimosso prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 7bcc5a9c893a36f0a48eb7146272fd4c6e5f3c3f59b8e36a7213edf755d25d28.

## AR-u6-force-current-wire-15

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: I riferimenti fisici sono 60 e 40 mN. Sottraendo le due equazioni di taratura: 121−81=a(60−40), dunque a=2 unità strumentali/mN; b=121−2·60=1 unità strumentale. S_C=401 dà F_C=(401−1)/2=200 mN. Con L_C=5 cm si ricava I_C=200/(10·5)=4 A.

Distrattori: 401/100 A omette l’offset e produce D=402. Otto A omette il guadagno dopo aver sottratto b. Duecento A copia il numero di forza senza dividere per BL.

Didattica: Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 8c288847571a3665478ed9d12981bc033ff6fb5df5498f755e12b54cfc921a5f.

## AR-u6-force-current-wire-16

Ipotesi: Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.

Derivazione manuale: Pongo l=L/(1 cm)>0; il vincolo dimensionato è I=(2/3 A/cm)L e quindi I/(A)=2 l/3. La legge normalizzata dà 60=10·(2 l/3)l=(20/3)l², perciò l²=9. Il dominio seleziona l=3, cioè L=3 cm e I=2 A. La radice negativa è estranea al ramo fisico.

Distrattori: La radice −3 cm è esclusa dal modulo positivo. Nove cm dà 540 mN dal vincolo, due cm dà 80/3 mN. Il dato assoluto F fissa la scala e non lascia infinite lunghezze.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b0345e39976d7e48cbc71a44e09aade768a43638b3beb689c13ff476603c3f8c.
