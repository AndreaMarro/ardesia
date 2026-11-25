# isochoric-heat-153 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-01.json; SHA256 del file sorgente 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 153–157 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06 e L07. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Riscaldare senza spostare il confine

La parete rigida non si sposta: il lavoro di espansione è zero. Il primo principio lascia quindi Q=ΔU. La capacità totale indica quanti joule servono per ogni kelvin; due joule per kelvin per dieci kelvin danno venti joule. L’energia entra durante il processo e aumenta U: non si attribuisce al gas una quantità di calore immagazzinata.

Passaggi: `W=0\qquad \Delta U=Q-W\qquad Q=C_V\Delta T\qquad Q=(2\,\mathrm{J/K})(10\,\mathrm K)\qquad Q=20\,\mathrm J`

Errori e controllo: Quaranta J richiederebbero C_V=4 J/K oppure ΔT=20 K, diversi dai dati. Non si moltiplica ancora per massa o moli: C_V appartiene già all’intero campione. Volume fermo non significa pressione ferma.

## 02 — L’unità del calore trasferito

Nel prodotto si cancellano i kelvin e rimane il joule. Il calore è un trasferimento di energia. La capacità termica misura energia per variazione di temperatura; il calore specifico aggiunge invece una divisione per massa.

Passaggi: `[C_V\Delta T]=\mathrm{(J/K)K}\qquad [Q]=\mathrm J`

Errori e controllo: K misura temperatura o intervallo termico, J/K capacità totale e J/(kg·K) calore specifico. W=J/s richiederebbe dividere l’energia per un tempo, che qui non compare.

## 03 — Un recipiente rigido può aumentare la pressione

Chiuso significa che non passa materia, non che non passa energia. La rigidità annulla il lavoro di espansione ma permette il riscaldamento. Per il campione ideale a n e V fissi, p è proporzionale alla temperatura assoluta: aumentando T cresce p. Gli urti molecolari esercitano forza sulla parete; senza spostamento della parete non producono lavoro di espansione.

Passaggi: `\Delta V=0\qquad W=0\qquad \Delta U=Q>0\qquad p=\frac{nRT}{V}`

Errori e controllo: Pressione costante è un vincolo diverso. Un isolamento termico imporrebbe Q=0; la semplice chiusura alla materia non lo impone. Nel modello assegnato, Q=0 contraddirebbe il riscaldamento senza lavoro. Maggiore agitazione non sostituisce lo spostamento del confine nella definizione del lavoro.

## 04 — Due campioni con capacità diversa

Le due capacità descrivono campioni preparati separatamente; non si cambia la quantità di gas nel corso della singola prova chiusa. B richiede quattro joule per kelvin invece di due. Con lo stesso aumento di dieci kelvin, il calore raddoppia da venti a quaranta joule.

Passaggi: `Q_A=(2\,\mathrm{J/K})(10\,\mathrm K)\qquad Q_A=20\,\mathrm J\qquad Q_B=(4\,\mathrm{J/K})(10\,\mathrm K)\qquad Q_B=40\,\mathrm J`

Errori e controllo: Venti ignora il nuovo campione, dieci rende inversa la dipendenza e ottanta raddoppia anche ΔT senza motivo. Zero contraddice capacità e incremento entrambi positivi.

## 05 — La capacità dall’energia entrata

Per trovare l’energia necessaria a un kelvin dividiamo i venti joule per i dieci kelvin effettivamente percorsi. Si ottengono due joule per kelvin. La sostituzione nella legge iniziale ricostruisce esattamente il calore misurato.

Passaggi: `C_V=\frac Q{\Delta T}\qquad C_V=\frac{20\,\mathrm J}{10\,\mathrm K}\qquad C_V=2\,\mathrm{J/K}\qquad (2\,\mathrm{J/K})(10\,\mathrm K)=20\,\mathrm J`

Errori e controllo: Moltiplicare Q per ΔT darebbe J·K, non J/K. Il reciproco ΔT/Q avrebbe K/J. Non occorre conoscere la massa per ricavare questa capacità totale.

## 06 — Un aumento, non la temperatura finale

Ogni kelvin richiede due joule. Venti diviso due dà dieci kelvin di aumento. La temperatura finale richiederebbe anche T_i, che non è assegnata; qui si determina soltanto la differenza. Un intervallo di dieci kelvin ha la stessa ampiezza di dieci gradi Celsius.

Passaggi: `\Delta T=\frac Q{C_V}\qquad \Delta T=\frac{20\,\mathrm J}{2\,\mathrm{J/K}}\qquad \Delta T=10\,\mathrm K`

Errori e controllo: Non si aggiunge 273,15 a un intervallo termico. Venti copia il valore dell’energia senza dividerlo per C_V; quaranta moltiplica anziché dividere. Nessuno di questi procedimenti ricostruisce Q=20 J.

## 07 — Raddoppiare l’intervallo termico

Il primo processo trasferisce venti joule e il secondo quaranta. Dividendo quaranta per venti si ottiene due. La capacità comune si cancella, perciò il rapporto coincide con quello degli incrementi termici.

Passaggi: `Q_A=20\,\mathrm J\qquad Q_B=40\,\mathrm J\qquad \frac{Q_B}{Q_A}=\frac{\Delta T_B}{\Delta T_A}=2`

Errori e controllo: Un mezzo inverte il confronto, quattro quadra una dipendenza lineare e uno ignora il cambiamento. Il rapporto non è negativo: entrambe le prove assorbono calore.

## 08 — Lo scarto di una proposta troppo alta

Il modello richiede venti joule. La proposta di quaranta supera il valore corretto di venti joule; lo scarto richiesto è dunque positivo. Il suo segno descrive una sovrastima e non una diversa convenzione per il calore.

Passaggi: `Q=20\,\mathrm J\qquad e=Q_{\rm proposto}-Q\qquad e=(40-20)\,\mathrm J\qquad e=20\,\mathrm J`

Errori e controllo: Meno venti esegue la sottrazione opposta. Quaranta copia la proposta, zero la accetta e dieci dimezza ancora lo scarto.

## 09 — La formula inversa per la capacità

ΔT è positivo, quindi possiamo dividere entrambi i membri per esso senza annullare un fattore nullo. L’unità di Q/ΔT è J/K, quella della capacità totale. Per esempio, venti joule su dieci kelvin restituiscono due J/K.

Passaggi: `Q=C_V\Delta T\qquad \frac Q{\Delta T}=C_V\qquad [C_V]=\mathrm{J/K}`

Errori e controllo: Il prodotto QΔT ha unità J·K e il reciproco ΔT/Q ha K/J. Le formule con il fattore due hanno unità corrette ma producono rispettivamente il doppio o la metà del calore assegnato quando si torna nella legge iniziale.

## 10 — Due fattori fra prove diverse

Scriviamo il prodotto completo in entrambe le prove. Il nuovo campione porta un fattore κ₁ e il nuovo intervallo porta κ₂. Entrambi agiscono alla prima potenza: dopo la cancellazione degli ingressi di A rimane il loro prodotto.

Passaggi: `Q_B=(\kappa_1C_{V,A})(\kappa_2\Delta T_A)\qquad Q_A=C_{V,A}\Delta T_A\qquad Q_B/Q_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti rendono inversa una dipendenza diretta. La somma darebbe due per prove identiche, mentre il rapporto deve essere uno; κ₂² introduce un quadrato dell’intervallo assente nella legge.

## 11 — Capacità e intervallo aumentano insieme

A assorbe venti joule; B ne assorbe ottanta. Il rapporto ottanta su venti è quattro. Si può anche moltiplicare il raddoppio della capacità per quello dell’intervallo termico.

Passaggi: `Q_A=20\,\mathrm J\qquad Q_B=(4\,\mathrm{J/K})(20\,\mathrm K)\qquad Q_B=80\,\mathrm J\qquad Q_B/Q_A=4`

Errori e controllo: Due tiene conto di un solo raddoppio. Ottanta è un’energia, non il rapporto adimensionale. Un quarto rovescia B e A.

## 12 — La media delle energie nelle due prove

I due trasferimenti sono venti e ottanta joule. La loro somma è cento e la metà è cinquanta joule. Gli ingressi medi sarebbero tre J/K e quindici K: il loro prodotto dà quarantacinque joule, che descrive una terza prova, non la media richiesta.

Passaggi: `Q_A=20\,\mathrm J\qquad Q_B=80\,\mathrm J\qquad \overline Q=\frac{20+80}{2}\,\mathrm J\qquad \overline Q=50\,\mathrm J`

Errori e controllo: Cento è la somma, venticinque dimezza ancora e sessanta è la differenza delle energie. Quarantacinque usa il prodotto degli ingressi medi: qui non coincide con la media delle uscite.

## 13 — L’intervallo per un bersaglio quadruplo

Il riferimento trasferisce venti joule e il bersaglio ne richiede ottanta. La capacità di B è già raddoppiata, quindi per arrivare a quattro volte l’energia resta un fattore due nell’intervallo. Ottanta diviso quattro J/K dà venti kelvin, il doppio dei dieci iniziali.

Passaggi: `Q_A=20\,\mathrm J\qquad Q_B=80\,\mathrm J\qquad \Delta T_B=\frac{80\,\mathrm J}{4\,\mathrm{J/K}}\qquad \Delta T_B=20\,\mathrm K\qquad \Delta T_B/\Delta T_A=2`

Errori e controllo: Un fattore quattro nell’intervallo insieme alla capacità doppia porterebbe a otto volte Q_A. Uno lascerebbe soltanto il raddoppio già dato dal campione.

## 14 — Tarare il display prima dell’inversa

A assorbe venti joule: sessanta unità di display su venti joule danno q=3 J⁻¹. La lettura duecentoquaranta corrisponde quindi a ottanta joule. Dividiamo questa energia per i venti kelvin di B e troviamo quattro J/K.

Passaggi: `Q_A=20\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad Q_B=\frac{240}{q}=80\,\mathrm J\qquad C_{V,B}=\frac{Q_B}{\Delta T_B}\qquad C_{V,B}=4\,\mathrm{J/K}`

Errori e controllo: Dividere direttamente 240 per 20 darebbe dodici, triplo del valore corretto: S non è espresso in joule. Il guadagno si applica alle energie, non agli incrementi termici.

## 15 — Separare guadagno e offset

Le energie dei riferimenti sono venti e ottanta joule. La differenza centoventi delle letture divisa per sessanta joule dà q=2 J⁻¹; dalla prima prova segue b=1. Per C togliamo l’offset e dividiamo per il guadagno: ottanta su due sono quaranta joule. Con dieci kelvin di aumento servono quattro J/K.

Passaggi: `q=\frac{161-41}{(80-20)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_C=\frac{81-1}{q}\qquad Q_C=40\,\mathrm J\qquad C_{V,C}=4\,\mathrm{J/K}`

Errori e controllo: Otto J/K produrrebbero S=161, due J/K darebbero S=41. 81/20 J/K omette l’offset e ricostruisce S=82. Quaranta J/K scambia il numero dell’energia con quello della capacità e darebbe S=801.

## 16 — Un vincolo fra preparazioni del campione

Sostituiamo la capacità scelta per la prova nel prodotto Q=C_VΔT. Si ottiene Q=c(ΔT)². Venti joule divisi per un quinto di joule per kelvin quadrato danno cento kelvin quadrati. La radice positiva è dieci kelvin e restituisce C_V=2 J/K. Non si integra una capacità variabile con T: all’interno del processo essa rimane costante.

Passaggi: `Q=c(\Delta T)^2\qquad (\Delta T)^2=\frac Qc\qquad (\Delta T)^2=100\,\mathrm{K^2}\qquad \Delta T=10\,\mathrm K\qquad C_V=2\,\mathrm{J/K}`

Errori e controllo: La radice negativa renderebbe negativi sia l’incremento sia C_V, fuori dominio. Cento è il numero del quadrato, non dell’intervallo. Cinque e venti kelvin darebbero rispettivamente Q=5 J e Q=80 J.
