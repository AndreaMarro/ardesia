# droplet-fragmentation-129 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-05.json. Letti individualmente tutti gli 80 originali assegnati 125–129 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C2-L010 e i suoi prerequisiti C2-L001/L002/L004. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Verifica bibliografica dei concetti fisici: [OpenStax, College Physics 2e, 11.8](https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action). Consultati il conteggio delle superfici di un film e la proiezione verticale nella capillarità. Testi, esercizi, derivazioni e SVG nuovi sono autonomi; nessuna figura o frase del libro è riprodotta. I modelli di cavità sono fisici idealizzati e non danno indicazioni cliniche.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Otto figlie e volume conservato

Otto volumi uguali impongono r³=R³/8, dunque r=R/2. Le otto superfici hanno area totale otto volte 4π(R/2)², cioè 8πR²: il doppio della superficie iniziale. Convertendo γ=1/100 N/m e R²=10⁻⁶ m², l’energia finale è 8π per dieci alla meno otto J, pari a 2π/25 µJ.

Passaggi: `Nr^3=R^3\qquad r=\frac R2\qquad A_f=8\pi R^2\qquad E_f=8\pi\,10^{-8}\,\mathrm J\qquad E_f=\frac{2\pi}{25}\,\mathrm{\mu J}`

Errori e controllo: π/25 µJ è l’energia iniziale e anche, in questo caso particolare, il solo incremento; non è l’energia finale. 8π/25 conserva troppo raggio alle figlie. Il volume conservato non implica superficie conservata.

## 02 — L’unità dell’energia di superficie

Il prodotto (N/m)m² è N·m, cioè un joule. Un microjoule è un milionesimo di joule: cambia la scala ma conserva la dimensione energetica. Area e tensione da sole non sono energie.

Passaggi: `[E_s]=\mathrm{N/m}\,\mathrm{m^2}\qquad [E_s]=\mathrm{N\,m}\qquad 1\,\mathrm{\mu J}=10^{-6}\,\mathrm J`

Errori e controllo: N/m è γ, Pa una pressione, mm² una superficie e N una forza. Il prefisso micro non indica il numero di goccioline.

## 03 — Il fattore cresce con la radice cubica di N

La conservazione del volume dà r=R/∛N. N superfici hanno area 4πNr²; sostituendo r, il fattore N si divide per N elevato a due terzi e resta ∛N. L’energia aumenta perché dividere il volume crea superficie. La differenza rispetto all’iniziale rappresenterebbe un’altra quantità.

Passaggi: `r=\frac R{\sqrt[3]N}\qquad A_f=4\pi R^2\sqrt[3]N\qquad E_f=4\pi\gamma R^2\sqrt[3]N\qquad E_i=4\pi\gamma R^2`

Errori e controllo: N al posto di ∛N tratta le figlie come se avessero raggio iniziale. La divisione per ∛N farebbe diminuire l’area; 4πγr² conta una sola figlia. Il termine ∛N−1 è l’incremento, non il valore finale.

## 04 — Raddoppiare il raggio iniziale

A N fissato anche il raggio figlio raddoppia. Ogni superficie, e quindi l’area totale, quadruplica. Con γ invariata l’energia passa da 2π/25 a 8π/25 µJ. Il volume iniziale cresce invece di otto: le due leggi non vanno confuse.

Passaggi: `\frac{E_{f,B}}{E_{f,A}}=\left(\frac{R_B}{R_A}\right)^2=4\qquad E_{f,B}=\frac{8\pi}{25}\,\mathrm{\mu J}`

Errori e controllo: 4π/25 segue una lunghezza e 16π/25 un volume. L’energia superficiale segue l’area, mentre γ costante non rende costante l’area stessa.

## 05 — L’inversa per il raggio iniziale

Con otto figlie ∛N=2, quindi E_f=8πγR². Isoliamo R² e convertiamo l’energia in joule prima della divisione: si ottiene 10⁻⁶ m². La radice positiva è 10⁻³ m, un millimetro. È il raggio iniziale, doppio del raggio di ciascuna figlia.

Passaggi: `R^2=\frac{E_f}{8\pi\gamma}\qquad R^2=10^{-6}\,\mathrm{m^2}\qquad R=10^{-3}\,\mathrm m\qquad R=1\,\mathrm{mm}`

Errori e controllo: Il ramo negativo non rappresenta un raggio. Un mezzo mm sarebbe il raggio figlio in questa prova e non la grandezza richiesta. π si elimina esattamente senza una sua approssimazione decimale.

## 06 — Ricavare un conteggio intero

L’energia iniziale è π/25 µJ. Il rapporto E_f/E_i vale due e coincide con ∛N. Elevando al cubo si ottiene N=8, intero positivo. Una radice cubica ricavata dai dati non va arrotondata a un conteggio: se il cubo non fosse un intero, i dati non rispetterebbero il modello esatto.

Passaggi: `\frac{E_f}{E_i}=2\qquad \sqrt[3]N=2\qquad N=2^3\qquad N=8`

Errori e controllo: Due è la radice cubica del conteggio, quattro il suo quadrato e non il numero richiesto. Usare direttamente E_f/E_i come N ignora che il raggio di ogni figlia si riduce.

## 07 — Da otto a ventisette figlie

Le radici cubiche esatte dei due conteggi sono due e tre. Con lo stesso raggio iniziale e la stessa γ il rapporto energetico è tre mezzi. Le figlie più numerose sono più piccole, quindi l’energia non cresce come il loro conteggio diretto.

Passaggi: `\sqrt[3]8=2\qquad \sqrt[3]{27}=3\qquad E_{f,B}/E_{f,A}=\frac32`

Errori e controllo: 27/8 è il rapporto dei conteggi, nove quarti è il quadrato del rapporto corretto e due terzi lo inverte. Uno confonde volume conservato e area conservata.

## 08 — Lo scarto fra energia proposta e finale

L’energia finale corretta è 2π/25 µJ. Sottraendola da 4π/25 resta 2π/25 µJ, positivo. Non si sta chiedendo l’aumento rispetto alla goccia iniziale: il riferimento dello scarto è la risposta finale corretta.

Passaggi: `E_f=\frac{2\pi}{25}\,\mathrm{\mu J}\qquad e=\frac{4\pi-2\pi}{25}\,\mathrm{\mu J}\qquad e=\frac{2\pi}{25}\,\mathrm{\mu J}`

Errori e controllo: Il segno negativo inverte la sottrazione. 4π/25 copia la proposta, 6π/25 somma e zero la accetta. Il solo incremento fisico sarebbe π/25 µJ, quantità ancora diversa.

## 09 — Una radice quadrata per R

Il modello contiene R² moltiplicato per 4πγ∛N. Dividiamo l’energia per quel coefficiente e prendiamo la radice positiva. Il quoziente ha dimensione di area, mentre N è un conteggio senza dimensione. γ e l’energia devono usare unità coerenti.

Passaggi: `R^2=\frac{E_f}{4\pi\gamma\sqrt[3]N}\qquad R=\sqrt{\frac{E_f}{4\pi\gamma\sqrt[3]N}}\qquad R>0`

Errori e controllo: Omettere la radice dà un’area, invertire la frazione una lunghezza inversa. Spostare ∛N al numeratore inverte il conteggio nell’inversa. La radice cubica è già servita alla conservazione del volume, ma R entra al quadrato nell’energia.

## 10 — Fattori compatibili con conteggi fisici

L’area dà il quadrato del fattore di R e la frammentazione dà la radice cubica del fattore di N. Il coefficiente 4πγ si cancella. κ₂ può essere razionale, purché trasformi il conteggio iniziale in un altro intero positivo: non si introduce un numero continuo di figlie.

Passaggi: `\frac{E_{f,B}}{E_{f,A}}=\kappa_1^2\sqrt[3]{\kappa_2}\qquad N_A\in\mathbb N_{>0}\qquad \kappa_2N_A\in\mathbb N_{>0}`

Errori e controllo: Una sola potenza di κ₁ segue il raggio, tre seguono il volume. κ₂ diretto dimentica il raggio ridotto delle figlie; la radice al denominatore farebbe diminuire l’energia aumentando il numero a R fissato.

## 11 — Raggio doppio e ventisette figlie

Il raggio iniziale doppio dà un fattore quattro. Il passaggio da otto a ventisette figlie dà un fattore tre mezzi. Il prodotto è sei; le energie sono 2π/25 e 12π/25 µJ.

Passaggi: `E_{f,A}=\frac{2\pi}{25}\,\mathrm{\mu J}\qquad E_{f,B}=\frac{12\pi}{25}\,\mathrm{\mu J}\qquad E_{f,B}/E_{f,A}=6`

Errori e controllo: Tre mezzi segue solo N e quattro solo R. Ventisette mezzi usa il conteggio direttamente e un sesto inverte le prove. Il rapporto resta senza unità.

## 12 — Media di energie con conteggi distinti

Le energie sono 2π/25 e 12π/25 µJ. La somma 14π/25 divisa per due dà 7π/25 µJ. Il conteggio medio sarebbe 35/2: non è intero e non definisce una prova di frammentazione nel dominio assegnato. La media statistica delle energie resta invece perfettamente definita.

Passaggi: `\overline E_f=\frac{2\pi+12\pi}{50}\,\mathrm{\mu J}\qquad \overline E_f=\frac{7\pi}{25}\,\mathrm{\mu J}`

Errori e controllo: 14π/25 è la somma, 5π/25 la semidifferenza e 12π/25 copia B. π/25 è l’energia iniziale di A. Non si sostituisce tacitamente N con un parametro continuo per applicare il modello agli ingressi medi.

## 13 — Il conteggio per sestuplicare l’energia

Il raggio doppio fornisce quattro dei sei fattori richiesti. La radice cubica del rapporto dei conteggi deve quindi valere sei quarti, tre mezzi. Elevando al cubo troviamo 27/8. Moltiplicando per le otto figlie iniziali si ottiene N_B=27, intero ammissibile.

Passaggi: `6=4\sqrt[3]{N_B/N_A}\qquad \sqrt[3]{N_B/N_A}=\frac32\qquad N_B/N_A=\frac{27}{8}\qquad N_B=27`

Errori e controllo: Tre mezzi è soltanto la radice cubica del rapporto; nove quarti il quadrato di quella radice. Otto ventisettesimi inverte il rapporto e sei ignora il contributo del raggio.

## 14 — Display energetico senza offset

A ha energia 2π/25 µJ, quindi q=3 µJ⁻¹. La nuova lettura equivale a 12π/25 µJ. Con N=27 la legge nelle unità assegnate è E_f=(3π/25)R_num² µJ, dove R_num è il raggio in mm: R_num²=4 e il raggio positivo è due mm.

Passaggi: `q=3\,\mathrm{\mu J^{-1}}\qquad E_{f,B}=\frac{12\pi}{25}\,\mathrm{\mu J}\qquad R_B^2=4\,\mathrm{mm^2}\qquad R_B=2\,\mathrm{mm}`

Errori e controllo: Sei è il rapporto fra letture, non il rapporto fra raggi. Occorre togliere anche il fattore della frammentazione prima della radice. Il display è continuo e non conta figlie.

## 15 — Un offset prima della radice

Dalle energie 2π/25 e 12π/25 µJ si trova q=2 µJ⁻¹ e z=1. C ha energia 8π/25 µJ. Con lo stesso N di A è quattro volte l’energia A, quindi il raggio è doppio: due mm.

Passaggi: `q=2\,\mathrm{\mu J^{-1}}\qquad z=1\qquad E_{f,C}=\frac{8\pi}{25}\,\mathrm{\mu J}\qquad R_C^2=4\,\mathrm{mm^2}\qquad R_C=2\,\mathrm{mm}`

Errori e controllo: Quattro confonde il rapporto energetico con quello dei raggi. Uno riproduce A, un mezzo darebbe un quarto dell’energia A e √2 solo il doppio. Nessuno di questi valori ricostruisce la lettura C dopo la taratura.

## 16 — Conteggio e raggio legati fra prove

Poniamo x=∛N>0. Il vincolo dà R=cx³ e la legge energetica diventa E_f=4πγc²x⁷. Con c=1/8000 m, il coefficiente è π/1600 µJ. La misura impone x⁷=128=2⁷, dunque x=2 e N=8. Si verifica R=1 mm e un conteggio intero.

Passaggi: `x=\sqrt[3]N\qquad E_f=4\pi\gamma c^2x^7\qquad x^7=128=2^7\qquad x=2\qquad N=8\qquad R=1\,\mathrm{mm}`

Errori e controllo: Il coefficiente c è una lunghezza per unità di conteggio, non un raggio figlio. La potenza settima combina R² con ∛N dopo la sostituzione: fermarsi al quadrato o al cubo perde parte del vincolo. Sul dominio x>0 la settima potenza è crescente, quindi la soluzione è unica.
