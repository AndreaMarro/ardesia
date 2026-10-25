# ADR-0007 — Budget dei body prima della lettura

Stato: adottata per `5cbafd072504cb4603bf0daa903472fa0f528247`, 2026-10-20.

Il semaforo degli store protegge Auth e connessioni, ma entra dopo la lettura HTTP. Più richieste potevano accumulare contemporaneamente body fino a96MiB ciascuno. Riserviamo quindi il massimo codificato della rotta prima del primo receive:256KiB ordinario,20MiB asset,96MiB notebook. Una sola funzione definisce peso e limite413. Content-Length non determina il peso. Il budget predefinito è128MiB per istanza, attesa0,5s, poi503 con Retry-After e no-store.

La proprietà dura fino all’uscita dell’intera chiamata ASGI, inclusi risposta e cleanup. Un finding indipendente sul primo freeze ha dimostrato che il middleware utente era interno alla risposta500 automatica: liberava troppo presto la quota. La correzione usa una piccola sottoclasse FastAPI che avvolge `super().build_middleware_stack()`. Non ricostruisce la stack né duplica il gestore500; conserva router, state, OpenAPI, dependency override e middleware aggiunti. Il rilascio sincrono nel finally evita una seconda finestra cancellabile di trasferimento della quota.

Le richieste in attesa si risvegliano e ricontrollano il proprio peso. Una richiesta piccola può usare spazio libero mentre una grande attende; non promettiamo equità o ordine FIFO. Host/origin403 precedono la quota. GET/HEAD/OPTIONS e salute la attraversano senza acquisirla. Un503 generico conserva il cookie; il logout esplicito continua a cancellarlo localmente con revoca server non confermata quando necessario. Cookie issue e delete condividono gli attributi.

Il test della stack completa comprende500 automatico e personalizzato, errori send, cancellazione, background task e cleanup worker. Il reviewer esegue12probe indipendenti e75regressioni sul freeze con albero API identico; root539test Core/API con PG/Auth/RLS/Storage reali. Il server TCP reale verifica notebook incompleto→secondo503, lavoro piccolo autenticato200, origine vietata403 e recupero della quota dopo disconnect. Il contatore zero-Auth-open è provato separatamente in ASGI, non misurato sul TCP.

FastAPI0.139.0/Starlette1.9.0 sono i pin e i sorgenti letti. Ogni aggiornamento del framework deve rieseguire lifecycle e compatibilità dell’interfaccia prima del lock nuovo. Cambiare i massimi richiede aggiornare insieme funzione condivisa, minimo di configurazione e contratti encoded/concorrenza.

Il limite riguarda massimi codificati riservati, non RSS, copie di parsing, riferimenti ad eccezioni dopo l’uscita ASGI, buffer di trasporto, richieste in coda, GET, risposte o memoria globale. Più istanze/processi sommano i budget. Un body lento mantiene la quota fino all’uscita: non è stato introdotto un deadline di lettura né un benchmark di carico. Un Core, nessuna dipendenza aggiunta, nessun nuovo servizio.
