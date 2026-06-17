# G41 — DASHBOARD PAGINATION + NUDGE REALI + WELCOME EXPANSION

**Sprint H** — Prima sessione
**Deadline PNRR**: 30/06/2026 (52 giorni)
**Score attuale**: 9.0/10 | Target G41: 9.2/10

---

## CONTESTO

### G40 — Voice Control + Resilienza Offline (completata)
- 11 voice shortcut commands (<50ms vs 2-5s AI)
- Auto-TTS toggle (default OFF, 🔊/🔇 in input bar)
- Compiler retry con backoff (1 retry dopo 3s)
- Offline placeholder guidance in input bar
- STT/TTS feedback loop fix
- Safety timer leak fix in useTTS
- Score: 9.0/10

### Sprint G completato (G31-G40)
- Da 6.2/10 (G20 audit) a 9.0/10 in 10 sessioni
- 970/970 test, build stabile

### Questa sessione: Fix P1 aperti da G37 + content expansion
I due P1 più vecchi (nudge + pagination) sono aperti da 4 sessioni. DEVONO essere chiusi.

---

## FILE ESSENZIALI

| File | Perché |
|------|--------|
| `src/components/teacher/TeacherDashboard.jsx` | Dashboard docente — pagination + nudge |
| `src/services/api.js` | Webhook per nudge tab |
| `src/data/welcome-messages.js` | 10/70 esperimenti coperti |
| `src/data/lesson-paths.js` | 62 lesson paths reference |
| `automa/handoff.md` | Stato completo post-G40 |

---

## TASK

### Task 1: Quality Gate Pre-Session

### Task 2: Dashboard Pagination (1h)

**Il problema**: Nessuna pagination — con 25+ studenti il DOM esplode, scroll infinito, performance crolla.

**Cosa fare**:
1. In TeacherDashboard, aggiungere pagination client-side
2. 10 studenti per pagina (configurabile)
3. Controlli Prev/Next + indicatore "Pagina X di Y"
4. Mantenere filtri/sort esistenti
5. Se <10 studenti → nascondere pagination

### Task 3: Nudge Tab Reali (1.5h)

**Il problema**: I nudge tab NON vengono mai inviati. Il codice sembra esserci ma è facciata.

**Cosa fare**:
1. Verificare il flusso completo: cosa succede quando il docente preme "Incoraggia" nella dashboard
2. Implementare il vero invio del nudge come overlay UNLIM sullo schermo dello studente
3. Il nudge deve apparire come messaggio contestuale della mascotte (usa `showMessage`)
4. Se lo studente non è online → salvare nudge in localStorage e mostrarlo al prossimo login
5. Nudge types: incoraggiamento, promemoria, suggerimento
6. Rate limit: max 1 nudge per studente ogni 5 minuti

### Task 4: Welcome Messages Expansion (45min)

**Cosa fare**:
1. Espandere welcome-messages.js da 10 a 40+ esperimenti (priorità: Volume 1 completo)
2. Ogni messaggio max 15 parole, specifico per l'esperimento
3. Usare le fasi "Prepara" dei lesson path come ispirazione
4. Coprire almeno tutti i 38 esperimenti del Volume 1

### Task 5: sitemap.xml (15min)

**Cosa fare**:
1. Creare public/sitemap.xml con le route principali
2. Aggiornare robots.txt per puntare al sitemap
3. Route da includere: /, /scuole, #teacher (se indicizzabile)

### Task 6: AUDIT FINALE
### Task 7: Handoff + Prompt G42

---

## DELIVERABLE ATTESI G41

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Pagination dashboard | 10 studenti/pagina, Prev/Next, nascosta se <10 |
| 2 | Nudge reali | Click "Incoraggia" → overlay sullo studente |
| 3 | Welcome expansion | 40+ esperimenti coperti (era 10) |
| 4 | sitemap.xml | Presente e referenziato in robots.txt |
| 5 | Score >= 9.2 | P1 chiusi, content espanso |
