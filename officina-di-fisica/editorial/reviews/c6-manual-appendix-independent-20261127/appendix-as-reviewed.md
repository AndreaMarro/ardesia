# Risoluzioni manuali delle sei esperienze C6

Queste risoluzioni ricostruiscono i due compiti effettivi di ogni edizione sorgente. L’analisi scientifica è collegata ai ricalcoli indipendenti di C6. Le verifiche delle correzioni grafiche e il consolidamento sul runtime composto sono ancora in corso.

## `SIM-C6-L01-01` · Misurare una distanza con l’eco

La stessa sorgente emette e riceve l’impulso. Con riflettore fermo e velocità del suono uniforme, andata e ritorno hanno la stessa lunghezza. Se il cronometro misura il tempo totale $T$, per il tragitto di andata si usa $T/2$. Da $2d=cT$ si ricavano $d=cT/2$ e $T=2d/c$.

In un millisecondo il suono percorre $340/1000=0{,}34\,\mathrm{m}$. Ogni millisecondo in più nel tempo totale aumenta la distanza del riflettore di $0{,}17\,\mathrm{m}$. Per $10\,\mathrm{ms}$ si ottiene $0{,}17\cdot10=1{,}7\,\mathrm{m}$. Per $11\,\mathrm{ms}$ basta aggiungere $0{,}17\,\mathrm{m}$ e si arriva a $1{,}87\,\mathrm{m}$.

Nel disegno si può seguire prima l’impulso verso lo schermo e poi il ritorno al microfono. La distanza dalla sorgente cresce fino a $T/2$ e scende a zero quando l’impulso torna. Raddoppiare la risposta corrisponderebbe alla lunghezza di tutto il percorso. Per trasferire il metodo a un mezzo diverso si sostituisce la velocità del suono e si mantiene la divisione per due finché i cammini hanno la stessa lunghezza.

## `SIM-C6-L02-01` · Dalla massa raccolta alla velocità del fluido

La massa raccolta dice quanto liquido è passato attraverso la sezione. La densità uniforme dell’acqua trasforma massa in volume con $V=m/\rho$. Per un flusso stazionario, la portata è $Q=V/t$ e la velocità media sulla sezione è $v=Q/A$. Combinando le espressioni si trova $v=m/(\rho t A)$. Invertendola, una velocità media nota permette di prevedere la massa raccolta con $m=\rho t A v$.

Con $\rho=1\,\mathrm{g/cm^3}$, $t=4\,\mathrm{s}$ e $A=2\,\mathrm{cm^2}$ il calcolo si riduce alla divisione per 8. Da $24\,\mathrm{g}$ si ottengono $24\,\mathrm{cm^3}$, poi $6\,\mathrm{cm^3/s}$ e infine $3\,\mathrm{cm/s}$. Con $20\,\mathrm{g}$ la portata vale $5\,\mathrm{cm^3/s}$ e $5/2=2{,}5\,\mathrm{cm/s}$. Le unità si riducono a $\mathrm{cm^3/(s\,cm^2)}=\mathrm{cm/s}$.

Il recipiente si riempie progressivamente. Alla metà dei quattro secondi contiene metà della massa finale. Fermarsi dopo la divisione per quattro dà ancora una portata. Dividere anche per l’area consente di confrontare sezioni diverse a parità di volume raccolto.

## `SIM-C6-L03-01` · Dalla batteria al calorimetro

La tensione dà energia per unità di carica, la corrente dà carica per unità di tempo e il loro prodotto $P=VI$ dà energia per secondo. Con tensione, corrente e rendimento costanti, l’energia utile dopo un tempo $t$ vale $Q=\eta VIt$. La capacità termica $C$ lega tale energia all’aumento di temperatura con $Q=C\Delta T$. Si ottengono $\Delta T=\eta VIt/C$ e $t=C\Delta T/(\eta VI)$.

La batteria eroga $5\cdot2=10\,\mathrm{W}$. L’80% è $4/5$, quindi il calorimetro assorbe $8\,\mathrm{J}$ al secondo. Con $C=400\,\mathrm{J/K}$ risulta $\Delta T=(8/400)t=t/50$ in kelvin. A $80\,\mathrm{s}$ l’aumento è $80/50=8/5=1{,}6\,\mathrm{K}$. A $50\,\mathrm{s}$ si ottiene $1\,\mathrm{K}$. Usare tutti i $10\,\mathrm{W}$ equivale a impostare un rendimento del 100%.

Sul termometro si può seguire una crescita proporzionale al tempo. Raddoppiando la capacità termica a potenza utile costante, lo stesso aumento richiede il doppio del tempo.

## `SIM-C6-L04-01` · Riconoscere una legge di attenuazione

Ogni strato identico lascia passare la metà del segnale che lo raggiunge. Il calcolo segue la successione $S_{n+1}=S_n/2$, quindi $S_n=S_0/2^n$. Per risalire al segnale iniziale da una misura dopo $n$ strati si moltiplica per due una volta per strato, ottenendo $S_0=2^n S_n$.

Partendo da $120$ unità, si legge la sequenza $120\to60\to30\to15\to7{,}5$. Dopo tre strati restano $15$ unità e dopo quattro $7{,}5$. La diminuzione assoluta cambia da uno strato al successivo. Resta costante la frazione di segnale trasmessa. Questo si vede confrontando le letture prima e dopo ciascuno strato, invece di confrontare soltanto le differenze assolute.

## `SIM-C6-L05-01` · Sommare aree con segno

Sul grafico velocità-tempo, l’area del rettangolo di ciascun tratto vale $v\Delta t$. I tratti sopra l’asse danno spostamenti positivi e quelli sotto l’asse danno spostamenti negativi. La somma conserva il verso. Per ottenere la distanza percorsa si sommano i moduli delle aree.

Nei primi $2\,\mathrm{s}$ il carrello procede a $+2\,\mathrm{m/s}$ e guadagna $4\,\mathrm{m}$. Nei successivi $2\,\mathrm{s}$ torna a $-1\,\mathrm{m/s}$ e perde $2\,\mathrm{m}$. Dopo $4\,\mathrm{s}$ lo spostamento è $+4-2=+2\,\mathrm{m}$ mentre la distanza percorsa è $6\,\mathrm{m}$. A $1{,}75\,\mathrm{s}$ il carrello si trova ancora nel primo tratto. Poiché $1{,}75=7/4$, lo spostamento è $2(7/4)=7/2=3{,}5\,\mathrm{m}$.

Nel modello ideale il verso cambia istantaneamente a $2\,\mathrm{s}$. La posizione è continua e le pendenze ai due lati dell’istante di inversione valgono rispettivamente $+2$ e $-1\,\mathrm{m/s}$. Per trovare il tempo a partire dalla posizione si sceglie prima il tratto. Dividendo lo spostamento residuo per la velocità si trova il tempo trascorso in quel tratto, che va aggiunto al suo istante iniziale. Nel ritorno, per raggiungere $x=2\,\mathrm{m}$ partendo da $x=4\,\mathrm{m}$, il tempo trascorso è $(2-4)/(-1)=2\,\mathrm{s}$. Il cronometro dalla partenza indica $2+2=4\,\mathrm{s}$.

## `SIM-C6-L06-01` · Verificare la lente intorno alla distanza focale

Per una lente sottile convergente in approssimazione parassiale si usa $1/f=1/p+1/q$, con $p>0$ per l’oggetto reale. Moltiplicando per $f$ si ottiene $1=f/p+f/q$. Indicando con $u=p/f$ il controllo della simulazione, la lettura è $f/q=1-1/u$. Le unità di lunghezza si semplificano.

Per $u=2$ si ha $1-1/2=1/2=0{,}5$. Per $u=1{,}75=7/4$ si inverte la frazione e si calcola $1-4/7=3/7$. La divisione in colonna prosegue con $30=7\cdot4+2$, $20=7\cdot2+6$, $60=7\cdot8+4$ e $40=7\cdot5+5$. Dopo quattro cifre il resto vale $5/7$ di un decimillesimo. Poiché $5/7>1/2$, si arrotonda a $0{,}4286$, valore ammesso dalla risposta numerica.

Per $u>1$, $f/q$ è positivo e i raggi emergenti convergono verso un’immagine reale. Per $u<1$, il segno cambia e i prolungamenti dei raggi individuano l’immagine virtuale. Per $u=1$ i raggi emergono paralleli e $f/q=0$. Se si conosce la lettura $w=f/q$, si ricava $u=1/(1-w)$ nel dominio della prova.

[Edizioni sorgente](../../content/esperienze-C6.json) · [Ricalcolo indipendente dei dodici compiti](c4-c6-current-models-20261127/C6-cross-domain-comparison.json) · [Evidenze tecniche del browser](visibility139-cb9-run45917299096-20261127/C6/receipt.json).
