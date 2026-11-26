"""Ten distinct original Cric wave questions; author edition, no own approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C5.json"
SOURCE_IDS=['C5-Q031', 'C5-Q032', 'C5-Q033', 'C5-Q034', 'C5-Q035', 'C5-Q036', 'C5-Q037', 'C5-Q038', 'C5-Q039', 'C5-Q040']
TASKS=[('Energia divisa per tempo e area',
  'Un fascio uniforme e costante attraversa perpendicolarmente un sensore di area 2,0 cm². In 3,0 s trasferisce '
  '12 mJ. Qual è l’intensità in watt al metro quadrato?',
  20,
  'Prima divido l’energia per il tempo: 12 mJ in 3 s sono 4 mW, cioè 0,004 W. L’area di 2 cm² è 2×10⁻⁴ m², perché '
  'la conversione delle lunghezze va elevata al quadrato. Divido 0,004 W per quest’area e ottengo 20 W/m². '
  'L’intensità non è la sola potenza raccolta.',
  'P=\\frac{E}{t}\\qquad P=4\\,\\mathrm{mW}\\qquad I=\\frac{P}{S}\\qquad I=20\\,\\mathrm{W/m^2}',
  '0,002 W/m² userebbe il numero 2 come se l’area fosse 2 m². 2 W/m² corrisponderebbe a un’area dieci volte '
  'maggiore. Il valore 4 copia il coefficiente della potenza in milliwatt e non completa la divisione per l’area.',
  'Converti separatamente millijoule e centimetri quadrati.'),
 ('Due cambiamenti nello stesso rapporto',
  'Una sorgente puntiforme isotropa emette potenza positiva in un mezzo senza assorbimento. La potenza raddoppia '
  'e il ricevitore passa da r>0 a 2r. Qual è il rapporto I_f/I_i?',
  ['8', '1/2', '2', '1/4', '1'],
  'L’intensità è P/(4πr²). Nel rapporto delle due preparazioni il numeratore fornisce un fattore due; raddoppiare '
  'il raggio moltiplica il denominatore per quattro. Il risultato è 2/4=1/2. L’intensità finale è minore pur '
  'essendo aumentata la potenza della sorgente.',
  '\\frac{I_f}{I_i}=\\frac{P_f}{P_i}\\left(\\frac{r_i}{r_f}\\right)^2\\qquad \\frac{I_f}{I_i}=\\frac12',
  '2 ignora il raggio; 1/4 ignora il raddoppio della potenza. Il rapporto 1 usa una dipendenza lineare anziché '
  'quadratica dalla distanza. 8 moltiplica per quattro invece di dividere.',
  'Separa il cambiamento della potenza da quello dell’area della sfera.'),
 ('Ricavare la distanza dalla diminuzione',
  'Una sorgente puntiforme isotropa ha potenza costante positiva e il mezzo non assorbe. A 0,80 m l’intensità è '
  'nove volte quella nel punto B. A quale distanza dalla sorgente si trova B?',
  ['4/15 m', '0,08 m', '2,4 m', '7,2 m', '0,80 m'],
  'A parità di potenza I_A/I_B=(r_B/r_A)². Il rapporto delle intensità è nove, quindi il rapporto positivo delle '
  'distanze è tre. Moltiplico 0,80 m per tre e trovo 2,4 m. B riceve meno intensità e deve stare più lontano. La '
  'radice negativa non è una distanza dalla sorgente.',
  '\\frac{r_B}{r_A}=\\sqrt9\\qquad r_B=3r_A\\qquad r_B=2{,}4\\,\\mathrm m',
  '7,2 m moltiplica la distanza per nove senza estrarre la radice e darebbe un rapporto di intensità 81. 4/15 m '
  'divide per tre e rende B più vicino. 0,80 m darebbe intensità uguali.',
  'Per passare dal rapporto delle intensità a quello delle distanze serve una radice.'),
 ('Allargare il sensore nello stesso campo',
  'Un campo d’onda uniforme e costante ha intensità positiva. Una sonda perpendicolare al fascio raddoppia la '
  'propria area, restando nel medesimo campo e senza perturbarlo. Come cambiano intensità locale e potenza '
  'attraversante?',
  ['Entrambe raddoppiano',
   'Entrambe si dimezzano',
   'La potenza resta uguale perché la sorgente è la stessa',
   'L’intensità resta uguale e la potenza raddoppia',
   'L’intensità raddoppia e la potenza resta uguale'],
  'Ogni metro quadrato riceve la stessa potenza di prima, perché il campo locale non è cambiato. La sonda '
  'raccoglie però due volte quell’area. Da P=IS segue che la potenza raddoppia mentre I resta invariata. È come '
  'affiancare due sonde uguali nel medesimo campo uniforme.',
  'I_f=I_i\\qquad \\frac{P_f}{P_i}=\\frac{S_f}{S_i}=2',
  'La potenza della sorgente non coincide con quella intercettata da una singola sonda. Cambiare l’area del '
  'ricevitore non modifica per definizione l’intensità del campo assegnato e non la raddoppia.',
  'Pensa alla potenza che attraversa due finestre uguali affiancate.'),
 ('Leggere watt al metro quadrato',
  'L’intensità espressa in W/m² descrive energia per unità di area e per unità di quale grandezza?',
  ['Massa', 'Lunghezza d’onda', 'Frequenza', 'Temperatura', 'Tempo'],
  'Un watt equivale a un joule al secondo. Dividere ancora per un metro quadrato dà J/(s·m²): energia che '
  'attraversa un’area per unità di tempo. L’area e il tempo svolgono ruoli diversi e devono entrambi comparire '
  'per ricostruire un’energia trasferita.',
  '1\\,\\mathrm{W/m^2}=1\\,\\mathrm{J/(s\\,m^2)}',
  'Massa e temperatura non compaiono in questa unità. Dividere per una frequenza significherebbe moltiplicare per '
  'un tempo, non ottenere la potenza per area. La lunghezza d’onda non sostituisce una durata.',
  'Riscrivi il watt come joule al secondo.'),
 ('Un fascio che non si allarga',
  'Un fascio ideale collimato mantiene potenza positiva e sezione costanti lungo il percorso, senza assorbimento '
  'né altre perdite. Che cosa accade all’intensità media su ogni sezione perpendicolare uguale?',
  ['Rimane costante',
   'Diminuisce necessariamente come 1/r²',
   'Si dimezza ogni metro',
   'Cresce linearmente con la distanza',
   'Diventa nulla dopo una lunghezza d’onda'],
  'L’intensità media è la potenza divisa per l’area della sezione. Nel modello entrambe restano costanti, quindi '
  'anche il rapporto resta costante. La legge 1/r² descrive invece una propagazione che distribuisce la stessa '
  'potenza su sfere di area crescente. Non basta allontanarsi per imporre quella geometria a un fascio collimato.',
  'I=\\frac{P}{S}\\qquad P,S=\\text{costanti}',
  'Un dimezzamento per metro richiederebbe una legge di perdita non assegnata. La crescita o l’annullamento '
  'contraddicono la conservazione di potenza e sezione. La distanza da sola non determina l’area attraversata dal '
  'fascio.',
  'Individua la superficie su cui si distribuisce la potenza, senza sostituirla con una sfera.'),
 ('Una media comprende anche le pause',
  'Una sorgente emette 4,0 W per 2,0 ms in ogni periodo di 10 ms; nel resto del periodo emette potenza nulla. '
  'Qual è la potenza media sul periodo intero?',
  ['0,0080 W', '0,80 W', '4,0 W', '2,0 W', '20 W'],
  'L’energia di un impulso è 4 W×0,002 s=0,008 J. Divido questa energia per l’intero periodo 0,010 s e ottengo '
  '0,80 W. Lo stesso calcolo è 4 W per la frazione attiva 2/10=1/5. La media è inferiore al valore acceso perché '
  'il tempo di pausa entra nel denominatore.',
  'E_{\\rm impulso}=8\\,\\mathrm{mJ}\\qquad \\overline P=\\frac{E_{\\rm impulso}}{T}\\qquad \\overline '
  'P=\\frac45\\,\\mathrm W',
  '4 W è la potenza durante l’impulso, non la media sul periodo. 20 W inverte la frazione attiva. 0,0080 W copia '
  'il coefficiente dell’energia in joule senza dividerlo per 0,010 s.',
  'Calcola energia per impulso e dividila per il periodo, comprese le pause.'),
 ('La densità lineare resta nel rapporto',
  'Due corde ideali, alle rispettive tensioni, hanno la stessa velocità di propagazione v>0. Piccole onde '
  'sinusoidali hanno uguali ampiezze A>0 e frequenze f>0. La densità lineare di B è tre volte quella di A. Qual è '
  'il rapporto delle potenze medie P_B/P_A?',
  3,
  'Nel modello di piccole pendenze vale P media=μvω²A²/2. Frequenza uguale significa pulsazione uguale; anche '
  'velocità, ampiezza e fattore 1/2 sono comuni e si semplificano. Resta μ_B/μ_A=3. Le tensioni possono essere '
  'diverse: per conservare v²=F_tensione/μ quando μ triplica deve triplicare anche la tensione.',
  '\\overline P=\\frac12\\mu v\\omega^2A^2\\qquad \\frac{\\overline P_B}{\\overline P_A}=3',
  'Nove eleverebbe al quadrato anche μ, che compare alla prima potenza. Un terzo invertirebbe il rapporto. '
  'Imporre contemporaneamente tensioni uguali e velocità uguali sarebbe incompatibile con queste densità diverse '
  'nel modello della corda ideale.',
  'Cancella soltanto i fattori che il prompt mantiene uguali.'),
 ('Proiettare l’area del sensore',
  'Un’onda piana uniforme di intensità costante 5,0 W/m² attraversa un sensore piano di area 4,0 m². La '
  'propagazione forma 60° con la normale al sensore. Quale potenza attraversa il sensore in watt?',
  10,
  'La superficie efficace perpendicolare al fascio vale S cosθ. Il coseno di 60° è 1/2: dei 4 m² geometrici ne '
  'risultano efficaci 2 m². Moltiplico per 5 W/m² e ottengo 10 W. L’angolo è dalla normale; usando l’angolo dal '
  'piano occorrerebbe invece il seno complementare.',
  'S_{\\rm eff}=S\\cos60^\\circ\\qquad S_{\\rm eff}=2\\,\\mathrm{m^2}\\qquad P=10\\,\\mathrm W',
  '20 W trascura l’inclinazione e corrisponde a raggio lungo la normale. Zero corrisponderebbe a propagazione '
  'tangente al piano. Un’area proiettata maggiore di 4 m² non sarebbe compatibile con questa proiezione.',
  'Guarda il sensore dalla direzione del fascio e usa l’angolo dalla normale.'),
 ('Potenza su superfici chiuse',
  'Una sorgente emette in regime stazionario e si trova al centro di due sfere concentriche. Fra le due superfici '
  'non ci sono assorbimenti, altre sorgenti o accumulo di energia. Come si confronta la potenza totale uscente '
  'attraverso le due sfere?',
  ['È maggiore sulla sfera interna',
   'È maggiore sulla sfera esterna',
   'È zero perché le superfici sono chiuse',
   'È inversamente proporzionale al solo raggio',
   'È la stessa'],
  'In ogni secondo l’energia uscita dalla sfera interna deve attraversare anche quella esterna, perché nel guscio '
  'non viene assorbita né accumulata. La potenza totale è quindi la stessa. Nel caso isotropo l’intensità '
  'diminuisce come 1/r², ma l’area 4πr² compensa questa diminuzione. Non si confronta la sola intensità in un '
  'punto.',
  'P_{\\rm esterna}=P_{\\rm interna}',
  'Una superficie chiusa non impedisce alle onde di attraversarla. La minore intensità locale sulla sfera più '
  'grande non significa minore potenza integrata sull’intera superficie. L’assenza di accumulo è una condizione '
  'del bilancio stazionario.',
  'Considera tutta l’energia che attraversa l’intero guscio in un secondo.')]
CHOICES={2: 1, 3: 2, 4: 3, 5: 4, 6: 0, 7: 1, 10: 4}
UNITS={1: 'W/m²', 8: '1', 9: 'W'}
FIGURES={1: 'Il primo pannello mostra 12 mJ trasferiti in 3 s con potenza costante di 4 mW. La stessa consegna assegna area perpendicolare di 2 cm², da cui I=20 W/m².', 2: 'Le barre centrali confrontano I_i e I_f=I_i/2 sulla stessa scala normalizzata. Il raddoppio della potenza è compensato solo in parte dall’area sferica quadruplicata.', 9: 'L’ultimo pannello è una sezione laterale a profondità uguale: la lunghezza proiettata e quindi l’area efficace sono metà. Il sensore geometrico misura 4 m² e la proiezione 2 m². Il disegno dell’angolo fra raggio e normale è distinto dalla scala dei valori delle aree.'}
def assemble(repo,source_ref):
 categories={1: 'unità', 2: 'algebra', 3: 'algebra', 4: 'concetto', 5: 'unità', 6: 'modello', 7: 'testo', 8: 'modello', 9: 'modello', 10: 'concetto'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C5-L04"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c5-l04",TASKS,CHOICES,UNITS,"cric-c5-l04-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C5",skill="C5-L04",section="Onde e oscillazioni",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c5-l04")
