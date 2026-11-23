# ADR 001 · Un processo per l’applicazione, contratti ai suoi confini

Decisione adottata per l’edizione 1.1. L’unità di distribuzione è la cartella `officina-di-fisica/` nel ramo omonimo. Il server Python, l’archivio SQLite, il JavaScript nativo e gli asset locali consentono di studiare senza collegamenti a servizi esterni. Gli oggetti didattici conservano ID e revisioni anche quando cambiano corso, ordine o stato di pubblicazione.

| Responsabilità | Sorgenti | Contratto verificato |
| --- | --- | --- |
| Dominio didattico | `server/domain/{authoring,assessment,catalog,method,pathway}.py` | Riferimenti validi, grafo aciclico, una simulazione per coppia lezione/voce, confronto delle risposte, evidenze per famiglia |
| Dominio scientifico | `server/domain/science.py`, `static/js/banchi/modelli/`, `static/js/banchi/voci/modelli/` | Calcoli deterministici a parametri fissati, riferimenti, unità e casi limite |
| Applicazione | `server/application/` | Porte tipizzate per studio, percorso, pubblicazione e ordini. L’adattatore viene passato al caso d’uso |
| Infrastruttura | `server/adapters/`, `server/store.py` | SQLite, migrazioni e versioni dei motori. Il ciclo di vita della transazione appartiene alla richiesta |
| HTTP e compatibilità | `server/web.py`, `server/{editor,learning,commerce}.py` | Cookie, ruoli e CSRF, facciate per i client precedenti. Le operazioni di sessione, inventario e gestione degli allegati restano nel perimetro infrastrutturale |
| Presentazione | `static/js/banchi/{banco,scena,tavola}.js`, `static/js/percorso.js` | Una misura alimenta lettura, derivazione, diagramma e scena. Ogni banco temporale usa l’istante del suo orologio |
| Assistenza editoriale | `server/editorial/`, `server/adapters/{providers,editorial_mcp,editorial_sandbox}.py` | Processo separato, strumenti e corsi concessi esplicitamente, uscita strutturata riferita a una revisione |

La regola di dipendenza è eseguibile. Il test legge l’AST dei tre pacchetti interni e fallisce se importano SQLite, HTTP, filesystem o un adattatore dell’Officina. La selezione adattiva può variare l’ordine dei quesiti. Risposte, ordine e profilo di punteggio vengono fissati all’apertura della prova. [Test dei confini](../../tests/test_architecture.py) · [Porte di studio](../../server/application/study_port.py)

Una pubblicazione verifica l’intero grafo candidato prima di promuovere la prima bozza. Una richiesta ripetuta riapre la stessa prova tramite il suo identificatore. Le migrazioni controllano la versione dell’archivio con il lock di scrittura già attivo. I test ricreano un aggiornamento interrotto, quattro accessi concorrenti e la lettura di una prova conclusa dopo il cambio del punteggio. [Migrazioni](../../migrations) · [Pubblicazione](../../server/application/publication.py)

Il costo operativo attuale è un processo applicativo con un archivio locale. Il profilo di carico previsto è un’installazione didattica a scrittore SQLite singolo. Un secondo backend può implementare le stesse porte. La replica multi-host richiederebbe una decisione sulla consistenza delle scritture e sui file privati. I renderer condividono la descrizione geometrica e caricano i modelli su richiesta.
