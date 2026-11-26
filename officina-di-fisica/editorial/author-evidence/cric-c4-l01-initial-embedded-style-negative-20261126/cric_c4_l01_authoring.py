"""Ten distinct original Cric electric questions; author edition, not approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C4.json"
SOURCE_IDS=['C4-Q001', 'C4-Q002', 'C4-Q003', 'C4-Q004', 'C4-Q005', 'C4-Q006', 'C4-Q007', 'C4-Q008', 'C4-Q009', 'C4-Q010']
TASKS=[('Contare un eccesso di elettroni',
  'Una gocciolina inizialmente neutra acquisisce carica −4,80 fC in un ordinario trasferimento di elettroni. '
  'Quanti elettroni ha acquistato? Usa il valore di modello e=1,60×10⁻¹⁹ C.',
  30000,
  'Un elettrone aggiunto porta carica −e, quindi il segno negativo indica un eccesso di elettroni. Per contarli '
  'divido il modulo della carica per e. Scrivo 4,80 fC=4,80×10⁻¹⁵ C: il rapporto è (4,80/1,60)×10⁴=3×10⁴. Il '
  'numero acquistato è positivo e intero: 30 000 elettroni.',
  'N=\\frac{|q|}{e}\\qquad N=3\\cdot10^4',
  'Il segno della carica non rende negativo il numero di elettroni acquistati. 3 000 elettroni darebbero −0,480 '
  'fC; 300 000 darebbero −48,0 fC. Il prefisso femto vale 10⁻¹⁵, mentre la carica elementare assegnata contiene '
  '10⁻¹⁹.',
  'Conserva il segno per identificare gli elettroni in eccesso, poi usa il modulo per il conteggio.'),
 ('Due forze applicate a corpi diversi',
  'Due cariche puntiformi ferme, isolate da altre sorgenti, valgono +q e +3q, con q>0. Si respingono. Quale '
  'confronto fra le forze reciproche rispetta la dinamica?',
  ['La carica +q non subisce forza',
   'Le due forze hanno uguale modulo e versi opposti',
   'La forza su +q è tre volte quella su +3q',
   'La forza su +3q è tre volte quella su +q',
   'Le due forze hanno lo stesso verso'],
  'La legge di Coulomb contiene lo stesso prodotto 3q² e la stessa distanza in entrambi i calcoli. La coppia di '
  'azione e reazione ha quindi uguale modulo e versi opposti lungo la congiungente. Le frecce sono applicate a '
  'corpi distinti: non si cancellano nel bilancio delle forze di uno solo dei due corpi.',
  '\\mathbf F_{1\\to2}=-\\mathbf F_{2\\to1}',
  'Il rapporto fra le cariche non è il rapporto fra le forze reciproche. Avere la stessa direzione geometrica non '
  'significa avere lo stesso verso. Senza conoscere le masse non si può confrontare l’accelerazione dei due '
  'corpi.',
  'Confronta il prodotto delle due cariche quando scambi sorgente e corpo che subisce la forza.'),
 ('Il prefisso delle piccole cariche',
  'Quale prefisso SI, scritto in lettere, corrisponde a 10⁻⁹ e si usa spesso per piccole cariche?',
  ['femto', 'milli', 'nano', 'micro', 'pico'],
  'Il prefisso nano indica un miliardesimo dell’unità. Una carica di 1 nC vale perciò 10⁻⁹ C. Il prefisso '
  'modifica il valore dell’unità, non il segno della carica: un nanocoulomb può essere positivo o negativo.',
  '1\\,\\mathrm{nC}=10^{-9}\\,\\mathrm C',
  'Micro corrisponde a 10⁻⁶, pico a 10⁻¹², femto a 10⁻¹⁵ e milli a 10⁻³. Confondere nano con micro cambia il '
  'valore di un fattore mille.',
  'Riconosci il prefisso associato a un miliardesimo.'),
 ('Ridurre la forza allontanando le cariche',
  'Due cariche puntiformi fisse nel vuoto, non nulle, inizialmente distanti 4 cm si respingono con modulo F. '
  'Senza cambiarle, a quanti cm vanno portate per ottenere il modulo F/9?',
  12,
  'A cariche costanti la forza è inversamente proporzionale al quadrato della distanza. Per dividerla per nove '
  'devo moltiplicare la distanza per la radice positiva di nove, cioè tre. La nuova distanza è 3×4 cm=12 cm. Il '
  'controllo diretto dà (4/12)²=1/9.',
  '\\frac{F_f}{F_i}=\\left(\\frac{r_i}{r_f}\\right)^2\\qquad r_f=3r_i',
  '36 cm moltiplicherebbe la distanza per nove e ridurrebbe la forza a F/81. Ridurre la distanza aumenterebbe la '
  'forza. La radice negativa non è ammessa per una distanza fra due punti distinti.',
  'Applica la radice al fattore di variazione della forza prima di scalare la distanza.'),
 ('Conservare la carica algebrica',
  'Un sistema isolato elettricamente ha carica totale −2,5 nC. Viene separato in due oggetti, senza scambio di '
  'carica con l’esterno. Il primo ha +1,2 nC. Qual è la carica del secondo?',
  ['−1,3 nC', '+3,7 nC', '+1,3 nC', '−2,5 nC', '−3,7 nC'],
  'La conservazione riguarda la somma con segno. Scrivo q₁+q₂=q_tot e isolo q₂ sottraendo la carica positiva del '
  'primo oggetto. Ottengo −2,5−1,2=−3,7 nC. Il controllo è +1,2+(−3,7)=−2,5 nC. La separazione può ridistribuire '
  'le cariche, ma non modificarne il totale nel sistema isolato.',
  'q_2=q_{\\rm tot}-q_1',
  '−1,3 nC darebbe un totale di −0,1 nC. +3,7 nC e +1,3 nC darebbero totali positivi. Lasciare al secondo tutto '
  '−2,5 nC ignorerebbe il contributo +1,2 nC del primo.',
  'Sottrai la carica del primo oggetto dal totale, conservando entrambi i segni.'),
 ('Quando basta il modello puntiforme',
  'Per stimare il campo lontano di un corpo carico con carica netta non nulla, nel regime in cui domina il '
  'contributo della carica totale, quale condizione geometrica permette usualmente di trascurarne le dimensioni?',
  ['Le dimensioni del corpo sono molto minori della distanza dal punto di osservazione',
   'Il punto di osservazione è dentro il corpo',
   'La distanza è minore delle dimensioni del corpo',
   'La carica totale deve essere necessariamente zero',
   'La sola forma sferica rende irrilevante qualsiasi distribuzione di carica'],
  'Da lontano i dettagli della distribuzione incidono meno sul campo rispetto al contributo complessivo della '
  'carica netta, nelle condizioni indicate. Se la dimensione caratteristica a è molto minore di r, posso '
  'approssimare il corpo con una sorgente puntiforme. Non è una regola per punti interni o vicinissimi alla '
  'superficie.',
  'a\\ll r',
  'Essere dentro o vicino al corpo non giustifica l’approssimazione lontana. Una carica netta nulla eliminerebbe '
  'il contributo monopolare considerato. La sola forma esterna non sostituisce le condizioni sulla distribuzione '
  'e sul punto di osservazione.',
  'Confronta la dimensione del corpo con la distanza dalla sonda.'),
 ('Cariche di segno opposto',
  'Due cariche puntiformi ferme hanno segni opposti. Con quale aggettivo si definisce la forza che ciascuna '
  'esercita sull’altra?',
  ['Indipendente dalla distanza', 'Attrattiva', 'Repulsiva', 'Sempre nulla', 'Tangenziale alla congiungente'],
  'Ogni carica è spinta verso la posizione dell’altra. La forza è quindi attrattiva e agisce lungo la '
  'congiungente delle cariche. Il segno del prodotto q₁q₂ distingue attrazione e repulsione, mentre il modulo '
  'dipende anche dalla distanza e dai valori assoluti delle cariche.',
  'q_1q_2<0',
  'Repulsiva descrive cariche dello stesso segno. L’opposizione dei segni non annulla le cariche né le forze '
  'reciproche. La forza di Coulomb non è tangenziale alla congiungente e non resta costante cambiando la '
  'distanza.',
  'Il segno del prodotto delle cariche è negativo: le cariche si avvicinerebbero se libere.'),
 ('Cambiare carica e distanza insieme',
  'Nel medesimo mezzo una delle due cariche puntiformi è triplicata e la distanza è raddoppiata; l’altra carica '
  'resta invariata. Le cariche iniziali sono non nulle. Qual è il rapporto F_f/F_i dei moduli delle forze?',
  ['4/3', '12', '3/4', '3/2', '3'],
  'Il prodotto delle cariche fornisce un fattore tre. Il denominatore r² fornisce invece un fattore quattro '
  'quando r raddoppia. Il rapporto finale rispetto all’iniziale è dunque 3/4: la forza diminuisce, pur essendo '
  'aumentata una delle cariche. Il mezzo è lo stesso, perciò il coefficiente della legge si semplifica.',
  '\\frac{F_f}{F_i}=\\frac{3}{2^2}=\\frac34',
  '3/2 tratta la distanza come se comparisse alla prima potenza. 3 ignora la variazione della distanza. 4/3 è il '
  'rapporto inverso, mentre 12 moltiplica per quattro invece di dividere.',
  'Separa il fattore del numeratore da quello del denominatore quadratico.'),
 ('Uno strofinio lascia il corpo positivo',
  'Un oggetto inizialmente neutro diventa positivo per ordinaria elettrizzazione per strofinio, senza reazioni '
  'nucleari. Quale cambiamento microscopico è coerente?',
  ['Si trasformano elettroni in protoni',
   'Scompaiono i neutroni dei nuclei',
   'Il corpo resta necessariamente neutro',
   'L’oggetto perde alcuni elettroni',
   'L’oggetto acquista elettroni'],
  'Gli elettroni portano carica negativa. Se alcuni vengono trasferiti dall’oggetto all’altro materiale, nel '
  'primo rimane un difetto di carica negativa e quindi una carica netta positiva. Non occorre cambiare il numero '
  'dei protoni nei nuclei. Il trasferimento conserva la carica complessiva dei materiali se il sistema è isolato.',
  'q_{\\rm finale}>0',
  'Acquistare elettroni renderebbe l’oggetto negativo. Trasformazioni dei nuclei e scomparsa di neutroni non '
  'descrivono l’ordinario strofinio. Essere inizialmente neutro non impedisce un successivo trasferimento di '
  'carica.',
  'Collega il segno finale al guadagno o alla perdita di portatori negativi.'),
 ('Trovare la seconda carica con il suo segno',
  'Nel vuoto, una carica +2,0 nC e una seconda carica puntiforme, distanti 0,20 m, si attraggono con modulo della '
  'forza 9,0 μN. Trova la seconda carica con segno in nC. Usa k=9,0×10⁹ N·m²/C².',
  -20,
  'L’attrazione verso una carica positiva richiede che la seconda sia negativa. Dalla legge dei moduli ricavo '
  '|q|=Fr²/(kQ). In SI il numeratore vale (9×10⁻⁶)(0,20)²=3,6×10⁻⁷ N·m² e kQ=18 N·m²/C. Il rapporto è 2×10⁻⁸ C, '
  'cioè 20 nC. Ripristino il segno: q=−20 nC.',
  'q=-\\frac{Fr^2}{kQ}\\qquad q=-20\\,\\mathrm{nC}',
  '+20 nC produrrebbe repulsione. −2 nC darebbe 0,9 μN e −200 nC darebbe 90 μN, mentre il modulo misurato è 9,0 '
  'μN. Il prefisso nano vale 10⁻⁹ e micro vale 10⁻⁶; non si possono lasciare quei numeri nel prodotto SI senza '
  'conversione.',
  'Determina prima il segno dall’attrazione, poi ricava il modulo con unità SI.')]
CHOICES={2: 1, 3: 2, 5: 4, 6: 0, 7: 1, 8: 2, 9: 3}
UNITS={1: '1', 4: 'cm', 10: 'nC'}
FIGURES={1: 'La carica negativa aggiunta corrisponde a 30 000 elettroni: tre gruppi simbolici da 10 000, non tre sole particelle. Ogni elettrone ha carica −e nel modello assegnato.', 4: 'Stesse cariche e stesso mezzo: portare la distanza da 4 a 12 cm riduce il modulo della forza da F a F/9. Le frecce confrontano forze applicate a corpi distinti.', 5: 'Il totale algebrico resta −2,5 nC: l’oggetto A ha +1,2 nC e B ha −3,7 nC. Il riquadro indica il confine dell’intero sistema isolato, non una barriera che impedisce la separazione interna.'}
def assemble(repo,source_ref):
 categories={1: 'unità', 2: 'concetto', 3: 'unità', 4: 'modello', 5: 'concetto', 6: 'modello', 7: 'concetto', 8: 'modello', 9: 'concetto', 10: 'modello'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C4-L01"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c4-l01",TASKS,CHOICES,UNITS,"cric-c4-l01-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C4",skill="C4-L01",section="Elettricità e magnetismo",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c4-l01")
