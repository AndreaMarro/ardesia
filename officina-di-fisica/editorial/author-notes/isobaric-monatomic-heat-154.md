# isobaric-monatomic-heat-154 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-01.json; SHA256 del file sorgente 3eed8f64e97002c31d1e55bb612508d5e71766fee62f3d02fc6c3e994b6be863. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 153–157 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06 e L07. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. C_V totale in J/K non va confuso con capacità molare o specifica. Il vincolo fra parametri della prova16 non rende la capacità una funzione della temperatura istantanea durante il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Il calore alimenta due contributi

Per il gas monoatomico l’energia interna cresce di tre mezzi di nRΔT. Il prodotto nRΔT vale venti joule: trenta restano come aumento di U. L’espansione a pressione costante compie inoltre venti joule di lavoro, perché pΔV=nRΔT. Il calore deve fornire entrambi i contributi: trenta più venti sono cinquanta joule.

Passaggi: `nR\Delta T=20\,\mathrm J\qquad \Delta U=\frac32nR\Delta T=30\,\mathrm J\qquad W=nR\Delta T=20\,\mathrm J\qquad Q=\Delta U+W\qquad Q=50\,\mathrm J`

Errori e controllo: Trenta J sono soltanto ΔU e venti J soltanto W. Usare C_V al posto di C_p per Q omette l’energia trasferita all’ambiente mediante il pistone. Non si moltiplica di nuovo per n: il prodotto nR lo include già.

## 02 — L’unità del calore isobaro

Il fattore cinque mezzi non ha dimensioni. I kelvin si cancellano nel prodotto e rimangono joule, l’unità di un trasferimento energetico. Le moli sono già comprese nel prodotto assegnato nR.

Passaggi: `[nR]=\mathrm{J/K}\qquad [Q]=\mathrm{(J/K)K}\qquad [Q]=\mathrm J`

Errori e controllo: J/K è capacità totale, K intervallo termico e J/(mol·K) capacità molare. W misura energia per tempo: nessuna durata entra nel prodotto richiesto.

## 03 — L’energia interna non coincide con il calore

Qui viene chiesta l’energia interna, non il calore. La capacità a volume costante descrive comunque la variazione di U del gas ideale fra le temperature considerate: vale tre J/K. Moltiplicando per due kelvin si ottengono sei joule, anche se il processo reale è isobaro. In questo processo si compiono anche quattro joule di lavoro e servono dieci joule di calore.

Passaggi: `C_V=\frac32nR=3\,\mathrm{J/K}\qquad \Delta U=C_V\Delta T\qquad \Delta U=6\,\mathrm J\qquad W=4\,\mathrm J\qquad Q=10\,\mathrm J`

Errori e controllo: Dieci J risponde alla domanda su Q e quattro J a quella su W. Zero confonde pressione costante con temperatura costante; dodici raddoppia l’aumento di U. C_V può essere usata per ΔU del gas ideale senza imporre un percorso isocoro.

## 04 — Cambiare la quantità di gas fra prove

A parità di intervallo, sia l’aumento di U sia il lavoro sono proporzionali a nR. Raddoppiando la quantità di gas fra i campioni si raddoppia quindi anche il calore. A richiede cinquanta joule e B cento, senza cambiare n all’interno della singola prova chiusa.

Passaggi: `Q_A=\frac52(2\,\mathrm{J/K})(10\,\mathrm K)\qquad Q_A=50\,\mathrm J\qquad Q_B=100\,\mathrm J`

Errori e controllo: Cinquanta ignora il nuovo campione, venticinque inverte la dipendenza e duecento attribuisce un secondo raddoppio a ΔT. Lo zero non è compatibile con il riscaldamento positivo.

## 05 — Ricostruire il prodotto nR

Dal calore isobaro isoliamo nR moltiplicando per due e dividendo per cinque e per l’intervallo. Cento joule divisi per cinquanta kelvin danno due J/K. Il controllo restituisce cinquanta joule senza richiedere il valore numerico di R o il numero di moli separato.

Passaggi: `Q=\frac52nR\Delta T\qquad nR=\frac{2Q}{5\Delta T}\qquad nR=\frac{100\,\mathrm J}{50\,\mathrm K}\qquad nR=2\,\mathrm{J/K}`

Errori e controllo: Q/ΔT darebbe cinque J/K, che è C_p del campione e non nR. Usare il coefficiente tre mezzi ricaverebbe il parametro da un’energia interna, mentre il dato è un calore.

## 06 — Il riscaldamento dal calore

La capacità totale a pressione costante è cinque J/K. Ogni kelvin richiede quindi cinque joule; cinquanta diviso cinque sono dieci kelvin. Non si ricava la temperatura assoluta finale senza quella iniziale.

Passaggi: `C_p=\frac52nR=5\,\mathrm{J/K}\qquad \Delta T=\frac Q{C_p}\qquad \Delta T=10\,\mathrm K`

Errori e controllo: Venticinque kelvin usa nR al posto di C_p. Il coefficiente tre mezzi darebbe cinquanta terzi kelvin e confonderebbe Q con ΔU. Non si applica un offset Celsius a questa differenza.

## 07 — Stesso campione, intervallo doppio

A richiede cinquanta joule e B cento. Il rapporto vale due: la capacità totale C_p non cambia e il calore segue linearmente l’intervallo termico. L’espansione compresa nel modello non introduce un ulteriore quadrato.

Passaggi: `Q_A=50\,\mathrm J\qquad Q_B=100\,\mathrm J\qquad Q_B/Q_A=2`

Errori e controllo: Un mezzo inverte le prove; quattro quadra il raddoppio; uno lo ignora. Meno due contraddice i due calori entranti positivi.

## 08 — Correggere una proposta di 100 J

Il prodotto nRΔT è venti joule e cinque mezzi di venti sono cinquanta. La proposta eccede il valore corretto di cinquanta joule. Il fatto che Q sia diverso da ΔU è già incluso nel coefficiente cinque mezzi: non occorre raddoppiare ancora.

Passaggi: `Q=\frac52(20\,\mathrm J)\qquad Q=50\,\mathrm J\qquad e=(100-50)\,\mathrm J\qquad e=50\,\mathrm J`

Errori e controllo: Meno cinquanta cambia l’ordine della sottrazione. Cento è la proposta, zero la accetta e venticinque dimezza nuovamente lo scarto.

## 09 — L’inversa che conserva il coefficiente

Moltiplichiamo per due quinti e poi dividiamo per ΔT positivo. Il risultato ha J/K, la dimensione di nR. Nella sostituzione il prodotto cinque mezzi per due quinti si riduce a uno e ricostruisce esattamente Q.

Passaggi: `\frac25Q=nR\Delta T\qquad nR=\frac{2Q}{5\Delta T}\qquad [nR]=\mathrm{J/K}`

Errori e controllo: Il tre usa il coefficiente di ΔU al posto di quello di Q. Q/ΔT è C_p; cinque mezzi anziché due quinti moltiplica per il coefficiente invece di invertirlo. Q/(5ΔT) perde il fattore due necessario.

## 10 — Scalare due ingressi del calore

Ogni calore contiene lo stesso coefficiente cinque mezzi. Nel rapporto esso si cancella insieme agli ingressi di A. Restano il fattore della quantità di gas e quello dell’intervallo, moltiplicati una sola volta.

Passaggi: `Q_B=\frac52\kappa_1nR_A\kappa_2\Delta T_A\qquad Q_A=\frac52nR_A\Delta T_A\qquad Q_B/Q_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti invertono una delle dipendenze. La somma dà due per prove identiche; mantenere cinque mezzi nel rapporto dimentica che quel coefficiente compare anche nel denominatore.

## 11 — Due raddoppi, un rapporto energetico

Il riferimento assorbe cinquanta joule. B ha prodotto nRΔT pari a ottanta joule e quindi richiede duecento joule di calore. Duecento su cinquanta è quattro, prodotto dei due raddoppi.

Passaggi: `Q_A=50\,\mathrm J\qquad Q_B=\frac52(80\,\mathrm J)\qquad Q_B=200\,\mathrm J\qquad Q_B/Q_A=4`

Errori e controllo: Due considera un solo ingresso; duecento è il numero di joule del secondo processo. Un quarto dà il rapporto inverso.

## 12 — Mediare due apporti di calore

I calori sono cinquanta e duecento joule. La somma duecentocinquanta divisa per due dà centoventicinque joule. Inserire invece nR medio di tre J/K e ΔT medio di quindici K darebbe duecentoventicinque mezzi di joule: il prodotto degli ingressi medi non conserva qui la media delle uscite.

Passaggi: `Q_A=50\,\mathrm J\qquad Q_B=200\,\mathrm J\qquad \overline Q=\frac{50+200}{2}\,\mathrm J\qquad \overline Q=125\,\mathrm J`

Errori e controllo: Duecentocinquanta è la somma, 125/2 dimezza ancora e centocinquanta è la differenza. 225/2 usa una terza configurazione con ingressi medi.

## 13 — Il secondo ingresso per il bersaglio

Il bersaglio è duecento joule. La nuova capacità C_p vale dieci J/K, perciò occorrono venti kelvin, il doppio dell’intervallo iniziale. Il raddoppio di nR fornisce un fattore due; serve un altro fattore due nell’intervallo.

Passaggi: `Q_B=200\,\mathrm J\qquad C_{p,B}=10\,\mathrm{J/K}\qquad \Delta T_B=20\,\mathrm K\qquad \Delta T_B/\Delta T_A=2`

Errori e controllo: Un rapporto quattro darebbe Q_B=8Q_A, perché raddoppierebbe già anche nR. Un rapporto uno produrrebbe soltanto Q_B=2Q_A.

## 14 — Dal display al prodotto nR

Il riferimento assorbe cinquanta joule e fissa q=3 J⁻¹. La nuova lettura significa duecento joule. Togliendo il fattore cinque mezzi e i venti kelvin dall’energia si ottiene nR_B=4 J/K.

Passaggi: `Q_A=50\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad Q_B=200\,\mathrm J\qquad nR_B=\frac{2Q_B}{5\Delta T_B}\qquad nR_B=4\,\mathrm{J/K}`

Errori e controllo: Usare 600 come joule darebbe dodici J/K. Q_B/ΔT_B=10 J/K è invece C_p,B e conserva il coefficiente cinque mezzi: non è nR_B.

## 15 — Guadagno, offset e quantità di gas

A e B richiedono cinquanta e duecento joule. La differenza delle letture è trecento per centocinquanta joule: q=2 J⁻¹, poi b=1. La prova C corrisponde a cento joule; due quinti di cento, divisi per dieci kelvin, danno quattro J/K.

Passaggi: `q=\frac{401-101}{(200-50)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_C=100\,\mathrm J\qquad nR_C=\frac{2Q_C}{5\Delta T_C}\qquad nR_C=4\,\mathrm{J/K}`

Errori e controllo: Due, otto e cinque J/K darebbero rispettivamente S=101, 401 e 251. 201/50 J/K omette l’offset e ricostruirebbe S=202. Il confronto va eseguito con entrambe le tarature rispettate.

## 16 — Un vincolo fra campioni preparati

Sostituendo la quantità scelta per il campione si ottiene Q=(5/2)c(ΔT)². Il coefficiente cinque mezzi per un quinto è un mezzo di J/K². Cinquanta joule equivalgono quindi a cento kelvin quadrati nel quadrato dell’intervallo. La radice positiva è dieci kelvin; il campione ha nR=2 J/K.

Passaggi: `Q=\frac52c(\Delta T)^2\qquad (\Delta T)^2=\frac{2Q}{5c}\qquad (\Delta T)^2=100\,\mathrm{K^2}\qquad \Delta T=10\,\mathrm K\qquad nR=2\,\mathrm{J/K}`

Errori e controllo: La radice negativa viola sia ΔT>0 sia nR>0. Cento è il numero del quadrato e non dell’intervallo; cinque e venti kelvin darebbero 25/2 J e 200 J. Il vincolo fra preparazioni non introduce un’integrazione durante il percorso.
