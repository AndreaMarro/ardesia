# Exclusion matrix — pre-D2 commits reviewed but NOT transplanted wholesale

Producer prerequisite set: ONE minimal property port (see ack row).
Every other row carries a proof or a technical reason; "non serve" alone
is never accepted.

## Ported (property only, not the commit)

- PERSISTENCE_ACK (3ee18131): PORTED AS PROPERTY. RED observed on
  candidate (UI "1" with empty log/export). Port: `onRecorded` ack in
  `busEventLogBinding` + UI increment moved off emit (2 product files).
  NOT ported: workflow changes, bmad spec docs, e2e journey specs, CI
  lane changes. Mutation (emit-increment restored) re-verified RED.
  The exclusion below now applies only to the commit's non-property
  baggage, not to the acknowledgement property itself.

## Included-by-category reasoning

- PERSISTENCE_ACK (3ee18131): EXCLUDED AS CODE — the commit's non-property
  baggage only (workflow changes, bmad spec docs, e2e journey specs, CI
  lane changes); the minimal `onRecorded` acknowledgement property itself
  is PORTED (see Ported section above), not excluded. PROOF on the code
  side: diff main..D2 shows the `log.append(event)` call unchanged; the
  donor commit only adds the optional `onRecorded` UI-confirmation
  callback. Recorded events are byte-identical; bundle contents cannot
  differ because of it.
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
- CI_GATE (22 commits): EXCLUDED as code. Gate-location truth (§19
  correction): current main carries studio typecheck/test/build, engine
  pytest, hygiene, and e2e golden path (advisory). The blocking
  `e2e journey` lane (simulation, plugin wizard, studentpack, ELAB
  catalog journeys) lives ONLY in the hidden stack, not on main. The new
  `d2-integration-evidence` lane added by this candidate covers exactly
  the D2 property (live Studio producer → Engine consumer → synthetic
  artifact) without dragging simulation/plugin/catalog journeys.
  The 22 environment-coupled vitest reds are pre-existing on pristine
  main (measured identical), unrelated to D2 (D2 touches zero Studio
  files except the ack port + durability test).
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
