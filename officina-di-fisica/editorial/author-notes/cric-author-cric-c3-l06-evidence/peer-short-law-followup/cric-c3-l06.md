# cric-c3-l06 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C3.json, SHA 44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0. Tutti i cinquanta prompt B letti individualmente con sola allowlist id/prompt prima di scrivere candidate; lezioni reali C3-L06–L10 e loro fondazioni C3-L01–L05 lette integralmente. Nessuna opzione, risposta, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche congelate in Git prima dell’autoria: B sui cinquanta A001–050 in 030d4658b17ea6f6fd43be03cb59b21e91030eb0, primaria SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80, modello SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, Git-inputs f7d68ecf. A sui cinquanta B051–100 in 93ea8d3c1ba874bfbf74d4734ce136b319a9ca72, primaria SHA 13a65d52b70957d49eec44e4e1b9ce6d4e99c7cb3cc5d1e1418f9f4967aade8f; modello 92090ea0d2011c79dda93181542f7a09746396ff, recupero b374cab44db567ea0ffc1a510bae874945a5fdb7. Di questi ultimi file ricevuti soltanto hash/percorso: mai aperti durante l’autoria.

ID, corso, competenza, famiglia, difficoltà, prerequisiti, ordine e flag exam originali sono preservati individualmente. Ogni nuova versione ha baseVersion uguale alla versione originale e version aumentata di uno. Non sono varianti artificiali di una sola famiglia. L’assembler unico e l’importatore editoriale canonico restano invariati; dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}, non attribuita a questa autoria.

Due assembly vere identiche e import canonico col budget originale di 60 s: dieci DRAFT salvati, poi zero salvati e dieci invariati in SQLite temporaneo. I 991 pubblicati e tutti i live head storici restano invariati. Operazioni sotto mutex e guardia almeno 2 GiB. PNG nativo completo e XML finali realmente aperti e letti: solo asset, nessuna UI prodotto. Eventuali edizioni iniziali e ricevute sono conservate, non riattribuite. SCI propria, UI prodotto e approvazione umana NOT_RUN; pubblicazione DRAFT.

Nota geometrica per il revisore: nel primo pannello 5 coordinate intrinseche corrispondono a 1 J per entrambe le barre; 35 J → 175 e 60 J → 300. Nel diagramma p–V le scale sono 80 coordinate/L e 6/5 coordinate/kPa, con origine (140,850). La retta collega (220,610) e (460,730), quindi il trapezio rappresenta correttamente 450 J. Il pistone inferiore è schematico, senza una metrica comune fra area e avanzamento. Prima resa autentica archiviata perché la label 150 J era vicina alla freccia: finale con sola label spostata, nuovo render e nuovi assembly/import reali.

## C3-Q051 — Espandersi può ridurre l’energia interna

Versione 2, base 1; famiglia espansione-con-apporto-limitato; difficoltà 2.

Modello e procedura manuale: Prima determino il lavoro di volume, poi applico il bilancio. L’aumento è 1/2 L; moltiplicato per 120 kPa dà 60 J, perché kPa·L=J. Il gas riceve 35 J come calore ma ne trasferisce 60 J all’esterno come lavoro: la sua energia interna diminuisce di 25 J. L’espansione non implica da sola un aumento di U.

Leggi e passaggi: \Delta V=\frac12\,\mathrm L;  W=p_{\rm est}\Delta V;  W=60\,\mathrm J;  \Delta U=Q-W;  \Delta U=-25\,\mathrm J

Risposta d’autore proposta: -25 J.

Distrattori e controlli: 95 J sommerebbe i due trasferimenti come entranti, mentre il lavoro è uscente. 35 J ignorerebbe il pistone e −60 J ignorerebbe il calore ricevuto. Per controllare l’inversa, Q=ΔU+W=−25 J+60 J=35 J.

## C3-Q052 — L’agitatore attraversa il confine energetico

Versione 2, base 1; famiglia scambiare-energia-con-un-agitatore; difficoltà 2.

Modello e procedura manuale: La parete adiabatica impone Q=0, ma l’albero dell’agitatore trasferisce energia come lavoro. Con W definito uscente, un lavoro fatto sul liquido ha W<0 e ΔU=−W>0. La rigidità annulla il lavoro di variazione del volume, non il lavoro dell’albero. Confrontando stati fermi si evita di confondere l’energia interna con un moto macroscopico residuo.

Leggi e passaggi: Q=0;  W_{\rm sul\ liquido}>0;  W=-W_{\rm sul\ liquido};  \Delta U=W_{\rm sul\ liquido}>0

Risposta d’autore proposta: Aumenta per il lavoro ricevuto dall’agitatore.

Distrattori e controlli: Chiuso significa conservare materia, non impedire energia. Adiabatico impedisce il calore e non ogni lavoro. L’energia cinetica del recipiente come un tutto non è la sua energia interna.

## C3-Q053 — Una compressione con lavoro uscente positivo

Versione 2, base 1; famiglia convenzione-per-una-compressione; difficoltà 1.

Modello e procedura manuale: La pressione esterna è positiva, mentre dV è negativo in compressione. Ogni contributo p_est dV al lavoro uscente è quindi negativo. È l’ambiente a fornire lavoro al gas; chiamarlo negativo non significa che l’energia trasferita abbia un modulo negativo.

Leggi e passaggi: p_{\rm est}>0;  dV<0;  W=\int p_{\rm est}\,dV<0

Risposta d’autore proposta: Negativo.

Distrattori e controlli: Positivo userebbe la convenzione opposta, lavoro fatto sul gas. Nullo richiederebbe assenza di lavoro, incompatibile con pressione positiva e diminuzione di volume. Il segno di Q non è stabilito dal solo segno del lavoro.

## C3-Q054 — Ricostruire il calore dal bilancio

Versione 2, base 1; famiglia recuperare-il-calore-da-due-misure; difficoltà 1.

Modello e procedura manuale: Il primo principio è ΔU=Q−W. Per isolare il calore porto il lavoro dall’altro lato: Q=ΔU+W. La somma algebrica −75+120 dà +45 J, quindi il gas assorbe calore pur diminuendo la propria energia interna: il lavoro uscente è maggiore del calore ricevuto.

Leggi e passaggi: \Delta U=Q-W;  Q=\Delta U+W;  Q=(-75+120)\,\mathrm J;  Q=45\,\mathrm J

Risposta d’autore proposta: 45 J.

Distrattori e controlli: −195 J sottrarrebbe di nuovo il lavoro invece di isolarlo. 195 J sommerebbe i moduli perdendo il segno di ΔU; −75 J confonderebbe trasferimento di calore e variazione di energia interna. Sostituendo 45−120 si ritrovano −75 J.

## C3-Q055 — L’area sotto una pressione lineare

Versione 2, base 1; famiglia area-di-un-percorso-inclinato; difficoltà 2.

Modello e procedura manuale: Il lavoro è l’area orientata sotto il cammino p–V. La linearità rende la pressione media la semisomma degli estremi: 150 kPa. L’intervallo di volume è 3 L, perciò l’area del trapezio vale 150·3=450 J. La media degli estremi è giustificata dalla retta, non da una regola generale per ogni curva.

Leggi e passaggi: \Delta V=3\,\mathrm L;  \bar p=\frac{200+100}{2}\,\mathrm{kPa};  \bar p=150\,\mathrm{kPa};  W=\bar p\Delta V;  W=450\,\mathrm J

Risposta d’autore proposta: 450 J.

Distrattori e controlli: 600 J userebbe solo la pressione iniziale e 300 J solo la finale. 150 J è soltanto il contributo triangolare sopra la pressione finale; manca il rettangolo da 300 J. −450 J invertirebbe il verso del cammino.

## C3-Q056 — Gli estremi di pressione non danno l’area

Versione 2, base 1; famiglia stessa-pressione-lavoro-diverso; difficoltà 2.

Modello e procedura manuale: Il lavoro somma contributi p dV, quindi misura un’area con segno nel piano p–V. Conoscere due pressioni non determina né gli intervalli di volume né la forma della curva. Persino fissando gli stessi stati estremi si possono scegliere cammini diversi con aree differenti.

Leggi e passaggi: W=\int_{V_i}^{V_f}p(V)\,dV

Risposta d’autore proposta: No: servono il percorso p–V e gli estremi di volume.

Distrattori e controlli: Una differenza di pressione ha unità Pa e non è un lavoro. Il lavoro non è funzione di stato e la lentezza non impone dV=0. Si può misurare o calcolare il lavoro quando il percorso e le grandezze necessarie sono noti.

## C3-Q057 — Dare un nome all’energia microscopica

Versione 2, base 1; famiglia il-nome-del-contenuto-energetico-microscopico; difficoltà 1.

Modello e procedura manuale: U è l’energia interna. Include i contributi microscopici compatibili con il modello del sistema. Calore e lavoro indicano modi con cui energia attraversa un confine durante un processo; non sono quantità contenute nel corpo con quel nome. La traslazione del recipiente appartiene invece all’energia cinetica macroscopica.

Leggi e passaggi: \Delta U=U_f-U_i

Risposta d’autore proposta: Energia interna.

Distrattori e controlli: La pressione non ha unità di energia. La sola energia cinetica del centro di massa esclude proprio i contributi microscopici richiesti. Tornare allo stesso stato ripristina U, senza imporre che ogni trasferimento sia stato nullo.

## C3-Q058 — Dal movimento del pistone al volume

Versione 2, base 1; famiglia dal-pistone-al-lavoro; difficoltà 2.

Modello e procedura manuale: La variazione di volume è area per avanzamento: 25·4=100 cm³, cioè 1/10 L. Moltiplico per 100 kPa e ottengo 10 J. In alternativa converto area e spostamento in SI: A=1/400 m² e s=1/25 m danno ΔV=1/10000 m³; la pressione è 100000 Pa.

Leggi e passaggi: \Delta V=A s;  \Delta V=100\,\mathrm{cm^3};  \Delta V=\frac1{10}\,\mathrm L;  W=p_{\rm est}\Delta V;  W=10\,\mathrm J

Risposta d’autore proposta: 10 J.

Distrattori e controlli: 100 J richiederebbe un litro invece di 1/10 L. 10000 J tratterebbe il numero 100 del volume in cm³ come litri. Il segno negativo descriverebbe invece un pistone che rientra. Il prodotto ha dimensione Pa·m³=J.

## C3-Q059 — Cambiare osservatore non riscalda il recipiente

Versione 2, base 1; famiglia energia-interna-e-traslazione; difficoltà 2.

Modello e procedura manuale: La velocità del recipiente come un tutto dipende dal riferimento, quindi cambia il contributo cinetico del centro di massa. L’energia interna classica si riferisce ai moti e alle interazioni microscopiche rispetto al centro di massa; lo stesso stato non viene riscaldato passando a un altro osservatore. Non si sta accelerando fisicamente il recipiente.

Leggi e passaggi: E_{\rm cin,CM}=\frac12 M V_{\rm CM}^{,2}

Risposta d’autore proposta: L’energia cinetica macroscopica, non l’energia interna dello stesso stato.

Distrattori e controlli: Il cambio di descrizione non aggiunge materia né forza un flusso di calore nella parete. Nel riferimento del centro di massa la sua energia cinetica macroscopica è zero, ma U può restare non nulla. L’isolamento termico non rende nulla ogni forma di energia.

## C3-Q060 — Aumentare U senza calore

Versione 2, base 1; famiglia lavoro-ricevuto-in-una-trasformazione-adiabatica; difficoltà 1.

Modello e procedura manuale: L’assenza di calore dà Q=0. Il bilancio diventa ΔU=−W, quindi W=−ΔU=−180 J. Occorre un lavoro di modulo 180 J fatto sul gas; il valore negativo esprime il verso rispetto alla convenzione uscente.

Leggi e passaggi: Q=0;  \Delta U=-W;  W=-\Delta U;  W=-180\,\mathrm J

Risposta d’autore proposta: -180 J.

Distrattori e controlli: +180 J sarebbe lavoro uscente e ridurrebbe U di 180 J. Zero renderebbe nullo anche ΔU nel modello; 360 J introdurrebbe un fattore privo di origine nel bilancio. Il termine lavoro non va confuso con calore solo perché entrambi si misurano in joule.
