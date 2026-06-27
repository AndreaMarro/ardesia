# RUNBOOK — Finder fabbrica LOCALE (Qwen3-14B) dietro litellm — 2026-06-27

> **GATE-ANDREA: NON applicato. Tutto reversibile.** Rende la fabbrica indipendente da OpenRouter (oggi 402-dead → single-thread A2). **Smoke-test già PROVATO firsthand** (vedi §0). Stesso filo → sblocca anche il grafo AgentMemory (§4).

## §0. PROVA (firsthand, 2026-06-27 16:01, mini)
`mlx_lm.server` (v0.31.3, stock) + `mlx-community/Qwen3-14B-4bit`, **HF_HUB_OFFLINE=1 (zero rete)**, loopback :8088. Caricato in 27s (RAM 67% free). Richiesta tool-call IT →
```
finish_reason: tool_calls
tool_calls: [{"function":{"name":"get_time","arguments":"{\"city\": \"Roma\"}"},"type":"function","id":"..."}]
```
→ tool-call OpenAI-shape, italiano, **locale puro, no OpenRouter**. Server killato, porta liberata. (gpt-oss invece fallisce il tool-call su harmony → resta REJECT-finder.)

## §1. Stato attuale (firsthand, redacted)
- `~/litellm/config.yaml`: model_list tutto cloud (`openrouter/deepseek/deepseek-v3.2`, kimi, glm, gemini) + `apex-claude` = dead-sink `@127.0.0.1:1`. **Nessun backend locale.**
- `router_settings.fallbacks` (riga 65): `[{"apex-claude":["deepseek-chat","kimi-k2"]},{"deepseek-chat":["kimi-k2","glm"]},{"kimi-k2":["deepseek-chat","glm"]},{"glm":["deepseek-chat","kimi-k2"]}]`
- Finder caller: **hardcodano `"model":"deepseek-chat"` → `http://127.0.0.1:4000/v1/chat/completions`** in `bin/{fable.sh,replenish.sh,adversarial.py,run_dispensa.py,run_summary_only.sh,run_lesson_full.sh}` (adversarial.py legge `ADVERSARIAL_MODEL`, default deepseek-chat).
- Live: litellm cloud routes = OpenRouter **402 "Insufficient credits"**.

## §2. STEP A — daemon finder locale (launchd, loopback, sealed)
File `~/Library/LaunchAgents/com.ardesia.finder.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.ardesia.finder</string>
  <key>ProgramArguments</key><array>
    <string>/usr/bin/sandbox-exec</string>
    <string>-f</string><string>/Users/progettibelli/maestro-tools/sandbox/network-localonly.sb</string>
    <string>/Users/progettibelli/mlx-venv/bin/python</string>
    <string>-m</string><string>mlx_lm.server</string>
    <string>--model</string><string>mlx-community/Qwen3-14B-4bit</string>
    <string>--host</string><string>127.0.0.1</string>
    <string>--port</string><string>8088</string>
  </array>
  <key>EnvironmentVariables</key><dict><key>HF_HUB_OFFLINE</key><string>1</string></dict>
  <key>KeepAlive</key><true/>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>/Users/progettibelli/maestro-logs/finder.log</string>
  <key>StandardErrorPath</key><string>/Users/progettibelli/maestro-logs/finder.log</string>
</dict></plist>
```
Avvio: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.ardesia.finder.plist`
⚠️ RAM: 14B=7.8GB sotto soffitto wired 13.3GB. Se collide col tutor :8081 (3.6GB caldo) → scarica `mlx-community/Qwen3-8B-MLX-4bit` (~4.5GB, stesso path tool) e cambia SOLO `--model`.

## §3. STEP B — litellm: aggiungi local-finder + fallback local-first
**(B.1) Aggiungi stanza a `model_list`:**
```yaml
  - model_name: local-finder
    litellm_params:
      model: openai/mlx-community/Qwen3-14B-4bit
      api_base: http://127.0.0.1:8088/v1
      api_key: dummy
```
**(B.2) Sostituisci la riga 65 `fallbacks` (local catch-all, ZERO modifiche-script):**
```yaml
  fallbacks: [{"deepseek-chat": ["local-finder","kimi-k2","glm"]}, {"kimi-k2": ["local-finder","glm"]}, {"glm": ["local-finder","deepseek-chat"]}, {"apex-claude": ["local-finder"]}]
```
Effetto: il cloud (deepseek-chat) viene tentato → 402 → **fallback IMMEDIATO a local-finder** → la fabbrica non si ferma più. Nessuno script toccato. Reversibile (rimetti la riga vecchia).

**Reload litellm:** `launchctl kickstart -k gui/$(id -u)/com.ardesia.litellm` (o bootout+bootstrap se serve env).

**(B.3) OPZIONALE — local come PRIMARIO vero (evita il giro-402):** env-izza il modello finder. In `adversarial.py` usa già `ADVERSARIAL_MODEL` → settalo `local-finder`. Per gli altri (fable/replenish/run_*), cambia `"model":"deepseek-chat"` → `"model":os.environ.get("FINDER_MODEL","local-finder")`. Più pulito, ma tocca ~5 file → fallo dopo che B.2 ha stabilizzato.

## §4. STEP C — sblocca il grafo AgentMemory (stesso filo)
Il grafo :3111 è VUOTO-non-assente (`GRAPH_EXTRACTION_ENABLED=true`, embeddings locali) solo perché il distill-LLM va su litellm→402. Dopo §3:
1. Trova la config LLM di AgentMemory (`grep -rn "4000\|deepseek-chat\|OPENAI_MODEL" ~/agentmemory* ~/.config/agentmemory* 2>/dev/null`) → punta il distill a `local-finder` (o lascia che il fallback B.2 lo catturi).
2. Ri-lancia l'estrazione grafo (endpoint/script di re-distill di AgentMemory).
3. Verifica: `curl 127.0.0.1:3111/agentmemory/graph` → nodi > 0.

## §5. SMOKE-TEST post-apply (prova local-only end-to-end)
```bash
# diretto al finder:
curl -s 127.0.0.1:8088/v1/chat/completions -d '{"model":"mlx-community/Qwen3-14B-4bit","messages":[{"role":"user","content":"Che ore sono a Roma? Usa get_time."}],"tools":[{"type":"function","function":{"name":"get_time","parameters":{"type":"object","properties":{"city":{"type":"string"}}}}}],"max_tokens":256}'  # → finish_reason:tool_calls
# attraverso litellm con cloud morto (master_key in general_settings):
curl -s 127.0.0.1:4000/v1/chat/completions -H "Authorization: Bearer <MASTER_KEY>" -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Ciao in una parola"}]}'  # deve rispondere via fallback local-finder, NON 402
# un task reale: lancia un tick fabbrica con OpenRouter offline e verifica completamento.
```

## §6. ROLLBACK
- litellm: rimetti la riga 65 originale + togli la stanza local-finder → reload.
- daemon: `launchctl bootout gui/$(id -u)/com.ardesia.finder` + rm plist.
- Tutto config-only/daemon, nessuna perdita dati.

## §7. ROTTAMARE (taglia debito, opzionale)
- `apex-claude` dead-sink route (`@127.0.0.1:1`) → rimpiazza con local-finder come head.
- gpt-oss-20b come finder (tool-call rotto) → off dai finder.
