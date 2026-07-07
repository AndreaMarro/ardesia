# ARDESIA Entitlement Service (sandbox, GDPR-ready tecnico)

Port server-side (FastAPI, Python 3.12+) della logica local-first di
`apps/studio/src/entitlements/entitlementCore.ts`. **SANDBOX ONLY**: nessun
provider email reale, nessun segreto committato, storage file-based locale.
"GDPR-ready" qui è un claim **tecnico** (misure: pseudonimizzazione, export,
erasure, retention) — **non** un claim di conformità legale.

## Architettura

```
POST /license/register  (authority)  chiave ELAB-XXXX-XXXX-XXXX-XXXX generata
        │                            server-side, restituita UNA volta;
        ▼                            nello store solo sha256(chiave)
POST /license/redeem                 one-time → EntitlementRecord
        │                            {schoolId, classId, featureLookupKey, expiresAt}
        ▼
POST /token/issue                    token 128-bit CSPRNG, TTL 15 min, one-time;
        │                            consegna SOLO via MailSink sandbox
        ▼                            (var/outbox/outbox.jsonl, email → solo hash)
POST /token/redeem                   → sessionId NUOVO 128-bit (anti-fixation)

GET  /access?school_id&class_id&feature      check di scope
POST /entitlement/{id}/revoke  (authority)   revoca immediata
GET  /gdpr/export?subject_hash (authority)   export per soggetto pseudonimo
DELETE /gdpr/subject?subject_hash (authority) erasure
GET  /gdpr/retention · POST /gdpr/purge (authority)
```

Moduli (SOLID, dependency inversion):

- `core.py` — port 1:1 del core TS: stessi path (`entitlements/licenses/<keyHash>.json`,
  `entitlements/records/<id>.json`, `entitlements/tokens/<tokenHash>.json`,
  `entitlements/by-scope/<schoolId>/<classId>/<featureLookupKey>/latest.json`)
  e stesse shape camelCase: i due store sono interscambiabili.
- `store.py` — interfaccia astratta `Store` (read/write/delete puntuali) +
  `FileStore` KV su `var/data/`. Swap a Postgres/Redis = una nuova
  implementazione di 3 metodi, zero modifiche al core.
- `mail.py` — `MailSink` astratto; `JsonlMailSink` scrive la consegna in
  `var/outbox/outbox.jsonl` (**mai SMTP**). Nell'outbox: `toHash` (sha256
  dell'email) + token; l'indirizzo in chiaro non è MAI persistito.
- `audit.py` — audit trail append-only `var/data/audit.jsonl`, **soli hash e
  pseudonimi** (keyHash, tokenHash, entitlementId, subjectHash).
- `app.py` — FastAPI; `settings.py` — configurazione via env.

## Threat model (breve)

| Minaccia | Mitigazione |
| --- | --- |
| Enumerazione chiavi/token (oracolo di errore) | ogni causa di fallimento → **identico** `200 {"ok":false,"reason":"invalid"}` (sconosciuta = usata = scaduta = malformata); `/token/issue` → identico `{"ok":false}` |
| Furto dello store | chiavi e token MAI in chiaro: solo sha256; il DB rubato non dà accessi |
| Timing attack sul confronto hash / API key | `hmac.compare_digest` (constant-time), API key confrontata su digest a lunghezza fissa |
| Replay del token | one-time (`used=true` al primo redeem valido) + TTL 15 min |
| Session fixation | il token non è mai l'identificatore di sessione: sessionId 128-bit NUOVO a ogni redeem |
| Abuso del piano authority | header `X-API-Key` == env `ENTITLEMENT_API_KEY`; se l'env manca → 503 deny-by-default (nessuna chiave di fabbrica, MAI hardcoded) |
| Path traversal nel KV | `FileStore` rifiuta path assoluti e `..` |
| Leak PII nei log/persistito | email mai persistita (solo sha256 normalizzato = `subject_hash`); l'export GDPR non rigurgita token in chiaro |

Fuori scope (dichiarato, come nel core TS): provider email reale (gate-Andrea),
licenza firmata ed25519, rate limiting di superficie, TLS/deploy.

## GDPR-ready tecnico (non claim legale)

- **Pseudonimizzazione**: il soggetto è identificato SOLO da
  `subject_hash = sha256(email.strip().lower())`.
- **Export (art. 15/20)**: `GET /gdpr/export?subject_hash=…` restituisce le
  entry outbox (token redatto in hash) e audit del soggetto.
- **Erasure (art. 17)**: `DELETE /gdpr/subject?subject_hash=…` rimuove le
  entry del soggetto da outbox e audit; resta un solo evento `gdpr.delete`
  con il pseudonimo come prova di avvenuta cancellazione.
- **Retention**: `ENTITLEMENT_RETENTION_DAYS` (default **30 giorni**);
  `POST /gdpr/purge` rimuove da audit e outbox le entry più vecchie del
  cutoff. `GET /gdpr/retention` espone il valore configurato.
- **Audit trail**: append-only JSONL; le uniche riscritture sono erasure e
  retention (documentate qui). Contiene esclusivamente hash/pseudonimi.

## Configurazione (env)

| Variabile | Default | Note |
| --- | --- | --- |
| `ENTITLEMENT_API_KEY` | _(assente)_ | obbligatoria per il piano authority; senza → 503 |
| `ENTITLEMENT_DATA_DIR` | `var/data` | root del KV + `audit.jsonl` |
| `ENTITLEMENT_OUTBOX_DIR` | `var/outbox` | outbox sandbox `outbox.jsonl` |
| `ENTITLEMENT_RETENTION_DAYS` | `30` | retention audit/outbox |

## Come girare

```sh
cd services/entitlement

# test (TDD: 51 test — anti-enumerazione, one-time, TTL, revoke, GDPR)
uv run pytest -q

# server di sviluppo (sandbox)
ENTITLEMENT_API_KEY="scegli-una-chiave-locale" \
  uv run uvicorn entitlement_service.app:app --port 8390
```

Esempio flusso completo (feature sandbox `tutor-monthly-15eur`):

```sh
curl -s -X POST localhost:8390/license/register \
  -H "X-API-Key: $ENTITLEMENT_API_KEY" -H 'content-type: application/json' \
  -d '{"schoolId":"scuola-1","classId":"3B","expiresAt":1790000000000}'
# → {"ok":true,"licenseKey":"ELAB-....","keyHash":"…"}

curl -s -X POST localhost:8390/license/redeem \
  -H 'content-type: application/json' -d '{"licenseKey":"ELAB-...."}'
# → {"ok":true,"entitlement":{...}}   (fallimento: {"ok":false,"reason":"invalid"})

curl -s -X POST localhost:8390/token/issue \
  -H 'content-type: application/json' \
  -d '{"entitlementId":"…","email":"docente@example.invalid"}'
# → {"ok":true}; il token è nella "mail" sandbox: var/outbox/outbox.jsonl

curl -s -X POST localhost:8390/token/redeem \
  -H 'content-type: application/json' -d '{"token":"…"}'
# → {"ok":true,"session":{"sessionId":"…","entitlementId":"…"}}

curl -s 'localhost:8390/access?school_id=scuola-1&class_id=3B'
# → {"access":true}
```
