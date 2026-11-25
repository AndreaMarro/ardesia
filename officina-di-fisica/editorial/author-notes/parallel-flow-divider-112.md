# parallel-flow-divider-112 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-04.json. Letti individualmente tutti gli 80 originali 112–116 prima della scrittura, comprese le varianti concettuali 114-03, 115-03, 116-03 e l’analisi dimensionale 116-08. Riletti i testi reali delle lezioni C2-L007/L008/L009 e le loro dipendenze. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Queste sono note di calcolo per un revisore distinto.

Si conserva Q_T = 10 L/s imposta. La stessa Δp vale entro ciascuna coppia di rami alla stessa quota, ma cambia fra prove quando cambiano le resistenze. R₁Q₁ = R₂Q₂ e Q₁ + Q₂ = Q_T danno Q₁ = Q_T R₂/(R₁+R₂). Inverse fisiche richiedono 0 < Q₁ < Q_T. 12: media uscite 11/2 L/s distinta dai 40/7 L/s agli ingressi medi. 16: R₁ = R₂ lascia una scala positiva libera, quindi infinite coppie, benché cambi la pressione richiesta. Figure: frecce comuni a 20 px/(L/s), prima 200 = 100 + 100 px, poi 200 = 50 + 150 px. Barre di confronto A 100+100 e B 120+80 px; geometria dei collegamenti dichiarata schematica.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata; le grandezze con unità diverse non vengono confrontate con la stessa scala. Frecce su path separati, formule suddivise con law_steps. Nessun CSS, renderer o gate modificato.

## 01 — La stessa pressione divide il flusso

Le due resistenze uguali vedono lo stesso salto di pressione, quindi trasportano la stessa portata. La continuità divide i dieci litri al secondo in due parti da cinque. Il controllo pressorio dà lo stesso valore in entrambi i rami: un kPa·s/L per cinque L/s vale cinque kPa.

Passaggi: `Q_1+Q_2=Q_T\qquad R_1Q_1=R_2Q_2\qquad Q_1=Q_2\qquad Q_1=\frac{10}{2}\,\mathrm{L/s}\qquad Q_1=5\,\mathrm{L/s}`

Errori e controllo: Dieci nel solo primo ramo lascerebbe zero nel secondo, incompatibile con due resistenze finite positive allo stesso salto di pressione. Uno copia il numero della resistenza, non una portata.

## 02 — Che cosa si misura nel ramo

Q₁ conta volume per unità di tempo. Si può ricavare da Δp/R₁: le unità di pressione si cancellano e resta litro al secondo. Il litro vale esattamente un millesimo di metro cubo, senza cambiare la dimensione di portata.

Passaggi: `Q_1=\frac{\Delta p}{R_1}\qquad [Q_1]=L^3/T\qquad \frac{\mathrm{kPa}}{\mathrm{kPa\,s/L}}=\mathrm{L/s}\qquad 1\,\mathrm{L/s}=10^{-3}\,\mathrm{m^3/s}`

Errori e controllo: kPa è pressione, kPa·s/L resistenza, s/L portata inversa e L volume. La resistenza non è un volume che si possa sommare alla portata.

## 03 — Continuità e legge resistiva insieme

Sostituiamo Q₂=Q_T−Q₁ nell’uguaglianza delle cadute. Il termine R₂Q₁ passa sul lato del primo ramo e si raccoglie Q₁. La resistenza dell’altro ramo compare al numeratore: se diventa più difficile attraversare il secondo, una frazione maggiore del flusso imposto entra nel primo.

Passaggi: `R_1Q_1=R_2(Q_T-Q_1)\qquad (R_1+R_2)Q_1=R_2Q_T\qquad Q_1=\frac{Q_TR_2}{R_1+R_2}`

Errori e controllo: Mettere R₁ al numeratore calcola Q₂. La somma delle resistenze deve dividere, non moltiplicare; il rapporto R₂/R₁ da solo manca della normalizzazione sul totale. Dividere Q_T per una resistenza altera le dimensioni.

## 04 — Il primo ramo diventa più resistente

Nel nuovo stato il denominatore è tre più uno e il numeratore resta dieci. Il primo ramo scende da cinque a cinque mezzi L/s, mentre il secondo sale a quindici mezzi. La pompa deve ora sostenere una caduta comune di quindici mezzi kPa, maggiore dei cinque iniziali.

Passaggi: `Q_{1,A}=5\,\mathrm{L/s}\qquad Q_{1,B}=\frac{10}{3+1}\,\mathrm{L/s}\qquad Q_{1,B}=\frac52\,\mathrm{L/s}\qquad Q_{2,B}=\frac{15}{2}\,\mathrm{L/s}`

Errori e controllo: Quindici tratterebbe la resistenza come fattore diretto e supererebbe Q_T. Cinque terzi suppone erroneamente pressione fissa; la pompa qui mantiene la portata totale, non Δp. Cinque ignora la modifica, zero richiederebbe un ramo chiuso come limite, non R₁=3.

## 05 — La resistenza del primo ramo da Q₁

L’altra portata è dieci meno cinque, ancora cinque L/s. Il secondo ramo fissa Δp=5 kPa; dividendo quel salto per Q₁ si ritrova R₁=1 kPa·s/L. La misura determina un rapporto fra le resistenze, e il valore noto del secondo ramo ne fissa la scala.

Passaggi: `Q_2=Q_T-Q_1=5\,\mathrm{L/s}\qquad \Delta p=R_2Q_2=5\,\mathrm{kPa}\qquad R_1=\frac{\Delta p}{Q_1}\qquad R_1=1\,\mathrm{kPa\,s/L}`

Errori e controllo: Attribuire direttamente il numero cinque alla resistenza confonderebbe due grandezze diverse. Un’inversa fisica deve rispettare 0<Q₁<Q_T: altrimenti non lascerebbe una seconda portata positiva.

## 06 — La resistenza del secondo ramo

La prima legge resistiva dà Δp=1·5=5 kPa. Anche il secondo ramo porta cinque L/s, quindi R₂=5/5=1 kPa·s/L. Non si divide la pressione per la portata totale, che comprende entrambi i percorsi.

Passaggi: `Q_2=Q_T-Q_1\qquad \Delta p=R_1Q_1\qquad R_2=\frac{R_1Q_1}{Q_T-Q_1}\qquad R_2=1\,\mathrm{kPa\,s/L}`

Errori e controllo: Usare Q_T al denominatore darebbe 1/2 kPa·s/L, la resistenza equivalente della coppia iniziale, non quella del solo secondo ramo.

## 07 — Ostacolare l’altro percorso

A divide il totale in cinque e cinque. In B il secondo ramo è più resistente: il primo riceve dieci per tre quarti, cioè quindici mezzi L/s. Il rapporto con cinque è tre mezzi. La crescita di R₂ non ostacola il primo ramo: redistribuisce verso di esso il flusso imposto.

Passaggi: `Q_{1,A}=5\,\mathrm{L/s}\qquad Q_{1,B}=\frac{30}{4}\,\mathrm{L/s}\qquad Q_{1,B}=\frac{15}{2}\,\mathrm{L/s}\qquad \frac{Q_{1,B}}{Q_{1,A}}=\frac32`

Errori e controllo: Due terzi inverte gli stati, tre segue soltanto il numeratore senza aggiornare la somma, un mezzo scambia l’effetto dei rami e uno ignora la nuova ripartizione.

## 08 — Una proposta che svuota un ramo

Il valore corretto è cinque L/s e lo scarto è più cinque. La proposta porterebbe Q₂ a zero; il secondo ramo darebbe allora Δp=0, mentre il primo richiederebbe dieci kPa. Uno stesso paio di nodi non può avere entrambi quei salti di pressione.

Passaggi: `Q_1=5\,\mathrm{L/s}\qquad e=(10-5)\,\mathrm{L/s}\qquad e=5\,\mathrm{L/s}`

Errori e controllo: Meno cinque rovescia la sottrazione, dieci copia la proposta, zero la accetta e cinque mezzi dimezza lo scarto. La contraddizione riguarda insieme continuità e pressione comune.

## 09 — L’inversa e il dominio della portata

Dall’uguaglianza R₁Q₁=R₂(Q_T−Q₁) dividiamo per Q₁>0. La differenza al numeratore è Q₂ e deve restare positiva. Il rapporto delle portate è puro, perciò moltiplicando R₂ si ottiene ancora una resistenza.

Passaggi: `R_1Q_1=R_2(Q_T-Q_1)\qquad R_1=R_2\frac{Q_T-Q_1}{Q_1}\qquad 0<Q_1<Q_T`

Errori e controllo: Il rapporto inverso scambia i due rami; Q₁/R₂ non ha dimensione di resistenza. Omettere −Q₁ sostituisce la portata totale a Q₂ e manca un termine. Senza dividere per Q₁ resta una pressione, non R₁.

## 10 — Scalare due resistenze

Il numeratore della portata nel primo ramo contiene R₂, quindi acquista κ₂. Il denominatore è la nuova somma D. Dividendo per lo stato A si cancella Q_T e compare U al numeratore. Se entrambi i fattori coincidono, le resistenze cambiano scala ma la ripartizione resta uguale.

Passaggi: `Q_{1,A}=\frac{Q_TR_2}{U}\qquad Q_{1,B}=\frac{Q_T\kappa_2R_2}{D}\qquad \frac{Q_{1,B}}{Q_{1,A}}=\frac{\kappa_2U}{D}`

Errori e controllo: κ₁ al numeratore segue il ramo sbagliato; D/U al posto di U/D inverte la normalizzazione. κ₁/κ₂ omette le resistenze iniziali e l’ultima opzione è il reciproco del rapporto richiesto.

## 11 — Due resistenze cambiano insieme

In B tre quinti del totale passano nel primo ramo: sei L/s. Il secondo ne porta quattro e le due cadute sono entrambe dodici kPa, due per sei e tre per quattro. Rispetto ai cinque L/s iniziali il rapporto è sei quinti.

Passaggi: `Q_{1,B}=10\frac35\,\mathrm{L/s}\qquad Q_{1,B}=6\,\mathrm{L/s}\qquad Q_{2,B}=4\,\mathrm{L/s}\qquad \frac{Q_{1,B}}{Q_{1,A}}=\frac65`

Errori e controllo: Cinque sesti inverte gli stati, tre mezzi o due terzi usano soltanto i fattori delle resistenze, sei è il valore della portata B e non un rapporto puro.

## 12 — La media di due prove della pompa

Le due portate sono cinque e sei L/s. La semisomma è undici mezzi L/s. Si mediano due risultati di apparati distinti, non si sostituiscono prima le resistenze medie nella rete: il quoziente delle resistenze non è una legge lineare dei due ingressi.

Passaggi: `\overline Q_1=\frac{5+6}{2}\,\mathrm{L/s}\qquad \overline Q_1=\frac{11}{2}\,\mathrm{L/s}`

Errori e controllo: Undici è la somma, undici quarti dimezza due volte e uno è la differenza. Le resistenze medie 3/2 e 2 kPa·s/L darebbero 10·2/(7/2)=40/7 L/s, maggiore della media richiesta di 3/14 L/s.

## 13 — La seconda resistenza per un bersaglio

Il bersaglio è sei L/s, quindi al secondo ramo restano quattro. Dal primo ramo il salto comune è due per sei, dodici kPa; il secondo deve quindi avere resistenza dodici diviso quattro, tre kPa·s/L. Il rapporto rispetto all’uno iniziale è tre.

Passaggi: `Q_{1,B}=6\,\mathrm{L/s}\qquad Q_{2,B}=4\,\mathrm{L/s}\qquad \Delta p_B=12\,\mathrm{kPa}\qquad R_{2,B}=3\,\mathrm{kPa\,s/L}\qquad R_{2,B}/R_{2,A}=3`

Errori e controllo: Un terzo inverte le resistenze; sei quinti copia il bersaglio della portata. R₂=2 lascerebbe portate uguali da cinque, mentre R₂=3/2 darebbe 30/7 L/s, non sei.

## 14 — Un display senza offset

Nel riferimento Q₁ vale cinque L/s e il guadagno è tre s/L. La lettura diciotto significa sei L/s; la seconda portata è quattro L/s. R₂=3 produce dodici kPa, che divisi per i sei L/s del primo ramo danno R₁=2 kPa·s/L.

Passaggi: `q=3\,\mathrm{s/L}\qquad Q_{1,B}=6\,\mathrm{L/s}\qquad Q_{2,B}=4\,\mathrm{L/s}\qquad \Delta p_B=12\,\mathrm{kPa}\qquad R_{1,B}=\frac{\Delta p_B}{Q_{1,B}}\qquad R_{1,B}=2\,\mathrm{kPa\,s/L}`

Errori e controllo: La lettura grezza diciotto non è una portata: supererebbe i dieci L/s totali. La taratura va rimossa prima di applicare il vincolo fisico 0<Q₁<Q_T.

## 15 — Due riferimenti per togliere l’offset

I riferimenti danno cinque e sei L/s. Due unità di lettura per un L/s fissano q=2 s/L e poi z=1. La prova C ha Q₁=(6−1)/2=5/2 L/s e Q₂=15/2 L/s. Il rapporto delle portate è tre, quindi R₁ è tre volte R₂.

Passaggi: `q=2\,\mathrm{s/L}\qquad z=1\qquad Q_{1,C}=\frac52\,\mathrm{L/s}\qquad Q_{2,C}=\frac{15}{2}\,\mathrm{L/s}\qquad R_{1,C}=3\,\mathrm{kPa\,s/L}`

Errori e controllo: Con R₂=1, le resistenze R₁=1,2,4,6 kPa·s/L produrrebbero letture 11,23/3,5,27/7: nessuna è sei. La nuova resistenza tre restituisce Q₁=5/2 e S=6.

## 16 — Una ripartizione che non fissa la scala

Con resistenze uguali la formula diventa Q₁=Q_T/2=5 L/s qualunque sia il loro valore positivo. La misura ripete un’informazione già contenuta nel vincolo. Le coppie (1,1) e (2,2) kPa·s/L danno entrambe cinque L/s nel primo ramo; la pressione richiesta passa però da cinque a dieci kPa.

Passaggi: `R_1=R_2=R>0\qquad Q_1=\frac{Q_TR}{2R}\qquad Q_1=\frac{Q_T}{2}\qquad Q_1=5\,\mathrm{L/s}`

Errori e controllo: Due esempi non esauriscono le possibilità: ogni R>0 fornisce una coppia. La coppia nulla è esclusa e renderebbe indefinita la formula. Una misura di pressione aggiuntiva fisserebbe invece la scala delle resistenze.
