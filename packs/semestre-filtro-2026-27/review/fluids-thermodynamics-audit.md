# Revisione mirata: fluidi e termodinamica

## Esito e perimetro

La sezione comprende **92 modelli fisici**: 50 di fluidi e 42 di termodinamica, da cui sono previsti **1472 quesiti**, 368 per ciascuno dei quattro livelli. Sono presenti 32 domande concettuali con contesto indipendente e 11 sostituzioni individuali di compiti generici. La revisione è assistita da AI; non è una certificazione scientifica umana indipendente e non comprende una calibrazione empirica della difficoltà.

Sono state controllate le relazioni, le conversioni, le condizioni fisiche e i domini dei 92 modelli. È stato esaminato il build intermedio U3/U5, con attenzione ai problemi inversi simmetrici, alle condizioni dei concettuali e alla compatibilità con il vincolo senza calcolatrice. Il generatore aggiornato ha costruito e validato gli 11 task individuali senza errori strutturali: le relative soluzioni contengono 398–499 parole. I controlli su campioni e formule non provano da soli la correttezza scientifica generale.

## Correzioni sostanziali

- Le temperature radiative normalizzate θ=T/(100 K) sono ora dichiarate adimensionali. Il coefficiente della potenza netta è espresso in watt.
- I 32 concettuali hanno ipotesi, legge, spiegazione, errori tipici e classificazione propri. Le condizioni numeriche di un modello non passano a una domanda che studia un diverso caso limite: per esempio, l’equilibrio radiativo ammette temperature uguali e il profilo viscoso viene valutato anche sull’asse e sulla parete.
- Quattro inversi che ripetevano essenzialmente lo scambio di etichette sono sostituiti da compiti su ripartizione della pressione, chiusura di un ramo a pressione fissata, getti da quote complementari e ripartizione finale delle molecole.
- I due vincoli che avrebbero introdotto z·ln(z) sono sostituiti da trasformazioni composte: un ciclo con due isoterme e un confronto fra espansione reversibile e libera. Le soluzioni espongono i bilanci e usano logaritmi di due e quattro, senza inversioni trascendenti nascoste.
- Sono stati aggiunti quesiti mirati su incomprimibilità, capacità termica, segno del lavoro isobaro inverso, entropia come funzione di stato, variazioni simultanee di lunghezza e raggio a portata fissata e distinzione fra energia interna, calore e lavoro.
- I rapporti fra letture Celsius vengono qualificati come rapporti di coordinate numeriche, distinti dai rapporti termodinamici fra temperature assolute.

## Programma e prove storiche

[La mappa U3/U5](../sources/coverage-u3-u5.json) contiene tutti 48 argomenti del programma verificato. La capillarità e l’adiabatica ricevono anche supporto quantitativo con legge fornita, distinguendolo dalla richiesta qualitativa. Il concetto qualitativo di Laplace resta nel nucleo del programma.

[La mappa delle prove 2025](../sources/exams-2025-coverage.json) collega tutti 62 obiettivi a quesiti concreti: 48 coperture dirette, 6 estensioni con legge fornita, 4 coperture ottenute attraverso più quesiti, 2 adattamenti, 1 riformulazione per eliminare un’ambiguità e 1 adattamento Doppler con legge esatta fornita. Non afferma che ogni nuovo quesito riproduca il contesto o il procedimento preciso di quello storico. Gli adattamenti sono dichiarati uno per uno.

Reynolds, energia cinetica molecolare e confronto gas reale/ideale sono trattati come approfondimenti collegati al 2025, senza attribuirli automaticamente ai requisiti espliciti del 2026. I fascicoli storici sono fonti di obiettivi e stile, non una chiave ufficiale autenticata.

## Numeri, fonti e limiti

Nel build intermedio non sono stati trovati risultati razionali con numeratore maggiore di 10000 nei 1472 record. Le sole frazioni con denominatore maggiore di 100 erano 1/200, 1/150 e 1/300: sono mantenute esatte e non richiedono approssimazioni decimali. Costanti simboliche e radici restano esplicite quando richiesto.

I quattro PDF accessibili contano 429, 576, 768 e 133 pagine. Sono stati letti indici e campioni mirati, con OCR selettivo per il PDF scansionato. Non si afferma una lettura esaustiva di tutte le pagine. L’eserciziario Testbustes nominato non risultava disponibile. Nessun PDF protetto o estratto integrale è stato inserito nel repository. Le fonti sono state controllate criticamente: i refusi individuati su decibel e riferimento della pressione non sono stati trasferiti ai nuovi quesiti.

La banca conserva le famiglie fisiche per evitare che esercizi vicini siano trattati come concetti indipendenti. I controlli di testo, firma e simmetrie evidenti non costituiscono una prova matematica di assenza di ogni somiglianza semantica. Gli ID delle mappe devono risolversi nel build finale comune. I dati dettagliati, i controlli e gli hash dei file revisionati sono nel [rapporto JSON](../sources/model-audit-u3-u5.json).
