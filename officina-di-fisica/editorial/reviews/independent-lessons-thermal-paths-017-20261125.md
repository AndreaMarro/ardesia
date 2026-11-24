# Revisione indipendente AI — lessons-thermal-paths-017

Letti integralmente **C3-L05..C3-L08**, quattro lezioni originali versione1, **30 blocchi** con tutte le formule, testo e didascalie. Esaminati XML e anteprime individuali delle quattro figure. Revisore AI distinto dall'autore storico; nessun authoring, risposta chiave o flag di revisione preesistente usato come oracolo. **4 PASS,0 FAIL,54 controlli esatti** con SymPy1.14.0, Pint0.25.2 e frazioni. Nessuna nuova edizione necessaria entro i modelli letti; report originali/effective identici. Nessuna modifica a fonti, asset, candidati, registro, checkpoint o runtime. `humanApproval=NOT_RUN`, `publicationAction=NONE`, originali conservati.

Fonte effettiva Git `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/C3.json`, SHA256 file `44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0`. I quattro ID sono stati riscontrati anche `ACCOUNTED/NOT_RUN` nel checkpoint letto `f3eb9b9c321de4b8332c56d8d0fb9defb2d2671833aae3dc25976baff1c07033`, senza dedurne la presenza dal solo nome atteso.

| ID | SHA256 canonico dell'intero record letto | Esito / controlli |
|---|---|---|
| C3-L05 | `e5d6023249016be7b946a4f39d56500a074b24c91a52f6dc83ff270eb593ee8b` | PASS / 16 |
| C3-L06 | `786a58a1fdd9690ef30134a8b61dc46dbe24afe66933bad555853c50c173c727` | PASS / 12 |
| C3-L07 | `54b71deb97e5651a0dfbdd7db4eb6ab02707ef1d9613bdc3b7c2acfcea612d82` | PASS / 14 |
| C3-L08 | `ba1507cbec7061182e0c2e2c8c4a33a3f33cc9293200870a8a0aa017b6761b14` | PASS / 12 |

## C3-L05 — conduzione, convezione e irraggiamento

Controllati descrizione dei tre meccanismi, condizioni della lastra omogenea stazionaria, temperature delle facce fissate e perdite laterali trascurate, gradiente e spessore lungo il flusso, unità di lambda, temperatura stazionaria compatibile con potenza non nulla, convezione forzata/naturale, trasporto elettromagnetico nel vuoto e bilancio radiativo di superficie grigia nella grande cavità isoterma.

Derivazione indipendente dal profilo `T(x)=Th+(Tc−Th)x/s`: gli estremi danno Th e Tc separatamente; `P=−lambda A dT/dx=lambda A(Th−Tc)/s`, costante lungo x. Qui lambda è il coefficiente costante/equivalente del modello monodimensionale; Th>Tc definisce P come modulo positivo, coerente con `|Q|/Delta_t`. Aumentare s raddoppiandolo dimezza P; raddoppiare insieme A e s lascia P invariata. W/(m·K)·m²·K/m=W. **Prova del revisore**, non esercizio assegnato: lambda=1/2W/(m·K),A=2m²,DeltaT=20K,s=1/10m danno200W;10cm=1/10m esatto.

La convezione naturale è presentata correttamente come possibile moto per differenze di densità in gravità, senza affermare che ogni corpo caldo debba sempre salire. **Prova illustrativa del revisore**: densità ambiente1000 e porzione990kg/m³, volume1L e g assegnata10m/s² danno forza di galleggiamento relativa1/10N verso l'alto. La convezione forzata può invece essere prodotta dalla pompa. Il richiamo alla conduzione vicino alla superficie non confonde trasporto e solo moto macroscopico.

Per l'irraggiamento verificati emissività fra0 e1, grande involucro isoterma e temperature assolute. Ogni termine `epsilon sigma A T⁴` ha unità W; il segno è potenza netta uscente. A Tcorpo=Tamb il netto è0 anche se emissione e assorbimento individuali sono non nulli. La **prova del revisore** con Tcorpo=2Tamb dà potenza netta `15 epsilon sigma A Tamb⁴`, mentre la sola emissione è16 volte quella a Tamb: non confondo questi due confronti. Scambiare corpo e ambiente inverte il segno. La derivata rispetto a uno spostamento arbitrario dell'origine della scala, nel punto zero dello spostamento, è `4epsilon sigma A(Th³−Tc³)`, in generale non nulla: usare Celsius al posto dei kelvin altererebbe fisicamente il risultato.

`C3-parete.svg`: faccia calda a sinistra, fredda a destra, freccia di potenza verso destra attraverso la parete; s fra le due facce, nella direzione del flusso. Testo e legenda stazionaria coincidono. Nessuna scala numerica di temperatura, energia o conducibilità è assegnata.

## C3-L06 — primo principio e lavoro esterno

Letti selezione del gas come sistema, contenuto microscopico di U, esclusione della traslazione del recipiente, convenzione Q entrante/W uscente, segno di espansione e compressione, pressione esterna costante, identità kPa·L, condizione per usare il cammino interno p–V e avviso sulle trasformazioni rapide non uniformi. Il modello termodinamico riguarda stati del gas senza variazioni di energia macroscopica cinetica/potenziale; eventuali cambiamenti di tali energie richiederebbero contabilità aggiuntiva, non una modifica tacita di U.

Controllo indipendente dell'esclusione della traslazione: due particelle uguali con velocità `vCM+u` e `vCM−u` hanno energia cinetica totale `m vCM²+m u²`; sottraendo quella del centro di massa resta `m u²`, indipendente da vCM. La temperatura/energia interna non comprende la velocità coerente dell'insieme.

Per il lavoro di pressione esterna del modello, la forza sulla sezione è p_est A e la corsa è DeltaV/A: il prodotto dà p_est DeltaV, uguale all'integrale di p_est costante in V. p_est è la pressione meccanica opposta al confine del gas: non sostituisco una pressione interna uniforme inventata durante un moto rapido. La fonte limita esplicitamente l'area del cammino interno p–V all'equilibrio meccanico quasi statico. Eventuali energie macroscopiche di apparati o altre modalità di lavoro non sono ricavate dal solo carico atmosferico senza bilancio completo.

Il calcolo effettivamente scritto nella fonte è esatto: `1kPa·1L=(1000Pa)(1/1000m³)=1J`, verificato con Pint. **Prove del revisore**:2kPa per+3L danno+6J, per−3L danno−6J. Q=20J,W=5J danno DeltaU=15J; compressione adiabatica con W=−10J dà DeltaU=+10J. Q=+5J e W=+8J danno invece DeltaU=−3J: il contributo positivo del calore entrante non garantisce da solo riscaldamento se il lavoro uscente è maggiore. Per quantità/composizione fisse del gas ideale, tornare alla stessa T riporta U al medesimo valore, pur potendo avere Q e W entrambi non nulli. Nessuno di questi numeri è un esercizio obbligatorio aggiunto al materiale.

`C3-bilancio.svg`: freccia Q verso il sistema e W dal sistema all'esterno, formula DeltaU=Q−W coerente. Le lunghezze simili delle frecce non assegnano Q=W né un valore di energia; indicano la convenzione dei segni.

## C3-L07 — vincoli, isoterma e adiabatica reversibile

Controllati assi e stati quasi statici, lavoro nullo della isocora, rettangolo della isobara, riscaldamento del gas ideale chiuso durante espansione a p costante, pV costante in isoterma, calore compensatore nell'espansione reversibile, parete adiabatica e raffreddamento per lavoro uscente, distinzione fra processo lento e reversibile, capacità molari costanti e potenza gamma soltanto per adiabatica reversibile.

Da pV=nRT, a p fissa `dT/dV=p/(nR)>0`. La isoterma ha p=nRT/V; **estensione simbolica del revisore**, non richiesta numerica dello studente, per raddoppio di volume il lavoro reversibile è esattamente nRT ln2. Si può lasciare ln2 simbolico; la lezione non pretende un decimale ottenuto senza procedimento manuale. Poiché DeltaU=0, Q=W. Nell'adiabatica Q=0 dà DeltaU=−W; lavoro uscente positivo e capacità positiva significano raffreddamento.

Derivazione indipendente del vincolo più forte: da `nCv dT=−nRT dV/V` ricavo `TV^(R/Cv)=costante`. Sostituendo nell'equazione di stato, `pV^gamma=costante`, con `gamma=1+R/Cv=Cp/Cv>1`. Verificati differenziale energetico e derivata logaritmica dell'invariante. La pendenza logaritmica è−gamma, più negativa di−1 dell'isoterma dallo stesso punto: l'adiabatica reversibile scende più rapidamente. Q=0 **da solo** non autorizza la potenza gamma se il processo è dissipativo.

**Prova manuale del revisore** monatomica con gamma5/3: aumentare V di un fattore8=2³ porta T al quarto e p a1/32; l'isoterma porterebbe p solo a1/8. Con stato iniziale32kPa e1L, finale adiabatico1kPa e8L, il lavoro è `(32J−8J)/(5/3−1)=36J`. Frazioni e potenze intere eliminano ogni necessità di calcolatrice. Non sono valori assegnati dalla fonte.

La controprova di irreversibilità è effettiva: attrito F su percorso D dissipa `Pdurata=(Fv)(D/v)=FD`, il cui limite per v→0 rimane positivo. La trasformazione può essere arbitrariamente lenta e lasciare comunque una modifica nell'ambiente. Questa è la ragione del corretto avviso della lezione, non un'assimilazione di quasi statico e reversibile.

`C3-percorsi.svg`: comune A(167,86); isocora verticale, isobara orizzontale e due curve decrescenti. Entrambe hanno153 vertici con le stesse ascisse; in tutti i152 punti successivi ad A la curva adiabatica ha pressione minore dell'isoterma e rimane sopra l'asse. Il disegno non assegna gamma numerico o scale p/V: controllo l'ordine qualitativo e il medesimo stato iniziale, senza inventare una misura.

## C3-L08 — ciclo, area orientata e calore netto

Letti ritorno allo stesso stato completo, energia interna ed entropia del fluido come funzioni di stato, possibili scambi ciclici non nulli, quattro lati del rettangolo, segno del lavoro per verso, calore netto e necessità di scale per misurare l'area. Il ritorno dell'entropia del fluido non è descritto come ritorno a zero dell'entropia complessiva di fluido e ambiente.

Integro i due lati orizzontali: `WAB=pAlta(Vgrande−Vpiccolo)`, `WCD=−pBassa(Vgrande−Vpiccolo)`; i lati verticali hanno dV=0. Il totale è `(pAlta−pBassa)(Vgrande−Vpiccolo)>0` per il percorso orario indicato; invertirlo cambia segno. Le differenze di U e S fra i quattro stati si cancellano esattamente sul ciclo. Dal primo principio con DeltaUciclo=0 segue Qnetto=Wnetto, non Qassorbito=Wnetto.

**Prove del revisore**: pAlta=3kPa,pBassa=1kPa,Vgrande=4L,Vpiccolo=1L danno9J di espansione e−3J di compressione, totale6J; nel senso opposto−6J. Assorbire10J e cederne7 dà calore netto3J e lavoro netto3J, non10J. Se i serbatoi sono600 e300K, queste stesse quantità hanno variazione di entropia ambientale `−10/600+7/300=1/150J/K>0`, pur con S del fluido ciclica: non si certifica reversibilità dal solo ritorno del fluido. Sono casi teorici costruiti, non prove di prestazione di macchine o studenti.

`C3-ciclo.svg`: A alto-sinistra,B alto-destra,C basso-destra,D basso-sinistra. Frecce top-destra, destra-giù, basso-sinistra e sinistra-su definiscono chiaramente il ciclo orario. Espansione in alto e compressione in basso coincidono con la didascalia. Rettangolo246×91=22386px², ma senza scale p/V non si converte tale area in joule.

## Integrità, prove e hash

Quattro asset originali verificati con Git e byte locali, immutati:

- C3-parete.svg: `c7241066dc2e892527868cecb8fa7cbb1c14a2771b080d6c17b3edaf2ed4346f`.
- C3-bilancio.svg: `0e2f94b8ca3e6ee11ccd8e3d0cc40d77782dca7a43315db6928fa6259035a815`.
- C3-percorsi.svg: `3bf54a3478de1a5cc2c30b33268d91d49456b432af41d5df7b0bdd2560edb85f`.
- C3-ciclo.svg: `84d1b1fb87683ae92240d45760932a7a844a5e01da70037130d703d64690cb03`.

**6/6 test PASS,exit0,3,703s**: identità canonica e riproducibilità delle quattro review, riscontro reale con Git, rifiuto di ogni fonte alterata/omessa e ogni figura mancante/modificata, segni e unità del lavoro e casi avversi, tutti i153 vertici di ciascuna curva nel confronto di ordine qualitativo. Nessun PASS nasce da un vecchio flag o dall'assenza di answer. I controlli calcolati e le loro ipotesi sono documentati, con logaritmo lasciato esatto dove il materiale non richiede un decimale.

Limiti: giudizio AI sulle quattro edizioni lette. Nessuna approvazione umana, dato di prestazione con studenti, prova generale UI o pubblicazione. I casi numerici costruiti non cambiano le richieste della fonte. Nessun finding concreto entro i domini dichiarati e il modello termodinamico descritto.

- Verificatore SHA256: `aea3bc266e7e8c4e1272c44c43c66a13bd0ecfcc40620c6c409562fade3c11f2`.
- Test SHA256: `a5032fc5fe0d6d7270ec554586fba290dbf3a5ab9ab4912800ec8891124e92f6`.
- Entrambi i report SHA256 file: `43f1a5e6e6d9d0006f64d73fef973ad114b4539165a836fa482207c3f1ec05f5`.
- Digest canonico JSON di ciascun report: `f747ac3b2cfb7637ec0cedfdbb03fc8790acd12d00ae5f97567bd24d46c02dda`.
- Contratto SHA256 letto dai report: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`.
