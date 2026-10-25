# R2 — pubblico HTTPS finale 36cdba3

**PASS: 100/100 controlli nativi, 20/20 asset esatti, nessun finding aperto nel percorso osservato.** Questa è una nuova esecuzione sulla preview fisica finale, non una rinomina delle prove bec05cc.

| Binding | Valore |
|---|---|
| Deployment | `dpl_DFzshU93DT5N746XiPYr26dyjpcx` |
| Host HTTPS | `ardesia-fisica-preview-p4t6b0w96-andreas-projects-6d4e9791.vercel.app` |
| Commit dichiarato dal candidate verificato | `36cdba353401c80b92cc94f256b106238c7610f8` |
| Source tree / file | `8a9497d14b2b6d507bce3683452f2cb26fe09915396a423ad148037d8d2d1a42` / 1608 |
| SHA256 candidate-manifest pubblico | `651f6b31501f00fb14048607c4529675961821044e568ab3c13bf06af7fa418d` |
| Browser / TLS | Chromium148.0.7778.96, verifica HTTPS normale |

I20file in `upload-inventory.json` derivano dal **nuovo** manifest e sono stati confrontati con i byte di `/private/tmp/ardesia-r2-public-36cdba3/public`, con l’inventory precedente bec e con le risposte HTTP200 della nuova origine. Tutti e tre i confronti coincidono. L’identità finale del build è vincolata dal manifest esterno del candidate: il file pubblico `source-manifest.json`, come gli altri19asset, è rimasto byte-identico. Non deduco da tale payload invariato una nuova firma embedded. Le precedenti prove restano attribuite a bec05cc.

Percorso nativo ripetuto a360/390/820/1440: landing→Fluidi e termodinamica→esperienza→Pressione e profondità; previsione0 errata conservata e19620Pa,1e309 non inviabile; Home del cursore→superficie relativa0Pa; riferimento assoluto→101325Pa; primo indizio parziale e secondo relazione, con focus conservato; prima nuova prova800kg/m³/3m/gauge→23544Pa e seconda1000kg/m³/1,5m/absolute→116040Pa. Le nuove prove svuotano il campo, nascondono la soluzione e rifocalizzano la previsione. CTA→contatto del medesimo corso; il messaggio precompilato è controllato senza aprire WhatsApp o inviare email/messaggi.

Sono rimaste le fence esplicite URL/load del runner corretto e le stesse100asserzioni. Nessuna risposta è stata intercettata o sostituita; nessun mock applicativo. Nessun errore console/page, richiesta fallita o host esterno nel percorso prodotto registrato. I4PNG originali Ardesia sono stati visionati: focus visibile, etichette entro SVG e nessuno scroll orizzontale. I font SVG effettivi minimi risultano14,9/16,4/16,33/16,33px (fontCSS×larghezzaSVG/480, viewBox480 per entrambi gli SVG). Reduced-motion richiesto e nessuna animazione nel diagramma Idrostatica.

Landing ed esperienza rispondono200 con CSP `default-src 'none'`, `connect-src 'none'`, `media-src 'self'`, `object-src 'none'` e `frame-ancestors 'none'`, oltre a noindex/nofollow e no-store. Nel contesto autorizzato rispondono404 `/study/session`, `/study/me`, `/studio/`, `/beta/`, `/esperienza/study/session` e `/esperienza/unknown-page`: sono404 dell’applicazione, non blocchi SSO scambiati per successo. Un contesto HTTP anonimo separato, senza seguire redirect, riceve302 dal normale host; il contesto di accesso temporaneo raggiunge il prodotto200. Non sono cambiate impostazioni di protezione, domini o target.

Accesso fornito letto solo in memoria: nessun URL con query, cookie, storage state, HAR, video o auth trace salvato. I soli header conservati sono CSP/cache/robots/content-type. Gli errori vengono ridotti a tipo e fase; le richieste fallite, se presenti, usano solo host/path senza query. `privacy-check.json` controlla che gli artefatti selezionati non contengano i valori dell’accesso privato. Nessun file prodotto, deploy o commit modificato/eseguito dal revisore.

Comandi riproducibili, con il file di accesso temporaneo ancora valido e Chromium148 già installato:

```sh
/opt/homebrew/bin/node work/r2/qa/vercel-36cdba3/verify-remote.cjs
/opt/homebrew/bin/node work/r2/qa/vercel-36cdba3/finalize-evidence.cjs
/opt/homebrew/bin/node work/r2/qa/vercel-36cdba3/freeze-evidence.cjs
```

Limiti: questo smoke non verifica il deploy della beta privata, la decodifica/riproduzione audio nativa, un lettore di schermo o altri browser. CSP e hash WAV non sono una prova di ascolto. L’inizializzazione della landing richiede JavaScript/load; non è stata ripetuta né riclassificata la diagnosi del primo runner storico bec. Non si attesta revisione scientifica/editoriale umana e non si autorizza il lancio: `launchAllowed=false`, `humanScientificApproval=NOT_ATTESTED`. Le prove dei due fix privati e i gate completi sono separati.
