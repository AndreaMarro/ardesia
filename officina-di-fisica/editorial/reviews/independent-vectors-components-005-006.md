# Riesame indipendente · componenti e prodotto scalare

Revisore AI: integratore, distinto dall’autore A dei candidati. Letti integralmente
i16 sorgenti vector-perpendicular e i16 scalar-product da Git5cfbdcb, quindi i32
candidati, le spiegazioni, i distrattori e gli SVG. Le chiavi del sorgente non sono
l’oracolo. I verificatori non importano l’authoring; calcolano norme e prodotti
da coordinate e risolvono inverse e tarature con SymPy, usando unità Pint.

| Perpendicular ID | Risoluzione e controprova |
|---|---|
| 01 | Norma(3,4)=√25=5 m. Fra ciascun cateto e la spezzata7 m. |
| 02 | Quadrati L² e radice L; non conservare m² dopo la radice. |
| 03 | Dot del vettore con sé=a²+b²; radice positiva per il modulo. L’ortogonalità è dichiarata. |
| 04 | Norma(16/3,4)=√[(256+144)/9]=20/3 m>5 m. |
| 05 | a²=25−16=9; a=+3 m, ramo positivo richiesto. |
| 06 | Cammino3+4=7 m; diagonale5 m; eccesso2 m. |
| 07 | Norma(3,9/4)=√(225/16)=15/4 m; rapporto3/4. |
| 08 | Proposto−corretto=10−5=+5 m; il confronto non usa il cammino. |
| 09 | a=√(R²−b²) con R>b>0; radice negativa esclusa dal dominio. |
| 10 | Norma(κ₁a,κ₂b)/norma(a,b): entrambi i fattori sono al quadrato sotto radice. κ comune dà rapportoκ. |
| 11 | Norma(8,6)=10 m; rapporto2. Scambiare i cateti prima di raddoppiarli conserva la norma. |
| 12 | Media(5+10)/2=15/2 m. Norma delle componenti medie=√221/2 m:221≠225 dimostra la differenza senza approssimazioni. |
| 13 | R₂=10 m; b₂=√(100−64)=6 m; rapporto6/4=3/2. |
| 14 | g=15/5=3 m⁻¹; R=30/3=10 m; a=√(100−36)=8 m. |
| 15 | g=(21−11)/(10−5)=2 m⁻¹,c=1; R=(43/3−1)/2=20/3 m; a=√(256/9)=16/3 m. |
| 16 | a=3b/4⇒R²=25b²/16; b>0⇒b=4R/5=4 m. |

| Scalar ID | Risoluzione e controprova |
|---|---|
| 01 | Coordinate(2,0)·(2,0)=4; somma uguale per coincidenza, smentita da moduli2 e3. |
| 02 | Vettori dichiarati adimensionali⇒prodotto adimensionale. Uno scalare può avere unità in altri contesti. |
| 03 | Coordinate(a,0)·(0,b)=0 anche con a,b>0; risultato scalare, non prodotto vettoriale. |
| 04 | Prodotti4 e8: raddoppio di un solo fattore, orientamento invariato. |
| 05 | a=4/2=2; una sottrazione coinciderebbe qui accidentalmente, non con S=6,b=2. |
| 06 | ab=6 ammette(1,6),(2,3) e ogni(a,6/a), a>0. Le somme7 e5 confutano anche una somma fissata. |
| 07 | (2·4)/(2·2)=2; non cambiano entrambi i fattori. |
| 08 | 8−4=+4, adimensionale; il rapporto2 non è lo scarto. |
| 09 | Dividere per b>0⇒a=S/b; la sostituzione restituisce S. |
| 10 | Le coordinate scalate produconoκ₁κ₂ab; rapportoκ₁κ₂. Conκ₁=κ₂=2 si ottiene4. |
| 11 | 16/4=4, due raddoppi moltiplicati. |
| 12 | Media dei prodotti(4+16)/2=10; prodotto delle medie3·3=9. |
| 13 | Prodotto obiettivo16, a₂=4⇒b₂=4; fattore2. |
| 14 | g=12/4=3; S=48/3=16; a=16/4=4. |
| 15 | g=24/12=2,c=1; S=(17−1)/2=8; a=8/2=4. |
| 16 | a=b>0⇒b²=4⇒b=2, unica radice compatibile con un modulo positivo. |

Figure: il triangolo perpendicolare ha cateti180 e240px e diagonale300px, stessa
scala60px/m nei tre pannelli. Il diagramma del prodotto scalare proietta B sul
medesimo asse di A; la didascalia chiarisce che l’angolo obliquo è schematico e
non sostituisce gli angoli assegnati nei quesiti. Sono esaminati0°,90° e180°.

I test generativi controllano limiti, simmetria e scala della norma; le controprove
alterano chiavi numeriche e alternative, ricalcolano binding e perfino token di
lettura, e richiedono comunque il rifiuto matematico. Le firme sono congelate
sui candidati letti, non rigenerate per sanare un risultato errato. Importazione e
rendering sono evidenze separate. Nessuna firma umana: DRAFT/humanApproval NOT_RUN.
