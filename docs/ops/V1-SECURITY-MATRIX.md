# ARDESIA V1 — security matrix

Snapshot mirato: 2026-07-10 · ARDESIA base `204ffefc`; standalone ELAB
consultato read-only a `7681789d` per il confine server.

Non contiene valori di segreti. Non è una scansione repository-wide esaustiva.

| ID | Superficie | Stato | Evidenza | Azione minima |
|---|---|---|---|---|
| S-001 | Credenziali hardcoded in script browser legacy | GREEN_SLICE locale / ROTATION UNKNOWN | i `plugins/elab-tutor/scripts/session18-*.mjs` col pattern `CREDS` inline ora leggono `ELAB_E2E_EMAIL`/`ELAB_E2E_PASSWORD`; `secret_scan.py` blocca nuovi `CREDS` email/password inline | ruotare se i valori storici erano account reali; history/provider non chiusi |
| S-002 | `VITE_ELAB_API_KEY` consumata client-side come “server-only secret” | SECURITY_RED verificato sul design; valore/validità UNKNOWN | plugin `api.js:47-52`, `multimodalRouter.js:213,323`, `fumettoGeminiService.js:168`, `voiceService.js:31`; standalone server `_shared/guards.ts:50-57` la dichiara security theater | rimuovere invio client; autenticazione utente/RLS dietro server boundary; nessun valore nel bundle |
| S-003 | `.env` root/Studio ignore | GREEN_SLICE in `codex/v1-security-s0-20260710` | `.gitignore` e `apps/studio/.gitignore` bloccano `.env`, `.env.local`, `.env.production`; preservano `.env.example`; `git check-ignore -v` verificato | resta da installare hook locale non bypassabile |
| S-004 | Secret scan enforcement | GREEN_SLICE locale / SECURITY_RED history | `bin/ci/secret_scan.py` rileva Google API key, JWT generici, named hex secret e `CREDS` email/password inline; CI esegue `bin/ci/test_secret_scan.py`; allowlist rimossa; `python3 bin/ci/secret_scan.py` restituisce no high-confidence secret patterns sul worktree S0 | resta euristica statica; rotazione/history/provider non chiusi; estendere hook |
| S-005 | Chiave privata ToolHost storica | VERIFIED rimossa da HEAD / history risk | `f2fb36b2` è ancestor di HEAD; `apps/studio/sim/keys.json` contiene solo `pubkey` | verificare history e ruotare publisher identity se la chiave fu usata fuori test |
| S-006 | ToolHost same-origin `srcDoc` | RED/P1 architetturale | review `CODEX-SECURITY-REVIEW-TOOLHOST-SIGNING-HASH-2026-07-09.md` | first-party-only fino a origin/CSP boundary verificato |
| S-007 | Manifest/bundle post-install integrity | REPORTED/P1 | stessa review; alcune fix possono essere su branch non integrati | reverify `origin/main` e test tamper prima del mount terzi |
| S-008 | Supabase service-role nel client | UNKNOWN | nessun controllo console/provider completato | verificare bundle/config e provider; richiede accesso senza stampare valori |
| S-009 | RLS/tenant isolation | UNKNOWN | nessuna migration/policy o test tenant-negative tracked nello SHA | test policy su staging separato |
| S-010 | GitHub/Vercel/Supabase rotazione | BLOCKED_EXTERNAL | richiede account e azione esterna | Andrea conferma revoca/rotazione; nessun deploy automatico |
| S-011 | Token-shaped legacy literals in tracked files | GREEN_SLICE locale / ROTATION UNKNOWN | finding precedentemente allowlistati sono stati redatti o parametrizzati; scan custom `google-api-key`/`generic-jwt`/`named-hex-secret` count 0; valori non riportati in doc/log | ruotare provider e valutare history; non usare questa rimozione come prova di non-esposizione passata |

## Gate di uscita da SECURITY_RED

1. ogni valore credential-like classificato e invalidato/rimosso o provato
   non-segreto;
2. nessuna chiave privilegiata raggiunge bundle/browser;
3. history/provider rotation documentata senza valori;
4. `.env` e secret patterns bloccati da CI/hook testato; il ratchet CI S0
   blocca nuovi Google API key/JWT/named hex secret/CREDS email-password e non
   richiede piu' allowlist per l'HEAD candidato, ma non chiude history/rotazione;
5. ToolHost terzi resta disabilitato finché sandbox/origin e integrity non sono
   dimostrati;
6. RLS e tenant tests verdi su staging.
