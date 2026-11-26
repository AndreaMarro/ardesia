"""Per-ID complete reading after Root prompt-first preparation and A compensation."""
READING_COMPLETE=True
PRIMARY_MANUAL={51: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: I rami '
     'hanno la stessa tensione, quindi le conduttanze si sommano:\n'
     '1/Rp=1/30+1/60=3/60=1/20, Rp=20Ω. Il resistore da 10Ω è attraversato dalla corrente\n'
     'totale e si somma a Rp: Rtot=30Ω. Ohm dà I=9/30=3/10 A=0,3 A. Non si sommano tutti\n'
     'e tre i resistori: i primi due condividono i nodi.',
 52: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: A '
     'tensione fissata P=VI e I=V/R, dunque P=V²/R. Per R positive diverse\n'
     'e **V non nulla**, il resistore minore dissipa di più. Se V=0 entrambe le potenze\n'
     'sono nulle: rendere esplicita la tensione non nulla se si chiede un confronto\n'
     'strettamente maggiore. La regola P=I²R non autorizza a tenere uguale I nei rami.',
 53: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il '
     'nome è nodo. Un filo ideale non presenta caduta di potenziale:\n'
     'tutti gli estremi collegati da quel filo appartengono allo stesso nodo\n'
     'equipotenziale, anche se il disegno li dispone lontani.',
 54: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: I=20 '
     'mA=20/1000 A=1/50 A. La potenza Joule è I²R=(1/2500)100=1/25 W.\n'
     'Per 30 s l’energia è E=Pt=30/25=6/5 J=1,2 J. Il quadrato riguarda anche il fattore\n'
     'di conversione milli; non si moltiplica semplicemente I per R per ottenere energia.',
 55: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Dal '
     'parallelo 1/4=1/12+1/Rx. Sottraggo: 1/Rx=3/12−1/12=2/12=1/6.\n'
     'Quindi Rx=6Ω. Controllo: l’equivalente 4Ω è minore di entrambi i resistori\n'
     'positivi 6 e 12Ω. La formula inversa è Rx=Req R/(R−Req), con 0<Req<R.',
 56: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La '
     'sorgente ideale mantiene V; il resistore rimasto mantiene R.\n'
     'La sua corrente V/R non cambia. Cambiano la corrente totale e la potenza totale\n'
     'erogate dalla sorgente, non la tensione del ramo superstite. La conclusione\n'
     'richiede il generatore ideale, non una batteria con resistenza interna arbitraria.',
 57: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Effetto Joule: l’energia elettrica ricevuta dal resistore si\n'
     'trasferisce alla sua energia interna. L’energia totale non scompare.',
 58: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Nei '
     'due resistori in serie passa la stessa corrente: I=4/80=1/20 A.\n'
     'Sul secondo devono cadere 12−4=8 V. Pertanto R₂=8/(1/20)=160Ω. Il rapporto delle\n'
     'tensioni 8/4=2 coincide con quello delle resistenze 160/80=2.',
 59: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Occorre seguire i fili: entrambi i resistori devono avere i due\n'
     'estremi collegati alla stessa coppia di nodi. Vicinanza, altezza o orientamento\n'
     'grafico non stabiliscono il collegamento elettrico.',
 60: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Per R '
     'costante, P=V²/R. Dimezzare V moltiplica P per(1/2)²=1/4:\n'
     '8 W diventano 2 W. Anche I si dimezza; il prodotto VI diventa un quarto.',
 61: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Per il '
     'condensatore lineare la pendenza Q/V è C, quindi anche\n'
     'ΔQ=CΔV. La variazione di tensione è 5−2=3 V, non 5 V. C=18μC/3 V=6μF. I prefissi si\n'
     'corrispondono perché μC/V=μF.',
 62: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Nel '
     'modello piano C=εA/d. Allontanare le armature riduce C; a Q\n'
     'fissata |V|=|Q|/C aumenta nella stessa proporzione di d. **Q deve essere non\n'
     'nulla** per un aumento stretto; se il condensatore è scarico resta V=0. Scrivere\n'
     '«condensatore carico» e chiedere il modulo della tensione evita ambiguità di segno.',
 63: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'L’unità è il farad:1 F=1 C/V. La capacità confronta la carica di una\n'
     'armatura con la differenza di potenziale, non con una corrente.',
 64: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Inverto C=ε₀A/d: A=Cd/ε₀. Il rapporto 88,5/8,85 vale 10; i pF si\n'
     'cancellano fra C e il valore di ε₀ espresso in pF/m. Risulta A=10 m×(1/1000)m\n'
     '=1/100 m². Poiché 1 m²=10⁴cm², l’area è 100 cm². La conversione dell’area è quadratica;\n'
     'non basta moltiplicare per 100.',
 65: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il '
     'lavoro elementare di carica è dU=Vdq: il grafico direttamente\n'
     'associato al lavoro ha q orizzontale e V verticale. Per C costante V=q/C e\n'
     'l’integrale da 0 aQ è il triangolo U=QV/2. **Cautela per le alternative:** anche\n'
     'il grafico inverso Q(V), se lineare, ha area numericamente uguale CV²/2.\n'
     'Non classificarlo automaticamente come distrattore falso. Se si vuole una sola\n'
     'scelta, specificare il grafico dell’integrale Vdq oppure costruire alternative\n'
     'senza due triangoli entrambi equivalenti nel modello lineare.',
 66: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'U=CV²/2, perciò ΔU=(5μF/2)(4²−2²)V²=(5/2)× 12μJ=30μJ. Sottrarre\n'
     'prima le tensioni e poi elevare al quadrato darebbe una diversa grandezza.\n'
     'μF·V²=μJ, controllato anche nel percorso SI indipendente.',
 67: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il '
     'generatore ideale collegato fissa la differenza di potenziale.\n'
     'Inserendo il dielettrico cresce C e il generatore può fornire altra carica:\n'
     'non si conserva automaticamente Q come nel condensatore isolato.',
 68: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Con la '
     'tensione **mantenuta a 8 V dal generatore**, U=CV²/2 è\n'
     'proporzionale a C. Se C raddoppia,16μJ diventano 32μJ. Se invece si scollegasse\n'
     'la sorgente e si fissasse Q, varrebbe U=Q²/(2 C) e il risultato sarebbe diverso.\n'
     'Esplicitare che il collegamento resta durante l’inserimento.',
 69: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Q è il '
     'modulo su una sola armatura:7μC. La carica netta dell’intero\n'
     'condensatore è zero, mentre la somma dei moduli sarebbe 14μC: nessuna delle due\n'
     'sostituisce Q nella definizione data.',
 70: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Da '
     'U=CV²/2 ricavo |V|=√(2 U/C). Il radicando è 200μJ/(8μF)=25 V²;\n'
     'la radice positiva è 5 V. Non serve approssimare una radice irrazionale. La\n'
     'richiesta del modulo seleziona il valore non negativo.',
 71: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: In '
     'parallelo Ctot=2+3+5=10μF. Alla tensione 4 V la carica del nodo\n'
     'positivo è Qtot=Ctot V=40μC. Per chiamarla carica «fornita» dal generatore\n'
     'dall’inizio, precisare che i condensatori erano inizialmente scarichi; altrimenti\n'
     '40μC è la carica finale e non necessariamente la variazione fornita.',
 72: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il '
     'nodo centrale isolato e inizialmente neutro impone cariche\n'
     'opposte e uguali in modulo sulle due sue armature. Quindi |Vᵢ|=|Q|/Cᵢ e il\n'
     'condensatore minore sostiene la tensione maggiore. Per il confronto stretto\n'
     'occorre una carica comune non nulla; a circuito scarico entrambe le tensioni sono zero.',
 73: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Si '
     'conserva la carica elettrica algebrica totale del nodo isolato,\n'
     'inizialmente zero. Le cariche sulle sue parti si possono ridistribuire; non\n'
     'si conservano separatamente su ciascuna armatura durante il transitorio.',
 74: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Per la '
     'serie 3=9 Cx/(9+Cx). Moltiplico:27+3 Cx=9 Cx, dunque 6 Cx=27 e\n'
     'Cx=27/6=9/2μF=4,5μF. L’inversa è Cx=Ceq C₁/(C₁−Ceq), con 0<Ceq<C₁.',
 75: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Ciascun nuovo nodo unisce una carica+CV e una−CV, quindi parte\n'
     'con carica netta zero. Dopo il transitorio reale dissipativo il modulo della\n'
     'tensione comune è 0 V. L’energia iniziale dei due campi non può essere imposta\n'
     'costante ai soli condensatori: va nel circuito e nell’ambiente. Un collegamento\n'
     'idealizzato senza alcuna dissipazione richiederebbe descrivere il transitorio.',
 76: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Prima '
     'il parallelo:3+6=9μF. Poi la serie di due 9μF:\n'
     'Ceq=9 × 9/(9+9)=81/18=9/2μF=4,5μF. Il raggruppamento va seguito attraverso i nodi,\n'
     'non sommando tutti i valori senza distinguere i collegamenti.',
 77: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il '
     'collegamento è in parallelo. La condizione determinante è la\n'
     'stessa coppia di nodi; la stessa tensione ne segue come proprietà elettrica.',
 78: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La '
     'carica del nuovo nodo positivo è 2μF× 8 V+6μF× 4 V=16+24=40μC.\n'
     'La capacità complessiva è 8μF: Vf=40/8=5 V, compresa fra 4 e 8 V. Il primo perde 6μC\n'
     'e il secondo ne riceve 6. I campi passano da 112 a 100μJ: conservare la sola energia\n'
     'dei condensatori darebbe una soluzione scorretta del transitorio reale.',
 79: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Inizialmente Uᵢ=CV²/2. Alla fine la capacità totale è 2 C e la\n'
     'tensione V/2, quindi Uf=(2 C)(V/2)²/2=CV²/4=Uᵢ/2. Ogni condensatore finale ha un\n'
     'quarto dell’energia iniziale, ma ce ne sono due. La carica dei nodi si conserva.',
 80: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Cp=4+12=16μF e Cs=4 × 12/(4+12)=3μF. Il rapporto esatto è 16/3,\n'
     'adimensionale. Non richiedere la trascrizione di una rappresentazione decimale\n'
     'infinita in un input Number a tolleranza zero: usare un risultato simbolico\n'
     'selezionabile/accettato oppure una parametrizzazione o approssimazione manuale\n'
     'con criterio di valutazione esplicito. La formula generale è(C₁+C₂)²/(C₁C₂).',
 81: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Il '
     'campo del filo è proporzionale alla corrente orientata.\n'
     'Invertire I inverte il contributo B nel punto esterno fissato. Anche il modulo\n'
     'resta uguale se si mantiene uguale |I|; non si può dedurre il campo totale in\n'
     'presenza di altri contributi non specificati.',
 82: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Poiché '
     'v è perpendicolare a B, F=|q|vB. Quindi\n'
     '|q|=2 × 10⁻⁶/(400 × 1/2)C=10⁻⁸C=10 nC. È il modulo della carica, non il suo segno.\n'
     'La conversione micro→nano dà un fattore 1000, verificato nel percorso Pint.',
 83: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Antiparallela. Con q, v e B non nulli, F=qv×B è zero quando\n'
     'sinθ=0, cioè per θ=0 oppureπ. Non è necessario che la particella sia ferma.',
 84: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: F=IℓB '
     'sin 30°=4 ×(3/10)×(1/5)×(1/2)N=3/25 N=0,12 N.\n'
     'Il seno 30° è esattamente 1/2; non occorre una calcolatrice. L’angolo è quello\n'
     'fra la direzione della corrente nel filo e B.',
 85: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Scelgo '
     'x a destra, y in alto, z uscente. Per la velocità+x e\n'
     'campo−z, v×B è+y. La carica negativa inverte quel verso: forza−y, verso il\n'
     'basso. Il prodotto vettoriale è verificato anche con matrici simboliche.',
 86: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Un '
     'quarto di periodo dura 0,40 ms, dunque T=4 × 0,40=1,60 ms.\n'
     'f=1/T=1000/1,6 Hz=10000/16 Hz=625 Hz. Moltiplicare per quattro la frequenza\n'
     'anziché ricostruire prima il periodo confonderebbe tempo e inverso del tempo.',
 87: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La '
     'traiettoria è un’elica. La componente parallela non subisce\n'
     'la forza magnetica e resta costante; quella perpendicolare ruota. Il cerchio\n'
     'è il caso limite con componente parallela nulla, escluso nel prompt.',
 88: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: La '
     'potenza magnetica è q(v×B)·v=0 in ogni istante.\n'
     'La velocità cambia direzione, ma non modulo: ΔK=0 J anche dopo la deviazione 90°.\n'
     'L’identità è simbolica per componenti generiche, non basata su un singolo disegno.',
 89: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Dal '
     'moto circolare r=p/(|q|B). A parità di p e B, la carica+2 e\n'
     'ha raggio metà di quella+e. Non serve conoscere separatamente massa e velocità.',
 90: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'L’assenza di deviazione richiede |q|E=|q|vB nelle condizioni\n'
     'perpendicolari date. v=E/B=1200/(1/25)=30000 m/s. La carica si cancella perché\n'
     'è non nulla; l’opposizione dei versi è già assegnata dal prompt.',
 91: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Con la '
     'normale scelta,\n'
     'Φ=BAcos 60°=(3/10)(2/100)(1/2)Wb=3/1000 Wb=3 mWb. Il segno è positivo rispetto\n'
     'a quella normale. La formula, la conversione e il controllo Pint sono derivati\n'
     'qui, ma avevo già visto il valore 3 nel vecchio test edizioni: serve la risoluzione\n'
     'source-only distinta A richiesta, prima di dichiarare cecità completa del percorso. La limitata '
     'esposizione Root resta dichiarata. La risoluzione A db 4 f 4 c 7 e dal solo prompt precede sia il '
     'modello Root sia le candidate; il confronto esatto conferma +3 mWb.',
 92: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Φ è '
     'costante perché campo, area e orientamento non cambiano e la\n'
     'spira è ferma. Faraday dà ℰ=−dΦ/dt=0. Non serve che Φ stesso sia zero.',
 93: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Lenz. '
     'La risposta indotta si oppone alla variazione del flusso\n'
     'che la produce, non necessariamente al campo esterno preso isolatamente.',
 94: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     '|ℰmedia|=N|ΔΦ/Δt|, dunque il tasso medio per spira è\n'
     '1,6/80=16/800=1/50 Wb/s=0,020 Wb/s. È un tasso medio: senza andamento temporale\n'
     'non si conosce il valore istantaneo della derivata in ogni istante.',
 95: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Oraria '
     'dall’altro lato. Il moto fisico della carica non cambia;\n'
     'cambia il lato da cui si guarda e quindi il nome dell’orientamento apparente.',
 96: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Prima '
     'Φᵢ=BA=0,005 Wb, dopo Φf=−BA=−0,005 Wb.\n'
     'ΔΦ=−0,010 Wb e |ℰmedia|=0,010/0,10=0,10 V. Il mezzo giro cambia il segno del\n'
     'flusso; usare soltanto BA per la variazione perderebbe il fattore due.',
 97: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Manca '
     'una corrente di conduzione che percorra continuamente\n'
     'l’intera spira aperta attraverso l’interruzione isolante. Non per questo\n'
     'scompaiono il campo elettrico indotto o la f.e.m.; restano possibili fenomeni\n'
     'transitori, accumulo di carica e contributi di spostamento nel gap.',
 98: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Con '
     'resistenza costante e autoinduzione trascurabile,\n'
     'I=−(1/R)dΦ/dt. Integrando, la carica netta ha modulo |ΔΦ|/R=0,030/5 C\n'
     '=0,006 C=6 mC. La monotonia evita di confondere questo modulo con una somma\n'
     'di passaggi di carica in versi alternati.',
 99: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: '
     'Durante l’ingresso aumenta il flusso entrante nel foglio.\n'
     'L’induzione richiede un contributo uscente: la corrente è antioraria vista\n'
     'dal davanti. Questa risposta si oppone all’ingresso e richiede lavoro esterno.',
 100: 'Derivazione Root source-only congelata prima delle candidate; successiva verifica distinta A: Nei '
      'primi 4 ms il modulo della f.e.m. è 8 mWb/4 ms=2 V, nei successivi 4 ms\n'
      'è zero. Sull’intero intervallo: |ℰmedia|=8 mWb/8 ms=1 V. I due prefissi milli si\n'
      'cancellano. Usare 2 V risponderebbe soltanto al primo tratto, non agli 8 ms richiesti.'}
ASSUMPTIONS={51: 'Resistori positivi ohmici, due nodi comuni al parallelo e tratto esterno attraversato dalla corrente '
     'totale; generatore ideale 9 V.',
 52: 'Due resistenze positive diverse, tensione comune NON NULLA; nessuna corrente comune assunta nei '
     'rami.',
 53: 'Estremi connessi esclusivamente da filo ideale, nessun componente interposto; potenziale comune.',
 54: 'Corrente costante 20 mA, resistenza invariata 100 Ω, intera durata 30 s; energia elettrica '
     'trasformata distinta dalla potenza.',
 55: 'Due rami passivi positivi; equivalente 4 Ω minore del ramo noto 12 Ω; residuo di conduttanza '
     'positivo.',
 56: 'Generatore ideale mantiene V e ramo superstite mantiene R; apertura soltanto dell’altro ramo.',
 57: 'Resistore dissipativo; energia interna e trasferimento all’ambiente distinti; regime termico '
     'stazionario non elimina potenza.',
 58: 'Serie senza derivazioni, sorgente ideale 12 V, prima caduta 4 V su 80 Ω; corrente comune positiva.',
 59: 'Connettività di entrambi i terminali alla stessa coppia di nodi, senza inferenza dalla vicinanza '
     'grafica.',
 60: 'Resistenza ohmica invariata; modulo V finale metà e potenza iniziale positiva 8 W.',
 61: 'Condensatore lineare invariato; incrementi coerenti di modulo Q su una sola armatura e modulo V.',
 62: 'Piastre cariche Q>0 isolate; area e permittività invariate, bordi trascurati nel regime piano.',
 63: 'Capacità definita mediante modulo su una sola armatura e modulo della tensione; unità SI C/V.',
 64: 'Costante ε₀ numerica prescritta come modello; distanza 1 mm piccola rispetto al lato 10 cm; area '
     'affacciata e area della sezione non confuse.',
 65: 'Condensatore lineare inizialmente scarico, caricamento lento; lavoro ∫V dq, tutte le alternative '
     'lette; il grafico duale Q(V) non è proposto come falso.',
 66: 'Stessa capacità positiva, due tensioni in modulo con origine energetica scarica comune; differenza '
     'di quadrati.',
 67: 'Dielettrico lineare, generatore ideale collegato durante inserimento; caso non nullo specificato '
     'nella formula del rapporto.',
 68: 'Generatore da 8 V mantenuto per intero; capacità raddoppiata e energia iniziale 16 μJ, campo '
     'distinto dal lavoro totale del generatore.',
 69: 'Cariche opposte +7 e −7 μC, Q definito come modulo su UNA armatura; totale algebrico e somma dei '
     'moduli distinti.',
 70: 'Capacità positiva 8 μF, energia 100 μJ, richiesta del modulo sceglie radice non negativa; segno '
     'della polarità non identificato.',
 71: 'Tre condensatori inizialmente scarichi fra gli stessi due nodi, sorgente 4 V; carica fornita al solo '
     'nodo positivo.',
 72: 'Capacità positive diverse, nodo centrale isolato e inizialmente neutro, carica comune Q>0 per '
     'confronto stretto.',
 73: 'Nodo intermedio isolato e inizialmente neutro; nessuna conduzione libera attraverso dielettrici '
     'ideali.',
 74: 'Serie con nodo intermedio neutro, capacità note positive ed equivalente 3<9 μF; inversa nel ramo '
     'fisico positivo.',
 75: 'Condensatori identici C>0,V>0 isolati da sorgenti, polarità opposte; resistenza positiva consente '
     'esaurimento del transitorio.',
 76: 'Due nodi comuni al parallelo 3 e 6 μF; serie con 9 μF, nodo intermedio neutro e isolato.',
 77: 'Stessa coppia di nodi distinti, capacità non necessariamente uguali; un solo estremo comune non '
     'basta.',
 78: 'Condensatori lineari isolati da generatori, positive insieme; transitorio resistivo esaurito, carica '
     'algebrica dei nodi conservata.',
 79: 'Condensatori identici C>0, uno carico V>0 e altro scarico; resistenza positiva, stato finale '
     'elettrostatico; energia totale dei due campi.',
 80: 'Stessi componenti positivi in due preparazioni topologiche distinte, nodo intermedio neutro per '
     'serie; rapporto adimensionale esatto.',
 81: 'Contributo del solo filo lungo, punto esterno fisso, corrente non nulla invertita a modulo '
     'invariato; campo terrestre non incluso.',
 82: 'Velocità perpendicolare al campo, F e B assegnati in modulo; segno della carica non inferibile dal '
     'solo modulo.',
 83: 'q, v e B non nulli; la nullità del prodotto vettoriale deriva dall’angolo, non da neutralità o '
     'velocità zero.',
 84: 'Segmento rettilineo, campo uniforme, angolo 30° rispetto alla corrente; seno esatto 1/2.',
 85: 'q negativa, v a destra e B entrante nel foglio; assi x destra,y alto,z uscente.',
 86: 'Campo uniforme, regime non relativistico, rotazione uniforme; 0,40 ms è un QUARTO, non periodo '
     'completo.',
 87: 'Campo uniforme non nullo e nessun’altra forza; due componenti iniziali della velocità non nulle, '
     'regime non relativistico.',
 88: 'Sola forza magnetica statica uniforme; F perpendicolare a v in ogni istante e teorema lavoro-energia '
     'applicato all’intero arco.',
 89: 'Modulo della quantità di moto non nullo comune, B>0 comune, ingressi perpendicolari; nessuna '
     'uguaglianza separata di m o v necessaria.',
 90: 'Particella positiva non relativistica, campi incrociati e forze opposte, nessun’altra forza; q si '
     'cancella solo dopo il bilancio vettoriale.',
 91: 'Campo uniforme, area positiva, normale scelta e angolo 60° dalla normale; flusso orientato positivo.',
 92: 'Spira ferma, B e geometria costanti; induzione di quel campo distinta da eventuali altre sorgenti '
     'elettriche.',
 93: 'Verso di percorrenza associato alla normale tramite mano destra; Lenz contrasta variazione e non '
     'sempre campo esterno.',
 94: '80 spire identiche con stessa variazione per spira; modulo della media orientata distinto dalla '
     'media dei moduli.',
 95: 'Stessa corrente e stesso istante, soli osservatori su lati opposti; nessuna inversione fisica della '
     'corrente.',
 96: 'Normale materiale seguita nel mezzo giro, una spira, estremi concorde/discorde; media non richiede '
     'velocità angolare costante.',
 97: 'Interruzione isolante ideale impedisce conduzione continua lungo intero anello; f.e.m., tensioni e '
     'transitori non automaticamente nulli.',
 98: 'Singola spira chiusa puramente resistiva con R costante positiva e autoinduzione trascurabile; '
     'flusso monotono per uguagliare modulo netto e passaggi nello stesso verso.',
 99: 'Ingresso in regione B entrante, area immersa crescente; spira resistiva chiusa e autoinduzione '
     'trascurabile, vista frontale fissata.',
 100: 'Una spira, rampa 4 ms seguita da plateau 4 ms; media sull’intero intervallo 8 ms, nessuna '
      'inversione del segno.'}
DISTRACTORS={51: '0,09 A somma i tre R; 0,45 omette 10 Ω; 0,90 usa soltanto 10 Ω; 3 A richiederebbe Rtot=3 Ω<10 Ω.',
 52: 'A V comune P inversa a R: usare soltanto I²R dimentica correnti diverse; V=0 è escluso.',
 53: 'Maglia è percorso chiuso, equivalente è risposta ai morsetti e generatore è componente, non insieme '
     'equipotenziale.',
 54: '0,040 J copia la potenza numerica; 1200000 J usa 20 A; 1200 J ha errore mille, 60 J non soddisfa '
     'I²Rt.',
 55: '8 Ω usa sottrazione da serie, 1/6 copia conduttanza in siemens; 12·6/18=4 controlla l’inversa.',
 56: 'Raddoppio/dimezzamento richiedono cambio V o R; apertura di un ramo non apre il superstite né '
     'conserva corrente totale.',
 57: 'Fotoelettrico è emissione sotto luce; Faraday è induzione; dissipazione non annulla conservazione '
     'energetica completa.',
 58: '240 Ω assegna tutti 12 V al secondo; 40 Ω inverte le cadute; 12/(80+160)=1/20 A ricostruisce 4 V.',
 59: 'Un solo terminale comune, valore uguale e posizione grafica non impongono entrambi i nodi.',
 60: '4 W assume legge lineare; 32 W inverte rapporto al quadrato; 8 W ignora variazione di V.',
 61: '18/5 e 18/2 μF mescolano incremento con lettura; 6·3=18 ricostruisce ΔQ.',
 62: 'Vecchia sorgente scollegata non fissa V; isolamento non annulla campo; polarità non si inverte '
     'allontanando piastre.',
 63: 'Coulomb misura carica, volt tensione, ohm resistenza e tesla campo; farad è C/V.',
 64: '1 cm² usa conversione lineare per area; 10000 cm² richiede distanza 0,10 m alla C assegnata, non 1 '
     'mm; vecchia attribuzione al fattore mille respinta.',
 65: 'Altri assi proposti danno K·s, Ω·m, T·s o C·s, non J; nessuna seconda alternativa duale con stessa '
     'area è presente.',
 66: '40 μJ finale e 10 μJ iniziale non aumento; C(ΔV)²/2 coincide qui con 10 μJ per caso, non legge '
     'corretta.',
 67: 'Carica, C e U possono variare; dielettrico non cortocircuita e generatore scambia carica mantenendo '
     'V.',
 68: '8 μJ usa isolamento a Q fissa; 16 μJ impone conservazione del solo campo; lavoro generatore '
     'distinto.',
 69: '14 μC conta entrambe le armature, zero totale algebrico, valori negativi non moduli.',
 70: '25 V copia V²; 5/2 V darebbe 25 μJ; radice negativa non è modulo.',
 71: '10 copia Ctot in μF; 80 μC somma entrambi i moduli; zero è totale di entrambi i nodi.',
 72: 'Regola del parallelo non applicabile alla serie; Q=0 darebbe uguaglianza ma è escluso.',
 73: 'Tensioni ed energie individuali non conservate durante carica; conduzione non nulla nel dielettrico '
     'contraddice isolamento.',
 74: '6/12 μF sottraggono/sommano direttamente; 2/9 μF copia coefficiente del reciproco con unità '
     'sbagliata.',
 75: '2 V ignora nuove polarità, V/2 usa preparazione scarico/carico diversa; resistenza non crea carica '
     'finale del nodo.',
 76: '18 μF somma tutto in parallelo; 2 μF mette in serie i componenti interni; 9 μF omette secondo blocco '
     'in serie.',
 77: 'Un solo nodo comune o uguaglianza dei C non definiscono parallelo; nodi distinti non sono corto '
     'necessario.',
 78: '6 V media semplice richiede capacità uguali, 12 V somma tensioni; energia del solo campo non '
     'conservata nel transitorio resistivo.',
 79: 'Totale finale somma due energie da un quarto ciascuna; carica conservata non implica U conservata, '
     'finale positivo.',
 80: '3/16 reciproco; 16 e 3 copiano singoli equivalenti. Alternativa 4 richiederebbe Cp=12 μF con Cs=3 '
     'μF, non 16; vecchia attribuzione al rapporto dei componenti respinta.',
 81: 'Filo fisso non impone corrente fissa; punto fisso conserva distanza e inversione I cambia tangente '
     'orientata.',
 82: '0,010 nC confonde nano/micro; 1000 nC produce 200 μN, non 2 μN; il segno non è determinato.',
 83: '90° massimizza forza, 45° non annulla seno, uniformità spaziale non annulla prodotto vettoriale.',
 84: '0,24 N omette seno, 0,06 N dimezza due volte, 1,2 N errore dieci, zero richiede fattore nullo o '
     'parallelismo.',
 85: 'Alto corrisponde q positiva; destra non perpendicolare a v; entrante/uscente parallelo a B '
     'incompatibile con v×B.',
 86: '2500 Hz usa quarto come periodo; 0,625 ignora milli; 10000 moltiplica reciproco del quarto per '
     'quattro.',
 87: 'Cerchio/retta richiedono una componente nulla esclusa; parabola o raggio crescente richiedono '
     'diversa dinamica/energia.',
 88: 'Forza non nulla non implica lavoro; deviazione di 90° non moltiplica K; segno q cambia curvatura ma '
     'non lavoro nullo.',
 89: 'Stesso p non rende uguali raggi se |q| differisce; temperatura irrilevante; segno comune non '
     'cancella curvatura.',
 90: '48 copia EB; 30 m/s dà vB=1,2 V/m; cancellazione q valida nel bilancio con versi opposti.',
 91: '6 mWb omette coseno, −3 inverte normale; sin 60° non proiezione normale, sin 30° dal piano invece '
     'equivalente.',
 92: 'BA è flusso Wb, non f.e.m. V; R non crea variazione di flusso, altre sorgenti non sono induzione di '
     'quel campo.',
 93: 'Ohm, Joule, Coulomb e Snell identificano leggi differenti e non orientazione dell’induzione.',
 94: '128 moltiplica per N, 1,6 attribuisce bobina a singola spira, 0,20 errore dieci; media non derivata '
     'istantanea.',
 95: 'Ancora antioraria conserva riferimento vecchio; zero/alternato inventano cambi fisici da '
     'osservazione.',
 96: '0,050 V usa BA, zero confonde moduli con flussi orientati; 0,0050 V copia coefficiente BA senza '
     'variazione/durata.',
 97: 'Apertura non annulla B imposto, dΦ/dt, f.e.m. o tutte le tensioni; manca soltanto la conduzione '
     'completa.',
 98: '150 mC copia numericamente ΔΦR con dimensione errata; 0,006 mC omette conversione; inversioni di '
     'andamento distinguono netto e totale transitato.',
 99: 'Orario rinforza aumento entrante; uniformità interna non mantiene area immersa; fase interamente '
     'dentro ha induzione nulla e non è quella chiesta.',
 100: '2 V limita alla rampa, zero al plateau; 0,001 converte un solo milli; media orientata negativa e '
      'modulo positivo.'}
