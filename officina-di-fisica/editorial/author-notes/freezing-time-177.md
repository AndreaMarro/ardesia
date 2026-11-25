# freezing-time-177 — note dell’autore

Stato aggiornato: le didascalie e i testi visibili dello SVG ora indicano soltanto grandezze fisiche; tutte le coordinate geometriche sono invariate. Le indicazioni px delle note storiche sono coordinate intrinseche dello SVG, non pixel CSS dopo il ridimensionamento. I byte precedenti e le prove browser storiche sono archiviati con manifest e checksum in editorial/author-evidence/u5-phase-processes-173-177-pixel-labels-superseded-20261125. UI correnti NOT_RUN: nessun nuovo rendering di accettazione è stato eseguito per questa correzione; il profilo b963 resta sospeso.

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-03.json, file SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Letti individualmente tutti gli 80 prompt e le ipotesi 173–177 prima di scrivere i candidati. Catalogo reale C3-L01, C3-L03 e C3-L04 riletto; C1-L007 per la potenza del lotto 177. Solo assemble_family della pipeline esistente, course C3 e unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Pubblicazione non richiesta. I calcoli seguenti sono note dell’autore per la review distinta, non una certificazione.

I coefficienti ideali prescritti sono conservati. Le fasi del cammino, i moduli del calore e il verso dei trasferimenti sono espliciti. Le differenze sono in K; i rapporti delle letture Celsius, dove presenti, sono riferiti agli incrementi dal punto di fusione 0 °C e non a temperature assolute. I vincoli 16 confrontano preparazioni diverse: non modificano massa o potenza durante il singolo processo.

Controlli tecnici: due assembly identici; binding source/candidate/provenance verificati; import canonico in SQLite temporaneo, primo import 16 e secondo 0 con 16 invariati. Tutti i 991 contenuti pubblicati restano byte identici e le nuove teste non sono live. Lo SVG è stato letto interamente in XML e nel rendering completo. Nessun controllo strutturale è una review scientifica.

Anteprime browser correnti: NOT_RUN. Il profilo b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f è stato sospeso dall’integratore per difetti di occlusione in altri grafici. Si attende il nuovo runtime realmente corretto e verificato; nessun report viene ritaggato o riaccreditato automaticamente.

## 01 — Raffreddare e poi solidificare

Il primo tratto sottrae c_lm·20 K=80 J per portare l’acqua a zero. Il secondo ne sottrae altri mL_f=300 J mentre la temperatura resta a zero e cambia la fase. In tutto il campione cede 380 J. Ogni secondo il dispositivo ne sottrae dieci: servono 38 s, composti da 8 s di raffreddamento e 30 s di congelamento.

Passaggi: `Q_c=c_lm(20\,\mathrm K)+mL_f\qquad Q_c=80\,\mathrm J+300\,\mathrm J\qquad t=Q_c/P\qquad t=38\,\mathrm s`

Distrattori e controllo: 8 s conta soltanto il raffreddamento; 30 s soltanto la solidificazione. Sommare 20 °C a 300 J/g senza il calore specifico mescolerebbe grandezze diverse. La sosta a temperatura costante non implica che il dispositivo smetta di estrarre calore.

## 02 — Una durata da joule e watt

La potenza netta è energia sottratta per unità di tempo. Dividendo i joule ceduti per watt, cioè joule al secondo, si ottengono secondi. La massa e la variazione termica concorrono all’energia, ma non sono l’unità della durata richiesta.

Passaggi: `[t]=[Q_c]/[P]\qquad \mathrm{J/W}=\mathrm s\qquad 1\,\mathrm W=1\,\mathrm{J/s}`

Distrattori e controllo: J misura energia, W potenza, J/g il calore latente specifico e K un intervallo termico. Una temperatura costante nella seconda fase può accompagnarsi a una durata positiva.

## 03 — Il tempo contiene due contributi

Raffreddamento e solidificazione cedono entrambi energia: i loro moduli si sommano. Poiché la stessa potenza netta resta costante nei due tratti, il tempo totale è la somma dei due tempi oppure il calore totale diviso P. Il bilancio non include il successivo raffreddamento del ghiaccio, perché il processo finisce a zero.

Passaggi: `t=t_{\rm raff}+t_{\rm cong}\qquad t=\frac{c_lm(20\,\mathrm K)}{P}+\frac{mL_f}{P}\qquad t=\frac{m[c_l(20\,\mathrm K)+L_f]}{P}\qquad t>0`

Distrattori e controllo: Le due formule con un solo termine tralasciano una fase. Il reciproco ha unità s⁻¹; il segno meno tratterebbe la solidificazione come un assorbimento anziché una cessione di calore da parte del campione.

## 04 — Raddoppiare il campione a potenza invariata

Ogni grammo deve cedere gli stessi 380 J. Due grammi ne cedono 760, e la potenza resta dieci joule al secondo: occorrono 76 s. Entrambi i tratti raddoppiano, da 8 a 16 s e da 30 a 60 s.

Passaggi: `Q_{c,B}=2Q_{c,A}\qquad t_B=760\,\mathrm J/(10\,\mathrm W)\qquad t_B=76\,\mathrm s\qquad t_B/t_A=2`

Distrattori e controllo: 19 s usa una dipendenza inversa dalla massa. 152 s attribuisce un quadrato alla massa; 40 s raddoppia il numero della temperatura iniziale, che è una lettura e non una durata.

## 05 — La massa dal tempo osservato

Durante 38 s il dispositivo sottrae 380 J. Il percorso assegnato richiede 380 J per ogni grammo: il rapporto dà un grammo. L’inversa usa tutta l’energia, non soltanto la fusione o soltanto il raffreddamento.

Passaggi: `Q_c=Pt=380\,\mathrm J\qquad m=\frac{Pt}{c_l(20\,\mathrm K)+L_f}\qquad m=\frac{380\,\mathrm J}{380\,\mathrm{J/g}}\qquad m=1\,\mathrm g`

Distrattori e controllo: 380/300 g attribuirebbe tutto il calore al solo cambiamento di fase. 19/4 g conterebbe soltanto il raffreddamento. Copiare 38 in grammi dimentica il fattore di potenza e il costo specifico.

## 06 — La potenza netta dalla durata

Il campione cede 80+300=380 J. Per sottrarli uniformemente in 38 s servono 380/38=10 J/s. Questa è la potenza termica netta estratta dal campione: il dato non determina la potenza elettrica assorbita dal dispositivo.

Passaggi: `P=\frac{m[c_l(20\,\mathrm K)+L_f]}{t}\qquad P=380\,\mathrm J/(38\,\mathrm s)\qquad P=10\,\mathrm W`

Distrattori e controllo: 300/38 W omette il raffreddamento; 80/38 W omette la solidificazione. Il rapporto t/Q_c ha unità W⁻¹ e risolve il reciproco della grandezza richiesta.

## 07 — Più potenza per la stessa energia

Entrambi i campioni cedono 380 J. A impiega 38 s, B soltanto 19 s perché ogni secondo viene sottratta energia doppia. Il rapporto è quindi un mezzo; la potenza maggiore accorcia ciascuna delle due fasi.

Passaggi: `t_A=38\,\mathrm s\qquad t_B=380\,\mathrm J/(20\,\mathrm W)\qquad t_B=19\,\mathrm s\qquad t_B/t_A=1/2`

Distrattori e controllo: Due inverte la dipendenza dalla potenza. Uno ignora il cambiamento; un quarto e quattro applicano un quadrato che non appartiene al bilancio energetico.

## 08 — Lo scarto conserva il verso richiesto

La durata corretta è 38 s; la proposta la supera di 38 s. A 10 W, 76 s estrarrebbero 760 J, più dei 380 previsti per fermarsi al ghiaccio a zero. Il modello non autorizza a prolungare il calcolo attribuendo il calore in più allo stesso stato finale.

Passaggi: `t=38\,\mathrm s\qquad e=t_{\rm proposto}-t\qquad e=(76-38)\,\mathrm s\qquad e=38\,\mathrm s`

Distrattori e controllo: −38 s scambia l’ordine della differenza. 76 s copia la proposta, zero la accetta e due è un rapporto puro al quale è stata aggiunta indebitamente l’unità di tempo.

## 09 — Isolare la massa nella legge energetica

Moltiplichiamo t=Q_c/P per P e dividiamo per l’energia richiesta da ogni grammo. Il denominatore è positivo e vale 380 J/g. Pt è in joule; il rapporto ha dunque unità di massa e resta positivo per ogni dato ammesso.

Passaggi: `Pt=m[c_l(20\,\mathrm K)+L_f]\qquad m=\frac{Pt}{c_l(20\,\mathrm K)+L_f}\qquad [m]=\mathrm{J/(J/g)}=\mathrm g`

Distrattori e controllo: Dividere per P anziché moltiplicare non dà un’energia al numeratore. P volte il costo specifico diviso t ha dimensione diversa da una massa. Usare solo L_f omette gli 80 J/g sensibili, mentre sottrarlo darebbe qui una massa negativa.

## 10 — Scalare massa e potenza fra due prove

Il costo energetico specifico resta lo stesso. Il tempo B contiene quindi un fattore κ₁ al numeratore e κ₂ al denominatore rispetto ad A. Se i due fattori coincidono, più energia da sottrarre è compensata da più potenza e la durata resta uguale.

Passaggi: `\varepsilon=c_l(20\,\mathrm K)+L_f\qquad t_A=m_A\varepsilon/P_A\qquad t_B=\kappa_1m_A\varepsilon/(\kappa_2P_A)\qquad t_B/t_A=\kappa_1/\kappa_2`

Distrattori e controllo: Il reciproco scambia i ruoli delle due variazioni. Il prodotto fa crescere il tempo con la potenza; il quadrato sovrastima la massa. La differenza darebbe zero con un fattore comune, pur trattandosi di due durate positive uguali.

## 11 — Più massa e meno potenza contemporaneamente

A dura 38 s. B deve cedere 760 J ma ne perde soltanto uno al secondo, quindi dura 760 s. Il rapporto 760/38=20 combina un fattore due dovuto alla massa e un fattore dieci dovuto alla potenza ridotta.

Passaggi: `t_A=38\,\mathrm s\qquad t_B=760\,\mathrm s\qquad t_B/t_A=760/38\qquad t_B/t_A=20`

Distrattori e controllo: Due considera soltanto la massa, dieci soltanto la potenza. Un quinto moltiplica due per un decimo senza invertire la dipendenza dalla potenza; un ventesimo capovolge il rapporto richiesto.

## 12 — Media delle durate, non dei parametri

Le durate sono 38 e 760 s. La loro somma è 798 s e la metà è 399 s. Usando invece massa media 3/2 g e potenza media 11/2 W si otterrebbero 1140/11 s: il quoziente non conserva in generale la media degli ingressi.

Passaggi: `\overline t=(38+760)\,\mathrm s/2\qquad \overline t=399\,\mathrm s\qquad t_{\rm ingressi\ medi}=\frac{380(3/2)}{11/2}\,\mathrm s\qquad t_{\rm ingressi\ medi}=1140/11\,\mathrm s`

Distrattori e controllo: 1140/11 s applica il modello ai parametri medi. 798 s non dimezza la somma; 361 s è metà della differenza. 399/2 s dimezza la media una seconda volta.

## 13 — Scegliere la potenza per una durata bersaglio

Il bersaglio è 20·38=760 s. I due grammi devono cedere 760 J: è necessaria P_B=1 W. Il confronto con 10 W iniziali dà un decimo. La potenza rimane positiva e costante in B, come richiesto dal modello.

Passaggi: `t_B=760\,\mathrm s\qquad P_B=760\,\mathrm J/(760\,\mathrm s)\qquad P_B=1\,\mathrm W\qquad P_B/P_A=1/10`

Distrattori e controllo: 1/20 dimentica che anche la massa raddoppia. Dieci inverte il confronto e venti segue direttamente il fattore sul tempo, pur essendo la potenza al denominatore. Due segue soltanto la massa.

## 14 — Tarare un display di durata

Il riferimento dura 38 s, quindi q=114/(38 s)=3 s⁻¹. La nuova lettura corrisponde a 760 s. A un watt vengono sottratti 760 J, pari al costo di due grammi. La lettura grezza del display non è una durata finché non è stata applicata la taratura.

Passaggi: `q=114/(38\,\mathrm s)\qquad q=3\,\mathrm{s^{-1}}\qquad t=2280/q\qquad t=760\,\mathrm s\qquad m=760/380\,\mathrm g\qquad m=2\,\mathrm g`

Distrattori e controllo: Usare 2280 direttamente come secondi darebbe 6 g, tre volte la massa corretta. Il numero 20 è il rapporto fra le letture e fra le durate, ma non fra le masse perché la potenza cambia.

## 15 — Due riferimenti rivelano un offset

A e B durano 38 e 760 s. La differenza delle letture è 1444 e quella dei tempi 722 s: q=2 s⁻¹. Dal riferimento A segue b=77−2·38=1. C dura (153−1)/2=76 s e cede 760 J; a 380 J/g corrispondono due grammi.

Passaggi: `q=\frac{1521-77}{(760-38)\,\mathrm s}\qquad q=2\,\mathrm{s^{-1}}\qquad b=1\qquad t_C=(153-1)/q\qquad t_C=76\,\mathrm s\qquad m_C=2\,\mathrm g`

Distrattori e controllo: 1 g tornerebbe alla lettura A, S=77. 153/76 g omette b: usando 153/2 s e 10 W si divide 765 J per 380 J/g. 4 g darebbero 152 s e S=305; 76 g copia il numero della durata in una massa.

## 16 — Un vincolo fra prove lascia libera la scala

Sostituiamo il vincolo nel tempo totale. La potenza si cancella e resta t=d·380 J/g=38 J/W=38 s. Il dato temporale conferma il vincolo ma non stabilisce la scala di massa e potenza: qualunque P>0 genera una massa positiva adatta. Il vincolo confronta preparazioni diverse; entro ciascuna la potenza è costante e la massa non viene modificata.

Passaggi: `t=\frac{dP\varepsilon}{P}\qquad t=d\varepsilon\qquad t=\frac1{10}\,\mathrm{g/W}\cdot380\,\mathrm{J/g}\qquad t=38\,\mathrm s`

Distrattori e controllo: 1 g e 10 W sono solo un esempio. 38 g copia una durata in una massa. P=0 è esclusa dal dominio e non raffredderebbe né solidificherebbe una massa positiva. Non si può ottenere una seconda equazione indipendente ripetendo lo stesso vincolo attraverso t.

Geometria conservata (solo nota autore, coordinate intrinseche dello SVG, non pixel CSS): Time axis 8 intrinsic units/s; vertical 8 intrinsic units/K; energy bars 1 intrinsic unit/J; time bars 8 intrinsic units/s.
