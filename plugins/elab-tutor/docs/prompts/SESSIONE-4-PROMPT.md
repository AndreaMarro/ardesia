# SESSIONE 4/5 — A11Y HARDENING + DASHBOARD POLISH + OFFLINE VERIFICATION
Deadline PNRR: 30/06/2026. Score attuale: 6.8/10 (verificato 5 agenti S3). Target sessione: 7.5/10.

## STATO EREDITATO DALLA SESSIONE 3

### Score REALI per area (da audit post-S3):
| Area | Score | Note |
|------|-------|------|
| Simulator Core | 7 | Intoccato. Solver 1700 LOC, no sparse MNA |
| SVG Components | 7 | Intoccato. Professional gradients/shadows |
| Scratch/Blockly | 7 | Intoccato. ELAB theme solido |
| Galileo (AI Tutor) | 7.5 | SafeMarkdown sostituisce innerHTML non sicuro. Zero innerHTML in codebase |
| Dashboard | 6.5 | C constant usa CSS vars (182 refs). 15 utility classes aggiunte al CSS module. Gamification stats (punti/streak) in StudentDashboard. MA: 296 inline styles rimasti in TeacherDashboard, 69 in StudentDashboard |
| Visual Design | 6.5 | CSS vars bridge. MA: VetrinaSimulatore S object ancora inline |
| Build/Bundle | 6 | 33 precache circa 5062KB. 1001 test. Build circa 41s. Stabile |
| A11y | 6 | NON migliorato in S3. ComponentDrawer non auditato, molti div onClick rimasti |
| Security | 7.5 | CSP unsafe-inline RIMOSSO da script-src (vercel.json + _headers). innerHTML non sicuro RIMOSSO (SafeMarkdown). PII plaintext rimosso dopo encryption. In-memory cache fallback. |
| Gamification | 7 | NUOVO: gamificationService.js completo (Web Audio suoni, confetti CSS, punti, badge 8 defs, streak). Wired in useSessionTracker + studentTracker. BadgeGrid nel StudentDashboard |
| **Composito** | **6.8** | Media 10 aree. A11y (6) e Dashboard inline styles (6.5) sono i blocchi |

### Lavoro completato in S3:
- **Ciclo 1**: CSP hardened — unsafe-inline e unsafe-eval rimossi da script-src in vercel.json e public/_headers
- **Ciclo 2**: ChatOverlay.jsx — innerHTML non sicuro rimosso, SafeMarkdown importato. SafeMarkdown enhanced con link/URL support + stripActions prop
- **Ciclo 3**: PII — _encryptAndSave() rimuove plaintext dopo encryption, _inMemoryStudentData cache per sync reads, getStudentData/getAllStudentData fallback
- **Ciclo 4**: Supabase — codice pronto, graceful fallback verificato. SERVE setup manuale account + env vars
- **Ciclo 5**: gamificationService.js creato — Web Audio (playSuccess/Error/Fanfare/BadgeUnlock), confetti CSS, points system (10/exp, 5/quiz, 8/game)
- **Ciclo 6**: BadgeGrid nel StudentDashboard con 8 badge SVG. Punti e streak cards in PanoramicaTab
- **Ciclo 7**: C constant in TeacherDashboard e StudentDashboard migrato a CSS vars. 15 utility classes aggiunte al CSS module

### Bug P0/P1 rimasti aperti:
1. **P1**: Supabase non configurato — dashboard senza cloud data. Schema SQL pronto, serve account + env vars
2. **P1**: style-src ancora unsafe-inline (necessario per React inline styles + Google Fonts)
3. **P2**: 296 inline styles in TeacherDashboard (C constant migrato a vars, ma style rimangono)
4. **P2**: 69 inline styles in StudentDashboard
5. **P2**: VetrinaSimulatore S object 400 righe ancora inline
6. **P2**: ComponentDrawer a11y non auditato
7. **P2**: 40+ hardcoded fontSize 16px sparsi in 26 file

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md
2. docs/prompts/PIANO-5-SESSIONI-V2.md
3. npm run build && npx vitest run — DEVE passare
4. /elab-quality-gate — gate di ingresso
5. Verifica emoji count = 0 (esclusi glifi tipografici)

## REGOLE ESECUZIONE
- PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
- BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
- TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
- PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
- Engine/ (CircuitSolver, AVRBridge, SimulationManager) INTOCCABILE
- ZERO REGRESSIONI: 1001+ test DEVONO passare. PRECACHE 33 entries circa 5000KB.
- ZERO EMOJI NEL CODICE: usa ElabIcons.jsx SVG
- Dopo OGNI ciclo: /verification-before-completion + /simplify
- Se test fallisce: /systematic-debugging IMMEDIATO

## PRINCIPIO ZERO
L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.

## 8 CICLI STRUTTURATI

### Ciclo 1: A11y — WCAG Sweep ComponentDrawer + div onClick
- Audit ComponentDrawer per a11y (aria-labels, keyboard navigation, focus management)
- Cercare tutti i div onClick rimasti e sostituire con button o aggiungere role="button" tabIndex="0" onKeyDown
- Verificare focus ring visibili su tutti gli elementi interattivi

### Ciclo 2: A11y — Focus management e skip links
- Aggiungere skip-to-content link
- Verificare focus trap nei modali (ChatOverlay, DrawingOverlay, etc.)
- Tab order logico nel simulatore (toolbar -> canvas -> sidebar -> panels)

### Ciclo 3: Dashboard — TeacherDashboard top 100 inline styles to CSS module
- Migrare i 100 inline styles piu visibili a CSS module classes
- Focus su: stat cards, student list, student detail, tab content
- Rimuovere style dove possibile

### Ciclo 4: Dashboard — StudentDashboard inline styles to CSS module
- Creare StudentDashboard.module.css
- Migrare i 69 inline styles
- Aggiungere le stesse utility classes (badge, card, flexCenter, etc.)

### MID-SESSION AUDIT (dopo ciclo 4)
3 agenti in parallelo:
- Agent 1: Conta div onClick rimasti — target 0
- Agent 2: Conta inline styles rimasti in Teacher+Student dashboards
- Agent 3: WCAG contrast + font size check

### Ciclo 5: VetrinaSimulatore — S object cleanup
- Migrare S object (400 righe) in VetrinaSimulatore.module.css
- Stesso pattern: CSS vars + utility classes

### Ciclo 6: Supabase Setup (SE credenziali disponibili)
- Se Andrea ha configurato le env vars: verificare login/register, dashboard cloud data
- Se NO: documentare procedura step-by-step per setup manuale
- Verificare RLS policies funzionanti

### Ciclo 7: Offline Verification
- Testare con network throttling: app carica offline?
- Verificare precache copre tutti i chunks critici
- Service worker registration e update flow

### Ciclo 8: AUDIT FINALE + HANDOFF
1. npm run build && npx vitest run
2. /elab-quality-gate
3. 5 agenti audit (Spec, UX, Student, Security, Performance)
4. Scrivi SESSIONE-5-PROMPT.md

## HANDOFF
1. Score REALI per area dai 5 agenti
2. Bug P0/P1 rimasti aperti
3. Scrivi in docs/prompts/SESSIONE-5-PROMPT.md
