# Iter 14 P0 — RAG Metadata Backfill Audit

**Date**: 2026-04-28
**Author**: backfill-opus iter 14 (Claude Opus 4.7 1M)
**Branch**: `claude/iter-14-cycle-N` (DRAFT, no commit)
**Repo HEAD**: 3025a71 (iter 13 PHASE 1 shipped)
**Status**: INVESTIGATION COMPLETE — Andrea ratify required before ANY DB write

---

## 1. Root Cause — CONFIRMED

### 1.1 Symptom

Iter 13 wave shipped Reciprocal Rank Fusion (RRF) hybrid search + Wiki BM25 + dedup uniqueness. Despite all three landing CLEAN, **B2 benchmark recall@5 stayed at 0.390** (no measurable lift). Score iter 13 close held at 9.30/10 ONESTO unchanged.

### 1.2 Diagnostic — Hard Numbers

Sample query against `rag_chunks` (LIMIT 1000):

| Field | NULL count | NULL % |
|---|---|---|
| `chapter` (integer) | 1000 / 1000 | **100%** |
| `page` (integer) | 1000 / 1000 | **100%** |
| `section_title` (text) | 1000 / 1000 | **100%** |
| `figure_id` (text) | 1000 / 1000 | **100%** |
| `content_raw` | 0 / 1000 | 0% |
| `embedding` | 0 / 1000 | 0% |
| `contextual_summary` | ~5 / 1000 | <1% |
| `bm25_tokens` | 0 / 1000 | 0% |
| `metadata` jsonb | 0 / 1000 | 0% (but only `chunk_index`, `char_start`, `char_end`, `source_type`) |

Sample chunk inspected:
- `source` = `vol1`
- `content_raw` = "Capitolo 6 - Cos'è il diodo LED?" + ToC text (~500 chars)
- `metadata` = `{chunk_index: 0, char_start: 0, char_end: 500, source_type: 'volume'}`
- `chapter` = NULL, `page` = NULL, `section_title` = NULL

Total `rag_chunks` rows: ~1881 (per CLAUDE.md L139 + iter 7 commit `3bf84e0` "RAG ingest LIVE 1881 chunks").

### 1.3 Root Cause — NOT a query bug, INGEST bug

`supabase/migrations/20260426160000_rag_chunks_hybrid.sql` defines schema CORRECTLY:

```sql
CREATE TABLE IF NOT EXISTS rag_chunks (
    chapter         integer,
    page            integer,
    figure_id       text,
    section_title   text,
    ...
);
CREATE INDEX ... ON rag_chunks (source, chapter, page);
```

Schema is fine. RPC `search_rag_hybrid()` would happily filter/return these columns. **The ingest script never populated them.**

### 1.4 Ingest History — Forensic

```
3bf84e0 feat(sprint-s): iter 7 close - RAG ingest LIVE 1881 chunks + benchmark suite iter 8
8bae948 feat(bench+rag): scorer +2 PZ rules + Anthropic Contextual Retrieval ingest script
ad97713 feat(onniscenza): RAG 549→1849 chunks (+237%) + Wiki L2 seed
c8c825e feat(rag): RAG allargato da 94 a 549 chunk
```

Two ingest pipelines exist in repo:

**Pipeline A — `scripts/extract-volumes-rag.py` + `scripts/upload-rag-supabase.py`** (LEGACY, ~Apr 11 2026)
- pdfplumber → page-level extraction → `detect_chapter()` regex → JSON output
- Uploads to table `volume_chunks` (NOT `rag_chunks`)
- Schema: `(volume INT, chapter TEXT, section TEXT, content TEXT, page_number INT, token_count INT, embedding vector)`
- **Has chapter + page populated**. But populates wrong table.

**Pipeline B — `scripts/rag-ingest-voyage-batch.mjs`** (CURRENT, Apr 27 2026, commit `3bf84e0`)
- Reads `vol1.txt`, `vol2.txt`, `vol3.txt` (pre-extracted plain text, no page boundaries)
- `chunkText()` slides 500-char window with 100-char overlap (NO chapter/page detection)
- Stores to `rag_chunks` with payload:

```js
body: JSON.stringify({
  content: contextual + '\n\n' + chunk.content,
  content_raw: chunk.content,
  embedding,
  source: chunk.source_id,                          // 'vol1' | 'vol2' | 'vol3'
  contextual_summary: contextual,
  metadata: {
    chunk_index: chunk.chunk_index,
    char_start: chunk.char_start,                   // <-- char offset, NOT page
    char_end: chunk.char_end,
    source_type: chunk.source_type,
  },
})
// chapter / page / section_title / figure_id  ← NEVER SET
```

Pipeline B explicitly skips chapter/page extraction. The .txt sources don't carry page boundaries — pdfplumber→.txt stripped them.

**Why this happened**: iter 7 swap from Python pdfplumber → Node Voyage batch was driven by API rate limits + batch efficiency. Lost the page-level metadata in the migration. No iter caught it because B2 bench was failing for OTHER reasons (RRF, dedup) and metadata-NULL was masked.

---

## 2. Source Data Inventory

```
/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/
  VOL1_ITA_ COMPLETO V.0.1 GP.pdf          27.7 MB    Dec 12 2025    114 pp
  VOL2_ITA_COMPLETO GP V 0.1.pdf           17.6 MB    Dec 12 2025    117 pp
  Manuale VOLUME 3 V0.8.1.pdf              18.2 MB    Jan 23 2026    95 pp
  vol1.txt                                  82 KB     Apr 26 2026    (no page markers)
  vol2.txt                                  118 KB    Apr 26 2026    (no page markers)
  vol3.txt                                  80 KB     Apr 26 2026    (no page markers)
```

The .txt files were generated via `pdftotext` (per `volume-references.js` header comment) — flat text, page numbers lost.

---

## 3. Existing Metadata Already Extracted — `src/data/volume-references.js`

92 entries (verified via `grep -c "^  '"`), 1225 LOC. Schema per entry:

```js
'v1-cap6-esp1': {
  volume: 1,
  bookPage: 29,                                          // <-- page number
  chapter: "Capitolo 6 - Cos'è il diodo LED?",           // <-- chapter title
  chapterPage: 27,
  bookText: "Per accendere il LED ...",
  bookInstructions: ["Collega la clip ...", ...],
  bookQuote: "Il LED si è acceso! ...",
  bookContext: "Primo esperimento del libro ..."
}
```

92 lesson-paths × ~3 chunks each ≈ 276 mapping signal points. NOT 1881 (=full chunk count) — coverage will be partial unless we expand mapping logic.

---

## 4. Two Backfill Paths — Analysis

### Path A — UPDATE rag_chunks via SQL (substring match)

**Approach**: For each `rag_chunks` row WHERE `chapter IS NULL`, fuzzy-match `content_raw` against the 92 entries in `volume-references.js`. If `content_raw` contains `bookText` substring (or shares ≥3 contiguous bookInstructions tokens) → assign that lesson's `chapter` + `bookPage`.

**Implementation**:
- 200-LOC Node script `scripts/backfill/rag-metadata-backfill-iter14.mjs`
- Reads `volume-references.js` mapping
- Queries Supabase REST `GET /rest/v1/rag_chunks?chapter=is.null&select=id,source,content_raw`
- Per chunk: compute best-match lesson via fuzzy includes + Levenshtein
- Emit `UPDATE rag_chunks SET chapter=$1, page=$2, section_title=$3 WHERE id=$4` batch
- DRY-RUN mode: log SQL to file, NO execute
- COMMIT mode (post-Andrea-ratify): execute UPDATEs

**Pros**:
- ~1h dev + 10 min run
- ZERO re-embed cost (€0)
- ZERO UUID change → gold-set v3 unchanged
- Reversible: `UPDATE rag_chunks SET chapter=NULL, page=NULL WHERE chapter IS NOT NULL`

**Cons**:
- Substring match → false positives possible (e.g. multiple lessons mention "LED" + "470 Ohm")
- Coverage limited to 92 lessons × ~3 chunks ≈ 276 of 1881 = ~15% of chunks reachable
- Remaining ~85% (intro/glossary/wiki content) stay NULL — bench recall lift maxes at +0.10–0.15 estimate (NOT 0.55+)

**Risk score**: LOW. Worst case = false matches → wrong chapter/page on ~5% of chunks. Reversible.

### Path B — Re-ingest with metadata extraction

**Approach**: Re-run pipeline with PDFs (not .txt) using `pdfplumber` + chapter/page detection. Replace all 1881 chunks (DELETE + reingest).

**Implementation**:
- ~100 LOC update to `rag-ingest-voyage-batch.mjs` to read PDF page-by-page
- Detect chapter via existing `detect_chapter()` regex from `extract-volumes-rag.py`
- Re-embed all 1881 chunks via Voyage AI (~10 min @ batch 15 + 21s rate limit)
- Cost: €0 (Voyage free tier 50M tok/mo) + €0–1 Together AI contextual

**Pros**:
- 100% coverage (every chunk gets chapter + page)
- Bench recall@5 ≥0.55 plausible
- Schema metadata fully populated → enables future filters (chapter-pinned retrieval, page-citation UI)

**Cons**:
- ~3h total (script update + ingest + verify)
- UUIDs change → gold-set v3 chunk_id references break (need refresh)
- Higher risk: bug in extraction = entire RAG corrupted; need careful verify
- Edge functions + bench scripts that depend on chunk_id continuity need re-validation

**Risk score**: MEDIUM. Reversible only by re-ingest from yet-another snapshot.

---

## 5. Recommendation

**Iter 14 P0 = Path A (DRY-RUN first, ratify, then COMMIT)**.
Iter 15 P0 = Path B if Path A coverage <30% OR recall@5 lift <+0.10.

Rationale:
1. Path A is reversible + cheap. Ship in iter 14 within 12h budget.
2. If Path A lifts B2 recall@5 from 0.390 → 0.50 → ratify product-sellable claim with measurable evidence.
3. If still <0.50, queue Path B for iter 15 with proper time budget (no 12h scramble).
4. Path B requires gold-set v4 regeneration — non-trivial, deserves dedicated iter.

---

## 6. Andrea Ratify Queue — BLOCKING

Before ANY of these can land:
1. **ADR-020** (this audit's recommendation): Path A vs Path B, sign-off chosen.
2. **DRY-RUN review**: Andrea reads `scripts/backfill/output/dry-run-iter14.sql` (output of script in DRY mode), eyeballs 10 random UPDATE statements, confirms chapter/page assignments look right.
3. **Mac Mini D6 trigger**: Andrea Telegram approve `--commit` execution.
4. **Post-commit verify**: Mac Mini re-runs B2 bench, posts result to `automa/state/RAG-BACKFILL-RESULT.md`.
5. **Iter 14 contract**: Andrea ratifies `docs/pdr/sprint-S-iter-14-contract-DRAFT.md` ATOM-S14 list before any other work claims iter 14 atoms.

---

## 7. Open Questions

- **Q1**: Should backfill also touch `wiki` source rows (~300 chunks)? volume-references.js has zero wiki mapping — would need new wiki→chapter mapping. **Defer to iter 15.**
- **Q2**: Should we backfill `figure_id` (e.g. `fig.6.2`)? volume-references.js has NO figure data. **Skip iter 14, iter 16+.**
- **Q3**: B2 gold-set v3 — does it filter by `chapter`? If yes, lift will be measurable IF backfill works. If no (filters only by `source`), no lift visible regardless. **Verify before claiming bench win.**

---

## 8. CoV Final

- [x] Root cause confirmed (1000-sample 100% NULL, schema fine, ingest is bug)
- [x] Two paths analyzed with cost + risk + reversibility
- [x] Recommendation Path A iter 14, Path B queued iter 15
- [x] Andrea ratify queue defined (5 gates)
- [x] Mac Mini D6 task brief separate file
- [ ] Andrea ADR-020 binary ratify ← **BLOCKER**
- [ ] DRY-RUN executed (post-ratify) ← BLOCKER
- [ ] COMMIT executed (post-DRY-review) ← BLOCKER
- [ ] B2 re-run + recall@5 report ← BLOCKER

---

**End audit.** No production DB writes performed during this investigation. All findings derived from schema migration files + ingest script source + iter 13 close report numbers.
