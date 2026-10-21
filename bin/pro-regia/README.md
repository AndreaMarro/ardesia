# Pro Regia: verifiche indipendenti dell'esame

Questi probe verificano il verticale della PR #269 senza modificare motore,
contenuti, database del prodotto o workflow CI. Non costituiscono un secondo
motore d'esame, un secondo registry dei corsi o una certificazione scientifica.

La ricevuta iniziale è in `docs/ops/pro-regia/2026-10-21/`. Il codice prodotto
esaminato è `b9764d2e1785c26893f424ea547d2df081e0aca2`.

## Contratti e grading

Da una checkout Ardesia, con le dipendenze Python dell'engine disponibili:

```bash
python bin/pro-regia/run_exam_review.py \
  --repo . \
  --output-dir /tmp/ardesia-exam-review \
  --quarantine docs/ops/pro-regia/2026-10-21/quarantine.json
```

Al commit esaminato vengono eseguiti **8 test: 2 PASS, 6 FAIL**. Cinque
fallimenti riguardano il grading numerico, uno le quattro alternative MCQ
rispetto alle cinque previste dal DM 941/2026. Gli assert esprimono il
comportamento richiesto, senza `xfail`, skip o inversione dell'esito atteso.

Il processo restituisce 1 per regressioni o HOLD. Un pack con hash diverso
richiede una nuova revisione: l'esecuzione restituisce 2 e non ricicla le
annotazioni vecchie. Il JSON riporta SHA Git e hash dei sorgenti, separando byte
committati da eventuali modifiche locali.

La quarantena vale nella verifica di integrazione qui eseguita: **non è ancora
collegata a un controllo di pubblicazione nel prodotto**. Il database e il pack
restano invariati. `questionRevision` rimane `null`, perché manca nella fonte;
identità della revisione = ID quesito + versione pack + hash pack/contenuto.

## Verifica matematica separata

```bash
python bin/pro-regia/science_probe.py \
  --pack packages/engine/lessonos/study/content/fisica-semestre-filtro-v1.json \
  --output-dir /tmp/ardesia-science-review
```

Usa `Fraction`/`Decimal` della libreria standard e controlla 23 risultati o
bilanci. Le ipotesi sono riportate per ogni quesito. Il successo di questi
calcoli non autorizza `SCIENCE_REVIEWED`, `EDITORIALLY_APPROVED` o pubblicazione.
Il probe è vincolato all'hash effettivamente letto. L'opzione
`--expected-commit` è disponibile per una riproduzione sullo SHA originale.

## Banca ricevuta nella PR #270: adattamento senza perdita

La PR #270 è comparsa durante questa esecuzione. La sua banca usa un contratto
diverso dal pack31. `question_inbox_adapter.py` conserva l'intero record,
compresi campi sconosciuti, ID, revisione, tassonomia, soluzioni, frazioni esatte
e prove del produttore, con pin a commit/manifest/shard. L'inviluppo è **privato**:
contiene le risposte e non deve essere restituito a uno studente.

```bash
python bin/pro-regia/question_inbox_adapter.py \
  --repo /percorso/checkout-della-banca \
  --output /tmp/ardesia-bank-intake.json
python -m unittest discover -s bin/pro-regia -p test_question_inbox_adapter.py -v
```

Verificati 4.000 round trip senza perdita e cinque test di integrità/identità.
Non viene scritto un secondo corpus o database: il programma salva soltanto la
ricevuta di verifica. Lo stato creato in memoria è `QUESTION_INBOX`; non viene
assegnata alcuna approvazione scientifica/editoriale. Il collegamento al motore
persistente rimane bloccato: cinque alternative A–E contro le quattro del
contratto Exam v1 e 709 spiegazioni oltre il suo limite di 4.000 caratteri.
Non si elimina l'opzione E, non si convertono frazioni in float e non si
tronca la spiegazione per aggirare tali incompatibilità.

## Autosalvataggio e riapertura

Il probe `ui-autosave/` monta il componente originale con React/jsdom e usa
FastAPI e SQLite reali, solo in loopback e con identità sintetiche. Il trasporto
riordina gli invii; non simula risposte backend. Il relativo README documenta
installazione, dipendenze, comando, pulizia e limiti. Non è un test di browser
reale o di PostgreSQL.

## Proprietà e integrazione

Pro possiede soltanto i nuovi percorsi `bin/pro-regia/` e
`docs/ops/pro-regia/2026-10-21/` in questa branch. Nessuna proprietà viene
attribuita sui file della feature o sui quesiti. Il responsabile della PR #269
deve prendere in carico i finding e consegnare SHA, diff e risultati GREEN;
la responsabilità del contenuto richiede inoltre un reviewer umano autorizzato.

La verifica completa dei gate piattaforma rimane separata. Il PASS delle suite
preesistenti non neutralizza un caso avversariale riprodotto.
