# Review tecnica distinta dell’assembler Cric

Letti integralmente il helper finale 23f3ff2b e i test canonici. La copia nel worktree A è byte-identica al Git Root: nessun fork logico e nessuna nuova ETL. L’API originale resta invariata per Ardesia; la modalità Cric usa ID espliciti e versioni precedenti per creare nuove edizioni degli stessi problemi.

Ho scritto un test indipendente con fonti sintetiche, senza risposte di corpus: identità e tipi di versioni, esami protetti, selezioni duplicate/inesistenti/non-question, cardinalità 0/1/10/100/101, versioni sorgenti invalide, provenienza e hash, famiglie/difficoltà individuali e override di tassonomia. Le mutazioni di ID, corso, skill, kind, versioni ed esami vengono rifiutate anche quando un valore numerico uguale ha il tipo sbagliato. Le versioni originali miste 1/2 producono 2/3 e il vecchio metadata resta intatto. I due package Ardesia 240 e 260, inclusi binding serializzati con il writer canonico, restano byte-identici.

Target finale reale: 6 test, exit 0, sessione 61645. Sono conservati un primo lancio non eseguito per SyntaxError nello strumento, il primo target positivo e il secondo positivo con ulteriori assert sulle esatte serializzazioni. Nessun esito negativo viene ritaggato. Non ho usato database, browser o stato studenti in questo target; l’import reale già svolto da Root è prova separata e non viene attribuito a questa review.

Nessun finding residuo nel perimetro tecnico letto. L’assembler riceve una fonte Git esplicita: il suo trasferimento corretto non sostituisce il riesame scientifico di ogni problema, il confronto dei binding né il gate umano/pubblicazione. Nessun candidato Cric riceve credito da questi test. Human NOT_RUN, publicationAction NONE.
