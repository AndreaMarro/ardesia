# Adversarial Review Pass 2 — feat/i18n-en-it-full @ 5aac6618

**Mode:** Manual (Codex CLI unavailable)
**Scope:** 4 new commits since pass 1 (84d9ae8f)

## Findings

### LOW — `scripts/check-locale-parity.py:34-44` — list values not walked deeper
Flatten skips lists (treats them as leaves). `home.greetings_list` array compared via Python list equality — verifies length+order but no per-element interpolation check. Acceptable for IT/EN simple arrays; would miss drift in long arrays. Recommend documenting OR extending to walk lists.

### LOW — `scripts/check-locale-parity.py` — no `__file__` PYTHONPATH safety
Uses `Path(__file__).resolve().parent.parent`. Breaks if invoked via stdin or symlink. Safe for repo invocation; flagged for completeness.

### PASS — `src/components/auth/DataDeletion.jsx:159-162` — split prefix/keyword/suffix
Italian: `"Per confermare l'eliminazione, digita " + ELIMINA + " nel campo sottostante:"` — trailing/leading whitespace preserved correctly in JSON values. English mirror correct. RTL not handled (not required for IT/EN).

### MED — `src/components/simulator/panels/LessonPathPanel.jsx` — orphan keys
22 keys defined in `lesson_path_panel.*` namespace, only **12 wired**. 10 orphans: `cue`, `typical_errors`, `analogy`, `observe`, `analogies_to_explain`, `say_to_class`, `lesson_label`, `lesson_path_title`, `material_per_group`, `if_they_ask_more` etc. Either wire them or remove. Locale parity script doesn't catch orphan keys — only IT/EN parity.

### PASS — `CLAUDE.md` — 4 i18n mentions verified
All 4 patches landed: `Principio Zero cross-locale`, `i18n MANDATORY`, `i18n EN/IT Migration` section, `LIVE_SYSTEM_PROMPT_EN` ratify gate.

### PASS — `src/components/tutor/PredictObserveExplain.jsx:33` + `CircuitDetective.jsx:34` — hook position
Both export plain `function` (NOT wrapped in `React.memo`). `useTranslation()` called at top of function before any conditional. Rule-of-hooks compliant.

### LOW — Branch state
- 24 commits, NOT deployed (no `vercel --prod` ran from session)
- Vercel preview likely auto-built from push but unverified
- Zero Playwright E2E for EN flow
- No prod smoke test

## Summary

- HIGH: 0
- MED: 1 (LessonPathPanel orphan keys — wire or remove)
- LOW: 3 (parity-script list handling, script PYTHONPATH, branch undeployed)
- PASS: 3

**Verdict:** Pass 2 quality maintained. MED finding actionable in 5min (wire 10 missing t() calls OR delete 10 orphan keys). Branch shippable post that fix.

---
*Pass 2 — manual review, Codex CLI unavailable*
