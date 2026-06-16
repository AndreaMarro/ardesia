---
tipo: prompt-ripartenza
versione: v4
data: 2026-06-16 notte
incolla-per: ripartire ARDESIA — lavoro GENERALE, PARALLELO SU TUTTO, con la visione corretta
---
# ARDESIA — PROMPT RIPARTENZA v4  `/ultrathink:ultrathink`  `/using-superpowers`

## Chi sei, regole ferree
Sviluppatore/architetto di ARDESIA. Andrea = UNICO dev, la sua reputazione dipende da questo. Massima ONESTA, NON compiacere mai, **verifica i claim a `file:riga` prima di dichiararli veri**, niente dati finti/mock, se non funziona dillo CON LA PROVA. **Niente Workflow-background (muoiono al resume) → SINCRONO (Agent foreground, NON il tool Workflow).** Terso ok. MAI confondere ARDESIA / ELAB / NUMERIA.

## 🟥 VISIONE CORRETTA (il cuore — leggi PRIMA di tutto)
**Due moat DISTINTI, mai confonderli:**
- **ELAB-tutor = PLUGIN** (primo prodotto SULLA piattaforma). Moat = **book-fidelity (circuiti identici ai libri) + GDPR-minori + MePA/PNRR + filiera-editori (Omaric/Fagherazzi/Arduino)**. Vince sulla fedelta-al-libro, NON out-simulando Wokwi/Tinkercad. Guida con questo, NON col "marketplace".
- **ARDESIA = la PIATTAFORMA** (lavagna unica + ecosistema plugin-LEGO + AI-method-graph lessonos + marketplace). Moat su 4 livelli: (1) REALE **GDPR local-first by-architecture** (US-giganti non eguagliano senza ri-architettare); (2) REALE **proprieta del workflow-docente, tutor-first** (dove Google/MagicSchool sono deboli); (3) ASPIRAZIONALE = **method-graph per-docente + StyleProfile** (switching-cost che compone) — **oggi DEBOLE (grafo rado) = la PRIORITA di costruzione del moat-piattaforma**; (4) LATE = ecosistema/marketplace network-effect (no-dev=liability, non lanciarlo presto).
- **L'architettura lavagna+plugin NON e il moat** (copiabile 6-18mesi; MakeCode+LTI provano il pattern) — e l'ABILITATORE che accumula i moat. Il verdetto "architettura copiabile" vale SOLO per il pitch-plugin.
- I plugin = strumenti (anche avanzati) che si attaccano come LEGO alla STESSA lavagna (il software non cambia), max liberta creativa per chi li crea, sandboxed.

## PRIMA DI TUTTO (in ordine)
1. **Memoria**: `~/.claude/projects/.../memory/MEMORY.md` (invariante moat in cima) + `ardesia-audit-headless-cutover-15jun.md` (= SoT, stato 15-16/06) + `maestro-loop-operativo.md`.
2. **Vault Obsidian** `~/ARDESIA-VAULT/`: `14-ELAB-PLUGIN-LAVAGNA-spec-competitive` (spec plugin + ricerca verificata + moat), `13-AUTOMIGLIORAMENTO-BRAINSTORM`, `08-FUNZIONALITA-E-ARCHITETTURA-PARALLELE`, `02-METAPIANO`, `11-ARCH-fabbrica-autonoma`, `_status/litellm-keystone`.
3. **PDF spec**: `_inbox/01-specifiche-funzionali.pdf` (RF A-L, SDK §6, modello-dati §5). NO-fee lezioni (vince Andrea su RF-J-02).
4. **Stato live (RI-verifica, non assumere)**: `ssh macmini`; `ssh macmini python3 ~/maestro-tools/factory-metrics.py --digest` (KPI fabbrica); `gh` via Mini (`ssh macmini gh ...` = canale GitHub autenticato); `bash ~/litellm/spend-report.sh`.

## ✅ FATTO + DURABILE 16/06 notte (tutto su GitHub, sopravvive a reboot/down — NON rifare)
- **Instrumentazione factory-metrics + cost-metering** (ardesia-tools `6e2efb6`): `factory-metrics.py` parsa RES+log.jsonl → KPI + digest TG giornaliero (launchd `com.ardesia.factory-digest` 21:00) + spesa LiteLLM reale.
- **2 BUG ROOT-CAUSE dello stallo-3g CHIUSI**: cap-fix `cc59677` (conta build VERI non noop gratis) + deadman `a141ea3` (segnale BUILD-STARVATION = 0-build-veri + lavoro-in-coda).
- **RunAtLoad=true** sul tick (`4abb7fa`) — riparte al boot. ⚠️ post-reboot a volte serve `launchctl kickstart -k gui/$(id -u)/com.elab.lessonos-hourly`.
- **GS-1** (rank_bridge_concepts via betweenness, 5 commit lessonos) + **GS-2** (`7499b57` fuzzy prereq zero-falsi). **Onesto: densificazione MARGINALE (depends_on 32→33). String-match e l'approccio sbagliato.**
- **Canale GitHub** = `ssh macmini gh` (autenticato, scopes repo/workflow/read:org/gist; no delete/admin). MacBook-gh rotto = MOOT.
- **Brainstorm auto-miglioramento** (`659b9d9`) + **spec ELAB-plugin+ricerca+moat** (`49c05d7`/`94ef85f`).

## ⚠️ APERTO (onesto)
- 🔴 **adversarial `205dd8a`: 1 CRITICO su GS-2 — triagiare** (probabile FP, ma fresco).
- **GS-3 = densificazione method-graph UPSTREAM** (ingest LLM canonicalizza nomi-prereq a concetti ESISTENTI, o embedding-semantico). String-match e morto (GS-1 no-op, GS-2 +1). **= costruzione del moat-piattaforma livello-3.**
- **Gridlock ricorrente**: pin non auto-ruotato dopo build → thrash blocked/noop (ruotato a mano 2× stasera). **Fix durevole: autoheal marca [PIN-DONE] su blocked/noop di pin-gia-chiuso (Hermes-lane).**
- **Mossa #2 LiteLLM cutover** (cost/cache metered sulle CHEAP; opus resta diretto): step-0 = aggiungere alias `deepseek-reasoner`+`kimi-k2.6` a `~/litellm/config.yaml` (gateway ha solo deepseek-chat/kimi-k2) → poi puntare `adversarial.py:117`+`review-kimi.py:25`+`~/.hermes/config.yaml`(base_url) a `127.0.0.1:4000/v1`. Edit+restart+test ATOMICO (il restart disturba PLAN-CHECK 55s → fallo a loop calmo).
- **Verifica Studio-canvas** (su cosa e costruito: Konva/Excalidraw/custom) prima di scelte canvas. tldraw=$6k/yr+kill-switch (evita), Excalidraw=MIT.
- obs agentmemory 0 (ri-popola da import); mem0-prodotto da deployare; ogg 13/06 da trascrivere.
- 🔴 **RESTA A ANDREA (4 azioni)**: gh-auth MacBook (token invalidi ~/.zshrc:30-31); abilitare Obsidian-Sync sul vault; ruotare chiave Kimi (esposta); verificare billing Claude (metered vs subscription).

## 🔀 LAVORO IN PARALLELO SU TUTTO (il modello operativo)
**Antiregressione totale** (gate frozen + ratchet + CI affected + branch-protection + canary). MAI auto-merge. Deploy solo con OK Andrea.
**Chi fa cosa in parallelo:**
- **FABBRICA (sistema auto-migliorante)** — ora SANA (2 bug chiusi, instrumentata, reboot-robusta). Loop autonomo = grind CHEAP non-Claude (DeepSeek/Kimi via LiteLLM capped) + Claude-apex-bookend (opus via `claude -p`, 2 Max a turno). Closed-loop ROI gated (instrumenta→meta-agente propone 1 cambio→canary+gate→keep/revert). Mossa #2 (cutover). Skill auto-migliorate. **2 cron-routine Claude (research+control) launchd-Mini = futuro, DOPO LiteLLM-cutover + instrumentazione** (proponenti non esecutori, account isolato dall'interattivo).
- **LANE ENGINE** (lessonos, il LOOP costruisce sotto gate): **GS-3 method-graph-richness (= moat-piattaforma liv.3, PRIORITA)**, CRM-primitives, retrieval-hybrid M7. Pin via ROADMAP-AUTO (`[AUTO-OK] lessonos: ...`).
- **LANE STUDIO** (TS): lavagna + ToolHost + **plugin-SDK = Layer-0 contratti (SBLOCCA il parallelo)** + plugins/elab. Verifica canvas.
- **LANE PLUGIN ELAB-tutor** (moat=contenuto+editori): build-on **avr8js+wokwi-elements (MIT)**; **breadboard+analog+layout-LIBRI = costruire noi** (nessuna lib MIT; riusa netlist union-find SIM-C). Primo plugin LEGO board-embed (manifest elab-blink ed25519 esiste). Pilota: 1 esperimento book-accurate end-to-end.
- **LANE COMMERCE** (dopo il wedge / parallelo se WTP validato): identity/booking/web/payments(NO-fee)/video-WebRTC/notify/admin. GDPR local-first.
- **Contratti Layer-0 PRIMA** (`packages/contracts` §5 + `plugin-sdk` §6 + ToolHost + `ui` + auth/consenso-minori) → poi le 3 lane in parallelo (1 package = 1 worktree = 1 gate). **Monorepo `ardesia` Nx = da bootstrappare (ratifica Andrea: DOVE + forche GDPR/dati).**

**Concretamente:** il LOOP autonomo macina ENGINE+STUDIO sotto gate (code piene allineate alla visione: engine=method-graph, studio=plugin-sdk, plugin=elab-book-fidelity); IO (Claude-desktop con Andrea) = apex/architettura/supervisione/decisioni/triage; le cron-routine future coprono research+control. Telegram = control-plane (stato/coda/pin/modello + foto).

## Modelli / memoria / architettura
Grind = cheap non-Claude via LiteLLM capped (DeepSeek-V4→Kimi-K2.6; review codex→kimi; adversarial kimi). Apex = Claude opus→sonnet via `claude -p` (2 Max a turno, salta l'account interattivo di Andrea). fable-5 SOSPESO. GLM-5.2 = TRIAL. agentmemory=memoria FABBRICA; mem0=PRODOTTO (da deployare). **FABBRICA vs PRODOTTO** (GDPR runtime SOLO prodotto, no PII nei nodi-agente).

## Tooling sessione
`ssh macmini` stato live · `factory-metrics.py --digest` KPI · `ssh macmini gh ...` canale GitHub · `~/litellm/spend-report.sh` costi · niente Workflow-bg (SINCRONO) · verifica `file:riga`.

## ORA: riparti IN PARALLELO SU TUTTO, con la visione corretta
Dopo memoria+vault+PDF + verifica live: **proponi UNA prossima azione concreta PER LANE** (fabbrica / engine / studio / plugin-elab / commerce) con la prova dello stato, e procedi sincrono sulla piu sbloccante. Onesta brutale. Mai confondere moat-plugin (ELAB: book-fidelity+MePA) con moat-piattaforma (ARDESIA: local-first + workflow-docente + method-graph + ecosystem).
