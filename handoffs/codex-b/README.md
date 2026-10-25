# Codex B — handoff del 25 ottobre 2026

Base verificata `64f6206271b218683f4d45cf953d6ee4b9d5f414`. #304 e #305 MERGED,
nessuna PR aperta all'ingresso, CI main 40231993715 SUCCESS. Non ho eseguito
merge, deploy, modifiche amministrative o chiusure di PR. A è l'integratore.

## Incrementi consegnati e ownership

| Commit B | Cambiamento | Prova locale |
| --- | --- | --- |
| `71fb3c837c6c6ba490dcc5071f2062c9f1877391` | Modelli SI DC a due resistori e onda armonica | 45 RED per moduli mancanti → 45 PASS; baseline 32 PASS |
| `a947cafcb90c26d70ea1e8ef12fbc09ea310ee40` | Renderer presentazionali con tabelle equivalenti | 15 PASS, typecheck PASS |
| `3071128ffc3865d6ff4943200871b62d54f98077` | Rifiuto dati finiti enormi prima della scala SVG | RED 2 FAIL + 15 PASS → 17 PASS |
| `58b03dba379641a62ebb2d7c681fadbc988f40d1` | Rappresentazioni selezionabili, un grafico alla volta | RED 3 FAIL + 14 PASS → 17 PASS, typecheck PASS |
| `a3250f8ded5931ff83191cc6eb0dded1a1b7fb37` | Cinematica analitica 2D, vettori e x-v-a | 17 nuovi Core PASS e 7 UI PASS; combinati Core 62 e UI 24 PASS |

Nessun file di routing, dispatch `activities.py`, catalogo, CI, lockfile, CSS
globale, RUNLOG o NEXT modificato da B. La prima consegna è nel branch
`codex/b-physics-tools-20261025`; il recovery dal commit 3071128f nel branch
`codex/b-tools-local-20261025`, worktree `/private/tmp/ardesia-b-tools-20261025`.
A ha confermato l'importazione dei primi quattro incrementi; verificare il
commit A finale per cinematica e consumer. Nessuna PR B: i commit sono
consegnati alla PR atomica di A, senza stack o PR lasciata aperta.

## Modelli e consumer

| File / API | Contratto | Consumer / stato |
| --- | --- | --- |
| `packages/engine/lessonos/study/electrical.py`, `evaluate_dc_circuit` | `voltage` V firmata, `resistance1/2` Ω positive, `topology` serie/parallelo; corrente, R equivalente, potenza e misure dei rami SI; 9 campioni I-V-P | `ScientificElectricalModel` e nuovo `PublicCoursePlayer` A; `BUNDLED_FIRST_PARTY` |
| `packages/engine/lessonos/study/waves.py`, `evaluate_harmonic_wave` | `speed` m/s, `frequency` Hz, `amplitude` m, `time` s, `phase` rad; λ, T, 65 campioni spaziali e 65 temporali | `ScientificWaveModel` e nuovo player A; `BUNDLED_FIRST_PARTY` |
| `packages/engine/lessonos/study/kinematics.py`, `evaluate_kinematics` | posizione, velocità e accelerazione iniziali 2D; `time`/`duration` s; posizioni/derivate, vettori, rapidità, modulo spostamento e 65 campioni | `ScientificKinematicsModel`; integrazione consumer A da verificare |

I tipi UI sono esportati dai rispettivi componenti. `result=null` nasconde
soluzioni e grafici prima della previsione. La UI esegue soltanto geometria
dei valori forniti. Non legge il wall clock, non sintetizza suono, non usa
microfono, rete o storage proprio. Tempo, reset e salvataggio spettano al
consumer Core; nessun secondo registro. Tutti gli output conservano DRAFT.

Oracoli: 12 V su 4+8 Ω in serie → 1 A/12 W; parallelo → 4,5 A/54 W. Tensione
invertita: correnti invertite, potenze positive. Onda 4 m/s, 2 Hz, A=0,1 m:
λ=2 m, T=0,5 s, y(λ/4,0)=+0,1 m e y(0,T/4)=−0,1 m, fronte verso +x. Cinematica
vx=3, vy=4, ay=−2 a t=2 → x=6 m, y=4 m, vy=0. Inversione vx=6, ax=−2 a t=4:
x=8 m, vx=−2 m/s, modulo spostamento 8 m, distanza percorsa 10 m.

DeepSeek ha fornito controprove indipendenti; ho rieseguito il suo script
contro i file effettivi: 279 controlli PASS, che includono anche verifiche
editoriali e aritmetiche. Non sommarli ai test pytest/vitest e non considerarli
firma umana, efficacia didattica o verifica remota. Il report contiene i digest
dei tre file valutati. Modelli chiusi, nessun nuovo solver numerico/MNA:
il CircuitSolver Studio resta il solver per reti generali.

## Creare e validare una risorsa di esempio

`*.parameters.json` sono esclusivamente oggetti input già accettati dal Core,
non un nuovo manifest, formato di lezione o catalogo. Il piccolo script invoca
le stesse funzioni canoniche. A collega risorse e revisioni al CoursePack.

Comandi eseguiti dal worktree B (Python 3.13 nell'ambiente esistente):

```sh
ARDESIA_PYTHON=/private/tmp/ardesia-r2-20261024/packages/engine/.venv/bin/python
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py --help
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py dc-resistance-v1 handoffs/codex-b/dc.parameters.json --output /private/tmp/ardesia-b-evidence-20261025/dc.resource.json
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py harmonic-wave-v1 handoffs/codex-b/wave.parameters.json --output /private/tmp/ardesia-b-evidence-20261025/wave.resource.json
PYTHONPATH=packages/engine "$ARDESIA_PYTHON" handoffs/codex-b/scientific_resource_example.py kinematics-v1 handoffs/codex-b/kinematics.parameters.json --output /private/tmp/ardesia-b-evidence-20261025/kinematics.resource.json
```

Su un'altra macchina impostare `ARDESIA_PYTHON` a un ambiente del progetto
Python >=3.12; il path `/private/tmp` documenta questo host. Nessun pacchetto
globale o dipendenza nuova installati. Nessuna chiave inclusa nelle risorse.

## Protocollo plugin: giugno riconciliato col codice

| Percorso verificato | Risultato attuale | Limite |
| --- | --- | --- |
| `apps/studio/src/toolhost-protocol/manifest.ts` | schema strict con kind, author, visibility, license, integrità | Il documento di giugno che li dice mancanti è superato |
| `toolhost/authoring/scaffoldPlugin.ts`, `packageFile.ts` | template, firma Ed25519 dev e pacchetto reale, installazione attraverso PluginManager | Il template generico non è automaticamente lo strumento scientifico |
| `toolhost/installer.ts`, `host.ts`, `pluginManager.ts` | verifica installata/mount, lifecycle, revoca e disinstallazione esistenti | Nessun secondo manager introdotto |
| `design/PluginWizard.tsx` | route `?vista=officina-plugin`: creazione, harness e export | Non importa il pacchetto nel nuovo player dei quattro corsi |
| `design/ToolLab.tsx`, `store/toolLabView.ts` | route `?vista=tool-lab`: mount reale del reference blink | iframe browser same origin; origin server distinto richiede shell locale; non chiamarlo sandbox scientifica Vercel |

Quattro spec correnti eseguite: `ToolScaffoldAuthoring`, `PluginPackage`,
`ToolHostMountIfEnabledRecheck`, `ToolInstaller`: 58 PASS. Provano i relativi
percorsi reali di libreria per reference/scaffold. **NOT_RUN:** ciclo completo
di un nuovo plugin scientifico installato, consumato dal corso, aggiornato,
revocato e disinstallato su Vercel, con quaderno preservato. Il gap resta aperto;
non trasformare la fallback `BUNDLED_FIRST_PARTY` in claim `INSTALLABLE`.

## Quattro corsi: residuo esplicito

| Percorso | Incremento B | Residuo che questo handoff NON completa |
| --- | --- | --- |
| strumenti-meccanica, U1/U2 | Cinematica vettoriale; Hooke già presente | Altri obiettivi U1/U2, esercizi/diagnostica/finale, audio, continuità remota e revisione umana |
| fluidi-termodinamica, U3/U5 | Nessun modello fluidi duplicato; gas sviluppato da A | Copertura U3/U5 oltre i casi presenti e tutti i gate di corso |
| elettricita-magnetismo, U6 | Due resistori e potenza | Campi/potenziale, dielettrici, condensatori, magnetismo/induzione e verifica di ogni sotto-obiettivo |
| onde-ottica-radiazioni, U4/U7 | Onda armonica, spazio/tempo | Sovrapposizione, energia/acustica, ottica, fotoni/assorbimento/decadimenti e relativi gate |

La baseline universitaria 2026/27 e il denominatore di copertura sono posseduti
da A/DeepSeek; consultato UniBo corso 568106, riscontro di elettricità/onde e
cinematica coerente. PDF MUR diretto: 403, non attestata uguaglianza dei byte.
Nessuna conversione della banca DRAFT o dei materiali privati in pubblicati.
Non ho osservato Goodnotes nativo: consumo soltanto evidenze DeepSeek quando
ricevute; nessuna cattura Ardesia viene spacciata per osservazione donor.

## Errori, recovery e prove ancora necessarie

Full Web prima dell'ultima UI: 397 PASS, 57 file. Gli ultimi cambi UI hanno
24 PASS mirati e typecheck PASS; full finale/CI/remote sono da riferire alla
head A integrata, non trasferiti automaticamente. Iniziale invocazione vitest
dalla root non trovava test: corretta al cwd `apps/web`, non considerata RED
funzionale. Typecheck/test Studio iniziali sul recovery falliti per file esclusi
dal sparse; incluse le dipendenze sorgenti e ripetuti verdi, senza cambiare
config o indebolire test. RED di aggiunta modulo distinto da test comportamento.

Disco a 1,8 GiB liberi; `.git` in Documents marcato `dataless` e letture bloccate.
Worktree originario conservato; copiati i quattro sorgenti ancora residenti in
worktree sparse `/private/tmp`, nessun reset di lavoro altrui. Prove operative
in `/private/tmp/ardesia-b-evidence-20261025`; consegna utente copiata in outputs.

Review RO segnalata ad A: prompt/feedback statici non devono restare sul vecchio
scenario quando i controlli cambiano grandezze fisiche. A possiede e corregge il
player. Integrazione, screenshot sul consumer, CI, URL/deploymentId finali,
rollback e disposizione PR rimangono ricevute da verificare con A.

### Prossime azioni effettive

1. A importa cinematica e collega l'episodio al consumer; accettazione previsione,
   parametri, grafico, prova diversa e revisione esatta; prova browser + SHA A.
2. QA del player A su 390/820/1440, tastiera e movimento ridotto; correggere prompt
   e feedback coerenti e verificare riapertura con risultato nascosto.
3. Verificare CI e deployment pubblicato da A alla SHA finale; annotare URL,
   deploymentId, limiti e rollback senza dichiarare quattro corsi completi.
4. Continuare la matrice 2026 fino a ogni sotto-obiettivo; un oggetto non copre
   l'intera unità e la firma umana non può essere sostituita dai test.
5. Completare il ciclo plugin scientifico dinamico solo sul consumer e host
   effettivi, preservando le note e usando l'installer già presente.

## Riscontro successivo — consumer reale e review DRAFT

A ha confermato l'importazione di modelli, UI e handoff nella propria head
`82ebdf36aac8b9a0527e605c831b709fc07279e7`. Non è main né una release.
Il fix aggiuntivo B `55dcc3d689db342c11c28c083d939f4d6ad7b413` riduce il numero
di cicli prima di moltiplicare per 2π: al limite accettato f=1 Hz, t=10⁶ s e
A=1000 m, un periodo intero non crea più lo spostamento spurio 2,0145·10⁻⁷ m.
Controprova RED riprodotta, poi **63 test Core PASS**. A lo ha importato come
`ed391243` e deve rigenerare gli artefatti prima della release.

Browser plugin non disponibile; usato Playwright del repository, un solo
Chromium e contesti sequenziali. Build di sviluppo reale servita da A su
`http://127.0.0.1:55481`, quattro percorsi × viewport 390/820/1440:
**12/12 PASS, 138 check registrati**, nessun pageError, HTTP >=400 o warning/error
console. Verificati previsione prima del risultato, DC a18 V →1,5 A, onda
f=4 Hz/v=4 m/s →λ=1 m, prompt coerente, viste da tastiera, zero overflow,
contesto reduced-motion, note e assistenza conservate alla riapertura,
risultato nascosto, collegamento alla revisione e rifiuto di una revisione999.
Sei screenshot reali. Nessun invio contatti, account, pagamento o microfono.

L'entry JS del corso effettivamente testato è
`/esperienza/assets/index-D_bLJhm1.js`, 330365 byte, SHA-256
`0b8d59b08073b1416175102f8fa5552b8b85c477a349b15dc6f74374b541a26e`.
È **candidate-dev2**, non la SHA/CI finale, non Vercel e non include ancora il
consumer della cinematica. Le prove remote/finali restano da eseguire.
Report e script in `browser-dev2-r2/report.json` e `qa-consumer.cjs` nella
cartella evidenze B. Il primo run resta FAIL: 6 PASS e 6 timeout del selettore
`getByLabel(..., exact:true)` perché il testo del label include le option.
Corretto solo l'harness; il secondo run passa. Non cancellare quel risultato
né attribuire la correzione al prodotto.

Review read-only delle spiegazioni, esempi, practice e transfer di **tutte le
38 famiglie**: nessun errore numerico o di segni rilevato nei valori riportati.
Questo è un controllo AI, non approvazione umana né certificazione dei200
sotto-obiettivi. Finding editoriale: practice U1-03, U6-04, U6-05, U7-07,
transfer U5-03 e practice U7-04 richiedevano i dati di esempi chiusi. Aprire un
aiuto per leggere dati indispensabili altera la distinzione autonomia/assistenza.
DeepSeek ha corretto i sei prompt nel commit `2b0f5850`; stato
`FIXED_SOURCE / PENDING_INTEGRATION`, da chiudere sui byte A importati.
Segnalato ad A anche input decimal/maxLength40 per risposte qualitative:
verificare tastiera testuale e spazio adeguato nel consumer protetto.

Le risorse template DC e onda coincidono con gli esatti modelCases compilati
nel consumer A osservato: prova di collegamento dati separata dal browser,
in `resource-consumer-match.json`. Baseline del solo calcolo Python3.13.14,
200 chiamate calde ciascuno: mediane DC0,00325 ms, onda0,023125 ms,
cinematica0,031417 ms; JSON compatti1442/7601/10189 byte. Nessuna inferenza su
latenza UI, smartphone o carico multiutente. Il report indipendente DeepSeek
è stato rieseguito da B dopo il fix fase:279 PASS sui nuovi digest; i suoi
successivi281/292 check sono ricevute distinte, non sommati a questi numeri.

## Review indipendente delle 200 verifiche finali DRAFT

Su richiesta A ho letto tutti i200 `atomicFinalAssessment` nei quattro pack A:
52 meccanica,57 fluidi/termica,33 elettricità e58 onde/ottica/radiazioni.
Ho ricomputato83 risultati numerici con aritmetica standard/Fraction/Decimal,
senza importare i modelli del prodotto, e confrontato da AI testo e unità delle
risposte. Nessun errore aritmetico rilevato. Il report versionato
[`evidence/final-assessment-review.json`](evidence/final-assessment-review.json)
contiene le operazioni, i valori e i digest delle quattro sorgenti osservate.
Non è un nuovo grader automatico, firma umana o certificazione di apprendimento.

Quattro finding di domanda/target, inviati ad A e DeepSeek per chiusura sui
successori effettivi, restano separati dalla correttezza delle formule:

- `U1-01.03`: target ordine di grandezza, domanda arrotondamento a una cifra;
  chiedere una potenza di10 e dichiarare la convenzione.
- `U7-02.07`: target regione gamma nello spettro, domanda A/Z del decadimento;
  verificare collocazione spettrale senza duplicare il diverso target nucleare.
- `U4-01.03`: il ritorno allo stesso stato dopo0,2s può essere multiplo del
  periodo; dichiarare intervallo minimo o accettare esplicitamente nT.
- `U1-03.02`: ripetere i dati del triangolo per permettere quesito atomico e
  riordino senza dipendenza dall'item precedente.

Indipendenza della diagnostica dalla finale, ascolto dei nuovi audio, consumer
cinematico finale, CI e URL remota restano verifiche distinte in carico ad A o
da ripetere sul suo candidato. Non contare200 riferimenti strutturali come200
obiettivi con tutti i criteri soddisfatti.

## Review avversariale del bridge Core e gate editoriale

Review manuale read-only richiesta da A sui nuovi `four_courses.py`,
`course_models.py`, route HTTP, `courseLearning`, `PublicCoursePlayer`,
`CourseLearningWorkspace` e diff `Classroom`/`SubmissionPanel`. Le sorgenti A
erano in modifica; le ricevute fissano i digest osservati, senza dichiarare una
scansione immutabile o certificazione di sicurezza completa.

**P1 riprodotto e corretto localmente:** il nuovo endpoint restituiva sempre
`review=True` anche allo studente; il GET `/study/coursepack` restituiva il raw
pack DRAFT anonimamente se l'edizione era `collecting`. Fixture sintetica
Elettricità: anonimo200 con8lezioni e33 prove finali corredate di risposta;
studente con7lezioni `PRIVATE_EDITORIAL_REVIEW`. Nessuna richiesta remota o dato
reale. Prove in `editorial-anonymous-http-repro.json` e
`editorial-student-repro.json` nella cartella evidence.

A ha applicato la separazione server: il docente proprietario legge i DRAFT,
lo studente riceve una proiezione esplicita degli esempi ammessi. Ho rieseguito
una prova HTTP indipendente: **10 check PASS**, due route × anonimo401,
studente200 limitato, studente revocato401, docente estraneo403, proprietario200
con materiali DRAFT. `editorial-gate-fixed-http.json` lega i risultati ai digest
`four_courses.py b0dafdd6…` e `app.py 47648a53…`. Stato:
`FIXED_SOURCE / LOCAL_HTTP_VERIFIED`; la verifica remota resta distinta. Il
bundle statico pubblico già filtrato non era la superficie della riproduzione.

Altri residui funzionali segnalati ad A per soluzione o perimetro esplicito:

- Il filtro `retryParentId` confrontava il modello di base dell'edizione,
  mentre il nuovo invio usa `commit.activityId`: retry cinematico in un corso
  con base Hooke può perdere il parent, oppure un parent Hooke non compatibile
  produce403. Conservare il gate server e selezionare il modello del retry.
- Le lezioni qualitative senza `modelCases` non emettono un commit di attività:
  il loro testo in revisione non è ancora un percorso consegnabile al Core.
- La ricevuta conserva pack/versione/digest e modello/parametri, ma il nuovo
  commit UI non conserva ancora `lessonRef`/fase come evidenza tipizzata. La
  riproducibilità numerica non equivale al replay semantico esatto dell'episodio.

Nessun secondo ledger proposto e nessuna modifica B ai file condivisi. Questi
residui impediscono claim di quattro corsi completi; i test sulle cinque scene
originali non li cancellano.

## Candidato finale pubblico — verifica locale B

Artefatto A `candidate-final-public`, source commit
`3efea7f9787c5b47b5bad1ce872b6f31c83b1c72`, tracked diff vuoto,
servito da A su `http://127.0.0.1:55483/`: **15/15 scenari browser PASS,
192 controlli**. Quattro corsi ×390/820/1440 più cinematica alle stesse
larghezze. CTA raggiunge #contatto col percorso giusto senza invio;
cinematica x=6 m, v=(3;0) m/s, vista velocità da tastiera, transfer
x₀=5 m/vₓ=−2 m/s/t=4 s →−3 m; quaderni molla/cinematica separati e
risultato nascosto alla riapertura. Nessun pageError, HTTP>=400 o console
warning/error. I sette file B modello/renderer/CSS coincidono per SHA-256
con i sorgenti A osservati. Questa prova include ora la cinematica nel consumer.

Audio: **5/5 scenari PASS,43 controlli**, quattro clip sintetiche diverse,
41,77–45,42 s; label/provenienza/trascrizione per corso, niente autoplay,
play/progresso/pausa/ripresa, fine naturale a8x con reset del pulsante,
chiusura del contesto che mette in pausa. Rete .wav bloccata: messaggio
leggibile, testo conservato e retry abilitato. **Ascolto/qualità umana NOT_RUN**;
nessun evento ended sintetico. Il primo run è FAIL4/5 e conservato:
seekable=[0,0] sul server locale, assegnare currentTime vicino alla fine
riporta a0. Non è stata provata una regressione UI. Ripetuto con playbackRate8;
seek remoto/native controls resta da verificare su Vercel.

PR A #306 su3efea7f ancora OPEN: CI Web418unit/60file PASS,
proiezione checked e11golden PASS; E2E teacher fallisce sul vecchio label
Programmi configurati(2). A aggiorna a6 pack, conserva2edizioni effettive
ed aggiunge6article, senza cambiare i gate. Questo candidato non è ancora
main né la produzione Vercel. Label audio troppo specifico segnalato ad A;
correzione da verificare nella successiva head. I report versionati sono
in evidence; screenshot/script completi nella consegna B. Non trasferire
questi PASS alla prossima build senza confronto degli asset o nuova prova.

Ispezione visuale reale: catture360 (ingresso/modello),390,820e1440 lette;
nessun overflow orizzontale registrato. Report visuale360:4/4PASS, con risorse
JS/CSS e hash scaricati dall'URL effettivo. Sono viewport emulate Chromium
headless su questo MacBook, non prove su telefoni fisici. Il corso ora carica
un chunk separato PublicCoursePlayer; dimensioni/tempi locali nel report,
nessun budget di carico multiutente dedotto.

## Preview Vercel effettive — source05d2bc99

A ha prodotto due preview protette dalla source
`05d2bc9911aff3862906ac5a71769bc726dfbcea`; B ha verificato metadata Vercel
READY/SHA e, separatamente, comportamento browser via accesso ufficiale
fornito da A. Nessun access link, cookie, token, HAR o storageState conservato.
Tutti i browser B sono chiusi; A può revocare gli accessi temporanei.

- Pubblico ammissibile: `dpl_6sdaKh2borKNRb1k4Pwhzh87uU93`,
  https://ardesia-fisica-preview-c3nguujrt-andreas-projects-6d4e9791.vercel.app
  **15/15 PASS,192 controlli**, quattro corsi e cinematica a390/820/1440;
  previsione/parametri/rappresentazioni/CTA/bozze/revisione esatta.
- Audio sullo stesso deployment: **5/5 PASS,47 controlli**, incluse label
  accessibile corretta, play/pausa/ripresa/fine naturale8x/unmount e fallback.
  Vercel espone intervalli seekable completi per le quattro clip, a differenza
  del server locale. Non provato il trascinamento dei controlli nativi;
  ascolto e qualità umana restano NOT_RUN.
- Review editoriale: `dpl_4tSUVdLjeyQpVqY6eNKF9G1abXp7`,
  https://ardesia-fisica-preview-t4tqijqvx-andreas-projects-6d4e9791.vercel.app
  **43/43 lezioni PASS,415 controlli**:5 con modello e38 qualitative.
  Queste38 accettano testo fino a2000 caratteri e mostrano risposta proposta
  DRAFT senza modello o voto automatico; nuovo problema nasconde il feedback.
  Transcript/fallback audio e link di revisione esatti per tutte le43.
  Espansi e contati12 diagnostici e200 finali (52/57/33/58).
  Nessuna approvazione umana o completamento dedotti dalla raggiungibilità.

Nessun pageError, HTTP>=400 o warning/error console nei due percorsi funzionali.
Ispezionata anche una cattura reale della review. Finding P2 residuo: su una
risposta qualitativa senza unità appare «Unità richiesta: .»; comunicato ad A
come miglioramento del testo, distinto dai gate scientifici e di accesso.
Le38 lezioni senza modello restano senza consegna Core automatica; manca inoltre
la provenienza tipizzata lessonRef/fase nella ricevuta del modello, già
segnalata. Restano0/52,0/57,0/33,0/58 accettazioni complete.

Ultime controprove DeepSeek d4d15d1f rieseguite da B contro A: **317 PASS**,
report con hash in evidence/independent-science-final.json. Il precedente279
resta una ricevuta storica distinta, non si somma a317 o pytest/vitest.

Misure browser richieste da A:9 navigazioni,3 contesti nuovi per gruppo,
Chromium headless1440x950/reduced-motion su questo MacBook/rete, senza
throttling. Confronto stesso `/esperienza/?modello=molla` vecchio/nuovo:
mediane TTFB23,9/24,2 ms,DCL159,5/154,9 ms,FCP216/216 ms;
JS compressi78663/79515 byte,CSS14476/14476 byte.
Separata la nuova route `/corsi/strumenti-meccanica/`:
TTFB21,6 ms,DCL163,2 ms,FCP188 ms,JS115711/CSS16040 byte.
Report contiene ogni campione e codifica; nessuna inferenza di capacità,
smartphone, efficacia didattica o risparmio attribuito a REA.

PR #306 ancora OPEN all'osservazione, source05d2: Web e tutti i job ci,
readiness e contratto PASS; marketing ancora IN_PROGRESS. La produzione
restava il deployment precedente8aUF/9fe durante questa QA. A possiede merge,
promozione, RUNLOG/NEXT e prova dell'alias finale. Questi PASS non autorizzano
B a dichiarare la PR integrata o la produzione aggiornata.
