---
tipo: architettura
sotto-progetto: A' — Fabbrica autonoma (orchestrazione modelli)
data: 2026-06-16
stato: DRAFT (attende ratifica Andrea)
fonti: "[[_agent-out/research-tooling-2026-06-16]]" + "[[06-METAPROMPT-FINALE]]" + memoria ardesia-audit
---
# ARCH — Fabbrica autonoma: orchestrazione DeepSeek + Kimi + Claude(Max) + Hermes

Risorse fisse: DeepSeek-V4 API · Kimi-K2.6 API · Claude Max 20x+5x (headless `claude -p`) · Hermes (orchestratore bash). Obiettivo: migliore architettura per sviluppo autonomo + lavoro parallelo Mac/telefono. Basato su ricerca multi-agente foreground 16/06 (cita fonti nel report).

## 🔑 Keystone (mossa #1): LiteLLM gateway self-hosted sul Mini
Un solo endpoint che multiplexa DeepSeek + Kimi + Claude, con **cap $ per-key (429 a esaurimento) + fallback chain + spend log**. MIT, self-host (GDPR ✓), provider nativi DeepSeek + Moonshot/Kimi + Anthropic. È IL layer che rende l'autonomia sicura sui costi. Fai questo PRIMA di tutto.

## ⚠️ CONFLITTO billing Claude — NON risolto, verifica TU su pagina-usage / `/status`
- **Ricerca web** (news 2026-02-20 + 2026-05-14): OAuth-subscription BANNATO per Agent-SDK; credito Agent-SDK metered separato dal 15/06; "Claude headless = free overflow" MORTO.
- **Tua verifica 16/06** (memoria): la nota "June-15 metered" SPARITA dal doc ufficiale → `claude -p` ANCORA su abbonamento.
- **Sfumatura che riconcilia:** `claude -p` = Claude **Code** (esente dal ban OAuth); l'**Agent SDK** = serve API key. Il loop usa `claude -p` → path lecito su subscription. Il loop ha buildato con opus oggi = funziona.
- **Decisione robusta (vale in ENTRAMBI gli scenari):** Claude = tier **escalation** dietro LiteLLM con cap $; default = DeepSeek/Kimi con fallback SEMPRE pronto. Verifica il billing reale prima di alzare il volume Claude.

## Tiering modelli (via LiteLLM)
- **Build/grind (default):** DeepSeek-V4-Flash → Kimi-K2.6.
- **Review/adversarial:** Kimi + codex (cross-family, decorrela).
- **APEX/escalation:** Claude opus→sonnet via `claude -p`, 2 Max a turno (rotazione availability-aware: SALTA l'account che Andrea usa interattivo), gated da cost-check. Console-API-key dietro cap = fallback robusto.

## Orchestratore: TIENI Hermes (bash) + aggiungi Aider worker
La ricerca conferma: **harness frozen-trasferibile > framework churn** (arxiv 2604.25850, +5-10pp pass@1). NON adottare LangGraph/CrewAI ora (CrewAI=demo-only; AutoGen=abbandonato). **Aider** (Apache-2.0, model-agnostic, patch git sotto gate) = worker più economico, gira su DeepSeek/Kimi via LiteLLM, compone col loop bash. OpenHands = TRIAL (task-interi); LangGraph = DEFER (solo se branching Hermes ingestibile).

## Memoria (split FABBRICA/PRODOTTO — GDPR)
- **FABBRICA = agentmemory** (locale, no-OAuth; 70.6k obs già MA **0 memorie distillate** → attiva distillazione). RITIRA claude-mem (SPOF OAuth ricorrente).
- **PRODOTTO = mem0** self-host EU (oggi INESISTENTE → da deployare), PII MAI sui nodi-agente.
- Mai backend condiviso tra i due (sennò PII-minori finisce in fabbrica = breach GDPR).

## Antiregressione (tieni + rafforza)
Gate frozen + ratchet = **verità** (gli agenti NON sanno auto-giudicare le regressioni: precision ~12%, ricerca confermata). Aggiungi gate deterministici cheap: eslint `no-undef` + grep brand-hex (10× più economici di graph-gate, prendono la classe-bug che è sfuggita in prod).

## Osservabilità/costo: Langfuse self-host (OTel, locale, spend per-modello). Mandatorio con billing metered.

## Affidabilità loop (PRIMA MOSSA #2 — parzialmente aperta)
- launchd KeepAlive + **caffeinate** (StartInterval NON sveglia dal sleep = causa di "loop fermo 3g"/reboot ciechi).
- dead-man's-switch = **FATTO** (`com.ardesia.deadman`) MA gira SUL Mini → serve **watcher OFF-Mini** (il Mini oggi è andato giù 50min+reboot e nessun alert è arrivato).
- BullMQ (Redis) later se workers concorrenti con retry durabili.

## Parallelo Mac + telefono
- **Umano↔fabbrica** = directive-hub Obsidian ([[10-SPEC-obsidian-directive-hub-2026-06-16]]): telefono via Obsidian Sync (DA ABILITARE — è `sync:false` ora), Mac via app, Mini agenti leggono `_inbox/` e rispondono in `_status/`.
- **Agenti in parallelo** = 3 lane (ENGINE/STUDIO/COMMERCE) via contratti Layer-0 (doc 08); 1 package = 1 worktree = 1 gate; CI Nx-affected.

## 🏆 TOP 5 da fare ORA (ROI decrescente)
1. **LiteLLM gateway + cap $** (keystone — rende l'autonomia cost-safe).
2. **Claude = tier escalation capped** (verifica billing reale).
3. **agentmemory fabbrica** + ritira claude-mem.
4. **Aider worker** sotto gate frozen.
5. **Langfuse** osservabilità.
TIENI: Hermes + gate frozen + ratchet. VERIFICA: billing Claude su pagina-usage.
