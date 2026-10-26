# S08 + S17 nel prodotto Studio — 26 ottobre 2026

**IMPLEMENTATO E VERIFICATO LOCALMENTE.** Nessun push, merge remoto, deploy, modifica di protezioni o risorsa a pagamento eseguito. S00 resta il writer di integrazione e release.

## Provenienza

Prodotto: `d13f331907c7f72f26ddcdfd79c9fe508d660a3a`, tree `723b186541cca0541a331e965f57a9b5d766120d`.

| Origine | SHA |
| --- | --- |
| PR #313 prima della composizione | `ee551e41f35c7b90ca4c473f68ebd8f397533572` |
| Main osservata | `b24ef9784bcac50c00d6e343a172eef904c19eab` |
| Merge locale #313 + main | `9a8ac5fd58da10780194278e2fc5b35d74f7687b` |
| PR #322, secondo parent del prodotto | `d15c4af2271970d248e1f62709a0a4dc9dc7d1a0` |

I browser sono stati avviati mentre il merge era nel working tree: la costante Vite di provenienza era `9a8ac5f`, **non** la SHA finale. I byte finali corrispondono al commit prodotto e sono vincolati separatamente nel manifest. Il gate Studio frozen gira dopo il commit prodotto. Non si attesta una build/deployment remoto su `d13f331`; S00 deve ricostruire e verificare il candidato finale dopo gli altri rami.

## Composizione effettiva e autorità

`Materials.tsx` monta ScienceMaterials e LessonMediaLibrary conservando i consumer S06/S19. Le chiavi React hanno prefissi distinti `science:` e `media:`: la sola tripla principal/role/edition risultava duplicata fra componenti fratelli.

`Room.tsx` ha un solo punto di scrittura della scena, `queueSceneWrite`. Autosave, flush ed aggiunta dei marker passano nella stessa coda; la lettura dello stato precedente avviene dentro la coda. Il serializer Excalidraw preserva soltanto `livingLesson` validato, senza copiare note private o proprietà arbitrarie. Prima di salvare un capitolo, Room arresta/flush-a registrazione e journal e verifica registrazione, sessione, hash, istante ed esatte revisioni degli oggetti.

Il pannello docente permette di nominare una registrazione salvata come passaggio/capitolo. Restano espliciti annotazione o selezione di contesto e consenso «Solo il mio microfono docente», spento all'apertura. Non esiste registrazione automatica né microfono dello studente. Il capitolo conserva l'istante finale e gli oggetti/versioni del segmento scelto, con titolo dichiarato dal docente.

ReplayView possiede l'unico elemento audio, il suo object URL e l'unico cursore epoch. Espone `renderExtension`, `replayFiles`, `selectedRecordingId` e `range`; il consumer S17 usa direttamente il contratto tipizzato, senza cast o trasformazione del sorgente. Le patch originarie restano storiche. `verify-patch.mjs`, mantenuto per compatibilità del comando, compila il vero host/consumer e dichiara `sourceTransform:false`.

Seek da timeline, media nativo, waveform e didascalie convergono sul cursore canonico. Ogni seek esplicito incrementa la medesima `seekRevision` del preflight S08: una risposta Core tardiva non annulla uno spostamento successivo. Callback di una precedente room/registrazione non possono comandare il nuovo contesto. I marker in URL vengono risolti contro editoriale, journal e file; pin contraddittori o marker assenti falliscono senza fallback al segmento più recente.

Waveform e controlli S17 sono caricati dinamicamente soltanto per registrazioni collegate a oggetti. I controlli alternativi del media restano nascosti durante l'inizializzazione del guard. **Nascondere la waveform cambia soltanto il renderer; non smonta il guard.** Il consenso/session hash viene verificato ogni 250ms e prima del comando di playback. Un OFF→ON non riattiva il binding precedente. La revoca interrompe e stacca il media.

I controlli condividono un pannello scorrevole alto al massimo 52vh. La prima composizione lasciava poco spazio alla lavagna a 390px pur senza overflow: la correzione conserva almeno 250px di canvas nella prova finale a 360/390/820/1440px. I bersagli principali restano di almeno 44px.

`createArchiveLessonAccess` riguarda l'archivio locale aperto; non equivale a un principal Core e non concede byte remoti. Il replay continua a verificare sessione canonica, consenso e integrità. Un evento di chiusura della sessione Studio invalida il binding.

Il prodotto locale **omette le note private**, come deciso da S00: non è disponibile un port Core autentico con principal e risorsa. Non riusa `demo-student` o lo store del proof consumer. I test S17 conservano la separazione principal/momento/oggetto/versione e le risposte tardive per un futuro host che fornisca il port. Le note non entrano in scena, journal o `.lesson`.

Le didascalie restano risorse Core con pin `id/revisionId/sha256` e rilettura della fonte. Il Core non trasferisce i media locali: un altro archivio richiede import esplicito del bundle `.lesson`.

## Prove

| Verifica | Esito |
| --- | --- |
| Due regressioni sul precedente `9a8ac5f` | RED: 2 fallimenti attesi (editoriale perso; cursore host assente) |
| Stesse regressioni sulla composizione | GREEN 2/2: writer reale e cursore/media/range/callback precedente |
| Studio mirato iniziale | 151/151, 11 file |
| Studio sul prodotto frozen, incluso LessonPassageAuthor | **154/154, 12 file**, `studio-frozen.log.gz` |
| Web media + materiali scientifici | **67/67, 9 file** |
| Typecheck Studio e Web finali | **PASS** |
| Contratto host/consumer senza patch runtime | **PASS**, SHA ReplayView nel log |
| Dominio/HTTP media Core | **9/9**, CAS/history/membership/revoca/anonimo |
| Browser Core + replay composto finale | **PASS**, Chromium `148.0.7778.96` |
| Browser autore/import dai controlli prodotto | **PASS** al primo giro |

Il percorso Core usa database nuovi, due WAV originali e due registrazioni di Poiseuille a portata fissata. Attraversa Materiali → pin esatti → popup ReplayView → TextTrack nativo/waveform → seek da pausa → verifica Core realmente ritardata superata dalla waveform → fine naturale → cambio take → 403/401 → capitolo/cold reload → quattro viewport → ritiro fonte → revoca consenso con waveform nascosta. Asserisce media unico, canvas leggibile e zero errori JS/console/network inattesi. I 401/403/404 attesi sono conservati nel risultato.

Il percorso autore usa il prodotto e MediaRecorder reale con dispositivo sintetico: microfono OFF, annotazione Poiseuille, consenso docente, registrazione, capitolo, navigazione/flush, export UI Materiali, browser nuovo, preview/import UI, marker/cold reload e riproduzione fino alla fine. Non usa uno store alternativo per creare capitolo/import.

### Tentativi precedenti conservati

- `mount-startup-sandbox-failure.log.gz`: Vite non poteva eseguire `spawnSync git`; il retry autorizzato usa escalation, senza modificare policy o inventare SHA.
- `typecheck.log.gz`: il primo helper di test aveva un narrowing TypeScript errato dopo una callback; corretto nel test. Il typecheck finale è verde.
- `browser-first.log.gz`: modulo errato nel fixture di revoca; la run ha inoltre mostrato il warning React sulle chiavi duplicate Materials. Entrambi corretti; nessun PASS attribuito a quella run.
- `browser-final.log.gz` e `browser-before-panel-*`: prova funzionale verde prima della correzione visuale. La definitiva è `browser-responsive-final.log.gz`.
- `core-targeted.log.gz`: otto casi dominio completati, TestClient fermato dopo stallo nel sandbox. Nessun PASS HTTP attribuito; selezione identica con escalation: 9/9 in `core-targeted-final.log.gz`.

## Riproduzione

Usare i lock separati root/Studio e server solo loopback: 5480 Web, 5481 Core, 5482 Studio; proxy `/study`→5481 su entrambi i frontend. Eventuali directory reali di dipendenze riusate via symlink vanno consentite solo nel config QA, senza modificare produzione.

Avviare `handoffs/swarm-v2/S08/qa-server.py --directory <directory-vuota> --port 5481` con `PYTHONPATH=packages/engine:services/study-api`. Il file sintetico `access.json` non va committato.

```sh
ARDESIA_MEDIA_ACCESS=<fixture>/access.json \
ARDESIA_MEDIA_OUTPUT=<output-nuovo> \
ARDESIA_CHROMIUM=<chromium-autorizzato> \
node handoffs/swarm-v2/S08/composition-20261026/browser-proof.mjs

ARDESIA_MEDIA_OUTPUT=<output-autore-nuovo> \
ARDESIA_CHROMIUM=<chromium-autorizzato> \
node handoffs/swarm-v2/S08/composition-20261026/authoring-browser-proof.mjs
```

Il microfono della prova è sintetico. Versioni osservate: Node24.22.1, Chromium148.0.7778.96, Vitest4.1.8, Vite Web8.0.12 e Studio8.0.16 dai rispettivi lock. Nessuna dipendenza/lock modificati.

## Limiti e handoff S00

Non implementati video/HLS remoto, upload riprendibile, Range protetto, grant remoto o revoca delle copie esportate. Le didascalie vengono rilette ogni 15s con deadline5s e svuotate quando la pagina è nascosta: non si dichiara revoca remota istantanea. Nessun ascolto umano, Safari o device fisico certificato. Playback non equivale a apprendimento.

S00 può assorbire #322 in #313 perché il suo head è parent del prodotto e i mount sono reali. Conservare nel merge finale: coda unica Room, `seekRevision`, guard sempre montato, file della scena nel replay, chiavi distinte Materials. S20 deve conservare l'autorità Core senza inventare replay remoto o note private. RUNLOG, NEXT, lock di coordinamento e CI condivisi non sono stati modificati. Chiusure PR, candidato integrato, CI e deployment protetto restano S00.


Il successivo [follow-up consenso](../consent-20261026/README.md) generalizza il guard a tutti i take v2. I log raw di questo snapshot sono compressi losslessly per hygiene; i digest originali e gzip sono registrati nel manifest.
