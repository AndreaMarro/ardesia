# Goodnotes: perimetro, prova e trasferimenti

Il bundle installato dichiara 7.1.30, build3962760.264631382, su macOS26.0.1/25A362. Questo e metadata osservato, non una prova di Goodnotes6 in esecuzione. Account,piano,sync e quaderni non sono stati letti.

I termini ufficiali consultati il25ottobre2026, aggiornati settembre2025, limitano reverse engineering e accesso automatizzato. Non e stata stabilita una deroga: nessuna UI nativa automatizzata,analisi binaria,lettura database o cattura di audio e stata eseguita. Uso manuale entro gli accessi consentiti e documentazione restano il percorso proposto.

REA6.7.0 risponde in questa sessione; identita del pacchetto,help e contratto locale inspect_plist sono stati letti. La chiamata inspect_plist conpath esplicito ha risposto target_unavailable per assenza di app aperta: e un tentativo fallito,non un’evidenza Goodnotes. Il fallback plutil ha letto soltanto i quattro campi metadata dichiarati. Nessuna apertura binaria per superare il limite. Costo totaleREAUNKNOWN.

La fixture originale ha4pagineP01-P04,4link interni,outline e testo ricercabile. Creato e ispezionato ilPDF; importGoodnotes,registrazione,export e reimport sonoNOT_RUN. Il file di copione contiene testo originale e nessuna registrazione.

## Matrice dei30scenari

| ID | Flusso | Stato | Esecuzione locale |
|---|---|---|---|
| GN01 | Import PDF e ordine | DOCUMENTED_ONLY | NOT_RUN |
| GN02 | Zoom pan fit e dimensioni | NOT_RUN | NOT_RUN |
| GN03 | Penna e input | NOT_RUN | NOT_RUN |
| GN04 | Evidenziatore | NOT_RUN | NOT_RUN |
| GN05 | Gomma undo redo | NOT_RUN | NOT_RUN |
| GN06 | Lazo selezione mista | NOT_RUN | NOT_RUN |
| GN07 | Copia fra pagine | NOT_RUN | NOT_RUN |
| GN08 | Forme linee frecce | NOT_RUN | NOT_RUN |
| GN09 | Testo e formule | NOT_RUN | NOT_RUN |
| GN10 | Immagine crop ordine | NOT_RUN | NOT_RUN |
| GN11 | Riordino duplicazione rotazione | NOT_RUN | NOT_RUN |
| GN12 | Miniature segnalibri ricerca | NOT_RUN | NOT_RUN |
| GN13 | Link e ritorno | DOCUMENTED_ONLY | NOT_RUN |
| GN14 | Consenso audio | DOCUMENTED_ONLY | NOT_RUN |
| GN15 | Annotazioni durante audio | DOCUMENTED_ONLY | NOT_RUN |
| GN16 | Due take pausa stop | DOCUMENTED_ONLY | NOT_RUN |
| GN17 | Replay e seek | DOCUMENTED_ONLY | NOT_RUN |
| GN18 | Audio dopo riordino | NOT_RUN | NOT_RUN |
| GN19 | Eliminazione audio | NOT_RUN | NOT_RUN |
| GN20 | Revoca permesso | NOT_RUN | NOT_RUN |
| GN21 | Chiusura e cold reopen | NOT_RUN | NOT_RUN |
| GN22 | Export PDF | DOCUMENTED_ONLY | NOT_RUN |
| GN23 | Formato nativo roundtrip | DOCUMENTED_ONLY | NOT_RUN |
| GN24 | Export audio ufficiale | DOCUMENTED_ONLY | NOT_RUN |
| GN25 | Offline | NOT_RUN | NOT_RUN |
| GN26 | Conflitto collaborazione | NOT_RUN | NOT_RUN |
| GN27 | Tastiera focus accessibilita | NOT_RUN | NOT_RUN |
| GN28 | Documento sintetico lungo | NOT_RUN | NOT_RUN |
| GN29 | Errore export controllato | BLOCKED | NOT_RUN |
| GN30 | Template ed elementi | NOT_RUN | NOT_RUN |

I passi e criteri per ogni riga sono in goodnotes-matrix.json. DOCUMENTED_ONLY vale soltanto per la documentazione citata, non per la build installata. NOT_RUN non significa funzione assente. GN29 eBLOCKED per evitare un test di spazio potenzialmente dannoso sul disco quasi pieno. Nessuna nuova spesa o dispositivo.

## Trasferimenti originali proposti ad Ardesia

1. Rendere esplicita la differenza fra exportPDF visivo e bundle completo della lezione: la guida Goodnotes distingue i formati che conservano audio. AccettazioneArdesia: bundle conserva revisioni,media e ancore; PDF descrive le perdite e non viene presentato come recovery completo. Non creare un secondo formato canonico.
2. Riaprire una take tramite identita immutabile di lezione/revisione/pagina eclip,non indice corrente. La documentazioneNoteReplay descrive il contesto temporale; riordino/recovery restano proposte da verificare sul prodotto. Accettazione: due take,riordino pagina,cold reopen e revoca non riattivano il microfono.
3. Trattare selezione/trasformazione/undo come un’azione reversibile nella lavagna esistente. Excalidraw e gia una dipendenza canonica: preferire il suo percorso di selezione/undo. Non introdurre tldrawSDK commerciale come prerequisito.

Queste sono specifiche originali e criteri di prova. Nessuna implementazione o cattura donor e dichiarata da questa ricerca. Il risultato didattico utilizzabile della sessione e consegnato separatamente nei4CoursePack DRAFT e negli oracoli numerici.

## Fonti ufficiali consultate

- terms: https://www.goodnotes.com/terms-and-conditions
- audio: https://support.goodnotes.com/hc/en-us/articles/7352688559631-Add-Audio-Recordings-to-your-documents
- export: https://support.goodnotes.com/hc/en-us/articles/7353742824975-Export-documents-or-pages
- pdf: https://support.goodnotes.com/hc/en-us/articles/8537070839183-Choose-Between-Editable-and-Flattened-PDF-Export
- shareAudio: https://support.goodnotes.com/hc/en-us/articles/7352729730959-Can-I-Share-my-Audio-Recordings
- backup: https://support.goodnotes.com/hc/en-us/articles/7352773502351-Back-up-documents-with-Audio-Recordings
