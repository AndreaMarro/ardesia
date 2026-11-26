# cric-c4-l02

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C4.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C4-Q011

Compito: Nello stesso punto di un campo esterno prescritto sostituisci una piccola carica di prova +q con −q, con q>0 e senza alterare le sorgenti. Il campo è non nullo. Quale cambiamento si osserva?

Procedimento: Il campo è determinato dalle sorgenti mantenute fisse, non dal segno della prova. La forza sulla prova vale qE. Sostituire +q con −q cambia il segno del vettore forza ma non il suo modulo, perché il valore assoluto di q è lo stesso. L’ipotesi di perturbazione trascurabile permette di confrontare lo stesso campo.

Passaggi esatti: `\mathbf F_-=-\mathbf F_+`.

Distrattori: Invertire la carica di prova non inverte automaticamente la distribuzione sorgente. Campo non nullo e carica non nulla escludono forza nulla. Mantenere il verso della forza ignorerebbe il segno del prodotto qE.

Aiuto: Separa ciò che appartiene alle sorgenti dalla forza sulla particolare prova.

Famiglia: `la-prova-cambia-segno`; difficoltà 1; versione 3/base 2.

## C4-Q012

Compito: Una carica di prova +4,0 nC subisce una forza elettrica di 1,2 μN verso est. La prova perturba in modo trascurabile le sorgenti. Trova il modulo del campo in N/C.

Procedimento: Con una prova positiva il campo ha lo stesso verso della forza, cioè est. Per il modulo divido F per q: (1,2×10⁻⁶)/(4,0×10⁻⁹)=0,3×10³=300 N/C. Il rapporto newton/coulomb è l’unità del campo. La forza misurata non è già il campo: occorre riferirla alla carica della prova.

Passaggi esatti: `E=F/q\qquad E=300\,\mathrm{N/C}`.

Distrattori: 0,3 N/C dimenticherebbe il rapporto mille fra i prefissi micro e nano. 4 800 N/C non ricostruirebbe la forza misurata: moltiplicato per 4 nC darebbe 19,2 μN. Il controllo corretto è (300 N/C)(4 nC)=1,2 μN.

Aiuto: Dividi la forza per la carica dopo aver esplicitato i due prefissi.

Famiglia: `campo-da-una-forza-misurata`; difficoltà 1; versione 2/base 1.

## C4-Q013

Compito: In un punto dove il campo elettrico è diverso da zero, la direzione del campo è quella della … alla linea di campo. Quale parola completa la frase?

Procedimento: Una linea di campo è costruita in modo che la sua tangente locale sia parallela al campo in ogni punto regolare. La freccia sulla linea ne indica anche il verso, definito dalla forza su una prova positiva. Non occorre che la linea sia retta: conta la tangente nel punto scelto.

Passaggi esatti: `\mathbf E\parallel\mathbf t`.

Distrattori: La normale è perpendicolare alla tangente e non definisce il campo lungo la linea. Una secante fra punti lontani non sostituisce una direzione locale. La gravità è un’interazione distinta.

Aiuto: Pensa alla direzione che segue una curva proprio nel punto in cui la osservi.

Famiglia: `verso-locale-di-una-linea`; difficoltà 1; versione 2/base 1.

## C4-Q014

Compito: Due cariche puntiformi +q e +4q, con q>0, sono ferme nel vuoto a distanza 30 cm. Tra loro, a quanti cm dalla carica +q è nullo il campo?

Procedimento: Tra le cariche positive i contributi hanno versi opposti. Per annullare la somma vettoriale devono avere uguale modulo: q/d₁²=4q/d₂². Le distanze sono positive, quindi d₂=2d₁. Con d₁+d₂=30 cm ottengo 3d₁=30 cm e d₁=10 cm, mentre d₂=20 cm. Il punto è più vicino alla sorgente più debole.

Passaggi esatti: `\frac{q}{d_1^2}=\frac{4q}{d_2^2}\qquad d_2=2d_1\qquad d_1=10\,\mathrm{cm}`.

Distrattori: 15 cm renderebbe uguali le distanze ma non i campi: il contributo di +4q sarebbe quadruplo. 20 cm è la distanza dalla sorgente +4q, non quella richiesta. Il rapporto delle distanze è due, non quattro, perché i campi dipendono dai quadrati.

Aiuto: Prima uguaglia i moduli, poi usa la somma delle due distanze.

Famiglia: `annullare-due-contributi-collineari`; difficoltà 3; versione 3/base 2.

## C4-Q015

Compito: Un disegno mostra due linee di campo elettrico che si incrociano con tangenti differenti in un punto regolare in cui E è diverso da zero. Qual è il problema?

Procedimento: Il campo risultante in un punto è un solo vettore. Se è non nullo, ha una direzione definita. Due tangenti differenti allo stesso punto assegnerebbero due direzioni incompatibili, quindi quel disegno non rappresenta correttamente le linee del campo risultante. Le condizioni di punto regolare e campo non nullo evitano i casi singolari esclusi dalla domanda.

Passaggi esatti: `\mathbf E(P)\ne\mathbf0`.

Distrattori: Le linee non sono sorgenti materiali di campi separati. La carica della prova non è determinata dall’incrocio disegnato. Sommare i contributi delle sorgenti produce un unico risultante, non due direzioni alternative nello stesso punto.

Aiuto: Ricorda che la tangente locale rappresenta la direzione di un solo vettore risultante.

Famiglia: `le-linee-possono-attraversarsi`; difficoltà 1; versione 2/base 1.

## C4-Q016

Compito: Una particella entra in una regione di campo elettrico uniforme con v_x=4 m/s e v_y=0. Il campo produce a_y=6 m/s² e a_x=0. Agisce solo la forza elettrica e il percorso considerato resta nella regione, senza urti. Dopo 0,80 m orizzontali, di quanti cm si è spostata verso y positivo?

Procedimento: Il moto orizzontale fornisce il tempo: t=0,80/4=0,20 s. Lungo y la velocità iniziale è nulla e l’accelerazione è costante, quindi Δy=(1/2)·6·(0,20)² m=0,12 m. Moltiplico per 100 cm/m e ottengo 12 cm verso y positivo. I due moti condividono lo stesso tempo, ma hanno leggi diverse.

Passaggi esatti: `t=\Delta x/v_x\qquad \Delta y=\tfrac12a_yt^2\qquad \Delta y=12\,\mathrm{cm}`.

Distrattori: 24 cm omette il fattore un mezzo. 60 cm richiederebbero a_y=30 m/s² nello stesso tempo di 0,20 s, non 6 m/s². Non si accelera il moto orizzontale, perché a_x è assegnata nulla.

Aiuto: Trova il tempo dal tratto orizzontale, poi inseriscilo nella legge verticale.

Famiglia: `una-traiettoria-fra-le-armature`; difficoltà 2; versione 3/base 2.

## C4-Q017

Compito: Le linee di un campo radiale sono orientate verso un’unica carica puntiforme al centro. Con quale aggettivo si descrive il segno della sorgente?

Procedimento: Le frecce delle linee seguono il verso del campo, definito dalla forza su una prova positiva. Una prova positiva sarebbe attratta dalla sorgente centrale: la sorgente è quindi negativa. Le linee entrano nelle cariche negative ed escono da quelle positive.

Passaggi esatti: `q_{\rm sorgente}<0`.

Distrattori: Una sorgente positiva produrrebbe linee uscenti. Una carica nulla non genera il campo radiale non nullo descritto. Il segno della sorgente non viene cambiato scegliendo una prova negativa.

Aiuto: Immagina quale sorgente attrarrebbe una piccola prova positiva.

Famiglia: `linee-rivolte-verso-il-centro`; difficoltà 1; versione 2/base 1.

## C4-Q018

Compito: In un punto una sorgente dà un campo di 300 N/C verso est e un’altra di 400 N/C verso nord. I contributi sono perpendicolari. Calcola il modulo del campo risultante in N/C.

Procedimento: Scelgo est e nord come assi ortogonali. Le componenti del risultante sono 300 e 400 N/C: non si sommano come moduli collineari. Il triangolo ha i rapporti 3–4–5, quindi il modulo è 500 N/C. La stessa verifica con i quadrati dà 300²+400²=250 000 (N/C)² e la radice positiva è 500 N/C.

Passaggi esatti: `E=\sqrt{E_x^2+E_y^2}\qquad E=500\,\mathrm{N/C}`.

Distrattori: 700 N/C sarebbe la somma dei moduli per campi concordi lungo la stessa retta. 100 N/C sarebbe la differenza dei moduli per campi opposti collineari. Qui entrambe le componenti non nulle devono contribuire al quadrato del modulo.

Aiuto: Riconosci il triangolo rettangolo con cateti nel rapporto 3 a 4.

Famiglia: `vettori-ortogonali-nel-punto-di-misura`; difficoltà 2; versione 2/base 1.

## C4-Q019

Compito: Una particella di carica negativa e massa positiva viene lasciata da ferma in un campo elettrico uniforme non nullo verso destra. Non agiscono altre forze. Che cosa succede subito dopo il rilascio?

Procedimento: La forza elettrica è qE: con q negativo ha verso opposto al campo. La massa è positiva, quindi anche l’accelerazione punta a sinistra. Al solo istante di rilascio la velocità è ancora zero; subito dopo diventa diretta a sinistra. Velocità iniziale nulla non significa forza o accelerazione nulla.

Passaggi esatti: `\mathbf a=\frac{q}{m}\mathbf E`.

Distrattori: Il verso del campo coincide con la forza soltanto per una prova positiva. Una carica negativa non annulla il prodotto qE. La velocità può iniziare a cambiare a partire da zero sotto una forza non nulla.

Aiuto: Determina prima il verso della forza dal segno della carica.

Famiglia: `una-carica-negativa-inizialmente-ferma`; difficoltà 1; versione 2/base 1.

## C4-Q020

Compito: Una carica parte verso destra a 6 m/s in un campo uniforme che produce accelerazione costante di 3 m/s² verso sinistra. Il campo persiste per l’intero moto considerato e non agiscono altre forze. Dopo quanti secondi raggiunge l’istante di inversione?

Procedimento: Scelgo destra positiva: v₀=+6 m/s e a=−3 m/s². La velocità è v(t)=6−3t nelle unità SI. All’istante di inversione si annulla: 6−3t=0, da cui t=2 s. Dopo quell’istante l’accelerazione rimane verso sinistra e la velocità diventa negativa, quindi si tratta davvero di un’inversione.

Passaggi esatti: `v=v_0+at\qquad t=-v_0/a\qquad t=2\,\mathrm s`.

Distrattori: A 1 s la velocità è ancora +3 m/s; a 3 s è già −3 m/s. Dividere l’accelerazione per la velocità iniziale darebbe l’inverso di un tempo. Non si cerca quando si annulla l’accelerazione, che qui è costante e non nulla.

Aiuto: Poni uguale a zero la velocità con segno, non l’accelerazione.

Famiglia: `tempo-per-invertire-il-moto`; difficoltà 2; versione 2/base 1.
