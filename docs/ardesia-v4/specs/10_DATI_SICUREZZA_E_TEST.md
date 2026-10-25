# 10. Dati, autorizzazioni e criteri di prova

## Tabelle e confini
Nomi proposti: `organizations`, `memberships`, `course_templates`, `course_editions`, `sessions`, `enrollments`, `seat_holds`, `assignments`, `resources`, `resource_versions`, `submissions`, `feedback_revisions`, `learning_events`, `outbox`, `calendar_bindings`, `provider_cost_records`. La migrazione finale deve riusare tabelle equivalenti già presenti, non creare copie con altro nome. In questo piano `cohort` è un sinonimo descrittivo di CourseEdition, non una seconda entità.

Ogni record didattico/gestionale ha organization_id; tutti i collegamenti che possono attraversare tenant hanno vincolo composto coerente o prova equivalente. Ogni query frequente ha indice su scope+tempo/stato. Gli import privati non vanno in schema pubblicamente esposto. Per ogni tabella indicare owner, lettori, scrittori e retention prima della prima migrazione.

## Matrice accessi minima
| Risorsa | Studente proprietario | Compagno | Tutor assegnato | Altro tutor/org | Admin commerciale |
|---|---|---|---|---|---|
| Bozza personale | RW | NO | NO finché non condivisa | NO | NO |
| Consegna snapshot | R + nuova revisione | NO | R + feedback | NO | NO |
| Feedback restituito | R | NO | R + nuova revisione | NO | NO |
| Biblioteca corso | R se abilitato | R se abilitato | pubblica/revoca versioni | NO | solo metadata autorizzati |
| Note private tutor | NO | NO | RW | NO | NO |
| Prezzo/incassi | propri acquisti | NO | secondo ruolo economico | NO | secondo organizzazione |
| Roster | proprie informazioni | minimo previsto dall’aula | R | NO | metadata autorizzati |

Un ruolo `authenticated` da solo non autorizza una riga. `user_metadata` non è una fonte di privilegi. Valutare revoca membership ad ogni operazione sensibile; JWT può restare valido fino a scadenza. URL firmati hanno vita limitata e i file già scaricati non sono revocabili. RLS si testa attraverso l’API e la reale identità utente, non con service-role.

## Mutazioni critiche e transazioni
Tutte le mutazioni passano dal contratto Core; UI e MCP chiamano le stesse operazioni. Le tabelle seat/enrollment non offrono INSERT/UPDATE diretto allo studente. La prenotazione è una transazione singola con row lock dell’edizione, scadenza dei hold, conteggio e inserimento con chiave idempotente.

Per Supabase, progettare un RPC strettamente limitato: wrapper API a invocazione controllata e implementazione privata. Se serve `SECURITY DEFINER` per consentire l’unica mutazione senza grant diretto alle tabelle, è una decisione privilegiata esplicita: funzione in schema privato, ruolo proprietario dedicato minimo, `search_path` vuoto, nomi qualificati, auth.uid verificato, membership verificata, nessun SQL dinamico, EXECUTE revocato a PUBLIC e grant soltanto al ruolo necessario. Non aggiungere definer per nascondere un errore RLS. Prove obbligatorie su API pubblica, chiamata senza sessione, tenant alterato e concorrenza.

Comandi utente: actor dal JWT verificato, DTO validato, idempotency-key, current revision/etag e receipt. Job di servizio: scope del job derivato dal record persistito, mai da prompt/URL arbitrario. Non usare service-role come scorciatoia per ogni richiesta browser. Views con security_invoker dove applicabile e test di leakage.

## Sicurezza dei materiali
Firma/size reali, path generati lato server, nessun percorso filesystem dal file.name, parser limitati, HTML sanitizzato, nessuna formula come codice arbitrario. Allegati estratti in sandbox con limiti decompressione, CPU, pagine e output. Accesso web verso fonti consentite: deny private network/metadata services e redirect non autorizzati. Il documento può contenere prompt injection e va trattato come dato.

## Cosa automatizzare
Test unitari e property-based; contratti TS/Python; migrazioni e rollback/restore su DB sintetico; RLS con 2 organizzazioni, 2 tutor e studenti; API con retry e concorrenza; browser end-to-end con contesti distinti; snapshot semantici e visuali; accessibilità automatica e tastiera; budget bundle; carico 10 studenti e scenario separato di crescita; adapter Google mock e prova reale autorizzata; MCP con capability negative; golden matematici e benchmark AI offline/licenziato.

Per database, usare istanza Supabase locale o staging isolato. Non lanciare load/fuzz sui servizi del tutor o concorrenti. Le catture REA dei vendor verificano solo la ricerca; i test accettazione misurano la nostra implementazione.

## Cosa non può essere certificato da soli test automatici
Comprensione reale, gradevolezza, fiducia, usabilità di una penna fisica, accessibilità completa con ausili reali, autorizzazioni legali e disponibilità degli studenti a pagare. Questi sono gate umani circoscritti. La microdemo può simulare il gesto di un tutor, non attribuirsi la sua approvazione scientifica. Tutti i risultati di prodotto iniziano NOT_RUN nel pacchetto.

## Registro delle prove
Per ogni AC: comando/versione, SHA, fixture, risultato, log path, artifact digest, autore dell’esecuzione e limiti. PASS di versione precedente non vale per HEAD nuovo. Skip e test assenti sono distinti. `--passWithNoTests` non soddisfa una suite nuova: verificare la presenza di test nominati e conteggio >0.

## Addendum V4 — confine dati del diario
Gli eventi del Diario restano nell'event store con `organization_id`, utente, fonte/versione e provenienza. Una eventuale tabella materializzata del diario è **cache ricostruibile**, non ledger parallelo. RLS/ACL devono negare a compagni e admin commerciali l'accesso a errori, rubriche, audio e correzioni personali. Un docente con nuova edizione non eredita di default la cronologia didattica precedente; il cambio di CoursePack non cancella l'accesso allo stesso studente alle proprie risorse. Sulle aggregation di gruppi piccoli proteggere inferenze identificanti.

Test: `tests/ERROR_JOURNAL_FIXTURES.json` + AC-055..AC-066 verificati su API/storage reali; fixture isolata non è G0. REA G0 AC-067..AC-074 e altri AC correlati devono avere `state/rea-receipts` reali; eseguire il validatore sullo SHA candidato. `BLOCKED` e `NOT_RUN` non soddisfano un gate.
