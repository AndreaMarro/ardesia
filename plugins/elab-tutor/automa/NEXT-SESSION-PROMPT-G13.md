# G13 MARATHON — "IL ROBOT PRENDE VITA" (Mascotte + Messaggi Contestuali)

Data: [INSERISCI DATA]. Durata: Sessione lunga. Principio Zero: UNLIM non e' una lettera "U". E' il robottino del logo ELAB — vive nel simulatore, ferma nell'angolo, si attiva quando serve. I messaggi appaiono DOVE servono. REGOLA: Tutto cio' che fai deve cambiare l'esperienza dell'insegnante sulla LIM. ZERO infrastruttura.

PREREQUISITO: G12 completata. Toolbar 3 bottoni. Tab nascosti. fontSize fixato.

STATO POST-G12 — Leggi: automa/reports/G12-VERIFICA-FINALE.md, automa/reports/G12-SCORES.md.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. automa/context/UNLIM-VISION-COMPLETE.md sezione "Come Appare sulla LIM". 4. automa/context/GALILEO-CAPABILITIES.md. 5. automa/PIANO-2-SETTIMANE.md. 6. Questo prompt.

FASE 0: Bootstrap + Asset Check (30 min). npm run build PASSA. Cerca assets mascotte in public/assets/mascot/ — se non esiste SVG robot, e' la prima cosa da creare. Documenta in automa/reports/G13-AUDIT-INIZIALE.md.

FASE 1: SVG Mascotte Robot (1-2 ore). Crea (o migliora) il robot ELAB come SVG: stile piatto, friendly, occhi rotondi, corpo compatto. Deve funzionare a 48px (angolo schermo) e 200px (centro). 3 stati CSS: idle (navy, neutro), speaking (lime glow, occhi brillano), thinking (pulsazione lenta). File: src/components/unlim/UnlimRobot.jsx — componente SVG con prop `state`. Plugin: /frontend-design per il design del robot, /design-system per coerenza palette ELAB.

FASE 2: Sostituzione in UnlimMascot (1 ora). UnlimMascot.jsx (70 LOC) attualmente renderizza una lettera "U". Sostituisci con UnlimRobot. Mantieni: 3 stati (idle/active/speaking), onClick toggle chat, posizione angolo basso-destra. Aggiungi: transizione animata tra stati (CSS transition), leggero ingrandimento quando speaking.

FASE 3: Messaggi Contestuali Posizionati (3-4 ore) ★ CRITICO. Questo e' il cuore della visione. I messaggi appaiono ACCANTO al componente di cui parlano, non in top-center.

Come funziona: 1. UNLIM risponde con testo + [AZIONE:highlight:led1]. 2. Il sistema trova la posizione SVG di led1 nel canvas. 3. Mostra il messaggio come fumetto accanto a quel componente. 4. Dopo 4-6 secondi, sfuma.

Implementazione: Modifica UnlimOverlay.jsx per accettare targetPosition {x, y}. Crea getComponentScreenPosition(componentId) — trova componente → coordinate SVG → coordinate schermo (zoom/pan). Se targetPosition presente → posiziona li'. Altrimenti → centro schermo. Fumetto con freccia che punta al componente.

Fallback posizioni: messaggi generali → centro schermo. Messaggi breadboard → sopra breadboard. Messaggi codice → accanto editor (se visibile).

FASE 4: Integrazione Action Tags (1-2 ore). In ElabTutorV4.jsx, quando parsa [AZIONE:highlight:xxx]: (1) esegui highlight (gia' funziona), (2) ottieni posizione componente, (3) passa al sistema overlay come targetPosition. Il messaggio testuale appare accanto al componente evidenziato.

FASE 5: CoV + Verifica (1-2 ore). Layer 1: Build PASSA. Layer 2: Screenshot — mascotte robot nell'angolo (non "U"). Layer 3: Messaggio accanto al LED dopo [AZIONE:highlight:led1]. Layer 4: Messaggio centro quando generico. Layer 5: Mascotte anima quando speaking. Layer 6: 3 agenti CoV (Prof.ssa Rossi, Bug Hunter, Vision Check). Scrivi: automa/reports/G13-VERIFICA-FINALE.md.

TARGET: Mascotte "U" → robot SVG (★★★). Messaggi top-center → accanto ai componenti (★★★). 3 stati animati (★★). Score UNLIM 1.5 → 3.5 (★★★). Se la Prof.ssa vede il robot e il messaggio accanto al LED — successo. Se vede ancora la "U" e toast in alto — fallimento.
