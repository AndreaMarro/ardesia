# G14 FASE 1: TTS — UNLIM Parla

**Data**: 28/03/2026
**Build**: PASSA (24.75s)

## Cosa è stato fatto

### Integrazione useTTS in UnlimWrapper
- Import `useTTS` hook (già esistente e completo)
- `speakIfEnabled(text)` helper: legge il testo solo se non mutato
- 3 punti di integrazione voce:
  1. **Risposta Galileo** (`handleSend`): quando l'AI risponde, il testo viene letto
  2. **Messaggi contestuali** (`unlim-contextual-message`): eventi da ElabTutorV4 letti ad alta voce
  3. **Messaggio benvenuto** (experiment change): "Oggi facciamo..." letto all'apertura

### Stop voce su dismiss
- Click su messaggio overlay → `tts.stop()` + dismiss messaggio
- La voce si interrompe immediatamente quando l'insegnante clicca il fumetto

### Toggle mute/unmute
- Bottone circolare 36px sopra la mascotte (posizione fixed bottom: 100px, right: 16px)
- Icona: 🔊 (attivo, sfondo lime) / 🔇 (muto, sfondo scuro)
- Stato persistente in `localStorage('elab-tts-muted')`
- Visibile SOLO se browser supporta TTS (`tts.isSupported`)
- Mute → ferma immediatamente la voce in corso

### Configurazione voce
- Voce: italiana auto-selezionata (`it-IT`, preferisce voci locali)
- Rate: 0.9 (leggermente lento per bambini 10-14)
- Pitch: 1.0
- Volume: 0.8
- Pulizia: rimuove `[AZIONE:...]`, markdown, link

## File modificati
- `src/components/unlim/UnlimWrapper.jsx` — +30 righe (import, stato mute, speakIfEnabled, 3 integrazioni, toggle button)

## Verifica
| Check | Risultato |
|-------|-----------|
| Build exit 0 | ✅ |
| useTTS importato | ✅ |
| speak su risposta Galileo | ✅ |
| speak su messaggio contestuale | ✅ |
| speak su benvenuto | ✅ |
| stop su click dismiss | ✅ |
| Toggle mute persistente | ✅ |
| Mute nasconde se no support | ✅ |
