# CLAUDE-FULL-PROJECT-CONTEXT — Mappa completa ARDESIA per sessioni AI

- **Status**: orientation map (nessun claim di implementazione oltre quanto citato con evidenza)
- **Data**: 2026-07-02
- **Fonte**: ricognizione firsthand di questa data — 6 lettori paralleli su monorepo locale, GitHub (`gh`), manuali PDF, codice sim/plugin, doc fabbrica, doc LessonOS/UserAIOS + probe live via connettore `ardesia-ops` (read-only)
- **Base git**: `origin/main` @ `270d1e95` (merge PR #15)
- **Regola di aggiornamento**: doc additivo, datare ogni sezione modificata; se un claim diventa falso, correggerlo qui e segnare la correzione (non cancellare la storia)
- **Marcatura**: tutto è verificato firsthand alla data indicata salvo `[NON-VERIFICATO]`

---

## 0. TL;DR operativo

1. ARDESIA = piattaforma didattica local-first: lavagna + plugin come post-it sul foglio + LessonOS (grafo che cresce) + marketplace. ELAB è il **primo pack**, non il prodotto.
2. Il monorepo canonico è `AndreaMarro/ardesia` (`/Users/andreamarro/VOLUME 3/ardesia`), ma il **cutover è un piano, non un fatto**: la fabbrica lavora ancora su `~/lessonos` / `~/maestro-studio`; i subtree importati sono snapshot che divergeranno.
3. Slice attiva: **ELAB Vol.1 Cap.6 Esp.1** ("Accendi il tuo primo LED"). Catena PR #13→#14→#15 merged, **#16 (board payload) DRAFT ma MERGEABLE**, pulita.
4. La fixture canonica **non è ancora fedele alla figura del libro** (6 fili vs 2; LED non a cavallo del canale) — vedi §4.3. Chi lavora su "identico al libro" parte da lì.
5. AgentMemory = **cache degradata, mai fonte di verità** (livez timeout; vietati recall broad/restart/compaction senza runbook §9).
6. Non toccare: `eval/gate.sh`, PR#6, scheduler pausati, deploy senza OK Andrea, `git add -A`, push diretto a main.
7. Ogni claim di stato va riverificato firsthand: più doc ops si contraddicono (§16).

---

## 1. Cos'è ARDESIA (visione + canone)

**Visione** (fonti: `docs/vault/`, `docs/PRODUCT-CANON.md`, `docs/product/UI-UX-DESIGN-DIRECTION.md`, direttive Andrea):
- Lavagna viva per iPad/LIM/desktop, esperienza scrittura ≥ GoodNotes, design migliore di GoodNotes.
- **Plugin direttamente sulla carta** (post-it/sotto-post-it interattivi), non pannelli laterali.
- **LessonOS**: grafo/memoria didattica che cresce da lezioni, appunti, materiali, plugin usati, errori, esercizi, simulazioni, student-pack.
- AI **metodologica** (aiuta docente e studente, non li sostituisce); zero-LLM nel prodotto core (AGENTS.md).
- Marketplace di plugin/pack/materiali; abbonamento e visibilità docente; multilingua nativo strutturale.
- Focus utente #1: **docente/tutor** (cruscotto docente — spec ancora mancante, §14.3).

**Canone di classificazione** (`docs/CANON-INDEX.md`): *Universale→Core · Strumento→Plugin · Materia→Pack · Sequenza→Workflow*.

**Regola d'oro** (`README.md` §Guardrail): **FABBRICA ≠ PRODOTTO**. `ops/` costruisce e non viene mai spedita agli utenti; GDPR Mode A vincola `apps/` + `packages/` + `plugins/`.

**ELAB-AS-PLUGIN-CANON** (`docs/ELAB-AS-PLUGIN-CANON.md`): ELAB possiede SOLO il simulatore/contenuto disciplinare; App.jsx/auth/dashboard/AI-shell/report **vietati** nel plugin — li possiede ARDESIA Core. Niente seconda app ELAB.

---

## 2. Il monorepo `ardesia`

### 2.1 Layout (firsthand)
| Path | Cosa | Stato |
|---|---|---|
| `packages/engine/` | LessonOS Core Engine (Python/uv: grafo metodo, retrieval, recap, MCP grounded-memory) | Import da `lessonos@auto/main`, storia preservata (`c4327c31`); drift-guard vs canonico (PR#3). **Snapshot: il canonico resta `~/lessonos`** |
| `apps/studio/` | Lavagna + ToolHost TS/React (Excalidraw, iframe JSON-RPC) | Import da `maestro-studio@auto/main`. Slice MOUNT-CANVAS **untracked** nel working tree Codex (§5.2) |
| `plugins/elab-tutor/` | Oggi = **app ELAB intera vendored** (byte-identica a `elab-builder`, incl. CircuitSolver 2486 righe + AVRBridge 1242) | NON è ancora un plugin ToolHost (nessun manifest); il contratto per estrarre il pack è in `plugins/elab-tutor/docs/specs/ardesia-canvas-plugin-contract.md` |
| `ops/` | Fabbrica (knowledge, packets, tools) | Mai spedita |
| `bin/` + `package.json` root | Command surface (`monorepo.sh`: status/test/build/verify) | Su main solo dopo merge **PR#17** (OPEN, MERGEABLE) |
| `docs/` | canon (6 file) + `ops/` + `product/` + `vault/` + `wiki/` | ⚠️ vedi 2.2 |

### 2.2 Cosa è su `origin/main` vs solo locale (trappola principale)
Su **main** (API contents, firsthand): `docs/ops/` = 18 file (AGENTMEMORY-{HEALTH-STATUS,MAINTENANCE-PLAN}, CONTEXT-PACKETS, FACTORY-LIVE-STATUS, NEXT-SESSION-PROMPT, SCHEDULED-PROCESSES-INVENTORY, VERCEL-MAP, VOLUME3-*, SIMULATION-PLUGIN-ELAB-V1-CAP6-ESP1-{CONTEXT-PACKET,ADAPTER-COV}, DEMO-*, ARDESIA-*). **`docs/product/` NON esiste su main (HTTP 404)**.

Solo **locali** (working tree `codex/ardesia-ops-headroom-20260701`, untracked, assenti da main): MONOREPO-TOTAL-CUTOVER-PACKET, ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS, ARDESIA-NEXT-P0, FASTAPI-CHATGPT-MCP-GATEWAY, LESSONOS-{MEMORY-ARCHITECTURE,DYNAMIC-GRAPH}-RESEARCH, PER-USER-AIOS-CRITICAL-ANALYSIS, ELECTROTECHNICS-*, HEADROOM-*, GITHUB-REPO-MAP-LIVE, ENTRYPOINTS, SYMBOL-MAP, PROTOTYPE-SALVAGE-MAP, NEXT-{CODEX,AUTOMATION}-PACKET, LOCAL-*, FACTORY-{AUTONOMY-PROTOCOL,ROUTING-CLEAN-SPEC}, AGENTMEMORY-SEMANTIC-PROTOCOL, SCHEDULED-ACTIVITY-LOG + **tutta `docs/product/`** (6 file) + slice toolhost (§5.2).

Inoltre: `docs/ops/NEXT-SESSION-PROMPT.md` locale ≠ main (locale ha update post-crash 2026-07-02 non pushato); il canary runbook AgentMemory (PR#12, merged) **non è visibile nel checkout locale** (§9).

### 2.3 Cutover — stato reale
`MONOREPO-TOTAL-CUTOVER-PACKET.md` (2026-07-01): "**plan, no cutover performed**". Fatto: scaffold + import con storia (engine/studio/plugins/ops) + drift-guard engine. Mancano: repoint fabbrica (loop ancora su `~/lessonos`/`~/maestro-studio`), sync subtree (STALE per `docs/ARCHITECTURE-CANON.md` REGOLA #1: per il behavior corrente NON usare i subtree), push docs/product, merge command surface. Precondizioni repoint: docs-PR merged + import compilano + demo preview + gate pass + rollback tag + **OK Andrea**.

---

## 3. Stato GitHub (`AndreaMarro/ardesia`, 2026-07-02)

| PR | Titolo | Stato | Nota |
|---|---|---|---|
| #17 | ops(monorepo): safe root command surface | OPEN, MERGEABLE | `bin/monorepo.sh` + `package.json` + riscrittura NEXT-SESSION-PROMPT. `npm run verify` completo NON eseguito (dichiarato nel body) |
| #16 | test(sim): ELAB v1 cap6 esp1 **board payload** contract | **DRAFT**, MERGEABLE, 0 review | 3 file additivi puri (`boardPayload.ts` + 5 test + COV). Draft per policy dichiarata, non per conflitti. Ultimo anello della catena slice |
| #15 | adapter contract (`fixtureAdapter.ts`, 6 test) | MERGED | payload `elab.circuit-scene-adapter.v1` |
| #14 | drift fixture (`elab-v1-cap6-esp1.json` + 4 test) | MERGED | triangolazione fixture ↔ experiments-vol1.js ↔ lesson-path (copie monorepo) |
| #13 | context packet slice | MERGED | studio Vol.1 pp.29–31, piano max-5-file |
| #12 | AgentMemory canary runbook | MERGED | sezione dentro AGENTMEMORY-MAINTENANCE-PLAN.md (§9) |
| #11 | Volume 3 inventory (5 doc VOLUME3-*) | MERGED | §13 |
| #8–#10 | demo vertical-slice, factory status, AgentMemory P0 | MERGED | |
| #6 | dual Hermes orchestration | DRAFT — **NON USARE** | Body dice "3 file aggiunti, no production driver modified"; la PR tocca **8 file** incl. `packages/engine/bin/hourly-tick.sh` MODIFIED + file spurio `do-not-create` alla root. Body e contenuto divergono; validazione mini mai eseguita |
| #1,#2,#4,#5 | doc-set storici | DRAFT | canon 27jun in #5 |

Branch locali attivi: 13 worktree (`git worktree list`); il working tree principale è sul branch Codex `codex/ardesia-ops-headroom-20260701` **sporco** (7 M + 41 ??) — non fare checkout lì dentro; usare worktree separati.

---

## 4. Slice attiva: ELAB Vol.1 Cap.6 Esp.1

### 4.1 Il libro (fonte: `VOLUMI pdf e MD/MANUALE VOLUME 1 ITALIANO.pdf`, pp.29–31 lette come immagini)
- Cap.6 "COS'È IL DIODO LED?", Esperimento 1 "come lo accendo?" inizia **p.29**.
- Materiali (p.29): LED (colore a scelta), breadboard, batteria 9V, clip 9V, **resistore 470 Ω** — il libro stampa i colori come "(Viola Giallo Marrone)".
- Montaggio (p.30, 3 step con figure Fritzing-style; breadboard half ruotata 90°, colonne `a–j`, righe 1–11, rail ±):
  1. `+` batteria → **striscia rossa superiore** (filo rosso);
  2. resistore 470 Ω tra un punto qualsiasi della striscia rossa e la zona sotto;
  3. **gamba lunga LED verso il resistore, gamba corta oltre la divisione centrale** (LED **a cavallo del canale**).
- p.31: `−` batteria → stessa colonna della gamba corta → LED acceso; variante con LED blu.
- **Totale: 2 fili** (rosso e nero, dalla clip); nessun jumper extra in figura; posizioni deliberatamente libere ("punto qualsiasi").

### 4.2 I dati nel monorepo (merged, canonici per il drift-guard)
- Fixture `apps/studio/sim/fixtures/elab-v1-cap6-esp1.json` (PR#14): pin `{r1: a2/a9, led1: anode f9 / cathode f10}`, **6 wires** (2 rail-jumper rossi, ponte **verde e9→f9**, catena bus-minus nera), `manualEvidence` per pp.29/30/31, `sourceOfTruth` → `plugins/elab-tutor/public/volumes/volume1.pdf` + experiments-vol1.js + lesson-path.
- Drift-guard `ElabV1Cap6Esp1Fixture.test.ts`: 4 test — pagine [29,30,31], triangolazione a 3 (fixture ↔ experiments-vol1.js ↔ lesson-path **copie monorepo**), pin esatti, anti-inflation (vietate parole deploy/product-ready/"qualunque immagine").
- Adapter (PR#15) → payload scena; board payload + skeleton embeddable (PR#16 draft): `view {mode:"manual-aligned", sourceLabel:"Vol.1 pag.29-31"}`, ownership `maestroTool`, fail-fast senza pinAssignments.

### 4.3 ⚠️ Delta fedeltà libro ↔ dati (onesto, nessuno lo nasconda)
| Punto | Libro | Fixture monorepo (canon) | elab-builder standalone |
|---|---|---|---|
| Fili | **2** | **6** (rail-jumper + ponte + bus-chain) | 2 nell'intent ma **senza rail** (contraddice "striscia rossa") |
| LED | **a cavallo del canale** | anode f9/cathode **f10** = tutto blocco f + ponte verde ≠ figura | anode f9/cathode e9 = a cavallo ✓ |
| Materiali | nessun jumper elencato | — | aggiunge "Fili ×4" (non nel libro) |
| Posizioni | libere ("punto qualsiasi") | fori fissi (necessità del sim, accettabile) | fori fissi |

Conseguenze: (a) l'obiettivo "grafici iniziali montati sul simulatore **identici al libro**" NON è ancora soddisfatto dalla fixture canonica; serve una decisione: o la fixture adotta la topologia-libro (2 fili, LED a cavallo) o si documenta il motivo elettrico del ponte; (b) lo **standalone `elab-builder` è fuori dal drift-guard** e diverge dal monorepo (j2/j9 vs a2/a9, cathode e9 vs f10, 5 conn vs 6 wires) con incoerenze interne (note `_authoring` e `steps[]` specchiati a↔j); (c) il guard triangola solo le copie monorepo: nessun guard monorepo↔elab-builder `[NON-VERIFICATO se esista]`.

### 4.4 Manuali — inventario e vincoli
- Canonico scansione: `VOLUMI pdf e MD/` (Vol.1 ITA 24M, Vol.2 16M, Vol.3 v0.16 20M + dir estrazione markdown per volume + versioni EN).
- Altre copie: `CONTENUTI/volumi-pdf/` (VOL1 GP V0.1 = 27.661.848 B, **stessa size** di `plugins/elab-tutor/public/volumes/volume1.pdf`; hash `[NON-VERIFICATO]`), `TEA/`, radice Volume 3.
- **Copyright**: i PDF non vanno committati oltre quanto già presente; `VOLUME3-DO-NOT-COMMIT.md` li classifica coperti → uso locale come fonte di riferimenti/geometrie/pagine. Pagine PNG estratte già in `apps/studio/public/elab/` (untracked) = terza copia parziale, licenza da decidere prima del commit.

---

## 5. Simulation Plugin

### 5.1 Tre motori paralleli + quattro rappresentazioni visive (rischio strutturale)
| Sede | Motore | Completezza |
|---|---|---|
| `plugins/elab-tutor/` ≡ `elab-builder/` (byte-identici oggi) | CircuitSolver.js 2486 (MNA/union-find) + AVRBridge.js 1242 (avr8js dual-mode), 22 componenti, validatori, Blockly↔AST↔C++, pipeline Nano R4 | **Canonico** per ARDESIA-MAP |
| `ardesia-simulator/` (repo separato) | avr8js + @wokwi/elements, serie-only F0/F1 | Molto meno completo — **non ricostruire da qui** |
| `apps/studio/` slice nuova (untracked) | Runtime virtuale deterministico ~209 righe (no avr8js) + scena dichiarativa | Contract-layer, non motore |

Regola già ratificata (recon 28jun + ELECTROTECHNICS-TOOLS-RESEARCH): **riusare il motore elab-builder**, non ricostruire da F0. Il seam mancante è `renderEmbeddable()`/pack boundary, non il solver.

### 5.2 La slice MOUNT-CANVAS (untracked, a rischio)
Nel working tree Codex: `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx` (**1289 righe**, god-component da spezzare), `simulationBreadboard.ts` (182 righe, geometria breadboard "ported from ELABTutor", grammatica ELAB: 420 punti, `parseBreadboardRef`, continuità elettrica), test, `apps/studio/public/elab/` (3 PNG pagine manuale), `Room.tsx:718 renderEmbeddable={renderToolCanvasEmbeddable}`. Tutto **non committato** su branch Codex → rischio perdita. Path assoluti macchina-specifici dentro il file (provenance verso `/Users/andreamarro/VOLUME 3/elab-builder/...`) = rompono CI se usati a runtime.

### 5.3 Tre schemi scena da riconciliare
`SimulationSceneV1` (studio, superset con bookLayout/runtime/compile) ≠ `BookLayoutIdentityV1` (contratto in `plugins/elab-tutor/docs/specs/ardesia-canvas-plugin-contract.md`: identità semantica + provenance draft/reviewed/verified, mode percorso|passo-passo|già-montato|libero) ≠ `CircuitScene v1` (PR#195 elab-tutor, 88 esperimenti). Decidere il canonico prima di nuovo codice.

### 5.4 Contratto plugin/canvas (punti fermi)
Canvas link `maestro-tool://io.ardesia.elab-tutor/<experimentId>`; surface `board-embed`; caps minime `board.read` + `board.write(own-embeds)`; **nessun codice ELAB importato da apps/studio** (il pack firmato possiede il runtime); compile: Blockly genera C++ generico, board = parametro (`arduino:renesas_uno:nanor4` primario), upload fisico solo con user-gesture, no secret browser-side. Manifest ToolHost: **manca il campo `kind`** (pack vs tool) = intervento ad alta leva già identificato.

---

## 6. ELABTutor come pack — cosa porta e cosa NON porta

Porta: contenuto disciplinare, manuali (riferimenti Vol/pagina), lesson-path (89 in `src/data/lesson-paths/`), esperimenti (`experiments-vol1.js` 9991 righe), validatori, circuiti, step didattici, UNLIM (modo di parlare incluso), citazioni pagina.
NON porta (vietato dal canon): shell/app propria, auth, dashboard, memoria, report — li possiede ARDESIA Core. Il target UX: **fedele all'app elabtutor singola** (UNLIM trascinabile, simulatore già montato, passo-passo) ma dentro la lavagna come post-it/sotto-post-it.

---

## 7. LessonOS / UserAIOS

### 7.1 Architettura DECISA (doc research 2026-07-02, local-only)
- **Event log append-only (SQLite) = unica fonte di verità → materialized graph derivato → evidence refs obbligatori per nodo → export/import `.lesson`**. NO graph-DB esterno (Neo4j ecc. = anti local-first/iPad).
- Pipeline: `board event → lesson object → plugin state → concept/error/evidence extraction → UserAIOS memory event → LessonOS graph update → student-pack candidate → dashboard projection`.
- **UserAIOS v0 = projection layer read-only** su `raw/events.jsonl` (già prodotto da `apps/studio/src/store/JournalRecorder.ts`) → `derived/useraios/<room>.snapshot.json`. **Zero LLM, zero MCP, zero agente autonomo nella prima slice. Vietato creare un secondo grafo parallelo a LessonOS.**
- Multilingua strutturale: `concept_id` neutro + `labels` per lingua.
- Riusabile già individuato: `WorkspaceStore.ts`, `lessonBundle.ts` (.lesson ZIP), `toolhost-protocol/manifest.ts`, `capabilities.ts` (dichiara `graph.query`/`llm.generate` ma il wire reale è solo `board.*`/`storage.*`), `packages/engine/lessonos/mcp/grounded_memory.py`.

### 7.2 Verdetti sistemi esterni (pattern, non import)
Prendere come pattern: **Letta** (Apache-2.0; memoria gerarchica sì, LLM-in-the-loop no), **mem0** (Apache-2.0; retrieval multi-segnale, non fidarsi dei benchmark), AIOS (metafora kernel, licenza "Other", no runtime), Tencent Agent-Memory (riferimento cruscotto memoria, no dipendenza senza audit licenza), Logseq (backlink model), RepoDoc (evidence refs file:riga).
Evitare: **Graphiti** (richiede Neo4j), **openhuman** (GPL-3.0 — mai copiare nel core), copyleft forte nel marketplace (AGPL trap), tldraw (licenza trap `[VERIFY-WEB]`).
Overengineering per ARDESIA: veri "AI-OS", CRDT P2P, TerminusDB/JanusGraph, agente-che-scrive-memoria-da-solo.

### 7.3 Metriche oneste (vincolanti)
- `docs/PRODUCT-CANON.md`: **VIETATO il claim "+0.33 moat"**; floor reale recall@10 ≈ **0.21** (`moat_gate.py`).
- Memoria di progetto (29jun) riporta live recall lexical 0.42 @1 e hybrid 0.53 come *capability* non servita di default. Metriche non riconciliate tra loro (`[NON-VERIFICATO quale eval-set combaci]`) → citare sempre fonte e data, mai un numero solo.
- CircuitSolver MNA **esiste** nell'engine canonico (`~/lessonos`, PR#195, 88 esperimenti); `CircuitScene.provenance` = spec-only (0/88).

---

## 8. Fabbrica (Mac mini)

- `FACTORY-LIVE-STATUS.md` (2026-07-02 01:40): "**live but degraded**" (degradata da AgentMemory). Gate LessonOS **VERDE** alla stessa data (`--lf` 4587 passed; bug adversarial-Kimi `NameError: re` chiuso da `6775f70`). NB: i packet Electrotechnics più vecchi lo davano ROSSO come precondizione bloccante → **riconfermare il gate firsthand prima di costruire engine**, non fidarsi di nessuno dei due doc.
- Gate monorepo verdi (2026-07-01 18:31): engine 2044 passed, Studio Vitest 583, `eval/gate.sh` 584/0, replay Playwright 1.
- **Quota (Errata vincolante 2026-07-01 10:18): A3 NON esiste** (rc=0 = falso positivo); A1 senza quota fino a ven 2026-07-03; **A2 = unica lane Opus azionabile**.
- Probe live 2026-07-02 11:43Z (connettore `ardesia-ops.factory_full_status`, read-only): tutor/litellm/nanobot/served/agentmemory `up`; served corpus=1224 sha=`67ef5cf`; 16 commit/24h; gate-baseline 4577; **knowledge-graph nodes/edges/memories = None + no-growth** (probe degradato o grafo fermo: coerente con AgentMemory §9).
- **Do-not-touch**: non riabilitare `com.elab.lessonos-hourly` né la Codex automation (PAUSED); non mergiare PR#6; non ratificare lessonos PR#3 alla cieca; non patchare `~/lessonos` (worktree dirty factory-owned); non avviare full-gate se un gate è attivo; scheduler: vedi `SCHEDULED-PROCESSES-INVENTORY.md` (update 2026-07-02 in testa al file = quello valido).

---

## 9. AgentMemory (degradata — regole dure)

- `AGENTMEMORY-HEALTH-STATUS.md` (2026-07-02 02:20): live a livello socket ma **unhealthy**: `livez` timeout (HTTP 000) da MacBook e loopback; node PID a CPU 477% / RSS ~3 GB; `worker.err` ~225 MB (ECONNREFUSED :3111, **BM25 shard missing**); consolidate cicli orari `no-growth`.
- Probe live oggi: `:3111` MacBook **timeout** (connettore `memory_health`) → confermato degradato.
- **VIETATO finché livez timeouta**: broad recall, `agentmemory stats`, bulk import, graph rebuild, compaction, **restart**, write.
- Piano P0 (`AGENTMEMORY-MAINTENANCE-PLAN.md`, "not executed"): freeze+backup → pausa consolidate/am-restart → diagnosi BM25 → UNA azione di recovery per finestra → canary tiny. Backup verificato esistente: `/Users/progettibelli/agentmemory-canary-backups/20260702-025141` (+SHA256SUMS).
- ⚠️ Il **canary runbook (PR#12, MERGED su main)** è una sezione di AGENTMEMORY-MAINTENANCE-PLAN.md che **non compare nella working copy locale** (checkout branch Codex più vecchio): leggerlo da main (`git show origin/main:docs/ops/AGENTMEMORY-MAINTENANCE-PLAN.md`). Step2 = approval gate Andrea, una sola azione; restart/kill/compaction/launchd fuori scope.
- Protocollo semantico: memoria = fabric/cache, mai SoT; recall narrow 2–4 concetti; 1 memoria breve verificata a fine task; fallback su `SCHEDULED-ACTIVITY-LOG.md` se il save fallisce.

---

## 10. Headroom

- Proxy live e healthy `127.0.0.1:8787` v0.27.0 (`com.headroom.proxy`), upstream Anthropic ok; Codex instradato via `~/.codex/config.toml` (`model=gpt-5.5`, provider headroom).
- **Rischio noto**: doppio listener su 8787 (Headroom loopback + `com.broker` su `*:8787`) — keep running, nessun cambio porta/launchd senza piano; scegliere un solo owner alla prossima manutenzione.
- `HEADROOM-RESEARCH.md` ("non installare senza dry-run") descrive uno stato **pre-adozione superato** dai fatti — usare ENFORCEMENT-STATUS come fonte.
- Protocollo Headroom per gli agenti (FACTORY-AUTONOMY-PROTOCOL): maps-first, context packet bounded (objective / file da leggere e NON leggere / evidence commands / stop criteria / COV), no repo-dump, escalation Opus solo per critico. Nessun claim di risparmio % senza misura.

---

## 11. Vercel + superfici live

- `VERCEL-MAP.md` (2026-07-02 01:27): **13 progetti** sul team; dominio `elabtutor.school` (401 = gated, non usare come demo). Demo canonica = **`ardesia-lavagna.vercel.app`** (200, prod 2026-06-28 da branch `feat/lavagna-p0-20260628`); API = **`ardesia-api-vercel`** (FastAPI, `/health` 200). `ardesia-canvas`/`ardesia-workspace` = prototype ridondanti; 6 progetti old pubblici da classificare.
- **Live è indietro**: la lavagna prod (commit `e11e2c8d`) non ha student-pack/passo-passo presenti nei checkout locali più avanti.
- **Corpus-gap** (probe live oggi, connettore `web_status`): **prod corpus=4 segmenti vs 1224 served locale**. VERCEL-MAP non lo copre (verifica solo HTTP 200) — gap di copertura documentale. Fix noto: rigenerare `assets/segments.jsonl` da moat-ingest + redeploy = **gate Andrea**.
- Regole: nessun deploy senza OK esplicito (preview inclusa); runbook `DEMO-MERGE-DEPLOY-PREVIEW-RUNBOOK.md` (PR piccole docs→demo→ops, `vercel build`+`deploy --prebuilt`, verifica browser desktop+iPad, rollback = non promuovere).
- La lavagna (`ardesia-lavagna`) è un **repo/prodotto separato dal monorepo** con proprio toolhost + registry 7 plugin + marketplace Ed25519 (PR [#1 ardesia-lavagna](https://github.com/AndreaMarro/ardesia-lavagna/pull/1) open): concetti sovrapposti a `apps/studio` implementati due volte — riconciliazione = decisione di prodotto aperta.

---

## 12. Volume 3 → GitHub (inventario import, PR#11 merged)

- `VOLUME3-GITHUB-CANDIDATES.tsv`: **P0** = 6 doc ops (LOCAL-VOLUME3-STATUS, GITHUB-REPO-MAP-LIVE, ENTRYPOINTS, REPO-HEADROOM-MAP, HEADROOM-ENFORCEMENT-STATUS, AGENTMEMORY-SEMANTIC-PROTOCOL) via docs-only PR post secret-scan. **P1** = docs/product (4 pack, human review) + LESSONOS-*-RESEARCH (citation check) + command surface (già PR#17). **P2** = toolhost code (con test+screenshot), elab-builder = lineage cherry-pick only. **BLOCKED** = `apps/studio/public/elab/` (licenza asset), VOLUMI (copyright), ARCHIVIO.
- `VOLUME3-DO-NOT-COMMIT.md`: 1090 filename-match sensibili + 13045 content-match; vietati `.env*`/key/DB/log/dump/PDF coperti/dati studenti; match ≠ segreto provato ma blocca import automatico.
- 109 file >20 MB (`VOLUME3-LARGE-FILES-AND-ASSETS.md`): niente in git; LFS solo con OK+licenza.
- Verdetto inventario: "GitHub non deve ricevere Volume 3 in blocco"; unico import sicuro = docs-only path-by-path.
- **Prossimo import P0 consigliato**: i 6 doc P0 sopra, uno alla volta, con secret-scan e COV (candidato immediato: ENTRYPOINTS + GITHUB-REPO-MAP-LIVE *aggiornato* — quello attuale è stantio, §16).

---

## 13. Integrazioni (FastAPI / ChatGPT Apps / MCP / LMS / Drive)

- `docs/ops/FASTAPI-CHATGPT-MCP-GATEWAY.md` (design, **not implemented**): gateway = boundary layer in `packages/api`, mai fonte di verità. Archetype ChatGPT Apps: `interactive-decoupled` + tool `search`/`fetch`. Tool surface v0 **read-only** (`lesson.open`, `graph.query`, `plugin.registry.list`, `student_pack.preview`, `simulation.scene.validate`, `electrotechnics.solve_preview`, `examforge.generate_preview`); mutating tools NON-P0 (auth+confirm+idempotenza+audit). P0 vertical slice: `/health` + `/mcp` con search/fetch su corpus piccolo verificato.
- `docs/product/FASTAPI-INTEGRATION-GATEWAY.md`: MVP = `POST /graph/search` + `GET /student-pack/{id}` read-only deterministici.
- `docs/product/CHATGPT-APPS-MCP-INTEGRATION.md`: MVP tool `graph_search` + `get_student_pack`; `mount_plugin` solo dietro firma ed25519 host; scope studente/docente; lingua propagata.
- **Spec MANCANTI** (verificato per filename+grep): `TEACHER-DASHBOARD-SPEC.md` (esistono solo doc legacy ELAB), `GOOGLE-DRIVE-INTEGRATION.md`, Moodle/Teams/LMS dedicate, auth/multi-tenant, pricing/payments. → candidati per prossime sessioni C/D.
- Nota: tutti i `docs/product/` sono **solo locali** (main 404) — la prima azione utile è pushare quel set come docs-PR (P1 inventario).

---

## 14. Electrotechnics Solver / ExamForge (idee centrali, zero codice)

- Stato: **ZERO implementazione** (nessun runtime pack/endpoint/PDF/image-to-netlist). Il solver MNA esiste già nell'engine canonico — riusarlo.
- Ordine non negoziabile: ① DC prima; ② input = netlist/CircuitScene **confermata dall'umano** (mai "qualunque foto"); ③ image→circuit dopo, candidate-only. Soluzioni finali richiedono `humanConfirmed: true`.
- MVP-0 (≤5 file): fixture → validate → nodale+Thevenin → LaTeX steps → 2 golden test (partitore, Thevenin) con unità+segni.
- ExamForge: `ExamBlueprint` JSON → LaTeX + soluzioni **dal Solver** (mai answer-key allucinate); seed deterministico; no clone compiti/loghi/nomi scuola; label "practice material". Strategia "one engine, two surfaces".
- Precondizione: gate LessonOS riconfermato verde firsthand (§8).

---

## 15. UI/UX direction

`docs/product/UI-UX-DESIGN-DIRECTION.md` (local-only): baseline GoodNotes, plugin-as-objects-on-paper (post-it/sotto-post-it), manuale leggibile con zoom mobile, iPad/LIM-first, basso carico cognitivo, microinterazioni. Regola: **nessuna UI grande senza micro-slice**. Il cruscotto docente (grafo navigabile, timeline, studenti, calendario, marketplace, materiali, Drive, analytics) resta senza spec dedicata (§13).

---

## 16. Contraddizioni aperte tra i doc (verificate, da non ereditare alla cieca)

1. Gate LessonOS: FACTORY-LIVE-STATUS (02jul 01:20) = verde post-fix `6775f70`; packet Electrotechnics/NEXT-SESSION locali = rosso. → riconferma firsthand prima di build.
2. `com.elab.lessonos-hourly`: "running/KEEP-WATCH" (metà bassa file) vs "assente/do-not-re-enable" (update 02jul in testa). Vale il 02jul. Nessun doc registra chi/quando l'ha spento.
3. Canary runbook AgentMemory: su main ma invisibile nel checkout locale (branch vecchio).
4. Headroom: RESEARCH "non installare" vs ENFORCEMENT "già live" — vale ENFORCEMENT.
5. Quota A3: activity-log la dà available; Errata la smentisce (A3 inesistente). Vale l'Errata.
6. AgentMemory livez: snapshot interni a FACTORY-LIVE-STATUS oscillano (ok/failed/404/timeout) e la tabella porte è stantia; HEALTH-STATUS 02jul = fonte.
7. `GITHUB-REPO-MAP-LIVE.md` stantio (~1 giorno): non riflette PR #9–#17.
8. VERCEL-MAP non copre il corpus-gap (probe = solo HTTP 200); il gap è reale (probe live corpus=4 oggi).
9. Metriche recall non riconciliate: floor @10 ≈0.21 (canon) vs 0.42 lexical @1 (memoria 29jun) — citare fonte+data sempre.
10. PR#6: body ≠ file list (vedi §3) — esempio del perché i body non si ereditano senza diff.

---

## 17. Prossime azioni sensate (ordinate, ognuna con gate)

1. **Merge PR#16** (board payload): pulita, MERGEABLE, additiva — gate: decisione Andrea (è DRAFT per policy). Chiude la catena contratti slice cap6-esp1.
2. **Merge PR#17** (command surface): gate: eseguire `npm run verify` completo prima (il body dichiara che non è stato fatto).
3. **Docs-PR `docs/product/`** (6 file P1) + i 6 doc ops P0 dell'inventario: secret-scan + COV, uno per PR.
4. **Decisione fedeltà-libro** (§4.3): topologia fixture 2-fili/LED-a-cavallo vs ponte attuale; poi aggiornare fixture+guard nello stesso commit.
5. **Committare la slice MOUNT-CANVAS** (oggi untracked, a rischio): spezzare ToolCanvasEmbeddable, rimuovere path assoluti, test verdi prima del commit (ordine da NEXT-CODEX-PACKET: docs→command-surface→toolhost-solo-se-test-verdi).
6. **Micro-slice LessonOS** (≤5 file, zero LLM/MCP): event-log schema + materializer + evidence-ref + recall deterministico + test.
7. AgentMemory P0: solo secondo canary runbook, una azione per finestra, approval Andrea.
8. Corpus-gap Vercel: rigenerare segments.jsonl + redeploy = gate Andrea (nessun deploy autonomo).
9. Spec mancanti: TEACHER-DASHBOARD-SPEC (task C), COLLABORATOR-ONBOARDING (task D), GOOGLE-DRIVE-INTEGRATION.

---

## 18. Come lavorare qui (regole per Claude/agenti — sintesi vincolante)

- **Fonti in ordine**: AGENTS.md → `docs/vault/ARDESIA-MAP.md` → evidenza live firsthand → docs/ops packets → AgentMemory (solo cache) → chat.
- **Micro-task con context packet** (objective, file da leggere/NON leggere, evidence commands, stop criteria) — mai "capisci tutto".
- **COV obbligatoria** a fine task: task scelta, file letti, comandi, claim verificati vs non, rischi, cosa non fatto, prossima azione.
- **Vietato sempre**: toccare `eval/gate.sh`; auto-merge/push diretto a main; deploy senza OK; `git add -A` (vault Syncthing e non solo); force-push/reset --hard; segreti/.env in repo o log; dichiarare esistente un'integrazione senza evidence; usare PR#6; riattivare scheduler pausati; scrivere su AgentMemory con livez in timeout; creare una seconda app ELAB; nuovo grafo parallelo a LessonOS.
- **Working tree principale = del loop Codex** (sporco): lavorare in worktree separati da `origin/main`.
- Numeri e stati si citano **con fonte e data**; i doc ops si contraddicono (§16): l'evidenza firsthand vince sempre.
