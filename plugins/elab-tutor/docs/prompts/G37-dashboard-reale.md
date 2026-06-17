# G37 — DASHBOARD REALE (P1 Critical Fix)

**Sprint G** — Seconda sessione
**Deadline PNRR**: 30/06/2026 (74 giorni)
**Score attuale**: 8.4/10 | Target G37: 9.0/10

---

## CONTESTO SESSIONI PRECEDENTI

### G36 — UNLIM Brain Fix
- System prompt aggiornato con 44 azioni (era 17)
- Student memory iniettata in UNLIM overlay mode
- STT fallback message per Firefox
- Offline indicator persistente
- Score UNLIM: 6.5 -> 8.5

### Findings critici rimasti (da fixare in QUESTA sessione):
1. **Nudge tab e' FACCIATA** — i nudge non vengono mai inviati (TeacherDashboard.jsx:513-521)
2. **ZERO pagination** — 53 .map() calls, DOM esplode con 25+ studenti (TeacherDashboard.jsx)
3. **Documentazione tab fuorviante** — nessun materiale scaricabile
4. **Classi tab** — student-in-class management incompleto (righe 1652-1658)
5. **O(n^2) lookup** — users.find() dentro .map() (riga 962)

---

## FILE ESSENZIALI

| File | Perche' | Righe chiave |
|------|---------|-------------|
| `src/components/teacher/TeacherDashboard.jsx` | 2900+ righe, 11 tab, tutto qui | 513-521 (nudge), 961 (no pagination) |
| `src/services/studentService.js` | Data layer server sync | 134-163 |
| `src/services/authService.js` | Class management APIs | createClass, listClasses |
| `src/components/teacher/TeacherDashboard.module.css` | Stili dashboard | tutto |

---

## TASK

### Task 1: Quality Gate Pre-Session (10min)
Build + test baseline.

### Task 2: Pagination/Virtualizzazione Dashboard (2h)

**Il problema**: OGNI tab renderizza TUTTI gli studenti con .map(). Con 30 studenti = 30+ righe, 30 avatar, 30 plant icons, 30 mood badges. Con 100 = DOM che esplode.

**Cosa fare**:
1. Creare hook `usePagination(items, pageSize = 25)` che ritorna `{ page, totalPages, pageItems, next, prev }`
2. Applicare a: Progressi (griglia), Giardino, Attivita, Report (top experiments)
3. Aggiungere navigazione pagina (< 1/3 >) sotto ogni lista
4. Fix O(n^2): sostituire `users.find()` con `usersMap` (Map precostruita)
5. Il PNRR tab ha gia' la griglia piu' pesante — priorita' qui

**CoV**: build + test

### Task 3: Nudge Reale — Invio a Backend (1.5h)

**Il problema**: handleSendNudge (riga 513) salva solo in useState locale. Mai inviato. Mai persistito.

**Cosa fare**:
1. Creare endpoint logico: POST a `${DATA_SERVER}/api/nudge` con payload `{ teacherId, studentId, text, timestamp }`
2. Salvare nudge in localStorage come fallback se server non disponibile
3. Mostrare stato invio: "Inviato" (verde), "Salvato localmente" (arancione), "Errore" (rosso)
4. Se server non configurato, funzionare comunque in modalita' locale con toast "Nudge salvato localmente"
5. Lo studente vedra' i nudge nella StudentDashboard (futuro) — per ora almeno persistere

**CoV**: build + test

### Task 4: Tab Documentazione — Contenuto Reale (1h)

**Il problema**: Tab promette "Documentazione" ma contiene solo narrative summary.

**Cosa fare**:
1. Aggiungere sezione "Guide Rapide" con 3 card:
   - "Come iniziare una lezione" (testo in-app, non PDF)
   - "Passo Passo: montare il primo circuito"
   - "Come usare UNLIM con la classe"
2. Ogni card e' un accordion con testo semplice (max 200 parole)
3. Rimuovere la sezione filosofica (Reggio Emilia) che confonde
4. Mantenere il report settimanale esistente

**CoV**: build + test

### Task 5: Tab Classi — Fix Student Management (1h)

**Il problema**: "Mostra studenti" ammette di non funzionare (riga 1652).

**Cosa fare**:
1. Quando si espande una classe, mostrare gli studenti dal `allStudentData` filtrati per classId
2. Se `classId` non e' nel profilo studente, mostrare "Nessuno studente iscritto"
3. Rimuovere il testo "La lista studenti sara' disponibile..."
4. Bottone "Rimuovi" per studente con conferma

**CoV**: build + test

### Task 6: AUDIT FINALE (OBBLIGATORIO)
Template completo con 5 agenti + test browser.

### Task 7: Handoff + Prompt G38

---

## DELIVERABLE ATTESI G37

| # | Deliverable | Criterio |
|---|-------------|----------|
| 1 | Pagination 25 items/page | Dashboard non rallenta con 100 studenti |
| 2 | Nudge persistito | Salvato almeno in localStorage |
| 3 | Documentazione con guide | 3 guide in-app leggibili |
| 4 | Classi con student list | Studenti visibili quando espandi classe |
| 5 | Score Dashboard >= 8/10 | Da 6.5 a 8+ |
| 6 | Score composito >= 9.0 | Da 8.4 a 9.0 |
