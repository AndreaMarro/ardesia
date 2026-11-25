# beats-envelope-146 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U4-02.json. Letti individualmente tutti gli 48 originali assegnati 145–147 prima della scrittura. Famiglie e ID effettivi confermati. Riletta la lezione reale C5-L01/L02/L03/L05 e le fondazioni reali C1-L001/L005/L006/L008. Stesso assemble_family, course C5, unit u4.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Nessun verificatore o firma scientifica dell’autore; nessuna pubblicazione. Seguono calcoli e limiti da sottoporre a un revisore distinto.

Le leggi e le ipotesi sono sviluppate dai testi sorgente e dalle lezioni reali rilette. I due casi Doppler sono mantenuti distinti dalla differenza fra frequenze dei battimenti. Le disuguaglianze dei rami e il limite del coseno sono espliciti. Nessuna chiave originaria viene usata come verifica scientifica; queste note espongono il ragionamento dell’autore per la revisione distinta.

SVG letto integralmente in XML e rendering nativo. Scale dichiarate e geometria controllata dall’autore; il rendering nativo può omettere le punte dei marker, lette separatamente in XML. Formule suddivise con law_steps. Le anteprime verificano il lettore esistente, senza modifiche a CSS, renderer o gate. Questi controlli tecnici non costituiscono una revisione scientifica indipendente.

## 01 — Due portanti vicine, una variazione lenta

Sottraiamo le frequenze, non le ampiezze: 302−300=2 Hz. Il segnale totale compie oscillazioni rapide attorno alla frequenza media 301 Hz, ma il suo modulo si rinforza due volte ogni secondo. La formula di somma di due coseni separa un fattore rapido e uno lento. Poniamo u=t/(1 s), tempo espresso come numero puro: con le fasi iniziali assegnate s=2A cos(2πu)cos(602πu). Il modulo dell’inviluppo lento è 2A|cos(2πu)|, con massimi separati da mezzo secondo. Non bisogna confondere questa cadenza con la frequenza media o con la metà della differenza che appare nel coseno con segno.

Passaggi: `f_b=f_1-f_2\qquad u=\frac{t}{1\,\mathrm s}\qquad E=2A|\cos(2\pi u)|\qquad f_b=2\,\mathrm{Hz}\qquad f_{\rm media}=301\,\mathrm{Hz}\qquad T_b=\frac12\,\mathrm s`

Errori e controllo: 602 Hz è la somma e 301 Hz la portante media. Uno Hz è la frequenza del fattore lento con segno: il suo modulo ha due massimi per ciclo. Il valore due nasce dalla differenza, non dall’intensità sommata.

## 02 — L’unità di una cadenza

Una frequenza di battimento ha dimensione di tempo inverso, come ciascuna frequenza sottratta. Un hertz significa una ripetizione al secondo; il periodo fra massimi è invece il suo reciproco in secondi.

Passaggi: `[f_b]=\mathrm{s^{-1}}\qquad [T_b]=\mathrm s\qquad T_b=1/f_b`

Errori e controllo: Secondi misurano il periodo, metri uno spostamento, W/m² un’intensità e radianti una fase. Nessuna di queste unità esprime una frequenza.

## 03 — Un caso Doppler distinto dai battimenti

Indichiamo con f₀ la frequenza emessa, con v_s il modulo della velocità della sorgente verso il ricevitore e con v_o quello del ricevitore verso la sorgente, entrambi rispetto all’aria; sono non negativi e almeno uno è positivo. La sorgente che avanza accorcia la distanza fra i fronti emessi davanti a sé. L’ascoltatore che le va incontro incontra anche più fronti per secondo. I due effetti aumentano la frequenza ricevuta rispetto a quella emessa. Questo quesito riguarda un singolo segnale e moti relativi al mezzo: non si applica la differenza fra due portanti ferme.

Passaggi: `f_{\rm ric}=f_0\frac{c+v_o}{c-v_s}\qquad 0\le v_o<c\qquad 0\le v_s<c\qquad f_{\rm ric}>f_0`

Errori e controllo: Una diminuzione corrisponderebbe all’allontanamento. La velocità nel mezzo non raddoppia per il moto della sorgente; non serve una seconda onda per l’effetto Doppler e non segue una cancellazione. Almeno uno dei due moduli è non nullo perché la distanza diminuisce.

## 04 — Avvicinare ulteriormente le frequenze

La separazione scende da due a uno Hz. La cadenza dei massimi si dimezza e il tempo fra due massimi raddoppia da mezzo secondo a un secondo. Il rapporto fra le grandi frequenze delle portanti non è il fattore da applicare al piccolo scarto.

Passaggi: `f_{b,A}=2\,\mathrm{Hz}\qquad f_{b,B}=1\,\mathrm{Hz}\qquad T_{b,B}=1\,\mathrm s`

Errori e controllo: Quattro inverte l’effetto della minore separazione, mezzo dimezza ancora il risultato, 301 copia la portante e due ignora la nuova frequenza.

## 05 — Ricostruire la portante superiore

Il ramo f₁>f₂ stabilisce da quale lato aggiungere lo scarto. La portante superiore è 300+2=302 Hz. La soluzione 298 Hz sarebbe inferiore a f₂ e richiederebbe scambiare le etichette del ramo.

Passaggi: `f_1=f_2+f_b\qquad f_1=302\,\mathrm{Hz}`

Errori e controllo: Due è solo la differenza, 300 l’altra portante e 298 appartiene al ramo inverso. Non si sommano né sottraggono quadrati per ricostruire una frequenza da una differenza.

## 06 — Ricostruire la portante inferiore

La frequenza minore si ricava sottraendo il battimento dalla maggiore: 302−2=300 Hz. È positiva e resta vicina alla maggiore, come richiede il modello dell’inviluppo lento.

Passaggi: `f_2=f_1-f_b\qquad f_2=300\,\mathrm{Hz}\qquad 0<f_b<f_1`

Errori e controllo: 304 aggiunge lo scarto e produrrebbe una seconda frequenza maggiore della prima. Se il battimento fosse almeno f₁, questa inversa darebbe zero o un numero negativo e il ramo non sarebbe ammissibile.

## 07 — Una seconda frequenza più vicina

Le differenze sono due e uno Hz, quindi il rapporto è un mezzo. L’incremento di un solo Hz sulla frequenza inferiore riduce molto il piccolo scarto, pur cambiando poco il rapporto fra le portanti.

Passaggi: `f_{b,A}=2\,\mathrm{Hz}\qquad f_{b,B}=1\,\mathrm{Hz}\qquad f_{b,B}/f_{b,A}=\frac12`

Errori e controllo: Due è il reciproco, uno ignora il cambiamento, 301/300 segue il solo ingresso e un quarto quadra il rapporto. La frequenza di battimento dipende dalla differenza.

## 08 — Lo scarto di una frequenza proposta

La frequenza di battimento corretta è due Hz. La proposta quattro la supera di due Hz. Il segno dello scarto dipende dall’ordine della sottrazione, anche se tutte le frequenze fisiche sono positive.

Passaggi: `f_b=2\,\mathrm{Hz}\qquad e=(4-2)\,\mathrm{Hz}\qquad e=2\,\mathrm{Hz}`

Errori e controllo: Meno due scambia l’ordine, quattro copia la proposta, sei somma e zero la accetta. Non si sottrae la portante media alla proposta di battimento.

## 09 — L’inversa nel ramo assegnato

Nel ramo f₁>f₂ il modulo diventa f_b=f₁−f₂. Aggiungendo f₂ si ricava f₁=f_b+f₂, automaticamente superiore a f₂ per f_b>0. Senza l’ordine delle etichette il solo modulo ammetterebbe anche un altro ramo.

Passaggi: `f_b=f_1-f_2\qquad f_1=f_b+f_2`

Errori e controllo: f₂−f_b scende sotto f₂. Il prodotto e la somma dei quadrati hanno dimensione Hz², il quoziente è puro. L’inversa richiesta deve conservare sia le unità sia il ramo.

## 10 — Fattori diversi sulle portanti

I fattori agiscono sui due ingressi prima della sottrazione. Il rapporto dei battimenti è la nuova differenza divisa per quella iniziale. Con un fattore comune κ le differenze scalano di κ; con fattori diversi occorre invece conservare le frequenze nel risultato.

Passaggi: `f_{b,B}=\kappa_1f_1-\kappa_2f_2\qquad \frac{f_{b,B}}{f_{b,A}}=\frac{\kappa_1f_1-\kappa_2f_2}{f_1-f_2}`

Errori e controllo: La differenza dei fattori darebbe zero per prove identiche. Prodotto e quoziente perdono gli scarti; l’ultima espressione confronta somme, non battimenti. Le condizioni aggiunte impediscono il cambio di ramo e preservano il regime lento.

## 11 — Cambiare portanti conservando uno scarto piccolo

La prova A ha differenza due Hz; B ha differenza uno Hz. Il rapporto dei battimenti è un mezzo, benché entrambe le portanti siano aumentate. Conta la loro separazione, non la loro quota assoluta.

Passaggi: `f_{b,A}=2\,\mathrm{Hz}\qquad f_{b,B}=1\,\mathrm{Hz}\qquad f_{b,B}/f_{b,A}=\frac12`

Errori e controllo: Due inverte il rapporto. 401/302 segue solo f₁ e quattro terzi solo f₂; uno ignora il nuovo scarto. Entrambe le coppie hanno differenza molto minore della loro frequenza media.

## 12 — Una media fra cadenze

Prima ricaviamo due e uno Hz, poi la semisomma tre mezzi Hz. In questo ramo lineare la stessa risposta si ottiene dalle portanti medie 703/2 e 350 Hz: la loro differenza è tre mezzi. La coincidenza dipende dal mantenimento dell’ordine delle frequenze, non autorizza una regola universale per tutti i moduli.

Passaggi: `\overline f_b=\frac{2+1}{2}\,\mathrm{Hz}\qquad \overline f_b=\frac32\,\mathrm{Hz}`

Errori e controllo: Tre è la somma, mezzo la semidifferenza e due o uno conservano una sola prova. Il periodo medio non è il reciproco di questa media: si stanno mediando frequenze, non tempi fra massimi.

## 13 — Un target vicino alla nuova portante

Il battimento target è uno Hz. La frequenza inferiore deve essere 401−1=400 Hz. Il rapporto con i 300 Hz iniziali è quattro terzi. La coppia risultante mantiene f₁>f₂ e uno scarto piccolo rispetto alle portanti.

Passaggi: `f_{b,B}=1\,\mathrm{Hz}\qquad f_{2,B}=400\,\mathrm{Hz}\qquad f_{2,B}/f_{2,A}=\frac43`

Errori e controllo: Tre quarti capovolge gli stati, mezzo copia il target, 401/302 considera solo la frequenza maggiore e 400 è il numero di Hz finale, non il rapporto puro.

## 14 — Una taratura sulla differenza

La differenza di riferimento due Hz dà q=3 s. La lettura tre rappresenta f_b=1 Hz. Aggiungendo questo scarto ai 400 Hz inferiori si ricava la frequenza maggiore 401 Hz, senza trattare la lettura del display come una portante.

Passaggi: `q=3\,\mathrm s\qquad f_{b,B}=1\,\mathrm{Hz}\qquad f_{1,B}=401\,\mathrm{Hz}`

Errori e controllo: Tre è la lettura grezza e uno lo scarto, non la portante. Usare tre Hz al posto dello scarto decodificato darebbe 403 Hz e ricostruirebbe una lettura nove.

## 15 — Un offset sul segnale lento

I battimenti due e uno Hz fissano q=2 s e b=1. La lettura sette rappresenta (7−1)/2=3 Hz. Per mantenere il ramo superiore sommiamo tre ai 500 Hz assegnati: la risposta è 503 Hz.

Passaggi: `q=2\,\mathrm s\qquad b=1\qquad f_{b,C}=3\,\mathrm{Hz}\qquad f_{1,C}=503\,\mathrm{Hz}`

Errori e controllo: 507 usa il display come scarto; 500 annulla il battimento. 501 e 505 darebbero letture tre e undici, non sette. La nuova separazione tre Hz resta piccola rispetto alle portanti intorno a 500 Hz.

## 16 — Il Doppler in due versi, un’altra legge

Consideriamo i reciproci delle due frequenze per separare l’incognita di moto. Sommandoli si cancellano i termini opposti v/c: 1/f_avv+1/f_all=2/f₀. La frequenza emessa è quindi la media armonica delle due ricevute, non la loro semisomma. Due per 600 per 400 diviso mille dà 480 Hz. Il rapporto dei dati implica v/c=1/5, quindi il ramo subsonico è ammissibile.

Passaggi: `\frac1{f_{\rm avv}}+\frac1{f_{\rm all}}=\frac2{f_0}\qquad f_0=\frac{2f_{\rm avv}f_{\rm all}}{f_{\rm avv}+f_{\rm all}}\qquad f_0=480\,\mathrm{Hz}\qquad \frac vc=\frac{600-400}{600+400}=\frac15`

Errori e controllo: 500 Hz è la media aritmetica e non risolve entrambe le equazioni. 200 Hz è la differenza dei dati, non la frequenza emessa; la legge dei battimenti non sostituisce il Doppler. La frequenza emessa deve stare fra 400 e 600 Hz, ma questo controllo da solo non determina il valore.

## Parametrizzazione dichiarata e casi distinti

La fonte originale è conservata nel pin e nei binding. Le vecchie portanti 3 e 1 Hz non costituiscono due suoni vicini: la nuova prova A usa 302 e 300 Hz; B usa 401 e 400 Hz. Per il cambiamento di un solo ingresso si usano 301 e 300 Hz oppure 302 e 301 Hz. Nella nuova prova C del display la portante inferiore è 500 Hz. Tutte le differenze rimangono intere e piccole rispetto alle portanti; inverse, rapporti e tarature sono ricalcolati sui nuovi dati, senza supporre che ogni numero originario sia invariato. Le schede 03 e 16 restano i due quesiti Doppler della fonte, con proprie ipotesi e competenza C5-L05; le altre schede sono su C5-L03. Gli aggiornamenti puntuali di skill, error.target e prerequisite sono applicati dopo l’unico assemble_family, aggiornando il binding canonico di quelle sole due schede. Nessun secondo importer o motore.

Per frequenze diverse non viene chiamata costante la fase relativa: ciascun segnale è stabile, ma la fase relativa evolve. Per il grafico si assegnano massimi coincidenti a t=0; il modulo dell’inviluppo ripete due massimi per ciclo del coseno lento con segno. Il tempo nell’argomento trigonometrico è normalizzato con u=t/(1 s), così la fase è adimensionale. Il grafico lento è distinto dalla portante, non campiona una falsa oscillazione a bassa frequenza. I fronti Doppler sono separati e dichiarati schematici; le spaziature di 120 px dietro e 80 px davanti rispettano anche il rapporto dei dati finali.

Riferimenti primari controllati per il modello, senza copiare esercizi o figure: [OpenStax, 17.6 Beats](https://openstax.org/books/university-physics-volume-1/pages/17-6-beats) per la somma dei coseni e la cadenza dell’inviluppo; [OpenStax, 17.7 The Doppler Effect](https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect) per i moti rispetto al mezzo e i due segni del denominatore. Le risoluzioni e gli SVG di questo lotto sono nuovi.
