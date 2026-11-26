# wave-phase-space-136 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-01.json. Letti individualmente tutti gli 80 originali assegnati 135–139 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L04 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I casi di smorzamento, fase accumulata e potenza normalizzata sono mantenuti distinti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Un tratto di lunghezza d’onda

Una lunghezza d’onda corrisponde a un giro completo di fase. Un metro è un quarto dei quattro metri necessari al giro: ν=Δs/λ=1/4. In radianti il modulo della differenza sarebbe π/2; dividendo per 2π si ritorna a un quarto di giro.

Passaggi: `\nu=\frac{\Delta s}{\lambda}\qquad \nu=\frac14\qquad |\Delta\varphi|=2\pi\nu\qquad |\Delta\varphi|=\frac\pi2`

Errori e controllo: Quattro inverte distanza e lunghezza d’onda; un mezzo corrisponderebbe a due metri. Uno richiederebbe quattro metri e 2π confonde il coefficiente di conversione in radianti con il valore in giri.

## 02 — Una misura di fase adimensionale

Il rapporto di due lunghezze omogenee non ha dimensioni fisiche. La parola giri specifica la convenzione di misura della fase: un giro vale 2π radianti. Un valore frazionario è ammesso perché si misura un avanzamento, non un numero di oggetti.

Passaggi: `[\nu]=\frac L L=1\qquad 1\,\text{giro}=2\pi\,\mathrm{rad}`

Errori e controllo: m è lunghezza, s tempo, Hz frequenza e m/s velocità. La fase non è una distanza né il tempo necessario a coprirla: qui il confronto è simultaneo.

## 03 — La fase lungo una fotografia dell’onda

Per una forma y=a cos(ks−ωt+φ₀), a è l’ampiezza e k=2π/λ il numero d’onda. Allo stesso t il termine temporale e φ₀ si cancellano: |Δφ|=kΔs. Dividendo per 2π rimane ν=Δs/λ. Non stiamo contando una variazione nel tempo in un singolo punto.

Passaggi: `k=\frac{2\pi}{\lambda}\qquad |\Delta\varphi|=k\Delta s\qquad \nu=\frac{|\Delta\varphi|}{2\pi}\qquad \nu=\frac{\Delta s}{\lambda}`

Errori e controllo: 2πΔs/λ è la misura in radianti, non quella in giri. Il reciproco inverte la scala; il prodotto ha unità m² e la differenza unità m, entrambe incompatibili con ν.

## 04 — Superare un giro senza ridurlo

La misura accumulata cresce linearmente con la separazione. Sei metri diviso quattro danno tre mezzi giri: un giro intero e un mezzo. Ridurre modulo un giro lascerebbe un mezzo, ma cancellerebbe il giro intero che la domanda chiede di conservare.

Passaggi: `\nu_A=\frac14\qquad \nu_B=\frac64=\frac32\qquad |\Delta\varphi_B|=3\pi`

Errori e controllo: Un mezzo è la sola fase equivalente dopo la riduzione modulo un giro. 1/24 rende inversa la dipendenza dalla distanza, sei copia il numero di metri e il valore invariato ignora il tratto aggiunto.

## 05 — Risalire alla distanza dalla fase non ridotta

Ogni giro corrisponde a quattro metri. Moltiplicare un quarto di giro per quella lunghezza dà un metro. L’inversa è unica perché il dato ν conserva tutti i giri; una sola fase ridotta modulo 2π lascerebbe invece possibili multipli di λ.

Passaggi: `\Delta s=\nu\lambda\qquad \Delta s=\frac14\cdot4\,\mathrm m\qquad \Delta s=1\,\mathrm m`

Errori e controllo: Sedici divide λ per ν invece di moltiplicare. Non si aggiunge un multiplo di quattro metri quando ν è già la misura non ridotta assegnata.

## 06 — Ricostruire la lunghezza d’onda

Un metro produce un quarto di giro, quindi un giro completo richiede quattro metri. Algebricamente λ=Δs/ν e dividere per un quarto equivale a moltiplicare per quattro. Il risultato è positivo e non richiede alcuna frequenza.

Passaggi: `\lambda=\frac{\Delta s}{\nu}\qquad \lambda=\frac1{1/4}\,\mathrm m\qquad \lambda=4\,\mathrm m`

Errori e controllo: Un quarto di metro nasce da una moltiplicazione nel verso sbagliato. La lunghezza d’onda è una distanza fra punti in fase successivi, non l’ampiezza trasversale della sinusoide.

## 07 — Lunghezza d’onda più breve

A accumula un quarto di giro e B un giro completo. Il rapporto è uno diviso un quarto, quattro. A distanza uguale, una lunghezza d’onda quattro volte più piccola contiene quattro volte più fase spaziale.

Passaggi: `\nu_A=\frac14\qquad \nu_B=1\qquad \nu_B/\nu_A=4`

Errori e controllo: Un quarto segue λ nel verso opposto; uno ignora la nuova lunghezza d’onda. Due usa una radice e sedici quadra una dipendenza che è solo inversa di prima potenza.

## 08 — Lo scarto tra due misure in giri

La fase corretta è un quarto di giro. Un mezzo meno un quarto lascia un quarto, positivo. Qui lo scarto non viene ridotto modulo un giro e non va convertito in radianti se l’unità richiesta è il giro.

Passaggi: `\nu=\frac14\qquad e=\frac12-\frac14\qquad e=\frac14\,\text{giri}`

Errori e controllo: Meno un quarto scambia l’ordine; un mezzo copia la proposta, zero la accetta e tre quarti somma anziché sottrarre.

## 09 — La formula inversa della separazione

Moltiplichiamo ν=Δs/λ per λ>0. La misura ν è già espressa in giri; non occorre un altro fattore 2π. Il prodotto numero puro per lunghezza ha dimensione di distanza.

Passaggi: `\nu\lambda=\Delta s\qquad \Delta s=\nu\lambda\qquad [\Delta s]=L`

Errori e controllo: λ/ν inverte il passaggio. ν/λ ha dimensione di lunghezza inversa e νλ² di area. 2πνλ conterebbe la conversione angolare una seconda volta.

## 10 — Variazioni di distanza e lunghezza d’onda

La separazione moltiplica la fase e la lunghezza d’onda la divide. Sostituendo i dati B nel rapporto e cancellando gli ingressi A rimane κ₁/κ₂. Non si deve estrarre la sola parte frazionaria prima del confronto.

Passaggi: `\frac{\nu_B}{\nu_A}=\frac{\kappa_1\Delta s_A}{\kappa_2\lambda_A}\frac{\lambda_A}{\Delta s_A}\qquad \nu_B/\nu_A=\frac{\kappa_1}{\kappa_2}`

Errori e controllo: Il prodotto rende diretta la dipendenza da λ; il rapporto inverso scambia gli stati. Il quadrato non appartiene alla fase spaziale e la somma darebbe due per prove identiche.

## 11 — Due lunghezze cambiate insieme

Le due misure sono un quarto e un mezzo di giro. Un mezzo diviso un quarto è due. La separazione triplica, ma la lunghezza d’onda cresce di tre mezzi: il loro quoziente dà il fattore due.

Passaggi: `\nu_A=\frac14\qquad \nu_B=\frac36=\frac12\qquad \nu_B/\nu_A=2`

Errori e controllo: Tre segue solo Δs e tre mezzi solo λ; un mezzo è il valore finale, ma anche il reciproco del rapporto richiesto. Sei copia il numero di metri della lunghezza d’onda B, non il rapporto fra fasi.

## 12 — Media di due differenze di fase

La semisomma di un quarto e un mezzo è tre ottavi di giro. Il risultato è ancora una misura reale di fase. Usare invece la separazione media due metri e λ media cinque metri darebbe due quinti di giro, maggiore di un quarantesimo rispetto alla media richiesta.

Passaggi: `\overline\nu=\frac{1/4+1/2}{2}\qquad \overline\nu=\frac38\,\text{giri}`

Errori e controllo: Tre quarti è la somma, tre sedicesimi dimezza ancora e un quarto copia A. Due quinti appartiene agli ingressi medi, non alla media delle due misure.

## 13 — La lunghezza d’onda per raddoppiare ν

Il bersaglio è un mezzo di giro. Con separazione tre metri, λ_B=3/(1/2)=6 m. Il rapporto rispetto a quattro metri vale tre mezzi. Equivalentemente la separazione dà un fattore tre che deve essere diviso per un fattore tre mezzi.

Passaggi: `\nu_B=\frac12\qquad \lambda_B=6\,\mathrm m\qquad \lambda_B/\lambda_A=\frac64=\frac32`

Errori e controllo: Due terzi capovolge il rapporto. Due copia il bersaglio, tre segue solo la separazione e un mezzo ignora il cambiamento di Δs.

## 14 — Calibrare un display di fase

Il riferimento ha ν=1/4 e fissa q=3. La nuova lettura corrisponde a ν_B=1/2 giro. Moltiplicando per la lunghezza d’onda sei metri si ricava una separazione di tre metri. Il display non conta necessariamente giri interi.

Passaggi: `q=3\qquad \nu_B=\frac12\qquad \Delta s_B=\nu_B\lambda_B\qquad \Delta s_B=3\,\mathrm m`

Errori e controllo: Usare la lettura 3/2 direttamente come ν darebbe nove metri. La taratura va tolta prima della ricostruzione spaziale.

## 15 — Un offset nel display spaziale

Le fasi di riferimento sono un quarto e un mezzo. La differenza un mezzo delle letture divisa per un quarto dà q=2; poi z=1. La lettura C tre equivale a ν_C=1 giro. Con λ_C=2 m la separazione vale due metri, non zero anche se la fase equivalente modulo un giro sarebbe nulla.

Passaggi: `q=2\qquad z=1\qquad \nu_C=1\qquad \Delta s_C=\nu_C\lambda_C\qquad \Delta s_C=2\,\mathrm m`

Errori e controllo: Con λ=2 m le separazioni 1,3,4,6 m darebbero letture 2,4,5,7. Solo due metri restituisce tre. Ridurre ν_C modulo un giro perderebbe l’informazione necessaria all’inversa.

## 16 — Un vincolo che lascia libera la scala spaziale

Sostituendo Δs=λ/4, la lunghezza d’onda positiva si cancella e si ottiene ν=1/4 per ogni λ>0. La lettura ripete il rapporto fissato senza determinare una lunghezza assoluta. Per esempio λ=4 m,Δs=1 m e λ=8 m,Δs=2 m sono due membri della stessa famiglia continua.

Passaggi: `\nu=\frac{\lambda/4}{\lambda}\qquad \nu=\frac14\qquad \lambda>0\qquad \Delta s=\lambda/4`

Errori e controllo: Una o due coppie si fermano a pochi esempi. Nessuna è smentita dai dati costruiti; la coppia nulla viola λ>0 e renderebbe il rapporto indefinito. Serve un’altra misura di lunghezza per fissare la scala.
