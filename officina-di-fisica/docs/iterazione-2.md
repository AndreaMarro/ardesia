# Iterazione 2 · Soluzioni C1 e attività di metodo

La banca C1 comprende 100 quesiti distribuiti in dieci competenze, con dieci quesiti per competenza. Sono stati esaminati consegne e svolgimenti per selezionare un caso per area. Il lotto contiene **10 soluzioni riscritte** e **10 nuove attività**. C1-Q027 resta il riferimento della prima iterazione.

## Task 3 · Dieci soluzioni

| ID | Competenza e passaggio da imparare | Risposta verificata |
|---|---|---|
| C1-Q008 | Misure. Dividere per il tempo al quadrato e reinserire le unità nel modello | m/s² |
| C1-Q013 | Vettori. Costruire B − A dalla punta di A alla punta di B, poi applicare Pitagora | 5 m |
| C1-Q023 | Cinematica. Distinguere il segno della velocità dal suo avvicinamento allo zero | Il punto procede verso x minori e rallenta |
| C1-Q034 | Caduta libera. Sottrarre le posizioni agli estremi del secondo intervallo | 15 m |
| C1-Q044 | Forze. Proiettare peso, tiro e reazione sull’asse verticale | 38 N |
| C1-Q056 | Elasticità. Isolare l’allungamento, convertire in cm e sottrarlo alla lunghezza tirata | 11 cm |
| C1-Q064 | Lavoro. Scomporre il trapezio forza–posizione in un rettangolo e un triangolo | 2,4 J |
| C1-Q077 | Energia. Togliere l’energia potenziale, poi estrarre la radice per ricavare la rapidità | 3 m/s |
| C1-Q083 | Quantità di moto. Bilanciare gli impulsi interni e interpretare la velocità negativa | −2 m/s |
| C1-Q095 | Statica. Scegliere il perno e confrontare i due bracci perpendicolari | 7,5 N |

**Standard per la redazione.** Cominciare dal fenomeno, dai dati e dall’incognita. Scegliere una rappresentazione che renda visibile il passaggio difficile. Esplicitare l’ipotesi fisica, l’operazione algebrica e le unità. Verificare il risultato con una strada breve e riconoscere l’errore che quella strada rivela. Per esempio, in Q064 l’area scomposta dà 0,8 + 1,6 J. La forza media di 6 N per 0,40 m restituisce lo stesso risultato.

Ogni soluzione usa blocchi nativi in due momenti di lettura. Le 20 tavole mostrate comprendono 18 nuovi SVG e 2 grafici ripresi dalle consegne. Nell’editor, tenere la figura e la sua didascalia nello stesso blocco e collocare subito dopo il testo che la interpreta. Confrontare la sequenza dei blocchi con «Mostra tutto» prima di pubblicare.

La seconda versione viene attivata su un database esistente solo se la prima corrisponde all’edizione originale e non ci sono bozze o versioni successive. I tentativi restano associati alla versione su cui lo studente ha risposto.

## Task 4 · Dieci attività

Ogni microcorso espone le due attività in **Formule e grafici → Mettiti alla prova**. C6 rimanda ai contenuti dei corsi di origine. Un errore mantiene aperto il passaggio e restituisce un indizio. Dopo una risposta corretta compaiono la verifica ragionata e il comando per continuare.

| Corso | Formula inversa | Grafico | Passaggi formula + grafico |
|---|---|---|---|
| C1 | Massa dal secondo principio | Velocità–tempo, accelerazione e spostamento | 5 + 4 |
| C2 | Profondità dalla pressione assoluta | Pressione relativa–profondità e pendenza | 6 + 4 |
| C3 | Temperatura del gas ideale | Pressione–volume e lavoro di espansione | 6 + 4 |
| C4 | Resistenza dalla legge di Ohm | Corrente–tensione, conduttanza e inversione degli assi | 6 + 4 |
| C5 | Lunghezza d’onda dalla frequenza | Profilo spaziale e traccia temporale della stessa onda | 5 + 5 |

Sono **49 passaggi con risposta**, di cui 28 sulle formule e 21 sui grafici. Le cinque attività grafiche hanno ciascuna tre fasi visive. Le schede si trovano nell’archivio autore con ID da `C1-M-formula` a `C5-M-formula` e da `C1-M-graph` a `C5-M-graph`. Per creare una variante, aprire la scheda e scegliere **Crea da questa attività**. Domande, risposte, indizi, spiegazioni e dati del grafico sono modificabili. L’anteprima è interattiva e la pubblicazione usa il normale ciclo bozza/versione.

Il correttore simbolico opera sui simboli dichiarati nella scheda e su costanti intere, somme, differenze, prodotti, quozienti, parentesi e potenze intere da 1 a 4. I denominatori supportati si riducono a monomi non nulli per i dati assegnati. Confronta esattamente i polinomi dopo il prodotto incrociato. Ad esempio, per Stevino accetta sia `(p-p0)/(rho*g)` sia `p/(g*rho)-p0/(g*rho)`. L’allenamento si può ripetere e il riepilogo resta nella pagina aperta.

## Collaudo

| Prova | Riscontro |
|---|---|
| Chrome con Playwright, desktop 1440 × 960 e mobile 390 × 844 | Tutte le dieci soluzioni confrontate blocco per blocco in lettura integrale e progressiva. Tutte le dieci attività completate sui due formati, con errore e recupero a ciascun passaggio. |
| Regressione Task 1–2 | Entrambi i percorsi di C1, sezione metodo, invio di 2 m per Q027, quattro tavole, controlli avanti/indietro e ripristino integrale. |
| C6 e suite generale | Dall’ingresso C6 si apre «Apri le lezioni», si contano sei volumi, si apre una lezione C3 e si torna ai volumi dal percorso di navigazione. Anche simulazione, laboratori, area autore e download dei 13 fascicoli sono esercitati. Tablet 810 × 1080 incluso nella suite. |
| Editor | Nuova attività da copia, modifica della consegna, anteprima, salvataggio in bozza e pubblicazione. Il test verifica la visibilità della nuova scheda solo dopo la pubblicazione. |
| Banca e stampa | 800 record, 747 formule LaTeX. Rigenerati i cinque eserciziari C1–C5 già presenti. Il controllo Poppler verifica i 13 fascicoli, comprese corrispondenza del contenuto, chiavi, indici e impaginazione. |
| Test JavaScript/Python | 18 test JavaScript e 16 test Python, inclusi equivalenza algebrica, chiavi numeriche, aggiornamento idempotente, conservazione dei tentativi e versioni personalizzate. |

Dalla cartella dell’app eseguire `node --test tests/*.test.js`, `python3 -m unittest discover -s tests`, `python3 tools/validate_bank.py`, `node tools/check-formulas.cjs`, `node tests/browser.mjs`, `node tests/editor.mjs` e `python3 tools/verifica_pdf.py`. Per salvare le schermate impostare `ASTRA_SHOTS` su una directory di output prima del test browser.

### Screenshot di Chrome

| Soluzioni | Attività |
|---|---|
| [C1-Q064, due passaggi su desktop](verifiche/iterazione-2/soluzione-desktop.webp) | [Stevino, espressione equivalente su desktop](verifiche/iterazione-2/formula-desktop.webp) |
| [C1-Q013, due passaggi su smartphone](verifiche/iterazione-2/soluzione-mobile.webp) | [Stevino su smartphone](verifiche/iterazione-2/formula-mobile.webp) |
| [Corrente–tensione su desktop](verifiche/iterazione-2/grafico-desktop.webp) | [Profilo spaziale e temporale su smartphone](verifiche/iterazione-2/grafico-mobile.webp) |

Il collaudo misura il comportamento dell’app in Chrome. L’efficacia didattica con studenti reali resta da valutare.
