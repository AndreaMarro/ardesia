# VOLUME 3 - Local Handoff For GitHub

## Cosa ho trovato
- `./ardesia` e' il target canonico, ma il worktree locale principale e' sporco e contiene molte modifiche non correlate.
- Per non mischiare tutto e' stata creata una worktree pulita da `origin/main` dopo merge PR #9: `/tmp/ardesia-volume3-inventory-20260702-031847`.
- Volume 3 contiene 19 repo Git, 123601 file potenzialmente importanti, 109 file >20MB, 1090 sensitive filename match e 13045 sensitive content path match.

## Cosa mettere subito in GitHub
- Solo questi documenti inventory: `VOLUME3-GITHUB-INVENTORY.md`, `VOLUME3-GITHUB-CANDIDATES.tsv`, `VOLUME3-DO-NOT-COMMIT.md`, `VOLUME3-LARGE-FILES-AND-ASSETS.md`, `VOLUME3-LOCAL-HANDOFF-FOR-GITHUB.md`, update a `NEXT-SESSION-PROMPT.md`.
- Nessun asset, dump, env, codice o script operativo in questa PR.

## Cosa non mettere
- Tutto cio' che e' elencato in `VOLUME3-DO-NOT-COMMIT.md`.
- `CONTENUTI`, `ELAB - TRES JOLIE`, `VOLUMI pdf e MD`, archivi zip, PDF/manuali, dataset/corpus, `.stversions`, `dist-test/public/volumes`.

## PR consigliate
1. `docs(volume3): inventory and import candidates`.
2. `docs(product): electrotechnics/examforge/useraios updates`.
3. `docs(ops): fastapi/chatgpt-apps integration gateway`.
4. `ops(monorepo): package.json + bin/monorepo.sh`, solo se verificati.
5. `demo(vercel): ardesia-lavagna result/status`, solo read-only/browser COV prima di deploy.
6. `feat(useraios): projection layer`, solo dopo context packet.
7. `plugin(simulation): ELAB post-it slice`, solo dopo gate/demo readiness.

## Comandi per Codex/GitHub
```bash
cd /tmp/ardesia-volume3-inventory-20260702-031847
git status -sb
git diff --check
git diff --stat
git add docs/ops/VOLUME3-GITHUB-INVENTORY.md         docs/ops/VOLUME3-GITHUB-CANDIDATES.tsv         docs/ops/VOLUME3-DO-NOT-COMMIT.md         docs/ops/VOLUME3-LARGE-FILES-AND-ASSETS.md         docs/ops/VOLUME3-LOCAL-HANDOFF-FOR-GITHUB.md         docs/ops/NEXT-SESSION-PROMPT.md
git commit -m "docs(ops): inventory Volume 3 GitHub candidates"
git push -u origin HEAD
gh pr create --draft --base main --title "docs(ops): inventory Volume 3 GitHub candidates" --body-file /tmp/volume3-inventory-pr-body.md
```

## Rischi
- Il path-only scan produce falsi positivi, ma il volume dei match impone policy severa.
- La keyword hit file e' molto grande; non va committata.
- Il repo locale principale `ardesia` ha modifiche non correlate: non usare `git add -A`.

## Rollback
- Questa PR e' docs-only: rollback = revert del commit o chiusura PR draft.
- Non sono stati cancellati file, cambiati launchd, eseguiti deploy o mutati servizi.
- Gli scan raw stanno in `/tmp`; non sono necessari al rollback.

## Richiede Andrea
- Decisione asset/licenza per manuali, foto, video e PDF ELAB.
- Decisione su quali docs product locali diventano canoniche.
- Approvazione esplicita per qualunque manutenzione AgentMemory oltre read-only.

## Richiede licenza/sanitizzazione
- Tutti i repo terzi in `repos-research`.
- Tutti i materiali in `CONTENUTI`, `ELAB - TRES JOLIE`, `VOLUMI pdf e MD`.
- Docs locali con provider/API/key/token/password pattern.

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
