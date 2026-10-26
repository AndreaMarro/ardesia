# S07 — IMPLEMENTATO, verifica di integrazione in corso

Base `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`; branch `codex/s07-collaboration-20261026`. Non DONE: nessuna integrazione o distribuzione dichiarata.

Consumer: Room accetta `collaboration?: RoomInkAdapter` soltanto dall'host; il default è assente. Nessun actor/ruolo da URL o nuovo login. L'adapter fornisce due InkSession (personale/condiviso), sorgente esatta e geometrie PDF, layer shared già autorizzati dal trasporto e AbortSignal della sessione Core. Toolbar lazy, acquisizione a pointer-up, proiezioni locked, undo locale, pagina/zoom personali, snapshot via WorkspaceStore. Room/journal/audio conservano le autorità esistenti.

## Prove attuali

18 test namespace PASS prima del wiring Room: collisione reale WorkspaceStore, convergenza3/11autori, dup/reorder, undo proprio e stesso autore su altro device, snapshot source/page/version, binary forged-author/hidden-root/incomplete, freeze, outbox/retry e lateack/revoca, cold key retry, UI save failure. Log `tests-local.log`. Non sono test di scala remota o studenti reali.

Browser iniziale FAIL conservato: tre context Chromium caricano lo stesso PDF sintetico, ma harness invocava updateScene troppo presto; warning Excalidraw e gesto non acquisito→timeout. Correzione del lifecycle implementata nel consumer Room (effect dopo API/mount); rerun attende slot host. Non dichiarato visualPASS.

Typecheck completo locale arrestato per contesa host8GiB e disco sceso a1GiB; nessun errore compilatore mascherato, nessun PASS dichiarato. npm package-lock-only conclude exit0 con warning peer preesistenti Radix/React19. Pin/closure esatti in DONOR.md; delta manifestStudio+49righe lock, rootlock immutato. Full Studio/Room/audio e build da eseguire sulla SHA corrente.

## Autorizzazioni e confini

S00 ACCEPT https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404992331 e correzione percorso6405061639: esclusiva temporanea Room reale e manifestStudio, prop/toolbar opzionali. Nessun App/rootlock/shared schema modificato. Test e consumer UI non certificano ACL remote. `validateLayerUpdate` valida contenuto/casualità/budget per documento separato; il server deve prima verificare identità e scope Core a ogni update/reconnect. Porta InkTransport esplicita, nessun provider predefinito o endpoint pubblico.

Checkpoint locale: committed separato da pending e chiave idempotente conservata anche a cold reopen; localStorage rimane cache. Le sidecar non sono ancora parte del bundle `.lesson` canonico: non dichiarare roundtrip bundle/export remoto. Undo history non ripristinata dal checkpoint. Limiti512KiB/layer,2000oggetti,4096punti/tratto; nessuna promessa di scala infinita.

## Residui e tre prossimi batch

1. Completare typecheck, suiteStudio/Room/audio, browser suRoom reale e review del confine S00; integrare solo dopo CI esatta. Pipeline/default prodotto preservati da verificare.
2. S10: transport autenticato, ACL per-scope anche sui binari, revoca websocket/offline server, receipts e storage Core, stress latency/disconnect3poi11. Nessun endpoint simulato può chiudere questa accettazione.
3. Estendere focus docente con grant verificato, proposta tutor su layer distinto, freeze/consegna canonici e snapshotepoch per compattazione sicura. Aggancio media solo S08 e integrazione sidecar nel bundle con ownership. Formule attuali sono dati/projection testuale; typesetting e oggetti scientifici passano dal renderer esistente, non una capacità completa già pronta.

## Review tecnica e correzioni — dopo la prima candidata

Review separata read-only di9b3ede6 (nessun test eseguito dal reviewer):6finding accettati. La CI9b3ede6 è tuttaSUCCESS ma non dimostrava questi casi. Controprove RED effettive: cold retry dopo undo rifiutava receipt originale; cicli grandi raggiungevano615878byte oltre512KiB; baseline del gesto/isolamento board mancanti. Primo GREEN16testNode dopo le correzioni in7.35s. Prova testo passa ora dal restoreElements reale, non solo dalla shape del DTO; esito da aggiungere dopo esecuzione.

Correzioni: baseline precedente al gesto (Excalidraw emette pointerDown dopo insertion), rifiuti rimossi dal canvas, projection di qualunque autore e nuovi rawdraft fuori dalla scena/journal/export legacy. La baseline del board conserva gli elementi precedenti. Le sidecar conservano gli scope separati; nessun contenuto privato introdotto nel journal pubblico. GCfalse conserva causalità/storia, con budget conservativo prima di add/undo/redo; nessuna compattazione implicita. La busta pending conserva update bytes esatti insieme alla chiave, anche dopo undo/coldreopen. Formule/proposte hanno boundingbox visibile ma restano testo, non typesetting scientifico completo.
