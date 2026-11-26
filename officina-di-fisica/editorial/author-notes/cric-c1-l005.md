# cric-c1-l005

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C1-Q041

Compito: Un pattino già in moto lungo una guida orizzontale ha risultante delle forze nulla. Come evolve, osservato in un riferimento inerziale e con massa costante?

Procedimento: Chiamo F_R la risultante e m>0 la massa. Il secondo principio dà F_R=m a: con risultante nulla l’accelerazione è zero. La velocità resta quindi uguale al suo valore iniziale, che per ipotesi non è zero. Non occorre una forza risultante per mantenere un moto uniforme.

Passaggi esatti: `\vec F_R=m\vec a\qquad \vec F_R=0\qquad \vec a=0\qquad \vec v=\vec v_0`.

Distrattori: Rallentare, aumentare la rapidità o cambiare direzione richiederebbero accelerazione e dunque una risultante non nulla. Essere fermo è solo uno dei moti possibili con risultante nulla, escluso qui dall’informazione che il pattino era già in moto.

Aiuto: Non confondere la condizione per cambiare velocità con quella per mantenerla.

Famiglia: `muoversi-senza-risultante`; difficoltà 1; versione 2/base 1.

## C1-Q042

Compito: Un secchio di massa totale m=3,2 kg sale a velocità costante appeso a un filo verticale ideale. Agiscono solo peso e tensione T. Con g=10 m/s², quanto vale T?

Procedimento: Scelgo positivo verso l’alto. La velocità costante implica accelerazione verticale nulla, anche se il secchio si sta muovendo. La somma T−mg deve allora essere zero. Il peso è 3,2·10=32 N e la tensione ha lo stesso modulo, verso l’alto.

Passaggi esatti: `T-mg=0\qquad T=mg\qquad T=32\,\mathrm N`.

Distrattori: Zero è la risultante, non la tensione. 64 N somma due moduli uguali invece di trovare la forza del filo. 3,2 N copia il valore numerico della massa senza moltiplicarlo per g. 320 N aggiunge un fattore dieci al prodotto assegnato.

Aiuto: Il verso del moto non determina il segno dell’accelerazione: qui a=0.

Famiglia: `trazione-verticale-a-velocita-costante`; difficoltà 2; versione 2/base 1.

## C1-Q043

Compito: Un libro è fermo su un tavolo. Qual è la forza di reazione, nel terzo principio, alla forza gravitazionale esercitata dalla Terra sul libro?

Procedimento: Una coppia azione–reazione coinvolge la stessa interazione e due destinatari distinti. Chiamo T la Terra e L il libro. Se T attrae L, L attrae T con forza opposta di uguale modulo. Entrambe esistono anche quando il libro è fermo; la massa molto maggiore della Terra rende diversa la sua accelerazione.

Passaggi esatti: `\vec F_{T\to L}=-\vec F_{L\to T}`.

Distrattori: La normale sul libro può equilibrare il peso, ma ha lo stesso destinatario e nasce da un’altra interazione. La forza del libro sul tavolo è la reazione alla normale del tavolo, non al peso. Peso del tavolo e risultante nulla non completano la coppia gravitazionale richiesta.

Aiuto: Scambia sorgente e destinatario della stessa forza, non il suo nome soltanto.

Famiglia: `la-coppia-del-terzo-principio`; difficoltà 2; versione 2/base 1.

## C1-Q044

Compito: Un blocco di massa m=5 kg rimane su un piano orizzontale fisso senza accelerazione verticale. Una fune esercita una componente verticale T_y=12 N verso l’alto; la sua componente orizzontale non entra nel bilancio verticale. Agiscono verticalmente solo peso, fune e normale N. Con g=10 m/s², quanto vale N?

Procedimento: Scelgo verso positivo in alto. Il peso è 50 N e le forze verso l’alto sono N e 12 N. Impongo N+T_y−mg=0: N=50−12=38 N. Il risultato non negativo è compatibile con un piano che spinge il blocco, senza doverlo attrarre.

Passaggi esatti: `N+T_y-mg=0\qquad N=mg-T_y\qquad N=(50-12)\,\mathrm N\qquad N=38\,\mathrm N`.

Distrattori: 50 N ignorerebbe la trazione verticale;62 N la sommerebbe al peso invece di sottrarla dal sostegno richiesto. 12 N è la componente della fune. −38 N attribuisce al supporto il verso sbagliato: per questa convenzione N è il modulo positivo della spinta verso l’alto.

Aiuto: La fune sostiene già 12 N: il piano deve fornire soltanto il resto.

Famiglia: `una-trazione-solleva-in-parte-il-peso`; difficoltà 2; versione 3/base 2.

## C1-Q045

Compito: Come si chiama un riferimento in cui un corpo isolato mantiene velocità vettoriale costante?

Procedimento: La proprietà descritta definisce un riferimento inerziale: la risultante esterna nulla corrisponde ad accelerazione nulla. Il corpo può essere fermo oppure in moto rettilineo uniforme. Riferimenti che si muovono l’uno rispetto all’altro con velocità costante possono essere entrambi inerziali; non si richiede una quiete assoluta.

Passaggi esatti: `\sum\vec F=0\qquad \vec a=0\qquad \vec v=\mathrm{costante}`.

Distrattori: Un riferimento rotante richiede in generale termini apparenti per descrivere un corpo libero. La definizione non dice che ogni corpo sia fermo né introduce un’immobilità assoluta. La misura del tempo resta essenziale per distinguere una velocità costante da una variabile.

Aiuto: La parola cercata riguarda la validità del primo principio.

Famiglia: `il-riferimento-adatto`; difficoltà 1; versione 2/base 1.

## C1-Q046

Compito: Due forze orizzontali ortogonali hanno moduli F_x=6 N e F_y=8 N e agiscono su una piattaforma di massa m=5 kg. Peso e normale si compensano e non ci sono altre resistenze. Quanto vale il modulo dell’accelerazione?

Procedimento: Prima sommo le forze come vettori. L’ortogonalità permette Pitagora:6²+8²=100, perciò il modulo della risultante è 10 N. Solo dopo divido per la massa positiva:10 N/5 kg=2 m/s². Sommando i moduli 6+8 otterrei una forza troppo grande per questa geometria.

Passaggi esatti: `F_R=\sqrt{6^2+8^2}\,\mathrm N\qquad F_R=10\,\mathrm N\qquad a=\frac{F_R}{m}\qquad a=2\,\mathrm{m/s^2}`.

Distrattori: 14/5 m/s² somma i moduli come se le spinte fossero concordi. 6/5 e 8/5 m/s² sono soltanto le componenti dell’accelerazione. 10 copia il valore numerico della forza risultante in newton senza dividerlo per 5 kg.

Aiuto: Le forze ortogonali formano un triangolo 6–8–10, non una somma lineare.

Famiglia: `due-forze-perpendicolari-sul-carrello`; difficoltà 2; versione 2/base 1.

## C1-Q047

Compito: Una mano spinge orizzontalmente due blocchi a contatto su un piano liscio. Si sceglie come sistema l’insieme dei due blocchi, escludendo mano, piano e Terra. Quale forza orizzontale è esterna al sistema?

Procedimento: La mano è fuori dal confine e agisce su un blocco interno: la sua spinta è esterna. Chiamo F_H la spinta e m₁,m₂ le masse dei blocchi. Le due forze di contatto fra i blocchi sono interne e opposte, quindi si cancellano nel bilancio dell’insieme. Non si annullano invece nel bilancio del singolo blocco.

Passaggi esatti: `F_H=(m_1+m_2)a\qquad \vec F_{1\to2}+\vec F_{2\to1}=0`.

Distrattori: Ciascuna forza fra i blocchi ha sorgente e destinatario dentro il sistema. Contarne la somma ancora una volta duplicherebbe un’interazione già interna. Il peso è esterno perché la Terra è esclusa, ma è verticale e non risponde alla richiesta di una forza orizzontale.

Aiuto: Una forza è esterna se attraversa il confine scelto per il sistema.

Famiglia: `due-corpi-spinti-insieme`; difficoltà 2; versione 2/base 1.

## C1-Q048

Compito: Un corpo pesa P_T=24 N dove g_T=10 m/s². Viene portato in un luogo con g_A=4,0 m/s². La sua massa non cambia. Quanto vale il nuovo peso P_A?

Procedimento: Ricavo prima la massa da P_T=m g_T:24/10=2,4 kg. Poi applico la nuova accelerazione di gravità alla stessa massa:2,4·4=9,6 N. In forma di rapporto P_A/P_T=g_A/g_T=2/5: il peso diminuisce, mentre la massa resta 2,4 kg.

Passaggi esatti: `m=\frac{P_T}{g_T}\qquad m=\frac{12}{5}\,\mathrm{kg}\qquad P_A=mg_A\qquad P_A=\frac{48}{5}\,\mathrm N`.

Distrattori: 24 N manterrebbe il peso anziché la massa. 60 N inverte il rapporto delle gravità. 2,4 è la massa in chilogrammi, non il peso in newton;96 N moltiplica direttamente 24 per 4 senza togliere la gravità già contenuta nel peso iniziale.

Aiuto: Una massa è la stessa nei due luoghi; il suo peso non lo è.

Famiglia: `massa-su-un-altro-pianeta`; difficoltà 2; versione 2/base 1.

## C1-Q049

Compito: Un piccolo corpo è collegato a un filo ideale teso, rettilineo e inclinato. Qual è la direzione e il verso della forza esercitata dal filo sul corpo?

Procedimento: La tensione è una forza di trazione: il filo teso tira il corpo verso l’altro estremo. Chiamo e_s il versore lungo il filo diretto dal corpo al supporto e T≥0 il modulo della tensione. La forza è T e_s. Un filo ideale non può spingere il corpo nel verso opposto.

Passaggi esatti: `\vec T=T\hat e_s\qquad T\ge0`.

Distrattori: La direzione verticale è corretta solo se il filo è verticale, non per un filo obliquo. Una forza perpendicolare non è la trazione del filo ideale. Il verso che allontana dal supporto richiederebbe una spinta, esclusa dal modello del filo. Non occorre assumere che il corpo sia in equilibrio sotto il solo peso.

Aiuto: Individua il segmento che collega corpo e supporto: il filo tira, non spinge.

Famiglia: `dove-disegnare-la-tensione`; difficoltà 2; versione 2/base 1.

## C1-Q050

Compito: Una scatola di massa m=2 kg rimane a contatto con una rampa rettilinea fissa inclinata di θ=60° sull’orizzontale. Non ha accelerazione perpendicolare al piano; solo peso e normale hanno componenti in quella direzione. Con g=10 m/s², trova il modulo N della normale.

Procedimento: Scelgo l’asse normale uscente dal piano. La componente del peso verso il piano è mg cosθ, mentre N è uscente. L’accelerazione normale è zero, quindi N=mg cos 60°. Il peso è 20 N e cos 60°=1/2: la normale vale 10 N, positiva e compatibile con il contatto.

Passaggi esatti: `N-mg\cos\theta=0\qquad N=mg\cos60^\circ\qquad N=10\,\mathrm N`.

Distrattori: 20 N uguaglia la normale a tutto il peso come su un piano orizzontale. 10√3 N usa il seno e calcola la componente parallela. Zero eliminerebbe il sostegno pur con una componente del peso verso il piano. 40 N divide per il coseno anziché proiettare.

Aiuto: L’asse del bilancio è perpendicolare alla rampa, non verticale.

Famiglia: `reazione-di-un-supporto-inclinato`; difficoltà 3; versione 2/base 1.

## Geometria, riletture e limiti

Bilancio verticale:4 coordinate/N, peso200, normale152 e tensione48, valori50/38/12 N. Vettori separati sul medesimo corpo per la lettura del bilancio traslazionale, non una prova dei momenti. Somma ortogonale:30 coordinate/N, cateti180/240 e risultante300 per6/8/10 N. Rampa: inclinazione60°, scala7 coordinate/N, peso140 e normale70; la componente tratteggiata70 è parte del peso, non una quarta forza. XML e PNG intero1900 di altezza letti con punte complete e nessuna label sulla geometria.

Stato SCI proprio, UI prodotto e human NOT_RUN; nessun credito di integrazione. Le prove strutturali appartengono soltanto ai payload finali descritti dal loro hash.
