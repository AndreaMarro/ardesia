# ARDESIA Reuse and Inspiration Register

Status: ACTIVE - RESEARCH IS A DELIVERY GATE
Date: 2026-07-11
Owner: A0 with the owner of the imminent subsystem

## 1. Purpose

This register turns external research into product decisions. A URL is not
progress by itself. Each source must end as `ADOPT`, `ADAPT`, `REFERENCE`,
`REJECT` or `BLOCKED`, with a reason and a next implementation/test boundary.

Rules:

- inspect local code and Git history before external research;
- timebox one decision to 20 minutes and compare at most three candidates;
- prefer mature open source/open licensed material when total cost is lower;
- never replace working code without measured benefit and rollback;
- copy code/assets only under a compatible license with SHA and attribution;
- product sites and artists inform behavior/principles, never cloned identity;
- every plugin is an object-like post-it, never a separate product page;
- ARDESIA keeps both an ordered notebook and an infinite whiteboard;
- every durable plugin mutation is connected to LessonOS.

## 2. Sources supplied by Andrea

All sources below are in the mandatory denominator. Group status is initial
triage, not proof that a library is safe to ship.

The immutable supplied-source inventory lives in
`ARDESIA-MANDATE-ADDENDUM-20260711.md` and is append-only. This register may
change decisions and add discovered sources, but may not shrink that inventory.

### Execution and loop engineering

Status: `REFERENCE`. Use only when a measured execution bottleneck exists;
these sources must not delay product slices.

- https://github.com/cobusgreyling/loop-engineering
- https://addyosmani.com/blog/loop-engineering/
- https://www.langchain.com/blog/the-art-of-loop-engineering
- https://code.claude.com/docs/
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/skills
- https://github.com/headroomlabs-ai/headroom
- https://github.com/JuliusBrussee/caveman
- https://github.com/gsd-build/get-shit-done
- https://github.com/bmad-code-org/BMAD-METHOD

Initial decision: Headroom remains an isolated measured pilot; Caveman is an
output-compression reference; GSD/BMAD patterns may be absorbed selectively.
None is a product dependency.

### Graph and code understanding

Status: `REFERENCE`, with Graphify read-only when it changes an imminent
architecture decision. Resolve the two Graphify repositories before use.

- https://github.com/Graphify-Labs/graphify
- https://github.com/safishamsi/graphify
- https://github.com/colbymchenry/codegraph
- https://github.com/Lum1104/Understand-Anything

### Knowledge and research

Status: `QUEUED-M4/M5`. Compare only against the existing ARDESIA retrieval
and research path; do not add a framework merely because it is listed.

- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- https://github.com/karpathy/autoresearch
- https://github.com/laramohan/wikillm
- https://github.com/LearningCircuit/local-deep-research
- https://github.com/Imbad0202/academic-research-skills

### Memory

Status: `QUEUED-M4/M5`. Benchmark privacy, local-first behavior, provenance,
delete/export and operational cost before adoption.

- https://github.com/rohitg00/agentmemory
- https://github.com/Tencent/TencentDB-Agent-Memory
- https://github.com/TencentCloud/TencentDB-Agent-Memory
- https://github.com/supermemoryai/supermemory
- https://github.com/mem0ai/mem0
- https://mem0.ai/

### Skills and agent engineering

Status: `REFERENCE`. Harvest a small proven pattern only when it removes a
measured failure; never import a full agent framework onto the critical path.

- https://github.com/multica-ai/andrej-karpathy-skills
- https://github.com/multica-ai/andrej-karpathy-skills/blob/main/.cursor/rules/karpathy-guidelines.mdc
- https://github.com/ComposioHQ/awesome-claude-skills
- https://github.com/mattpocock/skills
- https://github.com/revfactory/harness
- https://hermes-agent.nousresearch.com/docs/guides/tips

### System design and resource indexes

Status: `REFERENCE`. These are indexes, not dependencies or architecture
authority. Use them to produce a shortlist for a specific blocker.

- https://github.com/ByteByteGoHq/system-design-101
- https://github.com/nilbuild/developer-roadmap
- https://github.com/bradtraversy/design-resources-for-developers
- https://github.com/collections/javascript-game-engines
- https://github.com/collections/design-essentials
- https://github.com/collections/pixel-art-tools

### Search seeds supplied by Andrea

Status: `QUERY-SEED`. Re-run with the missing capability and current date;
search results are not reusable evidence by themselves.

- https://github.com/search?q=circuit%20solver&type=repositories
- https://github.com/search?q=breadboard&type=repositories
- https://github.com/search?q=whiteboard&type=repositories
- https://github.com/search?q=arduino%20compiler&type=repositories
- https://github.com/search?q=agent&type=repositories
- https://github.com/search?q=wiki+llm&type=repositories

## 3. Product and interaction references

| Source | What ARDESIA should learn | What not to copy |
|---|---|---|
| https://miro.com/online-whiteboard/ | spatial organization, contextual actions, navigation on a large board | brand, layout skin, collaboration claims not yet implemented |
| https://www.figma.com/figjam/ | post-it immediacy, connectors, low-friction creation, widgets as shared interactive objects | visual identity and proprietary implementation |
| https://developers.figma.com/docs/widgets/figma-figjam-widgets/ | plugin-as-object: instance on canvas, declared editor context, user interaction and external data boundary | API or package coupling to Figma |
| https://www.goodnotes.com/ | Pencil-first writing, lasso, notebook hierarchy, low-chrome focus mode | icons, page composition and brand |
| https://notability.com/ | note/audio relationship, timeline and recovery of classroom context | proprietary assets and exact workflow |
| https://jamboard.google.com/ | historical reference for immediate classroom whiteboarding and minimal tool count | discontinued platform assumptions |
| https://mixboard.google.com/ | historical reference for loose visual composition and media grouping | unavailable product behavior or assets |
| https://milanote.com/ | heterogeneous cards, moodboard grouping and readable spatial hierarchy | marketing composition and visual skin |
| https://www.tinkercad.com/circuits | parity denominator for circuit manipulation, instruments, code and simulation feedback | Autodesk UI/brand/code; never iframe it as parity |
| https://wokwi.com/ | immediate electronics feedback, component discoverability and code/simulation loop | hosted-service dependency as the only runtime |
| https://phet.colorado.edu/ | direct manipulation, visible causality, minimal chrome and research-based educational simulation | unrelated simulation architecture wholesale |
| https://scratch.mit.edu/ | object mental model, progressive disclosure, immediate execution and remixability | child-oriented visual language |
| https://linear.app/ | speed, keyboard flow, calm density and clear state transitions | app-shell aesthetics unrelated to teaching |
| https://www.figma.com/ | contextual properties, reusable components and predictable selection model | design-editor complexity in the resting UI |
| https://logseq.com/ | linked notes, local knowledge, local/global graph and fast return from node to note | AGPL code and knowledge-worker density without review |
| https://obsidian.md/ | local graph depth, backlinks and note/graph side-by-side navigation | proprietary implementation and plugin marketplace assumptions |
| https://www.superprof.com/tutor/ | rapid teacher profile, subject discovery, reputation and review-driven visibility | tutoring-service economics and pay-to-rank opacity |
| https://www.teacherspayteachers.com/ | teacher-authored resource storefronts, seller membership and educational discovery | payout terms, quality gaps and marketplace visual identity |

## 4. Artistic research

The sources are research references only. Do not reproduce images, signature
motifs, characters or compositions.

| Source | Abstract principle for ARDESIA |
|---|---|
| https://www.moma.org/artists/3832-henri-matisse | cut-out economy, strong fields, rhythm and legibility |
| https://calder.org/ | balance, kinetic relationships, light spatial hierarchy and explanatory motion |
| https://www.haring.com/ | immediate mark, energy, inclusion and distance legibility |

The synthesis is original: graphite/neutral base, functional coral/blue/yellow/
green, friendly geometry, few lively elements, touch-first affordances and
motion only when it explains state or connection.

## 5. Additional technical candidates researched

Repository metadata and licenses were checked on 2026-07-11. A candidate is
not permission to add a dependency; local fit and the repository dependency
gate still apply.

| Candidate | License observed | Decision | Intended use |
|---|---|---|---|
| https://github.com/excalidraw/excalidraw | MIT | `ADOPTED` | keep the existing ARDESIA canvas dependency; reuse its open format, undo/redo, zoom/pan and local-first behavior |
| https://github.com/cytoscape/cytoscape.js | MIT | `ADOPTED` | keep the existing graph dependency; do not add a second graph renderer |
| https://github.com/tldraw/tldraw | custom production license | `REFERENCE` | study runtime canvas APIs and embeds; do not adopt while Excalidraw fits and license cost is unjustified |
| https://github.com/wokwi/wokwi-elements | MIT | `ADAPT-CANDIDATE` | evaluate individual electronics web components/assets behind ARDESIA scene adapters |
| https://github.com/pfalstad/circuitjs1 | GPL-2.0 | `LEGAL-REVIEW` | solver/diagnostic reference; no code absorption without compatibility decision |
| https://github.com/fritzing/fritzing-app | license requires manual verification | `REFERENCE` | breadboard affordances and documentation workflow; do not copy assets blindly |
| https://github.com/arduino/arduino-cli | GPL-3.0 | `ADAPTER-CANDIDATE` | isolated compile service boundary, never bundled into the browser without review |
| https://github.com/RaspberryPiFoundation/blockly | Apache-2.0 | `ADAPT-M6A` | existing ELABTutor dependency; retain visual editor and adapt Arduino AST/generators |
| https://github.com/microsoft/monaco-editor | MIT | `CANDIDATE-M7` | Arduino/code editor only if current editor cannot meet parity |
| https://github.com/xtermjs/xterm.js | MIT | `CANDIDATE-M7` | serial monitor rendering behind a typed serial capability |
| https://github.com/yjs/yjs | verify license file before adoption | `CANDIDATE-PILOT` | collaboration/sync only after local LessonOS is stable |
| https://github.com/endojs/endo | Apache-2.0 | `CANDIDATE-M6` | capability sandbox reference for untrusted plugins |
| https://github.com/facebook/lexical | MIT | `CANDIDATE` | rich card content only if existing editor fails measured requirements |
| https://github.com/xyflow/xyflow | MIT | `REJECT-FOR-NOW` | useful node UI reference, but Cytoscape already exists |
| https://github.com/dexie/Dexie.js | Apache-2.0 | `REFERENCE` | IndexedDB migrations only if existing persistence lacks the required contract |
| https://github.com/phetsims/scenery | MIT | `REFERENCE` | accessibility and scene-graph research, not a second rendering core |
| https://github.com/logseq/logseq | AGPL-3.0 | `REFERENCE` | graph/note navigation patterns only; no code absorption without legal review |
| https://github.com/apache/echarts | Apache-2.0 | `REJECT-FOR-NOW` | broad chart reference, but existing D3/Cytoscape should be reused first |
| https://github.com/microsoft/graphrag | MIT | `REFERENCE-M4` | study grounded subgraph/provenance patterns; do not adopt its expensive indexing pipeline by default |
| https://github.com/AndreaMarro/elab-tutor | private first-party, no declared license | `HARVEST-M3/M7` | source `main@732ff077`: extract tutor/simulator/assets/tests behind ARDESIA contracts; exclude shell/auth/config/protected corpus |
| https://github.com/medusajs/medusa | MIT | `CANDIDATE-M8` | compare marketplace primitives before building catalog/order logic |
| https://github.com/saleor/saleor | BSD-3-Clause | `CANDIDATE-M8` | compare mature digital catalog/order architecture and operational cost |
| https://github.com/mastodon/mastodon | AGPL-3.0 | `REFERENCE-M8` | social moderation/federation patterns; do not absorb code without review |
| https://github.com/discourse/discourse | GPL-2.0 | `REFERENCE-M8` | trust, moderation and community workflow patterns only |

Architecture references:

- https://code.visualstudio.com/api - manifest, extension lifecycle and public
  API discipline;
- https://backstage.io/docs/overview/architecture-overview/ - extension tree
  and composition concepts;
- https://backstage.io/docs/backend-system/architecture/plugins/ - extension
  points and plugin isolation;
- https://developer.mozilla.org/en-US/docs/Web/API/Web_components - native
  object-like embeddable component boundary.

External-app standards:

- https://standards.1edtech.org/lti/specifications/core/lti-spec1p3p1 - LMS
  launch/content integration using the current LTI security model;
- https://github.com/adlnet/xAPI-Spec - portable learning activity statements;
- https://modelcontextprotocol.io/specification/draft/server/tools - AI tool
  capability boundary;
- https://github.com/modelcontextprotocol/ext-apps - interactive external app
  views as a reference, never a bypass around ARDESIA post-it contracts;
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth -
  least-privilege Drive scopes such as per-file access.
- https://developers.openai.com/ - ChatGPT Apps SDK over MCP;
- https://help.openai.com/en/articles/9442513-gpt-actions-domain-settings-chatgpt-enterprise -
  custom GPT OpenAPI actions, OAuth and workspace domain restrictions;
- https://docs.anthropic.com/en/docs/mcp - MCP across Anthropic products;
- https://support.anthropic.com/en/articles/11175166-about-custom-integrations-using-remote-mcp -
  Claude Team/Enterprise remote MCP connectors and per-user enablement;
- https://docs.stripe.com/connect - marketplace onboarding, split payments,
  payouts, disputes and tax boundaries; sandbox and legal review first;
- https://www.w3.org/TR/activitypub/ - optional social federation reference;
- https://creativecommons.org/share-your-work/cclicenses/ - explicit content
  licensing choices; not a substitute for ownership verification.

## 6. Plugin-as-post-it object model

Use this mental model for every plugin:

```text
PluginDefinition (class/contract)
  -> PluginFactory.create(config)
  -> PluginInstance {
       id, type, version, state,
       commands, queries, events,
       provides, requires, lifecycle, view
     }
  -> PostItFrame { pluginInstanceId, position, size, collapsed }
```

ToolHost is the registry/runtime. A post-it is the only product surface for a
plugin. Expand is an overlay of the same object; close, reopen, duplicate,
export and uninstall invoke lifecycle methods. Plugin-to-plugin behavior uses
capabilities and events. Composition is preferred over inheritance; direct
internal imports and hidden shared state are forbidden.

`PluginLink` represents provider/consumer composition. The required reference
composition is `ElabTutorPlugin -> SimulationPlugin`: two post-it instances
that can dock visually while retaining separate identity/state. Simulation
provides scene, typed commands, diagnostics and events; ElabTutor consumes them
to observe, explain and act, with every operation audited by LessonOS.

The second composition is
`ElabTutorPlugin -> ArduinoToolchainPlugin <-> SimulationPlugin`. Harvest only
the useful first-party seams from ELABTutor: `features/elabArduinoAst`, Blockly/
CodeMirror editors, board/FQBN catalog, compile agent detection, upload facade,
serial monitor/plotter and tests. Existing upload code openly contains stubs or
partial protocols (including board-specific paths); each must stay RED until a
real provider/hardware proof exists.

When docked for Tinkercad parity, Toolchain renders through a declared slot in
the Simulation post-it while retaining a separate instance and detach path.
Core/library indexes are executable supply chain: allowlist, integrity hash,
license, sandbox limits, no host secrets/network and remote-source consent are
mandatory before adoption.

Toolchain primary sources:

- https://docs.arduino.cc/arduino-cli/ - dynamic board/core/library, FQBN,
  compile, upload and monitor source of truth;
- https://github.com/arduino/arduino-cli - GPL-3.0 process/service adapter;
- https://developers.google.com/blockly - visual programming concepts and API;
- https://github.com/RaspberryPiFoundation/blockly - current Apache-2.0 source;
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API - limited,
  secure-context browser capability, never assumed universal;
- https://cloud.arduino.cc/download-agent/ - official desktop bridge reference.

The post-it can be placed on a notebook page or the infinite whiteboard. Those
placements reference the same `PluginInstance`; they do not fork state. Every
semantic command and lifecycle transition emits a typed LessonOS event with
lesson/instance identity, ordering, causation and provenance. Rendering frames
and intermediate pointer moves are not domain events.

## 7. LessonOS and Knowledge Explorer model

LessonOS is the event backbone. From one append-only log it builds disposable,
versioned projections:

```text
events -> lesson timeline
       -> knowledge graph
       -> notes/evidence index
       -> analytics datasets
       -> grounded generation context
```

The shell-level Knowledge Explorer supports scopes `single lesson`, `selected
lessons`, `course`. Navigation must preserve this chain:

```text
course -> lesson set -> lesson -> concept -> note/evidence
       -> source event -> source document or plugin-post-it
```

Charts use versioned queries over real projections and always drill back to
the supporting nodes/events. Generated notes, quizzes, exercises, outlines and
exports use a selected subgraph and retain graph IDs, source IDs, lesson scope,
generator/version and citations. Cytoscape and existing D3 are the default;
adding another graph/chart library requires a demonstrated missing capability.

Connector adapters expose external apps through capabilities with explicit
scope, consent, sync state, provenance, disconnect and delete. External data
becomes a LessonOS event/source; it never creates a hidden second lesson store.

Storage adapters follow the same rule. Local is complete and default; Drive is
optional. Audio, materials, notes, transcripts and generated artifacts use one
portable asset model with content hashes, revisions, graph links and source
provenance. Evaluate existing IndexedDB code and Dexie before new persistence;
use Drive per-file scopes and resumable uploads rather than broad account
access. Graph and Library are two projections over the same assets.

## 8. Teacher Network and Marketplace model

Research references:

- Superprof: fast profile creation, subject taxonomy, reviews and visibility;
- Teachers Pay Teachers: teacher-authored digital resource marketplace,
  seller membership and payout differentiation;
- Stripe Connect: connected seller onboarding, split funds, payout, dispute,
  risk and tax primitives;
- ActivityPub: optional future social interoperability;
- Creative Commons: explicit reusable content licenses.

ARDESIA must improve on the references: distinguish organic and sponsored
discovery, explain ranking signals, give cold-start exposure, verify purchases
before reviews, preserve content/AI provenance and make moderation/takedown
operational. Paid subscriptions may buy tools, analytics and clearly labelled
sponsorship; they may not buy an undisclosed quality score.

The catalog has two explicit product contracts:

- `ContentArtifact`: human-authored or generated educational material;
  generation/publication is teacher-only;
- `PluginPackage`: no-code or technical plugin; creation is open to every user
  and monetization to every legally eligible creator/seller.

Both carry author, version, provenance, license, accessibility, preview, price
and update policy. Plugins additionally declare permissions, capabilities,
dependencies, commercial rights and compatibility; after purchase they install
only as post-its. Marketplace adoption must compare Medusa and Saleor before
custom catalog/order code; money movement must use a marketplace provider such
as Stripe Connect rather than a homemade payout ledger. Minors require a
guardian/school-managed seller and payout policy.

## 9. Per-slice research output

Before writing a subsystem, append one compact decision:

```text
Need:
Local reuse found:
Sources compared (max 3):
License/security:
Decision: ADOPT | ADAPT | BUILD
Why:
Integration boundary:
Immediate proof:
Rollback:
```

Research is complete only when the decision enters code and a test or browser
proof. Otherwise it remains `REFERENCE`, not progress.
