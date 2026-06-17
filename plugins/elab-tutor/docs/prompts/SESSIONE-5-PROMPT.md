# SESSIONE 5/5 — FINAL POLISH + DEAD CODE REMOVAL + DEPLOY READINESS
Deadline PNRR: 30/06/2026. Score attuale: 7.2/10 (verificato post-S4). Target sessione: 8.0/10.

## STATO EREDITATO DALLA SESSIONE 4

### Score REALI per area (da audit post-S4):
| Area | Score | Note |
|------|-------|------|
| Simulator Core | 7 | Intoccato. Solver 1700 LOC, no sparse MNA |
| SVG Components | 7 | Intoccato. Professional gradients/shadows |
| Scratch/Blockly | 7 | Intoccato. ELAB theme solido |
| Galileo (AI Tutor) | 7.5 | SafeMarkdown, zero innerHTML |
| Dashboard | 7 | TeacherDash 425→264 inline styles (-38%). StudentDash 85→71 (-16%). CSS module classes aggiunte |
| Visual Design | 7 | VetrinaSimulatore S object MIGRATO: 94 style={S.xxx} → 0 (100% CSS module). S object e dead code da rimuovere |
| Build/Bundle | 6 | 33 precache ~5040KB. 1001 test. Build ~50s. Stabile |
| A11y | 7 | ComponentDrawer: div→button/role+keyboard. useFocusTrap hook. ConfirmModal+ConsentBanner focus trapped. ChatOverlay minimizedHeader keyboard. Skip-to-content verificato. aria-live su step counter |
| Security | 7.5 | CSP hardened (no unsafe-eval/inline in script-src). SafeMarkdown. PII encrypted. Supabase env vars configurati |
| Gamification | 7 | Completo: punti, badge, streak, suoni, confetti |
| **Composito** | **7.2** | Media 10 aree. Build/bundle (6) e dashboard residui sono i blocchi |

### Lavoro completato in S4:
- **Ciclo 1**: ComponentDrawer a11y — 4 div onClick → button/role+keyboard, aria-labels, aria-live, role="region"
- **Ciclo 2**: useFocusTrap hook creato. ConfirmModal: focus trap + Escape. ConsentBanner: focus trap + aria-modal
- **Ciclo 3**: TeacherDashboard inline styles 425→264 (-161). SVG icons, KPI cards, audit table, security cards migrati
- **Ciclo 4**: StudentDashboard.module.css creato. 85→71 inline styles. Badge grid, nudge panel, login prompt migrati
- **Ciclo 5**: VetrinaSimulatore S object 94→0 style={S.xxx} (100% migrato). CSS module 194→470 righe
- **Ciclo 6**: Supabase configurato (env vars presenti). Schema SQL pronto. Serve applicare via SQL Editor (step manuale Andrea)
- **Ciclo 7**: Offline verificato: 33 precache, 12 HEX, 4 woff2, StaleWhileRevalidate per lazy chunks, OfflineBanner con aria-live

### Bug P0/P1 rimasti aperti:
1. **P1**: Supabase schema non ancora applicato — dashboard mostra dati locali. Andrea deve eseguire schema.sql via SQL Editor
2. **P1**: style-src ancora unsafe-inline (React inline styles + Google Fonts richiedono)
3. **P2**: VetrinaSimulatore `const S = {...}` dead code (400 righe) — ancora nel file, non piu usato
4. **P2**: TeacherDashboard 264 inline styles rimasti (molti in `styles` object pattern)
5. **P2**: StudentDashboard 71 inline styles rimasti
6. **P2**: ComponentDrawer STEP_ICONS usa 36 unicode emoji escapes — dovrebbero essere SVG (ElabIcons.jsx)
7. **P2**: 57 unicode emoji escapes totali in 21 file JSX (componenti registri + ComponentDrawer)

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md
2. docs/prompts/PIANO-5-SESSIONI-V2.md
3. npm run build && npx vitest run — DEVE passare
4. /elab-quality-gate — gate di ingresso
5. Verifica emoji count = 0 (unicode escapes inclusi!)

## REGOLE ESECUZIONE
- PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
- BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
- TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
- PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
- Engine/ (CircuitSolver, AVRBridge, SimulationManager) INTOCCABILE
- ZERO REGRESSIONI: 1001+ test DEVONO passare. PRECACHE 33 entries circa 5000KB.
- ZERO EMOJI NEL CODICE: inclusi unicode escapes \u{xxxx}. Usa ElabIcons.jsx SVG
- Dopo OGNI ciclo: /verification-before-completion + /simplify
- Se test fallisce: /systematic-debugging IMMEDIATO

## PRINCIPIO ZERO
L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.

## 8 CICLI STRUTTURATI

### Ciclo 1: Dead Code Removal — VetrinaSimulatore S object
- Rimuovere `const S = {...}` (righe 512-910) ora che tutto usa vcss.*
- Rimuovere eventuali duplicati nel CSS module (classi gia presenti prima di S4)
- Verificare che nessun riferimento a S. rimanga

### Ciclo 2: Emoji Purge — ComponentDrawer STEP_ICONS + registri componenti
- Sostituire STEP_ICONS con icone SVG da ElabIcons.jsx
- Cercare e sostituire tutti i 57 unicode escapes \u{xxxx} in src/ JSX con SVG
- Target: 0 emoji (unicode o escaped) in tutto il codice sorgente

### Ciclo 3: Bundle Optimization — Reduce precache size
- Analizzare i chunk piu grandi (react-pdf 1485KB, index 1584KB)
- Code splitting ulteriore dove possibile
- Target: precache < 4800KB (era 5040KB)

### Ciclo 4: TeacherDashboard — Remaining inline styles batch 2
- Migrare altri 50+ inline styles dai componenti interni (stat cards, mood, pagination)
- Focus su: chart containers, legend items, info panels
- Target: < 200 inline styles

### MID-SESSION AUDIT (dopo ciclo 4)
3 agenti in parallelo:
- Agent 1: Conta emoji rimaste (unicode + escaped) — target 0
- Agent 2: Bundle size analysis — target precache < 4800KB
- Agent 3: WCAG contrast + font size sweep

### Ciclo 5: A11y Polish — Remaining issues
- Audit rimanente: font sizes < 14px (LdrOverlay 15px borderline, check others)
- Verificare tutti i touch targets >= 44px
- Aggiungere aria-labels mancanti

### Ciclo 6: Supabase — Apply schema (SE Andrea lo ha fatto)
- Se schema applicato: testare login/register, CRUD classi, dashboard cloud data
- Se NO: creare documentazione step-by-step piu chiara per Andrea

### Ciclo 7: Deploy Preparation
- /engineering:deploy-checklist
- Verificare vercel.json headers (CSP, CORS, caching)
- robots.txt + sitemap aggiornato
- OG meta tags + structured data verificati

### Ciclo 8: AUDIT FINALE + HANDOFF
1. npm run build && npx vitest run
2. /elab-quality-gate (post)
3. 5 agenti audit (Spec, UX, Student, Security, Performance)
4. Score REALI per area
5. Report finale con confronto S1-S5

## HANDOFF
1. Score REALI per area dai 5 agenti
2. Bug P0/P1 rimasti aperti
3. Confronto score progression: S1 (5.9) → S2 (6.6) → S3 (6.8→8.2) → S4 (7.2) → S5 (target 8.0)
4. Lista azioni per Andrea (Supabase schema, deploy)
