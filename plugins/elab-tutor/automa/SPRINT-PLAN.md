# ELAB Tutor — 7-Day Sprint Plan (23-29 March 2026)

**Version**: 1.0
**Created**: 22/03/2026
**Goal**: Transform ELAB Tutor from a 9.2/10 Italian-only simulator into a self-improving, multilingual, offline-capable, pedagogically invisible educational platform.

---

## Sprint Principles

1. **Zero bugs tolerance** — every night the automa tests; every morning regressions are fixed before new work starts.
2. **Teacher invisible scaffolding** — a teacher picks a volume and lesson, Galileo handles everything else. Zero preparation required.
3. **Galileo speaks kid** — 10-14 year old language, everyday analogies ("la resistenza e' come un tubo stretto per l'acqua"), never pedantic.
4. **Honest system** — Galileo says "non lo so" when uncertain. Never sycophantic. Never makes up electronics facts.
5. **Parallel execution** — Claude Code, Codex CLI, Gemini CLI, and n8n work simultaneously on independent tasks.
6. **Human checkpoints at 07:00 every morning** — WhatsApp report, you decide what ships.

---

## Tools Assignment

| Tool | Role | When |
|------|------|------|
| **Claude Code** | Primary coder. Features, bug fixes, Ralph Loop testing. | All day sessions |
| **Codex CLI** (ChatGPT Plus) | Code review, alternative implementations, judging Galileo responses | Nightly audit + on-demand |
| **Gemini CLI** | Research (1M context), document analysis, competitor scan | Daytime + nightly |
| **OpenCode + Kimi K2.5** | Visual regression, screenshot audits, design review | Nightly + daytime checks |
| **n8n** (Docker) | Orchestrator, scheduler, WhatsApp alerts, glue between agents | Always-on |
| **Ollama** (local) | galileo-brain routing model, offline LLM inference | Always-on |
| **DeepSeek API** | Bulk testing (cheap), content verification | Nightly |
| **Groq API** | Fast inference for simulated classrooms | Nightly |

---

## DAY 1 — Monday 23/03: Foundation + Automa Bootstrap

### Morning (09:00-13:00) — HUMAN + Claude Code

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 1.1 | Create `automa/docker-compose.yml` with n8n + Ollama services | 30min | Claude Code | Working `docker-compose up` with n8n on :5678, Ollama on :11434 |
| 1.2 | Create `automa/.env` with all API keys (DeepSeek, Groq, n8n password) | 10min | Human (manual) | `.env` file, `.gitignore`d |
| 1.3 | Pull galileo-brain GGUF into Ollama | 15min | Claude Code + Ollama | `ollama list` shows galileo-brain |
| 1.4 | Create `automa/agents/galileo-tester.py` — 50 test messages to nanobot | 45min | Claude Code | Script that sends 50 curated Q/A pairs to `https://elab-galileo.onrender.com/chat`, logs responses |
| 1.5 | Create `automa/eval/eval-200.jsonl` — 200 test cases covering all 3 volumes | 90min | Claude Code + Gemini CLI | JSONL with `{question, expected_tags, expected_topic, volume, difficulty}` |
| 1.6 | Create n8n health-monitor workflow (ping nanobot + Vercel every 5min) | 30min | Claude Code | n8n workflow JSON, imported and running |

### Afternoon (14:00-18:00) — Claude Code + Gemini CLI in parallel

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 1.7 | Create `automa/agents/pedagogy-sim.py` with 5 student profiles (Sofia 10, Marco 12, Luca 14, Prof.ssa Rossi, Edge Case) | 60min | Claude Code | Script with 60 nightly interactions, YAML profiles in `automa/profiles/` |
| 1.8 | Create `automa/agents/galileo-judge.py` — scores responses on 5 dimensions (correctness, pedagogy, safety, age-appropriate, action-tags) using DeepSeek as judge | 45min | Claude Code | Score card output: per-question scores + aggregate |
| 1.9 | Create `automa/agents/synthesizer.py` — reads all agent reports, produces unified nightly-report.json | 30min | Claude Code | JSON report with priorities, auto-fixable items, human-decision items |
| 1.10 | **Electron View proof-of-concept** — particle system overlay on wire paths showing current flow direction and magnitude | 90min | Claude Code | Animated dots on wires in simulation mode. Toggle button in toolbar. Uses existing KVL/KCL current values. |

### Night (02:00-06:00) — First automated cycle

| # | Task | Tool | Gate |
|---|------|------|------|
| 1.N1 | Run galileo-tester.py (50 messages) | Script | Logs to `automa/reports/nightly/` |
| 1.N2 | Run galileo-judge.py on responses | DeepSeek | Score card saved |
| 1.N3 | Run pedagogy-sim.py (60 interactions) | Groq | Completion rates logged |
| 1.N4 | `npm run build` verification | Script | Must pass (0 errors) |

**Dependencies**: 1.2 before 1.4-1.8. 1.1 before 1.6. 1.4+1.5 before 1.N1.

**Verification**:
- `docker-compose up` runs without errors
- n8n dashboard accessible at localhost:5678
- galileo-tester.py produces 50 logged responses
- First nightly report generated at `automa/reports/nightly/2026-03-24.json`
- Electron View toggle shows animated particles on at least one experiment

**Human Checkpoint (07:00 Tuesday)**: Review first nightly report. Approve/reject baseline scores.

---

## DAY 2 — Tuesday 24/03: i18n Foundation + Teacher Dashboard Skeleton

### Morning (09:00-13:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 2.1 | **i18n infrastructure**: Install `react-i18next`, create `src/i18n/` with `it.json`, `en.json`, `es.json` locale files | 60min | Claude Code | Language switcher in settings, all UI strings externalized for at least the simulator toolbar and main navigation |
| 2.2 | Extract all hardcoded Italian strings from NewElabSimulator.jsx, ControlBar.jsx, ExperimentPicker.jsx | 90min | Claude Code | `t('key')` calls replacing all hardcoded strings in the 3 most critical files |
| 2.3 | **Galileo multilingual prompt**: Modify nanobot system prompts to accept a `language` parameter. Galileo detects student language from first message OR uses explicit setting. | 45min | Claude Code | nanobot.yml + server.py accept `lang` param, Galileo responds in detected language |
| 2.4 | Translate `en.json` — full English locale for simulator UI | 30min | Gemini CLI | Complete English translation of all UI strings |

### Afternoon (14:00-18:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 2.5 | **Teacher Dashboard skeleton**: New route `/dashboard` with: class list, experiment assignment, student progress grid | 90min | Claude Code | React component `TeacherDashboard.jsx` with mock data, responsive layout |
| 2.6 | **Lesson Prep mode**: Teacher selects a volume + chapter + experiment. System auto-generates a lesson plan (objectives, timing, common mistakes, discussion questions) using Galileo | 60min | Claude Code | "Prepara Lezione" button in dashboard, modal with AI-generated lesson plan |
| 2.7 | **Curriculum context files**: Create YAML files for each experiment with learning objectives, prerequisites, misconceptions, scaffolding levels, vocabulary | 60min | Claude Code + Gemini CLI | `src/data/curriculum/` folder with 67 YAML files (one per experiment) |
| 2.8 | First visual regression run with OpenCode+Kimi (3 viewports: 375px, 768px, 1280px) | 30min | OpenCode + Kimi K2.5 | Baseline screenshots saved to `automa/screenshots/baseline/` |

### Night (02:00-06:00)

Full nightly cycle with all agents. Second nightly report.

**Dependencies**: 2.1 before 2.2-2.4. 2.5 independent. 2.7 independent (can run in parallel via Gemini CLI).

**Verification**:
- Language switcher toggles IT/EN/ES in simulator UI
- Galileo responds in English when prompted in English
- `/dashboard` route renders teacher view (even with mock data)
- "Prepara Lezione" generates a coherent lesson plan for any experiment
- 67 curriculum YAML files exist and parse correctly
- `npm run build` passes with 0 errors

**Human Checkpoint (07:00 Wednesday)**: Review English translations for accuracy. Review lesson plan quality. Approve teacher dashboard direction.

---

## DAY 3 — Wednesday 25/03: PWA Offline + Electron View Complete

### Morning (09:00-13:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 3.1 | **PWA setup**: `vite-plugin-pwa`, service worker, manifest.json, offline fallback page | 45min | Claude Code | Installable PWA. Chrome shows "Install ELAB Tutor" prompt. |
| 3.2 | **Offline caching strategy**: Cache all experiment data, component SVGs, curriculum YAMLs, last-used locale. Use stale-while-revalidate for API calls. | 60min | Claude Code | Service worker caches ~15MB of critical assets. Simulator loads and runs without internet. |
| 3.3 | **Offline Galileo fallback**: When nanobot is unreachable, use local fallback responses from curriculum YAML files (show pre-written hints for current experiment step) | 45min | Claude Code | "Galileo Offline" badge appears. Responses come from local cache. Basic hints still work. |
| 3.4 | **Electron View complete**: Particle speed proportional to current magnitude. Particles slow through resistors. Particles split at junctions. Color coding: gold (low current) to orange to red (high current). | 90min | Claude Code | Beautiful particle animation on any circuit with current flow. Performance target: 60fps on desktop, 30fps on iPad. |

### Afternoon (14:00-18:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 3.5 | **Student mastery tracker**: JSON profile per student tracking completed experiments, quiz scores per topic, struggle areas. Updated deterministically from simulator events. | 60min | Claude Code | `studentModel.js` — read/write to localStorage, inject into Galileo prompts |
| 3.6 | **Galileo adaptive prompts**: System prompt includes student mastery context. Weak topics get simpler explanations + analogies. Strong topics get abbreviated. | 45min | Claude Code | Galileo's tone measurably adapts based on student profile |
| 3.7 | **Emotional state detection**: Track undo/redo frequency, pause duration, error rate. Infer frustration/confusion/boredom. Inject emotional context into Galileo prompts. | 60min | Claude Code | `emotionDetector.js` — behavioral signal processing. Galileo says "Nessun problema, proviamo un altro approccio!" when frustration detected |
| 3.8 | **Content integrity checker**: Script that validates all 67 experiments — pin assignments, buildSteps, quiz questions, component references | 45min | Claude Code | `automa/agents/content-checker.py` validates 67/67 experiments |

### Night (02:00-06:00)

Full cycle + content-checker first run. Establish baseline integrity score.

**Dependencies**: 3.1 before 3.2-3.3. 3.4 uses Day 1 PoC as base. 3.5 before 3.6-3.7.

**Verification**:
- PWA installable on Chrome desktop and mobile
- Simulator loads and displays a circuit with no internet (airplane mode test)
- Electron View shows animated particles on Vol1 LED circuit, Vol2 motor circuit, Vol3 AVR circuit
- Student profile persists across sessions in localStorage
- Galileo's language measurably simpler for a student marked as "beginner"
- Content checker reports 67/67 experiments valid (or identifies specific failures to fix)

**Human Checkpoint (07:00 Thursday)**: Review Electron View animation quality. Test PWA offline on your iPhone. Approve student model schema.

---

## DAY 4 — Thursday 26/03: Simulated Classrooms + Bug Extermination

### Morning (09:00-13:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 4.1 | **First full simulated classroom**: Run all 5 profiles (Sofia, Marco, Luca, Prof.ssa Rossi, Edge Case) with 60 interactions. Score with judge. Identify all failures. | 120min | pedagogy-sim.py + galileo-judge.py | Score card with per-profile results. Target: >4.0/5 average |
| 4.2 | **Fix ALL bugs found by classroom simulation** (estimated 5-15 bugs based on S108 experience) | 120min | Claude Code | Every bug from 4.1 fixed. Re-run confirms fix. |

### Afternoon (14:00-18:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 4.3 | **Intent Prediction Engine v1**: When a student places 2+ components, check against known experiment circuits and suggest: "Stai costruendo il circuito LED? Vuoi che ti guidi?" | 60min | Claude Code | Pattern matcher against 67 experiment component lists. Suggestion toast appears after 3+ components match a known experiment. |
| 4.4 | **Reverse Engineering Challenge mode**: Present a completed circuit with no labels. Student probes voltages, traces wires, submits hypothesis. Galileo grades reasoning. | 60min | Claude Code | New game mode accessible from main menu. Uses existing experiments stripped of labels. |
| 4.5 | **n8n morning report workflow**: Format nightly results into WhatsApp-friendly message. Send at 07:00. Accept 1/2/3 reply. Execute chosen action. | 45min | Claude Code + n8n | Working WhatsApp notification chain |
| 4.6 | **Auto-fix pipeline v1**: For P2+ CSS bugs and prompt issues, Claude Code applies fix, runs `npm run build`, compares screenshots, commits to `automa/nightly-YYYY-MM-DD` branch if better | 45min | Claude Code | Branch with automated fixes ready for human review |

### Night (02:00-06:00)

Second full classroom simulation. Compare scores vs Day 1 baseline. Auto-fix any CSS regressions found.

**Dependencies**: 4.1 before 4.2. 4.3 and 4.4 are independent features. 4.5 needs Day 1 n8n setup.

**Verification**:
- Simulated classroom score >= 4.0/5 average across all profiles
- Zero unfixed bugs from classroom simulation
- Intent prediction triggers correctly for at least 5 different experiment patterns
- Reverse Engineering mode loads, runs, and grades at least one circuit
- WhatsApp morning report received at 07:00 Friday
- Auto-fix branch passes `npm run build`

**Human Checkpoint (07:00 Friday)**: Review classroom simulation results. Test Reverse Engineering mode. Approve auto-fix branch for merge.

---

## DAY 5 — Friday 27/03: Multi-Language Launch + Teacher Features

### Morning (09:00-13:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 5.1 | **Complete i18n extraction**: ALL remaining Italian strings in ALL components (30+ files) wrapped in `t()` calls | 120min | Claude Code | Zero hardcoded Italian strings in any component |
| 5.2 | **Spanish locale** (`es.json`): Full translation of all UI strings + Galileo prompts | 45min | Gemini CLI + human review | Complete Spanish interface |
| 5.3 | **Galileo cultural adaptation**: When language is EN, analogies use imperial units and culturally relevant examples. When ES, use Latin American context. | 30min | Claude Code | nanobot.yml cultural variants per language |

### Afternoon (14:00-18:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 5.4 | **Teacher assignment system**: Teacher creates a class (name + student codes). Students join with code. Teacher assigns experiments. Progress syncs via nanobot. | 90min | Claude Code | End-to-end: create class, generate codes, student joins, teacher sees progress |
| 5.5 | **Lesson plan AI generation**: Given an experiment, generate: objectives, timing (45min class), warm-up question, step-by-step guide, assessment rubric, homework suggestion | 45min | Claude Code | PDF-exportable lesson plan from any experiment |
| 5.6 | **Galileo "teacher mode"**: When Prof.ssa Rossi asks, Galileo gives pedagogical advice ("Come spiego la legge di Ohm a un bambino di 10 anni?") rather than direct electronics content | 30min | Claude Code | Teacher-detected prompts get pedagogical scaffolding responses |
| 5.7 | **Design polish sweep**: Fix all inline styles, inconsistent paddings, grid alignment issues identified in S108 audit (-1.5 estetica points) | 60min | Claude Code | Design tokens applied consistently. Audit score improvement. |

### Night (02:00-06:00)

Full cycle. Run classroom sim in English + Spanish (new profiles: Emily 11, Carlos 13). Compare multilingual Galileo quality.

**Dependencies**: 5.1 before 5.2-5.3 (i18n infrastructure must be complete). 5.4 is independent. 5.6 needs curriculum YAMLs from Day 2.

**Verification**:
- ELAB Tutor fully usable in English and Spanish (every button, every label, every Galileo response)
- Teacher can create a class, generate 5 student codes, and see a progress dashboard
- Lesson plan generates for any of the 67 experiments and looks professional
- Galileo in teacher mode gives pedagogical advice, not just electronics content
- Design audit finds zero inline styles in main simulator components
- Multilingual classroom simulation scores >= 3.8/5 (lower bar for first multilingual pass)

**Human Checkpoint (07:00 Saturday)**: Review EN/ES translations. Test class creation flow on phone. Approve lesson plan template.

---

## DAY 6 — Saturday 28/03: Self-Improvement Loop + Observability

### Morning (09:00-13:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 6.1 | **Structured interaction logging**: Every Galileo interaction logged to `automa/logs/interactions-YYYY-MM-DD.jsonl` with full context (experiment, student model, prompt, response, action tags, latency) | 45min | Claude Code | Log file grows with every interaction. Queryable. |
| 6.2 | **Observability dashboard**: n8n workflow that reads logs and displays: Galileo score trend, action-tag compliance %, latency p95, error rate, top failed queries | 60min | Claude Code + n8n | Dashboard accessible via n8n UI with live metrics |
| 6.3 | **Dangerous pattern detector**: Regex-based safety net that flags responses suggesting: wrong voltages, missing resistors, short circuits, incorrect pin connections | 45min | Claude Code | `safetyValidator.js` — runs on every Galileo response before display. Blocks dangerous content. |
| 6.4 | **A/B test infrastructure**: Hash user ID to variant. Log variant with every interaction. Script to analyze results. | 60min | Claude Code | First A/B test running: "Socratic prompts" vs "Direct explanation" for Ohm's law |

### Afternoon (14:00-18:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 6.5 | **Weekly improvement workflow**: n8n Sunday 10:00 — aggregate 7 nightly reports, identify top 3 problems, run claude-octopus debate, propose fixes | 45min | Claude Code + n8n | n8n workflow JSON ready to activate |
| 6.6 | **Data flywheel pipeline**: Log implicit feedback signals (re-ask rate, session abandonment, experiment completion). Mark high-quality interactions for training data. Export to JSONL format compatible with Unsloth. | 60min | Claude Code | Pipeline that identifies candidate training examples from real interactions |
| 6.7 | **Bug extermination**: Fix ALL remaining P1 and P2 bugs from MEMORY.md known issues list | 90min | Claude Code | P2-TDZ, P2-NAN-5, P2-NAN-7 fixed. Notion DB mismatch documented. |
| 6.8 | **Performance optimization**: Lighthouse audit. Target: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+ | 45min | Claude Code | Lighthouse scores at target or documented reasons why not |

### Night (02:00-06:00)

Full cycle. With observability now active, first comprehensive metrics capture. Establish definitive baselines for all monitored metrics.

**Dependencies**: 6.1 before 6.2 and 6.6. 6.3 independent. 6.4 needs logging from 6.1.

**Verification**:
- Interaction log file populated with correct schema
- n8n dashboard shows live metrics (at least: score, latency, error rate)
- Dangerous pattern detector catches at least 3 known bad patterns in test suite
- A/B test properly assigns variants and logs them
- All P1 bugs resolved or documented with clear reason for deferral
- Lighthouse Performance >= 85 (90 is stretch goal)

**Human Checkpoint (07:00 Sunday)**: Review observability dashboard. Approve A/B test configuration. Review all bug fixes.

---

## DAY 7 — Sunday 29/03: Integration + Deploy + Final Audit

### Morning (09:00-13:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 7.1 | **Full integration test**: Ralph Loop on all 3 volumes (Vol1 LED, Vol2 Motor, Vol3 AVR) in IT + EN + ES | 45min | Claude Code | 9/9 Ralph Loop passes |
| 7.2 | **Simulated classroom marathon**: 5 profiles x 3 languages x 20 interactions = 300 interactions. Full scoring. | 120min | pedagogy-sim.py + galileo-judge.py + Groq | Final score card. Target: 4.2/5 average. |
| 7.3 | **iPad verification**: 8 viewport tests (from S108 checklist) on all new features | 30min | Claude Code | 8/8 iPad viewport PASS |
| 7.4 | **PWA offline test**: Install PWA, disconnect internet, verify simulator + Electron View + cached Galileo all work | 15min | Human | Documented pass/fail for each offline feature |

### Afternoon (14:00-18:00)

| # | Task | Time | Tool | Deliverable |
|---|------|------|------|-------------|
| 7.5 | **Final deploy**: Vercel (frontend) + Render (nanobot) + verify all health checks green | 30min | Claude Code | Production deploy. Health checks 200 OK. |
| 7.6 | **Score card update**: Update MEMORY.md with new scores based on full audit | 30min | Claude Code | Updated scores reflecting all sprint work |
| 7.7 | **Sprint retrospective document**: What was built, what works, what needs more work, honest assessment | 30min | Claude Code | `automa/reports/sprint-retro-week1.md` |
| 7.8 | **Week 2 kickoff prompt**: Create self-contained prompt for next Monday's session | 30min | Claude Code | `automa/KICKOFF-PROMPT-WEEK2.md` |

### Night (02:00-06:00)

Final nightly cycle of the sprint. All agents run. Comprehensive report generated. System enters steady-state autonomous operation.

**Dependencies**: 7.1-7.4 before 7.5 (deploy only after all tests pass). 7.5 before 7.6. 7.6 before 7.7-7.8.

**Verification**:
- 9/9 Ralph Loop passes (3 volumes x 3 languages)
- Simulated classroom score >= 4.2/5 average
- 8/8 iPad viewport PASS
- PWA installs and works offline
- Production deploy successful, all health checks green
- MEMORY.md updated with accurate new scores
- Automa system running autonomously (nightly cycles, morning reports)

**Human Checkpoint (Monday 07:00)**: Review final sprint report. Decide Week 2 priorities based on data.

---

## Cross-Day Research Tasks (Gemini CLI, background)

These run in parallel throughout the week and do not block feature work:

| Day | Research Task | Tool | Output |
|-----|--------------|------|--------|
| 1-2 | Competitive scan: Tinkercad, Wokwi, Arduino Cloud features updated Q1 2026 | Gemini CLI | `automa/reports/competitive-scan-march2026.md` |
| 2-3 | Paper scan: arXiv/Scholar for AI tutoring effectiveness studies 2025-2026 | Gemini CLI | `automa/reports/research-papers-march2026.md` |
| 3-4 | Italian school infrastructure: MIUR digital plans, PON hardware, STEM teaching reality | Gemini CLI | `automa/reports/italian-schools-2026.md` |
| 5-6 | Pricing/packaging research: What do ed-tech competitors charge? Physical kit cost analysis | Gemini CLI | `automa/reports/pricing-research.md` |
| 7 | Synthesis of all research into strategic recommendations | Gemini CLI | `automa/reports/strategic-recommendations-week1.md` |

---

## Expected End-of-Sprint State

| Area | Before (22/03) | Target (29/03) | How We Know |
|------|----------------|-----------------|-------------|
| Auth + Security | 9.8 | 9.8 | No regressions |
| Sito Pubblico | 9.6 | 9.6 | No regressions |
| Simulatore (funzionalita) | 10.0 | 10.0 | Ralph Loop 9/9 |
| Simulatore (estetica) | 8.5 | 9.0+ | Design tokens sweep, zero inline styles |
| Simulatore (iPad) | 8.5 | 9.0 | 8/8 viewport + new features tested |
| Simulatore (physics) | 8.0 | 8.5 | Electron View adds visual physics layer |
| Scratch Universale | 10.0 | 10.0 | No regressions |
| AI Integration | 10.0 | 10.0 | Multilingual + teacher mode + adaptive |
| Responsive/A11y | 9.2 | 9.5 | Lighthouse 90+ a11y |
| Code Quality | 9.8 | 9.8 | 0 build errors, P1/P2 bugs resolved |
| **NEW: i18n** | 0 | 8.0 | IT+EN+ES full UI + Galileo |
| **NEW: PWA/Offline** | 0 | 7.5 | Installable, works offline (no AI) |
| **NEW: Teacher Tools** | 0 | 7.0 | Dashboard, lesson plans, class management |
| **NEW: Self-Improvement** | 0 | 6.0 | Nightly audits, logging, observability |
| **NEW: Electron View** | 0 | 8.0 | Animated particle current flow |
| **Overall** | ~9.2 | ~9.0 (more areas) | More capability, same quality floor |

Note: Overall average may dip slightly because we are adding 5 entirely new dimensions that start from zero. The existing 9.2 floor does not drop.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| i18n extraction takes longer than estimated (30+ files) | Day 5 morning is buffer. If still behind, ship IT+EN only, ES in week 2 |
| PWA service worker breaks existing features | Feature-flag PWA behind `?pwa=true` query param until verified |
| Electron View performance on iPad | Use requestAnimationFrame + particle count cap (max 200). Canvas fallback if SVG too slow |
| Teacher dashboard scope creep | Day 2 skeleton only. Functional minimum Day 5. Polish in week 2 |
| Nanobot rate limits during classroom sims | Stagger sim profiles, 2-second delay between messages, retry with backoff |
| Mac needs to stay on for nightly cycles | Set Energy Saver to prevent sleep. Consider Mac Mini for week 2+ |
