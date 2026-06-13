# Ardesia — FONTE DI VERITA UNICA (allineamento)

Leggi QUESTO per primo. Governa tutti i Claude del sistema (supervisore, autonomo/audit,
brain/pianificatore, builder/sviluppatore) e Hermes. In conflitto con altri doc, vince questo.
Aggiornato 13/06/2026. Niente emoji nel sistema (output utente sobrio).

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

## 2. Ruoli e modelli (carta ratificata 12-13/06 — VINCE su ogni AGENTS.md piu vecchio)
Routing reale: `routes.env` + `bin/route.sh <ruolo>` (override Telegram: `~/.ardesia-routes.override`).
- **brain / pianificatore / progettista / scrittore-skill / corteccia** = fable-5 ultracode (-> opus-4-8 se giu -> sonnet). Pianifica, NON salta all'esecuzione.
- **builder / sviluppatore principale** (multiagente) = **opus-4-8** (-> sonnet). NB: fable-5 oggi INACCESSIBILE via token headless (problema Anthropic, rientra da solo) -> builder gira su opus. DeepSeek NON e' piu il builder principale (correzione: vecchi AGENTS.md dicono DeepSeek-builder = STALE).
- **research** (creativa/tecnica, testo/video/img/paper/youtube) = opus / kimi / (gemini solo API-paid per video, differito).
- **review** decorrelato free-first = codex -> gemini -> kimi -> claude. Mai lo stesso modello che ha scritto. (Gemini OAuth muore 18/06: il ladder cade su kimi/claude, non dipenderci.)
- **adversarial / red-team** (HERMES-2) = kimi (-> sonnet fallback).
- **audit** capo-ingegnere 2x/g (puo modificare tutto) + adversarial 1x/g = fable -> opus.
- **DeepSeek + Kimi** = motore/carburante dei due Hermes (orchestrazione, grind [GRIND], test, fallback di continuita). DeepSeek builda SOLO come fallback quando tutti i Claude Max sono out.
Principio: mai cambiare modello mid-sessione (= cache azzerata). Il routing e' per-invocazione.

## 3. Disciplina operativa (vincolante)
- Gate frozen (`eval/gate.sh`) = arbitro finale. MAI toccarlo ne indebolire i test.
- Pin scritti SOLO da supervisore/promote_pin/set_pin(ordine Telegram)/mark_pin_done(autoheal). Hermes NON edita i pin.
- Task chiusa SOLO con artefatto verificato su disco + numeri in STATUS. Test-verde != consegnato.
- Date solo con `date -u`. Commit appena il gate e' verde. MAI corpus nei commit (path si, contenuto no).
- Onesta brutale, zero compiacenza, numeri prima delle opinioni.

## 4. Allineamento dei due Claude (e di tutti)
- UNICA fonte di verita = questo file + `COORDINATION.md` (kernel REGOLE PERMANENTI + pin) + la memoria supervisore (`~/maestro-docs/SUPERVISOR-MEMORY.md`).
- Supervisore (MacBook, puo essere assente) e Autonomo (Mini: audit fable-ultracode) condividono questo file: quando il supervisore non c'e', l'audit agisce con lo STESSO contesto e gli STESSI vincoli.
- Brain (pianifica) e Builder (esegue) leggono entrambi questo file -> piano ed esecuzione partono dalla stessa visione.
- I prompt dei builder e l'audit puntano qui (via AGENTS.md). La chat Telegram supervisore carica questo contesto.

## 5. Sicurezza (vincolo Andrea "tutto deve essere sicuro")
- Telegram risponde SOLO a TG_CHAT (fail-closed). La chat LLM e' disarmata (`--tools ""`, `--max-turns 1`, testo via env mai in shell): non esegue comandi. Le AZIONI passano solo dai comandi whitelisted (pin/modello/stop), con argv (no shell injection).
- Override modelli: solo nomi in whitelist. Segreti mai in log/commit/wiki. Marketplace: sandbox+caps+firma.
- Residui noti: token OAuth builder visibile in `ps` (single-user Mini, basso rischio, da migrare a env-file); flock completo race COORD (mitigato verify+retry); chiave kimi da ruotare.

## 6. Stato corrente
M0/M1/M2 + T4(ELAB-plugin) completi. Coda 3 giorni: studio = UX/UI elegante senza emoji; lessonos = QA. Loop autonomo dual-lane, tick 300s, maratona, auto-heal, audit 2x/g, controllo Telegram. Dettaglio sempre fresco in `COORDINATION.md` e nella memoria supervisore.
