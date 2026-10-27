# Riprodurre il browser S07 su Room reale

Prova sintetica locale, non route prodotto. Eseguire dalla root di un checkout dedicato con le dipendenze Studio del lock installate. Non copiare il fixture nella distribuzione pubblica. Il fixture monta il vero Room, store, journal, PDF loader ed Excalidraw; attiva l'adapter da codice test, non una query prodotto. actor nella query vale solo in questo fixture.

1. Copiare s07-proof.html/tsx/pdf da questa cartella alla root apps/studio del checkout dedicato. Il PDF è originale/sintetico, generabile da make-proof.py eseguito dalla root repository.
2. Avviare Vite dalla root apps/studio con --host127.0.0.1 --port5470 --strictPort (spazi tra flag e valori). È richiesto il consueto alias @ardesia/engine della configurazione Studio. Nella prova su host con node_modules symlink, una config temporanea ha esteso fs.allow solo ai due runtime reali osservati: nessuna modifica alla configurazione prodotto.
3. Da root repository eseguire node handoffs/swarm-v2/S07/repro/browser-proof.mjs. Usa @playwright/test già in Studio, un Chromium e tre context; output di default work/s07-browser-output, sovrascrivibile con ARDESIA_S07_OUTPUT. ARDESIA_S07_ROOT identifica il checkout. La porta è loopback5470.
4. Controllare browser-proof.json, log, screenshot e source inventory. Il runner rifiuta source mismatch, leak e console/page/HTTP inattesi. Alla fine chiude Chromium; arrestare soltanto il proprio Vite e rimuovere i tre fixture dalla root Studio.

Trasporto: il fixture scambia snapshot espliciti con chiamate browser, non websocket né server Core. Bob/Carol aggiungono oggetti per API del fixture; Alice usa mouse reale. Tre contesti isolati non equivalgono a tre utenti autorizzati remoti. Mobile è viewport/touch emulato Chromium, non Safari/iPad/device umano. Nessun microfono abilitato.

La prima prova PASS precedente aveva una metrica sourceEqual falsa perché includeva una riga case priva di source; log originale preservato in evidence/browser-first-pass.*. I tre record actor stampano lo stesso hash; il runner finale filtra e conta i tre actor prima del confronto e fallisce se diversi. Questa è una correzione del reporter, non un rerun prodotto inventato.
