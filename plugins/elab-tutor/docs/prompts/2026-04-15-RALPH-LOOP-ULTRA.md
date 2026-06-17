# RALPH LOOP ULTRA — Prompt Sessione 15/04/2026

## ISTRUZIONI PER CLAUDE CODE TERMINAL

Leggi PRIMA di tutto:
- `docs/plans/2026-04-15-PDR-v2-ULTRA.md` — documento master con stato reale e obiettivi
- `docs/plans/2026-04-14-PDR-GIGANTE-MASTER.md` — storia e decisioni precedenti
- `VOLUME 3/TEA/` — 4 documenti di Tea (analisi complessità, correzioni, UX, 10 idee)
- `VOLUME 3/CONTENUTI/volumi-pdf/` — 3 volumi PDF ELAB (fonte verità per parallelismo)

## BASELINE DA NON ROMPERE MAI

```
Test: 8190 PASS (npx vitest run)
Build: PASS (npm run build) — ~3017 KB
Sito: elabtutor.school 200 OK
Deploy: automatico GitHub Actions → Vercel
```

### REGOLE ANTI-REGRESSIONE (FERREE)
1. PRIMA di toccare qualsiasi file: `npx vitest run` e salvare il numero
2. DOPO ogni modifica: `npx vitest run` — se il numero SCENDE → REVERT IMMEDIATO
3. MAI fare `git add -A` senza controllare `git diff` prima
4. MAI modificare file in `src/components/simulator/engine/` senza 3 test che passano prima e dopo
5. MAI cancellare test esistenti
6. Se un test fallisce DOPO una modifica → il problema è la modifica, non il test
7. Ogni commit DEVE avere: "Test: NNNN/NNNN PASS" nel messaggio
8. Se build fallisce → revert TUTTO e investigare
9. Snapshot baseline ogni 2 cicli: `git tag baseline-HHMM`
10. Se qualcosa si rompe e non capisci perché: `git stash && npx vitest run` — se passa, il problema è nel tuo codice

---

## PRIORITÀ ASSOLUTE (ORDINATE)

### 1. PARALLELISMO VOLUMI ↔ CODICE (la cosa PIÙ IMPORTANTE)

**Il libro fisico è la fonte di verità. Il simulatore deve RIFLETTERE il libro.**

I volumi PDF sono in: `/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/`
Testo estratto in: `/tmp/vol1.txt`, `/tmp/vol2.txt`, `/tmp/vol3.txt`
Se non esistono, estraili: `pdftotext "percorso/volume.pdf" /tmp/volN.txt`

Per OGNI esperimento (tutti 92):
1. Trova la pagina esatta nel volume PDF
2. Estrai il testo introduttivo, le istruzioni, la conclusione
3. Crea `src/data/volume-references.js` con mapping completo
4. Integra nei buildSteps: ogni step cita "📖 Vol. N, pag. X"
5. Integra nell'EmbeddedGuide (GalileoAdapter.jsx): sezione "Cosa dice il libro"
6. Integra in UNLIM: quando risponde, cita il libro

**Il raggruppamento NON è solo nell'ExperimentPicker.**
Nel Passo Passo, nella guida, nel testo visibile — tutto deve riflettere che gli esperimenti sono parti di UN RACCONTO CONTINUO per capitolo, come nel libro fisico.

Esempio dal libro Vol 1, Cap 6:
- p.29: "ESPERIMENTO 1 — Per accendere il LED e fare il nostro primo esperimento..."
- p.32: "ESPERIMENTO 2 — Il nostro circuito include un resistore, ma perché?"
- p.33: "ESPERIMENTO 3 — Per rendere il led più luminoso ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm."

Il simulatore deve mostrare questo CONTESTO NARRATIVO, non solo il circuito.

### 2. UNLIM DAVVERO ONNISCIENTE E ONNIPOTENTE

UNLIM deve:
- **Conoscere il libro**: quando lo studente chiede "perché serve il resistore?", UNLIM risponde CITANDO il libro: "Come spiega il Volume 1 a pagina 32, il resistore serve a limitare la corrente..."
- **Vedere il circuito**: il trigger "guarda il mio circuito" deve FUNZIONARE end-to-end (verifica con test)
- **Incrociare tutto**: contesto circuito + RAG libro + storia studente + vision → risposta ottimale
- **Eseguire comandi complessi**: "costruisci un semaforo" → 7+ azioni in sequenza
- **Rispondere in <60 parole** (regola assoluta, test con 50 formulazioni)

Cose da verificare/fixare:
- Il Nanobot/Gemini USA davvero i campi `simulatorContext`, `circuitState`, `experimentContext`? O li ignora?
- Il RAG viene iniettato nel prompt come contesto? Verificare in `api.js` funzione `sendChat()`
- Le azioni [AZIONE:...] funzionano TUTTE? Testare ognuna delle 22

### 3. VOCE NON INVASIVA

L'interazione vocale deve essere:
- **Discreta**: nessun popup, overlay o bottone gigante
- **Opt-in**: toggle discreto per attivare/disattivare
- **Interrompibile**: TTS si ferma se lo studente clicca o parla
- **Naturale**: "Ehi UNLIM, cosa fa il resistore?" → comprende e risponde a voce

Verificare:
- Wake word "Ehi UNLIM" funziona? (src/services/wakeWord.js)
- STT → comprensione → risposta testato?
- TTS in produzione (NON solo localhost) funziona?
- 36 comandi vocali funzionano tutti?

### 4. TEST REALI — Target 12.000

Non test triviali. Test che testano COMPORTAMENTO REALE:
- Simulazione di 10 tipologie utente con interazioni reali
- Ogni esperimento: componenti corretti? Connessioni valide? BuildSteps completi?
- UNLIM: per ogni formulazione, risposta pertinente?
- Voice: per ogni comando, azione corretta?
- Volume parallelism: per ogni esperimento, pagina corretta?

### 5. PACCHETTI VENDITA

Il Researcher worker deve produrre:
- **ELAB Classe**: €20/classe/mese — kit + simulatore + UNLIM + dashboard
- **ELAB Famiglia**: €9.99/mese — simulatore + UNLIM per casa
- **ELAB Scuola**: €500/anno illimitato — tutte le classi
- Confronto con competitor (CampuStore €350/kit, Tinkercad gratis, Arduino Education €300)
- Specifiche MePA per Davide

---

## 10 WORKER PARALLELI — Prompt per `cron`

### Worker 1 — SENTINELLA BUILD (:05 di ogni ora)
```
cd "VOLUME 3/PRODOTTO/elab-builder"
git pull origin main 2>/dev/null
npx vitest run 2>&1 | tail -5 > automa/state/w1-build.json
npm run build 2>&1 | tail -3 >> automa/state/w1-build.json
curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school >> automa/state/w1-build.json
```
Se test falliscono: NON committare, scrivere alert.

### Worker 2 — TEST FACTORY (:10)
Genera 100 nuovi test. Rotazione:
- :10 → componenti JSX + data integrity
- Ora dopo → UNLIM + voice + RAG
- Ora dopo → volume-references + lesson-groups + edge cases
- Ora dopo → simulazione utenti + CircuitSolver

### Audit 1 — VOLUME PARALLELISM (:15)
Per 10 esperimenti a rotazione:
1. Leggi testo volume PDF (pdftotext)
2. Confronta con dati in experiments-volN.js
3. Verifica: pagina, componenti, ordine passi, testo
4. Scrivi discrepanze in `a1-volumes.json`

### Audit 2 — UNLIM QUALITY (:20)
Simula 20 domande (4 per tipologia utente):
1. Bambino 8: "il led non va"
2. Bambina 10: "perché serve la resistenza?"
3. Ragazzo 14: "compila"
4. Docente: "quale esperimento per iniziare?"
5. Emotivo: "non capisco niente!"
Per ogni domanda: KB trova risposta? RAG trova chunk? Risposta <60 parole?

### Researcher — PACCHETTI VENDITA (:25)
- Ricerca pricing competitor STEM K-12
- Calcola margini su diversi packaging
- Produce draft landing page /prezzi
- Ricerca requisiti MePA

### Tester — SIMULATORE UTENTI (:30)
10 tipologie × 5 interazioni = 50 scenari.
Per ogni scenario:
1. Lo studente dice X
2. UNLIM risponde Y
3. L'azione viene eseguita? Sì/No
4. La risposta è pertinente? Score 1-5
5. Il tempo di risposta è accettabile? <3s

### Debugger 1 — UI/UX (:35)
Scan ogni file JSX:
- Ogni button ha onClick?
- Ogni input ha onChange?
- Touch target ≥ 44px?
- Font size ≥ 13px?
- Contrasto WCAG AA?
- aria-label presente?

### Debugger 2 — API/Backend (:40)
Test ogni endpoint:
- Nanobot: `curl -X POST https://elab-galileo.onrender.com/tutor-chat`
- Supabase: `curl https://vxvqalmxqtezvgiboxyv.supabase.co/rest/v1/`
- TTS Kokoro: `curl http://localhost:8881/health`
- TTS Edge: `curl http://72.60.129.50:8880/health`
- Compilatore: `curl https://n8n.srv1022317.hstgr.cloud/compile`

### Debugger 3 — CIRCUITSOLVER (:45)
Edge cases:
- Cortocircuito (batteria diretta)
- Circuito aperto (componente scollegato)
- LED al contrario
- Resistore valore 0
- Condensatore in serie con LED
- MOSFET senza Gate

### Sincronizzatore (:50)
Legge TUTTI i `automa/state/w*.json`, `a*.json`, `r*.json`, `t*.json`, `d*.json`.
Produce `automa/state/ralph-sync.json`:
```json
{
  "timestamp": "...",
  "testCount": 8190,
  "buildStatus": "PASS",
  "siteStatus": 200,
  "volumeParallelism": "12/92 completati",
  "unlimQuality": "18/20 risposte pertinenti",
  "blockers": ["Kokoro TTS non raggiungibile in prod"],
  "recommendations": ["Prioritizzare parallelismo Vol1 Cap 6-8"],
  "scoreEstimate": 8.2
}
```
Commit + push per comunicazione con sessioni Web.

---

## COMUNICAZIONE TRA SESSIONI

```
RALPH LOOP (Terminal)
  ↓ scrive: ralph-loop-progress.json
  ↓ legge: ralph-sync.json
  
10 WORKER (ogni ora)
  ↓ scrivono: w1..w2, a1..a2, r1, t1, d1..d3
  ↓ Sincronizzatore legge tutto → ralph-sync.json
  
SESSIONI WEB (se avviate)
  ↓ leggono: GitHub (ralph-sync.json)
  ↓ scrivono: branch proposal/*
  ↓ Terminal mergia
```

---

## MASSIMA ONESTÀ — Checklist

Prima di dichiarare un ciclo completo, verifica:
- [ ] Test count è UGUALE O SUPERIORE a prima?
- [ ] Build passa?
- [ ] Il sito risponde 200?
- [ ] Hai VERIFICATO manualmente che la feature funziona?
- [ ] Il codice che hai scritto è TESTATO?
- [ ] Score non inflazionato?

Se rispondi "no" a qualsiasi domanda: il ciclo NON è completo.

---

*Prompt generato da Claude Code — 15/04/2026*
*Per sessione terminale: incolla questo prompt e avvia Ralph Loop*
*Per worker: configura come cron o usa /ralph-loop*
