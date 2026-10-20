# 12. Autonomia, GitHub e Goal

## Contratto di esecuzione
Il pacchetto è un mandato da eseguire nella sessione Codex autorizzata, non un agente già avviato. Il comando `/goal` va verificato nella superficie/versione installata; GOAL.md è il contenuto dell’obiettivo, non un demone. Se la funzione manca, usare lo stesso mandato nella modalità disponibile e dichiarare che non è stato attivato un Goal nativo.

Una sola branch di integrazione; un integratore, al massimo due builder contemporanei su file disgiunti. Contratti condivisi modificati dall’integratore. Reviewer separato sul diff della task e controllo complessivo del percorso alla fine; non interpretare review di un agente come approvazione umana o prova indipendente dei fatti didattici.

## Autonomia ammessa
Leggere repository, documentazione e target autorizzati; creare worktree e test locali; scrivere codice e documenti necessari; installare dipendenze di progetto verificate entro l’ambiente; generare fixture sintetiche; fare commit coerenti; aggiornare branch e PR previste quando la pubblicazione è autorizzata e priva di dati privati.

## Azioni non implicite
Nuovi piani a pagamento, riattivazione di database, scelta arbitraria di workspace richiesta dal connettore, modifica di DNS/prod, merge senza protezioni/approval, eliminazione di dati/storia, invii reali a studenti, iscrizioni o pagamenti simulati rappresentati come reali, accesso a materiale di terzi fuori dai diritti, modifica di impostazioni globali del Mac. Questi punti producono un blocco specifico: l’agente continua sulle altre task non bloccate, non ricomincia la progettazione.

## GitHub sempre allineato, non rumoroso
Per ogni task conclusa: commit, branch, log sintetici, checklist AC e una ricevuta riferita allo SHA. Aggiornare una PR di implementazione per la slice, non creare molte PR solo documentali. Mantenere un solo indice START_HERE, un Goal e una matrice; gli aggiornamenti storici restano, ma sono marcati superseded. Non cambiare etichette G0/G1/G2 tra chat, documenti e commenti.

Non fare auto-merge o forza-push su main. Gli artifact dei test non contengono chiavi, utenti reali o bundle proprietari dei target. Le anteprime possono scattare al push: verificare connessioni Git/Vercel e accessi prima di rendere pubblico il candidato. Il README descrive ciò che esiste, non solo il desiderato.

## Quando terminare
G0 richiede percorso integrato con 10 attori e le prove marcate G0. Non fermarsi alla landing. Proseguire verso G1 finché accessi e autorizzazioni permettono; consegnare staging e prova remota oppure blocchi nominati e risultati locali completi. G2 richiede il tutor e persone reali, non una fixture di Codex. Un blocco esterno non autorizza a segnare PASS.

## Ottimizzazione del processo
Niente nuovo audit di 7.000 file ad ogni task. Readme/manifest per orientamento, codice e test solo nel perimetro della modifica. REA cattura scenari, traccia dati e confronta componenti dove elimina incertezza; AST/rg e test diretti dove bastano. Documentazione breve ma completa nelle decisioni, non riscrittura ripetuta della visione. Una nuova dipendenza deve sostituire lavoro necessario o chiudere un limite misurato.

## Addendum V4 — l'obbligo REA non è una deroga ai test
Ogni task che governa memoria (T02), laboratorio (T06), gestionale (T04) e diario (T07B) ha una missione REA dedicata e deve produrne la catena: scenario autorizzato → Evidence → contratto → modifica → test sul prodotto → receipt SHA. T12 contiene R6 prima/dopo. Verificare `python factory/rea/check_rea_gates.py --gate G0 --sha <SHA_DEL_PRODOTTO>`; script senza ricevute deve **fallire**. Per G1 R4 e prove API R5. Non fabbricare artifact o dichiarare scaricati i documenti REA che il pacchetto precedente non aveva.

Se REA non è eseguibile, scegliere runtime idoneo e percorsi concessi; in alternativa segnare uno specifico BLOCKED e proseguire su task non bloccate. Pubblicare una landing di raccolta interessi soltanto come anteprima; non affermare micro-corso G0 completo. GitHub deve raccogliere le prove del nuovo software e specifiche redatte dei competitor, non bundle terzi grezzi.


## Addendum V4.1 — autorizzazione estesa dall'utente
L'autonomia consentita ora include navigazione attiva su Internet, uso di trial **realmente gratuiti** con condizioni registrate e senza strumenti di pagamento/rinnovi onerosi, commit/push/PR, chiusura di lavori risolti, preview/staging Vercel e pubblicazione di una pagina dimostrativa di raccolta interessi. Queste attività richiedono verifica della corretta identità/workspace, assenza di spese e protezione dati, ma non un nuovo ping all'utente. Non cambiare visibilità di repo vecchi senza audit. Operazioni finanziarie, irreversibili e dati veri continuano a richiedere autorizzazioni appropriate. Per i dettagli e i conflitti con la policy più vecchia, prevale `specs/15_AUTONOMIA_TRIAL_E_LANCIO.md`.
Il monitor orario ChatGPT è attivo ma separato; usare GitHub come ponte: file `docs/ops/ARDESIA-{RUNLOG.md,STATE.json,DECISIONS.md,TRIALS.md}` e commenti PR deduplicati. Non confondere revisore ChatGPT con Codex che scrive il codice.
