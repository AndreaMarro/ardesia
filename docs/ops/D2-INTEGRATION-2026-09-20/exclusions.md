# Exclusion matrix — pre-D2 commits reviewed but NOT transplanted

Producer prerequisite set: EMPTY. Every row below carries a proof or a
technical reason; "non serve" alone is never accepted.

## Included-by-category reasoning

- PERSISTENCE_ACK (3ee18131): EXCLUDED. PROOF: diff main..D2 shows the
  `log.append(event)` call unchanged; the commit only adds the optional
  `onRecorded` UI-confirmation callback. Recorded events are byte-identical;
  bundle contents cannot differ because of it.
- LESSON_IDENTITY (c0a8ec41): EXCLUDED. PROOF: bundle carries raw envelopes,
  never a Studio digest (`lessonBundle.ts` identical both sides); the engine
  projector filters by lessonId. Temporal-window mixing PROVEN leaky on main
  (§15 probe: B's in-window error lands in A's digest), which is exactly why
  the bundle path correctly bypasses Studio digest scoping.
- POST_LESSON_PRESENTATION (399d1bce): EXCLUDED. PROOF: JournalRecorder
  writes room journals only (both sides); `exportLesson` reads
  `roomPaths(room).journal` on both sides (identical file). The fix repairs
  RecapView presentation, not bundle bytes.
- LESSON_OUTCOME (c70c33f5 + fba5d035 tests): EXCLUDED.
  LESSON_OUTCOME_REQUIRED_FOR_D2=NO. PROOF: zero consumer edges from the
  bundle path (`lessonBundle.ts`, engine ingest/compose) to
  `lessonOutcome.ts`/`recapHtml.ts` (grep-verified).
- CONTINUITY (99a25c31, 4be24d40, b970f365): EXCLUDED. Session-listing
  surface (`continuitySurface.ts`); no edge to lesson material, digest,
  bundle, or PDF. FUTURE_DESTINATION: continuity slice review.
- CI_GATE (22 commits): EXCLUDED. e2e journey admission + Node pinning;
  gates already live on main. No lesson-data semantics. The 22
  environment-coupled vitest reds are pre-existing on pristine main
  (measured identical), unrelated to D2 (D2 touches zero Studio files).
- TEST_INFRA (9 commits, incl. 8822b51c oracle): EXCLUDED as code, CITED as
  evidence. The recap-identity and marcatura oracles run green in CI at
  source head; their properties are presentation-layer.
- PROCESS_DOCS (10 commits: bmad specs, registries, catalog ops notes):
  EXCLUDED. No executable effect on the vertical.
- UNRELATED/SIMULATION (15 commits: canvas, sim journeys, a11y, catalog
  UI, restore journeys, studentpack download, wizard): EXCLUDED. No path or
  semantic edge to bundle/digest/summary/PDF. FUTURE_DESTINATION: their own
  lanes; studentpack download surface is not lesson material.

## Merges

None in range (0 merge commits) — no manual merge classification needed.
