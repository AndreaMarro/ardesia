# ARDESIA — accessi cloud prima di proseguire R2

Handoff del24 ottobre2026, aggiornato dopo la richiesta umana di rendere operativi Vercel e Render. R2 rimane il lavoro attivo: nuovo branch `codex/ardesia-r2-experiences-20261024`, base300 `6a81d870fd1f390444ef5acbe6bc42203104fa63`; checkout `/private/tmp/ardesia-r2-20261024`. Nessun incremento applicativo R2 ancora completato. La priorità accessi sostituisce il primo passo operativo R1, senza cancellare firma scientifica e gate remoti pendenti.

## Entrata obbligatoria

Generare project_state e rileggere AGENTS/package, CANON/PRODUCT/ARCHITECTURE/ADR0004, ultime voci RUNLOG e protocollo. Verificare live PR300/head/base/CI/review/concorrenza e proprio branch prima di editare. La baseline è stata riletta aperta/draft e verde: generale40111558218, marketing40111558207; Web locale324PASS con Node26.5.1. Il monorepo corrente prevale sugli snapshot di giugno. Consegna R1 e limiti restano in docs/deliveries/2026-10-24-r1.

## Accessi: usare fatti attuali

Render MCP è operativo in «My Workspace», `tea-d4gouafdiees73b2m8f0`: l’utente ha confermato «Usa My Workspace». Riutilizzare questa scelta senza richiederla, passando workspaceId esplicito. list_services, get_service e list_deploys hanno risposto con successo. La preview ardesia-golive02-preview serve il commit storico339ab08/#290, non il candidatoR1/R2; autoDeploy=no. La selezione di compatibilità di sessione non è l’autorità dei permessi. Le letture non certificano ogni operazione di scrittura.

Vercel team `team_23uD0RgdInaTaOPEL0EGltup`, scope `andreas-projects-6d4e9791`, probe `ardesia-fisica-preview`: ultima lettura403, link monouso10min presentato in chat. Non salvarlo inGit né riutilizzare link scaduti. Dopo consenso umano ritentare la stessa richiesta sulla stessa connessione: solo successo effettivo chiude il blocco. Non chiedere chiavi in chat e non duplicare configurazioniCLI se MCP copre il bisogno. Il mandato umano autorizza a sistemare questi accessi e compiere scelte ordinarie reversibili nei task; non attribuire capacità di scrittura collaudate a una sola lettura. Approvazioni dei contenuti, produzione/costi e azioni irreversibili conservano il perimetro umano già dichiarato.

## Ripresa R2

Il mandato allegato termina nella sezione3 alla voce «Fonte della lezione»: acquisire il seguito richiesto prima di fissare requisiti dipendenti dalla parte mancante. Lavoro preparatorio in work/r2: preflight e baseline, REA6.7.0 cached/Node26.5.1, missioniA/B/C/D separate; nessunMCPREA esposto o setupglobale eseguito. Goodnotesweb/login osservato ma replay nativo solo documentato; Brilliant onboarding non è lezione completata; H5P/Numbas e laboratorio mantengono checkpoint propri. Non chiamare queste osservazioni due trasferimenti funzionali già realizzati. Il Core ha già Taylor e Poiseuille: estrazione minima da valutare, non riscrittura o nuovoLMS/DB/solver.

| Priorità | Primo passo e dipendenze | Accettazione | Evidenza richiesta |
| --- | --- | --- | --- |
| 1 — Completare Vercel | Approvazione umana del consenso del provider, poi ripetere get_project sulla stessa connessione/team. Rigenerare il link soltanto se scaduto; non salvarlo in Git. | Lettura del progetto riuscita e perimetro dichiarato; il403 resta aperto fino alla controprova positiva. | Timestamp, team/progetto e risposta effettiva; nessun token o link monouso nei documenti. |
| 2 — Identificare lo staging del candidato | Usare il workspace Render già confermato, con workspaceId esplicito, e riconciliare servizio/branch/SHA con la consegnaR1 e i gate remoti. Dipende dal target autorizzato e dall’accessoVercel per il relativo confronto. | Preview storica distinta dal candidato corrente e dalla beta con Auth/Storage/inviti; nessuna nuova infrastruttura implicita. | Letture servizio/deploy, SHA servito e prove remote effettive, con blocchi e operazioni non eseguite dichiarati. |
| 3 — Riprendere R2 | Acquisire il seguito del mandato dopo sezione3/«Fonte della lezione», poi rileggere head/CI/concorrenza e checkpointREA. Dipende da testo completo e priorità accessi conclusa. | Quattro missioni con limiti autentici e almeno due trasferimenti nuovi utilizzabili, riusando Core/CoursePack e modelli esistenti. | Ticket ID/digest/licenze, RED/GREEN, UI reale, test/build, review indipendente e memoria aggiornata. |

## Memoria alla chiusura

Appendere fatti, risultati, ragioni, alternative, errori/correzioni e limiti datati; mantenere prefisso RUNLOG e3–5task con dipendenze/accettazione/evidenza. Se un consenso viene completato dopo questo checkpoint, appendere l’esito datato invece di riscrivere lo stato pendente precedente. Credenziali, email del provider, link di consenso e rawdonor restano fuoriGit; AgentMemory esterno non è stato modificato. Nessun deploy, servizio creato, migrazione o scheduler eseguito per provare l’accesso.
