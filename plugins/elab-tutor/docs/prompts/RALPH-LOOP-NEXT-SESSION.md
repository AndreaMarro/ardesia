# RALPH LOOP — MEGA-PROMPT SESSIONE SUCCESSIVA
**Creato**: 02/04/2026 | **Da usare con**: Ralph Loop (--max-iterations 30)
**Copia e incolla TUTTO questo prompt in una nuova sessione Claude Code.**

---

## COMANDO RALPH LOOP

```
/ralph-loop Esegui TUTTO il prompt in docs/prompts/RALPH-LOOP-NEXT-SESSION.md --max-iterations 30 --completion-promise "SESSIONE COMPLETATA SCORE 9.0 VERIFICATO"
```

---

## STATO DI PARTENZA (sessione precedente 02/04/2026)

### Frontend (PDR Design Excellence S1-S8):
- 1075/1075 test PASS, Build PASS (3997KB, 33 precache)
- 16 file modificati + 2 creati in `src/components/lavagna/`
- 11 bug fixati (TDZ, memory leak, SVG ID, findLastIndex, state machine, speaking state, a11y x5)
- Browser verified su 3 viewport (LIM 1024x768, Desktop 1280x800, iPad 768x1024)
- Mascotte dual-mode (inline+floating), speaking state wired
- UnlimBar con glassmorphism, mascotte integrata
- ErrorToast error-to-UNLIM bridge
- ExperimentPicker con badge Arduino per Vol3
- LessonBar con mini progress dots + quickAsk button
- Header con logo mascotte ELAB
- Toolbar verticale su LIM, orizzontale su desktop

### Backend (Nanobot V2):
- 5 Edge Functions LIVE su Supabase (`elab-unlim`, project ref: `euqpdueopmlllqjmqnyb`)
  - unlim-chat (Gemini routing 70/25/5)
  - unlim-diagnose (circuit analysis)
  - unlim-hints (progressive hints)
  - unlim-tts (Voxtral TTS proxy)
  - unlim-gdpr (Art. 17 deletion, Art. 20 export, consent)
- Security guards: rate limiting, input validation, prompt injection protection
- GDPR: parental consent table, data retention (auto-expire), deletion API, audit log
- Knowledge base: 62 experiment chunks (keyword RAG) — MA serve RAG dai PDF Tres Jolie
- Testato LIVE: 20/20 chat, 25/25 routing, 8/8 errors, 4/4 onnipotenza

### CoV Scores (onesti):
- Frontend compatibility: 9/10
- Architecture: 5.9/10 (severo — GDPR e production readiness da migliorare)
- Security: P0 fixati (rate limit, injection), P1 parzialmente fixati

### Modello Business (memorizzato):
- Scuola paga €20/classe/mese a ELAB (non a Google/Claude)
- ELAB usa Gemini API nel backend (Principio Zero: solo docente usa UNLIM)
- Costo reale: €0.50-3.30/classe/mese
- Margine: 82-96%
- Voxtral TTS per voce naturale (VPS €10/mese)

### Cosa RESTA DA FARE (in questa sessione):
1. PDF business case
2. RAG COMPLETO dai volumi Tres Jolie (poppler + embeddings + pgvector)
3. CORS ristretto
4. Gemini API key nell'header (non URL)
5. Test coverage 70%+
6. Monitoring/alerting
7. Nuove skill ELAB
8. Score target: 9.0+ verificato CoV

---

## ISTRUZIONI COMPLETE

Leggi PRIMA di qualsiasi azione:
1. `CLAUDE.md` — contesto progetto
2. `docs/plans/2026-04-02-nanobot-v2-architecture.md` — architettura Nanobot V2
3. `docs/plans/2026-04-02-nanobot-v2-stress-test-report.md` — risultati stress test
4. `supabase/DEPLOY-GUIDE.md` — guida deploy
5. `docs/prompts/ANDREA-VISION-COMPLETE.md` — visione Andrea
6. `docs/plans/PDR-DESIGN-EXCELLENCE.md` — PDR 16 aspetti

Poi esegui TUTTE le seguenti task IN ORDINE. Dopo OGNI task: test + audit CoV + documenta.

---

## TASK 1: GENERA PDF BUSINESS CASE (priorità MASSIMA)

Crea un PDF professionale che sostenga perché il modello "ELAB rivende Gemini API" è LA soluzione migliore rispetto alle alternative. Usa `/anthropic-skills:pdf` o `/anthropic-skills:pptx`.

### Struttura del PDF:

**Pagina 1 — Executive Summary**
- ELAB Tutor: simulatore elettronica + AI tutor per scuole
- Modello: abbonamento €20/classe/mese, AI inclusa
- Margine: 82-96% a qualsiasi scala

**Pagina 2 — Analisi Alternative AI**

| Alternativa | Costo | Pro | Contro | Verdetto |
|-------------|-------|-----|--------|----------|
| Allenamento modello custom | €5.000-50.000 setup + €500/mese GPU | Controllo totale | Costo proibitivo, manutenzione continua, qualità inferiore a Gemini/Claude | ❌ SCARTATO |
| Modello locale (Ollama/vLLM) | €10-40/mese VPS | Zero costi API | Qualità 10x inferiore, GPU costosa, manutenzione | ⚠️ SOLO FALLBACK |
| Cluster GPU dedicato | €1.000-5.000/mese | Performance garantita | Costo fisso enorme, overprovisioning | ❌ SCARTATO |
| Server AI dedicato (A100/H100) | €2.000-10.000/mese | Latenza minima | Costo insostenibile per startup | ❌ SCARTATO |
| API pay-per-use (Gemini) | €0.50-3/classe/mese | Scalabile, zero infrastruttura | Dipendenza da Google | ✅ SCELTO |

**Pagina 3 — Costi Dettagliati Modello Scelto**
- Routing 70/25/5 (Flash-Lite/Flash/Pro)
- Costo/classe: €0.50-3.30 (dipende dall'uso)
- Principio Zero: solo il docente usa UNLIM (300 msg/mese, non 2000)
- VPS: €10-25 fisso (Voxtral TTS + Brain fallback)
- Supabase: €0 (free tier)

**Pagina 4 — Modelli di Ammortamento**

| Modello | Prezzo | Margine | Note |
|---------|--------|---------|------|
| Incluso nel kit | Kit €300 (una tantum) | 0% ricorrente | Semplice ma nessun revenue ricorrente |
| Abbonamento separato | €20/classe/mese | 82-96% | Revenue ricorrente, scalabile |
| Freemium | Base gratis + Premium €20/mese | Acquisizione facile | Conversione incerta |
| Per-studente | €2/studente/mese | ~80% | Più granulare, più complesso |
| Annuale | €180/classe/anno (sconto 25%) | 82% | Cash flow upfront |

**Pagina 5 — Proiezioni Finanziarie**
- Anno 1: 50 classi → €12.000 ricavo, €2.760 costi, €9.240 margine
- Anno 2: 200 classi → €48.000 ricavo, €8.400 costi, €39.600 margine
- Anno 3: 500 classi → €120.000 ricavo, €19.200 costi, €100.800 margine
- Break-even: mese 1 (costi fissi €11/mese coperti dalla prima classe)

**Pagina 6 — Vantaggi Competitivi**
- UNLIM è onnipotente (14 azioni + INTENT) — nessun competitor ha questo
- Voce naturale Voxtral (gratis, GDPR-safe)
- 62 esperimenti con percorsi guidati
- Kit fisico + digitale = unico prodotto
- Routing AI intelligente (70% economico, 5% premium)

**Pagina 7 — Roadmap e Next Steps**
- Q2 2026: Beta con 5 scuole pilota
- Q3 2026: Launch commerciale MePA (Davide Fagherazzi)
- Q4 2026: Espansione 50+ scuole
- 2027: Mercato europeo (Gemini multilingua)

### Dati da usare:
- Committenti: `memory/committenti-dettaglio.md`
- Mercato: `memory/mercato-pnrr-mepa.md`
- Costi: `memory/unlim-subscription-idea.md`
- Architettura: `docs/plans/2026-04-02-nanobot-v2-architecture.md`

---

## TASK 2: CONTROLLA TUTTO IL LAVORO DELLA SESSIONE PRECEDENTE

### 2.1 Verifica Frontend (PDR Design Excellence)
Usa `/elab-quality-gate`, `/lavagna-benchmark`, `/quality-audit`:
- Naviga a `#lavagna` nel browser
- Screenshot su 3 viewport (LIM 1024x768, Desktop 1280x800, iPad 768x1024)
- Verifica: mascotte visibile, UnlimBar funzionante, dot pattern, glassmorphism
- Carica esperimento → circuito appare → percorso lezione funziona
- Test 5 esperimenti rapidi → zero errori
- Confronto con cartella `ELAB - TRES JOLIE`
- Score per ogni aspetto PDR (16 aspetti, 0-10)

### 2.2 Verifica Backend (Nanobot V2)
- Test LIVE tutti e 4 gli endpoint Supabase:
  ```
  POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat
  POST .../unlim-diagnose
  POST .../unlim-hints
  POST .../unlim-tts
  ```
  Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ`

- Stress test: 20 messaggi sequenziali → tutti devono rispondere
- Test onnipotenza: UNLIM genera [AZIONE:play], [AZIONE:highlight], [AZIONE:addcomponent]
- Test security guards: prompt injection, message lungo, mimeType invalido
- Test routing: 25 messaggi con routing accuracy 100%

### 2.3 Verifica Test Suite
- `npx vitest run` → 1075+ test PASS
- `npm run build` → PASS, 33 precache, <4100KB
- Zero console errors nel browser

---

## TASK 3: TROVA BUG E MIGLIORA

Usa `/systematic-debugging`, `/code-review`, `/simplify`:

### 3.1 Code Review Completo
Lancia 3 agenti in parallelo:
1. **Code quality agent** — tutti i file in `src/components/lavagna/` e `supabase/functions/`
2. **Security agent** — GDPR, injection, rate limiting, CORS
3. **A11y agent** — WCAG 2.1 AA, font sizes, touch targets, focus trapping

### 3.2 Fix Ogni Bug Trovato
Per ogni bug: fix → test → audit → documenta.
ZERO REGRESSIONI.

### 3.3 Migliora Performance
- Bundle size: target <3800KB
- Cold start: documenta e mitigazione
- Memory leaks: stress test 10 aperture/chiusure

---

## TASK 4: STRESS TEST ESTREMI

Usa preview tools + Control Chrome per test reali nel browser:

### 4.1 Frontend Stress
- 10 aperture/chiusure rapide ExperimentPicker
- 5 cambi esperimento consecutivi (no errori console)
- Multi-window: UNLIM + Video + Pannello componenti simultanei
- State machine: 10 transizioni CLEAN→BUILD→CODE→RUN→STUCK
- Memory leak: devtools → heap snapshot prima e dopo 20 interazioni
- LIM 1024x768: tutto leggibile, nulla tagliato
- iPad portrait: pannelli non sovrapposti

### 4.2 Backend Stress
- 50 messaggi sequenziali al Nanobot V2
- Rate limiting: 31° messaggio deve essere bloccato (429)
- Prompt injection: 10 tentativi diversi → tutti bloccati
- Messaggio 2001 chars → rifiutato
- 4 immagini → rifiutato (max 3)
- circuitState con injection → filtrato
- experimentId con XSS → strippato
- Timeout: VPS down → fallback Brain → risposta comunque

### 4.3 Onnipotenza UNLIM
Testa OGNI azione con Gemini LIVE:
- [AZIONE:play] / [AZIONE:pause]
- [AZIONE:highlight:led1,r1]
- [AZIONE:addcomponent:led:200:150]
- [AZIONE:removecomponent:led1]
- [AZIONE:loadexp:v1-cap6-esp1]
- [AZIONE:compile]
- [AZIONE:clearall]
- [AZIONE:undo] / [AZIONE:redo]
- [AZIONE:video:LED]
- [AZIONE:interact:pot1:rotate:50]
- [AZIONE:addwire:...]

---

## TASK 5: SISTEMA RAG COMPLETO DAI VOLUMI TRES JOLIE (PRIORITÀ ALTA)

UNLIM deve conoscere PERFETTAMENTE ogni parola dei 3 volumi. Non alla veloce.

### 5.0 Installa prerequisiti
```bash
brew install poppler  # per leggere PDF
pip install pdfplumber  # alternativa Python per PDF
```

### 5.1 Estrai TUTTO il testo dai PDF Tres Jolie
I 3 manuali sono qui:
- **Volume 1**: `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf`
- **Volume 2**: `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL2_ITA_COMPLETO GP V 0.1.pdf`
- **Volume 3**: `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/Manuale VOLUME 3 V0.8.1.pdf`

Alternative:
- **Volume 3 DOCX**: `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-docx/OMARIC_VOLUME3_FINALE.docx`

Usa `/anthropic-skills:pdf` per leggere ogni pagina. Estrai TUTTO il testo, pagina per pagina. Non saltare nulla.

### 5.2 Chunka intelligentemente
NON fare chunk casuali. Segui la struttura del libro:
- Ogni capitolo = 1 chunk padre
- Ogni esperimento = 1 chunk figlio (con contesto del capitolo)
- Ogni spiegazione teorica = 1 chunk separato
- Ogni tabella/schema = 1 chunk (es. "tabella colori resistori")
- Max ~500 token per chunk (per non eccedere il context window)

### 5.3 Crea tabella pgvector in Supabase
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS volume_chunks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volume      INTEGER NOT NULL, -- 1, 2, 3
    chapter     TEXT NOT NULL,
    section     TEXT, -- sottosezione opzionale
    content     TEXT NOT NULL,
    page_number INTEGER,
    token_count INTEGER,
    embedding   vector(768), -- Gemini text-embedding-004 = 768 dim
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON volume_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS idx_chunks_volume ON volume_chunks(volume);
```

### 5.4 Genera embeddings con Gemini
```typescript
// Usa Gemini Embedding API
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text: chunkContent }] },
    }),
  }
);
const embedding = (await response.json()).embedding.values; // 768-dim vector
```

### 5.5 Integra nel Nanobot V2
Modifica `_shared/rag.ts` per usare ricerca vettoriale:
```typescript
// Embedding della query
const queryEmbedding = await embedText(query);

// Ricerca semantica in Supabase
const { data } = await supabase.rpc('search_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 3,
});

// Inietta nel system prompt
const ragContext = data.map(c => c.content).join('\n\n');
```

### 5.6 CRITICO: UNLIM parla COME i volumi
Il system prompt deve includere:
```
REGOLA FONDAMENTALE: Quando rispondi su un argomento trattato nei volumi ELAB,
USA LE STESSE PAROLE E LO STESSO STILE del volume. Non parafrasare con conoscenza
generica. Il docente ha il libro davanti — se UNLIM dice qualcosa di diverso,
perde credibilità. I volumi ELAB sono la TUA bibbia.
```
Il RAG non serve solo per "avere le informazioni" — serve per far parlare UNLIM
con la STESSA VOCE dei volumi. Se il volume dice "il LED è come una strada a senso
unico per la corrente", UNLIM deve dire ESATTAMENTE quello, non inventarsi
un'analogia diversa.

### 5.7 Verifica onniscienza
Testa con domande che richiedono conoscenza SPECIFICA dei volumi:
- "Qual è il valore della resistenza nell'esperimento 3 del capitolo 7?"
- "Cosa dice il manuale sulla polarità dei LED?"
- "Quali sono i colori delle bande di una resistenza da 470 ohm?"
- UNLIM deve rispondere con il TESTO ESATTO del volume, non con conoscenza generica

### 5.7 Gestisci anche i contenuti non-esperimento
La cartella Tres Jolie contiene anche:
- BOM (Bill of Materials) dei kit: `BOM KIT CON ELENCO COMPONENTI/`
- Foto dei componenti reali: `FOTO/`
- Logo e branding: `LOGO/`
- Documentazione breakout board: `3 ELAB VOLUME TRE/5 DOCUMENTAZIONE BREAKOUT NANO ELAB/`

Questi contenuti arricchiscono l'onniscienza di UNLIM.

---

## TASK 6: GENERA/MIGLIORA SKILL ELAB

Usa `/skill-creator` per creare e migliorare skill:

### 6.1 Nuove skill da creare:
- `elab-nanobot-test` — testa automaticamente tutti gli endpoint Nanobot V2
- `elab-rag-builder` — costruisce il sistema RAG dai volumi
- `elab-gdpr-check` — verifica conformità GDPR per prodotti per minori
- `elab-cost-monitor` — monitora costi Gemini API e alert se budget superato
- `elab-voice-test` — testa Voxtral TTS sul VPS

### 6.2 Skill esistenti da migliorare:
- `elab-quality-gate` — aggiungi check Nanobot V2 live
- `lavagna-benchmark` — aggiungi metriche backend (latenza, routing accuracy)
- `analisi-simulatore` — aggiungi verifica onnipotenza UNLIM

---

## TASK 7: DOCUMENTAZIONE FINALE

### 7.1 Aggiorna tutti gli MD:
- `CLAUDE.md` — aggiungi Nanobot V2, Supabase project, Gemini routing
- `memory/MEMORY.md` — aggiungi sezione Nanobot V2
- `memory/unlim-subscription-idea.md` — aggiorna con costi finali
- `memory/supabase-credentials.md` — verifica tutto aggiornato

### 7.2 Crea handoff document:
- Cosa è stato fatto in questa sessione (PDR + Nanobot V2)
- Cosa funziona (con numeri e screenshot)
- Cosa resta da fare (con priorità)
- Come riprodurre tutto (comandi esatti)

---

## REGOLE NON NEGOZIABILI

1. **ZERO REGRESSIONI**: 1075+ test, build PASS, 0 console errors
2. **SCORE SENZA SCREENSHOT = 0**: Ogni score deve avere evidenza visiva
3. **MAI SCORE > 7 SENZA 10+ PROVE**: Agenti CoV verificano tutto
4. **DOPO OGNI TASK**: `npx vitest run` + `npm run build` + audit CoV
5. **MASSIMAMENTE CRITICO**: Self-score > evidenze + 1.0 → RIFIUTATO
6. **ENGINE INTOCCABILE**: CircuitSolver, AVRBridge, SimulationManager, avrWorker
7. **UNLIM INTOCCABILE**: i file core (UnlimWrapper, UnlimInputBar) — solo wrappare
8. **DOCUMENTA TUTTO**: ogni fix, ogni bug, ogni decisione
9. **AUDIT SEVERO**: 3 agenti CoV a fine ogni task. Score = MINIMO dei 3
10. **CONFRONTA CON TRES JOLIE**: ad ogni audit visivo

## CREDENZIALI (già configurate)

```
Supabase Project: elab-unlim (euqpdueopmlllqjmqnyb)
Supabase URL: https://euqpdueopmlllqjmqnyb.supabase.co
Supabase Token: sbp_REVOKED_20260423_REDACTED
Gemini API Key: AIzaSyB3IjfrHeG9u_yscwHamo7lT1zoWJ0ii1g
VPS: 72.60.129.50 (Ollama :11434, Voxtral TTS :8880)
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ
```

## SKILL DA USARE

```
/elab-quality-gate /lavagna-benchmark /quality-audit
/systematic-debugging /code-review /simplify
/frontend-design /design:design-critique /design:accessibility-review
/impersonatore-utente /lim-simulator /analisi-simulatore
/anthropic-skills:pdf /anthropic-skills:pptx
/skill-creator /plugin-dev:skill-development
/engineering:testing-strategy /engineering:code-review
/engineering:system-design /engineering:debug
/posthog:search (se configurato)
/sentry:seer (se configurato)
Preview tools (screenshot, click, snapshot, inspect, resize, console, network)
Control Chrome per navigazione browser
```
