# G16 MARATHON — "UNLIM RICORDA" (Sessioni + Contesto Classe)

Data: [INSERISCI DATA]. Durata: Sessione lunga. Principio Zero: "Bentornati! L'ultima volta avete fatto il LED. Oggi passiamo al resistore." UNLIM sa cosa ha fatto la classe. Quando il docente torna, riprende da dove era.

PREREQUISITI: G12 (toolbar minimale) + G13 (mascotte + messaggi) + G14 (voce + galileo test). Leggi G15 audit — se il piano e' cambiato, segui il piano aggiornato.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. automa/reports/G15-AUDIT-MIDPOINT.md (course correction!). 4. automa/context/UNLIM-VISION-COMPLETE.md sezione "Sessioni Salvate". 5. automa/PIANO-2-SETTIMANE.md. 6. src/services/unlimMemory.js (memoria attuale). 7. src/services/studentTracker.js (tracking attuale). 8. Questo prompt.

FASE 0: Bootstrap (15 min). Build. Leggi unlimMemory.js — cosa salva gia'? Leggi studentTracker.js — cosa traccia gia'? Documenta gap in automa/reports/G16-AUDIT-INIZIALE.md.

FASE 1: Sessione Strutturata (2-3 ore). Quando il docente apre un esperimento → INIZIO SESSIONE automatico. Tutto registrato in un oggetto sessione:
- id: "sess_[timestamp]_[experimentId]"
- experimentId, startTime, endTime
- messages: [{role, content, timestamp}] — tutti i messaggi UNLIM
- actions: [{type, target, timestamp}] — azioni eseguite (loadexp, compile, highlight...)
- errors: [{type, detail, timestamp}] — LED al contrario, cortocircuito, compilazione fallita
- screenshots: [base64] — screenshot circuito ogni 60s SE il circuito e' cambiato
- summary: stringa generata da UNLIM a fine sessione ("Primo circuito LED. 3 errori polarita'.")

Salvataggio: localStorage con chiave elab_sessions. Array di sessioni. Max 50 sessioni (FIFO). Compressione: screenshots in quality 0.3 per risparmiare spazio.

Hook punti: main.jsx al boot → init sessione. NewElabSimulator → onExperimentChange → nuova sessione. window beforeunload → chiudi sessione. ElabTutorV4 → ogni messaggio → aggiungi a sessione.

FASE 2: Contesto Classe (2 ore). Al boot, UNLIM legge TUTTE le sessioni precedenti. Costruisce "classProfile":
- lastExperiment: ultimo esperimento completato
- completedExperiments: set di ID
- confusedConcepts: concetti con errori ripetuti (polarita', cortocircuito, resistenza...)
- totalTime: tempo totale di utilizzo
- nextSuggested: prossimo esperimento sequenziale nel curriculum

Questo profilo iniettato nel system prompt di ogni richiesta sendChat():
"[CONTESTO CLASSE] Ultima lezione: v1-cap6-esp1 (LED). Errori: polarita' LED (2 volte). Prossimo: v1-cap6-esp3."

Messaggio di benvenuto contestuale:
- Prima volta: "Ciao! Sono UNLIM. Oggi facciamo il primo esperimento: accendiamo un LED!"
- Ritorno: "Bentornati! L'ultima volta avete fatto [X]. Oggi vi propongo [Y]."
- Stesso giorno: "Andiamo avanti! Siamo al [X]."

FASE 3: Suggerimento Prossima Lezione (1 ora). Quando docente apre UNLIM senza esperimento → overlay centro schermo: "La prossima lezione: [Cap X Esp Y — Titolo]. Servono: [componenti]. Premi ▶ per iniziare." Bottone "▶ Inizia" carica l'esperimento. Bottone "Cambia" apre ExperimentPicker.

FASE 4: CoV + Verifica (1-2 ore). Test 1: Apro UNLIM, carico esperimento, faccio cose, chiudo. Riapro → UNLIM ricorda? Messaggio contestuale? Test 2: Faccio 3 sessioni diverse. Il profilo classe e' corretto? Test 3: Apro senza esperimento → UNLIM suggerisce il prossimo? Test 4: Build PASSA. Test 5: Zero regressioni. 3 agenti CoV. Scrivi: automa/reports/G16-VERIFICA-FINALE.md.

TARGET: Sessioni salvate localStorage (★★★). Messaggio benvenuto contestuale (★★★). Suggerimento prossima lezione (★★). Profilo classe nel prompt AI (★★). Score UNLIM 5.5 → 6.5 (★★).
