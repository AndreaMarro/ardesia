# electric-gravity-balance-199 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json. SHA256 del file a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Letti tutti gli 80 prompt originali B195–199 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints sorgente. Snapshot allowlist dei 160 prompt SHA256 a7eb73daa238bba50af405409954cda487f97caf396a67922d7bdb3f087def1b.

Prima dei candidati il verificatore distinto A ha congelato gli 80 svolgimenti prompt-only B195–199, SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9. L’autore B non ha aperto quella primaria, né verificatori o risultati attesi altrui. Anche la primaria indipendente B sui soli originali A190–194 era stata congelata prima di candidature A.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c: lette le lezioni reali C4-L01/L02/L03/L04 con formule e prerequisiti effettivi. Primary C4-L02, con C1-L005 per equilibrio delle forze e C1-L006 per peso locale mg. Il campo è diretto verso l’alto, q positiva e non ci sono altre forze verticali. Nessun ID di lezione inventato.

Si usa esclusivamente assemble_family della pipeline esistente, course C4/unit u6, astra/1 e ID AR-<sourceId>. Stati autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN. Nessuna pubblicazione, nessun registro/ledger/runtime o verificatore altrui modificato. I calcoli qui riportati sono dell’autore e non costituiscono review indipendente.

Controlli tecnici reali sui byte finali: due assembly identici, binding source/candidate/provenance validati e importatore canonico con SQLite temporaneo 16 nuove bozze, poi 0 nuove e 16 invariati. I 991 pubblicati restano byte identici e non appaiono nuove teste live. Le operazioni locali sono serializzate con flock su /private/tmp/cric-bounded-local-work.lock e guardia interna almeno 2 GiB prima dei child. Nessuna full suite locale.

SVG finale letto integralmente in XML e rendering nativo asset-only; PNG completo e manifest conservati in editorial/author-evidence/electric-gravity-balance-199-asset-only. Nessun testo SVG risulta fuori dal viewBox nel controllo di bounding box. Questo non è una prova del lettore del prodotto, di axe o di overflow a 320 px: UI prodotto NOT_RUN, nessun report o marker sintetico.

Geometria per la review, espressa soltanto nelle note in coordinate intrinseche, non pixel CSS visibili: Le due forze sulla prova A hanno uguale modulo10 μN, versi opposti e aste visibili lunghe112 unità intrinseche ciascuna: dalle due superfici opposte del corpo ai rispettivi estremi, stessa rappresentazione per la stessa grandezza. La freccia del campo E è separata e schematica, con unità diversa. Le conversioni esplicitano1 mg=10⁻⁶ kg e2 μC=2·10⁻⁶ C, da cui5 N/C. Barre dei campi5,20,25/2 N/C lunghe80,320,200 dal comune x130: fattore 16 unità/(N/C). La frase conclusiva specifica che E verso l’alto è richiesto per equilibrare il peso con q>0. Nessuna stabilità dinamica è dedotta dal solo bilancio statico.

## 01 — La forza elettrica equilibra il peso

Il peso è verso il basso, la forza qE verso l’alto. All’equilibrio qE−mg=0. Un milligrammo è 10⁻³ g e un grammo è 10⁻³ kg: m=10⁻⁶ kg. Il peso vale 10⁻⁵ N; dividendo per 2·10⁻⁶ C si ottiene E=5 N/C.

Passaggi: `qE-mg=0\qquad 1\,\mathrm{mg}=10^{-3}\,\mathrm g\qquad 1\,\mathrm{mg}=10^{-6}\,\mathrm{kg}\qquad mg=10^{-5}\,\mathrm N\qquad E=5\,\mathrm{N/C}`

Distrattori: Dieci N/C ignorerebbero il valore due della carica. Cinquemila N/C confonderebbero un milligrammo con 10⁻³ kg. La risultante è zero, ma ciascuna delle due forze ha modulo non nullo.

## 02 — L’unità del campo necessario

Il campo è forza elettrica per carica. Dal bilancio E=mg/q, il numeratore è un peso in N e il denominatore una carica in C. L’unità richiesta è N/C. Il fatto che le forze si equilibrino non rende nullo il campo.

Passaggi: `[E]=[mg]/[q]\qquad [E]=\mathrm{N/C}`

Distrattori: N misura una forza, C carica e kg massa. V misura potenziale elettrico: il campo sarebbe equivalente a V/m, non V da solo.

## 03 — La risultante verticale è nulla

La componente elettrica è +qE e quella del peso è −mg. Per il corpo fermo la somma deve essere zero: qE=mg. Dividendo per q>0 si ottiene E=mg/q>0, coerente con il campo orientato verso l’alto. Non si annulla separatamente il peso o la forza elettrica.

Passaggi: `F_{y,\rm tot}=qE-mg\qquad F_{y,\rm tot}=0\qquad qE=mg\qquad E=\frac{mg}{q}`

Distrattori: Il reciproco ha unità C/N. Il prodotto mgq ha N·C; dividere per g invece di moltiplicare cambia le dimensioni. Il segno meno richiederebbe un campo verso il basso, che su una carica positiva aiuterebbe il peso invece di equilibrarlo.

## 04 — Una massa tripla

Il peso triplica e la carica resta uguale. Per avere una forza elettrica tripla occorre un campo triplo: E_A=5 N/C, E_B=15 N/C. Il bilancio resta quello dell’equilibrio, non dell’accelerazione del corpo in un campo lasciato invariato.

Passaggi: `E_A=5\,\mathrm{N/C}\qquad E_B=15\,\mathrm{N/C}\qquad E_B/E_A=3`

Distrattori: 5/3 rende inversa la dipendenza da m. Dieci raddoppia anziché triplicare; cinque ignora il nuovo peso e quarantacinque applica il quadrato del fattore tre.

## 05 — La massa dal campo di equilibrio

La forza elettrica è qE=10·10⁻⁶ N. Per equilibrio è anche il peso: m=qE/g=10⁻⁶ kg, cioè 1 mg. La divisione per g trasforma il peso in massa; non si legge una massa direttamente in newton.

Passaggi: `qE=10^{-5}\,\mathrm N\qquad m=\frac{qE}{g}\qquad m=10^{-6}\,\mathrm{kg}\qquad m=1\,\mathrm{mg}`

Distrattori: Dieci mg dimenticherebbero la divisione numerica per g nelle unità scelte. Un grammo perderebbe un fattore mille nella conversione da kg. Non si somma una carica a un campo per ricavare una massa.

## 06 — La carica che sostiene la massa

Il peso vale (10⁻⁶ kg)(10 m/s²)=10⁻⁵ N. L’inversa q=mg/E dà 2·10⁻⁶ C, cioè 2 μC. Il segno positivo è coerente con una forza verso l’alto nel campo indicato.

Passaggi: `mg=10^{-5}\,\mathrm N\qquad q=\frac{mg}{E}\qquad q=2\cdot10^{-6}\,\mathrm C\qquad q=2\,\mathrm{\mu C}`

Distrattori: Moltiplicare peso e campo non dà unità di carica. Due coulomb perderebbero il prefisso micro; un microcoulomb in questo campo fornirebbe solo metà del peso. Una carica negativa non rispetterebbe il verso richiesto qui.

## 07 — Meno carica richiede più campo

Il peso è lo stesso. Dimezzando la carica, il campo deve raddoppiare per lasciare invariato il prodotto qE. A richiede 5 N/C e B 10 N/C, quindi il rapporto è due.

Passaggi: `E_A=5\,\mathrm{N/C}\qquad E_B=10\,\mathrm{N/C}\qquad E_B/E_A=2`

Distrattori: Un mezzo rende diretta la dipendenza da q, uno ignora la variazione e quattro introduce un quadrato. Il rapporto negativo non descrive due moduli positivi entrambi orientati verso l’alto.

## 08 — Un campo proposto troppo grande

L’equilibrio richiede 5 N/C. La proposta di 10 N/C lo supera di cinque newton al coulomb. Il numero due è invece il rapporto proposta/corretto; usando il campo proposto il corpo non resterebbe in equilibrio con le altre condizioni ferme.

Passaggi: `E_{\rm corretto}=5\,\mathrm{N/C}\qquad e=(10-5)\,\mathrm{N/C}\qquad e=5\,\mathrm{N/C}`

Distrattori: −5 cambia l’ordine, dieci copia la proposta e zero la accetta. Il numero puro due non è una differenza di campi. Una forza netta non nulla non può essere ignorata solo perché il corpo era inizialmente fermo.

## 09 — Isolare la massa nel bilancio

Da qE=mg si divide per g>0 e si ottiene m=qE/g. Le unità sono N/(m/s²)=kg. Nei valori numerici assegnati, poiché mg e μC introducono entrambi 10⁻⁶ in SI, m/(1 mg)=[q/(1 μC)][E/(1 N/C)]/10.

Passaggi: `qE=mg\qquad m=\frac{qE}{g}\qquad [m]=\frac{\mathrm N}{\mathrm{m/s^2}}\qquad [m]=\mathrm{kg}`

Distrattori: Moltiplicare per g aggiunge due fattori di g rispetto all’inversa corretta. g/(qE) ha dimensione di massa inversa. E/(qg) ha kg/C²; q/(Eg) non cancella i due fattori di carica e non dà kg.

## 10 — Scalare massa e carica

Il peso B cambia di κ₁, mentre il denominatore q cambia di κ₂. La stessa accelerazione g si cancella nel rapporto dei campi di equilibrio: E_B/E_A=κ₁/κ₂. Se massa e carica crescono dello stesso fattore, il campo necessario resta uguale.

Passaggi: `E_B=\frac{\kappa_1m_Ag}{\kappa_2q_A}\qquad E_B/E_A=\kappa_1/\kappa_2`

Distrattori: Il prodotto rende diretta anche la dipendenza dalla carica. Il reciproco scambia le prove; la somma non dà uno per prove identiche e il quadrato di κ₂ non compare nel bilancio qE=mg.

## 11 — Più massa e meno carica

A richiede 10·1/2=5 N/C. B richiede 10·2/1=20 N/C. Il rapporto è quattro: un fattore due per il peso e un altro perché la carica è dimezzata. Le due operazioni aumentano entrambe il campo necessario.

Passaggi: `E_A=5\,\mathrm{N/C}\qquad E_B=20\,\mathrm{N/C}\qquad E_B/E_A=4`

Distrattori: Due considera un solo cambiamento. Un quarto inverte il rapporto; un mezzo considera q nel verso sbagliato e uno presume una compensazione che qui non c’è.

## 12 — Media di due campi di equilibrio

I campi richiesti sono 5 e 20 N/C. La media è 25/2 N/C. Le medie degli ingressi sarebbero m=3/2 mg e q=3/2 μC, il cui rapporto dà E=10 N/C: un altro apparato di equilibrio, non la media delle due uscite.

Passaggi: `\overline E=\frac{5+20}{2}\,\mathrm{N/C}\qquad \overline E=25/2\,\mathrm{N/C}\qquad E(\overline m,\overline q)=10\,\mathrm{N/C}`

Distrattori: Dieci usa gli ingressi medi. Venticinque non dimezza; 15/2 è metà della differenza e cinque copia A. Non si stanno sovrapponendo due campi nello stesso punto per ottenere una risultante.

## 13 — Il bersaglio fissa la carica

Il campo bersaglio è 20 N/C. Il peso B è 20 μN e la carica necessaria è q_B=20 μN/(20 N/C)=1 μC. Dividendo per i 2 μC di A si ottiene un mezzo. La carica è positiva e la forza resta verso l’alto.

Passaggi: `E_B=20\,\mathrm{N/C}\qquad q_B=\frac{m_Bg}{E_B}\qquad q_B=1\,\mathrm{\mu C}\qquad q_B/q_A=1/2`

Distrattori: Due inverte il rapporto. Uno darebbe solo 10 N/C; un quarto richiederebbe 40 N/C e quattro darebbe 5/2 N/C. Non si copia il rapporto quattro dei campi direttamente sulla carica.

## 14 — Tarare il campo prima della massa

A richiede E=5 N/C, quindi a=3 C/N. La lettura B indica E_B=20 N/C. La forza elettrica su 1 μC vale 20 μN; divisa per g dà m_B=2 mg. La massa si ricava dal campo fisico, non dalla lettura grezza.

Passaggi: `a=3\,\mathrm{C/N}\qquad E_B=20\,\mathrm{N/C}\qquad m_B=\frac{q_BE_B}{g}\qquad m_B=2\,\mathrm{mg}`

Distrattori: Usare D=60 come N/C darebbe 6 mg. Un mg non richiederebbe il campo decodificato con quella carica; venti copia il numero del campo. Non si modifica g per adattare il display.

## 15 — L’offset non è un peso

I riferimenti richiedono 5 e 20 N/C. a=(41−11)/(20−5)=2 C/N e b=1. C ha E_C=(31−1)/2=15 N/C. Con q_C=2 μC il peso è 30 μN e la massa 3 mg. Il termine b è uno zero strumentale, non una forza da sommare al corpo.

Passaggi: `a=2\,\mathrm{C/N}\qquad b=1\qquad E_C=15\,\mathrm{N/C}\qquad m_C=3\,\mathrm{mg}`

Distrattori: 31/10 mg omette b e ricostruisce D=32. Un mg torna ad A; due mg con questa carica darebbero E=10 N/C e D=21. Quindici copia il numero del campo e darebbe D=151.

## 16 — Una misura già imposta dal rapporto

Il coefficiente β vale 1/2 kg/C perché milligrammi e microcoulomb introducono entrambi 10⁻⁶. Sostituendo m=βq nell’equilibrio si trova E=βg=5 N/C per qualunque q>0. La misura ripete il vincolo e non fissa la scala: per esempio (1 mg,2 μC) e (3/2 mg,3 μC) soddisfano entrambi. Le masse e cariche sono parametri continui del modello, non conteggi interi.

Passaggi: `\beta=1/2\,\mathrm{kg/C}\qquad E=\frac{\beta qg}{q}\qquad E=\beta g\qquad E=5\,\mathrm{N/C}`

Distrattori: Le singole coppie elencate sono esempi e non esauriscono le soluzioni. Non sono tutte le masse con q fisso: m e q devono rispettare il medesimo rapporto. Non si aggiunge un dato indipendente soltanto riscrivendo la conseguenza del vincolo.
