# Revisione indipendente centripetal-acceleration-025

Revisore AI separato dall'autore A. Letti tutti i 16 enunciati, opzioni, blocchi di soluzione e feedback/hint, record originali Git e SVG. Nessun import autore nell'oracolo; nessuna modifica ai candidati. Autore iniziale961b97ce e correzione finale SVGd032681e riletti prima del freeze dei due record figurati01/03.

**16/16 PASS_AI, nessun finding aperto. DRAFT / HUMAN_APPROVAL_NOT_RUN; nessuna pubblicazione.** Non è calibrazione empirica con studenti né approvazione umana.

Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`, file SHA-256 `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Confrontati individualmente ogni `AR-u2-centripetal-acceleration-NN` con l'effettivo `u2-centripetal-acceleration-NN` Git, digest sorgente/candidato e provenienza. I digest individuali sono conservati in binding/report e nel token indipendente che comprende origine e asset.

## Derivazione indipendente

Riferimento inerziale, circonferenza fissa non degenere, r e rapidità positivi e costanti dentro ciascuna prova. Posizione `R=(r cosωt,r sinωt)`, prima e seconda derivata danno `|v|=rω`, `a=−ω²R`, `a·v=0` e `A=rω²=v²/r`. Accelerazione tangenziale nulla, accelerazione radiale non nulla; non si deduce velocità vettoriale costante dal modulo costante. SymPy controlla queste identità, inverse, rapporti e tarature; Pint/Fraction verifica unità esatte. I conti richiesti allo studente sono quadrati perfetti e frazioni semplici.

## Lettura per ID

| ID | Soluzione manuale e unità | Distrattori e condizioni |
|---|---|---|
|01| `A=2²/2=2m/s²`. | Radiale verso il centro e perpendicolare alla tangente;zero tangenziale non significa zero totale. Figura sotto. |
|02| `(m/s)²/m=m/s²`, unica unità corretta. | s,m,m/s,kg sono tempo,lunghezza,velocità,massa; nessuna accelerazione. |
|03| `v>0,r>0⇒A=v²/r>0`, direzione della tangente cambia. | Corretta «rapidità costante ma velocità vettoriale cambia direzione»;accelerazione nulla,forza risultante tangente,raggio crescente,velocità vettoriale costante sono incompatibili col modello. Per massa positiva Newton dà risultante radiale. |
|04| Stesso r2m: A₁=4/2=2,A₂=16/2=8m/s², **da2 a8**. | Da2a4 legge lineare errata;resta,dimezza,zero non descrivono le prove. Cambiamento fra prove, non accelerazione tangenziale dentro una prova. |
|05| `Ar=2×2=4m²/s²`, `v=√4=2m/s`. | Una sola radice sul prodotto perfetto;ramo positivo del modulo, nessuna informazione sul senso di rotazione. |
|06| `r=v²/A=4/2=2m`. | v/A sarebbe tempo; r positivo non degenere. Reinserimento dà A2m/s². |
|07| A₁=2,A₂=4/4=1m/s²; rapporto **1/2**. | 2 inverte rapporto,−1/2 viola positività,1 ignora variazione,1/4 introduce quadrato sul raggio. |
|08| A corretto2m/s²;proposto4 meno2 = **+2m/s²**. | +4 ripete proposta,+1 non differenza,0 accetta errore,−2 inverte sottrazione. Segno dello scarto non è direzione radiale. |
|09| Ar=v², dominio v>0: **v=√(Ar)**. | Ar è quadrato della rapidità;negativo escluso,non senso di rotazione;√(A/r) è frequenza,√(r/A) tempo. |
|10| `(κ₁v)²/(κ₂r)` diviso v²/r dà **κ₁²/κ₂**. | κ₁/κ₂ omette quadrato,κ₂/κ₁² reciproco,κ₁²κ₂ inverte effetto r,κ₁²/κ₂² quadra r. Leggi generali distinte, non approvate da coincidenze per singoli fattori. |
|11| A₁=4/2=2,A₂=16/4=4m/s²; rapporto **2** puro. | Raddoppi non cancellano interamente perché v compare al quadrato;r e v restano costanti in ciascuna prova. |
|12| Media uguali pesi `(2+4)/2=3m/s²`. | 6 è somma,3/2 divide ancora,4 e2 singole uscite. Ingressi medi3,3 danno3 solo per dati proporzionali. Controesempio esatto a r2m con v2,4: uscite2,8 media5 contro9/2 sugli ingressi medi. |
|13| Obiettivo A₂=4m/s² e v₂=4m/s: r₂=16/4=4m; rapporto r₂/r₁=**2**. | Raggio invariato darebbe A8m/s² e supererebbe obiettivo; reinserire4²/4=4 verifica entrambi i vincoli. |
|14| Riferimento A2 e conteggio6: guadagno3s²/m. S12→A4;Ar=4×4=16,v=**4m/s**. | Conteggi puri,offset nullo;taratura prima di radice, guadagno non gravità g nonostante simbolo usato nel testo. |
|15| A riferimenti2,4 e S5,9:guadagno2s²/m,offset1. S17→A8,r2⇒v=√16=**4m/s**. | 8 confonde A col numero di v;2 ripete riferimento;5 e3m/s darebbero S26 e10 anziché17. Rapporto grezzo non elimina offset. |
|16| v=kr,k=1s⁻¹⇒A=k²r,r=A/k²=**2m**,v=2m/s. | r1,3,4m darebbero A1,3,4;−2 viola r>0 e v>0. Vincolo seleziona prove di uguale velocità angolare, non raggio crescente nel tempo. Coppia positiva unica. |

## Asset e finding risolto

`centripetal-acceleration-direction.svg` SHA-256 finale `898700eafbfc9e2b845e0375bf411d482101d09fd5fdda22bdf6e715360189f2`. XML completo letto e immagine intera visionata nel rendering Quick Look locale; byte locali, upload Base64 e `/asset/hash` controllati.

Geometria: entrambi i cerchi hanno raggio100px a50px/m→2m. P sul lato destro ha velocità verso l'alto; Q in alto ha velocità a sinistra: rotazione antioraria coerente. Segmenti di velocità60px a30px/(m/s)→2m/s; accelerazione da Q verso il centro, segmento60px a30px/(m/s²)→2m/s². Scale dimensionalmente diverse esplicitate, non uguagliate come grandezze. Non si pretende che l'accelerazione raggiunga il centro: è il suo verso radiale, con lunghezza assegnata dal proprio modulo.

Piccolo finding di leggibilità segnalato ad A: cerchio dietro la cifra dell'etichetta rossa a x225,y535. **Risolto in d032681e** spostando solo x315; diff e nuovo rendering riletti, etichetta esterna al cerchio e leggibile. Figure e riferimenti aggiornati soltanto01/03; altre14 righe e fisica invariate. Nuove firme01/03 congelate dopo rilettura; vecchi due record rifiutati. Nessun candidato scritto dal revisore.

## Impronte e prove

| Artefatto | SHA-256 canonico | SHA-256 byte |
|---|---|---|
|package025|`900f875f79b784e055c3ab9f1372eab716eaf436c9a8f72dbc143bbbf2e2cae8`|`156d587d963daf421a0d2b660cbb7ff35f3dcb4140cce0b1cea711947bad02b2`|
|bindings025|`daf42493d456896e991f1e2606d0ece478e137fc5d3e5e66351e355959fd463c`|`ed59552c6f79b77c49713be97208c6f5d71e349536b644a465a2444b27676370`|
|report025|`dec1d26bb5bd38526434007028ac0d2ee4d2dfd4199d61f83bc2738a3de1ef30`|`4305fb1eff9a10840125c28c56c8c68e296788fb3025c3e3746704f4f4f0b135`|

Verificatore `centripetal_acceleration_verifier.py`: SHA-256 byte `7284f7642b930301268e8f39bbe7649ad36b7a69ad91cd4943a8762e17b1daac`.

Eseguiti indipendentemente:16/16 PASS e replay canonico identico;16 testi alterati con binding aggiornati rifiutati;empty/subset/duplicate rifiutati;source hash ribindato rifiutato;figure mancanti falliscono precisamente01/03;vecchio pacchetto pre-fix rifiutato precisamente01/03;invarianti DRAFT/NOT_RUN conservate. Test riproducibili di mutazione delle risposte, anche dopo rinnovo simulato del token nel solo processo di test, appartengono a `tests/corpus/test_u2_orbits_freefall.py`: devono dimostrare rifiuto dell'oracolo oltre al rifiuto del freeze. Nessun browser completo, CI, pubblicazione o approvazione umana attestati dalla nota. Hash datati: eventuale rigenerazione con contratto condiviso nuovo va esplicitata e non autorizza letture di candidati cambiati.


## Addendum: controprove riproducibili comuni

Eseguito `PYTHONDONTWRITEBYTECODE=1 ../../corpus-venv/bin/python -m unittest discover -s tests/corpus -p test_u2_orbits_freefall.py -v`: **7/7 test PASS (6,350 s)**. Il file copre i cinque lotti021/022/023/025/026, complessivamente80ID: ogni risposta mutata resta un'opzione esistente oppure un numero con unita invariata; si rigenerano binding e token soltanto in memoria e si richiede il FAIL dell'oracolo, senza errore di firma o chiave invalida. Tutte le80controprove PASS. Inoltre80mutazioni dei prompt con solo binding aggiornato vengono rifiutate dal freeze; test di insieme ID, sorgenti, figure, replay e DRAFT/NOT_RUN PASS. Due proprieta fisiche Hypothesis hanno `max_examples=50` ciascuna: comune riscalamento altezza/campo e risultante circolare radiale senza componente tangenziale.

La prima esecuzione aveva6/7PASS: il solo confronto di proprieta nel test generava1.0 con divisione Python contro Integer1; corretto nel test con `sp.Rational`, poi intero file GREEN. Non era un difetto di candidato o dell'oracolo e nessuna firma scientifica e stata cambiata per far passare la prova. SHA-256 del test finale: `c48b7153921ccc28265feb5f32720a940ec65a5ec19367296050a8f276ad15b2`. Nessun file candidato o fonte e stato modificato dai test.
