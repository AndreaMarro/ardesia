# R2 — esperienze riusabili per i microcorsi

Consegna del 25 ottobre 2026. [Draft PR #301](https://github.com/AndreaMarro/ardesia/pull/301), branch `codex/ardesia-r2-experiences-20261024`, base #300 `6a81d870fd1f390444ef5acbe6bc42203104fa63`. Primo codice prodotto in `bec05cc8172393b153b7d8ea56ae48f1afa95ef0`, finale in `36cdba353401c80b92cc94f256b106238c7610f8` dopo i fix di diario e replay mobile; i commit successivi aggiungono prove e memoria. Non è codice già integrato in main.

L’incremento porta **Idrostatica** nel percorso reale dell’Aula e nella demo del microcorso; introduce una composizione versionata di esperienze sopra Core/CoursePack, indizi progressivi in Poiseuille e un grafico di Taylor calcolato dal Core. Nessun nuovo database, solver nel browser, LMS o libreria.

## Come provarlo

La [preview Vercel protetta](https://ardesia-fisica-preview-p4t6b0w96-andreas-projects-6d4e9791.vercel.app) richiede l’accesso autorizzato al progetto. È un pacchetto pubblico di soli20file; non contiene API, Studio, database, token o materiali privati. La protezioneSSO è rimasta attiva. Non è una pubblicazione commerciale o una beta autenticata.

1. Landing → Fluidi e termodinamica → «Entra nella lezione interattiva».
2. «Pressione e profondità» → prevedere per esempio2000Pa → confrontare19620Pa, conservando il proprio errore.
3. Cambiare profondità, densità e riferimento relativo/assoluto: ogni cambio richiede una nuova previsione prima del valore e del grafico.
4. Usare gli indizi progressivi e «Cambia fluido: una nuova prova». Le due nuove prove alternano23544Pa e116040Pa, con dati e riferimento diversi.
5. «Chiedi disponibilità» riporta al contatto dello stesso percorso. Si prepara una manifestazione d’interesse: non crea account, iscrizione o pagamento e non invia il messaggio automaticamente.

In Aula, su ambiente sintetico locale: docente Fluidi → «Prepara l’aula» → «Pressione e profondità · percorso guidato» → «Apri la lavagna». Il docente annota un oggetto, registra con consenso esplicito, invia una proposta all’Aula e conferma la fonte con una trascrizione. Lo studente apre lo stesso episodio, collega la revisione esatta, prevede e consegna; dopo l’errore recupera il passaggio, corregge con aiuto dichiarato e affronta pressioni assolute e condizioni differenti. Il docente aggiorna le consegne e usa feedback/diario esistenti. Il numero è un confronto con il modello, non una valutazione automatica del procedimento o della comprensione.

Il media audio resta nello store locale di Studio: un nuovo browser mostra prima l’indisponibilità e riproduce solo dopo importazione esplicita del bundle `.lesson`. Non si pretende che la fonte Core trasporti già i byte audio fra dispositivi. Un collegamento temporale o a oggetto scelto dal docente non è comprensione semantica automatica.

## Cosa è cambiato

| Capacità | Riuso e comportamento |
| --- | --- |
| Esperienze compositive | Manifest di soli dati, versione/digest e pin CoursePack; renderer ammessi e avanzamento dopo ricevuta. Endpoint `learning-experiences?editionId=fluidi&format=composable`; default storico e ricevute v1/v2 preservati. |
| Idrostatica in Aula | Tre problemi:19620Pa relativa;120945Pa assoluta;114335Pa con superficie80000Pa e profondità3,5m. Originali, assistenza, fonte, retry e revisioni nei servizi canonici. |
| Idrostatica pubblica |36stati esportati dal Core, geometria/curva SVG e riferimenti distinti; nessuna seconda legge scientifica nel frontend. |
| Taylor |41campioni, riferimento, scarto e bound dal Core; controlli del grado accessibili, tabella alternativa e fallback esplicito per server vecchi. Il controllo non invia una nuova richiesta prima della previsione. |
| Poiseuille |Prima orientamento sul vincolo, poi relazione; i dati e il risultato non vengono svelati dal primo indizio. |

Questi sono consumer originali del dominio esistente. Non sono un marketplace, un editor universale o un protocollo di plugin eseguibili già completati.

## Prove, ricerca e prossimo impiego

La [validazione](validation.md) distingue codice, artefatti, CI sul merge ref e prove native. I ticket nelle selezioni [A](evidence/rea/A/A-transfer-ticket.md), [C](evidence/rea/C/C-transfer-ticket.md), [D](evidence/rea/D/D-transfer-ticket.json) e la [missioneB](rea-B-audio.md) collegano osservazioni REA reali, negativi, diritti, specifica originale, codice e test. Goodnotes anonimo si ferma al login: non viene contato come nuova funzione audio ricostruita.

La [ricerca applicata via SciSpace e fonti primarie](research.md) sostiene slice piccole, confini modulari e un solo Core. Costi totali REA/metodo diretto, efficacia didattica e capacità di carico in produzione restano UNKNOWN. Sono misurati separatamente costo CPU/payload Taylor e asset/tempi locali del browser.

Il [mandato aggiuntivo R2B](prompts/MANDATO-R2B-PLUGIN-RISORSE.md) include meccanica, termica, elettricità, onde/ottica e il ciclo di creazione, versione, distribuzione e revoca di plugin/risorse sopra i protocolli esistenti. Il [testo guida](prompts/GUIDA-CHAT-ARDESIA.txt) è pronto da incollare insieme ai mandati. Priorità: un bisogno utile del microcorso diventa una capacità riusabile di Ardesia; evitare una PR e un sistema diversi per ogni simulazione.

## Correzioni finali dopo la prova reale

La prima prova completa ha trovato due difetti che sono stati corretti nella stessa PR: il diario di Idrostatica ereditava il form di Poiseuille dall’edizione; il replay conservava l’inquadratura desktop sullo schermo mobile. Ora il diario seleziona il form dalla provenienza canonica di ciascun originale e dalla capability dell’edizione. Il replay osserva le dimensioni effettive del canvas, attende il layout e annulla il lavoro pendente quando il contenitore sparisce. Non modifica scene, tempo o consenso e preserva pan e zoom a dimensioni ferme. Le prove RED e quelle successive rimangono distinte.

## Gate residui

Revisione scientifica/editoriale umana, ascolto della voce e approvazione dei quattro esempi DRAFT restano pendenti. Nessuna pubblicazione pubblica, produzione, DNS, acquisto o migrazione. La beta remota con Auth/Storage/inviti, il microfono hardware, i dispositivi fisici e l’apprendimento degli studenti non sono dimostrati da questa preview. Idrostatica arriva alla revisione e a un’osservazione manuale CANDIDATE nel diario; non attesta la chiusura VERIFIED_RESOLVED di un’attività successiva strutturata per questo modello.

Il desiderio umano è portare tutte lePR a un esito e ridurre le catene. La301 è l’unico incrementoR2; dipende dalla300 perché la base precedente non è ancora integrata. Non chiudere senza merge perdendo l’integrazione, né fare merge contro il mandato precedente. La scelta merge/archiviazione è esplicitamente richiesta al responsabile; non vengono chiuse PR concorrenti per supposizione.
