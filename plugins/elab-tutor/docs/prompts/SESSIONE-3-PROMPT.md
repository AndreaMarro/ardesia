# SESSIONE 3/5 — SECURITY HARDENING + DASHBOARD BACKEND + GAMIFICATION
Deadline PNRR: 30/06/2026. Score attuale: 6.6/10 (verificato 5 agenti S2). Target sessione: 7.5/10.

## STATO EREDITATO DALLA SESSIONE 2

### Score REALI per area (da audit post-S2):
| Area | Score | Note |
|------|-------|------|
| Simulator Core | 7 | Intoccato. Solver 1700 LOC, no sparse MNA |
| SVG Components | 7 | Intoccato. Professional gradients/shadows |
| Scratch/Blockly | 7 | Intoccato. ELAB theme solido |
| Galileo (AI Tutor) | 7 | UNLIM rinominato Galileo ovunque (61 prompts + UI). INTENT + voice OK |
| Dashboard | 6 | 10 tab ridotti a 4. CSS module layout. h3 diventati h2. Nudge rinominato Messaggi. MA: 234 inline styles rimasti, C constant ancora usata |
| Visual Design | 6.5 | Font scale differenziata (14-18px). Mood SVG. VOL_ICONS SVG. VetrinaSimulatore CSS module. MA: VetrinaSimulatore S object ancora 400 righe inline |
| Build/Bundle | 6 | 33 precache circa 5020KB. 1001 test. Build circa 80s. Stabile |
| A11y | 6 | div onClick fix (Navbar, NotebooksTab). h3 diventati h2 TeacherDashboard. Overlay dismiss button. MA: ComponentDrawer non auditato, molti div onClick rimasti |
| Security | 5.5 | NON migliorato in S2. CSP unsafe-inline, innerHTML ChatOverlay non sicuro, PII localStorage |
| **Composito** | **6.6** | Media 9 aree. Security (5.5) e Dashboard backend (0) sono i blocchi |

### Lavoro completato in S2:
- **P0 FIX**: UNLIM rinominato Galileo in 61 unlimPrompt + 20+ file UI
- **P1 FIX**: UNLIMResponsePanel.jsx rinominato GalileoResponsePanel.jsx
- **P1 FIX**: Nudge rinominato Messaggi completo dentro NudgeTab
- **P1 FIX**: VOL_ICONS null diventati SVG (4 icone)
- **Ciclo 1**: Dashboard 10 tab ridotti a 4 (Classe/Studenti/Report/Impostazioni)
- **Ciclo 2**: CSS Module layout per TeacherDashboard
- **Ciclo 3**: Font scale fix: xs=14/sm=15/base=16/md=17/lg=18
- **Ciclo 4**: VetrinaSimulatore.module.css creato + font-family CSS var
- **Ciclo 6**: StudentDashboard mood ASCII diventati SVG (8 icone)
- **Ciclo 7**: A11y — div onClick fix, h3 diventati h2 (37 istanze), overlay dismiss button

### Bug P0/P1 rimasti aperti:
1. **P1**: CSP unsafe-inline in script-src (vercel.json). Serve nonce-based CSP.
2. **P1**: innerHTML non sicuro in ChatOverlay.jsx — SafeMarkdown.jsx esiste ma non usato
3. **P1**: Plaintext PII in localStorage coesiste con copia encrypted
4. **P1**: Dashboard senza Supabase configurato = dati solo locali
5. **P2**: 234 inline styles rimasti in TeacherDashboard
6. **P2**: 69 inline styles in StudentDashboard
7. **P2**: VetrinaSimulatore S object 400 righe ancora inline
8. **P2**: ComponentDrawer a11y non auditato
9. **P2**: 40+ hardcoded fontSize 16px sparsi in 26 file
10. **P2**: Gamification ancora morta (zero suoni, zero confetti, zero reward)

## PRIMA DI TUTTO
Leggi completamente:
1. CLAUDE.md
2. docs/prompts/PIANO-5-SESSIONI-V2.md
3. npm run build && npx vitest run — DEVE passare
4. /elab-quality-gate — gate di ingresso
5. Verifica che UNLIM non appaia piu nell'UI

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

### Ciclo 1: Security — CSP nonce-based
- Rimuovere unsafe-inline e unsafe-eval da vercel.json e _headers
- Implementare nonce-based CSP (o hash-based)
- Se CodeMirror richiede unsafe-eval, documentare e isolare

### Ciclo 2: Security — innerHTML fix
- ChatOverlay.jsx: sostituire innerHTML non sicuro con SafeMarkdown.jsx
- Audit altri file per innerHTML non sicuro
- SafeMarkdown gia esiste — usarla ovunque serve rendering markdown

### Ciclo 3: Security — PII localStorage cleanup
- Identificare chiavi localStorage con PII in plaintext
- Se esiste la copia encrypted, rimuovere quella plaintext
- Se non esiste encryption path, implementare con crypto.subtle

### Ciclo 4: Supabase Configuration
- Configurare le environment variables su Vercel
- Verificare login/register via Supabase Auth
- Verificare dashboard carichi dati dal cloud
- Schema SQL gia pronto in supabase/schema.sql

### MID-SESSION AUDIT (dopo ciclo 4)
3 agenti in parallelo:
- Agent 1: Verifica CSP headers in vercel.json — zero unsafe-inline/eval
- Agent 2: Verifica zero innerHTML non sanitizzato in src/
- Agent 3: Verifica Supabase connection + dashboard data loading

### Ciclo 5: Gamification — Suoni + Confetti
- Suoni brevi (beep successo, beep errore, fanfara completamento)
- Confetti animation su completamento esperimento
- Punti: +10 esperimento completato, +5 quiz corretto
- Mostrare punti nell'header studente

### Ciclo 6: Gamification — Badge + Streak
- Badge per milestone (5/10/25/50 esperimenti, 3/7 giorni streak)
- Streak tracker (giorni consecutivi)
- Visualizzazione badge nella dashboard studente

### Ciclo 7: Dashboard — Inline styles cleanup (top 50)
- Migrare i 50 inline styles piu visibili in TeacherDashboard.module.css
- Sostituire C.navy/C.lime con var(--color-primary)/var(--color-accent)
- Focus su header, stat cards, student detail

### Ciclo 8: AUDIT FINALE + HANDOFF
1. npm run build && npx vitest run
2. /elab-quality-gate
3. 5 agenti audit (Spec, UX, Student, Security, Performance)
4. Scrivi SESSIONE-4-PROMPT.md

## HANDOFF
1. Score REALI per area dai 5 agenti
2. Bug P0/P1 rimasti aperti
3. Scrivi in docs/prompts/SESSIONE-4-PROMPT.md
