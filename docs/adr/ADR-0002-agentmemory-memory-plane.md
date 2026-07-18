# ADR-0002 — [HISTORICAL] Proposta AgentMemory come memory-plane, non connettore universale

- **Stato**: PROPOSED — PLANNED TO BE SUPERSEDED (decisione canon = Andrea; nessuna implementazione o cutover da questo ADR)
- **Data**: 2026-07-05
- **Contesto**: domanda architetturale di Andrea — *"AgentMemory dovrebbe collegare tutta l'infrastruttura hardware e software? Altre soluzioni?"* Questo ADR mette la scelta a decisione, per evitare di ricreare un monolite a livello infra proprio mentre si smonta ELAB-standalone.

> **Nota di evoluzione aggiornata 2026-07-18:** questo documento conserva la proposta originaria e non prova lo
> stato runtime corrente. `ADR-0003-markdown-git-basic-memory-plane.md` propone di sostituirla con
> Markdown/Git/Obsidian come fonte canonica e Basic Memory come indice ricostruibile. Anche ADR-0003
> resta **PROPOSED / NO CUTOVER**: AgentMemory è escluso dai workflow attivi e dal fallback, ma il
> servizio storico non è stato disabilitato, cancellato o dichiarato sostituito.

## Contesto originario (snapshot firsthand del 2026-07-05)

Infrastruttura ARDESIA allora verificata firsthand; processi, porte e conteggi vanno riverificati prima
di qualsiasi decisione operativa:
- **Hardware**: Mac mini + MacBook + iPad + VPS (Galileo), collegati via **Tailscale** (ssh raggiunge `100.124.198.59` = IP Tailscale).
- **Servizi sul mini**: `litellm :4000` (proxy modelli), `served/lessonos :8200` (API corpus, 1224 segmenti), `nanobot :8090`, `agentmemory :3111` (grafo iii, ~4846 nodi / 107 tipi-arco), servizio iPad. Accesso dal MacBook via tunnel `ssh -N -L`.
- **Fabbrica** (loop autonomo): coordinator/finder/judge/worker/broker (nello snapshot: STOP-TOTALE, 24 plist in quarantena).
- **Connessione attuale = ad-hoc**: tunnel ssh, porte localhost, proxy litellm, il loop fabbrica come orchestratore de-facto. **Nessuna separazione di piani.**

La tentazione (ragionevole): AgentMemory è il "cervello condiviso" → farne il connettore di TUTTO (hardware + software). **È l'abbaglio da evitare.**

## [HISTORICAL] Decisione originariamente proposta

**La proposta storica assegnava ad AgentMemory il solo piano MEMORIA/CONOSCENZA**, alimentato
dall'event-log LessonOS. Non lo proponeva come control-plane, transport-plane o hardware-connector e
separava le responsabilità infrastrutturali:

```
Tailscale (hardware mesh)
  └─ reverse-proxy / tunnel (transport, service-discovery)
       └─ event-bus tipizzato (control) ──► A2/coordinator orchestra
            └─ LessonOS event-log (FONTE, append-only)
                 ├─► AgentMemory graph  (memoria/recall — la VISTA)
                 ├─► student-pack / grafo derivato
                 └─► telemetria/status (osservabilità)
```

Nella proposta storica AgentMemory avrebbe collegato la **conoscenza**, non le macchine.

Questa proposta non è stata ratificata come destinazione corrente e non autorizza nuove integrazioni
AgentMemory. Resta valida soltanto la conclusione negativa: AgentMemory non deve diventare control-plane,
transport-plane o connettore hardware universale.

## Opzioni considerate

1. **AgentMemory come connettore universale** (hardware + software) — **RIFIUTATA**: God-component, viola SRP/DIP; contraddice il canon LessonOS (*event-log = fonte, grafo = vista derivata*); ripete l'anti-pattern ELAB-standalone/Room.tsx a livello infra.
2. **Piani separati** (proposta originaria di questo ADR) — **SCELTA ORIGINARIA**: ogni piano una responsabilità, sostituibile in isolamento.
3. **Graph-DB esterno come connettore** (Neo4j/GUN/Logseq) — **RIFIUTATA**: già scartato dal canon LessonOS (event-log materializzato > graph-DB esterno).

## [HISTORICAL] Conseguenze della proposta originaria

- AgentMemory sarebbe rimasto limitato a consolidazione e recall, con l'event-log come fonte.
- Un event-bus tipizzato Core↔Plugin avrebbe svolto il ruolo di control-plane.
- Tailscale e reverse-proxy avrebbero costituito il transport-plane.
- Recall semantico e osservabilità sarebbero rimasti responsabilità separate.

Queste conseguenze non costituiscono un piano di migrazione eseguibile. In particolare, non autorizzano
avvio di loop, nuovi writer, modifiche client, unload del servizio o cancellazioni.

## Evoluzione proposta: fonte file-first e indice sostituibile

ADR-0003 propone la seguente gerarchia, ancora senza cutover:

1. evidenza prodotto/test/Git legata allo SHA come massima autorità tecnica;
2. Markdown in un repository Git privato e pulito, aperto in Obsidian, come conoscenza umana canonica;
3. Basic Memory locale come solo indice SQLite/FastEmbed ricostruibile, mai writer autorevole;
4. filesystem/`rg` come percorso di degradazione.

Il canary disponibile supporta la fattibilità, non l'attivazione. L'evidenza corrente è il receipt
Obsidian `30-Evidence-Receipts/2026-07-18-FOUNDER-BETA-FB3A-REVIEWED.md`; i fatti datati restano nel §2
del runbook, evitando che questo ADR storico diventi una seconda fonte operativa.

Fino a un'approvazione umana esplicita del cutover:

- AgentMemory resta fuori dai workflow attivi e dal fallback; il servizio storico resta intatto finché A8a/A8b non autorizzano quiesce/snapshot e unload;
- nessuna nuova dipendenza attiva deve essere costruita su AgentMemory;
- Prompt B e loop overnight restano disattivati;
- indisponibilità di Basic Memory degrada direttamente a Markdown + filesystem/`rg`;
- non sono autorizzati listener permanenti, tunnel, modifiche client, unload o cancellazioni.

Dopo, e solo dopo, il cutover approvato e verificato, AgentMemory potrà diventare una sorgente di
migrazione congelata. Non sarà il fallback operativo ordinario: rollback significa tornare alla fonte
Markdown/Git/Obsidian e alla ricerca filesystem, senza cancellare dati.

## Non-goal

Questo ADR NON implementa piani né autorizza il cutover. Conserva il confine storico
*AgentMemory non è colla universale*; la destinazione proposta, i gate e il rollback sono demandati a
ADR-0003 e a `docs/ops/BASIC-MEMORY-CANARY-AND-CUTOVER.md`, entrambi soggetti ad approvazione Andrea.
