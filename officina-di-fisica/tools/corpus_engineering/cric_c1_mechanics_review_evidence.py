"""Per-ID reading evidence; the original primary and its SHA remain separately frozen."""
PRIMARY_MANUAL={51: 'Appena prima dello scorrimento la trazione bilancia il massimo attrito statico: F_s,max=μ_s '
     'N. Quindi μ_s=18/60=3/10=0,30, puro. Non usare l’attrito dinamico di un corpo già in moto; '
     'il dato di soglia è ciò che identifica μ_s.',
 52: 'Con piano orizzontale, nessun tiro e nessuna accelerazione verticale N=mg. Durante lo '
     'scivolamento F_k=μ_k mg opposta alla velocità: il modulo dell’accelerazione frenante è μ_k '
     'g=(1/5)(49/5)=49/25=1,96 m/s². Divisione manuale 9,8/5; il segno della componente dipende '
     'dal verso scelto, il modulo è positivo.',
 53: 'Il pacco non slitta e deve avere la stessa accelerazione verso destra del nastro. La sola '
     'forza orizzontale è l’attrito, dunque agisce verso destra. È statico, entro la soglia '
     'disponibile: si oppone alla tendenza di scorrimento relativo, non necessariamente alla '
     'velocità assoluta del pacco.',
 54: 'Legge puntiforme F=Gm₁m₂/r². Una massa per 4 e distanza per 2 danno F_B/F_A=4/2²=1: il '
     'modulo resta invariato. Sono due configurazioni con masse costanti dentro ciascuna; non una '
     'variazione della massa durante una dinamica non specificata.',
 55: 'La distanza dal centro passa daR aR+R=2 R. Per gravità esterna di una sfera g=GM/r², quindi '
     'g_B=8/4=2 m/s². Il quadrato usa il raggio dal centro, non l’altezza dalla superficie. '
     'Trascurata la rotazione del pianeta nel g gravitazionale assegnato.',
 56: 'Equilibrio assiale: kx=F. L’allungamento è 6/200 m=3/100 m=3 cm. La lunghezza caricata 14 cm '
     'comprende riposo più allungamento: ℓ₀14−3=11 cm. Non confondere deformazione con lunghezza '
     'totale; si usa il tratto ideale lineare della molla.',
 57: 'Per allungamento x≥0 la legge del modulo è F=kx. Pendenza ΔF/Δx=k, in N/m se x in m. Non è '
     'l’energia elastica: quella è l’area sotto il grafico e vale kx²/2. Il passaggio per origine '
     'esclude una forza iniziale nel modello assegnato.',
 58: 'Dopo l’inizio dello scivolamento relativo il regime è attrito radente dinamico, anche '
     'chiamato cinetico. Non è statico, che può agire senza scorrimento e si adatta entro un '
     'massimo. Qui non si chiede un coefficiente numerico né il rotolamento.',
 59: 'La componente elastica è F_x=−kx. Con k 80 N/m e x=−25/1000 m si ottiene F_x=+2 N, verso '
     'destra, opposta allo spostamento dalla posizione di riposo. Il modulo sarebbe 2 N ma il '
     'quesito richiede la componente con segno.',
 60: 'Ogni molla parallela dà modulo kx sulla traversa per il medesimo allungamento. Le forze '
     'concordi si sommano: F_tot=2 kx e k_eq=2 k. Non è la serie, nella quale si sommano le '
     'deformazioni alla stessa forza. Per x=0 tutte sono nulle, coerente col modello.',
 61: 'Il lavoro della forza costante è W=Fs cosθ. Con F 16 N,s 5 m e cos 60°=1/2: W 16·5/2=40 J. È '
     'la componente parallela allo spostamento a lavorare; non usare il seno o l’angolo dalla '
     'perpendicolare.',
 62: 'Il centro e la lunghezza del filo sono fissi, quindi lo spostamento istantaneo è tangente al '
     'cerchio e la tensione radiale. Il prodotto T·dr è zero in ogni istante e il lavoro totale è '
     'nullo. La forza può essere non nulla e produrre accelerazione centripeta senza cambiare la '
     'rapidità.',
 63: 'La forza frenante è tangenziale e sempre opposta allo spostamento del punto di applicazione '
     'materiale assegnato. W=∫−8 N ds=−8·6=−48 J. Il percorso complessivo 6 m non è uno '
     'spostamento vettoriale nullo dopo un giro; il lavoro resistente si accumula negativo.',
 64: 'Forza parallela concorde lineare: lavoro uguale area del trapezio F–s. Forza media '
     'spaziale(2+10)/2=6 N, moltiplicata per 0,40 m dà 2,4 J=12/5 J. Equivalentemente rettangolo '
     '0,8 J più triangolo 1,6 J. La media spaziale è valida perché F varia linearmente nello '
     'spazio, non per una supposizione sul tempo.',
 65: 'A massa costante K=mv²/2. Se la rapidità finale è 2 v_i, K_f=4 K_i. L’aumento richiesto '
     'rispetto all’inizio è ΔK=K_f−K_i=3 K_i, non 4 K_i; distinguere un aumento additivo dal '
     'fattore del valore finale.',
 66: 'Teorema lavoro–energia per il corpo: W_tot 18−6=12 J, quindi K_f=K_i+W_tot=5+12=17 J. Le '
     'altre forze hanno lavoro nullo come assegnato; il lavoro negativo non va sommato come modulo '
     'positivo.',
 67: 'Potenza istantanea della trazione P=F·v_app. Il punto va concorde alla forza:25 '
     'N·(4/5)m/s=20 W. Si usa la velocità del punto di applicazione, non un lavoro totale senza '
     'durata.',
 68: 'Il nome SI del lavoro è joule, simbolo J:1 J=1 N·m=1 kg·m²/s². Il prodotto vale per forza '
     'parallela a spostamento; il momento di una forza ha le stesse dimensioni ma si indica '
     'normalmente in N·m e non si identifica con un lavoro.',
 69: 'Le energie sono uguali e le potenze sono medie: P_A/P_B=(E/t_A)/(E/t_B)=t_B/t_A=3, perché '
     't_A=t_B/3. Il dispositivo più rapido trasferisce la stessa energia con potenza maggiore; '
     'nessuna ipotesi di potenza istantanea costante è necessaria.',
 70: 'All’inizio K=(1/2)·4·3²=18 J. Fino al primo arresto la sola forza che lavora è resistente: '
     'W=−6 s. Con K_f 0,−18 J=−6 N·s→s 3 m. Non estendere una legge frenante a una rapidità '
     'negativa dopo l’arresto.',
 71: 'Per una forza conservativa posizionale il lavoro fra due punti dipende solo dagli estremi e '
     'vale−ΔU. Su percorso chiuso gli estremi coincidono: ΔU 0 e W 0. Questo non afferma forza '
     'nulla lungo il percorso, solo integrale nullo.',
 72: 'In gravità uniforme ΔU=mgΔz. mg=(1/5)kg·10 m/s²=2 N; Δz=3 J/(2 N)=3/2 m=1,5 m, verso l’alto '
     'perché ΔU positivo. Il valore dello zero dell’energia potenziale non entra.',
 73: 'Nel medesimo tratto lineare U=kx²/2. Il rapporto delle deformazioni è 5/2 con i cm che si '
     'cancellano: U_B=(4/5)J·25/4=5 J. Non scala linearmente con x; non serve ricavare k per '
     'risolvere il rapporto.',
 74: 'Abbassare lo zero delle quote di 2 m aumenta di 2 m il valore di ciascuna z per lo stesso '
     'punto fisico; le differenze z_f−z_i restano uguali. Quindi ΔU=mgΔz per la stessa discesa non '
     'cambia ed è negativa. Cambiano entrambi i valori assoluti di U dello stesso termine costante '
     '2 mg, non il lavoro gravitazionale.',
 75: 'La diminuzione della K del blocco è 20−7=13 J. Se il piano resta fermo e non cambia altra '
     'energia meccanica del sistema, l’isolamento dà ΔU_int=+13 J. Il solo testo non specifica '
     'esplicitamente che il piano sia fermo: se può acquistare energia cinetica, il bilancio '
     'generale è ΔU_int=13 J−ΔK_piano−ΔU_meccanica_altra. Prima di giudicare una nuova candidata '
     'bisognerà verificare che escluda quei trasferimenti; non si ricava il riscaldamento 13 J dal '
     'solo aggettivo isolato senza il bilancio completo. Nella nuova candidata è stata letta '
     'esplicitamente l’assenza di altre variazioni macroscopiche: la condizione della primaria è '
     'dunque soddisfatta.',
 76: 'Parte da ferma e raggiunge entrambi i fondi alla stessa quota su piste lisce fisse: '
     'conservazione K+mgz dà v_f²=2 g(z_i−z_f). È uguale la rapidità finale, non necessariamente '
     'direzione della velocità,tempo o accelerazione lungo piste di forma diversa. Le reazioni '
     'normali non fanno lavoro sul vincolo fermo.',
 77: 'Conservazione meccanica: v_f²=v_i²−2 gΔz=25−2·10·4/5=9 m²/s². La rapidità è la radice '
     'positiva 3 m/s. Il radicando è positivo, quindi la quota è raggiungibile; non si sottrae '
     'direttamente una lunghezza da una velocità.',
 78: 'L’attrito dinamico sul piano fermo è non conservativo. In entrambi i tratti lo scorrimento '
     'trova una forza opposta alla velocità relativa: il lavoro totale su andata e ritorno è '
     'negativo,non zero. Non esiste un’unica U della posizione che riproduca quei lavori chiusi.',
 79: 'La rapidità invariata dà ΔK 0. Gravità compie−mgh=−3·10·2=−60 J e attrito−5 J; allora '
     '0=W_mot−60−5→W_mot=65 J. Equivalentemente il motore fornisce 60 J di potenziale e 5 J di '
     'dissipazione.',
 80: 'Prima ricavo la rapidità al fondo con energia: mg h=(1/2)mv², quindi v²=2 gh. Poi scrivo la '
     'risultante radiale verso il centro nel punto basso: T−mg=mv²/L, dunque T=mg+mv²/L=mg(1+2 '
     'h/L). La tensione non è il solo peso perché il corpo accelera radialmente. Il procedimento '
     'richiede filo teso durante il percorso; per rilascio da fermo con pendolo semplice senza '
     'altri sostegni il dislivello deve essere compatibile con quel vincolo (0≤h≤L,caso limite '
     'tensione iniziale nulla). Non applicare la formula a un arco inizialmente lasco. La nuova '
     'edizione delimita il ramo aperto 0<h<ℓ e dopo il rilascio ammette solo peso e tensione: non '
     'è presente lavoro della preparazione.',
 81: 'Impulso componente J_x=Δp_x=m(v_f−v_i)=(1/10)(−3−4)=−7/10 kg·m/s=−0,70 N·s. Il verso è '
     'negativo; il modulo sarebbe 0,70 ma non è la componente chiesta. La collisione cambia anche '
     'il verso della velocità.',
 82: 'Stesso carrello e stessa velocità iniziale,arresto finale: Δp è identico. Risultante media '
     'vettoriale F_med=Δp/Δt; raddoppiare il tempo dimezza il suo modulo. È il modulo della media '
     'netta,non necessariamente la media temporale del modulo di una forza con direzione '
     'variabile.',
 83: 'La molla scambia forze interne e la guida è liscia: quantità di moto orizzontale totale '
     'conservata,inizialmente nulla.4 kg·3 m/s+6 kg·v₂=0→v₂=−2 m/s. Le velocità non sono uguali in '
     'modulo con masse diverse; la molla può aumentare la K usando energia interna elastica.',
 84: 'Considero vassoio e massa cadente come sistema durante la presa. La guida liscia non '
     'fornisce impulso orizzontale e la massa cade senza velocità orizzontale. Momento iniziale '
     '1,5·2=3 kg·m/s; massa finale 2 kg→v_comune 3/2=1,5 m/s. Il termine peso da 0,5 kg nel testo '
     'va inteso come massa,poiché kg non è unità di forza. La K orizzontale non si conserva '
     'nell’aggancio. La nuova candidata usa esplicitamente una massa in chilogrammi, distinta '
     'dalla forza peso.',
 85: 'Nella meccanica classica K=p²/(2 m). A medesimo modulo di p non nullo,K è inversamente '
     'proporzionale alla massa: il corpo meno massiccio ha più energia cinetica. Se p fosse zero '
     'sarebbero entrambe nulle,ma il testo lo esclude.',
 86: 'Un urto con energia cinetica totale del sistema isolato uguale prima e dopo è elastico. '
     'Quantità di moto totale conservata da sola non distingue elastico da anelastico; anche '
     'l’urto anelastico conserva p in isolamento ma trasforma parte della K in altre forme.',
 87: 'Impulso medio−3 N·0,60 s=−1,8 N·s. p_f=p_i+J=2,5−1,8=+0,7 kg·m/s=7/10 kg·m/s. La quantità di '
     'moto diminuisce ma resta positiva; non si assume automaticamente inversione del moto.',
 88: 'Il sistema minimo sufficiente è la coppia di entrambe le biglie: le forze di contatto sono '
     'interne uguali/opposte,mentre il tavolo liscio e la gravità non danno impulso orizzontale. '
     'La p orizzontale totale si conserva; quella di una singola biglia in generale no. Anche un '
     'sistema più ampio adeguatamente isolato può conservarla,perciò la futura unicità delle '
     'alternative richiede lettura reale delle opzioni,non un’etichetta copiata.',
 89: 'Δv=(−2,+2)m/s. Con m 1/2 kg,Δp=(−1,+1)kg·m/s. Dividendo perΔt 1/2 s: F_med=(−2,+2)N. Il '
     'modulo è√(4+4)=2√2 N,esatto; non serve una radice decimale o il modulo della variazione '
     'delle rapidità,che sarebbe nullo.',
 90: 'La pendenza dp_x/dt della retta quantità-di-moto–tempo è la componente della risultante '
     'esterna sul corpo/sistema materiale chiuso. È costante e positiva nel caso descritto,con '
     'unità(kg·m/s)/s=N. Non è direttamente velocità o accelerazione; queste richiedono la massa e '
     'altre relazioni.',
 91: 'x_CM=(m₁x₁+m₂x₂)/(m₁+m₂)=(1·0+3·4/5)/4=3/5 m=0,60 m. È più vicino alla massa 3 kg,ma non '
     'coincide con la sua posizione. Il numeratore ha kg·m e il denominatore kg.',
 92: 'Il braccio è la distanza perpendicolare b dal perno alla retta d’azione della forza: '
     'b=r|sinθ|. Modulo del momento |τ|=Fb. r è utilizzabile da sola soltanto quando la forza è '
     'perpendicolare al raggio; una forza lungo il raggio ha braccio zero.',
 93: 'Momento modulo rF sin 30°=(2/5)m·15 N·1/2=3 N·m. Il braccio effettivo è 0,20 m. Il segno non '
     'è richiesto e non si deduce senza il verso del disegno; la grandezza non è un lavoro pur '
     'avendo le stesse dimensioni.',
 94: 'Due forze uguali opposte su rette distinte formano una coppia: risultante nulla e momento '
     'non nullo Fd,con d distanza fra rette. Per un corpo libero il centro di massa non '
     'accelera,mentre il momento modifica il moto rotatorio. Non si può concludere che il centro '
     'resti fermo se aveva già una velocità iniziale; rotazione pura da fermo è un caso,non '
     'un’ipotesi assegnata dal solo bilancio.',
 95: 'Trave leggera,appoggi agli estremi e forza 30 N dentro il segmento. Momenti rispetto '
     'all’appoggio sinistro: R_D·2 m−30 N·0,50 m=0,quindi R_D=15/2 N=7,5 N. La reazione sinistra '
     '22,5 N completa l’equilibrio verticale e entrambe sono verso l’alto,compatibili con il '
     'contatto.',
 96: 'Per il sistema dei tre carrelli la risultante esterna determina M_tot a_CM. Quindi '
     'a_CM=18/12=3/2 m/s² nel verso della risultante. Le forze interne non cambiano questo '
     'risultato per il centro di massa; i singoli carrelli possono avere accelerazioni diverse.',
 97: 'Il modello è corpo rigido: tutte le distanze tra punti materiali restano costanti. Questo '
     'non vieta la rotazione o la traslazione dell’intero corpo. È un’idealizzazione,non '
     'l’affermazione che un materiale reale non si deformi mai.',
 98: 'Per due poli O e O′,τ_O′=τ_O−(OO′)×F_ris. Con F_ris 0 eτ_O 0 segueτ_O′0,mentre la risultante '
     'resta zero. L’equilibrio non dipende dal nuovo polo fisso; non basta in generale un momento '
     'nullo se la risultante non è nulla.',
 99: 'In equilibrio F_m b=6 N·m. Inizialmente b 0,03 m→F 200 N; infine b 0,04 m→F 150 N. La '
     'diminuzione richiesta è 200−150=50 N. Si usano bracci perpendicolari,non lunghezze '
     'anatomiche generiche; nessuna conclusione clinica dal modello ideale.',
 100: 'Il vettore dal fulcro al punto applicato è verso destra,+x; la forza è verso il basso,−y. '
      'Il prodotto r×F ha componente z negativa: rotazione oraria,quindi momento negativo con '
      'antiorario positivo. Il modulo resta rF per questa perpendicolarità.'}
ASSUMPTIONS={51: 'Quiete fino alla soglia, trazione parallela, normale assegnata positiva; modello secco con '
     'massimo statico, non uguaglianza automatica prima della soglia.',
 52: 'Piano fermo orizzontale, sole forze verticali peso/normale e attrito orizzontale; regime '
     'dinamico fino al primo arresto, g prescritto 49/5.',
 53: 'Pacco non slittante, unica interazione orizzontale col nastro; accelerazione positiva '
     'imposta entro il limite statico disponibile.',
 54: 'Masse puntiformi positive, due configurazioni statiche confrontate; una massa per 4 e '
     'distanza dei centri per 2, altra massa fissa.',
 55: 'Simmetria sferica, campo gravitazionale esterno e rotazione trascurata; distanza dal centro '
     '2 R≥R, non formula interna.',
 56: 'Molla lineare in equilibrio assiale, trazione positiva 6 N, lunghezza totale 14 cm; '
     'lunghezza di riposo positiva 11 cm.',
 57: 'Modulo della forza contro allungamento non negativo; retta passante per origine, variazione '
     'Δx non nulla per la pendenza.',
 58: 'Scorrimento relativo già presente fra superfici solide; classificazione del regime, non '
     'confronto con il moto nel laboratorio.',
 59: 'k>0, x riferito al riposo con asse verso destra, regime lineare; forza orientata−kx e x '
     'negativo.',
 60: 'Due molle identiche parallele con stessa deformazione e richiami concordi; formula valida '
     'per k>0,x≥0, comprese entrambe nulle a x=0.',
 61: 'Forza costante 16 N, spostamento del suo punto di applicazione 5 m, angolo 60° fra i vettori '
     'e coseno positivo.',
 62: 'Filo teso ideale di lunghezza fissa, centro fisso; ogni spostamento infinitesimo tangente è '
     'perpendicolare alla tensione radiale.',
 63: 'Forza tangenziale resistente costante 8 N, sempre opposta allo spostamento locale;6 m è '
     'percorso cumulativo, non corda geometrica.',
 64: 'Forza parallela concorde lineare nello spazio da 2 a 10 N su 2/5 m; media degli estremi '
     'spaziale, non universale nel tempo.',
 65: 'Massa costante positiva e rapidità iniziale non nulla, regime classico in entrambe le prove; '
     'aumento distinto da fattore finale.',
 66: 'Tutti i lavori sullo stesso corpo inclusi:18 e−6 J, altri nulli; K iniziale 5 J e K finale '
     'non negativa.',
 67: 'Forza e velocità del punto di applicazione concordi nell’istante; potenza istantanea, '
     'nessuna durata necessaria.',
 68: 'Nome SI del lavoro; J=N·m, distinto dall’uso di N·m per un momento pur con dimensione '
     'uguale.',
 69: 'Stesso lavoro positivo e durate positive t_A=t_B/3; confronto di potenze medie, nessuna '
     'ipotesi su picchi o profili istantanei.',
 70: 'Massa 4 kg, rapidità 3 m/s, forza resistente 6 N unica a lavorare; bilancio fino al primo '
     'arresto, non continuato a velocità negative.',
 71: 'Forza conservativa con potenziale definito sul dominio del percorso chiuso; stesso stato '
     'finale e iniziale.',
 72: 'Gravità uniforme positiva, massa 1/5 kg, incremento potenziale+3 J; aumento di quota, zero '
     'energetico comune arbitrario.',
 73: 'Stessa k e medesimo campo elastico lineare; moduli delle deformazioni 2 e 5 cm, unità comuni '
     'nel rapporto.',
 74: 'Traslazione costante dello zero spaziale, stesso verso/unità e stessa discesa fisica; '
     'entrambi gli estremi trasformati insieme.',
 75: 'Sistema blocco–piano isolato; la candidata esclude esplicitamente altre variazioni '
     'macroscopiche: il solo calo della K del blocco coincide col calo meccanico totale.',
 76: 'Piste fisse lisce, stessa quota iniziale/finale, partenza da fermo e fondo raggiunto in '
     'entrambi i casi; vincoli senza lavoro.',
 77: 'Soli lavoro gravitazionale e vincoli senza lavoro, g 10, salita 4/5 m; radicando 9 positivo '
     'e radice della rapidità non negativa.',
 78: 'Piano ruvido fermo e scorrimento non nullo andata/ritorno; forza opposta al moto del blocco '
     'nel laboratorio, nessun nastro in moto.',
 79: 'Massa 3 kg, salita 2 m, stessa rapidità agli estremi; attrito con lavoro−5 J e g 10 '
     'uniforme.',
 80: 'Pendolo semplice con m,ℓ,g positivi, rilascio da fermo nel ramo 0<h<ℓ; solo peso e tensione '
     'dopo il rilascio, filo teso, nessuna forza della preparazione durante il moto.',
 81: 'Componente orizzontale dell’impulso totale su massa 1/10 kg; velocità firmate+4 e−3, non '
     'moduli.',
 82: 'Stesso carrello e medesime velocità estreme: impulso vettoriale uguale; rapporto dei moduli '
     'delle forze medie, non media dei moduli né picco.',
 83: 'Sistema orizzontalmente isolato dei due pattini e molla di massa trascurabile; inizialmente '
     'fermo, nessuna p residua della molla da trascurare senza ipotesi.',
 84: 'Vassoio e corpo cadente inclusi, velocità entrante orizzontale nulla, guida liscia e impulso '
     'esterno orizzontale nullo; massa 0,5 kg, non peso 0,5 N.',
 85: 'Meccanica classica, masse positive diverse e p comune in modulo strettamente positivo; '
     'energia non dipende dai versi.',
 86: 'Sistema isolato e confronto delle energie cinetiche totali prima/dopo; energie dei singoli '
     'corpi possono cambiare.',
 87: 'Risultante media lungo lo stesso asse, intervallo 3/5 s positivo; impulso negativo sommato '
     'alla p iniziale 5/2.',
 88: 'Entrambe le biglie nel sistema minimo sufficiente, impulsi esterni orizzontali trascurabili; '
     'nessun’altra opzione propone un insieme isolato più ampio equivalente.',
 89: 'Massa 1/2 kg costante, componenti cartesiane ortogonali, velocità vettoriali(2,0)→(0,2), '
     'intervallo 1/2 s; modulo della media, non differenza delle rapidità.',
 90: 'Sistema materiale chiuso, p_x lineare nel tempo; pendenza costante positiva con dimensione '
     'di forza, non una velocità senza massa.',
 91: 'Masse puntiformi 1 e 3 kg positive, coordinate 0 e 4/5 m sullo stesso asse; media pesata '
     'compresa nell’intervallo.',
 92: 'Angolo fra r e F in 0..π, braccio distanza perpendicolare non negativa; modulo del momento, '
     'non sua componente orientata.',
 93: 'r 2/5 m, F 15 N, angolo 30° fra vettori; modulo del momento senza scegliere segno di '
     'rotazione, braccio 1/5 m.',
 94: 'Due forze sole di uguale modulo positivo opposte, rette parallele distinte con distanza d>0; '
     'corpo libero, a_CM nulla non implica v_CM nulla.',
 95: 'Trave con peso trascurato, appoggi agli estremi di 2 m, unico carico 30 N interno a 1/2 m; '
     'equilibrio statico, reazioni non negative.',
 96: 'Sistema a massa totale costante 12 kg, risultante esterna 18 N; forze interne cancellate '
     'solo nel bilancio totale, non dei singoli carrelli.',
 97: 'Rigidità ideale: tutte le distanze interne invarianti, traslazione e rotazione ammesse; non '
     'assenza di massa o estensione.',
 98: 'Poli fissi O eO′, risultante esterna nulla e momento nullo rispetto aO; termine di '
     'traslazione−a×R esattamente nullo.',
 99: 'Leva statica idealizzata con momento resistente 6 N·m, bracci perpendicolari 3/4 cm '
     'positivi, stessa geometria di equilibrio pertinente; nessuna inferenza clinica.',
 100: 'Fulcro a sinistra, vettore r verso+x e forza verso−y, convenzione antioraria positiva; '
      'segno del momento negativo anche se forza esterna.'}
DISTRACTORS={51: '10/3 inverte il rapporto; 18 e 60 copiano valori numerici di forze. Zero non fornisce la '
     'soglia misurata.',
 52: '49/5 omette il coefficiente; 1/5 copia μ come accelerazione; 25/49 inverte il risultato '
     'numerico; zero elimina l’attrito.',
 53: 'Sinistra confonde velocità assoluta e tendenza relativa; forza nulla non accelera. Dinamico '
     'contraddice assenza di slittamento, verticale non accelera orizzontalmente.',
 54: 'Quattro e un quarto considerano un solo cambiamento; due usa r al primo grado. Un mezzo non '
     'combina 4 e 2².',
 55: 'Quattro omette il quadrato della distanza; otto usa la quota R invece della distanza 2R dal '
     'centro. Zero è soltanto il limite infinito.',
 56: '3 cm è la deformazione; 17 cm aggiunge anziché sottrarre; 14 cm ignora il tiro. Unitá miste '
     'produrrebbero una sottrazione incoerente.',
 57: 'La lunghezza a riposo e x sono lunghezze; l’energia è un’area, non una pendenza. Il '
     'reciproco di k appartiene agli assi scambiati.',
 58: 'Statico contraddice lo slittamento; il rotolamento non è scorrimento radente. Elasticità e '
     'gravità sono altre interazioni.',
 59: '−2 N ha il verso della deformazione; zero ignora x non nullo. 80 copia il valore numerico di '
     'k senza la lunghezza.',
 60: 'kx ignora un ramo; kx/2 descrive la serie. 2k/x ha unità N/m², kx² ha N·m. Soltanto 2kx è la '
     'stessa funzione per ogni k>0 e x≥0.',
 61: '80 J omette cos60°; −40 J inverte l’allineamento. Otto newton è la componente, ancora da '
     'moltiplicare per 5 m.',
 62: 'La tensione non è nulla e il punto si sposta. Modulo costante non implica lavoro nullo; il '
     'parallelismo darebbe lavoro non nullo.',
 63: '48 J perde il segno; zero confonde direzione radiale e tangenziale. I rapporti 8/6 o 6/8 fra '
     'i dati non hanno unità di lavoro.',
 64: '4 J usa solo la forza finale; 4/5 J solo quella iniziale. 16/5 J usa ΔF·d senza il fattore '
     'mezzo; 12 copia la somma degli estremi senza media e distanza.',
 65: 'Un incremento di 4K_i non è il valore finale 4K_i. Una dipendenza lineare darebbe incremento '
     'K_i; zero e K_i/2 non seguono da v².',
 66: '12 J è ΔK; 29 J somma i moduli; 23 J ignora l’attrito. 5 J impone lavoro totale nullo.',
 67: 'F/v non è una potenza; 25 e 4/5 copiano i valori numerici di forza e velocità. −20 W '
     'invertirebbe il verso relativo.',
 68: 'W=J/s misura potenza; Pa pressione, N forza e C carica. Nessuna di queste unità equivale al '
     'lavoro in J.',
 69: '1/3 usa il rapporto diretto dei tempi; uno ignora le durate. Nove eleva al quadrato un '
     'fattore che compare linearmente.',
 70: '6 m omette il fattore mezzo; −3 m non è una distanza. Diciotto copia il valore numerico '
     'dell’energia senza dividerlo per 6 N.',
 71: 'Sul giro il lavoro conservativo non è strettamente positivo o negativo. La lunghezza non è '
     'energia; la durata non cambia ΔU.',
 72: '3 m omette il peso di 2 N; 6 m moltiplica invece di dividere. 3/5 m non ricostruisce 3 J; '
     '−3/2 m darebbe ΔU negativo.',
 73: '2 J segue una dipendenza lineare da x; un’energia negativa non deriva da x negativo perché '
     'compare x². 4/5 J ignora la nuova deformazione.',
 74: '±2 J assegnano energia a un mero cambiamento dello zero. Annullamento e inversione cambiano '
     'indebitamente il dislivello fisico.',
 75: '−13 J è ΔK; 7 J è il valore cinetico finale, 20 J quello iniziale. 27 J somma stati; non si '
     'può attribuire tutto il riscaldamento al solo blocco.',
 76: 'Tempo, direzione, normale e accelerazione possono dipendere dalla forma. La conservazione '
     'dell’energia non li rende invarianti.',
 77: 'Nove è il valore numerico di v²; −3 non è una rapidità. Cinque ignora la salita; 25+16 '
     'inverte il trasferimento energetico.',
 78: 'La stessa posizione finale non rende conservativo qualunque lavoro. L’attrito resta '
     'resistente in entrambi i versi e non ammette un potenziale della sola posizione.',
 79: '60 J ignora l’attrito; 55 J ne sottrae il costo. 5 J ignora la quota; zero confonde ΔK nullo '
     'e lavori individuali nulli.',
 80: 'mg ignora mv²/ℓ; mv²/ℓ ignora il peso. mgh ha unità J, non N. Lavoro della tensione nullo '
     'non implica tensione nulla.',
 81: '+7/10 perde il verso; +1/10 usa i moduli invece delle componenti. −3/10 è p finale; −7 N ha '
     'dimensione sbagliata e manca la durata.',
 82: 'Raddoppio, uguaglianza, un quarto o zero non forniscono lo stesso impulso con durata doppia. '
     'Il picco non è deducibile dalla forza media.',
 83: '+2 m/s darebbe quantità di moto totale positiva. −3 m/s impone moduli uguali delle velocità '
     'anziché delle quantità di moto; zero ignora la spinta interna.',
 84: '2 m/s ignora la nuova massa; 3 copia il valore numerico di p come velocità. 1/2 m/s e zero '
     'violano il momento orizzontale iniziale di 3 kg·m/s; K non si conserva nella cattura.',
 85: 'Massa maggiore dà K maggiore a velocità fissata, ma qui è fissato p. Le direzioni non '
     'contano per K; l’uguaglianza è esclusa da p>0 e masse diverse.',
 86: 'Completamente anelastico implica velocità comune e può ridurre K. Assenza di forze o '
     'velocità singole invariate non seguono dalle conservazioni.',
 87: '−7/10 segue il segno della forza senza completare il bilancio. −9/5 è il solo impulso; '
     '+43/10 somma il suo modulo; zero richiederebbe impulso −5/2 N·s.',
 88: 'Ogni biglia singola riceve un impulso esterno dall’altra. Né massa né quiete selezionano il '
     'sistema; il contatto interno non impedisce p totale costante.',
 89: '2 N è una sola componente. √2 copia il valore numerico di |Δp| prima di dividere per il '
     'tempo. 4 N somma i moduli; zero confronta rapidità anziché vettori.',
 90: 'Posizione, velocità, impulso ed energia non hanno le dimensioni di p/t. Per v occorre la '
     'massa; per l’impulso occorre l’intervallo.',
 91: '2/5 m è la media semplice; 4/5 m coincide con la seconda massa; 1/5 m favorisce quella '
     'leggera. 12/5 m copia il numeratore e uscirebbe dall’intervallo.',
 92: 'r da sola funziona a90°; r cosα è la proiezione parallela. rF non è una lunghezza e il '
     'cammino non è il braccio.',
 93: '6 N·m omette il seno; 3√3 N·m usa il coseno. 1/5 m è il braccio ancora da moltiplicare per '
     'la forza.',
 94: 'Risultante nulla non implica momento nullo. 2F contraddice le forze opposte; una singola '
     'forza non nulla cambierebbe l’accelerazione del centro di massa.',
 95: '45/2 N è la reazione sinistra; 15 N presuppone carico centrale. 30 N o 60 N non rispettano '
     'entrambi i bilanci di forze e momenti.',
 96: '2/3 inverte il quoziente; 6 divide per il numero di carrelli anziché per la massa. Diciotto '
     'copia il valore numerico della forza; zero elimina la risultante esterna.',
 97: 'Il punto materiale elimina l’estensione. Fermo è uno stato, non la rigidità; un fluido non '
     'conserva necessariamente la forma. La definizione non implica assenza di massa.',
 98: 'Nessun raddoppio, inversione o momento non nullo nasce dal solo spostamento del polo quando '
     'R=0. Servono entrambe le condizioni assegnate.',
 99: '150 N è la forza finale, 200 N quella iniziale. La differenza 4−3 cm non è una differenza di '
     'forze: il momento costante impone dipendenza inversa dal braccio.',
 100: 'Essere a destra non basta per il segno. La forza verticale ha braccio orizzontale; essere '
      'esterna non fissa il momento. Il modulo non cambia l’orientazione.'}
READING_COMPLETE=True  # Final15 changed records, last Q089 unit and the new full native009 have actually been reread.
