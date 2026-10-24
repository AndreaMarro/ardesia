# R1 — beta autenticata: inventario e preflight del 24 ottobre 2026

Stato alle 15:33 UTC: **beta remota reale non verificata; lancio non autorizzato**. Il mandato R1 non autorizza deploy, nuove risorse cloud, migrazioni remote, inviti/email, dati reali o pagamenti. Il probe preparato qui esegue soltanto tre GET anonime su una destinazione approvata separatamente; non sostituisce il percorso autenticato con due utenti.

Checkout esaminato: `work/ardesia-r1`, branch `codex/ardesia-r1-marketing-beta-20261024`, base #299 `6f19b1956cedbebf36a5cf097af66e47ed8acecd`. Root gestisce fonte e approvazioni della release marketing/scientifica; questo incremento non modifica Studio, Engine, autorità di sessione o schema di dominio.

## Riutilizzo accertato nel codice

| Area | Fonte esistente | Limite attuale |
| --- | --- | --- |
| Auth | `services/study-api/study_api/runtime.py`: Supabase Auth `/auth/v1/user`, logout locale/globale; cookie HttpOnly nel medesimo origin | Runtime G0 ammesso solo su loopback. Nessun target remoto certificato. |
| Identità e RLS | Migrazioni `20261020010604_study_auth_rls.sql` e `20261020011015_study_runtime_boundaries.sql`; adapter `packages/engine/lessonos/study/postgres.py` | Principal canonico, verifica della sessione Auth, default deny; presenza del codice non prova migrazioni/policy in un progetto cloud. Nessuna migrazione eseguita. |
| Media | Bucket privato `ardesia-originals`, originali immutabili e download autenticato; upload-intent e compensazione esistenti | Nessun upload/download remoto eseguito; nessun hash media remoto attestato. |
| Inviti/coorti | Core e HTTP SQLite gestiscono invito, accettazione e membership canonica | Il ramo Supabase degli endpoint invito risponde `501 supabase_invitation_not_configured`. Non è una coorte remota pronta. |
| Confine frontend | `apps/studio/src/study/apiClient.ts`, condiviso dal Web: richieste same-origin, epoch di sessione e abort delle risposte obsolete, logout locale distinto da conferma server | Nessuna modifica client necessaria al probe. Nessun login remoto o verifica multiutente eseguiti. |
| Avvio/health | `create_app(demo=False)` rifiuta con `synthetic_only`; host remoti rifiutati `403 loopback_only`; health dichiara `synthetic: true` | Non si rimuovono i guard per presentare una demo come beta reale. Health non attesta oggi `buildCommitSha`. |
| Operatività | Readiness Core, backup/restore e percorso G0 già previsti | Le prove locali storiche non sono prove del nuovo target; health operativa PostgreSQL segnala backup `NOT_YET_VERIFIED`. |

I file runtime G0 storici `supabase-local/.env.local`, `container-runtime/{status,env}.sh` e `g0-supabase-data/supabase-access.json` non sono presenti nel nuovo work directory. Nessun nuovo stack avviato per sostituirli.

## Scoperta cloud in sola lettura

Supabase `list_projects` ha restituito cinque progetti legacy (`Elab_Website`, `Elab`, `elab-unlim`, `ghost-tutor`, `analisi1-quiz`), nessuno identificato come staging Ardesia. Le variabili locali presenti puntano a `elab-unlim`: non sono autorizzazione a usare quel database per Ardesia. Non sono stati letti dati, utenti, chiavi o policy di quei progetti.

Vercel `list_projects(search=ardesia)` ha restituito sette nomi: `ardesia-api-vercel`, `ardesia-lavagna`, `ardesia-workspace`, `ardesia-canvas`, `ardesia-fisica-preview`, `ardesia-studio-provenance-preview`, `ardesia-wt-v1-dependency-deploy-20260710`. Il nome non dimostra né contenuto attuale né ambiente staging. I dettagli di progetto e deployment con il teamId restituito sono negati `403`; `list_teams` restituisce una lista vuota. Un link di consenso monouso è stato consegnato a root per eventuale approvazione umana; non conferisce accesso da solo e non è conservato come credenziale. CLI Vercel 53.4.0 installata senza credenziali: tentativo di lista interrotto appena comparso il device-login, nessuna autenticazione completata.

Render elenca un workspace, ma il connettore richiede una scelta umana prima di selezionarlo; nessun workspace selezionato e nessun servizio creato. I risultati non autorizzano un provider o un ambiente nuovo.

La richiesta umana «non puoi usare Vercel?» è utile per individuare un candidato frontend. Una pubblicazione statica su Vercel non attesta da sola Auth, PostgreSQL, Storage privato, inviti e revoca. Root prepara il candidato composto; non è stato effettuato alcun deploy.

## Incremento minimo preparato

Tre file nuovi nel repo:

- `services/study-api/study_api/beta_probe.py`: manifest rigoroso, origin HTTPS esatto approvato separatamente, SHA sorgente attesa di 40 caratteri, DNS esclusivamente pubblico, IP verificato fissato alla connessione TLS con SNI/hostname originali. Solo `/study/health`, `/study/me`, `/study/ops/health`, anonimi.
- `bin/study-demo/probe-beta.py`: CLI senza segreti; nessun proxy, cookie o header Auth, nessun redirect; JSON limitato a 64 KiB, errori e output costanti/sanitizzati. Nessun body remoto o PII viene copiato nel report.
- `services/study-api/tests/test_beta_probe.py`: controprove su destinazioni non autorizzate, DNS privato/misto, TLS, redirect, SHA, health sintetica, anonimi, payload malformati e confini esistenti.

`synthetic: true`, identità build mancante/diversa, runtime non Supabase/PostgreSQL, health invalida o accesso anonimo non negato bloccano il preflight. Anche tre endpoint validi lasciano **`betaReady: false`, `launchAllowed: false`, exit 2**: gli undici gate operatore restano `NOT_RUN`. Una dichiarazione dell'health è solo una controprova di configurazione pubblica, non una verifica indipendente di RLS o persistenza.

`target.template.json` è intenzionalmente incompleto e non effettua rete. Solo dopo l'approvazione umana di un target esistente si compilano origin e SHA realmente distribuita, senza token o credenziali. Il parametro `--allow-origin` va dato separatamente; il manifest non può autorizzare da solo la propria destinazione.

```sh
PYTHONPATH="$PWD/packages/engine:$PWD/services/study-api" \
  uv run --no-sync --project services/study-api python bin/study-demo/probe-beta.py \
  --target ../r1/beta/target.template.json \
  --allow-origin https://HOST-STAGING-APPROVATO
```

Non impostare una SHA locale come se fosse una misura del server: il probe richiede che `/study/health` attesti `buildCommitSha` corrispondente. L'API corrente non espone questo campo e resta sinteticamente confinata al loopback; l'eventuale adattamento del target reale richiede un incremento M2 distinto, non una rimozione implicita dei guard.

## Prove conservate

Fresh `.venv` tramite `uv sync --frozen` del nuovo checkout; Python 3.13.14, import Engine verificato dal nuovo checkout. Nessuna dipendenza aggiunta o lock modificato.

- `beta-probe-red.log`: RED per modulo mancante prima dell'implementazione.
- `beta-probe-green.log`: primi 45 test PASS.
- `beta-probe-boundaries.log`: 55 test PASS, incluso guard host remoto e `demo=False` invariati.
- `beta-boundary-regressions.log`: 106 test PASS in 9.88 s: probe, identity, session-boundary, rejected-cookie, access e body-admission. Un warning storico Starlette/httpx, non una failure.
- `beta-multicast-red.log`: review indipendente ha dimostrato che `ipaddress.is_global` include multicast e alcune reti IPv6 riservate; nove controprove permanenti fallivano prima del fix (9 FAIL / 55 PASS), senza traffico di rete. Oracolo indipendente conservato da reviewer in `work/r1/review/beta-multicast-probe.json`.
- `beta-boundary-postreview-green.log`: dopo il predicato pubblico **unicast** condiviso tra parsing e DNS, 115 test PASS in 4.38 s (64 probe + 51 regressioni dei confini esistenti). Nessun nuovo fallback, esclusi esplicitamente multicast, reserved, unspecified, loopback e link-local.
- Recheck indipendente dello stesso oracolo: `work/r1/review/beta-multicast-probe-green.json` e relativo log. Quattro multicast rifiutati sia come literal sia come DNS; controllo pubblico unicast ancora accettato, zero rete. RED preservato dal reviewer.
- `readiness-unconfigured.json`: esecuzione reale della CLI senza target, exit 2 previsto, nessuna richiesta di rete.
- `uv-sync.log`: installazione frozen locale del nuovo ambiente API.
- `operator-plan.json`: elenco delle prove remote necessarie, tutte `NOT_RUN`; nessun falso esito da health.
- `source-sha256.json`: hash dei tre nuovi sorgenti e delle prove; non sostituisce SHA di commit o artifact remoto.

`git diff --check` e `py_compile` dei tre file: PASS. Nessuna suite completa o certificazione remota rivendicata. Il root coordina le suite dell'incremento scientifico separato.

## Prossimo passo concreto

Ottenere lettura del progetto Vercel esistente oppure un origin staging nominato dal titolare, verificare deployment/source SHA e infrastruttura Auth/Storage/RLS pertinente, quindi completare con autorizzazione esplicita la checklist operatore. In assenza di quel target, il risultato corretto resta `BLOCKED`, senza modificare le protezioni della demo.
