# ARDESIA V1 — security matrix

Snapshot mirato: 2026-07-10 · ARDESIA base `204ffefc`; standalone ELAB
consultato read-only a `7681789d` per il confine server.

Non contiene valori di segreti. Non è una scansione repository-wide esaustiva.

| ID | Superficie | Stato | Evidenza | Azione minima |
|---|---|---|---|---|
| S-001 | Credenziali hardcoded in script browser legacy | SECURITY HOLD, validità UNKNOWN | `plugins/elab-tutor/scripts/session18-fase1-components.mjs:12`; `session18-debug-renav.mjs:11` | determinare se account reale; rimuovere/parametrizzare; ruotare se valido; regression scan |
| S-002 | `VITE_ELAB_API_KEY` consumata client-side come “server-only secret” | SECURITY_RED verificato sul design; valore/validità UNKNOWN | plugin `api.js:47-52`, `multimodalRouter.js:213,323`, `fumettoGeminiService.js:168`, `voiceService.js:31`; standalone server `_shared/guards.ts:50-57` la dichiara security theater | rimuovere invio client; autenticazione utente/RLS dietro server boundary; nessun valore nel bundle |
| S-003 | `.env` root ignore | RED | `.gitignore` non contiene regola `.env*` | aggiungere deny rule preservando `.env.example` |
| S-004 | Secret scan enforcement | RED/PARTIAL | root CI esegue `bin/ci/secret_scan.py`, che passa ma non rileva S-001/S-002; nessun hook non-sample nella gitdir osservata | estendere test scanner + installazione documentata; niente bypass non autorizzato |
| S-005 | Chiave privata ToolHost storica | VERIFIED rimossa da HEAD / history risk | `f2fb36b2` è ancestor di HEAD; `apps/studio/sim/keys.json` contiene solo `pubkey` | verificare history e ruotare publisher identity se la chiave fu usata fuori test |
| S-006 | ToolHost same-origin `srcDoc` | RED/P1 architetturale | review `CODEX-SECURITY-REVIEW-TOOLHOST-SIGNING-HASH-2026-07-09.md` | first-party-only fino a origin/CSP boundary verificato |
| S-007 | Manifest/bundle post-install integrity | REPORTED/P1 | stessa review; alcune fix possono essere su branch non integrati | reverify `origin/main` e test tamper prima del mount terzi |
| S-008 | Supabase service-role nel client | UNKNOWN | nessun controllo console/provider completato | verificare bundle/config e provider; richiede accesso senza stampare valori |
| S-009 | RLS/tenant isolation | UNKNOWN | nessuna migration/policy o test tenant-negative tracked nello SHA | test policy su staging separato |
| S-010 | GitHub/Vercel/Supabase rotazione | BLOCKED_EXTERNAL | richiede account e azione esterna | Andrea conferma revoca/rotazione; nessun deploy automatico |

## Gate di uscita da SECURITY_RED

1. ogni valore credential-like classificato e invalidato/rimosso o provato
   non-segreto;
2. nessuna chiave privilegiata raggiunge bundle/browser;
3. history/provider rotation documentata senza valori;
4. `.env` e secret patterns bloccati da CI/hook testato;
5. ToolHost terzi resta disabilitato finché sandbox/origin e integrity non sono
   dimostrati;
6. RLS e tenant tests verdi su staging.
