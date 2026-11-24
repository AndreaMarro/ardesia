# Revisione indipendente vertical-maximum-023

Revisore AI separato dall'autore B. Letti individualmente tutti i 16 enunciati, opzioni presenti, blocchi, hint/feedback e originali Git; letto l'intero SVG, confrontata la geometria con il moto. Nessun import da authoring nell'oracolo; nessuna modifica a pacchetti, binding o asset. Autore `b0ee7436`, correzione finale dell'etichetta SVG `6277558d1986897f676ccd4f02ca94cf7e30d408` riletta prima del freeze01.

**Esito:16/16 PASS_AI, nessun finding aperto. DRAFT / HUMAN_APPROVAL_NOT_RUN.** Non è pubblicazione né approvazione umana o calibrazione empirica didattica. H è sempre aumento di quota rispetto al lancio, non quota assoluta dell'apice.

Provenienza fissata: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`; SHA-256 del file `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Verificata ogni corrispondenza `AR-u2-vertical-maximum-NN` → `u2-vertical-maximum-NN` sull'effettivo Git, con digest sorgente/candidato e provenienza; firme/report conservano gli hash individuali. Valori g assegnati esatti del modello; nessuna gravità terrestre implicita.

## Derivazione indipendente

Asse verso l'alto, velocità iniziale positiva v₀, campo uniforme costante e aria assente. Integrare `a_y=−g` dà `u=v₀−gt` e guadagno `z=v₀t−gt²/2`. La velocità si annulla al tempo futuro T=v₀/g. L'integrale fino a T, anche area triangolare positiva sotto u–t, è `H=v₀²/(2g)`. La seconda derivata resta −g<0: massimo della quota, non equilibrio o assenza di gravità. Controcontrollo energetico indipendente `m g H=(1/2)m v₀²`. Pint/Fraction verifica dimensioni e tarature; SymPy controlla inverse, rapporti e curve.

## Controlli individuali

| ID finale | Calcolo manuale e risultato | Opzioni, condizioni e significato |
|---|---|---|
| 01 | v₀=2,g=2: T=1s, area triangolo `(1/2)×2×1=1 m`. | Velocità all'apice zero, accelerazione −2m/s² ancora presente. H è incremento dal lancio;2m sarebbe area del rettangolo, non del triangolo. Figura sotto. |
| 02 | `(L²/T²)/(L/T²)=L`; unica unità corretta **m**. | m/s è velocità,s tempo,m/s² campo,m² area. Differenza di quote mantiene dimensione di lunghezza anche cambiando origine. |
| 03 | All'apice `0=v₀²−2gH`, dunque **H=v₀²/(2g)**. | v₀/g è tempo;v₀²/g doppio risultato;2v₀²/g quadruplo;g/(2v₀²) inverso di lunghezza. Nessuna opzione universalmente equivalente. |
| 04 | Stesso g=2: `H₁=4/4=1m`, `H₂=16/4=4m`; **quadruplica1→4m**. | Raddoppia,resta,dimezza,8m sono diversi dal risultato. Tempo e velocità media di salita raddoppiano entrambi. Prove separate e riferimenti di quota individuali espliciti. |
| 05 | `v₀²=2gH=4m²/s²`, radice positiva **2m/s**. | Componente iniziale negativa avrebbe un apice nel passato e non il guadagno futuro richiesto. Nessuna radice decimale necessaria. |
| 06 | `g=v₀²/(2H)=4/2=2m/s²`. | g resta nonzero anche all'apice. Distinti modulo del campo e componente negativa di accelerazione; nessun errore da u=0→g=0. |
| 07 | H₁=1m,H₂=`4/8=1/2m`; rapporto **1/2**. | 2 inverte effetto del campo,1 ignora variazione,1/4 introduce quadrato su g,−1/2 contraddice positività dei guadagni. |
| 08 | H corretto1m; proposto2m meno1m = **+1m**. | −1 inverte sottrazione;0,+2,+3 non sono lo scarto. Rettangolo con velocità iniziale costante è errato; quota assoluta non può essere introdotta perché si chiede guadagno. |
| 09 | `v₀²=2gH`, ramo positivo: **v₀=sqrt(2gH)**. | 2gH è quadrato della rapidità;negativo non è il lancio positivo richiesto;√gH perde2;√(2H/g) è tempo di salita associato, non rapidità iniziale. |
| 10 | Rapporto **κ₁²/κ₂**: quadrato sul fattore velocità e inversa prima potenza del campo. | κ₁/κ₂ è rapporto tempi;prodotti col campo sbagliano dipendenza;κ₂/κ₁² inverte rapporto. Sono leggi distinte, anche se alcuni fattori particolari danno coincidenze. |
| 11 | (v₀,g)=(2,2)→1m e(4,4)→2m; rapporto **2**. | Entrambi i tempi all'apice sono1s ma seconda velocità media di salita doppia: durata uguale non impone spostamento uguale. Numero2 del nuovo H e rapporto2 hanno dimensioni differenti. |
| 12 | Media uscite `(1+2)/2=3/2 m`. | 1 e2 ripetono prove,3 è somma,9/4 usa v₀ medio3 con solo g iniziale2. Medie corrette v₀=3,g=3 danno qui9/6=3/2 per proporzionalità. Non generale: con(2,2),(4,2) media uscite5/2 diversa da9/4 su ingressi medi. |
| 13 | Richiesta H₂/H₁=2 e v₀₂/v₀₁=2: `2=4/(g₂/g₁)`, rapporto **2**. | Nuovo g=4 dà H₂=2m. Campo invariato darebbe4m;campo quadruplo lascerebbe1m. Costante dentro ciascuna prova. |
| 14 | H riferimento1m e S3: c=3m⁻¹. S6→H2m; `v₀²=2×4×2=16`, **v₀=4m/s**. | Conteggi puri, guadagno inverso di lunghezza, offset nullo; rimuovere guadagno prima della radice fisica. Ricostruisce H2m e S6. |
| 15 | H riferimenti1,2m e S3,5: c=2m⁻¹,d=1. S9→H4m; `sqrt(2×2×4)=4m/s`. | 2m/s è riferimento;3m/s darebbe H9/4m e S11/2;6 e8m/s sovrastimano. Offset non eliminabile con rapporto delle sole letture. |
| 16 | v₀=cg,c=1s: `H=c²g/2`, `g=2H/c²=2m/s²`. Poi v₀=2m/s,T=1s. | −2 escluso da g>0;1,4,8m/s² darebbero H1/2,2,4m rispettivamente. Vincolo seleziona dati iniziali, non campo variabile dentro la salita. |

## Figura e correzione verificata

`vertical-maximum-progressive.svg` SHA-256 finale `4d766a2432a4999e4d26d060adf48c3df752e77907b10b357937ede539288ae2`. Byte locali, upload e riferimento protetto `/asset/hash` controllati. XML completo letto; schema principale anche visionato in Quick Look. Non si rivendica da questo rendering un test browser completo delle schede a tre larghezze.

Schema spaziale: lancio y_svg340, apice220, differenza120px a120px/m →1m. u–t: base160px a160px/s →1s, altezza160px a80px/(m/s) →2m/s. Area triangolo in unità fisiche1m, non area in pixel confusa con quota. z–t: Bézier da(100,1210), controllo(180,1050), fine(260,1050). Con parametro q, t=q s e z=2q−q² m; identità dell'intera parabola verificata simbolicamente, tangente orizzontale all'apice, z(1)=1m. Scale del tempo e della quota dichiarate separatamente; curve mostrano solo la salita, non falsi tratti di moto dopo l'apice.

Finding di leggibilità: vecchia label «lancio:t=0», baseline348, attraversata dalla linea quota0 a340. Segnalato all'autore; **risolto in6277558d** cambiando solo baseline378. Diff riletto, nuovo rendering verificato; nessun cambiamento a curve, scale, fisica o testo. Firma01 congelata dopo la correzione; vecchio pacchetto rifiutato proprio per01. Nessun candidato scritto dal revisore.

## Hash e controprove

| Artefatto finale | SHA-256 canonico | SHA-256 byte |
|---|---|---|
| package vertical-maximum-023.json | `b258be1c88d94edcc7b820c41d82ecf23e3ab3ad09ec627a594b06e682ed0951` | `c3b0ea520ec744ded44d87cf6c6991524ccfc4cc267924079ab85530b45c6c0a` |
| bindings | `6808e24ef390fdb2131aacf794b61846b74d9cb1671c58eb427cc7bc7a25891e` | `be9f763096362220ea0bb555842ca2f67107b16852fc9eaeb95f06cc24f54c6d` |
| scientific report | `05f4a3aab2d9e9282ff4728cc0d2d3637cc239f89af29d481e39fea32db171d7` | `622786c2fbbaa1db517b55cc7efdd3ad0c34748188af78bcf3782981fc2d8cc7` |

Verificatore `vertical_maximum_verifier.py`, SHA-256 byte `37c07b07217441b5bd2527b26a7ca4eae8656c5b4de241f8e80e74e38f6444bf`.

Eseguiti indipendentemente:16/16 risultati; replay canonico identico;16 mutazioni separate dei testi con binding aggiornato → firmaFAIL; empty/subset/duplicate batch rifiutati; source hash ribindato rifiutato; vecchio asset/pacchetto01 rifiutato; asset locale assente fallisce proprio01; invarianti DRAFT/NOT_RUN rispettate. Le firme comprendono fonte e byte effettivi dell'asset, separatamente dall'assemblaggio autore. Nessuna pubblicazione, approvazione umana, calibrazione studenti o CI/browser completo attestati. Futuri report rigenerati devono dichiarare il contratto condiviso corrente senza attribuire a questa nota una lettura di contenuti modificati.


## Addendum: controprove riproducibili comuni

Eseguito `PYTHONDONTWRITEBYTECODE=1 ../../corpus-venv/bin/python -m unittest discover -s tests/corpus -p test_u2_orbits_freefall.py -v`: **7/7 test PASS (6,350 s)**. Il file copre i cinque lotti021/022/023/025/026, complessivamente80ID: ogni risposta mutata resta un'opzione esistente oppure un numero con unita invariata; si rigenerano binding e token soltanto in memoria e si richiede il FAIL dell'oracolo, senza errore di firma o chiave invalida. Tutte le80controprove PASS. Inoltre80mutazioni dei prompt con solo binding aggiornato vengono rifiutate dal freeze; test di insieme ID, sorgenti, figure, replay e DRAFT/NOT_RUN PASS. Due proprieta fisiche Hypothesis hanno `max_examples=50` ciascuna: comune riscalamento altezza/campo e risultante circolare radiale senza componente tangenziale.

La prima esecuzione aveva6/7PASS: il solo confronto di proprieta nel test generava1.0 con divisione Python contro Integer1; corretto nel test con `sp.Rational`, poi intero file GREEN. Non era un difetto di candidato o dell'oracolo e nessuna firma scientifica e stata cambiata per far passare la prova. SHA-256 del test finale: `c48b7153921ccc28265feb5f32720a940ec65a5ec19367296050a8f276ad15b2`. Nessun file candidato o fonte e stato modificato dai test.
