# Experiments (probe cards)

Scope: frozen code `eb7a018d`. Mutations ran ONLY in the disposable probe
copy (`ardesia-review-probe`, detached); the dossier worktree and the
candidate branch were never modified. Node 26 local vs CI Node 22 recorded
where relevant; no product claim depends on the difference.

## E1 — artifact integrity

- Property: downloaded artifact is byte-identical to CI's object.
- Risk: stale/tampered download presented as evidence.
- Hypothesis: sha256(downloaded zip) == GitHub digest.
- Expect-true: match. Expect-false: mismatch.
- Command: `gh api .../actions/artifacts/10614899146/zip` + `sha256sum`.
- Observed: `471bdb1d...` match True. 8 members listed.
- Conclusion: integrity holds for this artifact only.

## E2 — internal cross-references

- Property: runtime-evidence.json describes the co-shipped bytes.
- Command: python hash compare of lesson-a/b.lesson, summary-a.md,
  d2-lesson-a.pdf (%PDF- magic) vs JSON fields.
- Observed: all match (lesson hashes, md bytes 525, pdf bytes 39567,
  page-count 1 == runtime pages 1).
- Conclusion: JSON is faithful to the archive.

## E3 — H-01 heading structure (DEFECT_CONFIRMED, P2)

- Property: every markdown `##` heading renders as semantic `<h2>`.
- Hypothesis: narrative/appendix join drops the required blank line.
- Expect-true: `<p>...##\nErrori e correzioni</p>`, 2 H2s.
- Expect-false: 3 semantic H2s.
- Command: `pandoc -f markdown -t html5` on artifact `summary-a.md`
  (local pandoc 3.9.0.2; no Engine run, no product change).
- Observed: literal `##` inside `<p>`; H2 count 2 (`Sintesi`,
  `Concetti registrati`); facts (error list items) preserved.
- Conclusion: structure-only defect at the first-appendix-section
  boundary (`summarizer.py:631-636` join). Remedy proposed in
  review.json, NOT applied (freeze).

## E4 — ack temporal property re-run

- Property: no confirmation before append resolution; ack-gated count;
  immediate export observes the confirmed fact.
- Command: vitest `MarkedExportRace.test.tsx` in probe copy.
- Observed: GREEN (1/1).
- Conclusion: holds in tested scope (in-memory log, single room).

## E5 — concurrency + unmount probes (temporary, probe copy only)

- Property: two in-flight marks neither anticipate nor duplicate;
  unmount mid-flight crashes nothing and misattributes nothing.
- Command: vitest `tmp-review-probes.test.tsx` (copy in `probes/`).
- Observed: both GREEN (2/2).
- Conclusion: holds in tested scope; IndexedDB-reopen and multi-tab
  remain NOT_RUN (no personal profile touched).

## E6 — emit-increment mutation

- Property: the race test detects the original defect class.
- Command: re-add `setMarkedCount` on emit in probe copy only.
- Expect-true (mutated): race + concurrency probes RED, unmount unaffected.
- Observed: exactly that (2 failed / 1 passed).
- Conclusion: oracles discriminate; restored byte-identical (`git diff` empty).

## E7 — sandbox matrix (unit level, no browser)

- Property: sandbox disabled only via explicit opt-in.
- Matrix: False+absent→off; True→on; False+env"1"→on (explicit False
  does NOT override env); other values→off.
- Observed: all four as documented in code docstring.
- Conclusion: behavior matches docs; CI env drives CI behavior only.
  CI run proves rendering WITH the opt-in, not sandboxed rendering.

## E8 — fixture freshness mutation

- Property: tampered producer bytes fail before consume.
- Command: flip bytes in a COPY of lesson-a, run consumer.
- Observed: `RuntimeError: fixture freshness: entry drift`.
- Conclusion: freshness gate discriminates; nothing committed.

## E9 — grounding + ingest suites re-run

- Command: pytest test_summarizer/ingest_bundle/lessonos_snapshot/
  export_browser_pdf/store_sqlite/compose in probe copy.
- Observed: 118 + 201 passed.
- Conclusion: cross-lesson/invented-excerpt/digest/TOCTOU oracles green
  at frozen SHA.

## E10 — B-side isolation on CI bytes

- Property: B bundle carries no A markers.
- Observed: no A journal text, no A error ids, manifest lessonId B.
- Conclusion: bilateral isolation holds at bundle level for this fixture.

## E11 — MCP official facts re-check (2026-09-21)

- Spec 2026-07-28 still latest; Python SDK v2.2.0 latest, Tasks unshipped
  (known gaps). No drift vs readiness doc.
- Conclusion: "latest" strings hold as of today; re-check before use.
