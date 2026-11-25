# Primaria indipendente U6-04 — lotti A220–224

Stato: 80 derivazioni individuali dei soli prompt originali, prima di candidati, opzioni, chiavi, solutionSteps, hints o SVG A220–224. Nessun PASS di candidati e nessuna approvazione umana.

Disclosure: esposizione a U6-04 limitata a id/prompt/familyId/lawFamily estratti tramite allowlist dal Git immutabile. Tutti gli 80 prompt A sono stati letti individualmente. Nessun candidato, chiave, opzione, soluzione originale, primaria A o primaria Root U6-04 letto; nessun risultato anticipato dall’autore A. Le precedenti conoscenze del catalogo C4 sono basi disciplinari, non chiavi dei quesiti.

Fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json. Raw SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Snapshot allowlist160 SHA256 4aec8d0bacfbd7c9d3b712a5d0d9de7e24a80e66b38bf53ca16cbf484a90f466. Esattamente 16 prompt per ciascuna delle cinque famiglie autorizzate.

Cautele: carica conservata sui conduttori isolati, non conservazione automatica dell’energia del solo campo durante la redistribuzione. Le topologie equivalenti non determinano da sole il protocollo di commutazione. Le capacità in serie hanno uguali moduli di carica per il nodo interno inizialmente neutro; le tensioni non sono necessariamente uguali. Tensioni positive e ordinamento delle due tensioni sono vincoli espliciti; rami fisici delle inverse e singolarità dei rapporti vanno mantenuti. Le tarature sono mappe affini delle uscite e non nuove leggi elettriche. Le medie sono di prove distinte.

## u6-parallel-capacitors-01

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Sono assegnati C₁ = 2 μF e C₂ = 3 μF. Quanto vale capacità equivalente (C_eq) in μF?

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Le due capacità vedono la medesima tensione V; la carica del nodo comune è Q=(C₁+C₂)V, quindi C_eq=C₁+C₂. Con 2 e 3 μF si ottiene 5 μF. La relazione equivalente resta definita anche se la particolare tensione applicata è nulla.

## u6-parallel-capacitors-02

Prompt originale:

Nell’argomento «Condensatori in parallelo» si considera capacità equivalente. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

La capacità è carica divisa per differenza di potenziale: [C_eq]=C/V=F. Il prefisso micro cambia il numero, non la dimensione.

## u6-parallel-capacitors-03

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente C_eq nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Fra gli stessi due nodi le tensioni sono uguali; sommando le cariche dei due rami si ricava C_eq=C₁+C₂. Non si sommano le inverse, proprie della connessione in serie.

## u6-parallel-capacitors-04

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Si passa da C₁ = 2 μF a C₁ = 1 μF, mantenendo C₂ = 3 μF e le altre condizioni fisse. Che cosa accade a capacità equivalente?

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Dimezzare C₁ da 2 a 1 μF lascia C₂ a 3 μF. La nuova capacità equivalente è 1+3=4 μF, rispetto ai 5 μF iniziali: non si dimezza l’intera rete.

## u6-parallel-capacitors-05

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

La misura di capacità equivalente è 5 μF; si conosce C₂ = 3 μF. Determina prima capacità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Isolo C₁ nella somma: C₁=C_eq−C₂. Il dato 5 μF meno 3 μF restituisce 2 μF; la positività richiede C_eq>C₂.

## u6-parallel-capacitors-06

Prompt originale:

Il sistema è isolato dai generatori e il collegamento ha polarità opposte. Si cerca la tensione finale dopo la redistribuzione, non il valore istantaneo durante il transitorio.

Un condensatore da 1 μF è carico a 6 V e un condensatore da 2 μF è carico a 3 V. Si scollegano entrambi dai generatori e si collegano in parallelo con polarità opposte: l’armatura positiva del primo alla negativa del secondo. Qual è la tensione finale fra i due nodi?

Ipotesi e convenzioni: Generatori scollegati Collegamento con polarità opposte Transitorio concluso

Derivazione primaria indipendente:

Conservo la carica del nodo che unisce la piastra positiva del primo condensatore alla piastra negativa del secondo. Le cariche iniziali hanno segno opposto: (1 μF)(6 V)−(2 μF)(3 V)=0 μC. Dopo il transitorio (C₁+C₂)V_f=0, dunque V_f=0 V. Non si conserva l’energia del solo campo: i 18+9=27 μJ iniziali sono trasferiti durante il transitorio. L’ipotesi di stato finale assestato non equivale a un transitorio ideale privo di dissipazione.

## u6-parallel-capacitors-07

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Nello stato A: C₁ = 2 μF, C₂ = 3 μF. Nello stato B rimane C₁ = 2 μF, mentre C₂ = 1 μF. Calcola il rapporto C_eq_B/C_eq_A.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La rete B ha 2+1=3 μF contro i 5 μF di A. Il rapporto richiesto è C_eq,B/C_eq,A=3/5, adimensionale e minore di uno.

## u6-parallel-capacitors-08

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Con C₁ = 2 μF e C₂ = 3 μF, una soluzione propone C_eq_proposto = 10 μF. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La soluzione è 5 μF; lo scarto con segno proposta meno soluzione è 10−5=+5 μF. Non prendo il valore assoluto prima di stabilire l’ordine della sottrazione.

## u6-parallel-capacitors-09

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Si misura C_eq e si conoscono le altre quantità della relazione C_eq = C₁ + C₂. Quale formula isola C₁ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Dalla carica totale ricavo C₁=C_eq−C₂. Il dominio con entrambi i condensatori presenti è C₂>0 e C_eq>C₂; l’uguaglianza al bordo darebbe C₁=0, escluso.

## u6-parallel-capacitors-10

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Da uno stato A con grandezze C₁ e C₂ si passa a uno stato B in cui C₁_B = κ₁·C₁ e C₂_B = κ₂·C₂. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto C_eq_B/C_eq_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Sostituisco separatamente C₁,B=κ₁C₁,A e C₂,B=κ₂C₂,A. Il rapporto vale (κ₁C₁,A+κ₂C₂,A)/(C₁,A+C₂,A), media dei fattori pesata dalle capacità positive. Per κ₁=κ₂=κ si riduce a κ, non al prodotto dei fattori.

## u6-parallel-capacitors-11

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Nello stato iniziale A si hanno C₁ = 2 μF e C₂ = 3 μF. Nello stato B si hanno C₁ = 3 μF e C₂ = 5 μF. Qual è il rapporto C_eq_B/C_eq_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

In B la somma è 3+5=8 μF; in A è 2+3=5 μF. Il rapporto è 8/5. Ogni preparazione conserva la topologia in parallelo.

## u6-parallel-capacitors-12

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Si registrano due letture con uguale peso statistico. La prima usa C₁ = 2 μF, C₂ = 3 μF; la seconda usa C₁ = 3 μF, C₂ = 5 μF. Qual è la media aritmetica delle due letture di capacità equivalente? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Le due uscite sono 5 e 8 μF; la media aritmetica è 13/2 μF. Le capacità medie sono 5/2 e 4 μF e sommano anch’esse 13/2 μF, perché la legge è lineare in entrambi gli ingressi. È una media di due prove, non la capacità di quattro elementi fisicamente collegati.

## u6-parallel-capacitors-13

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

La condizione iniziale è C₁ = 2 μF, C₂ = 3 μF. Si impone poi C₁ = 3 μF e si vuole che la grandezza d’uscita diventi 8/5 volte quella iniziale. Quale rapporto C₂_B/C₂_A è necessario?

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il rapporto di uscite 8/5, moltiplicato per i 5 μF di A, impone C_eq,B=8 μF. Sottraggo C₁,B=3 μF: C₂,B=5 μF. Rispetto a C₂,A=3 μF il fattore è 5/3.

## u6-parallel-capacitors-14

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Uno strumento misura C_eq con legge S_strum = a_cal·C_eq, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento C₁ = 2 μF, C₂ = 3 μF, legge S_strum=15. In una nuova prova legge S_strum=24 e si conosce C₂ = 5 μF. Determina prima capacità nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

La taratura D=aC_eq senza offset dà a=15/(5 μF)=3 μF⁻¹. D=24 corrisponde a 8 μF. Tolto C₂=5 μF resta C₁=3 μF; D è una lettura, non una capacità.

## u6-parallel-capacitors-15

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

Lo strumento obbedisce a S_strum = a_cal·C_eq + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: C₁ = 2 μF, C₂ = 3 μF, S_strum=11. Riferimento B: C₁ = 3 μF, C₂ = 5 μF, S_strum=17. Prova C: C₂ = 1 μF, S_strum=5. Trova prima capacità nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Dai riferimenti (5 μF,11) e (8 μF,17) ricavo a=2 μF⁻¹ e b=1. D_C=5 significa C_eq,C=(5−1)/2=2 μF. Con C₂,C=1 μF risulta C₁,C=1 μF; l’offset va sottratto prima della divisione.

## u6-parallel-capacitors-16

Prompt originale:

Due condensatori ideali C₁ e C₂ sono collegati in parallelo fra la stessa coppia di nodi. Si cerca la capacità equivalente.

I valori numerici nelle unità dichiarate devono soddisfare C₁ = 2/3·C₂. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è C_eq=5 μF. Determina seconda capacità nel dominio fisico positivo.

Ipotesi e convenzioni: Stessa coppia di nodi Condensatori lineari I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Con C₁=(2/3)C₂ la somma diventa (5/3)C₂=5 μF. C₂=3 μF e C₁=2 μF: una sola coppia positiva, perché il vincolo di rapporto e il valore della somma fissano anche la scala.

## u6-series-capacitors-01

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Sono assegnati C₁ = 2 μF e C₂ = 2 μF. Quanto vale capacità equivalente (C_eq) in μF?

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Il nodo intermedio inizialmente neutro e isolato impone uguali moduli delle cariche. La tensione totale è Q/C₁+Q/C₂, quindi C_eq=C₁C₂/(C₁+C₂). Due capacità da 2 μF danno 4/4=1 μF, inferiore a ciascuna.

## u6-series-capacitors-02

Prompt originale:

Nell’argomento «Condensatori in serie» si considera capacità equivalente. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Anche una capacità equivalente si misura in farad: F=C/V. La topologia cambia la relazione numerica, non la dimensione fisica.

## u6-series-capacitors-03

Prompt originale:

Due condensatori inizialmente scarichi vengono collegati in serie a un generatore. Il nodo intermedio è isolato. Quale grandezza ha lo stesso modulo nei due condensatori a regime?

Ipotesi e convenzioni: Valgono esclusivamente le condizioni esplicitate nella domanda concettuale.

Derivazione primaria indipendente:

Le cariche sui lati del nodo intermedio devono compensarsi. Segue 1/C_eq=1/C₁+1/C₂, ossia C_eq=C₁C₂/(C₁+C₂), con C₁,C₂ positive. La somma diretta sarebbe la legge del parallelo.

## u6-series-capacitors-04

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Si passa da C₁ = 2 μF a C₁ = 1 μF, mantenendo C₂ = 2 μF e le altre condizioni fisse. Che cosa accade a capacità equivalente?

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

C₁ diventa 1 μF e C₂ resta 2 μF. C_eq=(1·2)/(1+2)=2/3 μF, contro 1 μF iniziale. La variazione di un solo elemento non scala l’intera rete dello stesso fattore.

## u6-series-capacitors-05

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

La misura di capacità equivalente è 1 μF; si conosce C₂ = 2 μF. Determina prima capacità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Isolo C₁: C_eq(C₁+C₂)=C₁C₂, dunque C₁=C_eq C₂/(C₂−C_eq). Con C_eq=1 μF e C₂=2 μF ottengo 2 μF. Il denominatore è positivo.

## u6-series-capacitors-06

Prompt originale:

Gli stessi due componenti vengono considerati in configurazioni elettriche differenti. Non si sta confrontando la carica di un singolo esperimento di commutazione.

Due condensatori identici da 2 μF vengono usati prima in serie e poi in parallelo. Qual è il rapporto C_parallelo/C_serie delle capacità equivalenti? Le due misure riguardano soltanto la capacità dei collegamenti.

Ipotesi e convenzioni: Condensatori lineari identici Confronto delle capacità equivalenti Nessuna ipotesi di conservazione di tensione o carica durante una commutazione

Derivazione primaria indipendente:

Con due elementi da 2 μF il serie vale 1 μF e il parallelo 4 μF: C_par/C_ser=4. Qui si confrontano coefficienti equivalenti di due topologie; non è assegnato un protocollo di commutazione che permetta ulteriori conclusioni su carica o energia conservata.

## u6-series-capacitors-07

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Nello stato A: C₁ = 2 μF, C₂ = 2 μF. Nello stato B rimane C₁ = 2 μF, mentre C₂ = 1 μF. Calcola il rapporto C_eq_B/C_eq_A.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Per C₁=2 μF e C₂,B=1 μF risulta C_eq,B=2/3 μF. Divido per C_eq,A=1 μF e ottengo il rapporto puro 2/3.

## u6-series-capacitors-08

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Con C₁ = 2 μF e C₂ = 2 μF, una soluzione propone C_eq_proposto = 2 μF. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Lo scarto proposta meno soluzione è 2−1=+1 μF. L’unità rimane quella della capacità, non un rapporto puro.

## u6-series-capacitors-09

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Si misura C_eq e si conoscono le altre quantità della relazione 1/C_eq = 1/C₁ + 1/C₂; C_eq = C₁C₂/(C₁+C₂). Quale formula isola C₁ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La formula inversa è C₁=S C₂/(C₂−S), con S=C_eq. Per capacità finite positive occorre 0<S<C₂. Il bordo S=C₂ non dà una capacità finita; S maggiore di C₂ imporrebbe un elemento negativo, fuori modello.

## u6-series-capacitors-10

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Da uno stato A con grandezze C₁ e C₂ si passa a uno stato B in cui C₁_B = κ₁·C₁ e C₂_B = κ₂·C₂. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto C_eq_B/C_eq_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Applicando i due fattori si trova C_eq,B=κ₁κ₂ C₁C₂/(κ₁C₁+κ₂C₂). Dividendo per l’uscita A resta κ₁κ₂(C₁+C₂)/(κ₁C₁+κ₂C₂). Se entrambi i fattori sono κ il risultato è κ, coerente con l’omogeneità di grado uno.

## u6-series-capacitors-11

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Nello stato iniziale A si hanno C₁ = 2 μF e C₂ = 2 μF. Nello stato B si hanno C₁ = 3 μF e C₂ = 6 μF. Qual è il rapporto C_eq_B/C_eq_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

La preparazione A con 2 e 2 μF vale 1 μF; B con 3 e 6 μF vale 18/9=2 μF. Il rapporto di uscite è 2.

## u6-series-capacitors-12

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Si registrano due letture con uguale peso statistico. La prima usa C₁ = 2 μF, C₂ = 2 μF; la seconda usa C₁ = 3 μF, C₂ = 6 μF. Qual è la media aritmetica delle due letture di capacità equivalente? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La media delle uscite è (1+2)/2=3/2 μF. Le medie degli ingressi sono 5/2 e 4 μF; la loro capacità in serie sarebbe 10/(13/2)=20/13 μF. La differenza è −1/26 μF: la legge non è lineare e le due operazioni non commutano.

## u6-series-capacitors-13

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

La condizione iniziale è C₁ = 2 μF, C₂ = 2 μF. Si impone poi C₁ = 3 μF e si vuole che la grandezza d’uscita diventi 2 volte quella iniziale. Quale rapporto C₂_B/C₂_A è necessario?

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il rapporto 2 impone in B C_eq=2 μF. Con C₁,B=3 μF risolvo 2(3+C₂,B)=3C₂,B e trovo 6 μF. Il fattore richiesto rispetto ai 2 μF iniziali è 3.

## u6-series-capacitors-14

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Uno strumento misura C_eq con legge S_strum = a_cal·C_eq, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento C₁ = 2 μF, C₂ = 2 μF, legge S_strum=3. In una nuova prova legge S_strum=6 e si conosce C₂ = 6 μF. Determina prima capacità nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

La lettura 3 associata a 1 μF stabilisce a=3 μF⁻¹. La lettura 6 indica C_eq=2 μF; con C₂=6 μF l’inversa dà C₁=(2·6)/(6−2)=3 μF.

## u6-series-capacitors-15

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

Lo strumento obbedisce a S_strum = a_cal·C_eq + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: C₁ = 2 μF, C₂ = 2 μF, S_strum=3. Riferimento B: C₁ = 3 μF, C₂ = 6 μF, S_strum=5. Prova C: C₂ = 1 μF, S_strum=2. Trova prima capacità nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

I riferimenti 1 μF→3 e 2 μF→5 danno a=2 μF⁻¹ e b=1. D_C=2 corrisponde a S=1/2 μF. Con C₂=1 μF, C₁=(1/2)/(1−1/2)=1 μF, nel dominio S<C₂.

## u6-series-capacitors-16

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie. Il nodo intermedio resta isolato e non riceve carica dall’esterno. Si cerca C equivalente.

I valori numerici nelle unità dichiarate devono soddisfare C₁ = 1·C₂. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è C_eq=1 μF. Determina seconda capacità nel dominio fisico positivo.

Ipotesi e convenzioni: Condensatori inizialmente scarichi Nodo intermedio isolato I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Il vincolo C₁=C₂ riduce l’equivalente a C₂/2. Il valore 1 μF impone C₁=C₂=2 μF. La soluzione è unica e positiva, non un’intera famiglia di scale.

## u6-series-capacitor-voltage-01

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Sono assegnati C₁ = 2 μF e C₂ = 2 μF. Quanto vale tensione sul primo condensatore (V₁) in V?

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Il nodo interno neutro impone il medesimo modulo Q sulle armature dei due elementi. Poiché Q=12 C₁C₂/(C₁+C₂), la tensione sul primo è V₁=Q/C₁=12 C₂/(C₁+C₂). Con 2 e 2 μF vale 6 V: al numeratore compare la capacità dell’altro elemento.

## u6-series-capacitor-voltage-02

Prompt originale:

Nell’argomento «Ripartizione della tensione in serie» si considera tensione sul primo condensatore. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

V₁ è una differenza di potenziale e ha unità volt, V=J/C. Non è una carica né una capacità.

## u6-series-capacitor-voltage-03

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente V₁ nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La somma delle tensioni è 12 V e Q è comune: V₁/V₂=C₂/C₁. Eliminando V₂ si trova V₁=12 C₂/(C₁+C₂), con 0<V₁<12 V per capacità positive.

## u6-series-capacitor-voltage-04

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Si passa da C₁ = 2 μF a C₁ = 1 μF, mantenendo C₂ = 2 μF e le altre condizioni fisse. Che cosa accade a tensione sul primo condensatore?

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

C₁ dimezzata diventa 1 μF, C₂ resta 2 μF. La tensione sul primo è 12·2/3=8 V, invece di 6 V. Non si dimezza V₁: diminuire C₁ aumenta la sua quota della tensione totale.

## u6-series-capacitor-voltage-05

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

La misura di tensione sul primo condensatore è 6 V; si conosce C₂ = 2 μF. Determina prima capacità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Da V₁(C₁+C₂)=12 C₂ ricavo C₁=C₂(12−V₁)/V₁. Inserendo C₂=2 μF e V₁=6 V ottengo 2 μF; il rapporto fra tensioni è adimensionale.

## u6-series-capacitor-voltage-06

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

La misura di tensione sul primo condensatore è 6 V; si conosce C₁ = 2 μF. Determina seconda capacità nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Isolo l’altra capacità: C₂=C₁ V₁/(12−V₁). Con C₁=2 μF e V₁=6 V risulta 2 μF. Il denominatore richiede V₁<12 V e la positività richiede V₁>0.

## u6-series-capacitor-voltage-07

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Nello stato A: C₁ = 2 μF, C₂ = 2 μF. Nello stato B rimane C₁ = 2 μF, mentre C₂ = 4 μF. Calcola il rapporto V₁_B/V₁_A.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

C₂,B=4 μF e C₁=2 μF danno V₁,B=12·4/6=8 V. Il rapporto rispetto ai 6 V iniziali è 4/3.

## u6-series-capacitor-voltage-08

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Con C₁ = 2 μF e C₂ = 2 μF, una soluzione propone V₁_proposto = 12 V. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La proposta 12 V supera la soluzione 6 V di 6 V: proposta meno soluzione =+6 V. Non è il valore della seconda tensione richiesto per caso, ma uno scarto con ordine dichiarato.

## u6-series-capacitor-voltage-09

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Si misura V₁ e si conoscono le altre quantità della relazione V₁ = 12 V · C₂/(C₁+C₂). Quale formula isola C₁ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La prima capacità si ricava da C₁=C₂(E/V₁−1), E=12 V. Il dominio fisico è C₂>0 e 0<V₁<E; i bordi corrisponderebbero a elementi nulli o a limiti non finiti, esclusi.

## u6-series-capacitor-voltage-10

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Da uno stato A con grandezze C₁ e C₂ si passa a uno stato B in cui C₁_B = κ₁·C₁ e C₂_B = κ₂·C₂. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto V₁_B/V₁_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Sostituendo i fattori nelle due capacità, il rapporto di tensioni è κ₂(C₁+C₂)/(κ₁C₁+κ₂C₂). Una scalatura comune κ₁=κ₂ non cambia la divisione della tensione. Le cariche comuni entro una preparazione non sono necessariamente uguali fra preparazioni.

## u6-series-capacitor-voltage-11

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Nello stato iniziale A si hanno C₁ = 2 μF e C₂ = 2 μF. Nello stato B si hanno C₁ = 3 μF e C₂ = 1 μF. Qual è il rapporto V₁_B/V₁_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

In B con 3 e 1 μF, V₁=12·1/4=3 V. In A vale 6 V, perciò il rapporto B/A è 1/2. Il generatore rimane a 12 V, non la carica: Q passa da 12 a 9 μC.

## u6-series-capacitor-voltage-12

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Si registrano due letture con uguale peso statistico. La prima usa C₁ = 2 μF, C₂ = 2 μF; la seconda usa C₁ = 3 μF, C₂ = 1 μF. Qual è la media aritmetica delle due letture di tensione sul primo condensatore? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

La media di 6 e 3 V è 9/2 V. Le capacità medie 5/2 e 3/2 μF sommano 4 μF e danno anch’esse 9/2 V: qui il denominatore costante rende la dipendenza affine lungo questi dati. Non è costante la capacità equivalente, né la carica. Controesempio: (1,1) e (1,3) μF danno 6 e 9 V, media 15/2 V; gli ingressi medi (1,2) μF danno 8 V.

## u6-series-capacitor-voltage-13

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

La condizione iniziale è C₁ = 2 μF, C₂ = 2 μF. Si impone poi C₁ = 3 μF e si vuole che la grandezza d’uscita diventi 1/2 volte quella iniziale. Quale rapporto C₂_B/C₂_A è necessario?

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il rapporto 1/2 fissa V₁,B=3 V. Con C₁,B=3 μF: 3(3+C₂,B)=12 C₂,B, dunque C₂,B=1 μF. Rispetto a C₂,A=2 μF il fattore è 1/2.

## u6-series-capacitor-voltage-14

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Uno strumento misura V₁ con legge S_strum = a_cal·V₁, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento C₁ = 2 μF, C₂ = 2 μF, legge S_strum=18. In una nuova prova legge S_strum=9 e si conosce C₂ = 1 μF. Determina prima capacità nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

La lettura 18 a 6 V dà a=3 V⁻¹. D_B=9 indica V₁,B=3 V; con C₂,B=1 μF ricavo C₁,B=1·(12−3)/3=3 μF.

## u6-series-capacitor-voltage-15

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

Lo strumento obbedisce a S_strum = a_cal·V₁ + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: C₁ = 2 μF, C₂ = 2 μF, S_strum=13. Riferimento B: C₁ = 3 μF, C₂ = 1 μF, S_strum=7. Prova C: C₂ = 2 μF, S_strum=17. Trova prima capacità nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Le coppie 6 V→13 e 3 V→7 danno a=2 V⁻¹ e b=1. D_C=17 significa V₁,C=8 V. Con C₂,C=2 μF ottengo C₁,C=2(12−8)/8=1 μF.

## u6-series-capacitor-voltage-16

Prompt originale:

Due condensatori C₁ e C₂ inizialmente scarichi sono collegati in serie a 12 V con nodo intermedio isolato. Si cerca la tensione V₁ su C₁.

I valori numerici nelle unità dichiarate devono soddisfare C₁ = 1·C₂. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. Si misura inoltre V₁=6 V. Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?

Ipotesi e convenzioni: Generatore da 12 V Nodo intermedio isolato e inizialmente neutro I valori numerici rispettano: C₁ > 0 e C₂ > 0.

Derivazione primaria indipendente:

Con C₁=C₂ la tensione sul primo è sempre E/2=6 V, qualunque sia la comune capacità positiva finita. Restano infinite coppie continue della forma (c,c). Una misura aggiuntiva della carica fisserebbe c, ma qui non è assegnata.

## u6-capacitor-charge-sharing-01

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Sono assegnati V₀ = 6 V e C = 2 μF. Quanto vale tensione finale comune (V_f) in V?

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Il generatore è stato rimosso. La carica totale del nodo positivo è C₀V₀ e nello stato finale vale (C₀+C)V_f; quindi V_f=C₀V₀/(C₀+C). Con C₀=2 μF, V₀=6 V e C=2 μF risulta 3 V. Lo stato assestato presuppone il transitorio dissipativo; non conservo l’energia del solo campo.

## u6-capacitor-charge-sharing-02

Prompt originale:

Nell’argomento «Conservazione della carica» si considera tensione finale comune. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

La grandezza finale è una differenza di potenziale, dunque volt. Nella formula il rapporto di capacità è puro e moltiplica V₀.

## u6-capacitor-charge-sharing-03

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente V_f nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

Conservo la carica del conduttore formato unendo le armature concordi: C₀V₀=(C₀+C)V_f. Il secondo elemento inizialmente scarico contribuisce alla capacità finale ma non alla carica iniziale. Per C,C₀,V₀ positivi segue 0<V_f<V₀.

## u6-capacitor-charge-sharing-04

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Si passa da V₀ = 6 V a V₀ = 8 V, mantenendo C = 2 μF e le altre condizioni fisse. Che cosa accade a tensione finale comune?

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

Portare V₀ da 6 a 8 V, con entrambe le capacità 2 μF, cambia V_f da 3 a 4 V: la dipendenza da V₀ è lineare a capacità fissate.

## u6-capacitor-charge-sharing-05

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

La misura di tensione finale comune è 3 V; si conosce C = 2 μF. Determina tensione iniziale del primo condensatore nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Ricavo la tensione iniziale da V₀=V_f(C₀+C)/C₀. Con V_f=3 V, C=C₀=2 μF, ottengo 6 V. Non basta copiare la tensione dopo la redistribuzione.

## u6-capacitor-charge-sharing-06

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

La misura di tensione finale comune è 3 V; si conosce V₀ = 6 V. Determina capacità inizialmente scarica nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μF.

Derivazione primaria indipendente:

Ricavo C=C₀(V₀/V_f−1). Con C₀=2 μF, V₀=6 V e V_f=3 V trovo 2 μF. Per il secondo elemento positivo finito il dominio è 0<V_f<V₀; al bordo V_f=V₀ l’elemento aggiunto avrebbe C=0.

## u6-capacitor-charge-sharing-07

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Nello stato A: V₀ = 6 V, C = 2 μF. Nello stato B rimane V₀ = 6 V, mentre C = 1 μF. Calcola il rapporto V_f_B/V_f_A.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

Riducendo C da 2 a 1 μF, V_f=2·6/3=4 V. Il rapporto rispetto ai 3 V iniziali è 4/3: minore capacità totale a carica iniziale fissata produce maggiore tensione finale.

## u6-capacitor-charge-sharing-08

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Con V₀ = 6 V e C = 2 μF, una soluzione propone V_f_proposto = 6 V. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

La proposta 6 V meno la soluzione 3 V dà +3 V. Il segno dipende dall’ordine assegnato, non da una convenzione sulla carica delle armature.

## u6-capacitor-charge-sharing-09

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Si misura V_f e si conoscono le altre quantità della relazione V_f = C₀V₀/(C₀+C), con C₀ = 2 μF. Quale formula isola V₀ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

L’inversa per V₀ è V₀=V_f(1+C/C₀). Il fattore è maggiore di uno e adimensionale; la tensione iniziale deve superare quella finale nel modello con il secondo condensatore inizialmente scarico.

## u6-capacitor-charge-sharing-10

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Da uno stato A con grandezze V₀ e C si passa a uno stato B in cui V₀_B = κ₁·V₀ e C_B = κ₂·C. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto V_f_B/V_f_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

C₀ rimane fissata. Se V₀,B=κ₁V₀,A e C_B=κ₂C_A, il rapporto V_f,B/V_f,A è κ₁(C₀+C_A)/(C₀+κ₂C_A). Non si scala anche C₀ senza che il testo lo dica.

## u6-capacitor-charge-sharing-11

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Nello stato iniziale A si hanno V₀ = 6 V e C = 2 μF. Nello stato B si hanno V₀ = 12 V e C = 4 μF. Qual è il rapporto V_f_B/V_f_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

La prova A dà 3 V. In B V₀=12 V e C=4 μF: V_f=2·12/6=4 V. Il rapporto di uscite è 4/3.

## u6-capacitor-charge-sharing-12

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Si registrano due letture con uguale peso statistico. La prima usa V₀ = 6 V, C = 2 μF; la seconda usa V₀ = 12 V, C = 4 μF. Qual è la media aritmetica delle due letture di tensione finale comune? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

La media delle tensioni finali è (3+4)/2=7/2 V. Gli ingressi medi V₀=9 V e C=3 μF darebbero 18/5 V; la differenza media delle uscite meno uscita agli ingressi medi è −1/10 V. La legge contiene un denominatore variabile.

## u6-capacitor-charge-sharing-13

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

La condizione iniziale è V₀ = 6 V, C = 2 μF. Si impone poi V₀ = 12 V e si vuole che la grandezza d’uscita diventi 4/3 volte quella iniziale. Quale rapporto C_B/C_A è necessario?

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il rapporto 4/3 applicato ai 3 V di A impone V_f,B=4 V. Con V₀,B=12 V, C_B=2(12/4−1)=4 μF. Rispetto ai 2 μF di A, il fattore è 2.

## u6-capacitor-charge-sharing-14

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Uno strumento misura V_f con legge S_strum = a_cal·V_f, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento V₀ = 6 V, C = 2 μF, legge S_strum=9. In una nuova prova legge S_strum=12 e si conosce C = 4 μF. Determina tensione iniziale del primo condensatore nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

La taratura D=aV_f ha a=9/(3 V)=3 V⁻¹. D_B=12 significa V_f,B=4 V. Con C_B=4 μF, V₀,B=4(2+4)/2=12 V.

## u6-capacitor-charge-sharing-15

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

Lo strumento obbedisce a S_strum = a_cal·V_f + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: V₀ = 6 V, C = 2 μF, S_strum=7. Riferimento B: V₀ = 12 V, C = 4 μF, S_strum=9. Prova C: C = 3 μF, S_strum=13. Trova tensione iniziale del primo condensatore nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

I riferimenti 3 V→7 e 4 V→9 fissano a=2 V⁻¹ e b=1. D_C=13 significa V_f,C=6 V. Con C_C=3 μF si richiede V₀,C=6(2+3)/2=15 V, superiore a quella finale.

## u6-capacitor-charge-sharing-16

Prompt originale:

Un condensatore C₀ = 2 μF è carico alla tensione V₀. Viene scollegato dal generatore e collegato con polarità concordi in parallelo a un condensatore inizialmente scarico C. Dopo il transitorio si cerca la tensione comune.

I valori numerici nelle unità dichiarate devono soddisfare V₀ = 3·C. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è V_f=3 V. Determina capacità inizialmente scarica nel dominio fisico positivo.

Ipotesi e convenzioni: Sistema scollegato dal generatore C₀ = 2 μF Secondo condensatore scarico Tensione finale raggiunta dopo il transitorio I valori numerici rispettano: V₀ > 0 e C > 0.

Derivazione primaria indipendente:

Pongo c=C/(1 μF)>0. Il vincolo V₀=(3 V/μF)C dà V₀/(1 V)=3c, quindi V_f/(1 V)=6c/(2+c). Il dato 3 V impone 6c=3(2+c), da cui c=2 e V₀=6 V. Una sola coppia positiva, senza radici spurie.

## u6-capacitor-sharing-energy-loss-01

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Sono assegnati V₁ = 4 V e V₂ = 2 V. Quanto vale energia elettrostatica convertita (ΔU_persa) in μJ?

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è μJ.

Derivazione primaria indipendente:

I condensatori hanno identica capacità C e tensioni concordi V₁>V₂>0. La carica totale impone V_f=(V₁+V₂)/2. Sottraendo U_f=C(V₁+V₂)²/4 da U_i=C(V₁²+V₂²)/2 ottengo ΔU=C(V₁−V₂)²/4. Con C=1 μF, 4 e 2 V, ΔU=1 μJ; U_i=10 μJ e U_f=9 μJ. La diminuzione del campo è trasferita in altre forme, non energia totale distrutta.

## u6-capacitor-sharing-energy-loss-02

Prompt originale:

Nell’argomento «Energia nella redistribuzione della carica» si considera energia elettrostatica convertita. Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.

Ipotesi e convenzioni: Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.

Derivazione primaria indipendente:

Una diminuzione di energia si misura in joule. F·V²=(C/V)V²=C·V=J; usando μF e V il numero è in μJ.

## u6-capacitor-sharing-energy-loss-03

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Usando i simboli definiti nel testo, quale espressione fornisce correttamente ΔU_persa nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

La legge è ΔU=C(V₁−V₂)²/4. Deriva insieme dalla conservazione della carica e dalla differenza fra energie iniziale e finale, non da conservazione dell’energia elettrostatica. Il generatore non alimenta la redistribuzione.

## u6-capacitor-sharing-energy-loss-04

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Si passa da V₁ = 4 V a V₁ = 6 V, mantenendo V₂ = 2 V e le altre condizioni fisse. Che cosa accade a energia elettrostatica convertita?

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

Portare V₁ da 4 a 6 V con V₂=2 V raddoppia il divario da 2 a 4 V. La diminuzione di energia cresce da 1 a 4 μJ perché dipende dal quadrato del divario, non dal solo valore di V₁.

## u6-capacitor-sharing-energy-loss-05

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

La misura di energia elettrostatica convertita è 1 μJ; si conosce V₂ = 2 V. Determina tensione iniziale maggiore nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Da (V₁−V₂)²=4ΔU/C scelgo V₁−V₂=+2√(ΔU/C), imposto dall’ordine V₁>V₂. Quindi V₁=V₂+2√(ΔU/C)=2+2=4 V. Il ramo negativo darebbe 0 V e contraddirebbe le ipotesi.

## u6-capacitor-sharing-energy-loss-06

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

La misura di energia elettrostatica convertita è 1 μJ; si conosce V₁ = 4 V. Determina tensione iniziale minore nelle unità indicate. Si considera il ramo fisico positivo coerente con le ipotesi.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

Per ricavare V₂ scelgo V₂=V₁−2√(ΔU/C)=4−2=2 V. Occorre 0<ΔU<C V₁²/4 affinché 0<V₂<V₁; al bordo superiore V₂ sarebbe zero, escluso. Il segno più imporrebbe V₂>V₁.

## u6-capacitor-sharing-energy-loss-07

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Nello stato A: V₁ = 4 V, V₂ = 2 V. Nello stato B rimane V₁ = 4 V, mentre V₂ = 1 V. Calcola il rapporto ΔU_persa_B/ΔU_persa_A.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

Con V₁=4 V e V₂,B=1 V, il divario è 3 V e ΔU_B=9/4 μJ. Dividendo per ΔU_A=1 μJ si ottiene 9/4.

## u6-capacitor-sharing-energy-loss-08

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Con V₁ = 4 V e V₂ = 2 V, una soluzione propone ΔU_persa_proposto = 2 μJ. Calcola lo scarto con segno «valore proposto meno valore corretto».

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

La proposta 2 μJ meno il risultato 1 μJ produce +1 μJ. Si conserva il segno dello scarto secondo la definizione del quesito.

## u6-capacitor-sharing-energy-loss-09

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Si misura ΔU_persa e si conoscono le altre quantità della relazione ΔU = C(V₁−V₂)²/4, con C = 1 μF. Quale formula isola V₁ nel ramo fisico dichiarato? Tutte le grandezze indicate come positive vanno mantenute tali.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

L’inversa è V₁=V₂+2√(ΔU/C). La radice ha unità volt perché ΔU/C ha unità V²; il ramo positivo del divario è scelto dalla condizione V₁>V₂>0, non solo dalla possibilità algebrica.

## u6-capacitor-sharing-energy-loss-10

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Da uno stato A con grandezze V₁ e V₂ si passa a uno stato B in cui V₁_B = κ₁·V₁ e V₂_B = κ₂·V₂. I fattori κ₁ e κ₂ sono positivi e i due stati rispettano entrambi il dominio del modello. Quale espressione dà il rapporto ΔU_persa_B/ΔU_persa_A? Nelle risposte, i simboli senza pedice indicano lo stato A.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

Il rapporto vale [(κ₁V₁−κ₂V₂)/(V₁−V₂)]². I due confronti devono rispettare V₁>V₂>0 e κ₁V₁>κ₂V₂>0: fattori singolarmente positivi non garantiscono l’ordine. Il denominatore non è nullo; l’uguaglianza delle tensioni è fuori dominio del rapporto assegnato.

## u6-capacitor-sharing-energy-loss-11

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Nello stato iniziale A si hanno V₁ = 4 V e V₂ = 2 V. Nello stato B si hanno V₁ = 8 V e V₂ = 4 V. Qual è il rapporto ΔU_persa_B/ΔU_persa_A? Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

In A il divario è 2 V e ΔU_A=1 μJ; in B 8−4=4 V e ΔU_B=4 μJ. Il rapporto è 4. È raddoppiato il divario, non soltanto una capacità.

## u6-capacitor-sharing-energy-loss-12

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Si registrano due letture con uguale peso statistico. La prima usa V₁ = 4 V, V₂ = 2 V; la seconda usa V₁ = 8 V, V₂ = 4 V. Qual è la media aritmetica delle due letture di energia elettrostatica convertita? Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

La media delle uscite è (1+4)/2=5/2 μJ. Le tensioni medie 6 e 3 V danno invece 9/4 μJ. La differenza è 1/4 μJ: il quadrato rende la legge non lineare.

## u6-capacitor-sharing-energy-loss-13

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

La condizione iniziale è V₁ = 4 V, V₂ = 2 V. Si impone poi V₁ = 8 V e si vuole che la grandezza d’uscita diventi 4 volte quella iniziale. Quale rapporto V₂_B/V₂_A è necessario?

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è 1.

Derivazione primaria indipendente:

Il rapporto 4 fissa ΔU_B=4 μJ, quindi il divario positivo è 2√4=4 V. Con V₁,B=8 V ottengo V₂,B=4 V e il fattore rispetto ai 2 V di A è 2. Il ramo opposto violerebbe l’ordine.

## u6-capacitor-sharing-energy-loss-14

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Uno strumento misura ΔU_persa con legge S_strum = a_cal·ΔU_persa, dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. Nel riferimento V₁ = 4 V, V₂ = 2 V, legge S_strum=3. In una nuova prova legge S_strum=12 e si conosce V₂ = 4 V. Determina tensione iniziale maggiore nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.
Inserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è V.

Derivazione primaria indipendente:

La taratura proporzionale è a=3 μJ⁻¹. D_B=12 indica ΔU_B=4 μJ; il divario è 4 V. Con V₂,B=4 V risulta V₁,B=8 V, unica soluzione ordinata.

## u6-capacitor-sharing-energy-loss-15

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

Lo strumento obbedisce a S_strum = a_cal·ΔU_persa + b_cal, con a_cal e b_cal ignoti ma costanti. Riferimento A: V₁ = 4 V, V₂ = 2 V, S_strum=3. Riferimento B: V₁ = 8 V, V₂ = 4 V, S_strum=9. Prova C: V₂ = 1 V, S_strum=3/2. Trova tensione iniziale maggiore nella prova C. Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

Dai riferimenti 1 μJ→3 e 4 μJ→9 si trova a=2 μJ⁻¹ e b=1. D_C=3/2 dà ΔU_C=(3/2−1)/2=1/4 μJ. Il divario è 2√(1/4)=1 V e V₂,C=1 V implica V₁,C=2 V. Tutti i passaggi sono esatti e non richiedono approssimare una radice.

## u6-capacitor-sharing-energy-loss-16

Prompt originale:

Due condensatori uguali da 1 μF hanno tensioni iniziali positive V₁ > V₂. Si collegano in parallelo con polarità concordi, isolati da generatori. Si cerca la diminuzione dell’energia elettrostatica in μJ.

I valori numerici nelle unità dichiarate devono soddisfare V₁ = 2·V₂. Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. L’uscita misurata è ΔU_persa=1 μJ. Determina tensione iniziale minore nel dominio fisico positivo.

Ipotesi e convenzioni: Due capacità identiche da 1 μF Sistema isolato dai generatori V₁ > V₂ > 0 I valori numerici rispettano: V₁ > V₂ e V₂ > 0.

Derivazione primaria indipendente:

Con V₁=2V₂, il divario è V₂ e ΔU=C V₂²/4. Il dato 1 μJ con C=1 μF dà V₂²=4 V². Scelgo V₂=2 V e V₁=4 V perché entrambe devono essere positive e ordinate. La radice negativa non è un’altra preparazione ammessa.
