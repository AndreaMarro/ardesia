# Sprint F — Piano G31-G35

**Data**: 30/03/2026
**Autore**: Claude (dopo audit con 5 agenti CoV + giudizio personale)
**Deadline**: PNRR 30/06/2026 (3 mesi)
**Vincolo**: Andrea è l'UNICO sviluppatore

---

## Premessa Brutalmente Onesta

Il prodotto è **solido come simulatore** (8/10) ma **non pronto per vendita PA**.

I 5 agenti CoV hanno trovato:
- **8 issue CRITICAL** di GDPR/security (3 fixati, 5 richiedono backend)
- **0 vulnerabilità XSS** (difesa a 3 livelli verificata)
- **3 dead code** function rimosse (67 righe)
- **940 test** sono reali ma tutti unit test — ZERO test E2E
- Simulatore e UNLIM sono robusti dal punto di vista codice

Il collo di bottiglia NON è il frontend. È l'**assenza di un backend server** che rende impossibile:
1. Aggregare dati studenti da dispositivi diversi
2. Cifrare dati in transito e a riposo
3. Rate limit server-side
4. Autenticazione webhook GDPR
5. Data retention enforcement

**Senza backend, la Teacher Dashboard è un prototipo client-only.**

---

## G31 — Backend Server MVP (Priorità: P0)

**Obiettivo**: Server Node.js/Express minimale che sblocca la Teacher Dashboard.

### Task
1. **Setup server Express** su Render/Railway (gratuito tier)
   - POST `/api/sync` — riceve dati da studentService.flushSync()
   - GET `/api/class/:classId/students` — ritorna dati aggregati
   - Auth: Bearer token da authService

2. **Migrare studentService.flushSync()** da webhook n8n a endpoint server
   - Mantenere localStorage come cache locale
   - Sync al server quando online

3. **Teacher Dashboard: fetch da server** invece di solo localStorage
   - Fallback a localStorage se server offline (già implementato)

4. **HTTPS enforcement** — validare URLs nelle env vars

### Risultato atteso
- Docente vede dati di TUTTI gli studenti (non solo quelli locali)
- Score Teacher Dashboard: 7.5/10 → 9/10

### Stima: 15-20h

---

## G32 — GDPR Compliance Layer (Priorità: P0)

**Obiettivo**: Chiudere i gap GDPR che richiedono backend.

### Task
1. **Cifrare dati in localStorage** (AES-GCM con chiave derivata da userId)
   - `studentService._saveActivities()` cifra prima di salvare
   - `studentService._getActivities()` decifra dopo lettura

2. **Server-side rate limiting** sull'endpoint `/api/sync`
   - Express middleware: 10 req/min per userId

3. **Webhook GDPR con auth** — aggiungere Bearer token a gdprService.callGdprWebhook()

4. **Data retention enforcement** — endpoint `/api/cleanup` che cancella dati > 2 anni

5. **Consenso parentale robusto** — verificare che l'email sia realmente inviata prima di procedere

### Risultato atteso
- GDPR Score: 7/10 → 8.5/10
- Token + dati cifrati
- Rate limit server-side

### Stima: 15h

---

## G33 — Test E2E con Playwright (Priorità: P1)

**Obiettivo**: Copertura test reale del rendering e interazione.

### Task
1. **Setup Playwright** (npm install + config)
2. **5 test critici**:
   - Apri homepage → clicca "Prova Subito" → simulatore si carica
   - Seleziona esperimento → canvas SVG renderizzato → LED presente
   - Clicca UNLIM → input bar appare → invia messaggio
   - Apri Teacher Dashboard → tab progressi → griglia studenti
   - CSV export → file scaricato
3. **CI integration** (opzionale): GitHub Actions

### Risultato atteso
- Test coverage reale: da 0% rendering a 5 flussi critici
- Regressioni catturate prima del deploy

### Stima: 12h

---

## G34 — Compilatore WASM Locale (Priorità: P1)

**Obiettivo**: Eliminare dipendenza da n8n per compilazione C++.

### Task
1. **Integrare avr-gcc WASM** (emscripten build o prebuilt)
   - Alternative: arduino-cli WASM o serverless function Vercel
2. **Fallback chain**: WASM locale → n8n remoto → errore
3. **Test**: compilare i 62 esperimenti offline
4. **Performance**: target < 3s per compilazione

### Risultato atteso
- Compilazione funziona offline
- Nessuna dipendenza da server esterno per feature core

### Stima: 20h (ricerca WASM + integrazione)

---

## G35 — Report Interattivi + PDF Export (Priorità: P2)

**Obiettivo**: Grafici interattivi nella Teacher Dashboard + export PDF.

### Task
1. **Installare recharts** (leggero, React-native)
2. **ReportTab**: sostituire barre CSS con grafici interattivi
   - Line chart: trend completamento nel tempo
   - Bar chart: top esperimenti completati/saltati (già HTML → recharts)
   - Pie chart: distribuzione moods
3. **PDF export** via @media print o html2pdf
4. **Print-friendly layout**: nascondere navbar, aggiustare margini

### Risultato atteso
- Dashboard professionale con grafici
- PDF scaricabile per riunioni scolastiche

### Stima: 12h

---

## Timeline

```
Aprile 2026
├── G31 (1-7 apr): Backend Server MVP
├── G32 (8-14 apr): GDPR Compliance Layer
├── G33 (15-21 apr): Test E2E Playwright
└── G34 (22-28 apr): Compilatore WASM

Maggio 2026
├── G35 (1-7 mag): Report + PDF
├── G36-G38: Buffer / bug fix / polish
└── G39-G40: Preparazione MePA + demo

Giugno 2026
├── Freeze: solo bug fix
└── 30/06: Deadline PNRR
```

---

## Rischi

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Backend troppo complesso | Alta | Blocca G31-G32 | Usare BaaS (Supabase/Firebase) invece di custom |
| WASM avr-gcc non esiste prebuilt | Media | Blocca G34 | Fallback: Vercel Edge Function |
| Andrea si ammala / imprevisti | Media | Ritardo | Buffer in maggio |
| DPA/DPIA non pronte | Alta | Blocca vendita PA | Iniziare consulenza legale ORA |

---

## Score Target Sprint F

| Area | Oggi (G30) | Target G35 | Come |
|------|-----------|------------|------|
| Build/Test | 10/10 | 10/10 | Mantenere |
| Simulatore | 8/10 | 8/10 | Non toccare |
| UNLIM | 7/10 | 7/10 | Non toccare |
| **Teacher Dashboard** | **7.5/10** | **9/10** | Backend server |
| **GDPR** | **7/10** | **8.5/10** | Cifratura + rate limit |
| **Test coverage** | **6/10** | **8/10** | Playwright E2E |
| **COMPOSITO** | **8.0/10** | **8.8/10** | Focus su P0/P1 |

---

## Azione Immediata (prima di G31)

1. **Contattare consulente privacy** per DPA/DPIA — non è lavoro dev
2. **Scegliere piattaforma backend**: Supabase (PostgreSQL + auth + API) vs custom Express
3. **Verificare budget**: Supabase free tier = 500MB, 50K auth users — sufficiente per MVP
