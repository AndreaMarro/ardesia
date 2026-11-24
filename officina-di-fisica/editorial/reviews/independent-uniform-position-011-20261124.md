# Revisione indipendente AI — uniform-position-011 — 24 novembre 2026

Revisore `/root/review_corpus_increment`, distinto dall'autore `/root/author_vectors_b`. Tutti i 16 enunciati, opzioni, ragionamenti, domini e la figura sono stati letti individualmente. Nessun candidato è stato modificato dal revisore. Il verificatore non importa codice autore. **16/16 PASS dopo la correzione 60ab1b59 dell'autore; nessun finding residuo. DRAFT / humanApproval=NOT_RUN.** Nessuna approvazione umana o pubblicazione.

Originali confrontati con Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`. Identificatori stabili, commit e digest dei 16 originali/candidati controllati. La figura caricata coincide con i byte locali. Firme congelate solo dopo rilettura della correzione, non sulla prima versione 56e349e5.

| Artefatto | Hash |
|---|---|
| Pacchetto, digest JSON canonico | `f9b6bf5f8be25fce928d785862aeb7d5c3c1359cc8016fd7f3408111a4d03f78` |
| Binding, digest JSON canonico | `d1ca7f89b4d441c7089f1fb1dad9da349bff0a6551dbe64bc804063de6729bd1` |
| Pacchetto, SHA-256 file | `fb643f4d67ec13bce3b2dd8471d689e7371bd1925c4457bf71cb7322fa276a09` |
| Binding, SHA-256 file | `76f23c50702b15c6f069c5a83ab8576409b6c7db699ffccf8cc0316428be30f9` |
| SVG, SHA-256 | `cad5dcb8b708cdf6bda946934a3d2f0bfae10adf4805704d4e2577955385e25e` |
| Verificatore indipendente, SHA-256 | `c0a306e55ef296cfcbdb12b29dbf59a53eeac7c47f3d6241c8bc9b63899f8cbe` |
| Rapporto scientifico JSON, SHA-256 | `3daa2139c24a8d12ec44bc1e17c10285dab9de91c0f5fda614d3ef2eeb4a0002` |

## Ogni ID letto e risolto

Prefisso `AR-u2-uniform-position-`. Coordinate riferite alla medesima origine quando confrontate; tempo contato dall'inizio. Nei confronti simbolici u è la velocità fissata a +2 m/s, non un coefficiente privo di unità.

| ID finale | Chiave | Controllo indipendente e distrattori |
|---|---|---|
| 01 | `6 m` | Coordinata iniziale 2 m più spostamento 4 m; quattro è il cambiamento, non la coordinata finale. |
| 02 | `m` | x₀ e vt entrambi lunghezze, quindi somma omogenea; segno e unità sono proprietà distinte. |
| 03 | `3 m e 2 m/s` | Sistema della retta passante per (0s,3m), (2s,7m): intercetta tre, pendenza `(7−3)/(2−0)=2`. `7/2` ignora l'intercetta. Il report distingue le dimensioni delle due risposte. |
| 04 | Da `6 m` a `8 m` | Stesso incremento vt=4 m, cambia solo partenza 2→4 m; rapporto 4/3, non raddoppio dell'intera coordinata. |
| 05 | `2 m` | `x₀=6m−(2m/s)(2s)`. La coordinata iniziale potrebbe essere negativa con altri dati: qui il segno viene dai numeri. |
| 06 | `2 s` | Prima differenza `(6−2)m`, poi divisione per 2m/s. `6m/(2m/s)=3s` presupporrebbe una partenza dall'origine. |
| 07 | `5/3` | Coordinate `6m` e `10m`, rapporto `10/6`. Rapporto degli spostamenti `8/4=2` è diverso. Origine fissa esplicita: traslarla modifica i rapporti delle coordinate. |
| 08 | `+6 m` | Proposto meno corretto `12−(2+4)=6m`; usare lo spostamento quattro come coordinata darebbe errore otto. |
| 09 | `x₀=x−ut` | Inversa additiva, senza divisione per il tempo: valida anche t=0. ut conserva unità di lunghezza; x−t e x/(ut) non ricavano la coordinata. |
| 10 | `(κ₁x₀+uκ₂t)/(x₀+ut)` | Sostituzione nei due addendi con u fisso; pesi positivi sul dominio dato, rapporto fra i due fattori. Non prodotto dei fattori. |
| 11 | `2` | Coordinate 6 m e 12 m con origine comune; tutti gli addendi raddoppiano, quindi rapporto due, non quattro. |
| 12 | `9 m` | Media `(6+12)m/2`; controllo sugli ingressi medi `3m+(2m/s)(3s)=9m`, grazie alla linearità a u fissato. |
| 13 | `2` | Nuovo arrivo 12 m, partenza 4 m: 8 m a 2m/s richiedono 4 s, rapporto con 2 s uguale a due. |
| 14 | `4 m` | Guadagno `18/(6m)=3m⁻¹`, lettura 36 dà coordinata 12 m; sottrazione dello spostamento 8 m ricostruisce partenza 4 m. |
| 15 | `4 m` | Riferimenti coordinate 6 m e 12 m: `g=12/(6m)=2m⁻¹`, offset conteggio uno; nuova coordinata `(17−1)/g=8m`, poi meno 4 m di moto. Offset del display e x₀ hanno dimensioni diverse. |
| 16 | `2 s` | Vincolo tra dati di prove `x₀=(1m/s)T`; a tempo interno τ la traiettoria è `x(τ)=(1m/s)T+(2m/s)τ`. All'arrivo `x(T)=(3m/s)T=6m`, T=2s. La derivata interna resta 2m/s: non è un moto a 3m/s. |

## Finding risolto

Nella prima edizione di 07 i distrattori `2` e `8/4` erano equivalenti. Il revisore ha segnalato direttamente ad autore e integratore che cinque etichette contenevano soltanto quattro esiti distinti, senza editare il candidato. L'autore ha sostituito `8/4` con `1` e aggiornato il feedback: due confonde gli spostamenti con le coordinate, uno ignora il tempo maggiore. Rilette le cinque opzioni e congelata soltanto l'edizione corretta 60ab1b59.

## Figura e controprove eseguite

Primi due pannelli: scala 50 px/m, origine all'ascissa grafica 100, partenza 200 (+2m), arrivo 400 (+6m), freccia di incremento lunga 200 px (+4m). Terzo pannello dichiarato come altro esempio: (0s,3m) e (2s,7m), ascisse grafiche 100 e 300; differenza verticale 140 px corrispondente a 4 m, differenza orizzontale 200 px corrispondente a 2 s. Coerenti intercetta e pendenza. Il secondo esempio non è confuso con la partenza a due metri del primo.

L'oracolo deriva coordinate e inverse da una traiettoria affine e ricava intercetta e velocità mediante un sistema lineare indipendente. Pint controlla tarature e sottrazioni dimensionalmente omogenee. Il vincolo 16 separa durata selezionata da tempo interno e verifica esplicitamente che la derivata interna resti u.

Esecuzione **16/16 PASS**. Dodici chiavi errate e ribindate per 01/03/05/06/07/08/11/12/13/14/15/16 sono rifiutate anche dal modello numerico: coordinate confuse con spostamenti, pendenza 7/2, rapporto due, somma non mediata e arrivo confuso con partenza. Unità errata per il tempo rifiutata. Controlli aggiuntivi: t=0 restituisce la partenza; partenza negativa ammessa; dopo traslazione dell'origine da x₀=2m a x₀=0m il rapporto di coordinate cambia da 5/3 a due. Enunciato alterato/ribindato, sorgente azzerata e identità vuota/parziale/duplicata rifiutati.

Limiti: il report non attesta nuova esecuzione browser, importazione canonica, CI, merge, pubblicazione, calibrazione con studenti o certificazione di accessibilità. Le firme valgono soltanto per l'edizione e gli hash sopra. **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT**.
