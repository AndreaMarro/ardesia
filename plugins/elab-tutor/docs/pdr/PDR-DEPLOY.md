# PDR Deploy — Strategia deploy ELAB Tutor

**Live**: https://www.elabtutor.school
**Provider**: Vercel (frontend) + Supabase (backend)
**Deploy attuale 2026-04-25**: main @ post-PR #33

---

## Frontend Vercel

### Comando standard
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build
npx vercel --prod --yes --archive=tgz
```

**Note**: `--archive=tgz` è necessario perché file count > 15000 (94 lesson-paths + 37 capitoli + node_modules etc.).

### Pipeline
1. `npm run build` → Vite build → `dist/`
2. PWA precache 32 entries (~4.8MB)
3. Vercel upload archive
4. Deployment URL preview
5. Promote to prod alias `elabtutor.school`

### Verifica post-deploy
```bash
curl -sI https://www.elabtutor.school | head -3
# expect: HTTP/2 200
```

### Rollback
```bash
npx vercel ls --prod   # list deployments
npx vercel promote <deploy-url> --scope andreamarro
```

---

## Backend Supabase

### Edge Functions deploy
```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
```

### Functions live
- `unlim-chat` (chat AI core)
- `unlim-diagnose` (circuit troubleshoot)
- `unlim-hints` (hint generator)
- `unlim-tts` (TTS proxy Voxtral)
- `unlim-gdpr` (data export/delete)

### Functions infra (post Sprint Q wire-up)
- `unlim-chat` riceve Capitolo context via `_shared/capitoli-loader.ts`
- `_shared/capitoli.json` aggiornato via `node scripts/aggregate-capitoli-for-edge.mjs`

### Migrations Supabase DB
```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked
```

Tabelle critiche:
- `sessions` (esperimenti completati)
- `nudges` (suggerimenti UNLIM)
- `lesson_contexts` (Capitolo context)
- `openclaw_tool_memory` (Sprint 6+)
- `together_audit_log` (Sprint 6+)

---

## Environment

### Variables Vercel
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE` (Render UNLIM URL fallback)
- `VITE_ENABLE_MORPHIC_L3=false` (DEV-FLAG, mai true prod)

### Variables Supabase Edge Functions
- `GEMINI_API_KEY` (Google EU endpoint when fixed Q3 GDPR)
- `TOGETHER_API_KEY` (gated student runtime post Q3 fix)
- `LLM_PROVIDER` (default: gemini, fallback together)
- `ELAB_API_KEY` (verify chiave header)
- `CONSENT_MODE` (soft/strict/off)

---

## Pre-deploy checklist

```bash
# 1. Tests
npx vitest run                  # >= 12498 PASS

# 2. Build
npm run build                   # OK

# 3. Type check + lint
npm run lint

# 4. Bundle size audit
ls -la dist/assets/*.js | sort -k5 -n -r | head -3

# 5. PWA validation
ls dist/sw.js dist/workbox-*.js

# 6. Env check
test -n "$SUPABASE_ACCESS_TOKEN" || echo "WARN: SUPABASE_ACCESS_TOKEN not set"

# 7. Git status clean
git status --short

# 8. On main branch
git branch --show-current
```

---

## Deploy strategy per environment

### Production
- Manuale via `npx vercel --prod`
- Andrea OK esplicito (CLAUDE.md regola immutabile)
- Smoke test post-deploy 24h

### Preview branch
- Auto su ogni branch push
- URL `<branch-name>.elabtutor.school` o Vercel-generated
- Per testing PR pre-merge

### Staging Supabase (post Mac Mini Livello 5)
- Local Supabase Docker
- Edge Functions via `supabase functions serve`
- Test pre deploy production

---

## Monitoring post-deploy

- Vercel Analytics (Real User Monitoring)
- Supabase Logs (Edge Functions)
- Sentry (errori frontend, se configurato)
- PostHog (events, sessioni)
- Watchdog (`automa/watchdog/anomalies.log`)

### Alert thresholds
- HTTP 500 rate > 1% in 5 min → alert
- Build duration > 180s → investigate
- Bundle main > 1500KB → reject

---

## Rollback playbook

### Frontend rollback
1. `npx vercel ls --prod` → identify previous deploy SHA
2. `npx vercel promote <url>` → restore
3. Verify HTTP 200 + smoke test
4. Document incident `docs/incidents/YYYY-MM-DD-rollback.md`

### Backend Edge Function rollback
1. `npx supabase functions deploy unlim-chat --version <previous-tag>`
2. Verify smoke test
3. Document incident

### DB migration rollback
- Migrations idempotent + reversible (down scripts)
- Mai `--include-all` su prod senza dry-run

---

**Verdetto**: pipeline matura, rollback granulare, monitoring in place.
