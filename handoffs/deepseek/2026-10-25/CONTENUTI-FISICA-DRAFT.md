# Fisica Ardesia - contenuti originali DRAFT

Documento di revisione, non un secondo prodotto o motore didattico. Tutti i contenuti sono proposte originali AI_CHECKED con approvazione umana assente.38famiglie e200sotto-obiettivi sono una mappa editoriale del syllabus universitario verificato: nessuna certificazione di corso completo.

Le risposte di verifica sono nel pacchettoJSON; nel prodotto l’adattamento usa i contrattiCore esistenti.

# strumenti-meccanica

Famiglie: 9; sotto-obiettivi con domanda finale: 52; stato DRAFT.

## U1-01 - Notazione scientifica

La notazione scientifica scrive un numero non nullo come a·10^n con 1≤|a|<10 e n intero. Nei prodotti si moltiplicano i coefficienti e si sommano gli esponenti; nei rapporti si dividono i coefficienti e si sottraggono gli esponenti. Per somme e differenze occorre prima esprimere i termini con la stessa potenza di dieci. Un esponente negativo non rende negativo il numero. Distingui arrotondamento a una cifra significativa e ordine di grandezza espresso come potenza di10. Qui per l’ordine di grandezza scegliamo la potenza più vicina sulla scala logaritmica:fra10^n e10^(n+1) la soglia è√10·10^n. La convenzione va dichiarata e non aggiunge precisione strumentale. Lo zero non ha esponente normalizzato unico. Mantieni le unità durante il calcolo e arrotonda soltanto alla fine.

**Esempio svolto.** Calcola (3,0·10^-3 m)(2,0·10^4 m).

1. Moltiplica coefficienti: 3·2=6.
2. Somma esponenti: −3+4=1.
3. Moltiplica unità: m·m=m².

**Risultato:** 6,0·10^1 m² = 60 m².

**Prova autonoma:** Calcola 2·10^-3 m + 5·10^-4 m.

**Risposta e feedback:** 2,5·10^-3 m 5·10^-4=0,5·10^-3: somma i coefficienti dopo aver uniformato gli esponenti.

**Trasferimento:** Un segnale dura 4·10^-6 s e si ripete dopo 2·10^-3 s. Qual è il rapporto durata/intervallo?

**Risposta e feedback:** 2·10^-3, adimensionale Dividi coefficienti e sottrai esponenti: (4/2)·10^(-6+3). Non è una durata.

**Errori tipici:** Sommare esponenti nelle addizioni; Scambiare esponente negativo con segno negativo

**Aiuti progressivi:** Uniforma la potenza nelle somme / Controlla la scala con un numero decimale

**Ripasso:** Normalizzare una potenza non cambia il valore.

## U1-02 - Grandezze e unità

Una grandezza fisica è associata a un valore e un’unità; la dimensione descrive il tipo fisico indipendentemente dalla scelta dell’unità. Nel SI lunghezza, massa e tempo usano m, kg e s; una forza ha dimensione MLT^-2 e unità N. Si possono sommare soltanto grandezze omogenee. Le conversioni di aree e volumi elevano al quadrato o al cubo anche il fattore di scala. Una grandezza estensiva, come massa o volume, si somma unendo sistemi compatibili; una intensiva, come densità e temperatura uniforme, non raddoppia duplicando il campione. Scalari come energia hanno un valore con segno ma nessuna direzione spaziale; vettori come spostamento richiedono direzione e verso. L’ordine di grandezza è una stima dichiarata, non un risultato esatto.

**Esempio svolto.** Converti 2 cm³ in m³ e 1,2 g/cm³ in kg/m³.

1. 1 cm=10^-2 m implica 1 cm³=10^-6 m³.
2. 2 cm³=2·10^-6 m³.
3. 1 g/cm³=10^-3 kg /10^-6 m³=1000 kg/m³.

**Risultato:** 2·10^-6 m³; 1200 kg/m³.

**Prova autonoma:** Si uniscono due campioni uguali di acqua alla stessa temperatura. Quali raddoppiano fra massa, volume, densità e temperatura?

**Risposta e feedback:** Massa e volume raddoppiano; densità e temperatura restano uguali nel modello senza scambi. Le prime due sono estensive. Densità e temperatura sono intensive nelle condizioni dichiarate.

**Trasferimento:** Una velocità è 72 km/h. Esprimila in m/s e confronta dimensionalmente v² con un’accelerazione.

**Risposta e feedback:** 20 m/s; v² ha m²/s², accelerazione m/s², quindi dimensioni diverse. 72·1000/3600=20. L’uguaglianza di qualche esponente non basta a rendere omogenee le grandezze.

**Errori tipici:** Convertire cm³ con un solo fattore100; Confondere scalare negativo con vettore

**Aiuti progressivi:** Scrivi il fattore con le unità che si cancellano / Controlla gli esponenti delle dimensioni

**Ripasso:** Le unità sono parte del risultato, non un’aggiunta cosmetica.

## U1-03 - Trigonometria

In un triangolo rettangolo seno e coseno sono rapporti tra cateti e ipotenusa: sinθ=opposto/ipotenusa, cosθ=adiacente/ipotenusa; tanθ=sinθ/cosθ dove cosθ non è nullo. Se θ è misurato dall’asse x positivo, le componenti di un vettore di modulo F sono Fx=F cosθ e Fy=F sinθ. Il quadrante stabilisce i segni. L’identità sin²θ+cos²θ=1 permette un controllo del modulo. Gradi e radianti rappresentano lo stesso angolo con scale diverse: π rad=180°. Specificare la modalità della calcolatrice evita di trattare 30 rad come 30°. La tangente non è definita per angoli con coseno nullo.

**Esempio svolto.** Una forza di 10 N forma 30° con +x. Trova le componenti usando sin30°=1/2 e cos30°=√3/2.

1. Fx=10√3/2=5√3 N.
2. Fy=10/2=5 N.
3. Il modulo è √(75+25)=10 N.

**Risultato:** Fx=5√3 N≈8,660 N; Fy=5 N.

**Prova autonoma:** Una forza di modulo10N è diretta a150° da+x. Quali sono i segni e le componenti?

**Risposta e feedback:** Fx=−5√3 N; Fy=+5 N Nel secondo quadrante il coseno è negativo e il seno positivo.

**Trasferimento:** Un segmento ha componenti 3 cm e 4 cm positive. Trova modulo, seno e tangente dell’angolo da +x.

**Risposta e feedback:** 5 cm; sinθ=4/5; tanθ=4/3 Identifica il cateto opposto all’angolo, quindi usa Pitagora e i rapporti.

**Errori tipici:** Scambiare seno e coseno senza dichiarare asse di riferimento; Ignorare il quadrante

**Aiuti progressivi:** Disegna il triangolo delle componenti / Controlla Fx²+Fy²=F²

**Ripasso:** Un angolo deve sempre avere asse di riferimento e unità dichiarati.

## U1-04 - Operazioni vettoriali

Un vettore descrive modulo, direzione e verso. In assi cartesiani ortogonali si scrive con componenti: il modulo è la radice della somma dei quadrati. Somma e differenza agiscono sulle componenti; non si sommano i moduli salvo casi allineati concordi. Il prodotto scalare A·B = AxBx + AyBy restituisce uno scalare, può essere negativo e vale zero per vettori ortogonali. Il prodotto vettoriale restituisce un vettore perpendicolare al piano: per due vettori nel piano xy la componente z è AxBy − AyBx, con segno dato dalla regola della mano destra. Scambiando i fattori il prodotto scalare resta uguale e quello vettoriale cambia segno. Le unità dei prodotti si moltiplicano. Una risultante nulla non impone che ciascuna forza sia nulla.

**Esempio svolto.** Due forze nel piano sono A=(3,4) N e B=(−3,4) N. Trova A+B, A−B, A·B e A×B.

1. Somma: (3−3,4+4)=(0,8) N; modulo 8 N.
2. Differenza: (3+3,4−4)=(6,0) N.
3. Scalare: 3(−3)+4·4=7 N². Vettoriale: z=3·4−4(−3)=24 N², verso +z.

**Risultato:** Risultante (0,8) N; differenza (6,0) N; scalare 7 N²; vettoriale (0,0,24) N².

**Prova autonoma:** Per C=(6,0) m e D=(0,8) m calcola modulo della somma e prodotto scalare.

**Risposta e feedback:** 10 m; 0 m² La somma è (6,8) m: Pitagora dà 10 m. I vettori sono ortogonali, quindi il prodotto scalare è nullo.

**Trasferimento:** Due spostamenti hanno componenti (2,−1) m e (−2,1) m. Un loro prodotto vettoriale nullo implica verso concorde? Motiva.

**Risposta e feedback:** No: sono opposti; somma nulla, prodotto scalare −5 m², prodotto vettoriale nullo. Il vettoriale nullo indica parallelismo, anche in verso opposto. Il segno dello scalare distingue questo caso.

**Errori tipici:** Sommare 5 N+5 N ottenendo sempre 10 N; Scrivere N invece di N² per prodotti fra forze; Invertire il segno di AxBy−AyBx

**Aiuti progressivi:** Disegna gli assi e scrivi ogni coppia ordinata / Somma prima le x e poi le y / Controlla se il risultato rispetta le simmetrie

**Ripasso:** Le operazioni sui vettori vanno verificate per componenti, verso e unità.

## U2-01 - Cinematica

La posizione x(t) dipende dal riferimento; lo spostamento è xf−xi e può essere nullo anche se il cammino percorso non lo è. La velocità media è Δx/Δt, l’istantanea è la pendenza locale di x(t); l’accelerazione è la pendenza di v(t). Il MRU ha x=x0+vt. Con accelerazione costante x=x0+v0t+at²/2 e v=v0+at. Nella caduta libera vicino alla Terra, trascurando l’aria, l’accelerazione è g verso il basso indipendentemente dalla massa. Nel lancio parabolico i moti orizzontale uniforme e verticale accelerato condividono il tempo. Nel moto circolare uniforme la velocità cambia direzione pur avendo modulo costante: a centripeta=v²/r verso il centro. Le componenti e i segni dipendono dagli assi scelti. L’accelerazione media non può essere ottenuta sottraendo soltanto i moduli delle velocità se cambia direzione.

**Esempio svolto.** Un corpo parte da fermo e si muove lungo +x con a=2 m/s² per 3 s. Trova v e Δx.

1. v=0+2·3=6 m/s.
2. Δx=0+2·3²/2=9 m.
3. La velocità media è (0+6)/2=3 m/s: in3s percorre9m.

**Risultato:** v=6 m/s; Δx=9 m.

**Prova autonoma:** Un corpo torna al punto di partenza dopo 10 s e 20 m di cammino. Qual è la velocità media? Un punto su cerchio r=2 m ha v=4 m/s: quale a?

**Risposta e feedback:** 0 m/s; accelerazione centripeta 8 m/s². Velocità media usa spostamento nullo; sul cerchio a=16/2 e il vettore punta al centro.

**Trasferimento:** Lancio orizzontale a 3 m/s da altezza 20 m, g=10 m/s², aria trascurata. Trova tempo di caduta e spostamento orizzontale.

**Risposta e feedback:** 2 s; 6 m 20=gt²/2 dà t=2 s. La coordinata orizzontale evolve con x=3t; i due moti non hanno tempi separati.

**Errori tipici:** Usare cammino al posto dello spostamento; Porre a=0 nel circolare uniforme; Far dipendere la caduta ideale dalla massa

**Aiuti progressivi:** Scegli gli assi / Distingui pendenza media e istantanea / Separa componenti ma conserva lo stesso tempo

**Ripasso:** Modulo costante della velocità non implica accelerazione nulla.

## U2-02 - Dinamica e forze

La prima legge dice che risultante nulla implica velocità costante, anche diversa da zero. La seconda usa la somma vettoriale delle forze sul medesimo corpo: ΣF=ma in un riferimento inerziale. Le forze di azione e reazione agiscono su corpi diversi e non si cancellano nel diagramma di un solo corpo. Vicino alla Terra il peso è mg; in generale l’attrazione fra masse segue GmM/r². La normale è perpendicolare al contatto e non è sempre uguale al peso. La tensione segue il filo ideale. L’attrito statico si adatta fino a μsN; quello dinamico ha modulo approssimato μdN e si oppone allo scorrimento relativo. Una molla ideale esercita forza di richiamo −kx: in equilibrio sotto una forza esterna F il modulo dell’allungamento è F/k, purché si resti nel regime elastico. Un equilibrio statico impone accelerazione nulla, non assenza di forze.

**Esempio svolto.** Una molla ideale di costante 20 N/m è tirata staticamente con forza 4 N. Qual è l’allungamento?

1. Disegna la forza esterna e quella elastica sul corpo.
2. In equilibrio i moduli si uguagliano: kx=F.
3. x=4/20=0,2 m, pari a 20 cm.

**Risultato:** x=0,2 m.

**Prova autonoma:** Una massa di 2 kg su piano orizzontale ha μs=0,4; g=10 m/s². Una forza orizzontale di 3 N la mette in moto?

**Risposta e feedback:** No; attrito statico 3 N, limite 8 N. N=20 N. La forza richiesta per l’equilibrio è sotto μsN: l’attrito non vale automaticamente 8 N.

**Trasferimento:** Una molla con k=80 N/m è sottoposta a 6 N; poi un corpo di 2 kg subisce risultante 6 N. Trova x e a, distinguendo i modelli.

**Risposta e feedback:** x=0,075 m; a=3 m/s². Hooke descrive l’equilibrio elastico; Newton descrive la variazione di velocità quando la risultante non è nulla.

**Errori tipici:** Applicare μsN come forza sempre presente; Cancellare azione e reazione sullo stesso corpo; Porre sempre N=mg

**Aiuti progressivi:** Scegli il corpo del diagramma / Distingui risultante e singola forza / Controlla equilibrio e regime elastico

**Ripasso:** Un diagramma delle forze corretto precede l’equazione del moto.

## U2-03 - Lavoro ed energia

Il lavoro di una forza costante è W=Fs cosθ; è negativo se la componente della forza si oppone allo spostamento e nullo per forza perpendicolare. La potenza media è W/Δt e misura il ritmo del trasferimento energetico. Il teorema dell’energia cinetica lega il lavoro totale a ΔK, con K=mv²/2. Per una forza conservativa il lavoro è −ΔU: vicino alla Terra Ug=mgh, per una molla ideale Ue=kx²/2. Se agiscono solo forze conservative, K+U resta costante. Con attrito l’energia meccanica diminuisce mentre l’energia complessiva, includendo quella interna e l’ambiente, resta conservata. Lo zero dell’energia potenziale è convenzionale; le differenze producono previsioni. Non applicare conservazione dell’energia meccanica a un sistema che riceve lavoro esterno non incluso.

**Esempio svolto.** Una massa di2kg cade da5m, parte da ferma e non incontra attrito; g=10m/s². Trova K finale e v.

1. ΔUg=−mgh=−100J.
2. K finale=100J.
3. v=√(2K/m)=10m/s.

**Risultato:** 100J;10m/s.

**Prova autonoma:** Una forza di10N agisce per3m in verso opposto allo spostamento. Qual è il lavoro?

**Risposta e feedback:** −30J Il coseno di180° è−1; il lavoro negativo riduce l’energia cinetica se non intervengono altri lavori.

**Trasferimento:** Una molla k=100N/m compressa di0,2m trasferisce idealmente energia a un corpo di1kg. Trova energia, velocità e potenza media se il trasferimento dura0,5s.

**Risposta e feedback:** 2J;2m/s;4W Ue=100·0,04/2=2J; v²=4; Pmedia=2/0,5. Il tempo non cambia l’energia disponibile.

**Errori tipici:** UsareW=Fs quando la forza è perpendicolare; ConservareK+U anche con attrito non contabilizzato

**Aiuti progressivi:** Definisci sistema e forze / Confronta energia iniziale e finale / Verifica joule e watt distinti

**Ripasso:** Il lavoro totale cambiaK; le forze conservative consentono di introdurreU.

## U2-04 - Impulso e quantità di moto

La quantità di moto p=mv è vettoriale e si misura in kg m/s. L’impulso della risultante esterna è Δp: se la forza è costante J=FΔt. La quantità di moto totale si conserva quando l’impulso esterno sul sistema è nullo o trascurabile nell’intervallo considerato. In un urto le forze interne di interazione non cambiano la quantità di moto totale ma possono convertire energia cinetica in energia interna. Un urto elastico conserva anche l’energia cinetica; un urto completamente anelastico fa proseguire insieme i corpi e di norma dissipa parte diK. Un sistema isolato non richiede che ogni singolo corpo mantenga la propria velocità. I segni delle velocità devono riferirsi a un unico asse.

**Esempio svolto.** Un carrello di2kg a3m/s urta un carrello di1kg fermo. Restano uniti; impulso esterno trascurabile. Trova velocità finale eK persa.

1. piniziale=2·3=6kg m/s.
2. Mtotale=3kg: vf=6/3=2m/s.
3. Ki=9J,Kf=6J;3J convertiti in energia interna.

**Risultato:** vf=2m/s;Kpersa=3J.

**Prova autonoma:** Una massa di0,2kg cambia velocità da+5 a−5m/s. Qual è l’impulso?

**Risposta e feedback:** −2kg m/s = −2N s Δp=0,2(−5−5)=−2. Sottrarre i soli moduli darebbe erroneamente zero.

**Trasferimento:** Su un sistema inizialmente fermo agisce una forza esterna di4N per0,5s. La quantità di moto si conserva? Quanto diventa?

**Risposta e feedback:** No;Δp=+2kg m/s nella direzione della forza. L’impulso esterno è diverso da zero. Le forze interne non eliminano il contributo della forza esterna.

**Errori tipici:** Conservare sempre l’energia cinetica negli urti; Sommare moduli invece di componenti

**Aiuti progressivi:** Scrivi l’impulso esterno / Scegli sistema e asse / Controlla separatamentep eK

**Ripasso:** Conservazione dip ed energia cinetica sono condizioni diverse.

## U2-05 - Sistemi e leve

Il centro di massa ha posizione xCM=Σmixi/Σmi. La sua accelerazione soddisfa M aCM=ΣFesterne: le forze interne non spostano da sole il centro di massa di un sistema isolato. Un corpo rigido idealizza distanze interne costanti e può comunque traslare e ruotare. Il momento torcente di una forza rispetto a un polo è τ=r×F; nel piano ha modulo forza per braccio perpendicolare e segno legato al verso di rotazione. Un equilibrio statico richiede sia risultante delle forze sia somma dei momenti nulle. Nelle leve del corpo umano un piccolo braccio muscolare può richiedere forza grande anche per carichi moderati. Il momento si esprime in N m ma non va interpretato come energia trasferita.

**Esempio svolto.** Una leva è in equilibrio: carico20N a0,30m dal fulcro e forza muscolare perpendicolare sul lato opposto a0,05m. Trova la forza.

1. Momento del carico=20·0,30=6N m.
2. Il momento muscolare deve avere modulo6N m e verso opposto.
3. F=6/0,05=120N.

**Risultato:** 120N.

**Prova autonoma:** Masse1kg a x=0 e3kg a x=4m: trova xCM.

**Risposta e feedback:** 3m La media è pesata dalle masse: (1·0+3·4)/4=3.

**Trasferimento:** Due forze uguali e opposte, applicate su linee distinte, hanno risultante nulla. Basta per equilibrio? Descrivi il caso.

**Risposta e feedback:** No; possono formare una coppia con momento totale non nullo. La traslazione può essere in equilibrio mentre il corpo accelera nella rotazione. Verifica entrambi i bilanci.

**Errori tipici:** Usare distanza dal fulcro anziché braccio perpendicolare; ConsiderareΣF=0 sufficiente

**Aiuti progressivi:** Disegna fulcro e linee di azione / Assegna il segno ai momenti / Esegui anche il bilancio delle forze

**Ripasso:** Equilibrio traslazionale e rotazionale vanno controllati separatamente.

## Verifica finale per ogni sotto-obiettivo

**U1-01.01** Normalizza 0,00072 usando una sola cifra non nulla prima della virgola.

Risposta proposta: 7,2·10^-4.

**U1-01.02** Calcola (8·10^5)/(2·10^2).

Risposta proposta: 4·10^3; nel rapporto gli esponenti si sottraggono.

**U1-01.03** Determina l’ordine di grandezza di4,8·10^3 scegliendo la potenza di10 più vicina sulla scala logaritmica:la soglia fra10^n e10^(n+1) è√10·10^n.

Risposta proposta: 10^4,poiché4,8>√10≈3,162. È una convenzione dichiarata per l’ordine di grandezza;arrotondare a una cifra significativa darebbe invece5·10^3.

**U1-02.01** Una formula somma una velocità e un’accelerazione senza un fattore temporale. È dimensionalmente omogenea?

Risposta proposta: No: L/T e L/T² non sono dimensioni sommabili.

**U1-02.02** Quali unità SI hanno massa,tempo e lunghezza?

Risposta proposta: kg,s,m rispettivamente.

**U1-02.03** Converti 250mL in m³.

Risposta proposta: 2,5·10^-4m³; 1mL=10^-6m³.

**U1-02.04** Un adulto ha altezza circa2m: una stima di2·10^3m è compatibile con la scala dichiarata?

Risposta proposta: No: è mille volte maggiore e corrisponde a2km.

**U1-02.05** Triplicando un campione omogeneo alla stessa temperatura quali cambiano fra massa e temperatura?

Risposta proposta: La massa triplica, la temperatura resta invariata nel modello; massa estensiva,Tintensiva.

**U1-02.06** Un valore di energia negativo rende l’energia una grandezza vettoriale?

Risposta proposta: No: lo scalare può avere segno; un vettore richiede anche direzione e verso.

**U1-03.01** Un triangolo rettangolo ha cateto opposto3 e ipotenusa5. Quanto vale il seno dell’angolo considerato?

Risposta proposta: 3/5; rapporto adimensionale.

**U1-03.02** Un triangolo rettangolo ha ipotenusa5 e cateto adiacente4 rispetto all’angolo considerato. Quanto vale il coseno?

Risposta proposta: 4/5,rapporto fra cateto adiacente e ipotenusa.

**U1-03.03** Quanto vale la tangente nell’angolo con seno3/5 e coseno4/5?

Risposta proposta: 3/4; tangente=seno/coseno.

**U1-03.04** Un vettore di modulo7N è a90° da+x. Quali componenti?

Risposta proposta: Fx=0N,Fy=7N; l’angolo è rispetto all’assexpositivo.

**U1-04.01** Un vettore ha componenti(−5,12)m. Qual è il modulo?

Risposta proposta: 13m; il segno di una componente non rende negativo il modulo.

**U1-04.02** Somma(1,2)N e(4,−5)N.

Risposta proposta: (5,−3)N.

**U1-04.03** Calcola(7,1)m−(2,−3)m.

Risposta proposta: (5,4)m.

**U1-04.04** Calcola il prodotto scalare di(2,1)m e(−1,2)m.

Risposta proposta: 0m²: i vettori sono ortogonali.

**U1-04.05** Calcola la componentez di(1,0,0)N×(0,3,0)N.

Risposta proposta: +3N²; scambiando l’ordine sarebbe−3N².

**U2-01.01** Da x=−2m a x=5m, qual è lo spostamento? Coincide necessariamente col cammino?

Risposta proposta: +7m; il cammino può essere maggiore se vi sono inversioni.

**U2-01.02** Due corpi seguono lo stesso cerchio ma con tempi diversi. Hanno necessariamente la stessa legge oraria?

Risposta proposta: No: la traiettoria è geometrica; la legge oraria specifica posizione e tempo.

**U2-01.03** Un corpo compie spostamento12m in4s e termina con velocità1m/s. Qual è la velocità media e coincide con quella finale?

Risposta proposta: 3m/s; non coincide in questo caso.

**U2-01.04** La velocità passa da−1 a5m/s in3s. Qual è l’accelerazione media? Quando coincide con quella istantanea in tutto l’intervallo?

Risposta proposta: 2m/s²; se l’accelerazione è costante.

**U2-01.05** MRU:x0=−3m,v=2m/s,t=5s. Trova x.

Risposta proposta: 7m.

**U2-01.06** Moto a costante:x0=1m,v0=1m/s,a=2m/s²,t=2s. Trova x e v.

Risposta proposta: x=7m;v=5m/s.

**U2-01.07** Due masse diverse cadono nel vuoto dalla stessa quota e da ferme. Quale arriva prima nel modello localegcostante?

Risposta proposta: Arrivano insieme: l’accelerazione ideale èg per entrambe.

**U2-01.08** Un proiettile ha velocità iniziale(8,6)m/s,g=10m/s² e torna alla quota iniziale. Quali tempo di volo e gittata, senza aria?

Risposta proposta: 1,2s e9,6m; il tempo verticale è2·6/10.

**U2-01.09** Moto circolare uniforme:r=0,5m,v=2m/s. Quali modulo e direzione di a?

Risposta proposta: 8m/s² verso il centro, non tangente.

**U2-02.01** Un corpo isolato ha velocità iniziale non nulla in un riferimento inerziale. Deve fermarsi secondo il primo principio?

Risposta proposta: No: mantiene velocità vettoriale costante.

**U2-02.02** Su3kg agisce risultante(9,0)N. Qual è l’accelerazione?

Risposta proposta: (3,0)m/s².

**U2-02.03** Un dito spinge un tavolo. La reazione del tavolo annulla la forza sul tavolo nel suo diagramma?

Risposta proposta: No: la reazione agisce sul dito, un altro corpo.

**U2-02.04** Risultante nulla implica corpo fermo?

Risposta proposta: No: implica accelerazione nulla,compatibile con velocità costante non nulla.

**U2-02.05** Con g=9,8m/s² qual è il peso di0,5kg? Se la distanza da una massa puntiforme raddoppia come varia l’attrazione?

Risposta proposta: 4,9N; l’attrazione gravitazionale puntiforme diventa1/4.

**U2-02.06** Un blocco di peso10N è su piano orizzontale e riceve spinta verticale verso il basso di4N. Qual è la normale in equilibrio?

Risposta proposta: 14N; normale non sempre uguale al solo peso.

**U2-02.07** Un blocco conN=10N eμs=0,5 è tirato con2N ma resta fermo. Qual è l’attrito statico? Se scivola conμd=0,3 quale attrito dinamico?

Risposta proposta: 2N nel primo caso;3N nel secondo modello.

**U2-02.08** Una massa1kg è sospesa in equilibrio a un filo ideale,g=10m/s². Qual è la tensione e su quale direzione agisce?

Risposta proposta: 10N lungo il filo verso il punto di sospensione sul corpo.

**U2-02.09** Molla ideale:k=50N/m,x=0,04m. Qual è la forza di richiamo con asse positivo nell’allungamento?

Risposta proposta: −2N; modulo2N.

**U2-03.01** Forza5N e spostamento2m sono perpendicolari. Qual è il lavoro di quella forza?

Risposta proposta: 0J; il prodotto scalare è nullo.

**U2-03.02** Un motore trasferisce90J in3s. Qual è la potenza media?

Risposta proposta: 30W.

**U2-03.03** Il lavoro totale su un corpo è−6J eKiniziale=10J. TrovaKfinale.

Risposta proposta: 4J.

**U2-03.04** Una forza conservativa ha lavoro nullo su un percorso chiuso. Vale anche per attrito radente che dissipa energia?

Risposta proposta: No: l’attrito compie lavoro negativo lungo il percorso e non ammette lo stesso potenziale.

**U2-03.05** Con m=1kg,g=10m/s² e innalzamento2m,quanto cresceUg? Con k=40N/m e x=0,1m,quanto valeUe rispetto a x=0?

Risposta proposta: 20J;0,2J.

**U2-03.06** Un sistema ideale passa daK=3J,U=9J aU=5J senza lavori non conservativi. TrovaKfinale.

Risposta proposta: 7J; l’energia meccanica totale resta12J.

**U2-04.01** Massa0,4kg a velocità−3m/s. Quanto vale la quantità di moto lungo l’asse?

Risposta proposta: −1,2kg m/s.

**U2-04.02** Una forza risultante costante−6N dura0,2s. Qual è l’impulso?

Risposta proposta: −1,2N s.

**U2-04.03** Quale condizione esterna permette di conservare la quantità di moto totale durante un urto?

Risposta proposta: Impulso esterno totale nullo o trascurabile nell’intervallo,con sistema esplicitato.

**U2-04.04** Due masse uguali,una a4m/s e una ferma,restano unite dopo urto con impulso esterno nullo. Qual èvf? L’energia cinetica si conserva?

Risposta proposta: 2m/s; non si conservaK,parte diventa energia interna.

**U2-05.01** Masse2kg a x=1m e2kg a x=5m: quale centro di massa?

Risposta proposta: xCM=3m.

**U2-05.02** Se la risultante esterna su un sistema di massa5kg è10N,quale accelerazione del centro di massa?

Risposta proposta: 2m/s² nella direzione della risultante.

**U2-05.03** Un corpo rigido deve restare immobile?

Risposta proposta: No: rigidità idealizza distanze interne costanti; può traslare e ruotare.

**U2-05.04** Forza8N con braccio perpendicolare0,25m: quale modulo del momento?

Risposta proposta: 2N m.

**U2-05.05** Un corpo ha risultante nulla ma momento totale3N m. È in equilibrio statico?

Risposta proposta: No: manca il bilancio rotazionale.

**U2-05.06** Un muscolo ha braccio0,04m e deve bilanciare un momento di8N m. Quale forza perpendicolare?

Risposta proposta: 200N; un piccolo braccio richiede forza elevata.

# fluidi-termodinamica

Famiglie: 10; sotto-obiettivi con domanda finale: 57; stato DRAFT.

## U3-01 - Pressione e densità

Un fluido in equilibrio non sostiene uno sforzo tangenziale statico senza deformarsi continuamente; un solido può sostenere taglio. Densitàρ=m/V e pressione p=Fperpendicolare/A sono grandezze intensive nel modello omogeneo. La pressione non coincide con una forza: la stessa pressione su aree diverse produce forze diverse. L’unità Pa è N/m². La pressione assoluta si riferisce al vuoto; quella manometrica è la differenza rispetto all’ambiente. La densità collega massa e volume ma da sola non determina la pressione senza informazioni su quota, moto e condizioni al contorno. In un fluido fermo la pressione in un punto è isotropa; in moto non usare automaticamente la sola legge idrostatica.

**Esempio svolto.** Una forza perpendicolare di30N agisce su un’area di2·10^-4m². Trova la pressione.

1. p=F/A.
2. 30/(2·10^-4)=1,5·10^5.
3. N/m²=Pa.

**Risultato:** 150000Pa.

**Prova autonoma:** Un campione ha massa0,8kg e volume1L. Trovaρ.

**Risposta e feedback:** 800kg/m³ 1L=0,001m³:ρ=0,8/0,001.

**Trasferimento:** La stessa pressione viene applicata a un’area tripla. Cambia la forza? E la densità duplicando un campione omogeneo?

**Risposta e feedback:** Forza tripla; densità invariata. F=pA mentreρ=m/V: duplicando il campione raddoppiano sia massa sia volume.

**Errori tipici:** Usare un’area in cm² come m²; Trattare pressione e forza come sinonimi

**Aiuti progressivi:** Converti le aree / Distingui proprietà del campione e carico applicato

**Ripasso:** Pressione e densità richiedono definizioni e unità differenti.

## U3-02 - Idrostatica

Stevino dà p=p0+ρgh per fluido omogeneo fermo: h è profondità positiva eρgh è un incremento, non sempre la pressione assoluta. Pascal descrive la trasmissione di un incremento di pressione in fluido incomprimibile confinato, base della pressa idraulica. Archimede dà una spinta verso l’alto pari al peso del fluido spostato,ρfluido gVimmerso. Un corpo galleggiante in equilibrio ha spinta uguale al peso e frazione immersaρcorpo/ρfluido se omogeneo; un corpo più denso del fluido non può galleggiare liberamente. Nel barometro di Torricelli la colonna equilibra la pressione esterna rispetto al vuoto approssimato sopra il liquido. Un manometro confronta pressioni attraverso differenze di livelli; conta densità e dislivello verticale, non lunghezza del tubo.

**Esempio svolto.** Acquaρ=1000kg/m³,g=10m/s²,h=2m,p0=100000Pa. Trova incremento e pressione assoluta.

1. Δp=1000·10·2=20000Pa.
2. p=p0+Δp.
3. 100000+20000=120000Pa.

**Risultato:** Δp=20000Pa;p=120000Pa.

**Prova autonoma:** Un corpo omogeneoρ=600kg/m³ galleggia in acquaρ=1000. Quale frazione è immersa?

**Risposta e feedback:** 0,6 =60% Uguagliaρacqua gVimmerso aρcorpo gVtotale. g eVtotale si semplificano.

**Trasferimento:** Pressa idraulica: pistoni di1cm² e20cm², stessa quota, perdite trascurate. Applico10N sul piccolo. Quale forza sul grande e quale spostamento relativo?

**Risposta e feedback:** 200N; lo spostamento del grande è1/20 del piccolo. Stessa pressione e conservazione volume: il guadagno di forza non crea energia.

**Errori tipici:** SostituireVtotale aVimmerso in ogni caso; Chiamareρgh pressione assoluta senzap0

**Aiuti progressivi:** Disegna quote e superfici libere / Scrivi equilibrio delle forze e volumi

**Ripasso:** La spinta dipende dal fluido spostato e la pressione dalla profondità verticale.

## U3-03 - Continuità e Bernoulli

La portata volumetrica è Q=ΔV/Δt=Avmedia; per fluido incomprimibile in moto stazionario senza diramazioni Av è costante. Più in generale si conserva la portata di massaρAv. Stazionario significa campi invariati nel tempo in ogni posizione e non implica velocità uguale ovunque; laminare significa flusso ordinato, mentre turbolento presenta fluttuazioni e rimescolamento. Bernoulli lungo una linea di corrente ideale lega p+ρv²/2+ρgh costante, in regime stazionario incomprimibile senza dissipazione o pompe. In un restringimento alla stessa quota il modello predice velocità maggiore e pressione statica minore. Nel tratto dilatato avviene il contrario. Sangue e vasi reali sono viscosi, pulsanti e deformabili: il risultato ideale non è una diagnosi clinica.

**Esempio svolto.** Acqua in tubo orizzontale: A1=4cm²,A2=2cm²,v1=1m/s,ρ=1000kg/m³. Trova v2 ep2−p1 con Bernoulli ideale.

1. Continuità:v2=A1v1/A2=2m/s.
2. p2−p1=ρ(v1²−v2²)/2.
3. 1000(1−4)/2=−1500Pa.

**Risultato:** v2=2m/s; p2−p1=−1500Pa.

**Prova autonoma:** Un flusso è2L/min. Quanto volume passa in30s?

**Risposta e feedback:** 1L =0,001m³ 30s è mezzo minuto: volume=portata per tempo.

**Trasferimento:** In un aneurisma idealizzato l’area raddoppia a quota invariata. A portata costante, come cambiano velocità e pressione statica nel modello ideale?

**Risposta e feedback:** Velocità si dimezza; pressione statica aumenta. Continuità prima, Bernoulli dopo. Non estendere il risultato a un vaso reale senza considerare perdite e pulsazioni.

**Errori tipici:** Dire che stazionario significa velocità uniforme; ApplicareBernoulli senza perdite a qualunque circuito

**Aiuti progressivi:** CalcolaQ prima della pressione / Elenca le ipotesi del modello

**Ripasso:** Continuità conserva massa; Bernoulli conserva energia meccanica nel modello ideale.

## U3-04 - Viscosità e Poiseuille

La viscosità descrive la resistenza allo scorrimento fra strati. Nel modello newtoniano lo sforzo tangenziale è proporzionale al gradiente di velocità. In tubo cilindrico lungo e rigido con flusso stazionario laminare, fluido incomprimibile newtoniano e aderenza alle pareti, il profilo è parabolico: velocità nulla sulla parete e massima sull’asse, doppia della media. Poiseuille dà Q=πr^4Δp/(8ηL) e resistenza idraulica Rh=Δp/Q. In serie le resistenze si sommano; in parallelo si sommano le conduttanze1/Rh. AΔp fissata raddoppiare r moltiplicaQ per16; aQ fissata invece cambia la pressione necessaria. Non confondere un profilo ideale con previsione quantitativa per sangue in ogni vaso o moto turbolento.

**Esempio svolto.** Due tubi identici hanno ciascuno resistenza idraulicaR=10^8Pa s/m³. ConΔp=100Pa trovaQ equivalente in serie e parallelo.

1. Serie:Req=2·10^8Pa s/m³,Q=100/Req.
2. Parallelo:Req=R/2=5·10^7Pa s/m³.
3. Qserie=5·10^-7m³/s;Qparallelo=2·10^-6m³/s.

**Risultato:** 0,5mL/s in serie;2mL/s in parallelo.

**Prova autonoma:** AΔp,η,L fissati il raggio si dimezza. Quale rapporto Qnuova/Qvecchia?

**Risposta e feedback:** 1/16 La dipendenza è sulla quarta potenza del raggio, non sulla sola area.

**Trasferimento:** Un flusso laminare ha velocità media0,03m/s. Nel modello diPoiseuille quale massima sull’asse? Se raddoppiaη aΔp fissata?

**Risposta e feedback:** 0,06m/s; portata dimezzata. Per il profilo parabolico vmax=2vmedia eQ è inversamente proporzionale alla viscosità.

**Errori tipici:** VariareQ senza specificare cosa resta fisso; Usare diametro al posto del raggio nella formula

**Aiuti progressivi:** Scrivi tutte le quantità mantenute costanti / Confronta rapporti prima dei valori assoluti

**Ripasso:** Poiseuille ha un dominio fisico preciso e una forte sensibilità geometrica.

## U3-05 - Superfici e capillarità

La tensione superficialeγ misura la forza per lunghezza lungo un’interfaccia e, in forma equivalente, il costo energetico per area creata. La superficie tende a ridurre area; su piccole gocce il suo effetto può competere con la gravità. La capillarità dipende da tensione, bagnabilità, geometria e gravità: un liquido che bagna una parete può risalire in un tubo stretto mentre un liquido non bagnante può deprimersi. La pressione attraverso un’interfaccia curva differisce fra i due lati; qualitativamente, a pariγ, maggiore curvatura richiede maggiore salto di pressione. Un’interfaccia piana ideale non ha contributo di pressione da curvatura. Per il syllabus la legge diLaplace va interpretata qualitativamente; formule quantitative diverse per gocce e bolle non vanno introdotte senza dichiarare le superfici e fornire la legge.

**Esempio svolto.** Due gocce sferiche dello stesso liquido hanno raggi r e2r. Senza usare coefficienti numerici diLaplace, quale richiede maggior salto di pressione e perché?

1. La goccia più piccola ha maggiore curvatura.
2. Aγ uguale il salto di pressione cresce con la curvatura.
3. La goccia di raggio r richiede salto maggiore.

**Risultato:** La goccia più piccola.

**Prova autonoma:** Un liquido bagna due capillari uguali salvo raggio, r e2r. In quale la risalita è maggiore, a parità delle altre condizioni?

**Risposta e feedback:** Nel capillare di raggio r. Nel modello statico usuale la risalita cresce restringendo il tubo; bagnabilità e menisco sono ipotesi essenziali.

**Trasferimento:** Una pellicola aumenta l’area di0,002m² aγ=0,05J/m², con una sola interfaccia dichiarata. Quale energia superficiale aggiuntiva?

**Risposta e feedback:** 0,0001J La legge fornita èΔE=γΔA. Una pellicola con due facce richiederebbe contare entrambe; qui il testo ne specifica una.

**Errori tipici:** Confondere goccia e bolla a due superfici; Attribuire sempre risalita senza bagnabilità

**Aiuti progressivi:** Identifica il numero di interfacce / Confronta curvatura e raggio

**Ripasso:** Curvatura, bagnabilità e numero di superfici determinano il modello.

## U5-01 - Stato e gas ideale

Un sistema è la porzione che analizziamo; l’ambiente è ciò con cui scambia energia o materia. Lo stato di un gas in equilibrio è descritto da pressione, volume, temperatura e quantità di sostanza. Pressione e temperatura sono intensive; volume e numero di moli sono estensivi. Una funzione di stato dipende dagli estremi, non dal percorso. La temperatura termodinamica si misura in kelvin: T(K)=t(°C)+273,15; gli intervalli hanno la stessa ampiezza ma gli zeri differiscono. Nel modello di gas ideale pV=nRT, con p assoluta in Pa, V in m³, n in mol e T in K. La pressione manometrica non può essere inserita senza aggiungere quella ambiente. A n e T costanti raddoppiare p dimezza V. Il modello non descrive condensazione o interazioni fra molecole di gas reali e richiede uno stato uniforme di equilibrio.

**Esempio svolto.** Un campione ideale di 1 mol è a 300 K e pressione assoluta 100000 Pa. Usa R=8,31446261815324 J/(mol K) e trova V.

1. Isola il volume: V=nRT/p.
2. Il numeratore vale 1·8,31446261815324·300=2494,338785445972 J.
3. V=2494,338785445972/100000=0,02494338785445972 m³, circa 24,9434 L.

**Risultato:** V=0,02494338785445972 m³.

**Prova autonoma:** Con n=1 mol e p=100000 Pa la temperatura passa da 300 K a 600 K. Quanto vale il nuovo volume? R=8,31446261815324.

**Risposta e feedback:** 0,04988677570891944 m³ A pressione e moli costanti il volume è proporzionale alla temperatura assoluta, quindi raddoppia.

**Trasferimento:** Un campione di 0,5 mol è a 400 K e 200000 Pa. Trova V con R=8,31446261815324.

**Risposta e feedback:** 0,00831446261815324 m³ nT=200 mol K e nRT=1662,892523630648 J. La divisione per 200000 Pa dà circa 8,31446 L.

**Errori tipici:** Usare °C in pV=nRT; Inserire pressione manometrica come assoluta; Confondere m³ e L

**Aiuti progressivi:** Riconosci il sistema e lo stato di equilibrio / Converti a kelvin e pressione assoluta / Isola la variabile e verifica la proporzionalità

**Ripasso:** pV=nRT richiede unità coerenti e temperatura assoluta.

## U5-02 - Calore e calorimetria

Il calore è energia trasferita per differenza di temperatura e non una sostanza contenuta nel corpo. Senza cambiamenti di stato, Q=mcΔT=CΔT per calore specifico c e capacità termica C=mc nelle condizioni dichiarate. Nei gas ideali c e capacità dipendono dal vincolo: a pressione costante parte del calore serve al lavoro di espansione, quindi Cp>Cv e per una mole Cp−Cv=R. In una transizione di fase ideale a pressione fissata l’energia Q=mL può cambiare la fase senza cambiare T. Fusione ed evaporazione assorbono energia, condensazione e solidificazione la cedono. In calorimetria isolata la somma dei calori scambiati è zero includendo recipiente e transizioni se rilevanti. La media aritmetica delle temperature vale solo per uguali capacità senza cambiamenti di stato.

**Esempio svolto.** Una massa0,2kg, c=4200J/(kg K), si scalda da20a30°C senza transizioni. TrovaQ.

1. ΔT=10K, stesso intervallo di10°C.
2. C=0,2·4200=840J/K.
3. Q=840·10=8400J.

**Risultato:** 8400J assorbiti.

**Prova autonoma:** Masse uguali di acqua a20e60°C sono miscelate in recipiente isolato di capacità trascurabile. TrovaTf.

**Risposta e feedback:** 40°C Uguali masse e stesso c: (Tf−20)+(Tf−60)=0. Non estendere la media a capacità differenti.

**Trasferimento:** Per fondere0,05kg a temperatura di fusione usaL=334000J/kg. QuantoQ? Una successiva condensazione dello stesso materiale libera o assorbe calore?

**Risposta e feedback:** 16700J; la condensazione libera calore. Q=mL per la fusione data. Il valore numerico del calore di condensazione non è fornito e non coincide necessariamente conLfusione.

**Errori tipici:** Scrivere calore contenuto al posto di energia interna; UsaremcΔT durante una transizione aTcostante

**Aiuti progressivi:** Controlla se cambia fase / Somma i contributi per riscaldamento e transizione

**Ripasso:** Capacità termica e calore specifico hanno unità diverse.

## U5-03 - Trasmissione calore

La conduzione trasferisce energia attraverso interazioni microscopiche senza trasporto macroscopico di materia; nel modello piano stazionario P=kAΔT/L. La convezione trasferisce energia con il moto del fluido e può essere naturale o forzata. L’irraggiamento trasferisce energia tramite onde elettromagnetiche e può avvenire nel vuoto. La direzione netta spontanea è dal corpo più caldo al più freddo, pur essendoci emissione in entrambe le direzioni. Una superficie non smette di emettere perché l’ambiente ha uguale temperatura: si annulla lo scambio netto. Non è necessario usare leggi quantitative non fornite per riconoscere il meccanismo dominante; nei sistemi reali i tre meccanismi possono coesistere.

**Esempio svolto.** Parete piana: k=0,5W/(m K),A=2m²,ΔT=10K,L=0,1m. La legge fornita èP=kAΔT/L. TrovaP.

1. Il prodotto kAΔT vale10W m.
2. Dividi per0,1m.
3. P=100W dal lato caldo al freddo.

**Risultato:** 100W.

**Prova autonoma:** Il calore del Sole raggiunge un oggetto nello spazio vuoto. Quale meccanismo può agire attraverso il vuoto?

**Risposta e feedback:** Irraggiamento. Conduzione e convezione necessitano di materia lungo il tragitto; la radiazione elettromagnetica no.

**Trasferimento:** Una parete ha k=0,5W/(m K),A=2m²,ΔT=10K eL=0,2m. UsaP=kAΔT/L; trovaP e descrivi come una ventola cambia il trasporto nell’aria.

**Risposta e feedback:** 50W; la ventola aumenta il moto del fluido e favorisce convezione forzata. La conduzione ideale è inversa aL. Il trasferimento nell’aria richiede un modello convettivo diverso, senza attribuirgli lo stesso kAΔT/L.

**Errori tipici:** Confondere convezione con conduzione; Dire che in equilibrio termico non c’è emissione

**Aiuti progressivi:** Individua se si muove materia / Distingui flusso emesso e netto

**Ripasso:** I tre meccanismi richiedono modelli e ipotesi distinti.

## U5-04 - Primo principio e trasformazioni

Scegliamo come sistema un gas chiuso e usiamo ΔU=Q−W: Q è positivo se entra calore e W se il gas compie lavoro sull’ambiente. Energia interna U è funzione di stato; Q e W descrivono trasferimenti e dipendono dal percorso. Per un gas ideale U dipende dalla temperatura. In un’isocora il volume resta fermo e W=0. In un’isobara quasi statica W=p(Vf−Vi), area sotto il grafico p-V. In un’isoterma ideale ΔU=0, quindi Q=W; non significa Q=0. In un’adiabatica Q=0 e un’espansione con W>0 riduce U e T. Un processo reversibile è un limite ideale che può essere invertito senza variazioni nette di sistema e ambiente; attrito e passaggi con differenze finite producono irreversibilità. La sola forma di un grafico non certifica reversibilità. Prima di usare l’area p-V occorre sapere che la pressione esterna coincide con quella del gas nel limite quasi statico.

**Esempio svolto.** Un gas si espande quasi staticamente a 100 kPa da 2 L a 5 L e riceve 500 J di calore. Trova W e ΔU.

1. Converti: 100 kPa=100000 Pa e ΔV=3 L=0,003 m³.
2. Lavoro fatto dal gas: W=pΔV=300 J.
3. Bilancio: ΔU=500−300=200 J. Il gas conserva internamente parte del calore ricevuto.

**Risultato:** W=+300 J; ΔU=+200 J.

**Prova autonoma:** Un gas in recipiente rigido cede 80 J. Quanto valgono W e ΔU con la convenzione dichiarata?

**Risposta e feedback:** W=0 J; ΔU=−80 J Volume costante annulla il lavoro p dV. Il calore uscente ha Q negativo.

**Trasferimento:** In una compressione adiabatica vengono compiuti 120 J sul gas ideale. Trova Q,W,ΔU e il verso della variazione di T.

**Risposta e feedback:** Q=0 J; W=−120 J; ΔU=+120 J; T aumenta. Il lavoro sul gas è negativo nella convenzione del lavoro fatto dal gas. Un’adiabatica non è necessariamente isoterma.

**Errori tipici:** Usare litri senza conversione in pΔV; Cambiare convenzione per W a metà soluzione; Confondere isoterma e adiabatica

**Aiuti progressivi:** Scrivi per primo ΔU=Q−W e il sistema / Individua quale variabile resta costante / Controlla il segno guardando la direzione del trasferimento

**Ripasso:** Dichiara sempre sistema, segni e ipotesi prima del bilancio.

## U5-05 - Secondo principio ed entropia

Il secondo principio limita i processi possibili: un motore ciclico non può convertire integralmente in lavoro il calore preso da una sola sorgente e il calore non passa spontaneamente da freddo a caldo senza altri effetti. Un ciclo riporta lo stato iniziale, quindiΔUciclo=0; non annulla calore e lavoro netti. Il rendimento di una macchina termica èWnetto/Qcalda=1−|Qfredda|/Qcalda. Carnot fornisce il massimo ideale fra due termostati:ηC=1−Tfredda/Tcalda con temperature in kelvin. L’entropia è funzione di stato: per uno scambio reversibile dS=δQrev/T, mentre nell’universo isolatoΔStot≥0. Irreversibilità produce entropia; quella di un solo sottosistema può diminuire esportandola. L’interpretazione statistica collega entropia al numero di configurazioni microscopiche compatibili, non a un giudizio generico di disordine.

**Esempio svolto.** Motore ideale fra600K e300K assorbe1000J dalla sorgente calda per ciclo. Trova rendimento massimo e lavoro massimo.

1. ηC=1−300/600=0,5.
2. Wmax=0,5·1000=500J.
3. Almeno500J sono ceduti al termostato freddo nel ciclo reversibile limite.

**Risultato:** 50%;500J.

**Prova autonoma:** Un motore assorbe800J e cede600J ogni ciclo. TrovaW eη.

**Risposta e feedback:** 200J;0,25=25% ΔUciclo=0 quindiW=800−600. Il rendimento usa il calore assorbito, non la somma dei moduli.

**Trasferimento:** 200J passano spontaneamente da400K a300K, termostati ideali. CalcolaΔStot.

**Risposta e feedback:** 1/6J/K≈0,166667J/K ΔSfredda=200/300;ΔScalda=−200/400; somma positiva. Il calore è uguale nei due scambi, l’entropia no.

**Errori tipici:** Usare°C nel limite diCarnot; PretendereΔS≥0 per ogni sottosistema

**Aiuti progressivi:** Scrivi il bilancio del ciclo / Definisci sistema e universo / Usa temperature assolute

**Ripasso:** Secondo principio e primo principio sono vincoli distinti.

## Verifica finale per ogni sotto-obiettivo

**U3-01.01** Che cosa distingue la risposta statica di un fluido da quella di un solido a uno sforzo tangenziale?

Risposta proposta: Il fluido non sostiene uno sforzo di taglio statico senza deformazione continua,il solido può sostenerlo.

**U3-01.02** Una forza normale16N agisce su0,004m². Trova la pressione.

Risposta proposta: 4000Pa.

**U3-01.03** Massa1,5kg in volume0,002m³: quale densità?

Risposta proposta: 750kg/m³.

**U3-01.04** La legge p=p0+ρgh vale automaticamente in un tubo con veloce flusso dissipativo?

Risposta proposta: No: è una relazione idrostatica; il moto richiede considerare energia e perdite appropriate.

**U3-02.01** Olioρ=800kg/m³,g=10m/s²,profondità0,5m. Qual è l’incremento di pressione?

Risposta proposta: 4000Pa,da aggiungere alla pressione sulla superficie.

**U3-02.02** Un aumento di pressione di2000Pa raggiunge un pistone di0,01m². Quale aumento di forza ideale?

Risposta proposta: 20N,per Pascal eF=ΔpA.

**U3-02.03** Un volume immerso0,002m³ sposta fluidoρ=900kg/m³,g=10. Qual è la spinta?

Risposta proposta: 18N verso l’alto.

**U3-02.04** Un corpo omogeneoρ=750 galleggia in fluidoρ=1000kg/m³. Quale frazione immersa?

Risposta proposta: 0,75=75%.

**U3-02.05** Perché in un barometro ideale una colonna di liquido può misurare la pressione atmosferica?

Risposta proposta: La differenza di pressione fra atmosfera e spazio superiore quasi vuoto equilibraρgh.

**U3-02.06** Un manometro conρ=1000kg/m³,g=10,dislivello0,03m misura quale differenza di pressione?

Risposta proposta: 300Pa; conta il dislivello verticale.

**U3-03.01** In2s attraversano un tubo6L. Qual è la portata volumetrica?

Risposta proposta: 3L/s=0,003m³/s.

**U3-03.02** Un flusso statisticamente stazionario è necessariamente privo di fluttuazioni turbolente istantanee?

Risposta proposta: No: possono essere stazionarie le medie mentre i valori istantanei fluttuano; un campo istantaneo rigorosamente stazionario invece non cambia nel tempo.

**U3-03.03** Quale struttura del moto caratterizza il flusso laminare ideale in un tubo?

Risposta proposta: Strati ordinati con velocità che varia regolarmente,senza rimescolamento turbolento.

**U3-03.04** Fluido incomprimibile:A1=6cm²,v1=2m/s,A2=3cm². Qual èv2?

Risposta proposta: 4m/s; portata conservata.

**U3-03.05** In flusso ideale orizzontaleρ=1000,la velocità passa da2a3m/s. Qual èp2−p1?

Risposta proposta: −2500Pa daBernoulli.

**U3-03.06** In un restringimento e una dilatazione ideali allo stesso flusso e quota,come si confrontano velocità e pressione statica?

Risposta proposta: Nel restringimento velocità maggiore e pressione minore; nella dilatazione l’opposto,senza estendere questo a una diagnosi reale.

**U3-04.01** Perché un fluido reale può richiedere differenza di pressione per mantenere portata in tubo orizzontale?

Risposta proposta: La viscosità dissipa energia meccanica; non bastaBernoulli senza perdite.

**U3-04.02** Nel profilo parabolico laminare in tubo qual è il rapporto velocità massima/media?

Risposta proposta: 2,con aderenza alla parete e ipotesi diPoiseuille.

**U3-04.03** Che cosa misura il gradiente di velocità fra due strati vicini?

Risposta proposta: La variazione della velocità per distanza trasversale;nel fluido newtoniano collega sforzo tangenziale e viscosità.

**U3-04.04** AΔp,L eη fissati,il raggio aumenta del fattore3. Quale rapporto di portata ideale?

Risposta proposta: 81,poichéQ∝r^4.

**U3-04.05** Due resistenze idraulicheR e3R in serie e parallelo: quali equivalenti?

Risposta proposta: 4R in serie;3R/4 in parallelo,nel modello lineare.

**U3-05.01** Quali unità equivalenti ha la tensione superficiale?

Risposta proposta: N/m eJ/m².

**U3-05.02** A parità di tensione superficiale,perché una goccia piccola può mostrare effetti di superficie più importanti rispetto al peso?

Risposta proposta: Il rapporto superficie/volume cresce riducendo la dimensione;il peso scala col volume.

**U3-05.03** La risalita capillare avviene per ogni coppia liquido-parete?

Risposta proposta: No:dipende anche dalla bagnabilità;un menisco non bagnante può produrre depressione.

**U3-05.04** Una superficie piana ideale possiede salto di pressione dovuto alla sola curvatura?

Risposta proposta: No:la curvatura è nulla;non ne segue che la pressione assoluta siazero.

**U3-05.05** Fra due gocce dello stesso liquido con raggi3mm e6mm,quale ha maggior salto di pressione qualitativo perLaplace?

Risposta proposta: Quella da3mm,con curvatura maggiore.

**U5-01.01** Analizzi un gas dentro un cilindro:come chiami il gas e il resto con cui può scambiare energia?

Risposta proposta: Gas=sistema;resto=ambiente,con confine dichiarato.

**U5-01.02** Per un gas in equilibrio quali variabili descrivono pressione,volume e temperatura e con quali unitàSI?

Risposta proposta: p inPa,V in m³,T inK,insieme alla quantità di sostanza.

**U5-01.03** Il calore scambiato è una funzione di stato come l’energia interna?

Risposta proposta: No:Q dipende dal percorso;U è funzione di stato.

**U5-01.04** Converti−20°C in kelvin.

Risposta proposta: 253,15K.

**U5-01.05** Gas ideale:n=2mol,T=250K,p=100000Pa,R=8,31446261815324J/(mol K). QualeV?

Risposta proposta: 0,0415723130907662m³;usa pressione assoluta e kelvin.

**U5-02.01** Un corpo ha energia interna:è corretto chiamarla calore contenuto?

Risposta proposta: No:calore è energia trasferita per differenza di temperatura.

**U5-02.02** Una capacità termica40J/K riceve120J senza transizioni. Quanto cresceT?

Risposta proposta: 3K.

**U5-02.03** Massa0,5kg,c=800J/(kg K). Quale capacità termica?

Risposta proposta: 400J/K.

**U5-02.04** Per una mole di gas ideale quanto valeCp−Cv e perchéCp è maggiore?

Risposta proposta: R; a pressione costante parte del calore sostiene il lavoro di espansione.

**U5-02.05** Durante fusione ideale a pressione fissata,con due fasi in equilibrio,aggiungere calore cambia necessariamenteT?

Risposta proposta: No:può cambiare la frazione di fase a temperatura costante.

**U5-02.06** ConL=2·10^5J/kg,quale calore assorbito per trasformare0,03kg nella fase che richiede quelL?

Risposta proposta: 6000J;la legge e il segno del processo vanno dichiarati.

**U5-02.07** Due corpi isolati dal resto scambiano caloreQ1=+70J. Quanto valeQ2 se il recipiente è trascurabile e non ci sono altri scambi?

Risposta proposta: −70J;somma dei calori ugualezero.

**U5-03.01** Una sbarra metallica trasferisce energia dal capo caldo al freddo senza moto macroscopico del materiale. Quale meccanismo?

Risposta proposta: Conduzione.

**U5-03.02** Un liquido riscaldato si mette in circolazione per differenze di densità. Quale meccanismo di trasporto?

Risposta proposta: Convezione naturale.

**U5-03.03** Due superfici alla stessa temperatura emettono radiazione? Com’è lo scambio netto nel modello di equilibrio?

Risposta proposta: Sì,emettono entrambe;lo scambio netto èzero.

**U5-04.01** Una funzioneU torna allo stesso valore dopo un ciclo termodinamico. Quanto valeΔUciclo?

Risposta proposta: 0,perché l’energia interna è funzione di stato.

**U5-04.02** Un gas riceveQ=+90J e compieW=+40J sull’ambiente. Dichiara i segni e trovaΔU.

Risposta proposta: Q entrante,W fatto dal gas:ΔU=Q−W=+50J.

**U5-04.03** La leggeΔU=Q−W permette a energia di scomparire?

Risposta proposta: No:esprime il bilancio fra energia interna e trasferimenti attraverso il confine.

**U5-04.04** Un processo con attrito può essere invertito lasciando sistema e ambiente esattamente come prima senza altri effetti?

Risposta proposta: No:è irreversibile;invertire solo il moto non annulla la produzione di entropia.

**U5-04.05** Per un gas ideale in isoterma,ΔU=0 implicaQ=0?

Risposta proposta: No:Q=W;calore e lavoro possono essere entrambi non nulli.

**U5-04.06** In una trasformazione isocora quasi statica quale lavoro di espansione?

Risposta proposta: 0J perchéΔV=0.

**U5-04.07** Un gas si espande quasi staticamente a2·10^5Pa di0,001m³. Quale lavoro fatto dal gas?

Risposta proposta: +200J.

**U5-04.08** Una compressione adiabatica ideale con60J di lavoro fatto sul gas ha qualeQ eΔU?

Risposta proposta: Q=0;Wfatto dal gas=−60J;ΔU=+60J.

**U5-05.01** Un motore ciclico assorbe calore da un solo termostato e lo converte tutto in lavoro senza altri effetti. Quale principio lo esclude?

Risposta proposta: Secondo principio,enunciato diKelvin-Planck;Clausius esclude trasferimento spontaneo freddo→caldo senza altri effetti.

**U5-05.02** Un processo spontaneo può conservare energia ed essere comunque irreversibile?

Risposta proposta: Sì:conservazione energetica non impone reversibilità né entropia totale costante.

**U5-05.03** Che cosa definisce un ciclo e quanto cambia una funzione di stato al termine?

Risposta proposta: Ritorno allo stato iniziale;variazione netta della funzione di statozero.

**U5-05.04** Macchina assorbe1000J e cede700J in un ciclo. Quale rendimento?

Risposta proposta: 0,3=30%;W=300J.

**U5-05.05** Fra termostati500K e400K,quale limite diCarnot?

Risposta proposta: 20%,conηC=1−400/500.

**U5-05.06** Un sottosistema cede entropia all’ambiente e diminuisceS. Questo viola sempre il secondo principio?

Risposta proposta: No:si deve valutareΔStotale di sistema e ambiente;deve essere non negativa per l’universo isolato.

**U5-05.07** Nell’interpretazione statistica,più configurazioni microscopiche compatibili con un macro-stato tendono a quale entropia?

Risposta proposta: Maggiore entropia,conS collegata al logaritmo del numero di microstati nel modello appropriato.

**U5-05.08** Un flusso spontaneo di100J da500K a250K aumenta o diminuisce l’entropia totale dei due termostati? Quanto?

Risposta proposta: Aumenta di0,2J/K:100/250−100/500.

# elettricita-magnetismo

Famiglie: 7; sotto-obiettivi con domanda finale: 33; stato DRAFT.

## U6-01 - Carica e campo

La carica elettrica è una proprietà conservata nei processi del sistema isolato e si misura in coulomb. Cariche dello stesso segno si respingono, di segno opposto si attraggono. Coulomb per cariche puntiformi ferme dà moduloF=ke|q1q2|/r²; il campo è forza per carica di prova positiva,E=F/q. Le linee escono dalle cariche positive ed entrano nelle negative e indicano la direzione locale, non traiettorie obbligate. Il campo totale di più cariche è la somma vettoriale dei campi. In un campo elettrico uniforme una carica libera subisce forzaqE e accelerazioneqE/m; una carica negativa accelera in verso opposto aE. Il modello esclude il punto sorgente r=0 ed effetti di auto-interazione della carica di prova.

**Esempio svolto.** Due cariche+1µC a distanza0,30m sono ferme. Usa ke=9·10^9N m²/C². TrovaF e verso.

1. q1q2=10^-12C² e r²=0,09m².
2. F=9·10^9·10^-12/0,09=0,1N.
3. Segni uguali: forza repulsiva lungo la congiungente.

**Risultato:** 0,1N repulsiva.

**Prova autonoma:** Una carica−2µC è in campo uniforme+300N/C lungo x. TrovaFx.

**Risposta e feedback:** −0,0006N F=qE conserva il segno della carica. La direzione del campo si definisce con una carica di prova positiva.

**Trasferimento:** Due cariche positive uguali sono ai lati opposti di un punto medio. Campo nullo significa assenza di cariche? Se raddoppia la distanza da una singola carica, come variaE?

**Risposta e feedback:** No: i campi si cancellano per simmetria; E della singola carica diventa1/4. La sovrapposizione è vettoriale. Una misura nulla può derivare da contributi non nulli.

**Errori tipici:** Sommare i moduli dei campi senza direzioni; Usarer=0 nella formula puntiforme

**Aiuti progressivi:** Disegna segni e vettori / ConvertiµC inC

**Ripasso:** Campo e forza sono diversi: la seconda dipende anche dalla carica di prova.

## U6-02 - Potenziale elettrico

Il potenziale elettrico è energia potenziale per unità di carica e si misura in volt,J/C. La differenza di potenzialeΔV=Vf−Vi cambia l’energia potenziale diqΔV. Il lavoro della forza elettrica è−qΔV; se non agiscono altre forze che compiono lavoro,ΔK=−qΔV. Il potenziale è scalare e quello di più cariche si somma algebricamente, mentre i campi sono vettori. Per due cariche puntiformiU=keq1q2/r con zero all’infinito; il segno può essere negativo. Una carica positiva lasciata libera tende a muoversi verso potenziale minore; una negativa può guadagnare energia cinetica muovendosi verso potenziale maggiore. Lo zero convenzionale diV non alteraΔV.

**Esempio svolto.** Una carica+2µC passa da10V a4V, agisce solo il campo elettrico. TrovaΔU eΔK.

1. ΔV=4−10=−6V.
2. ΔU=2·10^-6·(−6)=−12·10^-6J.
3. ΔK=−ΔU=+12µJ.

**Risultato:** ΔU=−12µJ;ΔK=+12µJ.

**Prova autonoma:** Una carica−1µC passa da0 a5V. Quanto cambiaU?

**Risposta e feedback:** −5µJ ΔU=qΔV: carica negativa e aumento di potenziale producono diminuzione dell’energia potenziale.

**Trasferimento:** Se aggiungi100V a tutti i potenziali di un circuito, cambiano forze e lavoro fra due punti? Motiva.

**Risposta e feedback:** No, le differenze di potenziale restano identiche. Il lavoro dipende daΔV; il riferimento assoluto può essere scelto convenzionalmente.

**Errori tipici:** Confondere campo e potenziale; UsareΔK=qΔV invertendo il segno

**Aiuti progressivi:** Scrivi estremi iniziale e finale / Controlla prima il segno diqΔV

**Ripasso:** Il segno della carica decide comeΔV cambiaU eK.

## U6-03 - Conduttori e dielettrici

In un conduttore le cariche libere possono ridistribuirsi. In equilibrio elettrostatico il campo all’interno del materiale conduttore è nullo e il conduttore è equipotenziale; eventuale carica in eccesso si dispone sulla superficie. Avvicinare una carica esterna può separare cariche nel conduttore senza cambiare la carica totale: è induzione elettrostatica. Il collegamento a terra permette invece scambio di carica e va dichiarato. Un dielettrico ha cariche legate che possono spostarsi leggermente o orientarsi: la polarizzazione crea dipoli e modifica il campo senza implicare un flusso libero permanente attraverso l’isolante. Un corpo neutro può essere attratto da una carica per ridistribuzione; neutro non significa assenza di cariche.

**Esempio svolto.** Una sfera metallica isolata e neutra viene avvicinata, senza contatto, a una bacchetta positiva. Quali cariche si trovano sul lato vicino e qual è la carica totale?

1. Gli elettroni mobili sono attratti verso il lato vicino.
2. Il lato lontano resta con eccesso relativo di carica positiva.
3. Senza contatto o terra la carica totale della sfera resta zero.

**Risultato:** Lato vicino negativo; totale zero.

**Prova autonoma:** In un dielettrico neutro i dipoli si orientano in un campo esterno. È necessario che passino elettroni da un capo all’altro del campione?

**Risposta e feedback:** No. La polarizzazione può coinvolgere spostamenti locali di cariche legate o orientamento dei dipoli, senza corrente libera macroscopica permanente.

**Trasferimento:** Una sfera conduttrice viene collegata a terra mentre la bacchetta è vicina. Si può dedurre che la carica finale resti necessariamente zero?

**Risposta e feedback:** No: la terra può fornire o assorbire cariche; conta l’ordine delle operazioni. L’isolamento era un’ipotesi essenziale del primo esempio. Specificare stacco da terra e rimozione della bacchetta è necessario per il risultato finale.

**Errori tipici:** Confondere polarizzazione e caricamento netto; ApplicareE=0 a un conduttore attraversato da corrente

**Aiuti progressivi:** Distingui isolato e collegato a terra / Verifica se è equilibrio elettrostatico

**Ripasso:** Separazione locale e carica totale sono concetti distinti.

## U6-04 - Corrente e circuiti

La corrente convenzionale è carica netta per unità di tempo: ampere significa coulomb al secondo. Un generatore ideale mantiene la differenza di potenziale assegnata. Per un resistore ohmico a condizioni materiali costanti vale V=RI; per un filo uniforme R=ρL/A, dove la resistività ρ ha unità Ω m. In serie i resistori condividono la corrente e le cadute si sommano. In parallelo condividono la tensione e le correnti si sommano. La potenza dissipata è P=VI=I²R=V²/R, positiva per un resistore passivo anche invertendo la polarità. L’energia dissipata in tempo costante è Pt e si misura in joule, non watt. Passare da serie a parallelo cambia il circuito: non basta guardare la vicinanza delle forme nel disegno. Il modello a due resistori non comprende resistenza interna del generatore, riscaldamento o limiti reali di potenza.

**Esempio svolto.** Un generatore ideale da 12 V alimenta resistori da 4 Ω e 8 Ω in parallelo. Trova correnti e potenze.

1. Ogni ramo ha 12 V: I1=12/4=3 A; I2=12/8=1,5 A.
2. I totale=4,5 A; R equivalente=12/4,5=8/3 Ω.
3. P1=36 W; P2=18 W; totale=54 W. Controlla VI totale=12·4,5=54 W.

**Risultato:** I totale 4,5 A; R equivalente 8/3 Ω; P totale 54 W.

**Prova autonoma:** Un generatore ideale12V alimenta resistori4Ω e8Ω in serie: trovaI,V1,V2 ePtotale.

**Risposta e feedback:** 1 A; 4 V; 8 V; 12 W La serie ha 12 Ω. La stessa corrente percorre entrambi e le due cadute sommano 12 V.

**Trasferimento:** Un filo ohmico raddoppia lunghezza e area, a ρ costante. Cambiano R e P a tensione fissata? Se invece raddoppia solo L?

**Risposta e feedback:** R invariata e P invariata nel primo caso; R raddoppia e P si dimezza nel secondo. Usa R=ρL/A e poi P=V²/R. A corrente fissata la conclusione sulla potenza sarebbe diversa.

**Errori tipici:** Sommare resistenze in parallelo; Pensare che una corrente negativa dia potenza Joule negativa; Confondere potenza ed energia

**Aiuti progressivi:** Identifica i nodi equipotenziali / Scrivi quale grandezza è uguale sui due resistori / Verifica somma correnti e bilancio potenze

**Ripasso:** Una rete passiva deve rispettare continuità della corrente e potenza dissipata non negativa.

## U6-05 - Condensatori

La capacitàC=Q/ΔV misura quanta carica di un’armatura è associata alla tensione fra le armature; l’unità èF=C/V. Un condensatore piano ideale haC=εA/d trascurando effetti di bordo. Un dielettrico aumentaε e quindiC a geometria fissa. L’energia immagazzinata èU=CV²/2=Q²/(2C). In parallelo le capacità si sommano perché la tensione è comune; in serie si sommano i reciproci perché le cariche delle armature interne isolate si bilanciano e la tensione si ripartisce. Inserire un dielettrico a tensione fissata dal generatore non è uguale al farlo con condensatore isolato e carica fissata: nel primo casoU cresce, nel secondo diminuisce. Nessun transitorioRC quantitativo è richiesto qui.

**Esempio svolto.** Due condensatori2µF e3µF sono collegati in parallelo a10V. TrovaCeq,Qtot eU.

1. Ceq=5µF.
2. Qtot=CeqV=50µC.
3. U=CeqV²/2=250µJ.

**Risultato:** 5µF;50µC;250µJ.

**Prova autonoma:** Due condensatori2µF e3µF sono collegati in serie. Quanto valeCeq?

**Risposta e feedback:** 1,2µF Ceq=C1C2/(C1+C2)=6/5µF. È minore della capacità più piccola.

**Trasferimento:** Un condensatore isolato mantieneQ e raddoppiaC con un dielettrico. Come cambianoV eU?

**Risposta e feedback:** Entrambe si dimezzano. V=Q/C eU=Q²/(2C). A tensione mantenuta da generatore la conclusione energetica cambierebbe.

**Errori tipici:** Invertire serie/parallelo rispetto alle capacità; Non dichiarareVfissa oQfissa

**Aiuti progressivi:** Identifica se il generatore resta collegato / Controlla il limite della capacità equivalente

**Ripasso:** Le condizioni al contorno determinano la variazione dell’energia del condensatore.

## U6-06 - Campo magnetico

L’esperimento diOersted mostra che una corrente genera un campo magnetico; il verso si collega alla direzione della corrente con la mano destra. Una carica in moto subisceF=q v×B: il modulo è|q|vBsinθ, la forza è perpendicolare alla velocità e il campo magnetico statico da solo non compie lavoro sulla carica puntiforme. Una carica ferma o in moto parallelo aB non subisce questa forza. Su un filo rettilineo con corrente in campo uniforme agisceF=I L×B. Sev è perpendicolare aB, la carica segue un moto circolare di raggio r=mv/(|q|B) nel modello non relativistico; la frequenza e il verso dipendono dai parametri e dal segno. Cariche opposte con uguale velocità curvano in versi opposti.

**Esempio svolto.** Carica+2µC con v=3m/s lungo+x in campoB=0,5T lungo+y. TrovaF e verso.

1. v×B punta lungo+z.
2. F=2·10^-6·3·0,5=3·10^-6N.
3. q positiva conserva il verso del prodotto vettoriale.

**Risultato:** 3µN lungo+z.

**Prova autonoma:** Un filo lungo0,2m porta3A perpendicolarmente aB=0,5T. Trova il modulo della forza.

**Risposta e feedback:** 0,3N F=ILB=3·0,2·0,5. Se il filo fosse parallelo al campo il risultato sarebbezero.

**Trasferimento:** Una particella non relativistica in moto perpendicolare aB raddoppia la velocità con massa,carica eB fissi. Come variano r eK? Il soloB statico può produrre tale aumento?

**Risposta e feedback:** r raddoppia;K quadruplica;B statico da solo non può aumentareK. Il raggio è lineare inv mentreK∝v². La forza magnetica resta perpendicolare allo spostamento istantaneo.

**Errori tipici:** Attribuire lavoro alla forza magnetica statica sulla carica; Dimenticare il segno della carica

**Aiuti progressivi:** Disegna v eB / Applica mano destra alla carica positiva e poi correggi il segno

**Ripasso:** La forza magnetica può cambiare direzione del moto senza cambiarne l’energia cinetica.

## U6-07 - Induzione

Il flusso magnetico attraverso una superficie piana in campo uniforme èΦ=BAcosθ conθ fraB e normale alla superficie. Una variazione del flusso concatenato genera fem:ε=−NΔΦ/Δt nella forma media. Il segno diLenz indica che l’effetto della corrente indotta si oppone alla variazione del flusso, non necessariamente al campo presente. Un flusso costante, anche grande, non induce fem nel circuito fermo ideale. Possono variareB,area o orientazione. In un circuito chiuso resistivo la fem può produrre corrente; in uno aperto una fem non implica corrente di conduzione completa. Il verso va determinato dopo aver scelto normale e orientazione del circuito.

**Esempio svolto.** Una bobina di100spire, area0,01m², normale concorde aB, vedeB salire da0 a0,2T in0,1s. Trova il modulo della fem media.

1. ΔΦ per spira=AΔB=0,002Wb.
2. NΔΦ=0,2Wb concatenati.
3. |ε|=0,2/0,1=2V.

**Risultato:** 2V; verso tale da opporsi all’aumento del flusso.

**Prova autonoma:** Con la stessa bobinaB resta costante e area/orientazione non cambiano. Qual è la fem indotta ideale?

**Risposta e feedback:** 0V Il valore del flusso non basta: serve una variazione nel tempo.

**Trasferimento:** Un campo entrante nel foglio diminuisce. Quale verso ha il campo prodotto dalla corrente indotta e quale corrente vista frontalmente?

**Risposta e feedback:** Campo entrante; corrente oraria. La corrente cerca di mantenere il flusso entrante che sta diminuendo. Opporsi alla variazione non significa creare sempre campo opposto aB.

**Errori tipici:** Usareθ rispetto al piano anziché alla normale; ApplicareLenz come opposizione al campo anziché alla variazione

**Aiuti progressivi:** Scegli la normale / Stabilisci se il flusso aumenta o diminuisce / Usa la mano destra per il verso della corrente

**Ripasso:** Faraday quantifica la fem eLenz ne determina il verso.

## Verifica finale per ogni sotto-obiettivo

**U6-01.01** Qual è l’unitàSI della carica e quale segno assegna il verso convenzionale del campo?

Risposta proposta: Coulomb;il campo è definito tramite forza su carica di prova positiva.

**U6-01.02** Due corpi isolati si scambiano elettroni:deve conservarsi la carica di ciascuno o quella totale?

Risposta proposta: Quella totale;le cariche dei singoli corpi possono cambiare.

**U6-01.03** Per cariche puntiformi uguali a distanza tripla,quale rapporto della forza diCoulomb rispetto a prima?

Risposta proposta: 1/9,a cariche fissate.

**U6-01.04** Le linee di campo sono necessariamente le traiettorie di una carica lanciata con velocità iniziale qualsiasi?

Risposta proposta: No:indicano il vettore campo locale,non vincolano una traiettoria arbitraria.

**U6-01.05** Due cariche positive uguali generano campi opposti al punto medio. Quale campo totale e quale regola si usa?

Risposta proposta: Campo nullo;somma vettoriale per sovrapposizione.

**U6-01.06** Carica+0,002C,massa0,01kg,inE=50N/C uniforme,unica forza. Quale accelerazione?

Risposta proposta: 10m/s² lungoE,da a=qE/m.

**U6-02.01** Il potenziale sceltozero in un punto impone energia potenziale nulla per qualunque riferimento?

Risposta proposta: No:lo zero è convenzionale;le differenze hanno significato dinamico.

**U6-02.02** Quale unità haV=U/q e quale grandezza fisica esprime?

Risposta proposta: Volt=J/C;energia potenziale per unità di carica di prova.

**U6-02.03** Una carica+3C passa da2V a7V. QualeΔU?

Risposta proposta: +15J,da qΔV.

**U6-02.04** Se solo la forza elettrica compie lavoro eΔU=−0,4J,qualeΔK?

Risposta proposta: +0,4J per conservazione energetica.

**U6-03.01** Una sfera conduttrice neutra isolata,senza contatto,si polarizza per induzione. Deve acquisire carica netta?

Risposta proposta: No:può separare cariche mantenendo totalezero.

**U6-03.02** Un dielettrico polarizzato richiede movimento libero di tutte le cariche attraverso l’intero materiale?

Risposta proposta: No:orientazione o spostamenti locali di cariche legate possono produrre polarizzazione.

**U6-04.01** Che cosa significaDC nel modello elementare e quale grandezza non cambia segno periodicamente?

Risposta proposta: Corrente continua;il flusso di carica mantiene direzione nel modello stazionario.

**U6-04.02** In0,5s passano0,2C. Quale corrente media?

Risposta proposta: 0,4A.

**U6-04.03** Un generatore ideale di tensione12V mantiene che cosa se cambia il carico?

Risposta proposta: La differenza di potenziale12V;la corrente dipende dal carico ideale.

**U6-04.04** Resistore ohmico15Ω a3V:qualeI?

Risposta proposta: 0,2A.

**U6-04.05** Un filo triplicaL aρ eA fisse. Come variaR?

Risposta proposta: Triplica,daR=ρL/A.

**U6-04.06** Resistore8Ω percorso da0,5A per4s:qualiP ed energia dissipata?

Risposta proposta: 2W e8J;P=I²R,energia=Pt.

**U6-04.07** Resistori6Ω e3Ω in serie e parallelo:qualiReq?

Risposta proposta: 9Ω in serie;2Ω in parallelo.

**U6-05.01** Un condensatore haQ=24µC a6V. QualeC?

Risposta proposta: 4µF.

**U6-05.02** Un condensatore piano ideale raddoppia l’area e la distanza tra armature. Come variaC aεfissa?

Risposta proposta: Resta uguale,poichéC=εA/d.

**U6-05.03** Inserendo dielettrico con costante relativa3 in geometria fissa,come variaC nel modello ideale?

Risposta proposta: Triplica.

**U6-05.04** Un condensatore2µF a20V immagazzina quale energia?

Risposta proposta: 400µJ,daCV²/2.

**U6-05.05** Capacità4µF e4µF in serie e parallelo:qualiCeq?

Risposta proposta: 2µF in serie;8µF in parallelo.

**U6-06.01** Quale osservazione dell’esperimento diOersted collega corrente e magnetismo?

Risposta proposta: Una corrente devia un ago magnetico vicino,mostrando un campo associato al filo.

**U6-06.02** Invertire la corrente in un filo inverte il verso del campo magnetico circolare intorno ad esso?

Risposta proposta: Sì,con geometria invariata,secondo la mano destra.

**U6-06.03** Una carica si muove parallela a un campo magnetico uniforme. Quale forza magnetica?

Risposta proposta: Zero,poichév×B=0.

**U6-06.04** Filo lungo0,5m,corrente2A,perpendicolare aB=0,4T. Quale forza?

Risposta proposta: 0,4N;il verso è quello diL×B per corrente convenzionale.

**U6-06.05** Se la carica ha velocità perpendicolare aB e nessun’altra forza,che cosa resta costante e com’è la traiettoria non relativistica?

Risposta proposta: Modulo della velocità eK costanti;traiettoria circolare conr=mv/(|q|B).

**U6-07.01** CampoB parallelo al piano di una superficie:qual è il flusso uniforme attraverso essa?

Risposta proposta: Zero,perchéB è perpendicolare alla normale e cos90°=0.

**U6-07.02** Perché una bobina ferma in campo uniforme costante non ha necessariamente fem indotta?

Risposta proposta: Il flusso concatenato non varia nel tempo;il suo valore non nullo non basta.

**U6-07.03** Una bobina20spire vede per spiraΔΦ=0,003Wb in0,1s. Quale modulo della fem media?

Risposta proposta: 0,6V.

**U6-07.04** Un flusso uscente dal foglio cresce. Quale verso deve avere il campo indotto e la corrente vista frontalmente?

Risposta proposta: Campo entrante e corrente oraria,per opporsi all’aumento del flusso.

# onde-ottica-radiazioni

Famiglie: 12; sotto-obiettivi con domanda finale: 58; stato DRAFT.

## U4-01 - Onda armonica

Un’onda meccanica propaga una perturbazione e trasporta energia attraverso un mezzo; non implica trasporto netto del mezzo lungo l’intero percorso. Un oscillatore armonico locale ripete il moto con periodo T; frequenza f=1/T e pulsazione ω=2πf. La distanza fra punti consecutivi in fase è λ; la velocità di propagazione in un mezzo uniforme non dispersivo è v=λf. La funzione y=A sin(2πx/λ−2πft+φ) descrive un’onda che avanza verso +x: i punti di fase costante si spostano di +λ in un periodo. Il segno opposto davanti al termine temporale invertirebbe la direzione. L’ampiezza A è lo spostamento massimo del mezzo e non la lunghezza d’onda. Su una corda lo spostamento può essere trasversale, perpendicolare alla propagazione; un’onda sonora nel fluido è longitudinale, con compressioni e rarefazioni. Il grafico a tempo fissato e quello di un singolo punto nel tempo rispondono a domande diverse.

**Esempio svolto.** In un mezzo uniforme v=4 m/s e f=2 Hz. Trova λ e T. Con A=0,1 m e φ=0 trova y a x=λ/4,t=0 e a x=0,t=T/4.

1. λ=v/f=2 m e T=1/f=0,5 s.
2. A un quarto di lunghezza d’onda la fase è π/2 e y=+0,1 m.
3. Alla sonda x=0 dopo un quarto di periodo la fase è −π/2 e y=−0,1 m.

**Risultato:** λ=2 m; T=0,5 s; +0,1 m e −0,1 m nei due punti richiesti.

**Prova autonoma:** Un’onda ha v=4 m/s e f=2 Hz. Quanto vale λ?

**Risposta e feedback:** 2 m Dividi velocità per frequenza: (m/s)/(1/s)=m. La frequenza non è la velocità del mezzo.

**Trasferimento:** Una perturbazione in un altro mezzo viaggia a 6 m/s con f=4 Hz. Trova λ e T; poi descrivi una perturbazione longitudinale.

**Risposta e feedback:** λ=1,5 m; T=0,25 s; oscillazione parallela alla propagazione. Il rapporto v/f determina λ. Longitudinale riguarda la direzione del moto locale, non il segno del grafico sinusoidale.

**Errori tipici:** Confondere ampiezza e lunghezza d’onda; Usare λ=f/v; Dire che le particelle viaggiano con la cresta

**Aiuti progressivi:** Specifica se guardi spazio o tempo / Scrivi v=λf con unità / Segui un punto a fase costante per stabilire la direzione

**Ripasso:** Frequenza e periodo descrivono il ritmo locale; λ e v descrivono la propagazione.

## U4-02 - Sovrapposizione

In un mezzo lineare la perturbazione risultante è la somma algebrica degli spostamenti nello stesso punto e istante. Due onde coerenti di stessa frequenza e ampiezzaA, in fase, danno ampiezza2A; in opposizione di fase possono annullarsi localmente. Con fase intermedia l’ampiezza risultante non si ricava sommando i moduli. L’annullamento dello spostamento in un punto non implica sparizione dell’energia di tutto il campo: l’interferenza ridistribuisce l’energia e può generare nodi e ventri. La sovrapposizione del segnale non autorizza a sommare semplicemente le intensità di onde coerenti. Il modello richiede risposta lineare del mezzo.

**Esempio svolto.** Due onde in fase producono nello stesso punto spostamenti+0,03m e+0,02m. Quale spostamento risultante? E se la seconda è−0,02m?

1. Somma algebrica dei valori istantanei.
2. 0,03+0,02=0,05m.
3. 0,03−0,02=0,01m.

**Risultato:** 0,05m e0,01m.

**Prova autonoma:** Due onde coerenti con ampiezza0,04m sono in opposizione di fase nello stesso punto. Quale ampiezza risultante ideale?

**Risposta e feedback:** 0m I contributi hanno uguale modulo e segno opposto a ogni istante nel punto considerato.

**Trasferimento:** Due onde di uguale intensitàI e stessa frequenza arrivano in fase. La loro intensità risultante è2I oppure4I nel modello lineare con stessa impedenza?

**Risposta e feedback:** 4I L’ampiezza raddoppia e l’intensità è proporzionale al quadrato dell’ampiezza. L’energia è ridistribuita nello spazio.

**Errori tipici:** Sommare sempre le intensità coerenti; Chiamare distruzione dell’energia un nodo

**Aiuti progressivi:** Confronta fasi prima dei moduli / Somma spostamenti nello stesso punto e tempo

**Ripasso:** La sovrapposizione riguarda la perturbazione, non una somma universale delle intensità.

## U4-03 - Energia e intensità

L’energia trasportata in un intervallo divisa per il tempo dà la potenzaP; la potenza per area perpendicolare dà intensitàI. Le unità sonoJ,W,W/m². Per una sorgente puntiforme isotropa senza assorbimento, la stessa potenza attraversa sfere di area4πr² eI=P/(4πr²): raddoppiare r divideI per4. Non è una legge per ogni geometria di onda né per un ambiente con riflessioni. In un mezzo lineare fissato, a frequenza fissata, l’intensità di un’onda armonica cresce comeA²; cambiare mezzo o frequenza richiede il modello specifico. Un aumento di potenza non cambia necessariamente velocità di propagazione.

**Esempio svolto.** Un’onda trasporta12J in3s attraverso area2m² uniforme e perpendicolare. TrovaP eI.

1. P=12/3=4W.
2. I=P/A=4/2=2W/m².
3. Il flusso energetico per secondo e metro quadrato è2J/(s m²).

**Risultato:** 4W;2W/m².

**Prova autonoma:** Una sorgente puntiforme isotropa produceI=8W/m² a2m. QualeI a4m senza assorbimento?

**Risposta e feedback:** 2W/m² La distanza raddoppia: dividi per quattro.

**Trasferimento:** A mezzo e frequenza fissati l’ampiezza passa daA a3A. Come variaI? Se l’area intercettata raddoppia aI fissata, quale potenza riceve?

**Risposta e feedback:** Intensità9volte; potenza ricevuta2volte. Prima usaI∝A², poiP=I·area. Non confondere l’ampiezza dello spostamento con l’area attraversata.

**Errori tipici:** UsareW/m per l’intensità; Applicare1/r² a onde piane senza ipotesi

**Aiuti progressivi:** ScriviE→P→I / Controlla geometria e assorbimento

**Ripasso:** L’intensità è energia per tempo e area, non energia totale.

## U4-04 - Suono e decibel

Il suono è una perturbazione meccanica: necessita di un mezzo materiale e nei fluidi è longitudinale. La velocità dipende dalle proprietà del mezzo e dalla temperatura, non dalla sola frequenza emessa. Il livello di intensità sonora èβ=10log10(I/I0), con riferimento dichiaratoI0; non è una misura lineare dell’intensità né una descrizione completa della sensazione soggettiva. Un aumento di10dB corrisponde a intensità per10,20dB a per100. Per sorgenti incoerenti si sommano le intensità prima di calcolare il logaritmo. Frequenza e sensibilità dell’ascoltatore influenzano la percezione, quindi uguali dB non certificano uguale esperienza soggettiva. Il valoreI=0 non ha logaritmo finito.

**Esempio svolto.** ConI0=10^-12W/m² eI=10^-8W/m² trovaβ.

1. I/I0=10^4.
2. log10(10^4)=4.
3. β=10·4=40dB.

**Risultato:** 40dB.

**Prova autonoma:** Il livello passa da40 a60dB con lo stesso riferimento. Qual è il rapporto fra intensità?

**Risposta e feedback:** 100 Δβ=20dB implica10^(20/10)=100.

**Trasferimento:** Due sorgenti incoerenti uguali, ciascuna a40dB nel punto, agiscono insieme. Quale livello totale approssimato?

**Risposta e feedback:** 43,0103dB L’intensità raddoppia: incremento10log10(2)≈3,0103dB, non40dB aggiuntivi.

**Errori tipici:** Sommare direttamente i livelli in dB; Sostenere che il suono si propaga nel vuoto

**Aiuti progressivi:** Calcola il rapporto di intensità / Somma intensità prima del logaritmo

**Ripasso:** Il decibel esprime un rapporto logaritmico rispetto a un riferimento.

## U4-05 - Doppler qualitativo

L’effettoDoppler è una variazione della frequenza ricevuta dovuta al moto relativo di sorgente e osservatore rispetto al mezzo. Quando sorgente e osservatore si avvicinano la frequenza ricevuta aumenta; quando si allontanano diminuisce, nel regime usuale subsonico. Una sorgente in moto comprime le distanze fra fronti davanti a sé e le dilata dietro; un osservatore in moto incontra più o meno fronti per unità di tempo. La velocità dell’onda rispetto al mezzo non aumenta perché si muove la sorgente. Il syllabus qui chiede una descrizione qualitativa: non occorre introdurre una formula quantitativa senza ipotesi e convenzioni. Nel passaggio davanti all’osservatore cambia la componente del moto lungo la linea di vista.

**Esempio svolto.** Un’ambulanza con tono emesso costante si avvicina a un osservatore fermo e poi si allontana. Descrivi il suono ricevuto rispetto alla frequenza emessa.

1. In avvicinamento i fronti arrivano più ravvicinati nel tempo.
2. La frequenza ricevuta è maggiore prima del passaggio.
3. In allontanamento i fronti arrivano più distanziati e la frequenza è minore.

**Risultato:** Più acuto in avvicinamento, più grave in allontanamento.

**Prova autonoma:** Un osservatore va incontro a una sorgente sonora ferma nel mezzo. Riceve frequenza maggiore o minore?

**Risposta e feedback:** Maggiore nel regime usuale. L’osservatore incontra più fronti d’onda per unità di tempo.

**Trasferimento:** Una sorgente si allontana ma alza la potenza mantenendo frequenza emessa costante. Un suono più intenso annulla necessariamente lo spostamentoDoppler?

**Risposta e feedback:** No. Intensità e frequenza sono grandezze diverse. Aumentare la potenza non elimina il cambiamento nel ritmo di arrivo dei fronti.

**Errori tipici:** Confondere volume percepito e frequenza; Attribuire la velocità della sorgente all’onda nel mezzo

**Aiuti progressivi:** Disegna fronti successivi / Conta quanti fronti incontra l’osservatore

**Ripasso:** Il Doppler modifica la frequenza ricevuta; non va confuso con attenuazione.

## U7-01 - Radiazione elettromagnetica

Un’onda elettromagnetica piana nel vuoto ha campi elettrico e magnetico oscillanti fra loro perpendicolari e perpendicolari alla direzione di propagazione; trasporta energia senza richiedere un mezzo materiale. La velocità nel vuoto èc=299792458m/s e valec=λf. In un mezzo la velocità può essere diversa e si usa la relazionev=λf con il modello del mezzo. L’ampiezza del campo e la frequenza sono grandezze distinte: nel modello lineare fissato l’intensità media cresce con il quadrato dell’ampiezza, mentre l’energia per fotone dipende dalla frequenza. Aumentare la luminosità a frequenza fissa non rende automaticamente la radiazione più energetica per singolo fotone.

**Esempio svolto.** Nel vuoto una radiazione haf=3·10^8Hz. Usa c=299792458m/s e trovaλ.

1. λ=c/f.
2. 299792458/(3·10^8)=0,9993081933m.
3. Il valore è circa1m; l’approssimazione c≈3·10^8m/s darebbe1m esatto.

**Risultato:** λ≈0,9993081933m.

**Prova autonoma:** In un mezzo non dispersivo la velocità è2·10^8m/s ef=5·10^14Hz. Trovaλ.

**Risposta e feedback:** 4·10^-7m =400nm La relazione usa la velocità nel mezzo, nonc nel vuoto.

**Trasferimento:** A frequenza e mezzo fissati l’ampiezza del campo elettrico raddoppia. Come varia l’intensità? Cambia la frequenza?

**Risposta e feedback:** Intensità quadruplica; frequenza invariata. Ampiezza e ritmo di oscillazione sono parametri indipendenti del modello.

**Errori tipici:** Richiedere aria per propagare la luce; Confondere ampiezza e frequenza

**Aiuti progressivi:** Distingui vuoto e mezzo / Controlla λf=v

**Ripasso:** Le ondeEM propagano campi e energia; ampiezza non è energia del singolo fotone.

## U7-02 - Spettro

Lo spettro elettromagnetico ordina le radiazioni per frequenza o lunghezza d’onda. A frequenza crescente nel vuoto si incontrano radio,microonde,infrarosso,visibile,ultravioletto,raggiX,gamma; nello stesso ordine la lunghezza d’onda diminuisce poichéλ=c/f. Le regioni hanno confini convenzionali e alcuni intervalli possono sovrapporsi a seconda del meccanismo di emissione, soprattuttoX e gamma. I raggiX derivano da processi elettronici o frenamento di elettroni; i gamma da transizioni nucleari nel perimetro elementare considerato:non una soglia energetica universale che separi tutte le origini. Il colore nel visibile corrisponde alla frequenza percepita in condizioni usuali, ma non esaurisce intensità e composizione spettrale. La classificazione per regione non è da sola una valutazione clinica di rischio: contano energia,dose e interazione. Non usare una frequenza come se fosse una velocità.

**Esempio svolto.** Ordina infrarosso,raggiX e microonde per frequenza crescente e per lunghezza d’onda crescente nel vuoto.

1. Nel vuoto f eλ sono inversamente proporzionali.
2. Frequenza: microonde<infrarosso<raggiX.
3. Lunghezza: raggiX<infrarosso<microonde.

**Risultato:** Ordini opposti per frequenza e lunghezza d’onda.

**Prova autonoma:** Fra luce rossa e violetta nel vuoto, quale ha frequenza maggiore e qualeλ maggiore?

**Risposta e feedback:** Violetta:f maggiore; rossa:λ maggiore. Il violetto è verso l’estremo di frequenza maggiore del visibile.

**Trasferimento:** Due radiazioni nel vuoto hannoλ1=2λ2. Quale rapporto f1/f2 ed energia per fotoneE1/E2?

**Risposta e feedback:** 1/2 per entrambi. f=c/λ edE=hf: raddoppiareλ dimezza frequenza ed energia per fotone.

**Errori tipici:** Ordinare nello stesso versoλ ef; Confondere i nomi delle regioni con soglie assolute universali

**Aiuti progressivi:** Scrivi la sequenza per frequenza / Inverti l’ordine soltanto quando passi aλ

**Ripasso:** Nel vuoto la frequenza crescente corrisponde aλ decrescente.

## U7-03 - Fotoni

La radiazione scambia energia in quanti chiamati fotoni. Un fotone di frequenzaf ha energiaE=hf, conh=6,62607015·10^-34J s. Nel vuotoE=hc/λ. Il joule e l’elettronvolt sono unità di energia:1eV=1,602176634·10^-19J. La potenza di un fascio monocromatico, se tutti i fotoni considerati hanno la stessa energia, è il numero di fotoni per secondo moltiplicato perE. Intensità maggiore a frequenza fissata significa più energia per tempo e area, non fotoni individuali più energetici. Un fotone non è una piccola onda meccanica che richiede un mezzo materiale.

**Esempio svolto.** Un fotone haf=5·10^14Hz. CalcolaE usandoh SI preciso.

1. E=6,62607015·10^-34·5·10^14.
2. Coefficienti:33,13035075; esponente10^-20.
3. Normalizza:E=3,313035075·10^-19J≈2,06783eV.

**Risultato:** 3,313035075·10^-19J.

**Prova autonoma:** Raddoppiaf a parità di numero di fotoni. Come cambia l’energia totale?

**Risposta e feedback:** Raddoppia. Ogni fotone ha energia lineare inf; il numero resta uguale.

**Trasferimento:** Una sorgente monocromatica emette10^12fotoni/s da2eV ciascuno. TrovaP con1eV=1,602176634·10^-19J.

**Risposta e feedback:** 3,204353268·10^-7W Energia per fotone3,204353268·10^-19J, moltiplicata per10^12s^-1. Non è un’energia totale senza durata.

**Errori tipici:** EsprimereE inHz; Equiparare più fotoni a maggiore energia per fotone

**Aiuti progressivi:** Scrivi primaE=hf / Conserva J s·s^-1

**Ripasso:** Frequenza determina energia per fotone; il flusso di fotoni determina la potenza a frequenza fissata.

## U7-04 - Assorbimento

Nel modello diLambert-Beer per fascio collimato monocromatico in mezzo omogeneo l’intensità trasmessa èI(x)=I0 exp(−μx), conμ≥0 in m^-1 ex≥0 in m. La trasmissioneI/I0 è adimensionale; il prodottoμx deve esserlo. Strati successivi indipendenti sommano gli spessori o le profondità ottiche, non le percentuali attenuate. La forma spettrofotometrica con logaritmo decimaleA=log10(I0/I)=εcl usa coefficienti definiti per quella base: non confondereμ conε senza conversione. Il modello non include in modo generale diffusione multipla, fascio policromatico o variazioni del mezzo. x=0 implicaI=I0 e un coefficiente positivo non può aumentareI.

**Esempio svolto.** Un materiale haμ=ln2m^-1 e spessore1m. Quale frazione del fascio è trasmessa?

1. μx=ln2.
2. I/I0=exp(−ln2)=1/2.
3. Trasmissione50%; attenuazione50%.

**Risultato:** I=I0/2.

**Prova autonoma:** Due strati,ciascuno conμ=ln2m^-1 e spessore1m,sono sovrapposti. ConI=I0exp(−μx),quale trasmissione totale?

**Risposta e feedback:** 1/4=25% Moltiplica le trasmissioni1/2·1/2; non sottrarre due volte50% dell’intensità iniziale.

**Trasferimento:** Un campione haI/I0=0,01. Qual èA decimale? Se lo spessore raddoppia nello stesso modello lineare ottico?

**Risposta e feedback:** A=2;A raddoppia a4 e trasmissione diventa10^-4. A=−log10(0,01). La profondità ottica cresce linearmente con il cammino, l’intensità no.

**Errori tipici:** Sommare percentuali successive; Inserirecm conμ in m^-1

**Aiuti progressivi:** Controllaμx adimensionale / Distingui assorbimento e trasmissione

**Ripasso:** La trasmissione esponenziale di strati si moltiplica.

## U7-05 - Radioattività

Isotopi dello stesso elemento hanno uguale numero di protoni e diverso numero di neutroni; alcuni nuclei instabili decadono spontaneamente. Il numero medio di nuclei non decaduti segueN=N0 exp(−λt), conλ>0 e attivitàA=λN inBq, cioè decadimenti al secondo. L’emivitaT1/2=ln2/λ dimezzaN eA a ogni intervallo uguale; non indica che ogni singolo nucleo decada dopo lo stesso tempo. Il decadimentoα riduce numero di massaA di4 e numero atomicoZ di2;β− conservaA e aumentaZ di1,β+ conservaA e riduceZ di1;γ cambia lo stato energetico senza cambiareA oZ. Gli eventi sono stocastici; la legge esponenziale descrive valori medi di insiemi. Attività non coincide con dose assorbita o rischio biologico.

**Esempio svolto.** Un campione ha attività800Bq ed emivita2h. Quale attività media dopo6h, senza produzione di nuovi nuclei?

1. 6h corrispondono a3emivite.
2. A=800·(1/2)^3.
3. A=100Bq.

**Risultato:** 100Bq.

**Prova autonoma:** Un nucleo conA=226,Z=88 emetteα. QualiA eZ ha il nucleo figlio?

**Risposta e feedback:** A=222,Z=86 Sottrai4nucleoni e2protoni. Non usare il simboloA dell’attività nello stesso passaggio senza distinguere i significati.

**Trasferimento:** Un nucleo conA=14,Z=6 subisceβ− e poiγ. Come cambianoA eZ? Dopo un’altra emivita cosa succede all’attività100Bq?

**Risposta e feedback:** Dopoβ−:A=14,Z=7;γ non li cambia. Attività media50Bq. Ilβ− converte un neutrone in protone con emissione degli altri prodotti. Gamma rilassa l’energia del nucleo.

**Errori tipici:** ConfondereBq con dose; Trattare l’emivita come appuntamento deterministico del singolo nucleo

**Aiuti progressivi:** Conta il numero di emivite / BilanciaA eZ separatamente

**Ripasso:** Decadimento è probabilistico; attività e numero di nuclei dimezzano insieme.

## U7-06 - Ionizzazione

Ionizzare significa rimuovere un elettrone da un atomo o molecola e richiede energia rispetto a una soglia specifica. Per assorbimento di un singolo fotone si confrontaE=hf con quella soglia; non esiste una soglia numerica identica per ogni materiale. Radio,microonde e infrarosso sono esempi usuali non ionizzanti per singolo fotone;raggiX e gamma sono tipicamente ionizzanti. L’ultravioletto copre energie diverse e la classificazione richiede frequenza e specie considerata. Un fascio molto intenso di fotoni sotto soglia non aumenta l’energia del singolo fotone; può comunque produrre riscaldamento e altri effetti. Non ionizzante non significa innocuo. Effetti multifotonici o ad altissimo campo richiedono modelli ulteriori e sono esclusi dal confronto elementare.

**Esempio svolto.** Un atomo ha soglia di ionizzazione10eV nel modello a singolo fotone. Confronta fotoni da3eV e12eV.

1. 3eV è inferiore a10eV: insufficiente per quella ionizzazione a singolo fotone.
2. 12eV supera la soglia.
3. Se assorbito per ionizzare, restano fino a2eV per l’energia cinetica nel modello ideale.

**Risultato:** 3eV insufficiente;12eV energeticamente sufficiente.

**Prova autonoma:** Raddoppiare il numero di fotoni da3eV rende ciascuno da6eV?

**Risposta e feedback:** No. Il numero aumenta l’energia totale del fascio, non l’energia individuale che dipende da frequenza.

**Trasferimento:** Due specie hanno soglie5eV e9eV. Un fotone da7eV è sopra soglia per entrambe? Un’esposizione non ionizzante è sempre senza effetti?

**Risposta e feedback:** Sopra soglia solo per la prima; no, può produrre effetti come riscaldamento. Il confronto è specifico della specie. La classificazione fisica non è da sola un giudizio di sicurezza sanitaria.

**Errori tipici:** Definire una soglia unica per ogni atomo; Dire non ionizzante quindi innocuo

**Aiuti progressivi:** Confronta energie nella stessa unità / Separa singolo fotone e energia totale

**Ripasso:** La soglia è specifica del sistema e il confronto elementare è per singolo fotone.

## U7-07 - Ottica geometrica

Nella riflessione l’angolo riflesso uguaglia l’angolo incidente, misurati dalla normale. Nella rifrazione n1 sinθ1=n2 sinθ2 e n=c/v; entrando in un mezzo con indice maggiore il raggio si avvicina alla normale. La frequenza resta fissata dalla sorgente, mentre velocità e lunghezza d’onda cambiano. Per una lente convergente sottile scegliamo f>0 e oggetto reale a distanza p>0; 1/f=1/p+1/q. Una soluzione q>0 descrive un’immagine reale dall’altro lato, q<0 un’immagine virtuale sul lato dell’oggetto. L’ingrandimento trasversale è m=−q/p. A p=f i raggi emergono paralleli e l’immagine non è a distanza finita. Per p<f l’immagine è virtuale, diritta e ingrandita: una lente convergente non forma sempre un’immagine reale. Tutte queste leggi richiedono il modello geometrico, lente sottile e raggi vicini all’asse.

**Esempio svolto.** Una lente convergente ha f=10 cm; un oggetto è posto a p=30 cm. Determina q e m.

1. 1/q=1/10−1/30=1/15 cm^-1.
2. q=15 cm>0: immagine reale oltre la lente.
3. m=−15/30=−0,5: immagine capovolta e alta metà dell’oggetto.

**Risultato:** q=15 cm; m=−0,5; immagine reale e capovolta.

**Prova autonoma:** Una lente convergente sottile ha f=10cm e oggetto reale a5cm: calcolaq em.

**Risposta e feedback:** q=−10 cm; m=+2 L’oggetto è dentro il fuoco: il segno negativo di q indica immagine virtuale sul lato dell’oggetto, non una distanza fisica impossibile.

**Trasferimento:** Un raggio passa dall’aria n=1 a vetro n=1,5 con θi=30°. Quanto vale sinθt e quale angolo ha il raggio riflesso? Cambia la frequenza?

**Risposta e feedback:** sinθt=1/3; θriflesso=30°; frequenza invariata. Snell usa gli angoli dalla normale. Il vetro riduce velocità e lunghezza d’onda, non la frequenza.

**Errori tipici:** Misurare gli angoli dalla superficie; Trattare q negativa come errore numerico; Sostenere che nel vetro cambia la frequenza

**Aiuti progressivi:** Disegna normale o asse ottico / Dichiara la convenzione dei segni / Confronta p con f prima del calcolo

**Ripasso:** La natura dell’immagine richiede segno di q e ingrandimento, non il solo tipo di lente.

## Verifica finale per ogni sotto-obiettivo

**U4-01.01** Un’onda sonora può propagarsi nel vuoto del modello classico elementare?

Risposta proposta: No:è meccanica e richiede mezzo materiale.

**U4-01.02** Una cresta attraversa una corda:gli elementi della corda devono viaggiare con essa fino all’estremo?

Risposta proposta: No:oscillano localmente mentre perturbazione ed energia si propagano.

**U4-01.03** Per un oscillatore armonico l’intervallo positivo minimo per tornare allo stesso stato di posizione e velocità è0,2s. Che cosa rappresenta?

Risposta proposta: Il periodoT=0,2s;la condizione di minimo esclude multipli interi del periodo.

**U4-01.04** Un oscillatore compie15cicli in3s. Qual èf?

Risposta proposta: 5Hz.

**U4-01.05** Se f=8Hz,quanto valeT?

Risposta proposta: 0,125s.

**U4-01.06** Per f=3Hz quale pulsazione?

Risposta proposta: 6πrad/s,poichéω=2πf.

**U4-01.07** Come si riconosceλ su un profilo spaziale sinusoidale a tempo fisso?

Risposta proposta: Distanza fra due punti consecutivi in fase,per esempio due creste.

**U4-01.08** Conλ=0,4m ef=5Hz quale velocità di propagazione?

Risposta proposta: 2m/s.

**U4-01.09** La forma sin(kx−ωt) conk,ωpositivi viaggia verso quale direzione? Perché?

Risposta proposta: +x; a fase costantex=(ω/k)t+costante cresce nel tempo.

**U4-01.10** In un’onda trasversale lo spostamento locale è parallelo o perpendicolare alla propagazione? E in una longitudinale?

Risposta proposta: Perpendicolare nella trasversale,parallelo nella longitudinale.

**U4-02.01** Due spostamenti istantanei−2mm e+5mm nello stesso punto di un mezzo lineare danno quale risultante?

Risposta proposta: +3mm;la somma è algebrica.

**U4-02.02** Due onde uguali possono annullare lo spostamento localmente senza distruggere l’energia di tutto il campo?

Risposta proposta: Sì:l’interferenza distruttiva locale è compatibile con ridistribuzione energetica e nodi.

**U4-03.01** Una sorgente trasferisce0,8J in un impulso. Qual è l’energia dell’impulso e si può dedurre la potenza senza durata?

Risposta proposta: 0,8J;no,serve l’intervallo temporale.

**U4-03.02** Un’onda trasferisce0,8J in0,2s. Quale potenza media?

Risposta proposta: 4W.

**U4-03.03** Potenza10W attraversa uniformemente area5m² perpendicolare. Quale intensità?

Risposta proposta: 2W/m².

**U4-03.04** Per sorgente isotropa senza assorbimento,I=18W/m² a1m. Quanto vale a3m?

Risposta proposta: 2W/m²;area sferica cresce di9.

**U4-04.01** Il passaggio del suono da aria ad acqua permette di mantenere sempre la stessa velocità?

Risposta proposta: No:la velocità dipende dalle proprietà del mezzo;la frequenza di una sorgente invariata resta la stessa all’interfaccia stazionaria.

**U4-04.02** Due suoni con stessa intensità ma frequenze diverse sono necessariamente percepiti come ugualmente forti?

Risposta proposta: No:la percezione dipende anche dalla frequenza e dall’ascoltatore.

**U4-04.03** ConI/I0=10^7,quale livello di intensità?

Risposta proposta: 70dB.

**U4-05.01** Nel regime subsonico usuale,un osservatore va incontro alla sorgente sonora:la frequenza ricevuta aumenta o diminuisce?

Risposta proposta: Aumenta.

**U4-05.02** Una sorgente sonora si allontana dall’osservatore fermo:il periodo fra fronti ricevuti cresce o diminuisce?

Risposta proposta: Cresce;la frequenza ricevuta diminuisce.

**U4-05.03** Muovere sorgente o osservatore ha lo stesso meccanismo geometrico rispetto ai fronti nel mezzo?

Risposta proposta: No:la sorgente modifica la spaziatura dei fronti,l’osservatore ne modifica il ritmo di incontro.

**U4-05.04** IlDoppler è un cambiamento necessario della frequenza emessa dalla sorgente?

Risposta proposta: No:può cambiare solo quella ricevuta a frequenza emessa invariata.

**U7-01.01** In un’ondaEM piana nel vuoto,E eB sono paralleli fra loro?

Risposta proposta: No:sono perpendicolari fra loro e alla direzione di propagazione.

**U7-01.02** Se la frequenza di un’ondaEM nel vuoto triplica,come cambiaλ?

Risposta proposta: Si riduce a1/3,poichéc=λf.

**U7-01.03** La velocità della luce in un mezzo con indice2 è quale frazione dic nel modello indicato?

Risposta proposta: c/2.

**U7-01.04** Raddoppiare l’ampiezza del campo elettrico in un’ondaEM cambia necessariamente la frequenza?

Risposta proposta: No:sono parametri distinti.

**U7-01.05** Nello stesso mezzo lineare a frequenza fissata,triplicare l’ampiezza comporta quale intensità?

Risposta proposta: Nove volte l’intensità.

**U7-02.01** Fra onde radio e luce visibile,quali hanno frequenza minore nel vuoto?

Risposta proposta: Le onde radio.

**U7-02.02** Le microonde si collocano tra radio e quale altra regione a frequenze crescenti?

Risposta proposta: Infrarosso.

**U7-02.03** Fra infrarosso e ultravioletto quale regione si trova?

Risposta proposta: Visibile.

**U7-02.04** Nel visibile,il violetto haλ maggiore o minore del rosso nel vuoto?

Risposta proposta: Minore.

**U7-02.05** L’ultravioletto ha frequenze maggiori o minori del visibile?

Risposta proposta: Maggiori nel consueto ordinamento spettrale.

**U7-02.06** Fra raggiX e microonde,quali hanno fotoni più energetici nel consueto spettro?

Risposta proposta: RaggiX,per frequenza maggiore.

**U7-02.07** Confronta raggiγ e luce visibile nel consueto spettro per frequenza e lunghezza d’onda nel vuoto. Perché la distinzioneX/γ non è soltanto una soglia energetica universale?

Risposta proposta: Iγ hanno frequenza tipicamente maggiore e lunghezza d’onda minore del visibile. La distinzioneX/γ riguarda anche l’origine:elettronica o frenamento perX,transizioni nucleari perγ;gli intervalli energetici possono sovrapporsi.

**U7-02.08** Se la frequenza aumenta in vuoto,cosa accade aλ? Elenca l’ordine delle regioni a frequenza crescente.

Risposta proposta: λ diminuisce:radio,microonde,infrarosso,visibile,ultravioletto,X,gamma,con confini convenzionali e possibili sovrapposizioniX/γ.

**U7-03.01** Un fotone rappresenta un quanto di quale grandezza legata alla radiazione?

Risposta proposta: Energia scambiata dalla radiazione,conE=hf;non una quantità di carica elettrica.

**U7-03.02** Se la frequenza passa daf a4f,come varia l’energia per fotone?

Risposta proposta: Quadruplica,daE=hf.

**U7-04.01** PerLambert-Beer conμ>0,come varia l’intensità al crescere del cammino in un mezzo omogeneo?

Risposta proposta: Decresce esponenzialmente:I=I0exp(−μx).

**U7-04.02** Quale unità deve avereμ se x è in cm?

Risposta proposta: cm^-1,cosìμx è adimensionale.

**U7-04.03** Due strati della stessa sostanza hanno spessori2cm e3cm. Quale cammino totale e come si combinano le trasmissioni?

Risposta proposta: 5cm;le trasmissioni si moltiplicano.

**U7-04.04** Un campione trasmette20% della luce incidente. Quale rapportoI/I0 e quale attenuazione percentuale?

Risposta proposta: 0,2;attenuazione80% nel modello senza altri canali separati.

**U7-05.01** Due isotopi del medesimo elemento hanno quale numero uguale e quale diverso?

Risposta proposta: Uguale numero di protoniZ;diverso numero di neutroni,quindi diverso numero di massa.

**U7-05.02** Un campione registra in media300decadimenti/s. Quale attività?

Risposta proposta: 300Bq;non una dose assorbita.

**U7-05.03** Nella leggeN=N0exp(−λt),quali unità haλ e quale segno fisico?

Risposta proposta: s^-1 se t in s;λ>0 per decadimento spontaneo del modello.

**U7-05.04** Campione iniziale640Bq,T1/2=3h. Quale attività dopo12h?

Risposta proposta: 40Bq,dopo4emivite.

**U7-05.05** Indica le variazioni diA eZ perα,β− eγ.

Risposta proposta: α:A−4,Z−2;β−:Ainvariata,Z+1;γ:AeZinvariati.

**U7-05.06** Un nucleo conA=40,Z=19 subisceβ+. QualiA eZ finali?

Risposta proposta: A=40,Z=18,con gli altri prodotti del decadimento.

**U7-06.01** Una soglia di ionizzazione è identica per tutte le specie atomiche?

Risposta proposta: No:dipende dal sistema e dallo stato considerato.

**U7-06.02** Un fotone da11eV incontra soglia8eV:è energeticamente sufficiente nel modello a singolo fotone? Uno da6eV?

Risposta proposta: 11eVsì,6eVno;essere sopra soglia non implica assorbimento certo.

**U7-06.03** Indica esempi usuali diEM non ionizzanti e ionizzanti per singolo fotone.

Risposta proposta: Radio,microonde,infrarosso non ionizzanti;raggiX eγ tipicamente ionizzanti,con soglia del sistema esplicita.

**U7-06.04** Un fascio raddoppia intensità a frequenza fissa. Cambia l’energia del singolo fotone o il flusso energetico?

Risposta proposta: Cambia il flusso energetico;E=hf del singolo fotone resta uguale.

**U7-07.01** Un raggio arriva a40° dalla normale e si riflette specularmente. Quale angolo riflesso dalla normale?

Risposta proposta: 40°.

**U7-07.02** Passando da indice1 a indice1,3,un raggio obliquo si avvicina o allontana dalla normale?

Risposta proposta: Si avvicina,nel regime trasmesso usuale.

**U7-07.03** Un mezzo ha velocitàc/1,25. Qual è l’indice?

Risposta proposta: 1,25,adimensionale.

**U7-07.04** Da n1=1,n2=2,sinθ1=0,6. Quanto vale sinθ2?

Risposta proposta: 0,3 daSnell.

**U7-07.05** Lente convergente sottile:f=12cm,p=24cm. Quali q e ingrandimento?

Risposta proposta: q=24cm,m=−1;immagine reale e capovolta.

**U7-07.06** Una lente convergente ha oggetto reale dentro il fuoco. Quale natura e orientazione dell’immagine nel modello paraxiale?

Risposta proposta: Virtuale,diritta e ingrandita;per p=f l’immagine non è a distanza finita.

