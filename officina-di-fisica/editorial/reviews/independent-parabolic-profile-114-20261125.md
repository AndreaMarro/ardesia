# Revisione indipendente — parabolic-profile-114

Revisore distinto dall’autore. Nessuna importazione del modulo autore e nessuna modifica ai candidati. Tutti gli 80 prompt originali U3-04 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Nessuna chiave originale usata per concludere la verifica. Successivamente letti tutti i 16 record di questo lotto: consegna, alternative, ogni formula, hint, feedback, didascalie e metadati C2. Le lezioni reali C2-L005/L006/L007/L008/L009 sono state rilette nel lavoro U3-04.

Edizione candidata congelata solo dopo la lettura: f5c8b2b9cca71bee24d17eed6078d9c86c250080. Package SHA256 9786abf87ab2e62952c501aa4a59b49b732c26c7aa8c3301301461cc81d445a4; binding SHA256 b9b01bf5c51245149a7a57be592a4a845414317ef3f87c980d3a360c92996626. Oracolo SymPy distinto dal calcolo dell’autore; unità SI controllate con Pint e Fraction, scelte numeriche lette con AST aritmetico limitato. EXACT_ORACLE e AI_CONCEPTUAL sono i soli valori del contratto, senza equiparare una firma a una prova matematica.

Ipotesi del lotto: Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.

Figura: XML e rendering completo letti. Profilo origine(100,530), scale u 300 px/unità e v 60 px/(cm/s). Bezier P 0(100,290), P 1(250,290), P 2(400,530): u=t, v=4−4 t², quindi passa esattamente per(1/2,3), non interpolazione arbitraria. Quattro celle uguali mostrano 3/4, dichiarate non aree del tubo. Pannello distinto vincolo V=8 u e v=3, fattorizzazione e due radici interne con bound 3<√13<4, massimi diversi fra prove.

## AR-u3-parabolic-profile-01

u=1/2 dà u²=1/4 e 1−u²=3/4. V=4 cm/s produce v=3 cm/s, fra zero e V.

Controllo delle alternative e del feedback: 2 cm/s usa la riduzione lineare 1−u; 4 ignora la posizione; zero colloca il punto alla parete.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 da563baf963bd74c5576de0bb15c4ce81355c879f3c794fb80957aebed56ba56; candidato SHA256 9b032dee4574ae0cf86a7bfbd82915059239c5179df7b75e1519e27659bc200a; firma di lettura 14e58634aaf849aba495bf436fe3024149c8d63e956128cecb0bc4e7489a89ca.

## AR-u3-parabolic-profile-02

u=s/R è puro; v mantiene unità cm/s e dimensione L/T. 1 cm/s=10⁻² m/s. Nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: cm è lunghezza; 1 unità di u; s/cm velocità inversa; cm²/s ha una lunghezza di troppo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: cm/s. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 366f6239e7568ff923ec70034e3cca14fa1b02ecdbe8676df4f5d0da2e798139; candidato SHA256 0918f86225362019f7f67dd06fa8f26e9c9c98c6f2ba719530ed78bc1bb26b4b; firma di lettura dfc7094cbed97628011285f9f76d783c73f632fd13827d6a86c9ace2d1943642.

## AR-u3-parabolic-profile-03

Profilo esteso ai bordi: u=0 dà v=V sull’asse; u=1 dà v=0 per aderenza alla parete. La media d’area è V/2 da integrale 2∫₀¹ V(1−u²)u du.

Controllo delle alternative e del feedback: Invertire i limiti contraddice l’aderenza. Valori uguali indicano un profilo piatto; V/2 è media d’area, non massimo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Sull’asse v=v_max; alla parete v=0. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 3caf3d8af61c15e4789fdf815c7890ccec8aefa07942eb404876a47fbf561af6; candidato SHA256 857446b22833d1d9872ee3109cbfb1f9e6c6d1aae44f8cbee206f78756cb3ee2; firma di lettura f4b02ac0270157697abfd653d4d537b4ac750f59d207ac0cbb6f6ec898255eb3.

## AR-u3-parabolic-profile-04

Fattore locale 3/4 invariato: V=4→9 dà v=3→27/4 cm/s; confronti fra regimi stazionari.

Controllo delle alternative e del feedback: 4/3 applica il rapporto inverso 4/9 alla velocità iniziale 3. 9 copia il massimo; invariata e zero ignorano le condizioni.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Da 3 a 27/4 cm/s. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 322242d7e161412fbb810323cc9f3f7c0168556aa1cd769c3139a4ee746a09a8; candidato SHA256 33803ef0d30eede4ac7aca32c78fe1c7791a28581706c6e7cc8c119ef2388347; firma di lettura 4a419a528586b5b1731744106b16a580afed6df4409fc32ecac11f3e436b22f3.

## AR-u3-parabolic-profile-05

V=v/(1−u²)=3/(3/4)=4 cm/s. Denominatore positivo per u<1; V supera la misura locale.

Controllo delle alternative e del feedback: Moltiplicare ancora per 3/4 produce 9/4 cm/s, inferiore al locale e quindi impossibile come massimo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c358c9cce9c48778566a9c30e155d7d9f0bb3f23f4962345241327599d0bd767; candidato SHA256 8c98323ba753cee38a2cb24cfcd6b67a0f7668be4bf7f42a29c3a13124329051; firma di lettura 4de54769fb7bba0a090c85701c021428ebcd74fddb2226b103b41cb376226724.

## AR-u3-parabolic-profile-06

u²=1−v/V=1−3/4=1/4. Radice positiva u=1/2 perché s è distanza; negativo non è coordinata radiale ammessa.

Controllo delle alternative e del feedback: 1/4 è u²; la distanza dimensionale s non è identificata senza R. Il ramo negativo non è una distanza radiale.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 997789d82766fd067cea00204744715c0f226a0b8cf38cfbaeab9ae6e3807570; candidato SHA256 63af434e8b909bcf64a2b7c509476f84a2206b6e539a2ad521ace6254de6dcb7; firma di lettura 1e032a3d918ba9cf3e8222087894770fc3cbf57eb37dfe58b080dcf1ac7b5a4b.

## AR-u3-parabolic-profile-07

B a u=1/3: v=4(1−1/9)=32/9 cm/s. Rapporto con 3: 32/27.

Controllo delle alternative e del feedback: 27/32 è il reciproco; 8/9 il fattore locale di B; 2/3 il rapporto delle distanze; 1 ignora lo spostamento.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 32/27. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 dba1fc19d578a859f48a454d9a06f143076602ef13a85e48c877ee6eca3b95aa; candidato SHA256 615cf456097154e805f37d68abc5311d5d533d3ab0592903099a28bcd11fc33a; firma di lettura f2f296fa1cc4e21e5a8d097892969b2485353e0bc2a9cd228436a53b61bb0042.

## AR-u3-parabolic-profile-08

Proposta 6 supera già V=4; corretto 3 e scarto con segno 6−3=+3 cm/s.

Controllo delle alternative e del feedback: −3 inverte l’ordine; 6 copia la proposta; 0 la accetta; 3/2 dimezza lo scarto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 1762b495d584df190aa73ac7975136e52971120214d2c8a678e3d5a00ae9e25a; candidato SHA256 10f46b4ddb453a83a7d405ded5c7b89b63fd2042f120cc5c618cdd1d184b894c; firma di lettura 68bb1c3d137fd79ceb6d9806b58456246703cb39bb804062060ba8f5c59b1fe2.

## AR-u3-parabolic-profile-09

Dividere v=V(1−u²) per la parentesi positiva: V=v/(1−u²). Non si estrae la radice di V, che compare alla prima potenza.

Controllo delle alternative e del feedback: Moltiplicare riduce ancora. 1−u e u² omettono parti del profilo; la radice finale ha dimensione errata.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: v_max = v / (1 − u²). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 5f435d52ba6330efd461cc8443067b5ac90554f660f4c23c5731d390b1f1a761; candidato SHA256 a4bf6defad1a6847b26e5ec16f9ff5ad5b604cb25bf6a77a7342a42f61fd8775; firma di lettura ab5010b4103f197282f232ce1e1a91f5812c99014065d0d774fd72c94be99f50.

## AR-u3-parabolic-profile-10

U=1−u_A², D=1−κ₂²u_A². v_B=κ₁V_A D e v_A=V_A U danno κ₁D/U; dominio κ₂u_A<1.

Controllo delle alternative e del feedback: U/D inverte la geometria; i semplici fattori di κ₂ ignorano il termine uno. D/U omette il cambiamento del massimo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: κ₁ D / U. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 dfce39cf5f0731c05f96f8905a82b0793cae29d7a8b0291d18043c9e3670a930; candidato SHA256 ccf36831ee232c27d0637339ff6ea4c4c6201f5147d12986fa24b0da0cf17244; firma di lettura 1cfb7aac2d752de0d5f1ef2d1c9918cfe1e7de3f5302fbd7fea11e7787461aa4.

## AR-u3-parabolic-profile-11

B: V=9, u=1/3, v=9·8/9=8 cm/s. A=3; rapporto 8/3.

Controllo delle alternative e del feedback: 3/8 è il reciproco; 9/4 segue solo i massimi; 32/27 segue solo i fattori locali; 8 è la velocità numerica.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 8/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 20b4a5af50b3d89066e6b0f02e92af55c94b60f51a9578a5a344e387620aceed; candidato SHA256 95ba58d9d45f2de445e7164b4c2ea1c9a702bc864f438b3e1e111149825078f6; firma di lettura 2bfb051b04c680a457fadcac82f7a376f9f4659b2ecf14175fc12e5972706aa2.

## AR-u3-parabolic-profile-12

Media (3+8)/2=11/2 cm/s. Ingressi medi V=13/2, u=5/12 danno (13/2)(119/144)=1547/288; 11/2 meno questo valore è 37/288 cm/s.

Controllo delle alternative e del feedback: 11 è somma; 11/4 dimezza ancora; 1547/288 usa ingressi medi; 5 è differenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 11/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 897cadcd28dc70136beefe23f25354ac1a6bc3b8457453f2427bd61cc19f40a0; candidato SHA256 a7452280b6c978955e9f2deaf121e5244e96f6f9011cfe7dd1209f6feaa78e3c; firma di lettura f16d41b90123e5863edaabc32f39db14af0a201edd1ef36d2f1bfecba293e56f.

## AR-u3-parabolic-profile-13

Target v_B=(8/3)3=8 e V_B=9: u_B²=1/9, u_B=1/3. Rapporto (1/3)/(1/2)=2/3.

Controllo delle alternative e del feedback: 3/2 è il reciproco; 1/3 è la coordinata B; 8/3 il target di velocità; 4/9 il quadrato del rapporto delle coordinate.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 558cd575e01d0935318edfff49a053909342291f9be1656a7861016a1dc9ea10; candidato SHA256 d5727f40880ed693d269332e240610a2f55f335c33aad0f6b52489ebe02422da; firma di lettura 2264f9c2ce5d2d1df455ea9b4642b4bac17f0b736e7c6fc873568c5f11b81392.

## AR-u3-parabolic-profile-14

Gain 9/(3 cm/s)=3 s/cm. S_B=24 dà v_B=8; V_B=8/(8/9)=9 cm/s.

Controllo delle alternative e del feedback: 24 è il display e 8 la velocità locale. Occorre ancora dividere per 8/9 per ricostruire il massimo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 9. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 1c613c48093b4e5310b7f8fcc340fb5273ccf08b113ff84634ec8e32b4631768; candidato SHA256 6ef3ff492b1656c342544ffa13cf1463b066345f93df9e0d7d4fd7b241c47f60; firma di lettura ab1eba608c0cda3a1d722ca1993b31bc5aa3e96ff2542f1f70723b7c6bff2ec8.

## AR-u3-parabolic-profile-15

Gain (17−7)/(8−3)=2 s/cm, z=1. S_C=29/2 dà v_C=(27/2)/2=27/4; V_C=(27/4)/(3/4)=9 cm/s.

Controllo delle alternative e del feedback: Massimi 4,8,27/4,18 cm/s danno letture 7,13,89/8,28 a u=1/2; solo 9 cm/s dà 29/2.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 9. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3d0b4380d23b83c8769c2625f534e314c63f8c830e6e236fb41fa9af99476b86; candidato SHA256 2c2513c5585a9e14093936f74737eaee25820dc6340f499dc0224c8b228bb0a4; firma di lettura 9f1bf047480a5666c97a100c7fe600156e8332eb3646dd163b578f59600563dd.

## AR-u3-parabolic-profile-16

V=(8 cm/s)u: 8 u³−8 u +3=0=(2 u −1)(4 u²+2 u −3). Radici 1/2,(√13−1)/4,−(1+√13)/4. 3<√13<4 prova 1/2<u_b<3/4; due distinte interne e una negativa. Conteggio due, senza decimalizzare radicali.

Controllo delle alternative e del feedback: Una soluzione tronca dopo il primo fattore; tre conta la radice negativa. Nessuna e infinite contraddicono la fattorizzazione e la cubica non nulla.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Due. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 0c94c84895539e3ca9c6eb7f47f9b361d089756801b0b51ac91038bf2de15c82; candidato SHA256 430fc9a539e767cd173dbafa0fdbf09c347fc639a0eaa10bad1b2ff651ad3f1e; firma di lettura 764f3de39dd893c92d5156f3d348d85d0085671b8c6481aa3c4801ec578ba1b1.

Controprove riproducibili: 24 per questo lotto, incluse tutte le 16 chiavi sbagliate con binding e ogni token/guardia d’edizione rinnovati esclusivamente in memoria dal test. Queste chiavi falliscono l’oracolo matematico o la risposta concettuale motivata anche dopo la sostituzione delle firme. Prove distinte per falsa fisica a chiave corretta, fonte falsa con token sostituiti, unità errata, lotti vuoti/parziali/duplicati e SVG incorporato o locale mutato. Le prove su testo e figura sono guardie dell’edizione riletta, non risolutori semantici universali.

assert_record_identity controllato sui report fresh e salvati contro i pacchetti e binding canonici reali. Le proprietà Hypothesis esercitano ulteriori configurazioni fisiche e i test leggono coordinate dei grafici, senza scritture nel registro o nei candidati. La suite completa e le anteprime finali sono responsabilità dell’integratore; questo report non le sostituisce. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana simulata.

Prova finale sui byte consegnati: `python -m unittest tests.corpus.test_cross_review_viscosity_networks -v` con runtime recovery, 11 test PASS in 3,504 s. Le cinque proprietà Hypothesis hanno 35 esempi ciascuna (175 configurazioni); gli altri test comprendono 80 identità fresh/saved, 80 hash fonte riletti da Git, unicità esatta delle alternative numeriche, AST limitato e geometria dei grafici. Tutti i 21 file di questa consegna controllati per singola newline finale e assenza di whitespace finale; SHA dei verificatori coerenti con i report salvati.
