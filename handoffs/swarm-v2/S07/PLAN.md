# S07 — esecuzione sul mandato fornito

Base 37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Una scena completa LWW perde modifiche; il notebook Core corrente non ammette ink condiviso.

Scelta: adapter Yjs sopra Excalidraw, documenti distinti per autore/scope. Hocuspocus e nuovi endpoint non sono attivati. Yjs 13.6.27 inizialmente solo nello spike isolato, senza mutare lockfile condivisi.

- [ ] Riprodurre collisione con WorkspaceStore reale e PDF sintetico comune.
- [ ] Test RED: 3 e 11 attori, atomicità, duplicazione/reordine, undo proprio, pagina/versione e zoom.
- [ ] Layer document e projection Excalidraw; snapshot versionati e riapertura WorkspaceStore; pending distinto da committed.
- [ ] Toolbar locale per layer e focus; freeze e proposte non derivano dal ruolo dichiarato dal browser.
- [ ] Validazione update binari per scope; nessuna dichiarazione di ACL Core remota prima del collegamento S10.
- [ ] Typecheck, test Studio seriali, browser desktop/touch/tastiera; review mirata e PR unica.

File nel namespace collaboration-v2; Room/routing/schema rimangono in CONTRACT finché assegnati. Riuso store.read/write e canvas esistente; nessun altro microfono.

Confutare: dipendenze causali mancanti, undo altrui, restore fonte sbagliata, revoca mentre ack è in volo, snapshot enorme/malformato. Prova locale sintetica e servizio remoto restano stati distinti.
