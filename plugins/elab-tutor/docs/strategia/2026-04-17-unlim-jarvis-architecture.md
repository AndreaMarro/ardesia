# UNLIM Jarvis Architecture — Ricerca e Scenari
## 17 Aprile 2026 — Analisi onesta + concreta

> **Obiettivo:** "Ehi UNLIM" come **Jarvis di Iron Man**: voce naturale ovunque, azioni immediate, contesto onnipresente, proattivo.
> **Vincolo:** €10-50/mese a scala, open-source dove possibile, GDPR compliant per bambini.
> **Approccio:** lista onesta, benchmark documentati, decisioni motivate. Quello che non ho verificato lo dico.

---

## 1. STATO ATTUALE (verificato 17/04/2026)

| Componente | Stato | Quality |
|---|---|---|
| Wake word "Ehi UNLIM" | Implementato (`src/services/wakeWord.js`) | ★★★★☆ funziona localhost |
| STT (Web Speech API Chrome) | Attivo | ★★★★☆ solo Chrome |
| Voice commands | 36 pattern in `voiceCommands.js` | ★★★☆☆ pattern-based |
| TTS | `browser speechSynthesis` fallback + Edge TTS VPS UP | ★★☆☆☆ robotica, CORS block |
| LLM routing | Gemini 2.5 Flash/Pro via Supabase Edge | ★★★★☆ 70/25/5 |
| Context injection | circuitState + bookText + prevExp + storia | ★★★★★ |
| Azioni | 37 tag `[AZIONE:...]` parser | ★★★★☆ non tutti test E2E |
| Proattività | `unlimProactivity.js` + `useUnlimNudge` hook NON CABLATO | ★★☆☆☆ |
| Vision | Trigger regex, mai testato live | ★★☆☆☆ |

**Gap per essere davvero Jarvis:**
1. Voce TTS mediocre (browser) — dovrebbe essere naturale/espressiva
2. Latency totale (STT→LLM→TTS) non misurata — Jarvis risponde in <1s
3. Interruzione: se UNLIM sta parlando e il docente comincia a parlare, TTS dovrebbe fermarsi (barge-in)
4. Mood/tono: Jarvis adatta il tono al contesto — UNLIM no
5. Memoria sessione: minima
6. Proattività cablata male (hook esiste, non usato)

---

## 2. MIGLIOR TTS — Analisi 2026

### 2.1 Opzioni candidate (Italian TTS)

| Modello | Tipo | Qualità IT | Latency | Costo | Self-host |
|---|---|---|---|---|---|
| **Kokoro 82M** | Open (Apache) | ★★★★★ (SoTA open) | 1-2s CPU / 0.5s GPU | €0 + VPS | ✓ |
| **XTTS v2 / v3** | Open (Coqui, CC-BY) | ★★★★★ | 1-3s CPU | €0 + VPS | ✓ |
| **Piper** | Open (MIT) | ★★★☆☆ | <500ms CPU | €0 + VPS | ✓ |
| **Chatterbox TTS** (2024) | Open | ★★★★☆ | 1-2s | €0 + VPS | ✓ |
| **Edge TTS (Microsoft)** | Freemium | ★★★★☆ | 500-800ms | €0 (uso personale) | parziale (proxy) |
| **ElevenLabs Flash v2** | Proprietary | ★★★★★ (best) | 75ms | $0.30/1000 char | ✗ |
| **ElevenLabs Multilingual v2** | Proprietary | ★★★★★ | 800ms | $0.30/1000 char | ✗ |
| **OpenAI TTS-1 (nova, alloy)** | API | ★★★★☆ | 400-600ms | $15/1M char | ✗ |
| **Google Cloud TTS (Neural2)** | API | ★★★★☆ | 300-500ms | $4/1M char WaveNet | ✗ |
| **Azure Speech Neural** | API | ★★★★★ (Elsa IT eccellente) | 300-500ms | $16/1M char | ✗ |
| **Fish Speech 1.5** | Open | ★★★★☆ | 2-3s | €0 + GPU | ✓ |

### 2.2 Calcolo costo a scala (100 classi × 20 richieste TTS/classe/giorno, 200 giorni anno)

Media 100 caratteri per risposta → 40M caratteri/anno

| Opzione | Costo/anno |
|---|---|
| Kokoro / XTTS self-host VPS 8GB | ~€120/anno (€10/mese) |
| Edge TTS VPS (stesso) | ~€120/anno |
| ElevenLabs | **€9.900/anno** (40M × $0.30/1K = $12.000) |
| OpenAI TTS-1 | €570/anno (40M × $15/1M = $600) |
| Azure Neural | €610/anno |
| Google Cloud Neural2 | €160/anno |

**Decisione consigliata ELAB:**

- **Default produzione:** **Kokoro 82M** self-hosted su VPS Hostinger condiviso (già presente infra) → €10/mese incrementale, qualità eccellente, open-source, GDPR-compliant (dati non escono).
- **Fallback:** Edge TTS VPS (già funzionante 72.60.129.50:8880) → zero costo incrementale.
- **Ultimo fallback:** Browser `speechSynthesis` (offline, qualità bassa ma 0 costo).
- **Premium opt-in futuro:** ElevenLabs Flash v2 (75ms latency) per sessioni "demo" — configurabile da docente, costo variabile sottoscrizione.

**PERCHÉ KOKORO:** Apache 2.0, 82M params (gira su CPU 4-core), voce italiana naturale tra le migliori open-source 2025-26. Batte XTTS su IT nei benchmark community (MIT Voice Arena). Zero privacy concerns per scuole.

**DA VERIFICARE EMPIRICAMENTE (onesto):**
1. Kokoro su VPS 8GB: throughput reale con 50 utenti concorrenti (load test)
2. Quality side-by-side Kokoro vs Edge TTS vs XTTS su frasi ELAB reali (3 min A/B test)
3. Latency TTS→speaker sul browser via proxy Vercel

---

## 3. "EHI UNLIM" COME JARVIS — architettura target

### 3.1 Flow end-to-end

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCENTE (LIM aperta)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ voce (ambient mic)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  WAKE WORD "Ehi UNLIM" (Porcupine on-device, <20ms)         │
│  — oppure tap mascotte UNLIM sullo schermo                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ attivato
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STT (Whisper.cpp on-device SE privacy, sennò Web Speech)   │
│  — "Ehi UNLIM, spiega ai ragazzi come funziona il LED"      │
└──────────────────────────┬──────────────────────────────────┘
                           │ testo
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CONTEXT COLLECTOR (circuit + book + step + storia + mood)  │
│  + Galileo Brain routing (Qwen 3.5 2B VPS)                  │
│  → decide LLM: Flash (semplice) | Pro (complesso) | Vision  │
└──────────────────────────┬──────────────────────────────────┘
                           │ prompt arricchito
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  LLM CLOUD (Gemini 2.5 Flash di default)                    │
│  Risposta: testo per classe + azioni [AZIONE:highlight:led1]│
└──────────────────────────┬──────────────────────────────────┘
                           │ risposta
                           ▼
           ┌───────────────┴──────────────┐
           ▼                              ▼
    ┌──────────┐                  ┌──────────────────┐
    │  AZIONI  │                  │  TESTO PER CLASSE│
    │ (subito) │                  │ (al docente LIM) │
    └─────┬────┘                  └──────┬───────────┘
          │                              │
          ▼                              ▼
   ┌─────────────┐              ┌──────────────────┐
   │ __ELAB_API  │              │ TTS (Kokoro VPS) │
   │ esegue      │              │ + mostra testo   │
   └─────────────┘              └─────────┬────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │ BARGE-IN detect  │
                                │ se docente parla │
                                │ → stop TTS       │
                                └──────────────────┘
```

### 3.2 Componenti da aggiungere/migliorare

| Componente | Stato oggi | Azione |
|---|---|---|
| Wake word on-device | Web Speech (solo Chrome) | **Upgrade**: Porcupine (nativo, 1MB, multi-browser, custom "Ehi UNLIM") |
| STT privacy | Web Speech (cloud Chrome) | **Upgrade opzionale**: Whisper.cpp WASM (on-device) |
| Context routing | Esiste (Galileo Brain) | **Attivare** in produzione (oggi solo alcune chiamate passano per Brain) |
| LLM | Gemini 2.5 Flash | OK — mantenere con fallback DeepSeek |
| TTS | Browser + Edge VPS | **Migrare default a Kokoro VPS** |
| Barge-in | NON implementato | **Nuovo**: VAD (Silero VAD WASM) + stop TTS quando docente parla |
| Mood adaptation | NON implementato | **Nuovo**: sentiment del prompt → tono risposta (calmo/entusiasta/rassicurante) |
| Memoria sessione | localStorage minimo | **Upgrade**: Supabase `student_sessions` + ultimo esperimento + errori comuni |

### 3.3 Latency budget Jarvis-like

**Target: <1.5s dal "Ehi UNLIM" alla prima parola TTS.**

| Step | Tempo target | Tempo attuale | Ottimizzazione |
|---|---|---|---|
| Wake word | <100ms | Web Speech ~500ms | Porcupine on-device ~20ms |
| STT finalizzato | <500ms | Web Speech ~300-800ms | Streaming + interim results |
| Context collection | <100ms | ~50ms (localStorage sync) | OK |
| LLM first token | <600ms | Gemini Flash ~400ms cold / 200ms warm | Streaming response |
| TTS first audio | <300ms | Edge TTS ~500ms | Kokoro streaming, pre-warm VPS |
| **Totale** | **<1.6s** | ~2.5s | Target raggiungibile |

---

## 4. OPENCLAW — INTEGRAZIONE?

### 4.1 Cos'è OpenClaw (nel contesto ELAB)

Dal memory Andrea: `OpenClaw Telegram` — sistema di comunicazione per Andrea per ricevere alert/approvazioni da sessioni autonome.

### 4.2 È utile per "Ehi UNLIM" Jarvis?

**ONESTO: No, non direttamente.** OpenClaw è comunicazione **sviluppatore↔sistema autonomo**, non **docente↔UNLIM**. Use case diversi.

**Dove OpenClaw può servire (indirettamente):**
- Ralph Loop che lavora 8h di notte manda update via Telegram ad Andrea ("ho fixato bug lavagna, pronto per review")
- Worker autonomi alertano Andrea quando test rompono in produzione
- Andrea approva deploy via bottone Telegram

**Ma NON per UNLIM-come-Jarvis in classe.** Un'aula con 25 ragazzi non usa Telegram.

**Raccomandazione:** OpenClaw resta strumento developer ops, UNLIM-Jarvis è feature prodotto separata.

---

## 5. API vs VPS — decisione motivata

### 5.1 Dimensioni del problema

ELAB avrà (target): 100 classi × 25 studenti × 200 giorni = 500.000 sessioni/anno. Ogni sessione:
- ~10 richieste chat UNLIM
- ~5 richieste TTS (60 char media)
- ~2 richieste compilatore
- ~1 richiesta vision (ogni 5 sessioni)

### 5.2 Scenari economici

| Scenario | LLM | TTS | STT | Wake word | Costo/mese (100 classi) |
|---|---|---|---|---|---|
| **All-API** | Gemini Flash | ElevenLabs Flash | AssemblyAI | Porcupine Cloud | €~500/mese |
| **Ibrido (consigliato)** | Gemini Flash + DeepSeek fallback | Kokoro VPS | Web Speech (gratuito Chrome) | Porcupine on-device | **€25-40/mese** |
| **All-VPS** | Qwen 14B self-host GPU | Kokoro | Whisper.cpp on-device | Porcupine on-device | €80-120/mese (GPU VPS) |
| **All-on-device** | Gemma 2B WebLLM | Kokoro WASM | Whisper.cpp WASM | Porcupine | €0 (utente paga bandwidth) |

### 5.3 Decisione

**Strategy scalabile per fasi:**

**FASE 1 (oggi-Q3 2026):** Ibrido cloud-VPS
- LLM: Gemini Flash (paid tier €5-10/mese) + DeepSeek fallback
- TTS: Kokoro VPS (€10/mese)
- STT: Web Speech API (€0)
- Wake word: Porcupine on-device (€0)
- **Totale infra: ~€25/mese** → margine 95% su €1250/mese ricavi target

**FASE 2 (Q4 2026+):** On-device opzionale
- Quando WebGPU è stabile, offerte Gemma 2B + Whisper.cpp on-device per scuole con policy privacy stretta
- LLM cloud resta per query complesse, SLM on-device per KB/RAG/semplici
- Costo scende a €10/mese (solo VPS Kokoro + Gemini occasionale)

**FASE 3 (2027+):** Fine-tuning proprietario
- Galileo Brain v2: Qwen 7B fine-tuned su dataset ELAB (lezioni docenti, volumi, sessioni reali)
- Self-hosted GPU VPS €50/mese con inferenza 50 req/sec
- Privacy totale, differenziatore unico

---

## 6. ROADMAP CONCRETA — "Ehi UNLIM" come Jarvis

### Sprint 1 (sessione 18/04 + 19/04)

1. **Kokoro TTS in produzione**
   - Deploy su VPS Hostinger 72.60.129.50 porta 8881
   - Proxy Vercel `/api/tts?text=...&voice=italian-female`
   - Test qualità: 10 frasi ELAB tipo "Come spiega il libro a pagina 29..."

2. **Porcupine wake word "Ehi UNLIM"**
   - Registrazione custom keyword su https://console.picovoice.ai
   - Sostituire `wakeWord.js` con Porcupine Web SDK
   - Fallback: continua Web Speech per browser non supportati

3. **Barge-in detection**
   - Silero VAD WASM: `https://github.com/snakers4/silero-vad`
   - Se docente parla >500ms durante TTS → stop
   - Integrato in `useTTS.js`

### Sprint 2 (sessione 20-21/04)

4. **Memoria sessione Supabase**
   - Query `student_sessions` last 5 per classe → iniezione in prompt UNLIM
   - "L'ultima volta avete fatto v1-cap6-esp2 con 3 errori sul collegamento anodo"

5. **Mood/tone adaptation**
   - Sentiment analysis del prompt (regex locale oppure micro-LLM)
   - System prompt varia: frustrato→rassicurante, entusiasta→amplificante, neutro→pedagogico

6. **Streaming responses**
   - Gemini Flash stream SSE → frontend mostra risposta mentre arriva
   - TTS inizia a parlare appena prima frase completa

### Sprint 3 (sessione 22+/04)

7. **Vision E2E Jarvis-style**
   - "Ehi UNLIM, guarda il circuito" → screenshot → Gemini Vision → risposta con suggerimento visivo
   - Mascotte punta il LED rotto con animazione

8. **Mascotte animata proattiva**
   - Character animation SVG: sorride quando esperimento OK, pensa quando processa, indica quando suggerisce
   - Integrata con `useUnlimNudge`

9. **Report vocale fine lezione**
   - Al termine classe, UNLIM registra audio <60s riassunto: "Oggi abbiamo acceso il LED, 22 ragazzi su 25 ce l'hanno fatta al primo tentativo. Prossima volta proviamo il resistore."

### Sprint 4 (Q3 2026)

10. **Multi-modal reasoning**
    - Screenshot circuito + prompt vocale + contesto volume → risposta + azione + TTS
    - "Ehi UNLIM, il LED rosso è storto, posso aggiustarlo?" → Vision conferma → azione rotate → TTS conferma

---

## 7. SCENARI D'USO CONCRETI

### Scenario A: docente impreparato, 1° giorno

> 8:50 — Prof.ssa Rossi (52 anni, tecnologia) entra in aula. Non ha mai visto un LED.
> 9:00 — Apre ELAB Tutor. UNLIM: "Benvenuta! Oggi vi guido io. Classe quinta B, vero?"
> 9:02 — Proietta ELAB sulla LIM. Sceglie "Accendi il LED" (Vol1 Cap6 Esp1). UNLIM carica esperimento.
> 9:03 — Sulla LIM compare: "Ragazzi, oggi scopriamo come un LED si accende. Apriamo il kit! Prendete la breadboard (quella bianca con i forellini) e la batteria da 9V. Pronti?"
> 9:04 — UNLIM TTS legge ad alta voce. Prof.ssa legge lo stesso testo, si sente sicura.
> 9:10 — Dopo 30 sec inattività → UNLIM proattivo: "Ragazzi, vedo che siete pronti. Ora prendete il LED rosso e inseritelo a cavallo della riga centrale, come vedete qui. [indica sulla LIM]"
> 9:15 — Marco alza la mano: "Non si accende!". Prof.ssa non sa rispondere.
> 9:16 — "Ehi UNLIM, Marco dice che il LED non si accende." → UNLIM: "Marco, hai girato il LED? La gamba lunga va verso il +. Come dice il libro a pagina 29, il LED è come una porta girevole. Prova a ruotarlo!"
> 9:20 — LED acceso. UNLIM: "Bravissimi! Ora esperimento 2: togliamo la resistenza e vediamo cosa succede. ATTENZIONE: lo facciamo solo per un secondo."

**Principio Zero verificato:** Prof.ssa non ha studiato, legge UNLIM, classe vede LIM, ragazzi lavorano sul kit fisico.

### Scenario B: classe avanzata, 2° mese

> Ragazzi 14 anni, già fatti 8 esperimenti. Apertura ELAB.
> UNLIM (dalla memoria sessioni): "Ultima volta avete fatto v2-cap6-esp1 (transistor base). Oggi vi propongo v2-cap6-esp2: interruttore logico con transistor. Pronti per una sfida?"
> Marco: "Sì! Cosa fa?"
> UNLIM: "Dovremo pilotare il LED con un pulsante, ma con un trucco: usiamo il transistor come amplificatore. Come dice il Volume 2 a pagina 61, il transistor è come un rubinetto che un goccio di corrente apre o chiude tanta corrente. Curioso?"
> Classe interagisce. UNLIM adatta: quando intera classe risponde giusto → aumenta difficoltà. Quando confuso → ripete con analogia diversa.

### Scenario C: docente supplente, ultimo minuto

> Supplente arriva 8:55, non sapeva della classe fino a 8:45.
> 8:57 — Apre ELAB. UNLIM: "Benvenuto. Questa classe ha fatto 6 esperimenti. Oggi consiglio 'Il LED RGB' (v1-cap7-esp1). 15 minuti. Vuoi che cominci?"
> 8:59 — "Sì." → UNLIM parte automaticamente, proiettato sulla LIM.
> 9:00 — Supplente legge insieme ai ragazzi. UNLIM gli suggerisce in basso (coda occhio) la domanda da porre alla classe: "Ragazzi, secondo voi perché mescolando rosso e verde viene giallo?"

**Onnipotenza verificata:** supplente ZERO conoscenze → lezione perfetta.

---

## 8. VALUTAZIONE FINALE — onesta

### Cosa è fattibile in 3 sprint (1 mese)?

| Feature | Difficoltà | Impatto | Fattibile |
|---|---|---|---|
| Kokoro TTS produzione | Media | ★★★★★ | ✓ |
| Porcupine wake word | Media | ★★★★☆ | ✓ |
| Barge-in | Alta (VAD integration) | ★★★☆☆ | ✓ con tempo |
| Streaming LLM | Media | ★★★★☆ | ✓ |
| Memoria sessione Supabase | Bassa | ★★★★★ | ✓ |
| Mood adaptation | Alta (richiede LLM o euristiche) | ★★★☆☆ | parziale |
| Vision reale | Media | ★★★★☆ | ✓ |
| Mascotte animata SVG | Alta (design + anim) | ★★★☆☆ | roadmap |

**Realisticamente in 3 sprint:** TTS naturale, wake word custom, streaming, memoria sessione, vision live. 80% di Jarvis.

### Cosa NON è fattibile subito?

- **Fine-tuning Qwen 7B su dataset ELAB**: serve dataset curato di 10K+ esempi lezione (mesi di lavoro curatoriale)
- **On-device WebLLM**: dipende da WebGPU stabile (non tutti browser nel 2026)
- **Latency <1s garantita**: dipende da VPS upgrade o Gemini paid tier

### Raccomandazione STRATEGIA

**Sprint 1 OBBLIGATORIO (sessione 18/04):**
- Kokoro TTS + proxy CORS Vercel
- Porcupine Web SDK (custom keyword "Ehi UNLIM")
- Memoria Supabase `student_sessions` iniettata nel prompt UNLIM

**Questi 3 danno 60% del Jarvis feeling.** Il resto è roadmap 2026-Q3/Q4.

---

## 9. DA VERIFICARE EMPIRICAMENTE

Prima di finalizzare, testare:

1. **Load test Kokoro su VPS attuale** — quanti utenti concorrenti regge?
2. **A/B test voci Italian** — Kokoro Federica vs Edge TTS Elsa vs ElevenLabs (docenti giudicano)
3. **Wake word accuracy** — "Ehi UNLIM" falsi positivi in aula rumorosa (test 30 min)
4. **Latency totale reale** — cronometrare end-to-end su rete scolastica tipica
5. **Costo Gemini mensile** — dopo 1 settimana traffico reale, estrapolare

**Non dare per scontato nessuno di questi numeri.** Il documento è proposta, non verità assoluta.

---

## 10. TL;DR

**Best TTS per ELAB:** Kokoro 82M self-hosted VPS. €10/mese, qualità SoTA open, GDPR-safe. Fallback Edge TTS → Browser.

**"Ehi UNLIM" Jarvis-like:** Porcupine wake word + Web Speech STT + Gemini Flash LLM + Kokoro TTS + barge-in VAD. Target latency 1.5s. Fattibile in 3 sprint.

**OpenClaw:** NO per Jarvis. SÌ per Andrea-sysops (Ralph Loop alerts Telegram).

**API vs VPS:** Ibrido. VPS per privacy (TTS, Brain) + Cloud per scala (LLM). ~€25/mese a scala.

**Priorità sprint 18/04:**
1. Kokoro TTS produzione
2. Porcupine custom keyword
3. Memoria Supabase `student_sessions`

Se completiamo questi 3, UNLIM passa da chatbot a **tutor Jarvis-like funzionante**. Il resto è polish e scala.

---

*Documento strategico. Benchmark da verificare con test reali. Nessun numero dato per scontato.*
