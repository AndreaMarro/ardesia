# VOLUME 3 - GitHub Inventory

## Verdetto
GitHub non deve ricevere Volume 3 in blocco. Il monorepo canonico e' `./ardesia`, ma il filesystem contiene molte copie lineage ELAB, archivi deploy, asset pesanti, corpus/manuali, cloni di ricerca e worktree locali. L'unico import immediato sicuro e' docs-only, path-by-path, con COV e sanitizzazione.

## Metodo
Scansione read-only con `find`, `git status/log/remote/diff --check`, `rg` path-only e classificazione manuale. Sono stati esclusi `node_modules`, `.git`, `dist`, `build`, `.next`, virtualenv e `Library` quando possibile. Nessun segreto e' stato stampato; i match contenuto sono solo path + tipo rischio.

## Stato remoto noto
- PR #10: merged su `main` prima di questa sessione.
- PR #9: verificata docs-only, mergeable/CLEAN e merged in questa sessione come `c48500cb`.
- PR #8: draft planning; aggiornato il body con demo/canary status read-only.
- PR #6: sporca, non usata come base.

## Repo trovati
| Repo | Classe | Prossima azione | Rischio |
|---|---|---|---|
| `./ARCHIVIO/progetti-deprecati/TOBIA` | DO-NOT-COMMIT | Archive/private only; salvage docs after sanitize | High: deprecated deploy zips/env |
| `./ARCHIVIO/progetti-deprecati/elab-website` | DO-NOT-COMMIT | Archive/private only; salvage docs after sanitize | High: deprecated deploy zips/env |
| `./PRODOTTO/elab-builder` | LINEAGE | Preserve as ELAB source; import only reviewed docs/code slices | High: product repo, env/PDF/build outputs |
| `./PRODOTTO/elab-builder/.claude/external-agents/agency-agents` | LINEAGE | Preserve as ELAB source; import only reviewed docs/code slices | High: product repo, env/PDF/build outputs |
| `./PRODOTTO/elab-builder/.claude/external-agents/caveman` | LINEAGE | Preserve as ELAB source; import only reviewed docs/code slices | High: product repo, env/PDF/build outputs |
| `./PRODOTTO/elab-builder/.claude/external-agents/caveman-compression` | LINEAGE | Preserve as ELAB source; import only reviewed docs/code slices | High: product repo, env/PDF/build outputs |
| `./PRODOTTO/elab-builder/.claude/external-agents/oh-my-claudecode` | LINEAGE | Preserve as ELAB source; import only reviewed docs/code slices | High: product repo, env/PDF/build outputs |
| `./PRODOTTO/elab-builder/.claude/external-agents/wshobson-agents` | LINEAGE | Preserve as ELAB source; import only reviewed docs/code slices | High: product repo, env/PDF/build outputs |
| `./PRODOTTO/elab-volumi` | LINEAGE | Keep separate; license-review volumes before any reference | High: manuals/content |
| `./PRODOTTO/newcartella` | LINEAGE | Use as historical branch/source only | High: duplicated build/assets/secrets |
| `./ardesia` | CANONICAL | Use as target repo; do not mix local dirty work with inventory PR | Medium: dirty local branch |
| `./ardesia-lavagna` | DEPLOY-SURFACE | Map to ARDESIA only via PR after demo gate | Medium: separate deploy surface |
| `./ardesia-simulator` | DEPLOY-SURFACE | Map to ARDESIA only via PR after demo gate | Medium: separate deploy surface |
| `./repos-research/BMAD-METHOD` | PROTOTYPE | Use as research reference; vendor nothing without license check | Medium/high: third-party code |
| `./repos-research/Understand-Anything` | PROTOTYPE | Use as research reference; vendor nothing without license check | Medium/high: third-party code |
| `./repos-research/open-design` | PROTOTYPE | Use as research reference; vendor nothing without license check | Medium/high: third-party code |
| `./repos-research/ruflo` | PROTOTYPE | Use as research reference; vendor nothing without license check | Medium/high: third-party code |
| `./repos-research/ui-ux-pro-max-skill` | PROTOTYPE | Use as research reference; vendor nothing without license check | Medium/high: third-party code |
| `./unlim-intelligente` | PRODUCT-CANDIDATE | Review as separate product; import docs only if sanitized | Medium/high: brand/product overlap |

## Cartelle importanti
| Path | Classe | Perche | Cosa mettere su GitHub | Cosa escludere | Rischio | Prossima azione |
|---|---|---|---|---|---|---|
| `./ardesia` | CANONICAL | Monorepo ARDESIA privato, target GitHub AndreaMarro/ardesia | Docs canoniche, package verificati, tests, scripts sicuri | Dirty locali non revisionati, dati, asset pesanti | Medio | Usare worktree pulita per PR docs-only |
| `./ardesia/docs/ops` | DOCS-CANDIDATE | Contiene packet operativi e status PR #9/#10 | Inventory, handoff, COV, runbook read-only | Segreti, comandi mutativi non autorizzati | Basso/medio | Commit solo docs inventory |
| `./ardesia/docs/product` | DOCS-CANDIDATE | Pack prodotto gia presenti localmente | Electrotechnics, ExamForge, FastAPI, ChatGPT Apps dopo review | Materiale non verificato o duplicato | Medio | PR separata docs(product) |
| `./ardesia/apps/studio` | PRODUCT-CANDIDATE | Studio/canvas e toolhost sono superficie prodotto | Solo patch UI/test verificate | Asset ELAB grezzi o mock | Medio | PR dedicata con gate |
| `./ardesia-lavagna` | DEPLOY-SURFACE | Candidate demo Vercel separato | Status e adapter solo dopo browser COV | Deploy/alias/prod senza OK | Medio | Read-only demo verification |
| `./ardesia-simulator` | PROTOTYPE | Simulatore separato da studiare | Contratti/fixtures sanitizzati | Build outputs e codice duplicato | Medio | Reconcile con packages/engine/plugins |
| `./PRODOTTO/elab-builder` | LINEAGE | Repo ELABTutor canonico separato | Docs/spec/test slice dopo gate ELAB | PDF volumi, .env, server-data, build, node_modules | Alto | Non import diretto in ARDESIA |
| `./PRODOTTO/elab-builder-*` | LINEAGE | Molte worktree/copie storiche ELAB | Solo differenze motivate | Duplicati, dist-test, public/volumes, env | Alto | Catalogare, non copiare |
| `./PRODOTTO/elab-volumi` | LINEAGE | Sorgente volumi separato | Metadata o riferimenti licenza | PDF/manuali/corpus | Alto | License review |
| `./repos-research` | PROTOTYPE | Cloni terzi e ricerca | Note/decisioni, non vendor code | Licenze, node_modules, fork drift | Medio/alto | Citarli come fonti, non importare |
| `./ARCHIVIO` | DO-NOT-COMMIT | Deploy/zips/progetti deprecati | Solo lezioni imparate sanitizzate | Env, zip, vecchi deploy, credenziali | Alto | Private archive |
| `./CONTENUTI` | LOCAL-ONLY | Foto, manuali, video, PDF | Solo manifest/asset policy | Copyright e file grandi | Alto | Drive/private storage |
| `./ELAB - TRES JOLIE` | LOCAL-ONLY | Asset media e materiali ELAB | Solo indice e policy licenza | Foto/video/audio/PSD personali o pesanti | Alto | Private storage |
| `./ardesia-vault-local` | IDEA-CANDIDATE | Vault locale con PRD/spec | Sintesi formalizzate | Note private/non sanitizzate | Medio | Sanitize before docs/ideas |
| `./canon-edit` | PRODUCT-CANDIDATE | FastAPI/LessonOS research hits | Contratti/test piccoli se confermati | Dati/corpus locali | Medio | Review after product packet |

## Candidati immediati
- P0 docs/ops gia' curati localmente: `LOCAL-VOLUME3-STATUS.md`, `GITHUB-REPO-MAP-LIVE.md`, `ENTRYPOINTS.md`, `REPO-HEADROOM-MAP.md`, `HEADROOM-ENFORCEMENT-STATUS.md`, `AGENTMEMORY-SEMANTIC-PROTOCOL.md`.
- Questi devono entrare solo dopo diff review e secret scan redatto, in PR docs-only separata.

## Candidati dopo review
- `docs/product/ELECTROTECHNICS-SOLVER-PACK.md`, `EXAMFORGE-PACK.md`, `FASTAPI-INTEGRATION-GATEWAY.md`, `CHATGPT-APPS-MCP-INTEGRATION.md`.
- `LESSONOS-MEMORY-ARCHITECTURE-RESEARCH.md` e `LESSONOS-DYNAMIC-GRAPH-RESEARCH.md` dopo review citazioni/licenze.
- Toolhost/canvas code in `apps/studio/src/toolhost/*` solo in PR codice con test e screenshot.

## Da non committare
- `.env*`, key/token/credential/password file, private keys, `.vercel/.env*`.
- Database/cache/log/dump, inclusi dump AgentMemory grezzi.
- PDF/manuali/corpus privati, dati studenti o personali.
- `node_modules`, venv, `.stversions`, `dist`, `build`, `.next`, `dist-test`, `public/volumes` copiati.
- Deploy zip, export, video, audio, PSD e immagini >20MB senza decisione esplicita.

## Large files / asset
Sono stati trovati 109 file >20MB. Nessuno va in Git ordinario senza decisione esplicita; vedi `VOLUME3-LARGE-FILES-AND-ASSETS.md`.

## Duplicati/stale rispetto al monorepo
- `PRODOTTO/elab-builder-*` contiene molte copie lineage del prodotto ELAB: trattarle come sorgenti storiche, non come import diretto.
- `ardesia/docs/ops` locale contiene molti doc non tracciati; alcuni sono gia' in `origin/main` via PR #9/#10, altri richiedono riconciliazione.
- `repos-research/*` sono upstream esterni: citare/riassumere, non copiare codice senza licenza.

## Prossime PR consigliate
1. `docs(volume3): inventory and import candidates` - questa PR.
2. `docs(product): electrotechnics/examforge/useraios updates` - solo dopo review contenuti.
3. `docs(ops): fastapi/chatgpt-apps integration gateway` - riconciliare ops/product.
4. `ops(monorepo): package.json + bin/monorepo.sh` - solo se verificati.
5. `demo(vercel): ardesia-lavagna result/status` - read-only/browser COV prima di ogni deploy.
6. `feat(useraios): projection layer` - solo dopo context packet.
7. `plugin(simulation): ELAB post-it slice` - solo dopo gate/demo readiness.

## Domande aperte
- Quali asset ELAB sono autorizzati per Git/LFS e quali devono restare su Drive/private storage?
- Quale subset di `ardesia-vault-local` puo' diventare `docs/ideas/` senza materiale privato?
- Le docs product locali sono canonical o draft da riconciliare con ARDESIA/ELAB separati?

## COV
- Path: `/Users/andreamarro/VOLUME 3`
- Timestamp: 2026-07-02 CEST
- Repos found: 19
- Dirs mapped: 265
- Files mapped at maxdepth 4: 18962
- Important-file candidates: 123601
- Large files >20MB: 109
- Sensitive filename matches: 1090
- Sensitive content path matches, redacted/path-only: 13045
- Keyword hits, bounded/path+line file only: 1159634
- Raw scan artifacts: `/tmp/volume3-*.txt`, `/tmp/volume3-sensitive-content.tsv`
- Interrupted scans: two overly broad Python content scans were stopped by this agent; no runtime/service process was killed.
