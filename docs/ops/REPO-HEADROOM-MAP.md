# ARDESIA - repo headroom map

Data: 2026-07-01
Tipo: mappa corta per umani e agenti

## Lettura minima

Ordine consigliato per qualunque task ARDESIA:

1. `README.md` - visione monorepo e confine prodotto/fabbrica.
2. `AGENTS.md` - guardrail root.
3. `ARDESIA-MAP.md` - navigazione codice.
4. `docs/CANON-INDEX.md` - regola Core/Plugin/Pack/Workflow.
5. `docs/ops/VERCEL-MAP.md` - deploy e demo.
6. `docs/ops/CONTEXT-PACKETS.md` - packet del task corrente.

Non leggere di default:

- `plugins/elab-tutor/src/**` salvo task ELAB-plugin;
- `packages/engine/**` salvo task engine/lessonos;
- `docs/vault/**` salvo decisione/vision/governance;
- repo esterni interi senza context packet.

## GitHub classification

Fonte: `gh repo list AndreaMarro --limit 100`, GitHub connector PR metadata.

| Repo | Classe | Uso corretto | Stato 2026-07-01 |
|---|---|---|---|
| `AndreaMarro/ardesia` | CANONICAL | Monorepo, docs, destinazione prodotto/fabbrica | Private, main pulito al clone, PR docs/ops aperte. |
| `AndreaMarro/ardesia-lavagna` | PROTOTYPE / DEMO-CANDIDATE | Lavagna Vite, plugin picker, export/import; fonte demo immediata | Branch locale `feat/lavagna-p0-20260628`, PR #1 open, build/test pass. |
| `AndreaMarro/ardesia-simulator` | PROTOTYPE / PLUGIN-CANDIDATE | Simulatore first-party hostable | Main clean; nessuna PR recente dal connector. |
| `AndreaMarro/whiteboard-studio-sim` | PROTOTYPE | Sim generico Blockly/IR/Arduino | Non clonato localmente; classificare prima di import. |
| `AndreaMarro/lessonos` | LINEAGE / ENGINE-LIVE | Engine/fabbrica sul Mac mini | Live su `auto/main`; loop attivo ma non sano. |
| `AndreaMarro/ardesia-studio` | LINEAGE / STUDIO | Studio/lavagna storica | Non clonato localmente in questa sessione. |
| `AndreaMarro/ardesia-tools` | LINEAGE / FACTORY | Tooling fabbrica | Non clonato localmente in questa sessione. |
| `AndreaMarro/ardesia-vault` | GOVERNANCE | SoT strategico/vault | Non runtime prodotto. |
| `AndreaMarro/ardesia-wiki` | KNOWLEDGE | Wiki/output | Non sovrascrive canon monorepo. |
| `AndreaMarro/elab-tutor` | SEPARATE-PRODUCT / FUTURE-PACK-SOURCE | ELAB standalone; fonte per plugin/pack | Checkout locale sporco e critico: non toccare in task ARDESIA docs. |
| `AndreaMarro/elab-volumi` | IP / CONTENT-SOURCE | Volumi cartacei markdown/PDF | Non copiare nel prodotto senza gate IP/GDPR. |
| `AndreaMarro/elab-galileo-nanobot` | ELAB-BACKEND-HISTORICAL | Backend AI ELAB | Non piattaforma ARDESIA. |
| `AndreaMarro/unlim-intelligente` | ELAB-PLANNING | Skill/plan UNLIM | Non runtime ARDESIA. |
| `AndreaMarro/numeria*` | SEPARATE-PRODUCT | Numeria | Non mescolare con ARDESIA/ELAB. |
| repo archiviati/vecchi | ARCHIVE | Storia o esperimenti | Non riattivare senza audit dedicato. |

## PR state that matters

| Repo | PR | Stato | Impatto |
|---|---:|---|---|
| `ardesia` | #8 | open draft | Piano demo vertical-slice; preservare, non duplicare claim. |
| `ardesia` | #6 | open draft | Dual Hermes/Codex orchestration; non mergeare senza Mac mini validation. |
| `ardesia` | #5/#4/#2/#1 | open draft | Docs/knowledge map storiche; riconciliare prima di merge. |
| `ardesia-lavagna` | #1 | open | Marketplace/plugin manifest system; build/test dichiarati e localmente coerenti col branch. |
| `elab-tutor` | #195-#200 | varie open/draft | ELAB standalone; utile per pack/simulator audit, non base diretta di ARDESIA demo. |

## Vercel classification

Vedi `docs/ops/VERCEL-MAP.md` per dettagli live.

| Project | Classe | Decisione operativa |
|---|---|---|
| `ardesia-lavagna` | PRIMARY-DEMO-CANDIDATE | Usare per demo toccabile parziale; preview deploy richiede OK Andrea. |
| `ardesia-canvas` | PROTOTYPE/UNKNOWN | Ready ma non browser-checked. |
| `ardesia-api-vercel` | API-PROTOTYPE | Ready ma endpoint non verificati; non demo primaria. |
| `ardesia-workspace` | PROTOTYPE/WORKSPACE | Ready ma non browser-checked. |
| `elab-tutor`, `elab-main` | ELAB-SEPARATE | Non dichiarare ARDESIA. |

## Factory live state

Fonte: `ssh macmini`, `launchctl list`, `agentmemory status`,
`hourly.log`, `driver.log`.

Fatti verificati:

- Mac mini raggiungibile via SSH.
- `agentmemory` live su `localhost:3111`, status `degraded`, heap ~1409 MB.
- `litellm` live su `127.0.0.1:4000`.
- `lessonos` live su `auto/main`; ultimo commit osservato:
  `bb13977 2026-07-01T03:03:50+02:00`.
- `pytest -q --no-header` era attivo al 100% CPU.
- Log: Opus/Claude quota-out, reset 4am Europe/Rome; fallback Hermes-DeepSeek
  senza final response; loop `blocked/noop` su iterazione.

Conseguenza:

- la fabbrica e' viva, ma non va chiamata sana;
- non fare fanout costoso finche' quote/fallback non sono stabilizzati;
- usare AgentMemory come cache utile, non fonte unica.

## Headroom accounting for this session

File letti intenzionalmente:

- root maps: `README.md`, `AGENTS.md`, `ARDESIA-MAP.md`,
  `docs/CANON-INDEX.md`, `docs/vault/ARDESIA-MAP.md`;
- ops maps: inventory/demo/Vercel;
- `ardesia-lavagna` targeted: `package.json`, `vercel.json`, `src/App.tsx`,
  `src/lib/plugins.ts`, `src/components/PluginTile.tsx`;
- no full repo dump.

File esclusi:

- `plugins/elab-tutor/src/**` runtime;
- `packages/engine/**` runtime, tranne metadata/logs via Mac mini;
- `node_modules/**`;
- `.env*`, secrets, corpus reali.

## Chain of verification

- Verificato: `AndreaMarro/ardesia` clonato localmente su branch dedicato.
- Verificato: `ardesia-lavagna` typecheck/test/build pass localmente.
- Verificato: `ardesia-lavagna` live browser flow parziale pass.
- Verificato: Vercel MCP 403, CLI funziona.
- Non fatto: merge, push, deploy, archive repo, modifica gate.
