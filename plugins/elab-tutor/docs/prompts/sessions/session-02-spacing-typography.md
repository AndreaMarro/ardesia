# Sessione 2 — Estetica: Spacing Grid & Typography Polish

> Focus UNICO: eliminare TUTTI gli spacing hardcoded (px inline) e normalizzare la tipografia nei componenti del tutor/simulatore, usando esclusivamente le CSS custom properties del design system ELAB.

---

## TASK

Il punteggio Estetica e 9.0/10 (migliorato dalla Sessione 1 che ha tokenizzato 159 colori inline). Le cause principali rimanenti sono spacing hardcoded e inconsistenze tipografiche. In questa sessione:

1. **AUDIT**: Trovare TUTTI gli spacing hardcoded (`padding: Npx`, `margin: Npx`, `gap: Npx`) nei file JSX/CSS del simulatore e del tutor che NON usano `--space-N` vars
2. **MAP**: Per ogni spacing trovato, mapparlo al token `--space-N` piu vicino dal 4px grid
3. **REPLACE**: Sostituire ogni inline spacing con la CSS var corrispondente
4. **TYPOGRAPHY**: Normalizzare font-size inline a `--font-size-*` vars, font-family a `--font-*` vars
5. **VERIFY**: Build 0 errori + verifica visiva nel browser
6. **DOCUMENT**: Aggiornare `06-ESTETICA-DESIGN.md` con i fix effettuati

---

## CONTEXT FILES DA LEGGERE

```
docs/prompts/context/00-STATO-PROGETTO.md   — score card, problemi noti
docs/prompts/context/06-ESTETICA-DESIGN.md  — palette, font, design tokens, problemi estetici
src/styles/design-system.css                — tutti i token disponibili
```

---

## SPACING GRID (4px reference)

| Token | Value |
|-------|-------|
| --space-1 | 4px |
| --space-1-5 | 6px |
| --space-2 | 8px |
| --space-2-5 | 10px |
| --space-3 | 12px |
| --space-4 | 16px |
| --space-5 | 20px |
| --space-6 | 24px |
| --space-8 | 32px |
| --space-10 | 40px |
| --space-12 | 48px |
| --space-16 | 64px |

## TYPOGRAPHY TOKENS

| Token | Value | Uso |
|-------|-------|-----|
| --font-size-xs | 12px | Caption only |
| --font-size-sm | 14px | Secondary text, min WCAG |
| --font-size-base | 15px | Body text default |
| --font-size-md | 16px | Input text |
| --font-size-lg | 18px | Subheadings |
| --font-size-xl | 24px | Section titles |
| --font-size-2xl | 32px | Page titles |
| --font-size-3xl | 40px | Hero titles |
| --font-sans | Open Sans | Body text |
| --font-display | Oswald | Headings |
| --font-mono | Fira Code | Code |

---

## REGOLE

### R1 — Solo Spacing e Typography, Nient'altro
Non toccare colori (gia fatto in S1), layout structure, logica JS. SOLO spacing inline -> CSS vars e font normalization.

### R2 — Stessa Resa Visiva
Dopo ogni sostituzione, il componente deve apparire IDENTICO. I valori non esattamente nel 4px grid (es. `5px`, `7px`, `9px`) vanno arrotondati al valore piu vicino nel grid, ma verificando che non rompano il layout.

### R3 — File Prioritari
Concentrarsi su:
- `tutor-responsive.css` (molti spacing hardcoded restanti)
- `ElabTutorV4.css` (chat, notes, toolbar)
- `ElabSimulator.css` (toolbar, panels)
- `TutorTools.css` (tools cards)
- `TutorLayout.jsx` (welcome modal)
- `ChatOverlay.jsx` (input area, messages)
- `CircuitReview.jsx`, `VideosTab.jsx`, `SafeMarkdown.jsx`

### R4 — Esclusioni
NON modificare:
- Spacing in componenti SVG (posizioni pixel-perfect)
- `design-system.css` — a meno che non serva aggiungere nuove vars
- File admin (`Admin*.jsx`, `Gestionale*.jsx`) — fuori scope
- Valori che sono gia CSS vars

### R5 — Build & Test
- `npm run build` -> 0 errori
- Verifica visiva: caricare 2-3 esperimenti e controllare che layout sia identico
- Focus su: padding bottoni >= 44px touch target, gap consistency, margin uniformity

---

## PIANO DI ESECUZIONE

1. `grep -r` per pattern spacing inline (`padding:`, `margin:`, `gap:`, `font-size:`) senza `var(` nei file target
2. Catalogare in tabella: file, riga, valore trovato, CSS var target
3. Sostituire un file alla volta, verificando dopo ogni batch
4. Normalizzare font-size e font-family
5. Build finale
6. Verifica browser
7. Aggiornare `06-ESTETICA-DESIGN.md`

---

## COV CHECKLIST

- [ ] Audit completato: lista completa di spacing/typography hardcoded
- [ ] Ogni spacing mappato a `--space-N` (o gap documentato)
- [ ] Font-size normalizzati a `--font-size-*`
- [ ] Build: 0 errori
- [ ] Browser: componenti appaiono identici post-fix
- [ ] Touch targets: tutti >= 44px
- [ ] `06-ESTETICA-DESIGN.md` aggiornato

---

## OUTPUT FINALE

1. Lista dei fix (file:riga: old -> new)
2. Build status
3. Screenshot conferma
4. Score estetica aggiornato
5. **Prompt Sessione 3** (`session-03-ipad-responsive.md`)

---

## ALLA FINE DELLA SESSIONE

Crea il prompt per la Sessione 3 (Estetica — iPad Responsive Polish) nella stessa cartella `docs/prompts/sessions/`.
