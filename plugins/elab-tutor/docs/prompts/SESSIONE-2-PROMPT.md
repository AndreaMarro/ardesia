# SESSIONE 2/5 — DASHBOARD REVOLUTION + DESIGN SYSTEM
Deadline PNRR: 30/06/2026. Score attuale: 5.9/10 (verificato 5 agenti). Target sessione: 7.0/10.

## STATO EREDITATO DALLA SESSIONE 1

### Score REALI per area (da 5 agenti indipendenti post-S1):
| Area | Score | Note |
|------|-------|------|
| Simulator Core | 7 | Intoccato (regola). Solver 1700 LOC, no sparse MNA |
| SVG Components | 7 | Intoccato. Professional gradients/shadows |
| Scratch/Blockly | 7 | Rimossi emoji dai blocchi, ELAB theme solido |
| UNLIM (AI Tutor) | 6 | Voice P0 fix, JWT fix, INTENT color fix. Global API coupling |
| Dashboard | 4 | Nudge a Messaggi, Supabase a cloud. MA 433 inline styles, empty senza backend |
| Visual Design | 5 | 111+ emoji rimossi. MA Dashboard ignora CSS modules |
| Build/Bundle | 6 | 33 precache circa 5003KB. 4.5MB bundle, obfuscation parziale |
| A11y | 5 | Font report >=14px. Parziale copertura aria, no skip-to-content |
| **Composito** | **5.9** | Media 8 aree. Dashboard (4) e Visual (5) sono il collo di bottiglia |
| Security | 5.5 | CSP unsafe-inline, innerHTML non sicuro in ChatOverlay, localStorage PII |

### Lavoro completato in S1:
- **Ciclo 1**: Voice P0 — compile ora passa codice, zoomFit dispatcha F key, undo pattern fix, INTENT color fix
- **Ciclo 2**: JWT parsing [0]→[1], deprecated session()→cached getSession(), timer leak fix stopSync()
- **Ciclo 3**: 35+ emoji rimossi da UnlimWrapper + ElabTutorV4, 5 nuove icone SVG in ElabIcons
- **Ciclo 4**: 101+ emoji rimossi da 20+ file (VolumeChooser, VetrinaSimulatore, NewElabSimulator, LandingPNRR, etc.)
- **Ciclo 5-6**: Auth bridge GIA IMPLEMENTATA in AuthContext.jsx (login/register/session/logout)
- **Ciclo 7**: Nudge→Messaggi, Supabase→cloud nel testo, login subtitle, report font 10-12px→14px
- **Ciclo 8**: 10 emoji residui fixati (📡→AntennaIcon, ⏳→LoadingIcon, 🎙️/🎬 rimossi)

### Bug P0/P1 rimasti aperti:
1. **P0**: "UNLIM" appare 50+ volte nell'UI (alt text, placeholder, bottoni, messaggi errore). Incomprensibile per docenti. Rinominare in "Galileo" o "il tutor" in TUTTI i file UI.
2. **P1**: "Nudge" ancora in 8+ punti DENTRO NudgeTab (titolo "Invia un Nudge", bottone "Invia Nudge", sezione "Nudge Inviati", "Idee per Nudge", aria-label). Tab esterno dice "Messaggi" ma interno no.
3. **P1**: VOL_ICONS tutti null in VolumeChooser.jsx — nessuna icona visiva per i 4 volumi sulla LIM
4. **P1**: CSP unsafe-inline in script-src (vercel.json) + unsafe-eval in _headers (Netlify). Serve nonce-based CSP.
5. **P1**: innerHTML non sicuro in ChatOverlay.jsx — SafeMarkdown.jsx esiste ma non usato qui
6. **P2**: Dashboard senza Supabase = shell vuota (max 4/10)
7. **P2**: 433 inline styles in TeacherDashboard.jsx — ignora CSS modules
8. **P2**: 104 inline styles in VetrinaSimulatore.jsx
9. **P2**: Font scale design-system.css non differenziata (xs/sm/base/md tutti 16px)
10. **P2**: Plaintext PII in localStorage coesiste con copia encrypted (sconfigge lo scopo)

### Score da 5 agenti indipendenti:
- **Spec 8 aree**: 5.9/10 (Dashboard 4, Visual 5, A11y 5 trascinano)
- **UX Prof.ssa Rossi**: 6.3/10 ("UNLIM" incomprensibile -3pt, "Nudge" non tradotto -2pt)
- **Security**: 5.5/10 (CSP unsafe-inline, innerHTML, localStorage PII)
- **Student Marco**: 5.2/10 (gamification morta, 9 esperimenti potenziometro di fila, zero suoni/confetti)
- **Performance**: 6.0/10 (build 17min con obfuscator RC4 100%, main chunk 1.58MB OK, precache 4.9MB OK)

### Nuovi bug trovati in S1:
- Nessun nuovo bug P0 introdotto. 1001/1001 test passano.
- Build stabile: 33 precache entries, ~5003KB

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md
2. docs/prompts/PIANO-5-SESSIONI-V2.md — piano completo, regole invarianti, TOOL STACK obbligatorio
3. Fai `npm run build && npx vitest run` — DEVE passare prima di qualsiasi modifica
4. Esegui /elab-quality-gate — gate di ingresso
5. Lancia agente: "Conta emoji rimaste in src/" — deve essere 0 (esclusi glifi tipografici ✓✗★☆)

## REGOLE ESECUZIONE
- PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
- BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
- TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
- PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
- Engine/ (CircuitSolver, AVRBridge, SimulationManager) INTOCCABILE
- ZERO REGRESSIONI: 1001+ test DEVONO passare. PRECACHE deve restare 33 entries ~5000KB.
- ZERO EMOJI NEL CODICE: usa ElabIcons.jsx SVG (30 icone disponibili)
- Dopo OGNI ciclo: /verification-before-completion + /simplify sul codice scritto
- Se test fallisce: /systematic-debugging IMMEDIATO

## PRINCIPIO ZERO
L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE senza conoscenze pregresse.
ELAB Tutor, i kit fisici e i volumi sono LO STESSO PRODOTTO.
Linguaggio: 10-14 anni, italiano, esempi pratici, analogie vita quotidiana.

## 8 CICLI STRUTTURATI

### Ciclo 1: Dashboard — Da 10 tab a 4
TeacherDashboard.jsx ha 10 tab. Consolidare in 4:
- "Classe" — merge di Progressi + Il Giardino (griglia esperimenti + visualizzazione piantine)
- "Studenti" — merge di Dettaglio Studente + Messaggi (scheda individuale + pulsante "Invia messaggio")
- "Report" — merge di Meteo Classe + Report + Attivita (meteo, statistiche, timeline)
- "Impostazioni" — merge di Le mie classi + Documentazione + Progresso PNRR + Audit GDPR
Il tab "Messaggi" (ex Nudge) diventa un bottone/modale accessibile da qualsiasi tab quando si seleziona uno studente.
NON eliminare funzionalita — solo riorganizzare.

### Ciclo 2: Dashboard — CSS Module migration
- Eliminare la costante `C` con 14 colori hardcoded dal TeacherDashboard.jsx
- Eliminare la stessa costante `C` dal StudentDashboard.jsx
- Sostituire TUTTI i colori hardcoded con CSS variables da design-system.css
- Migrare i 433 inline style blocks piu importanti (header, tab bar, card layout) in TeacherDashboard.module.css
- Focus sui 50 piu visibili/ripetuti

### Ciclo 3: Design System — Font scale fix
- `--font-size-xs`, `--font-size-sm`, `--font-size-base`, `--font-size-md` sono TUTTI 16px. Fix:
  - `--font-size-xs: 14px` (minimo assoluto)
  - `--font-size-sm: 15px`
  - `--font-size-base: 16px`
  - `--font-size-md: 17px`
  - `--font-size-lg: 18px`
- Eliminare i legacy aliases duplicati (linee 295-332): `--elab-navy`, `--bg-app`, `--text-dark`, `--border-light`
- Eliminare i simulator-scoped token duplicati (linee 339-367)

### Ciclo 4: VetrinaSimulatore — CSS Module
- Creare `VetrinaSimulatore.module.css`
- Migrare i 104 inline style blocks in CSS classes
- Sostituire i 50+ colori hardcoded con CSS variables
- Questa e la landing page — la PRIMA cosa che un compratore vede. Deve essere impeccabile.

### MID-SESSION AUDIT (dopo ciclo 4)
3 agenti in parallelo:
- Agent 1: "Conta inline styles rimasti nei dashboard"
- Agent 2: "Verifica font scale coerente (--font-size-xs < sm < base < md)"
- Agent 3: "Verifica che tutti i 4 tab dashboard funzionino (no crash, no undefined)"

### Ciclo 5: TeacherDashboard — Icone SVG
- I 30+ inline SVG icon components (IconSun, IconStorm, IconRain, etc.) vanno spostati in ElabIcons.jsx
- Usa lo stesso stile Feather (24x24 viewBox, stroke-based, 2px stroke)
- Aggiorna i riferimenti nel TeacherDashboard

### Ciclo 6: StudentDashboard — Mood icons + CSS
- Sostituire gli ASCII emoticons ('E', 'C', '~', 'X', ':)', '>:(', '?', '*') con icone SVG
- Creare StudentDashboard.module.css
- Migrare i top 30 inline styles

### Ciclo 7: A11y sweep
- Tutti i `<div onClick>` senza role/tabIndex/onKeyDown → aggiungere `role="button" tabIndex={0}`
- Focus su: Navbar.jsx, NotebooksTab.jsx, ComponentDrawer.jsx
- UnlimReport.jsx: `.photo-remove` button → aria-label + touch target 44px
- Heading hierarchy: TeacherDashboard h3 sezioni → h2

### Ciclo 8: AUDIT FINALE + HANDOFF
1. npm run build && npx vitest run — DEVE passare (1001+ test, 33 precache)
2. /elab-quality-gate — gate di uscita
3. /quality-audit — audit end-to-end
4. 5 agenti audit (Spec 8 aree, UX Prof.ssa Rossi, Student Marco, Security, Performance) — SEVERI
5. Media 5 agenti = SCORE REALE. Target: 7.5/10.

## HANDOFF — GENERA IL PROMPT SESSIONE 3
1. Score REALI per area dai 5 agenti
2. Bug P0/P1 rimasti aperti
3. Se Dashboard < 7/10 → Sessione 3 ciclo 1 riprende
4. Scrivi in `docs/prompts/SESSIONE-3-PROMPT.md` — autocontenuto, 8 cicli adattati
