# Revisione tecnica indipendente — convivenza dei lotti

Scope: sola estensione integration.py (exercise_registry e COHORT_CODE), test_registry_coexistence.py e dominio richiamato. Nessuna modifica a core, candidati, registro o checkpoint. Letto il diff: CODE ed exercise_package restano invariati; nuovo percorso usa lo stesso import_drafts canonico e un solo SQLite temporaneo, con pacchetti importati separatamente entro il limite canonico di100. Il report distingue fixture sintetiche da dati studenti e non pubblica.

Letti i controlli di payload salvato, storico versioni, live heads, pubblicati prima/dopo, idempotenza, grading, riferimenti a skill, choose_retest, follow_up e assessment.trace. La ripetizione della stessa famiglia non conta come transfer; un aiuto non conta come autonomia; il transfer differito usa altra famiglia e TRANSFER_INTERVAL. Il test di grading verifica il consumer sulle chiavi, non costituisce prova scientifica della chiave: quella resta ai verificatori indipendenti. Le fixture di apprendimento sono chiamate pure e non scrivono tentativi, coerentemente con il conteggio invariato.

## Finding aperto: hash del registro catturato dopo la lettura dei nomi

exercise_registry legge prima names tramite load_registry e load_activity_registry, costruisce paths e hash pacchetti, poi cattura registry_sha. Una modifica concorrente fra lettura dei nomi e digest del registro può essere accettata: il digest iniziale e finale rappresentano la nuova versione, mentre la coorte rappresenta quella vecchia. Il nuovo test copre una modifica nel subprocess, ma non questa finestra precedente.

Controesempio riprodotto in directory temporanea senza modificare repository o database. Un load_registry controllato legge dal file il registro con il solo batch fixture; immediatamente dopo la lettura il file passa a fixture più not-exercised, poi la funzione restituisce il risultato appena letto. load_activity_registry restituisce nessuna revisione e runtime_fingerprint è costante per isolare la proprietà. Il subprocess controllato restituisce i path effettivamente richiesti: soltanto fixture.json. exercise_registry accetta e aggiunge il digest51218471d9e082b1fbdf604b15f3e06d60008e038fe7570b06b3caeab2596385 del registro nuovo che contiene anche not-exercised. La simulazione isola il controllo di coerenza temporale; non finge di verificare un’importazione scientifica o un database reale.

Correzione proposta all’integratore: acquisire il digest del registro prima delle letture che determinano la coorte e conservarlo nel controllo finale (idealmente verificando che resti stabile anche durante la preparazione dei path); aggiungere una controprova che muti il registro subito dopo la lettura ma prima del vecchio punto di cattura. Un’eventuale modifica a load_activity_registry merita lo stesso controllo, perché legge e valida lo stesso registry.json. Non esiste un secondo file di registro attività separato da proteggere.

Stato: finding comunicato a root, nessun PASS tecnico complessivo finché il varco non è chiuso e riletto. Approvazione umana NOT_RUN; nessuna pubblicazione. La verifica scientifica048–051 prosegue separatamente.

## Rilettura della correzione — finding chiuso

Il registro viene ora acquisito in registry_bytes una sola volta prima di qualsiasi discovery; il digest è calcolato su quei byte. Entrambi i loader esistenti ricevono lo stesso file privato temporaneo scritto da quello snapshot, quindi domande e revisioni attività non possono mescolare due edizioni live. La directory dati SQLite è distinta dal file snapshot. Il controllo finale confronta il registro sorgente attuale con il digest pre-discovery; pacchetti, runtime e protocollo conservano le rispettive guardie. Nessuna seconda pipeline o importatore. CODE ed exercise_package invariati.

Ho ripetuto indipendentemente il controesempio originale, adattando soltanto il parametro file del loader: lettura dello snapshot, immediata mutazione del registro live che aggiunge not-exercised, restituzione dei nomi vecchi. Ora exercise_registry rifiuta con ValueError “Registry, packages or runtime changed during coexistence verification”. La prova non ha mutato file del repository. Eseguiti inoltre i tre test freschi test_registry_coexistence: 3/3 OK in1.540s, inclusa convivenza effettiva sullo stesso SQLite temporaneo e il caso di discovery.

Letta la CI: invoca lo stesso --registry e confronta il report riproducibile versionato, poi conserva l’artefatto tecnico privato. Il report principale va rigenerato dall’integratore per il nuovo protocollo; non è stato modificato dal revisore. Nessun finding residuo nello scope letto, nessuna certificazione scientifica o di apprendimento reale dalle fixture sintetiche.

Impronte dei byte riletti:
- tools/corpus_engineering/integration.py: `b75896135e8b880cfe3300bfba6b3132a2cc53dbb5ae544c1c9746d1b4b6b320`
- tests/corpus/test_registry_coexistence.py: `7ffcc8125c6e97d49fb871dfeb5b97ebdeb52cdd2426ffb80c31f00cddefd3ee`
- ../.github/workflows/cric-corpus.yml: `ee7590b8d0b348206ab7a5b683b8c3002d71b40ac06ea89907cd9450d060dc73`

Approvazione umana NOT_RUN; nessuna pubblicazione.
