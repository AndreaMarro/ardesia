# G31 — BACKEND SERVER MVP + GDPR LAYER

**Sprint F** — Prima sessione dopo audit brutale G30
**Deadline PNRR**: 30/06/2026 (3 mesi esatti)

---

## CONTESTO RAPIDO
- G30: Audit con 5 agenti CoV → 8 issue CRITICAL GDPR, 3 fixati client-side, 5 richiedono backend
- Score composito: 8.0/10 — obiettivo Sprint F: ≥ 8.8/10
- **Collo di bottiglia**: ASSENZA DI BACKEND SERVER. Senza di esso la Teacher Dashboard è un prototipo.
- 3 fix GDPR già applicati in G30: consent-before-tracking, parental consent no-fake, DEV bypass ridotto
- 940/940 test, build 26s, bundle 4182KB, 62 lesson paths
- **35 nuove skill** in plugin `elab-arsenal` — USALE
- Handoff: `automa/handoff.md`
- Piano: `docs/plans/2026-03-30-sprint-F-plan-G31-G35.md`

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
Il backend deve funzionare con dati REALI. Se non c'è connessione, mostra "Offline — dati locali".
Mai fingere che il server risponda. Mai inventare dati.

---

## SKILL DA USARE (SE DISPONIBILI)

> **NOTA**: Le skill `elab-arsenal:*` sono plugin locali. Se non sono caricate nella sessione, esegui manualmente il task equivalente descritto in ogni step.

| Fase | Skill | Perché | Fallback manuale |
|------|-------|--------|------------------|
| INIZIO | `/elab-arsenal:quality-gate` | Baseline pre-session | `npm run build && npx vitest run` |
| DESIGN | `/elab-arsenal:ai-backend` | Architettura backend AI | Progetta endpoint prima di codare |
| DESIGN | `/elab-arsenal:principio-zero` | Backend non complichi UX | Verifica: utente vede differenze? |
| IMPL | `/elab-arsenal:legale-gdpr` | GDPR Art.32 compliance | Checklist GDPR manuale sotto |
| TEST | `/elab-arsenal:test-e2e-integrazione` | Test sync client↔server | Esegui i 6 test elencati in §5 |
| TEST | `/elab-arsenal:avversario-red-team` | Trova vulnerabilità | curl con payload malevoli |
| FINE | `/elab-arsenal:quality-gate` | Score card post | `npm run build && npx vitest run` |
| FINE | `/elab-arsenal:session-manager` | Handoff G32 | Aggiorna `automa/handoff.md` a mano |

---

## TASK

### 1. Quality Gate Pre-Session (15min)
```
/elab-arsenal:quality-gate pre
/elab-arsenal:context-loader standard
```
Salva baseline G31.

### 2. DECISIONE GIÀ PRESA: PocketBase su Render (EU)

**Perché PocketBase**: SQLite embedded (zero config DB), auth built-in, REST API auto-generata, admin UI, 1 binary Go, <15MB RAM, free tier Render basta per <100 studenti.
**Perché Render EU**: Frankfurt region, free tier 750h/mese, GDPR-compliant, deploy da GitHub in 2 click.
**Perché NON Supabase**: overkill, Postgres da gestire, free tier limiti auth.
**Perché NON Cloudflare D1**: beta, vendor lock-in, Workers syntax diversa.

Se PocketBase non funziona per motivi imprevisti → fallback: Express + better-sqlite3 su Render.

### 3. Implementazione Backend Server (4h)

#### 3a. Setup progetto server
- Crea directory `server/` nella root del progetto
- PocketBase binary + `pb_migrations/` per schema
- `.env` con variabili necessarie (MAI committare)
- **CORS**: configurare allowed origins = `['https://elab-builder.vercel.app', 'http://localhost:5173']`

#### 3b. Endpoint API (4 minimi vitali)
```
POST   /api/sync          — Riceve dati studente da studentService.flushSync()
GET    /api/class/:id     — Ritorna dati aggregati per la Teacher Dashboard
POST   /api/auth/verify   — Verifica token Bearer da authService
DELETE /api/student/:id   — GDPR Art.17: cancellazione completa dati studente
```

Ogni endpoint DEVE:
- Validare Bearer token
- Rate limit (10 req/min per userId)
- Loggare accessi (audit log GDPR)
- Ritornare JSON con schema consistente
- Gestire errori con codici HTTP corretti

#### 3c. Migrare studentService.flushSync()
```
PRIMA: flushSync() → n8n webhook (POST non autenticato)
DOPO:  flushSync() → server /api/sync (POST con Bearer token)
FALLBACK: se server down → mantieni in localStorage, riprova al prossimo flush
```

#### 3d. Teacher Dashboard: fetch da server
```
PRIMA: TeacherDashboard useEffect → solo localStorage
DOPO:  TeacherDashboard useEffect → server /api/class/:id → fallback localStorage
INDICATORE: mostra "🟢 Dati dal server" o "🟡 Dati locali (offline)" nel header
```

### 4. GDPR Hardening Backend (2h)
```
/elab-arsenal:legale-gdpr "audit nuovi endpoint per GDPR compliance"
```

- **Cifratura in transito**: HTTPS only (validare URL nel codice)
- **Cifratura a riposo**: dati nel DB cifrati con chiave server
- **Rate limit server-side**: middleware Express/Hono
- **Audit log**: ogni accesso loggato con timestamp, userId, action
- **Data retention**: endpoint `/api/admin/cleanup` per cancellare dati > 2 anni
- **GDPR webhook auth**: aggiungere Bearer token a `gdprService.callGdprWebhook()`

### 5. Test & Red Team (1h)
```
/elab-arsenal:test-e2e-integrazione "test sync client-server"
/elab-arsenal:avversario-red-team "attacca endpoint /api/sync e /api/class"
```

Test da eseguire:
1. Client invia dati → server riceve → Teacher Dashboard mostra
2. Server down → client mantiene localStorage → server torna → sync
3. Token invalido → server rifiuta (401)
4. Rate limit superato → server rifiuta (429)
5. Payload malformato → server rifiuta (400)
6. XSS nel payload → server sanitizza

### 6. Deploy Server su Render EU (30min)
- Crea servizio su Render (Frankfurt region, free tier)
- Deploy PocketBase con `Dockerfile` o binary
- Verifica URL live: `https://<app>.onrender.com/api/health`
- Aggiorna `.env` del frontend: `VITE_API_URL=https://<app>.onrender.com`
- Aggiorna Vercel env vars: `VITE_API_URL` in production
- **Test CORS**: `curl -H "Origin: https://elab-builder.vercel.app" <url>` → verifica header `Access-Control-Allow-Origin`

### 7. Quality Gate Post-Session (15min)
```
/elab-arsenal:quality-gate post
/elab-arsenal:session-manager "handoff G31 → G32"
```

Confronta con baseline:
- Build DEVE passare
- 940+ test esistenti, 0 regressioni
- **15+ test nuovi** per endpoint backend (sync, class, auth, delete, fallback, rate limit)
- 62 lesson paths intatti
- Teacher Dashboard mostra dati dal server

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` — DEVE passare
- `npx vitest run` — 940+ test, 0 fail
- Se step ha backend: `curl -X POST /api/sync` e verifica risposta

### CoV 2: PRE-DEPLOY
- `/elab-arsenal:quality-gate post`
- `/elab-arsenal:avversario-red-team` su endpoint
- 4 critici PASS → autorizza deploy

### CoV 3: POST-DEPLOY
1. Verifica URL server live (health check)
2. Verifica URL frontend live
3. Naviga a /#teacher → conferma dati dal server
4. Aggiorna `automa/handoff.md`

---

## REGOLE

- ZERO DEMO, ZERO DATI FINTI, ZERO MOCK
- ZERO REGRESSIONI: build + test dopo OGNI modifica
- Non toccare engine/ — MAI
- Non toccare lesson paths — 62 INTOCCABILE
- Backend DEVE essere su server EU (GDPR)
- Budget totale ≤ €50/mese
- Handoff: `automa/handoff.md`
- USA LE SKILL: non fare nulla senza prima consultare la skill appropriata
- Se una skill dice FAIL → FIX prima di procedere
- `/elab-arsenal:principio-zero` verifica che il backend non complichi l'UX

---

## DELIVERABLE ATTESI G31

| # | Deliverable | Criterio di accettazione |
|---|-------------|--------------------------|
| 1 | Server backend deployato | URL live, health check risponde |
| 2 | POST /api/sync funzionante | Accetta dati con Bearer token, rifiuta senza |
| 3 | GET /api/class/:id funzionante | Ritorna dati aggregati reali |
| 4 | studentService migrato | flushSync() usa server, fallback localStorage |
| 5 | Teacher Dashboard migrata | Fetch da server, indicatore online/offline |
| 6 | GDPR hardening | Rate limit, audit log, HTTPS enforcement |
| 7 | Red team superato | 0 vulnerabilità CRITICAL negli endpoint |
| 8 | Score card G31 | PASS su tutti i check critici |

---

## SCORE TARGET

| Area | G30 | Target G31 | Come |
|------|-----|-----------|------|
| Teacher Dashboard | 7.5/10 | **9/10** | Dati dal server, non solo localStorage |
| GDPR | 7/10 | **8/10** | Rate limit server, audit log, HTTPS |
| Build/Test | 10/10 | **10/10** | Mantenere |
| **COMPOSITO** | **8.0/10** | **8.6/10** | Backend sblocca i 2 gap principali |
