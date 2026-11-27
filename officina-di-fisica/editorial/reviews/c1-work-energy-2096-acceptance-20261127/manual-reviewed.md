# Dalle forze al lavoro e all’energia

I conti seguono le domande assegnate nel banco. Le letture del cursore a valori intermedi servono a esplorare il modello e possono richiedere un’approssimazione per essere trascritte.

## `SIM-C1-L006-01` · Prima della soglia e dopo l’avvio

Ogni prova comincia con il blocco fermo e la superficie orizzontale. L’attrito statico si oppone alla forza applicata e cresce dello stesso valore fino a 6 N, il massimo del modello. Appena il blocco comincia a muoversi, il banco usa 3 N di attrito dinamico per le condizioni assegnate.

Con 10 N applicati, la soglia è superata. La domanda chiede il modulo dell’attrito, quindi rispondi **3 N**. A 6 N esatti il modello ammette ancora l’equilibrio da fermo. Il modulo sale fino a **6 N** e la risultante vale zero. Per ricavare la risultante nella prova da 10 N, prendi come positivo il verso della spinta e sottrai i due moduli. Ottieni \(10-3=7\,\mathrm N\). Nel grafico cerca il salto tra il ramo statico e il ramo dinamico.

## `SIM-C1-L006-02` · Recuperare il verso della forza elastica

Il riferimento è la posizione di riposo. Nel modello lineare la molla ha costante \(k=50\,\mathrm{N/m}\) e genera \(F=-kx\). Il segno meno indica che la forza punta verso il riposo. Prima di moltiplicare, converti la distanza. Se \(x_{\mathrm{cm}}\) è il numero di centimetri con segno, in metri la distanza è \(x_{\mathrm{cm}}/100\), quindi la lettura in newton è \(-x_{\mathrm{cm}}/2\).

Con \(x=4\,\mathrm{cm}\) trovi \(-4/2=-2\,\mathrm N\). Con \(x=1\,\mathrm{cm}\) trovi \(-1/2\,\mathrm N=\) **−0,5 N**. Per controllare l’altra direzione, a −2 cm risulta +1 N. A riposo la forza si annulla. L’inversa \(x=-F/k\) restituisce uno spostamento in metri, dato che dividi newton per newton al metro.

## `SIM-C1-L006-03` · Confrontare due attrazioni gravitazionali

Le due masse sono fissate. Misura la distanza tra i loro centri e confrontala con una distanza di riferimento \(r_0>0\). Dividendo \(Gm_1m_2/r^2\) per \(Gm_1m_2/r_0^2\), ottieni la proporzione \(F/F_0=1/x^2\), dove \(x=r/r_0\). I fattori comuni e le unità si cancellano. Sul disegno, ogni freccia punta verso l’altra massa.

A distanza doppia il rapporto è \(1/2^2=\) **1/4**. Con \(x=11/4\), eleva al quadrato e poi capovolgi la frazione. Ottieni \((4/11)^2=16/121\). Per l’ingresso numerico puoi dividere a mano. Inizi con 160: 121 ci sta una volta, resto 39. In 390 ci sta tre volte, resto 27. In 270 ci sta due volte, resto 28. In 280 ci sta due volte, resto 38. Le prime quattro cifre decimali danno **0,1322**. L’identità \(121\cdot1322+38=160000\) conferma il resto. L’inversa, se conosci un rapporto positivo, è \(x=1/\sqrt{F/F_0}\).

## `SIM-C1-L007-01` · Separare forza, spostamento e lavoro

Il corpo si sposta di 3 m lungo un tratto rettilineo. La forza considerata ha modulo 4 N e resta costante durante ogni prova. Conta solo la componente della forza lungo lo spostamento. Il prodotto scalare dà \(W=Fs\cos\theta=12\cos\theta\,\mathrm J\), con \(\mathrm{N\,m}=\mathrm J\).

A 120° l’angolo supplementare è 60°. Il coseno cambia segno, quindi \(\cos120^\circ=-1/2\) e il lavoro è **−6 J**. A 90° le due direzioni sono perpendicolari e il lavoro è **0 J**. Nella figura osserva la proiezione della forza sulla direzione del moto. Nella prova a 120°, il contributo di questa forza alla variazione dell’energia cinetica è negativo. L’energia cinetica può comunque aumentare se le altre forze forniscono, nel complesso, un lavoro positivo maggiore.

## `SIM-C1-L007-02` · Leggere la potenza in un istante

Una risultante costante di 3 N accelera da fermo un carrello da \(3/2\) kg. Dalla seconda legge di Newton segue \(a=3/(3/2)=2\,\mathrm{m/s^2}\). Nei calcoli che seguono, \(t\) indica il valore numerico del tempo in secondi. La velocità è \(2t\,\mathrm{m/s}\) e il moto è parallelo alla forza. Moltiplica i moduli e ottieni \(P=Fv=6t\,\mathrm W\). A 3 s ottieni **18 W**. A 2 s ottieni **12 W**. Per invertire il conto dividi il valore in watt per sei e ricavi il tempo in secondi.

Lo spostamento da fermo è \(t^2\,\mathrm m\), dunque il lavoro dall’inizio è \(3t^2\,\mathrm J\). Da qui la potenza media è \(3t\,\mathrm W\) per \(t>0\). Segui le due letture a partire dall’avvio. L’istantanea a \(t=0\) vale zero. La media dall’inizio richiede un intervallo di durata positiva.

## `SIM-C1-L007-03` · Ricavare la velocità dal lavoro netto

Un carrello da 2 kg parte da fermo. Il lavoro netto assegnato è l’aumento di energia cinetica, \(W=\frac12 mv^2\). Isola la velocità \(v=\sqrt{2W/m}\) e scegli la radice non negativa. L’interno della radice ha unità \(\mathrm{J/kg}=\mathrm{m^2/s^2}\). Con la massa assegnata il valore in metri al secondo è la radice del valore del lavoro in joule.

Con 9 J ottieni **3 m/s**. Con 8 J il risultato esatto è \(\sqrt8\,\mathrm{m/s}=2\sqrt2\,\mathrm{m/s}\). Per costruire un ingresso decimale a mano, eleva al quadrato due numeri vicini. \(282^2=(280+2)^2=79524\) e \(283^2=(280+3)^2=80089\). Dividi per 10.000. Ne segue \(2{,}82^2=7{,}9524<8<8{,}0089=2{,}83^2\). La radice è tra 2,82 e 2,83 e **2,83 m/s** è una trascrizione numerica compatibile con la tolleranza del banco. Confronta infine 4 J e 16 J. Quadruplicare il lavoro porta la velocità da 2 a 4 m/s.
