# Revisione indipendente AI — mean-velocity-012 — 24 novembre 2026

Revisore `/root/review_corpus_increment`, distinto dall'autore `/root/author_vectors_b`. Tutti i 16 testi, opzioni, soluzioni, unità, vincoli e la figura sono stati letti e risolti individualmente; nessun candidato è stato modificato dal revisore. Oracolo e rapporto non importano codice autore. **16/16 PASS; nessun finding scientifico residuo nell'edizione df7807f9. DRAFT / humanApproval=NOT_RUN.** Nessuna approvazione umana o pubblicazione.

Originali confrontati con Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`. Per tutti gli ID ricalcolati identificatori `AR-<sourceId>`, commit, hash dell'originale e del candidato. Allegati e byte SVG confrontati; firme congelate solo dopo la lettura.

| Artefatto | Hash |
|---|---|
| Pacchetto, digest JSON canonico | `5d8783c23641d576c795a1ceb96e76259f4930cf0e406749afb39e66e900a83b` |
| Binding, digest JSON canonico | `22d813d2af44aa6352b7d2f7092225246a42e29022630a035f8eddf4bf19a0a4` |
| Pacchetto, SHA-256 file | `0d56f94d1e2a3228eddaa09f33ff81ff3b5dca93671d5ab32e735b606effc33f` |
| Binding, SHA-256 file | `50405050c9bf83dca9ccc83a415302ed9d463043ba5a8dad8ff5c74f12662681` |
| SVG, SHA-256 | `3c38ee6706474cebfa48f95a87a180d4e96f3a4bc0dba9e4e6b0092700d8ed01` |
| Verificatore indipendente, SHA-256 | `29af6c2fdea782d7800184245220ce9d611cba01a292b1fab3311bc4f565819c` |
| Rapporto scientifico JSON, SHA-256 | `56f897430afcd60081a48e7d0e0119abe7832893fd3e7d82aa28662688441c09` |

## Lettura individuale

Prefisso `AR-u2-mean-velocity-`. Gli intervalli trascorsi sono positivi; la media orientata usa lo spostamento con segno. Non è stata introdotta una condizione di moto uniforme assente dai testi.

| ID finale | Chiave | Matematica, ipotesi e distrattori esaminati |
|---|---|---|
| 01 | `+1 m/s` | `(+2m)/(2s)`. Dati agli estremi sufficienti anche per moto non uniforme; il risultato non assegna la velocità in ogni istante. |
| 02 | `m/s` | Differenza di coordinate divisa per differenza di istanti: `L/T`; media non significa eliminare unità o dividere nuovamente per due rilevazioni. |
| 03 | `0 m/s e 3 m/s` | Tratti con segno `+6−6=0m`; distanza `|6|+|−6|=12m`. Stesso tempo totale 4 s, quindi norma della media vettoriale zero e rapidità media tre. Durate separate dei tratti non necessarie. |
| 04 | Raddoppia da `+1` a `+2 m/s` | Durata fissa 2 s, spostamento raddoppiato. Non ne segue un raddoppio delle velocità istantanee in ogni punto. |
| 05 | `+2 m` | Inversa della definizione `Δx=VΔt`, valida anche con accelerazioni o inversioni intermedie; non necessariamente distanza percorsa. |
| 06 | `2 s` | `(+2m)/(+1m/s)`; velocità media non nulla. Dati entrambi negativi darebbero ancora durata positiva, non tempo all'indietro. |
| 07 | `1/2` | Stesso spostamento, durata doppia: `(2/4)/(2/2)`. Denominatore non scambiato con numeratore. |
| 08 | `+1 m/s` | Coordinata `+2→0m`: media `(0−2)/2=−1m/s`; scarto proposto meno corretto `0−(−1)=+1m/s`. Arrivare a coordinata zero non significa media zero. |
| 09 | `Δx=VΔt` | Isolamento simbolico della differenza di coordinate; V deve essere la media sul medesimo intervallo, non una velocità istantanea arbitraria. |
| 10 | `κ₁/κ₂` | Fattore dello spostamento al numeratore e del tempo al denominatore; dilatazione comune conserva la media. Dominio iniziale positivo esclude divisione per V₁ zero. |
| 11 | `3/2` | Prima media `2/2=1m/s`, seconda `6/4=3/2m/s`; triplo spostamento diviso doppia durata. |
| 12 | `5/4 m/s` | Media aritmetica con uguale peso `(1+3/2)/2`. La media di un eventuale viaggio aggregato sarebbe invece `8m/6s=4/3m/s`; il testo distingue esplicitamente le due richieste. |
| 13 | `2` | Occorre `6m/t₂=3/2m/s`, quindi t₂=4 s e rapporto con 2 s uguale a due. |
| 14 | `6 m` | Guadagno `3s/m`; lettura `9/2` corrisponde a `3/2m/s`, poi moltiplicazione per 4 s. Unità del guadagno tempo su lunghezza, non lunghezza inversa. |
| 15 | `4 m` | Riferimenti di velocità 1 e 3/2 m/s: `g=1/(1/2m/s)=2s/m`, offset uno; nuova velocità `2m/s`, spostamento in 2 s uguale a 4 m. |
| 16 | Infinite coppie positive | `Δt=λ>0`, `Δx=(1m/s)λ`; la seconda misura ripete il vincolo. Jacobiano delle due condizioni di rango uno; esempi (1m,1s), (2m,2s), senza durata unica. Il coefficiente mantiene le unità corrette. |

## Figura e prove avverse

Figura: andata e ritorno sono lunghi entrambi 360 px, scala 60 px/m, con frecce opposte. Inizio e arrivo coincidono; la distanza somma le due lunghezze mentre lo spostamento si annulla. Pannello finale divide entrambi i numeratori per 4 s. Non impone tacitamente due durate uguali o due velocità uniformi.

L'oracolo usa differenze di coordinate agli estremi, tratti con segno e somma dei valori assoluti per separare media vettoriale e rapidità. SymPy ricava inverse, rapporti, rango del vincolo ridondante e tarature; Pint controlla guadagno s/m e spostamenti. La coppia in 03 è verificata come due numeri esatti con unità, non soltanto come testo. Il calcolo controlla separatamente `5/4` con peso uguale e `4/3` con peso temporale.

Esecuzione: **16/16 PASS**. Controprove numeriche con chiavi errate e binding rigenerato per 01/03/05/06/07/08/11/12/13/14/15: tutte rifiutate anche dal modello indipendente. Controllati in particolare media vettoriale confusa con rapidità, scarto negativo errato in 08 e aggregato `4/3` al posto dell'aritmetica in 12. Chiave di coppia unica in 16 rifiutata dal controllo concettuale; unità sbagliata per lo scarto di velocità rifiutata. Il modello restituisce −1 m/s per 2→0 m in 2 s e rifiuta durata zero. Identità vuota/parziale/duplicata, sorgente azzerata ed enunciato alterato/ribindato rifiutati.

Limiti: nessuna nuova esecuzione browser, importazione canonica, CI o pubblicazione è attestata qui. Nessuna calibrazione con studenti o certificazione di accessibilità. Valutazione AI distinta dall'autore, valida per gli hash sopra; nessuna approvazione umana. **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT**.
