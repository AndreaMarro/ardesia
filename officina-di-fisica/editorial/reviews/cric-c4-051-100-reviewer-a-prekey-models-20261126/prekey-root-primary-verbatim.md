# C4 Q051–100 — derivazioni Root prima dei candidati

Preparazione matematica, non approvazione dei quesiti riscritti. Ho estratto e
letto soltanto i cinquanta prompt dalla fonte `5d1dc8dc7b601aef959d10d564c75462be74708d`.
Nessuna candidata C4, opzione, soluzione o figura è stata aperta per questa
preparazione. **Eccezione di esposizione antecedente:** durante un precedente
collaudo dei progressi avevo visto il valore3 relativo a C4-Q091 in
`tests/test_c4_editions.py`. La derivazione e il percorso SI091 qui sono reali,
ma non li presento come ciechi rispetto a quella chiave. Ho richiesto ad A una
risoluzione indipendente del solo091 dal prompt, prima del mio modello e dei
candidati. Gli altri49 non hanno questa esposizione nota. Zero credito di
revisione del corpus da questa preparazione; approvazione umana NOT_RUN.

Il modulo associato usa SymPy senza float e quindici percorsi Pint con
magnitudini Fraction. I risultati numerici trattano i valori assegnati come
dati del modello: per esempio ε₀=8,85×10⁻¹²F/m è il valore fornito, non una
dichiarazione che la costante fisica reale abbia esattamente quelle cifre.

## Circuiti resistivi

**C4-Q051.** I rami hanno la stessa tensione, quindi le conduttanze si sommano:
1/Rp=1/30+1/60=3/60=1/20, Rp=20Ω. Il resistore da10Ω è attraversato dalla corrente
totale e si somma a Rp: Rtot=30Ω. Ohm dà I=9/30=3/10A=0,3A. Non si sommano tutti
e tre i resistori: i primi due condividono i nodi.

**C4-Q052.** A tensione fissata P=VI e I=V/R, dunque P=V²/R. Per R positive diverse
e **V non nulla**, il resistore minore dissipa di più. Se V=0 entrambe le potenze
sono nulle: rendere esplicita la tensione non nulla se si chiede un confronto
strettamente maggiore. La regola P=I²R non autorizza a tenere uguale I nei rami.

**C4-Q053.** Il nome è nodo. Un filo ideale non presenta caduta di potenziale:
tutti gli estremi collegati da quel filo appartengono allo stesso nodo
equipotenziale, anche se il disegno li dispone lontani.

**C4-Q054.** I=20mA=20/1000A=1/50A. La potenza Joule è I²R=(1/2500)100=1/25W.
Per30s l’energia è E=Pt=30/25=6/5J=1,2J. Il quadrato riguarda anche il fattore
di conversione milli; non si moltiplica semplicemente I per R per ottenere energia.

**C4-Q055.** Dal parallelo 1/4=1/12+1/Rx. Sottraggo: 1/Rx=3/12−1/12=2/12=1/6.
Quindi Rx=6Ω. Controllo: l’equivalente4Ω è minore di entrambi i resistori
positivi6 e12Ω. La formula inversa è Rx=Req R/(R−Req), con0<Req<R.

**C4-Q056.** La sorgente ideale mantiene V; il resistore rimasto mantiene R.
La sua corrente V/R non cambia. Cambiano la corrente totale e la potenza totale
erogate dalla sorgente, non la tensione del ramo superstite. La conclusione
richiede il generatore ideale, non una batteria con resistenza interna arbitraria.

**C4-Q057.** Effetto Joule: l’energia elettrica ricevuta dal resistore si
trasferisce alla sua energia interna. L’energia totale non scompare.

**C4-Q058.** Nei due resistori in serie passa la stessa corrente: I=4/80=1/20A.
Sul secondo devono cadere12−4=8V. Pertanto R₂=8/(1/20)=160Ω. Il rapporto delle
tensioni8/4=2 coincide con quello delle resistenze160/80=2.

**C4-Q059.** Occorre seguire i fili: entrambi i resistori devono avere i due
estremi collegati alla stessa coppia di nodi. Vicinanza, altezza o orientamento
grafico non stabiliscono il collegamento elettrico.

**C4-Q060.** Per R costante, P=V²/R. Dimezzare V moltiplica P per(1/2)²=1/4:
8W diventano2W. Anche I si dimezza; il prodotto VI diventa un quarto.

## Un condensatore e il suo generatore

**C4-Q061.** Per il condensatore lineare la pendenza Q/V è C, quindi anche
ΔQ=CΔV. La variazione di tensione è5−2=3V, non5V. C=18μC/3V=6μF. I prefissi si
corrispondono perché μC/V=μF.

**C4-Q062.** Nel modello piano C=εA/d. Allontanare le armature riduce C; a Q
fissata |V|=|Q|/C aumenta nella stessa proporzione di d. **Q deve essere non
nulla** per un aumento stretto; se il condensatore è scarico resta V=0. Scrivere
«condensatore carico» e chiedere il modulo della tensione evita ambiguità di segno.

**C4-Q063.** L’unità è il farad:1F=1C/V. La capacità confronta la carica di una
armatura con la differenza di potenziale, non con una corrente.

**C4-Q064.** Inverto C=ε₀A/d: A=Cd/ε₀. Il rapporto88,5/8,85 vale10; i pF si
cancellano fra C e il valore di ε₀ espresso in pF/m. Risulta A=10m×(1/1000)m
=1/100m². Poiché1m²=10⁴cm², l’area è100cm². La conversione dell’area è quadratica;
non basta moltiplicare per100.

**C4-Q065.** Il lavoro elementare di carica è dU=Vdq: il grafico direttamente
associato al lavoro ha q orizzontale e V verticale. Per C costante V=q/C e
l’integrale da0 aQ è il triangolo U=QV/2. **Cautela per le alternative:** anche
il grafico inverso Q(V), se lineare, ha area numericamente uguale CV²/2.
Non classificarlo automaticamente come distrattore falso. Se si vuole una sola
scelta, specificare il grafico dell’integrale Vdq oppure costruire alternative
senza due triangoli entrambi equivalenti nel modello lineare.

**C4-Q066.** U=CV²/2, perciò ΔU=(5μF/2)(4²−2²)V²=(5/2)×12μJ=30μJ. Sottrarre
prima le tensioni e poi elevare al quadrato darebbe una diversa grandezza.
μF·V²=μJ, controllato anche nel percorso SI indipendente.

**C4-Q067.** Il generatore ideale collegato fissa la differenza di potenziale.
Inserendo il dielettrico cresce C e il generatore può fornire altra carica:
non si conserva automaticamente Q come nel condensatore isolato.

**C4-Q068.** Con la tensione **mantenuta a8V dal generatore**, U=CV²/2 è
proporzionale a C. Se C raddoppia,16μJ diventano32μJ. Se invece si scollegasse
la sorgente e si fissasse Q, varrebbe U=Q²/(2C) e il risultato sarebbe diverso.
Esplicitare che il collegamento resta durante l’inserimento.

**C4-Q069.** Q è il modulo su una sola armatura:7μC. La carica netta dell’intero
condensatore è zero, mentre la somma dei moduli sarebbe14μC: nessuna delle due
sostituisce Q nella definizione data.

**C4-Q070.** Da U=CV²/2 ricavo |V|=√(2U/C). Il radicando è200μJ/(8μF)=25V²;
la radice positiva è5V. Non serve approssimare una radice irrazionale. La
richiesta del modulo seleziona il valore non negativo.

## Nodi e collegamenti capacitivi

**C4-Q071.** In parallelo Ctot=2+3+5=10μF. Alla tensione4V la carica del nodo
positivo è Qtot=Ctot V=40μC. Per chiamarla carica «fornita» dal generatore
dall’inizio, precisare che i condensatori erano inizialmente scarichi; altrimenti
40μC è la carica finale e non necessariamente la variazione fornita.

**C4-Q072.** Il nodo centrale isolato e inizialmente neutro impone cariche
opposte e uguali in modulo sulle due sue armature. Quindi |Vᵢ|=|Q|/Cᵢ e il
condensatore minore sostiene la tensione maggiore. Per il confronto stretto
occorre una carica comune non nulla; a circuito scarico entrambe le tensioni sono zero.

**C4-Q073.** Si conserva la carica elettrica algebrica totale del nodo isolato,
inizialmente zero. Le cariche sulle sue parti si possono ridistribuire; non
si conservano separatamente su ciascuna armatura durante il transitorio.

**C4-Q074.** Per la serie3=9Cx/(9+Cx). Moltiplico:27+3Cx=9Cx, dunque6Cx=27 e
Cx=27/6=9/2μF=4,5μF. L’inversa è Cx=Ceq C₁/(C₁−Ceq), con0<Ceq<C₁.

**C4-Q075.** Ciascun nuovo nodo unisce una carica+CV e una−CV, quindi parte
con carica netta zero. Dopo il transitorio reale dissipativo il modulo della
tensione comune è0V. L’energia iniziale dei due campi non può essere imposta
costante ai soli condensatori: va nel circuito e nell’ambiente. Un collegamento
idealizzato senza alcuna dissipazione richiederebbe descrivere il transitorio.

**C4-Q076.** Prima il parallelo:3+6=9μF. Poi la serie di due9μF:
Ceq=9×9/(9+9)=81/18=9/2μF=4,5μF. Il raggruppamento va seguito attraverso i nodi,
non sommando tutti i valori senza distinguere i collegamenti.

**C4-Q077.** Il collegamento è in parallelo. La condizione determinante è la
stessa coppia di nodi; la stessa tensione ne segue come proprietà elettrica.

**C4-Q078.** La carica del nuovo nodo positivo è2μF×8V+6μF×4V=16+24=40μC.
La capacità complessiva è8μF: Vf=40/8=5V, compresa fra4 e8V. Il primo perde6μC
e il secondo ne riceve6. I campi passano da112 a100μJ: conservare la sola energia
dei condensatori darebbe una soluzione scorretta del transitorio reale.

**C4-Q079.** Inizialmente Uᵢ=CV²/2. Alla fine la capacità totale è2C e la
tensione V/2, quindi Uf=(2C)(V/2)²/2=CV²/4=Uᵢ/2. Ogni condensatore finale ha un
quarto dell’energia iniziale, ma ce ne sono due. La carica dei nodi si conserva.

**C4-Q080.** Cp=4+12=16μF e Cs=4×12/(4+12)=3μF. Il rapporto esatto è16/3,
adimensionale. Non richiedere la trascrizione di una rappresentazione decimale
infinita in un input Number a tolleranza zero: usare un risultato simbolico
selezionabile/accettato oppure una parametrizzazione o approssimazione manuale
con criterio di valutazione esplicito. La formula generale è(C₁+C₂)²/(C₁C₂).

## Forze e moto magnetico

**C4-Q081.** Il campo del filo è proporzionale alla corrente orientata.
Invertire I inverte il contributo B nel punto esterno fissato. Anche il modulo
resta uguale se si mantiene uguale |I|; non si può dedurre il campo totale in
presenza di altri contributi non specificati.

**C4-Q082.** Poiché v è perpendicolare a B, F=|q|vB. Quindi
|q|=2×10⁻⁶/(400×1/2)C=10⁻⁸C=10nC. È il modulo della carica, non il suo segno.
La conversione micro→nano dà un fattore1000, verificato nel percorso Pint.

**C4-Q083.** Antiparallela. Con q, v e B non nulli, F=qv×B è zero quando
sinθ=0, cioè per θ=0 oppureπ. Non è necessario che la particella sia ferma.

**C4-Q084.** F=IℓB sin30°=4×(3/10)×(1/5)×(1/2)N=3/25N=0,12N.
Il seno30° è esattamente1/2; non occorre una calcolatrice. L’angolo è quello
fra la direzione della corrente nel filo e B.

**C4-Q085.** Scelgo x a destra, y in alto, z uscente. Per la velocità+x e
campo−z, v×B è+y. La carica negativa inverte quel verso: forza−y, verso il
basso. Il prodotto vettoriale è verificato anche con matrici simboliche.

**C4-Q086.** Un quarto di periodo dura0,40ms, dunque T=4×0,40=1,60ms.
f=1/T=1000/1,6Hz=10000/16Hz=625Hz. Moltiplicare per quattro la frequenza
anziché ricostruire prima il periodo confonderebbe tempo e inverso del tempo.

**C4-Q087.** La traiettoria è un’elica. La componente parallela non subisce
la forza magnetica e resta costante; quella perpendicolare ruota. Il cerchio
è il caso limite con componente parallela nulla, escluso nel prompt.

**C4-Q088.** La potenza magnetica è q(v×B)·v=0 in ogni istante.
La velocità cambia direzione, ma non modulo: ΔK=0J anche dopo la deviazione90°.
L’identità è simbolica per componenti generiche, non basata su un singolo disegno.

**C4-Q089.** Dal moto circolare r=p/(|q|B). A parità di p e B, la carica+2e
ha raggio metà di quella+e. Non serve conoscere separatamente massa e velocità.

**C4-Q090.** L’assenza di deviazione richiede |q|E=|q|vB nelle condizioni
perpendicolari date. v=E/B=1200/(1/25)=30000m/s. La carica si cancella perché
è non nulla; l’opposizione dei versi è già assegnata dal prompt.

## Flusso e induzione

**C4-Q091 — esposizione limitata dichiarata.** Con la normale scelta,
Φ=BAcos60°=(3/10)(2/100)(1/2)Wb=3/1000Wb=3mWb. Il segno è positivo rispetto
a quella normale. La formula, la conversione e il controllo Pint sono derivati
qui, ma avevo già visto il valore3 nel vecchio test edizioni: serve la risoluzione
source-only distinta A richiesta, prima di dichiarare cecità completa del percorso.

**C4-Q092.** Φ è costante perché campo, area e orientamento non cambiano e la
spira è ferma. Faraday dà ℰ=−dΦ/dt=0. Non serve che Φ stesso sia zero.

**C4-Q093.** Lenz. La risposta indotta si oppone alla variazione del flusso
che la produce, non necessariamente al campo esterno preso isolatamente.

**C4-Q094.** |ℰmedia|=N|ΔΦ/Δt|, dunque il tasso medio per spira è
1,6/80=16/800=1/50Wb/s=0,020Wb/s. È un tasso medio: senza andamento temporale
non si conosce il valore istantaneo della derivata in ogni istante.

**C4-Q095.** Oraria dall’altro lato. Il moto fisico della carica non cambia;
cambia il lato da cui si guarda e quindi il nome dell’orientamento apparente.

**C4-Q096.** Prima Φᵢ=BA=0,005Wb, dopo Φf=−BA=−0,005Wb.
ΔΦ=−0,010Wb e |ℰmedia|=0,010/0,10=0,10V. Il mezzo giro cambia il segno del
flusso; usare soltanto BA per la variazione perderebbe il fattore due.

**C4-Q097.** Manca una corrente di conduzione che percorra continuamente
l’intera spira aperta attraverso l’interruzione isolante. Non per questo
scompaiono il campo elettrico indotto o la f.e.m.; restano possibili fenomeni
transitori, accumulo di carica e contributi di spostamento nel gap.

**C4-Q098.** Con resistenza costante e autoinduzione trascurabile,
I=−(1/R)dΦ/dt. Integrando, la carica netta ha modulo |ΔΦ|/R=0,030/5C
=0,006C=6mC. La monotonia evita di confondere questo modulo con una somma
di passaggi di carica in versi alternati.

**C4-Q099.** Durante l’ingresso aumenta il flusso entrante nel foglio.
L’induzione richiede un contributo uscente: la corrente è antioraria vista
dal davanti. Questa risposta si oppone all’ingresso e richiede lavoro esterno.

**C4-Q100.** Nei primi4ms il modulo della f.e.m. è8mWb/4ms=2V, nei successivi4ms
è zero. Sull’intero intervallo: |ℰmedia|=8mWb/8ms=1V. I due prefissi milli si
cancellano. Usare2V risponderebbe soltanto al primo tratto, non agli8ms richiesti.

## Limiti e passaggio al verificatore dei candidati

Questa primaria non approva le scelte di formulazione o i distrattori che
l’autore deve ancora creare. Il verificatore distinto dovrà leggere tutti i
campi e le figure, controllare le ipotesi052/062/068/071/072, il grafico065,
l’input manuale080 e la media094/100, oltre a ricalcolare ogni caso. I modelli
parametrici consentono una riparametrizzazione motivata senza copiare una
chiave originaria; ogni nuovo dato e ogni risultato devono essere verificati.

La compensazione091 è ora congelata da A in db4f4c7e, file
`editorial/reviews/cric-c4-q091-independent-source-only-a-20261126/primary.md`,
SHA2cf9272a6069e9aee71d7232ce83c4ea9d9ac6d93289dfa01a69b135cade7767.
A dichiara e documenta di avere letto soltanto id/prompt prima del modello
Root e dei candidati. Il risultato concorda con il calcolo Root; la limitata
esposizione Root resta dichiarata e non viene cancellata dalla storia.
