# PDR — Vision E2E Live (feature F2.3 Roadmap v1.0)

**Status**: READY TO EXECUTE
**Target agent**: Claude Opus 4.7 via Managed Agent (Max subscription)
**Durata stimata**: 3-4h autonome
**Branch**: `feature/vision-e2e-live`
**Dipendenze**: PR #3 Lesson Reader v1 merged su main (prerequisite chiusura sessione 19/04 mattina)
**Governance**: `docs/GOVERNANCE.md` regole 0-5 obbligatorie
**Plan master**: `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → Feature 1

---

## 🎯 Obiettivo

Implementare "UNLIM guarda il mio circuito" end-to-end:

1. Studente/docente clicca button "Guarda il mio circuito" nella Lavagna
2. Simulatore cattura screenshot via `window.__ELAB_API.captureScreenshot()`
3. Base64 inviato a Supabase Edge Function `unlim-chat` con `images` array
4. Gemini 2.5 Pro Vision analizza circuito
5. Risposta UNLIM: diagnosi + tag `[AZIONE:highlight:id]` componenti problematici
6. Frontend esegue azioni + mostra diagnosi nel ChatOverlay

**Principio Zero v3 requirement**:
- Linguaggio "Ragazzi" plurale
- Max 3 frasi + 1 analogia (libro/strade/tubi)
- NO "Docente leggi" meta-istruzioni
- Citazione libro ELAB se possibile

---

## ⚖️ Regola 0 — riuso esistente

**Riusa**:
- `src/services/unlimContextCollector.js:collectFullContext()` — già supporta screenshot
- `src/services/api.js:sendChat({images})` — già gestisce images array
- `supabase/functions/unlim-chat/index.ts` — accetta images in body (già impl)
- `window.__ELAB_API.captureScreenshot()` — funzione esposta (verifica in `src/services/simulator-api.js`)
- `src/utils/aiSafetyFilter.js` — filtra risposta AI
- `src/components/tutor/ChatOverlay.*` — render risposta
- `supabase/functions/_shared/guards.ts` — MIME validation + image size limit
- `supabase/functions/_shared/system-prompt.ts` — BASE_PROMPT con Principio Zero v3

**Nuovo** (minimale):
- `src/components/tutor/VisionButton.jsx` — 60 righe
- `src/components/tutor/VisionButton.module.css` — 50 righe
- `tests/unit/tutor/VisionButton.test.jsx` — 7 test
- `tests/e2e/22-vision-flow.spec.js` — 3 scenari
- `src/data/vision-prompts.js` — template prompt (se serve custom per vision)
- `docs/features/vision-e2e.md`

Totale nuovo: ~250 righe. Regola 0 rispettata (extension, non rewrite).

---

## 📋 Task dettagliati

Vedi `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → "Feature 1: Vision E2E live" → Task 1.1-1.7.

Summary:
- Task 1.1: Pre-audit (baseline 12081, SHA, build OK)
- Task 1.2: TDD fail-first (7 test unit)
- Task 1.3: Implementation VisionButton component
- Task 1.4: Integration LavagnaShell
- Task 1.5: E2E Playwright (3 test)
- Task 1.6: CoV 3x + audit indipendente + docs
- Task 1.7: Push + PR draft

---

## 🔬 Exit criteria

- [ ] 7/7 unit tests PASS (CoV 3/3)
- [ ] 3/3 Playwright E2E PASS
- [ ] Baseline 12081 → 12088 (+7), zero regressioni
- [ ] Build success (`npm run build`)
- [ ] Live test manuale: apri elabtutor.school, login classe test, #lavagna, monta v1-cap6-esp1 con LED invertito, click VisionButton → UNLIM risponde "polarità invertita" + highlight LED
- [ ] Audit indipendente APPROVE (coderabbit sub-agent)
- [ ] docs/features/vision-e2e.md completa
- [ ] CHANGELOG entry
- [ ] Principio Zero v3 verified via Playwright assertion `body not match /Docente,\s*leggi/i`
- [ ] Accessibility WCAG AA: touch 44px, focus-visible, aria-label
- [ ] PR draft aperta su GitHub

---

## 🚨 Rischi + mitigazioni

| Rischio | Mitigation |
|---------|------------|
| `window.__ELAB_API.captureScreenshot` ritorna null/undefined | Button disabled se API missing + error log |
| Screenshot > 5MB (MAX_IMAGE_SIZE guards) | Compress via canvas toDataURL 0.8 quality pre-invio |
| Gemini Vision 429 rate limit | Fallback a flash-lite, poi Brain V13 (già in unlim-chat) |
| Vision response non contiene azioni `[AZIONE:...]` | Parser permissivo, mostra solo testo se no actions |
| Test flaky Playwright (screenshot timing) | `waitForTimeout` generoso + retry 2x |
| CORS apikey non propagato (se unlim-chat non deployato post-PR3 merge) | Verify prereq P0-B completato by Andrea |

---

## 📊 Metriche successo

- Latency vision request → response: target < 8s (Gemini Pro thinking medium)
- Accuracy diagnosi: qualitativa — 3 test manuali con circuito (LED ok, LED invertito, no resistore)
- Token cost: ~€0.01 per request (Gemini 2.5 Pro pricing)
- Bundle size delta: < 5KB (component minimal)
- Lighthouse score LavagnaShell: no regressioni vs baseline

---

## 🔗 Riferimenti

- Plan master: `docs/superpowers/plans/2026-04-19-recovery-phase2.md`
- Principio Zero v3: `supabase/functions/_shared/system-prompt.ts`
- CLAUDE.md: file critici + palette + regole
- Yesterday roadmap Fase 2 handoff: in Andrea chat 18/04 end-of-session
- Post-mortem errori 19/04 mattina: `docs/audits/2026-04-19-postmortem-caveman-session.md`
