# cric-c4-l01

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C4.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C4-Q001

Compito: Una gocciolina inizialmente neutra acquisisce carica −4,80 fC in un ordinario trasferimento di elettroni. Quanti elettroni ha acquistato? Usa il valore di modello e=1,60×10⁻¹⁹ C.

Procedimento: Un elettrone aggiunto porta carica −e, quindi il segno negativo indica un eccesso di elettroni. Per contarli divido il modulo della carica per e. Scrivo 4,80 fC=4,80×10⁻¹⁵ C: il rapporto è (4,80/1,60)×10⁴=3×10⁴. Il numero acquistato è positivo e intero: 30 000 elettroni.

Passaggi esatti: `N=\frac{|q|}{e}\qquad N=3\cdot10^4`.

Distrattori: Il segno della carica non rende negativo il numero di elettroni acquistati. 3 000 elettroni darebbero −0,480 fC; 300 000 darebbero −48,0 fC. Il prefisso femto vale 10⁻¹⁵, mentre la carica elementare assegnata contiene 10⁻¹⁹.

Aiuto: Conserva il segno per identificare gli elettroni in eccesso, poi usa il modulo per il conteggio.

Famiglia: `contare-gli-elettroni-trasferiti`; difficoltà 1; versione 3/base 2.

## C4-Q002

Compito: Due cariche puntiformi ferme, isolate da altre sorgenti, valgono +q e +3q, con q>0. Si respingono. Quale confronto fra le forze reciproche rispetta la dinamica?

Procedimento: La legge di Coulomb contiene lo stesso prodotto 3q² e la stessa distanza in entrambi i calcoli. La coppia di azione e reazione ha quindi uguale modulo e versi opposti lungo la congiungente. Le frecce sono applicate a corpi distinti: non si cancellano nel bilancio delle forze di uno solo dei due corpi.

Passaggi esatti: `\mathbf F_{1\to2}=-\mathbf F_{2\to1}`.

Distrattori: Il rapporto fra le cariche non è il rapporto fra le forze reciproche. Avere la stessa direzione geometrica non significa avere lo stesso verso. Senza conoscere le masse non si può confrontare l’accelerazione dei due corpi.

Aiuto: Confronta il prodotto delle due cariche quando scambi sorgente e corpo che subisce la forza.

Famiglia: `forze-fra-cariche-diverse`; difficoltà 1; versione 2/base 1.

## C4-Q003

Compito: Quale prefisso SI, scritto in lettere, corrisponde a 10⁻⁹ e si usa spesso per piccole cariche?

Procedimento: Il prefisso nano indica un miliardesimo dell’unità. Una carica di 1 nC vale perciò 10⁻⁹ C. Il prefisso modifica il valore dell’unità, non il segno della carica: un nanocoulomb può essere positivo o negativo.

Passaggi esatti: `1\,\mathrm{nC}=10^{-9}\,\mathrm C`.

Distrattori: Micro corrisponde a 10⁻⁶, pico a 10⁻¹², femto a 10⁻¹⁵ e milli a 10⁻³. Confondere nano con micro cambia il valore di un fattore mille.

Aiuto: Riconosci il prefisso associato a un miliardesimo.

Famiglia: `prefisso-sotto-il-microcoulomb`; difficoltà 1; versione 3/base 2.

## C4-Q004

Compito: Due cariche puntiformi fisse nel vuoto, non nulle, inizialmente distanti 4 cm si respingono con modulo F. Senza cambiarle, a quanti cm vanno portate per ottenere il modulo F/9?

Procedimento: A cariche costanti la forza è inversamente proporzionale al quadrato della distanza. Per dividerla per nove devo moltiplicare la distanza per la radice positiva di nove, cioè tre. La nuova distanza è 3×4 cm=12 cm. Il controllo diretto dà (4/12)²=1/9.

Passaggi esatti: `\frac{F_f}{F_i}=\left(\frac{r_i}{r_f}\right)^2\qquad r_f=3r_i`.

Distrattori: 36 cm moltiplicherebbe la distanza per nove e ridurrebbe la forza a F/81. Ridurre la distanza aumenterebbe la forza. La radice negativa non è ammessa per una distanza fra due punti distinti.

Aiuto: Applica la radice al fattore di variazione della forza prima di scalare la distanza.

Famiglia: `la-distanza-necessaria-a-ridurre-la-forza`; difficoltà 2; versione 3/base 2.

## C4-Q005

Compito: Un sistema isolato elettricamente ha carica totale −2,5 nC. Viene separato in due oggetti, senza scambio di carica con l’esterno. Il primo ha +1,2 nC. Qual è la carica del secondo?

Procedimento: La conservazione riguarda la somma con segno. Scrivo q₁+q₂=q_tot e isolo q₂ sottraendo la carica positiva del primo oggetto. Ottengo −2,5−1,2=−3,7 nC. Il controllo è +1,2+(−3,7)=−2,5 nC. La separazione può ridistribuire le cariche, ma non modificarne il totale nel sistema isolato.

Passaggi esatti: `q_2=q_{\rm tot}-q_1`.

Distrattori: −1,3 nC darebbe un totale di −0,1 nC. +3,7 nC e +1,3 nC darebbero totali positivi. Lasciare al secondo tutto −2,5 nC ignorerebbe il contributo +1,2 nC del primo.

Aiuto: Sottrai la carica del primo oggetto dal totale, conservando entrambi i segni.

Famiglia: `carica-mancante-dopo-la-separazione`; difficoltà 1; versione 2/base 1.

## C4-Q006

Compito: Per stimare il campo lontano di un corpo carico con carica netta non nulla, nel regime in cui domina il contributo della carica totale, quale condizione geometrica permette usualmente di trascurarne le dimensioni?

Procedimento: Da lontano i dettagli della distribuzione incidono meno sul campo rispetto al contributo complessivo della carica netta, nelle condizioni indicate. Se la dimensione caratteristica a è molto minore di r, posso approssimare il corpo con una sorgente puntiforme. Non è una regola per punti interni o vicinissimi alla superficie.

Passaggi esatti: `a\ll r`.

Distrattori: Essere dentro o vicino al corpo non giustifica l’approssimazione lontana. Una carica netta nulla eliminerebbe il contributo monopolare considerato. La sola forma esterna non sostituisce le condizioni sulla distribuzione e sul punto di osservazione.

Aiuto: Confronta la dimensione del corpo con la distanza dalla sonda.

Famiglia: `quando-approssimare-una-sfera-con-un-punto`; difficoltà 2; versione 2/base 1.

## C4-Q007

Compito: Due cariche puntiformi ferme hanno segni opposti. Con quale aggettivo si definisce la forza che ciascuna esercita sull’altra?

Procedimento: Ogni carica è spinta verso la posizione dell’altra. La forza è quindi attrattiva e agisce lungo la congiungente delle cariche. Il segno del prodotto q₁q₂ distingue attrazione e repulsione, mentre il modulo dipende anche dalla distanza e dai valori assoluti delle cariche.

Passaggi esatti: `q_1q_2<0`.

Distrattori: Repulsiva descrive cariche dello stesso segno. L’opposizione dei segni non annulla le cariche né le forze reciproche. La forza di Coulomb non è tangenziale alla congiungente e non resta costante cambiando la distanza.

Aiuto: Il segno del prodotto delle cariche è negativo: le cariche si avvicinerebbero se libere.

Famiglia: `segni-opposti`; difficoltà 1; versione 2/base 1.

## C4-Q008

Compito: Nel medesimo mezzo una delle due cariche puntiformi è triplicata e la distanza è raddoppiata; l’altra carica resta invariata. Le cariche iniziali sono non nulle. Qual è il rapporto F_f/F_i dei moduli delle forze?

Procedimento: Il prodotto delle cariche fornisce un fattore tre. Il denominatore r² fornisce invece un fattore quattro quando r raddoppia. Il rapporto finale rispetto all’iniziale è dunque 3/4: la forza diminuisce, pur essendo aumentata una delle cariche. Il mezzo è lo stesso, perciò il coefficiente della legge si semplifica.

Passaggi esatti: `\frac{F_f}{F_i}=\frac{3}{2^2}=\frac34`.

Distrattori: 3/2 tratta la distanza come se comparisse alla prima potenza. 3 ignora la variazione della distanza. 4/3 è il rapporto inverso, mentre 12 moltiplica per quattro invece di dividere.

Aiuto: Separa il fattore del numeratore da quello del denominatore quadratico.

Famiglia: `cambiare-insieme-cariche-e-distanza`; difficoltà 2; versione 2/base 1.

## C4-Q009

Compito: Un oggetto inizialmente neutro diventa positivo per ordinaria elettrizzazione per strofinio, senza reazioni nucleari. Quale cambiamento microscopico è coerente?

Procedimento: Gli elettroni portano carica negativa. Se alcuni vengono trasferiti dall’oggetto all’altro materiale, nel primo rimane un difetto di carica negativa e quindi una carica netta positiva. Non occorre cambiare il numero dei protoni nei nuclei. Il trasferimento conserva la carica complessiva dei materiali se il sistema è isolato.

Passaggi esatti: `q_{\rm finale}>0`.

Distrattori: Acquistare elettroni renderebbe l’oggetto negativo. Trasformazioni dei nuclei e scomparsa di neutroni non descrivono l’ordinario strofinio. Essere inizialmente neutro non impedisce un successivo trasferimento di carica.

Aiuto: Collega il segno finale al guadagno o alla perdita di portatori negativi.

Famiglia: `uno-sfregamento-lascia-il-materiale-positivo`; difficoltà 1; versione 2/base 1.

## C4-Q010

Compito: Nel vuoto, una carica +2,0 nC e una seconda carica puntiforme, distanti 0,20 m, si attraggono con modulo della forza 9,0 μN. Trova la seconda carica con segno in nC. Usa k=9,0×10⁹ N·m²/C².

Procedimento: L’attrazione verso una carica positiva richiede che la seconda sia negativa. Dalla legge dei moduli ricavo |q|=Fr²/(kQ). In SI il numeratore vale (9×10⁻⁶)(0,20)²=3,6×10⁻⁷ N·m² e kQ=18 N·m²/C. Il rapporto è 2×10⁻⁸ C, cioè 20 nC. Ripristino il segno: q=−20 nC.

Passaggi esatti: `q=-\frac{Fr^2}{kQ}\qquad q=-20\,\mathrm{nC}`.

Distrattori: +20 nC produrrebbe repulsione. −2 nC darebbe 0,9 μN e −200 nC darebbe 90 μN, mentre il modulo misurato è 9,0 μN. Il prefisso nano vale 10⁻⁹ e micro vale 10⁻⁶; non si possono lasciare quei numeri nel prodotto SI senza conversione.

Aiuto: Determina prima il segno dall’attrazione, poi ricava il modulo con unità SI.

Famiglia: `scegliere-il-valore-della-seconda-carica`; difficoltà 3; versione 3/base 2.
