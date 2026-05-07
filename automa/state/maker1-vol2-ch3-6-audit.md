# Maker-1 Vol2 Audit ch3-6
- Date: 2026-05-07
- Esperimenti audited: 13/13
- Chapters covered: 3, 4, 5, 6
- PDF source: /tmp/vol2-full.txt (extracted from VOL2_ITA_COMPLETO GP V 0.1.pdf, 3004 lines, pdftotext -layout)
- Code source: src/data/experiments-vol2.js
- Spec: docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md
- Lesson groups source: src/data/lesson-groups.js (cap3 → 1 lezione 4 esp, cap4 → 1 lezione 3 esp, cap5 → 1 lezione 2 esp, cap6 → 1 lezione 4 esp)
- Gaps: none — full PDF text coverage cap3-6 verified, full code coverage 13/13 entries read

## Anchor map (PDF chapter heading → line + ESPERIMENTO offsets)
- Cap3 "Il Multimetro" pag.13 — chapters TOC line 19; ESPERIMENTO 1 line 437 (pag.17), ESPERIMENTO 2 line 531 (pag.20), ESPERIMENTO 3 line 605 (pag.22), ESPERIMENTO 4 line 775 (pag.27)
- Cap4 "Approfondiamo le resistenze" pag.37 — TOC line 21; ESPERIMENTO 1 line 1237 (pag.43), ESPERIMENTO 2 line 1251 (pag.44), ESPERIMENTO 3 line 1277 (pag.45)
- Cap5 "Approfondiamo le Batterie" pag.47 — TOC line 23; ESPERIMENTO 1 line 1378 (pag.49), ESPERIMENTO 2 line 1444 (pag.51)
- Cap6 "Approfondiamo i Led" pag.53 — TOC line 25; ESPERIMENTO 1 line 1598 (pag.56), ESPERIMENTO 2 line 1643 (pag.58), ESPERIMENTO 3 line 1670 (pag.59), ESPERIMENTO 4 line 1705 (pag.60)

---

## v2-cap3-esp1
- pdf_pages: 17-19 (ESPERIMENTO 1 line 437-525)
- pdf_concept: "Controlliamo la carica della batteria 9V con multimetro in modalita Volt DC, fondo scala 20V, lettura ~9V batteria nuova, sotto 7V scarica, OL su scala sbagliata, segno meno se invertiti"
- pdf_components: ["multimetro", "batteria 9V", "clip per batteria 9V", "puntali rosso e nero (con coccodrilli)"]
- pdf_wires: ["puntale_rosso → clip_+_batteria", "puntale_nero → clip_-_batteria"]
- pdf_variations: ["lettura batteria carica ~9V", "lettura batteria scarica <7V", "errore polarita inversa (segno -)", "errore scala troppo piccola (OL)"]
- code_id: "v2-cap3-esp1"
- code_components: ["battery9v(bat1)", "multimeter(mm1)"]
- code_title: "Cap. 3 Esp. 1 - Controlliamo la carica della batteria"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["clip per batteria 9V (clip a coccodrilli, distinta dalla battery9v)", "puntali con coccodrilli (modellati come parte del multimeter ma non separati)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Allineamento concettuale forte. PDF tratta "9.4-9.6V" range mentre code dice "circa 9.4-9.6V". PDF cita esplicitamente OL (Over Load) e segno meno (polarita inversa) che il code copre solo parzialmente nel quiz. Componenti accessori (clip, puntali) impliciti nel multimeter del code. Linguaggio plurale: code usa "Posiziona...Collega" (singolare imperativo, tu) — viola PRINCIPIO ZERO docente plurale Ragazzi. unlimPrompt usa "il docente sta mostrando alla classe" + Italiano 10-14 anni OK ma manca verbatim citation Vol/pag."

## v2-cap3-esp2
- pdf_pages: 20 (ESPERIMENTO 2 line 531-559)
- pdf_concept: "Diario di misurazione della batteria 9V del kit: ogni misura segnata su tabella data/valore, controllo evoluzione carica nel tempo, monitoraggio batteria ricaricabile"
- pdf_components: ["multimetro", "batteria 9V (del kit)"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — PDF mostra solo tabella vuota data_____misura_____ ripetuta ~14 volte, no testo wiring"
- pdf_variations: ["batteria normale", "batteria ricaricabile (controllo carica)"]
- code_id: "v2-cap3-esp2"
- code_components: ["battery9v(bat1)", "multimeter(mm1)"]
- code_title: "Cap. 3 Esp. 2 - Diario di misurazione della pila"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match concettuale forte. PDF tratta diario come tabella data/valore — code lo descrive come "diario scientifico ogni giorno". Buon match. Code aggiunge motivazione scarica chimica ("energia chimica si esaurisce") che PDF lascia implicito. Linguaggio code "Posiziona...Collega" singolare-imperativo viola plurale docente. Step "Misura ogni giorno alla stessa ora" code-only — PDF non specifica frequenza ne ora. Quiz code copre concetto chimico non strettamente trattato in PDF cap3."

## v2-cap3-esp3
- pdf_pages: 22-25 (ESPERIMENTO 3 line 605-700)
- pdf_concept: "Misuriamo una resistenza da 330 Ohm con multimetro in modalita Ohm. Scala 2k. Tolleranza 5% (314, 326, 340 letture normali). OL su scala troppo piccola (200 invece di 2k). 0.0 su scala troppo grande o cortocircuito puntali. Coccodrilli devono mordere bene"
- pdf_components: ["multimetro", "resistore 330 Ohm"]
- pdf_wires: ["coccodrillo_1 → terminale_1_resistore", "coccodrillo_2 → terminale_2_resistore"]
- pdf_variations: ["scala corretta 2k", "scala troppo piccola 200 (OL)", "scala troppo grande (0.0)", "puntali in cortocircuito (0.0)", "contatto instabile (lettura che cambia)"]
- code_id: "v2-cap3-esp3"
- code_components: ["resistor(r1, value:330)", "multimeter(mm1)"]
- code_title: "Cap. 3 Esp. 3 - Misuriamo una resistenza"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match strutturale forte. Code menziona bande colorate "arancione-arancione-marrone" — PDF rinvia a immagine "Aiutati con l'immagine accanto se non ricordi i colori" senza enumerare bande. Code cita "5% (313-347 Ohm)" perfetto match con PDF "tolleranza 5%" e letture esempio (314,326,340). Variazioni PDF (OL/0.0/contatto instabile) non explorate nel code — solo accenno in hint. Linguaggio "Prendi...Posiziona" singolare-imperativo. unlimPrompt cita "il multimetro manda una piccola corrente" che PDF non spiega esplicitamente cap3 (corrette ma source-extension)."

## v2-cap3-esp4
- pdf_pages: 27-32 (ESPERIMENTO 4 line 775-1230 ca; con sezione teorica MISURIAMO LA CORRENTE pag.26-27 line 705-770)
- pdf_concept: "Misuriamo la corrente in un circuito con resistore 1kOhm e batteria 9V. Multimetro IN SERIE diventa parte del circuito. Calcolo atteso: I = V/R = 9V/1kOhm = 9mA. Fondo scala 20mA appropriato. Costruzione su breadboard"
- pdf_components: ["multimetro", "batteria 9V", "clip per batteria", "breadboard", "resistore 1 kOhm", "fili (jumper)"]
- pdf_wires: ["clip_+_batteria → striscia_rossa_superiore_breadboard", "resistore → tra_striscia_rossa_e_zona_inferiore", "multimetro → IN_SERIE_nel_circuito (interruzione tubo)"]
- pdf_variations: ["calcolo teorico 9mA pre-misura", "fondo scala 20mA scelto via teoria", "alternative scale 2000μA / 200mA discusse"]
- code_id: "v2-cap3-esp4"
- code_components: ["battery9v(bat1)", "breadboard-half(bb1)", "resistor(r1, value:1000)", "multimeter(mm1)"]
- code_title: "Cap. 3 Esp. 4 - Misuriamo la corrente in un circuito"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["clip per batteria 9V (implicit nella battery9v)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match concettuale forte. Code pinAssignments r1:pin1=a6, r1:pin2=a13 — PDF mostra figura ma testo non specifica fori esatti, solo "tra striscia rossa e zona al di sotto". Layout concettuale OK. Code unlimPrompt cita "Legge di Ohm I=V/R=9V/1000=9mA" verbatim PDF teoria. Code wireFrom/wireTo r1:pin2→bat1:negative diretto, ma PDF richiede multimetro IN SERIE (e code lo fa via mm1 inserito tra bat+ e r1) — concept correctly modeled. Linguaggio singolare-imperativo. Code wire da r1:pin2 a bat:neg puo essere problema topologia: la corrente non passa per multimetro se mm e tra bat+ e r1:pin1 e poi r1:pin2 va diretto a bat: → topologia ricontrollabile."

## v2-cap4-esp1
- pdf_pages: 43 (ESPERIMENTO 1 line 1237-1245)
- pdf_concept: "Due resistori da 1kOhm in parallelo sulla breadboard. Misura con multimetro: che valore ha il resistore equivalente? Verifica formula 1/Rtot = 1/R1 + 1/R2 con tolleranza"
- pdf_components: ["breadboard", "due resistori 1 kOhm", "multimetro"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — PDF rinvia ad "immagini proposte in questo capitolo" senza testo wiring esplicito"
- pdf_variations: ["misura attesa (calcolo teorico) vs reale (tolleranza)"]
- code_id: "v2-cap4-esp1"
- code_components: ["breadboard-half(bb1)", "resistor(r1, value:1000)", "resistor(r2, value:1000)", "multimeter(mm1)"]
- code_title: "Cap. 4 Esp. 1 - Due resistori in parallelo"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match strutturale forte. PDF testo cap4 esp1 estremamente conciso (3 righe + figura). Code espande con formula 1/Rtot, analogia autostrada (extension corretta). pinAssignments r1=a6/a13, r2=c6/c13 (parallelo via condividere stesse colonne — match figura PDF concept). Linguaggio singolare-imperativo. unlimPrompt non cita Vol/pag."

## v2-cap4-esp2
- pdf_pages: 44 (ESPERIMENTO 2 line 1251-1273)
- pdf_concept: "Tre resistori da 1kOhm in serie sulla breadboard. Misura totale con multimetro. Misura ogni resistore singolarmente, prendi nota dei valori. Sono simili o differenti? Tabella valori 1/2/3"
- pdf_components: ["breadboard", "tre resistori 1 kOhm", "multimetro"]
- pdf_wires: null
- pdf_wires_reason: "figure_only_no_text — PDF rinvia a figura senza enumerare collegamenti testuali"
- pdf_variations: ["misura totale 3 in serie", "misura individuale di ciascun resistore (tabella)", "confronto Valore1/2/3 per controllare tolleranza individuale"]
- code_id: "v2-cap4-esp2"
- code_components: ["breadboard-half(bb1)", "resistor(r1)", "resistor(r2)", "resistor(r3) tutti value:1000", "multimeter(mm1)"]
- code_title: "Cap. 4 Esp. 2 - Tre resistori in serie"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match concettuale forte. Code pinAssignments a4-a11/a12-a19/a20-a27 in serie consecutiva (corretto). Code aggiunge step "Togli un resistore e rimisura: 2000 Ohm" che PDF non chiede esplicitamente — ma la variazione 'misura individuale' del PDF non e replicata nel code (manca step misurare singoli per riempire tabella). Linguaggio singolare-imperativo. Quiz code menziona "4 resistori in serie = 4000 Ohm" che e extension OK."

## v2-cap4-esp3
- pdf_pages: 45 (ESPERIMENTO 3 line 1277-1297)
- pdf_concept: "Sulla base del circuito esp2 (3 resistori in serie), aggiungi batteria. Coccodrillo nero su negativo, rosso su punti J9, J5, J1. Prendi nota tre tensioni V(J1), V(J5), V(J9). 'Succede quello che ti aspettavi? Applica legge di Ohm'. Partitore di tensione introdotto con misure punti specifici"
- pdf_components: ["breadboard (con 3 resistori esp2)", "batteria 9V", "multimetro", "coccodrilli rosso/nero"]
- pdf_wires: ["coccodrillo_nero → bat_negativo", "coccodrillo_rosso → punti J9, J5, J1 (sequenziali sulla breadboard)"]
- pdf_variations: ["misura V(J1)", "misura V(J5)", "misura V(J9)"]
- code_id: "v2-cap4-esp3"
- code_components: ["battery9v(bat1)", "breadboard-half(bb1)", "resistor(r1)", "resistor(r2)", "resistor(r3) value:1000", "multimeter(mm1)"]
- code_title: "Cap. 4 Esp. 3 - Partitore di tensione"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: medium
- notes: "Concetto match (partitore di tensione) MA punti di misura PDF specifici (J1/J5/J9 — riga J fila opposta breadboard, punti specifici tra resistori) — code usa A4-A27 fila A ma testo step misure non specifica J1/J5/J9 ne 'tre punti sequenziali per leggere V crescenti'. Code descrive 'misura ai capi di ogni resistore: 3V ciascuno' che e concetto giusto ma punti misura disallineati con J1/J5/J9 PDF. PDF chiede esplicitamente 'V(J1)/V(J5)/V(J9)' come 3 misure separate — code copre genericamente in step text ma non struttura 3 sub-misure. Linguaggio singolare-imperativo. Variazioni 3 punti misura collapsed in narrative unica vs 3 letture distinte PDF."

## v2-cap5-esp1
- pdf_pages: 49-50 (ESPERIMENTO 1 line 1378-1442)
- pdf_concept: "Batterie in serie (più 'spinta'!). Capire come batterie AA/AAA da 1.5V in serie aumentano la tensione. Passo 1 misura singola batteria ~1.5V. Passo 2 due batterie in serie ~3V. Passo 3 tre o quattro batterie in serie 4.5V o 6V. Cita 1.5Vx2=3V, 1.5Vx3=4.5V, 1.5Vx4=6V"
- pdf_components: ["3 o 4 batterie AA/AAA da 1.5V", "multimetro"]
- pdf_wires: ["polo_+_bat1 → polo_-_bat2", "polo_+_bat2 → polo_-_bat3 (chain serie)", "puntale_rosso_multimetro → polo_+_libero", "puntale_nero_multimetro → polo_-_libero"]
- pdf_variations: ["1 batteria 1.5V (Passo 1)", "2 batterie in serie 3V (Passo 2)", "3 batterie 4.5V (Passo 3)", "4 batterie 6V (Passo 3)"]
- code_id: "v2-cap5-esp1"
- code_components: ["battery9v(bat1)", "battery9v(bat2)", "multimeter(mm1)"]
- code_title: "Cap. 5 Esp. 1 - Batterie in serie (più spinta!)"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["batterie AA/AAA 1.5V (PDF usa 1.5V x N, code usa 9V x 2)"]
  - components_in_code_missing_in_book: ["battery9v come tipo (PDF non usa 9V per esp serie cap5, usa 1.5V AA/AAA)"]
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: high
- notes: "DIVERGENZA SOSTANZIALE COMPONENTI: PDF Cap5 Esp1 usa esplicitamente batterie AA/AAA da 1.5V (3 o 4 batterie + multimetro), risultati 1.5V/3V/4.5V/6V. Code usa due battery9v dando 9V+9V=18V. Stesso CONCETTO (somma tensioni in serie) ma componenti FISICI diversi e variazioni multiple PDF (1/2/3/4 batterie collapsed). Code unlimPrompt cita 'le pile della torcia 1.5V x 2 = 3V' che e match parziale ma il setup hardware e divergente. Possibile ragione: kit ELAB ha solo 9V? Da verificare con Omaric. Severity high per discrepanza materiale fisico vs ground truth narrativa libro."

## v2-cap5-esp2
- pdf_pages: 51 (ESPERIMENTO 2 line 1444-1469)
- pdf_concept: "Antiserie batterie. Cosa succede se collegamento positivo+positivo invece di +/- in serie? V=1.5V-1.5V=0V se uguali, oppure piccolo positivo/negativo se differenti. Lettura negativa multimetro = puntali invertiti su batteria. Definizione formale ANTISERIE per componenti polarizzati"
- pdf_components: ["batterie AA/AAA 1.5V (continua da esp1)", "multimetro"]
- pdf_wires: ["polo_+_bat1 → polo_+_bat2 (antiserie)", "puntale_rosso → polo_-_bat1_libero", "puntale_nero → polo_-_bat2_libero"]
- pdf_variations: ["batterie identiche 0V", "batterie leggermente diverse 0.2V/-0.3V"]
- code_id: "v2-cap5-esp2"
- code_components: ["battery9v(bat1)", "battery9v(bat2)", "multimeter(mm1)"]
- code_title: "Cap. 5 Esp. 2 - Batterie in antiserie"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["batterie 1.5V AA/AAA (PDF continua da esp1)"]
  - components_in_code_missing_in_book: ["battery9v"]
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: high
- notes: "Stessa divergenza componenti di esp1: PDF antiserie 1.5V-1.5V=0V, code antiserie 9V-9V=0V. CONCETTO match ma componenti fisici divergenti. Code aggiunge analogia 'tiro alla fune alla pari' OK. PDF tratta sottilita 'batterie leggermente diverse 0.2V/-0.3V' che code accenna in quiz. Linguaggio singolare-imperativo. unlimPrompt cita 'antiserie + con +' verbatim concept."

## v2-cap6-esp1
- pdf_pages: 56-57 (ESPERIMENTO 1 line 1598-1637)
- pdf_concept: "Più LED in serie con un solo resistore di protezione. Breadboard, clip batteria 9V, resistore 330 Ohm, due LED del colore preferito. Collegamento: positivo batteria → striscia + → resistore → anodo LED1 → catodo LED1 → anodo LED2 → catodo LED2 → striscia - → negativo batteria. Sequenza step-by-step descritta nel PDF"
- pdf_components: ["breadboard", "clip per batteria 9V", "batteria 9V", "resistore 330 Ohm", "due LED colore a piacere"]
- pdf_wires: ["positivo_bat → striscia_+_breadboard", "resistore → tra_striscia_+_e_punto_qualsiasi", "anodo_LED1 → lato_libero_resistore", "catodo_LED1 → dopo_divisione_centrale_breadboard", "anodo_LED2 → catodo_LED1", "catodo_LED2 → negativo_batteria/striscia_-"]
- pdf_variations: ["due LED colore a piacere (variazione colore esplicita PDF)"]
- code_id: "v2-cap6-esp1"
- code_components: ["battery9v(bat1)", "breadboard-half(bb1)", "resistor(r1, 330)", "led(led1, red)", "led(led2, red)"]
- code_title: "Cap. 6 Esp. 1 - LED in serie con 1 resistore"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: minor
- notes: "Match strutturale forte. PDF dice 'due LED del colore che preferisci' — code fissa entrambi rossi (manca esplorazione variazione colore che PDF lascia aperta in esp1, poi tratta in esp2 come dedicato). pinAssignments e connections code dettagliati (e5/e12 resistore, d14/d15 led1, d18/d19 led2) — PDF testo conciso 'tra striscia + e punto qualsiasi' lascia liberta posizioni. Code con bus-top-plus e bus-top-minus segue figura PDF correttamente. Linguaggio singolare-imperativo. unlimPrompt cita 'in serie corrente uguale, tensioni si sommano' verbatim PDF concept."

## v2-cap6-esp2
- pdf_pages: 58 (ESPERIMENTO 2 line 1643-1664)
- pdf_concept: "Sulla base esp1, modifica colore secondo LED (es. blu) per apprezzare cambio intensita luminosa. Tabella colori utilizzati LED1/LED2 + NOTE: tre righe per provare combinazioni. Domanda PDF: 'Ti sembra che il LED rosso sia meno luminoso?'"
- pdf_components: ["stessi di esp1 (breadboard, batteria 9V, resistore 330, due LED)", "LED di colore diverso (es. blu) per il secondo LED"]
- pdf_wires: ["stesso wiring esp1 (riferimento)"]
- pdf_variations: ["LED1 colore A + LED2 colore B", "tabella 3 righe combinazioni colori"]
- code_id: "v2-cap6-esp2"
- code_components: ["battery9v(bat1)", "breadboard-half(bb1)", "resistor(r1, 330)", "led(led1, red)", "led(led2, green)"]
- code_title: "Cap. 6 Esp. 2 - LED in serie colori diversi"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: medium
- notes: "Match concettuale OK ma variazioni multiple PDF (TABELLA 3 righe combinazioni colori esplicite con NOTE) collapsed nel code in singola configurazione fixed (red+green). PDF concept 'apprezzare come cambia intensita' richiede esplorazione attiva — code descrive solo un caso. unlimPrompt cita Vf rosso 1.8V verde 2.2V blu 3.0V correttamente. PDF usa 'blu' come esempio, code sceglie 'verde' (entrambi LED non rossi sono OK ma scelta divergente). Linguaggio singolare-imperativo."

## v2-cap6-esp3
- pdf_pages: 59-60 (ESPERIMENTO 3 line 1670-1700)
- pdf_concept: "Tre LED in serie. Partendo da esp2 rimuovi resistore, aggiungi LED giallo (catodo verso anodo LED rosso, anodo collegato a punto breadboard). Resistore 330 → tra positivo batteria e anodo LED giallo. Variazione: cambia 330 → 220 osserva luminosita aumentata"
- pdf_components: ["breadboard", "batteria 9V + clip", "resistore 330 Ohm (poi 220)", "tre LED (rosso + verde + giallo o similari)"]
- pdf_wires: ["catodo_LED_giallo → anodo_LED_rosso", "anodo_LED_giallo → punto_breadboard", "resistore → tra_pos_batteria_e_anodo_LED_giallo (catena: bat+ → R → giallo → rosso → verde → bat-)"]
- pdf_variations: ["R=330 luminosita normale", "R=220 luminosita aumentata"]
- code_id: "v2-cap6-esp3"
- code_components: ["battery9v(bat1)", "breadboard-half(bb1)", "resistor(r1, 330)", "led(led1, red)", "led(led2, red)", "led(led3, red)"]
- code_title: "Cap. 6 Esp. 3 - Tre LED in serie"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: ["LED giallo (PDF usa giallo+rosso+verde della catena esp2)"]
  - components_in_code_missing_in_book: []
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: medium
- notes: "Concetto principale (3 LED serie + R variation 330→220) match perfetto. MA componenti divergenti: PDF richiede 3 LED COLORI DIVERSI (mantiene rosso+verde da esp2 + aggiunge giallo) per esplorare Vf cumulativa. Code usa 3 LED tutti rossi (Vf 1.8V x 3 = 5.4V) — concept Vf somma e calculation match in unlimPrompt ma narrativa colori diversi PDF persa. Variazione R=330→220 menzionata in steps ma non implementata come 2 esperimenti separati (correttamente collapsed essendo variazione interna PDF). Linguaggio singolare-imperativo. PDF dice 'la corrente e via via diminuita aggiungendo LED' — code unlimPrompt cita 5.4V correttamente."

## v2-cap6-esp4
- pdf_pages: 60-61 (ESPERIMENTO 4 line 1705-1742)
- pdf_concept: "Funzione prova diodi e continuita del multimetro. Misura Vf esatta del LED. Coccodrillo nero su catodo, rosso su anodo. Schermo mostra Vf (es. ~2V LED verde). Tre opzioni se nulla compare: puntali invertiti, diodo rotto, Vf troppo elevata. Usa Vf misurata per calcolare resistore esatto"
- pdf_components: ["multimetro (modalita prova diodi)", "diodo/LED (es. verde)", "coccodrilli rosso/nero"]
- pdf_wires: ["coccodrillo_nero → catodo_LED", "coccodrillo_rosso → anodo_LED"]
- pdf_variations: ["LED verde (Vf ~2V)", "altri colori (Vf diversi)", "errore puntali invertiti", "errore diodo rotto", "errore Vf troppo elevata multimetro non riesce"]
- code_id: "v2-cap6-esp4"
- code_components: ["battery9v(bat1)", "breadboard-half(bb1)", "resistor(r1, 330)", "led(led1, red)", "multimeter(mm1)"]
- code_title: "Cap. 6 Esp. 4 - Misurare Vf con multimetro"
- structural_diff:
  - title_match: true
  - components_in_book_missing_in_code: []
  - components_in_code_missing_in_book: ["battery9v + breadboard + resistor (PDF prova diodi non richiede batteria/breadboard/resistor — solo multimetro+LED+coccodrilli, e funzione modalita 'prova diodi')"]
  - order_match: true
  - variations_collapsed_to_separate_esp: false
- severity: high
- notes: "DIVERGENZA SOSTANZIALE METODOLOGICA: PDF esp4 usa SOLO funzione 'prova diodi e continuita' del multimetro (coccodrilli direttamente su LED senza alimentazione esterna) — il multimetro fornisce piccola tensione di test e legge Vf. Code costruisce circuito completo (batteria 9V + resistore 330 + LED su breadboard + multimetro in parallelo al LED) per misurare Vf in operazione normale. Stesso OBIETTIVO (misurare Vf) ma MEZZI diversi: PDF usa modalita prova diodi standalone, code usa modalita voltmetro DC con LED in funzione. Consequenze: code title nota 'NO breadboard, solo coccodrilli' nel desc, ma steps/components contraddicono (breadboard + 11 wires). Note campo 'Collegamento su breadboard. Multimetro in parallelo al LED' contraddice anche desc 'NO breadboard'. unlimPrompt cita modalita voltmetro che e divergenza vs PDF prova diodi. Severity high per metodologia fisica divergente nonostante concetto Vf match."

---

## Summary
- 13/13 esperimenti audited
- Severity counts: 8 minor, 2 medium, 3 high, 0 critical
- High severity (3): v2-cap5-esp1 (componenti 1.5V vs 9V), v2-cap5-esp2 (componenti 1.5V vs 9V), v2-cap6-esp4 (metodologia prova diodi vs voltmetro)
- Medium severity (2): v2-cap4-esp3 (punti misura J1/J5/J9 PDF non strutturati nel code), v2-cap6-esp2 (variazioni colori multiple collapsed in single config), v2-cap6-esp3 (LED colori diversi PDF vs 3 rossi code)
- Cross-cutting linguaggio violation: 13/13 esperimenti usano singolare imperativo "Posiziona/Collega/Prendi" — viola PRINCIPIO ZERO docente plurale "Ragazzi"
- Cross-cutting unlimPrompt: 13/13 menzionano "il docente sta mostrando alla classe" (OK PRINCIPIO ZERO framing) MA ZERO esperimenti citano Vol/pag verbatim ("Vol.2 pag.X") in unlimPrompt
- Cross-cutting variations_collapsed: 0/13 hanno variazioni multiple separate in esperimenti distinti (PDF cap3 esp1 ha 4 sub-casi/varianti accettati come 1 esp; cap5 esp1 ha 1/2/3/4 batterie collapsed accettato come 1 esp con narrativa progressiva). Concept-grouping refactor non emerge come critica per cap3-6 (a differenza forse di cap6 narrativo dove esp2/esp3 sono varianti di esp1).
