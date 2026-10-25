# AUDIO-V2 — capture, sessione, replay e bundle

24 ottobre 2026. Ramo condiviso `codex/ardesia-audio-v2-poiseuille-20261024`,
base applicativa verificata #297 `ae25b93b`; SHA finale e gate complessivi sono
responsabilità dell'integratore. Dati audio e identità dei test sono sintetici.

## Contratto e percorso

`SessionAudioRecorder` usa l'identità aperta dalla Room, `createSessionOnce`,
`updateSessionAudioCAS` e `sessionPaths`. Nessun avvio da consenso salvato.
`start` richiede un gesto e apre soltanto il microfono del docente; `stop`
rilascia subito le tracce, attende il dataavailable finale, assembla solo il
proprio take, scrive e verifica il digest prima del marker canonico e del flush.
Una nuova registrazione produce una nuova identità e un flusso distinto.
I chunk del take in corso restano in memoria fino allo stop: non è una garanzia
di recupero della cattura non terminata dopo crash del browser.

ObjectRefs sono un'associazione esplicita, con ID, versione e label: il journal
rifiuta versioni mai registrate. La vicinanza temporale non produce una
comprensione semantica. `SessionAudioControls` espone stato, consenso iniziale
OFF, start, stop, revoca ed errori; Room ne possiede il recorder per poter
attendere il drain prima di cambio contesto/export/cleanup.

Replay mantiene fonti distinte, gap silenziosi e seek nel singolo take; risolve
consenso, presenza e digest prima di offrire il media. Un browser senza codec
o con errore di decode riceve uno stato esplicito. I link con pin verificano
sessione, digest, tempo, oggetto e versione effettiva della scena storica.
Il tasto per riascoltare riparte dall'inizio del take e la lavagna segue il
tempo: un oggetto annotato durante la registrazione appare al proprio istante.

## Revoca e import concorrente

Revoca e dispose hanno semantiche distinte. Revoca invalida pending permission
e take, salva OFF con CAS, attende scritture precedenti e purge verificato.
Dispose termina tecnicamente la cattura preservando la tail autorizzata.
`revokeStoredAudioSession` consente il comando esplicito del docente sulle
sessioni storiche inattive dopo riapertura/import; usa le stesse primitive CAS.
Non rappresenta un'autorizzazione remota multiutente.

La review indipendente ha riprodotto due resuscitazioni: OFF intervenuto fra
preflight e commit di import, e revisione 999 dichiarata da un bundle ostile.
Il fix agisce al boundary `WorkspaceStore.write`, sotto il lock già esistente:
non regredisce sessioni e non consente media dopo OFF. Lo stage/backup risolve
il target dal record di transazione ed è soggetto allo stesso fence. Rollback
preserva le decisioni CAS concorrenti; revoke elimina copie audio di stage e
backup sotto controllo dell'app. Un ON importato non supera un OFF locale
esplicito per il solo fatto di dichiarare un contatore più alto.

Le copie `.lesson` esportate prima della revoca possono essere esterne al
controllo dell'app: non si promette cancellazione retroattiva. Import in una
nuova istanza priva della decisione locale resta un'operazione distinta.

## Formato e compatibilità

`journal.audio.recording` conserva envelope schemaVersion 2, payload v:1 con
MIME, bytes, SHA-256, mapping temporale e riferimenti. Il bundle mantiene
contenitore schema1 e inventario di tutti i path; con il nuovo kind richiede
minimumReaderSchemaVersion2. Il nuovo reader supporta minimi1 e2 e rifiuta3.
Le sessioni/media mantengono path canonici, senza copie flat o dati della Room B.
La sessione flat obbligatoria storica non determina consenso v2.

## Prove riproducibili

Runtime di questa verifica: Node22.14.0, lock Studio invariato. Profilo runner:

```sh
npx vitest run src/__tests__/AudioV2.test.ts src/__tests__/AudioV2_independent.test.ts src/__tests__/WorkspaceStore.test.ts src/__tests__/LessonBundle.test.ts src/__tests__/LessonBundleSessionIsolation.test.ts src/__tests__/JournalRecorder.test.ts src/__tests__/ReplayView.test.tsx src/__tests__/replayTimeline.test.ts src/__tests__/replayTimelineRoom.test.ts --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm run typecheck
```

Il primo [RED](red.log) conserva 10 fallimenti e5 passaggi: nuovo kind rifiutato
e capture v2 assente. Il test di compatibilità ha poi riprodotto minimo1 invece
di2 per il nuovo kind. I RED della review indipendente sono nella directory
`../review/`, compresi native error, start failure, CAS failure e import races.
Il [log focused finale](green-focused.log) riporta conteggio ed esito del gruppo
sopra; non si sommano i run parziali sovrapposti. La suite completa Studio e la
prova browser nativa/Room sono eseguite separatamente dall'integratore.

I test di classi usano bytes sintetici e un recorder con ordine browser
esplicito, non provano la decodifica di un microfono reale. Comprendono due take
con pausa, salto del wall clock, ultimo evento, short/empty tail, versioni oggetto,
due Room, residuo flat ostile, riapertura senza microfono, nuovo store/import,
missing/corrupt/revoked, pending permission/write, purge failure/retry,
dispose e import concorrente. Typecheck è obbligatorio e distinto da Vitest.

## Limite Engine preesistente

`packages/engine/lessonos/ingest/bundle.py` accetta soltanto membri raw/*,
rifiutando il manifest.json già prodotto dalla base, e interpreta eventi legacy
type/t anziché envelope v2. Non è stato modificato in questo incremento Studio.
Il round-trip Studio non certifica l'ingest Python né ASR/trascrizione. Il primo
task separato è portare tale consumer sul manifest canonico, validare consenso
per-sessione e digest, poi provare una fixture `.lesson` sintetica dello stesso
candidato. Nessuna modifica a gate, dipendenze, solver o policy di inferenza.
