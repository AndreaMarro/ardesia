# Auth Server-Side — Design Document
<!-- Andrea Marro — 18/02/2026 -->

## Decisioni

| Scelta | Decisione |
|--------|-----------|
| Modello auth | Login completo SOSTITUISCE PasswordGate |
| Backend | Netlify functions (riuso auth esistente) |
| Minori | Account semplificato: username+password, docente crea |
| Licenza | Attributo dell'account; senza licenza → community + vetrina |

## Architettura

```
Browser (Vercel)
  ├─ LoginPage / RegisterPage
  ├─ AuthContext (user, token, hasLicense)
  ├─ authService.js → HTTPS cross-origin
  └─ Route Guards (RequireAuth, RequireLicense, RequireAdmin)
         │
         ▼  CORS cross-origin
Netlify Functions (sito pubblico)
  ├─ auth-login.js        [ESISTENTE — aggiungere CORS + hasLicense]
  ├─ auth-register.js     [ESISTENTE — aggiungere CORS + ruolo]
  ├─ auth-reset-*.js      [ESISTENTE — aggiungere CORS]
  ├─ auth-me.js           [NUOVA — verifica token, ritorna profilo]
  ├─ auth-create-student.js [NUOVA — docente crea account studente]
  └─ auth-activate-license.js [NUOVA — lega licenza ad account]
         │
         ▼
Notion Users DB (già esistente)
```

## Livelli di Accesso

| Livello | Chi | Cosa vede |
|---------|-----|-----------|
| Non autenticato | Visitatore | Landing page sito pubblico |
| Auth, senza licenza | Utente registrato | Community, profilo, **vetrina simulatore** (screenshot + CTA) |
| Auth, con licenza | Studente/Docente con kit | Tutto: simulatore, esperimenti, Galileo, giochi, manuale |
| Auth, admin | Andrea | Tutto + pannello admin |

### Vetrina Simulatore (senza licenza)
- 3-4 screenshot statici del simulatore
- Lista features: circuiti, RGB LED, robot, Monta Tu!, Galileo AI
- Campo "Inserisci codice licenza" + link Amazon
- Messaggio: "Con la licenza ELAB puoi..."

## Flussi Utente

### Adulto/Docente
1. Registra con email + password
2. Login
3. Vede community + vetrina simulatore
4. Attiva licenza dal profilo (inserisce codice kit)
5. Accede al simulatore completo

### Studente (minore)
1. Docente crea account (username + password temporanea)
2. Studente fa login con username + password
3. Eredita licenza dal docente
4. Accede al simulatore completo

## Netlify Functions — Dettaglio

### Modifiche a funzioni esistenti

**auth-login.js**
- Aggiungere `elab-builder.vercel.app` al CORS whitelist
- Aggiungere nel response: `hasLicense`, `licenseExpiry`, `ruolo`
- Supportare login via `username` (oltre a `email`) per studenti minori

**auth-register.js**
- Aggiungere CORS
- Campo `ruolo` obbligatorio: `student` | `teacher` | `parent` (default: `student`)

**auth-reset-request.js / auth-reset-confirm.js**
- Solo aggiunta CORS

### Nuove funzioni

**auth-me.js** — `GET /.netlify/functions/auth-me`
- Header: `Authorization: Bearer <token>`
- Verifica token HMAC via `utils/auth-verify.js`
- Query Notion per userId
- Response: `{ user: { id, nome, email, ruolo }, hasLicense, licenseExpiry }`

**auth-create-student.js** — `POST /.netlify/functions/auth-create-student`
- Header: `Authorization: Bearer <token>` (deve essere ruolo `teacher`)
- Body: `{ username, password?, className? }`
- Crea account in Notion: `Username`, `Password Hash` (bcrypt), `Ruolo: student`, `Docente Ref: teacherId`
- Se password non fornita, genera password temporanea (8 chars)
- Studente eredita licenza dal docente
- Response: `{ success, student: { username, tempPassword? } }`

**auth-activate-license.js** — `POST /.netlify/functions/auth-activate-license`
- Header: `Authorization: Bearer <token>`
- Body: `{ licenseCode }`
- Verifica codice licenza (stessa logica di `licenseService.verifyLicense`)
- Aggiorna Notion: `Kit Attivati` += codice, `Premium` = true, `License Expiry` = +1 anno
- Response: `{ success, licenseExpiry }`

## React — Modifiche

### Rimozioni
- `PasswordGate.jsx` → rimosso, sostituito da AuthContext + route guards
- `userService.js` auth logic → deprecata (community logic resta)

### File modificati

**`AuthContext.jsx`** — Riscrittura:
- Usa `authService.js` (non più userService)
- State: `user`, `token`, `hasLicense`, `loading`
- On mount: controlla token in sessionStorage → chiama `/auth-me`
- Auto-refresh token prima della scadenza (già in authService)
- Exports: `useAuth()`, `login()`, `register()`, `logout()`, `activateLicense()`

**`authService.js`** — Adattamento:
- `VITE_AUTH_URL` punta a `https://funny-pika-3d1029.netlify.app/.netlify/functions`
- Endpoint mapping: `/auth/login` → `/auth-login`, etc.
- Rimuovere logica n8n-specifica

**`App.jsx`** — Nuove route:
```jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/vetrina" element={<RequireAuth><VetrinaSimulatore /></RequireAuth>} />
<Route path="/simulatore" element={<RequireAuth><RequireLicense><Simulatore /></RequireLicense></RequireAuth>} />
<Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
```

### Nuovi componenti

**`RequireAuth.jsx`** — Redirect a `/login` se non autenticato
**`RequireLicense.jsx`** — Redirect a `/vetrina` se no licenza
**`RequireAdmin.jsx`** — Redirect a `/` se non admin
**`VetrinaSimulatore.jsx`** — Screenshot + CTA attivazione licenza

## Schema Notion — Aggiunte

| Proprietà | Tipo | Scopo |
|-----------|------|-------|
| `Username` | Rich Text | Login studenti minori (alternativo a email) |
| `Docente Ref` | Relation → Users | Lega studente al docente creatore |
| `License Expiry` | Date | Scadenza licenza (null = no licenza) |

Proprietà esistenti invariate: Email, Password Hash, Kit Attivati, Premium, Nome, Ruolo, etc.

## Rischi e Mitigazioni

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| CORS Vercel→Netlify | Media | Test post-deploy. Fallback: Vercel proxy `/api/auth` |
| Cold start Netlify | Bassa | Functions già attive, ~1s max |
| Token HMAC ≠ JWT standard | Bassa | Funzionale per questo use case |
| userService.js 893 LOC mescolato | Alta | Solo auth migra, community logic resta |
| Notion rate limit (3 req/s) | Media | OK per centinaia utenti |

## Stima Effort

- **Sessione 1**: Backend (3 nuove functions + CORS su esistenti + schema Notion)
- **Sessione 2**: React (AuthContext, route guards, VetrinaSimulatore, rimuovi PasswordGate)
- **Sessione 3**: Test end-to-end + deploy Netlify + Vercel

## Non in Scope (YAGNI)

- OAuth/social login
- Email verification on register
- JWT standard (HMAC token sufficiente)
- Migrazione community da localStorage a server
- Supabase/Postgres (Notion sufficiente per ora)
