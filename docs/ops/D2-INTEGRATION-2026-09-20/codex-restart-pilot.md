# Pilot privato: preparato, non eseguito — 21 settembre 2026

`REAL_PILOT=NOT_RUN`. Nessuna lezione reale autorizzata ricevuta. Le prove di
questa sessione usano dati sintetici, testo/eventi/formule e un provider mock;
non dimostrano qualità del modello, audio, grafia, immagini o autonomia studente.
Non è necessario integrare Kirchhoff per iniziare una prova privata.

## Prerequisiti e percorso minimo

1. Review indipendente del nuovo SHA della patch R-01; scelta esplicita della
   candidate isolata. Non serve un merge per il pilot.
2. Prima del percorso completo nel riepilogo: risolvere R-02 (journal per-room
   **e parsing v2**) e R-03 (export live dal chiamante). In alternativa, un pilot
   limitato all'Engine può partire da `.lesson` autorizzati di cui siano già
   controllati manifest, identità, contenuti e memoria live; non certificherebbe
   cattura e riepilogo Studio. La vista Lezioni salvate passa già il log live;
   verificarne l'artefatto del caso, non affidarsi alla sola etichetta del bottone.
3. Andrea seleziona 3 lezioni reali, al massimo 5, con autorizzazione a trattare
   gli input e destinazione privata. Usare ID anonimi; dati identificativi,
   registrazioni e materiali restano fuori dal repository e dagli artifact CI.
4. Configurare consapevolmente il provider esistente e autorizzare l'eventuale
   chiamata a pagamento, con limite di spesa e dati inviabili. Il probe attuale
   rileva una chiave presente e override Kimi con suffisso `/anthropic`, mentre
   l'adapter invia il contratto OpenAI a `{base}/chat/completions`. Serve una base
   compatibile e un modello scelti/verificati dall'owner, oppure una decisione
   esplicita sull'adapter. Nessun valore segreto stampato, nessun endpoint cambiato,
   nessun fallback attivato, nessuna nuova richiesta live: il vecchio 404 non è
   stato riprodotto in rete e il limite di configurazione rimane aperto.
5. Per ogni lezione: cattura → verifica dei dati persistiti e dell'identità →
   `.lesson` → `compose_lesson_material` con store privato/router autorizzato →
   ispezione del `LessonMaterial`/`SummaryPack` → correzione docente → exporter PDF
   esistente, sandbox attiva → controllo del PDF → riuso nella lezione seguente.
   La composizione è oggi una capacità applicativa Python: il pilot Engine
   richiede assistenza tecnica; non viene promesso un pulsante Studio completo.
   Il programma `d2_evidence_consume.py` è una prova sintetica, non il launcher
   di lezioni reali. La revisione precede l'export, senza invio allo studente.

## Casi da selezionare, non risultati già ottenuti

| ID privato | Caso proposto | Verifica distintiva |
|---|---|---|
| L1 | Elettrotecnica: legge di Ohm e circuito DC semplice | Segni, unità, formule e riferimenti alle fonti |
| L2 | Fisica: esercizio con errore discusso e poi corretto | Distinguere errore osservato, correzione e fatto scientifico |
| L3 | Ripresa di L1 nella lezione successiva | Recupero delle fonti, riuso materiale, nessun dato di L2 |
| L4 opzionale | Lezione lunga con più pagine/fonti | Omissioni, impaginazione e costo di revisione |
| L5 opzionale | Secondo caso della materia prevalente | Ripetibilità e manutenzione necessaria |

Prima della generazione, il docente annota risultato scientifico atteso, passaggi
essenziali e omissioni inaccettabili. Non adattare l'oracolo per far passare l'output.
Un errore scientifico grave, fonte falsa o contaminazione d'identità impedisce la
consegna; registrare la correzione necessaria e mantenere l'originale privato.

## Scheda da compilare per ciascun caso

Valori iniziali **non misurati**; non interpretare i campi vuoti come zero.

| Misura | Registrazione richiesta |
|---|---|
| Baseline manuale | Minuti per produrre un materiale equivalente, con stesso livello di revisione |
| Setup/cattura | Minuti extra rispetto alla lezione abituale; input realmente supportati |
| Generazione | Tempo di attesa separato dai minuti di supervisione attiva; costo provider |
| Correzione | Minuti docente, numero e natura delle modifiche |
| Errori scientifici gravi | Conteggio prima/dopo revisione, descrizione e fonte di controllo |
| Omissioni importanti | Confronto con passaggi essenziali preregistrati |
| Layout | Tagli, formule illeggibili, salti pagina; giudizio utilizzabile / da correggere |
| Fonti | Citazioni risolvibili, pertinenti e utili alla verifica; tempo per ritrovarle |
| Riuso successivo | Se/cosa riusato, tempo di recupero, correzioni aggiuntive |
| Manutenzione/lavoro trasferito | Minuti tecnici e lavoro aggiunto a studente/docente, anche fuori sessione |
| Esito | Utilizzabile dopo revisione / respinto, motivazione e SHA degli strumenti |

Tempo netto risparmiato = baseline manuale meno setup extra, supervisione,
correzione, recupero e manutenzione attribuibile. Riportare anche attesa e costi,
senza mascherarli nel solo rendering. Tre-cinque casi forniscono indicazioni d'uso,
non validazione statistica né prova di maggiore autonomia dello studente.

## ChatGPT, dopo capacità applicative verificate

Primo adapter candidato: `lesson_recall` read-only. Identità derivata dal server,
scope autorizzato, fonti risolvibili, stati assente/incompleto distinti da fatti.
Consuma la memoria applicativa esistente, senza nuova memoria, secondo modello
documentale o solver. Nessun server MCP, OAuth, tunnel o app pubblica implementati.
