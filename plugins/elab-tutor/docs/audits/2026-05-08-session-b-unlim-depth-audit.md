# Audit — Sessione B UNLIM depth

Data: 2026-05-08

## Findings corretti

1. **Troncamento client UNLIM**
   - Prima: `useGalileoChat` tagliava a 60 parole. Rischio: sparivano citazioni Vol./pag. e parti diagnostiche.
   - Fix: rimosso hard cap lato Lavagna, lasciando solo strip dei tag `[AZIONE]`/`[INTENT]`.

2. **Citazione incompleta accettata**
   - Prima: `alreadyCitesBook("Nel Vol. 2...")` tornava true anche senza pagina.
   - Fix: una citazione è valida solo se contiene pagina esatta o coppia volume+pagina.

3. **Percorso “Lezione personalizzata” mostrava envelope**
   - Prima: `sendChat` ritorna `{ success, response, ... }`, ma la view cercava `content/message` e poteva mostrare JSON.
   - Fix: priorità a `reply.response`, con errore esplicito su risposta vuota.

4. **Voice capability rumorosa**
   - Prima: probe diretto al VPS HTTP Edge TTS generava errori CSP.
   - Fix: niente probe browser verso IP HTTP; TTS passa da proxy same-origin/backends, capability basata su API browser.

5. **Supabase locale rumoroso**
   - Prima: `scribble_paths` e realtime nudge producevano 401 in locale con env dev.
   - Fix: sync/realtime remoto disabilitati in locale salvo opt-in.

## Non corretto / residuo

- Microfono reale, STT, TTS udibile e wake word continuo non verificati su hardware.
- Safari/iPad può non supportare wake word continuo: il bottone microfono resta fallback primario.
- Build ancora segnala warning CSS/chunk non legati a questa sessione.
- Deploy preview creato ma non promosso a production.

## File toccati

- `src/components/lavagna/useGalileoChat.js`
- `src/components/lavagna/PercorsoCapitoloView.jsx`
- `src/services/api.js`
- `src/services/bookCitation.js`
- `src/services/voiceService.js`
- `src/services/supabaseSync.js`
- `src/services/drawingSync.js`
- `tests/unit/unlimCitesBook.test.js`
- `tests/unit/components/lavagna/PercorsoCapitoloView.test.jsx`

