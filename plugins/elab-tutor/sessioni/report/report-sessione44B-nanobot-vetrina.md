# Report Sessione 44B — Nanobot Deploy + Chat Widget + Vetrina Landing
## 25/02/2026 — ONESTO

---

## EXECUTIVE SUMMARY

Sessione focalizzata sull'ecosistema **pubblico**: sito Netlify, chat-widget AI, nanobot su Render, vetrina landing page. Nessuna modifica al codice ELAB Tutor (Vercel).

**Score sessione: 7/10** — Buon progresso su frontend pubblico, ma nanobot ancora instabile (provider errors) e vetrina non verificata visivamente.

---

## COSA HO FATTO

### 1. Chat Widget — Integrazione Completa (COMPLETATO)
- Aggiunto `chat-widget.js` alle 4 pagine mancanti:
  - `scuole.html` (prima di `</body>`)
  - `kit/volume-1.html` (`../js/chat-widget.js`)
  - `kit/volume-2.html` (`../js/chat-widget.js`)
  - `kit/volume-3.html` (`../js/chat-widget.js`)
- **Icona ELAB Logo**: sostituito SVG robot generico con `<img>` del PNG ELAB reale
  - `ELAB_LOGO = 'https://static.wixstatic.com/media/d45b20_8c7ea37b751a4cf1a37d37881fb49aa4~mv2.png'`
  - Toggle 34px, header 28px, borderRadius 6px, drop-shadow
- **File**: `/PRODOTTO/newcartella/js/chat-widget.js`
- **Deployment**: Netlify prod OK

### 2. Nanobot — Deploy su Render (PARZIALE)
- Repository GitHub `AndreaMarro/elab-galileo-nanobot` creato e pushato
- Endpoint `/site-chat` aggiunto a `server.py` (dedicato al sito pubblico, usa `site-prompt.yml`)
- **Bug trovati e fixati**:
  - `race_providers()` ritorna 3 valori `(response, winner, elapsed_ms)` — il codice ne spacchettava solo 2 → `ValueError: too many values to unpack`
  - Gemini model name `flash-2.5` non esiste → `404 Not Found` — corretto a `gemini-2.0-flash` (richiede fix env var su Render)
  - Fallback provider mancante: solo "fast" providers (groq/google) tentati, DeepSeek escluso → aggiunto two-tier fallback
- **CORS**: aggiunto `https://funny-pika-3d1029.netlify.app` a `render.yaml` CORS_ORIGINS
- **Stato attuale**: Render deploy avviato ma provider AI instabili. Utente deve:
  1. Cambiare env var `AI_MODEL2` da `flash-2.5` a `gemini-2.0-flash`
  2. Verificare che almeno DeepSeek risponda

### 3. site-prompt.yml — Knowledge Base Completa (COMPLETATO)
- Riscritto completamente a v2.0.0 con:
  - Filosofia e missione ELAB completa
  - Contenuti kit dettagliati (ogni componente per Vol1 e Vol2)
  - **Prezzi**: Vol 1 = 55 EUR, Vol 2 = 75 EUR, Vol 3 = TBD (IVA inclusa)
  - Programma scuole dettagliato: problema, soluzione, percorso triennale, allineamento STEM, sicurezza, struttura lezione (60 min breakdown), processo adozione 4 step, supporto fondi (PON/PNRR/STEM)
  - FAQ estese con pricing e risposte scuola-specifiche
  - Contatti: elab.vendite@gmail.com, info@elab.education, 346 80 93 661
  - Regola confidenzialita invariata

### 4. Vetrina Landing Page (COMPLETATO — NON VERIFICATO VISIVAMENTE)
- Creato `vetrina.html` — 866 righe, ~41KB, self-contained
- Struttura AIDA:
  1. **Hero**: mockup simulatore CSS (breadboard + AI chat panel + lente zoom quiz) + stats (69/138/21/AI)
  2. **Empatia insegnante**: foto Unsplash + domanda retorica + risposta apprendimento orizzontale
  3. **Galileo Demo**: chat completa pianeti/gravita, non tagliata
  4. **Benefici**: 3 card (Studente/Insegnante/Scuola)
  5. **Features Navy**: 6 item (simulazione, AI, quiz, Arduino, 3 modalita, sicurezza)
  6. **Quote + CTA**: Benjamin Franklin + link scuole.html + footer contatti
- Include: chat-widget.js, watermark, responsive (900px/600px), scroll animations IntersectionObserver
- **Deploy Netlify**: OK, live su `/vetrina.html`
- **ONESTA**: NON ho verificato la pagina nel browser. Potrebbe avere problemi di layout, immagini rotte, o copy da rivedere.

---

## COSA NON FUNZIONA (MASSIMA ONESTA)

### Problemi REALI

1. **Nanobot instabile** — Provider AI su Render non verificati end-to-end. DeepSeek potrebbe non rispondere (API key?), Gemini ha model name sbagliato nell'env var. La chat sul sito potrebbe non funzionare.

2. **Vetrina non testata** — Il file e stato scritto senza verifica visiva. Mockup simulatore e puro CSS, potrebbe non renderizzare bene su tutti i browser. Immagine Unsplash potrebbe non caricarsi. Layout non testato su mobile.

3. **Chat-widget PAGE_SUGGESTIONS incompleto** — `chat-widget.js` ha 13 contesti pagina ma manca "vetrina". La chat sulla vetrina non sa di essere sulla vetrina.

4. **Foto insegnante Unsplash** — Foto stock generica, non un vero insegnante ELAB. Andrebbe sostituita con foto reale.

5. **CORS non testato** — L'aggiunta del dominio Netlify al CORS e in `render.yaml`, ma il deploy su Render potrebbe non aver preso l'env var aggiornata.

---

## SCORE CARD POST-SESSIONE 44B

| Area | Score | Cambio | Note |
|------|-------|--------|------|
| Sito Pubblico | **8.8/10** | +0.3 | Chat widget su tutte le pagine, vetrina landing creata |
| Chat Widget | **8.0/10** | NEW | Logo ELAB, DOM-based, branding navy. -2: PAGE_SUGGESTIONS incompleto, nanobot instabile |
| Vetrina Landing | **7.0/10** | NEW | Design AIDA completo. -3: non verificato visivamente, foto stock |
| Nanobot Backend | **5.0/10** | NEW | Codice OK, deploy avviato. -5: provider instabili, non testato E2E |
| Knowledge Base Sito | **9.0/10** | NEW | site-prompt.yml v2 completo, prezzi, filosofia, programma scuole |
| **Tutor (invariato)** | **~8.0/10** | = | Nessuna modifica questa sessione |

---

## FILE MODIFICATI

| File | Azione | Dettaglio |
|------|--------|----------|
| `newcartella/js/chat-widget.js` | EDIT | Logo ELAB PNG al posto di robot SVG |
| `newcartella/scuole.html` | EDIT | Aggiunto script chat-widget.js |
| `newcartella/kit/volume-1.html` | EDIT | Aggiunto script chat-widget.js |
| `newcartella/kit/volume-2.html` | EDIT | Aggiunto script chat-widget.js |
| `newcartella/kit/volume-3.html` | EDIT | Aggiunto script chat-widget.js |
| `newcartella/vetrina.html` | NEW | Landing page AIDA 866 righe |
| `elab-builder/nanobot/server.py` | EDIT | /site-chat endpoint, tuple fix, fallback |
| `elab-builder/nanobot/site-prompt.yml` | NEW/REWRITE | Knowledge base v2.0.0 completa |
| `elab-builder/nanobot/render.yaml` | EDIT | CORS origin Netlify |

---

## AZIONI RICHIESTE ALL'UTENTE

1. **Render Dashboard**: cambiare `AI_MODEL2` da `flash-2.5` a `gemini-2.0-flash`
2. **Render Dashboard**: verificare che DeepSeek API key sia configurata
3. **Aprire** https://funny-pika-3d1029.netlify.app/vetrina.html e verificare visivamente
4. **Testare** chat widget su una pagina qualsiasi del sito

---

## TEMPO IMPIEGATO
- Chat widget (4 pagine + logo): ~20 min
- Nanobot debug (tuple + model + fallback): ~40 min
- site-prompt.yml rewrite: ~30 min
- Vetrina landing page: ~45 min
- Deploy + test: ~15 min
- Report: ~20 min

**Totale: ~2.5 ore**

---

*Report onesto — Andrea Marro, 25/02/2026*
*"Il codice non testato e codice che non funziona finche non si dimostra il contrario."*
