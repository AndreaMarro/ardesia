# SYSTEM STATUS — Chi sta lavorando su cosa
© Andrea Marro — ELAB Tutor
Ultimo aggiornamento automatico ad ogni ciclo/task.

---

## REGOLA ANTI-CONFLITTO
Prima di modificare un file, CONTROLLA qui se qualcun altro ci sta lavorando.
Se sì → lavora su ALTRO o aspetta. Mai 2 attori sullo stesso file.

## CHI PUÒ MODIFICARE COSA
| Attore | Può modificare | NON può modificare |
|--------|---------------|-------------------|
| **Andrea (manuale)** | TUTTO | — |
| **Automa Python** | src/, public/ | automa/ (tranne state/) |
| **e2e-tester** | src/, public/ | automa/ |
| **automa-doctor** | automa/ | src/, public/ |
| **galileo-improver** | nanobot.yml, curriculum/, prompt_templates.py | src/ core |
| **competitor-researcher** | NIENTE (solo crea task) | tutto |
| **adversarial-review** | NIENTE (solo crea task) | tutto |
| **simulator-improver** | src/components/simulator/ | automa/, src/ non-simulator |

## PRIORITÀ CONFLITTI
Andrea > Scheduled Tasks > Automa Python
Se Andrea sta lavorando → tutti gli altri si adattano.

## STATO ATTUALE
- **Andrea**: offline (ultimo: 2026-03-25 22:50)
- **Automa Python**: PID 29275, loop 60min, ultimo ciclo: vedi reports/
- **e2e-tester**: prossimo run :12 ore pari
- **automa-doctor**: prossimo run :42 ore pari
- **galileo-improver**: prossimo run :23 (1,5,9,13,17,21)
- **competitor-researcher**: prossimo run :33 (3,9,15,21)
- **adversarial-review**: prossimo run :51 (0,6,12,18)
- **simulator-improver**: prossimo run :07 ogni 3h

## FILE ATTUALMENTE IN LAVORAZIONE
(ogni attore aggiorna questa sezione quando inizia/finisce su un file)

| File | Chi | Da quando | Stato |
|------|-----|-----------|-------|
| — | — | — | libero |

## COMUNICAZIONE
- **Per Andrea**: `automa/state/messages/per-andrea.md`
- **Per automa**: `automa/state/messages/per-automa-python.md`
- **Per task**: `automa/state/messages/per-{nome-task}.md`
- **Risultati condivisi**: `automa/state/shared-results.md`
- **Conflitti**: scrivere qui sotto con timestamp

## LOG CONFLITTI
(nessuno ancora)
