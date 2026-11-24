# Revisione indipendente AI — vector-projection-008 — 24 novembre 2026

Revisore `/root/review_corpus_increment`, distinto dall'autore `/root/author_vectors_b`. Nessuna modifica del candidato. Oracolo e rapporto scritti dal revisore senza importare codice autore o usare le risposte originali come oracolo. **16/16 PASS; nessun finding scientifico residuo. DRAFT, humanApproval=NOT_RUN.** Nessuna approvazione umana o pubblicazione.

Edizione autore `3c8d9db2`, confrontata con gli originali di Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json`. Tutti i 16 ID stabili, hash originali/candidati e allegati sono stati ricontrollati prima di congelare le firme indipendenti.

| Artefatto | Hash |
|---|---|
| Pacchetto, digest JSON canonico | `d3526b3b6c5ab2024670c1c673d4397b79de7da684a55e7a385ec741b660101d` |
| Binding, digest JSON canonico | `eb22c55aaf0adc0e9c79bf80d686d6b5559c513632c48259689aa4b6300abe1d` |
| Pacchetto, SHA-256 file | `e7f1bf7b87067d5ad5dcec137dce3688cbb91979158c2b898a06082e36c4c028` |
| Binding, SHA-256 file | `3e70a33e49a1df74b7e3827f18bc7950121c259108c1dcebe7d8aab93610972d` |
| SVG, SHA-256 | `0eeab80a351c1b8ef8bced06598f56d67e64021f41cefb24af82e84ba1c01678` |
| Verificatore indipendente, SHA-256 | `698aa1f1606d1efc4bfeed98de8b4b7f19d85d3681594f128ffa9af847dd55c7` |
| Rapporto JSON scientifico, SHA-256 | `f2072d5dfa73a875f4bef2be7e9f41b040b78c0778620a72827867beb412fa9e` |

## Lettura e soluzione di ogni ID

Prefisso completo `AR-u1-vector-projection-`. Tutte le opzioni, i domini del coseno e le unità sono stati letti individualmente.

| ID finale | Chiave | Matematica e caso avverso esaminato |
|---|---|---|
| 01 | `2 m` | Prodotto scalare del vettore lungo 60° con il versore +x: `4 cos60°=2`; non l'intero modulo quattro. |
| 02 | `m` | `L×1=L`: il coseno è puro, la componente conserva la dimensione dello spostamento. |
| 03 | `−5 m` | `10 cos120°=−5`; componente orientata distinta da modulo positivo. L'opzione `+5 m` perde il segno. |
| 04 | Raddoppia da `2 m` a `4 m` | Angolo fisso: `4/2→8/2`; non esiste un secondo raddoppio. |
| 05 | `4 m` | `R=2m/(1/2)`; moltiplicare darebbe un modulo minore della propria componente, violando `|P|≤R`. |
| 06 | `1/2` | `2m/4m`, unità cancellate; due viola il limite del coseno e `2 m` confonde componente con rapporto. |
| 07 | `3/2` | Componenti `2 m` e `3 m`; rapporto `3/2`, non inverso `2/3` o seconda componente tre. |
| 08 | `+2 m` | Proposto meno corretto: `4m−2m`; invertire l'ordine darebbe `−2 m`. |
| 09 | `R=P/c` | Inversione simbolica della proiezione per `0<c<1`; `P−c` sottrarrebbe grandezze dimensionalmente diverse. |
| 10 | `κ₁κ₂` | Prodotto dei due fattori. È esplicito e necessario `0<κ₂c<1`: un fattore positivo da solo non garantisce un nuovo coseno ammissibile. |
| 11 | `3` | Componenti `4m×1/2=2m`, `8m×3/4=6m`; rapporto tre. |
| 12 | `4 m` | Media `(2m+6m)/2`. Le medie degli ingressi danno invece `6m×5/8=15/4m`, distrattore distinto. |
| 13 | `3/2` | Tolto il raddoppio di R, resta fattore `3/2`; nuovo coseno `3/4` nel dominio acuto. Fattore due dà coseno uno, fattore tre dà `3/2` impossibile. |
| 14 | `8 m` | Guadagno `6/(2m)=3m⁻¹`, poi `18/g=6m`; modulo `6m/(3/4)=8m`. Conteggi distinti da metri. |
| 15 | `8 m` | Sistema dei riferimenti: `g=8/(4m)=2m⁻¹`, offset uno; `(9−1)/g=4m` è componente intermedia, modulo `4m/(1/2)=8m`. |
| 16 | `1/2` | Vincolo dimensionalmente esplicito `R=(8m)c`; `2m=(8m)c²`, quindi `c²=1/4`. Dominio `0<c<1` esclude radice negativa e valori maggiori di uno. |

## Figura e controlli eseguiti

SVG letto geometricamente: scala comune 30 px/m nei tre pannelli. Vettore da 4 m con differenze grafiche `(60,−103.9230485)` ha lunghezza 120 px e proiezione +60 px, cioè +2 m. Il terzo vettore ha differenze `(−150,−259.8076211)`, lunghezza 300 px e proiezione −150 px, cioè −5 m per R=10 m. Gli archi di 60° e 120°, la perpendicolare e la freccia della componente negativa sono coerenti. Le approssimazioni delle coordinate SVG rappresentano il disegno; i risultati del verificatore sono esatti.

L'oracolo deriva la componente dal prodotto scalare con il versore x, usa `cos(π/3)` e `cos(2π/3)` esatti, risolve inversa e taratura con SymPy e verifica il guadagno inverso di lunghezza con Pint. Non calcola un arco-coseno approssimato. Le firme sono state congelate solo dopo la lettura.

Controprove in memoria eseguite con risposta errata e binding candidato rigenerato per ID 01/03/05/06/07/12/13/14/15/16: tutte rifiutate anche dal controllo numerico indipendente. Cambiando l'unità numerica da metri a uno si ottiene un errore dimensionale. Sono stati rifiutati anche enunciato modificato/ribindato, hash sorgente azzerato, batch vuoto/parziale/duplicato. Il rapporto JSON prodotto dall'oracolo riporta 16/16 PASS, separando la revisione AI dai calcoli automatici.

Limiti: non attesta nuova esecuzione browser, importazione nell'app, merge, calibrazione con studenti o conformità di accessibilità. Questi restano gate dell'integratore. Nessuna approvazione umana. Una modifica dell'edizione richiede nuova lettura e nuove firme. **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT**.
