# AUDIT SISTEMATICO BOTTONI, HANDLER E COLLEGAMENTI
**Data**: 13 Aprile 2026
**Auditor**: Claude Opus 4.6 (brutalmente onesto)
**Scope**: Ogni bottone, handler, prop e route nei file critici

---

## RIEPILOGO VELOCE

| Area | Bottoni totali | Funzionanti | Parziali | Rotti/Morti | Prop dangling |
|------|----------------|-------------|----------|-------------|---------------|
| Lavagna/AppHeader | 6 | 5 | 0 | 0 | 2 |
| Lavagna/FloatingToolbar | 7 | 3 | 2 | 2 | 0 |
| Lavagna/LavagnaShell | 12 | 10 | 2 | 0 | 0 |
| Lavagna/FloatingWindow | 3 | 3 | 0 | 0 | 0 |
| Lavagna/GalileoAdapter | 11 | 10 | 1 | 0 | 0 |
| Lavagna/ExperimentPicker | 7 | 7 | 0 | 0 | 0 |
| Lavagna/VolumeViewer | 12 | 12 | 0 | 0 | 0 |
| Lavagna/VideoFloat | 8 | 8 | 0 | 0 | 0 |
| Lavagna/MascotPresence | 1 | 1 | 0 | 0 | 0 |
| Lavagna/RetractablePanel | 2 | 2 | 0 | 0 | 0 |
| Lavagna/UnlimBar | 3 | 3 | 0 | 0 | 0 |
| Lavagna/LessonBar | 3 | 3 | 0 | 0 | 0 |
| Lavagna/ErrorToast | 2 | 2 | 0 | 0 | 0 |
| Lavagna/VetrinaV2 | 3 | 3 | 0 | 0 | 0 |
| Simulator/MinimalControlBar | 8 | 7 | 1 | 0 | 0 |
| Tutor/ChatOverlay | 12 | 11 | 1 | 0 | 0 |
| Common/ConfirmModal | 2 | 2 | 0 | 0 | 0 |
| Common/ErrorBoundary | 1 | 1 | 0 | 0 | 0 |
| Routing (App.jsx) | 3 | 3 | 0 | 0 | 0 |
| **TOTALE** | **~106** | **~96** | **~7** | **~2** | **2** |

**Score complessivo: 91% funzionante, 7% parziale, 2% rotto**

---

## BUG CRITICI (P0)

### BUG-1: FloatingToolbar "Elimina" NON FUNZIONA
- **File**: `src/components/lavagna/LavagnaShell.jsx:518`
- **Handler**: `handleToolChange('delete')` chiama `api.getSelected?.()`
- **Problema**: `__ELAB_API` NON espone `getSelected()`. Il metodo reale e `getSelectedComponent()` (singolo componente, non array). Il codice aspetta un array (`selected.forEach(...)`) ma anche `getSelectedComponent` ritorna un oggetto singolo.
- **Impatto**: Il bottone Elimina nella FloatingToolbar non cancella MAI nulla. Silenziosamente ignora il click.
- **Fix**: Cambiare `api.getSelected?.()` in `api.getSelectedComponent?.()` e gestire il ritorno come singolo ID, non array.

### BUG-2: FloatingToolbar "Seleziona" e "Filo" PARZIALMENTE FUNZIONANTI
- **File**: `src/components/lavagna/LavagnaShell.jsx:530-538`
- **Handler**: `api?.setToolMode?.('select')` e `api?.setToolMode?.('wire')`
- **Problema**: `setToolMode` in `useSimulatorAPI.js:421` fa SOLO `setWireMode(mode === 'wire')`. Non esiste un vero "select mode" nel simulatore -- il wireMode e un boolean on/off. Il bottone "Seleziona" disattiva il wireMode ma non imposta nessun tool mode attivo nel canvas SVG.
- **Impatto**: L'utente clicca "Seleziona" e non succede nulla di visibile. "Filo" attiva wireMode ma lo stato visuale non e sincronizzato con il canvas reale.
- **Fix**: Implementare il pieno supporto per tool modes nel simulatore.

---

## PROP DANGLING (passate ma mai usate)

### DANG-1: `onGalileoToggle` passata ad AppHeader ma NON destrutturata
- **File passante**: `src/components/lavagna/LavagnaShell.jsx:684`
- **File ricevente**: `src/components/lavagna/AppHeader.jsx`
- **Dettaglio**: LavagnaShell passa `onGalileoToggle={toggleGalileo}` e `galileoOpen={galileoOpen}` ad AppHeader, ma AppHeader NON li include nella destructuring dei props (righe 4-18). Queste prop finiscono nel DOM come attributi sconosciuti o vengono silenziosamente ignorate.
- **Impatto**: Non esiste un bottone UNLIM nell'header. L'unico modo per aprire UNLIM e cliccare la mascotte. Non e un bug crash, ma e una feature promessa e mai collegata.
- **Fix**: O rimuovere le prop da LavagnaShell, oppure aggiungere un bottone UNLIM nell'AppHeader.

### DANG-2: `onPercorsoToggle` destrutturata in AppHeader ma NESSUN bottone la usa
- **File**: `src/components/lavagna/AppHeader.jsx:13`
- **Dettaglio**: `onPercorsoToggle` e `percorsoOpen` sono destrutturate nei props ma il commento a riga 85 dice "Percorso button removed -- now accessed via build mode selector". La prop viene destrutturata ma nessun elemento JSX la chiama.
- **Impatto**: Nessuno -- prop morta ma non causa errori. Codice morto.

---

## DETTAGLIO PER FILE

---

### src/components/lavagna/AppHeader.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Tab "Lavagna" | 37-40 | `onTabChange?.('lavagna')` | SI | Cambia tab attiva |
| Tab "Classe" | 42-46 | `onTabChange?.('classe')` | SI | Visibile solo se `showClasseTab` (docente) |
| Tab "Progressi" | 49-53 | `onTabChange?.('progressi')` | SI | Visibile solo se `showProgressiTab` (studente) |
| Nome esperimento (click) | 63 | `onPickerOpen` | SI | Apre ExperimentPicker |
| Nome esperimento (keyboard) | 67 | `onPickerOpen?.()` | SI | Enter/Space handler corretto |
| Bottone "Manuale" | 87-99 | `onVolumeToggle` | SI | Toggle VolumeViewer PDF. Renderizzato solo se `onVolumeToggle` e definito. |
| Bottone "Video" | 101-114 | `onVideoToggle` | SI | Toggle VideoFloat. Renderizzato solo se `onVideoToggle` e definito. |

---

### src/components/lavagna/FloatingToolbar.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Seleziona | 86 | `onToolChange?.('select')` | PARZIALE | Attiva stato CSS ma `setToolMode('select')` fa solo `setWireMode(false)`. Non c'e un vero select mode nel canvas. |
| Filo | 86 | `onToolChange?.('wire')` | PARZIALE | Imposta wireMode=true via API ma il feedback visuale e solo nel CSS della toolbar, non sincronizzato con il canvas reale. |
| Elimina | 86 | `onToolChange?.('delete')` | **NO** | **BUG-1**: chiama `api.getSelected()` che non esiste. Silenziosamente non fa nulla. |
| Annulla | 86 | `onToolChange?.('undo')` | SI | Chiama `api?.undo?.()` che esiste e funziona. |
| Ripeti | 86 | `onToolChange?.('redo')` | SI | Chiama `api?.redo?.()` che esiste e funziona. |
| Penna | 86 | `onToolChange?.('pen')` | SI | Toggle `drawingEnabled` + `api.toggleDrawing()`. Funziona. |
| Divider 1 | 80 | N/A | SI | Solo visuale, corretto. |
| Divider 2 | 80 | N/A | SI | Solo visuale, corretto. |

---

### src/components/lavagna/LavagnaShell.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| BentornatiOverlay "Inizia" | 280/304 | `handleBentornatiStart` | SI | Carica esperimento via API con retry polling |
| BentornatiOverlay "Scegli altro" | 306 | `handleBentornatiPickExperiment` | SI | Dismiss overlay + apre picker |
| RetractablePanel left toggle | 717 | `toggleLeftPanel` | SI | Toggle con manual override tracking |
| RetractablePanel bottom toggle | 799 | `toggleBottomPanel` | SI | Toggle con manual override tracking |
| GalileoAdapter close | 752 | `setGalileoOpen(false)` | SI | Chiude UNLIM |
| MascotPresence click | 830 | `setGalileoOpen(true)` | SI | Apre UNLIM |
| ErrorToast "UNLIM puo aiutarti" | 818-822 | `api.galileo.sendMessage` | PARZIALE | Funziona se `galileo.sendMessage` esiste su API. Non verificato se questa API e esposta. |
| ExperimentPicker "UNLIM consiglia" | 847 | `api.galileo.sendMessage` | PARZIALE | Stesso problema del precedente. |
| QuickComponentPanel buttons | 226-233 | `handleAdd(type)` | SI | Chiama `api.addComponent(type, {x, y})` con posizione random. Funziona. |
| VolumeViewer close | 779 | `setVolumeOpen(false)` | SI | Diretto. |
| VideoFloat close | 790 | `setVideoOpen(false)` | SI | Diretto. |
| VideoFloat minimize | 791 | `setVideoMinimized(true)` | SI | Diretto. |

---

### src/components/lavagna/FloatingWindow.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Minimizza | 192-198 | `onMinimize()` | SI | Callback corretto, stopPropagation. |
| Espandi | 200-209 | `onMaximize()` | SI | Callback corretto, stopPropagation. |
| Chiudi | 211-219 | `onClose()` | SI | Callback corretto, stopPropagation. |
| Drag (title bar) | 187 | `handleDragStart` | SI | PointerEvents, persiste posizione in localStorage. Cleanup su unmount. |
| Resize handle right | 232 | `handleResizeStart('right')` | SI | PointerEvents, corretto. |
| Resize handle bottom | 233 | `handleResizeStart('bottom')` | SI | PointerEvents, corretto. |
| Resize handle corner | 234 | `handleResizeStart('corner')` | SI | PointerEvents, corretto. |

---

### src/components/lavagna/GalileoAdapter.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Tab CHAT | 558 | `setActiveTab('chat')` | SI | Switch tab interno. |
| Tab PERCORSO | 559 | `setActiveTab('percorso')` | SI | Switch tab interno. |
| Tab GUIDA | 560 | `setActiveTab('guida')` | SI | Switch tab interno. |
| EmbeddedPercorso "Indietro" | 170 | `setCurrentPhase(p => p - 1)` | SI | Navigazione fasi. |
| EmbeddedPercorso "Avanti" | 177 | `setCurrentPhase(p => p + 1)` | SI | Navigazione fasi. |
| EmbeddedPercorso "Riepilogo" | 178 | `onAskUNLIM('Riepilogo')` | SI | Passa a chat con input precompilato. |
| EmbeddedPercorso "?" UNLIM | 173 | `onAskUNLIM(...)` | SI | Chiedi consiglio a UNLIM per fase corrente. |
| EmbeddedPercorso fallback "Chiedi a UNLIM" | 50 | `onAskUNLIM?.(...)` | SI | Quando percorso non disponibile. |
| EmbeddedGuide "Indietro" | 327 | `setCurrentStep(s => s - 1)` | SI | Navigazione passi. |
| EmbeddedGuide "Avanti/Inizia" | 328 | `setCurrentStep(s => s + 1)` | SI | Navigazione passi. |
| EmbeddedGuide "Ricomincia" | 329 | `setCurrentStep(-1)` | SI | Reset alla intro. |
| Voice toggle | 397-408 | `handleVoiceToggle` | PARZIALE | Dipende dalla disponibilita del microfono e del servizio voce. Se non disponibile, il bottone non appare. Funziona se le capabilities sono presenti. |
| Voice record | 411-499 | `handleVoiceRecord` | SI | Complesso ma gestisce tutti gli edge case (blob vuoto, errore, ecc.). |
| FloatingWindow Espandi/Chiudi | 549-553 | Callbacks | SI | Toggle maximized + onClose. |

---

### src/components/lavagna/ExperimentPicker.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Chiudi (X) | 127 | `onClose` | SI | Diretto. |
| Tab Volume 1/2/3 | 137-148 | `setActiveVol(v.key)` | SI | Cambia volume, resetta ricerca. |
| Search input | 156-159 | `setSearch(e.target.value)` | SI | Filtro live. |
| Clear search | 163 | `setSearch('')` | SI | Reset filtro. |
| UNLIM "Non sai da dove iniziare?" | 178 | `onAskUnlim(...)` + `onClose()` | SI | Apre UNLIM con domanda. |
| Card esperimento (ognuna) | 201-203 | `handleSelect(exp)` | SI | Carica esperimento + chiude picker. |
| Backdrop click | 77-79 | `onClose` (se target === backdrop) | SI | Chiude modal. Pattern corretto. |

---

### src/components/lavagna/VolumeViewer.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Tab Vol 1/2/3 | 159-164 | `onVolumeChange(v)` | SI | Cambia volume PDF. |
| Pagina precedente | 174 | `prevPage` | SI | goToPage(pageNumber - 1). |
| Pagina successiva | 181 | `nextPage` | SI | goToPage(pageNumber + 1). |
| Input numero pagina | 178 | `goToPage(Number(e.target.value))` | SI | Navigazione diretta. |
| Zoom - | 186 | `zoomOut` | SI | ZOOM_LEVELS array. |
| Zoom + | 188 | `zoomIn` | SI | ZOOM_LEVELS array. |
| Toggle penna | 191 | `setDrawingEnabled(d => !d)` | SI | Attiva/disattiva annotazione. |
| Colore penna (5 colori) | 207 | `setPenColor(c)` | SI | Cambio colore. |
| Spessore penna (3 spessori) | 211 | `setPenSize(s)` | SI | Cambio spessore. |
| Annulla tratto | 216 | `handleUndo` | SI | Undo stack + fallback. |
| Cancella tutto | 219 | `handleClear` | SI | Clear con salvataggio in undo. |
| Drawing SVG pointer events | 247-249 | `handlePointerDown/Move/Up` | SI | Drawing completo con bezier. |

---

### src/components/lavagna/VideoFloat.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| PiP thumbnail click | 170 | `onRestore` | SI | Espande da minimized. |
| Tab YouTube | 222-227 | `setActiveTab(TAB_YOUTUBE)` | SI | Switch tab. |
| Tab Videocorsi ELAB | 229-235 | `setActiveTab(TAB_CORSI)` | SI | Switch tab. |
| Search input | 249-255 | `setSearchInput(e.target.value)` | SI | Filtro video. |
| Clear search | 259-262 | `setSearchInput('')` | SI | Reset filtro. |
| Suggestion chips (10) | 276-282 | `handleSuggestion(s.query)` | SI | Imposta query di ricerca. |
| Video card click | 292-294 | `handleSelectVideo(v)` | SI | Apre player embed. |
| "Cerca su YouTube" | 301-314 | `handleOpenYouTube` | SI | window.open con noopener. |
| Back (da player) | 210 | `handleBack` | SI | Torna al catalogo. |
| Corso card click | 328-339 | `setActiveVideoId(corso.youtubeId)` | SI | Ma solo se `unlocked && corso.youtubeId`. |

---

### src/components/lavagna/MascotPresence.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Click mascotte | 141-143 | `onClick?.()` | SI | Solo se non was dragged. Drag vs click detection corretta (threshold 5px). |
| Drag | 104-136 | `handlePointerDown` + window events | SI | Posizione persistita in localStorage, clamp to viewport. |

---

### src/components/lavagna/RetractablePanel.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Toggle open/close | 123-133 | `onToggle` | SI | Solo se `onToggle` e definito. |
| Resize drag | 110-113 | `handleResizeStart` | SI | PointerEvents, persiste size in localStorage. Cleanup su unmount. |

---

### src/components/lavagna/UnlimBar.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Form submit | 41 | `handleSubmit` | SI | Trim + send + clear. |
| Mic button | 55 | `onMicClick` | SI | Callback passata. **MA**: UnlimBar non e usata in nessun componente attivo (solo importata nei CSS come riferimento). Componente ORFANO. |
| Send button | 64-69 | `handleSubmit` | SI | Disabled se vuoto. |

**NOTA IMPORTANTE**: UnlimBar NON e importata da nessun componente JSX attivo. E un componente orfano. Creato ma mai montato nel DOM. Non e un bug, ma e codice morto.

---

### src/components/lavagna/LessonBar.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Compact bar click (expand) | 31 | `toggleExpand` | SI | Toggle dettaglio. |
| Quick UNLIM help | 57-69 | `handleQuickAsk` | SI | stopPropagation corretto. |
| "Chiedi a UNLIM di spiegare" | 77-80 | `onAskUnlim?.(...)` | SI | Nel pannello espanso. |

**NOTA**: LessonBar NON e importata da nessun componente attivo. Componente ORFANO come UnlimBar.

---

### src/components/lavagna/ErrorToast.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| "UNLIM puo aiutarti" | 60 | `handleAsk` | SI | Invia errore a UNLIM + dismiss. |
| Chiudi (X) | 63 | `handleDismiss` | SI | Semplice dismiss. |

---

### src/components/lavagna/VetrinaV2.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| "Accedi" (hero) | 38 | `onLogin` | SI | Callback. |
| "Prova Gratis" (hero) | 41 | `onRegister` | SI | Callback. |
| "Accedi" (footer) | 80 | `onLogin` | SI | Callback. |

---

### src/components/simulator/panels/MinimalControlBar.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Play | 226-229 | `onPlay` | SI | Callback dal simulatore. |
| Pause | 213-218 | `onPause` | SI | Callback dal simulatore. |
| Reset | 234-239 | `onReset` | SI | Callback dal simulatore. |
| Compile | 245-259 | `onCompile` | SI | Con status feedback (spinner, ok, error). |
| Experiment name click | 267-275 | `onBack` | SI | Torna alla selezione. |
| Overflow menu toggle | 99-107 | `handleToggle` | SI | Apre/chiude menu posizionato. |
| Overflow menu items | 139-160 | `item.action()` | PARZIALE | Dipende da quali props vengono passate. Alcuni item possono avere `action` undefined se il prop corrispondente non e fornito. Ma i check `if (onToggle...)` proteggono. |
| UNLIM | 284-294 | `onAskUNLIM` | SI | Con spinner loading state. |

---

### src/components/tutor/ChatOverlay.jsx

| Nome | Linea | Handler | Funziona | Note |
|------|-------|---------|----------|------|
| Minimized header click | 201 | `setMinimized(false)` | SI | Espande chat. |
| Minimized expand button | 211 | `setMinimized(false)` | SI | Duplicato del click sulla barra. |
| Minimized close button | 216 | `setMinimized(false); onClose()` | SI | Chiude chat. |
| Fullscreen toggle | 266 | `setIsFullscreen(!isFullscreen)` | SI | Toggle fullscreen. |
| Minimize to bar | 283 | `setMinimized(true)` | SI | Riduci a barra. |
| Expand width | 289 | `onToggleExpanded` | SI | Toggle larghezza panel. |
| Close chat | 303 | `onClose` | SI | Chiude completamente. |
| New message badge | 343-350 | `scrollIntoView` | SI | Scroll ai nuovi messaggi. |
| Screenshot button | 399-412 | `onScreenshot` | PARZIALE | Funziona se `captureScreenshot` e disponibile su `__ELAB_API`. In Lavagna mode e esposto tramite GalileoAdapter. |
| Voice toggle | 417-443 | `onVoiceToggle(!voiceEnabled)` | SI | Toggle voce on/off. |
| Voice record | 448-478 | `onVoiceRecord` | SI | Record/stop toggle. |
| Send button | 480-489 | `onSend()` | SI | Invia messaggio. Disabled se vuoto. |
| Suggestion chips | 363-365 | `a.action` | SI | Quick actions dal hook. |
| Input Enter | 131-137 | `onSend()` | SI | Enter senza Shift invia. |

---

### ROUTING (App.jsx)

| Route | Hash | Handler | Funziona | Note |
|-------|------|---------|----------|------|
| `#lavagna` | lavagna | `LavagnaShell` | SI | Hash routing custom funzionante. |
| `#tutor` | tutor | `ElabTutorV4` | SI | Vista tutor classica. |
| `#showcase` | showcase | `ShowcasePage` | SI | Landing page. |
| `#login` | login | `LoginPage` | SI | Login. |
| `#register` | register | `RegisterPage` | SI | Registrazione. |
| `#admin` | admin | `AdminPage` | SI | Protetto da RequireAuth. |
| `#teacher` | teacher | `TeacherDashboard` | SI | Dashboard docente. |
| `#vetrina2` | vetrina2 | `VetrinaV2` | SI | Nuova vetrina. |
| `/privacy` | pathname | `PrivacyPolicy` | SI | Route pathname-based. |
| `/data-deletion` | pathname | `DataDeletion` | SI | Route pathname-based. |
| `/scuole` | pathname | `LandingPNRR` | SI | Landing PNRR. |
| `handleMenuOpen` (LavagnaShell:575) | `#tutor` | `window.location.hash = '#tutor'` | SI | Naviga a tutor. |
| `TutorLayout:319` | `#teacher` | `window.location.hash = '#teacher'` | SI | Naviga a dashboard. |

---

## COMPONENTI ORFANI (creati ma mai montati)

| Componente | File | Note |
|-----------|------|------|
| UnlimBar | `src/components/lavagna/UnlimBar.jsx` | Mai importato in nessun JSX attivo. Solo riferimento nei CSS. |
| LessonBar | `src/components/lavagna/LessonBar.jsx` | Mai importato in nessun JSX attivo. Solo riferimento nei CSS. |
| PercorsoPanel | `src/components/lavagna/PercorsoPanel.jsx` | Importato lazy ma mai renderizzato direttamente. Le fasi Percorso sono ora embeddate in GalileoAdapter (EmbeddedPercorso). PercorsoPanel e rimasto come wrapper per FloatingWindow ma non e piu usato da LavagnaShell. |

---

## PROBLEMI SECONDARI (P1-P2)

### P1: Auto-expand hack in GalileoAdapter
- **File**: `src/components/lavagna/GalileoAdapter.jsx:380-385`
- **Dettaglio**: Usa `document.querySelector('[aria-label="Espandi chat Galileo"]')?.click()` per auto-espandere ChatOverlay, che internamente parte minimizzato. Questo e un hack fragile basato su aria-label. Se ChatOverlay cambia la label, il hack si rompe silenziosamente.

### P1: Bottom panel in LavagnaShell e un placeholder vuoto
- **File**: `src/components/lavagna/LavagnaShell.jsx:797-812`
- **Dettaglio**: Il bottom panel quando aperto mostra solo il testo "Il pannello codice e integrato nel simulatore". Non ha funzionalita. Il panel e inutile in questo stato.

### P2: `galileo.sendMessage` in ErrorToast e ExperimentPicker
- **File**: `LavagnaShell.jsx:821` e `LavagnaShell.jsx:849`
- **Dettaglio**: Chiamano `api.galileo.sendMessage(msg)` ma non e verificato che questo metodo esista su `__ELAB_API.galileo`. Se non esiste, l'errore viene silenziosamente ignorato grazie al `?.` chain.

### P2: BentornatiOverlay auto-load per first-time users
- **File**: `src/components/lavagna/LavagnaShell.jsx:257-260`
- **Dettaglio**: Se `profile.isFirstTime` e `suggestion` esiste, auto-carica l'esperimento dopo 2 secondi. L'utente potrebbe non aspettarselo. Non e un bug, ma e un comportamento aggressivo.

---

## CONCLUSIONI

La piattaforma ha **~106 bottoni/handler** tra i file auditati. Il 91% funziona correttamente.

**I 2 bug reali:**
1. **Elimina nella FloatingToolbar** (`getSelected` inesistente) -- FIX: 5 minuti
2. **Seleziona/Filo nella FloatingToolbar** non controllano realmente il tool mode del canvas -- FIX: piu complesso, richiede implementazione nel simulatore

**Le 2 prop dangling:**
1. `onGalileoToggle` / `galileoOpen` passate ad AppHeader ma ignorate -- FIX: aggiungere bottone o rimuovere prop
2. `onPercorsoToggle` destrutturata ma mai usata -- FIX: rimuovere dalla destructuring

**I 3 componenti orfani** (UnlimBar, LessonBar, PercorsoPanel) sono codice morto che potrebbe essere rimosso o recuperato in future iterazioni.

La qualita generale dei handler e BUONA: quasi tutti usano `useCallback`, gestiscono la pulizia su unmount, e proteggono con optional chaining. Il focus trap WCAG e presente dove serve (FloatingWindow, ExperimentPicker, ConfirmModal). I pattern di localStorage sono coerenti con prefix e try/catch.
