# cric-c5-l03

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C5.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C5-Q021

Compito: Nel regime lineare di una corda due piccoli impulsi danno, nello stesso punto e istante, spostamenti +1,2 mm e +0,8 mm rispetto allo stesso zero. Quanto vale lo spostamento risultante in millimetri?

Procedimento: La sovrapposizione somma le coordinate con il segno, nello stesso punto e istante. Entrambe sono positive: 1,2+0,8=2,0 mm. Il risultato non è una media e non rappresenta la somma delle energie. Se un contributo avesse segno opposto, la sua ordinata andrebbe sottratta algebricamente.

Passaggi esatti: `y=y_1+y_2\qquad y=+2\,\mathrm{mm}`.

Distrattori: 1 mm è la media, non la somma. 0,4 mm sottrarrebbe contributi che qui hanno lo stesso segno. Il quadrato delle ampiezze riguarda altri bilanci e non dà l’ordinata istantanea richiesta.

Aiuto: Allinea origine, punto e istante prima di sommare.

Famiglia: `due-impulsi-concordi`; difficoltà 1; versione 2/base 1.

## C5-Q022

Compito: Due impulsi identici di segno opposto viaggiano in versi opposti su una corda ideale lineare. Si sovrappongono completamente e poi si incrociano, senza incontrare estremità. Che cosa accade dopo?

Procedimento: La soluzione totale è la somma dei due profili che continuano a propagarsi. Nell’istante di sovrapposizione le ordinate opposte si cancellano, ma questo non elimina le due soluzioni né le velocità locali del mezzo. Dopo l’incrocio tornano distinguibili i due impulsi. La conservazione dell’energia riguarda anche l’energia cinetica della corda.

Passaggi esatti: `y(x,t)=y_1(x,t)+y_2(x,t)`.

Distrattori: Spostamento nullo in un istante non significa velocità nulla o energia totale nulla. Un impulso fermo o la scomparsa permanente non sono le soluzioni del modello lineare senza dissipazione.

Aiuto: Distingui l’istante della cancellazione dagli istanti dopo l’incrocio.

Famiglia: `dopo-la-cancellazione`; difficoltà 1; versione 2/base 1.

## C5-Q023

Compito: Due sinusoidi della stessa frequenza e della stessa direzione di oscillazione arrivano in P con ampiezze 5 mm e 3 mm, sempre in opposizione di fase. Nel regime lineare qual è l’ampiezza risultante in millimetri?

Procedimento: Quando la prima oscillazione vale 5 cosφ mm, la seconda vale −3 cosφ mm. La loro somma è 2 cosφ mm. L’ampiezza, non negativa, è quindi 2 mm. La cancellazione completa richiederebbe anche ampiezze uguali, oltre all’opposizione di fase.

Passaggi esatti: `y=(5-3)\cos\varphi\,\mathrm{mm}\qquad A_{\rm tot}=2\,\mathrm{mm}`.

Distrattori: 8 mm somma i moduli come per onde in fase. Zero presume ampiezze uguali che qui non lo sono. −2 mm non è un’ampiezza; il segno di uno spostamento istantaneo non sostituisce il suo massimo modulo.

Aiuto: Scrivi le due sinusoidi con lo stesso coseno e segni opposti.

Famiglia: `un-residuo-in-opposizione`; difficoltà 2; versione 2/base 1.

## C5-Q024

Compito: Due sorgenti coerenti emettono sinusoidi della stessa frequenza in opposizione di fase. In un mezzo omogeneo il punto P è equidistante dalle due sorgenti e riceve contributi di uguale ampiezza e stessa polarizzazione. Come si chiama l’interferenza in P?

Procedimento: I cammini uguali aggiungono lo stesso ritardo di propagazione, quindi non modificano la differenza iniziale di π radianti. I due contributi arrivano ancora opposti e, avendo uguali ampiezze, si cancellano. L’interferenza è distruttiva completa. Cammini uguali da soli non impongono un massimo se le sorgenti partono con fasi diverse.

Passaggi esatti: `\Delta\varphi_P=\pi\qquad A_{\rm tot}=0`.

Distrattori: Un massimo con cammini uguali richiederebbe sorgenti inizialmente in fase. Coerenza significa fase relativa stabile, non obbligatoriamente nulla. La cancellazione in P non significa che le sorgenti abbiano smesso di emettere.

Aiuto: Conserva lo sfasamento iniziale quando aggiungi i due ritardi uguali.

Famiglia: `sorgenti-fuori-fase-allorigine`; difficoltà 3; versione 2/base 1.

## C5-Q025

Compito: Due sorgenti coerenti in fase emettono alla stessa lunghezza d’onda λ>0. In P la differenza dei cammini è 5λ/2. Quale minimo aumento positivo di uno soltanto dei cammini porta a un massimo? Scegli la distanza.

Procedimento: La differenza iniziale è 2,5λ, un semi-intero. I massimi più vicini hanno differenza 2λ oppure 3λ. Aumentando il cammino lungo di λ/2 si arriva a 3λ; aumentando quello corto di λ/2 si scende a 2λ. Entrambe le scelte richiedono la stessa minima distanza positiva, λ/2.

Passaggi esatti: `\Delta s_i=\frac52\lambda\qquad \delta s_{\min}=\frac\lambda2`.

Distrattori: λ/4 lascia un quarto di ciclo oltre o prima di un massimo. Un aumento λ torna a un semi-intero e quindi a un minimo, per sorgenti in fase. Aumenti maggiori non sono il minimo positivo richiesto.

Aiuto: Cerca gli interi più vicini al numero 5/2.

Famiglia: `da-minimo-a-massimo`; difficoltà 3; versione 2/base 1.

## C5-Q026

Compito: Due sorgenti sonore coerenti restano attive e alimentano un campo lineare. Una sonda di pressione trova un punto sempre quieto, mentre poco più in là registra un segnale. Quale spiegazione è compatibile?

Procedimento: Le distanze dalle sorgenti dipendono dalla posizione. Possono quindi cambiare i ritardi relativi e la differenza di fase. Nel punto quieto le pressioni oscillanti hanno ampiezze e fasi adatte alla cancellazione; nel punto vicino la somma può essere non nulla. È un contrasto spaziale del campo, non una modifica della velocità del mezzo.

Passaggi esatti: `p_{\rm tot}=p_1+p_2`.

Distrattori: Coerenza non significa uguale somma in ogni punto. Pressione oscillante nulla non richiede frequenza nulla delle sorgenti o velocità di propagazione zero. La sonda non deve spegnere una sorgente per osservare un minimo.

Aiuto: Confronta la differenza dei due cammini nei due punti.

Famiglia: `un-nodo-della-figura-stabile`; difficoltà 2; versione 2/base 1.

## C5-Q027

Compito: Due onde progressive coerenti identiche, della stessa frequenza e polarizzazione, si propagano nello stesso verso. In P sono in fase, con ampiezza A>0 ciascuna. Nelle stesse condizioni vale I=C A_tot² con C>0. Quanto vale l’intensità risultante rispetto a una sola onda?

Procedimento: Prima sommo le ampiezze coerenti: A_tot=A+A=2A. Soltanto dopo applico la relazione quadratica con lo stesso coefficiente C. Il rapporto è (2A)²/A²=4. Non si tratta della somma incoerente di due intensità indipendenti; il termine d’interferenza è presente nelle condizioni assegnate.

Passaggi esatti: `A_{\rm tot}=2A\qquad \frac{I_{\rm tot}}{I_1}=4`.

Distrattori: Due volte sommerebbe le intensità senza il termine coerente. La metà e zero non ricostruiscono l’ampiezza 2A. La condizione di onde progressive nello stesso verso evita di confondere questo flusso con quello di due onde contropropaganti.

Aiuto: Esegui la somma delle ampiezze prima di elevare al quadrato.

Famiglia: `massimo-doppio-e-intensita`; difficoltà 2; versione 2/base 1.

## C5-Q028

Compito: Due sorgenti hanno fase relativa che varia casualmente con distribuzione uniforme su un giro durante il tempo di media. Perché non rimane una figura stabile di massimi e minimi d’interferenza?

Procedimento: Il termine incrociato della somma dipende dalla fase relativa. Se questa percorre casualmente il giro di fase, un punto non conserva la stessa condizione di rinforzo o cancellazione. La lunga media non mantiene le frange stabili di una fase relativa fissata. Le singole sorgenti possono continuare a emettere con ampiezza non nulla.

Passaggi esatti: `\langle\cos\Delta\varphi\rangle=0`.

Distrattori: La perdita di una figura stabile non ferma la propagazione e non impone ampiezze nulle. Una media non modifica fisicamente tutte le frequenze. Un massimo coerente stabile richiede una relazione di fase stabile, non soltanto due sorgenti accese.

Aiuto: Pensa al punto che passa nel tempo da due creste insieme a una cresta e una valle.

Famiglia: `sorgenti-dal-ritmo-instabile`; difficoltà 2; versione 2/base 1.

## C5-Q029

Compito: Due impulsi sono emessi simultaneamente e viaggiano nello stesso mezzo a 340 m/s. Uno percorre 1,02 m in più dell’altro. Di quanti millisecondi arriva dopo?

Procedimento: Il tempo extra è la distanza extra divisa per la velocità comune. Scrivo 1,02 m come 102/100 m e divido per 340 m/s: ottengo 3/1000 s. Moltiplicando per mille passo ai millisecondi: il ritardo è 3 ms. L’impulso del cammino maggiore arriva più tardi, quindi il ritardo richiesto è positivo.

Passaggi esatti: `\Delta t=\frac{\Delta s}{v}\qquad \Delta t=\frac3{1000}\,\mathrm s\qquad \Delta t=3\,\mathrm{ms}`.

Distrattori: 0,003 ms conserva il coefficiente in secondi dopo aver cambiato solo il nome dell’unità. Moltiplicare distanza per velocità non produce un tempo. Un ritardo negativo invertirebbe quale dei due cammini è più lungo.

Aiuto: Calcola prima in secondi, poi moltiplica il numero per mille.

Famiglia: `ritardo-dalla-differenza-di-cammino`; difficoltà 2; versione 2/base 1.

## C5-Q030

Compito: Nello stesso istante due impulsi su una corda lineare hanno ciascuno un picco di +4 mm, ma in posizioni diverse. Si può concludere che il massimo della somma sia necessariamente 8 mm in quell’istante?

Procedimento: La sovrapposizione somma y₁(x,t) e y₂(x,t) con le stesse coordinate x e t. Due massimi separati non garantiscono un punto dove entrambi valgano 4 mm. Per esempio impulsi stretti completamente separati hanno massimo risultante di 4 mm, non 8 mm. Occorre conoscere come i due profili si sovrappongono.

Passaggi esatti: `y_{\rm tot}(x,t)=y_1(x,t)+y_2(x,t)`.

Distrattori: La stessa unità non rende uguali le ascisse. La somma non è necessariamente zero e può superare 4 mm se vi è sovrapposizione adatta. Il dato sui soli picchi non fissa l’intero massimo della somma.

Aiuto: Allinea prima le ascisse e poi somma le ordinate.

Famiglia: `somma-punto-per-punto`; difficoltà 2; versione 2/base 1.
