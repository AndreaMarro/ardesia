# cric-c3-l09 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C3.json, SHA 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0. Tutti i cinquanta prompt B letti individualmente con sola allowlist id/prompt prima di scrivere candidate; lezioni reali C3-L06–L10 e loro fondazioni C3-L01–L05 lette integralmente. Nessuna opzione, risposta, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche congelate in Git prima dell’autoria: B sui cinquanta A001–050 in 030d4658b17ea6f6fd43be03cb59b21e91030eb0, primaria SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80, modello SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, Git-inputs f7d68ecf. A sui cinquanta B051–100 in 93ea8d3c1ba874bfbf74d4734ce136b319a9ca72, primaria SHA 13a65d52b70957d49eec44e4e1b9ce6d4e99c7cb3cc5d1e1418f9f4967aade8f; modello 92090ea0d2011c79dda93181542f7a09746396ff, recupero b374cab44db567ea0ffc1a510bae874945a5fdb7. Di questi ultimi file ricevuti soltanto hash/percorso: mai aperti durante l’autoria.

ID, corso, competenza, famiglia, difficoltà, prerequisiti, ordine e flag exam originali sono preservati individualmente. Ogni nuova versione ha baseVersion uguale alla versione originale e version aumentata di uno. Non sono varianti artificiali di una sola famiglia. L’assembler unico e l’importatore editoriale canonico restano invariati; dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}, non attribuita a questa autoria.

Due assembly vere identiche e import canonico col budget originale di 60 s: dieci DRAFT salvati, poi zero salvati e dieci invariati in SQLite temporaneo. I 991 pubblicati e tutti i live head storici restano invariati. Operazioni sotto mutex e guardia almeno 2 GiB. PNG nativo completo e XML finali realmente aperti e letti: solo asset, nessuna UI prodotto. Eventuali edizioni iniziali e ricevute sono conservate, non riattribuite. SCI propria, UI prodotto e approvazione umana NOT_RUN; pubblicazione DRAFT.

Parametrizzazione manuale dichiarata: C3-Q081 usa 176,85 °C e 26,85 °C al posto dei precedenti 177 °C e 27 °C. La competenza resta conversione delle due letture Celsius e limite di Carnot; i nuovi valori danno temperature Kelvin esatte con rapporto semplice. L’edizione originale rimane al pin storico e la versione individuale avanza soltanto nel pacchetto DRAFT. Nessuna approssimazione implicita di 273,15.

## C3-Q081 — Il limite usa temperature assolute

Versione 2, base 1; famiglia un-limite-fra-due-sorgenti; difficoltà 2.

Modello e procedura manuale: Prima converto entrambi i valori usando l’offset 273,15: le temperature assolute sono 450 K e 300 K. Il limite reversibile è η_C=1−T_c/T_h=1−2/3=1/3. Per esprimerlo in percentuale moltiplico per 100 e lascio la frazione esatta 100/3 %, senza trasformarla in un decimale periodico approssimato.

Leggi e passaggi: T_h=450\,\mathrm K;  T_c=300\,\mathrm K;  \eta_C=1-\frac{T_c}{T_h};  \eta_C=\frac13;  100\eta_C=\frac{100}{3}

Risposta d’autore proposta: 100/3 %.

Distrattori e controlli: 50 % dividerebbe il salto di 150 K per la temperatura fredda anziché per la calda. 200/3 % è il complemento, cioè la frazione minima del calore da scaricare moltiplicata per 100. 75 % supera il limite trovato; zero sarebbe il limite con sorgenti alla stessa temperatura. I rapporti delle letture Celsius non danno un rendimento fisico.

## C3-Q082 — L’unico effetto vietato al motore

Versione 2, base 1; famiglia un-solo-serbatoio-termico; difficoltà 1.

Modello e procedura manuale: Kelvin–Planck esclude una macchina ciclica il cui unico effetto sia estrarre calore da una sola sorgente e produrre una quantità uguale di lavoro. Il primo principio da solo permetterebbe il bilancio energetico, ma il secondo principio nega quel processo ciclico senza ulteriori effetti. La precisazione sul ciclo esclude l’uso di una risorsa interna che venga consumata.

Leggi e passaggi: \Delta U_{\rm ciclo}=0;  Q_h=W>0

Risposta d’autore proposta: Prelevare calore da una sola sorgente e convertirlo integralmente in lavoro.

Distrattori e controlli: Le altre proposte non descrivono l’unico effetto vietato: un motore può scaricare calore a una seconda sorgente, un frigorifero può ricevere lavoro e l’attrito può dissipare lavoro. Lo scambio spontaneo caldo-freddo ha il verso termodinamicamente consentito.

## C3-Q083 — Trovare la sorgente calda

Versione 2, base 1; famiglia ricostruire-la-temperatura-calda; difficoltà 2.

Modello e procedura manuale: Per il motore reversibile η=1−T_c/T_h. Isolo il rapporto T_c/T_h=1−0,40=3/5, quindi T_h=T_c/(3/5)=300·5/3=500 K. La temperatura calda risulta maggiore di quella fredda, come deve essere per lavoro uscente positivo.

Leggi e passaggi: 1-\eta=\frac35;  T_h=\frac{T_c}{1-\eta};  T_h=500\,\mathrm K

Risposta d’autore proposta: 500 K.

Distrattori e controlli: 750 K dividerebbe per il rendimento 0,40 anziché per il complemento. 180 K moltiplicherebbe per 0,60 e renderebbe la sorgente dichiarata calda più fredda dell’altra. 300 K darebbe rendimento nullo.

## C3-Q084 — I raccordi del ciclo di Carnot

Versione 2, base 1; famiglia percorsi-di-raccordo-nel-ciclo-ideale; difficoltà 1.

Modello e procedura manuale: I raccordi sono le due adiabatiche reversibili. Non scambiano calore e portano il fluido dalla temperatura di una sorgente a quella dell’altra. Le due isoterme sono invece i tratti sui quali avvengono gli scambi con le sorgenti.

Leggi e passaggi: Q_{\rm raccordo}=0;  \text{adiabatiche reversibili}

Risposta d’autore proposta: Adiabatiche.

Distrattori e controlli: Pressione costante o volume costante non impongono da soli Q=0. Una isoterma non collega due temperature diverse. Attrito dissipativo non nullo contraddirebbe la reversibilità del ciclo di Carnot.

## C3-Q085 — Il frigorifero non agisce da solo

Versione 2, base 1; famiglia frigorifero-e-legge-di-clausius; difficoltà 1.

Modello e procedura manuale: Il secondo principio vieta che il solo effetto ciclico sia trasferire calore dal freddo al caldo. Il frigorifero riceve invece lavoro dall’esterno: al calore sottratto al vano si aggiunge l’energia fornita come lavoro. La cessione alla stanza può così essere maggiore del calore prelevato dal vano senza creare energia.

Leggi e passaggi: W_{\rm in}>0;  Q_h=Q_c+W_{\rm in}

Risposta d’autore proposta: Riceve lavoro dall’esterno: il trasferimento freddo-caldo non è l’unico effetto.

Distrattori e controlli: La conservazione dell’energia non determina da sola il verso spontaneo di un trasferimento. L’alimentazione di lavoro è un altro effetto, non una violazione automatica. Le lettere Q_h e Q_c rappresentano qui moduli positivi dei calori ceduto e prelevato.

## C3-Q086 — Dai kilowatt termici ai watt meccanici

Versione 2, base 1; famiglia lavoro-utile-da-un-flusso-di-calore; difficoltà 1.

Modello e procedura manuale: Il rendimento è il rapporto fra lavoro utile e calore assorbito sugli stessi cicli; dividendo entrambi per la stessa durata vale anche per le potenze medie. Converto 1,50 kW in 1500 W e calcolo 22/100·1500=330 W. La parte restante della potenza ricevuta, 1170 W nel modello a due trasferimenti di calore, deve essere ceduta come calore.

Leggi e passaggi: \bar P_h=1500\,\mathrm W;  \bar P_{\rm utile}=\eta\bar P_h;  \bar P_{\rm utile}=330\,\mathrm W

Risposta d’autore proposta: 330 W.

Distrattori e controlli: 0,33 W dimenticherebbe la conversione da kW; 1500 W darebbe rendimento unitario. 1170 W è la potenza termica da cedere nel modello, non quella utile. Dividere per 0,22 produrrebbe una potenza utile maggiore di quella in ingresso.

## C3-Q087 — Confrontare due motori fra le stesse sorgenti

Versione 2, base 1; famiglia macchine-reali-e-sorgenti-uguali; difficoltà 2.

Modello e procedura manuale: Il motore reversibile fra queste sorgenti raggiunge η_C=1−T_c/T_h. Una dissipazione interna netta rende positiva la produzione di entropia e impedisce a B di raggiungere lo stesso limite, con i due soli scambi termici dichiarati. Il riscaldamento da attrito non aumenta il lavoro utile ricavabile dagli stessi serbatoi.

Leggi e passaggi: \eta_A=1-\frac{T_c}{T_h};  \eta_B<\eta_A

Risposta d’autore proposta: B ha rendimento minore di A, che raggiunge il limite di Carnot.

Distrattori e controlli: La chiusura del ciclo annulla ΔU del fluido ma non elimina il vincolo del secondo principio. Reversibile non significa rendimento nullo quando le temperature differiscono. Il tempo modifica la potenza, non sostituisce il rapporto energetico che definisce il rendimento.

## C3-Q088 — Il minimo calore da scaricare

Versione 2, base 1; famiglia limite-inferiore-al-calore-scaricato; difficoltà 2.

Modello e procedura manuale: Il limite di Carnot vale η_C=1−300/600=1/2. Il lavoro può essere al massimo 450 J per ciclo; dal bilancio Q_c=Q_h−W segue Q_c≥900−450=450 J. Il minimo è raggiunto nel limite reversibile. Una macchina dissipativa deve scaricare di più a parità di calore ricevuto.

Leggi e passaggi: \eta\leq\frac12;  W\leq450\,\mathrm J;  Q_c=Q_h-W;  Q_c\geq450\,\mathrm J

Risposta d’autore proposta: 450 J.

Distrattori e controlli: Zero richiederebbe convertire in lavoro tutti i 900 J, oltre il limite. 300 J sarebbe soltanto il numero della temperatura fredda usato impropriamente come energia. 900 J corrisponderebbe a lavoro nullo, non al minimo scarico possibile per questa domanda.

## C3-Q089 — Il numeratore del rendimento

Versione 2, base 1; famiglia grandezza-utile-al-numeratore; difficoltà 1.

Modello e procedura manuale: Il rendimento confronta il lavoro netto utile W con il modulo Q_h del calore ricevuto. Entrambi sono energie, quindi il rapporto è adimensionale. Lavoro per ciclo e calore per ciclo devono riferirsi alla stessa sequenza periodica.

Leggi e passaggi: \eta=\frac{W_{\rm netto}}{Q_h}

Risposta d’autore proposta: Lavoro.

Distrattori e controlli: Il calore ceduto diviso per quello assorbito è il complemento del rendimento nel modello a due sorgenti. Un salto di temperatura o un volume non ha unità di energia. L’entropia del fluido non aumenta dopo un ciclo completo che torna allo stesso stato.

## C3-Q090 — Una prestazione frigorifera maggiore di uno

Versione 2, base 1; famiglia approfondimento-prestazione-di-una-macchina-frigorifera; difficoltà 2.

Modello e procedura manuale: Nel ciclo l’energia interna torna al valore iniziale e il bilancio dà Q_c=Q_h−W_in=200−50=150 J. La prestazione richiesta è quindi 150/50=3. Un COP maggiore di uno non è un rendimento di conversione in lavoro: conta anche l’energia sottratta al vano freddo.

Leggi e passaggi: Q_c=Q_h-W_{\rm in};  Q_c=150\,\mathrm J;  {\rm COP}=\frac{Q_c}{W_{\rm in}};  {\rm COP}=3

Risposta d’autore proposta: 3 1.

Distrattori e controlli: Quattro userebbe Q_h/W_in, il coefficiente per una pompa di calore, non quello frigorifero. 1/3 invertirebbe il rapporto richiesto. Uno confonderebbe lavoro ricevuto e calore prelevato; non si crea energia perché 150+50=200 J.
