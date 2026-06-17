# SESSIONE: PDF Analisi Gemini + Debug Completo + Stress Test

## FASE 1 — PDF ANALISI API: Perché Gemini (DATI ALLA MANO)

### Obiettivo
Generare un PDF LaTeX professionale con analisi comparativa di TUTTI i provider LLM API per ELAB Tutor. Il documento NON deve citare nomi di persone. Solo dati, fonti, tabelle, grafici. Tutto cliccabile.

### Skill da usare
- `ricerca-tecnica` — per strutturare la ricerca
- `anthropic-skills:pdf` — per generare il PDF
- `data:analyze` — per analisi dati comparativa
- `data:create-viz` — per grafici nel PDF

### Contenuto del PDF

#### 1. Tabella Comparativa Costi (dati Aprile 2026)

| Provider | Modello | Input $/MTok | Output $/MTok | Free Tier | Education |
|----------|---------|-------------|--------------|-----------|-----------|
| **Google Gemini** | Flash-Lite 3.1 | $0.10 | $0.40 | Si (Flash) | Si (Workspace Edu gratuito, 1M+ studenti IT) |
| **Google Gemini** | Flash 2.5 | $0.30 | $2.50 | Si | Si |
| **Google Gemini** | Pro 2.5 | $1.25 | $10.00 | No (dal 01/04/2026) | Si |
| **OpenAI** | GPT-4o mini | $0.15 | $0.60 | No | No |
| **OpenAI** | GPT-5 nano | $0.05 | $0.40 | No | No |
| **OpenAI** | GPT-5.2 | $1.75 | $14.00 | No | No |
| **Anthropic** | Haiku 4.5 | $1.00 | $5.00 | No | No |
| **Anthropic** | Sonnet 4.6 | $3.00 | $15.00 | No | No |
| **Anthropic** | Opus 4.6 | $5.00 | $25.00 | No | No |
| **DeepSeek** | V3.2 | $0.28 | $0.42 | Si | No |
| **DeepSeek** | V4 | $0.30 | $0.50 | Si | No |
| **Mistral** | Ministral 8B | $0.10 | $0.10 | Si | Si (53% sconto .edu) |
| **Mistral** | Nemo | $0.02 | $0.02 | Si | Si |
| **Mistral** | Large 3 | $2.00 | N/A | No | Si |
| **xAI** | Grok 4.1 Fast | $0.20 | $0.50 | Si ($25 crediti) | No |
| **Meta** | Llama 3.1 8B (self-hosted) | ~$0.07 | ~$0.07 | Open source | Open source |

**Fonti (cliccabili nel PDF):**
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [DeepSeek Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [Mistral Pricing](https://mistral.ai/pricing)
- [xAI Grok Pricing](https://docs.x.ai/developers/models)
- [LLM Pricing Comparison 2026](https://www.cloudidr.com/blog/llm-pricing-comparison-2026)
- [AI API Pricing Comparison](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude)
- [Gemini Education Italy](https://blog.google/outreach-initiatives/education/gemini-education-italian-university-students/)
- [Self-Hosted vs API Cost 2026](https://aisuperior.com/llm-hosting-cost/)
- [Low-Cost LLM Comparison](https://intuitionlabs.ai/articles/low-cost-llm-comparison)
- [Mistral Education Discount](https://mistral.ai/pricing)

#### 2. Analisi per il caso ELAB Tutor

**Budget**: €50/mese (escluso questo strumento di sviluppo)
**Utenza target**: classi scolastiche italiane, 8-14 anni
**Requisiti**: italiano fluente, tono pedagogico, risposta <60 parole, azioni simulatore

**Calcolo costi mensili per 100 classi (30 studenti, 20 domande/lezione, 4 lezioni/mese)**:
- Richieste totali: 100 × 30 × 20 × 4 = 240.000 richieste/mese
- Media ~150 token input + ~100 token output per richiesta

| Provider | Costo/mese stimato | Note |
|----------|-------------------|------|
| Gemini Flash-Lite | ~€8.40 | **Vincitore costo** |
| Gemini Flash 2.5 | ~€31.20 | Buon rapporto qualita/prezzo |
| GPT-5 nano | ~€10.80 | Competitivo ma no free tier |
| DeepSeek V3.2 | ~€7.56 | Cheapest ma server in Cina |
| Mistral Nemo | ~€1.08 | Ultra-cheap ma qualita inferiore |
| Grok 4.1 Fast | ~€13.20 | Buono ma ecosistema giovane |
| Claude Haiku 4.5 | ~€60.00 | **Fuori budget** |
| Self-hosted Llama 8B | ~€35/mese (VPS) | Richiede GPU, manutenzione |

#### 3. Perché il routing 70/25/5 (Flash-Lite/Flash/Pro)

- **70% Flash-Lite** ($0.10): domande semplici, saluti, navigazione → ~€5.88/mese
- **25% Flash** ($0.30): spiegazioni, hint, diagnosi circuito → ~€7.80/mese
- **5% Pro** ($1.25): ragionamento complesso, debugging, creativita → ~€3.75/mese
- **Totale**: ~€17.43/mese per 100 classi = **€0.17/classe/mese**

#### 4. Alternative scartate e perché

| Alternativa | Motivo scarto |
|-------------|--------------|
| **OpenAI** | No free tier, no education discount, costi piu alti a parita di qualita |
| **Claude** | 10x piu costoso, no free tier, overkill per domande scolastiche |
| **DeepSeek** | Server in Cina = GDPR problematico per scuole EU/italiane |
| **Mistral** | Qualita italiano inferiore su benchmark MMLU, sconto edu richiede .edu |
| **Grok** | Ecosistema troppo giovane, documentazione scarsa, no education program |
| **Self-hosted** | VPS senza GPU non regge modelli >7B, con GPU costo >€100/mese |
| **Gemini Pro fisso** | 7x piu costoso di Flash-Lite, inutile per il 70% delle query |

#### 5. Vantaggi specifici Gemini per scuole italiane

1. **Gemini for Education** supporta 1M+ studenti italiani (fonte: Google Blog)
2. **Workspace for Education** gia diffuso nelle scuole italiane → zero onboarding
3. **Free tier** per sviluppo e test (Flash models)
4. **Batch API** con 50% sconto per pre-generazione contenuti
5. **Context caching** risparmia 90% su prompt ripetitivi (lezioni standard)
6. **GDPR**: server EU disponibili su Vertex AI
7. **Italian language quality**: Flash-Lite supera Mistral Nemo su benchmark italiano

### Output atteso
Un file PDF generato con LaTeX, professionale, con:
- Copertina con logo ELAB
- Indice cliccabile
- Tabelle formattate
- Grafici a barre (costo per provider)
- Tutte le fonti come hyperlink cliccabili
- ZERO nomi di persone
- Footer: "Analisi tecnica — Aprile 2026"

---

## FASE 2 — ELENCO COMPLETO MODIFICHE SESSIONE 03/04/2026

### File NUOVI creati (6 file)
1. `src/components/lavagna/VolumeViewer.jsx` — PDF viewer con react-pdf, navigazione pagine, zoom 6 livelli, annotazioni per pagina salvate in localStorage, toolbar penna integrata
2. `src/components/lavagna/VolumeViewer.module.css` — Stili: navBar, penBar, pageContainer, colori ELAB
3. `src/components/lavagna/PercorsoPanel.jsx` — Wrapper FloatingWindow per LessonPathPanel, lazy-loaded
4. `src/components/WelcomePage.jsx` — Pagina benvenuto con campo chiave univoca, sostituisce VetrinaSimulatore
5. `supabase/vps-scripts/edge-tts-server.py` — Server TTS FastAPI con voce IsabellaNeural, cache, rate limit
6. `tests/unit/volumeViewer.test.jsx` — 16 test: sidebar filtering, volume detection, PDF paths, UNLIM context

### File MODIFICATI (15+ file)

#### Lavagna Core
7. `src/components/lavagna/LavagnaShell.jsx`:
   - Sidebar filtrata per volume (17 componenti con 9 nuove icone SVG)
   - VolumeViewer lazy-loaded + stato volumeOpen/currentVolume/currentVolumePage
   - PercorsoPanel lazy-loaded + stato percorsoOpen
   - MascotPresence draggable (rimpiazza UnlimBar)
   - DrawingOverlay globale RIMOSSO (causava crash)
   - Volume auto-detection da experiment ID (regex v1-/v2-/v3-)
   - UNLIM volume context via __ELAB_API._volumeContext
   - LessonBar rimossa, UnlimBar rimossa

8. `src/components/lavagna/AppHeader.jsx`:
   - Tasto AVVIA rimosso
   - Bottone "Percorso" aggiunto (con icona SVG + testo)
   - Bottone "Manuale" aggiunto (con icona SVG + testo)
   - Props: onPercorsoToggle, percorsoOpen, onVolumeToggle, volumeOpen

9. `src/components/lavagna/MascotPresence.jsx`:
   - Mascotte draggable (pointer events + localStorage posizione)
   - SVG microfono in mano quando micActive=true
   - Click vs drag detection (wasDragged ref)

10. `src/components/lavagna/useGalileoChat.js`:
    - Quick actions rimosse (array vuoto)
    - Volume context iniettato in buildTutorContext()

11. `src/components/lavagna/LavagnaShell.module.css`:
    - CSS per nascondere UI simulatore interna: controlBarRow, ExperimentGuide, LessonPathPanel, zoomControls, sidebar, ComponentPalette

12. `src/components/lavagna/RetractablePanel.module.css`:
    - Fix sidebar chiudibile: pointer-events none su .left.closed, auto su toggle

13. `src/components/lavagna/AppHeader.module.css`:
    - Nuovi stili: .btnLabeled, .btnText

#### Simulatore
14. `src/components/simulator/canvas/DrawingOverlay.jsx`:
    - Toolbar compattata: orizzontale centrata, cerchietti colore 24px, spessori dot
    - Prop initialFullscreen aggiunta

15. `src/components/simulator/panels/LessonPathPanel.jsx`:
    - Aggiunto data-elab-lesson-path="true" per targeting CSS

16. `src/components/simulator/panels/ComponentPalette.jsx`:
    - Aggiunto data-elab-palette="true" per targeting CSS

#### API e Servizi
17. `src/services/api.js`:
    - "Galileo" → "UNLIM" in system prompt + tutti i messaggi errore (5 occorrenze)

18. `src/services/voiceService.js`:
    - Edge TTS integrato come primary TTS (VPS 72.60.129.50:8880)
    - Fallback chain: Edge TTS → Nanobot → Browser speechSynthesis
    - checkVoiceCapabilities aggiornato per Edge TTS

19. `src/components/tutor/ChatOverlay.jsx`:
    - DEFAULT_SUGGESTIONS svuotato (rimossi "Come funziona un LED?" etc.)

#### Routing
20. `src/App.jsx`:
    - VetrinaSimulatore → WelcomePage
    - showcase + vetrina2 + vetrina → tutti WelcomePage

#### Build
21. `vite.config.js`:
    - react-pdf aggiunto a manualChunks per code splitting

### Dipendenze aggiunte
22. `react-pdf` v10.4.1 — PDF viewer (pdfjs-dist based)

### Infrastruttura
23. Edge TTS server avviato su VPS 72.60.129.50:8880 (IsabellaNeural)

### Metriche
- **Test**: 1091/1091 PASS (16 nuovi)
- **Build**: 32 precache entries, ~3534KB
- **Deploy**: 5+ deploy su Vercel produzione

---

## FASE 3 — DEBUG COMPLETO E STRESS TEST

### Skill da usare
- `elab-quality-gate` — gate pre/post
- `quality-audit` — audit completo
- `ricerca-bug` — ricerca sistematica bug
- `analisi-simulatore` — verifica simulatore
- `lim-simulator` — test su LIM 1024x768
- `impersonatore-utente` — test con persona docente
- `elab-nanobot-test` — test endpoint nanobot
- `analisi-galileo` — verifica qualita risposte UNLIM
- `lavagna-benchmark` — benchmark Lavagna 15 metriche

### Ciclo 1: Pre-flight check
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npx vitest run                  # 1091+ PASS
npm run build                   # 32 precache, <4000KB
npx vercel --prod --yes         # Deploy
```

### Ciclo 2: Debug penna PDF
- Aprire `#lavagna` → selezionare esperimento Vol.1
- Cliccare "Manuale" nell'header → VolumeViewer si apre
- Cliccare "Penna" nel toolbar → penBar appare nel VolumeViewer
- Disegnare sulla pagina PDF → annotazione visibile
- Cambiare pagina → annotazione scompare (salvata per pagina)
- Tornare alla pagina → annotazione riappare da localStorage
- **Bug noti da verificare**: crash penna (DrawingOverlay globale rimosso, ora integrato nel VolumeViewer), annotazioni che non persistono, toolbar che copre contenuto

### Ciclo 3: Debug sidebar componenti
- Caricare esperimento Vol.1 → sidebar mostra 8 componenti
- Caricare esperimento Vol.2 → sidebar mostra 13 componenti
- Caricare esperimento Vol.3 → sidebar mostra 17 componenti
- Chiudere sidebar → sparisce completamente (translateX -100%)
- Riaprire sidebar → freccia toggle visibile e funzionante

### Ciclo 4: Debug UNLIM
- Aprire mascotte → FloatingWindow UNLIM si apre
- Verificare che UNLIM si presenta come "UNLIM" (non "Galileo")
- Verificare che non ci sono quick suggestions ("Come funziona un LED?" etc.)
- Con volume aperto su pagina 5: UNLIM riceve contesto "[Volume aperto: Volume 1...]"
- Testare voce: attivare mic → mascotte mostra microfono SVG in mano

### Ciclo 5: Debug percorso lezione
- Caricare esperimento → cliccare "Percorso" nell'header
- PercorsoPanel si apre in FloatingWindow trascinabile
- Verificare che le 6 fasi sono visibili e espandibili
- "Chiedi a UNLIM un percorso piu dettagliato" funziona

### Ciclo 6: Debug welcome page
- Navigare a `#vetrina` → WelcomePage con campo chiave
- Navigare a `#showcase` → stessa WelcomePage
- Navigare a `#vetrina2` → stessa WelcomePage
- Inserire chiave → redirect a `#lavagna`

### Ciclo 7: Debug Edge TTS
- `curl http://72.60.129.50:8880/health` → {"status":"ok"}
- Aprire UNLIM, attivare voce, chiedere qualcosa → risposta parlata con voce IsabellaNeural
- Se VPS down → fallback a browser TTS (non crash)

### Ciclo 8: Stress test finale
- Aprire contemporaneamente: Volume PDF + UNLIM + Percorso + Sidebar
- Navigare 20 pagine PDF velocemente → no crash
- Disegnare 50 tratti sulla stessa pagina → no lag
- Inviare 10 messaggi rapidi a UNLIM → rate limit funziona
- Ridimensionare finestra a 1024x768 (LIM) → tutto visibile
- Test su mobile landscape → sidebar nascosta, header compatto

### Regole
1. **MAI mentire sui risultati** — se un test fallisce, scrivere FAIL con dettaglio
2. **Score onesto** — self-score max +0.5 dal reale, mai inflare
3. **Engine intoccabile**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js
4. **Zero regressioni**: vitest 1091+ PASS, build <4000KB
5. **Ogni fix**: test prima e dopo

### Output atteso
1. PDF LaTeX con analisi Gemini (Fase 1)
2. Lista bug trovati con severita (P0/P1/P2)
3. Score onesto per area (simulatore, UNLIM, PDF viewer, penna, sidebar, percorso)
4. Piano fix per bug P0/P1
5. Deploy finale verificato
