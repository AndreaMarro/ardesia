# Iter 12 RAG backfill — dry-run sample for Andrea visual review

**Generated**: 2026-05-10T20:04:59Z (UTC)
**Branch / scope**: Sprint S iter 12 P0 matcher rewrite
**Mode**: `--dry-run` (NO writes to Supabase)
**Min match score gate**: 0.55
**Project**: `euqpdueopmlllqjmqnyb` (Nanobot V2 / RAG store)

## Headline numbers

| Metric | Pre-fix (2026-05-10T17:42) | Post-fix (2026-05-10T20:04) | Delta |
|---|---|---|---|
| Chunks fetched (`chapter IS NULL`) | 1000 | 1000 | — |
| Matched | **0** | **830** | **+830** |
| Skipped | 1000 | 170 | −830 |
| Distinct UPDATE groups | 0 | 78 | +78 |

Note: fetch caps at 1000 rows per `--limit=2000` on the REST query (Supabase default page). The full table has 1881 NULL chunks per iter 11 audit, so a second page is expected at commit time. Match ratio on the first page is **83%** of fetched-and-non-null-source rows; remaining 17% are predominantly legacy `vol1`/`vol2`/`vol3` chunks failing Path A fuzzy threshold (0.06–0.45 scores) plus a handful of wiki concepts with `volume_ref: ~` (intentionally excluded — e.g. `oscilloscopio`, `random-arduino`).

## 10 random sample matches

All Path C (wiki frontmatter lookup, score = 1.0). `lessonId` here is the
topic-ID (kebab-case) since wiki concepts are organised by volume+page only.

| # | source (topic-ID) | volume | page | sectionTitle |
|---|---|---|---|---|
| 1 | `display-7segmenti` | 3 | 138 | Display 7-segmenti — visualizzare cifre con 7 LED |
| 2 | `blink-led` | 3 | 47 | Blink LED — far lampeggiare un LED con Arduino |
| 3 | `digital-write` | 3 | 47 | digitalWrite() — Comandare un Pin Digitale |
| 4 | `accelerometro-mpu6050` | 3 | 185 | MPU6050 — accelerometro + giroscopio I2C |
| 5 | `tone-notone` | 3 | 50 | tone() e noTone() — generare suoni con Arduino |
| 6 | `allarme` | 1 | 97 | Allarme — sensore + cicalino |
| 7 | `blink-led` | 3 | 47 | Blink LED — far lampeggiare un LED con Arduino |
| 8 | `voltmetro` | 1 | 22 | Voltmetro — misurare la tensione in parallelo |
| 9 | `corrente-continua` | 1 | 9 | Corrente continua (DC) |
| 10 | `debounce` | 2 | 55 | Debounce (anti-rimbalzo) |

`chapter` column written to Supabase will be `"Vol.X — {sectionTitle}"` (e.g. `"Vol.3 — Blink LED — far lampeggiare un LED con Arduino"`). `chapter_int` is `NULL` for all Path C entries since wiki concepts have no strict chapter integer — only volume + page.

## Sample skipped (10)

| # | source | reason |
|---|---|---|
| 1 | `vol2` | score 0.42 < 0.55 (fuzzy text didn't reach threshold) |
| 2 | `oscilloscopio` | no candidate (wiki concept has `volume_ref: ~`, intentionally excluded) |
| 3 | `vol1` | score 0.06 |
| 4 | `vol1` | score 0.36 |
| 5 | `vol1` | score 0.45 |
| 6 | `vol1` | score 0.16 |
| 7 | `vol1` | score 0.14 |
| 8 | `vol1` | score 0.09 |
| 9 | `random-arduino` | no candidate (wiki concept has `volume_ref: null`) |
| 10 | `vol1` | score 0.13 |

These 170 skipped chunks **stay NULL** in the DB. Two recoverable cohorts:
1. The `vol1`/`vol2`/`vol3` fuzzy-fail group → would benefit from lowering `MIN_MATCH_SCORE` 0.55 → 0.40 (separate decision, defer iter 13+ after Andrea reviews quality of low-score matches).
2. The `volume_ref: ~`/`null` wiki concepts (`oscilloscopio`, `random-arduino`, etc.) → require either backfilling the wiki frontmatter (Path A docs work) or accepting NULL (out-of-scope general knowledge).

## Honest residual gap

Path A + Path C combined cover ~83% of the **first 1000** fetched rows. The full 1881 NULL set may show different distribution on the second page (chunks 1001–1881). Andrea visual review on this sample MUST precede `--commit` execution. Even at 83% match rate this represents ~1560 new metadata rows on the full table — a 100x improvement vs the 0 written under the broken matcher.

No paragraph-level page accuracy: every chunk for `blink-led` will get the same `page=47` from frontmatter, even if the actual paragraph is on `pag.48` or `pag.49`. Sub-page precision still requires Path B re-ingest with `pdfplumber` page tracking (4h scope, separate iter).

## SQL output for review

Full SQL `dry-run-iter14-2026-05-10T20-04-59-340Z.sql` is in `scripts/backfill/output/` — 78 batched `UPDATE` statements. NOT to be executed until Andrea confirms with `ANDREA_RATIFY=1` gate.

## Next steps (Andrea action)

1. Visually skim 10 sample matches above — does each `topic-ID → Vol.X pag.Y` mapping look correct?
2. Spot-check 2–3 entries against the actual volumes (e.g. is `Voltmetro` really on Vol.1 pag.22?).
3. If green: full-table dry-run with `--limit=2000` (current code already uses this), then `ANDREA_RATIFY=1 --commit` from staging first, then prod.
4. After commit: re-run `node scripts/bench/run-hybrid-rag-eval.mjs` to measure citation Vol/pag verbatim live smoke lift (was 1-2/10, gate is ≥85% per ADR-021).
