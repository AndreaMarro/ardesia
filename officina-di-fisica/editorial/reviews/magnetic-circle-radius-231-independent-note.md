# Revisione indipendente magnetic-circle-radius-231

Primaria prompt-only 51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 1e4dbef27eb0d7e6046e109328081eb974578a21, separata dalle prove automatiche.

Il catalogo C4 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; il caso autonomo 234-03 usa L09, gli altri flussi L10, e le quattro famiglie meccaniche magnetiche L09.

XML e PNG indipendente completo 640×1480 letti. Nella vista con q positiva, B entrante e punto in basso, la tangente v verso destra dà forza centripeta verso il centro soprastante. Cerchi 80 e 40 rappresentano 2 m e 1 m con scala comune 40 coordinate/m. Grafico con origine(150, 1280), 80 coordinate/T e 80 coordinate/m: punti(230, 1120), (310, 1200), (470, 1240) per B 1/2/4 T, r 2/1/1/2 m. Nessuna interpolazione lineare dichiarata; B 0 escluso.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

Riletto fix 231-03: F₋(0)=−F₊(0) vale inizialmente. A un quarto di giro le velocità non coincidono; la controprova vettoriale mostra che le forze possono coincidere. Il PNG precedente resta autentico sui medesimi byte SVG, senza attribuirgli un nuovo rendering.

## AR-u6-magnetic-circle-radius-01

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: La forza magnetica perpendicolare ha modulo |q|vB ed è centripeta: |q|vB=mv²/r. Poiché v>0, r=mv/(|q|B). Qui m=10⁻⁶ kg e |q|=10⁻⁶ C, quindi m/|q|=1 kg/C; con v=2 m/s e B=1 T si ottiene r=2 m.

Distrattori: Quattro m mantiene v² ma perde il fattore v del lato magnetico; uno omette il valore due della velocità. Il raggio geometrico non diventa negativo cambiando il segno della carica.

Didattica: Legge motivata prima della sostituzione, unità e variabile richiesta distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d33843f957bdebd6745e5b8a80f1be360c576cd812351fe648ee90fb13e7b3a9.

## AR-u6-magnetic-circle-radius-02

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Il raggio è una lunghezza, dunque l’unità dimensionalmente pertinente è il metro. Da mv/(|q|B), usando T=kg/(C·s), si ottiene m. Un prefisso non modifica questa dimensione.

Distrattori: Il quoziente mv/(|q|B) è una lunghezza, non un tempo, campo, forza o velocità. L’unità kg/s al denominatore cancella quella della quantità di moto lasciando metri.

Didattica: Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma ba2f707435da623f90d9fd186d372d49c144a16b2b37458e8d582ea19ba10a49.

## AR-u6-magnetic-circle-radius-03

Ipotesi: Caso autonomo: uguali masse positive e moduli di carica, cariche opposte e stessa velocità iniziale perpendicolare a B uniforme, partenza dallo stesso punto. Le forze sono opposte a t=0, non necessariamente durante l’intera evoluzione. I numeri 1 mg e 1 μC degli altri quesiti non sono dati imposti a questo confronto simbolico.

Derivazione manuale: La forza qv×B cambia verso cambiando il segno di q, mentre il suo modulo è uguale. Le due traiettorie hanno lo stesso raggio mv/(|q|B), ma curvatura e verso di rotazione opposti rispetto al campo. Non è assegnata una posizione iniziale comune: non la si aggiunge per fissare i centri. Se fosse comune anche la posizione, i centri sarebbero sui lati opposti della tangente iniziale. Il candidato dichiara ora anche il punto iniziale comune. La formula finale limita esplicitamente F₋(0)=−F₊(0): a un quarto di giro le velocità sono diverse e le forze possono coincidere. Il ramo iniziale è stato riletto dopo il fix1e4dbef2.

Distrattori: Il segno cambia il prodotto vettoriale, non |q| nella legge del raggio. Alla partenza le velocità sono uguali e le forze opposte; non si estende F₋=−F₊ a tutti gli istanti. La potenza q(v×B)·v è nulla, quindi nessun aumento della rapidità.

Didattica: Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma bf4c637c31529608a4f6819e0069270b5ffd4360867f18ad63c56b175b43d14b.

## AR-u6-magnetic-circle-radius-04

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: A massa, modulo della carica e B costanti, r è lineare nella rapidità. Da 2 a 3 m/s il raggio passa da 2 a 3 m: il fattore è 3/2. Il campo magnetico devia la velocità senza aumentarne il modulo durante ciascuna prova.

Distrattori: 9/2 m applica il quadrato di 3/2; 4/3 inverte l’effetto, due ignora la nuova v e sei non deriva dal fattore assegnato. Il campo devia, non prepara da solo una velocità maggiore.

Didattica: Confronto controllato a parametro fissato, non evoluzione dinamica inventata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 9841b3a0ee1fcf9a660a4ee2f4be427124ed83b363b1ced8a02d09cc576857e2.

## AR-u6-magnetic-circle-radius-05

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Da r=mv/(|q|B) segue v=|q|Br/m. Inserendo r=2 m, B=1 T e m/|q|=1 kg/C si ricava v=2 m/s. Tutti i dati sono positivi, coerenti con il ramo del modulo della velocità.

Distrattori: Un mezzo m/s è reciproco numerico e non ricostruisce r. Quattro m/s dà r=4 m. Omettere |q|/m lascia Br con dimensione T·m.

Didattica: Prima inversa ricavata e reinserita nella legge diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 6a206e03f69ba380a7a28eabc674bc322aa04777c79d57355783dc96819402e9.

## AR-u6-magnetic-circle-radius-06

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Isolo B=mv/(|q|r). Con v=2 m/s e r=2 m si ottiene B=1 T. Il raggio positivo evita la divisione per zero e il modulo B è positivo.

Distrattori: Due T produce r=1 m; quattro T moltiplica v e r nei numeri invece di formare il rapporto. Il modulo del raggio non determina un segno per B.

Didattica: Seconda inversa con denominatori positivi e distinzione fra modulo e verso.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 155f4184c21cde1b286e3dbb91dd33fb563d7d8b5d0400ebcd76a7eaadfaf873.

## AR-u6-magnetic-circle-radius-07

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: A v fissata il raggio varia inversamente con B: r_B/r_A=B_A/B_B=1/2. I due raggi sono rispettivamente 2 m e 1 m. Aumentare il campo accresce la curvatura, non il raggio.

Distrattori: Due inverte B/A, 1/4 importa un quadrato, uno ignora il campo e zero non è possibile con dati finiti positivi. Le rapidità sono identiche nelle due preparazioni.

Didattica: Due uscite ricostruite prima del rapporto adimensionale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 820e65be2399fdf8aede363e078fc1b36c925e1dbd70aa275a410f0b971abb13.

## AR-u6-magnetic-circle-radius-08

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: La legge fisica dà r=2 m. Lo scarto con la convenzione richiesta è 4−2=+2 m. Il segno indica una sovrastima del raggio proposto.

Distrattori: −2 m inverte lo scarto, due è rapporto puro, quattro copia la proposta e zero la accetta. La differenza firmata non è una curvatura orientata.

Didattica: Ordine dello scarto preservato, separato dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma e4cef658717f2e4e0ddb9cce67fb8b34cb645109d4685be927e08716d5f1c3a5.

## AR-u6-magnetic-circle-radius-09

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: La relazione centripeta si riduce, per v>0, a r=mv/(|q|B); moltiplico per |q|B/m e ottengo v=|q|Br/m. L’identità numerica v/(m/s)=[r/(m)][B/(T)] vale grazie al rapporto assegnato m/|q|, non autorizza a eliminare le dimensioni di quel rapporto nella legge fisica.

Distrattori: mr/(|q|B) ha m·s; mB/(|q|r) non è velocità; |q|B/(mr) ha 1/(m·s) e m/(|q|Br) ha s/m. Massa e carica non si eliminano dimensionalmente perché i loro valori numerici coincidono.

Didattica: Inversa simbolica con coefficienti dimensionali espliciti.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 69f6fcb96c637a71fd317881ead3b25e06cf3308a3aea9ff3974f666e47479c1.

## AR-u6-magnetic-circle-radius-10

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: La massa e il modulo della carica si cancellano nel rapporto dei due raggi. Resta (κ₁v)/(κ₂B) diviso v/B, cioè κ₁/κ₂. Entrambe le prove devono mantenere velocità perpendicolare e regime non relativistico.

Distrattori: Il prodotto rende diretto il campo, il reciproco inverte il rapporto e κ₁² cambia la legge lineare in v. La somma fallisce per fattori entrambi unitari.

Didattica: Fattori inseriti nella legge effettiva prima di semplificare.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 6a498f7ce052e44756e4b3c9e5c2bb7ac4495284a99c0886b0266404fa015033.

## AR-u6-magnetic-circle-radius-11

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Il raggio iniziale è 2/1=2 m; quello finale è 6/2=3 m nelle unità normalizzate assegnate. Il rapporto è 3/2. I fattori separati danno lo stesso controllo: 3/2 per la rapidità e il campo combinati, cioè 3 diviso 2.

Distrattori: Due terzi è reciproco, tre segue solo la rapidità, mezzo solo il campo e uno presume compensazione. Raggi 2/3 m producono il rapporto 3/2.

Didattica: Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 7c634b54a3682c88c322d1511391dd5f07cf776d6aca4faee7fc9e86a2affd2d.

## AR-u6-magnetic-circle-radius-12

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Le letture fisiche sono 2 e 3 m: la media è 5/2 m. Il modello valutato invece su v medio 4 m/s e B medio 3/2 T dà 8/3 m. La differenza fra media delle letture e valore agli ingressi medi è 5/2−8/3=−1/6 m; i due procedimenti non coincidono.

Distrattori: 8/3 m usa i dati medi, cinque somma senza mediare e mezzo è semidifferenza. Zero non è la media di lunghezze positive e non si sta mediando il segno di due cariche.

Didattica: Media delle uscite distinta da modello agli ingressi medi e da media temporale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f45d02e3c509c107e63c7c4ecc092a1b87ee7d6faef7e1c10429a1bd4a846310.

## AR-u6-magnetic-circle-radius-13

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Si vuole r_B=(3/2)·2 m=3 m con v_B=6 m/s. Da B=mv/(|q|r) segue B_B=2 T. Poiché B_A=1 T, il rapporto B_B/B_A è 2. Sostituire questo campo nel modello restituisce il raggio richiesto.

Distrattori: Mezzo inverte il campo richiesto; 3/2 copia i raggi e tre la variazione di v. B invariato darebbe r 6 m, non 3 m. Il nuovo campo ricostruito è 2 T.

Didattica: Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma fac2b496a09a7f46eaee9bcb3dcd1c79c3ee34c960cd61ae625b50410c21611b.

## AR-u6-magnetic-circle-radius-14

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: La lettura di riferimento S=6 corrisponde a r=2 m: a=3 unità strumentali/m. S=9 implica r=3 m. Con B=2 T, v=|q|Br/m=6 m/s. Non si identifica la lettura strumentale con un raggio prima della taratura.

Distrattori: Diciotto m/s usa D 9 come 9 m. Tre copia il numero del raggio e due riusa la velocità iniziale, che a B 2 T darebbe D 3.

Didattica: Guadagno del display rimosso prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 5dd0c7606c6413c6d32b18c9b534384f9b79cc2591158a4b77215e35618e2c6e.

## AR-u6-magnetic-circle-radius-15

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Dai punti (r, S)=(2 m, 5), (3 m, 7) si ottiene a=(7−5)/(3−2)=2 unità strumentali/m e b=1. La lettura 3 implica r=(3−1)/2=1 m. A B=1 T si ricava v=1 m/s. I riferimenti hanno raggi distinti, quindi la taratura affine è determinata.

Distrattori: 3/2 m/s omette b e predice D 4; due sottrae b senza dividere per a; tre copia il display e predice D 7. La velocità corretta dà D 3.

Didattica: Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 95d247f6c8a89cbf62230eaaaac7809efaeb168fd73c304dcfd11332e196b4f9.

## AR-u6-magnetic-circle-radius-16

Ipotesi: Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.

Derivazione manuale: Il vincolo dimensionato v=(2 m·s⁻¹·T⁻¹)B rende r=2 m identicamente per tutti i B positivi compatibili col regime non relativistico. La misura è dunque ridondante e restano infinite coppie continue: per esempio (B, v)=(1 T, 2 m/s) e (2 T, 4 m/s). Non sono conteggi interi e non si pretende validità non relativistica a velocità arbitrariamente grandi.

Distrattori: La variabile B si cancella perché il dato r 2 m ripete il vincolo v/B. Non nasce una quadratica né una condizione di integralità dei campi. Infinite coppie sono compatibili anche in un intervallo di velocità molto piccole rispetto a c.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 57b3566aa2ad5370bed9e8715888ba69739e3608d7290095395c1e44e4c393ad.
