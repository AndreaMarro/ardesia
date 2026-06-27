# ADR-MODEL-RETHINK — Local-first finder + product model + memory + integration — 2026-06-27

> Sciame `wf_4412b2ad-242` (4 research web-2026 + firsthand + 2 architetti min-debt/max-quality + synth + verifica adversariale). La rec più rischiosa **ha retto e fu provata firsthand** (refuted=False, high). Principio: max qualità+beneficio, min debito. **3 piani-modello distinti; ELAB tutor :8081 = plugin, FUORI scope.**

## DECISIONE (matrice finale)

### 1. FINDER FABBRICA — `Qwen3-14B-4bit` locale-default · debito BASSO · beneficio ALTO
- **Cosa**: servi `mlx-community/Qwen3-14B-4bit` (già su disco, 7.8GB) con **stock `mlx_lm.server`** su `127.0.0.1:8088` (porta dedicata, NON riusare il :8081 del tutor ELAB). Aggiungi a litellm `model_name: local-finder` (`model: openai/...Qwen3-14B-4bit`, `api_base: http://127.0.0.1:8088/v1`, `api_key: dummy`). **Riscrivi i fallback così che ogni catena PARTA locale**; OpenRouter → opzionale-secondario (solo se finanziato). claude-p A1/A2 Opus restano driver-top, **mai proxati**.
- **PROVATO firsthand [V]** (agente-verifica): Qwen3-14B ha emesso tool-call pulito in italiano (`finish_reason=tool_calls`, OpenAI shape, no harmony-leak) + risposta IT completa; live confermato che **deepseek/kimi/glm su litellm danno tutti OpenRouter 402** → la fabbrica oggi NON ha fallback cloud funzionante, il finder-locale è l'unico fix.
- **No fork**: mlx_lm.server v0.31.3 fa già tool-calling per Qwen3 (template-driven). Zero dipendenze nuove.
- **Debito/rischio**: contesa RAM sotto soffitto wired 13.3GB (14B=7.8GB + tutor 3.6GB + KV). Mitigazione: finder+tutor raramente caldi insieme; se collidono → **Qwen3-8B-4bit** (~4.5GB, da scaricare, stesso path tool) + `--max-tokens` cap. NON tenere gpt-oss(10GB) residente.
- **❌ gpt-oss-20b RIGETTATO come finder** [V firsthand]: tool-call ROTTO su server harmony (`finish_reason=stop`, `tool_calls=null`, token `<|channel|>` leakati nel content; upstream mlx-lm #613/#875). Userebbe un fork harmony = debito evitabile. Resta su disco solo per testo-non-tool.

### 2. MODELLO-PRODOTTO ARDESIA — DUAL via registry per-piattaforma · debito MEDIO · beneficio ALTO
- **Cosa**: NON un modello unico. **Default-da-spedire-OGGI = Qwen3.5-4B (mlx-vlm)** (text+vision firsthand-green) per iPad-MLX e path IT/reasoning. **Target architetturale = Gemma 4 serie-E (E2B default / E4B su ≥6GB)** — **NON gemma-3n-E4B** (una generazione indietro). Gemma-4 [V]: encoder-free, **audio nativo senza layer ASR separato** (decisivo per requisito-audio ARDESIA), 128K ctx, matrice runtime più ampia (transformers+MLX+GGUF+LiteRT+WebGPU).
- **Swap**: capability-registry per-piattaforma dietro nanobot/MCP; promuovi gemma-4 per-piattaforma SOLO dopo smoke-test.
- **Debito/rischio**: **runtime-fragmentation** — crack verificato: **LiteRT non ha runtime Apple-silicon universale** (apr-2026), quindi su iPad/Mac il path è MLX, non LiteRT. Il "day-one ovunque" ha 2 crepe; gestire per-piattaforma.

### 3. MEMORIA — FIXA AgentMemory (stesso filo), Tencent = NO-ora · debito BASSO · beneficio MEDIO
- **Cosa**: il grafo AgentMemory:3111 è **VUOTO-non-assente** (`relations` endpoint vivo, `GRAPH_EXTRACTION_ENABLED=true`, embeddings già locali). 0 nodi **solo perché** il suo distill-LLM va su litellm→OpenRouter-402. → **punta il distill al nuovo `local-finder` + ri-lancia l'estrazione**. **STESSA modifica del piano 1 → sblocca finder E grafo.**
- **❌ Tencent DB NO-ora** [V]: adottarlo in fabbrica = debito **netto-negativo** — secondo daemon memoria (:8420, Node≥22.16, proprio SQLite+sqlite-vec, **37 issue aperte**) che risolve lo STESSO problema che AgentMemory già risolve. "servirebbe" → ciò che serve è il grafo popolato, e lo ottieni col fix-1-filo, non con Tencent. (Tencent resta candidato A/B SOLO se AgentMemory si rivela irreparabile.)

### 4. INTEGRATION PLANE — 1 MCP server (build) + OAuth gestito (buy) · debito MEDIO · beneficio ALTO
- **Cosa**: **BUILD un solo Streamable-HTTP MCP server** (FastMCP/Python, singolo `/mcp`, tool `outputSchema`-typed) i cui tool chiamano GIÙ in nanobot (model-swap) + lessonos/grounded-memory. **BUY un Authorization-Server OAuth2.1/PKCE+DCR/CIMD gestito** (WorkOS AuthKit topPick / Stytch / Cloudflare workers-oauth se all-in Workers). **PIGGYBACK** la discovery (RFC 9728 PRM sul server + RFC 8414 ASM sul provider).
- **Debito-trappola #1**: diventare il proprio Authorization-Server. La spec MCP 2025-06-18 impone OAuth2.1+PKCE(S256)+RFC9728/8414/8707; ChatGPT e la Claude-directory lo enforced. → **non costruirlo, compralo gestito.**
- **nanobot** = proxy key-swap (chat OpenAI-compat), **NON parte della superficie MCP** (riframe, non rimuovere).

## FIRST SAFE STEP (zero-gate, GIÀ PROVATO firsthand)
Stand-up finder dedicato + smoke-test SENZA toccare litellm-live né il tutor:
```
~/mlx-venv/bin/python -m mlx_lm.server --model mlx-community/Qwen3-14B-4bit --host 127.0.0.1 --port 8088 --max-tokens 2048
curl 127.0.0.1:8088/v1/chat/completions -d '{...tools:[get_time]...}'   # → finish_reason:tool_calls, city:Roma
```
Provato dall'agente-verifica (proc killato, porta liberata, 5 servizi-prod intatti). Riproducibile on-demand.

## GATE-ANDREA (necessari per rendere DEFAULT)
1. Editare `~/litellm/config.yaml`: stanza `local-finder` + riscrivere `router_settings.fallbacks` local-first, OpenRouter optional-secondary (config-only, reversibile).
2. Creare launchd `com.ardesia.finder` (KeepAlive mlx_lm.server Qwen3-14B :8088 loopback, --max-tokens) — decidere 14B vs scaricare 8B se collisioni-RAM.
3. Ri-lanciare estrazione-grafo AgentMemory dopo il fix-filo.
4. Flip default-prodotto + scelta provider OAuth (costo).

## ROTTAMARE (taglia debito)
- gpt-oss-20b come finder (tool-call rotto) · `apex-claude` dead-sink route in litellm (`@127.0.0.1:1`) · **gemma-3n-E4B come default-prodotto** (superato da gemma-4) · OpenRouter come **hard-dependency** (→ optional) · artefatto Graphify orfano (dall'audit precedente).

## SUPERA / aggiorna memoria precedente
- ARDESIA-MODEL-ARCHITECTURE-FINAL-2026-06-27 diceva device-default **gemma-3n-E4B** → **CORRETTO: target = Gemma 4 E-series**, gemma-3n era incumbent-firsthand ma una-generazione-indietro; ship-oggi = Qwen3.5-4B.
- gpt-oss WATCH → **REJECT come finder** (tool-call provato rotto su harmony server, non solo generate).
