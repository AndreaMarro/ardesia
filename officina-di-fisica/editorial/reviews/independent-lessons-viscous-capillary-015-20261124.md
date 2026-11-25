# Revisione indipendente AI — lessons-viscous-capillary-015

Letti integralmente **C2-L007..C2-L010**, tutti `kind=lesson`, versione 1: **26 blocchi**, formule, didascalie e quattro SVG originali, XML e anteprime individuali. Revisore AI distinto dall'autore storico e dagli autori delle nuove bozze; nessun authoring o chiave usato come oracolo. Risultato degli originali: **3 PASS, 1 FAIL (C2-L007, P2)**. Su **71 controlli**, 70 passano; l'unico negativo è il controesempio alla relazione media/metà massimo senza l'ipotesi stazionaria nel caso del tubo. Le altre derivazioni restano esplicite e valide nei propri domini.

Non ho corretto alcun candidato o fonte, né cambiato asset, registro o checkpoint. Dopo il finding, l'integratore ha scritto una **nuova C2-L007 versione 2/base 1** nel pacchetto 073; la sua lettura indipendente completa e i nuovi hash sono documentati in fondo. Il report degli originali resta **3 PASS/1 FAIL**; il report effettivo diventa **4 PASS/0 FAIL, una nuova bozza verificata**, con il FAIL storico annidato. `humanApproval=NOT_RUN`; azione `DRAFT` soltanto per la nuova edizione e `NONE` per gli altri tre originali. Nessuna prova tecnica è presentata come calibrazione di studenti.

Fonte Git `5d1dc8dc7b601aef959d10d564c75462be74708d`, `officina-di-fisica/content/C2.json`, SHA256 file `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23`. ID e provenienza riscontrati anche come `ACCOUNTED/NOT_RUN` nel checkpoint letto `bdd6171e789ceb7c06961ed7f9501545e818e011723291e5664de613c4c627ed`.

| ID | SHA256 canonico del record interamente letto | Giudizio / controlli |
|---|---|---|
| C2-L007 | `f0382da70dabd853ad1d8d6a1f8d006063f7b2f4d12327f390305169a70e3670` | FAIL P2 / 17 positivi, 1 negativo |
| C2-L008 | `a4e4ff8f537596cd3a413f09c4d730888b0e91e49c44699e2c9f58149f526ca1` | PASS / 17 |
| C2-L009 | `363e23db48dc4b256af71866af2c2db5e6cc72514b6204dd01b726e4ebf65fa4` | PASS / 14 |
| C2-L010 | `668f4bf72f97a6f77e3dc0a8e696d784012da1745358c42d99efdf9975e336d0` | PASS / 22 |

## C2-L007 — viscosità, profili e dominio mancante

Controllati gradiente trasversale, sforzo tangenziale in modulo e viscosità dinamica newtoniana, unità Pa e Pa·s, Couette, profilo nel tubo, media d'area, distinzione fra moto laminare e stazionario e numero di Reynolds. Il caso delle piastre contiene correttamente ipotesi stazionarie, sviluppo completo, gradiente di pressione nullo e aderenza. Da `eta d²v/dy²=0` e velocità U0/U1 alle due pareti ottengo `v=U0+(U1−U0)y/d`, gradiente `(U1−U0)/d`. **Prova del revisore**, non esercizio assegnato: 0,30 m/s su 2 mm danno 150 s⁻¹; viscosità 2/5 Pa·s dà 60 Pa; su 1/50 m² occorre forza 6/5 N. Le unità sono controllate realmente con Pint. Il rapporto fra scale inerziale e viscosa è rho*v*D/eta, adimensionale; non viene inventata una soglia universale di transizione.

**Finding P2, blocchi originali 3–5 (indice umano 4–6 se si conta da uno):** il caso del tubo, didascalia e formula assegnano il profilo parabolico e `vmedia=vmax/2` a moto laminare sviluppato, newtoniano e con aderenza, senza esplicitare la stazionarietà. Il testo distingue subito correttamente «laminare» da «stazionario», quindi non posso trattare quelle parole come equivalenti né importare tacitamente l'ipotesi dal precedente diverso caso delle piastre. L008, invece, specifica già stazionarietà nel proprio dominio ed è PASS.

Controesempio indipendente esatto, costruito dal revisore e non richiesto allo studente. In un tubo circolare rigido considero velocità solo assiale, indipendente dalla coordinata assiale, con raggio R e costanti positive a0,b,rho,eta:

`a(t)=a0+16 eta b t/rho`,

`v(r,t)=a(t)(R²−r²)+b(R⁴−r⁴)`,

`G(t)=−dp/dz=4 eta a(t)+16 eta b R²`.

Sostituendo nell'equazione `rho dv/dt=G+eta[d²v/dr²+(dv/dr)/r]` il residuo si semplifica esattamente a zero. La velocità alla parete è zero; il gradiente sull'asse è zero; non c'è dipendenza assiale e la continuità è soddisfatta senza velocità radiale. Per t≥0 il profilo è positivo e ordinato, massimo sull'asse. Si può scegliere un intervallo a piccola velocità e Reynolds: non è un controesempio turbolento o di ingresso non sviluppato.

L'integrale d'area dà `vmedia=aR²/2+2bR⁴/3`; il massimo è `aR²+bR⁴`, quindi

`vmedia−vmax/2=bR⁴/6 > 0`.

Con coefficienti giocattolo in SI R=1 m, rho=1 kg/m³, eta=1 Pa·s, a0=1 m⁻¹s⁻¹, b=1 m⁻³s⁻¹ e t=0: vmax=2 m/s, vmedia=7/6 m/s, non 1 m/s; Reynolds con D=2 m è 7/3. Nessuna funzione speciale o valutazione numerica difficile è necessaria. Il modello può mantenersi laminare e non parabolico vicino a quell'istante.

Riscontro primario aggiuntivo: le [note universitarie di F. Stern, University of Iowa, capitolo 3, sezione sulle correnti non stazionarie, p. 43](https://stern.lab.uiowa.edu/sites/stern.lab.uiowa.edu/files/2024-12/Chapter%203%20%285%29_2024_final-fs-cm__pagenumber.pdf) distinguono il caso di tubo sviluppato dipendente da r,t e mantengono il termine temporale nell'equazione del moto; il profilo parabolico compare come limite stazionario. La prova congelata qui è comunque il controesempio polinomiale derivato sopra, non un verdetto ricavato dalla sola citazione.

La correzione richiedeva una **nuova edizione di altro autore**, che esplicitasse le condizioni stazionarie del caso del tubo prima di applicare parabola e metà massimo. La nuova edizione indipendentemente riesaminata è documentata sotto. L'originale resta FAIL; non ho scritto o autocorretto il candidato.

`C2-profilo.svg`: la figura è geometricamente corretta per il caso stazionario. Pareti y=48/172, asse y=110, raggio grafico 62 px. La Bézier `M151 48 Q523 110 151 172` equivale esattamente a `x=151+186[1−((y−110)/62)²]`; le punte delle frecce concordano entro 1 px di arrotondamento. Non invento un difetto della parabola disegnata: manca il qualificatore del suo dominio nel testo.

## C2-L008 — Poiseuille, raggio e variabile controllata

Qui le ipotesi sono complete: tubo diritto, rigido, circolare, orizzontale, raggio uniforme, fluido incomprimibile newtoniano, moto laminare **stazionario**, sviluppato e con aderenza. La pressione d'ingresso meno quella d'uscita è positiva nel verso di Q. Non ci sono giustificazioni cliniche implicite: il testo limita l'applicazione a condotte fisiologiche pulsanti, deformabili e con reologia più complessa.

Da equilibrio della porzione cilindrica ricavo `eta dv/dr=−Delta_p*r/(2L)` e, integrando rispetto alla parete ferma, `v=Delta_p(R²−r²)/(4etaL)`. L'integrale `2pi integrale(r v dr)` dà `Q=pi R⁴ Delta_p/(8etaL)`. Di conseguenza `Rh=8etaL/(pi R⁴)`. Media e area scalano entrambe come R²; la quarta potenza non è uno slogan non verificato. A pressione controllata, dimezzare il raggio dà `(1/2)^4=1/16` della portata; a portata controllata serve 16 volte la caduta di pressione. Raddoppiare viscosità o lunghezza dimezza Q. Le unità sono m³/s e Pa·s/m³, senza confondere raggio e diametro.

**Prova del revisore**, non numero imposto dal testo: R=1 mm=1/1000 m, eta=1/1000 Pa·s, L=1/10 m e Delta_p=8 Pa danno `Q=pi/10^8 m³/s=pi/100 mL/s`, lasciando pi esatto. Integro anche la dissipazione viscosa `eta(dv/dr)²` sul tubo: la potenza è esattamente Delta_p·Q. Il lavoro continuo delle pressioni va quindi in dissipazione, coerentemente con il modello viscoso, senza invocare un Bernoulli senza perdite.

`C2-raggio.svg`: due tubi di confronto separati, cerchi di raggi 66 e 33 px; rapporto esatto 1/2. Didascalia e titolo fissano la stessa pressione, lunghezza e viscosità. Le frecce rosse indicano raggi, non portate; non si tratta di una strozzatura in serie con portata necessariamente comune.

## C2-L009 — serie, parallelo e limite di ramo chiuso

Verificati nodi a pressione comune, regime stazionario incomprimibile e resistenze lineari positive finite. In serie elimino la pressione del nodo intermedio dalle due equazioni e ricavo `Q=(pa−pb)/(R1+R2)`. In parallelo sommo `(pa−pb)/R1+(pa−pb)/R2`, da cui `Req=R1R2/(R1+R2)`. I controlli esatti `R1−Req=R1²/(R1+R2)>0` e analogo per R2 dimostrano il limite inferiore ai due rami; in serie si aggiunge un contributo positivo. Il limite R2→infinito riporta Req a R1 e la portata nel ramo 2 a zero. Le condizioni elastiche o pulsanti reali restano escluse come dichiara la lezione.

**Prove del revisore**: R1=2 e R2=4 Pa·s/mL, pressioni ai nodi 22 e 4 Pa. In serie Q=18/6=3 mL/s, pressione intermedia 22−2·3=16 Pa. In parallelo Req=8/6=4/3 Pa·s/mL e Qtot=18/(4/3)=27/2 mL/s. La potenza ai nodi uguaglia la somma delle potenze nei rami; Pa·m³/s=W. Nessun parametro è presentato come dato biologico misurato o prestazione dello studente.

`C2-reti.svg`: riga superiore percorre R1 e poi R2; riga inferiore ha due rami che congiungono la medesima coppia di nodi. Etichette, didascalia e topologia coincidono. Le lunghezze disegnate non sono valori di resistenza.

## C2-L010 — energia superficiale, capillarità e Laplace

Tutte le forme quantitative sono state risolte e controllate, benché il testo le qualifichi approfondimenti illustrativi di un obiettivo qualitativo. Non vengono dispensate dalla verifica perché manca una risposta numerica. Le condizioni assegnate mantengono gamma costante; ΔA conta le interfacce fisiche. L'energia di una singola interfaccia creata da un bordo rettilineo mobile è `gamma ell dx`, quindi F=gamma ell; un film di sapone ne ha due e dà 2gamma ell. La formula non è interpretata come somma scalare delle trazioni vettoriali su un bordo chiuso arbitrariamente curvo. J/m²=N/m verificato con Pint.

La sfera libera satura il vincolo isoperimetrico geometrico `A³≥36pi V²`; verifico esattamente l'uguaglianza con A=4piR² e V=4piR³/3. Suddividere in due sfere di metà volume aumenta l'area totale del fattore 2^(1/3)>1. Non uso questo singolo confronto come prova universale del teorema geometrico. La minimizzazione dell'energia superficiale vale per gamma uniforme e gocce libere piccole; gravità e supporti possono alterare le forme, come il testo dichiara.

La componente verticale sulla circonferenza del capillare è `2pi r gamma cos(theta)`; uguagliando il peso `rho g pi r² h` ricavo `h=2gamma cos(theta)/(rho g r)`. Theta è misurato attraverso il liquido fra parete e interfaccia. Per theta=0 la salita è positiva, per theta=90° zero, per theta=120° negativa; dimezzare r raddoppia l'altezza firmata. Le ipotesi dichiarate sono equilibrio, capillare circolare sottile, uguale atmosfera, densità del gas trascurabile e piccole correzioni del menisco ignorate. Non viene ricavata un'altezza dai pixel.

Per una goccia sferica con una interfaccia, `d(gamma A)/dV=2gamma/R`. Per due interfacce di un film sottile è 4gamma/R. Controllo esplicitamente il limite della somma con raggi diversi `2gamma/R+2gamma/(R+epsilon)` per epsilon→0: vale 4gamma/R; non sostituisco tale approssimazione a un film di spessore arbitrario. Il limite di curvatura nulla R→infinito dà sovrapressione zero e raggio dimezzato raddoppia la pressione.

**Prove del revisore**, non esercizi assegnati: 50 mN/m=1/20 N/m; nuova area di 1 cm² costa 1/200000 J. Per rho=1000 kg/m³, g assegnata 10 m/s², r=1 mm e theta=0 l'altezza è 1 cm; a 60° è 1/2 cm. Con gamma=1/20 N/m, una goccia di raggio 1 mm ha sovrapressione 100 Pa, una bolla sottile 200 Pa. Pi cancella e bastano frazioni e coseni esatti standard; nessuna valutazione decimale di funzioni inverse è richiesta.

`C2-capillare.svg`: reservoir connesso al tubo verticale, livello esterno y=129, menisco bagnante con bordi a y=53 e centro circa y=61, riferimento h circa y=59. Il dislivello è positivo e il menisco concavo, corretti per bagnamento. La didascalia dichiara di trascurare le correzioni del menisco, quindi lo scarto del riferimento non viene trasformato in un falso dato metrico. Non ci sono scale numeriche di r, h, theta o gamma.

## Integrità e prima fase sugli originali

Quattro asset originali confrontati con Git e byte locali, immutati:

- C2-profilo.svg: `73907de291ed86769e15e3d90e407b6ee78198524df50a8d456a8101df798b4c`.
- C2-raggio.svg: `edfcf1d6ba50e668f509b138b751154ce5bf1be7c81ad58561316ae072a02178`.
- C2-reti.svg: `2dbdd5ee675dab5d935061d55a2aa6c63b3a5f616a1ee48da17684ea1af3a377`.
- C2-capillare.svg: `3bd5058865211ddca1631b5195f13e3e0f788681e80720f125762914dc710de2`.

**6/6 test PASS, exit 0, 2,684 s**. Comprendono riscontro reale con Git, mutazioni/omissioni di ciascuna lezione, ciascun asset assente o alterato, riproducibilità e rifiuto d'integrazione del lotto con originale FAIL, esattezza della soluzione controesempio e valori manuali/unità. Un primo test confrontava la rappresentazione non semplificata del residuo di Navier–Stokes con la stringa zero: il residuo matematico era già nullo; normalizzata la forma visualizzata, la controprova passa senza modifiche a fonti o verdetti. Unico controllo scientifico negativo resta quello intenzionale e motivato dell'originale L007.

Limiti: review AI delle quattro edizioni precisamente lette. Nessuna approvazione umana, sperimentazione o calibrazione su studenti, verifica UI browser, pubblicazione o certificazione di altri record. Una futura nuova bozza richiederà lettura separata, nuovo token e giudizio storico annidato, non la rimozione del FAIL originale.

Gli hash della prima fase originali erano: modulo `fbe233f8e7be8317aaedcdf59f027c82d1f5f8a95b4265dc38a99a59abccd6be`, test `8956158888428f9109108e54a8048ab5530cdb0a273f44cb01616e32836e6f3f`, report file `154387f01e45fc0d77d914ec39d1373c0c6ba9c59ede6d04d8277865a52f2c05`, canonico `7fb8456c84bf96fb50da29757b4968a1c2fe623422cf8b89d3ff35cd8fdeb289`. Sono traccia storica, non hash dei file finali dopo l'aggiunta del wrapper.

## Review separata della nuova C2-L007 v2 — pacchetto 073

Riletti **tutti i 28 blocchi finali** del candidato, inclusi testo conservato, formule distinte, esempio numerico, didascalia e commenti sul regime. L'autore è l'integratore; io verifico e congelo soltanto questa precisa nuova edizione, senza modificarla. Stessi ID e corso, `version=2`, `baseVersion=1`, nessun answer; asset storico caricato come `/asset/<hash>`, con binding completo.

Il dominio del tubo è ora esplicito prima della parabola: tubo diritto, circolare, orizzontale, R>0, pareti ferme, aderenza, liquido newtoniano incomprimibile con viscosità e densità positive costanti, moto laminare **stazionario** e pienamente sviluppato, regioni d'ingresso ed effetti d'estremità esclusi. Profilo indipendente da tempo e coordinata assiale; asse orientato lungo il moto e vmax positivo. Il successivo paragrafo distingue avviamento laminare variabile nel tempo dal profilo stazionario e vieta di assegnare automaticamente parabola/metà massimo al primo. Piccolo Reynolds non viene confuso con stazionarietà. Il controesempio polinomiale resta valido come caso di confine escluso: non è trasformato in un errore dell'originale scomparso dalla storia.

**Calcoli effettivi della nuova lezione**, tutti verificati: 4 mm/s diviso 2 mm = 2 s⁻¹; in SI `(4/1000)/(2/1000)=2`. Con viscosità 2 Pa·s lo sforzo tangenziale vale 4 Pa. Il testo distingue correttamente sforzo tangenziale e pressione normale, che condividono l'unità senza essere la stessa componente della trazione.

Per il tubo, r=0 dà vmax, r=R dà zero, r=R/2 dà `vmax(1−1/4)=3vmax/4`. La media è esplicitamente d'area: ogni corona ha misura `2pi r dr`. L'integrale stampato `integrale_0^R(r−r³/R²)dr=R²/2−R²/4=R²/4` è corretto; moltiplicato per `2vmax/R²` dà esattamente vmax/2, senza valutare pi. Come **prova aggiunta dal revisore**, la media di linea su un diametro darebbe 2vmax/3, diversa dalla media d'area: il peso delle corone è quindi necessario, non ornamentale. Reynolds usa D=2R; rho*vmedia*D ha unità kg/(m·s), uguali a eta. Non c'è un passaggio numerico affidato a calcolatrice né una catena di formule rotta dal frazionamento.

L'asset `C2-profilo.svg` della nuova edizione è stato riletto/reso e confrontato: **Git5d1d, copia in editorial/assets e payload Base64 del pacchetto sono byte-identici**, SHA256 `73907de291ed86769e15e3d90e407b6ee78198524df50a8d456a8101df798b4c`. La nuova didascalia specifica caso stazionario, frecce come velocità locali e curva delle punte, non traiettoria; i due lati sono un diametro della stessa sezione. Nessuna scala numerica delle velocità assegnata. Non viene creata una nuova figura pubblica.

**Esito nuova edizione: PASS AI indipendente, DRAFT.** Gli altri tre record mantengono esattamente il loro giudizio originale PASS. Il report effettivo ha **80 controlli positivi**: C2-L007 nuova 27, C2-L008 17, C2-L009 14, C2-L010 22. Il giudizio originale C2-L007 rimane `publishedEditionReview.ok=false`, `failedPublishedEdition=true`, con controesempio e priorità P2 intatti. Il report originale conserva 71 controlli e l'unico fallimento scientifico intenzionale. Il cambiamento del suo hash deriva dalla provenienza del verificatore aggiornato, non dalla rimozione del finding.

**10/10 test PASS, exit 0, 7,354 s**. Oltre ai sei test originali: giudizio storico annidato e nuove versioni corretti; cambiamento del testo dopo rebinding respinto dal token indipendente; sourceRef/sourceId/sourceSha, version/baseVersion (incluso booleano), kind e answer alterati respinti anche con token aggiornato soltanto in memoria nel test; pacchetto vuoto o duplicato, binding assente, upload corrotto e asset locale mancante respinti. Identità canonica del report misto verificata. Nessun test altera fonti, firme di produzione, DB o approvazioni.

Hash finali dopo questa lettura:

- Token scientifico indipendente C2-L007 v2: `9c1c72d008f9c87d70e4bdcd7646ee24398e6bc6089bdab210d5c83ce7e0f05e`.
- Candidate SHA256 canonico: `cf3e1ac2f5e8ae643f346fbc429d0cc09b0a9c86535e6648a018684b4252a921`.
- Pacchetto 073 SHA256 file: `38214ac79e572d4ef8eb0ccef37950539d9c49c337f29fd01bc735b2bf50c644`; canonico `998c0123826beee99b1aefdf6947fdf488de8b7b81b33b124b9b92414d608f07`.
- Bindings SHA256 file: `cc72a336a747e3de7cb46b80108b2ed9083788e9ff37b6d69d16982e55684e9e`; canonico `bbf7e0d52e360f63aadcfbb1cf1666994a15d77f7ad5954869a1cea483ed1753`.
- Verificatore SHA256: `e76c5e02d74adc992124e59241b679b6f253624f3647c641c029d953103fb9e3`.
- Test SHA256: `9f8b183f85db35b0871cfb184a330cfe47d796c89ce4b186a1f3d500a1e0d441`.
- Report originali SHA256 file: `0c6a302284f383dead7de3d132bc0fa7832f33d34d38dfa60aaa5181e11da656`; canonico `64871701c317f3aa13dfa72524918b8336b61ac42ef72e44ddcfa7e84f3041f2`.
- Report effettivo SHA256 file: `510a8fe404497b142ac58234b80e82b8cab4895f88db008cc306223f2a012b08`; canonico `d5a3e4696ca2bb8e1d22fab7e86d322645e3b7fd49227dfd4ab1a90b9645ca30`.
- Contratto SHA256 letto dai report: `a410c96a54250969592294c9aa7755294ec970a6ffee0aed6374debd6b33fe60`.

Nessun ulteriore finding concreto sulla nuova edizione letta. Persistono i limiti di review AI, nessuna approvazione umana, nessuna pubblicazione e nessuna inferenza di efficacia didattica da fixture tecniche. Non ho modificato il pacchetto, il registro, il checkpoint o il runtime.
