# S02 batch02 — contratto di navigazione disponibile

**IMPLEMENTATO e verificato con unità; composizione Root/consumer e browser pendenti. Non DONE.** Base main8e0737b114f147735ef4daf062285e1dbe4064e3; prodotto c512930a37c2bf38a8411cb4acbbaf8d0e6db76a. PR308 giàMERGED, albero06a1b6d35fd56e7567b46befc0b1472e99b30781 identico alla sua head3b775bf2, postmergeCI40247327806SUCCESS. La nuova preview S00 non è dichiarata distribuita da S02.

Consumer concreti: S06PR309/IndependentStudy, IDindependent-study solo studente; S05PR315/memoria personale, IDmemory per entrambi i ruoli anche senza edizioni. Questi consumer richiedono il raccordo Root S00. La shell non li abilita da sola: default esatto7routelegacy, opt-in `enabledViews`, nessun nuovo ACL/engine/store/schema o dipendenza. Nav e command derivano dallo stesso elenco corrente. La lista vuota non ricade suldefault; la lista legacy è frozen.

Scope: namespaceproduct-shell e1export di legacyViews nell'entryShell assegnato. App/Feedback/API e namespace feature intatti. [CONTRACT](CONTRACT.md) contiene il raccordo Root da applicare solo insieme al mount e la distinzione disponibilità/permessi.

## Prove effettive

- Tre test di disponibilità RED→4testGREEN; test memoria RED→5testGREEN. Ultimo puro5PASS senza browser in circa0.15s.
- ConsumerShell/command con enabledViews:1PASS (~1.2s inclusa jsdom),5test precedenti non selezionati in quel run. Non contati come test eseguiti.
- Review separata read-only del diff8e..c512 e consumerApp/Today: nessun finding azionabile; whitespacePASS. Il revisore non ha eseguito test/build/browser/servizi. Focus nativo quando una voce già focalizzata viene rimossa rimane non verificato.
- Nessun tsc, build o browser S02 durante gli slot seriali S00/S07. Typecheck/fullWeb e fixture browser sono richiesti sulla CI della head e poi sul consumer composto, non presunti dalle unità.

## Review dei confini e adozione

S06: rilevato main interno annidato nel main della shell nel consumer letto; segnalato all'owner perché usi section/article. Nessun edit al suo namespace. S05 ha fornito label/descrizione e requisito senza corsi nel rendezvous6405296890. S08LessonMediaLibrary letto alla head81f7e1cb: caricamento/errore/fonte sono markup locali, prima adozione esplicita dei componenti di stato ancora da effettuare dall'owner.

Delega `components/Feedback.tsx` richiesta a S00 in6405260914 ma non ricevuta alla scrittura: file intatto. SourceStatus non deve diventarecurrent perché un GET della revisione esatta ha successo: se attualità non restituita, unknown. La review/adottanza dei nuovi consumerS01/S06/S08 non è completata da questo contratto.

## Tre prossimi passi

1. S00 adotta enabledViews nella propria lista di route realmente montate con S05/S06, mantiene re-exportShell e risolve la vecchia modifica Shell della PR315. Accettazione: entry+ricerca dello stessoID, reload/back e ruolo senza edizioni, nessuna funzione inattiva pubblicizzata. Prova sul merge tree e main/preview pertinente.
2. Dopo assegnazione, unificare Feedback e stati fonte nei consumerS01/S06/S08 conservando props/heading/negative: almeno unjourney perowner e sua review del confine. Il codice di stato non crea nuovi permessi o ledger.
3. Quando lo slot è rilasciato, browser su route abilitate, tastiera/focus alla rimozione della destinazione e compatibilità di viewport/zoom; screen reader/Safari/device separati. Nessuna nuova suite pesante o dichiarazione di remoto implicita.


## Aggiornamento datato — 26 ottobre 2026, mandato REA-FIRST

La fotografia precedente è conservata intatta. Questa appendice aggiorna le conclusioni senza sostituire le prove storiche.

- PR316, base main8e0737b1, codice applicativo c512930a. CI della head2da98d99:40248639849SUCCESS, tutti7job, Web432PASS/63file con typecheck e build privato/pubblico, publicE2E11PASS e teacherpath1PASS; marketing40248639850 e contract40248639847SUCCESS. Non trasferire il verde alle head successive.
- Head8219b389 aggiunge il test di rimozione della route focalizzata e handoff REA, senza cambiare codice applicativo. Test locale1PASS/6nonselezionati in15.68s totali,1.79s test; jsdom, non browser nativo. La CI40250598810 era IN_PROGRESS all'appendice: leggere il risultato esatto prima di integrare.
- Correzione alla sezione storica S06: in6405352617 l'owner ha confermato section etichettata al posto del main annidato, suo RED/GREEN e7WebPASS. S02 non ha eseguito questi test. Il finding era valido sul consumer letto e non è una lacuna ancora presunta nella fonte successiva.
- Il focus alla rimozione è ora provato in jsdom; resta NOT_RUN nel browser nativo. Radix lo gestisce senza un nuovo observer o trap proprietario. Le prove UI/Core di PR308 rimangono riferite alla loro fonte e non attestano il nuovo mount S05/S06.
- [ACQUISITION.md](ACQUISITION.md): confronto di tre candidati, decisione REUSE Radix1.3.1, REA sul dist, licenze/provenienza e debito. [TARGETS.delta.json](TARGETS.delta.json) propone aggiornamento del soloTARGET-117 e candidati senza ID assegnati; registro comune intatto. S12/S15/S13/S16 consultati realmente via6405606925.
- Slot/browser/build/tsc S02 non avviati. App/Feedback/API e namespace altrui intatti; Root e adozione stati restano da comporre con i writer. Nessun merge/deploy o DONE della nuova capacità dichiarati.

Il nuovo [MEMORY-2026-10-26.md](MEMORY-2026-10-26.md) è appendice per il writer S00 di RUNLOG/NEXT, con decisioni, limiti e task accettabili.
