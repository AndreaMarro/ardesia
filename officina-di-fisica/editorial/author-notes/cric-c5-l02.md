# cric-c5-l02

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C5.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C5-Q011

Compito: Una fotografia di un’onda sinusoidale su una corda mostra 18 cm, lungo la corda, fra una cresta e la valle immediatamente successiva. Qual è la lunghezza d’onda in centimetri?

Procedimento: Una cresta e la valle subito successiva sono separate da mezzo ciclo spaziale. Un altro tratto uguale porta alla cresta seguente, che completa la lunghezza d’onda. Raddoppio quindi 18 cm e ottengo 36 cm. La misura è lungo la corda, non la distanza verticale fra cresta e valle.

Passaggi esatti: `\frac{\lambda}{2}=18\,\mathrm{cm}\qquad \lambda=36\,\mathrm{cm}`.

Distrattori: 18 cm misura soltanto mezza lunghezza d’onda. 9 cm dimezzerebbe ancora quella misura. 72 cm conterebbe due cicli completi; l’ampiezza verticale non entra in questa distanza fra posizioni.

Aiuto: Conta quale frazione di ciclo spaziale separa un massimo dal minimo adiacente.

Famiglia: `cresta-e-valle-adiacente`; difficoltà 1; versione 2/base 1.

## C5-Q012

Compito: Un sensore resta in un punto fisso. Il suo grafico ha tempo t in millisecondi sull’asse orizzontale e pressione in pascal sul verticale. Che cosa misura l’intervallo fra due massimi consecutivi?

Procedimento: Il sensore registra due eventi successivi nello stesso punto. L’intervallo sull’asse dei tempi è il periodo della pressione oscillante. La lunghezza d’onda richiede invece una distanza fra punti diversi osservati allo stesso istante. I millisecondi dell’ascissa permettono di riconoscere quale delle due misure si sta leggendo.

Passaggi esatti: `T=t_{\max,2}-t_{\max,1}`.

Distrattori: L’ampiezza si legge in verticale e ha qui unità pascal. La velocità richiederebbe anche una distanza e non coincide con un tempo. Un grafico della pressione non disegna la traiettoria di una singola molecola.

Aiuto: Leggi l’unità dell’asse prima di dare un nome alla separazione dei massimi.

Famiglia: `etichetta-del-sensore`; difficoltà 1; versione 2/base 1.

## C5-Q013

Compito: Un singolo impulso trasversale passa su una corda ideale lineare e poi si allontana, senza lasciare deformazione residua. Che cosa accade a una macchia d’inchiostro fissata a una porzione della corda?

Procedimento: La macchia individua materia della corda. Al passaggio dell’impulso quella porzione si muove trasversalmente e poi torna all’equilibrio, nelle ipotesi dichiarate. La forma dell’impulso può continuare a propagarsi lontano mentre la materia marcata rimane nella sua regione. Trasporto della perturbazione e moto del mezzo sono descrizioni distinte.

Passaggi esatti: `y(x_0,t)\longrightarrow0`.

Distrattori: Il movimento della forma non trascina ogni porzione di corda fino all’estremità. La permanenza al massimo contraddice il ritorno all’equilibrio dichiarato. Un singolo segno materiale non si divide per il principio di sovrapposizione.

Aiuto: Confronta il moto di una porzione marcata con quello del massimo della forma.

Famiglia: `londa-trasporta-il-segno`; difficoltà 1; versione 2/base 1.

## C5-Q014

Compito: Due punti lungo un’onda sinusoidale progressiva sono separati da 0,12 m. La lunghezza d’onda è 0,48 m. Qual è il modulo della differenza di fase spaziale nello stesso istante?

Procedimento: La distanza assegnata è un quarto della lunghezza d’onda, perché 0,12/0,48=1/4. Un intero ciclo spaziale contiene 2π radianti. Moltiplicando il quarto per 2π trovo π/2 radianti. La fase si confronta simultaneamente nei due punti; non serve un ritardo temporale misurato dal sensore.

Passaggi esatti: `\frac{\Delta x}{\lambda}=\frac14\qquad |\Delta\varphi|=2\pi\frac{\Delta x}{\lambda}\qquad |\Delta\varphi|=\frac\pi2`.

Distrattori: 1/4 rad copia la frazione di ciclo senza convertirla in radianti. π rad descriverebbe mezza lunghezza d’onda e 2π rad una intera. π/4 rad corrisponderebbe a un ottavo di ciclo.

Aiuto: Trasforma la frazione di lunghezza d’onda nella stessa frazione di un giro di fase.

Famiglia: `sfasamento-fra-sensori`; difficoltà 2; versione 2/base 1.

## C5-Q015

Compito: Il massimo di un impulso passa per x=0,40 m a t=0,16 s e per x=1,60 m a t=0,24 s. Qual è la sua velocità media orientata, in metri al secondo?

Procedimento: Lo spostamento della stessa cresta è 1,60−0,40=1,20 m, positivo. Il tempo trascorso è 0,24−0,16=0,08 s. Divido 1,20 per 0,08: moltiplicando entrambi per cento ottengo 120/8=15 m/s. Il risultato descrive la propagazione del massimo, non la velocità trasversale delle porzioni di corda.

Passaggi esatti: `\Delta x=1{,}20\,\mathrm m\qquad \Delta t=0{,}08\,\mathrm s\qquad \overline v=15\,\mathrm{m/s}`.

Distrattori: 20 m/s dividerebbe la posizione finale per il solo intervallo 0,08 s. Usare 1,60/0,24 riferirebbe erroneamente il moto all’origine. Il verso negativo contraddice lo spostamento positivo della cresta fra i due eventi.

Aiuto: Sottrai entrambe le coppie di coordinate prima di costruire il rapporto.

Famiglia: `ritardo-di-arrivo`; difficoltà 2; versione 2/base 1.

## C5-Q016

Compito: Nel regime non dispersivo sulla stessa corda la velocità di propagazione resta positiva e costante. La sorgente triplica la frequenza. Come cambia la distanza fra creste adiacenti?

Procedimento: La distanza fra creste è la lunghezza d’onda. Durante un periodo la forma avanza di λ e vale v=λf. A velocità fissata la nuova frequenza 3f richiede λ_f=v/(3f)=λ_i/3. Una stessa lunghezza di corda contiene quindi tre volte più cicli spaziali.

Passaggi esatti: `v=\lambda f\qquad \frac{\lambda_f}{\lambda_i}=\frac13`.

Distrattori: Triplicare λ aumenterebbe il prodotto λf di un fattore nove e violerebbe v costante. Il fattore 1/9 richiederebbe una frequenza nove volte maggiore. Frequenza e lunghezza d’onda hanno dimensioni diverse.

Aiuto: Isola λ nella relazione fra velocità, frequenza e lunghezza d’onda.

Famiglia: `frequenza-imposta`; difficoltà 2; versione 2/base 1.

## C5-Q017

Compito: Un’onda è descritta da y=A cos(kx−ωt), con x in metri e t in secondi. La lunghezza d’onda è 2,5 m. Qual è il numero d’onda angolare k, esatto in radianti al metro?

Procedimento: La fase cresce di 2π radianti quando x cresce di una lunghezza d’onda. Perciò k=2π/λ. Scrivo 2,5 m come 5/2 m e divido: 2π/(5/2)=4π/5 rad/m. L’unità rad/m rende kx una fase in radianti. Non occorre approssimare π.

Passaggi esatti: `k\lambda=2\pi\qquad k=\frac{2\pi}{\lambda}\qquad k=\frac{4\pi}{5}\,\mathrm{rad/m}`.

Distrattori: 2/5 rad/m copia il numero di cicli per metro senza moltiplicarlo per 2π. 5π rad/m moltiplica 2π per la lunghezza invece di dividerlo. Il valore 5/(4π) inverte il coefficiente numerico del k richiesto.

Aiuto: Un intero periodo spaziale deve produrre una fase di 2π radianti.

Famiglia: `ricostruire-il-numero-donda`; difficoltà 2; versione 2/base 1.

## C5-Q018

Compito: In un’onda sonora piana in aria le particelle del mezzo oscillano parallelamente alla direzione di propagazione. Come si chiama questo tipo di onda?

Procedimento: La distinzione riguarda la direzione del moto locale del mezzo. Le particelle si spostano avanti e indietro lungo la direzione in cui la perturbazione avanza: l’onda è longitudinale. Compressioni e rarefazioni possono così propagarsi senza che la stessa particella viaggi insieme a un fronte per tutto il percorso.

Passaggi esatti: `\mathbf v_{\rm particella}\parallel\mathbf k`.

Distrattori: Trasversale descriverebbe spostamenti perpendicolari alla propagazione. La geometria longitudinale non impone onde stazionarie e non elimina le compressioni. Un grafico sinusoidale della pressione non è una traiettoria trasversale dell’aria.

Aiuto: Confronta il moto delle particelle con la direzione della perturbazione.

Famiglia: `strati-daria-nel-condotto`; difficoltà 1; versione 2/base 1.

## C5-Q019

Compito: Un’onda progressiva ha fase (6 rad/m)x−(12 rad/s)t. Quale spostamento orientato compie una stessa cresta in 0,30 s?

Procedimento: Sulla stessa cresta la fase resta costante: 6Δx−12Δt=0 con le unità della consegna. Isolo Δx=(12/6)Δt. La velocità di fase è +2 m/s e in 0,30 s la cresta avanza di +0,60 m. Il segno meno davanti al termine temporale richiede x crescente per compensare t crescente.

Passaggi esatti: `6\,\frac{\mathrm{rad}}{\mathrm m}\Delta x=12\,\frac{\mathrm{rad}}{\mathrm s}\Delta t\qquad v=2\,\mathrm{m/s}\qquad \Delta x=+0{,}60\,\mathrm m`.

Distrattori: −0,60 m sceglie il verso opposto. +0,15 m inverte il rapporto 12/6 prima di moltiplicare per il tempo. +3,6 copia 12·0,30 senza dividere per 6; +2,0 copia il coefficiente numerico della velocità senza usare la durata.

Aiuto: Imponi variazione nulla della fase per seguire lo stesso massimo.

Famiglia: `fase-seguita-a-tempo-crescente`; difficoltà 3; versione 2/base 1.

## C5-Q020

Compito: Hai una sola fotografia calibrata in spazio di un profilo sinusoidale sulla corda, senza tempi né dati dinamici del mezzo. Quale grandezza fra queste puoi ricavare direttamente?

Procedimento: Fra due creste adiacenti sulla fotografia si misura una lunghezza d’onda. La fotografia riunisce punti diversi allo stesso istante e non indica quanto tempo impieghi la forma a spostarsi. Onde con la stessa lunghezza d’onda possono avere frequenze e velocità diverse, se non sono assegnate altre condizioni.

Passaggi esatti: `\lambda=x_{\rm cresta,2}-x_{\rm cresta,1}`.

Distrattori: Frequenza e periodo richiedono informazione temporale. Anche le velocità richiedono una variazione nel tempo e non si leggono dalla sola pendenza spaziale della fotografia. L’ampiezza sarebbe un’altra misura spaziale possibile, ma non è proposta fra queste alternative.

Aiuto: Cerca una distanza tra due punti nella stessa immagine.

Famiglia: `fotografia-senza-cronometro`; difficoltà 2; versione 2/base 1.
