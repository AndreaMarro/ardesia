# Circuiti e condensatori

## SIM-C4-L06-01 · Resistenze in serie e in parallelo

Segui i conduttori a partire dai due morsetti. In parallelo i rami collegano gli stessi nodi: hanno quindi la stessa tensione e le correnti dei due rami si sommano. In serie il percorso è unico: la stessa corrente attraversa entrambe le resistenze e si sommano le cadute di tensione.

\[
\frac{1}{R_\mathrm{par}}=\frac{1}{4\ \mathrm{\Omega}}+\frac{1}{R_2},\qquad R_\mathrm{ser}=4\ \mathrm{\Omega}+R_2
\]

Con due resistenze uguali da 4 Ω, ciascun ramo porta la stessa corrente. La corrente totale è doppia e la resistenza equivalente è 2 Ω. Con 4 Ω e 12 Ω, usa un denominatore comune: 1/4 + 1/12 = 3/12 + 1/12 = 1/3, con unità Ω⁻¹. Invertendo trovi 3 Ω.

Il parallelo offre un secondo percorso e presenta una resistenza inferiore a 4 Ω. La serie darebbe invece 8 Ω o 16 Ω. Se misuri 3 Ω a generatore scollegato, sottrai 1/4 da 1/3: rimane 1/12 Ω⁻¹ per il secondo ramo, quindi 12 Ω.

## SIM-C4-L06-02 · Potenza elettrica ed effetto Joule

Un ampere porta un coulomb al secondo. La tensione del resistore misura l’energia ceduta per ogni coulomb. Il loro prodotto dice quanta energia viene trasferita ogni secondo. Per questo si usa prima P = VI e poi la legge di Ohm per sostituire V, dato che il resistore del banco è ohmico.

\[
P=VI=(RI)I=RI^2,\qquad R=3\ \mathrm{\Omega}
\]

Con 1 A, calcola 3 × 1² = 3 W. Con 3 A, fai prima il quadrato: 3² = 9. Il prodotto 3 × 9 dà 27 W. Le unità V·A sono J/s, cioè watt.

Partendo da 27 W, dividi per 3 Ω: I² = 9 A². La corrente impostata è non negativa, quindi I = 3 A. Moltiplicare la corrente per tre moltiplica per nove la potenza. L’energia dissipata in un tempo più lungo richiederebbe anche la durata.

## SIM-C4-L07-01 · Capacità elettrica e condensatore piano

Nel modello di piastre piane nel vuoto le armature sono parallele e il campo nella zona interna è uniforme. Trascuriamo gli effetti ai bordi. In queste condizioni, a parità di carica, una distanza doppia raddoppia la tensione tra le piastre. Poiché C = Q/V, la capacità si dimezza.

\[
C=\frac{\varepsilon_0 A}{d},\qquad A=10^{-2}\ \mathrm{m^2},\quad \varepsilon_0\simeq 8{,}854\times10^{-12}\ \mathrm{F/m}
\]

Per usare la distanza numerica in mm scrivi d = d_mm × 10⁻³ m. Convertendo da farad a picofarad compare il fattore 10¹². Rimane quindi 8,854 × 10⁻² / 10⁻³ = 88,54 al numeratore, da dividere per d_mm. Le unità (F/m)·m²/m si riducono a F prima della conversione.

\[
C[\mathrm{pF}]\simeq\frac{88{,}54}{d[\mathrm{mm}]}
\]

Per 2 mm dimezza 88,54 e ottieni 44,27 pF. Per 4 mm dimezza ancora: 22,135 pF. Sono conti esatti con il valore di ε₀ fornito, che è arrotondato. Se l’interfaccia arrotonda ulteriormente la lettura, conserva 22,135 nel procedimento. Inversamente, 88,54 diviso 44,27 restituisce 2 mm nel modello.

## SIM-C4-L07-02 · Effetto del dielettrico

Il dielettrico riempie tutto lo spazio tra le piastre. La batteria resta collegata, quindi fissa la tensione ai morsetti. Quando la capacità cresce, il generatore trasferisce più carica alle armature per rispettare la stessa tensione.

\[
C=\varepsilon_r C_0,\qquad Q=CV,\qquad C_0=1\ \mathrm{nF},\quad V=2\ \mathrm V
\]

Per εᵣ = 2, la capacità diventa 2 nF e 2 × 2 dà 4 nC su un’armatura in modulo. Per εᵣ = 5, ottieni 5 nF e 5 × 2 = 10 nC. Il prefisso nano resta perché F·V è C.

Una lettura di 10 nC permette di risalire alla capacità: 10÷2 = 5 nF. Dividendo per 1 nF si ritrova il rapporto adimensionale 5. L’altra armatura porta una carica opposta. Con la batteria scollegata la carica fissata condurrebbe a un ragionamento diverso.

## SIM-C4-L07-03 · Energia immagazzinata

Caricando un condensatore lineare, la tensione cresce in proporzione alla carica da zero al suo valore finale. Nel grafico con la carica in orizzontale e la tensione in verticale, il lavoro accumulato è l’area sotto quella retta. Si legge come un triangolo di base Q e altezza V.

\[
U=\frac{QV}{2}=\frac{CV^2}{2},\qquad C=2\ \mathrm{\mu F}
\]

Il 2 della capacità si semplifica con il 2 al denominatore. In microjoule resta il quadrato del numero di volt. Con 2 V vale 2² = 4 µJ. Con 5 V vale 5² = 25 µJ. Le unità F·V² sono C·V, cioè joule, e il prefisso micro passa al risultato.

Se la lettura è 25 µJ, la tensione non negativa impostata nel banco è 5 V. Raddoppiare la tensione porta a quattro volte l’energia accumulata. Il valore riguarda il condensatore appena caricato, prima della sua eventuale scarica.

## SIM-C4-L08-01 · Condensatori in serie e in parallelo

In serie le piastre interne appartengono a un conduttore intermedio isolato, inizialmente neutro. Sulle due capacità compare lo stesso modulo di carica. Segui il circuito fra i morsetti esterni: le due tensioni si sommano perché ciascuna è Q diviso la propria capacità.

\[
\frac{1}{C_\mathrm{ser}}=\frac{1}{2\ \mathrm{\mu F}}+\frac{1}{C_2},\qquad C_\mathrm{par}=2\ \mathrm{\mu F}+C_2
\]

Con due capacità da 2 µF la somma dei reciproci è 1/2 + 1/2 = 1, in µF⁻¹. Quindi C_serie vale 1 µF. Con 2 e 6 µF, 1/2 + 1/6 = 3/6 + 1/6 = 2/3. Invertendo ottieni 3/2 µF, cioè 1,5 µF.

I valori in serie sono minori di 2 µF. In parallelo, a tensione comune, si sommano le cariche e le capacità diventano 4 o 8 µF. Da 1,5 µF in serie ricavi il secondo valore sottraendo 1/2 da 2/3: rimane 1/6 µF⁻¹, quindi 6 µF.

## SIM-C4-L08-02 · Conservazione di carica nei collegamenti

Prima del collegamento il secondo condensatore è scarico. Unisci i morsetti omologhi e lascia il gruppo isolato dall’esterno. La carica sulle armature collegate a un nodo si conserva, mentre si ridistribuisce fra i due condensatori. All’equilibrio entrambi vedono la stessa tensione.

\[
Q_\mathrm{iniz}=(C_1+C_2)V_\mathrm f,\qquad V_\mathrm f=\frac{Q_\mathrm{iniz}}{1\ \mathrm{\mu F}+2\ \mathrm{\mu F}}
\]

Somma prima 1 e 2 µF: ottieni 3 µF. Con 3 µC iniziali, 3÷3 dà 1 V. Con 9 µC, 9÷3 dà 3 V. Il prefisso micro si cancella nella divisione e C/F è V.

Usa il valore finale per controllare il bilancio. A 3 V, le due capacità portano rispettivamente 3 µC e 6 µC sul nodo considerato. La somma restituisce 9 µC. Il condensatore da 2 µF accoglie il doppio della carica perché la tensione è comune.
