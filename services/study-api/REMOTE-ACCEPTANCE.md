# Controlled remote synthetic acceptance

`study_api.remote:create_remote_app` runs the existing Core, routes, PostgreSQL
adapter, RLS, resources, submissions and receipts. It is an explicitly selected
synthetic acceptance profile. It does not remove the default `synthetic_only`
guard, enable ordinary production identities/consent, migrate/seed the database,
or certify backup/restore. The default `create_app` and `SupabaseRuntime` remain
loopback-only.

The Uvicorn factory is `study_api.remote:app_from_env`. From the repository root:

```sh
PYTHONPATH=packages/engine:services/study-api uv run --project services/study-api uvicorn study_api.remote:app_from_env --factory --host 127.0.0.1 --port 5321 --no-access-log
```

Supply these environment variables through private service configuration:

| Variable | Contract |
| --- | --- |
| `ARDESIA_MODE` | Exactly `SYNTHETIC_ACCEPTANCE`. |
| `ARDESIA_API_URL` | Exactly `https://gavfmrynhsdxdqbmdkxq.supabase.co`. |
| `ARDESIA_DB_URL` | TLS PostgreSQL URL. Session pooler `aws-1-eu-central-1.pooler.supabase.com`, port 5432, user `ardesia_runtime.gavfmrynhsdxdqbmdkxq`; or direct `db.gavfmrynhsdxdqbmdkxq.supabase.co`, user `ardesia_runtime`, port 5432. Require `sslmode=require`, `verify-ca` or `verify-full`. Only `sslrootcert` and `connect_timeout` extra query options accepted; timeout 10 seconds added if absent. |
| `ARDESIA_ANON_KEY` | Project's public Auth API key, retained on the server. |
| `ARDESIA_APP_ORIGINS` | Comma-separated exact canonical HTTPS origins. No trailing slash, path, credentials, wildcards, IP hosts, or non-443 port. These also define the exact allowed Host headers. |
| `ARDESIA_RELEASE_SHA` | Full 40-character lowercase source Git SHA supplied by the release process. |
| `ARDESIA_DATA_DIR` | Private writable service working directory. No second SQLite store is created. |
| `ARDESIA_SERVICE_ROLE_KEY` | Optional private key used only for compensating a failed original upload. Without it, removal explicitly raises503 `media_compensation_unavailable`; the existing durable upload intent stays retryable, never a successful cleanup. |

Use a trusted TLS endpoint/proxy that supplies HTTPS to ASGI and preserves the
canonical Host and browser Origin. Configure forwarded-header trust for the
actual proxy addresses; do not trust arbitrary clients or use a wildcard trust
configuration. HTTP and unallowlisted Host requests are denied. Wrong/duplicate
Origins are denied on all methods; unsafe methods also require an Origin.
Denial precedes receiving request bodies, body-budget acquisition, Auth or DB.
Both middleware boundaries share the same policy. No CORS or redirect flow is
added, and the Auth HTTP client refuses provider redirects.

`POST /study/session/login` accepts JSON `{ "email": "…", "password": "…" }`
only in this profile. Body admission and the bounded request-rate/store admission
precede Auth. Password exchange is followed by real Auth `GET /auth/v1/user`, then
the existing DB JWT/session context and `ardesia_private.actor_id()` authority.
Identity still requires the canonical `auth.sessions` and actor binding checks.
The successful response is `{id, role, synthetic: true, authentication:
"supabase"}`; tokens and credentials are not returned. The existing
`POST /study/session {token}` remains compatible. Login recovers with a stale
cookie, and normal logout/revoke-all/rejected-cookie handling stays shared.

`study_session` remains host-only, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`
and bounded to 3600 seconds. No refresh token is kept and no automatic refresh,
signup, password-reset or email delivery flow is implemented. Failed credential
validation returns a fixed error instead of echoing the credential body.

`GET /study/health` adds `mode: SYNTHETIC_ACCEPTANCE`, `syntheticOnly: true`,
`productionReady: false`, `releaseSha`, and `capabilities.passwordLogin: true`.
This is declared release identity, not cryptographic deployment attestation.
Teacher `/study/ops/health` still reports backup `NOT_YET_VERIFIED` with503.

Session pooling is required because the canonical adapter sets connection-level
JWT and role state; transaction pooler 6543 is rejected. The private connection
role must stay `NOINHERIT NOBYPASSRLS` and only switch to `ardesia_app`. Schema,
role privileges, synthetic actor provisioning, actual TLS transport, hosted
isolation/revocation and restore evidence are release/operator responsibilities.

Supabase's current [session documentation](https://supabase.com/docs/guides/auth/sessions)
connects JWT `session_id` with `auth.sessions`; its [connection documentation](https://supabase.com/docs/guides/database/connecting-to-postgres)
distinguishes direct/session pooling from transaction pooling.
