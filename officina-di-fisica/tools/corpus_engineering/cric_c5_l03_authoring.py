"""Ten distinct original Cric wave questions; author edition, no own approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C5.json"
SOURCE_IDS=['C5-Q021', 'C5-Q022', 'C5-Q023', 'C5-Q024', 'C5-Q025', 'C5-Q026', 'C5-Q027', 'C5-Q028', 'C5-Q029', 'C5-Q030']
TASKS=[('Somma nello stesso punto',
  'Nel regime lineare di una corda due piccoli impulsi danno, nello stesso punto e istante, spostamenti +1,2 mm e '
  '+0,8 mm rispetto allo stesso zero. Quanto vale lo spostamento risultante in millimetri?',
  2,
  'La sovrapposizione somma le coordinate con il segno, nello stesso punto e istante. Entrambe sono positive: '
  '1,2+0,8=2,0 mm. Il risultato non è una media e non rappresenta la somma delle energie. Se un contributo avesse '
  'segno opposto, la sua ordinata andrebbe sottratta algebricamente.',
  'y=y_1+y_2\\qquad y=+2\\,\\mathrm{mm}',
  '1 mm è la media, non la somma. 0,4 mm sottrarrebbe contributi che qui hanno lo stesso segno. Il quadrato delle '
  'ampiezze riguarda altri bilanci e non dà l’ordinata istantanea richiesta.',
  'Allinea origine, punto e istante prima di sommare.'),
 ('Rivedere gli impulsi dopo l’incontro',
  'Due impulsi identici di segno opposto viaggiano in versi opposti su una corda ideale lineare. Si sovrappongono '
  'completamente e poi si incrociano, senza incontrare estremità. Che cosa accade dopo?',
  ['L’energia totale viene annullata',
   'Si separano e continuano nei rispettivi versi',
   'Scompaiono per sempre',
   'La corda resta definitivamente ferma ovunque',
   'Rimane un unico impulso fermo'],
  'La soluzione totale è la somma dei due profili che continuano a propagarsi. Nell’istante di sovrapposizione le '
  'ordinate opposte si cancellano, ma questo non elimina le due soluzioni né le velocità locali del mezzo. Dopo '
  'l’incrocio tornano distinguibili i due impulsi. La conservazione dell’energia riguarda anche l’energia '
  'cinetica della corda.',
  'y(x,t)=y_1(x,t)+y_2(x,t)',
  'Spostamento nullo in un istante non significa velocità nulla o energia totale nulla. Un impulso fermo o la '
  'scomparsa permanente non sono le soluzioni del modello lineare senza dissipazione.',
  'Distingui l’istante della cancellazione dagli istanti dopo l’incrocio.'),
 ('La parte non cancellata',
  'Due sinusoidi della stessa frequenza e della stessa direzione di oscillazione arrivano in P con ampiezze 5 mm '
  'e 3 mm, sempre in opposizione di fase. Nel regime lineare qual è l’ampiezza risultante in millimetri?',
  2,
  'Quando la prima oscillazione vale 5 cosφ mm, la seconda vale −3 cosφ mm. La loro somma è 2 cosφ mm. '
  'L’ampiezza, non negativa, è quindi 2 mm. La cancellazione completa richiederebbe anche ampiezze uguali, oltre '
  'all’opposizione di fase.',
  'y=(5-3)\\cos\\varphi\\,\\mathrm{mm}\\qquad A_{\\rm tot}=2\\,\\mathrm{mm}',
  '8 mm somma i moduli come per onde in fase. Zero presume ampiezze uguali che qui non lo sono. −2 mm non è '
  'un’ampiezza; il segno di uno spostamento istantaneo non sostituisce il suo massimo modulo.',
  'Scrivi le due sinusoidi con lo stesso coseno e segni opposti.'),
 ('Cammini uguali e fase iniziale opposta',
  'Due sorgenti coerenti emettono sinusoidi della stessa frequenza in opposizione di fase. In un mezzo omogeneo '
  'il punto P è equidistante dalle due sorgenti e riceve contributi di uguale ampiezza e stessa polarizzazione. '
  'Come si chiama l’interferenza in P?',
  ['Incoerente per la sola distanza',
   'Necessariamente assente',
   'Costruttiva perché i cammini sono uguali',
   'Distruttiva completa',
   'Costruttiva massima'],
  'I cammini uguali aggiungono lo stesso ritardo di propagazione, quindi non modificano la differenza iniziale di '
  'π radianti. I due contributi arrivano ancora opposti e, avendo uguali ampiezze, si cancellano. L’interferenza '
  'è distruttiva completa. Cammini uguali da soli non impongono un massimo se le sorgenti partono con fasi '
  'diverse.',
  '\\Delta\\varphi_P=\\pi\\qquad A_{\\rm tot}=0',
  'Un massimo con cammini uguali richiederebbe sorgenti inizialmente in fase. Coerenza significa fase relativa '
  'stabile, non obbligatoriamente nulla. La cancellazione in P non significa che le sorgenti abbiano smesso di '
  'emettere.',
  'Conserva lo sfasamento iniziale quando aggiungi i due ritardi uguali.'),
 ('Il minimo aumento di cammino',
  'Due sorgenti coerenti in fase emettono alla stessa lunghezza d’onda λ>0. In P la differenza dei cammini è '
  '5λ/2. Quale minimo aumento positivo di uno soltanto dei cammini porta a un massimo? Scegli la distanza.',
  ['λ/4', 'λ', '5λ/2', '2λ', 'λ/2'],
  'La differenza iniziale è 2,5λ, un semi-intero. I massimi più vicini hanno differenza 2λ oppure 3λ. Aumentando '
  'il cammino lungo di λ/2 si arriva a 3λ; aumentando quello corto di λ/2 si scende a 2λ. Entrambe le scelte '
  'richiedono la stessa minima distanza positiva, λ/2.',
  '\\Delta s_i=\\frac52\\lambda\\qquad \\delta s_{\\min}=\\frac\\lambda2',
  'λ/4 lascia un quarto di ciclo oltre o prima di un massimo. Un aumento λ torna a un semi-intero e quindi a un '
  'minimo, per sorgenti in fase. Aumenti maggiori non sono il minimo positivo richiesto.',
  'Cerca gli interi più vicini al numero 5/2.'),
 ('Un minimo dipende dalla posizione',
  'Due sorgenti sonore coerenti restano attive e alimentano un campo lineare. Una sonda di pressione trova un '
  'punto sempre quieto, mentre poco più in là registra un segnale. Quale spiegazione è compatibile?',
  ['La fase relativa dei contributi cambia con il punto di misura',
   'La velocità di propagazione del suono è zero nel punto quieto',
   'Le sorgenti hanno entrambe frequenza nulla',
   'Una sorgente si spegne soltanto quando la sonda è nel minimo',
   'Ogni punto deve avere la stessa pressione perché le sorgenti sono coerenti'],
  'Le distanze dalle sorgenti dipendono dalla posizione. Possono quindi cambiare i ritardi relativi e la '
  'differenza di fase. Nel punto quieto le pressioni oscillanti hanno ampiezze e fasi adatte alla cancellazione; '
  'nel punto vicino la somma può essere non nulla. È un contrasto spaziale del campo, non una modifica della '
  'velocità del mezzo.',
  'p_{\\rm tot}=p_1+p_2',
  'Coerenza non significa uguale somma in ogni punto. Pressione oscillante nulla non richiede frequenza nulla '
  'delle sorgenti o velocità di propagazione zero. La sonda non deve spegnere una sorgente per osservare un '
  'minimo.',
  'Confronta la differenza dei due cammini nei due punti.'),
 ('Ampiezza doppia e intensità',
  'Due onde progressive coerenti identiche, della stessa frequenza e polarizzazione, si propagano nello stesso '
  'verso. In P sono in fase, con ampiezza A>0 ciascuna. Nelle stesse condizioni vale I=C A_tot² con C>0. Quanto '
  'vale l’intensità risultante rispetto a una sola onda?',
  ['Zero', 'Quattro volte', 'Due volte', 'Uguale', 'La metà'],
  'Prima sommo le ampiezze coerenti: A_tot=A+A=2A. Soltanto dopo applico la relazione quadratica con lo stesso '
  'coefficiente C. Il rapporto è (2A)²/A²=4. Non si tratta della somma incoerente di due intensità indipendenti; '
  'il termine d’interferenza è presente nelle condizioni assegnate.',
  'A_{\\rm tot}=2A\\qquad \\frac{I_{\\rm tot}}{I_1}=4',
  'Due volte sommerebbe le intensità senza il termine coerente. La metà e zero non ricostruiscono l’ampiezza 2A. '
  'La condizione di onde progressive nello stesso verso evita di confondere questo flusso con quello di due onde '
  'contropropaganti.',
  'Esegui la somma delle ampiezze prima di elevare al quadrato.'),
 ('Quando la relazione di fase non resta ferma',
  'Due sorgenti hanno fase relativa che varia casualmente con distribuzione uniforme su un giro durante il tempo di media. '
  'Perché non rimane una figura stabile di massimi e minimi d’interferenza?',
  ['Le sorgenti devono avere ampiezza nulla',
   'La media temporale rende uguali tutte le frequenze',
   'La condizione di rinforzo o cancellazione in un punto cambia nel tempo',
   'Le singole onde devono cessare di propagarsi',
   'La velocità delle onde diventa zero'],
  'Il termine incrociato della somma dipende dalla fase relativa. Se questa percorre casualmente il giro di fase, '
  'un punto non conserva la stessa condizione di rinforzo o cancellazione. La lunga media non mantiene le frange '
  'stabili di una fase relativa fissata. Le singole sorgenti possono continuare a emettere con ampiezza non '
  'nulla.',
  '\\langle\\cos\\Delta\\varphi\\rangle=0',
  'La perdita di una figura stabile non ferma la propagazione e non impone ampiezze nulle. Una media non modifica '
  'fisicamente tutte le frequenze. Un massimo coerente stabile richiede una relazione di fase stabile, non '
  'soltanto due sorgenti accese.',
  'Pensa al punto che passa nel tempo da due creste insieme a una cresta e una valle.'),
 ('Un cammino più lungo arriva dopo',
  'Due impulsi sono emessi simultaneamente e viaggiano nello stesso mezzo a 340 m/s. Uno percorre 1,02 m in più '
  'dell’altro. Di quanti millisecondi arriva dopo?',
  3,
  'Il tempo extra è la distanza extra divisa per la velocità comune. Scrivo 1,02 m come 102/100 m e divido per '
  '340 m/s: ottengo 3/1000 s. Moltiplicando per mille passo ai millisecondi: il ritardo è 3 ms. L’impulso del '
  'cammino maggiore arriva più tardi, quindi il ritardo richiesto è positivo.',
  '\\Delta t=\\frac{\\Delta s}{v}\\qquad \\Delta t=\\frac3{1000}\\,\\mathrm s\\qquad \\Delta t=3\\,\\mathrm{ms}',
  '0,003 ms conserva il coefficiente in secondi dopo aver cambiato solo il nome dell’unità. Moltiplicare distanza '
  'per velocità non produce un tempo. Un ritardo negativo invertirebbe quale dei due cammini è più lungo.',
  'Calcola prima in secondi, poi moltiplica il numero per mille.'),
 ('Due picchi lontani non si sommano da soli',
  'Nello stesso istante due impulsi su una corda lineare hanno ciascuno un picco di +4 mm, ma in posizioni '
  'diverse. Si può concludere che il massimo della somma sia necessariamente 8 mm in quell’istante?',
  ['Sì: basta sommare i due valori di picco dovunque siano',
   'Sì: l’unità millimetro rende coincidenti le posizioni',
   'No: la somma deve essere sempre nulla',
   'No: la somma non può mai superare 4 mm',
   'No: servono le ordinate dei due profili nello stesso punto'],
  'La sovrapposizione somma y₁(x,t) e y₂(x,t) con le stesse coordinate x e t. Due massimi separati non '
  'garantiscono un punto dove entrambi valgano 4 mm. Per esempio impulsi stretti completamente separati hanno '
  'massimo risultante di 4 mm, non 8 mm. Occorre conoscere come i due profili si sovrappongono.',
  'y_{\\rm tot}(x,t)=y_1(x,t)+y_2(x,t)',
  'La stessa unità non rende uguali le ascisse. La somma non è necessariamente zero e può superare 4 mm se vi è '
  'sovrapposizione adatta. Il dato sui soli picchi non fissa l’intero massimo della somma.',
  'Allinea prima le ascisse e poi somma le ordinate.')]
CHOICES={2: 1, 4: 3, 5: 4, 6: 0, 7: 1, 8: 2, 10: 4}
UNITS={1: 'mm', 3: 'mm', 9: 'ms'}
FIGURES={1: 'Le tre barre del primo pannello si riferiscono allo stesso punto e istante, con lo stesso zero e scala in millimetri: +1,2 più +0,8 dà +2,0 mm. Non sono tre punti diversi della corda.', 3: 'Il pannello centrale mostra i coefficienti di due coseni opposti: +5 e −3 mm, con somma +2 mm alla fase scelta. L’ampiezza della sinusoide risultante è 2 mm.', 7: 'Nell’ultimo pannello le barre di ampiezza confrontano A e 2A sulla propria scala; le barre di intensità confrontano I₁ e 4I₁ su un’altra scala. Le due scale hanno dimensioni diverse e non vanno confrontate fra loro.'}
def assemble(repo,source_ref):
 categories={1: 'concetto', 2: 'concetto', 3: 'calcolo', 4: 'modello', 5: 'algebra', 6: 'concetto', 7: 'modello', 8: 'concetto', 9: 'unità', 10: 'concetto'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C5-L03"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c5-l03",TASKS,CHOICES,UNITS,"cric-c5-l03-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C5",skill="C5-L03",section="Onde e oscillazioni",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c5-l03")
