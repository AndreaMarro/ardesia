# ARDESIA Core Engine — regole correnti per agenti

> Segui `../../AGENTS.md` e `../../ARDESIA-MAP.md`. Governance, decisioni e
> receipt partono dal vault Knowledge esterno, `00-INDEX.md`.
> AgentMemory è `RETIRED_NO_READ_NO_WRITE`.

## Scope

Intervieni nel Core Engine soltanto per un task esplicito e verificabile. Le
vecchie code M0–M4, i ruoli Hermes/DeepSeek/Kimi, i driver autonomi e
`COORDINATION.md` non autorizzano nuove attività, auto-rewrite di processi o
scritture esterne. Prima di modificare codice, verifica lo stato corrente del
package e il suo toolchain reale; non assumere che uno snapshot storico sia
ancora valido.

## Sicurezza

- Solo branch e commit locali salvo autorizzazione umana esplicita.
- Nessun push autonomo, force-push, `git reset --hard`, `git clean -fd`,
  `--no-verify`, deploy o merge.
- Nessun segreto, dato studente, PII o corpus privato in codice, fixture, log o
  commit.
- Nessuna nuova dipendenza senza approvazione esplicita.
- Nessun accesso o fallback ad AgentMemory.

## Verifica e claim

- Usa i gate e i comandi dichiarati dal package corrente; non indebolire test,
  evaluator o baseline.
- I test devono essere deterministici e causali. Fixture e mock sono ammessi
  per unit test, ma non provano comportamento reale né autorizzano claim live.
- Citazioni, provenance e dati persistiti devono essere fondati, versionati e
  migrate-safe.
- Se un gate non è eseguibile, registra il blocker con evidenza; non dichiarare
  completato o verificato ciò che non è stato misurato.

## Consegna

Mantieni il diff chirurgico e dentro il task richiesto. Push, PR, merge, deploy,
cancellazioni esterne e cambi di governance richiedono autorizzazione umana.
