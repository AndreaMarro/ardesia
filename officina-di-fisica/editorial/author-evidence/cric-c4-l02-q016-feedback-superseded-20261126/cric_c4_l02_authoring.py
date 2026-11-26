"""Ten distinct original Cric electric questions; author edition, not approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C4.json"
SOURCE_IDS=['C4-Q011', 'C4-Q012', 'C4-Q013', 'C4-Q014', 'C4-Q015', 'C4-Q016', 'C4-Q017', 'C4-Q018', 'C4-Q019', 'C4-Q020']
TASKS=[('Cambiare soltanto la carica di prova',
  'Nello stesso punto di un campo esterno prescritto sostituisci una piccola carica di prova +q con −q, con q>0 e '
  'senza alterare le sorgenti. Il campo è non nullo. Quale cambiamento si osserva?',
  ['Il campo resta uguale, la forza cambia verso mantenendo il modulo',
   'Si inverte il campo e resta uguale la forza',
   'Campo e forza si annullano entrambi',
   'La forza resta nello stesso verso',
   'Il campo raddoppia'],
  'Il campo è determinato dalle sorgenti mantenute fisse, non dal segno della prova. La forza sulla prova vale '
  'qE. Sostituire +q con −q cambia il segno del vettore forza ma non il suo modulo, perché il valore assoluto di '
  'q è lo stesso. L’ipotesi di perturbazione trascurabile permette di confrontare lo stesso campo.',
  '\\mathbf F_-=-\\mathbf F_+',
  'Invertire la carica di prova non inverte automaticamente la distribuzione sorgente. Campo non nullo e carica '
  'non nulla escludono forza nulla. Mantenere il verso della forza ignorerebbe il segno del prodotto qE.',
  'Separa ciò che appartiene alle sorgenti dalla forza sulla particolare prova.'),
 ('Campo da una forza misurata',
  'Una carica di prova +4,0 nC subisce una forza elettrica di 1,2 μN verso est. La prova perturba in modo '
  'trascurabile le sorgenti. Trova il modulo del campo in N/C.',
  300,
  'Con una prova positiva il campo ha lo stesso verso della forza, cioè est. Per il modulo divido F per q: '
  '(1,2×10⁻⁶)/(4,0×10⁻⁹)=0,3×10³=300 N/C. Il rapporto newton/coulomb è l’unità del campo. La forza misurata non è '
  'già il campo: occorre riferirla alla carica della prova.',
  'E=F/q\\qquad E=300\\,\\mathrm{N/C}',
  '0,3 N/C dimenticherebbe il rapporto mille fra i prefissi micro e nano. 4 800 N/C non ricostruirebbe la forza '
  'misurata: moltiplicato per 4 nC darebbe 19,2 μN. Il controllo corretto è (300 N/C)(4 nC)=1,2 μN.',
  'Dividi la forza per la carica dopo aver esplicitato i due prefissi.'),
 ('La direzione locale del campo',
  'In un punto dove il campo elettrico è diverso da zero, la direzione del campo è quella della … alla linea di '
  'campo. Quale parola completa la frase?',
  ['Circonferenza centrata nella prova',
   'Forza gravitazionale',
   'Tangente',
   'Normale',
   'Secante fra due sorgenti qualsiasi'],
  'Una linea di campo è costruita in modo che la sua tangente locale sia parallela al campo in ogni punto '
  'regolare. La freccia sulla linea ne indica anche il verso, definito dalla forza su una prova positiva. Non '
  'occorre che la linea sia retta: conta la tangente nel punto scelto.',
  '\\mathbf E\\parallel\\mathbf t',
  'La normale è perpendicolare alla tangente e non definisce il campo lungo la linea. Una secante fra punti '
  'lontani non sostituisce una direzione locale. La gravità è un’interazione distinta.',
  'Pensa alla direzione che segue una curva proprio nel punto in cui la osservi.'),
 ('Annullare due campi tra cariche positive',
  'Due cariche puntiformi +q e +4q, con q>0, sono ferme nel vuoto a distanza 30 cm. Tra loro, a quanti cm dalla '
  'carica +q è nullo il campo?',
  10,
  'Tra le cariche positive i contributi hanno versi opposti. Per annullare la somma vettoriale devono avere '
  'uguale modulo: q/d₁²=4q/d₂². Le distanze sono positive, quindi d₂=2d₁. Con d₁+d₂=30 cm ottengo 3d₁=30 cm e '
  'd₁=10 cm, mentre d₂=20 cm. Il punto è più vicino alla sorgente più debole.',
  '\\frac{q}{d_1^2}=\\frac{4q}{d_2^2}\\qquad d_2=2d_1\\qquad d_1=10\\,\\mathrm{cm}',
  '15 cm renderebbe uguali le distanze ma non i campi: il contributo di +4q sarebbe quadruplo. 20 cm è la '
  'distanza dalla sorgente +4q, non quella richiesta. Il rapporto delle distanze è due, non quattro, perché i '
  'campi dipendono dai quadrati.',
  'Prima uguaglia i moduli, poi usa la somma delle due distanze.'),
 ('Due direzioni diverse nello stesso punto',
  'Un disegno mostra due linee di campo elettrico che si incrociano con tangenti differenti in un punto regolare '
  'in cui E è diverso da zero. Qual è il problema?',
  ['L’incrocio dimostra che la carica di prova è nulla',
   'Le due linee generano necessariamente due campi separati che non si sommano',
   'L’incrocio rende la forza sempre tangente a entrambe le curve',
   'Non c’è alcun problema: ogni campo può avere due direzioni locali',
   'Il disegno attribuisce due direzioni diverse a un unico campo nello stesso punto'],
  'Il campo risultante in un punto è un solo vettore. Se è non nullo, ha una direzione definita. Due tangenti '
  'differenti allo stesso punto assegnerebbero due direzioni incompatibili, quindi quel disegno non rappresenta '
  'correttamente le linee del campo risultante. Le condizioni di punto regolare e campo non nullo evitano i casi '
  'singolari esclusi dalla domanda.',
  '\\mathbf E(P)\\ne\\mathbf0',
  'Le linee non sono sorgenti materiali di campi separati. La carica della prova non è determinata dall’incrocio '
  'disegnato. Sommare i contributi delle sorgenti produce un unico risultante, non due direzioni alternative '
  'nello stesso punto.',
  'Ricorda che la tangente locale rappresenta la direzione di un solo vettore risultante.'),
 ('Deviazione mentre il moto orizzontale è uniforme',
  'Una particella entra in una regione di campo elettrico uniforme con v_x=4 m/s e v_y=0. Il campo produce a_y=6 '
  'm/s² e a_x=0. Agisce solo la forza elettrica e il percorso considerato resta nella regione, senza urti. Dopo '
  '0,80 m orizzontali, di quanti cm si è spostata verso y positivo?',
  12,
  'Il moto orizzontale fornisce il tempo: t=0,80/4=0,20 s. Lungo y la velocità iniziale è nulla e l’accelerazione '
  'è costante, quindi Δy=(1/2)·6·(0,20)² m=0,12 m. Moltiplico per 100 cm/m e ottengo 12 cm verso y positivo. I '
  'due moti condividono lo stesso tempo, ma hanno leggi diverse.',
  't=\\Delta x/v_x\\qquad \\Delta y=\\tfrac12a_yt^2\\qquad \\Delta y=12\\,\\mathrm{cm}',
  '24 cm omette il fattore un mezzo. 60 cm userebbe a_y t al posto di a_y t²/2 e confonderebbe una velocità con '
  'uno spostamento. Non si accelera il moto orizzontale, perché a_x è assegnata nulla.',
  'Trova il tempo dal tratto orizzontale, poi inseriscilo nella legge verticale.'),
 ('Linee che entrano nella sorgente',
  'Le linee di un campo radiale sono orientate verso un’unica carica puntiforme al centro. Con quale aggettivo si '
  'descrive il segno della sorgente?',
  ['Priva di segno perché il campo è vettoriale',
   'Negativa',
   'Positiva',
   'Necessariamente nulla',
   'Sempre positiva se la prova è negativa'],
  'Le frecce delle linee seguono il verso del campo, definito dalla forza su una prova positiva. Una prova '
  'positiva sarebbe attratta dalla sorgente centrale: la sorgente è quindi negativa. Le linee entrano nelle '
  'cariche negative ed escono da quelle positive.',
  'q_{\\rm sorgente}<0',
  'Una sorgente positiva produrrebbe linee uscenti. Una carica nulla non genera il campo radiale non nullo '
  'descritto. Il segno della sorgente non viene cambiato scegliendo una prova negativa.',
  'Immagina quale sorgente attrarrebbe una piccola prova positiva.'),
 ('Somma di due campi ortogonali',
  'In un punto una sorgente dà un campo di 300 N/C verso est e un’altra di 400 N/C verso nord. I contributi sono '
  'perpendicolari. Calcola il modulo del campo risultante in N/C.',
  500,
  'Scelgo est e nord come assi ortogonali. Le componenti del risultante sono 300 e 400 N/C: non si sommano come '
  'moduli collineari. Il triangolo ha i rapporti 3–4–5, quindi il modulo è 500 N/C. La stessa verifica con i '
  'quadrati dà 300²+400²=250 000 (N/C)² e la radice positiva è 500 N/C.',
  'E=\\sqrt{E_x^2+E_y^2}\\qquad E=500\\,\\mathrm{N/C}',
  '700 N/C sarebbe la somma dei moduli per campi concordi lungo la stessa retta. 100 N/C sarebbe la differenza '
  'dei moduli per campi opposti collineari. Qui entrambe le componenti non nulle devono contribuire al quadrato '
  'del modulo.',
  'Riconosci il triangolo rettangolo con cateti nel rapporto 3 a 4.'),
 ('Rilasciare una carica negativa',
  'Una particella di carica negativa e massa positiva viene lasciata da ferma in un campo elettrico uniforme non '
  'nullo verso destra. Non agiscono altre forze. Che cosa succede subito dopo il rilascio?',
  ['Accelera verso destra',
   'Ha forza nulla perché la carica è negativa',
   'Si muove subito a velocità costante senza accelerare',
   'Accelera e inizia a muoversi verso sinistra',
   'Resta ferma perché la velocità iniziale è nulla'],
  'La forza elettrica è qE: con q negativo ha verso opposto al campo. La massa è positiva, quindi anche '
  'l’accelerazione punta a sinistra. Al solo istante di rilascio la velocità è ancora zero; subito dopo diventa '
  'diretta a sinistra. Velocità iniziale nulla non significa forza o accelerazione nulla.',
  '\\mathbf a=\\frac{q}{m}\\mathbf E',
  'Il verso del campo coincide con la forza soltanto per una prova positiva. Una carica negativa non annulla il '
  'prodotto qE. La velocità può iniziare a cambiare a partire da zero sotto una forza non nulla.',
  'Determina prima il verso della forza dal segno della carica.'),
 ('L’istante in cui la velocità cambia segno',
  'Una carica parte verso destra a 6 m/s in un campo uniforme che produce accelerazione costante di 3 m/s² verso '
  'sinistra. Il campo persiste per l’intero moto considerato e non agiscono altre forze. Dopo quanti secondi '
  'raggiunge l’istante di inversione?',
  2,
  'Scelgo destra positiva: v₀=+6 m/s e a=−3 m/s². La velocità è v(t)=6−3t nelle unità SI. All’istante di '
  'inversione si annulla: 6−3t=0, da cui t=2 s. Dopo quell’istante l’accelerazione rimane verso sinistra e la '
  'velocità diventa negativa, quindi si tratta davvero di un’inversione.',
  'v=v_0+at\\qquad t=-v_0/a\\qquad t=2\\,\\mathrm s',
  'A 1 s la velocità è ancora +3 m/s; a 3 s è già −3 m/s. Dividere l’accelerazione per la velocità iniziale '
  'darebbe l’inverso di un tempo. Non si cerca quando si annulla l’accelerazione, che qui è costante e non nulla.',
  'Poni uguale a zero la velocità con segno, non l’accelerazione.')]
CHOICES={1: 0, 3: 2, 5: 4, 7: 1, 9: 3}
UNITS={2: 'N/C', 4: 'cm', 6: 'cm', 8: 'N/C', 10: 's'}
FIGURES={2: 'La prova positiva ha q=4,0 nC e subisce F=1,2 μN verso est; il campo corrispondente è 300 N/C verso est. Forza e campo sono grandezze diverse e non condividono un’unità.', 4: 'Fra +q e +4q, il punto P è a 10 cm dalla prima e 20 cm dalla seconda. Le due frecce in P rappresentano campi uguali e opposti, alla stessa scala entro il pannello.', 8: 'I campi di 300 N/C verso est e 400 N/C verso nord sono i cateti del triangolo; la diagonale rappresenta il risultante di 500 N/C. Tutte e tre le frecce del pannello hanno la stessa scala.'}
def assemble(repo,source_ref):
 categories={1: 'concetto', 2: 'unità', 3: 'concetto', 4: 'modello', 5: 'concetto', 6: 'modello', 7: 'concetto', 8: 'modello', 9: 'concetto', 10: 'modello'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C4-L02"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c4-l02",TASKS,CHOICES,UNITS,"cric-c4-l02-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C4",skill="C4-L02",section="Elettricità e magnetismo",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c4-l02")
