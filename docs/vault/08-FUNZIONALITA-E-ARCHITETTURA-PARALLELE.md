# ARDESIA — Architettura ottimale + funzionalità per lavoro PARALLELO (16/06/2026)

Scopo: scrivere TUTTE le funzionalità (dal PDF RF A-L + visione) in modo che N agenti/persone lavorino **in parallelo senza collisione**. Principio: **contratti-prima → poi i pacchetti del monorepo si costruiscono in parallelo**; isolamento per-package + CI Nx-affected + branch-protection = parallelismo sicuro. Collegato a [[06-METAPROMPT-FINALE]] · [[05-REQUISITI-PDF-riconciliazione]] · [[Architettura]].

## Regola del parallelismo (come si lavora in parallelo davvero)
1. **Layer 0 — CONTRATTI (bloccanti, da congelare PRIMA di tutto):** definire le interfacce; finché non sono fisse, i package collidono. Una volta fisse, tutto parallelizza.
2. **1 package = 1 worktree/branch = 1 lane = 1 gate.** Test-di-contratto per package. CI Nx-affected gira solo i toccati. branch-protection main. Nessuna modifica cross-package senza un **interface-change coordinato** (evento esplicito, versionato semver — non in parallelo).
3. **3+ lane parallele** dopo i contratti: ENGINE(Python/uv) · STUDIO(TS) · COMMERCE(TS). Integrazione solo via contratti + PR.

## Layer 0 — Contratti da scrivere PRIMA (sbloccano il parallelo)
| Contratto | Cosa fissa | Chi ne dipende | Stato |
|---|---|---|---|
| `packages/contracts` — modello-dati §5 | User/Role, AvailabilityRule/Slot, Booking, **Lesson(teacher,student,subject,whiteboard,summary_pdf)**, **StudentRecord(notes_private,goals)**, Whiteboard-Page-CRDT, Plugin-PluginVersion(manifest,review_status), Payment(fee_platform=0), Payout, Review, Notification | TUTTI | greenfield |
| `packages/plugin-sdk` — SDK §6 | manifest + postMessage API: `sdk.ready/state.set+onChange(CRDT)/context.get(no-PII)/canvas.exportSnapshot/ui.resize` | studio, toolhost, plugins | greenfield (estrai da sim/bundle) |
| ToolHost protocol | install/sign-ed25519/sandbox-iframe-separate-origin/kill-switch/review-pipeline | studio, plugins | **costruito** (T0-T3) |
| `packages/ui` — design-system | token, componenti, no-emoji | apps/studio, apps/web | greenfield |
| auth/identity contract | sessione, ruoli, consenso-minori(GDPR) | web, booking, payments, video | greenfield |

## Funzionalità complete → package → lane (dal PDF + visione)
| RF / feature | Package | Cosa | Lane | Dipende da | Stato |
|---|---|---|---|---|---|
| RF-F Lavagna | `apps/studio` | canvas infinito, tools, persistente, export-PDF, permessi, LaTeX, **CRDT** | STUDIO | contracts, ui | ~costruito |
| RF-G Plugin host | `packages/toolhost` | install→toolbar, widget-canvas, state-sync, sandbox, kill | STUDIO | sdk, contracts | costruito |
| §6 SDK plugin | `packages/plugin-sdk` | il framework "plugin facili" | STUDIO | contracts | greenfield |
| RF-G-08 first-party | `plugins/elab-tutor` | PRIMO plugin chiamabile (sim+tutor), valida SDK | STUDIO | sdk, toolhost | parziale |
| ⭐ flagship | `packages/graph-suggest` | concetto→tool via betweenness; engine calcola→studio mostra bottone→plugin esegue | ENGINE+STUDIO | engine, contracts | greenfield |
| AI-metodo + dispense | `packages/engine` (lessonos) | grafo-metodo, StyleProfile, dispense nel-metodo, learning-debt, next-lesson | ENGINE | — | costruito M0-M4 |
| RF-I Recap PDF | `packages/engine` | recap_export | ENGINE | — | costruito |
| RF-D CRM | `packages/crm` (+engine) | scheda-studente, obiettivi, materiali, note-private, storico | ENGINE | contracts, identity | parziale/greenfield |
| RF-A Account/ruoli | `packages/identity` | registrazione/OAuth, ruoli, **consenso-minori GDPR** | COMMERCE | contracts | greenfield |
| RF-B Calendario | `packages/booking` | slot ricorrenti, fusi-UTC, no-doppia-prenotazione | COMMERCE | contracts, identity | greenfield |
| RF-C Ricerca/prenotazione | `apps/web` + booking | ricerca filtrata, prenotazione | COMMERCE | booking, identity | greenfield |
| RF-J Pagamenti **NO-fee** | `packages/payments` | escrow/payout/KYC, **0% sulle lezioni** (ricavi=SaaS docente + marketplace 70/30) | COMMERCE | contracts, identity | greenfield |
| RF-E Aula video | `packages/video` | WebRTC 1:1, **self-host EU (GDPR)** | COMMERCE | identity | greenfield |
| RF-H Marketplace | `apps/web` + plugin-sdk | UI sfoglia/installa, dev-portal, template, playground, review-pipeline, revenue-share 70/30 | STUDIO+COMMERCE | sdk, toolhost | greenfield (DOPO first-party) |
| RF-K Notifiche | `packages/notify` | email + in-app | COMMERCE | contracts | greenfield |
| RF-L Admin | `apps/admin` | backoffice, moderazione, dashboard | COMMERCE | contracts | greenfield |

## Le 3 lane parallele (dopo i contratti)
- **ENGINE** (Python/uv, toolchain isolata): engine[fatto] → graph-suggest⭐ → crm-primitives → retrieval-hybrid. Nessuna dipendenza dalle altre lane se non i contracts.
- **STUDIO** (TS): studio[~fatto] + toolhost[fatto] + plugin-sdk + plugins/elab. 
- **COMMERCE** (TS, greenfield, "plumbing SaaS"): identity + booking + web + payments + video + notify + admin. **Dopo il wedge** (la tua linea: studio-tool prima).
→ Le 3 lane girano in parallelo (3 worktree/branch, 3 gate); si toccano SOLO via `packages/contracts`.

## graphify / grafo (richiesta: "lessonos usi graphify o simili")
- **lessonos USA GIÀ un grafo**: `graph/queries.py` `build_networkx_graph` (networkx) → find_concept, prerequisite-resolution, topological-order. La **betweenness/centralità** del flagship è una funzione **nativa networkx** (`nx.betweenness_centrality`) → per quello NON serve altro.
- **Dove graphify/simili aggiungono valore** (oggettivo): il **retrieval/knowledge-layer** (M7 retrieval-hybrid, oggi solo-FTS5) e un grafo-del-metodo navigabile/semantico. Valuta: **graphify** (skill GraphRAG), **Graphiti** (knowledge-graph temporale per agenti), **GraphRAG** (Microsoft), **llama-index PropertyGraph**. NB memoria: graphify era stato bocciato come *gate* CI (non è ref-resolution) — ma come **layer-grafo/retrieval del prodotto è pertinente**. → adottare networkx (già) per la struttura + un GraphRAG (graphify/Graphiti) per retrieval semantico, NON per la centralità.

## Sequenza consigliata (priorità, rispetta la linea competitiva)
1. **Contratti Layer-0** (sblocca tutto il parallelo).
2. **Lane STUDIO + ENGINE** in parallelo = lo STUDIO-TOOL single-sided (lavagna+engine+ELAB-plugin) — valore col solo docente, il wedge.
3. **Flagship graph-suggest** (cerniera engine↔studio).
4. **CRM + recap + mem0**.
5. **Lane COMMERCE** (identity/booking/web/payments/video) = l'MVP-spec completo — DOPO il wedge / in parallelo se validato (WTP).
6. **Marketplace-aperto + dev-portal** = ultimo (col pull), mai primo mattone.
