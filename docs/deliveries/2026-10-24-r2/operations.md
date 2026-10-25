# R2 — decisione di rilascio e gestione delle PR

Questo documento prepara una decisione, non registra una pubblicazione autorizzata.

## Per rendere subito dimostrabili i microcorsi

1. Aprire la preview protetta del candidato esatto, provare Poiseuille e Idrostatica, ascoltare la voce sintetica e leggere il funnel.
2. Registrare revisione scientifica/editoriale con nomi, data, digest e decisione. I quattro esempiDRAFT richiedono approvazione nel registro esistente oppure esclusione e rebuild; i risultati deterministici non li approvano.
3. Confermare il target e autorizzare esplicitamente l’apertura pubblica. L’accesso Vercel/Render funziona già: non servono nuovi token o nuovi account. Non disabilitare le protezioni come scorciatoia per il collaudo.
4. Dopo una pubblicazione autorizzata: ripetere HTTPS,20asset/route,404/headers/CTA e disponibilità da browser anonimo. Il contatto resta interesse, non account/iscrizione/pagamento. Nessun materiale privato deve entrare nel pacchetto pubblico.
5. Rollback preparato: mantenere l’artefatto pubblico precedente con digest; autorizzare e verificare il ripristino della preview corretta. Non eseguire rollback di produzione o promozioni come parte della QA. Il rollback operativo remoto non è ancora provato.

Render conserva il servizio statico storico, autoDeployoff, nel workspaceMyWorkspace già confermato. Non trasformarlo in una API privata o in un’altra autorità di sessione. La beta richiede Core/Auth/Storage/inviti/backup verificati separatamente in uno staging isolato designato.

## PR con un esito e meno interdipendenze

La preferenza umana è completare i compiti e chiudere lePR; il mandato precedente e AGENTS vietano il merge automatico. Chiusura senza merge e integrazione hanno risultati diversi. Chiedere una sola decisione sul candidato concreto con prove, poi eseguire il tipo di chiusura autorizzato. Non chiudere i rami altrui in blocco o qualificare «integrato» il lavoro soltanto archiviato.

Per il lavoro successivo: una slice verticale utilizzabile perPR, base integrata appena disponibile, confini piccoli sopraCore/ToolHost/Pack, due consumer prima di generalizzare. Evitare una nuova PRperogni grafico e catene speculative. La301 è l’unico incrementoR2; la dipendenza300 è esplicita perché quella base non è ancora integrata. Ridurre la catena richiede una decisione di integrazione, non una riscrittura parallela delle stesse capacità.

Rileggere sempre head/base/CI/concorrenzaLIVE. Le ricevute di CI e preview sono datate e riferite ai byte; una verifica verde di un vecchio SHA non prova la head corrente. I commit di sola memoria conservano il prodotto congelato; dichiararne l’equivalenza anziché attribuire retroattivamente i vecchi run.
