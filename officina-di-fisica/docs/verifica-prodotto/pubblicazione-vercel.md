# Pubblicazione HTTPS di Officina di Fisica

## Contratto di accettazione registrato prima del codice

Il servizio pubblica la stessa applicazione del ramo officina-di-fisica. Il visitatore apre il catalogo, il lettore apre un proprio quaderno e riprende un tentativo, l’autore ritrova i propri file. La promozione richiede una prova con una sessione conservata attraverso due distribuzioni.

| Confine | Verifica richiesta |
| --- | --- |
| Provenienza | Registrare commit, albero, deployment di prova e produzione. Verificare la release sulla destinazione effettiva. |
| Archivi | Isolare collaudo e produzione. Ripetere l’inizializzazione senza sostituire dati editoriali, risposte, account o storico. |
| Accessi | Esercitare catalogo anonimo, quaderno di prova, logout, due identità, accesso autore e prove C6. Disabilitare il biglietto desktop sul server remoto. |
| Risorse | Consegnare figure e PDF tramite il controllo di accesso canonico. Conservare allegati e fascicoli rigenerati fuori dal filesystem temporaneo. |
| Percorso didattico | Aprire lezione, banco 3D, alternativa testuale, recupero e quaderno agli stessi indirizzi. Controllare focus e navigazione con tastiera. |
| Dispositivi | Eseguire Chromium, WebKit e Firefox. Indicare sistema, viewport, input, riduzione del movimento e hardware effettivo per ciascuna evidenza. |
| Ripristino | Il ritorno alla distribuzione precedente conserva la base dati. Le migrazioni devono rimanere compatibili con il codice precedente. |

La validazione su telefono fisico è rinviata per decisione del proprietario. La validazione con studenti richiede osservazioni indipendenti. Il verbale indica separatamente prove eseguite e verifiche aperte.

## Esercizio del servizio

Il progetto Vercel `officina-di-fisica` ha la regione di esecuzione `dub1`. La funzione Python usa le rotte dell'applicazione locale. La CDN pubblica solo gli asset di `static/`, esclusa `figures/`. Figure, allegati e fascicoli passano dal medesimo controllo di autorizzazione di ogni installazione. La ricerca mantiene intatti i parametri dell'URL.

Per la produzione e le preview si collegano due risorse Turso distinte. URL e token appartengono all'ambiente Vercel corrispondente. Con le due variabili `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` già esportate nel terminale privato, l'operatore installa `requirements.txt` in un ambiente Python 3.12 ed esegue `python tools/prepara_archivio_cloud.py --provision`. Ripete l'operazione a ogni nuova edizione. L'inizializzazione usa i soli sorgenti editoriali distribuiti. Per un archivio esistente le migrazioni conservano bozze e versioni precedenti. Il livello di schema è salvato in `settings.hosted_schema` perché il servizio gestisce direttamente `PRAGMA user_version`.

Il database primario riceve le scritture transazionali. Prima di ogni lettura autorizzata la funzione sincronizza una replica privata nella directory temporanea dell'istanza. Un errore di sincronizzazione interrompe la richiesta. Allegati e PDF generati sono salvati in parti ordinate nella stessa base dati. Una rigenerazione termina quando il file è durevole. L'hash del pacchetto Chromium precede l'esecuzione e la stampa usa il protocollo DevTools su loopback. PDF e figure restano utilizzabili dal browser dello studente senza installare Chromium.

Per assegnare o cambiare le credenziali dell'autore, usare `ASTRA_HOSTED=1 ASTRA_DATA=/tmp/officina-operatore python app.py password-autore` con le credenziali del database della destinazione scelta. Il comando legge la password dal terminale. Il biglietto generato dal launcher Mac è riservato all'installazione locale. Prima di una migrazione amministrativa, creare un backup privato dell'archivio interessato. I quaderni e le credenziali sono esclusi dai sorgenti, dalle prove pubbliche e dai pacchetti.

## Promozione e ripristino

Dalla cartella dell'app sul commit pulito, collegare il progetto corretto con `vercel link --project officina-di-fisica`. Distribuire con `vercel deploy --target=preview`. Verificare la ricerca, due identità distinte, la ripresa del tentativo, il recupero e la rigenerazione di un PDF. Per la produzione usare `vercel deploy --prod --skip-domain -e OFFICINA_COMMIT=<SHA>` e verificare sul deployment esatto `/api/health`, il commit e il percorso autenticato. `vercel promote <URL-verificato>` assegna il dominio pubblico. Lo stesso comando può riassegnare la distribuzione precedente compatibile mantenendo l'archivio durevole.

Con `OFFICINA_BASE_URL=https://officina-di-fisica.vercel.app` eseguire `node tests/browser-pubblicazione.mjs chromium`, `firefox` o `webkit`. I profili `--telefono`, `--tablet` e `--senza-webgl` esercitano il layout e l'alternativa piana. Con `chromium --webgl` il test richiede anche un canvas attivo e misura i pixel che cambiano fra l’inversione del moto e l’arrivo. La suite registra dimensioni, motore, letture dello strumento, focus e screenshot. La pipeline HTTPS esercita anche Edge sul runner Windows. I profili touch locali usano emulazione. La riuscita di una navigazione non misura l'apprendimento.
