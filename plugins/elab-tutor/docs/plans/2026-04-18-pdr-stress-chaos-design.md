# PDR — Stress Chaos 4×16h Mac-closed (onnipotenza verification)

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #2, R6)
**Schedule**: venerdì 18:00 → lunedì 04:00 (62h totali, split 4×16h per Managed Agents state resume)
**Branch**: `test/stress-chaos-62h`
**Dipendenze**: PDR1-3 completati + v1.0-alpha deployata staging
**Governance**: `docs/GOVERNANCE.md` regole 0-5

---

## 🎯 Obiettivo

Verificare che ELAB Tutor **regga 62h di carico continuo con Mac chiuso**, recovery automatici da chaos injection, costi contenuti. Principio: se sopravvive questo, sopravvive a 10 classi reali.

---

## ⚖️ Regola 0 — riuso

- `scripts/benchmark.cjs` già esiste (10 metriche pesate) — **RIUSA** per baseline
- `.githooks/pre-commit` regression check — **RIUSA**
- `automa/state/benchmark.json` baseline cache — **RIUSA**
- Brain V13 VPS Hostinger fallback — **RIUSA**
- Edge TTS VPS fallback — **RIUSA**

**Nuovo**:
- `tests/stress/load-patterns.js` (k6 scenarios)
- `tests/stress/chaos-injector.sh` (kill layers)
- `tests/stress/stress-reporter.js` (aggregate metrics)

---

## 📋 Task (6 sub-task)

### Task S.1 — Synthetic load patterns k6

**Tool**: k6 (load testing, open source Grafana Labs)

**20 pattern conversazione UNLIM realistici**:
1. "Ehi UNLIM, spiegami v1-cap6-esp1" (citazione libro attesa)
2. "Guarda il mio circuito" + screenshot LED inverted
3. "Come funziona il resistore?" (RAG retrieval)
4. "Carica esperimento 5" (action execution)
5. "Non funziona!" (proactive diagnosis)
6. Multilingue: "Explain this in English"
7. Wake word trigger: [audio "Ehi UNLIM"]
8. TTS playback request
9. Sequence multi-step: monta circuito + compila + play
10. Memoria cross-session: "Ti ricordi ieri..."
11. ... (20 totale)

**Scenario load**:
- 50 virtual users concorrenti
- 60h continue
- Ramp-up: 5 min 0→50 users
- Steady: 50 users per 50h
- Ramp-down: 5 min
- ~15000 richieste totali

**Metriche misurate**:
- Latency p50/p95/p99 per endpoint
- Error rate %
- Throughput req/s
- UNLIM quality degradation (canary tests ogni ora)

**File**: `tests/stress/load-patterns.js` (k6 script)

### Task S.2 — Chaos injection scheduler

**Ogni 2 ore, kill random layer per 10 min**:

```bash
#!/bin/bash
LAYERS=("edge-function" "openclaw" "runpod-llm" "runpod-tts" "runpod-vision" "brain-v13" "supabase-db")

while true; do
  sleep 7200  # 2h
  LAYER=${LAYERS[$RANDOM % ${#LAYERS[@]}]}
  echo "[$(date)] CHAOS: killing $LAYER for 10min"
  ./kill_layer.sh $LAYER
  sleep 600  # 10min down
  ./restore_layer.sh $LAYER
  echo "[$(date)] CHAOS: $LAYER restored"
done
```

**File**: `tests/stress/chaos-injector.sh`

**Exit criteria chaos**:
- Ogni kill → system fa failover in <30s
- Recovery post-restore: <60s
- Error rate durante chaos <5% (fallback chain funziona)

### Task S.3 — Managed Agent state resume (split 4×16h)

**Perché split**: Anthropic Managed Agents beta, durata singola session non documentata (probabile timeout 24h). Split in 4 segmenti:
- S1: Ven 18:00 → Sab 10:00 (16h)
- S2: Sab 10:00 → Dom 02:00 (16h)
- S3: Dom 02:00 → Dom 18:00 (16h)
- S4: Dom 18:00 → Lun 10:00 (14h totale 62h)

Ogni segmento: state persistence via Managed Agents API, resume prossimo.

**File**: `openclaw/stress_orchestrator.py` (coordina split)

### Task S.4 — Cost cap + auto-throttle

**Limits hard**:
- Totale test: <€40 (RunPod + Supabase + Vercel)
- Burn rate: <€1/h (alert se supera)
- Auto-throttle: se €2/h → riduce concurrent users da 50 → 25

**Implementazione**:
- Cost tracker routine R15 invia metrics
- Stress orchestrator legge e reagisce

### Task S.5 — Monitoring dashboard

**Grafana dashboard dedicato** (temporaneo per 62h):
- Real-time latency graph
- Error rate
- Cost burn
- Chaos injection events markers

**URL**: `https://grafana.elabtutor.school/stress-62h-2026-04-25`

### Task S.6 — Report finale + presentation

**Lunedì 04:00** (post ramp-down):
- Genera `docs/audits/2026-04-stress-62h-report.md`
- Sezioni:
  - Metriche aggregate (p50/95/99, error rate, cost)
  - Chaos events (14 kill totali in 62h) con recovery time
  - Canary quality tests hourly
  - UNLIM degradation over time (se c'è)
  - Regressioni rilevate (deve essere 0)
  - Raccomandazioni per v1.0 launch

Telegram Andrea `/stress-report` → link PDF.

---

## 🔬 Exit criteria PDR Stress (gate per v1.0 launch)

- [ ] Uptime aggregato > **99%**
- [ ] p95 latency < **2s** (con fallback)
- [ ] Error rate < **0.5%**
- [ ] Cost totale < **€40**
- [ ] Zero regressioni baseline (15660 test PASS pre/post)
- [ ] Tutti 14 chaos events recovered <60s
- [ ] Quality degradation UNLIM <5% (canary tests)
- [ ] Auditor APPROVE
- [ ] Report pubblicato `docs/audits/`

## 🚨 Rischi PDR Stress

| Rischio | Prob | Mitigation |
|---------|------|------------|
| RunPod chiude endpoint idle | Media | Active worker config (30% discount) |
| Managed Agents timeout 24h | Alta | Split 4×16h con state resume |
| Cost overrun | Bassa | Hard cap + auto-throttle |
| Catastrophic regression durante stress | Bassa | Regression Hunter auto-revert |
| k6 crash Mac-closed | Media | k6 gira su Hetzner CX52 OpenClaw, non Mac |

---

**Gate cruciale v1.0**: se stress 62h non passa exit criteria → **no v1.0 launch, iterate fix**. Onestà assoluta.
