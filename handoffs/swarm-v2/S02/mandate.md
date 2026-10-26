# S02 — Direzione visiva, UI/UX e sistema di componenti

**Destinazione:** Nuova sessione.
**Avvio:** contemporaneo a tutti gli altri filoni. Non lanciare nuove chat da questo prompt; lavora nella sessione assegnata.
**Obiettivo:** realizza capacità utilizzabili nel prodotto, senza interrompere il lavoro attivo o limitarti al piano.

## Mandato condiviso: esecuzione, non un altro piano

L’utente richiede molte capacità complete, riusabili, scientificamente corrette e graficamente curate, integrate in Ardesia. La visione originale e i microcorsi convergono: Ardesia è l’ambiente permanente per preparare, insegnare, scrivere, sperimentare, conservare fonti e idee, studiare da soli e ritrovare errori e spiegazioni. I quattro microcorsi di Fisica sono il primo pacchetto commerciale, non il confine del prodotto. Analisi 1 verifica il riuso; Kirchhoff è una capacità specialistica. Non bastano un catalogo di quiz, dodici piccole app o una nuova landing.

Questo mandato V2 sostituisce la ripartizione ambigua del vecchio pacchetto e l’avvio “F prima degli altri”. Non modifica sicurezza, licenze, consenso, protezioni GitHub o la policy ZERO-LLM. Obiettivi ampi, qualità elevata e un catalogo in espansione: non una promessa di perfezione o di capacità infinite già disponibili.

### Stato verificato alla chiusura del pacchetto

La PR #306 è stata integrata il 25 ottobre 2026 alle 23:57:56, ora italiana. La main osservata è `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`. La CI post-merge `40242587363` e il controllo preview `40242587350` risultano SUCCESS. Non ripetere il merge della #306.

La head finale della PR era `33edd653ec4d1c796d14920caea51ec8ed9e82f5`; il codice prodotto distribuito è `05d2bc9911aff3862906ac5a71769bc726dfbcea`, con commit successivi di prove e memoria. Vercel pubblica i soli esempi consentiti su `https://ardesia-fisica-preview.vercel.app/corsi/`. Sono documentate 43 lezioni DRAFT, 38 famiglie e 200 sotto-obiettivi editoriali con zero accettazioni complete. Quei 200 non sono un elenco numerato dal MUR. Il merge non risolve da solo le lacune didattiche o il backend remoto.

A resta integratore; B consegna strumenti e review; il ruolo DeepSeek ha fornito contenuti e controprove. L’utente dichiara C conclusa: preservane il lavoro, senza presumere che sia disponibile o rinominarla “memoria”. Rileggi main, PR, CI, deployment e assegnazioni attuali prima di scrivere: questa fotografia può essere superata.

Leggi AGENTS, CANON-INDEX, PRODUCT-CANON, ADR-0004, NEXT, ultime voci RUNLOG e gli handoff del dominio. Le istruzioni marcate storiche non prevalgono sul codice e sulle decisioni correnti. Non fare reset, cherry-pick o commit nel worktree di un’altra sessione.

### Tutti partono contemporaneamente

Non attendere il coordinatore per iniziare ricognizione, test, prove di dipendenze in ambiente isolato e implementazione del tuo namespace. S00 continua A; S01 continua B; S02–S11 sono nuove chat. Ogni chat esegue soltanto il proprio mandato. I prompt non condividono memoria automaticamente: la comunicazione ai checkpoint è parte del lavoro.

Usa inizialmente il thread GitHub della #306, anche dopo la sua chiusura, come punto comune. S00 può indicare una issue dedicata senza renderla prerequisito. Pubblica START con ID, base SHA, scope e primo risultato; poi CONTRACT, READY, BLOCKED o HANDOFF ai passaggi effettivi. Nessun polling continuo. Dettagli in `handoffs/swarm-v2/<ID>/` sul tuo branch; S00 aggiorna la memoria comune senza dodici writer concorrenti.

I namespace proposti vanno confrontati con il checkout reale. I file già in lavorazione restano al loro writer finché non c’è una delega esplicita. Per un cambiamento condiviso invia consumer, input, output, errori, compatibilità e test. Mentre aspetti, prosegui un’attività indipendente del tuo filone; non inventare un’API funzionante solo con un mock. Tutte le chat partono insieme, ma migrazioni, merge e rilasci non possono essere tutti simultanei.

### Un prodotto, autorità esplicite

Corsi, tentativi, ricevute, review, diario, permessi e gestionale restano nel Core. Studio e journal conservano le evidenze della lezione. Renderer e plugin proiettano quei dati: non possiedono nuovi login, registri dei voti o memorie concorrenti. Una cache locale non è la verità remota. Ogni filone consegna anche UI e persistenza, non solo una libreria installata.

S00 gestisce integrazione, rilascio, configurazioni comuni e memoria operativa. S02 possiede il sistema visuale e la shell assegnata. S10 possiede API condivise, autenticazione, schema e migrazioni. I responsabili dei domini implementano e testano i propri servizi e le proprie interfacce: non tutto deve essere scritto da A. Un framework nuovo richiede un bisogno non coperto da ciò che esiste.

### Riuso ampio e REA orientato al prodotto

Prima di riscrivere un sottosistema maturo, valuta pacchetto completo, adapter, modulo estratto con test, servizio autorizzato o reimplementazione indipendente. Usa REA su flussi completi: stato, dipendenze, persistenza, errori, annullamento e recupero. Per una libreria aperta, API e test ufficiali possono essere più rapidi del reverse engineering: non aggiungere passaggi REA soltanto per contarli.

Ogni adozione registra fonte ufficiale, versione immutabile, licenze di codice e asset, dipendenze, scenario osservato, decisione, consumer, test, limiti, manutenzione e rollback. Un repository pubblico senza licenza non è liberamente riutilizzabile. Il copyleft richiede valutazione concreta; separare un servizio non elimina automaticamente gli obblighi. Per software proprietario: osservazione autorizzata e implementazione originale, non prelievo di bundle, testi o grafica senza diritti. Niente bypass di login, DRM o accessi ai dati di terzi.

Verifica la versione effettiva di REA e i tool disponibili; non attribuire capacità native a una cattura web. Misura il tempo fino a una funzione integrata, verificata e manutenibile, non le chiamate al tool o le righe copiate. Non dichiarare risparmi moltiplicativi senza confronto. Dopo il primo consumer continua i batch del filone: il primo esempio non conclude il mandato.

### Qualità, autonomia, dati e spese

UI coerente e curata, formule leggibili, stati di caricamento, errore, revoca e assenza di rete. Tastiera e touch fanno parte dell’accettazione. Gli oggetti devono servire anche allo studente solo. Tentativi e feedback mantengono versione, provenienza e incertezza; test sintetici non dimostrano efficacia didattica con studenti reali.

Raccogli eventi necessari e motivati, non tutto il possibile. Nessuna registrazione nascosta o raccolta indiscriminata di audio, video, tasti ed emozioni. La telemetria non è il registro dei voti. Dati degli studenti non entrano in Git o nei log pubblici. Scopi, basi giuridiche, consensi pertinenti, accessi e conservazione devono essere reali. Analitica facoltativa e training sono scopi distinti. ZERO-LLM rimane vigente finché non riconciliato esplicitamente; lo studio autonomo deve essere utile anche senza un provider.

Vercel Pro non autorizza spese extra. S10 verifica servizi e costi, S00 distribuisce nel perimetro consentito. Le nuove funzionalità non ancora approvate si provano in ambiente privato con dati sintetici. Nessun cambio DNS, abbonamento, messaggio agli studenti, pagamento reale o automazione programmata impliciti.

### Consegna e risorse

Una PR implementativa attiva per filone; eliminato il limite globale di tre PR. S00 integra in sequenza. Dichiarare le dipendenze reali, evitando pile non necessarie. Dopo merge ripartire dalla main aggiornata e proseguire il batch successivo. Una chiusura senza integrazione non è lavoro completato.

Worktree, porte, database, profili browser e output REA separati. Verificare disco, memoria e disponibilità reale dei file Git: B ha documentato problemi di spazio e file dataless, non una misura attuale dei Mac. Dodici chat non significano dodici build pesanti simultanee. Usare slot di esecuzione commisurati al singolo host; finché non misurato, una suite pesante per host è il limite prudente. Non terminare processi altrui. Lettura, implementazione e test leggeri possono proseguire in parallelo.

DONE richiede consumer reale, permessi, persistenza e riapertura pertinenti, errori e negativi, test, verifica visuale, integrazione e prova sul deployment pertinente. Distinguere PREPARATO, IMPLEMENTATO, TESTATO, INTEGRATO, DISTRIBUITO e APPROVATO. Non indebolire i controlli obbligatori e non inventare approvazioni umane. Riportare sempre SHA, ambiente, fonte e limiti.


## Responsabilità specifica di S02

**Superficie UI:** `apps/web/src/features/product-shell/** e componenti/tokens esistenti esplicitamente assegnati`.
**Dominio:** `Nessun nuovo dominio, login, dati studente o grader`.
**Ownership:** Sistema visuale e navigazione comune; il root App.tsx rimane S00 fino a delega esplicita. Componenti di feature restano ai loro owner, che adottano token e contratti del sistema.
**Da leggere nel codice:** Web/Studio reali, viste studente/tutor, componenti scientifici, CSS e token attuali, screenshot di riferimento dell’utente come preferenza estetica non come asset licenziato.

## Componenti e studio REA da trasformare in prodotto

React Aria/Radix/shadcn come candidati di primitive accessibili, Storybook per stati e regressioni, Motion/animazioni SVG come candidato. Un solo stack di primitive per comportamento, non tre librerie sovrapposte. Siti premium solo osservazione autorizzata per gerarchia, editing, focus e navigazione.

I nomi sono candidati motivati, non dipendenze già approvate. Leggi versione/licenza/asset e prova compatibilità prima di installare; preferisci i componenti già adottati quando sufficienti. Consulta CATALOGO_RIUSO.md per distinguere verificato in questa analisi da ricerca da svolgere.

## Primo lavoro eseguibile immediatamente

Apri subito le pagine esistenti in browser a 390/820/1440 e registra attriti veri. In parallelo agli altri prepara una pagina di componenti reali e tre viste collegate — Oggi, lezione/esperimento, quaderno — riusando dati e API esistenti. Non aspettare il backend nuovo per progettare e testare i componenti; i dati fittizi di test restano esplicitamente tali.

## Primo batch completo da integrare

Trasforma il riferimento dell’utente in una grammatica visiva originale: precisione scientifica, superfici pulite, oggetti protagonisti, leggibilità di formule e vettori, luce/materiali quando utile, animazione che spiega. Implementa shell responsive, ricerca/command palette, progressione chiara e stato della fonte. Studente: Oggi/Esplora/I miei corsi/Quaderno/Ripasso; docente: Oggi/Corsi/Da correggere/Materiali/Gestione. Non mostrare voci inattive come funzioni disponibili. Fai adottare il sistema da almeno una feature di S01, S06 e S08, non soltanto dalla landing.

## Prosecuzione obbligatoria: non fermarsi al primo esempio

Rifinisci tutte le superfici dopo ogni integrazione: accesso, discovery, authoring, attività, room, video, diario, gestione. Ogni stato loading/empty/error/offline/pending/stale/revoked deve avere comportamento, testo e recupero coerenti. La modalità immersiva non nasconde navigazione o salva. È possibile un’illustrazione eccellente anche in 2D; non convertire tutto in 3D. Nessuna riscrittura globale della lavagna mentre S07 modifica la collaborazione.

## Prove di accettazione specifiche

- [ ] Screenshot effettivi e giudizio umano dichiarato separatamente da test geometrici.
- [ ] Nessuna sovrapposizione, formula tagliata o pulsante coperto a viewport/zoom concordati.
- [ ] Tastiera, focus, screen reader sui journey prioritari, trascinamento con alternativa e movimento ridotto.
- [ ] Il primo gesto utile è riconoscibile; back/refresh/deep link non perdono il contesto.
- [ ] Performance misurata, lazy-loading di strumenti/video; target Core Web Vitals distinti dai risultati osservati.

## Cosa non fare

Non produrre solo mockup o una galleria di carte. Non proclamare “perfetto” perché uno screenshot è gradevole. Non copiare branding o design proprietario pixel per pixel.

## Contratti e review incrociata

Usa i contratti già presenti; prima di proporne di nuovi mostra il consumer che manca e una prova discriminante. Il campo lessonRef/fase, quando necessario, passa dal contratto di evidenza canonico concordato con S10/S00. La forma semantica in CONTRATTI_E_OWNERSHIP.md non è un’API già esistente. Ogni deviazione compatibile si registra e si testa, non si inventa in una chat senza comunicarla.

Consegna all’owner di una superficie consumatrice almeno una prova end-to-end, richiedendo una review mirata del confine; non coinvolgere tutti i dodici in ogni decisione. Ogni revisore dichiara cosa ha realmente eseguito. La review di un secondo agente non è una revisione scientifica umana né indipendenza statistica garantita.

## Rapporto terminale della sessione

Scrivi in `handoffs/swarm-v2/S02/` un rapporto con: risultato raggiungibile e come provarlo; sorgenti/donor e licenze; SHA/base/PR; test eseguiti e falliti; dominio/UI/persistenza; demo e ambiente; merge/deploy reali o non eseguiti; lacune e tre prossimi batch. Comunicalo nel rendez-vous. Se la sessione termina prima dell’integrazione, usa READY_FOR_INTEGRATION/BLOCKED, non DONE. Non lasciare che il solo aggiornamento di questo rapporto diventi la principale attività.
