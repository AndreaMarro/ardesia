# line-load-efficiency-215 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json. Raw SHA256 0bd13e1748174df8c30e06641ad153b8e44ab98df47f31c9f1aba7f925f88077. Letti tutti 80 prompt B215–219 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints. Snapshot allowlist 160 SHA256 6f21e8d88c966e09e17ddf7f9e98a0819ac43b54858970010a588d6c2705fe10.

Il revisore distinto A ha congelato la primaria prompt-only degli 80 B prima di questi candidati: SHA256 4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b, commit e1c789beca7a747ab375993f49bc8ea85f4e5b0f. L’autore B non ha aperto le derivazioni di A. Anche la propria primaria futura su A210–214 è congelata prima delle candidature.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. C4-L06 include nodi, P=VI=I²R=V²/R ed energia E=PΔt per potenza costante. C4-L07 definisce capacità, condensatore piano ed energia immagazzinata; C4-L04 equilibrio nei conduttori e polarizzazione. Per216 è stato riletto anche C3-L04 sul calore latente. Lezioni reali rilette integralmente, senza competenze inventate.

Sola pipeline assemble_family esistente, course C4/unit u6/astra1, ID AR-<sourceId>. Nessun registro/ledger/runtime/checkpoint o verificatore altrui modificato. Soluzione dell’autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN; nessuna pubblicazione. Queste note di calcolo non sono giudizi indipendenti.

Controlli tecnici reali: due assembly identici e binding source/candidate/provenance; import canonico su SQLite temporaneo 16 nuove bozze, poi 0 nuove/16 invariati, 991 pubblicati byte-identici e nessuna nuova testa live. Tutto serializzato con flock condiviso e guardia interna≥2 GiB. Nessuna suite completa locale o browser del prodotto.

SVG intero XML e resa nativa asset-only realmente letti, PNG e manifest con checksum archiviati in editorial/author-evidence/line-load-efficiency-215-asset-only. Controllo dei bounding box senza clipping di testo. Questo non certifica il runtime del prodotto né axe/overflow a 320 px: UI prodotto NOT_RUN, nessun marker sintetico.

Geometria per il revisore, in coordinate intrinseche SVG e non pixel CSS visibili: Circuito in serie senza altri rami, generatore4V con segno+in alto e freccia nel filo superiore verso destra. Resistenze schematiche3/1Ω, corrente1A, potenze3/1W. Barre quantitative di potenza lunghe180/60/240 dal comune x150, scala60coordinate/W. Barre finali delle quote3/4,1/2,5/8 lunghe300/200/250, scala400coordinate perunitàpura; scala separata dalle potenze. Zeri spostati a sinistra dagli assi. Nessuna quota pretende conservare la stessa corrente fra preparazioni; è una frazione di potenza.

## 01 — Quanta parte arriva al carico?

Essendo in serie, carico e cavi sono attraversati dalla stessa corrente. La legge di Joule dà P_L=I²R_L e P_c=I²R_c: il fattore I², strettamente positivo, si elimina dal rapporto. Rimane 3/(3+1)=3/4. Un quarto della potenza totale si converte invece nei cavi; la loro energia non scompare.

Passaggi: `P_L=I^2R_L\qquad P_c=I^2R_c\qquad \eta=\frac{R_L}{R_L+R_c}\qquad \eta=\frac34`

Distrattori: 1/4 è la quota persa, non quella utile.4/3 inverte il rapporto e supera uno. Tre divide solo per R_c, ignorando che il denominatore è tutta la potenza. Uno richiederebbe cavi senza perdite, esclusi qui.

## 02 — Una frazione di potenze

Numeratore e denominatore hanno entrambi unità watt. Il quoziente è un numero puro, compreso fra zero e uno nel modello con due resistenze positive. Si può rappresentarlo in percentuale moltiplicandolo per cento, ma questo non crea una dimensione di potenza.

Passaggi: `[\eta]=\frac{\mathrm W}{\mathrm W}\qquad [\eta]=1`

Distrattori: W misura una potenza, J un’energia e Ω una resistenza. Il simbolo percentuale è una scala adimensionale; moltiplicarlo per W darebbe ancora una potenza, non una quota.

## 03 — La serie fissa la corrente comune

La potenza sul carico è I²R_L; la somma delle due potenze è I²(R_L+R_c). Dividendo si ottiene R_L/(R_L+R_c). L’eliminazione di I² richiede una prova alimentata: a I=0 entrambe le potenze sarebbero nulle e il rapporto originario sarebbe 0/0, non una misura di efficienza.

Passaggi: `P_L+P_c=I^2(R_L+R_c)\qquad \eta=\frac{R_L}{R_L+R_c}`

Distrattori: Il numeratore R_c scambia utile e perdita. R_L/R_c confronta le due potenze tra loro, non utile e totale. Il reciproco del risultato supera uno. Nessuna di queste espressioni rispetta la definizione assegnata.

## 04 — Una quota maggiore non è una potenza maggiore

A assegna tre parti di potenza su quattro al carico; B ne assegna quattro su cinque.4/5 supera 3/4 perché 16>15 nel confronto su venti. Si conclude che la quota utile cresce. Senza sapere quale generatore venga mantenuto e la corrente nelle due prove, non si conclude che cresca anche P_L.

Passaggi: `\eta_A=\frac34\qquad \eta_B=\frac45\qquad \eta_B-\eta_A=\frac1{20}`

Distrattori: Uno cancella indebitamente le perdite non nulle.3/5 cambia il totale ma lascia il vecchio numeratore.3/4 ignora la nuova resistenza e 1/2 richiederebbe carico e cavi uguali.

## 05 — Ricostruire il carico

Da η(R_L+R_c)=R_L segue (1−η)R_L=ηR_c. Quindi R_L=ηR_c/(1−η). Il denominatore è positivo perché la quota è minore di uno. Con 3/4 e 1 Ω il rapporto(3/4)/(1/4) dà 3 Ω; reinserendolo si torna a 3/4.

Passaggi: `(1-\eta)R_L=\eta R_c\qquad R_L=\frac{\eta R_c}{1-\eta}\qquad R_L=3\,\Omega`

Distrattori: Moltiplicare soltanto ηR_c darebbe 3/4 Ω e una quota 3/7. Dividere R_c perη darebbe 4/3 Ω e una quota 4/7. Valori negativi non descrivono resistenze passive.

## 06 — La resistenza nascosta nei cavi

Isolando l’altro parametro si trova R_c=R_L(1−η)/η. La quota persa è 1/4 di tutta la potenza, ma è un terzo della potenza utile. Perciò R_c=3(1/4)/(3/4) Ω=1 Ω. È positivo, come richiesto.

Passaggi: `R_c=R_L\frac{1-\eta}{\eta}\qquad R_c=1\,\Omega`

Distrattori: 3/4 Ω usa la quota persa moltiplicata per il carico senza dividere per quella utile. Nove Ω inverte il rapporto delle quote e darebbe η1/4. Zero produrrebbe η1, non 3/4.

## 07 — Cavi più resistivi

Le quote sono 3/4 e 3/5. Il rapporto B/A è(3/5)/(3/4)=4/5: la quota utile diminuisce del fattore 4/5. Non si dimezza, perché al denominatore rimane anche R_L e non soltanto la resistenza dei cavi.

Passaggi: `\eta_A=\frac34\qquad \eta_B=\frac35\qquad \frac{\eta_B}{\eta_A}=\frac45`

Distrattori: 5/4 inverte B/A.1/2 segue solo il raddoppio di R_c e due ne copia il fattore senza la legge del totale. Uno non vede le perdite maggiori.

## 08 — Una proposta oltre il totale

La quota corretta è 3/4 e quella proposta supera persino uno, impossibile per la frazione utile definita. Lo scarto ordinato è 3/2−3/4=6/4−3/4=3/4, adimensionale. Questa sottrazione non trasforma la proposta in un dato fisicamente ammissibile.

Passaggi: `\eta=\frac34\qquad \delta\eta=\frac32-\frac34\qquad \delta\eta=\frac34`

Distrattori: −3/4 scambia l’ordine; due è il rapporto proposta/corretta.3/2 copia la proposta e zero la accetta. Nessuno di questi è lo scarto richiesto.

## 09 — L’inversa con il suo dominio

Moltiplico la definizione per R_L+R_c, raccolgo R_L e divido per 1−η. Si ottiene ηR_c/(1−η). La parte frazionaria è pura: il risultato conserva gli ohm del parametro noto. Gli estremi zero e uno sono esclusi per due resistenze finite positive.

Passaggi: `\eta R_L+\eta R_c=R_L\qquad R_L=\frac{\eta R_c}{1-\eta}`

Distrattori: Il rapporto delle quote invertito isola invece R_c se il parametro noto fosse R_L. ηR_c omette il raccoglimento; R_c/(1−η) manca diη. η/R_c ha unitàΩ⁻¹ invece diΩ.

## 10 — Preparazioni scalate

Nella prova B cambiano sia la parte utile sia il totale. Dividendo il nuovo totale per quello iniziale si ottiene κ₁a+κ₂b. La parte utile si moltiplica per κ₁, quindi il rapporto cercato èκ₁/(κ₁a+κ₂b). Se i due fattori coincidono, la quota resta invariata benché cambino le resistenze.

Passaggi: `\eta_A=a\qquad \eta_B=\frac{\kappa_1a}{\kappa_1a+\kappa_2b}\qquad \frac{\eta_B}{\eta_A}=\frac{\kappa_1}{\kappa_1a+\kappa_2b}`

Distrattori: κ₂ nel numeratore segue i cavi anziché il carico.κ₁/κ₂ ignora la somma nel totale; κ₁a+κ₂b è solo il fattore del totale. Il prodotto non conserva la quota per una scalatura comune.

## 11 — Cambiano entrambe le resistenze

A fornisce una quota 3/4, B una quota 2/4=1/2. Il rapporto è(1/2)/(3/4)=2/3. Il totale resistivo resta 4 Ω, ma la sua ripartizione si sposta verso i cavi. Non serve assegnare la corrente per confrontare queste frazioni.

Passaggi: `\eta_A=\frac34\qquad \eta_B=\frac12\qquad \frac{\eta_B}{\eta_A}=\frac23`

Distrattori: 3/2 inverte il rapporto; 1/2 copia la sola uscita B.4/3 segue il reciproco del carico nuovo rispetto al vecchio; uno presume che totale uguale significhi quota uguale.

## 12 — La media di due quote

Le quote sono 3/4 e 1/2. La loro media è(3/4+2/4)/2=5/8. In questo caso anche le resistenze medie 5/2 Ω e 3/2 Ω danno 5/8, perché entrambe le prove hanno la stessa somma 4 Ω. Non è una regola universale: coppie(1, 1) e(3, 1) Ω danno quote 1/2 e 3/4, media 5/8; la coppia media(2, 1) darebbe 2/3.

Passaggi: `\overline\eta=\frac{3/4+1/2}{2}\qquad \overline\eta=\frac58\qquad \eta_{\rm dati\ medi}=\frac58`

Distrattori: 3/4 e 1/2 ripetono una sola prova; 5/4 somma senza dividere per due.1/8 è metà della differenza, non media. Qui la coincidenza con i dati medi è motivata dal totale costante, non da una linearità generale.

## 13 — Il bersaglio determina i cavi

Il bersaglio è(2/3)(3/4)=1/2. Per dividere la potenza in due quote uguali, carico e cavi devono avere uguale resistenza. R_c, B=2 Ω; diviso il valore iniziale 1 Ω, il rapporto è due. La quota resta nel dominio aperto fra zero e uno.

Passaggi: `\eta_B=\frac12\qquad R_{c,B}=2\,\Omega\qquad R_{c,B}/R_{c,A}=2`

Distrattori: 1/2 inverte il confronto; 2/3 copia il fattore delle quote e 3/2 quello inverso. Uno lascerebbe R_c 1 Ω e darebbe η_B 2/3, diverso dal bersaglio.

## 14 — Separare taratura e rete

A valeη_A 3/4, quindi a_cal=(9/4)/(3/4)=3. La lettura B 3/2 indicaη_B 1/2. Applicando l’inversa al cavo noto: R_L, B=2(1/2)/(1−1/2) Ω=2 Ω. La taratura è una relazione strumentale, distinta dalla legge fisica della rete.

Passaggi: `a_{\rm cal}=3\qquad \eta_B=\frac12\qquad R_{L,B}=2\,\Omega`

Distrattori: Copiare D come resistenza darebbe 3/2 Ω e una quota 3/7. Trattare D comeη darebbe una quota maggiore di uno, incompatibile con il modello. Sei Ω non toglie il guadagno e produrrebbe D 9/4, non 3/2.

## 15 — Due riferimenti tolgono l’offset

Le quote di riferimento sono 3/4 e 1/2. a_cal=(5/2−2)/(3/4−1/2)=2 e b_cal=1. La lettura 13/5 decodificaη_C=(13/5−1)/2=4/5. L’inversa dà R_L, C=(4/5)/(1/5) Ω=4 Ω. Verifico:4/(4+1)=4/5 e 2·4/5+1=13/5.

Passaggi: `a_{\rm cal}=2\qquad b_{\rm cal}=1\qquad \eta_C=\frac45\qquad R_{L,C}=4\,\Omega`

Distrattori: Omettere l’offset darebbe 13/10, fuori dal dominio della quota; omettere il guadagno dopo la sottrazione darebbe 8/5, anch’esso impossibile. Un Ω darebbe D 2 e due Ω darebbero D 7/3.

## 16 — La quota non fissa la scala

Sostituendo il vincolo si ottieneη=3 R_c/(3 R_c+R_c)=3/4 per ogni R_c>0. La misura non aggiunge un’equazione indipendente: resta libera una scala resistiva continua. Per esempio(3, 1) Ω e(6, 2) Ω soddisfano entrambe i dati; i due valori non sono però liberi separatamente.

Passaggi: `R_L=3R_c\qquad \eta=\frac{3R_c}{4R_c}\qquad \eta=\frac34`

Distrattori: Una o due coppie confondono esempi con la famiglia intera. Nessuna contraddirebbe gli esempi positivi. Coppie arbitrarie indipendenti ignorano il vincolo del rapporto tre; R_c 0 è esclusa dal dominio.
