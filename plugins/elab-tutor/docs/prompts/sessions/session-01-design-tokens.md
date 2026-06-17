# Sessione 1 — Estetica: Design Tokens (Inline Colors → CSS Vars)

> Focus UNICO: eliminare TUTTE le dichiarazioni di colore inline nei componenti del tutor/simulatore e sostituirle con CSS custom properties dalla palette ufficiale ELAB.

---

## TASK

Il punteggio Estetica e 8.8/10. Una delle cause principali sono ~17 dichiarazioni di colore inline trovate nei componenti tutor. In questa sessione:

1. **AUDIT**: Trovare TUTTE le dichiarazioni di colore inline (hex, rgb, rgba, hsl) nei file JSX/CSS del simulatore e del tutor
2. **MAP**: Per ogni colore trovato, mapparlo al token CSS var piu vicino dalla palette ELAB (`docs/prompts/context/06-ESTETICA-DESIGN.md`)
3. **REPLACE**: Sostituire ogni inline color con la CSS var corrispondente
4. **VERIFY**: Build 0 errori + verifica visiva nel browser che nessun colore sia cambiato
5. **DOCUMENT**: Aggiornare `06-ESTETICA-DESIGN.md` con i fix effettuati

---

## CONTEXT FILES DA LEGGERE

```
docs/prompts/context/00-STATO-PROGETTO.md   — score card, problemi noti
docs/prompts/context/06-ESTETICA-DESIGN.md  — palette, font, design tokens, problemi estetici
```

---

## PALETTE UFFICIALE (reference)

| Nome | Hex | CSS Var |
|------|-----|---------|
| Navy | #1E4D8C | --color-primary |
| Navy hover | #163A6B | --color-primary-hover |
| Lime | #7CB342 | --color-accent / --color-vol1 |
| Orange | #E8941C | --color-vol2 |
| Red | #E54B3D | --color-vol3 |
| Danger | #DC2626 | --color-danger |
| Warning | #EA580C | --color-warning |
| Success | #16A34A | --color-success |
| Background | #FFFFFF | --color-bg |
| Bg secondary | #F7F7F8 | --color-bg-secondary |
| Bg tertiary | #ECECF1 | --color-bg-tertiary |
| Canvas bg | #F0F2F5 | --color-bg-canvas |
| Border | #E5E5EA | --color-border |
| Text | #1A1A2E | --color-text |
| Text secondary | #6B6B80 | --color-text-secondary |

---

## REGOLE

### R1 — Solo Colori, Nient'altro
Non toccare spacing, font, layout, logica. SOLO colori inline → CSS vars.

### R2 — Stessa Resa Visiva
Dopo ogni sostituzione, il componente deve apparire IDENTICO. Se un colore inline non ha un equivalente esatto nella palette, creare una nuova CSS var in `design-system.css` con un nome semantico.

### R3 — File Prioritari
Concentrarsi su:
- `ElabTutorV4.jsx` e `ElabTutorV4.css` (chat Galileo)
- `NewElabSimulator.jsx` e `ElabSimulator.css` (simulatore)
- `ControlBar.jsx` (toolbar)
- `ComponentDrawer.jsx` (pannello laterale)
- `SerialMonitor.jsx`
- `CodeEditorCM6.jsx`
- `ScratchEditor.jsx`
- Overlay components (potentiometer, LDR, rotate)

### R4 — Esclusioni
NON modificare:
- Colori nei componenti SVG (LED, resistor, etc.) — quelli sono corretti by design
- Colori nelle definizioni di `experiments-vol*.js` — quelli rappresentano colori fisici reali
- `design-system.css` — a meno che non serva aggiungere nuove vars
- File admin (`Admin*.jsx`, `Gestionale*.jsx`) — fuori scope

### R5 — Build & Test
- `npm run build` → 0 errori
- Verifica visiva: caricare 2-3 esperimenti e controllare che tutto appaia identico
- Screenshot prima/dopo se possibile

---

## PIANO DI ESECUZIONE

1. `grep -r` per tutti i pattern colore inline nei file JSX/CSS del simulatore
2. Catalogare in tabella: file, riga, colore trovato, CSS var target
3. Sostituire uno alla volta, verificando dopo ogni batch di 5
4. Build finale
5. Verifica browser
6. Aggiornare `06-ESTETICA-DESIGN.md`

---

## COV CHECKLIST

- [ ] Audit completato: lista completa di inline colors trovati
- [ ] Ogni colore mappato a CSS var (o nuova var creata)
- [ ] Build: 0 errori
- [ ] Browser: componenti appaiono identici post-fix
- [ ] `06-ESTETICA-DESIGN.md` aggiornato
- [ ] Context file: numero di inline styles ridotto da ~17 a 0 (o quasi)

---

## OUTPUT FINALE

1. Lista dei fix (file:riga: old → new)
2. Build status
3. Screenshot conferma
4. Score estetica aggiornato
5. **Prompt Sessione 2** (`session-02-spacing-typography.md`)

---

## ALLA FINE DELLA SESSIONE

Crea il prompt per la Sessione 2 (Estetica — Spacing Grid & Typography Polish) nella stessa cartella `docs/prompts/sessions/`.
