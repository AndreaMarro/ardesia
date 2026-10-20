# 11. Kirchhoff e Arduino: usare REA senza frammentare i motori

## Ruolo di Kirchhoff
Kirchhoff resta un verificatore e insegnante specialistico collegato al Core, non il prerequisito di qualunque corso. La sua consegna storica dichiara 15 famiglie parziali, 6 non supportate, nessuna completa; i check software non equivalgono a efficacia didattica. L’aggiornamento deve partire da capability effettive e corpus di prova, non da rifare un simulatore spettacolare.

## Tre pacchetti di indagine/implementazione
**K1 — Procedimento e disegno sincronizzati:** Circuit Tutor + MathOnWeb + svolgimenti propri. Ricostruire selezione del nodo/ramo, equazione collegata, principio fisico, evidenza e passo alternativo. Separare `CircuitIR` da `DiagramIR`: spostare un simbolo non cambia topologia. Output: StudentTrace con errori localizzati e un diagramma coerente.

**K2 — Osservazione e simulazione:** EveryCircuit/Falstad/CircuitLab. Studiare orientamenti, animazione, scale e feedback ai parametri. Riusare solo codice con diritti compatibili; una animazione non è un oracolo. Output: dati verificati pilotano il disegno, non il contrario.

**K3 — Kernel e confronto:** autoCircuits per le famiglie esposte; Lcapy/SymPy/ngspice per sorgenti/autorizzazione/oracoli nei casi supportati. REA traccia import e flussi dei componenti disponibili, confronta contratti e release; le risposte devono superare invarianti KCL/KVL/potenza e metamorphic tests. Due verificatori con lo stesso kernel non sono indipendenza piena.

Foto di circuito: originale → candidati netlist con localizzazione → conferma umana o stato ambiguo → solve. Non usare un valore di confidence come probabilità scientifica calibrata. Un nuovo input invalida ogni derivato. DC, AC e Laplace restano capability separate con condizioni e unità.

## Arduino dopo i primi corsi
Obiettivo: assemblare un circuito, modificare codice, simulare, osservare risultato e discutere cosa cambia. Riferimenti: Wokwi, Tinkercad Circuits, SimulIDE, Blockly e percorsi ELAB pubblicamente osservabili/autorizzati. Distinguere esecuzione simulata, hardware fisico e dispositivi remoti.

Del sito ELAB sono utili come domande di ricerca: sequenza esperimento, regia docente/LIM, checklist componenti, risultato atteso vs misurato, manuale contestuale e rapporto. La pagina dinamica pubblica non è stata percorsa dall’interno in questa sessione. I materiali di Riccardo non sono stati scaricati né dichiarati riutilizzabili.

L’accesso tecnico a una repository o un mirror nel monorepo non dimostra paternità o diritti commerciali. Riscrivere un manuale non trasferisce diritti sul codice. Prima di usare una parte ELAB: file/SHA/origine/autori/licenza/autorizzazione; in assenza, osservazione consentita e ricostruzione originale o componente alternativo licenziato. La genealogia e gli avvisi non vengono rimossi.

Questa separazione non riduce l’ambizione: rende possibile avanzare sul prodotto vendibile senza introdurre una dipendenza contestata o un nuovo solver non testato.
