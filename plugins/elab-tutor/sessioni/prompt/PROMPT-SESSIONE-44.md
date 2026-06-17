# SESSIONE 44 — AUDIT TOTALE + NANOBOT DEPLOY + LIM-FIRST

## Data: 24/02/2026
## Metodologia: Agile Sprint (GET THE SHIT DONE + Ralph Loop)
## Focus: LIM-first, poi tablet/PC studenti

---

## CONTESTO PIATTAFORMA

ELAB è una piattaforma didattica di elettronica per studenti 8-14 anni.

**TARGET PRIMARIO**: L'insegnante su **LIM** (Lavagna Interattiva Multimediale) in classe.
- La LIM è un grande touchscreen (65"-86") con risoluzione 1920x1080 o 4K
- L'insegnante proietta e interagisce davanti a tutta la classe
- Touch singolo, niente hover, niente right-click affidabile
- Font grandi, contrasti alti, elementi cliccabili enormi
- Galileo (AI) deve funzionare come assistente dell'insegnante in tempo reale

**TARGET SECONDARIO**: Studenti su tablet (iPad/Android 10") e PC.

**Nanobot/Galileo** va pensato in questo contesto: non è un chatbot privato, è un **tutor di classe** che l'insegnante attiva sulla LIM per spiegare, diagnosticare, suggerire davanti a tutti.

---

## P0 — CRITICI (Sprint 1)

### P0.1: Deploy Nanobot su Render
**IMPERATIVO**: Il server AI DEVE essere live in produzione entro fine sprint 1.

**Stato attuale**:
- `nanobot/server.py` — FastAPI completo (3 endpoint: `/chat`, `/diagnose`, `/hints`)
- `nanobot/Dockerfile` — Pronto (Python 3.11-slim, uvicorn, port 8100)
- `nanobot/render.yaml` — Config Render pronta (piano free, Docker runtime)
- `nanobot/requirements.txt` — 4 dipendenze (fastapi, uvicorn, httpx, pyyaml)
- Frontend `api.js` — Fallback chain già implementata: `NANOBOT_URL → CHAT_WEBHOOK → knowledge-base`

**Azioni**:
1. Creare repository GitHub `elab-galileo` (o sottocartella del repo esistente)
2. Push della cartella `nanobot/` su GitHub
3. Collegare a Render.com → New Web Service → Docker
4. Settare env vars su Render Dashboard:
   - `AI_PROVIDER=deepseek`
   - `AI_MODEL=deepseek-chat`
   - `AI_API_KEY=<chiave DeepSeek>`
   - `CORS_ORIGINS=https://elab-builder.vercel.app,https://www.elabtutor.school`
   - `PORT=8100`
5. Verificare `/health` restituisce `{"status": "ok"}`
6. Aggiornare env var su Vercel: `VITE_NANOBOT_URL=https://elab-galileo.onrender.com`
7. Rebuild e deploy Vercel
8. Test E2E: aprire www.elabtutor.school → chat → inviare messaggio → risposta da nanobot

**Acceptance**: `/health` risponde 200, `/chat` risponde con testo AI, frontend riceve `source: "nanobot"`.

### P0.2: Screenshot Freschi Vetrina
**IMPERATIVO**: Le 5 immagini in `/public/assets/showcase/` DEVONO mostrare il simulatore ATTUALE (post-Tinkercad redesign 21 SVG).

**Azioni**:
1. Avviare `npm run dev`
2. Aprire Chrome a localhost:5173, login con account admin
3. Caricare 5 esperimenti rappresentativi (1 per volume + 1 modalità Passo Passo + 1 con quiz/gioco)
4. Screenshot 1920x1080 di ogni esperimento
5. Salvare come `showcase-1.png` ... `showcase-5.png` in `public/assets/showcase/`
6. Verificare che VetrinaSimulatore.jsx li mostri nella gallery

**Suggerimenti esperimenti fotogenici**:
- `v1-cap6-esp1` (LED singolo — il classico primo circuito)
- `v1-cap8-esp2` (LED con potenziometro — componenti vari)
- `v2-cap7-esp3` (RGB LED — colori vivaci)
- `v3-cap12-esp1` (Arduino — il più complesso)
- Uno qualsiasi in modalità "Passo Passo" con la barra step visibile

**Acceptance**: 5 PNG ≤500KB ciascuno, 1920x1080, mostranti i nuovi SVG Tinkercad flat.

---

## P1 — AUDIT COMPLETO ECOSISTEMA ELAB (Sprint 2-3)

### OBIETTIVO
Audit sistematico, quantitativo e brutalmente onesto di TUTTO il sistema ELAB:
- ELAB Tutor (simulatore + quiz + giochi + dashboard)
- Galileo (nanobot AI + knowledge base + proactive hints)
- Sito pubblico (Netlify)
- VetrinaSimulatore (landing page conversione)
- Intero flusso utente: visitatore → registrazione → licenza → studio → valutazione

### 10 REGOLE NON NEGOZIABILI

1. **ZERO BULLSHIT** — Ogni score DEVE essere giustificato con evidenze verificabili. Nessuna stima a occhio. Numeri precisi o "NON VERIFICATO".
2. **CHAIN OF VERIFICATION (CoV)** — Ogni affermazione va verificata nel codice sorgente. Non basta leggere un commento, bisogna leggere l'implementazione.
3. **TEST FUNZIONALE** — Non basta che il codice esista. DEVE funzionare. Un endpoint che ritorna 503 non è "implementato".
4. **UTENTE ZERO** — Ogni flusso va testato come se l'utente fosse il più inesperto del mondo. Un insegnante di 60 anni su una LIM.
5. **CORRETTEZZA FISICA** — I circuiti del simulatore devono rispettare le leggi della fisica. LED senza resistore = errore, non feature.
6. **FEDELTA AI VOLUMI** — Ogni esperimento deve corrispondere ESATTAMENTE alla pagina del libro fisico. Stesso foro, stesso colore filo, stesso componente.
7. **GALILEO DEVE SAPERE** — L'AI deve conoscere il contesto dell'esperimento corrente, lo stato del circuito, e il livello dello studente.
8. **LIM-FIRST** — Ogni elemento UI deve funzionare su LIM 1080p con touch singolo. Font ≥16px per contenuti didattici proiettati.
9. **COERENZA SISTEMA** — ELAB Tutor, Galileo, sito pubblico e kit fisico devono raccontare la stessa storia. Nessuna contraddizione.
10. **SCORE ONESTO** — Meglio un 6 reale che un 9 falso. Le score inflazionate non servono a nessuno.

### 6 FASI DELL'AUDIT

#### FASE 1: Mappatura Completa
- Inventario di TUTTI i componenti del sistema (file, endpoint, database, env vars)
- Grafo dipendenze: cosa dipende da cosa
- Mappa flussi utente: ogni percorso possibile dall'home page al completamento esperimento
- Identificare TUTTI i single point of failure

#### FASE 2: Funzionamento Tecnico
- **Build**: 0 errori, 0 warning, bundle sizes ragionevoli
- **Runtime**: 0 crash, 0 console.error in produzione
- **Network**: tutti gli endpoint rispondono (health check su ogni servizio)
- **Auth**: login/register/logout funzionanti, token validi, RBAC corretto
- **Licenza**: attivazione codice, volume gating, bypass admin
- **69 Esperimenti**: TUTTI devono caricarsi senza errore
- **Quiz**: 138 domande accessibili e funzionanti
- **Giochi**: 4 giochi con 53 sfide, star system funzionante
- **Performance**: LCP <3s su LIM, FID <100ms, CLS <0.1

#### FASE 3: Logica di Interazione
- Modalità "Già Montato": componenti nella posizione finale del libro
- Modalità "Passo Passo": ogni step piazza nella posizione finale, barra progressione
- Modalità "Esplora Libero": palette componenti corretta per volume
- Wire rendering: Catmull-Rom smooth, drag funzionante, gravity sag
- CircuitSolver: KVL/KCL corretto, LED glow/burn corretto
- Touch interaction su LIM: tutti gli elementi ≥44px, drag & drop funzionante

#### FASE 4: Correttezza Elettrica e Didattica
- Campione di 10 esperimenti (mix volumi): verificare connessioni vs PDF
- Quiz: domande pertinenti, risposte corrette, spiegazioni utili
- Giochi: sfide coerenti con gli esperimenti collegati
- Galileo: risposte corrette e pedagogicamente appropriate
- Progressione didattica: Vol1→Vol2→Vol3 coerente e graduale

#### FASE 5: Qualità Visiva e UX
- SVG Tinkercad: tutti 21 componenti flat, 0 gradienti multi-stop, 0 filter/shadow
- Font sizes: ≥14px body text (≥16px per LIM proiettata), ≥12px admin
- Touch targets: ≥44px tutti gli elementi interattivi
- Responsive: LIM 1920x1080, tablet 768x1024, mobile 375x812
- Accessibilità: contrasto WCAG AA, aria-labels, keyboard nav
- Dark mode: disabilitato (force-light)
- Palette ELAB: Navy #1E4D8C, Lime #7CB342, Vol1/2/3 accent

#### FASE 6: Integrazione Galileo + Nanobot
- System prompt: contiene contesto circuito, controlli simulatore, formato connessioni
- Chat: domanda → risposta in italiano, socratica, con analogie
- Diagnose: stato circuito → analisi problemi → suggerimenti
- Hints: 3 livelli progressivi (leggero/medio/diretto)
- Proactive events: Galileo interviene su LED bruciato, circuito aperto, etc.
- Fallback chain: nanobot → webhook → knowledge base locale
- Safety filter: blocca contenuti non educativi

### FORMAT OUTPUT AUDIT

Per OGNI area, produrre:

```
### [NOME AREA]
- **Score**: X/10
- **Evidenza**: [cosa hai verificato nel codice, con path file e righe]
- **Funziona**: [cosa funziona realmente end-to-end]
- **Non funziona**: [cosa NON funziona, con dettaglio del perché]
- **Fix necessari**: [azioni specifiche per risolvere]
- **Priorità fix**: P0/P1/P2/P3
```

### ACCEPTANCE CRITERIA AUDIT
- [ ] Score card completa con 15+ aree valutate
- [ ] Ogni score giustificata con evidenza verificabile
- [ ] Lista P0/P1/P2 con azioni specifiche
- [ ] 0 affermazioni non verificate
- [ ] Test funzionale di almeno 10 esperimenti
- [ ] Nanobot testato end-to-end (o documentato perché non possibile)
- [ ] Screenshot o evidenza per ogni flusso utente critico

---

## GALILEO: DA CHATBOT A TUTOR DI CLASSE

### Visione
Galileo non è un chatbot in un angolo. È il **tutor della classe**. L'insegnante lo attiva sulla LIM e Galileo:
- **Analizza** il circuito in tempo reale ("Vedo che il LED è spento perché...")
- **Guida** passo per passo ("Ora prova a collegare il resistore al pin...")
- **Celebra** i successi ("Ottimo! Il circuito è corretto! ⭐⭐⭐⭐⭐")
- **Diagnostica** i problemi prima che lo studente li noti
- **Adatta** il linguaggio al livello della classe

### Requisiti Tecnici Galileo
1. `circuitStateRef` già passa lo stato del circuito ogni 800ms via useRef
2. Proactive events (LED burn, open circuit) già implementati con one-shot pattern
3. Quick actions ("Diagnosi circuito", "Suggerimento") già wired nel frontend
4. System prompt duplicato in `api.js` e `nanobot.yml` — **CONSOLIDARE** in un'unica source of truth

### LIM-Specific per Galileo
- Font chat ≥18px (proiettato su 75" a 3m di distanza)
- Risposte brevi (max 3 frasi per messaggio)
- Emoji per feedback visivo (✅❌⚠️💡🔍⭐)
- Bottoni azione grandi (≥60px su LIM)
- Auto-scroll alla risposta più recente

---

## SPRINT PLAN

### Sprint 1 (P0 — ~1.5h)
1. Deploy nanobot su Render
2. Aggiornare VITE_NANOBOT_URL su Vercel
3. Test chat/diagnose/hints E2E
4. Screenshot freschi Vetrina (se tool disponibile)

### Sprint 2 (Audit Fasi 1-3 — ~2h)
5. Mappatura completa sistema
6. Audit funzionamento tecnico
7. Audit logica interazione

### Sprint 3 (Audit Fasi 4-6 — ~1.5h)
8. Audit correttezza elettrica
9. Audit qualità visiva + LIM readiness
10. Audit integrazione Galileo

### Sprint 4 (Report + Fix — ~1h)
11. Report audit completo con score card
12. Fix P0 trovati durante audit
13. Deploy finale
14. Report sessione 44

---

## PLUGIN E TOOL DA USARE

- **Ralph Loop**: Per iterazione continua fino a quality gate
- **Quality Audit skill**: Per metriche quantitative (font, touch, bundle, console)
- **Systematic Debugging**: Se emergono bug durante l'audit
- **Verification Before Completion**: Prima di dichiarare qualsiasi task completo
- **Preview tool**: Per screenshot e test visivi
- **Chrome extension**: Per test LIM-simulated (resize 1920x1080)

---

## METRICHE DI SUCCESSO SESSIONE 44

| Metrica | Target | Metodo verifica |
|---------|--------|-----------------|
| Nanobot live | /health → 200 | curl |
| Chat E2E | messaggio → risposta AI | Browser test |
| Screenshot aggiornati | 5 PNG post-Tinkercad | Verifica visiva |
| Audit completato | 15+ aree con score | Report file |
| Fix P0 | 0 P0 aperti | Issue list |
| Score onesto | Giustificato con CoV | Evidenze nel report |

---

*Prompt Session 44 — Andrea Marro, 24/02/2026*
*"Le score gonfiate non servono a nessuno."*
