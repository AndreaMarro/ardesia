# Revisione indipendente cric-c1-l007

Dieci problemi originali distinti: autore B e revisore A. Primaria manuale `227d4a08` e modello `0a430e35` congelati prima di aprire qualsiasi candidata. Nessuna opzione o chiave è stata usata per costruire quei modelli; il successivo confronto include tutti i campi delle cinquanta nuove schede, le fonti complete e le cinque lezioni reali. La primaria originale resta byte-identica e il suo testo è citato nei rapporti macchina; qui la prosa è distesa per la lettura umana.

Edizione finale B: `b2321dab71379e6b5ddab48d701bacadb8196b31`. Riletti per intero i quindici record modificati e il successivo chiarimento di unità di Q089; gli altri trentacinque sono invariati per confronto. Cinque nuovi SVG letti in XML e in immagini native complete, oltre al confronto XML con diciassette figure storiche. Nessun modulo autore importato.

I diciassette test comuni valgono per l’insieme dei cinque cohort. Il controllo usa il contratto canonico sulle identità fresh e salvate. L’integrazione e la UI prodotto del ROOT restano da eseguire dall’integratore; lettura SVG e verifica matematica non le sostituiscono. DRAFT, approvazione umana NOT_RUN e pubblicazione NONE.

## C1-Q061

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Il lavoro della forza costante è W=Fs cosθ. Con F 16 N, s 5 m e cos 60°=1/2: W 16·5/2=40 J. È la componente parallela allo spostamento a lavorare; non usare il seno o l’angolo dalla perpendicolare.

Ipotesi: Forza costante 16 N, spostamento del suo punto di applicazione 5 m, angolo 60° fra i vettori e coseno positivo.

Distrattori: 80 J omette cos60°; −40 J inverte l’allineamento. Otto newton è la componente, ancora da moltiplicare per 5 m.

Figura: XML e nuovo PNG nativo indipendente 640×1550 interi letti. F obliqua lunga200 a 60° e proiezione100, stessa scala 12,5 coordinate/N; spostamento350 per 5 m su scala distinta. Trapezio da 2 a 10 N: altezze60/300, base320 per 2/5 m, aree4/5+8/5=12/5 J. Barre cinetiche100/340 per 5/17 J. Origine0 fuori dagli assi; testi e punte leggibili.

Fonte SHA: `f0d854d6279020b93d2a182506adbec242ebd1620a6b5d4a047f017b1c20cacd`. Candidata SHA: `f90bad922a5dbe180bebf5bc502dcc2bdfcb5b92c930eed781f640c4ca9a85dd`. Firma: `7b9a4e8aa544f2ba5983bf932f141a8150eed369afd6077bdba3923042d3f72d`.

## C1-Q062

Metodo: AI_CONCEPTUAL; ambito: NO_STUDENT_CALCULATION.

Derivazione indipendente: Il centro e la lunghezza del filo sono fissi, quindi lo spostamento istantaneo è tangente al cerchio e la tensione radiale. Il prodotto T·dr è zero in ogni istante e il lavoro totale è nullo. La forza può essere non nulla e produrre accelerazione centripeta senza cambiare la rapidità.

Ipotesi: Filo teso ideale di lunghezza fissa, centro fisso; ogni spostamento infinitesimo tangente è perpendicolare alla tensione radiale.

Distrattori: La tensione non è nulla e il punto si sposta. Modulo costante non implica lavoro nullo; il parallelismo darebbe lavoro non nullo.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `18c7a757ea7f46c89785ea639b4d24726ff0aa0498d42b9fd1062648db0ee35c`. Candidata SHA: `642b79934a7453a4e7ae2bd8a050e4e3332538f298ec44146ece5914cf921033`. Firma: `f9149c7adeaf1ca93909424a8fee3d3bee5fec4c91eea6c0e5ecc74587aea8b7`.

## C1-Q063

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: La forza frenante è tangenziale e sempre opposta allo spostamento del punto di applicazione materiale assegnato. W=∫−8 N ds=−8·6=−48 J. Il percorso complessivo 6 m non è uno spostamento vettoriale nullo dopo un giro; il lavoro resistente si accumula negativo.

Ipotesi: Forza tangenziale resistente costante 8 N, sempre opposta allo spostamento locale;6 m è percorso cumulativo, non corda geometrica.

Distrattori: 48 J perde il segno; zero confonde direzione radiale e tangenziale. I rapporti 8/6 o 6/8 fra i dati non hanno unità di lavoro.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `33314daeb876242dee873bc0c43e9783b8c0be1092355cc86a756bf288d3ea64`. Candidata SHA: `6d47758bc9b4a116627f4da35cba14efc200e8d08a96fda781dcd85f6f979b23`. Firma: `2cd9b2af7eff88c9db56f9440b5879e15397013bee263bd45b5ac45dc280b2fd`.

## C1-Q064

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Forza parallela concorde lineare: lavoro uguale area del trapezio F–s. Forza media spaziale(2+10)/2=6 N, moltiplicata per 0,40 m dà 2,4 J=12/5 J. Equivalentemente rettangolo 0,8 J più triangolo 1,6 J. La media spaziale è valida perché F varia linearmente nello spazio, non per una supposizione sul tempo.

Ipotesi: Forza parallela concorde lineare nello spazio da 2 a 10 N su 2/5 m; media degli estremi spaziale, non universale nel tempo.

Distrattori: 4 J usa solo la forza finale; 4/5 J solo quella iniziale. 16/5 J usa ΔF·d senza il fattore mezzo; 12 copia la somma degli estremi senza media e distanza.

Figura: XML e nuovo PNG nativo indipendente 640×1550 interi letti. F obliqua lunga200 a 60° e proiezione100, stessa scala 12,5 coordinate/N; spostamento350 per 5 m su scala distinta. Trapezio da 2 a 10 N: altezze60/300, base320 per 2/5 m, aree4/5+8/5=12/5 J. Barre cinetiche100/340 per 5/17 J. Origine0 fuori dagli assi; testi e punte leggibili.

Fonte SHA: `304fdeccbfa6b0dab5544590e1bf35a803f993acc12e4bbf1060450b2f2e38ab`. Candidata SHA: `8ff0d335e5e8bc61c9ff920ce26c5f335c3833fe1ea44f81dbbefc4756d5a798`. Firma: `5e4f14259f79ffd41fc3258c4cba02e7ac2d63b575aeb8dbb70c2cf133f84d79`.

## C1-Q065

Metodo: AI_CONCEPTUAL; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: A massa costante K=mv²/2. Se la rapidità finale è 2 v_i, K_f=4 K_i. L’aumento richiesto rispetto all’inizio è ΔK=K_f−K_i=3 K_i, non 4 K_i; distinguere un aumento additivo dal fattore del valore finale.

Ipotesi: Massa costante positiva e rapidità iniziale non nulla, regime classico in entrambe le prove; aumento distinto da fattore finale.

Distrattori: Un incremento di 4K_i non è il valore finale 4K_i. Una dipendenza lineare darebbe incremento K_i; zero e K_i/2 non seguono da v².

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `3a1b0152e144898d89c1da1e52c4aebc89ecb8015c0e1aade75db6449cfb8453`. Candidata SHA: `920f60a1cf48698e98b65bd0ad2bf4fd769dd973278ff1f8ae299f7c19107e87`. Firma: `746cb58503fd4cd9edc821d59a06cd3bd5cd8476ba9ae619e961058dca8f9802`.

## C1-Q066

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Teorema lavoro–energia per il corpo: W_tot 18−6=12 J, quindi K_f=K_i+W_tot=5+12=17 J. Le altre forze hanno lavoro nullo come assegnato; il lavoro negativo non va sommato come modulo positivo.

Ipotesi: Tutti i lavori sullo stesso corpo inclusi:18 e−6 J, altri nulli; K iniziale 5 J e K finale non negativa.

Distrattori: 12 J è ΔK; 29 J somma i moduli; 23 J ignora l’attrito. 5 J impone lavoro totale nullo.

Figura: XML e nuovo PNG nativo indipendente 640×1550 interi letti. F obliqua lunga200 a 60° e proiezione100, stessa scala 12,5 coordinate/N; spostamento350 per 5 m su scala distinta. Trapezio da 2 a 10 N: altezze60/300, base320 per 2/5 m, aree4/5+8/5=12/5 J. Barre cinetiche100/340 per 5/17 J. Origine0 fuori dagli assi; testi e punte leggibili.

Fonte SHA: `4f577c8fd3b47b6ea3617c1eea95eb053ce2180354bc68c09d620adf5597dc5a`. Candidata SHA: `8d16a45c97c8627d7c905ebf6347a88da76474055817c6b88e4eee211c4bdd15`. Firma: `feb607ca5ba2b3609d316caa21c4a3ca2f5340c733efd81ed8cec01c9a76e32b`.

## C1-Q067

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Potenza istantanea della trazione P=F·v_app. Il punto va concorde alla forza:25 N·(4/5)m/s=20 W. Si usa la velocità del punto di applicazione, non un lavoro totale senza durata.

Ipotesi: Forza e velocità del punto di applicazione concordi nell’istante; potenza istantanea, nessuna durata necessaria.

Distrattori: F/v non è una potenza; 25 e 4/5 copiano i valori numerici di forza e velocità. −20 W invertirebbe il verso relativo.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `38d170110832695ac64ac21fdc617cd7151d900826572febb958b3a733799e7a`. Candidata SHA: `707795eb868e26c225daa919a69cd854c5225d4c58eac0aadd59b5d5ff4b7be1`. Firma: `51cca828627b3532a928ea3ec9f3bcd4a2c3a3aba57db9f43ef04cc6d63fa4e9`.

## C1-Q068

Metodo: AI_CONCEPTUAL; ambito: NO_STUDENT_CALCULATION.

Derivazione indipendente: Il nome SI del lavoro è joule, simbolo J:1 J=1 N·m=1 kg·m²/s². Il prodotto vale per forza parallela a spostamento; il momento di una forza ha le stesse dimensioni ma si indica normalmente in N·m e non si identifica con un lavoro.

Ipotesi: Nome SI del lavoro; J=N·m, distinto dall’uso di N·m per un momento pur con dimensione uguale.

Distrattori: W=J/s misura potenza; Pa pressione, N forza e C carica. Nessuna di queste unità equivale al lavoro in J.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `67ed7212b481f4fb7c380b217a3720c7f5f77f43c367796806b9812a268c4007`. Candidata SHA: `c05699da96c96351d1885ee6a67ed5417d3e56c2c51d994071e7d33d04ba62b6`. Firma: `a738eded83163af62bf8a80c85a569a6ff07c991b9f562b44316d5fc6d727c52`.

## C1-Q069

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Le energie sono uguali e le potenze sono medie: P_A/P_B=(E/t_A)/(E/t_B)=t_B/t_A=3, perché t_A=t_B/3. Il dispositivo più rapido trasferisce la stessa energia con potenza maggiore; nessuna ipotesi di potenza istantanea costante è necessaria.

Ipotesi: Stesso lavoro positivo e durate positive t_A=t_B/3; confronto di potenze medie, nessuna ipotesi su picchi o profili istantanei.

Distrattori: 1/3 usa il rapporto diretto dei tempi; uno ignora le durate. Nove eleva al quadrato un fattore che compare linearmente.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `b2f5f45bd9cf2d4ebf3208b6315bd2cd087969e40d34a09040daeaa76eaa92f1`. Candidata SHA: `eafbc53ce4de8e4cd43b594221ecd1d84c79dd03698c6db58ad5bde7cfcae226`. Firma: `b41cc49f3059b7a381de395a0bf6bd43ec731f6dbd6e1d192d19619ab9695eb9`.

## C1-Q070

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: All’inizio K=(1/2)·4·3²=18 J. Fino al primo arresto la sola forza che lavora è resistente: W=−6 s. Con K_f 0,−18 J=−6 N·s→s 3 m. Non estendere una legge frenante a una rapidità negativa dopo l’arresto.

Ipotesi: Massa 4 kg, rapidità 3 m/s, forza resistente 6 N unica a lavorare; bilancio fino al primo arresto, non continuato a velocità negative.

Distrattori: 6 m omette il fattore mezzo; −3 m non è una distanza. Diciotto copia il valore numerico dell’energia senza dividerlo per 6 N.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `1312b2ae88c9f3c362418c0dc1208c9c1ad6fcf41e630c659f4c46c8ce08cab8`. Candidata SHA: `8d6f80c1996ae207aa31042478b4bcbaea662bc4497dfa59c6742c68722ca6e9`. Firma: `c453b138b12da82a10334a09badaa381e5af9612801d987d065e3c1c2ea74531`.
