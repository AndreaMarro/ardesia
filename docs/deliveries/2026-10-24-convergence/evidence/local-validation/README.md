# Log locali e integrità

I file `.log` sono viste leggibili dello stdout: sono stati rimossi soltanto spazi finali e righe vuote finali per rispettare il gate whitespace del repository. **I byte originali sono conservati in `original-logs.zip`** e collegati alle viste da `log-provenance.json`. Non sono stati modificati esiti, comandi, warning o errori.

`hygiene-initial-results.json` conserva il primo run: tutti i gate funzionali di igiene passavano, mentre `git diff --cached --check` segnalava la formattazione dei log grezzi. La correzione riguarda le viste dei log e una riga vuota finale nel rapporto; il controllo whitespace finale è registrato separatamente. Il gate non è stato modificato.

`board-expanded-suite.log` conserva un precedente limite sandbox EPERM. `studio-full-suite.log` è il run finale nell’executor autorizzato: 2.201 PASS e 5 skip della suite screenshot legacy. Questi risultati non devono essere sommati.
