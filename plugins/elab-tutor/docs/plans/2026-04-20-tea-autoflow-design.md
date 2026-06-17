# Tea Autoflow — Auto-merge Tea PRs senza Andrea bottleneck

**Goal**: Tea committa, CI verifica, auto-merge se safe. Andrea libero da micro-review.

## Architettura 4-layer

```
Tea PR opened
    │
    ▼
[Layer 1] CODEOWNERS check — Tea autorità path-based
    │
    ▼
[Layer 2] GitHub Actions safety gates
    │  - CI green obbligatorio
    │  - Files NOT in critical paths (engine/, simulator/, supabase/)
    │  - PR size < 500 LoC additions
    │  - No new npm dependencies
    │  - Governance gate PASS
    │  - Tea label "auto-merge-ok"
    │
    ▼
[Layer 3] Watchdog cross-check
    │  - Production smoke test post-merge
    │  - Principio Zero v3 regression check
    │  - Anomaly log if regression
    │
    ▼
[Layer 4] Auto-merge + notify
    │  - gh pr merge --squash --auto
    │  - Slack/Telegram notify Andrea
    │  - Tag commit con "[auto-merged-tea]"
```

## File 1 — `.github/CODEOWNERS`

```
# Tea ownership: glossario + dati ESPERIMENTI + foto + UX docs
/src/data/glossary*           @Tea26-lea
/src/data/glossario*          @Tea26-lea
/src/data/experiments-vol*    @Tea26-lea  # Tea può aggiornare descrizioni esperimenti
/public/glossario/**          @Tea26-lea
/docs/tea/**                  @Tea26-lea

# Andrea ownership critical (Tea NON può modificare senza review)
/src/components/simulator/engine/**   @AndreaMarro
/src/services/api.js                  @AndreaMarro
/src/services/simulator-api.js        @AndreaMarro
/supabase/**                          @AndreaMarro
/.github/workflows/**                 @AndreaMarro
/CLAUDE.md                            @AndreaMarro
/docs/GOVERNANCE.md                   @AndreaMarro
```

## File 2 — `.github/workflows/auto-merge-tea.yml`

```yaml
name: Auto-merge Tea PRs (safe paths only)

on:
  pull_request:
    types: [opened, synchronize, ready_for_review, labeled]
  pull_request_review:
    types: [submitted]
  check_suite:
    types: [completed]

permissions:
  contents: write
  pull-requests: write
  checks: read

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.event.pull_request.user.login == 'Tea26-lea'
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check files modified in safe paths only
        id: paths
        run: |
          BASE_SHA="${{ github.event.pull_request.base.sha }}"
          HEAD_SHA="${{ github.event.pull_request.head.sha }}"
          FILES=$(git diff --name-only "$BASE_SHA..$HEAD_SHA")

          # Forbidden paths (Tea cannot auto-merge if she touches these)
          FORBIDDEN=$(echo "$FILES" | grep -E '^(src/components/simulator/engine|src/services/api\.js|src/services/simulator-api\.js|supabase|\.github/workflows|CLAUDE\.md|docs/GOVERNANCE\.md|package\.json)' || true)

          if [ -n "$FORBIDDEN" ]; then
            echo "BLOCKED: Tea PR touches critical paths:"
            echo "$FORBIDDEN"
            echo "safe=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "safe=true" >> "$GITHUB_OUTPUT"

      - name: Check PR size (< 500 LoC additions)
        id: size
        if: steps.paths.outputs.safe == 'true'
        run: |
          ADDITIONS=$(gh pr view ${{ github.event.pull_request.number }} --json additions --jq '.additions')
          if [ "$ADDITIONS" -gt 500 ]; then
            echo "BLOCKED: PR too large ($ADDITIONS additions, max 500)"
            echo "small=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "small=true" >> "$GITHUB_OUTPUT"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Check no new npm deps
        id: deps
        if: steps.paths.outputs.safe == 'true' && steps.size.outputs.small == 'true'
        run: |
          if git diff "${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }}" -- package.json | grep -E '^\+\s*"' >/dev/null; then
            echo "BLOCKED: Tea PR adds npm deps (regola 13)"
            echo "no_deps=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "no_deps=true" >> "$GITHUB_OUTPUT"

      - name: Wait for CI green
        if: steps.paths.outputs.safe == 'true' && steps.size.outputs.small == 'true' && steps.deps.outputs.no_deps == 'true'
        uses: lewagon/wait-on-check-action@v1.3.4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          wait-interval: 30
          allowed-conclusions: success
          check-regexp: 'Verify governance rules 0-5|quality-ratchet|test'

      - name: Auto-approve
        if: success() && steps.paths.outputs.safe == 'true' && steps.size.outputs.small == 'true' && steps.deps.outputs.no_deps == 'true'
        run: |
          gh pr review ${{ github.event.pull_request.number }} --approve \
            --body "✅ Auto-approved by Tea autoflow. Safe paths + CI green + size OK + no deps."
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge squash
        if: success() && steps.paths.outputs.safe == 'true' && steps.size.outputs.small == 'true' && steps.deps.outputs.no_deps == 'true'
        run: |
          gh pr merge ${{ github.event.pull_request.number }} --squash --delete-branch \
            --subject "$(gh pr view ${{ github.event.pull_request.number }} --json title --jq '.title') [auto-merged-tea]"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Notify Andrea (Telegram if secret available)
        if: success() && steps.paths.outputs.safe == 'true'
        run: |
          if [ -n "${{ secrets.TELEGRAM_BOT_TOKEN }}" ] && [ -n "${{ secrets.TELEGRAM_CHAT_ID }}" ]; then
            curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
              -d "chat_id=${{ secrets.TELEGRAM_CHAT_ID }}" \
              -d "text=✅ Tea PR #${{ github.event.pull_request.number }} auto-merged" \
              -d "parse_mode=Markdown"
          fi
```

## File 3 — Watchdog config update (auto-merge cross-check)

Aggiungere a `.watchdog-config.json`:
```json
{
  "auto_merge_safety": {
    "users_with_autoflow": ["Tea26-lea"],
    "verify_post_merge_seconds": 300,
    "alert_on_regression": true
  }
}
```

E in `scripts/watchdog-checks.sh` aggiungere:
```bash
# === CHECK 7: Auto-merge cross-check (last 30 min) ===
if [ -n "$GH_TOKEN" ]; then
  AUTO_MERGED=$(gh pr list --state merged --limit 5 --search 'auto-merged-tea in:title merged:>=$(date -u -v-30M +%Y-%m-%dT%H:%MZ)' --json number,mergedAt 2>/dev/null || echo '[]')
  COUNT=$(echo "$AUTO_MERGED" | jq 'length')
  if [ "$COUNT" -gt 0 ]; then
    log_ok "auto_merge_tea" "$COUNT Tea PR merged in last 30min, baseline check pending"
  fi
fi
```

## Step-by-step rollout

**Sessione 20/04/2026 (next session)**:

1. Branch `feature/tea-autoflow` da main
2. Crea CODEOWNERS file
3. Crea `.github/workflows/auto-merge-tea.yml`
4. Update `.watchdog-config.json` (in PR #5 watchdog se ancora open) o nuovo PR
5. Test fittizio: Andrea simula PR Tea con paths safe + verify auto-merge
6. Test fittizio 2: simula PR Tea con paths critici + verify BLOCK
7. Doc + commit + push + PR draft
8. Andrea merge dopo verify

**Comunica a Tea (email Andrea)**:
- Repo collaborator access (gia' ha?)
- Path che può modificare (vedi CODEOWNERS)
- Convention commit: `feat(glossario): ...`
- Label `auto-merge-ok` opzionale per esplicito opt-in

## Tea repo glossario integration

Tea ha `Tea26-lea/glossario-esperimenti-elab` con vanilla JS prototype. Integrate options:

**Opzione A**: Mirror nel repo principale come `src/components/glossario/` (React port)
- Tea continua sviluppo nel suo repo
- Script `scripts/sync-tea-glossario.js` pulla settimanalmente
- Auto-PR aggiornamento dati

**Opzione B**: iframe embed prototype in elabtutor.school sotto `/glossario`
- Zero porting
- Tea autonoma sul suo prototype
- UX leggermente disjointed (iframe vs SPA)

**Opzione C**: Estrai solo `data.js` + `glossary.js` di Tea
- Importa `src/data/tea-glossary.js`
- Riusa logic in React component nuovo
- Tea owns data via auto-merge config sopra

**Raccomandato**: Opzione C (data-only integration). Tea owns content, ELAB owns UI. Auto-merge via CODEOWNERS.

## Sicurezza guarantees

- ✅ Tea NON può toccare engine/api/supabase/workflows
- ✅ PR size cap 500 LoC (no big-bang)
- ✅ NO new npm dep (regola 13 preserved)
- ✅ CI obbligatorio green
- ✅ Andrea ricevi Telegram notify ogni auto-merge
- ✅ Watchdog post-merge smoke test verifica regression
- ✅ Override: Andrea può sempre `gh pr review --request-changes` PRIMA che auto-merge fire
