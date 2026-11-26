# cric-c1-l003

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C1-Q021

Compito: Un punto si trova a x₀=−12 m all’istante t=0. Si muove lungo x con velocità costante v=+2,5 m/s. Qual è la sua coordinata dopo 8,0 s?

Procedimento: Uso il moto rettilineo uniforme: la variazione di posizione è v t, ma la coordinata finale comprende anche x₀. Il prodotto 2,5·8=20 m è lo spostamento positivo. Aggiungendolo a−12 m si arriva a+8 m: il punto ha superato l’origine, senza che il cammino di 20 m coincida con la coordinata 8 m.

Passaggi esatti: `\Delta x=vt\qquad \Delta x=20\,\mathrm m\qquad x=x_0+\Delta x\qquad x=(-12+20)\,\mathrm m\qquad x=8\,\mathrm m`.

Distrattori: 20 m dimentica la posizione iniziale;−32 m attribuisce al moto il verso negativo. 32 m sostituisce−12 con+12. −8 m cambia il segno del risultato nonostante il punto si sia spostato 20 m a partire da−12 m.

Aiuto: Distinguere la posizione iniziale dallo spostamento evita di perdere il segno.

Famiglia: `partenza-lontano-dallorigine`; difficoltà 2; versione 2/base 1.

## C1-Q022

Compito: Un carrello percorre 12 m a 2 m/s e poi altri 12 m a 3 m/s, sempre nello stesso verso e senza soste. Quanto vale la velocità media sull’intero percorso?

Procedimento: La media orientata è spostamento totale diviso tempo totale. Non faccio la media aritmetica delle due velocità perché i tempi non sono uguali. Chiamo t₁ e t₂ i tempi dei due tratti:12/2=6 s e 12/3=4 s. Il carrello percorre 24 m in 10 s: semplificando 24/10 ottengo 12/5 m/s.

Passaggi esatti: `t_1=\frac{12}{2}\,\mathrm s\qquad t_1=6\,\mathrm s\qquad t_2=4\,\mathrm s\qquad \bar v=\frac{24}{10}\,\mathrm{m/s}\qquad \bar v=\frac{12}{5}\,\mathrm{m/s}`.

Distrattori: 5/2 m/s è la media aritmetica delle rapidità, valida per tempi uguali, qui 6 s e 4 s. 5 m/s somma le rapidità;6/5 m/s considera solo 12 m pur contando tutto il tempo. 2 m/s mantiene la sola velocità del primo tratto.

Aiuto: Calcola prima quanto dura ciascun tratto di 12 m.

Famiglia: `due-tratti-di-pari-lunghezza`; difficoltà 2; versione 2/base 1.

## C1-Q023

Compito: In un intervallo di un grafico v–t, la curva resta sotto zero e sale verso l’asse del tempo con pendenza positiva. Come si muove il punto in quell’intervallo?

Procedimento: La quota verticale del grafico è la velocità, non la posizione. v<0 significa moto verso coordinate x minori. Mentre v cresce verso zero, il suo modulo |v| diminuisce: il punto rallenta. La pendenza positiva indica accelerazione positiva, opposta alla velocità nell’intervallo descritto.

Passaggi esatti: `v<0\qquad a>0\qquad |v|=-v`.

Distrattori: Salire nel grafico v–t non significa andare verso x crescenti: quello richiede v>0. Con velocità negativa crescente la rapidità non aumenta. Il punto è fermo solo dove v=0. Il segno della posizione non si ricava dal segno della velocità senza una condizione iniziale.

Aiuto: Leggi separatamente il segno della quota v e quello della pendenza.

Famiglia: `un-grafico-sotto-lo-zero`; difficoltà 2; versione 3/base 2.

## C1-Q024

Compito: In un grafico posizione–tempo x–t la funzione x(t) è derivabile nell’istante osservato. Quale retta locale permette di ricavare la velocità istantanea dalla sua pendenza?

Procedimento: Una secante fornisce la velocità media fra i suoi due istanti. Per la velocità istantanea si avvicina il secondo istante al primo: nel limite, esistente per ipotesi, la secante diventa tangente. La pendenza va letta come variazione di x divisa per variazione di t, con unità m/s.

Passaggi esatti: `\bar v=\frac{\Delta x}{\Delta t}\qquad v(t)=\frac{dx}{dt}`.

Distrattori: Una secante su un intervallo finito misura una media. Una orizzontale imporrebbe velocità nulla anche dove il grafico è inclinato. La retta dall’origine vale solo in casi particolari, non in generale. La normale ha pendenza diversa e non rappresenta dx/dt.

Aiuto: Immagina di restringere l’intervallo usato per la secante.

Famiglia: `una-lettura-allistante`; difficoltà 1; versione 2/base 1.

## C1-Q025

Compito: Si descrive lo stesso moto usando un nuovo asse con origine spostata di 5 m verso destra rispetto alla vecchia, ma stesso verso, stessa unità e stessi tempi. Quale quantità cambia?

Procedimento: Chiamo x la vecchia coordinata e x′ la nuova. Il punto che prima era a+5 m diventa la nuova origine: x′=x−5 m. Nella differenza fra due posizioni la costante si cancella; anche derivando rispetto al tempo la costante scompare. Cambia quindi la coordinata, mentre il moto fisico e le variazioni restano uguali.

Passaggi esatti: `x\prime=x-5\,\mathrm m\qquad \Delta x\prime=\Delta x\qquad v\prime=v\qquad a\prime=a`.

Distrattori: Spostamento, velocità e accelerazione non cambiano per una traslazione spaziale costante. Anche la distanza percorsa confronta tratti reali e resta la stessa. Non si è cambiato il verso positivo né introdotto un riferimento che si muove nel tempo.

Aiuto: Sottrai la stessa costante a entrambe le posizioni estreme.

Famiglia: `traslare-lorigine-spaziale`; difficoltà 2; versione 2/base 1.

## C1-Q026

Compito: Due punti sullo stesso asse seguono x_A=(2 m/s)t e x_B=15 m−(1 m/s)t, con t≥0 e t=0 comune. A quale istante si incontrano?

Procedimento: L’incontro richiede uguaglianza delle posizioni allo stesso tempo, non uguaglianza delle velocità. Porto al primo membro i termini con t: la velocità relativa di avvicinamento è 3 m/s. I 15 m iniziali vengono chiusi in 15/3=5 s. Sostituendo, entrambi i punti sono a 10 m.

Passaggi esatti: `x_A=x_B\qquad (3\,\mathrm{m/s})t=15\,\mathrm m\qquad t=5\,\mathrm s\qquad x_A=x_B=10\,\mathrm m`.

Distrattori: 15 s usa soltanto 1 m/s;15/2 s usa soltanto 2 m/s. 10 è la coordinata comune in metri, non il tempo in secondi. −5 s non soddisfa l’equazione né il dominio t≥0.

Aiuto: Uguaglia le coordinate e somma le velocità di avvicinamento.

Famiglia: `intersezione-di-due-leggi-orarie`; difficoltà 3; versione 2/base 1.

## C1-Q027

Compito: Un sensore registra velocità +3 m/s per 4 s, poi−2 m/s per 5 s sulla stessa retta. L’inversione fra i tratti è idealizzata istantanea. Qual è lo spostamento complessivo?

Procedimento: Chiamo Δx₁ e Δx₂ gli spostamenti nei due tratti. Ognuno è l’area con segno del rettangolo nel grafico v–t:3·4=12 m e−2·5=−10 m. Il totale è+2 m. Se chiedessi la distanza percorsa, sommerei invece i moduli 12+10=22 m.

Passaggi esatti: `\Delta x_1=12\,\mathrm m\qquad \Delta x_2=-10\,\mathrm m\qquad \Delta x=(12-10)\,\mathrm m\qquad \Delta x=2\,\mathrm m`.

Distrattori: 22 m ignora il segno del secondo tratto;−22 m li rende entrambi negativi. −2 m inverte la sottrazione. 7 m non è la somma delle due aree: non si possono mescolare durate e velocità senza rispettare i prodotti.

Aiuto: Le aree sotto l’asse del tempo devono entrare con segno meno.

Famiglia: `aree-di-segno-opposto`; difficoltà 2; versione 3/base 2.

## C1-Q028

Compito: Si confrontano due grafici: x–t e v–t. In ciascuno la linea è orizzontale e strettamente sopra zero. Quale interpretazione è corretta?

Procedimento: Nel primo grafico la quota è una posizione costante x_c>0, quindi la pendenza e la velocità sono zero. Nel secondo la quota è una velocità costante v_c>0: il punto si sposta nel verso positivo e l’accelerazione è zero. Il segno della posizione di quel secondo moto non è specificato.

Passaggi esatti: `x(t)=x_c>0\qquad v=0\qquad v(t)=v_c>0\qquad a=0`.

Distrattori: Una linea orizzontale annulla la derivata della grandezza in ordinata, non sempre la velocità. Nel grafico v–t è l’accelerazione a essere nulla. v positivo non fissa il segno della posizione: il punto potrebbe trovarsi anche a x negativo e avanzare verso l’origine.

Aiuto: Prima di interpretare la forma, leggi il nome sull’asse verticale.

Famiglia: `tratto-orizzontale-in-due-grafici`; difficoltà 2; versione 3/base 2.

## C1-Q029

Compito: La velocità su un asse cambia da v_i=−3 m/s a v_f=+1 m/s in Δt=2,0 s. Quanto vale l’accelerazione media con il suo segno?

Procedimento: L’accelerazione media usa la variazione orientata v_f−v_i, non la differenza dei moduli delle velocità. Qui 1−(−3)=4 m/s: il cambio di verso non cancella una parte della variazione. Dividendo 4 m/s per 2 s si ottiene+2 m/s². Non serve supporre accelerazione costante per questa media.

Passaggi esatti: `\Delta v=(1+3)\,\mathrm{m/s}\qquad \Delta v=4\,\mathrm{m/s}\qquad \bar a=\frac{4}{2}\,\mathrm{m/s^2}\qquad \bar a=2\,\mathrm{m/s^2}`.

Distrattori: −1 m/s² deriva da (|v_f|−|v_i|)/Δt=(1−3)/2: l’errore è usare i moduli al posto delle componenti orientate;1 m/s² perde la variazione attraverso lo zero. −2 m/s² scambia finale e iniziale. 4 m/s² copia il valore numerico di Δv senza dividere per i 2 s.

Aiuto: Sottrarre una velocità negativa equivale ad aggiungerne il modulo.

Famiglia: `una-variazione-durante-la-retromarcia`; difficoltà 2; versione 2/base 1.

## C1-Q030

Compito: Quale nome indica l’insieme delle posizioni attraversate da un punto nello spazio durante il moto?

Procedimento: La traiettoria è il luogo geometrico delle posizioni occupate. La legge oraria aggiunge l’associazione fra ciascun istante e una posizione, indicata dal vettore r(t). Conoscere solo la forma della traiettoria non dice con quale rapidità venga percorsa.

Passaggi esatti: `\vec r=\vec r(t)`.

Distrattori: La legge oraria include il tempo, mentre la traiettoria è la curva nello spazio. Un grafico v–t ha assi velocità e tempo, non coordinate spaziali. Lo spostamento collega due posizioni estreme e può essere lo stesso per traiettorie diverse. L’accelerazione descrive la variazione della velocità.

Aiuto: Distingui la strada geometrica dal calendario del passaggio nei suoi punti.

Famiglia: `la-curva-nello-spazio-reale`; difficoltà 1; versione 2/base 1.

## Geometria, riletture e limiti

Primo grafico80 coordinate/s e60 coordinate per m/s, da(0,−3) a(2,−1). Secondo40 coordinate/s e12 coordinate/m: intersezione(5 s,10 m). Terzo40 coordinate/s e40 coordinate per m/s, aree orientate12 e−10 m. Nuova resa completa dopo due soli spostamenti delle etichette2 e v(m/s). Q029 ora attribuisce−1 al rapporto delle differenze dei moduli, non a un ordine invertito. Vecchi artefatti conservati; chiavi e leggi immutate.

Stato SCI proprio, UI prodotto e human NOT_RUN; nessun credito di integrazione. Le prove strutturali appartengono soltanto ai payload finali descritti dal loro hash.
