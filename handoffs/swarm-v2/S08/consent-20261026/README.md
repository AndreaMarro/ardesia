# Consenso dei take v2 senza oggetti — 26 ottobre 2026

Prodotto frozen: `34e1db4a11c7823e26a3685052dcef1f10de08db`, tree `3317f1e004ee5a04ed8a2f8c0d2764988f805e38`, parent `c35b3e3f7d80c6361b446c1b29d525ba84579690`. Nessuna modifica Room, Core, grant remoto, dipendenza o CI. Nessun push/deploy eseguito.

## Difetto e correzione

La review della prima composizione ha trovato un confine reale: i take v2 senza `objectRefs` usavano ancora i vecchi controlli nativi e non montavano il guard S17. Un Blob già caricato poteva continuare dopo la revoca canonica. Il nuovo test riproduce il problema sulla fonte esatta c35b3e3: consenso revocato e byte cancellati, ma media ancora in playback.

La stessa lifecycle di consenso di LivingLessonReplay ora serve **tutti i take v2**. Il marker è facoltativo; non si inventano oggetti, marker o identità. Per un take senza collegamenti, l'host locale verifica la vera sessione ricavata dal recording attraverso il medesimo confine d'archivio. Il guard continua a verificare byte/hash, snapshot canonico, session hash ed autorizzazione prima di abilitare il comando. Il renderer waveform resta separato dal guard; nasconderlo non interrompe le verifiche. Ogni take v2 usa il solo cursore/media di ReplayView e non espone un controllo nativo che salti il preflight.

Le note rimangono legate a un momento autentico e al relativo port. Senza momento non vengono lette, salvate o visualizzate. I documenti editoriali mantengono il requisito originale di almeno un riferimento oggetto; la sola registrazione senza collegamenti non diventa un capitolo.

## Verifiche

| Verifica | Esito |
| --- | --- |
| Nuova regressione contro c35b3e3 | RED comportamentale: `audio.paused` rimane false dopo revoca |
| Composizione corretta + linked/unlinked lifetime + captions + ReplayView | **55/55**, 11 file |
| Typecheck Studio | **PASS** |
| Browser, waveform visibile | **PASS**, pausa e source detached, consenso false, zero file audio canonici |
| Browser, waveform nascosta durante playback | **PASS**, stesse condizioni |

Il browser è Chromium148.0.7778.96, avviato dopo il freeze prodotto: sia Git del runner sia Vite fanno riferimento a34e1db4. La prova registra dai veri controlli Room con consenso docente esplicito, MediaRecorder reale e dispositivo sintetico. Una seconda tab apre il ReplayView reale. La prima tab revoca con «Revoca e cancella audio». Non vengono invocati mutatori dello store dal runner: le sue letture dello store sono soltanto verifiche di `objectRefs:[]`, consenso e purge.

La prova definitiva usa il comando reale Ricomincia, verifica `paused:false` immediatamente prima della revoca ed osserva passivamente gli eventi nativi `ended`: nessuna fine naturale deve precedere il distacco. I risultati finali sono2147ms (waveform visibile) e355ms (nascosta), misurati dal click di revoca fino all'osservazione completa. Non sono un limite massimo garantito: includono controlli UI e scheduling fra tab. Il poll nominale resta250ms.

### Tentativi conservati

`fixture-mock-failure.log.gz` e `fixture-lock-failure.log.gz` precedono il RED comportamentale: il primo mock Excalidraw ometteva FONT_FAMILY e jsdom non disponeva del Web Lock necessario al setup journal. La fixture finale usa lo stesso lock in-process esplicito dei test S17 esistenti; il browser usa i Web Locks reali. Non sono fallimenti attribuiti al prodotto.

Il typecheck intermedio ha individuato il null check richiesto quando il marker è facoltativo e l'annotazione TypeScript di `this` nel mock media; corretti prima del freeze.

La prima prova browser attestava il distacco ma non escludeva una fine naturale durante i preparativi. Le due controprove intermedie hanno evidenziato tale ambiguità. Sono conservate come risultati precedenti; **non** attestano interruzione di playback attivo. Il runner finale prepara prima i controlli, usa Ricomincia ed osserva l'evento `ended`; `browser/result.json` è la prova accettata.

## Limiti espliciti

La rimozione della sorgente interrompe il lettore corrente; non può revocare fisicamente un Blob già copiato o un file esportato/scaricato da soggetti esterni. Non si certificano ascolto umano o dispositivo fisico.

Il modello corrente dei chunk legacy `audio.chunk` non espone session ID/hash o un binding di consenso esplicito. Non vengono associati alla sessione più recente, a un marker fittizio o ad una identità dedotta. Questo follow-up copre i take v2; non dichiara una nuova copertura di revoca sui chunk legacy privi di metadati.

## Riproduzione e integrazione

Avviare lo Studio del commit prodotto con le sue dipendenze locked su127.0.0.1:5482, poi:

```sh
ARDESIA_MEDIA_OUTPUT=<directory-nuova> \
ARDESIA_CHROMIUM=<chromium-autorizzato> \
node handoffs/swarm-v2/S08/consent-20261026/browser-proof.mjs
```

Il runner non richiede backend, credenziali Core o microfono fisico. I log sono compressi losslessly; gli hash raw e gzip sono nel manifest. Le modifiche di Formula #318 possono essere composte separatamente: nessun file Room è modificato da questo follow-up. S00 conserva l'unico ruolo di integrazione e release.
