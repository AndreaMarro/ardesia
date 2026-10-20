# 8. UI, UX, accessibilità e prestazioni

## Quattro percorsi di ingresso
Pubblico: trova argomento → prova attività → vede offerta → lascia disponibilità. Studente: oggi → corso → lavoro → consegna. Tutor: oggi → gruppi/richieste → aula o correzione. Amministratore: impostazioni organizzazione/billing, senza accesso implicito ai contenuti didattici.

Una sola app con navigazione per ruolo. Il vecchio principio «apri sempre la lavagna» apparteneva alla fase docente-centrica: il nuovo ingresso ordinario è la prossima azione utile. Un deep link di lezione apre direttamente l’aula. Nessun lungo onboarding prima dell’assaggio gratuito; accesso reale prima di materiale personale.

## Wireframe della home studente
```text
ARDESIA                          Profilo
Oggi  |  I miei corsi  |  Quaderno

Fluidi • incontro 2 di 4
Prossima lezione: data confermata nel tuo fuso
[Entra nella lezione]

Da riprendere
Il tuo passaggio sulla pressione      [Continua]
Una correzione restituita             [Apri]

Nel tuo quaderno
Originale / tentativi / aiuti / fonti
[Aggiungi]                    [Consegna]
```
Le date e contatori sono letti dal server. Empty state: «Non hai ancora consegne» e azione reale; niente grafici finti, punti o percentuali di capacità inventate.

## Wireframe regia
```text
Oggi | Gruppi | Studenti | Da correggere | Materiali

Richieste compatibili       Prossime lezioni
[Proponi un’edizione]        [Apri aula]

Da correggere
Studente / attività / versione / stato / attesa
[Originale]  [Proposta AI]  [Rubrica]  [Restituisci]

Gruppo: partecipanti / posti / tutte le date / presenze
[Programma] [Consegne] [Pagina pubblica] [Calendar]
```
Non costringere il tutor a rientrare nella lavagna per gestire un pagamento. Non far correggere una foto fuori dal suo contesto per accelerare un contatore.

## Canvas e mobile
Desktop: foglio principale con massimo due pannelli laterali aperti; toolbar contestuale all’oggetto. Mobile: la stessa risorsa usa sequenza di schede e viewport focalizzato, non miniatura illeggibile di desktop. Tornare a canvas conserva ID e stato. Studente può scegliere dettagli estesi quando serve; UI piccola non significa spiegazioni tronche.

Il gesto «Consegna» è distinto da «Salvato su questo dispositivo». Accanto allo stato: locale / sincronizzazione / ricevuto dal tutor / restituito. Se offline, bozza disponibile ma nessuna falsa ricevuta remota. Un feedback in arrivo per una vecchia versione mostra avviso di obsolescenza.

## Design system proposto
Sfondo #F7F7F4, testo #17201C, accento #1F6B55; stati non affidati al solo colore. Font di sistema o una famiglia già autorizzata, niente decine di download. Testo base 17–18px, formule 20px quando il contesto lo consente, line-height 1.5, tab target 44px come obiettivo. Griglia spazi 4/8/12/16/24/32; bordi sobri, ombre leggere solo per elevazione funzionale. Nessun glassmorphism obbligatorio, avatar generico o gradienti decorativi.

Personalizzazione: logo/tema del tutor, densità, dimensione testo, strumenti visibili e modalità presentazione. Schema di configurazione e reset; stesso markup accessibile, nessun tema che rimuove focus o contrasto. White-label avanzato dopo il pilot, ma non dipendenza da un docente hardcoded.

## Criteri testabili, non «UX perfetta»
Consegna già autenticata in ≤3 azioni principali, esclusa scelta file/lettura. L’apertura della correzione riporta esattamente la versione. Tastiera completa su menu e modali, focus ritorna al trigger, annotazione con alternativa testuale, formule con rappresentazione leggibile, reduced-motion. Test axe automatico + scenari tastiera; penna/Pencil e lettore schermo reale richiedono prova hardware, non certificazione da emulazione.

Performance target: LCP≤2.5s, INP≤200ms, CLS≤0.1 dove misurabili a p75 nel profilo dichiarato; test locale è proxy, non misura di campo. JavaScript pubblico e board su chunk distinti; niente PDF/video/solver in home. Immagini ottimizzate senza perdere originale privato. Liste grandi paginate; query indice composite; niente subscriptions globali con tutti i compiti.

Misurare baseline bundle e tempo sul percorso. Se una libreria nuova aumenta molto il primo caricamento, lazy o rinvio. Video live iniziale è link a servizio già disponibile, non motore proprietario. Le nuove funzioni non devono ritardare la prima azione utile.

## Addendum V4 — micro-interfaccia Diario degli errori
`Oggi`: una sola card «Riprendi questo passaggio» quando ci sono eventi verificati e risolvibili. `Il mio lavoro → Diario degli errori`: filtri essenziali `Da riprovare / Verificati / Tutti`, ricerca per corso/concetto, una scheda per nucleo. Ogni scheda mostra originale/versione, errore confermato o «da verificare», suggerimento approvato, nuova attività e storico apribile. Tastiera, font grandi, mobile 390px e leggibilità formule; niente colori rosso-verde come unico codice. La regia docente vede pattern del gruppo aggregati solo dove consentiti e casi privati della propria assegnazione, non il diario collettivo pubblico.

**Usability criterion:** trovare un errore già discusso e riprendere un esercizio nuovo in non più di 3 azioni principali una volta autenticati. La metrica verrà misurata con un test d'uso reale e non attestata dalla sola simulazione Playwright.
