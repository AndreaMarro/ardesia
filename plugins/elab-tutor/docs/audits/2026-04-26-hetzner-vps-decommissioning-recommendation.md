---
sprint: S
iter: 4 partial (autonomous loop tick 22)
type: infrastructure recommendation
date: 2026-04-26 (post user query "come va onnipotenza con hetzner?")
target: VPS VPS-72-60-129-50 72.60.129.50
mode: caveman + max onestà
---

# VPS-72-60-129-50 VPS — Stato e raccomandazione decommissioning

## Test live 2026-04-26 18:21Z

| Servizio | Endpoint | HTTP | Latenza | Output |
|----------|----------|------|---------|--------|
| Brain V13 Ollama | `http://72.60.129.50:11434/api/tags` | 200 | <1s | 2 modelli (galileo-brain + galileo-brain-v13) |
| Brain V13 inference | `http://72.60.129.50:11434/api/generate` | 200 | 12.2s | JSON intent OK ("Cosa è un LED?" → tutor classification) |
| Edge TTS root | `http://72.60.129.50:8880/` | 000 timeout | 5s | DOWN |
| Edge TTS /tts POST | `http://72.60.129.50:8880/tts` | 000 timeout | 5s | DOWN |

## Diagnosi

### Brain V13 — alive ma deprecato

**Funziona**:
- Ollama serve, 2 modelli caricati (Qwen35 1.9B Q5_K_M = 1.4 GB ciascuno)
- Inference ~12s per 65 token output (3.3s load + 6.7s gen + 2.1s prompt eval)
- Output formato JSON per routing intent (`{"intent":"tutor","needs_llm":true,...}`)

**NON serve in critical path**:
1. **Architettura corrente** (Sprint Q+R+S): Edge Function `unlim-chat` chiama direttamente Gemini Flash-Lite/Flash/Pro (routing 70/25/5%). Brain V13 NON è invocato.
2. **Latenza inferiore Gemini Flash-Lite**: ~4-5s su Edge Function vs 12s Brain V13 VPS-72-60-129-50.
3. **Costo**: Gemini Flash-Lite $0.075/M input tokens. Brain V13 = costo VPS VPS-72-60-129-50 mensile + manutenzione.
4. **Capacità**: Gemini Flash-Lite copre molteplici task (chat + routing + tool-use). Brain V13 fa solo intent classification (1.9B model limit).
5. **Memoria precedenti** (CLAUDE.md): "routing Gemini 70/25/5" già scelta architettura. Brain V13 era POC iniziale Marzo 2026, mai entrato in produzione.

### Edge TTS — DOWN

**Sintomi**:
- Timeout 5s su HEAD + POST
- HTTP 000 (no connection established)
- CLAUDE.md prima di tick 22 sosteneva "OK verificato 16/04"

**Possibili cause**:
- Servizio crashed (no auto-restart)
- VPS riavviato + servizio non in `systemctl enable`
- Firewall block sulla porta 8880
- Processo killed da OOM

**Impatto**: NULLO sul critical path se Coqui XTTS-v2 RunPod sostituisce. Ma SPEC iter 4 §4.1 elencava Edge TTS VPS-72-60-129-50 come "TTS path no GPU" → fallback ora rotto.

## Raccomandazione

### Opzione A — DECOMMISSIONING completo (raccomandato se Coqui RunPod copre TTS)

```bash
# 1. Backup eventuale config (one-time)
ssh root@72.60.129.50 "tar czf /tmp/hetzner-backup.tgz /etc/systemd/system /opt/edge-tts /root/.ollama"
scp root@72.60.129.50:/tmp/hetzner-backup.tgz /Users/andreamarro/VOLUME\ 3/ARCHIVIO/

# 2. Cancellare server da VPS-72-60-129-50 Cloud Console
#    https://console.hetzner.cloud/projects/<id>/servers
#    Click server → Delete → confirm

# 3. Aggiornare codice + docs
grep -rn "72.60.129.50" /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder/
# rimuovere o marcare DEPRECATED tutte le referenze
```

**Risparmio**: ~€5-15/mese (CX21/CX31 VPS-72-60-129-50). Annualizzato €60-180.

**Trade-off**:
- ✅ Zero costo + zero manutenzione
- ⚠️ Brain V13 perso (non significativo, Gemini Flash-Lite copre)
- ⚠️ Edge TTS perso (richiede Coqui RunPod sempre RUNNING per TTS prod)

### Opzione B — KEEP ALIVE come canary/fallback ridotto

```bash
# 1. Decommissioning Brain V13 (cancellare modelli, liberare RAM/disk)
ssh root@72.60.129.50 "ollama rm galileo-brain galileo-brain-v13"

# 2. Riportare up Edge TTS
ssh root@72.60.129.50 "systemctl restart edge-tts && systemctl enable edge-tts"

# 3. Smart on/off VPS-72-60-129-50 (start solo durante test/bench)
# similar to RunPod smart on/off ma per VPS-72-60-129-50 non è sensato (costo fisso mensile)
```

**Trade-off**:
- ✅ Edge TTS prod fallback no GPU
- ⚠️ Costo VPS continua
- ❌ Brain V13 dismesso comunque

### Opzione C — NULLA (status quo)

Lasciare entrambe come ora: Brain V13 alive non usato, Edge TTS down. Rischio: confusione architettura, spesa senza valore, audit infrastructure marca DOWN.

## Decisione richiesta Andrea

Quale opzione? Tre domande chiave:

1. **TTS produzione**: serve fallback no-GPU? IF YES → Opzione B + fix Edge TTS. IF NO (Coqui RunPod sufficiente) → Opzione A.
2. **Brain V13**: confermi deprecato per sempre? IF YES → cancellare modelli ovunque. IF NO (vuoi sperimentare ancora) → Opzione B.
3. **Costo VPS-72-60-129-50**: quanto paghi/mese? IF >€10/mese e nulla in produzione → Opzione A (risparmio annualizzato significativo).

## Aggiornamenti file system (autonomous tick 22)

- `CLAUDE.md` infrastruttura table: Brain V13 marked **DEPRECATED**, Edge TTS marked **DOWN**
- `docs/audits/2026-04-26-hetzner-vps-decommissioning-recommendation.md` (this file)

## Honesty caveat

Test 26/04/2026 18:21Z. Edge TTS down ORA. Possibile sia transitorio (riavvio sistema, servizio crash recoverable). Verificare ulteriormente prima di decommissioning definitivo: re-test in 24h + ssh logs `journalctl -u edge-tts --since "1 day ago"`.
