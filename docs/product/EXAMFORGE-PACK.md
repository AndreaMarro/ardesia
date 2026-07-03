# EXAMFORGE PACK

Date: 2026-07-01  
Status: product canon draft, implementation target  
Scope: ARDESIA Pack for generating practice exams and complete solution packs from verified materials and constraints.

## One-line Definition

ExamForge creates new practice exams that match a course's structure, difficulty, and typography constraints without copying past exams or impersonating a teacher, and exports both exam PDF and full solution pack.

Canonical filename: `EXAMFORGE-PACK.md`. Some prompts may write `EXAM-FORGE-PACK.md`; treat that as the same product, not a second pack.

## Honest Verdict

This is feasible and commercially interesting, but it has a sharper legal/product boundary than the Electrotechnics Solver Pack.

The useful product is not "clone professor X's exam". The useful product is:

```text
past exams + syllabus + constraints
-> style/difficulty blueprint
-> new original exercises
-> verified solutions
-> typographic template
-> PDF/student-pack
```

The dangerous product is:

```text
copy layout + copy logos + mimic professor identity + regenerate near-duplicates
```

That should be disallowed even for adult users. Adult audience reduces some duty-of-care issues, but it does not remove copyright, impersonation, or unfair-confusion risk.

## Verified Local Inputs

- ARDESIA canon treats packs as content/method layers over Core and plugins.
- `docs/product/UI-UX-DESIGN-DIRECTION.md` defines the MVP as verified materials + program + constraints -> new exercises -> full solutions -> PDF/student-pack.
- `docs/ops/FASTAPI-CHATGPT-MCP-GATEWAY.md` reserves `examforge.generate_preview` and `render.examforge_pack`.
- LessonOS graph is the right sink for generated exercises, mistakes, prerequisite patterns, and student-pack history.

## External Research Snapshot

Primary or near-primary sources reviewed:

- `marty90/fast-exam`: randomized exams in PDF from an exercise database, using LaTeX `exam`, with solution PDF. Source: https://github.com/marty90/fast-exam
- `dbosk/examgen`: generator for the LaTeX `exam` class with course directories and reusable question files. Source: https://github.com/dbosk/examgen
- `RigiResearch/examgen`: targets paper exams and online formats such as Moodle. Source: https://github.com/RigiResearch/examgen
- `TUD-RST/examgenerator`: LaTeX problem pools, randomized values, and no repetition across groups. Source: https://github.com/TUD-RST/examgenerator
- `sample-gen`: AI-driven past exam PDF to fresh practice paper project. Source: https://github.com/saif0200/sample-gen
- R/exams: generates exams from Markdown/LaTeX/R exercises to PDF, HTML, Moodle XML, QTI, Canvas, Blackboard, OpenOlat and other targets. Source: https://www.r-exams.org/
- Moodle GIFT: plain-text question format for Moodle question-bank import/export, including multiple choice, true/false, short answer, matching, missing word, and numerical questions. Source: https://docs.moodle.org/en/GIFT_format
- py2gift: Python library for writing Moodle-compatible GIFT question banks. Source: https://github.com/manuvazquez/py2gift
- moodlequizR/moodlequiz: R tooling for randomized Moodle quizzes/XML style workflows. Sources: https://cran.r-project.org/web/packages/moodlequizR/refman/moodlequizR.html and https://github.com/numbats/moodlequiz

Interpretation: exam generation from pools is mature. AI generation from past papers exists but is less proven. The defensible ARDESIA version should combine deterministic templates, question taxonomy, verifier/solver tools, and strict anti-copy constraints.

## Product Workflow

```text
course program + past papers + constraints
-> extraction
-> anonymization and provenance report
-> style/difficulty blueprint
-> exercise generation
-> solution generation
-> verifier passes
-> typographic renderer
-> PDF/student-pack export
-> LessonOS graph update
```

## Input Contract

Accepted inputs:

- user-owned or licensed past papers;
- syllabus/program;
- topic list;
- target duration;
- allowed tools/formula sheet;
- difficulty distribution;
- requested output language;
- typographic constraints.

Required normalization:

- remove school/teacher names from generated output;
- remove logos and official marks;
- mark source documents as examples, not templates to copy;
- extract a blueprint rather than copying questions.

## Output Contract

Each generated pack should include:

- exam PDF;
- solutions PDF;
- teacher version;
- student version;
- grading/rubric grid;
- machine-readable exercise JSON;
- topic/difficulty map;
- provenance report;
- "generated practice material" label;
- source constraints used;
- verifier status.
- Moodle GIFT, Moodle XML, QTI, or LMS export when supported.

The output should not include:

- original teacher name unless user explicitly owns that identity and context;
- school logos or official-looking seals;
- copied question text;
- identical layout when it risks confusion with an official exam;
- answer keys without derivations for technical subjects.

## Style Profile

ExamForge should extract:

- page size and margins;
- heading hierarchy;
- point allocation style;
- number of exercises;
- subquestion structure;
- topic mix;
- difficulty curve;
- wording style;
- figure/table frequency;
- time expectation;
- solution depth.

It should not extract:

- teacher identity as a persona;
- exact official branding;
- unique phrasing as a copy target.

## Generation Architecture

```text
Source documents
  -> parser/OCR
  -> anonymizer
  -> style profile
  -> topic/difficulty blueprint
  -> exercise generator
  -> domain solver/verifier
  -> LaTeX/PDF renderer
  -> student-pack writer
  -> graph writer
```

Tools:

- LaTeX `exam` class for stable exam PDFs.
- Existing exam generators as design references, not necessarily dependencies.
- R/exams as a strong reference for multi-target exam export.
- Moodle GIFT/XML as practical LMS export targets.
- Subject-specific solvers for verified solutions.
- For electrotechnics exams, call Electrotechnics Solver Pack.
- For math/physics later, use matching solver/verifier packs.

## Ardesia Integration

Pack surfaces:

- board object: exam blueprint and generated exercise tiles;
- plugin detail: constraints, topic mix, seed, difficulty, output language;
- export: exam PDF + solution PDF + student-pack;
- optional LMS export: GIFT/QTI/Moodle XML;
- graph: topics, errors, solved examples, student attempts.

Gateway tools:

- `examforge.generate_preview`
- `render.examforge_pack`
- later `student_pack.export`

The pack must not own auth, billing, memory, or file storage. Those remain ARDESIA Core responsibilities.

## Multilingual Requirement

ExamForge must be natively multilingual:

- source language detection;
- output locale selection;
- typography conventions per language;
- exercise content generated in the requested language;
- solutions in the same or explicitly selected language;
- stable glossary per course.

Italian should be first-class, not a translation afterthought.

## iPad Feasibility

Feasible as an ARDESIA board workflow on iPad if heavy work runs in backend/local service:

- upload or select PDFs;
- review extracted blueprint;
- adjust sliders/toggles;
- preview exam;
- export PDF.

Not feasible as fully local on-device OCR/LLM/LaTeX in P0 without major complexity. iPad should be the control/review surface, not necessarily the compute host.

## Business Assessment

Strong points:

- clear pain: students lack enough practice exams;
- useful to tutors because it expands practice supply quickly;
- works across subjects once the blueprint/renderer core exists;
- natural student-pack upsell.

Weak points:

- quality depends on subject-specific verifiers;
- legal/product risk if marketed as exam cloning;
- teachers/schools may object if outputs are too similar;
- generic AI quiz tools already exist;
- differentiation requires complete solutions and faithful difficulty, not just question generation.

Commercially plausible wedge:

1. "practice simulation generator" for Andrea's own courses and materials;
2. electrotechnics-specific exam variants using the Solver Pack;
3. multi-subject only after verifier architecture exists.

Recommended strategy: one engine, two surfaces.

- ARDESIA plugin for graph, lavagna, student-pack, and marketplace.
- Standalone upload/generate web surface to test demand faster.

## Legal/Product Risk

Allowed product position:

- generate original practice materials inspired by a course blueprint;
- remove official identity;
- label output as practice material;
- keep provenance and source constraints visible;
- require user rights or authorization for uploaded materials.

Disallowed product position:

- clone a professor's official paper;
- reproduce school identity;
- generate near-duplicate questions;
- imply official source or likely exam leak;
- bypass copyright by superficial paraphrase.

Open legal review still needed before public launch, especially around source paper ingestion and output similarity thresholds.

## MVP

MVP-0, 1-2 weeks if the repo/gate is healthy:

- manually defined `ExamBlueprint` JSON;
- generate a LaTeX `exam` document from blueprint;
- include two electrotechnics-style exercises from structured templates;
- include full solutions;
- no OCR;
- no teacher-style cloning;
- no official branding.
- optional GIFT export from structured generated questions.

MVP-1, 3-5 weeks:

- ingest text-extracted past paper;
- derive topic/difficulty blueprint;
- generate original variants;
- solution verifier for electrotechnics exercises;
- export exam and solution PDFs.

MVP-2, 6-10 weeks:

- PDF layout profiling;
- multilingual output;
- board preview;
- student-pack and LessonOS graph writes;
- gateway preview tool.

## Claims Not Proven

- That AI-generated exams match real professor difficulty without a calibration dataset.
- That output similarity can be automatically kept below a legally comfortable threshold.
- That students will trust generated practice exams before strong solution verification exists.
- That layout extraction from arbitrary PDFs is robust enough for public P0.
- That multi-subject solutions are feasible without a pack per subject.

## First Implementation Slice

Build a renderer and schema over manual blueprint input:

```text
ExamBlueprint JSON
-> validate
-> render LaTeX exam
-> render solution section
-> deterministic snapshot test
```

Acceptance:

- no OCR;
- no professor/school identity fields;
- no copied past paper text;
- deterministic output from seed;
- supports Italian and English labels;
- produces separate exam and solution artifacts.

## COV

- Local docs read: `PRODUCT-CANON.md`, `PLUGIN-MARKETPLACE-CANON.md`, `UI-UX-DESIGN-DIRECTION.md`, `FASTAPI-CHATGPT-MCP-GATEWAY.md`.
- External sources listed above.
- This document is a target and design canon, not an implementation claim.
- No deploy, no code scaffold, no legal clearance claim.
