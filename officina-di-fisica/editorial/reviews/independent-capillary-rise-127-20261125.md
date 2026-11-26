# Revisione indipendente — capillary-rise-127

Revisore distinto dall’autore. Tutti gli 80 prompt originali B125–129 di U3-05 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Gli handoff dell’autore fornivano SHA, file e ipotesi generali, senza anticipare risultati numerici o chiavi. Nessuna chiave originale usata per la derivazione. Successivamente letti tutti i 16 record di questo lotto, ogni opzione, blocco, formula, hint, feedback, didascalia e metadato. Nessuna importazione di authoring e nessuna modifica ai candidati.

La competenza primaria C2-L010 è reale e tratta tensione superficiale, Laplace, capillarità ed energia di superficie. I prerequisiti C2-L001/L002/L004 appartengono al corso; non sono competenze inventate. Le ipotesi ideali esplicite delle schede delimitano ciascuna applicazione.

Edizione finale riletta: 0f42bac191aa29677b99f80de50a0f0df18791bd. Package SHA256 d18b5dd4a1ad3ebbed7e41f467dcf0a2fe0d90270dc09682471c4c0a3565cc7b; binding SHA256 1b9dfb8b528d1aa02e2797b7ea04766c764ceed6cfdc70e09501f0c3120894f2. Oracolo indipendente SymPy, unità esatte con Pint e Fraction; aritmetica di risposta con AST limitato, senza eval né sympify di testo candidato. π e radicali restano simbolici. Valori del contratto: EXACT_ORACLE e AI_CONCEPTUAL; il secondo conserva la specifica prova fisica e non equivale ad assenza di ragionamento.

Ipotesi del lotto: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Figura: XML e rendering completo letti. Tutte le lunghezze sono a 20 px/mm: primo tubo larghezza 40 px (diametro 2 mm), altezza 200 px (10 mm), raggio 20 px. Piano esterno zero a y400. Confronto finale da y1310: altezze 200/100 px per 10/5 mm e larghezze 40/80 px per raggi 1/2 mm. Forze opposte schematiche, volume del menisco esplicitamente trascurato.

## AR-u3-capillary-rise-01

Equilibrio 2πrγ=ρgπr²h: h=2γ/(ρgr). γ=1/20 N/m, r=1/1000 m, denominatore 10 N/m²: h=1/100 m=10 mm.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: Usare diametro come raggio dimezza h; seconda interfaccia assente. h è quota sopra il serbatoio, non lunghezza totale bagnata.

Esito AI: PASS_AI. Risultato esatto: 10. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 acc80015a6491156aff32c00b8d163dd05740cd895a0418636b0b2bd92c234f1; candidato SHA256 b0d76ccb50a597c7c7f2d2cd0136ae85e330923b6988ee02c1af6099fa1908ea; firma di lettura c30a0b4b32fadd2ac57c13090d6b293d703542647aadd2e9fb6a12184a6ae646.

## AR-u3-capillary-rise-02

[ρgr]=N/m² e [γ]=N/m; il quoziente è m, dunque mm è corretto. Nessun calcolo numerico autonomo richiesto.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: mm² area, Pa pressione, N/m tensione, µL volume. Occorre area del tubo per passare da h a volume.

Esito AI: PASS_AI. Risultato esatto: mm. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 4c439ecc9088e2737bbc59f6af3dccaf65f64113db5faabc40d0b091e7bae2ee; candidato SHA256 4a620c4a133e5d1d92de2468648a9deac5e7a61db3c092cb3556b0149e786213; firma di lettura 65aed517717c65317734f4c2fcbfe4bd60ce7c4492c8ed4a957045bdea9c03b4.

## AR-u3-capillary-rise-03

Con forza verticale 2πrγ cosθ, cancellare πr e porre θ=0 dà h=2γ/(ρgr). Il perimetro cresce come r, il peso per altezza come r².

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: r al numeratore inverte la dipendenza; omettere due dimezza; r² non cancella il raggio del perimetro; reciproco ha dimensione inversa.

Esito AI: PASS_AI. Risultato esatto: h = 2 γ / (ρ g r). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 fc7bdac8d95160ece7c74fbdeb2f58b1cf7ed8aebc44b2270c9f07ccebc406eb; candidato SHA256 ead4798196c0270aedfb783d290230d825a5bdd10d6f88c3c93fb61c3c6da31c; firma di lettura 4219386c9270169ab561224786b86c7b189af2392ead2d13cadb69d2a56df059.

## AR-u3-capillary-rise-04

A r=1 mm, γ da 50 a 40 dà h da 10 a 8 mm: fattore 40/50=4/5.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: 5/20 usano dimezzamento o raddoppio non dati; 40 copia γ, 10 ignora la modifica.

Esito AI: PASS_AI. Risultato esatto: Da 10 a 8 mm. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7c57a656979be4b2c0da59f27e40a26a2be4b7c030376319a51e396113d9c261; candidato SHA256 1db83b212090338b65bfff72bb1c119475858c43498bb7abaf8dc19a2e15b132; firma di lettura cab1cb65d53d8cee22cc60d1f1790b0e5fe93c54e3cb3b2a1ad67ef66469b2e7.

## AR-u3-capillary-rise-05

γ=ρgrh/2. r=10⁻³ m e h=10⁻² m danno γ=1/20 N/m=50 mN/m, verifica h=10 mm.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: Senza mezzo 100 mN/m; usare 10 m anziché 10 mm moltiplica γ per mille.

Esito AI: PASS_AI. Risultato esatto: 50. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 88404c09187d8c059295f349eba03ffc97cac7d05a39aba3f28d281e196c746e; candidato SHA256 1d4ad927e512eeafa70a40a148ef84c949461ec37c1dc910c223a3835170cedb; firma di lettura 598c77ed8d471a4746a27861e62855b5ef71d1891e61abb0ffe33a097bf4ef3c.

## AR-u3-capillary-rise-06

r=2γ/(ρgh): numeratore 1/10 N/m, denominatore 100 N/m², r=10⁻³ m=1 mm, non diametro.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: Il diametro sarebbe 2 mm; γ/h da solo omette ρ,g e due. La risposta richiesta è il raggio.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a79ca4f0d6a0ca66cac2dafe71128c8b6c51e8ba406a9acbcc2bc71f9e353c97; candidato SHA256 e74d0d4258e336d667825a6d446d6195c66c091dd4b5dac32ec87085def5835b; firma di lettura 9212777024d6c021ed3033c23561299cb0425f7a2a20cb8e339564b16b74a601.

## AR-u3-capillary-rise-07

Raggio doppio: perimetro doppio, area quadrupla; h_B=5 mm, rapporto 1/2.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: 1/4 segue solo area, 2 reciproco, 4 segue area direttamente, 1 ignora r nuovo.

Esito AI: PASS_AI. Risultato esatto: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 75603a516881b2623847cb95b00c832048d668f76a43956b3b4d7881c85287ed; candidato SHA256 1ccb9b2f30c4552f61622e84c103327305564f493bdfb87101b67153c5a72216; firma di lettura 098f385a559c049c68e7b96c28791f05e8e93ebc670872d609bfe5ff8e8b2d82.

## AR-u3-capillary-rise-08

Proposta meno corretta 20−10=+10 mm. Quota positiva non coincide col verso di una forza risultante.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: −10 sottrazione inversa; 20 proposta, 30 somma, zero accetta errore.

Esito AI: PASS_AI. Risultato esatto: 10. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 af26f6715c64ba8a44667e3fc9807e625f319a3117ce246a51f476a41b9229fb; candidato SHA256 66fa900bd405f634095ac3c450f96a336b560a5323db3f175df9721da802ff96; firma di lettura f40319bbe04e69e25b1dc92c4c64aca1e355a03074ffb992a0e90e9c32d93e80.

## AR-u3-capillary-rise-09

γ=ρgrh/2 dopo moltiplicazione e divisione per due. [ρgrh]=kg/s²=N/m; lunghezze entrambe in SI.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: Prodotto inverso o r al denominatore cambiano unità; due al numeratore quadruplica rispetto all’inversa corretta.

Esito AI: PASS_AI. Risultato esatto: γ = ρ g r h / 2. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 e5559bbc3ebe481888844a58c67badace1d70dc82005d147fff0ef6702044352; candidato SHA256 adabf6a809540bc39dc2b5b9516aca8890ab367a9431f5dd8786218ab0aa1909; firma di lettura 3055d24c55b0bc44911863db3a9ffa7132da23aeace698a7fbe93e1631d94f8d.

## AR-u3-capillary-rise-10

Da γ_B=κ₁γ_A e r_B=κ₂r_A, cancellare 2/(ρg): h_B/h_A=κ₁/κ₂. Per fattori uguali h invariata.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: Prodotto rende r diretto, reciproco scambia fattori, quadrato perde la cancellazione; somma dà due per prove identiche.

Esito AI: PASS_AI. Risultato esatto: κ₁ / κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 424b1581f42c91446182605aa8e9325d6983a26260018c9220436254038e0914; candidato SHA256 07f07fe4481b15682a0820f1a6fe62886e72a7f235ae3e862e3133c22283f864; firma di lettura 0aa1cfad738ddcc32bfb79fabff13e0f465a2721454cc71307780d2d1cba8947.

## AR-u3-capillary-rise-11

B: γ=40,r=2 dà h=40/(5·2)=4 mm. Rapporto con 10: 2/5.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: 4/5 solo γ, 1/2 solo r, 5/2 reciproco, 4 valore finale non rapporto.

Esito AI: PASS_AI. Risultato esatto: 2/5. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 034019889fb53067bf06382d604939e4aa2b492eb70703e6ed613492b893c957; candidato SHA256 fbd6f7bea4e5c50c8bf3e495ba269fac065e77a225ade4e5abc4709acb937dc3; firma di lettura 021b389fe34685726a8ad8732dd70b07c5357cc321798949dc36d277288b3de6.

## AR-u3-capillary-rise-12

Media (10+4)/2=7 mm. Ingressi medi γ=45,r=3/2 danno 45/(15/2)=6 mm, scarto esatto 1 mm.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: 14 somma, 3 semidifferenza, 4 sola B; 6 è il modello agli ingressi medi.

Esito AI: PASS_AI. Risultato esatto: 7. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ab4390f6fe8fcd100e8e0c20bb6e7ad9d805b174f892418f566da48c8c3f75d3; candidato SHA256 464c68e0e6ac4b1a014a8fc8e615e0c6c836952758c98d62d50c2f82e0474884; firma di lettura 252e129931ee8329aec40871b1ec0c4cfcb4e725ac694515e68cb064a742fcff.

## AR-u3-capillary-rise-13

Target h_B=4 mm a γ=40 richiede r=40/(5·4)=2 mm. Rapporto r_B/r_A=2.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: 1/2 reciproco, 4/5 solo γ, 2/5 solo h; r=4 darebbe h=2 mm.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7e7f02e7291739f6501c3b4906b77693ca8942ce4673371430aede697fef59cb; candidato SHA256 3738ad29b9db28bc911ff2a4d295292548ea94cd7ee3e102028e96a5a9d432f3; firma di lettura 469525d8148aae69b370e7dce162e4a7131f16da452dee0db7eb1a3ab4279939.

## AR-u3-capillary-rise-14

A h=10,S=30: q=3 mm⁻¹. S_B=12 dà h=4 mm; γ_num=5r_mm h_mm=5·2·4=40 mN/m.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: 12 è lettura, 4 altezza, nessuna è tensione. Cambiare r impedisce di identificare direttamente rapporto fra h e γ.

Esito AI: PASS_AI. Risultato esatto: 40. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f62ad679148f643037b065f17d8d89467277ba6338757f6a2978bb7ba85d1a06; candidato SHA256 93c24d25bf33b6bd4dbf18496d3d39b680bca58dfb482e7a7d2f9fdc2339751d; firma di lettura d4e44bf6fe6562249f811c264e3b27564668cb802892f21aff1f0c9a93366cc4.

## AR-u3-capillary-rise-15

Da h=10,4 e S=21,9: q=12/6=2 mm⁻¹,z=1. S_C=17 dà h=8, r=1 implica γ=40 mN/m.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: γ=50,20,80 danno S=21,9,33; 17 è lettura. Solo 40 dà S=17 dopo offset.

Esito AI: PASS_AI. Risultato esatto: 40. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d86c866929e483914b25280157a56903141404eecd113aada13410194400996a; candidato SHA256 d9ad7ca7bec5b01a4aff73db5c3afd27495bbc52d6423731eb114edd1bbbd678; firma di lettura 31e2df03101f8404f96d22b34874fd167a0d2744842ea9545bab2c04ce6385c1.

## AR-u3-capillary-rise-16

γ=cr con c=50 Pa produce h=2c/(ρg)=100/10000 m=10 mm indipendente da r>0. Infinite coppie, anche in un intervallo positivo di piccoli raggi.

Ipotesi applicate: Tubo cilindrico verticale e serbatoio largo, quiete, stesso gas sopra menisco e livello esterno, densità del gas trascurata. ρ=1000 kg/m³,g=10 m/s², θ=0,γ positiva uniforme assegnata. Modello di colonna cilindrica che trascura il volume del menisco, non accuratezza universale del capillare reale. r,h positivi; h quota rispetto al serbatoio.

Alternative e feedback: La coppia (1 mm,50 mN/m) è un esempio. Una/due/nessuna confondono il numero di esempi con l’infinita scala libera.

Esito AI: PASS_AI. Risultato esatto: Infinite coppie. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 fcfe66afdd151ef45bc6171063929cd8ef4b4bbe9479c0a504161c69374ee87a; candidato SHA256 9d12f4937dcba3307a0fd7199715a96fe08277d9dbfb8e7dad80c11e12d889a1; firma di lettura 597d85da7d22f3cb89e7175d1f71f2dd925c0e144bd260ba798a59aaaa3868e3.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo rinnovo del binding, dei token e di ogni guardia d’edizione esclusivamente in memoria nel test: resta attivo l’oracolo distinto. Prove aggiuntive coprono fonte falsa, unità errata, lotti vuoti/parziali/duplicati, testo fisico falso a chiave corretta e SVG incorporato o locale mutato. Le guardie di testo/figura certificano l’edizione letta, non una comprensione semantica universale delle mutazioni.

Identità canonica verificata con assert_record_identity sui report fresh e salvati contro package e binding reali ROOT. I test Hypothesis esplorano ulteriori configurazioni dei cinque modelli; i controlli geometrici leggono i cinque XML. La suite generale e le anteprime finali spettano all’integratore. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.
