# Due diligence, costi e percorso di integrazione

## Inventario di riuso verificato

Riferimento tecnico `14fd6504b677ee838fea2eee327cafec8d4ba5f5`, tag `officina-di-fisica-v1.1.0`. Il monolite comprende server HTTP Python, casi d’uso, dominio, adapter SQLite, moduli browser e contenuti versionati. Il conteggio dell’edizione è di 6 corsi, 56 lezioni, 181 voci con altrettanti laboratori, 606 quesiti unici e 117 esempi. I laboratori comprendono 44 esperienze con tempo fisico e 137 confronti di configurazioni. Il catalogo comprende inoltre 10 attività di metodo, 10 banchi estesi e 5 laboratori guidati. C6 incorpora contenuti degli altri corsi mantenendo gli stessi ID. L’estensione geometrica di prova ha già attraversato pubblicazione e interfaccia studente. [Tag e prove](https://github.com/AndreaMarro/ardesia/releases/tag/officina-di-fisica-v1.1.0) · [Architettura e inventario](../../../../officina-di-fisica/docs/architettura/README.md)

| Confine | Cosa c’è e come lo sappiamo | Impatto per ciascun concept | Debito o dipendenza reale |
| --- | --- | --- | --- |
| Dominio e percorso | `domain/pathway.py` valida i grafi e decide da dati forniti. `application/pathways.py` riceve un repository con Protocol. | Passo consuma `next` e motivazione. Campo raggiunge il laboratorio dal paragrafo. Margine riferisce lo stesso ID e la stessa edizione. | Granularità attuale prevalentemente per lezione; una mappa più fine richiede revisione editoriale e migrazione additiva. [Caso d’uso](../../../../officina-di-fisica/server/application/pathways.py) |
| Valutazione e persistenza | Valutazione pura, tentativi versionati, storico di famiglie, singola autorità SQLite. | Passo distingue aiuti; Campo conserva previsione e misura; Margine potrebbe conservare le righe confermate. | Verificare iscrizione e diritto sul server; un prototipo locale non prova la ripresa su due dispositivi. [Valutazione](../../../../officina-di-fisica/server/domain/assessment.py) · [Porta di studio](../../../../officina-di-fisica/server/application/study_port.py) |
| Motore e rappresentazioni | `measure/draw` tipizzati per le estensioni scalari, digest e unità, oracolo Python, supporto di timeline nei motori canonici; stato condiviso fra WebGL e tavola. | Passo usa un estratto in sola lettura; Campo è il consumer principale; Margine stampa una proiezione coerente. | La porta scalare non rappresenta da sola ogni modello dinamico. Introdurre una capacità di campionamento temporale solo se un secondo motore ne dimostra il bisogno. [Contratti](../../../../officina-di-fisica/docs/architettura/ADR-002-estensioni.md) |
| Rendering e IA di navigazione | Router e composizione C1 in `app.js` (425 righe nella base), indice di simulazioni separato, route stabili e ritorno al contesto. | Estrarre solo la superficie prescelta come modulo. Conservare i vecchi deep link, le anteprime e i fasci di diritti. | Il ramo C1 e gli altri corsi presentano tassonomie diverse. Portare una relazione oggetto → fenomeno fuori dal renderer riduce duplicazione e dipendenze. [Router](../../../../officina-di-fisica/static/js/app.js) · [Catalogo](../../../../officina-di-fisica/static/js/banchi/catalogo.js) |
| Servizi e API | API OpenAPI versionata per percorso, motori, schemi e lavoro editoriale. Route storiche convivono nel server HTTP. | Un adattatore di presentazione può servire ciascun concept, mantenendo gli stessi casi d’uso. | La superficie documentata è parziale. Descrivere ogni endpoint realmente necessario prima di aggiungerlo; contratti di errore e autorizzazione inclusi. [OpenAPI](../../../../officina-di-fisica/contracts/openapi.json) |
| Carta ed edizione | Impaginazione e fascicoli distribuiti, ciclo bozza/pubblicazione e revisione dei tentativi. | Margine riusa un riferimento stampabile. Campo può restituire una tabella misurata. Passo usa una scheda di richiamo. | Il browser può cambiare impaginazione. L’ID deve risolvere anche per chi possiede un’edizione precedente; verificare stampa reale prima della diffusione. [Impaginazione](../../../../officina-di-fisica/server/printing.py) |
| AI e infrastruttura | Adapter di provider, MCP con capacità di lettura/proposta, validazione e pubblicazione editoriali separate. | Possibile riuso per l’autore in ogni concept. | Un’app studente che chiama modelli direttamente avrebbe effetti economici e di trattamento nuovi. Un OCR facoltativo andrebbe provato sui segni fisici prima di prendere decisioni. [Adapter](../../../../officina-di-fisica/server/adapters) |

**Direzione architetturale.** Mantenere un singolo monolite distribuibile. Le view invocano casi d’uso tramite porte. Le funzioni scientifiche producono misure con unità. Il renderer sceglie la rappresentazione. La registrazione di un tentativo avviene in una sola transazione con riferimento alla versione utilizzata. Gli adapter di persistenza, stampa e AI si collocano al margine. Una vista aggiuntiva deve poter essere rimossa lasciando leggibili dati e tentativi preesistenti. Il campione di confronto è statico e indipendente, con un piccolo modello didattico di prova; il codice delle sue schermate non costituisce un secondo core da integrare.

## Contratti candidati da discutere nella prima PR tecnica

| Capacità | Contratto proposto | Prova e compatibilità |
| --- | --- | --- |
| Ricerca didattica | Da testo e ambito del corso a risultati `{objectId, version, topic, access, matchedLabel}`. Un alias può puntare al banco esistente; «access» informa senza divulgare contenuti riservati. | Test del caso «aree con segno» in C1, dell’assenza di risultati, degli omonimi e dei diritti. Contratto additivo, JSON Schema e client precedente. |
| Campionamento | Da modello installato con ID/versione/digest, unità, parametri e istante a grandezze, geometria e limiti. Il renderer legge lo stato congelato. | Snapshot numerici a estremi, inversione e ritorno a zero, confronto con oracolo e fallback, rotazione camera invariante. Riusare `engine.d.ts` dove sufficiente. |
| Occasione di pratica | Da competenza, famiglia, revisione, esito e uso di aiuto a evidenza e prossima azione motivata. Un ID di tentativo deduplica i retry. | Versioni storiche e progressi già presenti devono rimanere riproducibili. Un tentativo assistito o ripetuto sulla stessa famiglia non moltiplica l’evidenza. |
| Scheda su carta | Da oggetto e revisione a consegna numerata, record di provenienza e spazi compilabili. Rientro via ID leggibile. | Controllo del testo estratto da stampa, dell’unità, del segno e del riferimento. Eventuale QR contiene solo ID e revisione pubblicabili. |

## Unit economics di scenario

Unità di confronto: **euro per sessione che arriva a una risposta di trasferimento**, indipendentemente dal suo esito. Si assume un’edizione con 100 attività preparate, costo editoriale figurativo 30 €/ora e 10.000 sessioni avviate. Minuti editoriali per attività, costo variabile per sessione e tasso di completamento sono ipotesi esplicite. Le cifre coprono preparazione e servizio incrementali; acquisizione utenti, IVA, costi generali e prezzo di vendita richiedono dati commerciali. Le prove HTML servono contenuto localmente senza chiamate a consumo.

| Variabile | Passo | Campo | Margine |
| --- | ---: | ---: | ---: |
| Minuti editoriali/attività (H) | 20 | 40 | 30 |
| Preparazione dell’edizione (H) | 1.000 € | 2.000 € | 1.500 € |
| Costo incrementale per avvio, assistenza inclusa (H) | 0,02 € | 0,03 € | 0,05 € |
| Quota che raggiunge il trasferimento (H) | 70% | 65% | 55% |
| €/sessione con trasferimento a 5.000 / 10.000 / 20.000 avvii | 0,314 / **0,171** / 0,100 | 0,662 / **0,354** / 0,200 | 0,636 / **0,364** / 0,227 |

Calcolo per Campo: `(100 × 40/60 × 30 + 10.000 × 0,03) / (10.000 × 0,65) = 0,354 €`. A 5.000 sessioni l’ordine relativo di Campo e Margine si inverte. Raccogliere minuti di preparazione e costo di assistenza per attività con un registro di lavoro. Raccogliere abbandoni in un pilot con consenso. Il costo di un eventuale provider editoriale si aggiunge al numeratore con `proposte × (token input × tariffa input + token output × tariffa output) + minuti di revisione × costo/minuto`. Nessuna tariffa esterna o efficacia educativa è stata misurata. [Modello ricalcolabile](verifica/decisione.py) · [Parametri](verifica/matrice.json)

## Rischi e mitigazioni

| Rischio | Segnale da controllare | Contromisura / titolare |
| --- | --- | --- |
| La vista 3D distrae dal segno | Buona manipolazione, spiegazione errata al trasferimento | Didattica: aprire la vista su richiesta, confrontare due letture, usare verbalizzazione e tabella. |
| Il quaderno fa ricopiare troppo | Tempi elevati o segni persi sul telefono | UX: massimo tre campi nel pilot; confronto carta sola, opt-out della foto e correzione manuale. |
| La progressione crea falsi «stabili» | Insuccesso su famiglia nuova a 7 giorni | Didattica: misurare il trasferimento per famiglia; consentire ritorno al prerequisito e revisione delle soglie. |
| Si duplica scienza o gestione dei diritti | Divergenza tra tabella, SVG, WebGL o accesso via link storico | Engineering: un solo modello di dominio, test di contratto e permessi sui punti di ingresso. |
| Il nome è poco memorabile o indisponibile | Scarsa attribuzione dopo distrattore, omonimia | Ricerca/brand: test in cieco e verifica del marchio prima dell’adozione. |
| Si interpreta la preferenza del committente come domanda di mercato | Scelta alta in demo ma scarso riuso o indisponibilità a pagare | Prodotto: osservare rientro e contesto d’acquisto, raccogliere alternative realmente usate. |
| Aumentano costo AI e rischio di divulgazione | Aumenti di token, citazioni errate, trascrizioni non confermate | Responsabile editoriale: budget, corte finestre di contesto, cancellazione dell’input e verifica umana. Il percorso locale funziona a provider assente. |

## Roadmap di PR atomiche

Questa tabella conserva le alternative considerate nella prima versione. La revisione comparativa successiva delimita **un solo incremento per la decisione attuale**, con percorsi d’ingresso, riuso dei componenti esistenti e criteri di accettazione. [Integrazione del recupero del segno in C1-Q027](revisione/integrazione.md)

Stime di lavoro tecnico/editoriale in giornate-persona, da verificare con il team. La decisione sul prodotto appartiene al committente. Il punto di ritorno è sempre la route canonica nella sua versione corrente.

| PR candidata e dipendenza | Confine e stima (H) | Gate di accettazione | Ritorno |
| --- | --- | --- | --- |
| 0 · Questa consegna | Dossier, tre prototipi offline e prove isolate. | Stesso hash dell’albero applicativo della 1.1.0, matrice ricalcolabile, tre percorsi verificabili. | Chiudere il confronto o aprire una nuova versione documentale. |
| 1 · Ricerca, dopo selezione della direzione da sperimentare | Verbale pilota e materiali controbilanciati, 2–4 gg più follow-up. | Reclutare con consenso, due osservatori codificano gli errori, soglie e abbandoni pubblicati in aggregato. | Riaprire la scelta se l’ipotesi principale cade. |
| 2A · Se Campo | Un collegamento sul caso C1, un alias e il suo contratto di ricerca. 1–3 gg. | Dalla consegna e dalla ricerca colloquiale si raggiunge il banco giusto; ospite vede tipo di accesso. Controlli C6 e deep link esistenti verdi. | Disabilitare il nuovo ingresso, mantenere gli stessi ID. |
| 2B · Se Passo | Una sessione C1 alimentata dal percorso e dal sistema di tentativi già presenti. 2–4 gg. | Ripresa, aiuti e famiglia corretti, ritorno all’indice, nessuna doppia registrazione. | Ripristinare il punto di ingresso originario. |
| 2C · Se Margine | Una scheda C1 con ID/revisione e tre righe verificabili. 2–4 gg. | Stampa leggibile, segno meno preservato, feedback della prima riga, completamento interamente digitale. | Conservare il fascicolo e il normale quesito. |
| 3 · Solo sul ramo di prodotto selezionato, dopo 2 | Un secondo argomento tramite lo stesso contratto, 2–5 gg. | Test scientifico indipendente, keyboard, screen reader, touch fisico quando disponibile, navigazione ospite e con accesso. Costo effettivo per seconda attività registrato. | Disattivare solo la nuova superficie, riesaminare lo schema. |
| 4 · Opzionale, dopo evidenza di valore e scelta editoriale | Una proposta AI per un passaggio approvato, 2–4 gg. | Fonte corretta, verificatore deterministicamente concorde, revisione e fallback in assenza di provider, budget per proposta accettata. | Scollegare l’adapter, conservare contenuti verificati. |

Le alternative 2A, 2B e 2C sono mutuamente esclusive in questa decisione. Estensione all’intero syllabus, nuovi servizi e promozione del marchio richiedono un mandato successivo.
