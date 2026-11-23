# Trovare un materiale da tutti i microcorsi

## Contratto di accettazione prima dell'implementazione

Base ufficiale `f7f4bde8e09ed49b1db12b66017331aefbfa112b`. La release 1.1.0 e il merge della PR 339 puntano a `14fd6504`. La PR 340 è il confronto progettuale. La PR 341 è integrata e il job di collaudo più i dodici job browser sono passati sulla base di questo incremento. [Verifica della base](https://github.com/AndreaMarro/ardesia/pull/341#issuecomment-7102301606)

**Compito.** Uno studente conosce un argomento o un codice e vuole aprire la lezione, l’esempio, il quesito o il laboratorio giusto. Oggi l’indice dei percorsi richiede di conoscere il corso e il tipo. La ricerca dei banchi copre le 181 simulazioni delle voci. Questa modifica aggiunge la ricerca trasversale alla pagina **Percorsi**, raggiungibile dal comando **Cerca** nella testata. L’elenco dei sei corsi rimane l’ingresso per chi preferisce sfogliare.

| ID | Comportamento e casi limite | Controprova richiesta |
| --- | --- | --- |
| R1 | Titolo, argomento e codice, lettere accentate e maiuscole. Un ID esatto è il primo risultato. Filtri per corso e tipo. | Enumerare gli ID pubblicati con un oracolo indipendente, verificare la corrispondenza di ogni pagina e l’unicità dei riusi in C6. |
| R2 | Fino a 12 risultati per pagina con ordinamento stabile. Ricerca vuota senza filtri mostra i percorsi. Zero corrispondenze, pagina successiva, query troppo lunga e parametri ambigui hanno un esito definito. | Prove HTTP anche su input malformati, caratteri HTML, richieste ripetute e ultima pagina. |
| R3 | Si vedono solo metadati pubblici per l’orientamento. La destinazione riapplica l’accesso attuale. Escludere tutti i 93 quesiti d’esame, i ritirati e le bozze editoriali, anche cercando il codice esatto. | Ospite e quaderno abilitato, accesso diretto, modifica editoriale, controllo dei nomi dei campi e confronto dei record ufficiali prima e dopo la ricerca. |
| R4 | Ogni tipo apre la sua attività canonica. La cronologia ripristina termine, filtri, pagina e risultato da cui si era usciti. | Tastiera, ricarica, Indietro e ritorno da un banco. Il risultato riceve di nuovo il focus. |
| R5 | Unità visiva con l’Officina, comandi a ritmo manuale, etichette esplicite, focus visibile, risultati leggibili a 320 px e al 200%. | Chromium e WebKit, screenshot desktop/mobile, preferenza di movimento ridotto, axe e lettura delle schermate Taste Skill. |
| R6 | Nuovo contratto API additivo. Nessuna copia della banca o tabella SQLite. Ricerca caricata all’apertura del catalogo. | Confrontare catalogo, PDF e schema con la base. Budget di 12 KiB JSON per la pagina della banca distribuita. Nel confronto locale p95 del caso «lente» entro 3 × p95 di `/api/course/C6` + 30 ms, su 20 letture a processo caldo. |

Le misure tecniche saranno associate alle SHA effettivamente eseguite. Efficienza della ricerca con studenti, lettura con tecnologie assistive personali e prova touch su telefono fisico richiedono osservazioni separate.
