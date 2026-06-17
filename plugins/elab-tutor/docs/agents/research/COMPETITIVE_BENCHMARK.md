# ELAB Simulator -- Competitive Benchmark Report

**Date**: 13 February 2026
**Analyst**: AGENT-18 (Research Analyst)
**Subject**: Competitive intelligence for ELAB Simulator positioning

---

## Executive Summary

ELAB operates in a market niche that is genuinely underserved: an electronics simulator purpose-built for children aged 8-14, tightly integrated with physical textbooks, featuring a proprietary circuit board and an AI tutor. No direct competitor addresses this exact combination. The closest competitors (Tinkercad, Wokwi) target older audiences (14+), lack physical textbook integration, and offer no AI tutoring. ELAB's biggest risks are feature maturity and simulation accuracy relative to free incumbents.

---

## 1. Competitor Deep Dive

### 1.1 Tinkercad Circuits (Autodesk)

| Dimension | Detail |
|---|---|
| **Components** | ~60+ (18 inputs, 19 outputs, 19 logic gates, passives, power, breadboards, connectors) |
| **Simulation** | Mixed analog/digital, real-time. Arduino Uno, Micro:bit, ATtiny. Analog simulation is simplified -- rectifier circuits with capacitors crash the sim |
| **Target Audience** | Ages 13+ (COPPA-compliant mode for <13), beginners to intermediate hobbyists |
| **Pricing** | 100% free, no paid tiers, no hidden limits. Funded by Autodesk |
| **Classroom Features** | Virtual classrooms, class codes, Google Classroom add-on, co-teaching, safe mode for <13, ISTE/Common Core/NGSS lesson plans, 24 structured lessons |
| **Export** | PNG, EAGLE/Fusion360 board files, auto-generated schematic, BOM export |
| **Code** | Visual CodeBlocks (Scratch-like) + text-based Arduino code |
| **Key Strengths** | Zero cost, massive install base (50M+ users), Autodesk backing, 3-in-1 (3D + Circuits + Code), classroom infrastructure |
| **Key Weaknesses** | Analog simulation is poor/crashes on complex circuits; no custom parts; no AI tutoring; no physical textbook integration; locked component properties; requires internet; no Italian localization for lessons; no proprietary board support |

**ELAB Opportunities vs Tinkercad**:
- Tinkercad has NO AI tutor -- Galileo is a clear differentiator
- Tinkercad has no concept of guided experiments tied to physical books
- Tinkercad's analog simulation crashes on moderately complex circuits -- ELAB's MNA solver could be more reliable for the circuits it supports
- Tinkercad cannot simulate custom boards (like ELAB's basetta curva / NanoBreakout)
- Tinkercad's CodeBlocks are generic -- ELAB can offer curriculum-aligned scaffolded coding

---

### 1.2 Wokwi

| Dimension | Detail |
|---|---|
| **Components** | ~62 distinct parts (12 sensors, 8 inputs, 9+ LEDs/NeoPixels, 7 displays, 4 motors, 6 logic, plus passives) |
| **Simulation** | Digital-focused, excellent AVR/ESP32/STM32/RP2040 emulation. WiFi simulation. GDB debugging. SD card simulation. No true analog circuit simulation (Ohm's law, voltage dividers, etc.) |
| **Target Audience** | Intermediate to advanced makers, professional embedded developers, IoT engineers |
| **Pricing** | Free for personal use. "Wokwi Club" ~$7/month or $67/year for custom libraries, private projects, WiFi, SD binary upload. Commercial pricing separate |
| **Classroom Features** | None explicitly. VS Code + CI integration oriented toward professionals |
| **Code** | Text-only (C/C++, MicroPython, Rust). No visual/block programming |
| **Key Strengths** | Best-in-class Arduino/ESP32 emulation, Custom Chips API (C/WASM/Verilog), millions of community projects, VS Code integration, CI testing |
| **Key Weaknesses** | No visual programming for kids; no AI tutoring; no analog circuit simulation; UI assumes programming knowledge; no classroom management; Embed API requires subscription; no Italian localization |
| **Open Source**: avr8js (MIT license) and wokwi-elements (MIT) are open source. The simulator platform itself is proprietary |

**ELAB Opportunities vs Wokwi**:
- Wokwi is fundamentally a developer tool, not an educational tool for children
- ELAB already uses avr8js (same engine) -- can match Wokwi's Arduino accuracy
- Wokwi has NO analog simulation -- ELAB's CircuitSolver handles Ohm's law, voltage dividers, RC circuits, LED thresholds
- Wokwi has no guided learning path, no AI tutor, no textbook integration
- Wokwi's Custom Chips API is powerful but requires C/WASM knowledge -- irrelevant for 8-14 year olds

---

### 1.3 Fritzing

| Dimension | Detail |
|---|---|
| **Components** | Large parts library (community-contributed), real-world component models |
| **Simulation** | Basic simulator added in v0.9.10, became non-beta in v1.0.0. Aimed at beginners, not accurate for real circuit modeling |
| **Target Audience** | Hobbyists, makers, educators who want to document prototypes and design PCBs |
| **Pricing** | Open source (GPL 3.0). Pre-built binaries cost minimum 8 EUR |
| **Maintained** | Yes, actively maintained by Kjell Morgenstern. Latest release v1.0.6 (October 2025) |
| **Key Strengths** | Unique breadboard-view visualization, PCB design + Fritzing Fab ordering, large community parts library, offline desktop app |
| **Key Weaknesses** | Desktop-only (no web); simulation is rudimentary; no Arduino code execution; no AI features; no classroom management; dated UI; no real-time interaction |

**ELAB Opportunities vs Fritzing**:
- Fritzing is a documentation/PCB tool, not an interactive simulator
- ELAB's browser-based approach is inherently more accessible than Fritzing's desktop install
- Fritzing's breadboard view is its hallmark -- ELAB already has a comparable visual approach
- Fritzing has no code execution, no AI, no guided learning

---

### 1.4 Arduino IDE 2.x

| Dimension | Detail |
|---|---|
| **Version** | 2.3.7 (latest) |
| **Simulation** | NONE. Arduino IDE has zero built-in simulation capabilities |
| **Target Audience** | Arduino developers (hobbyist to professional) |
| **Pricing** | Free, open source |
| **Key Features** | Auto-completion, live debugger (hardware), serial plotter, remote sketchbook, Electron-based |
| **Key Weaknesses** | No simulation at all; requires physical hardware; no visual programming; no educational scaffolding |

**ELAB Opportunities vs Arduino IDE**:
- Arduino IDE is a complementary tool, not a competitor
- ELAB fills the gap that Arduino IDE explicitly does NOT address: simulation without hardware
- Potential integration: ELAB could export sketches compatible with Arduino IDE for physical deployment

---

### 1.5 micro:bit MakeCode (Microsoft/BBC)

| Dimension | Detail |
|---|---|
| **Components** | Simulates the micro:bit board only (LED matrix, buttons, accelerometer, compass, temperature, light, radio, pins) |
| **Simulation** | Real-time micro:bit simulation in browser. No external circuit simulation (no breadboard, no resistors, no custom wiring) |
| **Target Audience** | Ages 8+ (primary through high school). Very strong K-8 focus |
| **Pricing** | 100% free |
| **Visual Programming** | Scratch-like block editor (9 categories + advanced), switchable to JavaScript/Python |
| **AI/ML** | micro:bit CreateAI for movement-based ML training |
| **Classroom Features** | Curriculum-aligned lessons (USA, UK), offline web app, iOS/Android apps, Bluetooth transfer |
| **Accessibility** | Dark mode, high contrast, keyboard navigation, screen reader support (summer 2026) |
| **Key Strengths** | Best-in-class visual programming for kids, perfect age alignment (8+), massive institutional adoption (UK schools), free hardware + free software model |
| **Key Weaknesses** | Cannot simulate external circuits (breadboard, resistors, LEDs, etc.); locked to micro:bit ecosystem; no Arduino support; no custom boards; no AI tutor (CreateAI is ML training, not tutoring); limited to single-board simulation |

**ELAB Opportunities vs MakeCode**:
- MakeCode CANNOT simulate external circuits -- it only simulates the micro:bit itself
- ELAB's breadboard + wiring + component placement is a major differentiator
- MakeCode's block programming approach is proven for 8-14 age group -- ELAB could learn from this UX pattern
- MakeCode has no AI tutoring -- Galileo is unique
- MakeCode has no textbook integration

---

### 1.6 CircuitJS1 (Falstad)

| Dimension | Detail |
|---|---|
| **Components** | ~100+ analog/digital components (resistors, capacitors, inductors, diodes, transistors, op-amps, logic gates, MOSFETs, transformers, etc.) |
| **Simulation** | Excellent analog simulation with visual current flow (yellow dots), voltage coloring (green/red). Real-time SPICE-like engine |
| **Target Audience** | College/university students, EE hobbyists |
| **Pricing** | Free, open source (GPL v2) |
| **Key Strengths** | Best analog simulation accuracy of all free tools; beautiful current-flow visualization; JavaScript API for iframe embedding; multilingual (13 languages including Italian); no account required |
| **Key Weaknesses** | No Arduino/microcontroller simulation; no code execution; schematic-only view (no breadboard); intimidating UI for children; no educational scaffolding; no AI features |

**ELAB Opportunities vs CircuitJS**:
- CircuitJS's current-flow animation (yellow dots) is a proven pedagogical technique -- ELAB already implements this (Sprint 2: W2 feature)
- CircuitJS's analog accuracy is superior, but it has ZERO microcontroller support
- ELAB bridges the gap: analog understanding + Arduino code execution
- CircuitJS's Italian translation could be studied for terminology reference

---

## 2. Competitor Comparison Matrix

| Feature | ELAB | Tinkercad | Wokwi | Fritzing | Arduino IDE | MakeCode | CircuitJS |
|---|---|---|---|---|---|---|---|
| **Free** | Yes | Yes | Freemium | 8 EUR+ | Yes | Yes | Yes |
| **Browser-based** | Yes | Yes | Yes | No (desktop) | No (desktop) | Yes | Yes |
| **Components** | 21 SVG | ~60+ | ~62 | Large | N/A | micro:bit only | ~100+ |
| **Analog sim** | MNA solver | Basic (buggy) | None | Basic | None | None | Excellent |
| **Arduino sim** | avr8js | Yes | Yes (best) | None | Code only | None | None |
| **Visual code** | No | CodeBlocks | No | No | No | Blocks+JS+Py | No |
| **AI Tutor** | Galileo | None | None | None | None | None | None |
| **Textbook link** | 3 volumes | None | None | None | None | Curriculum | None |
| **Custom board** | NanoBreakout | No | Chips API | Community | No | micro:bit only | No |
| **Classroom** | None yet | Excellent | None | None | None | Good | None |
| **Target age** | 8-14 | 13+ | 16+ (devs) | 14+ | 14+ | 8+ | 16+ (college) |
| **Current flow viz** | Yes | No | No | No | No | No | Yes (best) |
| **Italian** | Yes | No | No | No | No | No | Yes |
| **Experiments** | 69 guided | 24 lessons | Millions (unguided) | Examples | Examples | Lessons | Samples |
| **BOM export** | Yes | Yes | No | Yes | No | No | No |
| **Offline** | No | No | VS Code ext | Yes | Yes | Web app | Yes |
| **PCB design** | No | EAGLE export | No | Yes (core) | No | No | No |

---

## 3. AI Tutoring Competitive Landscape

### 3.1 Khanmigo (Khan Academy)

| Dimension | Detail |
|---|---|
| **Pricing** | $4/month or $44/year for families. Free for teachers |
| **Engine** | GPT-4 |
| **Approach** | Socratic questioning -- never gives answers directly, guides student to discover |
| **STEM Coverage** | Math, science, coding, history. Strong K-12 but more depth at high school level |
| **Safety** | Parental controls, moderation alerts, under-18 access requires parent or school district |
| **Rating** | 4 stars (Common Sense Media), 8.5/10 (reviewer consensus) |
| **Key Innovation** | Integrated into Khan Academy's content library -- not a standalone chatbot |

**Lessons for ELAB's Galileo**:
- Khanmigo's Socratic method is proven effective -- Galileo should NEVER give direct answers
- Parent dashboard with conversation history is expected by families
- $4/month pricing sets the market expectation for AI tutoring
- Integration with content library (not standalone chat) is the winning pattern

### 3.2 Duolingo Max

| Dimension | Detail |
|---|---|
| **Pricing** | ~$29.99/month (or included in annual plans) |
| **Engine** | GPT-4 |
| **Features** | Video Call (voice conversation), Roleplay (character scenarios), Explain My Answer (now free for all) |
| **Adaptive** | Birdbrain AI adjusts difficulty based on learner performance |
| **Results** | 51% surge in DAU, 65% adoption of Explain My Answer, 15% increase in completion rates |
| **Key Innovation** | Adaptive difficulty + gamification loop (streaks, XP, leaderboards) |

**Lessons for ELAB's Galileo**:
- "Explain My Answer" feature (free for all users) boosted engagement massively -- Galileo could offer free circuit explanations
- Gamification (XP, streaks) drives daily engagement even for educational content
- Voice interaction (text-to-speech, speech-to-text) is becoming standard
- Adaptive difficulty is the gold standard -- Galileo should adjust complexity based on child's Volume level

### 3.3 Research: AI Scaffolding Best Practices for Ages 8-14

Based on synthesis of 2025 research (258+ studies):

| Strategy | Evidence | ELAB Application |
|---|---|---|
| **Socratic questioning** | Most effective for metacognitive development | Galileo should ask "Why do you think the LED isn't lighting?" not "Add a resistor" |
| **Scaffold fading** | Critical to prevent dependency (crutch effect) | Reduce Galileo's hints as student progresses through volumes |
| **Adaptive difficulty** | d=0.45-0.70 effect size for conversational AI | Adjust experiment complexity based on success rate |
| **Real-time feedback** | ITS systems show significant learning gains | Galileo should respond to circuit state changes instantly |
| **Collaborative scaffolding** | Peer discussion improves outcomes | Future: multiplayer experiments or parent-child mode |
| **Voice interaction** | Reduces barriers for younger children (8-10) | Speech-to-text for Galileo queries |
| **Privacy by design** | COPPA compliance is non-negotiable for <13 | No data collection without verifiable parental consent |

**Critical Warning from Research**: Studies show EdTech can have a NEGATIVE effect and a GAP-WIDENING effect on young children when poorly designed. Well-designed, evidence-based scaffolding is essential -- superficial AI chatbots can harm learning outcomes.

---

## 4. Technical Intelligence

### 4.1 React + SVG Performance Patterns

Based on analysis of production systems handling SVG-heavy interactive canvases:

| Pattern | Source | Recommendation for ELAB |
|---|---|---|
| **SVG grouping under single transform** | CircuitLab achieved >100x performance gain by grouping elements under one `<g>` transform for pan/zoom | Apply to SimulatorCanvas -- single `<g>` transform for all components during pan/zoom |
| **SVG to Canvas migration** | Felt (mapping app) migrated from SVG+React to Canvas for 1000+ elements due to DOM overhead | Monitor at ~100 components; consider hybrid approach (Canvas for wires, SVG for interactive components) |
| **Cached drawing operations** | Flipboard's react-canvas library | Cache wire path calculations, only recompute on topology change |
| **SVGO minification** | Standard practice | Minify all 21 SVG components with SVGO in build pipeline |
| **Lazy loading** | Strapi recommendations | Lazy-load component SVGs not in current experiment |
| **Virtual rendering** | Only render visible components | Not needed yet at ELAB's scale (max ~15 components per experiment) |
| **Web Workers** | Standard for CPU-intensive computation | Already implemented for AVR simulation (Sprint 2, A1) |
| **manualChunks** | Vite/Rollup optimization | Already implemented (Sprint 3) -- CodeMirror, AVR, React separated |

**Assessment**: At ELAB's current scale (21 components, max ~15 per experiment), SVG+React is the correct choice. Canvas migration would only be needed if component count exceeds ~50 per experiment or if real-time animation (current flow) causes frame drops.

### 4.2 Open Source Circuit Simulators (JavaScript)

| Project | License | Relevance to ELAB |
|---|---|---|
| **avr8js** (Wokwi) | MIT | Already integrated in ELAB for ATmega328p emulation |
| **CircuitJS1** (Falstad) | GPL v2 | Could study SPICE-like solver for improved analog accuracy. Yellow-dot current visualization already implemented in ELAB |
| **Flowscape UI** | MIT | Infinite canvas with pan/zoom/selection -- could inform ELAB's canvas architecture |
| **circuitmod** | GPL | Desktop variant, less relevant |

### 4.3 Model Context Protocol (MCP) -- Specification 2025-11-25

| Feature | Detail | ELAB Relevance |
|---|---|---|
| **Version** | 2025-11-25 (latest stable) | |
| **Three primitives** | Resources (data retrieval), Tools (actions/computations), Prompts (user templates) | Galileo could expose experiment data as Resources, circuit analysis as Tools |
| **Transport** | stdio (local) + SSE (HTTP streaming) over JSON-RPC 2.0 | SSE for browser-based Galileo integration |
| **Async Tasks** | Experimental -- long-running operations return task handles | Circuit compilation could be an async MCP task |
| **OAuth 2.1** | Proper authorization framework | Parent authentication for COPPA compliance |
| **Agent-to-Agent** | 2026 roadmap -- agents can delegate to sub-agents | Galileo could delegate to a "Circuit Expert" agent and a "Code Expert" agent |
| **Adoption** | OpenAI, Google DeepMind, Linux Foundation (AAIF) | Industry standard -- future-proofing ELAB's AI architecture |
| **1000+ servers** | Community-built MCP servers | ELAB could publish its own MCP server for circuit simulation |

**Strategic Recommendation**: Exposing ELAB's simulator as an MCP server would allow ANY LLM (Claude, GPT, Gemini) to interact with circuit simulations programmatically. This could position ELAB as infrastructure, not just a product.

---

## 5. Market Gap Analysis

### The Underserved Niche

| Dimension | Market Status |
|---|---|
| **Ages 8-14 electronics simulation** | ZERO dedicated products. Tinkercad starts at 13+, Wokwi/Arduino IDE target 16+, MakeCode simulates only micro:bit |
| **Physical textbook + digital simulator** | ZERO products integrate books with simulation |
| **Italian-language STEM for children** | Severely underserved market |
| **AI tutoring for electronics** | ZERO products. Khanmigo covers math/science generically, not circuit-specific |
| **Custom educational boards** | Only ELAB has NanoBreakout/basetta curva |
| **K-12 EdTech market** | $216B+ (39.4% of total EdTech), growing at 12-14% CAGR |
| **STEM simulation gap** | ELA and Math are saturated with tools; electronics simulation is comparatively empty |

### ELAB's Unique Value Proposition (vs ALL competitors)

1. **Only product targeting ages 8-14 specifically** for electronics
2. **Only product with AI tutor** (Galileo) for circuit education
3. **Only product integrating physical textbooks** with digital simulation
4. **Only product with proprietary educational board** (NanoBreakout V1.1 GP)
5. **Only Italian-first electronics education** platform
6. **Analog + Digital in one tool** (CircuitSolver + avr8js) -- Tinkercad's analog crashes, Wokwi has none

---

## 6. SWOT Analysis for ELAB

### Strengths
- Unique market position (no direct competitor)
- AI tutor differentiator (Galileo)
- Physical + digital integration (3 volumes)
- Growing component library (21 SVG, 69 experiments)
- MNA solver for accurate analog simulation
- Italian-first approach in underserved market
- Custom board support (NanoBreakout)

### Weaknesses
- Small component library (21 vs Tinkercad's 60+ or Wokwi's 62)
- No classroom management features (Tinkercad has excellent ones)
- No visual/block programming (MakeCode and Tinkercad have this)
- Solo developer capacity vs Autodesk/Microsoft/Wokwi teams
- No offline mode
- 5 features still missing for Tinkercad parity (49/56)
- Auth system is falsifiable from DevTools (audit v2 finding)

### Opportunities
- K-12 EdTech market growing at 12-14% CAGR
- No competitor offers AI + simulation + textbooks
- MCP integration could make ELAB an industry platform
- Italian school system adoption potential
- Gamification (XP, badges) proven to drive engagement in this age group
- Voice interaction for younger users (8-10)
- Parent dashboard (proven by Khanmigo model)

### Threats
- Tinkercad is free, backed by Autodesk, has 50M+ users
- If Tinkercad adds AI features, the gap narrows significantly
- Wokwi's avr8js is the same engine ELAB uses -- they could build educational features
- MakeCode could expand beyond micro:bit to Arduino
- AI tutoring costs (n8n + LLM API) scale linearly with users
- COPPA/GDPR compliance for children is complex and expensive

---

## 7. Strategic Recommendations (Priority-Ordered)

### P0 -- Critical (do before launch)
1. **Add classroom management** -- Teachers are the gatekeepers. Without class codes, assignments, and progress tracking, school adoption is blocked. Study Tinkercad's implementation.
2. **COPPA/GDPR compliance audit** -- Children 8-14 require verifiable parental consent. This is legally mandatory, not optional.
3. **Fix auth security** -- DevTools-falsifiable auth is a blocker for any school deployment.

### P1 -- High Priority (next quarter)
4. **Visual/block programming mode** -- MakeCode and Tinkercad prove this is essential for ages 8-12. Consider Blockly (Google's open-source block editor) integration.
5. **Galileo Socratic mode** -- Implement scaffold fading: more hints in Vol 1, fewer in Vol 3. Never give direct answers.
6. **Parent dashboard** -- Show conversation history, progress, time spent. Khanmigo charges $4/month for this.
7. **Expand to 30+ components** -- Current 21 is below Tinkercad (60+) and Wokwi (62). Priority adds: temperature sensor, distance sensor, 7-segment display, relay, stepper motor.

### P2 -- Medium Priority (next 6 months)
8. **MCP server** -- Expose ELAB's simulator as an MCP server so any LLM can interact with circuit simulations.
9. **Gamification** -- XP system, experiment completion badges, volume progress. Duolingo's engagement data proves this works.
10. **Offline mode (PWA)** -- Schools often have unreliable internet. Tinkercad's internet requirement is a known weakness.
11. **Voice interaction** -- Text-to-speech for Galileo responses, speech-to-text for queries. Reduces friction for ages 8-10.
12. **Italian school curriculum alignment** -- Map experiments to Italian MIUR technology curriculum standards.

### P3 -- Future Vision
13. **Multiplayer experiments** -- Parent-child or student-student collaborative mode.
14. **AR integration** -- Electronics Playground (MIT Solve) shows paper + AR circuits resonate with this age group.
15. **Export to Arduino IDE** -- Let students upload their code to real hardware after simulating.

---

## 8. Pricing Intelligence

| Product | Price | Model |
|---|---|---|
| Tinkercad | Free | Autodesk subsidized |
| Wokwi | Free / $7/month | Freemium |
| Fritzing | 8 EUR+ | Open source + paid binaries |
| Arduino IDE | Free | Open source |
| MakeCode | Free | Microsoft/BBC subsidized |
| CircuitJS | Free | Open source |
| Khanmigo | $4/month | Subscription |
| Duolingo Max | $29.99/month | Premium tier |
| **ELAB Books** | Amazon pricing | Physical product |
| **ELAB Simulator** | Free | Bundled with books |

**Pricing Recommendation**: The simulator should remain free (bundled with textbook purchase). Revenue comes from book sales on Amazon. This aligns with the market where ALL simulators are free. The AI tutor (Galileo) could have a freemium model: basic hints free, detailed Socratic tutoring at $3-5/month (below Khanmigo's $4/month to be competitive).

---

## Sources

- [Tinkercad Circuits Official Guide](https://www.tinkercad.com/blog/official-guide-to-tinkercad-circuits)
- [Tinkercad Classrooms](https://www.tinkercad.com/classrooms-resources)
- [Wokwi Documentation](https://docs.wokwi.com/)
- [Wokwi Supported Hardware](https://docs.wokwi.com/getting-started/supported-hardware)
- [Wokwi Pricing](https://wokwi.com/pricing)
- [avr8js GitHub](https://github.com/wokwi/avr8js)
- [Fritzing Official Site](https://fritzing.org/)
- [Fritzing GitHub](https://github.com/fritzing/fritzing-app)
- [Arduino IDE 2 Documentation](https://docs.arduino.cc/software/ide-v2/tutorials/getting-started-ide-v2/)
- [micro:bit MakeCode](https://makecode.microbit.org/)
- [micro:bit Educational Foundation](https://microbit.org/)
- [CircuitJS1 GitHub](https://github.com/sharpie7/circuitjs1)
- [CircuitLab SVG Performance Blog](https://www.circuitlab.com/blog/2012/07/25/tuning-raphaeljs-for-high-performance-svg-interfaces/)
- [Felt SVG to Canvas Migration](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster)
- [Khanmigo Official Site](https://www.khanmigo.ai)
- [Khanmigo Pricing](https://www.khanmigo.ai/pricing)
- [Duolingo Max Blog](https://blog.duolingo.com/duolingo-max/)
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP November 2025 Spec Analysis](https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03)
- [MCP 2026 Enterprise Adoption](https://www.cdata.com/blog/2026-year-enterprise-ready-mcp-adoption)
- [AI Scaffolding in STEM -- Systematic Review 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12653222/)
- [AI in Elementary STEM Education -- arXiv 2025](https://arxiv.org/html/2511.00105v2)
- [EdTech Market Analysis](https://market.us/report/primary-edtech-market/)
- [Flowscape UI Canvas React](https://github.com/Flowscape-UI/canvas-react)
- [React SVG Optimization Guide](https://strapi.io/blog/mastering-react-svg-integration-animation-optimization)
