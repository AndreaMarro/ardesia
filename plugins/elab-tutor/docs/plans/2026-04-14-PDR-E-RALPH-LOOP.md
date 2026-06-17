# PDR Sessione 13/04/2026 + Ralph Loop Sessione 14/04

**Firmato:** Andrea Marro Claude Code Terminal — 14/04/2026

---

## PDR — Post-Development Review

### Stato REALE verificato (non stimato)

| Metrica | Valore | Verifica |
|---------|--------|----------|
| Test | 3767/3767 PASS | `npx vitest run` |
| Build | PASS 59.88s | `npm run build` |
| Deploy | AUTOMATICO via GitHub Actions | Push → 4 min → live |
| Commit sessione | 25 | `git log --since 13/04` |
| KB Edge | 94 entries (38+27+29) | `knowledge-base.json` |
| BuildSteps | **92/92 completi** | Verificato con script |
| ScratchXml | **26/92** (solo Vol3) | Vol1=0, Vol2=0, Vol3=26 |
| Bottoni funzionanti | 96/106 (91%) | Audit sistematico |
| UNLIM azioni | 17 (14 base + 3 nuove) | system-prompt.ts |
| Chat persistenza | localStorage cap 100 | useGalileoChat.js |
| Toolbar trascinabile | SÌ, drag da ovunque | FloatingToolbar.jsx |
| Repo | PUBBLICI | gh repo view |

### Cosa ho creduto sbagliato e corretto

| Credenza errata | Realtà |
|----------------|--------|
| "21/27 Vol3 senza buildSteps" | **92/92 buildSteps completi** |
| "Solo 10 esp hanno scratchXml" | Vol3 ne ha 26, Vol1-2 hanno 0. Totale 26/92 |
| "Claude Web ha implementato chat persist" | **NON l'aveva fatto** — COV ha trovato il bug |
| "Elimina toolbar non funziona" | Funziona ma serve selezionare prima — UX issue non bug |

### Bug P0 REALI (verificati)

1. **ScratchXml mancanti** — 66/92 esperimenti senza Scratch (Vol1 + Vol2)
2. **Voce non bella** — TTS browser, Kokoro non installato
3. **Dashboard docente** — shell con pochi dati reali
4. **UNLIM RAG** — dipende da GEMINI_API_KEY su Supabase Edge, non verificato live

### Bug P1 REALI

5. **Elimina toolbar** — nessun feedback se nulla è selezionato
6. **Seleziona toolbar** — setToolMode non propagato al canvas
7. **iPad drag** — componenti difficili da trascinare su touch
8. **Parità volumi** — esperimenti vs libro fisico non allineati al 100%

---

## Ralph Loop — Sessione 14/04/2026

### Obiettivi (in ordine di priorità)

1. **Kokoro TTS** — installare sul VPS, collegare a ELAB, testare italiano
2. **ScratchXml Vol1+Vol2** — generare XML per 66 esperimenti mancanti
3. **UNLIM onnisciente** — test 30 domande, fix prompt, verificare RAG live
4. **Toolbar fix** — Elimina feedback + Seleziona propagazione
5. **Dashboard docente** — grafici reali da Supabase
6. **Parità volumi** — audit visuale Vol1 Cap6-8 vs libro
7. **iPad/touch** — test + fix drag componenti
8. **Test copertura** — colmare categorie a zero

### Regole sessione

- **COV dopo ogni fix** — `npx vitest run` + build + verifica visiva
- **NO auto-score >7** — onestà massima
- **Commit atomici** — 1 fix = 1 commit, no mega-commit
- **Deploy automatico** — ogni push su main → live in 4 min
- **Comunicazione task** — 8 task programmati scrivono in `automa/state/`

---

## Prompt Ralph Loop

Incolla questo nella prossima sessione Claude Code Terminal:

```
Leggi docs/plans/2026-04-14-PDR-E-RALPH-LOOP.md per il contesto completo.

Sei nella sessione Ralph Loop per ELAB Tutor. Obiettivi:

CICLO 1: Kokoro TTS sul VPS 72.60.129.50
- SSH al VPS, installa Docker se non c'è
- docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest
- Testa: curl http://72.60.129.50:8880/v1/audio/speech -d '{"input":"Ciao sono UNLIM","voice":"if_sara","model":"kokoro"}'
- Se funziona, aggiorna src/services/voiceService.js per usare Kokoro
- Test TTS end-to-end dal browser

CICLO 2: ScratchXml Vol1+Vol2 (66 esperimenti)
- Leggi src/data/experiments-vol3.js per capire il formato scratchXml
- Genera XML per Vol1 (38 esp) e Vol2 (27 esp) basandoti su componenti e steps
- Ogni XML deve compilare in codice Arduino valido
- Test: scratchGenerator genera codice corretto per ogni XML

CICLO 3: UNLIM onnisciente
- Test 30 domande diverse (facili/medie/difficili) via sendChat
- Verifica che le risposte siano <60 parole + analogia
- Verifica che i tag [AZIONE:] siano emessi correttamente
- Fix prompt se hallucination o risposte lunghe

CICLO 4: Toolbar fix
- Elimina: aggiungi toast "Seleziona un componente prima" se nulla selezionato
- Seleziona: verifica che setToolMode propaghi al canvas SVG
- Wire: verifica che il wiring mode funzioni end-to-end
- Test ogni bottone della toolbar

CICLO 5: Dashboard docente
- Verifica connessione Supabase live
- Aggiungi almeno 1 grafico reale (progressi studenti)
- Export CSV funzionante
- Test con dati reali

CICLO 6: Parità volumi
- Confronta Vol1 Cap6 esperimenti 1-5 con il libro fisico
- Verifica: componenti corretti? Passi corretti? Descrizioni accurate?
- Fix discrepanze trovate

CICLO 7: iPad/touch
- Test su viewport 768x1024
- Fix drag componenti (touch target, pointer events)
- Verifica toolbar su touch

CICLO 8: Test copertura
- Aggiungi test per le categorie a zero trovate nell'audit
- Target: almeno 10 test per ogni categoria scoperta
- Full suite deve passare

REGOLE:
- Dopo OGNI ciclo: npx vitest run + npm run build
- Se un test fallisce, fix PRIMA di procedere
- Commit atomici dopo ogni ciclo
- Scrivi stato in automa/state/ralph-loop-progress.json
- Leggi automa/state/ per output dei task programmati
- Score onesto alla fine di ogni ciclo
```

---

## 8 Task Programmati — Comunicazione via automa/state/

Tutti i task scrivono il loro output in `automa/state/` come file JSON.
Il Ralph Loop legge questi file per prendere decisioni.
I task leggono `automa/state/ralph-loop-progress.json` per sapere cosa sta facendo il loop.

### Task 1 — Sentinella Build (:07 ogni ora)
Ogni ora: pull, test, build. Se qualcosa si rompe, scrive ALERT.

### Task 2 — Auditor UNLIM (:17 ogni ora)
Testa 5 domande random a UNLIM, verifica qualità risposte.

### Task 3 — Critic Codice (:27 ogni ora)
Cerca pattern pericolosi, credenziali, TODO dimenticati.

### Task 4 — ScratchXml Generator (:37 ogni ora)
Genera scratchXml per 8 esperimenti alla volta (Vol1 prima, poi Vol2).

### Task 5 — Parità Volumi (:47 ogni ora)
Confronta 3 esperimenti alla volta con i dati del libro.

### Task 6 — Touch Tester (:52 ogni ora)
Verifica touch targets <44px, bottoni senza aria-label.

### Task 7 — Kokoro Monitor (:57 ogni ora)
Pinga il VPS Kokoro, testa una frase italiana, misura latenza.

### Task 8 — Sincronizzatore (:02 ogni ora)
Legge tutti i file state/, crea un summary, scrive ralph-sync.json.
