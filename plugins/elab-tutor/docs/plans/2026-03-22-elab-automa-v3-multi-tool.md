# ELAB Automa v3 — Multi-Tool 24/7 Self-Improving System

**Data**: 22/03/2026
**Versione**: 3.0
**Stato**: Da implementare
**Prerequisiti**: Docker Desktop, abbonamenti ChatGPT Plus + Gemini + Claude Code, API key Kimi + DeepSeek + Groq

---

## Principio

Un docker-compose sul Mac M1 che orchestra 7+ tool AI per testare, migliorare, e far evolvere ELAB Tutor 24 ore al giorno. Usa gli abbonamenti già pagati (costo extra ~$0). Ogni mattina produce un report con: cosa ha trovato, cosa ha fixato, cosa serve la tua decisione.

---

## Tool Ecosystem

| Tool | Auth | Costo extra | Usa per |
|------|------|-------------|---------|
| **Claude Code** | Abbonamento attivo | $0 | Coding, bug fix, Ralph Loop, feature dev |
| **Codex CLI** (ChatGPT Plus) | OAuth browser | $0 | Code review, alternative impl, judging |
| **Gemini CLI** | Google OAuth | $0 | Ricerca, analisi 1M context, doc review |
| **OpenCode + Kimi K2.5** | API key Moonshot | $0 (o ~$0.60/M) | Visual test, screenshot audit, design fix |
| **Ollama** | Locale | $0 | Brain routing, LLM offline |
| **DeepSeek API** | API key | ~$0.28/M tokens | Bulk testing economico, fallback |
| **Groq API** | API key | ~$0 free tier | Fast inference per classi simulate |
| **n8n** | Self-hosted Docker | $0 | Scheduler, monitor, glue, webhook |
| **AutoResearchClaw** | Locale + LLM API | ~$1/run | Paper, competitor analysis (mensile) |
| **claude-octopus** | Plugin Claude Code | $0 | Debate multi-AI su decisioni critiche |

---

## Docker Compose Architecture

```yaml
# docker-compose.yml — ELAB Automa
version: "3.8"

services:
  # === ALWAYS-ON ===

  n8n:
    image: n8nio/n8n:latest
    ports: ["5678:5678"]
    volumes:
      - n8n_data:/home/node/.n8n
      - ./shared:/shared          # report, artifact condivisi
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    restart: always

  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama_data:/root/.ollama
    restart: always
    # Modelli: galileo-brain (1.3GB) + qwen2.5:1.5b (986MB)

  # === ON-DEMAND (triggerati da n8n) ===

  elab-local:
    build: ../elab-local
    ports: ["8000:8000"]
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - ELAB_BRAIN_MODEL=galileo-brain
      - ELAB_LLM_MODEL=qwen2.5:1.5b
    depends_on: [ollama]
    profiles: ["audit"]           # si accende solo durante audit

  autoresearch:
    build: ./autoresearch
    volumes:
      - ./shared:/shared
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    profiles: ["research"]        # si accende solo per research task

volumes:
  n8n_data:
  ollama_data:
```

I tool CLI (Claude Code, Codex, Gemini CLI, OpenCode) NON sono in Docker — girano nativi sul Mac perché richiedono OAuth browser e accesso al filesystem del progetto.

---

## Ciclo 24h

### 🌅 MATTINA (07:00-08:00) — Report + Decisioni

n8n invia su WhatsApp il **Morning Report**:
```
ELAB Automa — Report 22/03/2026

🟢 Uptime: 99.8% (1 blip Render alle 03:12)
🟡 3 bug trovati stanotte (2 auto-fixati, 1 serve decisione)
📊 Galileo score: 4.2/5 (era 4.1 ieri)
🎯 Completion rate sintetica: 91% (+2%)
🔧 Auto-fix: green LED Vf corretto, 2 CSS overflow iPad
⚠️ Decisione richiesta: esperimento v2-cap8-esp1 ha quiz score 2.1/5
📚 Nuovo paper trovato: "Adaptive Scaffolding for Circuit Tutors" (Stanford)

Azioni disponibili:
1️⃣ Approva fix e deploya
2️⃣ Rivedi i fix prima del deploy
3️⃣ Ignora per oggi
```

Tu rispondi con un numero. n8n esegue.

### ☀️ GIORNO (09:00-18:00) — Miglioramento continuo

Ogni 2 ore, n8n triggera un ciclo leggero:

| Ora | Task | Tool | Durata |
|-----|------|------|--------|
| 09:00 | Health check tutti i servizi | n8n | 10s |
| 09:05 | Screenshot ELAB su 3 viewport (mobile, tablet, desktop) | OpenCode+Kimi | 2 min |
| 09:10 | Confronta screenshot vs ieri → trova regressioni visive | Kimi K2.5 vision | 1 min |
| 11:00 | 10 messaggi test a Galileo (azioni + teoria) | Codex CLI (judge) | 3 min |
| 11:05 | Score risposte Galileo | Gemini CLI (1M context, vede tutto) | 2 min |
| 13:00 | Build check + lint | Script locale | 30s |
| 15:00 | Competitive scan (cosa fanno Tinkercad, Wokwi, Arduino.cc) | Gemini CLI | 5 min |
| 17:00 | Content check: 10 esperimenti random, verifica integrità | Script + DeepSeek | 2 min |
| 17:30 | Daily summary → nota per il morning report di domani | n8n | 10s |

### 🌙 NOTTE (02:00-06:00) — Audit profondo + Fix automatici

Il ciclo pesante. Mac resta acceso.

**02:00 — FASE 1: 8 Agenti Audit in parallelo (1 ora)**

| Agente | Tool | Cosa fa |
|--------|------|---------|
| bug-hunter | Claude Code (headless) | `npm run build`, cerca pattern pericolosi, testa endpoint API |
| galileo-tester | Codex CLI | 50 messaggi al nanobot, domande di ogni tipo |
| galileo-judge | Gemini CLI | Valuta le 50 risposte: correttezza, pedagogia, sicurezza (1-5) |
| pedagogy-sim | Groq API | Classi simulate: Sofia(10), Marco(12), Luca(14), Prof.ssa Rossi |
| design-screener | OpenCode+Kimi | Screenshot su 5 viewport, touch target, overflow, Lighthouse |
| content-checker | DeepSeek API | 62 esperimenti: pin, connections, quiz, buildSteps |
| business-analyst | Gemini CLI | Analytics Vercel, SEO check, competitor update |
| research-scanner | Gemini CLI | Nuovi paper su arXiv/Scholar (AI tutoring, electronics ed) |

**03:00 — FASE 2: Sintesi (15 min)**

Un **agente sintetizzatore** (Claude Code) legge tutti gli 8 report e produce:
- `nightly-report.json` con priorità unificate
- Lista fix automatizzabili vs fix che servono decisione umana
- Score card aggiornata

**03:15 — FASE 3: Auto-fix (2 ore)**

| Tipo fix | Tool | Gate |
|----------|------|------|
| Bug codice (P2+) | Claude Code Ralph Loop | Auto se test passano |
| CSS/visual (P2+) | OpenCode+Kimi | Auto se screenshot migliora |
| Prompt Galileo | Claude Code | Auto se eval score migliora |
| Contenuti (quiz, buildSteps) | Claude Code | Auto se integrità check passa |
| Bug critici (P0/P1) | NON auto-fixati | → Morning report per decisione |

**05:15 — FASE 4: Verifica post-fix (30 min)**

- `npm run build` ← deve passare
- 20 test rapidi a Galileo ← score deve essere ≥ pre-fix
- Screenshot 3 viewport ← confronto vs pre-fix
- Se tutto ok → commit su branch `automa/nightly-YYYY-MM-DD`
- Se qualcosa peggiora → rollback, segnala nel morning report

**06:00 — FASE 5: Preparazione morning report**

n8n compila il report da tutti gli artefatti e lo schedula per le 07:00.

### 🗓️ DOMENICA (10:00) — Ciclo settimanale

| Task | Tool | Durata |
|------|------|--------|
| Aggrega 7 nightly report | n8n | 1 min |
| claude-octopus debate sui 3 problemi più gravi della settimana | Claude + Codex + Gemini (3-way) | 15 min |
| A/B test: 2 variazioni prompt per l'esperimento con score peggiore | n8n + nanobot | Setup 5 min, run 7 giorni |
| Brain retraining check: abbastanza nuovi training examples? | Script | 1 min |
| Se sì → trigger Colab training pipeline | n8n webhook | 30 min |
| Weekly summary → WhatsApp | n8n | 10s |

### 📅 PRIMO DEL MESE — Espansione

| Task | Tool |
|------|------|
| AutoResearchClaw: competitive analysis + paper review | Container dedicato |
| Genera 3 nuovi esperimenti proposti (basati su gap trovati) | Claude Code |
| OpenCode+Kimi: mockup nuove feature (dall'idea-generator) | OpenCode |
| claude-octopus: debate su quale feature implementare prossima | Multi-AI |
| Proposta mensile → WhatsApp per approvazione | n8n |

---

## Classi Simulate (dettaglio)

### 4 Profili Studente + 1 Docente

**Sofia, 10 anni (Vol1, principiante)**
- Linguaggio: semplice, "la lucina", "il filo rosso"
- Errori: polarità LED, dimentica resistore, confonde V e A
- 15 interazioni/notte su 3 esperimenti Vol1

**Marco, 12 anni (Vol2, intermedio)**
- Linguaggio: informale, slang, "daje fallo partire"
- Errori: salta istruzioni, confonde serie/parallelo
- 15 interazioni/notte su 3 esperimenti Vol2

**Luca, 14 anni (Vol3, avanzato)**
- Linguaggio: tecnico, "spiega riga per riga il setup()"
- Errori: sintassi C++, confonde digital/analog
- 15 interazioni/notte su 2 esperimenti Vol3 + Scratch

**Prof.ssa Rossi (docente tecnologia)**
- Linguaggio: professionale, cerca materiale didattico
- Domande: preparazione lezioni, valutazione, gestione classe
- 5 interazioni/notte

**Studente problematico (edge case)**
- Parolacce, injection attempts, input vuoti, emoji spam
- Testa i filtri di sicurezza
- 10 interazioni/notte

**Totale: 60 interazioni/notte** → giudicate da Gemini/Codex → score card

---

## File Structure

```
elab-builder/
├── automa/                           # NUOVO — sistema autonomo
│   ├── docker-compose.yml            # n8n + ollama + servizi
│   ├── .env                          # API keys, passwords
│   ├── agents/                       # Script per ogni agente
│   │   ├── bug-hunter.sh             # Invoca Claude Code headless
│   │   ├── galileo-tester.py         # 50 messaggi via API
│   │   ├── galileo-judge.py          # Scoring con Gemini/Codex
│   │   ├── pedagogy-sim.py           # Classi simulate
│   │   ├── design-screener.sh        # Invoca OpenCode+Kimi
│   │   ├── content-checker.py        # 62 esperimenti integrity
│   │   ├── business-analyst.sh       # Gemini CLI analytics
│   │   ├── research-scanner.sh       # Gemini CLI paper search
│   │   └── synthesizer.py            # Combina 8 report
│   ├── profiles/                     # Profili studenti sintetici
│   │   ├── sofia-10.yml
│   │   ├── marco-12.yml
│   │   ├── luca-14.yml
│   │   ├── prof-rossi.yml
│   │   └── edge-case.yml
│   ├── eval/                         # Test suite
│   │   ├── eval-200.jsonl            # 200 test cases
│   │   └── eval-runner.py            # Esegue eval, confronta baseline
│   ├── reports/                      # Output
│   │   ├── nightly/                  # nightly-YYYY-MM-DD.json
│   │   ├── weekly/                   # weekly-YYYY-WW.json
│   │   └── monthly/                  # monthly-YYYY-MM.json
│   ├── n8n-workflows/                # Export workflow n8n
│   │   ├── health-monitor.json
│   │   ├── nightly-audit.json
│   │   ├── morning-report.json
│   │   ├── daytime-cycle.json
│   │   └── weekly-improve.json
│   └── shared/                       # Volume condiviso Docker
│       └── latest-report.json
├── elab-local/                       # Server locale (già fatto)
├── nanobot/                          # Server cloud (già fatto)
└── src/                              # Frontend (già fatto)
```

---

## n8n Workflows

### 1. health-monitor (ogni 5 min)
```
Trigger cron 5min → HTTP GET nanobot/health
                  → HTTP GET vercel site
                  → HTTP GET elab-local/health (se attivo)
                  → Se errore → WhatsApp alert
                  → Log in SQLite
```

### 2. daytime-cycle (ogni 2 ore, 09-18)
```
Trigger cron 2h → Parallel:
                   ├── Execute: screenshot.sh (OpenCode+Kimi)
                   ├── Execute: quick-test.py (10 messaggi Galileo)
                   └── Execute: build-check.sh (npm run build)
                → Collect results
                → If regression → WhatsApp alert
                → Log
```

### 3. nightly-audit (02:00)
```
Trigger cron 02:00 → Parallel (8 agenti):
                      ├── Execute: bug-hunter.sh
                      ├── Execute: galileo-tester.py
                      ├── Execute: galileo-judge.py
                      ├── Execute: pedagogy-sim.py
                      ├── Execute: design-screener.sh
                      ├── Execute: content-checker.py
                      ├── Execute: business-analyst.sh
                      └── Execute: research-scanner.sh
                   → Wait all complete
                   → Execute: synthesizer.py
                   → Execute: auto-fix pipeline
                   → Execute: verify-fixes.sh
                   → Save nightly-report.json
```

### 4. morning-report (07:00)
```
Trigger cron 07:00 → Read nightly-report.json
                   → Format WhatsApp message
                   → Send via WhatsApp API
                   → Wait for reply (1️⃣/2️⃣/3️⃣)
                   → Execute chosen action
```

### 5. weekly-improve (domenica 10:00)
```
Trigger cron Sun 10:00 → Aggregate 7 nightly reports
                       → Execute: claude-octopus debate
                       → Execute: a/b-test-setup.py
                       → Execute: brain-retrain-check.py
                       → Send weekly summary WhatsApp
```

---

## Metriche Monitorate

| Metrica | Fonte | Target | Alert se |
|---------|-------|--------|----------|
| Uptime nanobot | health-monitor | >99% | <95% per 10min |
| Build success | nightly | 100% | Qualsiasi errore |
| Galileo score medio | galileo-judge | >4.0/5 | <3.5 |
| Action tag compliance | galileo-tester | >90% | <85% |
| Completion rate sintetica | pedagogy-sim | >90% | <80% |
| Visual regression count | design-screener | 0 | >0 nuove |
| Esperimenti integrità | content-checker | 62/62 | <62 |
| Latenza p95 | health-monitor | <5s cloud | >8s |
| Security filter bypass | edge-case sim | 0 | >0 |

---

## Costi

| Voce | Mensile | Note |
|------|---------|------|
| Claude Code sub | già pagato | Coding + Ralph Loop |
| ChatGPT Plus sub | già pagato | Codex CLI via OAuth |
| Google account | già pagato | Gemini CLI via OAuth |
| Kimi | $0 o minimo | API key, basso utilizzo |
| DeepSeek API | ~$2 | Bulk testing nightly |
| Groq API | ~$0 | Free tier, classi simulate |
| Render (nanobot) | $7 | Already running |
| Vercel | $0 | Free tier |
| Docker (locale) | $0 | Docker Desktop su Mac |
| **Totale extra** | **~$2/mese** | Quasi tutto coperto da abbonamenti |

---

## Piano Implementazione — 10 Step

| Step | Cosa | Sessioni | Prerequisito |
|------|------|----------|-------------|
| 1 | `automa/` directory + docker-compose.yml (n8n + ollama) | 1 | Docker Desktop |
| 2 | n8n health-monitor workflow + WhatsApp alert | 1 | Step 1 |
| 3 | `pedagogy-sim.py` — 4 profili + 60 interazioni/notte | 2 | Step 1 |
| 4 | `galileo-tester.py` + `galileo-judge.py` — score card | 1 | Step 1 |
| 5 | `content-checker.py` — 62 esperimenti integrity | 1 | — |
| 6 | `design-screener.sh` — OpenCode+Kimi screenshot audit | 1 | OpenCode installato |
| 7 | `synthesizer.py` + `morning-report` n8n workflow | 1 | Step 3-6 |
| 8 | Auto-fix pipeline (Claude Code headless + verify) | 2 | Step 7 |
| 9 | Daytime cycle n8n workflow | 1 | Step 2 |
| 10 | Weekly improve + claude-octopus debate | 1 | Step 8 |

**Totale: ~12 sessioni.** Step 1-2 accendono il sistema base. Step 3-7 lo rendono utile. Step 8-10 lo rendono autonomo.

---

## Onestà Finale

1. **OAuth CLI tool possono rompersi.** Codex CLI e Gemini CLI dipendono da OAuth che scade. Se Google cambia il flusso auth, il design-screener si ferma. Serve monitoraggio dei tool stessi, non solo del prodotto.

2. **60 interazioni/notte non sono tante.** Con 62 esperimenti e 5 profili, ci vogliono ~30 notti per coprire tutto una volta. I pattern emergono dopo settimane, non giorni.

3. **Il Mac deve restare acceso.** Se lo chiudi, il ciclo notte salta. Serve disciplina o un Mac Mini dedicato (~$600 una tantum).

4. **claude-octopus è nuovo (v9.9.1, 22/03/2026).** Potrebbe avere bug. Non dipendere da esso per i flussi critici — usalo solo per i debate settimanali.

5. **Il vero rischio è la complessità.** 8 agenti, 5 workflow n8n, 7 tool, 4 profili studente. Se qualcosa si rompe alle 3 di notte, lo scopri alle 7. Parti semplice (Step 1-3) e aggiungi complessità solo dopo che il base funziona.
