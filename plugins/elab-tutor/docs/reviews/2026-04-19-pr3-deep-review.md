# Deep Code Review — PR #3 "Lesson Reader v1 complete"

**Date**: 2026-04-19
**Reviewer**: CodeRabbit / deep review agent
**Branch**: `feature/lesson-reader-complete-v1`
**Base**: `main` @ 7ca9eb6
**Scope**: 19 files changed, 855+/258-
**PR URL**: https://github.com/AndreaMarro/elab-tutor/pull/3

---

## Verdict

**REQUEST_CHANGES** — blocked on 1 P0 security issue (unconditional prod-path auth bypass) and 1 P0 integrity concern (quietly lowered CI baseline). Product code (LessonSelector / LessonReader integration) is strong: Principio Zero v3 compliant, reuses existing data modules, TDD order respected, WCAG 2.1 AA targets met.

Fix the P0s (10–30 min of work) and this is a clean merge.

---

## Scorecard

| Dimension | Score | Notes |
|---|---|---|
| Principio Zero v3 compliance | **9.5 / 10** | Zero "chat with UNLIM" pattern in new UI. Pure navigable content. See §3. |
| Regola 0 Riuso compliance | **9.5 / 10** | Extends, does not rewrite. See §4. |
| TDD order (Regola 2) | **10 / 10** | `test(...)` commits precede `feat(...)` in both atomic pairs. See §5. |
| Security | **4 / 10** | Unconditional prod auth bypass via localStorage. P0. See §1.1. |
| Accessibility (WCAG AA) | **7.5 / 10** | Mostly passes; role=button on `<li>` is wrong semantics and one font-size is 11px. See §2. |
| React 19 patterns | **8 / 10** | Correct; one minor `useId()` pattern is overkill. See §6. |
| Test coverage (new code) | **9 / 10** | Unit + integration + E2E. 6/7 branches covered. See §7. |
| CI / governance integrity | **5 / 10** | Baseline silently decreased 12056 → 11958 with a split-number hack. P0. See §1.2. |

---

## 1. Critical issues (P0 — must fix before merge)

### 1.1 — Production auth bypass via localStorage (SECURITY)

**File**: `src/context/AuthContext.jsx:25–34`
**Commit**: part of the E2E helper plumbing (see `e2e/helpers.js` diff)

```jsx
async function initAuth() {
    // ── E2E override: localStorage user bypasses real auth ──
    try {
        const e2eRaw = localStorage.getItem('elab_e2e_user');
        if (e2eRaw) {
            const e2eUser = JSON.parse(e2eRaw);
            if (!cancelled) { setUser(e2eUser); setHasLicense(true); setLoading(false); }
            return;
        }
    } catch { /* ignore malformed */ }
    // ...
}
```

**Severity**: P0 — critical security vulnerability.

**Why it's broken**:
- The block runs **unconditionally** — no `import.meta.env.DEV`, no `import.meta.env.MODE === 'test'`, no host check, no build-time define guard.
- Contrast with the existing DEV mock at line 72 which IS gated: `if (import.meta.env.DEV && !cancelled) { ... }`. The author knew the pattern and did not apply it.
- On `https://www.elabtutor.school` in production, any visitor can open DevTools and run:
  ```js
  localStorage.setItem('elab_e2e_user', JSON.stringify({
    id: 'x', ruolo: 'admin', email: 'pwn@example.com',
    kits: ['Volume 1','Volume 2','Volume 3'], premium: true
  }));
  location.reload();
  ```
  → bypasses Supabase auth, gains `isAdmin`/`isDocente` in every `useAuth()` consumer, gains access to the admin panel (`#admin`), Teacher Dashboard, and any route behind a role check.
- `hasLicense = true` is granted unconditionally, defeating the licensing model entirely.
- Object is `JSON.parse`'d into `setUser` with zero schema validation, so fields flow directly into UI and potentially into Supabase writes if the consumer re-serializes.

**Threat model**: low skill, high impact. Anyone who reads this PR diff on GitHub can exploit it. Students have been shown DevTools in classrooms — this is not theoretical.

**Fix** (one of the three, pick cheapest):

```jsx
// Option A — build-time strip (preferred, zero runtime cost in prod)
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    const e2eRaw = localStorage.getItem('elab_e2e_user');
    // ... existing body
}

// Option B — explicit E2E flag set by Playwright, stripped in prod bundle
if (import.meta.env.VITE_E2E === 'true') { ... }

// Option C — runtime host check (last resort, adds perf cost)
if (typeof location !== 'undefined' && /^(localhost|127\.|0\.0\.0\.0|.*\.local)/.test(location.hostname)) { ... }
```

Option A is idiomatic for Vite: `import.meta.env.DEV` is statically replaced with `false` in production builds, so the dead-code-eliminator (terser/esbuild) removes the whole block. Verify with `grep -r elab_e2e_user dist/` after `npm run build`.

Also recommended (secondary):
- Validate the parsed object has at minimum `{ id: string, ruolo: 'studente'|'docente'|'admin' }` before calling `setUser`.
- Never grant `hasLicense = true` via this path — force it to `false` and let the test also seed a license if needed.

---

### 1.2 — Baseline silently decreased to hide a failing CI gate

**File**: `.test-count-baseline.json`
**Commit**: `c3640dd fix(ci): baseline 12081→11958 (CI reality) + localTotal=12081 target`

```json
{
  "total": 11958,        // was 12056
  "localTotal": 12081,
  "notes": [
    "Gap 123 test CI vs locale RILEVATO 19/04 post fix quality-gate regex. Causa ignota —",
    "tests/setup.js non ha env-skip, vitest config identico. Possibile: pool='forks' + ..."
  ]
}
```

**Severity**: P0 — governance / integrity issue, not a code bug.

**Why it's broken**:
- The baseline dropped from 12056 → 11958 (−98 tests) in the same PR that also added new tests (`LessonSelector.test.jsx`, `LavagnaShellLezione.test.jsx`, 21-lesson-reader-flow.spec.js). Net effect on CI: the gate is now softer than before this PR.
- The author's own note says "Causa ignota" — the root cause is unknown. Lowering a regression threshold with an unknown cause is exactly the anti-pattern `CLAUDE.md` forbids in the "Anti-regressione (FERREA)" section:
  > "Se test scendono → REVERT IMMEDIATO"
- The split `total` / `localTotal` trick is a novel concept being introduced in a product PR. It should be debated and approved in its own governance PR, not smuggled in with a feature.
- The CoV rule ("Mai inventare numeri ... se dici '12056 test' devi averli appena visti in `vitest run` output") is being inverted: the PR says "local has 12081, CI has 11958, we don't know why, shipping it".

**Fix**:
1. Revert `.test-count-baseline.json` to 12056 (or whatever CI was reporting on `main` before this PR).
2. Split the CI-baseline investigation into a dedicated task — the author has correctly identified there's something pool-related (`pool='forks' + maxForks=4`). Run `npx vitest run --pool=forks --poolOptions.forks.maxForks=4` locally; if the 123-test delta reproduces, the answer is there. If not, try under `ubuntu-latest` via `act` or a throwaway CI job.
3. Rebase the PR onto a fixed baseline. New tests in the PR should push the number UP, not down.

Until (1)–(3) happen, this PR erodes anti-regression enforcement for every subsequent PR.

---

## 2. High priority (P1)

### 2.1 — Accessibility: `role="button"` on `<li>` is incorrect

**Files**: `src/components/lavagna/LessonSelector.jsx:14–23`, `src/components/lavagna/LessonReader.jsx:30–39`

```jsx
<li
  key={lessonId}
  className={...}
  onClick={() => onLessonSelect?.(lessonId)}
  role="button"           // ← semantic lie
  tabIndex={0}
  onKeyDown={...}>
```

**Issue**: an `<li>` inside a `<ul>`/`<ol>` is announced by screen readers as "list item 1 of 6". Slapping `role="button"` on top overrides that but also removes the list-item semantics, defeating the surrounding `<nav aria-label="Scegli lezione">` + `<ul>`/`<ol>` structure.

**Fix**: put the button inside the `<li>`, not on it.

```jsx
<li key={lessonId}>
  <button
    type="button"
    data-testid={`lesson-option-${lessonId}`}
    className={`${styles.item} ${isActive ? styles.selected : ''}`}
    onClick={() => onLessonSelect?.(lessonId)}
    aria-current={isActive ? 'true' : undefined}
  >
    <span className={styles.chapter}>Cap. {lesson.chapter}</span>
    <span className={styles.title}>{lesson.title}</span>
  </button>
</li>
```

Bonus: drops the `onKeyDown` / `tabIndex={0}` because `<button>` handles Enter and Space natively. Drops the `role="button"` because `<button>` is a button. Adds `aria-current` so screen readers announce the active lesson.

This is a recurring pattern in the codebase (same shape in `LessonReader.jsx`). Fix both together.

### 2.2 — Font size below the 13px minimum in CLAUDE.md Rule 8

**File**: `src/components/lavagna/LessonSelector.module.css:50`

```css
.chapter {
  font-size: 0.6875rem;   /* = 11px ← below the 13px rule */
  color: #4A7A25;
}
```

Combined with `.item { font-size: 0.8125rem; }` (13px — at the floor) this is tight but ok. But 11px for chapter labels is below Rule 8 ("Font minimo 13px testi, 10px label secondarie"). Since `Cap. 6` is small but IS meaningful navigation info (not a label), 12–13px is the right minimum.

Also: color `#4A7A25` on `.selected` background `#1E4D8C` (line 57: `.selected .chapter { color: #a5d6a7; }`) — that override gives you light green on navy. Contrast ratio `#a5d6a7` on `#1E4D8C` is ~4.1:1, **below the WCAG AA 4.5:1 minimum for text under 18pt bold / 24pt regular**. The 11px text makes it worse. Use a lighter shade (e.g. `#c8e6a3`) or white-ish `#e8f5d8`.

**Fix**:
```css
.chapter {
  font-size: 0.75rem;   /* 12px, at label minimum */
  color: #4A7A25;
}
.selected .chapter { color: #e8f5d8; }  /* AA-compliant on #1E4D8C */
```

### 2.3 — `activeLessonId` hard-coded default causes a misleading E2E

**File**: `src/components/lavagna/LavagnaShell.jsx:403`

```jsx
const [activeLessonId, setActiveLessonId] = useState('v1-accendi-led');
```

And in the E2E spec line 30:
```js
const heading = page.getByRole('heading', { name: /Accendi il LED/i });
await expect(heading).toBeVisible({ timeout: 5000 });
```

The E2E "clicking tab shows LessonReader with lesson title" does not really verify the tab works — it verifies the default state. A teacher with no prior state will always see `Accendi il LED` regardless of the tab's correctness. The assertion would pass even if the tab did nothing and the reader rendered unconditionally.

**Fix**: before `clickLezioneTab()`, assert the heading is NOT visible (tab is on Lavagna). After the click, assert visible. This guarantees the state change is what produced the DOM.

Also: the hard-coded `'v1-accendi-led'` default should be derived from `currentVolume` (e.g. when volume=3, default to `'v3-primi-passi'`). Otherwise a teacher on Volume 3 who clicks "Lezione Guidata" is whiplashed back to Volume 1. Minor, but easy to fix.

---

## 3. Principio Zero v3 compliance

**Score**: 9.5 / 10 — excellent.

The question was: "LessonSelector + LessonReader NON devono essere chat conversazionali con UNLIM. Devono ESSERE contenuto navigabile."

**Verification (grep)**:
```
grep -iE "(UNLIM|chiedi|galileo|sendMessage|chat)" src/components/lavagna/LessonSelector.jsx
→ No matches found
grep -iE "(UNLIM|chiedi|galileo|sendMessage|chat)" src/components/lavagna/LessonReader.jsx
→ No matches found
```

Both components render pure structured content:
- **LessonSelector** — grid of `<li>Cap. N — Title</li>` navigable by click/keyboard, reads from `getLessonsForVolume()`.
- **LessonReader** — timeline of experiment steps with `bookText` citations pulled verbatim from `volume-references.js`, which in turn were extracted via `pdftotext` from the physical volumes. Exactly what "Il testo dei volumi deve essere CITATO e USATO per la lettura — le stesse parole, non parafrasi" asks for.

E2E spec explicitly asserts the anti-pattern is absent:
```js
test('Principio Zero v3: no "Docente leggi" anywhere', async ({ page }) => {
  const body = await page.textContent('body');
  expect(body).not.toMatch(/Docente,\s*leggi/i);
  expect(body).not.toMatch(/Insegnante,\s*leggi/i);
});
```
This is a guardrail against regression.

**−0.5 point** for `const isDocente = isDocente;` gating `showLezioneTab` in `LavagnaShell:780`. Principio Zero says *"chiunque accendendo ELAB Tutor deve essere in grado ... di giostrarsi sulla piattaforma e spiegare ai ragazzi"*. Gating the Lezione tab behind `ruolo==='docente'||'teacher'` means a family-kit user who is not marked as docente (a parent, an older sibling) cannot see the tab and therefore cannot use the product as intended. Consider: `showLezioneTab={!isStudente}` or `showLezioneTab` always on. This is a product-level decision — flag it for Andrea, not a blocker.

---

## 4. Regola 0 Riuso compliance

**Score**: 9.5 / 10.

**Evidence of reuse**:
- `LessonSelector` imports from `src/data/lesson-groups.js` (existing, 250 lines, untouched).
- `LessonReader` imports from `src/data/volume-references.js` (existing, 81k, untouched) and `lesson-groups.js`.
- `LavagnaShell` integration is a pure extension: 38 lines added, 1 line replaced (the `useState('lavagna')` init swapped for a localStorage-reading init). No existing component was modified destructively.
- `AppHeader` gets one new conditional tab button, gated by a new optional prop `showLezioneTab` — opt-in, does not affect callers that don't pass it.
- `e2e/helpers.js` modifies `setTeacherUser` to use a new localStorage key `elab_e2e_user`. Breaking change for any other E2E using the old key, but only 2 specs exist — low risk.

**−0.5 point** for the `GOVERNANCE.md` Regola 0 rewrite committed in the same PR (commit `22ec3ba`). Changing the rule that governs the PR in the same PR is a tell — the scope is blurred. Split governance changes into their own PR with their own review. The content of the rewrite is reasonable ("rewrite OK when justified") but the pattern of smuggling governance updates into a feature PR erodes the gate.

---

## 5. TDD order (Regola 2)

**Score**: 10 / 10. Verified.

Commit log shows:
```
cb70be0 test(lavagna): TDD tests for LessonSelector component       ← test first
5b56712 feat(lavagna): LessonSelector + 5+ lezioni Vol 1 complete   ← feat second

f922b0b test(lavagna): TDD tests for LessonReader tab in LavagnaShell  ← test first
de2266d feat(lavagna): integrate LessonReader tab in LavagnaShell     ← feat second
```

Both atomic pairs respect strict TDD order. The governance-gate workflow even enforces this (Regola 2 in `.github/workflows/governance-gate.yml`).

---

## 6. React 19 patterns

**Score**: 8 / 10.

- `LessonSelector.jsx` is a pure-render component with no hooks — correct. No premature `useCallback` / `useMemo`.
- `LessonReader.jsx` likewise hooks-free and idiomatic.
- `LavagnaShell.jsx` additions:
  - `useState('v1-accendi-led')` for `activeLessonId` — fine.
  - New `useEffect` persisting `activeTab` to localStorage — fine, minimal deps.
  - `handleLessonExperimentSelect` wrapped in `useCallback([])` — the empty deps array is accurate (all referenced setters are stable React setters). Correct.

Minor suggestion: the `useId()` in `QuickComponentPanel` (line 212) was pre-existing and is clever, but the `.replace(/:/g, '')` is fragile against React internals. That's not from this PR, so not a blocker — flagging for future cleanup.

---

## 7. Tests

**Score**: 9 / 10.

**Unit (LessonSelector.test.jsx — 6 tests)**: good coverage — renders, click handler, active class, chapter label, volume 2 fallback, invalid volume edge case.

**Integration (LavagnaShellLezione.test.jsx — 6 tests)**: good — tab visibility, click activation, active class, mount API call, "no Docente leggi" guardrail.

**E2E (21-lesson-reader-flow.spec.js — 8 tests)**: comprehensive — tab visibility, click shows reader, timeline, page citations, 5+ lessons present, lesson switch, mount trigger, Principio Zero guardrail.

**Weaknesses**:
- No test for `LessonSelector` keyboard navigation (Enter/Space on an `<li role="button">`). The fix in §2.1 would make this free (native button behavior), so wait for that.
- No test verifies the `useEffect` persistence of `activeTab` across reloads. Nice-to-have, not blocking.
- The E2E "switching lesson updates LessonReader" (line 56–61) clicks `v1-led-rgb` and asserts the heading changes. But `LessonReader` only reads from `activeLessonId` — this tests the selector-to-reader wiring, which is good. Keep it.
- Test `'clicking experiment step triggers mount'` in the E2E just asserts `stepClasses` is truthy — it never verifies `__ELAB_API.mountExperiment` was called with the right arg. The unit test `LavagnaShellLezione.test.jsx:102` DOES verify this properly. The E2E test is vacuous; either delete it or mount a spy in the page.

---

## 8. Nice to have (P2 / P3)

### P2
- **Dead code**: `percorsoOpen` state in `LavagnaShell.jsx:402` is set but never read in the render tree (the header prop `percorsoOpen` is computed inline as `galileoOpen && unlimTab === 'percorso'`). Remove the `useState`.
- **E2E reliability**: the `goToLezione` helper clicks "Lavagna libera" to dismiss the picker. This couples the Lezione test to picker-dismissal behavior. Prefer using `localStorage.setItem('elab_skip_bentornati','true')` in `addInitScript` so the picker never opens.
- **Baseline file comment is shouting**: the `.test-count-baseline.json` `notes` section is half-rant. Move the investigation TODO to an issue/task; keep the file terse.

### P3
- **Naming**: `LessonSelector` and `LessonReader` make a coherent pair, but the existing `PercorsoPanel` also selects & reads paths. Consider: are these redundant long-term? Not for this PR.
- **i18n**: `aria-label="Scegli lezione"` is hard-coded Italian. Fine today, call it out if multi-language ever comes up.
- **Prop types**: no PropTypes / TypeScript. The codebase is JS, so no action, but `LessonSelector({ volumeNumber, activeLessonId, onLessonSelect })` would benefit from a JSDoc `@typedef`.

---

## 9. Summary of required changes before merge

1. **[P0, security]** Gate the `elab_e2e_user` block in `AuthContext.jsx` with `import.meta.env.DEV || import.meta.env.MODE === 'test'` and verify `dist/` has no occurrence of the string post-build.
2. **[P0, governance]** Revert `.test-count-baseline.json` total to 12056 (or the true CI-measured pre-PR count). Investigate the 123-test CI/local gap in a separate task. Do not ship a lower baseline in a feature PR.
3. **[P1, a11y]** Replace `<li role="button" tabIndex={0} onKeyDown={...}>` with `<li><button type="button">...</button></li>` in both `LessonSelector.jsx` and `LessonReader.jsx`.
4. **[P1, a11y]** Raise `.chapter` font-size to 12px (0.75rem) and swap `.selected .chapter` color to `#e8f5d8` for WCAG AA on navy.
5. **[P1, tests]** Fix the vacuous "clicking experiment step triggers mount" E2E — spy on `__ELAB_API.mountExperiment` via `page.exposeFunction` or delete it (the unit test already covers the behavior).

Nice-to-haves (not blocking): §2.3 on the default `activeLessonId`, §4 note on splitting governance PRs, §8 items.

---

## 10. What the PR got right

- TDD order impeccable in both atomic pairs.
- Zero mock data — `VOLUME_REFERENCES` is genuine `pdftotext` extraction. Aligns with `feedback_no_demo.md`.
- `LessonSelector` and `LessonReader` are under 60 lines each — surgical, goal-driven, Karpathy-principle-aligned.
- Principio Zero v3 enforced in the product *and* in a Playwright guardrail.
- Reuse of `lesson-groups.js` and `volume-references.js` is textbook extension.
- `ErrorToast` / `MascotPresence` / other UNLIM entrypoints remain available on the Lavagna tab, so the "UNLIM as teacher's tool" Principio is preserved — the new tab adds a content surface, it does not replace UNLIM.

Fix the two P0s, address the a11y items, and this is a strong merge.
