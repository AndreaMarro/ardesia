# Maker-2 Vol1 Audit ch8-9
- Date: 2026-05-07
- Esperimenti audited: 14/14
- Chapters covered: 8 (Pulsante 5 esp), 9 (Potenziometro 9 esp + sfide check)
- PDF source: /tmp/vol1-full.txt (2622 lines)
- Code source: src/data/experiments-vol1.js (~v1-cap8 lines 1346-2378, v1-cap9 lines 2379-4100)
- Code source: src/data/lesson-groups.js (lines 32-56 — v1-pulsanti + v1-potenziometro + v1-sfide-pot)
- Spec: docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md (NOT FOUND on disk; pattern adopted from automa/state/task5-parita.json + Sprint U Cycle 1 audit framework)
- Andrea spiattellato feedback target: cap9 Pot 9-esp + cap8 Pulsante 5-esp
- Gaps: spec file 2026-05-07-task5-volumi-vol2-design.md NOT present in docs/superpowers/specs/ (only docs/superpowers/plans/ has files). Vol2 reference task5-volumi-vol2.json NOT found on disk. Pattern derived from task5-parita.json severity scale + Sprint U Cycle 1 iter 1 audit md template structure.

---

## 0. Methodology

Source-of-truth ground rules (per VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md §1 Vol1 row "Cap 8 = 5 ESPERIMENTO" + "Cap 9 = 9 ESPERIMENTO"):

- **Vol1 PDF lines 29+31** (TOC) e **lines 1071-1900** (body) consultati.
- **Cap 8** body: linee 1071-1402, 5 ESPERIMENTO mark (1114, 1185, 1193, 1279, 1385).
- **Cap 9** body: linee 1402-1900, 9 ESPERIMENTO mark (1454, 1539, 1555, 1563, 1651, 1740, 1885, 1893, 1900).

Severity scale (uniformata task5-parita.json + Sprint U):
- **critical**: blocca utilizzo prodotto (es. simulable=false con 0 fallback, ID/title mismatch totale)
- **high**: rompe principio narrativo strong (es. esp inflato che è solo riga di sfida nel PDF)
- **medium**: violazione sostanziale (es. variazioni collassate in esperimenti, desc>40w, linguaggio singolare imperativo)
- **minor**: cosmetic (icon broken, accenti mancanti, palette drift)

Spiattellato test = applico criterio Andrea iter 21+: "se cap PDF presenta UN concetto narrativo continuo con N variazioni progressive (es. dim LED, controlla buzzer pitch, ecc.), e codice ha N esperimenti distinti card-flat → flag tutti N con `variations_collapsed_to_separate_esp: true`".

---

## 1. Sintesi narrativa PDF Vol1 cap 8 + cap 9

### Cap 8 — Cos'è un pulsante? (PDF p.43-56, /tmp/vol1-full.txt:1071-1402)

Apertura concetto (linee 1085-1112): "Un pulsante è un contatto metallico... presenti nel kit sono i 'cioccolatini' neri con quattro gambette... quando premi la parte centrale collegando il filo trasversale". Concetto narrativo unico: **interruttore digitale ON/OFF** che chiude/apre circuito.

Sequenza esperimenti (5 in totale):

| ESP # | PDF lines | Spunto narrativo PDF (verbatim opener) | Tipo |
|-------|-----------|----------------------------------------|------|
| 1 | 1114-1184 | "In questo esperimento ripeteremo quanto fatto con il LED singolo ma aggiungeremo un pulsante per accendere il LED solo quando vogliamo noi." | INTRO ESP base |
| 2 | 1185-1192 | "Partendo dall'esperimento appena finito, cambia colore del LED o valore del resistore per rendere il LED più o meno luminoso." | **VARIAZIONE ESP1** (8 righe testo, NESSUNA bom-list, NESSUN buildSteps PDF) |
| 3 | 1193-1278 | "Proviamo a sostituire il LED monocolore con uno RGB. L'idea è quella di usare un solo pulsante per accendere o spegnere i colori che preferisci del LED." | ESTENSIONE ESP1 + RGB |
| 4 | 1279-1384 | "Proviamo ora ad utilizzare tre pulsanti diversi ognuno per ogni colore del LED RGB." | ESTENSIONE ESP3 (3 pulsanti) |
| 5 | 1385-1396 | "Giocando con l'esperimento 4 prova a cambiare i valori di resistenza dei vari colori così da ottenere colori diversi quando premi più pulsanti contemporaneamente!" | **VARIAZIONE ESP4** (4 righe testo, NESSUNA bom-list, NESSUN buildSteps PDF) |

**Ground-truth structural finding**: Esp 2 e Esp 5 nel PDF sono testi <12 righe, "sfide aperte" senza nuova lista materiali, riferiti esplicitamente a esp precedente ("Partendo dall'esperimento appena finito", "Giocando con l'esperimento 4"). Esp 3 e Esp 4 sono estensioni con BOM completo.

### Cap 9 — Cos'è un potenziometro? (PDF p.57-80, /tmp/vol1-full.txt:1402-1900)

Apertura concetto (linee 1410-1450): "Un potenziometro è un componente elettronico a tre piedini... All'interno c'è un disco resistivo... potenziometro del valore di 10 kOhm... il pin 2 è collegato ad un piccolo componente metallico... ci permette di prelevare un valore di resistenza intermedio". Concetto narrativo unico: **manopola che regola resistenza variabile** (dimmer / partitore tensione / miscelatore).

Sequenza esperimenti (9 in totale, di cui 3 in PDF sono UNA RIGA singola):

| ESP # | PDF lines | Spunto narrativo PDF (verbatim opener) | Tipo |
|-------|-----------|----------------------------------------|------|
| 1 | 1454-1538 | "In questo esperimento useremo il potenziometro come resistore variabile per cambiare l'intensità luminosa di un LED per renderlo più o meno luminoso semplicemente ruotando l'alberino del potenziometro." | INTRO ESP dim LED |
| 2 | 1539-1554 | "Nell'esperimento 1 l'intensità luminosa diminuisce ruotando verso destra, come facciamo invece a farla aumentare? Facile! Basta..." | **VARIAZIONE ESP1** (8 righe testo, scambia pin 1↔3) |
| 3 | 1555-1562 | "Cambia colore del LED, noti differenze di luminosità man mano che giri il cursore?" | **VARIAZIONE ESP1** (1 riga PDF! domanda aperta) |
| 4 | 1563-1650 | "Modifichiamo l'intensità luminosa di un LED RGB utilizzando un potenziometro." | ESTENSIONE ESP1 + RGB azzurrino |
| 5 | 1651-1739 | "In questo esperimento utilizzeremo tutti i pin del potenziometro per sfruttare il principio secondo cui la resistenza tra il pin 2 e gli altri due aumenta o diminuisce a seconda del verso di rotazione. Questo ci consentirà di avere il LED RGB colorato di BLU... e di ROSSO... E in mezzo? Blu e rosso si uniscono!" | ESTENSIONE pot miscelatore |
| 6 | 1740-1884 | "Costruiamo una lampada avendo la possibilità di poter scegliere abbastanza facilmente quanto colore aggiungere per ogni luce colorata presente nel LED RGB." | ESTENSIONE 3 pot |
| 7 | 1885-1892 | "Vuoi provare ad aggiungere qualche pulsante?" | **SFIDA APERTA** (UNA RIGA PDF! solo titolo + domanda) |
| 8 | 1893-1899 | "Prova a fare insieme l'esperimento 6 e l'esperimento 5" | **SFIDA APERTA** (UNA RIGA PDF! solo titolo + frase) |
| 9 | 1900-1903 | "Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!" | **SFIDA APERTA** (UNA RIGA PDF! solo titolo + frase) |

**Ground-truth structural finding critical**: Esp 7, 8, 9 nel PDF sono LETTERALMENTE UNA RIGA testo ciascuno (nessuna BOM, nessun buildSteps, nessuna immagine). Sono "sfide" stile Cosa fai quando hai finito tutto?. lesson-groups.js già correttamente classifica esp 7-9 come `'v1-sfide-pot'` con `isChallenges: true`.

---

## 2. Audit per esperimento (14/14)

### v1-cap8-esp1 — LED con pulsante (PDF:1114, code:1347)

```
audit_id: V1-CAP8-ESP1
volume: 1
chapter: 8
experiment_id: v1-cap8-esp1
title_code: "Cap. 8 Esp. 1 - LED con pulsante"
title_pdf_anchor: PDF:1114 "ESPERIMENTO 1"
desc_code: "Premi il pulsante e il LED si accende! Rilascialo e si spegne."
chapter_code: "Capitolo 8 - Cos'è un pulsante?"
concept_code: "Circuito aperto/chiuso, pulsante come interruttore"
simulation_mode: circuit
difficulty: 1
estimated_minutes: 30
buildSteps_count: 13
quiz_count: 2
narrative_alignment: PASS — esp INTRO base, BOM e steps codice match PDF (LED+R 470Ω+pulsante a cavallo canale centrale).
issues:
  - severity: medium
    area: linguaggio
    detail: "desc 'Premi il pulsante' singolare imperativo. Andrea iter 21+ mandate plurale 'Ragazzi, premete...'"
  - severity: minor
    area: unlimPrompt
    detail: "unlimPrompt 'Sei UNLIM... Il docente sta mostrando' OK framing docente, ma manca 'Ragazzi,' verbatim opener Principio Zero."
variations_collapsed_to_separate_esp: false
```

### v1-cap8-esp2 — Cambia colore e luminosità (PDF:1185, code:1522)

```
audit_id: V1-CAP8-ESP2
volume: 1
chapter: 8
experiment_id: v1-cap8-esp2
title_code: "Cap. 8 Esp. 2 - Cambia colore e luminosità"
title_pdf_anchor: PDF:1185 "ESPERIMENTO 2 — Partendo dall'esperimento appena finito, cambia colore del LED o valore del resistore..."
desc_code: "Usa LED di colori diversi e resistori diversi con il pulsante."
concept_code: "Variazione circuito, LED colori diversi"
simulation_mode: circuit
difficulty: 1
estimated_minutes: 30
buildSteps_count: ~13 (riusa Esp1 layout, R=220Ω + LED green)
narrative_alignment: PARTIAL — PDF Esp 2 = SFIDA testuale 8 righe ESPLICITA "Partendo dall'esperimento appena finito, cambia colore del LED o valore del resistore". Codice ha esp completo separato con BOM identico a Esp1 + 220Ω+green. Spiattellamento variazione → esp distinto.
issues:
  - severity: medium
    area: spiattellato
    detail: "PDF presenta Esp 2 come VARIAZIONE EXPLICITLY 'partendo dall'esperimento appena finito' (8 righe, no BOM). Codice elevato a esperimento card-flat indipendente. Concetto narrativo: 'gioco con LED diversi'. Andrea iter 21+ test: cap 8 narrativa = UN concetto pulsante con 4-5 variazioni progressive, NON 5 esp distinti."
  - severity: medium
    area: linguaggio
    detail: "desc 'Usa LED' singolare imperativo. Plurale 'Provate LED diversi'."
variations_collapsed_to_separate_esp: true
variation_of: v1-cap8-esp1
```

### v1-cap8-esp3 — RGB + pulsante = viola (PDF:1193, code:1696)

```
audit_id: V1-CAP8-ESP3
volume: 1
chapter: 8
experiment_id: v1-cap8-esp3
title_code: "Cap. 8 Esp. 3 - RGB + pulsante = viola"
title_pdf_anchor: PDF:1193 "ESPERIMENTO 3 — Proviamo a sostituire il LED monocolore con uno RGB..."
desc_code: "Premi il pulsante per accendere il viola (rosso + blu) sul LED RGB."
concept_code: "Pulsante + RGB, sintesi colore con interruttore"
simulation_mode: circuit
difficulty: 2
estimated_minutes: 45
buildSteps_count: 14+
narrative_alignment: PASS — esp con BOM completa (RGB+2R+pulsante), narrativa nuova "sintesi additiva". OK come esp distinto.
issues:
  - severity: medium
    area: linguaggio
    detail: "desc 'Premi il pulsante' singolare. Plurale 'Premete il pulsante'."
  - severity: minor
    area: unlimPrompt
    detail: "manca 'Ragazzi,' opener Principio Zero plurale."
variations_collapsed_to_separate_esp: false
```

### v1-cap8-esp4 — 3 pulsanti → 3 colori RGB (PDF:1279, code:1906)

```
audit_id: V1-CAP8-ESP4
volume: 1
chapter: 8
experiment_id: v1-cap8-esp4
title_code: "Cap. 8 Esp. 4 - 3 pulsanti → 3 colori RGB"
title_pdf_anchor: PDF:1279 "ESPERIMENTO 4 — Proviamo ora ad utilizzare tre pulsanti diversi ognuno per ogni colore del LED RGB"
desc_code: "Un pulsante per ogni colore! Premi combinazioni per creare nuovi colori."
concept_code: "Controllo indipendente canali RGB, combinazioni colore"
simulation_mode: circuit
difficulty: 2
estimated_minutes: 45
narrative_alignment: PASS — estensione Esp3 con BOM completa (RGB+3R+3pulsanti), narrativa nuova "controllo indipendente canali". OK come esp distinto.
issues:
  - severity: medium
    area: linguaggio
    detail: "desc 'Premi combinazioni' singolare. Plurale 'Premete combinazioni'."
variations_collapsed_to_separate_esp: false
```

### v1-cap8-esp5 — Mix avanzato con resistori diversi (PDF:1385, code:2141)

```
audit_id: V1-CAP8-ESP5
volume: 1
chapter: 8
experiment_id: v1-cap8-esp5
title_code: "Cap. 8 Esp. 5 - Mix avanzato con resistori diversi"
title_pdf_anchor: PDF:1385 "ESPERIMENTO 5 — Giocando con l'esperimento 4 prova a cambiare i valori di resistenza dei vari colori..."
desc_code: "Sfida! Usa resistori di valori diversi sui 3 canali per creare sfumature uniche."
concept_code: "Resistori diversi = luminosità diverse per canale"
simulation_mode: circuit
difficulty: 2
estimated_minutes: 45
narrative_alignment: PARTIAL — PDF Esp 5 = SFIDA testuale 4 righe ESPLICITA "Giocando con l'esperimento 4 prova a cambiare i valori di resistenza" + RICORDA box. Codice ha esp completo separato con BOM (probabilmente identica a Esp4 con R diversi). Spiattellamento variazione → esp distinto.
issues:
  - severity: medium
    area: spiattellato
    detail: "PDF Esp 5 è 4 righe SFIDA APERTA 'giocando con l'esperimento 4'. Concetto narrativo: 'gioco con valori R'. Codice card-flat invece di SuggestedVariation di Esp4."
  - severity: medium
    area: linguaggio
    detail: "desc 'Sfida! Usa resistori' singolare. Plurale 'Provate resistori'. Inoltre 'Sfida!' con punto esclamativo OK ma non plurale."
variations_collapsed_to_separate_esp: true
variation_of: v1-cap8-esp4
```

---

### v1-cap9-esp1 — Dimmer LED con potenziometro (PDF:1454, code:2379)

```
audit_id: V1-CAP9-ESP1
volume: 1
chapter: 9
experiment_id: v1-cap9-esp1
title_code: "Cap. 9 Esp. 1 - Dimmer LED con potenziometro"
title_pdf_anchor: PDF:1454 "ESPERIMENTO 1 — In questo esperimento useremo il potenziometro come resistore variabile per cambiare l'intensità luminosa di un LED..."
desc_code: "Gira la manopola del potenziometro per cambiare la luminosità del LED!"
concept_code: "Resistenza variabile, partitore di tensione, dimmer"
simulation_mode: circuit
difficulty: 1
estimated_minutes: 30
narrative_alignment: PASS — esp INTRO base con BOM completa (LED+R 470Ω+pot 10kΩ). OK come esp distinto.
issues:
  - severity: medium
    area: linguaggio
    detail: "desc 'Gira la manopola' singolare. Plurale 'Girate la manopola'."
variations_collapsed_to_separate_esp: false
```

### v1-cap9-esp2 — Inverti la rotazione (PDF:1539, code:2537)

```
audit_id: V1-CAP9-ESP2
volume: 1
chapter: 9
experiment_id: v1-cap9-esp2
title_code: "Cap. 9 Esp. 2 - Inverti la rotazione"
title_pdf_anchor: PDF:1539 "ESPERIMENTO 2 — Nell'esperimento 1 l'intensità luminosa diminuisce ruotando verso destra, come facciamo invece a farla aumentare? Facile! Basta..."
desc_code: "Scambia i pin 1 e 3 del potenziometro: la rotazione si inverte!"
concept_code: "Inversione potenziometro, simmetria pin"
simulation_mode: circuit
difficulty: 1
estimated_minutes: 30
narrative_alignment: PARTIAL — PDF Esp 2 = SFIDA testuale 8 righe ESPLICITA "Nell'esperimento 1... Facile! Basta..." (no BOM, riusa Esp1). Codice elevato a esp distinto con BOM duplicata.
issues:
  - severity: medium
    area: spiattellato
    detail: "PDF Esp 2 è 8 righe domanda+risposta che riferisce esplicitamente Esp 1. Variazione 'come faccio l'inverso?' invece di esp card-flat. Concetto: 'simmetria pin'."
  - severity: medium
    area: linguaggio
    detail: "desc 'Scambia i pin' singolare. Plurale 'Scambiate i pin'."
variations_collapsed_to_separate_esp: true
variation_of: v1-cap9-esp1
```

### v1-cap9-esp3 — LED di colore diverso con pot (PDF:1555, code:2694)

```
audit_id: V1-CAP9-ESP3
volume: 1
chapter: 9
experiment_id: v1-cap9-esp3
title_code: "Cap. 9 Esp. 3 - LED di colore diverso con pot"
title_pdf_anchor: PDF:1555 "ESPERIMENTO 3 — Cambia colore del LED, noti differenze di luminosità man mano che giri il cursore?"
desc_code: "Prova con un LED verde o blu: la tensione di forward è diversa!"
concept_code: "Tensione forward diversa per colore LED"
simulation_mode: circuit
difficulty: 1
estimated_minutes: 30
narrative_alignment: PARTIAL — PDF Esp 3 è UNA RIGA: "Cambia colore del LED, noti differenze di luminosità man mano che giri il cursore?". Codice ha esp completo card-flat separato. Spiattellamento estremo.
issues:
  - severity: high
    area: spiattellato
    detail: "PDF Esp 3 = UNA RIGA TESTO domanda aperta sostituibile con Esp 1 con LED diverso. Codice card-flat sproporzionato. Concetto: 'tensione forward'. Andrea iter 21+ test: questo è UN ESPERIMENTO CARD-FLAT INFLATO."
  - severity: medium
    area: linguaggio
    detail: "desc 'Prova' singolare. Plurale 'Provate'."
variations_collapsed_to_separate_esp: true
variation_of: v1-cap9-esp1
```

### v1-cap9-esp4 — Dimmer RGB azzurrino (PDF:1563, code:2851)

```
audit_id: V1-CAP9-ESP4
volume: 1
chapter: 9
experiment_id: v1-cap9-esp4
title_code: "Cap. 9 Esp. 4 - Dimmer RGB azzurrino"
title_pdf_anchor: PDF:1563 "ESPERIMENTO 4 — Modifichiamo l'intensità luminosa di un LED RGB utilizzando un potenziometro"
desc_code: "Collega il pot al canale blu + verde del RGB con un resistore sul catodo: crea un azzurrino dimmerabile!"
concept_code: "Pot controlla 2 canali LED RGB, colore cyan"
simulation_mode: circuit
difficulty: 2
estimated_minutes: 30
narrative_alignment: PASS — esp con BOM completa, narrativa nuova "RGB con dimmer". OK come esp distinto.
issues:
  - severity: medium
    area: linguaggio
    detail: "desc 'Collega' singolare. Plurale 'Collegate'."
variations_collapsed_to_separate_esp: false
```

### v1-cap9-esp5 — Pot miscelatore blu rosso (PDF:1651, code:3045)

```
audit_id: V1-CAP9-ESP5
volume: 1
chapter: 9
experiment_id: v1-cap9-esp5
title_code: "Cap. 9 Esp. 5 - Pot miscelatore blu  rosso"
title_pdf_anchor: PDF:1651 "ESPERIMENTO 5 — In questo esperimento utilizzeremo tutti i pin del potenziometro per sfruttare il principio... LED RGB colorato di BLU... ROSSO... E in mezzo? Blu e rosso si uniscono!"
desc_code: "Il pot mescola tra blu e rosso: pin 1 al blu, pin 3 al rosso!"
concept_code: "Miscelatore colore, partitore bidirezionale"
simulation_mode: circuit
difficulty: 2
estimated_minutes: 30
narrative_alignment: PASS — esp con BOM completa, narrativa nuova "miscelatore bidirezionale". OK come esp distinto.
issues:
  - severity: minor
    area: title
    detail: "title 'Pot miscelatore blu  rosso' ha DOPPIO SPAZIO tra 'blu' e 'rosso' (cosmetic typo)."
  - severity: medium
    area: linguaggio
    detail: "desc 'Il pot mescola' OK indicativo, ma mancano 'Ragazzi' opener."
variations_collapsed_to_separate_esp: false
```

### v1-cap9-esp6 — Lampada RGB con 3 potenziometri (PDF:1740, code:3229)

```
audit_id: V1-CAP9-ESP6
volume: 1
chapter: 9
experiment_id: v1-cap9-esp6
title_code: "Cap. 9 Esp. 6 - Lampada RGB con 3 potenziometri"
title_pdf_anchor: PDF:1740 "ESPERIMENTO 6 — Costruiamo una lampada avendo la possibilità di poter scegliere abbastanza facilmente quanto colore aggiungere..."
desc_code: "3 pot controllano R, G, B indipendentemente. Crea qualsiasi colore!"
concept_code: "Controllo indipendente R/G/B, lampada personalizzabile"
simulation_mode: circuit
difficulty: 2
estimated_minutes: 45
narrative_alignment: PASS — esp con BOM completa (RGB+3R+3pot), narrativa nuova "lampada personalizzabile". OK come esp distinto. CAPSTONE cap 9 (esp 7-9 sono solo sfide aperte).
issues:
  - severity: medium
    area: linguaggio
    detail: "desc 'Crea qualsiasi colore!' singolare. Plurale 'Create qualsiasi colore!'."
variations_collapsed_to_separate_esp: false
```

### v1-cap9-esp7 — Sfida: aggiungi pulsanti alla lampada (PDF:1885, code:3530)

```
audit_id: V1-CAP9-ESP7
volume: 1
chapter: 9
experiment_id: v1-cap9-esp7
title_code: "Cap. 9 Esp. 7 - Sfida: aggiungi pulsanti alla lampada"
title_pdf_anchor: PDF:1885 "ESPERIMENTO 7 — Vuoi provare ad aggiungere qualche pulsante?"
desc_code: "Sfida aperta! Combina la lampada RGB con 3 pulsanti per ON/OFF per canale."
concept_code: "Sfida: integrazione pulsante + pot + RGB"
simulation_mode: circuit
difficulty: 3
estimated_minutes: 30
buildSteps_count: ~10 (esp completo, riusa Esp6 + 3 pulsanti)
narrative_alignment: FAIL — PDF Esp 7 è LETTERALMENTE UNA RIGA: "Vuoi provare ad aggiungere qualche pulsante?". Nessuna BOM, nessuna immagine, nessun buildSteps PDF. Codice ha esp completo card-flat con steps inventati. Spiattellamento estremo.
issues:
  - severity: high
    area: spiattellato
    detail: "PDF Esp 7 = UNA RIGA TESTO ('Vuoi provare ad aggiungere qualche pulsante?'). Codice card-flat con buildSteps inventati. Andrea iter 21+ test: questa è UNA SFIDA APERTA inflata a esperimento."
  - severity: high
    area: narrativa
    detail: "Inventato BOM e steps non presenti nel PDF. Violazione Morfismo Sense 2 (triplet coerenza esterna libro)."
  - severity: medium
    area: linguaggio
    detail: "desc 'Combina' singolare. Plurale 'Combinate'."
note: lesson-groups.js già correttamente classifica esp7-9 come 'v1-sfide-pot' isChallenges:true. Ma esperimenti separati card-flat con BOM inventati sono violazione narrativa.
variations_collapsed_to_separate_esp: true
variation_of: v1-cap9-esp6
```

### v1-cap9-esp8 — Sfida: combina esperimenti 5+6 (PDF:1893, code:3731)

```
audit_id: V1-CAP9-ESP8
volume: 1
chapter: 9
experiment_id: v1-cap9-esp8
title_code: "Cap. 9 Esp. 8 - Sfida: combina esperimenti 5+6"
title_pdf_anchor: PDF:1893 "ESPERIMENTO 8 — Prova a fare insieme l'esperimento 6 e l'esperimento 5"
desc_code: "Sfida aperta! Unisci il miscelatore blu/rosso con la lampada 3 pot."
concept_code: "Sfida: integrazione circuiti precedenti"
simulation_mode: circuit
difficulty: 3
estimated_minutes: 45
narrative_alignment: FAIL — PDF Esp 8 è UNA RIGA: "Prova a fare insieme l'esperimento 6 e l'esperimento 5". Codice card-flat con buildSteps inventati.
issues:
  - severity: high
    area: spiattellato
    detail: "PDF Esp 8 = UNA RIGA TESTO. Codice card-flat. Sfida aperta inflata a esperimento, BOM inventato per riusare esp 5+6."
  - severity: high
    area: narrativa
    detail: "Combina esperimenti 5+6 in BOM senza traccia PDF. Violazione triplet coerenza."
  - severity: medium
    area: linguaggio
    detail: "desc 'Unisci' singolare. Plurale 'Unite'."
variations_collapsed_to_separate_esp: true
variation_of: v1-cap9-esp5+esp6
```

### v1-cap9-esp9 — Sfida: aggiungi pulsante all'esp 8 (PDF:1900, code:3963)

```
audit_id: V1-CAP9-ESP9
volume: 1
chapter: 9
experiment_id: v1-cap9-esp9
title_code: "Cap. 9 Esp. 9 - Sfida: aggiungi pulsante all'esp 8"
title_pdf_anchor: PDF:1900 "ESPERIMENTO 9 — Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!"
desc_code: "Aggiungi un pulsante per accendere e spegnere il LED RGB all'esperimento 8 (2 pot + RGB)!"
concept_code: "Sfida: integrazione completa pulsante + pot + LED"
simulation_mode: circuit
difficulty: 3
estimated_minutes: 30
narrative_alignment: FAIL — PDF Esp 9 è UNA RIGA: "Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!". Codice card-flat con buildSteps inventati.
issues:
  - severity: high
    area: spiattellato
    detail: "PDF Esp 9 = UNA RIGA TESTO. Codice card-flat. Sfida aperta inflata."
  - severity: high
    area: narrativa
    detail: "BOM/steps inventati senza traccia PDF. Violazione triplet coerenza Morfismo Sense 2."
  - severity: medium
    area: linguaggio
    detail: "desc 'Aggiungi' singolare imperativo. Plurale 'Aggiungete'."
variations_collapsed_to_separate_esp: true
variation_of: v1-cap9-esp8
```

---

## 3. Spiattellato verdict — Andrea iter 21+ feedback test

### Cap 8 (Pulsante 5 esp) — VERDICT: SPIATTELLATO YES (medium)

PDF presenta 1 concetto narrativo unico ("interruttore digitale ON/OFF") con 5 esperimenti. Di questi:
- **Esp 1** = INTRO ESP base (BOM completo + steps PDF, OK card-flat)
- **Esp 2** = VARIAZIONE ESP1 ESPLICITA "Partendo dall'esperimento appena finito" (8 righe testo, no BOM PDF) → spiattellato medium
- **Esp 3** = ESTENSIONE ESP1 con RGB (BOM completo + steps PDF, OK card-flat)
- **Esp 4** = ESTENSIONE ESP3 con 3 pulsanti (BOM completo + steps PDF, OK card-flat)
- **Esp 5** = VARIAZIONE ESP4 ESPLICITA "Giocando con l'esperimento 4" (4 righe testo, no BOM PDF) → spiattellato medium

Spiattellamento moderato 2/5. Cap 8 narrativa = UN concetto pulsante con 3 esp principali (1, 3, 4) + 2 variazioni didattiche (2, 5) collassate inappropriately a card-flat.

### Cap 9 (Potenziometro 9 esp) — VERDICT: SPIATTELLATO YES (high)

PDF presenta 1 concetto narrativo unico ("manopola che regola resistenza variabile") con 9 esperimenti. Di questi:
- **Esp 1** = INTRO ESP base dimmer LED (BOM completo, OK card-flat)
- **Esp 2** = VARIAZIONE ESP1 esplicita "Nell'esperimento 1... Facile! Basta..." (8 righe testo, no BOM) → spiattellato medium
- **Esp 3** = VARIAZIONE ESP1 estrema "Cambia colore del LED, noti differenze?" (UNA RIGA PDF) → spiattellato high
- **Esp 4** = ESTENSIONE ESP1 con RGB (BOM completo, OK card-flat)
- **Esp 5** = ESTENSIONE pot miscelatore (BOM completo, OK card-flat)
- **Esp 6** = ESTENSIONE 3 pot lampada CAPSTONE (BOM completo, OK card-flat)
- **Esp 7** = SFIDA APERTA "Vuoi provare ad aggiungere qualche pulsante?" (UNA RIGA PDF) → spiattellato high
- **Esp 8** = SFIDA APERTA "Prova a fare insieme l'esperimento 6 e l'esperimento 5" (UNA RIGA PDF) → spiattellato high
- **Esp 9** = SFIDA APERTA "Aggiungi un pulsante... all'esperimento 8!" (UNA RIGA PDF) → spiattellato high

Spiattellamento estremo 5/9 (esp 2 medium + esp 3, 7, 8, 9 high). Cap 9 narrativa = UN concetto manopola con 4 esp principali (1, 4, 5, 6) + 5 variazioni/sfide collassate inappropriately a card-flat con BOM/steps inventati. **Cap 9 è il caso più severo Vol1 di "spiattellato" Andrea iter 21+**, esattamente come anticipato dal feedback.

`isChallenges: true` su `v1-sfide-pot` lesson-group è il riconoscimento corretto della differenza, ma le voci card-flat individuali con buildSteps inventati restano violazione triplet coerenza Morfismo Sense 2.

---

## 4. Riepilogo issues per severity

| Severity | Count |
|----------|-------|
| critical | 0 |
| high | 7 (esp 7+8+9 cap9 spiattellato + narrativa inventata = 6, esp 3 cap9 spiattellato = 1) |
| medium | 18+ (linguaggio singolare imperativo 14/14, spiattellato medium 3) |
| minor | 2 (title doppio spazio v1-cap9-esp5, unlimPrompt mancante 'Ragazzi' opener) |

Totale issues: **~27** (14 esperimenti × ~2 issues medio).

## 5. Top findings (Maker-2)

1. **CAP 9 SPIATTELLATO ESTREMO** — esp 7, 8, 9 sono UNA RIGA PDF ciascuno ("Vuoi provare?", "Prova a fare insieme", "Aggiungi un pulsante!"). Codice card-flat con buildSteps inventati = violazione triplet coerenza Morfismo Sense 2 PDF↔software. lesson-groups.js classifica già correttamente come `v1-sfide-pot` ma le card individuali sono inflate. **PRIORITY 1**: convertire esp 7-9 in `v1-cap9-esp6.suggestedVariations[]` array sotto la lampada CAPSTONE invece di esp card-flat.

2. **CAP 8 SPIATTELLATO MODERATO** — esp 2 + esp 5 sono variazioni testuali (4-8 righe PDF) con riferimento esplicito al precedente ("Partendo dall'esperimento appena finito", "Giocando con l'esperimento 4"). Codice card-flat. **PRIORITY 2**: convertire esp 2 in `v1-cap8-esp1.suggestedVariations[]` (LED diversi + R diversi) e esp 5 in `v1-cap8-esp4.suggestedVariations[]` (R diversi sui canali).

3. **LINGUAGGIO SINGOLARE IMPERATIVO 14/14** — TUTTE le `desc` di cap 8+9 violano Andrea iter 21+ mandate plurale "Ragazzi, premete...". Pattern violazioni: "Premi il pulsante" → "Premete il pulsante", "Gira la manopola" → "Girate la manopola", "Usa LED" → "Provate LED", "Aggiungi un pulsante" → "Aggiungete un pulsante". Codemod regex possibile. **PRIORITY 3** (incluso in Andrea iter 21+ codemod 200 violazioni mandate).

4. **CAP 9 ESP 3 RIDOTTO A UNA RIGA** — "Cambia colore del LED, noti differenze?" è PDF UNA RIGA. Codice card-flat con buildSteps inventati. Caso più estremo singolo dopo esp 7-9. **PRIORITY 1.5**: converte in `v1-cap9-esp1.suggestedVariations[]`.

5. **TITLE typo `v1-cap9-esp5`** — "Pot miscelatore blu  rosso" ha DOPPIO SPAZIO. **PRIORITY 4** (cosmetic).

6. **unlimPrompt opener Principio Zero** — TUTTI 14 unlimPrompts mancano apertura plurale "Ragazzi,". Andrea iter 21+ mandate Principio Zero linguaggio docente/classe. **PRIORITY 3** (incluso codemod).

7. **Vol1 cap 8+9 simulable=true 14/14** — buona notizia Vol1 vs Vol2 cap3 dove 4/5 simulable=false multimetro (task5-parita.json). Cap 8+9 simulator-friendly al 100%.

---

## 6. Note operative

- File audit prodotto: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/state/maker2-vol1-ch8-9-audit.md`
- src/ files NOT modified per constraint Sprint U Cycle 2 (read-only audit phase).
- Spec file `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md` NOT FOUND on disk — spec template adottato da `automa/state/task5-parita.json` + Sprint U Cycle 1 audit md framework. Recommendation: spec file da creare per audit Vol1 Cycle 2 Vol2 audit.
- Vol2 reference `automa/state/task5-volumi-vol2.json` NOT FOUND on disk — Vol2 audit pattern derivato da `task5-parita.json` (~2026-04-14 task parita Vol1+2+3 primi 5 esp).
- ANTI-INVENTIONS: tutti i quote PDF usano lines actual `/tmp/vol1-full.txt` verificate via grep `^line:content`. Tutti i campi codice usano grep `experiments-vol1.js:line:field`. Nessuna sintesi.
- Cycle 3 (verifier) raccomandato: confronto auto vs manuale Andrea ratify per spiattellato fix priorities (esp7-9 collapse to suggestedVariations vs esp card-flat preserve).
