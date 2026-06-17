# G25 — AI RELIABILITY

## OBIETTIVO: UNLIM affidabilita' da 3/10 a 7/10. Nessun blocco, nessun errore silenzioso.

## BUG CRITICI DA FIXARE (dall'audit con 3 agenti)

### Bug 1: Timeout AI 120s → 10s
- File: src/services/api.js
- Aggiungere AbortController con signal a tutte le fetch in sendChat()
- Timeout: 10s per testo, 20s per immagini
- A 5s mostrare: "UNLIM sta cercando la risposta migliore..."
- A 10s: abort + fallback immediato a RAG/knowledge base

### Bug 2: PlacementEngine race condition
- File: src/components/tutor/ElabTutorV4.jsx (processAiResponse)
- Le azioni [AZIONE:place:...] partono in parallelo → circuito corrotto
- Fix: await sequenziale (for...of con await, non Promise.all)
- Testare: risposta con 2 azioni place → entrambe applicate correttamente

### Bug 3: Action tag parse errors silenziosi
- File: src/components/tutor/ElabTutorV4.jsx (extractIntentTags)
- Azioni malformate droppate senza log ne' messaggio
- Fix: log console.warn per ogni azione droppata
- Se >50% azioni droppate: mostrare "UNLIM non ha capito bene. Riprova!"
- Rimuovere Ralph Loop (dead code: extractIntentTags chiamato 2 volte su stesso input)

### Bug 4: Proactive event dedup non atomico
- Fix: usare eventId generato dal simulatore, non hash timestamp
- Testare: 2 pin cortocircuitano nello stesso tick → 1 sola diagnosi

### Bug 5: TTS voice loading 50ms → wait-for-readiness
- File: src/hooks/useTTS.js
- Sostituire setTimeout 50ms con listener voiceschanged + 200ms margin
- Testare su simulazione Chromebook lento

## VERIFICA 8 STRATI CoV
1. Build & Test
2. Browser: simulare nanobot lento (disable network) → fallback entro 10s
3. Browser: 2 azioni place nella stessa risposta → circuito corretto
4. Browser: azione malformata → messaggio utente visibile
5. Console: 0 errori silenziosi, warn per azioni droppate
6. Code audit: AbortController presente in tutte le fetch
7. Code audit: 0 Ralph Loop, 0 await paralleli in processAiResponse
8. Prof.ssa Rossi: se UNLIM e' lento, vede messaggio (non schermo bianco)
