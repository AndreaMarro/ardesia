# ARDESIA — Architettura Modelli FINALE (decisa) — 2026-06-27

> Status: **ACCEPTED** (Andrea: "scegli le cose che portino maggiore qualità, beneficio e minore debito tecnico"). Criterio decisionale, in ordine: **qualità → beneficio → minimo debito tecnico.**
> Consolida e supera le sezioni-modello sparse di [[ADR-MODEL-STRATEGY-2026-06-26]] (questa è la SoT per i modelli). Decisioni verificate firsthand + ricerca web avversariale (`wf_5db75cb7`, `wf_099edf8a`, bench `bcdhu9zgx`), truthfulness-enforced.

## Frame anti-confusione: 3 livelli (mai fonderli)
1. **MOTORE + modello locale** — capacità grezza sull'hardware. Qui si misura "bravo e veloce".
2. **ROUTER** — sceglie quale modello (locale/cloud-con-chiave) per richiesta. `nanobot`=prodotto, `litellm`=fabbrica.
3. **APP/persona** — consumano il router. **UNLIM (tutor ELAB) = plugin, secondario.**

---

## DECISIONE A — FABBRICA (sul mini M4/16GB)
**Modello locale = Qwen (8B triage / 14B se serve qualità) — NON gpt-oss-20b finché non validato.** Orchestrazione = **TUTTO insieme: `claude -p` (A1/A2) + modello locale + OpenRouter.**

- ⚠️ **gpt-oss-20b: WATCH, non adottato.** Veloce (45 t/s, 11.3GB) e tool-calling, MA firsthand **va in loop** su ragionamento/fatti via `mlx_lm.generate` (canali harmony non gestiti). Adottabile SOLO dopo validazione via server harmony-aware (mlx_lm.server con template harmony + stop-token corretti). Fino ad allora NON è il modello-fabbrica.
- **Locale provato-affidabile = Qwen** (Qwen3-8B ~5.5GB triage/finder grounded; Qwen3-14B 12.7 t/s se serve più qualità — coerente, niente loop). Alimenta **Hermes finders + OpenHuman ingest (testo) + wiki-llm**. Il muscolo agentico/coding pesante → `claude -p` + OpenRouter (il locale è triage/grounded, non sostituto cloud).
- **Scartato Qwen3-30B-A3B**: 18–21GB @Q4 → NON entra in 13GB. Non è scelta di qualità, è di memoria. (gpt-oss-20b è anche più veloce e con tool-calling migliore del Qwen3-14B denso, 12.7 t/s.)
- **Topologia (forzata, non solo preferita):** `claude -p` resta **driver-top** e **chiama GIÙ** litellm — Anthropic ha bloccato il proxy-abbonamento di terze parti (4 apr 2026), quindi `claude -p` non può essere un *backend* di litellm, solo *chiamante*. OpenRouter + gpt-oss-20b = voci `model_list` di litellm con `latency-based-routing` + fallback. **headroom solo sul percorso finder→litellm (chiavi API), MAI sui builder ad abbonamento** (fragile + mis-billing + perderesti il €0).
- **Carve-out visione (obbligatorio):** gpt-oss-20b è **solo-testo**. L'ingest OpenHuman che vede immagini/PDF-scan → **VLM via OpenRouter** (voce `factory-vision` in litellm), NON locale (il VLM "potente" sarebbe lo stesso 18-20GB che non entra). Estrazione-testo resta locale.
- **Pre-req bloccante wiki-llm:** prova italiano output di gpt-oss-20b prima di fidarsi del testo generato.

litellm `model_list` (mini :4000):
```yaml
model_list:
  - model_name: factory-local      # gpt-oss-20b via mlx_lm.server (OpenAI-compat), fits 11.3GB
    litellm_params: { model: openai/gpt-oss-20b, api_base: http://127.0.0.1:<port>/v1, api_key: "none" }
  - model_name: factory-cloud      # escalation cloud
    litellm_params: { model: openrouter/<strong>, api_key: os.environ/OPENROUTER_API_KEY }
  - model_name: factory-vision     # ingest visione (gpt-oss è testo-only)
    litellm_params: { model: openrouter/<vlm>, api_key: os.environ/OPENROUTER_API_KEY }
router_settings: { routing_strategy: latency-based-routing, num_retries: 2 }
litellm_settings: { fallbacks: [{"factory-local": ["factory-cloud"]}] }
```

```
 claude -p (A1/A2, abbonamento, native auth)   ── TOP DRIVER, mai proxato dentro
    │ turni Opus          │ finder/sub-task (haiku→gateway o processo separato)
    ▼                     ▼  [headroom proxy, --mode cache, su questo ramo]
 Anthropic API      litellm :4000 ── latency-route + fallback ──► factory-local (gpt-oss-20b, mini)
                                                                  factory-cloud  (OpenRouter)
                                                                  factory-vision (OpenRouter VLM)
```

---

## ⚠️ VERIFICA FIRSTHAND 27jun (ultima, decisiva — ribalta 2 scelte di carta)
- **gemma-4-e4b/e2b 4bit: NON CARICA** in mlx_vlm 0.6.3 → `ValueError: Received 126 parameters not in model`. Loader immaturo → **NON deployabile oggi**.
- **gemma-3n-E4B: FUNZIONA, ottimo italiano** (firsthand: pizza→1/4→numeratore/denominatore, fluente). **5.9GB, 33.7 t/s**, multimodale (img+audio), E-series matura, runtime day-one (MLX/llama.cpp/LiteRT/WebGPU). ⇒ **è la versione deployabile dell'architettura voluta.**
- **gpt-oss-20b: LOOP** su fatti/italiano ("Chi era Giulio Cesare?" → spirale infinita inglese, anche con reasoning-low) via `mlx_lm.generate`. Causa probabile = canali harmony non gestiti dal CLI. **INAFFIDABILE finché non validato via server harmony-aware.** NON è il modello-conoscenza/wiki-llm.
- **Qwen family = affidabile** (firsthand: Qwen3.5-4B + Qwen3-14B coerenti, niente loop).

## DECISIONE B — ARDESIA prodotto (sul DISPOSITIVO: iPad/PC comuni)
**Modello = `gemma-3n-E4B` (E2B su fascia bassa), Q4** — firsthand-provato, ottimo IT, multimodale+audio, runtime matura ovunque. NON sul mini — gira **sul dispositivo utente**. (Migra a `gemma-4` quando il loader MLX combacia.) Alternativa solida provata = **Qwen3.5-4B** (più leggero 3.6GB/38t/s, visione confermata-legge-circuiti, **niente audio**).

- **Perché (qualità):** è **addestrato per schermo/UI/grafici/OCR** = calligrafia + diagrammi + foto-foglio (proprio il caso tutor); natively multimodale **incl. audio** (domande a voce in classe); **guadagni italiani documentati** (Gemma 4). Rivale stretto Qwen3.5-4B = meglio testo-reasoning ma peggio visione + niente audio → si ribalta solo se "testo-first".
- **Perché (beneficio):** edge-optimized, leggero. **E2B ~52 t/s Android / ~56 iOS / ~76 web-WebGPU**; E4B Q4 ~3.66GB. Entra iPad ~8GB e Android ~6GB. 128K contesto.
- **Perché (minimo debito) — è ciò che chiude:** supporto **first-party day-one su OGNI target ARDESIA** → un modello, un formato chat, una storia di quantizzazione:

| Dispositivo | Runtime first-party |
|---|---|
| iPad/iPhone/Mac | MLX (TurboQuant) + Swift API · llama.cpp/GGUF · CoreML |
| Android (tablet/LIM) | LiteRT-LM + ML Kit GenAI · GGUF/llama.cpp |
| Windows/Mac PC | llama.cpp/GGUF · Ollama · LM Studio · MLX(Mac) |
| Browser (LIM kiosk) | transformers.js/WebGPU (**solo E2B**, E4B troppo pesante) |

- **Caveat onesti:** nessun benchmark italiano duro → **verificare firsthand** (in corso). Gemma 4 ~1-3 mesi → path iOS-MLX-vision ancora in assestamento (GGUF/LiteRT più maturi oggi). **E2B = default** su 8GB/6GB; E4B = upgrade dove entra (non promettere E4B ovunque).

---

## DECISIONE C — Cambio/integrazione API + interop ChatGPT/Claude/Gemini (plugin, MCP)
**Due layer separati (separazione = anti-debito):**
- **Inbound "ARDESIA USA provider" = `nanobot`** (resta com'è): router OpenAI-compat multi-provider (`AI_PROVIDER{n}/AI_API_KEY{n}/AI_BASE_URL`) + GDPR-EU + racing. Aggiungere/cambiare OpenAI/Claude/Gemini/OpenRouter = **config env, zero codice**. L'app ARDESIA parla a UN endpoint OpenAI-compat, mai hardcoda il provider. (NON instradare `claude -p` qui.)
- **Outbound "gli assistenti USANO ARDESIA" = UN solo MCP server** (Streamable HTTP + **OAuth 2.1/PKCE**), hostato a parte. Tool una volta sola (`ardesia.search_concept`, `get_method_graph`, `build_lesson`, `lint_course`, `recall`).
  - **Claude** = MCP nativo (più pulito, tutti i client/piani).
  - **ChatGPT** = Apps SDK/connettori, stesso MCP (web+mobile); ⚠️ auth più severa (vuole CIMD public-client/`private_key_jwt` da subito) + listing pubblico = verifica-identità+review (processo, non codice).
  - **Gemini** = nativo su API/CLI/Enterprise/Antigravity; ⚠️ **app-consumer Gemini = unica vera lacuna** → puntare API/Enterprise, non bloccarsi sul rollout consumer.
  - **OAuth = obbligatorio ma ECONOMICO**: usare provider gestito (Cloudflare `workers-oauth-provider` / Stytch/Auth0/WorkOS) — wrapper, non build. Non scrivere a mano l'auth-server.
- Embedded-UI (render method-graph) = solo-ChatGPT bonus; tool restano UI-agnostici.

---

## Stack netto deciso
- **ARDESIA-prodotto:** Gemma 4 E2B/E4B on-device (multimodale, IT, portabile) ← nanobot (swap chiavi, PII locale) + ARDESIA-MCP-server (interop) + plugin-host (UNLIM ecc. = plugin).
- **FABBRICA:** `claude -p` Opus driver-top + litellm(:4000) → gpt-oss-20b locale + OpenRouter (+ VLM-cloud per ingest-visione); headroom sui finder.

## Verifiche aperte + ordine esecuzione (basso→alto debito)
1. ⏳ **Italiano firsthand**: Gemma 4 E2B/E4B + gpt-oss-20b (in corso). Sblocca/conferma B + il wiki-llm di A.
2. Wiring fabbrica: avvia `mlx_lm.server gpt-oss-20b` + aggiungi `factory-local` a litellm + delega finder di `claude -p` al gateway (serve `OPENROUTER_API_KEY` di Andrea).
3. ARDESIA-MCP-server v0 (5 tool) dietro OAuth gestito.
4. Device track Gemma 4 (E2B GGUF/LiteRT + MLX-Swift iPad) — track proprio.

## Related
- [[ADR-MODEL-STRATEGY-2026-06-26]] (superata per i modelli) · [[ADR-MEMORY-DUAL-ARCHITECTURE-2026-06-26]] · [[HEADROOM-ROLLOUT-2026-06-27]] · [[PRD-ARDESIA-v17-2026-06-26]]
