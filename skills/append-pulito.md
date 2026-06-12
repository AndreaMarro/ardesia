# append-pulito

log.jsonl, STATUS.md e PROCESS-LOG.md sono artefatti MACCHINA-LEGGIBILI: il ledger,
il triage e il replay li parsano. Il replay deterministico è invariante di prodotto
(TRIAGE-FEEDBACK, definizione vincolante di CRITICO). Un placeholder al posto del
timestamp o una riga corrotta da copia-incolla rompe il parsing in silenzio e si
propaga: oggi 25 occorrenze di `(current)` in STATUS.md e 5 in log.jsonl, mai
intercettate da review né retro — classe ricorrente senza skill fino ad ora.

## When-to-apply

- Ogni append a log.jsonl, STATUS.md, PROCESS-LOG.md, COORDINATION.md, project-wiki/log.md.
- In review: qualunque diff che tocca questi file.
- Prima di ogni commit docs (il commit "docs finale" di commit-per-sottotask).

## Checklist/Procedura

- [ ] **Timestamp REALE, mai placeholder**: usa `date -u +%Y-%m-%dT%H:%M:%SZ` al momento
  dell'append. Esempio VERO: `log.jsonl:91` `"ts": "2026-06-12T(current)"` (commit
  dbc766b) — segnalato da H2 00:15 come rottura del replay deterministico; stesso
  pattern alle righe 84, 87, 88, 89 (`2026-06-11(current)`, `2026-06-11T(current)`).
  "Non so che ora è" non esiste: l'orologio di sistema c'è sempre.
- [ ] **Niente prefissi spuri da viste tabellari**: STATUS.md:405-420 ha righe che
  iniziano con `||` e `|||`, STATUS.md:334 con `|- ` (introdotte in 241184b e
  precedenti) — copia-incolla da rendering a tabella. Appendi testo pulito: la riga
  deve iniziare con `- ` o con il livello di heading, mai con pipe.
- [ ] **log.jsonl: ogni riga è JSON valido** — prima del commit:
  `python3 -c "import json,sys; [json.loads(l) for l in open('log.jsonl') if l.strip()]"`.
  Una riga rotta corrompe il ledger per tutti i consumer a valle.
- [ ] **Grep pre-commit sul diff docs**: `git diff --cached | grep -n "(current)\|^+|"` —
  se matcha, sistemare PRIMA di committare. Zero match = pulito.
- [ ] **Schema coerente tra righe**: stessi campi chiave (`ts`, `task`, `status`,
  `gate_passed`, `cost_usd`) nello stesso formato delle righe precedenti — non
  alternare `"ts":"...T..."` e `"ts":"...(current)"` né inventare campi una tantum.

## Origine-RETRO

- H2 adversarial 2026-06-12 00:15 su lessonos@dbc766b: NOTA su log.jsonl:91 —
  placeholder testuale al posto di ISO timestamp rompe la ricostruzione temporale.
- STATUS.md a HEAD 241184b: 25 occorrenze `(current)`, righe 334/405-420 con pipe
  spurie — ricorrenza massiva mai entrata in PROCESS-LOG (grep timestamp/placeholder
  sui retro: zero hit), quindi loop aperto: errore ricorre → nessuna skill → ricorre.
- Classe nuova, non coperta dalle 4 del giorno (lavoro-senza-commit,
  test-che-non-possono-fallire, severità-mal-calibrata, liste-duplicate).
