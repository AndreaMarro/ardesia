# cric-c4-l03

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C4.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C4-Q021

Compito: Due sorgenti puntiformi +2,0 nC e −1,0 nC sono entrambe a 0,10 m da P nel vuoto. Con zero all’infinito e k=9,0×10⁹ N·m²/C², calcola V(P) in volt.

Procedimento: Il potenziale è scalare: sommo i contributi con i segni delle cariche. Le distanze sono uguali, quindi V=k(q₁+q₂)/r. La somma delle sorgenti è +1,0 nC e k·(1,0×10⁻⁹)/0,10=90 V. In alternativa i contributi separati sono +180 V e −90 V. La disposizione angolare delle sorgenti non entra in questa somma scalare.

Passaggi esatti: `V(P)=k\frac{q_1+q_2}{r}\qquad V(P)=90\,\mathrm V`.

Distrattori: 270 V somma impropriamente i moduli dei contributi. −90 V perde il contributo positivo di +180 V. Un potenziale nullo richiederebbe qui somma delle cariche nulla, che non è il dato assegnato.

Aiuto: Usa i segni algebrici: i due contributi hanno lo stesso denominatore.

Famiglia: `potenziale-in-un-punto-equidistante`; difficoltà 2; versione 2/base 1.

## C4-Q022

Compito: Una carica positiva si sposta lungo una superficie a potenziale costante in un campo elettrostatico. Quanto lavoro compie il solo campo elettrico fra il punto iniziale e quello finale?

Procedimento: I due punti hanno lo stesso potenziale, quindi ΔV=V_f−V_i=0. L’energia potenziale della carica varia di qΔV=0 e il lavoro del campo vale −ΔU=0 J. La carica può percorrere uno spazio non nullo: il valore nullo del lavoro non significa necessariamente assenza del campo o assenza di moto.

Passaggi esatti: `W_{\rm campo}=-q\Delta V\qquad W_{\rm campo}=0\,\mathrm J`.

Distrattori: Un lavoro positivo o negativo richiederebbe una differenza di potenziale non nulla fra gli estremi. Non si può dedurre la lunghezza del percorso o il modulo del campo dal solo lavoro nullo.

Aiuto: Confronta il potenziale ai due estremi, non la distanza percorsa.

Famiglia: `muoversi-su-una-equipotenziale`; difficoltà 1; versione 2/base 1.

## C4-Q023

Compito: Un joule per coulomb corrisponde a quale unità SI di differenza di potenziale? Scrivine il nome.

Procedimento: La differenza di potenziale descrive energia potenziale per unità di carica. L’unità che equivale a un joule diviso per un coulomb si chiama volt e ha simbolo V. Joule e coulomb restano unità di grandezze differenti: il loro rapporto definisce l’unità richiesta.

Passaggi esatti: `1\,\mathrm V=1\,\mathrm{J/C}`.

Distrattori: Il coulomb misura la carica, il joule l’energia, il newton la forza e l’ampere la corrente. Sostituire una di queste unità al rapporto J/C confonderebbe la grandezza che si sta misurando.

Aiuto: Riconosci l’unità usata per la tensione fra due punti.

Famiglia: `unita-di-potenziale`; difficoltà 1; versione 2/base 1.

## C4-Q024

Compito: In una regione di campo elettrico uniforme, due piani equipotenziali distano 3,0 cm lungo il campo e i loro potenziali differiscono di 12 V. Trova il modulo E in V/m.

Procedimento: Lungo il campo uniforme vale |ΔV|=E d, con d misurata nella direzione del campo. Converto 3,0 cm in 0,030 m e divido: E=12/0,030=400 V/m. Il verso è dal potenziale maggiore a quello minore; qui si chiede soltanto il modulo. Non serve conoscere una carica di prova.

Passaggi esatti: `E=\frac{|\Delta V|}{d}\qquad E=400\,\mathrm{V/m}`.

Distrattori: 4 V/m userebbe 3,0 come se fosse una distanza in metri. Moltiplicare tensione e distanza non darebbe un campo. La stessa differenza distribuita su una distanza minore richiederebbe un modulo maggiore.

Aiuto: Porta la distanza in metri, poi dividi il modulo della differenza di potenziale.

Famiglia: `campo-dalla-spaziatura-delle-equipotenziali`; difficoltà 1; versione 3/base 2.

## C4-Q025

Compito: Due cariche puntiformi +q e −q, con q>0, sono distinte e ferme nel vuoto. Nel loro punto medio, con zero del potenziale all’infinito, quale situazione si incontra?

Procedimento: Le distanze dal punto medio sono uguali. I contributi scalari al potenziale hanno stesso modulo e segni opposti, quindi si cancellano. I contributi al campo invece hanno lo stesso verso: quello uscente da +q e quello entrante in −q puntano entrambi da +q verso −q. Si sommano e danno un campo non nullo.

Passaggi esatti: `V(P)=0\qquad \mathbf E(P)\ne\mathbf0`.

Distrattori: V=0 non implica E=0: il campo dipende dalla variazione spaziale del potenziale. Sommare algebricamente i valori dei campi ignorandone il verso scambierebbe una cancellazione scalare con una somma vettoriale. Campo e potenziale hanno anche unità diverse.

Aiuto: Confronta separatamente la somma scalare dei potenziali e le frecce dei due campi.

Famiglia: `potenziale-nullo-senza-campo-nullo`; difficoltà 2; versione 2/base 1.

## C4-Q026

Compito: Un elettrone passa da un punto a 2 V a uno a 17 V per effetto del solo campo elettrostatico. Di quanti eV aumenta la sua energia cinetica?

Procedimento: La variazione di potenziale è +15 V. L’elettrone ha q=−e: la sua energia potenziale varia di qΔV=−15 eV. Se agisce soltanto il campo, l’aumento di energia cinetica è l’opposto, +15 eV. Per una carica negativa passare a potenziale maggiore può quindi significare accelerare.

Passaggi esatti: `\Delta K=-q\Delta V\qquad \Delta K=15\,\mathrm{eV}`.

Distrattori: −15 eV sarebbe la variazione dell’energia potenziale, non l’aumento di K. 19 somma i due potenziali invece di sottrarli. Il simbolo eV è un’unità di energia e non un prodotto da interpretare come la carica con segno dell’elettrone.

Aiuto: Usa il segno negativo della carica e distingui ΔU da ΔK.

Famiglia: `quanta-energia-cinetica-in-elettronvolt`; difficoltà 2; versione 3/base 2.

## C4-Q027

Compito: Porre V=0 all’infinito per una carica puntiforme fissa un … per il potenziale. Quale parola indica questa origine convenzionale della scala?

Procedimento: Il potenziale può essere traslato di una costante senza cambiare le differenze fra due punti. Scegliere V=0 all’infinito fissa il riferimento usato per assegnare i singoli valori. Le differenze di potenziale e il campo della stessa distribuzione sorgente non cambiano per un semplice spostamento dell’origine della scala.

Passaggi esatti: `V^{\prime}=V+C`.

Distrattori: Il riferimento non impone un percorso alla carica e non trasferisce elettroni. Non annulla il campo ovunque: fissa soltanto il valore convenzionale del potenziale in una posizione limite.

Aiuto: Cerca il nome della scelta rispetto alla quale vengono espressi i singoli potenziali.

Famiglia: `scelta-dello-zero`; difficoltà 1; versione 2/base 1.

## C4-Q028

Compito: Una particella di massa 2,0 mg e carica +4,0 μC parte da ferma e scende di 9,0 V di potenziale. Agisce solo il campo elettrostatico, nel regime non relativistico. Calcola la rapidità finale in m/s.

Procedimento: La carica è positiva e la caduta di potenziale è 9,0 V, quindi l’energia cinetica guadagnata è q·9,0 V=36 μJ. La massa è 2,0×10⁻⁶ kg. Dalla relazione m v²/2=36×10⁻⁶ J ricavo v²=36 m²/s². La rapidità è la radice positiva: 6 m/s. L’energia determina il modulo, non una direzione della velocità priva di dati geometrici.

Passaggi esatti: `\tfrac12mv^2=q(V_i-V_f)\qquad v=6\,\mathrm{m/s}`.

Distrattori: 36 m/s confonde il valore numerico di v² con quello di v. Omettere il fattore due darebbe √18 m/s, non la radice corretta. La massa in milligrammi va convertita in chilogrammi prima del bilancio SI.

Aiuto: Trova prima l’energia cinetica e poi estrai la radice positiva.

Famiglia: `velocita-guadagnata-fra-due-punti`; difficoltà 2; versione 3/base 2.

## C4-Q029

Compito: In due piccole regioni regolari, curve equipotenziali adiacenti differiscono dello stesso intervallo non nullo di potenziale. Confronta la loro distanza lungo il campo, perpendicolare localmente alle curve. Dove è mediamente più intenso il campo?

Procedimento: Per lo stesso modulo di differenza di potenziale, una distanza minore lungo il campo richiede un modulo medio maggiore: |ΔV|/d è maggiore. È un confronto della variazione del potenziale con lo spazio, non del singolo valore rispetto allo zero convenzionale. La direzione di confronto è specificata per non usare una distanza obliqua arbitraria.

Passaggi esatti: `E_{\rm medio}=\frac{|\Delta V|}{d}`.

Distrattori: La spaziatura maggiore distribuirebbe lo stesso intervallo su più spazio e ridurrebbe il valore medio. La scelta dello zero non cambia il campo. Qui l’intervallo è esplicitamente non nullo e uguale nelle due regioni.

Aiuto: Confronta lo stesso salto di potenziale distribuito su due diverse distanze.

Famiglia: `campi-e-curve-di-livello`; difficoltà 2; versione 3/base 2.

## C4-Q030

Compito: Per calcolare l’energia elettrostatica di quattro cariche puntiformi non nulle in posizioni distinte, sommando i contributi a coppie, quanti termini distinti devi includere?

Procedimento: La prima carica forma tre coppie con le successive; la seconda altre due non ancora contate; la terza una con la quarta. Il totale è 3+2+1=6. In alternativa uso 4·3/2: il divisore due evita di contare due volte la stessa coppia in ordine inverso. Non si aggiungono termini di autoenergia nel modello richiesto.

Passaggi esatti: `N_{\rm coppie}=\frac{4\cdot3}{2}=6`.

Distrattori: 12 conta sia (1,2) sia (2,1) come termini differenti, duplicando il contributo della stessa coppia. Quattro confonde il numero delle cariche con quello delle interazioni a coppie. Non c’è una coppia di una carica con sé stessa in questa somma.

Aiuto: Elenca prima le coppie con la prima carica, poi soltanto quelle ancora mancanti.

Famiglia: `numero-di-coppie-in-una-configurazione`; difficoltà 2; versione 2/base 1.
