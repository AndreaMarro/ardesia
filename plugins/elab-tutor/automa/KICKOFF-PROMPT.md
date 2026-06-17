# ELAB Tutor Sprint — Day 1 Kickoff Prompt

**Date**: 23/03/2026 (Monday)
**Read this FIRST. Do not skip any section.**

---

## PRINCIPIO ZERO — Leggere prima di QUALSIASI azione

**L'insegnante è il vero utente. L'insegnante è il vero studente.**

ELAB Tutor non sostituisce l'insegnante. Rende CHIUNQUE — un genitore, un volontario, un docente di lettere — capace di insegnare elettronica. L'insegnante impara mentre insegna. Dopo 10 lezioni SA davvero l'elettronica. Galileo è il libro intelligente che rende l'insegnante competente, non il professore che parla al posto suo.

**In classe**: l'insegnante usa ELAB Tutor sulla LIM. 25 studenti guardano. Galileo NON parla al posto dell'insegnante. L'insegnante CAPISCE i concetti dalla piattaforma e li spiega con le SUE parole. Se è in difficoltà, chiede a Galileo davanti alla classe — e questo insegna ai ragazzi che chiedere è normale.

**Il linguaggio**: SEMPRE per 10-14 anni con analogie quotidiane, perché gli studenti leggono la LIM. L'insegnante legge le stesse cose e impara.

**L'apprendimento è orizzontale**: insegnante e studenti scoprono insieme. Nessuno è passivo.

Ogni decisione di design, ogni prompt, ogni feature va valutata con questa domanda: "Questo aiuta l'insegnante a diventare capace, o lo rende dipendente?"

---

## Correzioni critiche al piano (session 22/03)

1. **AutoResearchClaw** deve girare in background dal Day 1 su: pedagogia STEM, analogie elettronica, scaffolding invisibile
2. **L'insegnante è il centro** — non un add-on Day 5. Curriculum YAML + teacher prep mode = Day 1
3. **Il loop deve GIRARE** — la prima cosa da costruire è un loop funzionante (anche brutto), non un altro documento
4. **LIM flow**: Galileo parla linguaggio studenti SEMPRE. L'insegnante ha una modalità "prep" PRIMA della lezione (da solo) dove Galileo spiega i concetti e suggerisce il flusso
5. **Continuità**: il sistema deve lavorare continuamente (ogni 2 ore), non solo batch notturno

---

## Who You Are

You are Claude Code, the primary development tool for ELAB Tutor. You are starting Day 1 of a 7-day sprint to transform the product from a 9.2/10 Italian-only simulator into a multilingual, offline-capable, self-improving educational platform where ANY teacher can teach electronics with zero preparation.

You have 4 hours this morning (09:00-13:00) and 4 hours this afternoon (14:00-18:00). The nightly automated cycle runs from 02:00-06:00 without you. But the loop should also do work during the day every 2 hours.

---

## Context Files to Read (in this order)

1. **Current project state**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/STATE.md` — what works, what does not, honest scores
2. **Sprint plan**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/SPRINT-PLAN.md` — the full 7-day plan with exact tasks
3. **Project memory**: Read via MEMORY.md (auto-loaded by Claude Code)
4. **Automa v3 design**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/plans/2026-03-22-elab-automa-v3-multi-tool.md` — the Docker + n8n architecture
5. **CLAUDE.md**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/CLAUDE.md` — simulator architecture, file locations, pin maps, immutable rules

---

## Today's Tasks (Day 1 — Monday 23/03)

### MORNING BLOCK (09:00-13:00): Automa Bootstrap + Electron View PoC

#### Task 1.1: Create docker-compose.yml (30 min)
- Path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/docker-compose.yml`
- Services: n8n (port 5678) + Ollama (port 11434)
- Volumes: n8n_data, ollama_data, ./shared
- Reference architecture: `docs/plans/2026-03-22-elab-automa-v3-multi-tool.md` lines 35-87
- Test: `cd automa && docker-compose up -d` should start both services

#### Task 1.2: Human creates .env (skip — human does this)

#### Task 1.3: Pull galileo-brain into Ollama (15 min)
- The GGUF file is at: check `datasets/` or `models/` directory for `galileo-brain*.gguf`
- If not found locally, the model was trained in Session 75. Check if Modelfile exists.
- Create an Ollama Modelfile pointing to the GGUF
- Run: `ollama create galileo-brain -f Modelfile`
- Verify: `ollama list` shows galileo-brain

#### Task 1.4: Create galileo-tester.py (45 min)
- Path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/agents/galileo-tester.py`
- Sends 50 curated questions to `https://elab-galileo.onrender.com/chat`
- Categories: 10 theory, 10 action commands, 10 circuit building, 10 Scratch/code, 5 quiz, 5 edge cases
- Logs: question, full response, detected action tags, latency, timestamp
- Output: `automa/reports/nightly/galileo-test-YYYY-MM-DD.json`
- Uses `requests` library. Simple POST to `/chat` with `{"message": "...", "sessionId": "test-...", "experimentId": "..."}`
- IMPORTANT: Use `.trim()` pattern on URLs (Vercel env var trailing newline issue from S62)

#### Task 1.5: Create eval-200.jsonl (90 min)
- Path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/eval/eval-200.jsonl`
- 200 test cases. Schema per line:
```json
{"id": "T001", "question": "Cos'e' una resistenza?", "volume": 1, "category": "theory", "expected_topic": "resistor", "expected_tags": [], "difficulty": "easy", "language": "it"}
```
- Distribution: 60 Vol1 (easy), 60 Vol2 (medium), 50 Vol3 (hard), 30 cross-cutting (teacher, safety, edge cases)
- Cover ALL action tags: play, pause, clearall, addcomponent, addwire, highlight, quiz, compile, loadexp, opentab, switcheditor, openeditor, closeeditor, etc.
- Include deliberately adversarial cases: injection attempts, off-topic questions, incorrect Italian
- Source knowledge from: `nanobot/knowledge/nanobot.yml`, `nanobot/knowledge/circuit.yml`, experiment files

#### Task 1.6: Create n8n health-monitor workflow (30 min)
- In n8n (localhost:5678): create a workflow triggered every 5 minutes
- Pings: `https://elab-galileo.onrender.com/health` (expect 200)
- Pings: `https://www.elabtutor.school` (expect 200)
- On failure: log to `automa/shared/health-log.json`
- For now, WhatsApp alert can be a placeholder (just log)

### AFTERNOON BLOCK (14:00-18:00): Profiles + Judge + Electron View

#### Task 1.7: Create pedagogy-sim.py + student profiles (60 min)
- Path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/agents/pedagogy-sim.py`
- 5 YAML profiles in `automa/profiles/`:
  - `sofia-10.yml`: 10yo beginner, Vol1, simple language, makes polarity errors
  - `marco-12.yml`: 12yo intermediate, Vol2, informal/slang, skips instructions
  - `luca-14.yml`: 14yo advanced, Vol3, technical language, C++ syntax questions
  - `prof-rossi.yml`: teacher, lesson prep questions, class management
  - `edge-case.yml`: parolacce, injection, empty input, emoji spam
- Each profile has: system prompt (to generate realistic student messages), experiment list, expected behaviors
- Script generates 60 interactions total (15 Sofia, 15 Marco, 15 Luca, 5 Prof, 10 Edge)
- Uses Groq API (free tier, fast) to generate student messages based on profile

#### Task 1.8: Create galileo-judge.py (45 min)
- Path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/agents/galileo-judge.py`
- Takes output from galileo-tester.py
- Scores each response on 5 dimensions (1-5 scale):
  1. **Correctness** — factually accurate electronics content?
  2. **Pedagogy** — age-appropriate, uses analogies, Socratic method?
  3. **Safety** — no dangerous instructions, proper disclaimers?
  4. **Action tags** — correct tags emitted for action requests?
  5. **Language** — Italian quality, no English leakage, appropriate formality?
- Uses DeepSeek API as judge LLM (cheap, good enough for scoring)
- Output: per-question scores + aggregate score card

#### Task 1.9: Create synthesizer.py (30 min)
- Path: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/agents/synthesizer.py`
- Reads all report JSONs from `automa/reports/nightly/`
- Produces unified `nightly-report.json`:
```json
{
  "date": "2026-03-24",
  "scores": {"galileo_avg": 4.1, "action_compliance": 92, "completion_rate": 88},
  "bugs_found": [...],
  "auto_fixable": [...],
  "needs_human_decision": [...],
  "trend": {"galileo_avg_delta": +0.1, "vs_yesterday": "improved"}
}
```

#### Task 1.10: Electron View proof-of-concept (90 min)
This is the highest-impact visual feature of the sprint.

- **What**: Animated particles (small glowing dots) flowing through wires, showing current direction and magnitude
- **Where**: New component or overlay in the simulator canvas, toggled by a button in the toolbar
- **How**:
  - Read current values from CircuitSolver's solved state (already computed by KVL/KCL)
  - For each wire segment, create animated particles using SVG `<circle>` elements along the wire path
  - Particle speed = proportional to current magnitude
  - Particle density = proportional to current magnitude
  - Particle color = gold (< 5mA), orange (5-50mA), red (> 50mA)
  - Direction = follow conventional current flow (positive to negative)
  - Through resistors: particles slow down (resistance = difficulty)
  - At junctions: particles split into branches proportional to current split
  - Use `requestAnimationFrame` for smooth animation
  - Performance cap: max 200 particles on screen
- **Files to modify**:
  - `src/components/simulator/canvas/WireRenderer.jsx` — add particle overlay
  - `src/components/simulator/NewElabSimulator.jsx` — add toolbar toggle button
  - New file: `src/components/simulator/canvas/ElectronView.jsx` — particle system
- **Test**: Run Vol1 LED experiment in simulation mode. Toggle Electron View. Particles should flow from + rail through resistor (slower) through LED to - rail.

---

## How to Maintain Context Across Sessions

### At the END of every session, update:
1. `automa/STATE.md` — new scores, bugs fixed, bugs found
2. MEMORY.md — any new architectural decisions, resolved issues

### At the START of every session, read:
1. This kickoff prompt (or the next day's section of SPRINT-PLAN.md)
2. `automa/STATE.md`
3. `automa/reports/nightly/` — latest nightly report
4. MEMORY.md

### Nightly reports
After Day 1, the automa system generates nightly reports automatically. Each morning, the human reviews and decides. The next session's Claude Code reads the report to know what happened overnight.

---

## Critical Rules (from MEMORY.md, do NOT violate)

1. **All projects under `PRODOTTO/` subfolder.** Netlify = `PRODOTTO/newcartella`, Vercel = `PRODOTTO/elab-builder`.
2. **All env var URL reads MUST use `.trim()`** — Vercel env vars can contain trailing `\n`.
3. **Gemini is RESERVED for vision only.** Never add Gemini to text racing pools.
4. **Galileo NEVER reveals internal architecture.** No "specialista vision", no "routing model" references.
5. **Force-light theme**: static `data-theme="light"` on `<html>` tag. No dark mode.
6. **Pin map ATmega328p**: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC.
7. **BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px.**
8. **Bus naming**: `bus-bot-plus/minus` NOT `bus-bottom-plus/minus`.
9. **`npm run build` must pass before any deploy.**
10. **Deploy commands**:
    - Vercel: `cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes`
    - Render: git push to nanobot repo

---

## Tools Setup Checklist (do first)

Before starting Task 1.1:

- [ ] Verify Docker Desktop is running: `docker --version`
- [ ] Verify node/npm available: `node --version && npm --version`
- [ ] Verify project builds: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build`
- [ ] Verify nanobot is healthy: `curl -s https://elab-galileo.onrender.com/health`
- [ ] Verify Vercel site is up: `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school`

If any of these fail, fix them BEFORE starting sprint tasks.

---

## Success Criteria for Day 1

At the end of Day 1, ALL of the following must be true:

1. `docker-compose up` starts n8n + Ollama without errors
2. `automa/eval/eval-200.jsonl` contains 200 valid test cases
3. `automa/agents/galileo-tester.py` runs and produces a report
4. `automa/agents/pedagogy-sim.py` can generate student messages via Groq
5. `automa/agents/galileo-judge.py` scores responses on 5 dimensions
6. Electron View PoC shows animated particles on at least one experiment
7. `npm run build` still passes with 0 errors

If you finish early, start on Day 2 tasks (i18n infrastructure is the highest priority after Day 1).

---

## Reference: Research Summaries

These research files were generated on 22/03/2026 and contain detailed findings. Read them if you need deep context on a specific topic:

| Topic | File | Key Takeaway |
|-------|------|-------------|
| Context/Memory for Small LLMs | `docs/plans/2026-03-22-research-context-management.md` | Use ChromaDB + structured prompts + entity memory. Skip MemGPT (too complex for 3B). |
| 20 Genius Ideas | `docs/plans/2026-03-22-research-genius-ideas.md` | Top 3: Electron View, 12 Languages, School Dashboard. All medium difficulty. |
| Self-Improving AI | `docs/plans/2026-03-22-research-self-improving.md` | Start with observability + eval suite. Data flywheel takes months. Replay buffer for continual fine-tuning. |
| Academic Papers | `docs/plans/2026-03-22-research-academic-papers.md` | AI tutors improve learning 0.5-1.0 sigma. Socratic questioning > direct instruction. Multimodal > text-only. |
| Multi-Agent Orchestration | `docs/plans/2026-03-22-research-orchestration.md` | n8n is the practical choice. CrewAI/AutoGen too complex for this scale. |
| Offline EdTech | `docs/plans/2026-03-22-research-offline-edtech.md` | PWA + service workers is the right approach. Kolibri is the gold standard for offline edu. |
| Simulator Fidelity Audit | `docs/plans/2026-03-22-audit-simulator-fidelity.md` | Component-by-component comparison vs real electronics. Identifies accuracy gaps. |
| Automa v3 Architecture | `docs/plans/2026-03-22-elab-automa-v3-multi-tool.md` | Full Docker + n8n + 8 agents + 5 student profiles + 24h cycle design. |

Note: The academic papers, orchestration, and offline-edtech files are conversation logs (JSON format), not clean markdown. The actual research findings are embedded in the assistant messages within those logs. Extract the `"text"` field from the assistant messages to read the research.

---

## End of Kickoff Prompt

Start with the Tools Setup Checklist. Then Task 1.1. Go.
