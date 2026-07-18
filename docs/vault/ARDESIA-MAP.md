# ARDESIA — MAPPA D'ORIENTAMENTO · struttura + snapshot storico · agg. 2026-07-18

> Documento di orientamento per umani **e** agenti della fabbrica. Per struttura e navigazione vale
> questa mappa e `docs/CANON-INDEX.md`. Gli ordini espliciti di Andrea, la decisione corrente e i relativi
> gate determinano intento e autorità; evidenza prodotto/test/Git e receipt legati allo SHA determinano
> i fatti, ma non concedono permessi. Un conflitto o un path stale è STOP e va riconciliato.
> NB: codename interno = **MAESTRO** (locale `~/maestro-*`); su GitHub i repo sono **`ardesia-*`**.

> **Avviso di freschezza:** le sezioni 1–4 e 7 conservano lo snapshot operativo del 17/06/2026
> per orientamento storico. Porte, processi, branch, conteggi e loop lì descritti non sono istruzioni
> da eseguire e devono essere riverificati firsthand. La nuova governance memoria è soltanto
> **PROPOSED / NO CUTOVER**: AgentMemory è escluso dai workflow attivi e dal fallback; il servizio
> storico non è stato disabilitato e non va fermato o descritto come sostituito senza i gate A8a/A8b.

---
## 1. Le due macchine — inventario storico del 17/06
| Macchina | Ruolo | Cosa ci gira |
|---|---|---|
| **Mac mini** (`progettibelli@Mac16,10`, Tailscale `100.124.198.59`) — *la FABBRICA, always-on* | Snapshot storico: dove avveniva il lavoro automatico | Snapshot storico: loop launchd, gateway LiteLLM, AgentMemory, tg-bridge, deadman, strategos, replenish, architect, hermes2-adjudicate. Riverificare prima di qualsiasi azione. |
| **MacBook** (`andreamarro`) — *supervisore + autoring prodotto + vault, intermittente* | Supervisione + sorgente prodotto ELAB + Obsidian | Snapshot storico: supervisor, tunnel AgentMemory, vault legacy e `VOLUME 3/PRODOTTO/elab-builder`. Non usare i vault legacy come fonte corrente senza riconciliazione. |

Accesso Mini dal MacBook: `ssh macmini`. Il tunnel AgentMemory indicato in precedenza è un fatto storico,
non un fallback autorizzato. Nessun listener o tunnel Basic Memory permanente è approvato da questa mappa.

---
## 2. I repo (tutti PRIVATI su github.com/AndreaMarro)
### Piattaforma ARDESIA (la fabbrica costruisce QUI)
| GitHub | Locale (Mini) | Ruolo |
|---|---|---|
| `lessonos` | `~/lessonos` | **Engine** Python: ingest lezioni → grafo-metodo per-docente → recap grounded (ZERO-LLM) → retrieval-hybrid → CRM. Gate: `uv run pytest`. |
| `ardesia-studio` | `~/maestro-studio` | **Lavagna** TS/React/Vite, canvas **Excalidraw**, ToolHost↔plugin SDK Layer-0. Gate: `tsc -b` + vitest. |
| `ardesia-tools` | `~/maestro-tools` | **Tooling fabbrica**: deadman, strategos, research, notify-telegram, factory-metrics. |
| `ardesia-vault` | `~/ardesia-vault` (+ MacBook) | Sorgente legacy/storica da inventariare e riconciliare; non promuovere o indicizzare in massa. |
| `ardesia-wiki` | — | Wiki di progetto. |

Il piano corrente propone come fonte canonica umana un repository Git **privato e pulito**, aperto in
Obsidian: `/Users/andreamarro/ARDESIA-KNOWLEDGE` sul MacBook e
`/Users/progettibelli/ARDESIA-KNOWLEDGE` sul Mini. Non confonderlo con vault sporchi o corpus legacy.

### Prodotti SEPARATI (la fabbrica NON li tocca)
- `elab-tutor` — **prodotto ELAB** (React 19, simulatore + tutor Galileo). 6 PR aperte/draft FERME (#195-#200). ⚠️ DA PROGETTARE a parte (decisione Andrea).
- `elab-galileo-nanobot`, `elab-volumi`, `elab-website`, `unlim-intelligente` — ecosistema ELAB.
- `numeria`, `numeria-lab`, `numerical-lab-journey` — **Numeria** (progetto separato; MAI confondere con ARDESIA/ELAB).

---
## 3. Branch — snapshot storico, non policy operativa corrente
- **`auto/main`** = branch del BOT. Il loop pusha qui DIRETTAMENTE (push diretti, niente PR). Protetto SOLO dal gate locale (`eval/gate.sh`, tieni-se-verde) + CI-visibilità. **MAI** branch-protection PR qui (bloccherebbe il loop).
- **`main`** = branch RATIFICATO (umano). Il loop NON lo tocca. Merge `auto/main→main` SOLO via PR validata dalla CI (+ OK Andrea). → protetto (richiede check CI + PR).
- Stato **storico** 17/06: lessonos `auto/main` 824 commit (default branch), `main` fossile (8/06). studio `main` vuoto, lavoro su `auto/main`. tools su `main` diretto. Riverificare gli SHA e i branch remoti prima di lavorare.
- Durabilità: `origin` = dual-pushurl (mirror locale + GitHub). Il **deadman** ogni 600s fa SELF-HEAL (pusha i commit non-da-build, allerta solo su push fallito reale).

---
## 4. Il LOOP — descrizione storica, non autorizzazione all'avvio
`launchd com.elab.lessonos-hourly` ogni **300s** → `bin/hourly-tick.sh` (repo da `~/.maestro_active_repo` = `both` → dual-lane parallelo):
1. **ARCHITECT** (opus, se pin architetturale): `bin/architect.sh` → design pre-build → `ARCHITECT-CURRENT.md`.
2. **ORCHESTRATORE** (DeepSeek): OODA — orient → plan → PLAN-CHECK (`fable.sh`=opus).
3. **BUILD** (opus-4-8 ultracode su account A1): `driver-orch.sh`/`driver-studio.sh` → scrive codice+test → `eval/gate.sh` VERDE → commit → push (se KEPT).
4. **SELF-ADV** (opus, sul proprio diff) + **REVIEW** (`review.sh`=opus decorrelato).
5. **HERMES-2** (kimi, red-team decorrelato post-keep) → se CRITICO → **AGGIUDICA** (opus, `hermes2-adjudicate.sh`).
6. **DIGEST** (zero-LLM) → Telegram. **REPLENISH** (`bin/replenish.sh`, deepseek): se backlog<2 genera task.
- **Pin storico**: `COORDINATION.md §PROSSIMA TASK` nel repo originario (oggi archiviato come
  `packages/engine/COORDINATION.md`); non è un ordine corrente. Backlog `§ROADMAP-AUTO` `[AUTO-OK]` →
  `promote_pin.py` promuoveva a esaurimento.
- **Cap**: `LESSONOS_DAILY_CAP=96` (esplicito, plist) — ceiling soft. **Limitatore vero = `quota.sh`** (hard-stop a quota-out → degrada a DeepSeek). Visibilità burn opus nel digest.

Questa sequenza documenta il comportamento storico. **Prompt B e loop overnight restano OFF**;
non avviarli, riattivarli o assumerli sani senza una decisione umana esplicita e nuovi controlli firsthand.

### Ruoli-modello — snapshot storico
| Ruolo | Modello |
|---|---|
| architect, build, self-adv, review, plan-check, research, strategos, **aggiudica-critici** | **opus-4-8** (claude -p, A1/A2; quota-gated, fallback DeepSeek) |
| red-team finder HERMES-2 | **kimi** (decorrelazione cross-family) |
| orchestratore OODA, replenish-strategist | **deepseek-v4-pro** (gateway LiteLLM capped $30) |
- Grind cheap via LiteLLM (`deepseek-chat`→deepseek-v4-pro, `kimi-k2`→kimi-k2.7-code). Opus via `claude -p` diretto (NON gateway). `apex-claude`=dead-endpoint intenzionale.

---
## 5. Invarianti di prodotto (NON violabili dal codice)
- **GDPR / local-first**: PII e corpus reale (studenti) **mai** nei nodi-agente, **mai** in CI/GitHub. CI = solo test ermetici; integrazione (corpus reale, API live, shots) gira SOLO sul Mini.
- **ZERO-LLM in prodotto**: la pipeline recap/grounding è deterministica (LLM solo in build/dev).
- **Persistenza additive + migrate-safe**; **groundedness** + **replay deterministico**.
- **ZERO brand/codice "ELAB" nel repo studio** (il plugin ELAB reale è prodotto separato downstream; reference plugin = nome neutro `plugins/reference`).
- **MAI** toccare `eval/gate.sh` né indebolire i test. **MAI** auto-merge a `main`. **Deploy prod = solo OK Andrea**.

---
## 6. MONOREPO ARDESIA — DESIGN (target, da bootstrappare — decisione Andrea)
Obiettivo: 5 repo → 1, massimo ordine, navigabile da umani + fabbrica.
```
ardesia/                      (nuovo repo privato, Nx)
├── README.md                 ← punta a questo MAP; come orientarsi in 1 minuto
├── packages/
│   ├── engine/               (← lessonos)      pytest
│   ├── studio/               (← ardesia-studio) tsc+vitest, Excalidraw
│   └── tools/                (← ardesia-tools)  loop/deadman/strategos
├── docs/
│   ├── vault/                (← ardesia-vault)  SoT, direttive, questo MAP
│   └── wiki/                 (← ardesia-wiki)
├── AGENTS.md                 ← regole fabbrica (eredita per-package)
├── COORDINATION.md           ← pin/coordinamento (resta unico canale)
└── nx.json / package.json    ← gate affected-only per package
```
- **Migrazione preserva storia git** (`git subtree add --prefix` o `git-filter-repo`), repo originali restano come archivio (additivo, reversibile).
- **GDPR**: il corpus reale (`~/maestro-data`) resta FUORI dal repo (gitignored, solo sul Mini) — confine invariato.
- **Cutover fabbrica** (rischioso, staged): repointare cwd/paths in tick+driver+gate+~/.maestro_active_repo → 1 lane alla volta, gate verde a ogni passo, rollback pronto. = lavoro dedicato, NON in coda a una sessione lunga.
- **Decisioni irreversibili tue**: (a) nome/posizione repo (`ardesia`?); (b) conferma confine GDPR; (c) quando fare il cutover del loop live.

---
## 7. Salute — snapshot storico del 17/06, non stato corrente
- Loop sano: gate lessonos **1996** / studio **572** verdi; ~6 build opus/giorno.
- ✅ CI GitHub Actions deployata (gate su push auto/main + PR main). ⏳ prima passata rossa = 12 test env-coupled → fix CI-PORTABILITY pinnato al loop → poi verde → poi merge auto→main + branch-protection.
- ✅ Durabilità: deadman self-heal (push automatico).
- ⚠️ Prodotto user-facing deployato = ~zero. È una fabbrica che produce engine+studio su `auto/main`, non-mergato, non-deployato. Il moat (method-graph per-docente) è early + non validato su corpus reale.

I conteggi e gli stati CI sopra non attestano la salute corrente. Ogni nuovo lavoro deve fissare base SHA,
test count e score con comandi eseguiti nel worktree corrente.

---
## 8. Memory plane proposto — Markdown/Git/Obsidian + indice Basic Memory

**Stato: PROPOSED / NO CUTOVER.** La gerarchia proposta è:

1. ordini/approvazioni umane e decisione Obsidian per intento e autorità;
2. evidenza prodotto/test/Git legata allo SHA per i fatti;
3. Markdown in repository Git privato e pulito, aperto in Obsidian, come conoscenza umana canonica;
4. Basic Memory come indice locale SQLite/FastEmbed ricostruibile e mai writer autorevole;
5. filesystem/`rg` come percorso di degradazione.

Il receipt canary corrente è
`30-Evidence-Receipts/2026-07-18-FOUNDER-BETA-FB3A-REVIEWED.md` nel vault Obsidian; i fatti datati sono
riepilogati nel §2 del runbook. Per il canary il branch verificato è `canary/basic-memory-20260717`, con
MacBook unico writer e Mini mirror fast-forward-only. Basic Memory deve indicizzare uno snapshot Mini
dedicato e read-only, separato dal clone di sync. Il canary non autorizza servizio permanente o cutover.

AgentMemory resta fuori dai workflow attivi e dal fallback. Il servizio storico rimane intatto finché
un gate umano separato non approva il cutover; solo dopo tale gate potrà essere conservato come sorgente
di migrazione congelata. Un'indisponibilità dell'indice non blocca una correzione locale: si usa
filesystem/`rg`, si accoda il receipt e si riconcilia Obsidian prima della release.

Decisione proposta: `docs/adr/ADR-0003-markdown-git-basic-memory-plane.md`.
Runbook proposto: `docs/ops/BASIC-MEMORY-CANARY-AND-CUTOVER.md`.
