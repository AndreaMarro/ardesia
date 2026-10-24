# Review indipendente landing e funnel composto

URL `http://127.0.0.1:5414/`, build composto fornito dal root. Viewport 360×800, 390×844, 820×1180, 1440×1000, Chromium 148, reduced-motion. Nessun edit prodotto, acquisto o invio di messaggi.

Percorso reale nelle quattro larghezze: primo viewport → indice Fluidi → scheda corso → lezione interattiva → previsione → risultato → Chiedi disponibilità → `/?percorso=fluidi-termodinamica#contatto` → scelta radio di un altro percorso. URL, radio, nome del corso nel collegamento WhatsApp e messaggio non vincolante rimangono coerenti. Il collegamento esterno è stato ispezionato, **mai aperto o inviato**. La landing dichiara che si tratta di interesse, senza iscrizione/account/pagamento. Nessun errore di runtime/rete, richiesta esterna o overflow laterale osservato.

[result.json](result.json): 68 assert PASS e quattro assert iniziali `activeElement === main` FAIL. Questi ultimi erano un criterio troppo stretto del probe: dopo l'anchor nativa il focus DOM è BODY, ma il punto di navigazione sequenziale cambia correttamente. [Controprova](skip-counterproof.json): a tutte le larghezze Tab → Vai al contenuto → Invio → Tab porta a **Scopri i percorsi dentro main**, saltando l'header. I quattro FAIL non sono stati cancellati o chiamati difetti della landing.

Schermate `first-*`, `fluidi-*`, `contact-*` e `contact-section-*`: gerarchia leggibile, azioni distinguibili, programma/contatto raggiungibili e selezione evidente. Nessun finding prodotto aperto nel perimetro controllato. La review non riconferma programmi MUR, testimonianze, prezzi, efficacia o servizi esterni: non è stato aperto un percorso d'iscrizione.

Il runtime composto iniziale precedeva il piccolo fix di contrasto dell'esperienza, documentato separatamente in `../C-public/`. Non si trasferisce quel finding allo stile della landing. Build finale/CI e composizione ultima rimangono in carico al root.
