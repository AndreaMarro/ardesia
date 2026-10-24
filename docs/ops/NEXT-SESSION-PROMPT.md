# ARDESIA — R2: accessi cloud verificati

Handoff del24 ottobre2026, aggiornato dopo le letture riuscite di Vercel e Render e la conferma umana del workspace. R2 rimane il lavoro attivo: nuovo branch `codex/ardesia-r2-experiences-20261024`, base300 `6a81d870fd1f390444ef5acbe6bc42203104fa63`; checkout `/private/tmp/ardesia-r2-20261024`. Nessun incremento applicativo R2 ancora completato. La preparazione degli accessi è ora verificata; riprendere R2 dal testo completo e dai checkpoint esistenti, conservando firma scientifica e gate remoti pendenti.

## Entrata obbligatoria

Generare project_state e rileggere AGENTS/package, CANON/PRODUCT/ARCHITECTURE/ADR0004, ultime voci RUNLOG e protocollo. Verificare live PR300/head/base/CI/review/concorrenza e proprio branch prima di editare. La baseline è stata riletta aperta/draft e verde: generale40111558218, marketing40111558207; Web locale324PASS con Node26.5.1. Il monorepo corrente prevale sugli snapshot di giugno. Consegna R1 e limiti restano in docs/deliveries/2026-10-24-r1.

## Accessi: usare fatti attuali

Render MCP è operativo in «My Workspace», `tea-d4gouafdiees73b2m8f0`: l’utente ha confermato «Usa My Workspace». Riutilizzare questa scelta senza richiederla, passando workspaceId esplicito. list_services, get_service e list_deploys hanno risposto con successo. La preview ardesia-golive02-preview serve il commit storico339ab08/#290, non il candidatoR1/R2; autoDeploy=no. La selezione di compatibilità di sessione non è l’autorità dei permessi. Le letture non certificano ogni operazione di scrittura.

Vercel è ora operativo nel team `team_23uD0RgdInaTaOPEL0EGltup`, scope `andreas-projects-6d4e9791`: get_project di ardesia-fisica-preview, list_projects(search=ardesia) e get_deployment sono riusciti sulla stessa connessione. Il403 storico è superato da queste risposte positive; non richiedere un nuovo consenso per la stessa connessione se non si manifesta un nuovo rifiuto. Progetto prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8, ultimo deployment letto dpl_6Ee5hXwDuQsDPeAaF9G8pfxAGSiE READY, SHA/branch non esposti; protezione SSO preview mantenuta. Non chiedere chiavi in chat o duplicare configurazioniCLI se MCP copre il bisogno; nessun link monouso inGit. Il mandato umano autorizza a sistemare questi accessi e compiere scelte ordinarie reversibili nei task; non attribuire capacità di scrittura collaudate a una sola lettura. Approvazioni dei contenuti, produzione/costi e azioni irreversibili conservano il perimetro umano già dichiarato.

## Ripresa R2

Il mandato allegato termina nella sezione3 alla voce «Fonte della lezione»: acquisire il seguito richiesto prima di fissare requisiti dipendenti dalla parte mancante. Lavoro preparatorio in work/r2: preflight e baseline, REA6.7.0 cached/Node26.5.1, missioniA/B/C/D separate; nessunMCPREA esposto o setupglobale eseguito. Goodnotesweb/login osservato ma replay nativo solo documentato; Brilliant onboarding non è lezione completata; H5P/Numbas e laboratorio mantengono checkpoint propri. Non chiamare queste osservazioni due trasferimenti funzionali già realizzati. Il Core ha già Taylor e Poiseuille: estrazione minima da valutare, non riscrittura o nuovoLMS/DB/solver.

| Priorità | Primo passo e dipendenze | Accettazione | Evidenza richiesta |
| --- | --- | --- | --- |
| 1 — Riprendere R2 con il testo completo | Recuperare il seguito del mandato troncato alla sezione3/«Fonte della lezione», rileggere head/CI/concorrenza e checkpointREA; accessi ora verificati. Dipende dal testo mancante per i requisiti successivi. | MissioniA/B/C/D con osservazioni e limiti autentici, almeno due trasferimenti funzionali nuovi con ownership separata e riusoCore/CoursePack. | Ticket ID/digest/licenze, specifica originale, RED/GREEN e UI reale; nessuna osservazione scambiata per funzione completata. |
| 2 — Preparare lo staging esatto | Confrontare le preview esistenti con l’artefattoR1 e i requisitiR2; usare team/workspace confermati, senza nuove richieste per la medesima scelta. Dipende da candidato stabilizzato e perimetro del deploy previsto dal mandato. | Target/branch/SHA/permessi espliciti; demo pubblica e beta Auth/Storage/inviti separate; nessun deploy o produzione impliciti nella connessione. | Binding fonte→artefatto→deploy e prove HTTPS effettive, protezioni mantenute e rollback documentato, costo dichiarato. |
| 3 — Chiudere i gate del prodotto | Dopo implementazione stabilizzare accessibilità, visuale e percorso docente/studente, poi review indipendente e memoria. Dipende da fonte finale e approvazioni umane previste. | Test/build appropriati e passaggi reali; aiuti/autonomia, revoca, isolamento, round-trip e pubblicazione esplicita preservati. | Log riproducibili, screenshot viewport richiesti, prove negative, digest e draftPR; readiness scientifica/remota non dedotta da test sintetici. |

## Memoria alla chiusura

Appendere fatti, risultati, ragioni, alternative, errori/correzioni e limiti datati; mantenere prefisso RUNLOG e3–5task con dipendenze/accettazione/evidenza. Se un consenso viene completato dopo questo checkpoint, appendere l’esito datato invece di riscrivere lo stato pendente precedente. Credenziali, email del provider, link di consenso e rawdonor restano fuoriGit; AgentMemory esterno non è stato modificato. Nessun deploy, servizio creato, migrazione o scheduler eseguito per provare l’accesso.
