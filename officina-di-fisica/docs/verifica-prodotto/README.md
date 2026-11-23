# Verifiche del prodotto

Il catalogo distribuito comprende **991 oggetti**. L’inventario assegna a ciascun ID versione, corso d’origine, riusi, prerequisiti, risorse e impronta. Una seconda lettura delle edizioni in SQLite ha dato gli stessi ID. Una verifica di presenza riguarda l’oggetto tecnico. L’esito della revisione didattica del docente si registra sulla singola edizione. [Inventario per ID](../inventario-record.csv) · [Copertura del programma](../inventario-copertura.csv)

## Punto di partenza

| Riferimento | Stato osservato | Evidenza |
| --- | --- | --- |
| 1.1.0 e PR 339 | `14fd6504`, 6 corsi, 56 lezioni, 117 esempi, 606 quesiti, 181 simulazioni di voce, 10 banchi, 5 laboratori guidati, 10 attività di metodo | [Tag](https://github.com/AndreaMarro/ardesia/releases/tag/officina-di-fisica-v1.1.0) · [PR 339](https://github.com/AndreaMarro/ardesia/pull/339) |
| PR 340 | Confronto Campo, Passo, Margine e specifica del recupero. Ramo progettuale separato | [Confronto versionato](https://github.com/AndreaMarro/ardesia/tree/abb25af1a5c48a7ebd9b3ad9e0b22fcb3332f5ad/docs/proposte/officina-fisica) |
| PR 341 | Integrata in `f7f4bde8e09ed49b1db12b66017331aefbfa112b`. Riapertura di un tentativo creato sulla release con lo stesso database e sessione, verifica delle aree e 13 job superati sul merge | [Verbale d’integrazione](https://github.com/AndreaMarro/ardesia/pull/341#issuecomment-7102301606) |
| PR 342 | Ricerca trasversale integrata in `f31ef847e4772a59c3ba7a0576a9c14ded0cfefa`. Verificati l’apertura degli otto tipi di materiale, le autorizzazioni, i dati precedenti e i 13 job sul merge | [Verbale d’integrazione](https://github.com/AndreaMarro/ardesia/pull/342#issuecomment-7103658096) |
| Persistenza | 18 tabelle. Migrazioni 001–003. SHA-256 delle coppie ordinate nome/SQL delle tabelle applicative in JSON compatto UTF-8 `ca6397f0c441ec14afd9d04e6e6180bd3bc06dd2d306450e650251dbdb62e0b9` | [Migrazioni nella base](https://github.com/AndreaMarro/ardesia/tree/f7f4bde8e09ed49b1db12b66017331aefbfa112b/officina-di-fisica/migrations) |
| Materiali | Alberi Git `f8029ea5` per `content`, `55aa21de` per `materials`, `13b78d1c` per `migrations` | [Sorgente distribuita](https://github.com/AndreaMarro/ardesia/tree/f7f4bde8e09ed49b1db12b66017331aefbfa112b/officina-di-fisica) |

## Funzioni, autorità e percorsi di prova

I gruppi seguono gli ingressi del prodotto canonico. I file dei test identificano il comportamento da ripetere. Il job e il verbale per SHA riportano l’esecuzione. L’inventario per ID permette di passare da ciascuna funzione ai materiali concreti. [Suite e matrice dei dodici job di laboratorio](../../tests) · [CI della base](https://github.com/AndreaMarro/ardesia/actions/runs/45179591880)

| ID e funzione | Sorgente e contratto | Dati autorevoli | Ingresso studente o autore | Controprova |
| --- | --- | --- | --- | --- |
| NAV · orientamento, studio/esame, indice, simulazioni per voce, fonti | `app.js`, `banchi/catalogo.js`, `domain/catalog.py`, `/api/course`, `/api/simulazioni` | `heads.live → versions` e inclusioni di corso | Inizio, Percorsi, Esame rapido, Simulazioni 3D, fonti | `browser.mjs`, `browser-esperienze.mjs`, R1–R6 della ricerca |
| LET · lettura, esempi, tavole, formule, passaggi, anteprime | `ui.js`, `lettura.js`, `metodo.js`, `attivita-metodo.js`, `/api/item` | edizioni, figure, letture per utente/versione | Lezione, quesito di anteprima, Formule e grafici | `lettura.test.js`, `browser-metodo.mjs`, `check-formulas.cjs` |
| VAL · allenamento, verifica, diagnosi, retest, ripasso e tre fascicoli C6 | `application/study.py`, `domain/assessment.py`, policy esame | `runs`, `run_policies`, `attempts`, versioni fissate | Allenamento, Il mio studio → ripresa, consegna e storico | `test_workflows.py` controlla scadenza, chiavi, voti, concorrenza e tentativi storici |
| APP · osservazioni, famiglie, errori, prerequisiti e recupero | `application/pathways.py`, `domain/pathway.py`, `application/formative.py` | tentativi, `exposed`, `reads`, `lab_events`, bozza privata della sessione | Prerequisiti e prossima attività, Errori e recupero, pista C1-Q027 | `test_architecture.py`, `test_workflows.py` e `browser-recupero-campo.mjs` |
| DIA · diario, diagnosi e ripasso C1–C6 | `application/error_diary.py`, `domain/error_diary.py` e schema `error-diary-v1` | tentativi autorizzati, versioni fissate, aiuti e disponibilità della soluzione | Il mio studio → Diario degli errori, oppure la raccolta del corso | [D1–D6](diario.md), `browser-diario.mjs`, confronto dei 513 casi in `misura_diario.py` |
| SIM · 181 voci, 10 approfondimenti e 5 laboratori guidati | `js/banchi/`, `js/labs.js`, `domain/science.py`, contratto motore v1 | edizione, parametri e modelli, misure, `engine_releases` | Lezione → laboratorio, costruzione, confronto o timeline, previsione e verifica | `esperienze.test.js`, `movimento.test.js`, `banchi.test.js`, matrice C1–C6 |
| ID · registrazione, login, logout, quaderno di prova, ticket autore, riapertura | `web.py`, `domain/identity.py`, `account.js` | `users`, `sessions`, `tickets`, `failures`, `access` | Accedi, Il mio studio, lanciatore autore locale | `test_workflows.py`, `installazione_mac.py`, prove di isolamento Campo |
| ORD · prodotti, ordini, appuntamenti e abilitazioni | `application/orders.py` e `adapters/orders.py` | `orders`, `access`, `audit`, `settings` | Acquisto, amministrazione, Il mio studio | `test_workflows.py` copre conferma, annullamento, duplicati e contesa |
| CMS · importazione, asset, pubblicazione in blocco, ritiro, ripristino | `application/publication.py`, `adapters/publication.py`, `editor.js` | `heads`, `versions`, `assets`, `audit` | Area autore, Edizioni, inventario, figure e fascicoli | `editor.mjs`, `test_method_editions.py`, test lotto/rollback |
| EXT · corsi nuovi, motori verificabili, proposta assistita, MCP | `contracts/`, `adapters/engines.py`, `providers.py`, `editorial_sandbox.py`, `editorial/service.py` | pacchetto e digest del motore, fonti versionate, bozze | Corso dimostrativo installabile, CLI autore e servizio stdio | `platform.test.js`, `browser-architecture.mjs`, `test_architecture.py` |
| OPS · schema, migrazioni, salvataggi, PDF, installazione, pacchetto | `store.py`, `adapters/migrations.py`, `printing.py`, `tools/package_release.py` | SQLite e risorse distribuite | Lanciatori, PDF per percorso e ZIP | `verifica_pdf.py`, `installazione_mac.py` e job di riapertura e riproducibilità |

Il primo incremento introduce la ricerca sui metadati pubblici. L’efficacia didattica dell’intero catalogo, la ritenzione longitudinale e l’utilizzo con tecnologie assistive personali richiedono prove specifiche. [Contratto, prove e limiti della ricerca](ricerca.md) · [Revisione architetturale](../architettura/README.md)

## Decisioni di riuso

La ricerca usa le edizioni già pubblicate e la stessa inclusione transitiva che alimenta i sei corsi. L’indice dei laboratori offre un precedente utile per gli accenti e per le parole parziali. L’indice MCP editoriale lavora invece su citazioni e testi riservati all’autore. Il contratto di ricerca di Ardesia Next riguarda documenti e frammenti del canvas. Importarlo avrebbe richiesto un secondo vocabolario documentale e un’altra gestione dei permessi. L’implementazione usa la libreria standard Python e il router JavaScript esistente. I due repository Ardesia consultati non espongono una licenza generale alla radice. [Contratto documentale di Ardesia Next](https://github.com/AndreaMarro/ardesia-next/blob/26e414777970d1eaddedc7069b78d4a9f6f738f2/packages/contracts/src/search.ts) · [MathComposer e strumenti del progetto canonico](https://github.com/AndreaMarro/ardesia/tree/5cfbdcb055ba3ba136f97fb56e997f06e6cf3605/apps/studio/src)

| Riferimento verificato il 23 novembre 2026 | Uso o decisione nell’incremento |
| --- | --- |
| Taste Skill, MIT. Release 2.5.1 e strumenti per applicazioni presenti nella 2.1.5 | Direzione `workspace`, confronto di schermate e controllo delle misure. I dettagli della revisione visiva sono nel verbale. [2.5.1](https://github.com/Leonxlnx/taste-skill/releases/tag/v2.5.1) · [Sorgente usata per l’inspector](https://github.com/Leonxlnx/taste-skill/tree/12af471f627f866411b4bd785b19646d3672784c) |
| Storybook 10.6.8 MIT e Radix Dialog 1.3.1 MIT | Riferimento per documentare gli stati. Un form nativo, due select e link ordinari mantengono il client senza runtime React. [Storybook](https://github.com/storybookjs/storybook/releases/tag/v10.6.8) · [Radix](https://www.npmjs.com/package/@radix-ui/react-dialog/v/1.3.1) |
| axe-core 4.14.1 MPL-2.0, Playwright 1.65.1 Apache-2.0, Lighthouse CI 0.16.1 Apache-2.0 | Riutilizzati axe 4.14.1 e Playwright 1.60.0 dal lockfile. Il budget HTTP di laboratorio è misurato separatamente dai Web Vitals. [axe](https://github.com/dequelabs/axe-core/releases/tag/v4.14.1) · [Playwright](https://github.com/microsoft/playwright/releases/tag/v1.65.1) · [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci/releases/tag/v0.16.1) |
| Three.js r187 MIT, Ray Optics 5.4.0 Apache-2.0 | Riferimenti per la successiva verifica di geometrie e raggi. La ricerca apre il renderer installato e non carica moduli 3D durante la consultazione dei risultati. [Three.js](https://github.com/mrdoob/three.js/releases/tag/r187) · [Ray Optics](https://github.com/ricktu288/ray-optics/releases/tag/v5.4.0) |
| ts-fsrs 6.0.1 MIT | Riferimento per il ripasso differito. Calibrare un modello richiede eventi longitudinali e una verifica sui richiami. [FSRS](https://github.com/open-spaced-repetition/ts-fsrs/releases/tag/v6.0.1) |

## Continuità del lettore

| ID | Sorgente e contratto | Dati | Ingresso | Prova |
| --- | --- | --- | --- | --- |
| LET | `lettura.js`, `preferenze-lettura.js`, `ascolto.js`, `/v1/me/reading-preferences` | Blocchi dell’edizione pubblicata e preferenze personali nella migrazione 004 | Testo e ascolto nelle lezioni, negli esempi e nelle correzioni formative disponibili | `browser-lettore.mjs` confronta l’ordine delle 173 edizioni, voce, rappresentazioni e ritorno dal banco. `test_workflows.py` controlla concorrenza, isolamento e voti. |

La base di questa modifica è il merge `c0cf5478`. Il diario è stato riaperto su quel commit con 13 job CI superati e un archivio storico. [Verifica del diario integrato](https://github.com/AndreaMarro/ardesia/pull/343#issuecomment-7105498496) · [Contratto e verifiche del lettore](lettura.md)

## Revisione delle edizioni

| Ambito | Sorgente e contratto | Persistenza | Ingresso | Verifiche |
| --- | --- | --- | --- | --- |
| C4 · elettricità e magnetismo | 166 decisioni editoriali, 28 edizioni aggiornate, registro delle impronte delle prime edizioni | Versioni e tentativi fissati, fascicoli del corso | Allenamento individuale, esempi, banco del campo elettrico, esperimento sul raggio, dispensa ed eserciziario | Correttezza di campo e flusso, 24 svolgimenti a 320 px, riconciliazione di chiavi, permessi e dati sulle due edizioni. [Contratto ed evidenze](edizione-c4.md) |
