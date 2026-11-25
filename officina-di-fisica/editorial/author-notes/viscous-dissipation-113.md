# viscous-dissipation-113 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U3-04.json. Letti individualmente tutti gli 80 originali 112–116 prima della scrittura, comprese le varianti concettuali 114-03, 115-03, 116-03 e l’analisi dimensionale 116-08. Riletti i testi reali delle lezioni C2-L007/L008/L009 e le loro dipendenze. Stesso assemble_family, course C2, unit u3.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Queste sono note di calcolo per un revisore distinto.

Potenza positiva dissipata distinta dal contributo negativo al bilancio meccanico: P_d = Δp Q = R Q². Le sezioni hanno stessa quota e velocità media, nessuna macchina o accumulo. Conversione esatta kPa·L/s = W. 12: media 15 W distinta da 125/8 W agli ingressi medi. 16: R = cQ con c = 2/3 kPa·s²/L² conduce a Q³ = 27 L³/s³, unica radice reale 3 L/s, senza introdurre falsi rami ± da radice quadrata. Figura: frecce da 3 L/s lunghe 120 px a 40 px/(L/s), diciotto caselle da 1 J in 1 s, grafico a R = 2 con scale 50 px/(L/s), 10 px/W e punti (2,8), (3,18), (4,32). Tutti i calcoli sono note autore per review separata.

SVG completo letto in XML e rendering nativo. Ogni quantità rappresentata ha scala dichiarata; le grandezze con unità diverse non vengono confrontate con la stessa scala. Frecce su path separati, formule suddivise con law_steps. Nessun CSS, renderer o gate modificato.

## 01 — Dalla caduta di pressione ai watt

Prima ricaviamo il salto che mantiene la portata: due per tre dà sei kPa. In un secondo passano tre litri; ciascun litro perde sei joule di energia meccanica, perché un kPa per un litro è un joule. I diciotto joule al secondo corrispondono a diciotto watt dissipati.

Passaggi: `\Delta p=RQ\qquad \Delta p=6\,\mathrm{kPa}\qquad P_d=\Delta pQ\qquad P_d=(6\,\mathrm{kPa})(3\,\mathrm{L/s})\qquad P_d=18\,\mathrm W`

Errori e controllo: Sei è il numero della caduta in kPa, non della potenza. Nove è il quadrato numerico della portata senza R. La potenza dissipata è positiva; il contributo dell’attrito al bilancio dell’energia meccanica ha invece segno negativo.

## 02 — La conversione che restituisce potenza

La differenza di pressione moltiplicata per la portata ha dimensione di energia per tempo. Mille pascal per un millesimo di metro cubo al secondo è un pascal moltiplicato per un metro cubo al secondo: i due prefissi si cancellano esattamente.

Passaggi: `1\,\mathrm{kPa}=1000\,\mathrm{Pa}\qquad 1\,\mathrm{L/s}=10^{-3}\,\mathrm{m^3/s}\qquad 1\,\mathrm{kPa\,L/s}=1\,\mathrm{Pa\,m^3/s}\qquad 1\,\mathrm{Pa\,m^3/s}=1\,\mathrm W`

Errori e controllo: J sarebbe l’energia dissipata durante un intervallo; kPa è pressione, L/s portata e kPa·s/L resistenza. Per un tempo t la quantità di energia convertita sarebbe P_dt, non P_d da sola.

## 03 — Perché la portata compare due volte

Il lavoro delle forze di pressione per trasportare un volume dV è Δp dV. Per unità di tempo diventa ΔpQ. Nel resistore assegnato Δp cresce a sua volta come RQ: una Q stabilisce il salto necessario e l’altra conta il volume che lo attraversa ogni secondo.

Passaggi: `dW=\Delta p\,dV\qquad P_d=\Delta pQ\qquad \Delta p=RQ\qquad P_d=RQ^2`

Errori e controllo: RQ da solo è una pressione. Le due espressioni inverse hanno dipendenze e dimensioni sbagliate. Il fattore due non nasce da una legge di energia cinetica: qui si usa il lavoro delle pressioni su un elemento resistivo.

## 04 — Più resistenza a portata mantenuta

Il quadrato della portata resta nove. Moltiplicarlo per due o per tre dà diciotto e ventisette watt. Per mantenere la stessa portata la caduta aumenta da sei a nove kPa: è la pompa esterna a dover fornire più potenza meccanica al sistema.

Passaggi: `Q^2=9\,\mathrm{L^2/s^2}\qquad P_{d,A}=18\,\mathrm W\qquad P_{d,B}=27\,\mathrm W`

Errori e controllo: Dodici usa il fattore inverso della resistenza. Ottantuno mezzi applica il quadrato al fattore 3/2, ma l’esponente due riguarda Q, non R. Invariata o nulla non è compatibile con R,Q positivi e con la portata mantenuta.

## 05 — La resistenza da una potenza dissipata

Dividiamo per il quadrato della portata. Tre al quadrato vale nove, quindi diciotto diviso nove è due. L’unità W/(L²/s²) coincide con kPa·s/L, usando la stessa equivalenza kPa·L/s=W.

Passaggi: `R=\frac{P_d}{Q^2}\qquad R=\frac{18\,\mathrm W}{9\,\mathrm{L^2/s^2}}\qquad R=2\,\mathrm{kPa\,s/L}`

Errori e controllo: Dividere soltanto per Q darebbe Δp=6 kPa, non la resistenza. Questo errore conserva un numero plausibile ma cambia la grandezza richiesta.

## 06 — La radice fisica della portata

Il rapporto potenza su resistenza dà il quadrato della portata. Diciotto diviso due è nove e la radice richiesta è tre. L’equazione algebrica ammetterebbe anche il segno negativo, ma il verso di flusso è stato assegnato positivo.

Passaggi: `Q^2=\frac{P_d}{R}\qquad Q^2=9\,\mathrm{L^2/s^2}\qquad Q=3\,\mathrm{L/s}`

Errori e controllo: Nove è un quadrato di portata, non Q. La radice −3 L/s descriverebbe il verso opposto e non è ammessa in questa consegna; non si sceglie il segno in base alla sola positività della dissipazione.

## 07 — Meno flusso, due fattori di riduzione

La portata diventa due terzi e la potenza contiene il suo quadrato. In A si dissipano diciotto watt, in B due per quattro, otto watt. Otto diciottesimi si riduce a quattro noni. Calano sia il volume al secondo sia la pressione necessaria a farlo passare.

Passaggi: `P_{d,A}=18\,\mathrm W\qquad P_{d,B}=8\,\mathrm W\qquad \frac{P_{d,B}}{P_{d,A}}=\frac8{18}\qquad \frac{P_{d,B}}{P_{d,A}}=\frac49`

Errori e controllo: Nove quarti è il reciproco; due terzi trascura uno dei due fattori di portata, tre mezzi ne inverte il verso e uno ignora il cambiamento.

## 08 — Una dissipazione proposta doppia

La caduta è sei kPa e il prodotto con tre L/s dà diciotto watt. La proposta trentasei contiene un fattore due non previsto. Lo scarto richiesto è positivo, trentasei meno diciotto: il segno dell’errore non è il segno del lavoro dell’attrito.

Passaggi: `P_d=18\,\mathrm W\qquad e=(36-18)\,\mathrm W\qquad e=18\,\mathrm W`

Errori e controllo: Meno diciotto scambia l’ordine, trentasei ripete la proposta, zero la accetta e nove dimezza l’errore. Una dissipazione positiva non giustifica qualunque valore positivo.

## 09 — Isolare R senza perdere il quadrato

R moltiplica Q². Dividendo entrambi i lati per il quadrato positivo si ottiene l’inversa, senza radici. La radice servirebbe se l’incognita fosse Q; qui la dipendenza da R è lineare.

Passaggi: `P_d=RQ^2\qquad R=\frac{P_d}{Q^2}\qquad Q>0`

Errori e controllo: P_d/Q restituisce pressione. Il prodotto con Q² inverte l’operazione, Q²/P_d restituisce una resistenza inversa e la radice finale altera sia la legge sia le dimensioni.

## 10 — Due scalature nella dissipazione

Sostituendo le nuove grandezze, il quadrato di κ₂Q contiene κ₂². Nel rapporto si cancellano R e Q² originari; il fattore di resistenza compare una volta sola. Le portate, non i soli salti di pressione, sono i secondi ingressi controllati.

Passaggi: `P_{d,B}=\kappa_1R_A(\kappa_2Q_A)^2\qquad \frac{P_{d,B}}{P_{d,A}}=\kappa_1\kappa_2^2`

Errori e controllo: Il prodotto semplice dimentica il secondo Q. Il quadrato su κ₁ riguarda la variabile sbagliata; le due opzioni con divisione trasformano una dipendenza diretta in inversa.

## 11 — La portata ridotta può prevalere

La nuova resistenza è maggiore di un fattore tre mezzi, ma la portata al quadrato è minore di un fattore quattro noni. Il prodotto è due terzi. Direttamente, B dissipa tre per quattro, dodici watt, contro diciotto in A: l’effetto della portata prevale.

Passaggi: `P_{d,A}=18\,\mathrm W\qquad P_{d,B}=12\,\mathrm W\qquad \frac{P_{d,B}}{P_{d,A}}=\frac32\frac49\qquad \frac{P_{d,B}}{P_{d,A}}=\frac23`

Errori e controllo: Tre mezzi segue soltanto R, quattro noni soltanto Q²; uno tratterebbe i due effetti come perfettamente compensati e dodici è la potenza numerica di B, non il rapporto.

## 12 — La media riguarda le due potenze

Le due uscite sono diciotto e dodici watt. Sommandole si ottengono trenta watt e dividendo per due si trova quindici. La media descrive il registro delle due prove, non un unico resistore con parametri medi.

Passaggi: `\overline P_d=\frac{18+12}{2}\,\mathrm W\qquad \overline P_d=15\,\mathrm W`

Errori e controllo: Trenta è la somma, quindici mezzi dimezza ancora e sei è la differenza. Usando R_media=5/2 kPa·s/L e Q_media=5/2 L/s si otterrebbe 125/8 W, maggiore di 15 W di 5/8 W: il prodotto con un quadrato non commuta con la media.

## 13 — Scegliere il flusso per il bersaglio

Il bersaglio è dodici watt. Dividendo per tre kPa·s/L rimane Q_B²=4 L²/s², da cui Q_B=2 L/s nel verso positivo. Il rapporto con i tre iniziali è due terzi. Il quadrato del rapporto sarebbe quattro noni, una grandezza diversa.

Passaggi: `P_{d,B}=12\,\mathrm W\qquad Q_B^2=4\,\mathrm{L^2/s^2}\qquad Q_B=2\,\mathrm{L/s}\qquad Q_B/Q_A=\frac23`

Errori e controllo: Tre mezzi rovescia gli stati, quattro noni risponde sul quadrato e due copia la portata numerica finale. Uno lascerebbe Q=3 e produrrebbe 27 W, oltre il bersaglio.

## 14 — Tarare un indicatore di dissipazione

La potenza di riferimento è diciotto watt, quindi il guadagno vale tre per watt. La nuova lettura trentasei significa dodici watt. Il quadrato della nuova portata è quattro L²/s²: dividendo dodici per quattro si ricava R_B=3 kPa·s/L.

Passaggi: `q=3\,\mathrm{W^{-1}}\qquad P_{d,B}=12\,\mathrm W\qquad R_B=\frac{P_{d,B}}{Q_B^2}\qquad R_B=3\,\mathrm{kPa\,s/L}`

Errori e controllo: Trattare 36 come watt triplicherebbe il valore vero e darebbe R=9. Togliere il guadagno non elimina la necessità di elevare la portata al quadrato.

## 15 — Taratura affine e resistenza ignota

I riferimenti corrispondono a diciotto e dodici watt. La differenza dodici delle letture divisa per sei watt dà q=2 W⁻¹; sottraendone il contributo in A resta z=1. In C la potenza è (55−1)/2=27 W e R vale ventisette su nove, tre kPa·s/L.

Passaggi: `q=2\,\mathrm{W^{-1}}\qquad z=1\qquad P_{d,C}=27\,\mathrm W\qquad R_C=3\,\mathrm{kPa\,s/L}`

Errori e controllo: Con Q=3 L/s, R=2,4,1,6 kPa·s/L produrrebbe letture 37,73,19,109. Nessuna vale 55; R=3 restituisce esattamente quel valore. I rapporti delle letture non eliminano un offset non nullo.

## 16 — Un vincolo che rende cubica la portata

Il vincolo introduce un terzo fattore di portata: P_d=cQ³. Dividendo diciotto per due terzi si trova ventisette nelle unità del cubo di Q. La radice cubica positiva è tre, riconoscibile perché 3·3·3=27. La resistenza conseguente è due kPa·s/L.

Passaggi: `P_d=cQ^3\qquad Q^3=\frac{P_d}{c}\qquad Q^3=27\,\mathrm{L^3/s^3}\qquad Q=3\,\mathrm{L/s}\qquad R=2\,\mathrm{kPa\,s/L}`

Errori e controllo: Ventisette è il valore del cubo, nove L/s darebbe 486 W nel vincolo, non 18 W e −3 darebbe un cubo negativo, quindi non risolve neppure questa equazione positiva. Il cubo è strettamente crescente su Q>0, perciò la soluzione fisica è unica. c ha unità R/Q: il vincolo vale fra prove e non è una legge temporale.

Correzione puntuale dopo rilievo del revisore distinto: soltanto feedback ed error.message del record 16, con binding rigenerato; chiavi, formule, SVG e le altre 15 schede rimangono identici.
