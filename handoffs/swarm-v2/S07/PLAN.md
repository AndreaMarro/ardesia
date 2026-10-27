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


## Aggiornamento 26 ottobre2026 — fotografia corrente, storico sopra preservato


Base iniziale37e0fe8, aggiornata tramite merge ordinario a main8e0737b1. Prima candidata finale di codice0d809591ca47a3c87878548d59b343d62e7ff7a8, prodotto identico a7a263e27; il merge aggiunge soltanto S02 Web.

- [x] Collisione WorkspaceStore riprodotta: lo snapshot intero perde il writer precedente.
- [x] Motore Yjs per layer; convergenza3/11, reordine/dup, undo locale e same-author-device.
- [x] Source/hash/revisione/pagina; projection Excalidraw e checkpoint pending/committed.
- [x] Outbox idempotente, lost ACK, revoca, restore e limiti binari.
- [x] Consumer opzionale Room e toolbar; nessuna attivazione tramite URL prodotto.
- [x] Privacy in board/journal/export legacy e passaggio audio; nessun microfono nuovo.
- [x] Review read-only, controprove RED e correzioni; 28test namespace PASS.
- [x] Browser Room reale3context desktop/touch/mobile, cold reopen, revoca; controprova finale riportata separatamente.
- [x] Donor/licenze e delta registro con quattro candidati; consultazione GitHub S12/S15.
- [ ] CI completa sulla head finale e verifica boundary S00 (stato nel rapporto finale).
- [ ] Trasporto/ACL server/storage Core S10, prova remota3poi11.
- [ ] Merge/rilascio S00, bundle.lesson con sidecar, focus/consegna canonici.

Non DONE. Nessun secondo Core, database o relay pubblico. La PR non abilita il consumer automaticamente nelle route.
