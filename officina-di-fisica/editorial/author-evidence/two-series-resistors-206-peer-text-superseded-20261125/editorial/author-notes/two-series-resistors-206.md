# two-series-resistors-206 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json. Raw SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Letti tutti 80 prompt B205–209 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 c34e8c211bd2739336e24df94807e9856faba28e6b06bca044c0e9b76046f43b.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, commit 69e39c380719fec652d6dff1d3d5888be59b8f62. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A200–204 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L05 contiene prima e seconda legge di Ohm e resistività; C4-L06 contiene topologia di serie/parallelo, nodi, cadute e correnti. Rilette integralmente dal catalogo Cric storico, senza importare una competenza inventata.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/two-series-resistors-206-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Circuito iniziale privo di derivazioni, resistori2/3 Ω rappresentati simbolicamente con uguale larghezza non proporzionale al valore. Il secondo è un caso distinto2/4 Ω: il filo da(340,620) a(500,620) passa solo attorno al4 Ω, lasciando il2 Ω fra i morsetti. Nessun generatore cortocircuitato è disegnato. Barre totali5/8/13/2 Ω lunghe200/320/260 dal comune x150, scala40 unità intrinseche/Ω; la media è delle due uscite e coincide anche coi dati medi per linearità.

## 01 — Segui la corrente nel nodo intermedio

Non c’è un ramo in cui parte della corrente possa separarsi. Le cadute sono V₁=IR₁ e V₂=IR₂: la caduta totale è I(R₁+R₂). Perciò R_eq=2+3=5 Ω, maggiore di ciascun resistore.

Passaggi: `V=V_1+V_2\qquad V=I(R_1+R_2)\qquad R_{\rm eq}=R_1+R_2\qquad R_{\rm eq}=5\,\Omega`

Distrattori: 6/5 Ω sarebbe il parallelo, che condivide due nodi invece di uno senza derivazioni. Sei Ω moltiplicherebbe due valori numerici senza ricavare una resistenza dalla legge del circuito. Due o tre Ω ometterebbero un elemento.

## 02 — L’equivalente è ancora una resistenza

L’equivalente è definito dalla stessa relazione ai morsetti V=IR_eq. Dividere volt per ampere dà ohm. La riduzione del circuito conserva la grandezza resistenza, senza trasformarla in una corrente o potenza.

Passaggi: `R_{\rm eq}=\frac VI\qquad [R_{\rm eq}]=\mathrm{V/A}\qquad [R_{\rm eq}]=\Omega`

Distrattori: S indica conduttanza, A corrente, V tensione e W potenza. La somma di due resistenze non è una somma di conduttanze.

## 03 — Le cadute si sommano

La corrente comune permette di raccogliere I nella legge delle tensioni. Da V=IR₁+IR₂ si ricava V=I(R₁+R₂), quindi R_eq=R₁+R₂. Il criterio è la topologia dichiarata, non la posizione dei simboli sul foglio.

Passaggi: `V=IR_1+IR_2\qquad V=IR_{\rm eq}\qquad R_{\rm eq}=R_1+R_2`

Distrattori: Il quoziente prodotto/somma è il parallelo. La differenza può essere nulla o negativa fra resistori passivi. La somma dei reciproci ha unità siemens, il prodotto ha Ω².

## 04 — Diminuisce un solo elemento

Il contributo R₂ resta tre ohm. Il totale passa da 2+3=5 Ω a 1+3=4 Ω: si riduce di un ohm, ma non si dimezza l’intero circuito. Il secondo elemento non è stato modificato.

Passaggi: `R_{{\rm eq},A}=5\,\Omega\qquad R_{{\rm eq},B}=1+3\,\Omega\qquad R_{{\rm eq},B}=4\,\Omega`

Distrattori: 5/2 Ω dimezza anche R₂, che è fisso. Sei Ω aumenta il totale mentre un addendo diminuisce. Cinque ignora il cambio e due non include i tre ohm del secondo elemento.

## 05 — Il residuo dopo il resistore noto

Dall’equivalente si sottrae l’elemento noto: R₁=5−3=2 Ω. La differenza è strettamente positiva. In generale questa inversa richiede R_eq>R₂, altrimenti nessun R₁ positivo soddisferebbe la serie.

Passaggi: `R_1=R_{\rm eq}-R_2\qquad R_1=(5-3)\,\Omega\qquad R_1=2\,\Omega\qquad R_{\rm eq}>R_2`

Distrattori: Otto Ω aggiunge invece di sottrarre e predice totale 11 Ω. Cinque Ω copia il totale e predice 8 Ω. Una resistenza negativa non è un ramo alternativo ammesso qui.

## 06 — Un filo cambia davvero la topologia

Il filo rende equipotenziali i due capi del resistore da quattro ohm. La sua caduta è quindi zero e, essendo la sua resistenza finita, anche la corrente che lo attraversa è zero. Il collegamento in parallelo fra quel resistore e il filo equivale a zero ohm; rimangono i due ohm in serie. I morsetti esterni non sono cortocircuitati fra loro.

Passaggi: `V_{4\Omega}=0\qquad I_{4\Omega}=0\qquad R_{\rm ramo\ bypass}=0\qquad R_{{\rm eq},f}=2\,\Omega`

Distrattori: Sei Ω mantiene la vecchia serie dopo aver aggiunto il filo. Quattro Ω elimina il resistore sbagliato. 4/3 Ω mette in parallelo i due resistori anziché il solo quattro ohm col filo; zero Ω cortocircuiterebbe anche l’altro elemento.

## 07 — Un secondo resistore più piccolo

A vale cinque ohm, B vale tre ohm. Il rapporto richiesto è 3/5. Il cambiamento del solo R₂ non si applica come fattore a tutto il circuito, perché R₁ rimane uguale.

Passaggi: `R_{{\rm eq},A}=5\,\Omega\qquad R_{{\rm eq},B}=3\,\Omega\qquad R_{{\rm eq},B}/R_{{\rm eq},A}=\frac35`

Distrattori: 5/3 è il reciproco; 1/3 segue soltanto R₂. Uno ignora la variazione e tre copia il numero degli ohm finali senza dividerlo per il riferimento.

## 08 — Una proposta doppia del totale

Il totale fisico è 5 Ω; la proposta lo supera di 10−5=5 Ω. Il rapporto due non ha unità e non è la differenza chiesta.

Passaggi: `R_{\rm eq}=5\,\Omega\qquad e=(10-5)\,\Omega\qquad e=5\,\Omega`

Distrattori: −5 scambia l’ordine, dieci copia la proposta e zero la accetta. Il fattore due descrive una sovrastima relativa, non una resistenza di scarto.

## 09 — L’inversa di una somma

Sottraendo R₂ a entrambi i membri di R_eq=R₁+R₂ si trova R₁=R_eq−R₂. Occorre R_eq>R₂>0. Tutti i termini hanno unità ohm e la relazione si verifica risommando R₂ al risultato.

Passaggi: `R_{\rm eq}=R_1+R_2\qquad R_1=R_{\rm eq}-R_2\qquad R_{\rm eq}>R_2>0`

Distrattori: Il più non elimina l’addendo noto. L’ordine inverso darebbe negativo nel ramo ammesso. Il rapporto è puro e la differenza dei reciproci è una conduttanza, non R₁.

## 10 — Fattori con pesi diversi

Nel rapporto restano i pesi delle due resistenze originali: (κ₁R₁+κ₂R₂)/(R₁+R₂). Il denominatore è strettamente positivo. Se i fattori coincidono con κ, il rapporto vale κ: la somma è omogenea di primo grado.

Passaggi: `R_{{\rm eq},B}=\kappa_1R_1+\kappa_2R_2\qquad \frac{R_{{\rm eq},B}}{R_{{\rm eq},A}}=\frac{\kappa_1R_1+\kappa_2R_2}{R_1+R_2}`

Distrattori: Prodotto e quoziente dei soli fattori perdono i pesi. La frazione rovesciata scambia le prove; la differenza non è la legge di una serie passiva e può annullare il denominatore per elementi uguali.

## 11 — Due resistenze entrambe nuove

Le somme sono 5 e 8 Ω. Il rapporto B/A vale 8/5, non il rapporto di una sola delle resistenze. Non basta sapere che entrambi gli elementi aumentano per attribuire un fattore due.

Passaggi: `R_{{\rm eq},A}=5\,\Omega\qquad R_{{\rm eq},B}=8\,\Omega\qquad R_{{\rm eq},B}/R_{{\rm eq},A}=\frac85`

Distrattori: 5/8 capovolge il rapporto; 3/2 segue R₁ e 5/3 segue R₂. Due darebbe un totale 10 Ω, diverso dagli otto effettivi.

## 12 — Qui le due medie coincidono

I totali sono 5 e 8 Ω: la media è 13/2 Ω. In questa legge lineare anche le resistenze medie R₁=5/2 Ω,R₂=4 Ω danno 13/2 Ω. La coincidenza deriva dalla somma, e non si trasferisce automaticamente alle reti parallele o ad altre relazioni non lineari.

Passaggi: `\overline R_{\rm eq}=\frac{5+8}{2}\,\Omega\qquad \overline R_{\rm eq}=\frac{13}{2}\,\Omega\qquad \frac52+4=\frac{13}{2}`

Distrattori: Tredici Ω non dimezza la somma; 3/2 Ω è metà della differenza. Cinque e otto Ω ripetono una sola prova. Non si collegano fisicamente i quattro resistori dei due esperimenti.

## 13 — Il bersaglio lascia un addendo da trovare

Il bersaglio è otto ohm. Sottraendo i tre ohm noti nella prova B si trova R₂,B=5 Ω. Dividendo per i 3 Ω di A si ottiene 5/3. Cinque è una resistenza, non il rapporto richiesto.

Passaggi: `R_{{\rm eq},B}=8\,\Omega\qquad R_{2,B}=5\,\Omega\qquad R_{2,B}/R_{2,A}=\frac53`

Distrattori: 3/5 inverte il rapporto. 8/5 copia il fattore del totale; cinque copia R₂,B e 3/2 segue soltanto l’altro resistore.

## 14 — Dalla lettura al totale e al residuo

Il riferimento vale 5 Ω, quindi a=3 Ω⁻¹. D=24 significa totale 8 Ω. Sottraendo R₂,B=5 Ω si ricava R₁,B=3 Ω; il residuo positivo verifica il dominio.

Passaggi: `a=3\,\Omega^{-1}\qquad R_{{\rm eq},B}=8\,\Omega\qquad R_{1,B}=(8-5)\,\Omega\qquad R_{1,B}=3\,\Omega`

Distrattori: Diciannove Ω usa 24 come totale e ignora il guadagno. Otto Ω si ferma al totale; cinque Ω copia il resistore noto. La scala del display non aggiunge una resistenza fisica.

## 15 — Guadagno e offset prima dell’inversa

I riferimenti hanno totali 5 e 8 Ω. Si trova a=(17−11)/(8−5)=2 Ω⁻¹ e b=1. Il totale C è (5−1)/2=2 Ω. Sottraendo l’ohm noto si trova R₁,C=1 Ω.

Passaggi: `a=2\,\Omega^{-1}\qquad b=1\qquad R_{{\rm eq},C}=2\,\Omega\qquad R_{1,C}=1\,\Omega`

Distrattori: 3/2 Ω omette b e predice D=6. Due Ω copia il totale e predice D=7; tre Ω predice D=9; cinque Ω copia la lettura e predice D=13.

## 16 — Un rapporto fissato non annulla la scala

Il vincolo rende il totale R_eq=(2/3+1)R₂=(5/3)R₂. La misura cinque ohm fissa R₂=3 Ω e quindi R₁=2 Ω. Il rapporto da solo lascia la scala libera, ma la misura del totale la determina.

Passaggi: `R_{\rm eq}=\frac53R_2\qquad R_2=\frac35R_{\rm eq}\qquad R_2=3\,\Omega`

Distrattori: Due Ω è R₁, non R₂. Cinque Ω copia il totale. −3 Ω viola la passività; non sono infinite coppie dopo che è stato misurato un totale positivo.
