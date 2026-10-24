# ARDESIA — prossimo mandato operativo

Aggiornamento: 24 ottobre 2026, Europe/Rome. Questo handoff supera l'elenco di lavori del [mandato eseguito alla base ae25b93b](https://github.com/AndreaMarro/ardesia/blob/ae25b93bec826539940e0226da1f0cd8cebff0b1/docs/ops/NEXT-SESSION-PROMPT.md). La storia resta nel RUNLOG e in Git.

## Ingresso obbligatorio

1. Eseguire `python3 bin/state/project_state.py`; leggere AGENTS e i package interessati, CANON-INDEX, ultime voci RUNLOG e addendum 24 ottobre del protocollo AgentMemory.
2. Verificare head/base/stato della draft nel ramo `codex/ardesia-audio-v2-poiseuille-20261024`, dipendente da #297 (`ae25b93bec826539940e0226da1f0cd8cebff0b1`). Candidato prodotto verificato: **e1be6c9ea0a19b90d53a9e4d8a38dac5846c1270**. La PR di incremento è **[draft PR #298](https://github.com/AndreaMarro/ardesia/pull/298)**. Rileggere CI e lavori concorrenti: nessun risultato si trasferisce automaticamente a un altro SHA o al lungo stack integrato.
3. Leggere integralmente [consegna e percorso utilizzabile](../deliveries/2026-10-24-audio-v2/README.md), [validazione](../deliveries/2026-10-24-audio-v2/validation.md), [review indipendente](../deliveries/2026-10-24-audio-v2/evidence/review/independent-review.md) e addendum AUDIO-V2 del [contratto canonico](../deliveries/2026-10-24-convergence/multimodal-mcp-contracts.md).

## Stato di uscita da preservare

- CI-CATALOG: spec originale eseguita nel runtime Node26.5.1 del lock; controprova deterministica di popstate prima del listener passivo, distinta da commit React/routing. Listener in layout effect, rifiuto obsoleto e getByRole conservati. Il singolo fallimento storico 40083426275 non è stato riprodotto identicamente e resta registrato.
- AUDIO-V2: Room → sessione CAS → media → marker journal v2 → replay → bundle canonico reader2 → nuovo store. Registrazioni distinte, pause, fine/tail, riferimenti sessione/digest/oggetto/versione e revoca accessibili dalla UI. Nessun avvio dal solo consenso salvato. OFF locale esplicito prevale su import concorrente e revisione esterna falsificata; revoca delle aperture precedenti disponibile. Le copie esportate esterne non sono cancellabili retroattivamente.
- Poiseuille: docente annota/registra/condivide fonte; studente prevede prima del risultato, distingue Δp fissata/Q fissata, recupera il passaggio esatto e affronta un problema diverso; docente ritrova ricevute, revisione e diario. Core, PhysicsLab, CoursePack e domini esistenti sono riusati; due varianti editoriali, nessun nuovo ledger o provider.
- Prove sintetiche Chromium: 20 controlli Studio e 20 docente/studente; desktop/390px, tastiera, movimento ridotto, font locali. Nel run finale il trasferimento con risultato precedente disponibile è correttamente SUPPORT_REQUESTED. I test Core verificano anche NO_SUPPORT_REQUESTED; nessuna etichetta dimostra assenza di aiuti esterni o padronanza.
- Full locali: Studio2232 PASS/5 SKIP, Web299 PASS, Engine2628 PASS/27 SKIP; Core/API851 PASS/30 SKIP prima degli ultimi fix, poi otto test mirati. Gate, MCP e CI: leggere la tabella finale della validazione e la head della PR. Nessun gate o timeout è stato indebolito.
- CI del prodotto `e1be6c9e`: generale40088667039 (7job), marketing40088667042 e readiness40088667046 SUCCESS. Il commit documentale successivo richiede la propria CI; leggere la head della draft e la consegna finale.
- REA E3: due acquisizioni reali e oracolo18/18; catena osservazione→specifica→implementazione→test documentata. Preparazione, analisi e costo complessivo dei due metodi non misurati integralmente: nessun risparmio dichiarato, confronto economico UNKNOWN.

Limiti: stesso archivio locale o import del bundle per il replay; il riferimento non trasferisce media né concede accesso cloud. Engine ingest legacy non legge ancora il bundle canonico reader2. Microfono fisico/FSA/altri browser, auth/RLS remota, revisione scientifica umana ed efficacia didattica restano da provare. MCP mantiene quattro letture; nessun writer è stato aggiunto. Nessun merge, deploy, pagamento, provider live, dato reale o scheduler.

## Prossimo incremento consigliato — prima proposta privata MCP

Dopo il controllo del candidato e dei gate, leggere la [RFC #293](https://github.com/AndreaMarro/ardesia/blob/5a4d89312f6a46e3a0dd435e6c040b3c134ba9f5/docs/product/MCP-CORRECTION-WRITE-CORE-REUSE-RFC-2026-10-24.md). Implementare un solo comando `feedback.propose_private_revision` attraverso i servizi Core esistenti. Non creare pubblicazione agente, secondo Core o copie di tentativi/ruoli.

Partire dai RED: accesso studente, docente non autorizzato/revocato, retry, conflitto di revisione, digest della candidate e dati privati. La proposta resta privata; il docente pubblica intenzionalmente l'esatta revisione e ne verifica la visibilità. Conservare le quattro letture e collaudare un solo host nominato via SDK reale. Non dichiarare host provati a partire da soli test di protocollo.

L'autorizzazione al lavoro successivo va verificata nella nuova richiesta umana; questo handoff non autorizza da solo mutazioni future. Quando il lavoro è autorizzato, risolvere autonomamente le scelte reversibili e completare codice, UI necessaria, prove, review, memoria e draft PR isolata. Non allargare a tutti gli host o a tutte le scritture.

## Memoria e accettazione

RUNLOG append-only: base/SHA, decisioni e motivi, alternative scartate, errori/correzioni, RED/GREEN, risultati e limiti. Datare le smentite senza cancellare il passato. Aggiornare questo handoff e terminare la nuova voce con 3–5 task: beneficio, primo passo, dipendenze, accettazione, prova richiesta. AgentMemory esterno resta cache opzionale, non servizio da riattivare né automatismo garantito. Non creare attività programmate.

## Task prioritizzati dopo il controllo della head

| Priorità / beneficio | Primo passo e dipendenze | Accettazione | Evidenza richiesta |
| --- | --- | --- | --- |
| 1 — MCP private revision: continuità del feedback | Leggere RFC #293 e mappare il comando Core; dipende dal candidato verificato e dall'autorizzazione del nuovo mandato. | Proposta privata versionata, rifiuti e conflitti, pubblicazione umana dell'esatta revisione; quattro letture preservate. | RED/GREEN W01–W18 pertinenti, SDK/stdio→HTTP/Core e un host nominato realmente collaudato. |
| 2 — Bundle Engine: continuità del consumer | Riprodurre il rifiuto attuale in `packages/engine/lessonos/ingest/bundle.py`; dipende dal contratto reader2 e dalle fixture native sintetiche. | Validazione esplicita compatibile, identità/digest/riferimenti preservati; versioni ignote e media corrotti rifiutati. | RED del consumer, test v1/v2/ostili e round-trip effettivo Studio→Engine; nessun downgrade. |
| 3 — Distribuzione autorizzata del passaggio | Inventariare storage/accessi già canonici; dipende dalla decisione di portare la funzione oltre il locale, senza nuovo store parallelo. | Secondo archivio/utente autorizzato risolve gli stessi byte; revoca e indisponibilità esplicite, nessuna fuga cross-room. | HTTP/Auth/RLS/Storage reali in ambiente isolato, due utenti e riferimenti alterati; costi/limiti dichiarati. |
| 4 — Pilot didattico e dispositivi | Preparare revisione umana delle due varianti e protocollo di prova; dipende da consenso/dati e perimetro autorizzati. | Docente/studenti distinguono i vincoli e il tipo di aiuto; prova nuova con criteri prefissati; cattura fisica e mobile utilizzabili. | Review scientifica umana distinta dai test sintetici, microfono/FSA/browser nominati, errori e costi completi; nessun claim di efficacia senza misura. |
