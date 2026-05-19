# CoV — Lavagna UNLIM, tre pulsanti, voce, iPad

Data: 2026-05-08  
Scope: richieste Andrea su Lavagna ELAB, tre pulsanti, UNLIM imprescindibile, Passo Passo vero, voce/wake word, Manuale annotabile, iPad.

## Verdetto

PASS condizionato: le regressioni principali richieste sono state corrette e verificate con test unitari + Playwright su desktop e profilo iPad landscape.

Non dichiaro ancora "voce perfetta": il bottone voce e il flusso frontend sono cablati, ma microfono reale, STT/TTS e wake word continuo richiedono smoke test manuale su browser reale. Safari/iPad non garantisce Web Speech wake word continuo; il pulsante microfono resta il percorso primario su iPad.

## Cosa e stato verificato

- Header Lavagna: pulsante Capitoli assente, pulsante UNLIM presente.
- UNLIM: chat aperta di default in Lavagna; non diventa "guida" o "diagnosi" quando si preme Passo Passo/Gia Montato.
- Passo Passo: unico pannello operativo e il circuito monta premendo Avanti.
- Passo Passo: step iniziale 0, dopo Avanti step 1, componente LED visibile.
- Percorso: canvas pulito/sandbox, step -1, tab Percorso aperta solo quando si preme Percorso.
- Gia Montato: buildMode complete.
- Pulsante "Guarda il mio circuito": assente.
- Voce: controlli voce/microfono visibili in UNLIM.
- Wake word: pill "Ehi UNLIM" visibile e toggle attivo.
- Manuale: layer annotazione spostato sull'area manuale, non solo pagina PDF.
- Homepage video: test conferma due video locali TikTok nella card Videolezioni.
- Homepage: test conferma niente Glossario.
- Homepage Lavagna libera: test conferma niente circuito/simulatore, solo lavagna + UNLIM.

## Evidenze

Deploy:

- Preview: `https://elab-tutor-c3jw3gyee-andreas-projects-6d4e9791.vercel.app`
- Alias aggiornato: `https://elab-tutor-andreamarro-andreas-projects-6d4e9791.vercel.app`

Smoke test deploy alias su iPad landscape:

```txt
hasCapitoli: 0
hasGuardaCircuito: 0
hasUnlimButton: 1
hasVoice: 2
hasWakePill: 1
beforeStep: 0
afterStep: 1
buildMode: guided
```

Screenshot deploy:

- `docs/audits/2026-05-08-lavagna-voice-modalita/deploy-ipad-passo.png`

Test unitari mirati:

```txt
9 test files passed
186 tests passed
3 todo
```

Comando:

```bash
npm test -- --run tests/unit/components/lavagna/LavagnaShell-modalita.test.jsx tests/unit/lavagna/GalileoAdapter-mode-tabs.test.jsx tests/unit/lavagna/AppHeader.test.jsx tests/unit/simulatorAPIComplete.test.js tests/unit/services/simulator-api-events.test.js tests/unit/services/wakeWord.test.js tests/unit/lavagna/VideoFloat-local-videos.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx tests/unit/components/HomePage.test.jsx
```

Screenshot Playwright:

- `docs/audits/2026-05-08-lavagna-voice-modalita/desktop-01-passo.png`
- `docs/audits/2026-05-08-lavagna-voice-modalita/desktop-02-after-avanti.png`
- `docs/audits/2026-05-08-lavagna-voice-modalita/desktop-03-manuale.png`
- `docs/audits/2026-05-08-lavagna-voice-modalita/ipad-01-passo.png`
- `docs/audits/2026-05-08-lavagna-voice-modalita/ipad-02-after-avanti.png`
- `docs/audits/2026-05-08-lavagna-voice-modalita/ipad-03-manuale.png`

## File principali toccati

- `src/components/lavagna/LavagnaShell.jsx`
- `src/components/lavagna/LavagnaShell.module.css`
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
- test collegati in `tests/unit/...`

## Rischi residui

- Wake word continuo: dipende da Web Speech API. Chrome/Edge: da provare live. Safari/iPad: probabile non supportato come wake continuo.
- Voce reale: UI e chiamate cablate, ma serve test microfono reale su HTTPS deployato.
- iPad: screenshot Playwright buono; serve prova touch/Apple Pencil su device fisico.
- Manuale: layer annotazione copre area utile; serve prova reale di tratto continuo con Pencil.
- Supabase realtime test emette 401 in locale su progetto classe virtuale: warning non bloccante per questi fix, ma da pulire.
- Vercel Live feedback viene bloccato da CSP in preview; l'app continua a funzionare, ma il warning resta da decidere.
- Il nudge microfono e visibile ma pesante su iPad: funzionale, da rifinire esteticamente nella prossima sessione.

## Gate no regressioni

Prima di dichiarare done in sessioni future:

- Playwright su desktop + iPad landscape.
- Screenshot prima/dopo Passo Passo Avanti.
- Test `LavagnaShell-modalita`, `GalileoAdapter-mode-tabs`, `AppHeader`, `wakeWord`, `HomePage`, `VideoFloat-local-videos`, `LavagnaShell-free-home-mode`.
- Build locale.
- Deploy Vercel preview.
- Documento CoV aggiornato con cosa e verificato e cosa no.
