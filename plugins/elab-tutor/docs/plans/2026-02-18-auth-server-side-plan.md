# Auth Server-Side Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace PasswordGate with full server-side JWT auth using existing Netlify functions + Notion Users DB, with license-gated simulator access.

**Architecture:** ELAB Tutor (Vercel) calls existing Netlify auth functions cross-origin. 3 new functions added (auth-me, auth-create-student, auth-activate-license). React AuthContext rewired from localStorage userService to server-side authService. PasswordGate removed, replaced by RequireAuth + RequireLicense route guards.

**Tech Stack:** Netlify Functions (Node.js), Notion API, bcryptjs, HMAC-SHA256 tokens, React Context + Suspense

**Design Doc:** `docs/plans/2026-02-18-auth-server-side-design.md`

**Key Constraint:** Do NOT modify `CircuitSolver.js`, `experiments-vol*.js`, `newcartella css/`, or `gdprService.js`.

**Watermark Rule:** Every new file gets `// Andrea Marro — 18/02/2026` in first 5 lines.

---

## PHASE 1: Backend (Netlify Functions)

### Task 1: Add CORS for Vercel origin to existing auth functions

**Files:**
- Modify: `PRODOTTO/newcartella/netlify/functions/auth-login.js:13`
- Modify: `PRODOTTO/newcartella/netlify/functions/auth-register.js:11`
- Modify: `PRODOTTO/newcartella/netlify/functions/auth-reset-request.js` (CORS line)
- Modify: `PRODOTTO/newcartella/netlify/functions/auth-reset-confirm.js` (CORS line)
- Modify: `PRODOTTO/newcartella/netlify/functions/utils/auth-verify.js:26`

**Step 1: Update ALLOWED_ORIGINS env var**

In each file, the CORS whitelist reads from `process.env.ALLOWED_ORIGINS`. Add `https://elab-builder.vercel.app` to the Netlify env var. But also hardcode it in the fallback default string.

In `auth-login.js:13`, change:
```js
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://funny-pika-3d1029.netlify.app,https://elab.school').split(',').map(o => o.trim());
```
to:
```js
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://funny-pika-3d1029.netlify.app,https://elab.school,https://elab-builder.vercel.app').split(',').map(o => o.trim());
```

Same change in `auth-register.js:11`, `auth-reset-request.js`, `auth-reset-confirm.js`, and `utils/auth-verify.js:26`.

**Step 2: Add `Authorization` to allowed headers in auth-login.js and auth-register.js**

In `auth-login.js:22`, change:
```js
'Access-Control-Allow-Headers': 'Content-Type',
```
to:
```js
'Access-Control-Allow-Headers': 'Content-Type, Authorization',
```

Same in `auth-register.js:18`.

**Step 3: Verify manually**

Check all 5 files have `elab-builder.vercel.app` in ALLOWED_ORIGINS and `Authorization` in Allow-Headers.

---

### Task 2: Add hasLicense + ruolo to auth-login.js response

**Files:**
- Modify: `PRODOTTO/newcartella/netlify/functions/auth-login.js:122-140`

**Step 1: Extend the user object**

After line 131 (after `level` property), add `ruolo` field. After the user object, compute `hasLicense`.

Replace lines 122-140:
```js
    const user = {
      id: userPage.id,
      email: userPage.properties['Email']?.email || email,
      name: userPage.properties['Nome']?.rich_text?.[0]?.text?.content || '',
      surname: userPage.properties['Cognome']?.rich_text?.[0]?.text?.content || '',
      userType: userPage.properties['Tipo']?.select?.name === 'Scuola' ? 'school' : 'family',
      kits: userPage.properties['Kit Attivati']?.multi_select?.map(k => k.name) || [],
      premium: userPage.properties['Premium']?.checkbox || false,
      points: userPage.properties['Punti']?.number || 0,
      level: userPage.properties['Livello']?.number || 1
    };

    // Genera token di sessione firmato
    const token = generateUserToken(user.email, user.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, user, token, expiresIn: TOKEN_EXPIRY_MS })
    };
```

With:
```js
    const kits = userPage.properties['Kit Attivati']?.multi_select?.map(k => k.name) || [];
    const premium = userPage.properties['Premium']?.checkbox || false;
    const licenseExpiryRaw = userPage.properties['License Expiry']?.date?.start || null;
    const hasLicense = premium || kits.length > 0;

    const user = {
      id: userPage.id,
      email: userPage.properties['Email']?.email || email,
      name: userPage.properties['Nome']?.rich_text?.[0]?.text?.content || '',
      surname: userPage.properties['Cognome']?.rich_text?.[0]?.text?.content || '',
      ruolo: userPage.properties['Ruolo']?.select?.name || 'student',
      userType: userPage.properties['Tipo']?.select?.name === 'Scuola' ? 'school' : 'family',
      kits,
      premium,
      points: userPage.properties['Punti']?.number || 0,
      level: userPage.properties['Livello']?.number || 1
    };

    // Genera token di sessione firmato
    const token = generateUserToken(user.email, user.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true, user, token, expiresIn: TOKEN_EXPIRY_MS,
        hasLicense, licenseExpiry: licenseExpiryRaw
      })
    };
```

**Step 2: Support username login (for student accounts)**

Before the email query (line 60), add username-based lookup:

After `const { email, password } = JSON.parse(event.body);` add:
```js
    // Support login via username (for student accounts without email)
    const { username } = JSON.parse(event.body);
```

And modify the validation:
```js
    if ((!email && !username) || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email (o username) e password sono obbligatori' })
      };
    }
```

Add a second query path for username:
```js
    let users;
    if (email) {
      users = await notion.databases.query({
        database_id: config.DATABASES.USERS,
        filter: { property: 'Email', email: { equals: email } }
      });
    } else {
      users = await notion.databases.query({
        database_id: config.DATABASES.USERS,
        filter: { property: 'Username', rich_text: { equals: username } }
      });
    }
```

---

### Task 3: Add ruolo field to auth-register.js

**Files:**
- Modify: `PRODOTTO/newcartella/netlify/functions/auth-register.js:45,87-101`

**Step 1: Parse ruolo from body**

Line 45, change:
```js
    const { email, password, name, surname, userType, kitCode } = JSON.parse(event.body);
```
to:
```js
    const { email, password, name, surname, userType, kitCode, ruolo } = JSON.parse(event.body);
```

**Step 2: Add Ruolo property to Notion create**

In the `properties` object (line 87-101), after `'Tipo'`, add:
```js
        'Ruolo': { select: { name: ruolo || 'student' } },
```

**Step 3: Add ruolo to response user object**

In the response `user` object (line 120-130), add:
```js
      ruolo: ruolo || 'student',
```

---

### Task 4: Create auth-me.js (new function)

**Files:**
- Create: `PRODOTTO/newcartella/netlify/functions/auth-me.js`

**Step 1: Write the function**

```js
/**
 * Auth Me - Profilo utente corrente
 * Verifica token e ritorna profilo + stato licenza
 * © Andrea Marro — 18/02/2026
 */

const { Client } = require('@notionhq/client');
const config = require('./notion-config');
const { verifyUserAuth, getSecureHeaders } = require('./utils/auth-verify');

exports.handler = async (event) => {
  const headers = getSecureHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Verifica token
  const auth = verifyUserAuth(event);
  if (!auth.authorized) return auth.response;

  if (!config.NOTION_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server non configurato.' }) };
  }

  try {
    const notion = new Client({ auth: config.NOTION_API_KEY });

    // Fetch user page by ID
    const userPage = await notion.pages.retrieve({ page_id: auth.userId });

    const kits = userPage.properties['Kit Attivati']?.multi_select?.map(k => k.name) || [];
    const premium = userPage.properties['Premium']?.checkbox || false;
    const licenseExpiryRaw = userPage.properties['License Expiry']?.date?.start || null;
    const hasLicense = premium || kits.length > 0;

    const user = {
      id: userPage.id,
      email: userPage.properties['Email']?.email || auth.email,
      name: userPage.properties['Nome']?.rich_text?.[0]?.text?.content || '',
      surname: userPage.properties['Cognome']?.rich_text?.[0]?.text?.content || '',
      ruolo: userPage.properties['Ruolo']?.select?.name || 'student',
      userType: userPage.properties['Tipo']?.select?.name === 'Scuola' ? 'school' : 'family',
      kits,
      premium,
      points: userPage.properties['Punti']?.number || 0,
      level: userPage.properties['Livello']?.number || 1
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, user, hasLicense, licenseExpiry: licenseExpiryRaw })
    };
  } catch (error) {
    console.error('Auth-me error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore nel recupero profilo.' })
    };
  }
};
```

---

### Task 5: Create auth-activate-license.js (new function)

**Files:**
- Create: `PRODOTTO/newcartella/netlify/functions/auth-activate-license.js`

**Step 1: Write the function**

```js
/**
 * Auth Activate License - Attiva codice licenza su account utente
 * Verifica codice via n8n license endpoint, aggiorna Notion
 * © Andrea Marro — 18/02/2026
 */

const { Client } = require('@notionhq/client');
const config = require('./notion-config');
const { verifyUserAuth, getSecureHeaders } = require('./utils/auth-verify');
const { applyRateLimit } = require('./utils/rate-limiter');

const LICENSE_VERIFY_URL = process.env.N8N_LICENSE_URL || 'https://n8n.srv1022317.hstgr.cloud/webhook/elab-license';

exports.handler = async (event) => {
  const headers = getSecureHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Rate limit: 5 tentativi al minuto
  const rateLimited = applyRateLimit(event, { maxRequests: 5, windowMs: 60000 });
  if (rateLimited) return rateLimited;

  // Verifica token utente
  const auth = verifyUserAuth(event);
  if (!auth.authorized) return auth.response;

  if (!config.NOTION_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server non configurato.' }) };
  }

  try {
    const { licenseCode } = JSON.parse(event.body);

    if (!licenseCode || licenseCode.length < 4) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Codice licenza non valido.' }) };
    }

    // Verifica codice licenza via n8n endpoint (stessa logica di licenseService)
    const licenseResp = await fetch(LICENSE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', licenseCode, userId: auth.userId })
    });

    const licenseData = await licenseResp.json();

    if (!licenseData.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: licenseData.message || 'Codice licenza non valido o già usato.' })
      };
    }

    // Aggiorna utente in Notion
    const notion = new Client({ auth: config.NOTION_API_KEY });
    const userPage = await notion.pages.retrieve({ page_id: auth.userId });

    const existingKits = userPage.properties['Kit Attivati']?.multi_select?.map(k => k.name) || [];
    const newKits = [...new Set([...existingKits, licenseCode])];
    const licenseExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await notion.pages.update({
      page_id: auth.userId,
      properties: {
        'Kit Attivati': { multi_select: newKits.map(k => ({ name: k })) },
        'Premium': { checkbox: true },
        'License Expiry': { date: { start: licenseExpiry } }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, licenseExpiry, kits: newKits })
    };
  } catch (error) {
    console.error('License activation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore durante attivazione licenza.' })
    };
  }
};
```

---

### Task 6: Create auth-create-student.js (new function)

**Files:**
- Create: `PRODOTTO/newcartella/netlify/functions/auth-create-student.js`

**Step 1: Write the function**

```js
/**
 * Auth Create Student - Docente crea account studente
 * Solo ruolo teacher può invocare. Genera username + password.
 * © Andrea Marro — 18/02/2026
 */

const { Client } = require('@notionhq/client');
const config = require('./notion-config');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { verifyUserAuth, getSecureHeaders } = require('./utils/auth-verify');
const { applyRateLimit } = require('./utils/rate-limiter');

function generateTempPassword() {
  return crypto.randomBytes(4).toString('hex'); // 8 char hex
}

exports.handler = async (event) => {
  const headers = getSecureHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Rate limit: 10 creazioni al minuto (docente crea batch di studenti)
  const rateLimited = applyRateLimit(event, { maxRequests: 10, windowMs: 60000 });
  if (rateLimited) return rateLimited;

  // Verifica token docente
  const auth = verifyUserAuth(event);
  if (!auth.authorized) return auth.response;

  if (!config.NOTION_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server non configurato.' }) };
  }

  try {
    const notion = new Client({ auth: config.NOTION_API_KEY });

    // Verifica che l'utente sia un docente
    const teacherPage = await notion.pages.retrieve({ page_id: auth.userId });
    const teacherRuolo = teacherPage.properties['Ruolo']?.select?.name;
    if (teacherRuolo !== 'teacher' && teacherRuolo !== 'admin') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Solo i docenti possono creare account studenti.' }) };
    }

    const { username, password, className } = JSON.parse(event.body);

    if (!username || username.length < 3) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Username deve avere almeno 3 caratteri.' }) };
    }

    // Verifica username non duplicato
    const existing = await notion.databases.query({
      database_id: config.DATABASES.USERS,
      filter: { property: 'Username', rich_text: { equals: username } }
    });
    if (existing.results.length > 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Username già in uso.' }) };
    }

    const tempPassword = password || generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Eredita licenza dal docente
    const teacherKits = teacherPage.properties['Kit Attivati']?.multi_select?.map(k => k.name) || [];
    const teacherPremium = teacherPage.properties['Premium']?.checkbox || false;
    const teacherLicenseExpiry = teacherPage.properties['License Expiry']?.date?.start || null;

    const newStudent = await notion.pages.create({
      parent: { database_id: config.DATABASES.USERS },
      properties: {
        'Name': { title: [{ text: { content: username } }] },
        'Username': { rich_text: [{ text: { content: username } }] },
        'Password Hash': { rich_text: [{ text: { content: passwordHash } }] },
        'Nome': { rich_text: [{ text: { content: username } }] },
        'Ruolo': { select: { name: 'student' } },
        'Tipo': { select: { name: 'Scuola' } },
        'Premium': { checkbox: teacherPremium },
        'Kit Attivati': { multi_select: teacherKits.map(k => ({ name: k })) },
        ...(teacherLicenseExpiry ? { 'License Expiry': { date: { start: teacherLicenseExpiry } } } : {}),
        'Punti': { number: 0 },
        'Livello': { number: 1 },
        'Data Registrazione': { date: { start: new Date().toISOString().split('T')[0] } }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        student: {
          id: newStudent.id,
          username,
          tempPassword: password ? undefined : tempPassword,
          className: className || null
        }
      })
    };
  } catch (error) {
    console.error('Create student error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore nella creazione account studente.' })
    };
  }
};
```

---

### Task 7: Add Notion DB properties (Username, Ruolo, License Expiry)

**Manual step — via Notion UI or API:**

Add to the Notion Users DB (`4dea1fa8-d963-4dc9-b69f-4cef4f39021f`):

| Property | Type | Notes |
|----------|------|-------|
| `Username` | Rich Text | For student login (alternative to email) |
| `Ruolo` | Select | Options: `student`, `teacher`, `parent`, `admin` |
| `License Expiry` | Date | Null = no license |

The `Docente Ref` relation can be added later if needed; for now the teacher-student link is implicit via license inheritance.

**Verify:** Check that existing users in Notion don't have conflicting properties.

---

### Task 8: Deploy Netlify and test CORS

**Step 1: Set env var on Netlify**

```
ALLOWED_ORIGINS=https://funny-pika-3d1029.netlify.app,https://elab.school,https://elab-builder.vercel.app
```

**Step 2: Deploy**

```bash
cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

**Step 3: Test CORS from browser console on elab-builder.vercel.app**

```js
fetch('https://funny-pika-3d1029.netlify.app/.netlify/functions/auth-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
  credentials: 'include'
}).then(r => r.json()).then(console.log).catch(console.error);
```

Expected: JSON response (401 or error), NOT a CORS error.

---

## PHASE 2: React Frontend

### Task 9: Rewrite authService.js to call Netlify functions

**Files:**
- Modify: `PRODOTTO/elab-builder/src/services/authService.js`

**Step 1: Change API_BASE_URL and endpoint mapping**

Replace the entire file. Key changes:
- `API_BASE_URL` → `VITE_AUTH_URL` pointing to Netlify functions base
- Endpoint paths: `/auth-login`, `/auth-register`, `/auth-me`, `/auth-activate-license`
- Token stored in sessionStorage (already done)
- Remove the `refreshToken` flow (HMAC tokens don't refresh; they last 7 days)
- Add `activateLicense(code)` and `getProfile()` methods

The file already has good structure. Main changes:
- Line 7: `const API_BASE_URL = import.meta.env.VITE_AUTH_URL || '';`
- Simplify `apiCall` — remove 401 auto-refresh (HMAC tokens are long-lived)
- Map endpoints: `register` → `/auth-register`, `login` → `/auth-login`, `me` → `/auth-me`
- Add `activateLicense(licenseCode)` calling `/auth-activate-license`
- Add `createStudent(data)` calling `/auth-create-student`
- Keep: `parseJWT` → rename to `parseToken` (it's HMAC not JWT, but same base64 structure)

---

### Task 10: Rewrite AuthContext.jsx

**Files:**
- Modify: `PRODOTTO/elab-builder/src/context/AuthContext.jsx`

**Step 1: Rewire to authService (server-side)**

Key changes:
- Import from `authService` not `userService`
- Add `hasLicense` state
- On mount: check sessionStorage for token → call `authService.getProfile()`
- `login()` calls `authService.login()` → sets user + hasLicense from response
- `register()` calls `authService.register()` → sets user
- `logout()` clears token + state
- Add `activateLicense(code)` → calls `authService.activateLicense(code)` → updates hasLicense
- Export: `user`, `loading`, `isAuthenticated`, `hasLicense`, `isAdmin`, `isDocente`, `isStudente`, `login`, `register`, `logout`, `activateLicense`

---

### Task 11: Create route guard components

**Files:**
- Create: `PRODOTTO/elab-builder/src/components/auth/RequireAuth.jsx`
- Create: `PRODOTTO/elab-builder/src/components/auth/RequireLicense.jsx`
- Create: `PRODOTTO/elab-builder/src/components/auth/RequireAdmin.jsx`

**RequireAuth.jsx:**
```jsx
// Andrea Marro — 18/02/2026
import { useAuth } from '../../context/AuthContext';
export default function RequireAuth({ children, onNavigate }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) { onNavigate?.('login'); return null; }
  return children;
}
```

**RequireLicense.jsx:**
```jsx
// Andrea Marro — 18/02/2026
import { useAuth } from '../../context/AuthContext';
export default function RequireLicense({ children, onNavigate }) {
  const { hasLicense, loading } = useAuth();
  if (loading) return null;
  if (!hasLicense) { onNavigate?.('vetrina'); return null; }
  return children;
}
```

**RequireAdmin.jsx:**
```jsx
// Andrea Marro — 18/02/2026
import { useAuth } from '../../context/AuthContext';
export default function RequireAdmin({ children, onNavigate }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) { onNavigate?.('tutor'); return null; }
  return children;
}
```

---

### Task 12: Create VetrinaSimulatore.jsx

**Files:**
- Create: `PRODOTTO/elab-builder/src/components/VetrinaSimulatore.jsx`

A page showing what the simulator offers, with screenshots and a license activation form. This is a UI/content task — the component calls `useAuth().activateLicense(code)` on form submit.

Key sections:
1. Hero with screenshot of simulator
2. Feature list (circuiti, RGB LED, robot, Monta Tu!, Galileo AI, 69 esperimenti)
3. License code input form
4. "Acquista su Amazon" link
5. On successful activation → redirect to `/simulatore` (tutor)

---

### Task 13: Rewire App.jsx — remove PasswordGate, add route guards

**Files:**
- Modify: `PRODOTTO/elab-builder/src/App.jsx:13,96-154`

**Step 1: Remove PasswordGate import (line 13)**

Remove:
```js
import PasswordGate from './components/PasswordGate';
```

**Step 2: Add route guard imports**

```js
import RequireAuth from './components/auth/RequireAuth';
import RequireLicense from './components/auth/RequireLicense';
```

**Step 3: Replace PasswordGate wrapper (lines 148-152)**

Change:
```jsx
<PasswordGate>
    <Suspense fallback={<LoadingFallback />}>
        <ElabTutorV4 />
    </Suspense>
</PasswordGate>
```

To:
```jsx
<RequireAuth onNavigate={navigate}>
    <RequireLicense onNavigate={navigate}>
        <Suspense fallback={<LoadingFallback />}>
            <ElabTutorV4 />
        </Suspense>
    </RequireLicense>
</RequireAuth>
```

**Step 4: Add vetrina route**

In the page routing section, add before the tutor page block:
```jsx
if (currentPage === 'vetrina') {
    return (
        <RequireAuth onNavigate={navigate}>
            <Suspense fallback={<LoadingFallback />}>
                <VetrinaSimulatore onNavigate={navigate} />
            </Suspense>
        </RequireAuth>
    );
}
```

---

### Task 14: Set VITE_AUTH_URL env var on Vercel

**Step 1: Add to .env**

```
VITE_AUTH_URL=https://funny-pika-3d1029.netlify.app/.netlify/functions
```

**Step 2: Add to Vercel**

```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npx vercel env add VITE_AUTH_URL production
```

Value: `https://funny-pika-3d1029.netlify.app/.netlify/functions`

---

## PHASE 3: Test & Deploy

### Task 15: Build and test locally

**Step 1: Build**

```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
```

Expected: 0 errors. Check that PasswordGate is no longer imported.

**Step 2: Dev server test**

```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npx vite --port 5173
```

Test flow:
1. Navigate to `localhost:5173` → should redirect to login (no more license code gate)
2. Register new account → should work via Netlify function
3. Login → should work, land on dashboard
4. Without license → should see vetrina (not simulator)
5. Activate license → should unlock simulator

### Task 16: Deploy Vercel

```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
```

### Task 17: End-to-end test on production

Test on `https://elab-builder.vercel.app`:
1. Register → Login → see community + vetrina
2. Activate license → see full simulator
3. Admin login → see admin panel
4. Check console: 0 CORS errors, 0 app errors

---

## Summary of Files

| Action | File | Phase |
|--------|------|-------|
| Modify | `newcartella/netlify/functions/auth-login.js` | 1 |
| Modify | `newcartella/netlify/functions/auth-register.js` | 1 |
| Modify | `newcartella/netlify/functions/auth-reset-request.js` | 1 |
| Modify | `newcartella/netlify/functions/auth-reset-confirm.js` | 1 |
| Modify | `newcartella/netlify/functions/utils/auth-verify.js` | 1 |
| Create | `newcartella/netlify/functions/auth-me.js` | 1 |
| Create | `newcartella/netlify/functions/auth-activate-license.js` | 1 |
| Create | `newcartella/netlify/functions/auth-create-student.js` | 1 |
| Modify | `elab-builder/src/services/authService.js` | 2 |
| Modify | `elab-builder/src/context/AuthContext.jsx` | 2 |
| Create | `elab-builder/src/components/auth/RequireAuth.jsx` | 2 |
| Create | `elab-builder/src/components/auth/RequireLicense.jsx` | 2 |
| Create | `elab-builder/src/components/auth/RequireAdmin.jsx` | 2 |
| Create | `elab-builder/src/components/VetrinaSimulatore.jsx` | 2 |
| Modify | `elab-builder/src/App.jsx` | 2 |
| Modify | `elab-builder/.env` | 2 |
| Manual | Notion DB: add Username, Ruolo, License Expiry | 1 |
| Manual | Netlify env: ALLOWED_ORIGINS | 1 |
| Manual | Vercel env: VITE_AUTH_URL | 2 |
