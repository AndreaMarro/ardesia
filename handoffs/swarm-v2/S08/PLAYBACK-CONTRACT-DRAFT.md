# S08 — raccordo sottotitoli/player, 26 ottobre 2026

Base50083404, main992d1a0b, stessaPR313. Worktree operativo recuperato da commit in /private/tmp per file FileProvider dataless nel checkout originale; nessun reset o perdita dei file precedenti.

Consumer: catalogo aggiunge al replay solo ID/revisioni/hash della fonte e dell'indice; il player rilegge esattamente quelle risorse Core e verifica lesson/session/recording/hash/durata contro il replay locale. Nessun testo nei parametri URL, nessun grant ai byte. Fallimenti/anonimo/revoca/fonti non corrispondenti negano la trascrizione. Il testo non viene persistito in cache locale.

Proposta di raccordo minimo per S00, ownerReplayView: import di un pannello nel namespaceWebS08, props audioRef/identità corrente/onSeek. Riutilizzo motore nativo TextTrack hidden/activeCues per i sottotitoli, rendering React del testo Core, frammenti/capitoli con seek dopo nuova verifica Core; nessuna sostituzione del player o della sua autorità audio/journal/consenso. Studio API/RootApp/config immutati. Richiedo writer puntuale di ReplayView oppure applicazione di una patch daS00; intanto modello/consumer/test nel namespace proprio e composizione privata di controprova, senza committare ReplayView prima della delega.

## Verifica writer e precisazione successiva

Enumerate live le14PR aperte309–321: nessun altro ramo modifica ReplayView.tsx o replayTimeline.ts; S07/S14 lavorano suRoom, S00suRootApp/API/release. La precedente attribuzione cautelativa diReplayViewaS00 non era una riserva osservata. Il mandatoS08 assegna fruizionemedia e descrive namespace proposti da confrontare con checkout/writer reali. Rivendico il solo raccordo ReplayView necessario a questo consumer (estrazione seek esistente, sincronizzazione seek nativo da pausa, mount pannelloS08), senza toccareRoom/RootApp/auth/schema/API. S00 conserva integrazione/rilascio. La patch rimane anche leggibile nel handoff per la review del confine, ma non sostituisce il consumer nella consegna.

Prove iniziali:14modello+4UI PASS; tentativo namespace43PASS con1errore startupworker nonverificato; secondo tentativo interrotto dopo2FAILdiimportpreesistenti durante sovrapposizione gateS00/browserS14, causaUNKNOWN. Nessun timeout alzato o testindebolito. Attendo finestra per tests/tsc/browser reali e conservo gli esiti.
