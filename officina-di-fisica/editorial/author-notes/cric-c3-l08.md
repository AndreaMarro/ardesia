# cric-c3-l08 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C3.json, SHA 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0. Tutti i cinquanta prompt B letti individualmente con sola allowlist id/prompt prima di scrivere candidate; lezioni reali C3-L06–L10 e loro fondazioni C3-L01–L05 lette integralmente. Nessuna opzione, risposta, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche congelate in Git prima dell’autoria: B sui cinquanta A001–050 in 030d4658b17ea6f6fd43be03cb59b21e91030eb0, primaria SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80, modello SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, Git-inputs f7d68ecf. A sui cinquanta B051–100 in 93ea8d3c1ba874bfbf74d4734ce136b319a9ca72, primaria SHA 13a65d52b70957d49eec44e4e1b9ce6d4e99c7cb3cc5d1e1418f9f4967aade8f; modello 92090ea0d2011c79dda93181542f7a09746396ff, recupero b374cab44db567ea0ffc1a510bae874945a5fdb7. Di questi ultimi file ricevuti soltanto hash/percorso: mai aperti durante l’autoria.

ID, corso, competenza, famiglia, difficoltà, prerequisiti, ordine e flag exam originali sono preservati individualmente. Ogni nuova versione ha baseVersion uguale alla versione originale e version aumentata di uno. Non sono varianti artificiali di una sola famiglia. L’assembler unico e l’importatore editoriale canonico restano invariati; dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}, non attribuita a questa autoria.

Due assembly vere identiche e import canonico col budget originale di 60 s: dieci DRAFT salvati, poi zero salvati e dieci invariati in SQLite temporaneo. I 991 pubblicati e tutti i live head storici restano invariati. Operazioni sotto mutex e guardia almeno 2 GiB. PNG nativo completo e XML finali realmente aperti e letti: solo asset, nessuna UI prodotto. Eventuali edizioni iniziali e ricevute sono conservate, non riattribuite. SCI propria, UI prodotto e approvazione umana NOT_RUN; pubblicazione DRAFT.

## C3-Q071 — Un’area triangolare con verso

Versione 2, base 1; famiglia ciclo-triangolare; difficoltà 1.

Modello e procedura manuale: Il lavoro netto di un ciclo quasi statico è l’area racchiusa con il segno del verso. Per il triangolo l’area è metà base per altezza: 4·60/2=120 kPa·L=120 J. Il verso orario assegna il segno positivo. Non serve conoscere la pressione assoluta della base per calcolare la differenza fra espansione e compressione.

Leggi e passaggi: |W|=\frac12\Delta V\Delta p;  |W|=\frac12(4\,\mathrm L)(60\,\mathrm{kPa});  W=120\,\mathrm J

Risposta d’autore proposta: 120 J.

Distrattori e controlli: 240 J userebbe il rettangolo anziché il triangolo. −120 J sarebbe il lavoro dello stesso ciclo percorso nel verso opposto. Zero confonderebbe il ritorno di U con l’annullamento di un trasferimento di lavoro.

## C3-Q072 — Ripercorrere lo stesso contorno

Versione 2, base 1; famiglia invertire-il-verso-del-ciclo; difficoltà 1.

Modello e procedura manuale: Invertire il verso sostituisce ogni contributo p dV con il suo opposto. L’area geometrica racchiusa resta la stessa e il lavoro cambia segno. La proprietà vale per lo stesso contorno ripercorso, senza supporre che ogni ciclo diverso abbia lo stesso modulo.

Leggi e passaggi: W_{\rm inverso}=-W_{\rm diretto}

Risposta d’autore proposta: Cambia segno e mantiene il modulo.

Distrattori e controlli: Il ritorno allo stato iniziale non annulla il lavoro di un ciclo. Non si aggiunge una seconda area e non si cambia la scala degli assi. La temperatura iniziale non determina da sola un integrale lungo il percorso.

## C3-Q073 — Un’intera sequenza periodica

Versione 2, base 1; famiglia chiusura-del-cammino; difficoltà 1.

Modello e procedura manuale: È un ciclo termodinamico. Tornare allo stesso stato ripristina i valori delle funzioni di stato, ma lungo la sequenza possono essere stati scambiati calore e lavoro. La periodicità non identifica da sola le condizioni di ciascun tratto.

Leggi e passaggi: U_f=U_i;  \Delta U_{\rm ciclo}=0

Risposta d’autore proposta: Ciclo termodinamico.

Distrattori e controlli: Un ciclo può contenere isoterme, compressioni o cambiamenti di fase, senza coincidere per definizione con uno solo di essi. La variazione nulla di U non dimostra assenza dei trasferimenti durante la sequenza.

## C3-Q074 — Lavoro per ciclo e cicli al secondo

Versione 2, base 1; famiglia potenza-da-cicli-al-minuto; difficoltà 2.

Modello e procedura manuale: La potenza media è il lavoro complessivo diviso per la durata. In 60 s il lavoro è 24·150=3600 J, quindi P=3600/60=60 W. Si può anche convertire il ritmo: 150/60=5/2 cicli/s e moltiplicarlo per 24 J/ciclo. Non si pretende una potenza istantanea costante.

Leggi e passaggi: W_{60\,\mathrm s}=24\cdot150\,\mathrm J;  W_{60\,\mathrm s}=3600\,\mathrm J;  \bar P=\frac{3600\,\mathrm J}{60\,\mathrm s};  \bar P=60\,\mathrm W

Risposta d’autore proposta: 60 W.

Distrattori e controlli: 3600 copia il valore numerico del lavoro in un minuto espresso in joule, senza dividerlo per 60 s per ottenere watt. 24 W scambierebbe il lavoro per ciclo con il lavoro per secondo. 0,16 deriverebbe da una divisione fra numeri che non rappresenta il lavoro totale sulla durata.

## C3-Q075 — Calore netto: entrate e uscite

Versione 2, base 1; famiglia calore-assorbito-e-calore-netto; difficoltà 1.

Modello e procedura manuale: I 400 J sono un trasferimento positivo per il gas, mentre i 300 J ceduti sono negativi. Q_netto=400−300=100 J. In un ciclo completo senza altre variazioni macroscopiche questa stessa quantità è il lavoro netto uscente, perché ΔU=0.

Leggi e passaggi: Q_h=400\,\mathrm J;  Q_{\rm ceduto}=-300\,\mathrm J;  Q_{\rm netto}=100\,\mathrm J

Risposta d’autore proposta: 100 J.

Distrattori e controlli: 700 J sommerebbe i moduli senza rispettare i versi. −100 J invertirebbe la convenzione entrante. 400 J ometterebbe la cessione, mentre zero confonderebbe calore netto e variazione di una funzione di stato.

## C3-Q076 — Distribuire il lavoro su tre cicli

Versione 2, base 1; famiglia scarico-termico-richiesto; difficoltà 2.

Modello e procedura manuale: Prima ricavo il lavoro di un ciclo: 1,8/3=0,6 kJ. Il bilancio ciclico W=Q_h−Q_c dà Q_c=Q_h−W=2,0−0,6=1,4 kJ. Q_c è definito come modulo positivo della cessione; il suo contributo al calore netto del fluido è −1,4 kJ.

Leggi e passaggi: W_{\rm ciclo}=\frac{1{,}8}{3}\,\mathrm{kJ};  W_{\rm ciclo}=0{,}6\,\mathrm{kJ};  Q_c=Q_h-W_{\rm ciclo};  Q_c=1{,}4\,\mathrm{kJ}

Risposta d’autore proposta: 1,4 kJ.

Distrattori e controlli: 0,2 kJ sottrarrebbe dal calore di un ciclo il lavoro di tre cicli. 0,6 kJ copierebbe il lavoro. 2,6 kJ sommerebbe lavoro uscente e calore entrante anziché ricavare la cessione. 4,2 kJ è il calore ceduto in tre cicli, non in uno.

## C3-Q077 — Dare un verso al lavoro del ciclo

Versione 2, base 1; famiglia orientamento-motore; difficoltà 1.

Modello e procedura manuale: Nel percorso orario l’espansione avviene sul ramo di pressione maggiore rispetto alla compressione corrispondente. L’area positiva dell’espansione supera in modulo quella negativa della compressione. Il lavoro uscente netto è quindi positivo.

Leggi e passaggi: W=\oint p\,dV>0

Risposta d’autore proposta: Orario.

Distrattori e controlli: Il verso antiorario scambia i ruoli e dà lavoro netto negativo. Un segmento verticale ha dV=0 e non può, da solo, racchiudere l’area di una curva semplice. La chiusura del ciclo annulla ΔU, non W.

## C3-Q078 — Ricavare l’intervallo di volume

Versione 2, base 1; famiglia superficie-mancante; difficoltà 1.

Modello e procedura manuale: L’area del rettangolo è ΔpΔV e il verso ne rende positivo il lavoro uscente. Isolo ΔV=W/Δp: 150 J/(50 kPa)=3 L, usando kPa·L=J. È l’intervallo fra i volumi, non il valore di uno dei due volumi assoluti.

Leggi e passaggi: W=\Delta p\Delta V;  \Delta V=\frac{W}{\Delta p};  \Delta V=3\,\mathrm L

Risposta d’autore proposta: 3 L.

Distrattori e controlli: 7500 moltiplicherebbe i numeri invece di dividere e non avrebbe unità di volume. 1/3 L darebbe un lavoro di 50/3 J, non 150 J. Zero annullerebbe l’area pur con un lavoro positivo assegnato.

## C3-Q079 — Che cosa torna davvero al punto di partenza

Versione 2, base 1; famiglia il-gas-al-termine-di-un-ciclo; difficoltà 2.

Modello e procedura manuale: Energia interna ed entropia sono entrambe funzioni di stato. Se lo stato finale del fluido coincide con l’iniziale, entrambe le variazioni sono zero anche in un ciclo irreversibile. In quel caso può aumentare l’entropia complessiva di fluido e ambiente, senza accumularsi nel fluido a fine ciclo.

Leggi e passaggi: \Delta U_{\rm fluido}=0;  \Delta S_{\rm fluido}=0

Risposta d’autore proposta: ΔU=0 e ΔS=0.

Distrattori e controlli: Calore e lavoro sono trasferimenti lungo il percorso e possono essere entrambi non nulli. La produzione irreversibile non impone ΔS positivo del solo fluido ciclico; l’entropia prodotta può essere trasferita all’ambiente. Una variazione non nulla di U contraddirebbe il ritorno allo stesso stato.

## C3-Q080 — Un ciclo che richiede lavoro

Versione 2, base 1; famiglia un-ciclo-in-due-letture-di-calore; difficoltà 2.

Modello e procedura manuale: Sommo i calori con i versi: Q_netto=80+50−170=−40 J. Poiché il ciclo ha ΔU=0 e nessuna variazione macroscopica residua, W_netto=Q_netto=−40 J. Il gas riceve dunque 40 J netti come lavoro: non è un motore con lavoro uscente positivo in questo ciclo.

Leggi e passaggi: Q_{\rm netto}=(80+50-170)\,\mathrm J;  Q_{\rm netto}=-40\,\mathrm J;  W_{\rm netto}=Q_{\rm netto};  W_{\rm netto}=-40\,\mathrm J

Risposta d’autore proposta: -40 J.

Distrattori e controlli: +40 J cambierebbe il segno del trasferimento richiesto. 300 J sommerebbe i tre moduli e 130 J ignorerebbe il tratto cedente. Zero confonderebbe la variazione di U con il lavoro lungo un percorso chiuso.
