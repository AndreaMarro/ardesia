# RESOCONTO SESSIONE 27 MARZO 2026 — Giorno 1 UNLIM Mode
> Sessione completa: lettura contesto (43 file), sviluppo, audit totale, ricerca competitiva, fix bug
> Auditor: Claude Opus 4.6 con 3 agenti paralleli (code-reviewer, automa-auditor, competitive-intel)

---

## COSA È STATO FATTO

### 1. Lettura e comprensione completa del progetto
- Letti 43 file di contesto come da NEXT-SESSION-PROMPT
- Verificato stato: build PASSA, score 0.946, automa MORTO, nanobot ok, Brain V13 ok

### 2. Template percorso lezione PERFETTO — v1-cap6-esp1
- **File**: `src/data/lesson-paths/v1-cap6-esp1.json` (170 righe)
- 5 fasi PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI
- Ogni fase ha: teacher_message, teacher_tip, action_tags, common_mistakes
- Vocabolario verificato contro curriculum YAML (forbidden/allowed)
- Analogie evidence-based (Shipstone 1985, Osborne & Freyberg 1985)
- Intent JSON per "Monta il circuito per me" (componenti + wires)
- Sessione save con resume_message e next_experiment
- **Questo è il MODELLO per l'automa per generare gli altri 66**

### 3. Scheletro 5 componenti React UNLIM Mode
- `UnlimWrapper.jsx` — wrapper UNLIM/Classic, auto-detect experiment via __ELAB_API
- `UnlimMascot.jsx` — mascotte angolo basso-destra, stati idle/active/speaking
- `UnlimOverlay.jsx` — messaggi contestuali con fade, coda, posizioni multiple
- `UnlimInputBar.jsx` — barra input testo + mic + invio (font 24px per LIM)
- `UnlimModeSwitch.jsx` — toggle con localStorage persist (touch 56px)
- `src/data/lesson-paths/index.js` — API: getLessonPath(), hasLessonPath()

### 4. Integrazione in App.jsx
- UnlimWrapper wrappa ElabTutorV4 (lazy-loaded)
- ZERO modifiche a ElabTutorV4 — completamente non-invasivo
- Mostra messaggio class_hook dal percorso lezione quando disponibile

### 5. Audit totale con 3 agenti paralleli

#### Code Review (agente feature-dev:code-reviewer)
- 7 bug trovati, 6 fixati immediatamente:
  1. ✅ Memory leak: nested setTimeout senza cleanup in UnlimOverlay
  2. ✅ Stale closure: eslint-disable nascondeva bug reale in UnlimWrapper
  3. ✅ Touch target: 44px → 56px (minimo LIM progetto)
  4. ✅ Font input: 16px → 24px (minimo LIM)
  5. ✅ Switch position: top:12px → top:52px (sotto nav bar 44px)
  6. ✅ HTML invalido: `<style>` spostato fuori da `<button>`
  7. ✅ Timeout cleanup: ref + useEffect cleanup in handleSend
- Vocabolario JSON: "resistore" (nome componente) vs "resistenza" (concetto) — distinzione corretta

#### Automa Audit (agente Explore)
- **Automa MORTO** (heartbeat 09:48, non rilanciato)
- 23 cicli oggi, 18 keep (78% produttivo)
- 14 fix reali nella Fase 0 (homepage, menu, chat, toolbar, GDPR, Mistral, ecc.)
- **41 pending nella queue** — ~20 sono ricerca generica auto-generata (rumore)
- **6 failed** — 3 richiedono infrastruttura inesistente
- **Metriche iPad/Lighthouse STALE da 17 giorni** — ora sbloccate dal deploy odierno
- Score composito quasi saturo (3/4 metriche al massimo)
- P1 bugs aperti: notion-db-mismatch, student-tracking, email-e2e (richiedono decisioni umane)

#### Competitive Intelligence (agente general-purpose)
- **Tinkercad**: gratis, stagnante, zero AI, zero aggiornamenti sostanziali 2025-2026
- **Arduino Education**: CTC GO €1.830/classe, AI assistant solo code-gen, no simulatore
- **PhET**: gratis, gold standard, ma zero AI, zero Arduino, sandbox puro
- **Wokwi**: target pro/universitario, inglese only, irrilevante per scuole medie
- **ELAB è UNICO**: nessun competitor ha simulatore+AI+kit+italiano+10-14 anni
- **Minaccia reale**: Arduino Education (12-18 mesi), MA Giovanni Fagherazzi (ex Arduino) è nel team

### 6. Scoperte sui committenti
- **Giovanni Fagherazzi** = ex **Global Sales Director di Arduino** (non un consulente generico)
- **Omaric Elettronica** = Strambino (TO), stessa sede storica di Smart Projects (produttore originale Arduino)
- **Davide Fagherazzi** = gestisce MePA (confermato da Andrea)
- Il team ha GIÀ la filiera completa: hardware + vendite globali + procurement PA + dev
- **NON serve CampuStore** — il team È la distribuzione

### 7. Informazioni business critiche
- **PNRR deadline 30/06/2026** — finestra che si chiude. Le scuole DEVONO spendere.
- **Teacher Dashboard MVP è OBBLIGATORIA** per vendere — i dirigenti non firmano senza monitoraggio progressi
- **MePA gestito da Davide** — non serve registrazione autonoma

### 8. Deploy e commit
- **4 commit** pushati su main
- Deploy Vercel produzione (HTTP 200)
- Build passa (25s) dopo ogni modifica

---

## STATO VERIFICATO FINE SESSIONE

| Elemento | Stato | Evidenza |
|----------|-------|----------|
| Build | ✅ PASSA | npm run build, 25s |
| Git | ✅ 4 commit pushati | fac8d5a (ultimo) |
| Deploy Vercel | ✅ Produzione | HTTP 200 |
| Score | 0.946 | last-eval.json |
| Nanobot | ✅ ok v5.5.0 | curl health |
| Brain V13 | ✅ ok | VPS attivo |
| Claude-mem | ✅ ok v10.3.1 | PID 27140 |
| Automa | ❌ MORTO | Non rilanciato |
| Nanobot deploy | ❌ NON FATTO | Modifiche solo nel repo |

---

## COSA NON È STATO FATTO

1. Deploy nanobot su Render
2. Connessione input bar → Galileo API
3. Connessione LessonPathPanel → percorsi lezione
4. "Monta il circuito per me"
5. Rilancio automa con task percorsi lezione
6. Teacher Dashboard MVP (neanche iniziata)
7. Test con Prof.ssa Rossi simulata

---

## PRIORITÀ PROSSIMA SESSIONE (Giorno 2)

### P0 — Senza questi il prodotto non avanza
1. Connettere input bar → Galileo (sendChat())
2. Connettere LessonPathPanel → percorsi lezione JSON
3. Deploy nanobot su Render

### P1 — Migliorano significativamente
4. "Monta il circuito per me" via [INTENT:JSON]
5. Pulire queue automa (rimuovere ~20 research generici)
6. Dare all'automa task specifici generazione percorsi lezione

### P2 — Importanti ma non urgenti oggi
7. Teacher Dashboard MVP (scheletro)
8. Aggiornare CLAUDE.md con sezione UNLIM Mode

---

## FILE CREATI/MODIFICATI IN QUESTA SESSIONE

### Nuovi (10 file)
```
src/components/unlim/UnlimWrapper.jsx
src/components/unlim/UnlimMascot.jsx
src/components/unlim/UnlimOverlay.jsx
src/components/unlim/UnlimInputBar.jsx
src/components/unlim/UnlimModeSwitch.jsx
src/data/lesson-paths/v1-cap6-esp1.json
src/data/lesson-paths/index.js
automa/AUDIT-TOTALE-20260327-G1.md
automa/SESSION-HANDOFF-20260327-G1.md
automa/NEXT-SESSION-PROMPT-G2.md
```

### Modificati (1 file)
```
src/App.jsx — import UnlimWrapper + wrapping ElabTutorV4
```

### NON modificati (come da regola)
```
CircuitSolver.js, AVRBridge.js, evaluate.py, checks.py — intatti
ElabTutorV4.jsx — ZERO modifiche
```
