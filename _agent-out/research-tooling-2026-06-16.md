---
tipo: research-report
zona: agent-out
data: 2026-06-16
agente: tooling-scout (foreground, web+verifica)
oggetto: tool/repo per fabbrica autonoma (fleet DeepSeek+Kimi+Claude+Hermes)
---
# Tooling Scout — Fabbrica autonoma (sintesi verificata, giugno 2026)

> Vincolo che cambia tutto: due cambi policy Anthropic (OAuth-ban 2026-02-20; credito Agent-SDK metered dal 2026-06-15) **secondo le news** invalidano "Claude headless free". ⚠️ La verifica live di Andrea 16/06 dice che la nota metered è SPARITA dal doc → CONFLITTO da risolvere su pagina-usage. In ogni caso: Claude = tier escalation dietro router con cap.

## TOP 5 da adottare ORA
1. **LiteLLM** self-host sul Mini = gateway unico, cap $ per-key (429 a esaurimento), fallback DeepSeek/Kimi, spend log. MIT, GDPR-safe. *Mossa #1.* (github.com/BerriAI/litellm)
2. **Claude = escalation capped** via Console API key (non OAuth-subscription per Agent-SDK; `claude -p`=Claude Code è esente). Default = DeepSeek/Kimi.
3. **agentmemory** (rohitg00, Apache-2.0, ~5.9k★, no-OAuth) = memoria FABBRICA → ritira claude-mem (SPOF).
4. **Aider** (Apache-2.0, ~46k★) = worker model-agnostic, patch git sotto gate frozen, gira su DeepSeek/Kimi via LiteLLM.
5. **Langfuse** (MIT, self-host) = osservabilità+costo OTel, dati locali.

## Per categoria (verdetti)
- **Gateway:** LiteLLM=ADOPT · Portkey=TRIAL · OpenRouter=REJECT-core (no self-host, no cap, US-3rd-party) · Vercel AI Gateway=REJECT (cloud-only).
- **Orchestrazione/coding:** Claude Agent SDK=ADOPT(solo leg Claude) · Aider=ADOPT · OpenHands=TRIAL · Goose=TRIAL · LangGraph=TRIAL(solo se Hermes satura) · CrewAI=REJECT(demo-only) · AutoGen=REJECT(abbandonato/rebrand) · SWE-agent=REJECT-runtime.
- **Queue/scheduler:** launchd+SQLite=ADOPT(ora) · BullMQ=TRIAL(concorrenza+retry durabili) · Temporal=REJECT(overkill 1-nodo).
- **Memoria:** agentmemory=ADOPT(fabbrica) · mem0=TRIAL(prodotto, self-host, PII off-nodi) · Letta/MemGPT=REJECT(troppo pesante).
- **Eval/harness:** gate-frozen+ratchet = backbone giusto (arxiv 2604.25850: harness trasferibile +5-10pp; ma agenti auto-giudicano regressioni a ~12% precision → gate deterministico = verità). Aggiungi eslint no-undef + grep brand-hex. REJECT bolt-on SWE-agent runtime.
- **Claude limiti reali (citati):** credito metered no-rollover no-auto-fallback (stop a secco) · OAuth-subscription banned per Agent-SDK · modelli-1M rompono OAuth→compattano a 200k. → Hermes DEVE degradare a DeepSeek/Kimi prima dell'esaurimento.
- **Osservabilità:** LiteLLM(cost-enforce)+Langfuse(trace/cost)=ADOPT · Helicone=TRIAL · OpenLLMetry=REJECT-standalone.

**Tieni com'è:** Hermes bash + gate frozen + ratchet. **Defer:** LangGraph, BullMQ, Temporal.

*(Report completo con tutte le URL/citazioni: l'agente ha verificato 17 fonti. Vedi cronologia sessione Claude.)*
