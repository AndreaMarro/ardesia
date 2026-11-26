# cric-c5-l01

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C5.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C5-Q001

Compito: Un oscillatore raggiunge +7 mm e −7 mm rispetto allo zero di equilibrio. Qual è l’ampiezza, in millimetri?

Procedimento: L’ampiezza è una distanza dall’equilibrio a un solo estremo. La corsa completa va da −7 a +7 mm e misura 14 mm. Dividendo questa corsa per due trovo 7 mm. Lo stesso risultato si legge direttamente come distanza fra zero e +7 mm, oppure fra zero e −7 mm.

Passaggi esatti: `A=\frac{x_{\max}-x_{\min}}2\qquad A=7\,\mathrm{mm}`.

Distrattori: 14 mm è la distanza fra entrambi gli estremi, non l’ampiezza. −7 mm è una coordinata orientata: un’ampiezza non è negativa. 3,5 mm dividerebbe ancora per due una distanza già misurata dal centro.

Aiuto: Traccia lo zero di equilibrio e misura fino a un solo estremo.

Famiglia: `fra-due-estremi`; difficoltà 1; versione 2/base 1.

## C5-Q002

Compito: Un oscillatore periodico ha il primo massimo a 0,10 s e il sesto a 0,85 s. Qual è il periodo esatto?

Procedimento: Fra il primo e il sesto massimo ci sono cinque intervalli, come fra sei tacche su un righello. Sottraggo i due tempi: 0,85−0,10=0,75 s. Divido per cinque e ottengo 0,15 s. Posso verificarlo elencando i massimi a 0,10; 0,25; 0,40; 0,55; 0,70; 0,85 s.

Passaggi esatti: `\Delta t=0{,}75\,\mathrm s\qquad T=\frac{\Delta t}{5}\qquad T=\frac3{20}\,\mathrm s`.

Distrattori: 0,125 s divide 0,75 s per sei e conta un intervallo in più. 0,75 s è l’intero tempo trascorso. 0,17 s divide il tempo finale per cinque senza sottrarre l’istante iniziale.

Aiuto: Conta i vuoti fra i sei massimi, poi sottrai gli estremi temporali.

Famiglia: `il-ciclo-mancante`; difficoltà 2; versione 2/base 1.

## C5-Q003

Compito: Un oscillatore armonico ideale di ampiezza non nulla passa due volte consecutive per l’equilibrio in versi opposti. Fra i due passaggi trascorrono 18 ms. Qual è la frequenza esatta?

Procedimento: Partendo dal centro in un verso, l’oscillatore visita un estremo e ritorna al centro nel verso opposto: è mezzo ciclo. Il periodo intero è dunque 36 ms, cioè 36/1000 s=9/250 s. Invertendo questa frazione ottengo 250/9 Hz. La frazione selezionabile evita una divisione decimale periodica.

Passaggi esatti: `T=2\cdot18\,\mathrm{ms}\qquad T=\frac9{250}\,\mathrm s\qquad f=\frac{250}{9}\,\mathrm{Hz}`.

Distrattori: 500/9 Hz tratta i 18 ms come un periodo intero. 125/9 Hz usa invece quattro volte 18 ms. I numeri 36 e 18 descrivono durate in millisecondi nei passaggi precedenti, non frequenze in hertz.

Aiuto: Prima ricostruisci un ciclo intero e soltanto dopo fai il reciproco in secondi.

Famiglia: `uno-zero-attraversato-due-volte`; difficoltà 2; versione 3/base 2.

## C5-Q004

Compito: Per lo stesso oscillatore armonico ideale, con ampiezza e pulsazione costanti, confronti due istanti lontani dagli estremi. Quale coppia di osservazioni identifica la stessa fase modulo un giro?

Procedimento: Una posizione interna si attraversa due volte per ciclo. Sapere se il corpo sta andando verso destra o verso sinistra distingue quei due passaggi. Stessa posizione e stesso verso della velocità riportano quindi allo stesso stato della sinusoide, a meno di un numero intero di periodi. L’energia totale è invece identica in tutte le fasi del moto ideale.

Passaggi esatti: `x_2=x_1\qquad \operatorname{sgn}(v_2)=\operatorname{sgn}(v_1)`.

Distrattori: Il solo modulo della velocità coincide anche in posizioni opposte. Una posizione con verso di moto opposto corrisponde all’altro attraversamento e non alla stessa fase. La conservazione dell’energia non seleziona un istante del ciclo.

Aiuto: Immagina i due passaggi per il centro: quale informazione li distingue?

Famiglia: `quale-coppia-basta`; difficoltà 1; versione 2/base 1.

## C5-Q005

Compito: Un oscillatore segue x(t)=A cos(ωt), con A>0 e ω>0. Quali posizione e velocità ha a t=0?

Procedimento: A t=0 l’argomento del coseno è zero e cos0=1: la coordinata è +A. La velocità è la pendenza della curva, oppure la derivata −Aω sin(ωt), che vale zero. L’accelerazione non è nulla: è −ω²A e punta verso l’equilibrio. Il corpo sta invertendo il verso del moto.

Passaggi esatti: `x(0)=A\qquad v(0)=0\qquad a(0)=-\omega^2A`.

Distrattori: Il passaggio per l’equilibrio appartiene a una fase diversa. All’estremo la velocità non è massima: è momentaneamente zero. Il segno positivo dell’estremo deriva dal coseno iniziale, non dal segno della velocità.

Aiuto: Valuta il coseno e la pendenza nello stesso istante iniziale.

Famiglia: `istante-iniziale-di-un-coseno`; difficoltà 2; versione 2/base 1.

## C5-Q006

Compito: La fase reale accumulata da un oscillatore armonico cresce di 3π radianti. Quanti periodi sono trascorsi? Non arrotondare il conteggio a un intero.

Procedimento: Un ciclo completo corrisponde a 2π radianti. Divido la fase accumulata per quella di un giro: 3π/(2π)=3/2. È un periodo intero più mezzo periodo. Il numero di periodi trascorsi è un rapporto di tempi e può essere frazionario; non è un conteggio di soli giri completati.

Passaggi esatti: `\frac{\Delta t}{T}=\frac{\Delta\varphi}{2\pi}\qquad \frac{\Delta t}{T}=\frac32`.

Distrattori: Tre periodi richiederebbero 6π radianti. Mezzo periodo richiede solo π. 2/3 inverte il rapporto fra fase accumulata e fase di un giro. Non si deve eliminare il mezzo ciclo soltanto perché non è completo.

Aiuto: Un giro di fase contiene 2π radianti.

Famiglia: `meta-percorso-in-fase`; difficoltà 2; versione 2/base 1.

## C5-Q007

Compito: Nella legge a=−ω²x di un oscillatore armonico, con ω>0 e origine x=0 scelta al centro del moto, verso quale posizione punta l’accelerazione quando x≠0?

Procedimento: Se x è positiva, l’accelerazione è negativa; se x è negativa, l’accelerazione è positiva. In entrambi i casi punta verso x=0, posizione di equilibrio. Il segno meno esprime un richiamo rispetto alla posizione, non un freno sempre opposto alla velocità. Nel passaggio per il centro l’accelerazione si annulla.

Passaggi esatti: `a=-\omega^2x`.

Distrattori: Durante il moto verso il centro accelerazione e velocità possono avere lo stesso verso. Una forza dissipativa avrebbe invece un legame diverso con la velocità. Né l’estremo positivo né il verso positivo sono privilegiati lungo tutto il ciclo.

Aiuto: Prova separatamente una coordinata positiva e una negativa.

Famiglia: `il-termine-del-richiamo`; difficoltà 1; versione 2/base 1.

## C5-Q008

Compito: Un oscillatore armonico ideale, di ampiezza non nulla, attraversa l’equilibrio. Quale fra queste grandezze raggiunge il massimo modulo?

Procedimento: All’equilibrio lo spostamento e il richiamo elastico sono nulli. L’energia potenziale elastica è minima e tutta l’energia oscillatoria è cinetica. La velocità ha quindi modulo massimo, pari ad Aω. Lo stesso valore del modulo si ritrova nei due passaggi per il centro, con versi opposti.

Passaggi esatti: `|v|_{\max}=A\omega\qquad x=0\qquad a=0`.

Distrattori: Accelerazione e forza di richiamo hanno invece massimo modulo agli estremi, dove la velocità è zero. Lo spostamento al centro è nullo. Il massimo della velocità non richiede una forza massima nello stesso istante.

Aiuto: Segui dove si trova l’energia quando la deformazione elastica è nulla.

Famiglia: `verso-della-velocita-al-centro`; difficoltà 2; versione 2/base 1.

## C5-Q009

Compito: Lo stesso corpo di massa m>0 oscilla senza attriti con una molla ideale. In una seconda preparazione k₂=k₁/4, con k₁>0. Come cambia il periodo, usando ω²=k/m?

Procedimento: A massa costante il rapporto ω₂²/ω₁² vale 1/4. La pulsazione positiva diventa quindi metà di prima. Poiché T=2π/ω, il periodo raddoppia. Le due preparazioni possono avere la stessa ampiezza nel regime lineare: la variazione di periodo deriva dalla rigidezza, non da una variazione di massa.

Passaggi esatti: `\frac{\omega_2}{\omega_1}=\frac12\qquad \frac{T_2}{T_1}=2`.

Distrattori: Quadruplicare T userebbe una dipendenza inversa da k senza la radice. Dimezzare T confonderebbe il rapporto dei periodi con quello delle pulsazioni. Il periodo non resta costante quando cambia k a massa fissata.

Aiuto: Estrai prima la radice del rapporto delle pulsazioni al quadrato.

Famiglia: `una-molla-meno-rigida`; difficoltà 3; versione 2/base 1.

## C5-Q010

Compito: Una traccia mostra massimi successivi di 8 mm, 6 mm e 4,5 mm rispetto allo stesso equilibrio, quasi equidistanti nel tempo. Quale descrizione è compatibile con questi dati?

Procedimento: Le altezze misurano l’ampiezza e diminuiscono: 6/8=3/4 e 4,5/6=3/4. Le separazioni temporali quasi uguali indicano invece un periodo osservato quasi costante. Una dissipazione debole è compatibile con questa traccia. I soli tre massimi non identificano in modo unico la legge completa dello smorzamento.

Passaggi esatti: `\frac{A_2}{A_1}=\frac34\qquad \frac{A_3}{A_2}=\frac34`.

Distrattori: Un modello ideale ad ampiezza costante non riproduce queste altezze. Sottrarre millimetri non dà un tempo. La diminuzione dell’ampiezza non implica lo stesso rapporto per la frequenza: il dato temporale va letto separatamente.

Aiuto: Confronta separatamente le ordinate dei massimi e le loro distanze temporali.

Famiglia: `traccia-con-escursione-calante`; difficoltà 2; versione 2/base 1.
