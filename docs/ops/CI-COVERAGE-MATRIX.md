---
id: ardesia-ci-coverage-matrix
status: active
freshness: 2026-07-14T23:28:39+02:00
baseline_sha: a7167657ba027e957731775895911d2428036071
authority: operational-snapshot
---

# Ardesia — matrice GitHub Actions e protezione del branch

## Verità osservata

GitHub esegue workflow soltanto da `.github/workflows/` alla root. Al baseline
di questo documento sono attivi `ci.yml` e `studio-preview-readiness.yml`.
Workflow collocati sotto `apps/`, `packages/` o `plugins/` non vanno conteggiati
come workflow root attivi.

| Superficie | Prova root corrente | Stato | Gap bloccante |
|---|---|---|---|
| Studio | typecheck, Vitest, build | `PARTIAL` | lint, WebKit/iPad, a11y e UI visuale assenti |
| Studio lint | non eseguito dalla CI root | `INVALID_BASELINE` | 176 errori e 6 warning osservati con `npm run lint` |
| Engine | pytest | `COVERED` | versione Python/uv e timeout non congelati |
| Hygiene | NUL, secret, canon, boundary, whitespace PR | `COVERED` | action pinning e timeout incompleti |
| Preview Studio | check senza deploy | `COVERED` | non prova un artefatto Vercel promosso |
| Entitlement service | nessun job root | `MISSING` | pytest non eseguito dalla CI root |
| Plugin ELAB | nessun job root | `MISSING` | workflow annidati non costituiscono copertura root |
| Ops tools | nessun job root | `INVALID_BASELINE` | script `test` termina intenzionalmente con errore |
| E2E WebKit/iPad | nessun job root | `MISSING` | continuità Safari non provata |
| Storybook/a11y | non installato | `MISSING / DEP_GATE` | configurazione e stories assenti |
| Chromatic | non installato | `MISSING / EXTERNAL_GATE` | account, secret e baseline assenti |
| Contratti API | nessun drift check | `MISSING` | OpenAPI non è ancora autorità unica |
| Supabase/RLS | progetto Ardesia assente | `NOT_APPLICABLE_YET` | entra dopo atomicità del kernel |

`ops/tools` non può diventare verde saltando il comando: prima si definisce un
test reale oppure si dimostra che non è superficie pubblicabile e lo si esclude
esplicitamente dal release manifest.

## Slice di convergenza

1. **Hardening workflow** — `permissions: contents: read`, timeout per job,
   action pinning a commit SHA, runtime espliciti, nomi di check stabili e
   ricevuta con commit/tree SHA. Nessuna modifica funzionale nello stesso PR.
2. **Lint ratchet** — salvare il baseline machine-readable per regola/file,
   fallire su nuove violazioni e ridurre il debito in slice dedicate. Il job non
   diventa verde ignorando errori o escludendo file senza decisione.
3. **Entitlement** — aggiungere installazione lockata e pytest del servizio;
   required check soltanto dopo il primo run verde sull'esatto candidato.
4. **ELAB** — scegliere il più piccolo gate deterministico coerente con la
   superficie pubblicata. Non importare alla cieca i workflow annidati.
5. **Ops tools** — test reale o esclusione motivata, mai `continue-on-error`.
6. **Browser** — Playwright WebKit con viewport iPad, reload/background dove
   automatizzabile e ricevuta separata del test su iPad reale.
7. **UI quality** — Storybook interaction+a11y; poi Chromatic advisory e,
   dopo baseline approvata, required.
8. **Contratti/cloud** — drift OpenAPI, RLS negative tests e release manifest
   entrano soltanto quando le rispettive superfici esistono.

Ogni slice mantiene massimo cinque file di prodotto e non abbassa le suite
esistenti. Un nuovo check non viene dichiarato required prima che sia stabile,
riproducibile e osservato verde su PR.

## Contratto di una prova CI

Una prova è valida soltanto se registra:

- `github.repository`, run ID, workflow e job;
- commit SHA, tree SHA e base SHA;
- lockfile e runtime usati;
- comando effettivo e codice di uscita;
- conteggi passed/failed/skipped;
- artefatto o receipt con hash;
- assenza di edit successivi sul candidato.

Cache, report visuali e log non sono fonti di verità. I log non devono stampare
secret o dati di lezione. I fixture CI sono deterministici e de-identificati.

## Branch protection desiderata

Lo snapshot live osservato richiede tre context di CI con strict mode, ma non
impone review, amministratori, risoluzione conversazioni o CODEOWNERS root.
La convergenza, sempre con conferma umana, è:

- almeno una review indipendente;
- amministratori inclusi;
- conversazioni risolte;
- `CODEOWNERS` root con ownership per dominio/kernel/adapters/UI/ops;
- dismiss delle approval dopo nuovi commit;
- required contexts limitati a gate stabili;
- nessun push diretto, merge automatico o bypass del writer.

Modificare branch protection, CODEOWNERS o required checks è `HUMAN_GATE`.
Prima si pubblica la PR e si osservano i nomi reali dei check, poi si protegge:
invertire l'ordine può bloccare il repository con context inesistenti.

## Strategia PR e Chromatic

Per evitare baseline errate sui merge ref effimeri, il job visuale futuro deve
seguire la configurazione ufficiale Chromatic: evento `push` sul branch oppure
checkout esplicito della head PR, history sufficiente e `workingDir` Studio.
Il project token vive esclusivamente nei GitHub Actions secrets. Il check parte
advisory; diventa required solo dopo approvazione della baseline e prova che un
rerun produce lo stesso risultato.
