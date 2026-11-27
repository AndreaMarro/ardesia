"""Thirty-one distinct protected exam-three editions, drafted from prompt/data.

No opposite primary/model or original answer was opened before this draft.
"""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_IDS=[f'C6-Q{i:03}'for i in range(75,106)]
TASKS=[('Raddoppiare lo spessore, non l’area',
  'Due lastre piane dello stesso materiale hanno uguale area di faccia positiva e conducibilità positiva e costante. Le facce opposte sono '
  'mantenute alle stesse due temperature, con differenza positiva. In conduzione stazionaria unidimensionale, come cambia la potenza '
  'termica trasmessa quando lo spessore raddoppia?',
  ['Si dimezza', 'Raddoppia', 'Resta invariata', 'Quadruplica', 'Diventa nulla'],
  'La legge di conduzione è P=kAΔT/L. Materiale, area e differenza di temperatura sono invariati; raddoppia soltanto L al denominatore. La '
  'potenza diventa P_i/2. Il confronto riguarda energia trasferita per unità di tempo in regime stazionario, non l’energia inizialmente '
  'contenuta nella lastra.',
  'P=\\frac{kA\\Delta T}{L}\\qquad L_f=2L_i\\qquad P_f=\\frac12P_i',
  'Raddoppiare la potenza confonderebbe lo spessore con l’area. Il risultato non resta uguale se il gradiente si dimezza a ΔT fissata. Non '
  'si annulla: tutti i parametri e la differenza di temperatura sono positivi e finiti.',
  'Isola la sola grandezza geometrica che cambia nella legge stazionaria.'),
 ('Da millilitri a metri cubi',
  'Un campione di soluzione occupa 250 mL. Qual è lo stesso volume in metri cubi? Scegli il valore esatto.',
  ['1/4000 m³', '1/4 m³', '250 m³', '1/40 m³', '1/400 m³'],
  'Un litro è un decimetro cubo, cioè 10⁻³ m³. Un millilitro è un millesimo di litro: 10⁻⁶ m³. Quindi 250 mL sono 250×10⁻⁶ m³=25/100000 '
  'm³=1/4000 m³. È anche 0,00025 m³, ma la frazione è selezionabile senza introdurre arrotondamenti.',
  '1\\,\\mathrm{mL}=10^{-6}\\,\\mathrm{m^3}\\qquad V=\\frac1{4000}\\,\\mathrm{m^3}',
  '1/4 m³ corrisponde a 250 litri, non 250 millilitri. 1/400 m³ è dieci volte il volume assegnato. Il prefisso milli riguarda il litro e '
  'non autorizza a trattare un millilitro come un millimetro cubo.',
  'Passa prima dai millilitri ai litri, poi dal litro al metro cubo.'),
 ('Area tripla e distanza doppia',
  'Un condensatore piano nel vuoto ha area e distanza iniziali positive. L’area di ogni armatura triplica e la separazione raddoppia. '
  'Trascurando gli effetti di bordo, qual è il rapporto C₂/C₁?',
  ['3/2', '2/3', '6', '3', '1/2'],
  'La capacità è ε₀A/d. Il rapporto delle aree dà un fattore tre, quello inverso delle separazioni un fattore un mezzo. Il prodotto è 3/2: '
  'la capacità aumenta del cinquanta per cento. Non occorre assegnare cariche o tensioni per confrontare la capacità geometrica nel '
  'modello dato.',
  'C=\\frac{\\varepsilon_0A}{d}\\qquad \\frac{C_2}{C_1}=\\frac32',
  'Sei moltiplicherebbe anche per la distanza, che invece sta al denominatore. Tre omette la variazione della separazione; un mezzo omette '
  'quella dell’area. 2/3 è il rapporto inverso rispetto a quello richiesto.',
  'Tratta separatamente il fattore al numeratore e quello al denominatore.'),
 ('Il livello più basso indica pressione maggiore',
  'Un manometro a U contiene liquido di densità 800 kg/m³. Il dislivello verticale è 5,0 cm; il liquido nel ramo del gas è più basso che '
  'nel ramo aperto all’atmosfera. Con g=10 m/s², quanto vale p_gas−p_atm in pascal?',
  400,
  'Il gas spinge il liquido verso il basso nel proprio ramo: la sua pressione è maggiore di quella atmosferica. La differenza positiva è '
  'ρgΔh. Converto 5,0 cm in 0,050 m e calcolo 800×10×0,050=400 Pa. Non serve conoscere il valore numerico della pressione atmosferica per '
  'trovare questa differenza.',
  '\\Delta h=0{,}050\\,\\mathrm m\\qquad p_{\\rm gas}-p_{\\rm atm}=\\rho g\\Delta h\\qquad p_{\\rm gas}-p_{\\rm atm}=+400\\,\\mathrm{Pa}',
  '−400 Pa invertirebbe il confronto indicato dai livelli. 40000 Pa userebbe 5 come numero di metri invece che centimetri. Il valore '
  'trovato è una differenza di pressioni e non la pressione assoluta del gas.',
  'Decidi il segno dai livelli prima di moltiplicare densità, gravità e altezza.'),
 ('Due riflessioni su facce perpendicolari',
  'Nella sezione piana di due specchi piani fermi e perpendicolari un raggio incontra prima la faccia verticale e poi quella orizzontale. '
  'Rimane nel piano della sezione. Qual è l’angolo fra il vettore direzione iniziale e quello dopo entrambe le riflessioni, in gradi?',
  180,
  'La prima riflessione cambia il segno della componente orizzontale della direzione e conserva quella verticale. La seconda cambia il '
  'segno della componente verticale. Dopo le due riflessioni entrambe le componenti sono opposte alle iniziali: il vettore finale è '
  'l’opposto dell’iniziale. L’angolo fra vettori opposti è 180°.',
  '(d_x,d_y)\\longrightarrow(-d_x,d_y)\\qquad (-d_x,d_y)\\longrightarrow(-d_x,-d_y)\\qquad \\beta=180^\\circ',
  '90° è l’angolo fra gli specchi, non il risultato del doppio cambiamento delle componenti. 0° indicherebbe vettori concordi. Il vincolo '
  'nel piano è essenziale: una componente fuori dal piano non verrebbe invertita da queste due riflessioni.',
  'Cambia il segno della sola componente normale a ciascuno specchio.'),
 ('Una media delle coordinate pesata dalle masse',
  'Su un’asta di massa trascurabile ci sono 1 kg a x=0 e 3 kg a x=40 cm. Qual è la coordinata del centro di massa in centimetri?',
  30,
  'Il centro di massa è la somma delle coordinate pesate dalle masse divisa per la massa totale. Il primo contributo è nullo; il secondo '
  'vale 3×40=120 kg·cm. La massa totale è 4 kg, quindi x_CM=120/4=30 cm. Il centro è più vicino alla massa maggiore e resta fra le due '
  'posizioni.',
  'x_{\\rm CM}=\\frac{m_1x_1+m_2x_2}{m_1+m_2}\\qquad x_{\\rm CM}=30\\,\\mathrm{cm}',
  '20 cm sarebbe la media semplice delle coordinate senza pesi. 120 copia il valore numerico del numeratore in kg·cm senza dividere per la '
  'massa totale. La massa trascurabile dell’asta evita un ulteriore contributo distribuito.',
  'Moltiplica ciascuna coordinata per la propria massa prima di sommare.'),
 ('Il gas ideale si espande a temperatura costante',
  'Una quantità fissata di gas ideale monoatomico si espande quasi staticamente a temperatura assoluta positiva costante. L’unico lavoro è '
  'quello di frontiera, positivo se svolto dal gas; si trascurano variazioni macroscopiche di energia cinetica e potenziale. Quale '
  'uguaglianza vale?',
  ['Q=W>0 e ΔU=0', 'Q=0 e ΔU=−W', 'Q=−W con W>0', 'ΔU=Q+W con W lavoro del gas', 'Q=W=0 durante ogni espansione'],
  'Per questo gas ideale U dipende soltanto dalla temperatura: in un’isoterma ΔU=0. Dal primo principio ΔU=Q−W segue Q=W. Nell’espansione '
  'quasi statica a pressione positiva il lavoro del gas è positivo, dunque anche il calore ricevuto è positivo. L’energia interna resta '
  'invariata pur essendoci due trasferimenti non nulli.',
  '\\Delta U=0\\qquad Q-W=0\\qquad Q=W>0',
  'Q=0 descriverebbe un’adiabatica e non segue dalla temperatura costante. Il segno opposto Q=−W usa un’altra convenzione per il lavoro '
  'senza cambiarne il significato nel prompt. Nessuna variazione di U non significa assenza di calore e lavoro.',
  'Usa prima la dipendenza di U da T, poi applica la convenzione del primo principio.'),
 ('La stessa carica nelle due capacità in serie',
  'Due condensatori ideali da 3 μF e 6 μF, inizialmente scarichi, sono collegati in serie a 12 V. Il nodo intermedio è neutro e isolato. '
  'Quanto vale il modulo della carica su ciascuno a regime, in microcoulomb?',
  24,
  'In serie con nodo intermedio neutro i due condensatori hanno lo stesso modulo di carica. Il reciproco della capacità equivalente è '
  '1/3+1/6=1/2 in (μF)⁻¹: C_eq=2 μF. Moltiplico per 12 V e ottengo 24 μC su ciascuno. Le tensioni individuali sono 8 V e 4 V, che '
  'ricostruiscono i 12 V totali.',
  '\\frac1{C_{\\rm eq}}=\\left(\\frac13+\\frac16\\right)\\frac1{\\mu\\mathrm F}\\qquad C_{\\rm eq}=2\\,\\mu\\mathrm F\\qquad '
  'Q=24\\,\\mu\\mathrm C',
  '108 μC userebbe la capacità 9 μF del parallelo. 36 μC e 72 μC assegnerebbero tutti i 12 V a un singolo condensatore anziché dividere la '
  'tensione della serie. Carica uguale in modulo non impone tensioni individuali uguali quando le capacità differiscono.',
  'Riduci la serie prima di moltiplicare per la tensione del generatore.'),
 ('Dal volume immerso a quello emerso',
  'Un solido omogeneo di densità 750 kg/m³ galleggia in equilibrio in un liquido fermo di densità 1000 kg/m³. Agiscono solo peso e spinta '
  'di Archimede; si trascurano aria e tensione superficiale. Quale percentuale del volume del solido emerge?',
  25,
  'L’equilibrio dà ρ_liquido V_immerso g=ρ_solido V_totale g. Il rapporto immerso è 750/1000=3/4, quindi emerge il quarto restante. La '
  'percentuale emersa è 25%, non 75%. La densità del corpo minore di quella del liquido è coerente con un galleggiamento parziale.',
  '\\frac{V_{\\rm imm}}{V}=\\frac34\\qquad \\frac{V_{\\rm em}}{V}=\\frac14\\qquad f_{\\rm em}=25\\%',
  '75% è la frazione immersa, non quella richiesta. Il rapporto inverso 4/3 supererebbe il volume totale e non descrive questo equilibrio. '
  'La frazione riguarda volumi e non una lunghezza verticale se la forma del corpo non è assegnata.',
  'Calcola prima la quota immersa e sottraila dall’intero volume.'),
 ('Lo stesso cammino nel vuoto',
  'Un impulso radio e un impulso di luce visibile partono insieme dalla stessa sorgente e percorrono lo stesso cammino nel vuoto. Quale '
  'previsione dà il modello di propagazione elettromagnetica nel vuoto?',
  ['Arrivano insieme',
   'La luce visibile arriva prima perché ha frequenza maggiore',
   'L’impulso radio arriva prima perché ha lunghezza d’onda maggiore',
   'Uno resta fermo perché manca un mezzo materiale',
   'Il ritardo dipende necessariamente dal colore'],
  'Entrambi si propagano alla stessa velocità c nel vuoto. Per cammino uguale L il tempo di propagazione è L/c, quindi gli impulsi '
  'arrivano insieme nel modello assegnato. Frequenza e lunghezza d’onda sono diverse, ma il loro prodotto è la stessa velocità.',
  'v_{\\rm radio}=c\\qquad v_{\\rm visibile}=c\\qquad t=\\frac Lc',
  'Una frequenza maggiore non rende più veloce la propagazione nel vuoto. Un mezzo materiale potrebbe introdurre dispersione, ma non è '
  'presente qui. La luce non richiede un mezzo materiale per propagarsi.',
  'Confronta le velocità del modello prima di confrontare frequenze o energie dei fotoni.'),
 ('Due indicatori nella stessa cabina',
  'Una cabina trasla verticalmente senza ruotare. Un dinamometro sostiene un corpo di 4,0 kg e indica 48 N. Sul pavimento una bilancia '
  'sostiene un secondo corpo di 6,0 kg. Entrambi restano fermi rispetto alla cabina; si trascura la spinta dell’aria. Quanto indica la '
  'bilancia in newton?',
  72,
  'I due corpi condividono la stessa accelerazione verticale della cabina. Chiamo T la lettura del dinamometro e N quella della bilancia. '
  'Il rapporto fra la forza di sostegno e la massa è quindi lo stesso per entrambi: 48/4=12 N/kg. La bilancia deve esercitare 6×12=72 N. '
  'Non occorre conoscere separatamente g e l’accelerazione per usare questo rapporto comune.',
  '\\frac{T}{m_1}=\\frac{N}{m_2}\\qquad \\frac{T}{m_1}=12\\,\\mathrm{N/kg}\\qquad N=72\\,\\mathrm N',
  '48 N copierebbe la forza sul primo corpo senza considerare la diversa massa. Usare 6 g ignorerebbe l’informazione fornita dal '
  'dinamometro nella cabina accelerata. La bilancia indica una forza di contatto, non direttamente una massa.',
  'Ricava prima la forza per unità di massa nella cabina.'),
 ('Il modulo del calore ceduto condensando',
  'Una massa di 4,0 g di vapore puro condensa interamente alla temperatura di transizione. Il calore latente specifico assegnato è 2,0×10 '
  '⁶ J/kg. Qual è il modulo dell’energia ceduta in joule?',
  8000,
  'Converto 4,0 g in 4,0×10⁻³ kg. Il modulo del calore latente è mL: 4×10⁻³×2×10 ⁶=8×10 ³ J=8000 J. Non si include un raffreddamento '
  'successivo del liquido, perché il processo assegnato è soltanto la condensazione alla temperatura di transizione.',
  'm=4\\times10^{-3}\\,\\mathrm{kg}\\qquad |Q|=mL\\qquad |Q|=8000\\,\\mathrm J',
  'Usare 4 come numero di chilogrammi darebbe un risultato mille volte maggiore. Per il vapore il calore scambiato ha segno negativo se '
  'entrante è positivo; il modulo chiesto è invece positivo. Il calore latente specifico in J/kg va moltiplicato per una massa, non per '
  'una differenza di temperatura.',
  'Uniforma grammi e chilogrammi prima di moltiplicare per il calore latente specifico.'),
 ('Lasciare una carica positiva da ferma',
  'Una particella di massa positiva e carica positiva viene lasciata da ferma in un campo elettrico uniforme non nullo, nella regione '
  'centrale fra piastre. Agisce solo la forza elettrica e si resta nel regime non relativistico. Quale moto compie finché resta nella '
  'regione uniforme?',
  ['Rettilineo uniformemente accelerato nel verso del campo',
   'Circolare uniforme',
   'Rettilineo uniforme perché inizialmente ferma',
   'Accelerato nel verso opposto al campo',
   'Sempre fermo perché non ha velocità iniziale'],
  'La forza qE è costante e concorde con E perché la carica è positiva. Dividendo per la massa positiva si ottiene un’accelerazione '
  'costante nello stesso verso. La velocità parte da zero e cresce lungo questa direzione: la traiettoria è rettilinea. La previsione vale '
  'finché il campo resta uniforme e non intervengono altre forze.',
  '\\mathbf F=q\\mathbf E\\qquad \\mathbf a=\\frac qm\\mathbf E\\qquad \\mathbf v(t)=\\mathbf a t',
  'Una velocità iniziale nulla non cancella una forza non nulla. Il moto circolare richiederebbe una forza che cambi direzione lungo il '
  'percorso, assente qui. Il verso opposto sarebbe quello dell’accelerazione di una carica negativa nel medesimo campo.',
  'Determina il verso della forza dal segno di q, poi applica la seconda legge.'),
 ('Una goccia tre volte più piccola nel raggio',
  'Due gocce sferiche dello stesso liquido sono nello stesso gas, con tensione superficiale positiva uguale. La seconda ha raggio R₂=R₁/3, '
  'con R₁>0. Nel modello di una singola interfaccia, qual è il rapporto dei salti interno meno esterno, secondo su primo?',
  ['3', '1/3', '9', '1/9', '1'],
  'Laplace dà Δp=2 γ/R per ciascuna goccia. Nel rapporto si semplificano 2 γ e resta R₁/R₂. Poiché R₂=R₁/3, il salto della seconda è tre '
  'volte quello della prima. Una goccia più curva richiede maggiore sovrapressione interna a tensione superficiale invariata.',
  '\\Delta p=\\frac{2\\gamma}{R}\\qquad \\frac{\\Delta p_2}{\\Delta p_1}=\\frac{R_1}{R_2}\\qquad \\frac{\\Delta p_2}{\\Delta p_1}=3',
  'Un terzo usa proporzionalità diretta col raggio invece che inversa. Nove introdurrebbe un quadrato non presente nella legge per il '
  'salto di pressione. Lo stesso gas non rende uguali i due salti se cambiano i raggi.',
  'Forma il rapporto prima di sostituire i raggi: i parametri comuni si cancellano.'),
 ('Due trasmissioni successive',
  'Un primo strato omogeneo trasmette il 70% di un fascio monocromatico diretto d’intensità iniziale positiva. Un secondo strato identico '
  'segue subito dopo. Trascurando riflessioni multiple e altri effetti, quale percentuale dell’intensità iniziale esce dal secondo?',
  49,
  'Ogni strato moltiplica per 7/10 l’intensità che riceve. Dopo il primo resta 0,70 I₀; il secondo trasmette il 70% di questa quantità, '
  'non il 70% dell’intensità originale un’altra volta. Il prodotto è 49/100: esce il 49% di I₀.',
  'I_1=\\frac7{10}I_0\\qquad I_2=\\frac7{10}I_1\\qquad I_2=\\frac{49}{100}I_0',
  'Sommare le due percentuali trasmesse non descrive due strati in sequenza. Sottrarre due volte 30 punti percentuali darebbe 40%, ma ogni '
  'perdita è riferita all’intensità che entra nello strato corrispondente. 70% ignora il secondo strato.',
  'Applica il secondo fattore al risultato del primo, non nuovamente all’ingresso originale.'),
 ('Attrito statico effettivo e massimo',
  'Un corpo resta fermo su un piano orizzontale. L’unica spinta orizzontale applicata ha modulo 3 N e l’attrito statico massimo '
  'disponibile è 7 N. Qual è il modulo dell’attrito effettivo in newton?',
  3,
  'L’equilibrio orizzontale richiede una forza d’attrito uguale e opposta alla spinta di 3 N. È disponibile perché 3 N non supera il '
  'massimo 7 N. L’attrito statico effettivo non è sempre pari al proprio limite: si adatta alla tendenza al moto entro l’intervallo '
  'consentito.',
  'F_{\\rm attr}=3\\,\\mathrm N\\qquad F_{\\rm attr}\\le7\\,\\mathrm N',
  '7 N è il massimo disponibile, non il valore necessario in questa prova. Zero lascerebbe una risultante di 3 N e contraddirebbe il corpo '
  'fermo. Non si determina il verso dal segno della velocità, che qui è nulla, ma dalla tendenza provocata dalla spinta.',
  'Imponi prima la risultante nulla, poi verifica che il valore richiesto rientri nel limite.'),
 ('Venti spire e una variazione per spira',
  'Una bobina ha 20 spire uguali e orientate concordemente. Il flusso attraverso ciascuna aumenta di 3 mWb in 0,10 s. Qual è il modulo '
  'della fem media indotta?',
  ['0,60 V', '0,030 V', '6,0 V', '60 V', '0,0060 V'],
  'La variazione di flusso concatenato totale è 20 volte quella di una spira: 20×3 mWb=60 mWb=0,060 Wb. Dividendo per 0,10 s ottengo 0,60 '
  'V. La legge di Faraday determina il modulo medio dalla variazione sul tempo totale; il segno dipende dall’orientazione scelta e non è '
  'richiesto.',
  '|\\Delta\\Psi|=N|\\Delta\\Phi|\\qquad |\\Delta\\Psi|=0{,}060\\,\\mathrm{Wb}\\qquad |\\overline{\\mathcal E}|=0{,}60\\,\\mathrm V',
  '0,030 V omette le 20 spire. 60 V userebbe 3 mWb come 0,3 Wb, cento volte il flusso assegnato. Una variazione per spira non va confusa '
  'con una variazione già moltiplicata per N. Il modulo medio non specifica come varia istante per istante la fem.',
  'Somma i flussi concatenati delle spire prima di dividere per la durata.'),
 ('Un liquido che bagna il capillare',
  'Un capillare verticale aperto è molto sottile e abbastanza lungo. Un liquido lo bagna con angolo di contatto minore di 90° ed è in '
  'equilibrio, sotto gravità, con un ampio serbatoio aperto alla stessa atmosfera. Nel modello capillare ideale quale situazione si '
  'osserva?',
  ['Il liquido sale sopra il livello del serbatoio',
   'Il liquido scende sempre sotto il livello del serbatoio',
   'I livelli devono restare uguali per ogni raggio',
   'La gravità impedisce qualunque menisco',
   'Il liquido sale senza limite anche in equilibrio'],
  'Per un liquido bagnante cosθ è positivo. La componente verticale della tensione superficiale lungo il bordo sostiene una colonna di '
  'peso positivo, quindi il livello nel capillare è più alto di quello del serbatoio. In equilibrio la risalita è finita: h=2 γcosθ/(ρgR), '
  'con parametri fisici positivi. La lunghezza sufficiente evita che il tubo termini prima del livello di equilibrio.',
  'h=\\frac{2\\gamma\\cos\\theta}{\\rho gR}\\qquad h>0',
  'Una depressione corrisponderebbe al caso non bagnante con cosθ negativo. L’uguaglianza dei livelli non descrive il menisco curvo di '
  'questo tubo sottile. La gravità si oppone alla salita e ne limita l’altezza, ma non elimina la forza superficiale.',
  'Confronta il segno del coseno e la direzione della componente verticale della tensione superficiale.'),
 ('Una forza con componente contraria allo spostamento',
  'Una forza costante di modulo 10 N forma 120° con uno spostamento orientato di 2,0 m. Usa cos 120°=−1/2. Qual è il lavoro della forza in '
  'joule?',
  -10,
  'Il lavoro è il prodotto scalare F s cosθ. Moltiplico 10×2,0×(−1/2) e ottengo −10 J. La componente della forza lungo lo spostamento è '
  'opposta a esso e compie lavoro negativo. Non si usa il modulo del coseno quando si chiede il lavoro con segno.',
  'W=Fs\\cos\\theta\\qquad W=-10\\,\\mathrm J',
  '+10 J perderebbe il segno della proiezione. 20 J tratterebbe forza e spostamento come concordi. La parte perpendicolare della forza non '
  'contribuisce al lavoro di questo spostamento.',
  'Mantieni il segno del coseno prima di eseguire il prodotto.'),
 ('Una sequenza alfa e beta meno',
  'Un nucleo emette prima una particella α e poi un elettrone tramite β⁻. Si assume che i due decadimenti siano consentiti. Quali sono le '
  'variazioni complessive ordinate (ΔA,ΔZ), finale meno iniziale?',
  ['(−4, −1)', '(−4, −3)', '(0, +1)', '(−1, −4)', '(−4, −2)'],
  'L’emissione α sottrae quattro nucleoni e due protoni al nucleo: ΔA=−4 e ΔZ=−2. Nel successivo β⁻ un neutrone si trasforma in protone, '
  'con emissione di elettrone e antineutrino: A resta uguale e Z aumenta di uno. Sommando le due variazioni trovo ΔA=−4 e ΔZ=−1.',
  '\\Delta A=-4+0\\qquad \\Delta Z=-2+1\\qquad (\\Delta A,\\Delta Z)=(-4,-1)',
  'ΔZ=−3 attribuirebbe al β⁻ la diminuzione di Z invece dell’aumento. L’elettrone non è un nucleone e non sottrae un’unità ad A. Il solo '
  'conteggio conserva le grandezze nucleari ma non dimostra l’accessibilità energetica: qui è un’ipotesi del processo assegnato.',
  'Aggiorna separatamente A e Z a ogni passaggio, senza trattare l’elettrone come un protone emesso.'),
 ('Un ponte resistivo bilanciato',
  'A è a 8 V e B a 0 V. Fra i due nodi ci sono due rami identici, ciascuno con due resistori da 4 Ω in serie. Un resistore da 2 Ω collega '
  'i punti medi M e N. Qual è il modulo della sua corrente nel regime stazionario, in ampere?',
  0,
  'I due rami sono identici e hanno gli stessi estremi: per simmetria i punti medi hanno lo stesso potenziale anche con il collegamento '
  'fra essi. In particolare M e N sono entrambi a 4 V. La tensione sul nuovo resistore è quindi zero e I_MN=(V_M−V_N)/(2 Ω)=0 A. Questa '
  'soluzione rispetta tutte le leggi ai nodi: ogni ramo esterno conduce 1 A e la corrente centrale è nulla.',
  'V_M=V_N\\qquad V_M=4\\,\\mathrm V\\qquad I_{MN}=0\\,\\mathrm A',
  'La presenza di un resistore non obbliga a una corrente non nulla: serve una differenza di potenziale. Usare 8 V ai suoi capi '
  'confonderebbe M,N con A,B. Il bilanciamento dipende dalle uguaglianze dei rapporti delle resistenze, non dall’assenza del ramo '
  'centrale.',
  'Confronta prima i potenziali dei punti medi, poi usa la resistenza aggiunta.'),
 ('La tangente al grafico della velocità',
  'La pendenza della tangente al grafico di una componente di velocità rispetto al tempo dà la corrispondente componente istantanea di '
  'quale grandezza?',
  ['Accelerazione', 'Spostamento', 'Rapidità media', 'Quantità di moto senza conoscere la massa', 'Forza senza conoscere la massa'],
  'La pendenza locale è il rapporto incrementale nel limite di un intervallo temporale che tende a zero: è la derivata della componente di '
  'velocità, cioè la componente di accelerazione. Il suo segno dipende da come varia quella componente nel tempo, non dal solo verso del '
  'moto.',
  'a_x=\\frac{dv_x}{dt}',
  'L’area sotto il grafico di velocità riguarda lo spostamento. Una pendenza su un intervallo finito dà un’accelerazione media, mentre la '
  'tangente definisce il valore istantaneo. Per forza o quantità di moto servirebbe anche la massa.',
  'Distingui pendenza locale, pendenza media e area sotto il grafico.'),
 ('Una colonna di mercurio misura l’atmosfera',
  'A quale scienziato si associa il classico esperimento che ricava la pressione atmosferica dall’altezza di una colonna di mercurio '
  'chiusa superiormente e in equilibrio?',
  ['Torricelli', 'Ohm', 'Oersted', 'Snell', 'Hooke'],
  'L’esperimento è associato a Torricelli. Nel modello barometrico la pressione sulla vaschetta aperta sostiene il dislivello della '
  'colonna; la piccola pressione di vapore nello spazio superiore si trascura nell’approssimazione classica. La relazione ideale è '
  'p_atm=ρ_Hg g h, non una pompa che aspira il mercurio con una forza indipendente dalla pressione esterna.',
  'p_{\\rm atm}=\\rho_{\\rm Hg}gh',
  'Il nome non è deciso soltanto dalla presenza di un fluido: conta la colonna barometrica con vaschetta esposta all’atmosfera. Ohm e '
  'Oersted riguardano altri fenomeni elettrici o magnetici; Snell l’ottica e Hooke l’elasticità.',
  'Riconosci la colonna barometrica e il riferimento atmosferico alla base.'),
 ('Calore trasportato dal fluido in movimento',
  'Come si chiama il trasporto di energia termica accompagnato dal moto macroscopico di porzioni di un fluido?',
  ['Convezione', 'Conduzione senza trasporto macroscopico di materia', 'Irraggiamento nel vuoto', 'Fusione necessariamente', 'Diffrazione'],
  'Il meccanismo è la convezione. Le porzioni di fluido si muovono e trasportano energia interna da una regione a un’altra. Il moto può '
  'essere sostenuto da differenze di densità o imposto da una pompa. La presenza di convezione non esclude che avvengano anche conduzione '
  'e irraggiamento nello stesso sistema.',
  '\\text{convezione}',
  'La conduzione descrive trasferimento senza questo moto macroscopico di porzioni di materia. L’irraggiamento è trasferimento tramite '
  'radiazione elettromagnetica. Una trasformazione di fase può avvenire o meno: non è la definizione del meccanismo chiesto.',
  'Individua se l’energia viene portata dal moto collettivo del fluido.'),
 ('Una bussola vicina al filo',
  'A quale fisico è associato l’esperimento storico della deviazione di una bussola vicina a un filo percorso da corrente?',
  ['Oersted', 'Torricelli', 'Snell', 'Laplace come legge di curvatura', 'Hooke'],
  'L’esperimento è associato a Oersted. La corrente nel filo produce un campo magnetico che contribuisce a orientare l’ago della bussola '
  'insieme agli altri campi presenti. Il fatto osservato collega una corrente elettrica a un effetto magnetico: non è necessario '
  'attribuire al filo una carica netta statica per descriverlo.',
  '\\text{corrente}\\;\\longrightarrow\\;\\text{campo magnetico}',
  'Non è un esperimento barometrico o di rifrazione. Una bussola risponde al campo magnetico risultante e non misura direttamente la '
  'resistenza elettrica del filo. Il nome dello scienziato identifica questa osservazione storica specifica.',
  'Collega il filo percorso da corrente all’orientazione dell’ago magnetico.'),
 ('Oltre il violetto verso frequenze maggiori',
  'Procedendo dal visibile verso frequenze maggiori, come si chiama la regione dello spettro immediatamente oltre il violetto?',
  ['Ultravioletto', 'Infrarosso', 'Radio', 'Microonde', 'Infrasuono'],
  'La regione immediatamente oltre il violetto verso frequenze maggiori è l’ultravioletto. Nel vuoto, a una frequenza maggiore corrisponde '
  'una lunghezza d’onda minore tramite c=λf. L’infrarosso si trova invece oltre il rosso verso frequenze minori rispetto al visibile.',
  'f_{\\rm UV}>f_{\\rm violetto}',
  'Radio e microonde appartengono a frequenze più basse del visibile. L’infrasuono è una classificazione di onde sonore, non una banda '
  'elettromagnetica. Non occorre assegnare un confine numerico esatto al colore per riconoscere il verso della classificazione.',
  'Conserva il verso di frequenza indicato dal quesito, senza scambiarlo con quello della lunghezza d’onda.'),
 ('Il quadrato dello spostamento della molla',
  'Per una molla ideale lineare, l’espressione kx²/2, con k>0 e zero di energia all’equilibrio naturale, rappresenta quale energia '
  'potenziale?',
  ['Elastica', 'Cinetica', 'Gravitazionale necessariamente', 'Elettrica necessariamente', 'Sempre negativa'],
  'È l’energia potenziale elastica della molla. Il quadrato rende lo stesso valore per allungamenti e compressioni di uguale modulo; con '
  'lo zero scelto U_el è non negativa. La forza orientata è invece −kx e cambia segno con x: energia e forza non hanno la stessa '
  'dipendenza né le stesse unità.',
  'U_{\\rm el}=\\frac12kx^2',
  'L’energia cinetica dipenderebbe dalla velocità e dalla massa. La forma assegnata non descrive necessariamente un campo gravitazionale o '
  'elettrico. Un’altra scelta di zero può aggiungere una costante, ma non cambia le differenze o la forza della molla.',
  'Distingui la forza lineare nello spostamento dall’energia quadratica.'),
 ('Strati ordinati, non rimescolamento turbolento',
  'Come si chiama il regime in cui gli strati di fluido scorrono ordinatamente senza il rimescolamento irregolare tipico della turbolenza?',
  ['Laminare', 'Turbolento', 'Necessariamente statico', 'Sempre privo di viscosità', 'Necessariamente sonoro'],
  'Il regime è laminare. Il moto mantiene una struttura ordinata delle linee di corrente nel modello descritto; strati diversi possono '
  'comunque avere velocità diverse e scambiarsi sforzi viscosi. Laminare non è sinonimo di liquido fermo o di fluido ideale privo di '
  'viscosità.',
  '\\text{regime laminare}',
  'Il regime turbolento è proprio quello da cui il testo lo distingue. Una velocità diversa da zero non rende da sola il moto turbolento. '
  'La classificazione del regime non determina automaticamente il valore della viscosità.',
  'Cerca il nome del moto ordinato senza confonderlo con assenza di movimento.'),
 ('La temperatura assoluta nell’equazione di stato',
  'Nel Sistema Internazionale, in quale unità si esprime la temperatura assoluta nell’equazione dei gas ideali pV=nRT?',
  ['Kelvin', 'Gradi Celsius da usare direttamente nel rapporto assoluto', 'Pascal', 'Joule', 'Watt'],
  'Si usano i kelvin, simbolo K. La temperatura assoluta misura il riferimento necessario alla legge dei gas ideali; una lettura Celsius '
  'va convertita con l’offset prima di inserirla come T. Una variazione di temperatura può avere lo stesso valore numerico in kelvin e '
  'gradi Celsius, ma questo non vale per una temperatura assoluta.',
  '[T]=\\mathrm K',
  'Pascal misura pressione e joule energia. Usare una lettura Celsius al posto della temperatura assoluta non è una semplice scelta di '
  'prefisso. Il nome kelvin non richiede il simbolo di grado davanti a K.',
  'Distingui la temperatura assoluta da una differenza di temperature.'),
 ('Il rapporto carica su tensione',
  'Come si chiama il rapporto fra la carica positiva su un’armatura e la differenza di potenziale positiva fra le armature di un '
  'condensatore?',
  ['Capacità elettrica', 'Resistenza elettrica', 'Conduttanza', 'Corrente', 'Flusso magnetico'],
  'Il rapporto Q/V definisce la capacità elettrica C nel modello del condensatore. L’unità è il farad, equivalente a coulomb su volt. I '
  'segni e il riferimento scelti nel prompt rendono positivi entrambi i valori del rapporto. Questa definizione non è la stessa della '
  'resistenza di un resistore o della corrente trasferita in un intervallo.',
  'C=\\frac QV\\qquad 1\\,\\mathrm F=1\\,\\mathrm{C/V}',
  'La resistenza è un rapporto V/I e la conduttanza il reciproco I/V, in un contesto elettrico diverso. Una carica accumulata non è una '
  'corrente se manca l’informazione temporale. Il flusso magnetico non è definito dal rapporto Q/V.',
  'Leggi insieme le due grandezze e le loro unità prima di scegliere il nome.'),
 ('Il ritmo ricevuto cambia con il moto relativo',
  'Come si chiama l’effetto per cui il moto relativo lungo la linea sorgente–ricevitore modifica la frequenza ricevuta rispetto a quella '
  'emessa?',
  ['Effetto Doppler', 'Interferenza distruttiva', 'Effetto fotoelettrico', 'Capillarità', 'Polarizzazione statica'],
  'È l’effetto Doppler. La frequenza ricevuta dipende dal ritmo con cui i fronti raggiungono il ricevitore, che può cambiare per il moto '
  'relativo radiale. Il quesito ne chiede il nome e non assegna dati sufficienti a un calcolo quantitativo. Cambiare soltanto l’intensità '
  'senza cambiare il ritmo dei fronti non descrive questo effetto.',
  'f_{\\rm ricevuta}\\ne f_{\\rm emessa}',
  'L’interferenza riguarda la sovrapposizione di contributi; il fotoelettrico lo scambio di energia con la materia. La capillarità è un '
  'fenomeno interfacciale e non un cambiamento della frequenza ricevuta per moto radiale.',
  'Confronta il ritmo di emissione con quello di arrivo dei fronti.')]
CHOICES={n:0 for n,t in enumerate(TASKS,1)if isinstance(t[2],list)}
UNITS={4:'Pa',5:'°',6:'cm',8:'μC',9:'%',11:'N',12:'J',15:'%',16:'N',19:'J',21:'A'}
FIGURES={1: 'Il primo pannello rappresenta sezioni a profondità uguale: stessa area di faccia, temperature imposte uguali e spessori L e 2 L. Le '
    'larghezze dei rettangoli indicano gli spessori; la potenza termica nel secondo caso è metà.',
 8: 'Il pannello centrale rappresenta due capacità in serie, con nodo intermedio neutro: stessa carica in modulo 24 μC, tensioni 8 V e 4 V. Le '
    'dimensioni dei simboli non rappresentano le aree fisiche delle armature.',
 21: 'Nell’ultimo pannello i quattro resistori esterni uguali da 4 Ω rendono i punti medi M e N entrambi a 4 V. Il ramo centrale da 2 Ω ha '
     'tensione nulla e quindi corrente nulla.'}
def assemble(repo,source_ref):
 from .pipeline import git_bytes
 import json
 source={r['id']:r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C6.json'))}
 return assemble_family(repo,source_ref,'cric-c6-protected-exam-03',TASKS,CHOICES,UNITS,'cric-c6-protected-exam-03-progressive.svg',FIGURES,0,course='C6',source_origin='cric',source_ids=SOURCE_IDS,source_path='officina-di-fisica/content/C6.json',section='Esame protetto 3',coverage=['Trentuno problemi distinti di sintesi fisica'],overrides={n:{'section':source[SOURCE_IDS[n-1]]['section'],'error':{'category':('unità'if n in(2,29,30)else'concetto'if isinstance(t[2],list)else'calcolo'),'message':t[5],'target':source[SOURCE_IDS[n-1]]['skill']}}for n,t in enumerate(TASKS,1)})
if __name__=='__main__':write_family(assemble,'cric-c6-protected-exam-03')
