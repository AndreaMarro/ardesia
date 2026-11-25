# first-law-expansion-156 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-01.json; SHA256 del file sorgente 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 153–157 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06 e L07. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Quanto resta nel sistema

Entrano cento joule come calore e quaranta escono come lavoro. L’energia interna aumenta della differenza: sessanta joule. Non si calcola U_f in valore assoluto, perché non è assegnata U_i; si trova soltanto la sua variazione.

Passaggi: `\Delta U=Q-W\qquad \Delta U=(100-40)\,\mathrm J\qquad \Delta U=60\,\mathrm J`

Errori e controllo: Centoquaranta J sommerebbero un’uscita a un’entrata; quaranta J sono il lavoro e cento J il calore, ciascuno solo una parte del bilancio. Il sistema chiuso può scambiare energia pur conservando la materia.

## 02 — L’unità della variazione di energia interna

U e la sua variazione hanno entrambe dimensione di energia, quindi si misurano in joule. Essere una differenza può cambiare il segno del valore, non l’unità. Calore e lavoro si esprimono anch’essi in joule perché trasferiscono energia.

Passaggi: `[\Delta U]=[Q]=[W]=\mathrm J`

Errori e controllo: J/K è capacità termica, K temperatura, Pa pressione. Il watt è joule al secondo e misura una velocità di trasferimento, non un’energia.

## 03 — Calore è un trasferimento

Il calore identifica un modo in cui l’energia attraversa il confine quando vi è una differenza di temperatura. Dopo il trasferimento si descrive l’energia del sistema mediante U, non mediante una quantità di calore contenuta. Due percorsi fra gli stessi stati possono avere lo stesso ΔU ma differenti Q e W.

Passaggi: `\Delta U=Q-W\qquad \text{U: funzione di stato}\qquad \text{Q,W: trasferimenti}`

Errori e controllo: Una sostanza non è la descrizione energetica del calore. Temperatura ed energia hanno unità diverse; Q non è funzione di stato. Anche il lavoro è una modalità di trasferimento, non una riserva chiamata lavoro immagazzinato.

## 04 — Più calore con la stessa uscita di lavoro

In A restano sessanta joule; in B duecento meno quaranta sono centosessanta. L’aumento di Q di cento joule aumenta ΔU degli stessi cento, poiché W è fermo. Raddoppiare Q non raddoppia in questo caso ΔU: il termine sottratto non viene raddoppiato.

Passaggi: `\Delta U_A=60\,\mathrm J\qquad \Delta U_B=(200-40)\,\mathrm J\qquad \Delta U_B=160\,\mathrm J`

Errori e controllo: Centoventi raddoppia direttamente la prima uscita, ignorando il lavoro fisso. Duecentoquaranta aggiunge W; sessanta ignora Q nuova e meno centosessanta rovescia il bilancio.

## 05 — Ricavare il calore dal bilancio

Il calore deve alimentare sia l’aumento di energia interna sia il lavoro che esce. Aggiungiamo quaranta a sessanta e otteniamo cento joule. Il risultato è positivo, coerente con un trasferimento termico entrante.

Passaggi: `\Delta U=Q-W\qquad Q=\Delta U+W\qquad Q=(60+40)\,\mathrm J\qquad Q=100\,\mathrm J`

Errori e controllo: Sottrarre di nuovo il lavoro darebbe venti joule e non ricostruirebbe ΔU=60 J. Il segno meno del primo principio cambia quando W viene portato al membro con ΔU.

## 06 — Il lavoro dalla quota che non rimane

Dall’energia ricevuta togliamo l’aumento che rimane nel sistema. La differenza è quaranta joule di lavoro uscente. Il valore positivo conferma il verso dichiarato: il sistema compie lavoro sull’ambiente.

Passaggi: `W=Q-\Delta U\qquad W=(100-60)\,\mathrm J\qquad W=40\,\mathrm J`

Errori e controllo: Centosessanta sommerebbe ingresso e accumulo. Meno quaranta scambierebbe il verso del trasferimento meccanico; sessanta copia ΔU anziché ricavare il lavoro.

## 07 — Più lavoro lascia un aumento minore

A aumenta U di sessanta joule; B di quaranta. Il rapporto quaranta su sessanta è due terzi. Più energia esce come lavoro mentre l’entrata termica è uguale, quindi rimane un aumento minore.

Passaggi: `\Delta U_A=60\,\mathrm J\qquad \Delta U_B=40\,\mathrm J\qquad \Delta U_B/\Delta U_A=\frac23`

Errori e controllo: Tre mezzi è il reciproco e anche il rapporto dei lavori, che non è quello chiesto. Uno ignora W nuova; due non segue dal bilancio. Il rapporto qui resta positivo perché entrambi gli aumenti sono positivi.

## 08 — Lo scarto della proposta di 120 J

La variazione corretta è sessanta joule. La proposta centoventi la supera di sessanta: lo scarto richiesto è positivo. Il numero centoventi non è il risultato della somma Q+W, che in questi dati varrebbe centoquaranta; basta confutarlo nel bilancio senza attribuirgli quell’errore diverso.

Passaggi: `\Delta U=60\,\mathrm J\qquad e=(120-60)\,\mathrm J\qquad e=60\,\mathrm J`

Errori e controllo: Meno sessanta inverte l’ordine della sottrazione; centoventi copia la proposta e zero la accetta. Trenta dimezza nuovamente lo scarto.

## 09 — L’inversa simbolica del calore

Aggiungiamo W a entrambi i membri di ΔU=Q−W. Il calore è quindi ΔU+W. ΔU può anche essere negativo: allora una parte del lavoro uscente proviene dalla diminuzione di U. Per restare nel dominio di calore entrante occorre comunque ΔU+W>0.

Passaggi: `\Delta U+W=Q\qquad Q=\Delta U+W\qquad Q>0\ \Longrightarrow\ \Delta U+W>0`

Errori e controllo: Sottrarre W una seconda volta non annulla il termine meno del primo principio. W−ΔU cambia il segno dell’accumulo; il doppio e la metà non conservano il bilancio.

## 10 — Due fattori in una differenza di energie

Il primo principio va applicato alla differenza in ciascuna prova. La variazione di A è Q−W e quella di B è κ₁Q−κ₂W. Non esiste in generale un solo fattore prodotto per una differenza con due ingressi modificati indipendentemente. Il denominatore deve essere diverso da zero; il numeratore può essere nullo o negativo senza rendere negativi Q_B o W_B.

Passaggi: `\Delta U_A=Q-W\qquad \Delta U_B=\kappa_1Q-\kappa_2W\qquad \frac{\Delta U_B}{\Delta U_A}=\frac{\kappa_1Q-\kappa_2W}{Q-W}\qquad Q-W\ne0`

Errori e controllo: Il più al numeratore conta il lavoro uscente come entrante; Q+W al denominatore cambia la variazione di A. Il prodotto κ₁κ₂ sarebbe adatto a un prodotto di ingressi, non a questo bilancio. Scambiare i fattori li assegna alle grandezze sbagliate.

## 11 — Confrontare due bilanci completi

A aumenta U di sessanta joule, B di centoquaranta. La frazione centoquaranta su sessanta si riduce dividendo per venti: sette terzi. Il rapporto non coincide né con quello dei calori né con quello dei lavori.

Passaggi: `\Delta U_A=60\,\mathrm J\qquad \Delta U_B=140\,\mathrm J\qquad \Delta U_B/\Delta U_A=\frac{140}{60}=\frac73`

Errori e controllo: Tre settimi è il reciproco, due è Q_B/Q_A e tre mezzi è W_B/W_A. Centoquaranta è il numero di joule della variazione B, non il rapporto.

## 12 — Una media che qui conserva il bilancio

Le variazioni sono sessanta e centoquaranta joule. La semisomma è cento joule. Qui si può anche fare la differenza fra il calore medio centocinquanta e il lavoro medio cinquanta: il bilancio è lineare e dà lo stesso risultato. Questa proprietà non si estende automaticamente a modelli con prodotti o quadrati.

Passaggi: `\overline{\Delta U}=\frac{60+140}{2}\,\mathrm J\qquad \overline{\Delta U}=100\,\mathrm J\qquad \overline Q-\overline W=(150-50)\,\mathrm J`

Errori e controllo: Duecento è la somma, cinquanta dimezza ancora e ottanta è la differenza delle uscite. Centocinquanta è il solo calore medio, prima di togliere il lavoro medio.

## 13 — Il lavoro compatibile con il bersaglio

Il bersaglio per ΔU è sette terzi di sessanta joule, cioè centoquaranta. Da duecento joule entranti togliamo questo aumento e rimangono sessanta joule di lavoro. Il rapporto sessanta su quaranta è tre mezzi e soddisfa W_B>0.

Passaggi: `\Delta U_B=140\,\mathrm J\qquad W_B=Q_B-\Delta U_B\qquad W_B=60\,\mathrm J\qquad W_B/W_A=\frac32`

Errori e controllo: Due terzi è il reciproco; sette terzi copia il bersaglio della variazione interna. Due darebbe W_B=80 J e quindi ΔU_B=120 J. Sessanta è un lavoro in joule, non il rapporto adimensionale.

## 14 — Tarare una misura della variazione interna

Il riferimento ha ΔU=60 J e fissa q=3 J⁻¹. La nuova lettura corrisponde a centoquaranta joule di aumento interno. Il calore deve fornire anche i sessanta joule di lavoro: il totale entrante è duecento joule.

Passaggi: `\Delta U_A=60\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad \Delta U_B=140\,\mathrm J\qquad Q_B=\Delta U_B+W_B\qquad Q_B=200\,\mathrm J`

Errori e controllo: Centoquaranta omette l’energia uscita come lavoro. Usare S=420 come joule e sommare sessanta darebbe 480 J, ignorando il guadagno. La calibrazione si riferisce a ΔU e non direttamente a Q.

## 15 — Un offset nella misura del bilancio

Le variazioni dei riferimenti sono sessanta e centoquaranta joule. La differenza centosessanta delle letture su ottanta joule dà q=2 J⁻¹; poi b=1. C equivale a centosessanta joule di aumento di U. Aggiungendo i quaranta joule di lavoro si ricavano duecento joule entranti come calore.

Passaggi: `q=\frac{281-121}{(140-60)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad \Delta U_C=160\,\mathrm J\qquad Q_C=160\,\mathrm J+40\,\mathrm J\qquad Q_C=200\,\mathrm J`

Errori e controllo: Centosessanta è l’aumento interno prima di aggiungere W. Cento J darebbero S=121 e quattrocento J S=721. 401/2 J omette l’offset e ricostruisce S=322 invece di 321.

## 16 — Un vincolo fra calore e lavoro

Sostituendo Q nel bilancio resta ΔU=(5/2)W−W=(3/2)W. Per isolare il lavoro moltiplichiamo sessanta per due terzi e otteniamo quaranta joule. Il calore corrispondente è cento joule: entrambi i trasferimenti rispettano i versi assegnati.

Passaggi: `\Delta U=\frac52W-W\qquad \Delta U=\frac32W\qquad W=\frac23\Delta U\qquad W=40\,\mathrm J\qquad Q=100\,\mathrm J`

Errori e controllo: Meno quaranta viola W>0. Sessanta copia ΔU e cento copia Q. Ventiquattro divide per cinque mezzi anziché per il coefficiente tre mezzi che rimane dopo la sottrazione.
