---
tipo: prompt-ripartenza
versione: v3
data: 2026-06-16 sera
incolla-per: ripartire ARDESIA in una nuova sessione
---
# ARDESIA — PROMPT RIPARTENZA v3  `/ultrathink:ultrathink` `/using-superpowers`

## Chi sei, come lavori
Sviluppatore/architetto di ARDESIA. Andrea = UNICO dev, la sua reputazione dipende da questo.
REGOLE FERREE: massima onestà e oggettività, NON compiacere mai, **verifica i claim a `file:riga` prima di dichiararli veri**, niente dati finti/mock, se una cosa non funziona **dillo con la prova**. Niente workflow-background (muoiono al resume) → lavora **SINCRONO** (Agent foreground, NON il Workflow tool). Terso ok.

## PRIMA DI TUTTO (in ordine)
1. **Memoria / mem-search**: leggi `~/.claude/projects/.../memory/ardesia-audit-headless-cutover-15jun.md` (= SoT aggiornata, contiene TUTTO lo stato 15-16/06) + `maestro-loop-operativo.md`. Usa `/mem-search` (claude-mem degradato → fidati del file-memoria + di `agentmemory`).
2. **Obsidian DAVVERO** (REST/MCP, non solo file-read): vault `~/ARDESIA-VAULT/`. Leggi `00-AUDIT`, `00-PIANO-MAXDEV`, `02-METAPIANO`, `08-FUNZIONALITA-E-ARCHITETTURA-PARALLELE`, `11-ARCH-fabbrica-autonoma-2026-06-16`, `_status/litellm-keystone-2026-06-16`, `_agent-out/research-*`. ⚠️ Obsidian Sync è SPENTO sul vault (vedi "resta a te").
3. **PDF spec**: `~/ARDESIA-VAULT/_inbox/01-specifiche-funzionali.pdf` (o `~/Downloads/`) = spec formale "Piattaforma Tutoring + Lavagna Estendibile v1.0" (RF A-L, SDK §6, modello-dati §5, roadmap MVP-4m/F2-8m/F3-12m). Riconciliazione: `05-REQUISITI-PDF-riconciliazione.md`. ⚠️ **Business model: NO fee sulle lezioni** (vince Andrea sul PDF RF-J-02 15-20% → emendato): pagano SOLO i docenti (SaaS scalato a "quanto vogliono esprimersi") + marketplace 70/30.
4. **Stato live**: `ssh macmini` per RI-verificare (NON assumere). `bash ~/litellm/spend-report.sh` per la spesa-modelli reale.

## I 3 progetti — MAI confonderli
- **ARDESIA** = la piattaforma (monorepo `ardesia`).
- **ELAB / elab-tutor** = prodotto esistente, sarà il PRIMO plugin chiamabile di ARDESIA (harvest unidirezionale, repo separato).
- **NUMERIA** = separato, NON toccarlo.

## ✅ FATTO + DURABILE (16/06 — verificato, NON rifarlo)
1. **Durabilità**: 4 repo GitHub privati — `lessonos`, `ardesia-studio`, `ardesia-tools`, `ardesia-vault`. Root-cause fixato: i driver pushavano solo il bare LOCALE → aggiunto **dual-pushurl** su `origin` (bare + github) → il loop mirrora a GitHub a ogni commit.
2. **Dead-man's-switch**: launchd `com.ardesia.deadman` (liveness/durability-regression/productivity), alert Telegram, testato.
3. **Strip-fable**: fable-5 (SOSPESO) → `claude-opus-4-8` in tutto il loop; `bin/deepreview.sh` era ROTTO (hardcoded fable senza fallback) → fixato.
4. **Keystone LiteLLM**: `127.0.0.1:4000`, launchd `com.ardesia.litellm`, multiplex deepseek+kimi (+`apex-claude` placeholder) + **fallback provato** + cost-tracking. boot-DB ~55s.
5. **PLAN-CHECK → cheap**: `fable.sh` PLAN-CHECK ora `deepseek-chat` via gateway (non più opus a ~0.09$); ESCALATION resta opus.
6. **Tetto-$ rigido**: postgresql@16 + LiteLLM `DATABASE_URL` + chiave-virtuale `ardesia-loop-cheap` (budget **$30/30g**, in `~/litellm/.consumer-key`, gitignored) → **HTTP 429 PROVATO**. Eventually-consistent (~60s flush).
7. **agentmemory → LiteLLM capped**: wrapper `~/agentmemory-run.sh` (OPENAI_BASE_URL=:4000, model deepseek-chat, AUTO_COMPRESS) → Provider ✓ llm, boot pulito.
8. **ops versionato** in `ardesia-tools/ops/`: config/run-fg/migrate/agentmemory-run/3 plist (master-key sanitizzata, `.consumer-key` gitignored).

## ⚠️ APERTO — onesto (cosa NON è fatto)
- **obs agentmemory = 0** ora (reset da reboot Mini ~15:00 + restart; dati 27M su disco; si ri-popolano dagli import-transcript del loop → poi distillano via LLM capped). NON "70k digerite adesso".
- **Hermes NON cablato a LiteLLM** per il builder principale — solo PLAN-CHECK passa dal gateway. Cutover-builder = passo deliberato, NON fatto (zero rischio loop). Decidi se/quando.
- **Claude nel gateway = placeholder morto** (`apex-claude` → endpoint inesistente). Claude vero gira via `claude -p` diretto (già limitato da Anthropic). Per Claude-nel-gateway serve **ANTHROPIC API key** (Console).
- **Tetto eventually-consistent** (~60s) + **boot-DB lento ~55s** (launchd lo assorbe).
- **Dati Postgres (storia spesa) = solo disco Mini** (schema/setup versionato; la storia no — minore).
- **Politica opus-vs-cheap = "si tara strada facendo"**: default builder=opus, PLAN-CHECK=cheap. Leve: `routes.env ROUTE_BUILDER`, pin-tag `[GRIND]`, Telegram `modello`, `~/litellm/spend-report.sh`. Guarda i numeri reali → tara.
- Altri minori: watcher-OFF-Mini (§7, il deadman è muto se il Mini è giù), mem0 PRODOTTO da deployare, GLM-5.2 da eval, ogg 13/06 da trascrivere.

## 🔴 RESTA A TE (Andrea — 4 azioni, sbloccano il resto)
1. **`gh auth login`** sul MacBook (token GH_TOKEN/GITHUB_TOKEN INVALIDI in `~/.zshrc:30-31`) → sblocca git-push dal Mac.
2. **Abilitare Obsidian Sync** sul vault (`sync:false` ora → ecco perché "non vedi nulla" sul telefono).
3. **Ruotare la chiave Kimi** (era esposta; redatta nei doc ma il VALORE è compromesso).
4. **Verificare billing Claude** (metered vs subscription) su pagina-usage / `/status` → decide la taratura opus.

## Modelli (corretto 16/06)
- Loop grind = API cheap non-Claude (DeepSeek-V4-Flash→Kimi-K2.6 via gateway LiteLLM capped; review codex→kimi; adversarial kimi).
- APEX/escalation = Claude opus→sonnet via `claude -p` (2 Max a turno, availability-aware, SALTA l'account interattivo di Andrea). Floor ~$0.09/call a freddo (la cache amortizza a raffica).
- fable-5 SOSPESO. **GLM-5.2 (Zhipu, MIT, 1M ctx) = TRIAL** via API-key (testalo davvero prima di promuoverlo) — non ancora fatto.

## Memoria / Telegram / Architettura
- **agentmemory** = memoria FABBRICA (ora con LLM capped). **mem0** = memoria PRODOTTO EU (DA DEPLOYARE, oggi inesistente). claude-mem degradato → no SPOF.
- **Telegram** bridge `macmini:~/maestro-tools/tg-bridge.py` two-way (chat-brain gemini→deepseek→kimi, NON claude). Idee Andrea → `tg-inbox.md` → Strategos AGISCE (pin/route). Comandi: stato/salute/coda/pin/modello/stop/riprendi + foto/schermata.
- **FABBRICA vs PRODOTTO** (GDPR runtime SOLO prodotto, no PII nei nodi-agente). Monorepo Nx, **Contratti Layer-0 PRIMA** (`packages/contracts`+plugin-SDK+ToolHost+ui+auth) → 3 lane parallele ENGINE/STUDIO/COMMERCE (1 package=1 worktree=1 gate). Antiregressione totale (gate frozen+ratchet+CI affected+branch-protection+canary). MAI auto-merge; deploy solo con OK Andrea.
- **graphify**: lessonos USA GIÀ networkx (`graph/queries.py`); betweenness=nativa → NO graphify per il flagship. graphify/Graphiti SOLO per retrieval-semantico M7 (oggi solo-FTS5).

## PROSSIME MOSSE (ordine, post-durabilità)
1. (Andrea) le 4 azioni "resta a te" ↑.
2. **Flagship visione** = concetto→suggerisci-tool via betweenness (networkx già presente) = **ZERO codice oggi** = il vero prossimo lavoro di prodotto. ⚠️ competitive-intel: Anthropic+CZI hanno un "Knowledge Graph" classi (mar 2026) → wedge ~12 mesi, moat reale = GDPR-minori-local-first + distribuzione IT/MePA.
3. **Contratti Layer-0** → sblocca il parallelo.
4. Lane **STUDIO+ENGINE** (studio-tool single-sided = il wedge), poi graph-suggest.
5. **COMMERCE** (booking/account/pagamenti/video) DOPO il wedge / se validato WTP.

## Tooling sessione
`/using-superpowers` · Obsidian REST/MCP davvero · `ssh macmini` stato live · `~/litellm/spend-report.sh` costi · niente Workflow-background (SINCRONO) · verifica claim a `file:riga` · `~/litellm/.consumer-key` = chiave capped per i consumer LiteLLM.

## ORA: fai ripartire il flusso
Dopo aver letto memoria+vault+PDF e ri-verificato live (`ssh macmini`): riprendi da **PROSSIME MOSSE**, proponi UNA prossima azione concreta con la prova dello stato, e procedi sincrono. Onestà brutale, niente compiacenza, mai confondere ARDESIA/ELAB/NUMERIA.
