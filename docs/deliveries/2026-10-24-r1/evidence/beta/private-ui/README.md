# R1 — runner privato locale A/B

Runner fuori dal repo: `run-r1.cjs`, recupero selettivo dello storico `docs/deliveries/2026-10-24-rea-deep-build/evidence/poiseuille/run-bridge.cjs` (#299). `node --check` PASS. Browser plugin non disponibile in questa sessione: viene usato il runner Playwright richiesto, con dipendenze già bloccate e senza installazioni.

La prova è: Aula docente → Studio e cattura nativa sintetica → condivisione esplicita della fonte → studente in un contesto indipendente → previsioni A/B revisione2 → fonti originali → correzione del tutor → diario → nuova prova → verifica umana del solo tentativo indicato.

Accettazione prevista:

- Origine fissa `http://127.0.0.1:5417`; non tocca il server #299 su5412. File fixture sintetico, commit esplicito e manifest candidato privato richiesti. Verifica hash dei sorgenti, inventario e asset prima e dopo la UI; rifiuta un artifact da tracked-diff non vuoto.
- Due browser context: docente e studente. Auth fixture HTTP prima dei listener di evidenza; nessun token, cookie, storageState o trace di rete salvati.
- Web→Studio stesso origin con canale effimero. Consenso e gesture espliciti, nessuna cattura al mount; native MediaRecorder riceve un tono WebAudio, non un microfono reale e non voce di una persona. Byte salvati e replay realmente decodificato, non uno stato di successo simulato.
- Una sola conferma crea la fonte Core `lesson-passage`, con riferimento, revisione, sessione, digest e oggetto reali. La fonte viene mantenuta in tutte le ricevute.
- Contesto studente nuovo: la fonte Core resta leggibile, ma non riceve automaticamente audio o scena locale del docente. Fallimento di replay esplicito da conservare come limite di portabilità remota. L'eventuale successivo import `.lesson` è un gesto di file separato, documentato; non è cloud sync e non dimostra P1 remota.
- A-v2: pressione fissata e raggio doppio →Q16; errore su vincoloQ →risposta ricevuta immutabile, recupero della fonte esatta, correzione assistita e parent originale. Transfer η2/L2/r1 aQ fissata →Δp4; visual Core Q1/Δp4/v1.
- B-v2: piccoli rapporti di raggio, poi compensazione η2/L0,5/r1 aΔp fissata →Q1; visual Core Q1/Δp1/v1. Parametri canonici confrontati, non solo testo UI.
- Ogni risposta mantiene l'assistenza riportata dal Core e il testo che esclude un'attestazione di padronanza autonoma. Il controllo v1→v2 di disponibilità precedente resta coperto dai test HTTP root, senza inventare una seconda prova UI.
- Il tutor seleziona la consegna con l'errore preciso, pubblica un feedback sul tentativo, seleziona il testo originale e crea un'osservazione con resource/revision/quote esatti. Lo studente consegna una prova distinta; solo il comando del tutor porta il diario a `VERIFIED_RESOLVED`.
- Screenshot1440 e390, overflow, no pageerror/console error o warning/rete fallita, font osservati locali conHTTP200. Ricevute e comandi sono dati sintetici, senza header Auth. Nessuna prova di autenticazione remota, RLS cloud o approvazione scientifica umana è rivendicata.

Esecuzione dopo che root ha congelato, committato e costruito il candidato integrale e predisposto lo store nuovo:

```sh
ARDESIA_WEB_ORIGIN=http://127.0.0.1:5417 \
ARDESIA_DEMO_ACCESS=/PERCORSO/fixture-sintetica/demo-access.json \
ARDESIA_CANDIDATE_MANIFEST=/PERCORSO/candidato/candidate-manifest.json \
ARDESIA_EXPECTED_SHA=SHA40DELBUILD \
ARDESIA_PRIVATE_UI_OUT=../r1/beta/private-ui/run-final \
node ../r1/beta/private-ui/run-r1.cjs
```

Il percorso output deve essere nuovo. Le prove vengono conservate con directory0700 e file0600. Il bundle audio rimane qui in work, non nel repo né nel candidato distribuito. Gli errori conservano DOM e screenshot del nostro prodotto per correggere il runner o segnalare un finding; non si modifica il frontend da questo incarico.

## Esecuzione sul candidato c762e30

Commit `c762e30af0dbfb709a68468a71df16449e96c1b5`, artifact `/private/tmp/ardesia-r1-candidate-c762e30`, API/UI5417 e solo store sintetico `/private/tmp/ardesia-r1-private-qa`. Runtime browser runner Node22.14.0. Artifact, sorgenti e asset sono stati verificati contro il manifest prima e dopo la continuazione conclusiva. Nessun endpoint remoto o probe Auth è stato rieseguito.

Il percorso è verificato in **segmenti collegati**, non come un run continuo verde. Le ricevute sono sempre quelle effettivamente prodotte nel browser, rilette dal Core nei contesti nuovi; nessun esito fallito è stato riscritto o sommato a un conteggio di test riusciti.

| Segmento | Risultato e limite |
| --- | --- |
| `run-final-c762e30` | Cattura, ponte, fonte Core e replay nativo riusciti; stop del runner per selettore errato: Materiali è raggiungibile dal link Torna alla lavagna, non direttamente dal replay. Nessuna consegna studente creata. |
| `run-final-c762e30-2` | Prime due previsioni A riuscite; secondo errore del runner: il titolo dello stato di errore replay è un paragrafo nel contenitore alert, non una heading. Due ricevute restano dello studente01. |
| `run-final-c762e30-3` | Studente02, già membro ma senza consegne precedenti. Sette previsioni A/B canoniche, correzione assistita, Aη2/L2→Δp4, Bη2/L0,5→Q1, visual Core coerenti, fonte esatta, byte nativi e import manuale riusciti. Finding concreto: il tutor con workspace caricato prima delle consegne vede ancora i vecchi dati passando a Correzioni. Nessuna nuova lettura del workspace avviene al cambio view. |
| `run-review-c762e30` | Pagina tutor fresca: fonte, sette ricevute e stessa identità verificate immutabili; feedback restituito e osservazione CANDIDATE salvata. Un assert del runner confrontava l'intero ref workspace (che include contextId) con la proiezione resourceId/revisionId: errore del runner dopo il comando riuscito. Nessuna incongruenza della fonte. |
| `run-diary-c762e30` | Continuazione GREEN dello stesso thread, senza ripubblicare feedback o osservazione: conferma tutor, prova distinta studente, stato PRACTISING privo di autoverifica, reload tutor esplicito, comando umano e stato finale VERIFIED_RESOLVED. Quote originale e riferimento della fonte esatti. |

La fonte del run3 è l'unica fonte collegata alle sette ricevute considerate; i due preparativi hanno lasciato fonti sintetiche nel medesimo store, mai confuse con la fonte verificata. Il passaggio da studente01 a studente02 non nasconde risultati precedenti: la guardia di assenza di precedenti è stata ripetuta per studente02 e le ricevute precedenti non sono incluse nelle sette.

I due contesti di run3 e la continuazione non hanno pageerror, richieste fallite o errori/warning console. I dodici screenshot utili del percorso A/B e diario a1440/390 non hanno overflow orizzontale. Sono stati ispezionati visivamente i trasferimenti A/B e la verifica finale. Le17 risposte font osservate nel run3 sono tutte HTTP200 e sul medesimo origin, sotto `/studio/`; non è una nuova prova dell'editor MathLive non aperto.

Il replay nel contesto studente nuovo fallisce esplicitamente prima dell'import: **il riferimento Core non trasferisce audio o scena locale**. Il bundle `.lesson` è stato esportato e importato con gesti separati, poi i byte sono stati decodificati e l'oggetto esatto evidenziato. Questo dimostra portabilità manuale, non Storage cloud o disponibilità remota. L'audio di QA è un tono sintetico WebAudio: il testo didattico è stato scritto nel form, non trascritto dalla voce né validato semanticamente rispetto al tono.

Il finding di aggiornamento tutor resta **aperto a c762e30**, riprodotto dal DOM e dal codice `App.navigate`/`Review`. Root prepara un comando esplicito “Aggiorna consegne” sul Core esistente; quel delta avrà un commit, artifact e prova separati. Gli esiti A/B e diario qui sopra restano attribuiti a c762e30 e non vengono retrodatati alla patch.

`execution-ledger-c762e30.json` collega hash, ricevute, fonte, thread e segmenti. `evidence-sha256.json` elenca i file conservati; i bundle e le credenziali non vanno nel candidato o nella consegna pubblica. **Beta remota, RLS cloud e approvazione scientifica umana restano NOT_RUN / non attestate.**

## Delta706316f — aggiornamento esplicito

Commit `706316f0582f88366cd3cad6c5c1227537a6c419`, manifest `1d127951b073265e2f42b7f5748cc563b01b99eaa19352a046dfabf108eebc1f`, stesso store senza reseed. Una sola consegna aggiuntiva è stata inviata dalla vera UI studente dopo avere aperto la lista tutor; nessun percorso A/B ripetuto. Il Core conserva l'assistenza `SUPPORT_REQUESTED`/`model-result` perché il rapporto era già stato reso disponibile a quello studente.

`run-refresh-706316f` prova che il nuovo comando, attivato da tastiera, rilegge il workspace, include la nuova consegna e mantiene filtro e originale selezionato. **RED browser:** il `disabled` nativo durante pending fa perdere focus; `run-offline-706316f-2` registra `activeElementAfterRefresh.tag = BODY`. I test jsdom non riproducevano questa semantica nativa. Root prepara un delta separato con `aria-disabled` e il fence già esistente; nessuna modifica prodotto da questo runner.

La continuazione `run-offline-706316f-2` ha verificato anche errore e riprova sulla ricevuta aggiuntiva già persistita: vero `BrowserContext.setOffline`, errore visibile, fonte/filtro conservati, ritorno online e lettura Core riuscita senza duplicazioni. Il risultato mantiene `passed: false` per il focus noto e `offlineRetryPassed: true`; non maschera il RED. Modulo Web realmente servito confrontato con l'hash dell'artifact706, anche mentre il checkout veniva preparato per il fix seguente. Gli errori di rete indotti e i messaggi `ERR_INTERNET_DISCONNECTED` sono distinti dagli errori inattesi.

`run-offline-706316f` è il primo tentativo di questa continuazione: due pulsanti “Riprova” (errore globale del corso e locale Review) rendevano ambiguo il locator e una promise pendente ha interrotto il salvataggio finale. DOM, screenshot e log sono preservati; la seconda esecuzione ha usato il comando locale e nessun nuovo invio. `execution-ledger-706316f.json` collega le prove senza alterare quelle c762. `run-focus-final-r1.cjs` ripete soltanto refresh/focus/offline/retry sulla medesima ricevuta quando root fornirà il nuovo artifact, senza nuove previsioni o riscritture del Core.

## Delta finale9121948 — focus e retry verificati

Commit `91219486ddf270582bef1c2e0bda2a66796e6e78`, manifest `3251cb61eb10e4513cafceb1e6b8698a92e03ba48ede383f89a1f20581d3ed58`, sorgenti `8211844a37af1894dc104955f7389473e7556544f3980469d55be3c24f5a2d4b`. La UI usa `aria-disabled` durante pending e mantiene il fence contro comandi sovrapposti. Nessun nuovo invio: la prova usa la singola ricevuta già creata nel delta706.

`run-focus-9121948-2/result.json`: **PASS**, `keyboardFocusPreserved: true`, `activeElementAfterRefresh = BUTTON / Aggiorna consegne`, `offlineRetryPassed: true`. Tastiera, selezione, filtro, errore offline reale e riprova sono stati verificati senza duplicare la consegna. Nessun pageerror o errore inatteso; gli errori `ERR_INTERNET_DISCONNECTED` sono intenzionali e circoscritti alla lettura `/study/workspace`. Manifest, inventario sorgenti e asset verificati prima e dopo; il modulo Web effettivamente servito ha l'hash dell'artifact912. Il primo tentativo912 aveva già focus corretto e retry ma un wrapper di provenance generato dal runner entrava in ricorsione al controllo finale: raw preservato, corretto solo il runner, quindi prova ripetuta senza nuovi invii.

Il percorso A/B resta prova del commitc762, l'inserimento/aggiornamento prova del commit706 e il focus/retry finale prova del commit912. Non vengono riattribuiti retroattivamente alla nuova build né trasformati in un unico run continuo verde. Il nucleo Core/API è invariato fra gli artifact; il delta è del consumer UI. Il limite audio fra contesti e la beta remota non verificata restano invariati.

`selection-publicable.json` seleziona **20 file**, inclusi tre runner e sei PNG del solo nostro prodotto. Esclude `.lesson`, credenziali, DB, trace, DOM e screenshot di fallimenti del runner. `focus-red-706316f.json` è una proiezione del RED con hash dei report raw, senza stack con percorsi personali; i raw rimangono in work. L'inventario originale è una traccia di provenienza e **non implica che tutti i file conservati siano archiviati o committati**. Root sceglie il percorso della consegna finale.
