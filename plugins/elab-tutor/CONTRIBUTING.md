# Guida alla Collaborazione — ELAB Tutor

## Regola Zero
**Mai pushare direttamente su `main`.** Tutto passa da branch + Pull Request.

## Branching Strategy

### Naming Convention
```
feature/nome-feature      → nuova funzionalità
fix/descrizione-bug       → bug fix
style/area-modificata     → CSS, UI, layout
refactor/area             → refactoring senza cambio funzionalità
docs/cosa                 → documentazione
experiment/nome           → esperimenti, POC (non merge su main)
```

### Workflow
```
main (protetto)
  └── feature/mia-feature
        ├── commit 1
        ├── commit 2
        └── PR → review → merge
```

1. **Crea branch** dal `main` aggiornato:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nome-feature
   ```

2. **Lavora** e committa spesso con messaggi chiari:
   ```bash
   git add file1.js file2.jsx
   git commit -m "feat(simulatore): aggiungi supporto buzzer passivo"
   ```

3. **Push** del branch:
   ```bash
   git push -u origin feature/nome-feature
   ```

4. **Apri Pull Request** su GitHub verso `main`
   - Compila il template PR (checklist automatica)
   - Aspetta che la CI passi (test + build + security)
   - Richiedi review ad Andrea

5. **Dopo approvazione**, merge via GitHub (squash merge consigliato)

## Commit Messages
Formato: `tipo(area): descrizione breve`

| Tipo | Quando |
|------|--------|
| `feat` | Nuova funzionalità |
| `fix` | Bug fix |
| `style` | Cambiamenti CSS/UI (no logica) |
| `refactor` | Refactoring (no cambio comportamento) |
| `test` | Aggiunta/modifica test |
| `docs` | Documentazione |
| `chore` | Build, dipendenze, config |

Esempi:
```
feat(unlim): aggiungi comando vocale "pulisci circuito"
fix(solver): correggi calcolo resistenze parallele con LED
style(dashboard): migliora layout tab progressi
```

## Aree del Codebase

### File che NON devi modificare senza coordinamento
Questi file sono critici e una modifica sbagliata causa regressioni a cascata:

| File | Motivo |
|------|--------|
| `src/components/simulator/engine/CircuitSolver.js` | Cuore del solver, 2500 righe, algoritmo MNA/KCL |
| `src/components/simulator/engine/AVRBridge.js` | Bridge CPU emulation, timing critico |
| `src/components/simulator/engine/PlacementEngine.js` | Posizionamento componenti |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | Canvas SVG principale, 3100+ righe |
| `src/components/simulator/api/simulator-api.js` | API globale `__ELAB_API` |
| `src/components/simulator/utils/pinComponentMap.js` | Mapping pin, Union-Find |
| `vite.config.js` | Build config, chunk splitting |
| `package.json` | Dipendenze — mai aggiungere senza chiedere |

### Aree dove puoi lavorare liberamente
- `src/components/lavagna/` — Redesign lavagna
- `src/components/unlim/` — UNLIM mode UI
- `src/pages/` — Pagine standalone
- `src/styles/` — CSS globali
- `public/` — Asset statici
- `docs/` — Documentazione

## Prima di aprire una PR

### Checklist obbligatoria
```bash
# 1. Test
npm run test:ci

# 2. Build
npm run build

# 3. Nessun file sensibile
# Verifica di NON committare .env, chiavi API, token
```

### Regole qualità
- **Zero warning** nel build (quelli esistenti sono tollerati, nuovi NO)
- **Font minimo 13px** per testi, 10px per label secondarie
- **Touch target minimo 44x44px** per bottoni
- **Palette ELAB**: Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D
- **Target**: bambini 8-14 anni — interfaccia chiara, feedback visivo forte
- **WCAG AA**: contrasto minimo 4.5:1 per testo, 3:1 per elementi grafici
- **No emoji nei componenti UI** — usa SVG (vedi `ElabIcons.jsx`)

## Come usare Claude Code nel progetto

### Setup
1. Installa Claude Code
2. Il file `CLAUDE.md` nella root del progetto dà a Claude tutto il contesto necessario
3. Claude leggerà automaticamente CLAUDE.md all'inizio di ogni sessione

### Regole per Claude Code
- **Sempre** far girare `npm run build` prima di considerare il lavoro finito
- **Mai** modificare file nella lista "coordinamento richiesto" senza parlarne prima
- **Mai** aggiungere dipendenze npm senza approvazione
- **Sempre** verificare che i test passino dopo ogni modifica
- **Mai** creare dati finti o demo — tutto deve funzionare con dati reali

## Gestione Conflitti

Se il tuo branch è in conflitto con `main`:
```bash
git checkout main
git pull origin main
git checkout feature/mia-feature
git rebase main
# Risolvi conflitti
git push --force-with-lease
```

Usa `--force-with-lease` (non `--force`) — protegge da sovrascritture accidentali.

## Setup anti-regressione

Dopo aver clonato il repo, attiva il quality gate:
```bash
git config core.hooksPath .githooks
```

Questo attiva un hook pre-push che **blocca** il push su `main` se il build fallisce.
Ricordati di eseguire anche `npm run test:ci` prima di pushare.
Non si puo' bypassare senza `--no-verify` (che non va MAI usato).

## Contatti
- **Andrea Marro** — lead developer, review obbligatoria per merge su main
