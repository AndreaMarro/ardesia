# Affidabilita e runbook

Fonte: verifiche read-only del 15/06/2026 su `~/lessonos-supervisor/{supervisor.log, ALERTS.md, state.env, supervisor-tick.sh}`, plist launchd, e journal del Mini via ssh. Audit di riferimento: audit:reliability, research:resilient-loop.

## Postmortem — stop di ~41 ore (CRITICAL)

**Cosa e successo.** `supervisor.log` registra tick continui fino a `2026-06-13T22:13:08Z`, poi un BUCO fino a `2026-06-15T15:31:26Z` (~41h18m, ~41 tick persi). La prima riga al risveglio e `SSH FAIL — Mini irraggiungibile`, preceduta da `muxclient: master hello exchange failed` / `Failed to connect to new control master`.

**Causa radice (confermata).** Il plist `com.elab.lessonos-supervisor` usa SOLO `StartInterval 3600` + `ProcessType Background`, senza `StartCalendarInterval` e senza wake `pmset` (verificato: cat del plist). `launchctl print` riporta `runs = 3`. launchd con StartInterval NON spara durante il sleep e NON sveglia il Mac (limitazione kqueue dal 10.11). Il MacBook ha dormito ~41h (coperchio chiuso/batteria) -> il timer non e mai scattato.

**Perche il "SSH FAIL" iniziale e un falso allarme.** Al risveglio il socket ControlMaster era stale (ControlPersist) -> hello-exchange fallito al primo tentativo, auto-risolto al tick dopo (`2026-06-15T16:33:38Z` torna a leggere i signals). E un effetto del wake, non un down reale del Mini. Severita MEDIUM.

**Fix.**
- StartInterval e la primitiva sbagliata su un laptop. L unico wake affidabile e `pmset` scheduled wake, ma su MacBook a batteria/coperchio chiuso e inaffidabile (Apple garantisce il wake solo collegato a corrente).
- Decisione strutturale: spostare il ruolo always-on/heartbeat sul Mac Mini (desktop, sempre alimentato). Il supervisore sul laptop diventa best-effort + catch-up-on-wake, NON la fonte di verita. Vedi [[Architettura-Sistema#difetto-di-design-critico-da-audit-1506]].
- Mitigazione minima sul laptop (se resta li): aggiungere `StartCalendarInterval` (coalesce-on-wake) cosi al risveglio il tick parte subito, invece di aspettare il prossimo intervallo.

## Loop Mini improduttivo (HIGH)
Il Mini e SU ma fermo. `~/maestro-logs/RESEARCH-lessonos.md` mostra tick continui `noop-fast | orch:pin esaurito (W2-M3, 0 builder)` (verificato fino a `2026-06-15T05:09:34Z`, HEAD `15534ab` fermo). Causa: coda ROADMAP-AUTO svuotata + cap 96/giorno raggiunto ("solo digest") + il deadlock promote noto sulla lane Hermes. Il supervisore non alza alert perche conta `noop-fast` come stato sano.
Fix (research:resilient-loop): coda pull-based con step di refill/seeding (mai a secco); age-based priority boosting contro la starvation; cap giornaliero come token-bucket con notifica esterna esplicita a cap raggiunto; distinguere noop-da-coda-vuota (anomalo) da noop-fisiologico nel conteggio di salute.

## Alert-fatigue (HIGH)
L alert `main STUDIO mosso 97303da -> 98ddb40 (NON acked)` si ripete (92 occorrenze in ALERTS.md, dal 10/06 al 15/06). `supervisor-tick.sh:68-70` alerta a ogni tick se mainS != baseline, ma `save_state` (riga 97) NON aggiorna mai `main_baseline_s`: `state.env` ha ancora `main_baseline_s=97303dab...` mentre il main reale e `98ddb40`. Nessun auto-ack possibile.
Fix: auto-ack/dedup (registra il nuovo baseline dopo il primo alert) + escalation-on-repeat. Pattern di liveness corretto: dead-man switch guidato da PROOF-OF-WORK (ping esterno solo quando c e stato lavoro vero), alert quando il work-ping non arriva nella finestra — non proof-of-liveness.

## Contraddizione di config (LOW)
Gli AGENTS.md operativi contraddicono la carta sul builder (DeepSeek vs opus-4-8). Vedi [[Allineamento-Due-Claude]] e [[Routing-Modelli-e-Costi]].

## Raccomandazioni strutturali
1. Heartbeat sul Mini, non sul MacBook.
2. Dead-man switch su proof-of-work con monitor esterno.
3. Coda mai a secco (refill + seeding + priority boosting).
4. Cap giornaliero come token-bucket con notifica esplicita.
5. Auto-ack + dedup + escalation-on-repeat sugli alert.
Tutte READ-ONLY: sono raccomandazioni, nessuna scrittura e stata fatta sul Mini.

## Runbook — comandi read-only (dal MacBook)
NB: tutto read-only. Mai git mutante sul Mini, mai toccare `eval/gate.sh`.
- Stato loop: `ssh -o BatchMode=yes -o ConnectTimeout=20 macmini 'tail -8 ~/maestro-logs/RESEARCH-lessonos.md'`
- Gate: `ssh ... macmini 'cd ~/lessonos && bash eval/gate.sh; git log --oneline -5 auto/main'`
- HEAD repo: `ssh ... macmini 'cd ~/lessonos && git rev-parse --short HEAD'`
- Log supervisore (locale): `tail -25 ~/lessonos-supervisor/supervisor.log`
- Alert (locale): `tail -20 ~/lessonos-supervisor/ALERTS.md`
- Stato launchd supervisore: `launchctl print gui/$(id -u)/com.elab.lessonos-supervisor | grep -iE 'runs|state'`
Azioni mutanti (kickstart tick, touch STOP) sono prerogativa del supervisore o di Andrea via Telegram, NON di questo vault.

Vedi anche: [[Architettura-Sistema]], [[Sicurezza]].
