# Maker-3 Vol3 Audit cap8+cap9+cap10+extras (PDF v0.13)
- Date: 2026-05-07
- Esperimenti audited: 9/9
- PDF source: /tmp/vol3-v013.txt (5439 lines)
- GAP analysis: cap9 piezo (NEW v0.13) + extras lcd/servo legacy?

## Scope

Esperimenti audited (9 codes):
- v3-cap8-esp1, v3-cap8-esp2, v3-cap8-esp3, v3-cap8-esp4, v3-cap8-esp5 (5 esp cap8 numbered)
- v3-cap8-serial (1 esp named variation cap8)
- v3-extra-lcd-hello (1 extra)
- v3-extra-servo-sweep (1 extra)
- v3-extra-simon (1 extra — actual cap10 progetto finale)

## Ground truth PDF v0.13 inventory

Verified via grep `ESERCIZIO N.M` markers in /tmp/vol3-v013.txt:

| Capitolo | Titolo PDF v0.13 | Pagina inizio | Esperimenti PDF | Markers |
|----------|------------------|---------------|-----------------|---------|
| 8 | Visualizzare i dati: Il monitor seriale | 113 | 6 ESERCIZIO numbered | 8.1 (line 3764), 8.2 (3856), 8.3 (3913), 8.4 (4009), 8.5 (4074), 8.6 (4098) |
| 9 | Il piezo: facciamo musica! (NEW v0.13) | 133 | 2 ESERCIZIO numbered | 9.1 (line 4189), 9.2 (4276) |
| 10 | Il progetto finale: il gioco Simon | 141 | 0 numbered + 1 progetto unico | Full Simon project lines 4350-5419 |

PDF v0.13 grep totale parole chiave per gap analysis:
- `lcd|servo|i2c` → 0 menzioni rilevanti (solo "servono" e "GitServer", nessun riferimento a hardware LCD/servo/I2C)
- `piezo` → 19 occorrenze, tutte in cap9 e cap10
- `tone\(|noTone` → presenti in cap9 (esp 9.1+9.2) e cap10 (Simon project)

## v0.13 vs Code Mapping (gap analysis principale)

```
- cap8 v0.13 (monitor seriale): 6 ESERCIZIO PDF vs 5 in code (v3-cap8-esp1..esp5)
  → MISSING: 1 ESERCIZIO (cap8 esp.6 = barra progressiva LED, line PDF 4098-4105)
  → SEVERITY: medium (esp.6 desc breve in PDF "barra progressiva tipo volume")

- cap8-serial named variation: status DUPLICATO cap8-esp1
  → v3-cap8-serial code mappa SAME ESERCIZIO 8.1 di v3-cap8-esp1 (entrambi "Ciao dal Team di ELAB!" Serial.println in setup)
  → SEVERITY: minor naming consistency (uno usa esp1, l'altro extra-serial)

- cap9 v0.13 (piezo) NEW: 2 ESERCIZIO PDF vs 0 in code (v3-cap9-* assenti)
  → GAP CONFIRMED CRITICAL — capitolo intero NUOVO in v0.13 NON implementato nel code
  → MISSING: v3-cap9-esp1 (LA 440 Hz tone+noTone+delay) + v3-cap9-esp2 (pianoforte 4 pulsanti)
  → SEVERITY: critical (intero capitolo PDF 8 pagine 133-140 SENZA codice corrispondente)

- cap10 v0.13 (Simon): 1 progetto PDF "Simon Dice" vs v3-extra-simon (extra naming WRONG)
  → NAMING WRONG — il progetto Simon è il "progetto finale" del cap10 v0.13 (PDF pag. 141 esplicito "CAPITOLO 10 IL PROGETTO FINALE: IL GIOCO SIMON"), MA il code lo nomina come "v3-extra-simon" (chapter: "Extra")
  → Code dovrebbe essere v3-cap10-simon (o v3-cap10-esp1) — NOT extra-simon
  → SEVERITY: high (mapping semantico volume errato; viola Morfismo Sense 2 triplet coerenza titoli capitoli libro)

- extras lcd-hello: ZERO menzioni LCD/HD44780/16x2 in v0.13 → leftover da V0.8.1 (legacy)
  → v3-extra-lcd-hello presente in code MA inesistente nel PDF v0.13
  → SEVERITY: critical compliance Morfismo (esperimento NEL software MA NON nel libro fisico = anti-pattern §"Esercizi software che esistono SOLO nel software (NON nel libro fisico)")

- extras servo-sweep: ZERO menzioni servo/PWM-position/Servo.h in v0.13 → leftover da V0.8.1 (legacy)
  → v3-extra-servo-sweep presente in code MA inesistente nel PDF v0.13
  → SEVERITY: critical compliance Morfismo (stesso anti-pattern di lcd-hello)
```

## Per-esperimento audit

### v3-cap8-esp1 — "Cap. 8 Esp. 1 - Serial.println in setup"
- **PDF mapping**: ESERCIZIO 8.1 v0.13 (line 3764, pag. 119) ✅ CORRETTO
- **Code lines**: 4002-4064
- **Title coerenza PDF**: ✅ "messaggio una sola volta nel setup" (PDF line 3766-3772, "Ciao dal Team di ELAB!" line 3822 = match esatto codice 4020)
- **Components**: nano-r4 + breadboard-half (1 componente extra non richiesto da PDF — PDF line 3768-3770 dice "non serve costruire nessun circuito complicato, ti basta collegare la scheda al PC con cavo USB")
- **Severity**: minor (breadboard non strettamente necessaria per esp 8.1, esso usa solo cavo USB; v3-cap8-serial line 5775 più aderente al PDF con solo `nano-r4`)
- **chapter field**: "Capitolo 8 - Comunicazione Seriale" — PDF dice "Visualizzare i dati: Il monitor seriale" → mismatch titolo capitolo (medium)

### v3-cap8-esp2 — "Cap. 8 Esp. 2 - Serial.println in loop"
- **PDF mapping**: ESERCIZIO 8.2 v0.13 (line 3856, pag. 122) ✅ CORRETTO
- **Code lines**: 4065-4124
- **Title coerenza PDF**: ✅ "spostare il comando dentro loop()" (PDF line 3874) = match
- **Components**: nano-r4 + breadboard-half (stesso minor issue di esp1)
- **chapter field mismatch**: stessa minor issue
- **Severity**: minor

### v3-cap8-esp3 — "Cap. 8 Esp. 3 - analogRead + Serial Monitor"
- **PDF mapping**: ESERCIZIO 8.3 v0.13 (line 3913, pag. 124) ✅ CORRETTO
- **Code lines**: 4125-4276
- **Title coerenza PDF**: ✅ "stampare sul monitor seriale il valore che Arduino legge da un ingresso analogico (sensore o potenziometro)" (PDF line 3915-3917) = match
- **Components**: pot+breadboard+nano = ✅ aderente PDF (line 3919-3933 elenca: Arduino UNO, breakout di Elab, USB, potenziometro, jumper, breadboard)
- **chapter field**: identico mismatch capitolo
- **Severity**: minor

### v3-cap8-esp4 — "Cap. 8 Esp. 4 - Serial Plotter con 2 pot"
- **PDF mapping**: ESERCIZIO 8.4 v0.13 (line 4009, pag. 128) ✅ CORRETTO
- **Code lines**: 4277-4439
- **Title coerenza PDF**: ✅ "stampare sul Serial Plotter il risultato della conversione analogica letta con analogRead() su due pin analogici" (PDF line 4010-4013), "Arduino NANO R4 + ELAB NANO Breakout + 6 fili colorati + 2 trimmer" (PDF line 4015-4018) = match preciso
- **Code uses A3+A4**: PDF non specifica i pin esatti ma genere si — accettabile
- **Severity**: nessuno

### v3-cap8-esp5 — "Cap. 8 Esp. 5 - Pot + 3 LED + Serial"
- **PDF mapping**: ESERCIZIO 8.5 v0.13 (line 4074, pag. 130) ✅ CORRETTO
- **Code lines**: 4440-4706
- **Title coerenza PDF**: ✅ "potenziometro per controllare dei LED e contemporaneamente vedere i valori sia nel Monitor Seriale che nel Serial Plotter" (PDF line 4075-4082) = match
- **Code self-claim "progetto finale Volume 3"** (line 4442): ⚠️ ERRATO — il vero "progetto finale Vol.3" in v0.13 è cap10 Simon (PDF "CAPITOLO 10 IL PROGETTO FINALE: IL GIOCO SIMON" pag. 141)
- **Severity**: high (semantic claim sbagliata — confonde studenti/docenti su cosa sia il vero capstone Vol3)

### v3-cap8-serial — "Cap. 8 Extra - Comunicazione seriale via USB"
- **PDF mapping**: ESERCIZIO 8.1 v0.13 (DUPLICATO di v3-cap8-esp1, stesso "Ciao dal Team di ELAB!" Serial.println setup)
- **Code lines**: 5767-5859
- **unlimPrompt cita "Vol.3 pag. 87"**: ⚠️ PDF v0.13 mostra ESERCIZIO 8.1 a pag. **119** (linea PDF 3776 "Laboratorio di elettronica: Impara e sperimenta 119"), NON pag. 87 — citazione PDF page errata
- **Components**: solo nano-r4 (più aderente al PDF di v3-cap8-esp1)
- **Severity**: high (duplicato + citazione pag. errata = principio zero violation citation_vol_pag)

### v3-extra-lcd-hello — "Extra - LCD Hello World"
- **PDF mapping in v0.13**: ❌ INESISTENTE — grep `lcd|hd44780|liquidcrystal|16x2|16 x 2` ritorna 0 hit a tema in /tmp/vol3-v013.txt
- **Code lines**: 4710-4894
- **Diagnosi**: leftover da Vol3 V0.8.1 (versione precedente del PDF, capitolo Display/LCD ora rimosso/spostato in V0.13)
- **Severity**: critical Morfismo (Sense 2 triplet violazione: software ha esp che NON è nel libro)

### v3-extra-servo-sweep — "Extra - Servo Sweep"
- **PDF mapping in v0.13**: ❌ INESISTENTE — grep `servo|pwm.servo|servo.h|sg90` ritorna 0 hit a tema
- **Code lines**: 4895-5034
- **Diagnosi**: leftover da Vol3 V0.8.1 stesso pattern
- **Severity**: critical Morfismo

### v3-extra-simon — "Simon Says — Gioco di Memoria"
- **PDF mapping in v0.13**: cap10 progetto finale (line 4350 "CAPITOLO 10 IL PROGETTO FINALE: IL GIOCO SIMON")
- **Code lines**: 5043-5765
- **Naming SBAGLIATO**: id `v3-extra-simon` + chapter `"Extra"` MA in v0.13 PDF è il progetto principale del cap10
- **Code components**: 4 LED + 4 pulsanti + buzzer-piezo — match al PDF cap10 (PDF line 4389-4396 lista: Arduino, 4 LED, 4 resistori, 4 pulsanti, 1 cicalino buzzer, breadboard, cavetti)
- **PDF cap10 ha pulsante AVVIO 5° (PDF line 4660 `const int pulsanteDiAvvio = 6`)**: code v3-extra-simon ha solo 4 pulsanti (`btn1..btn4` lines 5063-5066), nessun pulsante avvio dedicato — divergenza schema circuit
- **Pin LED PDF cap10 (line 4661 `const int luci[] = {A0, A1, A2, A3}`)** vs **code (line 5151 `const int LED[] = {9, 10, 11, 12}`)**: PIN MISMATCH significativo (PDF usa pin analogici A0-A3 in modalità digital, code usa pin digitali D9-D12)
- **Pin buzzer PDF (line 4659 `const int piezo = 9`)** vs **code (line 5153 `const int BUZZER = 8`)**: pin mismatch (PDF=D9, code=D8)
- **Pin pulsanti PDF (line 4661 `const int pulsanti[] = {13, 12, 11, 10}`)** vs **code (line 5152 `const int BTN[] = {3, 5, 6, 13}`)**: pin mismatch totale
- **Severity**: critical (naming + 4 pin mismatch + missing pulsante avvio = morfismo broken vs PDF v0.13 cap10)

## Issues consolidati

```json
[
  {
    "id": "V3-CAP9-PIEZO-GAP-CRITICAL",
    "volume": 3,
    "experiment": "v3-cap9-* (assenti)",
    "severity": "critical",
    "area": "gap-coverage",
    "detail": "Cap9 v0.13 IL PIEZO: FACCIAMO MUSICA! (8 pagine 133-140, 2 ESERCIZIO 9.1+9.2 con tone()+noTone()+pianoforte 4 pulsanti) NON IMPLEMENTATO in code. Zero esperimenti v3-cap9-* in experiments-vol3.js. Gap maggiore copertura PDF v0.13."
  },
  {
    "id": "V3-EXTRA-SIMON-NAMING-WRONG",
    "volume": 3,
    "experiment": "v3-extra-simon",
    "severity": "critical",
    "area": "naming",
    "detail": "ID 'v3-extra-simon' + chapter 'Extra' contraddice PDF v0.13 dove Simon e' il progetto del cap10 ('IL PROGETTO FINALE: IL GIOCO SIMON' line 4350). Dovrebbe essere v3-cap10-simon o v3-cap10-esp1. Viola Morfismo Sense 2 triplet (titoli capitoli software = titoli capitoli libro)."
  },
  {
    "id": "V3-EXTRA-SIMON-PIN-MISMATCH",
    "volume": 3,
    "experiment": "v3-extra-simon",
    "severity": "critical",
    "area": "pin-assignments",
    "detail": "PIN totalmente diversi vs PDF v0.13 cap10: LED PDF=A0-A3 vs code=D9-D12, buzzer PDF=D9 vs code=D8, pulsanti PDF=D13-D10 vs code=D3+D5+D6+D13. Manca anche pulsanteDiAvvio (5° pulsante D6) presente in PDF line 4660. Studenti che seguono libro fisico Omaric NON possono replicare schema software."
  },
  {
    "id": "V3-EXTRA-LCD-HELLO-LEGACY",
    "volume": 3,
    "experiment": "v3-extra-lcd-hello",
    "severity": "critical",
    "area": "morfismo",
    "detail": "Esperimento LCD HD44780 NON esiste nel PDF v0.13 (grep lcd|hd44780|16x2 = 0 menzioni rilevanti). Leftover da V0.8.1 (vecchia versione PDF). Viola anti-pattern Morfismo: 'Esercizi software che esistono SOLO nel software (NON nel libro fisico)'. Da rimuovere o documentare come bonus extra-curriculum esplicito."
  },
  {
    "id": "V3-EXTRA-SERVO-SWEEP-LEGACY",
    "volume": 3,
    "experiment": "v3-extra-servo-sweep",
    "severity": "critical",
    "area": "morfismo",
    "detail": "Esperimento Servo Sweep NON esiste nel PDF v0.13 (grep servo|servo.h|sg90 = 0 menzioni). Leftover da V0.8.1. Stesso anti-pattern di v3-extra-lcd-hello. Da rimuovere o etichettare bonus extra-curriculum."
  },
  {
    "id": "V3-CAP8-ESP6-MISSING",
    "volume": 3,
    "experiment": "v3-cap8-esp6 (assente)",
    "severity": "medium",
    "area": "gap-coverage",
    "detail": "ESERCIZIO 8.6 v0.13 (line 4098, 'barra progressiva tipo volume') NON implementato in code. Cap8 PDF ha 6 esperimenti, code ne ha 5 (esp1..esp5). Gap minor in cap8."
  },
  {
    "id": "V3-CAP8-SERIAL-DUPLICATE-WRONG-PAGE",
    "volume": 3,
    "experiment": "v3-cap8-serial",
    "severity": "high",
    "area": "duplicato+citazione",
    "detail": "v3-cap8-serial DUPLICA v3-cap8-esp1 (stesso 'Ciao dal Team di ELAB!' Serial.println in setup). Inoltre unlimPrompt cita 'Vol.3 pag. 87' MA PDF v0.13 mostra ESERCIZIO 8.1 a pag. 119 (linea PDF 3776). Citazione pag. errata = principio zero violation."
  },
  {
    "id": "V3-CAP8-ESP5-FALSE-CAPSTONE",
    "volume": 3,
    "experiment": "v3-cap8-esp5",
    "severity": "high",
    "area": "claim-semantico",
    "detail": "Code line 4442 desc claim 'E il progetto finale del Volume 3!' MA in v0.13 il vero 'progetto finale' e' cap10 Simon (PDF 'CAPITOLO 10 IL PROGETTO FINALE: IL GIOCO SIMON' pag. 141). Confonde docenti/studenti su cosa sia il vero capstone Vol3."
  },
  {
    "id": "V3-CAP8-ALL-CHAPTER-FIELD-MISMATCH",
    "volume": 3,
    "experiment": "v3-cap8-esp1..esp5 + v3-cap8-esp4",
    "severity": "medium",
    "area": "titolo-capitolo",
    "detail": "Code field 'chapter: \"Capitolo 8 - Comunicazione Seriale\"' MA PDF v0.13 indice (line 29) e' 'Capitolo 8 - Visualizzare i dati: Il monitor seriale'. v3-cap8-serial usa chapter corretto. 5 esp da allineare al titolo PDF v0.13."
  },
  {
    "id": "V3-CAP8-ESP1-ESP2-EXTRA-COMPONENTS",
    "volume": 3,
    "experiment": "v3-cap8-esp1+esp2",
    "severity": "minor",
    "area": "componenti",
    "detail": "PDF v0.13 ESERCIZIO 8.1 (line 3768-3772) esplicita 'non serve costruire nessun circuito complicato, ti basta collegare la scheda al PC con cavo USB'. Code esp1+esp2 includono breadboard-half non richiesta dal PDF. v3-cap8-serial e' piu' aderente con solo nano-r4."
  }
]
```

## Severity summary

- **critical** (5): cap9 piezo gap, simon naming wrong, simon pin mismatch, lcd-hello legacy, servo-sweep legacy
- **high** (3): cap8-serial duplicate+wrong-pag, cap8-esp5 false-capstone, cap8-serial citation Vol pag.87
- **medium** (2): cap8-esp6 missing, chapter field mismatch
- **minor** (1): esp1+esp2 extra components

## Verdict

Score onesto Vol3 cap8+9+10+extras coverage vs PDF v0.13: **4.5/10** (5 critical issues).

- Cap8 numbered: 5/6 esperimenti coperti (83% coverage), naming chapter sbagliato, esp5 false-capstone claim
- Cap9 piezo: 0/2 esperimenti (0% coverage) — GAP CRITICO PIENO CAPITOLO
- Cap10 Simon: presente con naming + pin sbagliati (Morfismo Sense 2 violato pesantemente)
- Extras lcd+servo: 2 esperimenti orphan da V0.8.1 legacy (Morfismo violato)

## Top 3 fix prioritari

1. **CRITICO — Implementare v3-cap9-esp1 + v3-cap9-esp2** (piezo LA 440 Hz tone()/noTone() + pianoforte 4 pulsanti). PDF v0.13 cap9 dettagliato pagine 133-140, codice C++ Arduino esempi presenti. ~2-3h impl con buildSteps + scratchXml + circuit pin schema.

2. **CRITICO — Rinominare v3-extra-simon → v3-cap10-simon (o v3-cap10-esp1) + fix pin mismatch**: allineare LED a A0-A3 (PDF), buzzer a D9 (PDF), pulsanti a D13-D10 (PDF), aggiungere pulsanteDiAvvio (5° su D6). Update chapter field a "Capitolo 10 - Il progetto finale: il gioco Simon". ~1-2h refactor.

3. **CRITICO — Decidere fate degli extras legacy**: 2 path:
   - **A**) Rimuovere v3-extra-lcd-hello + v3-extra-servo-sweep da experiments-vol3.js (allinea Morfismo strict).
   - **B**) Etichettare esplicitamente come "bonus extra-curriculum NON-Vol3-v0.13" in chapter field + UI badge separato (es. "Bonus Avanzati"), e documentare in CLAUDE.md / lesson-paths che NON fanno parte dei 3 volumi cartacei.
   - Andrea decision iter 39+ entrance.

## Anti-inventions verification

- ESERCIZIO/ESERCIZIO markers verificati via `grep -niE "ESERCIZIO (8|9|10)\." /tmp/vol3-v013.txt` → 8 hit confermati (8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2). Nessun ESERCIZIO 10.x perche cap10 e' progetto unico.
- Capitolo titoli verificati indice PDF righe 29, 31, 33.
- v3-cap9-* assenza verificata `grep -nE "v3-cap9|v3-cap10" experiments-vol3.js` → 0 match (zero esperimenti cap9/cap10).
- LCD/Servo absence in v0.13 verificata `grep -niE "lcd|servo|i2c" /tmp/vol3-v013.txt` → 0 menzioni rilevanti hardware.
- Pin Simon mismatch verificati cross-leggendo PDF lines 4659-4663 vs code lines 5151-5155.
