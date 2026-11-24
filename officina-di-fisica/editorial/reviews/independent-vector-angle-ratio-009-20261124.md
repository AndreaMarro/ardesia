# Revisione indipendente AI — vector-angle-ratio-009 — 24 novembre 2026

Revisore `/root/review_corpus_increment`, distinto dall'autore `/root/author_vectors_b`. Il revisore non ha editato i candidati né la figura; ha scritto soltanto il verificatore indipendente e i rapporti. **16/16 PASS; nessun finding scientifico residuo nell'edizione finale 41c50520. DRAFT; humanApproval=NOT_RUN.** Le firme congelate attestano una lettura AI, non approvazione umana o pubblicazione.

Sorgenti originali: Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json`. Per tutti i 16 record si sono ricalcolati hash originali/candidati e identità `AR-<sourceId>`, controllando il commit e i byte della figura caricata prima della firma.

| Artefatto | Hash |
|---|---|
| Pacchetto, digest JSON canonico | `7a756b7d06dc45ffc5e2e54e8b490b31eeaace27b5eedbfaa81cbb15c79fd9de` |
| Binding, digest JSON canonico | `031850d48f8826f3f9484140d48ad14582857d8c02c0d54821073a48fd7205b0` |
| Pacchetto, SHA-256 file | `b253f4dd4b1f3cd43c37de4cc57b3373cbd9fc4c7ade492100e26d528f00f458` |
| Binding, SHA-256 file | `2ac2a507dd7bdbe527554c4c6f03d72909a5bc43f17557af2939246f630f6a03` |
| SVG, SHA-256 | `461a07da35deaa01ef9f4727831a60ad472ccf326a85578d16fab2ff6835ee8c` |
| Verificatore indipendente, SHA-256 | `d72f52f5b139dcc81be8925b6c58e5440802762403d029f3091f15fadb5b69ca` |
| Rapporto scientifico JSON, SHA-256 | `1419905ce0fc96fc5fe937f199a9b6e1322c3a7f099630a2b19ee27789173b31` |

## Soluzione di ciascun ID e lettura dei distrattori

Prefisso completo `AR-u1-vector-angle-ratio-`. Primo quadrante e componenti positive sono condizioni essenziali. Tutte le opzioni sono state lette; nessuna duplicazione semantica o seconda risposta corretta individuata.

| ID finale | Risultato | Verifica individuale |
|---|---|---|
| 01 | `1` | Componenti normalizzate su raggio comune: rapporto `sin/cos=(b/r)/(a/r)=b/a=2m/2m`. Il dato richiesto è la tangente, non 45 gradi. |
| 02 | `1` | Rapporto di lunghezze omogenee: unità uno. La tangente non è l'angolo espresso in gradi; non è una lunghezza o velocità. |
| 03 | `3/5 e 4/5` | Adiacente `sqrt[(5cm)²−(3cm)²]=4cm`; seno opposto/ipotenusa, coseno adiacente/ipotenusa. Controllo `9/25+16/25=1`; opzioni invertite, quadrati o rapporti fra cateti sono distinte. |
| 04 | Si dimezza da `1` a `1/2` | Con b fisso, il denominatore a raddoppia: `2/2→2/4`. Componenti positive escludono tangente negativa. |
| 05 | `2 m` | Inversa `a=b/T`, con T positivo; sostituzione `2m/2m=1`. |
| 06 | `2 m` | `b=Ta`. È stato controllato anche il caso simbolico/generale: per `T=2,a=2m` occorre `b=4m`, non `a/T=1m`. |
| 07 | `2` | Base fissa: tangente `1→2`, rapporto due. Una tangente può superare uno nel primo quadrante; il limite uno di seno/coseno non si trasferisce alla tangente. |
| 08 | `+1` | Proposto meno corretto `2−1`; scarto adimensionale. La risposta `−1` inverte l'ordine. |
| 09 | `a=b/T` | Si porta prima a fuori dal denominatore: `Ta=b`. T/b è lunghezza inversa, T−b mescola dimensioni. |
| 10 | `κ₂/κ₁` | Normalizzando i due vettori, il fattore della componente verticale divide quello orizzontale. Una dilatazione comune conserva la direzione. |
| 11 | `2/3` | Tangente iniziale uno, nuova `4/6`; componente orizzontale tripla e verticale doppia. Il vettore può allungarsi pur diventando meno ripido. |
| 12 | `5/6` | Media `(1+2/3)/2`. Rapporto delle componenti medie `3m/4m=3/4` è un'altra operazione; `5/3` è solo la somma prima della media. |
| 13 | `2` | Nuova tangente `2/3`, nuova base `6m`: altezza `4m`; rapporto al vecchio `2m` uguale a due. |
| 14 | `6 m` | Guadagno `3/1=3`, tangente dalla lettura `2/3`; base `4m/(2/3)=6m`. Guadagno e tangente sono puri, base resta lunghezza. |
| 15 | `4 m` | Entrambe le differenze negative: `(7/3−3)/(2/3−1)=(-2/3)/(-1/3)=2`; offset uno, T ignota `1/2`, base `2m/(1/2)=4m`. |
| 16 | Infinite coppie positive con `a=b` | `a=b=λ>0` dà T uno per ogni lunghezza λ. Due equazioni hanno rango uno; non è assegnato il modulo. Esempi `(1m,1m)` e `(2m,2m)` hanno stessa direzione e moduli diversi. |

## Figura, indipendenza e controprove

Figura finale riletta dopo che l'autore ha reso esplicite le unità su entrambi gli ingressi di Pitagora: `(5 cm)²−(3 cm)²`. Non è una correzione eseguita dal revisore. I triangoli hanno base 160 px, altezza 120 px e ipotenusa 200 px: 4, 3 e 5 cm alla stessa scala di 40 px/cm. Il secondo pannello conserva la scala. L'angolo è presso il vertice sinistro: opposto tre, adiacente quattro; arco e angolo retto coerenti.

L'oracolo non importa moduli autore. Ricava la tangente dal rapporto fra componenti normalizzate; usa Pitagora e rapporti Pint esatti, risolve inversa e tarature simboliche e controlla il rango delle condizioni ridondanti in 16. La coppia seno/coseno in 03 è controllata numericamente come coppia di razionali esatti, non soltanto come etichetta testuale.

Esecuzione del verificatore: **16/16 PASS**. Controprove con risposta errata e binding candidato rigenerato per 01/03/05/06/07/08/11/12/13/14/15: tutte rifiutate dall'oracolo numerico, compresa coppia seno/coseno scambiata, segno dell'errore invertito, media `3/4` e mancata taratura. In 16, una singola coppia al posto dell'insieme infinito è rifiutata dalla chiave concettuale indipendente. Unità numerica errata, sorgente azzerata, enunciato alterato/ribindato e identità vuota/parziale/duplicata sono stati rifiutati in memoria.

Limiti: nessuna nuova esecuzione browser, importazione nell'app, CI o integrazione è certificata da questo rapporto. Nessuna calibrazione con studenti, certificazione di accessibilità o approvazione umana. Le firme valgono per gli hash indicati; modifiche richiedono nuova lettura. **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT**.
