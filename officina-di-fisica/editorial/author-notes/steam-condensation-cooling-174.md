# steam-condensation-cooling-174 — note dell’autore

Stato aggiornato: le didascalie e i testi visibili dello SVG ora indicano soltanto grandezze fisiche; tutte le coordinate geometriche sono invariate. Le indicazioni px delle note storiche sono coordinate intrinseche dello SVG, non pixel CSS dopo il ridimensionamento. I byte precedenti e le prove browser storiche sono archiviati con manifest e checksum in editorial/author-evidence/u5-phase-processes-173-177-pixel-labels-superseded-20261125. UI correnti NOT_RUN: nessun nuovo rendering di accettazione è stato eseguito per questa correzione; il profilo b963 resta sospeso.

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-03.json, file SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Letti individualmente tutti gli 80 prompt e le ipotesi 173–177 prima di scrivere i candidati. Catalogo reale C3-L01, C3-L03 e C3-L04 riletto; C1-L007 per la potenza del lotto 177. Solo assemble_family della pipeline esistente, course C3 e unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Pubblicazione non richiesta. I calcoli seguenti sono note dell’autore per la review distinta, non una certificazione.

I coefficienti ideali prescritti sono conservati. Le fasi del cammino, i moduli del calore e il verso dei trasferimenti sono espliciti. Le differenze sono in K; i rapporti delle letture Celsius, dove presenti, sono riferiti agli incrementi dal punto di fusione 0 °C e non a temperature assolute. I vincoli 16 confrontano preparazioni diverse: non modificano massa o potenza durante il singolo processo.

Controlli tecnici: due assembly identici; binding source/candidate/provenance verificati; import canonico in SQLite temporaneo, primo import 16 e secondo 0 con 16 invariati. Tutti i 991 contenuti pubblicati restano byte identici e le nuove teste non sono live. Lo SVG è stato letto interamente in XML e nel rendering completo. Nessun controllo strutturale è una review scientifica.

Anteprime browser correnti: NOT_RUN. Il profilo b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f è stato sospeso dall’integratore per difetti di occlusione in altri grafici. Si attende il nuovo runtime realmente corretto e verificato; nessun report viene ritaggato o riaccreditato automaticamente.

Il runner del lotto 174 era stato avviato appena prima della sospensione e ha poi terminato realmente con exit 0 e signal nullo. I suoi 48 casi e il marker autentico sono conservati con suffisso historical-b963, come prova storica su quel profilo sospeso, senza credito corrente. Snapshot originato dai byte ROOT 46338aac745b33ca29379bef583be5d8cb33a662: provenienza e checksum completi nel manifest u5-03-b-runtime-copy-manifest.json già consegnato con 173. Il nuovo profilo imporrà un vero rerender.

## 01 — Due tratti che cedono entrambi energia

La condensazione del grammo di vapore cede 2400 J senza cambiare la temperatura di fase. Il successivo raffreddamento del liquido cede altri mc_lΔT=100 J. Il modulo totale è la somma, 2500 J. Non occorre conoscere il valore di T_s per questi due contributi: è assegnata la differenza termica del secondo tratto e si garantisce che l’acqua resti liquida.

Passaggi: `Q_{c,\rm cond}=mL_v=2400\,\mathrm J\qquad Q_{c,\rm raff}=mc_l\Delta T\qquad Q_{c,\rm raff}=100\,\mathrm J\qquad Q_c=2500\,\mathrm J\qquad Q=-2500\,\mathrm J`

Distrattori e controllo: 2400 J omette il raffreddamento e 100 J omette la condensazione. 2300 J sottrae due contributi che sono entrambi ceduti. −2500 J sarebbe il calore con segno del campione, non il modulo positivo chiesto.

## 02 — Il modulo del calore è ancora energia

Sia mL_v sia mc_lΔT hanno unità joule. Il fatto di chiedere il modulo stabilisce il segno del risultato, senza cambiarne la dimensione. Il raffreddamento ΔT è un intervallo positivo, mentre la variazione di temperatura del liquido è T_f−T_s=−ΔT.

Passaggi: `[mL_v]=\mathrm J\qquad [mc_l\Delta T]=\mathrm J\qquad [Q_c]=\mathrm J`

Distrattori e controllo: J/g è energia per unità di massa e J/(g·K) capacità specifica, non il trasferimento totale. K è un intervallo; W richiederebbe anche una durata.

## 03 — Una somma di moduli coerente con i versi

La fase iniziale è vapore, quindi prima si libera il calore latente di condensazione. La massa ormai liquida cede poi calore sensibile diminuendo la temperatura. Per il calore con segno del campione entrambi i contributi sarebbero negativi; il loro modulo totale è mL_v+mc_lΔT. Raccogliamo la massa comune.

Passaggi: `Q=-mL_v-mc_l\Delta T\qquad Q_c=-Q\qquad Q_c=m(L_v+c_l\Delta T)`

Distrattori e controllo: Il segno meno nella parentesi tratterebbe il raffreddamento come un assorbimento. I termini isolati saltano una fase del percorso. L_v+ΔT somma J/g e K, grandezze diverse: non si può raccogliere c_l anche dal calore latente.

## 04 — La massa raddoppia entrambi gli scambi

Ogni grammo cede 2400 J condensando e 100 J raffreddandosi. Due grammi cedono 4800 J più 200 J, cioè 5000 J. L’intervallo del liquido e i coefficienti assegnati rimangono uguali: il totale è proporzionale alla massa.

Passaggi: `L_v+c_l\Delta T=2500\,\mathrm{J/g}\qquad Q_{c,A}=2500\,\mathrm J\qquad Q_{c,B}=2\cdot2500\,\mathrm J\qquad Q_{c,B}=5000\,\mathrm J`

Distrattori e controllo: 1250 J inverte la dipendenza dalla massa. 4900 J raddoppia soltanto la condensazione e lascia 100 J di raffreddamento per un solo grammo. 10000 J introduce un secondo raddoppio.

## 05 — La massa dalla somma energetica specifica

Il percorso completo richiede una cessione di 2500 J per ogni grammo. Dividendo il modulo totale per L_v+c_lΔT troviamo un grammo. La verifica dà 2400 J di condensazione e 100 J di raffreddamento.

Passaggi: `m=\frac{Q_c}{L_v+c_l\Delta T}\qquad L_v+c_l\Delta T=2500\,\mathrm{J/g}\qquad m=1\,\mathrm g`

Distrattori e controllo: 25/24 g divide soltanto per L_v e sovrastima la massa. 25 g divide soltanto per c_lΔT e omette la condensazione. Le due unità di massa possono sembrare corrette, ma i rispettivi bilanci non ricostruiscono Q_c.

## 06 — Il raffreddamento dopo la condensazione

Dai 2500 J/g ceduti togliamo i 2400 J/g della condensazione. Restano 100 J/g per il raffreddamento del liquido. Dividendo per c_l=4 J/(g·K) otteniamo 25 K. La temperatura finale sarebbe T_s−25 K; non è determinata numericamente senza assegnare T_s.

Passaggi: `Q_c/m-L_v=c_l\Delta T\qquad \Delta T=\frac{Q_c/m-L_v}{c_l}\qquad \Delta T=100/4\,\mathrm K\qquad \Delta T=25\,\mathrm K`

Distrattori e controllo: 625 K usa tutta la cessione come se provenisse dal raffreddamento. −25 K è la variazione con segno T_f−T_s, non il positivo ΔT chiesto. L’inversa richiede Q_c/m>L_v e deve rispettare il campo liquido dichiarato.

## 07 — Raddoppiare il raffreddamento non la condensazione

A cede 2500 J. In B il raffreddamento cede 200 J, mentre la condensazione resta 2400 J: totale 2600 J. Il rapporto 2600/2500 si riduce a 26/25. La parte latente non raddoppia quando cambia soltanto l’intervallo del liquido.

Passaggi: `Q_{c,A}=2500\,\mathrm J\qquad Q_{c,B}=(2400+200)\,\mathrm J\qquad Q_{c,B}=2600\,\mathrm J\qquad Q_{c,B}/Q_{c,A}=26/25`

Distrattori e controllo: Due raddoppia erroneamente tutto il percorso. 25/26 inverte il confronto, 26 omette il denominatore e uno trascura il raffreddamento aggiuntivo.

## 08 — La proposta usa il doppio dell’energia

Il modulo corretto è 2500 J. La proposta lo supera di altri 2500 J, perciò lo scarto è positivo. Il raffreddamento del sistema non rende negativo questo confronto fra due moduli: lo scarto segue l’ordine richiesto.

Passaggi: `Q_c=2500\,\mathrm J\qquad e=(5000-2500)\,\mathrm J\qquad e=2500\,\mathrm J`

Distrattori e controllo: −2500 J scambia proposta e risultato. 5000 J ripete la proposta, zero la accetta e 1250 J divide ancora la differenza per due.

## 09 — L’inversa deve conservare i due tratti

La parentesi L_v+c_lΔT è un’energia per unità di massa, positiva. Dividiamo Q_c per l’intera parentesi, ottenendo g. Usare un solo termine ricostruirebbe un processo diverso da quello che comprende condensazione e raffreddamento.

Passaggi: `Q_c=m(L_v+c_l\Delta T)\qquad m=\frac{Q_c}{L_v+c_l\Delta T}\qquad [m]=\mathrm g`

Distrattori e controllo: I divisori singoli omettono una parte della cessione. Il reciproco ha g⁻¹ e il prodotto J²/g; nessuno rappresenta la massa iniziale di vapore.

## 10 — Due fattori e un termine latente fisso

Sostituiamo il fattore di massa nell’intero percorso e quello termico soltanto nel termine c_lΔT. La massa A si cancella nel rapporto. L_v è un dato fisso, non viene moltiplicato per κ₂. I parametri devono descrivere due prove ammesse, senza introdurre una successiva solidificazione.

Passaggi: `Q_{c,B}=\kappa_1m_A(L_v+c_l\kappa_2\Delta T_A)\qquad Q_{c,A}=m_A(L_v+c_l\Delta T_A)\qquad \frac{Q_{c,B}}{Q_{c,A}}=\frac{\kappa_1(L_v+c_l\kappa_2\Delta T_A)}{L_v+c_l\Delta T_A}`

Distrattori e controllo: κ₁κ₂ raddoppierebbe anche il calore latente sotto un fattore termico doppio. Il quoziente semplice inverte l’effetto del raffreddamento. L’espressione reciproca scambia B e A; la somma dà due per prove identiche.

## 11 — Massa e raffreddamento aumentano insieme

A cede 2500 J. Ogni grammo di B cede 2600 J e i due grammi ne cedono 5200. Il rapporto 5200/2500 è 52/25. Il fattore due della massa agisce su tutti i termini; quello sul raffreddamento solo sul calore sensibile.

Passaggi: `Q_{c,A}=2500\,\mathrm J\qquad Q_{c,B}=2(2400+200)\,\mathrm J\qquad Q_{c,B}=5200\,\mathrm J\qquad Q_{c,B}/Q_{c,A}=52/25`

Distrattori e controllo: Due ignora il nuovo raffreddamento, 26/25 ignora la massa doppia. Quattro tratta il totale come un prodotto mΔT e 25/52 inverte il confronto.

## 12 — Media dei moduli ceduti nelle due prove

I moduli sono 2500 e 5200 J. La somma 7700 J divisa per due dà 3850 J. Gli ingressi medi sarebbero m=3/2 g e ΔT=75/2 K: il modello darebbe (3/2)(2400+150)=3825 J. È una terza prova, non la media delle due cessioni.

Passaggi: `\overline Q_c=\frac{2500+5200}{2}\,\mathrm J\qquad \overline Q_c=3850\,\mathrm J\qquad Q_{c,\rm ingressi\ medi}=3825\,\mathrm J`

Distrattori e controllo: 7700 J è la somma, 1350 J metà della differenza e 1925 J dimezza due volte. 3825 J applica la legge agli ingressi medi. Tutti sono moduli di energia, ma rispondono a operazioni differenti.

## 13 — Un bersaglio sul modulo totale

Il riferimento cede 2500 J e il bersaglio 5200 J. Su due grammi sono 2600 J/g. Togliendo la condensazione restano 200 J/g; divisi per c_l danno 50 K di raffreddamento, il doppio dei 25 K iniziali. La prova B rimane nel campo liquido come garantito.

Passaggi: `Q_{c,B}=5200\,\mathrm J\qquad Q_{c,B}/m_B=2600\,\mathrm{J/g}\qquad \Delta T_B=\frac{Q_{c,B}/m_B-L_v}{c_l}\qquad \Delta T_B=50\,\mathrm K\qquad \Delta T_B/\Delta T_A=2`

Distrattori e controllo: 52/25 copia il bersaglio sulle energie. 26/25 è il confronto energetico a massa uguale, non quello fra raffreddamenti. Un mezzo inverte il rapporto; quattro non ricostruisce 5200 J.

## 14 — Tarare la lettura prima della massa

A cede 2500 J, perciò q=3 J⁻¹. La nuova lettura rappresenta 5200 J. Con ΔT=50 K la cessione specifica è 2600 J/g: 5200 diviso 2600 dà due grammi. Il valore del display non è una quantità di calore già espressa in joule.

Passaggi: `q=3\,\mathrm{J^{-1}}\qquad Q_{c,B}=15600/q\qquad Q_{c,B}=5200\,\mathrm J\qquad m_B=\frac{Q_{c,B}}{L_v+c_l\Delta T_B}\qquad m_B=2\,\mathrm g`

Distrattori e controllo: Usare 15600 come joule darebbe 6 g. Dividere soltanto per L_v darebbe 13/6 g e ometterebbe il raffreddamento. La taratura e la legge del percorso sono due passaggi distinti.

## 15 — Separare guadagno e offset

I riferimenti cedono 2500 e 5200 J. La differenza 5400 delle letture su 2700 J dà q=2 J⁻¹; A fissa b=1. C cede (10001−1)/2=5000 J. Il suo costo specifico è 2500 J/g, perciò la massa è due grammi.

Passaggi: `q=\frac{10401-5001}{(5200-2500)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_{c,C}=5000\,\mathrm J\qquad m_C=2\,\mathrm g`

Distrattori e controllo: 4 g darebbero S=20001 e 1 g S=5001. 10001/5000 g omette b e ricostruisce S=10002. 5000 g usa il numero dell’energia come se fosse la massa.

## 16 — Un vincolo fra massa e raffreddamento

Sostituendo la massa scelta nella legge, l’incognita compare anche nel contributo sensibile. Poniamo x=ΔT/(1 K): l’equazione si riduce a x²+600x−15625=0, che si fattorizza (x−25)(x+625)=0. Il ramo positivo dà 25 K e m=1 g. Il ramo −625 renderebbe negativi sia ΔT sia m e non descrive il raffreddamento ammesso.

Passaggi: `Q_c=d\Delta T(L_v+c_l\Delta T)\qquad x=\Delta T/(1\,\mathrm K)\qquad x^2+600x-15625=0\qquad (x-25)(x+625)=0\qquad x=25\qquad \Delta T=25\,\mathrm K`

Distrattori e controllo: 625 K cambia soltanto il segno della radice esclusa senza soddisfare la quadratica. 50 K darebbe m=2 g e Q_c=5200 J; 2500 K copia un numero di energia come intervallo e non soddisfa né il bilancio né il campo liquido garantito.

Geometria conservata (solo nota autore, coordinate intrinseche dello SVG, non pixel CSS): Q axis .15 intrinsic units/J; vertical 4 intrinsic units/K; component bars .15 intrinsic units/J; comparison bars .08 intrinsic units/J.
