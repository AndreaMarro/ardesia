# ARDESIA — PRODUCT-CANON

## Addendum di convergenza — 24 ottobre 2026

### Identità

**Ardesia è l'ambiente di lavoro didattico nel quale una lezione conserva il proprio contesto e diventa materiale, pratica, feedback e preparazione della lezione successiva.** Il docente mantiene controllo su fonti, interpretazioni e pubblicazione. Lo studente può ritrovare il passaggio, capire l'errore osservato e affrontare una prova nuova. Questa è la direzione di prodotto: il ciclo completo non è ancora dimostrato nel candidato esaminato.

Ardesia è l'unico prodotto. LessonOS organizza contesto, memoria e proiezioni. Kirchhoff, simulazione, lettura documenti e input matematico sono capacità integrabili. Core/Plugin/Pack/Workflow rimane la classificazione: una specializzazione non porta con sé una seconda identità, autenticazione, memoria studente o contabilità.

### Utenti e prima offerta

Il primo utente è il docente fondatore: deve preparare, insegnare, ritrovare, correggere e seguire gli studenti nello stesso percorso. Il secondo è lo studente, che continua dopo la lezione. Il terzo è un tutor invitato, che deve ottenere valore da un'esperienza piccola prima di affrontare un catalogo o un marketplace.

Il primo prodotto commerciale è un percorso circoscritto di fisica, con obiettivo, incontri, supporto e limiti espliciti. Il catalogo non definisce l'identità del prodotto; la quantità di quesiti non certifica qualità scientifica, apprendimento o disponibilità alla pubblicazione.

### Unità didattica e differenziazione

L'unità editoriale proposta è una sequenza breve: situazione → previsione → manipolazione o esempio → spiegazione → prova autonoma → recupero → trasferimento. È una composizione dei CoursePack e dei riferimenti versionati già presenti, non un nuovo dominio di tentativi. Non tutti gli esercizi richiedono tutti i passaggi.

Il vantaggio da verificare è la continuità **fonte esatta della lezione → evidenza del tentativo → revisione docente → attività successiva**. Audio sincronizzato e una bella lavagna sono ingredienti; da soli non dimostrano unicità. La memoria conserva osservazioni verificabili e ipotesi correggibili, senza convertire pochi clic in diagnosi dello studente.

### Invarianti di esperienza

- Un comando dell'interfaccia e lo stesso comando via agente attraversano le medesime autorizzazioni del Core.
- Una proposta AI resta privata e separata dal feedback pubblicato; i risultati deterministici e le interpretazioni hanno provenienza distinguibile.
- La cattura richiede una scelta esplicita della sessione. Consenso storico, riapertura o semplice navigazione non avviano il microfono.
- Il replay ricostruisce la lezione selezionata. La mancanza di dati non autorizza il recupero silenzioso di un'altra lezione.
- Fonti, versioni, errori e limiti sono risolvibili; il pannello tecnico resta fuori dal percorso ordinario finché non serve a una decisione.
- Design, tastiera, touch, stato di caricamento e movimento ridotto fanno parte dell'accettazione della funzione.
- L'AI esterna può aiutare l'autore; il percorso deterministico deve rimanere utile senza un provider obbligatorio. L'introduzione di inferenza nel runtime richiede una decisione esplicita rispetto all'invariante ZERO-LLM vigente.

### Stato e prossimo incremento

La [consegna datata](deliveries/2026-10-24-convergence/README.md) contiene inventario, cinque journey, progetto visuale, fonti pedagogiche, economia e gate temporali. Il delta applicativo ripara affidabilità audio e isolamento del replay; non annuncia una funzione audio collegata alla Room. Il prossimo incremento è il ponte sessione/journal/media e il suo round-trip, seguito dalla singola esperienza di fluidi già calcolabile nel Core.

Marketplace aperto, app nativa nuova, copertura universale e correzione autonoma generalista restano fuori dalla beta proposta. Le capacità future non vanno rappresentate da pulsanti che suggeriscono una disponibilità inesistente.

## Verifica successiva — 24 ottobre 2026, AUDIO-V2 e Poiseuille

La [nuova consegna](deliveries/2026-10-24-audio-v2/README.md), successore isolato della head `ae25b93b` di #297, dimostra il ciclo circoscritto docente → fonte della lezione → previsione → recupero → problema diverso → ricevuta/revisione/diario docente. Le precedenti frasi «non ancora dimostrato» e «audio non collegato alla Room» descrivono il candidato della convergenza; questa verifica le supera soltanto nel perimetro locale sintetico dichiarato.

La Room possiede cattura esplicita e sessione CAS; journal v2, media verificati e bundle canonico conservano registrazioni distinte, pause, identità e riferimenti oggetto/versione. Replay e revoca sono raggiungibili dalla UI, anche dopo importazione in un nuovo store. I font sono serviti localmente e il contenuto è stato verificato a 390 px e desktop, con tastiera e movimento ridotto. Un'associazione temporale è un riferimento esplicito dell'autore, senza interpretazione semantica automatica.

L'episodio riusa CoursePack, PhysicsLab, consegne, revisioni e diario Core. Due varianti editoriali usano lo stesso contratto. L'assistenza osservata/dichiarata e i risultati precedenti rimangono nella ricevuta; «nessun aiuto richiesto» non prova assenza di aiuti esterni o apprendimento. Il riferimento Studio richiede lo stesso archivio locale oppure l'importazione del bundle: non costituisce distribuzione remota dei media o autorizzazione cloud. Prove native Chromium sintetiche e review separata non certificano efficacia didattica, microfono fisico, tutti i browser, beta commerciale o il lungo stack integrato. Vedere [validazione e limiti](deliveries/2026-10-24-audio-v2/validation.md).

Il prossimo confine di prodotto è la prima proposta privata MCP sui servizi Core esistenti della RFC #293, dopo controllo del candidato e dei gate. Il consumer Engine ingest legacy dei bundle richiede un incremento distinto; non è dichiarato compatibile con AUDIO-V2.

## Archivio: canone del 23 giugno 2026

Le sezioni seguenti conservano le decisioni e lo stato osservato allora. I percorsi sorgente, i conteggi e gli stati non sono il rilevamento corrente; per il routing attuale vedere [CANON-INDEX](CANON-INDEX.md).

> Cos'è il prodotto, cosa NON è, e la definizione-di-fatto (reality test) camminata sullo stato REALE. Verificato firsthand. Vedi [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md).

## 1. ARDESIA ≠ ELABTutor ≠ simulatore
- **ARDESIA** = lavagna didattica **plugin-native, local-first**, con memoria e marketplace, dove materiali letti, lezioni, errori e contenuti **sedimentano nel tempo**. È l'**ambiente unico di lavoro del tutor**.
- **Simulation Plugin** = strumento potentissimo, ma **plugin** (non Ardesia).
- **ELABTutor** = **primo Pack disciplinare** (circuiti/Arduino) sopra il Simulation Plugin. NON il centro.
- **Pericolo già reale:** `plugins/elab-tutor` oggi è **l'intera app ELAB standalone** (auth, dashboard, memoria, 13 fn AI Supabase, report, lavagna propri) → la "seconda app dentro Ardesia" che il vision teme **è già in-tree**. Il fix è il confine HOST (vedi ELAB-AS-PLUGIN-CANON).

## 2. REALITY TEST = definizione-di-fatto (camminata sullo stato reale)
Il test che conta (se funziona, Ardesia è vera; mille gate-verdi senza questo = ancora fabbrica/architettura):
| Step | Stato reale verificato |
|---|---|
| Apro Ardesia | studio EXISTS (lavagna Excalidraw + host) |
| Apro manuale ELAB | **solo PDF ELAB** (`VolumeViewer.jsx` hard-coded volumi 1/2/3); nessun Manual-object Core |
| Trascino citazione in lavagna | **greenfield** — `BoardCitation` non esiste (solo `VolumeCitation.jsx` render, non data-model né embed montabile) |
| Monto Simulation Plugin | host **costruito ma NON montato** (unico mount = demo srcDoc che bypassa firma) |
| Carico ELABTutor Pack | dati ELAB **fusi** nell'app, non impacchettati |
| Scelgo Passo Passo | `buildMode` esiste in ELAB (`NewElabSimulator buildMode:1055`, lesson-paths `modes_supported` 88/88) |
| Validator becca LED/resistenza sbagliata | **CircuitSolver validators ESISTONO** (series-resistor/polarity/short/overload) |
| UNLIM spiega citando il manuale | **fragile** (tag-regex `[azione:...]`) + nessun manuale-object da citare |
| Genero student pack | route engine `/v1/saved-lessons/{id}/study-pack` ESISTE; manca `/v1/export` + board/plugin-state nel pack |

**Lettura onesta:** ~metà degli step ha un primitivo reale (board, solver, validators, study-pack), ~metà è greenfield (manuale-object, citazione-in-board, mount, pack, UNLIM-tipato). Il prodotto è **vero a tratti, non end-to-end**.

## 3. Le 2 MODALITÀ elevate a livello Ardesia
Da stringhe `buildMode` di ELAB → **`LessonMode` enum di Core**:
```ts
type LessonMode = "passo-passo" | "gia-montato"
```
- **Passo Passo** = costruiamo insieme, un gesto alla volta: `manuale → step → plugin → verifica → hint UNLIM → prossimo step`. (grounding: lesson-paths `modes_supported`, `PassoPassoUnifiedPanel` ELAB = Manuale+Step unificato.)
- **Già Montato** = esempio pronto: `osserva → spiega → varia → trova-errore → quiz`.
Oggi sono stringhe ad-hoc (`complete/guided/sandbox`); il canon le promuove a enum tipato condiviso da TUTTI i plugin.

## 4. Funzioni Core cross-materia (tag stato)
| Funzione | Owner reale | Stato |
|---|---|---|
| Lavagna fluida | studio (Excalidraw) | EXISTS (board base) |
| Manuali/PDF vivi | studio `loadFile.ts` (pdf.js) + ELAB | **PARTIAL** (board-PDF sì, manual-data-model no) |
| Memoria per-lezione | engine (capsules/saved_lessons) | EXISTS |
| Memoria per-studente | engine (CRM) | **PARTIAL** (consenso/CRM sì; errori-ricorrenti/debt non persistiti) |
| Contenuti sedimentati | engine | **PARTIAL** (graph/recap sì; BoardSnapshot/PluginSnapshot aspirazionali) |
| Student pack | engine study-pack route | **PARTIAL** (no export-route, no board/plugin-state) |
| Recap | engine `recap_export.py` ZERO-LLM | EXISTS |
| Errori ricorrenti | engine `path_memory.py:805` | **PARTIAL** (ricalcolato, non persistito) |
| Marketplace/host/permessi/save-stato-plugin | studio toolhost | **host EXISTS-unmounted; marketplace MISSING** |
| Export / ricerca / collegamenti | engine | export CLI-only; links via graph |

## 5. Statement MOAT onesto (VIETATO il "+0.33")
- **Floor lessicale** `recall@10 ≈ 0.21` CI[0.118, 0.303] (misurato live `moat_gate.py --report` su `~/lessonos`). *(Il "recall@10=0.23" del vision è il numero che ricordi del floor live, NON una metrica di `packages/engine` — lì non esiste.)*
- Il grafo **alza la fetta-prerequisiti** da 0.0 → segnale; il "1.0 headline" è artefatto circolare su gold sintetico.
- **`graph_aware_retrieve`** è **wired sul package-path** (`app.py:2926` `_grounding_window` → `app.py:3048` route `/v1/packages`, fail-soft a `segments_for_lesson`). L'item aperto **WIRE-MOAT** riguarda il sotto-path di grounding dei **quiz/flashcard atom** dentro `assemble_lesson_package` (da riconciliare con l'audit-v11). 
- **VIETATO** "+0.33"/PPR/reasoning. Claim permesso: *"edge-set pedagogico dal corpus del docente"*. Lift onesto da ri-misurare gold-blind N≥50 sul served-path (può uscire ~0 = verità).

## 6. Responsive (formalizzazione UI)
Desktop `[Manuale][Lavagna][Plugin/UNLIM]` · Laptop `[Lavagna]+pannelli-collassabili` · iPad-landscape `[Lavagna]+drawer` · iPad-portrait focus-mono-vista · Mobile review/student-pack (NON authoring). **GoodNotes NON va copiato feature-by-feature**: Ardesia deve essere buona nella scrittura ma **superiore nella combinazione** manuali+memoria+plugin+student-pack+marketplace.

## 7. Tagli duri (NON fare ora)
app iPad nativa · marketplace pubblico completo · creator portal · pagamento plugin · collab real-time · port totale di `NewElabSimulator` · UNLIM chatbot estetico · 20 plugin · Vercel come cuore-del-prodotto (Vercel = serving/superfici, NON il prodotto) · storage cloud dei dati reali studente · refactor perfetto di tutto ELAB · riscrittura CircuitSolver.

## 8. Formula canonica
*Ardesia è una lavagna didattica local-first con memoria e marketplace plugin. Materiali, lezioni, errori e contenuti sedimentano nel tempo. I plugin aggiungono strumenti specializzati. Il Simulation Plugin è il primo grande plugin dimostrativo. ELABTutor è il primo Pack disciplinare sopra quel plugin.*
