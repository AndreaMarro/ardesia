# Primaria indipendente C6 B: esame 03, 31 enunciati

Derivata prima di qualsiasi lettura di opzioni, chiavi, soluzioni, moduli autore o candidati C6 B. Fonte Git immutabile: `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C6.json`. SHA del file originale: `3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c`. I soli campi estratti sono id, prompt, promptBlocks figurativi e provenienza; le due figure sono stimoli della domanda, lette integralmente in XML. Le conoscenze generali C1–C5 e le precedenti revisioni sono dichiarate; non conosco esposizioni a chiavi C6. La primaria delle mie future A44 resta chiusa. Questa preparazione non accredita alcuna domanda, candidata o pubblicazione.

## C6-Q075 — Conduzione attraverso la lastra

Enunciato originale: Due lastre piane dello stesso materiale hanno stessa area e stesse temperature imposte alle due facce opposte. In conduzione stazionaria, quale effetto produce raddoppiare lo spessore rispetto alla prima lastra?

Nel modello di Fourier, omogeneo e stazionario con conducibilità k>0 e area A>0, la potenza orientata è P=kA(T_1−T_2)/s. A parità di estremi e materiale, sostituire s con 2s produce P_2=P_1/2 e dimezza anche il modulo del gradiente e il flusso termico per unità di area. Il rapporto P_2/P_1=1/2 richiede T_1≠T_2: se le due facce hanno la stessa temperatura, entrambe le potenze sono zero e quel rapporto è 0/0. Non si dimezza necessariamente un calore totale se cambia anche la durata; nessuna durata è assegnata. La maggiore resistenza termica, raddoppiata, spiega il risultato senza calcolatrice.

## C6-Q076 — Conversione del volume

Enunciato originale: Qual è il volume in m³ di una soluzione di volume 250 mL?

Un millilitro è un centimetro cubo: 1 mL=(10⁻² m)³=10⁻⁶ m³. Pertanto 250 mL=250·10⁻⁶ m³=1/4000 m³=0,00025 m³. La conversione è cubica: non basta convertire una sola lunghezza. Il contenuto è una soluzione, ma non serve alcuna densità perché si converte lo stesso volume, senza mescolare o cambiare stato.

## C6-Q077 — Capacità geometrica

Enunciato originale: In un condensatore piano nel vuoto l’area di ogni armatura triplica e la distanza fra esse raddoppia. Trascurando gli effetti di bordo, quale rapporto C₂/C₁ si ottiene?

Per piastre estese nel vuoto, C=ε₀A/d con A,d>0. Allora C₂/C₁=(3A/(2d))/(A/d)=3/2. Si può moltiplicare il fattore tre dell’area per il fattore un mezzo della distanza. Non occorre assegnare Q o V, né sapere se il generatore resta collegato: la capacità nel modello geometrico dipende da area, distanza e permittività. Gli effetti di bordo sono esplicitamente esclusi.

## C6-Q078 — Segno del manometro

Enunciato originale: Un manometro a U con liquido di densità 800 kg/m³ ha una differenza verticale dei livelli di 5,0 cm. Un ramo è aperto all’aria e il liquido nel ramo collegato al gas ha livello più basso. Con g = 10 m/s², quanto vale pgas − patm?

Allo stesso livello nel liquido fermo la pressione è uguale nei due rami. Il gas deprime il suo livello, quindi la sua pressione supera quella atmosferica: p_gas−p_atm=+ρgΔh. Con Δh=5/100 m, si ha 800·10·5/100=400 Pa. Il segno è positivo; la pressione assoluta del gas richiederebbe di aggiungere p_atm e non è richiesta. La differenza è verticale, non la lunghezza di un tubo inclinato.

## C6-Q079 — Due riflessioni perpendicolari

Enunciato originale: Nella sezione di due specchi perpendicolari un raggio incontra prima la faccia verticale e poi quella orizzontale. Il raggio resta nel piano della sezione. Qual è l’angolo tra il suo vettore direzione iniziale e quello dopo la seconda riflessione?

La figura-stimolo XML è stata letta per intero: il raggio verde arriva alla parete verticale, il rosso procede verso il secondo specchio orizzontale. Nella sezione, rappresento la direzione iniziale con (u,v) non nullo. La prima riflessione cambia soltanto la componente normale alla parete verticale: (−u,v). La seconda cambia quella normale al piano orizzontale: (−u,−v). Il prodotto scalare con la direzione iniziale è −(u²+v²), quindi l’angolo dei due vettori direzione è 180°. I raggi sono antiparalleli, senza essere necessariamente la stessa retta. Questa conclusione usa il raggio nel piano della sezione: una componente lungo lo spigolo tridimensionale non verrebbe invertita.

## C6-Q080 — Centro di massa

Enunciato originale: Su un’asta di massa trascurabile si trovano 1 kg a x = 0 e 3 kg a x = 40 cm. Qual è la coordinata del centro di massa?

Con asta di massa trascurabile il denominatore è 1+3=4 kg. Il primo momento è (1 kg)·0+(3 kg)·40 cm=120 kg·cm; x_CM=120/4=30 cm=3/10 m. Il punto è fra le masse e più vicino a quella da 3 kg, controllo immediato. La media semplice 20 cm varrebbe per due masse uguali. L’origine è quella assegnata, non il centro dell’asta.

## C6-Q081 — Isoterma e primo principio

Enunciato originale: Una quantità fissata di gas ideale monoatomico subisce un’espansione isoterma quasi statica. Quale uguaglianza vale usando W come lavoro positivo svolto dal gas?

Per una quantità fissata di gas ideale monoatomico U=3nRT/2 dipende soltanto da T. L’isoterma dà ΔU=0. Con W positivo svolto dal gas e Q positivo entrante, il primo principio è ΔU=Q−W; dunque Q=W. In un’espansione quasi statica con lavoro pV positivo, entrano calore ed esce lavoro della stessa quantità. Q e W non sono entrambi nulli soltanto perché T resta costante. Se il percorso è anche reversibile, W=nRT ln(V_f/V_i)>0; questa formula aggiuntiva non è necessaria all’uguaglianza richiesta e non sostituisce i limiti del modello.

## C6-Q082 — Serie dei condensatori

Enunciato originale: Due condensatori ideali da 3 µF e 6 µF, inizialmente scarichi, sono collegati in serie a 12 V. Quanto vale il modulo della carica su ciascun condensatore a regime?

L’iniziale neutralità del nodo interno in serie impone moduli di carica uguali. La capacità equivalente è C_s=(3·6)/(3+6) μF=2 μF. Pertanto Q=C_sV=(2 μF)(12 V)=24 μC su ciascun condensatore. Controllo separato: V_3=24/3=8 V, V_6=24/6=4 V, e 8+4=12 V. Le capacità non si sommano come nel parallelo; la somma delle cariche positive delle due armature non è la carica richiesta su ciascun condensatore.

## C6-Q083 — Frazione emersa

Enunciato originale: Un solido omogeneo di densità 750 kg/m³ galleggia in un liquido di densità 1000 kg/m³. Quale percentuale del volume del solido emerge, trascurando la spinta dell’aria?

L’equilibrio verticale senza altre forze richiede ρ_l gV_imm=ρ_s gV_tot. Quindi V_imm/V_tot=750/1000=3/4. La frazione emersa è 1−3/4=1/4, ossia 25%. È il volume, non l’altezza per una forma generica: nessuna sezione uniforme è prescritta. La densità del corpo è minore di quella del liquido, condizione compatibile con il galleggiamento parziale. Si trascura esplicitamente la spinta dell’aria.

## C6-Q084 — Radio e visibile nel vuoto

Enunciato originale: Nel vuoto un impulso radio e un impulso di luce visibile lasciano insieme la stessa sorgente e percorrono lo stesso cammino. Quale previsione è corretta?

Nel modello del vuoto entrambe le perturbazioni elettromagnetiche si propagano con la stessa velocità c, indipendente dalla frequenza. Con emissione simultanea, stessa origine e identico cammino, i tempi di percorrenza sono uguali: arrivano insieme. Frequenza ed energia del singolo fotone differiscono, ma non producono qui un ritardo dispersivo. Non si estende questa conclusione a un mezzo materiale dispersivo, né a percorsi diversi.

## C6-Q085 — Peso apparente nella cabina

Enunciato originale: In una cabina in moto verticale un dinamometro sostiene un corpo da 4,0 kg e segna 48 N. Sul pavimento della stessa cabina una bilancia sostiene un secondo corpo da 6,0 kg. Entrambi restano fermi rispetto alla cabina. Trascurando la spinta dell’aria, quanto segna la bilancia in newton?

I due corpi hanno la stessa accelerazione verticale a della cabina rispetto a un riferimento inerziale. Per il corpo sostenuto dal dinamometro, T−m₁g=m₁a, quindi g+a=T/m₁=48/4=12 m/s². Per il corpo sul pavimento, N=m₂(g+a)=6·12=72 N. Non serve conoscere g numericamente: il rapporto delle letture è il rapporto delle masse, 6/4. Il dato positivo implica che il contatto può essere mantenuto; non si aggiunge nuovamente il peso a 72 N, che già rappresenta la forza di sostegno.

## C6-Q086 — Condensazione completa

Enunciato originale: Una massa di 4,0 g di vapore puro condensa interamente alla temperatura di transizione. Il calore latente specifico vale 2,0 × 10⁶ J/kg. Qual è il modulo dell’energia ceduta?

La massa si converte prima: 4 g=4/1000 kg. Il modulo del calore latente ceduto è mL=(4/1000)(2·10⁶) J=8000 J=8 kJ. Dal punto di vista del vapore condensante Q=−8000 J, ma il prompt chiede il modulo positivo dell’energia ceduta. Nessun mcΔT si somma, perché il processo avviene alla temperatura di transizione e non include raffreddamento successivo.

## C6-Q087 — Moto in campo elettrico uniforme

Enunciato originale: Una carica positiva, inizialmente ferma, viene lasciata in un campo elettrico uniforme nella regione centrale tra piastre. Agisce soltanto la forza elettrica. Quale moto compie finché rimane nella regione uniforme?

Con q>0, la forza qE è costante e parallela al campo esterno uniforme. Nel modello classico a massa costante, a=qE/m è costante; partendo da ferma la carica si muove lungo la retta parallela al campo, con v=at e spostamento at²/2. Non è moto circolare: quello richiederebbe una forza sempre perpendicolare alla velocità. La conclusione vale soltanto finché rimane nella regione uniforme e nel regime non relativistico; nessun moto trasversale iniziale è dato.

## C6-Q088 — Salti di pressione nelle gocce

Enunciato originale: Due gocce sferiche dello stesso liquido sono nello stesso gas. La seconda ha raggio un terzo della prima. Con uguale tensione superficiale, quanto vale il rapporto fra i salti di pressione interno–esterno, secondo/primo?

Una goccia liquida ha una sola interfaccia con il gas, quindi Δp=2γ/r per equilibrio sferico con tensione positiva. A γ comune e r₂=r₁/3, Δp₂/Δp₁=r₁/r₂=3. L’esterno comune rende chiaro il riferimento del salto, ma il rapporto è fra differenze interno−esterno, non fra pressioni assolute. Il fattore 4γ/r sarebbe quello di una bolla di film con due interfacce, non di queste gocce.

## C6-Q089 — Due trasmissioni in successione

Enunciato originale: Un primo strato omogeneo trasmette il 70% di un fascio monocromatico diretto. Un secondo strato identico è posto subito dopo. Trascurando altri effetti, quale percentuale dell’intensità incidente all’origine esce dal secondo strato?

Ogni strato moltiplica l’intensità che riceve per 7/10. Il secondo riceve già I₁=(7/10)I₀, così I₂=(7/10)²I₀=49/100 I₀. Esce il 49% dell’intensità originaria. Sommare due perdite del 30% rispetto alla stessa I₀ darebbe il 40% e sarebbe scorretto: la seconda perdita si applica a I₁. Sono esclusi altri effetti, come riflessioni multiple, sorgenti interne o saturazione.

## C6-Q090 — Attrito statico effettivo

Enunciato originale: Un corpo è fermo su un piano orizzontale e riceve una sola spinta orizzontale di 3 N. L’attrito statico massimo disponibile è 7 N e il corpo rimane fermo. Quanto vale il modulo dell’attrito effettivo?

Il corpo resta fermo, quindi la somma delle forze orizzontali è zero. L’attrito ha modulo 3 N, opposto all’unica spinta da 3 N. Il valore 7 N è un limite superiore disponibile, non una forza che agisce sempre al massimo. La verifica 3≤7 conferma che l’equilibrio è possibile. Non uso la legge dell’attrito dinamico per un corpo che non scivola.

## C6-Q091 — Legge media di Faraday

Enunciato originale: In una bobina di 20 spire uguali il flusso concatenato con ciascuna spira aumenta di 3 mWb in 0,10 s. Qual è il modulo della fem media indotta?

La variazione assegnata è per spira, quindi il flusso concatenato totale cambia di NΔΦ. Il modulo della fem media è N|ΔΦ|/Δt=20·(3/1000)/(1/10) V=3/5 V=0,6 V. Le tre cifre mWb si convertono in weber prima del prodotto. La fem media con segno dipende dal verso scelto; il modulo richiesto è positivo. Non si confonde il flusso di una sola spira con quello già concatenato all’intera bobina.

## C6-Q092 — Ascesa capillare

Enunciato originale: In un capillare cilindrico verticale, aperto in alto, abbastanza lungo e molto sottile, un liquido bagna bene la parete con angolo di contatto minore di 90°. In equilibrio con un ampio serbatoio aperto, quale situazione si osserva normalmente, in presenza di gravità?

Per parete bagnante con θ<90°, la componente verticale della tensione superficiale lungo il bordo è rivolta verso l’alto. Nel modello cilindrico, trascurando il volume del menisco, 2πrγcosθ=ρgπr²h, da cui h=2γcosθ/(ρgr)>0. Il livello del liquido nel capillare sta sopra quello dell’ampio serbatoio e il menisco è concavo nel caso bagnante usuale. La colonna è finita per r,ρ,g positivi; il tubo abbastanza lungo evita il limite imposto dal bordo superiore. Non si dice che il liquido sale indefinitamente o supera ogni altezza.

## C6-Q093 — Lavoro con angolo ottuso

Enunciato originale: Una forza costante di modulo 10 N forma 120° con uno spostamento di 2,0 m. Qual è il suo lavoro? Usa cos 120° = −0,5.

Per forza costante W=Fs cosθ. Sostituendo i dati con unità, W=(10 N)(2 m)(−1/2)=−10 J. Il segno negativo indica una componente della forza opposta allo spostamento; il modulo della forza resta positivo. Non va preso il modulo del coseno, perché si perderebbe il segno fisico del lavoro.

## C6-Q094 — Bilancio alfa seguito da beta meno

Enunciato originale: Un nucleo emette prima una particella α e poi un elettrone tramite β⁻. Quali sono le variazioni complessive (Afinale − Ainiziale, Zfinale − Ziniziale)?

Nell’emissione α il nucleo perde quattro nucleoni e due protoni: (ΔA,ΔZ)=(−4,−2). Nella β⁻ un neutrone diventa protone con elettrone e antineutrino emessi: (0,+1). Sommando le due variazioni, (A_f−A_i,Z_f−Z_i)=(−4,−1). È un bilancio di numeri nucleari per la sequenza assegnata, non una prova che qualsiasi isotopo possa energeticamente compierla. L’elettrone β non era un elettrone orbitale iniziale.

## C6-Q095 — Ponte equilibrato

Enunciato originale: Tra i morsetti A a 8 V e B a 0 V sono collegati due rami identici in parallelo. Ogni ramo contiene due resistori uguali da 4 Ω in serie. Si inserisce un resistore da 2 Ω fra i punti medi M e N. Qual è il modulo della corrente in questo nuovo collegamento, in regime stazionario?

Lo stimolo SVG completo conferma due rami identici da 4 Ω+4 Ω tra 8 V e 0 V, con collegamento fra i punti medi. Per simmetria e unicità della soluzione passiva si ha V_M=V_N. Si può provarlo senza ignorare il nuovo resistore: (V_M−8)/4+V_M/4+(V_M−V_N)/2=0 e la stessa equazione scambiando M,N. Sottraendo segue (3/2)(V_M−V_N)=0, dunque entrambi valgono 4 V. La corrente nel resistore da 2 Ω è (4−4)/2=0 A. Gli altri rami conducono 1 A ciascuno: non è assenza di corrente nell’intero circuito.

## C6-Q096 — Pendenza di v(t)

Enunciato originale: La pendenza della tangente al grafico di una componente di velocità in funzione del tempo dà la corrispondente componente dell’____ istantanea.

La derivata della componente della velocità è la corrispondente componente dell’accelerazione istantanea: a_x=dv_x/dt. La risposta nominale è accelerazione. L’area sotto v_x(t) darebbe invece lo spostamento e la pendenza della posizione darebbe la velocità; non si sostituiscono questi significati.

## C6-Q097 — Colonna barometrica storica

Enunciato originale: L’esperimento classico che ricava la pressione atmosferica dall’altezza di una colonna di mercurio chiusa superiormente e in equilibrio porta il nome di ____.

La descrizione è l’esperimento di Torricelli. All’equilibrio p_atm=p_superiore+ρgh; nel modello del vuoto torricelliano si trascura la pressione superiore e si ricava l’atmosferica dalla colonna di mercurio. Il nome richiesto non è Pascal o Archimede. Non si afferma che ogni spazio sopra il mercurio reale sia a pressione esattamente nulla.

## C6-Q098 — Trasporto termico con moto macroscopico

Enunciato originale: Il trasporto di energia termica accompagnato dal moto macroscopico di porzioni di un fluido si chiama ____.

Il nome è convezione. L’energia è trasportata anche dal moto di porzioni del fluido, naturale o forzato; la conduzione descrive invece il trasporto microscopico senza moto macroscopico netto richiesto, e l’irraggiamento quello elettromagnetico. Non occorre chiamare turbolento ogni moto convettivo.

## C6-Q099 — Bussola vicina al filo

Enunciato originale: L’esperimento storico che mostra la deviazione di una bussola vicina a un filo percorso da corrente è associato al fisico ____.

L’esperimento è associato a Hans Christian Ørsted, accettando la traslitterazione Oersted. La corrente nel filo produce un campo magnetico che esercita un momento sull’ago; la deviazione non dimostra che il filo porti un monopolo magnetico. Si identifica lo scienziato, senza assegnare un numero o richiedere una formula non presente nel prompt.

## C6-Q100 — Oltre il violetto

Enunciato originale: Procedendo dal visibile verso frequenze maggiori, la regione che segue il violetto prende il nome di ____.

La regione a frequenze immediatamente maggiori del violetto visibile è l’ultravioletto. Nel vuoto frequenza maggiore significa lunghezza d’onda minore a c costante. Infrarosso si trova dal lato delle frequenze minori del rosso; raggi X e gamma sono regioni ancora più alte, non quella immediatamente successiva richiesta.

## C6-Q101 — Energia della molla

Enunciato originale: Per una molla ideale l’espressione kx²/2 rappresenta l’energia potenziale ____.

Il completamento è elastica. Per una molla ideale lineare, integrando la forza di richiamo −kx dallo zero di deformazione si ottiene U_el=kx²/2 con zero convenzionale in x=0. È non negativa per k>0, sia in allungamento sia in compressione, ed è energia in joule; non è una forza kx o una potenza.

## C6-Q102 — Strati ordinati nel fluido

Enunciato originale: Il regime in cui strati di fluido scorrono ordinatamente senza il rimescolamento irregolare tipico della turbolenza è detto ____.

Il regime è laminare. La definizione riguarda la struttura ordinata del moto e l’assenza del rimescolamento irregolare della turbolenza, non l’assenza di viscosità. Non implica velocità uguale ovunque: un profilo di Poiseuille è laminare pur avendo un gradiente trasversale.

## C6-Q103 — Temperatura assoluta nel SI

Enunciato originale: Nell’equazione di stato dei gas ideali, nel SI, la temperatura assoluta si esprime in ____.

L’unità è il kelvin, simbolo K, senza simbolo di grado. In pV=nRT la temperatura deve essere assoluta; non si inserisce una lettura Celsius al posto di T. Una differenza di un kelvin ha la stessa ampiezza di un grado Celsius, ma questo non rende intercambiabili i valori assoluti nelle proporzioni.

## C6-Q104 — Definizione della capacità

Enunciato originale: Il rapporto tra la carica positiva su un’armatura e la differenza di potenziale positiva tra le armature definisce la ____ del condensatore.

Il rapporto definisce la capacità: C=Q/V, con Q>0 il modulo su una sola armatura e V>0 la differenza di potenziale fra le due armature. L’unità è il farad=C/V. Non si sommano i moduli di entrambe le armature, che darebbero 2Q, e non si usa la carica netta del condensatore ideale, che può essere zero pur con capacità non nulla.

## C6-Q105 — Frequenza e moto relativo

Enunciato originale: Il cambiamento di frequenza ricevuta dovuto al moto relativo lungo la linea sorgente–ricevitore è chiamato effetto ____.

Il nome è effetto Doppler. La componente radiale del moto relativo modifica la frequenza ricevuta rispetto a quella emessa secondo il modello di propagazione pertinente. Non è una modifica dovuta soltanto alla distanza in una situazione statica, né implica che la velocità dell’onda nel mezzo cambi. Il prompt richiede il nome, non una formula classica valida universalmente anche per onde elettromagnetiche relativistiche.
