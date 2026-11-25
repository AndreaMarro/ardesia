# capacitor-energy-219 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json. Raw SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Letti tutti 80 prompt B215–219 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 6f21e8d88c966e09e17ddf7f9e98a0819ac43b54858970010a588d6c2705fe10.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, commit e1c789beca7a747ab375993f49bc8ea85f4e5b0f. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A210–214 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L06 include nodi, P=VI=I²R=V²/R ed energia E=PΔt per potenza costante. C4-L07 definisce capacità, condensatore piano ed energia immagazzinata; C4-L04 equilibrio nei conduttori e polarizzazione. Per216 è stato riletto anche C3-L04 sul calore latente. Lezioni reali rilette integralmente, senza competenze inventate.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/capacitor-energy-219-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Dipoli legati illustrativi con negativo a sinistra/positivo a destra, campo esternoversodestra; nessuna scala delle cariche o spostamenti microscopici pretesa. Triangolo V(Q)C2μF conQfinale4μC,Vfinale2V: coordinate150860→470660→470860, scala80unità/μC e100unità/V, area fisica4μJ. Labelarea posta dentro triangolo lontana da diagonale. Barre4/18/11μJ lunghe80/360/220, scala20unità/μJ. Caso03C4-L04 autonomo, nessuna formula dipolare con simboli non definiti.

## 01 — L’energia cresce mentre si carica

A capacità costante, quando si aggiunge carica la tensione cresce da zero al valore finale. Il lavoro immagazzinato è l’area sotto V(Q): un triangolo, perciò U=QV/2=CV²/2. Con 2 μF e 2 V si ottiene 2·4/2=4 μJ. Non si moltiplica tutta la carica per la tensione finale senza il fattore metà.

Passaggi: `U=\frac12CV^2\qquad U=\frac12(2\,\mu\mathrm F)(2\,\mathrm V)^2\qquad U=4\,\mu\mathrm J`

Distrattori: Otto μJ omette il fattore 1/2. Due μJ perde il quadrato della tensione in questa sostituzione. Zero confonde carica netta nulla delle due piastre con energia del campo; un’energia negativa contraddice C>0 e V²>0.

## 02 — L’unità dell’energia di campo

L’energia ha unità joule. Nella formula CV²/2, F·V²=(C/V)V²=C·V=J. Con capacità in μF e tensione in V il risultato numerico è in μJ, senza ulteriori fattori di mille.

Passaggi: `[U]=\mathrm F\cdot\mathrm V^2\qquad [U]=\mathrm C\cdot\mathrm V\qquad [U]=\mathrm J`

Distrattori: W misura potenza, C carica, F capacità e V tensione. Il fattore 1/2 è puro e non cambia la dimensione; un prefisso cambia solo la scala.

## 03 — Polarizzare un dielettrico

La polarizzazione è una redistribuzione locale di cariche legate: possono deformarsi le distribuzioni elettroniche rispetto ai nuclei e, se presenti, orientarsi dipoli permanenti. Non occorre trasferire carica libera attraverso tutto il materiale e non si crea carica netta. La carica netta Q_netto del campione rimane zero. Il campo interno non deve in generale essere nullo.

Passaggi: `Q_{\rm netto}=0`

Distrattori: La creazione di carica netta viola la conservazione nel campione isolato neutro. Un moto di cariche libere come in metallo non è la definizione di polarizzazione. Campo nullo è una proprietà del materiale conduttore in equilibrio, non universale per dielettrici. Molecole tutte positive caricherebbero il campione.

## 04 — Capacità dimezzata

Alla stessa tensione, l’energia immagazzinata è lineare in C. Dimezzando la capacità, U_B=(1/2)·1·2² μJ=2 μJ. Non si conserva automaticamente l’energia del condensatore fra preparazioni col generatore che mantiene V; il bilancio completo includerebbe generatore ed eventuale lavoro meccanico.

Passaggi: `U_A=4\,\mu\mathrm J\qquad U_B=2\,\mu\mathrm J\qquad U_B/U_A=\frac12`

Distrattori: Otto μJ inverte l’effetto di C. Quattro μJ impone conservazione dell’energia del solo condensatore senza giustificazione. Un μJ introduce un quadrato sulla capacità; mezzo μJ dimezza troppe volte.

## 05 — L’inversa rispetto alla capacità

Moltiplico per due e divido per V²: C=2 U/V². Con 4 μJ e 4 V² si ottiene 8/4=2 μF. Il divisore è positivo; reinserendo la capacità si recuperano 4 μJ.

Passaggi: `C=\frac{2U}{V^2}\qquad C=2\,\mu\mathrm F`

Distrattori: Un μF omette il due dell’inversa e darebbe 2 μJ. Quattro μF omette il quadrato nel denominatore e darebbe 8 μJ. Il reciproco 1/2 non è la capacità richiesta; un valore in μJ resta un’energia.

## 06 — La tensione richiede il ramo positivo

Dalla legge segue V²=2 U/C. Qui il rapporto è 4 V², dunque il modulo della tensione è 2 V. Il problema ha assegnato V>0, quindi si sceglie il ramo positivo. L’energia da sola non distinguerebbe i segni di una tensione orientata.

Passaggi: `V^2=\frac{2U}{C}\qquad V^2=4\,\mathrm V^2\qquad V=2\,\mathrm V`

Distrattori: Quattro V copia V² senza prendere la radice.√2 V omette il fattore due e darebbe 2 μJ. −2 V ha la stessa energia ma viola il dominio positivo qui richiesto.

## 07 — Tensione doppia

La tensione raddoppia, quindi il quadrato cresce di quattro. Le energie sono 4 e 16 μJ e il rapporto è quattro. Il raddoppio della carica a C costante non rende lineare l’energia nella tensione finale.

Passaggi: `U_A=4\,\mu\mathrm J\qquad U_B=16\,\mu\mathrm J\qquad U_B/U_A=4`

Distrattori: Due segue la carica anziché l’energia.1/4 e 1/2 invertono il confronto, con o senza il quadrato. Uno ignora la variazione di tensione.

## 08 — Lo scarto energetico

Il risultato corretto è 4 μJ. La proposta è maggiore di 8−4=4 μJ. Il rapporto due è puro e risponde a un’altra domanda. La proposta otto corrisponde al prodotto CV² senza il fattore 1/2.

Passaggi: `U=4\,\mu\mathrm J\qquad \delta U=(8-4)\,\mu\mathrm J\qquad \delta U=4\,\mu\mathrm J`

Distrattori: −4 μJ scambia l’ordine, due confronta per divisione e otto μJ copia la proposta. Zero accetta un valore che non coincide con l’area triangolare del processo lineare ideale.

## 09 — La formula inversa con le unità

Da 2 U=CV² si ricava C=2 U/V². J/V²=C/V=F: l’inversa conserva l’unità della capacità. Il valore V non è nullo e viene elevato al quadrato prima della divisione.

Passaggi: `2U=CV^2\qquad C=\frac{2U}{V^2}\qquad [C]=\mathrm{J/V^2}`

Distrattori: U/(2 V²) differisce di un fattore quattro dalla capacità corretta.2 U/V ha dimensione di carica; V²/(2 U) è capacità inversa. Il prodotto con V² non isola il fattore che moltiplicava C.

## 10 — Due scalature diverse

La capacità entra una volta e la tensione due volte: U_B/U_A=κ₁κ₂². I prefissi e il fattore 1/2 sono uguali nelle due prove e si cancellano. Un fattore comuneκ su entrambi gli ingressi dàκ³, nonκ².

Passaggi: `\frac{U_B}{U_A}=\frac{\kappa_1C_A(\kappa_2V_A)^2}{C_AV_A^2}\qquad U_B/U_A=\kappa_1\kappa_2^2`

Distrattori: κ₁κ₂ segue la carica e omette un fattore della tensione.κ₁²κ₂ scambia gli esponenti; i quozienti rendono inverso un ingresso che aumenta l’energia.

## 11 — Cambiano capacità e tensione

A ha 4 μJ. B ha(1/2)4·9=18 μJ, perciò U_B/U_A=18/4=9/2. La capacità doppia moltiplica il fattore 9/4 della tensione al quadrato; i due effetti sono concordi.

Passaggi: `U_A=4\,\mu\mathrm J\qquad U_B=18\,\mu\mathrm J\qquad U_B/U_A=\frac92`

Distrattori: 2/9 inverte il confronto. Tre usa la dipendenza lineare CV; 9/4 considera soltanto V e due soltanto C. Il fattore 1/2 non si applica una seconda volta dopo il rapporto.

## 12 — Media delle energie di campo

Le uscite sono 4 e 18 μJ: la loro media è 22/2=11 μJ. Ai dati medi C 3 μF, V 5/2 V, la legge darebbe(1/2)3·25/4=75/8 μJ, diverso da 88/8 μJ. La media delle uscite non è il lavoro di una preparazione ai valori medi.

Passaggi: `\overline U=\frac{4+18}{2}\,\mu\mathrm J\qquad \overline U=11\,\mu\mathrm J\qquad U_{\rm dati\ medi}=\frac{75}{8}\,\mu\mathrm J`

Distrattori: 75/8 μJ usa gli ingressi medi. Ventidue μJ somma, sette μJ è semidifferenza e diciotto μJ ripete soltanto B. Non si media la sola tensione prima di quadrarla.

## 13 — La tensione per il bersaglio

Il bersaglio è 18 μJ. Con C_B 4 μF si trova V_B²=2·18/4 V²=9 V², quindi V_B 3 V. Diviso V_A 2 V dà 3/2. La capacità doppia fornisce già un fattore due; il restante 9/4 viene dal quadrato della tensione.

Passaggi: `U_B=18\,\mu\mathrm J\qquad V_B=3\,\mathrm V\qquad V_B/V_A=\frac32`

Distrattori: 2/3 inverte il confronto.9/4 è il quadrato del rapporto cercato, 9/2 il bersaglio delle energie. Tre copia la tensione nuova in volt senza dividerla per quella iniziale.

## 14 — Guadagno prima della capacità

La prova A ha U_A 4 μJ e dà a_cal=3 μJ⁻¹. D 54 decodifica U_B 18 μJ. L’inversa C_B=2 U_B/V_B² dà 36/9 μF=4 μF. Il guadagno è dello strumento energetico e non una capacità.

Passaggi: `a_{\rm cal}=3\,(\mu\mathrm J)^{-1}\qquad U_B=18\,\mu\mathrm J\qquad C_B=4\,\mu\mathrm F`

Distrattori: Dodici μF usa D 54 come 54 μJ, predicendo una lettura tre volte maggiore. Due μF omette il fattore due dell’inversa e darebbe U 9 μJ. Diciotto μF copia il numero dell’energia senza isolare C.

## 15 — Sottrarre l’offset

I riferimenti hanno energie 4 e 18 μJ. a_cal=(37−9)/(18−4)=2 μJ⁻¹ e b_cal=1. La lettura D 2 indica U_C=(2−1)/2 μJ=1/2 μJ. Alla tensione 1 V, C_C=2·(1/2)/1 μF=1 μF, che reinserita dà proprio D 2.

Passaggi: `a_{\rm cal}=2\,(\mu\mathrm J)^{-1}\qquad b_{\rm cal}=1\qquad U_C=\frac12\,\mu\mathrm J\qquad C_C=1\,\mu\mathrm F`

Distrattori: Due μF omette l’offset e darebbe D 3. Mezzo μF copia il numero dell’energia come capacità e darebbe D 3/2. Quattro μF usa D come energia e darebbe D 5.

## 16 — Il vincolo rende cubica l’equazione

Ponendo v=V/(1 V), il vincolo dà C/(1 μF)=v. Allora U/(1 μJ)=v³/2. La misura quattro richiede v³8, la cui unica radice reale è due, compatibile col dominio positivo. Si ottengono V 2 V e C 2 μF; la misura fissa la scala.

Passaggi: `v=\frac{V}{1\,\mathrm V}\qquad v^3=8\qquad V=2\,\mathrm V`

Distrattori: Quattro V copia U; otto V copia v³ senza estrarre la radice cubica. −2 V non soddisfa v³8 e viola anche V>0; non è un secondo ramo della radice cubica. La misura non è ridondante.
