# SESSION 47 — VERIFICA E FIX COMPLETA (Copia-Incolla questo prompt)

---

## PROMPT

Sei in Session 47 di ELAB. Il tuo UNICO obiettivo e' verificare TUTTO il lavoro fatto nella Session 46 e fixare ogni problema trovato. Zero scuse, zero "lo verifichera' l'utente", zero "sembra ok". DEVI VEDERE CON I TUOI OCCHI.

### REGOLE CATEGORICHE ASSOLUTE

1. **NON CHIEDERE MAI CONFERMA** — Esegui tutto in loop autonomo. Se trovi un bug, fixalo. Se il fix rompe qualcosa, fixa anche quello. Continua finche' tutto e' verde.
2. **NON USARE AGENTI** — Zero Task tool, zero subagent. Fai tutto tu nel contesto principale.
3. **USA CLAUDE IN CHROME** per OGNI verifica visiva — apri il sito, fai screenshot, leggi la pagina. Non fidarti MAI del codice sorgente da solo.
4. **USA I PREVIEW TOOLS** per ELAB Tutor — avvia il dev server, fai snapshot, screenshot, inspect CSS. Verifica OGNI cambiamento nel browser.
5. **SCRIVI UN TodoWrite** con TUTTI i check prima di iniziare. Aggiornalo in tempo reale. MAI lasciare un todo in_progress se hai finito.
6. **LEGGI MEMORY.md** prima di fare qualsiasi cosa. Conosci i punteggi, i bug noti, le decisioni prese.
7. **DOPO OGNI FIX**: rebuild + verifica visiva. Non accumulare fix senza verificare.
8. **LOOP DI CONVERGENZA**: Ripeti il ciclo verifica→fix→verifica finche' 0 problemi rimangono. Se al giro 3 hai ancora bug, fermati e analizza il pattern.

### CONTESTO DA CARICARE (LEGGI QUESTI FILE ALL'INIZIO)

```
LEGGI NELL'ORDINE:
1. /Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md
2. /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/sessioni/report/FONDAMENTALI-MANCANTI-S46.md
3. /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/sessioni/report/AUDIT-NANOBOT-S46.md
4. /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/sessioni/report/20-MICRO-IDEE-S46.md
```

### FASE 0 — SETUP BROWSER (5 min)

1. Chiama `tabs_context_mcp` per ottenere il tab group
2. Crea 2 tab con `tabs_create_mcp`: uno per il sito Netlify, uno per ELAB Tutor
3. Avvia il preview server per elab-builder (`preview_start`)
4. Naviga Tab 1 su `https://funny-pika-3d1029.netlify.app`
5. Naviga Tab 2 su `https://www.elabtutor.school`
6. Fai screenshot di entrambi — questo e' il tuo BASELINE

### FASE 1 — VERIFICA DEPLOY NETLIFY (Sito Pubblico)

Per OGNUNA di queste pagine, apri in Chrome, fai screenshot, verifica:

```
PAGINE DA VERIFICARE:
- /index.html (hero, CTA, navbar, footer)
- /chi-siamo.html (accenti: Cosi→Così, puo→può, con se→con sé)
- /login.html (accento: Citta→Città nel form)
- /kit/volume-1.html (accenti: luminosita, piu)
- /kit/volume-2.html (accento: piu)
- /kit/volume-3.html (accenti: 3x sara→sarà)
- /vetrina.html (4 immagini breadboard, ZERO stock photos)
- /scuole.html (layout, foto reali)
- /negozio.html (prodotti Amazon, link funzionanti)
```

**CHECK PER OGNI PAGINA:**
- [ ] Screenshot desktop (1280px)
- [ ] Screenshot mobile (375px) con `resize_window`
- [ ] Accenti italiani corretti (leggi il testo dallo screenshot o `get_page_text`)
- [ ] Nessuna immagine rotta (controlla visivamente)
- [ ] data-theme="light" presente (ispeziona con `read_page` o `javascript_tool`)
- [ ] Font Poppins + Roboto caricati

**SE TROVI UN ACCENTO SBAGLIATO**: Fix immediato con Edit tool → deploy Netlify → ri-verifica.

### FASE 2 — VERIFICA DEPLOY VERCEL (ELAB Tutor)

Usa sia Chrome (`navigate` su elabtutor.school) che Preview tools (`preview_start` su localhost).

**2.1 — Login**
- Apri /login su Chrome
- Screenshot della pagina
- Verifica che il form sia visibile e responsive
- NON inserire credenziali (test visivo only)

**2.2 — Simulatore (via Preview tools)**
- `preview_start` il dev server
- `preview_snapshot` della home
- Naviga al simulatore (clicca il link appropriato)
- `preview_screenshot` del simulatore caricato
- Verifica:
  - [ ] Toolbar visibile con TUTTI i bottoni (incluso YouTube rosso)
  - [ ] Bottone YouTube: `preview_inspect` con selector `.toolbar-btn--youtube` — verifica `background: #FF0000`, `min-height: 44px`, `min-width: 44px`
  - [ ] Bottone Diagnosi presente
  - [ ] Bottone Suggerimenti presente
  - [ ] Breadboard renderizzata senza buchi neri

**2.3 — Watermark Copyright**
```bash
# Verifica che il watermark sia nei chunk JS di produzione
curl -s "https://www.elabtutor.school/assets/" | head -50
```
Oppure usa `preview_eval` per verificare:
```js
// Controlla che codeProtection sia attivo
document.documentElement.getAttribute('data-theme')
```

**2.4 — Mobile (375px)**
- `preview_resize` preset mobile
- `preview_screenshot`
- Verifica:
  - [ ] Touch targets >= 44px (usa `preview_inspect` su `.toolbar-btn`, `.chat-send-btn`, `.sidebar-collapse-btn`)
  - [ ] Chat overlay max-height 40vh
  - [ ] MobileBottomTabs visibili
  - [ ] Font body >= 14px

**2.5 — Console Errors**
- `preview_console_logs` level error
- Se ci sono errori, FIX IMMEDIATO
- Rebuild e ri-verifica

### FASE 3 — FIX 6 ESPERIMENTI (dal Swarm Audit S46)

Questi 6 esperimenti hanno bug confermati dai 4 agenti swarm:

**3.1 — Cap7 RGB buildSteps (3 fix)**

File: `src/data/experiments-vol1.js`

| Experiment | Bug | Fix |
|---|---|---|
| v1-cap7-esp4 | Step 5 bundles 2 bus+ wires in 1 wireFrom/wireTo | Splitta in 2 step separati |
| v1-cap7-esp5 | Steps 6+7 bundle 3 wires ciascuno, 4 connections mancanti | Splitta step 6 in 3 + step 7 in 3 |
| v1-cap7-esp6 | Identico a esp5 | Stesso fix |

**PATTERN DI FIX**: Ogni step che dice "A, B e C" nel testo ma ha UN solo wireFrom/wireTo deve diventare 3 step separati, ognuno con il suo wireFrom/wireTo/wireColor.

**DOPO OGNI FIX**: `npm run build` per verificare che compili.

**3.2 — Cap10 LDR Resistors (3 fix)**

| Experiment | Bug | Fix |
|---|---|---|
| v1-cap10-esp2 | LDR→LED senza resistore | Aggiungi r1 220ohm tra LDR e LED (come esp1) |
| v1-cap10-esp3 | 3 LDR→RGB senza resistori | Aggiungi r1,r2,r3 220ohm, uno per canale |
| v1-cap10-esp6 | Button+LDR→LED senza resistore | Aggiungi r1 220ohm |

**PATTERN DI FIX**: Copia la struttura di v1-cap10-esp1 (gia' fixato in S46) per il resistore. Aggiorna: components array, pinAssignments, connections, buildSteps, steps text.

**DOPO TUTTI I 6 FIX**: Build completa + deploy Vercel + verifica visiva di almeno 1 esperimento per categoria nel browser.

### FASE 4 — FIX NANOBOT (3 Bug Critici)

File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot/server.py`

**4.1 — Google API Key in Header (15 min)**
```python
# DA (Bug #4 — key esposta in URL):
url = f"...?key={api_key}"
# A:
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}
```

**4.2 — Rate Limiting (2h)**
- Aggiungi `slowapi` a requirements.txt
- Implementa `@limiter.limit("10/minute")` su `/chat`, `/diagnose`, `/hints`, `/site-chat`
- Aggiungi `class ChatRequest(BaseModel)` con validazione Pydantic

**4.3 — Conversation Memory (2h)**
- Modifica `/chat` per accettare `conversationHistory: [{role, content}]`
- Passa ultimi 6 messaggi (3 turni) al provider
- Il frontend gia' tiene la history nel componente chat

**4.4 — Timeout su httpx (30 min)**
```python
client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0))
```

**4.5 — Accenti in site-prompt.yml**
- Find/replace: `e'` → `è`, `puo'` → `può`, `cioe'` → `cioè`, etc.

**DOPO TUTTI I FIX NANOBOT**: Docker build locale per verificare che parta:
```bash
cd "VOLUME 3/PRODOTTO/elab-builder/nanobot" && docker build -t galileo-test . && docker run --rm -p 8100:8100 galileo-test
```
Poi `curl http://localhost:8100/health` per verificare.

### FASE 5 — LOOP DI CONVERGENZA FINALE

Ripeti questo ciclo MAX 3 volte:

```
LOOP {
  1. Build elab-builder: `npm run build`
  2. Se errori → fix → torna a 1
  3. Preview screenshot home + simulatore
  4. Preview console_logs level error
  5. Se errori console → fix → torna a 1
  6. Chrome screenshot sito Netlify (3 pagine random)
  7. Se problemi visivi → fix → deploy → torna a 6
  8. Se tutto verde → ESCI DAL LOOP
}
```

### FASE 6 — DEPLOY FINALE + PROOF

1. Build pulita: `npm run build` (deve passare con 0 errori, 0 warning critici)
2. Deploy Vercel: `npx vercel --prod --yes`
3. Deploy Netlify (se modificato): `npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13`
4. **PROOF SCREENSHOTS** (OBBLIGATORIO):
   - Screenshot 1: Home sito Netlify (desktop)
   - Screenshot 2: Vetrina con immagini breadboard
   - Screenshot 3: Login ELAB Tutor
   - Screenshot 4: Simulatore con toolbar completa
   - Screenshot 5: Mobile 375px del simulatore
5. Salva tutti gli screenshot come proof

### FASE 7 — AGGIORNA MEMORY

Aggiorna MEMORY.md con:
- Nuovi punteggi (se migliorati)
- Bug risolti (sposta da "Remaining" a "Resolved in Session 47")
- Nuove lesson learned
- Score nanobot aggiornato (se fixato)

### TECNICHE DI TENUTA CONTESTO

1. **TodoWrite SEMPRE AGGIORNATO** — Prima cosa: crea todos. Ultima cosa: segna completed.
2. **Leggi MEMORY.md a inizio sessione** — Non fare NULLA prima di aver letto il contesto.
3. **Dopo ogni fase, scrivi un mini-report** in chat: cosa hai fatto, cosa hai trovato, cosa hai fixato.
4. **Se il contesto si comprime**: ri-leggi MEMORY.md + il TodoWrite corrente. Non perdere il filo.
5. **Checkpoint file**: Dopo ogni fase, scrivi lo stato in `sessioni/S47-checkpoint.md` cosi' se il contesto si resetta, puoi riprendere.
6. **Conta i fix**: Tieni un contatore `FIX_COUNT` visibile in chat. Incrementa ad ogni fix. A fine sessione, il numero totale deve matchare i todos completed.

### VINCOLI FINALI

- **TEMPO STIMATO**: ~4-6 ore di lavoro autonomo
- **OUTPUT ATTESO**: 6 experiment fix + 5 nanobot fix + proof screenshots + memory aggiornata
- **SCORE TARGET**: Overall da 8.7 a ≥8.9
- **ZERO REGRESSIONI**: Se un fix rompe qualcosa di esistente, e' un fallimento. Verifica SEMPRE.

---

> "Non e' finito finche' non l'hai VISTO funzionare." — Regola #1 di ELAB
