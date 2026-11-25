# Revisione indipendente — venturi-area-ratio-101

Autore e reviewer distinti. Edizione autore finale `6a708c5cc4960fd7fb262397c581caace10881bb`; fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605` / `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json`. Tutti gli 80 prompt originali delle cinque famiglie sono stati letti e risolti prima di aprire i pacchetti candidati. Trasparenza: il messaggio di consegna dell’autore aveva già anticipato l’esito del record 104-06 (gittate uguali e velocità A doppia), oltre a indicazioni qualitative sui radicali, sul quartico e sul cambio dei nomi h/H. Quell’esito è stato comunque derivato dai due modelli fisici, ma non viene presentato come lettura completamente cieca della chiave. Nessun modulo autore importato.

Sono poi stati letti tutti i 16 candidati finali di questo lotto, con consegne, passaggi, formule, alternative, suggerimenti, feedback e metadati. C2-L005 e C2-L006 reali rilette per portate, energia per volume, Bernoulli e ipotesi. Tutti i cinque SVG delle famiglie sono stati letti in XML e nel rendering nativo completo, incluse geometrie, scale e traiettoria quadratica.

Pacchetto normalizzato `c24fbaafee0145c4fba731c5fb589ff9d4f80a1bd6d2b50474fe494fb01be96b`; binding `1a0b6b112142072f3e8e07bc94a40400169a4be9dcc128e29e1c85ea10e910e3`. Impronte congelate solo dopo lettura delle edizioni finali. Revisione AI distinta, approvazione umana NOT_RUN, DRAFT e publicationAction NONE. Nessuna pubblicazione o modifica del reviewer ai candidati.

## Modello e figura

Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

XML e rendering completo letti. Canale rettangolare di profondità fuori foglio 1 cm, altezze 4/2 cm: 200/100 px a 50 px/cm, aree 4/2 cm² e r=2. Frecce distinte di 80/160 px a 40 px/(m/s) per v₁=2,v₂=4 m/s. Pressioni statiche assolute 106 e 100 kPa; cinetiche 2 e 8. Barre a 4 px/kPa: 424+8=432 px e 400+32=432 px, somma 108 kPa in entrambe le sezioni. Nessuna confusione fra scala geometrica, velocità e pressione.

## Rilievo e nuova lettura

Il feedback 16 scriveva «u−3 non genera velocità reali», ambiguo fra espressione e valore del ramo. Segnalato all’autore e al root; il fix finale indicato sopra esplicita «il valore u=−3». Riletti soltanto feedback, error.message e binding 16 cambiati; formule, chiavi, asset e altri 15 record identici. Nessuna firma della vecchia stringa viene riusata. La pressione fissata nel candidato è p₂=100 kPa nella sezione stretta; non si aggiunge il falso vincolo Δp<100 che nascerebbe da un diverso dato a monte.

## AR-u3-venturi-area-ratio-01

Procedimento indipendente: Continuità A₁v₁=A₂v₂ dà v₂=rv₁=4 m/s. Bernoulli orizzontale: Δp=ρ(v₂²−v₁²)/2=1000·12/2 Pa=6 kPa. Nel candidato p₂=100 kPa assoluti e p₁=106 kPa.

Alternative e distrattori: 2 e 8 sono singoli contributi cinetici; 12 omette 1/2. Accelerazione ideale non prova dissipazione.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `6`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `557f39a2df4f41902ae7141efa791f9283a74fb137f028cfa34626666ef83de9`; candidato `6eddd73d7a13a20435d3c4d0dbf15d315434583bf43441908f69d56e510d626e`; firma `e9cbacd14e7ec1006c1d858cf9763a255ffc83d43e7463cf3d2f6e9c6c8ec399`.

## AR-u3-venturi-area-ratio-02

Procedimento indipendente: ρv² ha dimensione M/(LT²); r²−1 è puro. La differenza statica è una pressione in kPa. Nessun calcolo numerico autonomo necessario per il solo riconoscimento dimensionale.

Alternative e distrattori: m/s velocità, m²/s² energia per massa, N forza e 1 puro. Serve la densità per ottenere pressione.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `kPa`. Modalità `AI_CONCEPTUAL`; ambito `NO_STUDENT_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `dba33f116e3456b8b327cbacee13594a0e5165ee92d109b43bbf227a33676cdf`; candidato `6224dd469496dc5c7d0355799e4c925d5fe7def05b3870f2cc8eb43ae1990963`; firma `507b8848da6ea77cb191288d14fbbf341fe83df3317d99b13719ea7dc9679c61`.

## AR-u3-venturi-area-ratio-03

Procedimento indipendente: Con A₂<A₁ e flusso comune, v₂>v₁. L’aumento ρ(v₂²−v₁²)/2 è compensato dalla diminuzione di p statica: p+ρv²/2 resta costante. Nel modello senza perdite non è calore dissipato.

Alternative e distrattori: Attrito escluso; portata non scompare; quota uguale e velocità maggiore; somma totale non si annulla.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `Il contributo cinetico cresce e la somma di Bernoulli si conserva`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `df180301dbd7407f274cb7ef73ac2193781567965f42f4235d43d9e8e132a8d5`; candidato `b30a32644379301f18165e7ffcece8c94ed810eb6f728c41e7ff578d3ca0b7bc`; firma `12b1af0e47ff04d253733a2efe37112e04f163f62a9cb2e69e89645fdf6547b1`.

## AR-u3-venturi-area-ratio-04

Procedimento indipendente: v₁=2 m/s fisso, r da 2 a 3 dà v₂ da 4 a 6 m/s. Differenze dei quadrati 12 e 32 m²/s²; Δp da 6 a 16 kPa.

Alternative e distrattori: 9 scala r linearmente; 27/2 usa r² senza il meno uno; 6 ignora il cambio; 4 applica effetto inverso.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `Da6 a16 kPa`. Modalità `AI_CONCEPTUAL`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `52685c5146170783c16fd885a16e09c1e16a8595c5ecffa4d3785ec55a43115d`; candidato `2ce56a81f1205fe1ff56ca19405a68817b76a767f399201a69efbc29ee9e14b2`; firma `d94f7cb754a02c1d1927cf475bc791c52064dcbb43d01bf01786126aa4a277a2`.

## AR-u3-venturi-area-ratio-05

Procedimento indipendente: r²=1+2Δp/(ρv₁²)=1+12000/4000=4. Rami ±2; rapporto di aree positivo e maggiore di uno seleziona r=2.

Alternative e distrattori: −2 non rapporto di aree positive; 4 è r²; senza uno si perde contributo cinetico iniziale.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `ebc5164763c70a877c3f7872f33d5c4af1556b9bffe1157225bea6a74064ae27`; candidato `7d068f2ae6f7e607d3d4f5c61677897fb688e84ffb4dfe048c3594a8bf603135`; firma `de6430f42451a70029735cd4869cace7453108855e2303f0ade9c269b3154d67`.

## AR-u3-venturi-area-ratio-06

Procedimento indipendente: v₁²=2Δp/[ρ(r²−1)]=12000/(1000·3)=4 m²/s². v₁=2 m/s nel verso assegnato; v₂=4 m/s è una diversa grandezza.

Alternative e distrattori: 4 m/s è v₂; −2 viola verso; r>1 e Δp>0 garantiscono radicando positivo.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `f0e29a66b73dbf051a5b4ae614f1942306a9faa281b4ffcbf6b86daf24349070`; candidato `7554d2a8967bd97c442f71ffd7071b554d94b5959fe43c58a4cdd38c43e1548a`; firma `dbff724293ffed44275ccdf4edcfa5db3568949d1f8c4a21a9c5bd168d074ad1`.

## AR-u3-venturi-area-ratio-07

Procedimento indipendente: r=2 fisso, v₁ da 2 a 4 m/s: Δp da 6 a 24 kPa, rapporto 4. Con p₂=100, p₁ da 106 a 124 kPa.

Alternative e distrattori: 2 linearità in velocità, 1/4 reciproco quadratico, 1/2 reciproco lineare, 1 invarianza falsa.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `4`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `79ac7492d1a3ab68cb58e97937ed52a4fe2ee7e88a2e6d27061fb0ffc1fc8c55`; candidato `a87c9685faebbc0239109ffbdb9138ae2f63b47d5f75845859ea687ec4ed1cd6`; firma `ca4c3f2370da4e3169dfb688ccf1428458ae813fab439e37380b18f5de063f77`.

## AR-u3-venturi-area-ratio-08

Procedimento indipendente: Corretto 6 kPa, proposta 12: scarto +6 kPa. Dimenticare il fattore 1/2 nella pressione produrrebbe la proposta.

Alternative e distrattori: −6 ordine invertito; 12 proposta; 0 accetta; 3 metà scarto. La differenza di pressioni non somma le energie cinetiche.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `6`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `de171b35617c578bff201b52fbc95f8ab2e9cbb1e443b4fdbfb78f4b7e997976`; candidato `11f5793d444d9bd433600ac75f3f782fe08a71a4fb6c7902d5c9742ae4fdff91`; firma `904735fe0c983975e9e20cc26a1f503b50d93e48842319ef7b3ec27a5306a2d6`.

## AR-u3-venturi-area-ratio-09

Procedimento indipendente: r²−1=2Δp/(ρv₁²); aggiungere uno e prendere radice positiva dà r=√(1+2Δp/(ρv₁²))>1. L’argomento è puro e maggiore di uno.

Alternative e distrattori: Senza uno manca velocità iniziale; senza radice si dà r²; meno dentro radice può essere non reale; radice negativa non r>1.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `r = √(1 + 2Δp/(ρv₁²))`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `84d19b2a3707fc34c244b5fc725eac4e568083961af973e427f363834a31fa33`; candidato `07277535bf836cbde023dccda551e823d9bfe5adbfc10dc2c7b428013f37adff`; firma `66d01d3c881f57090c0702abaf923e113ada6d3f00b7c87f44ae3128b6ef4bc1`.

## AR-u3-venturi-area-ratio-10

Procedimento indipendente: D_A=r_A²−1 e D_B=(κ₁r_A)²−1, entrambi positivi. La velocità scala con κ₂ ma la sua energia con κ₂²: rapporto κ₂²D_B/D_A, non κ₁²κ₂².

Alternative e distrattori: κ₁²κ₂² scalerebbe anche il termine uno, κ₂ senza quadrato errato, reciproco scambia, κ₁/κ₂ non segue dalla differenza.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `κ₂² D_B / D_A`. Modalità `AI_CONCEPTUAL`; ambito `SYMBOLIC_MANUAL_DERIVATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `86791f26f21098d98a64375fba2de87afe36f1f14bd991d3a039645607f25f89`; candidato `86db52ac428583c1f32d590c8646db36df554a35f9320afef72af5a3acc690c7`; firma `df158e380e76138e04eb4e646780c644f66f813fc597c3c3c2e9c234c88c74fd`.

## AR-u3-venturi-area-ratio-11

Procedimento indipendente: A: (v₁²/2)(r²−1)=2·3=6 kPa. B: 8·8=64 kPa, rapporto 64/6=32/3.

Alternative e distrattori: 3/32 reciproco; 4 sola velocità, 8/3 sola geometria, 64 Δp_B numerica.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `32/3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `ac7163866f3ed5fc20eb04296dd676851179d6f265ccaf022ed735a42bbc9ee8`; candidato `4a83d2d6a46b142f71be0bd6b13398a3c753ee959c419973a4177927e7ebcee3`; firma `0108a51a6af2271e6f5759806ee131ce8667109d84ea2eca1253093002263576`.

## AR-u3-venturi-area-ratio-12

Procedimento indipendente: Media (6+64)/2=35 kPa. Ingressi medi r=5/2,v₁=3 m/s danno (9/2)(21/4)=189/8 kPa; differenza 35−189/8=91/8 kPa.

Alternative e distrattori: 70 somma; 35/2 metà aggiuntiva; 189/8 ingressi medi; 58 differenza.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `35`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `48fdd243eefbb91b70e9b162cf86bff3f18f3080ccdbf6584033e5d8d3acbf19`; candidato `2adc9a49e795fb6d0f468819d9553c8f51ee45d1dcdf088dd92aa28fbda4f11c`; firma `95c397ff1d312d39254175fec7679e3c923b68bdf7b747887bc2b93d926858cb`.

## AR-u3-venturi-area-ratio-13

Procedimento indipendente: Target (32/3)·6=64 kPa. Con r=3, energia iniziale per volume richiesta 8 kPa; v₁,B²=16→v₁,B=4 m/s. Rapporto a 2 uguale 2.

Alternative e distrattori: 1/2 reciproco; 4 rapporto dei quadrati; 32/3 pressione bersaglio; 8/3 solo geometria.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `4a0e8a8855ce3b3e1b746656fc3ffbdafc8e5974643ae2823f11cdf8c35192ab`; candidato `b995c88304ac9f57ce443ac38a729d490d38ca9d73f24325bceb969ed2861e21`; firma `99aed0c3afb22a35f3b6fc4b7bd32942648a6cb73c4b17ea9f68a8b30010d111`.

## AR-u3-venturi-area-ratio-14

Procedimento indipendente: q=18/(6 kPa)=3 kPa⁻¹. S_B=192→Δp_B=64 kPa; v₁=4 m/s dà contributo 8 kPa, quindi r_B²=1+64/8=9 e r_B=3.

Alternative e distrattori: S=192 presa come kPa dà r²=1+192/8=25 e r=5. Corretto p₁=164,p₂=100 kPa assoluti.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `7459169bf2d12e65c9bc56566cb99c162d0b5bacee24b4757cb6d140c69964e8`; candidato `91cd537c973463b72839d0e94ca69c7db1649d0f44de48a57d3680b7ce0b60c7`; firma `7730529b8433080d178ffea8ac5bef4551519142b1f372d33cf3c6007b4fa610`.

## AR-u3-venturi-area-ratio-15

Procedimento indipendente: Riferimenti 6,64 kPa con letture 13,129: q=116/58=2 kPa⁻¹, offset 1. S_C=33→16 kPa; v₁=2→r_C²=1+16/2=9, r_C=3.

Alternative e distrattori: r=2,4,5 a v₁=2 danno letture 13,61,97. r=1 limite senza restringimento, fuori dominio, non risposta.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `3`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `9a476de7619bc32f9a903c89cd4e03540a44fccf15552ab9bd734130b6639470`; candidato `c97c952521a8d9812e5e687242329b0337c8eed1462c90de405dddaa22432801`; firma `0192ee879be038de768888ff894ad5158c2bdf8063a5d914bca2b2fcc2eedf40`.

## AR-u3-venturi-area-ratio-16

Procedimento indipendente: Vincolo r=(1 s/m)v₁. x=v₁/(1 m/s)>1; dato 6 kPa porta x⁴−x²−12=0. Con u=x²: (u−4)(u+3)=0. u=−3 non genera x reali; u=4 dà x=±2, ma solo x=2 soddisfa v₁>0 e r>1.

Alternative e distrattori: −2 reale algebrico ma r negativo; u=−3 non produce x reale. Il ramo x=2 ricostruisce r=2 e Δp=6 kPa. Il testo finale esplicita u=−3, non l’espressione u−3.

Ipotesi e dominio: Venturi orizzontale ideale stazionario, acqua ρ=1000 kg/m³, profili uniformi, stessa linea di corrente; nessuna macchina, ramificazione o perdita. r=A₁/A₂>1 è rapporto di aree, v₁>0. Il candidato fissa p₂=100 kPa assoluti nella sezione stretta, non p₁: p₁=p₂+Δp>100 e non si impone un falso limite Δp<100. Acqua liquida lungo il condotto. Vincoli fra prove, con r_B>1.

Esito esatto: `2`. Modalità `EXACT_ORACLE`; ambito `EXACT_MANUAL_CALCULATION`. Le risposte concettuali conservano una specifica prova fisica; nessuna promozione artificiale a oracolo numerico.

Fonte `24a829793931dc6f3819dd2ec08b5c05aa5a9084cb53ddd47f12661ef22a2201`; candidato `0638fce8fd1084c1fe9eaac34cfedfed16774b9d69e0be299aa3667354c55e91`; firma `f91cd8369e5ef28f592468eb8f0ae4e5af167f8bead7dc1a987f5cfa6bc64f8f`.

## Controprove e contratto

24 controprove per lotto: 16 chiavi errate con candidateSha256, binding e tutte le guardie d’edizione rinnovate in memoria, respinte dagli oracoli o dalla prova concettuale separata. Sono respinti anche fonte falsa con guardie rinnovate, numero corretto con unità sbagliata, prova fisica falsa con chiave corretta, pacchetti vuoto/parziale/duplicato e cambiamenti dei byte SVG incorporati o locali. Per la spiegazione falsa resta esplicito il confine della lettura individuale congelata: il rifiuto non viene attribuito a un ricalcolo automatico del linguaggio naturale.

assert_record_identity verifica sia report fresh sia report salvati contro pacchetti e binding reali. Sono usati soltanto EXACT_ORACLE e AI_CONCEPTUAL. I radicali numerici passano da un AST limitato ad aritmetica razionale e radici di interi: nessun eval o sympify dell’input. Sono provati frazioni, somme radicali, reciproci e rigetto di chiamate arbitrarie, divisioni per zero e potenze enormi.

Il test comune genera inoltre 35 configurazioni per ciascuna di cinque proprietà fisiche, 175 in totale: somma dei costi gravitazionale/cinetico, continuità e totale di Bernoulli nel Venturi, ramo positivo e inverse di Torricelli, unità e area nell’efflusso, complementarità e limite geometrico della gittata. Le letture individuali non vengono sostituite da queste configurazioni.

Importazione, browser e conteggi globali restano dell’integratore. Non è stata eseguita una prova con studenti o una revisione umana.
