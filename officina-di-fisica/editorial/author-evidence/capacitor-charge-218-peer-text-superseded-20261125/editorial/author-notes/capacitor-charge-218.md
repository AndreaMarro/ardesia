# capacitor-charge-218 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json. Raw SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Letti tutti 80 prompt B215–219 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 6f21e8d88c966e09e17ddf7f9e98a0819ac43b54858970010a588d6c2705fe10.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, commit e1c789beca7a747ab375993f49bc8ea85f4e5b0f. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A210–214 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L06 include nodi, P=VI=I²R=V²/R ed energia E=PΔt per potenza costante. C4-L07 definisce capacità, condensatore piano ed energia immagazzinata; C4-L04 equilibrio nei conduttori e polarizzazione. Per216 è stato riletto anche C3-L04 sul calore latente. Lezioni reali rilette integralmente, senza competenze inventate.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/capacitor-charge-218-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Sei segni+ e sei− sulle due armature, ogni simbolo1μC: non carica elementare. Modulo6μC su una piastra, netta0. Q(V)C2μF da(0,0) a(3V,6μC), coordinate150850→450670, scala100unità/V e30unità/μC; origine aperta come limiteV0, punto1V/2μC a250790. Barre6/5/11/2μC lunghe300/250/275, scala50unità/μC. La capacità diversa della provaB delle barre è dichiarata e non appartiene alla retta centrale.

## 01 — Il modulo su una sola armatura

La definizione di capacità è C=Q/V, quindi Q=CV. Due μF per tre volt danno 6 μC perché F·V=C. La carica dell’altra armatura ha lo stesso modulo e segno opposto; la carica netta delle due piastre insieme resta nulla.

Passaggi: `Q=CV\qquad Q=(2\,\mu\mathrm F)(3\,\mathrm V)\qquad Q=6\,\mu\mathrm C`

Distrattori: Dodici μC somma i moduli di entrambe le armature, cambiando grandezza richiesta. Zero confonde Q con la carica netta totale. Due e tre copiano gli ingressi senza moltiplicarli; non occorre un fattore 1/2, che appartiene all’energia.

## 02 — Carica e capacità hanno unità diverse

La carica ha unità coulomb, C. La capacità ha invece unità farad, F=C/V. Dalla legge Q=CV, farad per volt restituisce coulomb. I μC sono un milionesimo di coulomb e hanno la stessa dimensione.

Passaggi: `[Q]=\mathrm F\cdot\mathrm V\qquad [Q]=\mathrm C`

Distrattori: F misura capacità e V tensione; J è energia e A è corrente, cioè carica per tempo. Nessuna di queste unità da sola misura la carica richiesta.

## 03 — La definizione si legge anche al contrario

La capacità dice quanta carica in modulo su un’armatura corrisponde a un volt. Con capacità lineare costante, moltiplicare per la tensione dà Q=CV. La relazione si riferisce allo stato finale; non assegna la durata o la corrente del transitorio di carica.

Passaggi: `C=\frac QV\qquad Q=CV`

Distrattori: C/V e V/C non sono cariche.2 CV somma i moduli delle due armature senza rispettare la definizione di Q. CV²/2 è energia immagazzinata, non carica.

## 04 — Capacità dimezzata a tensione imposta

Il generatore mantiene V a tre volt anche nella prova B. La carica finale è 1·3=3 μC, metà dei 6 μC iniziali. Non si conserva Q durante un confronto a tensione mantenuta con il generatore collegato: può avvenire trasferimento di carica.

Passaggi: `Q_A=6\,\mu\mathrm C\qquad Q_B=3\,\mu\mathrm C\qquad Q_B/Q_A=\frac12`

Distrattori: Dodici μC inverte la dipendenza da C. Sei μC imporrebbe carica isolata non dichiarata qui.3/2 μC introduce il fattore 1/2 dell’energia; un μC copia il valore della capacità senza la tensione.

## 05 — La capacità da Q e V

Isolo C=Q/V. Sei μC divisi per tre volt danno 2 μC/V=2 μF. La tensione è positiva e non nulla, quindi l’inversa è lecita. Reinserendo 2 μF alla tensione 3 V ritrovo il modulo 6 μC.

Passaggi: `C=\frac QV\qquad C=2\,\mu\mathrm F`

Distrattori: Diciotto moltiplica invece di dividere; 1/2 prende il reciproco del valore richiesto. Sei copia Q senza dividere per V. Un risultato in μC avrebbe ancora dimensione di carica, non capacità.

## 06 — Ricostruire la tensione

Da Q=CV si ricava V=Q/C. I prefissi micro si cancellano:6 μC/(2 μF)=3 C/F=3 V. Si cerca la differenza positiva di potenziale, non il potenziale assoluto di ciascuna armatura rispetto a un riferimento esterno.

Passaggi: `V=\frac QC\qquad V=3\,\mathrm V`

Distrattori: Dodici moltiplica Q e C; 1/3 inverte la divisione. Sei copia il modulo della carica e zero confonde differenza di potenziale con la carica netta nulla dell’intero condensatore.

## 07 — Una tensione minore

Le due cariche in modulo sono 6 e 2 μC. Il rapporto B/A è 2/6=1/3, lo stesso fattore della tensione. Una capacità costante rende Q lineare in V; il quadrato della tensione riguarda l’energia.

Passaggi: `Q_A=6\,\mu\mathrm C\qquad Q_B=2\,\mu\mathrm C\qquad Q_B/Q_A=\frac13`

Distrattori: Tre inverte B/A.1/9 e nove importano il quadrato da una legge energetica diversa. Uno ignora la nuova tensione e non segue la capacità lineare.

## 08 — Lo scarto non è un rapporto

Il modulo corretto è 6 μC. La proposta supera il risultato di 12−6=6 μC. Due, invece, sarebbe il rapporto proposta/corretta; non porta l’unità della differenza di cariche.

Passaggi: `Q=6\,\mu\mathrm C\qquad \delta Q=(12-6)\,\mu\mathrm C\qquad \delta Q=6\,\mu\mathrm C`

Distrattori: −6 μC scambia l’ordine. Due puro confronta per divisione, dodici μC copia la proposta e zero non rileva la discrepanza. La somma dei due moduli non è Q su una singola armatura.

## 09 — L’inversa simbolica

Divido entrambi i membri di Q=CV per la tensione positiva. Ottengo C=Q/V con unità coulomb per volt, cioè farad. Non introduco un quadrato della tensione perché si sta invertendo una legge di carica.

Passaggi: `Q=CV\qquad C=\frac QV\qquad [C]=\mathrm{C/V}`

Distrattori: QV è energia, V/Q capacità inversa.2 Q/V² e Q/V² hanno unità C/V², non farad; il due e il quadrato non provengono dalla definizione.

## 10 — Due fattori, entrambi diretti

Sostituendo nella relazione Q=CV, la carica finale si moltiplica per il prodotto dei due fattori. Se la capacità raddoppia e la tensione si dimezza, il prodotto è uno e il modulo resta uguale, pur con configurazioni diverse.

Passaggi: `\frac{Q_B}{Q_A}=\frac{(\kappa_1C_A)(\kappa_2V_A)}{C_AV_A}\qquad Q_B/Q_A=\kappa_1\kappa_2`

Distrattori: I quozienti rendono inverso un parametro che entra al numeratore. Il quadrato diκ₂ usa la legge energetica; la somma darebbe due anche per prove identiche, dove il rapporto deve essere uno.

## 11 — Capacità minore, tensione maggiore

A porta 6 μC in modulo su un’armatura; B ne porta 5 μC. Il rapporto è 5/6, minore di uno. La maggiore tensione non compensa del tutto la capacità dimezzata: il fattore complessivo è(1/2)(5/3)=5/6.

Passaggi: `Q_A=6\,\mu\mathrm C\qquad Q_B=5\,\mu\mathrm C\qquad Q_B/Q_A=\frac56`

Distrattori: 6/5 inverte il confronto; 5/3 segue solo V e 1/2 solo C. Uno presume una compensazione completa che non è presente nei due fattori.

## 12 — La media dei moduli misurati

I due moduli sono 6 e 5 μC, quindi la media vale 11/2 μC. Ai valori medi C 3/2 μF e V 4 V si otterrebbero invece 6 μC. I segni opposti delle due piastre di ciascun condensatore non si sommano in questa media di moduli su una piastra.

Passaggi: `\overline Q=\frac{6+5}{2}\,\mu\mathrm C\qquad \overline Q=\frac{11}{2}\,\mu\mathrm C\qquad Q_{\rm dati\ medi}=6\,\mu\mathrm C`

Distrattori: Sei μC usa gli ingressi medi. Undici μC somma le uscite senza dimezzare e mezzo μC è semidifferenza. Zero fa la somma algebrica delle piastre invece della media di due moduli.

## 13 — Il bersaglio impone una tensione

Il modulo bersaglio è(5/6)6 μC=5 μC. Con una capacità 1 μF serve V_B 5 V. Il confronto con V_A 3 V dà 5/3. Il fattore della carica non è direttamente quello della tensione, perché cambia anche C.

Passaggi: `Q_B=5\,\mu\mathrm C\qquad V_B=5\,\mathrm V\qquad V_B/V_A=\frac53`

Distrattori: 3/5 inverte il rapporto; 5/6 copia il bersaglio della carica.1/2 considera la sola capacità e due sarebbe la compensazione necessaria per mantenere Q invariata, non per portarla a 5/6.

## 14 — Taratura proporzionale della carica

A corrisponde a 6 μC, quindi a_cal=3 μC⁻¹. D_B 15 indica Q_B 5 μC. Dividendo per V_B 5 V ottengo C_B 1 μF. La taratura collega D alla carica, non direttamente alla capacità.

Passaggi: `a_{\rm cal}=3\,(\mu\mathrm C)^{-1}\qquad Q_B=5\,\mu\mathrm C\qquad C_B=1\,\mu\mathrm F`

Distrattori: Tre μF tratterebbe D 15 come 15 μC e predirebbe D 45. Cinque μF copia il numero della carica senza dividere per la tensione; 1/5 μF inverte il rapporto e darebbe Q 1 μC.

## 15 — Offset e due riferimenti

I moduli noti sono 6 e 5 μC. Il guadagno è(13−11)/(6−5)=2 μC⁻¹ e l’offset uno. D 17 decodifica Q_C=(17−1)/2=8 μC. Alla tensione 2 V servono 4 μF; reinserendo si ritrova la lettura 17.

Passaggi: `a_{\rm cal}=2\,(\mu\mathrm C)^{-1}\qquad b_{\rm cal}=1\qquad Q_C=8\,\mu\mathrm C\qquad C_C=4\,\mu\mathrm F`

Distrattori: 17/4 μF omette l’offset e predice D 18. Otto μF copia Q_C senza dividere per 2 V; sedici μF sottrae l’offset ma omette il guadagno e la divisione fisica, dando D 65.

## 16 — Un vincolo quadratico

Ponendo v=V/(1 V), il vincolo dà C/(1 μF)=(2/3)v. Allora Q/(1 μC)=(2/3)v². La misura sei impone v²9. Il dominio positivo sceglie v 3 e quindi V 3 V, C 2 μF: una sola coppia, senza libertà residua.

Passaggi: `v=\frac{V}{1\,\mathrm V}\qquad v^2=9\qquad V=3\,\mathrm V`

Distrattori: −3 V è l’altro ramo algebrico ma viola V>0 e renderebbe C negativa nel vincolo. Nove V omette la radice; due V darebbe Q 8/3 μC. La misura non è ridondante: fissa il quadrato di una variabile positiva.
