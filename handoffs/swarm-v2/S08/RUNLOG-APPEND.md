# Voce proposta per S00 — 26 ottobre 2026, S08

Writer della memoria comune resta S00; questo file non sostituisce RUNLOG/NEXT.

Base verificata main37e0fe828e47b7c81784c2eb48a1b9776dd859ed, CI40242587363 e readiness40242587350 SUCCESS riletti da GitHub. S08 in ramo isolato codex/s08-lesson-media-20261026; non ha modificato il checkout altrui, routing RootApp, auth/schema, lockfile o CI. Stato rigenerato nel proprio checkout; il primo snapshot durante l’inizializzazione aveva9403 file temporaneamente assenti, il secondo7modifiche locali: il primo non era inventario del repository completo e non va usato.

Risultato: Materiali possiede un catalogo dei passaggi registrati, ricerca nelle trascrizioni/indici, capitoli con timestamp, editor manuale, fonti/allegati versionati e export WebVTT. L’indice è una StudyResource Core con riferimento immutabile a una lesson-passage; salvataggio CAS e permessi riusati. Il player Studio viene aperto con sessione/registrazione/hash e versione oggetto originali; i cue in altri istanti selezionano l’audio senza inventare l’esistenza della versione oggetto in quel tempo. Il ritorno avviene alla scheda catalogo. Nessuna nuova autorità di sessione o memoria locale concorrente, nessun dato studente reale.

Scelta: riuso del player/quaderno canonici e di `lesson_passage_resource`, invece di installare Video.js o duplicare blob/consenso. Non esiste una ragione per aggiungere runtime/costi al primo consumer locale; il lavoro su video/Range/upload remoto richiede il contratto di S10. Il servizio Python nuovo è un consumer Core testato, non una nuova route: l’UI usa CRUD generico e parser specifico fail-closed. Non dichiarare un vincolo globale API/SQL sull’indice.

Errori/correzioni: la review tecnica di un secondo agente ha riprodotto il cue precedente alla nascita dell’oggetto e il blocco della bozza su preflight fallito. Due regressioni RED effettive poi correzioni: URL canonico separato dal seek audio e pending liberato prima di qualsiasi scrittura. Primo tentativo RED con import dinamico scaduto e controllo `.disabled` inadeguato al fieldset conservato come tale; corretto con import statico e `:disabled`. Primo browser timeout nel passaggio all’editor; prova completa successiva distinta. Font403 nel devserver Studio dovuto a symlink dipendenze fuori allowlist: corretto nel solo config QA locale; il rerun finale non ha errori di font o console inattesi. Due esecuzioni ampie interrotte dopo timeout nell’exam-cas invariato sotto forte carico host; non chiamate verdi né flaky. Nessun gate modificato.

Apprendimento: il timestamp di una registrazione e l’istante di esistenza di una versione oggetto sono riferimenti diversi. Un consumer deve mantenere entrambi solo quando l’associazione è verificata; cambiare un numero nell’URL può invalidare un legame autentico. Un esito ignoto del comando richiede retry immutabile, mentre un GET fallito prima della scrittura deve lasciare correggibile la bozza.

Prove finali/SHA/PR e stato integrato o meno: vedere README e manifest della consegna S08. Nessun merge/deploy compiuto da S08. Ascolto umano, Safari fisico, efficacia didattica e remoto restano separati dai test sintetici.

## Tre prossimi batch

1. **P0 integrazione S00:** primo passo leggere diff/PR e consumer Materiali; dipendenza gate esatti e ownership; accettazione merge tree e base integrata con percorso completo e memoria aggiornata; prova SHA, CI, screenshot e player esatto. READY_FOR_INTEGRATION non equivale a DONE.
2. **P0 media remoto S10/S08:** primo passo confrontare `CONTRACTS.md` con assets/uploads/blobs attuali; dipendenza grant/consenso/storage approvati; accettazione anonimo/altro partecipante negati anche sui segmenti, revoca/cache/Range e restore; prova due browser/edizioni su servizio reale, non mock.
3. **P1 registrazione video/upload S08/S10:** primo passo fissare formati/dimensioni/hash e protocollo offset/quarantena/worker; dipendenza costo/licenze e primo grant remoto; accettazione interruzione/resume/hash, formato falso, duplicato, fail/retry/cancel e sottotitoli accessibili; prova HTTP e device con due registrazioni distinte, senza “guardato=imparato”.
