# identical-series-resistors-209 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json. Raw SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Letti tutti 80 prompt B205–209 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 c34e8c211bd2739336e24df94807e9856faba28e6b06bca044c0e9b76046f43b.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, commit 69e39c380719fec652d6dff1d3d5888be59b8f62. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A200–204 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L05 contiene prima e seconda legge di Ohm e resistività; C4-L06 contiene topologia di serie/parallelo, nodi, cadute e correnti. Rilette integralmente dal catalogo Cric storico, senza importare una competenza inventata.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/identical-series-resistors-209-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Primo circuito esattamente tre simboli da2 Ω, secondo esattamente quattro da3 Ω; nodi intermedi senza derivazioni. Dimensioni dei simboli schematiche e non scala resistiva. Barre6/12/9 Ω lunghe180/360/270 dal comune x150, scala30 unità intrinseche/Ω. Non è disegnata una catena con conteggio frazionario; il valore7/2 è soltanto media statistica dei conteggi e non ingresso ammissibile del modello. Le scalature consentono fattori razionali soltanto se il conteggio finale resta intero positivo.

## 01 — Tre elementi, la stessa corrente

La stessa corrente I attraversa ognuno dei tre resistori. Ogni caduta è Ir e la tensione totale è3Ir: R=3r=6 Ω. Il conteggio N è puro; moltiplicarlo per una resistenza conserva gli ohm.

Passaggi: `V=NIr\qquad R=Nr\qquad R=3\cdot2\,\Omega\qquad R=6\,\Omega`

Distrattori: 2/3 Ω metterebbe i tre elementi in parallelo; cinque Ω sommerebbe impropriamente il numero puro3 ai2 Ω. Due Ω tiene un solo elemento e dodici Ω raddoppia ancora il totale.

## 02 — L’unità di una somma ripetuta

La resistenza totale è la somma di N resistenze in ohm. Il numero N non porta un’unità, quindi R=Nr resta in ohm. Si può contare un elemento, ma non si attribuisce al conteggio l’unità ampere o volt.

Passaggi: `[N]=1\qquad [R]=[N][r]\qquad [R]=\Omega`

Distrattori: A corrente,V tensione e S conduttanza sono altre grandezze. Uno è l’unità del conteggioN, non della resistenza della catena.

## 03 — La legge della catena senza derivazioni

Le cadute di tensione di N elementi identici, attraversati dalla stessa corrente, si sommano: V=NIr. Confrontando con V=IR si ottiene R=Nr. Non si richiede che N sia grande, ma che sia un conteggio intero positivo.

Passaggi: `V=\sum_{j=1}^{N}Ir\qquad V=NIr\qquad R=Nr`

Distrattori: r/N è il parallelo di N elementi uguali. N/r è una conduttanza; r+N somma grandezze non omogenee. N²r aggiunge un secondo fattoreN che non nasce dalla somma delle cadute.

## 04 — Cambia il valore di ciascun elemento

Il numero di addendi resta tre. A vale3·2=6 Ω; B vale3·5=15 Ω. Il fattore5/2 di r moltiplica l’intera catena perché cambia ciascuno degli elementi identici.

Passaggi: `R_A=6\,\Omega\qquad R_B=3\cdot5\,\Omega\qquad R_B=15\,\Omega`

Distrattori: Cinque Ω è un solo elemento di B. Dieci Ω ne conterebbe due anziché tre. Sei ignora il cambio;75/2 Ω moltiplica6 Ω per(5/2)², introducendo un quadrato non presente.

## 05 — Il valore di un elemento dalla catena

Gli elementi sono identici, quindi la resistenza totale è ripartita in tre addendi uguali. r=R/N=6/3=2 Ω. La divisione perN è lecita perché il conteggio non è zero.

Passaggi: `r=\frac RN\qquad r=\frac63\,\Omega\qquad r=2\,\Omega`

Distrattori: Diciotto Ω moltiplica perN invece di dividere; sei Ω attribuisce a ogni elemento il valore dell’intera catena. Un mezzo Ω è il reciproco del valore numerico ma non soddisfa la misura.

## 06 — Un’inversa deve restituire un intero

Dall’equazione R=Nr si trova N=R/r=6/2=3. Il risultato è un intero positivo, come deve essere un numero di resistori. In generale, se R/r non fosse un intero positivo, non esisterebbe una catena esatta con quel valore assegnato di r.

Passaggi: `N=\frac Rr\qquad N=\frac{6\,\Omega}{2\,\Omega}\qquad N=3\qquad N\in\mathbb N_{>0}`

Distrattori: Tre ohm darebbe un’unità al conteggio puro. Dodici moltiplica i valori; un terzo inverte il rapporto e non è un conteggio. Zero elementi non appartiene al dominio.

## 07 — Una catena ridotta a un solo elemento

A vale6 Ω. B contiene un solo resistore da2 Ω e quindi vale2 Ω. Il rapporto è un terzo. N=1 è ammesso: non occorrono almeno due elementi per applicare la somma.

Passaggi: `R_A=6\,\Omega\qquad R_B=2\,\Omega\qquad R_B/R_A=\frac13`

Distrattori: Tre è il reciproco; uno ignora la rimozione.1/9 usa N al quadrato; due copia il numero degli ohm finali senza dividerlo per il riferimento.

## 08 — Una proposta con un fattore due in più

Il totale corretto è6 Ω. La proposta lo supera di12−6=6 Ω. Non si sta chiedendo di raddoppiare il numero dei resistori, ma di confrontare la proposta con la catena assegnata.

Passaggi: `R=6\,\Omega\qquad e=(12-6)\,\Omega\qquad e=6\,\Omega`

Distrattori: −6 inverte l’ordine; dodici copia la proposta; zero la accetta. Due è il rapporto puro proposta/corretta, non lo scarto.

## 09 — Isolare il valore comune

Si divide R=Nr per il conteggioN>0. r=R/N ha unità ohm, perché il denominatore è puro. Il risultato è il valore di ciascun elemento, non la resistenza di una nuova rete parallela.

Passaggi: `R=Nr\qquad r=\frac RN\qquad N\in\mathbb N_{>0}`

Distrattori: Moltiplicare perN non isola r; N/R ha unitàΩ⁻¹. SottrarreN daR mescola un conteggio con una resistenza. N² divide una seconda volta senza una ragione circuitale.

## 10 — Fattori ammissibili per un conteggio

Sostituendo i due fattori si trova R_B=(κ₂N_A)(κ₁r_A), quindi R_B/R_A=κ₁κ₂. κ₂ non deve essere per forza intero: deve esserlo il prodottoκ₂N_A. Per esempio passare da3 a4 elementi usaκ₂=4/3 ed è fisicamente ammissibile.

Passaggi: `R_B=\kappa_2N_A\kappa_1r_A\qquad R_B/R_A=\kappa_1\kappa_2\qquad \kappa_2N_A\in\mathbb N_{>0}`

Distrattori: Il quoziente rende inverso uno dei fattori; la somma non dàuno per prove identiche. Il quadrato diκ₂ fa crescere R come il quadrato del numero degli elementi, mentre la serie è lineare inN.

## 11 — Quattro elementi di valore diverso

A vale6 Ω e B vale12 Ω. Il rapporto è due, prodotto del fattore3/2 inr e4/3 nel conteggio. Quattro è un conteggio, non il rapporto delle due resistenze totali.

Passaggi: `R_A=6\,\Omega\qquad R_B=12\,\Omega\qquad R_B/R_A=2`

Distrattori: Un mezzo è il reciproco;3/2 segue solo r e4/3 segue solo N. Quattro copierebbe N_B senza includere il valore di ogni resistore e il riferimento.

## 12 — La media di due catene reali

Le catene ammesse hanno resistenze6 e12 Ω: la media delle letture è9 Ω. I dati medi sarebbero r=5/2 Ω,N=7/2: questo N non è intero e non descrive una catena del modello. Il prodotto formale35/4 Ω non è quindi una nuova prova fisica ammissibile e, comunque, differisce da9 Ω.

Passaggi: `\overline R=\frac{6+12}{2}\,\Omega\qquad \overline R=9\,\Omega\qquad N_{\rm medio}=\frac72\notin\mathbb N`

Distrattori: 35/4 Ω moltiplica i dati medi senza rispettare il conteggio intero. Diciotto non dimezza; tre è metà della differenza e sei ripete A. La media di due misure non obbliga a costruire mezzo resistore.

## 13 — Il bersaglio richiede quattro elementi

Il bersaglio è12 Ω. Con elementi da3 Ω occorrono N_B=12/3=4 resistori, un intero positivo. Il rapporto con i tre elementi iniziali è4/3; il rapporto di due conteggi interi non è necessariamente un intero.

Passaggi: `R_B=12\,\Omega\qquad N_B=4\qquad N_B/N_A=\frac43`

Distrattori: 3/4 è il reciproco; due copia il fattore del totale; quattro copia il nuovo conteggio senza dividerlo per tre.3/2 segue invece il fattore di r.

## 14 — La taratura precede il valore del singolo elemento

Il riferimento vale6 Ω, quindi a=3 Ω⁻¹. La lettura36 corrisponde a12 Ω. Dividendo per i quattro elementi si ottiene r_B=3 Ω. Il display è continuo, mentre il numero degli elementi rimane un conteggio intero distinto dalla lettura.

Passaggi: `a=3\,\Omega^{-1}\qquad R_B=12\,\Omega\qquad r_B=\frac{12}{4}\,\Omega\qquad r_B=3\,\Omega`

Distrattori: Nove Ω tratta36 come resistenza senza togliere il guadagno. Dodici Ω copia il totale; quattro Ω copia il conteggio e predirebbe D=48.

## 15 — Anche il display della catena ha uno zero

I riferimenti danno6 e12 Ω. a=(25−13)/(12−6)=2 Ω⁻¹ e b=1. C ha R_C=(17−1)/2=8 Ω e contiene due elementi identici, quindi r_C=4 Ω. L’offset non è una resistenza da aggiungere in serie.

Passaggi: `a=2\,\Omega^{-1}\qquad b=1\qquad R_C=8\,\Omega\qquad r_C=4\,\Omega`

Distrattori: 17/4 Ω omette b e predice D=18. Due Ω darebbero D=9; otto Ω copia il totale e darebbe D=33. Un Ω darebbe D=5.

## 16 — Un vincolo non rende continuo il numero degli elementi

Sostituendo il vincolo nel totale si ottiene R=βN². Con6 Ω eβ=2/3 Ω si trova N²=9. Fra le radici algebriche si accetta solo N=3, che è un intero positivo; segue r=2 Ω. In generale anche una radice positiva non intera sarebbe esclusa dal conteggio.

Passaggi: `R=\beta N^2\qquad N^2=\frac{6\,\Omega}{(2/3)\,\Omega}\qquad N^2=9\qquad N=3`

Distrattori: Nove copia N²,−3 viola il conteggio e due darebbe R=8/3 Ω. Non sono infinite soluzioni perché la misura fissa N² e il dominio intero positivo seleziona un solo conteggio.
