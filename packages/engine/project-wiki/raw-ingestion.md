# Raw Ingestion — Rule-based chunking from raw text/VTT/SRT to Segments (M7 P0)

## What

`lessonos/ingest/chunker.py` transforms arbitrary prose (lecture transcripts,
.txt, .vtt, .srt) into `ChunkResultItem` chunks with auto-generated `seg_id`,
preserving optional timestamps from VTT/SRT cues.

ZERO-LLM — purely rule-based, no model calls.

## API

- `chunk_raw_text(text, source_id='raw_lesson', max_chars=800)` — text by paragraph/sentence/window
- `chunk_vtt(vtt_text, source_id='vtt_lesson')` — WebVTT cues with `start`/`end` seconds
- `chunk_srt(srt_text, source_id='srt_lesson')` — SubRip cues with `start`/`end` seconds

## Chunking strategy

1. **VTT/SRT** — parse timed cues via regex, each cue = 1 segment
2. **Paragraph** — double-newline boundaries
3. **Sentence** — `. ! ?` + uppercase letter/quote
4. **Hard window** — `_hard_split()` at word boundary near `max_chars`; no-space force-split

## Files

- `lessonos/ingest/__init__.py` — exports (`file:line 1-2`)
- `lessonos/ingest/chunker.py` — ChunkResult, ChunkResultItem, chunk_raw_text, chunk_vtt, chunk_srt, helpers (`file:line 1-298`)
- `tests/test_ingest_chunker.py` — 52 test (`file:line 1-417`)
- `fixtures/raw_transcript/lesson_derivatives.txt` — PLACEHOLDER realistic lecture prose (4225 chars)
- `fixtures/raw_transcript/lesson_derivatives.vtt` — PLACEHOLDER VTT captions (5 cues)
- `fixtures/raw_transcript/README.md` — note about PLACEHOLDER status

## Edge cases covered

- Empty input → empty result
- Whitespace only → empty
- Single word → 1 chunk
- VTT with only header → empty
- SRT with no text content → empty
- Long text without sentence breaks → hard-split at word boundary
- HTML tags in VTT → stripped
- Multi-line VTT cue → single chunk

## Links

- M7 order: `COORDINATION.md:14` (Claude-SAYS 2026-06-08)
- Fixtures README: `fixtures/raw_transcript/README.md`

## Studio `.lesson` reader — bounded recovery, 2026-10-16 (candidate b9bff962)

`lessonos/ingest/bundle.py:130` accepts legacy and manifest bundleVersion 1,
schemas 1/2/3. This selectively recovers reader/journal contracts from archive
`5b1f65779701ba680a9b4d7d0841dc9c021422ff`; it does not merge that branch.
The ingest body retains main's existing persistence path with a manifest
lessonId check before store effects (`bundle.py:439`). Legacy journal order
remains authoritative; v2 add/update/delete normalizes into that same body.

`bundle_resources.py:16` defines positive, immutable budgets: archive 256 MiB,
central directory 2 MiB, 1024 members including directories, each payload
64 MiB, each retained text 16 MiB, manifest 1 MiB, expanded total 256 MiB.
Single-disk stored/deflated ZIP is supported. ZIP64, split archives and
encryption are refused. Python ZipFile also refuses ambiguous EOCD signatures
in comments; ordinary comments are accepted. No second ZIP implementation is
introduced to widen that compatibility.

`bundle_resources.py:42` checks archive/EOCD metadata before ZipFile allocates
the central directory. `bundle_resources.py:81` preflights every member, then
reads/hashes each payload once in chunks of at most 64 KiB, bounding actual
expanded bytes independently of metadata. Only manifest/journal/session and
optional LessonOS text are retained. Opaque board/audio/PDF bytes are streamed.
PDF caps have one authority (`bundle_extensions.py:14`): 20 MiB each, 32 PDFs,
100 MiB total, enforced before payload reads on legacy and modern paths.

Manifest inventory is bijective; byte counts, SHA-256 and schema are checked.
An integrity hash does not authenticate the producer or consent. Snapshot
absence (`None`), present-empty (`""`) and opaque nonempty text stay distinct;
valid UTF-8/bytes do not attest event semantics. No snapshot projector, UI,
durable-save claim, ZERO-LLM pipeline claim or re-ingest atomicity is recovered
here. The existing narrative path and save=False/persistence coherence remain
separate work.

Evidence: baseline 2044 PASS/7 SKIP; resource/modern contract RED 14 FAIL/14 PASS
then green, plus a strict v2 version regression RED→GREEN. Early PDF/ZIP64
counterprobes 4 RED→GREEN. Full final engine 2096 PASS/7 SKIP (exit 0), with
API keys removed from the subprocess. Skips: four live LLM, two absent canonical
repo drift checks, one real corpus absent. No LLM calls or real lesson data.

Independent review rejected the first candidate f9b5722: fallback to an earlier
EOCD could preflight a smaller directory than ZipFile selected (P1); ZipExtFile
could truncate/hash an undersized metadata prefix (P2). Both now have real ZIP
regressions seen RED. Only the last EOCD signature is accepted, with an exact
EOF/comment check. A copy of ZipInfo uses a budget+1 read view while preserving
the original size/CRC/offset for verification, preventing a false low size from
silently truncating input. Stored/deflated payloads, empty/exact-cap cases,
false-high size and identical prefix/full CRC are exercised. Full revised
engine: 2109 PASS/7 SKIP, exit 0; no old failure or earlier count is erased.

## Atomic source/capsule publication — dependent local candidate

Reader-specific limits above describe b9bff962/PR262. This local unit changes
its legacy persistence path, without merging or expanding the reader PR.

`lessonos/ingest/bundle.py:439` holds an immutable candidate segment tuple and
captures accepted capsule JSON in memory. `bundle.py:459` uses the canonical
assembler and its unchanged grounding threshold before publication. Router
work holds no authoritative DB transaction. save=False changes neither source
nor capsule. The narrative provider path remains pre-existing, not ZERO-LLM.

`store/base.py:28` exposes StoredLessonRevision: lesson identity, opaque revision
token, segments and capsule JSON. This is a storage observation, not a new
lesson IR. The narrow SegmentReader/CapsuleSink protocols let the existing
assembler work against either stored or prepared source without a fake DB.

`store/sqlite.py:963` reads the pair from one SQLite snapshot; callers making
separate legacy reads can naturally straddle a commit. `sqlite.py:982` owns a
short BEGIN IMMEDIATE transaction: scope/duplicate/foreign-ID checks, revision
CAS, delete/insert source, save capsule, commit. A changed lesson raises
LessonRevisionConflict before writes. Any publication failure rolls back.

Schema11 adds one AUTOINCREMENT token table and source/capsule/lesson triggers,
covering old mutators and ABA changes. Metadata-only migration preserves old
rows and installs/backfills atomically. Purge removes the lesson-ID token row
while advancing the anonymous sqlite_sequence, so a staged old/absent revision
cannot resurrect erased content. Missing revisions use a conservative global
absence token: unrelated updates can invalidate preparation of a NEW/erased
lesson; existing per-lesson tokens do not suffer that conflict. No ID tombstone.

Evidence:18 authentic RED→GREEN; final full engine2149PASS7SKIP, exit0.40 new
cases use real file DBs, two connections, separate spawned processes exiting
after delete/capsule/commit, WAL commit between reader SELECTs, competing and
legacy ABA writers, erasure/recreation, scope/grounding failures and migration.
Source/capsule are either old+old or new+new through the new snapshot API.
Graph, summary and material projections are separate downstream work; this
unit does not claim those consumers or all existing pipelines use revisions.
No human pilot or real LLM calls, and no promotion without normal gates.
