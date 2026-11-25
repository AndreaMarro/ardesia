# wave-phase-time-137 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-01.json. Letti individualmente tutti gli 80 originali assegnati 135–139 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L04 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I casi di smorzamento, fase accumulata e potenza normalizzata sono mantenuti distinti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Sei giri di fase nello stesso punto

Due hertz significano due cicli per secondo. In tre secondi la fase accumula sei giri, perché N=fΔt. Il sensore misura una ripetizione locale; da questo prodotto non si ricava la distanza percorsa dall’onda senza conoscere anche la velocità di propagazione.

Passaggi: `N=f\Delta t\qquad N=(2\,\mathrm{s^{-1}})(3\,\mathrm s)\qquad N=6\qquad |\Delta\varphi|=12\pi`

Errori e controllo: Tre copia il tempo, due terzi divide invece di moltiplicare e dodici introduce un fattore due aggiuntivo. Un sesto è il reciproco della misura, non il numero di giri.

## 02 — Una misura reale di fase

Un hertz è un inverso di secondo: nel prodotto con secondi le dimensioni si cancellano. Si usa la parola giri per indicare che la fase è stata divisa per 2π. Il risultato può essere frazionario senza contraddire questa definizione.

Passaggi: `[N]=T^{-1}T=1\qquad 1\,\text{giro}=2\pi\,\mathrm{rad}`

Errori e controllo: Hz misura la frequenza e s la durata; m e m/s richiederebbero un’informazione spaziale. Adimensionale non significa necessariamente intero.

## 03 — Il periodo e la frequenza di una ripetizione

Un periodo è il tempo di un ciclo completo. La frequenza conta quanti di questi intervalli entrano in un secondo: f=1/T. Dividere uno per due quinti equivale a moltiplicare per cinque mezzi. La configurazione e il verso identici escludono che il dato sia soltanto mezzo periodo.

Passaggi: `f=\frac1T\qquad f=\frac1{2/5\,\mathrm s}\qquad f=\frac52\,\mathrm{Hz}`

Errori e controllo: Due quinti copia il numero del periodo; cinque lo dimezza prima dell’inversa e due ne conserva soltanto il numeratore. Cinque quarti userebbe un periodo doppio senza che il testo lo richieda.

## 04 — Meno giri alla frequenza dimezzata

La durata è la stessa, ma in ciascun secondo si accumula metà fase. Il prodotto passa da sei a tre giri. Il periodo raddoppia: questa osservazione è coerente con il minor numero di giri in uno stesso intervallo.

Passaggi: `N_A=6\qquad N_B=(1\,\mathrm{Hz})(3\,\mathrm s)\qquad N_B=3`

Errori e controllo: Dodici inverte la dipendenza da f; tre mezzi dimezza due volte. Sei ignora la nuova frequenza e zero contraddice frequenza e durata positive.

## 05 — La frequenza dalla fase accumulata

La fase totale divisa per la durata dà la frequenza costante. Sei giri in tre secondi corrispondono a due per secondo. La misura non ridotta è essenziale: se si conservasse solo la fase equivalente dopo sei giri, si perderebbe l’informazione sul numero di ripetizioni.

Passaggi: `f=\frac N{\Delta t}\qquad f=\frac63\,\mathrm{s^{-1}}\qquad f=2\,\mathrm{Hz}`

Errori e controllo: Diciotto moltiplica invece di dividere. Zero sarebbe la fase residua modulo un giro, non la frequenza dell’onda che ha accumulato sei giri.

## 06 — La durata dalla fase e dalla frequenza

Ogni giro richiede un mezzo secondo. Sei giri richiedono sei mezzi secondi, cioè tre. L’inversa Δt=N/f è lecita perché f è positiva e restituisce una durata, non un periodo per una sola oscillazione.

Passaggi: `\Delta t=\frac Nf\qquad \Delta t=\frac62\,\mathrm s\qquad \Delta t=3\,\mathrm s`

Errori e controllo: Un mezzo secondo è il solo periodo, non la durata di sei cicli. Dodici moltiplica il numero dei giri per la frequenza anziché dividerlo.

## 07 — Un intervallo più breve

La frequenza comune si cancella. I giri passano da sei a due e il rapporto due su sei si riduce a un terzo, uguale al rapporto fra le durate. Non si aggiunge un’altra divisione per il periodo, già contenuto in f.

Passaggi: `N_A=6\qquad N_B=2\qquad N_B/N_A=\frac26=\frac13`

Errori e controllo: Tre inverte gli intervalli, due copia il valore finale di N e uno ignora la durata. Un nono quadra una dipendenza temporale lineare.

## 08 — Uno scarto di fase accumulata

Il prodotto fΔt dà sei giri. Dodici meno sei lascia sei, positivo. L’errore rimane una misura di fase in giri e non viene ridotto modulo uno: farlo renderebbe invisibile la sovrastima.

Passaggi: `N=6\qquad e=12-6\qquad e=6\,\text{giri}`

Errori e controllo: Meno sei inverte l’ordine, dodici copia la proposta, tre dimezza lo scarto e zero lo cancellerebbe senza confrontare i valori non ridotti.

## 09 — L’inversa simbolica della frequenza

N=fΔt si risolve dividendo per la durata positiva. Il rapporto ha unità inversa di tempo, cioè hertz. 2πN/Δt sarebbe la pulsazione ω in rad/s, non la frequenza richiesta in cicli al secondo.

Passaggi: `f=\frac N{\Delta t}\qquad [f]=T^{-1}\qquad \omega=2\pi f`

Errori e controllo: Moltiplicare per Δt o usare Δt/N produce un tempo; dividere per Δt² un inverso di tempo al quadrato. La conversione con 2π cambia grandezza angolare, non migliora l’inversa di f.

## 10 — Frequenza e durata cambiano insieme

Nel prodotto fΔt entrano una volta sia la frequenza sia la durata. Nel confronto i valori iniziali si cancellano e rimane κ₁κ₂. I fattori non devono trasformare N in un intero: N è una misura continua di fase.

Passaggi: `N_B=\kappa_1f_A\kappa_2\Delta t_A\qquad N_B/N_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti rendono inversa una dipendenza diretta, il quadrato della durata non compare e la somma darebbe due per prove identiche, invece di uno.

## 11 — Più frequenza e meno tempo

A accumula sei giri e B otto. Otto su sei si riduce a quattro terzi: il raddoppio della frequenza prevale sulla durata ridotta a due terzi. Non si richiede il rapporto fra due periodi.

Passaggi: `N_A=6\qquad N_B=8\qquad N_B/N_A=\frac86=\frac43`

Errori e controllo: Tre quarti è il reciproco, due segue solo f e due terzi solo Δt. Otto è la misura finale di fase in giri, non il suo rapporto con quella iniziale.

## 12 — Media di due avanzamenti di fase

Le misure sono sei e otto giri. La semisomma vale sette giri. Usare prima la frequenza media tre Hz e la durata media cinque mezzi s darebbe quindici mezzi giri, maggiore di un mezzo: il prodotto non commuta in generale con la media.

Passaggi: `\overline N=\frac{6+8}{2}\qquad \overline N=7\,\text{giri}`

Errori e controllo: Quattordici è la somma, sette mezzi dimezza ancora e due è la differenza. Quindici mezzi descrive un’altra osservazione con ingressi medi.

## 13 — La durata per il bersaglio di fase

Il bersaglio è otto giri. A quattro Hz richiede due secondi. Il rapporto due su tre vale due terzi: basta dividere il fattore richiesto quattro terzi per il raddoppio della frequenza.

Passaggi: `N_B=8\qquad \Delta t_B=2\,\mathrm s\qquad \Delta t_B/\Delta t_A=\frac23`

Errori e controllo: Tre mezzi capovolge la durata; quattro terzi ignora la frequenza cambiata e due copia la durata B in s. Un terzo produrrebbe soltanto quattro giri.

## 14 — Un display di fase senza offset

Il riferimento ha N=6 e fissa q=3. La lettura ventiquattro significa otto giri. Dividendoli per la durata due secondi si ottiene quattro Hz. Il display e la misura di fase sono entrambi continui, senza obbligo di integralità generale.

Passaggi: `q=3\qquad N_B=8\qquad f_B=\frac{N_B}{\Delta t_B}\qquad f_B=4\,\mathrm{Hz}`

Errori e controllo: Usare ventiquattro direttamente come N darebbe dodici Hz. La taratura non sostituisce la divisione per la durata nota.

## 15 — Un offset prima della frequenza

Le fasi note sono sei e otto giri. La differenza quattro delle letture divisa per due giri dà q=2; segue z=1. C equivale a dodici giri. Su quattro secondi questo significa tre Hz.

Passaggi: `q=2\qquad z=1\qquad N_C=12\qquad f_C=\frac{12}{4}\,\mathrm{Hz}\qquad f_C=3\,\mathrm{Hz}`

Errori e controllo: Con Δt=4 s le frequenze 2,4,6 Hz produrrebbero letture 17,33,49. 25/4 Hz nasce invece dall’uso della lettura grezza al posto di N e non riproduce il display.

## 16 — Un vincolo tra frequenza e durata

Il coefficiente c trasforma un tempo in una frequenza. Sostituire f=cΔt dà N=c(Δt)². Sei diviso due terzi s⁻² vale nove s²; la radice positiva è tre s e il vincolo restituisce f=2 Hz. È un legame fra prove, non una frequenza che cresce durante l’intervallo.

Passaggi: `N=c(\Delta t)^2\qquad (\Delta t)^2=9\,\mathrm{s^2}\qquad \Delta t=3\,\mathrm s\qquad f=2\,\mathrm{Hz}`

Errori e controllo: Nove è il quadrato del tempo. Il ramo negativo non è una durata e darebbe anche frequenza negativa. Poiché f è costante in ciascuna prova, non si integra una frequenza variabile e non compare un mezzo aggiuntivo.
