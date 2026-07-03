# COLLABORATOR-ONBOARDING — come lavorare su ARDESIA senza fare danni

- **Status**: guida operativa breve. Per l'orientamento completo NON duplicato qui → `docs/ops/CLAUDE-FULL-PROJECT-CONTEXT.md` (PR #18 finché non merged): monorepo, PR, slice, fabbrica, contraddizioni tra doc.
- **Data**: 2026-07-02
- **Vale per**: umani e agenti (Claude/Codex/altri). Se sei un agente: leggi prima la mappa, poi questo file, poi lavora.

## 1. Regola zero

> Ogni claim di stato va **riverificato firsthand** (`gh`, `git`, test eseguiti da te). I doc — questo incluso — sono fotografie che invecchiano; su conflitto vince l'evidenza fresca.

## 2. Setup di lavoro (sempre così)

```bash
# 1. MAI lavorare nel checkout principale (/Users/.../ardesia):
#    è del loop Codex, sporco (modified + untracked non tuoi). Solo lettura.
# 2. Ogni task = worktree usa-e-getta da origin/main:
git -C ardesia fetch origin main
git -C ardesia worktree add /tmp/ardesia-<task>-<data> -b <tipo>/<slug>-<data> origin/main
# 3. Test studio senza reinstallare (pattern consolidato):
ln -s <checkout-principale>/apps/studio/node_modules /tmp/ardesia-<task>-<data>/apps/studio/node_modules
# 4. A PR pushata: git worktree remove <path>
```

Branch naming: `docs/…`, `feat/…`, `test/…`, `ops/…`, `chore/…` + `-YYYYMMDD`. Commit: `tipo(area): descrizione` — atomici, una cosa per commit.

## 3. Il ciclo di una task

1. **Preflight**: `gh pr list -R AndreaMarro/ardesia --state all -L 25` + `git fetch` — cosa è già merged/in-flight? Non rifare lavoro già in una PR aperta.
2. Worktree nuovo (sopra). Modifiche **piccole e chirurgiche** (≤5 file per slice è la norma di casa).
3. **Verifica prima di dichiarare**: test **3×** (la suite studio ha storia di flakiness load-dependent: 1 run non basta), `tsc -b --noEmit`, lint sui file toccati.
4. **Secret-scan sul diff staged** prima di ogni push (grep per key/token/password/BEGIN PRIVATE; il repo ha 13k+ content-match sensibili nel Volume 3 fuori git — non importare file a caso).
5. PR piccola con **evidenza nel body** (comandi + esiti reali, non "dovrebbe funzionare"). I numeri senza fonte non si scrivono.
6. **COV a fine sessione**: cosa fatto/saltato e perché, comandi+esiti, claim verificati vs non, gate aperti.

## 4. Vietati (non negoziabili)

| Vietato | Perché |
|---|---|
| Checkout/commit nel working tree principale | È del loop Codex; contiene una slice untracked non tua (rischio perdita) |
| Merge/push diretto a `main` | Solo PR; il merge è di Andrea |
| Deploy (anche preview) senza OK esplicito | Superfici live gestite; runbook dedicato |
| `git add -A` | Il vault/tree contiene file che non devono entrare (Syncthing, PDF coperti, dati) |
| Toccare/mergiare **PR #6** | Body ≠ files (tocca `hourly-tick.sh` + file spurio) |
| Riattivare scheduler pausati (`com.elab.lessonos-hourly`, Codex automation) | Spenti deliberatamente |
| Scrivere/riavviare/recall-broad su **AgentMemory** finché `livez` timeouta | Degradata; runbook canary su main (`git show origin/main:docs/ops/AGENTMEMORY-MAINTENANCE-PLAN.md`) |
| `eval/gate.sh` | Fuori dal perimetro consentito |
| Seconda app ELAB / grafo parallelo a LessonOS / pattern demo-era | Canon: ELAB = pack; event log = unica fonte, grafo = vista derivata |
| Modifiche a `experiments-vol*.js` senza àncora unica (id/`unlimPrompt`) | Blocchi template ripetuti in N esperimenti: un Edit cieco li corrompe tutti |
| Committare PDF dei volumi o asset a licenza indecisa | Copyright; vedi `VOLUME3-DO-NOT-COMMIT.md` |

## 5. Comandi sicuri

Dopo il merge di PR #17 (finché è open: leggili dal suo branch), dalla root:

```bash
npm run status        # stato monorepo (read-only)
npm run test          # test-core (engine + studio)
npm run typecheck     # typecheck-core
npm run verify        # verify-core completo
bash bin/monorepo.sh factory-readonly   # probe fabbrica SOLO lettura
```

Fabbrica (Mac mini): probe read-only ok (connettore MCP `ardesia-ops`: `factory_full_status`, `web_status`, `memory_health`); **mutazioni no**. PDF volumi: leggerli localmente da `VOLUMI pdf e MD/` va bene; committarli no.

## 6. Dove sono le cose (puntatori, non copie)

- **Mappa completa** → `CLAUDE-FULL-PROJECT-CONTEXT.md` (§2 layout, §3 PR, §16 contraddizioni note tra doc).
- **Slice ELAB attiva** → context packet `SIMULATION-PLUGIN-ELAB-V1-CAP6-ESP1-CONTEXT-PACKET.md` + fixture `apps/studio/sim/fixtures/`.
- **Inventario cosa importare da Volume 3** → `VOLUME3-GITHUB-CANDIDATES.tsv`; cosa NON committare → `VOLUME3-DO-NOT-COMMIT.md`.
- **Stato repo/PR live** → `GITHUB-REPO-MAP-LIVE.md` (rigenerarlo con `gh`, non fidarsi della copia).
- **Scheduler** → `SCHEDULED-PROCESSES-INVENTORY.md` (vale l'update più recente in testa al file).

## 7. Stile di lavoro (ATES)

Onestà prima della velocità: niente green non veri, niente "done" senza output del comando, delta e limiti dichiarati nel PR body. Se una task è bloccata da un gate (merge, deploy, accessi): **dichiara il blocco e passa alla successiva** — non forzare. Le decisioni di prodotto/merge/deploy/spesa sono di Andrea.
