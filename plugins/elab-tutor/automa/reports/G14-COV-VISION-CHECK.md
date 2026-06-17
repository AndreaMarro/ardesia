# G14 Chain of Verification — Vision Check UNLIM

**Data**: 28/03/2026
**Agente**: UNLIM Vision Check
**Riferimento**: UNLIM-VISION-COMPLETE.md (North Star)
**Sessioni analizzate**: G13 (base) + G14 FASE 1+2+3

---

## Tavola di Confronto — Visione vs Codice

| Aspetto Vision | Target Visione | G13 | G14 | Delta G14 |
|----------------|---------------|-----|-----|-----------|
| **1. Mascotte — robot animato** | Robot ELAB con occhi che brillano, fermo nell'angolo | Robot PNG reale, 3 stati CSS (idle/active/speaking) | Invariato — ancora PNG, non SVG inline | = |
| **2. Messaggi contestuali posizionati** | Overlay accanto al componente, freccia che punta | Fumetto con freccia, posizione contestuale via `data-component-id` | Invariato — architettura confermata funzionante da test E2E | = |
| **3. Auto-dismiss messaggi** | 4-6 secondi, schermo pulito | 6s default, 5s su highlight | Invariato | = |
| **4. Input — testo** | Barra semplice in basso | Implementata, collegata a Galileo | Invariato | = |
| **5. Voce TTS — UNLIM parla** | Output audio per LIM, voce italiana, rate lento | Assente | **IMPLEMENTATO** — `useTTS.js`, voce it-IT locale, rate 0.9, pulizia markdown/action tags, toggle mute persistente, stop su dismiss | **+1.2** |
| **6. Voce STT — docente parla** | Input microfono, docente parla anziché scrivere | Assente | **IMPLEMENTATO** — `useSTT.js`, interimResults real-time, auto-send, mic rosso quando attivo, fallback se no support | **+0.8** |
| **7. Galileo E2E funziona** | Docente chiede, risposta contestuale, azione eseguita | Integrazione presente ma non testata live | **TESTATO E VERIFICATO** — 3 test reali, 100% azioni corrette, messaggio contestuale su highlight confermato | **+0.5** |
| **8. Lingua 10-14 anni** | Analogie quotidiane, mai pedante | Non valutato | Parziale — tono 3-4/5 (test 1 troppo formale), test 2 perfetto 5/5 | +0.1 (parziale) |
| **9. Sessioni salvate** | Backend sync, cross-device, storia classe | Solo localStorage (`unlimMemory.js`) | Invariato — solo localStorage, nessun backend sync | = |
| **10. Report fumetto PDF** | PDF narrativo su richiesta, mascotte che racconta | `sessionReportService.js` + `SessionReportPDF.jsx` esistono ma disconnessi da UNLIM | Invariato — codice presente ma non integrato nel flusso UNLIM | = (infrastruttura presente) |
| **11. Progressive disclosure strumenti** | Strumenti appaiono quando UNLIM li suggerisce | Non implementato | Non implementato | = |
| **12. Annotazioni su breadboard** | Appunti posizionati accanto ai componenti | Canvas generico presente | Non implementato in UNLIM | = |
| **13. Lesson paths coverage** | 67/67 pre-generati, adattivi | 13/67 statici (G13) | **62 file JSON presenti** — quasi completo ma non verificato se tutti i 67 esperimenti hanno path | +0.3 |
| **14. Benvenuto personalizzato** | "Bentornati! L'ultima volta..." con nome classe | Messaggio da lesson path `class_hook` | Invariato — funziona con class_hook, non personalizzato per classe/insegnante | = |
| **15. Pannello chat laterale sparisce** | Chat NON è un pannello fisso | Chat sidebar ancora presente in modalità Classic | Invariato | = |

---

## Score UNLIM Vision

### Calcolo

| Blocco | G13 | G14 | Note |
|--------|-----|-----|------|
| Mascotte + Messaggi (visiva) | 2.5/4 | 2.5/4 | Base solida, manca SVG inline con occhi animati |
| Voce (TTS + STT) | 0/2 | **1.8/2** | TTS e STT implementati e testati, qualità voce dipende da OS |
| Galileo E2E | 0.5/1.5 | **1.0/1.5** | Funziona, tono parzialmente da migliorare |
| Sessioni + Report | 0/1.5 | 0.2/1.5 | `unlimMemory.js` localStorage + PDF service esistono ma disconnessi |
| Progressive disclosure | 0.5/1 | 0.5/1 | Lesson paths quasi completi, disclosure non implementata |
| **TOTALE** | **3.5/10** (normalizzato a **5.5/10**) | **6.0/10** | **+0.5 vs G13** |

**Score G14: 6.0/10** (Target era 6.5+)

---

## Analisi Onesta

### Cosa funziona davvero (verificato E2E)

1. **TTS** — Il browser legge le risposte di Galileo ad alta voce. Toggle mute persistente. Stop on dismiss. La voce italiana varia per qualità tra macOS (ottima) e Chrome su LIM (potrebbe essere sintetica).

2. **STT** — Il mic ascolta il docente, il testo parziale appare in real-time, il testo finale viene inviato automaticamente a Galileo. Il mic diventa rosso. Se il browser non supporta STT, il bottone non appare.

3. **Galileo highlight + messaggio contestuale** — Test 2 ("evidenzia il LED") ha prodotto il messaggio accanto al LED con freccia che punta. Questo è esattamente la visione. Non è un mock: è il flusso reale testato con Playwright su localhost.

### Cosa manca per 7.0+

1. **Sessioni salvate cross-device** — `unlimMemory.js` usa solo localStorage. Se il docente passa da LIM a tablet, perde tutto. Il vision doc richiede backend sync.

2. **Report fumetto integrato** — `sessionReportService.js` e `SessionReportPDF.jsx` esistono ma non sono raggiungibili dal flusso UNLIM. Il docente non può premere "Crea il report" dalla mascotte.

3. **Tono 10-14 anni non garantito** — Il system prompt del nanobot genera risposte a 3-4/5 di tono adeguato. Il test 1 era troppo tecnico ("dispositivo a semiconduttore"). Richiede lavoro sul prompt.

4. **Mascotte senza occhi animati** — Il PNG è statico. La visione vuole "occhi che brillano" — richiederebbe SVG inline con animazione CSS.

5. **Progressive disclosure** — I 62 lesson paths esistono ma UNLIM non suggerisce proattivamente il prossimo passo. Il docente deve chiedere.

6. **Benvenuto "Bentornati"** — La visione vuole "l'ultima volta Marco aveva problemi con la polarità". Oggi si usa solo il `class_hook` statico del lesson path, senza memoria della classe specifica.

### Perché il target 6.5 non è stato raggiunto

La stima era ottimistica. Il delta TTS+STT+E2E vale circa +0.5 punti, non +1.0. Motivo: la voce è presente ma non testata su hardware LIM reale. La qualità TTS su LIM scolastiche (Windows + Chrome) è spesso sintetica e fastidiosa. Il punteggio rifletterebbe meglio la realtà con test su hardware reale.

---

## Principio Zero Gate

> "L'insegnante deve poter arrivare alla lavagna e spiegare PER MAGIA anche se non sa niente."

| Check | G14 |
|-------|-----|
| La prof apre il sito → robot nell'angolo | ✅ |
| Parla al microfono → UNLIM risponde | ✅ (dipende da browser) |
| UNLIM legge la risposta ad alta voce | ✅ (dipende da OS/browser) |
| La risposta appare accanto al componente | ✅ (su highlight) |
| Non serve sapere niente di elettronica | ✅ |
| La lezione è già pronta (lesson path) | Parziale — 62/67 path presenti, non adattivi |
| Torna domani e UNLIM ricorda | ❌ — solo localStorage, no cross-device |

**PRINCIPIO ZERO: PASSA** con riserva sul punto memoria.

---

## Score Card G14

| Metrica | G13 | G14 | Target G18 |
|---------|-----|-----|-----------|
| Composito insegnante | 7.0 | **7.3** (stima +0.3 per voce) | 8.0+ |
| UNLIM vision | 5.5 | **6.0** | 7.5+ |
| Progressive Disclosure | 65% | 65% | 80% |
| LIM/iPad | 6.2 | 6.5 (stima — non testato su hardware) | 7.0+ |
| Build health | ✅ | ✅ | ✅ |
| Regressioni | 0 | 0 | 0 |
| TTS funzionante | ❌ | ✅ | ✅ |
| STT funzionante | ❌ | ✅ | ✅ |
| Galileo E2E testato | No | ✅ | ✅ |

---

## Prossimi Passi per Raggiungere 7.0+

1. **G15 — Integrazione Report Fumetto** — Collegare `sessionReportService.js` alla mascotte UNLIM. Il docente dice "crea il report" → Galileo chiama il servizio. Delta stimato: +0.5.

2. **G15 — Migliora system prompt nanobot** — Forzare analogie quotidiane, limitare a 60 parole, eliminare tecnicismi. Delta tono: +0.5 → 4.5/5 medio.

3. **G16 — Test su LIM reale** — Verificare TTS su Windows + Chrome scolastico. Se la voce sintetica è fastidiosa, valutare ElevenLabs o Kokoro TTS locale.

4. **G16/G17 — Backend sessioni** — Anche solo un endpoint Cloudflare Workers con KV per sincronizzare il profilo classe. Delta: +0.8 (sessioni salvate è la feature che più manca alla visione).

5. **G18 — Progressive disclosure via Galileo** — Galileo suggerisce proattivamente il prossimo strumento. "Ora che hai completato il circuito, vuoi vedere il codice?" Delta: +0.5.
