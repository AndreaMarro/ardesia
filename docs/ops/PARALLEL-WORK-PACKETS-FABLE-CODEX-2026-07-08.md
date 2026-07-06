# Parallel Work Packets — FABLE ↔ Codex (2026-07-08, sessione NOTTE-7)

Base: `origin/main = ea4f0107` (#114), baseline `apps/studio` = **1089/5** (firsthand).
FABLE ha aperto **PR #115** (P0-B plugin bundle integrity), suite → 1092/5.

Regola-madre: `gh pr list` prima di OGNI merge (sessioni FABLE parallele). vitest SEMPRE
da `apps/studio`. Nessuna nuova dip senza gate-Andrea. Ownership file rispettata per
evitare collisioni.

---

## FASE 0 — Mappa dead-end (file:line · impatto · rischio · owner · verifica)

| # | Area | Evidenza file:line | Impatto | Rischio | Owner | Verifica falsificabile |
|---|------|--------------------|---------|---------|-------|------------------------|
| D1 | **ADR-0001 srcDoc bypass** | `ToolLab.tsx:143` `srcDoc` + `allow-scripts allow-same-origin`; guard e2e `e2e/toolhost-srcdoc-bypass.spec.ts` | Tool nella stessa origin dello Studio: DOM+rete Studio raggiungibili | ALTO | **GATE-Andrea** (B/C/A) | e2e FINDING oggi verde (bypass reale); post-enforcement DEVE arrossire |
| D2 | **Plugin bundle integrity at-install** | `installer.ts` step4b + `manifest.integrity` | swap entry post-firma → **CHIUSO in #115** | — | FABLE (done) | `PluginPackage`/`ToolInstaller` reject `/integrity/` |
| D3 | **TOCTOU install→mount** | `~/maestro-studio host.ts:156 verifyBundleIntegrity` **assente monorepo**; mount non rilegge il bundle da storage | swap del bundle *già installato* fra install e mount | MEDIO | Codex (dopo che un mount legge lo stored bundle) | rehash-at-mount vs `install.json.bundleHash` |
| D4 | **Capability non instradate** | `messages.ts:151` (`TOOL_METHODS` = solo `board.*`+`storage.*`); gate `policy.ts:110` | `graph.*`/`llm.generate`/`net.fetch`/`ui.*` dichiarabili ma **non wired** → Pack disciplinari muti | ALTO | FABLE/Codex | router risponde `METHOD_NOT_FOUND` fuori registro |
| D5 | **Multi-plugin board** | `Room.tsx` (post-it), `ToolCanvasEmbeddable.tsx` (untracked WIP) | più istanze dello stesso plugin, storage isolato per-istanza | MEDIO | FABLE | board.write di istanza A non visibile a istanza B |
| D6 | **Simulation Plugin realtà** | `toolhost/simulationBreadboard.ts` (untracked WIP), solver dietro registry (#53) | solo demo LED; manca multimetro/oscilloscopio/wire libero/multi-board | ALTO | FABLE | netlist misurabile su montaggio arbitrario |
| D7 | **visualMatch overlay CV** | grader strutturale #113 `visualmatch`; cv2/skimage assenti | overlay vero = GATE dip + GT annotata | MEDIO | **GATE-Andrea** | `visualOverlayScore` su crop p30/31 vs render |
| D8 | **ELABTutor alignment scale** | lesson-paths, `common_mistakes`, esperimenti ELAB vs volumi | inventario disponibili/simulabili/mancanti mai fatto a scala | ALTO | Codex (audit) | report coverage con Vol/Pag |
| D9 | **Cross-compiler/upload Arduino** | nessuna infra WebSerial/WebUSB/compile | upload reale via browser assente | ALTO | Codex (audit) + gate infra | contract board-catalog + compile/upload |
| D10 | **Teacher Panel graph/stat** | Z7 chiuso; manca graph/materializer LessonOS + stat card da event-log | cruscotto non operativo su dati reali | MEDIO | FABLE/Codex | stat derivate SOLO da event-log, no store proprio |
| D11 | **Dev key in bundle** | `sim/keys.json` checked-in (debito #58) | firma offline publisher assente → prerequisito marketplace terzi | MEDIO | **GATE-Andrea** | chiave privata mai in bundle spedito |
| D12 | **Plugin pedagogy pack** | assente | nessun plugin LessonOS-connesso (quiz/concept-map/exit-ticket) | MEDIO | FABLE/Codex | emette eventi LessonOS + appare in teacher panel |

---

## FASE 1 — Ranking P0/P1/P2 (per importanza, non facilità)

**P0**
- **P0-B (DONE, #115)** — plugin bundle integrity at-install. ✅
- **P0-D (D4)** — instradare 1 capability oltre board/storage (es. `graph.query` read-only) per sbloccare Pack disciplinari. Falsificabile: router risponde a `graph.query` con dato reale dall'event-log/materializer, non `METHOD_NOT_FOUND`. PR minima, no dip. **FABLE next.**
- **P0-C (D5)** — multi-istanza post-it con storage isolato per-istanza. Falsificabile: due post-it stesso plugin, `storage.*` namespacato per instanceId, nessun cross-write. Rischio UI su Room.

**P1**
- D6 Simulation asse profondo (multimetro/misura netlist) — grande, spezzare.
- D10 Teacher graph/stat da event-log.
- D12 Plugin pedagogy pack minimale.
- D3 TOCTOU rehash-at-mount (dopo che esiste un mount che legge lo stored bundle).

**P2 / GATE-Andrea**
- D1 enforcement ADR-0001 (B/C/A), D7 overlay CV, D11 firma offline, D9 infra compile.

---

## FASE 2 — Assegnazione parallela

### FABLE (in corso / prossimi)
1. **#115 P0-B** — MERGIATA (main `cec7f9be`, post-merge 1092/5). ✅
2. **P0-D D4 — MERGIATA (#116, main `b3c61096`, 1104/5)**: `graph.query` read-only nel wire, CONTRACT 1.1.0. **#117 MERGIATA (main `b3cc021c`, 1113/5)**: `plugins/ripasso/` primo consumatore reale (contract `>=1.1 <2.0` = primo uso del gate). ✅ Residuo: wiring event-log LIVE in superficie montata (vedi PROMPT-NEXT NOTTE-8 punto 1).
3. **P0-S1 (da PKT-CODEX-3 finding P1.1) — IN CORSO (NOTTE-9, 2026-07-10)**: `verifyInstalledTool` reverify fail-closed del manifest installato, consumato in ToolLab + localCatalog. Branch `feat/toolhost-installed-reverify-20260710`. Ownership FABLE: `installer.ts`, `toolLab.ts`, `marketplace/localCatalog.ts` + test relativi.
4. **P0-C D5** — storage per-istanza. Ownership: `toolhost/caps/storage.ts`, `Room.tsx`, `ToolCanvasEmbeddable.tsx`. ATTESA: WIP parallelo vivo su quegli stessi file.

### Codex (indipendenti, non conflittuali)
- **PKT-CODEX-1 — Audit ELAB experiments coverage (D8)**: inventario esperimenti ELAB/sito → {disponibile, simulabile, mancante, scene candidate, geometry, visualMatch, common_mistakes} con Vol/Pag. SOLA LETTURA + nuovo doc `docs/ops/ELAB-EXPERIMENTS-COVERAGE-2026-07-08.md`. Nessun file di codice toccato. **← CONSIGLIATO ORA (con PKT-2), mentre FABLE fa P0-S1.**
- **PKT-CODEX-2 — Audit cross-compiler/upload (D9)**: cosa esiste (WebSerial/WebUSB, AVR/Nano/R4/RA4M1, compile service), licenze, fattibilità browser. Doc `docs/ops/ARDUINO-COMPILE-UPLOAD-AUDIT-2026-07-08.md`. Nessun codice.
- **PKT-CODEX-3 — Security review ToolHost signing/hash**: ✅ **CHIUSO 2026-07-09** — review in `docs/ops/CODEX-SECURITY-REVIEW-TOOLHOST-SIGNING-HASH-2026-07-09.md`. Findings integrati: P1.1 → **P0-S1 FABLE in corso**; P1.2 (srcDoc same-origin) → resta gate ADR-0001; P1.3 (dev key checked-in) → P1-S2 candidato FABLE post-S1; P1.4/TOCTOU mount → PR-D futura (quando un mount leggerà `bundlePath`); P2.1 (preview integrity UX) → P1-S3 backlog; P2.2 (install non transazionale) → backlog.
- **PKT-CODEX-4 — Teacher panel Z-zones report (D10)**: mappa Z1-Z12, cosa esiste, quali graph/stat sono derivabili SOLO da event-log. Doc, no store proprio.

### NON fare in parallelo
- Codex NON tocca `installer.ts`/`toolLab.ts`/`marketplace/localCatalog.ts` (né i loro test) finché P0-S1 FABLE non è mergiata.
- Codex NON tocca `messages.ts`/`router.ts`/`policy.ts`/`host.ts`/`caps/` né `plugins/ripasso`.
- Nessuno tocca `ToolLab.tsx` sandbox finché ADR-0001 non è deciso da Andrea.
- `Room.tsx`/`ToolCanvasEmbeddable.tsx`: WIP untracked di sessione parallela sul checkout `codex/ardesia-ops-headroom-20260701` — coordinarsi via log condiviso prima di toccarli.

### Ordine consigliato (aggiornato NOTTE-9)
1. FABLE P0-S1 (in corso). 2. Codex PKT-1/2/4 (audit read-only, sempre sicuri). 3. FABLE P1-S2 (dev key) o P0-LIVE eventLog (se WIP libero). 4. P0-C D5 dopo coordinamento WIP.

### Handoff per pacchetto
Ogni pacchetto Codex: apre branch da `origin/main`, doc nuova in `docs/ops/`, nessun file di codice condiviso con FABLE, `gh pr list` prima di eventuale merge, CI verde.
