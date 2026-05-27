# SESSIONE 2 — POLISH & PANNELLI MANIPOLABILI
**Da usare con**: Ralph Loop (`--max-iterations 30`)
**Score partenza**: 6.8/10 | **Target**: 8.5/10

---

## COMANDO RALPH LOOP

```
/ralph-loop Esegui TUTTO il prompt in docs/prompts/SESSIONE-2-NANOBOT-POLISH.md --max-iterations 30 --completion-promise "SESSIONE 2 COMPLETATA SCORE 8.5 VERIFICATO"
```

---

## STATO DI PARTENZA (dalla sessione 02/04/2026)

### Cosa funziona:
- 1075/1075 test PASS | Build ~3995KB | 33 precache
- 5 Edge Functions LIVE (Supabase) con CORS ristretto + API key header
- RAG: 246 chunk + 246 embeddings su pgvector (ricerca semantica LIVE)
- Lesson Prep Service integrato (6 comandi naturali)
- Scratch/Compilatore: ZERO BUG (audit 11 agenti)
- Fumetto: production ready
- 32 bug fix applicati, 0 regressioni

### Cosa NON funziona (gap reali):
1. **Pannelli overlay**: LessonPathPanel copre il simulatore
2. **Principio Zero**: non enforced nel codice (solo architetturale)
3. **DrawingOverlay**: manca undo passo-passo
4. **StateManager**: nessun reset da STUCK
5. **Focus trap**: FloatingWindow non trappa il focus
6. **SVG**: Breadboard/Nano non migliorati (audit non completato)
7. **No test E2E**: Playwright non configurato
8. **Rate limiting**: in-memory, non persistente
9. **Index pgvector**: 3072 dim > 2000 limit (seq scan OK per 246 righe)
10. **Pannelli non manipolabili**: l'utente vuole TUTTI allargabili/nascondibili/ritrovabili

### Documenti di riferimento:
- `docs/SESSION-COMPLETE-02-APR-2026.md` — report completo
- `docs/HANDOFF-02-APR-2026.md` — handoff
- `docs/UNLIM-LESSON-PREP-ARCHITECTURE.md` — architettura UNLIM
- `docs/plans/2026-04-02-nanobot-v2-architecture.md` — architettura backend

---

## ISTRUZIONI: Leggi PRIMA di qualsiasi azione

1. `CLAUDE.md` — contesto progetto
2. `docs/SESSION-COMPLETE-02-APR-2026.md` — report sessione precedente
3. `docs/HANDOFF-02-APR-2026.md` — handoff con credenziali

---

## 8 CICLI — OGNI CICLO: implementa → test → audit CoV (3 agenti)

### CICLO 1: Pannelli manipolabili — Layout senza overlay
**Obiettivo**: Nessun pannello copre il simulatore al caricamento. Tutti ridimensionabili.

- LessonPathPanel: trasformarlo in RetractablePanel a destra (push layout, non overlay)
- Oppure: renderlo collassabile di default, con toggle nell'header
- FloatingWindow UNLIM: posizione iniziale che non copre il canvas (left bottom)
- Verificare su LIM 1024x768, Desktop 1280x800, iPad 768x1024
- Screenshot su tutti e 3 i viewport

**Skill**: `/frontend-design`, `/design:design-critique`, `/lim-simulator`
**Test**: preview_screenshot su 3 viewport, preview_snapshot per verificare testo visibile

### CICLO 2: DrawingOverlay undo + StateManager reset
**Obiettivo**: La penna ha undo. Lo stato STUCK ha un'uscita.

- DrawingOverlay: aggiungere pathsHistory stack + undo/redo
- LavagnaStateManager: aggiungere transizione STUCK → CLEAN via reset
- LavagnaShell: bottone "Riprova" visibile in stato STUCK

**Skill**: `/systematic-debugging`, `/analisi-simulatore`
**Test**: preview_eval per testare undo, state transitions

### CICLO 3: SVG Breadboard + NanoR4Board polish
**Obiettivo**: SVG belli e realistici, confrontabili con foto Tres Jolie.

- BreadboardFull/Half: verificare gradienti, holes, texture PCB
- NanoR4Board: verificare pin labels, USB connector, chip gradients
- Confronto con `ELAB - TRES JOLIE/FOTO/` per parita visiva
- BB_HOLE_PITCH = 7.5px verificato, SCALE = 1.8 verificato

**Skill**: `/nano-breakout`, `/tinkercad-simulator`, `/volume-replication`
**Test**: preview_screenshot del simulatore con circuito caricato

### CICLO 4: Test E2E con Control Chrome + Preview
**Obiettivo**: 10 test E2E reali nel browser.

Usa `Control Chrome` e `Preview tools`:
1. Naviga a #lavagna → carica esperimento → circuito appare
2. Scrivi "prepara la lezione" → UNLIM risponde con piano
3. Premi Play → simulazione parte → LED si accende
4. Apri Scratch → blocchi in italiano → genera codice C++
5. Compila codice → nessun errore → HEX caricato
6. Apri pannello componenti → drag su canvas
7. Penna → disegna → clear → funziona
8. Chiudi pannello destro → riaprilo → funziona
9. Resize UNLIM window → trascina → posizione persistente
10. Naviga a #vetrina → nessuna sigla strana → link scuole funziona

**Skill**: `/elab-quality-gate`, `/quality-audit`, `/lavagna-benchmark`
**Test**: Control Chrome execute_javascript per verifiche DOM

### CICLO 5: Principio Zero enforcement
**Obiettivo**: Solo il docente puo usare lesson prep e azioni avanzate.

- Aggiungere check ruolo in useGalileoChat per lesson prep
- Aggiungere check ruolo per azioni UNLIM (compile, addcomponent, etc.)
- Studente puo solo chattare e chiedere aiuto, non preparare lezioni
- Il simulatore #tutor (studente) NON ha lesson prep

**Skill**: `/engineering:code-review`, `/engineering:testing-strategy`
**Test**: preview_eval simulando utente studente vs docente

### CICLO 6: Focus trap + A11y rimanenti
**Obiettivo**: FloatingWindow trappa il focus. Tutti gli elementi interattivi WCAG compliant.

- FloatingWindow: focus trap quando aperta (Tab non esce)
- ExperimentPicker: focus trap nel dialog modale
- Verificare TUTTI i touch targets ≥ 44px
- Verificare TUTTI i font ≥ 13px
- aria-live su VideoFloat risultati filtrati

**Skill**: `/design:accessibility-review`, `/quality-audit`
**Test**: preview_snapshot per verificare ARIA attributes

### CICLO 7: Performance + bundle optimization
**Obiettivo**: Bundle < 3800KB. Cold start < 2s.

- Analizzare bundle con `npx vite-bundle-visualizer`
- Code split lazy imports per componenti pesanti
- Verificare tree shaking per librerie (recharts, react-pdf)
- Rimuovere dead code trovato dagli audit

**Skill**: `/simplify`, `/engineering:tech-debt`
**Test**: `npm run build` verifica dimensione

### CICLO 8: Audit finale severo + deploy
**Obiettivo**: Score 8.5+ verificato con 5 agenti CoV.

Lancia 5 agenti in parallelo:
1. **UX agent** — usability completa su 3 viewport
2. **Security agent** — OWASP top 10 check
3. **A11y agent** — WCAG 2.1 AA completo
4. **Performance agent** — Lighthouse score
5. **Parita agent** — confronto con Tres Jolie

Score = MINIMO dei 5 agenti. Se < 8.5, fixa e rilancia.

Poi: `npm run build && npx vercel --prod --yes`

---

## PREPARAZIONE COLLABORATRICE (in ogni ciclo)

Ogni fix e ogni decisione deve essere fatta pensando che una collaboratrice lavorera su questo codice.
Questo significa:
- **Nomi chiari**: variabili, funzioni, CSS classes — in inglese o italiano coerente
- **Zero magic numbers**: usa costanti con nomi parlanti
- **CSS modules**: mai inline styles (rimuovere quelli rimasti)
- **Commenti dove serve**: non ovunque, solo dove la logica non e ovvia
- **Design System documentato**: palette, font, spacing, border-radius coerenti

### Design System ELAB — Da rispettare

```
COLORI:
  Navy:    #1E4D8C (primary)
  Lime:    #4A7A25 (success/vol1)
  Orange:  #E8941C (warning/vol2)
  Red:     #E54B3D (error/vol3)
  Text:    #333333 (dark gray)
  Muted:   #666666 (mid gray)
  Light:   #F5F5F5 (background)

FONT:
  Heading: 'Oswald', sans-serif (bold, uppercase per titoli)
  Body:    'Open Sans', sans-serif (regular/semibold)
  Code:    'Fira Code', monospace

SPACING:
  4px, 8px, 12px, 16px, 24px, 32px, 48px

BORDER-RADIUS:
  Buttons: 8-10px
  Cards:   12-14px
  Modals:  16px
  Pills:   20px+

TOUCH TARGETS:
  Minimo: 44x44px (WCAG 2.1 AA)

FONT SIZE:
  Min body: 14px
  Min absolute: 13px (solo su LIM)
  Input: 15-16px
```

## REGOLE NON NEGOZIABILI

1. ZERO REGRESSIONI: 1075+ test PASS
2. SCORE SENZA SCREENSHOT = 0
3. MAI SCORE > 7 SENZA 10+ PROVE
4. DOPO OGNI CICLO: test + audit CoV + documenta
5. ENGINE INTOCCABILE: CircuitSolver, AVRBridge, SimulationManager, avrWorker
6. DOCUMENTA TUTTO
7. MASSIMA ONESTA: self-score > evidenze + 1.0 → RIFIUTATO

## CREDENZIALI

```
Supabase: euqpdueopmlllqjmqnyb
Supabase URL: https://euqpdueopmlllqjmqnyb.supabase.co
Supabase Token: sbp_REVOKED_20260423_REDACTED
Gemini API Key: AIzaSyB3IjfrHeG9u_yscwHamo7lT1zoWJ0ii1g
VPS: 72.60.129.50 (Ollama :11434, Voxtral :8880)
Admin: #admin → password: [REDACTED-MOVED-TO-ENV]
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ
```

## SKILL DA USARE

```
/elab-quality-gate /lavagna-benchmark /quality-audit
/systematic-debugging /simplify /frontend-design
/design:design-critique /design:accessibility-review
/nano-breakout /tinkercad-simulator /volume-replication
/analisi-simulatore /lim-simulator /impersonatore-utente
/engineering:code-review /engineering:testing-strategy /engineering:tech-debt
Preview tools (screenshot, click, snapshot, inspect, resize, console, network)
Control Chrome (execute_javascript, get_page_content, navigate)
```
