# S02 batch02 — navigazione disponibile e feedback condiviso

Base main8e0737b114f147735ef4daf062285e1dbe4064e3, PR308MERGED confermata con connettore; CI post-merge40247327806SUCCESS verificata con gh in lettura. La previewS00 è in lavorazione, non dichiarata distribuita. Tutti i browser e servizi S02 restano chiusi durante la coda S00.

Consumer mancante concreto: App S00 deve montare IndependentStudy della PR309, routeID `independent-study` già accettato da S00. Il contratto Shell/View attuale ignora quelID. Introduciamo un opt-in di disponibilità delle sole route montate, separato da ACL: defaultlegacy immutato, nuovo ingresso studente nascosto finché non abilitato da Root.

Task1: test RED per defaultlegacy, enable esplicito, filtro docente e lista vuota; implementare `destinations(tutor, enabledViews?)`, prop Shell opzionale e navigazione/command derivati dallo stesso elenco. Nessun edit App, API o persistenza. Test negativi impediscono di pubblicizzare feature assenti.

Task2: consumer test Shell con opt-in e command selection. Raccordo Root proposto a S00 nel rendezvous6405260914, attivazione soltanto dopo mount reale. Non un'API già funzionante nel Root attuale.

Task3: adozione stati nei consumer S01/S06/S08. Fonte riletta: Classroom/Work/Materials usano Feedback; i nuovi IndependentStudy e LessonMediaLibrary hanno markup di stato locale. Delega su components/Feedback.tsx richiesta a S00, non presunta. Review S06: main annidato da cambiare a section/article dall'owner. SourceStatus nei nuovi consumer deve restareunknown se il Core restituisce solo una revisione esatta senza attualità, mai current dedotto dalla cache. Nessun edit dei namespace altrui.

Accettazione: CI della head esatta, default Appcompatibile e nuovo consumer effettivamente montato da S00, tastiera e riapertura; browser/build solo dopo rilascio slot. Stato finale distinto da mera libreria pronta. Dopo merge continuare batch di stato, source/versione e navigazione dei sotto-tab con gli owner.
