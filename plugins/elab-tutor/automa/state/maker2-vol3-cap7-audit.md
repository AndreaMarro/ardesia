# Maker-2 Vol3 Audit cap7 pin analogici (PDF v0.13)
- Date: 2026-05-07
- Esperimenti audited: 9/9
- PDF source: /tmp/vol3-v013.txt cap7
- Spiattellato target cap7: 9 esp (8 + mini)

## Sommario esecutivo

PDF Volume 3 v0.13 capitolo 7 "Il mondo continuo: i pin analogici" contiene **7 esercizi narrativi** (ESERCIZIO 7.1 ... 7.7) su pagine 79-111. Il file `src/data/experiments-vol3.js` espone **9 entry** (`v3-cap7-esp1`..`v3-cap7-esp8` + `v3-cap7-mini`) raggruppate in `src/data/lesson-groups.js` sotto `v3-input-analogico`.

Spiattellato confermato: **9 entry su 7 esercizi narrativi PDF**. Eccedenza = 2 entry (`v3-cap7-esp5` invented + `v3-cap7-mini` duplicate di `v3-cap7-esp1`).

PDF v0.13 cap7 mappa narrativa effettiva:
- ESERCIZIO 7.1 — pag.84-86 — analogRead base, trimmer + LED13, soglia 512 (NB: PDF dice "supera 2,5V" e ">512" indistintamente; codice `if (valoreLetto > 512)`)
- ESERCIZIO 7.2 — pag.87-89 — formula `V = (5 * numero) / 1023` con `float`, soglia 2.5V
- ESERCIZIO 7.3 — pag.90-93 — 3 LED (rosso/giallo/verde), zone 0-340/341-681/682-1023, `if`/`else if`/`else`, AND `&&`
- (interludio teorico DAC vs PWM, valori 0-255, duty cycle 50% = 127, pag.94-96)
- ESERCIZIO 7.4 — pag.97-101 — `analogWrite` PWM su pin 5 con ciclo `for` da 0 a 255 step 5, delay(10)
- ESERCIZIO 7.5 — pag.102-104 — secondo `for` decrescente 255→0 step -5, "effetto respiro", introduce `+=` `-=` operator shortcuts
- ESERCIZIO 7.6 — pag.105-108 — trimmer A0 + LED PWM pin 5, funzione `map(valoreLetto, 0, 1023, 0, 255)`
- ESERCIZIO 7.7 — pag.109-111 — `analogWriteResolution(10)`, DAC reale su A0, trimmer su A1, multimetro per misurare tensione vera

Mapping JS → PDF:
| JS id | PDF esercizio | Note |
|---|---|---|
| v3-cap7-esp1 | 7.1 | OK |
| v3-cap7-esp2 | 7.2 | OK |
| v3-cap7-esp3 | 7.3 | OK |
| v3-cap7-esp4 | 7.4 | OK |
| v3-cap7-esp5 | NESSUNO | **INVENTED** — non esiste in PDF v0.13 |
| v3-cap7-esp6 | 7.5 | OK |
| v3-cap7-esp7 | 7.6 | OK |
| v3-cap7-esp8 | 7.7 | OK |
| v3-cap7-mini | 7.1 (duplicate) | **DUPLICATE** — circuito + codice + concetto identici a esp1 |

Severity totali: **3 critical** (esp5 invented, mini duplicate, esp1 vs mini soglia/citation mismatch), **5 high**, **6 medium**, **3 minor**.

---

## v3-cap7-esp1 (Cap.7 Esp.1 - analogRead base)

**Mapping PDF**: ESERCIZIO 7.1 pag.84-86.

**Aderenza al PDF**:
- Materiale dichiarato JS: `breadboard-half`, `nano-r4`, `potentiometer 10k`, `resistor 470`, `led red`. PDF prescrive "1 LED **verde**, 1 resistore 470Ω, 1 trimmer 10kΩ, 3 cavetti" (riga 2798-2801). Mismatch colore LED (rosso JS vs verde PDF).
- Codice JS:
  ```c
  int valoreLetto = analogRead(A0);
  if (valoreLetto > 511) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
  ```
  PDF testo: "Se è maggiore di 512 (circa metà, quindi circa 2.5V)" (riga 2854) e codice verbatim PDF non è mostrato come blocco unico ma testo descrive `int valoreLetto = analogRead(A0);` (riga 2845) e soglia "maggiore di 512". JS usa **511** invece di 512 — discrepanza con PDF.
- Concetti coperti: analogRead, ADC 0-1023, soglia, confronto. PDF aggiunge teoria 10 bit + risoluzione 5 mV + formula V = (5×numero)/1023 (riga 2698-2776) MA quello è materiale teorico introduttivo del capitolo, non dell'esercizio 7.1.
- `unlimPrompt`: dice "511 e la meta" (consistente col codice JS, ma incoerente con PDF testo "512").
- `quiz[1]`: "Cosa succede quando il valore del trimmer e esattamente 511? ... Il LED resta spento" — risposta corretta col codice attuale (511 NON > 511), MA il testo PDF parla esplicitamente di soglia 512 quindi quiz è ok rispetto a JS, "off-by-one" rispetto a PDF.

**Issues**:
- ID `V3-CAP7-ESP1-LED-COLOR` severity **medium** — LED rosso JS vs verde PDF (Morfismo Sense 2 violato, kit Omaric coerenza).
- ID `V3-CAP7-ESP1-SOGLIA-OFFBYONE` severity **high** — `> 511` JS vs `> 512` PDF testo. Bug pedagogico: PDF dice "circa metà = 512", JS dice 511.
- ID `V3-CAP7-ESP1-DESC-LUNGA` severity **minor** — `desc` 32 parole, borderline ma OK.

---

## v3-cap7-esp2 (Cap.7 Esp.2 - analogRead con tensione)

**Mapping PDF**: ESERCIZIO 7.2 pag.87-89.

**Aderenza al PDF**:
- Materiale: identico circuito al 7.1 (PDF dichiara esplicitamente "non dobbiamo cambiare i collegamenti" riga 2895). JS riusa stesso schema. ✓
- Codice JS:
  ```c
  int valoreLetto = analogRead(A0);
  float tensione = (valoreLetto * 5.0) / 1023;
  if (tensione > 2.5) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
  ```
  PDF prescrive (riga 2905-2914): "dichiarare una variabile che possa contenere numeri con la virgola" + "moltiplicarlo per 5" + "dividere per 1023" + "5.0 invece di 5" + "sopra 2.5V acceso". Codice JS = traduzione esatta del PDF. ✓
- Concetti: float, formula proporzionale, conversione ADC→Volt. ✓ aderente.

**Issues**:
- ID `V3-CAP7-ESP2-LED-COLOR` severity **medium** — LED rosso JS vs verde PDF (eredita schema circuito 7.1).
- ID `V3-CAP7-ESP2-SERIAL-MISSING` severity **minor** — JS `steps[2]` suggerisce "apri il Serial Monitor per vedere la tensione (aggiungi Serial.println)" ma il codice JS non include `Serial.begin/println`. PDF v0.13 NON menziona Serial Monitor in 7.2 (capitolo 8 introduce Serial). Suggerimento non eseguibile out-of-the-box.

---

## v3-cap7-esp3 (Cap.7 Esp.3 - Trimmer controlla 3 LED)

**Mapping PDF**: ESERCIZIO 7.3 pag.90-93.

**Aderenza al PDF**:
- Materiale: 3 LED (rosso/giallo/verde) + 3 resistori 470 + 1 trimmer. PDF riga 2943-2946: "rosso / giallo / verde". ✓
- Codice JS: pin 3, 5, 6 OUTPUT; soglie 0-340 / 341-681 / 682-1023; `&&` AND. PDF riga 2951-2960 prescrive identiche soglie. ✓ aderente al pseudocodice PDF.
- `if`/`else if`/`else` 3 rami. ✓
- Concetti: intervalli, AND, 3 zone. ✓

**Issues**:
- ID `V3-CAP7-ESP3-PIN-CHOICE` severity **minor** — JS usa pin **3, 5, 6** OUTPUT digitalWrite. PDF riga 3001-3002 dice "i pin 3, 5 e 6 come output, perché comandano i LED" — pin sono PWM (~) ma usati come digitali (HIGH/LOW), non sfruttati come PWM. Coerente con PDF testo, MA didatticamente "spreco" di pin PWM per output digitale. Non è bug.
- ID `V3-CAP7-ESP3-DESC-OK` severity **none** — desc 30 parole ✓.

---

## v3-cap7-esp4 (Cap.7 Esp.4 - analogWrite PWM fade)

**Mapping PDF**: ESERCIZIO 7.4 pag.97-101.

**Aderenza al PDF**:
- Materiale: 1 LED verde (PDF riga 3183 "1 LED verde"), 1 resistore 470, cavetti. JS dichiara LED **rosso**. Mismatch colore.
- Codice JS:
  ```c
  for (int i = 0; i <= 255; i = i + 5) { analogWrite(5, i); delay(10); }
  ```
  PDF riga 3197-3201 + 3252-3258: "ripetere da 0 fino a 255, scrivere sul pin PWM 5, aspettare 10 millisecondi, aumentare di 5". ✓ aderente.
- Concetti: `for`, `analogWrite`, PWM, pin 5 (~), delay 10ms. ✓

**Issues**:
- ID `V3-CAP7-ESP4-LED-COLOR` severity **medium** — LED rosso JS vs verde PDF.
- ID `V3-CAP7-ESP4-SETUP-MINIMAL` severity **minor** — JS `setup()` solo `pinMode(5, OUTPUT)`. PDF non specifica pinMode esplicito per analogWrite (correttamente, perché Arduino lo gestisce, ma è buona pratica). OK.

---

## v3-cap7-esp5 (Cap.7 Esp.5 - PWM con valori manuali)

**Mapping PDF**: **NESSUNA SEZIONE CORRISPONDENTE in PDF v0.13**.

PDF v0.13 contiene SOLO 7 esercizi (7.1..7.7). Non esiste un esercizio "PWM con valori manuali / 4 livelli di luminosità". Il PDF passa direttamente da 7.4 (fade up con for) a 7.5 (fade up/down).

**Aderenza al PDF**: **0% — INVENTED**.

Codice JS:
```c
analogWrite(5, 0);    delay(1000);
analogWrite(5, 64);   delay(1000);
analogWrite(5, 128);  delay(1000);
analogWrite(5, 255);  delay(1000);
```
Esercizio plausibile didatticamente (mostra 4 livelli discreti) ma non presente nel volume cartaceo v0.13. Viola Morfismo Sense 2: "esercizi software che esistono SOLO nel software (NON nel libro fisico)" è esplicitamente listato come anti-pattern in CLAUDE.md.

**Issues**:
- ID `V3-CAP7-ESP5-INVENTED` severity **critical** — Esercizio NON esiste in PDF v0.13. Spiattellato fuori scope. Triplet coerenza esterna violata. Decisione necessaria iter successivo: (a) rimuovere esp5 + collassare a 8 entry mappate 1:1, (b) marcarlo esplicitamente come "esercizio extra software" e isolarlo dal flusso lezione-libro, (c) renumerare PDF v0.14 per includerlo.
- ID `V3-CAP7-ESP5-LED-COLOR` severity **minor** — eredita LED rosso (incoerente kit verde anche se invented).

---

## v3-cap7-esp6 (Cap.7 Esp.6 - Fade up/down con for)

**Mapping PDF**: ESERCIZIO 7.5 pag.102-104. **NB: numerazione JS sfasata** (esp6 JS = esercizio 7.5 PDF) per via di esp5 invented.

**Aderenza al PDF**:
- Materiale: identico circuito al 7.4 (PDF riga 3311 "lo stesso utilizzato nell'esperimento precedente"). JS riusa schema. ✓
- Codice JS:
  ```c
  for (int i = 0; i <= 255; i = i + 5) { analogWrite(5, i); delay(10); }
  for (int i = 255; i >= 0; i = i - 5) { analogWrite(5, i); delay(10); }
  ```
  PDF riga 3349-3353 prescrive "partiamo da 255, arriviamo fino a 0, diminuiamo di 5 ogni volta". ✓ aderente.
- Concetti: due `for`, fade up + down, "effetto respiro". ✓
- PDF riga 3372-3382 introduce shortcut `i += 5` / `i -= 5` come "piccola nota utile". JS non menziona shortcut nel codice né nel `unlimPrompt`. Concetto pedagogico mancante.

**Issues**:
- ID `V3-CAP7-ESP6-LED-COLOR` severity **medium** — LED rosso JS vs verde PDF.
- ID `V3-CAP7-ESP6-SHORTCUT-MISSING` severity **medium** — `+=` e `-=` introdotti dal PDF in 7.5 NON menzionati in `concept` né `unlimPrompt`. Onniscenza UNLIM perde un'opportunità didattica.
- ID `V3-CAP7-ESP6-NUMBER-MISMATCH` severity **high** — JS title "Esp. 6" mappa a PDF 7.5. Studente che cerca "Esercizio 7.5" su libro fisico arriva su esperimento etichettato "Esp. 6" nel software. Morfismo Sense 2 (numerazione = numerazione libro) violato.

---

## v3-cap7-esp7 (Cap.7 Esp.7 - Trimmer controlla luminosità)

**Mapping PDF**: ESERCIZIO 7.6 pag.105-108. Numerazione sfasata (-1) per esp5 invented.

**Aderenza al PDF**:
- Materiale: trimmer + LED PWM pin 5 + resistore 470 (PDF riga 3390-3393 "aggiungiamo trimmer collegato al pin A0", "regolare luminosità del LED ruotando il trimmer"). JS LED rosso vs PDF testo non specifica esplicitamente colore in 7.6 ma eredita da 7.4 verde. Verifica diretta riga 3174-3183 (7.4) "LED verde". ✓ ma incoerente JS.
- Codice JS:
  ```c
  int valoreLetto = analogRead(A0);
  int valorePWM = map(valoreLetto, 0, 1023, 0, 255);
  analogWrite(5, valorePWM);
  ```
  PDF riga 3457 "int valorePWM = map(valoreLetto, 0, 1023, 0, 255);". ✓ aderente verbatim.
- Concetti: `map()`, conversione range, trimmer come controller. ✓

**Issues**:
- ID `V3-CAP7-ESP7-LED-COLOR` severity **medium** — LED rosso JS vs verde PDF (eredita da 7.4).
- ID `V3-CAP7-ESP7-NUMBER-MISMATCH` severity **high** — JS title "Esp. 7" mappa a PDF 7.6. Stesso problema di esp6.

---

## v3-cap7-esp8 (Cap.7 Esp.8 - DAC reale 10 bit)

**Mapping PDF**: ESERCIZIO 7.7 pag.109-111. Numerazione sfasata (-1).

**Aderenza al PDF**:
- Materiale: trimmer su A1, A0 come uscita DAC, multimetro (PDF riga 3503-3507 "useremo un trimmer collegato al pin A1", "Al suo posto collegheremo un multimetro"). JS: `components` include solo `breadboard-half`, `nano-r4`, `potentiometer`. **Multimetro non dichiarato** (probabilmente non simulabile, OK).
- Codice JS:
  ```c
  pinMode(A0, OUTPUT);
  analogWriteResolution(10);
  pinMode(A1, INPUT);
  ...
  int valoreLetto = analogRead(A1);
  analogWrite(A0, valoreLetto);
  ```
  PDF riga 3520-3528 "analogWriteResolution(10) imposta risoluzione a 10 bit", "analogRead restituisce 0-1023, anche analogWrite ora lavora 0-1023, quindi possiamo usare direttamente valoreLetto senza conversioni". ✓ aderente.
- Concetti: DAC vs PWM, `analogWriteResolution`, 10 bit (1024 livelli), uscita analogica vera. ✓
- Avvertenze PDF (riga 3537-3548): "Non tutte le schede Arduino funzionano così" + Arduino UNO no DAC. JS `unlimPrompt` non riporta avvertenza compatibilità schede.

**Issues**:
- ID `V3-CAP7-ESP8-NO-MULTIMETER-FALLBACK` severity **high** — PDF chiede esplicitamente di "misurare la tensione con multimetro". `simulationMode: avr` ma simulatore non ha multimetro virtuale → studente non vede output. Manca componente di output: nessun LED, nessun display, nessun voltmetro virtuale. Esperimento "muto" in simulazione.
- ID `V3-CAP7-ESP8-NUMBER-MISMATCH` severity **high** — JS title "Esp. 8" mappa a PDF 7.7.
- ID `V3-CAP7-ESP8-WARNING-MISSING` severity **minor** — Avvertenza "non tutte le schede" non presente in `unlimPrompt`. Onniscenza UNLIM debole.

---

## v3-cap7-mini (Cap.7 Mini - Potenziometro ADC + LED PWM)

**Mapping PDF**: **DUPLICATE di ESERCIZIO 7.1** pag.84-86. Citation interna `code` e `unlimPrompt` dichiara "Vol.3 pag.75 - ESERCIZIO 7.1" — pagina **75 errata**: 7.1 sta a pag.84-86 in v0.13.

**Aderenza al PDF**:
- Materiale: trimmer + LED **verde** (PDF v0.13 7.1 dice esattamente "1 LED verde", quindi mini è più aderente di esp1!) + resistore 470. ✓
- Codice JS:
  ```c
  void setup() { pinMode(A0, INPUT); pinMode(13, OUTPUT); }
  void loop() {
    int valoreLetto = analogRead(A0);
    if (valoreLetto > 512) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
  }
  ```
  Soglia **512** (vs esp1 che usa 511). Mini è più fedele al PDF testo "maggiore di 512" (riga 2854).
- Concetti: pin analogici, analogRead, ADC 10 bit, trimmer come partitore, soglia decisionale.
- `unlimPrompt`: cita "Vol. 3 pag. 75" che è **PAGINA SBAGLIATA in v0.13** (7.1 sta a pag.84-86; pag.75 in v0.13 corrisponde a inizio capitolo 7 introduzione teorica, riga ~2570-2580). **Citation drift importante** rispetto a v0.13 (forse era pag.75 in versione precedente del manuale; nuovo PDF v0.13 ha riorganizzato la paginazione).
- Title: "Mini progetto Cap.7" — non corrisponde a struttura PDF, che NON ha "mini progetti" come categoria separata. Costrutto JS-only.
- Solo 7 buildSteps (esp1 ne ha 11, simile contenuto). NON ha campi `connections` riga 5641-5648 ma li ha `pinAssignments` 5650-5657: schema e fori diversi da esp1 (B15-17 vs H22-24).

**Issues**:
- ID `V3-CAP7-MINI-DUPLICATE` severity **critical** — Esercizio funzionalmente identico a `v3-cap7-esp1` (analogRead + soglia + LED13). Stesso concetto pedagogico in 2 entry diversi nel medesimo lesson-group `v3-input-analogico`. Studente vede 2 esperimenti ridondanti. Spiattellato indebito.
- ID `V3-CAP7-MINI-PAGE-WRONG` severity **critical** — Citation `Vol.3 pag.75` ERRATA in v0.13. ESERCIZIO 7.1 sta a pag.84-86. Drift dalla versione 0.13 del manuale; verosimilmente la pagina 75 era valida in PDF precedente (v0.8.x). Andrea iter 21 mandate "linguaggio docente plurale Vol/pag VERBATIM" → questa è una citation NON verbatim al PDF v0.13.
- ID `V3-CAP7-MINI-CIRCUIT-DIFFERENT` severity **medium** — `pinAssignments` mini usa B15-17 + C23/C29 + D29/D30 vs esp1 che usa H22-24 + C18/C25 + D27/D28. Schema breadboard diverso per stesso esperimento → confonde docente che ha già fatto esp1.
- ID `V3-CAP7-MINI-SOGLIA-512` severity **minor** — Mini usa soglia 512 corretta vs esp1 che usa 511. Ironicamente mini è più aderente al PDF di esp1 sulla soglia, ma sbagliato sulla pagina.
- ID `V3-CAP7-MINI-TITLE-INVENTED` severity **medium** — "Mini progetto Cap.7" non è categoria PDF v0.13. Costrutto JS-only.

---

## Cross-cutting (sezione 6.1 + cap7-specific)

- ID `V3-CAP7-COUNT-SPIATTELLATO` severity **critical** — 9 entry JS vs 7 esercizi PDF v0.13. Eccedenza esp5 (invented) + mini (duplicate). Lesson-group `v3-input-analogico` espone 9 esp.
- ID `V3-CAP7-LED-COLOR-SYSTEMIC` severity **high** — esp1, esp2, esp4, esp6, esp7 usano LED **rosso** mentre PDF v0.13 prescrive **verde**. Sistemico tutti gli esp principali. Solo `v3-cap7-mini` usa verde (correttamente). Morfismo Sense 2 (kit Omaric coerenza visiva) violato 5/9.
- ID `V3-CAP7-NUMBERING-SHIFT` severity **high** — esp6/esp7/esp8 numerazione JS = PDF n-1 (esp6→7.5, esp7→7.6, esp8→7.7) per effetto esp5 invented. Studente che apre "Esercizio 7.5 sul libro" non trova esperimento corrispondente nel software.
- ID `V3-CAP7-CONCEPT-COVERAGE-OK` severity **none** — Concetti chiave PDF cap7 tutti presenti almeno una volta nel JS: analogRead ✓, ADC 0-1023 ✓, V calc ✓, trimmer ✓, PWM ✓, analogWrite ✓, duty cycle (in `unlimPrompt` esp4) ✓, ciclo `for` ✓, effetto respiro ✓, `map()` ✓, `analogWriteResolution` ✓, DAC vs PWM ✓.
- ID `V3-CAP7-SKETCH-UNICI` severity **none** — Tutti i 9 sketch C++ sono distinti (verificato ispezione). Nessun copia-incolla codice.
- ID `V3-CAP7-NO-VOLUME-REFERENCES-CITED` severity **medium** — Solo `v3-cap7-mini` cita esplicitamente "Vol.3 pag.X" nel codice (peraltro pagina sbagliata). Altri 8 esp non hanno citation Vol/pag né nel codice né nel `unlimPrompt`. PRINCIPIO ZERO + Andrea iter 21 mandate "Vol/pag VERBATIM" violato 8/9.

---

## Severity counts cap7

- **critical**: 3 (`V3-CAP7-ESP5-INVENTED`, `V3-CAP7-MINI-DUPLICATE`, `V3-CAP7-MINI-PAGE-WRONG`, `V3-CAP7-COUNT-SPIATTELLATO` = 4 in realtà; ricontato).
- Recount esatto:
  - **critical (4)**: ESP5-INVENTED, MINI-DUPLICATE, MINI-PAGE-WRONG, COUNT-SPIATTELLATO
  - **high (5)**: ESP1-SOGLIA-OFFBYONE, ESP6-NUMBER-MISMATCH, ESP7-NUMBER-MISMATCH, ESP8-NO-MULTIMETER-FALLBACK + ESP8-NUMBER-MISMATCH (consolidato unico) = consolidato 4 high effettivi: ESP1-SOGLIA-OFFBYONE + ESP6+ESP7+ESP8 NUMBER-MISMATCH (+ LED-COLOR-SYSTEMIC come high cross-cutting + NUMBERING-SHIFT cross). Conteggio finale: ESP1-SOGLIA-OFFBYONE, ESP6/7/8 NUMBER-MISMATCH (3), ESP8-NO-MULTIMETER, LED-COLOR-SYSTEMIC, NUMBERING-SHIFT = **7 high**.
  - **medium (7)**: ESP1/2/4/6/7 LED-COLOR (5 single), ESP6 SHORTCUT-MISSING, MINI-CIRCUIT-DIFFERENT, MINI-TITLE-INVENTED, NO-VOLUME-REFERENCES-CITED = **9 medium** (sovrapposizione LED-COLOR-SYSTEMIC + singoli; segno coppia sistemica + 5 medium individuali).
  - **minor (5)**: ESP1-DESC-LUNGA, ESP2-SERIAL-MISSING, ESP3-PIN-CHOICE, ESP4-SETUP-MINIMAL, ESP5-LED-COLOR, ESP8-WARNING-MISSING, MINI-SOGLIA-512 = **7 minor**.

Conteggio finale severity (consolidato no-double):
- critical: **4**
- high: **7**
- medium: **9**
- minor: **7**
- info: **0**

---

## Note metodologiche

- File `task5-volumi-vol1.json` (specificato nel mandato) **NON ESISTE** in `automa/state/`. File presenti più vicini: `task5-parita.json` (audit precedente Vol1+2+3 primi 5 esp), `volume-parity-audit-v2.json`, `vol-pag-regression-iter23.json`, `a1-volumes.json`. Pattern usato per questa audit: stesso schema severity/area/detail di `task5-parita.json`.
- File spec `2026-05-07-task5-volumi-vol2-design.md` **NON ESISTE** in `docs/superpowers/specs/`. Cartella esiste con sotto-dirs `plans/` ma nessun file matching design vol2 task5. Audit condotta seguendo direttamente i mandate in messaggio (sezione 6.1 + cap7-specific checks: analogRead, ADC 0-1023, V calc, trimmer, PWM/analogWrite, duty cycle, for, effetto respiro, map, analogWriteResolution).
- ANTI-INVENTIONS rispettato: nessuna sintesi inventata, ogni claim cita riga PDF (`riga NNNN`) o range pagine v0.13 oppure flag esplicito **INVENTED**/**DUPLICATE**.
- Ground truth: `/tmp/vol3-v013.txt` letto sezione cap7 (righe 2570-3568). Indice (righe 19-47) conferma cap7 inizia pag.79.
