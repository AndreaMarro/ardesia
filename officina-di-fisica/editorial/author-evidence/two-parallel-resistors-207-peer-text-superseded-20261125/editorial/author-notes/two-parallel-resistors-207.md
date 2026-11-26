# two-parallel-resistors-207 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json. Raw SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Letti tutti 80 prompt B205–209 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 c34e8c211bd2739336e24df94807e9856faba28e6b06bca044c0e9b76046f43b.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, commit 69e39c380719fec652d6dff1d3d5888be59b8f62. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A200–204 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L05 contiene prima e seconda legge di Ohm e resistività; C4-L06 contiene topologia di serie/parallelo, nodi, cadute e correnti. Rilette integralmente dal catalogo Cric storico, senza importare una competenza inventata.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/two-parallel-resistors-207-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: I due rami del primo circuito condividono esattamente i nodiA,B; simboli resistivi schematici non in scala del valore. Il secondo schema apre solo il ramo3 Ω con un contatto visibilmente separato; il6 Ω resta connesso agli stessi nodi. Correnti mostrate simbolicamente alla medesima V_AB. Barre delle equivalenti1/2/3/2 Ω lunghe160/320/240 da x150, scala160 unità intrinseche/Ω. La coppia del secondo pannello è il caso distinto03/06, non una variazione non dichiarata del primo circuito.

## 01 — Due percorsi per la stessa tensione

Ogni ramo assorbe V/(2 Ω). La corrente totale è quindi V/(1 Ω): l’equivalente vale un ohm. Due resistori uguali in parallelo dimezzano la resistenza di ciascun ramo, perché offrono un secondo percorso alla stessa tensione.

Passaggi: `I=\frac V{R_1}+\frac V{R_2}\qquad G_1=G_2=\frac12\,\mathrm S\qquad G_{\rm eq}=1\,\mathrm S\qquad R_{\rm eq}=1\,\Omega`

Distrattori: Quattro Ω somma come in serie; due Ω omette un ramo; mezzo Ω dividerebbe ancora per due il risultato già equivalente. La resistenza deve essere minore di ciascuna delle due resistenze positive.

## 02 — Il reciproco finale conta

La somma 1/R₁+1/R₂ è una conduttanza in siemens. La resistenza equivalente ne è il reciproco e si misura in ohm. Il passaggio al parallelo non cambia la definizione R_eq=V/I ai morsetti.

Passaggi: `G_{\rm eq}=\frac1{R_1}+\frac1{R_2}\qquad [G_{\rm eq}]=\mathrm S\qquad [R_{\rm eq}]=\Omega`

Distrattori: S è l’unità della somma dei reciproci, non della resistenza richiesta. A e V misurano corrente e tensione; Ω² sarebbe l’unità di un prodotto di due resistenze senza il denominatore.

## 03 — Gli stessi due nodi impongono la tensione

Ogni resistore è collegato direttamente alla stessa coppia di nodi. Perciò entrambi hanno la tensione del generatore. Le correnti sono V/R₁ e V/R₂: con resistenze diverse non sono obbligate a coincidere. Il generatore ideale mantiene la tensione, non uguaglia le correnti dei rami.

Passaggi: `V_1=V_2=V\qquad I_1=\frac V{R_1}\qquad I_2=\frac V{R_2}\qquad I=I_1+I_2`

Distrattori: Correnti o potenze uguali non seguono dalla sola connessione: a tensione non nulla dipendono dalle rispettive resistenze. La somma R₁+R₂ sarebbe una serie; la corrente totale include entrambi i rami.

## 04 — Un ramo conduce più facilmente

In B la somma delle conduttanze è 1+1/2=3/2 S e il reciproco è 2/3 Ω. Riducendo una resistenza si facilita il passaggio della corrente e l’equivalente diminuisce. Il ramo che resta da due ohm continua a contribuire.

Passaggi: `G_B=\frac32\,\mathrm S\qquad R_{{\rm eq},B}=\frac23\,\Omega\qquad R_{{\rm eq},A}=1\,\Omega`

Distrattori: Tre Ω somma come in serie. Mezzo Ω dimezza entrambi i rami anziché uno solo. Uno Ω ignora il cambio; 3/2 Ω copia il numero della conduttanza senza prenderne il reciproco.

## 05 — Una resistenza dal parallelo misurato

Dalla conduttanza totale si toglie quella del ramo noto: 1/R₁=1−1/2=1/2 S. Invertendo si trova R₁=2 Ω. L’inversa ammette un resistore positivo finito solo se 0<R_eq<R₂.

Passaggi: `\frac1{R_1}=\frac1{R_{\rm eq}}-\frac1{R_2}\qquad \frac1{R_1}=\frac12\,\mathrm S\qquad R_1=2\,\Omega`

Distrattori: Un Ω copia l’equivalente e darebbe un parallelo2/3 Ω. Tre Ω sommerebbe resistenze invece di sottrarre conduttanze. Il denominatore nullo descriverebbe un ramo aperto, non un R₁ positivo finito.

## 06 — Aprire un ramo non cambia la tensione imposta

Prima dell’apertura I_i=V/(3 Ω)+V/(6 Ω)=V/(2 Ω). Dopo rimane I_f=V/(6 Ω), con la stessa tensione. Il rapporto è quindi 1/3. La corrente nel ramo superstite non è diminuita: era già V/(6 Ω); è sparito il contributo dell’altro ramo.

Passaggi: `R_{{\rm eq},i}=2\,\Omega\qquad R_{{\rm eq},f}=6\,\Omega\qquad \frac{I_f}{I_i}=\frac{V/(6\,\Omega)}{V/(2\,\Omega)}\qquad I_f/I_i=\frac13`

Distrattori: Tre è il rapporto delle resistenze equivalenti, inverso a quello delle correnti a V fissata. Un mezzo suppone rami uguali; 2/3 è la frazione di corrente nel ramo eliminato. Uno ignora la corrente che è stata rimossa.

## 07 — Ridurre il secondo ramo

A vale un ohm. B vale (2·1)/(2+1)=2/3 Ω. Il rapporto è 2/3, non il rapporto1/2 delle sole R₂: la corrente può ancora attraversare anche R₁.

Passaggi: `R_{{\rm eq},A}=1\,\Omega\qquad R_{{\rm eq},B}=\frac23\,\Omega\qquad R_{{\rm eq},B}/R_{{\rm eq},A}=\frac23`

Distrattori: 3/2 inverte il confronto; 1/2 segue un solo ramo; due rende diretta la dipendenza dalla conduttanza totale e uno ignora il nuovo parallelo.

## 08 — Lo scarto di una proposta

Il parallelo vale un ohm. La proposta lo supera di 2−1=1 Ω. L’equivalente non è uguale a uno dei resistori quando sono presenti due rami positivi finiti.

Passaggi: `R_{\rm eq}=1\,\Omega\qquad e=(2-1)\,\Omega\qquad e=1\,\Omega`

Distrattori: −1 inverte l’ordine, due Ω copia la proposta e zero la accetta. Due puro è il rapporto e non ha unità di resistenza.

## 09 — Isolare R₁ richiede un residuo positivo

Dalla somma dei reciproci si ottiene 1/R₁=(R₂−R_eq)/(R_eqR₂). Invertendo si trova R₁=R_eqR₂/(R₂−R_eq), con 0<R_eq<R₂. Numeratore e denominatore hanno unità Ω² e Ω, quindi il risultato è in ohm.

Passaggi: `\frac1{R_1}=\frac{R_2-R_{\rm eq}}{R_{\rm eq}R_2}\qquad R_1=\frac{R_{\rm eq}R_2}{R_2-R_{\rm eq}}\qquad 0<R_{\rm eq}<R_2`

Distrattori: Il più nel denominatore non sottrae la conduttanza nota. Una differenza diretta di resistenze inverte il modello come se fosse una serie; l’ordine opposto dà negativo. Il rapporto R₂/R_eq è puro.

## 10 — Fattori dentro prodotto e somma

Nel prodotto al numeratore compaiono entrambi i fattori; nella somma al denominatore ciascun fattore pesa il proprio ramo. Dividendo per R₁R₂/(R₁+R₂) si trova κ₁κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂). Se κ₁=κ₂=κ, il rapporto è κ, non κ².

Passaggi: `R_{{\rm eq},B}=\frac{\kappa_1\kappa_2R_1R_2}{\kappa_1R_1+\kappa_2R_2}\qquad \frac{R_{{\rm eq},B}}{R_{{\rm eq},A}}=\frac{\kappa_1\kappa_2(R_1+R_2)}{\kappa_1R_1+\kappa_2R_2}`

Distrattori: Il solo prodotto ignora la somma; il quoziente dei fattori perde i pesi. Il rapporto delle somme da solo appartiene alla serie e il reciproco del prodotto non scala correttamente due resistenze insieme.

## 11 — Rami entrambi diversi

A vale un ohm. B vale (3·6)/(3+6)=18/9=2 Ω. Il rapporto è due. La somma delle resistenze cresce da4 a9 Ω, ma il parallelo non segue semplicemente quel rapporto.

Passaggi: `R_{{\rm eq},A}=1\,\Omega\qquad R_{{\rm eq},B}=2\,\Omega\qquad R_{{\rm eq},B}/R_{{\rm eq},A}=2`

Distrattori: Un mezzo è il reciproco. Tre segue solo R₂; 9/4 confronta le somme e 9/2 i prodotti, omettendo la variazione dell’altra parte della frazione.

## 12 — La media non riduce una rete intermedia

Le letture sono1 e2 Ω e la media vale3/2 Ω. I resistori medi sarebbero R₁=5/2 Ω,R₂=4 Ω: il loro parallelo vale10/(13/2)=20/13 Ω. Non coincide, perché3/2=39/26 e20/13=40/26. Nessun arrotondamento è necessario.

Passaggi: `\overline R_{\rm eq}=\frac{1+2}{2}\,\Omega\qquad \overline R_{\rm eq}=\frac32\,\Omega\qquad R_{\rm dati\ medi}=\frac{20}{13}\,\Omega`

Distrattori: 20/13 Ω usa i dati medi, tre Ω non dimezza la somma, mezzo Ω è metà della differenza e un Ω ripete A. Sono reti di prove separate, non quattro rami simultanei.

## 13 — Il bersaglio fissa il secondo ramo

Il bersaglio è2 Ω, minore dei3 Ω noti come richiesto dal dominio. L’inversa dà R₂,B=(2·3)/(3−2)=6 Ω. Il rapporto con i2 Ω di A è tre, non sei.

Passaggi: `R_{{\rm eq},B}=2\,\Omega\qquad R_{2,B}=\frac{2\cdot3}{3-2}\,\Omega\qquad R_{2,B}=6\,\Omega\qquad R_{2,B}/R_{2,A}=3`

Distrattori: 1/3 inverte il confronto, due copia il fattore del totale e sei copia il valore in ohm senza dividerlo per R₂,A. 3/2 segue solo il primo ramo.

## 14 — Il guadagno si applica all’equivalente

Il riferimento vale1 Ω, quindi a=3 Ω⁻¹. D=6 indica R_eq,B=2 Ω. Con R₂=6 Ω, l’inversa R₁=R_eqR₂/(R₂−R_eq) dà12/4=3 Ω. Il totale decodificato è minore del ramo noto.

Passaggi: `a=3\,\Omega^{-1}\qquad R_{{\rm eq},B}=2\,\Omega\qquad R_{1,B}=\frac{12}{4}\,\Omega\qquad R_{1,B}=3\,\Omega`

Distrattori: Sei Ω copiando la lettura darebbero un parallelo3 Ω e D=9. Due Ω copia il totale e darebbe3/2 Ω. Trattare D=6 come equivalente renderebbe nullo il denominatore dell’inversa.

## 15 — Offset e ramo incognito

Le equivalenti note sono1 e2 Ω. a=(5−3)/(2−1)=2 Ω⁻¹ e b=1. D_C=2 significa R_eq,C=1/2 Ω. Con R₂,C=1 Ω, l’inversa dà R₁,C=(1/2)/(1−1/2) Ω=1 Ω.

Passaggi: `a=2\,\Omega^{-1}\qquad b=1\qquad R_{{\rm eq},C}=\frac12\,\Omega\qquad R_{1,C}=1\,\Omega`

Distrattori: Due Ω darebbero R_eq=2/3 Ω e D=7/3, non due. Mezzo Ω darebbe R_eq=1/3 Ω e D=5/3. Zero viola R₁>0; tre Ω darebbero R_eq=3/4 Ω e D=5/2.

## 16 — Due rami uguali e una misura

Con rami uguali la somma delle conduttanze è2/R₂ e quindi R_eq=R₂/2. La misura determina R₂=2 Ω e R₁=2 Ω. Il vincolo di uguaglianza da solo non fissa i valori, ma la resistenza equivalente misurata sì.

Passaggi: `\frac1{R_{\rm eq}}=\frac2{R_2}\qquad R_2=2R_{\rm eq}\qquad R_2=2\,\Omega`

Distrattori: Uno Ω copia l’equivalente; mezzo Ω applica un dimezzamento al contrario; −2 viola la passività. Non rimane una famiglia libera dopo una misura positiva indipendente.
