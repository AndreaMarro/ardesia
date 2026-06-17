# G32 — GDPR ENCRYPTION + AUTH SERVER-SIDE + DEPLOY

**Sprint F** — Seconda sessione (post G31 backend MVP)
**Deadline PNRR**: 30/06/2026 (92 giorni)
**Riferimento piano**: `docs/prompts/SPRINT-F-MASTER-PLAN.md`

---

## CONTESTO RAPIDO
- G31: Backend Express + better-sqlite3 creato con 6 endpoint + 2 compat
- Server testato localmente (20/20 test), **MA NON ANCORA DEPLOYATO su Render**
- Frontend migrato: studentService + gdprService usano VITE_DATA_SERVER_URL con fallback
- TeacherDashboard ha indicatori server/offline
- Score composito: 8.2/10 (target Sprint F: ≥ 9.0/10)
- **Collo di bottiglia**: server non live, token solo parsed (non firmati server-side), localStorage non cifrato
- 940/940 test frontend, 20/20 test server, build 25.8s, 62 lesson paths

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
Cifratura deve usare crypto reale (Web Crypto API). Auth deve validare con secret.
Mai fingere che la cifratura funzioni. Test con dati reali.

---

## SKILL DA USARE (SE DISPONIBILI)

| Fase | Skill | Perché | Fallback manuale |
|------|-------|--------|------------------|
| INIZIO | `/elab-arsenal:quality-gate` | Baseline pre-session | `npm run build && npx vitest run` |
| IMPL | `/elab-arsenal:legale-gdpr` | Audit GDPR punto per punto | Checklist GDPR §4 |
| IMPL | `/elab-arsenal:avversario-red-team` | Attacca auth per trovare bypass | curl con payload malevoli |
| RESEARCH | `/elab-arsenal:deep-web-research` | DPIA template italiano per scuole | Google manuale |
| RESEARCH | `/elab-arsenal:legale-contratti` | Requisiti DPA per PA | Documento manuale |
| IMPL | `/elab-arsenal:principio-zero` | Cifratura non complichi UX | Test: utente vede differenze? |
| FINE | `/elab-arsenal:quality-gate` | Score card post | `npm run build && npx vitest run` |
| FINE | `/elab-arsenal:session-manager` | Handoff G32 → G33 | Aggiorna handoff a mano |

---

## TASK

### 1. Quality Gate Pre-Session (10min)
```
/elab-arsenal:quality-gate pre
```

### 2. DEPLOY SERVER SU RENDER EU (1h) — BLOCCANTE

**QUESTO È IL TASK PIÙ IMPORTANTE**: il server G31 deve essere live.

1. Andrea crea servizio Render:
   - Account Render → New Web Service → Docker
   - Root directory: `server-data/`
   - Region: **Frankfurt (EU)**
   - Plan: Free
2. Deploy e verificare:
   ```
   curl https://<app>.onrender.com/api/health
   ```
3. Aggiornare variabili:
   - Vercel: `VITE_DATA_SERVER_URL=https://<app>.onrender.com`
   - Rideploy frontend con `npx vercel --prod --yes`
4. Verificare CORS:
   ```
   curl -H "Origin: https://elab-builder.vercel.app" https://<app>.onrender.com/api/health -v
   ```

### 3. Auth Server-Side Robusta (2h)

**PROBLEMA ATTUALE**: Il server G31 parsa il token e controlla expiry, ma NON verifica la firma HMAC. Chiunque può creare un token falso con exp nel futuro.

**SOLUZIONE**: Il server deve condividere lo stesso HMAC secret usato dalle Netlify Functions.

1. Aggiungere env var `HMAC_SECRET` al server Render
2. Implementare `verifyHmacToken(token, secret)` in `server-data/index.js`
3. `requireAuth` middleware deve VERIFICARE la firma, non solo parsare
4. Se il secret non è configurato → fallback al parse-only (dev mode) con warning

### 4. Cifratura localStorage (2h)

**GDPR Art.32**: Dati a riposo devono essere protetti.

1. Creare `src/utils/crypto.js`:
   - `encrypt(plaintext, key)` → AES-GCM con Web Crypto API
   - `decrypt(ciphertext, key)` → plaintext
   - Chiave derivata da userId + salt fisso con PBKDF2
2. Modificare `studentService.js`:
   - `saveStudentData()` cifra prima di localStorage.setItem
   - `getStudentData()` decifra dopo localStorage.getItem
   - Migrazione trasparente: se dati non cifrati, li cifra alla prima lettura
3. Test: dati in localStorage non leggibili come JSON

### 5. Audit Log Admin UI (1h)

1. Aggiungere pagina `/admin/audit` in TeacherDashboard (tab nascosto, solo admin)
2. Fetch da `GET /api/audit/:userId`
3. Tabella con timestamp, azione, endpoint, IP, status
4. Filtri per userId e action

### 6. DPIA Draft (30min)

Creare `docs/legal/DPIA-elab-v1.md`:
- Data Protection Impact Assessment v1
- Basato su template GPDP italiano
- Sezioni: finalità, base giuridica, dati trattati, misure sicurezza, valutazione rischio
- Nota: è un draft, richiede revisione legale

### 7. Quality Gate Post-Session (15min)
```
/elab-arsenal:quality-gate post
/elab-arsenal:session-manager "handoff G32 → G33"
```

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` — DEVE passare
- `npx vitest run` — 940+ test, 0 fail
- `cd server-data && node --test tests/` — 20+ test server

### CoV 2: PRE-DEPLOY
- Server live risponde a /api/health
- Token falso rifiutato (se HMAC implementato)
- localStorage cifrato (ispezione manuale)

### CoV 3: POST-DEPLOY
1. Frontend live su Vercel → "Dati dal server" visibile
2. Sync funziona end-to-end
3. GDPR delete funziona
4. Handoff aggiornato

---

## REGOLE
- ZERO DEMO, ZERO DATI FINTI, ZERO MOCK
- ZERO REGRESSIONI: build + test dopo OGNI modifica
- Non toccare engine/ — MAI
- 62 lesson paths INTOCCABILI
- Budget ≤ €50/mese
- Server DEVE essere EU (Frankfurt)

---

## DELIVERABLE ATTESI G32

| # | Deliverable | Criterio di accettazione |
|---|-------------|--------------------------|
| 1 | Server live su Render EU | URL pubblica, /api/health risponde |
| 2 | Frontend connesso al server | Indicatore "Dati dal server" visibile |
| 3 | Auth con HMAC verification | Token falso → 401 |
| 4 | localStorage cifrato | Dati non leggibili come JSON plaintext |
| 5 | Audit log admin | Tabella con log accessibile |
| 6 | DPIA v1 | Documento in docs/legal/ |
| 7 | Score card G32 | Score GDPR ≥ 8.5/10 |

---

## SCORE TARGET

| Area | G31 | Target G32 | Come |
|------|-----|-----------|------|
| Teacher Dashboard | 8/10 | **8.5/10** | Server live, dati reali dal backend |
| GDPR | 7/10 | **8.5/10** | HMAC auth, localStorage cifrato, audit log, DPIA |
| Build/Test | 10/10 | **10/10** | Mantenere |
| **COMPOSITO** | **8.2/10** | **8.8/10** | Deploy + cifratura sbloccano i gap |
