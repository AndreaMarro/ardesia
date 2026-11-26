# force-uniform-electric-field-195 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json. SHA256 del file a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Letti tutti gli 80 prompt originali B195–199 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints sorgente. Snapshot allowlist dei 160 prompt SHA256 a7eb73daa238bba50af405409954cda487f97caf396a67922d7bdb3f087def1b.

Prima dei candidati il verificatore distinto A ha congelato gli 80 svolgimenti prompt-only B195–199, SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9. L’autore B non ha aperto quella primaria, né verificatori o risultati attesi altrui. Anche la primaria indipendente B sui soli originali A190–194 era stata congelata prima di candidature A.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c: lette C4-L01 «Cariche che si attraggono e si respingono», C4-L02 «Guardare il campo prima della forza», C4-L03 «Dal potenziale all’energia» e C4-L04 «Cariche mobili e cariche legate», con formule e prerequisiti effettivi. Il caso speciale 195-03 usa C4-L04; gli altri di questa famiglia C4-L02. Nessun ID di lezione inventato.

Si usa esclusivamente assemble_family della pipeline esistente, course C4/unit u6, astra/1 e ID AR-<sourceId>. Stati autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN. Nessuna pubblicazione, nessun registro/ledger/runtime o verificatore altrui modificato. I calcoli qui riportati sono dell’autore e non costituiscono review indipendente.

Controlli tecnici reali sui byte finali: due assembly identici, binding source/candidate/provenance validati e importatore canonico con SQLite temporaneo 16 nuove bozze, poi 0 nuove e 16 invariati. I 991 pubblicati restano byte identici e non appaiono nuove teste live. Le operazioni locali sono serializzate con flock su /private/tmp/cric-bounded-local-work.lock e guardia interna almeno 2 GiB prima dei child. Nessuna full suite locale.

SVG finale letto integralmente in XML e rendering nativo asset-only; PNG completo e manifest conservati in editorial/author-evidence/force-uniform-electric-field-195-asset-only. Nessun testo SVG risulta fuori dal viewBox nel controllo di bounding box. Questo non è una prova del lettore del prodotto, di axe o di overflow a 320 px: UI prodotto NOT_RUN, nessun report o marker sintetico.

Geometria per la review, espressa soltanto nelle note in coordinate intrinseche, non pixel CSS visibili: Il primo pannello distingue frecce schematiche del campo e della forza, con unità diverse: non si confrontano le loro lunghezze come moduli della stessa grandezza. Le barre centrali, dal comune x130, sono lunghe 240, 160, 200 unità intrinseche SVG per 6, 4, 5 mN: fattore 40 unità/mN. L’ultimo è una scena distinta di induzione; segni qualitativi non quantificano cariche o elettroni. Nella lettura preliminare i tre segni negativi risultavano troppo vicini al contorno: spostati verso l’interno, senza cambiare cerchio, barre o valori, e poi riletto il rendering completo finale.

## 01 — Dal campo alla forza

La relazione vettoriale è F⃗=qE⃗. Poiché q è positiva, la forza ha il verso del campo e il suo modulo è qE. Il prodotto dei prefissi è 10⁻⁶·10³=10⁻³: microcoulomb per kilonewton al coulomb danno millinewton. Due per tre vale sei, quindi F=6 mN.

Passaggi: `F=qE\qquad q=2\cdot10^{-6}\,\mathrm C\qquad E=3\cdot10^3\,\mathrm{N/C}\qquad F=6\cdot10^{-3}\,\mathrm N\qquad F=6\,\mathrm{mN}`

Distrattori: Sei newton perderebbero il fattore 10⁻³. Due copia q e tre copia E. Il valore 12 mN raddoppierebbe un fattore già incluso; il campo prescritto non va moltiplicato nuovamente per una carica sorgente.

## 02 — Una forza anche in millinewton

La forza ha dimensione di newton. Un millinewton è 10⁻³ N e cambia solo la scala numerica. In qE, i coulomb si cancellano: rimangono newton, non newton per coulomb.

Passaggi: `[F]=\mathrm C\cdot\mathrm{N/C}\qquad [F]=\mathrm N\qquad 1\,\mathrm{mN}=10^{-3}\,\mathrm N`

Distrattori: μC misura carica; kN/C e mN/C sono unità di campo elettrico. J è energia. Il prefisso milli non trasforma la forza in una grandezza diversa.

## 03 — Una sfera neutra si ridistribuisce

Gli elettroni mobili si spostano verso il lato vicino al corpo positivo. Sul lato lontano rimane un difetto di elettroni. Senza contatto o terra non cambia la carica totale della sfera: nasce una separazione superficiale. Il campo prodotto da questa ridistribuzione cancella nel metallo quello del corpo esterno, una volta raggiunto l’equilibrio.

Passaggi: `Q_{\rm sfera}=0\qquad \vec E_{\rm totale}=\vec0\quad\text{nel metallo}`

Distrattori: La carica negativa vicina non implica una carica netta negativa della sfera. Non entrano elettroni dal corpo separato e non si crea carica. Un campo interno non nullo continuerebbe a muovere le cariche libere. Il campo esterno alla sfera, invece, non deve essere nullo. Questo caso di induzione è distinto dalla carica di prova nel campo uniforme degli altri quesiti.

## 04 — Dimezzare la carica di prova

Il campo assegnato resta uguale e la forza è direttamente proporzionale a q. La carica B è metà di quella A, quindi F passa da 2·3=6 mN a 1·3=3 mN. Non si sta cambiando una sorgente che modifica anche E.

Passaggi: `F_A=6\,\mathrm{mN}\qquad F_B=3\,\mathrm{mN}\qquad F_B/F_A=1/2`

Distrattori: 12 mN rende inversa la dipendenza dalla carica. Sei ignora il cambiamento; uno copia il nuovo q. Nove somma numeri di grandezze diverse invece del prodotto qE.

## 05 — Ricavare la carica

Dividendo il modulo della forza per il campo si ottiene q=F/E. In SI 6·10⁻³ N diviso 3·10³ N/C vale 2·10⁻⁶ C, cioè 2 μC. Il denominatore positivo rende l’inversa univoca.

Passaggi: `q=F/E\qquad q=\frac{6\cdot10^{-3}}{3\cdot10^3}\,\mathrm C\qquad q=2\cdot10^{-6}\,\mathrm C\qquad q=2\,\mathrm{\mu C}`

Distrattori: Diciotto moltiplicherebbe F ed E, senza ottenere unità di carica. Sei copia la forza; un mezzo invertirebbe il quoziente numerico richiesto. La conversione non trasforma 2 μC in 2 C.

## 06 — Ricavare il campo esterno

Il rapporto F/q definisce il campo che agisce sulla prova. In SI 6·10⁻³ N diviso 2·10⁻⁶ C dà 3·10³ N/C, quindi 3 kN/C. Il fatto che q sia positiva fissa anche il verso: E⃗ è concorde con F⃗.

Passaggi: `E=F/q\qquad E=\frac{6\cdot10^{-3}}{2\cdot10^{-6}}\,\mathrm{N/C}\qquad E=3\cdot10^3\,\mathrm{N/C}\qquad E=3\,\mathrm{kN/C}`

Distrattori: Dodici moltiplica per la carica; tre N/C perderebbero il prefisso kilo. Due copia q e sei copia F. Se la prova fosse negativa, la relazione vettoriale resterebbe valida ma la forza avrebbe verso opposto al campo.

## 07 — Un campo più debole

Le forze sono 6 mN in A e 2 mN in B. Nel rapporto q si cancella e resta 1/3, il rapporto dei campi. Le due forze conservano lo stesso verso, perché la carica è positiva e il campo non è stato invertito.

Passaggi: `F_A=6\,\mathrm{mN}\qquad F_B=2\,\mathrm{mN}\qquad F_B/F_A=1/3`

Distrattori: Tre inverte B/A; uno ignora il cambiamento. Un nono introdurrebbe un quadrato assente in F=qE. Il segno negativo non descrive il rapporto di questi moduli positivi.

## 08 — Uno scarto in millinewton

La forza corretta è 6 mN. La proposta la supera di 12−6=+6 mN. Due è invece il rapporto fra proposta e valore corretto e non ha la dimensione della differenza chiesta.

Passaggi: `F=6\,\mathrm{mN}\qquad e=F_{\rm proposto}-F\qquad e=(12-6)\,\mathrm{mN}\qquad e=6\,\mathrm{mN}`

Distrattori: −6 mN cambia l’ordine; 12 mN copia la proposta e zero la accetta. Il rapporto puro due non può sostituire una differenza di forze.

## 09 — L’inversa con le unità

Dal prodotto F=qE si divide per E>0. Il rapporto ha unità N/(N/C)=C. Per i valori numerici in mN e kN/C, il numero F/E si esprime in μC: il fattore 10⁻³/10³ è 10⁻⁶.

Passaggi: `F=qE\qquad q=\frac FE\qquad [q]=\frac{\mathrm N}{\mathrm{N/C}}=\mathrm C`

Distrattori: Il prodotto non è una carica. E/F ha C⁻¹; F/E² introduce un fattore inverso di campo in più, mentre F²/E ha unità N·C. Nessuna di queste forme è l’inversa del prodotto iniziale.

## 10 — Due fattori indipendenti

Sostituendo entrambi i nuovi dati nel prodotto si ottiene F_B=κ₁κ₂q_AE_A. Dividere per F_A cancella il prodotto di riferimento e lascia κ₁κ₂. Il fatto che entrambi i dati siano elettrici non crea una dipendenza quadratica aggiuntiva da q.

Passaggi: `F_B=(\kappa_1q_A)(\kappa_2E_A)\qquad F_B=\kappa_1\kappa_2F_A\qquad F_B/F_A=\kappa_1\kappa_2`

Distrattori: I quozienti invertono una dipendenza diretta. La somma darebbe due per prove identiche; il quadrato aggiunto alla carica non compare nella definizione della forza in un campo assegnato.

## 11 — La carica cala e il campo cresce

A dà 6 mN, mentre B dà 4 mN. Il rapporto è 4/6=2/3. La carica dimezzata da sola darebbe metà forza, ma il campo è cresciuto di 4/3: il prodotto dei fattori è (1/2)(4/3)=2/3.

Passaggi: `F_A=6\,\mathrm{mN}\qquad F_B=4\,\mathrm{mN}\qquad F_B/F_A=2/3`

Distrattori: Tre mezzi è il reciproco. Un mezzo considera solo q e quattro terzi solo E. Uno presume una compensazione esatta che questi dati non realizzano.

## 12 — Media delle due forze

Le forze sono 6 e 4 mN. Somma dieci, metà cinque millinewton. Le medie dei dati sarebbero q=3/2 μC ed E=7/2 kN/C, il cui prodotto è 21/4 mN: un’altra prova, diversa dalla media richiesta.

Passaggi: `\overline F=\frac{6+4}{2}\,\mathrm{mN}\qquad \overline F=5\,\mathrm{mN}\qquad F(\overline q,\overline E)=\frac{21}{4}\,\mathrm{mN}`

Distrattori: 21/4 mN usa i dati medi. Dieci non dimezza, uno è metà della differenza e sei copia A. La media statistica non è una risultante che sommi forze su un medesimo corpo.

## 13 — Il bersaglio determina il campo

Il bersaglio è (2/3)·6=4 mN. Con q_B=1 μC serve E_B=4 kN/C. Il rapporto con i 3 kN/C iniziali è 4/3. Il fattore richiesto alla forza non si trasferisce da solo al campo perché è cambiata anche la carica.

Passaggi: `F_B=4\,\mathrm{mN}\qquad E_B=F_B/q_B\qquad E_B=4\,\mathrm{kN/C}\qquad E_B/E_A=4/3`

Distrattori: Tre quarti inverte il rapporto. Due terzi ignora il dimezzamento di q; due darebbe 6 mN e quattro copia il valore numerico del campo invece del suo rapporto.

## 14 — Un display prima della carica

A ha F=6 mN, quindi a=3 mN⁻¹. Il display B indica 12/(3 mN⁻¹)=4 mN. Dividendo per il campo 4 kN/C si ottiene q_B=1 μC. Il guadagno del display non è il campo e non sostituisce la conversione di unità.

Passaggi: `a=3\,\mathrm{mN^{-1}}\qquad F_B=4\,\mathrm{mN}\qquad q_B=F_B/E_B\qquad q_B=1\,\mathrm{\mu C}`

Distrattori: Tre μC userebbe D=12 direttamente come mN. Due μC predirebbero F=8 mN e D=24, non dodici. Quattro copia il numero della forza decodificata senza dividere per il campo.

## 15 — Guadagno e offset separati

I riferimenti hanno F_A=6 mN e F_B=4 mN. La differenza dà a=(13−9)/(6−4)=2 mN⁻¹; poi b=1. C ha F_C=(41−1)/2=20 mN. Con E_C=5 kN/C, la carica è 4 μC.

Passaggi: `a=2\,\mathrm{mN^{-1}}\qquad b=1\qquad F_C=20\,\mathrm{mN}\qquad q_C=4\,\mathrm{\mu C}`

Distrattori: 41/10 μC omette b, usa 41/2 mN e ricostruisce D=42. Due μC darebbero D=21, cinque D=51; venti copia il numero della forza. L’offset è strumentale, non una carica aggiuntiva del corpo.

## 16 — Un vincolo fra preparazioni

Poniamo x=E/(1 kN/C) e y=q/(1 μC), numeri puri. Il vincolo è y=(2/3)x e la forza numerica soddisfa 6=yx=(2/3)x². Quindi x²=9: soltanto x=3 rispetta campo positivo e carica positiva. Il risultato è E=3 kN/C, q=2 μC; il vincolo lega prove diverse, non un campo che dipende dalla prova durante una misura.

Passaggi: `x=\frac E{1\,\mathrm{kN/C}}\qquad y=\frac q{1\,\mathrm{\mu C}}\qquad 6=\frac23x^2\qquad x^2=9\qquad x=3\qquad E=3\,\mathrm{kN/C}`

Distrattori: −3 darebbe anche q negativo nel vincolo ed è fuori dal dominio. Nove copia il quadrato; E=2 kN/C darebbe F=8/3 mN e sei darebbe 24 mN. Il coefficiente β porta le unità necessarie e non si inserisce come puro 2/3 in una formula SI.
