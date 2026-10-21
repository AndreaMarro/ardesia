# Revisione indipendente del pack demo di 31 quesiti

Data: 21 ottobre 2026. Il pack esaminato **non è la banca da 4.000 quesiti**.

- Commit osservato: `b9764d2e1785c26893f424ea547d2df081e0aca2`.
- File: `packages/engine/lessonos/study/content/fisica-semestre-filtro-v1.json`.
- Pack/versione: `fisica-semestre-filtro-v1`, versione `1`. La revisione dei singoli quesiti **non esiste nel file** ed è registrata come `questionRevision: null`; non viene dedotta dalla versione del pack.
- SHA-256 del file: `3e732c79578efcaa27b23e10072338758a24c5970108dfb475a7dd49bf368fa9`.
- Azione: lettura completa, controlli indipendenti Fraction/Decimal della libreria standard Python e casi limite; nessuna modifica al pack o al software.

## Esito e confini della verifica

| Controllo | Risultato effettivo |
|---|---:|
| Quesiti ricevuti in questo pack | 31 |
| ID univoci | 31 |
| MCQ / completamenti | 21 / 10 |
| Quesiti letti dal revisore modello | 31 |
| Quesiti con calcolo/rapporto/bilancio indipendente | 23 |
| Calcoli coerenti con la chiave nel modello fisico inteso | 23 |
| Quesiti concettuali senza verifica numerica indipendente della risposta | 8 |
| Approvazioni scientifiche umane emesse | 0 |
| Transizioni di stato / import / pubblicazioni effettuati | 0 |
| Nuovi quesiti generati | 0 |

**23 calcoli coerenti non significano 23 quesiti approvati.** Alcuni risultati sono corretti soltanto aggiungendo ipotesi non espresse. I controlli non attribuiscono `MATH_VALID`, `SCIENCE_REVIEWED` o `PUBLISHED` al materiale. Il report JSON elenca ogni ID, formula, valore confrontato e condizione.

Esecuzione riproducibile:

```bash
python3 science_probe.py --pack /percorso/al/pack.json --output-dir ./risultati --expected-commit b9764d2e1785c26893f424ea547d2df081e0aca2
```

Il percorso del pack è obbligatorio, senza percorsi macchina incorporati nel codice. Il probe è legato all'hash dei byte effettivamente esaminati e rifiuta altri contenuti: non trasferisce annotazioni scientifiche vecchie a domande modificate. L'argomento facoltativo `--expected-commit` aggiunge una verifica dello SHA Git; il report confronta anche i byte locali con il blob al commit osservato. Se il file è fuori da Git, il commit viene dichiarato non osservabile, mai inventato.

Ripetizione eseguita dalla directory `/tmp`: exit 0, 23 confronti coerenti, hash corrispondente, commit atteso corrispondente, byte del file uguali al blob a HEAD. L'exit 0 attesta l'esecuzione dei confronti, non l'accettazione editoriale/scientifica del pack.

## Sei HOLD nella verifica di integrazione

`quarantine.json` registra sei quesiti in `HOLD` esclusivamente nella nostra verifica di integrazione, associando ID, pack/versione, hash del pack, hash del contenuto del quesito, `questionRevision: null`, motivo, severità e revisione umana obbligatoria. **Non sono stati rimossi dal prodotto o dal database e nessuno stato di pubblicazione è stato modificato.**

I due errori sulle unità sono distinti dalle quattro ambiguità/ipotesi fisiche da sottoporre al revisore umano. Per `fis-comp-29` la riproduzione di grading è stata effettuata dal reviewer software separato, non da questo probe.

| ID nel pack versione 1; revisione quesito assente | Posizione nel JSON | Motivo |
|---|---:|---|
| `fis-elettro-11` | 161 | Il dimezzamento della capacità richiede condensatore piano ideale, area e dielettrico fissi, effetti di bordo e perdite trascurabili. Il testo dice soltanto condensatore e allontanamento delle armature; la soluzione introduce successivamente il modello piano. |
| `fis-elettro-13` | 189 | Manca la geometria magnete/spira e la variazione non nulla di flusso. Un dipolo magnetico nel piano della spira, che si avvicina restando nello stesso piano, ha campo normale nullo sulla superficie: flusso e f.e.m. circuitale restano zero. La conclusione incondizionata non vale per ogni configurazione ammessa dal testo. |
| `fis-onde-17` | 245 | Non è specificata incidenza obliqua. A incidenza normale, Snell dà angolo rifratto nullo: oltre alla frequenza, anche l'angolo non cambia. La frase conclusiva della spiegazione, secondo cui l'angolo cambia, manca di questa eccezione. Precisare invarianti generali o l'incidenza. |
| `fis-comp-22` | 315; unità a 333 | Il numero 10 è corretto, ma `numeric.units` include `m/s⁻¹`: dividere per s⁻¹ equivale a moltiplicare per s. Dimensione L·T invece di L/T. |
| `fis-comp-23` | 341 | Stessa direzione non specifica stesso verso. Con forza +10 N e spostamento −3 m lungo la stessa retta, il prodotto scalare dà −30 J, mentre la chiave ammette +30 J. Occorre specificare direzione **e verso**, o l'angolo nullo. |
| `fis-comp-29` | 479; unità a 497 | Valore fisico corretto: 20.000 Pa = 20 kPa. Le unità ammesse contengono kPa senza scala nel contratto corrente. Il difetto eseguibile di grading è trattato separatamente dal reviewer software, senza duplicarne qui il probe. |

## Altri problemi editoriali e di copertura

- Tutte le **21 MCQ hanno 4 alternative**, mentre l'Allegato 2 del DM 941/2026 ne prescrive 5. Il validator in `exam.py:70` impone anch'esso 4: non è soltanto un'omissione del singolo quesito. Fonte: <https://www.mur.gov.it/sites/default/files/2026-07/All.%202%20al%20D.M.%2010-07-2026%20n.%20941.pdf>, punto 4.
- Le spiegazioni hanno **10–46 parole**, mediana 27; 878 parole complessive. Il conteggio è descrittivo, non una soglia di approvazione. La lettura conferma feedback compatti, utili per una demo, ma non spiegazioni discorsive con tutti i passaggi richieste dal mandato. Per esempio `fis-mecc-04` cita lo scambio delle velocità senza ricavarlo dalle due conservazioni; `fis-comp-27` espone soltanto prodotto e risultato.
- `fis-mod-21` e `fis-comp-28` chiedono entrambi la frazione rimasta dopo esattamente tre emivite: 1/8. È una ripetizione concettuale molto stretta, identificata per lettura, non una deduplicazione automatica dell'intero corpus.
- `fis-termo-08` e `fis-comp-25`: dichiarare quantità di gas costante. `fis-termo-06`: esplicitare le unità del coefficiente di R e il motivo per cui il lavoro è nullo. `fis-mod-21`: parlare di nuclei originari non decaduti, non genericamente di campione rimasto. `fis-comp-30`: `costante` può suggerire invariabilità nel tempo; la proprietà è uguaglianza della corrente fra componenti, anche se varia nel tempo.
- `fis-mod-20` sull'effetto fotoelettrico è fisicamente coerente nel modello ideale a frequenza fissata, ma l'effetto fotoelettrico non è nominato esplicitamente nel syllabus 2026. Classificarlo come estensione o motivare il legame con l'obiettivo sui fotoni prima di usarlo come copertura ministeriale certificata.
- Il pack non contiene per ogni quesito le chiavi `unit`, `macroarea`, `microarea`, `competence`, `difficulty`, `revision`. Contiene una revisione del pack e `topic`. Questa constatazione non impone uno schema nuovo: richiede un mapping al contratto canonico esistente e provenienza verificabile.

## Calcolatrice

Non emergono calcoli che richiedano intrinsecamente una calcolatrice nel modello inteso. Le operazioni sono intere, razionali o rapporti semplici. `fis-mecc-03` richiede √15,68 = 3,959797… m/s, arrotondato correttamente a 4,0 m/s: la stima mentale mediante √16 è sufficiente alle opzioni, ma il passaggio di approssimazione andrebbe spiegato. Questa valutazione è manuale e non misura il tempo effettivo richiesto a studenti reali.

## Consegne

- `science_probe.py`: probe in sola lettura della libreria standard.
- `science-report.json`: conteggi, condizioni, casi limite e annotazioni per tutti i 31 ID.
- `quarantine.json`: sei HOLD della sola verifica di integrazione; due errori sulle unità P1 e quattro ambiguità/ipotesi P2 da revisione umana, senza mutazioni del prodotto.
- Questo riepilogo.

**Nessuna approvazione scientifica definitiva e nessuna modifica al contenuto.**
