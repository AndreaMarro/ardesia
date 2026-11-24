# Revisione indipendente AI — rest-accelerated-distance-015

24 novembre 2026. Revisore `/root/author_vectors_b`, distinto dall’autore
`/root/author_vectors_a` di questi 16 ID. Letti individualmente consegne, chiavi,
opzioni, blocchi, indizi, feedback e i due SVG. Sorgenti confrontate tramite Git,
nessun codice authoring importato. **16/16 PASS, nessun finding residuo.**
Stato DRAFT; approvazione umana NOT_RUN, nessuna promozione editoriale.

Edizione autore: `6e2e8bf1afb7f7c91d8060976f4f07c2348d4bbf`.
Sorgente immutabile `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`.
Gli hash di tutti gli originali e candidati sono stati confrontati; il verificatore
ripete il confronto sorgente da Git e conserva firme statiche per la sola edizione
letta. Nessuna scheda candidata è stata modificata dal revisore.

| Artefatto | SHA-256 |
| --- | --- |
| Pacchetto, JSON canonico | `6801de9a6c557fa3699ed5a7eac87f03c68495c5c4482958a7ea1b434f32b7ae` |
| Binding, JSON canonico | `8f1a9583132c054cba380d55f1b527f057c3894f2204314131771746c599cbd2` |
| SVG aree v–t | `fbe9b8792b63d2e904390be21c40db03a7dfb5aac7ed93c651ca3b1225ff04b4` |
| SVG parabola x–t | `d8841fec90f806c9697405619c9ae6078d752f66ef7449df264433312f174df9` |
| Verificatore | `d67a2f755eabd27e1f21e916e74fcd479357bbb3b6d10165bbddbbac7de026b1` |
| Contratto comune | `00211f6ea0ede79ed107463286ef85e78a0b885ce3f819d0158aae5ba4ed215a` |
| Rapporto scientifico, file | `e54629a06c79bc95ace49d8da9c6f411940b5b31440940aa65e1b58f7b9aa8b3` |
| Rapporto mutation test, file | `5854aaaf8d3784a20d5f3ae9011f99e8a90a9b92ed85a4fc8fb01a68033e83c6` |

## Soluzioni primarie e review per ID

Prefisso completo `AR-u2-rest-accelerated-distance-`. L’oracolo parte da a costante,
integra una prima volta con v(0)=0 e una seconda volta per ottenere lo spostamento:
v(τ)=aτ, D(t)=∫₀ᵗaτ dτ=at²/2. L’eventuale x₀ si cancella in x(t)−x₀. Nel dominio
a>0,t≥0 la velocità non diventa negativa e lo spostamento coincide con la distanza.
Questa coincidenza non viene estesa a moti con inversioni.

| ID | Chiave | Derivazione indipendente, ipotesi e distrattori |
| --- | --- | --- |
| 01 | 4 m | Integrale di v=2τ nei primi 2 s: 4 m. Nel grafico v–t è il triangolo di base 2 s e altezza 4m/s. Otto sarebbe il rettangolo con velocità finale mantenuta dall’inizio; la partenza da fermo richiede il fattore 1/2. |
| 02 | m | (L/T²)T²=L, con 1/2 adimensionale. m/s omette un fattore tempo; m/s² non moltiplica per t²; s e m² descrivono altre dimensioni. Il quadrato agisce anche sull’unità del tempo. |
| 03 | 3 m | Il primo metro in un secondo fissa a=2 m/s². Integrale ∫₁²2τ dτ=3m, equivalente a totale4 meno primo1. Quattro è il totale 0→2, uno imporrebbe percorrenze uguali, due perde il quadrato, otto supera persino il totale. L’intervallo richiesto non è quello dalla partenza. |
| 04 | Raddoppia da 4 a 8 m | t²/2 resta fisso; a raddoppia e D raddoppia. Il fattore 4 riguarderebbe il raddoppio del tempo; media invariata, dimezzata o nulla contraddice la dipendenza diretta da a>0. |
| 05 | 2 m/s² | D=at²/2 ⇒ a=2D/t²=8m/4s²=2m/s². a è lineare, quindi non serve radice. D/t darebbe casualmente numero2 ma unità m/s: controllo dimensionale distingue la falsa procedura. |
| 06 | 2 s | t²=2D/a=4s²: radice futura +2s, non −2s. Con a>0, D cresce strettamente per t>0; D=0 ammette t=0, D<0 sarebbe incompatibile. L’inversa usa radice perché qui l’incognita è il tempo. |
| 07 | 4 | Stessa a, durate 2 e 4 s: D=4 e16m, rapporto4. Due confronta tempi o finali, otto richiederebbe anche a doppia; tre è aumento relativo, non secondo/primo. Cinque non soddisfa il confronto. Alternative numericamente distinte. |
| 08 | Parabola verso l’alto, tangente iniziale orizzontale | Per a=4, x(t)=2t² in SI. x(0)=0, x′(0)=0, x″=4>0: ramo t≥0 con concavità verso l’alto. Retta crescente e orizzontale descriverebbero rispettivamente velocità costante e sosta; concavità opposta richiede accelerazione negativa; iperbole non rispetta origine né equazione. Il moto spaziale è ancora rettilineo. |
| 09 | a=2D/t² | Moltiplicare per 2 e dividere per t² non nullo. D/t² perde 2, 2D/t ha unità di velocità, la radice cambia dimensione senza invertire alcuna potenza di a. Dt²/2 moltiplica il fattore da eliminare. |
| 10 | κ₁κ₂² | Inserire entrambi i nuovi dati nell’integrale: a una volta, t due volte. Il fattore 1/2 si cancella nel rapporto. Le alternative con primo tempo, quadrato su a o tempo inverso cambiano legge; il 2 extra fallisce già all’identità. |
| 11 | 8 | D₁=4m, D₂=(1/2)4·4²=32m; rapporto8. Due tiene conto solo di a; quattro tratta t linearmente; 32 è una lunghezza finale, non un rapporto. Nessuna inversione di moto richiede moduli aggiuntivi. |
| 12 | 18 m | Media con uguale peso di 4 e32: 2+16=18m. Trentasei omette la divisione, nove la ripete; 17 e19 sono scarti arbitrari. Gli ingressi medi darebbero (1/2)3·3²=27/2m, operazione diversa per una legge quadratica. |
| 13 | 2 | Obiettivo D₂=32m ad a₂=4: t₂²=64/4=16s², futuro t₂=4s, rapporto con 2s uguale2. −4s escluso. L’uscita cresce di8, composto da fattore2 di a e4 di t². |
| 14 | 4 m/s² | g=12/(4m)=3m⁻¹;96 tacche danno D=32m. Poi a=2D/t²=64/16=4m/s². Guadagno rimosso prima dell’inversa; tacche scambiate per metri darebbero un’accelerazione tripla. Controllo completo restituisce96. |
| 15 | 4 m/s² | Riferimenti D=4,32m: g=56/28=2m⁻¹, offset1. D ignoto=(17−1)/g=8m, quindi a=2·8/2²=4m/s². Otto copia il numero dello spostamento, due riusa un riferimento; a=3,5 ricostruirebbero13,21 tacche invece di17. |
| 16 | 2 s | La durata totale T seleziona a=κT con κ=1m/s³; durante la prova questa a è costante. Nel tempo interno τ, v=κTτ e D=κT³/2. D=4m impone T³=8s³, unico T positivo2s e a=2m/s². T=1,3,4 dà 1/2,27/2,32m; −2 viola il dominio. Non è il modello a(τ)=κτ. |

## Due asset, due rappresentazioni distinte

Nel grafico v–t con a=2 m/s² le tre tappe usano la stessa scala 120px/s e
60px/(m/s). A due secondi l’altezza240px rappresenta4m/s e la base240px rappresenta2s:
area fisica4m. Nel terzo pannello il triangolo 0→1 ha area1m e il trapezio1→2
area3m. Il fatto che la retta sembri a45° in pixel non viene usato come misura
fisica dell’accelerazione senza scale.

Il secondo SVG è dedicato all’ID08 con a=4 m/s², scale120px/s e25px/m. Nei pannelli
centrale e finale, t=1 si trova a xSVG=220 e posizione2m, mentre t=2 a xSVG=340 e
posizione8m. La Bézier quadratica ha controllo a metà dell’intervallo orizzontale
e alla quota iniziale: xSVG è lineare nel parametro e ySVG quadratico. Per esempio
M100,700 Q220,700 340,500 dà ySVG=700−200u² e t=2u, esattamente xFisica=2t².
Non è una curva arbitraria che passa solo per gli estremi. La tangente iniziale è
orizzontale; gli incrementi di2m e6m negli intervalli uguali sono corretti. La
figura non è presentata come traiettoria spaziale curva.

## Oracolo e 22 controprove

SymPy verifica entrambe le integrazioni, condizioni iniziali, derivate, inverse
con dominio positivo, intervallo1→2s, rapporto generale dei fattori e taratura.
Pint esatto controlla metri da accelerazione per tempo al quadrato, guadagno m⁻¹ e
la dimensione s³ del vincolo16.

Il caso16 distingue espressamente il tempo interno τ dalla durata selezionata T:

- accelerazione costante nella prova a=κT ⇒ D=κT³/2;
- diverso modello con accelerazione variabile a(τ)=κτ ⇒ D=κT³/6.

L’oracolo calcola entrambe le espressioni per non confonderle; il vincolo del testo
richiede la prima, senza jerk durante la singola prova.

Le 22 mutazioni eseguite con `mutation_audit()` includono tutte le 16 chiavi errate
ribindate e con tutti i token d’edizione deliberatamente sostituiti nel contesto
di test: l’oracolo rifiuta ciascuna. Chiavi corrette con falsa prova del rettangolo
at² invece del triangolo at²/2 e falsa deduzione di traiettoria spaziale parabolica
da x–t sono rifiutate dalle firme della lettura. Lotti vuoto, parziale, duplicato
e SHA sorgente modificata sono rifiutati. Le firme sono ripristinate dopo i test;
nessuna nuova edizione è auto-firmata.

Limiti: non attesta importazione canonica, browser, CI, merge, uso con studenti o
accessibilità reale. Registro e checkpoint non sono modificati da questa review.
I contenuti rimangono DRAFT e la fase umana NOT_RUN.
