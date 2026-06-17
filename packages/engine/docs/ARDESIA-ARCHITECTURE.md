# Ardesia — Architettura del sistema autonomo (v1, 13/06/2026)

Documento canonico. Config-driven: per variare l'architettura si modificano i file indicati,
non il codice. Niente emoji nel sistema (notifiche, UI, log destinati all'utente): stile sobrio.
Progetto ex-MAESTRO -> **Ardesia** (branding; i path filesystem restano invariati).

## 0. Principi

1. Onesta sui numeri. Gli slogan "70% / 25x / 3-5x" sono stati verificati avversariamente e BOCCIATI
   (marketing, cherry-pick, o unita sbagliate). Le uniche leve token con meccanismo verificato sono
   nella sez. 4. Misurare sul mix reale prima di fidarsi di qualunque percentuale.
2. Il gate frozen (`eval/gate.sh`) e' l'arbitro finale. La review LLM non basta (self-review approva
   il 31.7% del codice rotto). MAI toccare il gate.
3. Cambio modello = nuova invocazione / subagente, MAI mid-sessione (cambiare modello dentro un agente
   invalida tutta la cache = full cache-miss, verificato). Il routing e' per-ruolo, per-invocazione.
4. Tutto correggibile dinamicamente: da malfunzione (auto-fallback) o da Telegram (override).
5. Autonomia reale: il Mini non dipende dal MacBook. Nessun deadlock silenzioso (auto-heal).

## 1. Ruoli e modelli (routing)

Fonte di verita: `~/lessonos/routes.env` (default) + `~/.ardesia-routes.override` (dinamico, vince).
Risolutore: `bin/route.sh <ruolo>`. Il primo modello ACCESSIBILE della scala vince
(probe per i builder: `bin/pick-build-model.sh`).

| Ruolo | Primario | Scala fallback | Razionale |
|---|---|---|---|
| brain (pianifica/progetta/skill/corteccia) | fable-5 | opus-4-8, sonnet-4-6 | visione e decomposizione; fable e' la corteccia, opus quando fable e' giu |
| builder (sviluppo, multiagente) | opus-4-8 | sonnet-4-6 | la qualita del codice e' il prodotto; il risparmio viene da caching+subagent, non dal downgrade |
| research (ricerca multiagente) | opus-4-8 | fable-5 | ricerca tecnica/creativa profonda; web nativo |
| review (decorrelato, free-first) | codex | gemini, kimi, fable-5, opus-4-8 | mai lo stesso modello che ha scritto; cross-family |
| adversarial (red-team) | kimi | (solo kimi) | HERMES-2, lente di famiglia diversa dal builder |
| audit (2x/g, puo modificare) | fable-5 | opus-4-8 | capo-ingegnere che rivede tutto il progetto |

Note honest dalla ricerca (advisory, NON vincolanti sulla volonta di Andrea):
- Il modello piu forte come PLANNER e' subottimale ("risponde diretto e bypassa il protocollo",
  paper AgentOpt). Pattern migliore = planner che rispetta il protocollo + modello forte come ADVISOR
  on-demand (advisor tool server-side Anthropic, beta). Tenuto come TRIAL (sez. 4), non default.
- Lavoro token-heavy a basso valore cognitivo (repo-scan, summary, log-reduction) sta su DeepSeek Flash
  (~89x piu economico in output). Gia' cosi per il summary di hermes (kimi) e i grind.

Stato 13/06: fable-5 INACCESSIBILE via token headless (rollout Anthropic non esteso a setup-token) ->
brain/audit cadono su opus-4-8 da soli; il routing ripiglia fable quando torna (notifica automatica).

## 2. Loop di costruzione

- launchd `com.elab.lessonos-hourly`, StartInterval 300s -> `bin/hourly-tick.sh`.
- Dual-lane: `driver-orch.sh` (lessonos, Python) + `driver-studio.sh` (studio, TS/React) in parallelo.
- MARATONA: chiusa la task pinnata -> `promote_pin.py` -> prosegue nella stessa sessione (max 6
  promozioni). Timeout 7200s, task [LUNGA] 14400s, coda piena -> tetto 14400. Sessioni lunghe (60-240min).
- Pin: `## PROSSIMA TASK` (1 riga/repo). Coda pre-approvata: `## ROADMAP-AUTO` ([AUTO-OK]).
- Pin scritti SOLO da: supervisore, `promote_pin.py`, `set_pin.py` (ordine Telegram), `mark_pin_done.py`
  (auto-heal). Hermes/builder NON editano i pin (guard PINCOUNT).

## 3. Auto-heal anti-gridlock (autonomia)

Classe di guasto ricorrente: task chiusa ma pin non ruotato -> NOOP infinito -> STOP.
Fix (`bin/autoheal.sh` + `bin/mark_pin_done.py`, chiamati dal driver):
- 2 NOOP consecutivi sullo stesso pin -> marca il pin [PIN-DONE auto] -> `promote_pin` dalla coda;
  se la coda e' vuota -> notifica Telegram una volta ("coda <repo> vuota, in attesa di ordine").
- reset dello streak su ogni commit 'pass'.
- Nota di trasparenza in NEEDS-CLAUDE; se la task era BLOCCATA (non fatta), Andrea la ripinna da Telegram.

## 4. Token-efficiency (misure verificate)

ROI decrescente. Numeri = direzione, non budget: misurare sul mix reale.
1. **Prompt caching, prefisso byte-identico, TTL 1h** (leva #1). cache-read = 0.1x input (~90% sconto sul
   prefisso ripetuto system+tooldef+CLAUDE.md). Il tick a 300s con TTL default 5min FA SCADERE la cache a
   ogni giro -> serve TTL 1h. Minimi cacheabili: 4096 tok (opus), 2048 (fable/sonnet): sotto soglia = zero
   cache. Verificare il prefisso con count_tokens. (Implementazione: pin dedicato, vedi coda.)
2. **Compressione output-tool** (test/git/grep -> solo segnale) prima che entri in contesto. Per un builder
   che gira test, l'output test domina l'input-token: 50-85% sul canale tool. (pin dedicato.)
3. **Subagent context-isolation**: lavoro verboso nei subagent, al main torna solo il summary; il routing
   economico va NEI subagent (mai cambio-modello nel main = full cache-miss).
4. **Handoff packet self-contained + evidence-compression** + **vetting-gate pre-PR** (il saving netto e'
   sempre < del lordo: i worker economici allucinano, vanno ri-verificati sui finding high-impact).
5. **CLAUDE.md/MEMORY minimal**: caricati a ogni tick. CLAUDE.md builder gia' terso. MEMORY.md indice da
   tenere < ~200 righe.
6. **TRIAL advisor tool** (Sonnet/Haiku esecutore + Opus advisor in 1 call): -11.9%/-85% costo sui benchmark
   citati. Da provare quando claude -p espone l'advisor.

BOCCIATI: 70%, 25x, 3-5x, 35x, 75%-caveman. caveman utile sull'OUTPUT (frazione minore del costo per chi
scrive codice); tenuto sul supervisore, poco utile sui builder.

## 5. Audit e auto-miglioramento

- **Audit 2x/giorno** (`bin/ardesia-audit.sh`, fable-ultracode -> opus se giu): rivede stato progetto+codice
  di entrambi i repo, PUO applicare modifiche (gate verde + commit), poi un contro-audit AVVERSARIO 1x/giorno.
  Prende il lock del tick (serializza col loop). Schedulato launchd.
- **Catchup** (`fable-catchup.sh`): a quota riaperta -> skill-coach (migliora UNA skill dagli errori veri) +
  retro-review (commit non revisionati). Auto-miglioramento continuo delle skill.
- **Strategos**: capo-ingegnere proattivo, propone ordini (non applica). Ratifica = supervisore/Andrea.

## 6. Controllo Telegram (interfaccia unica con MacBook spento)

`tg-bridge.py` (launchd KeepAlive). Comandi: stato, stop, riprendi, critici, report, evoluzione, coda,
`modello [<ruolo> <nome>|reset]`, `pin <repo> <task>`, `fable <q>`, `opus <q>`, testo libero (chat).
Gli ordini (pin) e i cambi-modello (override) entrano subito, attivi dal tick successivo. Stile no-emoji.

## 7. Decisioni e rischi aperti

- **Gemini OAuth muore**: ban third-party 25/03 + sunset consumer 18/06. Il gradino `gemini` di review.sh
  si rompera' -> NON dipenderci (il ladder cade su kimi/claude). Gemini solo come API-key paid per video
  (multimodale), differito a quando serve ingestione media.
- **Terzo Hermes**: NON ora. Solo capability differita (Gemini API per video). Non e' game-changer come builder.
- **fable-5 headless**: dipende da Anthropic; auto-recupero gia' cablato.
- **progettibelli**: A1+A2 stesso account (stessa quota). A3 dormiente per un 3o account futuro.

## 8. Come variare l'architettura

- Routing: edita `routes.env` (default) o da Telegram `modello <ruolo> <nome>` (override runtime).
- Cadenza loop: StartInterval del plist; timeout nei driver.
- Cadenza audit: plist `com.ardesia.audit`.
- Modelli per ruolo: routes.env. Soglie auto-heal: `bin/autoheal.sh`.
