# S08 — acquisizione sottotitoli, 26 ottobre 2026

Addendum al primo batch locale; le sue prove e conclusioni restano storiche e intatte. Implementazione `93deff59`, aggiornata con merge ordinario di main `992d1a0b` nel candidato `48251a32`. Stessa PR [313](https://github.com/AndreaMarro/ardesia/pull/313), nessun nuovo Core o servizio.

## Capacità acquisita e consumer

Materiali → passaggio registrato → Modifica capitoli e trascrizione → Importa sottotitoli o capitoli. Il docente owner apre un file UTF-8 WebVTT/SRT o incolla il testo; analizza, controlla i frammenti con millisecondi, annulla oppure sostituisce esplicitamente la trascrizione o i capitoli nella bozza. Il salvataggio successivo usa le stesse risorse/revisioni, CAS, sessioni e autorizzazioni Core. L'analisi e l'applicazione alla bozza non inviano scritture. Ricerca, export e replay del primo batch consumano lo stesso indice.

Il componente adottato è il parser/tokenizer completo distribuito da `media-captions` **0.0.18**, MIT, copyright Rahim Alwer. [Origine](https://github.com/vidstack/media-captions/tree/7a471b752d284e3017bcaf0f2abe64075ecc3508); [tarball esatto](https://registry.npmjs.org/media-captions/-/media-captions-0.0.18.tgz). Integrità SHA512 verificata, 29 file upstream verificati byte per byte; [manifest](../../../apps/web/src/features/lesson-media/vendor/media-captions/PROVENANCE.json). Il codice originale non è modificato. La distribuzione server e i tipi ufficiali sono acquisiti nel solo namespace S08: quel parser funziona anche nel browser senza dipendere da un `VTTCue` nativo. Renderer, SSA e ASR non sono esposti dal consumer. Nessuna dipendenza runtime transitiva, modifica a package/lock, script d'installazione, font o asset esterno.

Il bridge `server.d.ts`, l'adapter dei vincoli e l'interfaccia sono originali Ardesia. L'import lazy conserva il caricamento differito. Il testo della licenza è incluso sia nel donor sia nel download dell'interfaccia. Manutenzione: aggiornare solo con nuovo pin, integrità, confronto dei file, test upstream/adapter e browser. Rollback: rimuovere il mount `CaptionImport` dall'editor e i file dell'acquisizione; gli indici salvati restano nel formato Core precedente.

## Valutazione REA e riuso

Registro `registry/TARGETS.json` letto: 139 risorse; baseline/hash nel [manifest di provenienza](rea/captions-provenance.json). Nessun identificatore precedente riscritto. Riuso first-party esistente: indice editoriale, parser fail-closed dell'indice, autorizzazioni/rilettura fonte, editor, salvataggio CAS/idempotenza create, ricerca, export WebVTT e player Studio. Nessun parser di import VTT/SRT già adottato osservato nel consumer.

| Candidato | Provenienza / licenza verificata | Decisione e motivo |
| --- | --- | --- |
| media-captions 0.0.18 | npm ufficiale, gitHead `7a471b752d284e3017bcaf0f2abe64075ecc3508`, MIT nel tarball | **ADAPT**: parsing VTT/SRT e tokenizer già completi, tipi ufficiali, nessuna dipendenza runtime. Adapter impone i limiti Core e conserva i confronti letterali. |
| mozilla/vtt.js 0.13.0 | [repository](https://github.com/mozilla/vtt.js), metadata npm Apache-2.0 | **DEFER**: offre WebVTT, non copre da solo l'import SRT richiesto; packaging meno adatto al consumer TypeScript attuale. Nessun codice acquisito. |
| w3c/webvtt-parser 2.2.0 | [package ufficiale](https://github.com/w3c/webvtt.js/blob/master/package.json), CC0-1.0, zero dipendenze | **DEFER**: parser/validator WebVTT utile per controprove future; l'import SRT richiederebbe un altro adattamento. Nessun codice acquisito. |

Il primo esperimento REA è stato eseguito sul pacchetto npm distribuito: tre file della variante `prod` selezionati (`dist/prod.js`, `dist/prod/index.js`, `dist/prod/srt-parser.js`), 3 JS analizzati e zero parse failure. Evidence padre `ev_fc40bc80683d603577656ea24be178e7e91d3599d6494349067267734759a3c6`, [summary conservata](rea/captions-rea-summary.json). Copertura applicativa parziale, 36 file non selezionati, 1.665 unknown semantici e retention troncata: non prova il runtime o l'intera libreria. La variante server poi acquisita è identificata separatamente dai byte nel manifest e dai test effettivi; non viene equiparata al grafo prod. Nessun risparmio temporale moltiplicativo misurato o rivendicato.

Consultazioni S12/S15 e contratti pubblicati nel rendezvous #306: [START](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405600205), [consumer/prove](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405702643), [decisione packaging aggiornata](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6405805776). La proposta iniziale di dipendenza npm è superseduta e non applicata: il file `media-captions-dependency.patch` è solo un esperimento storico, **non va applicato**. Non sono dichiarate raccomandazioni ricevute o approvazioni di S12/S15 in assenza di risposta.

## Errori, correzioni e prove al checkpoint

- Il donor rifiuta il BOM UTF-8 iniziale: riprodotto, normalizzato dall'adapter prima del parser. CRLF mantenuto nei tempi, normalizzato solo come terminatore testuale.
- Il donor ignora blocchi orfani anche in strict: riprodotto. L'adapter conta tutti i blocchi supportati, rifiuta blocchi senza tempi/testo e confronta il conteggio con i cue effettivamente letti. Nessun import parziale o troncamento automatico.
- La review tecnica ha riprodotto il P2 «Δp < 10 kPa» → «Δp». Quattro regressioni RED; la guardia ora consuma solo markup caption riconosciuto e preserva gli altri simboli/tag come testo. GREEN anche per `0 < x < 5 e y > 2`, maiuscole SRT, entità, export e reimport. I tag sono sempre testo React, mai HTML eseguito.
- Il primo test di salvataggio aveva un mock che trattava GET come POST: corretta la fixture, nessun cambiamento all'API prodotto. La prima esecuzione dei test upstream con entry browser in Node falliva per `window` assente; eseguiti poi 12 test upstream immutati sulla distribuzione server corretta. Il FAIL non è una prova di incompatibilità nel browser.
- **29 test namespace PASS** sul vendorizzato: 16 parser, 4 import UI e 9 regressioni del primo batch. **12 test upstream PASS** (timestamp SRT, timestamp/header VTT) in ambiente Node, separati dalle prove UI. Review read-only: 10 import/export/reimport, assenza di `VTTCue` nativo, 29 file verificati contro manifest/tarball; nessun nuovo finding azionabile dopo il fix. Nessuna approvazione scientifica umana.
- CI esatta `48251a32`: tutti i check SUCCESS, run [40251773718](https://github.com/AndreaMarro/ardesia/actions/runs/40251773718), marketing40251773693, readiness40251773686, contract40251773690. Il check CodeRabbit dichiara review skipped per PR draft; non contato come review. Il compiler locale annunciato nel commento6405848608 non è partito dopo interruzione: nessun suo PASS rivendicato.

Soglie: file 64 KiB, 100 frammenti/50 capitoli, indice Core 20.000 caratteri, testo cue 8.000 e titolo capitolo160. Tempi crescenti, senza sovrapposizione e dentro la durata immutabile del passaggio. Un file incompatibile va corretto/diviso: niente ritaglio, riordino, merge o retiming silenzioso. Anteprime cancellate/obsolete e salvataggi pendenti non possono sostituire la bozza corrente.

## Debito e prossimi batch

L'acquisizione importa testo temporizzato, non trasferisce audio/video e non attribuisce apprendimento alla visione. La videoteca remota, upload riprendibile/quarantena/worker/Range/revoca su byte remoti, sottotitoli nel player Studio e attività canoniche a timestamp restano lacune esplicite. S00 integra e distribuisce; S10 mantiene server/storage/auth. Nessun merge/deploy di S08.

1. **P0 integrazione:** S00 rilegge head e required checks esatti, esegue controprova import→Core→reopen e integra la #313; accettazione main/post-merge e consumer reale, non semplice CI di branch.
2. **P1 sottotitoli nel player:** primo passo contratto con owner Studio per leggere la revisione indice autorizzata sulla stessa recording/session/hash; accettazione seek/pausa/fine/cue/accessibilità e fonte ritirata su byte reali. Nessuna nuova autorità di consenso.
3. **P1 media remoti:** primo passo S10 definisce port chunk/hash/quarantena/retry/Range e grant/revoke; accettazione interruzione/restore/negativi HTTP reali. Nessuna API mock presentata come servizio.
4. **P1 attività contestuali:** raccordo con S05/S06/S10 per avviare un'attività canonica dal timestamp conservando fonte/revisione e ricevuta; prova di isolamento e ripresa, senza equiparare ascolto e apprendimento.

## Riscontro conclusivo del 26 ottobre

Anche il vendorizzato finale è stato analizzato con REA: padre `ev_9ab0041e4e3ec0ab564a5daf54f38b4da89881b266ed45952980181bfca55b24`, digest artefatto `118f24d8ffb72cc6646fd314c755031411acbb3a6330a2f09a5e68f6c273c3ca`. Tre JS selezionati,41.925byte,zero parse failure;27file non selezionati,1.557unknown semantici/retention troncata. [Summary](rea/captions-vendor-rea-summary.json); bundle distinto esportato. Non è runtime né copertura completa.

Browser Chromium148 PASS sulla fonte48251a32:7gruppi di controlli con CoreSQLite/sessioni/risorse/revisioni effettivi, VTT/SRT/CAS/reload/search, tempi e operatori, malformed/over64KiB, tastiera1440/390 senzaoverflow, licenza scaricata byte-esatta, autorizzazioni401/403, ritirofonte blocca save/export lasciando bozza editabile. Primo preview367ms osservato, nessun percentile o risparmio generale rivendicato. Zero pageerror/consoleerror inattesi;404atteso sufonteritirata. Primo FAILharness corretto dopo DOM/accessibilitysnapshot, non bugprodotto. Screenshot letti dal parent. [Risultato](captions-browser-result.json).

La vecchia proposta npm è ora archiviata in `rea/superseded-media-captions-dependency.patch`: non applicarla. Le quattro priorità sopra rimangono il prossimo lavoro. Merge/deploy/approvazioni non eseguiti daS08.
