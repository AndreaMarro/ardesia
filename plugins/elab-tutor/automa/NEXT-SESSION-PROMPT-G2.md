# PROMPT PROSSIMA SESSIONE — Copia TUTTO qui sotto in una nuova sessione Claude Code

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 2 del piano 2 settimane per UNLIM Mode.

## TASK
Continua il lavoro dal Giorno 1 (27/03/2026). Lo scheletro UNLIM Mode esiste.
Ora CONNETTI tutto: input bar → Galileo, percorso lezione → LessonPathPanel,
"Monta il circuito per me" → [INTENT:JSON], deploy nanobot su Render.

Prima di qualsiasi azione, leggi TUTTI i file nella sezione CONTEXT FILES.
Poi verifica stato (build, deploy, score, automa).
Poi lavora sugli obiettivi del Giorno 2.
Massima onestà. Usa superpowers. CoV su tutto.

## CONTEXT FILES — LEGGI PRIMA DI TUTTO (in ordine)

### A. Handoff e stato
1. automa/SESSION-HANDOFF-20260327-G1.md — cosa è stato fatto nel Giorno 1
2. automa/AUDIT-TOTALE-20260327-G1.md — audit completo con score card e problemi
3. automa/MASTER-PLAN.md — piano 2 settimane con Fasi 0-4

### B. Componenti UNLIM (creati Giorno 1 — DA CONNETTERE)
4. src/components/unlim/UnlimWrapper.jsx — wrapper UNLIM/Classic, auto-detect experiment
5. src/components/unlim/UnlimMascot.jsx — mascotte con stati
6. src/components/unlim/UnlimOverlay.jsx — messaggi contestuali
7. src/components/unlim/UnlimInputBar.jsx — barra input (DA CONNETTERE a Galileo)
8. src/components/unlim/UnlimModeSwitch.jsx — toggle con localStorage
9. src/data/lesson-paths/v1-cap6-esp1.json — template percorso lezione perfetto
10. src/data/lesson-paths/index.js — API getLessonPath()

### C. File da connettere
11. src/components/simulator/panels/LessonPathPanel.jsx — 668 LOC, DA CONNETTERE ai percorsi lezione
12. src/components/tutor/ElabTutorV4.jsx — componente principale (non modificare se possibile)
13. src/services/api.js — sendChat(), le API per Galileo
14. src/components/tutor/ChatOverlay.jsx — chat attuale (da nascondere in UNLIM Mode)

### D. Nanobot (DA DEPLOYARE)
15. nanobot/server.py — backend con Mistral + brevità + /gdpr-status
16. nanobot/prompts/tutor.yml — prompt Galileo (max 3 frasi, 60 parole)
17. nanobot/prompts/shared-optimized.yml — regole Gulpease

### E. Contesto immutabile
18. automa/context/PRODUCT-VISION.md — bussola
19. automa/context/UNLIM-BRAIN-DESIGN.md — cervello pedagogico
20. automa/context/teacher-principles.md — pedagogia
21. automa/context/volume-path.md — 3 volumi, vocabolario progressivo

### F. Automa (da pulire e rilanciare)
22. automa/state/state.json — stato loop
23. automa/state/shared-results.md — output task
24. automa/curriculum/v1-cap6-esp1.yaml — curriculum YAML di riferimento

## OBIETTIVI GIORNO 2

### 1. Connettere UnlimInputBar → Galileo API (P0)
- In UnlimWrapper.handleSend, chiamare sendChat() da src/services/api.js
- Mostrare la risposta come UnlimOverlay (NON nella chat)
- Gestire isLoading nel mascot state (speaking → idle)
- Testare: scrivi "cos'è un LED?" → risposta overlay ≤3 frasi

### 2. Connettere LessonPathPanel ai percorsi lezione (P0)
- LessonPathPanel.jsx deve leggere da getLessonPath(experimentId)
- Renderizzare i 5 step: PREPARA → MOSTRA → CHIEDI → OSSERVA → CONCLUDI
- Ogni step mostra: teacher_message + teacher_tip + azioni disponibili
- Progress bar visibile: ● PREPARA ○ MOSTRA ○ CHIEDI ○ OSSERVA ○ CONCLUDI
- Testare: apri v1-cap6-esp1 → pannello mostra percorso con 5 step

### 3. "Monta il circuito per me" (P1)
- Bottone nella fase MOSTRA che esegue build_circuit.intent dal JSON
- Usa __ELAB_API per piazzare componenti e fili
- Testare: clicca "Monta" → circuito appare sulla breadboard

### 4. Deploy nanobot su Render (P1)
- Verificare che le modifiche Mistral + brevità funzionano localmente
- Push su Render
- Verificare /health, /gdpr-status, test 3 domande brevità

### 5. Pulire queue automa e dare task percorsi lezione (P2)
- Rimuovere ~20 research-*.yaml generici dalla queue pending
- Creare task specifici per generare percorsi lezione v1-cap6-esp2, v1-cap6-esp3, v1-cap7-esp1, ecc.
- Rilanciare l'automa se morto

## BUGS GIÀ FIXATI (Giorno 1 — NON rifare)
- [x] UnlimOverlay: clearTimeout nested setTimeout — FIXATO (commit fac8d5a)
- [x] UnlimWrapper: showMessage stale closure — FIXATO
- [x] UnlimWrapper: handleSend timeout senza cleanup — FIXATO (ref + useEffect)
- [x] Touch target 44px → 56px — FIXATO
- [x] Font input 16px → 24px — FIXATO
- [x] Switch position top:12px → top:52px — FIXATO
- [x] `<style>` dentro `<button>` — FIXATO (Fragment)

## BUGS RESIDUI
- [ ] CSS: inline styles → CSS modules per consistenza (bassa priorità)
- [ ] Mascotte è una "U" — serve SVG/immagine reale (P2)

## CONTESTO BUSINESS CRITICO (scoperto sessione 27/03)
- **Giovanni Fagherazzi** = ex Global Sales Director di ARDUINO (non consulente generico)
- **Omaric Elettronica** = Strambino (TO) = stessa sede storica Smart Projects (produttore originale Arduino)
- **Davide Fagherazzi** = gestisce MePA/procurement PA
- Il team ha GIÀ la filiera: hardware (Omaric) + vendite (Giovanni) + procurement (Davide) + dev (Andrea)
- NON serve CampuStore — il team È la distribuzione
- **PNRR deadline 30/06/2026** — finestra che si chiude. Scuole DEVONO spendere.
- **Teacher Dashboard MVP è OBBLIGATORIA** per vendere alle scuole
- **Minaccia reale**: Arduino Education (12-18 mesi). MA Giovanni è nel team ELAB.
- Il prodotto deve essere all'altezza di chi ha gestito le vendite globali di Arduino.

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy Vercel: `npx vercel --prod --yes`
- Sito: https://www.elabtutor.school
- Nanobot: https://elab-galileo.onrender.com/health
- Brain VPS: http://72.60.129.50:11434
- Score: 0.946 (composite)
- Palette: Navy #1E4D8C, Lime #7CB342
- Test: "La Prof.ssa Rossi lo capirebbe in 5 secondi?"
- Claude-mem: http://localhost:37777/api/health (ok v10.3.1)

## RULES
1. Leggi SESSION-HANDOFF-G1 e RESOCONTO prima di tutto — non ripetere lavoro già fatto
2. Non toccare CircuitSolver, AVRBridge, evaluate.py, checks.py
3. Build DEVE passare dopo ogni modifica
4. Massima onestà — se qualcosa non funziona, dillo
5. Committi e pusha spesso
6. Il test è sempre: "La Prof.ssa Rossi lo capirebbe in 5 secondi?"
7. Il prodotto UNLIM non funziona ancora — siamo al Giorno 2 di 14
8. Deploy Vercel dopo ogni gruppo di fix significativo
9. Il prodotto deve impressionare un ex Global Sales Director di Arduino
10. La finestra PNRR si chiude il 30/06/2026 — ogni giorno conta

## PLAN
1. Leggi tutti i file di contesto (NON rileggere i 43 del Giorno 1 — solo handoff + resoconto + nuovi)
2. Verifica stato: build, deploy, score, automa
3. Connetti input bar → Galileo API (sendChat da src/services/api.js)
4. Connetti LessonPathPanel → percorsi lezione JSON
5. Implementa "Monta il circuito per me" via [INTENT:JSON]
6. Deploy nanobot su Render
7. Pulisci queue automa (rimuovi ~20 research generici) + dai task percorsi lezione
8. Audit + CoV con superpowers
9. Scrivi SESSION-HANDOFF per Giorno 3

## OUTPUT
Alla fine della sessione:
- Input bar connesso a Galileo (risposta come overlay)
- LessonPathPanel renderizza 5 step per v1-cap6-esp1
- "Monta il circuito per me" funziona per 1 esperimento
- Nanobot deployato su Render con Mistral + brevità
- Queue automa pulita + task percorsi lezione
- Tutto committato e pushato
- SESSION-HANDOFF scritto per Giorno 3
```
