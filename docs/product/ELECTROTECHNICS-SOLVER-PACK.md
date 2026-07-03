# ELECTROTECHNICS SOLVER PACK

Date: 2026-07-01  
Status: product canon draft, implementation target  
Scope: ARDESIA Pack above Simulation Plugin, LessonOS graph, FastAPI gateway, future ChatGPT/MCP surface.

## One-line Definition

Electrotechnics Solver Pack turns a confirmed circuit scene into a human-style electrotechnics solution: objective, method choice, checked steps, circuit drawings, LaTeX/PDF export, and LessonOS graph sedimentation.

Working product names:

- ARDESIA Circuit Tutor;
- ElettroSolve;
- Electrotechnics Solver Pack.

## Honest Verdict

The idea is not stupid. It is a strong wedge because current LLM-only answers are weak exactly where electrotechnics tutoring needs rigor: diagram parsing, method choice, equivalent transformations, sign conventions, and step-by-step drawings.

The unsafe claim is "upload any photo/PDF and get a correct full solution". That should not be P0. The reliable P0 is:

```text
confirmed CircuitScene/netlist
-> user chooses target
-> user chooses or approves method
-> symbolic/numeric solve
-> verified human-style derivation
-> LaTeX/PDF export
-> LessonOS graph event
```

Image/PDF ingestion is valuable but must be treated as a candidate generator followed by user confirmation, never as an oracle.

## Verified Local Inputs

- ARDESIA product canon defines plugins and packs as durable objects on a local-first board.
- Simulation Plugin and ELAB Pack are already the intended foundation for circuit work.
- `docs/ELAB-SCENE-FORGE-CANON.md` says the first robust scene path is hand-authored or confirmed scene, not blind computer vision.
- `docs/product/UI-UX-DESIGN-DIRECTION.md` already defines the Solver Pack MVP as confirmed circuit/netlist -> target -> method -> solve -> PDF/LaTeX -> LessonOS graph.
- `docs/ops/FASTAPI-CHATGPT-MCP-GATEWAY.md` already reserves `electrotechnics.solve_preview` and `render.solver_steps` as future gateway tools.

## External Research Snapshot

Primary or near-primary sources reviewed:

- CircuitVision: image of circuit -> SPICE-compatible netlist, using YOLO/SAM/Gemini-style value extraction. Source: https://github.com/JKc66/CircuitVision
- Circuit Schematic Image Interpreter: Python package for segmenting circuit diagrams into components, junctions, wires, graph, equations, and SPICE netlists. Source: https://github.com/C-R-Kelly/CircuitSchematicImageInterpreter
- SINA paper: schematic image -> SPICE netlist with YOLOv11, connectivity inference, OCR, and VLM assignment. Source: https://arxiv.org/abs/2601.22114
- Lcapy: Python symbolic linear circuit analysis on netlists, based on SymPy. Source: https://github.com/mph-/lcapy
- Lcapy schematics: netlist -> Circuitikz/LaTeX schematic generation. Source: https://lcapy.readthedocs.io/en/latest/schematics.html
- CircuiTikZ: LaTeX package for drawing electrical/electronic networks. Source: https://github.com/circuitikz/circuitikz and https://ctan.org/pkg/circuitikz
- Schemdraw: Python schematic drawing library, useful as a possible diagram renderer/reference. Source: https://github.com/cdelker/schemdraw
- AITEE: agentic tutor for electrical engineering that combines circuit reconstruction, retrieval, SPICE-style verification, and tutoring flow. Source: https://arxiv.org/abs/2505.21582

Interpretation: the ecosystem has useful building blocks, but no source reviewed proves a production-grade tutor that reliably handles arbitrary student photos, chooses the didactic method, verifies each step, and emits a complete human-style solution PDF.

## Product Workflow

```text
photo/PDF/board/netlist
-> candidate CircuitScene
-> confidence report
-> user confirmation/correction
-> target selection
-> method selection
-> solver plan
-> verified derivation
-> diagram rendering
-> PDF/LaTeX export
-> save to LessonOS graph
```

### Input Tiers

| Tier | Input | P0? | Reliability Position |
|---|---|---:|---|
| T0 | Manual netlist or ARDESIA `CircuitScene` | yes | best first slice |
| T1 | Clean PDF schematic | later | plausible with parser + confirmation |
| T2 | Photo of printed schematic | later | candidate-only |
| T3 | Hand-drawn/photo of board/lavagna | later | hard, needs UI correction |
| T4 | Arbitrary textbook exercise with missing values/context | no | requires human completion |

## CircuitScene Contract

The pack should not invent a parallel circuit model. It should consume a confirmed scene compatible with the Simulation Plugin lineage.

Minimum fields:

```json
{
  "schemaVersion": "circuit-scene/2",
  "domain": "electrotechnics",
  "components": [
    {
      "id": "R1",
      "kind": "resistor",
      "value": {"magnitude": 1000, "unit": "ohm"},
      "nodes": ["n1", "n2"]
    }
  ],
  "sources": [],
  "probes": [],
  "netlist": "",
  "provenance": {
    "status": "candidate",
    "origin": "manual|board|pdf|image",
    "checks": {
      "electrical": "unknown",
      "geometry": "unknown",
      "humanConfirmed": false
    }
  }
}
```

Rules:

- `candidate` scenes can be previewed but not used for final solutions.
- final solutions require `humanConfirmed: true`.
- parser confidence must be visible to the user.
- unknown values or ambiguous nodes must stop the flow and ask a question.

## Methods To Support

P0 methods:

- nodal analysis for DC linear resistive circuits;
- mesh analysis for planar DC linear circuits;
- equivalent resistance by series/parallel reductions where structurally obvious;
- Thevenin equivalent at a selected port;
- Norton equivalent at a selected port;
- superposition for independent sources;
- source transformation;
- Millman where topology is suitable;
- test source method for equivalent resistance with dependent sources deferred until supported.

Later:

- AC phasors;
- transients with first-order RC/RL;
- dependent sources;
- operational amplifiers;
- nonlinear components;
- symbolic parameter sweeps.

## Solver Architecture

```text
CircuitScene
  -> normalizer
  -> topology classifier
  -> method planner
  -> symbolic/numeric solver
  -> verifier
  -> step renderer
  -> PDF/LaTeX exporter
  -> LessonOS graph writer
```

Recommended engines:

- Lcapy/SymPy for symbolic linear analysis.
- SPICE/ngspice/PySpice only as a numeric verifier, not as the explanation engine.
- CircuiTikZ, Schemdraw, or Lcapy schematic export for diagrams.
- Vision-to-netlist repos only behind a candidate scene review UI.

## Explanation Standard

The pack must solve like a human tutor, not like a black-box simulator.

Each solution should contain:

- knowns and requested quantity;
- circuit redrawing when it helps;
- method rationale;
- sign convention;
- equations;
- algebra steps;
- substitutions with units;
- final result with sanity check;
- optional alternate method comparison;
- common mistakes detected.
- student and teacher export variants when the solution becomes a pack.

Bad output:

- only final numeric answer;
- method chosen without justification;
- unexplained SPICE output;
- diagram omitted when transformation is central;
- hallucinated component values or node names.

## Ardesia Integration

Surfaces:

- board object: placed on the lavagna as a solver artifact;
- plugin detail: target/method/steps controls;
- export: LaTeX/PDF plus student-pack section;
- graph: concept, method, circuit pattern, mistake, and solved-example nodes.
- standalone mini web app: upload -> confirmed scene -> solution PDF, for faster market validation.

Gateway tools, matching existing gateway draft:

- `electrotechnics.solve_preview`
- `simulation.scene.validate`
- `render.solver_steps`
- later `student_pack.export`

The pack must not own auth, dashboard, memory, or report infrastructure. Those belong to ARDESIA Core.

## Business Assessment

Strong points:

- real pain for tutors and students;
- differentiated if it produces complete didactic derivations and diagrams;
- natural fit for Andrea's electrotechnics expertise;
- valuable as paid specialist pack, not generic chat.

Weak points:

- arbitrary image parsing is the hardest and least reliable part;
- high trust burden because wrong solutions damage learning;
- needs curated exercise/method corpus and many regression cases;
- copyright-safe corpus building requires discipline;
- competition exists in circuit solving and AI homework tools.

Commercially plausible wedge:

1. tutor/internal tool for Andrea's real lessons;
2. student-facing paid pack for DC electrotechnics;
3. expansion to AC/transients only after measured accuracy.

Recommended strategy: one engine, two surfaces.

- ARDESIA plugin/pack for the durable product, graph, board, student-pack, and marketplace.
- Standalone narrow web app for early demand testing and simpler onboarding.

## Legal/Product Risk

Do:

- use user-owned or licensed materials;
- store source provenance;
- generate original explanations;
- cite materials only when rights and source allow it;
- separate "practice/tutor support" from official school output.

Do not:

- ingest pirated textbooks into a shared commercial corpus;
- copy solved-example wording or diagrams without rights;
- claim official endorsement by schools/professors;
- output unverified final solutions from ambiguous images.

## MVP

MVP-0, 1-2 weeks if the monorepo/gate is healthy:

- define a tiny `CircuitScene` fixture for DC resistive circuits;
- implement validation for missing values, disconnected nodes, ambiguous targets;
- implement one Thevenin solve and one nodal solve path;
- render a Markdown/LaTeX solution string;
- add tests with known textbook-like circuits;
- no image parsing.

MVP-1, 3-5 weeks:

- add Norton, superposition, source transform, Millman;
- add PDF generation;
- add board object preview;
- add LessonOS graph event;
- create 20 verified fixture circuits.

MVP-2, 6-10 weeks:

- clean PDF/image candidate extraction with correction UI;
- numeric verifier;
- student-pack export;
- gateway tool preview.

## Claims Not Proven

- That arbitrary student photos can be parsed with production reliability.
- That available image-to-netlist repos generalize to Andrea's materials.
- That Lcapy covers every target method exactly as taught by Italian electrotechnics tutors.
- That PDF export will compile in the final ARDESIA runtime without TeX packaging work.
- That students will pay before a measured demo exists.
- That AITEE-style research results transfer directly to ARDESIA's corpus and UI.

## First Implementation Slice

Build a solver preview over confirmed structured input:

```text
fixture CircuitScene
-> validate
-> solve Thevenin equivalent at selected port
-> render step list
-> export LaTeX snippet
-> tests
```

Acceptance:

- no vision;
- no external LLM required;
- deterministic output;
- at least two golden circuits;
- numerical verifier agrees with derivation;
- all solution steps include units and sign convention.

## COV

- Local docs read: `PRODUCT-CANON.md`, `PLUGIN-MARKETPLACE-CANON.md`, `ELAB-AS-PLUGIN-CANON.md`, `ELAB-SCENE-FORGE-CANON.md`, `UI-UX-DESIGN-DIRECTION.md`, `FASTAPI-CHATGPT-MCP-GATEWAY.md`.
- External sources listed above.
- This document is a target and design canon, not an implementation claim.
- No production deploy, no gate change, no code scaffold in this file.
