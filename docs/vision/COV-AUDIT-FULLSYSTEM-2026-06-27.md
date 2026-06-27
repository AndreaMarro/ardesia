# COV + AUDIT + DEBUG + ADVERSARIAL — Full-system — 2026-06-27

> Sciame 19-agent (`wf_0d1dae10-19f`, read-only). 6 sottosistemi × pipeline COV→audit→verifica-adversariale + completeness-critic. **Ogni claim-top di ogni dimensione ha SUPERATO il tentativo di refutazione** (refuted=False, confidence=high) → findings solidi, non ipotesi. Tutto evidence ssh macmini, nessun gate toccato.

## VERDETTO COMPLESSIVO (critic)
**Fabbrica VIVA e autonoma (REALE), ma la consegna-prodotto è recisa in DUE giunti congelati** → served :8200 stale ~189 commit + Vercel prod = guscio 4-segment congelato 22-giu → **l'intero output fabbrica è irraggiungibile dall'utente**. Moat wired ma non-misurato sul served-path (harness esiste, mai girato) e inerte su dati single-lesson. Suite test non-girabile. Guardie cost/model/served-SHA sono detect-only o config-true, non enforced. **Massima churn, valore-consegnato ~zero.** Fabbrica ~50-60% reale; prodotto-a-docente-pagante ~10-15%.

---

## 1. FACTORY — health YELLOW
**REALE [V]:** lessonos auto/main @00570e8 (poi cb4166a), **187-207 commit/24h**, HEAD 13:02, no STOP, tick PID 95928 vivo. Gate floor **4010** test (reale: 3993→4010 via build vero b75859a +17 test, SELF-ADV green). Builder = **claude-opus-4-8 ultracode account A2**. Daemon core vivi: api(1d20h)/litellm(6d,nice-15)/tutor(10h)/nanobot(11h).
**TEATRO/PROBLEMI:**
- 🔴 **CRITICAL: served :8200 FROZEN @98ac0f4, 187 commit indietro** → ogni fix oggi = dead-code per l'utente. (giunto congelato #1)
- 🔴 **HIGH: budget NON enforced.** Spend **$4.00/24h > soglia $3.3** (WARN dalle 10:37Z), ma budget-guard è **detect-only by design** (mai scrive STOP; flag `~/.litellm_budget_tripped` non consumato da nessuno). Fabbrica gira a costo illimitato fino a intervento manuale.
- 🔴 **HIGH: Hermes ASSENTE + DeepSeek fallback 402-dead** (OpenRouter "Insufficient credits") → **fabbrica single-thread su A2 Opus, ZERO fallback funzionante**. Un A2-down = stop totale build.
- ⚠️ **MEDIUM: churn ~51% bookkeeping** (coord/docs/STATUS/digest) + 24 AUTO-REPLENISH; 34% iter blocked/noop. "187 commit" sovrastima l'output reale.
- Orchestration daemon (strategos/replenish/curate/audit/pr-preparer/wiki-sync) = idle-scheduled (PID `-`). ardesia repo 0 commit/24h.

## 2. GRAPHS — health YELLOW — *quali grafi DAVVERO usati*
| Grafo | Verdetto | Nota |
|---|---|---|
| **lessonos method-graph (moat)** | **REAL-WIRED** | nel binario served 98ac0f4: `_grounding_window`→`graph_aware_retrieve` su `POST /v1/lessons/{id}/package`; 41 nodi/85 edge/48 depends_on; gate moat passa |
| ↳ cross-lesson prereq (il PUNTO del moat) | **DORMANT** | tutti i 48 edge dentro UNA lezione (storia_corpus), served.db ha 4 lesson-node → la feature-chiave non può scattare in prod |
| ↳ valore moat "+0.2555 recall@10" | **STATIC-ARTIFACT** | misurato su funzione DIVERSA (`retrieve_teacher_context_with_ppr`) + corpus DIVERSO (moat-corpus 8 mat.) ≠ served-path. **Lift served = MAI MISURATO**; harness `eval/served_moat.py`+`test_served_moat_real.py` ESISTE ma 0 report su disco |
| **AgentMemory :3111 graph** | **EMPTY** | /graph,/stats,/nodes,/edges = 404, health 503; store ha 696 memorie ma layer-grafo vuoto. ⚠️ era 97% RAM |
| **Graphify graph.json** | **STATIC-ARTIFACT** | 476 nodi/792 edge/**34 community** (NON 34 nodi); orfano, nessun processo lo consuma |

→ **1 grafo live-wired (ma inerte sui dati), 3 dormant/decorativi.** Il moat esiste nel codice ma in produzione rende ~zero e non-misurato.

## 3. MODELS — health GREEN
- **claude -p A1/A2 = claude-opus-4-8 UN-PROXIED** [V]: `claude-acct.sh` strippa API_KEY+OAUTH, nessun BASE_URL/proxy. Confermato adversarialmente.
- ⚠️ "**mai un Claude più piccolo**" = config-true NON guarded: `~/.ardesia-routes.override` Telegram-writable, ladder opus-4-8→sonnet-4-6 documentata → un edit / A2-down = downgrade silenzioso senza guardia.
- **Tutor :8081** = Qwen3.5-4B-MLX-4bit (256k ctx, vision, sandbox loopback) REAL. **nanobot :8090** v5.5.0 fronting (5 specialist, ma vision_tier/reasoner null, cache 0 = profondità routing non-provata).
- **litellm :4000** = OpenRouter-primary + diretto deepseek/kimi/gemini, **NESSUN modello locale dietro**. apex-claude = dead-sink voluto.
- **Hermes = CLI bash installato, NON daemon, NON finder vivo = DORMANT.**
- On-disk: **6 modelli** (non 4) — incl gemma-4-e2b/e4b (device-default), gpt-oss, gemma-3n, Qwen3.5-4B, Qwen3-14B.

## 4. KNOWLEDGE_TOOLS — health YELLOW
| Tool | Stato | Verdetto |
|---|---|---|
| **Tencent DB** (TencentDB-Agent-Memory) | **ABSENT** | no dir/proc, port 8420 morta (mini+MacBook). Prior egress-REJECT (Prodotto) regge |
| **OpenHuman** | **ABSENT + non-runnable** | dipende da Ollama che è assente (mini è MLX-by-design) |
| **Graphify** | **REAL-WIRED (skill)** | ma sta SUL MACBOOK (`~/.claude/skills/graphify`), NON sul mini; mini ha solo gli output renderizzati |
| **Obsidian** | **DORMANT** | vault config `~/ardesia-vault/.obsidian` sul mini ma sync/publish disabilitati; Obsidian.app assente sul mini; vault = markdown SoT (56 md) |

⚠️ Correzione: due dir distinte — `~/ardesia-vault` (obsidian+md) vs `~/ARDESIA-VAULT` (graphify-out). Latent egress graphify se key presenti (questo run = 0-token locale).

## 5. WEB_GITHUB — health YELLOW
- **Corpus-gap REALE**: Vercel prod /health=**4 segment** (live-computed da DB bundle stale 22-giu: segments=4, teachers=0, lessons=0, **nodes=0/edges=0/sources=0** — più vuoto del previsto) vs served 1224. (giunto congelato #2)
- **Nessun re-bundle path**: `ardesia-api-vercel` non è git-repo, nessun build-script per rigenerare il DB → drift = stato stazionario.
- **boundary/host-gate @0892780a NON pushato** = SPOF single-machine (mini-loss = work-loss).
- PR: ardesia #1/#2/#4 open-draft docs-only; lessonos PR#3 = **100 commit** (non 12), BLOCKED; elab-tutor 6 PR + **816 branch** sprawl.

## 6. PRODUCT_TESTS — health YELLOW
- **535 file test** (463 unit + 59 e2e + 13). Ma **ZERO signal oggi**: node_modules + vitest + playwright **ASSENTI** → 0/535 girabili. DORMANT (wiring intatto: package-lock/vite/vitest config presenti → `npm ci` rianima).
- **boundary gate + 5 widget + 9 P1 edit stranded** su branch checked-out in NESSUNO dei 3 worktree → invisibili al tree attivo.
- ⚠️ I "9 P1 test" = **14 ins/14 del swap-import meccanici, NON nuova copertura** (non sovrastimare).

---

## TEST DA FARE (top-5, critic)
1. **Misura il moat sul served-path**: `pytest tests/test_served_moat_real.py -v` + `eval/served_moat.py` su served.db → committa il risultato (oggi il moat è non-misurato in prod).
2. **End-to-end served**: `POST /v1/lessons/{id}/package` su prod E su :8200, diff; inietta un edge cross-lesson sintetico per provare che il path moat scatta quando i dati lo permettono.
3. **Repoint/restart :8200** (`~/repoint-serving.sh` esiste) → /health git_sha avanza, corpus regge. **[GATE prod-like]**
4. **`npm ci && test && test:e2e:smoke`** in elab-tutor, su session/long E su branch boundary.
5. **Arma served-SHA done-gate** (`bin/served_sha_gate.sh`) + aggiungi consumer di `~/.litellm_budget_tripped` che scrive STOP (vera enforcement costo).

## GATE-ANDREA che sbloccano valore
- Restart/repoint :8200 (rende live i 187 commit) · re-bundle+`vercel --prod` (chiude corpus-gap) · ricarica crediti OpenRouter (riarma Hermes/fallback) · push branch boundary (uccide SPOF).
