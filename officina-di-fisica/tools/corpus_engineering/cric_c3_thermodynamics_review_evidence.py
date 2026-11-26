"""Per-ID reading after immutable prompt-first derivations and actual full assets."""
READING_COMPLETE=True
PRIMARY_MANUAL={51: 'Derivazione nella primaria congelata PRIMA delle chiavi: Uso Q entrante positivo e W uscente '
     'positivo. Il lavoro contro la pressione esterna costante è W=p_ext(V_f−V_i)=120 kPa·0,5 L=60 J, '
     'perché kPa·L=J. Per sistema chiuso con solo questo lavoro e variazioni macroscopiche '
     'trascurabili, ΔU=Q−W=35−60=−25 J. Non serve attribuire al gas la pressione interna uniforme '
     'durante un’espansione irreversibile.',
 52: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il contenitore rigido annulla il lavoro '
     'di volume ma non quello dell’albero dell’agitatore. L’isolamento termico dà Q=0; il lavoro fatto '
     'sul liquido può aumentare U. Con W uscente, l’albero compie W<0 e ΔU=−W>0, trascurate altre '
     'variazioni energetiche. Adiabatico non significa energia interna costante quando c’è lavoro.',
 53: 'Derivazione nella primaria congelata PRIMA delle chiavi: La pressione esterna è positiva e la '
     'compressione ha dV<0. Il lavoro del gas W=∫p_ext dV è negativo. Il lavoro fatto sul gas è invece '
     'positivo: non si scambiano le due convenzioni.',
 54: 'Derivazione nella primaria congelata PRIMA delle chiavi: Da ΔU=Q−W ricavo Q=ΔU+W=−75+120=45 J. Il '
     'gas riceve calore positivo pur diminuendo U, perché il lavoro uscente è maggiore del calore '
     'entrante.',
 55: 'Derivazione nella primaria congelata PRIMA delle chiavi: Con pressione lineare la media fra gli '
     'estremi è (200+100)/2=150 kPa. L’incremento di volume è 3 L. Il lavoro quasi statico è l’area del '
     'trapezio: W=150·3=450 J, positivo per espansione. Si assumono pressione utile al lavoro di '
     'confine e attriti/altre forme di lavoro controllati.',
 56: 'Derivazione nella primaria congelata PRIMA delle chiavi: Non basta. W dipende dall’intero '
     'percorso p(V), non solo dalle pressioni agli estremi. Perfino con stessi stati finali una via a '
     '100 kPa da 1 a 2 L dà 100 J; una via che sale isocoricamente a 200 kPa, si espande fra gli stessi '
     'volumi e poi scende isocoricamente dà 200 J. I tratti a volume fisso non aggiungono lavoro.',
 57: 'Derivazione nella primaria congelata PRIMA delle chiavi: La funzione di stato richiesta è '
     'l’energia interna. Comprende le energie microscopiche, distinte dalla traslazione o dall’energia '
     'potenziale macroscopica dell’intero corpo. Non è il calore, che descrive un trasferimento.',
 58: 'Derivazione nella primaria congelata PRIMA delle chiavi: A=25·10⁻⁴ m² e s=4·10⁻² m, dunque ΔV=A '
     's=10⁻⁴ m³=0,1 L. Contro 100 kPa il lavoro del gas è 10 J. Il verso verso l’esterno determina il '
     'segno positivo. L’area non va convertita come una lunghezza.',
 59: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il solo cambio di riferimento modifica '
     'l’energia cinetica macroscopica della traslazione, non U nel modello non relativistico. Sotto una '
     'trasformazione galileiana v_i→v_i−u e V_CM→V_CM−u, le differenze v_i−V_CM che entrano nelle '
     'energie interne restano identiche. Non si è realmente riscaldato il recipiente o eseguita '
     'un’accelerazione.',
 60: 'Derivazione nella primaria congelata PRIMA delle chiavi: Q=0 e ΔU=180 J. Dalla convenzione ΔU=Q−W '
     'risulta W=−180 J: occorrono 180 J di lavoro entrante. Un valore +180 J farebbe invece diminuire '
     'U.',
 61: 'Derivazione nella primaria congelata PRIMA delle chiavi: A volume fisso e quantità di gas '
     'perfetto costante vale p/T=costante. Salire nel grafico p–V implica p maggiore e T maggiore. Per '
     'capacità termica positiva aumenta anche U; il lavoro di volume resta nullo. Prima delle opzioni '
     'non seleziono una coppia testuale esclusiva, ma derivo tutte queste proprietà.',
 62: 'Derivazione nella primaria congelata PRIMA delle chiavi: Trasformazione adiabatica: Q=0. I 200 J '
     'compiuti dal gas sono lavoro uscente, quindi ΔU=−200 J. La capacità totale costante 25 J/K dà '
     'ΔT=ΔU/C_V=−8 K. Non si introduce una massa o una capacità specifica assente.',
 63: 'Derivazione nella primaria congelata PRIMA delle chiavi: La trasformazione a pressione costante è '
     'isobara. Non è necessariamente isoterma; per un gas perfetto chiuso con p costante, un aumento di '
     'V richiede un aumento di T assoluta.',
 64: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il moto lentissimo può approssimare una '
     'trasformazione quasi statica, ma gli attriti attivi la rendono irreversibile. La lentezza non '
     'elimina la dissipazione o la produzione di entropia. Non si conclude reversibilità dal solo '
     'procedere lento.',
 65: 'Derivazione nella primaria congelata PRIMA delle chiavi: La rigidità esclude il lavoro di volume; '
     'con il solo riscaldamento ΔU=Q=72 J. Con capacità totale a volume costante 12 J/K l’aumento è '
     'ΔT=72/12=6 K. Non si moltiplica per una massa non data.',
 66: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per gas perfetto chiuso U dipende '
     'soltanto da T. Nell’isoterma ΔT=0, dunque la variazione di U è nulla. Questo non impone Q=W=0: '
     'durante un’espansione possono essere entrambi positivi ed uguali.',
 67: 'Derivazione nella primaria congelata PRIMA delle chiavi: In isobara quasi statica del gas '
     'perfetto W=pΔV=nRΔT. Con n=1/2 mol, R=8,314=4157/500 J/(mol·K) e ΔT=20 K, W=4157/50 J=83,14 J. Il '
     'valore di R è l’approssimazione prescritta, non viene sostituito silenziosamente con 8.',
 68: 'Derivazione nella primaria congelata PRIMA delle chiavi: Dallo stesso stato e per V_f>V_i, '
     'l’isoterma mantiene T iniziale; l’adiabatica reversibile raffredda il gas. Con capacità termiche '
     'positive, γ>1: per V>V_i il rapporto p_iso/p_ad=(V/V_i)^(γ−1)>1. Integrando p dV sullo stesso '
     'intervallo si ottiene W_iso>W_ad. Stesso volume finale non significa stesso stato finale o stesso '
     'calore.',
 69: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per l’adiabatica reversibile pV^γ è '
     'costante. Con V_f/V_i=4 e γ=3/2, p_i/p_f=4^(3/2)=(√4)³=8. Il rapporto inverso sarebbe 1/8. Il gas '
     'resta nel regime ideale con γ costante assegnato.',
 70: 'Derivazione nella primaria congelata PRIMA delle chiavi: Nel modello di gas perfetto chiuso, una '
     'lenta espansione isoterma ha ΔU=0 e W>0, quindi deve ricevere Q=W dal bagno: il contatto deve '
     'permettere scambio termico, non essere isolante. La reversibilità termica è il limite con '
     'differenza infinitesima di temperatura. Il testo originale non dichiara esplicitamente gas '
     'perfetto: non estendo Q=W a ogni gas reale, per il quale U può dipendere anche da V. Questo punto '
     'va verificato nella candidata autonoma.',
 71: 'Derivazione nella primaria congelata PRIMA delle chiavi: Nel piano con V verso destra e p verso '
     'l’alto, la percorrenza oraria dà lavoro uscente positivo. L’area triangolare è (1/2)·4 L·60 '
     'kPa=120 J. Non si usa tutto il rettangolo circoscritto e non si sommano i valori assoluti dei '
     'lavori dei tratti.',
 72: 'Derivazione nella primaria congelata PRIMA delle chiavi: Invertire il verso di percorrenza cambia '
     'il segno dell’integrale chiuso ∮p dV e conserva il suo modulo. Una curva oraria positiva diventa '
     'antioraria negativa; non cambiano soltanto i nomi degli stati.',
 73: 'Derivazione nella primaria congelata PRIMA delle chiavi: Una sequenza completa che riporta il '
     'fluido al suo stato iniziale è un ciclo. Il ritorno allo stato non obbliga calore e lavoro netti '
     'ad essere nulli, perché non sono funzioni di stato.',
 74: 'Derivazione nella primaria congelata PRIMA delle chiavi: La frequenza dei cicli è 150/60=5/2 s⁻¹. '
     'Con 24 J per ciclo, P_media=24·5/2=60 W. Il minuto va convertito in secondi; non sono 3600 W.',
 75: 'Derivazione nella primaria congelata PRIMA delle chiavi: Con calore entrante positivo, il calore '
     'netto è +400−300=+100 J. Per un ciclo del gas ΔU=0, quindi anche il lavoro netto uscente è 100 J. '
     '700 J sarebbe la somma dei moduli, non lo scambio netto.',
 76: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il lavoro per ciclo è 1,8/3=0,6 kJ. Per '
     'ΔU_ciclo=0, il modulo ceduto è Q_c=Q_h−W=2,0−0,6=1,4 kJ per ciclo. Non si sottraggono 1,8 kJ '
     'totali dai 2,0 kJ di un singolo ciclo.',
 77: 'Derivazione nella primaria congelata PRIMA delle chiavi: La percorrenza oraria di una curva '
     'semplice chiusa dà ∮p dV>0 con gli assi assegnati. L’espansione avviene mediamente alla pressione '
     'maggiore e la compressione a quella minore. La convenzione opposta sul lavoro invertirebbe il '
     'nome del segno, ma qui il lavoro del gas è uscente positivo.',
 78: 'Derivazione nella primaria congelata PRIMA delle chiavi: L’area del rettangolo è Δp·ΔV. Poiché 1 '
     'kPa·L=1 J, ΔV=150/50=3 L. I 50 kPa sono la separazione fra isobare, non la loro pressione '
     'assoluta.',
 79: 'Derivazione nella primaria congelata PRIMA delle chiavi: Tornando allo stesso stato termodinamico '
     'ogni funzione di stato del fluido ha variazione nulla: in particolare ΔU=0 e ΔS=0, e ritornano '
     'anche p,V,T. Calore e lavoro di ciclo possono invece essere non nulli. Prima di vedere le opzioni '
     'non considero esclusiva una coppia: qualunque coppia di vere funzioni di stato avrebbe questa '
     'proprietà.',
 80: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il calore netto entrante è 80+50−170=−40 '
     'J. Su un ciclo ΔU=0, dunque W_gas=Q_netto=−40 J. Il ciclo richiede 40 J di lavoro esterno; '
     'prendere il solo modulo perderebbe il segno richiesto.',
 81: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il limite di Carnot usa temperature '
     'assolute. Con la conversione esatta T/K=t/°C+273,15 si hanno T_h=450,15 K e T_c=300,15 K. Quindi '
     'η_max=(150/450,15)=1000/3001 e il valore percentuale è (100000/3001)%, circa 33,3% ad una cifra '
     'decimale. Usare 273 come approssimazione dichiarata darebbe 1/3, ma non lo sostituisco '
     'silenziosamente alla conversione esatta. Il rapporto diretto fra letture Celsius non è un '
     'rendimento termodinamico. Nella nuova edizione candidata le letture sono 176,85 e 26,85 °C: '
     'sommare 273,15 separatamente dà 450 e 300 K. Lo stesso modello indipendente fornisce '
     '100·(1−300/450)=100/3%. Il vecchio risultato 100000/3001% resta il controllo della diversa '
     'preparazione originale, non viene ritaggato.',
 82: 'Derivazione nella primaria congelata PRIMA delle chiavi: Kelvin–Planck vieta un dispositivo '
     'ciclico il cui unico effetto sia assorbire calore da una sola sorgente e convertirlo '
     'integralmente in lavoro. Non vieta Q=W in un processo non ciclico, che cambia lo stato del '
     'sistema. La qualificazione di ciclo e di unico effetto è essenziale; non invento l’opzione non '
     'ancora vista.',
 83: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per motore reversibile tra due sorgenti '
     'ideali η=1−T_c/T_h. Con η=2/5 e T_c=300 K, T_c/T_h=3/5 e T_h=300/(3/5)=500 K. Il dominio è '
     'T_h>T_c>0 e 0<η<1.',
 84: 'Derivazione nella primaria congelata PRIMA delle chiavi: Le due trasformazioni reversibili senza '
     'scambio di calore sono adiabatiche; nel ciclo reversibile sono anche isentropiche. Non sono '
     'genericamente isocore o isobare, e una trasformazione soltanto adiabatica non è sempre '
     'isentropica se irreversibile.',
 85: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il frigorifero trasferisce calore dal '
     'freddo al caldo consumando lavoro o producendo un altro effetto compensatore: non è il '
     'trasferimento come unico effetto proibito da Clausius. Nel ciclo semplice Q_h=Q_c+W_in. Non si '
     'trasforma il principio in divieto assoluto di trasferire calore al caldo.',
 86: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il rendimento è potenza meccanica utile '
     'divisa per potenza termica assorbita. Con η=0,22=11/50 e 1,50 kW=1500 W, P_utile=1500·11/50=330 '
     'W. Non si usa il limite reversibile come rendimento effettivo, perché qui quello effettivo è già '
     'dato.',
 87: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per motori ciclici tra le stesse due '
     'sorgenti ideali il reversibile raggiunge η_Carnot. Un motore con produzione positiva di entropia '
     'per attriti ha rendimento inferiore, o al più il limite se si considera dissipazione nulla. Non '
     'si può confrontare il lavoro assoluto di A e B senza confrontare anche i calori assorbiti; vale '
     'il confronto dei rendimenti.',
 88: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per una macchina termica ciclica fra '
     'T_h=600 K e T_c=300 K, il secondo principio impone Q_c/T_c−Q_h/T_h≥0. Con Q_h=900 J, il modulo '
     'minimo ceduto è Q_c,min=900·300/600=450 J, raggiunto solo al limite reversibile. Il testo breve '
     'non esplicita il ciclo: questo requisito va confermato nella candidata; non applico il limite a '
     'processi che immagazzinino energia nello stato finale.',
 89: 'Derivazione nella primaria congelata PRIMA delle chiavi: La parola è lavoro: rendimento= '
     'W_netto/Q_h. Q_h è il calore assorbito dalla sorgente calda, come quantità positiva, non il '
     'calore netto Q_h−Q_c che su un ciclo coinciderebbe con W.',
 90: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il bilancio del frigorifero ciclico dà '
     'Q_c=Q_h−W_in=200−50=150 J. Il coefficiente frigorifero è Q_c/W_in=150/50=3. Il rapporto '
     'Q_h/W_in=4 è il coefficiente della pompa di calore, non quello richiesto.',
 91: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per la sorgente ideale a T=320 K il '
     'calore ricevuto è −640 J. La variazione di entropia è ΔS=Q_sorgente/T=−2 J/K. Il segno negativo '
     'del singolo serbatoio non viola il principio sull’intero sistema isolato.',
 92: 'Derivazione nella primaria congelata PRIMA delle chiavi: Il fluido torna allo stesso stato: '
     'ΔS_fluido=0 anche se il ciclo è irreversibile. La produzione di entropia è positiva per '
     'irreversibilità effettive; l’entropia totale di fluido più ambiente aumenta. Non si confonde una '
     'produzione interna con la variazione della funzione di stato sul ciclo.',
 93: 'Derivazione nella primaria congelata PRIMA delle chiavi: L’unità SI dell’entropia è J/K, energia '
     'divisa per temperatura assoluta. È distinta da J·K e da un numero puro; dimensionalmente M L² T⁻² '
     'Θ⁻¹.',
 94: 'Derivazione nella primaria congelata PRIMA delle chiavi: m=10 g=1/100 kg e L_f=100 kJ/kg=100000 '
     'J/kg. Alla fusione reversibile isoterma il calore è mL_f=1000 J. A 250 K la variazione del '
     'materiale è +1000/250=+4 J/K. Non aggiungo un riscaldamento sensibile non dato.',
 95: 'Derivazione nella primaria congelata PRIMA delle chiavi: L’entropia è funzione di stato. Si può '
     'scegliere un percorso reversibile equivalente che colleghi gli stessi stati e calcolare '
     '∫δQ_rev/T. Non si deve usare necessariamente il calore reale del processo rapido diviso per una '
     'temperatura scelta; un processo adiabatico irreversibile può avere ΔS>0.',
 96: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per microstati accessibili equiprobabili '
     'vale S=k_B lnΩ. Il rapporto è Ω_f/Ω_i=48/12=4, quindi ΔS/k_B=ln 4=2 ln 2. Il risultato si lascia '
     'esatto, senza approssimare il logaritmo naturale con un calcolatore.',
 97: 'Derivazione nella primaria congelata PRIMA delle chiavi: Una singola configurazione microscopica '
     'compatibile con il macrostato è un microstato. Un macrostato descrive proprietà aggregate ed è '
     'compatibile con molti microstati; non è il nome della singola configurazione.',
 98: 'Derivazione nella primaria congelata PRIMA delle chiavi: La sorgente calda cambia entropia di '
     '−90/360=−1/4 J/K, quella fredda di +90/300=3/10 J/K. Per il trasferimento diretto senza altri '
     'scambi la produzione totale è 3/10−1/4=1/20 J/K=0,05 J/K, positiva. Non si sommano i due moduli '
     'positivi.',
 99: 'Derivazione nella primaria congelata PRIMA delle chiavi: Per l’intero sistema isolato nel modello '
     'termodinamico macroscopico deve valere ΔS_tot≥0. La diminuzione spontanea macroscopica di 4 J/K è '
     'incompatibile: bisogna rivedere il modello o il confine del sistema. Questo non riguarda il segno '
     'possibile della sola entropia di un sottosistema o le fluttuazioni microscopiche.',
 100: 'Derivazione nella primaria congelata PRIMA delle chiavi: Con capacità totale costante C=30 J/K e '
      'percorso reversibile a volume fisso, δQ_rev=C dT. Integro fra temperature assolute: ΔS=C '
      'ln(T_f/T_i)=30 ln(300/250)=30 ln(6/5) J/K. Il risultato è positivo ed esatto. Per controllo '
      'manuale 1/300<1/T<1/250 nell’intervallo interno, quindi 5<ΔS/(J/K)<6. Non uso tutto Q=1500 J '
      'diviso per un’unica temperatura come uguaglianza.'}
ASSUMPTIONS={51: 'Sistema chiuso, soli lavori del pistone contro pressione esterna costante; energie macroscopiche '
     'senza variazione.',
 52: 'Liquido chiuso in recipiente rigido adiabatico; albero capace di lavoro entrante; stati finali '
     'fermi alla stessa quota.',
 53: 'Compressione contro pressione positiva, convenzione del lavoro compiuto dal gas.',
 54: 'Sistema chiuso, lavoro uscente positivo e calore entrante positivo; nessuna variazione '
     'macroscopica.',
 55: 'Cammino quasi statico lineare in p(V), equilibrio meccanico al limite; solo lavoro pV.',
 56: 'I soli estremi di pressione non fissano volumi o integrale di percorso.',
 57: 'Energia interna come funzione di stato microscopica, distinta dal trasporto macroscopico.',
 58: 'Pressione esterna costante normale sul pistone; sezione e corsa in SI; avanzamento uscente.',
 59: 'Stesso stato fisico, osservatori inerziali galileiani; nessuna accelerazione fisica o '
     'riscaldamento.',
 60: 'Sistema chiuso adiabatico, solo lavoro energeticamente rilevante; aumento U positivo.',
 61: 'Gas perfetto chiuso, volume fisso, capacità termica positiva; pressione assoluta crescente.',
 62: 'Gas perfetto chiuso, Q=0; capacità TOTALE costante a volume costante usata come derivata di U '
     'rispetto T, non vincolo isocoro del processo.',
 63: 'Successione lenta di equilibri con p invariata e V variabile.',
 64: 'Quasi staticità possibile con dissipazione di attrito attiva; reversibilità complessiva assente.',
 65: 'Ampolla rigida, nessun lavoro ulteriore, capacità totale 12 J/K e Q 72 J; non si aggiunge una '
     'massa.',
 66: 'Gas perfetto di quantità e composizione fissate, estremi alla stessa T; U(T).',
 67: 'Gas perfetto chiuso, espansione isobara quasi statica, R 8,314 prescritta e solo lavoro di '
     'volume.',
 68: 'Stato iniziale comune, stesso volume finale maggiore, percorsi reversibili; capacità positive e '
     'gas perfetto.',
 69: 'Adiabatica reversibile, gamma 3/2 costante, pressioni e volumi positivi.',
 70: 'Gas PERFETTO chiuso isotermo, lavoro uscente positivo, energie macroscopiche ferme: il bagno deve '
     'fornire Q=W.',
 71: 'Ciclo semplice quasi statico, assi Vdestra/palto, orientazione oraria; base e altezza sono '
     'differenze positive.',
 72: 'Identico contorno ripercorso, solo orientazione invertita.',
 73: 'Ritorno allo stato termodinamico intero, non soltanto allo stesso volume.',
 74: '24 J per ciclo identico,150 cicli in 60 s, media sul periodo; nessuna ipotesi di potenza '
     'istantanea costante.',
 75: 'Calore entrante positivo, cessione negativa; il saldo è distinto dai singoli moduli.',
 76: 'Tre cicli IDENTICI:1,8 kJ è lavoro totale e 2,0 kJ è ingresso per ciascun ciclo; Qc richiesto '
     'come modulo.',
 77: 'Curva semplice chiusa in diagramma pV con convenzione di lavoro uscente.',
 78: 'Ciclo rettangolare orario; differenza delle pressioni 50 kPa non pressione assoluta di un ramo.',
 79: 'Fluido torna allo stesso stato anche se il ciclo è irreversibile; entropia del solo fluido '
     'distinta da quella dell’insieme.',
 80: 'Stato ciclico di tutte le energie, due apporti e una cessione con segni; lavoro uscente può '
     'risultare negativo.',
 81: 'Macchina CICLICA con soli due serbatoi ideali costanti; temperature Celsius convertite in kelvin '
     'con 273,15 esatto.',
 82: 'Vincolo simultaneo: ciclo, una sola sorgente, conversione integrale e nessun altro effetto.',
 83: 'Motore reversibile con due sorgenti positive;0≤eta<1 e caldo almeno freddo.',
 84: 'Due raccordi adiabatici E reversibili nel Carnot, distinti dalle isoterme di scambio.',
 85: 'Frigorifero ciclico con lavoro entrante, calori come moduli e bilancio Qh=Qc+Win.',
 86: 'Rendimento effettivo e potenze medie riferiti agli stessi cicli/durata; kW convertiti in W.',
 87: 'Stesse due sorgenti e soli scambi termici con esse; A reversibile, B con produzione interna netta '
     'positiva e lavoro utile positivo.',
 88: 'Macchina CICLICA che opera SOLTANTO fra 600/300 K, Qh 900 J per ciclo; minimoQc raggiunto nel '
     'limite reversibile.',
 89: 'Lavoro NETTO e calore caldo per lo stesso ciclo; rapporto adimensionale.',
 90: 'Bilancio ciclico frigorifero, lavoro entrante 50 J, caldo 200 J, freddo positivo 150 J.',
 91: 'Serbatoio ideale isoterma 320 K; calore riferito al serbatoio−640 J, non al corpo ricevente.',
 92: 'Fluido ciclico, insieme completo isolato con irreversibilità; variazione del fluido e produzione '
     'totale distinte.',
 93: 'Definizione termodinamica dS=deltaQrev/T: dimensione energia/temperatura, non energia o potenza.',
 94: 'Massa 0,010 kg, L 100000 J/kg, fusione reversibile isoterma 250 K.',
 95: 'Stessi stati di equilibrio dello stesso sistema e modelli noti; cammino reversibile di '
     'riferimento distinto dal cammino reale.',
 96: 'Conteggi interi positivi equiprobabili; logaritmo naturale di un rapporto adimensionale.',
 97: 'Una configurazione microscopica individuale, non il suo conteggio o il macrostato.',
 98: 'Due serbatoi ideali 360/300 K,90 J trasferiti e insieme isolato senza altri effetti; produzione '
     'uguale alla somma delle variazioni.',
 99: 'Intero sistema ISOLATO, processo macroscopico spontaneo; niente sottosistemi lasciati fuori dal '
     'confine.',
 100: 'Capacità TOTALE costante 30 J/K,250→300 K, percorso reversibile senza fase, solo riscaldamento a '
      'volume fisso.'}
DISTRACTORS={51: '95 J somma impropriamente i trasferimenti; 35 J omette il lavoro e −60 J omette il calore. La '
     'verifica è ΔU+W=Q.',
 52: 'Calore nullo non esclude lavoro. La rigidità elimina soltanto il lavoro di volume e la chiusura '
     'soltanto lo scambio di materia.',
 53: 'Il lavoro fatto sul gas ha modulo positivo, ma il lavoro uscente W è negativo. Il segno del '
     'calore resta da determinare.',
 54: 'Sottrarre ancora il lavoro dà −195 J; sommare i moduli dà 195 J. Nessuno ricostruisce ΔU=Q−W=−75 '
     'J.',
 55: '300 e 600 J sono i rettangoli limite; 150 J è soltanto il triangolo. Il verso opposto dà−450 J.',
 56: 'Una differenza di pressione non è un lavoro. Il lavoro non è funzione di stato e non è '
     'necessariamente nullo nei processi lenti.',
 57: 'Calore e lavoro sono trasferimenti. La pressione non è un’energia e la sola energia del centro di '
     'massa non descrive i contributi microscopici.',
 58: 'Un litro darebbe 100 J; 100 litri darebbero 10000 J. Un pistone che rientra cambia il segno del '
     'lavoro.',
 59: 'Cambiare osservatore non cambia materia, temperatura o energia interna dello stesso stato; può '
     'cambiare l’energia cinetica del centro di massa.',
 60: 'Un lavoro uscente di 180 J porterebbe ΔU=−180 J. Il lavoro nullo darebbe ΔU=0 e 360 J non '
     'ricostruirebbero il dato.',
 61: 'L’ascissa immutata esclude espansione. A p/T costante una pressione crescente esclude temperatura '
     'costante o calante.',
 62: 'Il segno +8 K inverte il verso del lavoro. Q=0 non significa ΔU=0; la capacità totale non va '
     'moltiplicata ancora per una massa.',
 63: 'Isocora, isoterma e adiabatica sono vincoli distinti. La pressione costante non chiude da sola un '
     'ciclo.',
 64: 'La lentezza non cancella la produzione di entropia. L’attrito non implica automaticamente '
     'isolamento termico o lavoro nullo.',
 65: 'Il prodotto 72·12 non ha dimensione kelvin. 12 copia il parametro della capacità; zero nega '
     'l’aumento energetico.',
 66: 'La temperatura invariata impone ΔU=0 nel gas perfetto; calore e lavoro possono restare non nulli. '
     'Un volume non è un’energia.',
 67: '8,314 copia il numero di R; 831,4 aggiunge un fattore dieci; 166,28 usa una mole invece di mezza. '
     'Zero richiederebbe un diverso vincolo.',
 68: 'Gli stessi estremi di volume non uguagliano integrali con pressioni diverse. L’isoterma resta '
     'sopra l’adiabatica dopo lo stato iniziale.',
 69: 'Quattro corrisponde a γ=1; due prende soltanto la radice; 1/8 è il rapporto inverso.',
 70: 'Un’adiabatica con lavoro uscente positivo ridurrebbe U. Ricevere materia non è necessario e '
     'contraddirebbe la chiusura.',
 71: '240 J è l’area del rettangolo e−120 J il verso inverso. Il ritorno di U non annulla il lavoro '
     'ciclico.',
 72: 'Non compare una nuova area o un fattore due: cambia soltanto il segno dell’integrale orientato.',
 73: 'Un ciclo non è per definizione una singola isoterma o un processo senza scambi.',
 74: '3600 copia il valore numerico del lavoro del minuto; manca la divisione per 60 s. 24 J per ciclo '
     'non sono 24 W; 0,16 non rappresenta lavoro totale diviso durata.',
 75: '700 J somma i moduli; −100 J inverte il segno; 400 J omette la cessione. La variazione ciclica di '
     'U è distinta dal calore netto.',
 76: '0,2 kJ mescola lavoro di tre cicli e calore di uno; 0,6 kJ è lavoro; 2,6 kJ somma invece di '
     'sottrarre; 4,2 kJ è il totale ceduto in tre cicli.',
 77: 'Il verso antiorario dà lavoro negativo. Un segmento verticale ha dV=0 e non racchiude da solo '
     'un’area.',
 78: 'Il prodotto 150·50 non dà un volume. Un intervallo di 1/3 L ricostruisce 50/3 J; zero annulla '
     'l’area.',
 79: 'Calore e lavoro non sono funzioni di stato. La produzione irreversibile non impone un aumento '
     'dell’entropia finale del solo fluido ciclico.',
 80: '40 J inverte il verso; 300 J somma i moduli; 130 J omette la cessione. Zero confonde il lavoro '
     'con ΔU.',
 81: '50% divide il salto per la temperatura fredda; 200/3% è il complemento; 75% supera Carnot; zero '
     'richiederebbe sorgenti uguali. Le letture Celsius non formano il rapporto fisico.',
 82: 'Lavoro dissipato per attrito, frigorifero alimentato e trasferimento caldo-freddo non hanno il '
     'solo effetto vietato da Kelvin–Planck.',
 83: '750 K divide per il rendimento; 180 K moltiplica il complemento e inverte caldo e freddo; 300 K '
     'darebbe rendimento nullo.',
 84: 'Isobare e isocore non impongono Q=0. Un’isoterma non collega due temperature diverse e l’attrito '
     'attivo nega la reversibilità.',
 85: 'La conservazione energetica non basta al secondo principio. Il lavoro esterno è l’altro effetto '
     'che accompagna il trasferimento freddo-caldo.',
 86: '0,33 W conserva il numero in kW senza conversione; 1500 W richiede rendimento unitario; 1170 W è '
     'calore ceduto. Dividere per il rendimento darebbe lavoro oltre l’ingresso.',
 87: 'Il riscaldamento da attrito non aumenta l’efficienza. La ciclicità non significa rendimento uno e '
     'la reversibilità non significa rendimento zero.',
 88: 'Calore ceduto nullo richiederebbe rendimento uno. 300 J copia il numero della temperatura; 900 J '
     'darebbe lavoro nullo. Il minimo 450 J deriva dal vincolo ciclico.',
 89: 'Il rapporto fra calore ceduto e assorbito è il complemento. Temperatura e volume non sono '
     'energie; le variazioni di stato cicliche non sono il lavoro utile.',
 90: 'Quattro è il COP della pompa di calore; 1/3 il rapporto inverso. Il bilancio 150+50=200 J esclude '
     'creazione di energia.',
 91: 'Il modulo +2 J/K perde il verso. Temperatura costante non implica entropia costante; −640 J è '
     'energia.',
 92: 'L’entropia del solo fluido non dà il bilancio dell’insieme. La produzione positiva può essere '
     'trasferita all’ambiente senza accumularsi nel fluido.',
 93: 'K/J è il reciproco. J è energia; W/K ha un fattore tempo in più al denominatore; N/K manca di un '
     'fattore lunghezza.',
 94: '1000 J è energia, non entropia. Zero ignora la fase; 4000 J/K usa 10 kg invece di 10 g; il segno '
     'opposto descriverebbe la solidificazione inversa.',
 95: 'Il calore reale diviso per la temperatura iniziale non è l’integrale reversibile. La rapidità non '
     'impone ΔS=0 e cambiare gli estremi cambia il problema.',
 96: 'ln 36 usa la differenza; ln 60 la somma; quattro omette il logaritmo; −ln 4 scambia gli stati.',
 97: 'Il calore non è una configurazione. Macrostato e microstato sono concetti diversi; temperatura e '
     'rendimento non specificano una configurazione completa.',
 98: 'Il segno negativo inverte i versi; 11/20 J/K somma i moduli. 1/4 e 3/10 J/K omettono uno dei '
     'serbatoi.',
 99: 'Conservare energia non autorizza entropia totale isolata negativa. La lentezza non cancella il '
     'vincolo e un sottosistema non coincide con l’insieme.',
 100: '6 e 5 J/K sono limiti, non l’integrale. Il logaritmo inverso dà segno negativo; 1500 copia il '
      'numero del calore senza integrare 1/T.'}
