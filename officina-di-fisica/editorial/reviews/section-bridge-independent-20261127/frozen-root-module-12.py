"""Per-ID independent manual reading after final candidates and complete figures."""
READING_COMPLETE=True
PRIMARY_MANUAL={51: 'Continuità stazionaria incomprimibile senza rami: Q=A v è comune. Per portata non nulla, una sezione '
     'minore richiede rapidità maggiore. Bernoulli lungo la stessa linea di corrente orizzontale, senza '
     'perdite o macchine, dà p+ρv²/2 costante: alla maggiore rapidità corrisponde pressione statica minore. '
     'Non è una perdita di portata; pressione e rapidità sono grandezze diverse.',
 52: 'Bernoulli orizzontale: p_f−p_i=(ρ/2)(v_i²−v_f²). Inserisco 1000/2=500 kg/m³ e 2²−1²=3 m²/s²: '
     'incremento +1500 Pa. La decelerazione recupera pressione nel modello ideale. Un valore negativo '
     'scambierebbe finale e iniziale; non si usa il quadrato della differenza 2−1.',
 53: 'Sezione costante e incomprimibilità mantengono la stessa rapidità nei due stati. Rimangono p+ρgz '
     'costanti: p_f−p_i=−ρg Δz=−800·10·(3/4)=−6000 Pa. Si chiede di quanto diminuisca, quindi il modulo '
     'della caduta è 6000 Pa. Il dislivello è verticale, non la lunghezza del tubo.',
 54: 'Nel punto di ristagno v=0 e la differenza rispetto alla pressione statica è ρv²/2. Quindi '
     'v²=2·60/(6/5)=100 m²/s² e la rapidità è la radice positiva 10 m/s. Si usa il modello di aria '
     'incomprimibile prescritto; non serve una radice decimale né si identifica la pressione totale con '
     'quella statica.',
 55: 'Con uguali quota e velocità media, il calo di pressione non si spiega col Bernoulli ideale senza '
     'perdite. Occorre la dissipazione viscosa dell’energia meccanica, che alimenta energia interna e scambi '
     'termici. In un tubo uniforme stazionario la portata può restare costante benché la pressione '
     'diminuisca. Il calo positivo pertinente entra come perdita di carico o potenza dissipata Δp·Q.',
 56: 'Da p_1−p_2=(ρ/2)(v_2²−v_1²), 1500=500(v_2²−1) con le unità SI coerenti. Risulta v_2²=4 m²/s² e, nello '
     'stesso verso di flusso, v_2=2 m/s. Continuità dà A_1/A_2=v_2/v_1=2. Il rapporto delle aree è inverso a '
     'quello delle rapidità nelle sezioni corrispondenti.',
 57: 'Il sostantivo richiesto è ristagno. Il punto di ristagno ha velocità locale nulla rispetto '
     'all’ostacolo fermo e permette il confronto fra pressione totale e statica nel modello ideale. Non '
     'significa che tutta la corrente sia ferma. Nessuna opzione o alias originale è stato aperto.',
 58: 'Un allargamento brusco reale può separare la corrente e creare ricircolo, mescolamento e dissipazione '
     'viscosa. La pressione recuperata è la diminuzione del termine cinetico meno la perdita meccanica '
     'positiva: p_2−p_1=ρ(v_1²−v_2²)/2−Δp_perdita. Non è necessario dichiarare ogni ricircolo '
     'automaticamente turbolento; è la perdita non nulla a rendere insufficiente la stima ideale.',
 59: 'Nel modello di Torricelli istantaneo, serbatoio grande, superficie e getto alla stessa pressione '
     'esterna e perdite assenti, v=√(2 gh). Quadruplicare h moltiplica v per √4=2: da 2 a 4 m/s. Non '
     'quadruplica la rapidità; il confronto è fra due battenti preparati, senza bisogno di integrare lo '
     'svuotamento.',
 60: 'Il bilancio corretto è p_1−p_2=ρ(v_2²−v_1²)/2, cioè differenza dei quadrati, non quadrato della '
     'differenza. L’espressione proposta aggiunge un termine incrociato e non può dare una differenza '
     'negativa durante una dilatazione. Per esempio v_1=1 e v_2=2 darebbero rispettivamente 3 e 1 come '
     'fattori cinematici; è una controprova indipendente, non un’opzione vista.',
 61: 'Un filamento ordinato e strati che scorrono affiancati suggeriscono regime laminare nel tratto '
     'osservato. Non è una certificazione universale di ogni sezione o istante: la formulazione suggerito è '
     'locale. Una corrente stazionaria non è per definizione laminare e una grande velocità non basta da '
     'sola a diagnosticare turbolenza.',
 62: 'Per Poiseuille in tubo circolare, laminare newtoniano stazionario sviluppato e con aderenza, '
     'v(r)=v_max[1−(r/R)²]. La media sulla sezione è (2/R²)∫₀ᴿv(r)r dr=v_max/2. Con v_max=0,56=14/25 m/s, la '
     'media è 7/25=0,28 m/s. Non è la media temporale del valore sull’asse.',
 63: 'Il gradiente medio trasversale in modulo è Δv/Δy. Converto 0,50 mm in 1/2000 m e 0,020 m/s in 1/50 '
     'm/s: (1/50)/(1/2000)=40 s⁻¹. Non è un’accelerazione, perché il denominatore è una distanza e non un '
     'intervallo di tempo. Non serve assumere che il gradiente locale sia uniforme oltre i due punti.',
 64: 'Nel modello newtoniano τ=η γ̇. L’inversa è η=τ/γ̇: (18/5 Pa)/(12 s⁻¹)=3/10 Pa·s. Si tratta di '
     'viscosità dinamica; la viscosità cinematica avrebbe unità m²/s e richiederebbe anche la densità. La '
     'divisione manuale 3,6/12 è esatta.',
 65: 'Nel tratto di velocità uniforme il gradiente trasversale è zero. Lo sforzo viscoso di taglio dovuto a '
     'quel gradiente è dunque τ=η·0=0, anche con η non nulla. Non segue che la pressione o ogni componente '
     'del tensore degli sforzi sia nulla; la conclusione riguarda solo il contributo di taglio assegnato.',
 66: 'L’aderenza impone uguaglianza fra velocità del fluido a contatto e della parete. Poiché la parete è '
     'ferma, il valore locale è zero nel suo riferimento. Non si deduce che tutto il liquido sia fermo o che '
     'il gradiente alla parete sia nullo. Con una parete mobile cambierebbe il valore di velocità di '
     'contatto.',
 67: 'Derivo il profilo v(r)=v_max(1−r²/R²): dv/dr=−2 v_max r/R². Il modulo cresce linearmente da zero '
     'sull’asse al massimo sulla parete r=R. Non confondere il massimo della velocità, sull’asse, con quello '
     'del suo gradiente. La velocità nulla alla parete non elimina lo sforzo di taglio.',
 68: 'La frazione locale è v/v_max=1−(r/R)². Con r/R=0,80=4/5: 1−16/25=9/25=0,36. Le unità si cancellano e '
     'non serve conoscere R. Il quadrato del rapporto non è direttamente la frazione di velocità, ma il '
     'termine che va sottratto da uno.',
 69: 'Con η newtoniana costante, raddoppiare γ̇ dovrebbe raddoppiare τ. Il fattore osservato 1,3 contraddice '
     'quella proporzionalità nelle condizioni controllate. La viscosità apparente nel secondo punto sarebbe '
     'η_2/η_1=1,3/2=13/20, minore: è messa in dubbio l’ipotesi di viscosità indipendente dal gradiente, non '
     'l’esistenza stessa della viscosità. Non si deduce da soli due punti un’intera legge reologica.',
 70: 'Nel Couette lineare ideale, F=η A V_rel/h. A η, area e velocità relativa non nulla fissate, '
     'F_2/F_1=h_1/h_2=1/(5/2)=2/5. Se V_rel fosse zero il rapporto fra due forze nulle non sarebbe definito: '
     'la futura candidata deve restare nel ramo di scorrimento. Si confrontano preparazioni con distanze '
     'costanti entro ciascuna prova.',
 71: 'Poiseuille dà Δp=8 ηLQ/(πr⁴). Con Q imposto e stessa η, L, il rapporto è '
     'Δp_2/Δp_1=(r_1/r_2)⁴=(3/2)⁴=81/16. I millimetri si cancellano nel rapporto. Il regime laminare '
     'sviluppato deve restare valido in entrambe le prove: non si estende la legge dopo una transizione non '
     'specificata.',
 72: 'A raggio e Δp fissati, Q è inversamente proporzionale a ηL. La seconda preparazione ha prodotto '
     '(η_1/2)(3 L_1)=(3/2)η_1 L_1: Q_2/Q_1=2/3. Quindi 9·2/3=6 mL/s. Il dimezzamento della viscosità e '
     'l’allungamento triplo non si sommano come cambiamenti additivi.',
 73: 'Nel grafico con Δp verticale e Q orizzontale la pendenza è Δp/Q=R_h=8 ηL/(πr⁴), in Pa·s/m³. La '
     'conduttanza 1/R_h sarebbe la pendenza con gli assi scambiati. Il modello è lineare passivo con R_h '
     'positiva, non una curva generica che autorizzi ogni regime.',
 74: 'A η, L, Δp fissati, Q_2/Q_1=(r_2/r_1)⁴. Per ottenere tre pongo il rapporto dei raggi alla quarta '
     'uguale a tre: r_2/r_1=⁴√3, radice reale positiva. È un risultato esatto e manualmente definito; non '
     'occorre un’approssimazione decimale. Usare il fattore tre direttamente sul raggio moltiplicherebbe Q '
     'per 81.',
 75: 'Il diametro è d=2 r. Inserirlo nel posto del raggio cambia il quarto grado da r⁴ a(2 r)⁴=16 r⁴: il '
     'calcolo sovrastima Q di un fattore 16, a dati fisici invariati. Il flusso reale non cambia perché si è '
     'commesso un errore di sostituzione; il risultato errato non è un aumento del 16 per cento.',
 76: 'Uso Δp=R_hQ e converto 2,5 mL/s in (5/2)·10⁻⁶ m³/s. Il prodotto (8·10⁸)(5/2·10⁻⁶)=20·10²=2000 Pa, cioè '
     '2 kPa. Le unità Pa·s/m³ per m³/s danno Pa; trascurare il prefisso milli e il volume in metri cubi '
     'introdurrebbe un fattore enorme.',
 77: 'La proprietà è la viscosità dinamica η, espressa in Pa·s. A geometria fissata R_h=8 ηL/(πr⁴) è '
     'direttamente proporzionale a η. La viscosità cinematica ν ha altre unità e non è identificabile dal '
     'solo nome generico viscosità senza distinguere il simbolo e l’unità.',
 78: 'All’ingresso brusco il profilo può essere ancora in sviluppo: prima di usare la parabola occorre '
     'verificare il pieno sviluppo idrodinamico del tratto. Laminarità, Newtonianità, stazionarietà e '
     'aderenza restano necessarie ma non sostituiscono quella verifica. Deducendo η da una velocità locale '
     'con una parabola non ancora raggiunta si confonderebbe la struttura del profilo con il coefficiente '
     'del liquido.',
 79: 'La potenza idraulica fornita dalla caduta di pressione è Δp Q. Converto 3,0 kPa in 3000 Pa: '
     '3000·4·10⁻⁶=12·10⁻³ W=3/250 W, cioè 12 mW. Le sezioni uguali e il tubo orizzontale eliminano '
     'differenze dei termini cinetici e di quota nel bilancio fra estremi; questa non è automaticamente la '
     'potenza elettrica della pompa senza rendimento. La candidata chiede mW: 3/250 W moltiplicati per 1000 '
     'danno 12 mW, senza approssimazione.',
 80: 'Con resistenza finita positiva nel modello passivo di Poiseuille, Δp=R_hQ. Identica pressione statica '
     'ai due estremi orizzontali impone Δp=0 e quindi Q=0. Non si può mantenere un profilo di Poiseuille non '
     'nullo senza gradiente di pressione o altra sorgente di moto. La conclusione non va trasferita al '
     'diverso modello inviscido o a pareti in movimento.',
 81: 'Per tre resistenze lineari in serie, senza rami o accumulo, la portata è comune e le cadute si '
     'sommano. R_tot=2+5+1=8 kPa·s/mL; con Q=3/2 mL/s, Δp_tot=12 kPa. Le singole cadute sono 3,15/2 e 3/2 '
     'kPa. Il valore riguarda il modello Δp=R_hQ: quote o variazioni cinetiche aggiuntive non devono essere '
     'inserite tacitamente nel significato della pressione misurata.',
 82: 'Quattro rami identici hanno lo stesso salto di pressione e portate che si sommano: 1/R_eq=4/20, dunque '
     'R_eq=5 kPa·s/mL. Non si sommano le quattro resistenze, come si farebbe in serie. La legge lineare di '
     'ciascun ramo rende determinata la ripartizione.',
 83: 'Con nodi mantenuti alla stessa differenza di pressione prima e dopo la chiusura, il ramo rimasto ha '
     'Q=Δp/R_h invariato. La portata totale invece perde il contributo del ramo chiuso. Se la pompa '
     'mantenesse la portata totale anziché Δp la conclusione cambierebbe: le condizioni al contorno sono '
     'parte essenziale del problema.',
 84: 'Prima i due rami identici dividono gli 8 mL/s in 4 ciascuno, con resistenza equivalente R/2. Dopo '
     'resta un ramo e la pompa impone ancora 8: resistenza equivalente R. Quindi il salto di pressione '
     'raddoppia. La portata totale non raddoppia; raddoppia quella dell’unico ramo rimasto rispetto a prima.',
 85: 'Calcolo prima il parallelo: due resistenze 6 danno 3 kPa·s/mL. In serie col tratto iniziale 2, R_tot=5 '
     'kPa·s/mL. Con 20 kPa, Q_tot=20/5=4 mL/s e questa stessa portata attraversa il tratto iniziale; ogni '
     'ramo finale ne prende 2. Controllo:8 kPa nel primo tratto e 12 nel parallelo sommano 20.',
 86: 'Dal solo testo, entrambi i condotti collegano il medesimo nodo A al medesimo nodo B: sono in '
     'parallelo, qualunque sia la forma del disegno. Hanno comune differenza di pressione, non '
     'necessariamente uguale portata se le resistenze sono diverse. La figura originale non è stata aperta '
     'nella primaria; la sua effettiva coerenza andrà letta nella revisione successiva.',
 87: 'Per il parallelo 1/R_eq=1/R_1+1/R_2. Il residuo è 1/3−1/4=1/12, quindi R_2=12 kPa·s/mL. Il ramo '
     'passivo richiede R_eq<R_1;3<4 soddisfa il dominio. Controllo:4·12/(4+12)=48/16=3.',
 88: 'G è la conduttanza idraulica, reciproco della resistenza, con unità SI m³/(Pa·s). Nei rami paralleli '
     'Q_tot=ΣG_i Δp, perciò G_tot=ΣG_i. Il rapporto misurato Q/Δp richiede Δp non nullo; a pressione nulla '
     'la conduttanza del modello lineare si definisce come coefficiente, non ricavando 0/0.',
 89: 'In serie la portata è comune e, per flusso non nullo, il segmento con resistenza doppia ha caduta '
     'doppia in modulo: Δp=Q R_h. Non ha una portata diversa dal segmento in serie. Se Q=0 entrambe le '
     'cadute sono nulle e non c’è una maggiore caduta: la futura candidata deve rendere chiaro il ramo di '
     'scorrimento effettivo.',
 90: 'A Δp, η, L comuni, Poiseuille dà Q∝r⁴. Il ramo largo di raggio 2 r porta 16 volte quello stretto. La '
     'portata totale è 17 volte quella stretta, dunque la frazione chiesta è 1/17. Un sedicesimo è il '
     'rapporto stretto/largo, non stretto/totale.',
 91: 'Per una goccia libera di volume fissato, tensione superficiale isotropa positiva e gravità '
     'trascurabile, la forma sferica minimizza l’area e quindi l’energia libera superficiale γA nel modello '
     'assegnato. Non è la minimizzazione del volume: quello è vincolato dalla quantità di liquido. Un '
     'supporto o campi esterni potrebbero cambiare la forma, qui esclusi dall’idealizzazione.',
 92: 'Una sola interfaccia: ΔA=3·10⁻⁴ m² e γ=1/20 N/m. Il prodotto γΔA=(3/20)·10⁻⁴ J=15·10⁻⁶ J=15 μJ. A '
     'temperatura fissata questo è l’incremento dell’energia libera superficiale e il lavoro minimo '
     'quasistatico nel modello γ costante. Non si raddoppia l’area come in un film con due facce né si '
     'identifica automaticamente tutto ciò con un calore o l’energia interna del liquido.',
 93: 'Il film ha due interfacce: ciascuna tira il bordo con γℓ. Con γ=1/40 N/m e ℓ=1/25 m, F_tot=2/(40·25) '
     'N=1/500 N=2 mN. Il fattore 2 conta le due facce dichiarate; non si aggiunge un altro fattore per i due '
     'estremi del bordo. Le due trazioni sono concordi sul bordo mobile. La candidata chiede mN: 1/500 N '
     'corrisponde esattamente a 2 mN.',
 94: 'Nel modello capillare statico h=2 γ cos θ/(ρgr), con h positivo sopra il livello esterno. L’angolo '
     'attraverso il liquido è 120°, quindi cos θ=−1/2 e h<0: depressione, livello interno inferiore. Non è '
     'una risalita positiva; il segno deriva dall’angolo di contatto, non da una tensione superficiale '
     'negativa.',
 95: 'Per due gocce sferiche a singola interfaccia e medesima γ, Δp=2 γ/r. Il raggio piccolo è un quarto di '
     'quello grande, perciò la sua sovrapressione è quattro volte 30 Pa:120 Pa. La γ comune è una condizione '
     'da verificare nella futura candidata, non conseguenza universale della sola composizione se cambiasse '
     'la temperatura. Non usare il fattore 4 di una bolla di sapone a due facce.',
 96: 'Con r, ρ, g, γ comuni, h∝cos θ. Si ha cos 0°=1 e cos 60°=1/2, quindi h_60=h_0/2: il primo tubo sale il '
     'doppio del secondo. Entrambe le risalite sono positive; non si sommano o sottraggono gli angoli per '
     'confrontare le altezze.',
 97: 'Young–Laplace per una sola interfaccia ideale: Δp_curv=γ(1/R_1+1/R_2). Per superficie piana entrambe '
     'le curvature sono nulle e il salto di pressione di curvatura è zero. Non implica pressione assoluta '
     'nulla o tensione superficiale nulla. Altre trazioni interfaciali sono esplicitamente escluse.',
 98: 'Nella stessa geometria, con uguali densità, gravità e angolo di contatto, h è proporzionale a γ. '
     'Quindi h_2/h_1=7/10 e h_2=20·7/10=14 mm. A bagnamento completo il coseno è 1; non si inverte la '
     'dipendenza dalla tensione superficiale.',
 99: 'Conservazione del volume:8·(4 πr³/3)=4 πR³/3, quindi R³=8 r³ e R=2 r. Area finale 4 π(2 r)²=16 πr²; '
     'area iniziale complessiva 8·4 πr²=32 πr². Il rapporto è 1/2. Non si confronta l’area finale con quella '
     'di una sola goccia né si fa crescere il raggio linearmente con il numero delle gocce.',
 100: 'Una bolla di gas immersa in un liquido ha una sola interfaccia gas–liquido. Per una sfera le due '
      'curvature principali sono entrambe 1/R: Δp=2 γ/R. Il 2 viene dalle due curvature, non da due '
      'superfici. Una bolla di sapone con film sottile e due interfacce darebbe invece circa 4 γ/R; non è il '
      'sistema descritto. Pressione interna maggiore nell’ideale, senza ulteriori membrane o sollecitazioni.'}
ASSUMPTIONS={51: 'Liquido ideale incomprimibile, corrente non nulla stazionaria orizzontale senza rami; stessa linea, '
     'niente macchine/perdite e pressione sufficiente a non cambiare fase.',
 52: 'Stessa quota, densità 1000 kg/m³, velocità 2 → 1 m/s; profili uniformi, bilancio ideale e differenza '
     'finale meno iniziale.',
 53: 'Salita verticale 3/4 m, densità 800 kg/m³ e g 10; velocità uguali, niente lavoro d’albero/perdite, si '
     'chiede il modulo della diminuzione.',
 54: 'Ristagno nel riferimento dell’ostacolo, stessa quota e linea di corrente, aria nel modello '
     'incomprimibile con ρ 6/5; differenza positiva 60 Pa e radice di rapidità positiva.',
 55: 'Tubo orizzontale uniforme a pareti ferme, fluido viscoso e stato stazionario; stessa velocità media e '
     'pressione decrescente richiedono dissipazione.',
 56: 'Profili uniformi, liquido ideale e pressione a valle inferiore 1500 Pa, v₁ 1 m/s e ρ 1000; prima '
     'Bernoulli, poi continuità.',
 57: 'Arresto locale rispetto a ostacolo fermo; non si assume fermo il campo intero. Nome del punto distinto '
     'da fase o densità.',
 58: 'Confronto reale/ideale alla stessa situazione geometrica; separazione e mescolamento dissipano energia '
     'meccanica senza violare energia totale e senza diagnosi clinica.',
 59: 'Due stati istantanei distinti di grande serbatoio aperto, piccolo foro, velocità superficiale '
     'trascurabile e stessa atmosfera ai due estremi; nessuna previsione di livello costante nel tempo.',
 60: 'Bernoulli ideale stazionario incomprimibile alla stessa quota; orientazione p₁−p₂ fissata. Differenza '
     'delle energie, non energia della variazione.',
 61: 'Osservazione locale di filamento ordinato: suggerisce regime laminare senza dedurre viscosità nulla, '
     'globalità o stazionarietà.',
 62: 'Tubo circolare, fluido newtoniano incomprimibile, regime laminare sviluppato, parete aderente; lettura '
     'assiale 14/25 m/s è massimo e media pesata per area.',
 63: 'Velocità longitudinale confrontata in punti trasversalmente distinti allo stesso istante; distanza '
     '1/2000 m, non un tempo.',
 64: 'Moduli positivi di sforzo 18/5 Pa e gradiente 12 s⁻¹; temperatura/composizione fissate e viscosità '
     'dinamica newtoniana.',
 65: 'Campo uniforme e assenza degli altri gradienti di deformazione: taglio viscoso nullo, senza inferire '
     'pressione nulla o viscosità nulla.',
 66: 'Parete ferma e aderenza nel riferimento della parete; conclusione locale all’interfaccia, non sulla '
     'media o sul gradiente.',
 67: 'v_max>0, r∈[0, R] e R>0: derivata radiale in modulo cresce fino al bordo; r non esteso fuori dal tubo.',
 68: 'Dominio autonomo v_max>0 ora esplicito nella candidata finale riletta; r/R 4/5 e rapporto locale non media '
     'areale.',
 69: 'Gradiente raddoppiato e sforzo cresciuto 13/10, prove controllate; si dubita solo del coefficiente '
     'costante nel campo misurato, non si identifica una reologia completa.',
 70: 'La candidata finale esplicita A>0 e moduloU>0; η positiva e distanze positive, Couette sviluppato '
     'aderente senza gradiente di pressione; rapporto fra forze non nullo.',
 71: 'Q positiva imposta uguale, viscosità e lunghezza comuni; due raggi 3 e 2 mm nel regime di Poiseuille, '
     'cadute entrambe positive.',
 72: 'Stesso r e stessa Δp, Q_A 9 mL/s; confronto fra preparazioni con η_B/η_A 1/2 eL_B/L_A 3, entrambi nel '
     'regime del modello.',
 73: 'Grafico Δp verticale eQ orizzontale, geometria e η fissate; coefficiente angolare della legge lineare, '
     'definito anche tramite incrementi.',
 74: 'Raggi positivi e Δp>0, η eL fissi; rapporto α positivo con α⁴3 e richiesta esatta, senza decimali non '
     'manuali.',
 75: 'La candidata finale esplicita Δp>0; due lunghezze d 2 r e r non nulle e regime di Poiseuille, rapporto '
     'di portate definito.',
 76: 'Resistenza assegnata in Pa·s/m³ e portata positiva in mL/s; prefisso di volume convertito prima del '
     'prodotto, risposta in kPa.',
 77: 'Geometria fissa, fluido newtoniano nelle ipotesi di Poiseuille; la proprietà in Pa·s è dinamica, '
     'distinta da η/ρ.',
 78: 'Regione d’ingresso distinta da tratto sviluppato; laminare da solo non implica parabola assestata, '
     'nessuna conclusione clinica.',
 79: 'Pareti ferme, stesso contributo cinetico e quota ai due estremi, stato stazionario; lavoro netto di '
     'pressione per volume trasportato, risposta 12 mW.',
 80: 'Resistenza finita positiva, tubo orizzontale passivo a pareti ferme, limite stazionario e nessun’altra '
     'forzante; ammette Δp 0 eQ 0.',
 81: 'Tre resistenze assegnate nel modello lineare pressione-portata, senza rami e con liquido '
     'incomprimibile stazionario; Q comune 3/2 mL/s.',
 82: 'Quattro rami lineari identici fra la stessa coppia di nodi uniformi; resistenza positiva 20, somma '
     'delle conduttanze.',
 83: 'Δp positiva fissata ai nodi e proprietà del ramo aperto invariate: non si controlla la portata totale.',
 84: 'Q totale 8 mL/s imposta prima e dopo; due ramiR>0 iniziali poi uno chiuso, la sorgente può aumentare '
     'Δp.',
 85: 'Un tratto comune 2 in serie con 6||6, tutti kPa·s/mL;20 kPa sull’intera rete e portata iniziale '
     'totale, non portata di ramo.',
 86: 'La topologia è fissata da entrambi gli estremi A/B dei due rami. Il pannello è uno schema di '
     'connessione, non una quota fisica.',
 87: 'R_eq 3 eR₁ 4 nelle stesse unità: R_eq<R₁ garantisce conduttanza residua eR₂ strettamente positive.',
 88: 'Regime lineare positivo:Δp non nulla permetteQ/Δp; il coefficiente reciproco diR_h è additivo in '
     'parallelo.',
 89: 'Portata positiva esplicita, liquido incomprimibile senza accumuli/diramazioni; resistenzeR e 2 R e '
     'confronto di cadute.',
 90: 'Raggi r>0 e 2 r, stessaL/η e caduta positiva; tutti i rami restano di Poiseuille. Si normalizza con il '
     'totale di 17 contributi.',
 91: 'Volume fissato, γ positiva isotropa uniforme e forzanti esterne trascurabili; superficie libera ideale '
     'e costo superficiale, non densità nulla.',
 92: 'Modello assegnato ΔEγΔA a temperatura e γ fisse: costo superficiale/free energy del lavoro minimo, non '
     'calore o energia interna generale. Una sola nuova interfaccia.',
 93: 'Film sottile a due interfacce fisiche;γ 1/40 N/m e bordo 1/25 m, contributi concordi e modulo totale '
     'richiesto in mN.',
 94: 'Angolo attraverso il liquido 120°, atmosfera comune e gas trascurabile; quota positiva verso l’alto '
     'rispetto alla superficie esterna e modello capillare statico.',
 95: 'Una interfaccia per goccia, stessa γ esplicitamente assegnata, raggi 1/4 mm e deformazioni '
     'gravitazionali trascurabili; confronto di sovrapressioni, non assolute.',
 96: 'Stesso liquido e condizioni, r/g comuni, angoli attraverso il liquido 0°/60°; entrambe le risalite '
     'positive.',
 97: 'Interfaccia piana e nessuna altra sollecitazione interfaciale: curvature zero, non pressione assoluta '
     'zero né γ zero.',
 98: 'Stesso capillare, bagnamento completo e ρ/g comuni;γ_B 7/10 γ_A e riferimento dell’altezza uguale.',
 99: 'Otto sfere identiche positive senza perdita di volume diventano una sfera; area iniziale complessiva, '
     'non area di una sola figlia.',
 100: 'Bolla gas nel liquido con una sola interfaccia materiale sferica, γ uniforme; due curvature della '
      'stessa interfaccia, non due facce di film.'}
DISTRACTORS={51: 'Q comune e area minore impongono velocità maggiore. Una pressione crescente richiederebbe energia '
     'aggiunta; stazionario non significa campo uniforme.',
 52: '−1500 inverte i punti;500 nasce da 500·(2−1)², mentre 3000 omette il mezzo. 4−1 e(2−1)² sono diversi.',
 53: 'Velocità uguali non eliminano ρg Δz. Senza g si ottengono 600, con Δz 1 si ottengono 8000; il modulo '
     'richiesto è 6000 e Δp orientata è−6000.',
 54: '100 ha dimensione di rapidità al quadrato. Omettere 2 produce√50, non 10. Il ramo negativo non '
     'rappresenta una rapidità.',
 55: 'Non cambiano quota o velocità media; un calo di pressione non è creazione di energia né assenza di '
     'lavoro delle pressioni.',
 56: 'Quattro è v₂²/v₁²;1/2 è A₂/A₁. Con v₂ 2 e v₁ 1, il rapporto delle aree è 2 e non 4.',
 57: 'Il nome non descrive ebollizione o densità nulla. La pressione di ristagno non è il minimo della '
     'corrente ideale alla stessa quota.',
 58: 'Perdita meccanica non significa perdita di energia totale; non implica gravità invertita, densità '
     'nulla o pressione sempre costante.',
 59: 'h×4 implica v×2;8 m/s userebbe una legge lineare.2 ignorerebbe il battente e 1 invertirebbe il fattore '
     '2.',
 60: 'Lo scambio dei punti cambia il segno della differenza corretta. Il quadrato della somma non si annulla '
     'per velocità uguali; quello della differenza perde il cambio di segno.',
 61: 'Viscosità positiva è compatibile con strati ordinati; non si conclude quiete o non stazionarietà da '
     'questa sola osservazione.',
 62: '0,56 è il massimo,1,12 il suo doppio,0,14 un quarto. Il valore di parete zero non è la media d’area '
     '7/25.',
 63: 'Usare 0,50 come m anziché mm dà 0,04 s⁻¹; invertire il quoziente dà secondi. Un gradiente spaziale non '
     'è un’accelerazione.',
 64: '43,2 è il prodotto numerico 3,6·12 e 10/3 il reciproco.0,30 Pa ha dimensione di sforzo, non viscosità.',
 65: 'Un gradiente zero annulla il prodotto senza annullare η. La pressione normale non determina il taglio.',
 66: 'La condizione impone la velocità della parete al contatto; massimo o media altrove non sostituiscono '
     'quel valore.',
 67: 'Sull’asse la pendenza è zero pur essendo massima v. Il modulo 2 v_max r/R² non è uniforme e non va '
     'esteso oltreR.',
 68: '4/5 è la coordinata,1/5 omette il quadrato,16/25 è il termine da sottrarre;1/2 è media d’area.',
 69: 'η apparente cambia di 13/20, quindi non può essere lo stesso coefficiente costante. Massa, pascal e '
     'velocità restano definiti.',
 70: '5/2 inverte la dipendenza dalla distanza;25/4 ne fa un quadrato non previsto,1 ignora il cambio e 1/5 '
     'non ricostruisce le due distanze.',
 71: '16/81 scambia le prove;9/4 e 3/2 cambiano l’esponente.16 corrisponde a raggio dimezzato, non al '
     'passaggio 3 → 2.',
 72: '18 considera solo η e 3 soloL;27/2 moltiplica per 3/2 invece che dividerlo. Nove ignora entrambi.',
 73: 'Scambiare assi dà conduttanza, non resistenza; il prodotto ΔpQ è potenza e la sola η non include la '
     'geometria.',
 74: '3⁴81 e(√3)⁴9 non sono 3.1/3 e 1/⁴√3 riducono Q; la radice quarta positiva è unica.',
 75: 'L’uguaglianza delle unità non elimina il rapporto d/r 2. Prima e seconda potenza danno 2/4, la quarta '
     'dà 16 e non 1/16.',
 76: '2000 è il numero in Pa; omettere 10⁻⁶ m³/mL moltiplica per un milione. Q/R non ha dimensione di '
     'pressione.',
 77: 'ρ non compare nel coefficiente di Poiseuille, γ ha N/m e il raggio è geometria; la cinematica η/ρ ha '
     'm²/s.',
 78: 'Il tratto d’ingresso può essere laminare senza profilo sviluppato. Pressione nulla e densità nulla non '
     'sono criteri; la parabola non è un profilo uniforme.',
 79: '0,012 W è 12 mW;Δp/Q è resistenza, non potenza. Pressione e portata non si sommano come energie.',
 80: 'Con resistenza finita positiva, zero differenza dàzero flusso stazionario. Non si inferiscono '
     'transitori, pareti mobili o pressioni assolute nulle.',
 81: 'Otto è R_eq, non Δp; dividere perQ altera le unità e il parallelo non descrive tre tratti senza '
     'diramazioni.',
 82: '80 descrive serie;20 ignora tre rami.1/4 è rapporto rispetto al singolo ramo, non 5 nelle unità di '
     'resistenza.',
 83: 'Ramo invariato vede stessi Δp/R; raddoppio richiederebbe più Δp. Totale ridotto non significa ramo '
     'aperto fermo.',
 84: 'A Q totale imposta, R_eq passaR/2 → R. Non si riusa il risultato a Δp fissata e non compare una legge '
     'quadratica.',
 85: '14 è la somma in serie errata, che darebbe 20/14;10 ignora il blocco e 2 è la portata di ciascun ramo, '
     'non iniziale.',
 86: 'Sopra/sotto sul foglio non decide serie. Raggi o resistenze uguali non sono condizioni necessarie '
     'della topologia parallela.',
 87: '1 e 7 sono differenza/somma delle resistenze. Con 12 si verifica 4·12/(4+12)=3;4/3 e 3/4 falliscono '
     'quel vincolo.',
 88: 'Resistenza è inversa della conduttanza; viscosità non contiene la geometria, potenza è un prodotto e '
     'densità riguarda massa/volume.',
 89: 'StessaQ conR doppia implica Δp doppia. Cadute uguali riguardano parallelo; una caduta minore qui '
     'violerebbe il rapportoR.',
 90: '1/16 confronta i rami, non il totale;1/5 usa area invece di r⁴;1/2 richiederebbe identità e 16/17 '
     'appartiene al ramo largo.',
 91: 'Aumentare area costa più energia, non serve γ zero; perdere volume o invocare gravità contraddice le '
     'ipotesi.',
 92: '30 µJ conterebbe due aree fisiche. cm² richiede 10⁻⁴m²;γ/area non è energia e nessun fattore 2 va '
     'aggiunto alla singola interfaccia.',
 93: 'Una faccia darebbe 1 mN;4 m anziché 4 cm dà forza cento volte maggiore. γ in N/m non è la forza '
     'finale.',
 94: 'cos 120−1/2 implica h negativa; zero appartiene a 90° e non si perde liquido per la depressione.',
 95: '7,5 Pa usa il rapporto diretto dei raggi;30 ignora il rapporto 4;480 impone un quadrato non presente '
     'in Laplace.',
 96: 'Il solo liquido comune non fissa la bagnabilità. Due è il reciproco, zero richiede 90° e un livello '
     'negativo richiede un coseno negativo.',
 97: 'Raggio infinito corrisponde a curvatura zero.2 γ senza lunghezza non è pressione e l’atmosfera non '
     'misura curvatura.',
 98: '6 mm è la diminuzione, non l’altezza finale.200/7 inverte 7/10;20 e 10 mm ignorano il dato 70%.',
 99: '2 è rapporto di raggi;1/8 usa solo il numero. ConR 2 r l’area finale 16 πr² non è 8 πr², quindi non '
     '1/4.',
 100: 'Due curvature non sono due interfacce.γR è forza; il gas non elimina superficie o tensione e la '
      'dipendenza inversa dal raggio resta.'}
