# Plan — P0-C: characterization e2e del bypass srcDoc (ADR-0001 regression guard)

Data: 2026-07-07 (sessione FABLE NOTTE-6). Base: origin/main a154e4dd (1089/5).

## Obiettivo
Prova falsificabile, in browser REALE, che la superficie `srcDoc` +
`sandbox="allow-scripts allow-same-origin"` del Tool Lab
(`src/design/ToolLab.tsx:23,142`) lascia a codice che gira nel frame del tool
l'accesso al DOM dello Studio (`window.parent.document`). Oggi DEVE passare
(bypass reale); dopo l'enforcement ADR-0001 (niente `allow-same-origin`
sull'origin Studio) DEVE fallire. Il test è il **guardiano di regressione**
che marca il confine tra dichiarato e reale.

## Fatti firsthand (file:line → decisione)
- `ToolLab.tsx:23` `TOOL_LAB_SANDBOX = "allow-scripts allow-same-origin"`;
  `:142-143` `sandbox={TOOL_LAB_SANDBOX} srcDoc={gate.entryHtml}`. srcDoc =
  documento same-origin col parent ⇒ `window.parent.document` leggibile.
- `installer.ts:145-149` la firma ed25519 copre SOLO i byte del manifest;
  `manifest.ts:60-64` `entry` è una stringa-path, NESSUN hash del contenuto
  entry nel manifest. La firma autentica il pacchetto, non vincola il runtime.
- Superficie di mount reale: `App.tsx:28` `isToolLabView()` → `<ToolLab/>`;
  frame `.reference-tool-frame`, stato `data-tool-lab-state=mounted-gate-passed`.

## Decisione di scope (autonoma — tradeoff + rollback)
DUE strade per iniettare "codice ostile nel frame del tool":
- (A) fixture-tool firmata SOLO-test + seam in ToolLab per montarla.
  ❌ aggiunge un seam (anche se DEV-only) e una fixture al repo = superficie.
- (B) **usare `frame.evaluate` di Playwright come sonda in-frame** sul frame
  REALE del Reference tool. `frame.evaluate` gira nella STESSA realm JS
  dell'entry del tool: se la sonda legge `window.parent.document`, lo può fare
  anche l'entry. Nessun cambiamento a prod, nessuna fixture, nessun seam.
  ✅ scelta: più semplice, testabile, reversibile (è solo un file e2e).
- Rollback: `git rm` del solo spec e2e. Zero impatto su prod/altri test.

## Struttura del test (falsificabile, auto-validante) — DUE arm
`e2e/toolhost-srcdoc-bypass.spec.ts`:
1. **CONTROL (end-state ADR-0001)**: nel parent reale inietto un iframe con lo
   STESSO `srcDoc` ma `sandbox="allow-scripts"` (NIENTE allow-same-origin) e una
   sonda che tenta `window.parent.document.title`. Deve FALLIRE (SecurityError /
   cross-origin). Prova che la sonda DISCRIMINA e documenta cosa deve ottenere
   l'enforcement: togliere `allow-same-origin` chiude il buco.
2. **FINDING (bypass odierno = guard di regressione)**: navigo al Tool Lab reale
   `/?vista=tool-lab`, attendo il frame del Reference montato, `frame.evaluate`
   legge `window.parent.document.title`. Deve UGUAGLIARE il title vivo del
   parent (marcato dal test per provare lettura LIVE, non coincidenza). Oggi
   PASSA (bypass). Post-ADR-0001 (frame opaco) l'evaluate lancia → FALLISCE:
   il flip atteso è annotato nel test.

## Verifica (CoV)
- Server DEDICATO su porta libera (fresh vite da QUESTA worktree) per non farsi
  ingannare dallo stale :5199 di sessioni parallele (gotcha memoria NOTTE-4).
- `npx playwright test` del solo spec ×1, poi CoV ×3 (spec + suite vitest
  invariata 1089/5 + tsc/build).
- tsc -b = verità · build ok · hygiene/NUL/secret scan.

## Fuori scope (gate/handoff)
- Enforcement ADR-0001 vero (ranking #2): richiede la decisione B/C. Il test qui
  è il suo prerequisito osservabile. Documentato per la prossima slice.
