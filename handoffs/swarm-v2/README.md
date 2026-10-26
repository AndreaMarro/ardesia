# Consegne coordinate Ardesia

Questo è l'ingresso al lavoro degli stream Ardesia. Il codice resta nei package e nelle PR originali; le prove restano accanto alla consegna che le ha prodotte. Non è un secondo canone o un sostituto della verifica di GitHub.

## Da leggere per riprendere

1. Generare lo stato con `python3 bin/state/project_state.py`, quindi controllare main, head delle PR e run effettivi.
2. Leggere [CANON-INDEX](../../docs/CANON-INDEX.md), [RUNLOG](../../docs/ops/ARDESIA-RUNLOG.md) e [NEXT-SESSION-PROMPT](../../docs/ops/NEXT-SESSION-PROMPT.md). La memoria è append-only: eventuali smentite sono nuovi addenda datati.
3. Consultare il [registro delle 20 PR e 19 fonti di chat, 26 ottobre](S00/evidence/chat-consolidation/REGISTRY-20261026.md) e il [manifest strutturato](S00/evidence/chat-consolidation/REGISTRY-20261026.json). Contengono SHA, CI, consumer, sovrapposizioni, provenienza e gap. Le fotografie precedenti non attestano lo stato presente.
4. Aprire la consegna del modulo interessato e verificare le prove sulla versione da integrare. S00 compone i raccordi condivisi; gli altri stream mantengono ownership distinte.

## Mappa del lavoro recuperabile

| Ambito | Consegna / sorgente |
| --- | --- |
| Quattro microcorsi, matrice e contenuti | [Consegna dei quattro corsi](../../docs/ops/four-courses-2026-10-25/README.md), [200 obiettivi](../../matrici/QUATTRO_CORSI.md) |
| Integrazione, artefatti e verifiche Vercel | [S00](S00/README.md) |
| Libreria scientifica, modelli SI e grafici | [S01](S01/README.md), PR [317](https://github.com/AndreaMarro/ardesia/pull/317) |
| Shell e disponibilità delle viste | [S02](S02/README.md), PR [308](https://github.com/AndreaMarro/ardesia/pull/308), [316](https://github.com/AndreaMarro/ardesia/pull/316) |
| Revisione scientifica e CAS privato | [S04 / PR310](https://github.com/AndreaMarro/ardesia/pull/310) |
| Memoria delle idee | [S05 / PR315](https://github.com/AndreaMarro/ardesia/pull/315) |
| Studio autonomo e recupero delle fonti | [S06](S06/README.md), PR [309](https://github.com/AndreaMarro/ardesia/pull/309) |
| Lavagna collaborativa, layer e autori | [S07 / PR311](https://github.com/AndreaMarro/ardesia/pull/311) |
| Videoteca, caption e replay | [S08 / PR313](https://github.com/AndreaMarro/ardesia/pull/313) |
| Gestione tutor e calendario Core | [S09](S09/README.md), PR [307](https://github.com/AndreaMarro/ardesia/pull/307), [320](https://github.com/AndreaMarro/ardesia/pull/320) |
| Proiezioni delle evidenze | [S11 / PR312](https://github.com/AndreaMarro/ardesia/pull/312) |
| Formule, acquisizioni REA e asset | [S14 / PR318](https://github.com/AndreaMarro/ardesia/pull/318), [S14–S16 / PR319](https://github.com/AndreaMarro/ardesia/pull/319) |
| Lezione viva, audio e marker | [S17 / PR322](https://github.com/AndreaMarro/ardesia/pull/322) |
| Fonti scientifiche e annotazioni | [S18 / PR324](https://github.com/AndreaMarro/ardesia/pull/324) |
| Laboratorio circuiti Kirchhoff | [S19](S19/README.md), [consumer integrato e prove S00](S00/kirchhoff-composition.md), PR [325](https://github.com/AndreaMarro/ardesia/pull/325) |
| Continuità dell'esperienza didattica | [S20 / PR323](https://github.com/AndreaMarro/ardesia/pull/323) |
| Audit ASTRA A/B e raccordo backend | [Sintesi con provenienza](S00/evidence/chat-consolidation/REGISTRY-20261026.md#lavoro-locale-e-analisi-da-conservare) |
| Misura sovrapposizioni PR | [Audit PRO / PR321](https://github.com/AndreaMarro/ardesia/pull/321) |

S03, S10, S12 e S13 non hanno un pacchetto immutabile autonomo verificato in questa raccolta. Non sono dichiarati completati né assegnati a una chat inventata.

## Come mantenere le consegne

- Una capacità ha un owner, codice nel modulo canonico e un README di consegna. Non copiarla in un altro runtime per integrarla.
- Ogni prova indica comando, input sintetici, runtime, SHA o digest dei file, esito, errori e limiti. Un piano di test si marca NOT_RUN; un PASS di ramo non diventa un PASS di main.
- Gli snapshot datati e i loro checksum si conservano. Una nuova fotografia si aggiunge al registro; le rettifiche identificano esplicitamente la conclusione precedente e la nuova prova.
- Lo storico globale rimane RUNLOG/NEXT. Qui si indicizzano i deliverable, evitando copie delle conversazioni o nuovi documenti di governance.
- Il materiale solo locale si descrive come tale con digest e contenuto utile; prima della pubblicazione si escludono credenziali, dati personali, database, accessi temporanei e trace con cookie. Il [manifest di pubblicazione](S00/evidence/chat-consolidation/PUBLICATION-MANIFEST-20261026.json) delimita questa raccolta.
- Una PR arriva a MERGED, CLOSED_SUPERSEDED con sostituto integrato, CLOSED_REJECTED motivata o BLOCKED_HUMAN_DECISION specifico. La sola chiusura non prova un risultato.
- Conservare separati codice integrato, preview protetta, backend operativo, pubblicazione commerciale e approvazione scientifica.

Al checkpoint del 26 ottobre i quattro corsi restano **0/52, 0/57, 0/33 e 0/58** completamente accettati. I cinque esempi pubblici restano distinti dalla banca DRAFT e dalla beta autenticata.
