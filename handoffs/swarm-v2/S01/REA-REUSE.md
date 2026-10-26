# S01 — decisione di acquisizione, 26 ottobre 2026

Il mandato REA-FIRST è adottato mantenendo l'incarico S01 in corso. Registro
139 letto dalla base37e0fe82; main attuale8e0737b1. Nessun edit concorrente
al registro: questo documento è il delta proposto a S00/S12/S15.

| Candidato | Osservato e diritti | Decisione per il primo batch |
| --- | --- | --- |
| TARGET-083 JSXGraph1.14.0 | Pacchetto npm con integrità verificata, pin d0fd56a473651ce8eba51c2b7821ab3cfb357ac3. MIT scelto, zero dipendenze runtime npm dichiarate. Rendering SVG, board/curve/point e cleanup provati nel browser isolato; 7 PASS. | ADAPT in corso: adottare il sottosistema grafico, lifecycle e viewport completo. Nessun solver frontend. Consumer S01 implementato; adozione nel prodotto attende manifest/lock S00, build ed E2E. |
| TARGET-018 GeoGebra | Pagina ufficiale licenze riletta il26/10: uso commerciale richiede accordo specifico. Nessun accordo o asset acquisito. | DEFER adozione: non presumere un diritto commerciale dalla disponibilità del software. Non blocca JSXGraph. |
| TARGET-019 Desmos API v1.11 | Documentazione ufficiale riletta: calcolatrice incorporabile, viewport/espressioni/stato. Script servito da Desmos con API key propria. Nessuna API key acquisita e nessuna prova runtime in questa sessione. | DEFER: preferenza per dipendenza locale con versione e notice controllabili, senza introdurre servizio remoto nel runtime scientifico. Nessun codice/asset Desmos copiato. |

Fonti primarie: <https://github.com/jsxgraph/jsxgraph/tree/v1.14.0>,
<https://www.geogebra.org/license>,
<https://www.desmos.com/api/v1.11/docs/index.html>.
Non è una raccomandazione legale generale; le decisioni riguardano le evidenze
e i diritti effettivamente disponibili per questo batch.

## Evidenza REA effettiva

REA sul distribuito `distrib/jsxgraphcore.js` ha prodotto timeout a30s.
Padre `ev_bf20199a855f5ad5753c4e20776f6b81b7917b86fb2aee62eccebc03cf5c30c7`;
inventario completo, analisi sorgente parziale, zero file JS completati,
429 file fuori selezione e limiti di unknown dichiarati. Bundle esportato
fuori Git, hash e limiti in `evidence/rea-jsxgraph-timeout-summary.json`.
Non dimostra lifecycle, assenza di rete, sicurezza o equivalenza numerica.
Non ripetuto con timeout maggiore durante la contesa macchina.

Le prove comportamentali del donor sono il browser spike già conservato:
input/tastiera, drag reale, aggiornamento curva,21mount/unmount e fallback.
Sono distinte dalla prova del consumer Ardesia, ancora da eseguire.
La lettura del sorgente ufficiale è il metodo diretto per le API documentate;
non serve decompilare per affermare ciò che quel sorgente già stabilisce.

## Riuso interno e contributi originali

Già presenti: motori SI Hooke, Poiseuille, DC, onde, gas e cinematica;
risorse/revisioni/private/CAS, sessioni e trasporto Web; ToolHost.
Non duplicati. Quaderno PDF v1 rimane invariato. La configurazione scientifica
usa un kind delle risorse Core esistenti, senza DB, identità o voti paralleli.

Originali: quattro modelli analitici SI con limiti espliciti, dataset prodotti
dal Core, catalogo, adapter HTTP opzionale, consumer e trasformazione geometrica
dei dati. JSXGraph proietta risultati canonici; non conferma la fisica.
La decisione di scrivere i modelli deriva dai vincoli didattici/di verifica:
nessuno dei due calcolatori esterni valutati è l'autorità Core di Ardesia.

## Chiusura di acquisizione ancora necessaria

Manifest+lock esatti S00; installazione factory API da writer autorizzato;
mount lazy nella shell e riapertura dal riferimento di revisione; E2E reale,
misura chunk gzip350KiB massimo, screenshot390/820/1440 e notice distribuito.
S03 deve stabilire fonte canonica tra edizioni: una vista che riusa la stessa
definizione non autorizza l'accesso a una risorsa privata di un'altra edizione.
ToolHost install/update/rollback/revoke/uninstall e Kirchhoff restano gap,
non capacità acquisite. Prossima acquisizione: adapter Kirchhoff al pin già
riconosciuto, dopo verifica di diritti/closure e consumer DC reale.
