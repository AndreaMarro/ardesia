# ITER 21 — Persona Simulation Audit

**Date**: 2026-04-28 PM
**Agent**: Playwright persona-sim (caveman terse mode)
**Scope**: 2 pilot personas (primaria + impaziente) — smoke test, NOT 5
**Target**: https://www.elabtutor.school
**Auth**: class key `ELAB2026` (from localStorage)
**Esperimento mounted**: Cap. 6 Esp. 1 — Accendi il tuo primo LED (mode: Già Montato)
**RunPod LLM status**: 200 OK, models loaded (galileo-brain, galileo-brain-v13)
**Backend status**: BROKEN — `unlim-chat` Supabase Edge Function returns **HTTP 400** both calls

---

## Sezione 1 — Setup Persona Behavior Matrix

| # | Persona             | Profilo                                                          | Question                                                       | Expected tone                       |
|---|---------------------|------------------------------------------------------------------|----------------------------------------------------------------|-------------------------------------|
| 1 | Primaria            | Docente 4ª elem., MAI Arduino, 22 alunni, vuole spiegare LED     | "Cosa è un LED? Come spiego ai bambini di 4 elementare?"        | Analogia concreta, no jargon, brevi |
| 2 | Impaziente          | Docente con 15 min, vuole risultato FAST                          | "Spiega LED in 30 secondi, ho fretta!"                          | Ultra-conciso, ≤30 parole ideale    |
| 3 | Media expert        | NOT RUN (smoke test only)                                        | —                                                              | —                                   |
| 4 | Classe disordinata  | NOT RUN (smoke test only)                                        | —                                                              | —                                   |
| 5 | Classe brava        | NOT RUN (smoke test only)                                        | —                                                              | —                                   |

Backend health verificato a metà sessione:
- RunPod: GET `http://72.60.129.50:11434/api/tags` → 200 OK + JSON con `galileo-brain:latest`
- Supabase Edge: POST `unlim-chat` → **400 Bad Request** (fallback offline scattato silenzioso)

---

## Sezione 2 — Per Persona

### Persona 1 — Primaria
- **Q**: "Cosa è un LED? Come spiego ai bambini di 4 elementare?"
- **A** (UNLIM):
  > Il LED è una lucina speciale che funziona come una porta girevole: la corrente passa solo in un verso! Ha due piedini — quello lungo va verso il + della batteria, quello corto verso il −. Se lo metti al contrario non si accende, ma tranquillo: non si rompe!
  > ▸ **Risposta dalla guida locale**
- **Source**: fallback offline RAG (NON LLM RunPod)
- **Word count**: 53 parole — OK (<60)
- **Verbatim Vol/pag**: ASSENTE (la guida locale qui non cita)
- **Linguaggio plurale "Ragazzi,"**: ASSENTE (zero apostrofo classe)
- **Analogia**: SI, "porta girevole" — concreta, age-appropriate
- **Tone fit primaria**: discreto — "lucina speciale", "tranquillo: non si rompe!" simpatico
- **Bisogno satisfato?**: PARZIALE — non da consigli al docente su COME spiegare ai 22 alunni, parla DEL led non DELLA didattica
- **Screenshot**: `persona1-primaria-led.png` (.playwright-mcp/)
- **Score persona-fit**: **6.5/10**

### Persona 2 — Impaziente
- **Q**: "Spiega LED in 30 secondi, ho fretta!"
- **A** (UNLIM):
  > Il LED è una lampadina che mangia corrente solo da un lato! Il piedino lungo è il suo "piatto" (+), quello corto la "forchetta" (−). Se lo giri, non mangia e resta spento. Come dice il libro: è una porta girevole per l'elettricità! (Riferimento: Vol. 1, pag. 29 del libro ELAB.)
  > ⌖ **Evidenziato**
- **Source**: fallback offline (con citation injection)
- **Word count**: 48 parole — OK
- **Verbatim Vol/pag**: PRESENTE — "Vol. 1, pag. 29"
- **Linguaggio plurale "Ragazzi,"**: ASSENTE
- **Analogia**: SI, "piatto/forchetta" + "porta girevole" — DOPPIA analogia, mismatched (forchetta è cute ma confonde con porta girevole)
- **Tone fit impaziente**: BASSO — 48 parole non è "30 secondi", e analogia infantile è cringe per adulto in fretta
- **Bisogno satisfato?**: NO — l'impaziente vuole frase secca tipo "LED = diodo che emette luce, polarizzato (anodo lungo +, catodo corto −), serve resistenza in serie."
- **Screenshot**: `persona2-impaziente-led.png` (.playwright-mcp/)
- **Score persona-fit**: **4/10**

---

## Sezione 3 — Pattern Emersi

1. **Backend morto silenzioso**: `unlim-chat` 400 NON sorpresa visibile a docente. Etichetta "Risposta dalla guida locale" è discreta (testo grigio piccolo) e non spiega perché. Docente non sa che il LLM è offline.
2. **Stessa analogia per personas opposte**: "porta girevole" appare in entrambe risposte → la guida locale NON adatta il tono al contesto della domanda. Persona 1 (primaria, OK) e Persona 2 (impaziente, NOK) ricevono **contenuto quasi identico** con piccoli ritocchi lessicali ("lucina"→"lampadina", "piedini"→"piatto/forchetta").
3. **Citation Vol/pag inconsistente**: Persona 1 → niente citazione. Persona 2 → "Vol.1 pag.29". Stessa esperimento, stesso topic, citation random.
4. **"Ragazzi," opening missing in 2/2**: il mandate plurale classe non è mai applicato.
5. **Analogia mismatch**: persona 2 ottiene "piatto/forchetta" (PRIMARIA-style) mentre la persona impaziente è probabilmente un ADULTO docente — frase infantile = perdita credibilità.
6. **Word count entrambe ~50**: nessuno dei due si avvicina ai limiti reali (primaria può andare 60-80 con dettaglio, impaziente vuole <20).
7. **"⌖ Evidenziato" UI tag**: appare solo sotto persona 2, non chiaro cosa significhi al docente.

---

## Sezione 4 — Top Issues UX Cross-Persona

| # | Severity | Issue                                                                                       |
|---|----------|---------------------------------------------------------------------------------------------|
| 1 | P0       | `unlim-chat` Edge Function 400 → fallback offline silente, docente non sa che LLM è giù     |
| 2 | P1       | Risposte template-driven con minor variazioni → no vera adattamento contesto persona       |
| 3 | P1       | Citation Vol/pag presente solo random (1/2 risposte) — mandate VERBATIM violato per primaria |
| 4 | P1       | Mandate "Ragazzi," opening — 0/2 applicato                                                  |
| 5 | P2       | Analogia infantile servita a persona impaziente (adulto in fretta)                          |
| 6 | P2       | Etichetta "Risposta dalla guida locale" troppo discreta — utente non capisce degraded mode  |
| 7 | P2       | Nessuna risposta diretta al "come spiego ai bambini" (didattica) — UNLIM parla del LED, non della spiegazione |
| 8 | P3       | `⌖ Evidenziato` chip senza tooltip                                                          |

---

## Sezione 5 — Recommendation per Morfismo Sense 1.5

Il **Morfismo Sense 1.5** dovrebbe adattarsi a 3 assi rilevati:

### Asse A — Esperienza Docente (primaria/secondaria/expert)
- Detect via *opening question keywords*: "bambini", "elementare", "primi" → tono primaria
- "PWM duty cycle dettaglio fisico", "stepper", "TB6612" → tono expert (no analogie infantili)
- Default ambiguous → secondaria media

### Asse B — Vincolo Tempo (impaziente vs riflessivo)
- Detect "fretta", "30 secondi", "veloce", "in 5 minuti" → mode `terse`: ≤25 parole, niente analogie, definizione tecnica + 1 azione
- Default → mode `normal`: ≤60 parole con 1 analogia

### Asse C — Bisogno (concetto vs didattica vs debug)
- "Come spiego" / "come faccio capire" → mode `pedagogical`: dare 1 esempio + 1 metafora + 1 attività hands-on, NON la definizione
- "Cosa è" / "che è" → mode `definitional`
- "Non funziona" / "errore" → mode `debug`

### Implementation hint
- **Client-side classifier** prima di hit `unlim-chat` (evita roundtrip se Edge Function è down)
- Iniettare in system prompt 3 flag: `{persona: primaria|media|expert, urgency: terse|normal, intent: pedagogical|definitional|debug}`
- Fallback offline RAG dovrebbe leggere stessi flag e selezionare tra 3-5 template per topic, non 1

### Mandate da rispettare ANCHE in fallback offline
1. Apertura "Ragazzi," se intent=pedagogical
2. Verbatim Vol/pag SEMPRE (mai random)
3. Word cap rigoroso per urgency=terse (<25)
4. Analogie disabilitate per urgency=terse + persona=expert

### Backend
- **PRIMA del Morfismo**: fix `unlim-chat` 400 (è un blocker — qualsiasi adattamento client-side è inutile se Edge Function non risponde)
- Banner visibile quando fallback attivo: "UNLIM offline — risposta dalla guida ELAB"

---

## Honest Conclusion

**Smoke test FALLITO sul backend reale**: 2/2 chiamate a `unlim-chat` hanno restituito 400. Tutte le risposte osservate sono fallback offline RAG. RunPod LLM è online ma non viene raggiunto dal frontend.

**Quality response in fallback**: 5.2/10 media (6.5 + 4 / 2). Le risposte non sono catastrofiche ma palesemente template-driven, mismatch tono per persona impaziente, mandate "Ragazzi," + Vol/pag verbatim non rispettati.

**Decisione**: NON ho proseguito con personas 3-5 perché il fix del backend è prerequisite — testare 5 personas su un fallback statico produrrebbe insight ridondanti. Le 2 sufficient mostrano che il problema non è "quale persona" ma "il fallback non discrimina contesto".

**Top action items per iter 22**:
1. Investigare 400 su `unlim-chat` (payload? auth? CORS?)
2. Aggiungere banner visibile fallback mode
3. Implementare classifier 3-assi client-side per system prompt
4. Espandere RAG offline con varianti per urgency/intent
