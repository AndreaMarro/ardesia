# S19 Circuit Lab Implementation Plan

**Goal:** una prima tranche DC riusabile e integrabile in Ardesia.
**Architecture:** package Kirchhoff fissato, adapter stateless, persistenza Core, consumer React Flow.
**Spec:** DESIGN.md e mandato S19 allegato.
**Global constraints:** namespace S19; nessuna modifica diretta a RootApp/Room/Study API/lock comuni, S01/S13; nessun solver/grader/DB/login aggiuntivo.
**Review focus:** valori estremi e razionali; topologie flottanti e sorgenti contraddittorie; race risposta dopo modifica; import con risultati falsificati; revoca e revisione concorrente.

- [x] 1. Acquisizione installata e test scientifici RED→GREEN. File plugins/s19-circuit-lab/{engine.lock.json,pyproject.toml,s19_circuit_lab/adapter.py,tests/test_adapter.py}; firme solve(document), diagnose(document), export_document(document,format). Confrontare partitore/rami indipendenti e rifiuti. Verifica pytest.
- [x] 2. Ponte Core e patch S00 testata su copia temporanea. File s19_circuit_lab/{core.py,routes.py},tests/test_core.py, handoff integration.patch, content/s19-circuit-dc-v1.json. Salvare input, revisione CAS, ricalcolare alla consegna; usare submit/get_receipt reali. Verifica HTTP con cookie autentico, peer, estraneo, revoca, riapertura.
- [x] 3. Consumer React Flow e browser reale. File web/src/{CircuitLab.tsx,model.ts,style.css}, package/lock dedicati, script composizione test e runner. Modifiche invalidano risultato/diagnosi e richieste obsolete; connessioni via mouse/touch/tastiera, previsione, verifica, risorse e ricevute. Typecheck/build e browser.
- [ ] 4. Provenienza, limiti, review, PR singola e handoff S00/S03/S13. Conservare RED/fix, comandi e SHA; nessuna affermazione di integrazione/remoto prima dei gate reali. La memoria comune resta di S00; consegnare appendice S19.

## Decisioni e registro di esecuzione

- Ruling: esecuzione diretta della specifica fornita, senza una nuova approvazione del design; il mandato «esegui» delega le scelte di routine. Nessuna espansione di pubblicazione.
- Ruling: package sparse editable a pin verificato; wheel upstream richiede MCP web non necessario. Costo: distribuzione sorgente da rendere esplicita in S00/ToolHost.
- Ruling: file condivisi intatti e patch esatte applicate a copie temporanee. Costo: mount principale non attestato finché S00 non compone la stessa PR.
- Ruling: attività di procedimento S19 con entryActivityIdnull; non alterare il modello due-resistori o fingere supporto del dispatcher numerico.
- Review fresca GPT-6 Astra: sette difetti riprodotti/corretti; dettaglio e RED in REVIEW.md. Nessun finding importante rinviato.
- Verifiche prima della chiusura:90Python/Core,87upstream,22browserPASS30.3s; fallimenti sotto carico conservati e finestra esclusiva concordata. Due test di disponibilità e relative guardie aggiunti successivamente: esecuzione conclusiva inCI, senza occupare lo slot rilasciato aS00.
- Il task4 resta aperto fino alla PR e all'handoff; merge/pubblicazione restano distinti e non dichiarati completi.
