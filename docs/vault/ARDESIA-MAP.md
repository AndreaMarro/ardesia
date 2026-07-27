# ARDESIA — MAPPA D'ORIENTAMENTO (SoT) · agg. 2026-06-17

> **SNAPSHOT STORICO, NON AUTORITÀ CORRENTE.** Questa copia incorporata
> descrive lo stato del 17 giugno e contiene nomi, ruoli e claim ormai
> superseded. Per il codice corrente partire da `../../ARDESIA-MAP.md` e
> `../../artifacts/session-2/current-flow.md`; per governance, decisioni e receipt
> usare il vault esterno `/Users/andreamarro/ARDESIA-KNOWLEDGE/00-INDEX.md`.

> **CLAUSOLA STORICA (17/06).** All'epoca questa era la mappa unica per
> struttura/navigazione e `COORDINATION.md` conteneva gli ordini. Oggi, in caso
> di conflitto, valgono le fonti correnti indicate nel banner sopra.
> NB: codename interno = **MAESTRO** (locale `~/maestro-*`); su GitHub i repo sono **`ardesia-*`**.

---
## 1. Le due macchine
| Macchina | Ruolo | Cosa ci gira |
|---|---|---|
| **Mac mini** (`progettibelli@Mac16,10`, Tailscale `100.124.198.59`) — *la FABBRICA, always-on* | Dove succede tutto il lavoro | Loop autonomo (launchd tick 300s), gateway LiteLLM (:4000), agentmemory (:3111), tg-bridge, deadman, strategos, replenish, architect, hermes2-adjudicate |
| **MacBook** (`andreamarro`) — *supervisore + autoring prodotto + vault, intermittente* | Supervisione + sorgente prodotto ELAB + Obsidian vault | `com.elab.lessonos-supervisor` (orario), tunnel agentmemory→Mini (:3111), `~/ardesia-vault`, `VOLUME 3/PRODOTTO/elab-builder` (= repo elab-tutor) |

Accesso Mini dal MacBook: `ssh macmini`. Tunnel agentmemory: ssh -L :3111 (KeepAlive).

---
## 2. I repo (tutti PRIVATI su github.com/AndreaMarro)
### Piattaforma ARDESIA (la fabbrica costruisce QUI)
| GitHub | Locale (Mini) | Ruolo |
|---|---|---|
| `lessonos` | `~/lessonos` | **Engine** Python: ingest lezioni → grafo-metodo per-docente → recap grounded (ZERO-LLM) → retrieval-hybrid → CRM. Gate: `uv run pytest`. |
| `ardesia-studio` | `~/maestro-studio` | **Lavagna** TS/React/Vite, canvas **Excalidraw**, ToolHost↔plugin SDK Layer-0. Gate: `tsc -b` + vitest. |
| `ardesia-tools` | `~/maestro-tools` | **Tooling fabbrica**: deadman, strategos, research, notify-telegram, factory-metrics. |
| `ardesia-vault` | `~/ardesia-vault` (+ MacBook) | **SoT**: direttive, brainstorm, spec, questo doc. |
| `ardesia-wiki` | — | Wiki di progetto. |

### Prodotti SEPARATI (la fabbrica NON li tocca)
- `elab-tutor` — **prodotto ELAB** (React 19, simulatore + tutor Galileo). 6 PR aperte/draft FERME (#195-#200). ⚠️ DA PROGETTARE a parte (decisione Andrea).
- `elab-galileo-nanobot`, `elab-volumi`, `elab-website`, `unlim-intelligente` — ecosistema ELAB.
- `numeria`, `numeria-lab`, `numerical-lab-journey` — **Numeria** (progetto separato; MAI confondere con ARDESIA/ELAB).

---
## 3. Branch — REGOLA D'ORO
- **`auto/main`** = branch del BOT. Il loop pusha qui DIRETTAMENTE (push diretti, niente PR). Protetto SOLO dal gate locale (`eval/gate.sh`, tieni-se-verde) + CI-visibilità. **MAI** branch-protection PR qui (bloccherebbe il loop).
- **`main`** = branch RATIFICATO (umano). Il loop NON lo tocca. Merge `auto/main→main` SOLO via PR validata dalla CI (+ OK Andrea). → protetto (richiede check CI + PR).
- Stato 17/06: lessonos `auto/main` 824 commit (default branch), `main` fossile (8/06). studio `main` vuoto, lavoro su `auto/main`. tools su `main` diretto.
- Durabilità: `origin` = dual-pushurl (mirror locale + GitHub). Il **deadman** ogni 600s fa SELF-HEAL (pusha i commit non-da-build, allerta solo su push fallito reale).

---
## 4. Il LOOP (come la fabbrica costruisce)
`launchd com.elab.lessonos-hourly` ogni **300s** → `bin/hourly-tick.sh` (repo da `~/.maestro_active_repo` = `both` → dual-lane parallelo):
1. **ARCHITECT** (opus, se pin architetturale): `bin/architect.sh` → design pre-build → `ARCHITECT-CURRENT.md`.
2. **ORCHESTRATORE** (DeepSeek): OODA — orient → plan → PLAN-CHECK (`fable.sh`=opus).
3. **BUILD** (opus-4-8 ultracode su account A1): `driver-orch.sh`/`driver-studio.sh` → scrive codice+test → `eval/gate.sh` VERDE → commit → push (se KEPT).
4. **SELF-ADV** (opus, sul proprio diff) + **REVIEW** (`review.sh`=opus decorrelato).
5. **HERMES-2** (kimi, red-team decorrelato post-keep) → se CRITICO → **AGGIUDICA** (opus, `hermes2-adjudicate.sh`).
6. **DIGEST** (zero-LLM) → Telegram. **REPLENISH** (`bin/replenish.sh`, deepseek): se backlog<2 genera task.
- **Pin**: `COORDINATION.md §PROSSIMA TASK` (1 riga/repo, la tiene Claude) ; backlog `§ROADMAP-AUTO` `[AUTO-OK]` → `promote_pin.py` promuove a esaurimento. Mai-vuoto = `replenish` (auto) + supervisore.
- **Cap**: `LESSONOS_DAILY_CAP=96` (esplicito, plist) — ceiling soft. **Limitatore vero = `quota.sh`** (hard-stop a quota-out → degrada a DeepSeek). Visibilità burn opus nel digest.

### Ruoli-modello (canonico)
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
## 7. Salute (17/06) — onesto
- Loop sano: gate lessonos **1996** / studio **572** verdi; ~6 build opus/giorno.
- ✅ CI GitHub Actions deployata (gate su push auto/main + PR main). ⏳ prima passata rossa = 12 test env-coupled → fix CI-PORTABILITY pinnato al loop → poi verde → poi merge auto→main + branch-protection.
- ✅ Durabilità: deadman self-heal (push automatico).
- ⚠️ Prodotto user-facing deployato = ~zero. È una fabbrica che produce engine+studio su `auto/main`, non-mergato, non-deployato. Il moat (method-graph per-docente) è early + non validato su corpus reale.
