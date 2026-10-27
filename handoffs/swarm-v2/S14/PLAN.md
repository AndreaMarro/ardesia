# S14 — raccolta nativa della lezione

Mandati del proprietario del 26 ottobre: eseguire acquisizioni REA con consumer reale, preservando le ownership. Base 8e0737b114f147735ef4daf062285e1dbe4064e3. S07 possiede Room; raccordo richiesto sul rendezvous306, nessuna delega presunta.

Scelta ADAPT: Excalidraw0.18.1 Library MIT già installata. Goodnotes Elements è benchmark funzionale proprietario; tldraw SDK richiede licenza di produzione e sostituirebbe il canvas; DEFER. Nessun nuovo motore/dipendenza. API ufficiali più efficaci del recupero di sorgenti: `initialData.libraryItems`, `onLibraryChange`, `updateLibrary`, `toggleSidebar`.

- [ ] Test RED nel namespace S14: legacy senza raccolta, snapshot immutabile, limiti, rifiuto proiezioni ardesiaInkV1, roundtrip dello stesso board nel bundle.lesson, isolamento room.
- [ ] `snapshotLibraryItems(value: unknown): LibraryItems` valida contenitore e budget, senza reinventare restore/rendering SDK.
- [ ] `libraryFromScene(value: unknown): LibraryItems` legge campo opzionale v2 `libraryItems`; `sceneWithLibrary(serializedScene: string, items: LibraryItems): string` aggiunge allo stesso documento, senza sidecar o secondo store.
- [ ] Con ownership esplicita, raccordare Room: ref per snapshot, initialData, callback che usa debounce/fence canonico, stesso snapshot nella coda save; bottone raccolta nativo. Import.lesson deve sostituire anche la raccolta tramite API SDK e attendere il salvataggio.
- [ ] Test consumer/WorkspaceStore e browser reale desktop/mobile: selezione→raccolta→inserimento→save/reload→export/import; errore di quota/isolamento/vista studente. Typecheck e check pertinenti sulla SHA esatta. Slot pesante coordinato con S00/S07.
- [ ] Provenienza, REA parziale e limiti; PR reviewabile a S00, integrazione e postmerge verificati prima di dichiarare DONE. Memoria comune consegnata al writer S00.

Rischi da verificare: callback SDK non attesa dal donor; export durante import in corso; vecchia raccolta su cambio lezione/store; proiezioni collaborative private; input corrotto non deve diventare salvataggio vuoto; raccolta illimitata può saturare cache locale.


## Stato successivo alle controprove

I punti iniziali restano come piano storico. Utility e budget realizzati con7testPASS, consumer verificato con4testRoommockPASS, typecheck0 e9checknativiPASS; altri5checknativiPASS attestano creazione/rimozione e file.excalidrawlib nel fallback HTML. Review indipendente con due finding corretti. Le prove e i fallimenti intermedi sono conservati, CI e15e35e5 tuttaSUCCESS. Il checkbox del raccordo non è soddisfatto: la patch non è montata nel branch consegnato o nella main. Restano assegnazione/composizione S00, controprova della Room combinata e postmerge. Memoria comune consegnata al writer S00, non modificata in concorrenza.
