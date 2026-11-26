# Revisione indipendente cric-c1-l010

Dieci problemi originali distinti: autore B e revisore A. Primaria manuale `227d4a08` e modello `0a430e35` congelati prima di aprire qualsiasi candidata. Nessuna opzione o chiave è stata usata per costruire quei modelli; il successivo confronto include tutti i campi delle cinquanta nuove schede, le fonti complete e le cinque lezioni reali. La primaria originale resta byte-identica e il suo testo è citato nei rapporti macchina; qui la prosa è distesa per la lettura umana.

Edizione finale B: `b2321dab71379e6b5ddab48d701bacadb8196b31`. Riletti per intero i quindici record modificati e il successivo chiarimento di unità di Q089; gli altri trentacinque sono invariati per confronto. Cinque nuovi SVG letti in XML e in immagini native complete, oltre al confronto XML con diciassette figure storiche. Nessun modulo autore importato.

I diciassette test comuni valgono per l’insieme dei cinque cohort. Il controllo usa il contratto canonico sulle identità fresh e salvate. L’integrazione e la UI prodotto del ROOT restano da eseguire dall’integratore; lettura SVG e verifica matematica non le sostituiscono. DRAFT, approvazione umana NOT_RUN e pubblicazione NONE.

## C1-Q091

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: x_CM=(m₁x₁+m₂x₂)/(m₁+m₂)=(1·0+3·4/5)/4=3/5 m=0,60 m. È più vicino alla massa 3 kg, ma non coincide con la sua posizione. Il numeratore ha kg·m e il denominatore kg.

Ipotesi: Masse puntiformi 1 e 3 kg positive, coordinate 0 e 4/5 m sullo stesso asse; media pesata compresa nell’intervallo.

Distrattori: 2/5 m è la media semplice; 4/5 m coincide con la seconda massa; 1/5 m favorisce quella leggera. 12/5 m copia il numeratore e uscirebbe dall’intervallo.

Figura: XML e nuovo PNG nativo indipendente 640×1620 interi letti. Centro di massa:500 coordinate/m, posizioni0,4/5 e 3/5 m. Braccio: r240 per 2/5 m e perpendicolare120 per 1/5 m, scala 600 coordinate/m; il piede(210,843,923...) sulla retta d’azione soddisfa ortogonalità salvo solo arrotondamento grafico. Forza15 N in scala distinta. Trave400 per 2 m, carico a 100 per 1/2 m; frecce90/30/120 per 45/2,15/2,30 N, stessa scala 4 coordinate/N. Nessuna origine o label interseca una punta.

Fonte SHA: `78d6e8dcc09f9664ee83cfd5568855b302e0df485cc9ca7032b3a9178085e539`. Candidata SHA: `bb4ffcf712f72d47a4fc9ee949e7983f39c518c745002e660f47319f5e108c97`. Firma: `067ab7b1b7716557d78df26c84fd450c001c9105a7c38307e7101e8569db3bfa`.

## C1-Q092

Metodo: AI_CONCEPTUAL; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Il braccio è la distanza perpendicolare b dal perno alla retta d’azione della forza: b=r|sinθ|. Modulo del momento |τ|=Fb. r è utilizzabile da sola soltanto quando la forza è perpendicolare al raggio; una forza lungo il raggio ha braccio zero.

Ipotesi: Angolo fra r e F in 0..π, braccio distanza perpendicolare non negativa; modulo del momento, non sua componente orientata.

Distrattori: r da sola funziona a 90°; r cosα è la proiezione parallela. rF non è una lunghezza e il cammino non è il braccio.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `69df25c335dc92129fe97b0b7d93b1535bd95e4e40e5e33f1838ba47823a7eab`. Candidata SHA: `daa3232a382a23344afd866baa2fd48f18c8892ba18a1ba5e2ba91fad5fdf408`. Firma: `f358128c0d5f6825fdb0e5891c671bc09ab0614ecfed47b45e060042225b7c1d`.

## C1-Q093

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Momento modulo rF sin 30°=(2/5)m·15 N·1/2=3 N·m. Il braccio effettivo è 0,20 m. Il segno non è richiesto e non si deduce senza il verso del disegno; la grandezza non è un lavoro pur avendo le stesse dimensioni.

Ipotesi: r 2/5 m, F 15 N, angolo 30° fra vettori; modulo del momento senza scegliere segno di rotazione, braccio 1/5 m.

Distrattori: 6 N·m omette il seno; 3√3 N·m usa il coseno. 1/5 m è il braccio ancora da moltiplicare per la forza.

Figura: XML e nuovo PNG nativo indipendente 640×1620 interi letti. Centro di massa:500 coordinate/m, posizioni0,4/5 e 3/5 m. Braccio: r240 per 2/5 m e perpendicolare120 per 1/5 m, scala 600 coordinate/m; il piede(210,843,923...) sulla retta d’azione soddisfa ortogonalità salvo solo arrotondamento grafico. Forza15 N in scala distinta. Trave400 per 2 m, carico a 100 per 1/2 m; frecce90/30/120 per 45/2,15/2,30 N, stessa scala 4 coordinate/N. Nessuna origine o label interseca una punta.

Fonte SHA: `6bbdc832b1e3d07eeb71ef7e74cda1c70d470dd823aaa75f079d7f537247ed4c`. Candidata SHA: `bb6b9d798769bd486314eabb72063203321034138af2f3d95c628624437210a3`. Firma: `e3da78d4cfcc09bef40b88d022e47ac2acc9daf224c3e11f952eb83e9d7cdbf7`.

## C1-Q094

Metodo: AI_CONCEPTUAL; ambito: NO_STUDENT_CALCULATION.

Derivazione indipendente: Due forze uguali opposte su rette distinte formano una coppia: risultante nulla e momento non nullo Fd, con d distanza fra rette. Per un corpo libero il centro di massa non accelera, mentre il momento modifica il moto rotatorio. Non si può concludere che il centro resti fermo se aveva già una velocità iniziale; rotazione pura da fermo è un caso, non un’ipotesi assegnata dal solo bilancio.

Ipotesi: Due forze sole di uguale modulo positivo opposte, rette parallele distinte con distanza d>0; corpo libero, a_CM nulla non implica v_CM nulla.

Distrattori: Risultante nulla non implica momento nullo. 2F contraddice le forze opposte; una singola forza non nulla cambierebbe l’accelerazione del centro di massa.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `e82e23b9bc835a30b68742f9e718077b63656d45431c6e6a74c2ad39008d7956`. Candidata SHA: `bf7897e0ad5d471111f6481b0b6b53a2495407b888a52e401450a67a9e7cdbb0`. Firma: `52cf5c1e2f401a9f05edadd76671af6a40be9e88004429442646b3dab33df8be`.

## C1-Q095

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Trave leggera, appoggi agli estremi e forza 30 N dentro il segmento. Momenti rispetto all’appoggio sinistro: R_D·2 m−30 N·0,50 m=0, quindi R_D=15/2 N=7,5 N. La reazione sinistra 22,5 N completa l’equilibrio verticale e entrambe sono verso l’alto, compatibili con il contatto.

Ipotesi: Trave con peso trascurato, appoggi agli estremi di 2 m, unico carico 30 N interno a 1/2 m; equilibrio statico, reazioni non negative.

Distrattori: 45/2 N è la reazione sinistra; 15 N presuppone carico centrale. 30 N o 60 N non rispettano entrambi i bilanci di forze e momenti.

Figura: XML e nuovo PNG nativo indipendente 640×1620 interi letti. Centro di massa:500 coordinate/m, posizioni0,4/5 e 3/5 m. Braccio: r240 per 2/5 m e perpendicolare120 per 1/5 m, scala 600 coordinate/m; il piede(210,843,923...) sulla retta d’azione soddisfa ortogonalità salvo solo arrotondamento grafico. Forza15 N in scala distinta. Trave400 per 2 m, carico a 100 per 1/2 m; frecce90/30/120 per 45/2,15/2,30 N, stessa scala 4 coordinate/N. Nessuna origine o label interseca una punta.

Fonte SHA: `ceaa569833fec375927c9957274cfc38843920407d3bd15bc4d8a9708a77cd14`. Candidata SHA: `b5d9b219acb9dc5d40cb0f440f52287accd1a89d3b836c0700ca88037cfa033a`. Firma: `ec4ec8fe7a1d56b9b6a0b33ec94e5c2ff7317b32c988c4196eb6cdb7aa24d073`.

## C1-Q096

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: Per il sistema dei tre carrelli la risultante esterna determina M_tot a_CM. Quindi a_CM=18/12=3/2 m/s² nel verso della risultante. Le forze interne non cambiano questo risultato per il centro di massa; i singoli carrelli possono avere accelerazioni diverse.

Ipotesi: Sistema a massa totale costante 12 kg, risultante esterna 18 N; forze interne cancellate solo nel bilancio totale, non dei singoli carrelli.

Distrattori: 2/3 inverte il quoziente; 6 divide per il numero di carrelli anziché per la massa. Diciotto copia il valore numerico della forza; zero elimina la risultante esterna.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `ffa0bc96983d8fb3490345b76811d8dbfc61e932f984e9eebd138725d6647b40`. Candidata SHA: `7e3adb7e5563928f169e0e3f70eef5f9770d94b14275bcc41731fc3be81ea8a7`. Firma: `db6d204cefc28021972e5fbfb8d21c53a307b6deda32da7c0bb2a4f56120d753`.

## C1-Q097

Metodo: AI_CONCEPTUAL; ambito: NO_STUDENT_CALCULATION.

Derivazione indipendente: Il modello è corpo rigido: tutte le distanze tra punti materiali restano costanti. Questo non vieta la rotazione o la traslazione dell’intero corpo. È un’idealizzazione, non l’affermazione che un materiale reale non si deformi mai.

Ipotesi: Rigidità ideale: tutte le distanze interne invarianti, traslazione e rotazione ammesse; non assenza di massa o estensione.

Distrattori: Il punto materiale elimina l’estensione. Fermo è uno stato, non la rigidità; un fluido non conserva necessariamente la forma. La definizione non implica assenza di massa.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `407a6798af5ff5099de6f296ea9fac05c03abd5d5f25542e3b219b21425e3ced`. Candidata SHA: `d304706e89124871bc5c7b9d423d382411f23ed9ee8242061eb36369fcf099a3`. Firma: `fe993985b676fb21911376ae70e5097753ba7dd40c6207f801f6ac3cc15c8f54`.

## C1-Q098

Metodo: AI_CONCEPTUAL; ambito: NO_STUDENT_CALCULATION.

Derivazione indipendente: Per due poli O e O′,τ_O′=τ_O−(OO′)×F_ris. Con F_ris 0 eτ_O 0 segueτ_O′0, mentre la risultante resta zero. L’equilibrio non dipende dal nuovo polo fisso; non basta in generale un momento nullo se la risultante non è nulla.

Ipotesi: Poli fissi O eO′, risultante esterna nulla e momento nullo rispetto aO; termine di traslazione−a×R esattamente nullo.

Distrattori: Nessun raddoppio, inversione o momento non nullo nasce dal solo spostamento del polo quando R=0. Servono entrambe le condizioni assegnate.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `0e3b1c23a4db664257211fda30adf30f84b3d1f82ee97a48856a7c3388543426`. Candidata SHA: `f27891f2b68b34786f3ffffdba30c61d564176f49dc09f13402ea9e297a47338`. Firma: `9d3c90b094a646faec3f2e39191fa1cfaffa3ec207b886532315f82bc9f2a6c5`.

## C1-Q099

Metodo: EXACT_ORACLE; ambito: EXACT_MANUAL_CALCULATION.

Derivazione indipendente: In equilibrio F_m b=6 N·m. Inizialmente b 0,03 m→F 200 N; infine b 0,04 m→F 150 N. La diminuzione richiesta è 200−150=50 N. Si usano bracci perpendicolari, non lunghezze anatomiche generiche; nessuna conclusione clinica dal modello ideale.

Ipotesi: Leva statica idealizzata con momento resistente 6 N·m, bracci perpendicolari 3/4 cm positivi, stessa geometria di equilibrio pertinente; nessuna inferenza clinica.

Distrattori: 150 N è la forza finale, 200 N quella iniziale. La differenza 4−3 cm non è una differenza di forze: il momento costante impone dipendenza inversa dal braccio.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `801dbd7855ab3f59c9be0b83dddd64f9ce24c2323b61ff2de3783ddb130801f6`. Candidata SHA: `7624af7c1e0a69afc5b46873d5e90fda369b11b0b07eec8c19524a18a7b4171a`. Firma: `e6bed136cd5fa1fea8915af241c1172769d2a8aae8ead64fc9c3ba32653f5609`.

## C1-Q100

Metodo: AI_CONCEPTUAL; ambito: NO_STUDENT_CALCULATION.

Derivazione indipendente: Il vettore dal fulcro al punto applicato è verso destra,+x; la forza è verso il basso,−y. Il prodotto r×F ha componente z negativa: rotazione oraria, quindi momento negativo con antiorario positivo. Il modulo resta rF per questa perpendicolarità.

Ipotesi: Fulcro a sinistra, vettore r verso+x e forza verso−y, convenzione antioraria positiva; segno del momento negativo anche se forza esterna.

Distrattori: Essere a destra non basta per il segno. La forza verticale ha braccio orizzontale; essere esterna non fissa il momento. Il modulo non cambia l’orientazione.

Figura: Nessuna figura collegata; testo e formule letti integralmente.

Fonte SHA: `f3025dc7cb8843e596abb8dc4c07c005f336e201786f85bd1e3717fe5bfb3a26`. Candidata SHA: `3cdb610f82aae58c06e83df1f11c8edcf4bdfe87f76c1caf7e9fa9a230f834f3`. Firma: `50a5ec28737423c6de5b33d41f6c2cc1aa0642e27309de812dafce167bd087d2`.
