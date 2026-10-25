# Private question-bank intake QA

This small consumer reuses the lossless envelope from [PR #271](https://github.com/AndreaMarro/ardesia/pull/271),
source commit `fe245fd803aaf072721d3f27beeea3bf9f9da9d5`. It verifies one committed
bank revision without copying the corpus, importing a database, grading answers,
issuing approvals or exposing solutions to students. The historical review/probe
suite is not installed by this adoption.

```sh
python3 -m unittest discover -s bin/pro-regia -p test_question_inbox_adapter.py -v
python3 bin/pro-regia/question_inbox_adapter.py \
  --repo . \
  --ref 1898b633e26f99710535c94e25fa28241f0f45b3 \
  --expected-manifest-sha256 15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896 \
  --output /private/tmp/ardesia-bank-intake.json
```

The CLI requires `--ref`. It resolves that reference once to a commit and reads
manifest/shards through `git show`, not HEAD or the working tree. Dirty local
files therefore cannot be attributed to the selected commit. Use the actual final
integration SHA for its own release receipt; the example above deliberately pins
the baseline #304 bank. A missing/non-commit reference, stale expected manifest,
shard checksum mismatch or escaping shard path is rejected without a new receipt.

The five original integrity tests are preserved. Six added tests check immutable
committed reads with dirty local files, stale manifest pins, invalid/non-commit
references, committed shard tampering, traversal and the required CLI argument.
The Python `inspect_delivery(repo, output)` compatibility call retains the old
verified-worktree behavior and rejects uncommitted source bytes; all CLI use is
explicit-ref Git-blob mode.

At baseline #304 the manifest and 27 shard hashes match; 4,000 records round-trip
without loss, with unique question/revision identities and 1,000 per level. Every
source record is DRAFT. An envelope contains the full private authoring record,
including answer keys, and is always `QUESTION_INBOX` with
`publicationEligible: false`. It must never become a student projection.

The receipt states `runtimeCompatibility: NOT_CHECKED`. Intake does not exercise
Exam/Core/API schemas, the two-act scientific/publication gate, PostgreSQL/RLS,
scientific correctness or ministerial compliance. The old hardcoded Exam-v1
four-option/4,000-character incompatibility was a historical observation and is
not reported as the state of a later candidate. All canonical imports,
scientific/editorial approvals and publications remain zero.
