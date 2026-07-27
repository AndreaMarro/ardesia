# ARDESIA Studio — regole correnti per agenti

> Segui `../../AGENTS.md` e `../../ARDESIA-MAP.md`; per la verticale
> Simulation/ELABTutor segui `../../artifacts/session-2/current-flow.md`.
> Governance, decisioni e receipt partono dal vault Knowledge esterno,
> `00-INDEX.md`.

## Scope

Studio è la superficie React/TypeScript/Vite di ARDESIA. Il task corrente
deriva dall'ordine umano e dalle fonti sopra: non esistono code M0, ruoli
Hermes, fallback storici o branch autonomi che autorizzino lavoro aggiuntivo.
ELAB può entrare soltanto attraverso i confini Plugin/Pack ratificati; non
reintrodurre un'app ELAB monolitica dentro Studio.

## Gate obbligatori

- `tsc -b` è il typecheck autoritativo; Vitest/esbuild non lo sostituiscono.
- Per ogni commit esegui la suite Vitest completa e `npm run build`.
- `eval/gate.sh` è frozen: non modificarlo o indebolirlo per ottenere verde.
- I test devono essere causali e non tautologici; un claim “verificato” richiede
  evidenza realmente eseguita.
- Nessuna nuova dipendenza senza approvazione esplicita.

## Invarianti tecnici verificati

- Le copie in `sim/solver/{engine,components}/*.js` restano byte-identiche alla
  sorgente dichiarata e protette da `SolverVendoredDrift.test.ts`.
- I golden elettrici UI 14,9 mA e motore 15,3 mA sono distinti by-design; non
  riconciliarli senza una decisione esplicita.
- `localStorage` è cache, non fonte di verità.
- Eventi journal e formati persistiti restano deterministici, versionati e
  migrate-safe.
- Nessun segreto, PII o corpus privato nei file, nei commit o nei log.

## Consegna

Lavora su branch locale e con diff chirurgici. Push, PR, merge, deploy,
cancellazioni esterne e altre azioni remote richiedono autorizzazione umana.
Non usare `--no-verify`, force-push, `git reset --hard` o gate bypass.
