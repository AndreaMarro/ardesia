# coherent-destructive-145 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-02.json. Letti individualmente tutti gli 48 originali assegnati 145–147 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L05 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I due casi Doppler sono mantenuti distinti dalla differenza fra frequenze dei battimenti. Le disuguaglianze dei rami e il limite del coseno sono espliciti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — La cancellazione lascia un’ampiezza

I contributi sono opposti nello stesso istante: quando il primo vale quattro millimetri, il secondo vale meno un millimetro. La loro somma è tre millimetri. Quando il primo cambia segno, cambia anche il secondo; l’ampiezza del risultante resta tre millimetri, benché lo spostamento possa essere positivo, negativo o nullo.

Passaggi: `y=(A_1-A_2)\cos\theta\qquad A_{\rm res}=4\,\mathrm{mm}-1\,\mathrm{mm}\qquad A_{\rm res}=3\,\mathrm{mm}`

Errori e controllo: Cinque somma le ampiezze come se le onde fossero in fase; zero richiederebbe ampiezze uguali. Il rapporto quattro non è una lunghezza e non rappresenta la somma degli spostamenti.

## 02 — L’unità di un’ampiezza residua

La differenza di due ampiezze è ancora una lunghezza. Il prefisso milli cambia la scala, non la dimensione: tre mm equivalgono a tre millesimi di metro. Non stiamo chiedendo un’intensità, che dipenderebbe dal quadrato dell’ampiezza.

Passaggi: `[A_{\rm res}]=L\qquad 1\,\mathrm{mm}=10^{-3}\,\mathrm m`

Errori e controllo: mm² è area, Hz frequenza, s tempo e mm/s velocità. Il modulo o la cancellazione non trasformano una lunghezza nel suo quadrato.

## 03 — Il ramo positivo della differenza

Il secondo coseno è in ritardo di π, quindi è l’opposto del primo. Raccogliendo cosθ si ottiene il coefficiente A₁−A₂. In generale l’ampiezza sarebbe il modulo della differenza; l’ordine A₁>A₂ permette qui di toglierlo senza introdurre un valore negativo.

Passaggi: `\cos(\theta+\pi)=-\cos\theta\qquad y=(A_1-A_2)\cos\theta\qquad A_{\rm res}=|A_1-A_2|\qquad A_{\rm res}=A_1-A_2`

Errori e controllo: La somma vale per fase uguale, il prodotto ha unità di area e la somma in quadratura corrisponde a uno sfasamento diverso. A₂−A₁ è negativo nel dominio assegnato e non è l’ampiezza positiva.

## 04 — Ridurre il contributo maggiore

La seconda ampiezza resta da sottrarre. Prima rimangono tre millimetri, dopo due meno uno lascia un millimetro. L’ampiezza maggiore si dimezza, ma la differenza non si dimezza perché il contributo sottratto è fissato. In entrambe le prove A₁>A₂.

Passaggi: `A_{{\rm res},A}=3\,\mathrm{mm}\qquad A_{{\rm res},B}=1\,\mathrm{mm}`

Errori e controllo: Tre mezzi scala anche il residuo come se tutti gli ingressi fossero dimezzati; cinque somma, zero impone erroneamente ampiezze uguali e tre ignora il cambiamento.

## 05 — Trovare l’ampiezza maggiore

Per ricostruire il contributo maggiore dobbiamo rimettere ciò che la cancellazione ha sottratto: A₁=A_res+A₂. Tre più uno dà quattro millimetri, che è maggiore di A₂ e ricostruisce il residuo misurato.

Passaggi: `A_1=A_{\rm res}+A_2\qquad A_1=4\,\mathrm{mm}`

Errori e controllo: Due sottrae di nuovo A₂, anziché annullare la sottrazione originaria. Il residuo tre non è già l’ampiezza maggiore. Non serve elevare al quadrato alcuna lunghezza.

## 06 — Trovare il contributo sottratto

Dal contributo maggiore togliamo ciò che è rimasto: A₂=A₁−A_res. Quattro meno tre dà un millimetro. È positivo e minore di quattro: entrambe le disuguaglianze del modello sono rispettate.

Passaggi: `A_2=A_1-A_{\rm res}\qquad A_2=1\,\mathrm{mm}\qquad 0<A_2<A_1`

Errori e controllo: Sette somma quantità che nell’inversa vanno sottratte. Un residuo maggiore di A₁ darebbe A₂ negativa e non sarebbe ammissibile in questo ramo; i dati presenti non hanno tale problema.

## 07 — Aumentare l’ampiezza opposta

I residui sono tre e due millimetri. Il loro rapporto B su A è due terzi. Aumentare l’onda opposta riduce il residuo finché resta A₂<A₁; non si può prolungare senza controllo questo ramo oltre l’uguaglianza.

Passaggi: `A_{{\rm res},A}=3\,\mathrm{mm}\qquad A_{{\rm res},B}=2\,\mathrm{mm}\qquad \frac{A_{{\rm res},B}}{A_{{\rm res},A}}=\frac23`

Errori e controllo: Tre mezzi capovolge le prove, due copia il fattore di A₂, un mezzo è il suo reciproco e uno ignora la maggiore cancellazione. Il rapporto dei residui non è quello delle singole ampiezze.

## 08 — Uno scarto fra ampiezze positive

L’ampiezza corretta è tre millimetri. La proposta sei la supera di tre: lo scarto richiesto è positivo, pur essendo calcolato fra due moduli. La cancellazione di contributi opposti non può produrre un’ampiezza sei, maggiore persino della somma cinque.

Passaggi: `A_{\rm res}=3\,\mathrm{mm}\qquad e=(6-3)\,\mathrm{mm}\qquad e=3\,\mathrm{mm}`

Errori e controllo: Meno tre scambia l’ordine, sei mantiene la proposta, nove somma e zero la accetta. Il limite geometrico della somma delle ampiezze offre anche un controllo preliminare della proposta.

## 09 — L’inversa per A₁

Partiamo da A_res=A₁−A₂ e aggiungiamo A₂ ai due membri. Si ottiene A₁=A_res+A₂. Con entrambe positive l’inversa assicura automaticamente A₁>A₂: è coerente con lo stesso ramo, non soltanto con le unità.

Passaggi: `A_{\rm res}+A_2=A_1\qquad A_1=A_{\rm res}+A_2`

Errori e controllo: Sottrarre ancora non inverte la cancellazione. Il prodotto ha unità di area e il quoziente è puro, mentre A₁ è una lunghezza. A₂−A_res può anche diventare negativo.

## 10 — Fattori diversi sui due contributi

Si applicano i fattori prima di sottrarre. Il nuovo residuo è κ₁A₁−κ₂A₂; per confrontarlo con l’originale dividiamo per A₁−A₂. I due numeratori non si possono separare in un solo fattore indipendente dalle ampiezze, salvo casi particolari come κ₁=κ₂.

Passaggi: `A_{{\rm res},B}=\kappa_1A_1-\kappa_2A_2\qquad \frac{A_{{\rm res},B}}{A_{{\rm res},A}}=\frac{\kappa_1A_1-\kappa_2A_2}{A_1-A_2}`

Errori e controllo: κ₁−κ₂ darebbe zero anche per prove identiche; prodotto e quoziente ignorano che la legge è una differenza. L’ultima espressione confronta somme in fase. La disuguaglianza aggiunta protegge il ramo positivo anche in B.

## 11 — Due ampiezze cambiano insieme

La prima prova lascia tre millimetri; la seconda sei meno quattro, due millimetri. Il rapporto è due terzi. Il contributo maggiore cresce, ma quello opposto cresce abbastanza da ridurre il residuo.

Passaggi: `A_{{\rm res},A}=3\,\mathrm{mm}\qquad A_{{\rm res},B}=2\,\mathrm{mm}\qquad A_{{\rm res},B}/A_{{\rm res},A}=\frac23`

Errori e controllo: Tre mezzi capovolge gli stati. Seguire soltanto sei su quattro o quattro su uno tralascia l’altro contributo. Entrambe le prove conservano la prima ampiezza maggiore della seconda.

## 12 — La media e il ramo lineare

Le ampiezze residue sono tre e due millimetri: la loro semisomma è cinque mezzi millimetri. Qui gli ingressi medi cinque e cinque mezzi millimetri danno lo stesso residuo cinque mezzi, perché entrambe le prove e la loro media restano nel ramo lineare A₁>A₂. Non è una proprietà di ogni operazione con un modulo.

Passaggi: `\overline A_{\rm res}=\frac{3+2}{2}\,\mathrm{mm}\qquad \overline A_{\rm res}=\frac52\,\mathrm{mm}`

Errori e controllo: Cinque è la somma, un mezzo la semidifferenza, tre e due conservano una sola prova. Se si confrontassero prove su lati opposti di A₁=A₂, il modulo potrebbe impedire la stessa commutazione con la media.

## 13 — Un target con più cancellazione

Il target è due terzi di tre, cioè due millimetri. Per lasciare due partendo da sei occorre un’ampiezza opposta quattro millimetri. Rispetto all’un millimetro iniziale il fattore richiesto è quattro, e quattro resta minore di sei.

Passaggi: `A_{{\rm res},B}=2\,\mathrm{mm}\qquad A_{2,B}=6\,\mathrm{mm}-2\,\mathrm{mm}\qquad A_{2,B}/A_{2,A}=4`

Errori e controllo: Due terzi copia il target, tre mezzi segue solo A₁ e un quarto inverte il rapporto richiesto. Occorre controllare la nuova differenza, non assegnare a ogni ingresso il fattore dell’uscita.

## 14 — Tarare il residuo per trovare A₁

Il riferimento ha residuo tre millimetri, quindi q=3 mm⁻¹. La lettura sei corrisponde a un residuo due millimetri. Per ricostruire l’ampiezza maggiore aggiungiamo i quattro millimetri del contributo opposto e otteniamo sei millimetri.

Passaggi: `q=3\,\mathrm{mm^{-1}}\qquad A_{{\rm res},B}=2\,\mathrm{mm}\qquad A_{1,B}=2\,\mathrm{mm}+4\,\mathrm{mm}\qquad A_{1,B}=6\,\mathrm{mm}`

Errori e controllo: Sei è anche casualmente il numero della lettura, ma questo non autorizza a saltare la taratura: usarla come residuo darebbe A₁=10 mm. Il residuo due non è l’ampiezza maggiore.

## 15 — Un offset prima dell’addizione

Le differenze tre e due millimetri fissano q=(7−5)/(3−2)=2 mm⁻¹ e b=1. La lettura undici dà residuo (11−1)/2=5 mm. Sommando il contributo opposto di tre millimetri ricaviamo A₁,C=8 mm, maggiore di tre.

Passaggi: `q=2\,\mathrm{mm^{-1}}\qquad b=1\qquad A_{{\rm res},C}=5\,\mathrm{mm}\qquad A_{1,C}=8\,\mathrm{mm}`

Errori e controllo: Cinque copia il residuo, undici il display. Con A₂=3 mm, ampiezze sei e quattro darebbero letture sette e tre, non undici. Solo otto ricostruisce entrambi i passaggi.

## 16 — Un vincolo che fissa entrambe le ampiezze

Sostituendo il vincolo otteniamo A_res=4A₂−A₂=3A₂. Un residuo tre millimetri dà quindi A₂=1 mm e A₁=4 mm. Qui la misura aggiunge una scala e seleziona una coppia, invece di ripetere soltanto il vincolo.

Passaggi: `A_{\rm res}=3A_2\qquad A_2=\frac{A_{\rm res}}3\qquad A_2=1\,\mathrm{mm}\qquad A_1=4\,\mathrm{mm}`

Errori e controllo: Tre copia il residuo e quattro l’ampiezza maggiore risultante. Non si prende una radice: dopo la sostituzione resta un’equazione lineare. La coppia nulla viola la misura e le ampiezze positive.
