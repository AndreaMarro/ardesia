# ARDESIA — Monorepo

Piattaforma didattica **local-first** per docenti: lavagna minimal (solo il docente) + **marketplace di plugin immutabili** + **AI metodologica** (mappa il metodo del docente, suggerisce, NON insegna, NO-training). Monorepo unico: si lavora su tutto da qui.

> **Modello di business (ratificato):** ZERO-fee sulle lezioni — il docente tiene il 100%. Ricavi = abbonamento **SaaS ~EUR15/mese** + **marketplace 70/30**. Niente tassa-Superprof. Visione completa: `docs/` + PDF v2 (`ardesia-vault/20-ARDESIA-VISIONE-E-BUSINESS-v2.pdf`).

## Layout
| Path | Cos'e | Stack | Sorgente (storia preservata) |
|---|---|---|---|
| `packages/engine/` | Motore didattico: grafo-del-metodo, retrieval, recap, CRM (lessonos) | Python (uv) | `lessonos@auto/main` |
| `apps/studio/` | Lavagna + ToolHost (host dei plugin) | TS/React | `maestro-studio@auto/main` ⚠️ **404** |
| `plugins/elab-tutor/` | **NUOVO**: ELAB come primo plugin (simulatore Arduino + tutor). WIP decoupling. | TS/React | `elab-tutor@main` (edb11e83) |
| `ops/tools/` | **FABBRICA**: loop autonomo, gate, metrics, bridge. NON spedita agli utenti. | shell/py | `maestro-tools@main` ⚠️ **404** |

> ⚠️ **Le sorgenti marcate 404 non esistono più su GitHub.** Verificato il 2026-08-13: `gh api repos/AndreaMarro/maestro-studio` e `…/maestro-tools` rispondono `Not Found`; `lessonos` esiste (ultimo push 2026-06-26). La colonna dice quindi da dove la storia *proveniva*, non dove si può ancora guardare: per due terzi delle righe **questo monorepo è l'unica sorgente raggiungibile**. Chi cerca «la storia preservata» la trova qui, con `git log --full-history -- <path>`, o da nessuna parte.
| `docs/` | Spec, wiki, governance | md | bootstrap |

## Regola d'oro: FABBRICA != PRODOTTO
`ops/` = il sistema che COSTRUISCE (loop autonomo, gate, metriche; mai consegnato agli utenti). `apps/` + `packages/` + `plugins/` = il PRODOTTO (local-first; GDPR Mode A vincola SOLO questo a runtime). Non mischiare.

> ⚠️ Questa riga diceva «gira sul **Mac mini**». **Il Mini è vietato da un ordine diretto di Andrea del 2026-08-02 alle 00:35** («IL MINI NON VA USATO!!!»). Era un'istruzione operativa contro un divieto esplicito, nel file che un nuovo arrivato legge per primo: la prima cosa che avrebbe fatto era quella proibita. L'orologio del loop gira **in locale**, dal vault: `~/ARDESIA-KNOWLEDGE/ops/loop/`.

## Come lavorare
- **Engine:** `cd packages/engine` (uv) — gate: `bash packages/engine/eval/gate.sh`
- **Studio:** `cd apps/studio` (npm) — gate: `bash apps/studio/eval/gate.sh`
- **Plugin elab:** `cd plugins/elab-tutor` (npm)
- **Fabbrica:** `ops/tools/` (factory-metrics.py, gate, bridge)

## Guardrail
MAI toccare `eval/gate.sh` - MAI auto-merge a `main` - MAI deploy senza OK Andrea - GDPR (PII/corpus/secret fuori da repo/CI/nodi-agente) - moat-plugin(ELAB) != piattaforma(ARDESIA).

## Note
- Il prodotto **standalone `elab-tutor`** (repo separato) resta in **STANDBY**; qui vive la sua incarnazione-**plugin** (`plugins/elab-tutor`), da decoupling progressivo.
- Mappa di navigazione dettagliata: **`ARDESIA-MAP.md`**.
