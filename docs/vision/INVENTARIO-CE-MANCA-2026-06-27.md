# ARDESIA — INVENTARIO: COSA C'È / COSA MANCA (riusa, non ripartire da zero) — 2026-06-27

> Firsthand (COV 27jun 18:06 + VISIONE-TOTALE + COV-AUDIT). Regola: **se è già costruito, si MONTA/ESTRAE, non si riscrive.** `[V]` verificato firsthand.

## A. PRODOTTO ARDESIA (OS/canvas plugin-native)

### C'È (riusabile)
| Pezzo | Dove | Stato | Riuso |
|---|---|---|---|
| **Plugin-host** (ToolHost.mount, SES Compartment, ed25519, CSP-deny, kill-switch, manifest Zod, SDK CONTRACT 1.0.0) | `~/ardesia/apps/studio/src/toolhost/` + `toolhost-protocol/` | **production-grade ~90%, NON montato** [V] | **MONTARE** (MOUNT-CANVAS), non riscrivere |
| **Lavagna 11 strumenti** (penna/gomma/lasso/forme/testo/zoom/undo/persist) | `~/ardesia/plugins/elab-tutor/src/components/{lavagna,simulator/canvas}` vanilla SVG+Canvas2D | costruita, **intrappolata nel plugin** [V] | estrarre→core OPPURE base per canvas-OS |
| **Canvas stage-1 seed** (penna/evid/gomma/testo/zoom/pan/save/export PNG) | `~/VOLUME 3/ardesia-canvas/index.html` | costruito oggi, **non verificato/deployato** | finire+deployare |
| **ardesia-lavagna** (perfect-freehand, pressure, palm-reject) | Vercel app `~/VOLUME 3/ardesia-lavagna` | spedita preview | terza impl lavagna → **scegliere UNA** |
| **Boundary-gate** (lavagna↔simulator baseline 8, ELAB=plugin) | branch `boundary/host-gate-2026-06-27`@0892780a | DONE [V] | enforcer estrazione ELAB |
| **Student-pack** route | engine `/v1/saved-lessons/{id}/study-pack` | v0.1 (citazioni) [V] | estendere v0.2 |
| **Board-citation** (VolumeCitation, PDF-on-board pdf.js) | elab-tutor | parziale (volumi hardcoded) | base, manca data-model Core |
| **Method-graph/moat** | served `graph_aware_retrieve` | wired ma **inerte** (48 edge/1 lezione) [V] | rinforzare dati |

### MANCA (greenfield)
- **Canvas-OS spedita standalone** (non dentro elab-tutor) + **host MONTATO in route prodotto** (renderEmbeddable consumato).
- **ELAB estratto** a possedere SOLO `components/simulator/` (confine forzato; oggi = l'intera app).
- **Simulatore GENERICO** (oggi = ELAB-CircuitSim specifico → generalizzare).
- **BoardCitation data-model Core** · **account anon→docente** · **marketplace** (publish/discover/buy) · **payments/KYC**.
- **`.ardz` schema** student-pack (board+plugin-state) · **device-runtime** (gemma-4/Qwen MLX/LiteRT/WebGPU) · **1-MCP server** (solo spec).
- **method-graph navigabile lato-prodotto** (graph-suggest-poc "degenere, da riarmare").

## B. FABBRICA (sistema di build)

### C'È (vivo, riusabile) [V COV 18:06]
- **Engine lessonos**: 4010 test, gate/ratchet, FastAPI, `/v1/ingest`, method-graph builder. (@23fe7a9)
- **Loop**: driver-orch (claude -p **A1/A2 Opus** un-proxati), hourly-tick (`com.elab.lessonos-hourly`), gate-su-pass.
- **Hermes2-adjudicate** (`~/lessonos/bin/hermes2-adjudicate.sh`): worker-trova + **Opus-adjudica**, cap 8/day = **già orchestrator-worker** (il pattern che vuoi).
- **Router**: litellm :4000, **nanobot :8090**, tutor :8081, served :8200.
- **AgentMemory :3111** (iii engine, 696 mem, **consolidate ri-armato** post-reboot).
- **Telegram bridge** `com.maestro.tg-bridge` UP (canale comunicazione).
- **Worktrees** già in uso (ardesia: wt-docs, wt-syncguard).
- **Egress sandbox** (`~/maestro-tools/sandbox`), **headroom**, **MLX toolchain**, modelli locali su disco.
- **GitHub**: `ardesia`→**github.com/AndreaMarro/ardesia** [V]. ⚠️ lessonos+studio = **bare-locale, NO github** (il gap "driver→origin≠github").

### MANCA / ROTTO (perché "non funziona davvero")
- **Allineamento served↔github↔web** = il collo #1: served frozen, web prod **4/1224**, lessonos/studio non su github.
- **Finder locale stabile**: 8B ha wedged il box (OOM) → serve **4B managed/on-demand** (no KeepAlive-pesante). Oggi finder OFF, finder-cloud 402.
- **Cost enforcement**: budget detect-only ($3.99>$3.3, mai STOP).
- **Telegram bidirezionale "che ascolta davvero"**: il bridge c'è, ma il loop-che-esegue-comandi-Andrea va verificato.
- **Grafi che organizzano la knowledge**: AgentMemory grafo 43n/0e (proiezione da ricostruire) + graphify=artefatto-statico → unificare (one-graph-two-views, design knowledge-fabric).

## C. MAPPATURA "USA-CIÒ-CHE-ESISTE" (decisioni, no-zero)
1. **Plugin-host** → MONTA il toolhost esistente (non riscrivere). 
2. **Canvas** → SCEGLI UNA delle 3 impl (seed-pulito / elab-tutor-11-strumenti / ardesia-lavagna-perfect-freehand). Consiglio: **seed-pulito come canvas-OS** + monta-toolhost; porta i tool migliori dalle altre.
3. **ELAB** → ESTRAI dietro il boundary-gate (già iniziato, baseline 8) → possiede solo `simulator/`.
4. **Simulatore** → GENERALIZZA l'ELAB-CircuitSim esistente in plugin-generico.
5. **Grafi/memoria** → USA AgentMemory (popola il grafo) + graphify=vista (knowledge-fabric one-graph-two-views).
6. **Fabbrica** → ripara allineamento served/web/github · stabilizza finder-4B · mantieni hermes2-adjudicate.
7. **GitHub** → spingi tutti i doc-sicuri su github.com/AndreaMarro/ardesia (branch docs) · poi porta lessonos/studio su github.
