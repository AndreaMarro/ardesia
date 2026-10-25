# Review attuale runner nativo e due screenshot — 25 ottobre 2026

Sola lettura, nessuna modifica al repository e nessun nuovo run browser da questo revisore. Questo verdetto sostituisce le osservazioni sui due difetti del runner precedente.

## Binding dei file effettivamente letti

- `bin/qa/audio-cross-view.mjs`: SHA256 `3d8974ba83635bfe3ebb2e67b60bec41b32b49861f1d507ccd47ee1717b3fc65`, mtime UTC 2026-10-25T13:27:22.857720+00:00.
- `bin/qa/audio-cross-view.html`: SHA256 `0021fe56c40e962bdb1c625c09f969c59abb42972e806ae74933793e25d2cafe`, mtime UTC 2026-10-25T13:27:02.813926+00:00.

## Runner: esito

Nessun P0/P1 individuato in questa review. `node --check bin/qa/audio-cross-view.mjs` PASS.

I due rilievi precedenti sono chiusi nel perimetro dichiarato: Promise.race racchiude run() compresi import/setup e restituisce un errore esplicito a 45 s; Windows è esplicitamente rifiutato, gli spazi e gli apostrofi dei percorsi POSIX sono codificati. Non riporto come residuo l'assenza del timer prima di setup o l'assunzione implicita di supporto Windows.

Ho verificato l'ordine delle risorse: out/server/browser/cancelled hanno scope esterno a run(); dopo gli await di setup e acquisizione Vite/browser, ensureWithinDeadline rileva il timeout e chiude anche risorse che hanno completato tardi. Il finally esterno usa Promise.allSettled per browser/server e rende FAIL un errore di cleanup. Il timeout o un errore di scenario non può trasformarsi in PASS; le risorse tardive passano dalla guardia. La pulizia delle risorse è asincrona: 45 s è la deadline del verdetto dello scenario, non una prova di hard-kill del processo allo stesso millisecondo.

Il template conserva dati sintetici e controller di produzione in due tab, con device audio finto e Web Locks/BroadcastChannel reali. Header e limiti dichiarano correttamente assenza di prova UI/hardware. La ricevuta distingue Git HEAD, diff e hash diretti, marcando questi ultimi come parziali e non transitive dependency manifest. Il browser nuovo e l'origin loopback separano lo storage del test; la directory temporanea unica conserva le prove.

### Un residuo P2 marginale di portabilità POSIX

Alla riga 35 encodeURI non codifica `#` e `?`, validi nei nomi di directory POSIX. La prova pura `new URL('/@fs'+encodeURI('/tmp/qa#case?x/apps/studio')+'/src/store/WorkspaceStore.ts', 'http://127.0.0.1:1234')` produce pathname `/@fs/tmp/qa` e sposta il resto nel fragment: il bootstrap fallisce in tale checkout. Gli spazi/apostrofi e il percorso Ubuntu corrente sono coperti dal fix già presente; non è un blocco P0/P1 del candidato attuale. Codificare i segmenti o anche quei due caratteri chiuderebbe il caso.

## Review visuale effettiva

Esaminati con view_image, incluso originale a 390 px:

- `/private/tmp/ardesia-r2-20261024/apps/web/test-results/public-preview/recovery-390.png`, 390×3838.
- `/private/tmp/ardesia-r2-20261024/apps/web/test-results/public-preview/initial-1440.png`, 1440×1784.

Non sono visibili tagli orizzontali, sovrapposizioni o controlli illeggibili nei due scatti. La recovery distingue voce sintetica, testo di aiuto, risposta assistita e limiti del modello. Gli input/select principali hanno min-height CSS 46 px; i pulsanti primari misurano 48 px nel raster. Sono osservazioni circoscritte, non una certificazione WCAG.

P2 di primo utilizzo osservato: il test scatta con viewport alto 1000 px. Nello screenshot iniziale desktop il pulsante Metti alla prova occupa y=1038–1085, quindi il primo viewport mostra parte del form ma richiede scroll per l'azione finale. Nella recovery mobile il form segue grafico e risultato e il pulsante è a y=2055–2102; un richiamo/ancora ai controlli o meno distanza verticale può ridurre lo scorrimento. Lo screenshot recovery rappresenta uno stato con aiuti espansi, non l'initial mobile.

I due PNG non dimostrano focus visibile, ordine di tab, screen reader, zoom o contrasto di ogni stato. Non attribuisco qualità estetica assoluta o esito di apprendimento a queste immagini. Nessuna ulteriore espansione dell'audit.

Addendum integratore: il P2 su #/? nel percorso è corretto codificando ciascun segmento POSIX con encodeURIComponent (apostrofo esplicito), poi ricomponendo gli slash. Verifica manuale di spazio/#/?/apostrofo e nuovo run nativo/CI richiesti sul commit. SHA256 runner dopo correzione: `93f240397431f35f8eb2d00ff0c55c592b41617dbbfe32035468fdad4ad9699e`. Il termine di45s è un verdetto con cleanup delle risorse di proprietà, non un hard kill arbitrario di processi esterni.
