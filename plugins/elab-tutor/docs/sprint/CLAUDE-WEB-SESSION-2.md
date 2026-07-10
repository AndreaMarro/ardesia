# CLAUDE CODE WEB — Sprint 2 Session

> LEGGI TUTTO PRIMA DI FARE QUALSIASI COSA.
> Riunione LUNEDÌ con Omaric + Giovanni Fagherazzi.
> NO DEMO. Tutto deve funzionare con dati REALI.

---

## CREDENZIALI E ENDPOINT

```
# Sito live
https://www.elabtutor.school

# Nanobot Render (AI chat)
POST https://elab-galileo.onrender.com/tutor-chat
POST https://elab-galileo.onrender.com/chat (con immagini)
GET  https://elab-galileo.onrender.com/health

# Supabase Edge Functions (nanobot V2)
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-diagnose
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-hints
POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts

# Supabase DB (progetto sessioni)
URL: https://vxvqalmxqtezvgiboxyv.supabase.co
Anon Key: [REDACTED_JWT]

# Compiler
POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile
Body: {"code": "void setup(){} void loop(){}"}

# Brain VPS (Ollama)
http://72.60.129.50:11434

# Admin ELAB
Accesso: #admin → password [REDACTED-MOVED-TO-ENV]

# Deploy
npx vercel --prod --yes

# Supabase CLI
SUPABASE_ACCESS_TOKEN=sbp_86f... (chiedere ad Andrea se serve)
Project ref nanobot: euqpdueopmlllqjmqnyb
Project ref sessioni: vxvqalmxqtezvgiboxyv
```

---

## REGOLA SUPREMA

**SE UNA COSA SEMBRA FINITA, NON LO È.**
Verifica SEMPRE con prova oggettiva. Mai dare per scontato.

---

## PRINCIPIO ZERO

"Rendere facilissimo per CHIUNQUE spiegare i concetti dei manuali ELAB e spiegarne gli esperimenti SENZA ALCUNA CONOSCENZA PREGRESSA. Arrivi e magicamente insegni."

NON è ELAB che insegna. Il DOCENTE insegna. ELAB e UNLIM sono gli strumenti che rendono il docente immediatamente capace.

---

## COMUNICAZIONE CON TERMINAL

- Terminal sta facendo: **chapter-map UI** (ExperimentPicker.jsx, VetrinaSimulatore.jsx)
- Terminal sta facendo: **audit parità volumi** (legge TRES JOLIE)
- **NON TOCCARE**: ExperimentPicker.jsx, VetrinaSimulatore.jsx, VetrinaSimulatore.module.css, chapter-map.js
- **TUO FILE ESCLUSIVO**: LavagnaShell.jsx, LavagnaShell.module.css
- Aggiorna `docs/sprint/S2-PROGRESS.md` ogni 30 min
- `git pull origin main` prima di ogni commit

---

## I TUOI TASK (8 task, in ordine)

### TASK 1: Flusso "Bentornati" (P0 — il più critico per lunedì)

**Obiettivo**: Il docente apre ELAB → UNLIM dice "Bentornati! Oggi facciamo [esperimento]"

**File**: `src/components/lavagna/LavagnaShell.jsx`

**Implementazione**:
1. Al mount di LavagnaShell, leggi `unlimMemory.getProfile()` per l'ultimo esperimento
2. Leggi il lesson path dell'esperimento successivo: `getLessonPath(nextExpId)`
3. Usa `getDisplayInfo(nextExpId)` da chapter-map.js per il titolo
4. Mostra overlay UNLIM con messaggio tipo: "Bentornati! L'ultima volta avete fatto [titolo]. Oggi vi propongo: [prossimo titolo]"
5. Due bottoni: "Iniziamo!" (carica esperimento) e "Scegli altro" (apre picker)

**Test** (SEVERISSIMI):
```javascript
// tests/unit/lavagna/Bentornati.test.jsx
describe('Flusso Bentornati', () => {
  test('mostra messaggio bentornati quando ci sono sessioni precedenti');
  test('propone il prossimo esperimento basato su lesson-path next_experiment');
  test('NON mostra bentornati alla prima visita (nessuna sessione)');
  test('il bottone "Iniziamo" carica l esperimento proposto');
  test('il bottone "Scegli altro" apre ExperimentPicker');
  test('il messaggio usa il titolo Tea da chapter-map, non l ID interno');
  test('gestisce gracefully se unlimMemory è vuoto');
  test('gestisce gracefully se il prossimo esperimento non esiste');
});
```

**Verifica LIVE**: Apri elabtutor.school su Chrome → al caricamento deve apparire il messaggio.

### TASK 2: Test ScratchXml in Blockly Runtime (P1)

**Obiettivo**: Verificare che i 29 scratchXml funzionino DAVVERO nel Blockly runtime.

**Come**:
1. Leggi `src/data/experiments-vol3.js` — trova tutti gli esperimenti con scratchXml
2. Per ciascuno, verifica che l'XML sia Blockly-valido:
   - Ogni `<block type="...">` usa un tipo registrato in scratchBlocks.js
   - Ogni `<field>` ha un nome valido
   - Le connessioni `<next>`, `<value>`, `<statement>` sono corrette
3. Scrivi test che validano la struttura XML

**Test** (SEVERISSIMI):
```javascript
// tests/unit/scratchXmlValidation.test.js
describe('ScratchXml Validation', () => {
  test('ogni scratchXml è XML valido (parseable)');
  test('ogni block type esiste nei blocchi registrati');
  test('nessun block type sconosciuto');
  test('i pin numbers corrispondono ai componenti dell esperimento');
  test('i delay values sono ragionevoli (non 0, non > 60000)');
  test('gli analog values sono nel range 0-1023');
  test('i pin modes sono validi (INPUT, OUTPUT, INPUT_PULLUP)');
});
```

### TASK 3: Test UNLIM Onniscienza — 30 Domande Reali (P1)

**Obiettivo**: UNLIM deve rispondere correttamente su OGNI esperimento.

**30 domande** (10 per volume):

```bash
# Vol 1 — Le Basi
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cosa serve per accendere il primo LED?","experimentId":"v1-cap6-esp1","sessionId":"test-30q-1"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come funziona il LED RGB? Posso fare il bianco?","experimentId":"v1-cap7-esp3","sessionId":"test-30q-2"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"A cosa serve la resistenza in un circuito LED?","experimentId":"v1-cap6-esp1","sessionId":"test-30q-3"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come funziona un pulsante?","experimentId":"v1-cap8-esp1","sessionId":"test-30q-4"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cos è un potenziometro?","experimentId":"v1-cap9-esp1","sessionId":"test-30q-5"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come funziona il fotoresistore?","experimentId":"v1-cap10-esp1","sessionId":"test-30q-6"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come faccio suonare il cicalino?","experimentId":"v1-cap11-esp1","sessionId":"test-30q-7"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cos è un reed switch?","experimentId":"v1-cap12-esp1","sessionId":"test-30q-8"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cosa succede se metto il LED al contrario?","experimentId":"v1-cap6-esp1","sessionId":"test-30q-9"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Perché servono 3 resistenze diverse per cambiare luminosità?","experimentId":"v1-cap6-esp3","sessionId":"test-30q-10"}'

# Vol 2 — Approfondiamo
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come si usa il multimetro per misurare la tensione?","experimentId":"v2-cap3-esp1","sessionId":"test-30q-11"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cosa sono i resistori in parallelo?","experimentId":"v2-cap4-esp1","sessionId":"test-30q-12"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cosa succede se metto 2 batterie in serie?","experimentId":"v2-cap5-esp1","sessionId":"test-30q-13"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come funziona un condensatore?","experimentId":"v2-cap7-esp1","sessionId":"test-30q-14"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cos è un transistor MOSFET?","experimentId":"v2-cap8-esp1","sessionId":"test-30q-15"}'
# ... +5 domande Vol2

# Vol 3 — Arduino
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come funziona il Blink?","experimentId":"v3-cap5-esp1","sessionId":"test-30q-21"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cosa fa digitalWrite?","experimentId":"v3-cap6-esp2","sessionId":"test-30q-22"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come faccio il codice Morse con Arduino?","experimentId":"v3-cap6-morse","sessionId":"test-30q-23"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Cos è analogRead?","experimentId":"v3-cap7-esp1","sessionId":"test-30q-24"}'
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" -H "Content-Type: application/json" -d '{"message":"Come funziona il PWM?","experimentId":"v3-cap7-esp4","sessionId":"test-30q-25"}'
# ... +5 domande Vol3
```

**Per ogni risposta valuta**:
- Risponde alla domanda? (SI/NO)
- Linguaggio 10-14 anni? (SI/NO)
- Usa analogie quotidiane? (SI/NO)
- Inventa cose false? (SI/NO — GRAVE)
- Cita componenti corretti? (SI/NO)

**Output**: `docs/sprint/AUDIT-UNLIM-30-DOMANDE.md`

### TASK 4: Audit UX su Chrome Reale (P1)

Apri https://www.elabtutor.school e testa TUTTO il flusso docente.
Usa Control Chrome MCP o screenshot.

**Checklist severissima**:
- [ ] Homepage carica in < 3s
- [ ] Si vedono i 3 volumi
- [ ] Scegliere Vol1 mostra gli esperimenti
- [ ] Aprire v1-cap6-esp1 carica il simulatore
- [ ] La breadboard è visibile e componenti posizionati
- [ ] "Monta passo passo" (voce o UI) → buildSteps partono
- [ ] Ogni buildStep aggiunge un componente nella posizione corretta
- [ ] Compilazione funziona (se c'è codice)
- [ ] Scratch si apre per Vol3
- [ ] UNLIM risponde a domande via chat
- [ ] Report fumetto si genera
- [ ] Il sito funziona su iPad (responsive)

**Output**: `docs/sprint/AUDIT-UX-CHROME.md` con screenshot per ogni step

### TASK 5: BuildSteps Qualità — Confronto con Volumi (P1)

Leggi i volumi nella cartella TRES JOLIE e confronta con i buildSteps nel codice:
- `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/`
- `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/`
- `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/`

Per ALMENO 10 esperimenti: il buildStep dice la stessa cosa del volume?

**Output**: `docs/sprint/AUDIT-BUILDSTEPS-VS-VOLUMI.md`

### TASK 6: Compiler + Arduino E2E Test (P2)

```bash
# Test compilazione reale
curl -s -X POST "https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile" \
  -H "Content-Type: application/json" \
  -d '{"code":"void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);delay(1000);digitalWrite(13,LOW);delay(1000);}"}'
```

Verifica che la compilazione produca HEX valido per ALMENO 5 sketch diversi (blink, fade, serial, pulsante, potenziometro).

### TASK 7: Scrivi 200+ test nuovi (P2)

Target: da 2110 a 2300+ test. Concentrati su:
- Test per il flusso "bentornati" (task 1)
- Test per validazione scratchXml (task 2)
- Test E2E Playwright aggiuntivi
- Test per ogni voiceCommand (36 comandi, serve test per ognuno)

### TASK 8: Regression Gate Finale (P0)

DOPO ogni task, esegui:
```bash
npx vitest run                    # >= 2110 test, 0 fail
npm run build                     # PASS, no errori
gh run list --limit 1             # CI verde
```

Se QUALSIASI gate fallisce: **FERMA TUTTO** e fixa.

---

## LINGUAGGIO DI UNLIM

UNLIM parla come un amico esperto che spiega le cose a un ragazzino di 10-14 anni:
- Analogie quotidiane: "il resistore è come un tubo stretto per l'acqua"
- Mai pedante, mai professorale
- "Non lo so" quando non sa
- Incoraggiante ma onesto
- ITALIANO semplice
- Mai termini tecnici senza spiegazione

---

## VERIFICA FINE SESSIONE

Prima di dichiarare "finito":
```
## Prova Oggettiva Sessione
- Test: npx vitest run → [N] pass, 0 fail
- Build: npm run build → PASS
- CI: gh run list → [status]
- Flusso bentornati: [funziona? screenshot]
- Scratch testato: [quanti XML validati]
- UNLIM 30 domande: [score X/30]
- Chrome audit: [screenshot flusso completo]
```
