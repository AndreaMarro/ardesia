# cric-c1-l004

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C1-Q031

Compito: Un carrello ha velocità iniziale v₀=+4 m/s e accelerazione costante a=−2 m/s². Quanti metri percorre fino al primo arresto? Non prolungare il modello oltre quell’istante.

Procedimento: Chiamo T il tempo del primo arresto: pongo v₀+aT=0 e ottengo T=2 s. Fino a quel momento la velocità resta non negativa e la distanza coincide con lo spostamento. Nel grafico v–t l’area è un triangolo: metà della base 2 s per l’altezza 4 m/s dà 4 m.

Passaggi esatti: `0=v_0+aT\qquad T=\frac4{2}\,\mathrm s\qquad T=2\,\mathrm s\qquad D=\frac12(2\,\mathrm s)(4\,\mathrm{m/s})\qquad D=4\,\mathrm m`.

Distrattori: 8 m tratta il moto come se mantenesse 4 m/s per 2 s. 2 è il tempo in secondi, non la distanza in metri. 16 m non include il divisore 2|a| nella relazione di arresto. Una distanza non è negativa:−4 m assegnerebbe il segno dell’accelerazione ai metri percorsi.

Aiuto: Trova prima la base del triangolo v–t imponendo v=0.

Famiglia: `arresto-a-decelerazione-costante`; difficoltà 2; versione 2/base 1.

## C1-Q032

Compito: Un punto è lanciato obliquamente con componente orizzontale iniziale non nulla. In un riferimento terrestre inerziale approssimato, senza aria e con gravità uniforme verso il basso, che cosa accade al punto più alto?

Procedimento: Scelgo y positivo verso l’alto. Nel moto senza aria non c’è accelerazione orizzontale, perciò v_x resta uguale al valore iniziale non nullo. Al massimo della quota la componente verticale cambia segno passando per zero. La gravità però continua ad agire: a_y=−g anche nell’istante in cui v_y=0.

Passaggi esatti: `v_x=v_{0x}\qquad v_y=0\qquad a_x=0\qquad a_y=-g`.

Distrattori: Essere al punto più alto non annulla l’intero vettore velocità: resta la componente orizzontale. L’accelerazione non si annulla né diventa tangente. Il segno della quota non è il segno della velocità verticale: il punto può trovarsi in alto mentre sale, scende o attraversa il culmine.

Aiuto: Separa le componenti e domanda quale interazione continua ad agire.

Famiglia: `la-cima-della-traiettoria`; difficoltà 2; versione 2/base 1.

## C1-Q033

Compito: Una pallina parte verticalmente verso l’alto con v₀=6 m/s. Trascurando l’aria e ponendo g=10 m/s² costante, dopo quanto tempo positivo T ritorna alla quota di lancio?

Procedimento: Pongo l’origine della quota al punto di lancio e verso positivo in alto. La legge verticale è y=v₀t−gt²/2. Il ritorno richiede y=0: raccolgo t e distinguo la soluzione iniziale t=0 da quella positiva T=2 v₀/g. Il conto 12/10 si semplifica in 6/5 s.

Passaggi esatti: `y=v_0t-\frac12gt^2\qquad 0=t\left(v_0-\frac12gt\right)\qquad T=\frac{2v_0}{g}\qquad T=\frac65\,\mathrm s`.

Distrattori: 3/5 s è il solo tempo di salita v₀/g; serve altrettanto tempo per tornare alla stessa quota. 3 s non soddisfa l’equazione. 5/6 s inverte il valore numerico della durata. Zero è l’istante iniziale, escluso dalla richiesta di un ritorno positivo.

Aiuto: Le due radici rappresentano eventi diversi: partenza e ritorno.

Famiglia: `ritorno-alla-quota-di-partenza`; difficoltà 2; versione 2/base 1.

## C1-Q034

Compito: Un corpo cade da fermo nel vuoto con g=10 m/s² costante. Il suolo è abbastanza lontano da non essere raggiunto entro 2 s. Quale distanza percorre fra t=1 s e t=2 s, misurati dal rilascio?

Procedimento: Chiamo s(t) la distanza scesa dal punto iniziale, positiva verso il basso. Da fermo s=gt²/2. Dopo 1 s il corpo è sceso 5 m e dopo 2 s 20 m. L’intervallo richiesto contiene solo la differenza 20−5=15 m, non tutta la caduta dall’inizio.

Passaggi esatti: `s(t)=\frac12gt^2\qquad s(1\,\mathrm s)=5\,\mathrm m\qquad s(2\,\mathrm s)=20\,\mathrm m\qquad \Delta s=15\,\mathrm m`.

Distrattori: 20 m è la distanza cumulativa nei primi 2 s. 5 m è quella nel primo secondo;10 m suppone una distanza uguale in ciascun secondo pur con velocità crescente. 25 m somma le due letture invece di sottrarle.

Aiuto: Calcola due posizioni dalla stessa origine e poi fai la differenza.

Famiglia: `caduta-durante-il-secondo-secondo`; difficoltà 3; versione 3/base 2.

## C1-Q035

Compito: Due sfere partono simultaneamente dalla stessa altezza h>0 sopra lo stesso suolo orizzontale. Una è lasciata cadere da ferma, l’altra è lanciata orizzontalmente. Senza aria, con uguale gravità uniforme, quale tocca prima il suolo?

Procedimento: Entrambe hanno velocità verticale iniziale nulla, stessa quota iniziale e stessa accelerazione verticale. Chiamo s_y la distanza verticale scesa e T il tempo di arrivo: la condizione h=gT²/2 è identica. La velocità orizzontale cambia la posizione di atterraggio, non il tempo in questo modello.

Passaggi esatti: `s_y=\frac12gt^2\qquad h=\frac12gT^2\qquad T=\sqrt{\frac{2h}{g}}`.

Distrattori: Né l’assenza né la presenza di velocità orizzontale cambia l’equazione verticale. Il maggior cammino obliquo non significa maggiore tempo perché anche la velocità totale è diversa. La massa non entra nell’accelerazione gravitazionale assegnata; l’aria e ostacoli diversi sono esclusi.

Aiuto: Scrivi soltanto la legge verticale delle due sfere e confrontale.

Famiglia: `una-coppia-di-lanci`; difficoltà 2; versione 2/base 1.

## C1-Q036

Compito: Una piattaforma ruota uniformemente a 30 giri/min. Quanto dura un giro completo, cioè il periodo T?

Procedimento: Trenta giri si compiono in 60 s: dividendo il tempo totale per il numero dei giri, T=60/30=2 s. In alternativa la frequenza è 30/60=1/2 Hz e il periodo è il suo reciproco. Il conteggio dei giri è puro, la durata ha unità di tempo.

Passaggi esatti: `f=\frac{30}{60}\,\mathrm{Hz}\qquad f=\frac12\,\mathrm{Hz}\qquad T=\frac1f\qquad T=2\,\mathrm s`.

Distrattori: 30 s copia il numero dei giri al minuto senza invertirlo. 1/2 è il valore numerico della frequenza in hertz, non il periodo in secondi. 60 s è la durata di 30 giri. 1800 s moltiplica 30 per 60 invece di dividere.

Aiuto: Il periodo è tempo per un giro; la frequenza è giri per tempo.

Famiglia: `lettura-dei-giri-al-minuto`; difficoltà 2; versione 2/base 1.

## C1-Q037

Compito: Un punto si muove su una circonferenza con rapidità v=3,0 m/s e accelerazione centripeta a_c=4,5 m/s². Quanto vale il raggio r?

Procedimento: La componente centripeta soddisfa a_c=v²/r. Moltiplico per r e divido per a_c>0: r=v²/a_c. Il quadrato di 3 è 9 e 9/(9/2)=2. Le unità danno (m²/s²)/(m/s²)=m, come richiesto per un raggio.

Passaggi esatti: `a_cr=v^2\qquad r=\frac{v^2}{a_c}\qquad r=\frac9{9/2}\,\mathrm m\qquad r=2\,\mathrm m`.

Distrattori: 1/2 m inverte il rapporto numerico;3/2 m darebbe a_c=6 m/s² anziché 9/2 m/s². 9 m copia v² senza dividere per l’accelerazione. 6 m non soddisfa a_c r=v².

Aiuto: Isola r prima di sostituire e controlla le unità del quoziente.

Famiglia: `raggio-dalla-curvatura-nota`; difficoltà 2; versione 2/base 1.

## C1-Q038

Compito: Un disco rigido ruota uniformemente con velocità angolare ω non nulla. Due punti sono solidali al disco, a distanze r>0 e 2 r dall’asse. Qual è il rapporto a_c(2 r)/a_c(r)?

Procedimento: I punti compiono ciascun giro nello stesso tempo: condividono ω, non la rapidità tangenziale. Uso quindi a_c=ω²r. Raddoppiando il raggio a ω fissa raddoppia a_c. La forma v²/r resta valida ma in quel confronto anche v=ωr raddoppia.

Passaggi esatti: `a_c(r)=\omega^2r\qquad a_c(2r)=2\omega^2r\qquad \frac{a_c(2r)}{a_c(r)}=2`.

Distrattori: 1/2 manterrebbe erroneamente v costante al cambiare del raggio. 4 considera soltanto il quadrato della rapidità e dimentica che anche il denominatore r raddoppia. 1 confonde uguale ω con uguale accelerazione;1/4 inverte un rapporto quadratico che qui non vale.

Aiuto: Scegli la forma della legge che usa la grandezza effettivamente comune:ω.

Famiglia: `due-punti-sullo-stesso-disco`; difficoltà 2; versione 2/base 1.

## C1-Q039

Compito: Un punto percorre una circonferenza con raggio r>0 e rapidità v>0 costante. Verso dove è diretta la sua accelerazione?

Procedimento: La rapidità è costante ma il vettore velocità cambia direzione. Il cambiamento istantaneo è rivolto verso il centro: è l’accelerazione centripeta di modulo v²/r. Non è necessario che la forza che la produce abbia un nuovo nome: può essere una tensione o un’altra interazione reale.

Passaggi esatti: `a_c=\frac{v^2}{r}>0`.

Distrattori: La tangente è la direzione della velocità, non dell’accelerazione nel moto uniforme. Una componente tangenziale cambierebbe la rapidità. Il verso esterno è opposto a quello centripeto. Velocità vettoriale costante sarebbe moto rettilineo uniforme, non moto su un cerchio di raggio finito.

Aiuto: Confronta due velocità vicine sulla curva: cambia il loro verso.

Famiglia: `verso-dellaccelerazione-normale`; difficoltà 1; versione 3/base 2.

## C1-Q040

Compito: La posizione segue x(t)=1 m+(2 m/s)t+(3 m/s²)t². Qual è la velocità all’istante t=2 s?

Procedimento: La velocità è la derivata della posizione rispetto al tempo. Il termine costante 1 m scompare, il termine lineare dà 2 m/s e il termine quadratico dà due volte il coefficiente 3 m/s² per t. A 2 s il contributo variabile è 12 m/s: sommando quello iniziale si ottiene 14 m/s.

Passaggi esatti: `v(t)=2\,\mathrm{m/s}+(6\,\mathrm{m/s^2})t\qquad v(2\,\mathrm s)=(2+12)\,\mathrm{m/s}\qquad v(2\,\mathrm s)=14\,\mathrm{m/s}`.

Distrattori: 17 è il valore numerico di x(2 s) in metri, non una velocità. 8 m/s deriva da 2+3·2: omette il fattore 2 nella derivata di t², mantenendo t;12 m/s ignora il contributo iniziale 2 m/s. 6 è il valore numerico dell’accelerazione in m/s², non della velocità a 2 s.

Aiuto: La derivata di t² è 2 t: conserva il coefficiente e le sue unità.

Famiglia: `trovare-la-velocita-del-fotogramma`; difficoltà 3; versione 2/base 1.

## Geometria, riletture e limiti

Arresto:160 coordinate/s e60 coordinate per m/s, triangolo di area4 m fino aT2 s. Quota:300 coordinate/s e100 coordinate/m, Bézier quadratica esatta M1201030 Q3006704801030 pery=6t−5t²; vertice(3/5 s,9/5 m), ritorno6/5 s. Disco: raggi80/160 e vettori50/100, rapporto2 in scala comune. Etichetta a₂ spostata nella corona senza cambiare geometria; vecchia resa completa reale0 conservata, nuova resa reale0 letta. Nessun confronto di scale fra pannelli. Riletti i feedback Q037 e Q040: 3/2 m ricostruisce6 m/s² anziché9/2; 8 m/s deriva da2+3·2 omettendo il fattore2 della derivata. Chiavi, formule e SVG identici; vecchi byte conservati.

Stato SCI proprio, UI prodotto e human NOT_RUN; nessun credito di integrazione. Le prove strutturali appartengono soltanto ai payload finali descritti dal loro hash.
