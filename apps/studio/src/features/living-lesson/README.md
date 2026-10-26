# S17 — Living Lesson

Il docente registra consapevolmente due o più take, collega oggetti/versioni, aggiunge marker e capitoli, corregge la lavagna e prepara un segmento canonico. Lo studente recupera lo stesso marker con il suo audio e la scena storica, prende una nota privata e riapre il contesto. Nessuna interpretazione semantica automatica della voce.

## Esecuzione riproducibile

Dalla root del repository:

```sh
cd apps/studio
npm ci
npm run typecheck
npx vitest run src/features/living-lesson/tests --pool=threads --maxWorkers=1 --no-file-parallelism
node src/features/living-lesson/consumer/verify-patch.mjs
npx vite --config src/features/living-lesson/consumer/vite.config.mts --host 127.0.0.1 --port 5187 --strictPort
```

Aprire `http://127.0.0.1:5187/src/features/living-lesson/consumer/index.html`. Il consumer monta Excalidraw, LessonOS, JournalRecorder e SessionAudioRecorder reali della main. Il suo ReplayView è quello canonico: il config di prova applica in memoria **solo** `docs/replay-view.patch`, previa verifica SHA256 della sorgente. Non viene creato un player, recorder o journal parallelo, né modificato il file condiviso. Una sorgente differente rifiuta la patch.

Con il server attivo, da un altro terminale nello stesso package:

```sh
node src/features/living-lesson/consumer/verify-browser.mjs
node src/features/living-lesson/consumer/verify-track-ended.mjs
```

Questi runner usano il device Chromium simulato e il vero MediaRecorder. Non sono prove con microfono fisico. Browser plugin non disponibile nella sessione; usato Playwright installato dal lock di Studio. Nessun deployment o permesso remoto viene concesso.

## Contratti

- `LivingLessonReplay`: proiezione Wavesurfer BSD di `ReplayCursor`, con l'unico elemento audio e cursore epoch di ReplayView. Lo slot `captionContent: ReactNode` ospita il consumer S08 senza copiarne dati/authority. Un fallback mantiene i controlli audio quando il decode dei peaks fallisce. Mantenere il componente montato per tutta la vita del media autorizzato; `showWaveform={false}` nasconde e distrugge solo la waveform. Il preflight usa lo snapshot e il resolver audio canonici, verifica il binario e lega il player allo SHA della sessione: anche OFF→ON fra due tick invalida i dati già caricati.
- `LessonAccess` e `PrivateNotes`: port forniti dall'host, che conserva identità e autorizzazioni. Il consumer dichiara identità sintetiche locali. Il fingerprint della nota include sessione, recording/hash, istante e oggetti/versioni; le note private restano fuori dall'export `.lesson`.
- `model`: validazione versionata dell'extension `livingLesson` dello scene envelope. Risoluzione esatta di registrazione/sessione/hash/oggetti; versione o file mancanti producono errore esplicito.
- `serialization`: conserva solo l'extension pubblica validata dopo `serializeAsJSON`; non copia campi privati del vecchio envelope. Il filtro delle proiezioni ink rimane quello S07, verificato separatamente sulla sorgente esatta di PR311.
- `docs/replay-view.patch` e `docs/room-serializer.patch`: hunk per S00, contro main a00f2f40 e digest in PATCH-BASE.json. Non applicate ai file condivisi. Dopo PR313 S00 deve comporre la richiesta seek con il suo seekRevision/preflight e ripetere i test, senza applicare ciecamente il pending-seek hunk di main.

L'extension viaggia nel normale scene file della `.lesson`, coperto dal manifest canonico. La prova comprende import in WorkspaceStore nuovo e il writer Excalidraw storico, che senza patch scarta l'extension. **Un vecchio writer non modificato continua a perderla**: non dichiarare compatibilità di editing con quella versione. Il vecchio reader può aprire la lavagna, ma S00 deve integrare la conservazione prima del mount nel prodotto. Non è uno schema Core o un'autorizzazione di pubblicazione.

La preparazione per l'Aula riusa `prepareLessonPassage`: esporta l'intera take canonica e richiede la conferma nel corso. Marker/capitoli locali e il loro istante preciso viaggiano nel file `.lesson`; non si inventa un nuovo payload Core di condivisione.

## Prove e limiti

`evidence/browser/result.json`, screenshot390/820/1440 e import touch: due take native da device finto, oggetti diversi, correzione/revisione storica, pausa/seek/fine naturale/restart, nota privata/cold reopen, export/import nuovo archivio, revoca in ascolto e logout. Verificati un solo elemento audio e src invariato al mount/destroy della waveform. `evidence/track-ended/result.json`: stop delle tracce simulate e logout durante cattura attiva, con finalizzazione reale del MediaRecorder. Nessun avvio automatico del microfono.

Unitari: integrità/roundtrip, file o revisione mancanti, contesto straniero, registrazioni sovrapposte, fence di selezioni/azioni, note separate per contesto esatto, letture/salvataggi tardivi e filtro S07 composto con serializer reale. I binari della fixture unitaria verificano integrità ma non sono audio decodificabile: il campione browser `.lesson` è la prova del media reale simulato.

REA, donor e fallimenti sono descritti in docs/ACQUISITION.md, ACQUISITION.json e REVIEW.md. I primi runner sono stati interferiti da FileProvider; i PASS provengono dal checkout locale a sorgenti ferme. Nessun test hardware, ascolto umano, Safari/iPad, distribuzione privata Core remota o composizione integrata311+313+318+319 certificata. Il canone vigente e il limite licenze Studio non autorizzano pubblicazione implicita. Merge e certificazione integrata restano a S00.

## Addendum integrazione prodotto — 26 ottobre 2026

Il prodotto `d13f331907c7f72f26ddcdfd79c9fe508d660a3a` assorbe S17 nel ramo S08 e lo monta nel ReplayView reale. Le istruzioni storiche di applicazione patch qui sopra sono superate: CanonicalReplay importa direttamente l'host tipizzato, il config non trasforma sorgenti e verify-patch compila il contratto reale. I file patch e le evidenze originarie restano storia della proposta.

[Handoff attuale](../../../../../handoffs/swarm-v2/S08/composition-20261026/INTEGRATION.md): guard attivo anche a waveform nascosta, Room con una sola coda, note private omesse dal prodotto locale finché manca un port Core autentico. Il proof consumer storico con attori sintetici resta separato.

Il [follow-up consenso34e1db4](../../../../../handoffs/swarm-v2/S08/consent-20261026/README.md) rende facoltativo il momento nel renderer e applica lo stesso guard a take v2 senza objectRefs, tramite il vero recording. Non cambia il requisito di riferimenti degli editoriali e non crea note senza momento/port autentico.
