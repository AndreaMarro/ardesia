# Sei letture: calore, calorimetria e cambiamenti di fase

Autore AI `review_corpus_increment`, distinto dal futuro verificatore. Fonte Cric `5d1dc8dc7b601aef959d10d564c75462be74708d`; consumer osservato `b9994b9116e87478905191d85cca8037d17ae4bd`, runtime `7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6`. Esposizione precedente: l’autore aveva letto le attività C3 originali e i consumer nei precedenti inventari parziali; questa è **autoria**, non revisione indipendente. Nessuna approvazione umana, UI o credito attività.

Le nuove edizioni sono v2/baseVersion1 in un lotto astra/1, senza nuovi asset. Mantengono ID, fonti, controlli, riferimenti fisici, formule del banco e tutti i dodici compiti effettivamente compilati. Non aggiungono `assessmentSelection`: rimane l’algoritmo originale. Le fonti e le edizioni live non sono modificate. L03-02 è escluso e rimane intatto.

I risultati esatti sono riferiti ai dati e alle costanti di lavoro assegnate: un valore di R o di calore latente arrotondato non è dichiarato una costante fisica esatta. Per le differenze termiche le ampiezze in kelvin e in gradi Celsius coincidono; la media delle letture Celsius nella calorimetria è coerente perché i pesi delle masse sommano a uno.

## SIM-C3-L03-01 · Calore e scambio di energia

Sorgente v1 SHA-256 `736da8e3b6cea5028e6a9cda6ac168ae960956a455f431556aa12fe70867265a`. Candidata v2/base1 `639aec5e95e02bdb86e78d7864382161b8c358704a7bc6892e768e39c19e7b24`.

| Input esatto | Unità ingresso | Risultato esatto | Unità risultato | Numero da inserire | Errore del numero |
|---|---|---|---|---|---|
| 8 | K | 400 | J | 400 | 0 |
| 6 | K | 300 | J | 300 | 0 |

Considera il campione come un unico sistema con capacità termica C = 50 J/K, costante nell’intervallo studiato. Il riscaldamento non cambia la fase del materiale. Trascuriamo dispersioni e lavoro meccanico: l’energia trasferita come calore aumenta l’energia interna del campione.

\(Q=C\,\Delta T\)

Il controllo assegna un aumento di temperatura, non la temperatura assoluta. Per ogni kelvin aggiunto occorrono 50 joule. Un aumento di 8 K richiede otto gruppi da 50: fai 5 per 8 e aggiungi lo zero, ottenendo 400 J.

\(Q(8\,\mathrm{K})=400\,\mathrm{J}\)

Il secondo compito assegna 6 K: 50 per 6 dà 300 J. Puoi controllare anche per differenza: passando da 8 a 6 K togli due gruppi da 50 J, quindi 100 J. Le unità J/K per K restituiscono joule.

\(Q(6\,\mathrm{K})=300\,\mathrm{J}\)

\(\Delta T=\frac{Q}{C}\)

Per l’inversa dividi l’energia per 50 J/K: 300 J danno 6 K. La capacità termica riguarda tutto il campione; non va moltiplicata di nuovo per una massa. A variazione nulla il calore di questo modello è zero. La salita del termometro e il colore aiutano a confrontare gli stati; usa le letture per i valori numerici.

## SIM-C3-L03-03 · Capacità termiche dei gas ideali

Sorgente v1 SHA-256 `d2f0fec12e9334a74da3bdbaaeb4d9a93c7a338952d5e66423d55ba51ae87c4d`. Candidata v2/base1 `b9f4aa6dcd873f95bc1b7484aab03e95dffee9777818e4b5f2ff25cd6c8c49ca`.

| Input esatto | Unità ingresso | Risultato esatto | Unità risultato | Numero da inserire | Errore del numero |
|---|---|---|---|---|---|
| 10 | K | 4157/50 | J | 83.14 | 0 |
| 11 | K | 45727/500 | J | 91.454 | 0 |

Confronta due prove sulla stessa mole di gas ideale, ripartendo dallo stesso stato. In una il volume è bloccato; nell’altra la pressione esterna e quella del gas restano uguali e costanti durante un’espansione quasi statica. Trascuriamo altri lavori. Per il gas ideale l’energia interna dipende solo dalla temperatura, quindi lo stesso aumento di temperatura produce lo stesso aumento di energia interna nelle due prove.

\(Q_p=nC_p\Delta T\)

\(Q_v=nC_v\Delta T\)

\(C_p-C_v=R\)

Le capacità Cp e Cv sono molari e sono assunte costanti nell’intervallo considerato. La differenza fra i calori è il lavoro di espansione della prova a pressione costante. Qui n = 1 mol e il valore di lavoro assegnato per R è 8,314 J/(mol·K), una costante arrotondata. I conti seguenti sono esatti rispetto a questo dato del modello.

\(Q_p-Q_v=nR\Delta T\)

Per 10 K, moltiplicare 8,314 per 10 sposta la virgola di un posto: servono 83,14 J in più. Per 11 K aggiungi una volta 8,314 al risultato precedente: 83,140 + 8,314 = 91,454 J. Somma le colonne mantenendo tre cifre decimali.

\(\Delta Q(10\,\mathrm{K})=83{,}14\,\mathrm{J}\)

\(\Delta Q(11\,\mathrm{K})=91{,}454\,\mathrm{J}\)

Inserisci 83,14 e 91,454 nei due compiti. La lettura abbreviata del banco può mostrare 91,45 J; non cambia il conto con i dati assegnati. Le unità mol e K si cancellano nel prodotto nRΔT. Il numero calcolato è il calore in più a pressione costante, non uno dei due calori totali né una capacità termica.

\(\Delta T=\frac{\Delta Q}{nR}\)

L’inversa restituisce 10 K da 83,14 J e 11 K da 91,454 J. Il pistone richiama la possibilità di espansione nella prova a pressione costante; le sue dimensioni grafiche non forniscono da sole Cp o Cv. Per separare i due calori totali occorrerebbe conoscere anche una delle due capacità molari.

## SIM-C3-L03-04 · Calorimetria

Sorgente v1 SHA-256 `9253bd7c27605ca7b2cfc465b309727e59818ba99532dc4a2b1d5c631a5b7a3a`. Candidata v2/base1 `41eaa8dab7c6cfb407f858e091d882b66805a5e719fb88590383b5993058eb06`.

| Input esatto | Unità ingresso | Risultato esatto | Unità risultato | Numero da inserire | Errore del numero |
|---|---|---|---|---|---|
| 200 | g | 50 | °C | 50 | 0 |
| 175 | g | 48 | °C | 48 | 0 |

Mescola acqua a 80 °C con 200 g di acqua a 20 °C. Il recipiente è isolato e ha capacità termica trascurabile; non c’è evaporazione e il calore specifico dell’acqua è assunto uguale e costante nei due campioni. All’equilibrio il calore perso dall’acqua calda uguaglia quello acquistato dall’acqua fredda.

\(mc(T_h-T_f)=m_c c(T_f-T_c)\)

Nelle differenze di temperatura il grado Celsius ha la stessa ampiezza del kelvin. Elimina il fattore comune c e raccogli i termini con Tf. Nella formula numerica seguente m è il numero di grammi caldi e Tf è la lettura in °C. La media è pesata con le masse: una semplice media fra 80 e 20 è valida soltanto quando le masse sono uguali.

\(T_f=\frac{80m+4000}{m+200}\)

Nel primo compito m = 200 g: le masse sono uguali e la media fra 80 e 20 è 50 °C. Anche il bilancio torna: entrambi i campioni cambiano temperatura di 30 K, con versi opposti.

\(T_f(200\,\mathrm g)=50\,{}^\circ\mathrm C\)

Nel secondo compito m = 175 g. Fai 80 per 175: 8 per 175 è 1400, quindi il prodotto è 14000. Aggiungi 20 per 200, cioè 4000. Dividi 18000 per 375: 375 per 48 è 375 per (50 meno 2), cioè 18750 meno 750 = 18000. Il risultato è esattamente 48 °C.

\(T_f(175\,\mathrm g)=48\,{}^\circ\mathrm C\)

A 48 °C l’acqua calda perde 32 K e quella fredda ne guadagna 28: 175 per 32 e 200 per 28 danno entrambi 5600 g·K. Il risultato sta fra 20 e 80 °C e, avendo più acqua fredda, è sotto 50 °C. La scatola e il colore del calorimetro sono una rappresentazione schematica: il bilancio usa masse e letture.

\(m=200\,\frac{T_f-20}{80-T_f}\)

Per risalire al numero di grammi caldi dalla lettura finale in °C usa questa inversa numerica nel dominio 20 °C < Tf < 80 °C. Con 48 °C il rapporto è 28/32 = 7/8: sette ottavi di 200 g sono 175 g. Non usare l’inversa a 80 °C, dove il denominatore si annulla.

## SIM-C3-L04-01 · Fusione

Sorgente v1 SHA-256 `b8617a4b32bb39a3e5efde0da37c56cf805bef4d92eecde607fe7e3968df10c9`. Candidata v2/base1 `a2667583c98036f2adad2e25b78659628bad0a0b269b191b1112e080c50f6ba0`.

| Input esatto | Unità ingresso | Risultato esatto | Unità risultato | Numero da inserire | Errore del numero |
|---|---|---|---|---|---|
| 167/10 | kJ | 50 | g | 50 | 0 |
| 1837/100 | kJ | 55 | g | 55 | 0 |

Il banco parte da 100 g di ghiaccio puro già alla temperatura di fusione, circa 0 °C alla pressione atmosferica. Assumiamo pressione costante, dispersioni trascurabili e un calore latente di lavoro Lf = 334 J/g. Finché coesistono ghiaccio e acqua, il calore fornito cambia la massa delle fasi e non la temperatura.

\(Q=m_f L_f\)

\(m_f=\frac{Q}{L_f}\)

Il controllo dell’energia usa kilojoule, mentre Lf è in joule per grammo: moltiplica prima i kJ per 1000. Il primo compito assegna 16,7 kJ, cioè 16700 J. Poiché 334 per 5 è 1670, 334 per 50 è 16700: sono fusi 50 g.

\(m_f(16{,}7\,\mathrm{kJ})=50\,\mathrm g\)

Il secondo compito mostra 18,37 kJ, cioè 18370 J. Dopo i primi 50 g restano 18370 meno 16700 = 1670 J, sufficienti per altri 5 g. In totale sono 55 g. Controlla moltiplicando 334 per 55: 16700 + 1670 = 18370 J.

\(m_f(18{,}37\,\mathrm{kJ})=55\,\mathrm g\)

Inserisci 50 e 55, nelle unità g indicate dai compiti. Il limite del banco è 33,4 kJ, pari a 33400 J: fonde tutti i 100 g. Una massa fusa non può superare quella iniziale. La relazione usata qui non descrive il riscaldamento dell’acqua dopo la completa fusione.

Il riscaldatore del banco fornisce 1,67 kJ ogni secondo: le due energie corrispondono rispettivamente a 10 e 11 s. Durante l’animazione la massa già fusa cresce fino al valore finale; il compito chiede la massa al termine dell’energia assegnata. Il tempo zero non va confuso con la fine della prova. Le quantità delle due fasi nel disegno sono schematiche.

## SIM-C3-L04-02 · Evaporazione e condensazione

Sorgente v1 SHA-256 `54420428cc7e93d78fdaed52ee0a282cf50ffccd0808d8bcdaca65af4803c42c`. Candidata v2/base1 `a7268eadc74f1819f3bd2798d03b1209207492502f9491fabb30c0f8f414c466`.

| Input esatto | Unità ingresso | Risultato esatto | Unità risultato | Numero da inserire | Errore del numero |
|---|---|---|---|---|---|
| 3 | g | 339/50 | kJ | 6.78 | 0 |
| 0 | g | 0 | kJ | 0 | 0 |

Fissa il sistema nell’acqua che cambia fase. Alla temperatura di coesistenza e alla pressione scelta, evaporare richiede calore entrante, condensare cede calore all’esterno. Nel banco la massa trasformata ha segno: positiva verso il vapore, negativa verso il liquido. Il calore Q è positivo quando l’acqua lo assorbe.

\(Q=m_s L_v\)

Il valore di lavoro assegnato è Lv = 2,26 kJ/g, approssimazione del calore latente dell’acqua vicino all’ebollizione atmosferica. Nella moltiplicazione i grammi si cancellano. Per il primo compito, +3 g, fai 2 per 3 = 6 e 0,26 per 3 = 0,78; la somma dà +6,78 kJ.

\(Q(+3\,\mathrm g)=+6{,}78\,\mathrm{kJ}\)

Il secondo compito assegna massa trasformata zero: nessuna acqua cambia fase e il calore latente scambiato è 0 kJ. Questa conclusione riguarda il cambio di fase del modello; non afferma che qualunque processo con massa trasformata nulla abbia calore nullo.

\(Q(0\,\mathrm g)=0\,\mathrm{kJ}\)

Per interpretare il riferimento negativo, −2 g corrispondono a condensazione e Q = −4,52 kJ: l’acqua cede 4,52 kJ all’ambiente. Scrivere +4,52 darebbe il modulo, perdendo il verso dello scambio. La massa fisica totale rimane positiva; il segno riguarda soltanto la quantità trasformata nel verso convenzionale.

\(m_s=\frac{Q}{L_v}\)

Nell’inversa −4,52 kJ divisi per 2,26 kJ/g danno −2 g. La rappresentazione delle particelle aiuta a distinguere le fasi; usa il segno del controllo e il bilancio per stabilire se l’acqua assorbe o cede energia.

## SIM-C3-L04-03 · Calore latente e bilanci a tratti

Sorgente v1 SHA-256 `8965a69aa5ca22a661dab38f5b1226b398231f38043ba27ae62bf22fc9a3128a`. Candidata v2/base1 `be490f8a7639097f1c52cf5645274c05d33cb5e6d2cef879ccec762959f836d6`.

| Input esatto | Unità ingresso | Risultato esatto | Unità risultato | Numero da inserire | Errore del numero |
|---|---|---|---|---|---|
| 19 | kJ | 50 | g | 50 | 0 |
| 28 | kJ | 1300/17 | g | 76.47 | 1/1700 |

Considera 100 g di ghiaccio inizialmente a −10 °C, a pressione atmosferica, con dispersioni trascurabili. I valori di lavoro del modello sono c del ghiaccio = 2 J/(g·K) e calore latente L = 340 J/g, entrambi arrotondati. Prima occorre portare il ghiaccio a 0 °C; solo l’energia successiva può fonderlo.

\(Q_0=mc_i\Delta T\)

\(Q_0=2000\,\mathrm J=2\,\mathrm{kJ}\)

Il primo tratto usa 100 per 2 per 10 = 2000 J. Se l’energia totale è al più 2 kJ, la massa fusa resta zero. Durante la fusione sottrai prima questi 2 kJ, converti l’energia rimanente in joule e dividi per 340 J/g.

\(m_f=\frac{1000(Q-2)}{340}\,\mathrm g\)

In questa formula Q indica il valore numerico dell’energia in kJ e la formula centrale vale soltanto per 2 < Q < 36. Per fondere tutti i 100 g occorrono altri 100 per 340 = 34000 J = 34 kJ, quindi la soglia totale è 36 kJ. Oltre tale soglia restano fusi 100 g: l’ulteriore energia scalda l’acqua, senza creare altra massa.

\(m_f=0\quad(Q\leq2)\)

\(m_f=100\,\mathrm g\quad(Q\geq36)\)

Nel primo compito Q = 19 kJ: tolti 2 restano 17 kJ, cioè 17000 J. Dato che 340 per 50 = 17000, la massa fusa è 50 g. Nel secondo Q = 28 kJ: restano 26 kJ e 26000/340 = 1300/17 g.

\(m_f(19\,\mathrm{kJ})=50\,\mathrm g\)

\(m_f(28\,\mathrm{kJ})=\frac{1300}{17}\,\mathrm g\)

Per scrivere un numero decimale senza calcolatrice fai la divisione: 17 per 76 = 1292, resta 8. Porta uno zero: 80 diviso 17 dà 4, resta 12. Porta un altro zero: 120 diviso 17 dà 7, resta 1. Quindi 76,47 è il risultato troncato ai centesimi; la cifra successiva è 0. L’errore è esattamente 1/1700 g, meno di un millesimo di grammo.

\(\frac{1300}{17}\,\mathrm g\approx76{,}47\,\mathrm g\)

Inserisci 50 e 76,47 nei due ingressi numerici, dove l’unità g è già indicata. Il banco abbrevia la seconda lettura a 76,47 g. La frazione resta il risultato esatto rispetto ai dati, ma il campo richiede un numero e non l’espressione 1300/17.

\(Q=2+\frac{340m_f}{1000}\)

Per risalire all’energia nella sola coesistenza, inserisci in questa inversa la massa in grammi e ottieni Q in kJ. Una massa fusa di 0 o 100 g non determina invece un’unica energia: identifica un intero tratto del grafico. Il riscaldatore fornisce 2 kJ/s: inizia a fondere a 1 s e completa la fusione a 18 s. Le energie assegnate finiscono a 9,5 e 14 s. Durante l’animazione distingui la massa già fusa da quella finale richiesta dal compito.

## Incoerenze numeriche e limiti conservati

Il producer usa IEEE-754: in L03-03 a 11 K conserva `91.45400000000001`, mentre il conto esatto sui dati assegnati dà 91,454 J; L04-01 seleziona internamente `18.369999999999997` kJ, mostrato 18,37, e produce `54.999999999999986` g; L04-02 a 3 g conserva `6.779999999999999` kJ. La bozza insegna i conti decimali esatti sui dati dichiarati e ne controlla l’accettazione nel vero schema Number. Non riscrive né arrotonda la misura interna. Le coppie raw complete sono in `actual-source-tasks.json`.

Il risultato `1300/17` non è inseribile come espressione perché il consumer usa Number: il campo riceve 76,47. Il procedimento completo è nello svolgimento. L’errore esatto 1/1700 g è molto inferiore alla tolleranza installata (circa 0,38235 g); non è stata ampliata alcuna tolleranza. I compiti non richiedono di valutare funzioni trascendenti o radicali.

**L04-03: negativo visivo storico conservato.** Il file `L04-03-prior-visual-findings-retained.json` mantiene i contesti originali di frecce termiche non nulle scartate dal fallback nelle prime fasi del clock (ad esempio x=1 kJ, t=0,125 s, segmento di circa 0,003935 world). Il consumer b999 contiene un dettaglio ×128, ma qui non viene eseguito alcun nuovo browser e non si dichiara risolto il rilievo. I nuovi blocchi editoriali non cambiano la geometria. I risultati tecnici di import, sintassi e parità non conferiscono accettazione visiva.

## Prova autoriale eseguita e successiva peer

Doppia assembly byte-identica; 12 ingressi numerici; 33 formule KaTeX parse; 142 valori del controllo; 294 scene (inclusi zero, metà e fine clock dove presente). Confronto esatto con gli stessi record originali nel medesimo Node: misure, letture, grafici, elementi e compiti invariati. Questa è una prova tecnica autoriale e non un oracolo indipendente o una nuova prova browser.

Import canonico in SQLite effimero: 6 salvati, poi 0 salvati/6 invariati; 991 payload pubblicati, 991 versioni storiche e sei live heads conservati. Nessun nuovo tentativo studente, pubblicazione o approvazione viene rivendicato. UI prodotto **NOT_RUN**. La peer distinta deve risolvere i dodici compiti, rivedere tutte le ipotesi e le inverse, valutare manualità e testo, poi i consumer reali nelle larghezze e nei regimi previsti. Lo stato attività resta non accettato da questa consegna.

Prima del freeze è stata esplicitata l’ipotesi Cp/Cv costanti per le due formule Q=nCΔT. La prima assembly/import e i byte precedenti sono conservati separatamente in `before-capacity-domain-clarification`; la nuova doppia assembly e il nuovo import 6→0/6 riguardano i byte finali. Nessuna legge o compito è cambiato.
