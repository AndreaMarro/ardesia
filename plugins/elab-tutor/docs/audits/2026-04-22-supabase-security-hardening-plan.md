# Supabase security hardening — piano switch Supabase primary + Render fallback

**Data**: 2026-04-22
**Obiettivo**: spostare chat UNLIM da Render-primary a Supabase-primary in modo **sicuro**.
**Rationale utente**: "dobbiamo avere supabase sicuro" + "sistema deve usare supabase sicuramente, render solo fallback"

---

## 1. Stato attuale (verificato oggi)

### Routing prod
- `VITE_NANOBOT_URL="https://elab-galileo.onrender.com\n"` (Vercel env, trailing newline — `.trim()` lato client evita bug)
- `RENDER_FALLBACK = 'https://elab-galileo.onrender.com'` (hardcoded in `src/services/api.js:24`)
- Ordine fallback chain in `sendChat`: local server → nanobot (=Render primary) → Render `/chat` fallback → n8n webhook

Conseguenza: **tutti i messaggi UNLIM live vanno a Render**. Supabase Edge Function `unlim-chat` esiste (v15 ACTIVE) ma **non riceve traffico di produzione**.

### Supabase Edge Function (elab-unlim, ref `euqpdueopmlllqjmqnyb`)
| Function | Status | Version | Note |
|---|---|---|---|
| unlim-chat | ACTIVE | 15 | OK ma risposte intermittenti 503 in test manuale |
| unlim-diagnose | ACTIVE | 12 | non testato |
| unlim-hints | ACTIVE | 11 | non testato |
| unlim-tts | ACTIVE | 11 | non testato |
| unlim-gdpr | ACTIVE | 11 | non testato |
| unlim-wiki-query | ACTIVE | (sprint-4 Day 05) | scaffold nuovo |
| dashboard-data | ACTIVE | (sprint-3) | mock-mode |

### Secrets Edge Function (presenti)
- `GEMINI_API_KEY` + `GEMINI_API_KEY_FALLBACK`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ELAB_DB_URL`, `ELAB_DB_SERVICE_KEY`, `SUPABASE_DB_URL`
- `VPS_OLLAMA_URL`, `VPS_TTS_URL`

**Mancante**: `ELAB_API_KEY` (server-side secret per enforce X-Elab-Api-Key custom auth)

### Auth gateway Supabase
- **Gateway JWT verification**: attiva (default, no `--no-verify-jwt`)
- **Legacy JWT**: accettato (verificato con curl → HTTP 200)
- **`sb_publishable_*` key format**: rifiutato (`UNAUTHORIZED_INVALID_JWT_FORMAT`)

### Edge Function (application layer)
- CORS 7 origini ristretti (elabtutor.school, elab-tutor.it, localhost:5173/3000, vercel.app)
- Rate limit 30 req/min per sessionId (in-memory + Supabase persistent fallback)
- Body size check, message sanitization, circuit state sanitization
- Security headers OWASP-compliant (XSS, Frame-Options, Content-Type, Permissions-Policy)
- **Manca**: enforcement `X-Elab-Api-Key` — header listato nei CORS consentiti ma mai verificato in `unlim-chat/index.ts`

### Issue aperti di affidabilità
- 503 intermittente `"AI temporaneamente non disponibile"` — da investigare (Gemini quota? rate limit cascading? timeout?)

---

## 2. Rischi attuali + severità

| # | Rischio | Severità | Note |
|---|---|---:|---|
| R1 | Legacy anon JWT esposto in bundle client-side, nessun X-Elab-Api-Key check → chiunque può chiamare unlim-chat | **ALTO** | Mitigato solo da rate limit 30/min/sessionId (bypassabile con sessionId random) |
| R2 | Se `VITE_NANOBOT_URL` switchato a Supabase primary e 503 frequenti → UX peggiore (più loading, fallback chain lenta) | MEDIO | Render attualmente "just works" |
| R3 | Render primary = vecchio prompt, Principio Zero v3 VIOLATO in live | **ALTO** | Già documentato P1-002 |
| R4 | Anon key in Vercel env ha trailing `\n` (stessa cosa che aveva VITE_NANOBOT_URL) | BASSO | `.trim()` lato client gestisce, ma cleanup raccomandato |
| R5 | `ELAB_API_KEY` nome in guards.ts ma mai esistito come secret → `disable-jwt` non sbloccato | MEDIO | Aggiungerlo + enforce per difesa-in-profondità |
| R6 | Nessun monitoring per `unlim-chat` 503 rate in prod | MEDIO | Nessun PostHog / Sentry configurato per Edge |

---

## 3. Piano hardening (ordine esecuzione)

### Fase 1 — Layer application (Edge Function) — 30 min

**Goal**: enforce custom API key + improved rate limit.

**Task 1.1 — Generare ELAB_API_KEY**
```bash
openssl rand -hex 32     # genera 64-char hex
```
Conserva valore (es. `4f2c...`).

**Task 1.2 — Set secret Edge Function**
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase secrets set \
  ELAB_API_KEY=<generated-value> \
  --project-ref euqpdueopmlllqjmqnyb
```

**Task 1.3 — Aggiungi enforcement in `supabase/functions/_shared/guards.ts`**

Nuovo helper:
```typescript
export function verifyElabApiKey(req: Request): { ok: boolean; reason?: string } {
  const expected = Deno.env.get('ELAB_API_KEY');
  if (!expected) return { ok: true }; // fail-open se secret non impostato (deploy incrementale)
  const provided = req.headers.get('X-Elab-Api-Key') || '';
  if (provided !== expected) return { ok: false, reason: 'bad-api-key' };
  return { ok: true };
}
```

Chiamata nel handler di `unlim-chat/index.ts` (e altre funzioni che servono client pubblico):
```typescript
const apiKeyCheck = verifyElabApiKey(req);
if (!apiKeyCheck.ok) {
  return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: getSecurityHeaders(req) });
}
```

**Task 1.4 — Deploy Edge Function** (fail-open mode prima — enforcement triggerato solo se `ELAB_API_KEY` set; deploy immediato safe)
```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx supabase functions deploy unlim-chat \
  --project-ref euqpdueopmlllqjmqnyb
```

### Fase 2 — Layer client (frontend) — 20 min

**Goal**: invio `X-Elab-Api-Key` header e switch a Supabase primary.

**Task 2.1 — Aggiungere VITE_ELAB_API_KEY in Vercel**
```bash
echo "<generated-value>" | npx vercel env add VITE_ELAB_API_KEY production
```

**Task 2.2 — Update `src/services/api.js` `nanobotHeaders()`**

File ha già funzione `nanobotHeaders()` che include `apikey` e `Authorization`. Aggiungere:
```javascript
const ELAB_API_KEY = (import.meta.env.VITE_ELAB_API_KEY || '').trim();
// ...
function nanobotHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (key) {
    headers['apikey'] = key;
    headers['Authorization'] = `Bearer ${key}`;
  }
  if (ELAB_API_KEY) {
    headers['X-Elab-Api-Key'] = ELAB_API_KEY;
  }
  return headers;
}
```

**Task 2.3 — Update Vercel env `VITE_NANOBOT_URL`** 
```bash
# Remove old
npx vercel env rm VITE_NANOBOT_URL production --yes
# Add new (no trailing newline)
printf 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1' | \
  npx vercel env add VITE_NANOBOT_URL production
```

### Fase 3 — Test + deploy — 15 min

**Task 3.1 — Build locale + verify**
```bash
cd elab-builder-hotfix
npm run build
grep -E "X-Elab-Api-Key|Supabase" dist/assets/index-*.js | head
```

**Task 3.2 — Deploy frontend**
```bash
npx vercel --prod --yes
```

**Task 3.3 — Live verify con curl**
```bash
# Should 200 (API key correct)
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-jwt>" \
  -H "X-Elab-Api-Key: <generated-value>" \
  -d '{"message":"test","sessionId":"s1","experimentId":"v1-cap6-esp1"}'

# Should 401 (missing API key)
curl -X POST "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-jwt>" \
  -d '{"message":"test","sessionId":"s1"}'
```

**Task 3.4 — Live verify UNLIM Principio Zero v3**

Apri `https://www.elabtutor.school/#lavagna` con profile fresh, entra con chiave, apri chat, chiedi "Spiega il LED". Verifica che response contenga `"Ragazzi"` (plurale) e NON `"il tuo LED"`.

### Fase 4 — Rotate legacy anon JWT (OPZIONALE, alto-impatto) — 10 min

Dopo Fase 1-3 stabili:

1. Supabase Dashboard → Settings → API → Rotate anon JWT
2. Copy new JWT
3. Update Vercel `VITE_SUPABASE_ANON_KEY`
4. Redeploy frontend
5. Legacy JWT leaked in old bundle chunks invalidato

---

## 4. Cosa NON fare ora

- **Disable `--no-verify-jwt`**: sembra appetitoso ma richiede custom auth robust (X-Elab-Api-Key è complementare, non sostitutivo)
- **Toccare `service_role` key**: solo server-side, non deve uscire da secrets
- **Revocare legacy JWT prima di testare**: rompi UNLIM totalmente. Solo Fase 4 dopo Fase 1-3 confermati in prod.

---

## 5. Risk checklist deploy

Prima di ogni deploy Fase 1/2/3:
- [ ] Baseline vitest run PASS (CoV 3/3)
- [ ] `npm run build` PASS locale
- [ ] Curl test Edge Function con/senza X-Elab-Api-Key
- [ ] Verify inline safety net in built `dist/index.html` ancora presente
- [ ] Preview Vercel deploy testato prima di `--prod --yes`

Rollback:
- Fase 1 (Edge deploy): `supabase functions deploy unlim-chat` da commit precedente
- Fase 2 (client code): git revert + redeploy frontend
- Fase 3 (Vercel env): `vercel env` può ripristinare value precedente tramite console
- Worst case: rimettere `VITE_NANOBOT_URL=https://elab-galileo.onrender.com` → torna Render primary

---

## 6. Outcome atteso

Dopo Fase 1-3:
- UNLIM chat primary = Supabase Edge (con BASE_PROMPT Principio Zero v3)
- Render = fallback (se Supabase 503 o timeout)
- X-Elab-Api-Key enforced → attacchi diretti Edge bloccati
- Principio Zero v3 LIVE verificato — dovrebbe risolvere P1-002

Dopo Fase 4:
- Legacy anon JWT leaked in old bundle non più utilizzabile

---

## 7. Tempo totale stimato

| Fase | Tempo |
|---|---|
| 1 — Edge Function + secret | 30 min |
| 2 — Client code + Vercel env | 20 min |
| 3 — Build + deploy + verify | 15 min |
| 4 — Rotate legacy JWT | 10 min |
| **Totale** | **~75 min** |

---

## 8. Decisione richiesta Andrea

1. Procediamo ora Fase 1-3 (75min) oppure solo preparazione PR senza deploy?
2. Fase 4 (rotate JWT) — oggi o prossima sessione dedicata?
3. Se 503 Supabase intermittente persiste, continuiamo Supabase-primary (con Render fallback) oppure attendiamo fix reliability?

**Raccomandazione Claude onesta**: Fase 1-3 ha senso oggi perché:
- Render sta ancora servendo prompt vecchio (P1-002 acuto)
- Fallback chain automaticamente copre 503 transient Supabase
- X-Elab-Api-Key enforcement = vero valore security
- Fase 4 domani post-validazione Fase 1-3

Azione richiesta: conferma procedere con Fase 1-3.
