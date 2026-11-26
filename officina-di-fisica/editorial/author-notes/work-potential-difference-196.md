# work-potential-difference-196 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json. SHA256 del file a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Letti tutti gli 80 prompt originali B195–199 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints sorgente. Snapshot allowlist dei 160 prompt SHA256 a7eb73daa238bba50af405409954cda487f97caf396a67922d7bdb3f087def1b.

Prima dei candidati il verificatore distinto A ha congelato gli 80 svolgimenti prompt-only B195–199, SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9. L’autore B non ha aperto quella primaria, né verificatori o risultati attesi altrui. Anche la primaria indipendente B sui soli originali A190–194 era stata congelata prima di candidature A.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c: lette C4-L01 «Cariche che si attraggono e si respingono», C4-L02 «Guardare il campo prima della forza», C4-L03 «Dal potenziale all’energia» e C4-L04 «Cariche mobili e cariche legate», con formule e prerequisiti effettivi. Primary C4-L03 per lavoro e bilancio energetico, con prerequisiti meccanici reali. La caduta è rinominata δ=V_A−V_B per distinguerla da ΔV=V_B−V_A della lezione. Il caso196-08 conserva elettrone negativo e soli lavori elettrici. Nessun ID di lezione inventato.

Si usa esclusivamente assemble_family della pipeline esistente, course C4/unit u6, astra/1 e ID AR-<sourceId>. Stati autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN. Nessuna pubblicazione, nessun registro/ledger/runtime o verificatore altrui modificato. I calcoli qui riportati sono dell’autore e non costituiscono review indipendente.

Controlli tecnici reali sui byte finali: due assembly identici, binding source/candidate/provenance validati e importatore canonico con SQLite temporaneo 16 nuove bozze, poi 0 nuove e 16 invariati. I 991 pubblicati restano byte identici e non appaiono nuove teste live. Le operazioni locali sono serializzate con flock su /private/tmp/cric-bounded-local-work.lock e guardia interna almeno 2 GiB prima dei child. Nessuna full suite locale.

SVG finale letto integralmente in XML e rendering nativo asset-only; PNG completo e manifest conservati in editorial/author-evidence/work-potential-difference-196-asset-only. Nessun testo SVG risulta fuori dal viewBox nel controllo di bounding box. Questo non è una prova del lettore del prodotto, di axe o di overflow a 320 px: UI prodotto NOT_RUN, nessun report o marker sintetico.

Geometria per la review, espressa soltanto nelle note in coordinate intrinseche, non pixel CSS visibili: Il primo pannello sceglie un riferimento possibile con V_A=3 V e V_B=0 V, senza imporre una distanza o una legge uniforme del campo. La carica positiva perde6 μJ di energia potenziale e il lavoro è+6 μJ; non si attribuisce automaticamente tale energia a K. Le barre dei lavori hanno origine x130 e lunghezze240,200,220 per6,5,11/2 μJ: fattore 40 unità intrinseche/μJ. L’ultimo è il caso distinto dell’elettrone con q negativo e potenziali−2,+3 kV, lavoro e K_f5 keV. Frecce schematiche di passaggio, non scala di posizione o velocità.

## 01 — Il campo lavora durante una caduta

Il potenziale finale è minore di quello iniziale. L’energia potenziale elettrica cambia di ΔU_e=q(V_B−V_A)=−qδ, quindi il campo compie W=−ΔU_e=qδ. Microcoulomb per volt danno microjoule: il prodotto 2·3 vale 6 μJ, positivo.

Passaggi: `\Delta U_e=q(V_B-V_A)\qquad W=-\Delta U_e\qquad W=q\delta\qquad W=6\,\mathrm{\mu J}`

Distrattori: −6 μJ sarebbe la variazione di energia potenziale, non il lavoro del campo. Due o tre copiano un solo dato. Sei joule perderebbero il prefisso micro; 12 μJ raddoppierebbe ancora un fattore già compreso.

## 02 — Lavoro ed energia hanno la stessa unità

Un lavoro è un trasferimento di energia e ha unità joule. Nel prodotto qδ si ha C·V=C·J/C=J; una carica in μC e una caduta in V danno μJ. La lettera W indica qui il lavoro, mentre il simbolo di unità W significa watt: contesto e unità vanno distinti.

Passaggi: `[W]=\mathrm C\cdot\mathrm V\qquad [W]=\mathrm J\qquad 1\,\mathrm{\mu J}=10^{-6}\,\mathrm J`

Distrattori: μC è carica, V potenziale e N/C campo. Il watt è potenza, energia per tempo; manca una durata per trasformare questo lavoro in una potenza media.

## 03 — Il segno viene dagli estremi

Un campo elettrostatico è conservativo: il suo lavoro dipende dagli estremi, non dal percorso. Per q>0 che scende di potenziale, l’energia potenziale diminuisce e W=q(V_A−V_B)=qδ>0. Questo è il contributo elettrico: diventa anche ΔK soltanto se gli altri lavori sono nulli.

Passaggi: `W=q(V_A-V_B)\qquad \delta=V_A-V_B\qquad W=q\delta\qquad W>0`

Distrattori: Il meno darebbe ΔU_e al posto del lavoro. I quozienti non sono lavori: q/δ ha C/V e δ/q ha V/C. Il quadrato della caduta introduce un volt in più. Un cambiamento comune dello zero dei due potenziali non cambia δ o W.

## 04 — Meno carica, meno lavoro

La caduta resta la stessa, quindi W è lineare nella carica trasportata. A dà 2·3=6 μJ e B dà 1·3=3 μJ. Il lavoro rimane positivo: dimezzare una carica positiva non ne cambia il segno.

Passaggi: `W_A=6\,\mathrm{\mu J}\qquad W_B=3\,\mathrm{\mu J}\qquad W_B/W_A=1/2`

Distrattori: Dodici rende inversa la dipendenza dalla carica. Sei ignora il cambiamento; uno copia q_B e −3 confonde il lavoro con la diminuzione di energia potenziale.

## 05 — La carica dal lavoro

Isoliamo q=W/δ. In SI 6·10⁻⁶ J diviso 3 J/C dà 2·10⁻⁶ C, cioè 2 μC. Un lavoro positivo su una caduta positiva è coerente con il ramo q>0.

Passaggi: `q=\frac W\delta\qquad q=\frac{6\cdot10^{-6}}3\,\mathrm C\qquad q=2\,\mathrm{\mu C}`

Distrattori: Diciotto moltiplica lavoro e potenziale anziché dividere. Sei copia W e un mezzo usa il quoziente inverso, che non ha dimensione di carica. Non si aggiunge un segno meno all’inversa dopo aver già definito la caduta positiva.

## 06 — La caduta dal lavoro

Dal prodotto W=qδ si ha δ=W/q. Il prefisso micro compare sia nei joule sia nei coulomb e si cancella: 6/2=3 J/C=3 V. Il risultato è una differenza fra due potenziali, non il valore assoluto di uno dei punti.

Passaggi: `\delta=W/q\qquad \delta=\frac{6\,\mathrm{\mu J}}{2\,\mathrm{\mu C}}\qquad \delta=3\,\mathrm V`

Distrattori: Dodici moltiplica i dati. Tre microvolt introdurrebbero un prefisso che invece si è cancellato; −3 V sarebbe V_B−V_A. Sei copia il numero del lavoro senza dividerlo per la carica.

## 07 — Un dislivello elettrico minore

A dà 6 μJ, B dà 2 μJ. Nel rapporto la carica comune si cancella: resta δ_B/δ_A=1/3. Le due cadute sono positive, quindi entrambi i lavori sono positivi.

Passaggi: `W_A=6\,\mathrm{\mu J}\qquad W_B=2\,\mathrm{\mu J}\qquad W_B/W_A=1/3`

Distrattori: Tre inverte il rapporto, uno ignora il cambiamento e un nono introduce un quadrato assente. Il segno negativo richiederebbe un diverso segno della carica o della caduta, non questi dati.

## 08 — Un elettrone sale di potenziale

Qui la carica è negativa e il potenziale aumenta. V_A−V_B=−5 kV; il prodotto con q=−e è positivo. Il campo compie 5 keV di lavoro. Non ci sono altri lavori e l’elettrone parte da fermo, quindi questo lavoro è tutta l’energia cinetica finale. Non occorre calcolare una velocità o usare la formula cinetica non relativistica.

Passaggi: `V_A-V_B=-5\,\mathrm{kV}\qquad W=(-e)(-5\,\mathrm{kV})\qquad W=5\,\mathrm{keV}\qquad K_f=5\,\mathrm{keV}`

Distrattori: −5 keV perde uno dei due segni e non può essere un’energia cinetica finale. Un keV nasce dalla sottrazione dei moduli 3−2 invece della differenza +3−(−2). Tre e due copiano un solo estremo. L’elettronvolt è energia, non potenziale.

## 09 — Isolare q dal bilancio

Poiché δ>0, il prodotto W=qδ può essere diviso per δ senza ambiguità: q=W/δ. L’unità J/V è C. Le stesse operazioni sui valori in μJ e V restituiscono il numero di μC.

Passaggi: `W=q\delta\qquad q=\frac W\delta\qquad [q]=\mathrm{J/V}\qquad [q]=\mathrm C`

Distrattori: Moltiplicare per δ aggiunge un volt. Il quoziente inverso ha C⁻¹; dividere per δ² aggiunge un volt inverso rispetto alla forma corretta. W²/δ ha unità J·C e non è una carica.

## 10 — Due fattori nel lavoro

Scrivendo il lavoro B con entrambi i dati nuovi si ha W_B=(κ₁q_A)(κ₂δ_A). Dividendo per il lavoro A rimane il prodotto dei fattori. Se entrambi valgono uno, si ritrova una prova identica e rapporto uno.

Passaggi: `W_B=\kappa_1\kappa_2q_A\delta_A\qquad W_A=q_A\delta_A\qquad W_B/W_A=\kappa_1\kappa_2`

Distrattori: I quozienti invertono una dipendenza diretta. La somma darebbe due per prove identiche, mentre il quadrato della caduta non compare nella legge del lavoro.

## 11 — Il nuovo lavoro resta positivo

A dà 6 μJ e B dà 5 μJ. Il quoziente B/A è 5/6. La caduta maggiore non basta a compensare completamente la carica dimezzata: si deve considerare il prodotto, non uno solo dei due cambiamenti.

Passaggi: `W_A=6\,\mathrm{\mu J}\qquad W_B=5\,\mathrm{\mu J}\qquad W_B/W_A=5/6`

Distrattori: Sei quinti è il reciproco. Un mezzo considera solo q, cinque terzi solo δ; uno presume una compensazione esatta che i dati non danno.

## 12 — Media di due trasferimenti

Le due letture sono 6 e 5 μJ. La loro media è 11/2 μJ. Ai dati medi q=3/2 μC e δ=4 V si avrebbe invece 6 μJ: è un altro prodotto e non questa media delle uscite. Non si stanno sommando lavori successivi in un unico percorso.

Passaggi: `\overline W=\frac{6+5}{2}\,\mathrm{\mu J}\qquad \overline W=11/2\,\mathrm{\mu J}\qquad W(\overline q,\overline\delta)=6\,\mathrm{\mu J}`

Distrattori: Sei usa i dati medi oppure copia A. Undici non dimezza la somma; un mezzo è metà della differenza e cinque copia B. La media può essere frazionaria anche con dati interi nelle unità scelte.

## 13 — La caduta per il bersaglio

Il bersaglio è 5 μJ. Con un microcoulomb occorre una caduta di 5 V; il rapporto con i 3 V di A è 5/3. Il rapporto dei lavori non è quello delle cadute quando la carica cambia.

Passaggi: `W_B=5\,\mathrm{\mu J}\qquad \delta_B=W_B/q_B\qquad \delta_B=5\,\mathrm V\qquad \delta_B/\delta_A=5/3`

Distrattori: Tre quinti inverte il confronto. Cinque sesti segue il solo bersaglio dimenticando q; due darebbe 6 μJ e cinque copia la nuova caduta invece del rapporto.

## 14 — Tarare prima di trasportare

Il riferimento ha lavoro 6 μJ e quindi a=3 μJ⁻¹. La lettura quindici corrisponde a 5 μJ. Dividendo per 5 V si trova q_B=1 μC. Il display legge lavoro: la carica va ricostruita dopo la taratura.

Passaggi: `a=3\,\mathrm{\mu J^{-1}}\qquad W_B=5\,\mathrm{\mu J}\qquad q_B=W_B/\delta_B\qquad q_B=1\,\mathrm{\mu C}`

Distrattori: Tre μC userebbe D=15 come μJ senza decodifica. Due μC darebbero lavoro 10 μJ e D=30; cinque copia il lavoro senza dividerlo per la caduta.

## 15 — Togliere l’offset del display

Le letture fisiche dei riferimenti sono 6 e 5 μJ. Il guadagno è a=(13−11)/(6−5)=2 μJ⁻¹ e l’offset b=1. C corrisponde a (17−1)/2=8 μJ. Dividendo per 2 V si trova q_C=4 μC.

Passaggi: `a=2\,\mathrm{\mu J^{-1}}\qquad b=1\qquad W_C=8\,\mathrm{\mu J}\qquad q_C=4\,\mathrm{\mu C}`

Distrattori: 17/4 μC omette b, usa 17/2 μJ e ricostruisce D=18. Due μC predirebbero D=9; otto copierebbe il lavoro e darebbe D=33; un microcoulomb darebbe D=5.

## 16 — Il vincolo precede la radice

Poniamo x=δ/(1 V) e y=q/(1 μC). Il vincolo y=(2/3)x trasforma la legge numerica in 6=(2/3)x². Si ottiene x²=9 e si sceglie x=3, perché la caduta e la carica sono positive. Quindi δ=3 V e q=2 μC. Si confrontano preparazioni, non un cambiamento di carica durante lo stesso spostamento.

Passaggi: `x=\frac\delta{1\,\mathrm V}\qquad y=\frac q{1\,\mathrm{\mu C}}\qquad 6=\frac23x^2\qquad x^2=9\qquad x=3\qquad \delta=3\,\mathrm V`

Distrattori: −3 darebbe anche q negativo nel vincolo ed è fuori dalle ipotesi. Nove copia il quadrato; una caduta di 2 V darebbe 8/3 μJ e sei volt darebbero 24 μJ. Il coefficiente β ha unità di carica per volt.

## Precisazione dei prerequisiti

Rilette le lezioni reali C1-L006 «Contatto, elasticità e gravitazione» e C1-L007 «Trasferire energia con una forza». C1-L007 copre lavoro e teorema dell’energia cinetica richiesti qui; C1-L006 è estranea al cammino necessario ed è stata rimossa dai prerequisiti di tutte le16 schede. Testi, formule, risposte e asset restano identici. La precedente edizione tecnica rimane conservata nel commit d5d75603; nessuna revisione scientifica indipendente o UI del prodotto era stata assegnata.
