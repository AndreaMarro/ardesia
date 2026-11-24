# Revisione indipendente AI — uniform-displacement-010 — 24 novembre 2026

Revisore `/root/review_corpus_increment`, distinto dall'autore `/root/author_vectors_b`. Lettura individuale di tutti i 16 enunciati, opzioni, spiegazioni, ipotesi, unità e figura, senza modificare i candidati. Verificatore e rapporti sono del revisore e non importano codice autore. **16/16 PASS; nessun finding scientifico residuo nell'edizione autore 4c1f2370, dopo la rilettura della presentazione 08 descritta sotto. DRAFT; humanApproval=NOT_RUN.** Nessuna approvazione umana o pubblicazione.

Sorgenti confrontate: Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`. Verificati tutti gli ID `AR-<sourceId>`, commit e digest dei record originali/candidati; la firma indipendente è stata congelata solo dopo la lettura. Allegato Base64 e SVG locale corrispondenti.

| Artefatto | Hash |
|---|---|
| Pacchetto, digest JSON canonico | `f4d3923ef8bf232f65513a086496fe957a1a48151f8a8941c7abe275f40e21b6` |
| Binding, digest JSON canonico | `10fac8460d78704474e729c04726da72bfdc773e951d9a7188f62c268b3c04e3` |
| Pacchetto, SHA-256 file | `c6c237e020a0aac4ea242e997077a83297b81106747f478526d5c69da7cc621f` |
| Binding, SHA-256 file | `e9ba7ab84baa50237c2b506473773ecbf11514181c56f2a65c9628e377174fe8` |
| SVG, SHA-256 | `2efc95e2aa57c1b4266f85eb38b94bad92c0a81b8bf5a8ff83879f6d2e632d81` |
| Verificatore indipendente, SHA-256 | `b8b3d3ce44665640947cec6109dc66b658f75c5560500aa4c2b7bd59feb48d6d` |
| Rapporto scientifico JSON, SHA-256 | `994e97b265db608786fa1bd03d5b27d173cafd1d1c5c38acf896470e764dec96` |

## Risultati individuali e casi esaminati

Prefisso completo `AR-u2-uniform-displacement-`. Sono stati controllati tutti i distrattori, non soltanto l'unicità testuale della chiave.

| ID finale | Chiave | Derivazione indipendente e distinzione fisica |
|---|---|---|
| 01 | `+4 m` | Da `x(τ)=x₀+vτ`, la differenza fra due istanti separati da 2 s è `2m/s×2s`; x₀ si cancella. Coincide qui con distanza perché non vi sono inversioni. |
| 02 | `m` | `(L/T)T=L`. Soltanto il fattore velocità contiene una lunghezza; non si ottiene un'area. |
| 03 | È nulla | `d²(x₀+vτ)/dτ²=0`; in riferimento inerziale con massa costante, `ΣF=ma=0`. Peso e reazione possono essere non nulli e opposti: «tutte le singole forze assenti» non è condizione necessaria. |
| 04 | Raddoppia da `+4 m` a `+8 m` | Stesso intervallo positivo: velocità `+2→+4m/s`, quindi un solo raddoppio. Segno invariato; velocità diverse fra prove, costanti dentro ciascuna. |
| 05 | `+2 m/s` | `(+4m)/(2s)`; inversa simbolica con durata positiva, compatibile anche con spostamenti negativi in altri casi. |
| 06 | `2 s` | `(+4m)/(+2m/s)`; il rapporto di spostamento e velocità dello stesso segno dà durata positiva. |
| 07 | `2` | Velocità comune non nulla: `D₂/D₁=4s/2s=2`. Otto è il secondo spostamento, non il rapporto. |
| 08 | `18 km/h` | Conversione Pint esatta e controllo manuale `5×3600/1000=18`; fattore temporale al denominatore trattato nel verso corretto. Inversa `18×1000/3600=5m/s`. |
| 09 | `v=D/Δt` | Inversione della differenza di coordinate; `Δt>0` esclude divisione per zero e conserva il segno di D. Unità `L/T`. |
| 10 | `κ₁κ₂` | Integrale di velocità costante in ogni prova: entrambi i fattori velocità e durata intervengono alla prima potenza. La somma fallisce già quando entrambi sono uno. |
| 11 | `4` | Spostamenti `4 m` e `16 m`, rapporto quattro; non indica accelerazione all'interno delle prove. |
| 12 | `10 m` | Media `(4m+16m)/2`; prodotto delle medie degli ingressi `3m/s×3s=9m` è un altro calcolo. Pesi uguali dichiarati. |
| 13 | `2` | Per ottenere 16 m a 4 m/s servono 4 s; rapporto con i 2 s iniziali uguale a due. Un tempo quadruplo darebbe fattore totale otto. |
| 14 | `4 m/s` | Guadagno `12/(4m)=3m⁻¹`; lettura 48 dà `16m`, poi divisione per 4 s. Conteggi non scambiati direttamente con spostamento. |
| 15 | `4 m/s` | Dai riferimenti `g=24/(12m)=2m⁻¹`, offset uno. Lettura corretta `(17−1)/g=8m`, quindi velocità `8m/2s`. L'opzione 8 m/s salta la divisione finale. |
| 16 | `2 s` | Vincolo **fra condizioni di prove** `v=(1m/s²)T`, con v costante durante la prova di durata T. Integrando questa costante rispetto al tempo interno τ si ottiene `D=(1m/s²)T²`, non metà di tale valore. Per D=4 m, durata positiva T=2 s; v=2 m/s. |

## Figura e controprove

Figura riletta: nella seconda tappa le posizioni `0,2,4 m` hanno ascisse grafiche `100,260,420`, dunque scala 80 px/m e intervalli temporali uguali. x₀=0 è dichiarato come scelta del disegno, non condizione necessaria per D. Nel grafico v-tempo il rettangolo ha base 200 px per 2 s e altezza 120 px per 2 m/s: scale 100 px/s e 60 px per m/s; area fisica 4 m. Linea orizzontale e rettangolo, senza triangolo di accelerazione, coerenti con MRU.

L'oracolo ricava lo spostamento da differenze di coordinate e da integrali di velocità costante. Le inverse e le tarature sono risolte con SymPy; Pint controlla unità, 5 m/s→18 km/h e guadagni inversi di lunghezza. Il caso 16 usa due variabili diverse: durata selezionata T e tempo interno τ. Verificato in memoria che `∫₀ᵀ T dτ=T²`, mentre `∫₀ᵀ τ dτ=T²/2`: i due modelli non sono intercambiabili.

Controprove eseguite: 11 chiavi numeriche errate e ribindate per 01/05/06/07/08/11/12/13/14/15/16 sono rifiutate anche dall'oracolo indipendente, oltre che dalle firme. In 03, sostituire la chiave con assenza di tutte le forze è rifiutato dal controllo concettuale; unità sbagliata per una velocità rifiutata. È stato controllato anche moto uniforme negativo `v=−2m/s,T=2s→D=−4m`. Enunciato alterato e ribindato, sorgente azzerata, batch vuoto/parziale/duplicato sono stati rifiutati.

## Rilettura della presentazione 08

La prima edizione scientificamente letta era `4eb7d7c2`, digest pacchetto `15c7f5d1f426241c4c8759a8625aeceec8b5fa9e7812f649d5e571cef66a48ec`. Il browser dell'integratore ha poi individuato un overflow della sua lunga formula di conversione a 320 px. L'autore ha scomposto soltanto il quesito 08 in sette blocchi in `4c1f2370`; gli altri 15 record sono stati confrontati e risultano identici. Nessuna modifica di enunciato, opzioni, risposta, sorgente o figura.

Il revisore ha verificato che la vecchia firma rifiutasse prima la nuova presentazione, poi riletto ogni nuovo passaggio: `1h=3600s`; `d=(5m/s)(3600s)=18000m`; `d=(18000/1000)km=18km`; `v=18km/1h=18km/h`. Quantità, equivalenze e unità sono coerenti; il procedimento manuale già esaminato resta valido. Solo dopo questa lettura è stata aggiornata la firma 08 e rigenerato il rapporto: 16/16 PASS. Questa rilettura matematica non sostituisce la nuova esecuzione browser dell'integratore.

Limiti: non attesta rendering browser, importazione canonica, CI, merge o pubblicazione di questo lotto. Nessuna prova empirica con studenti o certificazione di accessibilità; queste non derivano automaticamente dall'aritmetica esatta. Le firme valgono solo per gli hash sopra. Stato: **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT**.
