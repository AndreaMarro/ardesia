# 15. Autonomia Internet, alternative equivalenti, prove gratuite e rilascio marketing

**Mandato aggiornato 20 ottobre 2026; scadenza obiettivo mercoledì 21 ottobre 2026 sera, Europe/Rome.** È un goal e non un risultato già eseguito. Permesso ampio di agire online entro le autorizzazioni tecniche esistenti. UNICO DIVIETO ECONOMICO: non confermare pagamenti, non attivare acquisti, crediti a consumo non inclusi, subscription con rinnovo addebitabile, extra seats/compute a pagamento o account che possano trasformarsi in fatturazione senza ulteriore approvazione. Restano inoltre i limiti su segreti, diritti, privacy, dati reali e operazioni irreversibili.

## A. Autonomia esecutiva ammessa — senza attendere l'utente
- Navigare web e documentazione, reperire fonti, aprire demo accessibili e registrare workflow REA autorizzati, scegliere alternative comparabili; non interrompere il Goal per domande su scelte tecniche reversibili.
- Usare account già autorizzati, credenziali presenti nei secret manager, installare dipendenze nel progetto, creare workspace locali e fixture sintetiche, collegare strumenti MCP di sviluppo propri.
- Creare branch e worktree, editare codice/test, commit/push su branch del progetto, creare e aggiornare PR/issue, eseguire test automatici e security scans; aggiornare documentazione *in codice* e receipt SHA. Chiudere issue/PR risolte dopo prova, senza bypassare required checks o review protette e senza force push distruttivo.
- Interagire con progetti Vercel esistenti, aprire preview/staging, eseguire build, analizzare log, risolvere errori, pubblicare una **landing di raccolta interessi** con contenuti non ingannevoli e modulo realmente funzionante, qualora il deploy non attivi nuove fatturazioni o rischi per dati/servizi esistenti. Se il progetto auto-deploya in produzione, auditare trigger, ambiente e segreti prima di push/merge.
- Creare registrazioni di prova gratuita a proprio nome solo se il provider offre un accesso legalmente gratuito e senza carta, debiti, top-up o rinnovo con addebito automatico; usare solo identità/email già proprie e autorizzate, non inventare persone, indirizzi o profili. Registrare ToS/license, scadenza, limiti e modalità di disattivazione. Se la registrazione richiede accettare condizioni sconosciute, mettere dati sensibili o un recapito non disponibile, non inventare: passare al sostituto.
- L'utente autorizza prove gratuite **solo nelle condizioni precedenti**. Se il servizio non specifica in modo verificabile la cessazione senza costi, non sottoscriverlo.

## B. Regola OBBLIGATORIA di alternativa quando l'accesso è negato
Il blocco di Brilliant, Teachworks, Snorkl, Passify, Bramble o un altro target non chiude la missione. Eseguire questa procedura:
1. Raccogliere un tentativo di accesso normale, motivazione documentata (auth/paywall/404/limite temporaneo/ToS), versione e timestamp. Non aggirare autenticazione, DRM, rate limit o barriere tecniche.
2. Cercare **almeno due alternative** per la stessa funzione/risultato, preferendo prima un progetto open source con prova eseguibile e licenza compatibile, poi un servizio con demo, poi una prova gratuita tracciata.
3. Valutare ogni candidato su cinque fattori con scala esplicita 0–5: completezza funzionale, osservabilità tramite REA, trasferibilità delle idee/compatibilità della licenza, qualità e accessibilità della prova, rischio/costo. Documentare il punteggio *relativo* al requisito, non una generica fama della piattaforma.
4. Selezionare autonomamente la migliore **di livello almeno equivalente sull'uso specifico** (non necessariamente sul prodotto completo) e aggiornarne il target reale in `factory/rea/alternatives.json` e nella mission receipt. Se nessuna raggiunge la soglia, costruire un confronto open source + documentazione sul comportamento limitato e segnare qualità/coverage come insufficiente: non PASS fittizi.
5. Analizzare con REA il sostituto, produrre Evidence e realizzare la nostra funzione originale, testabile. Chiudere il caso sostituzione con motivazione, artifact e test. Nessun loop infinito su login. L'alternativa deve soddisfare comunque i sei gate REA G0.

## C. Registro obbligatorio delle prove gratuite
`state/TRIALS.json` è il registro canonico **sanificato**. Compilare: servizio, URL, account alias NON credenziale, scopo della prova, piano esatto, gratuità verificata, carta richiesta, rinnovo, scadenza, cancellazione, limiti, data attivazione, URL di verifica, eventuale soglia d'uso, azione di chiusura e outcome. Non mettere password, token, ricevute private o email complete in GitHub pubblico. Se un trial può convertire a pagamento automaticamente → **vietato**. Se esiste costo potenziale non escluso → **vietato**.

## D. Clock del traguardo e gerarchia delle consegne
**Mercoledì 21 ottobre 2026, sera, Europe/Rome:** raggiungere `MARKETING_PREVIEW_READY`, cioè pagina live/staging navigabile con programma, prezzo indicativo/condizioni, un laboratorio Fisica funzionante, form reale di richiesta e conferma, una demo delle aree studente/docente senza dati falsi presentati come reali, link condivisibile e URL realmente testato da browser mobile.

Il marketing può **iniziare soltanto** come raccolta di interesse se G0 non ha superato il gate delle sei missioni e/o l'E2E gruppo: copia onesta «in preparazione», nessuna promessa di tutor IA, registrazioni, pagamenti o correzione automatica non verificate. G0 rimane più ampio: dieci studenti sintetici, capienza, compiti privati, feedback, error journal, LessonOS, REA e riapertura. G1 richiede prontezza reale del pilot. Niente elusione dei gate spostandoli dalla denominazione G0 alla landing.

Ordine critico per arrivare a mercoledì sera: **(1)** un laboratorio demo vero; **(2)** pagina corso e form reale; **(3)** area individuale minima + dashboard mini-corsi collegate alla stessa edizione; **(4)** giro di REA su alternative realmente accessibili; **(5)** workflow 10 studenti sintetici; **(6)** G1. Eseguire in parallelo solo task senza conflitti. Non aspettare di studiare tutti i 139 siti.

## E. GitHub, Vercel e costi
GitHub Actions con runner standard su repo pubbliche è generalmente gratuito; non lo sono necessariamente storage addizionale, runner maggiorati, feature pagate e dipendenze esterne. Vercel Pro ha fee mensile e $20 di credito infrastruttura mensile, poi pay-as-you-go. Non presumere che esista cap di spesa: verificare Spend Management e le azioni di pausa, che non fermano tutto per default.

**Non cambiare la visibilità di repository storiche contenenti o collegando manuali, codice terzo, account o segreti prima di scansione e revisione della provenienza**. Lavorare sul repo corrente pubblico se già verificato, oppure su una nuova superficie pulita. Non pubblicare bundle REA grezzi dei concorrenti, trascrizioni private o credenziali in issue/artifact. Associare ciascun deploy Vercel a branch+SHA e mantenere URL di preview/produzione distinti. No cambio piano Pro, spesa non approvata o ambienti database live per risolvere un blocco.

## F. Scambio con monitoraggio ChatGPT ogni ora
Esiste già un'attività ChatGPT: **«Ardesia revisione tecnica oraria»**, programmata ogni ora, non ogni 30 minuti (limite piattaforma). Non presume di poter inviare comandi alla sessione Codex: il ponte è **GitHub**, con commenti verificati e file di stato nel repository.

Codex deve creare e mantenere su branch condivisa:
- `docs/ops/ARDESIA-RUNLOG.md`: sequenza append-only: data/ora Europe/Rome, SHA, cambiamento, test effettivi, errore/rischio, decisione e link PR/preview.
- `docs/ops/ARDESIA-STATE.json`: snapshot machine-readable `{observed_at,sha,milestone,statuses,rea,deploys,trials,blockers,next_actions}`; privacy-minimized.
- `docs/ops/ARDESIA-DECISIONS.md`: ADR compatti, alternative studiate, bug chiusi e motivazione.
- `docs/ops/ARDESIA-TRIALS.md`: vista sanificata per le prove gratuite, coerente con `state/TRIALS.json`.
- Commento di handoff su PR principale una volta, aggiornato invece di crearne uno ad ogni run.

A ogni task completata, push+receipt. Codex deve leggere prima dello sviluppo le nuove osservazioni del monitor da GH/PR (identità, sha, data, severità), deduplicare issue, correggere o motivare il rifiuto; NON aspettare l'ora successiva per lavorare. Il monitor ChatGPT è **revisore osservazionale**, non processo da cui dipende il runtime né coordinatore che blocca il Goal. Se le notifiche ChatGPT sono disabilitate nell'account, non garantire push: i risultati restano disponibili nella gestione dell'attività e le osservazioni condivise su GitHub quando pubblicate.

## G. Criteri di accettazione aggiuntivi
Il pacchetto documentale elenca gli AC nuovi nel file `tests/ACCEPTANCE.json`. Non dichiarare PASS solo perché il registro esiste: occorrono ricevute da interazioni reali. I problemi non chiusi entro mercoledì devono restare in `blockers` con priorità e fallback; il prodotto di marketing deve essere verificato nel perimetro limitato che comunica.

## H. Limiti improrogabili
L'autonomia digitale **non** autorizza: pagamenti, nuovi piani fatturabili, dati privati altrui, bypass tecnici o contrattuali, marketing spam, falsi test o claim, eliminazione irreversibile di infrastrutture o risorse, modifica non verificata di RLS, esposizione involontaria della produzione. Tutte le altre azioni tecniche reversibili e senza costo sono da intraprendere senza chiedere ulteriori conferme. Non aspettare passivamente l'utente per dettagli che si possono ricavare dai repository e dai servizi collegati.
