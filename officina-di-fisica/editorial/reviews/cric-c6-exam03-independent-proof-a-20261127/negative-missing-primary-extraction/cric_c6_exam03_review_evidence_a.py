"""Individual third-exam reading against frozen prompt-only source mathematics."""
READING_COMPLETE=True
PRIMARY_MANUAL={}
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
