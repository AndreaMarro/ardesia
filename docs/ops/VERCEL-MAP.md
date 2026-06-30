# ARDESIA — Vercel map

Data: 2026-06-30
Stato: mappa additiva, live non verificato

## Verdetto

Nel turno corrente il connector Vercel non espone team o progetti. Quindi questa mappa non dichiara alcun deploy live come verificato oggi.

Regola:

```text
Vercel serve demo e preview. La fonte canonica resta il monorepo ARDESIA.
```

## Stato storico dal repo

| Nome storico | Stato storico | Categoria provvisoria | Azione |
|---|---|---|---|
| api-vercel | production Error/404 | broken | Non usare come demo. |
| preview moat | Ready ma gated | gated-preview | Non demo toccabile. |
| ardesia-lavagna | 200 storico | candidate-demo | Verificare live. |
| ardesia-workspace | 200 storico | unknown/stale | Classificare. |
| elab-tutor | prodotto ELAB | separate-product | Non confondere con ARDESIA. |

## Inventario live richiesto

Per ogni progetto Vercel raccogliere:

- team id o slug;
- project id o nome;
- repo collegato;
- branch production;
- ultimo deployment;
- commit servito;
- URL production e preview;
- accesso pubblico, gated, SSO o rotto;
- categoria: canonical-demo, preview, stale, broken, unknown;
- prossima azione.

## Candidato demo primaria

Candidato iniziale: `AndreaMarro/ardesia-lavagna`.

Motivi:

- orientato alla lavagna;
- stack Vite;
- contiene configurazione Vercel;
- descrizione orientata a canvas, ToolHost, plugin e lezioni;
- piu' adatto a demo toccabile rispetto ad API o app ELAB standalone.

Criteri per promuoverlo:

1. build passa;
2. deploy Ready;
3. URL accessibile senza frizione;
4. browser check pulito;
5. interazione minima documentata;
6. README demo dichiara cosa e' reale e cosa manca;
7. commit servito registrato qui.

## Vertical slice richiesta

Minima:

```text
aprire lavagna -> aggiungere tool/plugin -> interagire -> esportare lezione -> importare/riaprire
```

Preferibile:

```text
lavagna -> plugin simulatore -> circuito/blink -> stato salvato -> export/import
```

## Chain of verification

- Verificato nel turno: il connector Vercel non espone progetti utilizzabili.
- Verificato storico nel repo: ci sono riferimenti a piu' deploy/progetti.
- Non verificato live: URL correnti, log build, stato browser, stato accessi.
- Non fatto: nessun deploy, nessun dominio, nessuna modifica Vercel.
