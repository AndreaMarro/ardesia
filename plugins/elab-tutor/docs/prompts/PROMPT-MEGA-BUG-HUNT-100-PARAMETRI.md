# ELAB Tutor — Mega Bug Hunt & 100-Parameter Benchmark

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Trovare OGNI bug, regressione, problema UX, violazione WCAG, errore logico, dead code, e inconsistenza in tutto il sistema ELAB Tutor (232 file sorgente). Produrre un benchmark a 100 parametri brutalmente onesto. La sessione SUCCESSIVA usera questi risultati per allineare la piattaforma ai volumi fisici.

**Architecture:** Audit sistematico in 10 fasi parallele. Ogni fase usa skill dedicate + agenti. Nessun file ignorato. Ogni bug documentato con file:riga, severita, e fix proposto.

**Tech Stack:** React 19 + Vite 7, avr8js, Supabase Edge Functions, Gemini API, Web Speech API, react-pdf, Blockly

---

## CONTESTO OBBLIGATORIO — LEGGI PRIMA DI TUTTO

- CLAUDE.md — architettura, regole immutabili
- docs/AUDIT-RALPH-LOOP-RESULTS.md — audit precedente (score 7.0/10, 20 dimensioni)
- .claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md — indice memoria
- automa/context/teacher-principles.md — Principio Zero

## REGOLE FERREE

1. ENGINE INTOCCABILE: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js
2. ZERO INFLATING: MAI auto-assegnare score >7 senza evidenza runtime
3. ZERO REGRESSIONI: npm run build + npx vitest run DEVONO passare dopo ogni fix
4. UN FIX ALLA VOLTA: test prima e dopo, mai bundle multipli fix
5. DOCUMENTA TUTTO: ogni bug in tabella con file:riga, severita P0-P3, evidenza
6. BUILD GATE: se il build fallisce, STOP e fix PRIMA di continuare
7. CoV ogni 15 minuti: rileggi cosa hai fatto, verifica che sia corretto

---

## FASE 0: SETUP — Quality Gate + Dev Server

## FASE 1: SYSTEMATIC DEBUGGING ogni componente (usa /systematic-debugging)
- 1.1 Simulatore (16 file): NewElabSimulator, SimulatorCanvas, DrawingOverlay, WireRenderer, CodeEditorCM6, ScratchEditor, ExperimentGuide, LessonPathPanel, SerialMonitor, ComponentPalette, ComponentDrawer, NanoR4Board, Led, BreadboardFull, useCircuitHandlers, useSimulatorAPI
- 1.2 Lavagna (15 file): LavagnaShell, AppHeader, FloatingWindow, FloatingToolbar, RetractablePanel, GalileoAdapter, VolumeViewer, ExperimentPicker, useGalileoChat, PercorsoPanel, MascotPresence, VideoFloat, LavagnaStateManager, ErrorToast, UnlimBar
- 1.3 Tutor (15 file): ElabTutorV4, ChatOverlay (1729KB chunk — WHY?), TutorLayout, CircuitDetective, CircuitReview, PredictObserveExplain, ReverseEngineeringLab, SafeMarkdown, ReflectionPrompt
- 1.4 UNLIM (7 file): UnlimWrapper, UnlimInputBar, UnlimMascot, UnlimReport, UnlimOverlay, UnlimModeSwitch
- 1.5 Servizi (25 file): api.js, gdprService, licenseService, supabaseSync, unlimMemory, studentService, voiceCommands, voiceService, nudgeService, simulator-api, lessonPrepService, compiler, supabaseClient, supabaseAuth
- 1.6 Data (8 file): experiments-vol1/2/3, lesson-paths, broken-circuits, mystery-circuits, poe-challenges, unlim-knowledge-base

## FASE 2: CODE REVIEW (usa /code-review e /coderabbit:review)
- 2.1 Security: XSS (raw HTML injection), SQL injection, CSRF, secrets esposti, CSP, CORS
- 2.2 React Anti-Pattern: useEffect senza cleanup, stale closure, inline objects, key=index
- 2.3 Performance: chunk >1MB, lazy loading mancante, immagini, font, CSS inline residui

## FASE 3: FRONTEND DESIGN REVIEW (usa /frontend-design)
- 3.1 Visual Consistency: palette, font, spacing, border-radius, shadow
- 3.2 WCAG AA: contrasto, touch 44x44, focus ring, aria, alt, heading hierarchy, keyboard
- 3.3 Responsive: 320px, 768px, 1024x768, 1920px

## FASE 4: EXPERIMENT DATA INTEGRITY
- 4.1 Vol1 38/38, 4.2 Vol2 27/27, 4.3 Vol3 26/26 (fix v3-cap6-esp1!)

## FASE 5: RUNTIME BROWSER TEST (preview tools)
- Happy path docente (10 passi), studente (5 passi), edge cases (10 scenari)

## FASE 6: BACKEND AUDIT (Supabase Edge Functions)

## FASE 7: TEST SUITE HEALTH

## FASE 8: BUILD & DEPLOY HEALTH

## FASE 9: SKILLS ELAB PARALLELE
Lancia: /elab-quality-gate /ricerca-bug /analisi-simulatore /lim-simulator /impersonatore-utente /elab-nanobot-test /analisi-galileo /lavagna-benchmark /quality-audit /analisi-statistica-severa

## FASE 10: BENCHMARK 100 PARAMETRI

A. SIMULATORE (1-20): KCL, PWM, AVR boot, Serial, Wire, Current flow, Multi-select, Copy/Paste, Undo/Redo, Zoom, Snap, Pin collision, Drag smooth, PNG export, Multimeter, Servo, LCD, BOM, Annotation, Shortcuts

B. LAVAGNA UX (21-35): AppHeader, FloatingWindow drag/resize/z-index, FloatingToolbar sync, RetractablePanel, ExperimentPicker search/3vol, PercorsoPanel 5fasi, Mascot click, ErrorToast bridge, Principio Zero, State machine, Sidebar gate, Bottom panel

C. UNLIM AI (36-50): Chat response, Word cap, Socratic, Context injection, Rate limit, Content filter, AZIONE play/highlight, Implicit fallback, Lesson prep, Screenshot, Retry, Slow indicator, Voice STT/TTS

D. CONTENUTO PEDAGOGICO (51-65): Vol1-3 esperimenti, lesson paths, Scratch categorie/codegen, Concept graph, Difficulty, Quiz, Vocabulary, Broken circuits, Knowledge base

E. PDF & ANNOTAZIONI (66-75): PDF load/nav/zoom, Penna colori/spessori/bezier, Persist per-page, Undo, Clear, DrawingOverlay persist

F. SICUREZZA & GDPR (76-85): CSP, XSS, Age check, Data deletion, Consent storage, License, Admin, Rate limit, Content filter, Secrets

G. PERFORMANCE & BUILD (86-95): Build time, Bundle, Chunks, PWA, Offline, First paint, 15-comp perf, Memory leak, Font preload, Image opt

H. RESPONSIVE & ACCESSIBILITA (96-100): LIM, Mobile, Tablet, Focus ring, Screen reader

---

## OUTPUT ATTESO

1. docs/BENCHMARK-100-PARAMETRI.md — tabella completa con 100 score
2. docs/BUG-LIST-COMPLETA.md — OGNI bug trovato con file:riga, P0-P3, fix proposto
3. Tutti i bug P0 e P1 FIXATI nel codice
4. Build PASS + test PASS dopo tutti i fix
5. Score composito finale onesto
