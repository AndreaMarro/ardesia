# capillary-rise-127 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-05.json. Letti individualmente tutti gli 80 originali assegnati 125–129 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C2-L010 e i suoi prerequisiti C2-L001/L002/L004. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Verifica bibliografica dei concetti fisici: [OpenStax, College Physics 2e, 11.8](https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action). Consultati il conteggio delle superfici di un film e la proiezione verticale nella capillarità. Testi, esercizi, derivazioni e SVG nuovi sono autonomi; nessuna figura o frase del libro è riprodotta. I modelli di cavità sono fisici idealizzati e non danno indicazioni cliniche.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — La colonna sostenuta dal bordo

Il peso della colonna è proporzionale all’area πr²; la forza verticale di interfaccia è proporzionale al perimetro 2πr. Cancellando un fattore πr resta h=2γ/(ρgr). Convertiamo cinquanta mN/m in 1/20 N/m e un mm in 1/1000 m: h=1/100 m, cioè dieci mm.

Passaggi: `\gamma=\frac1{20}\,\mathrm{N/m}\qquad r=10^{-3}\,\mathrm m\qquad h=\frac{2\gamma}{\rho gr}\qquad h=\frac1{100}\,\mathrm m\qquad h=10\,\mathrm{mm}`

Errori e controllo: Il risultato è una quota rispetto al serbatoio, non la lunghezza totale bagnata del tubo. Usare il diametro come raggio dimezzerebbe h; raddoppiare la forza come per un film di sapone conterebbe una seconda interfaccia assente.

## 02 — L’unità di un dislivello

Un dislivello ha dimensione di lunghezza. Nel rapporto 2γ/(ρgr), il numeratore ha unità N/m e il denominatore N/m²: la divisione restituisce metri. Il millimetro è un sottomultiplo della stessa dimensione.

Passaggi: `[\rho gr]=\mathrm{N/m^2}\qquad [h]=\frac{\mathrm{N/m}}{\mathrm{N/m^2}}\qquad [h]=\mathrm m`

Errori e controllo: mm² è area, Pa pressione, N/m tensione superficiale e µL volume. Conoscere il volume della colonna richiederebbe moltiplicare h per l’area del tubo.

## 03 — Perché il raggio compare al denominatore

La forza di superficie cresce con il perimetro, mentre il peso per unità di altezza cresce con l’area. Il rapporto fra perimetro e area è 2/r. Più in generale la forza verticale contiene cosθ: a bagnamento perfetto cosθ=1. Un angolo maggiore di novanta gradi darebbe depressione e non il caso positivo assegnato.

Passaggi: `F_z=2\pi r\gamma\cos\theta\qquad \rho g\pi r^2h=F_z\qquad h=\frac{2\gamma\cos\theta}{\rho gr}\qquad \theta=0\qquad h=\frac{2\gamma}{\rho gr}`

Errori e controllo: r al numeratore inverte il rapporto perimetro/area. Omettere due perde il rapporto geometrico; r² al denominatore conserva erroneamente tutta l’area senza cancellare il raggio del bordo. L’ultima formula è un’altezza inversa.

## 04 — Una tensione assegnata minore

A geometria, densità e gravità fissate, h è direttamente proporzionale a γ. Quaranta cinquantesimi è quattro quinti: dieci mm diventano otto mm. Nelle unità numeriche dichiarate h in mm si ottiene dividendo γ in mN/m per cinque volte r in mm.

Passaggi: `\frac{h_B}{h_A}=\frac{40}{50}=\frac45\qquad h_B=8\,\mathrm{mm}`

Errori e controllo: Cinque e venti usano un dimezzamento o raddoppio che non è nei dati. Quaranta copia il numero di γ con unità diversa; dieci ignora la nuova forza di bordo.

## 05 — Inferire la tensione da h e r

Invertiamo il bilancio: γ=ρgrh/2. Dopo le conversioni r=1/1000 m e h=1/100 m, il prodotto ρgrh vale un decimo N/m; dividendolo per due si trova 1/20 N/m, ossia cinquanta mN/m.

Passaggi: `\gamma=\frac{\rho grh}{2}\qquad \gamma=\frac1{20}\,\mathrm{N/m}\qquad \gamma=50\,\mathrm{mN/m}`

Errori e controllo: Dimenticare il mezzo darebbe cento mN/m. Inserire dieci come metri al posto di dieci mm moltiplicherebbe per mille la tensione. Si verifica rimettendo γ nell’altezza del modello.

## 06 — Il raggio interno ricavato dal livello

Dalla legge dell’altezza si isola r=2γ/(ρgh). Il numeratore vale un decimo N/m; il denominatore, con h=1/100 m, vale cento N/m². Il rapporto è un millesimo di metro, un mm.

Passaggi: `r=\frac{2\gamma}{\rho gh}\qquad h=10^{-2}\,\mathrm m\qquad r=10^{-3}\,\mathrm m\qquad r=1\,\mathrm{mm}`

Errori e controllo: L’inversa restituisce il raggio, non il diametro di due mm. Il rapporto γ/h da solo non basta: mancano densità, gravità e il fattore due.

## 07 — Raggio doppio a tensione fissa

Il perimetro raddoppia, ma l’area e il peso per unità di altezza quadruplicano. Per riequilibrare la colonna l’altezza si dimezza: da dieci a cinque mm. Il rapporto è un mezzo, non un quarto, perché anche la forza superficiale è cambiata.

Passaggi: `h_A=10\,\mathrm{mm}\qquad h_B=5\,\mathrm{mm}\qquad h_B/h_A=\frac12`

Errori e controllo: Un quarto segue solo l’area senza il perimetro; due rovescia l’inversa e quattro segue il solo aumento dell’area. Uno ignora il raggio nuovo.

## 08 — L’errore di un’altezza duplicata

Il bilancio del modello dà dieci mm. La proposta venti eccede il valore corretto di dieci mm. Uno scarto positivo indica soltanto una sovrastima della quota.

Passaggi: `h=10\,\mathrm{mm}\qquad e=(20-10)\,\mathrm{mm}\qquad e=10\,\mathrm{mm}`

Errori e controllo: Meno dieci inverte la sottrazione; venti conserva la proposta, trenta somma e zero accetta il fattore due spurio.

## 09 — Una formula inversa senza unità miste

Moltiplichiamo h per ρgr e dividiamo per due. Le unità sono (kg/m³)(m/s²)m² = kg/s² = N/m. Il risultato è una tensione: le conversioni da mm a m devono precedere l’uso della formula SI.

Passaggi: `\rho grh=2\gamma\qquad \gamma=\frac{\rho grh}{2}\qquad [\gamma]=\mathrm{N/m}`

Errori e controllo: Invertire il prodotto o spostare r al denominatore cambia dimensioni e dipendenze. Il fattore due al numeratore quadruplica la tensione rispetto all’inversa corretta.

## 10 — Tensione e raggio variati insieme

La tensione compare direttamente e il raggio inversamente. Cancellando il coefficiente comune 2/(ρg) rimane κ₁/κ₂. Aumentare entrambi dello stesso fattore lascia h invariata nel modello.

Passaggi: `\frac{h_B}{h_A}=\frac{\kappa_1\gamma_A}{\kappa_2r_A}\frac{r_A}{\gamma_A}\qquad h_B/h_A=\frac{\kappa_1}{\kappa_2}`

Errori e controllo: Il prodotto tratta il raggio come dipendenza diretta; κ₂/κ₁ capovolge le due variazioni. Il quadrato dimentica la cancellazione di un raggio dal perimetro e la somma non vale uno per prove identiche.

## 11 — Meno tensione e un tubo più largo

La tensione diminuisce di un fattore quattro quinti e il raggio doppio dimezza ulteriormente l’altezza. Il prodotto è due quinti: h passa da dieci a quattro mm. Le due modifiche riducono entrambe il livello nel modello.

Passaggi: `h_A=10\,\mathrm{mm}\qquad h_B=4\,\mathrm{mm}\qquad h_B/h_A=\frac25`

Errori e controllo: Quattro quinti considera solo γ e un mezzo solo r. Cinque mezzi inverte il rapporto; quattro è il numero finale in mm, non una quantità adimensionale.

## 12 — La media dei due livelli

Le altezze calcolate sono dieci e quattro mm. La semisomma è sette mm. Usare invece γ medio quarantacinque mN/m e r medio tre mezzi mm darebbe sei mm, un millimetro in meno della media richiesta.

Passaggi: `\overline h=\frac{10+4}{2}\,\mathrm{mm}\qquad \overline h=7\,\mathrm{mm}`

Errori e controllo: Quattordici è la somma, tre la semidifferenza e quattro la sola lettura B. Sei appartiene agli ingressi medi: una dipendenza razionale non consente di scambiare automaticamente i due procedimenti.

## 13 — Il raggio per un’altezza obiettivo

Il bersaglio è quattro mm. Il fattore di tensione è quattro quinti, quindi (4/5)/(r_B/r_A)=2/5. Moltiplicando in croce si trova r_B/r_A=2, cioè un raggio finale di due mm.

Passaggi: `\frac25=\frac{4/5}{r_B/r_A}\qquad r_B/r_A=2\qquad r_B=2\,\mathrm{mm}`

Errori e controllo: Un mezzo capovolge la variazione; quattro quinti segue solo la tensione e due quinti il bersaglio. Quattro renderebbe l’altezza due mm, inferiore a quella richiesta.

## 14 — Da una lettura calibrata alla tensione

Il riferimento ha altezza dieci mm: q=3 mm⁻¹. La lettura dodici corrisponde a quattro mm. L’inversa γ=ρgrh/2, con r due mm e h quattro mm, dà quaranta mN/m. Il raggio diverso va inserito dopo aver decodificato il livello.

Passaggi: `q=3\,\mathrm{mm^{-1}}\qquad h_B=4\,\mathrm{mm}\qquad \gamma_B=\frac{\rho gr_Bh_B}{2}\qquad \gamma_B=40\,\mathrm{mN/m}`

Errori e controllo: Dodici non è l’altezza fisica e quattro non è una tensione. Una lettura pari a due quinti del riferimento non implica γ pari a due quinti se r è cambiato.

## 15 — Sottrarre l’offset prima del bilancio

A e B hanno h=10 e 4 mm. Dalle differenze si trova q=12/6=2 mm⁻¹ e quindi z=1. La prova C ha h=(17−1)/2=8 mm. Nel tubo da un mm il bilancio restituisce quaranta mN/m.

Passaggi: `q=2\,\mathrm{mm^{-1}}\qquad z=1\qquad h_C=8\,\mathrm{mm}\qquad \gamma_C=40\,\mathrm{mN/m}`

Errori e controllo: Cinquanta riprodurrebbe S=21; venti darebbe S=9, ottanta S=33. Diciassette copia il display senza eliminare offset né unità.

## 16 — Quando una misura non determina il raggio

Sostituendo γ=cr, il raggio positivo si cancella: h=2c/(ρg)=1/100 m. La misura dieci mm ripete esattamente quel vincolo e non fissa la scala di r. Ogni r positivo con γ=cr soddisfa il modello; anche limitandosi a un intervallo di piccoli raggi ammissibili restano infinite coppie.

Passaggi: `h=\frac{2cr}{\rho gr}\qquad h=\frac{2c}{\rho g}\qquad h=10\,\mathrm{mm}`

Errori e controllo: La coppia r=1 mm,γ=50 mN/m è un esempio, non una soluzione unica. Il vincolo è fra prove e non una proprietà universale dell’acqua; una seconda misura indipendente di r o γ fisserebbe la scala.
