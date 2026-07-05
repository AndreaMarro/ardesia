# ADR-0002 — AgentMemory è il memory-plane, non il connettore universale dell'infrastruttura

- **Stato**: PROPOSED (decisione canon = Andrea; nessuna implementazione da questo ADR)
- **Data**: 2026-07-05
- **Contesto**: domanda architetturale di Andrea — *"AgentMemory dovrebbe collegare tutta l'infrastruttura hardware e software? Altre soluzioni?"* Questo ADR mette la scelta a decisione, per evitare di ricreare un monolite a livello infra proprio mentre si smonta ELAB-standalone.

## Contesto (firsthand)

Infrastruttura ARDESIA oggi (verificata firsthand):
- **Hardware**: Mac mini + MacBook + iPad + VPS (Galileo), collegati via **Tailscale** (ssh raggiunge `100.124.198.59` = IP Tailscale).
- **Servizi sul mini**: `litellm :4000` (proxy modelli), `served/lessonos :8200` (API corpus, 1224 segmenti), `nanobot :8090`, `agentmemory :3111` (grafo iii, ~4846 nodi / 107 tipi-arco), servizio iPad. Accesso dal MacBook via tunnel `ssh -N -L`.
- **Fabbrica** (loop autonomo): coordinator/finder/judge/worker/broker (attualmente in STOP-TOTALE, 24 plist quarantena).
- **Connessione attuale = ad-hoc**: tunnel ssh, porte localhost, proxy litellm, il loop fabbrica come orchestratore de-facto. **Nessuna separazione di piani.**

La tentazione (ragionevole): AgentMemory è il "cervello condiviso" → farne il connettore di TUTTO (hardware + software). **È l'abbaglio da evitare.**

## Decisione

**AgentMemory resta il piano MEMORIA/CONOSCENZA e SOLO quello**, alimentato dall'event-log LessonOS come fonte. NON diventa control-plane, transport-plane né hardware-connector. L'infrastruttura si organizza in **piani separati** (una responsabilità ciascuno — SRP; i servizi dipendono da astrazioni — DIP):

```
Tailscale (hardware mesh)
  └─ reverse-proxy / tunnel (transport, service-discovery)
       └─ event-bus tipizzato (control) ──► A2/coordinator orchestra
            └─ LessonOS event-log (FONTE, append-only)
                 ├─► AgentMemory graph  (memoria/recall — la VISTA)
                 ├─► student-pack / grafo derivato
                 └─► telemetria/status (osservabilità)
```

AgentMemory "connette" la **conoscenza** (tutti gli agenti leggono/scrivono la memoria condivisa), non le macchine.

## Opzioni considerate

1. **AgentMemory come connettore universale** (hardware + software) — **RIFIUTATA**: God-component, viola SRP/DIP; contraddice il canon LessonOS (*event-log = fonte, grafo = vista derivata*); ripete l'anti-pattern ELAB-standalone/Room.tsx a livello infra.
2. **Piani separati** (questo ADR) — **SCELTA**: ogni piano una responsabilità, sostituibile in isolamento.
3. **Graph-DB esterno come connettore** (Neo4j/GUN/Logseq) — **RIFIUTATA**: già scartato dal canon LessonOS (event-log materializzato > graph-DB esterno).

## Conseguenze

- **AgentMemory** va scopato a memory-plane: consolidazione + recall, fonte = event-log. NON gli si aggiungono responsabilità di orchestrazione/rete.
- Serve un **event-bus tipizzato Core↔Plugin** (già richiesto nel master prompt §4 / contratti Core #57) come control-plane — i servizi emettono eventi, l'orchestratore A2 coordina.
- **Tailscale + reverse-proxy** vanno formalizzati come transport-plane (oggi i tunnel ssh sono impliciti/fragili).
- Il **recall semantico** (oggi lexical-only, moat non ancora reale) è un miglioramento separato del memory-plane (embedder reale / pgvector dietro protocollo), non un motivo per allargare AgentMemory ad altri piani.
- Osservabilità = un aggregatore status unico (Headroom costi + `/ardesia-status`), non dentro AgentMemory.

## Non-goal

Questo ADR NON implementa piani; fissa il confine: *AgentMemory = memoria, non colla universale*. Implementazione (event-bus, proxy) = lavori separati, gate Andrea.
