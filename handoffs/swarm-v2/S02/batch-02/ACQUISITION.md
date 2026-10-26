# S02 — riuso del sottosistema di interazione

Mandato comune REA-FIRST eseguito il 26 ottobre 2026 continuando la PR316. Non viene riaperta la PR308 già integrata. Registro `registry/TARGETS.json` letto da main8e0737b1: 139 target, TARGET-117 Radix UI/shadcn già presente. Non aggiungo duplicati o modifiche concorrenti al registro; il delta proposto è separato.

## Decisione e candidati

| Candidato e fonte primaria | Diritto osservato | Decisione nel consumer S02 |
| --- | --- | --- |
| [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog), pacchetto installato1.3.1 | MIT, LICENSE locale e pin/integrity del lock verificati | REUSE: intero confine modale, portal, focus scope/guard, dismissal, gestione scroll e semantica del dialogo nella ricerca della shell. Già dipendenza del Login; nessun nuovo package. |
| [React Aria Modal](https://react-aria.adobe.com/Modal), manifest upstream1.22.1 osservato | Apache-2.0 nel manifest e LICENSE ufficiale | DEFER: alternativa completa con overlay/focus e componenti di collezione; aggiungerebbe react-aria/react-stately e relativi adapter senza un gap del consumer dimostrato. Nessun benchmark o installazione eseguito. |
| [Ariakit Dialog](https://ariakit.com/reference/dialog), manifest upstream0.4.42 osservato | MIT nel pacchetto `packages/ariakit-react/license` | DEFER: alternativa con store/combobox/dialog, ma introdurrebbe un altro sistema di focus/overlay. La repository ha licenze per percorso: app proprietaria ed esempi Plus non sono donor autorizzati. Nessun loro asset o codice acquisito. |

Le versioni upstream sono snapshot di lettura, non pin aggiunti ad Ardesia né garanzia di release npm. Provenienza, dipendenze dichiarate e hash sono in `candidate-provenance.json`; inventario locale delle licenze del dialogo e delle sue dipendenze dirette in `installed-license-inventory.json`. Non è un audit dell'intero grafo transitivo. Conservare i notice nella distribuzione, già richiesti dalla licenza; nessun asset/font esterno nuovo. [Licenza Radix](https://github.com/radix-ui/primitives/blob/main/LICENSE), [licenza Adobe](https://github.com/adobe/react-spectrum/blob/main/LICENSE), [ambito Ariakit](https://github.com/ariakit/ariakit/blob/main/readme.md).

## REA evidence effettiva

REA ha analizzato come testo inerte il solo artefatto distribuito `@radix-ui/react-dialog/dist/index.mjs`, 14.132 byte, SHA256 `e32c21a189358f22749c171f666bddea31ae2ebe5e8c4d6c5c8aedd3916a04d7`. Identità della directory inventariata `e309ed3e44beb0d728c00ae13eac70196a27184f5d50184af3855f47fd530f26`. Evidence padre `ev_16ba2431b930b5b34bc0251a9ab8e2e624b7d481389f23c6e30ba1a4ab328ed9`; summary `ev_71e234779da9a63bb45e2f8cfaab6e250111daf74fe23db284723ae289890bb7`, conservata nel presente handoff.

Osservati export Dialog/Content/Trigger e riferimenti statici a FocusScope, DismissableLayer, Portal, Presence, RemoveScroll e hideOthers. Lettura diretta del dist conferma la composizione del contenuto e lo stato controllabile open/onOpenChange; i dettagli di dipendenze esterne alla directory non sono stati analizzati da REA. Sei file non selezionati, sei unknown del grafo applicativo e450unknown semantici: copertura PARZIALE, non troncata; nessun codice eseguito o comportamento browser dedotto dal grafo. Il bundle completo di tre record, 2.925.494byte, è esportato negli output della chat, senza database/token/tracce di login. Nessuna sessione native aperta da chiudere.

## Software effettivamente adottato e originale

La PR308 usa già il sottosistema Radix nel consumer reale ProductShell→CommandSearch, oltre al Login preesistente. Evita di riscrivere trap/loop del focus, portal, guard, scroll lock e dismissal. Non sostituiamo questi meccanismi con observer o gestori globali nostri. Il nuovo test di rimozione di una destinazione focalizzata passa con il comportamento della libreria esistente: il focus resta nel dialogo e il submit invoca soltanto la route e il callback correnti.

Originali Ardesia: catalogo/filtraggio route, matcher italiano, selezione delle sole edizioni già caricate dal Core, adattamento IME, destinazione del focus dopo navigazione, CSS/geometria e opt-in `enabledViews`. Questi dettagli dipendono dal contratto di prodotto; non sono un secondo motore di overlay o ricerca dati. Nessun endpoint/store/ACL/schema nuovo.

## Integrazione, prove e limiti

Sulla main8e0737b1 la shell è integrata; CI post-merge40247327806SUCCESS. Le prove browser/Core della PR308, su fonte dichiarata nel relativo handoff, coprono tre viewport, ricerca→lezione→nota salvata→reload, offline/online e deep link. Non vengono attribuite alla nuova composizione Memoria/Studio autonomo.

La PR316 aggiunge la disponibilità esplicita di queste route in nav e ricerca, preservando il default. Cinque unità pure + consumerShell1PASS precedenti; CI2da98d99 completaSUCCESS40248639849. Nuovo test dialogo dinamico1PASS,6nonselezionati,15.68s totali/jsdom,1.79s test; non è un browser nativo. La prova non ha richiesto modifiche al prodotto Radix. Il Root deve ancora montare S05/S06 e passare l'elenco effettivo: questa capacità non è DONE, distribuita o autorizzata da una lista. S06 ha confermato la correzione del main annidato con suo RED/GREEN in6405352617; risultato dell'owner, non test eseguito da S02.

Nessun benchmark comparativo o risparmio orario misurato: beneficio verificabile è zero nuove dipendenze e riuso del sottosistema modale; metriche browser precedenti restano riferite alla fonte PR308, non a un miglioramento presunto. Safari/VoiceOver/device e focus nativo durante rimozione restano NOT_RUN. Finestra locale chiesta in6405606925; nessun browser/build/tsc S02 avviato durante la coda condivisa.

## Prossima acquisizione e raccordo trasversale

Priorità: adozione degli stati SurfaceState/SourceStatus nei consumer reali S01/S06/S08, insieme alla composizione Root; Feedback.tsx e i namespace altrui restano ai writer correnti fino alla delega. L'attualità di una fonte deve provenire dal Core, non dal successo di un GET storico. S12/S15 consultati effettivamente su GitHub6405606925; S13/S16 invitati a fornire un consumer concreto per il confine UI di scene/asset. Nessuna scena o trasporto remoto dichiarati acquisiti da S02.

Per S00: integrare316 insieme ai mount reali, poi provare entry e ricerca con ruolo/senza corsi/reload e disponibilità aggiornata sul merge tree, main e ambiente pertinente. Riconciliare RUNLOG/NEXT comuni da questo handoff. Per S12/S15: conservare TARGET-117 e limitare ADOPTED a Dialog1.3.1 nel consumer citato; nessuna adozione dell'intero catalogo Radix/shadcn implicita.
