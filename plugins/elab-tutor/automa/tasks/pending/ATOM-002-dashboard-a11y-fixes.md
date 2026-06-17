# ATOM-002: Dashboard Docente — Fix a11y P0+P1 (WCAG 2.1 AA)

## Contesto

Audit a11y condotto il 19/04/2026 su `src/components/teacher/TeacherDashboard.jsx` (3437 righe). Report completo in `docs/audit/2026-04-19-dashboard-a11y.md`.

Gap classificati per severità (ispezione statica, NO screen reader reale):

- **P0 critici**: grafici Recharts senza descrizione alternativa; tabelle studenti senza `<caption>` né `<th scope="col">`.
- **P1 medi**: cambio tab non annunciato a screen reader; contrasto `#64748B` su `#F0F4F8` stimato ~3.4:1 (sotto soglia WCAG AA 4.5:1 per testo normale).

Questo task copre solo **P0 + P1** (scope contenuto, ~2h). P2/P3 in ATOM successivo.

## Metrica impattata

- Compliance WCAG 2.1 AA: da 4/7 criteri (approssimativi) a 7/7 su aree toccate
- Abilita pubblica amministrazione italiana (EN 301 549 per scuole pubbliche)
- Non impatta baseline test (solo markup attributes + CSS variable), quindi **zero regressione attesa**

## Cosa fare

### Fix P0-1: Grafici Recharts con `role="img"` + descrizione

- [ ] Riga 2959 (`<charts.LineChart data={trendData}>`): wrappare in:
  ```jsx
  <div role="img" aria-label={`Andamento esperimenti completati: ${trendData[0]?.value ?? 0} all'inizio, ${trendData.at(-1)?.value ?? 0} alla fine del periodo`}>
    <charts.LineChart data={trendData}>...
  </div>
  ```
- [ ] Stesso pattern su tutti i `<BarChart>` e `<PieChart>` presenti (grep: `<charts\\.(BarChart|PieChart|LineChart)`)
- [ ] Label deve essere una frase di senso compiuto, non "Grafico"

### Fix P0-2: Tabella studenti semanticamente corretta

- [ ] Individuare la `<table>` della lista studenti (verifica riga 1300+)
- [ ] Aggiungere `<caption className="sr-only">Lista studenti della classe con stato e progressi</caption>` come primo figlio della table
- [ ] Assicurare che ogni `<th>` nella thead abbia `scope="col"`
- [ ] Se esistono th in tbody (header riga), usare `scope="row"`

### Fix P1-1: Aria-live su cambio tab

- [ ] Identificare il componente tab container (pattern `role="tablist"` riga 712-729 circa)
- [ ] Al selezionare una tab, emettere annuncio tramite un region nascosto:
  ```jsx
  <div role="status" aria-live="polite" className="sr-only">
    {activeTabLabel ? `Sezione ${activeTabLabel} attiva` : ''}
  </div>
  ```
- [ ] In alternativa, aggiungere `aria-live="polite"` al primo `<tabpanel>` visibile

### Fix P1-2: Contrasto colori

- [ ] In `src/styles/variables.css` (o dove definito `--color-text-muted`): sostituire `#64748B` con `#475569` (slate-600, ~5.5:1 su `#F0F4F8`)
- [ ] Dopo la modifica, testare visivamente su Dashboard (screenshot prima/dopo)

## Criteri di accettazione (verificabili)

1. `npx vitest run` passa ≥ 12056 (invariato)
2. `npm run build` passa (no TypeScript/lint errors)
3. `grep -c 'role="img"' src/components/teacher/TeacherDashboard.jsx` >= 2 (era 0)
4. `grep -c '<caption' src/components/teacher/TeacherDashboard.jsx` >= 1 (era 0)
5. `grep -c 'aria-live' src/components/teacher/TeacherDashboard.jsx` >= 2 (era 1)
6. Grep su variables/tokens: `#64748B` non più presente come valore di `--color-text-muted`
7. Visual diff manuale: la Dashboard si vede identica eccetto il muted leggermente più scuro

## File intoccabili

- `src/components/simulator/engine/*` (assoluto)
- `automa/baseline-tests.txt` (baseline)
- `package.json` dependencies (solo markup/CSS)
- Qualsiasi logica business di `TeacherDashboard.jsx` — **modificare SOLO**: attributi `role/aria-*`, wrapper `<div>`, `<caption>`, `<th scope>`, classe CSS `sr-only` (se non esiste, definirla in global.css con il pattern standard WCAG).

## Generator target

`generator-app` (fix su componente existing)

## Stima

**M** (~2h totali): 30' grafici + 45' tabella + 20' aria-live + 15' contrast + 30' test/verify

## Note per Evaluator

- Guard principale: baseline 12056 deve rimanere intatta.
- Se il fix contrasto richiede tokens in un file dove `#64748B` è usato in molti punti, preferire override mirato al `--color-text-muted` piuttosto che find/replace massivo (rischio regressione visiva).
- Se `sr-only` classe non esiste, definirla in `src/styles/global.css`:
  ```css
  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }
  ```
- **NON** aggiungere nuove dipendenze npm (es. `@reach/visually-hidden` o `react-aria`). Solo markup puro.
- **NON** modificare la struttura dei tab (riga 712-729) più del necessario — aggiungere aria-live è sufficiente.
- Dopo il fix, aggiornare `docs/audit/2026-04-19-dashboard-a11y.md` in coda con sezione "**Fixed 19/04**" che marca i gap chiusi.

## Link

- Audit completo: `docs/audit/2026-04-19-dashboard-a11y.md`
- Guida utente: `docs/user/dashboard-docente.md`
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa
- EN 301 549: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/
