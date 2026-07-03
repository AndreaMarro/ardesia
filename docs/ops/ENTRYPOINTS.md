# ARDESIA - entrypoints

Data: 2026-07-01
Tipo: comandi/entrypoint brevi per agenti

## GitHub

```bash
gh repo view AndreaMarro/ardesia --json nameWithOwner,url,description,defaultBranchRef,pushedAt
gh pr list --repo AndreaMarro/ardesia --state all --limit 20
gh pr view 8 --repo AndreaMarro/ardesia --json files,headRefName,baseRefName,isDraft
```

Uso:

- `gh repo list AndreaMarro --limit 100 --json ...` per inventario repo.
- GitHub connector per PR metadata/diff quando disponibile.
- Non aprire PR/push senza richiesta esplicita.

## Vercel

Connector MCP:

- tentato il 2026-07-01;
- `_list_projects` fallisce;
- `_get_project` restituisce `403 Forbidden`.

Fallback read-only CLI:

```bash
vercel whoami
vercel project ls --scope team_23uD0RgdInaTaOPEL0EGltup
vercel inspect ardesia-lavagna.vercel.app --scope andreas-projects-6d4e9791
vercel inspect ardesia-lavagna.vercel.app --scope andreas-projects-6d4e9791 --logs
vercel ls ardesia-lavagna --scope andreas-projects-6d4e9791
```

Regola:

- inspect/log/list sono permessi in sola lettura;
- deploy/alias/domain richiedono conferma esplicita Andrea.

## Demo candidate: `ardesia-lavagna`

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia-lavagna"
git status --short --branch
git log -1 --format='%h %cI %s'
npm run typecheck
npm test -- --run
npm run build
curl -I -L --max-time 20 https://ardesia-lavagna.vercel.app
```

Browser check live, senza installare dipendenze nel repo:

```bash
npx --yes playwright --version
# se serve scripting Node:
# NODE_PATH=$HOME/.npm/_npx/<cache>/node_modules node <script>
```

Nota: nel run 2026-07-01 Playwright package cache non includeva browser bundled;
Chrome installato ha funzionato con `chromium.launch({ channel: "chrome" })`.

## AgentMemory

MCP memory tools non erano esposti nella sessione Codex. Fallback REST sul Mac mini:

```bash
ssh macmini 'curl -fsS http://localhost:3111/agentmemory/livez'
ssh macmini '/Users/progettibelli/node-local/bin/agentmemory status'
ssh macmini 'curl -fsS -X POST http://localhost:3111/agentmemory/smart-search \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"ARDESIA demo Vercel Headroom\", \"limit\":10}"'
```

Stato 2026-07-01:

- live ma `degraded`;
- memory_smart_search utile ma rumorosa su query generica;
- non usarla come single source of truth.

## Mac mini factory

```bash
ssh -o BatchMode=yes -o ConnectTimeout=10 macmini 'hostname; date; uptime'
ssh macmini 'launchctl list | egrep -i "ardesia|lessonos|agentmemory|litellm|mini|claude"'
ssh macmini 'ps aux | egrep -i "claude|opus|hermes|litellm|agentmemory|lessonos|tick" | egrep -v egrep | head -80'
ssh macmini 'cd /Users/progettibelli/lessonos && tail -40 hourly.log && tail -40 driver.log'
```

Non fare:

- kill processi;
- reset worktree;
- edit launchd;
- restart servizi;
- deploy;
- arming gate.

## Monorepo ARDESIA

```bash
cd "/Users/andreamarro/VOLUME 3/ardesia"
git status --short --branch
rg --files -g '!node_modules' -g '!dist' -g '!build'
```

Docs ops appena create/aggiornate:

- `docs/ops/HEADROOM-RESEARCH.md`
- `docs/ops/REPO-HEADROOM-MAP.md`
- `docs/ops/SYMBOL-MAP.md`
- `docs/ops/ENTRYPOINTS.md`
- `docs/ops/CONTEXT-PACKETS.md`
- `docs/ops/VERCEL-MAP.md`

## Chain of verification

- Tutti i comandi sopra sono read-only salvo build/test locali.
- Nessun comando di deploy incluso.
- Nessun comando stampa token o `.env`.
