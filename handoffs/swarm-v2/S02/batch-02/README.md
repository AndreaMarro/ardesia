# S02 batch02 — contratto di navigazione disponibile

**IMPLEMENTATO e verificato con unità; composizione Root/consumer e browser pendenti. Non DONE.** Base main8e0737b114f147735ef4daf062285e1dbe4064e3; prodotto c512930a37c2bf38a8411cb4acbbaf8d0e6db76a. PR308 giàMERGED, albero06a1b6d35fd56e7567b46befc0b1472e99b30781 identico alla sua head3b775bf2, postmergeCI40247327806SUCCESS. La nuova preview S00 non è dichiarata distribuita da S02.

Consumer concreti: S06PR309/IndependentStudy, IDindependent-study solo studente; S05PR315/memoria personale, IDmemory per entrambi i ruoli anche senza edizioni. Questi consumer richiedono il raccordo Root S00. La shell non li abilita da sola: default esatto7routelegacy, opt-in `enabledViews`, nessun nuovo ACL/engine/store/schema o dipendenza. Nav e command derivano dallo stesso elenco corrente. La lista vuota non ricade suldefault; la lista legacy è frozen.

Scope: namespaceproduct-shell e1export di legacyViews nell'entryShell assegnato. App/Feedback/API e namespace feature intatti. [CONTRACT](CONTRACT.md) contiene il raccordo Root da applicare solo insieme al mount e la distinzione disponibilità/permessi.

## Prove effettive

Aggiornamento REA-FIRST: [ACQUISITION.md](ACQUISITION.md) contiene confronto di tre candidati, osservazione statica del dist Radix, provenienza/licenze, consumer e limiti. Nuovo test con dialogo aperto: una destinazione focalizzata rimossa non porta il focus fuori dal dialogo e Invio usa solo route/callback correnti; 1PASS,6nonselezionati in15.68s su jsdom. Il comportamento è fornito dalla libreria esistente, senza modifica al prodotto. Focus nativo resta da provare nello slot assegnato.

CI della head2da98d99038d91b846d141c5efb9e791ee5a7c55: run40248639849SUCCESS con tutti7job; Web432PASS/63file, typecheck, build privato/pubblico, publicE2E11PASS e teacherpath1PASS. Marketing40248639850 e contract40248639847SUCCESS. Queste prove precedono il nuovo test e gli handoff REA: leggere la nuovaCI sulla nuovahead prima dell'integrazione, senza trasferire il verde.

- Tre test di disponibilità RED→4testGREEN; test memoria RED→5testGREEN. Ultimo puro5PASS senza browser in circa0.15s.
- ConsumerShell/command con enabledViews:1PASS (~1.2s inclusa jsdom),5test precedenti non selezionati in quel run. Non contati come test eseguiti.
- Review separata read-only del diff8e..c512 e consumerApp/Today: nessun finding azionabile; whitespacePASS. Il revisore non ha eseguito test/build/browser/servizi. Focus nativo quando una voce già focalizzata viene rimossa rimane non verificato.
- Nessun tsc, build o browser S02 durante gli slot seriali S00/S07. Typecheck/fullWeb e fixture browser sono richiesti sulla CI della head e poi sul consumer composto, non presunti dalle unità.

## Review dei confini e adozione

S06: rilevato main interno annidato nel main della shell nel consumer letto; segnalato all'owner. L'owner ha confermato in6405352617 la correzione in section con suo RED/GREEN e7WebPASS; S02 non ha eseguito quei test. Nessun edit al suo namespace. S05 ha fornito label/descrizione e requisito senza corsi nel rendezvous6405296890. S08LessonMediaLibrary letto alla head81f7e1cb: caricamento/errore/fonte sono markup locali, prima adozione esplicita dei componenti di stato ancora da effettuare dall'owner.

Delega `components/Feedback.tsx` richiesta a S00 in6405260914 ma non ricevuta alla scrittura: file intatto. SourceStatus non deve diventarecurrent perché un GET della revisione esatta ha successo: se attualità non restituita, unknown. La review/adottanza dei nuovi consumerS01/S06/S08 non è completata da questo contratto.

## Tre prossimi passi

1. S00 adotta enabledViews nella propria lista di route realmente montate con S05/S06, mantiene re-exportShell e risolve la vecchia modifica Shell della PR315. Accettazione: entry+ricerca dello stessoID, reload/back e ruolo senza edizioni, nessuna funzione inattiva pubblicizzata. Prova sul merge tree e main/preview pertinente.
2. Dopo assegnazione, unificare Feedback e stati fonte nei consumerS01/S06/S08 conservando props/heading/negative: almeno unjourney perowner e sua review del confine. Il codice di stato non crea nuovi permessi o ledger.
3. Quando lo slot è rilasciato, browser su route abilitate, tastiera/focus alla rimozione della destinazione e compatibilità di viewport/zoom; screen reader/Safari/device separati. Nessuna nuova suite pesante o dichiarazione di remoto implicita.
