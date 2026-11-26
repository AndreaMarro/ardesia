"""Ten distinct Cric work and power problems; authoring only."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_IDS=[f'C1-Q{n:03}' for n in range(61,71)]
TASKS=[
('La componente che trasferisce energia','Una forza costante di 16 N agisce durante uno spostamento orizzontale di 5 m del suo punto di applicazione. L’angolo fra forza e spostamento è 60°. Quanto lavoro compie la forza, in joule?',40,
 'Il lavoro dipende dalla componente della forza lungo lo spostamento. La proiezione vale 16 cos60°=8 N, concorde al moto; moltiplico per 5 m e ottengo +40 J. La componente perpendicolare non contribuisce al prodotto scalare, anche se il modulo della forza è maggiore di 8 N.',
 r'W=Fd\cos\alpha\qquad W=16\cdot5\cdot\frac12\,\mathrm J\qquad W=40\,\mathrm J',
 '80 J omette il coseno; −40 J attribuirebbe un angolo ottuso o il verso opposto. Otto newton è la componente parallela, non il lavoro: manca ancora lo spostamento.','Proietta la forza nella direzione dello spostamento prima di moltiplicare.'),
('Una tensione che cambia la direzione','Una pallina si muove su un cerchio a rapidità costante, trattenuta da un filo ideale teso con centro fisso. Perché il lavoro della tensione è nullo?',
 ['La tensione è perpendicolare allo spostamento istantaneo','La tensione è sempre nulla','La pallina non si sposta nello spazio','Qualsiasi forza a modulo costante ha lavoro nullo','La tensione è parallela alla velocità'],
 'In ogni punto la tensione è radiale e la velocità tangente al cerchio. Il piccolo spostamento lungo la traiettoria è perpendicolare alla forza, quindi ogni contributo T·dr è nullo e lo è anche la loro somma. Una forza può così cambiare la direzione della velocità senza cambiare l’energia cinetica.',
 r'\vec T\perp d\vec r\qquad dW=\vec T\cdot d\vec r\qquad dW=0\qquad W_T=0',
 'La tensione non deve essere nulla: fornisce l’accelerazione centripeta. La pallina cambia posizione e il solo modulo costante di una forza non basta a rendere nullo il lavoro. Se fosse parallela alla velocità, il prodotto scalare non sarebbe nullo.','Disegna raggio e tangente nello stesso punto.'),
('Il freno compie lavoro resistente','Una ruota riceve da un freno una forza tangenziale resistente di modulo costante 8 N. Il punto sul bordo percorre complessivamente 6 m nel verso opposto alla forza. Quanto lavoro compie questa forza sulla ruota, in joule?',-48,
 'La forza resistente è opposta allo spostamento locale del punto su cui agisce. Ogni contributo ha segno negativo; con modulo costante basta moltiplicare −8 N per i 6 m percorsi. Il lavoro è −48 J: riguarda il trasferimento dovuto al freno, non una misura positiva della distanza.',
 r'\cos180^\circ=-1\qquad W=-Fs\qquad W=-8\cdot6\,\mathrm J\qquad W=-48\,\mathrm J',
 '+48 J conserverebbe soltanto il modulo e perderebbe il verso resistente. Zero confonderebbe questa forza tangenziale con una forza centripeta; 4/3 o 3/4 derivano da divisioni fra i dati e non hanno la dimensione del lavoro.','Scegli il segno dal verso della forza rispetto al moto del punto di contatto.'),
('Un’area trapezoidale','Lungo uno spostamento rettilineo di 0,40 m una forza parallela e concorde cresce linearmente da 2 N a 10 N. Qual è il suo lavoro?',
 ['12/5 J','4 J','4/5 J','16/5 J','12 J'],
 'La forza varia, quindi non uso soltanto uno dei due estremi. Nel grafico forza–posizione il lavoro è l’area del trapezio: la forza media spaziale è (2+10)/2=6 N. Moltiplico per 0,40=2/5 m e ottengo 12/5 J. Il fattore un mezzo deriva dalla variazione lineare, non da una formula valida per qualunque profilo.',
 r'F_{\rm media\ spaziale}=\frac{2+10}{2}\,\mathrm N\qquad F_{\rm media\ spaziale}=6\,\mathrm N\qquad W=6\cdot\frac25\,\mathrm J\qquad W=\frac{12}{5}\,\mathrm J',
 '4 J usa soltanto la forza finale e 4/5 J quella iniziale. 16/5 J considera la sola variazione di forza senza la corretta area; 12 J somma i valori numerici estremi senza la distanza e la media.','Dividi il trapezio in rettangolo e triangolo, oppure trova la media dei due estremi.'),
('Aumento di energia e valore finale','La massa di un corpo resta costante e la sua rapidità raddoppia, nel regime classico. Di quanto aumenta l’energia cinetica rispetto al valore iniziale K_i>0?',
 ['Di 3 K_i; il valore finale è 4 K_i','Di 4 K_i; il valore finale è 5 K_i','Di K_i; il valore finale è 2 K_i','Non cambia','Di K_i/2'],
 'Nell’energia cinetica la rapidità è elevata al quadrato: raddoppiarla porta K_f a quattro volte K_i. La domanda chiede però l’aumento, non il nuovo valore. Sottraggo K_i dal valore finale 4K_i e ottengo ΔK=3K_i, cioè un aumento del 300% del valore iniziale.',
 r'K_i=\frac12mv_i^2\qquad K_f=\frac12m(2v_i)^2\qquad K_f=4K_i\qquad \Delta K=K_f-K_i\qquad \Delta K=3K_i',
 'Quattro K_i è il valore finale, non l’aumento. Un aumento di K_i tratterebbe la dipendenza dalla rapidità come lineare; zero ignorerebbe il raddoppio e K_i/2 non segue dal quadrato.','Calcola prima K_f/K_i, poi distingui K_f dalla differenza K_f−K_i.'),
('I lavori si sommano con il segno','Due forze compiono sullo stesso corpo lavori +18 J e −6 J. Le altre forze hanno lavoro nullo. Se l’energia cinetica iniziale è 5 J, quanto vale quella finale in joule?',17,
 'Il teorema dell’energia cinetica usa la somma algebrica dei lavori di tutte le forze. Il lavoro totale è 18−6=12 J, quindi l’energia cinetica cresce di 12 J. Al valore iniziale 5 J aggiungo questa variazione: K_f=17 J. Il lavoro resistente non si somma come modulo positivo.',
 r'W_{\rm tot}=18\,\mathrm J-6\,\mathrm J\qquad W_{\rm tot}=12\,\mathrm J\qquad K_f=K_i+W_{\rm tot}\qquad K_f=5\,\mathrm J+12\,\mathrm J\qquad K_f=17\,\mathrm J',
 '12 J è la variazione, non l’energia finale. 29 J sommerebbe i moduli dei due lavori; 23 J ignorerebbe il contributo resistente. Cinque joule presupporrebbe un lavoro totale nullo, che qui non c’è.','Scrivi il bilancio K_f−K_i prima di sostituire i lavori.'),
('La potenza in quell’istante','Una cinghia esercita una trazione di 25 N. In un certo istante il punto di applicazione si muove a 0,80 m/s nella stessa direzione e nello stesso verso della forza. Qual è la potenza meccanica fornita, in watt?',20,
 'La potenza istantanea di una forza è il prodotto scalare fra forza e velocità del punto di applicazione. Qui i vettori sono concordi e il coseno vale uno: 25·0,80=25·4/5=20 W. Non occorre conoscere un intervallo di tempo o lo spostamento totale per trovare questo valore istantaneo.',
 r'P=\vec F\cdot\vec v\qquad P=Fv\qquad P=25\cdot\frac45\,\mathrm W\qquad P=20\,\mathrm W',
 '125/4 dividerebbe la forza per la rapidità, con dimensione diversa dalla potenza. 25 copia una forza, 4/5 copia una rapidità e −20 W darebbe il verso resistente anziché quello concorde dichiarato.','Usa la velocità del punto sul quale la cinghia applica la forza.'),
('Dare un nome a N·m nel lavoro','Qual è il nome dell’unità SI del lavoro, equivalente al prodotto di un newton per un metro?',
 ['joule','watt','pascal','newton','coulomb'],
 'Il lavoro trasferisce energia e si misura in joule. Una forza di un newton che agisce concordemente per un metro compie un joule: 1 J=1 N·m. L’equivalenza dimensionale non elimina la distinzione fisica fra lavoro e momento di una forza, per il quale si mantiene la scrittura N·m.',
 r'1\,\mathrm J=1\,\mathrm{N\,m}\qquad 1\,\mathrm J=1\,\mathrm{kg\,m^2/s^2}',
 'Il watt è un joule al secondo, quindi misura potenza. Il pascal misura pressione, il newton forza e il coulomb carica elettrica: non sono nomi dell’unità di lavoro.','Ricostruisci le dimensioni da forza per spostamento.'),
('Stessa energia, durata più breve','Due dispositivi trasferiscono la stessa energia meccanica positiva W. Il dispositivo A impiega un terzo del tempo di B. Quanto vale il rapporto delle potenze medie P_A/P_B?',3,
 'Le potenze medie sono W/t_A e W/t_B. Nel rapporto si cancella la stessa energia: rimane t_B/t_A. Poiché t_A=t_B/3, il rapporto vale tre. Il confronto riguarda le medie sull’intero trasferimento e non impone una legge per le potenze istantanee.',
 r'\frac{P_A}{P_B}=\frac{W/t_A}{W/t_B}\qquad \frac{P_A}{P_B}=\frac{t_B}{t_A}\qquad t_A=\frac{t_B}{3}\qquad \frac{P_A}{P_B}=3',
 'Un terzo usa il rapporto delle durate nel verso diretto anziché inverso. Uno considera soltanto l’energia uguale e nove quadra un fattore che nella durata compare una sola volta. Il risultato è puro, non una potenza in watt.','Il medesimo lavoro trasferito in meno tempo richiede una potenza media maggiore.'),
('La distanza fino al primo arresto','Un carrello di massa 4 kg procede a 3 m/s. Una forza resistente costante di modulo 6 N è l’unica a compiere lavoro. Dopo quale distanza si ferma, in metri?',3,
 'L’energia cinetica iniziale è (1/2)·4·3²=18 J. All’arresto K_f=0; il lavoro resistente vale −6s e deve essere −18 J. Ricavo s=18/6=3 m. La distanza è positiva benché il lavoro sia negativo, e il bilancio termina al primo arresto.',
 r'K_i=\frac12\cdot4\cdot3^2\,\mathrm J\qquad K_i=18\,\mathrm J\qquad -Fs=-K_i\qquad s=\frac{18\,\mathrm J}{6\,\mathrm N}\qquad s=3\,\mathrm m',
 'Sei metri ometterebbe il fattore un mezzo nell’energia iniziale. Meno tre confonderebbe il segno del lavoro con quello della distanza; diciotto è il valore numerico dell’energia, da dividere ancora per la forza.','Il lavoro totale deve eliminare tutta l’energia cinetica iniziale.')]
CHOICES={n:0 for n,t in enumerate(TASKS,1) if isinstance(t[2],list)}
UNITS={1:'J',3:'J',6:'J',7:'W',9:'1',10:'m'}
FIGURES={1:'Il primo pannello separa la forza obliqua dalla sua componente lungo lo spostamento. L’angolo è 60° e le due frecce di forza hanno scala comune; il segmento d=5 m ha una scala di lunghezze indipendente.',4:'Nel grafico centrale il lavoro è l’area sotto F_x(x): un rettangolo di 4/5 J e un triangolo di 8/5 J, per un totale 12/5 J. Gli assi mostrano unità fisiche e l’origine comune.',6:'Le barre finali mostrano 5 J iniziali e 17 J finali; la differenza di 12 J è il lavoro totale, ottenuto da +18 J e −6 J. Le due energie hanno origine e scala comuni.'}
def assemble(repo, source_ref):
    return assemble_family(repo, source_ref, 'cric-c1-l007', TASKS, CHOICES, UNITS, 'cric-c1-l007-progressive.svg', FIGURES, 0, course='C1', source_origin='cric', source_ids=SOURCE_IDS, source_path='officina-di-fisica/content/C1.json', skill='C1-L007', section='Lavoro, energia cinetica e potenza', coverage=['Lavoro orientato e area sotto la forza', 'Variazione di energia cinetica', 'Potenza media e istantanea'], overrides={2: {'error': {'category': 'concetto', 'message': TASKS[1][5], 'target': 'C1-L007'}}, 8: {'error': {'category': 'unità', 'message': TASKS[7][5], 'target': 'C1-L007'}}})
if __name__=='__main__':write_family(assemble,'cric-c1-l007')
