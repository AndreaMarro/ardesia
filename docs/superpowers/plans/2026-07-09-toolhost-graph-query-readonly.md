# ToolHost `graph.query` read-only (P0-D) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire la capability `graph.query` (già nel vocabolario, mai instradata) come metodo wire READ-ONLY che risponde con dati REALI derivati dall'event-log LessonOS via `materialize()` — oggi il router risponde `METHOD_NOT_FOUND` (D4, `messages.ts:147-154`).

**Architecture:** Il grafo NON è un secondo store: `caps/graph.ts` chiama `EventLogStore.readAll()` e materializza on-demand (`lessonos/materializer.ts`), quindi filtra/limita e serializza in forma wire (Map→array). L'host espone il handler SOLO se il chiamante inietta un event-log (`ToolHostDeps.eventLog`), speculare a `storage` (handler assente = `INTERNAL "method not wired"`); la capability resta deny-by-default nel router. La superficie SDK cambia (nuovo metodo wire) ⇒ golden aggiornato + `CONTRACT_VERSION` 1.0.0 → **1.1.0** (MINOR additive, regola SemVer in `sdk/index.ts:14-19`).

**Tech Stack:** TypeScript, Zod (schemi wire strict), vitest (da `apps/studio`), zero dipendenze nuove.

## Global Constraints

- NESSUNA nuova dipendenza (gate-Andrea).
- READ-ONLY: nessun metodo `graph.propose*`/write in questa PR; l'interfaccia consumata da `ToolGraph` è `{ readAll() }` strutturale — nessun accesso ad `append`.
- Niente seconda memoria: il grafo è SEMPRE derivato da `readAll()` al momento della query, mai cachato/persistito.
- Deny-by-default: senza grant `graph.query` → `CAPABILITY_DENIED`; params fuori schema → `INVALID_PARAMS`; host senza event-log iniettato → `INTERNAL` (mai silenzio).
- vitest SEMPRE da `apps/studio`. `tsc -b` = verità. TDD RED→GREEN osservato.
- Codex non tocca `messages.ts`/`router.ts`/`policy.ts`/`caps/` durante questa PR (ownership PARALLEL-WORK-PACKETS).

## Wire contract (deciso qui, fonte per tutti i task)

```ts
// params
{ select: "summary" | "nodes" | "edges", kind?: NodeKind|EdgeKind, limit?: 1..500 }
// cross-field: kind vietato con select:"summary"; kind di arco vietato con "nodes" e viceversa.
// result (strict, campi mutuamente esclusivi per select)
{ total: number,                       // conteggio pre-limit: il tool vede il troncamento
  summary?: { nodeCounts: Record<string,number>, edgeCounts: Record<string,number>, uncorrectedErrors: number },
  nodes?: Array<{ id, kind, labels, evidenceRefs, introducedAt, correctedAt? }>,
  edges?: Array<{ from, to, kind, introducedAt, evidenceRefs }> }
```
Default `limit` = 200. Ordine = ordine deterministico del materializer (insertion order per seq).

---

### Task 1: Schemi wire + registro metodo (RED conformance prima)

**Files:**
- Modify: `apps/studio/src/toolhost-protocol/messages.ts` (dopo blocco storage, ~riga 136)
- Test: `apps/studio/src/__tests__/Toolhost.conformance.test.ts` (nuovo describe)

**Interfaces:**
- Produces: `GraphQueryParamsSchema`, `GraphQueryResultSchema`, `GraphNodeWireSchema`, `GraphEdgeWireSchema`, tipi `GraphQueryParams`/`GraphQueryResult`; entry `"graph.query"` in `TOOL_METHODS` con `cap: "graph.query"`.

- [ ] **Step 1: test RED** — in conformance, describe `conformance/graph.query`: (a) con grant `{"graph.query":{}}` e handler cablato, request `graph.query {select:"summary"}` NON deve più dare `METHOD_NOT_FOUND`; (b) senza grant → `CAPABILITY_DENIED` e handler mai invocato; (c) `select:"everything"` → `INVALID_PARAMS`; (d) `select:"summary", kind:"errore"` → `INVALID_PARAMS`.
- [ ] **Step 2: run** — `npx vitest run src/__tests__/Toolhost.conformance.test.ts` → (a) FAIL con METHOD_NOT_FOUND atteso ≠ ricevuto (RED osservato).
- [ ] **Step 3: implementa schemi** in messages.ts (enum kinds importabili, superRefine cross-field, result strict) + entry TOOL_METHODS.
- [ ] **Step 4: run** → GREEN su (a)-(d). NOTA: `SdkContract.compat.test.ts` ora è RED (golden drift) — atteso, si sistema in Task 3.
- [ ] **Step 5: commit** `feat(toolhost): wire schema graph.query nel registro metodi`

### Task 2: capability `caps/graph.ts` su event-log reale + host wiring

**Files:**
- Create: `apps/studio/src/toolhost/caps/graph.ts`
- Modify: `apps/studio/src/toolhost/host.ts` (`ToolHostDeps.eventLog?`, `_handlers()`)
- Test: `apps/studio/src/__tests__/ToolGraphQuery.test.ts` (nuovo)

**Interfaces:**
- Consumes: `materialize(events)` da `lessonos/materializer.ts`; `AppendedEvent` da `lessonos/eventlog.ts`; schemi Task 1.
- Produces: `interface EventLogReadLike { readAll(): Promise<AppendedEvent[]> }`; `class ToolGraph { constructor(log: EventLogReadLike); query(params: GraphQueryParams): Promise<GraphQueryResult> }`; `ToolHostDeps.eventLog?: EventLogReadLike`.

- [ ] **Step 1: test RED** — `ToolGraphQuery.test.ts`: fixture `InMemoryEventLog` con eventi REALI (`concept.introduced` legge-ohm, `error.observed` errore→concetto, `exercise.completed` con `correctsErrorId`); (a) `summary` conta nodi/archi e `uncorrectedErrors`; (b) `nodes kind:"errore"` ritorna il nodo con `correctedAt`; (c) `edges kind:"corregge"` include la propagazione esercizio→concetto; (d) `limit:1` → array troncato ma `total` intero; (e) host end-to-end: `ToolHost` con `eventLog` + grant → mount + request wire risponde dati reali; (f) host SENZA `eventLog` → `INTERNAL`; (g) read-only: `readAll` chiamato, nessun altro membro (spy strutturale).
- [ ] **Step 2: run** → FAIL (modulo assente).
- [ ] **Step 3: implementa** `caps/graph.ts` (materialize on-demand, filtro kind, limit default 200, Map→array, labels/evidence copiati) + host wiring speculare a storage.
- [ ] **Step 4: run** → PASS.
- [ ] **Step 5: commit** `feat(toolhost): capability graph.query read-only su event-log LessonOS`

### Task 3: contratto SDK — golden + CONTRACT_VERSION 1.1.0 + audit

**Files:**
- Modify: `apps/studio/src/sdk/index.ts:35` (`CONTRACT_VERSION = "1.1.0"`)
- Modify: `apps/studio/src/__tests__/SdkContract.compat.test.ts` (golden `GOLDEN_TOOL_METHODS` + `"graph.query": "graph.query"`)
- Test: `apps/studio/src/__tests__/ToolPolicyAudit.test.ts` (denied graph.query → audit entry)

- [ ] **Step 1:** aggiorna golden + bump; audit test: `routeRequest` graph.query senza grant con `onAudit` → evento `{method:"graph.query", outcome:"denied"...}` (segui shape esistente in audit.ts).
- [ ] **Step 2: run mirato** compat + audit + conformance + graph → PASS tutti.
- [ ] **Step 3: commit** `feat(sdk): CONTRACT_VERSION 1.1.0 — nuovo metodo wire graph.query (MINOR additive)`

### Task 4: CoV completo + PR

- [ ] `npx tsc -b` (da apps/studio) → 0 errori.
- [ ] `npx vitest run` ×3 da apps/studio → stesso conteggio, ≥ baseline+nuovi.
- [ ] `npm run build` → ok.
- [ ] NUL-check via python su `git diff` (`d.count(b'\x00')==0`), secret scan.
- [ ] PR minima, CI, merge via `bin/pr-merge-verify.sh` da `ardesia-wt-merge-verify` (prima `gh pr list`).

## Rollback

Feature interamente additiva dietro registro: revert del merge ripristina `METHOD_NOT_FOUND`; nessuna migrazione dati; nessun consumatore esistente del metodo. `CONTRACT_VERSION` torna 1.0.0 col revert (golden e versione viaggiano nello stesso commit).
