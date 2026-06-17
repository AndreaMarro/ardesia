# UNLIM Brain — Design Document
> Approvato: 27/03/2026
> Autore: Andrea Marro + Claude Opus 4.6
> Deadline: 10/04/2026 (2 settimane)

---

## 1. VISIONE

UNLIM non è un chatbot. UNLIM è il prodotto stesso.

La mascotte ELAB vive nel simulatore, ferma nell'angolo. Quando serve, messaggi contestuali appaiono dove hanno senso sullo schermo — poi spariscono. Lo schermo è sempre pulito. Il docente parla o scrive in una barra semplice e UNLIM capisce. UNLIM sa tutto: stato circuito, storia sessioni, curriculum volumi, contesto classe. Può tutto: montare circuiti, compilare, evidenziare, caricare esperimenti. Prepara la lezione dal contesto precedente. La struttura lezione è variabile — si adatta a cosa succede. Linguaggio 10-14 anni. Estetica ELAB.

Tutte le funzionalità attuali restano. Cambia la fruizione e l'estetica. Switch a interfaccia classica (pulita) disponibile.

## 2. DUE MODALITÀ

### UNLIM Mode (DEFAULT)
- Mascotte ELAB nell'angolo (immagine statica, CSS glow quando attiva)
- Messaggi overlay contestuali (appaiono, sfumano, schermo pulito)
- Barra input in basso (testo + microfono)
- Percorso lezione proattivo ("Oggi il pulsante!")
- Strumenti nascosti — appaiono quando il docente li chiede o UNLIM li suggerisce
- Tutto annotabile — si scrive ovunque (breadboard, schermo)
- Sessioni salvate — UNLIM ricorda tutto
- "Crea report" → PDF con messaggi + screenshot

### Classic Mode (switch)
- Stesse funzionalità di oggi ma PULITA
- Meno overlay cognitivo: toolbar ridotta, no Dev/Admin, chat discreta
- Sidebar ordinata, tutto accessibile direttamente
- Nessuna mascotte, nessun overlay proattivo
- Per docenti esperti che vogliono controllo diretto

### Entrambe le modalità
- Fix UX: homepage funzionante, no Dev/Admin nel menu, estetica ELAB
- Font LIM >=24px, touch >=44px
- Sessioni salvate
- Report PDF disponibile

## 3. UNLIM MODE — FLUSSO

### Prima volta
1. Schermo pulito, estetica ELAB. Mascotte nell'angolo.
2. I 3 volumi al centro. "Scegli da dove iniziare."
3. Docente clicca Volume 1 → capitoli → Capitolo 6.
4. Mascotte si attiva. Overlay: "Oggi il LED! Servono: batteria, resistore, LED. Preparo io?"
5. Docente dice "sì". UNLIM monta il circuito.
6. Overlay: "Chiedi ai ragazzi: secondo voi si accende?"
7. Docente preme ▶. LED si accende. Overlay: "Si accende! Il resistore lo protegge."
8. Docente: "mostrami il codice" → appare. "nascondi" → sparisce.
9. Fine lezione. "Crea report" → PDF.

### Sessione successiva
1. Docente apre UNLIM. Mascotte: "Ieri Cap 6, il LED. Oggi Cap 7, il resistore?"
2. "Sì" → UNLIM prepara.

### Il cervello pedagogico sa:
- Curriculum 67 esperimenti (YAML con componenti, concetti, vocabolario, misconcezioni)
- Vocabolario progressivo (Cap 6 non usa "resistenza")
- Esperimento successivo
- Cosa ha fatto la classe nelle sessioni precedenti
- Misconcezioni comuni dei bambini
- Quando suggerire e quando tacere

## 4. COMPONENTI TECNICI

### Già esistenti (intatti)
| Componente | Stato |
|-----------|-------|
| Simulatore engine (CircuitSolver, AVRBridge) | ✅ 8/10 |
| 20 metodi API `__ELAB_API` | ✅ Verificati |
| 26+ action tags Galileo | ✅ Funzionano |
| Brain V13 routing | ✅ 80% accuracy |
| Curriculum YAML 61/62 | ✅ Esistono |
| Scratch/Blockly | ✅ Funziona |
| Whisper voice input | ✅ Integrato |
| 67 esperimenti 3 volumi | ✅ Intatti |
| 4 giochi didattici | ✅ Funzionano |
| Lavagna/annotazioni | ✅ Funziona |
| Quiz system | ✅ Funziona |

### Da creare
| Componente | Descrizione | Complessità |
|-----------|-------------|-------------|
| `UnlimWrapper.jsx` | Wrapper che nasconde/mostra UI classica, gestisce modalità | MEDIA |
| `UnlimMascot.jsx` | Mascotte ELAB: immagine + stato idle/active + CSS glow | BASSA |
| `UnlimOverlay.jsx` | Messaggi overlay: posizione, testo, fade in/out, coda messaggi | MEDIA |
| `UnlimInputBar.jsx` | Barra input unificata: testo + mic + invio. Sostituisce la chat | MEDIA |
| `UnlimModeSwitch.jsx` | Bottone switch UNLIM/Classic + persist in localStorage | BASSA |
| `UnlimSessionManager.js` | Salvataggio sessione: messaggi, stato, esperimento, timestamp | MEDIA |
| `UnlimLessonEngine.js` | Carica percorso lezione da YAML, gestisce 5-step variabile | ALTA |
| `UnlimReportGenerator.js` | "Crea report" → PDF con messaggi + screenshot circuito | MEDIA |
| 67 percorsi lezione JSON | Pre-generati dall'automa dal curriculum YAML | ALTA (volume) |

### Da modificare
| File | Modifica |
|------|----------|
| Homepage/ShowcasePage | Eliminare redirect, mostrare contenuto |
| Menu hamburger | Nascondere Dev/Admin per non-admin |
| Chat component | Nascosta in UNLIM Mode, discreta in Classic |
| ControlBar | Toolbar ridotta, progressive disclosure default=1 |
| ElabTutorV4 | Integrare UnlimWrapper come root |
| Nanobot server.py | Caricare YAML nel contesto per esperimento |

## 5. PIANO 2 SETTIMANE

### Giorno 1-2: FONDAMENTA (Andrea + Claude)
**Obiettivo: template perfetto + scheletro componenti**

1. Creare 1 percorso lezione PERFETTO per v1-cap6-esp1 (il LED)
   - Diventa il template per l'automa
   - 5 step con varianti, testo esatto, action tags, suggerimenti
2. Creare scheletro dei 6 componenti React (UnlimWrapper, Mascot, Overlay, InputBar, Switch, SessionManager)
3. Fix homepage (eliminare redirect)
4. Fix menu (nascondere Dev/Admin)
5. Definire gate automatico: build + verifica prima/dopo

### Giorno 3-5: INTEGRAZIONE (Andrea + Claude + Automa)
**Obiettivo: UNLIM Mode funzionante per 1 esperimento**

6. Integrare UnlimWrapper in ElabTutorV4
7. Mascotte + overlay funzionanti per v1-cap6-esp1
8. Barra input connessa a Galileo (stesse API, diversa UI)
9. Switch UNLIM/Classic funzionante
10. Curriculum YAML nel contesto nanobot
11. L'automa inizia a generare percorsi (10/giorno, usando il template)

### Giorno 6-8: IL CERVELLO (Andrea + Claude + Automa 24/7)
**Obiettivo: UNLIM proattivo + sessioni salvate**

12. UNLIM proattivo: apri esperimento → overlay "Oggi facciamo..."
13. "Monta il circuito per me" → [INTENT:JSON] dal percorso lezione
14. Salvataggio sessione (localStorage: messaggi + esperimento + timestamp)
15. Contesto precedente: "Ieri abbiamo fatto il LED" al rientro
16. L'automa ha generato 30+ percorsi, task adversarial li valida

### Giorno 9-11: QUALITÀ (Andrea supervisiona, macchina lavora)
**Obiettivo: esperienza completa per Volume 1**

17. Classic Mode pulita (fix UX applicati, toolbar ridotta, chat discreta)
18. Estetica ELAB: colori, font, sensazione volumi
19. Galileo brevità enforced (<300 char) con YAML nel contesto
20. L'automa completa 50+ percorsi, tutti validati dall'adversarial
21. Test E2E: simulazione Prof.ssa Rossi su 5 esperimenti diversi

### Giorno 12-14: POLISH + DEPLOY
**Obiettivo: deliverable per demo ai committenti**

22. Report PDF ("Crea report" → messaggi + screenshot)
23. Test su viewport LIM 1024x768
24. Deploy Vercel + nanobot Render
25. L'automa ha 60+ percorsi lezione
26. Video demo 60 secondi (Andrea registra)
27. Audit finale con adversarial multi-AI

## 6. AUTOMAZIONE — CHI FA COSA

### Automa Python (24/7, loop ogni 1h)
**Settimana 1:** genera percorsi lezione usando il template + fix UX
**Settimana 2:** completa percorsi + estetica ELAB + fix residui
**Ogni ciclo:** 1 percorso lezione + 1 fix se disponibile

### Scheduled Tasks (24/7)
| Task | Focus | Output |
|------|-------|--------|
| galileo-quality | Testa brevità risposte con YAML | Score brevità, fix prompt |
| galileo-improver | Migliora prompt, genera training | Prompt migliorati, esempi training |
| e2e-tester | Testa sito + Galileo + fix CSS | Bug fixati, build verificato |
| visual-audit | Font LIM, touch, estetica ELAB | Fix CSS, aria-label |
| simulator-improver | Bug engine, esperimenti, Scratch | Bug trovati/fixati |
| adversarial | Critica tutto, valida percorsi | Task P0/P1, verdetti qualità |
| automa-doctor | Rilancia automa, pulisci queue | Sistema stabile |
| competitor-researcher | PNRR, Mistral, PhET, pricing | Finding + task azionabili |

### Sessioni interattive (Andrea + Claude)
**Giorno 1-2:** componenti React + template percorso
**Giorno 3-5:** integrazione + wiring
**Giorno 6-8:** cervello + sessioni
**Giorno 9-14:** supervisione 30min/giorno + fix complessi

## 7. GATE DI QUALITÀ

### Ogni percorso lezione deve superare:
- [ ] Vocabolario corretto per il capitolo (no termini futuri)
- [ ] Suggerimento docente concreto (non generico)
- [ ] Domanda provocatoria per la classe
- [ ] Componenti e circuito corrispondono all'esperimento reale
- [ ] Testo <100 parole per step
- [ ] La Prof.ssa Rossi capirebbe in 5 secondi

### Ogni componente React deve superare:
- [ ] Build PASSA
- [ ] Nessun errore console
- [ ] Font >=24px su LIM
- [ ] Touch >=44px
- [ ] Funziona in entrambe le modalità (UNLIM + Classic)

### Il prodotto finale deve superare:
- [ ] Prof.ssa Rossi completa 1 lezione senza aiuto esterno
- [ ] Switch UNLIM/Classic funziona senza perdere stato
- [ ] Sessione salvata e ripresa il giorno dopo
- [ ] Report PDF generato con contenuto reale
- [ ] Lighthouse >=70
- [ ] Zero errori console
- [ ] Deploy Vercel + Render funzionanti

## 8. RISCHI E MITIGAZIONI

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Automa genera percorsi mediocri | ALTA | Template perfetto giorno 1-2 + adversarial valida |
| Latenza Galileo 15s blocca UNLIM proattivo | CERTA | Pre-generazione percorsi (JSON statico) + cache |
| Deploy nanobot rompe Galileo | MEDIA | Test in staging prima di produzione |
| Componenti React hanno bug | MEDIA | Gate build + test E2E + screenshot confronto |
| 67 percorsi non completati | MEDIA | Priorità Volume 1 (38 esp.) — il punto di partenza |
| Andrea non ha tempo | BASSA (dice totale disponibilità) | Piano scalabile: giorno 1-2 è il minimo |
