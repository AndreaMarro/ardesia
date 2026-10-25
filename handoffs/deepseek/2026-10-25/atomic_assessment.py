"""Original short-answer assessment, one explicit item per declared subtarget.

Editorial data only. No scoring engine, publication or validation signature.
"""
import json
from build_content import ROOT,dump

DATA={}
def D(family,text):
    DATA[family]=[{'prompt':row.split('|',1)[0].strip(),'answer':row.split('|',1)[1].strip()} for row in text.strip().splitlines() if row.strip()]

D('U1-01','''
Normalizza 0,00072 usando una sola cifra non nulla prima della virgola.|7,2·10^-4.
Calcola (8·10^5)/(2·10^2).|4·10^3; nel rapporto gli esponenti si sottraggono.
Stima 4,8·10^3 a una cifra significativa, dichiarando che non è un dato più preciso.|5·10^3; l’arrotondamento non aggiunge precisione sperimentale.
''')
D('U1-02','''
Una formula somma una velocità e un’accelerazione senza un fattore temporale. È dimensionalmente omogenea?|No: L/T e L/T² non sono dimensioni sommabili.
Quali unità SI hanno massa,tempo e lunghezza?|kg,s,m rispettivamente.
Converti 250mL in m³.|2,5·10^-4m³; 1mL=10^-6m³.
Un adulto ha altezza circa2m: una stima di2·10^3m è compatibile con la scala dichiarata?|No: è mille volte maggiore e corrisponde a2km.
Triplicando un campione omogeneo alla stessa temperatura quali cambiano fra massa e temperatura?|La massa triplica, la temperatura resta invariata nel modello; massa estensiva,Tintensiva.
Un valore di energia negativo rende l’energia una grandezza vettoriale?|No: lo scalare può avere segno; un vettore richiede anche direzione e verso.
''')
D('U1-03','''
Un triangolo rettangolo ha cateto opposto3 e ipotenusa5. Quanto vale il seno dell’angolo considerato?|3/5; rapporto adimensionale.
Per lo stesso triangolo, il cateto adiacente vale4. Quanto vale il coseno?|4/5.
Quanto vale la tangente nell’angolo con seno3/5 e coseno4/5?|3/4; tangente=seno/coseno.
Un vettore di modulo7N è a90° da+x. Quali componenti?|Fx=0N,Fy=7N; l’angolo è rispetto all’assexpositivo.
''')
D('U1-04','''
Un vettore ha componenti(−5,12)m. Qual è il modulo?|13m; il segno di una componente non rende negativo il modulo.
Somma(1,2)N e(4,−5)N.|(5,−3)N.
Calcola(7,1)m−(2,−3)m.|(5,4)m.
Calcola il prodotto scalare di(2,1)m e(−1,2)m.|0m²: i vettori sono ortogonali.
Calcola la componentez di(1,0,0)N×(0,3,0)N.|+3N²; scambiando l’ordine sarebbe−3N².
''')
D('U2-01','''
Da x=−2m a x=5m, qual è lo spostamento? Coincide necessariamente col cammino?|+7m; il cammino può essere maggiore se vi sono inversioni.
Due corpi seguono lo stesso cerchio ma con tempi diversi. Hanno necessariamente la stessa legge oraria?|No: la traiettoria è geometrica; la legge oraria specifica posizione e tempo.
Un corpo compie spostamento12m in4s e termina con velocità1m/s. Qual è la velocità media e coincide con quella finale?|3m/s; non coincide in questo caso.
La velocità passa da−1 a5m/s in3s. Qual è l’accelerazione media? Quando coincide con quella istantanea in tutto l’intervallo?|2m/s²; se l’accelerazione è costante.
MRU:x0=−3m,v=2m/s,t=5s. Trova x.|7m.
Moto a costante:x0=1m,v0=1m/s,a=2m/s²,t=2s. Trova x e v.|x=7m;v=5m/s.
Due masse diverse cadono nel vuoto dalla stessa quota e da ferme. Quale arriva prima nel modello localegcostante?|Arrivano insieme: l’accelerazione ideale èg per entrambe.
Un proiettile ha velocità iniziale(8,6)m/s,g=10m/s² e torna alla quota iniziale. Quali tempo di volo e gittata, senza aria?|1,2s e9,6m; il tempo verticale è2·6/10.
Moto circolare uniforme:r=0,5m,v=2m/s. Quali modulo e direzione di a?|8m/s² verso il centro, non tangente.
''')
D('U2-02','''
Un corpo isolato ha velocità iniziale non nulla in un riferimento inerziale. Deve fermarsi secondo il primo principio?|No: mantiene velocità vettoriale costante.
Su3kg agisce risultante(9,0)N. Qual è l’accelerazione?|(3,0)m/s².
Un dito spinge un tavolo. La reazione del tavolo annulla la forza sul tavolo nel suo diagramma?|No: la reazione agisce sul dito, un altro corpo.
Risultante nulla implica corpo fermo?|No: implica accelerazione nulla,compatibile con velocità costante non nulla.
Con g=9,8m/s² qual è il peso di0,5kg? Se la distanza da una massa puntiforme raddoppia come varia l’attrazione?|4,9N; l’attrazione gravitazionale puntiforme diventa1/4.
Un blocco di peso10N è su piano orizzontale e riceve spinta verticale verso il basso di4N. Qual è la normale in equilibrio?|14N; normale non sempre uguale al solo peso.
Un blocco conN=10N eμs=0,5 è tirato con2N ma resta fermo. Qual è l’attrito statico? Se scivola conμd=0,3 quale attrito dinamico?|2N nel primo caso;3N nel secondo modello.
Una massa1kg è sospesa in equilibrio a un filo ideale,g=10m/s². Qual è la tensione e su quale direzione agisce?|10N lungo il filo verso il punto di sospensione sul corpo.
Molla ideale:k=50N/m,x=0,04m. Qual è la forza di richiamo con asse positivo nell’allungamento?|−2N; modulo2N.
''')
D('U2-03','''
Forza5N e spostamento2m sono perpendicolari. Qual è il lavoro di quella forza?|0J; il prodotto scalare è nullo.
Un motore trasferisce90J in3s. Qual è la potenza media?|30W.
Il lavoro totale su un corpo è−6J eKiniziale=10J. TrovaKfinale.|4J.
Una forza conservativa ha lavoro nullo su un percorso chiuso. Vale anche per attrito radente che dissipa energia?|No: l’attrito compie lavoro negativo lungo il percorso e non ammette lo stesso potenziale.
Con m=1kg,g=10m/s² e innalzamento2m,quanto cresceUg? Con k=40N/m e x=0,1m,quanto valeUe rispetto a x=0?|20J;0,2J.
Un sistema ideale passa daK=3J,U=9J aU=5J senza lavori non conservativi. TrovaKfinale.|7J; l’energia meccanica totale resta12J.
''')
D('U2-04','''
Massa0,4kg a velocità−3m/s. Quanto vale la quantità di moto lungo l’asse?|−1,2kg m/s.
Una forza risultante costante−6N dura0,2s. Qual è l’impulso?|−1,2N s.
Quale condizione esterna permette di conservare la quantità di moto totale durante un urto?|Impulso esterno totale nullo o trascurabile nell’intervallo,con sistema esplicitato.
Due masse uguali,una a4m/s e una ferma,restano unite dopo urto con impulso esterno nullo. Qual èvf? L’energia cinetica si conserva?|2m/s; non si conservaK,parte diventa energia interna.
''')
D('U2-05','''
Masse2kg a x=1m e2kg a x=5m: quale centro di massa?|xCM=3m.
Se la risultante esterna su un sistema di massa5kg è10N,quale accelerazione del centro di massa?|2m/s² nella direzione della risultante.
Un corpo rigido deve restare immobile?|No: rigidità idealizza distanze interne costanti; può traslare e ruotare.
Forza8N con braccio perpendicolare0,25m: quale modulo del momento?|2N m.
Un corpo ha risultante nulla ma momento totale3N m. È in equilibrio statico?|No: manca il bilancio rotazionale.
Un muscolo ha braccio0,04m e deve bilanciare un momento di8N m. Quale forza perpendicolare?|200N; un piccolo braccio richiede forza elevata.
''')
D('U3-01','''
Che cosa distingue la risposta statica di un fluido da quella di un solido a uno sforzo tangenziale?|Il fluido non sostiene uno sforzo di taglio statico senza deformazione continua,il solido può sostenerlo.
Una forza normale16N agisce su0,004m². Trova la pressione.|4000Pa.
Massa1,5kg in volume0,002m³: quale densità?|750kg/m³.
La legge p=p0+ρgh vale automaticamente in un tubo con veloce flusso dissipativo?|No: è una relazione idrostatica; il moto richiede considerare energia e perdite appropriate.
''')
D('U3-02','''
Olioρ=800kg/m³,g=10m/s²,profondità0,5m. Qual è l’incremento di pressione?|4000Pa,da aggiungere alla pressione sulla superficie.
Un aumento di pressione di2000Pa raggiunge un pistone di0,01m². Quale aumento di forza ideale?|20N,per Pascal eF=ΔpA.
Un volume immerso0,002m³ sposta fluidoρ=900kg/m³,g=10. Qual è la spinta?|18N verso l’alto.
Un corpo omogeneoρ=750 galleggia in fluidoρ=1000kg/m³. Quale frazione immersa?|0,75=75%.
Perché in un barometro ideale una colonna di liquido può misurare la pressione atmosferica?|La differenza di pressione fra atmosfera e spazio superiore quasi vuoto equilibraρgh.
Un manometro conρ=1000kg/m³,g=10,dislivello0,03m misura quale differenza di pressione?|300Pa; conta il dislivello verticale.
''')
D('U3-03','''
In2s attraversano un tubo6L. Qual è la portata volumetrica?|3L/s=0,003m³/s.
Un moto stazionario è necessariamente privo di ogni fluttuazione turbolenta?|No: stazionarietà del campo o delle medie e turbolenza sono distinzioni diverse; dichiarare se si parla di valori istantanei o medi.
Quale struttura del moto caratterizza il flusso laminare ideale in un tubo?|Strati ordinati con velocità che varia regolarmente,senza rimescolamento turbolento.
Fluido incomprimibile:A1=6cm²,v1=2m/s,A2=3cm². Qual èv2?|4m/s; portata conservata.
In flusso ideale orizzontaleρ=1000,la velocità passa da2a3m/s. Qual èp2−p1?|−2500Pa daBernoulli.
In un restringimento e una dilatazione ideali allo stesso flusso e quota,come si confrontano velocità e pressione statica?|Nel restringimento velocità maggiore e pressione minore; nella dilatazione l’opposto,senza estendere questo a una diagnosi reale.
''')
D('U3-04','''
Perché un fluido reale può richiedere differenza di pressione per mantenere portata in tubo orizzontale?|La viscosità dissipa energia meccanica; non bastaBernoulli senza perdite.
Nel profilo parabolico laminare in tubo qual è il rapporto velocità massima/media?|2,con aderenza alla parete e ipotesi diPoiseuille.
Che cosa misura il gradiente di velocità fra due strati vicini?|La variazione della velocità per distanza trasversale;nel fluido newtoniano collega sforzo tangenziale e viscosità.
AΔp,L eη fissati,il raggio aumenta del fattore3. Quale rapporto di portata ideale?|81,poichéQ∝r^4.
Due resistenze idraulicheR e3R in serie e parallelo: quali equivalenti?|4R in serie;3R/4 in parallelo,nel modello lineare.
''')
D('U3-05','''
Quali unità equivalenti ha la tensione superficiale?|N/m eJ/m².
A parità di tensione superficiale,perché una goccia piccola può mostrare effetti di superficie più importanti rispetto al peso?|Il rapporto superficie/volume cresce riducendo la dimensione;il peso scala col volume.
La risalita capillare avviene per ogni coppia liquido-parete?|No:dipende anche dalla bagnabilità;un menisco non bagnante può produrre depressione.
Una superficie piana ideale possiede salto di pressione dovuto alla sola curvatura?|No:la curvatura è nulla;non ne segue che la pressione assoluta siazero.
Fra due gocce dello stesso liquido con raggi3mm e6mm,quale ha maggior salto di pressione qualitativo perLaplace?|Quella da3mm,con curvatura maggiore.
''')
D('U4-01','''
Un’onda sonora può propagarsi nel vuoto del modello classico elementare?|No:è meccanica e richiede mezzo materiale.
Una cresta attraversa una corda:gli elementi della corda devono viaggiare con essa fino all’estremo?|No:oscillano localmente mentre perturbazione ed energia si propagano.
Un oscillatore armonico ritorna allo stesso stato dopo0,2s. Questo tempo che cosa rappresenta?|Il periodo del moto,se è l’intervallo minimo di ripetizione.
Un oscillatore compie15cicli in3s. Qual èf?|5Hz.
Se f=8Hz,quanto valeT?|0,125s.
Per f=3Hz quale pulsazione?|6πrad/s,poichéω=2πf.
Come si riconosceλ su un profilo spaziale sinusoidale a tempo fisso?|Distanza fra due punti consecutivi in fase,per esempio due creste.
Conλ=0,4m ef=5Hz quale velocità di propagazione?|2m/s.
La forma sin(kx−ωt) conk,ωpositivi viaggia verso quale direzione? Perché?|+x; a fase costantex=(ω/k)t+costante cresce nel tempo.
In un’onda trasversale lo spostamento locale è parallelo o perpendicolare alla propagazione? E in una longitudinale?|Perpendicolare nella trasversale,parallelo nella longitudinale.
''')
D('U4-02','''
Due spostamenti istantanei−2mm e+5mm nello stesso punto di un mezzo lineare danno quale risultante?|+3mm;la somma è algebrica.
Due onde uguali possono annullare lo spostamento localmente senza distruggere l’energia di tutto il campo?|Sì:l’interferenza distruttiva locale è compatibile con ridistribuzione energetica e nodi.
''')
D('U4-03','''
Una sorgente trasferisce0,8J in un impulso. Qual è l’energia dell’impulso e si può dedurre la potenza senza durata?|0,8J;no,serve l’intervallo temporale.
Un’onda trasferisce0,8J in0,2s. Quale potenza media?|4W.
Potenza10W attraversa uniformemente area5m² perpendicolare. Quale intensità?|2W/m².
Per sorgente isotropa senza assorbimento,I=18W/m² a1m. Quanto vale a3m?|2W/m²;area sferica cresce di9.
''')
D('U4-04','''
Il passaggio del suono da aria ad acqua permette di mantenere sempre la stessa velocità?|No:la velocità dipende dalle proprietà del mezzo;la frequenza di una sorgente invariata resta la stessa all’interfaccia stazionaria.
Due suoni con stessa intensità ma frequenze diverse sono necessariamente percepiti come ugualmente forti?|No:la percezione dipende anche dalla frequenza e dall’ascoltatore.
ConI/I0=10^7,quale livello di intensità?|70dB.
''')
D('U4-05','''
Nel regime subsonico usuale,un osservatore va incontro alla sorgente sonora:la frequenza ricevuta aumenta o diminuisce?|Aumenta.
Una sorgente sonora si allontana dall’osservatore fermo:il periodo fra fronti ricevuti cresce o diminuisce?|Cresce;la frequenza ricevuta diminuisce.
Muovere sorgente o osservatore ha lo stesso meccanismo geometrico rispetto ai fronti nel mezzo?|No:la sorgente modifica la spaziatura dei fronti,l’osservatore ne modifica il ritmo di incontro.
IlDoppler è un cambiamento necessario della frequenza emessa dalla sorgente?|No:può cambiare solo quella ricevuta a frequenza emessa invariata.
''')
D('U5-01','''
Analizzi un gas dentro un cilindro:come chiami il gas e il resto con cui può scambiare energia?|Gas=sistema;resto=ambiente,con confine dichiarato.
Per un gas in equilibrio quali variabili descrivono pressione,volume e temperatura e con quali unitàSI?|p inPa,V in m³,T inK,insieme alla quantità di sostanza.
Il calore scambiato è una funzione di stato come l’energia interna?|No:Q dipende dal percorso;U è funzione di stato.
Converti−20°C in kelvin.|253,15K.
Gas ideale:n=2mol,T=250K,p=100000Pa,R=8,31446261815324J/(mol K). QualeV?|0,0415723130907662m³;usa pressione assoluta e kelvin.
''')
D('U5-02','''
Un corpo ha energia interna:è corretto chiamarla calore contenuto?|No:calore è energia trasferita per differenza di temperatura.
Una capacità termica40J/K riceve120J senza transizioni. Quanto cresceT?|3K.
Massa0,5kg,c=800J/(kg K). Quale capacità termica?|400J/K.
Per una mole di gas ideale quanto valeCp−Cv e perchéCp è maggiore?|R; a pressione costante parte del calore sostiene il lavoro di espansione.
Durante fusione ideale a pressione fissata,con due fasi in equilibrio,aggiungere calore cambia necessariamenteT?|No:può cambiare la frazione di fase a temperatura costante.
ConL=2·10^5J/kg,quale calore assorbito per trasformare0,03kg nella fase che richiede quelL?|6000J;la legge e il segno del processo vanno dichiarati.
Due corpi isolati dal resto scambiano caloreQ1=+70J. Quanto valeQ2 se il recipiente è trascurabile e non ci sono altri scambi?|−70J;somma dei calori ugualezero.
''')
D('U5-03','''
Una sbarra metallica trasferisce energia dal capo caldo al freddo senza moto macroscopico del materiale. Quale meccanismo?|Conduzione.
Un liquido riscaldato si mette in circolazione per differenze di densità. Quale meccanismo di trasporto?|Convezione naturale.
Due superfici alla stessa temperatura emettono radiazione? Com’è lo scambio netto nel modello di equilibrio?|Sì,emettono entrambe;lo scambio netto èzero.
''')
D('U5-04','''
Una funzioneU torna allo stesso valore dopo un ciclo termodinamico. Quanto valeΔUciclo?|0,perché l’energia interna è funzione di stato.
Un gas riceveQ=+90J e compieW=+40J sull’ambiente. Dichiara i segni e trovaΔU.|Q entrante,W fatto dal gas:ΔU=Q−W=+50J.
La leggeΔU=Q−W permette a energia di scomparire?|No:esprime il bilancio fra energia interna e trasferimenti attraverso il confine.
Un processo con attrito può essere invertito lasciando sistema e ambiente esattamente come prima senza altri effetti?|No:è irreversibile;invertire solo il moto non annulla la produzione di entropia.
Per un gas ideale in isoterma,ΔU=0 implicaQ=0?|No:Q=W;calore e lavoro possono essere entrambi non nulli.
In una trasformazione isocora quasi statica quale lavoro di espansione?|0J perchéΔV=0.
Un gas si espande quasi staticamente a2·10^5Pa di0,001m³. Quale lavoro fatto dal gas?|+200J.
Una compressione adiabatica ideale con60J di lavoro fatto sul gas ha qualeQ eΔU?|Q=0;Wfatto dal gas=−60J;ΔU=+60J.
''')
D('U5-05','''
Un motore ciclico assorbe calore da un solo termostato e lo converte tutto in lavoro senza altri effetti. Quale principio lo esclude?|Secondo principio,enunciato diKelvin-Planck;Clausius esclude trasferimento spontaneo freddo→caldo senza altri effetti.
Un processo spontaneo può conservare energia ed essere comunque irreversibile?|Sì:conservazione energetica non impone reversibilità né entropia totale costante.
Che cosa definisce un ciclo e quanto cambia una funzione di stato al termine?|Ritorno allo stato iniziale;variazione netta della funzione di statozero.
Macchina assorbe1000J e cede700J in un ciclo. Quale rendimento?|0,3=30%;W=300J.
Fra termostati500K e400K,quale limite diCarnot?|20%,conηC=1−400/500.
Un sottosistema cede entropia all’ambiente e diminuisceS. Questo viola sempre il secondo principio?|No:si deve valutareΔStotale di sistema e ambiente;deve essere non negativa per l’universo isolato.
Nell’interpretazione statistica,più configurazioni microscopiche compatibili con un macro-stato tendono a quale entropia?|Maggiore entropia,conS collegata al logaritmo del numero di microstati nel modello appropriato.
Un flusso spontaneo di100J da500K a250K aumenta o diminuisce l’entropia totale dei due termostati? Quanto?|Aumenta di0,2J/K:100/250−100/500.
''')
D('U6-01','''
Qual è l’unitàSI della carica e quale segno assegna il verso convenzionale del campo?|Coulomb;il campo è definito tramite forza su carica di prova positiva.
Due corpi isolati si scambiano elettroni:deve conservarsi la carica di ciascuno o quella totale?|Quella totale;le cariche dei singoli corpi possono cambiare.
Per cariche puntiformi uguali a distanza tripla,quale rapporto della forza diCoulomb rispetto a prima?|1/9,a cariche fissate.
Le linee di campo sono necessariamente le traiettorie di una carica lanciata con velocità iniziale qualsiasi?|No:indicano il vettore campo locale,non vincolano una traiettoria arbitraria.
Due cariche positive uguali generano campi opposti al punto medio. Quale campo totale e quale regola si usa?|Campo nullo;somma vettoriale per sovrapposizione.
Carica+0,002C,massa0,01kg,inE=50N/C uniforme,unica forza. Quale accelerazione?|10m/s² lungoE,da a=qE/m.
''')
D('U6-02','''
Il potenziale sceltozero in un punto impone energia potenziale nulla per qualunque riferimento?|No:lo zero è convenzionale;le differenze hanno significato dinamico.
Quale unità haV=U/q e quale grandezza fisica esprime?|Volt=J/C;energia potenziale per unità di carica di prova.
Una carica+3C passa da2V a7V. QualeΔU?|+15J,da qΔV.
Se solo la forza elettrica compie lavoro eΔU=−0,4J,qualeΔK?|+0,4J per conservazione energetica.
''')
D('U6-03','''
Una sfera conduttrice neutra isolata,senza contatto,si polarizza per induzione. Deve acquisire carica netta?|No:può separare cariche mantenendo totalezero.
Un dielettrico polarizzato richiede movimento libero di tutte le cariche attraverso l’intero materiale?|No:orientazione o spostamenti locali di cariche legate possono produrre polarizzazione.
''')
D('U6-04','''
Che cosa significaDC nel modello elementare e quale grandezza non cambia segno periodicamente?|Corrente continua;il flusso di carica mantiene direzione nel modello stazionario.
In0,5s passano0,2C. Quale corrente media?|0,4A.
Un generatore ideale di tensione12V mantiene che cosa se cambia il carico?|La differenza di potenziale12V;la corrente dipende dal carico ideale.
Resistore ohmico15Ω a3V:qualeI?|0,2A.
Un filo triplicaL aρ eA fisse. Come variaR?|Triplica,daR=ρL/A.
Resistore8Ω percorso da0,5A per4s:qualiP ed energia dissipata?|2W e8J;P=I²R,energia=Pt.
Resistori6Ω e3Ω in serie e parallelo:qualiReq?|9Ω in serie;2Ω in parallelo.
''')
D('U6-05','''
Un condensatore haQ=24µC a6V. QualeC?|4µF.
Un condensatore piano ideale raddoppia l’area e la distanza tra armature. Come variaC aεfissa?|Resta uguale,poichéC=εA/d.
Inserendo dielettrico con costante relativa3 in geometria fissa,come variaC nel modello ideale?|Triplica.
Un condensatore2µF a20V immagazzina quale energia?|400µJ,daCV²/2.
Capacità4µF e4µF in serie e parallelo:qualiCeq?|2µF in serie;8µF in parallelo.
''')
D('U6-06','''
Quale osservazione dell’esperimento diOersted collega corrente e magnetismo?|Una corrente devia un ago magnetico vicino,mostrando un campo associato al filo.
Invertire la corrente in un filo inverte il verso del campo magnetico circolare intorno ad esso?|Sì,con geometria invariata,secondo la mano destra.
Una carica si muove parallela a un campo magnetico uniforme. Quale forza magnetica?|Zero,poichév×B=0.
Filo lungo0,5m,corrente2A,perpendicolare aB=0,4T. Quale forza?|0,4N;il verso è quello diL×B per corrente convenzionale.
Se la carica ha velocità perpendicolare aB e nessun’altra forza,che cosa resta costante e com’è la traiettoria non relativistica?|Modulo della velocità eK costanti;traiettoria circolare conr=mv/(|q|B).
''')
D('U6-07','''
CampoB parallelo al piano di una superficie:qual è il flusso uniforme attraverso essa?|Zero,perchéB è perpendicolare alla normale e cos90°=0.
Perché una bobina ferma in campo uniforme costante non ha necessariamente fem indotta?|Il flusso concatenato non varia nel tempo;il suo valore non nullo non basta.
Una bobina20spire vede per spiraΔΦ=0,003Wb in0,1s. Quale modulo della fem media?|0,6V.
Un flusso uscente dal foglio cresce. Quale verso deve avere il campo indotto e la corrente vista frontalmente?|Campo entrante e corrente oraria,per opporsi all’aumento del flusso.
''')
D('U7-01','''
In un’ondaEM piana nel vuoto,E eB sono paralleli fra loro?|No:sono perpendicolari fra loro e alla direzione di propagazione.
Se la frequenza di un’ondaEM nel vuoto triplica,come cambiaλ?|Si riduce a1/3,poichéc=λf.
La velocità della luce in un mezzo con indice2 è quale frazione dic nel modello indicato?|c/2.
Raddoppiare l’ampiezza del campo elettrico in un’ondaEM cambia necessariamente la frequenza?|No:sono parametri distinti.
Nello stesso mezzo lineare a frequenza fissata,triplicare l’ampiezza comporta quale intensità?|Nove volte l’intensità.
''')
D('U7-02','''
Fra onde radio e luce visibile,quali hanno frequenza minore nel vuoto?|Le onde radio.
Le microonde si collocano tra radio e quale altra regione a frequenze crescenti?|Infrarosso.
Fra infrarosso e ultravioletto quale regione si trova?|Visibile.
Nel visibile,il violetto haλ maggiore o minore del rosso nel vuoto?|Minore.
L’ultravioletto ha frequenze maggiori o minori del visibile?|Maggiori nel consueto ordinamento spettrale.
Fra raggiX e microonde,quali hanno fotoni più energetici nel consueto spettro?|RaggiX,per frequenza maggiore.
L’emissioneγ modifica necessariamente il numero di protoni del nucleo?|No:è una transizione energetica senza cambiamento diZ oA.
Se la frequenza aumenta in vuoto,cosa accade aλ? Elenca l’ordine delle regioni a frequenza crescente.|λ diminuisce:radio,microonde,infrarosso,visibile,ultravioletto,X,gamma,con confini convenzionali e possibili sovrapposizioniX/γ.
''')
D('U7-03','''
Un fotone rappresenta un quanto di quale grandezza legata alla radiazione?|Energia scambiata dalla radiazione,conE=hf;non una quantità di carica elettrica.
Se la frequenza passa daf a4f,come varia l’energia per fotone?|Quadruplica,daE=hf.
''')
D('U7-04','''
PerLambert-Beer conμ>0,come varia l’intensità al crescere del cammino in un mezzo omogeneo?|Decresce esponenzialmente:I=I0exp(−μx).
Quale unità deve avereμ se x è in cm?|cm^-1,cosìμx è adimensionale.
Due strati della stessa sostanza hanno spessori2cm e3cm. Quale cammino totale e come si combinano le trasmissioni?|5cm;le trasmissioni si moltiplicano.
Un campione trasmette20% della luce incidente. Quale rapportoI/I0 e quale attenuazione percentuale?|0,2;attenuazione80% nel modello senza altri canali separati.
''')
D('U7-05','''
Due isotopi del medesimo elemento hanno quale numero uguale e quale diverso?|Uguale numero di protoniZ;diverso numero di neutroni,quindi diverso numero di massa.
Un campione registra in media300decadimenti/s. Quale attività?|300Bq;non una dose assorbita.
Nella leggeN=N0exp(−λt),quali unità haλ e quale segno fisico?|s^-1 se t in s;λ>0 per decadimento spontaneo del modello.
Campione iniziale640Bq,T1/2=3h. Quale attività dopo12h?|40Bq,dopo4emivite.
Indica le variazioni diA eZ perα,β− eγ.|α:A−4,Z−2;β−:Ainvariata,Z+1;γ:AeZinvariati.
Un nucleo conA=40,Z=19 subisceβ+. QualiA eZ finali?|A=40,Z=18,con gli altri prodotti del decadimento.
''')
D('U7-06','''
Una soglia di ionizzazione è identica per tutte le specie atomiche?|No:dipende dal sistema e dallo stato considerato.
Un fotone da11eV incontra soglia8eV:è energeticamente sufficiente nel modello a singolo fotone? Uno da6eV?|11eVsì,6eVno;essere sopra soglia non implica assorbimento certo.
Indica esempi usuali diEM non ionizzanti e ionizzanti per singolo fotone.|Radio,microonde,infrarosso non ionizzanti;raggiX eγ tipicamente ionizzanti,con soglia del sistema esplicita.
Un fascio raddoppia intensità a frequenza fissa. Cambia l’energia del singolo fotone o il flusso energetico?|Cambia il flusso energetico;E=hf del singolo fotone resta uguale.
''')
D('U7-07','''
Un raggio arriva a40° dalla normale e si riflette specularmente. Quale angolo riflesso dalla normale?|40°.
Passando da indice1 a indice1,3,un raggio obliquo si avvicina o allontana dalla normale?|Si avvicina,nel regime trasmesso usuale.
Un mezzo ha velocitàc/1,25. Qual è l’indice?|1,25,adimensionale.
Da n1=1,n2=2,sinθ1=0,6. Quanto vale sinθ2?|0,3 daSnell.
Lente convergente sottile:f=12cm,p=24cm. Quali q e ingrandimento?|q=24cm,m=−1;immagine reale e capovolta.
Una lente convergente ha oggetto reale dentro il fuoco. Quale natura e orientazione dell’immagine nel modello paraxiale?|Virtuale,diritta e ingrandita;per p=f l’immagine non è a distanza finita.
''')

def main():
    baseline=json.loads((ROOT/'baseline.json').read_text())
    items=[]
    for family in baseline['families']:
        rows=DATA[family['id']]
        if len(rows)!=len(family['subtargets']):
            raise ValueError((family['id'],len(rows),len(family['subtargets'])))
        for target,qa in zip(family['subtargets'],rows):
            items.append({'id':'final-'+target['id'],'objectiveId':target['id'],'familyId':family['id'],'courseId':family['pathId'],
              'targetLabel':target['label'],'sourcePages':family['sourcePages'],**qa,
              'feedback':qa['answer'],'hint':'Identifica sistema, modello, unità e quantità mantenute costanti prima di rispondere.',
              'assessmentType':'original_short_answer_review_item','scientificStatus':'AI_CHECKED','editorialStatus':'DRAFT','humanApproval':False,
              'validationLimit':'No learner calibration or human editorial signature. Mapping coverage is structural, not evidence of mastery.'})
    dump('content/final-assessment-200.json',{'items':items,'count':len(items),'scope':'All 200 declared subtargets have an explicit original final prompt; not copied worked examples.','humanApproval':False,'runtimeIntegrated':False})
    print(len(items),'atomic assessment items authored')

if __name__=='__main__':main()
