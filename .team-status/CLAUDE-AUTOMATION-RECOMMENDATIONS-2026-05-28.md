# Claude Code Automation Recommendations — ELAB Tutor

## Codebase Profile

- **Type**: Vite 7 + React 19 + Supabase Edge Functions (Deno)
- **Scale**: 600+ components, 21-commit i18n migration recently shipped
- **Stack**: react-i18next 17, i18next 26, supabase-js, react-pdf, codemirror, Scratch/Blockly, custom hash router (no react-router)
- **Existing config**: 3 safety hooks in `.claude/settings.local.json`, semgrep hook produces noise per edit
- **State**: 661 IT/EN locale keys, 81 components still hardcoded Italian fallback

---

## 1. HOOKS (concrete configs)

### Hook A — Locale parity pre-commit gate (HIGH priority)

**Why:** Prevents IT/EN drift. Any commit modifying `locales/*.json` must keep key count identical. Catches "added IT key forgot EN" bugs.

**Where:** `.claude/settings.json` PreToolUse on Bash matching `git commit`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash -c 'if git diff --cached --name-only 2>/dev/null | grep -q src/locales/; then python3 -c \"import json; it=json.load(open(\\\"src/locales/it.json\\\")); en=json.load(open(\\\"src/locales/en.json\\\")); k=lambda o,p=\\\"\\\": [f\\\"{p}.{kk}\\\" if p else kk for kk,v in o.items() if not isinstance(v,dict)] + [x for kk,v in o.items() if isinstance(v,dict) for x in k(v,f\\\"{p}.{kk}\\\" if p else kk)]; ik=set(k(it)); ek=set(k(en)); assert ik==ek, f\\\"PARITY BROKEN: IT-only={ik-ek}, EN-only={ek-ik}\\\"; print(f\\\"locale parity OK: {len(ik)} keys\\\")\" || exit 1; fi'"
      }
    ]
  }
}
```

Saved as helper script `scripts/check-locale-parity.py` is cleaner — recommend that.

### Hook B — Hardcoded Italian leak detector (MED priority)

**Why:** After i18n migration, new components naively added with `>Ciao Ragazzi<` text would silently bypass i18n. Catch at PostToolUse on `.jsx` edits.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash -c 'f=\"$CLAUDE_TOOL_INPUT_file_path\"; [[ \"$f\" =~ \\.jsx$ ]] || exit 0; if grep -qE \"(>[A-ZÀ-Ù][a-zà-ù]+ [a-zà-ù]+)|placeholder=\\\"[A-ZÀ-Ù][a-zà-ù]+\\\"\" \"$f\" && ! grep -q \"useTranslation\\|i18n.t\" \"$f\"; then echo \"⚠️ HARDCODED ITALIAN STRING in $f (use t() instead)\"; fi'"
      }
    ]
  }
}
```

Non-blocking warning. Surfaces leak immediately during dev.

### Hook C — Disable semgrep noise (immediate quality-of-life)

**Why:** Semgrep hook fires after every Edit/Write with the same "no SEMGREP_APP_TOKEN" message — 600+ noise events this session. Either set token or remove hook.

**Where:** `.claude/settings.local.json` — remove the semgrep PostToolUse entry OR set `SEMGREP_APP_TOKEN` env var.

---

## 2. SUBAGENTS

### Subagent A — i18n-migration-helper (HIGH priority)

**Why:** Remaining ~81 components need migration. Same mechanical pattern repeats. A dedicated subagent migrates one component per invocation, ensures parity, runs build verify, commits.

**Where:** `.claude/agents/i18n-migrator.md`

```yaml
---
name: i18n-migrator
description: Migrate one ELAB component from hardcoded Italian to react-i18next. Adds IT+EN keys parity, wires useTranslation hook, builds, commits.
tools: Read, Edit, Write, Bash, Grep
---

You migrate a single React component from hardcoded Italian to bilingual react-i18next.

Workflow:
1. Identify Italian strings via `grep -nE "(>[A-ZÀ-Ù]|placeholder=|aria-label=)"`
2. Add parallel keys to `src/locales/it.json` AND `src/locales/en.json` in a new namespace
3. Verify key parity: `python3 scripts/check-locale-parity.py`
4. Wire `useTranslation()` hook; replace literals with `t('namespace.key')`
5. `npm run build` MUST pass
6. Commit with `feat(i18n): batch N — ComponentName bilingual` format
7. Push

Preserve all original ARIA labels + comments. Use Principio Zero plural voice for English ("Class,", "Team,", "Everyone,").
```

### Subagent B — adversarial-i18n-reviewer (MED priority)

**Why:** Each PR touching locales needs adversarial check (interpolation parity, HTML-in-JSON, fallbackLng edge cases). Subagent runs in parallel during code review.

**Where:** `.claude/agents/i18n-reviewer.md` — same pattern as the review I just generated, but as reusable agent.

---

## 3. SKILLS

### Skill A — `/elab-locale-add` (HIGH priority — daily use)

**Why:** Adding a new key requires editing 2 files with exact JSON path mirroring. Tedious + error-prone. A skill takes `--key=<dot.path> --it="<text>" --en="<text>"` and updates both atomically with parity check.

**Where:** `.claude/skills/elab-locale-add/SKILL.md`

```yaml
---
name: elab-locale-add
description: Add a new i18n key to both it.json + en.json with automatic parity check. Use when adding any new translatable string.
disable-model-invocation: true
---

Usage: `/elab-locale-add namespace.key.name "Testo italiano" "English text"`

1. Parse 3 args (key path, IT value, EN value)
2. Use `jq` or python to inject into both `src/locales/it.json` and `src/locales/en.json` at correct nesting
3. Run parity check
4. Report success with key count delta
```

### Skill B — `/elab-i18n-audit` (MED priority — pre-PR)

**Why:** Pre-PR i18n sanity check — locales parity, hook compliance, interpolation match, build pass, all in one slash.

**Where:** `.claude/skills/elab-i18n-audit/SKILL.md`

Runs:
- `python3 scripts/check-locale-parity.py`
- Interpolation `{{var}}` parity diff
- `grep -L useTranslation` for jsx files with Italian strings
- `npm run build`
- Generate `.team-status/i18n-audit-<date>.md`

---

## 4. PLUGINS

### Plugin recommendation: **elab-i18n-toolkit** (composite plugin)

Bundles all the above into one shareable installable plugin:

**Structure:**
```
.claude/plugins/elab-i18n-toolkit/
├── plugin.json
├── skills/
│   ├── elab-locale-add/SKILL.md
│   └── elab-i18n-audit/SKILL.md
├── agents/
│   ├── i18n-migrator.md
│   └── i18n-reviewer.md
└── hooks/
    └── check-locale-parity.sh
```

Andrea + Tea + Matteo (future devs) all get same i18n discipline by installing once.

---

## 5. MCP SERVERS

### MCP A — Already in use, leverage harder

The session shows **context7**, **supabase**, **vercel** MCPs already loaded. Two adjustments:

- **context7** queries — recommend using for `react-i18next` v17 API drift across migrations. Add to skill prompts: "before editing i18n config, query context7 for react-i18next latest patterns".
- **supabase MCP** — directly add the deferred `users.preferred_language` column from the i18n spec. Currently in CLAUDE.md as Andrea-ratify gate.

### MCP B — Playwright (NEW — HIGH priority)

**Why:** Already in deferred-tools list (`mcp__plugin_playwright_playwright__*`). For i18n testing specifically: navigate site in IT mode then toggle EN, verify visible text changes. Catches missing migrations end-to-end.

**Install:** `claude mcp add playwright`

E2E test:
```javascript
test('language toggle changes all visible chrome', async ({ page }) => {
  await page.goto('https://www.elabtutor.school');
  const itText = await page.locator('header').textContent();
  await page.click('[data-testid="language-switcher"]');
  const enText = await page.locator('header').textContent();
  expect(itText).not.toEqual(enText);
});
```

---

## Priority Implementation Order

1. **Hook C** (disable semgrep noise) — 30 seconds, immediate UX win
2. **Hook A** (locale parity gate) — 15 min, prevents drift forever
3. **Subagent A** (i18n-migrator) — 30 min, accelerates remaining 81 files
4. **Skill A** (`/elab-locale-add`) — 20 min, daily-use ergonomics
5. **Plugin elab-i18n-toolkit** — bundle once everything proven
6. **Playwright MCP** — E2E i18n verification, Sprint U+

---

**Want help implementing any of these?** Each can be scaffolded in 1 follow-up turn. Recommend starting with Hook C + Hook A (lowest effort, highest value).
