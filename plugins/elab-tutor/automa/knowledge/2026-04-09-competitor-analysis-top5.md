# ELAB vs Competitor Analysis — Top 5 EdTech per Elettronica K-14

> Research Report — ELAB Researcher Agent — 09/04/2026 16:25
> Topic: Analisi comparativa ELAB vs competitor principali

---

## 1. Panoramica Mercato

Il mercato dei simulatori di elettronica educativi e' dominato da 5 player:

| Competitor | Target | Prezzo | AI Tutor | Kit Fisico | Volumi |
|-----------|--------|--------|----------|------------|--------|
| **TinkerCAD** | K-12+ | GRATIS | No | No | No |
| **Arduino Cloud** | K-12+ | ~€3-5/studente/anno | No | Separato | No |
| **Wokwi** | Intermediate+ | ~$67/anno o custom | No | No | No |
| **micro:bit** | K-8 | GRATIS (sw) + £15 hardware | No | Si (micro:bit) | No |
| **PhET** | K-12+ | GRATIS | No | No | No |
| **ELAB Tutor** | **8-14** | **€200/classe/anno** | **SI (Galileo)** | **SI (3 kit)** | **SI (3 volumi)** |

---

## 2. Analisi per Competitor

### TinkerCAD (Autodesk)
- **Prezzo**: Completamente GRATIS. Nessun tier, nessuna limitazione.
- **Punti di forza**: Drag-and-drop intuitivo, 3D modeling + circuiti, ISTE/NGSS aligned, Google Classroom integration, nessuna installazione
- **Punti deboli**: No AI tutor, no kit fisico, no contenuti didattici strutturati, no tracciamento progressi avanzato, interfaccia in inglese (no italiano), no simulazione AVR reale (solo DC base)
- **Per ELAB**: TinkerCAD e' il competitor GRATIS piu' forte. ELAB si differenzia con: AI tutor, kit fisico, contenuti in italiano, emulazione AVR completa.

Fonte: [TinkerCAD Classrooms](https://www.tinkercad.com/help/classrooms/official-guide-to-tinkercad-classrooms), [TinkerCAD Pricing](https://www.getapp.com/construction-software/a/tinkercad/), [TinkerCAD Review](https://www.commonsense.org/education/reviews/tinkercad)

### Arduino Cloud for Education
- **Prezzo**: Pay-per-member, billing annuale. Stima ~€3-5/studente/anno (non pubblicato chiaramente). School Plan richiede minimo membri.
- **Punti di forza**: IDE cloud, dashboard IoT, Google Classroom integration, step-by-step lesson plans, monitoraggio progressi studente, ufficiale Arduino
- **Punti deboli**: No AI tutor, richiede hardware reale (no simulatore integrato), pricing confuso, no contenuti in italiano strutturati, focus IoT (non base elettronica)
- **Per ELAB**: Arduino Cloud e' il brand piu' forte ma NON ha simulatore integrato ne' AI. ELAB colma entrambi i gap. Il pricing ELAB (€200/classe) e' competitivo vs Arduino (€3-5 x 25 studenti = €75-125/classe ma senza simulatore).

Fonte: [Arduino School Plan](https://www.arduino.cc/education/arduino-school-cloud-plan), [Arduino Cloud Plans](https://cloud.arduino.cc/plans), [Arduino Cloud Schools](https://cloud.arduino.cc/schools)

### Wokwi
- **Prezzo**: Free tier limitato. Club individuale: $7/mese o $67/anno. Classroom: custom quote (minimo 5 studenti), risparmio ~$1050/anno scegliendo annuale.
- **Punti di forza**: WiFi/BT simulation, VS Code integration, debugger, component library vastissima (NeoPixel, OLED, stepper, etc.), ESP32/ESP8266 support
- **Punti deboli**: No AI tutor, no kit fisico, target intermediate/advanced (non K-8), no contenuti didattici, interfaccia solo inglese, no tracciamento classe
- **Per ELAB**: Wokwi e' tecnicamente superiore come simulatore ma targettizza maker/developer, non scuole primarie. ELAB non compete direttamente — target diverso (8-14 vs 14+).

Fonte: [Wokwi Pricing](https://wokwi.com/pricing), [Wokwi Classroom](https://wokwi.com/classroom), [TinkerCAD vs Wokwi](https://zbotic.in/best-arduino-simulator-tools-tinkercad-vs-wokwi-vs-proteus/)

### micro:bit (BBC)
- **Prezzo**: Software GRATIS. Hardware: ~£15-20 per scheda, classroom pack (10 pezzi) ~£150-200.
- **Punti di forza**: Foundation no-profit (fiducia scuole), MakeCode editor (block + Python), classroom tool per sessioni live, professional development gratuito, lesson resources
- **Punti deboli**: No Arduino (ecosistema diverso), no simulatore circuiti, no AI tutor, no volumi didattici, focus UK/Commonwealth (meno presente in Italia)
- **Per ELAB**: micro:bit e' il competitor piu' simile nel target (K-8) ma usa un ecosistema diverso (micro:bit vs Arduino). In Italia Arduino e' molto piu' diffuso di micro:bit. ELAB vince su: simulatore circuiti + AI + volumi.

Fonte: [micro:bit Classroom](https://classroom.microbit.org/), [micro:bit 2026 Guide](https://microbit.org/news/2026-01-01/2026-new-year-top-tips/), [micro:bit Buy](https://microbit.org/buy/bbc-microbit-the-next-gen-classroom-pack/)

### PhET (University of Colorado)
- **Prezzo**: Completamente GRATIS. Open source. Fondi universitari.
- **Punti di forza**: Basato su ricerca (Nobel laureate fondatore), accessibilita' AI (A11y 2026), circuit construction kit DC/AC, tradotto in 100+ lingue (incluso italiano), nessuna registrazione
- **Punti deboli**: No Arduino, no programmazione, no kit fisico, no AI tutor interattivo, no tracciamento studenti, no classroom management, simulazione generica (non specifica per Arduino)
- **Per ELAB**: PhET e' il competitor gratis piu' rispettato accademicamente. ELAB si differenzia con: Arduino specifico, programmazione (Scratch + C++), AI tutor, kit fisico. PhET copre "capire i circuiti", ELAB copre "costruire con Arduino".

Fonte: [PhET Circuit Kit DC](https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc), [PhET Home](https://phet.colorado.edu/), [PhET A11y 2026](https://tools-competition.org/26-accelerating-learning-finalists/)

---

## 3. Matrice Competitiva Dettagliata

| Feature | TinkerCAD | Arduino Cloud | Wokwi | micro:bit | PhET | **ELAB** |
|---------|-----------|--------------|-------|-----------|------|----------|
| Prezzo scuola | Gratis | ~€100/classe | Custom | Gratis (sw) | Gratis | **€200/classe** |
| Simulatore circuiti | Si (base) | No | Si (avanzato) | No | Si (DC/AC) | **Si (MNA/KCL)** |
| Emulazione AVR | No | No | Si (ESP32) | No | No | **Si (ATmega328)** |
| Compilatore Arduino | No | Si (cloud) | Si | No | No | **Si (C++ → HEX)** |
| Scratch/Blockly | No | No | No | Si (MakeCode) | No | **Si** |
| AI Tutor | No | No | No | No | No | **SI (Galileo)** |
| Kit fisico incluso | No | Separato | No | Si (scheda) | No | **SI (3 kit)** |
| Volumi didattici | No | Lesson plans | No | Resources | No | **SI (3 volumi)** |
| Italiano nativo | No | Parziale | No | No | Si | **SI** |
| Dashboard docente | Basica | Si | No | Basica | No | **In sviluppo** |
| GDPR/AI compliance | N/A | Parziale | N/A | N/A | N/A | **In sviluppo** |
| Offline/PWA | No | No | No | No | No (Java) | **SI** |
| Voice commands | No | No | No | No | No | **SI (24 cmd)** |
| Gamification | No | No | No | No | No | **SI (4 giochi)** |

---

## 4. ELAB Unique Value Proposition

**ELAB e' l'UNICO prodotto che combina tutti e 5:**
1. Simulatore circuiti Arduino con emulazione AVR reale
2. AI Tutor (Galileo) con guida contestuale
3. Kit fisico (3 volumi + componenti)
4. Contenuti didattici in italiano
5. Programmazione visuale (Scratch) + C++

**Nessun competitor offre questa combinazione.** Ogni competitor copre al massimo 2-3 di questi 5 pilastri.

### Differenziatori chiave per pitch
- **vs TinkerCAD**: "TinkerCAD e' gratuito ma non ha AI, non ha kit, non insegna a programmare Arduino. ELAB e' il pacchetto completo."
- **vs Arduino Cloud**: "Arduino Cloud richiede hardware reale. ELAB include simulatore + kit + AI tutor. E' tutto incluso."
- **vs Wokwi**: "Wokwi e' per maker esperti. ELAB e' per bambini 8-14 che non hanno mai toccato un circuito."
- **vs micro:bit**: "micro:bit usa la sua scheda. ELAB insegna Arduino — lo standard industriale."
- **vs PhET**: "PhET spiega la teoria. ELAB fa costruire circuiti veri con Arduino."

---

## 5. Debolezze ELAB vs Competitor

| Debolezza | Competitor migliore | Gravita' | Fix |
|-----------|-------------------|----------|-----|
| Prezzo (€200 vs gratis) | TinkerCAD, PhET | ALTA | Trial 30gg + PNRR |
| Dashboard docente incompleta | Arduino Cloud | ALTA | P0 — in roadmap |
| No 3D modeling | TinkerCAD | BASSA | Fuori scope |
| No ESP32/WiFi | Wokwi | MEDIA | Futuro |
| No Google Classroom integration | TinkerCAD, Arduino | MEDIA | Implementabile |
| GDPR docs non pronti | Tutti | ALTA | P0 — in corso |
| Brand recognition | Arduino, micro:bit | ALTA | Vendite dirette |

---

## 6. Action Items per Andrea

### Per il Pitch Commerciale
1. Usare la matrice competitiva (sezione 3) nelle presentazioni
2. Enfatizzare: "UNICO con AI + Kit + Volumi + Simulatore + Italiano"
3. Contro obiezione "TinkerCAD e' gratis": "Gratis ma senza AI, senza kit, senza italiano, senza percorso strutturato"

### Per il Prodotto
4. Dashboard docente MVP — senza questa, Arduino Cloud vince su management
5. Google Classroom integration — tutti i competitor ce l'hanno o la stanno aggiungendo
6. Trial gratuito 30gg — obbligatorio per competere con i 3 prodotti gratis

### Per il Posizionamento
7. ELAB non compete con TinkerCAD/PhET (gratis, generici) — compete con Arduino Cloud (a pagamento, specifico)
8. Target: scuole primarie/medie italiane che vogliono insegnare Arduino con AI — nicchia dove NESSUN competitor opera
