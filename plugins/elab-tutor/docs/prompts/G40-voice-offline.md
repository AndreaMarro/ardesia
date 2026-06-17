# G40 — VOICE CONTROL + RESILIENZA OFFLINE

**Sprint G** — Quinta sessione
**Deadline PNRR**: 30/06/2026 (53 giorni)
**Score attuale**: 9.5/10 | Target G40: 9.6/10

---

## CONTESTO

### G38+G39 — Principio Zero UX + Landing + Onboarding (completate)
- G38: VolumeChooser skip, hero "Inizia in 3 secondi", welcome contestuali, WCAG fix
- G39: Landing /scuole con tabella comparativa + form contatto + 3 benefit
- G39: Onboarding docente 3 click (lezione pronta / esplora / dashboard)
- G39: SEO basics (meta, OG, structured data, robots.txt)
- Score: 9.0/10
- **G37 (pagination + nudge) ancora da fare — includere in G40 se possibile**

### Questa sessione: Voice + robustezza
Andrea vuole "controllo VOCALE". Attualmente voice e' solo input chat.

---

## FILE ESSENZIALI

| File | Perche' |
|------|---------|
| `src/hooks/useSTT.js` | STT attuale — solo input chat |
| `src/hooks/useTTS.js` | TTS attuale — legge risposte |
| `src/components/unlim/UnlimWrapper.jsx` | Wrapper UNLIM |
| `src/components/unlim/UnlimInputBar.jsx` | Input bar con mic |
| `src/services/compiler.js` | Fallback chain compilatore |

---

## TASK

### Task 1: Quality Gate Pre-Session

### Task 2: Voice Shortcut Commands (1.5h)

**Il problema**: Voice va attraverso chat AI (lento). Comandi semplici dovrebbero essere diretti.

**Cosa fare**:
1. In UnlimWrapper, intercettare testo STT PRIMA di inviare a AI
2. Pattern matching locale per comandi frequenti:
   - "play" / "avvia" / "fai partire" -> api.play()
   - "stop" / "ferma" / "pausa" -> api.pause()
   - "prossimo" / "avanti" / "next" -> api.nextStep()
   - "indietro" / "precedente" -> api.prevStep()
   - "mostra codice" / "editor" -> api.showEditor()
   - "compila" / "compile" -> api.compile()
3. Se non matcha nessun pattern -> invia a AI come prima
4. Feedback vocale TTS: "Fatto!" per comandi diretti
5. Max 15 pattern. Fuzzy match non necessario — match esatto su parole chiave.

### Task 3: Auto-TTS per Risposte UNLIM (45min)

**Cosa fare**:
1. Toggle globale "Leggi risposte" (default: OFF)
2. Quando ON, ogni risposta UNLIM viene letta con TTS automaticamente
3. Icona altoparlante accanto al toggle nell'input bar
4. Se l'utente sta gia' parlando (STT attivo), non avviare TTS (evita feedback loop)
5. Salvare preferenza in localStorage

### Task 4: Service Worker Offline Caching Intelligente (1h)

**Cosa fare**:
1. Verificare che il service worker pre-cachi le risorse essenziali (HTML, CSS, JS chunks principali)
2. Escludere dal precache i chunk lazy (recharts, react-pdf, mammoth) per ridurre precache size
3. Runtime caching per immagini e asset con strategy StaleWhileRevalidate
4. Verificare: aprire app, disabilitare rete -> le pagine base devono caricare
5. UNLIM in offline: mostrare "Offline — posso aiutarti solo con il simulatore" (azioni locali funzionano, chat no)

### Task 5: Compiler Fallback Migliorato (45min)

**Cosa fare**:
1. Aggiungere retry con backoff per remote compile (1 retry dopo 3s)
2. Toast chiaro quando compilazione fallisce: "Server di compilazione non raggiungibile. Prova con il codice predefinito dell'esperimento."
3. Se codice e' uguale al default dell'esperimento -> usare pre-compiled HEX (dovrebbe gia' funzionare ma verificare)

### Task 6: AUDIT FINALE
### Task 7: Handoff + Prompt G41

---

## DELIVERABLE ATTESI G40

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Voice shortcuts | "play", "stop", "avanti" funzionano direttamente |
| 2 | Auto-TTS toggle | Risposte lette ad alta voce (se attivato) |
| 3 | Offline caching | App base carica senza rete |
| 4 | Compiler retry | Retry con backoff + toast chiaro |
| 5 | Score >= 9.6 | Resilienza migliorata |
