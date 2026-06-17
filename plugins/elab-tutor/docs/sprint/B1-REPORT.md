# BLOCCO 1 — Report: Merge flusso Bentornati

**Data**: 11/04/2026
**Branch sorgente**: `claude/bentornati-flow-VEhLp`
**Branch target**: `claude/review-workplan-directives-iEQpo`
**Operazione**: Cherry-pick selettivo (NO copyright updates, NO .github/workflows)

## File integrati

| File | Tipo | Righe |
|------|------|-------|
| `src/components/lavagna/LavagnaShell.jsx` | modified | 854 (+155) |
| `src/components/lavagna/LavagnaShell.module.css` | modified | 326 (+145) |
| `tests/unit/lavagna/BentornatiFlow.test.js` | new | 211 |

## Cosa fa il Bentornati flow

Implementa il **Principio Zero**: quando il docente apre ELAB, l'overlay "Bentornati" propone automaticamente il prossimo esperimento basato sulle sessioni passate.

- **Prima volta**: messaggio "Benvenuti!" + auto-load primo esperimento dopo 2s
- **Ritorno con suggerimento**: mostra ultimo esperimento + propone il prossimo
- **Ritorno senza suggerimento**: invita a scegliere un esperimento
- **Race condition**: gestita con polling API (max 10 tentativi, 300ms intervallo)

### Componenti coinvolti
- `BentornatiOverlay` — nuovo componente interno a LavagnaShell
- `handleBentornatiStart` — callback con retry per API non pronta
- `handleBentornatiPickExperiment` — fallback a ExperimentPicker
- Integrazione con `classProfile.buildClassProfile()` e `getNextLessonSuggestion()`

### Icone utilizzate (da ElabIcons.jsx)
- `HandWaveIcon` — primo accesso
- `PartyIcon` — ritorno
- `FlaskIcon` — bottone "Inizia"

## Verifiche

| Check | Risultato |
|-------|-----------|
| `npm run build` | PASS (1m 29s) |
| `npx vitest run` | 1726/1726 PASS (56 file, 0 fail) |
| Regressioni | ZERO |
| File non previsti modificati | ZERO |

## Note

- Il target di 2225 test richiede ~499 test aggiuntivi che saranno creati nei blocchi successivi
- Il build aveva un problema pre-esistente con native bindings (`lightningcss`, `@tailwindcss/oxide`) — risolto installando i pacchetti platform-specific
- I commit di copyright update e i file `.github/workflows` del branch bentornati sono stati esclusi come da istruzioni
