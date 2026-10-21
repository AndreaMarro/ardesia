# PR 270 — Verifica indipendente della consegna 4.000 quesiti

Data: 21 ottobre 2026. Revisione del commit `e9c87b072913744f6cc6df21217b8856cddfef1f`, branch `codex/physics-bank-4000-20261021`.

**La banca è stata ricevuta e contata: contiene effettivamente 4.000 record.** Non è più corretto riferire questa consegna come non disponibile. Restano distinti ricezione, validazione tecnica, verifica scientifica e pubblicazione.

- Repository/PR: <https://github.com/AndreaMarro/ardesia/pull/270>
- Bank ID/versione: `physics-semestre-2026`, versione `1`.
- Manifest SHA-256: `15110c78e3b615eb4a3a50c8d33c179a6e35cd9495e2f6764b29cd9485850896`.
- Fonte: `packages/engine/lessonos/study/content/physics-semestre-2026-bank/`.
- Nessun generatore eseguito, nessuna domanda creata, nessun contenuto o codice della branch modificato. `git status --short` vuoto dopo i controlli.

## Conteggi verificati dai file

| Indicatore | Risultato |
|---|---:|
| Shard presenti e corrispondenti al manifest | 27 / 27 |
| Hash SHA-256 dei singoli shard coerenti | 27 / 27 |
| Quesiti totali / ID univoci | 4.000 / 4.000 |
| Base / facili / medi / difficili | 1.000 / 1.000 / 1.000 / 1.000 |
| Risposta multipla, tutte con cinque opzioni | 2.537 |
| Completamento | 1.463 |
| Ambito dichiarato `syllabus_core` | 3.821 |
| Ambito dichiarato `provided_law_extension` | 179 |
| Versione del singolo quesito | 1 per tutti i 4.000 |
| Stato DRAFT | 4.000 |
| Reviewer nullo | 4.000 |
| Revisione scientifica umana NOT_RUN | 4.000 |
| Famiglie di quesiti / famiglie di leggi | 250 / 212 |
| Record dichiarati come task scritti individualmente | 147 |

Distribuzione per unità: U1 160; U2 928; U3 800; U4 272; U5 672; U6 800; U7 368. Questi sono conteggi di record etichettati; non attestano da soli la correttezza dell'assegnazione al syllabus o la profondità della copertura.

## Controlli tecnici realmente eseguiti

Il validator del produttore è stato letto prima dell'esecuzione. Poiché scrive un report nel repository, è stato caricato senza avviare il generatore e con la sola destinazione del report deviata in una directory temporanea esterna. Le fonti, i test e gli assert sono rimasti invariati. Python è stato eseguito con scrittura del bytecode disabilitata.

Installata `jsonschema==4.23.0` soltanto nel virtualenv temporaneo. Rerun del validator: **PASS**, zero errori, 12,839 secondi.

| Controllo eseguito | Copertura |
|---|---:|
| Validazione JSON Schema Draft 2020-12 | 4.000 record |
| Proiezione studente: assenza delle chiavi private e di `option.exact` | 4.000 record |
| Risposta canonica inviata al grader, correzione e soluzione restituite | 4.000 record |
| Simulazioni controllate | 10: cinque seed per ciascuno dei due profili |
| Mix quesiti, determinismo, ID e famiglie distinti nelle simulazioni | PASS nei dieci casi |
| Mappature della tassonomia risolte | 147 / 147 |
| Obiettivi storici mappati | 62 |

Il round trip **chiave fornita → grader → corretto** verifica l'integrazione, non dimostra che la chiave sia fisicamente giusta. Le mappature sono verificate come riferimenti esistenti, non come equivalenza didattica approvata.

Il probe indipendente, che non importa generatore o grader, ha verificato anche **1.138 insiemi di opzioni razionali**: nessun distrattore razionalmente equivalente alla chiave e cinque valori distinti nei set esaminabili con Fraction. Non è una verifica simbolica o dimensionale completa delle altre MCQ.

## Duplicazioni e originalità

Su tutti i 4.000 record: zero gruppi con prompt identico; zero dopo normalizzazione Unicode/spazi/maiuscole; zero dopo ulteriore sostituzione delle cifre; zero firme semantiche duplicate.

**Non ne consegue unicità semantica dimostrata.** Le firme sono metadati del produttore e le comparazioni testuali non riconoscono automaticamente parafrasi o problemi fisicamente equivalenti. Non è stata eseguita una comparazione dell'intero contenuto con banche esterne protette da diritti.

## Campione scientifico indipendente: dieci quesiti

I seguenti calcoli sono stati ricavati dai testi usando la libreria standard `Fraction`, senza valutare le formule contenute nei metadati `verification`.

| ID, versione 1 | Verifica indipendente | Esito numerico |
|---|---|---:|
| `u1-area-conversion-01` | Conversione area: 2 × 2² | 8 |
| `u2-uniform-displacement-01` | Spostamento uniforme: 2 × 2 | 4 m |
| `u3-pressure-area-01` | Pressione relativa: 12 / 3 | 4 Pa |
| `u4-wave-wavelength-01` | Lunghezza d'onda: 12 / 3 | 4 m |
| `u5-temperature-difference-01` | Differenza dopo conversione di entrambi i valori Celsius | 20 K |
| `u6-coulomb-force-01` | Coulomb con microcoulomb e centimetri convertiti in SI | 10 N |
| `u7-wavelength-in-medium-01` | Frequenza fissa, 600 / 2 | 300 nm |
| `u3-pressure-area-13` | Nuova pressione 5 Pa; nuova area 4 m²; rapporto 4 / 3 | 4/3 |
| `u5-temperature-difference-13` | Nuova differenza 50 K; freddo finale 10 °C; rapporto numerico 10 / 20 | 1/2 |
| `u6-coulomb-force-13` | 18 = 2 / rapporto²; radice positiva | 1/3 |

**Dieci risultati coerenti, nessuna approvazione scientifica umana.** Nel quesito `u5-temperature-difference-13` il testo introduttivo esclude rapporti fra temperature ma la richiesta successiva domanda proprio il rapporto dei valori Celsius. Il valore 1/2 è matematicamente coerente con quei valori numerici, ma non è il rapporto delle temperature assolute: proposta di revisione editoriale/scientifica della formulazione, senza correzione silenziosa.

I dieci campioni sono risolvibili senza calcolatrice. Nessuna conclusione equivalente viene estesa automaticamente a tutti i 4.000 record.

## Blocchi e limiti materiali

1. **Approvazione umana assente:** tutti i 4.000 record sono DRAFT, reviewer nullo, revisione umana NOT_RUN. Nessun passaggio SCIENCE_REVIEWED, EDITORIALLY_APPROVED, IMPORTED o PUBLISHED viene attribuito da questa verifica.
2. **Evidenza matematica incompleta nel contenuto:** 1.653 record dichiarano `verification.arithmetic = exact_sympy` ma hanno `automaticChecks = []`. Questo non prova che il risultato sia errato; significa che manca in quei record una traccia individuale dei controlli. Non sono stati rieseguiti 4.000 controlli matematici indipendenti.
3. **Persistenza assente in questo sottosistema:** il contratto esaminato dichiara e restituisce `persisted: false`. Il test controlla questa dichiarazione: non è un PASS per tentativi, ricevute o memoria degli errori persistenti in LessonOS.
4. **Originalità semantica e difficoltà non validate empiricamente:** il manifest lo dichiara; conteggi e controlli testuali non sostituiscono revisione e pilot.
5. **Spiegazioni lunghe, qualità non automaticamente approvata:** 213–1.129 parole per soluzione, 2.116.930 parole totali secondo il conteggio `\w+`. Nei campioni compaiono ripetizioni fra sezioni; la lunghezza non è una misura sufficiente di chiarezza o completezza.

## Artefatti ed esecuzione

- `bin/pro-regia/independent_bank_audit.py` e `independent-inventory.json`: inventario, hash, confronti testuali, opzioni razionali e dieci calcoli indipendenti.
- `bin/pro-regia/run_delivery_validation.py`, `delivery-validation-rerun.json`, `validator.log`: rerun del validator senza scritture nel worktree.
- Questo report.

Eseguire dalla radice della checkout Pro-Regia. `--repo` indica una checkout
separata della PR #270, che contiene la banca; l'output deve essere esterno a
quella checkout.

```bash
python -B bin/pro-regia/independent_bank_audit.py --repo /percorso/pr270-checkout --output-dir /tmp/ardesia-bank-audit --expected-commit e9c87b072913744f6cc6df21217b8856cddfef1f
python -B bin/pro-regia/run_delivery_validation.py --repo /percorso/pr270-checkout --output-dir /tmp/ardesia-bank-audit --expected-commit e9c87b072913744f6cc6df21217b8856cddfef1f
```

La seconda esecuzione richiede `jsonschema==4.23.0`; nessun modello AI, CAS o accesso di rete viene usato durante i due probe.
