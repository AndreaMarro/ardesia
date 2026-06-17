# AutoResearchClaw Multi-Front Research Strategy for ELAB Tutor

**Author:** RESEARCHER-B
**Date:** 2026-03-22
**Tool Version:** AutoResearchClaw v0.3.1 (aiming-lab/AutoResearchClaw)

---

## 1. Tool Overview

AutoResearchClaw is a 23-stage autonomous research pipeline that takes a topic and produces a structured research output with real citations from arXiv, Semantic Scholar, and OpenAlex. It generates hypotheses via multi-agent debate, writes and executes experiment code, performs self-critique, and outputs conference-ready LaTeX.

**Key specs:**
- Runtime: 20 min to 2+ hours per topic
- Cost: $5-15 per run (GPT-4o); cheaper with DeepSeek/Groq
- Output: paper_draft.md, paper.tex, references.bib, experiment code, charts, peer reviews
- Modes: `docs-first` (human gates), `semi-auto` (threshold gates), `full-auto` (autonomous)
- LLM providers: openai, openrouter, deepseek, minimax, acp (Claude Code, etc.)
- MetaClaw: cross-run learning (+18.3% robustness on subsequent runs)

**Critical limitation for ELAB:** AutoResearchClaw is designed for *academic paper generation*, not market research or competitor analysis. Its 23-stage pipeline (literature search, hypothesis, experiment, write paper) is optimized for arXiv/Semantic Scholar sources. For non-academic fronts, we must adapt the tool creatively by framing business questions as research topics and using `docs-first` mode with heavy human review.

---

## 2. The Six Research Fronts

### FRONT 1: Pedagogical Research

**Topic/Prompt:**
```
"Effective methods for teaching electronics and circuit design to children aged 10-14:
A systematic review of hands-on learning, simulation-based education, and gamification
approaches in STEM education for middle school students"
```

**Configuration (`config.arc.yaml`):**
```yaml
project:
  name: elab-pedagogy
  mode: semi-auto

research:
  topic: "Effective methods for teaching electronics to 10-14 year olds: hands-on learning, simulation, gamification in STEM education"
  domains: ["education", "cs"]
  daily_paper_count: 12
  quality_threshold: 3.5

llm:
  provider: deepseek
  primary_model: deepseek-chat
  fallback_models: ["gpt-4o-mini"]

experiment:
  mode: simulated

export:
  target_conference: neurips_2025
  authors: ["ELAB Research Team"]

runtime:
  max_parallel_tasks: 2
  retry_limit: 3
```

**CLI command:**
```bash
researchclaw run --config configs/pedagogy.arc.yaml \
  --topic "Effective methods for teaching electronics to 10-14 year olds: hands-on vs simulation vs gamification in STEM education" \
  --auto-approve
```

**Expected output:** Literature review of 30-60 real papers on STEM pedagogy, evidence-based ranking of teaching methods (hands-on > simulation > lecture), specific recommendations for age group 10-14, citations from journals like Journal of Research in Science Teaching, International Journal of STEM Education.

**Estimated time:** 45-90 minutes
**Estimated cost:** $5-8 (DeepSeek primary)

**Integration into ELAB:**
- Feed findings into Galileo's `tutor.yml` knowledge base (teaching methodology awareness)
- Inform the "Passo Passo" guided build mode (evidence-based step progression)
- Create a "Research-Backed Pedagogy" page on the public site for school decision-makers
- Validate ELAB's existing approach (hands-on + simulation + AI tutor) against literature

---

### FRONT 2: Competitor Analysis

**Topic/Prompt:**
```
"Comparative analysis of educational electronics simulation platforms: Tinkercad Circuits,
Wokwi, Arduino Education, Fritzing, and PhET Interactive Simulations - feature sets,
pedagogical approaches, pricing models, and user satisfaction in K-12 STEM education"
```

**Configuration:**
```yaml
project:
  name: elab-competitors
  mode: docs-first  # IMPORTANT: human review at every gate

research:
  topic: "Comparative analysis of educational electronics simulation platforms for K-12"
  domains: ["cs", "education"]
  daily_paper_count: 8
  quality_threshold: 3.0

experiment:
  mode: simulated  # No code experiments needed

openclaw_bridge:
  use_web_fetch: true   # Critical: needs live web data, not just papers
  use_browser: true      # Scrape competitor feature pages
```

**CLI command:**
```bash
researchclaw run --config configs/competitors.arc.yaml \
  --topic "Comparative analysis of Tinkercad Circuits, Wokwi, Arduino Education, Fritzing, PhET for K-12 electronics education: features, pricing, pedagogy, limitations" \
  --auto-approve
```

**Expected output:** Academic-style comparison paper with feature matrices, but HEAVILY supplemented by manual web research. AutoResearchClaw will find academic papers comparing these tools but will NOT scrape live pricing pages or feature lists autonomously.

**CRITICAL NOTE:** This is where AutoResearchClaw is WEAKEST. Academic papers rarely do detailed product comparisons. The `use_web_fetch` and `use_browser` bridge capabilities help, but expect to manually supplement with:
- Live feature comparison from each competitor's website
- Pricing scraping (Tinkercad free, Wokwi freemium, Arduino Education ~$300/classroom)
- User reviews from G2, Trustpilot, app stores
- Feature gap analysis (what ELAB has that others don't, and vice versa)

**Estimated time:** 60-120 minutes (pipeline) + 2-4 hours manual supplement
**Estimated cost:** $8-12

**Integration into ELAB:**
- Features to steal: Wokwi's real-time collaboration, Tinkercad's 3D integration, Fritzing's PCB design
- Competitive positioning page for sales materials
- Product roadmap prioritization based on competitor gaps
- Galileo knowledge: "come si confronta ELAB con Tinkercad?" answer

---

### FRONT 3: Italian STEM Market Research

**Topic/Prompt:**
```
"The Italian school market for STEM education technology: Piano Nazionale Ripresa e Resilienza
(PNRR) funding allocation for digital education, MePa/Consip procurement processes,
decision-making structures in Italian schools (Dirigente Scolastico, Animatore Digitale, DSGA),
and market size for educational technology tools in scuola secondaria di primo grado"
```

**Configuration:**
```yaml
project:
  name: elab-italy-market
  mode: docs-first  # Human review essential for business intelligence

research:
  topic: "Italian STEM education market: PNRR funding, school procurement, EdTech adoption in scuola secondaria"
  domains: ["education", "policy"]
  daily_paper_count: 10
  quality_threshold: 2.5  # Lower threshold: policy docs are less "academic"

llm:
  provider: openai
  primary_model: gpt-4o  # Better for Italian language sources
  fallback_models: ["deepseek-chat"]

openclaw_bridge:
  use_web_fetch: true  # For MIUR/Consip/MePa data
```

**CLI command:**
```bash
researchclaw run --config configs/italy-market.arc.yaml \
  --topic "Italian K-12 STEM education market: PNRR funding for digital education, MePa procurement, school decision makers, EdTech market size" \
  --auto-approve
```

**Expected output:** Mixed quality. AutoResearchClaw will find academic papers on Italian education policy and PNRR impact, but the real business intelligence (MePa listing requirements, procurement thresholds, decision-maker mapping) requires manual research on Italian government websites (acquistinretepa.it, miur.gov.it).

**CRITICAL NOTE:** This front needs the MOST manual supplementation. Key data sources AutoResearchClaw cannot access:
- MePa/Consip procurement portal (login required)
- PNRR allocation dashboards (italiadomani.gov.it)
- School budget data (openbilanci.it)
- Animatore Digitale network contacts

**Estimated time:** 60-90 minutes (pipeline) + 4-8 hours manual Italian-specific research
**Estimated cost:** $10-15

**Integration into ELAB:**
- Sales playbook: who to contact (Dirigente Scolastico vs Animatore Digitale)
- Pricing strategy aligned with PNRR budget thresholds (under EUR 5,000 direct purchase)
- MePa listing preparation checklist
- Public site: "ELAB per la Scuola" page with PNRR compliance messaging

---

### FRONT 4: Analogy Research for Teaching Electronics

**Topic/Prompt:**
```
"Effective everyday analogies for teaching electronics concepts to children: water flow analogy
for current, highway analogy for resistance, battery as pump metaphor. Systematic review of
analogy-based instruction in science education, misconception prevention, and age-appropriate
metaphor design for 10-14 year old students"
```

**Configuration:**
```yaml
project:
  name: elab-analogies
  mode: semi-auto

research:
  topic: "Analogies for teaching electronics to children 10-14: water flow, highway, everyday metaphors"
  domains: ["education", "physics"]
  daily_paper_count: 10
  quality_threshold: 3.0

experiment:
  mode: simulated

llm:
  provider: deepseek
  primary_model: deepseek-chat
```

**CLI command:**
```bash
researchclaw run --config configs/analogies.arc.yaml \
  --topic "Systematic review of everyday analogies for teaching electronics to children aged 10-14: current as water, resistance as highway, capacitor as bucket, effective metaphor design" \
  --auto-approve
```

**Expected output:** This is a STRONG use case. Science education literature is rich with analogy research (Gentner's Structure Mapping Theory, Glynn's Teaching-With-Analogies model). Expect 40+ relevant papers, structured taxonomy of analogies by concept, evidence on which analogies cause vs prevent misconceptions.

**Estimated time:** 45-75 minutes
**Estimated cost:** $5-8

**Integration into ELAB:**
- Build an `analogies.yml` for Galileo's knowledge base, mapping each electronics concept to 2-3 Italian-friendly analogies
- Enrich "Passo Passo" mode with analogy callouts at key learning moments
- Galileo prompt engineering: when explaining resistance, always offer the water pipe analogy first
- Public site content: "Come spieghiamo l'elettronica" pedagogical approach page
- CRITICAL: Flag analogies known to cause misconceptions (e.g., "electricity is used up" from battery-as-fuel analogy)

---

### FRONT 5: Accessibility Research

**Topic/Prompt:**
```
"Best practices for making educational simulation software accessible to students with
disabilities: WCAG 2.2 compliance for interactive circuit builders, screen reader compatibility
with SVG-based interfaces, motor disability accommodations for drag-and-drop interfaces,
cognitive accessibility in STEM education software, and Universal Design for Learning (UDL)
principles in educational technology"
```

**Configuration:**
```yaml
project:
  name: elab-accessibility
  mode: semi-auto

research:
  topic: "Accessibility in educational simulation software: WCAG 2.2, screen readers, motor disabilities, cognitive accessibility, UDL"
  domains: ["cs", "education"]
  daily_paper_count: 10
  quality_threshold: 3.5

llm:
  provider: openai
  primary_model: gpt-4o  # Better for nuanced accessibility guidelines
```

**CLI command:**
```bash
researchclaw run --config configs/accessibility.arc.yaml \
  --topic "Making educational simulation software accessible: WCAG 2.2, screen readers for SVG interfaces, motor disability drag-and-drop alternatives, cognitive accessibility, UDL in STEM EdTech" \
  --auto-approve
```

**Expected output:** Strong output. Accessibility in educational technology is well-researched. Expect citations from W3C WAI, CAST (UDL framework), DIAGRAM Center, DO-IT University of Washington. Specific recommendations for SVG accessibility, keyboard navigation patterns, ARIA live regions.

**Estimated time:** 45-75 minutes
**Estimated cost:** $5-10

**Integration into ELAB:**
- Direct P2 bug fixes: aria-live regions (currently missing), window.confirm replacement
- Keyboard navigation improvements beyond current S107 work
- Screen reader testing protocol for the circuit builder SVG
- Color contrast audit against WCAG 2.2 AA (current palette check)
- Motor disability: alternative to drag-and-drop (e.g., Galileo voice commands: "metti un LED sulla riga 5")
- UDL framework: multiple means of representation (visual + text + audio via Galileo)
- New "Accessibilita" section in public site for school procurement compliance

---

### FRONT 6: Offline Education Research

**Topic/Prompt:**
```
"Delivering education in low-connectivity environments: Progressive Web App (PWA) strategies,
offline-first design patterns for educational software, service worker caching for interactive
simulations, evidence from developing country education technology deployments, and
synchronization strategies for intermittent connectivity in school environments"
```

**Configuration:**
```yaml
project:
  name: elab-offline
  mode: semi-auto

research:
  topic: "Offline-first educational software: PWA strategies, service workers for simulations, low-connectivity EdTech evidence"
  domains: ["cs", "education"]
  daily_paper_count: 8
  quality_threshold: 3.0

openclaw_bridge:
  use_web_fetch: true  # For MDN/web.dev PWA docs
```

**CLI command:**
```bash
researchclaw run --config configs/offline.arc.yaml \
  --topic "Offline education delivery: PWA strategies, service worker caching for interactive simulations, evidence from low-connectivity EdTech deployments, sync patterns" \
  --auto-approve
```

**Expected output:** Mixed. Good academic literature on offline EdTech in developing countries (OLPC studies, Khan Academy Lite, Kolibri). Weaker on PWA-specific implementation for circuit simulators. Will need supplementation from web.dev, MDN, and Workbox documentation.

**Estimated time:** 45-75 minutes
**Estimated cost:** $5-8

**Integration into ELAB:**
- Service worker strategy for caching experiment definitions, component SVGs, and Galileo fallback responses
- Offline mode UX design (what works, what degrades gracefully)
- Evidence base for "ELAB works anywhere" marketing claim
- PWA manifest and install prompt implementation
- Sync strategy: queue Galileo messages when offline, send when reconnected
- Italian school context: many schools have unreliable WiFi, this is a real selling point

---

## 3. Parallel Execution Strategy

### Can AutoResearchClaw Run Multiple Topics in Parallel?

**Yes, with caveats:**

1. **Separate processes:** Run 6 independent `researchclaw run` commands, each with its own `config.arc.yaml` and output directory. The tool creates unique `artifacts/rc-YYYYMMDD-HHMMSS-<hash>/` directories per run.

2. **Resource constraints:**
   - Each run consumes LLM API calls ($5-15 per topic)
   - Total for 6 fronts: ~$30-70
   - Rate limits: if using a single OpenAI key, concurrent runs may hit RPM limits
   - Recommendation: use different providers per front (DeepSeek for 1,4,6 / GPT-4o for 3,5 / OpenRouter for 2)

3. **OpenClaw `use_sessions_spawn: true`** enables parallel sub-sessions within a single run, but this is for parallelizing stages within ONE topic, not running multiple topics.

4. **Practical parallel approach:**
```bash
# Terminal 1
researchclaw run --config configs/pedagogy.arc.yaml --auto-approve &

# Terminal 2
researchclaw run --config configs/competitors.arc.yaml --auto-approve &

# Terminal 3
researchclaw run --config configs/analogies.arc.yaml --auto-approve &

# ... etc. (stagger by 5 minutes to avoid API burst)
```

5. **MetaClaw benefit:** Enable `metaclaw_bridge.enabled: true` on ALL configs. Lessons from one run improve all subsequent runs. Run the easiest topic first (FRONT 4: analogies) to build the skill library.

### Recommended Execution Order

| Priority | Front | Reason |
|----------|-------|--------|
| 1st | FRONT 4: Analogies | Strongest fit for academic pipeline, builds MetaClaw skills |
| 2nd | FRONT 1: Pedagogy | Strong academic literature, direct product value |
| 3rd | FRONT 5: Accessibility | Well-researched domain, immediate P2 fixes |
| 4th | FRONT 6: Offline/PWA | Mix of academic + technical, informs roadmap |
| 5th | FRONT 3: Italy Market | Needs most manual supplement, start pipeline early |
| 6th | FRONT 2: Competitors | Weakest fit, most manual work needed |

---

## 4. n8n Integration

### Can AutoResearchClaw Be Triggered from n8n?

**No native integration exists.** However, it can be orchestrated via n8n using shell execution:

**Option A: n8n Execute Command Node**
```
Node: Execute Command
Command: cd /path/to/AutoResearchClaw && source .venv/bin/activate && researchclaw run --config configs/pedagogy.arc.yaml --auto-approve
Timeout: 7200000 (2 hours)
```

**Option B: n8n Webhook + Shell Script**
1. Create a webhook endpoint in n8n
2. POST `{ "topic": "...", "config": "pedagogy" }` to trigger
3. n8n Execute Command node runs `researchclaw`
4. On completion, n8n sends notification (Telegram/Discord) with artifact path

**Option C: Cron via OpenClaw Bridge**
If using OpenClaw, the `use_cron: true` bridge capability enables scheduled runs without n8n:
```yaml
openclaw_bridge:
  use_cron: true
  use_message: true  # Notify on completion
```

**Recommended approach for ELAB:** Option B. Create an n8n workflow:
1. Webhook trigger (POST with topic + config name)
2. Execute Command node (run researchclaw)
3. Read File node (load `paper_draft.md` from artifacts)
4. Telegram/Discord notification with summary
5. (Optional) Upload to Notion research database

---

## 5. API/CLI Options Summary

| Option | Type | Description |
|--------|------|-------------|
| `--topic "..."` | CLI flag | Research topic (required) |
| `--config path` | CLI flag | Config file path |
| `--auto-approve` | CLI flag | Skip human approval gates |
| `project.mode` | Config | `docs-first` / `semi-auto` / `full-auto` |
| `research.domains` | Config | Topic tags: ml, nlp, cv, rl, stats, math, bio, physics, cs, education |
| `research.daily_paper_count` | Config | Papers per search (default 8) |
| `research.quality_threshold` | Config | Min paper quality score (default 4.0) |
| `runtime.max_parallel_tasks` | Config | Concurrent experiments (default 3) |
| `runtime.retry_limit` | Config | Retries on failure (default 2) |
| `experiment.mode` | Config | sandbox / docker / ssh_remote / simulated |
| `experiment.time_budget_sec` | Config | Per-experiment timeout (increase to 600+ for complex topics) |
| `llm.provider` | Config | openai, openrouter, deepseek, minimax, acp |
| `export.target_conference` | Config | neurips_2025, iclr_2026, icml_2026 |
| `security.hitl_required_stages` | Config | Stages requiring human approval (array of stage numbers) |
| `openclaw_bridge.use_cron` | Config | Scheduled runs |
| `openclaw_bridge.use_sessions_spawn` | Config | Parallel sub-sessions |
| `openclaw_bridge.use_web_fetch` | Config | Live web search during review |
| `openclaw_bridge.use_browser` | Config | Browser-based paper collection |
| `metaclaw_bridge.enabled` | Config | Cross-run learning |

---

## 6. Expected Output Quality by Front

| Front | AutoResearchClaw Fit | Output Quality | Manual Supplement Needed |
|-------|---------------------|----------------|--------------------------|
| 1. Pedagogy | EXCELLENT | 8/10 | Low — rich academic literature |
| 2. Competitors | POOR | 3/10 | Very High — needs live web scraping |
| 3. Italy Market | POOR | 3/10 | Very High — needs Italian govt data |
| 4. Analogies | EXCELLENT | 9/10 | Low — well-studied in education research |
| 5. Accessibility | GOOD | 7/10 | Medium — supplement with W3C/WCAG docs |
| 6. Offline/PWA | MODERATE | 5/10 | Medium — supplement with web.dev/MDN |

---

## 7. Cost and Time Budget

| Front | Pipeline Time | Manual Time | API Cost | Total Effort |
|-------|--------------|-------------|----------|-------------|
| 1. Pedagogy | 60-90 min | 1-2 hrs | $5-8 | ~3 hrs |
| 2. Competitors | 60-120 min | 4-6 hrs | $8-12 | ~7 hrs |
| 3. Italy Market | 60-90 min | 4-8 hrs | $10-15 | ~9 hrs |
| 4. Analogies | 45-75 min | 0.5-1 hr | $5-8 | ~2 hrs |
| 5. Accessibility | 45-75 min | 1-2 hrs | $5-10 | ~3 hrs |
| 6. Offline/PWA | 45-75 min | 2-3 hrs | $5-8 | ~4 hrs |
| **TOTAL** | **~6 hrs** | **~13-22 hrs** | **$38-61** | **~28 hrs** |

---

## 8. Installation for ELAB

```bash
# In the elab-builder project directory
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
mkdir -p research/autoresearchclaw
cd research/autoresearchclaw

git clone https://github.com/aiming-lab/AutoResearchClaw.git .
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
pip install metaclaw  # For cross-run learning

# Create config directory
mkdir -p configs

# Copy and customize configs for each front
cp config.researchclaw.example.yaml configs/pedagogy.arc.yaml
cp config.researchclaw.example.yaml configs/competitors.arc.yaml
cp config.researchclaw.example.yaml configs/analogies.arc.yaml
cp config.researchclaw.example.yaml configs/accessibility.arc.yaml
cp config.researchclaw.example.yaml configs/offline.arc.yaml
cp config.researchclaw.example.yaml configs/italy-market.arc.yaml

# Add to .vercelignore (already excludes large dirs)
echo "research/" >> ../../.vercelignore
```

**Important:** Add `research/` to `.vercelignore` and `.gitignore` to prevent deploying research artifacts to production.

---

## 9. Honest Assessment

**Where AutoResearchClaw shines for ELAB:**
- Fronts 1 (Pedagogy) and 4 (Analogies) are perfect fits — rich academic literature, direct product value
- Front 5 (Accessibility) is a good fit — well-documented standards and research
- MetaClaw cross-run learning means each subsequent run gets better

**Where it falls short:**
- Fronts 2 (Competitors) and 3 (Italy Market) are poor fits — the tool searches academic databases, not competitor websites or government procurement portals
- No native n8n integration, requires shell command orchestration
- $38-61 API cost is modest but the 13-22 hours of manual supplement is the real cost
- Output is always "academic paper format" even when you need a product comparison matrix or a sales playbook

**Recommendation:** Use AutoResearchClaw for Fronts 1, 4, and 5 (total ~8 hrs, ~$15-26). For Fronts 2, 3, and 6, consider using a general-purpose deep research tool (Perplexity Pro, Claude with web search, or OpenClaw's Research Agent) which can access live web data rather than being limited to academic databases.
