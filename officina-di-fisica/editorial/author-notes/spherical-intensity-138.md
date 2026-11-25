# spherical-intensity-138 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-01.json. Letti individualmente tutti gli 80 originali assegnati 135–139 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L04 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I casi di smorzamento, fase accumulata e potenza normalizzata sono mantenuti distinti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — La stessa potenza distribuita su una sfera

La conservazione della potenza dà I=P/(4πr²). Sostituendo P=4πp si cancella esattamente 4π e rimane p/r². Quattro watt divisi per quattro metri quadrati danno un W/m². La potenza reale della sorgente è 16π W, non quattro W.

Passaggi: `I=\frac{P}{4\pi r^2}\qquad P=4\pi p\qquad I=\frac p{r^2}\qquad I=1\,\mathrm{W/m^2}`

Errori e controllo: Due divide per r invece di r². Quattro copia p; 1/4 omette il fattore p e usa soltanto 1/r². La superficie usata è quella della sfera, non il disco πr² della sua sezione disegnata.

## 02 — L’unità dell’intensità di propagazione

Una potenza in watt divisa per un’area in metri quadrati dà W/m². Nel modello sferico p è ancora una potenza e r² è un’area. La pressione acustica è un’altra grandezza: il simbolo p scelto per P/(4π) non ne assume le dimensioni.

Passaggi: `[I]=\frac{[P]}{L^2}\qquad [I]=\mathrm{W/m^2}\qquad [p]=\mathrm W`

Errori e controllo: W misura la potenza totale, J l’energia, Pa la pressione e W/m una potenza per lunghezza. Le unità aiutano a non interpretare p come pressione.

## 03 — Perché il suono non attraversa il vuoto

Un’onda sonora è una perturbazione meccanica sostenuta dall’elasticità e dall’inerzia del mezzo. Togliere l’aria elimina quel mezzo lungo il percorso studiato, anche se la sorgente vibra ancora. Non si sta applicando la legge sferica a un mezzo che non esiste più. Eventuali vibrazioni trasmesse dai sostegni appartengono al percorso escluso.

Passaggi: `\text{suono: mezzo materiale}\qquad \text{vuoto: niente suono}`

Errori e controllo: L’assenza di trasmissione non implica frequenza nulla del vibratore né conversione spontanea in luce. Il vuoto non è un fluido viscoso assorbente. Ridurre le perdite di un mezzo e rimuovere il mezzo sono situazioni fisiche diverse.

## 04 — Più potenza allo stesso raggio

La superficie sferica è identica nelle due prove. La potenza normalizzata quadruplica e anche P quadruplica, perché 4π è fisso. L’intensità passa da uno a quattro W/m². Non si deve elevare al quadrato un cambiamento di potenza.

Passaggi: `I_A=1\,\mathrm{W/m^2}\qquad I_B=\frac{16}{2^2}\,\mathrm{W/m^2}\qquad I_B=4\,\mathrm{W/m^2}`

Errori e controllo: Un quarto usa il fattore inverso, sedici quadra l’aumento e uno ignora la nuova potenza. Zero contraddice p>0 a distanza finita.

## 05 — Ricavare la potenza normalizzata

Moltiplichiamo l’intensità per il quadrato del raggio: p=Ir². Un W/m² per quattro m² dà quattro W. Per ottenere la potenza completa P occorrerebbe ancora moltiplicare per 4π; la domanda richiede p.

Passaggi: `p=Ir^2\qquad p=4\,\mathrm W\qquad P=4\pi p\qquad P=16\pi\,\mathrm W`

Errori e controllo: Sedici π W è la potenza totale P, diversa dal parametro p richiesto. Due usa un solo raggio; dividere per r² inverte l’isolamento e restituisce dimensioni diverse da W.

## 06 — Il raggio dalla radice di un’area

Dal modello r²=p/I. Watt divisi per W/m² danno metri quadrati: il rapporto numerico è quattro m². La distanza dal centro è la radice positiva, due metri. Non è una coordinata con due rami di segno opposto.

Passaggi: `r^2=\frac pI\qquad r^2=4\,\mathrm{m^2}\qquad r=2\,\mathrm m`

Errori e controllo: Quattro è il numero dell’area r², non della distanza. Il segno negativo è escluso da r>0; r non è il diametro di una sfera materiale.

## 07 — Avvicinarsi dimezzando la distanza

La stessa potenza attraversa una sfera con un quarto dell’area quando il raggio si dimezza. L’intensità quadruplica: da uno a quattro W/m². Questa legge dipende dalla diffusione sferica, non vale per ogni fascio collimato.

Passaggi: `\frac{I_B}{I_A}=\left(\frac{r_A}{r_B}\right)^2\qquad I_B/I_A=\left(\frac21\right)^2=4`

Errori e controllo: Due segue soltanto l’inverso del raggio senza quadrato; un mezzo e un quarto seguono la distanza nel verso sbagliato. Uno ignora la diversa superficie attraversata.

## 08 — Lo scarto di un’intensità troppo grande

Il valore corretto è quattro diviso quattro, un W/m². La proposta due eccede il risultato di un W/m². Il segno positivo è quello di una sovrastima e non indica il verso radiale dell’onda.

Passaggi: `I=1\,\mathrm{W/m^2}\qquad e=(2-1)\,\mathrm{W/m^2}\qquad e=1\,\mathrm{W/m^2}`

Errori e controllo: Meno uno cambia l’ordine, due copia la proposta, zero la accetta e un mezzo dimezza ancora lo scarto.

## 09 — La formula inversa di p

Moltiplichiamo I=p/r² per r². L’intensità per un’area restituisce W e dà p=Ir². La potenza totale P sarebbe invece 4πIr², perché la vera area sferica contiene il fattore 4π già rimosso nella definizione di p.

Passaggi: `p=Ir^2\qquad [p]=\mathrm{W/m^2}\,\mathrm{m^2}\qquad [p]=\mathrm W\qquad P=4\pi Ir^2`

Errori e controllo: I/r² ha unità W/m⁴, r²/I ha unità m⁴/W e Ir ha unità W/m. 4πIr² ha la dimensione giusta ma è P, non p.

## 10 — Due fattori nella legge sferica

La potenza normalizzata dà il fattore diretto κ₁. La superficie sferica introduce il quadrato del fattore di raggio al denominatore. Il rapporto è κ₁/κ₂²; le unità si cancellano fra le due intensità.

Passaggi: `\frac{I_B}{I_A}=\frac{\kappa_1p_A}{(\kappa_2r_A)^2}\frac{r_A^2}{p_A}\qquad I_B/I_A=\frac{\kappa_1}{\kappa_2^2}`

Errori e controllo: Il prodotto fa aumentare I con la distanza, una sola potenza di κ₂ dimentica l’area e il rapporto inverso scambia le prove. Il quadrato di κ₁ non appartiene alla dipendenza dalla potenza.

## 11 — Potenza doppia a distanza doppia

La potenza raddoppia ma la superficie quadruplica. In B otto W divisi per sedici m² danno un mezzo W/m², metà del valore A. Il vantaggio della potenza maggiore non compensa l’espansione sferica.

Passaggi: `I_A=1\,\mathrm{W/m^2}\qquad I_B=\frac12\,\mathrm{W/m^2}\qquad I_B/I_A=\frac12`

Errori e controllo: Due segue solo p, un quarto solo r² e quattro inverte il rapporto delle superfici. Otto moltiplica i due fattori come se la distanza aumentasse l’intensità.

## 12 — Media delle intensità di due prove

Le intensità sono uno e un mezzo W/m². La loro semisomma è tre quarti W/m². La potenza normalizzata media sei W e la distanza media tre m darebbero due terzi W/m², inferiore di un dodicesimo alla media richiesta.

Passaggi: `\overline I=\frac{1+1/2}{2}\,\mathrm{W/m^2}\qquad \overline I=\frac34\,\mathrm{W/m^2}`

Errori e controllo: Tre mezzi è la somma, tre ottavi dimezza ancora e un mezzo copia B. Due terzi è la risposta del modello agli ingressi medi: l’inverso del quadrato non commuta con la media.

## 13 — Il raggio per dimezzare I con più potenza

Per avere metà intensità nonostante potenza doppia, l’area sferica deve quadruplicare. Il rapporto dei raggi è la radice positiva di quattro, due. Si ottiene r_B=4 m, ancora nel regime assegnato.

Passaggi: `\frac12=\frac2{(r_B/r_A)^2}\qquad (r_B/r_A)^2=4\qquad r_B/r_A=2`

Errori e controllo: Quattro è il rapporto delle aree, un mezzo inverte i raggi e √2 compenserebbe solo il raddoppio di potenza mantenendo I uguale. Un quarto darebbe un’intensità molto maggiore del bersaglio.

## 14 — Calibrare I per trovare p

Il riferimento ha I=1 W/m² e fissa q=3 m²/W. La nuova lettura equivale a un mezzo W/m². Moltiplicandola per r_B²=16 m² si ricava p_B=8 W. Per P_B occorrerebbe ancora il fattore 4π.

Passaggi: `q=3\,\mathrm{m^2/W}\qquad I_B=\frac12\,\mathrm{W/m^2}\qquad p_B=I_Br_B^2\qquad p_B=8\,\mathrm W`

Errori e controllo: Usare S=3/2 come W/m² darebbe p=24 W. La lettura dimezzata non significa potenza dimezzata se cambia anche il raggio.

## 15 — Un offset nel display dell’intensità

I riferimenti sono uno e un mezzo W/m². La differenza uno delle letture divisa per un mezzo dà q=2 m²/W; segue z=1. La lettura nove rappresenta I_C=4 W/m². A due metri, p_C=4·4=16 W.

Passaggi: `q=2\,\mathrm{m^2/W}\qquad z=1\qquad I_C=4\,\mathrm{W/m^2}\qquad p_C=16\,\mathrm W`

Errori e controllo: Otto e quattro W produrrebbero letture cinque e tre, trentadue W produrrebbe diciassette. 64π W è la potenza completa P_C=4πp_C, non il parametro richiesto.

## 16 — Un vincolo fra p e distanza

Sostituire il vincolo nella legge sferica cancella un fattore di r: I=c/r. La distanza si isola come c/I e vale due metri. Il parametro risultante è p=4 W. Il legame riguarda sorgenti o condizioni differenti, non potenza crescente con il raggio nella stessa prova.

Passaggi: `I=\frac{cr}{r^2}\qquad I=\frac cr\qquad r=\frac cI\qquad r=2\,\mathrm m\qquad p=4\,\mathrm W`

Errori e controllo: Non serve una radice dopo la sostituzione, perché resta una sola potenza di r al denominatore. c è una potenza per lunghezza, non un’intensità né una pressione.

## Correzione dopo revisione distinta

Il revisore ha rilevato che 1/4 non è il reciproco del risultato 1: deriva dal solo 1/r² omettendo p. Corretta soltanto la motivazione del distrattore in 01, con il suo error.message e binding. Chiave, formule, figura e altre 15 schede restano identiche. Doppia assembly, import idempotente e 48 nuove anteprime tecniche exit 0; revisione scientifica indipendente da aggiornare dal revisore distinto, nessuna firma dell’autore.
