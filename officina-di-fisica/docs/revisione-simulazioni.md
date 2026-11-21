# Revisione dei tre fascicoli di Fisica

Edizione controllata il 21 novembre 2026. Ogni fascicolo comprende 21 domande con cinque opzioni e una risposta corretta, seguite da 10 completamenti di un solo concetto. Ogni quesito rimanda a una competenza dei microcorsi e ha uno svolgimento. I numeri di quesiti per area seguono una scelta editoriale.

| Fascicolo | Strumenti e meccanica | Fluidi | Termodinamica | Elettricità e magnetismo | Onde, ottica e radiazioni |
|---|---:|---:|---:|---:|---:|
| 1 | 7 | 6 | 6 | 6 | 6 |
| 2 | 7 | 6 | 6 | 6 | 6 |
| 3 | 7 | 6 | 5 | 7 | 6 |

## Consegne e varietà

Il primo fascicolo comprende letture di area, equilibrio di forze, simmetrie e bilanci energetici. Nel secondo compaiono decisioni sul confine del sistema, trasformazioni tra stati e bilanci di massa al nodo. Il terzo richiede anche costruzioni ottiche a due riflessioni, confronto fra strumenti che condividono un’accelerazione e analisi del potenziale in un ponte di resistori. Fra i completamenti figurano sia termini e unità sia conclusioni fisiche, come il verso di una corrente indotta visto da un osservatore specificato.

Il confronto testuale ha coperto le 56.730 coppie fra i 93 quesiti delle simulazioni e i 610 enunciati dei cinque microcorsi, comprendenti 110 esempi e 500 esercizi. Altre 4.278 coppie coprono i confronti fra i 93 enunciati stessi. Dopo normalizzazione di spazi, maiuscole, Unicode e punteggiatura, gli enunciati identici sono zero in entrambi i confronti. L’indice di Jaccard massimo fra gruppi consecutivi di quattro parole è 0,071 nel confronto con i moduli e 0,095 nel confronto interno.

La verifica dei passaggi richiesti ha portato anche a sostituire esercizi che utilizzavano lo stesso procedimento con una diversa formulazione. Per esempio, ora il quesito C6-Q062 ricostruisce l’entropia del ritorno irreversibile tramite un cammino reversibile di andata. In C6-Q095 lo studente usa una simmetria per riconoscere due nodi equipotenziali prima di calcolare la corrente. Altri controlli hanno precisato incomprimibilità, punto di osservazione, convenzioni dei segni e riferimento angolare. I termini scientifici, gli stessi principi e alcune abilità fondamentali ricorrono nei moduli e nelle prove.

## Verifiche ripetibili

L’audit dei contenuti ricalcola 35 risultati delle opzioni a scelta numerica, controlla la struttura di tutti e 93 i quesiti, la presenza di una sola chiave fra cinque opzioni distinte e i collegamenti alle soluzioni. L’audit lessicale controlla espressamente l’identità dei testi e misura la sovrapposizione di gruppi di parole. I test HTTP verificano consegna, omissioni, correzioni, termine della prova e calcolo del punteggio.

Dalla cartella del repository si possono ripetere le verifiche con questi comandi.

    python3 tools/c56_audit.py
    python3 tools/c56_varieta.py
    python3 -m unittest discover -s tests -p test_workflows.py

La revisione di questa edizione ha combinato controlli automatici e riesame editoriale eseguito con assistenza di modelli. Una validazione umana e una taratura psicometrica su studenti reali restano da svolgere.
