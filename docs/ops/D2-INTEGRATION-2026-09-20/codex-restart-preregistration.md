# Codex restart — preregistration, 2026-09-21

Unit `restart-review-postlesson-20260921`. Review source/evidence HEAD:
`705284acc4322db4d241032de071437ab0473cc1`; product candidate:
`b7f75e9d40ab063d0851f1cc6882e68e993edf47`; base:
`b124eee04acc8062c27284f23c5d9108e3767c27`.

Scope: independent candidate review, then at most one reproduced post-lesson
obstacle. No product edits before a frozen review verdict. Review/proof additions
are distinguished from the candidate. Temporary mutations are restored by exact
byte backup, never by resetting another worktree.

Frozen oracles and counterexamples:

1. Recorder-produced room A journal must yield A's formulas/pages/duration;
   B's events and the global legacy journal must not contaminate it. Test both
   room path and v2 format, plus supported legacy representation.
2. Study digest identity must survive overlapping lessons, absent start events,
   room transitions, and read failures without displaying another lesson.
3. Live export must use one authoritative scoped acquisition; live empty/failure
   must not resurrect stale persisted snapshots. Historical export is separate.
4. Persistence rejection is visible, confirmation follows durable acknowledgement;
   delayed failure is observable. Simulation pending is not global flush proof.
5. Engine rejects identity mismatch before writes, re-ingest preserves contracts;
   citations/provenance do not imply scientific correctness. Retention and
   transaction boundaries are explicit.
6. PDF AST/resources/CSP deny unsafe input; failed staging preserves a previous
   PDF. Single-file atomicity is not whole-pipeline atomicity.
7. CI evidence names the executed checkout, required/advisory lanes and skips.
   Local failures are compared on pristine main in the same runtime.

Selected capabilities: repository-native Vitest/TypeScript/pytest and existing
browser tooling; `persistent-capability-evolution` SKILL.md (version unexposed).
Model: Codex, GPT-6 family per runtime instruction; exact model/effort
`inherited/unknown` (Astra/very-high requested, not asserted as observed).
No new agents, plugins, dependencies or capability promotions. Risk: lesson
identity/privacy and erroneous material; synthetic local evidence only.

STOP: secrets/real student data, unauthorized remote write/spend, owner-locked
change. REPAIR: failed semantic oracle in the one selected unit. DEFER: paid
provider validation, real pilot without authorized lesson input, independent
review of any self-authored patch, Kirchhoff RC quorum.

Current mandate supersedes historical Hermes/DeepSeek assignments, automatic
push/revert loops, vault reads and paid review scripts. AgentMemory remains
RETIRED_NO_READ_NO_WRITE. External capability canon/registry validation and sync
are deferred under the explicit no-vault scope; local append-only receipts carry
the evidence. `INDEX_SYNC_DEFERRED`. No quota-based model routing is invented.
