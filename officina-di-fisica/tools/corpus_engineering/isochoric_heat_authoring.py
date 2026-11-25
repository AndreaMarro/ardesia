"""Author-only heat transfer to a closed rigid gas sample."""
from .vector_geometry_authoring import assemble_family, write_family
P=('In ogni prova il sistema è un campione chiuso di gas ideale, in un recipiente rigido. '
   'La capacità termica totale C_V>0, in J/K, è costante durante il riscaldamento; non è una capacità molare né un calore specifico. '
   'L’aumento ΔT=T_f−T_i>0 è in K, con temperature assolute positive. '
   'Non vi sono agitatori, lavoro elettrico o altre forme di lavoro, né variazioni di energia cinetica o potenziale macroscopica. '
   'Q è positivo se entra come calore e W è positivo se il gas compie lavoro. ')
TASKS=[
('Riscaldare senza spostare il confine',P+'Con C_V=2 J/K e ΔT=10 K, quanto calore Q entra nel campione, in J?',20,
 'La parete rigida non si sposta: il lavoro di espansione è zero. Il primo principio lascia quindi Q=ΔU. La capacità totale indica quanti joule servono per ogni kelvin; due joule per kelvin per dieci kelvin danno venti joule. L’energia entra durante il processo e aumenta U: non si attribuisce al gas una quantità di calore immagazzinata.',
 r'W=0\qquad \Delta U=Q-W\qquad Q=C_V\Delta T\qquad Q=(2\,\mathrm{J/K})(10\,\mathrm K)\qquad Q=20\,\mathrm J',
 'Quaranta J richiederebbero C_V=4 J/K oppure ΔT=20 K, diversi dai dati. Non si moltiplica ancora per massa o moli: C_V appartiene già all’intero campione. Volume fermo non significa pressione ferma.','Chiediti se il confine si sposta, poi usa la capacità dell’intero campione.'),
('L’unità del calore trasferito','C_V è la capacità totale in J/K e ΔT è un intervallo in K. Quale unità misura il calore Q=C_VΔT?',['J','K','J/K','J/(kg·K)','W'],
 'Nel prodotto si cancellano i kelvin e rimane il joule. Il calore è un trasferimento di energia. La capacità termica misura energia per variazione di temperatura; il calore specifico aggiunge invece una divisione per massa.',
 r'[C_V\Delta T]=\mathrm{(J/K)K}\qquad [Q]=\mathrm J',
 'K misura temperatura o intervallo termico, J/K capacità totale e J/(kg·K) calore specifico. W=J/s richiederebbe dividere l’energia per un tempo, che qui non compare.','Cancella K fra capacità e intervallo, senza introdurre una massa.'),
('Un recipiente rigido può aumentare la pressione',P+'Il gas assorbe calore. Quale affermazione è corretta?',['Il lavoro di espansione è nullo; energia interna e pressione aumentano','La pressione resta necessariamente costante perché il volume è fisso','Il calore scambiato è nullo perché il recipiente è chiuso','Il gas compie lavoro positivo soltanto perché le molecole si agitano di più','L’energia interna resta costante perché il volume non cambia'],
 'Chiuso significa che non passa materia, non che non passa energia. La rigidità annulla il lavoro di espansione ma permette il riscaldamento. Per il campione ideale a n e V fissi, p è proporzionale alla temperatura assoluta: aumentando T cresce p. Gli urti molecolari esercitano forza sulla parete; senza spostamento della parete non producono lavoro di espansione.',
 r'\Delta V=0\qquad W=0\qquad \Delta U=Q>0\qquad p=\frac{nRT}{V}',
 'Pressione costante è un vincolo diverso. Un isolamento termico imporrebbe Q=0; la semplice chiusura alla materia non lo impone. Nel modello assegnato, Q=0 contraddirebbe il riscaldamento senza lavoro. Maggiore agitazione non sostituisce lo spostamento del confine nella definizione del lavoro.','Distingui chiusura alla materia, rigidità e isolamento termico.'),
('Due campioni con capacità diversa',P+'A ha C_V=2 J/K e B ha C_V=4 J/K. Entrambi aumentano la temperatura di 10 K in prove separate. Quale confronto è corretto?',['Q passa da 20 a 40 J','Q resta 20 J','Q passa da 20 a 10 J','Q passa da 20 a 80 J','Q diventa zero'],
 'Le due capacità descrivono campioni preparati separatamente; non si cambia la quantità di gas nel corso della singola prova chiusa. B richiede quattro joule per kelvin invece di due. Con lo stesso aumento di dieci kelvin, il calore raddoppia da venti a quaranta joule.',
 r'Q_A=(2\,\mathrm{J/K})(10\,\mathrm K)\qquad Q_A=20\,\mathrm J\qquad Q_B=(4\,\mathrm{J/K})(10\,\mathrm K)\qquad Q_B=40\,\mathrm J',
 'Venti ignora il nuovo campione, dieci rende inversa la dipendenza e ottanta raddoppia anche ΔT senza motivo. Zero contraddice capacità e incremento entrambi positivi.','A parità di ΔT, confronta direttamente le capacità totali.'),
('La capacità dall’energia entrata',P+'Entrano Q=20 J e si osserva ΔT=10 K. Quanto vale C_V in J/K?',2,
 'Per trovare l’energia necessaria a un kelvin dividiamo i venti joule per i dieci kelvin effettivamente percorsi. Si ottengono due joule per kelvin. La sostituzione nella legge iniziale ricostruisce esattamente il calore misurato.',
 r'C_V=\frac Q{\Delta T}\qquad C_V=\frac{20\,\mathrm J}{10\,\mathrm K}\qquad C_V=2\,\mathrm{J/K}\qquad (2\,\mathrm{J/K})(10\,\mathrm K)=20\,\mathrm J',
 'Moltiplicare Q per ΔT darebbe J·K, non J/K. Il reciproco ΔT/Q avrebbe K/J. Non occorre conoscere la massa per ricavare questa capacità totale.','Isola C_V dividendo per l’aumento positivo di temperatura.'),
('Un aumento, non la temperatura finale',P+'Entrano Q=20 J in un campione con C_V=2 J/K. Quanto vale ΔT in K?',10,
 'Ogni kelvin richiede due joule. Venti diviso due dà dieci kelvin di aumento. La temperatura finale richiederebbe anche T_i, che non è assegnata; qui si determina soltanto la differenza. Un intervallo di dieci kelvin ha la stessa ampiezza di dieci gradi Celsius.',
 r'\Delta T=\frac Q{C_V}\qquad \Delta T=\frac{20\,\mathrm J}{2\,\mathrm{J/K}}\qquad \Delta T=10\,\mathrm K',
 'Non si aggiunge 273,15 a un intervallo termico. Venti copia il valore dell’energia senza dividerlo per C_V; quaranta moltiplica anziché dividere. Nessuno di questi procedimenti ricostruisce Q=20 J.','Dividi l’energia per i joule richiesti a ogni kelvin.'),
('Raddoppiare l’intervallo termico',P+'A e B hanno C_V=2 J/K. A usa ΔT_A=10 K e B usa ΔT_B=20 K. Quanto vale Q_B/Q_A?',['2','1/2','4','1','−2'],
 'Il primo processo trasferisce venti joule e il secondo quaranta. Dividendo quaranta per venti si ottiene due. La capacità comune si cancella, perciò il rapporto coincide con quello degli incrementi termici.',
 r'Q_A=20\,\mathrm J\qquad Q_B=40\,\mathrm J\qquad \frac{Q_B}{Q_A}=\frac{\Delta T_B}{\Delta T_A}=2',
 'Un mezzo inverte il confronto, quattro quadra una dipendenza lineare e uno ignora il cambiamento. Il rapporto non è negativo: entrambe le prove assorbono calore.','Calcola le due energie o cancella la capacità comune.'),
('Lo scarto di una proposta troppo alta',P+'Con C_V=2 J/K e ΔT=10 K si propone Q_proposto=40 J. Quanto vale proposta meno risultato corretto?',['20 J','−20 J','40 J','0 J','10 J'],
 'Il modello richiede venti joule. La proposta di quaranta supera il valore corretto di venti joule; lo scarto richiesto è dunque positivo. Il suo segno descrive una sovrastima e non una diversa convenzione per il calore.',
 r'Q=20\,\mathrm J\qquad e=Q_{\rm proposto}-Q\qquad e=(40-20)\,\mathrm J\qquad e=20\,\mathrm J',
 'Meno venti esegue la sottrazione opposta. Quaranta copia la proposta, zero la accetta e dieci dimezza ancora lo scarto.','Prima ricava Q, poi rispetta l’ordine della sottrazione.'),
('La formula inversa per la capacità',P+'Quale formula isola C_V dalla relazione Q=C_VΔT?',['C_V = Q / ΔT','C_V = Q ΔT','C_V = ΔT / Q','C_V = 2Q / ΔT','C_V = Q / (2ΔT)'],
 'ΔT è positivo, quindi possiamo dividere entrambi i membri per esso senza annullare un fattore nullo. L’unità di Q/ΔT è J/K, quella della capacità totale. Per esempio, venti joule su dieci kelvin restituiscono due J/K.',
 r'Q=C_V\Delta T\qquad \frac Q{\Delta T}=C_V\qquad [C_V]=\mathrm{J/K}',
 'Il prodotto QΔT ha unità J·K e il reciproco ΔT/Q ha K/J. Le formule con il fattore due hanno unità corrette ma producono rispettivamente il doppio o la metà del calore assegnato quando si torna nella legge iniziale.','L’incognita moltiplica ΔT: elimina quel fattore con una divisione.'),
('Due fattori fra prove diverse',P+'Fra due prove si ha C_V,B=κ₁C_V,A e ΔT_B=κ₂ΔT_A, con κ₁,κ₂>0. Quale espressione dà sempre Q_B/Q_A?',['κ₁ κ₂','κ₁ / κ₂','κ₂ / κ₁','κ₁ + κ₂','κ₁ κ₂²'],
 'Scriviamo il prodotto completo in entrambe le prove. Il nuovo campione porta un fattore κ₁ e il nuovo intervallo porta κ₂. Entrambi agiscono alla prima potenza: dopo la cancellazione degli ingressi di A rimane il loro prodotto.',
 r'Q_B=(\kappa_1C_{V,A})(\kappa_2\Delta T_A)\qquad Q_A=C_{V,A}\Delta T_A\qquad Q_B/Q_A=\kappa_1\kappa_2',
 'I quozienti rendono inversa una dipendenza diretta. La somma darebbe due per prove identiche, mentre il rapporto deve essere uno; κ₂² introduce un quadrato dell’intervallo assente nella legge.','Sostituisci i fattori in ciascun ingresso prima di formare il rapporto.'),
('Capacità e intervallo aumentano insieme',P+'A: C_V=2 J/K, ΔT=10 K. B: C_V=4 J/K, ΔT=20 K. Quanto vale Q_B/Q_A?',4,
 'A assorbe venti joule; B ne assorbe ottanta. Il rapporto ottanta su venti è quattro. Si può anche moltiplicare il raddoppio della capacità per quello dell’intervallo termico.',
 r'Q_A=20\,\mathrm J\qquad Q_B=(4\,\mathrm{J/K})(20\,\mathrm K)\qquad Q_B=80\,\mathrm J\qquad Q_B/Q_A=4',
 'Due tiene conto di un solo raddoppio. Ottanta è un’energia, non il rapporto adimensionale. Un quarto rovescia B e A.','Ricava entrambe le energie prima di dividerle.'),
('La media delle energie nelle due prove',P+'A usa C_V=2 J/K e ΔT=10 K; B usa C_V=4 J/K e ΔT=20 K. Qual è la media aritmetica dei due Q con uguale peso?',['50 J','100 J','25 J','45 J','60 J'],
 'I due trasferimenti sono venti e ottanta joule. La loro somma è cento e la metà è cinquanta joule. Gli ingressi medi sarebbero tre J/K e quindici K: il loro prodotto dà quarantacinque joule, che descrive una terza prova, non la media richiesta.',
 r'Q_A=20\,\mathrm J\qquad Q_B=80\,\mathrm J\qquad \overline Q=\frac{20+80}{2}\,\mathrm J\qquad \overline Q=50\,\mathrm J',
 'Cento è la somma, venticinque dimezza ancora e sessanta è la differenza delle energie. Quarantacinque usa il prodotto degli ingressi medi: qui non coincide con la media delle uscite.','Media le due energie dopo aver applicato la legge a ogni prova.'),
('L’intervallo per un bersaglio quadruplo',P+'A ha C_V=2 J/K e ΔT_A=10 K. B ha C_V=4 J/K e deve assorbire Q_B=4Q_A. Quanto vale ΔT_B/ΔT_A?',2,
 'Il riferimento trasferisce venti joule e il bersaglio ne richiede ottanta. La capacità di B è già raddoppiata, quindi per arrivare a quattro volte l’energia resta un fattore due nell’intervallo. Ottanta diviso quattro J/K dà venti kelvin, il doppio dei dieci iniziali.',
 r'Q_A=20\,\mathrm J\qquad Q_B=80\,\mathrm J\qquad \Delta T_B=\frac{80\,\mathrm J}{4\,\mathrm{J/K}}\qquad \Delta T_B=20\,\mathrm K\qquad \Delta T_B/\Delta T_A=2',
 'Un fattore quattro nell’intervallo insieme alla capacità doppia porterebbe a otto volte Q_A. Uno lascerebbe soltanto il raddoppio già dato dal campione.','Togli dal fattore energetico il contributo della nuova capacità.'),
('Tarare il display prima dell’inversa',P+'S=qQ è un display continuo e adimensionale, con q>0 costante. A con C_V=2 J/K, ΔT=10 K dà S=60. B dà S=240 e usa ΔT=20 K. Quanto vale C_V,B in J/K?',4,
 'A assorbe venti joule: sessanta unità di display su venti joule danno q=3 J⁻¹. La lettura duecentoquaranta corrisponde quindi a ottanta joule. Dividiamo questa energia per i venti kelvin di B e troviamo quattro J/K.',
 r'Q_A=20\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad Q_B=\frac{240}{q}=80\,\mathrm J\qquad C_{V,B}=\frac{Q_B}{\Delta T_B}\qquad C_{V,B}=4\,\mathrm{J/K}',
 'Dividere direttamente 240 per 20 darebbe dodici, triplo del valore corretto: S non è espresso in joule. Il guadagno si applica alle energie, non agli incrementi termici.','Usa il riferimento per convertire le letture in joule.'),
('Separare guadagno e offset',P+'S=qQ+b è un display continuo e adimensionale. A: C_V=2 J/K, ΔT=10 K, S=41. B: C_V=4 J/K, ΔT=20 K, S=161. C: ΔT=10 K, S=81. Quanto vale C_V,C?',['4 J/K','8 J/K','2 J/K','81/20 J/K','40 J/K'],
 'Le energie dei riferimenti sono venti e ottanta joule. La differenza centoventi delle letture divisa per sessanta joule dà q=2 J⁻¹; dalla prima prova segue b=1. Per C togliamo l’offset e dividiamo per il guadagno: ottanta su due sono quaranta joule. Con dieci kelvin di aumento servono quattro J/K.',
 r'q=\frac{161-41}{(80-20)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_C=\frac{81-1}{q}\qquad Q_C=40\,\mathrm J\qquad C_{V,C}=4\,\mathrm{J/K}',
 'Otto J/K produrrebbero S=161, due J/K darebbero S=41. 81/20 J/K omette l’offset e ricostruisce S=82. Quaranta J/K scambia il numero dell’energia con quello della capacità e darebbe S=801.','Determina q dalle differenze, poi b da un riferimento.'),
('Un vincolo fra preparazioni del campione',P+'Fra prove diverse si sceglie C_V=cΔT, con c=(1/5) J/K². In ciascuna singola prova C_V resta costante: il vincolo collega preparazioni diverse, non C_V alla temperatura istantanea. Se Q=20 J, quanto vale ΔT>0?',['10 K','−10 K','100 K','5 K','20 K'],
 'Sostituiamo la capacità scelta per la prova nel prodotto Q=C_VΔT. Si ottiene Q=c(ΔT)². Venti joule divisi per un quinto di joule per kelvin quadrato danno cento kelvin quadrati. La radice positiva è dieci kelvin e restituisce C_V=2 J/K. Non si integra una capacità variabile con T: all’interno del processo essa rimane costante.',
 r'Q=c(\Delta T)^2\qquad (\Delta T)^2=\frac Qc\qquad (\Delta T)^2=100\,\mathrm{K^2}\qquad \Delta T=10\,\mathrm K\qquad C_V=2\,\mathrm{J/K}',
 'La radice negativa renderebbe negativi sia l’incremento sia C_V, fuori dominio. Cento è il numero del quadrato, non dell’intervallo. Cinque e venti kelvin darebbero rispettivamente Q=5 J e Q=80 J.','Sostituisci il vincolo, controlla le unità del quadrato e scegli il ramo positivo.'),
]
CHOICES={n:0 for n in [2,3,4,7,8,9,10,12,15,16]}
UNITS={1:'J',5:'J/K',6:'K',11:'1',13:'1',14:'J/K'}
FIGURES={1:'Tre passaggi per un’isocora: il recipiente rigido non cambia volume; nel grafico Q contro ΔT la pendenza è la capacità totale; la media di due energie si calcola dopo i due processi. La freccia Q del primo pannello è schematica. Nel secondo le scale sono 15 px/K in orizzontale e 5 px/J in verticale. Nel terzo tutte le barre usano 5 px/J.',3:'La parete del recipiente resta ferma anche quando entra energia. Il grafico separato Q–ΔT usa C_V=2 J/K costante e passa per l’origine. Le barre finali confrontano prove diverse: 20 J, 80 J e la loro media 50 J; non sono calori simultaneamente contenuti nel gas.'}
def assemble(repo,source_ref):
 return assemble_family(repo,source_ref,'isochoric-heat',TASKS,CHOICES,UNITS,'isochoric-heat-progressive.svg',FIGURES,15300,unit='u5',course='C3',source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json',skill='C3-L03',prerequisites=['C1-L001','C3-L01','C3-L02','C3-L03','C3-L06','C3-L07'],section='Calore trasferito a volume costante',coverage=['Capacità termica totale e intervallo','Primo principio a confine rigido','Inverse, rapporti e taratura'])
if __name__=='__main__':write_family(assemble,'isochoric-heat-153')
