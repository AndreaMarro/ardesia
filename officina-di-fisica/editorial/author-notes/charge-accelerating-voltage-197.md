# charge-accelerating-voltage-197 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json. SHA256 del file a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Letti tutti gli 80 prompt originali B195–199 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints sorgente. Snapshot allowlist dei 160 prompt SHA256 a7eb73daa238bba50af405409954cda487f97caf396a67922d7bdb3f087def1b.

Prima dei candidati il verificatore distinto A ha congelato gli 80 svolgimenti prompt-only B195–199, SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9. L’autore B non ha aperto quella primaria, né verificatori o risultati attesi altrui. Anche la primaria indipendente B sui soli originali A190–194 era stata congelata prima di candidature A.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c: lette le lezioni reali C4-L01/L02/L03/L04 con formule e prerequisiti effettivi. Primary C4-L03. Riletta C1-L007, che contiene K=mv²/2 e il teorema del lavoro totale. Non è richiesta C1-L006. U è tensione, non energia potenziale; si mantengono partenza da fermo, assenza di altri lavori, rapidità positiva e dominio non relativistico. Nessun ID di lezione inventato.

Si usa esclusivamente assemble_family della pipeline esistente, course C4/unit u6, astra/1 e ID AR-<sourceId>. Stati autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN. Nessuna pubblicazione, nessun registro/ledger/runtime o verificatore altrui modificato. I calcoli qui riportati sono dell’autore e non costituiscono review indipendente.

Controlli tecnici reali sui byte finali: due assembly identici, binding source/candidate/provenance validati e importatore canonico con SQLite temporaneo 16 nuove bozze, poi 0 nuove e 16 invariati. I 991 pubblicati restano byte identici e non appaiono nuove teste live. Le operazioni locali sono serializzate con flock su /private/tmp/cric-bounded-local-work.lock e guardia interna almeno 2 GiB prima dei child. Nessuna full suite locale.

SVG finale letto integralmente in XML e rendering nativo asset-only; PNG completo e manifest conservati in editorial/author-evidence/charge-accelerating-voltage-197-asset-only. Nessun testo SVG risulta fuori dal viewBox nel controllo di bounding box. Questo non è una prova del lettore del prodotto, di axe o di overflow a 320 px: UI prodotto NOT_RUN, nessun report o marker sintetico.

Geometria per la review, espressa soltanto nelle note in coordinate intrinseche, non pixel CSS visibili: Il primo pannello confronta due espressioni della stessa energia: qU e K_f, entrambe2 mJ, barre200 unità intrinseche da x150 al fattore100 unità/mJ. La curva centrale a m=1 g è la quadratica Bézier M100830 Q300830 500590: parametro a tra0 e1, v=4a m/s e K=8a² mJ, quindi K=v²/2 nelle unità dichiarate. Punti(2,2) e(4,8), assi indipendenti100 unità/(m/s) e30 unità/mJ; non è una traiettoria. Le barre finali2,3,5/2 m/s hanno lunghezze200,300,250 da x130, fattore100 unità/(m/s). La prova B della media ha massa diversa dalla curva.

## 01 — Dall’energia alla rapidità

Il campo compie lavoro qU=(1 μC)(2 kV)=2 mJ. La partenza da fermo dà K_f=mv²/2=qU. Con m=10⁻³ kg e qU=2·10⁻³ J si trova v²=4 m²/s², quindi v=2 m/s. Non si sceglie una velocità negativa da un bilancio che determina solo il modulo.

Passaggi: `qU=2\,\mathrm{mJ}\qquad \frac12mv^2=qU\qquad v^2=4\,\mathrm{m^2/s^2}\qquad v=2\,\mathrm{m/s}`

Distrattori: Quattro m/s copia v² come se fosse v; un m/s perde il fattore due del bilancio. Due km/s confonderebbe grammi con chilogrammi o i prefissi della tensione. Il lavoro è in millijoule, non in kilojoule.

## 02 — La dimensione di una rapidità

Una rapidità è lunghezza per tempo. Dal bilancio, 2qU/m ha unità J/kg=m²/s²; la radice quadrata lascia m/s. Il fatto che il fenomeno sia elettrico non rende la velocità una tensione.

Passaggi: `[2qU/m]=\mathrm{J/kg}\qquad [2qU/m]=\mathrm{m^2/s^2}\qquad [v]=\mathrm{m/s}`

Distrattori: m/s² indica accelerazione, J energia, V potenziale e kg massa. Sono grandezze presenti o correlate al problema, ma non l’unità dell’uscita richiesta.

## 03 — Il fattore due nasce da K

Il lavoro del campo è positivo perché q e la caduta U sono positivi. Uguagliando qU a mv²/2 si ottiene v²=2qU/m e poi la radice positiva. Senza il fattore due si userebbe K=mv²; senza radice si restituirebbe una grandezza con dimensioni di rapidità al quadrato.

Passaggi: `qU=\frac12mv^2\qquad v^2=\frac{2qU}{m}\qquad v=\sqrt{\frac{2qU}{m}}\qquad v>0`

Distrattori: 2qU/m e qU/m hanno unità m²/s², non m/s. La radice senza due ha la dimensione giusta ma il valore fisico sbagliato. La radice del quoziente inverso ha unità s/m. Non si scambiano caduta di potenziale ed energia potenziale.

## 04 — Quadruplicare la caduta

Il lavoro e l’energia cinetica quadruplicano, ma la rapidità dipende dalla loro radice. A ha v²=4 m²/s² e v=2 m/s; B ha v²=16 m²/s² e v=4 m/s. A massa fissa il fattore sulla rapidità è √4=2.

Passaggi: `v_A^2=4\,\mathrm{m^2/s^2}\qquad v_B^2=16\,\mathrm{m^2/s^2}\qquad v_A=2\,\mathrm{m/s}\qquad v_B=4\,\mathrm{m/s}`

Distrattori: Otto trasferisce il fattore quattro direttamente a v. Un m/s inverte la dipendenza da U; due ignora il cambiamento e sedici copia il valore del quadrato in B.

## 05 — La caduta da una rapidità

Il corpo ha K=mv²/2=(10⁻³ kg)(4 m²/s²)/2=2·10⁻³ J. Il lavoro è qU e la carica vale 10⁻⁶ C, quindi U=K/q=2·10³ V=2 kV. La rapidità va elevata al quadrato prima della divisione.

Passaggi: `U=\frac{mv^2}{2q}\qquad K=2\cdot10^{-3}\,\mathrm J\qquad U=2\cdot10^3\,\mathrm V\qquad U=2\,\mathrm{kV}`

Distrattori: Quattro kV ometterebbe il mezzo nell’energia cinetica. Due volt perderebbero il fattore kilo; un kV non fornirebbe l’energia cinetica richiesta. Non si interpreta 2 m/s come 2 m²/s².

## 06 — La massa dal lavoro disponibile

Il lavoro disponibile è qU=2 mJ. Dalla relazione cinetica m=2qU/v²: si divide 4 mJ per 4 m²/s² e si ottiene 10⁻³ kg, cioè un grammo. La massa positiva è univoca perché v è non nulla.

Passaggi: `qU=2\,\mathrm{mJ}\qquad m=\frac{2qU}{v^2}\qquad m=10^{-3}\,\mathrm{kg}\qquad m=1\,\mathrm g`

Distrattori: Due grammi perderebbero il quadrato di v in questo calcolo numerico; mezzo grammo ometterebbe il due al numeratore. Un chilogrammo perderebbe il prefisso milli dell’energia. La formula non è m=qU/v.

## 07 — La massa raddoppia

Il lavoro è lo stesso in entrambe le prove. In A v_A=2 m/s; in B v_B²=2 m²/s² e v_B=√2 m/s. Il rapporto è √2/2, equivalente a 1/√2. Raddoppiare la massa dimezza v², non v.

Passaggi: `v_A=2\,\mathrm{m/s}\qquad v_B=\sqrt2\,\mathrm{m/s}\qquad \frac{v_B}{v_A}=\frac{\sqrt2}{2}`

Distrattori: Un mezzo è il rapporto dei quadrati. √2 è il reciproco del rapporto richiesto, due rende diretta la dipendenza dalla massa e uno presume rapidità invariata. La radice resta esatta, senza sostituirla con un decimale.

## 08 — Uno scarto di rapidità

Il bilancio dà v=2 m/s. La proposta è maggiore di due metri al secondo: 4−2=+2 m/s. Quattro è il numero di v² nelle unità assegnate, ma non la rapidità corretta.

Passaggi: `v=2\,\mathrm{m/s}\qquad e=v_{\rm proposto}-v\qquad e=(4-2)\,\mathrm{m/s}\qquad e=2\,\mathrm{m/s}`

Distrattori: −2 inverte lo scarto, quattro copia la proposta e zero la accetta. Il numero puro due è il rapporto proposta/corretto; non misura una differenza di rapidità.

## 09 — Isolare U dal bilancio

Moltiplichiamo l’equazione cinetica per due oppure usiamo direttamente K=mv²/2. Dividere per q dà U=mv²/(2q). Le unità sono J/C=V. Nelle unità numeriche assegnate, con q fissata, u=U/(1 kV), M=m/(1 g), w=v/(1 m/s) soddisfano u=Mw²/2.

Passaggi: `qU=\frac12mv^2\qquad U=\frac{mv^2}{2q}\qquad [U]=\mathrm{J/C}\qquad [U]=\mathrm V`

Distrattori: 2mv²/q è quattro volte la formula corretta. Sostituire v a v² altera anche le dimensioni; il quoziente inverso ha V⁻¹. Scambiare massa e carica non deriva dall’equazione dell’energia.

## 10 — Due preparazioni riscalate

La carica fissata e il fattore due si cancellano nel rapporto dei quadrati: v_B²/v_A²=κ₁/κ₂. Le rapidità sono positive, quindi il rapporto richiesto è la radice positiva √(κ₁/κ₂). Un fattore comune su U e m lascia invariata v.

Passaggi: `\frac{v_B^2}{v_A^2}=\frac{\kappa_1}{\kappa_2}\qquad \frac{v_B}{v_A}=\sqrt{\frac{\kappa_1}{\kappa_2}}`

Distrattori: κ₁/κ₂ è il rapporto dei quadrati. La radice inversa scambia A e B; il prodotto rende diretta la dipendenza dalla massa. κ₁/√κ₂ applica la radice solo alla massa, dimenticando quella della caduta.

## 11 — Due rapidità intere

A ha v_A=2 m/s. In B il numero di v_B² è 2·9/2=9, quindi v_B=3 m/s. Il rapporto è tre mezzi. Il rapporto delle energie non basta da solo perché è cambiata anche la massa.

Passaggi: `v_A=2\,\mathrm{m/s}\qquad v_B^2=9\,\mathrm{m^2/s^2}\qquad v_B=3\,\mathrm{m/s}\qquad v_B/v_A=3/2`

Distrattori: Due terzi inverte il confronto. 9/2 considera il solo rapporto delle tensioni; tre copia la rapidità B e 9/4 è il rapporto dei quadrati delle due rapidità.

## 12 — La media delle rapidità

Le rapidità sono 2 e 3 m/s, dunque la media è 5/2 m/s. Ai dati medi U=11/2 kV e m=3/2 g si avrebbe v²=22/3 m²/s² e v=√(22/3) m/s. È diverso: il quadrato della media richiesta è 25/4, mentre 22/3 vale 88/12 e 25/4 vale 75/12. Non serve approssimare la radice.

Passaggi: `\overline v=\frac{2+3}{2}\,\mathrm{m/s}\qquad \overline v=5/2\,\mathrm{m/s}\qquad v(\overline U,\overline m)=\sqrt{22/3}\,\mathrm{m/s}`

Distrattori: La radice √(22/3) usa gli ingressi medi. Cinque non dimezza la somma; un mezzo dimezza la differenza e tre copia B. Il modello non è lineare nelle due grandezze che variano.

## 13 — Il bersaglio fissa la massa

A ha rapidità 2 m/s, quindi il bersaglio B è 3 m/s. Il lavoro B è 9 mJ. La massa necessaria è 2·9 mJ/(9 m²/s²)=2 g, il doppio di quella A. Il rapporto delle rapidità va prima elevato al quadrato per usarlo nel bilancio.

Passaggi: `v_B=3\,\mathrm{m/s}\qquad m_B=\frac{2qU_B}{v_B^2}\qquad m_B=2\,\mathrm g\qquad m_B/m_A=2`

Distrattori: Un mezzo inverte il confronto. 9/2 segue soltanto U, tre mezzi copia il bersaglio su v. Quattro grammi darebbero v_B²=9/2 m²/s², non i 9 m²/s² richiesti.

## 14 — Tarare una misura di rapidità

Il riferimento ha v=2 m/s, quindi a=3 s/m. La lettura B indica v_B=3 m/s. Con massa 2 g l’energia cinetica è 9 mJ; la carica fissata 1 μC richiede U_B=9 kV. Il display non legge direttamente energia o tensione.

Passaggi: `a=3\,\mathrm{s/m}\qquad v_B=3\,\mathrm{m/s}\qquad K_B=9\,\mathrm{mJ}\qquad U_B=9\,\mathrm{kV}`

Distrattori: Usare D=9 come m/s darebbe U=81 kV con questa massa. Tre copia la rapidità e due copia il riferimento. La tensione si ricava solo dopo la decodifica e il quadrato della rapidità.

## 15 — L’offset viene prima del quadrato

A e B hanno rapidità 2 e 3 m/s. a=(7−5)/(3−2)=2 s/m e b=1. C ha v_C=(9−1)/2=4 m/s. Con m=1 g serve U_C=8 kV: prima si rimuove l’offset, poi si eleva al quadrato la rapidità fisica.

Passaggi: `a=2\,\mathrm{s/m}\qquad b=1\qquad v_C=4\,\mathrm{m/s}\qquad U_C=8\,\mathrm{kV}`

Distrattori: 81/8 kV omette b, usa v=9/2 m/s e ricostruisce D=10. Quattro copia il numero della rapidità; nove copierebbe la tensione B pur cambiando massa. Sedici omette il mezzo nell’inversa e produrrebbe v_C²=32 m²/s².

## 16 — Una famiglia continua di coppie

Sostituendo U=αm nel rapporto energetico, v²=2qα e la massa si cancella per m>0. α=2·10⁶ V/kg e q=10⁻⁶ C danno v²=4 m²/s²: il dato misurato è già conseguenza del vincolo. Per ogni massa positiva esiste U=αm, per esempio 1 g e 2 kV oppure 3/2 g e 3 kV. La scala è continua nel modello e non si determina una sola coppia.

Passaggi: `U=\alpha m\qquad v^2=\frac{2q\alpha m}{m}\qquad v^2=2q\alpha\qquad v=2\,\mathrm{m/s}`

Distrattori: Le coppie specifiche proposte sono esempi, non uniche soluzioni. Non sono tutte le masse con U=2 kV fisso: il vincolo richiede di cambiare U insieme a m. Non si importa qui il vincolo intero dei conteggi di microstati di un altro modello.
