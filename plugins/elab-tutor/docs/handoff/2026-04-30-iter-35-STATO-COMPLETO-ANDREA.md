# Iter 35 — Stato completo per Andrea (linguaggio semplice)

**Data**: 2026-04-30 PM
**Branch**: `e2e-bypass-preview`
**Score iter 35 ONESTO**: ~8.0/10 (pending verifica deploy)

---

## 1. BUG SISTEMATI iter 35 (codice)

| # | Bug | Stato | File |
|---|-----|-------|------|
| 1 | Compile server 502 (path sbagliato `/compile` invece `/webhook/compile`) | ✅ FIX | `.env.production` punta ora a compile-proxy Edge Function |
| 2 | Blockly editor crash (errore non diagnosticabile) | ✅ FIX parziale | ScratchErrorBoundary cattura stack + dettagli prod (clic "Dettagli tecnici") |
| 3 | Onniscenza variable `safeSessionId` undefined (latente quando attivato) | ✅ FIX | rinominato `sessionId` |
| 4 | Lavagna persistence "premi Esci scritti spariscono" (claim fix iter 34 era dead code) | ✅ FIX | aggiunto `lastLocalSaveAtRef.current = Date.now()` 5 punti |
| 5 | Fumetto popup bloccato browser (await dynamic import rompeva user gesture) | ✅ FIX | static import sync |
| 6 | Wake word "Ehi UNLIM" silent fail su mic permission denied | ✅ FIX | toast docente "Microfono non autorizzato" |
| 7 | UNLIM tabs sovrapposizione | ✅ FIX iter 34 verificato |
| 8 | Lavagna bianca Libero blank | ✅ FIX iter 34 verificato |
| 9 | Crash UNLIM panel (activeTab persisted broken) | ✅ FIX iter 34 verificato |
| 10 | Capitoli scroll/crash | ✅ FIX iter 35 verificato (CSS classi mancanti) |
| 11 | Passo Passo icon size | ⚠️ FIX parziale (icona 18→24px), pannello NON resizable/draggable |

---

## 2. BUG RIMASTI (carryover iter 36+)

### P0 (alta priorità)

**A. n8n compile workflow broken server-side**
- Tipo: **INFRA**, NON codice
- Sintomo: anche fix path 502, n8n risponde HTTP 200 ma `errors:"Errore di compilazione"` per qualsiasi codice (anche blink valido)
- Causa probabile: arduino-cli su n8n.srv1022317.hstgr.cloud crashed / non installato / workflow disabilitato
- **Cosa serve da te**: SSH Hostinger → n8n dashboard → check compile workflow status → restart o reinstalla arduino-cli

**B. Onnipotenza ClawBot 62-tool dispatcher NOT wired prod**
- Sintomo: "tantissime azioni non sono fatte o non fatte con precisione"
- Causa: LLM produce `[INTENT:{...}]` JSON ma server-side Edge Function non parsa, solo browser interpreta `[AZIONE:...]` legacy
- Stima fix: ~250 LOC + ADR + 8 test (multi-day)
- **Cosa serve da te**: nulla, gestisco iter 36

**C. Fumetto stub session minimo**
- Sintomo: fumetto si apre ma `messages: []` `errors: []` → solo intro + lessonPath
- Causa: stub fallback non simula contenuto reale
- **Cosa serve da te**: completa un esperimento + interagisci UNLIM almeno 2-3 volte → fumetto si arricchisce

**D. Cronologia sessioni Edge Function non deployata**
- Sintomo: descrizione UNLIM-generated mai mostrata, solo fallback locale
- Causa: `unlim-session-description` shipped come codice, NON deployato; manca colonna `description_unlim` Supabase
- **Cosa serve da te**: deploy `supabase functions deploy unlim-session-description --project-ref euqpdueopmlllqjmqnyb` + `ALTER TABLE unlim_sessions ADD COLUMN description_unlim TEXT NULL;`

### P1 (media priorità)

**E. Glossario standalone Tea NON portato app principale**
- Card "Glossario" in HomePage rimanda a `#lavagna` invece di pagina dedicata
- Stima fix: ~600 LOC port da `elab-tutor-glossario.vercel.app`

**F. Blockly diagnostic cattura ma non risolve crash**
- ScratchErrorBoundary ora cattura stack ma error reale Blockly 12.4.1 non corretto
- **Cosa serve da te**: quando vedi "Errore nell'editor blocchi" clic "Dettagli tecnici" + invia screenshot stack → posso fixare

**G. Routing Gemini Flash-Lite primary NON attivo prod**
- Codice 4-way routing GREEN, env var serve update
- **Cosa serve da te**: `supabase secrets set LLM_ROUTING_WEIGHTS=50,15,15,20 --project-ref euqpdueopmlllqjmqnyb`

**H. Vision Gemini 2.5 Flash NON deployato prod**
- Codice + audit GREEN. Codice in `_shared/gemini-vision.ts` + `unlim-vision/index.ts`
- **Cosa serve da te**: `supabase functions deploy unlim-vision --project-ref euqpdueopmlllqjmqnyb`

### P2 (bassa priorità, multi-day)

- Lingua codemod 200 violazioni singolare→plurale (Andrea iter 21 mandate)
- Grafica overhaul colori + typeset
- Vol3 narrative refactor 92→140 lesson-paths (Davide co-author)
- 92 esperimenti audit Playwright UNO PER UNO (Andrea iter 21 mandate)
- STT CF Whisper format deeper debug (WAV/OGG try)
- Voice clone Davide narratore alternative

---

## 3. AZIONI ANDREA — checklist pratica

### URGENT (5-15 min)

- [ ] **Vercel redeploy frontend** post `.env.production` update (CMD+Shift+R hard refresh dopo deploy):
  ```bash
  cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
  npx vercel --prod --yes
  ```

- [ ] **Supabase deploy 2 Edge Functions** modificate:
  ```bash
  cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
  SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
  SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-vision --project-ref euqpdueopmlllqjmqnyb
  ```

- [ ] **n8n Hostinger fix compile** (INFRA, no codice):
  - SSH server Hostinger
  - n8n dashboard → workflow "compile" → verifica stato
  - Se workflow active: SSH → check arduino-cli installed (`arduino-cli version`)
  - Se arduino-cli broken: reinstall + test manualmente compile

### IMPORTANT (30 min — 1 h)

- [ ] **Migration Cronologia**:
  ```sql
  ALTER TABLE unlim_sessions ADD COLUMN IF NOT EXISTS description_unlim TEXT NULL;
  ```
  Supabase Dashboard SQL editor → run

- [ ] **Deploy unlim-session-description** Edge Function:
  ```bash
  SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-session-description --project-ref euqpdueopmlllqjmqnyb
  ```

- [ ] **Routing Gemini Flash-Lite primary**:
  ```bash
  npx supabase secrets set LLM_ROUTING_WEIGHTS=50,15,15,20 --project-ref euqpdueopmlllqjmqnyb
  ```

- [ ] **Compila PDF marketing V3** (manuale Overleaf):
  - Apri `docs/research/2026-04-30-iter-35-MARKETING-COSTI-V3.tex`
  - Upload Overleaf → compile xelatex → scarica PDF

### NICE-TO-HAVE (multi-day)

- [ ] PowerPoint Giovanni Fagherazzi (deadline manuale tua)
- [ ] Voice clone Davide narratore alternative (audio sample 6s IT)
- [ ] Test prod Playwright tutti 92 esperimenti UNO PER UNO

---

## 4. PROVIDER STACK ATTUALE (post iter 35 commit, pre-deploy)

| Capability | Provider | Region | Status |
|------------|----------|--------|--------|
| LLM primary | Mistral 65/25/10 (Small/Large/Together) | EU FR | ✅ LIVE |
| LLM lift iter 35 | Gemini Flash-Lite 50/15/15/20 (codice GREEN, env pending) | DE Frankfurt | ⚠️ PENDING env update |
| Vision primary | Gemini 2.5 Flash EU (codice GREEN iter 35) | DE Frankfurt | ⚠️ PENDING deploy |
| Vision fallback | Mistral Pixtral 12B | EU FR | ✅ LIVE |
| TTS primary | Voxtral mini-tts-2603 voice clone Andrea IT | EU FR | ✅ LIVE |
| TTS fallback | Microsoft Edge TTS Isabella | varia | ✅ LIVE |
| STT | Cloudflare Whisper Turbo | EU edge | ⚠️ Format MP3 issue carryover |
| ImgGen | Cloudflare FLUX schnell | EU edge | ✅ LIVE |
| Embeddings | Voyage AI voyage-3 | US (gated batch only) | ✅ LIVE (RAG ingest 1881 chunks) |
| Onniscenza 7-layer | aggregator opt-in `ENABLE_ONNISCENZA=true` | server EU | ✅ LIVE prod |
| ClawBot L2 templates | 20/20 templates pre-LLM | server EU | ✅ LIVE prod |
| ClawBot L1 composite | 5/5 tests PASS | server EU | ✅ LIVE prod |
| ClawBot L3 morphic | DEV-only flag | server EU | ❌ DEV only (mai prod) |
| Dispatcher 62-tool post-LLM | INTENT JSON parser | server EU | ❌ NOT WIRED (carryover) |

---

## 5. FILE MODIFICATI iter 35 (commit pendente)

```
M  .env.production                                        compile-proxy URL fix
A  docs/audits/2026-04-30-iter-35-bug-status-systematic-debug.md   Agent B audit
A  docs/audits/2026-04-30-iter-35-orchestrazione-coherence-audit.md Agent C audit
A  docs/research/2026-04-30-iter-35-MARKETING-COSTI-V3.tex Agent A PDF V3
M  src/components/lavagna/LavagnaShell.jsx                Fumetto sync + wake word listener
M  src/components/simulator/canvas/DrawingOverlay.jsx     Persistence lastLocalSaveAtRef
M  src/components/simulator/panels/ScratchCompileBar.jsx  Blockly diagnostic
M  src/services/wakeWord.js                               Wake word UI feedback
A  supabase/functions/_shared/gemini-vision.ts            Gemini Vision client NEW
M  supabase/functions/unlim-chat/index.ts                 safeSessionId fix
M  supabase/functions/unlim-vision/index.ts               Gemini primary + Pixtral fallback
```

---

## 6. NUMERI ONESTI iter 35

- Build: ✅ PASS 4m 11s
- Test: 13233 PASS baseline preservato
- Score onesto: 8.0/10 (G45 anti-inflation cap pending verifica deploy)
- Latency post Vision swap stimata: 4.5s p95 → 3.8s (-15%, MEASURE post-deploy)
- Cost AI 1k classi: $129.26 → $137.36 (+6%)
- GDPR: 3 EU primary diversificati (Mistral FR + Google DE + CF EU)

---

## 7. SE QUALCOSA NON VA — diagnostic

**Errore "Errore nell'editor blocchi"**:
1. Clicca "Dettagli tecnici" nel pannello errore
2. Apri DevTools (F12) → Console → digita `window.__elabBlocklyError`
3. Copia output + invia me

**Errore compile**:
1. Verifica `.env.production` deployato Vercel: ispeziona `https://www.elabtutor.school/` Source → cerca `VITE_COMPILE_WEBHOOK_URL`
2. Se ancora vecchio URL → Vercel cache, redeploy `--force`
3. Se nuovo URL ma errore: n8n broken → SSH Hostinger

**Lavagna persistence ancora rotta post deploy**:
1. F12 Console → digita `localStorage.getItem('elab-drawing-paths-EXP_ID')`
2. Se vuoto post-disegno: storage write fail (verificheremo)
3. Se pieno ma sparisce: remote sync ancora overwrite (deeper bug)

---

## 8. NEXT SESSION (iter 36+)

P0 multi-day:
1. Dispatcher 62-tool wire post-LLM (Onnipotenza completa)
2. n8n compile fix server-side (post Andrea SSH)
3. Wake word debug se ancora bug post toast feedback
4. 92 esperimenti audit Playwright UNO PER UNO

Score target iter 36: **8.5+/10 ONESTO** post:
- Vision Gemini deploy verifica live
- Routing Gemini Flash-Lite primary verifica latency drop
- n8n compile risolto Andrea
- Cronologia Edge Function deployed + UNLIM descriptions LIVE
