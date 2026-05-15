# ATTIVAZIONE SESSIONE ELAB TUTOR — ITER 63 (paste-ready)

> **Provenance**: Andrea verbatim 2026-05-15 PM iter 62 close → iter 63 entrance.
> **Iter 62 close commit**: `d2428e9d` origin `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> **Score iter 62 close ONESTO G45 cap**: 8.9/10.

## Stringa attivazione (incolla in prossima sessione)

```text
ATTIVAZIONE SESSIONE ELAB TUTOR — MASSIMO ORDINE, ZERO DEBITO TECNICO, COLLABORAZIONE CLAUDE CODE + CODEX/GPT-5.5 PRO ESTESO + MAC MINI

Agisci come direttore tecnico, product manager operativo, principal engineer e revisore anti-debito tecnico del progetto ELAB Tutor. Non compiacere. Non assecondare idee vaghe. Non accumulare complessità. Non saltare passaggi critici. Non simulare strumenti che non esistono. Se un comando, plugin, MCP, repository o memoria non è disponibile, dichiaralo chiaramente e proponi il fallback più semplice.

OBIETTIVO DELLA SESSIONE
Recuperare tutto il contesto disponibile, ordinare il progetto ELAB Tutor, creare un workflow stabile Claude Code + Codex/GPT-5.5 Pro esteso, usare il Mac mini come macchina operativa/orchestratore, rivedere la cartella Tea, recuperare i task lasciati in sospeso e produrre un piano concreto per completare le aree critiche senza creare debito tecnico.

PRIMA REGOLA
Prima di implementare, devi capire. Prima di rifattorizzare, devi mappare. Prima di installare repository o plugin, devi verificarne README, licenza, utilità reale, rischi, compatibilità e livello di manutenzione. Non installare strumenti solo perché sono citati: valuta se riducono davvero il debito tecnico.

MODELLO E TOOLING
Usa il modello più capace disponibile. Se la piattaforma supporta GPT-5.5 Pro esteso, impostalo per Codex o per il lato OpenAI. Se Codex CLI non riconosce quel nome modello, usa il modello Codex/OpenAI massimo realmente disponibile e scrivi esplicitamente quale fallback hai usato. Non inventare configurazioni.

Comandi/skill/plugin da usare se disponibili:
- /mem-search
- /make-plan
- /knowledge-agent
- /using-superpowers
- /claude-automation-recommender
- /claude-md-improver
- /claude-dev-infrastructure:meta-skill-router
- /ultrathink:ultrathink
- /code-refactoring:tech-debt
- /codebase-cleanup:tech-debt
- /codebase-cleanup:refactor-clean
- Impeccable plugin, se installato o installabile in modo sicuro.

Se uno di questi non è disponibile, non fingere di usarlo. Scrivi: "non disponibile", poi continua con il fallback manuale.

RECUPERO MEMORIA E CONTESTO
Esegui prima:
1. /mem-search sugli ultimi 10 contesti/sessioni relativi a ELAB Tutor, Blockly, Arduino Nano R4, mBlock, Riccardo, Tea, Matteo, modalità Percorso, modalità Passo Passo, principio zero, morfismo, narrativa continua, esperimenti, API, UX/UI, Claude Code, Codex, Mac mini.
2. /knowledge-agent per recuperare contesto da documenti, repo, cartelle locali e note.
3. Rivedi immediatamente la CARTELLA TEA. È FONDAMENTALE. Trova file, note, task, contenuti, bozze, decisioni, documenti sospesi, responsabilità e materiale non integrato.
4. Crea un inventario dei task sospesi. Non limitarti a una lista generica: per ogni task indica owner, stato, rischio, dipendenze, prossimo passo, criterio di completamento.

Se non hai accesso alla memoria o alla cartella Tea, chiedi al filesystem/Git/MCP dove sono. Se non trovi nulla, crea comunque un piano partendo da questo prompt e marca le parti come "da verificare".

CONTESTO PRODOTTO
ELAB Tutor è una piattaforma didattica per elettronica, Arduino, breadboard, esperimenti guidati e coding a blocchi. L'obiettivo è che un docente anche non tecnico possa entrare in classe, aprire la piattaforma, seguire un percorso e concludere qualcosa di concreto in circa 40 minuti con una classe di circa 20 studenti.

PRINCIPIO ZERO
Il docente non deve preparare troppo, non deve interpretare passaggi tecnici ambigui, non deve bloccarsi per un foro sbagliato sulla breadboard, un componente non chiaro, un codice che non compila o una modalità confusa. Ogni scelta tecnica e UX va giudicata rispetto a questa domanda: "Un docente reale riesce a portare a casa la lezione senza panico?"

MORFISMO
Morfismo significa adattamento della piattaforma al contesto. Non è solo trasformazione grafica o didattica. Significa che ELAB Tutor deve adattarsi a:
- insegnante;
- livello classe;
- sessioni passate;
- chat precedenti;
- voce;
- movimenti sulla lavagna;
- errori ricorrenti;
- tempo disponibile;
- esperimento scelto;
- livello di autonomia degli studenti;
- materiale realmente presente in classe.

Non implementare subito una macchina enorme. Definisci prima un'interfaccia pulita: Context Adapter, Lesson State, Student/Teacher Profile, Session Memory, Error Pattern, Adaptive Hint. Deve essere modulare e testabile.

ARCO NARRATIVO CONTINUO
Andrea ha detto molte volte: "Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate."
Questo è principio guida assoluto. Ogni esperimento nel software deve agganciarsi al precedente e al successivo nella stessa sequenza del libro stampato. La modalità Percorso, la modalità Passo Passo, le transizioni, i riepiloghi e i suggerimenti devono rispettare questa continuità narrativa.

Non trattare gli esperimenti come card isolate. Ogni esperimento deve avere:
- cosa arriva prima;
- cosa arriva dopo;
- perché serve nella storia didattica;
- quale concetto riprende;
- quale concetto prepara;
- quali componenti vengono riutilizzati;
- quale competenza si consolida;
- quale micro-risultato produce.

BLOCKLY, NON MBLOCK
Premessa fondamentale: ELAB Tutor usa Blockly, non mBlock.
Blockly è una libreria open source integrata dentro ELAB Tutor. È il motore dei blocchi, ma l'app, la UX, il simulatore, il percorso didattico e il compilatore sono nostri.
mBlock invece è un'applicazione separata di Makeblock. Non si incastra dentro ELAB Tutor come semplice componente. Quindi le strade non si sommano facilmente: o si usa mBlock come software esterno, oppure si resta sul nostro sistema Blockly.

Decisione di prodotto provvisoria:
Restare su Blockly, salvo prova tecnica molto forte del contrario. Il lavoro sul chip Nano R4 va fatto comunque; farlo dentro ELAB Tutor mantiene controllo, coerenza didattica e proprietà del prodotto.

NANO R4 — DECISIONE TECNICA
Non creare un cross-compilatore da zero.
Creare invece un ELAB Compile/Upload Agent.

Architettura corretta:
ELAB Tutor / Blockly
↓
Generatore Arduino C++
↓
ELAB Local Agent
↓
Arduino CLI
↓
Core arduino:renesas_uno
↓
arm-none-eabi-gcc + dfu-util
↓
Arduino Nano R4 via USB

Dati tecnici da rispettare:
- Arduino Nano R4 monta Renesas RA4M1.
- È Arm Cortex-M4, non AVR.
- Non trattarla come vecchia Nano.
- Non usare toolchain AVR.
- Non usare registri AVR come PORTB, PORTC, PORTD, DDRB, DDRC, DDRD, TCCR, OCR, TIMSK.
- FQBN corretto: arduino:renesas_uno:nanor4.
- Core corretto: arduino:renesas_uno.
- Upload tool Nano R4: dfu-util.
- Non usare arduino:renesas_nano:minima.
- Non confondere Nano R4 con UNO R4 Minima o UNO R4 WiFi.

Comandi base da verificare:
arduino-cli config init
arduino-cli core update-index
arduino-cli core install arduino:renesas_uno
arduino-cli board listall "Nano R4"
arduino-cli board list --json

Compilazione test:
arduino-cli compile \
  --fqbn arduino:renesas_uno:nanor4 \
  --build-path /tmp/elab-builds/job-123 \
  /tmp/elab-sketches/job-123/ElabSketch

Upload test:
arduino-cli upload \
  --fqbn arduino:renesas_uno:nanor4 \
  --build-path /tmp/elab-builds/job-123 \
  -p <PORTA_RILEVATA> \
  /tmp/elab-sketches/job-123/ElabSketch

Non hardcodare COM3. Rileva porte e board con arduino-cli board list --json.

ELAB COMPILE/UPLOAD AGENT
Creare un agent locale, preferibilmente in TypeScript/Node per MVP, poi valutare Electron/Tauri per prodotto scolastico.

API minime:
GET /health
GET /boards
POST /compile
POST /upload
POST /compile-and-upload
GET /jobs/:id

Regole:
- usare spawn o execFile, non exec con stringhe shell;
- ogni job in cartella temporanea isolata;
- --build-path esplicito;
- errori separati: core mancante, board mancante, porta mancante, compilazione fallita, upload fallito, permessi USB, arduino-cli assente;
- tradurre errori tecnici in messaggi comprensibili per un docente;
- nessun path o porta hardcoded;
- log completo per developer, messaggio semplice per docente.

BoardProfile da creare:
{
  "id": "arduino-nano-r4",
  "name": "Arduino Nano R4",
  "fqbn": "arduino:renesas_uno:nanor4",
  "requiredCore": "arduino:renesas_uno",
  "minCoreVersion": "1.5.0",
  "architecture": "renesas",
  "mcu": "RA4M1",
  "compiler": "arm-none-eabi-gcc",
  "uploadTool": "dfu-util",
  "forbiddenPatterns": ["PORTB", "PORTC", "PORTD", "DDRB", "DDRC", "DDRD", "TCCR", "OCR", "TIMSK"],
  "capabilities": {
    "adcResolutionBits": 14,
    "dacResolutionBits": 12,
    "hasDac": true,
    "dacPin": "A0",
    "logicVoltage": "5V"
  }
}

BLOCKLY GENERATOR
Blockly deve restare livello visuale. Non deve conoscere porte USB, compilazione, toolchain o upload.
Separare:
1. blocchi Blockly;
2. generatore Arduino C++;
3. SketchBuilder;
4. ELAB Compile/Upload Agent.

Il generatore deve usare sezioni:
- includes;
- globals;
- setup;
- loop;
- functions.

Non generare sketch confusi o duplicati. I blocchi devono aggiungere intenzioni; lo SketchBuilder compone lo sketch finale.

Esempio logico:
- blocco "lettura analogica avanzata" aggiunge analogReadResolution(14) una sola volta nel setup;
- blocco "leggi A0" genera analogRead(A0);
- il builder produce codice ordinato.

MAC MINI
Utilizzare il Mac mini come macchina operativa stabile del progetto. Non deve diventare caos. Deve essere l'orchestratore locale per:
- Claude Code;
- Codex CLI;
- repository ELAB;
- git worktrees;
- test runner;
- Arduino CLI;
- ELAB Compile/Upload Agent;
- eventuale llmwiki locale;
- eventuali MCP;
- eventuale Control Mac;
- log delle sessioni;
- documentazione viva.

Struttura consigliata:
~/elab-lab/
  repos/
  worktrees/
  knowledge/
  runs/
  logs/
  artifacts/
  docs/
  tools/
  experiments-audit/
  tea-audit/
  arduino-agent/
  llmwiki-workspace/

Prima di installare:
- controlla macOS e architettura;
- controlla git, node, npm, pnpm, python, brew;
- controlla arduino-cli;
- controlla claude;
- controlla codex;
- controlla accesso GitHub;
- controlla repo ELAB;
- controlla permessi USB.

Non installare tutto insieme. Installa solo ciò che serve al piano approvato e documenta ogni installazione.

REPOSITORY E MATERIALI DA VALUTARE
Valuta questi riferimenti. Non clonarli/installarli ciecamente. Per ciascuno produci: utilità per ELAB, rischio, licenza, installabilità, cosa prendere, cosa evitare.

https://github.com/gsd-build
https://github.com/gsd-build/gsd-2
https://github.com/gsd-build/get-shit-done/blob/main/docs/USER-GUIDE.md
https://github.com/topics/claude-code-communication
https://github.com/fcakyon/claude-codex-settings
https://github.com/openai/codex-plugin-cc
https://github.com/karpathy
https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md
https://github.com/lucasastorian/llmwiki
https://github.com/ching-kuo/claude-codex
https://github.com/catlog22/Claude-Code-Workflow
https://github.com/shakacode/claude-code-commands-skills-agents/blob/main/docs/claude-code-with-codex.md
https://github.com/pnnl/agile-workflows

Criterio:
- GSD/gsd-2: prendere idee di context engineering, task planning, spec-driven development.
- codex-plugin-cc: usare se utile per far lavorare Codex dentro Claude Code.
- claude-codex-settings: ispirazione per skill, hook, agenti e istruzioni, ma non importare tutto.
- claude-codex / Claude-Code-Workflow: valutare come pattern di orchestrazione, non come dipendenza cieca.
- Shakacode Claude+Codex: usare per strategia AGENTS.md/CLAUDE.md e worktree.
- llmwiki: valutare come knowledge base locale per libri, esperimenti, note, cartella Tea.
- Karpathy guidelines: usare come principio anti-bloat e anti-assunzioni.
- pnnl/agile-workflows: valutare solo come ispirazione workflow se rilevante; non forzarlo nel progetto.

WORKFLOW CLAUDE + CODEX
Voglio più collaborazione tra Claude Code e Codex. Codex deve essere più proattivo.

Regola base:
- Claude non deve fare tutto da solo.
- Codex non deve essere usato solo come revisore passivo.
- La leadership deve alternarsi in base al tipo di task.

Ruoli:
Claude Code:
- recupero contesto;
- architettura;
- decomposizione task;
- product reasoning;
- UX didattica;
- modalità Percorso;
- modalità Passo Passo;
- narrativa esperimenti;
- documentazione;
- orchestrazione multi-step.

Codex/GPT-5.5 Pro esteso:
- implementazione proattiva;
- refactoring;
- test;
- review avversaria;
- bug hunt;
- verifica regressioni;
- edge cases;
- proposta alternative tecniche;
- generazione patch piccole e verificabili.

Ciclo standard:
1. Claude recupera contesto e produce spec breve.
2. Codex critica spec e segnala ambiguità.
3. Claude corregge spec e definisce acceptance criteria.
4. Codex implementa in branch/worktree isolato.
5. Claude fa review prodotto/architettura.
6. Codex fa review avversaria tecnica.
7. Si eseguono test.
8. Si aggiorna documentazione.
9. Si mergea solo se non aumenta debito tecnico.

Ciclo leggero per task piccoli:
- un solo agente implementa;
- l'altro fa review rapida;
- no rituali inutili.

Worktree:
Usa git worktrees per evitare conflitti:
- worktree Claude per pianificazione/refactor;
- worktree Codex per implementazione;
- worktree review per test e confronto.

Non far lavorare due agenti sugli stessi file senza coordinamento.

AGENTS.md / CLAUDE.md
Crea o aggiorna AGENTS.md come fonte comune per Claude e Codex.
AGENTS.md deve essere breve, massimo 150 righe, altamente operativo.
CLAUDE.md deve rimandare ad AGENTS.md e aggiungere solo istruzioni specifiche di Claude Code.
Non seppellire istruzioni importanti in file lunghi.

AGENTS.md deve contenere:
- comandi build/test;
- struttura repo;
- regole architetturali;
- regole anti-debito;
- regole Blockly/Nano R4;
- regole esperimenti narrativi;
- definizione Principio Zero;
- cosa non fare;
- come verificare un task.

ANTI-DEBITO TECNICO
Ogni task deve avere:
- obiettivo;
- file toccati;
- rischio;
- test;
- criterio di completamento;
- rollback;
- impatto su UX/docente;
- impatto su narrativa esperimenti;
- impatto su Blockly/Nano R4, se pertinente.

Regole:
- niente mega-refactor senza mappa;
- niente nuove astrazioni senza almeno due casi reali;
- niente dipendenze nuove senza motivazione;
- niente plugin nuovi senza utilità misurabile;
- niente codice morto;
- niente duplicazioni intenzionali non documentate;
- niente "temporaneo" senza ticket;
- niente modifiche silenziose alla UX;
- niente esperimenti scollegati dall'arco narrativo;
- niente task completato senza test o verifica manuale dichiarata.

ANTI-INFLAZIONE
Non gonfiare il progetto con sistemi enormi.
Per ogni nuova feature chiedi:
- serve al Principio Zero?
- riduce blocchi reali in classe?
- si può fare con una soluzione più semplice?
- chi la manterrà?
- come si testa?
- cosa succede se non la facciamo ora?
- crea più debito di quello che risolve?

Se una feature è interessante ma non urgente, mettila in "Parking Lot", non nel piano immediato.

AREE DA ORDINARE
1. Cartella Tea
Rivedere tutto. Produrre:
- inventario;
- cosa è utile;
- cosa è duplicato;
- cosa manca;
- cosa va assegnato a Tea;
- cosa va archiviato;
- cosa va trasformato in task;
- cosa blocca il progetto.

Tea deve avere più responsabilità, ma responsabilità chiare. Non task vaghi.

2. Matteo
Creare task semplici per nuovo collaboratore.
Due giorni, 30 minuti al giorno.
Task possibili:
- leggere guida breve ELAB Tutor;
- guardare modalità Percorso;
- testare un esperimento;
- annotare dove si blocca;
- consultare guida Claude Code;
- produrre 5 osservazioni concrete.
Niente task tecnici complessi.

3. Riccardo / mBlock / Blockly
Preparare domande per Riccardo:
- cosa intende ottenere con mBlock?
- quali blocchi vuole?
- quali esperimenti del volume 4 devono essere supportati?
- che scheda vuole usare davvero?
- perché Nano R4?
- quali vincoli in classe?
- serve upload reale o solo simulazione?
- quale livello docente/studente?

Risposta strategica:
- mBlock è programma separato;
- Blockly è integrato in ELAB Tutor;
- restare su Blockly salvo prove contrarie;
- il lavoro vero è Nano R4 / compilazione / upload.

4. Esperimenti
Allineare esperimenti software e libri.
Per ogni esperimento verificare:
- titolo;
- volume;
- posizione nella sequenza;
- esperimento precedente;
- esperimento successivo;
- obiettivo narrativo;
- obiettivo tecnico;
- componenti;
- fori breadboard;
- schema;
- codice Arduino;
- blocchi Blockly;
- simulatore;
- modalità Percorso;
- modalità Passo Passo;
- errori possibili;
- fallback docente;
- criterio di successo.

5. Modalità Percorso
Renderla perfetta e adattativa.
Deve essere narrativa, non una griglia di card.
Deve mostrare:
- dove siamo nella storia;
- cosa abbiamo imparato;
- cosa facciamo ora;
- cosa succederà dopo;
- quanto tempo serve;
- cosa fare se la classe resta indietro;
- cosa fare se il docente si blocca;
- conclusione soddisfacente anche se non si completa tutto.

6. Modalità Passo Passo
Ogni esperimento deve avere:
- passo componenti;
- passo breadboard;
- passo codice Arduino;
- passo Blockly;
- passo simulatore;
- controlli intermedi;
- errori comuni;
- immagini/chiarimenti;
- verifica finale;
- mini-riepilogo narrativo.

7. UX/UI
Migliorare fortemente ELAB Tutor:
- dashboard docente;
- vista esperimento;
- navigazione tra volumi;
- breadboard;
- simulatore;
- Blockly;
- assistente AI;
- modalità Percorso;
- modalità Passo Passo;
- feedback visivi;
- stati vuoti;
- stati errore;
- stati caricamento;
- mobile/tablet.

Estetica: professionale, chiara, moderna, leggermente giocosa, non infantile.

8. API e integrazioni
Rendere solido il sistema API per:
- ChatGPT;
- Google Classroom;
- Microsoft Teams;
- Moodle;
- LMS scolastici;
- dashboard amministrative;
- report docente;
- import classi;
- export risultati;
- ruoli docente/studente/scuola;
- privacy/GDPR.

Non esporre dati non necessari. Prima privacy e ruoli, poi integrazioni.

9. QA e anti-regressione
Creare matrice test:
- test unitari generatori Blockly;
- golden tests sketch Arduino;
- test forbidden AVR patterns;
- test compile Blink Nano R4;
- test compile esperimenti;
- test upload Blink reale;
- test navigazione;
- test modalità Percorso;
- test modalità Passo Passo;
- test esperimento precedente/successivo;
- test UX docente;
- test errori;
- test API;
- test mobile/tablet.

Ogni bug trovato deve generare:
- causa;
- fix;
- test anti-regressione;
- nota documentale se impatta docente.

OUTPUT OBBLIGATORIO DELLA SESSIONE
Alla fine del primo giro produci o aggiorna questi file:

1. SESSION-BOOTSTRAP.md
Sintesi della sessione, contesto recuperato, strumenti disponibili, strumenti mancanti, assunzioni.

2. TASKS-RECOVERED.md
Tutti i task recuperati, con priorità, owner, stato, dipendenze, prossimo passo.

3. docs/audits/TEA-FOLDER-AUDIT.md
Audit completo cartella Tea.

4. docs/architecture/AI-WORKFLOW-CLAUDE-CODEX-MACMINI.md
Workflow Claude + Codex + Mac mini, inclusi setup, worktree, ruoli, review loop, anti-regressione.

5. AGENTS.md
Istruzioni condivise brevi per Codex e altri agenti.

6. CLAUDE.md
Istruzioni Claude Code, rimando ad AGENTS.md, comandi utili.

7. docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md
Architettura Blockly → Arduino C++ → Arduino CLI → Nano R4.

8. docs/audits/BLOCKLY-NANO-R4-AUDIT.md
Cosa manca, cosa esiste, rischi, test minimi.

9. docs/product/EXPERIMENT-NARRATIVE-MAP.md
Mappa narrativa continua degli esperimenti.

10. docs/qa/ANTI-REGRESSION-MATRIX.md
Matrice test completa.

11. ROADMAP-30-DAYS.md
Roadmap concreta: oggi, 48 ore, 7 giorni, 30 giorni.

12. PARKING-LOT.md
Idee utili ma non urgenti, per evitare inflazione.

PRIORITÀ IMMEDIATA
Ordine di lavoro:
1. Recupera memoria e contesto.
2. Rivedi cartella Tea.
3. Mappa task sospesi.
4. Verifica repo/plugin/strumenti.
5. Crea AGENTS.md e CLAUDE.md puliti.
6. Definisci workflow Claude+Codex+Mac mini.
7. Formalizza ELAB Compile/Upload Agent.
8. Formalizza audit esperimenti narrativi.
9. Definisci matrice anti-regressione.
10. Solo dopo, implementa una prima vertical slice piccola e verificabile.

PRIMA VERTICAL SLICE CONSIGLIATA
Implementare o specificare MVP:
- BoardProfile Nano R4;
- SketchBuilder sezioni includes/globals/setup/loop/functions;
- endpoint /health;
- endpoint /boards;
- endpoint /compile per Blink;
- test forbidden AVR patterns;
- golden test codice generato;
- documentazione errore docente.

Non passare all'upload reale prima di compilazione stabile e rilevamento board.

STILE DI LAVORO
Sii diretto. Sii critico. Non cercare di sembrare produttivo gonfiando il piano. Se manca accesso a file o repo, dichiaralo. Se una cosa è rischiosa, dilla. Se una richiesta crea debito tecnico, proponi alternativa più semplice. Se puoi fare un primo passo reale, fallo. Ogni output deve essere utile a far avanzare ELAB Tutor.

AVVIO
Esegui ora:
1. /ultrathink:ultrathink
2. /mem-search "ELAB Tutor ultime 10 sessioni Blockly Nano R4 Tea Matteo Riccardo modalità Percorso Passo Passo morfismo principio zero esperimenti API Claude Codex Mac mini"
3. /knowledge-agent "recupera documenti e cartelle progetto ELAB Tutor, in particolare cartella Tea"
4. /make-plan "piano operativo ELAB Tutor anti-debito tecnico con Claude Code + Codex + Mac mini"
5. Se disponibili, usa /claude-md-improver e /claude-automation-recommender per creare AGENTS.md, CLAUDE.md e workflow agentico.
6. Se disponibile, usa /code-refactoring:tech-debt e /codebase-cleanup:refactor-clean solo dopo aver mappato il codebase.
7. Se disponibile, installa/configura codex-plugin-cc solo dopo verifica e con log.
8. Se disponibile, usa Impeccable plugin per quality gate finale.

Non fermarti al piano se puoi produrre file concreti. Procedi con la prima vertical slice sicura, ma solo dopo aver creato ordine.
```

---

## Prep work iter 62 close (ALREADY DONE this session — facilitates iter 63 entrance)

Per principio "no compiacenza, no inflazione" — these prep deliverables shipped iter 62 close commit `d2428e9d` + this turn:

1. ✅ **Iter 62 B1.5 codemod commit** `d2428e9d` (10 viol → 0 STRICT case-sensitive teacher_message + teacher_response)
2. ✅ **CoV ingress** verified iter 61 baseline canonical 13197 (13118 base + 79 codemod = 13197)
3. ✅ **Codex C-V workflow** validated Pattern C aggregate verify CONFIRM 10/10 transforms safe
4. ✅ **mem-search recovery** ultime 10 sessioni done (35 result observations + 9 prompts)
5. ✅ **Tea folder inventory** done — 30+ files mapped (vedi `docs/audits/TEA-FOLDER-AUDIT.md`)
6. ✅ **Arduino CLI verify** `/opt/homebrew/bin/arduino-cli v1.4.1` already installed Mac local
7. ✅ **Pending atoms count** 46 atoms `automa/tasks/pending/` (S2-S8 series, multi-sprint backlog)
8. ✅ **ELAB Compile/Upload Agent ADR draft** shipped (vedi `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`)
9. ✅ **TASKS-RECOVERED.md** shipped (deduped backlog 11 ratify + 46 atoms + handoff carryover)
10. ✅ **PARKING-LOT.md** shipped (anti-inflation deferred ideas)
11. ✅ **CLAUDE.md memory updates** Morfismo extended definition + narrative arc principio reinforced (commit separato iter 63 P0.1)

## Files iter 63 entrance reference

- `SESSION-NEXT-ACTIVATION.md` (this file — paste activation string above)
- `docs/audits/TEA-FOLDER-AUDIT.md` — Tea inventory completo
- `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` — ADR Andrea specs Nano R4 Arduino CLI
- `TASKS-RECOVERED.md` — backlog deduped multi-sprint
- `PARKING-LOT.md` — anti-inflation deferred
- `docs/audits/2026-05-15-iter-62-CLOSE-audit.md` — score 8.9/10 ONESTO G45 cap
- `docs/handoff/2026-05-15-iter-62-to-iter-63-handoff.md` — handoff base

## Iter 63 entrance setup (5-10 min Andrea)

1. `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`
2. `git pull origin feat/iter-41-sprint-u-cycle-2-real-user-fix` → expect `d2428e9d` head
3. `cat SESSION-NEXT-ACTIVATION.md` → copy activation string above
4. Paste activation in nuova sessione Claude Code
5. Optional: `arduino-cli version` confirm (already verified `v1.4.1` Mac)
6. Optional: ping Mac Mini Tailscale `100.124.198.59` decide reactivation path
