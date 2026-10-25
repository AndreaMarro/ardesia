# Ardesia — Core del quaderno scientifico

Consegna locale del 20 ottobre 2026. Commit `ebcb6bc8020f444281f87770b66e43b7bb665a7a`.

Il Core ora salva annotazioni e formule testuali per pagina, lega ogni quaderno
a un PDF originale immutabile e conserva revisioni distinte. Sono verificati
salvataggio/riapertura dello store, conflitti tra revisioni concorrenti, consegna
V1 con V2 privata, export con originale, revoca, cancellazione e ripristino.

**L'editor visuale non è ancora integrato nel corso. SYS-01 rimane aperto.**
Questo incremento riguarda Core/API/export; non certifica Undo, la riapertura
nel browser, la UI finale, PostgreSQL live, G0/G1 o il rilascio.

## Versione REA

La verifica odierna di npm e della
[release ufficiale](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0)
conferma **6.7.0** come ultima versione stabile, pubblicata il 18 ottobre 2026.
La registrazione locale usa già `rea-agents@6.7.0`: nessun aggiornamento eseguito.
Include miglioramenti alla cattura browser, all'analisi JavaScript e alla
conservazione delle evidenze. Il pacchetto conserva la ricevuta della verifica.

## Evidenze e risultati

REA è stato usato mediante MCP stdio reale, con inventario di 207 strumenti.
L'ispezione dello Studio originale ha completato l'apertura del compositore
MathLive e la scelta dell'integrale. Il successivo scenario ha registrato un
errore non-JSON nel journal e un timeout di Undo; Redo e riapertura non sono
stati eseguiti. Il nesso causale tra errore e timeout resta da verificare.
I bundle includono osservazioni e limiti, senza presentare quel flusso come
riuscito. Non è ancora stato svolto il confronto con un workflow equivalente
esterno autorizzato.

| Verifica | Esito |
|---|---|
| Engine completo, dal package corretto | 2.473 passati, 25 saltati |
| API completa | 235 passati |
| Test mirati del quaderno | 31 passati |
| Regressioni prima della correzione | 8 fallimenti riprodotti |
| Review separata Codex | 4 P2 corretti; 2 probe ripetuti |
| Patch cumulativa e incrementale | Applicabilità verificata sulle rispettive basi |

I quattro difetti riguardavano coordinate intere enormi, MIME mancante,
cambio originale tra revisioni e Unicode invalido nelle identità/CAS. Sono
ora rifiutati con errori strutturati. I log includono anche l'invocazione
iniziale fallita in raccolta perché mancava PYTHONPATH.

Tre warning Engine riguardano fixture legacy deprecate. La review non attesta
indipendenza tra famiglie di modelli. Non sono stati ripetuti test frontend
per questo incremento privo di modifiche alla UI.

## Uso della consegna

- `source/`: 74 file modificati dalla base generale, con percorsi originali.
- `patches/cumulative.patch`: da `d0235e8a9dbbccd6808741a087dd0359908feb2b`.
- `patches/notebook-core-only.patch`: solo i 31 file del nuovo incremento, da `746c7fb34bf8159728afecf30c9f284c7e51b7d4`.
- `evidence/`: risposte MCP, bundle originali, indici e review prima/dopo.
- `scripts/`: client e scenari REA, probe e script di confezionamento.
- `logs/`: verifiche riuscite e fallite.
- `MANIFEST.json`: commit, limiti, hash e ricevuta di verifica delle patch.

È un archivio di modifiche, non un'app standalone. Su un checkout alla base
corrispondente applicare **una sola patch**, dopo `git apply --check`.
Il codice richiede schema canonico 6: l'inizializzazione esplicita SQLite
esegue l'upgrade; le richieste API non migrano. La migrazione PostgreSQL è
inclusa ma non è stata applicata o verificata su un database live.

Un vecchio uso del kind libero `scientific-notebook` blocca l'upgrade per
evitare di reinterpretare dati preesistenti. Non ci sono nuove dipendenze
di prodotto: il Core riusa pypdf e i servizi canonici già presenti.

Il report tecnico completo è in
`source/docs/ops/rea-deep/TARGET-082/SCIENTIFIC-NOTEBOOK-CORE.md`.
I bundle REA riguardano questo incremento; le evidenze del lettore PDF
precedente restano nella consegna `ARDESIA_LETTORE_PDF_REA.zip`.

Restano editor annotazioni/formule, Undo isolato per attore/corso/fonte,
geometria con zoom/rotazione, persistenza nel browser e verifiche UI
390/820/1440 px. SYS-02..08 e rilascio rimangono nel piano.
Nessun push, merge, deploy o messaggio esterno.
