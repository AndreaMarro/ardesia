# Claude-Mem: Analisi Completa

**Data analisi**: 2026-03-27
**Fonti**: GitHub, claude-mem.ai, docs.claude-mem.ai, review indipendenti

---

## 1. Cosa Fa Claude-Mem

Claude-Mem e' un **plugin di memoria persistente per Claude Code**. Risolve il problema dell'"amnesia" delle sessioni AI: quando una sessione Claude Code finisce, tutto il contesto va perso. Claude-Mem cattura automaticamente tutto cio' che Claude fa durante le sessioni di coding, comprime le osservazioni con AI, e le re-inietta nelle sessioni future.

**Slogan**: "Stop explaining context. Start building faster."

**Creato da**: Alex Newman (@thedotmack)
**Stars GitHub**: 21,500+
**Contributors**: 22
**Release**: 174+
**Licenza**: AGPL-3.0 (PolyForm Noncommercial per il componente Ragtime)

---

## 2. Come Funziona

### Architettura a 6 Componenti

1. **Lifecycle Hooks** (5 hook principali):
   - `SessionStart` — inietta contesto dalle sessioni precedenti
   - `UserPromptSubmit` — cattura le query dell'utente
   - `PostToolUse` — osserva ogni esecuzione di tool
   - `Stop` — genera sommari compressi
   - `SessionEnd` — finalizza lo storage

2. **Worker Service** — API HTTP su porta 37777, gestito da Bun, con Web UI per visualizzazione real-time

3. **SQLite Database** — Storage persistente per sessioni, osservazioni e sommari, con ricerca full-text FTS5. Posizione: `~/.claude-mem/claude-mem.db`

4. **Mem-Search Skill** — Ricerca in linguaggio naturale con progressive disclosure

5. **Chroma Vector Database** — Ricerca ibrida semantica + keyword

6. **MCP Tools** — 4 tool con pattern a 3 livelli

### Pattern di Ricerca a 3 Livelli (Token-Efficient)

- **Layer 1 (search)**: Indice compatto con ID (~50-100 token per risultato)
- **Layer 2 (timeline)**: Contesto cronologico attorno ai risultati specifici
- **Layer 3 (get_observations)**: Dettagli completi solo per gli ID filtrati (~500-1,000 token per risultato)

Questo approccio risparmia circa **10x in token** filtrando prima di recuperare i dati completi.

### Compressione

- **95% riduzione token** nella compressione delle osservazioni
- **~2,250 token risparmiati** per sessione
- Le memorie recenti restano dettagliate, quelle vecchie vengono progressivamente riassunte (come la memoria umana)

### Categorizzazione Automatica

Le osservazioni sono auto-categorizzate come:
- Decisions (decisioni architetturali)
- Bugfixes (correzioni bug)
- Features (funzionalita' nuove)
- Discoveries (scoperte tecniche)

### Auto-Generazione CLAUDE.md

Il sistema genera automaticamente file `CLAUDE.md` nelle cartelle del progetto con timeline di attivita', ID osservazione, timestamp e conteggio token.

---

## 3. Installazione e Configurazione

### Requisiti di Sistema

- Node.js 18.0.0+
- Claude Code (ultima versione con supporto plugin)
- Bun (auto-installato se mancante)
- uv Python package manager (auto-installato se mancante)
- SQLite 3 (bundled)
- Cross-platform: Windows, macOS, Linux

### Installazione (2 comandi)

```bash
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

Il plugin scarica automaticamente binari, installa dipendenze, configura hooks e avvia il worker service.

### Configurazione

File settings: `~/.claude-mem/settings.json` (auto-generato al primo avvio).

Configurabili:
- Modello AI per compressione
- Porta worker (default: 37777)
- Directory dati
- Livello di log
- Comportamento di iniezione contesto
- Modalita' (Code, Email Investigation, Chill)
- Supporto 28 lingue

### Privacy

Tag `<private>` per escludere contenuti sensibili dalla memorizzazione. Nessun dato lascia la macchina locale (local-first).

---

## 4. Funzionalita' Beta: Endless Mode

Architettura di memoria biomimetica per sessioni estese:
- Modalita' standard: ~50 utilizzi tool
- Endless Mode: ~1,000 utilizzi tool (**20x aumento**)
- **Trade-off**: aggiunge 60-90 secondi di latenza per ogni invocazione di tool

---

## 5. Limitazioni

| Limitazione | Dettaglio |
|---|---|
| **Latenza Endless Mode** | 60-90 secondi aggiunti per tool invocation, proibitivo per sviluppo rapido |
| **Solo Claude Code** | Funziona esclusivamente come plugin Claude Code, non come tool standalone |
| **Plugin system richiesto** | Richiede l'ultima versione di Claude Code con supporto plugin |
| **Worker locale** | Il servizio worker su porta 37777 deve essere in esecuzione |
| **Compressione lossy** | La compressione al 95% inevitabilmente perde dettagli; adeguata per contesto ma non per replay esatto |
| **Storage locale** | SQLite locale, non distribuito; nessun sync tra macchine out-of-the-box |
| **Dipendenza Bun** | Richiede Bun come runtime per il worker service |
| **Nessuna API esterna** | Non espone API per integrazione con sistemi esterni (solo MCP interno) |
| **AGPL-3.0** | Licenza copyleft forte, problematica per uso commerciale integrato |

---

## 6. Rilevanza per ELAB UNLIM

### Contesto ELAB UNLIM

ELAB UNLIM usa un automa Python che gira 24/7 e ha bisogno di mantenere contesto tra sessioni Claude Code. L'automa esegue cicli di ricerca, sviluppo e miglioramento continuo.

### Punti di Forza per ELAB UNLIM

1. **Persistenza automatica del contesto**: L'automa non dovrebbe piu' re-iniettare manualmente il contesto ad ogni sessione. Claude-Mem lo fa automaticamente.

2. **Ricerca semantica sulla storia del progetto**: L'automa potrebbe chiedere "cosa abbiamo fatto per il simulatore Arduino?" e ottenere risposte contestualizzate.

3. **Riduzione costi token**: Il sistema a 3 livelli risparmia 10x in token, critico per un automa 24/7 che consuma molti token.

4. **Categorizzazione decisioni**: Tutte le decisioni architetturali vengono tracciate automaticamente, utile per la coerenza del progetto nel tempo.

5. **Timeline causale**: Ogni osservazione include contesto before/after, permettendo di capire il "perche'" delle decisioni passate.

### Limitazioni Critiche per ELAB UNLIM

1. **Solo plugin Claude Code**: Claude-Mem funziona come plugin di Claude Code, non come libreria Python. L'automa Python di ELAB UNLIM dovrebbe interagire con Claude Code che ha il plugin installato, non direttamente con claude-mem.

2. **No API programmatica**: Non c'e' un'API REST o Python per integrare claude-mem in un automa custom. L'unico accesso e' attraverso i tool MCP interni a Claude Code.

3. **Local-only**: Il database e' locale alla macchina. Se l'automa gira su un server diverso da dove si sviluppa, servirebbero meccanismi di sync.

4. **Endless Mode latenza**: 60-90 secondi per tool use e' troppo per un automa 24/7 che deve essere efficiente.

### Valutazione Complessiva per ELAB UNLIM

**Utilita' diretta: MEDIA-BASSA**

Claude-Mem e' progettato per sviluppatori umani che usano Claude Code interattivamente. Per un automa Python 24/7, presenta frizioni significative:

- L'automa attuale di ELAB gestisce gia' il contesto tramite file di stato (`STATE.md`, `handoff.md`, `PDR.md`) e una knowledge base strutturata. Questo approccio e' piu' controllato e prevedibile.
- Claude-Mem aggiungerebbe un layer di memoria "implicita" che potrebbe entrare in conflitto con il sistema di memoria "esplicita" gia' in uso.

**Cosa prendere come ispirazione**:

- Il pattern di **progressive disclosure a 3 livelli** e' eccellente e potrebbe essere implementato nel sistema automa attuale
- La **compressione progressiva** (recente = dettagliato, vecchio = sommario) e' un pattern utile per gestire la knowledge base crescente
- La **categorizzazione automatica** (decisioni, bugfix, feature, discovery) potrebbe migliorare l'INDEX.md della knowledge base
- L'idea di **auto-generare file CLAUDE.md per cartella** potrebbe migliorare la navigazione del progetto

### Alternativa Leggera: memsearch

Per un uso piu' leggero, esiste `memsearch` (ccplugin), che offre:
- Design minimale
- Zero overhead sulla context window
- Storage completamente trasparente
- Migliore per ingegneri che vogliono un layer di memoria leggero

---

## 7. Fonti

- [GitHub - thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)
- [Claude-Mem.ai - Sito ufficiale](https://claude-mem.ai/)
- [Documentazione Claude-Mem](https://docs.claude-mem.ai/introduction)
- [Review TrigiDigital 2026](https://trigidigital.com/blog/claude-mem-plugin-review-2026/)
- [YUV.AI Blog](https://yuv.ai/blog/claude-mem)
- [Milvus Blog - memsearch comparison](https://milvus.io/blog/adding-persistent-memory-to-claude-code-with-the-lightweight-memsearch-plugin.md)
