# Prova di fisica — Semestre filtro

Primo incremento verticale della prova di fisica: un pack originale di 31
quesiti, un motore di tentativi persistente e una vista studente con timer,
autosalvataggio, consegna e revisione. Non è un fac-simile ufficiale della prova
MUR.

## Regole

- 21 quesiti a scelta multipla e 10 completamenti.
- 50 minuti, timer autoritativo sul server tramite `deadline_at`.
- Risposta corretta `+1,00`; errata `-0,10`; omessa `0,00`; massimo `31,00`.
- Il punteggio è calcolato in decimi interi (`score_tenths`), senza arrotondamenti
  lato client.
- Dopo la scadenza il client ha 10 secondi di grazia per la consegna finale. Oltre
  quel limite il server chiude il tentativo come `expired` usando solo le risposte
  già persistite.

Il pack è in `packages/engine/lessonos/study/content/fisica-semestre-filtro-v1.json`.
Il motore valida identità, numero e tipo dei quesiti, quattro opzioni per gli MCQ,
risposte accettate e tolleranze numeriche. La stessa prova non viene rigenerata a
runtime: lo snapshot viene salvato nel tentativo e usato per correzione e review.

## API

Tutte le rotte sono sotto `/study` e richiedono l'identità Study già usata dal
servizio.

| Metodo | Rotta | Uso |
| --- | --- | --- |
| `GET` | `/exams?editionId=...` | pack pubblico, tentativi e riepiloghi |
| `POST` | `/exams` | avvia o riprende l'unico tentativo aperto |
| `GET` | `/exams/{attempt_id}` | tentativo, domande e risposte salvate |
| `PUT` | `/exams/{attempt_id}/answers` | autosalvataggio delle risposte |
| `POST` | `/exams/{attempt_id}/submit` | consegna e correzione server-side |

Prima della consegna la risposta pubblica contiene solo `id`, `topic`, `type`,
`prompt`, `options`/`format`. `answer`, `accepted`, `explanation` e `result`
restano sul server fino alla chiusura del tentativo.

## Persistenza

La tabella `study_exam_attempts` è alla versione schema 8 e conserva:

- identità di studente ed edizione;
- pack, versione, hash e snapshot immutabile;
- ordine delle domande;
- risposte, stato, timer e risultato;
- `receipt_id` e evento `exam.submitted`.

La sequenza canonica è v6 → v7 (gate di pubblicazione) → v8 (tentativi
d'esame). La migrazione Postgres è
`supabase/migrations/20261021130000_study_exam_attempts.sql`; include RLS per
proprietario e iscrizione. La cancellazione di uno studente elimina i tentativi
per cascata, insieme a ricevute ed eventi già gestiti dal percorso di erasure.

## Interfaccia

`apps/web/src/features/Exam.tsx` è raggiungibile dalla voce studente «Prova di
fisica». La vista:

- mostra la prova in corso prima delle prove concluse;
- salva le risposte con debounce di 700 ms;
- impedisce la consegna doppia e chiede conferma;
- mostra punteggio, corrette, errate, omesse e spiegazioni solo dopo la consegna;
- filtra la review per errori e omissioni.

## Verifica

```sh
# Engine, dalla cartella packages/engine
PYTHONPATH=. python -m pytest -q tests

# API, dalla cartella services/study-api
PYTHONPATH=../../packages/engine:. python -m pytest -q tests

# Web, dalla radice
npm run typecheck:web
npm run test:web
npm run build:web
```

Stato verificato nella branch di convergenza: 2529 test engine passati, 25
saltati; 248 test API passati; typecheck e build web riusciti. La suite web
completa ha un flake pre-esistente in `session-boundary.test.tsx`, presente anche
sul HEAD #272. I test Postgres live restano saltati quando il database non è
disponibile.

## Limiti

- La prova non è un fac-simile ufficiale e non sostituisce la validazione MUR.
- Non ci sono ancora dashboard docente, esportazione risultati o analytics.
- Il deployment Vercel non è stato modificato: `vercel.json` continua a costruire
  `apps/studio`; questa vista vive in `apps/web`.
- La grazia di 10 secondi è una scelta applicativa documentata, non una regola
  MUR.
