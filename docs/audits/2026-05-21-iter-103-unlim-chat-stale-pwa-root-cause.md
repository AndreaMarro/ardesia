# Iter 103 — UNLIM chat "ci sta mettendo un po' troppo" — root cause

**Data:** 2026-05-21 · **Metodo:** systematic-debugging (superpowers) · **Sessione:** Claude Desktop (Opus)

## Sintomo

Screenshot Andrea: ogni messaggio nella chat UNLIM (Lavagna, modalità "Già Montato") →
errore *"UNLIM ci sta mettendo un po' troppo. Riprova tra qualche secondo."* + bottone Riprova.
3/3 messaggi consecutivi falliti.

## Root cause — CONFERMATA

Build frontend **vecchia servita dalla cache del PWA service worker**.

Catena causale:
1. iter 70 (5 giorni fa) ha ruotato `VITE_ELAB_API_KEY` (Vercel Production + secret Edge Function).
2. Una build frontend anteriore alla rotazione ha la **chiave vecchia** bundlata.
3. Il service worker del browser di Andrea continuava a servire quella build vecchia.
4. La build vecchia POSTa a `unlim-chat` con `X-Elab-Api-Key` vecchio → Edge → **HTTP 401**.
5. `tryNanobot` (`src/services/api.js:395`) ingoia il 401: `if (!res.ok) return null`.
6. `sendChat` cade nei fallback legacy (Render `/chat`, webhook n8n) → impiccano.
7. **Master timeout 25s** (`MASTER_TIMEOUT_TEXT`) → `friendlyError` ramo AbortError → la stringa "ci sta mettendo un po' troppo".

**Verifica:** Andrea hard-refresh → SW aggiornato alla build attuale → UNLIM funziona. ROOT CAUSE CONFERMATA.

Spiega tutto: persistente 3/3 (build stale = sempre chiave sbagliata), OK da browser pulito, OK dopo refresh.

## Evidenze raccolte (browser pulito Playwright — tutto OK)

- Edge `unlim-chat`: GET health 200/0.27s; POST chat 200/3.0s; 3× richiesta deep 200/0.4-1.1s.
- Browser `#chatbot-only`: chat OK 200, risposta corretta.
- Browser `#lavagna` Percorso + Già Montato: chat OK 200, risposta corretta (screenshot `iter103-unlim-working-proof.png`).
- Edge curl SENZA `X-Elab-Api-Key` → **401 `missing X-Elab-Api-Key header`** (l'Edge NON fa fail-open).
- `_isSupabaseEdge` = true in prod (`VITE_NANOBOT_URL` = `...supabase.co/functions/v1`) → endpoint corretto, non è un 404.
- Codice chat (`tryNanobot` / `nanobotEndpoint` / `sendChat`) vecchio e stabile (git blame 12/04 + 10/03) — **nessuna regressione di codice**. Il merge train iter 103 NON è la causa (#139 ha toccato `api.js` solo nel path `compileCode`).

## Bug secondari trovati

1. **`tryNanobot` maschera il 401 da timeout.** Ingoia lo status HTTP → l'utente vede un finto "timeout/riprova" invece di "ricarica la pagina". Una build stale è così **non auto-diagnosticabile**: l'utente riprova all'infinito invece di ricaricare.
2. **`VITE_API_TIMEOUT=60000` su Vercel è inefficace.** `boundedTimeout(v, 25000, 30000)` → cap a 30000; e il limite reale è `MASTER_TIMEOUT_TEXT`=25s da `VITE_UNLIM_MASTER_TIMEOUT_TEXT_MS` (non settata). Il tentativo di fix via env non ha avuto effetto.
3. **Env var Vercel con trailing `\n`** (`VITE_API_TIMEOUT="60000\n"`, `VITE_N8N_CHAT_URL="...\n"`) — il codice le `.trim()`/`parseInt`, quindi reggono, ma indica env entrate con newline.
4. **Edge `uptimeSeconds:0`** su ogni GET — warmup non efficace, cold start frequenti (non causa del 401 ma rumore di latenza).

## Fix proposti

- **A (chirurgico, raccomandato):** `tryNanobot` su 401/403 → propaga l'errore auth invece di `return null` → `sendChat`/`friendlyError` mostrano il messaggio 401 GIÀ ESISTENTE (`api.js:617`) "Ricarica la pagina e riprova." → una build stale diventa **auto-curante** (l'utente ricarica → build fresca). TDD + Codex Pattern V + CoV.
- **B (hardening PWA):** `UpdatePrompt` montato app-wide (ora solo in `LavagnaShell:1403`) + check update SW periodico → gli utenti ricevono le build nuove senza refresh manuale.
- **C (env):** ripulire il trailing `\n` nelle env var Vercel Production.

## Caveat onestà

- **Incidente acuto già risolto** dal hard-refresh di Andrea. Fix A/B/C = hardening per evitare che altri utenti (docenti in aula) cadano nella stessa trappola.
- Root cause confermata via il test di Andrea (hard-refresh → funziona), **non riprodotta direttamente** da me: lo stato stale era già sparito dopo il refresh. La catena è però coerente con ogni evidenza raccolta.
