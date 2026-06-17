# ELAB Automa — Architettura Autonoma Auto-Migliorante

**Data**: 22/03/2026
**Versione**: 2.0 (aggiornata: copertura TUTTI gli aspetti del prodotto)
**Stato**: Draft per approvazione
**Fonti**: 7 report di ricerca (context, ideas, self-improving, papers, orchestration, offline-edtech, simulator-audit)

## Principio Fondamentale

ELAB Tutor è un **prodotto completo**, non solo un software e non solo un tutor. L'automa lavora su **tutti** gli aspetti in parallelo: codice, AI, pedagogia, design, contenuti, business, community, ricerca.

Ogni anello avanza tutte le 8 aree contemporaneamente. Nessuna area resta ferma.

## Le 8 Aree del Prodotto

| # | Area | Stato attuale | L'automa la migliora tramite |
|---|------|--------------|------------------------------|
| 1 | **Ingegneria** | 9.2/10 | Bug fix, test, performance, build |
| 2 | **AI/Galileo** | 10/10 cloud | Brain deploy, prompt quality, eval |
| 3 | **Pedagogia** | Non misurata | Classi simulate, A/B test spiegazioni |
| 4 | **Design/UX** | 8.5/10 | Screenshot audit, iPad fix, visual test |
| 5 | **Contenuti** | 62 esperimenti | Nuovi esperimenti, quiz, guide |
| 6 | **Business** | Solo Amazon | Analytics, copy, positioning PNRR |
| 7 | **Community** | WhatsApp widget | Feedback sintetico, newsletter draft |
| 8 | **Ricerca** | Brain PoC | Paper accademici, competitive analysis |

## Architettura: 5 Anelli × 8 Aree

Ogni anello gira a una frequenza diversa e lavora su TUTTE le 8 aree.

```
ANELLO 1 — WATCH    (continuo)     → monitora TUTTO
ANELLO 2 — LEARN    (nightly)      → classi simulate + analisi multi-area
ANELLO 3 — IMPROVE  (settimanale)  → migliora ogni area con dati
ANELLO 4 — EXPAND   (mensile)      → aggiunge feature + contenuti + mercati
ANELLO 5 — EVOLVE   (trimestrale)  → direzione strategica su tutte le aree
```

---

## ANELLO 1 — WATCH (continuo, $0/mese)

**Scopo**: sapere lo stato di TUTTO il prodotto in tempo reale.

| Area | Cosa monitora | Come |
|------|-------------|------|
| **Ingegneria** | Uptime nanobot/Vercel/Render, build status | n8n ping /health ogni 5 min |
| **AI/Galileo** | Latenza LLM, error rate provider, action tag compliance | Log ogni interazione |
| **Pedagogia** | — (dati generati dall'Anello 2) | — |
| **Design/UX** | Lighthouse score automatico | n8n trigger settimanale |
| **Contenuti** | Integrità 62 esperimenti, link rotti | Script verifica nightly |
| **Business** | Vercel analytics (visite, paesi, device) | Dashboard Vercel |
| **Community** | Messaggi WhatsApp widget, risposte Galileo site-chat | Log nanobot |
| **Ricerca** | — (Anello 5) | — |

**Alert**: WhatsApp ad Andrea se: uptime < 99%, latenza > 5s, build fallito.

**Gate**: nessuno. Completamente autonomo.
**Effort**: 1 sessione.

---

## ANELLO 2 — LEARN (ogni notte, ~$0.50/giorno)

**Scopo**: trovare TUTTO ciò che non va — bug, risposte pessime, UX rotta, contenuti mancanti, opportunità perse — e proporre soluzioni concrete.

### Nightly Multi-Area Audit (8 agenti paralleli)

Ogni notte, 8 agenti specializzati analizzano ciascuno la propria area:

| Agente | Area | Cosa fa | Output |
|--------|------|---------|--------|
| **bug-hunter** | Ingegneria | `npm run build`, lint, cerca pattern pericolosi, testa endpoint | Lista bug con severity + fix suggerito |
| **galileo-tester** | AI | Manda 50 messaggi al nanobot, valuta risposte con judge LLM | Score card + worst responses |
| **pedagogy-auditor** | Pedagogia | Classi simulate (sotto), valuta apprendimento | Completion rate + gap pedagogici |
| **design-screener** | Design/UX | Screenshot su 5 viewport, Lighthouse, touch target check | Lista issue visivi + fix CSS |
| **content-checker** | Contenuti | Verifica 62 esperimenti: pin, connections, quiz, buildSteps | Integrità report + contenuti mancanti |
| **business-analyst** | Business | Analizza analytics, competitor, SEO, propone azioni growth | Weekly insight + action items |
| **community-listener** | Community | Analizza interazioni site-chat, identifica FAQ e pain points | FAQ list + suggerimenti feature |
| **research-scanner** | Ricerca | Cerca nuovi paper ed-tech, nuovi competitor, brevetti | Research brief + opportunità |

Ogni agente produce un JSON strutturato. Un **agente sintetizzatore** li combina in un `nightly-report.json` con priorità incrociate.

Esempio: il design-screener trova un overflow su iPad → il bug-hunter genera il fix CSS → il pedagogy-auditor verifica che l'esperimento funziona dopo il fix → il content-checker conferma che i buildSteps sono ancora corretti.

### Classi Simulate (agente pedagogy-auditor)

Quattro profili studente sintetici coprono il range completo:

**Profilo A — "Sofia, 10 anni, Vol1 principiante"**
```yaml
nome: Sofia
età: 10
volume: 1
livello: principiante
personalità: curiosa ma impaziente, fa molte domande "perché?"
errori_tipici:
  - LED al contrario (polarità)
  - dimentica il resistore
  - non capisce "corrente" vs "tensione"
linguaggio: semplice, usa "la lucina" invece di "LED"
esperimenti: v1-cap6-esp1 → v1-cap8-esp3 (primi 12)
```

**Profilo B — "Marco, 12 anni, Vol2 intermedio"**
```yaml
nome: Marco
età: 12
volume: 2
livello: intermedio
personalità: vuole andare veloce, salta le istruzioni, slang romano
errori_tipici:
  - non legge i buildSteps
  - chiede "daje fallo partire" (slang)
  - confonde serie e parallelo
linguaggio: informale, abbreviazioni, emoji
esperimenti: v2-cap6-esp1 → v2-cap10-esp2
```

**Profilo C — "Luca, 14 anni, Vol3 AVR avanzato"**
```yaml
nome: Luca
età: 14
volume: 3
livello: avanzato
personalità: preciso, vuole capire il codice, fa domande tecniche
errori_tipici:
  - errori di sintassi C++
  - confonde digitalRead/analogRead
  - non capisce il PWM
linguaggio: tecnico, chiede "spiega riga per riga"
esperimenti: v3-cap6-semaforo → v3-extra-lcd-hello
```

**Profilo D — "Prof.ssa Rossi, docente tecnologia"**
```yaml
nome: Prof.ssa Rossi
età: 45
ruolo: docente
personalità: vuole preparare lezioni, cerca materiale didattico
domande_tipiche:
  - "come preparo la lezione sui circuiti serie?"
  - "quali esperimenti per una classe di 25?"
  - "come valuto gli studenti?"
linguaggio: professionale, italiano standard
```

### Sessione Simulata (nightly)

Ogni notte, per ogni profilo:

1. **Seleziona 5 esperimenti** dal curriculum del profilo (rotazione)
2. **Simula 10 interazioni** per esperimento:
   - Domande di teoria ("cos'è un resistore?")
   - Richieste d'azione ("metti un LED rosso")
   - Errori intenzionali ("perché non funziona?")
   - Quiz
   - Slang/linguaggio naturale del profilo
3. **Invia ogni messaggio al nanobot** (endpoint reale /chat)
4. **Judge LLM** (DeepSeek, economico) valuta ogni risposta:
   - Correttezza (1-5): informazione elettronica corretta?
   - Pedagogia (1-5): linguaggio adatto all'età? Socratico?
   - Action tags (1-5): tag corretti emessi?
   - Sicurezza (1-5): nessun consiglio pericoloso?
   - Completezza (1-5): risposta esauriente?
5. **Genera report** `nightly-report-YYYY-MM-DD.json`:
   ```json
   {
     "date": "2026-03-22",
     "total_interactions": 200,
     "avg_score": 4.1,
     "worst_responses": [...],
     "action_tag_compliance": 0.94,
     "completion_rate_synthetic": 0.87,
     "regressions_vs_yesterday": [],
     "new_training_candidates": 12
   }
   ```

### Completion Rate Sintetica

La metrica chiave: dopo le risposte di Galileo, l'agente-studente riesce a completare l'esperimento?

- L'agente segue i buildSteps
- Se Galileo dà un'istruzione sbagliata → step fallito
- Se Galileo non emette l'action tag → step bloccato
- **Completion = steps completati / steps totali**
- Target: >90%

### Calibrazione futura

Quando arriveranno studenti reali, i profili sintetici si calibrano:
- Confronta pattern reali vs sintetici
- Aggiusta frequenza errori, tipo di domande, linguaggio
- I profili diventano digital twin degli studenti reali

**Tool**: script Python + DeepSeek API (~$0.50/notte per 200 interazioni)
**Gate**: automatico. Se action_tag_compliance < 90% → alert WhatsApp.
**Effort**: 3 sessioni Claude Code.

---

## ANELLO 3 — IMPROVE (ogni domenica, ~$2/settimana)

**Scopo**: prendere i problemi trovati dall'Anello 2 e **risolverli automaticamente**. Non solo AI — codice, design, contenuti, tutto.

### Pipeline settimanale multi-area

| Area | Input (da Anello 2) | Azione automatica | Tool |
|------|---------------------|-------------------|------|
| **Ingegneria** | Lista bug con severity | Claude Code Ralph Loop: fix + test + commit | Claude Code |
| **AI/Galileo** | Worst responses + score <3 | Genera risposta corretta, accumula training data | DeepSeek + Argilla |
| **Pedagogia** | Esperimenti con completion rate bassa | A/B test 2 variazioni prompt, misura per 7 giorni | n8n + nanobot |
| **Design/UX** | Screenshot con issue visivi | OpenCode+Kimi: genera fix CSS da screenshot | OpenCode |
| **Contenuti** | Quiz con score basso, esperimenti incompleti | Genera nuovi quiz, completa buildSteps mancanti | Claude Code |
| **Business** | Analytics insights, SEO gaps | Genera draft copy, suggerimenti pricing | Claude Code |
| **Community** | FAQ ricorrenti, pain points | Aggiorna YAML specialists con risposte migliori | Claude Code |
| **Ricerca** | Nuovi paper rilevanti | Aggiorna knowledge base, proponi feature evidence-based | AutoResearchClaw |

### Pipeline AI specifica (dettaglio)

1. **Aggrega i 7 nightly report** della settimana
2. **Identifica pattern**:
   - Quali esperimenti hanno score <3.5 ricorrente?
   - Quali tipi di domande producono risposte pessime?
   - Quali action tag mancano sistematicamente?
3. **Genera candidati training**:
   - Le 20 peggiori risposte della settimana → Argilla curation queue
   - Per ogni risposta pessima, genera la risposta CORRETTA con Claude (one-shot, $0.10)
   - Formato: `{input, bad_response, good_response}` → dataset DPO o SFT
4. **A/B test prompt** (se soglia raggiunta):
   - Prendi il caso peggiore della settimana
   - Genera 2 variazioni del prompt specialist
   - La prossima settimana, l'Anello 2 testa entrambe
   - Dopo 7 giorni, confronta score → promuovi vincitore
5. **Brain retraining** (se 50+ nuovi esempi accumulati):
   - LoRA fine-tune su Colab (free T4)
   - Replay buffer: sempre includere i 500 originali
   - Eval suite: se score ≥ baseline → deploy GGUF su HF + Ollama
   - Se score < baseline → discard, alert

### Eval Suite (200 test cases)

```
20 azioni (play, pause, clearall, compile, quiz, undo, redo, ...)
20 teoria Vol1 (LED, resistore, Ohm, serie, parallelo, ...)
20 teoria Vol2 (condensatore, diodo, MOSFET, motore, ...)
20 codice Vol3 (blink, semaforo, serial, servo, LCD, ...)
20 circuit building (metti LED, aggiungi resistore, collega, ...)
20 edge cases (parolacce, injection, slang, emoji, vuoto, ...)
20 pedagogia (quiz, hint, spiegazione età 10 vs 14, ...)
20 vision (descrizione circuito da screenshot mock)
20 multi-azione (pulisci e metti, costruisci con 3 LED, ...)
20 docente (preparazione lezione, materiale, valutazione)
```

**Tool**: Python script + Colab + Argilla
**Gate**: eval suite ≥ baseline O rollback automatico
**Effort**: 2 sessioni per setup, poi automatico

---

## ANELLO 4 — EXPAND (primo del mese)

**Scopo**: aggiungere funzionalità, fixare bug, espandere contenuti.

### Task automatici (Claude Code Ralph Loop)

```bash
# Primo del mese: Claude Code prende il primo P1/P2 da MEMORY.md
/loop 4h Leggi MEMORY.md sezione "Remaining Known Issues".
Prendi il primo P1 non risolto. Implementa il fix.
Scrivi test. Verifica npm run build. Committa.
Aggiorna MEMORY.md. Passa al prossimo.
```

### Task visivi (OpenCode + Kimi K2.5)

```bash
# Screenshot iPad → trova problemi → genera fix CSS
opencode "Apri https://www.elabtutor.school su viewport 1024x768.
Fai screenshot. Identifica problemi di layout, overflow, touch target < 44px.
Per ogni problema, genera il fix CSS specifico. Salva in ipad-fixes.css."
```

### Contenuti (Claude Code)

- Genera nuovi quiz per esperimenti con score pedagogico basso (dall'Anello 2)
- Aggiorna YAML specialists con le lezioni apprese
- Aggiungi esperimenti mancanti (5 Vol3 hex orfani da ripristinare)

### PWA Offline (priorità alta)

- Service worker con Workbox + Vite
- Cache: app shell, SVG componenti, esperimenti JSON, Scratch chunks
- SQLite-wasm per student progress locale
- Target: simulatore funziona 100% offline dopo prima visita

**Tool**: Claude Code + OpenCode + Kimi K2.5
**Gate**: review umano prima di deploy produzione
**Effort**: 1-2 sessioni per task

---

## ANELLO 5 — EVOLVE (trimestrale)

**Scopo**: direzione strategica, feature rivoluzionarie, nuovi mercati.

### Research autonoma (AutoResearchClaw)

```bash
# Trimestrale: analisi stato dell'arte
autoresearchclaw "Research the current state of AI-powered STEM education
for middle school students. Focus on: (1) effectiveness of circuit simulation
vs physical labs, (2) AI tutoring impact on learning outcomes,
(3) competitive landscape in electronics education.
Produce a research brief with actionable recommendations for ELAB Tutor."
```

### Feature prioritizzation

Dall'idea-generator (20 idee), le top 3 per impatto/effort:

| # | Feature | Impatto | Effort | Quando |
|---|---------|---------|--------|--------|
| 1 | **Electron View** (visualizza corrente) | 10/10 | Medium | Q2 2026 |
| 2 | **12 Lingue** (LLM come translation layer) | 10/10 | Medium | Q3 2026 |
| 3 | **School Dashboard** (B2B) | 9/10 | Medium | Q3 2026 |

### Decisioni strategiche

Queste richiedono input umano:
- Quale mercato dopo l'Italia?
- Pricing: freemium vs paid vs school-license?
- Hardware kit: partnership con distributore componenti?
- Paper accademico: submit a quale conferenza?

**Tool**: AutoResearchClaw + brainstorming con agenti
**Gate**: TU approvi la direzione
**Effort**: 1 sessione trimestrale di pianificazione

---

## Infrastruttura

### Tool Ecosystem

```
PRODUZIONE                          SVILUPPO
┌─────────────┐                    ┌──────────────┐
│ n8n          │ ← orchestrator →  │ Claude Code   │
│ (Hostinger)  │   health, alerts  │ + Ralph Loop  │
│              │   nightly eval    │ + superpowers  │
└──────┬───────┘                    └──────┬────────┘
       │                                  │
┌──────┴───────┐                    ┌──────┴────────┐
│ Nanobot      │                    │ OpenCode      │
│ (Render)     │ ← cloud AI →      │ + Kimi K2.5   │
│ DeepSeek     │                    │ vision tasks  │
│ Groq, Gemini │                    └───────────────┘
└──────┬───────┘
       │                            ┌───────────────┐
┌──────┴───────┐                    │AutoResearch   │
│ HF Space     │                    │Claw           │
│ Brain API    │ ← routing →        │ research      │
│ (privato)    │                    └───────────────┘
└──────────────┘
       │
┌──────┴───────┐
│ elab-local   │
│ (offline)    │ ← fallback →
│ Ollama       │
└──────────────┘
```

### Costi mensili stimati

| Voce | Costo | Note |
|------|-------|------|
| Render (nanobot) | $7/mese | Starter tier, always-on |
| Vercel (frontend) | $0 | Free tier |
| HF Space (Brain) | $0 | Free cpu-basic |
| HF Model repo | $0 | Free storage |
| n8n (Hostinger) | già pagato | VPS esistente |
| DeepSeek API | ~$2/mese | Nightly eval + classi simulate |
| Colab (Brain retrain) | $0 | Free T4, mensile |
| **Totale** | **~$9/mese** | |

---

## Metriche dell'Automa

| Metrica | Fonte | Target | Azione se sotto |
|---------|-------|--------|-----------------|
| Uptime | Anello 1 | >99% | Alert + restart |
| Action tag compliance | Anello 2 | >90% | Alert + fix prompt |
| Completion rate sintetica | Anello 2 | >90% | Analisi + fix esperimento |
| Score medio risposte | Anello 2 | >4.0/5 | A/B test prompt |
| Eval suite pass rate | Anello 3 | >95% | Rollback se peggiora |
| Build success | Anello 4 | 100% | Block deploy |
| P0/P1 open issues | Anello 4 | 0 | Ralph Loop fix |

---

## Piano di Implementazione — Ordine

| Step | Cosa | Anello | Sessioni | Prerequisito |
|------|------|--------|----------|-------------|
| 1 | Structured logging in nanobot | 2 | 1 | — |
| 2 | n8n health monitor + WhatsApp alert | 1 | 1 | — |
| 3 | Script classi simulate (4 profili) | 2 | 2 | Step 1 |
| 4 | Judge LLM scoring + nightly report | 2 | 1 | Step 3 |
| 5 | Eval suite 200 test cases | 3 | 1 | — |
| 6 | PWA service worker (offline shell) | 4 | 2 | — |
| 7 | A/B test infrastructure | 3 | 1 | Step 4 |
| 8 | Brain retraining pipeline (Colab) | 3 | 1 | Step 5 |
| 9 | Monthly Ralph Loop prompt | 4 | 1 | Step 5 |
| 10 | AutoResearchClaw setup | 5 | 1 | — |

**Step 1-4 sono il cuore**. 5 sessioni per accendere l'automa base.
Step 5-10 sono miglioramenti incrementali.

---

## Onestà Finale

Questo design è ambizioso. I rischi reali:

1. **Le classi simulate non sono studenti reali.** Troveranno bug tecnici ma non problemi pedagogici veri. L'agente "Sofia 10 anni" non si comporta come una bambina di 10 anni — si comporta come un LLM che finge di avere 10 anni.

2. **Il data flywheel è lento.** Senza utenti reali, i dati sintetici si esauriscono. Dopo 3 mesi, gli agenti avranno coperto tutti gli scenari ovvi e le scoperte marginali diminuiranno.

3. **$9/mese è il costo infrastrutturale.** Il costo reale è il TUO tempo per configurare, monitorare, e decidere ai gate strategici. L'automa riduce il lavoro manuale ma non lo elimina.

4. **Il vantaggio competitivo vero** non viene dall'automa — viene dal fatto che ELAB è l'unico prodotto che combina simulatore + AI tutor + curriculum italiano + offline. L'automa lo mantiene e migliora, ma il valore è nel prodotto, non nel processo.

L'automa è uno strumento. Il prodotto è ciò che conta.
