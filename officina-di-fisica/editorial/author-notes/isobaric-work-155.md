# isobaric-work-155 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-01.json; SHA256 del file sorgente 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 153–157 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06 e L07. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Forza e spostamento diventano pΔV

La forza esterna sul pistone ha modulo p per la sua area. Moltiplicando per lo spostamento, area per spostamento diventa incremento di volume. La pressione è costante, quindi il lavoro è pΔV. Due per tre sono sei; i fattori mille del kilopascal e un millesimo del litro si cancellano. Il segno è positivo perché il volume cresce.

Passaggi: `F=pA\qquad \Delta V=A\Delta x\qquad W=p\Delta V\qquad W=(2\,\mathrm{kPa})(3\,\mathrm L)\qquad W=6\,\mathrm J`

Errori e controllo: Dodici J raddoppierebbero il lavoro senza un secondo cambiamento. Non serve aggiungere una pressione atmosferica: p è già la pressione esterna totale dichiarata. Il calcolo non determina da solo il calore scambiato.

## 02 — Perché kPa per litro dà joule

In unità SI una pressione per un volume dà N/m² per m³, cioè N·m. Questo è un joule. Il simbolo W usato per il lavoro non va confuso con l’unità watt: il watt misura potenza.

Passaggi: `\mathrm{Pa\,m^3}=\mathrm{N\,m}=\mathrm J\qquad 1\,\mathrm{kPa}=10^3\,\mathrm{Pa}\qquad 1\,\mathrm L=10^{-3}\,\mathrm{m^3}\qquad 1\,\mathrm{kPa\,L}=1\,\mathrm J`

Errori e controllo: Pa misura pressione, L volume e N forza. W come unità vale J/s: richiederebbe dividere per una durata, qui assente.

## 03 — Ripercorrere la stessa isobara

All’andata l’incremento è più tre litri e il gas compie sei joule. Al ritorno la variazione è meno tre litri: l’ambiente compie lavoro sul gas e W vale meno sei joule nella convenzione scelta. Le due aree hanno uguale modulo e segno opposto, perciò il lavoro totale su questo specifico percorso di andata e ritorno è zero.

Passaggi: `\Delta V_{AB}=3\,\mathrm L\qquad W_{AB}=6\,\mathrm J\qquad \Delta V_{BA}=-3\,\mathrm L\qquad W_{BA}=-6\,\mathrm J\qquad W_{AB}+W_{BA}=0`

Errori e controllo: La compressione non ha lavoro nullo: il suo confine si muove. Prendere entrambi i moduli perde il verso. Il risultato dipende dal percorso p–V; una temperatura finale da sola non sostituisce l’integrale del lavoro.

## 04 — La stessa espansione a pressione doppia

Il volume spazzato dal pistone è lo stesso. Raddoppiando la pressione si raddoppia la forza su ogni stessa area, quindi anche il lavoro: da sei a dodici joule. Si stanno confrontando prove diverse, ciascuna con la propria pressione costante.

Passaggi: `W_A=(2\,\mathrm{kPa})(3\,\mathrm L)\qquad W_A=6\,\mathrm J\qquad W_B=(4\,\mathrm{kPa})(3\,\mathrm L)\qquad W_B=12\,\mathrm J`

Errori e controllo: Sei ignora p nuova, tre rende inversa la dipendenza e ventiquattro cambia due fattori invece di uno. Zero non segue da un’espansione contro pressione positiva.

## 05 — La pressione dal lavoro misurato

Dividiamo i sei joule per i tre litri. Un joule per litro equivale a un kilopascal; il quoziente è due kPa. Rimettendo questa pressione nella legge si ricostruiscono i sei joule misurati.

Passaggi: `p=\frac W{\Delta V}\qquad p=\frac{6\,\mathrm J}{3\,\mathrm L}\qquad p=2\,\mathrm{kPa}`

Errori e controllo: Moltiplicare W per ΔV darebbe energia moltiplicata per volume, non pressione. Il reciproco ΔV/W ha dimensione inversa della pressione. Non si usa V_f al posto dell’incremento.

## 06 — Il volume spazzato dal lavoro

A due kPa ogni litro di incremento richiede due joule di lavoro. Sei joule corrispondono quindi a tre litri. Il risultato è V_f−V_i: per ricavare V_f occorrerebbe aggiungere il volume iniziale.

Passaggi: `\Delta V=\frac Wp\qquad \Delta V=\frac{6\,\mathrm J}{2\,\mathrm{kPa}}\qquad \Delta V=3\,\mathrm L`

Errori e controllo: Dodici moltiplica invece di dividere e due copia la pressione. L’unità J/kPa è L, non m³: tre litri equivalgono a tre millesimi di m³.

## 07 — Una corsa maggiore alla stessa pressione

A compie sei joule e B dieci. Il rapporto dieci su sei si riduce a cinque terzi. La pressione comune si cancella e rimane il rapporto degli incrementi di volume.

Passaggi: `W_A=6\,\mathrm J\qquad W_B=10\,\mathrm J\qquad W_B/W_A=\frac{10}{6}=\frac53`

Errori e controllo: Tre quinti inverte il confronto; venticinque noni quadra una dipendenza lineare. Uno ignora la corsa maggiore e due assume un raddoppio non presente nei dati.

## 08 — Lo scarto di un lavoro raddoppiato

Il prodotto corretto è sei joule. Dodici meno sei dà uno scarto di più sei joule. L’energia in eccesso della proposta non è una seconda componente da aggiungere al lavoro del pistone.

Passaggi: `W=6\,\mathrm J\qquad e=(12-6)\,\mathrm J\qquad e=6\,\mathrm J`

Errori e controllo: Meno sei rovescia l’ordine; dodici copia la proposta; zero la accetta. Tre è metà dello scarto e non la differenza richiesta.

## 09 — L’inversa della pressione costante

Poiché ΔV è positivo possiamo dividere il lavoro per esso. In SI, joule su metri cubi sono pascal; nelle unità assegnate joule su litri sono kilopascal. Il fattore di conversione numerico vale uno proprio per questa coppia di unità.

Passaggi: `W=p\Delta V\qquad p=\frac W{\Delta V}\qquad \mathrm{J/m^3}=\mathrm{Pa}\qquad \mathrm{J/L}=\mathrm{kPa}`

Errori e controllo: In SI WΔV ha unità J·m³, non Pa; ΔV/W ha l’unità inversa della pressione. Il due al denominatore o al numeratore dà rispettivamente metà o doppio del lavoro quando si sostituisce p nella legge iniziale.

## 10 — Scalare pressione e incremento di volume

Scriviamo il lavoro di B con entrambi i nuovi fattori. Il rettangolo p–V si allarga di κ₂ e si alza di κ₁, quindi la sua area cresce per il loro prodotto. Il rapporto non dipende dal valore numerico del fattore kPa·L/J, uguale nelle due prove.

Passaggi: `W_B=(\kappa_1p_A)(\kappa_2\Delta V_A)\qquad W_A=p_A\Delta V_A\qquad W_B/W_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti rendono inversa una delle dipendenze. La somma dà due per prove uguali; il quadrato di κ₂ tratterebbe un volume come se andasse elevato ancora al quadrato.

## 11 — Due modifiche nell’area del lavoro

Il riferimento compie sei joule e B venti. Venti su sei si semplifica a dieci terzi. Il raddoppio della pressione si combina con il rapporto cinque terzi dei volumi spazzati.

Passaggi: `W_A=6\,\mathrm J\qquad W_B=20\,\mathrm J\qquad W_B/W_A=\frac{20}{6}=\frac{10}{3}`

Errori e controllo: Tre decimi è il reciproco; due considera soltanto p e cinque terzi soltanto ΔV. Venti è il numero di joule del processo B e non il rapporto senza unità.

## 12 — Media di due lavori del pistone

I lavori sono sei e venti joule. La loro somma ventisei divisa per due dà tredici joule. Gli ingressi medi sarebbero tre kPa e quattro litri: il loro prodotto è dodici joule, il lavoro di una terza prova, non la media richiesta.

Passaggi: `W_A=6\,\mathrm J\qquad W_B=20\,\mathrm J\qquad \overline W=\frac{6+20}{2}\,\mathrm J\qquad \overline W=13\,\mathrm J`

Errori e controllo: Ventisei è la somma, 13/2 dimezza ancora e quattordici è la differenza. Dodici confonde la media dei prodotti con il prodotto delle medie.

## 13 — Il volume per il lavoro desiderato

Il bersaglio è venti joule, poiché sei per dieci terzi dà venti. Alla pressione di quattro kPa occorrono cinque litri. Il rapporto fra cinque e tre litri è cinque terzi: si rimuove dal fattore di lavoro il raddoppio già fornito dalla pressione.

Passaggi: `W_B=20\,\mathrm J\qquad \Delta V_B=\frac{20\,\mathrm J}{4\,\mathrm{kPa}}\qquad \Delta V_B=5\,\mathrm L\qquad \Delta V_B/\Delta V_A=\frac53`

Errori e controllo: Tre quinti inverte il rapporto; dieci terzi copia il bersaglio senza togliere il contributo di p. Due darebbe W_B=24 J e uno W_B=12 J, entrambi diversi da venti.

## 14 — Tarare una lettura di lavoro

A compie sei joule e fissa un guadagno q=3 J⁻¹. La lettura sessanta corrisponde a venti joule. Dividendo questi per i cinque litri di B si ottiene quattro kPa, la pressione esterna totale della nuova prova.

Passaggi: `W_A=6\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad W_B=20\,\mathrm J\qquad p_B=\frac{W_B}{\Delta V_B}\qquad p_B=4\,\mathrm{kPa}`

Errori e controllo: Usare direttamente sessanta come joule darebbe dodici kPa. Il display non misura già una pressione: il guadagno riguarda W, poi serve l’inversa con ΔV_B.

## 15 — Due riferimenti per pressione e offset

I riferimenti compiono sei e venti joule. La variazione ventotto di S divisa per quattordici joule dà q=2 J⁻¹; poi b=1. Per C, venticinque meno uno diviso due dà dodici joule. Dividendo per tre litri otteniamo quattro kPa.

Passaggi: `q=\frac{41-13}{(20-6)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad W_C=12\,\mathrm J\qquad p_C=4\,\mathrm{kPa}`

Errori e controllo: Otto kPa produrrebbero S=49, due kPa S=13. 25/6 kPa omette l’offset e dà S=26; dodici kPa copia il numero del lavoro e porterebbe S=73.

## 16 — Un vincolo fra due parametri della prova

Sostituendo il valore di p scelto per ogni prova si ottiene W=c(ΔV)². Poiché un joule equivale a un kPa·L, il quoziente W/c è nove litri quadrati. La radice positiva è tre litri e la pressione corrispondente è due kPa. Non compare un fattore un mezzo: p non cresce con il volume durante la singola espansione.

Passaggi: `W=c(\Delta V)^2\qquad (\Delta V)^2=\frac Wc\qquad (\Delta V)^2=9\,\mathrm{L^2}\qquad \Delta V=3\,\mathrm L\qquad p=2\,\mathrm{kPa}`

Errori e controllo: La radice negativa viola l’espansione e p>0. Nove è il numero del quadrato; 3/2 L darebbero W=3/2 J e sei litri W=24 J. Sostituire p=c(V−V_i) lungo il processo cambierebbe il modello assegnato.
