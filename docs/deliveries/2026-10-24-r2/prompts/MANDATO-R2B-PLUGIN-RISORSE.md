# Mandato aggiuntivo R2B — microcorsi, plugin e risorse vive

Da allegare al mandato R2. Non sostituisce i canoni e non richiede di fermare un incremento già prossimo alla verifica per avviare un altro audit generale.

## Esito richiesto

Completa una capacità originale che sia subito utile ai microcorsi Fisica Semestre Filtro e riusabile in Ardesia. Il microcorso è il primo impiego commerciale del Teaching OS: la lezione produce materiali, esperienze ed evidenze che migliorano il lavoro successivo. Non trasformare Ardesia in una collezione di quiz o di simulatori scollegati.

Non limitarti a Poiseuille. Scegli il prossimo bisogno dal programma e dagli errori realmente presenti nei CoursePack, tenendo conto di ciò che è già stato implementato. Porta la slice scelta dalla UI del docente alla prova dello studente, fino alla revisione e al materiale per la prossima lezione. Una demo anonima può mostrare il metodo; non equivale a iscrizione, account, pagamento o beta privata.

## Prima di scrivere

1. Genera lo stato canonico in un checkout isolato. Leggi AGENTS root/package, CANON-INDEX, PRODUCT-CANON, ARCHITECTURE-CANON e ADR-0004.
2. Leggi gli ultimi addenda del RUNLOG, NEXT-SESSION-PROMPT e protocollo memoria. Verifica le conclusioni sullo SHA attuale: una correzione nuova va datata, senza cancellare quella vecchia.
3. Verifica LIVE head, base, CI esatta, review e lavori concorrenti. Identifica il successore reale se la PR citata è già stata integrata o superata.
4. Riusa le consegne AUDIO-V2, REA Deep Build, R1 e R2 come prove datate. Non rifare le missioni o rinominare un vecchio reset come nuova funzionalità.
5. Ricostruisci i consumer attuali di ToolHost, SDK, registry dei simulatori, authoring, packageFile, catalogo locale, installazione, firma, integrità e revoca. Il canone plugin contiene anche reperti di giugno: verifica il codice prima di affermare che qualcosa manca.

## Portafoglio didattico oltre Poiseuille

Ordina i candidati per beneficio al microcorso, riuso e costo. Non costruirli tutti nella stessa PR.

| Area del percorso | Esempi di oggetti vivi candidati | Prima verifica |
| --- | --- | --- |
| Strumenti e meccanica | Conversioni dimensionali, vettori, grafici posizione/velocità/accelerazione, forze ed energia | Modelli e domande già nel Core; unità, segni, conservazione e dati di riferimento |
| Fluidi e termica | Pressione relativa/assoluta, galleggiamento, portata, diagrammi di stato e trasformazioni | Riusa units-v1, hydrostatic-v1, buoyancy-v1 e Poiseuille dove ancora presenti e corretti |
| Elettricità e magnetismo | Cariche/campo/potenziale, costruzione circuito, Kirchhoff, carica RC e grafici | Riusa solver e scene esistenti; autorizzazioni, licenze e confine con AndreaMarro/kirchhoff |
| Onde, ottica e radiazioni | Oscillazione, interferenza, raggi/lenti, attenuazione e quantità fisiche | Programma del pack corrente, ipotesi e limiti; niente grafica che contraddica il modello |

Questa tabella è un insieme di candidati, non una dichiarazione di copertura del programma ufficiale o di revisione scientifica. Collega ogni scelta a obiettivo, errore osservabile, prova diversa e fonte della lezione.

## REA come trasferimento di comportamento

Usa la distribuzione e gli strumenti effettivamente disponibili; registra versione, runtime e differenza fra CLI, MCP esposto e semplice registrazione configurata. Non riconfigurare globalmente il client per una singola indagine.

Per ogni donor scegli una domanda funzionale stretta: gesto → stato del modello → visualizzazione → feedback → errore → recupero → riapertura. Cerca prodotti come Desmos, GeoGebra, CircuitJS, Mathigon, H5P e Numbas quando quel percorso è legittimamente accessibile. Goodnotes nativo osservato e documentazione Goodnotes letta sono evidenze differenti.

Conserva una ricevuta REA con ID/digest, target/versione, azioni realmente riuscite e almeno un negativo. Se un controllo manca da tastiera o mobile, documentalo e progetta la correzione originale in Ardesia. Un timeout non dimostra l’assenza di una funzione; una home o un onboarding non dimostrano una lezione completata.

Il transfer ticket deve collegare osservazione, specifica originale, componente già esistente, implementazione, RED/GREEN, verifica visuale e costo totale. Una sola osservazione può suggerire più idee, ma non diventa automaticamente più trasferimenti verificati. Non copiare codice, asset, contenuti o branding proprietari; verifica separatamente licenza del codice, dei materiali e dei dati. GPL/AGPL, limitazioni commerciali e obblighi di attribuzione sono criteri di scelta prima dell’adozione. Preferisci implementazioni originali dei comportamenti osservati.

Usa SciSpace per individuare lavori pertinenti e verificarne limiti, poi controlla le fonti primarie. Non chiamare peer reviewed un preprint perché compare nell’indice; non trasferire percentuali di efficacia al prodotto senza un esperimento adatto. Il costo REA include preparazione, esecuzione, analisi, errori, implementazione, verifica e manutenzione. Se il confronto diretto o i token non sono misurati, scrivi UNKNOWN, non «risparmio».

## Contratto di creazione e distribuzione

Prima classifica la capacità: funzione universale nel Core; strumento riusabile nel Plugin; materia/metodo nel Pack; sequenza didattica nel Workflow. Una risorsa di soli dati non deve ricevere privilegi da plugin eseguibile.

Riusa i protocolli reali di ToolHost e CoursePack. Proponi un’estensione piccola e versionata solo dove un consumer dimostra una lacuna. Il contratto deve coprire:

- Identità stabile di plugin/risorsa e istanza, versione, compatibilità host/protocollo, publisher e licenze.
- Schema degli input e dello stato, unità, dominio, modello canonico e versione; renderer distinto dal calcolo scientifico.
- Superfici di montaggio, capability minime, storage per istanza, rete dichiarata, timeout, dispose e revoca.
- Provenienza di fonte/lezione/sessione/oggetto/revisione, digest dei byte e confini di condivisione. Un timestamp non è comprensione semantica confermata.
- Eventi didattici tipati e proiezioni delle evidenze esistenti. Previsione, risultato del modello, aiuto dichiarato, procedimento e feedback umano rimangono distinti.
- Persistenza della scena e round-trip nel bundle canonico su un nuovo store. Niente seconda session authority, carriera studente, CorrectionDraft, database o motore di pubblicazione.
- Pacchetto, firma/integrità, preview, approvazione, installazione, aggiornamento compatibile, rollback, disabilitazione e revoca tramite i servizi esistenti. Non indebolire i controlli per montare il primo esempio.
- Stati comprensibili per versione non supportata, fonte mancante, modello non disponibile, rete assente, asset corrotto o revocato. Mai sostituire silenziosamente la head alla revisione esatta.

Dimostra il ciclo reale: docente sceglie/crea → prova in preview → collega una fonte e pubblica intenzionalmente → studente prevede/manipola/sbaglia/recupera → nuova prova → docente ritrova l’esito. Per audio e media conserva consenso e gesto manuale; non trasferire il consenso salvato in avvio automatico del microfono.

La distribuzione iniziale può essere un pacchetto e catalogo locale già supportati. Un marketplace remoto, pagamenti o installazione di codice arbitrario non sono prerequisiti per una prima capacità vendibile e non sono autorizzati implicitamente da questo prompt.

## Ingegnerizzazione e accettazione

Lavora per slice verticali piccole e utilizzabili, con ownership di file separate e un revisore indipendente. Un solo candidato di integrazione: evita catene di PR speculative e API generiche senza due consumer reali. Mantieni il monolite modulare e l’unica autorità del Core finché misure di carico e autonomia non giustificano un confine diverso. Scelte architetturali devono ridurre costi misurati, non aumentare il numero di servizi.

Per la slice scelta richiedi: modello corretto e input invalidi rifiutati; nessun risultato mostrato prima della previsione; tentativo ricevuto prima dell’avanzamento quando previsto; fonti esatte; aiuti persistenti e impossibili da cancellare riaprendo il client; isolamento tra due utenti, due corsi e due istanze; retry idempotente e writer concorrenti; import in nuovo store, revoca e dispose. L’evaluator numerico non approva il procedimento.

Verifica 360/390,820,1440px, tastiera e focus, testi lunghi, font e prefers-reduced-motion. Le animazioni devono spiegare il modello, con pausa/dispose dove necessario. Misura JS/CSS, richieste, listener, tempo di caricamento/interazione e costo dei campioni prima/dopo; nessuna nuova libreria senza beneficio concreto. Conserva screenshot reali e correggi i difetti di primo utilizzo emersi dalla review.

Usa i workspace/team cloud già confermati; non richiedere nuovamente gli stessi accessi se ancora funzionanti. Scegli preview protette quando il mandato le autorizza, identifica SHA e artefatto serviti e verifica il percorso reale. Accesso al provider, deploy READY, pagina accessibile, iscrizione e beta privata sono cinque verifiche distinte. Non compiere produzione, acquisti, pubblicazione privata o migrazioni distruttive senza il perimetro umano richiesto.

La chiusura amministrativa delle PR segue la decisione umana sul merge: completata la slice, esegui review/CI sul candidato esatto e porta la PR a un esito esplicito. Una PR chiusa senza merge è archiviazione, non integrazione. Non lasciare lavoro dimenticato e non chiudere PR concorrenti senza verificare dove codice e prove sono conservati. Preferisci successive slice indipendenti dalla base integrata.

## Consegna e memoria obbligatorie

Consegna in italiano: funzione utilizzabile, percorso docente/studente, come provarla, branch/PR/SHA, test, screenshot, Evidence, costi e limiti. Distingui completato, bloccato e non misurato. La rapidità commerciale richiede una demo autentica e un contatto funzionante, non claim anticipati di disponibilità.

Prima di terminare appendi al RUNLOG una voce datata con base/SHA, risultati, motivi, alternative scartate, errori, correzioni, prove e limiti. Conserva le conclusioni precedenti e data le smentite. Aggiorna NEXT-SESSION-PROMPT con il primo incarico ancora valido. Termina la nuova voce con3–5task prioritizzati: primo passo, dipendenze, accettazione ed evidenza per ciascuno. La memoria è lavoro esplicito verificato, non una promessa di aggiornamento automatico da parte di ogni host.
