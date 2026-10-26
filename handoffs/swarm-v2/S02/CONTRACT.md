# S02 — contratto compatibile e confini

Base 37e0fe828e47b7c81784c2eb48a1b9776dd859ed. Owner S02: `apps/web/src/features/product-shell/**`; unico punto condiviso modificato: `components/Shell.tsx`, re-export dell'interfaccia preesistente. Root `App.tsx` invariato; S00 conserva routing, integrazione e rilascio.

Consumer reale: App importa lo stesso Shell e monta Today, Classroom (strumenti scientifici), Work (Quaderno), Materials (media) e Review. Props immutati: me/view/onView/onLogout/children/editions/editionId/onEdition/editionPagination. Nessuna API/schema/migrazione/lockfile nuova. Le selezioni usano gli stessi callback del consumer; il salvataggio resta nei servizi esistenti.

- `ProductShell`: stessa proprietà e stessi View ID. Aggiunge classroom nella navigazione e ricerca con Radix Dialog 1.3.1 già adottato. Destinazioni dipendono dal ruolo; le autorizzazioni restano server-side.
- `CommandSearch`: cerca solo sezioni e titoli/ID della pagina di edizioni già caricata. Nessun indice dei materiali privati, nessuna richiesta HTTP aggiuntiva, nessuna promessa di ricerca globale. Edizioni disabilitate durante caricamento; query eliminata alla riapertura e unmount alla fine sessione. Ctrl/Cmd K, Esc, frecce, Invio e Tab. Chiusura ripristina trigger; navigazione porta focus al main.
- `SurfaceState({state,detail?,action?})`: stati loading/empty/error/offline/pending/stale/revoked. L'owner passa risultato e callback; il componente non accede a storage o Core. pending/loading non ripetono l'azione.
- `SourceStatus({state,revision?})`: current/historical/stale/revoked/unknown espliciti, mai dedotti dalla cache; revoked non visualizza l'identificatore di revisione. Nessun riferimento lessonRef/fase nuovo.
- `.product-shell` e `.ps-*`: CSS circoscritto. Token proiettano palette esistente e aggiungono cobalto per navigazione/focus. Nessuna modifica ai callback della lavagna o alle formule.

Compatibilità scelta: “Il mio lavoro” resta l'entry del Work esistente (diario/consegne/quaderno). Quaderno e Ripasso separati, Esplora e Gestione separata richiedono route reali/accordo S06/S00. Non inventati pulsanti inattivi. Cambiato “Mini-corsi” tutor in “Corsi”; gestione già presente nella stessa destinazione.

Errori: banner offline segnala soltanto navigator.onLine, non attesta raggiungibilità server o sincronizzazione. Le risposte 401/403 e fine sessione rimangono nel confine esistente. Stato API non disponibile rappresentato dalla feature proprietaria.

Prova discriminante: `shell.e2e.ts` sul Core SQLite locale: Oggi→ricerca→Lezione→nota privata→refresh→risorsa riletta via API→Work/Quaderno; cambio edizione/deep link e logout. Non mock HTTP, non una beta remota.

Review richiesta a S00: re-export Shell e compatibilità View/focus. Review richiesta agli owner S01/S06/S08: adozione esplicita degli stati nelle proprie feature, con almeno un journey eseguito da ciascuno. Le feature correnti ereditano già il contesto Shell; non si dichiara review o adozione di nuovo codice altrui non osservata.
