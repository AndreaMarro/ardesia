# DEEP-RESEARCH-LESSONOS-SIM-ELABTUTOR-20260702

Status: public-source research import, docs-only, no runtime change
Date: 2026-07-02
Scope: LessonOS architecture, Simulation Plugin substrate, ELABTutor pack boundary.

## Method And Caveats

This file replaces the missing external deep-research artifact with a
controlled, source-linked synthesis.

What was verified:

- Public primary sources were checked for the architectural and licensing
  claims in this report.
- Local repo evidence was checked read-only from `/Users/andreamarro/VOLUME 3/ardesia`
  and from current GitHub PR metadata.
- No Gemini/ChatGPT browser deep-research submission was made from this run:
  the expected report file was absent in `VOLUME 3`, `~/maestro-tools` is not
  present on this Mac, and the repo wrapper would transmit private project
  context to a third-party browser session. This report therefore uses public
  sources plus local repo facts instead of a hidden/browser-only report.

What remains unverified:

- No benchmark was run for LiveStore, OPFS, avr8js, Wokwi, or CircuitJS in the
  ARDESIA codebase.
- No legal review was performed; license findings below are engineering
  blockers until Andrea or counsel decides otherwise.
- No deploy, AgentMemory mutation, or production API call was made.

## Source Register

Public sources:

- LiveStore event sourcing docs:
  https://dev.docs.livestore.dev/understanding-livestore/event-sourcing/
- LiveStore materializers docs:
  https://docs.livestore.dev/reference/state/materializers/
- LiveStore GitHub README:
  https://github.com/livestorejs/livestore
- Martin Fowler, Event Sourcing:
  https://martinfowler.com/eaaDev/EventSourcing.html
- Martin Fowler, event-driven article:
  https://martinfowler.com/articles/201701-event-driven.html
- Ink and Switch, Local-first software:
  https://www.inkandswitch.com/essay/local-first/
- WebKit storage policy update:
  https://webkit.org/blog/14403/updates-to-storage-policy/
- WebKit OPFS / File System API:
  https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system/
- MDN storage quotas and eviction:
  https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- web.dev OPFS:
  https://web.dev/articles/origin-private-file-system
- AVR8js GitHub:
  https://github.com/wokwi/avr8js
- Wokwi Elements GitHub:
  https://github.com/wokwi/wokwi-elements
- Wokwi docs:
  https://docs.wokwi.com/
- Wokwi Custom Chips API:
  https://docs.wokwi.com/chips-api/getting-started
- Wokwi CI docs:
  https://docs.wokwi.com/wokwi-ci/github-actions
- CircuitJS1 GitHub:
  https://github.com/sharpie7/circuitjs1
- Falstad Circuit Simulator about/license page:
  https://www.falstad.com/circuit/about.html

Local evidence used:

- `AGENTS.md`
- `docs/vault/ARDESIA-MAP.md` from `origin/main`
- `docs/ops/SIMULATION-PLUGIN-ELAB-V1-CAP6-ESP1-CONTEXT-PACKET.md`
- `docs/ops/AGENTMEMORY-MAINTENANCE-PLAN.md`
- `apps/studio/src/store/JournalRecorder.ts`
- `apps/studio/src/__tests__/JournalRecorder.test.ts`
- GitHub PR list for #16-#31 on 2026-07-02 evening

## Executive Verdict

1. LessonOS should keep the append-only event-log direction. Fowler and
   LiveStore both support the same core shape: state changes are captured as
   events, then current state/projections are derived by replay/materializing
   the log. For ARDESIA this means `JournalRecorder` events should feed a
   first-party `EventLogStore`, and teacher dashboards/graphs should remain
   projections, not a second source of truth.
2. LiveStore is a useful pattern reference, not an immediate dependency.
   Its event log, SQLite/reactive query, and materializer model maps well to
   LessonOS, but importing it now would add a new core data layer before
   ARDESIA has finished the minimal JournalRecorder -> EventLogStore bridge.
3. Local-first remains the correct moat for a school product. Ink and Switch's
   local-first framing reinforces ARDESIA's GDPR/minors constraint: useful
   work must remain available offline and under user control, with sync/export
   layered on top rather than cloud ownership first.
4. OPFS is appropriate for large local-first artifacts, SQLite/WASM stores, and
   plugin assets, but it is not magic durability. Browser storage is still
   subject to quota and eviction; ARDESIA must request persistent storage where
   supported, expose export/import, and keep `.lesson` bundles as the recovery
   path.
5. avr8js is usable for AVR CPU emulation under MIT, but it is only the CPU
   core. The external hardware model, breadboard topology, visual state, and
   grading semantics remain ARDESIA/ELAB work.
6. Wokwi Elements can be used only as presentation components if their visuals
   fit. Their own README says they do not provide functional simulation.
7. Wokwi online/CI is a reference and optional external test surface, not the
   product runtime. Its CI path needs a service credential and depends on an
   external service.
8. CircuitJS1/Falstad is a license trap for a proprietary or closed commercial
   product. Treat it as "read concepts only"; do not vendor, fork, transpile,
   or create derivative simulator code from it.
9. ELABTutor should stay a pack above the Simulation Plugin. The moat is not
   "a generic simulator"; it is book-fidelity, physical-kit continuity, and
   deterministic explanations grounded in the manual.

## LessonOS Architecture

### Verified Pattern

Fowler's event-sourcing definition matches the current LessonOS direction:
capture state changes as a sequence of events, then rebuild or query derived
state from those events. His later event-driven article also emphasizes that
the event store becomes the principal source of truth while current state is
derived from it.

LiveStore independently implements the same family of ideas for local-first
apps: change events are persisted locally, applied to a local SQLite database,
and synced/materialized. Its docs also describe materializers as ordered
responses to event-log entries.

### ARDESIA Decision

Use the pattern, not the dependency, in the next slice:

- `JournalRecorder` remains the source of board interaction evidence inside
  Studio.
- Add or finish a minimal `EventLogStore.append()` path only after the PR #24
  event-log micro-slice is merged or explicitly used as the base.
- Map a deliberately small subset first:
  - board/session lifecycle;
  - plugin mount/use;
  - manual page reference;
  - misconception/error marker;
  - exercise/solution event.
- Materialize only deterministic projections in the product:
  - teacher dashboard;
  - concept/error counters;
  - lesson recap;
  - student-pack candidates.
- Keep LLM extraction outside the trusted source-of-truth path.

### Guardrails

- Do not create a second graph parallel to LessonOS.
- Do not write teacher dashboard state back as canonical data; it is a view.
- Do not let plugin-specific ELAB data own Core memory schema.
- Do not introduce LiveStore until the first-party event contract is proven and
  the migration/rollback story is clear.

## Local-First Storage And OPFS

### Verified Pattern

Ink and Switch frame local-first as software where users retain ownership and
can work offline while still collaborating and syncing later. That aligns with
ARDESIA's school/GDPR moat.

WebKit added OPFS/File System API support to Safari on macOS 12.2+ and iOS
15.2+. WebKit also states that OPFS lifetime follows other persistent storage
types such as IndexedDB/localStorage.

The durability caveat matters: WebKit's storage policy notes best-effort
origins can be evicted under quota/storage-pressure or inactivity conditions,
and persistent mode can exclude an origin from eviction. MDN describes the
same best-effort vs persistent distinction at the Storage API level.

### ARDESIA Decision

Use OPFS as a substrate, not as the only backup:

- Store large local artifacts in OPFS or IndexedDB-backed bundles when the app
  needs browser-local performance.
- At app start or workspace open, run a storage preflight:
  - `navigator.storage.estimate()`;
  - `navigator.storage.persisted()`;
  - `navigator.storage.persist()` when user intent is clear and the browser
    supports it.
- Treat Home Screen / standalone mode as helpful UX, not a durability guarantee.
  WebKit says standalone web apps use the same origin and overall quota class
  as browser-opened apps.
- Always keep explicit `.lesson` export/import as the user-visible recovery
  path.

### Product Implication

For iPad/LIM classrooms, ARDESIA should show storage health as a quiet system
status, not as technical text in the lesson UI. The teacher needs "saved /
exportable / needs export soon", not OPFS vocabulary.

## Simulation Plugin Substrate

### avr8js

Verified:

- AVR8js is MIT licensed.
- It implements the AVR 8-bit architecture and runs in browser/Node.
- Its own README says it is the CPU core, not the whole simulator; product code
  must supply compiled machine code plus external hardware simulation and
  visual representation.

ARDESIA decision:

- Use avr8js for AVR-compatible firmware execution where the board target
  matches.
- Do not pretend avr8js solves breadboard topology, analog behavior, kit
  fidelity, or manual-aligned visuals.
- For Nano R4 / Renesas targets, keep the compile/upload target separate from
  avr8js CPU emulation; do not blur AVR and non-AVR board semantics.

### Wokwi Elements

Verified:

- Wokwi Elements are MIT licensed.
- They are web components for electronics/IoT parts.
- Their README states they provide presentation/display only and leave
  functional simulation to the host application.

ARDESIA decision:

- Use Wokwi Elements only if the visual/component fit is good enough and the
  package does not fight ARDESIA's design language.
- Do not rely on Wokwi Elements for circuit truth, topology, grading, or kit
  validation.

### Wokwi Online / CI / Custom Chips

Verified:

- Wokwi is an online electronics simulator for Arduino, ESP32, STM32, and other
  boards.
- Wokwi CI requires a service credential for GitHub Actions.
- Custom Chips API is beta and models custom hardware through C/WASM-style
  extensions.

ARDESIA decision:

- Use Wokwi online/CI as an external reference or optional CI lane only after
  explicit credentials and policy review.
- Do not make Wokwi cloud availability part of the classroom runtime path.
- Do not introduce a Wokwi CI credential into normal PR validation until Andrea
  approves the external dependency and credential handling.

### CircuitJS1 / Falstad

Verified:

- CircuitJS1 GitHub and Falstad's own about page identify the simulator as GPL.
- The GitHub repo surfaces GPL-2.0 license metadata.

ARDESIA decision:

- Do not vendor CircuitJS1.
- Do not fork it into ARDESIA.
- Do not transpile or adapt its implementation into proprietary product code.
- It is safe only as an architectural reference for public ideas like MNA or
  circuit graph concepts, then reimplement independently.

## ELABTutor Pack Boundary

### Local Evidence

Current main already contains the cap.6 experiment context packet and adapter
contract from the merged chain #13 -> #14 -> #15. Open PRs #19, #24, #30, and
#31 continue the lane:

- #19: canonical book-topology fix for ELAB Vol.1 cap.6 esp.1.
- #24: LessonOS event-log micro-slice.
- #30: teacher dashboard projection on top of #24.
- #31: breadboard topology validator on top of #19.

The active product constraint is still the same: ELABTutor must become a pack
above ARDESIA's Simulation Plugin, not a second app inside ARDESIA.

### ARDESIA Decision

Build the ELAB moat around manual fidelity:

- real volume/page references;
- physical kit parts as the protagonist;
- breadboard geometry that is falsifiable;
- deterministic circuit validation;
- simulator state tied to manual steps;
- UNLIM/teacher guidance as a layer above, not the source of truth.

Do not compete with Wokwi/Tinkercad by cloning a generic online simulator.
Compete by making the book, kit, lesson, board, and diagnostic loop one
grounded object.

## Recommended Next Slices

### Slice A: Event Bridge, After #24/#30 Gate

Goal: map Studio journal events into the LessonOS event-log contract.

Constraints:

- max 5 files;
- no UI;
- zero LLM;
- no external storage migration;
- deterministic tests only.

Acceptance:

- `JournalRecorder` event fixture maps to a minimal `LessonOsEvent`;
- `EventLogStore.append` remains append-only;
- materializer/projection can rebuild a tiny teacher dashboard view;
- test proves replay determinism from the event log.

### Slice B: Breadboard Truth, After #19/#31 Gate

Goal: make the manual circuit electrically falsifiable before any prettier UI
claim.

Constraints:

- use first-party topology/union-find logic;
- no CircuitJS code;
- no Wokwi cloud dependency;
- cite Vol.1 pages 29-31 in fixtures and tests.

Acceptance:

- resistor, LED polarity, center-gap crossing, and rail usage are all testable;
- wrong legacy/main topology fails for the documented reason;
- manual text remains the source, coordinates remain an implementation detail.

### Slice C: Storage Preflight

Goal: document and then implement a local-first storage health check.

Constraints:

- do not expose OPFS jargon to students;
- do not claim Home Screen install prevents eviction;
- keep explicit export/import.

Acceptance:

- browser capability snapshot records estimate/persisted/persist result;
- UI can degrade to "export recommended" without blocking a lesson;
- tests do not require browser-specific persistent storage grants.

## Hard No List

- No CircuitJS/Falstad vendoring or derivative implementation.
- No Wokwi cloud dependency in the classroom runtime without explicit approval.
- No new graph beside LessonOS.
- No LiveStore dependency before the first-party event contract proves itself.
- No ELAB standalone app shell inside ARDESIA.
- No LLM-generated product memory as source of truth.
- No private PDF/manual assets in git beyond already reviewed repo state.

## COV

Commands and probes used:

```bash
git -C "/Users/andreamarro/VOLUME 3/ardesia" fetch origin
gh pr list -R AndreaMarro/ardesia --state all -L 40 --json number,title,state,isDraft,baseRefName,headRefName,updatedAt,mergedAt,url
curl -sf --max-time 3 http://127.0.0.1:8788/health
ssh macmini 'curl -sS --max-time 8 http://127.0.0.1:3111/agentmemory/livez'
find "/Users/andreamarro/VOLUME 3" -maxdepth 4 -type f \( -iname '*deep*research*' -o -iname '*lessonos*sim*elabtutor*' \) -print
git worktree add /tmp/ardesia-deepresearch-20260702 -b docs/deep-research-lessonos-sim-elabtutor-20260702 origin/main
```

Observed:

- PR #16-#31 remained open during preflight; #21 and #28 already had the P1
  refresh commits pushed.
- Headroom `:8788` returned healthy.
- AgentMemory `/agentmemory/livez` through the Mini timed out at 8 seconds; no
  AgentMemory write/restart/recovery action was attempted.
- No matching deep-research report file was found in `VOLUME 3` at maxdepth 4.

Not done:

- No tests were required for this docs-only report beyond diff/check scanning.
- No PR comments were posted.
- No deploy was attempted.
- No browser automation to Gemini/ChatGPT was attempted.
