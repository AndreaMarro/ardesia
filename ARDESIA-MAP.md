---
document_status: current-navigation
authority: navigation-only
updated_at: 2026-07-14
decision: docs/adr/ADR-0004-ai-native-evidence-authority.md
---

# ARDESIA — Mappa di navigazione del monorepo

Questa pagina risponde soltanto a «dove si trova cosa». Non contiene pin, stato
live, baseline, istruzioni di deploy o decisioni di prodotto.

Prima di lavorare, leggere nell'ordine:

1. [`ADR-0004`](docs/adr/ADR-0004-ai-native-evidence-authority.md);
2. [`docs/CANON-INDEX.md`](docs/CANON-INDEX.md);
3. [`AGENTS.md`](AGENTS.md) e l'`AGENTS.md` più vicino ai file interessati.

## Aree del monorepo

| Percorso | Responsabilità | Verifica/orientamento locale |
|---|---|---|
| `apps/studio/` | UI web, lavagna, host plugin e persistenza browser | `apps/studio/AGENTS.md`, `package.json`, `src/`, `e2e/` |
| `packages/engine/` | Engine headless, proiezioni, retrieval e proposta metodologica | `packages/engine/AGENTS.md`, `pyproject.toml`, `lessonos/`, `tests/` |
| `plugins/elab-tutor/` | Integrazione ELAB da separare progressivamente dietro il confine plugin | `plugins/elab-tutor/AGENTS.md` e gate root applicabili |
| `ops/tools/` | Strumenti operativi e fabbrica; non runtime del prodotto | `AGENTS.md` root e `ops/tools/ops/README.md` |
| `docs/` | ADR, canon, audit, protocolli e knowledge versionata | `docs/CANON-INDEX.md` |
| `bin/ci/` | Gate root riproducibili | script e test omonimi |
| `.github/workflows/` | Definizioni della CI | workflow versionati |

## Entry point tecnici

- Root scripts e composizione: [`package.json`](package.json) e
  [`bin/monorepo.sh`](bin/monorepo.sh).
- Studio: `apps/studio/src/`; test unitari accanto al codice ed E2E in
  `apps/studio/e2e/`.
- Engine: `packages/engine/lessonos/`; test in `packages/engine/tests/`.
- Confine ELAB: `plugins/elab-tutor/`; non copiare codice nel Core per aggirarlo.
- Decisioni accettate: `docs/adr/`; inventario autorità: `docs/CANON-INDEX.md`.
- CI corrente: `.github/workflows/ci.yml`.

## Come leggere lo stato

- Branch e baseline si osservano dai ref Git aggiornati, mai da questa mappa.
- Il risultato di una suite vale soltanto per il candidato e lo SHA registrati.
- Deploy e servizi live valgono soltanto con release manifest e receipt collegati
  allo stesso SHA.
- Worktree locali senza branch remoto, PR e CI sono materiale di integrazione, non
  release.

## Knowledge e nomi storici

Git + Markdown è la knowledge durevole. Obsidian deve diventare l'interfaccia della
stessa directory versionata; finché il cutover non è verificato, copie e vault
esterni sono input storici e non autorità.

Il codice conserva nomi quali MAESTRO e LessonOS. Sono lineage tecnico: non creano
fonti di verità, prodotti o policy parallele.

La precedente mappa del vault è conservata come puntatore storico in
[`docs/vault/ARDESIA-MAP.md`](docs/vault/ARDESIA-MAP.md); il suo corpo precedente è
recuperabile dalla storia Git e non va eseguito come istruzione corrente.
