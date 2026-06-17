# Ardesia — FONTE DI VERITA UNICA (allineamento) — PROPOSTA RICONCILIATA

<!-- PROPOSTA O2 del 15/06/2026 — NON ANCORA DEPLOYATA. Richiede ratifica di Andrea.
     Risolve la contraddizione builder=opus (carta 13/06) vs DeepSeek-builder (AGENTS.md).
     Diff sostanziale rispetto alla 13/06: §2 builder con vincolo economico + condizione di
     revisione; §4 regola di subordinazione VINCOLANTE + puntatore bidirezionale carta<->AGENTS.md;
     §0-bis nuovo (precedenza e versionamento). Tutto il resto e' preservato verbatim. -->

<!-- ARDESIA-SSOT-CHARTER v=2026-06-15 supersedes=2026-06-13 -->

Leggi QUESTO per primo. Governa tutti i Claude del sistema (supervisore, autonomo/audit,
brain/pianificatore, builder/sviluppatore) e Hermes. In conflitto con altri doc, vince questo.
Aggiornato 15/06/2026 (riconciliazione SSOT). Niente emoji nel sistema (output utente sobrio).

## 0-bis. Precedenza e come si aggiorna questa carta (NUOVO — rende la SSOT vincolante)
- **Ordine di precedenza in caso di conflitto** (dal piu forte): (1) questa carta `ARDESIA-ALIGNMENT.md`; (2) `routes.env` + `~/.ardesia-routes.override` per il routing effettivo; (3) `COORDINATION.md` (kernel REGOLE PERMANENTI + pin); (4) **ogni `AGENTS.md`**; (5) ogni altro doc. Un `AGENTS.md` NON puo' ridefinire ruoli/modelli: descrive solo il *come* operativo. Se un `AGENTS.md` contraddice questa carta, la carta vince e l'`AGENTS.md` e' DA CORREGGERE (vedi `eval/lint-ssot.sh`).
- **Versionamento**: il marcatore `ARDESIA-SSOT-CHARTER v=<data>` in testa identifica la versione vigente. Ogni `AGENTS.md` deve dichiarare a quale versione e' subordinato (header, vedi §4). Il lint segnala chi punta a una versione vecchia.
- **Routing effettivo = sempre `routes.env`**, non il testo discorsivo: la carta dichiara la *volonta*, `routes.env` la *esegue*. Se divergono, allinea `routes.env` alla carta (o, se la decisione e' cambiata, aggiorna prima la carta con `date -u` e poi `routes.env`). Stato al 15/06: CONCORDANO (`ROUTE_BUILDER="claude-opus-4-8 claude-sonnet-4-6"`).

## 1. Identita e visione (cosa stiamo costruendo)
**Ardesia** (ex-MAESTRO): piattaforma per tutor/docenti, local-first, GDPR-by-design.
Catena: **lavagna che registra -> grafo del "come spieghi" (NO training del modello) -> dispense/contenuti verificati nel tuo stile -> vetrina + marketplace di tool didattici**.
- **Lavagna** minimal (stile GoodNotes) usata DAL DOCENTE; lo studente guarda, non tocca.
- **AI metodologica**: NON sostituisce il docente. Mappa il SUO metodo (grafo concetti, ricorrenze, betweenness) e suggerisce il tool/analogia giusto al momento giusto. Niente addestramento: solo memoria formalizzata del suo modo di spiegare.
- **Marketplace di tool** (plugin didattici visuali/interattivi): es. doppia fenditura, effetto tunnel, corpo umano smontabile, laboratorio chimico. Creati da TERZI o dal docente stesso (anche privati, non pubblicati). **I tool comprati sono IMMUTABILI** (solo settings, mai fork — istinto co-founder "always problems"; coerente con firma ed25519).
- **Recensioni a 2 pesi**: docente vota usabilita del tool; studente vota efficacia della lezione/del docente ("quell'insegnante mi e piaciuto"). Minori solo in aggregato anonimo. Classifica plugin stile GitHub.
- **CRM didattico**: lista studenti, obiettivi per-studente, materiali (PDF), resoconto automatico a fine lezione.
- **Modello business**: ZERO fee sulle lezioni (il docente trattiene il 100%; "lo strumento non fa l'esattore"). Ricavi = SaaS abbonamento docente + vendita plugin del marketplace. (Differenza da Superprof: niente tassa d'ingresso. Da Udemy: i contenuti li genera l'AI nel TUO metodo.)
- **GDPR Mode A** strutturale (definitivo): local-first, voce=dato biometrico, dichiarazione eta. E' il moat (Google non-EU-compliant per ammissione propria), non un costo.
- **Sicurezza marketplace**: filtro/scan all'ingresso dei plugin (sandbox iframe + caps + firma ed25519). Non troppa censura, ma niente "mostri" sulla lavagna.
- **ELAB = PRIMO plugin del marketplace** (dogfooding, T4 fatto: sim Arduino come tool firmato, demo Blink). Repo ELAB separati, harvest unidirezionale.
Visione integrale: `docs/PLATFORM-MAESTRO.md` (§3-bis/ter). Architettura sistema: `docs/ARDESIA-ARCHITECTURE.md`.

## 2. Ruoli e modelli (carta ratificata — VINCE su ogni AGENTS.md)
Routing reale: `routes.env` + `bin/route.sh <ruolo>` (override Telegram: `~/.ardesia-routes.override`). Il primo modello ACCESSIBILE della scala vince (probe builder: `bin/pick-build-model.sh`).

- **brain / pianificatore / progettista / scrittore-skill / corteccia** = fable-5 ultracode (-> opus-4-8 se giu -> sonnet). Pianifica, NON salta all'esecuzione.
- **builder / sviluppatore principale del codice-prodotto** (multiagente) = **opus-4-8** (-> sonnet). `routes.env`: `ROUTE_BUILDER="claude-opus-4-8 claude-sonnet-4-6"`. fable-5 e' INACCESSIBILE via token headless (problema Anthropic, rientra da solo); finche' e' giu il builder gira su opus. **DeepSeek NON e' il builder del codice-prodotto** (correzione 13/06: la vecchia dicitura "DeepSeek = ORCHESTRATORE PRINCIPALE + BUILDER" negli `AGENTS.md` e' STALE e va riformulata, vedi §4 + checklist).
- **DeepSeek + Kimi = motore/carburante dei due Hermes**: orchestrazione del loop, grind [GRIND], esecuzione test, summary, repo-scan, log-reduction (lavoro token-heavy a basso valore cognitivo, ~89x piu economico in output) e **fallback di continuita**. DeepSeek builda codice-prodotto SOLO come fallback quando TUTTI i Claude Max sono out. Hermes ORCHESTRA; il BUILD del codice che entra nel prodotto lo fa Claude (opus) via `worker.sh`.
- **research** (creativa/tecnica, testo/video/img/paper/youtube) = opus / kimi / (gemini solo API-paid per video, differito).
- **review** decorrelato free-first = codex -> gemini -> kimi -> claude. Mai lo stesso modello che ha scritto. (Gemini OAuth muore 18/06: il ladder cade su kimi/claude, non dipenderci.)
- **adversarial / red-team** (HERMES-2) = kimi (-> sonnet fallback).
- **audit** capo-ingegnere 2x/g (puo modificare tutto) + adversarial 1x/g = fable -> opus.
Principio: mai cambiare modello mid-sessione (= cache azzerata). Il routing e' per-invocazione.

### 2-bis. Vincolo economico sul builder=opus e CONDIZIONE DI REVISIONE (NUOVO)
> Questa nota NON cambia la decisione di Andrea (builder=opus resta il default ratificato): la rende
> **consapevole e datata**, non un default implicito, e fissa quando va ri-valutata.
- **Fatto esterno 15/06/2026**: `claude -p` headless / Agent SDK / GitHub Actions escono dal pool della sottoscrizione Max e passano a un **credito mensile separato a tariffe API piene, senza rollover**. Il loop ARDESIA gira proprio con `claude -p` headless sul Mini -> a credito esaurito le richieste si fermano o cadono su usage-credits a tariffa API. Questo e' coerente con gli eventi "out of extra usage" gia' loggati.
- **Smoking gun gia' nel sistema**: l'11/06 il default chat e' stato demoto opus->sonnet/haiku perche' "opus-default cannibalizza la quota Max condivisa"; il 13/06 builder=opus e' stato messo come ripiego forzato per l'inaccessibilita di fable-5, con warning esplicito "brucia quota Max piu in fretta di fable — sorvegliare".
- **Mitigazioni gia' in carta** che rendono opus-builder sostenibile: caching prefisso TTL 1h (cache-read 0.1x), compressione output-tool, subagent context-isolation con il lavoro economico DENTRO i subagent, vetting-gate pre-PR. Il risparmio viene da qui, non dal downgrade del builder.
- **CONDIZIONE DI REVISIONE (trigger di re-valutazione, da sorvegliare sul Mini)**: ri-decidere builder=opus vs builder-economico-DeepSeek/Kimi-con-Opus-reviewer SE si verifica anche solo UNO di: (a) il credito Agent-SDK mensile si esaurisce >1 volta/settimana con stop del loop; (b) il costo builder/giorno supera la soglia che Andrea fissera'; (c) fable-5 headless rientra (allora builder torna su fable per la coda taggata [FABLE], `ROUTE_BUILDER_FABLE`). In tal caso la revisione si apre con una misura sul **mix reale** (non su percentuali di marketing: 70%/25x/3-5x sono BOCCIATI), confrontando Opus-builder vs DeepSeek-builder+Opus-reviewer a parita' di gate verde.

## 3. Disciplina operativa (vincolante)
- Gate frozen (`eval/gate.sh`) = arbitro finale. MAI toccarlo ne indebolire i test.
- Pin scritti SOLO da supervisore/promote_pin/set_pin(ordine Telegram)/mark_pin_done(autoheal). Hermes NON edita i pin.
- Task chiusa SOLO con artefatto verificato su disco + numeri in STATUS. Test-verde != consegnato.
- Date solo con `date -u`. Commit appena il gate e' verde. MAI corpus nei commit (path si, contenuto no).
- Onesta brutale, zero compiacenza, numeri prima delle opinioni.

## 4. Allineamento dei due Claude (e di tutti) — REGOLA DI SUBORDINAZIONE VINCOLANTE
- UNICA fonte di verita = questo file + `COORDINATION.md` (kernel REGOLE PERMANENTI + pin) + la memoria supervisore (`~/maestro-docs/SUPERVISOR-MEMORY.md`).
- Supervisore (MacBook, puo essere assente) e Autonomo (Mini: audit fable-ultracode) condividono questo file: quando il supervisore non c'e', l'audit agisce con lo STESSO contesto e gli STESSI vincoli.
- Brain (pianifica) e Builder (esegue) leggono entrambi questo file -> piano ed esecuzione partono dalla stessa visione.
- **OGNI `AGENTS.md` e' SUBORDINATO a questa carta e DEVE dichiararlo** con il blocco-header SSOT in testa (vedi `_proposte/AGENTS-header-da-prependere.md`). L'header e' machine-parsable (marcatori `ARDESIA-SSOT-HEADER`) cosi che un lint possa verificarne la presenza. In conflitto su ruoli/modelli, **vince la carta §2**; l'`AGENTS.md` va corretto, non interpretato.
- **Puntatore bidirezionale**: la carta elenca quali file la implementano (vedi checklist di riconciliazione, sezione "Inventario"); ogni `AGENTS.md` rimanda alla carta. Cosi "i prompt puntano qui via AGENTS.md" diventa VERO e verificabile, non un'asserzione. (Al 15/06 era FALSO: `grep -l ALIGNMENT` sugli AGENTS.md = 0 match.)
- **Verificabilita (CI/pre-commit)**: `eval/lint-ssot.sh` (READ-ONLY, advisory finche' Andrea non lo promuove a gate) FALLISCE se un `AGENTS.md` (a) non contiene l'header SSOT, oppure (b) assegna a DeepSeek il ruolo di *builder principale del codice-prodotto* in contraddizione con §2. NON tocca `eval/gate.sh`.

## 5. Sicurezza (vincolo Andrea "tutto deve essere sicuro")
- Telegram risponde SOLO a TG_CHAT (fail-closed). La chat LLM e' disarmata (`--tools ""`, `--max-turns 1`, testo via env mai in shell): non esegue comandi. Le AZIONI passano solo dai comandi whitelisted (pin/modello/stop), con argv (no shell injection).
- Override modelli: solo nomi in whitelist. Segreti mai in log/commit/wiki. Marketplace: sandbox+caps+firma.
- Residui noti: token OAuth builder visibile in `ps` (single-user Mini, basso rischio, da migrare a env-file); flock completo race COORD (mitigato verify+retry); chiave kimi da ruotare.

## 6. Stato corrente
M0/M1/M2 + T4(ELAB-plugin) completi. Coda 3 giorni: studio = UX/UI elegante senza emoji; lessonos = QA. Loop autonomo dual-lane, tick 300s, maratona, auto-heal, audit 2x/g, controllo Telegram. Dettaglio sempre fresco in `COORDINATION.md` e nella memoria supervisore.

<!-- FINE PROPOSTA. Changelog vs 13/06: +§0-bis precedenza/versionamento; §2 builder riformulato + DeepSeek=motore non-builder esplicito; +§2-bis vincolo economico+condizione revisione; §4 regola subordinazione vincolante + header obbligatorio + puntatore bidirezionale + lint. Nessuna modifica applicata sul Mini. -->
