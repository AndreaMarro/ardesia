# AGENT-08: Security Audit Report
## ELAB Tutor Application - Security Assessment
**Date**: 2026-02-13
**Scope**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/`
**Target Audience**: Children ages 8-12 (COPPA/GDPR-Kids applicable)
**Deployed At**: https://elab-builder.vercel.app
**Audit Type**: READ-ONLY, static analysis

---

## Executive Summary

The ELAB Tutor application has **critical architectural security flaws** stemming from its localStorage-based authentication and social system. The entire authentication, user database, social features (posts, comments, groups), and student tracking system are implemented client-side in the browser with no server-side enforcement. This architecture makes the application fundamentally insecure for any environment involving children's data.

**Overall Risk Level**: **CRITICAL**

| Area | Rating | Summary |
|------|--------|---------|
| Authentication | CRITICAL | Entirely client-side, trivially bypassable |
| Data Storage | CRITICAL | All data in localStorage, no encryption, PII exposed |
| API Security | HIGH | Webhook URLs hardcoded, no auth tokens on API calls |
| XSS/Injection | MEDIUM | Partial sanitization, 5 uses of dangerouslySetInnerHTML |
| External Dependencies | LOW | No CDN scripts, standard npm packages |
| COPPA Compliance | CRITICAL | Zero compliance mechanisms implemented |

**Findings Count**: 7 CRITICAL, 5 HIGH, 4 MEDIUM, 3 LOW

---

## 1. Authentication System

### FINDING AUTH-01: Client-Side Authentication (CRITICAL)

**File**: `/src/services/userService.js` (lines 147-329)

The entire authentication system is implemented in the browser using localStorage. There is no server-side authentication, no JWTs, no server-issued sessions.

**How it works**:
- User database stored in `localStorage` key `elab_db_users`
- Passwords hashed with SHA-256 (unsalted) and compared client-side
- Login success writes user data to `localStorage` key `elab_current_user`
- "Session" is just a JSON object in localStorage

**Attack vector (DevTools bypass)**:
```javascript
// In browser console - instant admin access:
localStorage.setItem('elab_current_user', JSON.stringify({
  id: 'hacker', nome: 'Hacker', email: 'h@h.com', ruolo: 'admin'
}));
location.reload();
```

**Impact**: Anyone with DevTools access (F12) can:
- Create admin accounts
- Access all user data
- Delete/modify any posts, comments, groups
- Access teacher dashboards and student data
- Bypass the PasswordGate entirely

### FINDING AUTH-02: HMAC Session Signing is Ineffective (CRITICAL)

**File**: `/src/services/userService.js` (lines 29-53)

An HMAC signing mechanism was added to protect privileged roles. However:

1. **The HMAC secret is generated client-side** (line 33-36): When `VITE_SESSION_SECRET` is not set (which it isn't in production -- it is not in `.env`), a random UUID is generated and stored in `sessionStorage`. This secret is accessible to the same attacker who would modify localStorage.

2. **The secret is in sessionStorage**: An attacker can read it directly:
   ```javascript
   const secret = sessionStorage.getItem('elab_session_secret');
   // Now attacker can forge any HMAC signature
   ```

3. **Race condition on load**: `getCurrentUser()` (synchronous, line 242) runs before `verifySession()` (async, line 263). During this window, the downgraded user object is already in React state.

4. **Bypass is trivial**: The attacker can either (a) read the sessionStorage secret and forge a valid HMAC, or (b) simply set the secret and signature together.

### FINDING AUTH-03: Hardcoded Admin Password Hash (HIGH)

**File**: `/src/services/userService.js` (line 91)
**File**: `/.env` (line 32)

```
passwordHash: 'c56bcbd957d6f0de92aba70b0ae029f9166909c7f9bf56376c313e1b993d4273'
VITE_ACCESS_HASH=c56bcbd957d6f0de92aba70b0ae029f9166909c7f9bf56376c313e1b993d4273
```

- The admin password hash is hardcoded in source code (shipped to every client in the JS bundle)
- The same hash is used as `VITE_ACCESS_HASH` for the PasswordGate
- SHA-256 without salt -- vulnerable to rainbow table / dictionary attacks
- Because it's in the Vite bundle (client-side), anyone can extract it from the deployed JS

### FINDING AUTH-04: PasswordGate Bypassable via sessionStorage (HIGH)

**File**: `/src/components/PasswordGate.jsx` (lines 40-44)

```javascript
if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    setIsAuthenticated(true);
    // ...
}
```

Bypass:
```javascript
sessionStorage.setItem('elab_authenticated', 'true');
location.reload();
```

The PasswordGate also accepts a cleartext password via URL parameter `?access=...` (line 48-63), which means the password could leak in server logs, browser history, or referrer headers.

### FINDING AUTH-05: Unsalted SHA-256 Password Hashing (HIGH)

**File**: `/src/services/userService.js` (lines 72-78)

Passwords are hashed with plain SHA-256 without any salt. This means:
- Identical passwords produce identical hashes
- Vulnerable to pre-computed rainbow tables
- No key stretching (bcrypt/scrypt/argon2 should be used)
- The hash comparison happens entirely client-side

### FINDING AUTH-06: Role Selection at Registration (MEDIUM)

**File**: `/src/components/auth/RegisterPage.jsx` (line 12, 35-42)

Users can self-select their role as "docente" (teacher) during registration. While the server-side code limits to `['user', 'docente']` (line 159 of userService.js), there is no verification that someone claiming to be a teacher actually is one. A child could register as a teacher and access teacher dashboards showing other students' data.

### FINDING AUTH-07: Weak Password Policy (LOW)

**File**: `/src/components/auth/RegisterPage.jsx` (line 24)

Minimum password length is only 6 characters. No requirements for:
- Uppercase/lowercase mix
- Numbers or special characters
- Password breach checking (HaveIBeenPwned)

---

## 2. Data Storage

### FINDING DATA-01: Entire User Database in localStorage (CRITICAL)

**File**: `/src/services/userService.js` (lines 17-26, 56-65)

ALL application data is stored in browser localStorage under these keys:
- `elab_db_users` -- All user accounts (names, emails, schools, cities, password hashes)
- `elab_db_posts` -- All social media posts
- `elab_db_groups` -- All community groups
- `elab_db_comments` -- All comments
- `elab_db_likes` -- All like data
- `elab_db_group_members` -- All group membership data
- `elab_db_notifications` -- All notifications
- `elab_current_user` -- Current session

**Impact**:
- Any script on the same origin can read ALL user data
- No encryption at rest
- Data persists indefinitely until manually cleared
- XSS attack would expose the entire "database"
- Shared/school computers would expose all previous users' data

### FINDING DATA-02: Children's PII Stored Client-Side (CRITICAL)

**File**: `/src/services/userService.js` (lines 162-186)
**File**: `/src/services/studentService.js` (lines 32-65)

PII collected and stored in localStorage for children:
- **Full name** (nome)
- **Email address** (email)
- **School name** (scuola)
- **City** (citta)
- **Password hash** (passwordHash)
- **Registration date** (dataRegistrazione)
- **Last access timestamp** (ultimoAccesso)
- **Emotional state / mood logs** (moods: 'frustrato', 'confuso', 'bloccato', etc.)
- **Learning difficulties** (difficolta)
- **Confusion levels** (confusione -- scale 0-10)
- **Session duration and activity tracking** (sessioni, tempoTotale)
- **Experiment completion records** (esperimenti)
- **Personal reflections/diary entries** (diario, meraviglie)

This data, especially emotional/psychological data about minors, is highly sensitive under GDPR Article 9 (special categories of personal data).

### FINDING DATA-03: Student Tracking Data Accessible to All (HIGH)

**File**: `/src/services/studentService.js` (lines 306-309)

```javascript
getAllStudentsData() {
    return getAllStudentData();
}
```

The `getAllStudentsData()` function reads ALL students' tracking data from localStorage with no access control. Any logged-in user (or anyone who bypasses auth, per AUTH-01) can call this function and access every child's emotional state, confusion levels, learning difficulties, and session data.

### FINDING DATA-04: No Data Encryption (MEDIUM)

All localStorage data is stored as plaintext JSON. On shared/school computers, any subsequent user can open DevTools and read all previous users' data including:
- Email addresses
- School names
- Learning difficulties and emotional states
- Chat history with the AI tutor

---

## 3. API Security

### FINDING API-01: Webhook URLs Hardcoded and Exposed (HIGH)

**File**: `/src/services/api.js` (line 9)
**File**: `/src/services/licenseService.js` (line 7)
**File**: `/src/services/notionService.js` (line 7)
**File**: `/src/components/simulator/api/AnalyticsWebhook.js` (line 7)
**File**: `/.env` (all lines)

All backend URLs are exposed in the client-side bundle:
```
https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat
https://n8n.srv1022317.hstgr.cloud/webhook/elab-license
https://n8n.srv1022317.hstgr.cloud/webhook/elab-admin
https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile
https://andreamarro.app.n8n.cloud/webhook/elab-simulator-analytics
```

These webhook URLs can be called by anyone without authentication. An attacker could:
- Send unlimited chat requests to the AI (cost abuse)
- Call the admin CRUD webhook (`elab-admin`) to read/modify Notion databases
- Call the compile endpoint to execute arbitrary Arduino code compilation
- Spam the analytics endpoint

### FINDING API-02: No Authentication on API Calls (HIGH)

**File**: `/src/services/api.js` (lines 131-145, 213-225)
**File**: `/src/services/notionService.js` (lines 64-116)

API calls to n8n webhooks include no authentication headers, no API keys, no bearer tokens. The only "security" is that the webhook URLs are not publicly documented, but they are embedded in the deployed JavaScript bundle accessible to anyone.

```javascript
// No auth header in any API call
const response = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
});
```

### FINDING API-03: Notion Database IDs Exposed (MEDIUM)

**File**: `/src/services/notionService.js` (lines 15-33)

14 Notion database IDs are hardcoded in client-side code:
```javascript
export const NOTION_DBS = {
    utenti: '7e2c3df4-dfb8-4978-adb3-ad83d6d3846b',
    orders: '70deebe9-b8bb-4f0b-b37c-71a3600077b8',
    fatture: '4a5e516f-2523-46ad-b8c4-dece2b4ec768',
    // ... 11 more
};
```

Combined with the unauthenticated admin webhook, an attacker could perform CRUD operations on any of these databases.

### FINDING API-04: Client-Side Rate Limiting Only (MEDIUM)

**File**: `/src/services/api.js` (lines 29-79)

Rate limiting is implemented client-side only:
- 3 messages per 10-second window
- 100 messages per session
- Stored in `sessionStorage` (trivially clearable)

An attacker can bypass this by:
1. Clearing sessionStorage
2. Opening a new tab
3. Calling the webhook URL directly (no client-side limits apply)

### FINDING API-05: Vercel OIDC Token Exposed (CRITICAL)

**File**: `/.vercel/.env.development.local` (line 2)

A full Vercel OIDC JWT token is stored in a local development file. While `.vercel` is in `.gitignore`, this token was present on disk at the time of audit. The JWT payload reveals:
- Project ID: `prj_Sm9JGt80Ivec3sMFAQ8abfz4UdnV`
- Owner: `andreas-projects-6d4e9791`
- Team ID: `team_23uD0RgdInaTaOPEL0EGltup`
- Plan: `hobby`

If this token were committed to version control or leaked, it could grant access to the Vercel project.

---

## 4. XSS / Injection Vulnerabilities

### FINDING XSS-01: dangerouslySetInnerHTML with AI Response (HIGH)

**File**: `/src/components/tutor/ElabTutorV4.jsx` (lines 1777-1779, 2578-2593)

```jsx
<div className="v4-bubble" dangerouslySetInnerHTML={{
    __html: formatMarkdown(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || ''))
}} />
```

The `formatMarkdown` function (line 2578) does sanitize `<`, `>`, `&`, `"` before applying markdown transformations. However:

1. **The sanitization order is correct** (escape first, then format), which is good.
2. **Risk from AI responses**: If the n8n webhook or AI backend is compromised, it could inject HTML that survives the sanitization. The `:::CODE:::` markers in `extractActions()` (line 379) are parsed from AI responses and could potentially be crafted maliciously.
3. **SafeMarkdown component exists but is NOT used here**: There is a properly safe `SafeMarkdown.jsx` component (line 3 says "Niente dangerouslySetInnerHTML") that renders markdown as React elements. This safe component is NOT used for the main chat display -- `dangerouslySetInnerHTML` is used instead.

### FINDING XSS-02: Other dangerouslySetInnerHTML Uses (MEDIUM)

Found in 5 locations:
1. `CodeBlock.jsx:124` -- `highlightLine()` output (code syntax highlighting)
2. `EditableAuthenticBlocks.jsx:57` -- User-provided values for content editing
3. `FormulaBlock.jsx:122` -- LaTeX rendered formula HTML
4. `AdminCommunity.jsx:919` -- Icon rendering
5. `ElabTutorV4.jsx:1777` -- AI chat responses (covered above)

Most of these process system-generated content, but `EditableAuthenticBlocks.jsx` processes user input (`value`) without visible sanitization.

### FINDING XSS-03: Social Post Content Not Sanitized at Input (LOW)

**File**: `/src/components/social/PostCard.jsx` (line 130)

Post content is rendered as `{post.contenuto}` using JSX text interpolation, which is safe (React auto-escapes). Comment content is also rendered safely with `{c.contenuto}` (line 157). This is correct -- JSX handles escaping automatically.

However, the post image field (`post.immagine`) is rendered directly as an `<img src>` (line 134). If an attacker could set `immagine` to a `javascript:` URI or a tracking pixel URL, it would be rendered.

### FINDING XSS-04: window.__ELAB_API Global Exposure (LOW)

**File**: `/src/services/simulator-api.js` (lines 35-42)

The simulator exposes a full global API on `window.__ELAB_API` that allows:
- Loading/changing experiments
- Starting/stopping simulation
- Setting editor code
- Calling the AI chat
- Taking screenshots

While this is intended for n8n/MCP integration, it means any injected script or browser extension can fully control the simulator.

---

## 5. External Dependencies

### FINDING DEP-01: Google Fonts Without SRI (LOW)

**File**: `/index.html` (lines 13-17)

```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

Google Fonts loaded without Subresource Integrity (SRI) hashes. While Google Fonts is generally trusted, a compromised CDN could serve malicious CSS. Note: SRI for Google Fonts CSS is impractical due to dynamic responses, so this is low risk.

### FINDING DEP-02: No CDN Scripts (POSITIVE)

No third-party JavaScript loaded from CDNs. All dependencies are bundled via Vite. This is a positive security practice.

### FINDING DEP-03: npm audit

Unable to run `npm audit` during this session (npm not found in shell path). Manual review of `package.json` would be recommended. The project uses React 19 + Vite 7 which are current versions.

---

## 6. COPPA Compliance Checklist

**Target audience**: Children ages 8-12 (explicitly stated in CLAUDE.md)

| Requirement | Status | Details |
|------------|--------|---------|
| Age gate / age verification | NOT IMPLEMENTED | No age check at registration or anywhere in the app |
| Verifiable parental consent | NOT IMPLEMENTED | No parental consent mechanism exists |
| Privacy policy | NOT IMPLEMENTED | No privacy policy linked anywhere |
| Data collection notice | NOT IMPLEMENTED | No notice about what data is collected |
| Right to review child data | NOT IMPLEMENTED | No mechanism for parents to review data |
| Right to delete child data | PARTIAL | Admin can delete users, but no parent-facing mechanism |
| Data minimization | VIOLATED | Collects mood, confusion levels, emotional states, school, city |
| Data security | VIOLATED | All data in plaintext localStorage, no encryption |
| Data retention limits | NOT IMPLEMENTED | Data persists indefinitely in localStorage |
| Third-party disclosure notice | NOT IMPLEMENTED | Data sent to n8n, no disclosure |
| Operator contact info | NOT IMPLEMENTED | No data protection officer or contact |

### FINDING COPPA-01: Complete Absence of COPPA Compliance (CRITICAL)

The application collects extensive personal information from children (ages 8-12) including:
- Names, emails, school names, cities
- Emotional/psychological data (mood logs, confusion levels, frustration tracking)
- Learning difficulties and behavioral patterns
- Session activity and time tracking

None of the following COPPA requirements are met:
1. No verifiable parental consent mechanism
2. No privacy policy
3. No age gate
4. No data minimization
5. No parental review/deletion capability
6. No data security measures

Under US law (COPPA), EU law (GDPR Article 8), and Italian law (D.Lgs. 196/2003), operating this application with child users in its current state would constitute a regulatory violation.

---

## 7. Additional Findings

### FINDING MISC-01: Device Fingerprinting of Children (HIGH)

**File**: `/src/services/licenseService.js` (lines 25-132)

The `generateDeviceFingerprint()` function collects extensive browser fingerprinting data:
- User agent, language, platform
- Screen resolution, color depth
- GPU vendor and renderer (WebGL)
- Canvas fingerprint
- AudioContext fingerprint
- Hardware concurrency, device memory
- Touch support, PDF viewer, Do Not Track

This creates a unique device identifier from children's browsers. Under GDPR, browser fingerprinting is considered personal data processing requiring consent. Under COPPA, this constitutes collection of persistent identifiers from children.

### FINDING MISC-02: Analytics Without Consent (MEDIUM)

**File**: `/src/components/simulator/api/AnalyticsWebhook.js` (lines 14-41)

Analytics events are sent to `https://andreamarro.app.n8n.cloud/webhook/elab-simulator-analytics` using `navigator.sendBeacon()` (fire-and-forget) without:
- User consent
- Opt-out mechanism
- Privacy notice
- Cookie/tracking banner

Events tracked: experiment_loaded, simulation_started/paused/reset, component_interacted, code_viewed, serial_used, volume_selected, errors.

### FINDING MISC-03: WebSocket Remote Control (LOW)

**File**: `/src/services/socketService.js` (lines 1-129)
**File**: `/src/hooks/useRemoteControl.js` (lines 1-1042)

A WebSocket-based remote control system connects to `ws://localhost:8080` and accepts commands to:
- Create/delete/modify pages and blocks
- Export projects and PDFs
- Execute arbitrary editor operations

While properly restricted to `localhost` only (line 11-15), if the app were ever deployed with this enabled, it would be a complete remote code execution vector. The localhost guard is correctly implemented.

---

## Risk Matrix

| ID | Finding | Severity | Exploitability | Impact |
|----|---------|----------|---------------|--------|
| AUTH-01 | Client-side auth | CRITICAL | Trivial (F12) | Full system access |
| AUTH-02 | Ineffective HMAC | CRITICAL | Trivial | Admin impersonation |
| AUTH-03 | Hardcoded password hash | HIGH | Easy (view source) | Password compromise |
| AUTH-04 | PasswordGate bypass | HIGH | Trivial (F12) | Application access bypass |
| AUTH-05 | Unsalted SHA-256 | HIGH | Moderate | Password cracking |
| AUTH-06 | Self-selected roles | MEDIUM | Easy | Privilege escalation |
| AUTH-07 | Weak password policy | LOW | N/A | Weak passwords accepted |
| DATA-01 | localStorage database | CRITICAL | Trivial | Full data exposure |
| DATA-02 | Children's PII exposed | CRITICAL | Trivial | Privacy violation, legal risk |
| DATA-03 | No access control on student data | HIGH | Easy | Children's emotional data exposed |
| DATA-04 | No encryption | MEDIUM | Trivial | Data readable on shared computers |
| API-01 | Hardcoded webhook URLs | HIGH | Easy (view source) | Cost abuse, data access |
| API-02 | No API authentication | HIGH | Trivial | Unrestricted API access |
| API-03 | Notion DB IDs exposed | MEDIUM | Easy | Database manipulation |
| API-04 | Client-side rate limiting | MEDIUM | Trivial | Rate limit bypass |
| API-05 | Vercel token on disk | CRITICAL | Requires disk access | Deployment compromise |
| XSS-01 | dangerouslySetInnerHTML chat | HIGH | Moderate (needs AI compromise) | Script injection |
| XSS-02 | Other innerHTML uses | MEDIUM | Moderate | Content injection |
| XSS-03 | Image src injection | LOW | Easy | Tracking/phishing |
| XSS-04 | Global API exposure | LOW | Easy | Simulator manipulation |
| DEP-01 | Fonts without SRI | LOW | Difficult | CSS injection |
| COPPA-01 | Zero COPPA compliance | CRITICAL | N/A | Legal/regulatory violation |
| MISC-01 | Device fingerprinting | HIGH | Automatic | Privacy violation |
| MISC-02 | Analytics without consent | MEDIUM | Automatic | GDPR violation |
| MISC-03 | WebSocket remote control | LOW | Localhost only | Remote control (dev only) |

---

## Recommendations (Priority Order)

### P0 -- MUST FIX Before Any Child Uses This Application

1. **Implement server-side authentication**: Move ALL auth logic to the backend (n8n or a proper auth service like Firebase Auth, Supabase Auth, or Auth0). Never store user databases in localStorage.

2. **Remove all child PII from client storage**: Emotional/psychological data (moods, confusion levels, difficulties) must be stored server-side with proper access controls, encryption at rest, and audit logging.

3. **Add COPPA compliance mechanisms**:
   - Age gate at registration
   - Verifiable parental consent workflow
   - Privacy policy
   - Data deletion mechanism for parents
   - Data minimization (do you really need mood/frustration tracking for 8-year-olds?)

4. **Add authentication to API endpoints**: All n8n webhooks must validate a server-issued token. Never expose unauthenticated CRUD endpoints.

5. **Rotate the admin password hash**: The current hash is in the source code. Change the password and never commit hashes to source.

### P1 -- Should Fix Soon

6. **Use bcrypt/argon2 for password hashing**: Replace unsalted SHA-256 with proper password hashing with per-user salts.

7. **Add SRI hashes** where feasible for external resources.

8. **Replace dangerouslySetInnerHTML** in the chat component with the existing SafeMarkdown component.

9. **Add consent for analytics**: Implement an opt-in/opt-out mechanism for the analytics webhook.

10. **Remove device fingerprinting** or add explicit consent with parental approval.

### P2 -- Should Fix Eventually

11. **Remove Notion database IDs from client code**: Use an API proxy that maps short names to database IDs server-side.

12. **Implement proper role verification**: Teacher roles should require admin approval, not self-selection.

13. **Add Content Security Policy headers**: Configure CSP in Vercel to prevent inline script execution.

14. **Implement proper session management**: Use HTTP-only, Secure, SameSite cookies with server-issued tokens.

---

## Conclusion

The ELAB Tutor application in its current state has **fundamental architectural security flaws** that make it unsuitable for use by children. The localStorage-based authentication and data storage can be trivially bypassed by anyone with basic browser knowledge (F12 key). The application collects sensitive emotional/psychological data about minors without any consent mechanisms, encryption, or access controls.

**The application must not be deployed for use by children until P0 items are addressed.**

The previous audit finding that "auth falsifiable from DevTools" is confirmed and expanded: not only is authentication falsifiable, but the entire user database, all social content, all student tracking data (including emotional states and learning difficulties), and all admin functions are accessible to anyone who opens the browser developer tools.

---

*Report generated by AGENT-08 (Security Engineer) -- 2026-02-13*
*Methodology: Static code analysis, architecture review, COPPA/GDPR-Kids checklist*
*No code was modified during this audit.*
