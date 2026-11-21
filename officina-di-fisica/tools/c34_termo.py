"""Lezioni ed esempi di termodinamica. Convenzione unica: lavoro uscente positivo."""

from c34_base import *

lesson(
    "C3",
    1,
    "Il confine del sistema e il termometro",
    "5.1 Sistema e ambiente|5.1 Stato termodinamico e variabili p, V, T|5.1 Funzioni di stato|5.1 Temperatura e scale",
    [],
    "Immagina di segnare con una matita il contorno del gas in una siringa chiusa. Le molecole dentro il contorno sono il sistema. Il pistone, l’aria esterna e la mano costituiscono l’ambiente. Il confine può muoversi con il pistone. Sceglierlo per primo permette di contare correttamente materia ed energia che lo attraversano.",
    fig(
        "C3-confine",
        "Il contorno tratteggiato racchiude il gas. La parete laterale lascia passare calore, il pistone permette lo scambio di lavoro.",
    ),
    "Un sistema chiuso conserva la materia e può scambiare energia. Un sistema aperto può scambiare anche materia. Un sistema isolato conserva sia materia sia energia. Tappare un recipiente blocca lo scambio di materia attraverso il tappo. Per decidere se l’energia attraversa il confine occorre conoscere anche le proprietà delle pareti.",
    "All’equilibrio, pressione p, volume V e temperatura T descrivono lo stato macroscopico di un gas semplice di composizione fissata. La pressione si misura in pascal, il volume in metri cubi. Una funzione di stato ha lo stesso valore ogni volta che si ritorna nelle stesse condizioni. Per l’energia interna U basta conoscere gli stati iniziale e finale per calcolarne la variazione.",
    "Due corpi in contatto termico raggiungono l’equilibrio quando cessa il trasferimento netto di energia dovuto alla differenza di temperatura. Il termometro si basa su questo confronto. Sulla scala Kelvin lo zero è assoluto. Celsius e kelvin hanno intervalli della stessa ampiezza.",
    eq(
        r"T[\mathrm K]=t[{}^\circ\mathrm C]+273{,}15,\qquad \Delta T[\mathrm K]=\Delta t[{}^\circ\mathrm C]"
    ),
    "Prima di fare un rapporto tra temperature converti entrambi i valori in kelvin. Prima di fare una differenza scrivi invece il valore finale meno l’iniziale. Il valore 273,15 si cancella nella sottrazione.",
)
ex(
    "Due letture dello stesso bagno",
    "Un bagno passa da 18,0 °C a 26,0 °C. Trova la temperatura finale in kelvin e la variazione di temperatura.",
    1,
    "Il termometro indica una temperatura finale e due letture utili a costruire una differenza. Le due domande riguardano quantità diverse.",
    eq(r"T_f=(26{,}0+273{,}15)\,\mathrm K=299{,}15\,\mathrm K\simeq299{,}2\,\mathrm K"),
    "Per la variazione si sottrae il valore iniziale. Ogni grado Celsius di aumento vale un kelvin.",
    eq(r"\Delta T=(26{,}0-18{,}0)\,\mathrm K=+8{,}0\,\mathrm K"),
    "Il segno positivo corrisponde al riscaldamento osservato. La precisione di un decimo resta quella delle letture.",
)
ex(
    "Scegliere il confine in un contenitore",
    "Un contenitore rigido e chiuso è immerso in un bagno caldo. Dopo qualche minuto il gas si è riscaldato. Quali scambi sono compatibili con il racconto?",
    2,
    fig(
        "C3-rigido",
        "Il recipiente sigillato è immerso nel bagno. Le pareti bloccate conservano il volume del gas.",
    ),
    "Il tappo trattiene il gas e il recipiente rigido conserva il volume. Nessuna materia attraversa il confine e manca lo spostamento necessario a compiere lavoro di espansione.",
    eq(r"\Delta V=0\quad\Longrightarrow\quad W_{pV}=0"),
    "Se il riscaldamento è dovuto al contatto con il bagno e mancano altre forme di lavoro, il gas ha ricevuto energia come calore. Il sistema scelto è chiuso. Se includessimo anche il bagno, lo scambio tra bagno e gas diventerebbe interno al nuovo sistema.",
)

lesson(
    "C3",
    2,
    "Contare le moli con il gas perfetto",
    "5.1 Gas perfetti|5.1 Equazione di stato e variabili assolute",
    [1],
    "Una siringa tappata oppone resistenza alla compressione. Le molecole urtano le pareti e trasferiscono quantità di moto. Se la temperatura resta costante, dimezzare il volume della stessa quantità di gas raddoppia la pressione. Se si scalda il gas a volume bloccato, gli urti diventano mediamente più energici.",
    eq(r"pV=nRT,\qquad R=8{,}314\ \mathrm{J\,mol^{-1}K^{-1}}"),
    "p è la pressione assoluta, V il volume occupato, n il numero di moli e T la temperatura assoluta. Una mole raccoglie lo stesso numero di particelle per ogni specie. Con questa costante si usano pascal, metri cubi e kelvin. Il prodotto Pa·m³ equivale a un joule.",
    fig(
        "C3-isoterma",
        "Sul medesimo ramo isotermo di un gas perfetto chiuso, l’area del rettangolo di lati p e V rimane costante.",
    ),
    "Per la stessa quantità di gas possiamo dividere l’equazione dei due stati. Il rapporto elimina nR e aiuta a isolare l’incognita. Se il gas esce da una valvola occorre tenere conto della variazione di n.",
    eq(r"\frac{p_iV_i}{T_i}=nR=\frac{p_fV_f}{T_f}"),
    "Il modello trascura il volume proprio delle molecole e le loro interazioni al di fuori degli urti. Funziona meglio per gas diluiti, lontani dalla condensazione. Controlla sempre se la pressione letta da un manometro è relativa all’atmosfera.",
)
ex(
    "Volume di un campione gassoso",
    "Un campione di 0,0200 mol a 300 K ha pressione assoluta 100 kPa. Calcola il volume in litri.",
    1,
    "Usiamo il gas perfetto per il campione diluito. Con R in unità SI convertiamo 100 kPa in 100 000 Pa.",
    eq(r"pV=nRT\quad\Longrightarrow\quad V=\frac{nRT}{p}"),
    eq(
        r"V=\frac{0{,}0200\cdot 8{,}314\cdot300}{100\,000}\,\mathrm{m^3}=4{,}99\cdot10^{-4}\,\mathrm{m^3}"
    ),
    "Un metro cubo contiene mille litri. Il volume è quindi 0,499 L, vicino a mezzo litro. Alla stessa temperatura una mole occuperebbe circa cinquanta volte questo volume.",
)
ex(
    "Il manometro prima e dopo",
    "Un serbatoio rigido chiuso contiene gas a 300 K. Il manometro segna 40 kPa sopra la pressione atmosferica di 100 kPa. Quanto indica a 330 K?",
    2,
    "In un rapporto tra stati usiamo pressioni assolute. La pressione iniziale assoluta è la somma della lettura e della pressione esterna.",
    eq(r"p_i=40+100=140\ \mathrm{kPa},\qquad \frac{p_f}{p_i}=\frac{T_f}{T_i}"),
    eq(
        r"p_f=140\frac{330}{300}=154\ \mathrm{kPa},\qquad p_{f,\mathrm{rel}}=154-100=54\ \mathrm{kPa}"
    ),
    "La temperatura assoluta cresce del 10% e così pure la pressione assoluta. La scala dello strumento parte dalla pressione atmosferica, perciò la sua lettura aumenta di 14 kPa.",
)

lesson(
    "C3",
    3,
    "Pesare il riscaldamento",
    "5.2 Calore e scambio di energia|5.2 Capacità termica e calore specifico|5.2 Capacità termiche dei gas ideali|5.2 Calorimetria",
    [1, 2],
    "Un blocchetto e una vasca alla stessa temperatura possono cedere quantità di energia molto diverse. Il calore Q misura un trasferimento causato da una differenza di temperatura. La temperatura descrive lo stato. Per sapere quanta energia occorre a cambiarla bisogna conoscere il materiale, la quantità presente e le condizioni del percorso.",
    eq(r"Q=C\Delta T=mc\Delta T,\qquad c=\frac{C}{m}"),
    "C è la capacità termica in J/K del campione. Il calore specifico c, espresso in J/(kg·K), è la capacità per unità di massa. La formula usa un valore circa costante nell’intervallo termico e presuppone l’assenza di transizioni di fase. Con la convenzione del calore entrante positivo, un corpo che si raffredda ha Q negativo.",
    fig(
        "C3-scambi",
        "Due oggetti scambiano energia dentro un involucro isolante. Le frecce intermedie attraversano soltanto il confine fra gli oggetti.",
    ),
    "Nel calorimetro ideale isolato, trascurando il lavoro e la capacità termica del contenitore, la somma dei calori dei corpi è zero. Se il recipiente assorbe energia va incluso come terzo corpo. La temperatura comune finale deve trovarsi fra quelle iniziali quando agisce solo il contatto termico.",
    eq(r"\sum_i C_i(T_f-T_i)=0"),
    "Un gas si può scaldare a volume fisso oppure a pressione fissa, lasciandolo espandere. Nel secondo caso parte del calore diventa lavoro. Per una mole di gas perfetto, con capacità molari Cₚ e Cᵥ espresse in J/(mol·K), la differenza è R.",
    eq(r"Q_V=nC_V\Delta T,\quad Q_p=nC_p\Delta T,\quad C_p-C_V=R"),
)
ex(
    "Unire due masse d’acqua",
    "Mescoliamo 100 g d’acqua a 60 °C con 300 g a 20 °C, in un recipiente isolato con capacità trascurabile. Trova la temperatura comune.",
    2,
    fig(
        "C3-scambi",
        "L’acqua calda cede energia all’acqua fredda. Includendo entrambe nel sistema, lo scambio netto con l’esterno è nullo.",
    ),
    "La stessa acqua ha il medesimo calore specifico. Conserviamo i grammi nel rapporto tra le masse, perché l’unità si semplifica.",
    eq(r"100c(T_f-60)+300c(T_f-20)=0"),
    eq(
        r"400T_f=100\cdot60+300\cdot20=12\,000\quad\Longrightarrow\quad T_f=30\,{}^\circ\mathrm C"
    ),
    "Il risultato è più vicino a 20 °C perché l’acqua fredda ha capacità termica tripla. La sua salita di 10 K compensa la discesa di 30 K dell’altra massa.",
)
ex(
    "Calibrare un calorimetro",
    "Un riscaldatore fornisce 960 J al calorimetro con il suo campione. La temperatura cresce di 4,0 K. Il campione ha capacità 180 J/K. Stima la capacità del contenitore, trascurando le perdite.",
    2,
    "Campione e contenitore raggiungono la stessa temperatura e si scaldano insieme. Le loro capacità si sommano.",
    eq(r"Q=(C_{\rm camp}+C_{\rm cont})\Delta T"),
    eq(
        r"C_{\rm cont}=\frac{Q}{\Delta T}-C_{\rm camp}=\frac{960}{4{,}0}-180=60\ \mathrm{J/K}"
    ),
    "Per ogni kelvin il recipiente assorbe 60 J. In questa prova riceve 240 J, lasciandone 720 al campione. La somma restituisce 960 J.",
)

lesson(
    "C3",
    4,
    "Quando la temperatura si ferma",
    "5.2 Fusione|5.2 Evaporazione e condensazione|5.2 Calore latente e bilanci a tratti",
    [3],
    "Scalda lentamente del ghiaccio puro alla sua temperatura di fusione e a pressione atmosferica. Finché coesistono ghiaccio e acqua in equilibrio, il termometro rimane vicino a 0 °C mentre la frazione liquida cresce. L’energia modifica l’organizzazione della materia.",
    fig(
        "C3-fasi",
        "Nel tratto orizzontale di fusione il calore fornito modifica la frazione liquida. La pendenza ricompare dopo la fusione completa.",
    ),
    eq(r"|Q_{\rm fase}|=m_{\rm trasformata}L"),
    "L è il calore latente specifico in J/kg. Il modulo lascia esplicito il verso dello scambio. Per fondere o vaporizzare occorre fornire energia, mentre solidificazione e condensazione la restituiscono all’ambiente. Si deve usare la massa che cambia effettivamente fase.",
    "Per attraversare più tratti, suddividi il cammino in riscaldamento del solido, fusione e riscaldamento del liquido. Ogni tratto ha la sua relazione energetica. Con potenza costante, il calore fornito è proporzionale al tempo. Durante l’evaporazione in superficie, possibile anche sotto il punto di ebollizione, la perdita delle molecole più energetiche può raffreddare il liquido residuo.",
    eq(r"Q_{\rm totale}=mc_{\rm s}(T_{\rm fus}-T_i)+mL_f+mc_{\rm l}(T_f-T_{\rm fus})"),
    "Prima di calcolare una temperatura finale verifica se l’energia disponibile basta a esaurire l’intera massa della fase iniziale. Se ne resta una parte, la coesistenza di fasi determina la temperatura finale.",
)
ex(
    "Dal ghiaccio all’acqua tiepida",
    "Quanta energia serve per portare 50 g di ghiaccio a 0 °C ad acqua a 10 °C? Usa Lf = 334 kJ/kg e c = 4,18 kJ/(kg·K).",
    2,
    fig(
        "C3-fasi",
        "Il percorso comincia sul tratto di fusione e continua sul ramo dell’acqua liquida.",
    ),
    "La massa è 0,050 kg. Il primo trasferimento fonde il ghiaccio, il secondo aumenta la temperatura dell’acqua.",
    eq(
        r"Q_f=0{,}050\cdot334=16{,}7\ \mathrm{kJ},\qquad Q_T=0{,}050\cdot4{,}18\cdot10=2{,}09\ \mathrm{kJ}"
    ),
    eq(r"Q=Q_f+Q_T=18{,}79\ \mathrm{kJ}\simeq18{,}8\ \mathrm{kJ}"),
    "La maggior parte dell’energia serve alla fusione. Inserire solo la variazione di temperatura farebbe perdere il termine più grande.",
)
ex(
    "Resta ancora del ghiaccio?",
    "Un campione di 80 g di ghiaccio a 0 °C assorbe 10,02 kJ a pressione atmosferica. Assumi Lf = 334 kJ/kg. Determina stato e masse finali.",
    2,
    "Il massimo calore assorbibile durante la fusione completa è il prodotto della massa iniziale per il calore latente.",
    eq(r"Q_{\rm completo}=0{,}080\cdot334=26{,}72\ \mathrm{kJ}>10{,}02\ \mathrm{kJ}"),
    eq(r"m_{\rm fusa}=Q/L_f=10{,}02/334=0{,}0300\ \mathrm{kg}=30{,}0\ \mathrm g"),
    "Restano 80 − 30 = 50 g di ghiaccio insieme a 30 g di acqua. Nell’ipotesi di equilibrio la miscela si trova ancora a 0 °C.",
)

lesson(
    "C3",
    5,
    "Tre vie per trasferire energia",
    "5.3 Conduzione|5.3 Convezione|5.3 Irraggiamento",
    [3],
    "Un cucchiaio immerso in acqua calda si riscalda lungo il manico. Le regioni vicine si scambiano energia attraverso il materiale fermo. Questa è la conduzione. Per una lastra omogenea in regime stazionario, con due facce piane a temperatura fissata e perdite laterali trascurabili, la potenza termica condotta cresce con area e differenza di temperatura.",
    fig(
        "C3-parete",
        "Flusso unidimensionale attraverso una parete. Lo spessore s è misurato nel verso di propagazione dell’energia.",
    ),
    eq(r"P=\frac{|Q|}{\Delta t}=\lambda A\frac{T_{\rm calda}-T_{\rm fredda}}{s}"),
    "La conducibilità λ si misura in W/(m·K), A in m² e s in metri. A parità di differenza termica, uno spessore maggiore riduce il gradiente di temperatura e il flusso. La temperatura può essere stazionaria anche mentre passa potenza.",
    "Se una corrente di fluido trasporta con sé energia, si parla di convezione. Una pompa produce convezione forzata. In convezione naturale le differenze di densità in presenza della gravità possono muovere il fluido. Il percorso dal centro dell’acqua alla parete può combinare trasporto con il fluido e conduzione vicina alla superficie.",
    "L’irraggiamento avviene mediante onde elettromagnetiche e attraversa anche il vuoto. Un corpo emette e assorbe contemporaneamente. Per una superficie grigia di emissività ε dentro una grande cavità isoterma, la potenza netta uscente dipende dalle temperature assolute.",
    eq(r"P_{\rm netta}=\varepsilon\sigma A(T_{\rm corpo}^4-T_{\rm amb}^4)"),
    "Un termine di quarta potenza in Celsius darebbe un risultato dipendente dall’origine arbitraria della scala. Quando corpo e ambiente hanno la stessa temperatura, emissione e assorbimento si compensano.",
)
ex(
    "Un diaframma conduttore",
    "Una lastra piana di area 0,020 m², spessore 5,0 mm e conducibilità 0,20 W/(m·K) separa due facce a 32 e 22 °C. Quanta energia passa in 2 min in regime stazionario?",
    2,
    fig(
        "C3-parete",
        "L’energia attraversa la superficie di area A dal lato caldo al lato freddo.",
    ),
    "Per calcolare la potenza convertiamo 5,0 mm in 0,0050 m e ricaviamo la differenza termica di 10 K.",
    eq(
        r"P=\frac{\lambda A\Delta T}{s}=\frac{0{,}20\cdot0{,}020\cdot10}{0{,}0050}=8{,}0\ \mathrm W"
    ),
    eq(r"|Q|=P\Delta t=8{,}0\cdot(2\cdot60)=960\ \mathrm J"),
    "Il risultato è un’energia, mentre la potenza indica quanti joule attraversano la parete in ciascun secondo.",
)
ex(
    "Approfondimento · Due strati in successione",
    "Due strati piani hanno resistenze termiche 1 K/W e 3 K/W, nell’ordine dalla faccia a 40 °C a quella a 20 °C. Qual è la temperatura all’interfaccia in regime stazionario?",
    3,
    "La stessa potenza attraversa entrambi gli strati. Una resistenza termica è il rapporto tra caduta di temperatura e potenza.",
    eq(r"P=\frac{40-20}{1+3}=5\ \mathrm W,\qquad \Delta T_1=PR_1=5\cdot1=5\ \mathrm K"),
    eq(r"T_{\rm interfaccia}=40-5=35\,{}^\circ\mathrm C"),
    "Il secondo strato presenta la caduta maggiore, 5 × 3 = 15 K. I valori di partenza e di arrivo sono quindi coerenti.",
)

lesson(
    "C3",
    6,
    "Fare i conti con il primo principio",
    "5.4 Primo principio|5.4 Energia interna|5.4 Calore e lavoro|5.4 Interpretazione del lavoro su un diagramma p–V",
    [1, 2, 3],
    "Un gas può scaldarsi perché riceve calore oppure perché viene compresso. Per distinguere questi modi di trasferire energia scegliamo il gas come sistema. U è la sua energia interna, somma dei contributi microscopici. U non comprende l’energia cinetica associata al moto del recipiente come un tutto.",
    fig(
        "C3-bilancio",
        "Q è positivo quando entra nel sistema. W è positivo quando il sistema compie lavoro sull’ambiente. I segni seguono queste due frecce di riferimento.",
    ),
    eq(r"\Delta U=U_f-U_i=Q-W"),
    "Il calore Q entrante aumenta U. Il lavoro W che il sistema compie all’esterno riduce l’energia che gli rimane. Per un pistone senza attrito sottoposto all’esterno a pressione costante, il lavoro si ricava dalla forza esterna moltiplicata per lo spostamento. Il prodotto di area e spostamento è la variazione di volume.",
    eq(r"W=p_{\rm est}(V_f-V_i),\qquad 1\ \mathrm{kPa}\cdot1\ \mathrm L=1\ \mathrm J"),
    "In espansione ΔV è positivo, in compressione è negativo. In una trasformazione quasi statica meccanicamente equilibrata p interna ed esterna coincidono al limite. L’area sotto il cammino p–V misura il lavoro con un segno legato al verso di percorrenza. In una trasformazione rapida fuori equilibrio può mancare una singola pressione interna uniforme.",
    "Per un gas perfetto di quantità e composizione fisse, l’energia interna dipende solo dalla temperatura. Un termometro che torna alla lettura iniziale implica ΔU = 0 per quel modello, anche se lungo il percorso si sono scambiati calore e lavoro.",
)
ex(
    "Compressione con raffreddamento",
    "Un pistone comprime un gas da 4,0 a 2,0 L contro una pressione esterna costante di 80 kPa. Intanto il gas cede 50 J di calore. Calcola la variazione di energia interna.",
    2,
    fig(
        "C3-compressione",
        "Le frecce mostrano gli scambi reali. Il calore è uscente e il lavoro è entrante. Entrambi hanno segno negativo con le convenzioni Q entrante e W uscente.",
    ),
    eq(r"W=80\,(2{,}0-4{,}0)\ \mathrm{kPa\,L}=-160\ \mathrm J,\qquad Q=-50\ \mathrm J"),
    eq(r"\Delta U=Q-W=-50-(-160)=+110\ \mathrm J"),
    "Il gas riceve meccanicamente 160 J e ne restituisce 50 all’esterno come calore. Restano 110 J di energia interna in più.",
)
ex(
    "Due cammini fra gli stessi stati",
    "Da A a B il gas riceve 240 J e compie 160 J di lavoro. Lungo un altro cammino fra A e B compie 90 J. Quanto calore riceve lungo il secondo cammino?",
    2,
    "La differenza di energia interna è determinata dai due stati. Ricaviamola dal percorso che conosciamo.",
    eq(r"\Delta U=240-160=80\ \mathrm J"),
    eq(r"Q_2=\Delta U+W_2=80+90=170\ \mathrm J"),
    "Il primo cammino richiede 70 J in più di calore e produce 70 J in più di lavoro. Il saldo accumulato nel gas è identico.",
)

lesson(
    "C3",
    7,
    "Riconoscere il percorso nel piano p–V",
    "5.4 Trasformazioni reversibili e irreversibili|5.4 Isoterma|5.4 Isocora|5.4 Isobara|5.4 Adiabatica e confronto qualitativo",
    [2, 6],
    "Blocca un pistone, mantienilo a carico costante oppure accostalo a un bagno termico. Ogni vincolo seleziona un diverso percorso. Un grafico p–V mette in ascissa il volume e in ordinata la pressione. Ogni punto di un cammino quasi statico rappresenta uno stato di equilibrio del gas.",
    fig(
        "C3-percorsi",
        "Dal medesimo stato A partono un’isobara, un’isocora e due espansioni curve. Per il gas perfetto l’adiabatica reversibile scende più rapidamente dell’isoterma.",
    ),
    "In una trasformazione isocora il volume resta fisso, il cammino è verticale e il lavoro di espansione è zero. In una isobara la pressione resta fissa, il cammino è orizzontale e il lavoro è l’area del rettangolo pΔV. Il gas perfetto chiuso si scalda espandendosi a pressione costante.",
    eq(r"V=\mathrm{cost.}:\ W=0;\qquad p=\mathrm{cost.}:\ W=p\Delta V"),
    "In una isoterma del gas perfetto chiuso il prodotto pV resta fisso. Durante un’espansione reversibile serve calore per compensare il lavoro uscente. In una adiabatica la parete impedisce lo scambio di calore. Se il gas compie lavoro, la sua energia interna diminuisce e il gas perfetto si raffredda.",
    eq(r"T=\mathrm{cost.}:\ \Delta U=0,\ Q=W;\qquad Q=0:\ \Delta U=-W"),
    "La reversibilità richiede che sistema e ambiente possano ripercorrere il processo a ritroso senza lasciare modifiche complessive. Trasformazioni molto lente possono ancora dissipare energia per attrito. Per un gas perfetto con capacità molari costanti, lungo una adiabatica reversibile vale pV elevato a γ costante, con γ = Cₚ/Cᵥ maggiore di uno.",
    eq(r"pV^\gamma=\mathrm{costante}\quad(\text{adiabatica reversibile})"),
    "Per confrontare i modelli nel laboratorio scegli uno stato iniziale e prevedi cosa accadrà alla pressione se il volume cresce. Specifica quale vincolo mantiene il dispositivo: l’esperimento ha senso solo dopo questa scelta.",
)
ex(
    "Confrontare due espansioni",
    "Un campione di gas perfetto parte da 200 kPa e 2,0 L. Il volume raddoppia. Calcola la pressione finale per un’isoterma e per un’adiabatica reversibile con γ = 1,4.",
    2,
    fig(
        "C3-percorsi",
        "Alla stessa ascissa finale il ramo adiabatico si trova sotto quello isotermo. Il confronto richiede il medesimo punto iniziale.",
    ),
    eq(r"p_{f,T}=p_i\frac{V_i}{V_f}=200\cdot\frac12=100\ \mathrm{kPa}"),
    eq(
        r"p_{f,S}=p_i\left(\frac{V_i}{V_f}\right)^{1{,}4}=200\cdot(1/2)^{1{,}4}\simeq75{,}8\ \mathrm{kPa}"
    ),
    "L’adiabatica termina a pressione inferiore. Il gas ha impiegato energia propria per compiere lavoro. La quantità di sostanza resta fissa e si semplifica nei rapporti.",
)
ex(
    "Lasciare un gas espandersi nel vuoto",
    "Si rimuove un separatore in un contenitore rigido isolato. Da un lato era presente un gas perfetto, dall’altro il vuoto. Determina lavoro, calore e temperatura finale rispetto all’iniziale.",
    2,
    fig(
        "C3-espansione-libera",
        "Dopo la rimozione della parete interna, la stessa quantità di gas occupa un volume maggiore.",
    ),
    "Il gas occupa il compartimento vuoto senza spingere contro una pressione resistente. Le pareti esterne impediscono lo scambio di calore. Supponiamo che all’inizio e alla fine il gas sia all’equilibrio.",
    eq(r"W=0,\qquad Q=0,\qquad \Delta U=Q-W=0"),
    "Per il gas perfetto di composizione fissata U dipende solo da T, quindi la temperatura finale è uguale all’iniziale. Il processo è adiabatico e irreversibile. Applicare la relazione pVᵞ costante a questa espansione darebbe un raffreddamento inesistente nel modello.",
)

(
    lesson(
        "C3",
        8,
        "Leggere il lavoro di un ciclo",
        "5.5 Ciclo termodinamico|5.5 Bilancio energetico di un ciclo|5.5 Funzionamento ciclico",
        [6, 7],
        "Un apparato torna periodicamente allo stesso stato per ripetere un’operazione. Nel piano p–V il cammino di un ciclo quasi statico è chiuso. Poiché il fluido torna allo stato iniziale, energia interna ed entropia del fluido tornano ai valori di partenza. Il fluido può comunque avere compiuto lavoro e scambiato calore.",
        fig(
            "C3-ciclo",
            "A → B è l’espansione a pressione alta. C → D è la compressione a pressione bassa. I segmenti verticali cambiano pressione a volume fisso.",
        ),
        eq(r"\Delta U_{\rm ciclo}=0,\qquad Q_{\rm netto}=W_{\rm netto}"),
        "Per un rettangolo, il lavoro sull’espansione è p alta per l’aumento di volume. Il lavoro di compressione ha segno opposto e modulo minore. La differenza è l’area interna. Percorrendo il ciclo in senso orario si ottiene lavoro positivo. In senso antiorario il sistema assorbe lavoro netto.",
        eq(
            r"W_{\rm orario}=(p_{\rm alta}-p_{\rm bassa})(V_{\rm grande}-V_{\rm piccolo})"
        ),
        "Il lavoro è legato alla forma del percorso. Riportare solo le coordinate dello stato iniziale e finale, coincidenti, fa perdere l’informazione necessaria. Controlla le scale degli assi prima di misurare l’area.",
    ),
)
ex(
    "Il rettangolo nel piano p–V",
    "Un gas percorre in senso orario un rettangolo fra 100 e 200 kPa e fra 1 e 3 L. Trova il lavoro netto e il calore netto di un ciclo.",
    2,
    fig(
        "C3-ciclo",
        "Il bordo superiore va verso volume crescente. Le frecce orientano il bilancio del lavoro.",
    ),
    eq(r"W_{AB}=200(3-1)=400\ \mathrm J,\qquad W_{CD}=100(1-3)=-200\ \mathrm J"),
    "Nei due tratti verticali il volume è fisso e il lavoro di espansione è nullo.",
    eq(
        r"W_{\rm netto}=400-200=200\ \mathrm J,\qquad Q_{\rm netto}=\Delta U_{\rm ciclo}+W_{\rm netto}=200\ \mathrm J"
    ),
    "Il bilancio riguarda il calore netto. Il calore assorbito in una parte del ciclo può superare 200 J.",
)
ex(
    "Chiudere un bilancio incompleto",
    "Tre tratti chiudono un ciclo. Le variazioni di energia interna dei primi due sono +130 J e −90 J. Nel terzo il gas compie lavoro di 15 J. Trova il calore del terzo tratto.",
    2,
    "Le variazioni di una funzione di stato si sommano fino a zero su un giro completo.",
    eq(r"\Delta U_3=-(130-90)=-40\ \mathrm J"),
    eq(r"Q_3=\Delta U_3+W_3=-40+15=-25\ \mathrm J"),
    "Il gas cede 25 J di calore e compie 15 J di lavoro. L’energia interna scende quindi di 40 J in quel tratto.",
)

lesson(
    "C3",
    9,
    "Dal calore al lavoro utile",
    "5.5 Secondo principio, enunciati di Kelvin–Planck e Clausius|5.5 Macchine termiche|5.5 Rendimento|5.5 Ciclo di Carnot",
    [7, 8],
    "Un motore ciclico riceve energia da una sorgente calda, ne scarica una parte a una sorgente fredda e fornisce lavoro. Indichiamo con Qh e Qc i moduli positivi del calore assorbito ed espulso. Per il fluido, il secondo contributo al bilancio ha segno negativo.",
    fig(
        "C3-macchina",
        "Le frecce indicano le direzioni effettive dei trasferimenti durante un ciclo motore. Qh e Qc sono moduli.",
    ),
    eq(r"W=Q_h-Q_c,\qquad \eta=\frac{W}{Q_h}=1-\frac{Q_c}{Q_h}"),
    "L’enunciato di Kelvin–Planck impedisce a una macchina ciclica di convertire integralmente il calore prelevato da una sola sorgente in lavoro come unico effetto. L’enunciato di Clausius impedisce il trasferimento ciclico netto dal freddo al caldo come unico effetto. Un frigorifero riceve lavoro dall’esterno e rispetta questo vincolo.",
    "Il ciclo di Carnot collega due isoterme reversibili alle temperature delle sorgenti mediante due adiabatiche reversibili. Il fluido prende calore durante l’isoterma calda e lo cede durante quella fredda. Nessuna macchina che operi fra le stesse due temperature può avere rendimento superiore.",
    eq(r"\eta_{\rm Carnot}=1-\frac{T_c}{T_h},\qquad 0\leq\eta\leq\eta_{\rm Carnot}"),
    "Tc e Th sono temperature assolute. Inserire temperature Celsius nel rapporto altera il limite. Ridurre le dissipazioni può avvicinare al limite, mentre temperatura fredda e temperatura calda uguali annullano il lavoro ottenibile da quel dislivello.",
)
ex(
    "Esaminare una proposta di motore",
    "Una macchina ciclica assorbe 800 J da una sorgente a 400 K, scarica 560 J a 300 K e promette 240 J di lavoro. Verifica i due principi.",
    3,
    fig(
        "C3-macchina",
        "Identifica separatamente il bilancio energetico e il vincolo posto dalle temperature delle sorgenti.",
    ),
    eq(r"Q_h-Q_c=800-560=240\ \mathrm J,\qquad \eta=240/800=0{,}30"),
    eq(r"\eta_{\rm max}=1-300/400=0{,}25"),
    "Il conto dell’energia si chiude. La promessa supera tuttavia il rendimento reversibile fra le due sorgenti, quindi la macchina descritta è impossibile nelle condizioni dichiarate.",
)
ex(
    "Approfondimento · Consumo minimo di un frigorifero ideale",
    "Un frigorifero reversibile trasferisce 270 J da una sorgente a 270 K verso una a 300 K per ciclo. Quanto lavoro assorbe?",
    3,
    "Rovesciando un ciclo reversibile, i moduli dei calori restano proporzionali alle temperature assolute. L’energia scaricata al caldo include anche il lavoro in ingresso.",
    eq(
        r"\frac{Q_h}{T_h}=\frac{Q_c}{T_c}\quad\Longrightarrow\quad Q_h=270\frac{300}{270}=300\ \mathrm J"
    ),
    eq(r"W_{\rm in}=Q_h-Q_c=300-270=30\ \mathrm J"),
    "Un dispositivo reale fra queste due sorgenti richiede almeno questo lavoro per la stessa energia prelevata al freddo. Il quoziente Qc/W è un coefficiente di prestazione.",
)

lesson(
    "C3",
    10,
    "Seguire il verso dei processi",
    "5.5 Entropia funzione di stato|5.5 Implicazioni macroscopiche|5.5 Interpretazione statistica|5.5 Direzione naturale dei processi",
    [6, 9],
    "Un cubetto caldo e uno freddo in contatto tendono a una temperatura comune. Anche il processo immaginario inverso conserverebbe energia. Il secondo principio seleziona il verso spontaneo tramite l’entropia S. Per sistema e ambiente considerati insieme, in condizioni complessivamente isolate, la variazione di entropia è positiva nei processi irreversibili e nulla nel limite reversibile.",
    fig(
        "C3-entropia",
        "Un’energia Q trasferita dal caldo al freddo sottrae Q/Th al serbatoio caldo e aggiunge Q/Tc a quello freddo. I serbatoi conservano le loro temperature.",
    ),
    eq(r"\Delta S_{\rm totale}=\Delta S_{\rm sistema}+\Delta S_{\rm ambiente}\geq0"),
    "Una singola parte può perdere entropia. Per determinarne la variazione fra due stati si può immaginare un cammino reversibile che li colleghi, anche quando il cammino reale è irreversibile. In uno scambio reversibile isotermo la variazione vale Qrev/T, in J/K. Per un serbatoio a temperatura fissa vale la stessa relazione con il calore che esso riceve.",
    eq(
        r"\Delta S=\int_i^f\frac{\delta Q_{\rm rev}}{T},\qquad \Delta S_{\rm isot,rev}=\frac{Q_{\rm rev}}{T}"
    ),
    "Per un trasferimento fra due serbatoi la formula si applica a ciascuno usando la propria temperatura. Se una temperatura cambia sensibilmente durante lo scambio, un solo valore arbitrario di T al denominatore non basta.",
    "Dal punto di vista statistico un macrostato può corrispondere a molte configurazioni microscopiche compatibili. Se tali configurazioni sono equiprobabili, S = kB ln Ω. Un gas libero di occupare due compartimenti dispone di più configurazioni accessibili. La distribuzione spontanea su tutto il volume diventa estremamente probabile con molte particelle.",
    eq(r"S=k_{\rm B}\ln\Omega,\qquad \Delta S=k_{\rm B}\ln(\Omega_f/\Omega_i)"),
)
ex(
    "Entropia di due serbatoi",
    "Due serbatoi a 400 K e 300 K scambiano 120 J dal caldo al freddo. Determina le tre variazioni di entropia.",
    2,
    fig(
        "C3-entropia",
        "Ogni serbatoio ha una temperatura distinta e costante. Il calore esce da quello caldo ed entra in quello freddo.",
    ),
    eq(
        r"\Delta S_h=-120/400=-0{,}300\ \mathrm{J/K},\qquad \Delta S_c=+120/300=+0{,}400\ \mathrm{J/K}"
    ),
    eq(r"\Delta S_{\rm totale}=-0{,}300+0{,}400=+0{,}100\ \mathrm{J/K}"),
    "Dividere per una temperatura più bassa dà una variazione di modulo maggiore. L’aumento complessivo è compatibile con il trasferimento spontaneo.",
)
ex(
    "Espandere un gas e contare le possibilità",
    "Una mole di gas perfetto passa isotermicamente da V a 2V. Calcola la variazione di entropia anche se il gas si è espanso liberamente nel vuoto. Usa R = 8,314 J/(mol·K).",
    3,
    "La variazione cercata dipende solo dagli stati. Scegliamo un’isoterma reversibile fra gli stessi due volumi. In tale percorso Qrev = Wrev e p = nRT/V.",
    eq(
        r"\Delta S=\frac{1}{T}\int_V^{2V}\frac{nRT}{V^{\prime}}\,dV^{\prime}=nR\ln(2V/V)"
    ),
    eq(r"\Delta S=1\cdot8{,}314\cdot\ln 2=5{,}76\ \mathrm{J/K}"),
    "Il volume maggiore offre più configurazioni microscopiche. Nell’espansione libera reale il calore può essere nullo mentre l’entropia cresce. Il calore nella formula di calcolo appartiene al percorso reversibile scelto.",
)
