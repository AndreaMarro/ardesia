# cric-c4-l04

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C4.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C4-Q031

Compito: Una bacchetta negativa si avvicina a una sfera metallica inizialmente neutra, isolata e senza contatto con la bacchetta. Raggiunto l’equilibrio elettrostatico, come si presenta il lato della sfera più vicino alla bacchetta?

Procedimento: La bacchetta negativa respinge gli elettroni mobili del metallo verso il lato lontano. Sul lato vicino resta un difetto di elettroni, che corrisponde a carica superficiale positiva indotta. Non essendoci contatto né collegamento a terra, non passa carica da o verso la sfera: la sua carica totale rimane nulla.

Passaggi esatti: `q_{\rm totale}=0`.

Distrattori: Un eccesso di elettroni sul lato vicino contraddirebbe la repulsione da parte della bacchetta negativa. Non occorre un trasferimento di protoni fra gli oggetti. La separazione di cariche superficiali non rende automaticamente carico l’intero conduttore isolato.

Aiuto: Segui il moto degli elettroni, poi considera ciò che resta sul lato vicino.

Famiglia: `bacchetta-vicina-e-sfera-isolata`; difficoltà 1; versione 3/base 2.

## C4-Q032

Compito: Quale termine indica la formazione o l’orientamento di dipoli elettrici in un dielettrico immerso in un campo esterno?

Procedimento: Il campo può spostare leggermente le cariche legate all’interno di atomi o molecole, oppure orientare in parte dipoli già presenti. Questa risposta si chiama polarizzazione. Non richiede che le cariche si muovano liberamente attraverso tutto il materiale né che il dielettrico acquisti una carica netta.

Passaggi esatti: `\varepsilon=\varepsilon_r\varepsilon_0`.

Distrattori: La messa a terra è un collegamento conduttore con un serbatoio di carica. Una corrente di conduzione e una reazione nucleare descrivono processi differenti. La polarizzazione non impone campo nullo in qualunque punto.

Aiuto: Cerca il nome associato alla risposta dei dipoli del materiale.

Famiglia: `risposta-locale-dellisolante`; difficoltà 1; versione 2/base 1.

## C4-Q033

Compito: Una sfera conduttrice neutra è isolata. Su una parte della sua superficie si raccolgono −6,0 nC per induzione. Non ci sono cariche nelle cavità o nel volume del conduttore. Quanto vale, in nC, la carica sul resto della superficie?

Procedimento: La carica totale della sfera isolata resta zero. Tutta la carica considerata è sulla superficie, divisa in due parti che esauriscono il totale. La prima contribuisce −6,0 nC, quindi il resto deve contribuire +6,0 nC. Il bilancio non richiede che le due parti abbiano la stessa area o densità superficiale.

Passaggi esatti: `q_{\rm resto}=-q_{\rm parte}\qquad q_{\rm resto}=+6\,\mathrm{nC}`.

Distrattori: Zero sul resto lascerebbe una sfera con carica totale −6 nC. Altri −6 nC darebbero totale −12 nC. Le superfici possono avere densità diverse: ciò che si conserva è la carica algebrica integrata su tutta la sfera.

Aiuto: Imponi che la somma delle due porzioni sia zero.

Famiglia: `il-bilancio-di-una-sfera-neutra`; difficoltà 1; versione 2/base 1.

## C4-Q034

Compito: Una sfera metallica è collegata a terra vicino a una bacchetta positiva. Si allontana prima la bacchetta, lasciando il filo di terra collegato, e soltanto dopo si stacca il filo. In assenza di altre sorgenti e dopo il raggiungimento dell’equilibrio, che cosa si ottiene idealmente?

Procedimento: Mentre la bacchetta è vicina, il collegamento a terra consente uno scambio di elettroni. Allontanando la bacchetta prima di interrompere quel collegamento, viene meno la causa della redistribuzione; il sistema può riequilibrarsi con la Terra. In assenza di altre sorgenti la sfera torna idealmente neutra. Staccare dopo il filo conserva questa condizione.

Passaggi esatti: `q_{\rm finale}=0`.

Distrattori: Staccare prima la terra e soltanto poi togliere la bacchetta sarebbe un’altra procedura e potrebbe isolare una carica negativa. Qui l’ordine è esplicitamente opposto. Dopo il distacco non c’è un serbatoio che continui a fornire carica.

Aiuto: Controlla se il filo è ancora collegato quando scompare la sorgente esterna.

Famiglia: `togliere-prima-la-bacchetta`; difficoltà 2; versione 2/base 1.

## C4-Q035

Compito: A e B appartengono allo stesso pezzo di metallo continuo in equilibrio elettrostatico. A è a +42 V rispetto alla Terra. Quale differenza V_B−V_A si misura, in volt?

Procedimento: In equilibrio elettrostatico il potenziale è uniforme nel conduttore continuo. Dunque V_B=V_A=+42 V rispetto alla Terra e V_B−V_A=0 V. Il potenziale comune può essere diverso da quello terrestre: essere equipotenziale non significa necessariamente essere messo a terra.

Passaggi esatti: `V_B=V_A\qquad V_B-V_A=0\,\mathrm V`.

Distrattori: 42 V è il potenziale del singolo punto rispetto alla Terra, non la differenza fra A e B. −42 V supporrebbe che B sia a zero senza che sia stato detto. 84 V somma i due potenziali anziché confrontarli.

Aiuto: Usa la condizione di equilibrio del conduttore, poi sottrai i potenziali.

Famiglia: `potenziale-fra-due-punti-del-metallo`; difficoltà 1; versione 3/base 2.

## C4-Q036

Compito: Completa «messa a …»: quale termine pratico indica il collegamento conduttore a un grande serbatoio di carica che fissa il potenziale di riferimento?

Procedimento: La messa a terra collega il corpo a un serbatoio molto grande, che può scambiare carica mantenendo approssimativamente il potenziale di riferimento. Non equivale a isolare il corpo. Il collegamento può permettere ingresso o uscita di elettroni secondo le altre condizioni del problema.

Passaggi esatti: `V=V_{\rm Terra}`.

Distrattori: Vuoto, fusione e moto uniforme non definiscono questo collegamento elettrico. Una resistenza infinita impedirebbe lo scambio di carica che il collegamento deve consentire nel modello ideale.

Aiuto: Pensa al nome del serbatoio usato come riferimento convenzionale negli impianti.

Famiglia: `connettere-un-conduttore-alla-terra`; difficoltà 1; versione 2/base 1.

## C4-Q037

Compito: In un punto regolare della superficie di un conduttore in equilibrio elettrostatico, quale componente del campo appena esterno deve essere nulla?

Procedimento: Una componente tangenziale del campo farebbe muovere le cariche libere lungo la superficie, contraddicendo l’equilibrio elettrostatico. Perciò la componente tangenziale è nulla. Il campo esterno può invece avere una componente normale, legata alla carica superficiale locale. Il punto regolare permette di definire tangente e normale.

Passaggi esatti: `E_{\rm tangente}=0`.

Distrattori: Campo nullo nel materiale non significa campo esterno nullo ovunque. La componente normale può essere non nulla; il verso dell’osservatore non definisce una condizione elettrostatica. La conclusione richiede equilibrio, non il solo fatto che il materiale sia metallico.

Aiuto: Chiediti quale componente metterebbe in moto cariche lungo la superficie.

Famiglia: `direzione-del-campo-alla-superficie`; difficoltà 2; versione 2/base 1.

## C4-Q038

Compito: Un filo resistivo porta corrente continua non nulla e si misura una caduta di tensione non nulla fra i suoi estremi. Quale uso della regola «il metallo è equipotenziale» sarebbe errato?

Procedimento: La regola dell’equipotenzialità del metallo vale in equilibrio elettrostatico. Un filo resistivo attraversato da corrente può avere un campo interno e una caduta di potenziale, anche quando la corrente è costante nel tempo. Applicare la regola ignorando queste condizioni cancellerebbe proprio la caduta osservata.

Passaggi esatti: `\Delta V\ne0`.

Distrattori: Stazionario significa qui che le grandezze non cambiano nel tempo, non che manchi il moto ordinato dei portatori. Rispettare le condizioni della regola o ammettere la caduta misurata sono usi coerenti, non errori.

Aiuto: Distingui un equilibrio senza corrente da una conduzione continua e resistiva.

Famiglia: `un-filo-con-corrente-stazionaria`; difficoltà 2; versione 2/base 1.

## C4-Q039

Compito: Fra due grandi piastre parallele isolate, inizialmente nel vuoto, il campo è 12 kV/m. Un dielettrico lineare omogeneo con permittività relativa ε_r=3 riempie completamente lo spazio. Le cariche libere restano fisse; trascurando i bordi, quale campo si ottiene in kV/m?

Procedimento: A carica libera fissata e con riempimento completo, il campo del modello uniforme è inversamente proporzionale alla permittività. Passando da ε₀ a 3ε₀, il campo si divide per tre: 12/3=4 kV/m. La polarizzazione modifica il campo senza richiedere un generatore che mantenga la tensione.

Passaggi esatti: `E=\frac{E_0}{\varepsilon_r}\qquad E=4\,\mathrm{kV/m}`.

Distrattori: 36 kV/m moltiplicherebbe per la permittività relativa anziché dividere. 12 kV/m descriverebbe invece il campo non modificato. Campo nullo ovunque è una proprietà diversa, non la risposta di un dielettrico lineare con ε_r finita assegnata.

Aiuto: Identifica prima il vincolo: le cariche libere, non la tensione, sono fissate.

Famiglia: `effetto-di-un-mezzo-sul-campo-a-carica-fissa`; difficoltà 2; versione 3/base 2.

## C4-Q040

Compito: Nel linguaggio dei condensatori, come si chiama un materiale isolante che risponde al campo principalmente attraverso la polarizzazione?

Procedimento: Si chiama dielettrico. La sua risposta viene descritta in termini di cariche legate e dipoli, con una permittività pertinente al modello. Questo non equivale al libero moto macroscopico degli elettroni di conduzione proprio di un conduttore.

Passaggi esatti: `\varepsilon=\varepsilon_r\varepsilon_0`.

Distrattori: Un generatore mantiene una differenza di potenziale ai morsetti e non è il nome del materiale isolante. Una carica puntiforme è un modello di sorgente. Conduttore ideale e superconduttore non definiscono la risposta polarizzabile richiesta.

Aiuto: Cerca il termine usato per l’isolante collocato fra le armature.

Famiglia: `materiale-con-cariche-prevalentemente-legate`; difficoltà 1; versione 2/base 1.
