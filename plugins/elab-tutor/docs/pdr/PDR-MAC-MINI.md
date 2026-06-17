# PDR Mac Mini — Infrastructure setup ELAB Tutor

**Hardware**: Mac Mini M4 16GB always-on Strambino
**Strategia**: 3 livelli incrementali (loop CLI, GH runner, Supabase local)
**Tempo stimato**: 3 giorni totale (1 giorno per livello)

---

## Livello 1 — Loop CLI H24

### Stato attuale
Loop `caffeinate -i scripts/cli-autonomous/loop-forever.sh` running. Verifica post-reboot persistenza.

### Tasks
- [ ] **L1.1** Verifica processo attivo: `ps aux | grep caffeinate`
- [ ] **L1.2** Setup launchd plist persistente
  - File: `~/Library/LaunchAgents/com.elab.loop-forever.plist`
  - `RunAtLoad true`, `KeepAlive true`, `StandardOutPath`/`StandardErrorPath` log
  - `launchctl load -w ~/Library/LaunchAgents/com.elab.loop-forever.plist`
- [ ] **L1.3** Monitor uptime via `automa/state/heartbeat`
- [ ] **L1.4** Restart automatic se crash (KeepAlive)
- [ ] **L1.5** Doc setup steps `docs/infra/MAC-MINI-LIVELLO-1.md`

### Verifica
- Reboot test → loop riprende automaticamente
- 24h monitor → uptime ≥ 99%

---

## Livello 4 — GitHub Actions self-hosted runner

### Obiettivo
Velocità CI 3-5x vs GitHub-hosted (target: vitest baseline da 50s → 15-20s).

### Tasks
- [ ] **L4.1** Generate runner registration token GitHub
  - Settings → Actions → Runners → New self-hosted runner
  - macOS arm64
- [ ] **L4.2** Install runner sul Mac Mini
  - Download tar runner
  - `./config.sh --url https://github.com/AndreaMarro/elab-tutor --token TOKEN --labels self-hosted,mac-mini,arm64,m4`
  - `./svc.sh install` per launchd service
- [ ] **L4.3** Verify runner online status GitHub UI
- [ ] **L4.4** Update workflows `.github/workflows/*.yml`:
  - Selective: `runs-on: [self-hosted, mac-mini]` per heavy job
  - Mantieni `runs-on: ubuntu-latest` per safety fallback
- [ ] **L4.5** Benchmark velocità vs GitHub-hosted
- [ ] **L4.6** Doc workflow assignment `docs/infra/MAC-MINI-LIVELLO-4.md`

### Sicurezza
- Runner solo per repo privato `elab-tutor`
- Token rotation ogni 30 giorni
- NO secrets su Mac Mini fisico (usa GitHub Secrets)

### Verifica
- Run workflow → assigned self-hosted
- Confronto tempo: GitHub-hosted 50s vs Mac Mini 15-20s expected
- Failover: se Mac Mini offline → fallback ubuntu-latest

---

## Livello 5 — Supabase local staging Docker

### Obiettivo
Test Edge Functions localmente prima deploy production.

### Tasks
- [ ] **L5.1** Install Docker Desktop Mac
- [ ] **L5.2** `supabase init` (se non già)
- [ ] **L5.3** `supabase start` → local Postgres + storage + Edge Functions runtime
- [ ] **L5.4** Sync schema da remote
  - `supabase db dump --schema public > db/schema.sql`
  - `supabase db push --local`
- [ ] **L5.5** Seed minimal data (no PII)
- [ ] **L5.6** Edge Functions local serve
  - `supabase functions serve unlim-chat --env-file .env.local`
  - Test endpoint: `curl http://localhost:54321/functions/v1/unlim-chat -d '{...}'`
- [ ] **L5.7** Deploy staging → local before production
- [ ] **L5.8** Doc setup `docs/infra/MAC-MINI-LIVELLO-5.md`

### Verifica
- 5 prompt benchmark suite eseguibili local
- Tempo iter Edge Function da deploy prod-only ~5min → local 5sec

---

## Cross-cutting

### Monitoring
- Status Mac Mini: `docs/infra/MAC-MINI-STATUS.md` aggiornato giornaliero
- Alert canale: Telegram bot OpenClaw notification
- Uptime SLA target 99%

### Backup
- Mac Mini è SPOF (Single Point Of Failure) per CI + Supabase local
- Mitigation: workflows fallback ubuntu-latest, Supabase local è dev-only (prod su Supabase Cloud)

### Costi
- Mac Mini hardware: già acquistato (one-time)
- Energy: ~6-8W idle, ~30W active = €4-5/mese elettricità
- GitHub Runner: gratis (self-hosted)
- Supabase Local: gratis (Docker)
- **Totale running cost: ~€5/mese**

---

## Timeline

- Day 1: Livello 1 (loop CLI H24 + launchd)
- Day 2: Livello 4 (GitHub Runner + workflows update)
- Day 3: Livello 5 (Supabase Local + Edge Functions serve)

Post setup: 1-2 giorni stabilizzazione + monitoring.

---

## Risk

| Rischio | Severità | Mitigazione |
|---------|---------|-------------|
| Mac Mini offline | MEDIA | Workflow fallback ubuntu-latest |
| launchd crash loop | BASSA | KeepAlive + log monitoring |
| Runner token leak | ALTA | Token rotation + repo private |
| Supabase Local schema drift | MEDIA | `db diff` periodic sync |

---

**Verdetto**: 3 giorni setup, ~€5/mese running cost, accelera CI 3-5x + dev velocity Edge Functions iter 60x.
