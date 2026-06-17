# HANDOFF — Giorno 2 UNLIM Mode (27/03/2026)

---

## COSA È STATO FATTO (con evidenza verificata)

### 1. UnlimInputBar connesso a Galileo API (P0)
- **File**: `src/components/unlim/UnlimWrapper.jsx`
- `handleSend()` chiama `sendChat()` da `src/services/api.js`
- Risposta mostrata come overlay (NON nella chat) — fedele alla visione UNLIM
- AbortController per cancel richieste duplicate
- Contesto esperimento passato: `experimentId` + `experimentContext` (titolo + obiettivo)
- Mascot state: idle → speaking (durante richiesta) → active (risposta)
- Errori gestiti con messaggi user-friendly nell'overlay
- **Testato**: build PASSA, nanobot risponde (15-30s, risposte ancora lunghe)

### 2. LessonPathPanel connesso a percorsi lezione JSON (P0)
- **File**: `src/components/simulator/panels/LessonPathPanel.jsx`
- Nuovo componente `RichLessonPath` — dual rendering:
  - Se esiste JSON ricco (`getLessonPath(id)`) → 5 fasi con contenuto pedagogico completo
  - Se no → fallback al rendering generico originale (6 fasi)
- Progress bar visiva: 📋 PREPARA → 🔧 MOSTRA → ❓ CHIEDI → 👀 OSSERVA → ✅ CONCLUDI
- Ogni fase renderizza: teacher_message, teacher_tip, class_hook, provocative_question
- Common mistakes con risposte pedagogiche
- Analogie evidence-based (Shipstone 1985, Osborne & Freyberg 1985)
- Badge "Percorso UNLIM" per distinguere dai generici
- Obiettivo dell'esperimento visibile in alto
- Prossimo esperimento con preview e bottone carica

### 3. "Monta il circuito per me" (P1) — FIX CRITICO
- Bottone nella fase MOSTRA, stile prominent (navy gradient, 56px minHeight)
- **BUG FIXATO**: il vecchio codice chiamava `addComponent(type, comp)` dove `comp` era l'oggetto JSON intero (`{type, id, value}`) invece di `{x, y}` — tutti i componenti sarebbero finiti impilati a (200, 150)
- **NUOVO**: usa `__ELAB_API.loadExperiment(experimentId)` — l'esperimento v1-cap6-esp1 GIÀ definisce componenti, layout, pinAssignments e wires in experiments-vol1.js
- Se l'esperimento è già caricato, il bottone è un noop (evita doppio caricamento)
- Per esperimenti FUTURI senza definizione preesistente, si potrà ripristinare il pattern addComponent con coordinate corrette

### 4. Queue automa pulita + task percorsi lezione
- 28 task research generici archiviati in `automa/queue/archived-research/`
- 7 nuovi task P0 creati per generare percorsi lezione:
  - v1-cap6-esp2, v1-cap6-esp3, v1-cap7-esp1, v1-cap7-esp2, v1-cap7-esp3, v1-cap8-esp1, v1-cap8-esp2
- Queue: da 41 → 20 task (13 originali + 7 nuovi)

### 5. Deploy
- **Commit**: 8526a26 pushato su main
- **Vercel**: deployato in produzione (HTTP 200)
- **Build**: 20.56s

---

## STATO VERIFICATO FINE SESSIONE

| Elemento | Stato | Evidenza |
|----------|-------|----------|
| Build | ✅ PASSA | 20.56s |
| Git | ✅ Pushato | 8526a26 on main |
| Deploy Vercel | ✅ Produzione | HTTP 200 |
| InputBar → Galileo | ✅ Connesso | sendChat() via AbortController |
| LessonPathPanel | ✅ Connesso | RichLessonPath per JSON, fallback per generici |
| Monta circuito | ✅ Fixato | loadExperiment() invece di broken addComponent |
| Nanobot Render | ⚠️ NON AGGIORNATO | v5.5.0 live, /gdpr-status mancante, risposte lunghe |
| Queue automa | ✅ Pulita | 20 task (7 nuovi percorsi lezione) |
| Automa | ❌ MORTO | Non rilanciato |

---

## COSA NON È STATO FATTO

1. **Deploy nanobot su Render** — le modifiche brevità + /gdpr-status sono nel server.py locale ma non pushate al repo `elab-galileo-nanobot`. Richiede `git push render main`. Rischio: modifica servizio live.
2. **Automa non rilanciato** — serve check manuale
3. **Test end-to-end "Monta il circuito"** — bottone fixato (usa loadExperiment), da verificare nel browser che carichi effettivamente l'esperimento
4. **Teacher Dashboard MVP** — non iniziata (Fase 4)
5. **Risposte nanobot ancora lunghe** — 85 parole vs target <60 (serve deploy brevità)

---

## PRIORITÀ PROSSIMA SESSIONE (Giorno 3)

### P0 — Senza questi il prodotto non avanza
1. **Deploy nanobot su Render** — push al repo `elab-galileo-nanobot`, verificare /gdpr-status e brevità
2. **Verificare "Monta il circuito"** end-to-end — testare che addComponent/addWire piazzino realmente i componenti
3. **Rilancio automa** con task percorsi lezione

### P1 — Migliorano significativamente
4. **Progress bar 5-step sopra il simulatore** (Fase 3 del MASTER-PLAN)
5. **UNLIM proattivo al caricamento** — messaggio "Oggi facciamo..." quando si apre un esperimento
6. **Generare 2-3 percorsi lezione** manualmente (v1-cap6-esp2, v1-cap7-esp1) per avere più test

### P2 — Importanti ma non urgenti
7. **Teacher Dashboard MVP** — scheletro
8. **CSS inline → CSS modules** per componenti UNLIM

---

## FILE CREATI/MODIFICATI

### Modificati (2 file)
- `src/components/unlim/UnlimWrapper.jsx` — handleSend → sendChat(), AbortController, experimentContext
- `src/components/simulator/panels/LessonPathPanel.jsx` — +RichLessonPath component (~230 LOC), getLessonPath import

### Nuovi (8 file)
- `automa/queue/pending/P0-lesson-path-v1-cap6-esp2.yaml`
- `automa/queue/pending/P0-lesson-path-v1-cap6-esp3.yaml`
- `automa/queue/pending/P0-lesson-path-v1-cap7-esp1.yaml`
- `automa/queue/pending/P0-lesson-path-v1-cap7-esp2.yaml`
- `automa/queue/pending/P0-lesson-path-v1-cap7-esp3.yaml`
- `automa/queue/pending/P0-lesson-path-v1-cap8-esp1.yaml`
- `automa/queue/pending/P0-lesson-path-v1-cap8-esp2.yaml`
- `automa/SESSION-HANDOFF-20260327-G2.md` (questo file)

### NON modificati (come da regola)
- CircuitSolver.js, AVRBridge.js, evaluate.py, checks.py — intatti
- ElabTutorV4.jsx — ZERO modifiche
