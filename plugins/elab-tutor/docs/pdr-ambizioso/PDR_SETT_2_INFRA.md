# PDR Settimana 2 — Infrastruttura: Together AI Testing + Hetzner Setup

**Periodo**: lunedì 28/04/2026 → domenica 04/05/2026
**Owner**: Andrea Marro + Tea Lea + Team 6 agenti Opus
**Goal Settimanale**: Together AI account operativo (Llama 70B testing economico) + Hetzner Cloud VPS setup base + RunPod scale-to-zero verificato + claude-mem persistente. **Score benchmark target**: 6.5/10.

---

## 0. Strategia path testing → GDPR

**Filosofia**: testare velocemente con servizi cloud cheap (Together AI), poi migrare progressivamente a self-host EU GDPR (Hetzner + RunPod EU Amsterdam).

**Sett 2-3**: Together AI ($0.88/M tokens Llama 70B) per validare arch. Velocità > GDPR temporaneamente.
**Sett 4-5**: parallel setup self-host (BGE-M3, Voxtral) mentre Together AI continua serving.
**Sett 6-8**: switch progressivo Together AI → Hetzner self-host. Together AI fallback only.

**Risk**: GDPR violation in sett 2-3 con Together AI (US-based). **Mitigazione**: usare solo dati anonimi test, no studenti reali. Together AI EU region quando disponibile.

---

## 1. Obiettivi misurabili settimana

| Obiettivo | Metrica | Baseline | Target sett 2 |
|-----------|---------|----------|---------------|
| Together AI account + key | API key valida funzionante | no | sì |
| Llama 70B test query | Response time <3s + Principio Zero v3 OK | no | sì |
| Hetzner Cloud account + VPS | CX31 (€8.21/mese) running | no | sì |
| Docker compose base VPS | Up + healthy 24h | no | sì |
| RunPod account + serverless test | EU Amsterdam pod cold start <30s | no | sì |
| BGE-M3 endpoint test | Embedding 549 chunk OK | no | sì |
| claude-mem corpus persistente | Cross-session query OK | no | sì |
| Tea PR auto-merge ≥3 | Glossario + esperimenti additions | 0 | ≥3 |
| Test count growth | +200 nuovi test | 12056 | 12256+ |
| Score benchmark | benchmark.cjs --write | 6.0 | 6.5 |
| Documentation infra | docs/infra/setup-week2.md | no | sì |
| Team agenti dispatch ≥10 | log decisions-log.md | 5 | ≥10 cumulative |

---

## 2. Stack provider scelti — razionale

### Together AI (Sett 2-3 testing)

**Why**: 
- Llama 3.3 70B Instruct: $0.88/M input + $0.88/M output (tra i più cheap)
- API OpenAI-compatible (drop-in replacement)
- Latency 1-3s response
- No setup VPS (zero ops)

**Limits**:
- US-based (GDPR concern per studenti EU)
- No control modello (updates Together)
- Cost cresce linearmente con uso

**Use case ELAB sett 2-3**: testing arch UNLIM completo con LLM "ricco" (70B vs 7B-12B locale)

### Hetzner Cloud CX31 (Sett 2 setup)

**Why**:
- €8.21/mese 4 vCPU, 8GB RAM, 80GB SSD
- DC EU (Falkenstein/Helsinki) → GDPR compliant
- Network 20TB/mese inclusi
- snapshot + backup standard

**Use case ELAB**:
- Sett 2: setup base + docker compose
- Sett 4: BGE-M3 inference server + RAG storage
- Sett 6: Voxtral TTS deploy
- Sett 8: OpenClaw layer docente

### RunPod Serverless EU (Sett 2 setup)

**Why**:
- Scale-to-zero (paghi solo quando inferenza)
- GPU A40 €0.40/h on-demand
- EU Amsterdam region
- Container Docker custom

**Use case ELAB**:
- Sett 5+: Mistral Small 3 24B deploy on-demand
- Sett 6+: Whisper Turbo STT scale-to-zero
- Sett 7+: Vision Llava deploy on-demand

---

## 3. Task breakdown 7 giorni (sintesi)

### Lun 28/04 — Together AI account + first integration

- Andrea: signup together.ai, generate API key, $25 free credit
- DEV agente: implementa `src/services/together-ai-client.js` (OpenAI-compatible)
- TESTER agente: scrivi `tests/integration/together-ai-llama70b.test.js` (10 query test)
- ARCHITECT agente: blueprint integration UNLIM → Together AI fallback chain
- File: `giorni/PDR_GIORNO_08_LUN_28APR.md`

### Mar 29/04 — Hetzner Cloud setup base

- Andrea: signup Hetzner Cloud, crea progetto "elab-prod", aggiunge SSH key
- Andrea: deploy CX31 server, installa Ubuntu 24.04 LTS
- DEV agente: ansible playbook setup base (firewall, fail2ban, docker, docker-compose, nginx)
- DEV agente: docker-compose.yml stub (postgres, redis, traefik)
- AUDITOR agente: verifica ports closed (22 only), HTTPS forced
- File: `giorni/PDR_GIORNO_09_MAR_29APR.md`

### Mer 30/04 — RunPod serverless setup

- Andrea: signup RunPod, $20 credit add, EU Amsterdam region select
- Andrea: create serverless endpoint Mistral Small 3 24B (template Anyscale)
- DEV agente: implementa `src/services/runpod-client.js` (HTTP wrapper + retry)
- TESTER agente: cold start latency test (target <30s, warm <2s)
- File: `giorni/PDR_GIORNO_10_MER_30APR.md`

### Gio 01/05 — BGE-M3 embedding endpoint

- DEV agente: deploy BGE-M3 inference server su Hetzner (text-embeddings-inference)
- TESTER agente: PTC batch re-embed 549 chunk RAG con BGE-M3
- TESTER agente: confronto recall BGE-M3 vs OpenAI ada-002 attuale
- ARCHITECT agente: ADR migrazione embedding (BGE-M3 vince + EU)
- File: `giorni/PDR_GIORNO_11_GIO_01MAG.md`

### Ven 02/05 — claude-mem corpus persistente

- DEV agente: setup claude-mem hook auto-capture decisions
- DEV agente: build corpus completo `docs/pdr-ambizioso/`
- TPM agente: query test cross-session ("ricorda decisione DECISION-007?")
- Tea: PR glossario aggiuntivo Vol 3 cap 1-3 (auto-merge)
- File: `giorni/PDR_GIORNO_12_VEN_02MAG.md`

### Sab 03/05 — Buffer + integration test

- Buffer: completa task slittati
- AUDITOR agente: live verify tutti endpoint setup (Together AI, Hetzner, RunPod, BGE-M3)
- TESTER agente: PTC integration test stack completo
- File: `giorni/PDR_GIORNO_13_SAB_03MAG.md`

### Dom 04/05 — Handoff sett 2 + retro

- Handoff: `docs/handoff/2026-05-04-end-sett2.md`
- Retro: cosa funzionato, cosa no, decision update
- claude-mem rebuild + query verify
- File: `giorni/PDR_GIORNO_14_DOM_04MAG.md`

---

## 4. Multi-agent dispatch pattern sett 2

**Caso tipico martedì 29/04 (Hetzner setup)**:

Single message dispatch parallelo:
```
@team-architect "ADR-005: scelta Hetzner CX31 vs alternatives (DigitalOcean, Linode, Scaleway).
Output docs/decisions/ADR-005-vps-provider.md"

@team-dev "Setup ansible playbook base Hetzner CX31.
Files: infra/ansible/playbooks/base.yml + roles/.
Acceptance: docker, nginx, fail2ban, firewall, automatic updates.
Constraints: idempotent (re-run safe)."

@team-tester "Scrivi infra test bash: ssh-port-only, https-forced, healthchecks.
File: infra/tests/base-hardening.sh.
Run: ./infra/tests/base-hardening.sh <vps-ip>"

@team-auditor "Live verify post-setup: nmap port scan, curl /health, ssh hardening check.
Output docs/audits/2026-04-29-hetzner-setup-onesto.md"
```

---

## 5. Programmatic Tool Calling — sett 2

### Use case sett 2

1. **PTC test 10 Together AI query parallel**: confronto latency + cost
2. **PTC ansible run on multiple Hetzner servers** (futuro scaling)
3. **PTC RunPod cold start measurement** (10 cold start sequence)
4. **PTC BGE-M3 batch re-embed 549 chunk** (vedi PROGRAMMATIC_TOOL_CALLING.md use case 5)
5. **PTC claude-mem corpus rebuild + query test** (sequence)

---

## 6. Costi settimana 2

| Voce | Costo |
|------|-------|
| Together AI ($25 free credit, ~50K query test) | €0 |
| Hetzner Cloud CX31 (proporzionato 4 giorni) | ~€1.10 |
| RunPod ($20 credit, ~50h GPU testing) | €0 |
| Domain name (se non già attivo) | ~€10 (one-off) |
| **TOTALE settimana 2** | **~€11** |

Cumulative 8 sett: vedi `PDR_GENERALE.md` per breakdown finale.

---

## 7. Definition of Done sett 2

- [x] Together AI key + 10 test query PASS
- [x] Hetzner CX31 running + hardened (ports, fail2ban, https)
- [x] Docker-compose base operativo
- [x] RunPod serverless Mistral 3 24B endpoint creato
- [x] BGE-M3 embedding server up + 549 chunk re-embedded
- [x] claude-mem corpus pdr-ambizioso buildato + query OK
- [x] Tea PR auto-merge ≥3 (glossario aggiuntivo)
- [x] Score benchmark ≥6.5
- [x] Test count ≥12256
- [x] Handoff doc completo
- [x] Documentation `docs/infra/setup-week2.md`

---

## 8. Rischi sett 2

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Together AI credit esaurito veloce | Media | Cap query test 10K iniziali |
| Hetzner CX31 sold out region preferita | Bassa | Fallback Helsinki o Nuremberg |
| RunPod cold start >60s (target <30s) | Media | Plan B: Modal Labs alternative |
| BGE-M3 recall < OpenAI ada-002 | Bassa | Plan B: stick OpenAI sett 2-4, switch sett 5 |
| claude-mem hook conflict altri hook | Media | Ordine hook order configurabile |
| GDPR concern Together AI esposto | Alta | Explicit no-PII dataset, anonymous only |

---

## 9. Skills + MCP usati sett 2

**Skills**:
- `superpowers:writing-plans` (PDR daily)
- `superpowers:test-driven-development` (test ogni endpoint)
- `claude-code-guide` (claude-mem hook setup)

**MCP**:
- `cloudflare` (DNS configuration eventuale)
- `vercel` (env var update)
- `context7` (docs Together AI, Hetzner, RunPod)
- `plugin_claude-mem_mcp-search` (corpus build + query)

---

## 10. Comunicazione team sett 2

- Mer 30/04 18:00 — call settimanale (1h Telegram)
- Sab 03/05 (opzionale) — call BOM hardware finalizzazione

---

## 11. Self-critica brutale

- **Ambizioso**: 4 stack provider in 7 giorni. Realistic: 2-3 OK, 1 può slittare sett 3.
- **Together AI vs GDPR**: rischio reputation se docenti scoprono dati US. Mitigare con disclaimer + roadmap public.
- **Hetzner setup**: ansible OK ma debugging issues può costare 1 giorno extra.
- **RunPod cold start 30s**: per UNLIM real-time è troppo. Plan B: keep-alive ping ogni 5 min (cost +€10/mese).

**Cosa NON facciamo sett 2**:
- ❌ Voxtral TTS deploy (sett 6)
- ❌ Edge Function bridge OpenClaw (sett 3)
- ❌ Multi-agent orchestrator runtime (sett 3)
- ❌ Production switch (Together AI ancora primary)

---

**Forza ELAB. Sett 2 inizia lunedì 28/04.**
