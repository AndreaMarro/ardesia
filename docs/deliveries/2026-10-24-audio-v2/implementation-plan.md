# AUDIO-V2 e Poiseuille — piano esecutivo

24 ottobre 2026, Europe/Rome. Base verificata `ae25b93bec826539940e0226da1f0cd8cebff0b1`, draft #297 ancora aperta su #290. Ramo isolato `codex/ardesia-audio-v2-poiseuille-20261024`, coperto dall'esclusione Vercel esistente. Nessun merge o deploy autorizzato.

Specifica: [mandato letto integralmente alla base](https://github.com/AndreaMarro/ardesia/blob/ae25b93bec826539940e0226da1f0cd8cebff0b1/docs/ops/NEXT-SESSION-PROMPT.md), [contratti esistenti](../2026-10-24-convergence/multimodal-mcp-contracts.md), ADR-0004 e canoni. Le normali scelte reversibili sono delegate esplicitamente dall'utente; non occorre un altro ciclo di approvazione del piano.

## Scelte

SessionAudioRecorder adatta i primitivi esistenti alla sessione CAS, mantenendo AudioRecorder legacy e le sue regressioni. Ogni take è un asset distinto, con digest, MIME e mapping fra durata monotona e tempo lezione. Un evento journal v2 strettamente validato conserva riferimenti espliciti a oggetti/versioni realmente presenti. Nessuna interpretazione automatica della voce.

La Room possiede recorder, arresto e drain prima di navigazione; il consenso storico non avvia la cattura. Il bundle canonico mantiene i path delle sessioni e ripristina un nuovo store. La revoca invalida richieste pendenti e rimuove i byte controllati; non cancella copie esterne già esportate.

Poiseuille compone PhysicsLab, esercizi del CoursePack immutabile, consegne, revisioni e diario Core. Il docente condivide intenzionalmente una fonte versionata con il riferimento del passaggio Studio e una spiegazione. Una previsione congelata precede il risultato. La nuova prova è un'altra consegna; l'uso osservato/dichiarato di aiuti è distinto dall'autonomia verificata.

Scartati: recorder flat nella Room (isolamento), concatenazione di take WebM (stream indipendenti), nuovo ledger dei tentativi (autorità duplicata), copia del solver client (divergenza), attesa asincrona del titolo come correzione non provata del catalogo.

## Ownership e passi verificabili

- [x] Catalogo — agente catalog_diagnosis: runtime del lock, spec originale, controprova listener/commit/routing, RED→fix minimo→GREEN. Mantiene getByRole e rifiuto del riferimento obsoleto.
- [x] Audio — agente audio_v2: SessionAudioRecorder, schema journal, replay, widget e bundle; test tail/pending/revoca/due room/nuovo store. Interfaccia Room: initialize, setObjectRefs, start, stop, revoke, dispose, subscribe/getSnapshot.
- [x] Esperienza — agente poiseuille: composizione Web e servizi Core, manifest editoriale con due varianti e fonti autorizzate; test delle risposte e dell'assistenza, percorso HTTP reale.
- [x] Integrazione — root: Room, annotazione reale, riferimento portabile, arresto prima della navigazione, font locali e QA browser desktop/mobile/tastiera/movimento ridotto. RED prima dei collegamenti UI.
- [x] REA E3 — root: osservazione Room precedente (Evidence `ev_f046b7f17a4ce36ff2a81f96556ea5ae252f970665c8aa1322911c5648735c95`), specifica sopra, implementazione e verifica stesso percorso; costo totale e alternativa diretta senza risparmi inventati.
- [x] Review indipendente — agente che non ha scritto audio/esperienza: attacca isolamento, revoca, fine audio, round-trip e fonte condivisa. Root verifica e corregge i finding.
- [x] Gate — typecheck/test/build dei package, gate Studio invariato, suite Core/API e igiene; log originali preservati con scope e SHA/diff.
- [ ] Consegna — memoria append-only, handoff, draft PR stacked su #297, CI da rileggere sullo SHA finale dopo pubblicazione e prossimo task con dipendenze.

## Attacchi prioritari

Permesso dopo revoca; write dopo OFF; riferimento ad altra Room/sessione; clip mancante/corrotta o import ostile; stop prima di tail/marker; consenso importato scambiato per avvio; risposta assistita trattata come autonoma; link locale scambiato per accesso remoto; oggetto fuori viewport a 390 px.

## Stato iniziale negativo conservato

Node 26.5.1/npm 11.17.0, spec originale catalogo 4 PASS. Prima suite Web originale: 285 PASS/9 FAIL in altri cinque file, catalogo PASS; non prova risoluzione. REA baseline è osservazione runtime, identità artefatto non fornita dal provider; il manifest di sorgenti deve fissare separatamente base+diff. Test nativo legacy: 20 controlli su sorgente invariato; non certifica AUDIO-V2.

Chiusura locale: codice, percorsi UI, review e gate completati; la pubblicazione/lettura CI della draft segue nel commit di memoria. Il confronto del costo complessivo REA resta UNKNOWN, come dichiarato nella prova, e non viene segnato come risparmio.
