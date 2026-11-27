"""Individual third-exam reading against frozen prompt-only source mathematics."""
READING_COMPLETE=True
PRIMARY_MANUAL={75: 'Nel modello di Fourier, omogeneo e stazionario con conducibilità k>0 e area A>0, la potenza orientata '
     'è P=kA(T_1−T_2)/s. A parità di estremi e materiale, sostituire s con 2s produce P_2=P_1/2 e dimezza '
     'anche il modulo del gradiente e il flusso termico per unità di area. Il rapporto P_2/P_1=1/2 richiede '
     'T_1≠T_2: se le due facce hanno la stessa temperatura, entrambe le potenze sono zero e quel rapporto è '
     '0/0. Non si dimezza necessariamente un calore totale se cambia anche la durata; nessuna durata è '
     'assegnata. La maggiore resistenza termica, raddoppiata, spiega il risultato senza calcolatrice.',
 76: 'Un millilitro è un centimetro cubo: 1 mL=(10⁻² m)³=10⁻⁶ m³. Pertanto 250 mL=250·10⁻⁶ m³=1/4000 '
     'm³=0,00025 m³. La conversione è cubica: non basta convertire una sola lunghezza. Il contenuto è una '
     'soluzione, ma non serve alcuna densità perché si converte lo stesso volume, senza mescolare o cambiare '
     'stato.',
 77: 'Per piastre estese nel vuoto, C=ε₀A/d con A,d>0. Allora C₂/C₁=(3A/(2d))/(A/d)=3/2. Si può moltiplicare '
     'il fattore tre dell’area per il fattore un mezzo della distanza. Non occorre assegnare Q o V, né '
     'sapere se il generatore resta collegato: la capacità nel modello geometrico dipende da area, distanza '
     'e permittività. Gli effetti di bordo sono esplicitamente esclusi.',
 78: 'Allo stesso livello nel liquido fermo la pressione è uguale nei due rami. Il gas deprime il suo '
     'livello, quindi la sua pressione supera quella atmosferica: p_gas−p_atm=+ρgΔh. Con Δh=5/100 m, si ha '
     '800·10·5/100=400 Pa. Il segno è positivo; la pressione assoluta del gas richiederebbe di aggiungere '
     'p_atm e non è richiesta. La differenza è verticale, non la lunghezza di un tubo inclinato.',
 79: 'La figura-stimolo XML è stata letta per intero: il raggio verde arriva alla parete verticale, il rosso '
     'procede verso il secondo specchio orizzontale. Nella sezione, rappresento la direzione iniziale con '
     '(u,v) non nullo. La prima riflessione cambia soltanto la componente normale alla parete verticale: '
     '(−u,v). La seconda cambia quella normale al piano orizzontale: (−u,−v). Il prodotto scalare con la '
     'direzione iniziale è −(u²+v²), quindi l’angolo dei due vettori direzione è 180°. I raggi sono '
     'antiparalleli, senza essere necessariamente la stessa retta. Questa conclusione usa il raggio nel '
     'piano della sezione: una componente lungo lo spigolo tridimensionale non verrebbe invertita.',
 80: 'Con asta di massa trascurabile il denominatore è 1+3=4 kg. Il primo momento è (1 kg)·0+(3 kg)·40 '
     'cm=120 kg·cm; x_CM=120/4=30 cm=3/10 m. Il punto è fra le masse e più vicino a quella da 3 kg, '
     'controllo immediato. La media semplice 20 cm varrebbe per due masse uguali. L’origine è quella '
     'assegnata, non il centro dell’asta.',
 81: 'Per una quantità fissata di gas ideale monoatomico U=3nRT/2 dipende soltanto da T. L’isoterma dà ΔU=0. '
     'Con W positivo svolto dal gas e Q positivo entrante, il primo principio è ΔU=Q−W; dunque Q=W. In '
     'un’espansione quasi statica con lavoro pV positivo, entrano calore ed esce lavoro della stessa '
     'quantità. Q e W non sono entrambi nulli soltanto perché T resta costante. Se il percorso è anche '
     'reversibile, W=nRT ln(V_f/V_i)>0; questa formula aggiuntiva non è necessaria all’uguaglianza richiesta '
     'e non sostituisce i limiti del modello.',
 82: 'L’iniziale neutralità del nodo interno in serie impone moduli di carica uguali. La capacità '
     'equivalente è C_s=(3·6)/(3+6) μF=2 μF. Pertanto Q=C_sV=(2 μF)(12 V)=24 μC su ciascun condensatore. '
     'Controllo separato: V_3=24/3=8 V, V_6=24/6=4 V, e 8+4=12 V. Le capacità non si sommano come nel '
     'parallelo; la somma delle cariche positive delle due armature non è la carica richiesta su ciascun '
     'condensatore.',
 83: 'L’equilibrio verticale senza altre forze richiede ρ_l gV_imm=ρ_s gV_tot. Quindi '
     'V_imm/V_tot=750/1000=3/4. La frazione emersa è 1−3/4=1/4, ossia 25%. È il volume, non l’altezza per '
     'una forma generica: nessuna sezione uniforme è prescritta. La densità del corpo è minore di quella del '
     'liquido, condizione compatibile con il galleggiamento parziale. Si trascura esplicitamente la spinta '
     'dell’aria.',
 84: 'Nel modello del vuoto entrambe le perturbazioni elettromagnetiche si propagano con la stessa velocità '
     'c, indipendente dalla frequenza. Con emissione simultanea, stessa origine e identico cammino, i tempi '
     'di percorrenza sono uguali: arrivano insieme. Frequenza ed energia del singolo fotone differiscono, ma '
     'non producono qui un ritardo dispersivo. Non si estende questa conclusione a un mezzo materiale '
     'dispersivo, né a percorsi diversi.',
 85: 'I due corpi hanno la stessa accelerazione verticale a della cabina rispetto a un riferimento '
     'inerziale. Per il corpo sostenuto dal dinamometro, T−m₁g=m₁a, quindi g+a=T/m₁=48/4=12 m/s². Per il '
     'corpo sul pavimento, N=m₂(g+a)=6·12=72 N. Non serve conoscere g numericamente: il rapporto delle '
     'letture è il rapporto delle masse, 6/4. Il dato positivo implica che il contatto può essere mantenuto; '
     'non si aggiunge nuovamente il peso a 72 N, che già rappresenta la forza di sostegno.',
 86: 'La massa si converte prima: 4 g=4/1000 kg. Il modulo del calore latente ceduto è mL=(4/1000)(2·10⁶) '
     'J=8000 J=8 kJ. Dal punto di vista del vapore condensante Q=−8000 J, ma il prompt chiede il modulo '
     'positivo dell’energia ceduta. Nessun mcΔT si somma, perché il processo avviene alla temperatura di '
     'transizione e non include raffreddamento successivo.',
 87: 'Con q>0, la forza qE è costante e parallela al campo esterno uniforme. Nel modello classico a massa '
     'costante, a=qE/m è costante; partendo da ferma la carica si muove lungo la retta parallela al campo, '
     'con v=at e spostamento at²/2. Non è moto circolare: quello richiederebbe una forza sempre '
     'perpendicolare alla velocità. La conclusione vale soltanto finché rimane nella regione uniforme e nel '
     'regime non relativistico; nessun moto trasversale iniziale è dato.',
 88: 'Una goccia liquida ha una sola interfaccia con il gas, quindi Δp=2γ/r per equilibrio sferico con '
     'tensione positiva. A γ comune e r₂=r₁/3, Δp₂/Δp₁=r₁/r₂=3. L’esterno comune rende chiaro il riferimento '
     'del salto, ma il rapporto è fra differenze interno−esterno, non fra pressioni assolute. Il fattore '
     '4γ/r sarebbe quello di una bolla di film con due interfacce, non di queste gocce.',
 89: 'Ogni strato moltiplica l’intensità che riceve per 7/10. Il secondo riceve già I₁=(7/10)I₀, così '
     'I₂=(7/10)²I₀=49/100 I₀. Esce il 49% dell’intensità originaria. Sommare due perdite del 30% rispetto '
     'alla stessa I₀ darebbe il 40% e sarebbe scorretto: la seconda perdita si applica a I₁. Sono esclusi '
     'altri effetti, come riflessioni multiple, sorgenti interne o saturazione.',
 90: 'Il corpo resta fermo, quindi la somma delle forze orizzontali è zero. L’attrito ha modulo 3 N, opposto '
     'all’unica spinta da 3 N. Il valore 7 N è un limite superiore disponibile, non una forza che agisce '
     'sempre al massimo. La verifica 3≤7 conferma che l’equilibrio è possibile. Non uso la legge '
     'dell’attrito dinamico per un corpo che non scivola.',
 91: 'La variazione assegnata è per spira, quindi il flusso concatenato totale cambia di NΔΦ. Il modulo '
     'della fem media è N|ΔΦ|/Δt=20·(3/1000)/(1/10) V=3/5 V=0,6 V. Le tre cifre mWb si convertono in weber '
     'prima del prodotto. La fem media con segno dipende dal verso scelto; il modulo richiesto è positivo. '
     'Non si confonde il flusso di una sola spira con quello già concatenato all’intera bobina.',
 92: 'Per parete bagnante con θ<90°, la componente verticale della tensione superficiale lungo il bordo è '
     'rivolta verso l’alto. Nel modello cilindrico, trascurando il volume del menisco, 2πrγcosθ=ρgπr²h, da '
     'cui h=2γcosθ/(ρgr)>0. Il livello del liquido nel capillare sta sopra quello dell’ampio serbatoio e il '
     'menisco è concavo nel caso bagnante usuale. La colonna è finita per r,ρ,g positivi; il tubo abbastanza '
     'lungo evita il limite imposto dal bordo superiore. Non si dice che il liquido sale indefinitamente o '
     'supera ogni altezza.',
 93: 'Per forza costante W=Fs cosθ. Sostituendo i dati con unità, W=(10 N)(2 m)(−1/2)=−10 J. Il segno '
     'negativo indica una componente della forza opposta allo spostamento; il modulo della forza resta '
     'positivo. Non va preso il modulo del coseno, perché si perderebbe il segno fisico del lavoro.',
 94: 'Nell’emissione α il nucleo perde quattro nucleoni e due protoni: (ΔA,ΔZ)=(−4,−2). Nella β⁻ un neutrone '
     'diventa protone con elettrone e antineutrino emessi: (0,+1). Sommando le due variazioni, '
     '(A_f−A_i,Z_f−Z_i)=(−4,−1). È un bilancio di numeri nucleari per la sequenza assegnata, non una prova '
     'che qualsiasi isotopo possa energeticamente compierla. L’elettrone β non era un elettrone orbitale '
     'iniziale.',
 95: 'Lo stimolo SVG completo conferma due rami identici da 4 Ω+4 Ω tra 8 V e 0 V, con collegamento fra i '
     'punti medi. Per simmetria e unicità della soluzione passiva si ha V_M=V_N. Si può provarlo senza '
     'ignorare il nuovo resistore: (V_M−8)/4+V_M/4+(V_M−V_N)/2=0 e la stessa equazione scambiando M,N. '
     'Sottraendo segue (3/2)(V_M−V_N)=0, dunque entrambi valgono 4 V. La corrente nel resistore da 2 Ω è '
     '(4−4)/2=0 A. Gli altri rami conducono 1 A ciascuno: non è assenza di corrente nell’intero circuito.',
 96: 'La derivata della componente della velocità è la corrispondente componente dell’accelerazione '
     'istantanea: a_x=dv_x/dt. La risposta nominale è accelerazione. L’area sotto v_x(t) darebbe invece lo '
     'spostamento e la pendenza della posizione darebbe la velocità; non si sostituiscono questi '
     'significati.',
 97: 'La descrizione è l’esperimento di Torricelli. All’equilibrio p_atm=p_superiore+ρgh; nel modello del '
     'vuoto torricelliano si trascura la pressione superiore e si ricava l’atmosferica dalla colonna di '
     'mercurio. Il nome richiesto non è Pascal o Archimede. Non si afferma che ogni spazio sopra il mercurio '
     'reale sia a pressione esattamente nulla.',
 98: 'Il nome è convezione. L’energia è trasportata anche dal moto di porzioni del fluido, naturale o '
     'forzato; la conduzione descrive invece il trasporto microscopico senza moto macroscopico netto '
     'richiesto, e l’irraggiamento quello elettromagnetico. Non occorre chiamare turbolento ogni moto '
     'convettivo.',
 99: 'L’esperimento è associato a Hans Christian Ørsted, accettando la traslitterazione Oersted. La corrente '
     'nel filo produce un campo magnetico che esercita un momento sull’ago; la deviazione non dimostra che '
     'il filo porti un monopolo magnetico. Si identifica lo scienziato, senza assegnare un numero o '
     'richiedere una formula non presente nel prompt.',
 100: 'La regione a frequenze immediatamente maggiori del violetto visibile è l’ultravioletto. Nel vuoto '
      'frequenza maggiore significa lunghezza d’onda minore a c costante. Infrarosso si trova dal lato delle '
      'frequenze minori del rosso; raggi X e gamma sono regioni ancora più alte, non quella immediatamente '
      'successiva richiesta.',
 101: 'Il completamento è elastica. Per una molla ideale lineare, integrando la forza di richiamo −kx dallo '
      'zero di deformazione si ottiene U_el=kx²/2 con zero convenzionale in x=0. È non negativa per k>0, sia '
      'in allungamento sia in compressione, ed è energia in joule; non è una forza kx o una potenza.',
 102: 'Il regime è laminare. La definizione riguarda la struttura ordinata del moto e l’assenza del '
      'rimescolamento irregolare della turbolenza, non l’assenza di viscosità. Non implica velocità uguale '
      'ovunque: un profilo di Poiseuille è laminare pur avendo un gradiente trasversale.',
 103: 'L’unità è il kelvin, simbolo K, senza simbolo di grado. In pV=nRT la temperatura deve essere '
      'assoluta; non si inserisce una lettura Celsius al posto di T. Una differenza di un kelvin ha la '
      'stessa ampiezza di un grado Celsius, ma questo non rende intercambiabili i valori assoluti nelle '
      'proporzioni.',
 104: 'Il rapporto definisce la capacità: C=Q/V, con Q>0 il modulo su una sola armatura e V>0 la differenza '
      'di potenziale fra le due armature. L’unità è il farad=C/V. Non si sommano i moduli di entrambe le '
      'armature, che darebbero 2Q, e non si usa la carica netta del condensatore ideale, che può essere zero '
      'pur con capacità non nulla.',
 105: 'Il nome è effetto Doppler. La componente radiale del moto relativo modifica la frequenza ricevuta '
      'rispetto a quella emessa secondo il modello di propagazione pertinente. Non è una modifica dovuta '
      'soltanto alla distanza in una situazione statica, né implica che la velocità dell’onda nel mezzo '
      'cambi. Il prompt richiede il nome, non una formula classica valida universalmente anche per onde '
      'elettromagnetiche relativistiche.'}
ASSUMPTIONS={75: 'Lastre dello stesso materiale con area/conducibilità positive costanti, stessa differenza termica '
     'positiva, conduzione 1D stazionaria; rapporto non definito a ΔT=0.',
 76: 'Millilitro=10⁻⁶ m³:250 mL=1/4000 m³ esatto, nessun arrotondamento o conversione lineare implicita.',
 77: 'Condensatore piano in vuoto, bordo trascurato; geometrie positive, capacità dipende da '
     'area/separazione, non dal vincolo Q/V.',
 78: 'Manometro in equilibrio, dislivello verticale e stesso liquido; lato gas più basso implica '
     'sovrapressione positiva.',
 79: 'Raggi confinati nel piano normale allo spigolo; due riflessioni sulle facce perpendicolari; vettore '
     'finale opposto, non necessariamente stessa retta spaziale.',
 80: 'Asta di massa trascurabile, coordinate e masse positive assegnate; pesatura per massa totale 4 kg.',
 81: 'Gas ideale monoatomico in quantità fissa, T positiva costante, solo lavoro di frontiera positivo per '
     'gas, quasi statico; ΔU=0,Q=W>0.',
 82: 'Serie inizialmente scarica con nodo interno neutro isolato; stessa carica in modulo su una sola '
     'armatura di ciascuno, non carica netta o doppia.',
 83: 'Equilibrio galleggiante con solo peso e spinta; densità positive, corpo meno denso; percentuale di '
     'volume emerso, non altezza.',
 84: 'Partenza simultanea, stesso cammino nel vuoto; stessa c non stessa frequenza o lunghezza d’onda.',
 85: 'Cabina trasla senza rotazione, entrambi corpi fermi nella cabina e stessa gravità; sostegni '
     'proporzionali alla massa; aria trascurata.',
 86: '4 g=4/1000 kg, trasformazione completa alla temperatura di transizione, solo calore latente con segno '
     'negativo per vapore; chiesto modulo positivo.',
 87: 'q>0,m>0,E costante non nullo, partenza da ferma, solo forza elettrica e regime non relativistico entro '
     'zona uniforme.',
 88: 'Gocce sferiche a interfaccia singola, γ positiva comune, raggi positivi; salto inverso del raggio, non '
     'del quadrato.',
 89: 'Due fattori 7/10 in successione, intensità iniziale positiva, fascio diretto e riflessioni multiple '
     'trascurate;49%=49/100, non 49 puro.',
 90: 'Corpo fermo, sola spinta 3 N, attrito statico disponibile 7 N; forza effettiva 3 N opposta, nonmassimo '
     'automatico.',
 91: '20 spire concordi, variazione 3mWb per singola spira e durata 1/10 s; modulo della media, non media '
     'dei moduli in generale.',
 92: 'Tubo aperto lungo verticale, bagnamento con 0≤θ<90°, gravità e serbatoio stessa atmosfera; risalita '
     'finita positiva.',
 93: 'Prodotto scalare con cos 120°=−1/2; forza costante e spostamento orientato; lavoro negativo ammesso.',
 94: 'Bilancio α poiβ⁻ con accessibilità energetica assunta; nucleoni conservati dalβ, Z aumenta 1; non '
     'dimostrazione della catena energetica.',
 95: 'Rete resistiva passiva a due rami uguali, quattro 4 Ω, ponte 2 Ω; KCL ai nodi medi 4V verifica '
     'corrente centrale 0 anche a ponte collegato.',
 96: 'Componente di accelerazione istantanea come derivata corrispondente di v; tangente diversa dalla '
     'secante media.',
 97: 'Torricelli, pressione residua superiore trascurata solo nell’ideale barometrico; non una forza '
     'aspirante autonoma.',
 98: 'Convezione trasporta energia con moto macroscopico del fluido; non richiede necessariamente '
     'turbolenza.',
 99: 'Ørsted/Oersted: corrente nel filo produce campo magnetico che si somma al preesistente, orientando '
     'ago.',
 100: 'Ultravioletto oltrevioletto verso frequenze maggiori; λ nel vuoto minore, nessun confine di colore '
      'numerico universale.',
 101: 'Molla lineare ideale, k positiva, riferimento allo stato naturale; U=kx²/2 e F=−kx; stessa U per '
      'allungamento e compressione opposti.',
 102: 'Laminare significa moto ordinato nel contesto, non assenza di viscosità o velocità uniforme fra '
      'strati.',
 103: 'Kelvin, simbolo K, per temperatura assoluta; offset Celsius distinto dalle differenze termiche.',
 104: 'Capacità Q/V di una sola armatura con quantità positive; farad=C/V, non la carica netta nulla della '
      'coppia.',
 105: 'Doppler: frequenza ricevuta cambia per moto radiale relativo; chiesto il nome, non una formula '
      'universale.'}
DISTRACTORS={75: 'Alternative lette individualmente. Raddoppiare la potenza confonderebbe lo spessore con l’area. Il '
     'risultato non resta uguale se il gradiente si dimezza a ΔT fissata. Non si annulla: tutti i parametri '
     'e la differenza di temperatura sono positivi e finiti.',
 76: 'Alternative lette individualmente. 1/4 m³ corrisponde a 250 litri, non 250 millilitri. 1/400 m³ è '
     'dieci volte il volume assegnato. Il prefisso milli riguarda il litro e non autorizza a trattare un '
     'millilitro come un millimetro cubo.',
 77: 'Alternative lette individualmente. Sei moltiplicherebbe anche per la distanza, che invece sta al '
     'denominatore. Tre omette la variazione della separazione; un mezzo omette quella dell’area. 2/3 è il '
     'rapporto inverso rispetto a quello richiesto.',
 78: 'Alternative lette individualmente. −400 Pa invertirebbe il confronto indicato dai livelli. 40000 Pa '
     'userebbe 5 come numero di metri invece che centimetri. Il valore trovato è una differenza di pressioni '
     'e non la pressione assoluta del gas.',
 79: 'Alternative lette individualmente. 90° è l’angolo fra gli specchi, non il risultato del doppio '
     'cambiamento delle componenti. 0° indicherebbe vettori concordi. Il vincolo nel piano è essenziale: una '
     'componente fuori dal piano non verrebbe invertita da queste due riflessioni.',
 80: 'Alternative lette individualmente. 20 cm sarebbe la media semplice delle coordinate senza pesi. 120 '
     'copia il valore numerico del numeratore in kg·cm senza dividere per la massa totale. La massa '
     'trascurabile dell’asta evita un ulteriore contributo distribuito.',
 81: 'Alternative lette individualmente. Q=0 descriverebbe un’adiabatica e non segue dalla temperatura '
     'costante. Il segno opposto Q=−W usa un’altra convenzione per il lavoro senza cambiarne il significato '
     'nel prompt. Nessuna variazione di U non significa assenza di calore e lavoro.',
 82: 'Alternative lette individualmente. 108 μC userebbe la capacità 9 μF del parallelo. 36 μC e 72 μC '
     'assegnerebbero tutti i 12 V a un singolo condensatore anziché dividere la tensione della serie. Carica '
     'uguale in modulo non impone tensioni individuali uguali quando le capacità differiscono.',
 83: 'Alternative lette individualmente. 75% è la frazione immersa, non quella richiesta. Il rapporto '
     'inverso 4/3 supererebbe il volume totale e non descrive questo equilibrio. La frazione riguarda volumi '
     'e non una lunghezza verticale se la forma del corpo non è assegnata.',
 84: 'Alternative lette individualmente. Una frequenza maggiore non rende più veloce la propagazione nel '
     'vuoto. Un mezzo materiale potrebbe introdurre dispersione, ma non è presente qui. La luce non richiede '
     'un mezzo materiale per propagarsi.',
 85: 'Alternative lette individualmente. 48 N copierebbe la forza sul primo corpo senza considerare la '
     'diversa massa. Usare 6 g ignorerebbe l’informazione fornita dal dinamometro nella cabina accelerata. '
     'La bilancia indica una forza di contatto, non direttamente una massa.',
 86: 'Alternative lette individualmente. Usare 4 come numero di chilogrammi darebbe un risultato mille volte '
     'maggiore. Per il vapore il calore scambiato ha segno negativo se entrante è positivo; il modulo '
     'chiesto è invece positivo. Il calore latente specifico in J/kg va moltiplicato per una massa, non per '
     'una differenza di temperatura.',
 87: 'Alternative lette individualmente. Una velocità iniziale nulla non cancella una forza non nulla. Il '
     'moto circolare richiederebbe una forza che cambi direzione lungo il percorso, assente qui. Il verso '
     'opposto sarebbe quello dell’accelerazione di una carica negativa nel medesimo campo.',
 88: 'Alternative lette individualmente. Un terzo usa proporzionalità diretta col raggio invece che inversa. '
     'Nove introdurrebbe un quadrato non presente nella legge per il salto di pressione. Lo stesso gas non '
     'rende uguali i due salti se cambiano i raggi.',
 89: 'Alternative lette individualmente. Sommare le due percentuali trasmesse non descrive due strati in '
     'sequenza. Sottrarre due volte 30 punti percentuali darebbe 40%, ma ogni perdita è riferita '
     'all’intensità che entra nello strato corrispondente. 70% ignora il secondo strato.',
 90: 'Alternative lette individualmente. 7 N è il massimo disponibile, non il valore necessario in questa '
     'prova. Zero lascerebbe una risultante di 3 N e contraddirebbe il corpo fermo. Non si determina il '
     'verso dal segno della velocità, che qui è nulla, ma dalla tendenza provocata dalla spinta.',
 91: 'Alternative lette individualmente. 0,030 V omette le 20 spire. 60 V userebbe 3 mWb come 0,3 Wb, cento '
     'volte il flusso assegnato. Una variazione per spira non va confusa con una variazione già moltiplicata '
     'per N. Il modulo medio non specifica come varia istante per istante la fem.',
 92: 'Alternative lette individualmente. Una depressione corrisponderebbe al caso non bagnante con cosθ '
     'negativo. L’uguaglianza dei livelli non descrive il menisco curvo di questo tubo sottile. La gravità '
     'si oppone alla salita e ne limita l’altezza, ma non elimina la forza superficiale.',
 93: 'Alternative lette individualmente. +10 J perderebbe il segno della proiezione. 20 J tratterebbe forza '
     'e spostamento come concordi. La parte perpendicolare della forza non contribuisce al lavoro di questo '
     'spostamento.',
 94: 'Alternative lette individualmente. ΔZ=−3 attribuirebbe al β⁻ la diminuzione di Z invece dell’aumento. '
     'L’elettrone non è un nucleone e non sottrae un’unità ad A. Il solo conteggio conserva le grandezze '
     'nucleari ma non dimostra l’accessibilità energetica: qui è un’ipotesi del processo assegnato.',
 95: 'Alternative lette individualmente. La presenza di un resistore non obbliga a una corrente non nulla: '
     'serve una differenza di potenziale. Usare 8 V ai suoi capi confonderebbe M,N con A,B. Il bilanciamento '
     'dipende dalle uguaglianze dei rapporti delle resistenze, non dall’assenza del ramo centrale.',
 96: 'Alternative lette individualmente. L’area sotto il grafico di velocità riguarda lo spostamento. Una '
     'pendenza su un intervallo finito dà un’accelerazione media, mentre la tangente definisce il valore '
     'istantaneo. Per forza o quantità di moto servirebbe anche la massa.',
 97: 'Alternative lette individualmente. Il nome non è deciso soltanto dalla presenza di un fluido: conta la '
     'colonna barometrica con vaschetta esposta all’atmosfera. Ohm e Oersted riguardano altri fenomeni '
     'elettrici o magnetici; Snell l’ottica e Hooke l’elasticità.',
 98: 'Alternative lette individualmente. La conduzione descrive trasferimento senza questo moto macroscopico '
     'di porzioni di materia. L’irraggiamento è trasferimento tramite radiazione elettromagnetica. Una '
     'trasformazione di fase può avvenire o meno: non è la definizione del meccanismo chiesto.',
 99: 'Alternative lette individualmente. Non è un esperimento barometrico o di rifrazione. Una bussola '
     'risponde al campo magnetico risultante e non misura direttamente la resistenza elettrica del filo. Il '
     'nome dello scienziato identifica questa osservazione storica specifica.',
 100: 'Alternative lette individualmente. Radio e microonde appartengono a frequenze più basse del visibile. '
      'L’infrasuono è una classificazione di onde sonore, non una banda elettromagnetica. Non occorre '
      'assegnare un confine numerico esatto al colore per riconoscere il verso della classificazione.',
 101: 'Alternative lette individualmente. L’energia cinetica dipenderebbe dalla velocità e dalla massa. La '
      'forma assegnata non descrive necessariamente un campo gravitazionale o elettrico. Un’altra scelta di '
      'zero può aggiungere una costante, ma non cambia le differenze o la forza della molla.',
 102: 'Alternative lette individualmente. Il regime turbolento è proprio quello da cui il testo lo '
      'distingue. Una velocità diversa da zero non rende da sola il moto turbolento. La classificazione del '
      'regime non determina automaticamente il valore della viscosità.',
 103: 'Alternative lette individualmente. Pascal misura pressione e joule energia. Usare una lettura Celsius '
      'al posto della temperatura assoluta non è una semplice scelta di prefisso. Il nome kelvin non '
      'richiede il simbolo di grado davanti a K.',
 104: 'Alternative lette individualmente. La resistenza è un rapporto V/I e la conduttanza il reciproco I/V, '
      'in un contesto elettrico diverso. Una carica accumulata non è una corrente se manca l’informazione '
      'temporale. Il flusso magnetico non è definito dal rapporto Q/V.',
 105: 'Alternative lette individualmente. L’interferenza riguarda la sovrapposizione di contributi; il '
      'fotoelettrico lo scambio di energia con la materia. La capillarità è un fenomeno interfacciale e non '
      'un cambiamento della frequenza ricevuta per moto radiale.'}
CONCEPTUAL={75: 'Si dimezza',
 81: 'Q=W>0 e ΔU=0',
 84: 'Arrivano insieme',
 87: 'Rettilineo uniformemente accelerato nel verso del campo',
 92: 'Il liquido sale sopra il livello del serbatoio',
 94: '(−4, −1)',
 96: 'Accelerazione',
 97: 'Torricelli',
 98: 'Convezione',
 99: 'Oersted',
 100: 'Ultravioletto',
 101: 'Elastica',
 102: 'Laminare',
 103: 'Kelvin',
 104: 'Capacità elettrica',
 105: 'Effetto Doppler'}
