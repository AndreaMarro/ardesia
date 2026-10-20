# 5. MCP Core, Calendar e piattaforme esterne

## Due mondi separati
**MCP di prodotto:** espone alle piattaforme autorizzate un sottoinsieme delle operazioni didattiche e gestionali dell’utente. **MCP della fabbrica:** REA, GitHub, deploy, shell e amministrazione database per gli sviluppatori. Nessun client studente può ottenere strumenti della fabbrica o chiamare SQL generico.

MCP non è né il modello né un abbonamento di inferenza. L’app deve funzionare senza host esterno; ChatGPT, Claude, Codex o altri host diventano adapter opzionali solo nelle capacità realmente testate. Una app MCP con UI non sarà supportata in tutti gli host: fallback a dati strutturati e deep link autorizzato.

## Contratto iniziale proposto
Risorse di lettura: programma del corso acquistato, prossima sessione, elaborato proprio, feedback restituito, contesto autorizzato di una lezione. Tool candidati:
`course.list_mine`, `lesson.get_context`, `assignment.get`, `submission.prepare_upload`, `submission.finalize`, `feedback.request_hint`, `calendar.preview_schedule`, `calendar.confirm_schedule`, `circuit.capabilities`, `circuit.check_steps`.

Nomi e schemi sono contratti progettuali, non dichiarazioni che i tool esistano già. Ogni risposta indica sourceVersion, evidenceRefs risolvibili, capability/status e possibili limiti. Lo scope utente è ricavato dalla sessione verificata; non si accetta `teacher_id` libero come autorizzazione. Il client può scegliere un tenant solo fra membership effettive.

Per operazioni con conseguenze (iscrizione, calendario pubblico, restituzione, pagamenti) una preview produce un intent hash e scadenza; il commit consuma quel piano solo se ancora valido e autorizzato. Le conferme possono essere delegate dall’utente secondo una policy esplicita, non inventate dall’LLM. Nessun tool può approvare la propria correttezza pedagogica.

## Sicurezza dei collegamenti
Usare il modello di autorizzazione MCP corrente e SDK verificato, validazione audience/resource, scopi minimi e token di servizio separati. Vietati token passthrough verso risorse non destinate, SSRF tramite URL di allegati e URL arbitrari passati al worker. Input di documenti/siti è materiale non fidato: una frase nel PDF non modifica permessi o istruzioni di sistema.

Gli host vanno dichiarati in una matrice: testo/tool, streaming, upload, UI embeddable, autorizzazione e versione. Una riga UNKNOWN rimane tale. Il test tramite client MCP sintetico non prova l’uso in tutte le app esterne.

## Google Calendar: pratico prima di universale
Ardesia è la fonte autorevole di sessioni, partecipanti e pagamento; Google Calendar è fonte esterna di occupazioni autorizzate e destinazione degli incontri confermati. Importare solo free/busy quando bastano gli orari, non titoli e descrizioni private del calendario.

Primo flusso: connessione OAuth del singolo insegnante → verifica disponibilità → proposta di quattro sessioni → conferma tutor → pubblicazione su calendario scelto. Un feed ICS scaricabile è fallback senza OAuth. Il connettore ChatGPT della conversazione non concede automaticamente accesso al calendario nell’app sviluppata.

Conservare mapping per provider/account/calendar/event ID, edition/session ID, etag, syncToken e ultima versione applicata. Deduplicare gli eventi con chiave stabile/idempotenza nel perimetro consentito dall’API. Le push notification non sono payload completi e possono andare perse; rinnovare i canali a scadenza e riconciliare periodicamente. SyncToken scaduto (410) riavvia sync completo del calendario interessato senza cancellare i corsi canonici.

Le modifiche dall’esterno diventano proposte: spostare una data in Google non rimborsa, non cancella il gruppo né sovrascrive la disponibilità accettata dagli studenti. Prima versione: scrittura da Ardesia e import busy; modifiche bidirezionali dopo test con conflitti etag e notifiche fuori ordine.

## Tempo e DST
Memorizzare start/end istanti UTC e timezone IANA del corso; quattro sessioni hanno ID propri. La rappresentazione locale alle 18:00 va ricostruita per ciascuna data, non con offset fisso. Test al cambio ora Europe/Rome, attraversamento mezzanotte e studente in altro fuso. Una modifica alla regola ricorrente non altera le sessioni passate registrate.

## Estensioni successive
Microsoft Graph Calendar e ICS implementano lo stesso port, non un altro scheduler. Google Classroom/Moodle/Canvas via adapter LTI/QTI dove supportato; file PDF e bundle portabile sempre disponibili. Meet/Zoom come link esterni inizialmente: niente WebRTC proprietario per il primo gruppo. Notion/Obsidian/export di note sono viste o proiezioni con loss report, non nuovi proprietari della memoria canonica.

Fonti: mcp, mcp-auth, calendar-push, calendar-sync, codex-goal in SOURCES. Le API di Calendar e i permessi Google richiedono verifica effettiva nel progetto applicativo prima dell’uso pubblico.
