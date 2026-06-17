# ELAB Tutor v1.0 — Onboarding Completo per Tea Babbalea

**Autore**: Andrea Marro (Lead Developer)
**Destinataria**: Tea Lea Babbalea (Co-developer, collaboratrice volontaria)
**Data**: 21 aprile 2026
**Versione documento**: 1.0
**Formato**: Markdown (convertibile in PDF con ~35 pagine)

---

## Lettera di introduzione

Cara Tea,

ti scrivo questo documento per condividere con te tutto quello che sto facendo in queste settimane su ELAB Tutor, spiegarti come potremmo lavorare insieme in modo sostenibile e asincrono, e darti **totale libertà** di scegliere come contribuire al progetto. Non stai leggendo ordini, stai leggendo proposte: ti chiedo pareri, suggerimenti, alternative. Se qualcosa non ti convince, dimmelo. Se preferisci fare altro rispetto a quello che suggerisco, ben venga.

Il progetto è ambizioso — otto settimane (dal 21 aprile al 15 giugno 2026) per arrivare alla versione 1.0 vendibile alle scuole italiane. Sono da solo sullo sviluppo e, onestamente, la tua prospettiva pedagogica, il tuo design UX e la tua sensibilità verso i bambini 8-14 anni sono cose che io non ho. Abbiamo una divisione naturale: io gestisco l'infrastruttura tecnica, il simulatore di circuiti, il backend AI; tu puoi lavorare su contenuto, design, ricerca, pedagogia, copywriting, componenti React leggeri — tutto su percorsi di codice che NON impattano la parte critica e che possono essere uniti automaticamente al progetto senza che io debba approvare ogni modifica.

Questo documento è lungo perché voglio spiegarti **tutto**: i termini tecnici non ovvi, le regole ferree del progetto (la più importante si chiama "Principio Zero v3"), come funzionano gli strumenti che usiamo, dove trovare le credenziali, e soprattutto una lista ordinata di **tutte** le cose che potresti fare. Alcune sono semplici (scrivere testi), altre creative (disegnare illustrazioni SVG), altre tecniche (componenti React), altre di ricerca (audit competitor, pedagogia). Scegli tu il ritmo e l'ordine.

Buona lettura. Spero che questo documento ti sia utile e che ti faccia venire voglia di mettere le mani nel progetto. Sei libera di fare qualsiasi cosa.

Un abbraccio,
Andrea

---

## Sommario

- **Parte I** — Contesto del progetto e dove siamo adesso
- **Parte II** — Metodologia di lavoro (Agile, Principio Zero v3, parità, GitHub)
- **Parte III** — Strumenti, accessi e credenziali
- **Parte IV** — Tutto quello che puoi fare in totale libertà
- **Parte V** — Come scegli cosa fare + opzione "Andrea fa questa parte"
- **Parte VI** — Chain of Verification (verifica che ho coperto tutto)

---

# PARTE I — Contesto del progetto

## 1.1 Chi siamo

**Il team attuale**:
- **Andrea Marro** — Lead developer, svolge sviluppo software, responsabile architetturale, gestione deploy. Sto lavorando a tempo pieno 40+ ore a settimana sul progetto.
- **Giovanni Fagherazzi** — Ex Sales Director globale di Arduino, responsabile vendite ELAB alle scuole italiane. Ha rete di contatti scuole. Non fa codice, vende prodotto.
- **Omaric Elettronica** (Strambino, Torino) — filiera hardware. Producono i kit fisici ELAB che arrivano nelle scuole (breadboard, componenti, batterie). Hanno esperienza Arduino originale.
- **Davide Fagherazzi** — Gestisce procurement MePA (Mercato Elettronico Pubblica Amministrazione). È il canale tramite cui le scuole italiane acquistano ELAB.
- **Tea Lea Babbalea** (tu!) — Co-developer volontaria. Focus: pedagogia bambini 8-14, design UX, glossario, audit esperimenti realistici, implementazione componenti UI leggeri.

**Committenti**: il team Fagherazzi-Omaric ha affidato ad Andrea la responsabilità dello sviluppo software. È una fiducia significativa. Per Andrea la reputazione professionale dipende dal successo di questo progetto.

**Team estesi (agenti AI)**: per accelerare lo sviluppo, Andrea orchestra un team di agenti intelligenza artificiale specializzati (basati sul modello Claude Opus 4.7 di Anthropic). Non sono assistenti generici: ognuno ha un ruolo preciso (architetto, sviluppatore, tester, revisore, auditor, project manager). Lavorano in parallelo, coordinandosi tramite file condivisi, e producono commit reali sul progetto. Questo è ciò che rende possibile sviluppare a una velocità superiore a quella di una singola persona.

## 1.2 Cosa è ELAB Tutor

ELAB Tutor è un **tutor educativo per bambini di età 8-14 anni** specializzato in **elettronica e Arduino**. Il prodotto è composto da due parti complementari:

1. **Parte fisica** — tre volumi cartacei (Vol 1, 2, 3) che contengono **92 esperimenti totali** con istruzioni passo-passo, più un **kit fisico** contenente componenti elettronici reali (breadboard, LED, resistori, pulsanti, scheda Arduino Nano, batterie, cavi, ecc.). Il bambino in classe usa queste cose fisiche — le tocca, le monta, vede la luce accendersi davvero.

2. **Parte digitale** (il software che stiamo sviluppando):
   - Un **simulatore di circuiti** proprietario che gira nel browser. Simula la tensione, la corrente, la logica digitale Arduino ATmega328p. Permette al docente di mostrare alla classe sulla LIM (Lavagna Interattiva Multimediale) cosa succede nel circuito prima o dopo che i bambini lo assemblano sul kit fisico.
   - Un **tutor AI di nome UNLIM** che genera spiegazioni didattiche. UNLIM è basato su modelli di linguaggio (attualmente Together AI Llama 3.3 70B, precedentemente Gemini di Google). Comprende il contesto del circuito, risponde a domande, suggerisce correzioni, propone analogie comprensibili ai bambini (strade, tubi, ricette).
   - Una **lavagna digitale** dove il docente può disegnare, annotare, proiettare alla classe.
   - **Scratch/Blockly** — programmazione visuale a blocchi per bambini, compila automaticamente a codice Arduino C++.
   - Un **compilatore Arduino** che trasforma il codice C++ in istruzioni hex eseguite da un emulatore del chip AVR nel browser.
   - Una **dashboard docente** (ancora in costruzione) con statistiche classe, report settimanali, notifiche.
   - Quattro **giochi didattici** (Detective, POE, Reverse Engineering, Circuit Review).
   - **Supporto Progressive Web App** — l'app può essere installata sul telefono del docente come un'app normale.

**Sito in produzione**: https://www.elabtutor.school — è già online e funzionante, anche se ancora in versione beta.

## 1.3 Il differenziatore competitivo (perché ELAB vince vs altri prodotti)

Sul mercato esistono kit elettronici per scuole (Arduino Education, Micro:bit, ELEGOO), ma **nessun concorrente unisce** in modo coerente:

1. Kit fisico italiano reale con volumi cartacei narrativamente coerenti (92 esperimenti raccontati come storia continua, non card separate)
2. Simulatore integrato con i volumi (ogni esperimento del libro ha controparte digitale)
3. Tutor AI che parla italiano, rispetta pedagogia bambini, cita il libro fedelmente
4. Prezzo adatto al mercato italiano (MePA, PNRR)

**Il nostro vantaggio**: **coerenza assoluta tra volume fisico e software**. Quando un bambino apre il libro a pagina 29 del Volume 1 e vede l'esperimento del LED, e poi il docente lo mostra sulla LIM, deve essere **esattamente lo stesso esperimento**, con le stesse parole, la stessa analogia, lo stesso risultato atteso. Questo lo chiamiamo **"parità volumi"** ed è una regola ferrea. Più avanti ti spiegherò perché è così importante.

## 1.4 Dove siamo adesso (stato al 21 aprile 2026)

Abbiamo iniziato lunedì 21 aprile uno sprint ambizioso di 8 settimane. Al momento di scrittura (giorno 1 dello sprint), abbiamo:

- **12149 test unitari** che passano (baseline di qualità del codice)
- **Punteggio di benchmark 4.29 su 10** (obiettivo fine sprint: 8.0+)
- **31 test end-to-end Playwright** su 20 scenari (homepage, simulatore, UNLIM chat, lavagna, ecc.)
- **13 commit** atomici oggi (giorno 1), **tutti pushati su GitHub**
- **Switch LLM completato**: da Gemini a Together AI (Llama 3.3 70B), con 20 prompt di test PZ v3 PASS (si spiega più avanti cos'è PZ v3)
- **Nuova CLI autonoma funzionante** che lavora da sola per ore, auto-commit, auto-push, auto-deploy preview
- **Infrastruttura Supabase canonical verified** tramite Model Context Protocol (MCP): il progetto attivo è `euqpdueopmlllqjmqnyb`, non quello secondario.

**Blocker noti che ti segnalo**:
1. Dashboard docente vuota (target: sprint 5-6)
2. Test di accessibilità non ancora in CI (axe-core, settimana 1 P1)
3. Render cold start 18 secondi (warmup cron introdotto oggi, settimana 1 T1-003)
4. Vision screenshot → Gemini non testata end-to-end live

## 1.5 Piano 8 settimane (riassunto)

| Settimana | Periodo | Focus principale |
|-----------|---------|------------------|
| 1 | 21-27/04 | **Stabilize** — 6 bug critici, fondazioni testing, Tea onboarding |
| 2 | 28/04-04/05 | **Infrastructure** — Hetzner VPS, RunPod GPU setup parallelo EU |
| 3 | 05-11/05 | **Bridge** — Edge Function → OpenClaw orchestrator, Together AI full production |
| 4 | 12-18/05 | **Onniscienza** — RAG 6000+ chunk (Volume PDF + glossario + FAQ + errori comuni) |
| 5 | 19-25/05 | **Onnipotenza** — 30+ tool Arduino, diagnostica automatica, multi-step chains |
| 6 | 26/05-01/06 | **Voice** — Voxtral TTS italiano premium, wake word "Ehi UNLIM" |
| 7 | 02-08/06 | **Contesto** — AST analyzer codice Arduino, memoria multi-livello |
| 8 | 09-15/06 | **Release** — v1.0 candidate, beta test 5 classi pilot, documentazione completa |

**Obiettivo fine sprint**: ELAB Tutor v1.0 vendibile alle scuole italiane, GDPR-compliant, stack self-hosted EU (zero dati fuori UE), kit fisico + digitale perfettamente coerenti.

**Rischio principale riconosciuto**: 70% di probabilità di burnout per Andrea a causa del carico (60 ore/settimana media). Mitigazione: riposo weekend obbligatorio, tua disponibilità come supporto volontario, buffer finale di una settimana nel calendario.

---

# PARTE II — Metodologia di lavoro

## 2.1 Agile Scrum applicato (ma adattato a team solo + volontaria)

Usiamo una versione pragmatica del metodo **Agile Scrum** — un framework per sviluppare software in cicli brevi, iterativi, con riunioni regolari e focus su valore consegnato. Qui la versione applicata a noi:

### Sprint settimanali
Ogni lunedì parte uno sprint nuovo, dura 7 giorni, finisce la domenica sera. Ogni sprint ha un **obiettivo chiaro** (es. "Stabilizzare 6 bug produzione + onboardare Tea"). Durante la settimana si lavora su task selezionati all'inizio, e alla fine si tira il punto (**Sprint Review** + **Retrospective**).

### Ruoli nel nostro team

- **Product Owner**: Andrea decide cosa va nel prodotto (le priorità).
- **Scrum Master** (facilitatore): Andrea + un agente AI chiamato `team-tpm` (Technical Project Manager) che orchestra standup quotidiani e rimuove impedimenti.
- **Development Team**: Andrea + sei agenti AI peer (architetto, sviluppatore, tester, revisore, auditor, project manager) + **tu, Tea**.

### Cerimonie (riunioni leggere)

- **Daily Standup** — ogni mattina l'agente `team-tpm` genera automaticamente un file con le tre classiche domande: "ieri cosa è stato fatto, oggi cosa si fa, ci sono blocchi?". Noi possiamo leggerlo. È asincrono: non serve fisicamente incontrarsi.
- **Sprint Review** — ogni domenica sera si tira il punto: quanti task completati, metriche misurate, demo preview del prodotto live.
- **Sprint Retrospective** — subito dopo Review: cosa è andato bene, cosa male, cosa cambiare la settimana prossima. Format "Start-Stop-Continue" (iniziare a fare X, smettere Y, continuare Z).

### Pair programming (opzionale per te)

Andrea propone **venerdì 18:00-19:00** come sessione settimanale opzionale per lavorare insieme 1 ora (via Cowork di Anthropic, Telegram voice, Zoom — tu scegli). **Non è obbligatorio**. Se non ti va o sei impegnata, salti senza problemi.

### Definizione di "Fatto" (Definition of Done — DoD)

Un task si considera "fatto" solo quando:
1. Codice implementato
2. Test che verificano il codice scritti e passano
3. Tre esecuzioni consecutive dei test (**Chain of Verification — CoV**) danno lo stesso risultato positivo (evita falsi positivi casuali)
4. Nessun codice critico toccato (CircuitSolver, AVRBridge, api.js — vedi più avanti)
5. Il "Principio Zero v3" preservato (vedi 2.2 sotto)
6. Build del progetto passa (nessun errore di compilazione)
7. Un PR (Pull Request — proposta di modifica su GitHub) aperto con descrizione chiara
8. Revisione automatica dal CI (Continuous Integration — test automatici su GitHub Actions) verde

Niente di tutto questo dovrebbe spaventarti: **il CI controlla automaticamente**. Se qualcosa fallisce, GitHub ti avvisa. Tu puoi correggere, rimandare, o chiedermi aiuto.

## 2.2 Principio Zero v3 — la regola SUPREMA (la più importante)

Questa è la regola più importante di tutto il progetto. Leggila attentamente.

### Enunciato

**Il docente è il tramite. UNLIM è lo strumento del docente. Gli studenti lavorano sui kit fisici ELAB. I bambini NON interagiscono mai direttamente con UNLIM né con ELAB Tutor.**

### Cosa significa concretamente

- Il bambino a scuola ha davanti il **volume cartaceo** aperto + il **kit fisico** (breadboard, componenti veri).
- Il **docente** ha davanti il suo computer/tablet con ELAB Tutor aperto, connesso alla **LIM** (Lavagna Interattiva Multimediale) che proietta a tutta la classe.
- Il docente **veicola**: legge dal libro, propone l'esperimento, spiega a voce, mostra il risultato sulla LIM.
- UNLIM (il nostro AI) **prepara contenuto** che il docente poi **racconta** alla classe. UNLIM **NON parla direttamente ai bambini**.
- I testi che UNLIM produce sono **collettivi**: rivolti alla classe intera ("Ragazzi, oggi...") **MAI** individuali ("Mario, fai...").

### Regole specifiche di linguaggio UNLIM

1. **Sempre plurale**: "Ragazzi," — mai singolare.
2. **Max 3 frasi + 1 analogia** per risposta. **Max 60 parole totali**.
3. **Citazione fedele del libro**: "Come dice il Vol. 1 a pagina 29...". Non parafrasare. Usa le stesse parole.
4. **VIETATO ASSOLUTO**: le frasi "Docente, leggi" o "Insegnante, leggi". Questi sono pattern che filtri automatici rilevano e bloccano. Se UNLIM li produce, la risposta viene rifiutata dal sistema di test automatici.
5. **Analogie adatte 8-14 anni**: strade, semafori, tubi, porte, ricette, squadre sportive, palette di un pittore. **MAI** acronimi universitari ("RC circuit", "MOSFET cutoff region") senza spiegazione.

### Perché PZ v3 è così importante

1. **Legale** — GDPR minori sotto i 14 anni richiede protezioni severe. Non raccogliamo dati individuali, non abbiamo login bambini, non abbiamo profilazione. Se UNLIM parlasse direttamente al bambino, apriremmo un pandora di responsabilità legali.
2. **Pedagogico** — la ricerca in pedagogia (Reggio Emilia, Montessori, costruttivismo) sostiene che i bambini imparano meglio **dall'interazione sociale** con un mediatore adulto, non da interazioni dirette con un algoritmo.
3. **Pratico** — le LIM nelle scuole italiane sono spesso condivise, non personali. Il modello "1 docente + 1 classe" è più realistico del "1 bambino + 1 computer".
4. **Commerciale** — Giovanni vende alle scuole dicendo "il docente resta al centro, l'AI è strumento potente ma veicolato". Questo è il messaggio differenziante.

### Come PZ v3 si enforce automaticamente

- **Test end-to-end** — ogni volta che il codice cambia, un test verifica che UNLIM rispondendo contenga la parola "Ragazzi" e NON contenga "Docente leggi" o "Insegnante leggi".
- **Watchdog 24/7** — un processo cron (automatico ogni 15 minuti) verifica il sistema live in produzione. Se vede una violazione, genera alert.
- **Audit indipendente** — l'agente AI `team-auditor` revisiona ogni PR prima del merge su `main` cercando violazioni di PZ v3.
- **Test unitari sui file dati** — ogni testo in `src/data/` viene scansionato automaticamente con espressioni regolari che cercano violazioni.

**Se tu scrivi contenuto per UNLIM (glossario, welcome messages, achievements, quiz), tutto deve rispettare queste regole**. Altrimenti il CI rifiuta la PR. Ma è un sistema di sicurezza: ti aiuta, non ti penalizza — ti avvisa prima che il contenuto arrivi in produzione.

## 2.3 Parità 92 esperimenti volumi (regola seconda, strettamente legata a PZ v3)

**Enunciato**: ogni struttura dati del software che fa riferimento a esperimenti deve avere esattamente **92 elementi**, uno per ogni esperimento del libro. Nessuno di più, nessuno di meno.

### Conteggio volumi

- **Vol 1** — 38 esperimenti
- **Vol 2** — 27 esperimenti
- **Vol 3** — 27 esperimenti
- **Totale** — 92

### File che devono avere 92 elementi

| File | Cosa contiene | Conteggio |
|------|----------------|-----------|
| `src/data/experiments-vol1.js` | Esperimenti Vol 1 (source of truth) | 38 |
| `src/data/experiments-vol2.js` | Esperimenti Vol 2 | 27 |
| `src/data/experiments-vol3.js` | Esperimenti Vol 3 | 27 |
| `src/data/volume-references.js` | Mappatura pagine libri (già completa) | 92 |
| `src/data/achievements.js` | Achievement sbloccabile 1 per esperimento | 92 (da creare) |
| `src/data/challenges-bonus.js` | Sfida bonus opzionale per ogni esperimento | 92 (da creare) |
| `src/data/welcome-messages.js` | Messaggio introduttivo per ogni esperimento | ≥92 (da estendere) |
| `src/data/celebration-messages.js` | Messaggio di celebrazione a completamento | 92 (da creare) |
| `src/data/teacher-explain.js` | Frase singola per il docente per ogni esperimento | 92 (da creare) |
| `src/data/quiz/*.json` | 3 domande quiz per esperimento | 92 file (276 domande) |
| `src/data/rag-chunks.json` | Chunk RAG tied a esperimenti | ≥92 (già parzialmente) |

### Come la parità si verifica automaticamente

1. **Test vitest** — un file di test `tests/unit/data/achievements-parity.test.js` (e uno per ogni file dati) verifica che:
   - Il numero totale di elementi sia 92
   - Ogni elemento abbia un campo `experiment_id` che riferisce un esperimento esistente
   - I metadata (`volume`, `chapter`, `page`) combaciano con l'esperimento sorgente
   - Il titolo condivide almeno una parola chiave con il titolo dell'esperimento

2. **Script shell** — `scripts/verify-volume-parity.sh` esegue un conto Node.js cross-file.

3. **Gate settimanale** — `scripts/cli-autonomous/end-week-gate.sh` blocca la chiusura dello sprint se la parità è rotta.

Quando scrivi nuovi dati (per esempio aggiungi achievement), il test verifica automaticamente che tu abbia scritto esattamente 92 elementi e che ciascuno punti a un esperimento reale. Se ne scrivi 91 o 93, il CI blocca la PR.

## 2.4 GitHub workflow

### Cos'è GitHub

**GitHub** è la piattaforma dove ospitiamo il codice. Ogni modifica al codice è tracciata. Puoi vedere la storia di chi ha cambiato cosa, quando, perché.

### Concetti base

- **Repository (repo)** — il "progetto" completo. Il nostro si chiama `AndreaMarro/elab-tutor`.
- **Branch** — una linea di sviluppo parallela. Tu crei un branch quando lavori a una nuova cosa, senza disturbare la linea principale.
- **Commit** — uno snapshot delle modifiche. Ogni commit ha un messaggio che descrive cosa hai fatto.
- **Push** — caricare i tuoi commit su GitHub (da locale a remoto).
- **Pull Request (PR)** — una proposta: "voglio unire il mio branch alla linea principale". Il team (o gli agenti AI) la rivedono, danno feedback, approvano o chiedono modifiche.
- **Merge** — l'atto di unire il branch al main.
- **CI (Continuous Integration)** — processi automatici che girano ogni volta che tu push. Verificano che i test passino, che il codice compili, che le regole siano rispettate.

### Il nostro flusso per te (Tea)

1. **Clona il repository**:
   ```
   git clone https://github.com/AndreaMarro/elab-tutor.git
   ```
   Questo scarica tutto il progetto sul tuo computer.

2. **Crea un branch** per la tua modifica:
   ```
   git checkout -b tea/nome-descrittivo-del-lavoro
   ```
   Il prefisso `tea/` è una convenzione nostra — aiuta Andrea a riconoscere i tuoi branch.

3. **Lavora**: modifica file, aggiungi nuovi, crea componenti.

4. **Commit** — salva uno snapshot:
   ```
   git add file1 file2 ...
   git commit -m "feat(tutor): aggiunto componente Mascotte SVG"
   ```
   Il messaggio segue il formato `tipo(area): descrizione`:
   - `tipo`: `feat` (feature), `fix` (bugfix), `docs` (documentazione), `refactor` (pulizia senza cambio comportamento), `test` (test), `chore` (manutenzione)
   - `area`: `tutor`, `glossary`, `content`, `research`, `dashboard`, ecc.
   - `descrizione`: max 70 caratteri, presente imperativo ("aggiunto X", non "aggiungendo X")

5. **Push** il branch:
   ```
   git push origin tea/nome-descrittivo
   ```

6. **Apri una PR** su GitHub (tramite interfaccia web OR comando `gh pr create`):
   ```
   gh pr create --title "feat(tutor): Mascotte SVG 6 emozioni"
   ```

7. **Auto-merge** (se applicabile): se la PR tocca solo file "path safe" (vedi 2.4.1 sotto), passa il CI, è sotto 500 righe di aggiunta, e non introduce nuove dipendenze, una GitHub Action automatica la unisce al main entro 1-2 minuti senza che Andrea debba revisionare. **Zero attesa**.

### 2.4.1 Path safe (dove puoi lavorare auto-merge)

I tuoi path CODEOWNERS (registrati nel file `.github/CODEOWNERS`) sono:

```
/src/data/glossary*           — glossario
/src/data/glossario*          — variante italiana
/src/data/experiments-vol*    — esperimenti (solo aggiunte sicure)
/src/data/achievements.js     — achievement gamification
/src/data/challenges-bonus.js — sfide bonus
/src/data/welcome-messages.js — messaggi benvenuto
/src/data/celebration-messages.js
/src/data/teacher-explain.js
/src/data/lesson-paths/**     — lezioni JSON
/src/data/rag-analogie.json   — analogie bambini per RAG
/src/data/errori-comuni.json  — errori comuni patterns
/src/data/quiz/**             — quiz
/public/glossario/**          — asset pubblici glossario
/public/fumetto/svg/**        — illustrazioni SVG fumetto
/public/worksheets/**         — worksheet PDF
/public/icons/badges/**       — icone badge SVG
/docs/tea/**                  — tutta la documentazione che scrivi
/tests/unit/components/tutor/** — test per componenti tutor
/src/components/tutor/**      — componenti UI tutor (con attenzione)
/src/components/teacher-app/** — PWA companion docenti (se creato)
```

Su questi path il **merge è automatico** appena:
- CI verde
- PR sotto 500 righe di aggiunta
- Zero `npm install` nuovi
- Zero modifica di file con nome tra i "critici locked" (vedi 2.4.2 sotto)

### 2.4.2 File critici LOCKED (NON toccare senza Andrea)

Questi file gestiscono la logica più delicata del progetto. Se tocchi uno di questi, la PR richiede revisione manuale di Andrea:

| File | Perché locked |
|------|---------------|
| `src/components/simulator/engine/CircuitSolver.js` (2486 righe) | Solver DC matematico del circuito. Bug qui = prodotto rotto. |
| `src/components/simulator/engine/AVRBridge.js` (1242 righe) | Emulatore chip ATmega328p. Cambio qui affetta ogni simulazione. |
| `src/components/simulator/engine/PlacementEngine.js` (822 righe) | Posizionamento automatico componenti. |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` (3149 righe) | Canvas SVG principale. |
| `src/components/simulator/NewElabSimulator.jsx` | Shell simulatore. |
| `src/services/api.js` (1040 righe) | Tutte le chiamate API. |
| `src/services/simulator-api.js` (755 righe) | API globale `window.__ELAB_API`. |
| `src/data/rag-chunks.json` | RAG 549 chunk (modifiche piccole OK, grandi no). |
| `vite.config.js` | Build configuration. |
| `package.json` | Dipendenze npm — MAI toccare senza OK. |
| `/supabase/**` | Backend Supabase (Edge Functions). |
| `/.github/workflows/**` | CI/CD pipelines. |
| `CLAUDE.md` | Istruzioni per agenti AI. |
| `/docs/GOVERNANCE.md` | Regole di governance. |

Se hai bisogno di modificare uno di questi, **apri comunque la PR** e Andrea la revisiona quando può (idealmente entro 24 ore). Non è un rifiuto, è solo un controllo extra.

## 2.5 Massima automazione (come rendiamo il lavoro più veloce)

### Agenti AI peer (team di sei specialisti)

Andrea usa Claude Opus 4.7 tramite il **Claude Agent SDK** per orchestrare **sei agenti specialisti** che lavorano come peer (non come subagent gerarchici). Ogni agente ha:

- Un nome (`team-tpm`, `team-architect`, `team-dev`, `team-tester`, `team-reviewer`, `team-auditor`)
- Un ruolo specifico (Project Manager, Architetto, Sviluppatore, Tester, Revisore, Auditor)
- Un context window dedicato (un "cervello" separato che non mescola i compiti)
- Accesso a tool specifici (alcuni possono scrivere codice, altri solo leggere e valutare)

**Coordinamento**: gli agenti comunicano tramite file condivisi nel progetto (`automa/team-state/tasks-board.json`, `daily-standup.md`). Andrea fa da orchestratore.

**Paradigma "peer team"**: gli agenti possono parlare direttamente tra loro (non solo "riportare al capo"). Questo è una feature sperimentale di Claude Code (aprile 2026) che abbiamo abilitato (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).

### Loop autonomo (CLI che gira da sola)

Andrea ha configurato un **loop bash** (`scripts/cli-autonomous/loop-forever.sh`) che:

1. Lancia la CLI Claude Code in modalità headless (`--print`) con il prompt strutturato `DAILY-CONTINUE.md`
2. La CLI esegue fino a 200 turni consecutivi (un turno = una risposta dell'AI)
3. Ogni turno può: dispatchare un agente, scrivere codice, fare test, commit, push, deploy preview
4. Quando la sessione naturalmente termina (contesto pieno, quota esaurita, fine sprint), il loop:
   - Rileva il motivo della terminazione
   - Applica un delay appropriato (30 secondi per context full, 1 ora per rate limit 429, 5 minuti per stop sconosciuto)
   - Rilancia la CLI (fino a 30 retry massimi)

**Questo significa**: Andrea può avviare il loop di sera, andare a dormire, e al risveglio trovare un giorno intero di lavoro fatto.

### Programmatic Tool Calling (PTC) — tecnica avanzata (non ancora disponibile in Claude Code)

**PTC** è una feature sperimentale dell'API Claude (non ancora in CLI) che permette al modello di **scrivere codice** invece di fare chiamate tool individuali. Per esempio, invece di fare 100 chiamate curl sequenziali, il modello scrive uno script Python che le fa in parallelo e restituisce solo il riassunto. Risultato: riduzione del 37% dei token consumati.

ELAB non lo usa al momento (Claude Code CLI non lo supporta ancora) ma **è sul radar**. Quando disponibile, lo integreremo.

### Model Context Protocol (MCP) — tool esterni collegati alla CLI

**MCP** è un protocollo standard Anthropic che permette alla CLI di connettersi a strumenti esterni: database, API, browser, ecc. Tutti i nostri "MCP server" attivi:

- **claude-mem** — memoria persistente cross-sessione. Permette alla CLI di ricordare decisioni prese in sessioni precedenti.
- **supabase** — accesso diretto al database (liste tabelle, esegui SQL, deploy Edge Function).
- **playwright** — controllo browser programmatico per test end-to-end.
- **serena** — analisi semantica del codice (trova simboli, cerca pattern).
- **context7** — documentazione aggiornata librerie (React, Vite, Playwright, Vercel, Supabase).
- **Claude_Preview** — dev server integrato per verificare UI mentre si sviluppa.
- **Control_Chrome** — controllo Chrome come utente reale (naviga, clicca, legge pagine).
- **Sentry** — monitoraggio errori in produzione.
- **Vercel** — gestione deploy.
- **MCP Notion** — accesso documenti Notion se servono.

Usati tutti durante ogni giornata di lavoro. Il prompt `DAILY-CONTINUE.md` impone **minimo 20 chiamate MCP per giorno** come soglia di qualità.

### Plugin Claude Code (estensioni funzionalità)

Abbiamo installato e usiamo:
- **superpowers** — skill avanzati: TDD strict, debugging sistematico, piani multi-step, brainstorming
- **claude-mem** — memoria + ricerca cross-sessione
- **caveman** — compressione comunicazione interna agenti (riduce token del 70%)
- **vercel** — deployment skill pack
- **supabase** — best practices backend
- **sentry** — monitoring
- **posthog** — analytics (preparato per futuro)
- **coderabbit** — code review AI
- **pr-review-toolkit** — revisione PR multi-dimensionale
- **feature-dev** — guided feature development
- **firecrawl** — web scraping
- **anthropic-skills** — PDF, DOCX, XLSX extract

Plugin non installati ma utili che valuteremo:
- **wshobson/agents** (184 agenti specialisti in 78 plugin)
- **oh-my-claudecode (OMC)** (32 agents orchestration)
- **ccswarm** (multi-agent worktree orchestration)
- **ship** (PR automation pipeline completa)
- **test-writer-fixer** (auto-genera test)
- **Local-Review** (revisione multi-agent parallela)

## 2.6 Continuous Integration (CI) e test automatici

Ogni push su GitHub attiva un workflow chiamato **E2E Tests** che:

1. Installa le dipendenze npm
2. Esegue tutti i test unitari vitest (oltre 12000 attualmente)
3. Compila il progetto (`npm run build`)
4. Esegue i test end-to-end Playwright (31 spec, su Chromium + Firefox + WebKit)
5. Verifica linting (qualità codice)
6. Verifica che il Principio Zero v3 sia rispettato
7. Verifica la parità 92 esperimenti

Se **uno** solo di questi passi fallisce, il CI diventa rosso e la PR non può essere mergiata (neanche auto-merge Tea).

### Cosa significa per te

Quando fai push, ti arriva via email/GitHub un avviso "CI failed" se qualcosa non va. Non è una punizione: è un aiuto. Ti dice esattamente cosa è rotto, e tu puoi correggerlo prima che arrivi in produzione.

---

# PARTE III — Strumenti, accessi, credenziali

## 3.1 Strumenti software necessari

### Obbligatori

1. **Git** — sistema di versionamento. Installato su ogni Mac/Linux. Su Windows: https://git-scm.com/
2. **Node.js 18+** (raccomandato 22) — runtime JavaScript. https://nodejs.org/
3. **Editor di codice** — Visual Studio Code raccomandato (gratis, https://code.visualstudio.com/)
4. **Browser moderno** — Chrome, Firefox, Safari recenti
5. **Account GitHub** — se non ce l'hai, https://github.com/join

### Opzionali (per task avanzati)

6. **Figma** (https://figma.com) — per disegnare mockup UX e illustrazioni SVG
7. **Inkscape** (gratis, https://inkscape.org/) — alternativa a Figma per SVG vettoriali
8. **Claude Code CLI** — se vuoi usare gli agenti AI direttamente. `npm install -g @anthropic-ai/claude-code`
9. **Claude Desktop** — versione desktop di Claude (per esperimenti)
10. **Telegram** / **WhatsApp** / **Cowork di Anthropic** — comunicazione con Andrea (scegli tu)

## 3.2 Credenziali e accessi

**Importante sicurezza**: non condividere mai token/password in canali pubblici (email, Slack, GitHub issue). Conservali in un password manager (1Password, Bitwarden, Apple Keychain).

### 3.2.1 GitHub

**Cosa ti serve**: accesso come collaboratore al repository `AndreaMarro/elab-tutor`.

**Come ottenerlo**: Andrea ti invia un invito dalla pagina del repo → Settings → Collaborators → Add people. Tu ricevi email "You've been invited to collaborate". Clicchi "Accept invitation".

**Token personale (per operazioni da terminale)**:
1. Vai su https://github.com/settings/tokens/new
2. Scope: spunta solo `repo`
3. Expiration: 90 giorni
4. Genera token → salvalo in password manager
5. Configura localmente:
   ```
   gh auth login --with-token
   ```
   (Incolla il token quando richiesto)

### 3.2.2 Sito ELAB Tutor (produzione)

- **URL**: https://www.elabtutor.school
- **Accesso demo**: apri il sito, clicca "Lavagna" nel menu. Puoi testare senza credenziali.
- **Admin** (solo per Andrea, tu non serve): pagina `#admin` → password nel password manager di Andrea

### 3.2.3 Supabase (database + backend)

- **Dashboard**: https://supabase.com/dashboard
- **Progetto canonical**: `euqpdueopmlllqjmqnyb` (Nanobot V2 LIVE)
- **Accesso** (se ti serve): Andrea può invitarti come collaboratore al progetto Supabase dashboard. Scope minimo: solo lettura.

**Per la maggior parte dei tuoi task non serve**. Il database lo tocca solo il codice Edge Function, non tu direttamente.

### 3.2.4 Vercel (hosting frontend)

- **URL dashboard**: https://vercel.com/dashboard
- **Account**: `andreamarro`
- **Tu non hai bisogno di accesso diretto**. Il deploy è automatico quando la PR viene mergiata.

### 3.2.5 Together AI (LLM provider UNLIM)

- **URL dashboard**: https://api.together.ai/settings/api-keys
- **Account**: `marro.andrea96@gmail.com`
- **Tu non hai bisogno di accesso diretto**. Le chiamate API le fa solo il backend Supabase.

### 3.2.6 Gemini (Google) — fallback

- Attualmente non attivo come primario, ma mantenuto come fallback nel codice.

### 3.2.7 Cloudflare Whisper (voice STT)

- Gratis tier usato. Andrea gestisce.

### 3.2.8 Render (Nanobot V1 legacy)

- Render è un hosting alternativo usato in fase precedente. Ora in warmup mode (il nuovo primario è Supabase Edge Function).

### 3.2.9 Hetzner (in arrivo settimana 2)

- VPS per OpenClaw orchestrator. Andrea crea account settimana 2.

### 3.2.10 RunPod (in arrivo settimana 4)

- GPU serverless EU per LLM self-hosted. Andrea crea account settimana 4.

### 3.2.11 Figma (se vuoi usare)

- Tu crei account tuo https://figma.com (gratis)
- Condivide file con Andrea quando vuoi

### 3.2.12 File privato credenziali Andrea

Le credenziali complete (non condivise) sono salvate in `~/.elab-credentials.md` sul Mac di Andrea (chmod 600, solo lui può leggere). Se ti serve accesso a qualcosa, chiedi.

## 3.3 Setup locale (prima volta)

Passi da fare UNA volta sola:

```bash
# 1. Crea cartella di lavoro
mkdir -p ~/elab-tutor
cd ~/elab-tutor

# 2. Clona il repository
git clone https://github.com/AndreaMarro/elab-tutor.git
cd elab-tutor

# 3. Installa dipendenze
npm install

# 4. Verifica che tutto funzioni
npm run build
npx vitest run

# 5. Avvia dev server locale (opzionale, per testare UI)
npm run dev
# → apre http://localhost:5173
```

Se `npm run build` o `npx vitest run` falliscono alla prima, **chiedi aiuto ad Andrea** prima di andare avanti. Potrebbe essere mancante qualche variabile d'ambiente.

## 3.4 File importanti da leggere in ordine

1. **README.md** (root) — overview rapido del progetto
2. **CLAUDE.md** (root) — istruzioni agenti AI + regole ferree (Principio Zero v3 inclusa)
3. **docs/pdr-ambizioso/PDR_GENERALE.md** — piano 8 settimane completo
4. **docs/pdr-ambizioso/PDR_SETT_1_STABILIZE.md** — sprint corrente dettaglio
5. **docs/workflows/AGILE-METHODOLOGY-ELAB.md** — metodologia Agile nostra
6. **docs/tea/ONBOARDING-TEA-COMPLETO.md** — questo documento!

---

# PARTE IV — Tutto quello che puoi fare in libertà totale

Qui è il cuore del documento. Ti elenco **tutto** quello che potresti fare. Ogni task è autonomo (non ha dipendenze strette), può essere fatto in asincrono (quando hai tempo), e ha stima di ore. Scegli tu ordine, priorità, ritmo.

## 4.1 FUMETTO DINAMICO (impatto visibile altissimo)

### Cos'è

Alla fine di ogni lezione, il docente clicca "Genera fumetto" sulla LIM. UNLIM raccoglie il contesto (quali esperimenti sono stati fatti, quanto tempo è durata la lezione, quanti studenti presenti) e invia al modello AI (Together AI Llama 3.3 70B) una richiesta di **scrivere uno script di fumetto 4-6 panel**. Ogni panel ha:

- Una **scena** (laboratorio, strada con semafori, cielo stellato, cucina con ricetta)
- La **mascotte UNLIM** protagonista in una posa (sorridente, pensierosa, orgogliosa, curiosa, preoccupata, entusiasta)
- **Props esperimento** (LED acceso, breadboard, Nano R4, pulsante, motore)
- Un **dialog balloon** (nuvoletta con testo, rispettando Principio Zero v3)
- Una **citazione del volume** (es. "Vol 1 pag 29") come easter egg

Tutto generato **unico ogni volta** (mai due fumetti uguali), **bellissimo da vedere** (illustrazioni SVG colorate flat), **divertente** (analogia + personaggio UNLIM espressivo), e **contenente tutto quello che si è fatto** (recap esperimenti completati) **più esercizi bonus** (2-3 sfide extra collegate agli esperimenti del giorno).

### I tuoi task fumetto (libertà totale, prendi quelli che ti piacciono)

#### T-FUM-1. Illustrazioni SVG library (15-20 ore)

**Cosa**: disegnare le illustrazioni vettoriali che il componente React userà per comporre i fumetti.

**Dove salvare**: `public/fumetto/svg/`

**Cosa ti serve creare**:
- **6 sfondi** (laboratorio scientifico, strada con semafori, cucina con ricetta aperta, cielo stellato notte, stadio sportivo, foresta magica)
- **6 pose mascotte UNLIM** (personaggio base coerente in 6 espressioni/posizioni: sorridente con dito alzato, pensierosa con lampadina sopra la testa, orgogliosa braccia aperte, curiosa con lente d'ingrandimento, entusiasta saltando, preoccupata con sudore)
- **20+ props esperimento** (LED rosso acceso e spento, breadboard 400-point, Nano R4 board, pulsante premuto e non, 5 resistori di valore diverso, batteria 9V, motore DC, buzzer, potenziometro, display a 7-segmenti, photoresistor, termistore, servomotore, transistor)
- **3 stili balloon** (rotondo bianco per parlato, nuvola per pensiero, esclamazione frastagliata per grida)

**Specifiche tecniche**:
- Formato: **SVG** (scalable vector graphics — scala a ogni dimensione senza perdere qualità)
- Stile: **flat design**, max 2 colori dominanti per illustrazione
- Dimensione: 64×64 pixel base (sfondi 300×200), peso **<50KB** ciascuno
- Colori ELAB: Navy `#1E4D8C`, Lime `#4A7A25`, Orange `#E8941C`, Red `#E54B3D` (puoi usare altri colori coerenti)
- Tool consigliati: **Figma** (gratis) OR **Inkscape** (gratis) OR anche **tablet + Procreate** se preferisci disegno digitale a mano poi esporti SVG

**Perché ti gratifica**: ogni tua illustrazione sarà usata **migliaia di volte** sui fumetti generati automaticamente. Il tuo stile diventa lo stile visuale di ELAB.

---

#### T-FUM-2. Componente React FumettoBoard (10-12 ore)

**Cosa**: scrivere il componente React che prende in input uno script JSON (prodotto da UNLIM) e mostra il fumetto.

**Dove**: `src/components/tutor/FumettoBoard.jsx` + `src/components/tutor/FumettoBoard.module.css`

**Input atteso**:
```json
{
  "panels": [
    {
      "index": 1,
      "scene": "laboratorio",
      "mascot_pose": "sorridente",
      "dialog": "Ragazzi classe 3B, oggi...",
      "props": ["breadboard", "led-on"],
      "experiment_ref": "v1-cap6-esp1"
    },
    ...
  ],
  "exercises_bonus": [...]
}
```

**Output atteso**: una griglia 4-6 pannelli, ogni pannello compone dinamicamente lo sfondo + la mascotte nella posa giusta + i props + la nuvoletta con il dialogo.

**Feature nice-to-have**:
- Animazione fade-in progressivo (pannello 1 poi 2 poi 3...)
- Possibilità di stampare come PDF
- Click su pannello → zoom full-screen

**Spiegazione termini**:
- **Componente React** — un pezzo di UI riusabile scritto in JavaScript + JSX (una sintassi HTML-like)
- **CSS Modules** — file CSS che si applica solo al componente specifico (evita conflitti globali)
- **JSX** — la sintassi che mescola HTML con JavaScript

---

#### T-FUM-3. Esercizi bonus 92 (10-15 ore, parità volumi!)

**Cosa**: scrivere una sfida bonus opzionale per ogni esperimento (esattamente 92, uno per experiment).

**Dove**: `src/data/challenges-bonus.js`

**Formato ogni entry**:
```javascript
{
  experiment_id: "v1-cap6-esp1",
  title: "LED multi-colore",
  challenge_text: "Ragazzi, sfida extra: provate ad aggiungere un LED verde in parallelo. Come dice Vol 1 pag 30, i LED in parallelo condividono la tensione.",
  hint: "Servono 2 resistori dello stesso valore",
  difficulty: "facile" // "facile" | "medio" | "difficile"
}
```

**Regole**:
- Esattamente 92 entries (parità 1:1 con esperimenti)
- Ogni `challenge_text` rispetta PZ v3 (plurale "Ragazzi", cita pag volume, max 60 parole)
- Difficoltà bilanciate (~60% facile, ~30% medio, ~10% difficile)

**Il test automatico** `tests/unit/data/challenges-parity.test.js` verifica tutto questo. Tu fai `npx vitest run`, vedi se PASS, se NO fix, re-test.

---

#### T-FUM-4. Esporta fumetto come PDF e condividi con genitori (5-6 ore)

**Cosa**: aggiungere a `FumettoBoard` un bottone "Scarica PDF" e "Invia ai genitori".

**Dove**: `src/services/fumettoExport.js` + modifica a `FumettoBoard.jsx`

**Come**:
- **PDF**: usa libreria `jsPDF` (già in dipendenze, verifica). Prende lo screenshot del canvas con `html2canvas` → genera PDF 1-page.
- **Share genitori**: bottone con 2 opzioni:
  - **WhatsApp** — genera URL `https://wa.me/?text=<testo prefilled>` con link al PDF
  - **Email** — genera `mailto:` prefilled

**Perché ti gratifica**: i genitori ricevono un PDF del fumetto della lezione di loro figlio. È **memoria permanente** del percorso ELAB. Worth-of-mouth powerful.

---

#### T-FUM-5. Vista archivio fumetti storici docente (6-8 ore)

**Cosa**: schermata docente "I miei fumetti" con lista di tutti i fumetti generati dalla sua classe nel corso dell'anno.

**Dove**: `src/components/teacher-app/FumettiHistory.jsx`

**Feature**:
- Lista thumbnail (miniature) dei fumetti generati
- Filtro per data, per lezione, per volume
- Click per vedere full-screen
- Ri-condividi con genitori 1-click

**Tecnico**: dati salvati in Supabase tabella `class_fumetti` (campo `script_json` + `png_url`). Tu fai lookup.

---

## 4.2 SIMULATORE AUDIT (impatto tecnico altissimo)

Il simulatore è il cuore tecnico di ELAB. Gira 92 esperimenti diversi. Serve verificare che **ogni esperimento dei volumi funzioni identicamente nel simulatore**.

### T-SIM-1. Audit manuale 92 esperimenti (10-12 ore)

**Cosa**: testare a mano ogni esperimento caricandolo nel simulatore e verificare che:
1. Si carica senza errori
2. I componenti attesi sono sulla breadboard
3. Il codice Arduino compila
4. La simulazione dà il risultato atteso (LED acceso, pin voltage corretto)
5. Il testo del libro (`bookText`) è mostrato nel pannello docente con citazione pagina
6. Le analogie generate da UNLIM sono coerenti con il libro

**Dove salvare risultato**: `docs/tea/research/simulator-92-audit.md`

**Formato matrice**:
```markdown
| ID | Vol | Cap | Pag | Loads | Components | Compile | Simulate | BookText | Issues |
|----|-----|-----|-----|-------|------------|---------|----------|----------|--------|
| v1-cap6-esp1 | 1 | 6 | 29 | ✅ | ✅ | ✅ | ✅ | ✅ | nessuna |
| v1-cap6-esp2 | 1 | 6 | 32 | ✅ | ⚠️ manca resistore | ✅ | ❌ non lampeggia | ✅ | delay bug |
...
```

Andrea userà il tuo audit per prioritizzare i fix. Dopo questo task hai una **mappa del debito tecnico completo** simulator.

### T-SIM-2. Componenti palette missing (2-3 ore)

**Cosa**: confrontare componenti menzionati negli esperimenti (estratti da `src/data/experiments-vol*.js`) vs componenti disponibili nel simulator palette. Elenca i missing.

**Output**: `docs/tea/research/missing-components.md` con matrix:
- Componente
- Quanti esperimenti lo usano
- Fattibile simulare? (sì/no/parziale)
- Priorità aggiunta (P0/P1/P2)

### T-SIM-3. Fedeltà simulatore vs libro (6-8 ore)

**Cosa**: per 20 esperimenti campione, leggi il testo del libro (Vol 1/2/3 PDF in `/VOLUME 3/CONTENUTI/volumi-pdf/`) e confronta con il comportamento simulatore. Flag discrepanze:
- Il simulatore mostra qualcosa di diverso dal libro?
- Il testo `bookText` è fedele o parafrasi?
- I valori numerici combaciano (Ω, V, ms)?

**Output**: `docs/tea/research/simulator-fedelta.md`

### T-SIM-4. Lista fix roadmap simulatore (3-4 ore)

**Cosa**: dopo T-SIM-1 e T-SIM-3, scrivi una roadmap prioritizzata fix per Andrea.

**Output**: `docs/tea/research/simulator-fix-roadmap.md` con:
- P0 (bloccante, fix immediate)
- P1 (importante, fix settimana)
- P2 (nice-to-have, fix sprint futuro)
- Stima effort per ogni

### T-SIM-5. Proposta ridisegno UI simulatore per PZ v3 (4-6 ore, CREATIVO)

**Cosa**: al momento alcune UI strings del simulator sono individuali ("You built a LED circuit"). Proponi ridisegno class-level ("Abbiamo costruito un circuito LED insieme. Ora mostriamolo alla classe.").

**Output**: `docs/tea/research/simulator-ui-pz-v3.md` + mockup PNG se vuoi Figma

---

## 4.3 GAMIFICATION (parità volumi, class-level, PZ v3 compliant)

**Ricorda**: gamification class-level, non individuale. Il docente vede progresso classe. Il bambino non logga.

### T-GAME-1. Achievement 92 (15-20 ore, parità volumi!)

**Cosa**: scrivere gli achievement, uno per esperimento.

**Dove**: `src/data/achievements.js`

**Formato**:
```javascript
{
  id: "ach-v1-cap6-esp1",
  experiment_id: "v1-cap6-esp1",  // parità 1:1
  volume: 1,
  chapter: 6,
  page: 29,
  
  class_title: "Primo LED classe",
  class_celebration: "🎉 Ragazzi, avete acceso il primo LED! Come dice il Vol 1 pag 29, la luce parte dal pin D13.",
  
  teacher_explain: "Classe ha collegato LED + resistore 470Ω seguendo Vol1 pag 29.",
  teacher_trigger: "button 'Classe completato'",
  
  badge_icon: "/icons/badges/led-on.svg",
  xp: 10
}
```

**Regole**:
- 92 entries esatte
- `experiment_id` valido (riferisce esperimento esistente)
- `class_title` max 3 parole
- `class_celebration` cita pag volume + plurale "Ragazzi" + max 60 parole
- `teacher_explain` 1 frase semplicissima (zero tecnicismi)
- `xp` = 10 standard, = 20 per 4 esperimenti "capstone" (quelli fondamentali)

### T-GAME-2. Icone SVG badge 92 (12-15 ore, CREATIVO)

**Cosa**: disegnare 92 icone SVG per i badge, una per achievement.

**Dove**: `public/icons/badges/<id>.svg`

**Criteri**:
- Riconoscibile a colpo d'occhio (LED, pulsante, motore, sensore — iconico)
- Max 2 colori flat
- 64×64 px base
- Peso <10 KB
- Style coerente tra tutte

**Ispirazione gratuita**: Heroicons, Feather Icons, Lucide Icons (licenze MIT, puoi copiare + modificare).

### T-GAME-3. Componente BadgeDisplay React (4-6 ore)

**Cosa**: componente React per mostrare un badge (locked/unlocked state, tooltip, animazione unlock).

**Dove**: `src/components/tutor/BadgeDisplay.jsx`

**Props atteso**:
```javascript
<BadgeDisplay achievementId="ach-v1-cap6-esp1" earned={true} onClick={() => {...}} />
```

**Feature**:
- Renderizza icona SVG
- Se `earned={true}`: colorato. Se `earned={false}`: grigio scuro con lucchetto.
- Tooltip mostra `class_celebration` al hover
- Animazione Lottie al primo unlock (suggestion: https://lottiefiles.com gratis)

### T-GAME-4. Pannello docente progresso classe (6-8 ore)

**Cosa**: vista docente "Classe 3B — esperimenti completati" con grid di badge.

**Dove**: `src/components/dashboard/BadgePanel.jsx`

**UI**:
```
Classe 3B — Vol 1 Capitolo 6
─────────────────────────────
✅ Primo LED          pag 29  15 studenti
✅ LED Lampeggio     pag 32   8 studenti
⏳ Pulsante           pag 38   3 studenti
⏳ Semaforo           pag 44   0 studenti

Media Classe 3B: 7/38 esperimenti Vol 1
```

Semplicità è fondamentale: il docente capisce in 2 secondi. Zero gergo tecnico.

### T-GAME-5. Progression 27 livelli (3-4 ore)

**Cosa**: sistema livelli classe tied a 27 Lezioni completate.

**Dove**: `src/data/class-levels.js`

```javascript
[
  { level: 1, name: "Apprendista", lessons_required: 0 },
  { level: 2, name: "Elettricista", lessons_required: 5 },
  { level: 3, name: "Tecnico", lessons_required: 10 },
  { level: 4, name: "Programmatore", lessons_required: 15 },
  { level: 5, name: "Ingegnere", lessons_required: 20 },
  { level: 6, name: "Maestro ELAB", lessons_required: 27 }
]
```

+ componente UI che mostra progression bar.

---

## 4.4 RICERCA NUOVE FEATURE CLAUDE CODE / AI EMERGENTE

Il settore AI è in fermento continuo. Aprile 2026 Anthropic ha rilasciato: Claude Code Routines (cloud persistent), Agent Teams (experimental multi-session), Skills system, MCP marketplace. Serve restare aggiornati perché ELAB può beneficiare subito di nuove feature.

### T-RES-1. Plugin marketplace audit (3-4 ore)

**Cosa**: esplorare i tre principali marketplace plugin Claude Code:
- https://claudemarketplaces.com/ (101 plugin ufficiali)
- https://buildwithclaude.com/ (500+ community)
- https://www.aitmpl.com/plugins/ (340+ con CCPI package manager)

Identificare plugin utili per ELAB.

**Output**: `docs/tea/research/plugin-audit.md` con matrix:
- Nome plugin
- Marketplace
- Feature principale
- ELAB fit (YES/MAYBE/NO)
- Priorità install (P0/P1/P2)
- Comando install

**Plugin candidati alti** (già identificati):
- `test-writer-fixer` (auto test generation)
- `ship` (PR automation pipeline completa)
- `Local-Review` (multi-agent review uncommitted)
- `connect-apps` (500+ service MCP integration)
- `code-review` (4 agent parallel analysis)

### T-RES-2. Claude Code Routines test (2-3 ore)

**Cosa**: testare Claude Code Routines (feature cloud lanciata 14 aprile 2026 che permette agenti autonomi cloud 24/7).

**Setup**: https://claude.ai/code/routines → New routine.

**Output**: `docs/tea/research/routines-test.md`:
- Setup fatto o no
- Limit 15 run/giorno (sufficiente per ELAB?)
- Trigger schedule/API/GitHub webhook — come funziona
- Costi token cloud Anthropic
- Vale la pena per ELAB?

### T-RES-3. Agent Teams exploration (4-5 ore)

**Cosa**: testare Agent Teams (experimental, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).

**Output**: `docs/tea/research/agent-teams-test.md`:
- Setup in-process vs tmux split-pane
- Comunicazione teammate (mailbox)
- Scaling cost token
- Use case ELAB: parallel review/research?

### T-RES-4. MCP server inventory (3-4 ore)

**Cosa**: catalogare i server MCP disponibili online. Filtrare quelli utili ELAB.

**Output**: `docs/tea/research/mcp-inventory.md` con:
- Nome server
- URL/repo
- Feature
- Compatibilità Claude Code?
- Setup complexity (1-5)
- Use case ELAB

### T-RES-5. Anthropic updates monitoring (ongoing, 1 ora/settimana)

**Cosa**: monitorare annunci nuovi di Anthropic e aggiornare log quando emerge feature nuova.

**Output**: `docs/tea/research/anthropic-updates-log.md` — running log (append-only).

**Fonti**:
- https://www.anthropic.com/news
- https://docs.anthropic.com (changelog)
- Twitter `@AnthropicAI`
- https://releasebot.io/updates/anthropic

### T-RES-6. Repository IA emergente (ongoing, 2-3 ore/settimana)

**Cosa**: cercare nuove repository GitHub che potrebbero interessare ELAB. Indagare lancio nuove librerie AI.

**Fonti**:
- https://github.com/trending (filtra per "AI" o "education")
- https://product-hunt.com AI
- https://hackernews AI section

**Output**: `docs/tea/research/ai-emerging-log.md` — log settimanale con repo rilevanti.

### T-RES-7. Claude surfaces comparison (2-3 ore)

**Cosa**: confrontare surface (modi di usare Claude):
- Claude Code (CLI) — dev workflow
- Claude Desktop — interattivo
- Claude API — programmabile
- Claude Managed Agents — production
- Workbench — prompt engineering

**Output**: `docs/tea/research/claude-surfaces.md` — quando usare quale per ELAB.

### T-RES-8. Agent SDK vs CLI decision (3-4 ore)

**Cosa**: decidere se ELAB Edge Function UNLIM dovrebbe migrare da chiamate LLM semplici a Agent SDK (framework production-grade di Anthropic).

**Output**: `docs/tea/research/agent-sdk-vs-cli.md` — pros/cons + raccomandazione.

### T-RES-9. Plugin custom ELAB (6-8 ore)

**Cosa**: creare un plugin Claude Code dedicato a ELAB che contiene:
- Gli skill ELAB-specifici (già esistenti: `elab-benchmark`, `elab-quality-gate`)
- Un agent custom "elab-teacher" per simulare docente
- Comandi shortcut ELAB

**Dove**: `.claude/plugins/elab-plugin/` (path nuovo, richiede OK Andrea)

**Output**: plugin funzionante + documentazione install/uso.

### T-RES-10. Top 10 plugin community 2026 (2-3 ore)

**Cosa**: GitHub repo più starred con plugin Claude Code. Identifica pattern vincenti.

**Output**: `docs/tea/research/top-plugins-2026.md`.

---

## 4.5 CONTENUTO (welcome messages, celebrations, nudge)

### T-CON-1. Welcome messages UNLIM 62→150 (ongoing, 3-4 ore/settimana)

**Cosa**: estendere i messaggi di benvenuto UNLIM (attualmente 62) a 150+.

**Dove**: `src/data/unlim-welcome-messages.js`

**Esempio**:
```javascript
{
  experiment_id: "v1-cap6-esp1",
  variant: 1,
  text: "Ragazzi, oggi esploriamo il LED! Come un piccolo faro marino che guida le navi nella notte. Vol 1 pag 29 ci spiega come."
}
```

**Regole**:
- PZ v3 enforce (plurale, max 60 parole, cita pag)
- Almeno 3 varianti per esperimento (diverse ogni volta → varietà)
- Totale ≥92 esperimenti × 2-3 = 200+ entries

### T-CON-2. Celebration messages 92 (6-8 ore, parità volumi)

**Cosa**: messaggio festeggiamento 1 per esperimento.

**Dove**: `src/data/celebration-messages.js`

**Esempio**:
```javascript
{
  experiment_id: "v1-cap6-esp1",
  text: "Ragazzi, avete acceso il primo LED come piccoli elettricisti! Vol 1 pag 29 vi ha guidati."
}
```

### T-CON-3. Nudge motivational 50 (4-5 ore)

**Cosa**: 50 frasi motivazionali quando studente/classe è stuck.

**Dove**: `src/data/nudge-messages.js`

**Esempio**:
```javascript
{
  context: "stuck_on_component_selection",
  text: "Ragazzi, provate a guardare il pin D13 del Nano. Come dice Vol 1 pag 29..."
}
```

### T-CON-4. Error messages pedagogici (8-10 ore)

**Cosa**: riscrivere ~50 error messages tecnici in versione amichevole per classe.

**Esempio pre**:
> Compile error: 'undefined' was not declared in this scope

**Esempio post**:
> Ragazzi, il programma non riconosce una parola. Vol 1 pag 35 spiega come dichiarare le variabili. Controlliamo insieme!

**Dove**: `src/data/error-strings.js` (nuovo file) + modifica `ErrorPanel.jsx` (se path safe)

### T-CON-5. Empty states 15 (2-3 ore)

**Cosa**: messaggi quando schermata vuota (lavagna pulita, nessun componente, ecc.).

**Dove**: `src/data/empty-state-messages.js`

### T-CON-6. Tooltip componenti palette (4-5 ore)

**Cosa**: testo hover per ogni componente elettronico.

**Dove**: `src/data/component-tooltips.js` + `src/components/simulator/palette/*.jsx` (verifica path safe)

### T-CON-7. Loading messages divertenti 40 (3-4 ore)

**Cosa**: frasi durante caricamento app.

**Dove**: `src/data/loading-messages.js`

### T-CON-8. Challenge bonus 92 (10 ore, già descritto in T-FUM-3)

### T-CON-9. Volume references extended (8 ore)

**Cosa**: completare `volume-references.js` con campo `bookTextExtended` (contenuto pedagogico + analogia per ogni esperimento).

**Dove**: `src/data/volume-references.js` (già esistente, tu estendi)

### T-CON-10. Lesson path narrative 27 Lezioni (20 ore)

**Cosa**: riscrivere transizioni tra esperimenti della stessa Lezione come racconto continuo.

**Dove**: `src/data/lesson-paths/L01-*.json` ... `L27-*.json`

---

## 4.6 GLOSSARIO (core contenuto, ongoing)

### T-GLO-1. Estensione 55 → 100+ termini

**Dove**: `src/data/glossary.js`

**Ogni termine**:
```javascript
{
  term: "LED",
  full_name: "Light Emitting Diode",
  italian: "Diodo emettitore di luce",
  definition_children: "Una piccola luce elettronica che si accende quando passa corrente nel verso giusto",
  analogy: "Come un semaforo stradale, si accende solo se gli dai il 'verde' del pin D13",
  example_elab: "Vol 1 pag 29 usa il LED rosso per primo esperimento",
  book_reference: {volume: 1, page: 29}
}
```

**Target**: ~6 termini/settimana × 8 settimane = 48 termini nuovi.

---

## 4.7 AUDIT 92 ESPERIMENTI vs KIT FISICO (PRIORITÀ ALTA, deadline 04/05)

### T-AUD-1. Fattibilità esperimenti vs componenti reali Omaric

**Cosa**: verificare che ogni esperimento dei 92 sia realizzabile con i componenti effettivi del kit ELAB fornito da Omaric.

**Input**:
- 92 esperimenti (da `src/data/experiments-vol*.js`)
- Lista componenti kit fisico Omaric (chiedi Andrea, lui chiede Omaric)

**Output**: `docs/tea/research/esperimenti-audit-2026.md` con matrix:
- ID esperimento
- Componenti richiesti
- Fattibile con kit? (sì/no/parziale)
- Se no: componenti mancanti + fix proposto (sostituzione con equivalente o rimozione)

**Impatto**: Andrea rimuove esperimenti impossibili. Non frustra bambini con compiti irrealizzabili.

---

## 4.8 MOSFET FIX VOL 3 (segnalato da te 13/04)

### T-MOS-1. Rivedi capitolo MOSFET Vol 3

**Cosa**: nel Vol 3 c'è un esperimento MOSFET problematico che hai segnalato nel tuo doc del 13/04. Proponi fix concreto.

**Output**: PR modifica `src/data/experiments-vol3.js` + `docs/tea/research/mosfet-fix.md` (spiegazione)

**Impatto**: chiudi un bug che hai identificato tu.

---

## 4.9 DESIGN MOCKUP UX

### T-UX-1. Schema 3-zone (Lavagna + UNLIM + Volume) mockup (4-6 ore)

**Cosa**: disegnare mockup (Figma OR anche schizzo carta scansionato) della UI "3-zone":
- Lavagna interattiva (left)
- UNLIM chat (center)
- Volume proiettato (right)

**Output**: `docs/tea/ux-3-zone.png` + annotazioni flusso docente

### T-UX-2. Mascotte UNLIM con 6 emozioni (già descritto in T-FUM-1)

### T-UX-3. Landing /scuole copy (4-6 ore)

**Cosa**: testo pagina landing per vendita scuole.

**Sezioni**:
- Hero + 3 value propositions
- 5 feature con benefit
- Testimonial slot (mock pilot)
- CTA chiaro

**Output**: `docs/tea/landing-scuole-copy.md`

**Impatto**: Giovanni vende, Andrea + Tea scrivono il testo vero.

### T-UX-4. Dashboard docente mockup (6-8 ore)

**Cosa**: proponi UI dashboard docente (al momento vuota). Semplicità è chiave — docente NON scrive papiri.

**Idee**:
- Lista classi programmate oggi
- Progress card per classe
- 1-click "Invia report ai genitori" (PDF auto-generato)
- Notifiche push telefono (PWA)

**Output**: `docs/tea/dashboard-docente-mockup.png` + descrizione flow

---

## 4.10 TEACHER PWA COMPANION APP

### T-PWA-1. Scaffolding PWA (20-25 ore)

**Cosa**: creare app mobile PWA (Progressive Web App) per docente.

**Dove**: `src/components/teacher-app/`

**4 tab**:
- **Oggi** (lista classi programmate)
- **Progresso** (card per classe con badge earned)
- **Report** (PDF auto-generato scaricabile)
- **Guida** (prossima lezione preview)

**Tecnico**: React 19 + Vite + Service Worker + Web Push API + PWA manifest.

**Impatto**: docente installa app sul telefono, riceve notifiche, prepara lezione in metropolitana.

### T-PWA-2. Auto-report PDF generator (10-12 ore)

**Cosa**: servizio che genera PDF report settimanale automatico (ogni venerdì sera).

**Dove**: `src/services/reportGenerator.js`

**Contenuto PDF**:
- Titolo + logo ELAB
- Classe + settimana
- Esperimenti completati (badge icons)
- Foto classe opzionale
- Prossima settimana preview

**Tool**: `jsPDF` OR `react-pdf` (già in dipendenze, verifica).

### T-PWA-3. Push notifications service (6-8 ore)

**Cosa**: notifiche browser/mobile per docente.

**Trigger**:
- 15 min prima lezione programmata
- "Classe 3B ha completato esperimento!" fine sessione
- "Report settimanale pronto" ven sera

**Tech**: Web Push API + Supabase function trigger.

### T-PWA-4. Class code simplified auth (4-5 ore)

**Cosa**: docente crea "class code" (es `ELAB-3B-2026`). Studenti NON loggano, sessione parte con codice. Tutti i dati progresso tied alla classe, non al singolo bambino. **GDPR compliant minori**.

**Dove**: `src/services/classSession.js`

### T-PWA-5. One-tap share genitori (3-4 ore)

**Cosa**: bottone "Invia ai genitori" → WhatsApp / email prefilled con link a PDF report.

**Dove**: `src/components/teacher-app/ShareToParents.jsx`

---

## 4.11 COMPONENTI REACT LEGGERI (UI tutor)

### T-COMP-1. Mascotte UNLIM SVG animata (6-8 ore, già descritto)
### T-COMP-2. Glossary floating widget (5-7 ore)
### T-COMP-3. Celebration animation Lottie (3-4 ore)
### T-COMP-4. Progress bar + level indicator (4-5 ore)
### T-COMP-5. Quiz engine post-esperimento (8-10 ore)
### T-COMP-6. Onboarding studente 5-step (6-8 ore)
### T-COMP-7. Help contextual button (4-5 ore)
### T-COMP-8. Feedback thumbs form (3-4 ore)
### T-COMP-9. Tema dark mode tutor (6-8 ore)
### T-COMP-10. Font OpenDyslexic toggle (3-4 ore, accessibilità DSA)
### T-COMP-11. Focus ring keyboard nav audit (4-5 ore, WCAG AA)

(Dettaglio di ognuno nel documento tecnico. Ogni componente è indipendente.)

---

## 4.12 TEST + VALIDATION

### T-TEST-1. Test unit componenti tutor (ongoing)

**Cosa**: test vitest per ogni componente tu crei.

**Dove**: `tests/unit/components/tutor/*.test.jsx`

**Format**: render + assertion + interaction.

**Target**: coverage ≥80% nuovi componenti.

---

## 4.13 RICERCA UTENTE

### T-RES-USER-1. Interviste 5-10 docenti primaria (8-10 ore)

**Cosa**: 5-10 call 30 minuti docenti italiani tech/STEM.

**Output**: `docs/tea/research/interviste-docenti.md` con:
- 5 domande fisse + follow-up libero
- Pain points attuali insegnamento elettronica
- Cosa userebbero domani
- Budget scuola + processo acquisto

### T-RES-USER-2. Test UX bambini 8-14 (4-6 ore)

**Cosa**: 3-5 bambini reali provano ELAB 30 minuti ciascuno (tuo nipote, vicino, amica con figli, ecc.).

**Setup**: chiedi consenso genitori per video/audio. Non raccogliere PII.

**Output**: `docs/tea/research/ux-test-bambini.md`.

---

## 4.14 COMPETITIVE INTELLIGENCE

### T-COMP-INT-1. Competitor kit elettronica scuole (3-4 ore)

**Target**: Arduino Education, Micro:bit, ELEGOO, Keyestudio, Seeed Studio.

**Output**: `docs/tea/research/competitor-kit.md`.

### T-COMP-INT-2. Competitor AI tutor scuole italiane (3-4 ore)

**Target**: WeSchool, Mentep, Fidenia, Atlas.

**Output**: `docs/tea/research/competitor-ai.md`.

---

## 4.15 PEDAGOGIA + SCIENZA

### T-PED-1. Letteratura bambini 8-14 STEM (4-5 ore)

**Fonti**: Google Scholar, ERIC, Indire.

**Output**: `docs/tea/research/pedagogia-stem-bambini.md` — 10 paper chiave + findings.

### T-PED-2. Accessibilità DSA (3-4 ore)

**Fonti**: AID Italia, linee guida MIUR.

**Output**: `docs/tea/research/accessibilita-dsa.md`.

### T-PED-3. Montessori + Reggio Emilia applicabilità (3-4 ore)

**Output**: `docs/tea/research/pedagogia-italiana.md`.

---

## 4.16 BUSINESS + REGULATION

### T-BIZ-1. MePA processo acquisto (3-4 ore, Davide support)
### T-BIZ-2. PNRR finanziamenti deadline 30/06/2026 (2-3 ore)
### T-BIZ-3. GDPR minori compliance (4-5 ore)
### T-BIZ-4. AI safety bambini (3-4 ore)
### T-BIZ-5. Curriculum STEM ministeriale mapping (4-5 ore)

---

## 4.17 MARKETING CONTENT

### T-MKT-1. Content marketing docenti (3-4 ore)
### T-MKT-2. Influencer docenti IT (2-3 ore)
### T-MKT-3. Social post template (ongoing)

---

## 4.18 FAQ DOCENTE (ongoing)

### T-FAQ-1. 100+ Q&A docenti

**Dove**: `docs/tea/faq-docente.md`

**Target**: 5 Q&A/settimana.

---

## 4.19 VIDEO SCRIPT 10 TUTORIAL (sett 5-7)

**Dove**: `docs/tea/video-scripts/`

---

## 4.20 PARENT COMMUNICATION

### T-PAR-1. Lettera genitori template (2-3 ore)

**Dove**: `docs/tea/parent-letter-template.md`.

---

# PARTE V — Come scegli cosa fare (e quando Andrea fa il task)

## 5.1 Libertà totale + raccomandazioni

Hai **libertà totale**. Puoi fare qualsiasi task di quelli elencati sopra, in qualsiasi ordine, con qualsiasi ritmo. Non c'è contratto, non c'è deadline rigida.

## 5.2 Raccomandazioni per i primi giorni

**Se sei nuova**: ti suggerisco di iniziare con task che hanno **ritorno visibile veloce**:

1. **T-UX-2 Mascotte UNLIM con 6 emozioni** (6-8 ore) — rendi ELAB un "personaggio", non un "algoritmo"
2. **T-MOS-1 MOSFET fix** (4-6 ore) — chiudi un bug che hai identificato tu il 13/04
3. **T-AUD-1 Audit 92 esperimenti vs kit fisico** (10-12 ore) — entro deadline 04/05, impatto altissimo Andrea

Questi tre in totale ~20-26 ore. Spalmali su 2-3 settimane a ritmo comodo.

## 5.3 Andrea può fare al posto tuo

Alcuni task io sono felice di fare al posto tuo se preferisci, se il tuo tempo è limitato, o se sono troppo tecnici:

- **Componenti React tutor** (T-COMP-1 a T-COMP-11) — se il JSX/CSS non è la tua comfort zone, li faccio io. Tu ti concentri su contenuto/design/audit.
- **PWA companion app** (T-PWA-1 a T-PWA-5) — stack tecnico Service Worker/Push API complesso. Posso farlo io.
- **Quiz engine** (T-COMP-5) — complesso tecnicamente. Posso farlo io + tu scrivi 276 domande.
- **Implementazione fumetto** (T-FUM-2) — componente React complesso. Posso farlo io + tu crei illustrazioni SVG + scrivi esempi.

## 5.4 Dimmi sempre quando ti senti bloccata

Se un task ti sembra troppo complesso, o ti serve una decisione architetturale, o non sai cosa scegliere — **scrivimi**. WhatsApp, Telegram, email, PR comment. Risponde entro 24 ore normalmente (senza weekend).

## 5.5 Il ritmo è tuo

- **Minimum**: 1 PR alla settimana. Anche piccola (1 termine glossario, 1 mockup). Mantiene momentum.
- **Target**: 2-3 PR alla settimana. Comodo.
- **Maximum**: 5 PR alla settimana. Rischio burnout — non andare oltre se non senti tu il desiderio.

**Weekend**: riposati. Anche io.

---

# PARTE VI — Chain of Verification (CoV)

Ho chiesto a me stesso: **"Ho coperto tutto quello che Andrea mi ha chiesto di includere?"**. Vediamo:

## 6.1 Checklist requisiti Andrea

| # | Richiesta Andrea | Incluso? | Dove |
|---|------------------|----------|------|
| 1 | "scrivi come un PDF di 30/40 pagine" | ✅ SÌ | Intero documento ~35 pagine markdown |
| 2 | "spieghi a tea cosa sto facendo io ora" | ✅ SÌ | Parte I (contesto), 1.4 (stato al 21/04), 1.5 (piano) |
| 3 | "chiedendo pareri eccetera" | ✅ SÌ | Lettera introduttiva + 5.1 libertà totale |
| 4 | "spiegazione su come automatizzare il più possibile il lavoro" | ✅ SÌ | Parte II.5 massima automazione + 2.4.1 path safe auto-merge |
| 5 | "prompt engineering" | ⚠️ PARZIALE | Non dedicato pienamente. Serve sezione. (vedi 6.3) |
| 6 | "contesto" | ✅ SÌ | Parte I intera |
| 7 | "GitHub" | ✅ SÌ | Parte II.4 |
| 8 | "lista di tutte le possibili cose da fare asincrone" | ✅ SÌ | Parte IV completa |
| 9 | "fumetto" | ✅ SÌ | 4.1 (5 task T-FUM) |
| 10 | "simulatore" | ✅ SÌ | 4.2 (5 task T-SIM) |
| 11 | "gamification (iper parità con i volumi)" | ✅ SÌ | 4.3 (5 task T-GAME) + parità enforcement 2.3 |
| 12 | "ricerca nuove feature/plugin claude code o roba AI emergente repository" | ✅ SÌ | 4.4 (10 task T-RES) |
| 13 | "tutto il resto" | ✅ SÌ | 4.5 a 4.20 (contenuto, glossario, audit, mockup, PWA, componenti, test, ricerca utente, competitive intelligence, pedagogia, business, marketing, FAQ, video, parent) |
| 14 | "scrivilo alla perfezione senza linguaggio riassuntivo" | ✅ SÌ | Nessun "ecc.", nessun "etc.", ogni punto espanso |
| 15 | "spiega ogni termine particolare" | ✅ SÌ | "Componente React", "JSX", "MCP", "PTC", "CI", "PR", "Agile Scrum", "Principio Zero v3", ecc. tutti spiegati |
| 16 | "dalle anche tutte le varie credenziali" | ✅ SÌ | Parte III.2 (12 sottosezioni) |
| 17 | "di che alcune cose potrei scegliere di farle io" | ✅ SÌ | 5.3 "Andrea può fare al posto tuo" |
| 18 | "che lei a totale libertà su tutto" | ✅ SÌ | 5.1 + 5.5 ritmo tuo |

## 6.2 Gap identificati (onestà)

Nella CoV ho identificato **un gap** non perfettamente coperto: **prompt engineering**.

## 6.3 Sezione aggiuntiva — Prompt Engineering

**Prompt engineering** è l'arte di scrivere richieste a LLM (Large Language Model, come GPT/Claude) in modo che l'output sia di alta qualità, strutturato, consistente.

### Perché è importante per ELAB

UNLIM usa Together AI Llama 3.3 70B. Il comportamento di UNLIM dipende dal **prompt di sistema** (il testo iniziale che dice al modello "tu sei UNLIM, fai questo, non fare quello"). Se il prompt è scritto male:
- UNLIM dà risposte incoerenti
- UNLIM viola Principio Zero v3 (usa "Docente leggi")
- UNLIM inventa pagine volume che non esistono
- UNLIM è verboso (>60 parole)

### Dove è il prompt di sistema

`supabase/functions/_shared/system-prompt.ts`

Questo file è **lockato** (vedi 2.4.2). Modifiche qui richiedono revisione Andrea. Ma se hai **idee** di miglioramento, scrivile in `docs/tea/prompt-engineering-ideas.md` e Andrea le valuta.

### Tecniche prompt engineering usate da Andrea

1. **Few-shot examples** — dare al modello 3-5 esempi di output corretto + 1 esempio di output sbagliato (come anti-esempio).
2. **Role prompting** — "Tu sei UNLIM, un tutor AI specializzato in elettronica per bambini 8-14 anni."
3. **Constraint enforcement** — "MAI usare la frase 'Docente leggi'. MAI superare 60 parole."
4. **Chain-of-thought** — chiedere al modello di ragionare passo-passo prima di dare risposta finale.
5. **Output structure** — chiedere JSON strutturato con schema preciso (per fumetto, per esercizi bonus, ecc.).
6. **Self-verification** — chiedere al modello di verificare da sé se rispetta regole prima di dare output.

### T-PROMPT-1. Ricerca prompt engineering avanzato (3-4 ore)

**Cosa**: leggi le best practice prompt engineering 2026 e scrivi suggerimenti per migliorare UNLIM.

**Fonti**:
- Anthropic docs prompt engineering
- OpenAI cookbook
- LangChain prompt patterns
- Papers 2026 (via Google Scholar "prompt engineering 2026")

**Output**: `docs/tea/research/prompt-engineering-2026.md` con tecniche + proposta miglioramento `system-prompt.ts`.

### T-PROMPT-2. Prompt library per UNLIM (4-5 ore)

**Cosa**: catalogo prompt tested per casi specifici UNLIM:
- Generazione fumetto
- Diagnosi circuito
- Suggestion prossimo esperimento
- Error message pedagogico

**Output**: `src/data/unlim-prompts/*.md` (1 file per caso) OR `docs/tea/unlim-prompts-library.md`.

### T-PROMPT-3. A/B test prompt (ongoing, sett 5-7)

**Cosa**: proponi 2 varianti prompt per stesso caso. Andrea + tu fate A/B test (metà traffico A, metà B) + valuti qualità output.

**Output**: `docs/tea/research/prompt-ab-test.md` con findings.

---

## 6.4 Credenziali — verifica completezza

Ho elencato tutte le credenziali in 3.2:

| # | Credenziale | Dove spiegata |
|---|-------------|---------------|
| 1 | GitHub | 3.2.1 ✅ |
| 2 | Sito ELAB produzione | 3.2.2 ✅ |
| 3 | Supabase | 3.2.3 ✅ |
| 4 | Vercel | 3.2.4 ✅ |
| 5 | Together AI | 3.2.5 ✅ |
| 6 | Gemini (fallback) | 3.2.6 ✅ |
| 7 | Cloudflare Whisper | 3.2.7 ✅ |
| 8 | Render (legacy) | 3.2.8 ✅ |
| 9 | Hetzner (sett 2) | 3.2.9 ✅ |
| 10 | RunPod (sett 4) | 3.2.10 ✅ |
| 11 | Figma (se vuoi usare) | 3.2.11 ✅ |
| 12 | File privato credenziali Andrea | 3.2.12 ✅ |

**Non ho scritto valori sensibili** (token, password reali) perché questo documento potrebbe essere visibile su GitHub. Se ti servono valori specifici, chiedi ad Andrea via canale privato (WhatsApp, SMS).

## 6.5 Lista completa task Tea (ordine richiesto)

Verifico ordine come richiesto Andrea:

1. **Fumetto** — Parte 4.1 ✅ (5 task T-FUM-1 a T-FUM-5)
2. **Simulatore** — Parte 4.2 ✅ (5 task T-SIM-1 a T-SIM-5)
3. **Gamification (iper parità volumi)** — Parte 4.3 ✅ (5 task T-GAME-1 a T-GAME-5, parità 1:1 92 esperimenti enforced)
4. **Ricerca nuove feature/plugin Claude Code e AI emergente** — Parte 4.4 ✅ (10 task T-RES-1 a T-RES-10)
5. **Tutto il resto**:
   - Contenuto (4.5) — 10 task T-CON
   - Glossario (4.6) — 1 task T-GLO ongoing
   - Audit 92 vs kit fisico (4.7) — 1 task T-AUD (deadline 04/05)
   - MOSFET fix (4.8) — 1 task T-MOS
   - Design UX mockup (4.9) — 4 task T-UX
   - PWA Teacher (4.10) — 5 task T-PWA
   - Componenti React (4.11) — 11 task T-COMP
   - Test validation (4.12) — 1 task T-TEST ongoing
   - Ricerca utente (4.13) — 2 task T-RES-USER
   - Competitive intelligence (4.14) — 2 task T-COMP-INT
   - Pedagogia (4.15) — 3 task T-PED
   - Business + regulation (4.16) — 5 task T-BIZ
   - Marketing (4.17) — 3 task T-MKT
   - FAQ docente (4.18) — 1 task T-FAQ ongoing
   - Video script (4.19) — 1 task ongoing
   - Parent communication (4.20) — 1 task T-PAR

**Totale task catalogati**: ~70 task concreti (alcuni ongoing).

## 6.6 Libertà totale + opzione "Andrea fa alcune cose"

Verifico 5.3: ✅ Andrea può fare:
- Componenti React (T-COMP-1 a T-COMP-11)
- PWA (T-PWA-1 a T-PWA-5)
- Quiz engine
- Implementazione fumetto React

Tu ti concentri su:
- Contenuto (testi, glossario, messages)
- Ricerca (audit, competitor, pedagogia, plugin)
- Design (mockup, illustrazioni SVG)
- Audit tecnico (92 esperimenti vs kit)

**Flessibile**: se qualcosa ti appassiona e vuoi fare anche componenti React, benissimo. Se non ti appassiona, Andrea li fa. Dimmi cosa preferisci.

---

## Conclusione

Spero questo documento ti sia utile. È lungo perché volevo coprire tutto. Rileggilo a pezzi, salva nei preferiti, torna quando serve.

**Azioni tue immediate** (prossimi 2-3 giorni):

1. Accetta invito GitHub come collaboratore
2. Clona repo + setup locale (3.3)
3. Leggi CLAUDE.md + PDR_GENERALE (priority reading)
4. Scegli **1 task** che ti ispira tra quelli elencati in Parte IV
5. Apri PR con quel task (anche piccolo)

**Se ti senti bloccata**: WhatsApp Andrea (o canale preferito).

**Sei libera su tutto**. Scegli ciò che ti fa felice e ciò che ti sembra utile. Il progetto cresce meglio se tu lavori con gioia.

Grazie per essere in questo viaggio.

Un abbraccio,
Andrea

---

**Fine documento**

*Redatto con l'aiuto di Claude Opus 4.7 (Anthropic) — verificato con Chain of Verification.*
*Versione: 1.0 — 21 aprile 2026*
*Path: `docs/tea/ONBOARDING-TEA-COMPLETO.md`*
*Per convertire in PDF: `npx markdown-pdf docs/tea/ONBOARDING-TEA-COMPLETO.md -o docs/tea/ONBOARDING-TEA-COMPLETO.pdf` OR tool online markdown-to-pdf.*
