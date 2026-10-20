# Accesso reale al catalogo REA: revisione dei 48 casi parziali/falliti

Revisione del 20 ottobre 2026, derivata da Evidence REA 6.7.0 e dai relativi DOM, alberi di accessibilità, risposte documentali ed errori. Perimetro: **46 PARTIAL_OR_ACCESS_BLOCKED + 2 ACCESS_ATTEMPT_FAILED** dell’indice originale. Gli altri 91 casi sono trattati nel rapporto complementare `CATALOG-PATTERNS.md`.

**139 tentativi conclusi non equivalgono a 139 applicazioni usate o ricostruite.** Questa revisione non assegna PASS di feature, equivalenza, diritti di riuso o G0. L’indice originale non è stato riscritto.

Il risultato strutturato, con hash e riferimenti puntuali, è `work/rea-research/catalog-access-review.json`. Le 46 Evidence originarie non vuote sono state ricontrollate contro il loro SHA256 nell’indice; per i due timeout i file erano vuoti e non esiste DOM da interpretare.

## Che cosa significava “parziale”

- **44 casi:** DOM e accessibilità finali catturati e completi; la cattura complessiva resta incompleta perché alcune richieste di rete non erano terminate. Non significa né accesso bloccato né comportamento applicativo completo. `equality_eligible=false` delle prove originali rimane invariato.
- **2 casi:** errore del provider prima del DOM, con sola osservazione di rete: ELAB HTTP Basic 401; Andes errore DNS.
- **2 casi:** timeout del processo REA nel batch, senza Evidence utile: Brilliant e Lessonspace. Recuperati con un approccio distinto e limitato a DOM-ready; per Brilliant è stata usata un’alternativa pubblica K–5.
- Tra i 44 DOM completi ci sono **tre pagine di verifica**, non prodotti usabili: Superprof, moodle.org e ACM/Beetle-Grow. Nessun CAPTCHA, accesso HTTP Basic o controllo di sicurezza è stato aggirato.

## Metodo e limiti dei recuperi

Sono state effettuate **24 catture aggiuntive su 15 target**, conservando anche errori, attese e pagine 404. Process exit 0 e completezza della cattura non sono usati come prova di applicazione funzionante.

Ogni scenario usa Node `/opt/homebrew/bin/node`, REA locale 6.7.0 e Chrome headless di proprietà del provider, senza sessioni/account preesistenti. Un punto di partenza vuoto su loopback permette una navigazione successiva con deadline e DOMContentLoaded, invece di attendere indefinitamente tutti i caricamenti. Nessun pagamento, trial, registrazione, contatto commerciale, prenotazione, invito o salvataggio remoto. Sono registrate le sole azioni esplicite del quiz anonimo Weprepuni. Le pagine JupyterLite possono inizializzare il proprio runtime nel browser; non sono stati inseriti o eseguiti comandi/celle dall’agente.

Gli iframe pubblici Numbas, SymPy e Pint sono stati aperti sullo stesso origin usando l’URL incorporato dalla pagina ufficiale. Per Lessonspace è stato controllato anche lo screenshot dopo dieci secondi: whiteboard e strumenti risultano renderizzati, ma l’AX esterno continua a esporre solo l’iframe. Per molab è osservata soltanto l’anteprima esterna in sola lettura. Nei derivati sono rimossi query string e token; le Evidence grezze restano private fuori Git, con permessi 0600.

## Recuperi: superficie osservata e confine

| Target | Osservazione effettiva | Confine della prova |
| --- | --- | --- |
| [TARGET-001 — Brilliant](https://brilliant.org/practice/kindergarten/counting/count-with-fingers-to-5/) | Pagina di un esercizio K–5 con quesito e pulsanti di risposta visibili senza account. | Non sono stati aperti corsi o tutor Koji del prodotto principale; nessuna risposta inviata nella prova K–5. |
| [TARGET-004 — Lessonspace](https://www.thelessonspace.com/demo) | Demo ufficiale caricata: screenshot mostra whiteboard, schede e strumenti del tour. | AX del contenitore mostra soltanto iframe; nessun disegno, invito, video/audio o sincronizzazione multiutente esercitato. |
| [TARGET-044 — Weprepuni](https://weprepuni.com/exams/semestre-filtro) | Selezione di una risposta e verifica: feedback di risposta errata e pulsante per il prossimo quesito osservati. | Un solo quesito verificato; prossimo quesito non premuto, nessuna correttezza disciplinare o progressione completa certificata. |
| [TARGET-047 — Numbas](https://numbas.mathcentre.ac.uk/exam/1973/numbas-website-demo/embed/) | Iframe ufficiale aperto sullo stesso origin: interfaccia esame Numbas e diversi tipi di quesito visibili. | Nessuna risposta valutata né rigenerazione casuale verificata in questo recupero; prove profonde R8 sono separate. |
| [TARGET-054 — Open edX](https://sandbox.openedx.org/) | Sandbox ufficiale studente reindirizza al catalogo pubblico Open edX. | Nessuna registrazione, iscrizione, consegna o console docente; il catalogo non prova il flusso LMS. |
| [TARGET-076 — Tinkercad Circuits](https://www.tinkercad.com/login) | Login Tinkercad con selezione del tipo di account visibile. | Nessun account usato o creato; editor Circuits e simulazione restano non osservati. |
| [TARGET-077 — Wokwi](https://wokwi.com/projects/276825819240727048) | Editor pubblico Wokwi con schede codice/diagramma e controllo di avvio simulazione visibili. | Nessun salvataggio, condivisione, modifica del codice o avvio simulazione. |
| [TARGET-081 — MathLive](https://mathlive.io/mathfield/) | Campo matematico e tastiera virtuale realmente presenti nella documentazione Mathfield. | Nessun round-trip LaTeX, calcolo simbolico o equivalenza del parser verificati. |
| [TARGET-084 — SymPy](https://live.sympy.org/) | Console ufficiale JupyterLite/Pyodide aperta attraverso iframe pubblico same-origin. | Nessun comando utente eseguito; caricamento del motore e correttezza CAS non certificati. |
| [TARGET-085 — Pint](https://pint.readthedocs.io/en/stable/try-in-browser.html) | Notebook ufficiale JupyterLite con celle, kernel Pyodide e barra strumenti visibili. | Nessuna cella eseguita: conversioni dimensionali e risultati non verificati. |
| [TARGET-097 — AFFiNE](https://app.affine.pro) | Applicazione AFFiNE apre un workspace demo senza accesso account. | Nessun nuovo documento modificato, cloud sync o collaborazione verificati; R1 resta il workflow profondo separato. |
| [TARGET-102 — Tana](https://outliner.tana.inc/) | Recuperato il sito Tana Outliner distinto dalla piattaforma meeting presente su tana.inc. | Si tratta ancora di marketing, non di editor/supertag/nodi utilizzati. |
| [TARGET-105 — NotebookLM](https://notebook.google.com/trynow) | Il percorso ufficiale dell’app mostra il pulsante di accesso a Gemini Notebook. | Nessun account Google, notebook, caricamento fonte o risposta fondata osservati. |
| [TARGET-106 — BlockSuite](https://try-blocksuite.vercel.app/starter/?init) | Il Canary Playground collegato dal repository risponde HTTP 404 con pagina di errore Vercel. | Nessun editor BlockSuite osservato; link pubblicato non equivale a demo raggiungibile. |
| [TARGET-114 — marimo](https://molab.marimo.io/notebooks/nb_jJiFFtznAy4BxkrrZA1o9b/app) | Anteprima pubblica molab con titolo notebook e indicazione di sola lettura. | L’app interna è un iframe; nessun Fork, account, modifica o esecuzione. Token effimero dell’embed escluso dai derivati. |

Brilliant K–5 è dichiarato dal [sito ufficiale](https://brilliant.org/practice/) come percorso distinto dal catalogo principale: il recupero non dimostra accesso a Koji o ai corsi autenticati. La [guida ufficiale](https://brilliant.org/practice/guides/free-math-practice-without-an-account/) descrive l’uso senza account. L’esperienza esame Numbas è collegata dalla [homepage ufficiale](https://www.numbas.org.uk/); il suo iframe effettivo è conservato nelle Evidence, senza copiare il contenuto degli esercizi nel prodotto.

## Tutti i 48 target, senza omissioni

Le categorie descrivono la pagina raggiunta. Repository, specifica e documentazione sono fonti consultabili; non sono automaticamente demo dell’applicazione. I link alternativi non seguiti sono marcati come tali nel JSON, compresi i collegamenti a login e trial.

| Target e URL iniziale | Superficie iniziale | Esito e limite specifico |
| --- | --- | --- |
| [TARGET-001 — Brilliant](https://brilliant.org/help/features/) | `NO_INITIAL_CAPTURE` | Timeout del batch: nessun DOM/AX iniziale conservato. Il recupero usa la libreria K–5 pubblica, distinta dal prodotto corsi/Koji. |
| [TARGET-004 — Lessonspace](https://www.thelessonspace.com/features/) | `NO_INITIAL_CAPTURE` | Timeout del batch: nessun DOM/AX iniziale conservato; navigazione limitata a DOM-ready e link demo verificati separatamente. |
| [TARGET-006 — LearnCube](https://www.learncube.com/) | `MARKETING` | Pagina di presentazione aula/lavagna; i pulsanti gratuiti portano alla creazione di un account. Nessuna aula osservata. |
| [TARGET-007 — ClassIn](https://www.classin.com/) | `MARKETING` | Presentazione del prodotto; Request a Demo porta a contatto commerciale, non a una demo anonima. Download e login visibili. |
| [TARGET-009 — Khanmigo](https://www.khanacademy.org/khan-labs) | `MARKETING` | Redirect a khanmigo.ai; pagina promozionale con accesso/registrazione agli strumenti. Nessuna conversazione tutor osservata. |
| [TARGET-022 — TutorCruncher](https://tutorcruncher.com/features/calendar-and-scheduling) | `MARKETING` | Pagina commerciale delle funzioni calendario; login e trial collegati, calendario operativo non osservato. |
| [TARGET-026 — Outschool](https://outschool.com/) | `PUBLIC_MARKETPLACE` | Catalogo pubblico di corsi e ricerca visibile; nessuna iscrizione, acquisto o lezione privata aperta. |
| [TARGET-030 — Up to Ten](https://uptoten.it/) | `MARKETING` | Presentazione di ripetizioni e metodo, contatti e WhatsApp; nessuna applicazione didattica osservata. |
| [TARGET-034 — Superprof](https://www.superprof.it/) | `ACCESS_CHALLENGE` | Documento principale HTTP 403 con iframe di verifica/CAPTCHA. Nessun aggiramento tentato. |
| [TARGET-036 — Testbusters](https://www.testbusters.it/) | `MARKETING` | Presentazione corsi e risorse; simulatori collegati a login/risorse gratuite, non esercitati in questo perimetro. |
| [TARGET-044 — Weprepuni](https://weprepuni.com/exams/semestre-filtro) | `PUBLIC_QUIZ` | Quiz anonimo realmente presente con scelta e verifica; struttura corso, lezione gratuita e diagnostico collegati. Nessun acquisto effettuato. |
| [TARGET-047 — Numbas](https://www.numbas.org.uk/) | `MARKETING_WITH_DEMO_LINKS` | Homepage informativa con quattro demo ufficiali; la demo esame è in un iframe, recuperato separatamente senza credenziali. |
| [TARGET-052 — Moodle](https://moodle.org/) | `ACCESS_CHALLENGE` | moodle.org restituisce verifica CAPTCHA/HTTP 403. Non deduce indisponibilità di Moodle; il workflow pubblico R3 è un insieme di prove distinto. |
| [TARGET-053 — Canvas LMS](https://github.com/instructure/canvas-lms) | `SOURCE_REPOSITORY` | Repository Canvas indicato nel catalogo, README e file pubblici. Non è un LMS avviato né una sessione studente. |
| [TARGET-054 — Open edX](https://openedx.org/) | `MARKETING_WITH_SANDBOX_LINKS` | Sito del progetto e guida sandbox; il collegamento sandbox studente è verificato separatamente senza registrazione. |
| [TARGET-058 — fast-exam / examgen](https://github.com/marty90/fast-exam) | `SOURCE_REPOSITORY` | Repository CLI e campioni di esami/PDF. Nessuna esecuzione del generatore o correzione osservata. |
| [TARGET-076 — Tinkercad Circuits](https://www.tinkercad.com/circuits) | `MARKETING_WITH_LOGIN` | Pagina Circuits di presentazione: avvio rimanda a iscrizione. Login pubblico verificato; nessun account Autodesk creato/usato. |
| [TARGET-077 — Wokwi](https://wokwi.com/) | `PUBLIC_PROJECT_CATALOG` | Homepage con esempi pubblici; recuperato un editor di progetto anonimo. Non premuti Save, Share o Start simulation. |
| [TARGET-079 — ELAB](https://www.elabtutor.school/) | `HTTP_AUTH_REQUIRED` | HTTP 401 con WWW-Authenticate e ERR_INVALID_AUTH_CREDENTIALS prima del DOM. Nessuna credenziale o alternativa di aggiramento provata. |
| [TARGET-081 — MathLive](https://mathlive.io/) | `LIBRARY_DOCUMENTATION` | Homepage documentazione; la pagina Mathfield ufficiale contiene un vero campo matematico anonimo e tastiera virtuale. |
| [TARGET-084 — SymPy](https://www.sympy.org/) | `LIBRARY_HOMEPAGE` | Homepage della libreria con link alla shell ufficiale. Recuperata la console Pyodide nell’iframe pubblico; nessun comando utente eseguito. |
| [TARGET-085 — Pint](https://pint.readthedocs.io/) | `DOCUMENTATION` | Documentazione Pint; il notebook di prova pubblico è un iframe JupyterLite, osservato separatamente senza avviare celle. |
| [TARGET-087 — faster-whisper / pipeline ASR esistente](https://github.com/SYSTRAN/faster-whisper) | `SOURCE_REPOSITORY` | Repository ASR, README/installazione pubblici; nessuna trascrizione né inferenza locale/cloud avviata. |
| [TARGET-090 — BigBlueButton](https://github.com/bigbluebutton/bigbluebutton) | `SOURCE_REPOSITORY` | Repository conferenza online; nessuna riunione, sala o collaborazione multiutente osservata. |
| [TARGET-091 — Lcapy](https://github.com/mph-/lcapy) | `SOURCE_REPOSITORY` | Repository della libreria e link a documentazione/notebook. Non aperti Binder/Colab, non eseguiti calcoli. |
| [TARGET-094 — REA](https://github.com/morluto/rea) | `SOURCE_REPOSITORY` | Repository REA osservato come pagina pubblica. L’uso locale di REA 6.7 per queste catture non certifica tutte le capacità del repository. |
| [TARGET-097 — AFFiNE](https://affine.pro/blog/getting-started-with-affine) | `DOCUMENTATION_GUIDE` | Guida ufficiale a documenti e whiteboard; link applicazione aperto senza account, con workspace demo visibile. Prove R1 profonde separate e non modificate. |
| [TARGET-099 — Heptabase](https://heptabase.com/) | `MARKETING_WITH_TRIAL` | Pagina promozionale; accesso al prodotto e trial di sette giorni richiedono percorso account. Nessun trial iniziato. |
| [TARGET-100 — RemNote](https://www.remnote.com/) | `MARKETING` | Sito prodotto e funzioni dichiarate per note/flashcard/PDF; nessun quaderno o ripasso autenticato osservato. |
| [TARGET-101 — Logseq](https://github.com/logseq/logseq) | `SOURCE_REPOSITORY` | Repository e documentazione pubblici con link app.logseq.com. App non aperta, nessun grafo o block reference esercitato. |
| [TARGET-102 — Tana](https://tana.inc/) | `MARKETING_PRODUCT_SPLIT` | tana.inc descrive ora una piattaforma per riunioni e distingue esplicitamente Tana Outliner. outliner.tana.inc recuperato: marketing dell’outliner, non editor. |
| [TARGET-105 — NotebookLM](https://notebooklm.google/) | `MARKETING_WITH_AUTH_GATE` | Redirect a notebook.google con marchio Gemini Notebook; percorso applicazione mostra pulsante di accesso. Nessun account Google o notebook aperto. |
| [TARGET-106 — BlockSuite](https://github.com/toeverything/blocksuite) | `SOURCE_REPOSITORY` | Repository BlockSuite; il link ufficiale Canary Playground è stato aperto e restituisce HTTP 404. Il repository non prova che la demo sia funzionante. |
| [TARGET-107 — OneNote Class Notebook](https://support.microsoft.com/en-us/education/onenote/use-onenote-class-notebook-in-teams) | `SUPPORT_DOCUMENTATION` | Articolo Microsoft sul Class Notebook in Teams. Nessun tenant, quaderno, iscrizione o permesso Microsoft verificato. |
| [TARGET-109 — Doenet / DoenetML](https://github.com/Doenet/DoenetML) | `SOURCE_REPOSITORY` | Repository DoenetML con link al sito ufficiale. Il rendering interattivo locale R2 è prova separata, non questa visita GitHub. |
| [TARGET-110 — CTAT](https://ctat.pact.cs.cmu.edu/) | `PROJECT_WIKI` | Il vecchio dominio CTAT redirige alla wiki GitHub del progetto. È documentazione, non un tutor interattivo in esecuzione. |
| [TARGET-111 — Andes Physics Tutor](https://www.andestutor.org/) | `DNS_ERROR` | ERR_NAME_NOT_RESOLVED per www.andestutor.org prima della cattura iniziale. Nessuna app attuale verificata; fonti accademiche non equivalgono a demo. |
| [TARGET-113 — Beetle-Grow](https://doi.org/10.1145/2876034.2893403) | `ACCESS_CHALLENGE` | Il DOI rimanda ad ACM con verifica di sicurezza. Crossref conferma titolo Beetle-Grow; solo metadati pubblici recuperati, non testo integrale o applicazione. |
| [TARGET-114 — marimo](https://github.com/marimo-team/marimo) | `SOURCE_REPOSITORY` | Repository marimo con notebook demo collegato; aperta anteprima pubblica in sola lettura. La pagina richiede Fork per modificare/eseguire; nessun fork o account. |
| [TARGET-118 — TanStack Table / Query](https://tanstack.com/) | `DEVELOPER_PRODUCT_CATALOG` | Homepage librerie con collegamenti a Table/Query e prompt di generazione. Nessun prompt inviato e nessuna tabella/cache/query applicativa verificata. |
| [TARGET-120 — Cal.com](https://github.com/calcom/cal.com) | `SOURCE_REPOSITORY_REDIRECT` | Il repository calcom/cal.com redirige a calcom/cal.diy. Non confondere repository e prodotto SaaS; nessuna prenotazione creata. |
| [TARGET-122 — Microsoft Graph Calendar](https://learn.microsoft.com/en-us/graph/api/resources/calendar) | `API_DOCUMENTATION` | Riferimento risorsa calendar Microsoft Graph; nessuna richiesta Graph autenticata, calendario o token acquisito. |
| [TARGET-123 — iCalendar / RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) | `STANDARD_DOCUMENTATION` | Pagina RFC 5545 con testo e aggiornamenti dello standard. Non è un’app calendario e non dimostra interoperabilità iCalendar. |
| [TARGET-126 — xAPI](https://github.com/adlnet/xAPI-Spec) | `STANDARD_REPOSITORY` | Repository della specifica xAPI. Nessun Learning Record Store o statement effettivo inviato/ricevuto. |
| [TARGET-128 — Render](https://render.com/docs/background-workers) | `SERVICE_DOCUMENTATION` | Documentazione background workers Render. Nessuna console, creazione servizio, job o chiamata account/cloud. |
| [TARGET-133 — axe-core](https://github.com/dequelabs/axe-core) | `SOURCE_REPOSITORY` | Repository axe-core; non equivale ad aver eseguito un audit accessibilità su un prodotto. |
| [TARGET-137 — LlamaIndex](https://docs.llamaindex.ai/) | `FRAMEWORK_DOCUMENTATION` | Redirect della documentazione a developers.llamaindex.ai/python/framework. Nessuna pipeline RAG, chiave o inferenza eseguita. |
| [TARGET-138 — Graphiti](https://github.com/getzep/graphiti) | `SOURCE_REPOSITORY` | Repository Graphiti e immagini dimostrative. Nessun grafo temporale, ingestione o chiamata LLM eseguita. |

## Identità, accessi e fonti da non confondere

- **Tana:** `tana.inc` descrive una piattaforma di riunioni; il sito stesso distingue [Tana Outliner](https://outliner.tana.inc/). Anche l’alternativa recuperata è una pagina promozionale, non una prova di nodi o supertag.
- **Cal.com:** l’URL GitHub del catalogo redirige a [calcom/cal.diy](https://github.com/calcom/cal.diy). Non si attribuiscono automaticamente tutte le funzioni del SaaS al repository o viceversa.
- **NotebookLM:** l’entry osservata redirige a `notebook.google` e il percorso app a `notebook.google.com/trynow`, con marchio Gemini Notebook e pulsante di accesso. Nessun notebook o accesso a fonti private è stato osservato.
- **Beetle-Grow:** i [metadati Crossref del DOI](https://api.crossref.org/works/10.1145/2876034.2893403) confermano il titolo. Il CAPTCHA ACM resta un limite: non sono stati ottenuti testo integrale o demo del tutor.
- **ELAB:** il 401 Basic precede la cattura di UI. **Andes:** la risoluzione DNS fallisce. Nessuno dei due risultati prova che il prodotto non esista, né autorizza a inventarne le funzionalità.
- **BlockSuite:** il link Canary pubblicato nel repository porta a una pagina 404. La presenza del link non basta a classificare la demo come disponibile.

Le prove profonde preesistenti R1, R2, R3 e R8 non sono state mutate né sostituite da queste osservazioni. Tutto ciò che richiede account, sessioni multiutente, persistenza, esecuzione di codice, sincronizzazione, simulazione o verifica disciplinare resta esplicitamente fuori dalla prova di accesso, salvo le azioni registrate e limitate sopra.

Nessun codice, asset o contenuto didattico dei target è stato integrato in ARDESIA da questa revisione. Accessibilità pubblica e licenza di riuso sono valutazioni distinte.
