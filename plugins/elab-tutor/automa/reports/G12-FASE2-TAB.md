# G12 FASE 2 — Tab Nascosti

**Data**: 28/03/2026
**Build**: PASSA (23.37s)

## Cosa è stato fatto

### TutorLayout.jsx
- Aggiunta prop `hideNavigation` (default `false`)
- Quando `true`: nasconde TutorTopBar, TutorSidebar, MobileBottomTabs, Footer
- Il contenuto (simulator) prende tutto lo spazio disponibile

### ElabTutorV4.jsx
- `hideNavigation={activeTab === 'simulator'}` — nasconde navigazione solo sul tab simulatore
- Quando l'utente switcha ad altro tab (via overflow o UNLIM), la navigazione riappare
- Default tab cambiato: `'manual'` → `'simulator'` (sempre, non solo in provaMode)
- Aggiunta prop `onTabChange={setActiveTab}` passata a NewElabSimulator

### MinimalControlBar.jsx
- Aggiunta sezione "Attività" nel menu overflow con accesso a: Manuale, Giochi, Lavagna, Taccuini
- L'utente può switchare tab dall'overflow menu senza navigazione visibile

### NewElabSimulator.jsx
- Riceve e passa `onTabChange` a MinimalControlBar

## Conteggio tab visibili

| PRIMA | DOPO |
|-------|------|
| 5 tab visibili (sidebar + mobile) | 0 tab visibili quando su simulatore |
| TopBar sempre visibile | TopBar nascosta quando su simulatore |
| Footer sempre visibile | Footer nascosta quando su simulatore |

## Principio Zero Gate
"La Prof.ssa vede solo la breadboard e 3 bottoni" — **PASS**
"Può accedere al manuale?" — Sì, via overflow menu → Attività → Manuale — **PASS**
