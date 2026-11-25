# ice-final-temperature-175 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-03.json, file SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Letti individualmente tutti gli 80 prompt e le ipotesi 173–177 prima di scrivere i candidati. Catalogo reale C3-L01, C3-L03 e C3-L04 riletto; C1-L007 per la potenza del lotto 177. Solo assemble_family della pipeline esistente, course C3 e unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Pubblicazione non richiesta. I calcoli seguenti sono note dell’autore per la review distinta, non una certificazione.

I coefficienti ideali prescritti sono conservati. Le fasi del cammino, i moduli del calore e il verso dei trasferimenti sono espliciti. Le differenze sono in K; i rapporti delle letture Celsius, dove presenti, sono riferiti agli incrementi dal punto di fusione 0 °C e non a temperature assolute. I vincoli 16 confrontano preparazioni diverse: non modificano massa o potenza durante il singolo processo.

Controlli tecnici: due assembly identici; binding source/candidate/provenance verificati; import canonico in SQLite temporaneo, primo import 16 e secondo 0 con 16 invariati. Tutti i 991 contenuti pubblicati restano byte identici e le nuove teste non sono live. Lo SVG è stato letto interamente in XML e nel rendering completo. Nessun controllo strutturale è una review scientifica.

Anteprime browser correnti: NOT_RUN. Il profilo b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f è stato sospeso dall’integratore per difetti di occlusione in altri grafici. Si attende il nuovo runtime realmente corretto e verificato; nessun report viene ritaggato o riaccreditato automaticamente.

## 01 — La fusione viene prima della temperatura finale

La fusione completa assorbe mL_f=(5/2)300=750 J. Dei 800 J forniti ne restano 50 per scaldare l’acqua già liquida. La sua capacità totale è mc_l=10 J/K: l’incremento è 50/10=5 K. Dal punto di fusione a 0 °C arriviamo quindi a 5 °C, entro il ramo dichiarato.

Passaggi: `Q_{\rm fus}=mL_f=750\,\mathrm J\qquad Q_{\rm sens}=Q-mL_f=50\,\mathrm J\qquad mc_l=10\,\mathrm{J/K}\qquad \Theta=5\,\mathrm K\qquad T_f=5\,{}^\circ\mathrm C`

Distrattori e controllo: 80 °C userebbe Q/(mc_l), saltando i 750 J della fusione. 0 °C ignorerebbe i 50 J residui; −5 °C invertirebbe la sottrazione e sarebbe incompatibile con acqua già completamente fusa e poi riscaldata.

## 02 — Una lettura finale, non un calore

La temperatura finale è un punto termometrico e il problema ne chiede la lettura in gradi Celsius. L’incremento Θ è invece una differenza in kelvin. Qui Θ=5 K corrisponde a T_f=5 °C perché si parte da 0 °C; la temperatura assoluta finale sarebbe 278,15 K, non 5 K.

Passaggi: `\Theta=T_f-T_m\qquad \Theta=5\,\mathrm K\qquad T_f=5\,{}^\circ\mathrm C\qquad T_{f,\rm assoluta}=278{,}15\,\mathrm K`

Distrattori e controllo: J misura energia, J/g il calore latente specifico, J/K la capacità totale e W una potenza. Uguaglianza dei numeri di Θ e della lettura Celsius non significa uguaglianza dei punti assoluti.

## 03 — Il residuo energetico scalda il liquido

Il calore totale ha due destinazioni successive: mL_f trasforma tutta la massa e mc_lΘ aumenta la temperatura dell’acqua. Isoliamo Θ dal bilancio Q=mL_f+mc_lΘ e aggiungiamo il punto iniziale di fusione. Si può applicare questa formula solo nel ramo di fusione completa seguito da riscaldamento senza ebollizione.

Passaggi: `Q=mL_f+mc_l\Theta\qquad \Theta=\frac{Q-mL_f}{mc_l}\qquad T_f=T_m+\Theta\qquad 0<\Theta<100\,\mathrm K`

Distrattori e controllo: Q/(mc_l) omette la transizione di fase. La differenza inversa rende negativo l’incremento. Omettere m dal denominatore lascia un fattore di massa nelle unità; Q/(mL_f) è puro e non si somma a un punto termometrico.

## 04 — Più energia dopo aver già fuso la stessa massa

La fusione richiede sempre 750 J. A lascia 50 J al liquido, B ne lascia 250. Con la stessa capacità di 10 J/K gli incrementi sono 5 e 25 K, quindi le letture finali 5 e 25 °C. Il calore totale cresce di un fattore 5/4, ma il residuo disponibile al riscaldamento cresce di cinque.

Passaggi: `Q_{\rm fus}=750\,\mathrm J\qquad \Theta_A=50/10\,\mathrm K\qquad \Theta_B=250/10\,\mathrm K\qquad T_{f,A}=5\,{}^\circ\mathrm C\qquad T_{f,B}=25\,{}^\circ\mathrm C`

Distrattori e controllo: 25/4 °C moltiplica direttamente la lettura A per 1000/800, perdendo il costo fisso della fusione. 100 °C userebbe tutta l’energia B come calore sensibile e arriverebbe alla soglia che il modello esclude.

## 05 — Il calore totale da una finale assegnata

La lettura finale corrisponde a Θ=5 K sopra la fusione. Per ogni grammo occorrono 300 J/g per fondere e 4·5=20 J/g per scaldare il liquido. Il costo specifico totale è 320 J/g; per cinque mezzi di grammo si ottengono 800 J.

Passaggi: `\Theta=5\,\mathrm K\qquad Q=m(L_f+c_l\Theta)\qquad Q=(5/2)\cdot320\,\mathrm J\qquad Q=800\,\mathrm J`

Distrattori e controllo: 50 J darebbe soltanto l’energia sensibile, insufficiente perfino a fondere tutta la massa. 750 J si fermerebbe all’acqua a 0 °C, prima dell’aumento richiesto.

## 06 — La massa compatibile con il residuo

Per arrivare a 5 °C ogni grammo assorbe 300+4·5=320 J/g. La massa è 800/320=5/2 g. Con questa massa la fusione ne richiede 750 J e rimangono i corretti 50 J per il liquido. L’energia totale non si divide soltanto per uno dei due costi specifici.

Passaggi: `\Theta=5\,\mathrm K\qquad m=\frac Q{L_f+c_l\Theta}\qquad m=800/320\,\mathrm g\qquad m=\frac52\,\mathrm g`

Distrattori e controllo: 2 g porterebbero a 25 °C, non 5 °C. 8/3 g usa soltanto L_f e non lascia energia per l’aumento positivo richiesto. 40 g divide soltanto per 20 J/g e non potrebbe fondere completamente con 800 J. 1 g supererebbe l’energia ammessa prima dell’ebollizione.

## 07 — Meno massa con lo stesso calore totale

A termina a 5 °C. B usa 600 J per fondere e lascia 200 J a due grammi di acqua, capacità 8 J/K: Θ_B=25 K e T_f,B=25 °C. Il rapporto delle letture è 25/5=5; coincide col rapporto degli incrementi sopra la fusione. Non è il rapporto fra i kelvin assoluti dei due stati.

Passaggi: `\Theta_A=5\,\mathrm K\qquad \Theta_B=\frac{800-600}{8}\,\mathrm K\qquad \Theta_B=25\,\mathrm K\qquad T_{f,B}/T_{f,A}=25/5=5`

Distrattori e controllo: 4/5 è il rapporto delle masse, 5/4 il suo inverso. Un quinto inverte le letture finali; due non ricostruisce i due residui energetici. La massa compare sia nel costo latente sia nella capacità del liquido.

## 08 — Lo scarto di una proposta da dieci gradi

La lettura corretta è 5 °C. Dieci gradi Celsius meno cinque gradi Celsius danno un intervallo positivo di cinque kelvin. Lo scarto riguarda punti sulla stessa scala e non richiede aggiungere 273,15 a nessuno dei due incrementi.

Passaggi: `T_f=5\,{}^\circ\mathrm C\qquad e=T_{f,\rm proposto}-T_f\qquad e=5\,\mathrm K`

Distrattori e controllo: −5 K scambia l’ordine. 10 K copia il numero della proposta, zero la accetta e 2 K non è la differenza dei due punti.

## 09 — L’inversa per il calore deve includere la fusione

Moltiplichiamo l’incremento per la capacità del liquido per ricavare il residuo sensibile, poi aggiungiamo il calore già speso per fondere. Raccogliendo m si trova m(L_f+c_lΘ). La parentesi è un’energia per unità di massa e il prodotto restituisce joule.

Passaggi: `mc_l\Theta=Q-mL_f\qquad Q=mL_f+mc_l\Theta\qquad Q=m(L_f+c_l\Theta)`

Distrattori e controllo: Le due formule con un solo termine omettono una parte del percorso. Il segno meno toglierebbe il riscaldamento dall’energia richiesta. Dividere per m darebbe J/g² anziché J.

## 10 — Due fattori e due rami fisici da controllare

Ogni incremento è il residuo energetico diviso per la propria capacità. Per B il numeratore è κ₁Q_A−κ₂m_AL_f e il denominatore è κ₂m_Ac_l. Nel rapporto con A si cancellano m_Ac_l, lasciando anche κ₂ al denominatore. Poiché entrambe le letture sono sopra 0 °C, questo è anche il rapporto dei rispettivi incrementi da T_m.

Passaggi: `\Theta_A=\frac{Q_A-m_AL_f}{m_Ac_l}\qquad \Theta_B=\frac{\kappa_1Q_A-\kappa_2m_AL_f}{\kappa_2m_Ac_l}\qquad \frac{\Theta_B}{\Theta_A}=\frac{\kappa_1Q_A-\kappa_2m_AL_f}{\kappa_2(Q_A-m_AL_f)}`

Distrattori e controllo: κ₁/κ₂ perde la sottrazione del costo latente. Omettere κ₂ dal denominatore confronta soltanto i residui, non gli incrementi. Con κ₁=κ₂ l’energia per grammo e la finale restano uguali: il rapporto deve essere uno, non κ² o zero.

## 11 — Energia maggiore e massa minore

A termina a 5 °C. In B la fusione richiede 600 J e i 400 J residui scaldano una capacità di 8 J/K: l’incremento è 50 K, la lettura finale 50 °C. Il rapporto 50/5 è dieci. Entrambe le prove restano sotto 100 °C.

Passaggi: `\Theta_A=5\,\mathrm K\qquad \Theta_B=(1000-600)/8\,\mathrm K\qquad \Theta_B=50\,\mathrm K\qquad T_{f,B}/T_{f,A}=10`

Distrattori e controllo: 5/4 segue il solo calore, 4/5 la sola massa. Cinque è il confronto a energia comune di un’altra prova; un decimo inverte il rapporto delle finali.

## 12 — Media delle letture finali

Le finali sono 5 °C e 50 °C: somma 55, metà 55/2 °C. Si possono mediare punti sulla medesima scala affine; la conversione del punto medio in kelvin conserva la stessa media. Gli ingressi medi Q=900 J e m=9/4 g darebbero invece 25 °C, una terza prova diversa.

Passaggi: `\overline T_f=\frac{5+50}{2}\,{}^\circ\mathrm C\qquad \overline T_f=\frac{55}{2}\,{}^\circ\mathrm C\qquad T_{f,\rm ingressi\ medi}=25\,{}^\circ\mathrm C`

Distrattori e controllo: 25 °C usa gli ingressi medi; 55 °C non dimezza la somma. 45/2 °C fa metà della differenza e 5 °C ignora B. Questa media statistica non descrive un contatto termico fra i due campioni.

## 13 — La massa per una lettura bersaglio

La lettura bersaglio è 50 °C, cioè Θ_B=50 K. Ogni grammo richiede 300+4·50=500 J/g. I 1000 J consentono una massa di 2 g; confrontata con cinque mezzi di grammo dà 4/5. La finale resta strettamente inferiore all’ebollizione.

Passaggi: `\Theta_B=50\,\mathrm K\qquad m_B=\frac{1000\,\mathrm J}{500\,\mathrm{J/g}}\qquad m_B=2\,\mathrm g\qquad m_B/m_A=4/5`

Distrattori e controllo: 5/4 inverte il confronto. Dieci è il fattore sulle letture, non sulle masse; un decimo lo trasferisce inversamente senza sottrarre la fusione. Due copia il numero della massa B in g.

## 14 — Tarare l’incremento sopra la fusione

A ha Θ_A=5 K, quindi q=3 K⁻¹. La lettura B rappresenta 50 K sopra la fusione, ossia 50 °C. Per due grammi servono 600 J latenti e 400 J sensibili: totale 1000 J. Il display legge l’incremento rispetto a T_m, che ha lo stesso numero della lettura Celsius in questo modello.

Passaggi: `q=3\,\mathrm{K^{-1}}\qquad \Theta_B=150/q=50\,\mathrm K\qquad Q_B=m_B(L_f+c_l\Theta_B)\qquad Q_B=1000\,\mathrm J`

Distrattori e controllo: 400 J ometterebbe la fusione. Inserire S=150 direttamente come kelvin darebbe 1800 J e una finale oltre il ramo prima dell’ebollizione. La taratura deve precedere l’inversa energetica.

## 15 — Guadagno e offset prima del bilancio

I riferimenti hanno incrementi 5 e 50 K. La differenza 90 delle letture su 45 K dà q=2 K⁻¹, poi b=1. Per C, (51−1)/2=25 K. La massa di cinque mezzi di grammo richiede 750 J per fondere e 250 J per scaldare: totale 1000 J.

Passaggi: `q=\frac{101-11}{(50-5)\,\mathrm K}\qquad q=2\,\mathrm{K^{-1}}\qquad b=1\qquad \Theta_C=25\,\mathrm K\qquad Q_C=1000\,\mathrm J`

Distrattori e controllo: 800 J torna al riferimento A. 250 J è soltanto il calore sensibile e 750 J solo quello latente. 1005 J omette b, usa Θ_C=51/2 K e ricostruisce S=52 anziché 51.

## 16 — Un’energia per grammo non determina la massa

Sostituendo il vincolo, la massa si cancella: Θ=(d−L_f)/c_l=(320−300)/4=5 K. La misura ripete l’energia specifica assegnata e non fissa la quantità di campione. Per esempio 1 g con 320 J e 5/2 g con 800 J sono entrambe coppie ammesse; in ogni caso il costo specifico sta fra 300 e 700 J/g.

Passaggi: `\Theta=\frac{dm-mL_f}{mc_l}\qquad \Theta=\frac{d-L_f}{c_l}\qquad \Theta=5\,\mathrm K\qquad T_f=5\,{}^\circ\mathrm C`

Distrattori e controllo: Il riferimento numerico è un esempio, non l’unica scala possibile. 5 g copia il numero della lettura in una massa. Zero viola m>0 e rende indefinita la formula prima della cancellazione. Il ramo fisico è rispettato da ogni massa positiva col vincolo dato.
