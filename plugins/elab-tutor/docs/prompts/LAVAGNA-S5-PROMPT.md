# SESSIONE LAVAGNA S5/8 — Dashboard Docente come Tab nello Shell

## Stato Ereditato da S4
Score S4: ~7.5/10 (onesto, non inflato)
Build: PASS | Test: 1008/1008 | Precache: 33 entries 4009KB

### Completato in S4:
- ExperimentPicker: 3 volumi, 62 esperimenti, ricerca, click→carica (VERIFICATO BROWSER)
- LavagnaStateManager: 5 stati auto-panel (CLEAN/BUILD/CODE/RUN/STUCK)
- Mobile fix: header center visibile a tutte le viewport
- 3 commit, zero regressioni, #tutor intatto

### Debiti Tecnici:
- FloatingWindow drag/resize non stress-testato
- State machine non osservabile visivamente (transizioni non testate nel browser)
- Welcome screen simulatore bypassa solo via localStorage
- ConsentBanner key: 'elab_gdpr_consent' (documentato)

## TASK S5

### Task 5.1: Tab "Classe" nella AppHeader
- Aggiungere tab "Classe" visibile SOLO per ruolo docente
- Due tab: [Lavagna] [Classe] — stile segmented control
- Click "Classe" → body cambia a dashboard docente
- Click "Lavagna" → torna al simulatore (stato PRESERVATO)

### Task 5.2: Wrappare TeacherDashboard nello shell
- Creare DashboardAdapter.jsx in lavagna/
- Importa TeacherDashboard (lazy) SENZA modificarlo
- Monta nel body dello shell quando tab = "Classe"
- Il simulatore RESTA montato (display:none) per preservare stato

### Task 5.3: Transizione animata Lavagna ↔ Classe
- Fade 200ms tra le due viste
- Stato simulatore preservato (non rimontato)

### Task 5.4: AUDIT 1/3

### Task 5.5: Dashboard studente come drawer/tab
- Tab "I Miei Progressi" per ruolo studente
- Wrappare StudentDashboard SENZA modificarlo

### Task 5.6: AUDIT 1/2

### Task 5.7: Test: switch tab, dati preservati, ritorno alla lavagna intatto
### Task 5.8: Touch test iPad su dashboard
### Task 5.9: AUDIT FINALE + generare S6 prompt

## BENCHMARK TARGET S5: >= 7.5/10
