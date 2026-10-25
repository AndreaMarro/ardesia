# S08 — piano esecutivo, 26 ottobre 2026

Base: 37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Branch codex/s08-lesson-media-20261026.
Spec: S08_MEDIA_VIDEOTECA_LEZIONI.md, allegato dell'utente; esecuzione richiesta con «esegui».

Scelta: riuso del player Studio e dei descrittori lesson-passage.v1, con catalogo nei Materiali. Nuovo documento lesson-media-index.v1 nelle risorse Core, senza nuovo storage o autorità di consenso. Alternative: player/dipendenze nuovi (nessun bisogno dimostrato), URL pubblici dei media (incompatibile con lo storage privato esistente).

- [x] Dominio: indice a revisione immutabile, cue/chapters validati sulla durata, riferimenti esatti alle fonti. Test negativi e cold reopen su SQLite Core.
- [x] UI: catalogo per edizione, ricerca tra lezioni, trascrizione manuale con timecode espliciti, capitoli, allegati/fonti, salvataggio tramite risorse Core e CAS; accesso al player/quaderno canonico. Nessuna persistenza locale concorrente.
- [x] Prove: unit test nuovi RED/GREEN, suite Web, typecheck, browser desktop/mobile, HTTP Core con attori sintetici; fonte rimossa/permessi negati e registrazioni distinte.
- [ ] Consegna: handoff con contratti mancanti (video, upload riprendibile/quarantena/worker remoto, revoke sui media remoti); patch e draft PR quando verificata. RUNLOG/NEXT riservati a S00, proposta di append nel handoff.

Vincoli: ZERO-LLM, dati sintetici, nessuna nuova dipendenza/servizio/spesa/deploy. Non modificare routing RootApp, auth, schema o migrazioni di altri owner. Il documento indice non concede accesso ai byte. Il player conserva registrazioni/sessioni e controllo del consenso esistenti. Accessi alle fonti collegati sempre ricontrollati dal Core. La revoca del riferimento non può ritirare copie già esportate.

Review focus: indici malformati/obsoleti; timecode fuori durata e sovrapposizioni; ritiro della fonte anche quando l'indice è ancora accessibile; cambio account/edizione durante richieste; modifica del solo testo senza alterare tempi; doppie registrazioni della stessa lezione.
