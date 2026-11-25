# pressure-gradient-fixed-speed-116 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-04.json. Letti individualmente tutti gli 80 originali 112–116 prima della scrittura, comprese le varianti concettuali 114-03, 115-03, 116-03 e l’analisi dimensionale 116-08. Riletti i testi reali delle lezioni C2-L007/L008/L009 e le loro dipendenze. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Queste sono note di calcolo per un revisore distinto.

Velocità media imposta, non portata imposta: Q = πr²v̄ elimina due potenze di r dalla legge di Poiseuille. G = Δp/L è un modulo positivo, mentre dp/dx = −G nel verso del flusso. Conversioni mPa·s e mm esplicite prima del quadrato. Il quesito 03 distingue incomprimibilità e assenza di viscosità; 08 analizza la dimensione del Reynolds fornito senza soglie universali. 12: media 60 Pa/m distinta da 160/3 Pa/m agli ingressi medi. 16: c = 1 mPa·s/mm = 1 Pa·s/m in η = cr, che cancella un fattore r. SVG: sezioni circolari 40 px/mm, frecce di media esterne da 100 px a 10000 px/(m/s); rapporto di aree con scala 80 px/unità; grafico pressorio con offset 99900 Pa dichiarato e pendenze negative.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata; le grandezze con unità diverse non vengono confrontate con la stessa scala. Frecce su path separati, formule suddivise con law_steps. Nessun CSS, renderer o gate modificato.

## 01 — Un gradiente da viscosità e raggio

Poiseuille fornisce Q=πr⁴G/(8η), ma qui si mantiene la velocità media: Q=πr²v̄. Uguagliando le portate si cancellano π e due potenze del raggio, lasciando G=8ηv̄/r². Prima dei numeri convertiamo sia il prefisso della viscosità sia quello del raggio, che viene elevato al quadrato.

Passaggi: `G=\frac{8\eta\bar v}{r^2}\qquad \eta=10^{-3}\,\mathrm{Pa\,s}\qquad r=10^{-3}\,\mathrm m\qquad r^2=10^{-6}\,\mathrm{m^2}\qquad G=8\times10^{-5+6}\,\mathrm{Pa/m}\qquad G=80\,\mathrm{Pa/m}`

Errori e controllo: Il conto a mano usa −3−2−(−6)=1 nell’esponente, poi 8·10=80. Un gradiente di −80 Pa/m è dp/dx, non il modulo G chiesto. Ottomila o otto centesimi segnalerebbero prefissi o quadrati convertiti in modo incoerente.

## 02 — Pressione per distanza

G è una differenza di pressione divisa per una lunghezza lungo il tubo. Anche 8ηv̄/r² restituisce questa unità: Pa·s per m/s, diviso m², dà Pa/m. Non è la caduta di pressione di un tratto finché non viene moltiplicato per la sua lunghezza.

Passaggi: `G=\Delta p/L\qquad [G]=\mathrm{Pa/m}\qquad \Delta p=GL`

Errori e controllo: Pa esprime Δp, N una forza, m/s la velocità media e Pa·s la viscosità. Per due tratti identici di lunghezza doppia G può restare uguale mentre Δp raddoppia.

## 03 — Incomprimibile non significa senza attrito

L’incomprimibilità riguarda la risposta del volume e della densità di un elemento materiale, non la resistenza agli sforzi tangenziali. Nel modello omogeneo la stessa densità collega conservazione della massa e portata volumetrica; il fluido può comunque avere η>0, aderire alla parete e richiedere una caduta di pressione per scorrere.

Passaggi: `m=\rho V\qquad m\ \mathrm{costante}\qquad \rho\ \mathrm{costante}\qquad V\ \mathrm{costante}`

Errori e controllo: Viscosità nulla è l’ipotesi inviscida, distinta. Pressione e velocità possono variare spazialmente in un fluido incomprimibile, e il profilo laminare non è uniforme. Il vincolo sul volume di un elemento materiale non impedisce il suo spostamento.

## 04 — Più viscosità, stessa velocità media

A raggio e velocità media invariati, G è direttamente proporzionale alla viscosità. Il suo raddoppio richiede un gradiente doppio, da ottanta a centosessanta Pa/m. Poiché anche l’area resta uguale, in questo confronto particolare la portata non cambia.

Passaggi: `G_A=80\,\mathrm{Pa/m}\qquad G_B=2G_A\qquad G_B=160\,\mathrm{Pa/m}`

Errori e controllo: Quaranta inverte il fattore di viscosità; trecentoventi lo eleva al quadrato benché η compaia alla prima potenza. Ottanta o zero non manterrebbero la stessa velocità media nel nuovo stato resistivo.

## 05 — La viscosità dal modulo del gradiente

Isoliamo η=Gr²/(8v̄) in unità SI. Il raggio al quadrato è 10⁻⁶ m² e 8v̄ vale 8/100 m/s. Il rapporto dà un millesimo di Pa·s, cioè un mPa·s: il risultato va espresso nell’unità richiesta, non soltanto in quella usata nel passaggio intermedio.

Passaggi: `\eta=\frac{Gr^2}{8\bar v}\qquad r^2=10^{-6}\,\mathrm{m^2}\qquad \eta=10^{-3}\,\mathrm{Pa\,s}\qquad \eta=1\,\mathrm{mPa\,s}`

Errori e controllo: Il valore 10⁻³ sarebbe corretto se l’unità fosse Pa·s, ma non come numero di mPa·s. Dimenticare il quadrato del millimetro altera il fattore di conversione di mille.

## 06 — Il raggio da una radice positiva

Dalla formula del gradiente si ricava r²=8ηv̄/G. Con la viscosità convertita in Pa·s risulta 10⁻⁶ m². La radice positiva è 10⁻³ m, un millimetro. Un raggio è una lunghezza positiva e non una coordinata orientata.

Passaggi: `r^2=\frac{8\eta\bar v}{G}\qquad r^2=10^{-6}\,\mathrm{m^2}\qquad r=10^{-3}\,\mathrm m\qquad r=1\,\mathrm{mm}`

Errori e controllo: Un millimetro quadrato sarebbe il valore di r², non il raggio. Il ramo negativo risolverebbe l’equazione del quadrato ma non la geometria del tubo.

## 07 — Raggio doppio a velocità media imposta

Con v̄ mantenuta, il gradiente è inversamente proporzionale a r². Raddoppiare il raggio riduce G a un quarto: da ottanta a venti Pa/m. Intanto Q=πr²v̄ diventa quadrupla; non si sta mantenendo fissa Q come in un altro confronto possibile.

Passaggi: `G_B/G_A=\left(\frac{r_A}{r_B}\right)^2\qquad G_B/G_A=\frac14\qquad G_B=20\,\mathrm{Pa/m}`

Errori e controllo: Quattro ha il verso opposto; un sedicesimo applicherebbe la quarta potenza valida a portata imposta, non a velocità media imposta. Un mezzo dimentica il quadrato e uno ignora la geometria nuova.

## 08 — Reynolds: controllare le dimensioni

Il numeratore ha dimensioni kg/(m·s): la densità perde due potenze di lunghezza nel prodotto con velocità e diametro. La viscosità dinamica ha esattamente la stessa dimensione, perché Pa·s=kg/(m·s). Il loro rapporto è quindi un numero puro.

Passaggi: `[\rho\bar vD]=\frac{\mathrm{kg}}{\mathrm{m\,s}}\qquad [\eta]=\frac{\mathrm{kg}}{\mathrm{m\,s}}\qquad [Re]=1`

Errori e controllo: Pressione, velocità, densità e viscosità sono grandezze dimensionali, non l’unità di Re. Una stima di Re può aiutare a discutere il regime; la sola cancellazione delle unità non stabilisce che un flusso sia laminare, né introduce una soglia universale.

## 09 — La viscosità nell’inversa generale

Moltiplichiamo G=8ηv̄/r² per r² e dividiamo per 8v̄>0. Restano le due potenze del raggio e il fattore otto. Pa/m per m², diviso m/s, restituisce Pa·s: l’inversa è una viscosità, non una resistenza idraulica.

Passaggi: `Gr^2=8\eta\bar v\qquad \eta=\frac{Gr^2}{8\bar v}\qquad [\eta]=\mathrm{Pa\,s}`

Errori e controllo: Rimettere r² al denominatore rovescia l’isolamento; un solo r perde una lunghezza. La frazione reciproca ha unità di viscosità inversa e omettere l’otto sovrastima η di otto volte.

## 10 — Scalare viscosità e raggio

La viscosità fornisce un fattore diretto κ₁ e il raggio al denominatore un fattore κ₂². Il rapporto di velocità media è uno perché quel dato è mantenuto. Il risultato non è la legge di scalatura della portata a pressione fissata.

Passaggi: `G_B=\frac{8\kappa_1\eta_A\bar v}{\kappa_2^2r_A^2}\qquad G_B/G_A=\frac{\kappa_1}{\kappa_2^2}`

Errori e controllo: Il prodotto inverte l’effetto del raggio, la quarta potenza appartiene a un altro controllo sperimentale. Il quadrato di κ₁ attribuisce l’esponente alla viscosità e l’ultima opzione inverte i due stati.

## 11 — Due raddoppi con effetti diversi

La viscosità doppia richiede un fattore due, mentre il raggio doppio divide per quattro. Il prodotto lascia un mezzo: G passa da ottanta a quaranta Pa/m. Il bilancio dei fattori mostra perché non basta osservare una sola grandezza.

Passaggi: `G_A=80\,\mathrm{Pa/m}\qquad G_B=40\,\mathrm{Pa/m}\qquad G_B/G_A=\frac24\qquad G_B/G_A=\frac12`

Errori e controllo: Due segue soltanto η, un quarto soltanto r² e un ottavo usa erroneamente r⁴. Quaranta è il valore numerico del gradiente B, non il rapporto adimensionale.

## 12 — La media dei gradienti richiesti

I due moduli del gradiente sono ottanta e quaranta Pa/m. La loro semisomma è sessanta Pa/m. Non si mediano prima i raggi, perché il raggio compare al quadrato al denominatore del modello.

Passaggi: `\overline G=\frac{80+40}{2}\,\mathrm{Pa/m}\qquad \overline G=60\,\mathrm{Pa/m}`

Errori e controllo: Centoventi è la somma e trenta dimezza ancora. Quaranta è solo il secondo risultato e anche la differenza. Con η_media=3/2 mPa·s e r_medio=3/2 mm il modello darebbe 160/3 Pa/m, minore della media richiesta di 20/3 Pa/m.

## 13 — Il raggio per dimezzare il gradiente

Il bersaglio è quaranta Pa/m. La viscosità fornisce un fattore due, quindi il quadrato del rapporto dei raggi deve fornire un divisore quattro. La radice positiva dà r_B/r_A=2, realizzata da r_B=2 mm.

Passaggi: `\frac12=\frac{2}{(r_B/r_A)^2}\qquad (r_B/r_A)^2=4\qquad r_B/r_A=2`

Errori e controllo: Un mezzo rovescia il rapporto, quattro copia il rapporto dei quadrati e Tre mezzi darebbe un fattore 2/(9/4)=8/9 per G, non un mezzo. Uno non sfrutta alcuna variazione geometrica.

## 14 — Una lettura proporzionale del gradiente

Il riferimento vale ottanta Pa/m e fissa q=3 m/Pa. La nuova lettura corrisponde a quaranta Pa/m. Con raggio doppio occorre viscosità doppia per ottenere quel dimezzamento del gradiente, quindi η_B=2 mPa·s; l’inversa SI restituisce lo stesso risultato.

Passaggi: `q=3\,\mathrm{m/Pa}\qquad G_B=40\,\mathrm{Pa/m}\qquad \eta_B=\frac{G_Br_B^2}{8\bar v}\qquad \eta_B=2\,\mathrm{mPa\,s}`

Errori e controllo: La lettura 120 non è un gradiente in Pa/m: usarla direttamente triplicherebbe la viscosità inferita. Il raggio noto va prima convertito e poi elevato al quadrato nella formula SI.

## 15 — Due riferimenti prima dell’inversa

A e B richiedono rispettivamente ottanta e quaranta Pa/m. La differenza delle letture ottanta su quaranta Pa/m fissa q=2 m/Pa; segue z=1. C ha G=(321−1)/2=160 Pa/m. Al raggio iniziale questo è il doppio del riferimento, perciò la viscosità è due mPa·s.

Passaggi: `q=2\,\mathrm{m/Pa}\qquad z=1\qquad G_C=160\,\mathrm{Pa/m}\qquad \eta_C=2\,\mathrm{mPa\,s}`

Errori e controllo: Al raggio di un mm, le viscosità 1,4,1/2,3 mPa·s darebbero letture 161,641,81,481. Soltanto due produce 321. Saltare l’offset cambia il gradiente prima dell’inversa fisica.

## 16 — Viscosità proporzionale al raggio

Sostituendo il vincolo si cancella una delle due potenze del raggio: G=8cv̄/r. Il coefficiente c vale esattamente 1 Pa·s/m nelle unità SI. Il prodotto 8cv̄ è 8/100 Pa; dividendolo per ottanta Pa/m si trova 1/1000 m, cioè un mm. La viscosità associata è un mPa·s.

Passaggi: `c=1\,\mathrm{Pa\,s/m}\qquad G=\frac{8c\bar v}{r}\qquad r=\frac{8c\bar v}{G}\qquad r=10^{-3}\,\mathrm m\qquad r=1\,\mathrm{mm}`

Errori e controllo: Non resta una radice quadrata: il vincolo ha già cancellato un fattore r. Zero o r negativo violerebbero la geometria e la viscosità positiva. Il coefficiente porta unità viscosità/lunghezza e collega prove diverse, senza imporre una variazione della viscosità lungo lo stesso tubo.
