# G0 finale locale — stessa lezione, stessi attori e Core

Il golden esteso ha completato **26 controlli** sul commit locale
`7c9412637140d4d516a1befaac044e7388520cc9`, tree
`56646b79a95146c63708aee00d5a55fe33b4e9b6`. Build ordinarie Web e Studio,
flag privato S20 esplicito, Core SQLite/blob reale e attori sintetici.
Nessun backend mock, trasformazione dei sorgenti o condivisione implicita di OPFS.

Il docente carica il PDF originale, seleziona il testo, salva annotazione e
formula nella revisione Core, manipola il modello Poiseuille e apre la stessa
Room da Aula. Inserisce la formula con MathLive e MathJax locali, seleziona
esplicitamente annotazione e SVG sulla lavagna, autorizza il microfono e registra.
Il file `.lesson` esportato contiene gli stessi oggetti/versioni, evento formula,
SVG, audio e capitolo; l'evento formula precede l'audio. La pubblicazione al gruppo
conserva un riferimento esatto alla registrazione e alla fonte PDF.

Un nuovo browser studente importa esplicitamente il file dalla UI, consulta il
passaggio e il PDF, ascolta fino alla fine, sperimenta e invia previsione e
procedimento. Lo stesso docente restituisce feedback nella vera Review. Lo
studente affronta il secondo problema e, dopo un nuovo processo Core e un browser
nuovo, recupera ricevute, feedback e riferimenti esatti. Il replay locale richiede
un nuovo import esplicito del file: non si dichiara distribuzione remota dell'audio.
Peer negato e revisione assente restano controlli negativi effettivi.

## Risultati e limiti dei gate

- Web: **622 PASS / 94 file**, typecheck e build; sorgente prodotto identica
  dopo i successivi cambiamenti ai soli runner.
- Studio: **2365 PASS / 5 SKIP**, 228 file PASS e uno skipped, 151,75 s;
  typecheck e build sul commit fermo `b53e607`. Le build del golden successivo
  sono state rifatte a ogni cambio di HEAD per legare il producer del journal.
- Core/API: **1224 PASS / 30 SKIP**, 125,93 s. I servizi PostgreSQL/Supabase non
  configurati localmente sono dichiarati, non simulati o contati come PASS.
- Contratti rilascio: **27 PASS**. Il comando aggiuntivo con il glob inesistente
  `test_prepare_vercel*.py` restituisce `NO TESTS RAN`/exit5; non è un gate superato.
  I test Vercel effettivi sono già nei 27 `test_teaching*.py` precedenti.
- Igiene: NUL, segreti, test scanner, confine ELAB, workflow e whitespace PASS.
- Proiezione pubblica: build PASS; nessun deployment pubblico eseguito.
- Geometria PDF: **16 PASS** su `b53e607`, stesso prodotto; golden successivo
  ricontrolla Shell e assenza overflow a 360/390/820/1440. Il manifest registra le
  dimensioni reali dei PNG, incluso il popup Studio 1280px.
- Golden: **26 PASS**, errori JS `[]`, richieste runtime esterne `[]`, nessun 5xx.

Le due prove di setup aggiunte al golden sono conservate: il laboratorio docente
partiva da raggio 1,5 e restituiva correttamente 5,0625; il runner ora imposta 2
con la tastiera. Il primo canvas Excalidraw era quello di rendering, coperto dal
canvas interattivo; il click usa ora quest'ultimo senza `force` o iniezioni nello
store. Nessuna correzione del prodotto o modifica dei timeout per questi casi.
Il riavvio dell'ambiente ha interrotto un precedente Core e Studio: i log sono
conservati, non contati come test completati. La riesecuzione seriale è sopra.

Log compressi losslessly; `manifest.json` conserva digest e dimensione sia raw
sia gzip. Solo prove sintetiche curate: esclusi token, database, registrazioni
e file `.lesson`. I risultati locali non sostituiscono CI della head remota,
merge protetto, CI post-merge o verifica Vercel: ricevute terminali nella PR #313.

## Riproduzione

Installare le dipendenze dai lock e Chromium con Playwright. Compilare Web con
`VITE_S20_LEARNING_JOURNEY=1` e Studio con `ARDESIA_STUDIO_BASE=/studio/`.
Eseguire `handoffs/swarm-v2/S18/g0-composition-20261026/verify-golden.mjs`
impostando `ARDESIA_G0_OUTPUT` a una directory nuova e `ARDESIA_G0_PYTHON` al
Python della Study API. `ARDESIA_CHROMIUM` è un override opzionale; il default è
l'installazione Playwright standard, anche in CI. Segue `verify-layout.mjs`
con `ARDESIA_G0_STATE`, `ARDESIA_G0_RESULT` e `ARDESIA_G0_LAYOUT_OUTPUT` espliciti.
Non cambiare HEAD o build mentre i runner sono attivi.

Microfono sintetico, nessun ascolto umano, Safari o dispositivo fisico attestato.
G0 locale non equivale a G1. Due problemi non completano l'episodio intero né i
200 obiettivi; correttezza scientifica/editoriale umana e pubblicazione restano
separate. La preview protetta mantiene l'API remota indisponibile esplicitamente.
