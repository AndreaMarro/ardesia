# Checkpoint corrente — 416 quesiti, 45 altre attività

Generazione ee506766c87603c1be333fb3d4323b65a1346006c0d9b0959614fe8f1eec6f12.
Restano4190revisioni complete e340attività;1254anteprime private PASS,991pubblicati
inalterati, DRAFT/humanNOT_RUN, due originali E003/E008 ancora FAIL. U1 eU2-01
revisionati; U2-02 restano64ID027–030. Primo ID `u2-vertical-flight-01`.
A autore031–034 (forze/ascensore/dueblocchi/Atwood), B autore027–030 (volo/gittata/
unsecondo/frequenza), reviewer separato perB, rootreviewA e unico integratore.
Non contare candidati fuori registry. C1-E021..023 sono nel file degli esempi di
copertura e restano NOT_RUN: non dedurne assenza dal soloC1.json.

PR356 contiene320/37, con riparazione mirata fixture Insights f59c1f36 e pin runner
S19Ubuntu24.04 5ffe1655; leggere CI sulla head effettiva e poi post-merge.
Il nuovo incremento416/45 va su ramo separato, senza invalidare quel collaudo.
La storia sotto conserva snapshot precedenti; leggere sempre il puntatore attuale.

# Prosecuzione corrente — Cric, revisione di 4.606 quesiti

Checkpoint più recente:320/4606quesiti revisionati in bozza,37/385altre attività
riesaminate; restano4286revisioni complete e348attività. Generazionefa1bbebaa9e3638a04508c21adcf8bc70d6340e920a5d8a088aece0887c0d8d6.
U1 eU2-01 sono completati editorialmente;966anteprime terminali PASS. Le due nuove
edizioni C1-E003/E008 sono DRAFT e i FAIL dei due originali pubblicati rimangono
tracciati. Nessuna nuova pubblicazione o firma umana. Pro100 non identificato.

Primo ID da consolidare: `u2-freefall-speed-01`, sourcequestions/U2-02.json.
B scrive freefall-speed021/freefall-time022/vertical-maximum023; A scrive
circular-speed024/centripetal-acceleration025/circular-force026. Reviewer separato
da B per021–023; root/reviewer distinto per024–026. Non autoverificare gli ID.
Leggere registry/checkpoint e SHA GitHub corrente prima di proseguire. I blocchi
successivi di questo file conservano gli incrementi precedenti come storia.

Ultimo checkpoint:256quesiti revisionati e29altre attività riesaminate,
generazionec0ef6e38483d96d9421d448e7effd2c9eb43ab78291696916f74475d29417e19.
Restano4350revisioni complete e356attività. Le nuove edizioni di C1-E003/E008
sono DRAFT: i due originali ancora pubblicati conservano FAIL esplicito. Non
dichiarare100%manuale il pubblicato e non simulare approvazioni umane.

PR355 MERGED su ba6aec22008f2ac83de4959a6165bac5a8ee0a14, CI post-merge SUCCESS.
La continuazione è sul ramo feat/cric-u2-first-families.774anteprime fresche
con16lotti/4worker terminano exit0; precedenti processi di test fermi nel cleanup
sono stati registrati come run non riuscito, non come PASS. Registro unico ora
supporta revisionPackage delle attività, mantenendo source e candidate separati.

Primo ID successivo: `u2-equal-time-average-01`. Le quattro famiglie017–020 sono
candidate già recensite da A, autore B, ma ancora da consolidare con browser,
import e checkpoint; non incrementare il conteggio sulla sola review scientifica.
Leggere i report perID e le note di correzione prima di congelare altre versioni.
Tutti i385record restano contabilizzati, le199prove recuperate sono parziali e
Pro100 non è identificato. La storia sotto conserva gli incrementi precedenti.

Checkpoint più recente della continuazione:160/4606 quesiti riscritti (tuttaU1),
16/385 altre attività riesaminate (6 contenitori senza calcoli,10 percorsi di metodo).
480 anteprime private e import idempotenti; umanoNOT_RUN, nuove pubblicazioni0.
Restano4.446 revisioni complete e369 altre attività. Pro100 non identificato;
199 controlli recuperati ancora parziali. Leggere il puntatore e verificare gli hash,
non dedurre il completamento dai candidati presenti ma non registrati.

PR354 MERGED su f972c972ffdc8d229c2d55dc7cc43b8a335bf5a1; CI corpus post-merge
SUCCESS, job Officina da rileggere. PR353 MERGED su b0642d87 e CI post-merge SUCCESS.
Il prossimo ID da consolidare è `u2-uniform-displacement-01`. Due autori hanno
ownership disgiunta su U2; la verifica è affidata a revisori AI distinti dall'autore
per ciascun ID. I nuovi candidati fuori dal registro non sono ancora revisioni
complete. Conservare la coda DRAFT e le versioni Cric già live.

L'importazione di un ID Cric esistente deve preservare il vecchio live e tutte le
versioni: il runner ora prova anche questo caso, oltre ai nuovi ID AR. Le code
umane sono artefatti della generazione; nessun PASS concede approvazione o pubblicazione.
Le note sotto sono snapshot precedenti e non aggiornano i conteggi più recenti.

Aggiornamento operativo del 24 novembre: PR #352 MERGED su
`a599cc8c621ea5c2b8e62834cbe00419b4694b4f`, CI post-merge 14/14 SUCCESS.
La continuazione produce altri 32 svolgimenti (scale-002, vectors-003), portando
a 64 i quesiti riscritti e verificati; 4.542 restano da revisionare integralmente.
I 199 controlli recuperati sono parziali; Pro100 ancora NOT_IDENTIFIED; 385 altre
attività ancora da riesaminare. Non ripetere scale/sum già presenti nel checkpoint.

Il registro dei lotti è ora parametrico: leggere `editorial/batches/registry.json`,
poi validare con `python -m tools.corpus_engineering.batches`. Cache sorgente,
prove scientifiche e prove browser hanno invalidazioni distinte. Le 192 anteprime
sono legate al runtime e ai byte dei pacchetti. La PR #353 protegge le figure anche
dagli alias URL/filesystem; rileggere SHA, check e stato terminale su GitHub.

Primo ID successivo: `u1-vector-difference-01`. Ownership isolata e temporanea:
autore A = difference/perpendicular/scalar-product, 48 ID;
autore B = product/projection/angle-ratio, 48 ID. Root unico integratore;
reviewer indipendente dall'autore prima di congelare le firme. I candidati in
lavorazione non entrano nei conteggi completati. Non attendere approvazione umana
per lavorare sui lotti successivi; mantenere tutte le nuove edizioni DRAFT.

Le righe sotto descrivono l'ingresso precedente alla PR #352 e sono conservate
come contesto storico. Per conteggi e prossimo ID prevalgono checkpoint e questa
riconciliazione, riletti con GitHub e con le somme della generazione.

Mandato esplicito del proprietario del 24 novembre 2026. Target unico:
branch `officina-di-fisica`, directory omonima. Base `5d1dc8dc7b601aef959d10d564c75462be74708d`;
sorgente Ardesia main `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`.
Leggere [contratto, risultati e comandi](../../officina-di-fisica/docs/corpus-engineering.md)
e [checkpoint per ID](../../officina-di-fisica/editorial/corpus/checkpoint.json).
Questo ingresso sostituisce le vecchie priorità operative; non modifica i canoni
o gli stati editoriali. Le sezioni precedenti sono conservate sotto come contesto datato.

Sono contabilizzati 4.000+606 quesiti e 385 altre attività. Sono stati recuperati
199 controlli tecnici distinti e prodotti 32 nuovi svolgimenti importabili in bozza.
Il lotto Pro di 100 revisioni non è identificato: non dichiararlo acquisito.
Nessun nuovo materiale pubblicato, nessun database degli utenti modificato.
Il registro distingue fasi automatiche, review AI e approvazione umana NOT_RUN.
Restano 4.574 revisioni complete, incluse le fasi mancanti dei 199 recuperati.

Primo passo: rileggere GitHub per la PR del branch `feat/cric-corpus-engineering`,
la sua SHA e le CI; completare l'integrazione nel target prima di rivendicarla.
Poi continuare con `u1-scientific-scale-01` e gli altri 128 U1, secondo le cinque
priorità e i criteri di accettazione nel documento collegato. Non fermarsi alla
pipeline: ogni successivo incremento deve produrre contenuti effettivi e prove.
Le bozze sono sotto `editorial/`, mai `content/` o `static/`; i pacchetti riusano
il validatore/importatore e i prerequisiti/adattività dell'unica applicazione.

## Ingresso precedente — accettazione di Fluidi e termodinamica

Snapshot del28 ottobre2026, preparato prima del merge finale. Il mandato CHIUSURA1 riguarda l'intero corso. Leggere prima lo stato generato con `python3 bin/state/project_state.py`, poi la [PR336](https://github.com/AndreaMarro/ardesia/pull/336), il suo record terminale, l'ultima voce del [RUNLOG](ARDESIA-RUNLOG.md) e la [prova di integrazione](closure1-20261028/integration-evidence.json). Un PENDING datato non dimostra un blocco attuale: rileggere GitHub, main, CI e deployment.

1A è unico integratore/deployer;1B possiede contenuti e valutazione;1C plugin e laboratori. Nessun writer parallelo sugli stessi file. Corso:10 DS più la lezione originale con audio,57 obiettivi/0 approvati,16 modelli/17 collocazioni effettive,8 scene3D,199 quesiti/40 svolti/2 mock. La mappa concettuale49 link/45 obiettivi è distinta dalla disponibilità per lezione. Riutilizzare Core/ricevute, registry/ToolHost e WorkspaceStore. eLab non deve rientrare:332 è già integrata e il boundary gate resta obbligatorio; SDK/Core/S19 indipendenti sono conservati.

Preview controllata: https://ardesia-closure1-acceptance-preview.vercel.app . Il percorso al corso include `view=classroom&edition=closure1-fluidi-20261028`. Supabase Auth/PostgreSQL sono reali con tre identità sintetiche; SYNTHETIC_ACCEPTANCE e productionReady=false, nessun profilo ordinario. Nessuna credenziale nei report/Git; non leggere o copiare l'intero bootstrap privato, che contiene anche la password DB. Nessun auto-deploy di main o promozione produzione implicita.

Primo passo: leggere l'esito terminale336. Se non conclusa, verificare collaudo readonly/ingresso docente sul candidato combinato2bef6629, CI strict, main effettiva e CI post-merge, preview main e rollback; soltanto poi disposition331/333/334/335/337. Fonte originale e commit distribuito sono distinti. Tutti i required checks, strict, enforceAdmins e conversazioni risolte restano obbligatori; niente admin/force. Se336 è già integrata e provata, non riaprire la convergenza.

Priorità successive: approvazioni scientifiche/editoriali nominative e cinque stati in uso con Andrea; device/rete/budget concordati con tablet/penna/secondo hardware; pilota di cinque studenti con almeno4/5 compiti UX senza suggerimenti e transfer distinto; decisione esplicita su profilo ordinario/privacy/costi/conservazione. Review AI, screenshot,0 violazioni axe e100 campioni SwiftShader non sostituiscono questi gate. I57 obiettivi restano DRAFT fino all'accettazione richiesta.

Conservare tutte le prove datate, inclusi RED:669 corso/ACK/GET/guard/fonti/audio/esami/Studio export e replay dati; d57b Core axe e compat;392 matrice completa e Poiseuille ma replay visuale RED; b807 conferma seek e dati ma conserva zoom SDK e clippingCSS;2bef6629 integra nomi, apertura del file nella identità originale e reflow, con prova hosted PASS separata:percorso ordinario,seek/scroll,zero replay writes/hashstabili,canvasaxe0violazioni,ownlogout/oldcookie401. Il record terminale distingue questa fonte da main e dal rollback. Le20 incomplete axe Core richiedono esame manuale. §8 unsupported/missing e cache non diventano strict-ready. D52 è restore verticale controllato, non piattaforma DR standalone. D55 provider PASS ma worker operatore disabilitato: non cancellare originali confermati né riattivare il worker senza procedura e decisione specifiche.

Il vecchio handoff dei quattro corsi rimane nella [versione precedente](https://github.com/AndreaMarro/ardesia/blob/d57b7c45f8cb55ad473572589b2bf5c06f17d10d/docs/ops/NEXT-SESSION-PROMPT.md); questo incremento non accetta gli altri corsi. Prima di terminare aggiornare RUNLOG/NEXT con risultati, limiti, errori/correzioni,3–5 priorità e prove. AgentMemory esterno è cache opzionale e non certifica lo stato.


## Addendum documentale, 28 ottobre 2026 — PR #338 — sintesi visiva e requisito W0

Questo aggiornamento **non è un nuovo task di implementazione** e non sostituisce i gate e le priorità operative già aperte. [PR #338](https://github.com/AndreaMarro/ardesia/pull/338) raccoglie la [specifica integrale datata](../product/ARDESIA_specifiche_integrali_ricostruite_2026-10-28.md), l'[atlante HTML dei 36 mockup](../design/visual-reference-library/ARDESIA_atlante_visivo_36_modelli_2026-10-28.html) e l'[indice visuale/accettazione W0](../design/visual-reference-library/README.md). Tutti i file sono riferimenti progettuali: **non** un nuovo canon, un attestato di implementazione o un motivo per pubblicare la banca DRAFT.

**Come riprendere correttamente:** generare lo stato con `bin/state/project_state.py` nel checkout reale; verificare `main`, PR/CI/Vercel correnti; leggere `AGENTS.md`, [CANON-INDEX](../CANON-INDEX.md), le ultime voci del [RUNLOG](ARDESIA-RUNLOG.md), contratti CoursePack/Core e i gate della chiusura attiva. `RUNLOG` è indicato come lettura per gli agenti, ma la lettura automatica da ogni host non è attestata. `CURRENT.md` non si aggiorna a mano e AgentMemory non è una seconda fonte autorevole.

**Per la prossima chiusura visuale:** usare B03/B04/G01/B01 del 27 ottobre come criterio W0: foglio didattico, penna, fonte e revisione esatta, laboratorio indipendente manipolabile, salvataggio e cold reopen; la stessa risorsa nel Taccuino e nella Lavagna, senza nuovo DB, plugin registry o authoring. **Non ripristinare eLab** e non realizzare un clone integrale dei mockup. Le verifiche UX, sicurezza, prestazioni e collaborazione restano da eseguire su un candidato preciso.

**Quattro prossime azioni subordinate ai gate correnti:** (1) chiudere PR #338 con check e stato GitHub effettivo; (2) mappare B03/B04/G01 ai componenti reali senza implementare più di una lezione W0; (3) verificare permessi, revoca, nuovo dispositivo e ripresa nella prova sintetica remota già in sviluppo; (4) fare review grafico-pedagogica su browser e hardware disponibile, registrando RED/GREEN e `not_checked`. Non sostituire con questi suggerimenti i mandati operativi delle PR #331–#337.

Esito integrazione documentale338: main778e2ebbb6f5d8f6b836d799d8a3fdfc41e66a58 già verificata come origine dei riferimenti. Il task documentale338 è MERGED; la checklist storica di apertura resta uno snapshot. I riferimenti W0 non sostituiscono la chiusura336 e non assegnano nuove implementazioni. Il file HTML contiene36 immagini integrate, distinto dai36 PNG originali del27 ottobre.

## 21 novembre 2026 · Ritrovare l’Officina di Fisica

Per un lavoro sui sei corsi di Andrea usare il branch `officina-di-fisica`, directory `officina-di-fisica/`, tag `officina-di-fisica-v1.0.0`. Avviare la copia locale con `python3 app.py serve --open` dalla directory del prodotto. Il pacchetto ZIP contiene la sola Officina e il bundle conserva il repository autonomo. Lo stato degli studenti e le istruzioni bancarie reali appartengono all’installazione privata. Il verbale di collaudo, la matrice MUR e il README documentano l’edizione. [Indice](../../officina-di-fisica/README.md) · [Distribuzione](../../officina-di-fisica/distribuzione/) · [Registro di questo branch](ARDESIA-RUNLOG.md)

## Cric / Officina di Fisica · aggiornamento del 23 novembre 2026

Per questa applicazione partire dal ramo `officina-di-fisica`, dallo stato terminale della PR 339 e dalle verifiche riferite al commit integrato. Il capitolo e la voce sono le chiavi di navigazione dei laboratori. Il rapporto distingue risultati su Mac reale, viewport touch emulati e valutazioni umane ancora aperte. [PR 339](https://github.com/AndreaMarro/ardesia/pull/339) · [Revisione canonica](../../officina-di-fisica/docs/architettura/README.md)

Alla riapertura, attendere la valutazione di Andrea. I tre passi condizionati sono il collaudo touch/lettore di schermo su telefono fisico, la prova di comprensione con studenti e il collaudo di un modello editoriale scelto dal docente. Dipendenze e risultati attesi sono nell’ultima voce dedicata a Cric. [Registro](ARDESIA-RUNLOG.md)

## 23 novembre 2026 · Recupero formativo C1-Q027

Il percorso di riferimento è C1 → Esercizi prioritari → Aree di segno opposto → Inizia il quesito. Dopo un errore aprire **Prova il ritorno di 7 s**. La PR tecnica e il job Officina distinguono il collaudo del candidato da quello del ramo integrato. Per riprendere la valutazione, leggere prima il verbale, poi le tre prove aperte del registro: rubrica del docente, telefono fisico quando disponibile, pilot e trasferimento differito. [Verbale e istruzioni](../../officina-di-fisica/docs/recupero-c1-q027/README.md) · [Registro](ARDESIA-RUNLOG.md)

## Continuità · 23 novembre 2026

Per Officina partire dalla SHA effettiva del ramo `officina-di-fisica` e dalla PR tecnica della ricerca. Il contratto della ricerca distingue verifica automatica, ritorno alla sessione, regressioni scientifiche e prova con studenti. La priorità di prodotto successiva è il diario operativo dei recuperi su C1–C6, legato ai tentativi esistenti. [Matrice delle funzioni](../../officina-di-fisica/docs/verifica-prodotto/README.md) · [Prove e limiti](../../officina-di-fisica/docs/verifica-prodotto/ricerca.md) · [Registro](ARDESIA-RUNLOG.md)

## 23 novembre 2026 · Diario formativo

Partire dalla SHA effettiva di `officina-di-fisica`. Verificare il verbale di integrazione della ricerca sul merge `f31ef847` e l’esito della PR del diario. Il codice `9b5dc7e4` aggiunge il percorso operativo su tutti i sei microcorsi e conserva i registri precedenti. La matrice D1–D6 riporta il confronto su 513 quesiti, la riapertura della risposta originale e i limiti dei richiami nei cinque obiettivi con sole due famiglie.

1. Confrontare il commit integrato, i tredici job, il pacchetto verificato e il percorso reale con il verbale della PR.
2. Dalla base così verificata migliorare le modalità di lettura presenti, con accettazione anticipata e prove sul lettore canonico.
3. Tracciare separatamente gli esiti editoriali per ID, il collaudo touch fisico rinviato e l’osservazione dell’autonomia con studenti. [Evidenze](../../officina-di-fisica/docs/verifica-prodotto/diario.md)

## Officina · Lettura personale

Partire dal ramo ufficiale e verificare l’effettiva integrazione dell’incremento del lettore. I punti da riprendere nell’ordine sono il confronto con le prove della SHA di merge, la revisione delle spiegazioni per ID e il recupero grafico conservando i dati della simulazione. Per riprodurre la lettura aprire C6-L01 e il terzo passaggio sull’eco. Per il ritorno all’allenamento aprire C1-Q034. [Risultati, controlli e limiti](../../officina-di-fisica/docs/verifica-prodotto/lettura.md)

## Officina · Edizione C4 e banchi

Il codice dell’edizione C4 discende dal lettore integrato `250673b6`. Prima di proseguire riconciliare commit effettivo, CI post-merge e pacchetto. Per il confronto aprire C4-Q091 e il primo problema di LAB3D-07. La geometria e il recupero del contesto richiedono un incremento separato, con baseline reale per WebGL e tavola. Gli altri corsi conservano la loro revisione da svolgere per ID. [Contratto, prove per SHA e limiti](../../officina-di-fisica/docs/verifica-prodotto/edizione-c4.md)

### Officina · 23 novembre 2026, continuità dei banchi

Riconciliare base, PR e merge con GitHub. La revisione C4 ha verbale post-merge e ZIP identici sulla `d2c9e0a6`. Il banco recupera il contesto sulla sorgente `efef256b` con controprove di immagine, scelte manuali e letture. Proseguire con il registro editoriale degli altri corsi, la correzione delle voci motivate e la verifica dei collegamenti contestuali. Le prove con utenti e telefono fisico rimangono separate. [Contratto](../../officina-di-fisica/docs/verifica-prodotto/continuita-banchi.md)
