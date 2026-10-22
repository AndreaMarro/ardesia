# Correzione numerica degli esami persistiti — 2026-10-22

Base esatta: PR #277, `eee007d265f89f55b1ba0d08b092f2de1d3603c8`.
Branch di lavoro: `pro/ardesia-exam-numeric-20261022`.
Classificazione: **P1, correttezza del contratto banco → esame persistito**.

## Difetto osservato

`exam_bank._numeric` proietta l'esatto razionale come stringa JSON. La correzione
in `exam._numeric_answer` passava quella stringa a `expected_quantity`, che
accetta `Fraction`, interi e float. Il confronto numerico falliva e restavano
efficaci soltanto gli alias testuali. Inoltre `_completion_matches` confrontava
quegli alias dopo conversione in minuscolo prima di verificare le dimensioni:
`4 pA` veniva accettato come alias di `4 Pa`.

Un banco sintetico di 31 quesiti, approvato esclusivamente in database
temporanei, riproduce entrambi i difetti attraverso avvio, autosalvataggio CAS,
chiusura e riapertura SQLite, invio e rilettura del risultato. La prova HTTP
chiude e ricrea anche l'applicazione prima di inviare le risposte salvate.

## Modifica minima

- `packages/engine/lessonos/study/exam.py` converte l'esatto con il già esistente
  `question_bank.parse_rational` prima di applicare la scala dell'unità. Se il
  quesito dichiara `numeric.unit`, la verifica numerica e dimensionale decide
  l'esito; gli alias testuali non possono scavalcarla.
- `packages/engine/lessonos/study/exam_bank.py` riusa lo stesso parser razionale
  già adottato dalla validazione del banco e dalla pratica. Il campo `value`
  resta presente per compatibilità dello schema; il confronto usa `exact`.
- `packages/engine/lessonos/study/quantity.py` elimina il parser numerico
  duplicato e passa il quoziente completo allo stesso `parse_rational`.
  La review indipendente aveva trovato che il limite separato di esponente 30
  respingeva esatti già validi nel banco, come `1e40` e `1e-40`. Il contratto
  numerico condiviso ora impone 128 caratteri, 64 cifre per parte, esponente
  assoluto massimo 100 e 512 bit per numeratore e denominatore del risultato.
  Restano i limiti di 200 caratteri per quantità e di 12 per esponente di unità.

Delta applicativo: **19 righe aggiunte, 31 rimosse, 3 file**. Non sono stati
introdotti parser, dipendenze, formati, tabelle o migrazioni. I completamenti
testuali e il percorso storico senza `numeric.unit` conservano il contratto
precedente. Il corpus e le approvazioni reali non sono stati modificati.

## Prove eseguite in questa sessione

| Prova | Risultato osservato |
|---|---|
| Quattro regressioni nuove sulla base, prima del fix | **4 failed**, 18 deselected |
| Regressione aggiunta dopo review, prima di consolidare i parser | **4 failed**, 7 passed, 37 deselected |
| Quantità, esami storici, banco persistito e API HTTP dopo il fix completo | **62 passed** in 6,78 s |
| `git diff --check` | PASS |
| PostgreSQL, auth cloud, browser reale | NOT_RUN per questa correzione |

Il caso con esatto `4` Pa verifica `8/2 Pa`, `4.0 Pa` e `0.004 kPa` corretti;
`4 pA`, `4 pa`, `4 PA` e `4 J` errati. Il caso con esatto `1/3` accetta `2/6 Pa`
e rifiuta l'approssimazione decimale `0.3333333333333333 Pa`. Un terzo caso
conserva e rilegge la forma esatta `8 / 2`. I roundtrip aggiunti dopo review
accettano gli esatti `1e40` e `1e-40` e i quozienti equivalenti. Le prove dei
limiti accettano `1e100` e `1e-100`, respingono esponente assoluto 101, risultati
oltre 512 bit e componenti oltre 64 cifre. Divisione per zero, esponente enorme,
testo non numerico e risposta oltre 200 caratteri restano respinti. Sono
verificati anche punti, conteggi, revisione CAS e risultato persistito.

Comando verde, eseguito dalla root del worktree con Python 3.13.16:

```sh
PYTHONPATH=packages/engine:services/study-api \
  ../ardesia-teacher/services/study-api/.venv/bin/python -m pytest -q \
  packages/engine/tests/study/test_quantity.py \
  packages/engine/tests/study/test_exam.py \
  packages/engine/tests/study/test_exam_bank.py \
  services/study-api/tests/test_exam_http.py \
  services/study-api/tests/test_exam_bank_http.py --tb=short
```

Ricevute locali: `evidence/numeric/numeric-red.log`, `numeric-boundary-red.log`,
`numeric-green.log` e `numeric-verification.json` nel workspace di esecuzione.
Il passaggio intermedio a 54 test verdi prima della review è conservato in
`numeric-before-boundary-green.log`. La prima verifica
intermedia è conservata in `numeric-initial-verification.log`: il grading era
corretto ma il nuovo test confrontava anche `validity.checkedAt`, ricalcolato
alla lettura. Il test ora richiede timestamp monotono e identità di ogni altro
campo. TestClient ha richiesto l'esecuzione locale fuori dal sandbox di rete;
nessun servizio esterno è stato contattato. Rimane un warning preesistente
Starlette sulla deprecazione di httpx in TestClient; nessuna dipendenza cambiata.

La review indipendente finale ha riletto i tre file applicativi e chiuso il
finding sui limiti con una riproduzione pura separata: `4`, `1/3`, `1e±40` e
`1e±100` con Pa corretti; le corrispondenti risposte con pA errate; esponente
101, 65 cifre e quoziente oltre 512 bit respinti; `1e100/1e100` accettato come 1.
Nessun altro finding nel perimetro letto. Il reviewer non ha rieseguito HTTP;
il risultato della suite rimane la prova eseguita dal builder.

## Limiti residui

La prova usa soltanto fixture sintetiche SQLite e HTTP locale. Non certifica
la revisione scientifica del corpus, il database PostgreSQL o un deploy.
Il vocabolario di unità del parser esistente rimane limitato e fallisce chiuso;
questa modifica non estende la grammatica delle unità né uniforma tutta la
politica delle risposte tra pratica stateless ed esame. I risultati già inviati
restano quelli persistiti: non è stata introdotta una ricorrezione retroattiva.
