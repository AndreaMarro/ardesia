# Architettura del sistema

Fonte: `~/ardesia-wiki/Architettura/ARDESIA-ARCHITECTURE.md` (v1, 13/06), `~/lessonos-supervisor/CHARTER.md`, e verifiche live (15/06) citate sotto.

Documento canonico config-driven: per variare l architettura si modificano i file indicati, non il codice.

## Le due macchine

### Mac Mini (sempre acceso, utente progettibelli)
- Esegue il LOOP autonomo di costruzione su due repo: `~/lessonos` (Python, motore) e `~/maestro-studio` / `studio` (TS/React, lavagna).
- Ospita il BRIDGE Telegram (`tg-bridge.py`, processo vivo) e l audit Ardesia 2x/giorno.
- Mantiene `~/ardesia-wiki` (wiki macchina, sync `com.ardesia.wiki-sync` ogni 6h).
- E il nodo always-on: il Mini NON dipende dal MacBook (principio di autonomia, ARDESIA-ARCHITECTURE.md sez. 0).

### MacBook (questa macchina)
- SUPERVISORE deterministico: launchd `com.elab.lessonos-supervisor`, StartInterval 3600s, ProcessType Background (verificato: `~/Library/LaunchAgents/com.elab.lessonos-supervisor.plist`).
- Nessun loop di build qui. Solo controllo orario via ssh read-only, azioni sicure (kickstart tick), alert.
- LIMITE STRUTTURALE: e un laptop e dorme. Quando dorme, il timer launchd non spara e non sveglia il Mac. Vedi [[Affidabilita-e-Runbook]] (postmortem stop 41h).

Accesso al Mini dal MacBook: SOLO read-only, `ssh -o BatchMode=yes -o ConnectTimeout=20 macmini '<cmd read-only>'`.

## Il loop di costruzione (sul Mini)
- launchd `com.elab.lessonos-hourly`, StartInterval 300s -> `bin/hourly-tick.sh` (verificato sul Mini: il plist usa StartInterval 300, non StartCalendarInterval — sul Mini va bene perche non dorme).
- Dual-lane: `driver-orch.sh` (lessonos) + `driver-studio.sh` (studio) in parallelo.
- MARATONA: chiusa la task pinnata -> `promote_pin.py` -> prosegue nella stessa sessione (max 6 promozioni). Timeout 7200s, task [LUNGA] 14400s.
- Pin (`## PROSSIMA TASK`, una riga per repo) scritti SOLO da: supervisore, `promote_pin.py`, `set_pin.py` (ordine Telegram), `mark_pin_done.py` (auto-heal). Hermes/builder NON editano i pin (guard PINCOUNT).
- Coda pre-approvata: `## ROADMAP-AUTO` con marcatori [AUTO-OK].
- Gate frozen `eval/gate.sh` = arbitro finale (pytest, emette {passed, failed, exit}). MAI toccarlo: la self-review LLM approva il 31.7% del codice rotto. Ratchet keep/revert.

## Auto-heal anti-gridlock
Classe di guasto ricorrente: task chiusa ma pin non ruotato -> NOOP infinito -> STOP.
Fix (`bin/autoheal.sh` + `bin/mark_pin_done.py`): 2 NOOP consecutivi sullo stesso pin -> marca [PIN-DONE auto] -> promote dalla coda; coda vuota -> una notifica Telegram. Reset dello streak su ogni commit pass.
Limite noto: l auto-heal del pin stale vive nel prompt MARATONA di fable, NON nella lane Hermes-DeepSeek (che scrive solo NOOP-doc). Vedi [[Affidabilita-e-Runbook]].

## Il bridge Telegram (interfaccia unica quando il MacBook e spento)
`tg-bridge.py` (launchd KeepAlive). Comandi: stato, stop, riprendi, critici, report, evoluzione, coda, `modello <ruolo> <nome>|reset`, `pin <repo> <task>`, `fable <q>`, `opus <q>`, testo libero (chat). Gli ordini e i cambi-modello entrano subito, attivi dal tick successivo. Dettagli di sicurezza in [[Sicurezza]].

## Il supervisore (MacBook)
Fonte: `~/lessonos-supervisor/CHARTER.md`, `supervisor-tick.sh`.
Controlla ogni ora (quando il Mac e sveglio): gate failed:0/exit:0, groundedness 100%, progresso HEAD, no grind, costo/iter, main intatto, drift docs, salute review.
Azioni sicure automatiche: kickstart del tick stallato; touch STOP su grind (>=3 noop/REVERT); correzione drift docs. ESCALA ad Andrea (ALERTS.md + Telegram) su: gate rosso persistente, 2 REVERT di fila, main mosso, separazione violata, chiavi esposte. MAI: merge auto/main->main, push GitHub, deploy, indebolire il gate, toccare numeria/elab-tutor, scrivere segreti.

## Difetto di design (critico, da audit 15/06)
La rete di sicurezza (alert, supervisione) sta sul laptop FRAGILE che dorme, mentre il Mini sempre-acceso muore in silenzio: tutti gli alert Telegram vivono sul Mini e segnalano solo report/audit, mai la morte produttiva del loop. Il ruolo always-on/heartbeat dovrebbe stare sul Mini (desktop, sempre alimentato), non sul laptop. Vedi [[Affidabilita-e-Runbook#raccomandazioni-strutturali]].

Vedi anche: [[Routing-Modelli-e-Costi]], [[Sicurezza]], [[Glossario]].
