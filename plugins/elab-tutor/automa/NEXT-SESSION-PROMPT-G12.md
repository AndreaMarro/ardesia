# G12 MARATHON — "RESPIRA" (Progressive Disclosure)

Data: [INSERISCI DATA]. Durata: Sessione lunga. Principio Zero: L'insegnante arriva alla LIM e spiega IMMEDIATAMENTE — lo schermo deve RESPIRARE. REGOLA ASSOLUTA: ZERO refactoring interni. ZERO admin panel. ZERO dead code cleanup. Tutto cio' che fai deve cambiare l'esperienza dell'insegnante. Prodotto: ELAB Tutor + Kit fisici + Volumi = UN UNICO PRODOTTO. Linguaggio 10-14 anni.

CONTESTO CRITICO — Score insegnante: 5.7/10 (mega-audit G11). UNLIM vision: 5% realizzata. 28 bottoni nella toolbar. 8 tab visibili. La visione dice "minimale". Il prodotto e' l'opposto. Questa sessione CORREGGE questo.

STATO — Build: PASSA. PWA: 19 entries (4.1 MB). alert(): 0. borderColor: 0. #prova funziona. Lesson paths: 62/67. Deploy: non fatto.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. automa/reports/G11-MEGA-AUDIT-ONESTO.md (i numeri reali). 4. automa/context/UNLIM-VISION-COMPLETE.md (la bussola). 5. automa/PIANO-2-SETTIMANE.md (il piano). 6. Questo prompt.

FASE 0: Bootstrap (15 min). Verifica: npm run build PASSA. Screenshot homepage PRIMA delle modifiche — conta bottoni e tab visibili. Scrivi automa/reports/G12-AUDIT-INIZIALE.md con: numero bottoni toolbar, numero tab, screenshot.

FASE 1: ControlBar Minimale (2-3 ore) ★ CRITICO. Obiettivo: Da 28 bottoni a 3. I 3 bottoni che restano: (1) ▶ Play/Pause — grande, lime. (2) Nome esperimento — cliccabile per cambiare. (3) UNLIM mascotte. Tutto il resto in menu overflow "⋯" organizzato per sezioni (Strumenti, Modifica, Avanzato, Aiuto). Approccio: Crea MinimalControlBar.jsx che wrappa ControlBar. Prop minimalMode={true} default in UNLIM mode. NON eliminare bottoni — nascondili. Il menu overflow si apre con click, si chiude cliccando fuori. Plugin: /frontend-design per il menu overflow, /writing-plans per l'approccio, /architecture. Checkpoint: automa/reports/G12-FASE1-TOOLBAR.md. Verifica screenshot PRIMA vs DOPO. Build PASSA.

FASE 2: Tab Nascosti (1-2 ore). Obiettivo: Da 8 tab a 0 tab visibili. Il simulatore e' a schermo pieno all'apertura. Gli altri tab si attivano via UNLIM ("mostrami il manuale", "giochiamo a Trova il Guasto") o via menu overflow. Approccio: In TutorLayout.jsx, nascondi la tab bar in UNLIM mode. I tab si attivano con setActiveTab() (gia' esposto). L'azione [AZIONE:opentab:xxx] funziona gia'. Checkpoint: automa/reports/G12-FASE2-TAB.md. Verifica: simulatore a schermo pieno, zero tab visibili.

FASE 3: Sidebar Pulita (1 ora). In UNLIM mode, sidebar mostra LessonPathPanel se esperimento caricato. ExperimentPicker solo su richiesta. Sidebar chiusa su tablet. Checkpoint: automa/reports/G12-FASE3-SIDEBAR.md.

FASE 4: fontSize Fix (1 ora). 54 istanze fontSize < 14px → 0 nel tutor/simulatore visibile. Grep per fontSize 10-13. Sostituisci con 14px minimo. Escludi code editor e admin. Checkpoint: automa/reports/G12-FASE4-FONTS.md.

FASE 5: Verifica + CoV (1-2 ore). Layer 1: Build (npm run build). Layer 2: Screenshot confronto PRIMA/DOPO. Layer 3: Principio Zero — #prova → breadboard grande, 3 bottoni, barra input, LED funziona. Layer 4: CoV 3 agenti (Prof.ssa Rossi, Bug Hunter, Vision Check). Layer 5: Score — bottoni 28→3, tab 8→0, fontSize 54→0. Scrivi: automa/reports/G12-VERIFICA-FINALE.md, automa/reports/G12-SCORES.md. Aggiorna: STATE.md, handoff.md, session-summaries.md.

TARGET: Bottoni 28 → 3 (★★★). Tab 8 → 0 (★★★). fontSize violations 54 → 0 (★★). Score LIM/iPad 4.0 → 6.0 (★★). Lo schermo RESPIRA.

REGOLE: Onesta' — se fa schifo dillo. ZERO refactoring interni. Principio Zero — "La Prof.ssa riuscirebbe?". Se ci sono piu' di 3 elementi visibili nella toolbar, HAI FALLITO. Build gate dopo ogni fase.
