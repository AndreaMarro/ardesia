# Collaudo dei dieci banchi

Verifica locale del 22 novembre 2026, dalla baseline `237f18c562946763d60e861a83fc47ef11da63ce`. Chrome 157.0.8103.80 e Playwright 1.60 su macOS 26.0.1. Il contesto WebGL del browser ha identificato **ANGLE Metal, Apple M1**. Il tablet e lo smartphone sono viewport con touch emulato sullo stesso Mac. Il database temporaneo di ciascuna suite viene creato dal seed dell’app.

## Risultati

| Prova | Esito |
| --- | --- |
| `node --test tests/*.test.js` | 38/38. Dieci confronti analitici specifici e dieci prove del contratto dei modelli 3D, insieme ai 18 test preesistenti. |
| `python3 -m unittest discover -s tests` | 19/19. Compresi copertura delle singole voci, riferimenti editoriali, validazione, installazione su database esistente e permessi di lettura. |
| `node tests/browser-banchi.mjs` | Dieci banchi × tre viewport con WebGL. Dieci percorsi ulteriori senza WebGL, inclusi risposta errata, correzione e trasferimento. Zero errori JavaScript non gestiti e zero richieste esterne. |
| `node tests/browser.mjs` | Superati studio, soluzioni progressive, formule inverse, grafici, quiz e recupero, accessi da due client, ordine di bonifico, conferma e download, cinque banchi guidati e simulazione C6 con 31 quesiti. |
| `node tests/editor.mjs` | Superati bozza, anteprima, allegati, riuso, pubblicazione, riordino, ritiro, ripristino, versioni e importazione atomica. |
| `python3 tools/validate_bank.py` e `node tools/check-formulas.cjs` | 810 record editoriali e 747 formule della banca verificati. I calcoli dinamici dei nuovi banchi hanno test numerici dedicati. |
| `python3 tools/audit_didattico.py` | Tutti i 105 obiettivi della matrice MUR hanno collegamenti a lezioni, esempi e quesiti. L’audit segnala anche le schede preesistenti candidate a revisione per lunghezza o numero di blocchi. |
| `python3 tools/verifica_pdf.py` | 13 PDF con impronta corrente, corrispondenza delle pagine e delle chiavi. Tutti e 13 i download controllati anche in browser. |

Le prove con modello congelato confrontano i risultati dopo campionamenti a 24, 60 e 120 Hz. Le prove in browser confrontano le letture numeriche prima e dopo aver cambiato orientamento e zoom. Gli esempi numerici e i limiti sono riportati per ogni banco nella scheda di consegna. [Verifiche per fenomeno](README.md) · [Test di fisica](../../tests/banchi.test.js) · [Test editoriali](../../tests/test_banchi.py)

## Misure di rendering

| Vista | Apertura del primo banco | Intervallo sui dieci banchi | Rotazione da tastiera | Riproduzione con tempo fisico |
| --- | ---: | ---: | ---: | ---: |
| Desktop 1440 × 960 | 223 ms | 83–236 ms | 60 fotogrammi/s | 59 fotogrammi/s |
| Tablet 810 × 1080 | 196 ms | 81–196 ms | 60 fotogrammi/s | 59–63 fotogrammi/s |
| Smartphone 390 × 844 | 129 ms | 85–209 ms | 60 fotogrammi/s | 59–64 fotogrammi/s |

I tempi vanno dal cambio di route al primo disegno WebGL osservato, sul server locale. Ogni formato inizia da un nuovo contesto browser su una lezione. La rotazione è campionata su 15 callback consecutivi. La riproduzione è misurata su una finestra di circa 220 ms nei quattro esperimenti temporali. L’allineamento con il primo fotogramma e l’arrotondamento incidono su una finestra così breve. Queste misure descrivono la sessione sul Mac. [30 misure grezze, GPU e allocazioni](prove/misure.json)

- Three.js e OrbitControls occupano insieme **758 751 byte** di JavaScript servito. La somma gzip teorica dei tre file è 187 396 byte. Il server locale utilizzato serve i file alle dimensioni originali. Modello e scena del banco selezionato occupano tra 3,2 e 8,1 kB prima della compressione.
- L’apertura della lezione non richiede il motore, le scene o i modelli dei banchi. Durante la navigazione a un esperimento viene richiesto solo il suo modello e il suo modulo grafico. La tavola alternativa completa funziona su un browser privo di WebGL 2 con le richieste verso origini esterne bloccate.
- Con la scena visibile sono stati osservati fra 49 e 208 buffer WebGL, fra 7 e 11 texture e fra 3 e 7 programmi. Il test conta creazioni e rilasci delle risorse. Dopo l’uscita i buffer e i programmi del banco risultano eliminati. Le sole quattro texture predefinite interne di Three.js r180 sono invalidate quando il contesto viene rilasciato. Il test verifica anche questa invalidazione.
- Nei banchi temporali selezionati il contatore dei disegni si ferma a strumento completamente fuori schermo e con documento nascosto, poi riprende quando lo strumento torna visibile. Dopo l’uscita il contesto risulta perso e il vecchio canvas riceve zero ulteriori disegni. Le scene statiche vengono ridisegnate su interazione o resize.

## Verifica d’uso

Per tutti i dieci banchi sono stati provati trascinamento, pinch touch, tastiera, zoom, viste predefinite, azzeramento dei parametri e passaggio da verticale a orizzontale. La suite verifica il cambio dell’immagine del canvas dopo il gesto, l’invarianza delle letture e l’assenza di scorrimento orizzontale. Le schermate sono acquisizioni reali dell’app. [Galleria con i tre formati per banco](README.md)

Il ritorno alla lezione ricolloca lo studente nel paragrafo aperto. In esercitazione conserva una risposta compilata prima dell’invio. In recupero conserva competenza, scenario e svolgimento aperto. L’osservazione scritta al banco del gas viene salvata tramite il registro del quaderno. Nel collaudo è emersa una sovrapposizione tra i richiami al 3D e la lettura un passaggio alla volta. Il richiamo è stato raggruppato con il suo paragrafo e il test preesistente ora passa integralmente.

Per ripetere le prove da `officina-di-fisica/` servono Python, Node con gli import JSON supportati, Chrome, le dipendenze di test da `npm ci` e Poppler per i PDF. Per raccogliere immagini e dati in una directory propria:

```sh
ASTRA_SHOTS=/tmp/officina-banchi-prove node tests/browser-banchi.mjs
```

Restano da valutare con un gruppo di studenti la comprensibilità dei passaggi e le prestazioni su dispositivi mobili fisici, specialmente telefoni con GPU e memoria limitate.
