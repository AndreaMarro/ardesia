---
name: automa-manager
description: "Gestisce il loop automa ELAB: status, start/stop, task queue, budget, CoV. Usa quando l'utente chiede 'come va l'automa', 'stato del loop', 'aggiungi task', 'ferma automa', 'budget', 'score', 'cicli', 'coda task', 'automa status', 'autoresearch'."
---

# ELAB Automa Manager

## Architettura del sistema

L'automa ELAB è un loop autonomo che migliora iterativamente il prodotto.

```
start.sh → orchestrator.py --loop (ogni 60 min)
  ├── 7 CHECK: health, build, galileo, content, gulpease, browser, iPad
  ├── SELECT MODE: IMPROVE (claude -p, gratis) | RESEARCH/WRITE/EVOLVE (API Anthropic)
  ├── PICK TASK: automa/queue/pending/*.yaml
  ├── RUN AGENT: claude -p per code changes, API per ricerca
  ├── EVALUATE: automa/evaluate.py → composite score
  └── LOG: results.tsv + reports/ + state.json + budget
```

### Engine per mode

| Mode | Engine | Costo | Perché |
|------|--------|-------|--------|
| IMPROVE | `claude -p` | €0 (gratis) | Ha Edit/Write/Bash/git nativi — perfetto per code changes |
| AUDIT | `claude -p` | €0 (gratis) | Può navigare, fare screenshot, trovare bug |
| RESEARCH | API Anthropic | ~€2-5/ciclo | Serve DeepSeek/Gemini/Kimi/SemanticScholar |
| WRITE | API Anthropic | ~€1-3/ciclo | Serve AI scoring per validare articoli |
| EVOLVE | API Anthropic | ~€1-2/ciclo | Serve analisi multi-LLM |

### File chiave

```
automa/
├── orchestrator.py     — cervello del loop
├── agent.py            — wrapper Anthropic API + 16 tool (per RESEARCH)
├── tools.py            — DeepSeek, Gemini, Kimi, SemanticScholar
├── evaluate.py         — composite score (7 metriche) — DO NOT MODIFY
├── context_db.py       — SQLite per knowledge persistente
├── program.md          — istruzioni autoresearch
├── PDR.md              — Priority Development Roadmap
├── start.sh            — launcher bash
├── .env                — API keys
├── results.tsv         — log esperimenti
├── state/state.json    — stato loop + budget
├── state/last-eval.json — ultimo composite score
├── queue/              — pending/ active/ done/ failed/
├── reports/            — JSON per ciclo
├── knowledge/          — ricerche (markdown)
└── nanobot/nanobot.yml — system prompt Galileo (MODIFICABILE!)
```

## Comandi rapidi

Quando l'utente chiede qualcosa sull'automa, usa questi:

### Status
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
# Processo vivo?
pgrep -f "orchestrator.py" && echo "RUNNING" || echo "STOPPED"
# Stato
python3 -c "import json; s=json.load(open('automa/state/state.json')); print(json.dumps(s, indent=2))"
# Score
cat automa/state/last-eval.json | python3 -m json.tool
# Budget
python3 -c "import json; s=json.load(open('automa/state/state.json')); b=s.get('budget',{}); print(f'Oggi: €{b.get(\"spent_today_eur\",0):.2f} ({b.get(\"tokens_today\",0):,} tokens) | Mese: €{b.get(\"spent_month_eur\",0):.2f}')"
# Coda
echo "pending:"; ls automa/queue/pending/ 2>/dev/null; echo "done: $(ls automa/queue/done/ | wc -l)"; echo "failed: $(ls automa/queue/failed/ | wc -l)"
```

### Start/Stop
```bash
# Start
cd "VOLUME 3/PRODOTTO/elab-builder" && rm -f automa/HALT && nohup python3 automa/orchestrator.py --loop >> automa/logs/orchestrator-$(date +%Y%m%d).log 2>&1 &
# Stop (graceful)
touch "VOLUME 3/PRODOTTO/elab-builder/automa/HALT"
# Stop (immediato)
pkill -f "orchestrator.py"
```

### Aggiungi task
```yaml
# File: automa/queue/pending/P{priority}-{id}.yaml
id: short-id
priority: P2
title: "Titolo breve"
description: |
  Descrizione dettagliata con:
  1. Quale file modificare
  2. Cosa cambiare esattamente
  3. Come verificare (comando specifico)
  4. Come fare deploy se serve
tags: area1,area2
```

### Monitoraggio ciclo
```bash
# Log in tempo reale
tail -f "VOLUME 3/PRODOTTO/elab-builder/automa/logs/orchestrator-$(date +%Y%m%d).log"
# Ultimi risultati
cat automa/results.tsv
# Report ultimo ciclo
ls -t automa/reports/2026-*.json | head -1 | xargs python3 -m json.tool
```

## Chain of Verification (CoV) per l'automa

Quando l'utente chiede "come va?" o "fai CoV", esegui TUTTI questi check:

```bash
echo "=== 1. PROCESSO ==="
pgrep -f orchestrator.py && echo "PASS" || echo "FAIL: loop morto"

echo "=== 2. BUILD ==="
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -1

echo "=== 3. COMPOSITE SCORE ==="
python3 -c "import json; print(f'composite: {json.load(open(\"automa/state/last-eval.json\"))[\"composite\"]}')"

echo "=== 4. BUDGET ==="
python3 -c "import json; b=json.load(open('automa/state/state.json')).get('budget',{}); print(f'Oggi: €{b.get(\"spent_today_eur\",0):.2f} | Mese: €{b.get(\"spent_month_eur\",0):.2f} | Limite: €{b.get(\"monthly_limit_eur\",50)}')"

echo "=== 5. CODA ==="
echo "pending: $(ls automa/queue/pending/*.yaml 2>/dev/null | wc -l) | done: $(ls automa/queue/done/ | wc -l) | failed: $(ls automa/queue/failed/ | wc -l)"

echo "=== 6. RESULTS.TSV ==="
wc -l < automa/results.tsv && tail -3 automa/results.tsv

echo "=== 7. ULTIMO CICLO ==="
python3 -c "import json; s=json.load(open('automa/state/state.json')); print(f'Ciclo {s[\"loop\"][\"cycles_today\"]}, ultimo: {s[\"loop\"][\"last_cycle\"]}')"

echo "=== 8. FILES CHANGED (git) ==="
git diff --stat HEAD~3 2>/dev/null || echo "(no recent commits)"

echo "=== 9. HEALTH ==="
curl -s https://elab-galileo.onrender.com/health | python3 -m json.tool 2>/dev/null || echo "nanobot: DOWN"
curl -sI https://www.elabtutor.school | head -1

echo "=== 10. SYNTAX ==="
python3 -c "import ast; ast.parse(open('automa/orchestrator.py').read()); ast.parse(open('automa/agent.py').read()); print('OK')"
```

## Regole per l'utente

- **Budget**: €50/mese. IMPROVE è gratis (claude -p). Solo RESEARCH/WRITE/EVOLVE costano.
- **Target**: composite ≥ 0.90 (settimana 1), ≥ 0.93 (settimana 2)
- **Baseline**: composite = 0.8872 (primo evaluate)
- **Attuale**: leggere da last-eval.json
- **Brain VPS**: http://72.60.129.50:11434 (galileo-brain-v13)
- **Nanobot**: https://elab-galileo.onrender.com
- **Vercel**: https://www.elabtutor.school
