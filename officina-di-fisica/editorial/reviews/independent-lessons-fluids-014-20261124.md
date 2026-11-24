# Revisione indipendente AI — lessons-fluids-014

Letti integralmente **C2-L003..C2-L006**, versione 1, tutti esistenti come lezioni nelle fonti reali: **25 blocchi**, formule, didascalie e quattro SVG originali, esaminati sia come XML sia in anteprime individuali. Revisore AI separato dall'autore storico e dagli autori delle nuove bozze; nessun authoring o chiave usato come oracolo. **4 originali PASS, 0 FAIL, 58 controlli esatti** con SymPy 1.14.0, Pint 0.25.2 e frazioni. Nessuna approvazione umana o pubblicazione: `humanApproval=NOT_RUN`, `publicationAction=NONE`, originali conservati. Nessun candidato, asset, registro o checkpoint modificato.

Fonte: Git `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/C2.json`, SHA256 file `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23`. I quattro ID erano anche `ACCOUNTED`, revisione `NOT_RUN`, nel checkpoint letto `bdd6171e789ceb7c06961ed7f9501545e818e011723291e5664de613c4c627ed`; nessuna assenza o provenienza è stata dedotta solo dal nome atteso. Record canonici e asset confrontati realmente con Git.

| ID | SHA256 canonico dell'intero record letto | Esito / controlli |
|---|---|---|
| C2-L003 | `c4f7f2f1b18364a7c7f385dedc37be5edae78d97ce759454461f33c4be3fea61` | PASS / 13 |
| C2-L004 | `f11680573b89e237ea222e1274184768269363e6fe62b5d3884ede4dd855a2ca` | PASS / 17 |
| C2-L005 | `74d33cc6dcc108f2ec81b20ab8335768bab52aa834b78e718f8a3f6840cc101b` | PASS / 16 |
| C2-L006 | `6bac962d14b5a716e3373bedcf9673cf16faab3135af5ad83441cb846bf7f37c` | PASS / 12 |

## C2-L003 — pressione trasmessa e pressa

Controllati principio di Pascal come trasmissione dell'incremento di pressione, differenza fra pressione e forza, riferimento atmosferico, aree, idealità dei pistoni e manovra lenta. La formula `Delta p=F1/A1=F2/A2` usa gli incrementi normali dovuti al carico, al netto dell'atmosfera, come specifica direttamente il testo. Da questa ricavo `F2=F1 A2/A1`. Il vincolo incomprimibile senza perdite dà `A1s1=A2s2`, con s moduli, quindi `s2=A1s1/A2`. Il prodotto verifica `F2s2=F1s1` nel modello ideale assegnato: non si può guadagnare contemporaneamente forza e corsa.

**Prova costruita dal revisore**, non esercizio numerico della lezione: rapporto aree 4, forza d'ingresso 5 N e corsa 8 cm danno forza 20 N, corsa 2 cm e lavori entrambi 2/5 J. Pa=N/m², A·s è volume e F·s è lavoro. Tutta l'aritmetica è frazionaria manuale.

Controllato esplicitamente il limite già rilevante nell'esempio storico E005. Questa lezione dice direttamente che si trascurano le correzioni «idrostatiche, inerziali e dissipative»; non è un'ipotesi aggiunta dal revisore. Il PASS è circoscritto a quel modello. Quote inizialmente uguali **da sole** non eliminerebbero la variazione di quota lungo una corsa finita reale. Mantenendola, con pistone piccolo che scende x e grande che sale xA1/A2, il dislivello cresce come `x(1+A1/A2)`. Risulta

`F2(x)=F1 A2/A1−rho g A2 x(1+A1/A2)`.

Integrando il lavoro d'uscita si ottiene una differenza rispetto a F1s1 pari a `rho g A1 s1²(1+A1/A2)/2`, trasferita all'energia gravitazionale del liquido. Il rapporto di questa correzione con il lavoro d'ingresso tende a zero per corsa piccola; non è nullo per una corsa arbitraria nel modello con gravità conservata. Questo controllo del dominio escluso impedisce di certificare una legge universale di lavoro uguale. **Il giudizio separato FAIL dell'edizione originale C2-E005 resta immutato**; non è riaperto o trasformato retroattivamente in PASS dalla presente lezione.

`C2-pressa.svg`: pistoni alla stessa quota, destro più largo, freccia d'ingresso verso il basso e uscita verso l'alto. Nessuna scala numerica di area o forza: frecce di lunghezza simile indicano i versi, non forze uguali. La figura è la configurazione di riferimento; non dice che le quote restino uguali mentre i due pistoni si spostano in versi opposti.

## C2-L004 — Archimede e galleggiamento

Letti risultante delle pressioni su una superficie chiusa, sostituzione con il liquido spostato, significato del volume che effettivamente esclude liquido, indipendenza dalla profondità a volume e densità costanti, peso, galleggiamento libero, densità media di un corpo cavo e forza di un eventuale vincolo. La condizione di corpo non appoggiato sul fondo e le ipotesi della relazione di galleggiamento sono esplicite.

Derivazione indipendente per un parallelepipedo di base A e altezza H: la pressione superiore è `p0+rho g d`, quella inferiore `p0+rho g(d+H)`. La differenza moltiplicata per A dà `rho g AH`; le pressioni laterali si compensano. La parte costante p0 e la profondità d si cancellano dalla risultante, pur crescendo la pressione su ciascuna faccia. Il risultato è il peso del fluido escluso. Equilibrando S con `rho_corpo_media Vtot g` ricavo `Vimmerso/Vtot=rho_corpo_media/rho_fluido`. Il dominio richiede frazione in [0,1], oltre a sola gravità e spinta, aria trascurata; densità del corpo maggiore del fluido non permette galleggiamento libero.

**Prove del revisore**, non numeri assegnati: 600 kg/m³ in 1000 kg/m³ dà frazione 3/5. Un litro di tale corpo completamente immerso, con g assegnata 10 m/s², ha S=10 N e P=6 N: servono 4 N verso il basso da un vincolo. Un corpo da 1200 kg/m³, volume 1 L, ha invece risultante libera S−P=−2 N anche immerso completamente. Per un oggetto cavo chiuso, pareti da 3000 kg/m³ e volume materiale 10 mL danno massa 30 g; su un volume esterno di 100 mL che esclude il liquido la densità media è 300 kg/m³ e il volume immerso all'equilibrio 30 mL. Non conto come liquido spostato una cavità aperta già allagata: il testo aveva definito il volume mediante esclusione del liquido.

`C2-spinta.svg`: blocco in parte emerso e in parte immerso, livello libero tratteggiato; S e P hanno aste uguali di 77 px, coerenti con equilibrio libero. Il volume pertinente è la parte sotto la superficie. Non sono assegnati densità o scala metrica; non deduco un rapporto numerico dalla frazione grafica.

## C2-L005 — portata, continuità, reti e accumulo

Verificati definizione volumetrica, componente normale media sulla sezione, costruzione AvΔt per velocità uniforme perpendicolare, unità, portata di massa, stazionarietà, biforcazioni, condizione di densità costante per passare dai bilanci di massa a quelli di volume, validità anche con viscosità, aree totali dei rami e volume accumulato in un recipiente che si riempie.

Da `Q=integrale(v_n dA)` segue la media di area `Q/A`, non il massimo del profilo. Integro indipendentemente il profilo parabolico `vmax(1−r²/R²)`: `Q=pi R² vmax/2`, velocità media `vmax/2`. Nel modello monodimensionale con densità uniforme su ciascuna sezione, come per il liquido omogeneo introduttivo, `mdot=rho Q`; il bilancio stazionario dà `rho1 A1 vmedia1=rho2 A2 vmedia2`, e con densità uguali si riduce a `A1vmedia1=A2vmedia2`. Non estendo il prodotto di medie a sezioni con densità e velocità non uniformi correlate: servirebbe l'integrale del flusso di massa. La viscosità può cambiare il profilo, non invalidare la conservazione della massa. Per un intervallo temporale in moto variabile, ΔV/Δt è la portata media temporale.

**Prove del revisore**: 4 cm³/s attraversano 4 cm² a 1 cm/s e 1 cm² a 4 cm/s. Quattrocento rami paralleli di raggio R/10 hanno area totale `400pi(R/10)²=4piR²`; a portata totale comune, la velocità media del letto è un quarto di quella nella sezione piR². Il bilancio con accumulo è `dV/dt=Qin−Qout`; ingresso 3 mL/s, uscita 1 mL/s per 5 s danno 10 mL accumulati. Solo ponendo accumulo zero si può imporre l'uguaglianza dei flussi. Nessun valore è una calibrazione reale di un letto vascolare o di prestazioni di studenti.

`C2-condotto.svg`: sezioni verticali tratteggiate nel tratto largo e stretto; freccia nella parte stretta più lunga. Lunghezze 54 e 111 px verificano solo l'ordine dei versi/moduli schematici. Non sono dichiarate area numerica, velocità numerica o sezione circolare: non quadro la larghezza disegnata per inventare un rapporto di aree.

## C2-L006 — energia lungo una linea di corrente

Controllati lavoro delle pressioni, gravità, energia cinetica per unità di volume e tutti i limiti espliciti: flusso stazionario, incomprimibile, senza dissipazione o macchine fra le sezioni, lungo la stessa linea di corrente. Per usare medie di sezione il testo richiede profili approssimativamente uniformi. La costante non è dichiarata uguale fra linee diverse senza ulteriori ipotesi. Pressione statica, termine cinetico e quota si distinguono e hanno tutti unità Pa, con z verso l'alto.

Derivazione indipendente sul volume materiale dV: il lavoro `(p1−p2)dV+rho dV g(z1−z2)` uguaglia `rho dV(v2²−v1²)/2`. Dividendo si ricava correttamente `p1−p2=rho(v2²−v1²)/2+rho g(z2−z1)`. In forma differenziale, l'equazione di Eulero stazionaria lungo la corrente rende nulla la derivata di `p+rho v²/2+rho gz`.

**Prove del revisore**: a pari quota, rho=1000 kg/m³ e velocità da 1 a 2 m/s danno caduta statica 1500 Pa. Con g assegnata 10, due piezometri danno dislivello `1500/(1000·10)=3/20 m`. Invertire idealmente le velocità restituisce 1500 Pa di recupero. Un dislivello crescente di 1/10 m aggiunge 1000 Pa alla differenza, che diventa 2500 Pa. Non sono dati di un paziente.

Verifica del dominio escluso: per il profilo parabolico precedente il fattore cinetico di flusso `alpha=integrale(v³dA)/(A vmedia³)` vale esattamente 2, non 1. Il testo non autorizza a ignorarlo fuori dal regime di profilo quasi uniforme. Il richiamo finale a stenosi e dilatazione è qualificato idealizzato; vengono nominati viscosità, pulsazioni, pareti elastiche, separazione e perdite irreversibili. Il recupero ideale non è presentato come misura clinica.

`C2-bernoulli.svg`: tubi verticali aperti, livello a sinistra più alto del destro; nella sezione larga è maggiore la testa di pressione statica. Le sezioni sono orizzontali entro l'offset grafico di circa 1 px; il dislivello di superficie 32 px non ha scala fisica assegnata. I tubi sono piezometri di pressione statica, non sonde di ristagno orientate contro la corrente.

## Integrità e limiti del giudizio

Quattro SVG immutabili, confrontati realmente con Git:

- C2-pressa.svg: `fb80bdf658d0cfc13979a52d2565a71c06f4788e49d6e6b921d746782d8808eb`.
- C2-spinta.svg: `2ecac15c1e05af22a89873203a18b57b63ba18235f8c9fd10acc52628b6a132f`.
- C2-condotto.svg: `403e01941806532289c8c82f6751978bcd4512d6235e08069cc3e7bf65bb02ba`.
- C2-bernoulli.svg: `cf0bdde00128d3ba1f7d84cedc7062963a565dcd3b263873fb08d7dcec7efa63`.

**5/5 test PASS, exit 0, 1,229 s**: identità e riproducibilità, confronto reale con Git, rifiuto di ogni lezione alterata o mancante, rifiuto di ogni figura rimossa o modificata e controlli dei domini che non trasformano le approssimazioni in leggi generali. Non rilevati difetti concreti delle quattro edizioni lette entro i modelli dichiarati. Nessun risultato è dedotto dalla sola presenza di una segnaletica, dall'assenza di answer o da un richiamo teorico non risolto. Le prove aggiunte sono calcoli del revisore, non prestazioni osservate o attività numeriche imposte dal testo.

Report originali/effective uguali perché non servono nuove edizioni per questi quattro record. Questa review non cambia altri giudizi storici, non certifica altre famiglie, browser o pubblicazione e non costituisce approvazione umana.

- Verificatore SHA256: `365c4f8c6ff1f45de6bc033fbae35221488f75c32e6cd403e4957a79ff34187c`.
- Test SHA256: `779277c95e87cc38229c91e67fb30e354724650669c36157025855b88cf44a6d`.
- Entrambi i report SHA256 file: `198ec1e2b6647b614ff682aa080f2635e6f704b2aa5b6f42345a077854f14cd6`.
- Digest canonico JSON di ciascun report: `9057ff9eeb9899943a175fd88cd4ceb4fac12f01f01292a1a09568e1db753edc`.
- Contratto SHA256 letto dal report: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`.
