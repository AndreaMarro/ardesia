# Ardesia · Microcorsi — GO-LIVE UX01

Landing commerciale statica con quattro percorsi canonici, programmi a richiesta e contatti WhatsApp specifici. La build predefinita è una **preview noindex**. Nessun backend, dipendenza runtime, form, analytics o invio automatico. Il lavoro didattico è in sviluppo e i primi gruppi sono in formazione; le FAQ spiegano le informazioni organizzative da ricevere prima dell’adesione.

## Avvio e verifiche

Dal root del repository, Python 3.10+:

```sh
python3 apps/marketing-01/build.py
python3 apps/marketing-01/serve.py --port 5391
python3 -m unittest discover -s apps/marketing-01/tests -v
```

Per i test browser si usa il Playwright già previsto dal monorepo, senza una nuova dipendenza applicativa:

```sh
npm ci --no-audit --no-fund
npx playwright install --with-deps chromium firefox webkit
MARKETING_ENGINES=chromium,firefox,webkit node apps/marketing-01/tests/browser.mjs
```

Opzioni: `MARKETING_QA_OUTPUT` conserva screenshot/risultati; `ARDESIA_BROWSER` seleziona un eseguibile Chromium locale; `MARKETING_BASE_URL` prova lo stesso artifact in hosting HTTPS invece di avviare un server locale. Il test intercetta la destinazione WhatsApp dopo l’attivazione reale del link: nessun messaggio viene inviato. Copre 12 larghezze, programmi, CTA, tastiera, testo 200%, viewport bassi, reflow, Back/Forward/reload, assenza JS, seconda materia sintetica, asset e 404 annidata. In CI gira nei tre motori. Su WebKit/macOS i passaggi fra link usano Option-Tab, scorciatoia nativa Apple quando la navigazione completa con Tab non è attiva; gli assert di focus restano identici. Nessuna impostazione del computer viene modificata. `tests/subject_fixture.py OUTPUT` genera la seconda materia fuori dal Core.

## Dove si modifica che cosa

| Sorgente | Responsabilità |
|---|---|
| `packages/engine/lessonos/study/content/physics-pathways-v1.json` | ID, titoli, unità e identità canonica; sola lettura |
| `catalog.json` | Materia, prova, anno, pubblico, disponibilità, contatto, fonte del programma e contenuti dei percorsi keyed per ID canonico |
| `page.json` | Copy condiviso, FAQ, metodo, schede docente e recensioni con fonti, dati identificativi |
| `templates/page.html`, `templates/course.html`, `templates/404.html` | Struttura HTML, senza dati scientifici duplicati |
| `components.py` | Componenti HTML piccoli ed escaped, un solo renderer per tutti i percorsi |
| `assets/tokens.css` | Palette, font locali, spaziatura fluida |
| `assets/site.css` | Layout e stati responsive; unità rem, grid auto-fit, container units |
| `assets/site.js` | Selezione, URL, disclosure responsive e visibilità della barra; nessuno storage |
| `security.json` | Policy del server locale e degli header esportati |
| `build.py` | Validazione, rendering, asset con hash, manifest, robots e sitemap |

Nuova materia: aggiungere la sua composizione versionata e un catalogo con dati propri; passarlo a `--catalog`. Il set degli ID editoriali deve coincidere esattamente con la composizione. Non esiste fallback a syllabus o etichette Fisica. Il profilo docente è selezionato con `teacherId`. Una copertina social è opzionale e deve appartenere alla materia corretta; non viene attribuita automaticamente quella di Fisica. Dati futuri come calendario e materiali vanno aggiunti al catalogo e ai componenti quando deliberati, senza duplicare la landing.

## Contratti UX

- Indice → percorso → programma/obiettivi → ritorno ai percorsi. Le disclosure partono chiuse su mobile e aperte da 64rem; una scelta esplicita del visitatore resta invariata dopo il resize.
- `?percorso=ID` conserva la scelta; le ancore identificano le sezioni. Sono supportati link iniziali `#ID`, reload, Back e Forward. Nessun dato personale nell’URL.
- La barra mostra il titolo completo e l’azione per cambiare. Si nasconde quando è visibile il vero bottone di contatto o il footer, con viewport basso, tastiera software osservabile o quando supererebbe il 22% dello spazio leggibile. Lo spazio finale deriva dalla sua altezza effettiva.
- Senza JS restano tutti i quattro contatti diretti, i programmi e le FAQ nativi; nessun selettore apparentemente interattivo ma inattivo.
- La foto è l’asset reale già pubblicato dal docente. Testimonianze e fonti restano quelle documentate in `SOURCES.md`.

## Preview HTTPS e produzione

Hosting scelto: **Render Static Site**, progetto separato `ardesia-golive-ux01-preview`, branch di questo mandato, autodeploy **off**. Nessuna modifica a Studio, Study o altri servizi. Configurazione riproducibile in `deploy/render-preview.yaml`. Il connettore può creare il sito ma non impostare gli header: applicarli dal Blueprint o dalla sezione Headers del solo nuovo servizio e verificarli via HTTP. Nessuna rewrite `/* -> index.html`: deve restare una vera 404.

Su Render: `SKIP_INSTALL_DEPS=true`, build `python3 apps/marketing-01/build.py`, publish `apps/marketing-01/dist`. `RENDER_EXTERNAL_URL`, quando presente, rende assoluto l’Open Graph mantenendo noindex. Per un host diverso:

```sh
python3 apps/marketing-01/build.py --preview-url https://PREVIEW.example/
```

Cloudflare Pages e Netlify leggono `_headers` dalla directory generata. Render richiede regole equivalenti nel suo controllo hosting. Gli asset hanno nomi con hash e cache immutable; HTML e manifest devono rivalidare. Su Render la regola asset precede il catch-all perché vince il primo valore corrispondente; l’ordine è provato sulle risposte reali. Dopo un deploy attendere e verificare il digest: le prime risposte possono ancora appartenere alla versione precedente. `_headers` non deve essere interpretato come prova che il provider abbia già applicato le regole: controllare la risposta reale.

**Pubblicazione di produzione e DNS richiedono autorizzazione di Andrea.** Dopo l’autorizzazione, creare un servizio Static Site di produzione distinto o promuovere consapevolmente la configurazione, scegliere l’URL definitivo e generare:

```sh
python3 apps/marketing-01/build.py --site-url https://DOMINIO-DEFINITIVO/
```

Questa opzione rimuove il noindex HTML, genera canonical, OG assoluto e sitemap. Rimuovere anche l’eventuale `X-Robots-Tag: noindex` dal solo host di produzione. Controllare il numero WhatsApp, tutti i quattro link, privacy, HTTPS, `/404`, route inesistente annidata, favicon, asset/cache e assenza di rewrite SPA. Collegare il dominio solo dopo questo controllo. Nessun deploy di produzione o DNS è eseguito dal presente mandato.

## Rollback

Conservare SHA, ID deploy e `source-manifest.json` prima della pubblicazione. In Render, Deploys → precedente deploy riuscito → Rollback. Il rollback da Dashboard disattiva autodeploy; verificarlo prima di un nuovo push. Il rollback dell’artifact **non** ripristina header, rewrite o domini: confrontarli con `security.json` e il Blueprint e ripristinarli separatamente. Non cambiare gli altri servizi.

Se l’artifact non è più conservato dal provider, eseguire checkout dello SHA approvato in una directory isolata e ricostruire con il medesimo URL; distribuire solo quel pacchetto. L’app non ha database, migrazioni o stato cliente da recuperare. Verificare di nuovo HTTP, manifest e CTA. Non rimuovere la preview finché il candidato di produzione non è stato verificato.

Il confronto fra provider, prezzi e limiti verificati è in `deploy/HOSTING.md`. Le prove REA e visuali complete sono nella consegna esterna al repository, con digest associati all’artifact finale.

## GO-LIVE02 — esercizi editoriali, senza motore quiz

Le quattro dimostrazioni sono proiezioni allowlist dei soli record Q01 originali dei kit `AndreaMarro/ardesia-knowledge`, commit `6d5f0c6124fa3adbcb92b6d19ba5d83669e2c4e8`. `examples/selection.json` conserva i record immutati, origine e SHA del file/record, più una presentazione didattica versionata. I kit integrali, altre domande, PDF e archivi di revisione non entrano in `dist`. Non si importa o esegue il generatore editoriale esterno.

`examples.py` è un renderer di documenti, senza parser matematico, MathJax, database, grading o JavaScript. La notazione Unicode dei passaggi è esplicita e revisionabile. Tre disclosure HTML native separano suggerimento, ragionamento e controllo/errore. Il problema resta visibile; leggere il solo suggerimento non mostra il risultato. Reload riparte con le spiegazioni chiuse. Ogni pagina ha ritorno al programma con `?percorso=ID#ID` e contatto specifico, anche senza JS. Le pagine separate non caricano i contenuti degli esercizi nella prima navigazione della landing.

```sh
python3 apps/marketing-01/build.py --review-examples --preview-url https://ardesia-golive02-preview.onrender.com/
MARKETING_REQUIRE_EXAMPLES=1 MARKETING_ENGINES=chromium,firefox,webkit node apps/marketing-01/tests/browser.mjs
```

Il flag è **solo preview**: con `--site-url` viene rifiutato. In assenza di autorizzazioni la build produzione esclude ogni DRAFT, elimina anche eventuali pagine generate precedentemente e non inserisce link agli esempi. `examples/approvals.json` è vuoto: non è stata registrata un’approvazione umana. Per ammettere un esempio in produzione occorre una decisione esplicita, registrata/versionata con ID, `contentSHA256` dell’intera selezione (record+presentazione+provenienza), revisore scientifico, autore dell’autorizzazione editoriale e riferimento alla decisione. Cambiare il contenuto invalida l’autorizzazione. Il controllo automatico non sostituisce tale decisione né i gate Core/LessonOS, che rimangono invariati.

`deploy/render-preview.yaml` descrive il nuovo sito editoriale separato; `deploy/render-production.yaml` è **solo preparato**, non applicato. Non allegare il dominio alla preview DRAFT. La produzione richiede autorizzazione esplicita anche per DNS e indicizzazione. Dopo l’autorizzazione si può creare `ardesia-fisica` dalla branch/SHA approvata, applicare gli header senza X-Robots-Tag noindex, verificare l’URL Render, poi aggiungere il dominio `fisica.andreamarro.it`. Il valore del CNAME deve essere quello assegnato da Render al servizio di produzione, non quello della preview. Non modificare record apex, `www`, MX o altri servizi. Le interrogazioni DNS di sola lettura del mandato non hanno trovato un record attuale per il sottodominio; l’accesso di scrittura al gestore DNS non è certificato.

Rollback: conservare deployID/SHA precedente e configurazione; scegliere il precedente deploy riuscito nel solo Static Site di produzione, controllare autodeploy off, header/cache/canonical/404/CTA. Se necessario ricostruire lo SHA precedente con lo stesso dominio. Nessuna migrazione dati. Il rollback di un artifact non ripristina DNS/header/domains: verificare separatamente il Blueprint versionato. La preview rimane noindex.
