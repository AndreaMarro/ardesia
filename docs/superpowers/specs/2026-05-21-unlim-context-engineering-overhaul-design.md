# UNLIM — Overhaul completo: Percezione · Cognizione · Azione

- **Data**: 2026-05-21
- **Stato**: Design (in revisione — Andrea)
- **Revisione**: 2026-05-21 — risolto conflitto con i vincoli GDPR/memoria esistenti (Codex stop-time review). Vedi §8.2 e §12.
- **Autore**: Andrea Marro + Claude
- **Topic**: Ricostruzione completa del cervello di UNLIM — come percepisce, ragiona e agisce.
- **Origine**: Andrea, sessione 2026-05-20/21 — 5 screenshot di fallimenti reali + mandato "L'onnipotenza fa schifo" → poi "raggiungi *anche* onnipotenza" (fatta bene) + vista + udito.

---

## 1. Problema — la diagnosi

**Root cause: UNLIM è stato ottimizzato per un benchmark sintetico, non per lezioni vere.**

Da iter 41 a iter 82, tutto il lavoro su UNLIM ha avuto un solo obiettivo: alzare il punteggio della matrice 1000-query (`scripts/bench/run-1000-matrix.py`). Quella matrice premia meccanicamente: aprire ogni risposta con `"Ragazzi,"`, citare `"Vol.X pag.Y"` verbatim, nominare il kit, detector regex pre-LLM che emettono risposte pre-confezionate. Il numero è salito a 99.6%. Il prodotto reale è peggiorato — legge di Goodhart.

### Sintomi osservati (screenshot Andrea 2026-05-20)

| Sintomo | Causa nel codice |
|---|---|
| "chi ha scoperto il led blu?" → risposta generica sull'RGB + `intent:mountExperiment` | detector regex pre-LLM (`operational-response.ts`) emette risposta pre-confezionata + spara intent su verbo |
| "dove lavorava?" → perde il filo, torna sull'RGB | `chat_history` = ultimi 4 turni × 80 caratteri; `userIntentSeed` àncora ogni risposta all'esperimento iniziale (`VIETATO derivare`) |
| "qual è il meccanismo fisico?" → ignora, fa un'azione | detector pre-LLM intercetta prima che l'LLM legga la domanda |
| "sai rispondere alla domanda scritta?" ("QUANTO VALE i?" disegnata sulla lavagna) → cieco | `state-snapshot-aggregator.ts` passa il disegno come `disegni docente: N tracci` — conta i tratti, non legge |
| discorsi robotici, citazione su ogni risposta | `REGOLA VERBATIM OBBLIGATORIA` nel prompt + `enforceItalianK12Opener` post-LLM che incolla `"Ragazzi,"` |

### Insight architetturale

Un agente fa tre cose: **percepisce → ragiona → agisce**. UNLIM oggi è rotto su tutti e tre. Il "ragiona" (l'LLM) è scavalcato da regex su *entrambi* i lati: i detector pre-LLM pre-confezionano le risposte (percezione corrotta), il validator post-LLM riscrive l'output e altri detector sparano intent su parola chiave (azione corrotta). **"Onnipotenza fa schifo" e "non è consapevole" sono lo stesso bug visto da due lati.** Questo overhaul ricostruisce i tre lati e rimette l'LLM al centro.

---

## 2. Visione d'insieme

```
        PERCEZIONE                COGNIZIONE                  AZIONE
   stato circuito (JSON)   →                          →   intent strutturati
   flag di consapevolezza  →     system prompt nuovo        (pin, pulsanti,
   vista (vision a flag)   →   + memoria (3 strati)    →     componenti,
   udito (voce → testo)    →   + contesto pieno              navigazione,
                                       ↓                     puntatore LIM)
                                   LLM decide
```

---

## 3. Obiettivi

1. **PERCEZIONE** — UNLIM consapevole: stato strutturato della lavagna a ogni turno; sottosistema di **flag** che lo spinge a guardare ciò che è cambiato/rotto; **vista** (vision a flag) sulla scrittura a mano libera; **udito** (input vocale).
2. **COGNIZIONE** — risponde **alla** domanda; regge il filo multi-turno; **memoria persistente reale** (3 strati, conforme GDPR); linguaggio naturale; citazione dei volumi **opzionale**.
3. **AZIONE — onnipotenza fatta bene** — superficie d'azione **completa** (ogni pin, pulsante, componente, navigazione + puntatore LIM); le azioni nascono da output strutturato dell'LLM, non da regex.
4. La qualità è misurata da un **eval di conversazione e azione vera**.

## 4. Non-obiettivi (YAGNI)

- **Niente controllo del mouse a pixel / computer-use.** La piattaforma è nostra: le azioni sono API semantiche, non click su coordinate.
- Fuori scope: simulatore engine, contenuto volumi, lesson-paths, audit 92 esperimenti, cross-compile Nano R4, nuovi provider o infrastruttura.
- Nessun nuovo trattamento di dati personali oltre quello esistente; nessuna nuova dipendenza npm senza OK Andrea.

## 5. Decisioni ratificate (Andrea)

| # | Decisione | Scelta | Data |
|---|---|---|---|
| 1 | Benchmark | Riscrivere la matrice come eval di conversazione vera; vecchia matrice → regressione tecnica | 2026-05-21 |
| 2 | Architettura | Fast-path solo comandi UI puri; tutto il contenuto all'LLM; solo check sicurezza post-LLM | 2026-05-21 |
| 3 | Vista lavagna | Flag automatici | 2026-05-21 |
| 4 | Memoria | Conversazione intera (transiente) + via `userIntentSeed`-anchor + sessioni passate come sfondo | 2026-05-21 |
| 5 | Principio Zero v3 | Cuore pedagogico intatto, linguaggio liberato | 2026-05-21 |
| 6 | Scope | Overhaul completo: percezione (vista + udito) + cognizione + azione (onnipotenza completa) | 2026-05-21 |
| 7 | GDPR | I vincoli GDPR per minori esistenti (no raw, retention, consenso, EU-only) restano legge — il design vi si conforma, non li tocca | 2026-05-21 |
| + | Priorità Andrea | Flag, persistenza memoria, onnipotenza = sottosistemi di primo livello | 2026-05-21 |

---

## 6. Architettura — il flusso `unlim-chat`

Il messaggio utente arriva da **testo** OPPURE da **voce** (wake word "Ehi UNLIM" → STT → testo). Da lì in poi il flusso è identico.

```
richiesta (testo o voce trascritta) →
 A. COSTRUISCI CONTESTO (sempre):
      - stato circuito (componenti, fili, connessioni, LED, esperimento, step, modalità) — JSON
      - conversazione intera della sessione corrente (transiente, dal client — vedi §8.2)
      - memoria classe (sfondo leggero: livello, errori ricorrenti, posizione nei volumi)
      - RAG: chunk volumi/wiki rilevanti — DISPONIBILI, non imposti
      - computeAwarenessFlags(snapshot_corrente, snapshot_precedente, messaggio) → flag
 B. FAST-PATH COMANDO: comando UI puro e deterministico? (play|pause|reset|highlight <id>|undo|redo)
      → SÌ: emetti l'intent + ack breve. NIENTE LLM. Fine.
      → NO: continua.
 C. VISTA (condizionale): flag `vision_needed` su?
      → captureScreenshot → unlim-vision → descrizione testuale → aggiungi al contesto
 D. CHIAMATA LLM: system prompt nuovo + contesto pieno + blocco flag
      → testo naturale + intent strutturati opzionali (function calling sul tool registry completo)
 E. CHECK SICUREZZA POST-LLM (SOLO sicurezza): 220V, JSON leak, experiment-id falso, off-topic grave.
      NIENTE rewriting cosmetico.
 F. RISPOSTA: { text, intents[] } → il browser esegue gli intent.
      Se la sessione è in modalità voce: text → TTS (voce).
```

---

# PERCEZIONE

## 7.1 Stato strutturato (ogni turno)

Componenti, fili, connessioni, stato LED, esperimento attivo, step passo-passo, modalità → JSON reale, in contesto a **ogni turno**. È economico (pochi token) — non è mai stato un problema di costo, era solo *non passato*.

## 7.2 Flag di consapevolezza  *(priorità Andrea)*

**Scopo**: il meccanismo che rende UNLIM consapevole. Ogni turno, prima della chiamata LLM, `computeAwarenessFlags(current, previous, userMessage)` calcola segnali strutturati. I flag (1) instradano la pipeline e (2) vengono iniettati nel contesto come segnali di attenzione espliciti.

### Catalogo flag v1

| Flag | Quando si alza | Effetto |
|---|---|---|
| `circuit_changed` | componenti/fili differiscono dal turno precedente | contesto: "il circuito è cambiato: [diff]" |
| `drawing_changed` | il disegno a mano libera è cambiato (hash/pathCount) | contribuisce a `vision_needed` |
| `vision_needed` | `drawing_changed` OPPURE utente nomina lavagna/disegno/"domanda scritta" OPPURE diagnosi con stato insufficiente | instrada il giro di vista |
| `circuit_error` | la simulazione segnala un'incongruenza (LED spento atteso acceso, corto, GND mancante) | contesto: "problema rilevato: [errore]" → diagnosi proattiva |
| `experiment_changed` | `experimentId` attivo differisce | contesto LLM |
| `step_changed` | step passo-passo differisce | contesto LLM |
| `compile_status` | ultimo esito compilazione Arduino | contesto LLM |
| `returning_class` | la classe ha sessioni precedenti vs prima volta | contesto: adatta il tono |

Funzione pura `computeAwarenessFlags` in nuovo file `_shared/awareness-flags.ts` — difensiva, non lancia mai. Lo `snapshot_precedente` si legge dalla memoria di sessione persistita (§8.2): flag e memoria sono collegati. I flag attivi si rendono in un blocco compatto leggibile (es. *"Segnali: il circuito è cambiato (aggiunto r1); problema: led1 spento ma il codice lo accende; passo-passo step 3"*). Catalogo estendibile.

## 7.3 Vista — vision a flag

Quando `vision_needed` è su: `captureScreenshot` → `unlim-vision` (Pixtral 12B / Gemini Vision) → descrizione testuale (legge la scrittura a mano "QUANTO VALE i?", descrive circuiti disegnati) → iniettata nel contesto. **Cache** della descrizione (chiave = hash disegno), riusata finché il disegno non cambia. Turni con vista = due hop (vista poi LLM principale) — accettabile perché non è ogni turno.

**GDPR**: lo screenshot e l'immagine **non vengono persistiti**; la cache della descrizione vive in memoria di sessione (transiente), non su DB; l'endpoint vision deve essere EU-resident (Pixtral = Mistral FR; Gemini Vision = Frankfurt). Vedi §12.

## 7.4 Udito e Voce

- **Udito (input)**: l'utente può parlare invece di scrivere. Wake word "Ehi UNLIM" + STT (`unlim-stt`, CF Whisper). La voce → trascritta in testo → entra nella pipeline come messaggio utente normale. Niente di speciale a valle: stesso cervello.
- **Voce (output)**: UNLIM risponde a voce (`unlim-tts`, Voxtral, voce clonata Andrea — già esistente). Il prompt nuovo aiuta: risposte naturali si leggono bene ad alta voce; i template robotici suonavano malissimo in TTS.
- **GDPR**: l'audio **non viene persistito** — solo la trascrizione entra nella pipeline (e, se persistita, segue il cap preview come ogni messaggio, §8.2). La voce è il canale del *docente* (Principio Zero: è il docente che interagisce) — non introduce trattamento di dati biometrici dei minori. STT EU (CF Whisper edge EU). Vedi §12.
- **Nota onesta**: questo è soprattutto **wiring pulito** di capacità che già esistono (STT, TTS, wake word) dentro il nuovo pipeline — non costruzione da zero. Più test che codice nuovo.

---

# COGNIZIONE

## 8.1 System prompt

Sostituisce `BASE_PROMPT`. Snello. Stabilisce: identità (tutor che prepara contenuto per il docente che proietta sulla LIM) · registro (parla alla classe al plurale — `"Ragazzi,"` *fluisce* naturale, non è regola meccanica) · comportamento (rispondi **alla** domanda, segui il filo, usa stato + flag + memoria, cita un volume **solo quando aiuta davvero**) · azioni (intent strutturati dal tool registry) · onestà (se non sai/non vedi, dillo) · sicurezza (kit 9V) · Principio Zero v3 (§14). Si eliminano le ~200 righe di `REGOLA VERBATIM OBBLIGATORIA` + 8 few-shot di citazione.

Skill applicate qui: `prompt-engineering-patterns`, `llm-application-dev:prompt-optimize`, `karpathy-guidelines`.

## 8.2 Memoria — 3 strati  *(priorità Andrea — conforme GDPR §12)*

**Distinzione chiave**: la memoria *dentro* la sessione è piena ed è ciò che fa "reggere il filo"; la memoria *tra* sessioni è una **sintesi derivata** — mai trascritto grezzo. Vincolo non negoziabile (`memory.ts`: *"GDPR-compliant: no PII, no raw messages"*).

- **Strato 1 — Memoria di lavoro (dentro la sessione)**: la conversazione **intera** della sessione corrente vive nel browser (client) e viene passata all'LLM a ogni turno. È **transiente — non persistita su DB**. È questo che fa "reggere il filo" (fix del bug "dove lavorava? → perde il filo"). Cap generoso per budget token. Nessun problema GDPR: elaborazione transiente, niente storage.
- **Strato 2 — Memoria di sessione (persistita, derivata)**: a fine sessione e a checkpoint incrementali si persiste una **sintesi derivata** — esperimenti svolti, step raggiunto, categorie di errore ricorrenti, completamento. **NON il trascritto grezzo.** Per-turno si possono persistere solo *preview troncate* (250 utente / 100 risposta — cap GDPR già esistente, tabella `unlim_message_history`). Il checkpoint incrementale risolve il bug "contenuti spariti su Esci" (`feedback_lavagna_ux_bugs_19apr`) — si checkpointa la *sintesi*, non la conversazione grezza.
- **Strato 3 — Memoria di classe (persistita, derivata, rolling)**: sintesi per-classe (livello, categorie di errore ricorrenti, esperimenti completati, posizione nei volumi). Derivata, niente PII, niente trascritti.

**"Riprendiamo" funziona dalla sintesi**, non da un replay verbatim: *"la settimana scorsa eravate al LED RGB, passo 3, errore ricorrente polarità"* basta per riprendere la lezione. UNLIM non deve rileggere le parole esatte di tre settimane fa.

**Persistenza affidabile**: checkpoint incrementale; sopravvive a reload/crash/uscita; chiave pseudonima (`session_id` hash / `class_key`). Ogni tabella nuova della memoria DEVE avere `expires_at` (retention Art. 5), entrare in `purge_expired_data()`, in `delete_student_data()` (Art. 17 oblio) e nell'export di `unlim-gdpr` (Art. 20). Vedi §12.

**Regola anti-gabbia**: la memoria è *contesto* che l'LLM intreccia con naturalezza. NIENTE divieti rigidi tipo `userIntentSeed` (`VIETATO derivare`). Se la classe fa un follow-up che porta altrove, UNLIM segue.

**Persistenza memoria ≠ trascritti grezzi.** La priorità di Andrea ("persistenza memoria, massima importanza") è pienamente soddisfatta: UNLIM ricorda la classe a settimane di distanza tramite sintesi derivate, persistite, checkpointate. È memoria reale e affidabile — ed è anche memoria *migliore*: una sintesi è il contesto giusto da caricare, non 500 turni grezzi.

---

# AZIONE — Onnipotenza

## 9.1 Superficie d'azione completa

**Obiettivo**: UNLIM può fare tutto ciò che il docente farebbe col mouse sulla piattaforma. "Onnipotenza" = il set di azioni è **completo** e l'LLM lo usa correttamente.

Audit ed espansione di `INTENT_TOOLS_SCHEMA` / `__ELAB_API` per coprire l'intera superficie interattiva:

- **Componenti & pin**: evidenzia componente, evidenzia **pin specifico** (`nano:D13`), aggiungi/rimuovi componente, collega/scollega filo, imposta valore (resistenza, colore LED…), interagisci (ruota potenziometro, premi pulsante del circuito).
- **Pulsanti & controlli UI**: Play/Pause/Reset, Compila, Undo/Redo, cambio modalità (Percorso/Passo-Passo/Già-Montato), apri/chiudi pannelli, switch editor Scratch/Arduino.
- **Navigazione**: monta esperimento, apri capitolo/pagina, mostra video.
- **Puntatore UNLIM**: un cursore visibile che UNLIM muove sulla LIM per dirigere lo sguardo della classe ("guardate qui") — l'equivalente del mouse del docente. Complementare a highlight (highlight = glow statico; puntatore = gesto in movimento).
- **Composite**: UNLIM concatena azioni ("monta l'esperimento, evidenzia R1, compila").

## 9.2 Meccanismo — function calling + tool registry

Tutte le azioni sono **tool semantici** in `INTENT_TOOLS_SCHEMA`; l'LLM le emette via **function calling** (Mistral — già nel codice); il browser le esegue via `__ELAB_API`. **NON** controllo pixel del mouse: la piattaforma è nostra, un'API semantica è più sicura, precisa e testabile di un click su coordinate.

L'LLM sceglie l'azione **dopo** aver capito la domanda — non un regex *prima*. È questa la differenza tra "onnipotenza fatta bene" e i detector che sparavano `mountExperiment` su una domanda di storia.

**Tool registry**: audit dei ~12 tool attuali → mappa completa della superficie → registry esplicito e versionato. Ogni tool: nome, parametri, descrizione, flag distruttivo.

## 9.3 Sicurezza delle azioni

Whitelist; le azioni distruttive (`clearCircuit`, `removeComponent`) devono essere davvero richieste, non inferite; ogni azione è **verificabile** (lo stato successivo conferma che è avvenuta); UNLIM non dice "ho fatto" senza emettere il tool.

---

## 10. Contratto API

Il redesign cambia il contratto request/response di `unlim-chat`: nuovi campi in ingresso (snapshot completo lavagna, conversazione intera, input vocale/testo), campi rimossi (`userIntentSeed`), output con array di intent dal registry completo. Il payload di richiesta (conversazione, snapshot) è **transiente** — elaborato per il turno, non persistito grezzo (§8.2, §12). Il nuovo contratto va definito e documentato (`api-design-principles`, `generate-api-docs`) — confine frontend/Edge Function, da tenere sincronizzato.

## 11. Cosa si cancella / cosa resta

**Cancellato**: detector pre-LLM di *contenuto* in `operational-response.ts` (volpag, offtopic-canned, loadexp su verbo) · rewriting cosmetico post-LLM in `principio-zero-validator.ts` (`enforceItalianK12Opener`, enforcement citazione) · over-ancoraggio `userIntentSeed` · `BASE_PROMPT` legacy · classificatore regex `onniscenza-classifier.ts`/`onniscenza-bridge.ts` (ruolo assorbito da stato sempre-attivo + flag).

**Tenuto**: fast-path *comandi* UI puri · check sicurezza post-LLM · function calling (`INTENT_TOOLS_SCHEMA`) · RAG retrieval (come contesto disponibile, non citazione obbligatoria) · STT/TTS/wake word esistenti · **tutto l'apparato GDPR** (`unlim-gdpr`, `parental_consents`, `purge_expired_data`, caps memoria).

## 12. Sicurezza, GDPR e protezione dati

**Prodotto per minori — i vincoli GDPR esistenti restano legge.** Il design vi si conforma; non li tocca.

**Vincoli GDPR canonici** (`001_gdpr_compliance.sql`, `_shared/memory.ts`, `unlim-gdpr/index.ts`):

- **No raw, no PII**: mai persistere messaggi grezzi né nomi. Solo preview troncate (250/100), categorie di topic, experiment-id, sintesi derivate. Identificatori pseudonimi (hash di sessione / `class_key`).
- **Retention (Art. 5)**: ogni tabella persistita ha `expires_at` ed è purgata da `purge_expired_data()`. Le tabelle nuove della memoria seguono la stessa regola (durata da concordare nel piano — allineata a `student_sessions` = 1 anno, o inferiore).
- **Consenso genitoriale (Art. 8)**: `parental_consents` + `checkConsent`. I nuovi canali (udito/vista) sono mediati dal docente (Principio Zero) — rientrano nel consenso esistente, non lo allargano.
- **Diritto all'oblio (Art. 17) + portabilità (Art. 20)**: ogni tabella nuova DEVE essere aggiunta a `delete_student_data()` e all'export di `unlim-gdpr`.
- **Residenza dati EU**: tutto il runtime UNLIM (LLM, vision, STT, TTS) resta EU — Vertex Gemini Frankfurt, Mistral FR, CF Whisper edge EU. Nessun provider extra-EU sul runtime classe.
- **Audit**: accessi/cancellazioni tracciati in `gdpr_audit_log`.

**Superficie dati — onesto**: questo overhaul *cambia* la superficie dati (contesto più ampio all'LLM, vista, udito, memoria persistita). NON è "nessuna nuova superficie". Ogni nuovo flusso è vincolato dalle regole sopra. Niente nuova superficie d'*attacco*: CORS ristretto + API key esistenti restano.

**Sicurezza risposta + robustezza**: check post-LLM (blocco 220V, scrub JSON leak, scrub experiment-id inesistente `experiment-registry.ts`, redirect off-topic grave). `computeAwarenessFlags` e l'aggregazione contesto difensivi (non lanciano). Vista fallisce → si procede senza, UNLIM dichiara "non riesco a vedere bene la lavagna". LLM fallisce → catena `callLLMWithFallback`.

## 13. Testing + nuovo eval

- **Eval conversazione+azione**: ~20-30 scenari multi-turno reali — i 5 fallimenti degli screenshot + scenari che testano flag (circuito che cambia a metà), memoria (due sessioni), azione (UNLIM esegue l'azione giusta?), vista ("QUANTO VALE i?"). LLM-come-giudice: ha risposto alla domanda? · regge il filo? · linguaggio naturale? · cita solo se serve? · azione giusta? · sicuro?
- Vecchia matrice 1000-query → declassata a sola regressione tecnica (no crash, no JSON leak, safety).
- Unit test: `computeAwarenessFlags`, persistenza memoria, routing pipeline, tool registry.
- **Test GDPR (regressione)**: verifica che le tabelle di memoria persistite non contengano messaggi grezzi né PII — solo preview troncate / sintesi derivate; che ogni tabella nuova abbia `expires_at` e sia coperta da erasure/export.
- **"Molti test, fix, miglioramenti"** = il gate di verifica alla fine di OGNI slice: unit test + conversazioni reali + rete di regressione tecnica. Non un grind aperto — un cancello per slice.

## 14. Principio Zero v3 — definizione canonica

**Invariato — legge assoluta:**
1. Il docente è il tramite; UNLIM è il suo strumento.
2. Gli studenti lavorano sul kit fisico ELAB; non toccano il computer; vedono tutto sulla LIM.
3. UNLIM parla alla classe al plurale; il docente legge/proietta.
4. Chiunque, senza preparazione, accendendo ELAB Tutor può spiegare ai ragazzi.
5. UNLIM costruisce la lezione dal contesto (sessioni passate) + volumi.
6. Kit fisico sempre protagonista; il simulatore è compagno, non sostituto.

**Evoluzione v3:**
7. Citazione Vol/pag **opzionale** — solo quando aiuta davvero. Non più "verbatim obbligatorio".
8. `"Ragazzi,"` / plurale è registro naturale **scritto dall'LLM** — non incollato da un validator.
9. Consapevolezza ("onniscenza") dal **contesto reale**, non da regex. Azione ("onnipotenza") da **output strutturato**, non da regex pre-LLM.

## 15. Slice — esecuzione

Una spec (questa, l'architettura). **Un piano per slice** — non un mega-piano. Ogni slice è spedibile e verificata con conversazioni/azioni reali prima della successiva. NO big-bang.

| Slice | Contenuto | Note |
|---|---|---|
| **1 — Cervello** | Nuovo flusso `unlim-chat` (§6) + system prompt (§8.1) + flag (§7.2) + memoria 3 strati (§8.2) | La slice grande. Rimuove il sandwich regex. Fissa anche il *meccanismo* dell'azione (function calling). Memoria conforme GDPR §12. |
| **2 — Vista** | Vision a flag (§7.3) | Usa il flag `vision_needed` dello Slice 1. Verifica: "QUANTO VALE i?" |
| **3 — Onnipotenza** | Tool registry completo + superficie d'azione (§9) + puntatore LIM | Completa la *superficie* dell'azione. |
| **4 — Udito** | STT input + voce naturale (§7.4) | Piccola: wiring di pezzi esistenti. |
| **5 — Misura** | Nuovo eval conversazione+azione (§13) | Diventa il gate di qualità permanente. |

Stima onesta: 5 slice, settimane di lavoro. Si pianifica ed esegue **una slice alla volta**.

## 16. Rischi

| Rischio | Mitigazione |
|---|---|
| Latenza: meno fast-path di contenuto = più chiamate LLM | Fast-path comandi resta; la chiamata LLM per il contenuto avveniva comunque |
| Scope ampio → grind (storia del progetto) | Slice gated, una alla volta, verifica reale prima della prossima; un piano per slice |
| Punteggio vecchia matrice crolla | Atteso e accettato (decisione 1) |
| Tool registry completo è grande | Audit prima; si parte dai ~12 esistenti, si espande per gruppi |
| LLM-come-giudice rumoroso nell'eval | Eval piccolo (~20-30), spot-check umano |
| Il design deriva dai vincoli GDPR minori | §12 li rende espliciti; ogni slice che tocca persistenza passa da review GDPR (no raw, retention, erasure, EU) prima del merge |

## 17. Obsidian / wikiLLM

Obsidian è uno strumento di *authoring* (backlink, grafo) per i ~126 `.md` del wiki. **Non** cambia il runtime — il runtime compila comunque gli `.md` in RAG. Usalo se è comodo per la manutenzione; i file restano `.md` normali in `docs/unlim-wiki/`. Non è parte di questo redesign.

## 18. Questioni aperte

Non bloccanti, da decidere nei piani delle slice: cap esatto token conversazione (Strato 1); schema tabella Supabase memoria checkpointata + cadenza checkpoint + `expires_at` esatto; estetica del puntatore UNLIM; lista esatta dei tool del registry (esce dall'audit Slice 3); **udito** — modalità di acquisizione audio (push-to-talk vs wake-word always-listening): il push-to-talk riduce la cattura di audio ambientale, da decidere nel piano Slice 4 con riguardo GDPR.
