# G14 FASE 3: Galileo Live Test — E2E nel Browser

**Data**: 28/03/2026
**Build**: PASSA
**Dev server**: localhost:5173
**Browser**: Playwright Chromium

---

## Test 1: "cos'è un LED?"
- **Tipo**: Domanda conoscenza (no action tag)
- **Tempo risposta**: ~3-4s
- **Risposta**: "Un LED (Light Emitting Diode) è un componente elettronico che emette luce quando una corrente elettrica lo attraversa. È un diodo a emissione di luce..."
- **Qualità**: 4/5 — corretta e dettagliata, leggermente troppo formale ("dispositivo a semiconduttore")
- **Azione eseguita**: N/A (solo conoscenza)
- **Tono 10-14 anni**: 3/5 — troppo tecnico in alcuni punti
- **Posizione messaggio**: Overlay top-center (corretto — nessun target componente)
- **Screenshot**: G14-galileo-response-LED.jpeg

## Test 2: "evidenzia il LED"
- **Tipo**: Comando azione (highlight)
- **Tempo risposta**: ~2-3s
- **Risposta**: "Ecco, evidenzio il LED per te! Guarda come brilla!"
- **Qualità**: 5/5 — perfetta, breve, naturale
- **Azione eseguita**: ✅ Highlight LED + messaggio contestuale
- **Tono 10-14 anni**: 5/5 — entusiasta, amichevole
- **Posizione messaggio**: ✅ CONTESTUALE — fumetto a DESTRA del LED con freccia che punta al componente
- **Screenshot**: G14-galileo-highlight-LED.jpeg ★ QUESTO È LA VISIONE UNLIM

## Test 3: "perché serve il resistore?"
- **Tipo**: Domanda concettuale
- **Tempo risposta**: ~3s
- **Risposta**: "Il resistore serve a limitare la corrente elettrica che fluisce attraverso il LED. Se la corrente è troppo alta, il LED potrebbe bruciare..."
- **Qualità**: 4/5 — corretta, buona spiegazione
- **Azione eseguita**: N/A
- **Tono 10-14 anni**: 4/5 — ragionevole, potrebbe usare più analogie
- **Posizione messaggio**: Overlay (nessun target — corretto)

---

## Riepilogo Test

| # | Domanda | Tempo | Qualità | Azione | Tono | Posizione |
|---|---------|-------|---------|--------|------|-----------|
| 1 | cos'è un LED? | ~3-4s | 4/5 | N/A | 3/5 | top-center ✅ |
| 2 | evidenzia il LED | ~2-3s | 5/5 | ✅ highlight | 5/5 | **contestuale** ✅ |
| 3 | perché il resistore? | ~3s | 4/5 | N/A | 4/5 | top-center ✅ |

**Media qualità**: 4.3/5
**Media tono**: 4.0/5
**Azioni corrette**: 1/1 (100%)
**Cold start**: Non osservato (nanobot era già sveglio)

## Console Errors
| Errore | Gravità | Note |
|--------|---------|------|
| ERR_CONNECTION_REFUSED localhost:8000/health | Benigno | Warmup nanobot locale non in esecuzione |
| TTS Error: interrupted | Fixato | Aggiunto filtro per 'interrupted'+'canceled' in useTTS.js |

## Verifiche UI
| Check | Risultato |
|-------|-----------|
| Input bar con mic 🎤 | ✅ Visibile |
| Toggle voce 🔊 | ✅ Visibile |
| Mascotte robot | ✅ Visibile bottom-right |
| Click mascotte → input bar | ✅ |
| Messaggio overlay con 🤖 | ✅ |
| Messaggio contestuale accanto LED | ✅ ★ |
| Auto-dismiss dopo timeout | ✅ |
| Click per dismiss | ✅ |
| STT=true, TTS=true in console | ✅ (log all'avvio) |

## Problemi Trovati e Fix
1. **TTS 'interrupted' logged as error** → Fix: filtro in useTTS.js onerror
2. **Risposta troppo lunga (test 1)** → Suggerimento: troncare a 60 parole nel futuro
3. **Tono troppo formale** → Suggerimento: migliorare system prompt nanobot

## Conclusione
**Galileo funziona E2E.** La prof chiede, Galileo risponde, il messaggio appare nel posto giusto, la voce legge (se non mutata). Il flusso highlight → messaggio contestuale è la STAR FEATURE di questa sessione.
