# ARDESIA Mandate Addendum - 2026-07-11

Status: IMMUTABLE BASELINE

This file records Andrea's clarifications after the original frozen mandate.
Requirements and supplied-source URLs are append-only. Corrections require an
explicit Andrea decision recorded separately; they are never silent deletions.

## Requirements

- Work with maximum speed as a product designer: optimize user outcome,
  integration leverage, quality and low technical debt, not code volume.
- Search local work, Git history, all supplied links and additional current
  sources. Prefer mature compatible open source/open licensed material. Build
  from zero only after a recorded `ADOPT/ADAPT/BUILD` decision.
- Preserve good existing work. A replacement needs before/after evidence,
  migration and rollback.
- Research must happen and end in an implementation decision; link lists alone
  are not progress.
- Miro, Goodnotes, Notability, Jamboard, Mixboard and Tinkercad are functional
  references. Henri Matisse, Alexander Calder and Keith Haring are abstract
  artistic references; derive an original ARDESIA language, never copy works.
- Plugin architecture follows an object model: identity, encapsulated state,
  commands, queries, events, capabilities, lifecycle, factory and composition.
- Every plugin is always a post-it/Knowledge Card. A plugin is never a separate
  product page or route. Expansion remains the same post-it instance.
- Tinkercad parity means the complete equivalent circuit experience inside a
  Simulation Plugin post-it, not an iframe, screenshot or separate simulator.
- ARDESIA includes both an ordered page-based notebook and an infinite
  whiteboard. The same plugin instance can be referenced in both.
- Every plugin is connected to LessonOS. Durable semantic changes and lifecycle
  transitions emit typed, ordered, replayable events with provenance.
- LessonOS is a first-class event/projection backbone. It powers timeline,
  knowledge graph, notes/evidence index, analytics and grounded generation.
- Knowledge Explorer is a shell page with a multi-level navigable graph of
  knowledge and notes for one lesson, selected lessons or a course.
- Charts and generated content derive from selected graph scopes and retain
  graph/event/source provenance.
- Audio, transcripts, materials, notes and artifacts are collected in an
  orderly Library and linked to graph, lesson and original source.
- The app is local-first and complete offline. A user may choose local storage
  or Google Drive through the same portable storage contract.
- ARDESIA and its plugins connect to external apps through governed connector
  capabilities, explicit consent/scopes, provenance, revocation and offline
  degradation.
- External targets explicitly include ChatGPT Apps, custom GPTs and Claude
  Team/Enterprise connectors. They consume governed ARDESIA MCP/OpenAPI
  capabilities and never bypass post-it, LessonOS, role or privacy contracts.
- ARDESIA must spread into other software through reusable embed/capability
  surfaces (web, LMS/LTI, MCP, OpenAPI), while keeping one domain model.
- Teachers may author or generate, approve, publish and sell educational
  content. Teacher/Creator Network and Marketplace provide profile, portfolio,
  social discovery, subscription and visibility based on transparent quality,
  sales and reputation signals.
- Students cannot generate or publish educational material. They receive
  complete, well-written, teacher-approved summaries and can navigate their
  private knowledge graph, practise, simulate, answer and annotate.
- Every user may create no-code or technical plugins. Every legally eligible
  creator may choose free, open-source or monetized distribution; minors require
  a guardian/school seller arrangement.
- Tinkercad parity in the Simulation Plugin is the capability foundation for
  attaching the ElabTutor Plugin. Use the real first-party GitHub repository
  `AndreaMarro/elab-tutor` as a harvest source; do not duplicate its shell,
  auth, secrets/config or protected corpus.
- ElabTutor and Simulation remain separate plugin-post-it instances. They can
  link/dock through public capabilities and detach without losing state.
- A separate Arduino Toolchain Plugin post-it must support Blockly and C++,
  dynamic Arduino board/core packages, cross-compile, diagnostics, physical
  upload and serial. It links to Simulation and ElabTutor through capabilities.
- For Tinkercad parity, the independent Toolchain instance docks through a
  `PluginLink` slot inside the Simulation post-it. It remains detachable with
  its own identity/state, but adjacent unrelated cards do not satisfy parity.
- "Any Arduino model" means an extensible FQBN/board-package matrix with honest
  provider support per model, not a hardcoded list or unverified universal claim.
- UI and UX must be beautiful, intuitive and distinct. Matisse, Calder and
  Haring principles remain mandatory quality lenses, not decorative notes.
- The final organization must be the simplest coherent architecture that is
  innovative, powerful, scalable and at least current with leading products.
- Assemble proven pieces behind stable adapters. Characterization, contract,
  replay, migration and browser tests must prove no regression before replacing
  existing behavior.
- Literally every explicit requirement in the frozen mandate and this addendum
  remains in the completion denominator until verified GREEN or Andrea changes
  it explicitly.

## Supplied Source URL Baseline

### Directly supplied in conversation

- https://github.com/headroomlabs-ai/headroom
- https://github.com/JuliusBrussee/caveman

### Included in the frozen mandate

- https://github.com/cobusgreyling/loop-engineering
- https://addyosmani.com/blog/loop-engineering/
- https://www.langchain.com/blog/the-art-of-loop-engineering
- https://code.claude.com/docs/
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/skills
- https://github.com/Graphify-Labs/graphify
- https://github.com/safishamsi/graphify
- https://github.com/colbymchenry/codegraph
- https://github.com/Lum1104/Understand-Anything
- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- https://github.com/karpathy/autoresearch
- https://github.com/laramohan/wikillm
- https://github.com/LearningCircuit/local-deep-research
- https://github.com/Imbad0202/academic-research-skills
- https://github.com/rohitg00/agentmemory
- https://github.com/Tencent/TencentDB-Agent-Memory
- https://github.com/TencentCloud/TencentDB-Agent-Memory
- https://github.com/supermemoryai/supermemory
- https://github.com/mem0ai/mem0
- https://mem0.ai/
- https://github.com/multica-ai/andrej-karpathy-skills
- https://github.com/multica-ai/andrej-karpathy-skills/blob/main/.cursor/rules/karpathy-guidelines.mdc
- https://github.com/ComposioHQ/awesome-claude-skills
- https://github.com/mattpocock/skills
- https://github.com/revfactory/harness
- https://hermes-agent.nousresearch.com/docs/guides/tips
- https://github.com/ByteByteGoHq/system-design-101
- https://github.com/nilbuild/developer-roadmap
- https://github.com/bradtraversy/design-resources-for-developers
- https://github.com/collections/javascript-game-engines
- https://github.com/collections/design-essentials
- https://github.com/collections/pixel-art-tools
- https://github.com/search?q=circuit%20solver&type=repositories
- https://github.com/search?q=breadboard&type=repositories
- https://github.com/search?q=whiteboard&type=repositories
- https://github.com/search?q=arduino%20compiler&type=repositories
- https://github.com/search?q=agent&type=repositories
- https://github.com/search?q=wiki+llm&type=repositories
