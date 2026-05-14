# Handoff — prossima sessione Lavagna/UNLIM/voce/iPad

Data: 2026-05-08  
Stato: sessione corrente corregge i bug urgenti Lavagna/tre pulsanti/UNLIM/voce UI e prepara deploy.

Deploy corrente:

- Preview: `https://elab-tutor-c3jw3gyee-andreas-projects-6d4e9791.vercel.app`
- Alias stabile aggiornato: `https://elab-tutor-andreamarro-andreas-projects-6d4e9791.vercel.app`

## Stato attuale da ricontrollare per prima cosa

1. Aprire il deploy e `/#lavagna`.
2. Premere `Inizia`.
3. Verificare visivamente:
   - UNLIM e aperto come chat, non come pannello vuoto.
   - Header non mostra Capitoli.
   - Tre pulsanti belli e chiari su iPad: Percorso, Passo Passo, Gia Montato.
   - Passo Passo mostra un solo pannello: quello che monta il circuito.
   - Premendo Avanti il circuito cambia passo e si vedono i componenti montati.
   - Percorso parte senza circuito montato e apre tab Percorso.
   - Gia Montato mostra circuito completo e UNLIM resta chat/diagnosi conversazionale, non secondo pannello Passo Passo.
   - Manuale con penna permette scrittura nell'area utile del pannello.
   - Gomma presente nella toolbar.
   - Pulsante voce e pill `Ehi UNLIM` visibili.

## Contesto tecnico importante

File centrali:

- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/AppHeader.jsx`
- `src/components/lavagna/GalileoAdapter.jsx`
- `src/components/lavagna/ModalitaSwitch.jsx`
- `src/components/lavagna/ModalitaSwitch.module.css`
- `src/components/lavagna/VolumeViewer.jsx`
- `src/components/lavagna/VolumeViewer.module.css`
- `src/components/simulator/hooks/useSimulatorAPI.js`
- `src/components/simulator/panels/ComponentDrawer.jsx`
- `src/services/simulator-api.js`
- `src/services/voiceService.js`

Documenti da leggere:

- `docs/CoV/2026-05-08-lavagna-unlim-voice-modalita-cov.md`
- `docs/audits/2026-05-08-lavagna-voice-modalita/`
- `docs/audits/2026-05-08-lavagna-voice-modalita/deploy-ipad-passo.png`
- `docs/handoff/2026-05-08-next-automation-plan-unlim-three-buttons.md`
- `docs/anti-regression.md`

## Cosa resta da fare nella prossima sessione

P0:

- Testare voce reale sul deploy HTTPS: microfono, STT, risposta UNLIM, eventuale TTS.
- Testare wake word `Ehi UNLIM` su Chrome/Edge reale. Non mentire su Safari/iPad: se Web Speech non c'e, documentare fallback con pulsante microfono.
- Rifinire nudge microfono su iPad: piu bello, meno invadente, ma sempre chiaro.
- Testare Apple Pencil su Manuale e Lavagna: tratto, gomma, salvataggio per esperimento/sessione.
- Testare persistenza: entra/esci da esperimento, salvataggio sessione, cronologia.
- Testare fumetto/report cronologia incrociando sessione, screenshot, messaggi, immagini.

P1:

- Rendere ComponentDrawer ancora piu ergonomico: resize touch-friendly, posizione salvata, nessuna copertura di componenti critici.
- Pulire warning Supabase realtime 401 in locale/test se impatta UX.
- Migliorare naturalezza e velocita UNLIM con conversazioni lunghe, vaghe, difficili, pertinenti al volume.

## Prompt per avviare la prossima sessione

```txt
Rileggi tutto il contesto locale e non compiacermi. Usa prima i documenti:
- docs/CoV/2026-05-08-lavagna-unlim-voice-modalita-cov.md
- docs/handoff/2026-05-08-lavagna-unlim-voice-modalita-next-session.md
- docs/handoff/2026-05-08-next-automation-plan-unlim-three-buttons.md
- docs/anti-regression.md

Prima cosa: ricontrolla il lavoro della sessione precedente sul deploy e in locale con Playwright, desktop + iPad landscape. Non dichiarare fatto senza screenshot.

Obiettivo sessione:
1. Verifica e migliora modalita vocale UNLIM su deploy HTTPS: microfono, STT, risposta, eventuale TTS, naturalezza e velocita.
2. Verifica wake word "Ehi UNLIM" su browser reale supportato. Se Safari/iPad non supporta wake word continuo, documenta fallback onesto con pulsante microfono.
3. Testa iPad/Apple Pencil: design bello, non solo adattato; touch target, pannelli, penna, gomma, manuale, lavagna per esperimento.
4. Verifica persistenza lavagna: ogni esperimento ha la sua lavagna, uscire non cancella, sessioni salvate conservano stato.
5. Verifica fumetto/report cronologia: deve incrociare cronologia sessione, screenshot, messaggi UNLIM e immagini.
6. Esegui conversazioni UNLIM lunghe e difficili: richieste vaghe, complesse, azioni composte, Arduino/Scratch/circuiti, Principio Zero V3 e morfismo.
7. Mantieni no-regressioni sui tre pulsanti:
   - Percorso: canvas vuoto/sandbox + tab Percorso, niente clearAll distruttivo di sessioni salvate.
   - Passo Passo: solo ComponentDrawer, Avanti monta il circuito progressivamente.
   - Gia Montato: circuito completo funzionante, niente ComponentDrawer, UNLIM chat/diagnosi.

Ogni modifica va verificata con:
- test unitari mirati
- Playwright con screenshot desktop + iPad
- CoV
- debug/audit
- build locale
- deploy Vercel

Alla fine aggiorna handoff, CoV e prompt per la sessione successiva. Non saltare passaggi, non mentire, non compiacere.
```
