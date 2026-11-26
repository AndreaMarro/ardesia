# Revisione indipendente accelerated-magnetic-radius-232

Primaria prompt-only 51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 1116dd5cb24dc759e4b3882e3b433f29ac83748c, separata dalle prove automatiche.

Il catalogo C4 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; il caso autonomo 234-03 usa L09, gli altri flussi L10, e le quattro famiglie meccaniche magnetiche L09.

XML e PNG indipendente completo 640×1480 letti. Primo pannello è uno schema di calcolo, non traiettoria in campi sovrapposti. Cerchi con raggi 50/100 rappresentano 2/4 m a scala comune 25 coordinate/m per U 2/8 V e B 1 T. Grafico a U 2 V usa origine(150, 1280), 80 coordinate/T e 80 coordinate/m e tre punti r 2/1/1/2 m ai B 1/2/4 T, non interpolati linearmente.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

## AR-u6-accelerated-magnetic-radius-01

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Nella regione elettrica il lavoro favorevole |q|U diventa energia cinetica da fermo: |q|U=mv²/2. Con |q|/m=1 C/kg e U=2 V si trova v=2 m/s. Nella regione magnetica distinta, r=mv/(|q|B); a B=1 T si ottiene r=2 m. Il campo magnetico non aggiunge energia cinetica.

Distrattori: Quattro m tratta v² come v. Un m richiederebbe U=1/2 V, non 2 V. Il magnete non può sostituire il lavoro elettrico iniziale.

Didattica: Legge motivata prima della sostituzione, unità e variabile richiesta distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 0abbd70174608c07c17dc2a33a26c2d8826080118b48dceab4de2ac9388e22d7.

## AR-u6-accelerated-magnetic-radius-02

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: La grandezza cercata è una lunghezza, espressa in metri. La legge combinata r=√(2 mU/|q|)/B ha dimensione di lunghezza; i coefficienti numerici assegnati non eliminano i fattori dimensionati.

Distrattori: V, m/s, T e J rappresentano tensione, rapidità, campo ed energia, non la lunghezza finale. αB ha s⁻¹.

Didattica: Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 18e2deb222e3a4f59b7f0025a251b3cd9acc30b1d4f446d7bfc3286ac3b7422a.

## AR-u6-accelerated-magnetic-radius-03

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Combino il bilancio elettrico da fermo con la forza centripeta: v=√(2|q|U/m), poi r=mv/(|q|B)=√(2 mU/|q|)/B. La radice positiva esprime una rapidità. Con u=U/(1 V), b=B/(1 T), il raggio normalizzato è r/(1 m)=√(2 u)/b, grazie al rapporto fisico |q|/m=1 C/kg.

Distrattori: 2αU senza radice è una velocità al quadrato. √(αU) perde il due energetico; omettere α al denominatore altera le dimensioni anche se il suo valore numerico è uno. Il reciproco non è un raggio.

Didattica: Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma f659b76512c42b95228ac77957f1ab27bb9b63a4045d8277e7637b8118f8ee1f.

## AR-u6-accelerated-magnetic-radius-04

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Quadruplicare U da 2 a 8 V raddoppia v, perché v² è proporzionale a U. Con B=1 T il raggio raddoppia da 2 a 4 m. Il fattore quattro non va applicato direttamente al raggio.

Distrattori: Otto m applica direttamente il fattore quattro della tensione; uno inverte il raddoppio, due ignora la nuova U e sedici aggiunge una potenza ingiustificata.

Didattica: Confronto controllato a parametro fissato, non evoluzione dinamica inventata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 274b3083b8a35610d784fe2028ae2e51551cb93f89edcf0ec3406426fb9ba97e.

## AR-u6-accelerated-magnetic-radius-05

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Quadrando rB=√(2 mU/|q|) e isolando U: U=|q|r²B²/(2 m). Per r=2 m e B=1 T, con il rapporto assegnato, U=2 V. U>0 e B>0 rendono valida la selezione del ramo iniziale.

Distrattori: Quattro V omette 1/2; un V usa il numero r invece di r² e restituisce r=√2 m. Otto V produce r 4 m. L’inversa deve restare nel modello classico.

Didattica: Prima inversa ricavata e reinserita nella legge diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma e15e68798e5f4f1c066c3f55887d6c375ed8256eb864eb17941a4ee7a1d91bfd.

## AR-u6-accelerated-magnetic-radius-06

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Dalla legge combinata B=√(2 mU/|q|)/r. Con U=2 V e r=2 m si trova B=1 T. Si sceglie il modulo positivo del campo, non una soluzione negativa introdotta elevando al quadrato.

Distrattori: Due T dà r 1 m; quattro T moltiplica i valori di v e r, −1 T non è un modulo ammesso. Il ramo B>0 va scelto esplicitamente.

Didattica: Seconda inversa con denominatori positivi e distinzione fra modulo e verso.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 2e1acb2becb4ed109326dc3cab6a9ae10a88c7c2d4599343a02a66ebadf2dc35.

## AR-u6-accelerated-magnetic-radius-07

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: A U invariata la rapidità di ingresso è uguale, mentre B raddoppia da 1 a 2 T. I raggi sono 2 e 1 m e il rapporto è 1/2. Il lavoro elettrico resta identico nelle due prove.

Distrattori: Due inverte l’effetto di B, un quarto usa un quadrato, uno ignora B. Zero non è il raggio con velocità positiva e campo finito.

Didattica: Due uscite ricostruite prima del rapporto adimensionale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 4dfc8019995a3b99c4cda8ec304b3c3cc19c949e30e18a6ddf037fc54bfb6e5d.

## AR-u6-accelerated-magnetic-radius-08

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Il valore corretto è 2 m; quello proposto è 4 m. Lo scarto proposto meno corretto è +2 m. La sottrazione conserva l’unità di lunghezza.

Distrattori: −2 m inverte lo scarto; due puro è il rapporto. Quattro copia la proposta e zero la accetta senza applicare entrambe le leggi.

Didattica: Ordine dello scarto preservato, separato dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b3e04d2f97a343da5660f827f1eddb2a5ef8900134d439cc19a5c38f5da4580e.

## AR-u6-accelerated-magnetic-radius-09

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Da r²B²=2 mU/|q| ottengo U=|q|r²B²/(2 m). In numeri normalizzati u=(r/(1 m))²b²/2. La dipendenza è quadratica sia nel raggio sia nel campo; il rapporto dimensionato |q|/m rimane nella legge fisica.

Distrattori: αBr/2 non contiene i quadrati della legge energetica. Omettere due raddoppia U; il reciproco ha V⁻¹. L’ultima formula scambia B e 1/B, senza isolare U.

Didattica: Inversa simbolica con coefficienti dimensionali espliciti.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma d05838e5a48c2ae75e2864241779f0d9beb516f923b7c62681f53f2849bf04d7.

## AR-u6-accelerated-magnetic-radius-10

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Per le due prove valide r_B/r_A=√(U_B/U_A)·B_A/B_B=√κ₁/κ₂. Questo confronto usa lo stesso rapporto |q|/m, partenza da fermo e regioni separate; non presuppone una forza magnetica che compia lavoro.

Distrattori: κ₁/κ₂ perde la radice di U. Il prodotto rende diretto B, il reciproco scambia le prove e √(κ₁/κ₂) mette impropriamente anche B sotto radice.

Didattica: Fattori inseriti nella legge effettiva prima di semplificare.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 7e9c99e52c0580b20415d1e6e5e9277623994d4c7c7952b5be76f4305fe93577.

## AR-u6-accelerated-magnetic-radius-11

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: In A, r_A=√4/1=2 m. In B, U=1 V e B=2 T danno r_B=√2/2 m. Il rapporto è (√2/2)/2=√2/4. Si conserva il radicale esatto, senza conversione decimale.

Distrattori: √2/2 segue solo il fattore della rapidità e ignora il campo doppio; 1/4 segue direttamente U.2√2 è il reciproco di√2/4 e uno ignora le due modifiche.

Didattica: Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma e7822717a1be4d6ed8a112eacb6ac7f5350eface97c1e89d796f1961f7d17091.

## AR-u6-accelerated-magnetic-radius-12

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Calcolo le due uscite 2 m e √2/2 m prima di farne la media: (2+√2/2)/2=1+√2/4 m. La risposta agli ingressi medi U=3/2 V e B=3/2 T sarebbe invece √3/(3/2)=2√3/3 m. Sono costruzioni diverse e non si sostituisce la seconda alla prima.

Distrattori: 2+√2/2 è la somma senza mediare; 1+√2/2 dimezza solo il primo addendo.2√3/3 usa gli ingressi medi. Tutte le somme sono parentetizzate prima dell’unità e zero non media due raggi positivi.

Didattica: Media delle uscite distinta da modello agli ingressi medi e da media temporale.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ca42df6ef3d70a5940bb577387aa14668e346a43bbb12d5d0d848f9821cb873d.

## AR-u6-accelerated-magnetic-radius-13

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Il raggio richiesto è (√2/4)·2=√2/2 m. Con U_B=1 V, B_B=√2/(√2/2) T=2 T. Pertanto B_B/B_A=2. Il fattore cercato è razionale anche se il raggio intermedio è irrazionale.

Distrattori: Mezzo inverte il rapporto; √2/2 copia le rapidità e√2/4 i raggi. Un fattore campo quattro implica B_B 4 T e r_B√2/4 m, metà del bersaglio.

Didattica: Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma f485f78b7628b54f9ba15a02638ca84c3bf93430bbdfd66a679f2cdb11ddd368.

## AR-u6-accelerated-magnetic-radius-14

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Il riferimento r=2 m con S=6 dà a=3 unità strumentali/m. S=3√2/2 corrisponde a r=√2/2 m. Con B=2 T, U=|q|r²B²/(2 m)=1 V. Il radicale si elimina elevando esattamente al quadrato, non approssimandolo.

Distrattori: Nove V usa il display come r, triplicando r e aumentando U di nove volte. Due V omette il fattore 1/2; mezzo V restituisce r 1/2 m, non√2/2 m.

Didattica: Guadagno del display rimosso prima dell’inversa fisica.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 6dfb2349893aec2d2f6eaed8c8b792fd6a20376dff688b9fe7ed7af58034f29a.

## AR-u6-accelerated-magnetic-radius-15

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: I riferimenti fisici hanno r_A=2 m e r_B=√2/2 m. La differenza delle letture è 4−√2 e quella dei raggi è (4−√2)/2 m; quindi a=2 unità strumentali/m e b=1. S_C=9 implica r_C=4 m; con B=1 T risulta U_C=8 V. La taratura coinvolge riferimenti algebrici esatti e non un arrotondamento razionale.

Distrattori: 81/8 V omette b e predice D 10. Trentadue V sottrae b ma non divide per a prima del quadrato. Sedici V omette il fattore 1/2 energetico. La taratura esatta con due radicali dà a 2/m, b 1.

Didattica: Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma bd99ef51da80ac06b6c70188415ff28477dbb5359ecb728ce631491aab7a7b19.

## AR-u6-accelerated-magnetic-radius-16

Ipotesi: Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².

Derivazione manuale: Il vincolo è lineare U=(2 V/T)B, non quadratico nel campo. Pongo b=B/(1 T)>0, allora u=2 b e r/(1 m)=√(4 b)/b=2/√b. La misura r=2 m impone √b=1, quindi B=1 T e U=2 V. La positività esclude B=0 e ogni ramo non fisico.

Distrattori: −1 T viola il modulo e darebbe U negativa dal vincolo. Due T darebbe r√2 m, quattro T r 1 m. Il vincolo lineare e la misura fissano B, senza scala libera né radiceB 0 ammissibile.

Didattica: Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 6103f69de02da53fa99e66036c2c80b59369933f05aff1524ea79ab6d633d5d8.
