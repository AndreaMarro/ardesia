# ELAB Demo 25/05 — Phase P0 + P1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup P0 (worktree + plugin/skill + branch + Codex brief, ~4h stasera) +
Phase P1 S1 geometric fidelity 3 hero esp + S2 VolumeReader passo-passo (~12h domani
24/05). Foundation per demo 25/05 sera.

**Architecture:** Worktree dedicato `elab-builder-demo25` da `main`. Branch
`feat/demo-25may`. Hub-and-spoke: Battery9V/Wire modifications + lesson-paths
build_circuit extension powering 3 hero experiments. VolumeReader + PassoPassoBridge
new components per S2. Codex Desktop overnight per 4 esp residui. Mac Mini continuous
baseline test sentinella.

**Tech Stack:** React 19 + Vite 7, Blockly 12.x, Vitest, Playwright, Supabase, n8n
compile, WebUSB DFU iter-103.

**Spec reference:** `docs/superpowers/specs/2026-05-23-demo-25may-master-design.md` v1.3.

**Scope note:** Questo plan copre **P0 setup + Phase P1 (S1+S2 foundation)** — 60%
effort totale. Plan 2 (P2 AM = S3 UAT + S5 enhance), Plan 3 (P2 PM polish +
dry-run + DEMO), Plan 4 (post-demo deferred work) saranno scritti AFTER Phase P1
completion verificata. Per writing-plans scope check.

---

## File Structure

**Files to CREATE (worktree `../elab-builder-demo25`):**

```
.claude/plugins/elab-demo-guardrails/
├── plugin.json
├── hooks/
│   ├── pre-bash-demo-branch.sh
│   ├── pre-edit-critical.sh
│   ├── stop-build-gate.sh
│   └── user-prompt-countdown.sh

.claude/skills/elab-demo-check/
└── SKILL.md

docs/demo-25may/
├── codex-brief-s1.md
├── circuit-references/         # 7 PNG screenshot da PDF volumi
└── asset-checklist.md

src/components/lavagna/
├── VolumeReader.jsx
├── VolumeReader.module.css
├── PassoPassoVolumeBridge.jsx
└── PassoPassoVolumeBridge.module.css

tests/unit/
├── battery9v.rendermode.test.jsx
├── wire.path-routing.test.jsx
├── volumereader.test.jsx
├── passopasso-volume-bridge.test.jsx
└── lesson-paths.build-circuit-schema.test.js
```

**Files to MODIFY (worktree `../elab-builder-demo25`):**

```
src/components/simulator/components/Battery9V.jsx       # add renderMode prop
src/components/simulator/components/Wire.jsx            # add path prop manual
src/data/lesson-paths/v1-cap6-esp1.json                # build_circuit extension
src/data/lesson-paths/v1-cap6-esp2.json                # build_circuit extension
src/data/lesson-paths/v1-cap6-esp3.json                # build_circuit extension
src/data/lesson-paths/v2-cap7-esp1.json                # build_circuit extension
src/data/lesson-paths/v2-cap7-esp2.json                # build_circuit extension
src/data/lesson-paths/v3-cap6-esp4.json                # build_circuit extension
src/data/lesson-paths/v3-cap6-esp5.json                # build_circuit extension
src/components/simulator/NewElabSimulator.jsx          # mode switching VolumeReader
```

---

## Phase P0 — Setup (23/05 sera, ~4h)

### Task 1: Worktree Creation + Branch

**Files:**
- Create directory: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25/`

- [ ] **Step 1: Fetch latest main**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git fetch origin main
```

Expected: fetch success, no errors.

- [ ] **Step 2: Create worktree from main**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git worktree add ../elab-builder-demo25 -b feat/demo-25may origin/main
```

Expected: `Preparing worktree (new branch 'feat/demo-25may')` + `HEAD is now at <sha>`.

- [ ] **Step 3: Verify worktree**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git branch --show-current
git status
```

Expected: branch = `feat/demo-25may`, status = clean.

- [ ] **Step 4: Install dependencies**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
npm install
```

Expected: `npm install` completes without errors (existing package.json).

- [ ] **Step 5: Verify build baseline**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
npm run build 2>&1 | tail -10
```

Expected: `built in Xs` con 0 errors.

- [ ] **Step 6: Verify tests baseline**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
npx vitest run --reporter=verbose 2>&1 | tail -5
```

Expected: `Test Files X passed (X)`, `Tests Y passed (Y)`. Snapshot Y for delta tracking.

- [ ] **Step 7: Tag baseline**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git tag baseline-demo-pre-23may-2330
```

---

### Task 2: Copy Spec Master Design to Worktree

**Files:**
- Copy: `docs/superpowers/specs/2026-05-23-demo-25may-master-design.md`

- [ ] **Step 1: Copy spec file from current worktree to new worktree**

```bash
cp "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/superpowers/specs/2026-05-23-demo-25may-master-design.md" \
   "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25/docs/superpowers/specs/"
```

- [ ] **Step 2: Copy plan file (this file) to worktree**

```bash
cp "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/superpowers/plans/2026-05-23-demo-25may-P0-P1-plan.md" \
   "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25/docs/superpowers/plans/"
```

- [ ] **Step 3: Verify**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
ls -la docs/superpowers/specs/2026-05-23-demo-25may-master-design.md
ls -la docs/superpowers/plans/2026-05-23-demo-25may-P0-P1-plan.md
```

Expected: entrambi i file presenti.

- [ ] **Step 4: Initial commit**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git add docs/superpowers/specs/2026-05-23-demo-25may-master-design.md \
       docs/superpowers/plans/2026-05-23-demo-25may-P0-P1-plan.md
git commit -m "$(cat <<'EOF'
docs(demo): aggiungi spec master + plan P0+P1 demo 25/05

Spec v1.3 e plan P0+P1 fanno parte del nuovo branch feat/demo-25may.
Spec contiene 9 subsystem MVP scoped, 1245 righe, Andrea ratify
post-mem-search re-scope (80% effort S1+S2 veri gap, 20% altri).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: 2 files committed.

- [ ] **Step 5: Verify commit**

```bash
git log --oneline -1
```

Expected: 1 commit con messaggio sopra.

---

### Task 3: Plugin elab-demo-guardrails MVP

**Files:**
- Create: `.claude/plugins/elab-demo-guardrails/plugin.json`
- Create: `.claude/plugins/elab-demo-guardrails/hooks/pre-bash-demo-branch.sh`
- Create: `.claude/plugins/elab-demo-guardrails/hooks/stop-build-gate.sh`

- [ ] **Step 1: Create plugin directory**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
mkdir -p .claude/plugins/elab-demo-guardrails/hooks
```

- [ ] **Step 2: Create plugin.json**

File: `.claude/plugins/elab-demo-guardrails/plugin.json`

```json
{
  "name": "elab-demo-guardrails",
  "version": "1.0.0",
  "description": "Guardrails per demo 25/05 — anti-regressione, build gate, demo countdown",
  "hooks": {
    "PreToolUse": {
      "Bash": ".claude/plugins/elab-demo-guardrails/hooks/pre-bash-demo-branch.sh"
    },
    "Stop": ".claude/plugins/elab-demo-guardrails/hooks/stop-build-gate.sh"
  }
}
```

- [ ] **Step 3: Create pre-bash hook**

File: `.claude/plugins/elab-demo-guardrails/hooks/pre-bash-demo-branch.sh`

```bash
#!/bin/bash
# Block destructive ops on feat/demo-25may branch
# Read command from stdin (Claude Code passes tool input as JSON)

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')
branch=$(git branch --show-current 2>/dev/null || echo "unknown")

if [[ "$branch" == "feat/demo-25may" ]] || [[ "$branch" == feat/demo-25may-* ]]; then
  if echo "$command" | grep -qE "git reset --hard|git clean -fd|git push --force|rm -rf src/|rm -rf node_modules"; then
    echo "BLOCKED: destructive operation on demo branch: $command" >&2
    exit 2
  fi
fi
exit 0
```

- [ ] **Step 4: Make hook executable**

```bash
chmod +x .claude/plugins/elab-demo-guardrails/hooks/pre-bash-demo-branch.sh
```

- [ ] **Step 5: Create stop hook (build gate smoke)**

File: `.claude/plugins/elab-demo-guardrails/hooks/stop-build-gate.sh`

```bash
#!/bin/bash
# Run npm build smoke on Stop. If fails, block stop.

cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25" || exit 0

# Only gate on demo branch
branch=$(git branch --show-current 2>/dev/null || echo "")
if [[ "$branch" != "feat/demo-25may" && "$branch" != feat/demo-25may-* ]]; then
  exit 0
fi

# Quick build check (only if package.json changed in session)
if git diff HEAD --name-only 2>/dev/null | grep -qE "package\.json|vite\.config|tsconfig"; then
  npm run build 2>&1 | tail -3 >&2
  if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    echo "BLOCKED: npm run build failed on demo branch" >&2
    exit 2
  fi
fi
exit 0
```

- [ ] **Step 6: Make stop hook executable + commit**

```bash
chmod +x .claude/plugins/elab-demo-guardrails/hooks/stop-build-gate.sh

git add .claude/plugins/elab-demo-guardrails/
git commit -m "$(cat <<'EOF'
feat(demo): plugin elab-demo-guardrails MVP (2 hooks)

Hook 1: PreToolUse/Bash blocca destructive ops su demo branch
(git reset --hard, git clean -fd, git push --force, rm -rf src/).

Hook 2: Stop esegue npm build smoke se package.json/vite.config
modificati. Blocca stop se build fail.

Anti-regressione 1° linea difesa per demo 25/05.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Skill elab-demo-check MVP

**Files:**
- Create: `.claude/skills/elab-demo-check/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
mkdir -p .claude/skills/elab-demo-check
```

- [ ] **Step 2: Write SKILL.md**

File: `.claude/skills/elab-demo-check/SKILL.md`

```markdown
---
name: elab-demo-check
description: Pre-demo readiness check ELAB Tutor. Usa prima di dichiarare demo pronta. Trigger keywords - demo check, pre-demo, readiness, demo ready.
---

# Pre-Demo Readiness Check (ELAB Tutor 25/05)

Run questa checklist 2h prima della demo. Output: PASS / WARN / FAIL per ogni item.

## Build + Tests

- [ ] **B1** `npm run build` exits 0 (target: success, <2min)
- [ ] **B2** `npx vitest run` >= baseline `automa/baseline-tests.txt`
- [ ] **B3** Playwright `tests/e2e/demo-*.spec.js` all pass

## Esperimenti Render

- [ ] **B4** 7 esp render correctly: aprire ognuno e verify simulator canvas non vuoto
  - v1-cap6-esp1 "Accendi il tuo primo LED"
  - v1-cap6-esp2 "LED senza resistore (cosa NON fare!)"
  - v1-cap6-esp3 "Cambia luminosità con resistenze diverse"
  - v2-cap7-esp1 "Scarica condensatore con multimetro"
  - v2-cap7-esp2 "Scarica condensatore con LED rosso"
  - v3-cap6-esp4 "Due LED che si alternano"
  - v3-cap6-esp5 "Costruiamo un semaforo"

## API + Infra

- [ ] **B5** Compile endpoint n8n healthy: curl POST `/compile` con sketch valido,
  attende response HEX in <30s.
- [ ] **B6** Gemini API key valid: test call `unlim-chat` su Supabase Edge Function.
- [ ] **B7** Supabase healthy: query `session_actions` table return 200.

## UNLIM Scenari Rehearsed

- [ ] **B8** Scenario 1: LED reverse polarity → UNLIM detect + suggest
- [ ] **B9** Scenario 2: code pin/circuit pin mismatch → UNLIM detect
- [ ] **B10** Scenario 3: condensatore esp2 button context → UNLIM teach

## Asset Fallback

- [ ] **B11** Fumetto rehearsed asset presente in `public/demo-assets/`
- [ ] **B12** Quiz hardcoded backup presente per 7 esp
- [ ] **B13** HEX pre-compiled `public/demo-assets/v3-cap6-esp4-blink.hex`

## Hardware + Network

- [ ] **B14** Nano R4 fisico connesso, Chrome WebUSB requestDevice success
- [ ] **B15** Browser console 0 errors dopo 30-min smoke walkthrough
- [ ] **B16** Network: Supabase + Gemini + n8n + Vercel reachable
- [ ] **B17** Hotspot mobile attivo + tested
- [ ] **B18** LIM/projector tested

## Documentation

- [ ] **B19** Demo script printed + reviewed
- [ ] **B20** Fallback decision tree printed + reviewed

---

## Verdict

| Status | Meaning |
|---|---|
| **PASS** (20/20) | Demo ready. Procedi. |
| **WARN** (17-19/20 + B4 OK) | Demo possibile con caveats. Cerca workaround. |
| **FAIL** (<17/20 OR B4 FAIL OR build/test fail) | Demo POSTPONE o riduzione scope live. |
```

- [ ] **Step 3: Commit skill**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git add .claude/skills/elab-demo-check/
git commit -m "$(cat <<'EOF'
feat(demo): skill elab-demo-check pre-demo readiness 20-item

20-item checklist (build/tests/render/api/UNLIM scenari/asset/hw/docs)
con verdict PASS/WARN/FAIL. Run T-2h pre-demo per gate finale.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Verify P0 Critical Items (Q1, Q3, Q9, Q12)

**Files:**
- Test (no code changes, only verification)

- [ ] **Step 1: Q1 — Test compile endpoint Nano R4**

```bash
curl -X POST https://n8n.srv1022317.hstgr.cloud/compile \
  -H "Content-Type: application/json" \
  -d '{
    "sketch": "void setup(){pinMode(13,OUTPUT);} void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}",
    "fqbn": "arduino:renesas_uno:nanor4"
  }' 2>&1 | head -50
```

Expected: response JSON con `hexBase64` o `binBase64` field. Se 404/500 → fallback to
cloud-compile server.js scaffold OR test FQBN `arduino:avr:nano` (AVR fallback).

Document outcome:
- ✅ Endpoint supporta Nano R4 → S3 demo path verde.
- ❌ Endpoint solo AVR → fallback decision: usare Nano AVR + emulation OR aggiungere
  RA4M1 toolchain a server.js.

- [ ] **Step 2: Q3 — Verify Gemini API key (via Supabase Edge Function test)**

```bash
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: <ANDREA-API-KEY>" \
  -d '{"messages":[{"role":"user","content":"test"}]}' 2>&1 | head -20
```

Expected: response JSON con `success: true` + content. Se `success: false` →
investigare causa (key invalida, quota, network).

- [ ] **Step 3: Q9 — Verify Mac Mini connectivity**

```bash
ping -c 3 macmini.local 2>&1 | tail -5
ssh -i ~/.ssh/id_ed25519_elab andreamarro@macmini.local "git log --oneline -3" 2>&1 | head
```

Expected: ping success + SSH command returns recent commits. Se fail → Mac Mini offline
o SSH key mismatch.

- [ ] **Step 4: Q12 — Verify Nano R4 hardware**

User action: Andrea collega Nano R4 fisico via USB-C al Mac. Apre Chrome.
DevTools console:

```js
navigator.usb.requestDevice({filters: [{vendorId: 0x2341}]})
  .then(d => console.log('FOUND', d.productId.toString(16)))
  .catch(e => console.log('NOT FOUND', e.message))
```

Expected: device found, productId `0x0374` (runtime) OR `0x0074` (DFU mode).
Se NOT FOUND → verifica USB-C cable + driver + permessi browser.

- [ ] **Step 5: Document verifications**

File: `docs/demo-25may/P0-verifications-23may.md`

```markdown
# P0 Verifications — 23/05/2026 sera

| Q | Item | Status | Notes |
|---|---|---|---|
| Q1 | Compile endpoint Nano R4 | ✅/❌ | <output curl> |
| Q3 | Gemini API key | ✅/❌ | <output curl> |
| Q9 | Mac Mini SSH | ✅/❌ | <output ssh> |
| Q12 | Nano R4 hardware | ✅/❌ | <productId hex> |

Decision: <go/no-go per P1 24/05>
```

- [ ] **Step 6: Commit verification doc**

```bash
git add docs/demo-25may/P0-verifications-23may.md
git commit -m "docs(demo): P0 verifications Q1+Q3+Q9+Q12 (compile+Gemini+macmini+hw)"
```

---

### Task 6: Decide Fate 5 Open PRs (#154-158)

**Files:**
- Decision documented in: `docs/demo-25may/sprint-b-pr-decision.md`

- [ ] **Step 1: Inspect 5 PR descriptions + diffs**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
for pr in 154 155 156 157 158; do
  echo "=== PR #$pr ==="
  gh pr view $pr --json title,additions,deletions,state,files
  echo
done
```

Expected: output 5 PR con additions/deletions counts + file lists.

- [ ] **Step 2: Identify conflict risk**

```bash
# Check if PRs modify files we'll touch in P1
gh pr view 154 --json files | jq '.files[].path'
gh pr view 155 --json files | jq '.files[].path'
gh pr view 156 --json files | jq '.files[].path'
gh pr view 157 --json files | jq '.files[].path'
gh pr view 158 --json files | jq '.files[].path'
```

Cross-reference con file list "Files to MODIFY" sopra. Se overlap → MERGE FIRST.

- [ ] **Step 3: Decision tree**

Per ogni PR:

- Se PR è style atomico Sprint B Code Kit, additions <50, no conflicts con P1 files,
  has CI green → **MERGE NOW** (su main, cherry-pick in demo branch).
- Se PR ha conflicts con P1 files → **MERGE FIRST poi rebase feat/demo-25may**.
- Se PR ha CI red o conflicts complessi → **CLOSE + defer post-demo**.

- [ ] **Step 4: Execute decisions**

For each PR decided MERGE:
```bash
gh pr review <number> --approve --body "Sprint B atomic style. Approved per demo prep."
gh pr merge <number> --squash --auto
```

For each PR decided CLOSE:
```bash
gh pr close <number> --comment "Deferred post-demo 25/05 per scope reduction. Reopen iter 84+."
```

- [ ] **Step 5: Rebase feat/demo-25may onto updated main**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git fetch origin main
git rebase origin/main
```

Expected: rebase success. Se conflicts → resolve manually, NO --no-verify.

- [ ] **Step 6: Document + commit**

File: `docs/demo-25may/sprint-b-pr-decision.md`

```markdown
# Sprint B PR Decisions — 23/05/2026 sera

| PR | Title | Decision | Rationale |
|---|---|---|---|
| #154 | style(b4-a1) topbar | <MERGE/CLOSE> | <why> |
| #155 | style(b4-a5) serial tab | <MERGE/CLOSE> | <why> |
| #156 | fix(b4-a3) drawing colorbar | <MERGE/CLOSE> | <why> |
| #157 | style(b4-a2) editor dominant | <MERGE/CLOSE> | <why> |
| #158 | style(b4-a7) overflow guardrail | <MERGE/CLOSE> | <why> |

Result: <X merged + Y closed>. feat/demo-25may rebased onto main HEAD <sha>.
```

```bash
git add docs/demo-25may/sprint-b-pr-decision.md
git commit -m "docs(demo): decisione 5 PR aperti Sprint B per demo prep"
```

---

### Task 7: Brief Codex Desktop for Overnight S1 Work

**Files:**
- Create: `docs/demo-25may/codex-brief-s1.md`

- [ ] **Step 1: Write detailed Codex brief**

File: `docs/demo-25may/codex-brief-s1.md`

````markdown
# Codex Desktop Brief — S1 Geometric Fidelity 7 Esp

**Branch:** `feat/demo-25may-s1-codex` (sub-branch from `feat/demo-25may`).
**Working dir:** `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25`.
**Deadline:** 24/05/2026 ore 08:00 (overnight session).

## Goal

Render 7 esperimenti demo IDENTICAL ai disegni dei volumi cartacei. Per ogni esp:

- Stessa orientazione componenti.
- Stesso colore cavi.
- Stessa geometria filo nello spazio (path waypoints).
- Stessa posizione su breadboard.
- Pila SENZA strisci cavi (renderMode=clip_simplified).

## Context

- Spec: `docs/superpowers/specs/2026-05-23-demo-25may-master-design.md` §4.1 S1.
- Reference images: `docs/demo-25may/circuit-references/<exp-id>.png` (7 PNG, Andrea
  estrae da PDF volumi prima brief).
- Components SVG: `src/components/simulator/components/` (21 existing).
- Lesson-paths: `src/data/lesson-paths/v*.json`.
- Constraint immutabile: NanoR4Board SCALE=1.8, BB_HOLE_PITCH=7.5px (CLAUDE.md regole).

## Tasks

### T1: Extend Battery9V.jsx (add renderMode prop)

File: `src/components/simulator/components/Battery9V.jsx`

Aggiungi prop `renderMode: "clip_simplified" | "default"` (default = `"default"`).
- Quando `clip_simplified`: render SOLO clip rossa + clip nera come connection points
  (no strisci cavi pre-renderizzati).
- Wire renderizzati separatamente da `Wire.jsx`.

TDD: scrivi test `tests/unit/battery9v.rendermode.test.jsx` PRIMA. Test:
- Snapshot SVG con renderMode default mostra strisci.
- Snapshot SVG con renderMode clip_simplified NON mostra strisci.
- Connection points rossa + nera presenti in entrambi.

### T2: Extend Wire.jsx (add path prop)

File: `src/components/simulator/components/Wire.jsx`

Aggiungi prop `path: Array<{x, y}>` per routing manuale.
- Se `path` undefined → fallback auto-routing attuale.
- Se `path` definito → render SVG `<polyline>` con waypoints + stroke color = `wire.color`.

TDD: test `tests/unit/wire.path-routing.test.jsx`. Test:
- Wire senza path usa auto-routing (esistente).
- Wire con path 3-waypoint render polyline corretto.
- Stroke color = "red" se wire.color === "red".

### T3-T9: Per ogni 7 esperimento, extend lesson-path build_circuit

Per ognuno di:
- v1-cap6-esp1, v1-cap6-esp2, v1-cap6-esp3
- v2-cap7-esp1, v2-cap7-esp2
- v3-cap6-esp4, v3-cap6-esp5

File: `src/data/lesson-paths/<id>.json`

Aggiungi/extend campo `build_circuit`:

```json
"build_circuit": {
  "reference_image": "/docs/demo-25may/circuit-references/<id>.png",
  "components": [
    {
      "type": "battery9v",
      "id": "bat1",
      "position": {"x": 50, "y": 100, "rotation": 0},
      "render_mode": "clip_simplified"
    },
    {
      "type": "led",
      "id": "led1",
      "position": {"x": 240, "y": 180, "rotation": 0},
      "anode_at": "d23",
      "cathode_at": "d24"
    }
  ],
  "wires": [
    {
      "from": "bat1.pos",
      "to": "rail.bus-top-plus.0",
      "color": "red",
      "path": [
        {"x": 60, "y": 110},
        {"x": 60, "y": 80},
        {"x": 100, "y": 80}
      ]
    }
  ]
}
```

Coordinate vanno derivate da reference image (Andrea fornisce PNG). Per i 3 hero esp
(v1-cap6-esp1, v2-cap7-esp2, v3-cap6-esp5) priorità PERFEZIONE. Altri 4 "good enough".

### T10: Integration test visual diff (Playwright)

File: `tests/e2e/demo-geometric-fidelity.spec.js`

```js
import { test, expect } from '@playwright/test';

const EXPERIMENTS = [
  'v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap6-esp3',
  'v2-cap7-esp1', 'v2-cap7-esp2',
  'v3-cap6-esp4', 'v3-cap6-esp5',
];

EXPERIMENTS.forEach(expId => {
  test(`geometric fidelity ${expId}`, async ({ page }) => {
    await page.goto(`/#esperimento/${expId}`);
    await page.evaluate(id => window.__ELAB_API.mountExperiment(id), expId);
    await page.waitForTimeout(500); // wait render
    await expect(page.locator('svg.simulator-canvas')).toHaveScreenshot(
      `${expId}.png`,
      { maxDiffPixelRatio: 0.05 } // 5% tolerance
    );
  });
});
```

## Constraints

- **NON toccare** `CircuitSolver.js`, `AVRBridge.js`, `PlacementEngine.js` core. Solo
  aggiunte non-breaking.
- **NON usare** `--no-verify` sui commit.
- **NON modificare** `package.json` (deps).
- Atomic commits con conventional format: `feat(s1): ...`, `test(s1): ...`.
- Run `npx vitest run` PRIMA di ogni commit, verifica delta non negativo vs baseline.

## Deliverables expected at 08:00

- Branch `feat/demo-25may-s1-codex` con 10 commit atomici (1 per task T1-T10).
- Test count: baseline + 14 nuovi test (T1+T2 = 6 new; T10 = 7 new visual diff specs;
  T3-T9 = 1 new schema validation per esp).
- PR aperto su `feat/demo-25may` per merge review.
- Build PASS.
- Vitest run >= baseline.

## Honest Scope Reporting

Se entro 08:00 NON completi tutti i task:
- Documenta CHIARAMENTE quali esp sono PERFECT vs good-enough vs incomplete.
- Suggerisci priorità per Andrea P1 AM da completare a mano.
- NO claim falso "complete" se incomplete.
````

- [ ] **Step 2: Commit brief**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git add docs/demo-25may/codex-brief-s1.md
git commit -m "docs(demo): Codex Desktop brief per S1 7 esp overnight 23-24/05"
```

- [ ] **Step 3: Andrea action — dispatch Codex Desktop**

User action: Apri Codex Desktop app. New session. Path: `/Users/andreamarro/VOLUME
3/PRODOTTO/elab-builder-demo25`. Initial prompt:

```
Sei Codex. Esegui il brief in docs/demo-25may/codex-brief-s1.md.
Branch dedicato: feat/demo-25may-s1-codex.
Comportati come descritto nel brief.
Comincia.
```

- [ ] **Step 4: Push demo branch initial state**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
git push -u origin feat/demo-25may
```

Expected: push success, branch upstream set.

---

## Phase P1 — S1 Foundation + S2 (24/05, ~12h)

### Task 8: Battery9V renderMode prop (TDD)

**NOTE:** If Codex Desktop completes T1 from brief overnight, SKIP this task (review
Codex commit instead). If Codex output incomplete, execute this manually.

**Files:**
- Modify: `src/components/simulator/components/Battery9V.jsx`
- Test: `tests/unit/battery9v.rendermode.test.jsx`

- [ ] **Step 1: Write failing test FIRST**

File: `tests/unit/battery9v.rendermode.test.jsx`

```jsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Battery9V from '../../src/components/simulator/components/Battery9V';

describe('Battery9V renderMode prop', () => {
  it('default renderMode shows strisci cavi (legacy behavior)', () => {
    const { container } = render(<Battery9V id="bat1" x={50} y={100} />);
    const stricciElements = container.querySelectorAll('[data-strisci]');
    expect(stricciElements.length).toBeGreaterThan(0);
  });

  it('renderMode="clip_simplified" hides strisci, shows only clip', () => {
    const { container } = render(
      <Battery9V id="bat1" x={50} y={100} renderMode="clip_simplified" />
    );
    const stricciElements = container.querySelectorAll('[data-strisci]');
    expect(stricciElements.length).toBe(0);

    const clipRed = container.querySelector('[data-clip="red"]');
    const clipBlack = container.querySelector('[data-clip="black"]');
    expect(clipRed).toBeTruthy();
    expect(clipBlack).toBeTruthy();
  });

  it('connection points red+black present in both modes', () => {
    const { container: defaultC } = render(<Battery9V id="bat1" x={50} y={100} />);
    const { container: simplC } = render(
      <Battery9V id="bat1" x={50} y={100} renderMode="clip_simplified" />
    );
    expect(defaultC.querySelector('[data-connection="pos"]')).toBeTruthy();
    expect(defaultC.querySelector('[data-connection="neg"]')).toBeTruthy();
    expect(simplC.querySelector('[data-connection="pos"]')).toBeTruthy();
    expect(simplC.querySelector('[data-connection="neg"]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify FAIL**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
npx vitest run tests/unit/battery9v.rendermode.test.jsx 2>&1 | tail -20
```

Expected: tests FAIL because `renderMode` prop doesn't exist OR `data-*` attributes
missing. Specific errors documented.

- [ ] **Step 3: Read current Battery9V.jsx**

```bash
cat src/components/simulator/components/Battery9V.jsx
```

Identify: render method, current SVG structure, where to add conditional rendering for
`renderMode="clip_simplified"`.

- [ ] **Step 4: Implement minimal change to pass tests**

Edit `src/components/simulator/components/Battery9V.jsx`:

```jsx
// Add to component signature:
function Battery9V({ id, x, y, renderMode = "default" }) {
  // ... existing code ...

  return (
    <g data-component-id={id} transform={`translate(${x}, ${y})`}>
      {/* Clip rossa - always rendered */}
      <rect
        x="0" y="0" width="10" height="20"
        fill="#E54B3D"
        data-clip="red"
        data-connection="pos"
      />

      {/* Clip nera - always rendered */}
      <rect
        x="0" y="25" width="10" height="20"
        fill="#222"
        data-clip="black"
        data-connection="neg"
      />

      {/* Strisci cavi - only in default mode */}
      {renderMode === "default" && (
        <>
          <path d="M5,10 L20,10 L20,5"
            stroke="red" strokeWidth="2" fill="none"
            data-strisci="red"
          />
          <path d="M5,35 L20,35 L20,40"
            stroke="black" strokeWidth="2" fill="none"
            data-strisci="black"
          />
        </>
      )}
    </g>
  );
}

export default Battery9V;
```

Exact code structure depends on current implementation — adapt patterns.

- [ ] **Step 5: Run test to verify PASS**

```bash
npx vitest run tests/unit/battery9v.rendermode.test.jsx 2>&1 | tail -10
```

Expected: 3/3 tests PASS.

- [ ] **Step 6: Run full vitest to ensure no regression**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: `Tests X passed` with X = baseline + 3 (new tests added).

- [ ] **Step 7: Commit**

```bash
git add src/components/simulator/components/Battery9V.jsx \
        tests/unit/battery9v.rendermode.test.jsx
git commit -m "$(cat <<'EOF'
feat(s1): Battery9V renderMode clip_simplified prop

Aggiunge renderMode prop: "default" mostra strisci cavi (legacy),
"clip_simplified" mostra solo clip rossa+nera senza strisci.

Necessario per S1 geometric fidelity demo: il libro mostra pila
collegata SOLO con cavo rosso+nero diretti, NO strisci pre-renderizzati.

3 nuovi test TDD verde. Baseline + 3 = NUOVOTOTALE.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Wire.jsx path prop manual routing (TDD)

**NOTE:** Same as Task 8 — if Codex completed T2 from brief, SKIP and review.

**Files:**
- Modify: `src/components/simulator/components/Wire.jsx`
- Test: `tests/unit/wire.path-routing.test.jsx`

- [ ] **Step 1: Write failing test**

File: `tests/unit/wire.path-routing.test.jsx`

```jsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Wire from '../../src/components/simulator/components/Wire';

describe('Wire path prop manual routing', () => {
  it('wire without path uses auto-routing (existing behavior)', () => {
    const { container } = render(
      <Wire id="w1" from={{x:0,y:0}} to={{x:100,y:100}} color="red" />
    );
    // Without path, should render auto-routed line/polyline
    const lines = container.querySelectorAll('line, polyline');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('wire with path renders polyline with waypoints', () => {
    const path = [{x:10,y:10}, {x:50,y:10}, {x:50,y:50}, {x:100,y:50}];
    const { container } = render(
      <Wire id="w1" from={{x:0,y:0}} to={{x:100,y:100}}
            color="red" path={path} />
    );
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
    const points = polyline.getAttribute('points');
    expect(points).toContain('10,10');
    expect(points).toContain('50,10');
    expect(points).toContain('50,50');
    expect(points).toContain('100,50');
  });

  it('wire stroke color matches color prop', () => {
    const { container } = render(
      <Wire id="w1" from={{x:0,y:0}} to={{x:100,y:100}}
            color="red" path={[{x:0,y:0}, {x:100,y:100}]} />
    );
    const polyline = container.querySelector('polyline');
    expect(polyline.getAttribute('stroke')).toMatch(/red|#E54B3D|rgb\(229/i);
  });
});
```

- [ ] **Step 2: Run test FAIL**

```bash
npx vitest run tests/unit/wire.path-routing.test.jsx 2>&1 | tail -15
```

Expected: tests FAIL because `path` prop doesn't exist or polyline isn't rendered.

- [ ] **Step 3: Read current Wire.jsx**

```bash
cat src/components/simulator/components/Wire.jsx
```

- [ ] **Step 4: Implement path prop**

Edit `src/components/simulator/components/Wire.jsx`:

```jsx
function Wire({ id, from, to, color = "red", path }) {
  const COLOR_MAP = { red: "#E54B3D", black: "#222", blue: "#1E4D8C", green: "#4A7A25" };
  const stroke = COLOR_MAP[color] || color;

  if (path && Array.isArray(path) && path.length >= 2) {
    const points = path.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <polyline
        data-wire-id={id}
        points={points}
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
    );
  }

  // Fallback: auto-routing existing behavior (preserve current impl)
  // ... existing auto-routing code ...
}
```

- [ ] **Step 5: Run test PASS**

```bash
npx vitest run tests/unit/wire.path-routing.test.jsx 2>&1 | tail -10
```

Expected: 3/3 PASS.

- [ ] **Step 6: Run full vitest no regression**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: baseline + 6 (3 + 3 from Task 8).

- [ ] **Step 7: Commit**

```bash
git add src/components/simulator/components/Wire.jsx \
        tests/unit/wire.path-routing.test.jsx
git commit -m "$(cat <<'EOF'
feat(s1): Wire.jsx path prop manual waypoint routing

Aggiunge path prop opzionale Array<{x,y}> per routing manuale
SVG polyline. Se path undefined fallback auto-routing esistente.
Stroke color usa palette ELAB (Navy/Lime/Orange/Red) con map.

Necessario S1 geometric fidelity: lesson-paths v*.json
definiranno path waypoints identici ai disegni libro.

3 nuovi test TDD verde.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Hero esp v1-cap6-esp1 build_circuit schema (TDD)

**Files:**
- Modify: `src/data/lesson-paths/v1-cap6-esp1.json`
- Test: `tests/unit/lesson-paths.build-circuit-schema.test.js`

- [ ] **Step 1: User action — Andrea estrae screenshot pagina disegno libro**

User action: Andrea apre `CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf`,
trova pagina con circuit diagram esp "Accendi il tuo primo LED", screenshot
crop solo il disegno, salva come `docs/demo-25may/circuit-references/v1-cap6-esp1.png`.

- [ ] **Step 2: Write schema validation test**

File: `tests/unit/lesson-paths.build-circuit-schema.test.js`

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const HERO_EXPERIMENTS = ['v1-cap6-esp1', 'v2-cap7-esp2', 'v3-cap6-esp5'];

describe('lesson-paths build_circuit schema (hero esp)', () => {
  HERO_EXPERIMENTS.forEach(expId => {
    it(`${expId} has valid build_circuit schema`, () => {
      const path = `src/data/lesson-paths/${expId}.json`;
      const data = JSON.parse(readFileSync(path, 'utf8'));

      expect(data.build_circuit).toBeDefined();
      expect(data.build_circuit.reference_image).toMatch(/circuit-references.*\.png$/);
      expect(Array.isArray(data.build_circuit.components)).toBe(true);
      expect(data.build_circuit.components.length).toBeGreaterThan(0);

      data.build_circuit.components.forEach(comp => {
        expect(comp.type).toBeDefined();
        expect(comp.id).toBeDefined();
        expect(comp.position).toMatchObject({
          x: expect.any(Number),
          y: expect.any(Number)
        });
      });

      // Battery must have render_mode clip_simplified
      const battery = data.build_circuit.components.find(c => c.type === 'battery9v');
      if (battery) {
        expect(battery.render_mode).toBe('clip_simplified');
      }

      // Wires schema
      if (data.build_circuit.wires) {
        data.build_circuit.wires.forEach(wire => {
          expect(wire.from).toBeDefined();
          expect(wire.to).toBeDefined();
          expect(wire.color).toMatch(/^(red|black|blue|green)$/);
          if (wire.path) {
            expect(Array.isArray(wire.path)).toBe(true);
            expect(wire.path.length).toBeGreaterThanOrEqual(2);
          }
        });
      }
    });
  });
});
```

- [ ] **Step 3: Run test FAIL (no build_circuit yet)**

```bash
npx vitest run tests/unit/lesson-paths.build-circuit-schema.test.js 2>&1 | tail -10
```

Expected: 3 tests FAIL because `build_circuit.reference_image` non esiste.

- [ ] **Step 4: Read current v1-cap6-esp1.json + add build_circuit**

```bash
cat src/data/lesson-paths/v1-cap6-esp1.json | head -60
```

Identify position to add `build_circuit` field (probabilmente dopo `objective` o
`components_needed`).

- [ ] **Step 5: Edit v1-cap6-esp1.json**

Aggiungi al JSON (coordinate derivate da reference image, Andrea verifica):

```json
"build_circuit": {
  "reference_image": "/docs/demo-25may/circuit-references/v1-cap6-esp1.png",
  "components": [
    {
      "type": "breadboard-half",
      "id": "bb1",
      "position": { "x": 150, "y": 200, "rotation": 0 }
    },
    {
      "type": "battery9v",
      "id": "bat1",
      "position": { "x": 50, "y": 250, "rotation": 0 },
      "render_mode": "clip_simplified"
    },
    {
      "type": "resistor",
      "id": "r1",
      "position": { "x": 200, "y": 220, "rotation": 0 },
      "value": "470",
      "leads_at": ["e5", "e10"]
    },
    {
      "type": "led",
      "id": "led1",
      "position": { "x": 280, "y": 230, "rotation": 0 },
      "color": "red",
      "anode_at": "d10",
      "cathode_at": "d11"
    }
  ],
  "wires": [
    {
      "from": "bat1.pos",
      "to": "rail.bus-top-plus.0",
      "color": "red",
      "path": [
        { "x": 60, "y": 260 },
        { "x": 60, "y": 195 },
        { "x": 155, "y": 195 }
      ]
    },
    {
      "from": "bat1.neg",
      "to": "rail.bus-bot-minus.0",
      "color": "black",
      "path": [
        { "x": 60, "y": 275 },
        { "x": 60, "y": 320 },
        { "x": 155, "y": 320 }
      ]
    },
    {
      "from": "rail.bus-top-plus.5",
      "to": "e5",
      "color": "red",
      "path": [
        { "x": 200, "y": 210 },
        { "x": 200, "y": 220 }
      ]
    },
    {
      "from": "d11",
      "to": "rail.bus-bot-minus.10",
      "color": "black",
      "path": [
        { "x": 285, "y": 240 },
        { "x": 285, "y": 320 }
      ]
    }
  ]
}
```

- [ ] **Step 6: Run test PASS for v1-cap6-esp1 (other hero still fail)**

```bash
npx vitest run tests/unit/lesson-paths.build-circuit-schema.test.js 2>&1 | tail -10
```

Expected: 1/3 PASS (v1-cap6-esp1), 2/3 still FAIL.

- [ ] **Step 7: Smoke test render**

```bash
# Start dev server
npm run dev &
SERVER_PID=$!
sleep 5

# Open browser to esperimento (Andrea visual verify or Playwright snapshot)
echo "Open http://localhost:5173/#esperimento/v1-cap6-esp1 in Chrome"
echo "Verify simulator canvas renders circuit identical to circuit-references/v1-cap6-esp1.png"

# Kill server after manual verify
read -p "Press Enter when verified..."
kill $SERVER_PID
```

- [ ] **Step 8: Commit**

```bash
git add src/data/lesson-paths/v1-cap6-esp1.json \
        tests/unit/lesson-paths.build-circuit-schema.test.js \
        docs/demo-25may/circuit-references/v1-cap6-esp1.png
git commit -m "$(cat <<'EOF'
feat(s1): v1-cap6-esp1 build_circuit schema + reference image

Hero esp #1 (LED on). Schema build_circuit con 4 component
(bb, battery clip_simplified, R 470, LED rosso) + 4 wire con path
manual waypoints. Coordinate derivate da reference image (Vol1).

Battery9V usa render_mode clip_simplified (no strisci).
Wire usano path prop manual routing per geometria identica libro.

1 schema validation test passa (v1-cap6-esp1).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Hero esp v2-cap7-esp2 build_circuit schema (TDD)

Stessa pattern di Task 10 ma per `v2-cap7-esp2` (condensatore LED rosso scarica = magic
moment demo).

**Files:**
- Modify: `src/data/lesson-paths/v2-cap7-esp2.json`
- Asset: `docs/demo-25may/circuit-references/v2-cap7-esp2.png`

- [ ] **Step 1: Andrea estrae reference image da Vol2 PDF (page con disegno cap7 esp2)**

- [ ] **Step 2: Edit JSON con build_circuit** (5 components: bb, batt clip_simplified,
  pulsante, cond 1000μF, R 1kΩ, LED rosso, multimetro; ~6 wire). Coordinate da
  reference image. **Critico**: condensatore (e5-e6), pulsante (e10-f12), resistore
  1kΩ (e15-e22), LED (d23 anodo, d24 catodo) come specificato nel lesson-path teacher
  message §4.1.

- [ ] **Step 3: Run test, verify v2-cap7-esp2 PASS**

```bash
npx vitest run tests/unit/lesson-paths.build-circuit-schema.test.js 2>&1 | tail -5
```

Expected: 2/3 PASS (v1-cap6-esp1 + v2-cap7-esp2).

- [ ] **Step 4: Smoke test render** (Andrea verify visual identical to reference).

- [ ] **Step 5: Commit**

```bash
git add src/data/lesson-paths/v2-cap7-esp2.json \
        docs/demo-25may/circuit-references/v2-cap7-esp2.png
git commit -m "feat(s1): v2-cap7-esp2 build_circuit (condensatore LED scarica magic)"
```

---

### Task 12: Hero esp v3-cap6-esp5 build_circuit schema (TDD)

Stessa pattern, semaforo 3 LED.

**Files:**
- Modify: `src/data/lesson-paths/v3-cap6-esp5.json`
- Asset: `docs/demo-25may/circuit-references/v3-cap6-esp5.png`

- [ ] **Step 1: Andrea estrae reference image Vol3 pag 57 (per `volume_reference` esistente)**

- [ ] **Step 2: Edit JSON build_circuit** (bb, Nano R4, 3 LED rosso/giallo/verde su pin
  5/6/9, 3 R 470). Coordinate da reference.

- [ ] **Step 3: Run test 3/3 PASS**

```bash
npx vitest run tests/unit/lesson-paths.build-circuit-schema.test.js 2>&1 | tail -5
```

Expected: 3/3 PASS.

- [ ] **Step 4: Smoke test render**

- [ ] **Step 5: Commit**

```bash
git add src/data/lesson-paths/v3-cap6-esp5.json \
        docs/demo-25may/circuit-references/v3-cap6-esp5.png
git commit -m "feat(s1): v3-cap6-esp5 build_circuit (semaforo 3 LED pin 5/6/9)"
```

---

### Task 13: VolumeReader.jsx component (TDD)

**Files:**
- Create: `src/components/lavagna/VolumeReader.jsx`
- Create: `src/components/lavagna/VolumeReader.module.css`
- Test: `tests/unit/volumereader.test.jsx`

- [ ] **Step 1: Verify pdfjs-dist in package.json**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
grep -E "pdfjs|react-pdf" package.json
```

If absent → DECISION POINT: install `react-pdf` (heavy dep, needs Andrea approval) OR
use pre-rendered PNG approach (lighter, slower iteration).

For demo MVP: PNG approach (pre-extract pages as PNG, lighter).

- [ ] **Step 2: Pre-extract volume pages as PNG**

User action: Andrea usa app esterna (Preview Mac OR pdftoppm CLI):

```bash
pdftoppm "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf" \
  public/demo-assets/volumes/vol1/page -png -r 150
pdftoppm "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf" \
  public/demo-assets/volumes/vol2/page -png -r 150
pdftoppm "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Manuale VOLUME 3 V0.8.1.pdf" \
  public/demo-assets/volumes/vol3/page -png -r 150
```

Expected: ~60 PNG files per volume in `public/demo-assets/volumes/vol{1,2,3}/page-NN.png`.

- [ ] **Step 3: Write failing test**

File: `tests/unit/volumereader.test.jsx`

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VolumeReader from '../../src/components/lavagna/VolumeReader';

describe('VolumeReader', () => {
  it('renders page image for given volume + page', () => {
    render(<VolumeReader volume={1} page={5} />);
    const img = screen.getByRole('img', { name: /vol 1 pag 5/i });
    expect(img.src).toContain('/demo-assets/volumes/vol1/page-5.png');
  });

  it('has jump-to-page input', () => {
    const onPageChange = vi.fn();
    render(<VolumeReader volume={2} page={10} onPageChange={onPageChange} />);
    const input = screen.getByLabelText(/vai a pagina/i);
    fireEvent.change(input, { target: { value: '15' } });
    fireEvent.submit(input.form);
    expect(onPageChange).toHaveBeenCalledWith(15);
  });

  it('arrow buttons advance/retreat page', () => {
    const onPageChange = vi.fn();
    render(<VolumeReader volume={1} page={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText(/pagina successiva/i));
    expect(onPageChange).toHaveBeenCalledWith(11);
    fireEvent.click(screen.getByLabelText(/pagina precedente/i));
    expect(onPageChange).toHaveBeenCalledWith(9);
  });
});
```

- [ ] **Step 4: Run test FAIL**

```bash
npx vitest run tests/unit/volumereader.test.jsx 2>&1 | tail -10
```

Expected: 3 FAIL (component non esiste).

- [ ] **Step 5: Implement VolumeReader.jsx**

File: `src/components/lavagna/VolumeReader.jsx`

```jsx
import { useState } from 'react';
import styles from './VolumeReader.module.css';

export default function VolumeReader({ volume, page, onPageChange }) {
  const [jumpInput, setJumpInput] = useState('');

  const handleJump = (e) => {
    e.preventDefault();
    const n = parseInt(jumpInput, 10);
    if (n > 0 && onPageChange) onPageChange(n);
    setJumpInput('');
  };

  const imageSrc = `/demo-assets/volumes/vol${volume}/page-${page}.png`;

  return (
    <div className={styles.reader}>
      <div className={styles.pageContainer}>
        <img
          src={imageSrc}
          alt={`Vol ${volume} pag ${page}`}
          className={styles.pageImage}
        />
      </div>
      <div className={styles.toolbar}>
        <button
          onClick={() => onPageChange?.(page - 1)}
          disabled={page <= 1}
          aria-label="pagina precedente"
        >
          ◀
        </button>

        <form onSubmit={handleJump} className={styles.jumpForm}>
          <label htmlFor="jump-page" className={styles.jumpLabel}>
            Vai a pagina
          </label>
          <input
            id="jump-page"
            type="number"
            min="1"
            value={jumpInput}
            onChange={e => setJumpInput(e.target.value)}
            className={styles.jumpInput}
          />
        </form>

        <button
          onClick={() => onPageChange?.(page + 1)}
          aria-label="pagina successiva"
        >
          ▶
        </button>

        <span className={styles.pageNumber}>
          Vol {volume} — pag {page}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create CSS module**

File: `src/components/lavagna/VolumeReader.module.css`

```css
.reader {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border: 1px solid #ddd;
}

.pageContainer {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: #f7f7f5;
}

.pageImage {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: block;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-top: 1px solid #ddd;
  background: #fff;
  min-height: 48px; /* WCAG touch target */
}

.toolbar button {
  min-width: 44px;
  min-height: 44px;
  font-size: 18px;
  background: #1E4D8C;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.jumpForm {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jumpLabel {
  font-size: 14px;
  color: #333;
}

.jumpInput {
  width: 80px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #999;
  border-radius: 4px;
}

.pageNumber {
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
  color: #1E4D8C;
}
```

- [ ] **Step 7: Run test PASS**

```bash
npx vitest run tests/unit/volumereader.test.jsx 2>&1 | tail -10
```

Expected: 3/3 PASS.

- [ ] **Step 8: Full vitest no regression**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: baseline + 12 (3+3+3+3 from Tasks 8-13).

- [ ] **Step 9: Commit**

```bash
git add src/components/lavagna/VolumeReader.jsx \
        src/components/lavagna/VolumeReader.module.css \
        tests/unit/volumereader.test.jsx
git commit -m "$(cat <<'EOF'
feat(s2): VolumeReader.jsx component PNG-based

Renderizza pagine volume da public/demo-assets/volumes/vol{N}/page-{P}.png
(pre-extracted con pdftoppm). Toolbar con jump-to-page input + freccia
prev/next + page indicator.

Approach PNG vs react-pdf: lighter (no parsing dep), faster render.
Trade-off: no annotation overlay native — sara aggiunto via canvas
overlay in Task 14 (PassoPassoVolumeBridge).

WCAG touch targets 44x44 OK.

3 nuovi test TDD verde.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: PassoPassoVolumeBridge.jsx component (TDD)

**Files:**
- Create: `src/components/lavagna/PassoPassoVolumeBridge.jsx`
- Create: `src/components/lavagna/PassoPassoVolumeBridge.module.css`
- Test: `tests/unit/passopasso-volume-bridge.test.jsx`

- [ ] **Step 1: Write failing test**

File: `tests/unit/passopasso-volume-bridge.test.jsx`

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PassoPassoVolumeBridge from '../../src/components/lavagna/PassoPassoVolumeBridge';

const MOCK_EXP = {
  experiment_id: 'v1-cap6-esp1',
  volume: 1,
  title: 'Accendi il tuo primo LED',
  volume_reference: { volume: 1, page: 5 },
  phases: [
    { name: 'PREPARA', teacher_message: 'Ragazzi, prepariamo i componenti.' },
    { name: 'MOSTRA', teacher_message: 'Ragazzi, ora mostriamo il circuito.' },
  ],
  next_experiment: { id: 'v1-cap6-esp2', title: 'LED senza resistore' }
};

describe('PassoPassoVolumeBridge', () => {
  it('renders VolumeReader on left + PassoPasso panel on right', () => {
    render(<PassoPassoVolumeBridge experiment={MOCK_EXP} currentStep={0} />);
    expect(screen.getByRole('img', { name: /vol 1 pag 5/i })).toBeInTheDocument();
    expect(screen.getByText(/prepariamo i componenti/i)).toBeInTheDocument();
  });

  it('next button navigates between steps', () => {
    const onStepChange = vi.fn();
    render(
      <PassoPassoVolumeBridge
        experiment={MOCK_EXP}
        currentStep={0}
        onStepChange={onStepChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('avanti at last step navigates to next experiment passo-passo mode', () => {
    const onExperimentChange = vi.fn();
    render(
      <PassoPassoVolumeBridge
        experiment={MOCK_EXP}
        currentStep={1}
        onExperimentChange={onExperimentChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(onExperimentChange).toHaveBeenCalledWith({
      id: 'v1-cap6-esp2',
      mode: 'passo-passo'  // critical: stay in passo-passo, NOT gia-montato
    });
  });
});
```

- [ ] **Step 2: Run test FAIL**

```bash
npx vitest run tests/unit/passopasso-volume-bridge.test.jsx 2>&1 | tail -10
```

Expected: 3 FAIL.

- [ ] **Step 3: Implement PassoPassoVolumeBridge.jsx**

File: `src/components/lavagna/PassoPassoVolumeBridge.jsx`

```jsx
import { useState } from 'react';
import VolumeReader from './VolumeReader';
import styles from './PassoPassoVolumeBridge.module.css';

export default function PassoPassoVolumeBridge({
  experiment,
  currentStep = 0,
  onStepChange,
  onExperimentChange
}) {
  const [currentPage, setCurrentPage] = useState(
    experiment.volume_reference?.page || 1
  );

  const phase = experiment.phases?.[currentStep];
  const isLastStep = currentStep >= (experiment.phases?.length - 1);

  const handleNext = () => {
    if (isLastStep) {
      // Naviga a next experiment in passo-passo mode (NON gia-montato)
      if (experiment.next_experiment && onExperimentChange) {
        onExperimentChange({
          id: experiment.next_experiment.id,
          mode: 'passo-passo'
        });
      }
    } else {
      if (onStepChange) onStepChange(currentStep + 1);
    }
  };

  return (
    <div className={styles.bridge}>
      <div className={styles.volumePane}>
        <VolumeReader
          volume={experiment.volume_reference?.volume || 1}
          page={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className={styles.passoPassoPane}>
        <div className={styles.expHeader}>
          <h3>{experiment.title}</h3>
          <span className={styles.stepIndicator}>
            Step {currentStep + 1} / {experiment.phases?.length || 1}
          </span>
        </div>

        {phase && (
          <div className={styles.phaseContent}>
            <h4>{phase.name}</h4>
            <p className={styles.teacherMessage}>{phase.teacher_message}</p>
            {phase.teacher_tip && (
              <p className={styles.teacherTip}>💡 {phase.teacher_tip}</p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {currentStep > 0 && (
            <button
              onClick={() => onStepChange?.(currentStep - 1)}
              className={styles.backBtn}
            >
              ◀ Indietro
            </button>
          )}
          <button
            onClick={handleNext}
            className={styles.nextBtn}
          >
            {isLastStep ? 'Avanti al prossimo esperimento' : 'Avanti'} ▶
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create CSS module**

File: `src/components/lavagna/PassoPassoVolumeBridge.module.css`

```css
.bridge {
  display: grid;
  grid-template-columns: 60% 40%;
  height: 100%;
  gap: 8px;
  background: #f0f0ee;
}

.volumePane {
  background: #fff;
  border-right: 2px solid #1E4D8C;
}

.passoPassoPane {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fff;
}

.expHeader {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid #4A7A25;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.expHeader h3 {
  margin: 0;
  font-family: Oswald, sans-serif;
  color: #1E4D8C;
}

.stepIndicator {
  font-size: 14px;
  color: #888;
  font-weight: 600;
}

.phaseContent {
  flex: 1;
}

.phaseContent h4 {
  font-family: Oswald, sans-serif;
  color: #E8941C;
  font-size: 18px;
  margin: 0 0 12px;
}

.teacherMessage {
  font-size: 16px;
  line-height: 1.6;
  color: #222;
}

.teacherTip {
  background: #fff8e1;
  border-left: 4px solid #E8941C;
  padding: 12px;
  margin-top: 16px;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #ddd;
}

.backBtn,
.nextBtn {
  min-height: 44px;
  padding: 8px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.backBtn {
  background: #f0f0ee;
  color: #333;
}

.nextBtn {
  background: #4A7A25;
  color: #fff;
}

.nextBtn:hover {
  background: #3a5e1d;
}
```

- [ ] **Step 5: Run test PASS**

```bash
npx vitest run tests/unit/passopasso-volume-bridge.test.jsx 2>&1 | tail -10
```

Expected: 3/3 PASS.

- [ ] **Step 6: Full vitest no regression**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: baseline + 15.

- [ ] **Step 7: Commit**

```bash
git add src/components/lavagna/PassoPassoVolumeBridge.jsx \
        src/components/lavagna/PassoPassoVolumeBridge.module.css \
        tests/unit/passopasso-volume-bridge.test.jsx
git commit -m "$(cat <<'EOF'
feat(s2): PassoPassoVolumeBridge.jsx split-screen volume+passo-passo

Layout 60/40 split: VolumeReader sx + PassoPasso pane dx.
Avanti button: navigate step interno OR a next esperimento.
CRITICAL: avanti at last step → mode=passo-passo (NON gia-montato),
preserva utente intent come da spec Andrea.

Teacher message + teacher tip rendered con stile distinto.
WCAG touch targets, palette ELAB Navy/Lime/Orange.

3 nuovi test TDD verde.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Integrate PassoPassoVolumeBridge into NewElabSimulator

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx`

- [ ] **Step 1: Read current NewElabSimulator.jsx mode switching logic**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"
grep -n "passo-passo\|gia-montato\|mode" src/components/simulator/NewElabSimulator.jsx | head -30
```

Identify: dove viene scelto cosa rendere in base a mode corrente.

- [ ] **Step 2: Add import + conditional mount**

Edit `src/components/simulator/NewElabSimulator.jsx`:

```jsx
// Top imports
import PassoPassoVolumeBridge from '../lavagna/PassoPassoVolumeBridge';

// Inside component render method, when mode === 'passo-passo':
{currentMode === 'passo-passo' && currentExperiment && (
  <PassoPassoVolumeBridge
    experiment={currentExperiment}
    currentStep={passoPassoStep}
    onStepChange={setPassoPassoStep}
    onExperimentChange={({ id, mode }) => {
      navigateToExperiment(id, mode);  // existing function
    }}
  />
)}

// When mode === 'gia-montato', mount VolumeReader auto-opened on exp page:
{currentMode === 'gia-montato' && currentExperiment && (
  <div className={styles.giaMontatoLayout}>
    <SimulatorCanvas /* existing */ />
    <VolumeReader
      volume={currentExperiment.volume}
      page={currentExperiment.volume_reference?.page || 1}
    />
  </div>
)}
```

Adapt to actual existing code structure (function names, state names, layout).

- [ ] **Step 3: Run vitest no regression**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: 0 regression (existing tests still pass).

- [ ] **Step 4: Smoke test 7 esp**

```bash
npm run dev &
SERVER_PID=$!
sleep 5

# Manual test per ognuno dei 7 esp:
echo "Open http://localhost:5173/#esperimento/v1-cap6-esp1?mode=passo-passo"
echo "Verify VolumeReader sx + PassoPasso dx visible"
echo "Click Avanti, verify step progresses"
echo "At last step click Avanti, verify naviga a v1-cap6-esp2 passo-passo mode"

read -p "Press Enter when smoke complete..."
kill $SERVER_PID
```

- [ ] **Step 5: Commit**

```bash
git add src/components/simulator/NewElabSimulator.jsx
git commit -m "$(cat <<'EOF'
feat(s2): integrate PassoPassoVolumeBridge in NewElabSimulator

Mode switching:
- passo-passo: mount PassoPassoVolumeBridge (split-screen)
- gia-montato: mount VolumeReader + SimulatorCanvas side-by-side
- percorso, libero: behavior esistente

Navigate to next experiment via onExperimentChange callback
mantiene mode=passo-passo (NON forza gia-montato) come da spec
§4.2 Andrea ratify.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

Spec coverage check (§ riferimento spec v1.3):

- ✅ §4.1 S1 — Battery9V renderMode + Wire path + 3 hero build_circuit = Tasks 8-12
- ✅ §4.2 S2 — VolumeReader + PassoPassoBridge + mode integration = Tasks 13-15
- ⏳ §4.3 S3 — UAT compile/upload Nano R4 = Plan 2
- ⏳ §4.4 S4 — Blockly toolbox audit = DEFERRED post-demo
- ⏳ §4.5 S5 — UNLIM 5-role pipeline enhance = Plan 2
- ⏳ §4.6 S6 — Fumetto 3-phase polish = Plan 3
- ⏳ §4.7 S7 — Quiz/diary UI wire-up = Plan 3
- ✅ §4.8 S8 — Plugin/skill MVP = Tasks 3-4
- ⏳ §4.9 S9 — Demo orch + dry-run = Plan 3

Placeholder scan: nessun "TBD" "TODO" "fill in" rimasto.

Type consistency: `renderMode` prop coerente Battery9V test + JSON schema +
Battery9V.jsx. `path` prop coerente Wire test + Wire.jsx + JSON wires.

---

## Plan 2 + 3 + 4 Outline (to write after P1 complete)

**Plan 2 (P2 AM, 25/05 ore 08:00-12:00):**
- Task 16-17: S3 UAT compile endpoint + WebUSB DFU live test Nano R4
- Task 18-20: S5 sessionActionLog + enhanced collectFullContext + 3 scenari rehearsed
- Task 21: Integration test FULL suite manual smoke

**Plan 3 (P2 PM, 25/05 ore 12:00-19:30):**
- Task 22: S6 pre-generated fumetto asset for rehearsed session
- Task 23: S7 QuizPanel + DiaryPage UI wire-up
- Task 24: 4 esp residui geometry polish (Codex output review)
- Task 25-26: Dry-run 1 + adjust
- Task 27-28: Dry-run 2 + pre-demo checklist (skill elab-demo-check)

**Plan 4 (DEMO 25/05 sera + post-demo):**
- DEMO LIVE
- Post-demo: S4 Blockly audit, Promptfoo install, BackstopJS install, GDPR policy,
  SBOM, 72 esp geometry full

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-23-demo-25may-P0-P1-plan.md`.
Two execution options:

**1. Subagent-Driven (recommended)** — dispatch fresh subagent per task, review between
tasks, fast iteration. Best for parallel ownership (Codex Desktop S1 overnight + Andrea
S2 P1).

**2. Inline Execution** — execute tasks in this session using executing-plans, batch
execution with checkpoints. Slower ma full visibility ad ogni step.

**Which approach?**
