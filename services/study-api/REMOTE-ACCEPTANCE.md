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

## Vercel preview entry

The repository-level service file `services/study-api/app.py` exports
`app = app_from_env()` for Vercel's FastAPI framework detection. It derives the
monorepo engine and service import paths from `__file__`, independently of the
process working directory. Keep project root `services/study-api` and
`sourceFilesOutsideRootDirectory=true` so both `packages/engine` and
`plugins/s19-circuit-lab` remain available. The existing `pyproject.toml` and
`uv.lock` already declare and lock the local S19 dependency at
`../../plugins/s19-circuit-lab`; use that uv configuration without a second
requirements/lock file.

For this acceptance preview, use
`ARDESIA_DATA_DIR=/tmp/ardesia-acceptance`. This directory is ephemeral working
space; the existing PostgreSQL store and Supabase Storage remain authoritative.
The intended stable preview alias is
`https://ardesia-closure1-acceptance-preview.vercel.app`; configure that exact
origin in `ARDESIA_APP_ORIGINS`. Configure release SHA and credentials through
private environment configuration. Creating this entry does not promote a
preview to production.

The trusted TLS/proxy requirement above still applies to Vercel: hosted proof
must confirm ASGI receives HTTPS, the canonical alias Host, and the actual
browser Origin. Do not make arbitrary forwarded client headers authoritative to
work around a failed boundary. No platform-specific trust bypass is added.

### Isolated service build and canonical package bundling

The service-scoped `vercel.json` selects FastAPI, frozen uv installation, the
`python3 build_shared_core.py` build command, automatic Python output, and no Git
triggered deployments. It overrides the monorepo Studio/npm build configuration.
Do not override this build command with an empty command: it stages the canonical
`lessonos` and `s19_circuit_lab` package trees, including their package-relative
content, into the ignored `_core/` deployment artifact. The entry loads this
artifact first and the function explicitly includes `_core/**`. No source package
or domain implementation is forked; each build copies the canonical checkout.
Outside-root sources must still be enabled at build time. Editable dependency
`.pth` paths and `../../` ZIP paths are insufficient for runtime packaging.

`nodeVersion` is intentionally absent: the current official `vercel.json` schema
does not define it. Clear inherited Node-specific project settings through the
project/deployment configuration where needed. Keep preview credentials private.

The [official FastAPI documentation](https://vercel.com/docs/frameworks/backend/fastapi)
keys function options by entrypoint, and the
[Python runtime documentation](https://vercel.com/docs/functions/runtimes/python)
describes bundle inclusion/exclusion. The
[official Python builder](https://github.com/vercel/vercel/blob/main/packages/python/src/index.ts)
consumes `includeFiles` as globs relative to the service root; explicit staging
keeps every function ZIP path inside that root.

### Same-origin reviewed Web preview

Set the build environment `ARDESIA_BUILD_WEB=1` to include the reviewed Web at the
same origin as the Core. The existing build command then runs `npm ci` at the
monorepo root (whose only npm workspace is `apps/web`) and `npm run build:web`.
It stages that checkout's `apps/web/dist` byte-for-byte into ignored service
`_frontend/`; it does not build or install the Studio frontend. Root and Web
source files, including the small shared Studio modules imported by Web, must be
available during the build. No compiled files are committed.

`ARDESIA_RELEASE_SHA` is required at build time as well as runtime. Generated
`/acceptance-release.json` records that source SHA, synthetic mode, and the exact
index SHA256; its source identity is supplied by the release process. Both
`_core/**` and `_frontend/**` are explicitly included in the Python function.
Without the build flag, packaging removes any cached frontend artifact and the
service remains API-only.

The remote factory mounts the staged bundle through the existing application.
`[tool.vercel.fastapi.static] cdn=false` keeps it in the function behind the same
HTTPS/Host/Origin middleware. We deliberately use `_frontend/`, not Vercel's
CDN-served `public/`, so those checks remain in force. HTML navigation to deep
extensionless SPA paths falls back to the reviewed index; missing assets and
JSON navigation remain404. Every unknown `/study/*` path remains JSON404 even
with an HTML Accept header. Existing API routes run before the static mount.

### Optional existing Studio at `/studio/`

Set `ARDESIA_BUILD_STUDIO=1` alongside the existing Web flag to build the current
Studio through its own committed lock: `npm --prefix apps/studio ci`, then
`npm --prefix apps/studio run build -- --base=/studio/`. The build also sets
`ARDESIA_STUDIO_BASE=/studio/` and the existing Studio provenance input
`ARDESIA_GIT_SHA` to the full `ARDESIA_RELEASE_SHA`. Existing Studio provenance
checks still reject disagreement with other populated Git providers/the checkout.
A missing/invalid release SHA fails before npm runs.

The reviewed `apps/studio/dist` tree is copied byte-for-byte into ignored
`_studio/`, with `/studio/acceptance-release.json` recording source/index identity.
The remote entry detects that fixed directory and passes it to the existing
`create_app(studio_frontend=...)` mount, which runs before the Web root mount.
Missing Studio index fails startup; missing assets remain404. The Python bundle
explicitly includes `_studio/**`. No Studio server, new registry, persistence,
Room implementation or LessonOS source is added. No Data API or protection setting
changes. `cdn=false` retains the same HTTPS/Host/Origin ASGI boundary.

At the end of packaging, ignored `_bundle-size.json` reports Core/Web/Studio/code
bytes plus any available service `.venv` Python dependency estimate. The build
fails if those accounted bytes exceed the conservative250,000,000-byte acceptance
budget. It does not discard assets to meet that budget. Absence of a dependency
estimate and absence of hosted function-size verification are explicit fields;
the final platform receipt must still verify the actual uncompressed function.
If the actual combined function exceeds the budget, coordinate separately reviewed
same-origin static asset routing rather than pruning fonts, notices, mathematics
or other runtime inputs without proof. No asset exclusions are introduced here.
Without the Studio flag, any cached `_studio` tree is removed and Web/API behavior
stays as before. The actual Studio build and protected teacher-browser reachability
must be checked on the exact combined source/deployment before declaring G2 passed.
