# ARDESIA — Monorepo

> Aggiornamento di consegna 15 ottobre2026: [checkpoint recuperato, pubblicazione e debiti](docs/ops/CONSEGNA-2026-10-15/README.md). Le informazioni datate sotto restano storiche; main/produzione non sono promossi da questa nota.


**Da dove iniziare:** [guida di lettura per persone e ChatGPT](docs/START-HERE.md)
— architettura, correzioni R-01–R-04, review, prove verificabili e attività aperte.

Piattaforma didattica **local-first** per docenti: lavagna minimal (solo il docente) + **marketplace di plugin immutabili** + **AI metodologica** (mappa il metodo del docente, suggerisce, NON insegna, NO-training). Monorepo unico: si lavora su tutto da qui.

> **Modello di business (ratificato):** ZERO-fee sulle lezioni — il docente tiene il 100%. Ricavi = abbonamento **SaaS ~EUR15/mese** + **marketplace 70/30**. Niente tassa-Superprof. Visione completa: `docs/` + PDF v2 (`ardesia-vault/20-ARDESIA-VISIONE-E-BUSINESS-v2.pdf`).

## Layout
| Path | Cos'e | Stack | Sorgente (storia preservata) |
|---|---|---|---|
| `packages/engine/` | Motore didattico: grafo-del-metodo, retrieval, recap, CRM (lessonos) | Python (uv) | `lessonos@auto/main` |
| `apps/studio/` | Lavagna + ToolHost (host dei plugin) | TS/React | `maestro-studio@auto/main` |
| `plugins/elab-tutor/` | **NUOVO**: ELAB come primo plugin (simulatore Arduino + tutor). WIP decoupling. | TS/React | `elab-tutor@main` (edb11e83) |
| `ops/tools/` | **FABBRICA**: loop autonomo, gate, metrics, bridge. NON spedita agli utenti. | shell/py | `maestro-tools@main` |
| `docs/` | Spec, wiki, governance | md | bootstrap |

## Regola d'oro: FABBRICA != PRODOTTO
`ops/` = il sistema che COSTRUISCE (loop su modelli cheap, gira sul Mac mini, mai consegnato agli utenti). `apps/` + `packages/` + `plugins/` = il PRODOTTO (local-first; GDPR Mode A vincola SOLO questo a runtime). Non mischiare.

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
