# ELAB Tutor — Mappa Sistema Completa
**Aggiornata**: 2026-04-03 | **Autore**: Claude Code

---

## ARCHITETTURA

```
[Browser] → [Vercel CDN] → [React SPA]
                              ├── Simulatore (CircuitSolver + AVR8js)
                              ├── Lavagna (LavagnaShell + UNLIM)
                              ├── Tutor (ElabTutorV4)
                              ├── Dashboard (Teacher + Student)
                              └── Admin (Gestionale)

[React SPA] → [Supabase Edge Functions] → [Gemini 3.x API]
                                         → [VPS Ollama (Brain)]
                                         → [VPS Voxtral (TTS)]
                                         → [Supabase PostgreSQL]
```

---

## FRONTEND (228 file, ~100K LOC)

### Routes (hash-based, App.jsx)
| Route | Componente | Descrizione |
|-------|-----------|-------------|
| / | VetrinaSimulatore | Landing page pubblica |
| #tutor | LavagnaShell | Redirect a lavagna |
| #lavagna | LavagnaShell | Workspace docente (Principio Zero) |
| #prova | ElabTutorV4 | Demo mode Vol.1 |
| #admin | AdminPage | Pannello admin (password) |
| #teacher | TeacherDashboard | Area docente |
| #dashboard | StudentDashboard | Area studente |
| #login | LoginPage | Autenticazione |
| #register | RegisterPage | Registrazione |

### Componenti principali
| Componente | LOC | File |
|-----------|-----|------|
| NewElabSimulator | ~1900 | simulator/NewElabSimulator.jsx |
| SimulatorCanvas | ~1382 | simulator/canvas/SimulatorCanvas.jsx |
| CircuitSolver | ~1702 | simulator/engine/CircuitSolver.js |
| AVRBridge | ~1051 | simulator/engine/AVRBridge.js |
| ElabTutorV4 | ~2600 | tutor/ElabTutorV4.jsx |
| TeacherDashboard | ~3437 | teacher/TeacherDashboard.jsx |
| LavagnaShell | ~500 | lavagna/LavagnaShell.jsx |

### Servizi (25 file)
| Servizio | Funzione |
|----------|----------|
| api.js | Gateway AI (Anthropic/Gemini) |
| compiler.js | Compilazione Arduino C++ |
| voiceService.js | Web Speech API wrapper |
| voiceCommands.js | 24 comandi vocali IT |
| supabaseSync.js | Sync offline queue |
| unlimMemory.js | Memoria UNLIM cross-session |
| lessonPrepService.js | Preparazione lezioni |
| nudgeService.js | Nudge 4-layer |
| gamificationService.js | Punti e badge |

---

## BACKEND (5 Edge Functions)

### unlim-chat (LIVE)
- Routing: 70% Flash-Lite, 25% Flash, 5% Pro
- RAG: 246 chunk pgvector dai 3 volumi
- Memoria: contesto sessioni passate
- Guard: prompt injection (30 pattern, 6 lingue), rate limit, body size

### unlim-diagnose (LIVE)
- Analisi circuito proattiva
- Fallback: Flash -> Flash-Lite -> Brain VPS
- Output: diagnosi + azioni highlight

### unlim-hints (LIVE)
- Suggerimenti per esperimento/step
- Modello: Flash-Lite

### unlim-tts (503 VPS DOWN)
- Proxy verso Voxtral VPS
- Fallback: browser SpeechSynthesis

### unlim-gdpr (LIVE)
- 4 azioni: consent, status, delete, export
- Auth: sessionId + authToken per delete/export
- Audit log immutabile

---

## DATABASE (12 tabelle)

| Tabella | Scopo |
|---------|-------|
| classes | Classi docente |
| class_students | Associazione studenti-classi |
| student_sessions | Sessioni studente |
| student_progress | Progressi per esperimento |
| mood_reports | Report umore studente |
| nudges | Nudge docente->studente |
| lesson_contexts | Contesto lezione (memoria AI) |
| confusion_reports | Segnalazioni confusione |
| volume_chunks | RAG: 246 chunk + embeddings |
| rate_limits | Rate limiting persistente |
| gdpr_audit_log | Audit trail GDPR |
| parental_consents | Consenso genitoriale Art. 8 |

---

## DATI STATICI

- **62 esperimenti** in 3 volumi (38 + 18 + 6)
- **21 componenti SVG** (LED, resistore, condensatore, etc.)
- **246 chunk RAG** dai volumi Tres Jolie
- **24 comandi vocali** italiani
- **62 welcome messages** per esperimento
- **53 sfide** (giochi didattici)

---

## INFRASTRUTTURA

| Risorsa | URL/IP | Stato |
|---------|--------|-------|
| Vercel (frontend) | elab-builder.vercel.app | LIVE |
| Supabase (backend) | euqpdueopmlllqjmqnyb.supabase.co | LIVE |
| VPS Ollama (Brain) | 72.60.129.50:11434 | LIVE |
| VPS Voxtral (TTS) | 72.60.129.50:8880 | DOWN |
| Gemini API | generativelanguage.googleapis.com | LIVE |
