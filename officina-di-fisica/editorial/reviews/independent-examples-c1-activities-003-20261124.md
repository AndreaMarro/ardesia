# Revisione indipendente AI — otto esempi C1 e due nuove edizioni candidate

Data: 24 novembre 2026. Revisore `/root/review_corpus_increment`, distinto dagli autori degli originali e dall'agente root autore delle due nuove candidate. Il revisore ha letto tutti i blocchi, svolto i calcoli e controllato le figure, senza modificare alcun originale o candidato. Ha scritto soltanto oracolo e rapporti propri. **Nessuna approvazione umana, nessuna pubblicazione.**

Esiti da non confondere:

- **Originali pubblicati:** 6 PASS, 2 FAIL di edizione, C1-E003 e C1-E008. Il rapporto originale conserva questi FAIL.
- **Nuove edizioni candidate:** soltanto C1-E003 v2 e C1-E008 v2, scritte dal root, sono state successivamente lette e verificate: entrambe PASS come DRAFT.
- **Rapporto misto:** sei edizioni originali valide più due nuove DRAFT valide, non otto originali pubblicati approvati. I due risultati DRAFT hanno `failedPublishedEdition=true` e il dettaglio completo `publishedEditionReview.ok=false` dell'originale.
- `humanApproval=NOT_RUN` per ogni record. `publicationAction=NONE` per i sei invariati e `DRAFT` per le due nuove candidate. `originalEditionRetained=true` significa storia conservata, non approvazione dell'originale con finding.

Tutti gli esempi richiedono calcoli: nessuno è classificato `NO_STUDENT_CALCULATION`.

## Identità controllate

Sorgente immutabile: `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/C1.json`, SHA-256 file `0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf`. Figure originali lette dallo stesso commit e confrontate byte per byte con i file locali: tutte identiche.

| Originale | Versione | Digest JSON canonico del record |
|---|---|---|
| C1-E001 | 1 | `4a2945c0e9e9c930c9f6b2c6e509ff3d603fb4aaae382c75c44136becd9c2ded` |
| C1-E002 | 1 | `0c1aafe108d600ccae876e08906feb6f693f0304eaaa2034844d2cc49643b355` |
| C1-E003 | 1 | `b805a1d40da26cf69788d78379dd7bc98b8a600774718ef6ba6d790106c94be6` |
| C1-E004 | 1 | `92f89622f3c12353139b0c1a1c7bbb35b8641364710517a275a63b0fde8f5510` |
| C1-E005 | 2 | `f4c7f9d8231db871695faeaf9e1e031f83de6b0e8003aa3b4cc0825b0816932f` |
| C1-E006 | 1 | `f012341e646e53c4771bd246cc75e608ca560de73e28c6c1a26967ec7b13e296` |
| C1-E007 | 1 | `1069956d28e3b52d934c0cb266d43007b10d69fdc9098fc82523880e369e5f0b` |
| C1-E008 | 1 | `ede583084357d9e47f95bd794609fa024ae8db6263ebf387da321c6fcbd8c8bd` |

Nuove candidate: `editorial/batches/examples-c1-revisions-016.json` e relativo binding, due record `kind=example`, ID esistenti, `version=2/baseVersion=1`. Hash di originale, candidato, fonte e SVG ricontrollati prima delle firme indipendenti.

| Artefatto della nuova edizione | Hash |
|---|---|
| Pacchetto, digest JSON canonico | `e3197de2575ae2846dbb30120ff6c1fc833b0d36c42cd0afc9ceafe589c27409` |
| Binding, digest JSON canonico | `65dcfe4179dde583b2179c4ca4f42a6ee1fd1d62ac30b59185c3deca860a8845` |
| Pacchetto, SHA-256 file | `5cb0d1552e8319b1a6b402b06cff6a63b3f56d42eabebcbcbdbcc4749beb89fd` |
| Binding, SHA-256 file | `5f4ff97e89b611d523176ead22708901347fe9e7aceae247e11a33ab0b3a7a96` |
| C1-E003 v2, digest candidato | `2ec974dc062e9ce2e30684333973fbb18ac0700356e97698debd19de8899eab4` |
| C1-E008 v2, digest candidato | `f89563def731fed5c1f10909143977c51290c58b718057618a289994bb0fffd7` |
| C1-E003 v2, firma indipendente | `71e27f74832fa84bb6a8c55ecc4df6a4e5240aad2843c17e73533e3988e871d3` |
| C1-E008 v2, firma indipendente | `0e6d83c85c86288c70e92e5207b3880c954a651fbca3004e31be47c6285c0a1b` |

Oracolo `examples_c1_activity_verifier.py`, SHA-256 `bae5db70cdd10dabba4ad3641b0d0b6e9e02943a4b4d703b9b84e39d3ac69206`. Rapporto originali `examples-c1-activities-003-originals.json`, SHA-256 `1a42d102e05d492b439181300521da619e8d2211ec9fd9a67f153c5e3a7053d3`. Rapporto misto `examples-c1-activities-003.json`, SHA-256 `2db32f44e2b696fff56c6a7be7ce5951da8c0f0ffa462c54ab0e83462fdbfc31`.

## C1-E001 — massa del campione — originale PASS

Calcolo indipendente con Fraction/Pint: `1,05=21/20 g/cm³`, `8 mL=8 cm³`, dunque massa `42/5 g=8,4 g=21/2500 kg=8,4×10⁻³ kg`. Procedura manuale: `1×8 + 0,05×8=8+0,4`; poi divisione per mille. Massa del liquido, non della provetta. Densità uniforme dichiarata; volume iniziale è già quello del contenuto. Cancellazione delle unità corretta e controllo di scala con circa 8 g appropriato. Nessuna figura o scelta multipla in questo record.

## C1-E002 — area rettangolare — originale PASS

`25×12=25×(10+2)=250+50=300 mm²`. Ogni millimetro vale `10⁻³ m`, quindi il quadrato vale `10⁻⁶ m²` e l'area `3×10⁻⁴ m²=3 cm²`. Confronto con il quadrato di lato 2 cm: 4 cm², dunque scala plausibile. Lati perpendicolari e conversione di entrambe le lunghezze espliciti.

Figura C1-scala: quadrato 156×156 px con dieci suddivisioni per lato e cento celle; ogni riga contiene dieci celle, non dieci in totale. Relazione `1cm²=100mm²` corretta. SHA-256 `6c59566179802d99d4bc34c78f1a5074d2c3c1f0fd273c850631d0992ec19bad`.

## C1-E003 — modulo e direzione — originale FAIL; nuova v2 DRAFT PASS

Originale: componenti `(30,40)m`, norma `√(900+1600)=50m`, distanza camminata `30+40=70m`; direzione esatta `atan(4/3)` a nord dell'est corretta, nel primo quadrante. Il decimale 53,1° è numericamente corretto, **non è qui segnalato come errore trigonometrico**. Il finding riguarda la chiusura della catena manuale: l'originale assume l'approssimazione di un'inversa non notevole senza un percorso adeguato al livello del record. Il revisore non lo ha silenziosamente certificato come calculator-free né riscritto.

È stato anche controllato il valore numerico mediante limiti razionali per `atan(1/7)` e per π, usando `atan(4/3)=π/4+atan(1/7)`. Questo controllo del revisore non sostituisce una spiegazione didattica assente nell'edizione originale: richiederebbe prerequisiti ulteriori e non è stato inserito nel candidato dal revisore.

Figura originale C1-corsie: tratti 99 px/30m e 132 px/40m, scala comune 3,3 px/m; est/nord ortogonali e diagonale coerente. SHA-256 `994baad429211ba07fb5ef33a83d036fa667e79e251dea36e1fe131cba1fbeb8`.

Nuova v2, scritta dal root e letta separatamente: la richiesta è esplicitamente una direzione mediante rapporti esatti, senza gradi decimali. `cosθ=30/50=3/5`, `sinθ=40/50=4/5`, con `0°<θ<90°`, identificano una direzione unica; `tanθ=4/3` e l'eventuale nome simbolico `atan(4/3)` non devono essere valutati. Radice 50 riconoscibile con il triangolo 3–4–5 ingrandito di dieci. Nessuna falsa equivalenza fra cammino 70 e norma 50.

Nuova figura `example-corsie-exact.svg`: tre pannelli, cateti 180 e 240 px, diagonale 300 px, scala comune 6 px/m; angolo presso il vertice iniziale con seno/coseno coerenti. SHA-256 `b06a9573a55f27f2d1a1ba2e9a909fdcc215d72bf6335a9bce0b6e6c9e2a29ca`. La nuova PASS è solo DRAFT; la v1 pubblicata resta FAIL nel rapporto e nella sua copia annidata.

## C1-E004 — componenti della trazione — originale PASS

Forza 20 N a 30° rispetto a +x: `Fx=20×√3/2=10√3 N`, `Fy=20×1/2=10N`. Primo quadrante, componenti positive. Ricomposizione `√(300+100)N=20N`. Radicale esatto già presente nell'originale: nessuna necessità di sostituirlo con un decimale per rispondere.

L'approssimazione 17,3 N è marcata correttamente con `≈`; controllata manualmente tramite `(69/4)²<300<(347/20)²`, quindi `17,25<10√3<17,35`, intervallo che arrotonda a 17,3. Calcoli interi dei limiti: `69²=4761<4800`, `347²=120409>120000`.

Figura C1-tiro30: asse orizzontale e verticale ortogonali, freccia con 214,8 px orizzontali e 124 verticali, coerente con 30° entro la precisione grafica. Costruzioni tratteggiate e segni coerenti. SHA-256 `1b9ea2f613745a10509b8eea0b943e644f853043859f64b2abb28430338c6cf8`.

## C1-E005 — sosta e ritorno — originale v2 PASS

Il grafico completo a segmenti specifica il percorso, non soltanto campioni isolati: incrementi `+6,0,−4m`. Distanza `6+0+4=10m`; spostamento `2−0=2m`; tempo totale 6 s comprende la sosta. Velocità media `2/6=1/3m/s`, rapidità `10/6=5/3m/s`. Le approssimazioni 0,33 e circa 1,67 sono dichiarate e coerenti con i decimali ripetuti, non sostituiscono le frazioni esatte.

Figura C1-posizione: tempi 0/2/4/6 a passi di 128 px; quote 0/6/6/2 coerenti con 18,5 px/m. SHA-256 `60f8e433938fb419332373efd343b8986057bea63c44691770fa8d40454e6d89`.

## C1-E006 — area sotto velocità lineare — originale PASS

Accelerazioni negli interni delle due fasi: `(6−0)/3=+2m/s²`, `(0−6)/3=−2m/s²`. Velocità sempre non negativa; due aree triangolari `3s×6m/s÷2=9m` ciascuna, totale 18 m. Integrale indipendente di `v₁=2t` su 0–3 e `v₂=12−2t` su 3–6 restituisce 9+9. Media `18/6=3m/s`. All'istante angoloso di raccordo non si pretende un'unica accelerazione: la richiesta riguarda ciascuna fase.

Figura C1-velocita: picco a 3 s/6 m/s, base 6 s e area non negativa. Il basamento del tratto differisce dall'asse di un pixel, entro lo spessore del disegno; le coordinate etichettate restano quelle dell'enunciato. SHA-256 `0983a43aa7f3bb6aeb9493172a1bdc7361ef602887b9bb29c0e4db4e02776d3a`.

## C1-E007 — lancio orizzontale — originale PASS

`h=1,25m=5/4m`, `g=10m/s²`. Moto verticale con velocità iniziale nulla: `t²=2h/g=(5/2)/10=1/4s²`. Radice futura positiva `t=1/2s`; moto orizzontale uniforme `Δx=(2m/s)(1/2s)=1m`. La radice negativa non indica l'arrivo futuro. A stessa altezza raddoppiare vx raddoppia la gittata senza cambiare il tempo. Ipotesi: aria trascurata, g costante, biglia come punto materiale.

Figura C1-bordo: schema parabolico qualitativo con tangente iniziale orizzontale; il punto di controllo è al mezzo delle ascisse, dando ascissa lineare e caduta quadratica nel parametro. **Non dichiara una scala metrica comune:** il revisore non usa il disegno per misurare gittata o angoli. SHA-256 `97e21bb158e0b3cb3bfa9eebc52f03883fc70d40d2a2c13bc04bd9b1a42e0771`.

## C1-E008 — moto circolare uniforme — originale FAIL; nuova v2 DRAFT PASS

Parametrizzazione indipendente `x=r cos(2πt/T), y=r sin(2πt/T)`; derivate e norme danno `v=2πr/T`, `ac=4π²r/T²`, con velocità tangente e accelerazione radiale perpendicolare. Per `r=1/5m,T=2s`: **`v=π/5 m/s`, `ac=π²/5 m/s²`**. A raggio fisso il periodo doppio riduce l'accelerazione a un quarto.

L'originale presenta `=0,628` e `=1,97` come uguaglianze esatte, senza segni di approssimazione e senza chiudere con le espressioni esatte. Sono numeri ragionevoli come arrotondamenti, ma non identità: anche usando la velocità già arrotondata si trova `0,628²/0,20=1,97192`, non 1,97 esatto. Il finding non afferma che la scala fisica sia sbagliata: riguarda notazione e catena esatta/manuale dell'edizione originale. Non è stata trasformata automaticamente in PASS.

Figura originale C1-circolo: punto destro, velocità verticale tangente e accelerazione orizzontale verso il centro; direzioni corrette. Grandezze con unità diverse: non si confrontano i moduli mediante le lunghezze grafiche. SHA-256 `158b6a3f5b0614ce90034b870182536612b95171a10fc9cb51ee6d7d749341cf`.

Nuova v2, scritta dal root e letta separatamente: π rimane simbolico; `C=2π/5m`, `v=(2π/5)/2=π/5m/s`; `v²=π²/25m²/s²`, divisione per r=1/5m moltiplica per cinque, quindi `ac=π²/5m/s²`. Controllo indipendente `ω=πs⁻¹`, `v=ωr`, `ac=ω²r`; unità e rapporto di un quarto corretti. Nessun arrotondamento entra nella seconda legge.

Nuova figura `example-circular-exact.svg`: tre cerchi di raggio 80 px, punto destro e frecce tangente/radiale, angolo retto corretto. Dichiara esplicitamente che frecce di unità diverse indicano direzioni e non una scala comune dei moduli. SHA-256 `42efc0b54ebd1492019539433c2539578265f032bfcbce5d9aa5b9048350bea7`. La nuova PASS è solo DRAFT; il FAIL dell'originale resta conservato.

## Esecuzioni e limiti

Oracolo indipendente con SymPy, Pint e Fraction. Originali: **6/8 PASS, E003/E008 FAIL**; rapporto misto dopo lettura delle candidate: **8 risultati validi, di cui 2 nuove DRAFT**, con i due FAIL storici annidati e non rimossi. Sono stati controllati esattamente anche i limiti razionali dell'approssimazione di E004.

Controprove in memoria: formula candidata errata e binding rigenerato rifiutati per entrambe le nuove edizioni; baseVersion errata rifiutata esplicitamente; hash sorgente azzerato e originale E001 alterato rifiutati. Pacchetto revisione vuoto/parziale/duplicato rifiutato. Nuovo asset mancante rifiutato; mancanza dell'asset storico impedisce di attestare `originalEditionRetained` anche se la nuova figura è presente. Nel rapporto misto è stato verificato che ogni DRAFT conservi `publishedEditionReview.ok=false`, senza approvazione umana.

Questa revisione non attesta importazione canonica delle due nuove versioni, rendering browser, CI, merge o pubblicazione. Queste prove restano all'integratore. Nessuna calibrazione empirica con studenti o certificazione di accessibilità. Le firme valgono per le esatte edizioni indicate, non per modifiche successive. **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / NO_PUBLICATION**.
