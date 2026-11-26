# Revisione indipendente — two-droplet-pressure-126

Revisore distinto dall’autore. Tutti gli 80 prompt originali B125–129 di U3-05 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Gli handoff dell’autore fornivano SHA, file e ipotesi generali, senza anticipare risultati numerici o chiavi. Nessuna chiave originale usata per la derivazione. Successivamente letti tutti i 16 record di questo lotto, ogni opzione, blocco, formula, hint, feedback, didascalia e metadato. Nessuna importazione di authoring e nessuna modifica ai candidati.

La competenza primaria C2-L010 è reale e tratta tensione superficiale, Laplace, capillarità ed energia di superficie. I prerequisiti C2-L001/L002/L004 appartengono al corso; non sono competenze inventate. Le ipotesi ideali esplicite delle schede delimitano ciascuna applicazione.

Edizione finale riletta: 501175a83f87be32d34db32c9d68e5992e343982. Package SHA256 f9d53c5c807a4527c1bb268a5c0cfd068f89cb8e4394c80799e728972fee349c; binding SHA256 f2c4beea9bb8d4096b21754452c11799a230a7a9923c12a8455f75d508486002. Oracolo indipendente SymPy, unità esatte con Pint e Fraction; aritmetica di risposta con AST limitato, senza eval né sympify di testo candidato. π e radicali restano simbolici. Valori del contratto: EXACT_ORACLE e AI_CONCEPTUAL; il secondo conserva la specifica prova fisica e non equivale ad assenza di ragionamento.

Ipotesi del lotto: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Figura: XML e rendering completo letti. Raggi 25/100 px a 25 px/mm per 1/4 mm. Barre a 10 px/Pa: 200,50,150 px per 20,5,15 Pa. B raggi 2/5 mm produce 10/4 Pa e D=6: barre 100/40/60 px alla stessa scala e origine. Si rappresentano salti rispetto allo stesso esterno, non pressioni assolute.

## AR-u3-two-droplet-pressure-01

D=2γ(1/r₁−1/r₂). Con γ=10 mN/m e raggi in mm, D=20(1−1/4)=15 Pa; il comune esterno si cancella.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 20 è il salto della piccola, 5 quello della grande. Differenza 15, non somma 25 né doppio 30.

Esito AI: PASS_AI. Risultato esatto: 15. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ca9b1e5fc0f6debe8d3e8868f1f488315cb1550ccc51841f369d648618004088; candidato SHA256 2eb1bedefebc5c9ed44a5259812fb5aa025dd23d7e1267a3bdb0cb44cb8c8f33; firma di lettura 87af765714144e566c25891eb41396f9ff69c87ff77ec4d69e8dec49d890da99.

## AR-u3-two-droplet-pressure-02

Pressione: [γ/r]=N/m²=Pa. Anche la differenza di due pressioni è in Pa; nessun calcolo numerico autonomo richiesto.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: N/m è tensione, N forza, mm lunghezza; N/m² è pressione. Il comune esterno non è un’unità addizionale.

Esito AI: PASS_AI. Risultato esatto: Pa. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 1408520e3e646d5ee2a137c7d1ba3f7f6faeb4eca091eb9d6729d659384a5134; candidato SHA256 1e3d9cf8f7d2cb403abdc1a20d83fb7353053e8e632f52198bcebdc1f70b5222; firma di lettura 9058a2a94094ea31fe95cc954ea9bf219c7bb653d1401239b386031ea477eeaf.

## AR-u3-two-droplet-pressure-03

p₁=p_e+2γ/r₁ e p₂=p_e+2γ/r₂; sottrarre elimina p_e e conserva la differenza dei reciproci, D=2γ(1/r₁−1/r₂).

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: Ordine contrario cambia segno; reciproco della differenza non è differenza dei reciproci; moltiplicare per raggi cambia dimensione; quattro introduce una seconda interfaccia assente.

Esito AI: PASS_AI. Risultato esatto: D = 2 γ (1/r₁ − 1/r₂). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 4160c00b29bdf573ce37354fb011c94358851ba8d654100c71a7cf918bba1fe7; candidato SHA256 21c890b3898de599600b92550bf492937210d6f46ce8d82a06b04d593f39ddab; firma di lettura f9cc42a83c2fcf8b125c591d2cc11d72cadf84e279af76afd5c9432bb1b82519.

## AR-u3-two-droplet-pressure-04

r₁ da 1 a 2 mm, r₂=4: D passa da 15 a 20(1/2−1/4)=5 Pa. Resta positivo perché 2<4.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 30 raddoppia erroneamente, 10 non sottrae il secondo salto corretto, 15 ignora r₁ nuovo; zero richiederebbe raggi uguali.

Esito AI: PASS_AI. Risultato esatto: Da 15 a 5 Pa. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e49c253648b7936e009899204f31940ac1ae12fff0226dff26056570b0d110fb; candidato SHA256 a4520afb45a13ea6f9f78cf36b1fab94e379d280d962c4ee1daba20cc5cc9a77; firma di lettura 15bd64fbd27e1593c9d333baaabe3cb496ce4c7108df3a40e7034f5901686969.

## AR-u3-two-droplet-pressure-05

1/r₁=D/(2γ)+1/r₂. Nelle unità Pa/mm, 15/20+1/4=1 mm⁻¹; invertire dà r₁=1 mm.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: Usare solo 2γ/D ignora la curvatura della seconda sfera. L’inversa deve ricostruire D con r₁<r₂.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 db54ce15cb5942af1f5b6759f2faaaede6b4519eb8bfa05f1c6be715b7fc7fd7; candidato SHA256 d59d1f00868c5ab7293c606e12bb3ac53b840ebd49a062e326a68c1617f5686b; firma di lettura 49201be26a35cec71dcd4d47b01d00c465c3a2ba725c1c79b57d0b1e63952366.

## AR-u3-two-droplet-pressure-06

1/r₂=1/r₁−D/(2γ)=1−3/4=1/4 mm⁻¹, quindi r₂=4 mm. Occorre 0<D<2γ/r₁ per r₂ finito positivo e ordinato.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: Cambiare il segno nel denominatore non ricostruisce D; il denominatore deve restare positivo. Zero o valore negativo non è un raggio fisico.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8b748acf44aea40e0f49eb15dfcbc4b7b80a5256c09def42eca342534d59cb34; candidato SHA256 6599c5eb9156a46d5a591dd3a1fc11e4d028cfc587a64fcc6271c44800322da5; firma di lettura 7850a257cc9ffb1b232c6d74d8a72b7cc7edd1b6e7882fad725d787778dd2914.

## AR-u3-two-droplet-pressure-07

r₂=2 mm a r₁=1 dà D=20(1−1/2)=10 Pa. Rapporto 10/15=2/3.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 3/2 reciproco; 1/2 segue solo r₂ senza la differenza; 2 inverte la tendenza; 1 ignora la modifica.

Esito AI: PASS_AI. Risultato esatto: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8f62a54f66260419190f90f046a2aa81e29c5b264e9b2fa4121b73dae70ff1e7; candidato SHA256 b055488cc5dd18b6ba9931eef20ab8b6c0b4db3a8d3569c1dde91f4ca8334151; firma di lettura dc299a19cfe0b9867d37793b21e14daa50b700cec68b62d39bfee6bb00e30e3f.

## AR-u3-two-droplet-pressure-08

Proposta 30 meno D=15 dà +15 Pa. I salti singoli 20 e 5 Pa si sottraggono, non si sommano.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: −15 ordine inverso, 30 proposta, zero accetta, 45 somma proposta e corretto.

Esito AI: PASS_AI. Risultato esatto: 15. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 30e455aa1c273bbed3102dd403c24f77ab476e86ba832e24fb79eafbedcdeb08; candidato SHA256 7ccdaacb88d242d68e8c22a36e4b7bd2dd1917721bb78fbb00e4d10dbb165d8f; firma di lettura ac7df61b8e477bc2df8774316f24c7833647c6596812aeaae2cfdf187fa88708.

## AR-u3-two-droplet-pressure-09

Riordinare D/(2γ)=1/r₁−1/r₂: r₁=1/[D/(2γ)+1/r₂]=2γr₂/(D r₂+2γ). Denominatore positivo.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: Meno al denominatore non isola r₁; parentesi non invertita è curvatura; 2γ/D trascura r₂; ultima sottrae dimensioni diverse.

Esito AI: PASS_AI. Risultato esatto: r₁ = 1 / [D/(2 γ) + 1/r₂]. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 33909ca11e5ae57fd10beb3cc1d468fa17051abb0add2cda54d8319c0291b53e; candidato SHA256 082eec7ad64f49830ce21f69a884e60aa64fe1249473e2f61095ffab18ba4c3b; firma di lettura 0a9735cf5aefaff8072d9212b8e3b0b7f99a4de56a5eec7ffbaaf01bf493bf9f.

## AR-u3-two-droplet-pressure-10

Il rapporto è [1/(κ₁r₁)−1/(κ₂r₂)]/(1/r₁−1/r₂). Equivalentemente (κ₂r₂−κ₁r₁)/[κ₁κ₂(r₂−r₁)]; richiede κ₁r₁<κ₂r₂.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: κ₁/κ₂, κ₂/κ₁ e 1/(κ₁κ₂) perdono la differenza pesata; κ₁κ₂ ha tendenza errata. Per κ₁=κ₂=k, rapporto vero 1/k.

Esito AI: PASS_AI. Risultato esatto: [1/(κ₁ r₁) − 1/(κ₂ r₂)] / (1/r₁ − 1/r₂). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 d0cb951e1c00d26b9e78599b7364b18f72e8b705c18adfb2a39f8099d9c7f333; candidato SHA256 928e592e73ebdde9f585a18f7ca68ac2e5ead575efdbebd572a39d6387c28d4d; firma di lettura 7eaeae45a182a052a873d5809dfed78da0507723f53493cd7add308aa6e58e4a.

## AR-u3-two-droplet-pressure-11

B con raggi 2 e 5 dà D=20(1/2−1/5)=6 Pa; rapporto 6/15=2/5.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 5/2 reciproco; 1/2 e 4/5 seguono un solo raggio; 6 è valore di D in Pa e non rapporto.

Esito AI: PASS_AI. Risultato esatto: 2/5. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 6a0df18fac94436b62ef55c461ac58c45328d05e0a31e433d5ef45046b7b638a; candidato SHA256 55f840a879540dc1898c14e436bc7fe3f7611f9873c2008c79925fe5336345d9; firma di lettura 44764f1397723ced24ebd1c61d7a12585703ad6d9041dcc0ad0ecaa3459264d9.

## AR-u3-two-droplet-pressure-12

Media (15+6)/2=21/2 Pa. Raggi medi 3/2 e 9/2 danno 80/9 Pa; differenza 21/2−80/9=29/18 Pa.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 21 somma, 9/2 semidifferenza, 80/9 modello ai raggi medi, 6 sola B.

Esito AI: PASS_AI. Risultato esatto: 21/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 17336714b8273075b94694e6e9f9b00e0101447b9fd23600f2c0526967045550; candidato SHA256 fb50961c58448cbbfa5aac34e87be5a0df10c8074e53f15817d659aabf6c5658; firma di lettura c4c73edacbaf5b482922644300bbd9eb671cc60c50bc618ad26e0169e030bbdf.

## AR-u3-two-droplet-pressure-13

Target D=6, r₁,B=2: 1/r₂,B=1/2−6/20=1/5 mm⁻¹. r₂,B=5 mm, rapporto rispetto a 4 pari a 5/4.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 4/5 reciproco; 2/5 copia il rapporto pressorio; 2/1 copiano raggio piccolo o nessuna variazione, non il target.

Esito AI: PASS_AI. Risultato esatto: 5/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 00a698d3452656b0ac1eaef8c7b6ae7b71d38723935d51d672868d01cfc03d4a; candidato SHA256 d976b91b1058439e71fd6a63250ef4874eeb5be0fda134c9b47ac659023671b1; firma di lettura 198d267c27c0dad4a022017621110ee16ac59f4a49d2389a7416c5af92632f64.

## AR-u3-two-droplet-pressure-14

Riferimento D=15,S=45 dà q=3 Pa⁻¹. S_B=18 dà D_B=6; r₂,B=5 implica 1/r₁=3/10+1/5=1/2 e r₁=2 mm.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: 18 è display; prima dividere per q=3 e solo dopo invertire la curvatura. r₁=2 riproduce 6 Pa.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 1a0ce462de034b3c4cc2ff25fdca6145b9e3d79ed2297136fc725a0583b7ff5d; candidato SHA256 fe1e688ec5facccc2b90bdcd9e4bfee8e4c7b1451558dbedb685be628f59ce04; firma di lettura e47ae7751c5ed2ae9ba9700e1bca7e3d3575c79cbdc9c487569ecbc7860e3aa6.

## AR-u3-two-droplet-pressure-15

A D=15,S=31 e B D=6,S=13: q=2 Pa⁻¹,z=1. S_C=11 dà D=5; r₂=4 implica 1/r₁=1/4+1/4=1/2, r₁=2 mm.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: r₁=1,4,5/2,1/2 danno D=15,0,3,35 Pa; solo 2 dà D=5 e S=11. Il caso 4 è anche il limite di raggi uguali.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 693da694685f0bc10e49222c0d03f97cb8ace6164b55f052b06f6101b7538717; candidato SHA256 026f7264f928583d11b9d313a26a39a4114f4e66129b36b90f66f1922d31aebc; firma di lettura 56ac410ff172054bed57dba171ae3ec4da501b1a4f8d759233e585ee0aa1d230.

## AR-u3-two-droplet-pressure-16

r₁=r₂/4: D=2γ(4/r₂−1/r₂)=6γ/r₂. A D=15 Pa, r₂=60/15=4 mm e r₁=1 mm. Unica soluzione positiva ordinata.

Ipotesi applicate: Sfere a singola interfaccia statiche, γ=10 mN/m comune e costante, stesso esterno. 0<r₁<r₂, D=p₁−p₂>0; nessuna pressione esterna assoluta dedotta e nessuna legge di moto o stabilità. Nuove prove conservano ordinamento dei raggi.

Alternative e feedback: La proporzione r₁=r₂/4 non lascia scala libera quando D è noto: 6γ/r₂ è strettamente decrescente e determina un unico r₂.

Esito AI: PASS_AI. Risultato esatto: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 978bc471e34d3955734764f2fae67e8a35a310802a5874f007b8afec791dcf20; candidato SHA256 306cd56d86443bcfe5235fff213972d8faf913b0d09304ba9c259182350c7d4f; firma di lettura 8632bf5c3362b4e8ee24dc6203f7b8146cf4a37c4d5da6b84aab509fdd173b15.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo rinnovo del binding, dei token e di ogni guardia d’edizione esclusivamente in memoria nel test: resta attivo l’oracolo distinto. Prove aggiuntive coprono fonte falsa, unità errata, lotti vuoti/parziali/duplicati, testo fisico falso a chiave corretta e SVG incorporato o locale mutato. Le guardie di testo/figura certificano l’edizione letta, non una comprensione semantica universale delle mutazioni.

Identità canonica verificata con assert_record_identity sui report fresh e salvati contro package e binding reali ROOT. I test Hypothesis esplorano ulteriori configurazioni dei cinque modelli; i controlli geometrici leggono i cinque XML. La suite generale e le anteprime finali spettano all’integratore. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.
