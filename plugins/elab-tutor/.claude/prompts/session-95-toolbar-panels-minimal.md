# SESSION 95 — TOOLBAR + PANELS MINIMAL (FASE 1.2 della roadmap S94-S108)
## Spacing Token Purge · Transition Unificata · Shadow Token Purge · Panel Consistency · ZERO REGRESSIONI

---

## ═══ ROADMAP 15 SESSIONI (S94-S108) — DOVE SIAMO ═══════════════════

Questa è la **sessione 2 di 15** di una roadmap consecutiva verso Overall ≥ 9.5.
Ogni sessione ha un focus specifico. Non deviare dal focus di questa sessione.

```
FASE 1: ESTETICA + MINIMALISMO (3 sessioni)
  ✅ S94 — Design System Purge (colori + font tokenizzati)
  → S95 — Toolbar + Panels Minimal (spacing + transition + shadow tokenizzati)  ← SEI QUI
     S96 — SVG Components + Canvas Polish

FASE 2: FISICA + LOGICA (3 sessioni)
     S97 — Capacitor + Transient Analysis
     S98 — Component Behavior Parity
     S99 — Error Feedback + Smart Diagnostics

FASE 3: iPAD COMPLETO (2 sessioni)
     S100 — iPad Layout Perfection
     S101 — iPad Touch + Gestures

FASE 4: SCRATCH COMPLETAMENTO (2 sessioni)
     S102 — Scratch Steps per Tutti gli Esperimenti
     S103 — Scratch Blocks + Generator Expansion

FASE 5: GALILEO ONNISCIENTE (3 sessioni)
     S104 — Galileo Context Engine
     S105 — Galileo New Powers
     S106 — Galileo Stress Test + Personality

FASE 6: RIFINITURA + ACCESSIBILITÀ (1 sessione)
     S107 — UX Polish + Accessibility

FASE 7: AUDIT FINALE (1 sessione)
     S108 — Grand Final Audit + Deploy
```

**Documenti roadmap**: `docs/roadmap/` (8 file MD: README, 00-STATO-ATTUALE, 01-PIANO-MAESTRO, FASE-1 a FASE-7)
**Dettaglio questa sessione**: `docs/roadmap/FASE-1-ESTETICA.md` → sezione "S95 — Toolbar + Panels Minimal"

---

## ═══ CONTESTO S94 (sessione precedente) ═══════════════════════════

> **S94 ha fatto**: Tokenizzato 40+ hex colors e 6 font-family in 6 file JSX. Aggiunti 7 nuovi token colore a design-system.css. Build 0 errori. CSS token resolution 20/20 verificata. Totale token da 84 → 91.
>
> **Cosa manca per completare FASE 1**: Le proprietà di LAYOUT (padding, margin, gap, border-radius, box-shadow, transition) sono ancora HARDCODED in decine di posti. Questo causa inconsistenza visiva tra pannelli (spacing diversi, transizioni diverse, raggi diversi).
>
> **Obiettivo S95**: Sostituire padding/gap/radius/shadow/transition nudi con i token già definiti in `design-system.css`. Unificare l'aspetto di toolbar, panels, tabs, e status bar. Portare Estetica da 7.0 → 8.0.

### Score attuali (fine S94)
| Area | Score | Target S95 |
|------|-------|------------|
| Estetica | 7.0/10 | **8.0** |
| Code Quality | 9.8/10 | **9.8** |
| Simulatore funzionalità | 9.8/10 | **9.8** (ZERO regressioni) |
| Scratch | 10.0/10 | **10.0** (ZERO regressioni) |
| iPad | 7.0/10 | **7.0** (non toccare layout iPad in questa sessione) |

---

## ═══ ANALISI GIÀ FATTA ═══════════════════════════════════════════

### Token spacing/radius/shadow/transition ESISTENTI in design-system.css (GIÀ PRONTI)
```css
/* Spacing: 4px grid */
--space-0: 0px;  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
--space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px;

/* Radius */
--radius-xs: 4px; --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
--radius-xl: 20px; --radius-full: 9999px;

/* Shadows */
--shadow-xs/sm/md/lg/xl + --shadow-focus + --shadow-focus-accent

/* Transitions */
--transition-fast: 150ms ease;  --transition-base: 200ms ease;
--transition-slow: 300ms ease;  --transition-spring: 300ms cubic-bezier(0.16, 1, 0.3, 1);
```

### Valori HARDCODED trovati in ElabSimulator.css (1114 righe, file principale)

**A. border-radius nudi (2):**
- Riga 432: `border-radius: 2px;` → dovrebbe essere `var(--radius-xs)` o un nuovo `--radius-2xs: 2px`
- Riga 662: `border-radius: 6px;` → dovrebbe essere `var(--radius-sm)`

**B. padding/gap/margin nudi (26+ occorrenze):**
Tutti usano valori validi dal grid 4px ma senza token:
- `padding: 6px 8px` (righe 181, 916, 931)
- `padding: 8px 10px` (riga 222)
- `padding: 10px 16px` (riga 345)
- `padding: 6px 12px` (righe 409, 467, 713, 739, 764)
- `padding: 6px 16px` (riga 683)
- `padding: 4px 10px` (riga 899)
- `padding: 4px 8px` (riga 942)
- `gap: 4px` (riga 408, 443)
- `gap: 6px` (riga 466)
- `gap: 5px` (riga 895) → NON nel grid 4px! Dovrebbe essere 4px
- `gap: 1px` (riga 868)
- `gap: 2px` (riga 943)
- `margin: 0 6px` (riga 452)
- `margin: 0 3px` (riga 948)
- `margin-top: -10px` (riga 1025)

**C. box-shadow nudi (3):**
- Riga 688: `box-shadow: 0 2px 8px rgba(124, 179, 66, 0.25)` → `var(--shadow-accent-sm)` (NUOVO)
- Riga 696: `box-shadow: 0 4px 12px rgba(124, 179, 66, 0.35)` → `var(--shadow-accent-md)` (NUOVO)
- Riga 705: `box-shadow: 0 1px 4px rgba(124, 179, 66, 0.2)` → `var(--shadow-accent-xs)` (NUOVO)

**D. transition nudi (5):**
- Riga 364: `transition: background 60ms ease-out;` → 60ms troppo veloce, usare `var(--transition-fast)` (150ms)
- Riga 480: `transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);` → `var(--transition-spring)` (300ms spring)
- Riga 522: `transition: transform 60ms ease-out, background 60ms ease-out;` → 60ms→150ms
- Riga 980: `transition: transform 60ms ease-out, filter 60ms ease-out;` → 60ms→150ms
- Riga 1007: `transition: transform 60ms ease-out, filter 60ms ease-out;` → 60ms→150ms

**E. overlays.module.css (2 nudi):**
- Riga 278: `border-radius: 16px 16px 0 0;` → `var(--radius-xl) var(--radius-xl) 0 0`
- Riga 302: `border-radius: 16px 16px 0 0;` → stesso

### Inline styles HARDCODED nei JSX (da S94 restano)
Molti JSX panels usano `style={{ padding: '...', borderRadius: '...' }}` inline.
Focus su: ControlBar.jsx, ComponentDrawer.jsx, SerialMonitor.jsx, ExperimentPicker.jsx, CodeEditorCM6.jsx.

---

## ═══ COSA FARE IN S95 (8 task) ═══════════════════════════════════

### Task 1: Aggiungere token mancanti a design-system.css
Aggiungere nella sezione `:root` dopo i token S94:
```css
/* --- S95: Accent shadows (build mode selector) --- */
--shadow-accent-xs: 0 1px 4px rgba(124, 179, 66, 0.2);
--shadow-accent-sm: 0 2px 8px rgba(124, 179, 66, 0.25);
--shadow-accent-md: 0 4px 12px rgba(124, 179, 66, 0.35);
```

### Task 2: Sostituire border-radius nudi in ElabSimulator.css
- Riga 432: `2px` → `var(--radius-xs)` (4px — più arrotondato, più coerente)
- Riga 662: `6px` → `var(--radius-sm)`

### Task 3: Sostituire box-shadow nudi in ElabSimulator.css
- Riga 688: → `var(--shadow-accent-sm)`
- Riga 696: → `var(--shadow-accent-md)`
- Riga 705: → `var(--shadow-accent-xs)`

### Task 4: Unificare transition in ElabSimulator.css
Le 4 occorrenze di `60ms ease-out` sono troppo veloci — l'utente non percepisce la transizione.
Sostituire con `150ms ease` (che è `var(--transition-fast)`) MANTENENDO la proprietà specifica:
- Riga 364: `transition: background var(--transition-fast);`
- Riga 522: `transition: transform var(--transition-fast), background var(--transition-fast);`
- Riga 980: `transition: transform var(--transition-fast), filter var(--transition-fast);`
- Riga 1007: `transition: transform var(--transition-fast), filter var(--transition-fast);`
- Riga 480: `transition: all var(--transition-spring);` (già spring, solo tokenizzare)

### Task 5: Sostituire border-radius nudi in overlays.module.css
- Riga 278: `16px 16px 0 0` → `var(--radius-xl) var(--radius-xl) 0 0`
- Riga 302: `16px 16px 0 0` → stesso

### Task 6: Normalizzare gap fuori grid in ElabSimulator.css
- Riga 895: `gap: 5px` → `gap: var(--space-1)` (4px — allinea al grid 4px)
- Le altre gap (1px, 2px) sono micro-spacing volontario → LASCIARE (non vale la pena tokenizzare)

### Task 7: Audit inline styles padding/borderRadius nei pannelli JSX
Leggere (senza modificare subito) questi file per trovare inline styles con padding/borderRadius/gap hardcoded:
- `src/components/simulator/controls/ControlBar.jsx`
- `src/components/simulator/panels/ComponentDrawer.jsx`
- `src/components/simulator/panels/SerialMonitor.jsx`
- `src/components/simulator/panels/ExperimentPicker.jsx`

Per ogni inline style trovato: se il valore è un multiplo di 4px → sostituire con il token spacing corrispondente (`var(--space-N)`). Se è un border-radius → sostituire con `var(--radius-*)`.

**NOTA**: Gli inline style JSX non possono usare `var()` in modo affidabile per `style={{ padding: ... }}`. La strategia corretta è:
- Se il componente ha già una classe CSS → spostare la proprietà nella classe
- Se non ha classe → aggiungere una classe in ElabSimulator.css con le proprietà tokenizzate
- ALTERNATIVA semplice: usare `var(--space-2)` come string nei template literals (`style={{ padding: 'var(--space-2)' }}`) — funziona in React

### Task 8: Build + Verifiche
- `npm run build` → 0 errori
- Dev server → 0 errori console
- CSS token resolution: tutti i nuovi token risolvono
- Scratch Gate SG10 (build) PASS
- SG1-SG9: code-verified (nessun cambio funzionale)

---

## ═══ COSA NON TOCCARE ═══════════════════════════════════════════

1. **Layout/posizioni**: Non cambiare dimensioni, flex ratios, breakpoints — solo proprietà decorative
2. **Funzionalità**: Zero cambiamenti alla logica React, handlers, state
3. **iPad breakpoints**: Non toccare media queries — S100 è dedicata
4. **SVG componenti hardware**: S96 è dedicata
5. **Padding nei CSS che seguono media queries responsive**: i padding che cambiano a diversi breakpoint (righe 916, 931, 942, 960) vanno tokenizzati MA mantenendo la stessa dimensione. NON cambiare il valore numerico.
6. **gap: 1px e 2px**: micro-spacing deliberato per separatori e toolbar compatta — lasciare

---

## ═══ CONTEXT FILES ═══════════════════════════════════════════════

### Tier 1: LEGGERE SUBITO
```
src/styles/design-system.css                          # 304 righe — TUTTI i token
src/components/simulator/ElabSimulator.css             # 1114 righe — file CSS principale
src/components/simulator/overlays.module.css           # overlay panels, modals
```

### Tier 2: LEGGERE PER TASK 7
```
src/components/simulator/controls/ControlBar.jsx       # Toolbar buttons
src/components/simulator/panels/ComponentDrawer.jsx    # Passo Passo panel
src/components/simulator/panels/SerialMonitor.jsx      # Serial output panel
src/components/simulator/panels/ExperimentPicker.jsx   # Experiment selector
src/components/simulator/panels/CodeEditorCM6.jsx      # Code editor panel
```

### Tier 3: REFERENCE
```
docs/roadmap/FASE-1-ESTETICA.md                       # Roadmap FASE 1 dettaglio
docs/roadmap/01-PIANO-MAESTRO.md                      # Roadmap completo + Scratch Gate
.claude/prompts/session-87-simulator-perfection.md     # Formato prompt precedente
```

---

## ═══ REGOLE INVIOLABILI ═══════════════════════════════════════════

1. **ZERO REGRESSIONI**: Se funzionava in S94, DEVE funzionare in S95. Se rotto → REVERT IMMEDIATO.
2. **MAI agenti paralleli**: Tutto sequenziale, verificato passo passo.
3. **Chrome Control per validazione**: Senza `preview_inspect` / `preview_eval` / `preview_screenshot` = non puoi dire PASS.
4. **Max 3 file per batch edit**: Fix su 4+ file → spezza in sub-batch. Build dopo OGNI batch.
5. **Nessun cambio di VALORE numerico**: Tokenizzare `padding: 6px 12px` → `padding: var(--space-1p5) var(--space-3)` dove `1p5` è 6px. Se non esiste un token per 6px, usare il più vicino (--space-1 = 4px, --space-2 = 8px) OPPURE creare un alias `--space-1-5: 6px`. MA: cambiare 6px→8px è un CAMBIO VISIVO. **Decisione**: per 6px, usare il token letterale `6px` con commento `/* 6px = between space-1 and space-2 */` oppure creare `--space-1-5: 6px` in design-system.css. **Preferenza**: creare `--space-1-5: 6px` per non inquinare il CSS con commenti.
6. **Scratch Gate SG1-SG10 obbligatorio**: Anche se non tocchiamo Scratch, verificare che non abbiamo rotto nulla.
7. **Commit solo su richiesta**: NON commit automatici.

### Nota su 6px (non nel grid 4px standard)
Il grid 4px ha: 0, 4, 8, 12, 16, 20, 24, 32. Manca 6px.
In ElabSimulator.css, `6px` è usato 15+ volte (padding, gap, margin).
**Decisione da prendere**: aggiungere `--space-1-5: 6px` OPPURE arrotondare a 4px/8px.
Il mio suggerimento: **aggiungere `--space-1-5: 6px`** perché cambiare da 6px a 4px/8px modificherebbe spacing visivo su TUTTI i pannelli — rischio troppo alto per una sessione di token purge. Il nome `1-5` segue la convenzione Tailwind (space-1.5).

Stessa logica per `10px`: aggiungere `--space-2-5: 10px` piuttosto che forzare 8px o 12px.

---

## ═══ METODOLOGIA ═══════════════════════════════════════════════

### Ordine di lavoro
```
1. Leggi design-system.css + ElabSimulator.css + overlays.module.css
2. Aggiungi token mancanti a design-system.css (Task 1 + nota 6px/10px)
3. Sostituisci border-radius nudi in ElabSimulator.css (Task 2)
4. Sostituisci box-shadow nudi in ElabSimulator.css (Task 3)
5. Unifica transition in ElabSimulator.css (Task 4)
6. Sostituisci border-radius nudi in overlays.module.css (Task 5)
7. Normalizza gap 5px (Task 6)
8. npm run build → verifica 0 errori
9. Dev server → preview_eval su :root → tutti i token nuovi risolvono
10. Leggi ControlBar.jsx + panels JSX → audit inline styles (Task 7)
11. Sostituisci inline styles con token dove possibile (Task 7)
12. npm run build → verifica finale
13. Scratch Gate SG10 (build), SG1-SG9 code-verified
```

### Chrome Control Protocol
```
1. preview_start("elab-builder-dev")
2. Naviga a qualsiasi pagina caricata
3. preview_eval: getComputedStyle(root) per TUTTI i nuovi token
4. Verifica: ogni token risolve al valore atteso
5. preview_console_logs("error") → 0 errori
```

---

## ═══ DELIVERABLES S95 ═══════════════════════════════════════════

1. ✅ Token mancanti aggiunti a design-system.css (shadow accent + space 1.5/2.5 se necessari)
2. ✅ Border-radius nudi eliminati da ElabSimulator.css + overlays.module.css
3. ✅ Box-shadow nudi eliminati da ElabSimulator.css
4. ✅ Transition unificate a 150ms (da 60ms) e tokenizzate
5. ✅ Gap 5px normalizzata a 4px (grid-aligned)
6. ✅ Inline styles JSX audit completato (pannelli principali)
7. ✅ Build 0 errori
8. ✅ CSS token resolution verificata via Chrome Control
9. ✅ Scratch Gate SG10 PASS

### Score card attesa post-S95
| Area | Score | Delta |
|------|-------|-------|
| Estetica | 7.5-8.0/10 | +0.5-1.0 (spacing + transition coerenti su tutti i pannelli) |
| Code Quality | 9.8/10 | = |
| Regressioni | **ZERO** | — |

---

## ═══ HANDOFF OBBLIGATORIO ═══════════════════════════════════════════

**A fine sessione DEVI**:

1. **Stringa di handoff** — Riassunto completo di cosa è stato fatto, file modificati, token aggiunti, score aggiornati, e cosa resta da fare per FASE 1.
2. **Prompt S96** — Scrivi e salva il prompt per la sessione successiva in `.claude/prompts/session-96-svg-canvas-polish.md`. Il prompt deve:
   - Includere la mappa roadmap 15 sessioni con `← SEI QUI` aggiornato su S96
   - Riassumere cosa ha fatto S94 e S95 (contesto per S96)
   - Contenere l'analisi pre-fatta per S96 (22 componenti SVG da auditare, canvas polish, aria labels)
   - Seguire lo stesso formato di questo prompt (sezioni ═══, task numerati, regole, Chrome Control, deliverables)
   - Riferirsi a `docs/roadmap/FASE-1-ESTETICA.md` sezione S96

**Questo è il pattern per TUTTE le 15 sessioni**: ogni sessione produce il prompt della successiva, creando una catena continua senza perdita di contesto.

### Catena obbligatoria
```
S95 produce → .claude/prompts/session-96-svg-canvas-polish.md
S96 produce → .claude/prompts/session-97-capacitor-transient.md
S97 produce → .claude/prompts/session-98-component-behavior.md
S98 produce → .claude/prompts/session-99-error-feedback.md
S99 produce → .claude/prompts/session-100-ipad-layout.md
S100 produce → .claude/prompts/session-101-ipad-touch.md
S101 produce → .claude/prompts/session-102-scratch-steps.md
S102 produce → .claude/prompts/session-103-scratch-blocks.md
S103 produce → .claude/prompts/session-104-galileo-context.md
S104 produce → .claude/prompts/session-105-galileo-powers.md
S105 produce → .claude/prompts/session-106-galileo-stress.md
S106 produce → .claude/prompts/session-107-ux-a11y.md
S107 produce → .claude/prompts/session-108-grand-final.md
S108 → FINE ROADMAP 🎉
```

**Se la sessione finisce senza aver scritto il prompt della successiva, la sessione NON è completa.**
Il prompt successivo DEVE includere la sezione HANDOFF OBBLIGATORIO con la stessa catena aggiornata.
