# G14 FASE 2: STT — UNLIM Ascolta

**Data**: 28/03/2026
**Build**: PASSA (25.25s)

## Cosa è stato fatto

### Hook useSTT.js (nuovo file: 120 righe)
- `src/hooks/useSTT.js` — hook completo Speech-to-Text
- `SpeechRecognition` + `webkitSpeechRecognition` fallback
- Lingua: `it-IT`
- `continuous: false` — si ferma dopo una frase (naturale per comandi vocali)
- `interimResults: true` — mostra testo parziale mentre si parla
- Callbacks: `onResult(finalText)`, `onInterim(partialText)`
- Error handling: ignora `no-speech` e `aborted` (non sono errori reali)
- Metodi: `startListening()`, `stopListening()`, `toggle()`

### Integrazione in UnlimWrapper
- Import `useSTT` hook
- `onResult` → invia direttamente il testo a Galileo via `handleSend`
- `onInterim` → mostra testo parziale nel placeholder dell'input
- `handleSendRef` pattern per evitare dipendenza circolare
- Passato `onMicClick={stt.toggle}` a UnlimInputBar (solo se supportato)
- Passato `isListening={stt.isListening}` per feedback visivo (mic rosso)
- Placeholder dinamico: "Sto ascoltando..." quando il mic è attivo

### UX Flusso
1. Prof preme 🎤 → mic diventa rosso, placeholder "Sto ascoltando..."
2. Prof parla → testo parziale appare nel placeholder in tempo reale
3. Prof smette di parlare → testo finale inviato automaticamente a Galileo
4. Se browser non supporta STT → bottone mic non appare (zero errori)

### Fallback
- Se `SpeechRecognition` non disponibile: `isSupported = false`
- `onMicClick` passato come `undefined` → bottone mic non renderizzato (logica in UnlimInputBar)
- Nessun messaggio di errore invasivo

## File creati/modificati
- `src/hooks/useSTT.js` — NUOVO (120 righe)
- `src/components/unlim/UnlimWrapper.jsx` — +15 righe (import, stato, integrazione)

## Verifica
| Check | Risultato |
|-------|-----------|
| Build exit 0 | ✅ |
| useSTT hook creato | ✅ |
| Lingua it-IT | ✅ |
| interimResults attivi | ✅ |
| Auto-send su risultato finale | ✅ |
| Fallback se non supportato | ✅ (mic nascosto) |
| Mic rosso quando ascolta | ✅ (via isListening prop) |
| Testo interim nel placeholder | ✅ |
