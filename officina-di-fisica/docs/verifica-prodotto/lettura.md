# Lettura e ascolto dei materiali

## Contratto prima della modifica

Sul lettore canonico le 56 lezioni e i 117 esempi pubblicati condividono i blocchi editoriali con formule KaTeX in HTML e MathML. Il controllo progressivo esiste per 8 lezioni, tutti i 117 esempi e 123 svolgimenti. La lezione C6-L01 comprende cinque blocchi e una formula. Le figure e i collegamenti ai laboratori devono continuare a seguire il loro passaggio.

| ID | Requisito e rischio | Prova |
| --- | --- | --- |
| L1 | Lo studente sceglie testo continuo o a passaggi e può tornare al testo intero. In ogni lezione ed esempio i blocchi rimangono nell’ordine originale. I laboratori restano associati al loro paragrafo. | Enumerare 56 lezioni e 117 esempi confrontando la sequenza con l’edizione, avanzare a mano, riaprire l’intero testo e seguire il collegamento a un banco. |
| L2 | Densità, contrasto, concentrazione e ritmo sono scelte esplicite del lettore. Si possono ripristinare i valori di partenza. Il quaderno personale ritrova le preferenze da un secondo client. | Profilo appena creato, modifiche parziali concorrenti, ricarica, secondo client, altro account e ritorno all’ospite. Confronto integrale dei dati di lettura e valutazione. |
| L3 | L’ascolto comincia soltanto su richiesta e usa una voce italiana indicata dal browser come locale. Lo studente può fermarlo, cambiare passaggio o lasciare l’attività. | Provare voce locale, elenco tardivo, sole voci remote, assenza del servizio, annullamento in navigazione e mancata esposizione dei quesiti sigillati. |
| L4 | La lettura audio segue testo e figure visibili, e pronuncia la struttura matematica. Il MathML editoriale rimane accessibile. | Verificare con un oracolo italiano frazione, potenza, segno meno e delta. Controllare l’ordine dei blocchi e il caricamento esclusivamente locale dei dati linguistici, anche senza voce installata. |
| L5 | Il comando per le preferenze occupa una sola riga da chiuso. Tastiera, movimento ridotto, zoom e uso a 320 px preservano i comandi e la lettura. L’orologio facoltativo segnala la fine solo a chi lo avvia. | Chromium e WebKit, viewport desktop/mobile, axe in stati distinti, controllo del focus, cronometro senza avanzamento automatico e riconciliazione visiva con Taste Skill. |
| L6 | Il lettore iniziale mantiene gli stessi contenuti e carica l’eventuale motore vocale solo su richiesta. Compatibilità delle edizioni e transazioni delle preferenze. | Nessun asset del motore durante la lettura ordinaria. Budget aggiuntivo a richiesta inferiore a 1 MiB per motore e mappe italiane. Verificare migrazione, ripresa da dati 1.1.0 e collaudo sul merge. |

La validazione con studenti, l’intelligibilità con tecnologie assistive personali e i gesti su un telefono fisico hanno una verifica separata.

Baseline `c0cf5478d954804c8f8a2db3007662f5eae093db`. Percorso riprodotto sul lettore C6-L01 a 1440 × 900 in Chromium e 390 × 844 in WebKit. La lettura a voce alta rimane una scelta personale. La sua disponibilità dipende dalle voci italiane locali esposte dal browser.

Il contratto del profilo accetta esclusivamente densità, contrasto, concentrazione e modalità di avanzamento. L’identità deriva dalla sessione. Il salvataggio di un campo preserva le scelte già salvate per gli altri campi. Un reset esplicito ripristina l’intero profilo. Per l’ospite si usano solo preferenze del browser. I tempi di lettura, il testo ascoltato e le scelte di accessibilità restano separati da tentativi, competenze e registri ufficiali.
