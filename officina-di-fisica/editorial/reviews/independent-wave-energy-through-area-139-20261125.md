# Revisione indipendente — wave-energy-through-area-139

Revisore distinto dall’autore. Tutti gli 80 prompt originali B135–139 di U4-01 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Le derivazioni per ID sono state salvate prima di aprire qualsiasi pacchetto B; nessuna chiave originale consultata. Gli handoff contenevano soltanto SHA, file e ipotesi generali, senza risultati numerici o chiavi. Il revisore ha scritto altre famiglie A130–134 e conosce le leggi dell’oscillatore da quel lavoro: non rivendica ignoranza della fisica, ma separazione dell’autoria e derivazione prima della lettura di queste candidate. Nessun modulo autore importato e nessun candidato modificato.

Successivamente letti tutti i 16 record del lotto: ogni consegna, opzione, blocco, formula, hint, feedback, didascalia e metadato. Cinque SVG controllati in XML e rendering nativo completo. Mapping al vero corso C5: competenze C5-L01/L02/L04 e prerequisiti esistenti; lezioni C5-L01/L02/L03/L04/L05 e C1-L003/L005/L006/L008 rilette durante il lavoro U4. I trasferimenti C1 nelle schede energetiche sono espliciti.

Edizione finale riletta: 9aa69c9434d1022c29202618b0a3c544e331478d. Package SHA256 1d507f284147ab9d5d9a7c423f4f62a0ae591a477a827400e3f177c42ee69f6d; binding SHA256 c94a7a86c998ed17a082842526ac72b77dcf61bd7970654826d45afd509621e8. Modello SymPy separato dal calcolo autore, unità esatte con Pint e Fraction, risposte interpretate con AST aritmetico limitato e senza eval o sympify del testo candidato. Le sole enum usate sono EXACT_ORACLE e AI_CONCEPTUAL. I casi qualitativi conservano una prova fisica specifica anche quando non richiedono un calcolo numerico autonomo.

Ipotesi generali: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Figura: XML e rendering completo letti. Tre quadrati 50×50 px a 50 px/m rappresentano 3 m², vista frontale; ⊙ verso il lettore e freccia laterale schematica indicano incidenza normale. Ogni m² riceve 2 W e in 2 s 4 J: 12 J totali. Timeline due caselle 60 px a 60 px/s, ciascuna 6 J. Esempio distinto assegna α=1/2: barre 120/60 px a 10 px/J per 12 J incidenti e 6 J assorbiti, senza inferire assorbimento nei quesiti.

## AR-u4-wave-energy-through-area-01

I=2 W/m², A=3 m², Δt=2 s danno E=12 J.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 6 è potenza W; 24 conta durata due volte. E_ass 12 richiederebbe assorbimento completo non assegnato.

Esito AI: PASS_AI. Risultato esatto: 12. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 4f5f89d9e3f9ad54e62122bc8a1d19acb4d755ab2fcf2dad998f2306a7339876; candidato SHA256 674bcdca7044a3c68e46084c89150dab87381c6525e64b447b1e088f8e29d601; firma di lettura bc4825ad213b879b04ec0110cff596bc52d2329e401d99315cdd18b0ae32da9e.

## AR-u4-wave-energy-through-area-02

W·s=J; intensità per area per tempo.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: W potenza, W/m² intensità, m² area, J/s² dimensione diversa. W·s=J.

Esito AI: PASS_AI. Risultato esatto: J. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 a4ecd347e853877ec3e7239cb318c5a5ac33ef5a02249262db9c81b1879eeb29; candidato SHA256 3d5c63b0ae8a4222a61b67c6a4102aba428ef92dfed664d76e85aee80c1e9ebe; firma di lettura 401e1f74c5e5867fb1fe16d7981146d9c40747f21cb0a4e11cfb9c4f14efdb7a.

## AR-u4-wave-energy-through-area-03

criterio fisico prima delle opzioni: il suono richiede un mezzo materiale e può propagarsi in gas, liquidi e solidi; la velocità dipende da inerzia e proprietà elastiche, non da una costante universale né dalla sola classificazione del materiale. Le opzioni sono ancora ignote e non anticipo una stringa chiave.

Ipotesi applicate: Solo 03: regime usuale di piccole perturbazioni meccaniche nei mezzi materiali. Gas e liquidi sostengono modi longitudinali, solidi anche modi trasversali; nessun valore universale della velocità o trasporto della stessa particella dalla sorgente al ricevitore.

Alternative e feedback: Suono non solo aria, non velocità universale, non vuoto; oscillazione locale non richiede viaggio della singola particella. Nei solidi esistono anche modi elastici trasversali.

Esito AI: PASS_AI. Risultato esatto: Il suono può propagarsi in gas, liquidi e solidi; le sue proprietà dipendono dal mezzo. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 4af022329f688974ab312fe15f4be8053f2102228f5d6cedd511b4550ac4b220; candidato SHA256 a7d40596e57de4c2c411430214a3fede72162906c42ed9c01da05a110dd062ae; firma di lettura bd91f63ed14509b5fa14fcb2d3886b675e5be58b38b88df84e02d0ee317c5504.

## AR-u4-wave-energy-through-area-04

I=1 con A=3 dà E=6 J.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 24 inverte rapporto; 3 dimezza due volte; 12 ignora I nuova; zero fuori dominio positivo.

Esito AI: PASS_AI. Risultato esatto: Da 12 a 6 J. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 dd93a780716fd7d105bd144cfe23fce16570a54eb85c786741f4f99eafe18397; candidato SHA256 838f5c771cef58e93a5f6b22e98463c1303ba5988ceebe237ebf561bd010c87a; firma di lettura 80e74ea979933dc71dc9d0f02159b539b829ab1f384c25543ecd15188a58904d.

## AR-u4-wave-energy-through-area-05

I=E/(AΔt)=12/(3·2)=2 W/m².

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 4 omette tempo e dà J/m²; energia assorbita senza frazione non determina I incidente.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 5cac2048bc7fe8cd942e553f523714e128c27bc9d943b13d6fb2db9ff2b34305; candidato SHA256 62a4502ab3caec6c26a5f7c6d86528bdc60c3406d6e0a9402de4413016682e1c; firma di lettura b73e472e3375bc3284fad1a1e931073d667fbe0798c7930e6e8ce3391aa46446.

## AR-u4-wave-energy-through-area-06

A=E/(IΔt)=12/(2·2)=3 m².

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 6 omette durata; radice darebbe lunghezza, non area richiesta. La forma della superficie non serve per I uniforme.

Esito AI: PASS_AI. Risultato esatto: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 23e11cc9250aba40ad9fdb67ffa9ce766af2f8889e960f629332772c119c4823; candidato SHA256 26253ce319db3996c240f02871686f2f3eb98cd45efdad6a5050e3e0bf39e85b; firma di lettura b9430d51cd624655beaed6edc16728199e59a46b7824f55b5b3fadb7a8f93da9.

## AR-u4-wave-energy-through-area-07

A=1 a I=2 dà E_B=4 J, rapporto 1/3.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 3 reciproco; 1/9 quadra un’area già data; 2 copia I; 1 ignora riduzione.

Esito AI: PASS_AI. Risultato esatto: 1/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 69235a7d4ac401665c81decf809e70f22f0a31a8ccefbc83d043e64e0b4494d4; candidato SHA256 f33b66f10bed71f3bef8e855ab694125ff9841d0766d550065bd390b233011b5; firma di lettura a9ece8d58ee7cc85f77223a7cb94d308f7cbc129bdb69af3fd4459185d7d17fe.

## AR-u4-wave-energy-through-area-08

e=24−12=+12 J.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: −12 ordine inverso; 24 proposta; zero accetta; 6 copia la potenza numerica non lo scarto di energia.

Esito AI: PASS_AI. Risultato esatto: 12. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ffd9ce19ec933f9af3d48588d3637b1256861a826620f605866b7dc1237d20e3; candidato SHA256 2b1ee83ba5c4aa8a812b4a28a55c0ca8728ba72bda66ef743457626fac04ef71; firma di lettura 757c01ecbbdbda9b508e4decd8652d7d31a5b1ebf7a69eac0147a8915b575410.

## AR-u4-wave-energy-through-area-09

I=E/(AΔt), con Δt=2 s come quantità dimensionata, non un due privo di secondi.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: EA/Δt W·m²; EΔt/A J·s/m²; AΔt/E intensità inversa; E/A energia per area senza durata.

Esito AI: PASS_AI. Risultato esatto: I = E / (A Δt). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 4cf26e7937540ba355c27e7153f2ceeeb0079b1ffa03c9336c9fb62a16ebe479; candidato SHA256 92bd3f174451c8c83bb37866c4ad2e5843c05011b304f23ca1bdae27661ae26a; firma di lettura 10abcaa74485b32a8c0ad57cb9fe877bde8ceeb0365bc7febafcbbedf650b5df.

## AR-u4-wave-energy-through-area-10

rapporto κ₁κ₂ per stessa durata.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: Quozienti invertono dipendenze; κ₂² quadra l’area già assegnata; somma due per stati identici.

Esito AI: PASS_AI. Risultato esatto: κ₁ κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 3209775e14cd32e62ca9755866e4b56002633d957d342dd9f0f9e13a4222aef5; candidato SHA256 238aca3f6f6d0b84337c3e3456564eb5883dca3c0f47c02e3fb8b2a8ef6ff988; firma di lettura 622100831760b7c3332ee18b3a710841722f8714929bcc0a4e8c1eee9edf3638.

## AR-u4-wave-energy-through-area-11

B con I=4, A=2 dà E_B=16 J, rapporto 4/3.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 3/4 reciproco; 2 solo I; 2/3 solo area; 16 energia finale numerica non rapporto.

Esito AI: PASS_AI. Risultato esatto: 4/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d122e8b685635f9f6396ac2879a3aed0011a5463bb934e66d1a1f72cdc45a411; candidato SHA256 8b6574c0f2b110fe12c39eab734f7c3725187bef7d72d776778c91441caf895f; firma di lettura 17b0689353f11ac497b4c7e0f978bc37a4c6ce43bb3af42a2c8db9a12534ffc5.

## AR-u4-wave-energy-through-area-12

media (12+16)/2=14 J; ingressi medi I=3, A=5/2 danno 15 J, maggiore per 1 J.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 28 somma; 7 doppia metà; 4 differenza; 15 modello agli ingressi medi, maggiore 1 J.

Esito AI: PASS_AI. Risultato esatto: 14. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 bdb8ebc86fcfaa3d1d3d032b69cf1b6f5b4cd70888eee42d61d5db1f5ee5f405; candidato SHA256 2308d5c139efd7507b03e9725de7e7d0833f8257718f10ca4d0c9b0bba88e09e; firma di lettura 32c2c19ffc677a250ce7c5cc7e0b42a22b51ac76ca191bb6d65a85da49fa71e2.

## AR-u4-wave-energy-through-area-13

target E_B=16 a I_B=4 richiede A_B=2 m², rapporto con 3 pari a 2/3.

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: 3/2 reciproco; 4/3 target; 2 numero di area B; 1/3 darebbe 8 J anziché 16.

Esito AI: PASS_AI. Risultato esatto: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8a7e75986a54943fe7e48345912a864ac304f9ae0d4963372d4f9341a73ac648; candidato SHA256 d7421da44db9c56013359fc5556934095f981e9d222240473d7933485747e2b0; firma di lettura 21fe92ae62cbd2afc0e646ed2b863e6663c500b9936ae1045a7ed84fccdbef4e.

## AR-u4-wave-energy-through-area-14

gain 36/(12 J)=3 J⁻¹; S_B=48 dà E_B=16; A_B=2 porta I_B=4 W/m².

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: S 48 come J dà 12 W/m², triplo; non misura direttamente intensità né assorbimento.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3c9acb889a70ff89b4c5372957a9a8a3a4227031da7b4459bb78027624191892; candidato SHA256 2dfee320673d52699aff8537cf165b6396cf40ce7e0ccdbd075c581388f047a9; firma di lettura bd2f9867028c5aeb93b11879ea25a5af96590968e3d03429df95034376a06419.

## AR-u4-wave-energy-through-area-15

gain (33−25)/(16−12)=2 J⁻¹, offset 1. S_C=21 dà E_C=10; A_C=5 porta I_C=1 W/m².

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: I 2, 4, 1/2 generano S 41, 81, 11; 21/10 usa S come E e genera S 43, non 21.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a194db2442780fd8bc5d5224540cb6e485e8e92251e15c1a408ccc552ebbcbac; candidato SHA256 6985e3dc0ea70bab803914f14333c7b1deb5e945673c01a1f8cd40f706487255; firma di lettura 2809bd25f81b76a2540bcf8eeb68c6735df6cb17f8e6b16c7cfa9da130e9e56e.

## AR-u4-wave-energy-through-area-16

I=cA con c=2/3 W/m⁴; E=cΔt A². Dato E=12 J, A²=9 m⁴ e ramo A=3 m² positivo; I=2 W/m². Il quadrato dell’area ha dimensione m⁴, non m².

Ipotesi applicate: Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.

Alternative e feedback: A²9 m⁴ implica A 3 m²; negativo viola A e I positive. Non applicare un’altra radice per un lato che non è richiesto.

Esito AI: PASS_AI. Risultato esatto: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 acad7ce0645c0a692745b990a7e02fcfe4267255405d9148d5deaf7ef0281c06; candidato SHA256 6d591ef25398cf0481ba6341c2ab943aa13e20c6b0623dbd0a643f448df44d9d; firma di lettura 9350355a0783a366c8e852d9be7e82f28633a5725dc30f4d9d6e0855a65843b5.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo il rinnovo del binding, dei token e di tutte le guardie d’edizione esclusivamente in memoria nel test. Resta attivo l’oracolo matematico o la risposta concettuale motivata, non la sola impronta. Altre prove coprono falsa fonte, unità errata, batch vuoto/parziale/duplicato, falsa fisica a chiave corretta e SVG incorporato o locale mutato. Le guardie su testo e figura certificano l’edizione letta e non sono risolutori semantici universali.

assert_record_identity verificato sui report fresh e salvati contro package e binding reali integrati ROOT. Proprietà Hypothesis per ulteriori configurazioni fisiche e test geometrici sui cinque SVG. La suite generale, il replay browser finale e l’integrazione spettano al root. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.

Nota sul test comune: il primo run non era PASS. La mutazione d’unità sceglieva sempre Hz, che in 137 era già l’unità originale e quindi non mutava nulla; ora sceglie sempre una dimensione diversa e lo asserisce. Il lettore XML è stato corretto per ignorare il rettangolo di sfondo senza attributo y, mantenendo tutte le asserzioni sulle sei caselle e sulle coordinate fisiche. Nessun candidato, oracolo matematico o criterio di accettazione è stato indebolito per queste correzioni della fixture.
