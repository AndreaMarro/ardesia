"""Author-only monoatomic ideal-gas heat, with internal energy kept distinct."""
from .vector_geometry_authoring import assemble_family,write_family
P=('Ogni prova riguarda un campione chiuso di gas ideale monoatomico nel regime classico, con capacità termiche costanti. '
   'Il riscaldamento avviene lentamente a pressione positiva costante, con pistone senza attrito e pressione esterna uguale a quella interna al limite quasi statico. '
   'L’unico lavoro è quello di espansione; non cambiano energia cinetica o potenziale macroscopica. '
   'Sono assegnati nR>0 in J/K e l’aumento ΔT>0 in K; le temperature assolute restano positive. '
   'Q è positivo se entra nel gas e W se il gas compie lavoro sull’ambiente, perciò ΔU=Q−W. ')
TASKS=[
('Il calore alimenta due contributi',P+'Con nR=2 J/K e ΔT=10 K, quanto vale Q in J?',50,
 'Per il gas monoatomico l’energia interna cresce di tre mezzi di nRΔT. Il prodotto nRΔT vale venti joule: trenta restano come aumento di U. L’espansione a pressione costante compie inoltre venti joule di lavoro, perché pΔV=nRΔT. Il calore deve fornire entrambi i contributi: trenta più venti sono cinquanta joule.',
 r'nR\Delta T=20\,\mathrm J\qquad \Delta U=\frac32nR\Delta T=30\,\mathrm J\qquad W=nR\Delta T=20\,\mathrm J\qquad Q=\Delta U+W\qquad Q=50\,\mathrm J',
 'Trenta J sono soltanto ΔU e venti J soltanto W. Usare C_V al posto di C_p per Q omette l’energia trasferita all’ambiente mediante il pistone. Non si moltiplica di nuovo per n: il prodotto nR lo include già.','Ricava separatamente l’aumento di energia interna e il lavoro.'),
('L’unità del calore isobaro','nR è in J/K e ΔT in K. Il calore del modello è Q=(5/2)nRΔT. Quale unità è corretta per Q?',['J','J/K','K','W','J/(mol·K)'],
 'Il fattore cinque mezzi non ha dimensioni. I kelvin si cancellano nel prodotto e rimangono joule, l’unità di un trasferimento energetico. Le moli sono già comprese nel prodotto assegnato nR.',
 r'[nR]=\mathrm{J/K}\qquad [Q]=\mathrm{(J/K)K}\qquad [Q]=\mathrm J',
 'J/K è capacità totale, K intervallo termico e J/(mol·K) capacità molare. W misura energia per tempo: nessuna durata entra nel prodotto richiesto.','Tratta nR come una sola grandezza già riferita al campione.'),
('L’energia interna non coincide con il calore',P+'In questa prova nR=2 J/K e ΔT=2 K. È data la capacità totale C_V=(3/2)nR. Quanto vale ΔU?',['6 J','10 J','4 J','0 J','12 J'],
 'Qui viene chiesta l’energia interna, non il calore. La capacità a volume costante descrive comunque la variazione di U del gas ideale fra le temperature considerate: vale tre J/K. Moltiplicando per due kelvin si ottengono sei joule, anche se il processo reale è isobaro. In questo processo si compiono anche quattro joule di lavoro e servono dieci joule di calore.',
 r'C_V=\frac32nR=3\,\mathrm{J/K}\qquad \Delta U=C_V\Delta T\qquad \Delta U=6\,\mathrm J\qquad W=4\,\mathrm J\qquad Q=10\,\mathrm J',
 'Dieci J risponde alla domanda su Q e quattro J a quella su W. Zero confonde pressione costante con temperatura costante; dodici raddoppia l’aumento di U. C_V può essere usata per ΔU del gas ideale senza imporre un percorso isocoro.','Leggi quale energia si domanda prima di scegliere la capacità.'),
('Cambiare la quantità di gas fra prove',P+'A ha nR=2 J/K e B ha nR=4 J/K; sono campioni distinti dello stesso gas. Entrambi usano ΔT=10 K. Che cosa accade a Q?',['Passa da 50 a 100 J','Resta 50 J','Passa da 50 a 25 J','Passa da 50 a 200 J','Diventa zero'],
 'A parità di intervallo, sia l’aumento di U sia il lavoro sono proporzionali a nR. Raddoppiando la quantità di gas fra i campioni si raddoppia quindi anche il calore. A richiede cinquanta joule e B cento, senza cambiare n all’interno della singola prova chiusa.',
 r'Q_A=\frac52(2\,\mathrm{J/K})(10\,\mathrm K)\qquad Q_A=50\,\mathrm J\qquad Q_B=100\,\mathrm J',
 'Cinquanta ignora il nuovo campione, venticinque inverte la dipendenza e duecento attribuisce un secondo raddoppio a ΔT. Lo zero non è compatibile con il riscaldamento positivo.','Il coefficiente cinque mezzi è comune a entrambe le prove.'),
('Ricostruire il prodotto nR',P+'Sono misurati Q=50 J e ΔT=10 K. Quanto vale nR in J/K?',2,
 'Dal calore isobaro isoliamo nR moltiplicando per due e dividendo per cinque e per l’intervallo. Cento joule divisi per cinquanta kelvin danno due J/K. Il controllo restituisce cinquanta joule senza richiedere il valore numerico di R o il numero di moli separato.',
 r'Q=\frac52nR\Delta T\qquad nR=\frac{2Q}{5\Delta T}\qquad nR=\frac{100\,\mathrm J}{50\,\mathrm K}\qquad nR=2\,\mathrm{J/K}',
 'Q/ΔT darebbe cinque J/K, che è C_p del campione e non nR. Usare il coefficiente tre mezzi ricaverebbe il parametro da un’energia interna, mentre il dato è un calore.','Rimuovi sia l’intervallo sia il fattore cinque mezzi.'),
('Il riscaldamento dal calore',P+'Sono noti Q=50 J e nR=2 J/K. Quanto vale ΔT in K?',10,
 'La capacità totale a pressione costante è cinque J/K. Ogni kelvin richiede quindi cinque joule; cinquanta diviso cinque sono dieci kelvin. Non si ricava la temperatura assoluta finale senza quella iniziale.',
 r'C_p=\frac52nR=5\,\mathrm{J/K}\qquad \Delta T=\frac Q{C_p}\qquad \Delta T=10\,\mathrm K',
 'Venticinque kelvin usa nR al posto di C_p. Il coefficiente tre mezzi darebbe cinquanta terzi kelvin e confonderebbe Q con ΔU. Non si applica un offset Celsius a questa differenza.','Trova prima i joule per kelvin richiesti dal percorso isobaro.'),
('Stesso campione, intervallo doppio',P+'A e B hanno nR=2 J/K. A usa ΔT=10 K e B usa ΔT=20 K. Quanto vale Q_B/Q_A?',['2','1/2','4','1','−2'],
 'A richiede cinquanta joule e B cento. Il rapporto vale due: la capacità totale C_p non cambia e il calore segue linearmente l’intervallo termico. L’espansione compresa nel modello non introduce un ulteriore quadrato.',
 r'Q_A=50\,\mathrm J\qquad Q_B=100\,\mathrm J\qquad Q_B/Q_A=2',
 'Un mezzo inverte le prove; quattro quadra il raddoppio; uno lo ignora. Meno due contraddice i due calori entranti positivi.','Cancella nR e cinque mezzi nel rapporto completo.'),
('Correggere una proposta di 100 J',P+'Con nR=2 J/K e ΔT=10 K, si propone Q=100 J. Quanto vale proposta meno risultato corretto?',['50 J','−50 J','100 J','0 J','25 J'],
 'Il prodotto nRΔT è venti joule e cinque mezzi di venti sono cinquanta. La proposta eccede il valore corretto di cinquanta joule. Il fatto che Q sia diverso da ΔU è già incluso nel coefficiente cinque mezzi: non occorre raddoppiare ancora.',
 r'Q=\frac52(20\,\mathrm J)\qquad Q=50\,\mathrm J\qquad e=(100-50)\,\mathrm J\qquad e=50\,\mathrm J',
 'Meno cinquanta cambia l’ordine della sottrazione. Cento è la proposta, zero la accetta e venticinque dimezza nuovamente lo scarto.','Calcola prima il calore effettivo, poi la differenza con segno.'),
('L’inversa che conserva il coefficiente',P+'Quale relazione isola nR dalla legge Q=(5/2)nRΔT?',['nR = 2Q / (5ΔT)','nR = 2Q / (3ΔT)','nR = Q / ΔT','nR = 5Q / (2ΔT)','nR = Q / (5ΔT)'],
 'Moltiplichiamo per due quinti e poi dividiamo per ΔT positivo. Il risultato ha J/K, la dimensione di nR. Nella sostituzione il prodotto cinque mezzi per due quinti si riduce a uno e ricostruisce esattamente Q.',
 r'\frac25Q=nR\Delta T\qquad nR=\frac{2Q}{5\Delta T}\qquad [nR]=\mathrm{J/K}',
 'Il tre usa il coefficiente di ΔU al posto di quello di Q. Q/ΔT è C_p; cinque mezzi anziché due quinti moltiplica per il coefficiente invece di invertirlo. Q/(5ΔT) perde il fattore due necessario.','L’inverso di cinque mezzi è due quinti.'),
('Scalare due ingressi del calore',P+'Fra prove separate nR_B=κ₁nR_A e ΔT_B=κ₂ΔT_A, con fattori positivi. Quale espressione dà Q_B/Q_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','(5/2) κ₁ κ₂'],
 'Ogni calore contiene lo stesso coefficiente cinque mezzi. Nel rapporto esso si cancella insieme agli ingressi di A. Restano il fattore della quantità di gas e quello dell’intervallo, moltiplicati una sola volta.',
 r'Q_B=\frac52\kappa_1nR_A\kappa_2\Delta T_A\qquad Q_A=\frac52nR_A\Delta T_A\qquad Q_B/Q_A=\kappa_1\kappa_2',
 'I quozienti invertono una delle dipendenze. La somma dà due per prove identiche; mantenere cinque mezzi nel rapporto dimentica che quel coefficiente compare anche nel denominatore.','Scrivi anche il calore del riferimento prima di cancellare i fattori.'),
('Due raddoppi, un rapporto energetico',P+'A: nR=2 J/K, ΔT=10 K. B: nR=4 J/K, ΔT=20 K. Quanto vale Q_B/Q_A?',4,
 'Il riferimento assorbe cinquanta joule. B ha prodotto nRΔT pari a ottanta joule e quindi richiede duecento joule di calore. Duecento su cinquanta è quattro, prodotto dei due raddoppi.',
 r'Q_A=50\,\mathrm J\qquad Q_B=\frac52(80\,\mathrm J)\qquad Q_B=200\,\mathrm J\qquad Q_B/Q_A=4',
 'Due considera un solo ingresso; duecento è il numero di joule del secondo processo. Un quarto dà il rapporto inverso.','Valuta le due prove separatamente e poi forma un numero senza unità.'),
('Mediare due apporti di calore',P+'A usa nR=2 J/K, ΔT=10 K; B usa nR=4 J/K, ΔT=20 K. Qual è la media aritmetica dei due Q con uguale peso?',['125 J','250 J','125/2 J','225/2 J','150 J'],
 'I calori sono cinquanta e duecento joule. La somma duecentocinquanta divisa per due dà centoventicinque joule. Inserire invece nR medio di tre J/K e ΔT medio di quindici K darebbe duecentoventicinque mezzi di joule: il prodotto degli ingressi medi non conserva qui la media delle uscite.',
 r'Q_A=50\,\mathrm J\qquad Q_B=200\,\mathrm J\qquad \overline Q=\frac{50+200}{2}\,\mathrm J\qquad \overline Q=125\,\mathrm J',
 'Duecentocinquanta è la somma, 125/2 dimezza ancora e centocinquanta è la differenza. 225/2 usa una terza configurazione con ingressi medi.','Media le energie del modello, non gli ingressi prima del prodotto.'),
('Il secondo ingresso per il bersaglio',P+'A ha nR=2 J/K e ΔT_A=10 K. B ha nR=4 J/K e deve ricevere Q_B=4Q_A. Quanto vale ΔT_B/ΔT_A?',2,
 'Il bersaglio è duecento joule. La nuova capacità C_p vale dieci J/K, perciò occorrono venti kelvin, il doppio dell’intervallo iniziale. Il raddoppio di nR fornisce un fattore due; serve un altro fattore due nell’intervallo.',
 r'Q_B=200\,\mathrm J\qquad C_{p,B}=10\,\mathrm{J/K}\qquad \Delta T_B=20\,\mathrm K\qquad \Delta T_B/\Delta T_A=2',
 'Un rapporto quattro darebbe Q_B=8Q_A, perché raddoppierebbe già anche nR. Un rapporto uno produrrebbe soltanto Q_B=2Q_A.','Dividi il fattore energetico richiesto per il fattore di nR.'),
('Dal display al prodotto nR',P+'S=qQ è continuo e adimensionale. A con nR=2 J/K, ΔT=10 K dà S=150. B dà S=600 e usa ΔT=20 K. Quanto vale nR_B in J/K?',4,
 'Il riferimento assorbe cinquanta joule e fissa q=3 J⁻¹. La nuova lettura significa duecento joule. Togliendo il fattore cinque mezzi e i venti kelvin dall’energia si ottiene nR_B=4 J/K.',
 r'Q_A=50\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad Q_B=200\,\mathrm J\qquad nR_B=\frac{2Q_B}{5\Delta T_B}\qquad nR_B=4\,\mathrm{J/K}',
 'Usare 600 come joule darebbe dodici J/K. Q_B/ΔT_B=10 J/K è invece C_p,B e conserva il coefficiente cinque mezzi: non è nR_B.','Converti il display in energia e solo dopo applica l’inversa fisica.'),
('Guadagno, offset e quantità di gas',P+'S=qQ+b è continuo e adimensionale. A: nR=2 J/K, ΔT=10 K, S=101. B: nR=4 J/K, ΔT=20 K, S=401. C: ΔT=10 K, S=201. Quanto vale nR_C?',['4 J/K','2 J/K','8 J/K','201/50 J/K','5 J/K'],
 'A e B richiedono cinquanta e duecento joule. La differenza delle letture è trecento per centocinquanta joule: q=2 J⁻¹, poi b=1. La prova C corrisponde a cento joule; due quinti di cento, divisi per dieci kelvin, danno quattro J/K.',
 r'q=\frac{401-101}{(200-50)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_C=100\,\mathrm J\qquad nR_C=\frac{2Q_C}{5\Delta T_C}\qquad nR_C=4\,\mathrm{J/K}',
 'Due, otto e cinque J/K darebbero rispettivamente S=101, 401 e 251. 201/50 J/K omette l’offset e ricostruirebbe S=202. Il confronto va eseguito con entrambe le tarature rispettate.','Usa le differenze per q, poi sottrai b prima di dividere.'),
('Un vincolo fra campioni preparati',P+'Fra preparazioni diverse si sceglie nR=cΔT, con c=(1/5) J/K². In ciascuna prova nR resta costante: non dipende dalla temperatura istantanea. Se Q=50 J, quanto vale ΔT>0?',['10 K','−10 K','100 K','5 K','20 K'],
 'Sostituendo la quantità scelta per il campione si ottiene Q=(5/2)c(ΔT)². Il coefficiente cinque mezzi per un quinto è un mezzo di J/K². Cinquanta joule equivalgono quindi a cento kelvin quadrati nel quadrato dell’intervallo. La radice positiva è dieci kelvin; il campione ha nR=2 J/K.',
 r'Q=\frac52c(\Delta T)^2\qquad (\Delta T)^2=\frac{2Q}{5c}\qquad (\Delta T)^2=100\,\mathrm{K^2}\qquad \Delta T=10\,\mathrm K\qquad nR=2\,\mathrm{J/K}',
 'La radice negativa viola sia ΔT>0 sia nR>0. Cento è il numero del quadrato e non dell’intervallo; cinque e venti kelvin darebbero 25/2 J e 200 J. Il vincolo fra preparazioni non introduce un’integrazione durante il percorso.','Sostituisci prima il vincolo, poi conserva soltanto il ramo fisico positivo.'),
]
CHOICES={n:0 for n in [2,3,4,7,8,9,10,12,15,16]}
UNITS={1:'J',5:'J/K',6:'K',11:'1',13:'1',14:'J/K'}
FIGURES={1:'Tre passaggi per il gas ideale monoatomico: capacità totali con nR=2 J/K; ripartizione di Q per ΔT=10 K; confronto separato per ΔT=2 K della domanda03. Le barre di capacità usano 50 px per J/K, la barra energetica centrale 8 px/J e le barre finali 25 px/J. Le scale sono dichiarate per pannello e non vanno confrontate fra pannelli.',3:'Il calore si divide fra incremento di energia interna e lavoro uscente: Q=ΔU+W. Nel caso separato della domanda03, ΔT=2 K, i tre valori sono 10 J, 6 J e 4 J. L’energia interna dipende dalle temperature per il gas ideale, anche se il percorso è isobaro.'}
def assemble(repo,source_ref):
 return assemble_family(repo,source_ref,'isobaric-monatomic-heat',TASKS,CHOICES,UNITS,'isobaric-monatomic-heat-progressive.svg',FIGURES,15400,unit='u5',course='C3',source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json',skill='C3-L03',prerequisites=['C1-L001','C3-L01','C3-L02','C3-L03','C3-L06','C3-L07'],section='Calore ed energia interna nel gas monoatomico',coverage=['Capacità totali C_p e C_V','Calore isobaro distinto da energia interna','Inverse, confronti e taratura'])
if __name__=='__main__':write_family(assemble,'isobaric-monatomic-heat-154')
