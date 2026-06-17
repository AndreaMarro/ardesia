# Audit Sessione 13 Aprile 2026 — Claude Code Terminal

**Firmato:** Andrea Marro Claude Code Terminal — 13/04/2026
**Durata:** ~8 ore
**Commit:** 24
**Test:** 3767/3767 PASS
**Build:** PASS (39.8s)
**Deploy:** AUTOMATICO via GitHub Actions → Vercel ✅

---

## Deliverable Completati

### Fix UX (8 fix, commit 98a36e7 + 351d382)

| # | Fix | File | Impatto |
|---|-----|------|---------|
| 1 | UNLIM chat persistenza REALE | useGalileoChat.js (localStorage cap 100) | P0 — COV trovato bug Claude Web |
| 2 | Disegni lavagna persistono | DrawingOverlay.jsx (localStorage) | P1 |
| 3 | Pannello volumi trascinabile | FloatingWindow.jsx (z-index 1010, Y>=48) | P1 |
| 4 | Percorso fasi neutre | LessonPathPanel.jsx (MATERIALE/SCOPERTA/...) | P2 |
| 5 | Passo Passo resize libero | BuildModeGuide.jsx (drag handle, min/max, persist) | P1 |
| 6 | "Percorso" → "Libero" | NewElabSimulator.jsx | P2 |
| 7 | ComponentPalette in Percorso/Libero | NewElabSimulator.jsx (no drawer basso) | P1 |
| 8 | "Già Montato" ripristinato | NewElabSimulator.jsx | P2 |

### UNLIM Potenziato (commit 98a36e7)

| Azione | Tag | Stato |
|--------|-----|-------|
| setComponentValue | [AZIONE:setvalue:id:campo:valore] | NUOVO |
| captureScreenshot | [AZIONE:screenshot] | NUOVO |
| getCircuitDescription | [AZIONE:describe] | NUOVO |
| Catene multi-step | Più azioni in sequenza | NUOVO |

### KB Edge Completa (commit 98a36e7)

| Volume | Prima | Dopo |
|--------|-------|------|
| Vol 1 | 38 | 38 |
| Vol 2 | 18 | **27** (+9) |
| Vol 3 | 6 | **29** (+23) |
| **Totale** | **62** | **94** |

### Toolbar Trascinabile (commit c9b19ae → e5c7cd3)

- Drag da qualsiasi punto della barra (non solo handle)
- Click vs drag: threshold 4px
- setPointerCapture per touch
- Posizione persistente localStorage
- Doppio click = reset posizione

### Deploy Automatico (commit ff69dbd → b813e34)

- GitHub Actions workflow: push main → npm install → build → vercel deploy --prebuilt
- Fix npm bug #4828 (rm node_modules + npm install fresh)
- Repo resi pubblici per GitHub Actions free tier
- Token Vercel valido in GitHub Secrets
- **Ogni push su main = deploy automatico in ~4 minuti**

### Audit e Documentazione

| Report | Righe | Contenuto |
|--------|-------|-----------|
| COV-CLAUDE-WEB.md | 160 | 6/8 PASS, 2 FAIL (chat persist + iPad touch non verificabili) |
| DEBUG-SISTEMATICO-BOTTONI.md | 550 | 106 bottoni, 91% funzionanti, 2 BUG P0 |
| Questo file | - | Audit completo sessione |

---

## Stato Prodotto — Onestà Massima

### Score per area (1-10)

| Area | Score | Note |
|------|-------|------|
| Simulatore circuiti | 7/10 | CircuitSolver solido, SVG buoni, mancano buildSteps Vol3 |
| UNLIM AI | 6.5/10 | 17 azioni, catene, KB 94 entry, memoria 3-tier. Gap: RAG semantic dipende da Gemini key |
| Scratch/Blockly | 6/10 | Patch v4 crash, 36 blocchi, ma solo 10/92 esp hanno scratchXml |
| Arduino/AVR | 7/10 | avr8js funziona, compiler e2e, serial monitor |
| Lavagna | 7/10 | Toolbar trascinabile, disegni persistenti, FloatingWindow drag+resize |
| Dashboard docente | 4/10 | Shell con Supabase ma pochi dati reali, no grafici |
| Voce | 5/10 | TTS browser funziona, 36 comandi vocali, ma voci non belle |
| UX/Touch | 6/10 | Touch 44px, resize Passo Passo, ma iPad ancora difficile |
| CI/CD | 8/10 | Deploy automatico, 3767 test, build PASS |
| **MEDIA** | **6.3/10** | |

### Bug P0 Aperti

1. **FloatingToolbar "Elimina" non funziona** — handler non collegato a deleteComponent
2. **FloatingToolbar "Seleziona" non funziona** — setState locale, non controlla tool mode
3. **21/27 esp Vol3 senza buildSteps** — mancano passi di montaggio
4. **Scratch solo 10/92 esperimenti** — gli altri non hanno scratchXml
5. **Voce non bella** — Edge TTS browser, non Kokoro/ElevenLabs

---

## Analisi Vast.ai per Voce + LLM

### Cosa ci serve

1. **TTS italiano** — Kokoro 82M (Apache 2.0, #1 TTS Arena) supporta italiano
2. **STT** — Whisper small/medium (open source)
3. **LLM fallback** — Qwen3.5-2B o Gemma-3-4B come backup a Gemini

### Opzioni a confronto

| Opzione | Costo/mese | Pro | Contro |
|---------|-----------|-----|--------|
| **Vast.ai RTX 3060** | ~€36/mese (24/7) | Cheapest GPU cloud, 12GB VRAM, Kokoro+Whisper+Qwen ci stanno | Spot market instabile, latenza variabile, può essere interrotto |
| **Vast.ai RTX 3060 Ti** | ~€29/mese (24/7) | Ancora più cheap | Stessa instabilità |
| **RunPod RTX A4000** | ~€137/mese (24/7) | Stabile, managed, 16GB VRAM | 4x più caro |
| **Mac Mini M4 16GB** | ~€200 una tantum + €10/mese corrente | Zero costi ricorrenti, stabile, già a Strambino | 16GB condivisi CPU+GPU, latenza rete italiana |
| **VPS attuale** | €0 (già pagato) | Già attivo 72.60.129.50 | CPU only, no GPU, Kokoro lento |

### Raccomandazione

**Per ELAB la scelta migliore è Vast.ai RTX 3060 Ti a ~€29/mese:**

- Kokoro 82M (TTS italiano) → 82M parametri, gira in <100ms su GPU
- Whisper small (STT) → 244M, real-time su GPU
- Qwen3.5-2B (LLM fallback) → 2B, inferenza <500ms

**Architettura proposta:**
```
Studente → elabtutor.school → Supabase Edge (Gemini gratis)
                                    ↓ se Gemini rate-limit
                               Vast.ai RTX 3060 Ti
                               ├── Kokoro TTS (italiano)
                               ├── Whisper STT
                               └── Qwen3.5-2B fallback
```

**Costo totale: ~€29/mese** vs attuale ~€0 (Gemini free + Edge TTS browser)

**Alternativa zero-costo:** continuare con Edge TTS browser (qualità ok) + Gemini free tier. Kokoro solo quando/se il budget lo permette.

---

## Cosa Resta da Fare (priorità)

### P0 — Bloccanti prodotto

1. **Fix Elimina + Seleziona toolbar** — handler non collegati (1h)
2. **BuildSteps Vol3** — 21/27 esperimenti senza passi montaggio (4h)
3. **ScratchXml** — 82/92 esperimenti senza Scratch (8h per 20 più importanti)
4. **Voce bella** — integrare Kokoro TTS o almeno migliorare voci browser (2h)

### P1 — Qualità prodotto

5. **Dashboard docente** — grafici reali, export, nudge funzionanti (8h)
6. **Parità volumi** — allineare esperimenti ai libri fisici (4h)
7. **UNLIM onnisciente** — test 30 domande, fix hallucination, prompt tuning (4h)
8. **iPad/touch** — test reale su iPad, fix drag componenti (4h)

### P2 — Nice to have

9. **Wake word** — non sostenibile economicamente, skip
10. **100 utenti Playwright** — test load (2h)
11. **Fumetto report** — workflow end-to-end (4h)
12. **Vast.ai setup** — se budget approvato (4h)

### Stima tempo totale: ~45h di lavoro
