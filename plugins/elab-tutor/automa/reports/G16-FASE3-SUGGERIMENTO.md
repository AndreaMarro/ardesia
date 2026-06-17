# G16 FASE 3 — Suggerimento Prossima Lezione

**Data**: 28/03/2026
**Build**: PASSA (45s)

## Cosa è stato fatto

### Suggerimento automatico prossima lezione
Integrato direttamente in UnlimWrapper.jsx (effetto welcome message).

#### Flusso:
1. Docente apre UNLIM senza esperimento specifico
2. `getWelcomeMessage()` mostra: "Bentornati! L'ultima volta avete fatto [X]."
3. Dopo 4 secondi, `getNextLessonSuggestion()` mostra: "La prossima lezione è '[Y]'. Vuoi iniziare?"
4. Entrambi i messaggi vengono letti ad alta voce (TTS)

#### Catena curriculum:
I 67 lesson path JSON hanno tutti il campo `session_save.next_suggested`:
- v1-cap6-esp1 → v1-cap6-esp2 → v1-cap6-esp3 → v1-cap7-esp1 → ...
- Ultimo della catena (v3-extra-simon) → `null` (fine curriculum)

#### Prima volta (nessuna sessione salvata):
- Suggerisce direttamente v1-cap6-esp1 "Accendi il tuo primo LED"
- Messaggio: "Iniziamo dal primo esperimento: accendiamo un LED! Premi per iniziare."

### Note implementative
- `getNextLessonSuggestion()` non carica automaticamente l'esperimento — mostra solo il suggerimento come overlay
- Il docente può poi caricare l'esperimento manualmente o chiedere a UNLIM "carica [esperimento]"
- In futuro: il messaggio potrebbe includere un bottone "Inizia" che carica l'esperimento

## Verifiche
| Check | Risultato |
|-------|-----------|
| Build exit 0 | ✅ |
| next_suggested usato | ✅ |
| resume_message usato | ✅ |
| Prima volta → v1-cap6-esp1 | ✅ |
| Ritorno → next from last | ✅ |
| TTS su suggerimento | ✅ |
| Timing: welcome 1s + suggestion 5s | ✅ |
