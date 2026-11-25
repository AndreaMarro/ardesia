"""Author-only signed boundary work against constant external pressure."""
from .vector_geometry_authoring import assemble_family,write_family
P=('Un campione chiuso di gas sposta lentamente un pistone senza attrito contro la pressione esterna totale p>0 costante. '
   'Il processo è quasi statico e meccanicamente equilibrato: la pressione interna coincide con p al limite. '
   'Non vi sono altri lavori; l’energia cinetica del pistone non cambia. '
   'Il lavoro W è positivo quando il gas lo compie sull’ambiente. Nelle espansioni indicate ΔV=V_f−V_i>0. '
   'Si usano p in kPa e ΔV in L; 1 kPa·L=1 J. ')
TASKS=[
('Forza e spostamento diventano pΔV',P+'Con p=2 kPa e ΔV=3 L, quanto vale W in J?',6,
 'La forza esterna sul pistone ha modulo p per la sua area. Moltiplicando per lo spostamento, area per spostamento diventa incremento di volume. La pressione è costante, quindi il lavoro è pΔV. Due per tre sono sei; i fattori mille del kilopascal e un millesimo del litro si cancellano. Il segno è positivo perché il volume cresce.',
 r'F=pA\qquad \Delta V=A\Delta x\qquad W=p\Delta V\qquad W=(2\,\mathrm{kPa})(3\,\mathrm L)\qquad W=6\,\mathrm J',
 'Dodici J raddoppierebbero il lavoro senza un secondo cambiamento. Non serve aggiungere una pressione atmosferica: p è già la pressione esterna totale dichiarata. Il calcolo non determina da solo il calore scambiato.','Usa la pressione esterna totale e l’incremento, non il volume finale.'),
('Perché kPa per litro dà joule','Quale unità misura il lavoro di espansione W=pΔV?',['J','Pa','L','W','N'],
 'In unità SI una pressione per un volume dà N/m² per m³, cioè N·m. Questo è un joule. Il simbolo W usato per il lavoro non va confuso con l’unità watt: il watt misura potenza.',
 r'\mathrm{Pa\,m^3}=\mathrm{N\,m}=\mathrm J\qquad 1\,\mathrm{kPa}=10^3\,\mathrm{Pa}\qquad 1\,\mathrm L=10^{-3}\,\mathrm{m^3}\qquad 1\,\mathrm{kPa\,L}=1\,\mathrm J',
 'Pa misura pressione, L volume e N forza. W come unità vale J/s: richiederebbe dividere per una durata, qui assente.','Controlla separatamente la dimensione e i due prefissi.'),
('Ripercorrere la stessa isobara','Un gas chiuso passa lentamente da V_A=1 L a V_B=4 L contro pressione esterna totale p=2 kPa costante, senza attrito. Poi ripercorre la stessa isobara da B ad A. In entrambi i tratti c’è equilibrio meccanico al limite quasi statico. Con W positivo se compiuto dal gas, qual è il confronto corretto?',['Andata +6 J, ritorno −6 J: la somma è zero','Entrambi i lavori sono +6 J','Il ritorno è nullo perché si raggiunge il volume iniziale','Il ritorno è +12 J','Il segno del ritorno non si determina senza la temperatura finale'],
 'All’andata l’incremento è più tre litri e il gas compie sei joule. Al ritorno la variazione è meno tre litri: l’ambiente compie lavoro sul gas e W vale meno sei joule nella convenzione scelta. Le due aree hanno uguale modulo e segno opposto, perciò il lavoro totale su questo specifico percorso di andata e ritorno è zero.',
 r'\Delta V_{AB}=3\,\mathrm L\qquad W_{AB}=6\,\mathrm J\qquad \Delta V_{BA}=-3\,\mathrm L\qquad W_{BA}=-6\,\mathrm J\qquad W_{AB}+W_{BA}=0',
 'La compressione non ha lavoro nullo: il suo confine si muove. Prendere entrambi i moduli perde il verso. Il risultato dipende dal percorso p–V; una temperatura finale da sola non sostituisce l’integrale del lavoro.','Invertire il percorso inverte ΔV e quindi il segno del lavoro.'),
('La stessa espansione a pressione doppia',P+'A ha p=2 kPa e B ha p=4 kPa; entrambe le prove hanno ΔV=3 L. Come cambia W?',['Da 6 a 12 J','Resta 6 J','Da 6 a 3 J','Da 6 a 24 J','Diventa zero'],
 'Il volume spazzato dal pistone è lo stesso. Raddoppiando la pressione si raddoppia la forza su ogni stessa area, quindi anche il lavoro: da sei a dodici joule. Si stanno confrontando prove diverse, ciascuna con la propria pressione costante.',
 r'W_A=(2\,\mathrm{kPa})(3\,\mathrm L)\qquad W_A=6\,\mathrm J\qquad W_B=(4\,\mathrm{kPa})(3\,\mathrm L)\qquad W_B=12\,\mathrm J',
 'Sei ignora p nuova, tre rende inversa la dipendenza e ventiquattro cambia due fattori invece di uno. Zero non segue da un’espansione contro pressione positiva.','Con ΔV invariato il lavoro segue p alla prima potenza.'),
('La pressione dal lavoro misurato',P+'Il gas compie W=6 J espandendosi di ΔV=3 L. Quanto vale p in kPa?',2,
 'Dividiamo i sei joule per i tre litri. Un joule per litro equivale a un kilopascal; il quoziente è due kPa. Rimettendo questa pressione nella legge si ricostruiscono i sei joule misurati.',
 r'p=\frac W{\Delta V}\qquad p=\frac{6\,\mathrm J}{3\,\mathrm L}\qquad p=2\,\mathrm{kPa}',
 'Moltiplicare W per ΔV darebbe energia moltiplicata per volume, non pressione. Il reciproco ΔV/W ha dimensione inversa della pressione. Non si usa V_f al posto dell’incremento.','Dividi per il volume effettivamente spazzato dal pistone.'),
('Il volume spazzato dal lavoro',P+'Sono noti W=6 J e p=2 kPa. Quanto vale ΔV in L?',3,
 'A due kPa ogni litro di incremento richiede due joule di lavoro. Sei joule corrispondono quindi a tre litri. Il risultato è V_f−V_i: per ricavare V_f occorrerebbe aggiungere il volume iniziale.',
 r'\Delta V=\frac Wp\qquad \Delta V=\frac{6\,\mathrm J}{2\,\mathrm{kPa}}\qquad \Delta V=3\,\mathrm L',
 'Dodici moltiplica invece di dividere e due copia la pressione. L’unità J/kPa è L, non m³: tre litri equivalgono a tre millesimi di m³.','Ricorda l’identità J/kPa=L quando completi la divisione.'),
('Una corsa maggiore alla stessa pressione',P+'A usa p=2 kPa e ΔV_A=3 L; B mantiene p e usa ΔV_B=5 L. Quanto vale W_B/W_A?',['5/3','3/5','25/9','1','2'],
 'A compie sei joule e B dieci. Il rapporto dieci su sei si riduce a cinque terzi. La pressione comune si cancella e rimane il rapporto degli incrementi di volume.',
 r'W_A=6\,\mathrm J\qquad W_B=10\,\mathrm J\qquad W_B/W_A=\frac{10}{6}=\frac53',
 'Tre quinti inverte il confronto; venticinque noni quadra una dipendenza lineare. Uno ignora la corsa maggiore e due assume un raddoppio non presente nei dati.','Confronta gli incrementi, entrambi misurati dal proprio volume iniziale.'),
('Lo scarto di un lavoro raddoppiato',P+'Con p=2 kPa e ΔV=3 L una soluzione propone W=12 J. Quanto vale proposta meno risultato corretto?',['6 J','−6 J','12 J','0 J','3 J'],
 'Il prodotto corretto è sei joule. Dodici meno sei dà uno scarto di più sei joule. L’energia in eccesso della proposta non è una seconda componente da aggiungere al lavoro del pistone.',
 r'W=6\,\mathrm J\qquad e=(12-6)\,\mathrm J\qquad e=6\,\mathrm J',
 'Meno sei rovescia l’ordine; dodici copia la proposta; zero la accetta. Tre è metà dello scarto e non la differenza richiesta.','Calcola il lavoro prima di formare lo scarto con segno.'),
('L’inversa della pressione costante',P+'Quale formula isola p?',['p = W / ΔV','p = W ΔV','p = ΔV / W','p = W / (2ΔV)','p = 2W / ΔV'],
 'Poiché ΔV è positivo possiamo dividere il lavoro per esso. In SI, joule su metri cubi sono pascal; nelle unità assegnate joule su litri sono kilopascal. Il fattore di conversione numerico vale uno proprio per questa coppia di unità.',
 r'W=p\Delta V\qquad p=\frac W{\Delta V}\qquad \mathrm{J/m^3}=\mathrm{Pa}\qquad \mathrm{J/L}=\mathrm{kPa}',
 'In SI WΔV ha unità J·m³, non Pa; ΔV/W ha l’unità inversa della pressione. Il due al denominatore o al numeratore dà rispettivamente metà o doppio del lavoro quando si sostituisce p nella legge iniziale.','La divisione deve eliminare un volume, non aggiungerlo.'),
('Scalare pressione e incremento di volume',P+'B ha p_B=κ₁p_A e ΔV_B=κ₂ΔV_A, con κ₁,κ₂>0. Quale espressione dà W_B/W_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','κ₁ κ₂²'],
 'Scriviamo il lavoro di B con entrambi i nuovi fattori. Il rettangolo p–V si allarga di κ₂ e si alza di κ₁, quindi la sua area cresce per il loro prodotto. Il rapporto non dipende dal valore numerico del fattore kPa·L/J, uguale nelle due prove.',
 r'W_B=(\kappa_1p_A)(\kappa_2\Delta V_A)\qquad W_A=p_A\Delta V_A\qquad W_B/W_A=\kappa_1\kappa_2',
 'I quozienti rendono inversa una delle dipendenze. La somma dà due per prove uguali; il quadrato di κ₂ tratterebbe un volume come se andasse elevato ancora al quadrato.','Confronta l’area dei due rettangoli, non soltanto un lato.'),
('Due modifiche nell’area del lavoro',P+'A usa p=2 kPa, ΔV=3 L; B usa p=4 kPa, ΔV=5 L. Quanto vale W_B/W_A?',['10/3','3/10','2','5/3','20'],
 'Il riferimento compie sei joule e B venti. Venti su sei si semplifica a dieci terzi. Il raddoppio della pressione si combina con il rapporto cinque terzi dei volumi spazzati.',
 r'W_A=6\,\mathrm J\qquad W_B=20\,\mathrm J\qquad W_B/W_A=\frac{20}{6}=\frac{10}{3}',
 'Tre decimi è il reciproco; due considera soltanto p e cinque terzi soltanto ΔV. Venti è il numero di joule del processo B e non il rapporto senza unità.','Calcola entrambi i prodotti con la stessa convenzione di segno.'),
('Media di due lavori del pistone',P+'A: p=2 kPa, ΔV=3 L. B: p=4 kPa, ΔV=5 L. Qual è la media aritmetica dei due lavori con uguale peso?',['13 J','26 J','13/2 J','12 J','14 J'],
 'I lavori sono sei e venti joule. La loro somma ventisei divisa per due dà tredici joule. Gli ingressi medi sarebbero tre kPa e quattro litri: il loro prodotto è dodici joule, il lavoro di una terza prova, non la media richiesta.',
 r'W_A=6\,\mathrm J\qquad W_B=20\,\mathrm J\qquad \overline W=\frac{6+20}{2}\,\mathrm J\qquad \overline W=13\,\mathrm J',
 'Ventisei è la somma, 13/2 dimezza ancora e quattordici è la differenza. Dodici confonde la media dei prodotti con il prodotto delle medie.','Trova prima ciascuna energia trasferita come lavoro.'),
('Il volume per il lavoro desiderato',P+'A ha p=2 kPa, ΔV_A=3 L. B ha p=4 kPa e deve compiere W_B=(10/3)W_A. Quanto vale ΔV_B/ΔV_A?',['5/3','3/5','10/3','2','1'],
 'Il bersaglio è venti joule, poiché sei per dieci terzi dà venti. Alla pressione di quattro kPa occorrono cinque litri. Il rapporto fra cinque e tre litri è cinque terzi: si rimuove dal fattore di lavoro il raddoppio già fornito dalla pressione.',
 r'W_B=20\,\mathrm J\qquad \Delta V_B=\frac{20\,\mathrm J}{4\,\mathrm{kPa}}\qquad \Delta V_B=5\,\mathrm L\qquad \Delta V_B/\Delta V_A=\frac53',
 'Tre quinti inverte il rapporto; dieci terzi copia il bersaglio senza togliere il contributo di p. Due darebbe W_B=24 J e uno W_B=12 J, entrambi diversi da venti.','Dividi il fattore di lavoro per il fattore della pressione.'),
('Tarare una lettura di lavoro',P+'S=qW è continuo e adimensionale. A con p=2 kPa, ΔV=3 L dà S=18. B dà S=60 e usa ΔV=5 L. Quanto vale p_B in kPa?',4,
 'A compie sei joule e fissa un guadagno q=3 J⁻¹. La lettura sessanta corrisponde a venti joule. Dividendo questi per i cinque litri di B si ottiene quattro kPa, la pressione esterna totale della nuova prova.',
 r'W_A=6\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad W_B=20\,\mathrm J\qquad p_B=\frac{W_B}{\Delta V_B}\qquad p_B=4\,\mathrm{kPa}',
 'Usare direttamente sessanta come joule darebbe dodici kPa. Il display non misura già una pressione: il guadagno riguarda W, poi serve l’inversa con ΔV_B.','Converti la lettura in joule prima di dividere per i litri.'),
('Due riferimenti per pressione e offset',P+'S=qW+b è continuo e adimensionale. A: p=2 kPa, ΔV=3 L, S=13. B: p=4 kPa, ΔV=5 L, S=41. C: ΔV=3 L, S=25. Quanto vale p_C?',['4 kPa','8 kPa','2 kPa','25/6 kPa','12 kPa'],
 'I riferimenti compiono sei e venti joule. La variazione ventotto di S divisa per quattordici joule dà q=2 J⁻¹; poi b=1. Per C, venticinque meno uno diviso due dà dodici joule. Dividendo per tre litri otteniamo quattro kPa.',
 r'q=\frac{41-13}{(20-6)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad W_C=12\,\mathrm J\qquad p_C=4\,\mathrm{kPa}',
 'Otto kPa produrrebbero S=49, due kPa S=13. 25/6 kPa omette l’offset e dà S=26; dodici kPa copia il numero del lavoro e porterebbe S=73.','Ricava q dalle differenze e b da un riferimento prima dell’inversa.'),
('Un vincolo fra due parametri della prova',P+'Fra prove diverse si sceglie p=cΔV, con c=(2/3) kPa/L. In ciascuna espansione p resta costante: il vincolo non è una pressione variabile lungo il percorso. Se W=6 J, quanto vale ΔV>0?',['3 L','−3 L','9 L','3/2 L','6 L'],
 'Sostituendo il valore di p scelto per ogni prova si ottiene W=c(ΔV)². Poiché un joule equivale a un kPa·L, il quoziente W/c è nove litri quadrati. La radice positiva è tre litri e la pressione corrispondente è due kPa. Non compare un fattore un mezzo: p non cresce con il volume durante la singola espansione.',
 r'W=c(\Delta V)^2\qquad (\Delta V)^2=\frac Wc\qquad (\Delta V)^2=9\,\mathrm{L^2}\qquad \Delta V=3\,\mathrm L\qquad p=2\,\mathrm{kPa}',
 'La radice negativa viola l’espansione e p>0. Nove è il numero del quadrato; 3/2 L darebbero W=3/2 J e sei litri W=24 J. Sostituire p=c(V−V_i) lungo il processo cambierebbe il modello assegnato.','Distingui il vincolo fra prove dalla legge della pressione durante una prova.'),
]
CHOICES={n:0 for n in [2,3,4,7,8,9,10,11,12,13,15,16]}
UNITS={1:'J',5:'kPa',6:'L',14:'kPa'}
FIGURES={1:'I primi due pannelli mostrano la stessa isobara a p=2 kPa fra 1 L e 4 L: all’andata W=+6 J, al ritorno W=−6 J. Assi con origine a zero e scale uguali nei due grafici: 35 px/L e 60 px/kPa. Le aree hanno uguale modulo; il verso determina il segno. Il terzo pannello usa barre energetiche a 15 px/J per le due prove della domanda 12 e la loro media.',3:'Due percorsi sullo stesso segmento p–V, disegnati separatamente per conservare leggibili entrambe le frecce. Il ritorno è una compressione con lavoro del gas negativo, non un lavoro nullo. Il lavoro totale di questo percorso ripercorso è zero; non si afferma che il lavoro di ogni ciclo sia nullo.'}
def assemble(repo,source_ref):
 return assemble_family(repo,source_ref,'isobaric-work',TASKS,CHOICES,UNITS,'isobaric-work-progressive.svg',FIGURES,15500,unit='u5',course='C3',source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json',skill='C3-L06',prerequisites=['C1-L001','C3-L01','C3-L02','C3-L06','C3-L07'],section='Lavoro orientato a pressione esterna costante',coverage=['Pressione esterna e lavoro del confine','Segni e conversione kPa·L','Inverse, rapporti e taratura'])
if __name__=='__main__':write_family(assemble,'isobaric-work-155')
