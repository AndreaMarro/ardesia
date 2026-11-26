# cric-c3-l10 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C3.json, SHA 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0. Tutti i cinquanta prompt B letti individualmente con sola allowlist id/prompt prima di scrivere candidate; lezioni reali C3-L06–L10 e loro fondazioni C3-L01–L05 lette integralmente. Nessuna opzione, risposta, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche congelate in Git prima dell’autoria: B sui cinquanta A001–050 in 030d4658b17ea6f6fd43be03cb59b21e91030eb0, primaria SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80, modello SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, Git-inputs f7d68ecf. A sui cinquanta B051–100 in 93ea8d3c1ba874bfbf74d4734ce136b319a9ca72, primaria SHA 13a65d52b70957d49eec44e4e1b9ce6d4e99c7cb3cc5d1e1418f9f4967aade8f; modello 92090ea0d2011c79dda93181542f7a09746396ff, recupero b374cab44db567ea0ffc1a510bae874945a5fdb7. Di questi ultimi file ricevuti soltanto hash/percorso: mai aperti durante l’autoria.

ID, corso, competenza, famiglia, difficoltà, prerequisiti, ordine e flag exam originali sono preservati individualmente. Ogni nuova versione ha baseVersion uguale alla versione originale e version aumentata di uno. Non sono varianti artificiali di una sola famiglia. L’assembler unico e l’importatore editoriale canonico restano invariati; dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}, non attribuita a questa autoria.

Due assembly vere identiche e import canonico col budget originale di 60 s: dieci DRAFT salvati, poi zero salvati e dieci invariati in SQLite temporaneo. I 991 pubblicati e tutti i live head storici restano invariati. Operazioni sotto mutex e guardia almeno 2 GiB. PNG nativo completo e XML finali realmente aperti e letti: solo asset, nessuna UI prodotto. Eventuali edizioni iniziali e ricevute sono conservate, non riattribuite. SCI propria, UI prodotto e approvazione umana NOT_RUN; pubblicazione DRAFT.

## C3-Q091 — Il serbatoio perde energia ed entropia

Versione 2, base 1; famiglia entropia-persa-da-un-serbatoio; difficoltà 1.

Modello e procedura manuale: Il serbatoio conserva la temperatura durante lo scambio, e il calore che riceve è Q_serb=−640 J. Fra i suoi stati si usa ΔS=Q_serb/T, quindi ΔS=−640/320=−2 J/K. Una singola parte può perdere entropia: il secondo principio riguarda il bilancio complessivo quando si include il resto del processo.

Leggi e passaggi: Q_{\rm serb}=-640\,\mathrm J;  \Delta S_{\rm serb}=\frac{Q_{\rm serb}}{T};  \Delta S_{\rm serb}=-2\,\mathrm{J/K}

Risposta d’autore proposta: -2 J/K.

Distrattori e controlli: +2 J/K userebbe il modulo del calore senza il verso. Zero confonderebbe temperatura costante con entropia costante. −640 J è un’energia e non la variazione di entropia; non si moltiplica per la temperatura.

## C3-Q092 — Il fluido torna; la produzione non scompare

Versione 2, base 1; famiglia entropia-del-fluido-e-dellambiente; difficoltà 2.

Modello e procedura manuale: L’entropia è funzione di stato, quindi ΔS_fluido=0 dopo il ritorno allo stato iniziale. L’irreversibilità produce però entropia positiva nell’insieme complessivamente isolato. Il fluido può trasferire all’ambiente l’entropia prodotta durante il ciclo, senza accumularla nel proprio stato finale.

Leggi e passaggi: \Delta S_{\rm fluido}=0;  \Delta S_{\rm insieme}>0

Risposta d’autore proposta: ΔS del fluido è zero, mentre l’entropia dell’insieme aumenta.

Distrattori e controlli: Non si può dedurre il bilancio dell’insieme dalla sola variazione del fluido. Una diminuzione dell’entropia totale isolata contrasterebbe con il secondo principio macroscopico; entrambi nulli descriverebbe il limite reversibile, non l’irreversibilità dichiarata.

## C3-Q093 — L’unità dell’entropia

Versione 2, base 1; famiglia unita-si-dellentropia; difficoltà 1.

Modello e procedura manuale: Nel trasferimento reversibile isotermo ΔS=Q_rev/T. Un’energia in joule divisa per una temperatura assoluta in kelvin dà J/K. Non è un’energia e non è una potenza; il tempo non compare nell’unità di S.

Leggi e passaggi: [S]=\mathrm{J/K}

Risposta d’autore proposta: J/K.

Distrattori e controlli: K/J è il reciproco dell’unità. J è l’unità dell’energia e W/K includerebbe un fattore tempo al denominatore. N/K dividerebbe una forza, anziché un’energia, per la temperatura.

## C3-Q094 — Entropia nel plateau di fusione

Versione 2, base 1; famiglia un-passaggio-di-fase-reversibile; difficoltà 2.

Modello e procedura manuale: Converto 10 g in 1/100 kg e 100 kJ/kg in 100000 J/kg. La fusione assorbe Q_rev=mL=1000 J. Poiché il passaggio è reversibile e isotermo, ΔS=1000/250=4 J/K. La temperatura costante non rende nullo il calore latente.

Leggi e passaggi: m=\frac1{100}\,\mathrm{kg};  Q_{\rm rev}=mL;  Q_{\rm rev}=1000\,\mathrm J;  \Delta S=\frac{Q_{\rm rev}}{T};  \Delta S=4\,\mathrm{J/K}

Risposta d’autore proposta: 4 J/K.

Distrattori e controlli: 1000 J è soltanto l’energia assorbita. Zero ignora il cambiamento di fase e 4000 J/K ometterebbe la conversione dai grammi ai chilogrammi nella massa. Il segno negativo sarebbe quello di una solidificazione reversibile fra gli stessi stati di fase invertiti.

## C3-Q095 — Un percorso di riferimento reversibile

Versione 2, base 1; famiglia quanto-conta-il-cammino-reale; difficoltà 2.

Modello e procedura manuale: S è funzione di stato: la sua differenza dipende dagli estremi, non dal cammino realmente percorso. Si può quindi scegliere un cammino reversibile di riferimento che colleghi gli stessi stati e integrare δQ_rev/T. Il calore di quel cammino non deve coincidere con quello del processo reale irreversibile.

Leggi e passaggi: \Delta S=S_f-S_i;  \Delta S=\int_i^f\frac{\delta Q_{\rm rev}}{T}

Risposta d’autore proposta: Integrare δQ_rev/T lungo un cammino reversibile immaginario fra gli stessi stati.

Distrattori e controlli: Il rapporto Q_reale/T_i non sostituisce in generale l’integrale, né include automaticamente la produzione irreversibile. Rapidità o calore reale nullo non impongono entropia costante. Cambiare gli estremi significherebbe risolvere un altro problema.

## C3-Q096 — Dal conteggio al logaritmo esatto

Versione 2, base 1; famiglia dal-numero-di-microstati-al-rapporto-di-entropia; difficoltà 2.

Modello e procedura manuale: Sottraggo le entropie e uso la differenza dei logaritmi: ΔS/k_B=ln(Ω_f/Ω_i)=ln(48/12)=ln 4. È anche 2 ln 2. Il rapporto è puro e i due conteggi sono interi positivi.

Leggi e passaggi: \frac{\Delta S}{k_B}=\ln\frac{\Omega_f}{\Omega_i};  \frac{\Omega_f}{\Omega_i}=4;  \frac{\Delta S}{k_B}=\ln4

Risposta d’autore proposta: ln 4.

Distrattori e controlli: ln 36 userebbe la differenza dei conteggi dentro il logaritmo; ln 60 la somma. Quattro è il rapporto delle molteplicità prima di applicare il logaritmo. Il valore negativo corrisponderebbe invece allo scambio degli stati iniziale e finale.

## C3-Q097 — Una configurazione, non un intero insieme

Versione 2, base 1; famiglia configurazione-microscopica-individuale; difficoltà 1.

Modello e procedura manuale: È un microstato. Il macrostato descrive grandezze macroscopiche e può essere compatibile con molti microstati. La molteplicità Ω conta questi ultimi nel modello statistico; non è il nome di una singola configurazione.

Leggi e passaggi: \text{microstato}

Risposta d’autore proposta: Microstato.

Distrattori e controlli: Calore è un trasferimento energetico e non una configurazione. Temperatura e rendimento non specificano da soli tutte le variabili microscopiche. Identificare microstato e macrostato cancellerebbe proprio la molteplicità su cui si basa il conteggio.

## C3-Q098 — Il saldo dei due serbatoi

Versione 2, base 1; famiglia firma-del-verso-spontaneo; difficoltà 2.

Modello e procedura manuale: Il caldo perde entropia: ΔS_h=−90/360=−1/4 J/K. Il freddo la acquista: ΔS_c=90/300=3/10 J/K. Il totale è 3/10−1/4=(6−5)/20=1/20 J/K, positivo come previsto per questo scambio spontaneo con differenza finita di temperatura.

Leggi e passaggi: \Delta S_h=-\frac14\,\mathrm{J/K};  \Delta S_c=\frac3{10}\,\mathrm{J/K};  \Delta S_{\rm tot}=\Delta S_h+\Delta S_c;  \Delta S_{\rm tot}=\frac1{20}\,\mathrm{J/K}

Risposta d’autore proposta: 1/20 J/K.

Distrattori e controlli: Il valore negativo invertirebbe il verso caldo-freddo. 11/20 J/K sommerebbe i moduli e perderebbe il segno del serbatoio caldo. 1/4 e 3/10 J/K considererebbero soltanto uno dei due serbatoi. Per l’insieme isolato questa variazione coincide con l’entropia prodotta.

## C3-Q099 — Un risultato macroscopico incompatibile

Versione 2, base 1; famiglia un-candidato-processo-isolato; difficoltà 1.

Modello e procedura manuale: Per un intero sistema isolato il secondo principio macroscopico richiede ΔS_tot≥0. Una previsione spontanea di −4 J/K viola questa condizione nel dominio dichiarato. Occorre controllare il confine, le ipotesi e il calcolo; la sola conservazione dell’energia non basta a rendere ammissibile un processo.

Leggi e passaggi: \Delta S_{\rm isolato}\geq0;  -4\,\mathrm{J/K}<0

Risposta d’autore proposta: È incompatibile con il secondo principio macroscopico: vanno riesaminati modello o calcolo.

Distrattori e controlli: La lentezza non autorizza un’entropia totale negativa e non trasforma un processo vietato in uno reversibile. Una parte può perdere entropia soltanto con un bilancio appropriato delle altre parti; qui il confine include già tutto il sistema isolato.

## C3-Q100 — Scaldare mentre la temperatura cambia

Versione 2, base 1; famiglia approfondimento-riscaldamento-a-temperatura-variabile; difficoltà 3.

Modello e procedura manuale: La temperatura varia, quindi non divido tutto il calore per un unico valore arbitrario di T. Su un tratto reversibile dQ_rev=C dT e ΔS=∫C dT/T=C ln(T_f/T_i)=30 ln(6/5) J/K. Il calore totale è 30·50=1500 J, ma non coincide con l’entropia. Per un controllo manuale, il risultato è strettamente fra 1500/300=5 J/K e 1500/250=6 J/K.

Leggi e passaggi: \delta Q_{\rm rev}=C\,dT;  \Delta S=C\int_{250\,\mathrm K}^{300\,\mathrm K}\frac{dT}{T};  \frac{T_f}{T_i}=\frac65;  \Delta S=30\ln\frac65\,\mathrm{J/K}

Risposta d’autore proposta: 30 ln(6/5) J/K.

Distrattori e controlli: Il logaritmo del rapporto inverso darebbe una variazione negativa durante il riscaldamento. 6 J/K userebbe soltanto la temperatura iniziale e 5 J/K soltanto la finale: sono limiti, non l’integrale. 1500 J/K copierebbe il numero del calore in unità non corrette per quel trasferimento.
