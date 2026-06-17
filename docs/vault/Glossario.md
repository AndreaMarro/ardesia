# Glossario

Termini del progetto Ardesia. Voci in ordine logico, non alfabetico.

## Ardesia
Nome attuale del progetto (ex-MAESTRO; cambio di branding, i path filesystem restano invariati). Piattaforma local-first per tutor/docenti. Vedi [[Visione]].

## MAESTRO
Nome precedente di Ardesia. Compare ancora in molti path e documenti (`~/maestro-docs`, `~/maestro-logs`, `MAESTRO-*.md`). Da NON confondere con "Numeria", che e un progetto separato.

## LessonOS
Motore didattico Python headless (libreria + CLI, niente UI/web/cloud). Pipeline: Lezione -> Lesson Capsule (estrazione grounded) -> Lesson Graph (DAG prerequisiti) -> Path Memory -> Didactic Delta -> Learning Debt -> Next Lesson Plan. Repo `~/lessonos`.

## Studio (maestro-studio)
Il repo TS/React della lavagna che registra. Lane di build separata (`driver-studio.sh`), gate tsc+vitest.

## Hermes
L agente builder/orchestratore del loop autonomo sul Mini. Hermes = motore DeepSeek (tiered) + Kimi-K2.6 (HERMES-2, vision/test/red-team). Vedi [[Routing-Modelli-e-Costi]] per i ruoli reali.

## Gate frozen (eval/gate.sh)
Arbitro finale del loop: pytest, emette {passed, failed, exit}. MAI toccarlo ne indebolirlo (la self-review LLM approva il 31.7% del codice rotto). Keep se verde e passed>=baseline, altrimenti git reset --hard.

## Pin / PROSSIMA TASK
La singola task attiva per repo (`## PROSSIMA TASK` in COORDINATION.md). Scritta SOLO da supervisore/promote_pin/set_pin/mark_pin_done. Hermes NON edita i pin (guard PINCOUNT).

## ROADMAP-AUTO
La coda di task pre-approvate ([AUTO-OK]) da cui promote_pin pesca quando il pin corrente si chiude.

## Maratona
Modalita in cui, chiusa la task pinnata, il loop promuove la successiva e prosegue nella stessa sessione (max 6 promozioni) per pagare il preambolo/cache una volta sola.

## Auto-heal
Meccanismo anti-gridlock: 2 NOOP consecutivi sullo stesso pin -> marca [PIN-DONE] e promuove dalla coda; coda vuota -> notifica. Vedi [[Affidabilita-e-Runbook]].

## noop-fast / pin esaurito
Stato del tick quando non c e lavoro da fare (pin gia chiuso o coda vuota). "orch:pin esaurito (... 0 builder)" = niente da costruire. Sintomo del fermo attuale del Mini.

## Supervisore
Il controllo orario sul MacBook (launchd `com.elab.lessonos-supervisor`). Deterministico: azioni sicure + alert, niente fix LLM autonomi. Vedi [[Architettura-Sistema]].

## tg-bridge
Il bridge Telegram sul Mini, unica interfaccia quando il MacBook e spento. Disarmato e fail-closed. Vedi [[Sicurezza]].

## ToolHost
Il bus che ospita i plugin/tool didattici del marketplace. ELAB Tutor si aggancia qui come primo tool first-party (gated M2).

## ELAB Tutor
Prodotto STEM/elettronica (kit+volumi+simulatore+UNLIM). Repo/brand separato; entra in Ardesia come primo grande tool del marketplace, dietro ToolHost, zero codice nel core.

## GDPR Mode A
Modalita local-first strutturale: contenuti sul PC del docente, audio mai in cloud, zero voci studenti by-design. La voce e trattata come dato biometrico. E il moat. Vedi [[Sicurezza]].

## ardesia-wiki
La wiki MACCHINA sul Mini (`~/ardesia-wiki`), alimentata dall automazione, sync `com.ardesia.wiki-sync` ogni 6h. Diversa da QUESTO vault (umano, sul MacBook). Non si modifica da qui.

## fable-5 / opus-4-8 / sonnet-4-6 / kimi / codex / DeepSeek
I modelli del routing per-ruolo. Vedi la tabella in [[Routing-Modelli-e-Costi]].
