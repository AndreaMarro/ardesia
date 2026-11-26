"""Ten distinct original Cric electric questions; author edition, not approval."""
from .vector_geometry_authoring import assemble_family,write_family
SOURCE_PATH="officina-di-fisica/content/C4.json"
SOURCE_IDS=['C4-Q031', 'C4-Q032', 'C4-Q033', 'C4-Q034', 'C4-Q035', 'C4-Q036', 'C4-Q037', 'C4-Q038', 'C4-Q039', 'C4-Q040']
TASKS=[('Avvicinare una bacchetta senza contatto',
  'Una bacchetta negativa si avvicina a una sfera metallica inizialmente neutra, isolata e senza contatto con la '
  'bacchetta. Raggiunto l’equilibrio elettrostatico, come si presenta il lato della sfera più vicino alla '
  'bacchetta?',
  ['Ha un difetto di elettroni e carica superficiale positiva indotta',
   'Ha un eccesso di elettroni e carica negativa indotta',
   'Riceve protoni dalla bacchetta attraverso l’aria',
   'La sfera acquista necessariamente carica totale positiva',
   'Gli elettroni restano tutti nelle posizioni iniziali'],
  'La bacchetta negativa respinge gli elettroni mobili del metallo verso il lato lontano. Sul lato vicino resta '
  'un difetto di elettroni, che corrisponde a carica superficiale positiva indotta. Non essendoci contatto né '
  'collegamento a terra, non passa carica da o verso la sfera: la sua carica totale rimane nulla.',
  'q_{\\rm totale}=0',
  'Un eccesso di elettroni sul lato vicino contraddirebbe la repulsione da parte della bacchetta negativa. Non '
  'occorre un trasferimento di protoni fra gli oggetti. La separazione di cariche superficiali non rende '
  'automaticamente carico l’intero conduttore isolato.',
  'Segui il moto degli elettroni, poi considera ciò che resta sul lato vicino.'),
 ('La risposta delle cariche legate',
  'Quale termine indica la formazione o l’orientamento di dipoli elettrici in un dielettrico immerso in un campo '
  'esterno?',
  ['Neutralizzazione obbligatoria del campo ovunque',
   'Polarizzazione',
   'Fusione nucleare',
   'Messa a terra per definizione',
   'Corrente continua attraverso il vuoto'],
  'Il campo può spostare leggermente le cariche legate all’interno di atomi o molecole, oppure orientare in parte '
  'dipoli già presenti. Questa risposta si chiama polarizzazione. Non richiede che le cariche si muovano '
  'liberamente attraverso tutto il materiale né che il dielettrico acquisti una carica netta.',
  '\\varepsilon=\\varepsilon_r\\varepsilon_0',
  'La messa a terra è un collegamento conduttore con un serbatoio di carica. Una corrente di conduzione e una '
  'reazione nucleare descrivono processi differenti. La polarizzazione non impone campo nullo in qualunque punto.',
  'Cerca il nome associato alla risposta dei dipoli del materiale.'),
 ('Il bilancio di un conduttore neutro',
  'Una sfera conduttrice neutra è isolata. Su una parte della sua superficie si raccolgono −6,0 nC per induzione. '
  'Non ci sono cariche nelle cavità o nel volume del conduttore. Quanto vale, in nC, la carica sul resto della '
  'superficie?',
  6,
  'La carica totale della sfera isolata resta zero. Tutta la carica considerata è sulla superficie, divisa in due '
  'parti che esauriscono il totale. La prima contribuisce −6,0 nC, quindi il resto deve contribuire +6,0 nC. Il '
  'bilancio non richiede che le due parti abbiano la stessa area o densità superficiale.',
  'q_{\\rm resto}=-q_{\\rm parte}\\qquad q_{\\rm resto}=+6\\,\\mathrm{nC}',
  'Zero sul resto lascerebbe una sfera con carica totale −6 nC. Altri −6 nC darebbero totale −12 nC. Le superfici '
  'possono avere densità diverse: ciò che si conserva è la carica algebrica integrata su tutta la sfera.',
  'Imponi che la somma delle due porzioni sia zero.'),
 ('Togliere prima la sorgente esterna',
  'Una sfera metallica è collegata a terra vicino a una bacchetta positiva. Si allontana prima la bacchetta, '
  'lasciando il filo di terra collegato, e soltanto dopo si stacca il filo. In assenza di altre sorgenti e dopo '
  'il raggiungimento dell’equilibrio, che cosa si ottiene idealmente?',
  ['Una sfera necessariamente positiva',
   'Una carica che cresce indefinitamente dopo il distacco',
   'Una sfera priva di elettroni',
   'Una sfera neutra',
   'Una sfera necessariamente negativa come se fosse stata staccata prima la terra'],
  'Mentre la bacchetta è vicina, il collegamento a terra consente uno scambio di elettroni. Allontanando la '
  'bacchetta prima di interrompere quel collegamento, viene meno la causa della redistribuzione; il sistema può '
  'riequilibrarsi con la Terra. In assenza di altre sorgenti la sfera torna idealmente neutra. Staccare dopo il '
  'filo conserva questa condizione.',
  'q_{\\rm finale}=0',
  'Staccare prima la terra e soltanto poi togliere la bacchetta sarebbe un’altra procedura e potrebbe isolare una '
  'carica negativa. Qui l’ordine è esplicitamente opposto. Dopo il distacco non c’è un serbatoio che continui a '
  'fornire carica.',
  'Controlla se il filo è ancora collegato quando scompare la sorgente esterna.'),
 ('Due punti dello stesso metallo in equilibrio',
  'A e B appartengono allo stesso pezzo di metallo continuo in equilibrio elettrostatico. A è a +42 V rispetto '
  'alla Terra. Quale differenza V_B−V_A si misura, in volt?',
  0,
  'In equilibrio elettrostatico il potenziale è uniforme nel conduttore continuo. Dunque V_B=V_A=+42 V rispetto '
  'alla Terra e V_B−V_A=0 V. Il potenziale comune può essere diverso da quello terrestre: essere equipotenziale '
  'non significa necessariamente essere messo a terra.',
  'V_B=V_A\\qquad V_B-V_A=0\\,\\mathrm V',
  '42 V è il potenziale del singolo punto rispetto alla Terra, non la differenza fra A e B. −42 V supporrebbe che '
  'B sia a zero senza che sia stato detto. 84 V somma i due potenziali anziché confrontarli.',
  'Usa la condizione di equilibrio del conduttore, poi sottrai i potenziali.'),
 ('Il collegamento al serbatoio di carica',
  'Completa «messa a …»: quale termine pratico indica il collegamento conduttore a un grande serbatoio di carica '
  'che fissa il potenziale di riferimento?',
  ['Terra', 'Vuoto', 'Fusione', 'Resistenza infinita', 'Moto uniforme'],
  'La messa a terra collega il corpo a un serbatoio molto grande, che può scambiare carica mantenendo '
  'approssimativamente il potenziale di riferimento. Non equivale a isolare il corpo. Il collegamento può '
  'permettere ingresso o uscita di elettroni secondo le altre condizioni del problema.',
  'V=V_{\\rm Terra}',
  'Vuoto, fusione e moto uniforme non definiscono questo collegamento elettrico. Una resistenza infinita '
  'impedirebbe lo scambio di carica che il collegamento deve consentire nel modello ideale.',
  'Pensa al nome del serbatoio usato come riferimento convenzionale negli impianti.'),
 ('Il campo appena fuori da una superficie metallica',
  'In un punto regolare della superficie di un conduttore in equilibrio elettrostatico, quale componente del '
  'campo appena esterno deve essere nulla?',
  ['Nessuna: è sempre richiesta una componente tangenziale non nulla',
   'La componente tangenziale alla superficie',
   'La componente normale alla superficie in ogni situazione',
   'Ogni componente del campo esterno in qualunque situazione',
   'Soltanto la componente rivolta verso l’osservatore'],
  'Una componente tangenziale del campo farebbe muovere le cariche libere lungo la superficie, contraddicendo '
  'l’equilibrio elettrostatico. Perciò la componente tangenziale è nulla. Il campo esterno può invece avere una '
  'componente normale, legata alla carica superficiale locale. Il punto regolare permette di definire tangente e '
  'normale.',
  'E_{\\rm tangente}=0',
  'Campo nullo nel materiale non significa campo esterno nullo ovunque. La componente normale può essere non '
  'nulla; il verso dell’osservatore non definisce una condizione elettrostatica. La conclusione richiede '
  'equilibrio, non il solo fatto che il materiale sia metallico.',
  'Chiediti quale componente metterebbe in moto cariche lungo la superficie.'),
 ('Una regola fuori dalle sue condizioni',
  'Un filo resistivo porta corrente continua non nulla e si misura una caduta di tensione non nulla fra i suoi '
  'estremi. Quale uso della regola «il metallo è equipotenziale» sarebbe errato?',
  ['Ammettere un campo interno che sostenga la conduzione resistiva',
   'Usare la caduta di tensione misurata per descrivere il filo',
   'Applicarla a quel filo come se fosse in equilibrio elettrostatico',
   'Richiedere l’equilibrio elettrostatico prima di applicarla',
   'Distinguere corrente stazionaria da equilibrio elettrostatico'],
  'La regola dell’equipotenzialità del metallo vale in equilibrio elettrostatico. Un filo resistivo attraversato '
  'da corrente può avere un campo interno e una caduta di potenziale, anche quando la corrente è costante nel '
  'tempo. Applicare la regola ignorando queste condizioni cancellerebbe proprio la caduta osservata.',
  '\\Delta V\\ne0',
  'Stazionario significa qui che le grandezze non cambiano nel tempo, non che manchi il moto ordinato dei '
  'portatori. Rispettare le condizioni della regola o ammettere la caduta misurata sono usi coerenti, non errori.',
  'Distingui un equilibrio senza corrente da una conduzione continua e resistiva.'),
 ('Inserire un dielettrico con carica fissata',
  'Fra due grandi piastre parallele isolate, inizialmente nel vuoto, il campo è 12 kV/m. Un dielettrico lineare '
  'omogeneo con permittività relativa ε_r=3 riempie completamente lo spazio. Le cariche libere restano fisse; '
  'trascurando i bordi, quale campo si ottiene in kV/m?',
  4,
  'A carica libera fissata e con riempimento completo, il campo del modello uniforme è inversamente proporzionale '
  'alla permittività. Passando da ε₀ a 3ε₀, il campo si divide per tre: 12/3=4 kV/m. La polarizzazione modifica '
  'il campo senza richiedere un generatore che mantenga la tensione.',
  'E=\\frac{E_0}{\\varepsilon_r}\\qquad E=4\\,\\mathrm{kV/m}',
  '36 kV/m moltiplicherebbe per la permittività relativa anziché dividere. 12 kV/m descriverebbe invece il campo '
  'non modificato. Campo nullo ovunque è una proprietà diversa, non la risposta di un dielettrico lineare con ε_r '
  'finita assegnata.',
  'Identifica prima il vincolo: le cariche libere, non la tensione, sono fissate.'),
 ('Il nome del materiale polarizzabile',
  'Nel linguaggio dei condensatori, come si chiama un materiale isolante che risponde al campo principalmente '
  'attraverso la polarizzazione?',
  ['Conduttore ideale',
   'Generatore ideale',
   'Carica puntiforme',
   'Superconduttore per definizione',
   'Dielettrico'],
  'Si chiama dielettrico. La sua risposta viene descritta in termini di cariche legate e dipoli, con una '
  'permittività pertinente al modello. Questo non equivale al libero moto macroscopico degli elettroni di '
  'conduzione proprio di un conduttore.',
  '\\varepsilon=\\varepsilon_r\\varepsilon_0',
  'Un generatore mantiene una differenza di potenziale ai morsetti e non è il nome del materiale isolante. Una '
  'carica puntiforme è un modello di sorgente. Conduttore ideale e superconduttore non definiscono la risposta '
  'polarizzabile richiesta.',
  'Cerca il termine usato per l’isolante collocato fra le armature.')]
CHOICES={1: 0, 2: 1, 4: 3, 6: 0, 7: 1, 8: 2, 10: 4}
UNITS={3: 'nC', 5: 'V', 9: 'kV/m'}
FIGURES={1: 'La bacchetta negativa respinge gli elettroni del conduttore verso il lato lontano: vicino resta un difetto di elettroni. I segni mostrano una separazione interna simbolica, con carica totale della sfera ancora nulla.', 3: 'Due porzioni che esauriscono la superficie hanno cariche −6 e +6 nC. La somma è zero; il disegno non assegna una densità superficiale uniforme.', 9: 'Piastre isolate, stessa carica libera e spazio completamente riempito: il campo passa da 12 a 4 kV/m. Le due frecce del campo condividono la scala; i simboli delle piastre indicano soltanto la polarità.'}
def assemble(repo,source_ref):
 categories={1: 'concetto', 2: 'concetto', 3: 'concetto', 4: 'modello', 5: 'concetto', 6: 'concetto', 7: 'concetto', 8: 'modello', 9: 'modello', 10: 'concetto'}
 overrides={i:{"error":{"category":categories[i],"message":t[5],"target":"C4-L04"},"coverage":[t[0]]}for i,t in enumerate(TASKS,1)}
 return assemble_family(repo,source_ref,"cric-c4-l04",TASKS,CHOICES,UNITS,"cric-c4-l04-progressive.svg",FIGURES,0,source_path=SOURCE_PATH,source_origin="cric",source_ids=SOURCE_IDS,course="C4",skill="C4-L04",section="Elettricità e magnetismo",coverage=["Dieci problemi distinti"],overrides=overrides)
if __name__=="__main__":write_family(assemble,"cric-c4-l04")
