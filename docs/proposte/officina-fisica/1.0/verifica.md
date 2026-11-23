# Collaudo del dossier 1.0

Prove raccolte il 23 novembre 2026 su Mac arm64, macOS 26.0.1. Il walkthrough iniziale ha usato il browser integrato di Codex sulla 1.1.0. Nel confronto interattivo è stato verificato anche il passaggio dal grafico di Campo alla tabella con gli stessi dati. Playwright ha poi ripetuto i flussi su archivi temporanei e sul file HTML autonomo. I test di progetto usano le dipendenze già bloccate nel package dell’Officina.

| Riscontro | Risultato | Fonte |
| --- | --- | --- |
| Percorsi completi | 3 concept × Chromium 148.0.7778.96 e WebKit 26.4 × 4 formati = **24 completamenti**. Formati 1440×900, 768×1024, 390×844 e 320×740. | [Esiti per caso](prove/esiti.json) |
| Interazioni | Invio vuoto, segno errato, correzione, trasferimento a −2 m, reload con ripresa e riavvio. Campo include estremi, tabella, camera, +12 m all’inversione, +2 m finali e ritorno esatto a 6 s. Margine controlla la fonte e la prima riga errata. | [Test E2E](verifica/collaudo.mjs) |
| Correttezza | **153 campioni** a intervalli di mezzo secondo, su tutte le nove durate da 0 a 8 s. Posizione e distanza confrontate con integrazione separata. C1-Q027 v2 conserva il risultato canonico +2 m. | [Modello usato](prototipi/moto.js) · [Test indipendente](verifica/collaudo.mjs) |
| Accessibilità | **72 scansioni axe-core 4.14.1**, 0 violazioni automatiche nei tag WCAG A/AA fino a 2.2. In 56 scansioni compare `color-contrast` tra le verifiche incomplete, in 16 anche `label-content-name-mismatch`. | [Risultati completi per stato](prove/esiti.json) |
| Leggibilità | Nelle tre schermate d’ingresso, inchiostro su superficie ≥12,37:1, testo sui pulsanti primari ≥9,76:1. Focus su superficie ≥7,78:1. Grandezze HTML raddoppiate a viewport 640 senza taglio dei titoli o comandi campionati. Spaziatura aumentata a 320 px senza scorrimento orizzontale. | [Rapporti e riflusso](prove/leggibilita.json) · [Procedura](verifica/leggibilita.mjs) |
| Accesso offline | Il test apre il file da disco. Nessuna richiesta HTTP(S) e nessun errore console/eccezione del prototipo nei 24 percorsi. Chromium usa anche il flag offline; WebKit blocca per regola ogni richiesta HTTP(S), perché il flag blocca la navigazione iniziale anche per `file://`. | [Test sul file autonomo](verifica/collaudo.mjs) |
| Carta | Chromium stampa un foglio A4. Il testo estratto contiene andata, ritorno, spostamento, controllo, «C1-Q027 · v2» e i dati del moto. | [Stampa di prova](prove/scheda-margine.pdf) |
| Regressione della baseline | La suite browser canonica ha completato copertina, catalogo, C1, C6, risposte, ripresa, ordine di verifica, editor e 13 PDF. Al primo passaggio locale ha superato il limite di 30 s sulla tabella «Edizioni PDF». Il secondo passaggio integrale con lo stesso comando e una nuova base temporanea è riuscito. La causa del timeout resta aperta. | [Suite invariata](../../../../officina-di-fisica/tests/browser.mjs) · [Esecuzione ufficiale precedente della release](https://github.com/AndreaMarro/ardesia/actions/runs/45088253425) |

Su WebKit/macOS il test usa Opzione–Tab per raggiungere il primo collegamento con la configurazione di navigazione predefinita. Invio porta il focus a `main`. Il pulsante primario dei tre concept rientra completamente nel primo schermo in tutti i 24 ingressi. A 320×740 il bordo inferiore cade rispettivamente a 645, 664–665 e 729 px. I test comprendono il controllo successivo all’errore, l’apertura dei dettagli, i due estremi del selettore e il ritorno alla scelta. Le simulazioni di dispositivo coprono il viewport e la modalità touch. Restano da osservare un telefono reale, un lettore di schermo usato da una persona e l’esito pedagogico a distanza. L’assenza di errori automatici è circoscritta al campione e al motore di regole. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Galleria

| Superficie | Desktop | Mobile |
| --- | --- | --- |
| Home canonica | [Apri](prove/baseline-home-desktop.webp) | [Apri](prove/baseline-home-mobile.webp) |
| Ingresso C1 canonico | [Apri](prove/baseline-c1-desktop.webp) | [Apri](prove/baseline-c1-mobile.webp) |
| Catalogo laboratori C1 | [Apri](prove/baseline-laboratori-desktop.webp) | [Apri](prove/baseline-laboratori-mobile.webp) |
| Selettore dei prototipi | [Apri](prove/confronto-desktop.webp) | [Apri](prove/confronto-mobile.webp) |
| Passo, previsione | [Apri](prove/passo-desktop.webp) | [Apri](prove/passo-mobile.webp) |
| Passo, correzione | [Apri](prove/passo-controllo-desktop.webp) | [Apri](prove/passo-controllo-mobile.webp) |
| Campo, banco | [Apri](prove/campo-desktop.webp) | [Apri](prove/campo-mobile.webp) |
| Campo, pista spaziale | [Apri](prove/campo-pista-desktop.webp) | [Apri](prove/campo-pista-mobile.webp) |
| Margine, quaderno | [Apri](prove/margine-desktop.webp) | [Apri](prove/margine-mobile.webp) |
| Margine, correzione del ritorno | [Apri](prove/margine-errore-desktop.webp) | [Apri](prove/margine-errore-mobile.webp) |

## Taste Skill e revisione visiva

È stato usato il percorso **app screens** della versione 2.1.5 documentata sul sito indicato dal committente, fissata al commit `12af471f627f866411b4bd785b19646d3672784c`. La modalità `draw.mjs --app` ha proposto le direzioni compatibili con il compito. Le tavole di riferimento stabilivano palette e tipografia, quindi il comando ha mantenuto quei due elementi. Il test `inspect.mjs --app` ha esaminato la pagina C1 e i tre ingressi su Chromium a 1440, 768 e 390 px. Nessuna regola è stata disabilitata. [Sito indicato](https://www.tasteskill.dev/) · [Documentazione](https://www.tasteskill.dev/docs) · [Versione del metodo](https://github.com/Leonxlnx/taste-skill/tree/12af471f627f866411b4bd785b19646d3672784c/skills/taste-skill)

| Superficie | Direzione scelta | Esito finale di Taste Skill | Giudizio di progetto |
| --- | --- | --- | --- |
| C1 canonica | Baseline | 1 FAIL stilistico, 8 WARN | Il FAIL riguarda il viola della marca. Non implica una violazione WCAG. Restano pertinenti alla discovery il margine mobile e l’azione rapida parzialmente sotto la piega. |
| Passo | Editorial greeting, seed 927 | 0 FAIL, 1 WARN | Titolo oltre la dimensione preferita dal profilo dashboard. La domanda è il compito della schermata; il comando entra nei quattro formati. |
| Campo | Data terminal, seed 928 | 0 FAIL, 1 WARN | Rimane l’avviso sul titolo. Nel primo giro comparivano anche bordi e disallineamento a 768 px. Il secondo layout mette la console sotto il grafico a questa larghezza e attenua il bordo dei pannelli. |
| Margine | Framed sheet, seed 929 | 0 FAIL, 2 WARN | Titolo editoriale e fondo carta caldo sono scelte di confronto. Conservano leggibilità misurata e riconoscibilità da sottoporre agli studenti. |

Le tavole ImageGen affiancano desktop e telefono su immagini 1536×1024. La verifica ha confrontato marchio, testo del primo schermo, ordine di lettura, tipo, palette, leggibilità degli assi, ritmo dei campi e posizione dell’azione primaria con i rendering. Le differenze intenzionali comprendono la scala fissa fino a 12 s di Campo per confrontare durate diverse, i valori dei controlli realmente azionabili, il titolo di Campo più contenuto della tavola e i tratteggi orientati diversamente sulle due aree. È stata mantenuta la formulazione dei comandi principali. Le quantità e le unità restano sulla stessa riga. La proiezione scientifica è calcolata dal modello; l’immagine generata serve all’art direction. [Brief e riferimenti](riferimenti/brief.md) · [Rilievi Taste Skill](prove/taste.json) · [Tre rendering mobile](prove/tre-concept-mobile.webp)

## Ripetere le prove

Dal root di un checkout del ramo di progettazione, con Python 3 e Node 22 o compatibile:

```sh
npm ci --prefix officina-di-fisica
(cd officina-di-fisica && npx playwright install chromium webkit)
cd docs/proposte/officina-fisica/1.0
python3 prototipi/costruisci.py --check
python3 verifica/decisione.py
node verifica/navigazione.mjs
node verifica/collaudo.mjs
node verifica/leggibilita.mjs
```

Il comando di navigazione crea e rimuove un archivio temporaneo. I tre programmi di verifica accettano come ultimo argomento una directory dove conservare le prove. In un worktree senza dipendenze installate, `OFFICINA_DEPS` può puntare alla cartella prodotto di un checkout con il medesimo lockfile. Per servire il confronto in locale dalla cartella del dossier usare `python3 -m http.server 8860 --bind 127.0.0.1` e aprire `/confronto.html`. Lo ZIP contiene un solo file eseguibile direttamente dal browser. Nessun account è richiesto.

Per ripetere il passaggio Taste, ottenere il tag `v2.1.5` dal repository ufficiale e servire il dossier. Esempio per Campo, dalla cartella del dossier, con `TASTE_DIR` impostata alla cartella `skills/taste-skill` del checkout del tag:

```sh
node "$TASTE_DIR/scripts/draw.mjs" --app --kind builder --theme dark --seed 928 --style data-terminal --screens detail --keep palette,type --brief "Banco sperimentale con grafico, previsione e controllo della durata" --out /tmp/taste-campo
node "$TASTE_DIR/scripts/inspect.mjs" 'http://127.0.0.1:8860/confronto.html#campo' --app --out /tmp/taste-campo-audit
```

SHA-256 dell’HTML verificato: `ca2470b38ea04ba0c7bd5618c14da22acda80162c5ad76c71ba75cebc77819ce`. SHA-256 dello ZIP: `26e6c48672de1f9d91439781c21f25f100e853bc0767cc8f70b499e647be902d`. L’albero Git di `officina-di-fisica/` nella base di progetto ha identificatore `bc07b98b60b082f39965643dafa0bfd6054156b2`.
