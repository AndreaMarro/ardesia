# Maker-1 Vol1 Audit ch6-7
- Date: 2026-05-07
- Esperimenti audited: 9/9
- Chapters covered: 6 (LED diodo), 7 (LED RGB)
- PDF source: /tmp/vol1-full.txt (2622 lines, pdftotext -layout output)
- Code source: src/data/experiments-vol1.js
- Lesson groups source: src/data/lesson-groups.js
- Spec: docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md (NOT FOUND on disk; methodology applied from prompt template + ground truth VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md §1 lines 44-65 and §4 lines 173-187)
- Andrea spiattellato feedback target: cap7 RGB 6-esp variations check — VERDICT in §VERDICT
- Gaps:
  - Spec file `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md` NOT present on disk; methodology applied from prompt template self-contained (ground truth + audit format spec)
  - Vol2 audit JSON (`automa/state/task5-volumi-vol2.json`) NOT present; pattern reference taken from ground truth doc and prompt
  - PDF Cap7 narrative intro lines 902-907 contain garbled OCR text "Q1*)7,'" "NSKFYYNKTWRFYTIFYWJ" "HFYTITTYYJSJSITHTXऐ" — unable to fully parse glossary intro paragraphs verbatim; ESPERIMENTO sections themselves are clean Italian text and used as primary source
- Methodology notes:
  - PDF section identification via grep "ESPERIMENTO" + manual context inspection (lines 766/833/863 for cap6; lines 934/985/998/1005/1034/1056 for cap7)
  - Code structural walk via grep "^      id" + targeted Read window per esperimento
  - Wires extraction: only canonical text steps (PDF "Collega ..." imperative bullets) — diagrams/figures NOT extracted (figure-only diagrams in PDF cap6 ESP1 e.g. "Costruiamo passo passo il nostro primo circuito!" with image bullets)

---

## v1-cap6-esp1
- pdf_pages: 29-31 (ESPERIMENTO marker line 766; experiment text lines 766-826)
- pdf_concept: "Tutto bellissimo, tante parole, ma ora siamo arrivati alla domanda che ti stai ponendo dall'inizio: come lo accendo? — Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di [batteria 9V + breadboard + LED + resistore 470 Ohm + clip batteria]. Costruiamo passo passo il nostro primo circuito! Il LED si è acceso! Bellissimo vero? Prova adesso a cambiare il LED con uno di un colore diverso!"
- pdf_components:
  - Un LED, sceglilo del colore che ti piace di più
  - Una breadboard
  - Una batteria 9V
  - La clip per la batteria 9V
  - Un resistore da 470 Ohm (Giallo Viola Marrone)
- pdf_wires:
  - "Collega la clip della batteria alla batteria"
  - "Collega il positivo della batteria alla striscia rossa superiore della breadboard"
  - "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto"
  - "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale"
  - "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED"
- pdf_variations: ["cambia il LED con uno di un colore diverso (chiusura ESP1, suggerimento finale)"]
- code_id: "v1-cap6-esp1"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1)
  - led red (id led1)
- code_title: "Cap. 6 Esp. 1 - Accendi il tuo primo LED"
- structural_diff:
  - title_match: true (concettualmente: PDF "come lo accendo?" → code "Accendi il tuo primo LED")
  - components_in_book_missing_in_code: ["clip batteria 9V (PDF mention; code battery9v abstrazione include implicitamente)"]
  - components_in_code_missing_in_book: []
  - order_match: true (batteria → bus + → resistore → LED → bus −)
  - variations_collapsed_to_separate_esp: false (ESP1 PDF è singolo esperimento con suggerimento finale "cambia colore" inline, NOT spiattellato)
- severity: minor
- notes: "Allineamento solido. PDF chiusura suggerisce 'cambia il LED con uno di un colore diverso' come tinkering libero (non variazione separata). Code usa LED rosso default; questo è OK perché cambio colore è run-time non struttura. Pin assignments code (A2/A9 resistore, F9/F10 LED) coerenti con narrativa PDF (zona sotto dopo divisione centrale = righe f-j)."

## v1-cap6-esp2
- pdf_pages: 32 (ESPERIMENTO marker line 833; experiment text lines 833-862)
- pdf_concept: "Il nostro circuito include un resistore, ma perché? Abbiamo detto che i resistori servono per limitare la corrente te lo ricordi? Ogni LED può sopportare una corrente massima che non deve essere superata altrimenti il led si rompe. Il resistore serve proprio ad evitare di rompere il led perché limita la corrente. Se infatti colleghi per errore il LED direttamente alla batteria, il LED si brucia e potrebbe addirittura esplodere! [...] RICORDA: NON collegare MAI il LED direttamente alla batteria, ma inserisci sempre un resistore al centro!"
- pdf_components:
  - LED (collegato direttamente alla batteria SENZA resistore)
  - Batteria 9V
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — questo ESPERIMENTO 2 è puramente concettuale-didascalico (avvertimento). PDF non fornisce passi 'Collega ...' espliciti, è un esperimento di osservazione/spiegazione di cosa NON fare; non c'è una sequenza di wiring narrativa numerata"
- pdf_variations: []
- code_id: "v1-cap6-esp2"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - led blue (id led1)
- code_title: "Cap. 6 Esp. 2 - LED senza resistore (cosa NON fare!)"
- structural_diff:
  - title_match: true (PDF concept "il LED si brucia se collegato senza resistore" → code "LED senza resistore (cosa NON fare!)" — match esatto semantico)
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: ["breadboard-half (PDF descrive collegamento diretto LED-batteria, code aggiunge breadboard come scaffold simulator strutturale)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Code AGGIUNGE breadboard come scaffold strutturale (PDF mostra collegamento concettuale diretto LED-batteria). Questo è interpretation pragmatica del simulatore, non spiattellamento. Code usa LED blu (PDF non specifica colore). Il code aggiunge 7 buildSteps wiring per simulare effetto 'brucia' nel simulatore — questi non sono nel libro perché è un esperimento osservativo concettuale, ma sono giustificati per simulazione interattiva."

## v1-cap6-esp3
- pdf_pages: 33 (ESPERIMENTO marker line 863; experiment text lines 863-892)
- pdf_concept: "Per rendere il led più luminoso ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm. [...] Con un resistore più basso, passa più corrente quindi il LED si illumina di più. Rendiamo il LED meno luminoso — Per rendere il led meno luminoso, ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore da 220 Ohm con uno da 1 kOhm. [...] Prova ora a cambiare il valore del resistore, ma NON scendere mai al di sotto dei 100 Ohm."
- pdf_components:
  - Resistore 470 Ohm (baseline ESP1)
  - Resistore 220 Ohm (variazione "più luminoso")
  - Resistore 1 kOhm (variazione "meno luminoso")
  - LED + batteria 9V + breadboard (carryover ESP1)
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — ESPERIMENTO 3 PDF è 'parti dal circuito che abbiamo realizzato', NON ridescrive wiring (riusa ESP1). Solo istruzione 'cambia il resistore'. Wiring implicito identico a ESP1"
- pdf_variations:
  - "Resistore 470 Ohm → 220 Ohm (più luminoso, più corrente)"
  - "Resistore 220 Ohm → 1 kOhm (meno luminoso, meno corrente)"
  - "Tinkering libero: prova qualsiasi resistore ≥100 Ohm"
- code_id: "v1-cap6-esp3"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1) — code default 470Ω, ma PDF arc è 470→220→1k
  - led green (id led1) — PDF non specifica colore, code usa verde
- code_title: "Cap. 6 Esp. 3 - Cambia luminosità con resistenze diverse"
- structural_diff:
  - title_match: true (PDF concetto "rendere LED più/meno luminoso cambiando resistore" → code "Cambia luminosità con resistenze diverse")
  - components_in_book_missing_in_code: ["resistor 220Ω esplicito", "resistor 1kΩ esplicito"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false (PDF ESP3 stesso = arc 3 resistori; code mantiene arc come run-time variation tramite `note`/`observe` campo "Cambia il valore del resistore: 220Ω, 470Ω, 1kΩ")
- severity: minor
- notes: "Code modella ESP3 con singolo resistore (470Ω default) ma istruzioni `note`+`steps` esplicitamente menzionano 'Prova a cambiare il resistore: 220Ω, 470Ω, 1kΩ'. Questo è coerente con narrativa PDF (PDF stesso descrive sequenza modifica come variazioni run-time, non come 3 esperimenti separati). NON spiattellato. Code arricchisce con quiz Legge di Ohm (PDF la rimanda a capitolo dedicato resistori)."

---

## v1-cap7-esp1
- pdf_pages: 36-37 (ESPERIMENTO marker line 934; experiment text lines 934-983)
- pdf_concept: "Accendiamo il LED rosso! [Per questo esperimento] [LED RGB + breadboard + batteria 9V + clip + resistore 470 Ohm + filo colorato]. Costruiamo passo passo. Posiziona il LED RGB in modo che il led rosso sia collegato all'altro lato del resistore da 470 Ohm (ricorda che la gambetta più lunga è il catodo) [...] Collega il catodo (la gambetta lunga) al negativo della batteria con un filo e … magia!"
- pdf_components:
  - Un LED RGB
  - Una breadboard
  - Una batteria 9V
  - La clip per la batteria 9V
  - Un resistore da 470 Ohm
  - Un filo colorato
- pdf_wires:
  - "Collega la clip della batteria alla batteria"
  - "Collega il positivo della batteria alla striscia rossa della breadboard"
  - "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto"
  - "Posiziona il LED RGB in modo che il led rosso sia collegato all'altro lato del resistore da 470 Ohm (ricorda che la gambetta più lunga è il catodo)"
  - "Collega il negativo della batteria alla striscia nera della breadboard"
  - "Collega il catodo (la gambetta lunga) al negativo della batteria con un filo"
- pdf_variations: []
- code_id: "v1-cap7-esp1"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1)
  - rgb-led (id rgb1)
- code_title: "Cap. 7 Esp. 1 - Accendi il rosso del RGB"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["filo colorato esplicito (PDF lo elenca; code lo include implicitamente in connections array)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: see §VERDICT (esp1 in sé = singolo, ma esp1+esp2+esp3 PDF formano arc 'scollega resistore e collegalo a colore N+1' = forte candidato spiattellamento)
- severity: medium
- notes: "Allineamento individuale OK. Tuttavia ESP1+ESP2+ESP3 PDF formano TRIO di variazioni 'scollega resistore e collegalo al colore X' (vedi sotto + §VERDICT spiattellato)."

## v1-cap7-esp2
- pdf_pages: 38 (ESPERIMENTO marker line 985; experiment text lines 985-996)
- pdf_concept: "Scollega il resistore da 470 Ohm dal rosso e collegalo al verde"
- pdf_components: [come ESP1 — riusa identico setup, solo varia pin RGB]
- pdf_wires:
  - "Scollega il resistore da 470 Ohm dal rosso e collegalo al verde"
- pdf_variations: []
- code_id: "v1-cap7-esp2"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1)
  - rgb-led (id rgb1)
- code_title: "Cap. 7 Esp. 2 - Accendi il verde del RGB"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: true (vedere §VERDICT — PDF presenta come UNA singola istruzione di 1 riga "scollega e ricollega"; code lo modella come esperimento separato a sé stante con 8 buildSteps duplicati di esp1)
- severity: medium
- notes: "Bandiera spiattellato concreta: PDF ESP2 PDF è UNA SOLA RIGA (Scollega il resistore da 470 Ohm dal rosso e collegalo al verde). Code lo modella come 8 buildSteps full duplicati di esp1 con solo wireFrom 'bb1:e4' invece di 'bb1:e2'. Pedagogicamente la PDF tratta come variazione minore del setup ESP1; code amplifica come esperimento autonomo."

## v1-cap7-esp3
- pdf_pages: 38-39 (ESPERIMENTO marker line 998; experiment text lines 998-1003)
- pdf_concept: "Scollega il resistore da 470 Ohm dal rosso e collegalo al blu"
- pdf_components: [come ESP1 — riusa identico setup]
- pdf_wires:
  - "Scollega il resistore da 470 Ohm dal rosso e collegalo al blu"
- pdf_variations: []
- code_id: "v1-cap7-esp3"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1)
  - rgb-led (id rgb1)
- code_title: "Cap. 7 Esp. 3 - Accendi il blu del RGB"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: true (vedere §VERDICT — stesso pattern ESP2)
- severity: medium
- notes: "Identico pattern spiattellato ESP2. PDF ESP3 = 1 riga; code = 8 buildSteps copia ESP1+pin diverso. Aggiunge unlimPrompt che spiega correttamente 'tensione di forward più alta per blu', che è valore aggiunto pedagogico — ma il problema strutturale resta: ESP1+ESP2+ESP3 nel libro sono UN concetto continuo 'i 3 LED del RGB si accendono uno alla volta riposizionando il resistore'."

## v1-cap7-esp4
- pdf_pages: 39-40 (ESPERIMENTO marker line 1005; experiment text lines 1005-1029)
- pdf_concept: "Abbiamo a disposizione tre colori dentro lo stesso involucro quindi è arrivato il momento di unirli. Prendi un altro resistore da 470 Ohm e prova ad accendere insieme due colori che preferisci per creare un colore nuovo. [...] Proviamo ad esempio a mettere insieme il rosso e il blu. [...] Abbiamo ottenuto il viola!"
- pdf_components:
  - Resistore aggiuntivo 470 Ohm (oltre quello ESP1)
  - LED RGB (continua da ESP1)
  - batteria 9V + breadboard (continua)
- pdf_wires:
  - "Prendi un altro resistore da 470 Ohm e prova ad accendere insieme due colori che preferisci per creare un colore nuovo"
- pdf_variations: ["scelta libera dei 2 colori da mescolare; PDF mostra esempio rosso+blu = viola"]
- code_id: "v1-cap7-esp4"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1)
  - resistor 470Ω (id r2)
  - rgb-led (id rgb1)
- code_title: "Cap. 7 Esp. 4 - Mescola 2 colori: il viola!"
- structural_diff:
  - title_match: true (PDF "mettere insieme rosso+blu = viola" → code "Mescola 2 colori: il viola!")
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false (qui è genuino salto qualitativo: 1 → 2 canali contemporanei, è salto di concetto, non variazione minore di pin)
- severity: minor
- notes: "Allineamento solido. ESP4 introduce concetto sintesi additiva, è qualitativamente diverso da ESP1-3 (passare da 1 LED acceso a 2 simultanei). Code fissa esempio viola (rosso+blu) coerente con esempio PDF. Lascerei nota: PDF dice 'prova ad accendere insieme due colori che preferisci' — quindi PDF ha fisso solo l'esempio (viola), non la combinazione 'must-be-rosso+blu'. Code potrebbe rendere combinazione configurabile (minor)."

## v1-cap7-esp5
- pdf_pages: 41 (ESPERIMENTO marker line 1034; experiment text lines 1034-1054)
- pdf_concept: "Prendi un altro resistore da 470 Ohm per accendere tutti i colori contemporaneamente. Accendendo tutti i colori contemporaneamente, dovresti in teoria ottenere il bianco! Molto probabilmente il colore che ottieni risulta leggermente azzurrino, questo perché per ottenere un bel bianco hai bisogno che il rosso sia più luminoso del verde e del blu! Come facciamo? Basta abbassare la resistenza del LED rosso! Prova a modificare il resistore del LED rosso abbassandolo prima a 330 Ohm e poi a 220 Ohm."
- pdf_components:
  - 3 resistori da 470 Ohm (uno per ogni canale)
  - LED RGB (continua)
  - batteria 9V + breadboard (continua)
  - Variazione finale: resistore canale rosso 470→330→220 per bilanciare il bianco
- pdf_wires:
  - "Prendi un altro resistore da 470 Ohm per accendere tutti i colori contemporaneamente"
- pdf_variations:
  - "Tutti e 3 i canali a 470 Ohm = bianco azzurrino (cattivo)"
  - "Resistore rosso 330 Ohm = bianco migliore"
  - "Resistore rosso 220 Ohm = bianco più bilanciato"
- code_id: "v1-cap7-esp5"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 470Ω (id r1)
  - resistor 470Ω (id r2)
  - resistor 470Ω (id r3)
  - rgb-led (id rgb1)
- code_title: "Cap. 7 Esp. 5 - Tutti e 3: bianco!"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["variazioni resistore rosso 330Ω e 220Ω esplicite (PDF chiude ESP5 con queste 2 variazioni di bilanciamento bianco)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false (ESP5 PDF è singolo concetto: bianco + bilanciamento; code modella stato base 470/470/470)
- severity: medium
- notes: "Code perde la variazione finale di bilanciamento bianco (PDF chiude esplicitamente con 'abbassa rosso a 330 poi 220'). Questa variazione è il momento didattico più ricco di ESP5 perché spiega percezione colore reale vs teoria additiva. Code observe accenna 'spesso con leggera dominante' ma non esegue il fix."

## v1-cap7-esp6
- pdf_pages: 42 (ESPERIMENTO marker line 1056; experiment text lines 1056-1066)
- pdf_concept: "Ora dovresti aver capito che puoi anche cambiare quanto è luminoso il singolo colore del LED RGB, quindi prova a giocare con i valori di resistenza dei colori per creare il colore che più ti piace!"
- pdf_components: [stesso ESP5: 3 resistori variabili + LED RGB + batteria + breadboard]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — ESP6 è puramente tinkering invitation 'gioca con i valori'. Nessun wiring nuovo, riusa setup ESP5. PDF ha solo immagine illustrativa"
- pdf_variations:
  - "Tinkering libero — qualsiasi combinazione di 3 resistori per ottenere qualsiasi colore"
- code_id: "v1-cap7-esp6"
- code_components:
  - battery9v (id bat1)
  - breadboard-half (id bb1)
  - resistor 220Ω (id r1) — code parte da setup colore custom (rosso più luminoso)
  - resistor 470Ω (id r2)
  - resistor 470Ω (id r3)
  - rgb-led (id rgb1)
- code_title: "Cap. 7 Esp. 6 - Crea il tuo colore!"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: see §VERDICT — ESP6 PDF è "tinkering invitation" pura (1 frase generica), code lo modella come esperimento autonomo con preset 220/470/470 → la sua esistenza separata da ESP5 è discutibile pedagogicamente
- severity: medium
- notes: "ESP6 PDF = invito al tinkering aperto (1 frase). Code crea preset 'crea il tuo colore' con 220/470/470 — questo PRESET POTREBBE ESSERE LA CHIUSURA DI ESP5 PDF (PDF ESP5 chiude con 'abbassa rosso a 330 poi 220'). Code separa ESP5 (white teorico 470/470/470) da ESP6 (custom 220/470/470 = white bilanciato di ESP5). Spiattellamento moderato: code ha 'preso il finale di ESP5' e l'ha trasformato in ESP6 separato + invito tinkering libero."

---

## §VERDICT — Andrea spiattellato cap7 RGB 6 esperimenti

**VERDICT: SPIATTELLATO PARZIALMENTE (~3-4/6 variazioni candidate)**

### Analisi onesta narrativa PDF cap7 (linee 894-1066):

Il libro Vol1 cap7 presenta i 6 esperimenti come **un singolo arc didattico continuo "Cos'è il LED RGB?"** con **progressione di concetto**:

1. **ESP1 (PDF p.36-37)**: full setup wiring — accendi il rosso (concetto: "i pin del RGB funzionano come 3 LED separati con catodo comune")
2. **ESP2 (PDF p.38)**: 1 frase "scollega resistore dal rosso, collegalo al verde" → **variazione di pin**
3. **ESP3 (PDF p.38-39)**: 1 frase "scollega resistore dal rosso, collegalo al blu" → **variazione di pin**
4. **ESP4 (PDF p.39-40)**: salto qualitativo "uniamo 2 colori = viola" → **nuovo concetto sintesi additiva**
5. **ESP5 (PDF p.41)**: estensione "uniamo 3 colori = bianco" + bilanciamento bianco → **variazione + tinkering bilanciamento**
6. **ESP6 (PDF p.42)**: 1 frase "gioca coi resistori per il tuo colore preferito" → **tinkering aperto**

### Identificazione spiattellamento:

| Esperimento | Spiattellamento | Razionale |
|-------------|------------------|-----------|
| ESP1 | NO | Full setup wiring originale, esperimento self-contained |
| **ESP2** | **SI** | PDF = 1 riga "scollega e ricollega"; code = 8 buildSteps duplicati di ESP1 |
| **ESP3** | **SI** | PDF = 1 riga "scollega e ricollega"; code = 8 buildSteps duplicati di ESP1 |
| ESP4 | NO | Genuino salto concettuale 1→2 canali (sintesi additiva) |
| ESP5 | NO/parziale | Genuino salto 2→3 canali; ma perde variazione bilanciamento bianco PDF (ESP5 finale 330/220 Ohm rosso) |
| **ESP6** | **SI parziale** | ESP6 PDF = "gioca liberamente"; code preset 220/470/470 = chiusura di ESP5 PDF spostata in esp separato |

### Risposta diretta alla domanda Andrea:

**"Cap7 (LED RGB) ha 6 esperimenti. Verifica ATTENTAMENTE se nel PDF Vol1 cap7 questi 6 sono presentati come UN concetto narrativo continuo OPPURE come 6 esperimenti narrativi davvero distinti."**

**Risposta**: nel PDF Vol1 cap7 i 6 esperimenti sono presentati come **UN ARCO DIDATTICO CONTINUO con 3 momenti concettuali distinti** (1=accendi singoli, 2=mescola 2-3, 3=tinkering finale) e **NON come 6 esperimenti narrativi indipendenti**. Lesson group `v1-led-rgb` in lesson-groups.js linea 24-31 conferma "concept: 'Mescola i colori con un singolo LED'" — UN concetto unico.

Code ha amplificato l'arco in 6 record JSON full-buildSteps. ESP2+ESP3 sono evidente spiattellamento (PDF = 1 riga, code = 8 buildSteps duplicati). ESP6 è spiattellamento parziale (preset preso da chiusura ESP5 PDF). ESP1+ESP4+ESP5 sono entità narrativa propria nel libro.

**Severity**: medium su ESP2+ESP3+ESP6 (3 esperimenti); ESP5 ha gap di variazione (bilanciamento bianco mancante). Mandate Andrea iter 21+ "spiattellato" CONFERMATO concretamente per cap7 RGB con evidenza PDF specifica.

### Raccomandazione (NO src/ modifications, solo flagging come da prompt):

1. **ESP2+ESP3** consolidabili in ESP1 come "variazione: ricollega il resistore al pin verde/blu" come step interattivo; risparmio ~16 buildSteps duplicati; preserva pedagogia (catodo comune → 3 LED indipendenti).
2. **ESP5** dovrebbe includere la variazione bilanciamento bianco 330→220 Ohm rosso come step 5b (PDF lo include esplicito).
3. **ESP6** è candidato a fusione con ESP5 come "tinkering finale: cambia i 3 resistori per ottenere il tuo colore preferito" (PDF ESP6 è 1 frase di invito libero).

Schema narrative ADR-027 (Vol3 refactor mention iter 19) potrebbe applicarsi anche a Vol1 cap7 RGB come case study di "variazioni concettualmente unificate".
