# HANDOFF SESSIONE 27/03/2026
> Questa sessione è durata ~12 ore. Da copiare nel prompt della prossima sessione.

---

## COSA È STATO FATTO (con evidenza verificata)

### Fase 0: Fix UX bloccanti — COMPLETATA
L'automa ha completato 5/5 fix autonomamente (23 cicli, 18 done/keep):
- ✅ Homepage: redirect Netlify eliminato → VetrinaSimulatore diretto (ShowcasePage.jsx)
- ✅ Menu: Dev/Dashboard/Admin nascosti per utenti normali (App.jsx: isDocente/isAdmin)
- ✅ Chat: minimizzata per default, "Sono qui" → "Online" (ChatOverlay.jsx: useState(true))
- ✅ Toggle Guida: eliminato — isSocraticMode = true const (ElabTutorV4.jsx)
- ✅ Google Fonts: CDN rimosso → self-hosted (index.css → fonts.css)

### Lavoro automa extra (oltre Fase 0)
- Landing PNRR creata (LandingPNRR.jsx + routing in App.jsx)
- Galileo brevità: max 3 frasi, 60 parole, esempio quotidiano + domanda classe (tutor.yml)
- Mistral GDPR integrato nel nanobot (server.py: EU_PROVIDERS, GDPR_EU_ONLY, /gdpr-status)
- God component splittato: NewElabSimulator sotto 2000 LOC (4 hooks estratti)
- Welcome card onboarding nel placeholder simulatore
- GDPR pseudonymize SHA-256 (gdprService.js)
- Densità cognitiva ridotta (ControlBar progressive disclosure)
- Fix routing deep link (App.jsx)

### Documenti creati
- `automa/MASTER-PLAN.md` — piano 2 settimane, Fasi 0-4, assegnazioni, gate
- `automa/context/PRODUCT-VISION.md` — bussola definitiva con stato verificato
- `automa/context/UNLIM-BRAIN-DESIGN.md` — cervello pedagogico, 3 pezzi, sequenza
- `automa/CONTEXT-PROTOCOL.md` — protocollo 11 passi per tutti gli agenti
- `docs/plans/2026-03-27-unlim-brain-design.md` — design doc approvato
- `automa/knowledge/competitor-lesson-structures.md` — 197 righe PhET/Tinkercad/Arduino
- `automa/knowledge/gemini-lesson-template-v1-cap6-esp1.json` — template percorso lezione

### Infrastruttura fixata
- PATH npm/node in orchestrator/evaluate/checks (causa root composite=0.45)
- Claude path assoluto nell'adversarial (causa root "not found")
- Watchdog threshold 3h→30min
- Python 3.9 compat (dict|None rimosso)
- Gemini CLI integrato (OAuth ermagician@gmail.com, gemini-2.5-flash)
- call_gemini_cli() come fallback
- Kimi: ultime 3 lessons nel prompt (non più generico)
- Queue pulita: 13 stuck → 0 active
- claude-mem plugin attivo (worker v10.3.1)
- Bun installato per claude-mem

### Audit fisico del prodotto (Claude Preview)
- Simulatore: LED si accende ✅, Passo Passo funziona ✅, clearAll API funziona ✅
- Galileo: 3/5 action tags corretti ✅, identity zero leaks ✅, latenza 15s ❌, risposte 534 char ❌
- Brain V13: 4/5 routing corretto ✅, bug "metti LED"→play (dovrebbe essere addcomponent) ❌
- 20 metodi API __ELAB_API verificati ✅

---

## STATO VERIFICATO ALLE 11:32 DEL 27/03/2026

| Elemento | Stato | Evidenza |
|----------|-------|----------|
| Build | ✅ PASSA (25s) | npm run build exit 0 |
| Git | ✅ Pushato, 16 commit oggi | git log |
| Sito | ✅ HTTP 200 (0.11s) | curl |
| Nanobot | ✅ ok v5.5.0 | curl health |
| Brain V13 | ✅ 2 modelli | curl /api/tags |
| Claude-mem | ✅ ok v10.3.1 | curl :37777/api/health |
| Score | ✅ 0.946 | last-eval.json |
| Automa | ❌ MORTO (heartbeat 09:48) | watchdog rilancerà |
| Queue | 41 pending, 1 active, 124 done, 6 failed | ls queue/ |
| Deploy Vercel | ✅ Aggiornato | curl 200 |

---

## COSA NON FUNZIONA

1. **6/7 scheduled tasks non producono output** — limite strutturale: richiedono Claude Desktop attivo
2. **Automa muore spesso** — watchdog rilancia dopo 30min ma la causa root non è diagnosticata
3. **Gemini CLI: rate limit** — 429 frequente, soprattutto di notte
4. **Latenza Galileo 15s** — inaccettabile per classe. Mistral integrato nel nanobot ma non ancora deployato
5. **Zero componenti UNLIM Mode scritti** — tutto il lavoro è stato fondamenta + fix
6. **Zero percorsi lezione generati** — il template esiste ma l'automa non li ha prodotti
7. **Nanobot non deployato su Render** — le modifiche Mistral/Galileo brevità sono solo nel repo

---

## COSA FARE NELLA PROSSIMA SESSIONE (Giorno 1-2 del piano)

### Priorità 1: Template percorso lezione PERFETTO
- Prendere il template Gemini (`automa/knowledge/gemini-lesson-template-v1-cap6-esp1.json`)
- Perfezionarlo manualmente per v1-cap6-esp1 (il LED)
- Validarlo: vocabolario corretto, suggerimento docente concreto, domanda provocatoria
- Questo diventa il modello per l'automa per generare gli altri 66

### Priorità 2: Scheletro componenti React UNLIM Mode
- `UnlimWrapper.jsx` — wrapper che nasconde/mostra UI classica
- `UnlimMascot.jsx` — mascotte ELAB nell'angolo
- `UnlimOverlay.jsx` — messaggi contestuali che sfumano
- `UnlimInputBar.jsx` — barra input testo + mic
- `UnlimModeSwitch.jsx` — bottone switch UNLIM/Classic
- Integrazione in ElabTutorV4.jsx

### Priorità 3: Deploy nanobot su Render
- Le modifiche Mistral + Galileo brevità + /gdpr-status sono nel repo
- Serve deploy su Render per metterle in produzione
- Verificare che nessuna feature si rompe

### Priorità 4: L'automa genera percorsi lezione
- Dare all'automa il task "genera percorsi lezione usando il template"
- Target: 10 percorsi Volume 1 nel primo giorno
- L'adversarial li valida

---

## DECISIONI DI ANDREA DA RICORDARE

1. **UNLIM è il prodotto, non un chatbot** — mascotte nell'angolo, messaggi overlay, barra input
2. **Due modalità**: UNLIM (default, minimale) + Classic (pulita, per esperti) + switch
3. **Le funzionalità restano circa le stesse** — cambia la fruizione e l'estetica
4. **Le lezioni devono essere preparate da UNLIM** — fondate sui volumi, sul contesto classe
5. **La struttura lezione è variabile** — si adatta a cosa succede
6. **Si scrive ovunque** — breadboard, schermo, tutto è annotabile
7. **Sessioni salvate** — UNLIM ricorda tutto, contesto ricostruito al rientro
8. **Report PDF** — "Crea il report" → PDF con messaggi + screenshot
9. **Ogni messaggio salvato** — alla fine PDF disponibile con resoconto
10. **Il prodotto non è un clone ChatGPT** — linguaggio 10-14 anni, esempi quotidiani
11. **GDPR: Mistral (EU) + Brain locale** — mai dati minori su server USA
12. **Budget: kit €75 + licenza €500-1000/anno** — target TUTTE le scuole italiane
