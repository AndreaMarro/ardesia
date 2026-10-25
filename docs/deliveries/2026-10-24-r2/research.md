# R2 — ricerca applicata e decisioni di ingegnerizzazione

Ricognizione del24–25ottobre2026, usata per questa slice, non una classifica universale di architetture o una revisione sistematica. SciSpace è stato realmente interrogato; gli abstract indicizzati e le colonne generate non sostituiscono le fonti primarie o la valutazione dei metodi.

## Domande, fonti e limiti

Due ricerche SciSpace in linguaggio naturale hanno confrontato: modularità/microservizi e costo per team piccoli; previsione, manipolazione, aiuti e trasferimento nelle simulazioni didattiche. Dieci risultati per domanda. La prima risposta comprende molte sintesi recenti e depositi non sufficientemente verificati: non usati per percentuali o per dichiarare «migliore» un’architettura. Per due lavori della seconda ricerca è stata chiesta anche la colonna limitations.

| Fonte primaria verificata | Cosa sostiene la scelta | Cosa non dimostra qui |
| --- | --- | --- |
| [DORA: small batches](https://dora.dev/capabilities/working-in-small-batches/) | Unità di lavoro piccole, utili, indipendenti e verificabili; feedback prima di ampliare la portata. | Non certifica automaticamente una PR né il prodotto Ardesia. |
| [DORA: loosely coupled teams](https://dora.dev/capabilities/loosely-coupled-teams/) | Valutare autonomia di modifica/test/deploy e costo di coordinamento; il nome «microservizi» non garantisce questi risultati. | Non misura traffico, capacità del database o limiti dei provider di Ardesia. |
| [DORA: trunk based development](https://dora.dev/capabilities/trunk-based-development/) | Limitare la durata dei rami e integrare cambi piccoli per ridurre il costo delle divergenze. | Non autorizza a saltare review, protezioni o decisione umana sul merge. |
| [Parnas1972, DOI10.1145/361598.361623](https://doi.org/10.1145/361598.361623) | Confini che nascondono decisioni suscettibili di cambiare, anziché moduli corrispondenti soltanto alle fasi di una pipeline. | È un argomento progettuale; non è un benchmark di scalabilità di questa applicazione. |
| [MicroSims, arXiv2511.19864v1](https://arxiv.org/abs/2511.19864v1), trovato viaSciSpace | Pattern di simulazioni leggere, metadata ed embedding; utile come confronto concettuale con ToolHost già esistente. | Preprint, non studio di Ardesia. Nessun codice/asset adottato e nessuna percentuale di apprendimento trasferita al marketing. |
| [Providing Adaptive Support in an Interactive Simulation for Learning, CHI2015](https://doi.org/10.1145/2702123.2702424), SciSpaceID48eisz4vdx | Abstract/limitations suggeriscono di distinguere aiuti disponibili da supporto che risolve davvero le cause dell’errore. | Full text del publisher non recuperato (403): non attribuiti dettagli sperimentali non letti, né efficacia ai nostri indizi. |

SciSpace segnala per MicroSims che l’estratto non permette di determinare campione, durata e limiti sperimentali. È conservata questa incertezza. Le scelte didattiche R2 sono ipotesi di prodotto verificabili, non risultati di un pilot umano già effettuato.

## Applicazione concreta nella slice

- **Un Core e un monolite modulare.** ADR-0004 già decide questo confine: i modelli e le ricevute restano nel dominio; il browser rappresenta valori, non implementa un altro solver. Niente nuovo servizio, database, LMS o libreria di animazione.
- **Composizione di soli dati.** Esperienza/passi/fasi, pin della versione e digest, renderer allowlisted e avanzamento dopo ricevuta. V1/v2 storici rimangono risolvibili. Il nuovo contratto è una prima istanza eseguibile di composizione, non un editor universale o un marketplace completato.
- **Tre capacità oltre il rifacimento grafico.** Aiuti progressivi, idrostatica con riferimenti distinti e Taylor con curve del Core. Il pubblico può provare due modelli di fluidi; l’Aula conserva le previsioni del nuovo episodio nelle stesse consegne/revisioni.
- **Test ai confini.** Pin/versioni, unità, retry, writer concorrenti, fonte autorizzata e classificazione dell’assistenza. La review ha provocato un500 con un intero enorme e lo ha chiuso con un rifiuto senza scritture, anziché limitarsi a leggere i test degli autori.
- **Costo osservabile.** Il plot Taylor ha41campioni: mediana CPU locale0,122→1,942ms per valutazione e payload compatto539→6784byte, sullo stessoPython e benchmark dichiarato. È un costo aggiunto, non un risparmio o una misura HTTP/produzione. Browser mobile e asset vengono misurati separatamente.

## REA effettivamente usato

Distribuzione cached rea-agents6.7.0, Node26.5.1, Chromium148.0.7778.96. La CLI è stata usata per acquisizioni con Evidence; gli strumenti MCP REA non risultano esposti nella sessione, anche se la registrazioneCodex è allineata. Nessuna riconfigurazione globale. La release GitHub ipotizzata v6.7.0 risponde404: la sintassi eseguita deriva dall’help/schema della distribuzione installata, non dal ramo main non fissato.

Le quattro missioni seguono Evidence→contratto originale→riuso→codice→test e mantengono i negativi. Brilliant onboarding non è una lezione completata; GoodnotesWeb/login non è osservazione del NoteReplay nativo; Numbas timeout non è un difetto provato del prodotto. H5P e CircuitJS offrono gesti realmente osservati, con limiti/licenze nei ticket. I raw donor non sono incorporati nel prodotto.

Il confronto REA/metodo diretto resta **UNKNOWN per il costo complessivo**: non abbiamo una seconda squadra sullo stesso incarico, né token/costo totale esposti. Le durate provider e dei comandi sono riportate come misure parziali. Non vengono sommate in un falso costo end to end o in una promessa di accelerazione.

## Prossima decisione, non nuova infrastruttura

La prima commercializzazione richiede una demo autentica, contatto funzionante e contenuti approvati; non richiede un marketplace remoto. Prima completare e verificare una capacità di microcorso, poi aggiungerla al protocollo plugin/risorse esistente con un secondo consumer reale. [Mandato aggiuntivoR2B](prompts/MANDATO-R2B-PLUGIN-RISORSE.md) traduce questo criterio in consegna e accettazione.
