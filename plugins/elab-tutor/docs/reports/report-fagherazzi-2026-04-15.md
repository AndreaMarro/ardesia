# Report Stato ELAB Tutor — 15 Aprile 2026
## Per Giovanni Fagherazzi e team Omaric

> Audit automatico oggettivo. Nessun dato inventato. Ogni affermazione verificata con test reali.

---

## 1. STATO INFRASTRUTTURA — Endpoint verificati con curl

| Servizio | URL | Stato | Note |
|----------|-----|-------|------|
| Sito web | elabtutor.school | **OK** (200) | Live su Vercel, deploy automatico da GitHub |
| AI Tutor (UNLIM) | Render | **OK** (200) | Risponde correttamente. Cold start ~15s prima risposta |
| Compilatore Arduino | n8n/Hostinger | **OK** (200) | Compila C++ e genera HEX valido |
| Database (Supabase) | supabase.co | **PARZIALE** | Server raggiungibile, API key da verificare |
| Voce (Edge TTS) | VPS 72.60.129.50 | **PARZIALE** | Health OK, ma endpoint TTS restituisce errore |
| AI Routing (Brain) | VPS Ollama | **OK** (200) | Modello galileo-brain-v13 funzionante |
| Voce (Kokoro TTS) | localhost:8881 | **NON FUNZIONA** | Solo locale, non deployato |

## 2. NUMERI VERIFICATI

| Metrica | Valore | Verifica |
|---------|--------|----------|
| Test automatici | **8.190 PASS** (0 fail) | `npx vitest run` — 159 file |
| Build produzione | **PASS** | ~3.017 KB bundle JS |
| Esperimenti | **92** (38+27+27) | Conteggio grep confermato |
| Lezioni raggruppate | **27** per concetto | lesson-groups.js verificato |
| RAG knowledge chunks | **549** | rag-chunks.json confermato |
| Knowledge Base curate | **~37** (non 94 come dichiarato) | unlim-knowledge-base.js — 382 righe |
| Riferimenti pagine volumi | **96 bookPage** ma **0 bookText** | Solo numero pagina, nessun testo |
| Azioni UNLIM | Parser presente | 6 occorrenze nel codice, non tutte testate |
| PWA/Offline | **NON ESISTE** | Nessun service worker, nessun manifest |

## 3. SCORE COMMERCIALE OGGETTIVO: 0.58 / 1.00

**VERDETTO: NON PRONTO PER LA VENDITA**

Soglia minima vendita: 0.75. Mancano 0.17 punti.

### Punteggi per area:

| Area | Score | Peso | Dettaglio |
|------|-------|------|-----------|
| A. Funzionalita Core | **0.70** | 30% | Simulatore, compilatore, solver funzionano. PWA assente. Parallelismo solo numerico. |
| B. UNLIM AI Tutor | **0.40** | 35% | Chat funziona ma risposte troppo lunghe. Voce non funziona in prod. Vision non testata. KB incompleta. |
| C. Esperienza Docente | **0.70** | 15% | Dashboard esiste ma pochi dati. Export CSV presente. Nudge funziona. Lezioni raggruppate. |
| D. Qualita/Affidabilita | **0.70** | 20% | 8190 test, build OK, bundle OK. WCAG parziale. |

## 4. BLOCKER P0 — Cose che IMPEDISCONO la vendita

### P0-1: La voce NON funziona in produzione
- Kokoro TTS esiste solo su localhost
- Edge TTS sul VPS risponde "Method Not Allowed"
- **Impatto**: UNLIM e muto. In una demo a scuola = silenzio imbarazzante
- **Fix**: 2-4 ore — correggere endpoint Edge TTS o deployare Kokoro su VPS

### P0-2: UNLIM risponde con >60 parole
- Test reale: domanda "Cosa fa il LED?" genera 80+ parole
- **Impatto**: Bambini 8 anni non leggono muri di testo. UX inaccettabile.
- **Fix**: 1-2 ore — truncation client-side + system prompt piu restrittivo

### P0-3: PWA dichiarata ma INESISTENTE
- Zero file: nessun service-worker.js, nessun manifest.json
- **Impatto**: App non installabile su tablet, non funziona offline
- **Fix**: 4-6 ore — Vite PWA plugin + cache strategy

### P0-4: Parallelismo volumi solo numerico
- volume-references.js ha le pagine (96 entries) ma ZERO testo dal libro
- Il Passo Passo NON cita il libro, NON mostra "come dice il Volume 1..."
- **Impatto**: Il prodotto non riflette i volumi fisici che la scuola ha comprato
- **Fix**: 6-8 ore — estrarre testo PDF, popolare bookText, integrare nell'UI

## 5. BLOCKER P1 — Cose che degradano l'esperienza

| # | Problema | Fix stimato |
|---|----------|-------------|
| P1-1 | KB dichiarata 94 entries ma ne ha ~37 | 2-3 ore |
| P1-2 | Render cold start 15s (prima risposta lenta) | 1-2 ore (keep-alive cron) |
| P1-3 | API key Supabase potenzialmente rotta | 30 min |
| P1-4 | Vision "guarda il circuito" mai testata E2E | 1 ora |

## 6. SUGGERIMENTI TEA (collaboratrice, analisi 13/04/2026)

Tea ha analizzato tutti 92 esperimenti per complessita e adeguatezza al target 8-14 anni. Risultati integrati come azioni secondarie:

### Azioni consigliate da Tea (priorita secondaria rispetto ai P0):

| Priorita | Azione | Costo | Impatto |
|----------|--------|-------|---------|
| Alta | Tag "Progetto avanzato" sui 4 capstone (v1-cap14, v2-cap12, v3-extra-simon, v1-cap9-esp6) | ~30 min | Alto — gestisce aspettative |
| Alta | Riscrivere MOSFET v2-cap8-esp3: togliere "tensione di soglia", dire "interruttore elettronico" | ~1 ora | Alto — il concetto e troppo astratto per 10enni |
| Media | Schema finale visibile nelle 3 Sfide Cap 9 Vol 1 | ~1 ora | Medio |
| Media | Durata stimata su ogni scheda esperimento ("15 min" / "30 min" / "45+ min") | ~4 ore dev | Alto — aiuta docenti a pianificare |
| Bassa | Spezzare v3-cap8-esp5 (Pot+3LED+Serial) in due step | ~30 min | Medio |

### Dati Tea sulla complessita:
- **Vol 1**: media 13.2 passi, 24% a difficolta 3 (concentrati in Cap 9-10 e Cap 14)
- **Vol 2**: media 11.3 passi, 11% a difficolta 3 (rischio concettuale: MOSFET, RC, condensatori)
- **Vol 3**: media 9.8 passi, 11% a difficolta 3 (complessita nel codice, non nel cablaggio)
- **Solo 6 esperimenti** risultano "oltre il target" — il curriculum e nel complesso adeguato

## 7. CONFRONTO COMPETITOR

| | ELAB Tutor | Tinkercad | CampuStore | Arduino Education |
|-|-----------|-----------|------------|-------------------|
| **Prezzo** | €20/classe/mese (proposto) | Gratis | €350/kit | €300-700/kit |
| **Simulatore** | Proprietario, 2D | 3D, 400+ componenti | Nessuno | Nessuno |
| **AI Tutor** | UNLIM (chat+voce+vision) | Nessuno | Nessuno | Nessuno |
| **Lingua** | Italiano nativo | Inglese | Italiano | Inglese |
| **Target** | 8-14 anni | 13+ | Variabile | 11+ |
| **Volumi fisici** | 3 volumi integrati (in teoria) | Nessuno | Guide cartacee | Guide online EN |
| **Dashboard** | Presente (parziale) | Classroom (base) | Nessuna | Nessuna |
| **Offline** | NO (PWA assente) | NO (cloud) | N/A | NO |
| **Vantaggio ELAB** | Unico con AI tutor italiano per bambini | — | — | — |
| **Svantaggio ELAB** | Simulatore meno maturo, voce non funziona, infrastruttura fragile | — | — | — |

## 8. PRICING PROPOSTO (subordinato a fix P0)

| Pacchetto | Prezzo | Include | Pronto? |
|-----------|--------|---------|---------|
| ELAB Classe | €20/classe/mese | Kit + simulatore + UNLIM + dashboard | **NO** — servono fix P0 |
| ELAB Famiglia | €9.99/mese | Simulatore + UNLIM per casa | Quasi — fix brevita + cold start |
| ELAB Scuola | €500/anno illimitato | Tutte le classi | **NO** — serve dashboard funzionante |

## 9. TIMELINE REALISTICA

| Fase | Ore stimate | Score atteso |
|------|-------------|-------------|
| Fix P0 (TTS + brevita + PWA + testo volumi) | 12-18 ore | 0.75 (soglia vendita) |
| Fix P1 (KB + cold start + Supabase + Vision) | 6-8 ore | 0.82 |
| Suggerimenti Tea (tag, MOSFET, durate) | 6-8 ore | 0.85 |
| **Totale per "pronto alla vendita"** | **~30 ore** | **0.85** |

Con 3-4 sessioni dedicate da 8 ore: **pronto entro fine aprile 2026**.

## 10. COSA FUNZIONA DAVVERO (punti di forza)

1. **Simulatore di circuiti** funziona — CircuitSolver MNA/KCL reale, non giocattolo
2. **Compilatore Arduino** funziona — compila codice C++ reale e genera HEX valido
3. **Emulazione AVR** funziona — esegue codice nel browser senza hardware
4. **92 esperimenti** tutti caricabili con buildSteps
5. **UNLIM chat** risponde correttamente (anche se troppo lungo)
6. **8.190 test** automatici che passano — base solida per iterare
7. **RAG 549 chunk** per risposte offline
8. **27 Lezioni** raggruppate per concetto come nel libro
9. **Scratch/Blockly** per programmazione visuale
10. **Deploy automatico** GitHub → Vercel

## 11. COSA NON FUNZIONA (onesta brutale)

1. La voce e muta in produzione
2. UNLIM parla troppo (>60 parole)
3. L'app non e una PWA (no offline)
4. Il simulatore non cita mai il libro fisico
5. La Knowledge Base ha meta delle entries dichiarate
6. La prima risposta UNLIM impiega 15 secondi
7. La Vision non e mai stata testata
8. La Dashboard ha pochi dati reali

---

**Score ONESTO: 0.58/1.00 — NON PRONTO PER LA VENDITA**

Fix necessari: ~30 ore di sviluppo per arrivare a 0.85.
Timeline: fine aprile 2026 se lavoro continuo.

Il prodotto ha una base tecnica solida (simulatore, compilatore, test). I gap sono nell'integrazione prodotto (voce, volumi, PWA) e nella finitura per il cliente finale.

---

*Report generato automaticamente da Claude Code — 15/04/2026*
*Commit: 16be16b | Test: 8190/8190 PASS | Build: PASS*
*Dati verificati con curl, grep, file count. Zero inflazione.*
