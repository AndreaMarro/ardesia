# warm-water-and-ice-176 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-03.json, file SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Letti individualmente tutti gli 80 prompt e le ipotesi 173–177 prima di scrivere i candidati. Catalogo reale C3-L01, C3-L03 e C3-L04 riletto; C1-L007 per la potenza del lotto 177. Solo assemble_family della pipeline esistente, course C3 e unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Pubblicazione non richiesta. I calcoli seguenti sono note dell’autore per la review distinta, non una certificazione.

I coefficienti ideali prescritti sono conservati. Le fasi del cammino, i moduli del calore e il verso dei trasferimenti sono espliciti. Le differenze sono in K; i rapporti delle letture Celsius, dove presenti, sono riferiti agli incrementi dal punto di fusione 0 °C e non a temperature assolute. I vincoli 16 confrontano preparazioni diverse: non modificano massa o potenza durante il singolo processo.

Controlli tecnici: due assembly identici; binding source/candidate/provenance verificati; import canonico in SQLite temporaneo, primo import 16 e secondo 0 con 16 invariati. Tutti i 991 contenuti pubblicati restano byte identici e le nuove teste non sono live. Lo SVG è stato letto interamente in XML e nel rendering completo. Nessun controllo strutturale è una review scientifica.

Anteprime browser correnti: NOT_RUN. Il profilo b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f è stato sospeso dall’integratore per difetti di occlusione in altri grafici. Si attende il nuovo runtime realmente corretto e verificato; nessun report viene ritaggato o riaccreditato automaticamente.

## 01 — Il ghiaccio fonde e l’acqua nuova si scalda

L’acqua iniziale cede calore scendendo da 50 °C alla finale. Il ghiaccio riceve prima 300 J per fondere e poi si scalda come acqua fino alla stessa finale. Il bilancio è 4m_a(50−t_f)=300m_i+4m_it_f nei valori numerici delle unità dichiarate. Con le masse date, 800−16t_f=300+4t_f: 500=20t_f e la lettura è 25 °C. Il massimo calore cedibile fino a zero, 800 J, supera i 300 J di fusione e conferma il ramo.

Passaggi: `c_lm_a(50\,\mathrm K-\Theta)=m_iL_f+c_lm_i\Theta\qquad \Theta=\frac{800-300}{20}\,\mathrm K\qquad \Theta=25\,\mathrm K\qquad T_f=25\,{}^\circ\mathrm C`

Distrattori e controllo: 50 °C ignorerebbe l’energia ricevuta dal ghiaccio. 0 °C ignorerebbe il residuo positivo dopo la fusione. Una media aritmetica delle sole temperature non considera né le diverse masse né il calore latente.

## 02 — Il punto finale ha un’unità termometrica

Il problema chiede una lettura di temperatura in gradi Celsius. Il bilancio usa differenze in kelvin, e il passaggio dal punto di fusione a quello finale conserva la stessa ampiezza numerica in gradi Celsius. Non si deve però usare 25 come se fosse una temperatura assoluta in kelvin.

Passaggi: `\Theta=T_f-T_m\qquad \Theta=25\,\mathrm K\qquad T_f=25\,{}^\circ\mathrm C\qquad T_{f,\rm assoluta}=298{,}15\,\mathrm K`

Distrattori e controllo: J misura energia trasferita, g massa, J/g il calore latente specifico e W una potenza. L’uguaglianza numerica fra incremento da zero e lettura Celsius dipende dal riferimento scelto.

## 03 — Il bilancio comprende anche l’acqua appena fusa

Il calore ceduto dal caldo va alla fusione e al riscaldamento della massa che era ghiaccio. Spostiamo i termini proporzionali a Θ nello stesso membro: la capacità finale comprende m_a+m_i, perché alla fine entrambe le masse sono acqua. L’energia residua sopra il riferimento di fusione divide la capacità di tutta l’acqua finale.

Passaggi: `c_lm_a(50\,\mathrm K)-m_iL_f=c_l(m_a+m_i)\Theta\qquad \Theta=\frac{c_lm_a(50\,\mathrm K)-m_iL_f}{c_l(m_a+m_i)}\qquad 0<\Theta<50\,\mathrm K`

Distrattori e controllo: Omettere L_f non fonde il ghiaccio nel bilancio. Omettere m_i dal denominatore non scalda l’acqua appena fusa. Il segno più renderebbe la fusione una sorgente di energia; l’ultima formula scambia le due masse e le loro condizioni iniziali.

## 04 — Aggiungere più acqua inizialmente calda

Con 8 g di acqua iniziale, il numeratore residuo è 1600−300=1300 J e la capacità finale è 4·9=36 J/K. L’incremento è 1300/36=325/9 K, quindi la lettura è 325/9 °C. È maggiore di 25 °C ma ancora minore di 50 °C: più acqua calda sposta l’equilibrio verso la sua temperatura iniziale.

Passaggi: `\Theta_A=25\,\mathrm K\qquad \Theta_B=\frac{1600-300}{36}\,\mathrm K\qquad \Theta_B=\frac{325}{9}\,\mathrm K\qquad T_{f,B}=\frac{325}{9}\,{}^\circ\mathrm C`

Distrattori e controllo: 50 °C raddoppia la lettura e non lascia raffreddare il caldo pur fondendo il ghiaccio. 25/2 °C va nel verso opposto all’aumento di massa calda. 100 °C supera ogni temperatura iniziale e non può derivare da questo contatto isolato.

## 05 — La massa calda da una finale nota

Ogni grammo che era ghiaccio riceve 300 J per fondere e altri 100 J per arrivare a 25 °C. Un grammo di acqua inizialmente a 50 °C, raffreddandosi di 25 K, ne cede 100. Per fornire i 400 J servono quindi quattro grammi di acqua iniziale. Il risultato rispetta 2m_a>3m_i.

Passaggi: `\Theta=25\,\mathrm K\qquad m_a=\frac{m_i(L_f+c_l\Theta)}{c_l(50\,\mathrm K-\Theta)}\qquad m_a=400/100\,\mathrm g\qquad m_a=4\,\mathrm g`

Distrattori e controllo: 3 g conterebbero soltanto la fusione, senza scaldare l’acqua nuova. 1 g confonde le due masse: sarebbe fuori dal ramo di fusione completa per i dati assegnati. Il denominatore deve restare positivo.

## 06 — La massa di ghiaccio che può arrivare alla finale

I quattro grammi inizialmente caldi cedono 4·4·25=400 J. Ogni grammo di ghiaccio richiede 300+4·25=400 J/g per fondere e arrivare alla finale. Dividendo la cessione disponibile per questo costo specifico otteniamo un grammo.

Passaggi: `m_i=\frac{c_lm_a(50\,\mathrm K-\Theta)}{L_f+c_l\Theta}\qquad m_i=\frac{400\,\mathrm J}{400\,\mathrm{J/g}}\qquad m_i=1\,\mathrm g`

Distrattori e controllo: 4/3 g usa soltanto il costo latente e dimentica il riscaldamento successivo. 4 g copia la massa calda e violerebbe il ramo garantito. L’inversa richiede 0<Θ<50 K per mantenere positivo il calore ceduto dal caldo.

## 07 — Più ghiaccio con la stessa acqua iniziale

A termina a 25 °C. Per B restano 800−600=200 J sopra il riferimento di fusione, da distribuire su 6 g di acqua finale: capacità 24 J/K. L’incremento è 200/24=25/3 K. La lettura B divisa per 25 °C dà 1/3. La condizione 800>600 J mantiene la fusione completa anche in B.

Passaggi: `\Theta_A=25\,\mathrm K\qquad \Theta_B=\frac{800-600}{24}\,\mathrm K\qquad \Theta_B=\frac{25}{3}\,\mathrm K\qquad T_{f,B}/T_{f,A}=1/3`

Distrattori e controllo: Un mezzo segue soltanto il raddoppio del ghiaccio. Due dà il verso opposto e tre inverte il rapporto. Il valore uno non tiene conto né della maggiore fusione né della maggiore capacità finale.

## 08 — La proposta coincide con il punto caldo iniziale

La finale corretta è 25 °C. La proposta di 50 °C è più alta di 25 K e renderebbe nullo il raffreddamento della porzione calda, che invece deve fornire energia al ghiaccio. Lo scarto richiesto è una differenza termica positiva.

Passaggi: `T_f=25\,{}^\circ\mathrm C\qquad e=T_{f,\rm proposto}-T_f\qquad e=25\,\mathrm K`

Distrattori e controllo: −25 K cambia l’ordine della sottrazione. 50 K copia il numero della proposta, zero la accetta e due è un rapporto fra numeri Celsius, non uno scarto.

## 09 — Isolare la massa inizialmente calda

La massa calda moltiplica c_l(50 K−Θ), energia ceduta da ogni grammo caldo. Dividiamo il fabbisogno della massa inizialmente ghiacciata per questo fattore. Il rapporto di due energie specifiche è puro e moltiplica m_i, lasciando un risultato in g. Il denominatore positivo esclude una finale uguale o superiore al caldo iniziale.

Passaggi: `c_lm_a(50\,\mathrm K-\Theta)=m_i(L_f+c_l\Theta)\qquad m_a=\frac{m_i(L_f+c_l\Theta)}{c_l(50\,\mathrm K-\Theta)}`

Distrattori e controllo: Il numeratore con solo L_f omette il riscaldamento dell’acqua fusa. Usare c_lΘ al denominatore scambia incremento del ghiaccio e raffreddamento del caldo. Il reciproco inverte il rapporto fra energia ricevuta ed energia ceduta per grammo e non soddisfa il bilancio; il segno meno sottrae un fabbisogno.

## 10 — Due masse scalate prima del rapporto

Usiamo i valori numerici delle masse in g nella relazione t_f=(200m_a−300m_i)/[4(m_a+m_i)], dove 200 e 300 sono energie specifiche in J/g. Nel rapporto delle due prove si cancella 4, ma restano sia il confronto delle energie residue sia quello delle masse totali. Se entrambe le masse crescono dello stesso fattore, l’intera temperatura finale rimane uguale.

Passaggi: `\Theta_A=\frac{c_lm_a(50\,\mathrm K)-m_iL_f}{c_l(m_a+m_i)}\qquad \Theta_B=\frac{c_l\kappa_1m_a(50\,\mathrm K)-\kappa_2m_iL_f}{c_l(\kappa_1m_a+\kappa_2m_i)}\qquad \frac{T_{f,B}}{T_{f,A}}=\frac{\Theta_B}{\Theta_A}`

Distrattori e controllo: Il solo rapporto delle energie residue omette la diversa capacità finale. Il quoziente dei fattori trascura la fusione; il prodotto e la differenza falliscono con un fattore comune, quando il rapporto corretto deve essere uno. I due numeratori devono restare positivi nel dominio dichiarato.

## 11 — Due cambiamenti nello stesso equilibrio

A ha Θ=25 K. B parte con 1000 J cedibili fino alla fusione, ne spende 600 per fondere e distribuisce i 400 residui su una capacità totale di 28 J/K. L’incremento è 100/7 K. Dividendo per 25 K otteniamo 4/7. Non basta seguire una sola delle due masse.

Passaggi: `\Theta_A=25\,\mathrm K\qquad \Theta_B=400/28\,\mathrm K\qquad \Theta_B=100/7\,\mathrm K\qquad T_{f,B}/T_{f,A}=4/7`

Distrattori e controllo: 7/4 inverte il confronto. 5/4 segue soltanto la massa d’acqua calda e due soltanto il ghiaccio; un mezzo non ricostruisce i due bilanci completi.

## 12 — Media statistica delle due finali

Le due letture sono 25 e 100/7 °C. Scriviamo 25=175/7, sommiamo ottenendo 275/7 e dividiamo per due: 275/14 °C. Le masse medie 9/2 g e 3/2 g darebbero invece 75/4 °C. La differenza esatta fra queste due operazioni è 25/28 K.

Passaggi: `\overline T_f=\frac{25+100/7}{2}\,{}^\circ\mathrm C\qquad \overline T_f=275/14\,{}^\circ\mathrm C\qquad T_{f,\rm masse\ medie}=75/4\,{}^\circ\mathrm C`

Distrattori e controllo: 75/4 °C usa le masse medie; 275/7 °C non dimezza la somma. 75/14 °C fa metà della differenza e 25 °C ignora B. La media delle letture non è un nuovo esperimento di mescolamento.

## 13 — Il ghiaccio necessario per la finale bersaglio

Il bersaglio è 100/7 °C, cioè Θ_B=100/7 K. I cinque grammi caldi cedono c_lm_a(50 K−Θ_B)=5000/7 J. Ogni grammo inizialmente ghiacciato richiede L_f+c_lΘ_B=2500/7 J/g. Il quoziente dà m_i,B=2 g e il rapporto con un grammo iniziale è due. I 1000 J disponibili fino a zero superano i 600 J di fusione.

Passaggi: `\Theta_B=100/7\,\mathrm K\qquad m_{i,B}=\frac{5000/7\,\mathrm J}{2500/7\,\mathrm{J/g}}\qquad m_{i,B}=2\,\mathrm g\qquad m_{i,B}/m_{i,A}=2`

Distrattori e controllo: 4/7 è il fattore sulle letture, non sul ghiaccio. 5/4 segue soltanto il caldo e un mezzo capovolge il rapporto delle masse ricostruite.

## 14 — Un display dell’incremento termico finale

A ha Θ_A=25 K, quindi q=3 K⁻¹. La lettura B corrisponde a Θ_B=100/7 K. Due grammi di ghiaccio richiedono 5000/7 J per fondere e scaldarsi; un grammo caldo ne cede 1000/7 J fino alla stessa finale. Il rapporto dà cinque grammi di acqua iniziale.

Passaggi: `q=3\,\mathrm{K^{-1}}\qquad \Theta_B=100/7\,\mathrm K\qquad m_{a,B}=\frac{m_{i,B}(L_f+c_l\Theta_B)}{c_l(50\,\mathrm K-\Theta_B)}\qquad m_{a,B}=5\,\mathrm g`

Distrattori e controllo: Usare la lettura grezza 300/7 come kelvin confonderebbe il display con Θ e porterebbe a una massa diversa. La massa di ghiaccio non si somma alla lettura; bisogna prima ricostruire il bilancio alla finale fisica.

## 15 — Offset e guadagno prima della massa calda

I riferimenti hanno Θ_A=25 K e Θ_B=100/7 K. La differenza delle letture 150/7 su quella degli incrementi 75/7 K dà q=2 K⁻¹; poi b=1. Per C, (659/9−1)/2=325/9 K. Il fabbisogno del grammo di ghiaccio è 4000/9 J e ogni grammo caldo ne cede 500/9 J: servono otto grammi.

Passaggi: `q=\frac{51-207/7}{(25-100/7)\,\mathrm K}\qquad q=2\,\mathrm{K^{-1}}\qquad b=1\qquad \Theta_C=325/9\,\mathrm K\qquad m_{a,C}=\frac{4000/9}{500/9}\,\mathrm g\qquad m_{a,C}=8\,\mathrm g`

Distrattori e controllo: 4 g tornerebbero alla lettura A, S=51. 5 g con un solo grammo di ghiaccio darebbero Θ=175/6 K e S=178/3. 325/9 copia il numero dell’incremento in un’altra grandezza. 9 g darebbero Θ=75/2 K e S=76, diverso da 659/9.

## 16 — Un rapporto di masse non fissa la quantità

Sostituendo il vincolo, il numeratore è (800−300)m_i e la capacità finale 4·5m_i. La massa si cancella e rimane Θ=25 K per ogni m_i>0. Il dato termometrico ripete il rapporto assegnato e non determina la scala delle masse. Anche la condizione di fusione completa è rispettata a qualunque scala positiva.

Passaggi: `\Theta=\frac{(800-300)m_i}{4(4m_i+m_i)}\qquad \Theta=25\,\mathrm K\qquad T_f=25\,{}^\circ\mathrm C\qquad 2m_a>3m_i`

Distrattori e controllo: La coppia 4 g,1 g è un esempio e non una soluzione unica. 25 g copia il numero della temperatura; zero rende entrambe le masse nulle e la formula indefinita. Non occorre assegnare masse intere: il modello è continuo.
