# series-parallel-resistor-network-208 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json. Raw SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Letti tutti 80 prompt B205–209 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 c34e8c211bd2739336e24df94807e9856faba28e6b06bca044c0e9b76046f43b.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, commit 69e39c380719fec652d6dff1d3d5888be59b8f62. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A200–204 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L05 contiene prima e seconda legge di Ohm e resistività; C4-L06 contiene topologia di serie/parallelo, nodi, cadute e correnti. Rilette integralmente dal catalogo Cric storico, senza importare una competenza inventata.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/series-parallel-resistor-network-208-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Schema a nodi: r esterno in serie al blocco r,R, con due soli nodi condivisi per il parallelo. Resistori disegnati come simboli, non barre del valore. Nel secondo pannello segmenti80+40 e120+80 per2+1 e3+2 Ω, scala40 unità intrinseche/Ω e zero comune. Nel terzo barre180/300/240 per3/5/4 Ω da x150, scala60. Raggi e lunghezze geometriche della rete non codificano valori resistivi; i segmenti colorati sono invece quantitativi. Inversa09 con D e radice in blocchi distinti, r>0 e r<T<2r per inversa del ramoR.

## 01 — Riduci prima il parallelo

I due rami da2 Ω hanno equivalente1 Ω. Solo dopo questa riduzione si aggiunge il resistore esterno da2 Ω: T=3 Ω. Tutti e tre gli elementi non condividono la stessa coppia di nodi e non sono neppure una catena senza derivazioni.

Passaggi: `R_p=\frac{rR}{r+R}\qquad R_p=1\,\Omega\qquad T=r+R_p\qquad T=3\,\Omega`

Distrattori: Sei Ω mette tutti e tre in serie;2/3 Ω li mette tutti in parallelo. Uno Ω si ferma al parallelo e due Ω omette il contributo del parallelo.

## 02 — Una resistenza vista dai morsetti

Il termine rR/(r+R) ha Ω² al numeratore e Ω al denominatore: è una resistenza in ohm. Si può quindi sommare a r, anch’esso in ohm. T è resistenza e non una temperatura o un intervallo temporale, nonostante il simbolo scelto.

Passaggi: `[R_p]=\Omega^2/\Omega\qquad [R_p]=\Omega\qquad [T]=\Omega`

Distrattori: S misura conduttanza, A corrente e V tensione. Ω² corrisponde al solo prodotto rR, prima della divisione. La scelta del simbolo T non cambia l’unità definita nel testo.

## 03 — La topologia decide l’ordine

Per i due rami interni 1/R_p=1/r+1/R, quindi R_p=rR/(r+R). Il nodo fra l’elemento esterno e la rete interna è un nodo di diramazione solo all’ingresso del parallelo: il tratto esterno è in serie con l’intero equivalente R_p. Si ottiene T=r+R_p.

Passaggi: `\frac1{R_p}=\frac1r+\frac1R\qquad R_p=\frac{rR}{r+R}\qquad T=r+\frac{rR}{r+R}`

Distrattori: 2r+R tratta tutti in serie. Le espressioni che mettono tutti in parallelo non rispettano i nodi; rR/(2r+R) altera il denominatore del parallelo r∥R. r+R ignora uno dei due rami interni.

## 04 — Cambiano entrambi gli elementi r

In B il tratto esterno vale1 Ω e il parallelo fra1 e2 Ω vale2/3 Ω. Il totale è5/3 Ω. Cambiare r significa cambiare sia il resistore esterno sia quello del ramo: non si lascia il vecchio parallelo da1 Ω invariato.

Passaggi: `R_{p,B}=\frac23\,\Omega\qquad T_B=1\,\Omega+\frac23\,\Omega\qquad T_B=\frac53\,\Omega`

Distrattori: Due Ω cambia solo il tratto esterno lasciando il parallelo di A. 3/2 Ω dimezza il totale come se anche R fosse dimezzata. Tre ignora il cambio e quattro va contro la diminuzione di entrambi gli elementi r.

## 05 — Una misura genera un’equazione di secondo grado

Moltiplicando T=r+rR/(r+R) per r+R si trova r²+(2R−T)r−TR=0. Con i dati, se x=r/(1 Ω), l’equazione è x²+x−6=0=(x−2)(x+3). Il solo valore positivo è x=2: r=2 Ω. Il valore−3 Ω non descrive i resistori passivi richiesti.

Passaggi: `r^2+(2R-T)r-TR=0\qquad x=\frac r{1\,\Omega}\qquad x^2+x-6=0\qquad (x-2)(x+3)=0\qquad r=2\,\Omega`

Distrattori: −3 Ω è l’altra radice algebrica ma viola r>0. Uno Ω darebbe5/3 Ω con R=2 Ω; tre Ω copierebbe il totale e darebbe21/5 Ω. Non si sottrae direttamente R come se fosse in serie.

## 06 — L’altro ramo richiede un totale intermedio

Il parallelo deve valere T−r=1 Ω. Dalla relazione T−r=rR/(r+R) si ricava R=r(T−r)/(2r−T). Con i dati è2·1/(4−3)=2 Ω. Per R positivo finito occorre r<T<2r: il parallelo è positivo ma minore di r.

Passaggi: `R_p=T-r\qquad R=\frac{r(T-r)}{2r-T}\qquad r<T<2r\qquad R=2\,\Omega`

Distrattori: Un Ω scambia R con il parallelo e darebbe T=8/3 Ω. Tre Ω copia T e darebbe16/5 Ω. T=r non ammette R>0 finito; T=2r renderebbe nullo il denominatore e corrisponderebbe al limite di ramo R aperto.

## 07 — Cambia solo il ramo R

A vale3 Ω. In B il parallelo è2/3 Ω e il tratto esterno resta2 Ω: T_B=8/3 Ω. Il rapporto è(8/3)/3=8/9. Il dimezzamento di R non dimezza il totale perché r esterno resta invariato.

Passaggi: `T_A=3\,\Omega\qquad T_B=\frac83\,\Omega\qquad T_B/T_A=\frac89`

Distrattori: 9/8 è il reciproco;1/2 segue il solo R. 2/3 copia il numero della resistenza del parallelo in B e uno ignora la modifica.

## 08 — Uno scarto dopo la riduzione

Il totale corretto è3 Ω; la proposta di6 Ω, ottenibile mettendo tutti in serie, lo supera di3 Ω. La differenza ha unità ohm e va distinta dal rapporto2.

Passaggi: `T=3\,\Omega\qquad e=(6-3)\,\Omega\qquad e=3\,\Omega`

Distrattori: −3 inverte l’ordine, sei copia la proposta e zero la accetta. Due puro esprime il rapporto, non lo scarto fisico.

## 09 — Scegliere il ramo positivo dell’inversa

L’equazione quadratica è r²+(2R−T)r−TR=0. Il discriminante si semplifica in D=T²+4R², positivo e con unità Ω². Definiamo u=√D in Ω: la soluzione ammessa è r=(T−2R+u)/2. L’altra ha segno negativo perché D−(T−2R)²=4TR>0: la radice supera il modulo di T−2R.

Passaggi: `r^2+(2R-T)r-TR=0\qquad D=T^2+4R^2\qquad u=\sqrt D\qquad r=\frac{T-2R+u}{2}\qquad D-(T-2R)^2=4TR>0`

Distrattori: Il meno davanti alla radice seleziona r<0. T−R tratta la rete come una semplice serie. TR/(T+R) ricava un parallelo di T e R non presente; il più davanti a2R cambia il coefficiente della quadratica.

## 10 — I fattori entrano in entrambe le occorrenze r

Scriviamo T=r(r+2R)/(r+R). Il rapporto conserva tutti e tre i fattori della frazione. Per svolgerlo in tappe brevi definiamo a=κ₁r+2κ₂R, b=κ₁r+κ₂R, c=r+R e d=r+2R, tutti in ohm. Si ottiene T_B/T_A=κ₁ac/(bd). Se i due fattori coincidono con κ, il rapporto si riduce a κ.

Passaggi: `T=\frac{r(r+2R)}{r+R}\qquad a=\kappa_1r+2\kappa_2R\qquad b=\kappa_1r+\kappa_2R\qquad c=r+R\qquad d=r+2R\qquad T_B/T_A=\frac{\kappa_1ac}{bd}`

Distrattori: Prodotto e quoziente dei soli fattori ignorano la somma al denominatore. Il rapporto delle sole somme descriverebbe un’altra rete;1/κ₁ renderebbe inversa la scala comune, mentre resistenze tutte moltiplicate per κ danno T moltiplicata per κ.

## 11 — Un nuovo tratto esterno e un nuovo parallelo

A vale3 Ω. B ha parallelo(3·6)/(3+6)=2 Ω e tratto esterno3 Ω: T_B=5 Ω. Il rapporto è5/3, includendo entrambe le occorrenze di r.

Passaggi: `T_A=3\,\Omega\qquad R_{p,B}=2\,\Omega\qquad T_B=5\,\Omega\qquad T_B/T_A=\frac53`

Distrattori: 3/5 inverte il confronto;3/2 segue il solo parametro r e tre il solo R. Due è il rapporto dei paralleli, ma manca il tratto esterno.

## 12 — Media di due totali

I totali sono3 e5 Ω: media4 Ω. Ai dati medi r=5/2 Ω,R=4 Ω, il parallelo è20/13 Ω e il totale è5/2+20/13=105/26 Ω. Poiché4=104/26, è diverso anche senza calcoli decimali. La sottorete parallela rende non lineare il modello completo.

Passaggi: `\overline T=\frac{3+5}{2}\,\Omega\qquad \overline T=4\,\Omega\qquad T_{\rm dati\ medi}=\frac52\,\Omega+\frac{20}{13}\,\Omega\qquad T_{\rm dati\ medi}=\frac{105}{26}\,\Omega`

Distrattori: 105/26 Ω usa gli ingressi medi. Otto Ω somma senza dimezzare, un Ω è metà della differenza e tre Ω ripete A. Le due prove non sono circuiti collegati insieme.

## 13 — Un bersaglio fra r e 2r

Il bersaglio T_B=5 Ω è compreso fra r_B=3 Ω e2r_B=6 Ω. L’inversa dà R_B=3(5−3)/(6−5)=6 Ω. Rispetto ai2 Ω di A il rapporto è tre.

Passaggi: `T_B=5\,\Omega\qquad R_B=\frac{3(5-3)}{6-5}\,\Omega\qquad R_B=6\,\Omega\qquad R_B/R_A=3`

Distrattori: 1/3 è il reciproco. 5/3 copia il fattore del totale, sei copia gli ohm finali e3/2 segue soltanto r. Il controllo r<T<2r impedisce di accettare inversi non passivi.

## 14 — Decodificare la misura prima della quadratica

A ha totale3 Ω, quindi a=3 Ω⁻¹. D=15 indica T_B=5 Ω. Con R=6 Ω, ponendo x=r_B/(1 Ω), l’inversa diventa x²+7x−30=0=(x−3)(x+10). Si sceglie x=3, quindi r_B=3 Ω.

Passaggi: `a=3\,\Omega^{-1}\qquad T_B=5\,\Omega\qquad x^2+7x-30=0\qquad (x-3)(x+10)=0\qquad r_B=3\,\Omega`

Distrattori: −10 Ω è la radice esclusa. Cinque Ω copia il totale, ignorando il parallelo. Due Ω con R=6 Ω darebbero T=7/2 Ω e D=21/2, non15.

## 15 — Guadagno e offset prima della radice

I riferimenti valgono3 e5 Ω. a=(11−7)/(5−3)=2 Ω⁻¹ e b=1. C ha T_C=(13−1)/2=6 Ω. Con R=4 Ω, x=r_C/(1 Ω) soddisfa x²+2x−24=0=(x−4)(x+6). La radice positiva è4 Ω; il parallelo4∥4 vale2 Ω e il totale torna6 Ω.

Passaggi: `a=2\,\Omega^{-1}\qquad b=1\qquad T_C=6\,\Omega\qquad x^2+2x-24=0\qquad (x-4)(x+6)=0\qquad r_C=4\,\Omega`

Distrattori: Sei Ω copia il totale e darebbe42/5 Ω. Due Ω darebbero10/3 Ω; tre Ω darebbero33/7 Ω. −6 Ω è l’altra radice algebrica, esclusa dal dominio passivo.

## 16 — Tre elementi dello stesso valore

Il parallelo fra due resistenze uguali vale R/2; il tratto esterno vale ancora R. Quindi T=(3/2)R. La misura tre ohm determina R=2 Ω e anche r=2 Ω. Il rapporto tra parametri non rende ridondante la misura del totale.

Passaggi: `R_p=\frac R2\qquad T=\frac32R\qquad R=\frac23T\qquad R=2\,\Omega`

Distrattori: Uno Ω copia il solo parallelo della prova corretta. Tre Ω copia il totale e−2 Ω viola la passività. La misura positiva fissa una scala unica dopo il vincolo.
