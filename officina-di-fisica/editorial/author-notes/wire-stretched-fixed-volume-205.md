# wire-stretched-fixed-volume-205 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json. Raw SHA256 fc81a187db9ee2f6d17bf299b333defd87a754ad04fc7efaddd2c40737ecc24d. Letti tutti 80 prompt B205–209 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 c34e8c211bd2739336e24df94807e9856faba28e6b06bca044c0e9b76046f43b.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd, commit 69e39c380719fec652d6dff1d3d5888be59b8f62. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A200–204 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L05 contiene prima e seconda legge di Ohm e resistività; C4-L06 contiene topologia di serie/parallelo, nodi, cadute e correnti. Rilette integralmente dal catalogo Cric storico, senza importare una competenza inventata.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/wire-stretched-fixed-volume-205-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Il primo pannello è un diagramma del prodotto L×A, non il profilo di un filo: rettangoli120×80 e240×40 hanno uguale area9600 in coordinate intrinseche. La seconda altezza indica A₀/2, non un diametro dimezzato. Il grafico R₀=1 Ω usa s=1+2u e R=(1+2u)² Ω, u tra0 e1: Bézier M220840 Q340800460680 con x=100+120s, y=860−20R. I punti a s1/2/3 sono R1/4/9, curva limitata a s≥1. Barre4/18/11 Ω lunghe80/360/220 dal comune x150, scala20 unità/Ω. La prova B della media ha R₀=2 Ω, diversa dalla curva centrale.

## 01 — Allungare cambia anche la sezione

Il volume conservato impone A=A₀/2 quando la lunghezza raddoppia. Nella resistenza, il fattore due della lunghezza e quello due dell’inverso dell’area si moltiplicano: R=4R₀=4 Ω. Non si mantiene la sezione mentre si impone anche il volume costante.

Passaggi: `LA=L_0A_0\qquad A=\frac{A_0}{s}\qquad R=\rho\frac{sL_0}{A_0/s}\qquad R=R_0s^2\qquad R=4\,\Omega`

Distrattori: Due ohm cambierebbero solo la lunghezza, ignorando la sezione dimezzata. Mezzo ohm renderebbe inversa la lunghezza; otto ohm aggiungerebbe un fattore due estraneo. La resistività, nelle ipotesi, non quadruplica.

## 02 — Resistenza non è resistività

In R=ρL/A, la resistività ha unità Ω·m. Moltiplicare per la lunghezza e dividere per l’area lascia Ω. Il fattore s è un rapporto di lunghezze e non aggiunge un’unità alla resistenza.

Passaggi: `[R]=\frac{(\Omega\,\mathrm m)\,\mathrm m}{\mathrm{m^2}}\qquad [R]=\Omega\qquad [s]=1`

Distrattori: Ω·m misura resistività, S conduttanza, A corrente e V tensione. Un fattore di allungamento puro non converte una di queste grandezze nell’altra.

## 03 — Stesso materiale e stessa temperatura

La resistività caratterizza il materiale nelle condizioni assegnate. Le resistenze sono invece R₁=ρL₁/A₁ e R₂=ρL₂/A₂: geometrie diverse possono produrre resistenze diverse. Non si sta affermando che la resistività sia universale o indipendente dalla temperatura.

Passaggi: `\rho_1=\rho_2\qquad R_1=\rho\frac{L_1}{A_1}\qquad R_2=\rho\frac{L_2}{A_2}`

Distrattori: La resistenza dipende anche dalla geometria e non è obbligata a coincidere; la stessa osservazione vale per la conduttanza. L/A non è fissato dall’identità di materiale. Una corrente richiede anche un circuito e una tensione.

## 04 — Una resistenza iniziale tripla

Entrambi i fili ricevono il medesimo fattore s²=4. La resistenza iniziale B è tripla, perciò anche la finale è tripla: 4 e 12 Ω. Il quadrato riguarda s, non il fattore della resistenza iniziale.

Passaggi: `R_A=1\cdot2^2\,\Omega\qquad R_A=4\,\Omega\qquad R_B=3\cdot2^2\,\Omega\qquad R_B=12\,\Omega`

Distrattori: 4/3 rende inversa R₀; 36 eleva al quadrato anche il fattore tre; quattro ignora il nuovo R₀. Sei Ω userebbe R₀s nella prova B, perdendo la variazione di area.

## 05 — Risolvere per il filo iniziale

Dividendo R=R₀s² per s² si ottiene R₀=4/4=1 Ω. Il filo dopo la preparazione oppone una resistenza maggiore, quindi il risultato iniziale deve essere minore di quattro in questa prova.

Passaggi: `R_0=\frac{R}{s^2}\qquad R_0=\frac4{2^2}\,\Omega\qquad R_0=1\,\Omega`

Distrattori: Due Ω divide soltanto per s; sedici Ω moltiplica per s² anziché dividere; quattro Ω ignora la preparazione. La resistività non si ricava da R e s senza la geometria iniziale.

## 06 — Il fattore di allungamento dalla misura

Il rapporto R/R₀ vale quattro, quindi s²=4. Fra le due radici algebriche si sceglie s=2: un rapporto di lunghezze è positivo e qui deve essere almeno uno. In generale una misura R<R₀ non sarebbe compatibile con questo modello di allungamento.

Passaggi: `s^2=\frac{R}{R_0}\qquad s=\sqrt{\frac{R}{R_0}}\qquad s=2\qquad s\ge1`

Distrattori: Quattro copia s², −2 viola il significato geometrico e 1/2 descriverebbe un accorciamento. Non si attribuisce un’unità ohm al fattore s.

## 07 — Il filo non allungato come confronto

A vale 4 Ω; B non viene allungato e conserva 1 Ω. Il rapporto B/A è quindi un quarto. s=1 è incluso nel dominio e indica semplicemente la configurazione iniziale.

Passaggi: `R_A=4\,\Omega\qquad R_B=1\,\Omega\qquad R_B/R_A=\frac14`

Distrattori: Un mezzo segue soltanto L; quattro è il reciproco del rapporto; uno ignora la deformazione. Il rapporto negativo non confronta due resistenze passive positive.

## 08 — Uno scarto tra due resistenze

Il risultato corretto è 4 Ω. La proposta lo supera di 8−4=4 Ω. Il numero due è invece il rapporto proposta/corretto, e non ha unità di resistenza.

Passaggi: `R_{\rm corretto}=4\,\Omega\qquad e=(8-4)\,\Omega\qquad e=4\,\Omega`

Distrattori: −4 inverte l’ordine, otto copia la proposta e zero la accetta. Due puro è il fattore di sovrastima, non lo scarto richiesto.

## 09 — L’inversa conserva il quadrato

La relazione finale è R=R₀s². Poiché s≥1 e quindi s² non è zero, si divide per s² e si trova R₀=R/s². Il fattore di allungamento è puro e l’inversa conserva l’unità ohm.

Passaggi: `R=R_0s^2\qquad R_0=\frac{R}{s^2}\qquad [R_0]=\Omega`

Distrattori: Dividere per s annulla solo un fattore; moltiplicare per s² non isola R₀. Il reciproco s²/R ha unità Ω⁻¹ e il fattore due è arbitrario.

## 10 — Due preparazioni ammissibili

Sostituendo entrambi i fattori si ha R_B=(κ₁R₀,A)(κ₂s_A)². Nel rapporto con R_A resta κ₁κ₂². La seconda condizione sul dominio serve: un κ₂ positivo ma troppo piccolo potrebbe portare s_B sotto uno.

Passaggi: `R_B=\kappa_1R_{0,A}(\kappa_2s_A)^2\qquad R_B/R_A=\kappa_1\kappa_2^2`

Distrattori: κ₁κ₂ perde il secondo fattore geometrico. Dividere per κ₂² inverte l’allungamento; κ₁² aggiunge un quadrato a R₀ e l’ultimo quoziente rende inverso R₀.

## 11 — Cambiano entrambi i dati iniziali

A dà 1·4=4 Ω. B dà 2·9=18 Ω. Il rapporto è 18/4=9/2: il fattore due della resistenza iniziale si moltiplica per (3/2)²=9/4.

Passaggi: `R_A=4\,\Omega\qquad R_B=18\,\Omega\qquad R_B/R_A=\frac92`

Distrattori: Due considera solo R₀; 9/4 considera solo s. Tre usa la prima potenza di 3/2, mentre 2/9 è il reciproco.

## 12 — Media delle letture, non delle preparazioni

Le resistenze finali sono 4 e 18 Ω, quindi la media è 11 Ω. Con i dati medi R₀=3/2 Ω e s=5/2 si avrebbe invece (3/2)(25/4)=75/8 Ω. La dipendenza quadratica da s impedisce di sostituire automaticamente le medie degli ingressi.

Passaggi: `\overline R=\frac{4+18}{2}\,\Omega\qquad \overline R=11\,\Omega\qquad R_{\rm dati\ medi}=\frac{75}{8}\,\Omega`

Distrattori: 75/8 Ω usa i dati medi; 22 somma senza dimezzare; sette è metà della differenza; quattro ripete A. Due fili di prove separate non diventano resistori collegati in serie.

## 13 — Il bersaglio determina s

Il bersaglio è 18 Ω. Dividendo per R₀,B=2 Ω si trova s_B²=9 e il ramo s_B≥1 dà tre. Il rapporto richiesto con s_A=2 è 3/2, non il valore tre del fattore finale.

Passaggi: `R_B=18\,\Omega\qquad s_B^2=9\qquad s_B=3\qquad s_B/s_A=\frac32`

Distrattori: 2/3 è il reciproco, 9/4 confronta i quadrati e 9/2 copia il rapporto delle resistenze. Tre omette la divisione per s_A.

## 14 — Tarare prima di invertire

A ha R_A=4 Ω, quindi a=3 Ω⁻¹. La nuova lettura significa R_B=54/a=18 Ω. Dividendo per s_B²=9 si trova R₀,B=2 Ω. Il valore del display non è già una resistenza in ohm.

Passaggi: `a=3\,\Omega^{-1}\qquad R_B=18\,\Omega\qquad R_{0,B}=\frac{18}{9}\,\Omega\qquad R_{0,B}=2\,\Omega`

Distrattori: Sei Ω tratterebbe 54 come resistenza e ignorerebbe il guadagno. Diciotto Ω copia la finale; un Ω predirebbe D=27, non 54.

## 15 — Rimuovere anche l’offset

I riferimenti valgono 4 e 18 Ω. Il guadagno è (37−9)/(18−4)=2 Ω⁻¹ e b=1. C ha R_C=(25−1)/2=12 Ω; con s=2 la resistenza iniziale è 12/4=3 Ω.

Passaggi: `a=2\,\Omega^{-1}\qquad b=1\qquad R_C=12\,\Omega\qquad R_{0,C}=3\,\Omega`

Distrattori: 25/8 Ω omette b e predice D=26. Uno Ω torna ad A; sei Ω divide per s anziché per s² e darebbe D=49. Dodici Ω copia la finale e darebbe D=97.

## 16 — Un vincolo con potenza cubica

Sostituendo il vincolo si ottiene R=βs³. Il rapporto R/β=8 impone s³=8, quindi s=2, ammissibile e unico nel ramo s≥1. Allora R₀=1 Ω. Il coefficiente β ha unità ohm perché s è puro.

Passaggi: `R=\beta s^3\qquad s^3=\frac{4\,\Omega}{(1/2)\,\Omega}\qquad s^3=8\qquad s=2`

Distrattori: Otto copia s³; quattro non prende la radice cubica corretta. −2 non è un allungamento e darebbe R negativo con questo vincolo; non sono infinite soluzioni perché la misura fissa la scala cubica.

## Rilettura richiesta dal revisore distinto

Didascalia03 corretta da materiali a fili dello stesso materiale; desc accessibile dello SVG espresso con L₀,A₀ e prodotto invariato anziché coordinate. Geometria/stili invariati. Nuovo render nativo finale realmente exit0 e letto completo. Tutte le chiavi, i dati e i domini restano invariati; gli altri record sono stati confrontati con l’archivio byte-identico. Nessuna firma scientifica dell’autore. Due assembly finali identici e import temporaneo16→0/16 reali;991 pubblicati invariati. UI prodotto e approvazione umana NOT_RUN.
