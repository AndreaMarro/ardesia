"""Ten distinct original Cric electric questions; author edition, not approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C4.json"
SOURCE_IDS=['C4-Q021', 'C4-Q022', 'C4-Q023', 'C4-Q024', 'C4-Q025', 'C4-Q026', 'C4-Q027', 'C4-Q028', 'C4-Q029', 'C4-Q030']
TASKS=[('Sommare potenziali con i segni',
  'Due sorgenti puntiformi +2,0 nC e −1,0 nC sono entrambe a 0,10 m da P nel vuoto. Con zero all’infinito e '
  'k=9,0×10⁹ N·m²/C², calcola V(P) in volt.',
  90,
  'Il potenziale è scalare: sommo i contributi con i segni delle cariche. Le distanze sono uguali, quindi '
  'V=k(q₁+q₂)/r. La somma delle sorgenti è +1,0 nC e k·(1,0×10⁻⁹)/0,10=90 V. In alternativa i contributi separati '
  'sono +180 V e −90 V. La disposizione angolare delle sorgenti non entra in questa somma scalare.',
  'V(P)=k\\frac{q_1+q_2}{r}\\qquad V(P)=90\\,\\mathrm V',
  '270 V somma impropriamente i moduli dei contributi. −90 V perde il contributo positivo di +180 V. Un '
  'potenziale nullo richiederebbe qui somma delle cariche nulla, che non è il dato assegnato.',
  'Usa i segni algebrici: i due contributi hanno lo stesso denominatore.'),
 ('Seguire una superficie equipotenziale',
  'Una carica positiva si sposta lungo una superficie a potenziale costante in un campo elettrostatico. Quanto '
  'lavoro compie il solo campo elettrico fra il punto iniziale e quello finale?',
  0,
  'I due punti hanno lo stesso potenziale, quindi ΔV=V_f−V_i=0. L’energia potenziale della carica varia di qΔV=0 '
  'e il lavoro del campo vale −ΔU=0 J. La carica può percorrere uno spazio non nullo: il valore nullo del lavoro '
  'non significa necessariamente assenza del campo o assenza di moto.',
  'W_{\\rm campo}=-q\\Delta V\\qquad W_{\\rm campo}=0\\,\\mathrm J',
  'Un lavoro positivo o negativo richiederebbe una differenza di potenziale non nulla fra gli estremi. Non si può '
  'dedurre la lunghezza del percorso o il modulo del campo dal solo lavoro nullo.',
  'Confronta il potenziale ai due estremi, non la distanza percorsa.'),
 ('Il nome di un joule per coulomb',
  'Un joule per coulomb corrisponde a quale unità SI di differenza di potenziale? Scrivine il nome.',
  ['Ampere', 'Joule', 'Volt', 'Coulomb', 'Newton'],
  'La differenza di potenziale descrive energia potenziale per unità di carica. L’unità che equivale a un joule '
  'diviso per un coulomb si chiama volt e ha simbolo V. Joule e coulomb restano unità di grandezze differenti: il '
  'loro rapporto definisce l’unità richiesta.',
  '1\\,\\mathrm V=1\\,\\mathrm{J/C}',
  'Il coulomb misura la carica, il joule l’energia, il newton la forza e l’ampere la corrente. Sostituire una di '
  'queste unità al rapporto J/C confonderebbe la grandezza che si sta misurando.',
  'Riconosci l’unità usata per la tensione fra due punti.'),
 ('Campo dalla variazione del potenziale',
  'In una regione di campo elettrico uniforme, due piani equipotenziali distano 3,0 cm lungo il campo e i loro '
  'potenziali differiscono di 12 V. Trova il modulo E in V/m.',
  400,
  'Lungo il campo uniforme vale |ΔV|=E d, con d misurata nella direzione del campo. Converto 3,0 cm in 0,030 m e '
  'divido: E=12/0,030=400 V/m. Il verso è dal potenziale maggiore a quello minore; qui si chiede soltanto il '
  'modulo. Non serve conoscere una carica di prova.',
  'E=\\frac{|\\Delta V|}{d}\\qquad E=400\\,\\mathrm{V/m}',
  '4 V/m userebbe 3,0 come se fosse una distanza in metri. Moltiplicare tensione e distanza non darebbe un campo. '
  'La stessa differenza distribuita su una distanza minore richiederebbe un modulo maggiore.',
  'Porta la distanza in metri, poi dividi il modulo della differenza di potenziale.'),
 ('Potenziale nullo, campo non nullo',
  'Due cariche puntiformi +q e −q, con q>0, sono distinte e ferme nel vuoto. Nel loro punto medio, con zero del '
  'potenziale all’infinito, quale situazione si incontra?',
  ['Potenziale e campo sono entrambi nulli',
   'Il campo è nullo e il potenziale è positivo',
   'Il potenziale è negativo e il campo punta verso +q',
   'Campo e potenziale hanno necessariamente lo stesso valore numerico',
   'Il potenziale è zero e il campo è non nullo, diretto da +q verso −q'],
  'Le distanze dal punto medio sono uguali. I contributi scalari al potenziale hanno stesso modulo e segni '
  'opposti, quindi si cancellano. I contributi al campo invece hanno lo stesso verso: quello uscente da +q e '
  'quello entrante in −q puntano entrambi da +q verso −q. Si sommano e danno un campo non nullo.',
  'V(P)=0\\qquad \\mathbf E(P)\\ne\\mathbf0',
  'V=0 non implica E=0: il campo dipende dalla variazione spaziale del potenziale. Sommare algebricamente i '
  'valori dei campi ignorandone il verso scambierebbe una cancellazione scalare con una somma vettoriale. Campo e '
  'potenziale hanno anche unità diverse.',
  'Confronta separatamente la somma scalare dei potenziali e le frecce dei due campi.'),
 ('Un elettrone va a potenziale maggiore',
  'Un elettrone passa da un punto a 2 V a uno a 17 V per effetto del solo campo elettrostatico. Di quanti eV '
  'aumenta la sua energia cinetica?',
  15,
  'La variazione di potenziale è +15 V. L’elettrone ha q=−e: la sua energia potenziale varia di qΔV=−15 eV. Se '
  'agisce soltanto il campo, l’aumento di energia cinetica è l’opposto, +15 eV. Per una carica negativa passare a '
  'potenziale maggiore può quindi significare accelerare.',
  '\\Delta K=-q\\Delta V\\qquad \\Delta K=15\\,\\mathrm{eV}',
  '−15 eV sarebbe la variazione dell’energia potenziale, non l’aumento di K. 19 somma i due potenziali invece di '
  'sottrarli. Il simbolo eV è un’unità di energia e non un prodotto da interpretare come la carica con segno '
  'dell’elettrone.',
  'Usa il segno negativo della carica e distingui ΔU da ΔK.'),
 ('Scegliere l’origine della scala',
  'Porre V=0 all’infinito per una carica puntiforme fissa un … per il potenziale. Quale parola indica questa '
  'origine convenzionale della scala?',
  ['Percorso obbligato', 'Riferimento', 'Campo elettrico', 'Trasferimento di materia', 'Numero di elettroni'],
  'Il potenziale può essere traslato di una costante senza cambiare le differenze fra due punti. Scegliere V=0 '
  'all’infinito fissa il riferimento usato per assegnare i singoli valori. Le differenze di potenziale e il campo '
  'della stessa distribuzione sorgente non cambiano per un semplice spostamento dell’origine della scala.',
  'V^{\\prime}=V+C',
  'Il riferimento non impone un percorso alla carica e non trasferisce elettroni. Non annulla il campo ovunque: '
  'fissa soltanto il valore convenzionale del potenziale in una posizione limite.',
  'Cerca il nome della scelta rispetto alla quale vengono espressi i singoli potenziali.'),
 ('Rapidità guadagnata in una caduta di potenziale',
  'Una particella di massa 2,0 mg e carica +4,0 μC parte da ferma e scende di 9,0 V di potenziale. Agisce solo il '
  'campo elettrostatico, nel regime non relativistico. Calcola la rapidità finale in m/s.',
  6,
  'La carica è positiva e la caduta di potenziale è 9,0 V, quindi l’energia cinetica guadagnata è q·9,0 V=36 μJ. '
  'La massa è 2,0×10⁻⁶ kg. Dalla relazione m v²/2=36×10⁻⁶ J ricavo v²=36 m²/s². La rapidità è la radice positiva: '
  '6 m/s. L’energia determina il modulo, non una direzione della velocità priva di dati geometrici.',
  '\\tfrac12mv^2=q(V_i-V_f)\\qquad v=6\\,\\mathrm{m/s}',
  '36 m/s confonde il valore numerico di v² con quello di v. Omettere il fattore due darebbe √18 m/s, non la '
  'radice corretta. La massa in milligrammi va convertita in chilogrammi prima del bilancio SI.',
  'Trova prima l’energia cinetica e poi estrai la radice positiva.'),
 ('Confrontare la spaziatura delle equipotenziali',
  'In due piccole regioni regolari, curve equipotenziali adiacenti differiscono dello stesso intervallo non nullo '
  'di potenziale. Confronta la loro distanza lungo il campo, perpendicolare localmente alle curve. Dove è '
  'mediamente più intenso il campo?',
  ['Dove il potenziale è stato chiamato zero',
   'Necessariamente in entrambe allo stesso modo',
   'Dove non esiste alcuna differenza di potenziale',
   'Dove le equipotenziali sono più ravvicinate lungo il campo',
   'Dove sono più lontane lungo il campo'],
  'Per lo stesso modulo di differenza di potenziale, una distanza minore lungo il campo richiede un modulo medio '
  'maggiore: |ΔV|/d è maggiore. È un confronto della variazione del potenziale con lo spazio, non del singolo '
  'valore rispetto allo zero convenzionale. La direzione di confronto è specificata per non usare una distanza '
  'obliqua arbitraria.',
  'E_{\\rm medio}=\\frac{|\\Delta V|}{d}',
  'La spaziatura maggiore distribuirebbe lo stesso intervallo su più spazio e ridurrebbe il valore medio. La '
  'scelta dello zero non cambia il campo. Qui l’intervallo è esplicitamente non nullo e uguale nelle due regioni.',
  'Confronta lo stesso salto di potenziale distribuito su due diverse distanze.'),
 ('Contare ogni coppia una volta',
  'Per calcolare l’energia elettrostatica di quattro cariche puntiformi non nulle in posizioni distinte, sommando '
  'i contributi a coppie, quanti termini distinti devi includere?',
  6,
  'La prima carica forma tre coppie con le successive; la seconda altre due non ancora contate; la terza una con '
  'la quarta. Il totale è 3+2+1=6. In alternativa uso 4·3/2: il divisore due evita di contare due volte la stessa '
  'coppia in ordine inverso. Non si aggiungono termini di autoenergia nel modello richiesto.',
  'N_{\\rm coppie}=\\frac{4\\cdot3}{2}=6',
  '12 conta sia (1,2) sia (2,1) come termini differenti, duplicando il contributo della stessa coppia. Quattro '
  'confonde il numero delle cariche con quello delle interazioni a coppie. Non c’è una coppia di una carica con '
  'sé stessa in questa somma.',
  'Elenca prima le coppie con la prima carica, poi soltanto quelle ancora mancanti.')]
CHOICES={3: 2, 5: 4, 7: 1, 9: 3}
UNITS={1: 'V', 2: 'J', 4: 'V/m', 6: 'eV', 8: 'm/s', 10: '1'}
FIGURES={1: 'Il punto P è equidistante dalle due sorgenti; i contributi al potenziale sono +180 V e −90 V. Si sommano come scalari e danno 90 V.', 4: 'Il potenziale scende di 4 V ogni centimetro lungo il campo uniforme. I piani a 12 V e 0 V sono separati da 3 cm; il campo punta verso il potenziale minore.', 6: 'L’elettrone passa da 2 a 17 V: ΔU=−15 eV e ΔK=+15 eV. Le barre delle due variazioni condividono origine e scala; non rappresentano energie assolute.'}
def assemble(repo,source_ref):
 categories={1: 'modello', 2: 'concetto', 3: 'unità', 4: 'unità', 5: 'concetto', 6: 'modello', 7: 'concetto', 8: 'modello', 9: 'modello', 10: 'modello'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C4-L03"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c4-l03",TASKS,CHOICES,UNITS,"cric-c4-l03-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C4",skill="C4-L03",section="Elettricità e magnetismo",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c4-l03")
