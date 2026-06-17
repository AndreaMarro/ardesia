# PDR — Fumetto Report MVP (feature F2.4 Roadmap v1.0)

**Status**: READY TO EXECUTE
**Target agent**: Claude Opus 4.7 via Managed Agent (Max subscription)
**Durata stimata**: 4-5h autonome
**Branch**: `feature/fumetto-report-mvp`
**Dipendenze**: PR #3 merged + prereq assets TRES JOLIE
**Governance**: `docs/GOVERNANCE.md` regole 0-5 obbligatorie
**Plan master**: `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → Feature 2

---

## 🎯 Obiettivo

Implementare Fumetto Report di fine sessione:

1. Docente clicca "Fine sessione — Report Fumetto" in LavagnaShell
2. UI genera griglia 3x2 di 6 vignette (o 2x3 responsive)
3. Ogni vignetta = foto REALE dell'esperimento (da `public/brand/foto-esperimenti/volN/`, source TRES JOLIE)
4. Sotto ogni foto: caption/narration generata da UNLIM (Principio Zero v3 plurale)
5. Export PDF tramite html2pdf.js (A4 landscape, alta qualità)
6. (Opzionale) Salva in Supabase `session_reports` table per history docente

**Principio Zero v3 requirement**:
- Narration in plurale "Ragazzi, ecco cosa abbiamo fatto..."
- Linguaggio 10-14 anni, entusiastico, libro-style
- NO istruzioni meta docente
- Citazione pagine libro se possibile

---

## ⚖️ Regola 0 — riuso esistente

**Riusa**:
- `public/` folder per asset statici (Vite auto-serve)
- `src/data/experiments-vol1.js/vol2.js/vol3.js` → experiment id → title mapping
- `src/services/api.js:sendChat()` → generate narration
- `src/services/studentService.js` → session data (se esiste) OR __ELAB_API event tracker
- `src/components/lavagna/LavagnaShell.jsx` → add button "Fine sessione"
- Asset TRES JOLIE: `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/FOTO/N FOTO VOL N/` (3 cartelle)
- Asset TRES JOLIE: `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/LOGO/`

**Nuovo**:
- `src/components/lavagna/SessionReportComic.jsx` — 90 righe
- `src/components/lavagna/SessionReportComic.module.css` — 120 righe
- `src/utils/comicPdfExporter.js` — 20 righe wrapper html2pdf
- `src/data/experiment-photo-map.js` — mapping experimentId → photo
- `tests/unit/lavagna/SessionReportComic.test.jsx` — 8 test
- `public/brand/logo-elab.svg` — import + convert if PNG only
- `public/brand/foto-esperimenti/{vol1,vol2,vol3}/*.webp` — import + optimize 80 quality

**Dependency nuova**: `html2pdf.js` (~40KB gzip, MIT) — richiede Andrea approval npm install.

Totale nuovo: ~250 righe codice + N asset. Regola 0 rispettata.

---

## 📋 Task dettagliati

Vedi `docs/superpowers/plans/2026-04-19-recovery-phase2.md` → "Feature 2: Fumetto Report MVP" → Task 2.1-2.7.

Summary:
- Task 2.1: Pre-audit baseline
- Task 2.2: Import brand assets TRES JOLIE (logo + 3 folder foto)
- Task 2.3: TDD 8 test unit SessionReportComic
- Task 2.4: Consulta 3 agency-agents design personalities + doc
- Task 2.5: Implementation component + CSS
- Task 2.6: html2pdf.js install + LavagnaShell integration
- Task 2.7: CoV 3x + audit + docs + PR draft

---

## 🔬 Exit criteria

- [ ] 8/8 unit tests PASS (CoV 3/3)
- [ ] Baseline 12088 → 12096+ (dopo merge Vision E2E)
- [ ] Build success
- [ ] Assets in `public/brand/` < 10MB totale (se > serve Vercel blob storage)
- [ ] Live test manuale: completa 3 esperimenti in una sessione, click "Fine sessione", verifica 3 vignette con foto reali + narration, click Scarica PDF → file A4 landscape scaricato
- [ ] Audit design via agency-agents/design-visual-storyteller consulted
- [ ] Audit a11y via wshobson/accessibility-compliance APPROVE
- [ ] Principio Zero v3 verified: "Ragazzi" presente, "Docente leggi" assente
- [ ] docs/features/fumetto-report.md completa
- [ ] PR draft aperta

---

## 🎨 Design principles applicati

Consultati da `.claude/external-agents/agency-agents/design/`:

### design-whimsy-injector
- Joy moments senza distrazione
- Shareable (educator wants export PDF da mostrare a parents/school)
- Subtle animation CSS-only on vignette enter (stagger reveal)

### design-inclusive-visuals-specialist
- Alt text obbligatorio per ogni `<img>`
- Contrast WCAG AA (palette ELAB navy/lime/orange)
- Diverse representation: foto TRES JOLIE mostrano esperimenti reali (non stock diverse-by-design, ma autentici)
- `prefers-reduced-motion` rispettato in CSS animations

### design-visual-storyteller
- Narrative arc 6 vignette: setup → challenge → discovery → resolution → reflection → next
- Ogni vignetta è un "chapter" della sessione
- Caption sotto ogni foto = voce UNLIM narratore

---

## 🚨 Rischi + mitigazioni

| Rischio | Mitigation |
|---------|------------|
| Foto TRES JOLIE mancanti per alcuni experimentId | Fallback photo-map → generic vol cover |
| Asset > 10MB bloat repo | Convert webp 80 quality via `sips` (macOS built-in), split in Vercel blob se > |
| html2pdf.js dependency non approvata | Fallback: browser print API (window.print) — bassa qualità ma zero dep |
| Narrations UNLIM generate lentamente (6 call Gemini) | Batch 1 call con struttura JSON response, o pre-generate via cron |
| PDF scraping da WebKit issues | Test export Chrome + Safari entrambi |
| CSS grid non responsive mobile < 720px | Media query gia' prevista (2-col fallback) |

---

## 📊 Metriche successo

- Tempo export PDF: target < 5s per 6 vignette
- Size PDF output: ~500KB-1MB (foto compresse)
- Bundle size delta: +40KB (html2pdf.js lazy-loaded)
- Time-to-view report dopo click "Fine sessione": < 2s
- Accessibility score LessonReportComic: 100 Lighthouse a11y

---

## 🔗 Riferimenti

- Plan master: `docs/superpowers/plans/2026-04-19-recovery-phase2.md`
- TRES JOLIE assets: `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/`
- Design agents: `.claude/external-agents/agency-agents/design/`
- Principio Zero v3: `supabase/functions/_shared/system-prompt.ts`
