# Revisione indipendente circular-force-026

Revisore AI separato dall'autore A. Letti integralmente i 16 enunciati, opzioni, blocchi di soluzione e feedback/hint, sorgenti originali Git e figura. Nessun import autore nell'oracolo, nessuna modifica ai candidati. Snapshot autore504d4263, invariato in contenuto durante questa lettura.

**16/16 PASS_AI; nessun finding aperto. DRAFT / HUMAN_APPROVAL_NOT_RUN; nessuna pubblicazione.** Non è revisione umana o calibrazione su studenti.

Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`, SHA-256 file `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Controllata individualmente la mappa `AR-u2-circular-force-NN`→`u2-circular-force-NN` contro gli effettivi byte Git, digest sorgente/candidato e provenienza. Firme indipendenti comprendono record completo, fonte e asset, separatamente dall'assemblaggio autore.

## Modello e dimensioni

Riferimento inerziale, massa costante positiva, rapidità costante positiva, circonferenza fissa di raggio dimensionale `r₀=2 m` in ciascuna prova. Seconda derivata di `R=(r cosωt,r sinωt)` dà `a=−ω²R` e `A=v²/r`. Newton sulla somma delle forze reali dà `F=mA=mv²/r₀`, vettore radiale verso il centro e perpendicolare alla velocità; risultante tangenziale zero. Non si aggiunge una forza «centripeta» alla somma già fatta. Il testo chiede la risultante, non quali interazioni fisiche la producano.

Il raggio resta esplicitamente una lunghezza nelle formule, evitando ambiguità fra massa m e unità metro. Dimensioni: `(kg)(m²/s²)/m=N`. SymPy deriva il modello, risolve inverse, tarature e cubo; Pint/Fraction controlla esattamente unità, raggio e coefficiente del vincolo.

## Lettura per ID

|ID|Conto manuale e risultato|Distrattori e significato|
|---|---|---|
|01|A=2²/2=2m/s²;F=2×2=**4N**.|Risultante delle forze reali, nessuna interazione aggiuntiva. Figura sotto.|
|02|Massa×accelerazione=kg·m/s²=**N**.|m,m/s²,kg,s non sono unità di forza;direzione radiale non cambia unità.|
|03|A=v²/r₀ e Newton: **F=mv²/r₀**.|mv² energia,mv²/(2r₀) metà forza,mv/r₀ massa/tempo,mv²r₀ dimensione ML³/T². r₀ è2metri, non un coefficiente puro2. Esempio numerico della figura coerente con legge generale.|
|04|Stessi v2,r₀2: A2;masse2,4kg→**da4 a8N**.|16 quadra massa,resta4 ignora variazione,2 inverte proporzionalità,zero confonde rapidità costante con accelerazione nulla. Si confrontano forze necessarie, non stessa forza disponibile imposta.|
|05|m=Fr₀/v²=4×2/4=**2kg**.|Fr₀ ha dimensione energia,diviso v² lascia massa;F/v² da solo avrebbe massa/lunghezza.|
|06|v²=Fr₀/m=4×2/2=4;radice positiva **2m/s**.|Modulo non determina senso di rotazione;radice negativa esclusa.|
|07|F₁=2×4/2=4N,F₂=2×16/2=16N;rapporto **4**.|8 cambia anche massa,2 legge lineare,1/4 reciproco,1 ignora cambio. Prove separate, uniformi al loro interno.|
|08|F corretto4N;proposto8 meno4=**+4N**.|+8 ripete proposta,−4 inverte sottrazione,0 accetta errore,+2 dimezza scarto. Il segno è dello scarto, non del modulo della forza.|
|09|Moltiplicare r₀,dividere v²: **m=Fr₀/v²**.|F/v² unità M/L;2Fr₀/v² raddoppia massa;Fr₀/v quantità di moto;v²/(Fr₀) inversa massa. Non aggiungere un altro2 perché r₀ è già2m.|
|10|Massa fattoreκ₁,rapidità fattoreκ₂: **κ₁κ₂²**.|κ₁κ₂ omette quadrato;κ₁²κ₂ lo applica alla massa;reciproco inverte prove;somma dà2 quando nessun ingresso cambia e rapporto deve essere1. Massa costante dentro ogni prova.|
|11|F₁=2×4/2=4N,F₂=4×16/2=32N;rapporto **8**.|Prodotto degli effetti2×4=8,numero puro distinto da32N.|
|12|Media uguali pesi `(4+32)/2=18N`.|36 somma,9 dimezza ancora,27/2 esce da medie ingressi3kg,3m/s,16 mescola prima massa e seconda rapidità. Pesi statistici,non tempi su archi.|
|13|F₂=8F₁=32N;m₂4kg→v₂²=32×2/4=16,v₂4m/s;rapporto **2**.|Massa fornisce già fattore2;restante4 nella forza deve venire da quadrato della rapidità. Radice positiva ricostruisce obiettivo.|
|14|Riferimento4N,S12→guadagno3N⁻¹. S96→F32N;m=32×2/16=**4kg**.|Conteggi puri,offset nullo;non interpretare96 come forza prima della taratura.|
|15|Riferimenti4,32N eS9,65:guadagno56/28=2N⁻¹,offset1. S17→F8N;m=8×2/4=**4kg**.|8 confonde forza con massa,2 riferimento;5kg→S21,3kg→S13. Offset da sottrarre prima dell'inversa.|
|16|m=cv,c=1kg·s/m:Fr₀=cv³⇒v³=8m³/s³⇒**v=2m/s**,m=2kg.|v1,3,4m/s darebbero F1/2,27/2,32N;−2 viola modulo e massa positivi. Cubo strettamente crescente per v>0,soluzione positiva unica. Vincolo fra corpi/prove,non massa variabile durante un giro.|

## Asset scientifico

`circular-force-resultant.svg`, SHA-256 `08e1e645389f40b4399f69a3cd376c4fe1d3abcdd0e1df6e9d9aaf707d2047db`. Intero XML letto e immagine intera visionata in Quick Look; controllati byte locali, upload Base64 e `/asset/hash` nei due record01/03. Nessun finding emerso.

Cerchi raggio100px a50px/m→2m. P è sul lato destro;velocità verso l'alto tangente,segmento60px a30px/(m/s)→2m/s. Risultante diretta a sinistra verso O,segmento80px a20px/N→4N. Non occorre che la freccia termini in O: è un vettore verso il centro con proprio modulo. Scale di dimensioni diverse esplicite,non confrontate come quantità omogenee. Pannello finale A2m/s²,F4N;risultante tangenziale nulla e avvertimento contro forza centripeta aggiuntiva corretti. Non è una prova browser completa delle schede a ogni larghezza.

## Impronte e controprove

|Artefatto|SHA-256 canonico|SHA-256 byte|
|---|---|---|
|package026|`430d7213fe6930ad381e9767186bd28bb96f28c5c3fc928f4f5ad21fd5f5484c`|`8905e3eb3f6f0cd5d72e520473f8b5829e7181fc996ad27a9432557cb6d922c6`|
|bindings026|`637ddde6a52a0e6463cb7ac8ac483e0563fb87df587e2a7a4791b3812b72a1cd`|`4f89f3b48ed2056a8d79a36d3aad80a22023f2fd921443710b958e9958f96c5f`|
|report026|`e874ad191ddc9dff1b40475f307df84cd018df5fdec9167fce860d207c46427c`|`1997c49594d05b0f4e17b2e8385e2d2a17b702131cab72459bf0f64975174e5d`|

Verificatore `circular_force_verifier.py`, SHA-256 byte `89028c3188caab2f7ff2757a7ebeb1a540e41696b6a86435eb9c9742342a19d1`.

Eseguiti:16/16 PASS,replay canonico identico;16 mutazioni indipendenti testo+binding rifiutate;empty/subset/duplicate rifiutati;source hash ribindato rifiutato;asset mancante fallisce esattamente01/03;invarianti DRAFT/NOT_RUN verificate. Mutazioni riproducibili delle risposte dopo rinnovo simulato del token nel solo processo di test sono in `tests/corpus/test_u2_orbits_freefall.py` e devono fallire anche l'oracolo numerico/concettuale, non soltanto la firma. Nessuna approvazione umana,pubblicazione,CI o browser completo attestati. Queste impronte sono datate;report rigenerati con nuovo contratto devono riportarne l'hash corrente senza conferire review a contenuti non riletti.


## Addendum: controprove riproducibili comuni

Eseguito `PYTHONDONTWRITEBYTECODE=1 ../../corpus-venv/bin/python -m unittest discover -s tests/corpus -p test_u2_orbits_freefall.py -v`: **7/7 test PASS (6,350 s)**. Il file copre i cinque lotti021/022/023/025/026, complessivamente80ID: ogni risposta mutata resta un'opzione esistente oppure un numero con unita invariata; si rigenerano binding e token soltanto in memoria e si richiede il FAIL dell'oracolo, senza errore di firma o chiave invalida. Tutte le80controprove PASS. Inoltre80mutazioni dei prompt con solo binding aggiornato vengono rifiutate dal freeze; test di insieme ID, sorgenti, figure, replay e DRAFT/NOT_RUN PASS. Due proprieta fisiche Hypothesis hanno `max_examples=50` ciascuna: comune riscalamento altezza/campo e risultante circolare radiale senza componente tangenziale.

La prima esecuzione aveva6/7PASS: il solo confronto di proprieta nel test generava1.0 con divisione Python contro Integer1; corretto nel test con `sp.Rational`, poi intero file GREEN. Non era un difetto di candidato o dell'oracolo e nessuna firma scientifica e stata cambiata per far passare la prova. SHA-256 del test finale: `c48b7153921ccc28265feb5f32720a940ec65a5ec19367296050a8f276ad15b2`. Nessun file candidato o fonte e stato modificato dai test.
