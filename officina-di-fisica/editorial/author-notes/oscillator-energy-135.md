# oscillator-energy-135 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-01.json. Letti individualmente tutti gli 80 originali assegnati 135–139 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L04 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I casi di smorzamento, fase accumulata e potenza normalizzata sono mantenuti distinti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — L’energia si legge a un estremo

A un estremo x=A la velocità si annulla, quindi tutta l’energia meccanica è elastica. Il lavoro per deformare la molla da zero ad A è l’area del triangolo sotto kx: kA²/2. Il quadrato di due è quattro; moltiplicare per due e dividere per due dà quattro joule. Durante il moto E rimane la stessa, benché cambi la sua ripartizione.

Passaggi: `E=\frac12m\dot x^2+\frac12kx^2\qquad x=A\qquad \dot x=0\qquad E=\frac12kA^2\qquad E=4\,\mathrm J`

Errori e controllo: Otto omette il mezzo dell’area triangolare. Due segue l’ampiezza anziché il suo quadrato. Al centro l’energia elastica è zero, ma quella cinetica vale quattro J: la totale non si annulla.

## 02 — L’unità dell’energia di oscillazione

Moltiplicare N/m per m² lascia N·m. Un joule è il prodotto di un newton per un metro; il mezzo è adimensionale. L’energia non è una forza né un’energia trasferita per secondo.

Passaggi: `[kA^2]=\mathrm{N/m}\,\mathrm{m^2}\qquad [E]=\mathrm{N\,m}\qquad [E]=\mathrm J`

Errori e controllo: N misura una forza, N/m la costante elastica, m/s una velocità e W una potenza. Le unità distinguono l’energia dalla forza massima kA.

## 03 — Una molla reale con smorzamento debole

Qui il modello include attrito e va distinto dall’oscillatore ideale conservativo. Il lavoro della forza dissipativa sull’intervallo di moto è negativo: diminuisce la somma di energia cinetica e potenziale. Ai punti di inversione la velocità è nulla e l’energia meccanica è kA_n²/2; ampiezze successive minori indicano energie minori. L’energia si ritrova come energia interna se si include l’ambiente nel bilancio.

Passaggi: `\Delta E_{\rm mecc}=W_{\rm attr}<0\qquad E_n=\frac12kA_n^2\qquad A_{n+1}<A_n\qquad E_{n+1}<E_n`

Errori e controllo: L’energia complessiva non scompare. La conservazione di E_mecc vale solo quando il lavoro dissipativo è nullo. Un attrito passivo non alimenta i cicli; la variazione del periodo non sostituisce il bilancio di energia. La formula ai punti di inversione non è una pretesa legge esatta dell’inviluppo a ogni istante.

## 04 — Stessa ampiezza con una molla meno rigida

A ampiezza uguale resta identico A²/2, pari a due m². Dimezzare k dimezza quindi l’energia totale: da quattro a due J. Il periodo può cambiare, ma non entra nella valutazione energetica all’estremo.

Passaggi: `E_A=4\,\mathrm J\qquad E_B=\frac{k_B}{k_A}E_A\qquad E_B=2\,\mathrm J`

Errori e controllo: Otto inverte la dipendenza da k; uno applica il dimezzamento due volte. Quattro ignora la nuova rigidità e zero contraddice k e A positivi.

## 05 — Ricavare k da un’energia e un’ampiezza

Da E=kA²/2 si ricava k=2E/A². Il numeratore è otto J e il denominatore quattro m²: due J/m², equivalenti a due N/m. La divisione usa il quadrato dell’ampiezza, non la lunghezza del percorso fra gli estremi.

Passaggi: `k=\frac{2E}{A^2}\qquad k=\frac84\,\mathrm{J/m^2}\qquad k=2\,\mathrm{N/m}`

Errori e controllo: Uno omette il due nell’inversa. Usare 2A come ampiezza quadruplicherebbe il denominatore e ridurrebbe di quattro volte la rigidità inferita.

## 06 — La radice fisica dell’ampiezza

L’ampiezza soddisfa A²=2E/k. Otto J diviso due N/m dà quattro m². La radice positiva è due m; il segno negativo potrebbe descrivere una coordinata x, ma non il modulo massimo A definito nel prompt.

Passaggi: `A^2=\frac{2E}{k}\qquad A^2=4\,\mathrm{m^2}\qquad A=2\,\mathrm m`

Errori e controllo: Quattro è il numero del quadrato dell’ampiezza. La distanza fra i due estremi è quattro m, mentre l’ampiezza dall’equilibrio è due m. Non servono decimali né la massa per questa inversa.

## 07 — Ampiezza doppia, stessa molla

L’energia segue A². Il raddoppio dell’ampiezza moltiplica per quattro il quadrato: l’energia passa da quattro a sedici J. La forza massima kA invece raddoppierebbe soltanto, perché contiene una sola potenza di A.

Passaggi: `E_A=4\,\mathrm J\qquad E_B=16\,\mathrm J\qquad E_B/E_A=\left(\frac42\right)^2\qquad E_B/E_A=4`

Errori e controllo: Due segue una lunghezza o la forza massima; un mezzo e un quarto invertono i confronti. Uno ignora l’ampiezza maggiore.

## 08 — Lo scarto di un mezzo dimenticato

L’energia corretta è quattro J, metà di kA². La proposta otto supera quel valore di quattro J. Il segno positivo indica una sovrastima dell’energia, non il verso della forza elastica.

Passaggi: `E=4\,\mathrm J\qquad e=(8-4)\,\mathrm J\qquad e=4\,\mathrm J`

Errori e controllo: Meno quattro rovescia la differenza; otto copia la proposta, zero la accetta e due dimezza ancora lo scarto.

## 09 — L’inversa simbolica della rigidità

Moltiplichiamo il bilancio per due e dividiamo per A², positivo. Energia su area ha unità J/m²=N/m. L’inversa deve mantenere il quadrato dell’ampiezza: è esso che riassume l’area sotto la forza elastica lineare.

Passaggi: `2E=kA^2\qquad k=\frac{2E}{A^2}\qquad [k]=\mathrm{J/m^2}\qquad [k]=\mathrm{N/m}`

Errori e controllo: E/(2A²) è quattro volte più piccolo della rigidità corretta. Moltiplicare per A² dà J·m², il reciproco ha dimensioni inverse di k e dividere per A soltanto dà una forza.

## 10 — Due variazioni nell’energia

La rigidità fornisce il fattore κ₁. L’ampiezza è elevata al quadrato, quindi fornisce κ₂². Il mezzo si cancella nel rapporto e rimane il prodotto κ₁κ₂². Si confrontano due oscillatori ideali, non una perdita di energia nel tempo.

Passaggi: `\frac{E_B}{E_A}=\frac{\kappa_1k_A(\kappa_2A_A)^2}{k_AA_A^2}\qquad E_B/E_A=\kappa_1\kappa_2^2`

Errori e controllo: Una sola potenza di κ₂ segue la forza massima anziché l’energia. I quozienti invertono una dipendenza diretta e κ₁² attribuisce alla rigidità un quadrato assente.

## 11 — Molla più rigida e ampiezza maggiore

A ha energia quattro J. B ha energia quattro per nove diviso due, diciotto J. Il rapporto diciotto su quattro si riduce a nove mezzi: il raddoppio della rigidità si combina con il quadrato di tre mezzi, variazione dell’ampiezza.

Passaggi: `E_A=4\,\mathrm J\qquad E_B=18\,\mathrm J\qquad E_B/E_A=\frac{18}{4}=\frac92`

Errori e controllo: Due segue solo k e nove quarti solo A². Due noni è il reciproco; diciotto è il valore finale in J, non il rapporto adimensionale.

## 12 — Media di due energie totali

Le energie sono quattro e diciotto J. La somma ventidue divisa per due dà undici J. Gli ingressi medi k=3 N/m e A=5/2 m darebbero 75/8 J, inferiore di 13/8 J: il prodotto kA² non commuta con la media.

Passaggi: `\overline E=\frac{4+18}{2}\,\mathrm J\qquad \overline E=11\,\mathrm J`

Errori e controllo: Ventidue è la somma, undici mezzi dimezza ancora e quattordici è la differenza. 75/8 appartiene a un altro oscillatore, costruito sugli ingressi medi.

## 13 — L’ampiezza per il fattore bersaglio

Il raddoppio di k fornisce un fattore due. Il quadrato del rapporto delle ampiezze deve quindi essere nove quarti. La radice positiva è tre mezzi e A_B=3 m. Il ramo negativo non è un rapporto di ampiezze positive.

Passaggi: `\frac92=2\left(\frac{A_B}{A_A}\right)^2\qquad \left(\frac{A_B}{A_A}\right)^2=\frac94\qquad A_B/A_A=\frac32`

Errori e controllo: Nove quarti è il quadrato del rapporto; due terzi lo inverte. Nove mezzi copia il bersaglio e tre è il numero di metri finale.

## 14 — Un display dell’energia senza offset

Il riferimento ha quattro J e fissa q=3 J⁻¹. La lettura cinquantaquattro corrisponde a diciotto J. L’inversa k=2E/A² dà trentasei su nove, quattro N/m. La lettura non misura direttamente la rigidità.

Passaggi: `q=3\,\mathrm{J^{-1}}\qquad E_B=18\,\mathrm J\qquad k_B=\frac{2E_B}{A_B^2}\qquad k_B=4\,\mathrm{N/m}`

Errori e controllo: Usare S=54 come joule darebbe k=12 N/m. Anche con display proporzionale occorre tener conto dell’ampiezza diversa prima di inferire k.

## 15 — Togliere l’offset e poi trovare k

I riferimenti hanno E=4 e 18 J. La differenza ventotto delle letture divisa per quattordici J dà q=2 J⁻¹, poi z=1. In C la lettura due significa energia un mezzo J. Con ampiezza un metro, k=2E/A² vale un N/m.

Passaggi: `q=2\,\mathrm{J^{-1}}\qquad z=1\qquad E_C=\frac12\,\mathrm J\qquad k_C=1\,\mathrm{N/m}`

Errori e controllo: Con A=1 m, le rigidità 2,4,8,1/2 N/m darebbero letture 3,5,9,3/2. Solo un N/m restituisce due. L’offset non è una parte dell’energia elastica.

## 16 — Un vincolo fra rigidità e ampiezza

Il coefficiente ha unità rigidità su lunghezza. Sostituendo k=cA si ottiene E=cA³/2: l’energia rende cubica l’inversa. Otto J diviso un N/m² dà otto m³; la radice cubica positiva è due m, e k=2 N/m.

Passaggi: `E=\frac12cA^3\qquad A^3=\frac{2E}{c}\qquad A^3=8\,\mathrm{m^3}\qquad A=2\,\mathrm m\qquad k=2\,\mathrm{N/m}`

Errori e controllo: Otto è il numero del cubo, non l’ampiezza. La cubica è crescente per A>0 e determina una sola ampiezza. Il vincolo confronta prove con rigidità differenti, senza cambiare k durante una stessa oscillazione ideale.
