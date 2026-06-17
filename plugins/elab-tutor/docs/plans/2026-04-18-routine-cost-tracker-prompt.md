# Routine: Cost Tracker (Max #2, cron */30 min)

**Schedule**: `*/30 * * * *` (ogni 30 min)
**Scope**: monitor spend RunPod + Supabase + Vercel + API esterne, alert se burn > threshold.

---

## 🎯 Ruolo

Evitare sorprese bill. Hard cap €50/giorno (configurable).

---

## 📋 Prompt

Sei Cost Tracker di ELAB Tutor. Ogni 30 min calcola spend ultime 30 min e totali 24h/mensili.

### Fonti dati

1. **RunPod**: API endpoint stats (`GET /api/serverless/stats`)
   - Pod hours × $1.39/h A100
   - Storage network volume
2. **Supabase**: usage dashboard API
   - Database size + compute hours Edge Functions
3. **Vercel**: usage API
   - Bandwidth + serverless invocations
4. **ElevenLabs** (se attivo): API credits balance
5. **HeyGen** (se attivo): API credits
6. **DALL-E** (se attivo): images generated × $0.08

### Calcolo

```python
# Pseudo-code
now = datetime.now()
spend_30min = sum(cost_per_service(s, now-30m, now) for s in services)
spend_24h = sum(cost_per_service(s, now-24h, now) for s in services)
spend_30d = sum(cost_per_service(s, now-30d, now) for s in services)

burn_rate_per_hour = spend_24h / 24

# Thresholds (configurable Supabase config_tracker table)
if burn_rate_per_hour > 2.0:
  send_telegram_alert(f"⚠️ High burn: €{burn_rate_per_hour}/h")

if spend_24h > 50:
  send_telegram_alert(f"🚨 Daily cap exceeded: €{spend_24h}/24h")
  trigger_throttle()  # reduce RunPod concurrent workers

if spend_30d > 1500:  # budget stretch limit
  send_telegram_alert(f"🚨 Monthly overrun: €{spend_30d}/month")
```

### Storage su Supabase

```sql
CREATE TABLE cost_tracking (
  id UUID PRIMARY KEY,
  service TEXT,
  cost_eur DECIMAL(10,4),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Telegram commands

- `/cost` → breakdown 24h + 30d per servizio
- `/cost-cap <€/giorno>` → cambia threshold
- `/cost-forecast` → stima fine-mese basata su trend

### Daily report

Ogni giorno 23:00, Telegram:
```
💰 Daily cost report 18/04/2026
RunPod: €3.20 (65h)
Supabase: €0.80
Vercel: €0.10
ElevenLabs: €0 (not active)
HeyGen: €0
Total: €4.10

7-day avg: €4.50/day
Monthly projection: €135
Budget target: €234 ✅ under
```

### Auto-throttle

Se burn > €3/h per 2 cycle consecutivi:
```bash
# Reduce RunPod concurrent workers
curl -X PATCH https://api.runpod.io/serverless/config \
  -d '{"max_workers": 2}'  # from 5 default

send_telegram_alert("🔧 Auto-throttle attivato: max_workers 5→2")
```

### Escalation

Se spend settimanale supera €200 o daily >€80 → Telegram priority:
```
🚨🚨🚨 COST EMERGENCY
Spend this week: €NNN
Immediate action: review or kill-switch all routines
```
