# Sprint S — Iter 14 Contract DRAFT

**Status**: DRAFT — pending Andrea ratify
**Author**: backfill-opus iter 14 (atom proposal — final ATOM-S14 list per Andrea)
**Date created**: 2026-04-28
**Iter close target**: 2026-04-29 23:59 (12h product-sellable deadline iter 14)
**Score gate**: 9.30/10 ONESTO (iter 13 close) → 9.40/10 (iter 14 target)
**Repo HEAD baseline**: 3025a71 (iter 13 PHASE 1 shipped)

---

## 1. Iter 14 Theme

**Backfill + Live-test + Design ratify** — iter 13 RRF/BM25 infra is correct; iter 14 unblocks measurable bench lift by fixing the upstream metadata gap, while parallel atoms prove Vision E2E + ratify pending design decisions.

---

## 2. ATOM-S14 List (8–12 atoms, 5 owners)

### P0 — Critical path (iter 14 ship blockers)

#### ATOM-S14-01 — RAG Metadata Backfill (Path A)
- **Owner**: Mac Mini D6 (autonomous loop) + backfill-opus (review)
- **Files**:
  - DRAFT (already exist): `scripts/backfill/rag-metadata-backfill-iter14.mjs`
  - DRAFT helper: `scripts/backfill/match-chunks-to-lessons.mjs`
  - Output (Mac Mini writes): `scripts/backfill/output/dry-run-iter14-{ts}.{sql,report.json}`
- **Pass**:
  - DRY-RUN: ≥600 matches, sample 10 verified by Andrea
  - COMMIT: ≥70% success rate, B2 recall@5 ≥0.50
- **Andrea ratify gates**: ADR-020 sign-off, DRY review, COMMIT trigger
- **Rollback**: documented in `automa/state/MAC-MINI-D6-RAG-BACKFILL.md` § Rollback

#### ATOM-S14-02 — SimulatorCanvas mountExperiment Vision E2E live test (Box 7)
- **Owner**: vision-opus iter 14 (separate agent, NOT this one)
- **Scope**:
  - Wire `SimulatorCanvas.mountExperiment(experiment_id)` call from UNLIM ChatOverlay
  - Live verify on 3 lesson-paths: v1-cap6-esp1 (LED), v2-cap8-esp2 (Pushbutton), v3-cap10-esp1 (MOSFET)
  - Screenshot evidence in `docs/audits/2026-04-28-iter-14-vision-E2E-live.md`
- **Pass**: 3/3 mount + render correct components + Galileo describes circuit
- **Box 7 → 0.95 quality target** per CLAUDE.md scoring

#### ATOM-S14-03 — Design implementation iter 14 spec (LIM legibility)
- **Owner**: design-opus iter 14 (separate agent)
- **Scope**: partial Andrea ratify of LIM legibility spec (font sizes, contrast, large-target affordances)
- **Files**: `docs/design/2026-04-28-iter-14-LIM-legibility-spec.md`
- **Pass**: spec approved by Andrea + 1 component refactor demo (e.g. `AppHeader` font-scale)

#### ATOM-S14-04 — ADR-020 + ADR-021 ratify
- **Owner**: Andrea binary ratify
- **Files**:
  - `docs/adr/ADR-020-rag-backfill-path-A.md` (NEW — backfill-opus drafts)
  - `docs/adr/ADR-021-iter-14-vision-mount-protocol.md` (NEW — vision-opus drafts)
- **Pass**: both files have `status: ACCEPTED` + Andrea signature line

### P1 — Mac Mini carry (parallel, won't block iter 14 ship)

#### ATOM-S14-05 — D1 carry: 28 ToolSpec expand 57→80
- **Owner**: Mac Mini D1
- **Scope**: extend ToolSpec corpus from 57 to 80 entries — focus on Vol3 advanced tools (oscilloscope sim, multimeter sim, current probe)
- **Files**: `src/data/tool-specs.json` + tests
- **Pass**: 80 entries, schema valid, Galileo can cite each
- **Carry from**: iter 13 unfinished

#### ATOM-S14-06 — D2 carry: Wiki Analogia 100→200
- **Owner**: Mac Mini D2
- **Scope**: double Analogia wiki entries to 200 (Vol1: 80, Vol2: 70, Vol3: 50)
- **Files**: `docs/unlim-wiki/concepts/*.md` (~100 NEW)
- **Pass**: 200 entries, 1 RAG re-ingest pass (post Path A or B), recall@5 ≥0.55 if Path B ran
- **Carry from**: iter 13 unfinished

#### ATOM-S14-07 — D3 carry: Volumi alignment refactor
- **Owner**: Mac Mini D3
- **Scope**: refactor `src/data/volume-references.js` schema to match new RAG metadata (chapter integer, section_title, figure_id), expand from 92 to 140 lesson-paths (cover all vol1/2/3 experiments)
- **Files**: `src/data/volume-references.js` (1225 → ~1800 LOC)
- **Pass**: all 140 mappings + tests + backfill script regression
- **Carry from**: iter 13 unfinished

### P2 — Stretch (queue iter 15 if iter 14 over budget)

#### ATOM-S14-08 — Bench v4 gold-set refresh
- **Owner**: bench-opus
- **Scope**: regenerate gold-set v4 with chapter/page filter expectations
- **Files**: `scripts/bench/hybrid-rag-gold-set-v4.jsonl`
- **Pass**: 50 queries, each with expected chapter+page; v4 supersedes v3

#### ATOM-S14-09 — Telemetry: backfill audit table
- **Owner**: db-opus
- **Scope**: create `rag_chunks_iter14_backfill_audit` table tracking which IDs were touched (rollback enabler)
- **Files**: `supabase/migrations/20260428_rag_backfill_audit.sql`
- **Pass**: migration applied, all backfilled IDs logged

#### ATOM-S14-10 — Iter 13 close report polish
- **Owner**: pdr-opus
- **Scope**: add iter 13 honest score breakdown (why 9.30 didn't move despite ship)
- **Files**: `docs/pdr/sprint-S-iter-13-close-report.md` (UPDATE)
- **Pass**: Andrea signoff "honest assessment" line

---

## 3. File Ownership Matrix (RIGID — zero overlap)

| File / dir | Owner | Mode | Notes |
|---|---|---|---|
| `docs/audits/2026-04-28-iter-14-P0-rag-metadata-backfill-audit.md` | backfill-opus | WRITE NEW | Already shipped |
| `scripts/backfill/*.mjs` | backfill-opus | WRITE NEW | Already shipped (DRAFT, not exec) |
| `automa/state/MAC-MINI-D6-RAG-BACKFILL.md` | backfill-opus | WRITE NEW | Already shipped |
| `automa/state/D6-*.{md,txt}` | Mac Mini D6 | WRITE NEW | Runtime artifacts |
| `automa/state/RAG-BACKFILL-RESULT.md` | Mac Mini D6 | WRITE NEW | Final result |
| `docs/audits/2026-04-28-iter-14-vision-E2E-live.md` | vision-opus | WRITE NEW | ATOM-S14-02 |
| `docs/design/2026-04-28-iter-14-LIM-legibility-spec.md` | design-opus | WRITE NEW | ATOM-S14-03 |
| `docs/adr/ADR-020-*.md` | backfill-opus + Andrea ratify | WRITE NEW | ATOM-S14-04 |
| `docs/adr/ADR-021-*.md` | vision-opus + Andrea ratify | WRITE NEW | ATOM-S14-04 |
| `src/data/tool-specs.json` | Mac Mini D1 | UPDATE | ATOM-S14-05 |
| `docs/unlim-wiki/concepts/*.md` | Mac Mini D2 | WRITE NEW | ATOM-S14-06 |
| `src/data/volume-references.js` | Mac Mini D3 | UPDATE (cautious) | ATOM-S14-07; risk: backfill regression |
| `scripts/bench/hybrid-rag-gold-set-v4.jsonl` | bench-opus | WRITE NEW | ATOM-S14-08 |
| `supabase/migrations/20260428_rag_backfill_audit.sql` | db-opus + Andrea ratify | WRITE NEW | ATOM-S14-09 |
| `docs/pdr/sprint-S-iter-13-close-report.md` | pdr-opus | UPDATE | ATOM-S14-10 |
| `src/components/SimulatorCanvas.{js,jsx}` | vision-opus only | EDIT | ATOM-S14-02; backfill-opus NEVER touch |
| `supabase/functions/unlim-*` | NO ONE this iter | LOCKED | Andrea ratify required |
| `package.json` | NO ONE this iter | LOCKED | Iter 13 stable |

---

## 4. Pass Criteria (Iter 14 close)

### Quantitative

| Metric | Baseline (iter 13) | Iter 14 target | Box owner |
|---|---|---|---|
| B2 recall@5 (gold v3) | 0.390 | **≥0.50** (Path A success) | Box 6 |
| B2 recall@5 (gold v4 if shipped) | n/a | ≥0.55 | Box 6 |
| `rag_chunks WHERE chapter IS NULL` | 1881 | <800 | Box 6 |
| Vision E2E live tests pass | n/a | 3/3 lesson-paths | Box 7 → 0.95 |
| ADR-020 + 021 status | DRAFT | ACCEPTED | Box governance |
| Score ONESTO | 9.30 | **9.40** | overall |

### Qualitative (Andrea ratify lines)

- [ ] "Backfill DRY-RUN looks right" (10 sample matches reviewed)
- [ ] "Backfill COMMIT result acceptable" (post-bench)
- [ ] "Vision E2E live tests credible" (screenshots + Galileo descriptions inspected)
- [ ] "LIM legibility spec captures classroom reality" (design-opus delivery)
- [ ] "Iter 14 contract honest, no scope inflation" (this file)

---

## 5. Out of Scope iter 14 (defer iter 15+)

- Path B re-ingest (queue D7 iter 15 if Path A insufficient)
- Wiki source chapter/page backfill (D8 iter 15)
- `figure_id` population (iter 16+)
- New Edge Functions (iter 15)
- New Supabase tables beyond audit log (iter 15)
- TTS / Voxtral migration (separate sprint)
- Mac Mini hardware setup deltas (separate ops track)

---

## 6. Risks + Mitigations

| Risk | P | I | Mitigation |
|---|---|---|---|
| Path A coverage <30% → no recall lift | M | H | Pre-check: estimate from sample report.json BEFORE COMMIT. If projected <30%, queue Path B iter 15. |
| Backfill UPDATE corrupts production rows | L | H | DRY-RUN gate + Andrea ratify + audit table + rollback script |
| Mac Mini network failure mid-COMMIT | L | M | Idempotent UPDATEs (id-based) + retry logic + commit-result.json checkpoint |
| ATOM-S14-07 (volume-references.js refactor) breaks backfill matcher | M | M | Mac Mini D3 lands AFTER backfill commits, OR uses feature flag |
| Vision E2E live tests reveal mountExperiment regression | M | H | Halt iter 14 ship, queue hot-fix iter 14b |
| Iter 13 RRF was actually wrong (recall stays low even after backfill) | L | H | Side investigation: gold-set v3 sanity check (does it filter by chapter?) |

---

## 7. Communication

- Daily Telegram update: `[iter-14] {atom-id} {status} {ETA}`
- Andrea ratify tokens: `#ratify ATOM-S14-{NN}` per atom
- Iter 14 close: `automa/state/ITER-14-CLOSE.md` written by close-opus

---

## 8. Definition of Done (iter 14)

- [ ] All P0 atoms (S14-01 through S14-04) status = SHIPPED
- [ ] B2 recall@5 ≥0.50 measured
- [ ] Vision E2E live screenshots in audits dir
- [ ] ADR-020 + 021 status ACCEPTED
- [ ] Score ONESTO 9.40 ratified by Andrea (no inflation)
- [ ] Iter 15 contract DRAFT seeded with carry items
- [ ] Mac Mini D6 reports `D6-PASS.md`

---

## 9. Open Questions (Andrea decide)

- **Q1**: Approve Path A iter 14 + Path B iter 15? OR collapse both into iter 14 (3h budget Path B)?
- **Q2**: Box 7 Vision E2E — 3 lesson-paths sufficient or want all 92?
- **Q3**: ATOM-S14-09 audit table — must-have iter 14 or iter 15 OK?
- **Q4**: Should bench gold-set v4 land iter 14 or wait Path B (would re-baseline meaningless v4 if Path B changes UUIDs)?

---

**End contract DRAFT.** No code or DB changes until Andrea ratify per atom.
