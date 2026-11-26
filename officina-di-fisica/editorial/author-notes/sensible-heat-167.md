# sensible-heat-167 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-02.json; SHA256 del file sorgente 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 163–167 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06, L07, L08 e L09. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Quaranta joule trasferiti al corpo

La massa di due grammi moltiplica il calore specifico di due joule per grammo e kelvin: la capacità totale è quattro joule al kelvin. Per aumentare di dieci kelvin servono quindi quaranta joule. Il calore è il trasferimento attraverso il confine durante il processo; alla fine è aumentata l’energia interna, non una funzione di stato chiamata calore.

Passaggi: `C=mc\qquad C=(2\,\mathrm g)(2\,\mathrm{J/(g\,K)})\qquad C=4\,\mathrm{J/K}\qquad Q=C\Delta T\qquad Q=40\,\mathrm J`

Errori e controllo: Venti J dimenticano il fattore due della massa o del calore specifico. Ottanta J raddoppiano un dato già incluso. Non si moltiplica per una temperatura assoluta finale: la legge usa il suo incremento.

## 02 — Il calore specifico cancella grammi e kelvin

Nel prodotto m c ΔT il grammo della massa cancella quello al denominatore di c; anche il kelvin dell’incremento si cancella. Rimane il joule, unità di energia trasferita. Il valore c=2 J/(g·K) equivale a 2000 J/(kg·K), perché un chilogrammo contiene mille grammi.

Passaggi: `[Q]=\mathrm g\cdot\frac{\mathrm J}{\mathrm{g\,K}}\cdot\mathrm K\qquad [Q]=\mathrm J\qquad c=2000\,\mathrm{J/(kg\,K)}`

Errori e controllo: J/K misura la capacità totale, J/(g·K) il calore specifico, K l’incremento termico. W=J/s richiederebbe un tempo non assegnato. Cambiare unità di massa richiede convertire anche il valore del calore specifico.

## 03 — Sigillato alla materia, aperto agli scambi termici

La classificazione dipende dal confine scelto. Attraverso questo confine non passa materia: il sistema è chiuso. Le pareti consentono però scambio di energia come calore con il bagno esterno, dunque non è termicamente isolato. Non serve sapere il valore istantaneo o netto del calore per riconoscere questa possibilità di scambio.

Passaggi: `\Delta m_{\rm scambiata}=0\qquad Q\ \text{può attraversare il confine}`

Errori e controllo: Aperto richiederebbe scambio di materia, non soltanto di calore. Sigillato non equivale a isolato. Adiabatico escluderebbe il calore attraverso il confine, in contrasto con le pareti descritte; l’eventuale Q netto nullo da solo non proverebbe isolamento.

## 04 — Raddoppiare la massa del campione

Ogni grammo richiede lo stesso calore per lo stesso incremento. Il corpo B contiene il doppio della massa e ha capacità totale otto J/K anziché quattro. Per dieci kelvin assorbe ottanta joule, il doppio dei quaranta di A. La massa non cambia durante ciascuna prova chiusa.

Passaggi: `Q_A=(2)(2)(10)\,\mathrm J=40\,\mathrm J\qquad Q_B=(4)(2)(10)\,\mathrm J\qquad Q_B=80\,\mathrm J`

Errori e controllo: Venti J rende inversa la dipendenza dalla massa; 160 J raddoppia anche un secondo ingresso, qui fisso. Zero è incompatibile con m,c,ΔT tutti positivi.

## 05 — La massa dal calore assorbito

Il prodotto cΔT vale venti joule per grammo. Quaranta joule divisi per questi venti joule al grammo restituiscono due grammi. Le unità dell’inversa permettono di distinguere la massa dalla capacità totale del corpo.

Passaggi: `m=\frac{Q}{c\Delta T}\qquad c\Delta T=20\,\mathrm{J/g}\qquad m=\frac{40\,\mathrm J}{20\,\mathrm{J/g}}\qquad m=2\,\mathrm g`

Errori e controllo: Quattro è il numero della capacità totale in J/K, non della massa in g. Moltiplicare anziché dividere per cΔT non avrebbe dimensione di massa.

## 06 — L’incremento non è la temperatura finale

La capacità del corpo è quattro joule al kelvin. L’energia entrata di quaranta joule produce quindi dieci kelvin di aumento. Senza la temperatura iniziale non si conosce quella finale. Un incremento di dieci kelvin corrisponde anche a dieci gradi Celsius di differenza, senza aggiungere alcun offset.

Passaggi: `mc=4\,\mathrm{J/K}\qquad \Delta T=\frac{Q}{mc}\qquad \Delta T=40/4\,\mathrm K\qquad \Delta T=10\,\mathrm K`

Errori e controllo: Venti K omette la massa. Quaranta copia il valore dell’energia senza convertirlo in incremento. Aggiungere 273,15 a una differenza confonde intervalli e temperature assolute.

## 07 — Un incremento termico doppio

Le energie sono quaranta e ottanta joule. La massa e il calore specifico comuni si cancellano nel quoziente: il rapporto delle energie è quello degli incrementi, cioè due. Entrambi sono riscaldamenti, quindi il rapporto è positivo.

Passaggi: `Q_A=40\,\mathrm J\qquad Q_B=80\,\mathrm J\qquad Q_B/Q_A=\Delta T_B/\Delta T_A\qquad Q_B/Q_A=2`

Errori e controllo: Un mezzo rovescia il confronto, quattro introduce un quadrato assente e uno ignora il cambiamento. Il valore negativo non descrive due trasferimenti entranti come quelli dichiarati.

## 08 — Lo scarto di una proposta raddoppiata

La legge fornisce quaranta joule. Ottanta supera il risultato di quaranta joule, quindi lo scarto richiesto è positivo. Non è un calore ceduto: il segno appartiene al confronto fra proposta e modello.

Passaggi: `Q=40\,\mathrm J\qquad e=(80-40)\,\mathrm J\qquad e=40\,\mathrm J`

Errori e controllo: Meno quaranta esegue l’ordine opposto; ottanta copia la proposta. Zero la accetta e venti dimezza uno scarto già determinato.

## 09 — Isolare m senza perdere c

La massa moltiplica cΔT, fattore positivo non nullo. Dividiamo entrambi i membri per quel fattore. Q/(cΔT) ha unità g, perché cΔT misura joule per grammo. L’ultimo denominatore usa invece una temperatura assoluta, che non è l’incremento del modello.

Passaggi: `Q=mc\Delta T\qquad m=\frac{Q}{c\Delta T}\qquad [m]=\frac{\mathrm J}{\mathrm{J/g}}=\mathrm g`

Errori e controllo: Il prodotto ha dimensioni J²/g e il reciproco ha g⁻¹, non g. Q/ΔT dà la capacità totale in J/K. Sostituire T_f a ΔT non mantiene il significato fisico anche se ha la stessa unità.

## 10 — Un prodotto di due riscalamenti

Ogni ingresso entra alla prima potenza. Sostituendo massa e incremento della prova B, il loro prodotto porta i fattori κ₁ e κ₂. Dividendo per Q_A, massa, calore specifico e incremento iniziali si cancellano e resta κ₁κ₂.

Passaggi: `Q_B=(\kappa_1m_A)c(\kappa_2\Delta T_A)\qquad Q_A=m_Ac\Delta T_A\qquad Q_B/Q_A=\kappa_1\kappa_2`

Errori e controllo: I quozienti rendono inversa una dipendenza diretta. La somma dà due per prove identiche; il fattore κ₂² attribuisce all’incremento un quadrato che la legge non contiene.

## 11 — Massa e incremento raddoppiano insieme

A assorbe quaranta joule. In B i quattro grammi hanno capacità otto J/K e vengono scaldati di venti kelvin: assorbono 160 J. Il rapporto 160/40 è quattro, prodotto dei due raddoppi.

Passaggi: `Q_A=40\,\mathrm J\qquad Q_B=4\cdot2\cdot20\,\mathrm J\qquad Q_B=160\,\mathrm J\qquad Q_B/Q_A=4`

Errori e controllo: Due considera soltanto un raddoppio. 160 è un’energia, non il rapporto adimensionale; un quarto scambia B e A.

## 12 — La media delle due energie trasferite

I trasferimenti sono quaranta e centosessanta joule. Sommandoli otteniamo duecento, che diviso due dà cento joule. Gli ingressi medi sarebbero m=3 g e ΔT=15 K e produrrebbero novanta joule: quella è l’energia di un terzo processo, diversa dalla media richiesta.

Passaggi: `Q_A=40\,\mathrm J\qquad Q_B=160\,\mathrm J\qquad \overline Q=\frac{40+160}{2}\,\mathrm J\qquad \overline Q=100\,\mathrm J`

Errori e controllo: Duecento J è la somma, cinquanta divide due volte per due e sessanta fa metà della differenza. Novanta usa il prodotto degli ingressi medi: il prodotto non conserva in generale la media quando cambiano entrambi i fattori.

## 13 — Il bersaglio quadruplo con massa doppia

Il riferimento richiede quaranta joule e il bersaglio 160 J. La capacità totale di B è già doppia, otto J/K: per ottenere 160 J occorrono venti kelvin. Rispetto ai dieci iniziali, l’incremento è doppio. Il fattore quattro del calore non va applicato interamente a ΔT.

Passaggi: `Q_B=160\,\mathrm J\qquad m_Bc=8\,\mathrm{J/K}\qquad \Delta T_B=160/8\,\mathrm K\qquad \Delta T_B=20\,\mathrm K\qquad \Delta T_B/\Delta T_A=2`

Errori e controllo: Quattro come rapporto termico, insieme alla massa doppia, produrrebbe otto volte il calore di A. Uno produrrebbe soltanto il doppio, non il quadruplo.

## 14 — Dal display tarato alla massa

A assorbe quaranta joule: il guadagno è q=3 J⁻¹. La nuova lettura 480 rappresenta 160 J. Con ΔT=20 K, ogni grammo richiede quaranta joule; 160 diviso quaranta restituisce quattro grammi. Prima si interpreta il display, poi si inverte la legge fisica.

Passaggi: `Q_A=40\,\mathrm J\qquad q=3\,\mathrm{J^{-1}}\qquad Q_B=480/q=160\,\mathrm J\qquad m_B=\frac{Q_B}{c\Delta T_B}\qquad m_B=4\,\mathrm g`

Errori e controllo: Dividere direttamente 480 per cΔT darebbe dodici grammi, perché la lettura non è un’energia in joule. Due grammi restituirebbero S=240 nelle condizioni di B, non 480.

## 15 — Guadagno e offset prima della massa

Le energie dei riferimenti sono quaranta e centosessanta joule. La differenza delle letture 240 divisa per 120 J dà q=2 J⁻¹; il primo riferimento fissa b=1. Per C, sottratto l’offset, 160 diviso due dà 80 J. Ogni grammo richiede venti joule, dunque la massa è quattro grammi.

Passaggi: `q=\frac{321-81}{(160-40)\,\mathrm J}\qquad q=2\,\mathrm{J^{-1}}\qquad b=1\qquad Q_C=(161-1)/q\qquad Q_C=80\,\mathrm J\qquad m_C=4\,\mathrm g`

Errori e controllo: Otto grammi darebbero S=321 e due grammi S=81. 161/40 g omette l’offset e ricostruisce S=162. Ottanta grammi confonde il numero dell’energia con una massa e darebbe S=3201.

## 16 — La massa scelta in proporzione all’incremento

Il vincolo lega campioni e incrementi assegnati a prove diverse; non indica ingresso di materia durante il riscaldamento. Sostituendolo otteniamo Q=cd(ΔT)². Il prodotto cd vale due quinti di joule per kelvin quadrato: quaranta diviso due quinti dà cento kelvin quadrati. La radice fisica positiva è dieci kelvin e restituisce m=2 g.

Passaggi: `Q=cd(\Delta T)^2\qquad cd=\tfrac25\,\mathrm{J/K^2}\qquad (\Delta T)^2=100\,\mathrm{K^2}\qquad \Delta T=10\,\mathrm K\qquad m=2\,\mathrm g`

Errori e controllo: La radice negativa renderebbe negativi sia l’incremento sia la massa, fuori dominio. Cento è il numero del quadrato, non dell’incremento. Cinque e venti kelvin produrrebbero rispettivamente 10 J e 160 J sotto il vincolo, non 40 J.
