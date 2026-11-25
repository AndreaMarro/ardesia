# two-droplet-pressure-126 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-05.json. Letti individualmente tutti gli 80 originali assegnati 125–129 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C2-L010 e i suoi prerequisiti C2-L001/L002/L004. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Verifica bibliografica dei concetti fisici: [OpenStax, College Physics 2e, 11.8](https://openstax.org/books/college-physics-2e/pages/11-8-cohesion-and-adhesion-in-liquids-surface-tension-and-capillary-action). Consultati il conteggio delle superfici di un film e la proiezione verticale nella capillarità. Testi, esercizi, derivazioni e SVG nuovi sono autonomi; nessuna figura o frase del libro è riprodotta. I modelli di cavità sono fisici idealizzati e non danno indicazioni cliniche.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Sottrarre due sovrapressioni

Convertiamo insieme tensione e raggi: dieci mN/m sono un centesimo N/m e un millimetro è un millesimo di metro. La prima sovrapressione vale venti Pa, la seconda cinque. La pressione esterna comune si cancella, lasciando quindici Pa fra gli interni.

Passaggi: `\gamma=10^{-2}\,\mathrm{N/m}\qquad p_1-p_e=20\,\mathrm{Pa}\qquad p_2-p_e=5\,\mathrm{Pa}\qquad D=15\,\mathrm{Pa}`

Errori e controllo: Sommare darebbe venticinque Pa, mentre scambiare gli interni darebbe meno quindici. Trenta raddoppia il risultato come se ci fosse un film a due interfacce. Qui si conta una sola interfaccia per cavità.

## 02 — La differenza fra due pressioni

Sottrarre grandezze omogenee conserva la loro dimensione. La pressione è forza su area e si esprime in pascal. La legge di Laplace lo conferma: tensione superficiale in N/m divisa per raggio in m dà N/m².

Passaggi: `[D]=\mathrm{Pa}\qquad \left[\frac{\gamma}{r}\right]=\mathrm{N/m^2}\qquad \mathrm{N/m^2}=\mathrm{Pa}`

Errori e controllo: N/m è la tensione superficiale, N una forza, m un raggio e Pa·s una viscosità dinamica. Nessuna di queste diventa pressione soltanto sottraendo due letture.

## 03 — Il raggio piccolo richiede più pressione

Scriviamo separatamente i due salti e sottraiamoli. L’ambiente esterno scompare perché è comune. Siccome r₁ è minore, il suo reciproco è maggiore: la differenza di pressioni ha il segno positivo dichiarato. È una differenza di curvature, non il reciproco di una differenza di raggi.

Passaggi: `D=(p_1-p_e)-(p_2-p_e)\qquad D=2\gamma\left(\frac1{r_1}-\frac1{r_2}\right)\qquad D>0`

Errori e controllo: Invertire l’ordine dà −D. Il reciproco di r₂−r₁ divergerebbe per raggi uguali, quando D deve annullarsi. Moltiplicare per la differenza di raggi dà unità di forza e usare quattro conta due interfacce inesistenti.

## 04 — Aumentare soltanto il raggio piccolo

La prima sovrapressione scende da venti a dieci Pa, mentre la seconda resta cinque Pa. Le differenze sono dunque quindici e cinque Pa. Allargare la cavità piccola avvicina le due curvature e riduce D a un terzo.

Passaggi: `D_A=(20-5)\,\mathrm{Pa}=15\,\mathrm{Pa}\qquad D_B=(10-5)\,\mathrm{Pa}=5\,\mathrm{Pa}`

Errori e controllo: Dieci è il salto della prima cavità finale, non la differenza. Trenta attribuisce una dipendenza diretta al raggio e zero richiederebbe raggi uguali, che qui restano due e quattro mm.

## 05 — Ricavare il raggio della cavità piccola

La cavità grande ha un salto di cinque Pa. Per superarlo di quindici, la piccola deve avere un salto di venti Pa. Da 2γ/r₁=20 Pa si trova un millimetro, positivo e inferiore ai quattro mm noti.

Passaggi: `p_2-p_e=5\,\mathrm{Pa}\qquad p_1-p_e=20\,\mathrm{Pa}\qquad r_1=\frac{2\gamma}{20\,\mathrm{Pa}}\qquad r_1=1\,\mathrm{mm}`

Errori e controllo: Dividere 2γ solo per D ometterebbe il salto della seconda cavità. Sottrarre cinque da quindici nella ricostruzione confonderebbe D con una somma. Il controllo restituisce venti meno cinque.

## 06 — Ricavare il raggio della cavità grande

La sovrapressione nella prima cavità vale venti Pa. La seconda deve avere venti meno quindici, cinque Pa. Il suo raggio è quindi 2γ diviso cinque Pa: quattro millimetri. La positività richiede D inferiore al primo salto, come avviene qui.

Passaggi: `p_1-p_e=20\,\mathrm{Pa}\qquad p_2-p_e=5\,\mathrm{Pa}\qquad r_2=\frac{2\gamma}{5\,\mathrm{Pa}}\qquad r_2=4\,\mathrm{mm}`

Errori e controllo: Sommarvi D darebbe una seconda sovrapressione maggiore e un raggio più piccolo, contraddicendo r₁<r₂. Se D raggiungesse venti Pa non esisterebbe un r₂ finito: il denominatore sarebbe zero.

## 07 — Avvicinare il raggio grande al piccolo

A dà quindici Pa. In B il salto della cavità grande cresce a dieci Pa e D diventa venti meno dieci, dieci Pa. Il rapporto dieci su quindici si riduce a due terzi: si riduce la differenza anche se una singola sovrapressione aumenta.

Passaggi: `D_A=15\,\mathrm{Pa}\qquad D_B=10\,\mathrm{Pa}\qquad D_B/D_A=\frac23`

Errori e controllo: Un mezzo copia il rapporto fra i raggi grandi, che non coincide con il rapporto fra differenze. Tre mezzi inverte la richiesta, due segue la singola sovrapressione e uno ignora il cambiamento.

## 08 — Lo scarto di un fattore due

I salti sono venti e cinque Pa; la differenza corretta vale quindici. La proposta trenta supera il risultato di quindici Pa. Il modello ha una sola interfaccia: il fattore due aggiuntivo non è giustificato.

Passaggi: `D=15\,\mathrm{Pa}\qquad e=(30-15)\,\mathrm{Pa}\qquad e=15\,\mathrm{Pa}`

Errori e controllo: Meno quindici scambia proposta e risultato, trenta copia il valore iniziale e quarantacinque somma invece di sottrarre. Zero accetta la duplicazione.

## 09 — L’inversa ha una somma di curvature

Portiamo 1/r₂ a destra dopo aver diviso D per 2γ. Si ottiene una somma di due curvature positive. Il reciproco è quindi positivo e minore di r₂, proprio il dominio richiesto. Tutte le lunghezze devono essere nella stessa unità prima della somma.

Passaggi: `\frac1{r_1}=\frac{D}{2\gamma}+\frac1{r_2}\qquad r_1=\left(\frac{D}{2\gamma}+\frac1{r_2}\right)^{-1}`

Errori e controllo: Il segno meno non ricostruisce il primo salto. Omettere il reciproco restituisce una curvatura; 2γ/D ignora la seconda cavità. Nell’ultima proposta si sottraggono lunghezza e lunghezza inversa.

## 10 — Scalare due raggi distinti

Ogni curvatura riceve il proprio fattore inverso. Si sottraggono i contributi in B e si divide per la differenza in A; 2γ si cancella. Non esiste un unico prodotto di fattori valido per una differenza di due termini variati in modo indipendente.

Passaggi: `\frac{D_B}{D_A}=\frac{1/(\kappa_1r_1)-1/(\kappa_2r_2)}{1/r_1-1/r_2}`

Errori e controllo: I semplici rapporti o prodotti di κ perdono la differenza fra curvature. Se κ₁=κ₂=κ, il risultato deve ridursi a 1/κ: questo controllo esclude già tutte le quattro alternative proposte in generale.

## 11 — Due raggi maggiori con differenze nuove

A dà quindici Pa. In B il primo salto vale dieci e il secondo quattro Pa, dunque D_B=6 Pa. Sei su quindici si riduce a due quinti. Aumentare entrambi i raggi non basta a conoscere il rapporto senza sottrarre le due curvature.

Passaggi: `D_A=15\,\mathrm{Pa}\qquad D_B=(10-4)\,\mathrm{Pa}=6\,\mathrm{Pa}\qquad D_B/D_A=\frac25`

Errori e controllo: Sei è il valore finale in pascal, non il rapporto. Un mezzo e quattro quinti seguono soltanto uno dei due raggi; cinque mezzi capovolge il confronto.

## 12 — Media di due differenze interne

Le due differenze sono quindici e sei Pa. La somma ventuno divisa per due è ventuno mezzi Pa. I raggi medi, tre mezzi e nove mezzi mm, darebbero invece 80/9 Pa: la legge dipende dai reciproci e non commuta con la media dei raggi.

Passaggi: `\overline D=\frac{15+6}{2}\,\mathrm{Pa}\qquad \overline D=\frac{21}{2}\,\mathrm{Pa}`

Errori e controllo: Ventuno è la somma e nove mezzi la semidifferenza. Sei copia B. 80/9 risolve un’altra coppia di raggi anziché mediare le due uscite; la differenza rispetto a 21/2 è 29/18 Pa.

## 13 — Il raggio grande per il bersaglio di pressione

Il bersaglio è sei Pa. Con r₁,B=2 mm il primo salto è dieci Pa, perciò il secondo deve essere quattro Pa: r₂,B=5 mm. Il rapporto richiesto è cinque su quattro e mantiene r₂,B>r₁,B.

Passaggi: `D_B=6\,\mathrm{Pa}\qquad p_{2,B}-p_e=4\,\mathrm{Pa}\qquad r_{2,B}=5\,\mathrm{mm}\qquad r_{2,B}/r_{2,A}=\frac54`

Errori e controllo: Quattro quinti inverte i raggi. Due quinti è il bersaglio di D, non il fattore di r₂; due segue il cambiamento del solo r₁ e uno non produce sei Pa.

## 14 — Un display della differenza senza offset

D_A=15 Pa fissa q=3 Pa⁻¹. La nuova lettura dà D_B=6 Pa. Il salto della seconda cavità è quattro Pa e quindi quello della prima dieci Pa: il suo raggio è due mm. Non si usa la lettura come una pressione assoluta.

Passaggi: `q=3\,\mathrm{Pa^{-1}}\qquad D_B=6\,\mathrm{Pa}\qquad p_{1,B}-p_e=10\,\mathrm{Pa}\qquad r_{1,B}=2\,\mathrm{mm}`

Errori e controllo: Decodificare D e dimenticare il salto della seconda cavità darebbe un raggio diverso. La lettura riguarda una differenza: l’esterno comune si cancella ma i due salti restano nel modello.

## 15 — Offset e differenza di pressioni

A e B hanno D=15 e 6 Pa. Le differenze danno q=18/9=2 Pa⁻¹ e z=1. In C la differenza fisica è cinque Pa. La cavità di quattro mm ha già un salto di cinque Pa, quindi la prima deve averne dieci: r₁,C=2 mm.

Passaggi: `q=2\,\mathrm{Pa^{-1}}\qquad z=1\qquad D_C=5\,\mathrm{Pa}\qquad p_{1,C}-p_e=10\,\mathrm{Pa}\qquad r_{1,C}=2\,\mathrm{mm}`

Errori e controllo: Fra le alternative, uno riproduce A, quattro annullerebbe D, cinque mezzi darebbe D=3 Pa e un mezzo darebbe D=35 Pa: nessuno restituisce S=11.

## 16 — Un rapporto fisso fra i raggi

Il vincolo rende la prima curvatura quattro volte la seconda. La loro differenza vale tre volte 1/r₂, così D=6γ/r₂. Con γ=10 mN/m il numeratore è sessanta mN/m; diviso quindici Pa dà quattro mm. Ne segue r₁=1 mm.

Passaggi: `D=2\gamma\left(\frac4{r_2}-\frac1{r_2}\right)\qquad D=\frac{6\gamma}{r_2}\qquad r_2=4\,\mathrm{mm}\qquad r_1=1\,\mathrm{mm}`

Errori e controllo: Il quarto è un rapporto adimensionale, non una lunghezza aggiunta al raggio. Omettere la sottrazione delle curvature sostituirebbe il fattore tre con quattro e non riprodurrebbe i quindici Pa.
