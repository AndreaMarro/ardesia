# cric-c1-l002

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C1-Q011

Compito: Una forza di modulo F=12 N forma un angolo θ=120° misurato in senso antiorario da +x. Qual è la componente F_x, con il suo segno?

Procedimento: Proietto la forza sull’asse x con il coseno, perché l’angolo parte da quell’asse. 120°=180°−60° e cos 120°=−cos 60°=−1/2. La punta è nel secondo quadrante: il segno negativo della componente è coerente con il disegno, anche se il modulo della forza è positivo.

Passaggi esatti: `F_x=F\cos\theta\qquad \cos120^\circ=-\frac12\qquad F_x=12\left(-\frac12\right)\,\mathrm N\qquad F_x=-6\,\mathrm N`.

Distrattori: 6 N perde il verso negativo. −12 N proietta come se tutta la forza fosse lungo −x. 6√3 N è il valore della componente y, non x. Zero richiederebbe una forza perpendicolare a x, cioè 90° o 270°.

Aiuto: Il coseno è negativo nel secondo quadrante; usa il valore notevole di 60°.

Famiglia: `la-proiezione-allindietro`; difficoltà 2; versione 2/base 1.

## C1-Q012

Compito: Si compiono due spostamenti sulla stessa retta: prima 7 m a ovest, poi 11 m a est. Qual è lo spostamento risultante?

Procedimento: Scelgo est positivo e chiamo R la componente dello spostamento totale. Ovest corrisponde allora a−7 m, est a+11 m. La somma con segno vale+4 m. La distanza percorsa sarebbe 18 m, ma la risultante confronta posizione finale e iniziale.

Passaggi esatti: `R=(-7+11)\,\mathrm m\qquad R=4\,\mathrm m`.

Distrattori: 18 m somma i moduli e descrive il cammino, non lo spostamento risultante. 4 m a ovest scambia il verso della differenza;18 m a ovest sbaglia anche il segno. La risultante sarebbe nulla soltanto con tratti opposti ugualmente lunghi.

Aiuto: Assegna un segno a ciascun verso prima di sommare.

Famiglia: `risultante-di-versi-opposti`; difficoltà 2; versione 2/base 1.

## C1-Q013

Compito: Due vettori hanno componenti A=(2,−3) m e B=(5,1) m in assi cartesiani ortogonali. Quanto vale il modulo di D=B−A?

Procedimento: La differenza si fa componente per componente: sottrarre−3 nella seconda componente equivale ad aggiungere 3. Ottengo D=(3,4) m. Solo dopo calcolo il modulo con Pitagora:9+16=25 e la radice positiva è 5. Il modulo non conserva un segno negativo della sottrazione.

Passaggi esatti: `D_x=(5-2)\,\mathrm m\qquad D_x=3\,\mathrm m\qquad D_y=(1+3)\,\mathrm m\qquad D_y=4\,\mathrm m\qquad |D|=\sqrt{3^2+4^2}\,\mathrm m\qquad |D|=5\,\mathrm m`.

Distrattori: 7 m somma 3 e 4 come fossero allineati. √13 m usa−2 nella seconda componente, dimenticando il doppio segno;√53 m corrisponde al modulo della somma A+B=(7,−2) m. −5 m non può essere un modulo.

Aiuto: Scrivi esplicitamente 1−(−3), poi usa il triangolo 3–4–5.

Famiglia: `differenza-fra-due-letture`; difficoltà 2; versione 3/base 2.

## C1-Q014

Compito: Due vettori A e B sono entrambi non nulli e A·B=0. Quale relazione hanno le loro direzioni?

Procedimento: Il prodotto scalare è il prodotto dei moduli per il coseno dell’angolo α fra i vettori. Poiché entrambi i moduli sono diversi da zero, posso dividere per il loro prodotto. Rimane cosα=0 e, per 0°≤α≤180°, α=90°. Non occorre che i moduli siano uguali.

Passaggi esatti: `A\cdot B=|A||B|\cos\alpha\qquad \cos\alpha=0\qquad \alpha=90^\circ`.

Distrattori: Per paralleli concordi il coseno è 1, per opposti è−1: con moduli non nulli il prodotto non sarebbe zero. Uguaglianza dei moduli e ortogonalità sono proprietà diverse. L’ultima alternativa contraddice esplicitamente il dato dei due vettori non nulli.

Aiuto: Controlla quale fattore può annullarsi senza contraddire l’enunciato.

Famiglia: `vettori-ortogonali`; difficoltà 1; versione 2/base 1.

## C1-Q015

Compito: In una terna cartesiana destrorsa, A è non nullo e diretto lungo +x, B è non nullo e diretto lungo +y. Dove punta A×B?

Procedimento: Uso l’ordine scritto, prima A poi B. Nella terna destrorsa la rotazione da+x a+y associa il pollice lungo+z. Il prodotto vettoriale è perpendicolare al piano xy e il suo modulo è il prodotto dei moduli, perché l’angolo è 90°. Invertire l’ordine cambierebbe il verso.

Passaggi esatti: `\hat e_x\times\hat e_y=\hat e_z\qquad |A\times B|=|A||B|`.

Distrattori: −z descrive B×A, non A×B. +x e+y giacciono nel piano dei vettori e non possono essere la normale non nulla. Il prodotto nullo si avrebbe per vettori paralleli oppure nulli, entrambe condizioni escluse.

Aiuto: La mano destra deve seguire l’ordine A poi B.

Famiglia: `il-verso-della-normale`; difficoltà 2; versione 2/base 1.

## C1-Q016

Compito: Una fune rettilinea lunga ℓ=2,4 m forma 30° con la verticale. Qual è la distanza orizzontale d fra i suoi estremi?

Procedimento: La fune è l’ipotenusa del triangolo rettangolo. Rispetto all’angolo misurato dalla verticale, il cateto orizzontale è quello opposto: serve il seno, non il coseno. Poiché sin 30°=1/2, metà di 2,4 m dà 1,2 m. La proiezione è minore della lunghezza della fune.

Passaggi esatti: `d=\ell\sin30^\circ\qquad d=\frac{2{,}4}{2}\,\mathrm m\qquad d=1{,}2\,\mathrm m`.

Distrattori: 2,4 m dimentica la proiezione;1,2√3 m è la distanza verticale. 4,8 m supera l’ipotenusa e nasce dividendo per 1/2. 0,8 m dividerebbe per 3 invece di usare il seno dell’angolo.

Aiuto: Individua il cateto opposto all’angolo disegnato dalla verticale.

Famiglia: `un-angolo-misurato-dalla-verticale`; difficoltà 2; versione 2/base 1.

## C1-Q017

Compito: Due vettori non nulli hanno moduli a e b fissati. In quale configurazione il modulo della loro somma è massimo?

Procedimento: Chiamo α l’angolo fra i vettori con le code coincidenti. Il quadrato del modulo risultante è a²+b²+2 ab cosα. a e b sono positivi e fissi, quindi cresce con cosα. Il valore massimo del coseno è 1: si ottiene per α=0°, vettori paralleli nello stesso verso, e il modulo totale è a+b.

Passaggi esatti: `|A+B|^2=a^2+b^2+2ab\cos\alpha\qquad \cos\alpha\le1\qquad |A+B|\le a+b`.

Distrattori: Versi opposti danno |a−b|, non il massimo. A 90° manca il contributo 2 ab, a 120° quel contributo è negativo. Moduli uguali non sono necessari: anche vettori di moduli diversi raggiungono il loro massimo quando concordi.

Aiuto: Quale angolo fa assumere al coseno il suo valore massimo?

Famiglia: `somma-di-moduli-massima`; difficoltà 1; versione 2/base 1.

## C1-Q018

Compito: Una rampa rettilinea sale di h=0,45 m ogni d=3,0 m orizzontali. Quanto vale tanθ, con θ angolo rispetto al pavimento orizzontale?

Procedimento: Nel triangolo della rampa la tangente è cateto verticale su cateto orizzontale. Non divido per la lunghezza obliqua: quello sarebbe un seno. Il rapporto 0,45/3 si può fare come 45/300=3/20. Le unità di lunghezza si cancellano, quindi la tangente è pura.

Passaggi esatti: `\tan\theta=\frac hd\qquad \tan\theta=\frac{45}{300}\qquad \tan\theta=\frac3{20}`.

Distrattori: 20/3 inverte i cateti. 3/2 perde un fattore dieci;9/20 conserva 45/100 senza dividere per 3. 3/5 non è il rapporto dei cateti assegnati. Nessuna valutazione dell’angolo in gradi è richiesta.

Aiuto: Usa la distanza orizzontale, non la lunghezza della rampa.

Famiglia: `quanto-vale-la-pendenza`; difficoltà 2; versione 2/base 1.

## C1-Q019

Compito: Una forza costante F=(3,4) N agisce durante uno spostamento s=(2,−1) m in assi ortogonali. Calcola F·s.

Procedimento: Moltiplico le componenti lungo lo stesso asse e sommo i due prodotti con segno. Il contributo x è 3·2=6 J, quello y è 4·(−1)=−4 J. La componente y della forza contrasta lo spostamento y, riducendo il risultato a 2 J. Non moltiplico semplicemente i moduli.

Passaggi esatti: `F\cdot s=F_xs_x+F_ys_y\qquad F\cdot s=(6-4)\,\mathrm J\qquad F\cdot s=2\,\mathrm J`.

Distrattori: 10 J sostituisce il segno negativo con un più. −2 J inverte il segno globale;5√5 J è il prodotto dei moduli 5 N e√5 m senza il coseno necessario. 6 J ignora del tutto il contributo y.

Aiuto: Due componenti con segni opposti danno un contributo negativo.

Famiglia: `prodotto-con-componenti-note`; difficoltà 2; versione 2/base 1.

## C1-Q020

Compito: Una forza non nulla ha componenti F_x=F_y<0. Quanto vale il suo angolo θ antiorario da+x, scelto in 0°≤θ<360°?

Procedimento: Il rapporto F_y/F_x è 1, ma la tangente non distingue quadranti opposti. Entrambe le componenti negative collocano la forza nel terzo quadrante. L’angolo di riferimento è 45°, perché i moduli dei cateti sono uguali. Aggiungo quindi 180° e ottengo 225°.

Passaggi esatti: `\frac{F_y}{F_x}=1\qquad \theta=180^\circ+45^\circ\qquad \theta=225^\circ`.

Distrattori: 45° ha entrambe le componenti positive. 135° ha y positivo e x negativo;315° ha x positivo e y negativo. A 180° la componente y sarebbe zero, mentre qui è negativa e non nulla.

Aiuto: Prima identifica il quadrante dai segni, poi usa l’angolo di riferimento.

Famiglia: `due-direzioni-con-la-stessa-tangente`; difficoltà 3; versione 2/base 1.

## Geometria, riletture e limiti

Forza: 20 coordinate/N, vettore lungo 240 a120° e proiezione−120. Differenza:40 coordinate/m per entrambi gli assi, A=(300,1020), B=(420,860), origine=(220,900). Fune con angolo30°, lunghezza277,128 e proiezione138,564: rapporto1/2. Scale comparabili soltanto entro il pannello. Corretto il distrattore Q013: norm(3,−2)=√13, non√17. Vecchio package/binding/modulo/nota/handoff conservati. La chiave resta5 m. Normalizzati soltanto gli spazi della prosa e delle label; nuovo native intero reale0 letto.

Stato SCI proprio, UI prodotto e human NOT_RUN; nessun credito di integrazione. Le prove strutturali appartengono soltanto ai payload finali descritti dal loro hash.
