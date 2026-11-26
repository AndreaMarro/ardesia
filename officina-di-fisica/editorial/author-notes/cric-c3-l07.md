# cric-c3-l07 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C3.json, SHA 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0. Tutti i cinquanta prompt B letti individualmente con sola allowlist id/prompt prima di scrivere candidate; lezioni reali C3-L06–L10 e loro fondazioni C3-L01–L05 lette integralmente. Nessuna opzione, risposta, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche congelate in Git prima dell’autoria: B sui cinquanta A001–050 in 030d4658b17ea6f6fd43be03cb59b21e91030eb0, primaria SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80, modello SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, Git-inputs f7d68ecf. A sui cinquanta B051–100 in 93ea8d3c1ba874bfbf74d4734ce136b319a9ca72, primaria SHA 13a65d52b70957d49eec44e4e1b9ce6d4e99c7cb3cc5d1e1418f9f4967aade8f; modello 92090ea0d2011c79dda93181542f7a09746396ff, recupero b374cab44db567ea0ffc1a510bae874945a5fdb7. Di questi ultimi file ricevuti soltanto hash/percorso: mai aperti durante l’autoria.

ID, corso, competenza, famiglia, difficoltà, prerequisiti, ordine e flag exam originali sono preservati individualmente. Ogni nuova versione ha baseVersion uguale alla versione originale e version aumentata di uno. Non sono varianti artificiali di una sola famiglia. L’assembler unico e l’importatore editoriale canonico restano invariati; dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}, non attribuita a questa autoria.

Due assembly vere identiche e import canonico col budget originale di 60 s: dieci DRAFT salvati, poi zero salvati e dieci invariati in SQLite temporaneo. I 991 pubblicati e tutti i live head storici restano invariati. Operazioni sotto mutex e guardia almeno 2 GiB. PNG nativo completo e XML finali realmente aperti e letti: solo asset, nessuna UI prodotto. Eventuali edizioni iniziali e ricevute sono conservate, non riattribuite. SCI propria, UI prodotto e approvazione umana NOT_RUN; pubblicazione DRAFT.

## C3-Q061 — Salire a volume bloccato

Versione 2, base 1; famiglia tratto-verticale-nel-piano-pv; difficoltà 1.

Modello e procedura manuale: Con quantità di gas e volume fissati, pV=nRT impone T proporzionale a p assoluta: la temperatura cresce. Per il gas perfetto con capacità termica positiva cresce anche U. Il lavoro di volume è nullo perché il pistone non si sposta; il calore ricevuto fornisce l’aumento di energia interna.

Leggi e passaggi: \Delta V=0;  W=0;  \frac{p_f}{p_i}=\frac{T_f}{T_i}>1;  \Delta U>0

Risposta d’autore proposta: Aumentano temperatura ed energia interna.

Distrattori e controlli: La linea verticale non rappresenta un aumento di volume. Non è un’isoterma e il lavoro nullo non impone Q nullo. Per il gas ideale chiuso una temperatura maggiore non può accompagnare una diminuzione di U a capacità positiva.

## C3-Q062 — Raffreddamento mentre il gas lavora

Versione 2, base 1; famiglia quantificare-il-raffreddamento-adiabatico; difficoltà 2.

Modello e procedura manuale: Adiabatico significa Q=0. Il lavoro uscente porta ΔU=−200 J, anche se il volume non è costante durante il processo. Per il gas ideale U dipende solo da T: ΔU=Cᵥ,totΔT, quindi ΔT=−200/25=−8 K. L’indice v identifica la capacità che lega U a T, non impone qui un percorso isocoro.

Leggi e passaggi: Q=0;  \Delta U=-W;  \Delta U=-200\,\mathrm J;  \Delta T=\frac{\Delta U}{C_{v,\rm tot}};  \Delta T=-8\,\mathrm K

Risposta d’autore proposta: -8 K.

Distrattori e controlli: +8 K invertirebbe il segno del lavoro uscente. 200 K copierebbe un’energia come temperatura. Zero confonderebbe assenza di calore con assenza di variazione di U; per tornare al lavoro si usa W=−Cᵥ,totΔT.

## C3-Q063 — Riconoscere una pressione invariata

Versione 2, base 1; famiglia nominare-un-vincolo-da-una-misura; difficoltà 1.

Modello e procedura manuale: La proprietà dichiarata è la pressione costante: il cammino è isobaro. Nel piano p–V è un tratto orizzontale. Non sono specificati né calore nullo né temperatura costante; per un gas perfetto chiuso la temperatura cambia insieme al volume.

Leggi e passaggi: p=\mathrm{costante}

Risposta d’autore proposta: Isobara.

Distrattori e controlli: Isocoro significa volume fisso, che qui varia. Isotermo riguarda T e adiabatico riguarda Q: nessuna delle due condizioni deriva dal solo mantenere p. Un ciclo richiederebbe ritorno allo stesso stato.

## C3-Q064 — Lentissimo non significa reversibile

Versione 2, base 1; famiglia quasi-statico-con-attrito; difficoltà 2.

Modello e procedura manuale: La lentezza può permettere al gas di attraversare una successione di stati prossimi all’equilibrio. La reversibilità richiede però anche assenza di dissipazione complessiva: l’attrito produce trasformazioni che non si annullano semplicemente invertendo il verso del pistone. Quasi statico e reversibile non sono sinonimi.

Leggi e passaggi: \text{irreversibile}

Risposta d’autore proposta: Può essere quasi statico, ma resta irreversibile per l’attrito.

Distrattori e controlli: L’attrito non rende automaticamente la parete adiabatica. Una velocità piccola non annulla il lavoro totale, che dipende dallo spostamento e dalle forze. Un processo lento attraversa stati diversi e non è un singolo equilibrio immutabile.

## C3-Q065 — Scaldare un’ampolla rigida

Versione 2, base 1; famiglia guadagno-di-energia-lungo-una-isocora; difficoltà 1.

Modello e procedura manuale: L’ampolla impedisce la variazione di volume, quindi il lavoro di espansione è zero. I 72 J ricevuti aumentano interamente U nel modello: ΔT=Q/Cᵥ,tot=72/12=6 K. La capacità assegnata è totale, già espressa in J/K; non occorre moltiplicare ancora per la massa o per le moli.

Leggi e passaggi: W=0;  \Delta U=Q;  \Delta T=\frac{Q}{C_{v,\rm tot}};  \Delta T=6\,\mathrm K

Risposta d’autore proposta: 6 K.

Distrattori e controlli: 864 ricaverebbe il prodotto Q·C, con unità diverse da kelvin. 12 copierebbe la capacità, mentre zero ignorerebbe il calore entrante. Per l’inversa Q=Cᵥ,totΔT=12·6=72 J.

## C3-Q066 — T costante per un gas perfetto

Versione 2, base 1; famiglia energia-interna-in-una-isoterma-ideale; difficoltà 1.

Modello e procedura manuale: Per questo modello l’energia interna è funzione della sola temperatura. Gli estremi hanno la stessa T, quindi ΔU=0. Ciò non annulla separatamente calore e lavoro: in un’espansione isoterma reversibile il gas può assorbire calore e compiere la stessa quantità di lavoro.

Leggi e passaggi: T_f=T_i;  \Delta U=0;  Q=W

Risposta d’autore proposta: Nulla.

Distrattori e controlli: Un volume che aumenta non obbliga U ad aumentare nel gas perfetto isotermo. Il valore di una variazione di energia non può essere un volume. L’ultima uguaglianza è il bilancio senza altre variazioni macroscopiche, non una dichiarazione di assenza di scambi.

## C3-Q067 — Il lavoro isobaro con una costante assegnata

Versione 2, base 1; famiglia un-tratto-isobaro-di-un-gas-perfetto; difficoltà 2.

Modello e procedura manuale: A pressione costante W=pΔV. Sottraendo le equazioni di stato degli estremi, pΔV=nRΔT: la pressione si elimina senza doverla conoscere. Il prodotto 0,50·20 vale 10 mol·K; moltiplicare 8,314 per dieci dà 83,14 J esatti rispetto al parametro assegnato. Il segno è positivo perché il gas si espande.

Leggi e passaggi: W=p\Delta V;  p\Delta V=nR\Delta T;  n\Delta T=10\,\mathrm{mol\,K};  W=83{,}14\,\mathrm J

Risposta d’autore proposta: 83,14 J.

Distrattori e controlli: 8,314 J ometterebbe il fattore complessivo nΔT=10 mol·K, copiando solo il numero di R. 831,4 J introdurrebbe un ulteriore fattore dieci. 166,28 J userebbe una mole invece di mezza; zero sarebbe lavoro isocoro, non isobaro con aumento di T.

## C3-Q068 — Due espansioni dallo stesso stato

Versione 2, base 1; famiglia confronto-fra-due-curve; difficoltà 2.

Modello e procedura manuale: Nell’isoterma il bagno fornisce energia e la temperatura resta quella iniziale. Nell’adiabatica il gas compie lavoro a spese di U e si raffredda. A ogni volume intermedio maggiore dell’iniziale, la pressione adiabatica è quindi minore della pressione isoterma. L’area sotto l’isoterma, e perciò il lavoro positivo, è maggiore.

Leggi e passaggi: T_{\rm ad}<T_i;  p_{\rm ad}(V)<p_{\rm isot}(V);  W_{\rm isot}>W_{\rm ad}>0

Risposta d’autore proposta: L’isoterma.

Distrattori e controlli: Lo stesso intervallo di volume non rende uguali le aree se le pressioni lungo i cammini differiscono. Il lavoro non è nullo in un’espansione contro pressione positiva. Le disuguaglianze di T e p valgono dopo lo stato iniziale comune, non nel punto di partenza.

## C3-Q069 — Una potenza con radice esatta

Versione 2, base 1; famiglia ricostruire-un-rapporto-adiabatico; difficoltà 3.

Modello e procedura manuale: La legge del percorso è pV^γ costante. Quindi p_i/p_f=(V_f/V_i)^γ=4^(3/2). Calcolo prima la radice quadrata di 4, che è 2, e poi il cubo: 2³=8. La pressione finale è un ottavo dell’iniziale; il rapporto richiesto è quello inverso.

Leggi e passaggi: p_iV_i^{\gamma}=p_fV_f^{\gamma};  \frac{p_i}{p_f}=4^{3/2};  4^{3/2}=(\sqrt4)^3;  \frac{p_i}{p_f}=8

Risposta d’autore proposta: 8 1.

Distrattori e controlli: Quattro userebbe γ=1, la dipendenza isoterma. Due prenderebbe solo la radice senza il cubo. 1/8 invertirebbe il rapporto richiesto. Il coefficiente γ è adimensionale e il rapporto delle pressioni non ha unità.

## C3-Q070 — Il bagno che sostiene l’isoterma

Versione 2, base 1; famiglia il-bagno-e-la-parete-isolante; difficoltà 2.

Modello e procedura manuale: Per gas perfetto isotermo ΔU=0, dunque Q=W>0 con la convenzione entrante/uscente. Il contatto deve essere diatermico, in grado di far passare il calore necessario dal bagno al gas. Nel limite reversibile il trasferimento avviene con differenza di temperatura infinitesima; la lentezza da sola non sostituisce il contatto termico.

Leggi e passaggi: \Delta U=0;  Q=W>0

Risposta d’autore proposta: Deve permettere ingresso di calore che compensi il lavoro.

Distrattori e controlli: Un isolamento adiabatico insieme a W>0 farebbe diminuire U e la temperatura, contraddicendo l’isoterma. Un gas chiuso non deve ricevere materia per ottenere calore. Mantenere T non significa impedire il lavoro.
