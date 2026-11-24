# Revisione indipendente AI — vector-product-007 — 24 novembre 2026

Revisore: `/root/review_corpus_increment`, distinto da `/root/author_vectors_b`, autore del candidato. L'autore non ha scritto il verificatore scientifico. Il revisore ha scritto soltanto il proprio oracolo e questi rapporti; non ha modificato il candidato, le opzioni o la figura dell'autore.

**Esito: 16 ID letti e risolti individualmente; nessun finding scientifico residuo dopo la correzione della figura. DRAFT; humanApproval=NOT_RUN.** La firma è una valutazione AI sull'esatta edizione identificata sotto, non un'approvazione umana o una promozione.

## Edizione verificata

Candidato autore B: commit iniziale `874c029c`, correzione esaminata `8daa177b`, nel worktree `work/cric-author-b`. Sorgenti: `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json`. Per tutti i 16 binding sono stati verificati ID stabile `AR-<sourceId>`, commit, digest dell'originale e digest del candidato, confrontando gli originali con Git. Le figure Base64 corrispondono ai byte SVG locali.

| Artefatto | Identità |
|---|---|
| Pacchetto, digest JSON canonico | `dc44d15ca7221e8c246a5230058b9f19fd3b4be470ed70f6342501279245de01` |
| Binding, digest JSON canonico | `65f6b585bace20e9da7ebd9154bcb693d7e339e498fdff0a8c46619b6ac4b5f1` |
| Pacchetto, SHA-256 file | `4bc0c0b88ba7d2bc5e8d0a8fe0f3920e3396c4fd2f0d3b5aa192d8118a05179f` |
| Binding, SHA-256 file | `9478e540dabeb7964aa7278a2067785194cf9dfd8846a4aedbd5c87b3a6b25bc` |
| SVG corretto, SHA-256 | `2412b8cab98a8f1deafa915e5355d6e1977c51d32c66424abf7d8e6e8bd1e8da` |
| `vector_product_verifier.py`, SHA-256 | `b5a8145201e965ef963959f030dbb70f094efb4e9a987b9f9dbe44d6ec617a67` |
| `vector-product-007.json` sotto `editorial/reviews/`, SHA-256 | `690c67e83003720a23965f04b86a75d607ae53c38b71648bb3866bb21a17c4ca` |

## Soluzioni e opzioni esaminate

Tutti gli ID hanno prefisso `AR-u1-vector-product-`. Tutte le opzioni sono state lette, inclusi segni, moduli/componenti e distrattori concettuali. Le quantità dichiarate sono adimensionali. Gli esempi con prodotto massimo assumono perpendicolarità; le norme non nulle sono positive.

| ID finale | Risultato | Controllo indipendente e distinzione esaminata |
|---|---|---|
| 01 | `4` | Determinante dei vettori `(2,0,0)` e `(0,2,0)`: vettore `(0,0,4)`, norma quattro. Il prodotto scalare sarebbe zero. |
| 02 | `1` | Prodotto delle unità `1×1`; l'analogia geometrica con un'area non introduce `m²` per vettori adimensionali. |
| 03 | `C=ab` | Determinante `(a,0,0)×(0,b,0)=(0,0,ab)`; norma `ab` per moduli positivi. Non somma vettoriale, rapporto o prodotto scalare. |
| 04 | Raddoppia da `4` a `8` | `2×2→4×2`, secondo modulo e angolo invariati. Due raddoppi darebbero invece un fattore quattro. |
| 05 | `2` | Inversa simbolica `a=C/b`, poi `4/2`. La sottrazione `4−2` coincide accidentalmente qui ma non è l'inversa generale. |
| 06 | `−6` | Terna destrorsa esplicita. `(B×A)z=Bx Ay−By Ax=0−3×2=−6`; `A×B` ha invece componente `+6`. Norma sei distinta da componente negativa. |
| 07 | `2` | `(2×4)/(2×2)=8/4`; otto è il nuovo prodotto, non il rapporto. |
| 08 | `+4` | Scarto dichiarato proposto meno corretto: `8−4`; il segno non è il verso del prodotto vettoriale. |
| 09 | `a=C/b` | Soluzione simbolica del determinante/norma uguale a `C`; dominio `b>0`. Reciproco e radice non isolano lo stesso modulo. |
| 10 | `κ₁κ₂` | Determinante con moduli `κ₁a`, `κ₂b`, diviso per quello iniziale. Con entrambi i fattori uno il rapporto deve essere uno, non due. |
| 11 | `4` | `(4×4)/(2×2)=16/4`; entrambi i moduli raddoppiano, angolo sempre retto. |
| 12 | `10` | Media delle due norme `(4+16)/2`; prodotto dei moduli medi `3×3=9` è un'altra operazione. Pesi statistici uguali dichiarati. |
| 13 | `2` | Prodotto iniziale quattro, nuovo sedici; con `a₂=4` occorre `b₂=4`, quindi `b₂/b₁=2`. Perpendicolarità mantenuta nel modello dichiarato. |
| 14 | `4` | Guadagno dimensionless `12/4=3`; prodotto ricostruito `48/3=16`, poi `16/4=4`. Usare direttamente la lettura come prodotto darebbe il distrattore procedurale dodici. |
| 15 | `4` | Sistema indipendente `4g+d=9`, `16g+d=33`: `g=2,d=1`; prodotto ignoto `(17−1)/2=8`, poi `a=8/2=4`. L'opzione otto interrompe il calcolo prima dell'inversione. |
| 16 | `2` | Vincolo `a=b>0`, dunque `b²=4`; `−2` viola il dominio. Senza uguaglianza, anche `a=1,b=4` darebbe lo stesso prodotto. |

## Finding risolto prima delle firme

La prima figura rappresentava moduli uguali `a=b=2` con frecce lunghe 220 e 120 px; nel secondo esempio `A=2` occupava 190 px mentre `B=3` soltanto 98 px. Il vettore di modulo maggiore appariva più corto. La didascalia del quesito 06 indicava tre tappe, mentre lo SVG ne conteneva quattro. Il revisore ha segnalato il problema all'autore e all'integratore e ha atteso la correzione, senza editare il candidato.

Nella correzione riletta: primo esempio frecce entrambe da 120 px e quadrato `120×120` con quattro celle; secondo esempio scala comune 50 px/unità, freccia `A=2` da 100 px e `B=3` da 150 px. Sono esempi dichiaratamente distinti: modulo quattro nel primo, modulo sei nel secondo. Punto nel cerchio per `+z` uscente e croce per `−z` entrante corretti. Didascalia aggiornata a quattro tappe.

Le firme indipendenti sono state congelate **solo dopo** questa rilettura e il controllo delle nuove identità.

## Oracolo e controprove eseguite

Il nuovo verificatore non importa moduli autore. Deriva i risultati da determinanti cartesiani tridimensionali, norme euclidee, sistemi lineari e inversioni esatte SymPy; Pint controlla l'adimensionalità della taratura. Usa il `review_contract.py` del root per identità completa, hash, provenienza, figure e unicità della chiave.

Esecuzione sul pacchetto dell'autore, fornendo esplicitamente il suo `asset_root`: **16/16 PASS**. Sono state anche alterate in memoria le chiavi di 01, 06, 08, 12, 14, 15 e 16, rigenerando il rispettivo binding candidato: tutte rifiutate sia dalla firma sia dall'oracolo numerico indipendente. In particolare: segno `+6` al posto di `−6`, errore `−4` al posto di `+4`, media nove al posto di dieci, mancata rimozione del guadagno, arresto al prodotto intermedio e radice negativa.

Ulteriori controprove eseguite: enunciato modificato e ribindato rifiutato; hash sorgente sostituito con zeri rifiutato; batch vuoto, parziale e con ID duplicato rifiutati. Il rapporto JSON è stato generato direttamente dal verificatore indipendente nel root; nessun file autore è stato modificato.

Limiti: nessun nuovo rendering browser, importazione canonica o merge è attestato da questo documento; restano compiti dell'integrazione. Nessun test con studenti, calibrazione psicometrica, certificazione di accessibilità o approvazione umana. Le firme coprono solo questa edizione; modifiche future richiedono nuova rilettura. Stato: **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT**.
