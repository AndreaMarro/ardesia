# ARDESIA — Monorepo

ARDESIA è per tutti — chi impara e chi insegna, dall'autodidatta all'università.
Nello stesso Workspace convivono un Notebook paginato e una Whiteboard infinita,
oggetti vivi (fra cui i Foglietti), plugin e contenuti, e LessonOS che lavora sulle
tue fonti. R1 porta i due documenti, la parità con un taccuino d'uso quotidiano,
LessonOS e un marketplace universale; R2 aggiunge Simulation ed ELABTutor. Questa è
una presentazione: gli invarianti stanno in `docs/PRODUCT-CONTRACT.md` e il testo
che decide è il PRD.

Monorepo unico: si lavora su tutto da qui.

> **Economia.** ARDESIA non prende commissione sulle vendite del marketplace: chi
> vende riceve il prezzo. I pagamenti fra tutor e allievo restano esterni al
> prodotto. Il ricavo viene dai piani, dalla visibilità e dagli strumenti maggiori.
> Le condizioni esatte sono nel PRD, non qui.

> **AI.** L'AI è necessaria al prodotto pieno. Senza AI il PRD richiede che
> continuino a funzionare apertura, scrittura e modifica manuale, salvataggio e
> recovery, cronologia deterministica, import/export e plugin non-AI. Ogni scrittura
> AI passa da proposta, fonti, diff, preview e conferma — e lascia una ricevuta.

## Layout

| Path | Cos'è | Stack | Storia importata da |
|---|---|---|---|
| `packages/engine/` | Motore didattico: grafo del metodo, retrieval, recap, CRM | Python (uv) | lessonos |
| `apps/studio/` | Lavagna e ToolHost (host dei plugin) | TS/React | maestro-studio |
| `plugins/elab-tutor/` | ELAB come plugin in-tree del workspace | TS/React | elab-tutor |
| `ops/tools/` | Fabbrica: loop, gate, metriche, bridge. Non spedita agli utenti. | shell/py | maestro-tools |
| `docs/` | Spec, contratto, governance, archivio canon | md | bootstrap |

Quanto `plugins/elab-tutor/` sia effettivamente disaccoppiato non si legge qui: si
misura con i gate. Questa tabella dice dove sta il codice, non a che punto è.

## Regola d'oro: fabbrica ≠ prodotto

`ops/` è il sistema che costruisce e non viene consegnato. `apps/`, `packages/` e
`plugins/` sono il prodotto: è solo su questo che valgono i vincoli di runtime su
dati personali e corpus. Non mischiare i due.

## Come lavorare

- **Engine** — `packages/engine/` (uv), gate: `packages/engine/eval/gate.sh`
- **Studio** — `apps/studio/` (npm), gate: `apps/studio/eval/gate.sh`
- **Plugin ELAB** — `plugins/elab-tutor/` (npm)
- **Fabbrica** — `ops/tools/`

## Guardrail

Mai toccare i file di gate · mai auto-merge su `main` · mai deploy senza OK di
Andrea · dati personali, corpus e segreti fuori da repo, CI e nodi agente · il moat
di un plugin non è la piattaforma.

## Dove leggere cosa

- **Invarianti di prodotto** — `docs/PRODUCT-CONTRACT.md`.
- **Requisiti completi** — il PRD definitivo
  `10-Requirements/2026-08-02-PRD-ARDESIA-DEFINITIVO.md`, che non sta in questo
  repository ma nel repository separato del vault `ARDESIA-KNOWLEDGE`.
- **Struttura del codice** — `ARDESIA-MAP.md`.
- **Governance, storicamente** — `docs/vault/ARDESIA-MAP.md`: snapshot del passato,
  non un entry point operativo. Stesso rango per `docs/CANON-INDEX.md`.
- **Stato corrente** — non è scritto in nessun documento, si genera:

```bash
python3 bin/state/project_state.py --print
```
