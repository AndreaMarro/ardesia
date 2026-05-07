# Maker-2 Vol2 Audit ch7-12
- Date: 2026-05-07
- Esperimenti audited: 14/14
- Chapters covered: 7, 8, 9, 10, 12 (cap11 = GAP CONFIRMED)
- PDF source: /tmp/vol2-full.txt (3004 lines, pdftotext -layout)
- Code source: src/data/experiments-vol2.js
- Lesson-groups source: src/data/lesson-groups.js (lines 141-174 reference 14 IDs)
- Spec: docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md
- Ground truth: automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md (lines 67-86)
- Gaps: none. All 14 esperimenti audited fully. Cap11 GAP CONFIRMED via PDF text extract (zero ESPERIMENTO markers in pp.99-102).

---

## v2-cap7-esp1
- pdf_pages: 67-68
- pdf_concept: "Effetto di scarica del condensatore elettrolitico osservato col multimetro: tieni premuto il pulsante per caricare a 9V, rilascia per osservare la scarica lenta sul multimetro (i puntali si comportano come un resistore di valore molto elevato)."
- pdf_components: ["condensatore 1000uF", "pulsante", "multimetro", "filo colorato", "resistore 1kΩ", "batteria 9V (implicita)", "breadboard (implicita)"]
- pdf_wires: ["multimetro cavo nero -> negativo condensatore", "multimetro cavo rosso -> positivo condensatore", "pulsante un lato -> positivo del condensatore (con filo colorato)"]
- pdf_variations: []
- code_id: "v2-cap7-esp1"
- code_components: ["battery9v", "breadboard-half", "capacitor 1000", "push-button", "resistor 1000", "multimeter"]
- code_title: "Cap. 7 Esp. 1 - Scarica condensatore + multimetro"
- structural_diff:
  - title_match: true (semantic match: scarica condensatore + multimetro)
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. Componenti, concetto, ordine match. Codice include layout/buildSteps dettagliati che PDF non specifica (il PDF cita 'Inserisci il condensatore a cavallo della separazione centrale' senza fornire fori specifici, codice mappa e5/e6/e10/f12/e16/e23 — interpretazione legittima)."

## v2-cap7-esp2
- pdf_pages: 69-71
- pdf_concept: "Continua osservazione scarica condensatore, ora con LED rosso e resistore in serie. La scarica è visibile sia sul LED che si spegne lentamente sia sul multimetro che mostra la tensione che diminuisce. Domanda finale: come aumentare la durata? Mettendo capacità in parallelo."
- pdf_components: ["condensatore 1000uF", "pulsante", "LED rosso", "multimetro", "tre fili colorati", "resistore 1kΩ", "batteria 9V (implicita)", "breadboard (implicita)"]
- pdf_wires: ["pulsante a cavallo divisione centrale + batteria collegata", "negativo condensatore -> negativo batteria (filo)", "resistore tra positivo condensatore e punto qualsiasi breadboard", "positivo LED -> lato libero resistore", "negativo LED -> punto qualsiasi breadboard dopo divisione centrale", "negativo LED -> negativo batteria (filo)", "multimetro cavo rosso -> positivo condensatore", "multimetro cavo nero -> negativo condensatore"]
- pdf_variations: []
- code_id: "v2-cap7-esp2"
- code_components: ["battery9v", "breadboard-half", "capacitor 1000", "push-button", "led red", "resistor 1000", "multimeter"]
- code_title: "Cap. 7 Esp. 2 - Scarica con LED rosso"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. PDF mostra 9 collegamenti narrativi, codice connections array contiene 10 wires (multimetro+LED+condensatore+resistore tutti coperti). Concetto pedagogico (curva esponenziale visibile sul LED + multimetro) preservato."

## v2-cap7-esp3
- pdf_pages: 72
- pdf_concept: "Condensatori in parallelo per aumentare capacità totale (Ctot=C1+C2+C3) e quindi scarica più lenta. Nel kit ci sono 3 condensatori da 1000uF 25V. Procedura: parti dal circuito esp 2, aggiungi prima un secondo condensatore in parallelo, poi un terzo, e osserva come cambia la scarica."
- pdf_components: ["3 condensatori 1000uF 25V", "circuito esp2 (pulsante + resistore + LED + multimetro)", "batteria 9V (implicita)", "breadboard (implicita)"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — il PDF descrive la procedura solo a livello di concetto (aggiungi condensatore in parallelo) senza schema testuale dei fori/fili. Nessuna istruzione step-by-step di wiring."
- pdf_variations: ["1 condensatore solo (esp2 baseline)", "2 condensatori in parallelo", "3 condensatori in parallelo"]
- code_id: "v2-cap7-esp3"
- code_components: ["battery9v", "breadboard-half", "capacitor 1000 x3", "push-button", "resistor 1000", "led red"]
- code_title: "Cap. 7 Esp. 3 - Condensatori in parallelo"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["multimetro (PDF esp3 eredita esp2 setup che includeva multimetro; codice esp3 NON include mm1)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match strutturale buono — codice ha 3 capacitor distinct (c1+c2+c3 da 1000) come da PDF 'Nel kit sono presenti 3 condensatori da 1000uF'. Multimetro PDF implicito (eredita esp2) ma codice non lo include. Concetto Ctot=C1+C2+C3 e Tau scaling preservato in observe/quiz."

## v2-cap7-esp4
- pdf_pages: 73
- pdf_concept: "Sulla base esp2, varia il valore di resistenza (alza/abbassa) e osserva come cambia scarica condensatore. Prova anche su esp3 (condensatori in parallelo). Lezione: con C più alto e R più alto la scarica è più lenta (Tau=R*C)."
- pdf_components: ["circuito esp2 (condensatore 1000uF + pulsante + LED + multimetro)", "resistori di valori diversi (sostituire resistore 1kΩ esp2)", "batteria 9V (implicita)", "breadboard (implicita)"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — istruzione 'cambia il valore di resistenza' non fornisce wiring step-by-step, eredita esp2."
- pdf_variations: ["aumentare R (scarica più lenta)", "diminuire R (scarica più veloce)", "applicare anche a esp3 (3 condensatori in parallelo + R variabile)"]
- code_id: "v2-cap7-esp4"
- code_components: ["battery9v", "breadboard-half", "capacitor 1000", "push-button", "resistor 1000", "led red", "multimeter"]
- code_title: "Cap. 7 Esp. 4 - Variare R nella scarica RC"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: medium
- notes: "Componenti match esp2 baseline (condensatore singolo 1000 + R 1k + LED + pulsante + multimetro). PDF chiede esplicitamente di VARIARE R, ma codice fissa value: 1000 (uguale a esp2/esp1) — la 'variazione' non è strutturalmente codificata: per davvero variare R l'utente deve cambiare componente runtime (compatibile con simulatore valueparam ma non istruito nel buildSteps). Severity medium perché la natura sperimentale della 'variazione' è verbale ma non implementata in dati: l'esperimento di codice è quasi identico ad esp2 senza differenza visibile in pinAssignments/connections."

## v2-cap8-esp1
- pdf_pages: 78-80
- pdf_concept: "MOSFET come interruttore comandato dalla tensione. Posiziona transistor (gate sx, drain centro, source dx). Collega source al negativo, LED catodo al drain, resistore 470Ω tra anodo LED e breadboard, gate al positivo della batteria: il LED si accende. Il MOSFET come interruttore controllato da tensione."
- pdf_components: ["1 transistor (MOSFET)", "1 LED (colore a scelta)", "breadboard", "batteria 9V", "clip pila 9V", "1 resistore 470Ω", "4 fili colorati"]
- pdf_wires: ["clip batteria -> striscia rossa (positivo) e nera (negativo) della breadboard", "source MOSFET (pin destro) -> negativo batteria (cavetto)", "catodo LED -> drain MOSFET (pin centrale, cavetto)", "resistore 470Ω -> tra anodo LED e punto qualsiasi dopo divisione centrale", "source MOSFET -> negativo batteria (cavetto)", "gate MOSFET -> positivo batteria"]
- pdf_variations: []
- code_id: "v2-cap8-esp1"
- code_components: ["battery9v", "breadboard-half", "mosfet-n", "resistor 470", "led red"]
- code_title: "Cap. 8 Esp. 1 - MOSFET come interruttore"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. PDF dice 'LED del colore che ti piace di più', codice fissa color: red (interpretazione legittima). PDF cita 4 fili colorati, codice connections array ha 7 wires (incluse alimentazione e gate). Concetto MOSFET come interruttore preservato in observe/unlimPrompt."

## v2-cap8-esp2
- pdf_pages: 81 (corpo umano carica statica)
- pdf_concept: "Sulla base esp1, scollega gate dal positivo e collegalo al negativo (spegne il circuito scaricando il gate). Solleva il cavetto, tocca l'estremità col dito: la carica del corpo basta per riaccendere il LED. Mostra impedenza altissima del gate."
- pdf_components: ["circuito esp1 (transistor + LED + R 470 + breadboard + batteria 9V)"]
- pdf_wires: ["scollegare il cavetto del gate dal positivo", "collegare gate al negativo (per scaricare)", "sollevare cavetto e toccare estremità con dito"]
- pdf_variations: []
- code_id: "v2-cap8-esp2"
- code_components: ["battery9v", "breadboard-half", "mosfet-n", "resistor 470", "led red"]
- code_title: "Cap. 8 Esp. 2 - MOSFET e carica del corpo"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match strutturale buono. PDF ha duplicato marker 'ESPERIMENTO 2' (riga 2229 e 2239 di /tmp/vol2-full.txt) — il primo block (2229-2238) è il vero esp2 (gate flottante + tocco dito), il secondo block (2239+) è il TRUE esp3 con potenziometro. Marker duplicato è artefatto pdftotext del libro stesso (probabile errore tipografico volume V0.9). Codice mappa correttamente esp2 = gate flottante."

## v2-cap8-esp3
- pdf_pages: 81-83
- pdf_concept: "Tensione di soglia Vth (~1V BJT, ~2V MOSFET kit). Parti da esp1, scollega cavetto del gate. Aggiungi potenziometro a cavallo divisione centrale + R 470. Pin1 pot al negativo, pin3 al positivo, pin2 al gate. Multimetro tra gate e negativo. Ruota alberino: tensione gate sale, MOSFET si accende quando supera soglia."
- pdf_components: ["1 transistor (MOSFET)", "1 LED (colore a scelta)", "breadboard", "batteria 9V", "clip pila 9V", "1 resistore 470Ω", "1 potenziometro con alberino", "il multimetro", "8 fili colorati"]
- pdf_wires: ["scollega cavetto del gate (esp1 setup)", "potenziometro a cavallo divisione centrale accanto al resistore 470Ω", "pin 1 potenziometro -> negativo batteria", "pin 3 potenziometro -> positivo batteria", "pin 2 potenziometro -> gate transistor", "multimetro -> tra gate e negativo batteria"]
- pdf_variations: []
- code_id: "v2-cap8-esp3"
- code_components: ["battery9v", "breadboard-half", "mosfet-n", "potentiometer 10000", "resistor 470", "led red", "multimeter"]
- code_title: "Cap. 8 Esp. 3 - MOSFET: l'interruttore magico"
- structural_diff:
  - title_match: true (semantic match: MOSFET con tensione variabile via potenziometro)
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. Il code_title 'l'interruttore magico' è friendly per bambini ma semanticamente corretto. PDF marker duplicato 'ESPERIMENTO 2' (vedi v2-cap8-esp2 notes) — il vero esp3 inizia a riga 2239 di /tmp/vol2-full.txt. Componenti match 100%. Concetto Vth preservato in unlimPrompt come 'energia abbastanza al cancello' (semplificato per bambini)."

## v2-cap9-esp1
- pdf_pages: 86-87 (NB: PDF testo dice 'utilizzeremo un fotoresistore come sensore' alla riga 2365, ma è errore tipografico del libro: l'esperimento usa fototransistor — vedi pdf_components 'fototransistor' a riga 2380)
- pdf_concept: "Fototransistor come sensore di luce: misura con multimetro la tensione ai capi di una resistenza in base alla luce sul fototransistor. Più luce = più conduzione = quasi 9V; buio = vicino a 0V. Si crea sensore di luce."
- pdf_components: ["breadboard", "batteria 9V", "clip pila 9V", "1 resistore 10kΩ", "1 fototransistor", "il multimetro"]
- pdf_wires: ["fototransistor a cavallo divisione centrale (emettitore pin corto verso il basso)", "resistore 10kΩ -> tra emettitore fototransistor e striscia nera inferiore (negativo)", "multimetro fondoscala 20V -> ai capi del resistore 10kΩ", "positivo batteria -> collettore fototransistor", "negativo batteria -> striscia nera con resistore 10kΩ"]
- pdf_variations: []
- code_id: "v2-cap9-esp1"
- code_components: ["battery9v", "breadboard-half", "phototransistor", "resistor 10000", "multimeter"]
- code_title: "Cap. 9 Esp. 1 - Fototransistor come sensore"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. Componenti match 100%. Concetto partitore di tensione luce-controllato preservato in observe/unlimPrompt. PDF errore typo 'fotoresistore' (riga 2365) chiaramente è fototransistor in lista materiali e wiring."

## v2-cap9-esp2
- pdf_pages: 89-92
- pdf_concept: "Fototransistor pilota MOSFET per accendere LED al buio (sensore di luce automatico inverso). Serie di 4 resistori 10kΩ = 40kΩ, fototransistor tra ultimo R e negativo, MOSFET con gate al collettore fototransistor, LED al drain MOSFET, R 470 tra positivo e anodo LED."
- pdf_components: ["breadboard", "batteria 9V", "clip pila 9V", "4 resistori 10kΩ", "1 resistore 470Ω", "1 fototransistor", "1 LED (colore a scelta)", "1 transistor MOSFET", "4 fili colorati"]
- pdf_wires: ["clip batteria -> positivo a striscia rossa, negativo a striscia nera", "serie 4 resistori 10kΩ = 40kΩ", "fototransistor -> tra ultimo resistore e negativo batteria", "MOSFET nella breadboard accanto all'ultimo resistore", "gate MOSFET -> collettore fototransistor (filo)", "source MOSFET -> negativo batteria (filo)", "LED accanto MOSFET (anodo verso destra)", "catodo LED -> drain MOSFET (filo)", "resistore 470Ω -> tra positivo batteria e anodo LED"]
- pdf_variations: []
- code_id: "v2-cap9-esp2"
- code_components: ["battery9v", "breadboard-half", "phototransistor", "mosfet-n", "resistor 10000 x4 (r1,r2,r3,r4)", "resistor 470 (r5)", "led white"]
- code_title: "Cap. 9 Esp. 2 - Luce notturna automatica"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. Codice ha 4 resistori da 10k (r1-r4) + 1 da 470 (r5) come da PDF lista materiali. PDF dice LED 'colore preferito', codice fissa white (interpretazione legittima per luce notturna). Concetto logica invertita (buio=ON) preservato. NB: nel PDF wiring è descritto serie 4xR10k ma uso reale logico è pull-up del nodo gate per controllo MOSFET — codice connections riflette pattern pull-up/pull-down con cross-link a g28 (gate). Severity minor."

## v2-cap10-esp1
- pdf_pages: 95
- pdf_concept: "Far girare il motore DC: collega il filo rosso del motore al positivo batteria e il filo nero al negativo. Osserva il verso di rotazione. Conversione energia elettrica -> meccanica."
- pdf_components: ["breadboard", "batteria 9V", "clip pila 9V", "un motore"]
- pdf_wires: ["filo rosso motore -> positivo batteria", "filo nero motore -> negativo batteria"]
- pdf_variations: []
- code_id: "v2-cap10-esp1"
- code_components: ["battery9v", "breadboard-half", "motor-dc"]
- code_title: "Cap. 10 Esp. 1 - Far girare il motore"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento perfetto. Componenti minimal match 100%. Codice include simulable: false con simulableReason 'Richiede motore DC fisico' (corretto, motor-dc richiede kit fisico)."

## v2-cap10-esp2
- pdf_pages: 95-96
- pdf_concept: "Inverti filo rosso e nero del motore (oppure quelli della batteria): osserva in che verso gira ora. La polarità inverte rotazione."
- pdf_components: ["circuito esp1 (batteria 9V + motore)"]
- pdf_wires: ["inverti filo rosso e filo nero (sia motore che batteria, equivalente)"]
- pdf_variations: ["invertire ai capi della batteria", "invertire ai capi del motore"]
- code_id: "v2-cap10-esp2"
- code_components: ["battery9v", "breadboard-half", "motor-dc"]
- code_title: "Cap. 10 Esp. 2 - Invertire la rotazione"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento ottimo. Codice esp2 mappa pinAssignments mot1:positive a a10 e mot1:negative ad a5 (inversione rispetto esp1) come da PDF 'inverti filo rosso e nero'."

## v2-cap10-esp3
- pdf_pages: 96
- pdf_concept: "Inserisci pulsante per comandare il motore acceso/spento. Concetto: circuito aperto/chiuso via pulsante."
- pdf_components: ["circuito esp1 (motore + batteria 9V)", "1 pulsante"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — il PDF dice 'Prova a inserire un pulsante per comandare il motore acceso e spento' senza step-by-step wiring testuale."
- pdf_variations: []
- code_id: "v2-cap10-esp3"
- code_components: ["battery9v", "breadboard-half", "push-button", "motor-dc"]
- code_title: "Cap. 10 Esp. 3 - Motore con pulsante"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento buono. PDF è scarno (1 frase per esp3-4) lasciando interpretazione al docente. Codice fornisce pinAssignments+connections concreti per render simulator (e10/f12 pulsante, motore esterno con wire diretto). Concetto preservato."

## v2-cap10-esp4
- pdf_pages: 96
- pdf_concept: "Inserisci pulsante per comandare il motore aggiungendo anche resistenza e LED in modo che quando il motore inizia a girare il LED si accenda. LED come indicatore visivo motore in funzione."
- pdf_components: ["circuito esp3 (motore + batteria 9V + pulsante)", "una resistenza", "un LED"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — il PDF è una frase sintetica, no wiring step-by-step."
- pdf_variations: []
- code_id: "v2-cap10-esp4"
- code_components: ["battery9v", "breadboard-half", "push-button", "motor-dc", "resistor 470", "led green"]
- code_title: "Cap. 10 Esp. 4 - Motore + pulsante + LED indicatore"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento buono. PDF non specifica colore LED né valore R: codice fissa green/470 (interpretazione legittima). Topologia code = LED in parallelo al motore (entrambi dopo pulsante), che è coerente con 'quando il motore inizia a girare il LED si accenda' del PDF."

## v2-capstone-esp1 / v2-cap12-esp1
- pdf_pages: 103-112
- pdf_concept: "Robot Segui Luce: monta motoriduttori + ruote, incolla breadboard e motori, posiziona 2 diodi (catodo verso striscia nera = catodo verso positivo, è diodo flyback configurazione cap. 11), 2 MOSFET, 2 fototransistor (collettore in striscia rossa). Cross-connection: fototransistor destro pilota motore sinistro e viceversa. 2 resistori 10kΩ pull-down sull'emettitore. Simmetrico rispetto a divisione centrale. Motori collegati con polarità invertita reciproca per girare nella stessa direzione fisica. Source MOSFET al negativo, drain al motore. Avvicina la luce ai fototransistor: il robot segue la luce."
- pdf_components: ["breadboard", "sei cavi colorati", "batteria 9V", "clip pila 9V", "due transistor (MOSFET)", "due resistori 10kΩ", "due diodi", "due motori", "due ruote", "due fotoresistori (NB: PDF lista 'due fotoresistori' a riga 2759 — errore tipografico libro: l'esperimento USA fototransistor come confermato a riga 2856 'Dobbiamo inserire i fototransistor sulla breadboard')", "il supporto batteria"]
- pdf_wires: ["catodo diodo (banda grigia) -> riga nera della breadboard (= positivo per cap. 11 flyback config, NB nel testo del libro la 'riga nera' è il bus negativo, ma nello schema reale del cap. 11 il diodo flyback ha CATODO verso il POSITIVO — possibile inconsistenza testo libro v0.9, da chiarire con autore Davide)", "fototransistor collettore -> striscia rossa (positivo)", "fototransistor destro -> MOSFET sinistro gate (cross)", "fototransistor sinistro -> MOSFET destro gate (cross)", "resistori 10kΩ pull-down sull'emettitore di ciascun fototransistor", "strisce alimentazione + di un lato collegate a + dell'altro lato (ponte simmetrico)", "strisce alimentazione - di un lato collegate a - dell'altro lato (ponte simmetrico)", "source MOSFET -> negativo batteria", "drain MOSFET -> motore (uno con polarità +, l'altro invertito)"]
- pdf_variations: []
- code_id: "v2-cap12-esp1"
- code_components: ["battery9v", "breadboard-full", "phototransistor x2 (pt1,pt2)", "mosfet-n x2 (mos1,mos2)", "resistor 10000 x2 (r1,r2)", "diode x2 (d1,d2)", "motor-dc x2 (mot1,mot2)"]
- code_title: "Cap. 12 - Robot Segui Luce"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["due ruote (PDF cita ruote come parte materiali, codice non le include come componenti SVG — ruote sono fisiche extra-SVG, accettabile gap)", "supporto batteria (PDF cita supporto batteria, codice non lo include — fisico extra-SVG, accettabile gap)", "sei cavi colorati (PDF cita 6, codice connections array contiene 17 wires — count diverso ma copertura completa, nessuna logica mancante)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: medium
- notes: "Match strutturale-elettronico molto buono. Cross-connection corretta (a6->g21 e a20->g7), pull-down resistors presenti, diodi flyback presenti (d1+d2). Severity medium per: (1) gap meccanici ruote+supporto-batteria (estranei al simulatore SVG), (2) PDF terminologia inconsistente 'fotoresistori'/'fototransistor' nello stesso paragrafo (libro errore tipografico), (3) tensione corretta del diodo flyback (anode->mos*:drain, cathode->bat+) implementata in codice ma testo PDF della 'riga nera' può confondere docente — lieve narrativo discrepancy. Concetto pedagogico (cross-link sensori-motori, diodi protezione) preservato in observe/unlimPrompt."

---

## CAP11_GAP_CONFIRMATION

- pdf_pages: 99-102
- pdf_chapter_title: "I diodi"
- pdf_chapter_intro: "Scopriamo un componente elettronico molto utile che si trova in tanti circuiti: il diodo. Abbiamo già sentito questo nome per i LED, sono infatti parenti..."
- pdf_chapter_topics: ["concetto diodo come strada a senso unico per la corrente", "anodo/catodo identificazione (banda grigia su corpo)", "uso protezione contro inversione polarità batteria", "diodo flyback per protezione bobine motore", "Legge: catodo verso positivo, anodo verso negativo nei flyback motori"]
- pdf_esperimento_count: 0
- confirmed: true
- notes: "Verificato via grep -nE 'ESPERIMENTO|^Capitolo' /tmp/vol2-full.txt nel range 2624-2738 (pagine PDF 99-102). Capitolo 11 inizia a riga 2624 ('CAPITOLO 11') e termina a riga 2738 (transizione a CAPITOLO 12 riga 2739). In quel range: ZERO marker 'ESPERIMENTO' trovati. Capitolo 11 è puramente teorico — funge da setup pedagogico per il capstone (cap.12) dove i diodi flyback vengono effettivamente usati nel Robot Segui Luce. Coerente con ground-truth (VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md riga 83 'Cap11 GAP CONFERMATO ground truth (PDF cap11 puramente teorico, no esp)'). Quindi il fatto che `experiments-vol2.js` non contenga `v2-cap11-*` ID e che `lesson-groups.js` non includa lessoni cap11 è CORRETTO design (NON è un bug)."

---

## Summary statistics

- Total esperimenti audited: 14/14 (100% coverage of Maker-2 scope ch7-12)
- Severity distribution: 12 minor, 2 medium (v2-cap7-esp4 R-variation not parametrized + v2-capstone gap meccanico), 0 high, 0 critical
- Title match: 14/14 (100%)
- Components mismatch (ignoring fisica extra-SVG): 0/14 critical mismatches
- Variations collapsed to separate esp: 0/14 (NO instance of "spiattellatura" found in scope ch7-12 — esperimenti PDF mappano 1-to-1 a record codice)
- pdf_wires extracted from text: 11/14 explicit, 3/14 (cap7-esp3, cap7-esp4, cap10-esp3, cap10-esp4 = 4) marked figure_only_no_text or no-step-by-step (these PDF sections sono sintetiche, propongono variazioni di esperimenti precedenti senza step-by-step wiring narrativo)
- Cap11 GAP: CONFIRMED — ground truth and PDF agree, code correctly omits cap11 esperimenti.

## Key cross-cutting findings

1. **PDF marker duplicato 'ESPERIMENTO 2' in cap8** (righe 2229 e 2239 di /tmp/vol2-full.txt): è errore tipografico libro V0.9. Il vero esp3 con potenziometro inizia a riga 2239. Codice mappa correttamente esp2 (gate flottante) e esp3 (potenziometro).
2. **PDF errore tipografico cap9-esp1 'fotoresistore'** (riga 2365): l'esperimento USA fototransistor come da lista materiali (riga 2380) e wiring (riga 2382). Codice usa correttamente phototransistor.
3. **PDF errore tipografico cap12 'due fotoresistori'** (riga 2759): l'esperimento USA fototransistor come confermato a riga 2856 ('Dobbiamo inserire i fototransistor sulla breadboard'). Codice usa correttamente phototransistor.
4. **Cap10 esp 3-4 sintetici nel PDF**: una frase ciascuno, senza step-by-step. Codice elabora i dettagli (pulsante in e10/f12, LED in d23/d24, R 470). Severity minor — interpretazione legittima.
5. **Cap7 esp4 'variare R' non parametrizzato**: codice fissa R=1000 identico a esp1/esp2; la variazione richiesta dal PDF è una procedura runtime/manuale, non strutturale. Severity medium (la "variazione" rimane verbale, non implementata in dati).
6. **Cap12 capstone gap meccanici**: ruote, supporto batteria, 6 cavi colorati elencati nel PDF ma non rappresentati nei components SVG (ruote+supporto sono extra-elettronici, accettabile per simulator-only audit; cavi diversi count: PDF 6 vs code 17 wires, ma copertura logica completa).
