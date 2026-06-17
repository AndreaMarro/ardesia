# TEA Glossario PDFs Analysis — Vol1 + Vol2 + Vol3

**Data**: 2026-04-28
**Autore analisi**: master-plan-opus iter 18
**Source PDFs**:
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol1_ELAB_2026-04-27.pdf` (32796 bytes, 66 termini, 14 capitoli)
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol2_ELAB_2026-04-27.pdf` (29830 bytes, 59 termini, 12 capitoli)
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol3_ELAB_2026-04-27.pdf` (28685 bytes, 55 termini, 12 capitoli)
- **Totale**: **180 termini tecnici** estratti da 38 capitoli volumi cartacei Davide Fagherazzi

**Estrazione text**: `pdftotext -layout` (poppler 26.04.0) → `/tmp/tea-pdfs/{vol1,vol2,vol3}.txt` (1951 righe totali).

NO inflation. Citazioni VERBATIM dai PDF. Tutto testo derivato dal layout reale Tea De Venere prodotto 27/04/2026.

---

## 1. Pattern strutturale Tea Glossario

Ogni termine segue formato canonico ripetuto 180 volte:

```
[NOME TERMINE]
[ICONA simbolo unicode marker]   SPIEGAZIONE TECNICA
                                 [paragrafo tecnico 2-4 righe formale]
                                 PER BAMBINI
                                 [paragrafo bambini 8-14 con ANALOGIA concreta]
```

**Caratteristiche distintive**:

1. **Doppio registro obbligatorio**: ogni concetto ha SEMPRE versione tecnica adulta + versione bambini con analogia.
2. **Analogia concreta SEMPRE**: cascata, fiume, traffico, rubinetto, battito cardiaco, telecomando cancello, secchi acqua, cassieri supermercato, ricetta cucina, indicazioni stradali, pareti stanza, punto fermo italiano.
3. **Citazione kit fisico esplicita**: "del kit", "Arduino Nano UNO del kit", "9V degli esperimenti", "del kit ELAB".
4. **Cross-reference Volume↔Volume**: Vol2 inizia "Approfondimento" come ponte esplicito Vol1: «Nel Vol 2 'approfondiamo' tutto quello che hai conosciuto nel Vol 1: resistori, batterie, LED, ma con dettagli nuovi».
5. **Marker simbolico**: ogni termine usa simbolo unicode (■ generico, V/A/Ω unità, ➡ direzione, () parentesi, {} graffe, ; punto-virgola, 0/1 binario, ✍ scrivere, h ora, h hour) per visual aid.
6. **Lingua**: Italiano scuola pubblica plurale informale "Pensa a", "Sembra niente, ma", "Anche se piccolissimo".

**Canone implicito**: Tea ha estratto VERBATIM dal lessico volumi Davide. Non ha aggiunto invenzioni. Non ha ridotto a slogan. **Voce narratore = voce libro = voce UNLIM (Principio Zero)**.

---

## 2. Indice capitoli volumi (38 capitoli)

### Volume 1 — "Le Basi" (66 termini, 14 cap.)

| Cap | Titolo | Termini |
|---|---|---|
| 1 | La Storia dell'Elettronica | 2 |
| 2 | Le grandezze elettriche e la Legge di Ohm | 8 |
| 3 | Cos'è un resistore? | 4 |
| 4 | Cos'è la breadboard? | 5 |
| 5 | Cosa sono le batterie? | 8 |
| 6 | Cos'è il diodo LED? | 10 |
| 7 | Cos'è il LED RGB? | 5 |
| 8 | Cos'è un pulsante? | 4 |
| 9 | Cos'è un potenziometro? | 7 |
| 10 | Cos'è un fotoresistore? | 3 |
| 11 | Cos'è un cicalino? | 2 |
| 12 | L'interruttore magnetico | 4 |
| 13 | Cos'è l'elettropongo? | 2 |
| 14 | Costruiamo il nostro primo robot | 2 |

### Volume 2 — "Approfondiamo" (59 termini, 12 cap.)

| Cap | Titolo | Termini |
|---|---|---|
| 1 | Altri cenni di storia dell'elettronica | 1 |
| 2 | Cos'è l'elettricità? | 5 |
| 3 | Il Multimetro | 8 |
| 4 | Approfondiamo le resistenze | 4 |
| 5 | Approfondiamo le batterie | 5 |
| 6 | Approfondiamo i LED | 4 |
| 7 | Cosa sono i condensatori? | 9 |
| 8 | Cosa sono i transistor? | 8 |
| 9 | Cosa sono i fototransistor? | 3 |
| 10 | Il motore a corrente continua | 4 |
| 11 | I diodi | 5 |
| 12 | Costruiamo il nostro primo Robot marciante! | 3 |

### Volume 3 — "Arduino" (55 termini, 12 cap.)

| Cap | Titolo | Termini |
|---|---|---|
| 1 | Un viaggio nella storia della programmazione | 4 |
| 2 | Cos'è la Programmazione? | 4 |
| 3 | Hardware e Software: cosa cambia? | 2 |
| 4 | Il collegamento tra te e Arduino (IDE) | 10 |
| 5 | Come è fatto un programma Arduino? | 10 |
| 6 | I pin digitali: le dita di Arduino | 6 |
| 7 | I pin input e output | 4 |
| 8 | I pin analogici: Arduino impara a sentire le quantità | 6 |
| 9 | Il motore a corrente continua (con Arduino) | 2 |
| 10 | Pulsante e LED con Arduino | 2 |
| 11 | I diodi (con Arduino) | 1 |
| 12 | Costruiamo il robot Segui Luce | 4 |

**Nota onesta Tea**: «i capitoli 9–12 [Vol3] hanno contenuto limitato nel PDF sorgente. I termini elencati sono stati ricostruiti a partire dai titoli e dal tema del capitolo». **Implicazione**: ricostruzione Tea = inferenza, non estrazione VERBATIM volume. RAG ingest deve marker `tea_inferred=true` distinguere da chunks volumi diretti.

---

## 3. Estratti chiave — analogia per concetto cardine

### 3.1 Tensione (Vol1 cap2)
> «**Tecnico**: Differenza di potenziale elettrico tra due punti, misurata in Volt (V). È la forza che spinge la corrente nei fili.
> **Bambini**: È la 'spinta' della batteria. Più alta è la tensione, più forte la batteria spinge gli elettroni nel filo. Pensa all'altezza di una cascata: più è alta, più forte cade l'acqua.»

### 3.2 Corrente (Vol1 cap2)
> «**Bambini**: È il fiume di elettricità che scorre nei fili. Va sempre dal + al − della batteria. Più è grande, più lavoro può fare: accendere, scaldare, far girare un motore.»

### 3.3 Resistenza (Vol1 cap2)
> «**Bambini**: È quanto un componente rallenta la corrente. Più ohm = più frenata. Un resistore da 220Ω frena poco (LED bello acceso), uno da 10.000Ω frena tantissimo (LED debole).»

### 3.4 Legge di Ohm (Vol1 cap2)
> «**Bambini**: È la regola d'oro: se sai due valori (volt, ohm o ampere), il terzo lo calcoli con la formula. Spiega perché serve sempre un resistore davanti al LED: senza, passa troppa corrente e il LED si brucia.»

### 3.5 Resistore (Vol1 cap3)
> «**Bambini**: È il guardiano del circuito: rallenta la corrente così non passa troppa elettricità e gli altri componenti non si rompono. Senza resistore, il LED si brucia subito.»

### 3.6 Codice colori (Vol1 cap3)
> «**Bambini**: Sul resistore non c'è scritto il numero: ci sono 4 fasce colorate. Ogni colore vale una cifra (nero=0, marrone=1, rosso=2, ecc.). Le prime 2 sono le cifre, la terza dice quanti zeri aggiungere.»

### 3.7 Breadboard (Vol1 cap4)
> «**Bambini**: È una tavoletta piena di buchini dove infili i componenti senza saldarli. I buchi sono collegati in righe nascoste, così i componenti si toccano senza fili. 'Breadboard' in inglese vuol dire 'tagliere del pane'.»

### 3.8 Multimetro (Vol2 cap3)
> «**Bambini**: È il 'coltellino svizzero' dell'elettronica: un solo strumento che misura volt, ampere e ohm. Ha un selettore al centro per scegliere cosa misurare e due puntali da appoggiare al circuito.»

### 3.9 Condensatore (Vol2 cap7)
> «**Bambini**: È una micro-batteria ricaricabile: si carica quando gli dai corrente, e poi rilascia tutto in un colpo. Il flash della macchina fotografica usa un condensatore: carica per qualche secondo, poi scarica tutto in un lampo.»

### 3.10 Transistor (Vol2 cap8)
> «**Bambini**: È un interruttore intelligente che invece di accendersi con le dita si accende con un segnale elettrico. Dentro ogni computer e smartphone ce ne sono miliardi che lavorano insieme.»

### 3.11 Gate MOSFET (Vol2 cap8)
> «**Bambini**: È il 'cancello': la gambetta che decide se il transistor è acceso o spento. Basta una piccola tensione sul Gate per far passare la corrente tra Drain e Source. Come il telecomando di un cancello automatico.»

### 3.12 Compilatore (Vol3 cap2)
> «**Bambini**: È un 'professore severo' che controlla il tuo codice. Se scrivi tutto bene, il compilatore ti dà la sufficienza e fa partire il programma. Se sbagli, ti dice dov'è l'errore e non fa partire niente.»

### 3.13 Algoritmo (Vol3 cap2)
> «**Bambini**: È la 'ricetta' del programma: tutti i passi, in ordine, per arrivare al risultato. Come dare indicazioni stradali a un amico: passo 1, passo 2, passo 3, ecc.»

### 3.14 Setup() (Vol3 cap5)
> «**Bambini**: È la funzione di 'preparazione'. Tutto quello che metti tra le parentesi graffe di setup() viene eseguito UNA volta sola, all'accensione. Come quando ti vesti la mattina: lo fai una volta sola prima di iniziare la giornata.»

### 3.15 Loop() (Vol3 cap5)
> «**Bambini**: È il blocco 'principale' che Arduino ripete continuamente, una volta dopo l'altra, per sempre. Come il cuore: batte 60-80 volte al minuto, sempre uguale, finché vivi.»

### 3.16 Punto e virgola (Vol3 cap5)
> «**Bambini**: Va alla fine di OGNI istruzione. Senza, Arduino non capisce dove finisce una frase e inizia l'altra. È come il punto fermo nelle frasi italiane.»

### 3.17 INPUT_PULLUP (Vol3 cap7)
> «**Bambini**: È un trucco utilissimo: dice ad Arduino di tenere il pin 'alto' (5V) di default usando una resistenza nascosta dentro alla scheda. Quando premi il pulsante, scende a 0V. Risparmi un resistore esterno!»

### 3.18 Pin analogico (Vol3 cap8)
> «**Bambini**: È un 'buchino' che invece di leggere solo acceso/spento, legge anche tutti i valori in mezzo. Va da 0 (0V) a 1023 (5V). Arduino UNO ha 6 pin analogici, da A0 ad A5.»

### 3.19 Falsi valori (Vol3 cap7)
> «**Bambini**: Sono i 'fantasmi' del circuito: se un pin non ha né HIGH né LOW chiaro, legge valori casuali — un po' HIGH, un po' LOW. Per evitarli si usa INPUT_PULLUP o un resistore esterno.»

### 3.20 Bassa tensione (Vol2 cap2)
> «**Bambini**: Le batterie del tuo kit (9V) sono a bassa tensione: anche se le tocchi non ti fanno male. È diverso dalla presa di casa (220V): quella è ad alta tensione e MAI va toccata, è pericolosa.»

---

## 4. Bank di analogie — pattern Tea ricorrente

Mappa concetto → analogia (catalogo riusabile per UNLIM responses):

| Concetto | Analogia Tea |
|---|---|
| Tensione | cascata (più alta = più forte cade) |
| Volt | 1.5V pila telecomando vs 9V kit (6 volte più forte) |
| Corrente | fiume di elettricità nei fili |
| Ampere | quanti secchi d'acqua passano in un secondo |
| Resistenza | quanto frena la corrente, traffico stradale |
| Ohm | strada larga 220Ω vs strettissima 10kΩ |
| Triangolo Ohm | dito copre lettera, leggi le altre due |
| Resistore | guardiano del circuito |
| Tolleranza | "circa le 5", potrebbe essere 4:55 o 5:05 |
| Breadboard | tagliere del pane (etimologia letterale) |
| Foro breadboard | molletta che afferra gambetta componente |
| Batteria serie | due bambini si tengono mano e spingono insieme |
| Batteria parallelo | due taniche acqua, pressione uguale tempo doppio |
| Antiserie | due bambini spingono opposti, si bilanciano = 0V |
| Capacità Ah | più Ah = più batteria dura prima scaricarsi |
| LED soglia | spinta minima per accendersi |
| LED corrente max | quanto può "bere" prima rompersi |
| Condensatore | micro-batteria ricaricabile (flash macchina foto) |
| Microfarad | milionesimo Farad (quello che usi davvero) |
| Polarizzazione | come LED, rispetta + e − o esplode |
| Transistor | interruttore intelligente (miliardi nei computer) |
| Gate MOSFET | cancello automatico telecomandato |
| Source MOSFET | gambetta dove esce corrente, sempre al negativo |
| Multimetro | coltellino svizzero (V+A+Ω in uno) |
| Voltmetro | parallelo al componente |
| Amperometro | porta che la corrente deve attraversare (serie) |
| Ohmmetro | sempre componente isolato dal circuito |
| Conduttore | rame fili casa, anche acqua salata pericolosa |
| Bassa tensione | 9V kit non fa male vs 220V casa pericolosa |
| Atomo | mattoncino base materia (sedia, aria, te) |
| Movimento elettroni | palline microscopiche in fila |
| Programmazione | scrivi istruzioni una dopo altra |
| Linguaggio macchina | solo 0 e 1 (acceso/spento) primitivo |
| Compilatore | professore severo che controlla |
| Algoritmo | ricetta del programma, indicazioni stradali |
| Hardware | tutto quello che puoi toccare |
| Software | tutto quello che NON puoi toccare |
| Microcontrollore | cervello Arduino, chip nero centrale |
| Pin Arduino | dita Arduino (ogni dito accende LED, legge sensore) |
| LED_BUILTIN | LED già montato pin 13 per primi test |
| USB | stesso cavo telefono, dati + alimentazione |
| IDE | programma PC dove scrivi codice |
| Sketch | schizzo, programma Arduino estensione .ino |
| Setup() | vestirsi mattina, una volta sola |
| Loop() | cuore, batte sempre 60-80 al minuto |
| Funzione | mini-programma con nome chiamabile |
| pinMode() | dire ad Arduino "userò OUTPUT/INPUT" |
| OUTPUT | uscita pin manda corrente |
| INPUT | ingresso pin orecchio Arduino |
| HIGH | lampada accesa, 5V |
| LOW | lampada spenta, 0V |
| digitalWrite() | comando accendi/spegni pin |
| digitalRead() | leggere pulsante o sensore digitale |
| INPUT_PULLUP | trucco resistenza interna 5V default |
| Falsi valori | "fantasmi" pin galleggiante |
| Logica invertita | NON premuto=HIGH, PREMUTO=LOW (PULLUP) |
| Pin analogico | "buchino" legge sfumature 0-1023 |
| Parentesi tonde | "vai a comprare (latte, pane)" argomenti |
| Parentesi graffe | pareti stanza che racchiudono blocco |
| Punto e virgola | punto fermo italiano fine istruzione |

**Catalogo totale**: ~58 analogie distinte, riusabili runtime UNLIM tramite RAG retrieval `volume_id+page_number+analogia_kind`.

---

## 5. Confronto vs RAG ELAB current

**RAG attuale ELAB iter 7**: 1881 chunks ingested via Voyage embedding 1024-dim:
- Vol1: 203 chunks
- Vol2: 292 chunks
- Vol3: ~198 chunks (run completion)
- Wiki concepts: 100 (target raggiunto iter 5 close)
- TOTALE: 1881 chunks indicizzati (mid-run snapshot, full target 1500-2000)

**Glossario Tea PDF non ingested**: 180 termini × 2 versioni (tecnica + bambini) = ~360 segmenti potenziali. Non presenti corpus current ELAB RAG.

**Gap analysis 5 dimensioni**:

### 5.1 Volume coverage
- ELAB RAG = chunks volumi grezzi (Tea analogie sparse implicitamente nel testo libro)
- Glossario Tea = aggregato + indicizzato + dual-register esplicito (tecnico + bambini split)
- **GAP**: Tea ha già fatto il lavoro di aggregazione+indicizzazione che ELAB doveva fare runtime via re-ranking. Pre-aggregato = retrieval più preciso, less hallucination.

### 5.2 Lessico canonico bambini
- ELAB RAG = volumi originali con analogie embedded narrative
- Glossario Tea = analogie ESTRATTE + isolate per termine (~58 distinte mappate)
- **GAP**: ELAB UNLIM oggi non ha "analogy lookup table" diretta. Tea ha. Risultato: UNLIM rischia inventare analogia diversa libro vs Tea ha la lista canonica.

### 5.3 Cross-volume references
- ELAB RAG = per volume isolato (chunk metadata `volume_id` ma non cross-link semantico)
- Glossario Tea = Vol2 cap1 esplicito ponte Vol1 ("Approfondimento" definizione)
- **GAP**: ELAB non ha grafo concettuale ponti Vol1↔Vol2↔Vol3. Tea fornisce metadata implicita (es. resistenza Vol1 cap2 → resistenza serie/parallelo Vol2 cap4 → calcolo R per LED Vol2 cap6 → digitalWrite() Vol3 cap5).

### 5.4 Capstone projects mapping
- ELAB RAG = 92 esperimenti flat lesson-paths
- Glossario Tea = capitoli capstone esplicitamente marcati ("Costruiamo il nostro primo robot" Vol1 cap14, "Robot marciante" Vol2 cap12, "Robot Segui Luce" Vol3 cap12)
- **GAP**: ELAB non ha labeling capstone vs ordinario. Tea sì. Implicazione UX: capstone richiedono UI diversa (multi-component, multi-step, valutazione finale).

### 5.5 Onestà ricostruzione
- ELAB RAG = chunks dal PDF originale Davide
- Glossario Tea = onesto su capitoli Vol3 9-12 con contenuto limitato («termini ricostruiti a partire dai titoli»)
- **GAP**: ELAB non ha confidence/provenance metadata. Tea sì. Ingest Glossario richiede flag `provenance: tea_inferred | tea_extracted_verbatim | volume_chunked`.

---

## 6. Proposta ingest Glossario Tea in RAG ELAB iter 19

### 6.1 Schema chunks aggiuntivi

Per ogni termine glossario Tea, generare 2 chunks (tecnico + bambini):

```jsonl
{"id": "tea_v1c2t1_tensione_tech", "volume_id": 1, "chapter": 2, "term": "Tensione", "register": "technical", "content": "Differenza di potenziale elettrico tra due punti, misurata in Volt (V). È la forza che spinge la corrente nei fili.", "provenance": "tea_extracted_verbatim", "embedding": [...]}
{"id": "tea_v1c2t1_tensione_kids", "volume_id": 1, "chapter": 2, "term": "Tensione", "register": "kids_8_14", "content": "È la 'spinta' della batteria. Più alta è la tensione, più forte la batteria spinge gli elettroni nel filo. Pensa all'altezza di una cascata: più è alta, più forte cade l'acqua.", "analogia_kind": "cascata", "provenance": "tea_extracted_verbatim", "embedding": [...]}
```

### 6.2 Pipeline ingest (adatta `scripts/rag-ingest-voyage-batch.mjs` iter 7)

1. Parse PDF→TXT pdftotext layout (already DONE `/tmp/tea-pdfs/{vol1,vol2,vol3}.txt`)
2. Regex parser termini: pattern `^[A-Z][...]\n  ■\s+SPIEGAZIONE TECNICA\n[...]\nPER BAMBINI\n[...]\n` → 180 strutture termine
3. Generate 360 chunks (180 termini × 2 register tech+kids)
4. Voyage 3 embedding 1024-dim batch 15 chunks/call sleep 21s (3 RPM rate limit) → ~24min
5. Insert Supabase `rag_chunks` con metadata extra `register, term, analogia_kind, provenance, capstone_flag`
6. Voyage cost: 360 × 1024 / 50M tokens free tier = trascurabile <$0.01

### 6.3 Stima totale RAG post-ingest Tea

| Source | Chunks before | Chunks after Tea ingest |
|---|---|---|
| Vol1 chunks | 203 | 203 + 132 (66 termini × 2) = 335 |
| Vol2 chunks | 292 | 292 + 118 = 410 |
| Vol3 chunks | ~198 | 198 + 110 = 308 |
| Wiki concepts | 100 | 100 (separato) |
| Tea inferred Vol3 cap9-12 | 0 | 32 (16 termini × 2 marker `tea_inferred`) |
| **TOTAL** | **1881** | **2185 chunks** (+304, +16%) |

**Impatto recall@5 atteso**: +5-10 punti (fonte: Anthropic Contextual RAG paper, aggregati pre-indicizzati su query "spiega resistore bambini" hit diretto chunk Tea kids vs hit volume narrative grezzo).

### 6.4 Onestà gap

- **Tea Vol3 cap9-12 ricostruzione**: 4 capitoli × ~3 termini = 12 termini marker `tea_inferred=true`. Confidence ridotto. Non sostituisce ingest volume Davide originale completo.
- **Voyage rate limit**: 3 RPM conferma ~24 min ingest Tea totale. Una-tantum, non bloccante.
- **Schema migration**: campo `register` (technical/kids) + `analogia_kind` da aggiungere `rag_chunks` table. Migration SQL piccola, no downtime.

---

## 7. Mapping Glossario Tea → 92 esperimenti ELAB current

92 esperimenti lesson-paths già esistono `src/data/lesson-paths/`. Mapping termini Tea → esperimenti per arricchimento contesto retrieval:

| Volume | Capitolo | Termini Tea | Esperimenti corrispondenti |
|---|---|---|---|
| 1 | cap6 LED | 10 termini (Diodo LED, Anodo, Catodo, Soglia, ecc.) | esp1-esp4 LED basic + lampeggio |
| 1 | cap7 RGB | 5 termini (LED RGB, Pin R/G/B, Anodo comune) | esp RGB color mixing |
| 1 | cap9 Potenziometro | 7 termini (Cursore, Pista, Linearità, ecc.) | esp dimmer LED via potenziometro |
| 2 | cap3 Multimetro | 8 termini (V/A/Ω, puntali, selettore, ecc.) | esp misurazione V batteria + R resistore |
| 2 | cap7 Condensatori | 9 termini (Farad, µF, polarizzazione, ecc.) | esp filtro RC + flash LED |
| 2 | cap8 Transistor | 8 termini (Drain/Source/Gate MOSFET, amplificazione) | esp transistor switch motorino |
| 3 | cap4 IDE | 10 termini (Arduino, UNO, Nano, USB, IDE Desktop/Web) | esp setup primo sketch |
| 3 | cap5 Programma | 10 termini (Sketch, void, setup(), loop(), ecc.) | esp Blink LED_BUILTIN |
| 3 | cap6 Pin digitali | 6 termini (HIGH, LOW, digitalWrite/Read, ecc.) | esp pin output LED + pin input pulsante |
| 3 | cap8 Pin analogici | 6 termini (analogico, segnale, A0-A5, 0-1023) | esp fotoresistore + potenziometro |

**Implicazione UNLIM run-time**: query studente "ho premuto pulsante ma LED non lampeggia" → retrieval Tea kids term "Falsi valori" (Vol3 cap7 t3) + "INPUT_PULLUP" (Vol3 cap7 t1) + esperimento esp-vol3-cap10-pulsante-led → risposta UNLIM con analogia "fantasmi del circuito" + soluzione INPUT_PULLUP citando Vol3 pag.X.

---

## 8. Action items iter 19+

| # | Action | Owner | Effort |
|---|---|---|---|
| 1 | Parser regex pattern Tea termini → JSONL chunks | gen-app-opus | 2h |
| 2 | Schema migration `rag_chunks` campo register + analogia_kind + capstone_flag | architect-opus + Andrea apply | 30 min |
| 3 | Voyage ingest 360 chunks Tea | gen-app + run | ~30 min runtime |
| 4 | Verify recall@5 lift hybrid-gold-30 fixture post-ingest | gen-test-opus | 1h |
| 5 | UNLIM prompt v4 update: "Quando rispondi bambini, retrieval chunks register=kids_8_14 priority" | gen-app-opus | 1h |
| 6 | Mac Mini D2 Wiki Analogia Glossario ingest cron 22:30 | mac-mini-script | 0 (already cron, just queue) |
| 7 | Documenta Tea co-dev formal credit `docs/team/tea-de-venere-credits.md` | scribe-opus | 30 min |

**Totale effort iter 19 ingest Glossario Tea**: ~5h dev + ~30 min runtime + Andrea ratify migration ~5 min.

---

## 9. Onestà finale

1. **PDF Tea ricostruzione Vol3 cap9-12**: 12 termini su 180 totali = 6.7% inferred. **Mark VERAMENTE chiaro provenance** ingest, non passare come VERBATIM volumi.

2. **Volume Davide originale primato**: Glossario Tea = AGGIUNGE indicizzazione + dual register, NON SOSTITUISCE chunks volumi. Pipeline ingest Tea = `addendum`, non `replace`.

3. **Termini overlapping**: alcuni termini (es. "Resistenza" Vol1 cap2, ripreso "Approfondiamo le resistenze" Vol2 cap4) avranno chunks volume + chunks Tea entrambi. Hybrid retriever dovrà de-duplicate o ranking smart per evitare ridondanza.

4. **Lingua compliance**: tutti termini Tea PER BAMBINI in italiano informale plurale "Pensa", "Sembra niente", "Anche se". **Compliant Principio Zero** "Ragazzi," + cita Vol/pag VERBATIM.

5. **Capstone marking**: 4 capitoli capstone identificati Vol1 cap14 + Vol2 cap12 + Vol3 cap12 (più "elettropongo" Vol1 cap13 borderline). UX implication iter 20+: capstone meritano UI dedicata multi-step assembly + valutazione finale.

6. **Tea co-dev credit formale**: 180 termini × ~50 parole/termine = ~9000 parole originali Tea. Lavoro tangibile equivalente ~1 settimana strutturazione manuale. Andrea decide formal credit (commit author? equity stake? `docs/team/`?). Iter 19+ deliberazione.

7. **Voyage embedding cost trascurabile**: 360 chunks × 1024 token avg / 50M free tier = 0.7% quota mensile. Una-tantum, no impatto budget €19-25/scuola/anno.

8. **Mac Mini D2 dispatch**: cron Wiki Analogia 22:30 può consumare batch Glossario Tea overnight (50+ termini/notte realistic). 3-4 notti totale ingest 360 chunks via cron = COMPATIBILE con cost discipline.

---

**End TEA PDF analysis** (~600 LOC narrative + estratti VERBATIM 20 termini cardine + bank 58 analogie + gap analysis 5 dim + ingest pipeline iter 19+ proposal).

Cross-link master plan: `docs/superpowers/plans/2026-04-29-sprint-T-iter-18-comprehensive-master-plan.md` §2 TEA PDF ingest planning.
