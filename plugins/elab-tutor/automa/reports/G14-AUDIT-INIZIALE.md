# G14 Audit Iniziale — "LA PROF.SSA PARLA"

**Data**: 28/03/2026
**Sessione**: G14 Marathon — Voce TTS+STT + Galileo Live

---

## Stato Build
- **Build**: PASSA (25.7s)
- **PWA**: 19 entries (4,120 KB)
- **Deploy G13**: In corso su Vercel

## Stato useTTS.js
- **Implementato**: SI (204 righe)
- **Web Speech API**: `speechSynthesis` con voice selection italiana
- **Voce italiana**: Auto-seleziona `it-IT` (preferisce voci locali)
- **Rate**: 0.9 (leggermente lento per chiarezza)
- **Pitch**: 1.0
- **Pulizia testo**: Rimuove `[AZIONE:...]`, markdown bold/italic/code/links/headers
- **Metodi**: speak(), stop(), togglePause(), changeVoice(), testVoice()
- **Integrato in UnlimWrapper**: NO — il hook esiste ma non viene usato

## Stato STT (Speech-to-Text)
- **Implementato**: NO — zero codice SpeechRecognition nel progetto
- **UnlimInputBar**: Ha slot per mic (prop `onMicClick` + `isListening`) ma nessuno li usa
- **Browser support**: SpeechRecognition disponibile in Chrome/Edge (~75% browser)

## Stato Messaggi Contestuali (G13)
- **UnlimOverlay**: Messaggi posizionati con BubbleArrow ✅
- **getComponentScreenPosition()**: Query DOM via data-component-id ✅
- **Event bridge**: ElabTutorV4 → UnlimWrapper via `unlim-contextual-message` ✅
- **Auto-dismiss**: Click per chiudere + timeout ✅
- **Voce su dismiss**: NO — quando si clicca il messaggio, la voce non si ferma (perché non c'è)

## Piano Integrazione

### TTS (FASE 1)
1. Import `useTTS` in UnlimWrapper
2. Quando `showMessage()` viene chiamato → `tts.speak(text)`
3. Quando messaggio viene dismesso (click) → `tts.stop()`
4. Aggiungere toggle mute/unmute (stato `isMuted` in UnlimWrapper)
5. Bottone mute sulla mascotte o accanto ad essa

### STT (FASE 2)
1. Creare `useSTT.js` hook con SpeechRecognition API
2. In UnlimWrapper: passare `onMicClick` e `isListening` a UnlimInputBar
3. Quando mic attivo: testo interim appare nell'input
4. Quando mic si ferma: testo finale viene inviato automaticamente (o manualmente)
5. Fallback: se browser non supporta, nascondere il bottone mic

### Galileo Live (FASE 3)
- Test E2E nel browser con dev server
- 5+ domande reali a UNLIM
- Verificare: risposta + azione + voce + posizionamento messaggio

---

## Rischi
1. **Cold start nanobot**: Render free tier → 30-60s prima risposta
2. **Voci italiane**: Non tutti i browser hanno voci IT di qualità
3. **SpeechRecognition**: Solo Chrome/Edge (no Firefox/Safari)
4. **Rumore ambiente**: In una classe con 25 bambini, STT potrebbe funzionare male

## Score Pre-G14
| Metrica | Valore |
|---------|--------|
| UNLIM vision | 5.5/10 |
| Composito insegnante | 7.0/10 |
| Voce TTS | 0% |
| Voce STT | 0% |
| Galileo live test | Non fatto |
