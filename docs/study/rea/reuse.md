# Riuso e provenienza

La scelta operativa è sorgente diretto per componenti propri e cattura browser riproducibile per il comportamento. Il registro distingue `DOC_ONLY`, prove Playwright e test di transazione: non dichiara un runtime REA installato né parità con servizi terzi.

- `postitObject.ts`, `subPostitObject.ts`, modello Studio e store SQLite: sorgenti del monorepo a base `b124eee0`, hash in `artifacts/study-demo/baseline.json`. Adapter aggiuntivi; nessun motore canvas sostituito.
- Grounded memory LessonOS: la nuova proiezione vive nelle tabelle canoniche dello stesso DB, con osservazioni/review e fonti persistenti. Il filtro studente viene applicato prima della ricerca; il solo handler legacy teacher-scoped non viene esposto direttamente a studenti.
- React, Excalidraw e JSZip: dipendenze già presenti, licenze MIT nei manifest locali; nessuna copia di prodotti concorrenti.
- Nuovi validatori: Pillow 12.3.0, MIT-CMU; pypdf 6.21.1, BSD-3-Clause. FastAPI 0.139.0 MIT e Uvicorn 0.54.0 BSD-3-Clause sono il sottile adapter HTTP. Versioni effettive fissate dai lockfile. Licenze lette dai metadata della distribuzione installata.
- ffprobe legge soltanto il file temporaneo assegnato dal server con argomenti fissi, senza shell; ffmpeg genera esclusivamente il tono di fixture. Binari locali di sviluppo, non vengono redistribuiti nel bundle browser.
- [REA ufficiale](https://github.com/morluto/rea): consultazione della documentazione primaria, runtime locale assente. Nessuna installazione non fissata o decompilazione. Per la propria app vengono usati gli scenari Playwright già disponibili.
- [Heptabase](https://wiki.heptabase.com/user-interface-logic) e [Obsidian Canvas](https://obsidian.md/canvas): documentazione pubblica riletta per separare carta, fonte e contesto. Nessun accesso autenticato o riuso di sorgenti/asset proprietari.

Fisica, rubriche sintetiche e materiali fixture sono originali. Manuali, banche quiz, codice ELAB/Riccardo e copie di repository di provenienza incerta non sono stati importati. Il catalogo completo del dossier resta un elenco di candidati, non una lista di applicazioni collaudate.
