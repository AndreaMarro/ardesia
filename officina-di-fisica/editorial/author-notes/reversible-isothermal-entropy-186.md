# reversible-isothermal-entropy-186 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json, file SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Letti tutti gli 80 prompt originali 183–187 e relative ipotesi tramite allowlist id/prompt/familyId/lawFamily, senza aprire opzioni, chiavi, solutionSteps o hints sorgente. Snapshot SHA256 f5773c7d6a17f9164992df1208b93984ac156633e0eda86e351275431effc573.

Prima della scrittura dei candidati, il revisore A ha confermato la propria primaria source-only degli 80 ID, SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Non ne sono stati letti i risultati dall’autore B. Le risoluzioni qui raccolte sono calcoli dell’autore e non una verifica indipendente.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C3.json SHA256 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0: rilette integralmente C3-L05 «Tre vie per trasferire energia» e C3-L10 «Seguire il verso dei processi», con formule e prerequisiti reali. Le grandezze energetiche richiamano le fondazioni C3 e la potenza C1-L007 dove pertinente.

Si usa esclusivamente assemble_family e la pipeline canonica esistente, course C3/unit u5, ID AR-<sourceId>. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN, nessuna pubblicazione. Le unità e la fattibilità manuale sono esplicitate nel cammino, senza presentare coefficienti di modello come costanti sperimentali esatte.

Controlli tecnici: due assembly identici, binding source/candidate/provenance verificati e import canonico in SQLite temporaneo 16→0 con 16 invariati. I 991 pubblicati restano byte identici; zero nuove teste live. Nessun PASS scientifico è dedotto da tali controlli.

UI del prodotto NOT_RUN: resta attivo lo stop dell’integratore sui nuovi replay. Lo SVG è stato letto in XML. Rendering asset-only NOT_RUN: nessun nuovo browser, Quick Look o rendering è stato avviato dopo lo stop per spazio disco. La geometria è stata controllata nel solo XML, senza dichiarare una verifica visiva non eseguita. Nessun report o marker sintetico, nessun ritag di prove precedenti.

Geometria per la review, espressa soltanto qui in coordinate intrinseche SVG e non come pixel CSS: Il pannello con segno usa zero a x320 e barre lunghe 200 unità intrinseche verso sinistra e destra per −2 e +2 J/K: fattore 100 unità SVG/(J/K). L’asse orizzontale ha etichette −2, 0, +2; lo zero è sotto la fine dell’asta verticale. Nel terzo pannello le lunghezze 240, 120 e 180 rappresentano 2, 1 e 3/2 J/K dal medesimo x130, al fattore 120. Controllo limitato al testo/XML: rendering NOT_RUN.

## 01 — Entropia che entra nel sistema

Per una trasformazione reversibile dS=δQ_rev/T. Poiché T è costante si può portare fuori dall’integrale: ΔS=Q_rev/T. Seicento joule divisi per trecento kelvin danno 2 J/K, positivi perché il sistema assorbe calore. Non si sta calcolando l’entropia totale, che nel limite reversibile include anche la perdita della sorgente.

Passaggi: `\Delta S=\int\frac{\delta Q_{\rm rev}}{T}\qquad \Delta S=\frac{Q_{\rm rev}}{T}\qquad \Delta S=\frac{600\,\mathrm J}{300\,\mathrm K}\qquad \Delta S=2\,\mathrm{J/K}`

Distrattori e controllo: Zero descriverebbe qui la somma delle variazioni di sistema e sorgente, non quella del sistema assorbente. −2 J/K cambierebbe il verso del calore. 180000 avrebbe unità J·K se si moltiplicassero Q_rev e T; 600 J è energia, non entropia.

## 02 — L’unità non definisce da sola la grandezza

Il rapporto fra energia trasferita e temperatura assoluta ha unità joule per kelvin. Anche una capacità termica usa J/K, ma non è per questo la stessa grandezza: una capacità lega energia e aumento di temperatura in un processo, mentre qui ΔS è una variazione di una funzione di stato.

Passaggi: `[\Delta S]=\frac{[Q_{\rm rev}]}{[T]}\qquad [\Delta S]=\mathrm{J/K}`

Distrattori e controllo: J misura energia, K temperatura, W potenza e K/J l’inverso di J/K. Non si deve convertire il denominatore in un aumento termico: la trasformazione è isoterma, ma T non è zero.

## 03 — Reversibile non vuol dire entropia individuale invariata

L’assenza di produzione non elimina il trasferimento di entropia. Il sistema riceve Q_rev e aumenta di Q_rev/T. La sorgente cede lo stesso calore e perde Q_rev/T: la somma è zero. Le variazioni individuali sono opposte e non nulle. Il calore qui attraversa il confine del sistema, che non è isolato.

Passaggi: `\Delta S_{\rm sist}=Q_{\rm rev}/T>0\qquad \Delta S_{\rm sorg}=-Q_{\rm rev}/T\qquad \Delta S_{\rm totale}=0`

Distrattori e controllo: Attribuire variazione nulla a ogni parte confonde assenza di produzione con assenza di scambio. Due aumenti uguali darebbero una produzione positiva, estranea al limite reversibile. La diminuzione appartiene alla sorgente che cede, non al sistema assorbente.

## 04 — Più calore alla stessa temperatura

La temperatura assoluta è la stessa in entrambe le prove. Raddoppiare il calore reversibile assorbito raddoppia quindi ΔS: da 600/300=2 a 1200/300=4 J/K. Isoterma significa T costante, non variazione di entropia nulla.

Passaggi: `\Delta S_A=2\,\mathrm{J/K}\qquad \Delta S_B=\frac{1200\,\mathrm J}{300\,\mathrm K}\qquad \Delta S_B=4\,\mathrm{J/K}`

Distrattori e controllo: Un J/K rende inversa la dipendenza dal calore, otto usa un quadrato e due ignora il nuovo Q_rev. Zero scambia l’entropia del sistema con la somma del sistema e della sorgente.

## 05 — Il calore dalla variazione di entropia

Moltiplichiamo ΔS=Q_rev/T per T positiva. Due joule per kelvin moltiplicati per trecento kelvin danno seicento joule. Il segno è positivo come l’assorbimento imposto dal modello.

Passaggi: `Q_{\rm rev}=T\Delta S\qquad Q_{\rm rev}=(300\,\mathrm K)(2\,\mathrm{J/K})\qquad Q_{\rm rev}=600\,\mathrm J`

Distrattori e controllo: 150 nasce da T/ΔS e ha unità K²/J, non J. 2 J copia il numero dell’entropia e 300 J quello della temperatura. Una temperatura Celsius al posto dei 300 K non è il denominatore della legge termodinamica.

## 06 — La temperatura assoluta dal calore e dall’entropia

Isoliamo T=Q_rev/ΔS. Il rapporto 600 J/(2 J/K) dà 300 K. Non si usa la variazione di temperatura, che è nulla durante questa isoterma. Il risultato è il punto assoluto corrispondente a 26,85 °C, non una lettura di 300 °C.

Passaggi: `T=\frac{Q_{\rm rev}}{\Delta S}\qquad T=\frac{600\,\mathrm J}{2\,\mathrm{J/K}}\qquad T=300\,\mathrm K`

Distrattori e controllo: Zero confonde T con ΔT. 1200 deriva dal prodotto Q_revΔS e non ha unità K. Il reciproco ΔS/Q_rev ha K⁻¹. La positività di ΔS rende lecita l’inversa nel ramo di assorbimento.

## 07 — Stesso calore a temperatura assoluta doppia

A aumenta di 600/300=2 J/K, mentre B aumenta di 600/600=1 J/K. Il rapporto è un mezzo. Il medesimo calore reversibile trasferisce meno entropia quando viene scambiato a temperatura assoluta maggiore.

Passaggi: `\Delta S_A=2\,\mathrm{J/K}\qquad \Delta S_B=1\,\mathrm{J/K}\qquad \Delta S_B/\Delta S_A=1/2`

Distrattori e controllo: Due inverte il confronto. Uno ignora T diversa; un quarto e quattro applicano un quadrato non presente in Q_rev/T. Non si confrontano letture Celsius.

## 08 — Una sovrastima dell’entropia del sistema

Il valore corretto è 2 J/K. Quattro meno due dà +2 J/K: la proposta è una sovrastima. Il rapporto proposta/corretta è anch’esso numericamente due, ma è adimensionale e risponde a una domanda diversa.

Passaggi: `\Delta S=2\,\mathrm{J/K}\qquad e=\Delta S_{\rm proposta}-\Delta S\qquad e=(4-2)\,\mathrm{J/K}\qquad e=2\,\mathrm{J/K}`

Distrattori e controllo: −2 J/K inverte la sottrazione, 4 J/K copia la proposta e zero la accetta. Il numero puro due non è equivalente a uno scarto di entropia con unità J/K.

## 09 — Isolare il calore nella legge reversibile isoterma

Dalla legge ΔS=Q_rev/T moltiplichiamo entrambi i membri per T. Il prodotto TΔS ha unità K·J/K=J e conserva il segno positivo. Si applica a questo scambio reversibile isotermo, non come sostituzione generale di una temperatura variabile con un valore arbitrario.

Passaggi: `\Delta S=Q_{\rm rev}/T\qquad T\Delta S=Q_{\rm rev}\qquad [Q_{\rm rev}]=\mathrm J`

Distrattori e controllo: ΔS/T ha J/K², T/ΔS ha K²/J e il reciproco del prodotto ha J⁻¹. Sommare T e ΔS unisce grandezze con unità diverse.

## 10 — Due fattori, uno al numeratore e uno al denominatore

Nella nuova variazione di entropia il calore porta κ₁ al numeratore e la temperatura assoluta porta κ₂ al denominatore. Formando il rapporto con A si cancella Q_rev,A/T_A e resta κ₁/κ₂. Un fattore comune su energia e temperatura mantiene invariata ΔS.

Passaggi: `\Delta S_B=\frac{\kappa_1Q_{{\rm rev},A}}{\kappa_2T_A}\qquad \Delta S_B=\frac{\kappa_1}{\kappa_2}\Delta S_A\qquad \Delta S_B/\Delta S_A=\kappa_1/\kappa_2`

Distrattori e controllo: Il prodotto rende diretta la dipendenza da T; il reciproco scambia gli ingressi. Il quadrato conta due volte il fattore sul calore. La differenza darebbe zero con fattori uguali, mentre le variazioni positive sarebbero uguali e il rapporto uno.

## 11 — Due prove ideali a temperature molto diverse

A aumenta di 2 J/K. Nella prova ideale B il rapporto è 1 J/(1 K)=1 J/K. Dividendo B per A otteniamo un mezzo. Non basta seguire il forte cambiamento del calore, perché cambia anche il denominatore. La prova B assegna una temperatura positiva: non pretende di raggiungere lo zero assoluto.

Passaggi: `\Delta S_A=2\,\mathrm{J/K}\qquad \Delta S_B=1\,\mathrm{J/K}\qquad \Delta S_B/\Delta S_A=1/2`

Distrattori e controllo: 1/600 segue soltanto Q_rev; 300 segue soltanto il reciproco del fattore termico. Due è il reciproco del risultato e 600 inverte il rapporto dei soli calori.

## 12 — Media statistica delle variazioni di entropia

Le variazioni sono 2 e 1 J/K: la metà di tre è 3/2 J/K. Se si mediano prima gli ingressi, Q_rev medio è 601/2 J e T medio 301/2 K; il loro rapporto è 601/301 J/K, diverso. La media richiesta non è l’entropia totale di un trasferimento fra i due sistemi.

Passaggi: `\overline{\Delta S}=\frac{2+1}{2}\,\mathrm{J/K}\qquad \overline{\Delta S}=3/2\,\mathrm{J/K}\qquad \frac{\overline Q_{\rm rev}}{\overline T}=\frac{601/2}{301/2}\,\mathrm{J/K}\qquad \frac{\overline Q_{\rm rev}}{\overline T}=601/301\,\mathrm{J/K}`

Distrattori e controllo: 601/301 J/K usa gli ingressi medi. Tre è la somma non dimezzata; un mezzo è metà della differenza e due ignora B. Il quoziente non conserva in generale le medie.

## 13 — Una temperatura per l’entropia bersaglio

Il bersaglio B è 1 J/K. Da T_B=Q_rev,B/ΔS_B si ottiene 1 J/(1 J/K)=1 K. Il rapporto con 300 K iniziali è 1/300. Il dimezzamento dell’entropia non implica dimezzare T, perché il calore è cambiato da 600 a un joule.

Passaggi: `\Delta S_B=1\,\mathrm{J/K}\qquad T_B=\frac{1\,\mathrm J}{1\,\mathrm{J/K}}\qquad T_B=1\,\mathrm K\qquad T_B/T_A=1/300`

Distrattori e controllo: 300 è il reciproco. 1/600 copia il fattore dei calori; un mezzo copia il bersaglio sull’entropia e due inverte quel solo fattore.

## 14 — Un display proporzionale all’entropia

Il riferimento ha ΔS=2 J/K, quindi q=3 K/J. La lettura B corrisponde a 1 J/K. Moltiplicando per T_B=1 K si ricava Q_rev,B=1 J. Il guadagno ha unità inversa dell’entropia, non inversa dell’energia.

Passaggi: `q=\frac{6}{2\,\mathrm{J/K}}\qquad q=3\,\mathrm{K/J}\qquad \Delta S_B=1\,\mathrm{J/K}\qquad Q_{{\rm rev},B}=T_B\Delta S_B\qquad Q_{{\rm rev},B}=1\,\mathrm J`

Distrattori e controllo: Tre joule usa il display come se fosse già J/K e ignora q. Trecento joule usa la temperatura del riferimento A invece di quella di B. Due copia la variazione di entropia A e non ricostruisce la lettura nuova.

## 15 — Due riferimenti separano guadagno e offset

I riferimenti hanno ΔS_A=2 e ΔS_B=1 J/K. La differenza delle letture dà q=(5−3)/(2−1)=2 K/J; poi b=1. C ha ΔS_C=(9−1)/q=4 J/K. A 300 K corrispondono Q_rev,C=300·4=1200 J.

Passaggi: `q=2\,\mathrm{K/J}\qquad b=1\qquad \Delta S_C=4\,\mathrm{J/K}\qquad Q_{{\rm rev},C}=(300\,\mathrm K)(4\,\mathrm{J/K})\qquad Q_{{\rm rev},C}=1200\,\mathrm J`

Distrattori e controllo: 1350 J omette b e usa 9/2 J/K. 600 J torna al riferimento A; 900 J moltiplica T per tre senza ricostruire ΔS=4 J/K. Quattro copia il numero dell’entropia in un’energia.

## 16 — Un vincolo fra calore e temperatura è ridondante

Sostituendo il vincolo nella legge, ΔS=βT/T=β=2 J/K per ogni T>0. La misura ripete ciò che il vincolo impone e non determina la scala della temperatura e del calore. Qualunque temperatura positiva assegnata genera un calore positivo compatibile, mantenendo T costante entro la propria prova.

Passaggi: `Q_{\rm rev}=\beta T\qquad \Delta S=\frac{\beta T}{T}\qquad \Delta S=\beta\qquad \Delta S=2\,\mathrm{J/K}`

Distrattori e controllo: 600 J e 300 K sono solo un esempio. Nessuna è smentita da tale esempio e due non segue da una radice: la temperatura si cancella. T=0 è esclusa e renderebbe il quoziente termodinamico non definito.
