# AGENTMEMORY-SEMANTIC-PROTOCOL

> Per le sessioni correnti vale l'[addendum del 24 ottobre 2026](#addendum-24-ottobre-2026-memoria-git-per-ogni-sessione). Le indicazioni Mini/REST precedenti all'addendum sono il protocollo storico del luglio 2026, non una rilevazione del servizio attuale.

Version: 2026-07-01 04:45 CEST  
Status: operational protocol for meaningful ARDESIA memory.

## Role

AgentMemory is the factory memory fabric, not the source of truth.

It should help agents recall verified decisions, failures, context packets, and next actions. It must not replace filesystem, GitHub, Vercel, tests, logs, or official docs.

## What "True Sense" Means

Useful memory has four parts:

1. a verified outcome or decision;
2. evidence source or file path;
3. concepts that future agents will actually search;
4. the next implication or guardrail.

Bad memory is:

- raw long logs;
- generic "worked on ARDESIA";
- broad project summaries without evidence;
- unverified claims copied from chat;
- secrets, env values, PII, or real student corpus content.

## Recall Before Work

Before diagnosis or planning, do a narrow recall.

Use 2-4 precise concepts from the current task, for example:

- `ardesia-factory-routing`;
- `headroom-context-packet`;
- `agentmemory-degraded`;
- `chatgpt-apps-fastapi-mcp`;
- `demo-vertical-slice`;
- `monorepo-cutover`.

Preferred REST call on the Mini:

```bash
curl -fsS -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H "content-type: application/json" \
  --data '{"query":"ardesia factory routing headroom","limit":5}'
```

If recall is low-signal, say so and continue from primary sources.

If AgentMemory is degraded, keep queries small and avoid exploratory broad searches.

## Remember After Work

After a material outcome, save exactly one short memory unless multiple independent decisions were verified.

Required fields:

- project: `ardesia`;
- content: 1-4 sentences, verified only;
- concepts: 3-7 concrete terms;
- files: real paths touched or used as evidence when available;
- status words such as `verified`, `not_proven`, `target`, or `blocked`.

Preferred REST call on the Mini:

```bash
curl -fsS -X POST http://127.0.0.1:3111/agentmemory/remember \
  -H "content-type: application/json" \
  --data '{"project":"ardesia","content":"Verified outcome here.","concepts":["ardesia","headroom"],"files":["docs/ops/NEXT-AUTOMATION-PACKET.md"]}'
```

If save fails, append the memory payload to `docs/ops/SCHEDULED-ACTIVITY-LOG.md` under a `Memory fallback` note.

## Memory Taxonomy

Use concepts from this controlled set when possible:

- `ardesia-product-truth`
- `ardesia-monorepo-cutover`
- `ardesia-demo-vertical-slice`
- `ardesia-factory-routing`
- `headroom-context-packet`
- `opus-quota`
- `hermes-minimax-m3`
- `gpt-55-hermes-target`
- `agentmemory-semantic-protocol`
- `agentmemory-degraded`
- `fastapi-chatgpt-mcp-gateway`
- `vercel-preview`
- `github-repo-map`
- `lesson-os-graph`
- `simulation-plugin`
- `elab-pack`

New concepts are allowed when they are specific and likely to be reused.

## Scheduled Automation Requirements

Every scheduled ARDESIA run must:

1. read `docs/ops/ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS.md`;
2. recall AgentMemory with 2-4 precise concepts;
3. state whether recall was useful;
4. do one verified micro-task;
5. remember one verified result;
6. update `NEXT-AUTOMATION-PACKET.md` and `SCHEDULED-ACTIVITY-LOG.md`.

## Health Protocol

If AgentMemory is degraded/critical:

- no bulk import;
- no full export reads;
- no restart or compaction without explicit maintenance decision;
- keep recall/remember payloads short;
- document heap/status and continue with filesystem evidence.

## COV

- Based on the installed AgentMemory skills and live REST endpoints used in prior ARDESIA checks.
- Treat this as protocol. Actual memories still require live save verification.

## Addendum 24 ottobre 2026: memoria Git per ogni sessione

### Autorità e ambito

La memoria progettuale operativa è nel repository canonico `AndreaMarro/ardesia`. Questo addendum completa M9 e i §§13.4–14 del mandato del 24 ottobre riusando i documenti esistenti. Non istituisce un secondo registro, un daemon o un'automazione pianificata. L'aggiornamento è lavoro esplicito dell'agente a ogni sessione sostanziale; queste istruzioni non garantiscono che ogni host le esegua automaticamente.

| Fonte | Responsabilità |
| --- | --- |
| `bin/state/project_state.py` → `docs/ops/CURRENT.md`, `artifacts/state/project.json` | Stato tecnico generato, con data, SHA e campi UNAVAILABLE; mai correggere manualmente l'output. |
| Sorgenti, GitHub, test e ricevute pertinenti | Prove primarie da confrontare con la rilevazione; una CI passata vale per il proprio SHA. |
| Canoni e ADR indicati da `docs/CANON-INDEX.md` | Visione, contratti e decisioni autorevoli; una proposta nel registro non li modifica da sola. |
| `docs/ops/ARDESIA-RUNLOG.md` | Cronologia append-only di esiti, motivazioni, errori, correzioni e suggerimenti formulati in quel momento; non è stato live. |
| `docs/ops/NEXT-SESSION-PROMPT.md` | Handoff corrente: contesto minimo, fonti, primo incremento, dipendenze e gate; revisioni precedenti conservate in Git. |
| `docs/deliveries/<data>/` e manifest | Snapshot delle consegne e delle prove; non attribuire retroattivamente risultati a un nuovo candidato. |

**Servizio AgentMemory esterno: stato corrente UNKNOWN.** `AGENTMEMORY-HEALTH-STATUS.md` contiene una misura sul Mini del 2 luglio, allora degradata; non dimostra né salute né guasto oggi. Questa sessione non ha verificato o modificato il servizio. Non assumere che `localhost:3111` sul runner corrente sia il Mini. La manutenzione di questi Markdown non implica restart, import, compaction o nuovi scheduler.

Quando disponibile e verificato nel contesto autorizzato, il servizio può assistere il recall come cache. Non è necessario per continuare sul repository. I riferimenti storici a `ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS.md`, `NEXT-AUTOMATION-PACKET.md` e `SCHEDULED-ACTIVITY-LOG.md` non risolvono nel checkout esaminato il 24 ottobre: il fallback corrente è RUNLOG + NEXT-SESSION-PROMPT, non la creazione di registri paralleli.

### Ingresso: recuperare e verificare

1. Leggere AGENTS root e dei package interessati. Rigenerare lo stato con il comando canonico nell'ambiente di lavoro; per un incarico strettamente read-only, leggere l'ultimo output come snapshot e indicarne la data senza scriverlo. Una rilevazione offline lascia PR, CI e deploy non osservati come UNAVAILABLE.
2. Leggere NEXT-SESSION-PROMPT, le ultime voci pertinenti del RUNLOG e i contratti richiamati. Cercare per il problema concreto, senza importare ogni vecchio rapporto nel contesto.
3. Confrontare HEAD/base, branch, PR aperte, ownership e prove sul candidato attuale. Dichiarare le fonti non accessibili. Non inferire merge, disponibilità prodotto o accettazione da vecchie note o badge.
4. Scegliere un incremento verificabile e compatibile con il mandato. Se il primo task suggerito è concluso, superato o in conflitto, registrare il motivo e aggiornare l'handoff anziché duplicarlo.

### Contenuto obbligatorio di una nuova voce

Registrare ciò che cambia una decisione, non la trascrizione della chat:

- Data, ambito, branch e SHA oppure base+diff/manifest; PR e prove quando esistono.
- Risultato e stato distinti: proposta, implementazione, verifica nell'ambiente indicato, blocco o NOT_RUN. Separare prove proprie, esecuzioni altrui e dichiarazioni dei documenti.
- Scelta compiuta e motivo; alternativa scartata e motivo; documento autorevole e ratifica pendente quando applicabili.
- Errore o ipotesi smentita, riproduzione, correzione ed effetto sulle prove. Dichiarare l'assenza di finding quando pertinente, senza inventarne uno.
- Un apprendimento specifico riutilizzabile, la conseguenza pratica e i limiti rimasti; evitare “lavoro completato” senza dettaglio.
- In fondo, **3–5 task prioritizzati**, ciascuno con primo passo concreto, dipendenze/ownership da verificare, criterio di accettazione e fonte da leggere o prova da produrre. Distinguere il primo task eseguibile dalle attività dipendenti. I suggerimenti non sono nuovi permessi.

Conservare i dettagli voluminosi nelle prove collegate. Escludere segreti, corpus privati e dati personali; citare artefatti pubblicabili e percorsi realmente risolvibili.

### Chiusura, conflitti e miglioramento

Prima del passaggio di consegne, appendere la voce, aggiornare NEXT-SESSION-PROMPT con punto di ingresso e task ancora validi, controllare link e coerenza con lo stato generato. Se non è pubblicato, dichiarare “modifica locale / pubblicazione pendente”. La chiusura elenca file di memoria aggiornati e verifiche rimaste; non rivendica un salvataggio nel servizio esterno senza prova.

Quando emergono contraddizioni, aggiungere una correzione datata che richiami la voce/commit precedente, la nuova prova e la conseguenza. Non cancellare il RED o riscrivere una prova vecchia come se il risultato fosse sempre stato noto. L'handoff può sostituire istruzioni operative superate indicando data e motivo; registro e Git preservano la versione precedente. Una supersessione documentale non ratifica una policy di prodotto, non autorizza deploy e non scavalca le istruzioni dell'utente.

### Cinque controlli di chiusura

| Controllo | Esito richiesto |
| --- | --- |
| Freschezza | HEAD/base e data identificati; PR/CI/ownership riletti oppure UNAVAILABLE esplicito. |
| Evidenza | Ogni PASS significativo ha fonte, ambiente e scope; NOT_RUN e fallimenti conservati restano visibili. |
| Apprendimento | Scelta, alternativa scartata, errore/correzione o assenza di finding e insight concreto registrati. |
| Prossimo lavoro | Voce conclusa con 3–5 task motivati e verificabili; NEXT-SESSION-PROMPT indica il primo, dipendenze e gate senza duplicare canoni. |
| Continuità | Link risolvibili, supersessioni datate, storia preservata e pubblicazione dichiarata correttamente; nessuna dipendenza obbligatoria dal servizio AgentMemory esterno. |


### Riscontro24ottobre2026 — handoff, prove e revoca

La consegna[REA Deep Build](../deliveries/2026-10-24-rea-deep-build/README.md) aggiunge tre apprendimenti verificati al protocollo, senza cambiare autorità o attivare servizi: (1) dopo un await un descrittore può essere obsoleto, quindi registrare il punto di linearizzazione e la controprova controllata; (2) confrontare bytes/manifest dei file serviti, non solo esito del percorso o nome del ramo; (3) distinguere licenza del tool, diritti dell'asset e cronologia osservazione→implementazione, conservando le correzioni datate. I ticketREA dichiarano confronto successivo quando tale, eventi incompleti e costoUNKNOWN. RUNLOG mantiene il prefisso Git precedente; nessun salvataggio nel servizio esterno rivendicato.
