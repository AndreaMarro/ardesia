# Pubblicazione GitHub — preregistrazione, 22 settembre 2026

Unità: restart-github-publication-20260922. Richiesta di Andrea: mettere il
lavoro su GitHub in forma ordinata, manutenibile, scalabile e studiabile da
ChatGPT. Autorizza push del branch di lavoro e PR; non un merge o un deploy
manuale. Repository privato AndreaMarro/ardesia, visibilità invariata.

Snapshot iniziale pulito: 908cdf0f1ffae49d518c7093719904075a593cc0.
Base della continuazione: 705284acc4322db4d241032de071437ab0473cc1,
branch integration/d2-lesson-material-20260920, PR #256 ancora draft.

Esito falsificabile: branch remoto contenente tutti i commit della ripartenza,
PR draft collegata alla base, guida leggibile da GitHub, indice strutturato,
prove locali selezionate per pertinenza e verificabili per hash. Il prodotto,
i gate, le allowlist, i lockfile e la review D2 congelata devono restare identici
allo snapshot iniziale. Il workflow completo resta non certificato.

Oracoli congelati: diff Git, gate hygiene del repository, hash originali,
manifest dei comandi con exit reali. Nessuna normalizzazione silenziosa:
archiviare prima i byte originali delle review R-02/R-03, poi rimuovere solo
whitespace finale dalle copie di lettura che bloccano la CI. Il manifest
deve dimostrare entrambe le identità e i vecchi hash si applicano agli originali.

Capability: persistent-capability-evolution locale; Git/gh CLI; Python stdlib;
gate esistenti. Coordinatore Codex, modello/effort inherited/unknown.
Nessun agente aggiuntivo, installazione, promozione o quota dichiarata.
Mandato di sessione: nessun accesso ai vault esterni; INDEX_SYNC_DEFERRED.
AgentMemory RETIRED_NO_READ_NO_WRITE; Basic Memory non usata.

Rischi: claim storici letti come attuali, log senza provenienza, base PR errata,
dati estranei incorporati in blocco. Mitigazioni: collegamenti a SHA, selezione
esplicita dei file, scansione dei contenuti anche negli archivi e catena di PR.
Escludere copie Kirchhoff, configurazioni provider, prompt personali e cache.
Le integrazioni GitHub possono eseguire CI e preview automatiche già configurate;
non avviare manualmente deployment né cambiare configurazione remota.

REPAIR se gate o hash falliscono; STOP per segreti nuovi o cambio di base
incompatibile; DEFER pilot reale e decisione di merge. Rollback con un nuovo
commit o chiusura della PR, mai force push, riscrittura della storia o reset.
