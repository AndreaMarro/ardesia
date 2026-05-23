# Lavagna Layout Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminare le sovrapposizioni di pannelli nella Lavagna ELAB (`#lavagna`) trasformandola in un layout ibrido a colonne, simile a un IDE come edukit.

**Architecture:** `LavagnaShell` diventa una griglia/colonna pulita: AppHeader in cima, una striscia ModalitaSwitch in-flow (non più `position:absolute`), una work-area a colonne, e un livello overlay portato fuori via `createPortal`. Il layout interno di `NewElabSimulator` (canvas + editor già a colonne flex) NON viene toccato.

**Tech Stack:** React 19, Vite 7, CSS Modules, `react-dom` `createPortal`, Vitest.

---

## Note di esecuzione (onestà — leggere prima)

1. **Refactor a stadi.** I 5 task sono sequenziali: ognuno parte dallo stato lasciato dal precedente. Ogni task va eseguito da un agente fresco che **rilegge il file corrente** prima di modificarlo (i numeri di riga slittano tra un task e l'altro). Gli snippet JSX qui sotto sono *strutture target*, non diff a numeri di riga.
2. **Atomi CSS = verifica browser, non unit test finti.** Task 1, 2, 3, 5 sono prevalentemente CSS + struttura JSX: non esiste una "funzione pura" da testare. La verifica è: (a) CoV — `npx vitest run` ×3, baseline non cala; (b) `npm run build` passa; (c) verifica browser a 1366/1440/1920. Spec §7, Andrea-approvata. Scrivere unit test CSS finti violerebbe l'onestà G45.
3. **Governance per ogni task:** branch da `origin/main` aggiornato; commit `tipo(area): ...`; voce in `CHANGELOG.md`; Codex Pattern V prima del commit; PR via `gh`; NO push su main; NO auto-merge (Andrea ratifica). `git add` path-scoped, mai `-A`.
4. **Baseline:** prima di toccare codice, `npx vitest run` e annota il conteggio (`automa/baseline-tests.txt`). Dopo: non deve calare.
5. **`.superpowers/` va in `.gitignore`** prima del primo commit (artefatti brainstorm, non vanno versionati).

---

## File Structure

| File | Stato | Responsabilità |
|---|---|---|
| `src/styles/z-index.css` | **nuovo** | Scala z-index unica (`:root` custom properties) |
| `src/main.jsx` | modifica (1 riga) | Import globale del file token |
| `src/components/lavagna/LavagnaShell.module.css` | modifica | `.body` colonna, `.modalitaStrip`, `.workArea`, `.canvas` senza stacking trap, `.overlayRoot` |
| `src/components/lavagna/LavagnaShell.jsx` | modifica | Wrapping struttura: striscia modalità + work-area; portali overlay |
| `src/components/lavagna/RetractablePanel.*` | modifica (Task 3) | Pannello sinistro da `absolute` a colonna in-flow |
| `src/components/simulator/layout.module.css` | modifica (Task 4) | Revert A4 z-bump `.codeEditorPanelScratchFullscreen` |
| `src/components/simulator/NewElabSimulator.jsx` | modifica (Task 4, minima) | Rimozione CustomEvent A4 `elab-editor-fullscreen` |
| `CHANGELOG.md` | modifica (ogni task) | Una voce per atomo |

---

## Task 1: Scala z-index token (fondamenta)

**Files:**
- Create: `src/styles/z-index.css`
- Modify: `src/main.jsx` (aggiunta import)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Crea il file token**

Crea `src/styles/z-index.css` con esattamente:

```css
/* ELAB — scala z-index. Unica fonte di verità per l'ordine di stacking.
   Lavagna Layout Overhaul — 2026-05-22. */
:root {
  --z-base: 0;       /* contenuto in griglia: canvas, editor, pannelli in flusso */
  --z-rail: 10;      /* tool rail */
  --z-topbar: 20;    /* AppHeader, striscia modalità */
  --z-overlay: 1000; /* overlay portati: chat UNLIM, drawing toolbar, toast, hint */
  --z-modal: 2000;   /* welcome modal, dialog, picker */
}
```

- [ ] **Step 2: Importa il token globalmente**

Apri `src/main.jsx`. Se non esiste, trova l'entry Vite: `grep -l "createRoot" src/*.jsx`. Aggiungi l'import accanto agli altri import CSS globali (es. dopo `import './index.css'`):

```js
import './styles/z-index.css';
```

- [ ] **Step 3: Verifica build**

Run: `npm run build`
Expected: build PASS, nessun errore.

- [ ] **Step 4: CoV — baseline invariata**

Run: `npx vitest run` (×3 se il primo è verde, per scartare flakiness)
Expected: conteggio test = baseline, zero fail nuovi.

- [ ] **Step 5: Voce CHANGELOG**

Prependi a `CHANGELOG.md` (sotto l'header, sopra le voci esistenti):

```markdown
### style(lavagna): scala z-index token unica
- Nuovo `src/styles/z-index.css` — token `--z-base/--z-rail/--z-topbar/--z-overlay/--z-modal`.
- Fondamenta per il Lavagna Layout Overhaul (L1/5). Nessun cambiamento visibile.
```

- [ ] **Step 6: Commit**

```bash
git add src/styles/z-index.css src/main.jsx CHANGELOG.md
git commit -m "style(lavagna): add z-index token scale"
```

---

## Task 2: Body a colonna — striscia ModalitaSwitch in-flow + work-area

Questo è l'atomo che **elimina la sovrapposizione principale**. Oggi `.modalitaSwitchSlot` è `position:absolute; z-index:960` e flotta sopra l'editor; `.canvas` ha `z-index:0` che crea uno stacking context e intrappola l'editor fullscreen. Dopo questo task la ModalitaSwitch è un elemento in flusso e niente la fa più galleggiare.

**Files:**
- Modify: `src/components/lavagna/LavagnaShell.module.css`
- Modify: `src/components/lavagna/LavagnaShell.jsx`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: CoV baseline pre-modifica**

Run: `npx vitest run` — annota il conteggio. Snapshot: `git tag baseline-L2-$(date +%H%M)`.

- [ ] **Step 2: CSS — `.body` da riga a colonna**

In `LavagnaShell.module.css`, sostituisci la regola `.body`:

```css
.body {
  flex: 1;
  display: flex;
  flex-direction: column;   /* era riga: ora impila striscia modalità + work-area */
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 3: CSS — `.modalitaStrip` rimpiazza `.modalitaSwitchSlot`**

In `LavagnaShell.module.css`, sostituisci l'intera regola `.modalitaSwitchSlot` con:

```css
/* Striscia modalità — in flusso, non più position:absolute (niente overlap) */
.modalitaStrip {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  padding: 6px 8px;
  background: var(--color-bg-cool);
}
```

- [ ] **Step 4: CSS — nuova `.workArea`**

In `LavagnaShell.module.css`, aggiungi sotto `.modalitaStrip`:

```css
/* Work-area — riga a colonne: pannello sinistro | canvas | (chat via portal in L4) */
.workArea {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
```

- [ ] **Step 5: CSS — `.canvas` perde lo stacking trap**

In `LavagnaShell.module.css`, nella regola `.canvas` **rimuovi la riga** `z-index: 0;`. `.canvas` resta `flex:1; position:relative; overflow:hidden` + background. Senza `z-index` esplicito non crea più uno stacking context che intrappola l'editor fullscreen.

- [ ] **Step 6: JSX — striscia modalità + wrapper work-area**

In `LavagnaShell.jsx`, dentro `<div className={css.lavagnaView} ...>`, la struttura target è:

```jsx
<div className={css.lavagnaView} style={{ display: activeTab === 'lavagna' ? 'contents' : 'none' }}>
  {!freeMode && (
    <div className={css.modalitaStrip} data-testid="modalita-switch-slot">
      <ModalitaSwitch
        activeMode={modalita}
        onModeChange={handleModalitaChange}
        sessionState={derivedSessionState}
      />
    </div>
  )}

  <div className={css.workArea}>
    {/* Pannello sinistro — invariato in questo task (resta absolute, diventa colonna in Task 3) */}
    {!freeMode && hasExperiment && buildMode !== 'sandbox' && (
      <RetractablePanel id="lavagna-left" direction="left" /* ...props invariate... */>
        <QuickComponentPanel volumeNumber={currentVolume} />
      </RetractablePanel>
    )}

    <main className={css.canvas} style={{
      ...(leftPanelOpen && !freeMode ? { marginLeft: leftPanelSize } : {}),
      ...(bottomPanelOpen ? { marginBottom: bottomPanelSize } : {}),
    }}>
      {/* contenuto invariato: Suspense > NewElabSimulator + FloatingToolbar */}
    </main>

    <UnlimAdapter visible={unlimOpen} /* ...props invariate... */ />
  </div>
</div>
```

Modifiche puntuali rispetto all'attuale:
- `className={css.modalitaSwitchSlot}` → `className={css.modalitaStrip}`.
- Rimuovi il gate `&& !editorFullscreen` dalla condizione della striscia modalità (la ModalitaSwitch non flotta più → non serve nasconderla in fullscreen).
- Avvolgi `RetractablePanel` sinistro + `<main className={css.canvas}>` + `<UnlimAdapter>` in un nuovo `<div className={css.workArea}>`.
- Lascia invariati: gli `style` margin su `<main>` (rimossi in Task 3), i props di tutti i componenti.

- [ ] **Step 7: Build + CoV**

Run: `npm run build` → PASS.
Run: `npx vitest run` ×3 → baseline invariata, zero fail nuovi. Se cala → revert immediato (`git checkout .`) e indaga.

- [ ] **Step 8: Verifica browser (anti-G45 — obbligatoria)**

Avvia il dev server (`preview_start`). A 1366×768, 1440×900, 1920×1080, per ognuna delle 3 modalità (Percorso/Passo Passo/Già Montato):
- La ModalitaSwitch è una striscia in cima alla work-area, **non sovrapposta** a niente.
- Apri l'editor codice (esperimento Vol3): i tasti in alto dell'editor (Chiudi / Arduino C++ / Blocchi / schermo intero) sono **tutti visibili e cliccabili**.
- Apri l'editor a schermo intero: **niente** lo copre.
Cattura screenshot per ogni breakpoint.

- [ ] **Step 9: Voce CHANGELOG**

```markdown
### fix(lavagna): striscia ModalitaSwitch in-flow — stop overlap editor
- `.body` da riga a colonna; ModalitaSwitch da `position:absolute z960` a striscia in flusso.
- `.canvas` non ha più `z-index:0` → niente stacking context che intrappola l'editor fullscreen.
- Nuovo wrapper `.workArea`. Risolve la sovrapposizione principale segnalata da Andrea.
```

- [ ] **Step 10: Codex Pattern V + Commit**

Esegui Codex Pattern V (`scripts/dev/codex-bg.sh`). Poi:

```bash
git add src/components/lavagna/LavagnaShell.jsx src/components/lavagna/LavagnaShell.module.css CHANGELOG.md
git commit -m "fix(lavagna): in-flow ModalitaSwitch strip, remove canvas stacking trap"
```

---

## Task 3: Pannello sinistro come colonna reale — via gli hack di margin

Oggi il `RetractablePanel` sinistro è `position:absolute` e `<main>` riceve `marginLeft`/`marginBottom` inline per fargli spazio. Dopo questo task il pannello è una colonna reale della `.workArea` (flex) e gli hack spariscono.

**Files:**
- Modify: `src/components/lavagna/RetractablePanel.jsx` + `RetractablePanel.module.css`
- Modify: `src/components/lavagna/LavagnaShell.jsx`
- Modify: `src/components/lavagna/LavagnaShell.module.css`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Leggi `RetractablePanel.jsx` e `.module.css`**

Capisci come `direction="left"` posiziona il pannello (cerca `position:`, `absolute`, `fixed`, `transform`). Annota se `direction="bottom"` condivide la logica (il pannello bottom resta invariato in questo task — verifica che la modifica a `left` non lo rompa).

- [ ] **Step 2: CSS — pannello `left` come flex item**

In `RetractablePanel.module.css`, per la variante `direction="left"`: rimuovi `position:absolute`/`fixed`, rimuovi `top/left/height:100%`. Il pannello deve diventare un flex item con `flex-shrink:0` e larghezza pari a `--panel-size` (la prop `size`). Mantieni la transizione di larghezza e il toggle collassa/espandi. La variante `bottom` resta invariata.

- [ ] **Step 3: JSX — rimuovi gli hack di margin su `<main>`**

In `LavagnaShell.jsx`, su `<main className={css.canvas}>`: rimuovi completamente lo `style` con `marginLeft`/`marginBottom`. Diventa:

```jsx
<main className={css.canvas}>
```

- [ ] **Step 4: CSS — `.canvas` perde la transizione di margin**

In `LavagnaShell.module.css`, nella regola `.canvas` rimuovi la `transition` su `margin-left`/`margin-bottom` (non c'è più margin). Se serve una transizione, applicala alla larghezza del pannello in `RetractablePanel.module.css`.

- [ ] **Step 5: Build + CoV**

`npm run build` → PASS. `npx vitest run` ×3 → baseline invariata. Revert se cala.

- [ ] **Step 6: Verifica browser**

A 1366/1440/1920 × 3 modalità: apri/chiudi il pannello sinistro componenti. Il canvas si **restringe/allarga** accanto al pannello (non più coperto, non più spinto da margin). Il pannello bottom (codice/seriale) funziona ancora. Nessun overlap. Screenshot.

- [ ] **Step 7: Voce CHANGELOG + Codex Pattern V + Commit**

Voce CHANGELOG `fix(lavagna): pannello sinistro come colonna della work-area`. Poi:

```bash
git add src/components/lavagna/RetractablePanel.jsx src/components/lavagna/RetractablePanel.module.css src/components/lavagna/LavagnaShell.jsx src/components/lavagna/LavagnaShell.module.css CHANGELOG.md
git commit -m "fix(lavagna): left panel as real work-area column, drop main margin hacks"
```

---

## Task 4: Livello overlay via portal + revert A4

Gli overlay (chat UNLIM, drawing toolbar, toast, mascotte, wake-word pill) hanno z-index sparsi (920/955/960/9001/9999/...). Questo task li porta in un unico `.overlayRoot` via `createPortal` con `--z-overlay`, e reverte gli hack di A4 (non più necessari).

**Files:**
- Modify: `src/components/lavagna/LavagnaShell.jsx`
- Modify: `src/components/lavagna/LavagnaShell.module.css`
- Modify: `src/components/simulator/layout.module.css`
- Modify: `src/components/simulator/NewElabSimulator.jsx`
- Create: `tests/unit/components/lavagna/LavagnaShell-overlay-portal.test.jsx`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: CSS — `.overlayRoot`**

In `LavagnaShell.module.css`:

```css
/* Livello overlay — target dei portal. Sopra la griglia, mai intrappolato. */
.overlayRoot {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  pointer-events: none; /* i figli ri-abilitano pointer-events: auto */
}
```

- [ ] **Step 2: JSX — monta `.overlayRoot` e porta gli overlay**

In `LavagnaShell.jsx`: importa `createPortal` da `react-dom`. Aggiungi un `<div className={css.overlayRoot}>` come ultimo figlio di `css.shell`. Porta dentro, via `createPortal(node, document.body)` o dentro un ref a `.overlayRoot`: `UnlimAdapter` (chat), `toolToast`, il bottone `wakeWordPill`, `MascotPresence`. Ogni nodo portato deve avere `pointer-events: auto` sul proprio contenitore. Pattern di riferimento: la toolbar di `DrawingOverlay.jsx` (PR #156, A3) usa già `createPortal(<>...</>, document.body)`.

- [ ] **Step 3: Revert A4 — z-bump**

In `src/components/simulator/layout.module.css`, regola `.codeEditorPanelScratchFullscreen`: riporta `z-index` da `999` al valore pre-A4 (`900`) **oppure** usa `var(--z-overlay)`. L'editor fullscreen è `position:fixed`; con `.canvas` senza stacking trap (Task 2) compete correttamente.

- [ ] **Step 4: Revert A4 — CustomEvent**

In `NewElabSimulator.jsx`: rimuovi lo `useEffect` che fa `dispatchEvent` di `elab-editor-fullscreen` (righe ~184-188). In `LavagnaShell.jsx`: rimuovi lo stato `editorFullscreen`, il suo `useEffect` listener, e i gate `!editorFullscreen` su `<AppHeader>` e (se ancora presente) sulla striscia modalità. Con il layout a colonne la cromatura non copre più l'editor fullscreen → il gating è superfluo.

- [ ] **Step 5: Test — gli overlay finiscono in `.overlayRoot`**

Crea `tests/unit/components/lavagna/LavagnaShell-overlay-portal.test.jsx`. Test (RED prima, GREEN dopo): renderizza `LavagnaShell`, asserisci che il nodo della chat UNLIM (o un overlay portato) sia un discendente di `.overlayRoot` / `document.body`, non dentro `.workArea`. Esempio struttura:

```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
// ...mount LavagnaShell con i provider necessari (AuthContext, SessionRecorder)...
it('porta gli overlay fuori dalla work-area', () => {
  const { container } = render(/* <LavagnaShell/> con provider */);
  const workArea = container.querySelector('[class*="workArea"]');
  const overlayRoot = document.querySelector('[class*="overlayRoot"]');
  expect(overlayRoot).toBeTruthy();
  // nessun overlay (toast/chat) dentro workArea
  expect(workArea?.querySelector('[class*="toolToast"]')).toBeNull();
});
```

Se montare `LavagnaShell` con tutti i provider è troppo pesante, estrai una helper pura testabile (es. `overlayPortalTarget()`), TDD su quella, e dichiara onestamente che il rendering completo è verificato nel browser.

- [ ] **Step 6: Build + CoV + browser**

`npm run build` → PASS. `npx vitest run` ×3 → baseline +N (i nuovi test), zero fail. Browser 1366/1440/1920 × 3 modalità: chat UNLIM, drawing toolbar, toast, mascotte appaiono sopra tutto, nessun overlap; editor fullscreen pulito. Screenshot.

- [ ] **Step 7: Voce CHANGELOG + Codex Pattern V + Commit**

```bash
git add src/components/lavagna/LavagnaShell.jsx src/components/lavagna/LavagnaShell.module.css src/components/simulator/layout.module.css src/components/simulator/NewElabSimulator.jsx tests/unit/components/lavagna/LavagnaShell-overlay-portal.test.jsx CHANGELOG.md
git commit -m "feat(lavagna): unified overlay portal layer, revert A4 fullscreen hacks"
```

Nota: commit `feat()` → il governance-gate richiede un commit `test()` o file di test nello stesso PR. Il nuovo file in `tests/` lo soddisfa.

---

## Task 5: Polish — pulizia z-index, leggibilità, QA finale

**Files:**
- Modify: file toccati nei task precedenti (pulizia z-index residui)
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Audit z-index residui**

`grep -rn "z-index" src/components/lavagna/ src/components/simulator/layout.module.css`. Ogni valore numerico hardcoded ancora vivo e legato alla Lavagna → sostituiscilo con il token `--z-*` appropriato, oppure rimuovilo se morto. NON toccare z-index fuori dallo scope Lavagna.

- [ ] **Step 2: Pass leggibilità ("numeri illeggibili" — segnalazione Andrea)**

Nel browser, a 1366/1440/1920, ispeziona i numeri/label che Andrea ha segnalato illeggibili (pin, valori, label editor). Verifica font ≥10px (label) / ≥13px (testo) — regola CLAUDE.md 8. Dove sotto soglia, alza la dimensione nel CSS module pertinente. Se l'illeggibilità era causata SOLO dall'overlap (già risolto nei task 2-4), conferma e dichiaralo — niente fix cosmetico inutile.

- [ ] **Step 3: AppHeader ≤52px — verifica**

`.header` è già `height:48px` (≤52px, criterio A6 soddisfatto). Verifica nel browser che resti 48px e non vada in overflow su nessun breakpoint. Nessuna modifica se già OK — dichiaralo.

- [ ] **Step 4: QA finale completo**

Browser, matrice 3 breakpoint × 3 modalità (9 combinazioni): zero overlap, tutti i tasti raggiungibili, numeri leggibili, touch target ≥44px, contrasto WCAG AA, palette/font ELAB. Screenshot di ognuna. Confronto con `.impeccable.md` e con `02-proposta.html` — "bella", non solo ordinata.

- [ ] **Step 5: Build + CoV**

`npm run build` → PASS. `npx vitest run` ×3 → baseline invariata.

- [ ] **Step 6: Voce CHANGELOG + Codex Pattern V + Commit**

Voce CHANGELOG `style(lavagna): pulizia z-index token + QA leggibilità`. Poi:

```bash
git add -- <file effettivamente modificati> CHANGELOG.md
git commit -m "style(lavagna): z-index token cleanup, legibility QA pass"
```

---

## Self-Review (writing-plans)

- **Copertura spec:** §1 causa radice → Task 2 (stacking trap + slot flottante). §4 ossatura → Task 1-4. §5 A6 → Task 5 step 3 (già soddisfatto). §5 A4 → Task 4 step 3-4. §6 L1→Task1, L2→Task2, L3→Task3, L4→Task4, L5→Task5. §7 verifica → step browser/CoV in ogni task. Criterio "numeri leggibili" → Task 5 step 2. Copertura completa.
- **Placeholder:** nessun "TBD"; gli snippet JSX sono dichiarati esplicitamente *strutture target* (Nota di esecuzione 1), non diff fittizi — scelta onesta per un refactor a stadi.
- **Consistenza tipi/nomi:** `.modalitaStrip`, `.workArea`, `.overlayRoot`, token `--z-*` usati coerentemente tra i task. `.modalitaSwitchSlot` rimosso in Task 2 e mai più referenziato.

---

## Esecuzione

Ogni atomo: branch dedicato da `origin/main`, PR via `gh`, NO auto-merge — Andrea ratifica. L'ordine è obbligato (1→2→3→4→5). Task 2 è quello a impatto maggiore (risolve la sovrapposizione principale).
