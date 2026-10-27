# Raccordo sequenziale per S00

La patch è basata sul solo file Room della fonte S07 `0d809591ca47a3c87878548d59b343d62e7ff7a8`; il suo successivo commit a9c19746 è dichiarato documentale da S07, ma la corrispondenza va verificata nuovamente sul candidato. Non applicare l'intera Room del worktree di controprova. Il branch utility parte da main, senza merge del branch S07 e senza PR impilata.

Con ownership assegnata, dopo aver composto S07:

```sh
git apply --check handoffs/swarm-v2/S14/room-library.patch
git apply handoffs/swarm-v2/S14/room-library.patch
cp handoffs/swarm-v2/S14/RoomLibrary.test.tsx apps/studio/src/whiteboard-library/RoomLibrary.test.tsx
```

Controllare il diff di Room per mantenere la composizione corrente se la patch non applica esattamente. Non rimuovere il filtro legacyBoardScene, l'adapter S07 o il fencing audio. Nessuna modifica CSS, lock o manifest richiesta.

Nel workspace Studio, nella finestra seriale assegnata:

```sh
npm run typecheck
node node_modules/vitest/vitest.mjs run src/whiteboard-library src/__tests__/Room.integration.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Ripetere anche le regressioni S07/audio e gli altri gate richiesti sul candidato finale. Il verde delle utility o della controprova non trasferisce il verde di2332test S07 a una nuova composizione.

Prova nativa richiesta: aprire Room reale, disegnare/selezionare un gruppo, aggiungerlo alla raccolta nativa, reinserirlo, rimuovere uno schema, importare una raccolta autorizzata, salvare/riaprire ed esportare/importare `.lesson`. Verificare almeno tastiera, viewport390/1440, rifiuto projection, errore di salvataggio visibile e import pending prima di export. Il callback del mock non certifica comportamento dell'SDK.

La raccolta è locale alla lezione e non sincronizzata fra account o browser dal nuovo codice. S10 conserva transport/ACL e S00 conserva rilascio. S16 usa un manifest glTF2 separato per asset originali, non il formato della raccolta e non uno snapshot degli scope S07.


## Controprova consegnata del ciclo nativo file/raccolta

Eseguire il runner aggiuntivo sulla composizione finale, indicando la fonte esatta e una directory nuova:

```sh
ARDESIA_S14_SOURCE_ROOT=/percorso/composizione ARDESIA_S14_OUTPUT=/percorso/prova-nuova node handoffs/swarm-v2/S14/prove-library-edit.mjs
```

Il server Studio deve già essere pronto all'origine locale indicata da ARDESIA_S14_ORIGIN (default http://127.0.0.1:55714). Browser seriale e dipendenze già presenti, nessun download. Cinque PASS consegnati per aggiunta/rimozione e roundtrip UI `.excalidrawlib` nel fallback HTML, oltre ai nove del runner principale. I report espongono gli hash fonte; non certificano una composizione diversa. Il picker OS e l'inserimento della tile solo da tastiera restano non verificati.
