# ARDESIA — Workflow automatico (fabbrica Hermes): prompt + ottimo (16/06/2026)

Prompt per ottimizzare il **sistema di sviluppo autonomo** (Hermes/loop sul Mini): massima resa, affidabilità, costo controllato, **auto-miglioramento MISURATO**. Concreto, non-di-parte. Base: [[00-AUDIT-2026-06-15]] (i guasti veri), ARDESIA-ARCHITECTURE (Mini), [[00-PIANO-MAXDEV-2026-06-15]] §affidabilità/routing.

## Verità non-di-parte (da tenere a mente)
- **Il guasto reale del loop NON è stato l'intelligenza, è l'affidabilità**: stallo ~3 giorni (supervisore-su-laptop StartInterval che non sveglia dal sleep; coda-a-secco + cap-96; alert-stuck 100×; nessun dead-man's-switch). → **affidabilità prima di "cleverness".**
- **Il collo di bottiglia è il rifornimento strategico umano**, non il motore: il loop NOOPa quando la coda è vuota. → auto-backlog è la leva #1 di throughput.
- **Auto-miglioramento ha un soffitto**: il loop su modelli cheap eccelle nel macinare backlog meccanico [AUTO-OK] + review decorrelata che becca regressioni; **NON inventa il flagship/architettura/prodotto** (= umano + Claude-desktop). Non spacciarlo per auto-evoluzione illimitata.
- **"Self-improvement" è reale SOLO se misurato**: se una skill-coach non muove le metriche, è teatro → si ferma.

---
## PROMPT (per la sessione che ottimizza il workflow automatico)
```
RUOLO: ingegnere del SISTEMA DI SVILUPPO autonomo di ARDESIA (la "fabbrica" Hermes sul Mac Mini). Obiettivo: portarlo all'OTTIMO — massima resa, affidabilità totale, costo controllato, auto-miglioramento MISURATO. Italiano, onestà brutale, ZERO compiacenza, NON-di-parte (valuta tradeoff, non spingere uno strumento), MAI toccare eval/gate.sh.

LEGGI PRIMA: ~/ARDESIA-VAULT/{00-AUDIT-2026-06-15, 00-PIANO-MAXDEV-2026-06-15, 03-UNIFICAZIONE}.md; memoria ardesia-audit-headless-cutover-15jun; sul Mini (ssh read-only macmini): ~/maestro-docs/ARDESIA-ARCHITECTURE.md + i bin reali: bin/{hourly-tick,driver-orch,driver-studio,autoheal,promote_pin,set_pin,mark_pin_done,fable-catchup,strategos,adversarial,review,pick-build-model,route}.sh|.py, eval/gate.sh, routes.env, COORDINATION.md (kernel). NON assumere: leggi il codice vero.

STATO ATTUALE (dall'audit, da verificare live): loop launchd hourly 300s → dual-lane driver-orch(lessonos)+driver-studio(studio) → maratona promote_pin(max6) → review-ladder codex→gemini→kimi→claude → HERMES-2 adversarial(kimi) → gate frozen → commit. Auto-heal (2 NOOP→PIN-DONE→promote; coda vuota→Telegram). Audit 2x/g + contro-audit. Catchup/skill-coach. GUASTI verificati: supervisore-su-laptop (StartInterval non sveglia→buco 41h), coda-a-secco+cap-96 (noop silenzioso), alert-stuck, push-GitHub fermo 06-06, fable-5 sospeso globalmente.

OTTIMO DA REALIZZARE (concreto, ordinato per impatto):
1. AFFIDABILITÀ (prima di tutto):
   - Loop sul Mini come launchd KeepAlive daemon (restart-on-crash), NON timer-one-shot; ogni build wrappato in `caffeinate -ims`. Supervisore-laptop declassato a best-effort (StartCalendarInterval + catch-up-on-wake).
   - DEAD-MAN'S-SWITCH proof-of-work: ping esterno SOLO su build/commit reale, con assert (builders_active>0 / commits_today>0); alert Telegram se coda-secca o niente-build per N ore. Risolve il "vivo-ma-noop".
2. CODA MAI A SECCO (leva #1 throughput): Strategos auto-promuove pin dalla ROADMAP-AUTO mantenuta; low-water-mark refill; age-out TTL dei pin stale (no gridlock). Andrea NON deve essere il rate-limiter. (Pin scritti SOLO da supervisore/promote_pin/set_pin; Hermes non li edita.)
3. MODELLI (fabbrica) — corretto 16/06: VOLUME/grind = API cheap non-Claude (builder DeepSeek-V4-Flash→Kimi-K2.6; review decorrelato codex→kimi [no gemini-OAuth dal 18/06]; adversarial kimi→fallback). APEX/review-finale/escalation = **Claude HEADLESS opus→sonnet sul piano Max, 2 account A TURNO** (rotazione availability-aware via pick-claude-token; salta l'account che Andrea usa in interattivo). `claude -p` è ANCORA sull'abbonamento (la nota "June-15 metered" è sparita dal doc ufficiale — verifica su pagina-usage); caveat: modelli-1M degradano a Haiku via OAuth → varianti-200k o verifica con /status; fable sospeso; GLM-5.2 TRIAL via API-key. CONTROLLO COSTO: `claude -p` pesca il pool Max 5h/settimana CONDIVISO con l'interattivo → la rotazione-2-account lo spalma e cheap-per-VOLUME resta obbligatorio (NON c'è credito-$ separato); cost-gate $ per le API cheap (total_cost_usd).
4. AUTO-MIGLIORAMENTO MISURATO (la potenza di Hermes, ma onesta): catchup/skill-coach migliora UNA skill dagli errori VERI; retro-review dei commit non-revisionati; audit 2x/g (può modificare, sempre gate-gated) + contro-audit adversariale 1x. → INSTRUMENTA un cruscotto di metriche e tracciane il TREND: gate-pass-rate, review-findings/commit (e quanti VERI vs falsi-positivi), false-green-rate (mutation-spot), cost-per-merged-commit, NOOP-rate, build-throughput/giorno, tempo-ciclo. Una skill-coach che NON muove le metriche → disattivala. Il miglioramento si DIMOSTRA, non si dichiara.
5. ANTIREGRESSIONE TOTALE (arbitro, immutabile): gate frozen + ratchet (conteggio+coverage+no-skip+test-non-rimosso) + CI Nx-affected su GitHub + branch-protection main + canary/rollback. L'auto-miglioramento NON tocca mai il gate. Adversarial (HERMES-2) caccia false-green/tautologie/regressioni.
6. DURABILITÀ: ripristina il push GitHub (oggi fermo 06-06: la verità vive solo sul Mini = rischio); CI verde gira il gate in modo indipendente dal Mini.
7. COORDINAZIONE 3-attori (loop-cheap / Telegram-comandi / Claude-desktop-presente): sync SOLO via COORDINATION.md + gate + branch/PR; mai due editor sullo stesso working-tree; mai due driver insieme.

VINCOLI ONESTI (non-di-parte): il loop cheap rende su backlog meccanico [AUTO-OK] + review decorrelata; il lavoro strategico/creativo (flagship grafo→tool, architettura, prodotto) resta umano+Claude-desktop. Reliability > cleverness. Misura tutto; ferma ciò che non migliora le metriche; preferisci la soluzione più semplice che regge (es. KeepAlive+dead-man's-switch batte uno scheduler "intelligente" fragile).

PRIMA MOSSA: (1) leggi i bin veri + verifica lo stato live (read-only); (2) instrumenta il cruscotto-metriche + il dead-man's-switch + l'auto-backlog (sono le 3 leve che chiudono i guasti dell'audit); (3) proponi le modifiche come piano (writing-plans) → approvazione → applica gate-verde. Aggiorna ARDESIA-ARCHITECTURE/COORDINATION/memoria.
```
