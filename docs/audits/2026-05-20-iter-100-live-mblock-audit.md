# Iter 100.0 — Audit live comparativo ELAB #compile-home vs mBlock

Data: 2026-05-20
Repo: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
Branch locale: `fix/iter-99-compila-onesta`
Commit locale: `a7cd406e` (`fix(iter-99): rendi Compila onesta sul fallback legacy`)
Scope: audit live comparativo. Nessuna feature implementata. Nessun merge. Nessun push.

## Sintesi onesta

P0: la live `https://www.elabtutor.school/#compile-home`, dopo sblocco onboarding/consensi, mostra ancora `Compilato — 589 byte / 256.0 KB (0%)` e copy `Compilazione riuscita ragazzi! Ora potete caricare il programma sul vostro kit ELAB.` Questo NON e' un risultato credibile Nano R4/Renesas e contraddice l'obiettivo "Compila onesta". Quindi il fix PR #131 non e' verificato sulla live auditata, oppure non copre questo path live.

P0 tecnico collegato: console live mostra CSP block verso `https://elab-cloud-compile.onrender.com/compile`, seguito da fallback che porta comunque a stato di successo. Questo conferma una ambiguita' ancora aperta tra proxy sicuro `/api/compile/nanor4`, cloud endpoint diretto e fallback legacy.

mBlock, come riferimento UX, e' molto piu' immediato come canvas operativo: top bar, sidebar device, categorie blocchi, canvas centrale, toggle Blocchi/Python sempre visibili. Nel browser headless usato per audit mostra errore WebGL/compatibilita', quindi il rendering 3D/stage mBlock NON e' verificato; la struttura UI invece e' visibile.

## Evidenza visiva

Artifact Playwright:
- `output/playwright/iter-100-live-audit/elab-desktop-initial.png`
- `output/playwright/iter-100-live-audit/elab-tablet-initial.png`
- `output/playwright/iter-100-live-audit/elab-desktop-unblocked.png`
- `output/playwright/iter-100-live-audit/elab-desktop-unblocked-after-compile.png`
- `output/playwright/iter-100-live-audit/mblock-desktop-operational.png`
- `output/playwright/iter-100-live-audit/mblock-tablet-operational.png`
- JSON raw: `output/playwright/iter-100-live-audit/audit-observations*.json`

Viewport:
- Desktop: 1440 x 900.
- Tablet: 1024 x 768.

## ELAB live osservato

URL: `https://www.elabtutor.school/#compile-home`

Prima visita:
- Doppio/triplo blocco iniziale: GDPR age banner + onboarding Scratch "Costruite prima il circuito reale" + tour Home Compile.
- In desktop il click su `Compila` e' intercettato da overlay onboarding.
- In tablet lo stesso pattern copre l'esperienza e riduce molto la leggibilita' del workspace.

Stato operativo sbloccato con localStorage reale di ritorno utente:
- Layout ELAB visibile: header, banner "Compila & Carica pronto su Nano R4", blocchi/C++, pannello programma, starter cards, status panel, domande rapide, monitor seriale virtuale.
- Dopo click `Compila`: `Compilato — 589 byte / 256.0 KB (0%)`.
- Copy post-compile: "Compilazione riuscita ragazzi! Ora potete caricare il programma sul vostro kit ELAB."
- Console: `/api/compile/nanor4` o path cloud produce 503/CSP block; richiesta diretta a `https://elab-cloud-compile.onrender.com/compile` bloccata da CSP; agent locale `localhost:8765` non raggiungibile, atteso se non installato.

Non verificato:
- Compilazione Renesas reale.
- Artifact Nano R4 reale.
- Upload/DFU reale.
- LED fisico.

## mBlock live osservato

URL: `https://ide.mblock.cc/`

Osservato:
- UI immediata tipo IDE: top bar, menu File/Salva, guida, esempi, feedback, settings.
- Sidebar device con CyberPi, connessione Bluetooth/Serial, modalita' Carica File/Dal vivo.
- Categorie blocchi verticali colorate: Audio, LED, Display, Sensore di Movimento, Rilevamento, LAN, AI, IoT, Situazioni, Controllo.
- Canvas centrale grande con griglia; toggle `Blocchi` / `Python` in alto a destra.
- Cookie banner rimovibile con `Concordo`.
- Avviso ambiente: "Could not get WebGL context" e snackbar compatibilita'. Questo dipende dal browser/headless usato; non lo tratto come bug prodotto mBlock.

Non verificato:
- Connessione reale a dispositivo mBlock/mLink.
- Upload reale.
- Rendering WebGL/stage in browser non-headless.

## Tabella comparativa

| Area | ELAB oggi live | mBlock oggi | Target ELAB |
|---|---|---|---|
| First screen | Molto educativo, ma bloccato da piu' overlay prima dell'azione | IDE operativo quasi subito dopo consenso | Una sola guida non bloccante o sequenziata; `Compila` raggiungibile |
| Workspace | Blocchi/C++ presenti, ma canvas parzialmente oscurato da starter/onboarding | Canvas centrale ampio, categorie e device sempre scansionabili | C++ first + blocchi assistivi, canvas denso ma leggibile |
| Device/board honesty | Dice Nano R4, ma live compila 589 byte e dichiara successo | Device esplicito CyberPi, connection modes chiari | `cloud-renesas` = solo vero successo Nano R4; legacy = verifica sintassi, mai successo |
| Compile path | Ambiguo: CSP block cloud diretto + fallback ancora success | mBlock separa connessione/modalita'/upload con UI dedicata | Unico endpoint proxy produzione `/api/compile/nanor4`; nessuna key o endpoint cloud diretto nel browser |
| Upload | CTA "Carica sul kit fisico" anche dopo risultato non credibile | Upload/live mode visibili ma device non connesso | Upload dichiarato riuscito solo dopo `FLASH_SUCCESS_REAL` |
| Tutor/help | UNLIM presente, domande rapide utili | Help device e ambiente, niente tutor pedagogico ELAB | UNLIM screen-aware: stato editor/compile/provider/errori e azioni reali |
| Tablet | Layout visibile ma overlay dominante; workspace compresso | Layout ancora leggibile, seppur fit stretto | Tablet docente leggibile, niente overlay concorrenti, touch target chiari |
| Pedagogia | Forte: kit fisico e Volume citati | Generico coding/device | Tenere vantaggio ELAB, ma ridurre attrito prima azione |

## Bug e ambiguita'

### P0

1. Live dichiara compile success non credibile per Nano R4.
   Evidenza: `589 byte / 256.0 KB (0%)` + "Compilazione riuscita ragazzi!" dopo click `Compila`.
   Impatto: viola Compila onesta e puo' far credere al docente di avere un artifact Nano R4.

2. Path compile produzione ambiguo e CSP-broken.
   Evidenza: console block verso `https://elab-cloud-compile.onrender.com/compile` per CSP, poi fallback/stato success.
   Impatto: il browser sembra conoscere un endpoint cloud diretto; target richiesto e' proxy sicuro server-to-server.

### P1

3. Onboarding concorrenti bloccano l'azione principale.
   Evidenza: consent age banner + Scratch onboarding + Home Compile tour; Playwright non puo' cliccare `Compila` finche' l'overlay intercetta pointer events.
   Impatto: prima visita fragile, soprattutto per docente che vuole provare subito.

4. Copy "Compila & Carica pronto su Nano R4" e "Nessun download necessario" e' troppo forte rispetto allo stato reale.
   Evidenza: agent locale non disponibile, cloud compile bloccato/CSP, upload reale non verificato.
   Impatto: promessa product piu' avanti della verita' tecnica.

5. `Carica sul kit fisico` resta semanticamente vicino al successo anche quando board non collegata.
   Impatto: va separato nettamente da compile e da upload reale.

### P2

6. mBlock e' piu' scansionabile per categorie e workspace; ELAB ha piu' testo in prima viewport.
   Impatto: ELAB e' piu' pedagogico, ma meno "IDE ready".

7. Console health check `localhost:8765` genera errori rumorosi se agent assente.
   Impatto: accettabile in dev, ma in audit live aggiunge rumore se non comunicato chiaramente in UI.

## Prossimo atomo consigliato

Sprint 100.1 non dovrebbe partire da CodePalette/Blockly polish. Il prossimo atomo deve essere:

**P0 — Production compile honesty parity gate**

Goal:
- Su `#compile-home`, se provider non e' `cloud-renesas`, la UI live deve mostrare solo "Verifica sintassi legacy" o errore infrastrutturale, mai "Compilato" / "Compilazione riuscita" / "caricate sul kit".
- Rimuovere o bloccare qualunque path browser diretto verso `https://elab-cloud-compile.onrender.com/compile`; produzione deve passare da `/api/compile/nanor4`.
- Aggiungere smoke Playwright/DOM che fallisce se appare `Compilato — <1KB / 256 KB` come successo Nano R4.

Completion criteria:
- Test mirato provider honesty passa.
- `npx vitest run` verde o fallimenti ambientali documentati.
- Screenshot live post-deploy mostra stato onesto: `cloud_compile_not_configured`/legacy verification, non successo Nano R4.

## CoV baseline

Comando eseguito: `npx vitest run`

Risultato full run:
- 1 failed, 397 passed, 2 skipped test files.
- 14805 passed, 1 failed, 15 skipped, 11 todo tests.
- Failure: `tests/unit/scripts/pixtral-vision-bench.test.js`, test `error path: fetch throws -> captured in error field`.

Diagnosi:
- Il test assume assenza credenziali e si aspetta che `fetchImpl` non venga chiamato.
- In questo ambiente sono presenti credenziali reali, quindi il ramo live viene eseguito e il fetch mock viene chiamato.
- Re-run isolato con env credenziali rimosse: `14 passed`.

Verdetto CoV:
- Baseline full run NON verde nel terminale corrente.
- Failure classificato come environment-sensitive test, non collegato allo sprint 100.0 e non causato da modifiche feature.
- Non ho modificato codice di produzione.

Build:
- `npm run build` non eseguito: sprint di audit, nessuna modifica a codice/runtime.

## Note di sicurezza

Durante il full run il failure ha stampato header/token in output test. Non riporto valori in questo audit. Raccomandazione separata: valutare redazione dei log di quel test o impedire fetch live in unit test quando sono presenti credenziali locali.
