# Brief per Tea — Da incollare su Claude (sessione di Tea)

> **Istruzioni Tea**: copia tutto questo messaggio (dal "Ciao Claude" fino alla fine) e incollalo su Claude. Claude ti spiegherà cosa stiamo facendo e cosa potresti fare tu, con la profondità che preferisci.

---

Ciao Claude,

sono Tea, la collaboratrice creativa del progetto **ELAB Tutor**. Il dev solo (Andrea Marro) mi ha mandato questo brief. Ti chiedo di:

1. Leggerlo tutto.
2. Spiegarmi in modo SEMPLICE cosa è ELAB Tutor e cosa sta facendo Andrea.
3. Aiutarmi a capire cosa potrei fare io (8 possibili lavori sotto).
4. Aspettare che io scelga e poi guidarmi nell'esecuzione.

Quando posso fare domande dovunque, fai domande tu a me se serve.

---

## 1. Cosa è ELAB Tutor (in 30 secondi)

ELAB Tutor è una piattaforma educativa digitale per insegnare elettronica e Arduino a ragazzi 8-14 anni, integrata con un kit fisico (3 volumi cartacei + componenti elettronici reali).

Il prodotto vero è un PACCHETTO COMPLETO:

- **3 Volumi cartacei** (Vol.1 Le Basi, Vol.2 Approfondiamo, Vol.3 Arduino) — io ho già lavorato su questi
- **Kit fisici** (breadboard, componenti) prodotti da Omaric Elettronica a Strambino
- **Software web ELAB Tutor** (https://www.elabtutor.school) — un simulatore di circuiti + tutor AI chiamato "UNLIM" + Scratch/Blockly + giochi didattici
- Vendita target: scuole italiane primaria/secondaria, deadline PNRR 30/06/2026 gestita da Davide Fagherazzi

## 2. Squadra umana

- **Andrea Marro**: solo-dev, fa tutto il software da solo
- **Giovanni Fagherazzi**: ex Arduino sales, vendite export
- **Omaric Elettronica**: hardware Strambino (filiera Arduino italiana)
- **Davide Fagherazzi**: vendite PNRR / MePA scuole
- **Tea (io)**: docs creativi, contenuto didattico, audit pedagogico, consulenza UX

## 3. PRINCIPIO ZERO (la regola sacra del prodotto)

Il docente è il TRAMITE. UNLIM (l'AI) prepara il contenuto. Gli studenti vedono tutto sulla LIM (Lavagna Interattiva Multimediale) proiettata dal docente e lavorano sui kit fisici.

Implicazioni pratiche per la lingua dei contenuti:

- **Plurale inclusivo SEMPRE**: "Ragazzi, vediamo insieme...", "Provate voi", "Guardate qui"
- **Mai imperativo al docente**: NO "Distribuisci i kit", SI "Distribuzione kit" (forma nominale)
- **Citazioni ai volumi cartacei** quando si introduce un concetto: «Come dice il nostro libro a pagina 27...»
- **Massimo 60 parole** per ogni risposta + 1 analogia concreta del mondo dei ragazzi (porte, tubi, strade, squadra)
- **Linguaggio bambino 10-14 anni**: niente termini universitari

## 4. Concetto chiave: i volumi NON sono card flat

I volumi presentano ogni capitolo come **narrativa continua** con esperimenti che sono **variazioni progressive sullo stesso tema**.

Esempio Cap 6 LED del Volume 1:

1. Apertura narrativa: "I LED sono come piccole lampadine"
2. Esperimento 1: accendi 1 LED + resistore 220Ω
3. "Ora proviamo con due LED"
4. Esperimento 2: 2 LED in serie (parte dal circuito di prima, aggiunge un LED)
5. "E se li mettessimo in parallelo?"
6. Esperimento 3: 2 LED in parallelo (modifica topologia)
7. "Vogliamo regolare la luminosità?"
8. Esperimento 4: aggiunge potenziometro

ELAB Tutor finora trattava questi 4 esperimenti come 4 card indipendenti. Andrea ha appena fatto un grande lavoro (Sprint Q) per riorganizzare il software in 37 Capitoli che mantengono la narrativa continua del libro fisico. Ogni Capitolo ha:

- `capitolo_intro` (narrativa apertura)
- `experiments[]` (con `mode: 'incremental_from_prev'` quando si parte dall'esp precedente)
- `narrative_flow.transitions[]` (frasi di passaggio tipo "Ora proviamo")
- `citazioni_volume[]` (frasi esatte da citare con pagina + figura)
- `docente_sidebar` (per il docente, in forma nominalizzata "colpo d'occhio")

Lo schema pedagogico è già stato fatto da Andrea. Quello che manca = espansione contenuto + audit pedagogico + correzioni editoriali.

## 5. UNLIM (l'AI tutor di ELAB)

UNLIM è il "fratello maggiore appassionato di tecnologia" che parla ai ragazzi. Caratteristiche:

- Voce calda, entusiasta ma mai esagerata
- Analogie del mondo reale (strade, tubi, porte, squadra)
- Mai condiscendente, mai troppo tecnico
- Vede il circuito che i ragazzi costruiscono nel simulatore
- Sa cosa hanno fatto le sessioni precedenti (memoria classe)
- Cita i volumi quando serve

Andrea vuole che UNLIM **sintetizzi** (non copi verbatim) le risposte dai 4 fonti:

1. **Wiki LLM** (un glossario di concetti scritti in linguaggio bambino)
2. **RAG volumi** (chunk dei 3 volumi cartacei)
3. **Memoria classe/docente** (cosa hanno fatto, errori frequenti)
4. **Stato live** (circuito attuale, codice attuale, esperimento attivo)

## 6. Cosa potresti fare TU (8 lavori possibili)

Andrea mi ha chiesto di proporti 8 lavori creativi. Tu scegli quelli che ti motivano. Sono tutti async (nessuna scadenza ferrea, lavora con calma) e creativi (non amministrativi, non vendite).

### T1 — Wiki LLM concept drafting (alto creativo + pedagogico)

**Cosa**: scrivere 30-60 nuovi concept di elettronica nel linguaggio dei ragazzi. Andrea ha già 30 concept generati, vuole arrivare a 100+.

Per ogni concept (file markdown da ~150-200 parole):
- **Definizione precisa per età 10-14**: "Ragazzi, il LED è..."
- **Analogia plurale**: "è come una piccola lampadina che..."
- **Parametri tipici** (tensione, corrente, valori comuni)
- **Citazione volume**: «testo esatto» Vol.X pag.Y
- **Errori comuni** (3-5: problema + soluzione neutra)
- **Domande tipiche** che gli studenti possono fare ("perché si brucia?")
- **Sezione PRINCIPIO ZERO** esplicita
- **Esperimenti correlati** (linkati per Cap)

**Esempi di concept da fare**:
- Cortocircuito, tensione, corrente, resistenza
- Polarità (anodo/catodo)
- Ponte di Wheatstone, divisore di tensione
- Modulazione PWM, timing, debounce
- Comunicazione seriale UART
- Loop, condizionali, variabili (per Arduino)

**Tempo**: ~30 min per concept × 30 = 15h spread su 2-3 settimane

**Output**: file `.md` consegnati ad Andrea

---

### T2 — Volumi: 4 bug editoriali da fixare (basso effort, alto valore)

Andrea ha trovato questi bug nei volumi durante Sprint Q0:

- **Vol3 PDF V0.8.1**: phantom Cap 10-12 nel TOC (non esistono nel ODT canonical) → da rimuovere dal PDF
- **Vol3 ESERCIZIO 6.4 duplicato**: linea 2113 e 2176 hanno entrambi numerazione 6.4 ma contenuto diverso ("Due LED" vs "Semaforo") → rinumerare
- **Vol3 ESERCIZIO 7.8**: marker mancante (Sketch_Capitolo_7.8 referenziato senza marker)
- **Vol2 PDF Cap 8 ESPERIMENTO 2** duplicato (linee 2242 e 2252)

**Tempo**: 1-2h totali

**Output**: ODT e PDF corretti + change log

---

### T3 — Audit narrativo dei volumi (creativo + pedagogico)

**Cosa**: review se TUTTI i 22 capitoli sperimentali mantengono narrative continuity. Per ogni Cap analizzato:

- Le transizioni sono naturali? ("Ora proviamo", "E se", "Ricordate")
- L'incremental build è logico? (ogni esperimento aggiunge UN concetto nuovo)
- La conclusione narrativa è chiusa?

**Tempo**: 4-6h

**Output**: report markdown con flag su capitoli problematici + suggerimenti di miglioramento per la prossima versione dei volumi

---

### T4 — Brand + iconografia + assets TRES JOLIE (creativo, NON marketing)

**NON è marketing**. È coerenza visiva interna.

- Audit dell'iconografia attuale di ELAB Tutor (file `ElabIcons.jsx` in repo) confrontata con i volumi cartacei
- Proposta di estensione icon set per il nuovo CapitoloPicker (griglia auto-fill)
- Curare la cartella TRES JOLIE 1.5GB (assets immagini volumi):
  - Categorizzare per Cap
  - Selezionare top 5-10 immagini per Cap da importare nell'app
  - Suggerire formato WebP ottimizzato

**Tempo**: 4-6h

**Output**: documento `docs/design/tea-iconografia-audit-2026-04.md` + lista selezione asset

---

### T5 — Onboarding docs scuole (USO INTERNO, NON vendita)

**NON marketing/vendita**. Doc per scuole che GIÀ usano ELAB.

Esempi:
- "Come gestire 5 gruppi in classe con UNLIM"
- "Cosa fare quando un kit ha pezzo rotto"
- "Tips primo giorno classe nuova"
- "FAQ docenti — perché UNLIM dice così"
- "Differenza tra Modalità Percorso, Passo Passo, Libero"

**Tempo**: 4-6h

**Output**: 3-5 brief markdown in `docs/scuole-onboarding/`

---

### T6 — Fumetto report di lezione (creativo + pedagogico)

ELAB Tutor ha una funzione "Report Fumetto" che genera un riepilogo della lezione in stile fumetto stampabile in PDF. Esempio:

- Pagina 1: "Cosa abbiamo fatto oggi" (titolo + obiettivo Cap)
- Pagina 2-3: griglia 4 vignette con foto del circuito + cosa è successo
- Pagina 4: "Cosa abbiamo imparato" (3-4 punti chiave)
- Pagina 5: "Per la prossima volta" (suggerimento esp successivo)

Andrea ha già implementato il sistema base. Vuole:

- **T6a** — Layout templates fumetto (10 template variant per stile/argomento)
- **T6b** — Frasi balloon stock pre-scritte (ai ragazzi piace vedere balloon UNLIM dire frasi accese — serve banca di frasi tipo "Wow, avete capito tutto!", "Provate a casa!", "Domanda a sorpresa per la prossima!")
- **T6c** — Storyboard 5-7 fumetti completi per top esperimenti (esempi/showcase)

**Tempo**: 6-10h totali (può essere fatto a pezzi)

**Output**: file template HTML/SVG + stock fraseology + storyboard examples

---

### T7 — Arduino curriculum review/expand

I capitoli Arduino del Vol. 3 sono:
- Cap 1-4 teoria (struttura sketch, pinMode, digitalWrite, delay, Serial)
- Cap 5 esercizi LED blink
- Cap 6 esercizi pulsanti + condizioni
- Cap 7 esercizi PWM + analogRead
- Cap 8 esercizi Servo + LCD
- Cap 9 capstone Simon Says

Inoltre 2 progetti bonus:
- LCD Hello World
- Servo Sweep

**Cosa potresti fare**:

- **T7a** — Audit pedagogico Cap 1-9: il salto difficoltà è equilibrato? Concetti coperti senza buchi?
- **T7b** — Proposta concetti aggiuntivi (Sprint successivo): comunicazione seriale UART, interrupt, EEPROM, sensori (DHT, ultrasuoni)
- **T7c** — Esercizi extra "casa-laboratorio" per studenti curiosi (ogni cap 1-2 esercizi extra opzionali)

**Tempo**: 4-8h

**Output**: report `docs/curriculum/tea-arduino-audit-2026-04.md` + proposte espansione

---

### T8 — Scratch curriculum review/expand

ELAB Tutor ha **Scratch/Blockly** per programmare Arduino visualmente (versione drag-and-drop, prima di passare al codice testuale).

Currentemente Scratch supporta gli stessi esperimenti Arduino del Vol. 3 ma con i blocchi visuali.

**Cosa potresti fare**:

- **T8a** — Audit Scratch curriculum: gli stessi concetti del codice testuale sono ben rappresentati come blocchi?
- **T8b** — Proposta di percorso Scratch dedicato per età 8-10 (più semplice del Vol. 3 testuale)
- **T8c** — 5-10 progetti Scratch creativi (esempi: "Termometro luminoso", "Allarme antifurto", "Macchinina che evita ostacoli")

**Tempo**: 4-8h

**Output**: report `docs/curriculum/tea-scratch-audit-2026-04.md` + lista progetti

---

### T9 — "Tutto bene ordinato" general product audit (creativo + UX consulenza)

Andrea ha detto: "SERVE RENDERE TUTTO BENE ORDINATO". È un'esigenza generale di pulizia del prodotto. Tu hai già fatto schema UX semplificato (3 zone, Guida Docente, toolbar 4 comandi) — questo task estende quella linea.

**Cosa potresti fare**:

Audit ELAB Tutor end-to-end con occhio "ordine generale":

- **T9a** — Naming consistency: nomi schermate, etichette bottoni, terminologia ("Lezione" vs "Esperimento" vs "Esercizio") sono coerenti? Lista incongruenze.
- **T9b** — Component organization: la lavagna ha tab/zone organizzate logicamente? La transizione tra Modalità Percorso/Passo Passo/Libero è chiara per docente?
- **T9c** — Documentation coverage: per ogni feature visibile a docente, esiste un breve "cosa fa" in tooltip o sezione aiuto?
- **T9d** — Dead code/feature removal: ci sono pulsanti, schermate o feature non più usate che andrebbero tolte? (Andrea può fornire screenshots)
- **T9e** — Onboarding first-time docente: cosa vede un docente che apre ELAB la prima volta? L'esperienza è guidata o disorientante?

**Tempo**: 4-6h

**Output**: report `docs/audits/tea-product-ordering-audit-2026-04.md` con sezioni per ogni axis (T9a-T9e), 3-5 incongruenze/problemi per axis con proposte concrete (no code, solo description + screenshot reference se utile).

**Why creative**: questo è il tipo di feedback che salva mesi di refactor. Tu vedi cose che Andrea non vede più (cecità da prossimità). È il SUO mestiere consulenziale.

---

## 7. File del progetto da consultare (se vuoi approfondire)

Tutti i file vivono nella cartella di Andrea: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/` e sono nel repo GitHub privato `AndreaMarro/elab-tutor`.

Se non hai accesso ai file, chiedi ad Andrea di mandarteli o aprire una sessione in cui Claude può leggerli direttamente.

**File CORE che Claude di Tea dovrebbe leggere per capire il progetto a fondo:**

1. **CLAUDE.md** — il "manuale" del progetto. Contiene tutte le regole immutabili, infrastruttura, principio zero, design rules. ESSENZIALE.
2. **README.md** — overview prodotto, stack tecnico, struttura.
3. **CONTRIBUTING.md** — regole di collaborazione (per dev, ma utile capire workflow).

**File STRATEGIA (da leggere PRIMA di iniziare un task):**

4. **docs/strategy/2026-04-26-master-plan-v2-comprehensive.md** — il piano strategico completo da cui sono usciti i tuoi task. Lì c'è tutto il contesto.

**File SPRINT Q (per capire il refactoring volumi → 37 capitoli):**

5. **docs/sprint-q/SPRINT-Q-HISTORY-COMPREHENSIVE.md** — racconto completo del refactoring volumi.
6. **docs/audits/2026-04-24-tresjolie-vs-tutor-mapping.md** — mapping tra volumi cartacei e tutor digitale.
7. **docs/audits/2026-04-24-narrative-progression-analysis.md** — analisi narrative continuity dei volumi.

**File SCHEMA dati (per capire come è strutturato un Capitolo):**

8. **src/data/schemas/Capitolo.js** — schema Zod del Capitolo con tutti i campi (citazioni, narrative_flow, docente_sidebar, etc.). Tecnico ma utile.
9. **docs/data/volume-structure.json** — mappa di TUTTI i 35 capitoli reali dei 3 volumi.

**File WIKI (per capire i concept esistenti, da espandere in T1):**

10. **docs/unlim-wiki/SCHEMA.md** — schema dei concept md.
11. **docs/unlim-wiki/concepts/** — i 30 concept esistenti (esempi da imitare).

**File VOLUMI sorgente (i contenuti pedagogici originali):**

12. **/VOLUME 3/CONTENUTI/volumi-pdf/** — PDF dei 3 volumi (già letti da te in passato).
13. **/VOLUME 3/CONTENUTI/volumi-odt/** — ODT canonical (per fix editoriali T2).

**File TUE LAVORI PRECEDENTI (per riferimento):**

14. **/VOLUME 3/TEA/** — la cartella con i 4 documenti che ho già consegnato (analisi complessità, riepilogo correzioni, schema UX, 10 idee miglioramento).

## 8. Come consegnare il lavoro

Per ogni task scelto:

1. **Crea una cartella dedicata**: `/VOLUME 3/TEA/2026-04-{task-id}-{brief-name}/`
2. **Mantieni file separati**: 1 concept = 1 file md per T1, etc.
3. **Naming convention**: `YYYY-MM-DD-{tipo}-{argomento}.md`
4. **Quando finisci**: invia ad Andrea via Slack/email/Telegram con titolo "Tea [T-id]: nome task"
5. **Andrea farà code review** e ti darà feedback. Si itera.

Per task tecnici (T1 in particolare):
- Andrea creerà un branch GitHub `tea/wiki-concepts-batch-N-2026-04-XX`
- Ti farà accesso o committerà i tuoi file lui
- I file devono passare validation Q4 schema (Andrea ti dice se non passano)

## 9. Rispetto del tuo tempo

- Nessuna scadenza ferrea (solo PNRR 30/06/2026 ma quello lo gestisce Davide vendite, non Tea)
- Lavora con calma, qualità > quantità
- Spread su 2-3 settimane è normale
- Puoi fare 1 task per volta o saltare tra task

## 10. Domande per me (Tea)

Se Claude vuole farmi domande prima di iniziare, va bene. Esempi tipici:

- "Quale dei 8 task ti motiva di più oggi?"
- "Hai accesso ai file repository di Andrea o lavori solo da PDF/ODT che hai?"
- "Quanto tempo vuoi dedicare questa settimana?"
- "Vuoi iniziare con un task piccolo (T2 bug fix, 1-2h) per testare il flusso, poi passare a uno grosso?"
- "Per i concept Wiki (T1), preferisci scrivere da zero o partire da esempi esistenti?"

---

## 11. Comportamento di Claude

Claude, ti chiedo:

- **Linguaggio chiaro, non tecnico** quando spieghi a me. Io non sono dev.
- **Approfondisci quanto vuoi** se penso che mi serve dettaglio. Ma parti semplice.
- **Fai domande** se hai bisogno di chiarimenti, non assumere.
- **Procediamo per piccoli passi** (1 task per volta).
- **Non sostituirmi**: io devo essere autorialmente coinvolta. Tu mi guidi, io scrivo.
- **Onestà**: se qualcosa è poco chiaro, dimmelo. Non inventare.

Ora dimmi: per cominciare, mi spieghi in 5-10 righe semplici cosa è ELAB Tutor e cosa sta facendo Andrea? Poi io ti dico quale task mi attira di più e partiamo.

Grazie!

— Tea
