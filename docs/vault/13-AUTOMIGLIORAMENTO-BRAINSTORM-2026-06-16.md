---
tipo: brainstorm
zona: governance (fabbrica)
data: 2026-06-16 sera
parte-di: "[[11-ARCH-fabbrica-autonoma-2026-06-16]]"
stato: BRAINSTORM — opzioni, NON piano ratificato (Andrea decide)
---
# ARDESIA fabbrica auto-migliorante — brainstorm (molte idee, onestà brutale)

## Verità di partenza (stato live verificato 16/06 18:13)
La fabbrica è **sovra-costruita e sotto-usata**. Loop = 14 call cheap/24h, studio idle 22h, agentmemory 0 obs, solo PLAN-CHECK via gateway, builder ancora `claude -p` diretto, Hermes NON cablati a LiteLLM. LiteLLM/cap/deadman/dual-pushurl/ratchet/review-ladder/adversarial = quasi tutto **DORMIENTE**.

**Tesi:** auto-miglioramento ≠ aggiungere 2 Claude-cron a un loop a 14 call/g (= più preambolo idle $0.09/cold-call per zero throughput). Auto-miglioramento = **(1) cablare i dormienti, (2) renderlo MISURABILE, (3) recintarlo coi gate frozen.** Le 2 cron DOPO, non prima.
**Vincolo fisico:** un agente NON giudica le proprie regressioni (>12% precision; self-review same-family approva 31.7% codice rotto, arxiv). Self-improvement è vincolato a ciò che un **oracolo frozen** sa verificare → investire nei gate = investire nell'autonomia sicura.

Tag stato: [BUILT] / [HALF] / [DORMANT] / [NEW].

## A. Le 2 cron-routine Claude (ask diretto)
1. [NEW] **RESEARCH-cron** — launchd Mini (NON MacBook: cron muoiono al resume), ~3-6h. Cheap scansiona (Gemini web/Kimi arxiv/GitHub/dominio), Claude SOLO sintesi (~5min). Output = note `_agent-out/` + candidati `[AUTO-OK]`/skill-patch **proposti, mai auto-applicati**. Costo ~$0.10/run. Rischio: WebSearch rumoroso → ancora repo-first.
2. [NEW] **CONTROL/META-DEV-cron** — supervisore-come-agente (versione autonoma di ciò che fa Claude-desktop): legge gate-trend/deadman/spend/COORD → auto-heal (ruota pin stale, refill coda, escala TG) + meta-dev (propone trim-prompt/skill-fix/route-change come PR gated). Sostituisce il supervisore-MacBook (muore al resume). **Può ruotare pin/refillare, NON mergiare a main né toccare i gate.**
3. [HALF] **Isolamento account** — 2 cron orarie = pressione pool Max condiviso con Andrea → routing availability-aware che salta l'account interattivo + 2° account a turno (acct.sh già metà-fatto). Senza questo le cron affamano le sedute di Andrea.
4. [NEW] **Cron = proponenti, non esecutori** — scrivono vault/COORD; il LOOP esegue sotto gate. Separi "chi pensa" da "chi committa": cron impazzito riempie solo una coda gate-filtrata, non rompe main.

## B. Sessioni ~1h cache-allineate (ask)
5. [HALF] **Sessione = finestra cache TTL-1h** — preambolo Claude-Code (22.7k cache-creation+15.6k cache-read misurati) pagato 1×/ora se la sessione resta calda. Allinea durata-sessione al TTL = leva-token #1.
6. [insight] **1h-OPUS = caro** — design corretto: 1h di GRIND cheap (DeepSeek/Kimi via gateway) + bookend Claude ~5min (plan + review apex). "Sessione 1h" ≠ "1h di Claude".
7. [NEW] **Pre-warm cache** — keepalive a inizio finestra fissa il prefisso byte-identico → i task dell'ora colpiscono cache-read (1/10 costo). Mai switch-modello mid-sessione (già regola).

## C. I 3 Hermes (decorrelazione, non ridondanza)
8. [DORMANT] **3° Hermes DECORRELATO** — cross-famiglia r=0.52 → un 3° ridondante manca gli stessi bug. Ruoli: (1) builder-grind DeepSeek, (2) red-team Kimi, (3) **planner/decompose-test-first** (spec falsificabile PRIMA del codice).
9. [DORMANT] **Hermes via LiteLLM** — oggi chiamano diretto → no cap/obs. Cutover gateway = cap+fallback+cost per tutti (passo deliberato).
10. [NEW] **Tournament builder** — task alta-posta: 2 builder cheap diversi (DeepSeek vs Qwen-Coder) in parallelo, gate frozen sceglie il verde-migliore. Costo centesimi, decorrelazione reale.

## D. Self-improvement CLOSED LOOP (cuore — reale, non hype)
11. [NEW, **MOSSA #1**] **Instrumenta ogni build** — log strutturato: gate-delta(+test), token (cache-hit%), wall-clock, verdetti-review, NOOP, regressioni. Senza → "auto-miglioramento" è vibes. Costo ~0, rischio ~0.
12. [NEW] **Meta-agente ROI giornaliero** — legge instrumentazione → propone 1 cambio max-ROI (trim-prompt/skill-fix/route/nuovo-gate) → canary+gate+misura → keep/revert. Evidence-driven, gated.
13. [NEW] **KPI auto-miglioramento** — "$/task accettata" ↓ + "regression-rate" ↓. Self-change che non li muove → revert automatico.
14. [HALF] **Ogni CRITICAL adversarial → classe chiusa** — pattern già visto (date→skill; COORD→guard). Formalizza: ogni bug-class confermata → un gate frozen O una skill-rule, mai solo il fix-istanza.

## E. Ciclo-vita SKILL (auto-migliorate + create da Claude — ask)
15. [HALF] **catchup estesa** — già auto-migliora skill da errori veri; estendi a retro-review-finding → skill-patch.
16. [DORMANT] **skill-factory mining** — Claude scava transcript/agentmemory: 3+ fix manuali simili → nuova skill proposta.
17. [NEW] **skill-eval periodica** — `plugin-eval:eval-judge`: audit-qualità mensile, prune morte, affila trigger (11 skill in review=7k tok → selettive 1.5k).
18. [NEW] **Skill versionate + A/B** — pin-versione, A/B (con/senza) sul gate-pass-rate. Skill-edit cattiva propaga a OGNI sessione → gate+canary come il codice.
19. [trap] **Skill ≠ prompt-bloat** — ogni skill costa token/sessione → deve pagarsi in gate-pass o token-risparmiati, altrimenti si pota.

## F. Sfrutta i DORMIENTI al massimo (ask "tutti i componenti")
20. [DORMANT→alto-ROI] **LiteLLM cutover totale** — builder+review+research+Hermes via gateway → cap+obs+fallback unificati. Oggi quasi tutto BYPASSA.
21. [HALF] **agentmemory acceso** — import-transcript + distillazione capped → recall déjà-vu nei prompt. Recall-quality bassa finché non gira su volume → non sovra-fidarsi.
22. [BUILT-underused] **Obsidian = lavagna condivisa** — vault git-synced = memoria/coda durabile tra cron+loop+Andrea. Research scrive→vault; Control legge→agisce. Canvas mappa già c'è.
23. [HALF] **Telegram control-plane ricco** — digest KPI giornaliero; approva/rifiuta PR-proposti con un tap; "cosa hai imparato oggi".
24. [BUILT, espandi] **Gate = costituzione** — più oracoli frozen = più autonomia sicura (aggiungi eslint-no-undef, brand-hex). Gate frozen = unico giudice affidabile.
25. [NEW] **Langfuse self-host** — obs LLM unificata → alimenta il meta-agente ROI.

## G. Osservabilità (rende l'auto-miglioramento falsificabile)
26. [HALF] **factory-health report** — estendi spend-report.sh: throughput/g, $/task, idle%, gridlock, adversarial-CRITICAL, cache-hit%. Una riga TG/g.
27. [NEW] **Regression-detector** — self-change che passa i gate ma degrada sottile compounda su N sessioni → confronto gate-trend + audit 2×/g lo intercetta.

## TRAP / idee AMMAZZATE
- ❌ Agente riscrive il proprio orchestratore (hype, regredisce). Self-improve = incrementale+gated+misurato+ratifica-umana per orchestrazione.
- ❌ 2 cron PRIMA di cablare i dormienti (più $-idle, zero throughput).
- ❌ 1h-opus default (pool+$). Grind cheap + bookend Claude.
- ❌ 3° Hermes ridondante (r=0.52, spreco).
- ❌ Cron su MacBook (muoiono al resume). Tutto launchd-Mini.
- ❌ Skill-sprawl (token/sessione). Pota.
- ⚠️ **Constitution-freeze**: `eval/gate.sh`, deadman, cap, branch-protection = human-only, mai toccabili da agente → serve un META-GATE che blocca edit-agente a quei file.

## POSIZIONE (convergenza)
- **Direzione più forte = NON le 2 cron, ma "Instrumenta (11) → Closed-Loop gated (12-13-14) + LiteLLM cutover (20)".** Trasforma auto-miglioramento da slogan a loop misurabile+sicuro, e rende le 2 cron 10× più utili quando arrivano (agiranno su KPI veri, non vibes).
- **Le 2 cron = il nord, ma come CONSUMATORI dell'instrumentazione** (Research propone dai dati, Control agisce sui KPI), non aggiunta cieca.
- **Assunzione più rischiosa:** che i gate frozen coprano abbastanza classi da rendere SICURO il self-modify. Oggi NO (eslint-gate morto in ELAB; engine ok, orchestrazione/skill poco coperte). → far crescere l'oracolo PRIMA di dare ai cron potere di proporre skill/route.
- **Prossimo passo singolo:** strato di **instrumentazione per-build** (idea 11) — €0, rischio 0, substrato di tutto.

## Sequenza consigliata (cheap-first)
1. Instrumentazione per-build (11) + factory-health report (26).
2. LiteLLM cutover builder+Hermes+review (20, 9) → cap/obs unificati.
3. agentmemory distillazione viva (21) + ogni bug-class→gate/skill (14).
4. Meta-agente ROI gated (12-13) + skill A/B/eval (17-18).
5. SOLO ORA: le 2 cron launchd-Mini (1-2) come consumatori, isolate sull'account non-interattivo (3).
6. Costituzione + meta-gate (constitution-freeze) PRIMA di dare potere-skill ai cron.
