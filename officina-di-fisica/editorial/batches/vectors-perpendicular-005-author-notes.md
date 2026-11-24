# Note dell’autore · perpendicular-005

Letti individualmente i 16 sorgenti `u1-vector-perpendicular-01` … `16` di
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json`
alla SHA `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`: prompt, alternative,
risposta e passaggi specifici. L’ID 06 conserva il confronto tra cammino e modulo.
I binding legano ogni candidato ai byte canonici della fonte e agli asset usati.

Queste sono note di calcolo dell’autore da confutare indipendentemente. Non
sono un verificatore scientifico, una firma reviewer o un PASS scientifico.
Stato di tutti i candidati: DRAFT; review indipendente NOT_RUN; umana NOT_RUN.

| ID finale | Calcolo proposto e punto da esaminare |
|---|---|
| 01 | √(3²+4²)=√25=5 m; i quadrati portano m² e la radice restituisce m. |
| 02 | √L²=L; non basta osservare il numero sotto radice. |
| 03 | R²=a²+b² e radice positiva: l’ortogonalità è parte del dato. |
| 04 | a₂=16/3 m, b=4 m ⇒ R₂²=(256+144)/9 m² ⇒ R₂=20/3 m>5 m. |
| 05 | a²=R²−b²=25−16=9 m²; a=3 m con R>b>0 e a>0. |
| 06 | Cammino 7 m, modulo 5 m, eccesso 2 m; figura mostra entrambe le lunghezze. |
| 07 | 9+81/16=225/16; R₂=15/4 m; R₂/R₁=(15/4)/5=3/4. |
| 08 | Scarto definito proposto meno corretto: 10−5=+5 m. |
| 09 | a=√(R²−b²), a>0 e R>b; a=0 e R<b discussi come casi esclusi. |
| 10 | Fattori al quadrato dentro il radicando; rapporto delle radici, non dei quadrati. |
| 11 | R₂=√(64+36)=10 m, R₁=5 m; rapporto 2 nonostante le componenti non scalino entrambe dello stesso fattore per asse. |
| 12 | Media 15/2 m. Modulo delle medie: √[(11/2)²+5²]=√221/2 m, differente. |
| 13 | Obiettivo R₂=10 m>a₂=8 m; b₂=√36=6 m; rapporto b₂/b₁=3/2, scelta esatta. |
| 14 | T puro e g=3 m⁻¹; T=30 ⇒ R=10 m; a=√(100−36)=8 m. |
| 15 | R riferimenti 5 e 10 m; g=2 m⁻¹,c=1. R_C=(43/3−1)/2=20/3 m; a²=(400−144)/9=256/9 m²; a=16/3 m. |
| 16 | a=3b/4 ⇒ R²=25b²/16; con b>0, R=5b/4 ⇒ b=4 m e a=3 m. |

Le risposte razionali non intere sono scelte con valori esatti, perché il grader
numerico canonico non valuta espressioni simboliche. Non sono introdotti float
approssimati né un nuovo grader. L’assemblatore usa soltanto gli helper canonici
per blocchi e digest; non importa alcun verificatore di risposta.

L’SVG originale usa scala identica nei tre pannelli: 60 unità SVG per metro,
cateti 180 e 240 e diagonale 300. Una prima ispezione della miniatura Quick Look
ha trovato un accavallamento fra etichetta e confronto finale e frecce mancanti
sui primi sottopercorsi: corretti separando i path e spostando le righe. Seconda
ispezione eseguita sulla figura corretta. La verifica sul lettore a 320 px resta
compito dell’integratore e non è sostituita dalla miniatura.

Controllo tecnico: importatore canonico in SQLite temporaneo, 16 bozze al primo
import, zero revisioni nuove e 16 invariate al secondo; nessun nuovo ID live;
byte dei 991 materiali pubblicati invariati. Binding candidati ricalcolati dopo
l’ultima modifica di prompt e figura. Nessuna promozione o pubblicazione.

Riproduzione: `python -m tools.corpus_engineering.vector_perpendicular_authoring`
con `--repo .. --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`
e `--destination editorial/batches`, dalla directory Officina.

Prossimi passi: review scientifica indipendente per ID e per byte; verifica del
lettore e dell’asset; integrazione tramite gli strumenti canonici; mantenimento
dello stato umano NOT_RUN finché non esiste una valutazione effettiva.
