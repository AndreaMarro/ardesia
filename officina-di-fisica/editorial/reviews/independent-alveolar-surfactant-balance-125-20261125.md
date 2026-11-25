# Revisione indipendente — alveolar-surfactant-balance-125

Revisore distinto dall’autore. Tutti gli 80 prompt originali B125–129 di U3-05 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Gli handoff dell’autore fornivano SHA, file e ipotesi generali, senza anticipare risultati numerici o chiavi. Nessuna chiave originale usata per la derivazione. Successivamente letti tutti i 16 record di questo lotto, ogni opzione, blocco, formula, hint, feedback, didascalia e metadato. Nessuna importazione di authoring e nessuna modifica ai candidati.

La competenza primaria C2-L010 è reale e tratta tensione superficiale, Laplace, capillarità ed energia di superficie. I prerequisiti C2-L001/L002/L004 appartengono al corso; non sono competenze inventate. Le ipotesi ideali esplicite delle schede delimitano ciascuna applicazione.

Edizione finale riletta: 15fd7152b040ad03b626784fa1d3ad6d31264633. Package SHA256 9388e316261f4a1f872956930a978e8105c2a45456fc92f14aa484e6f56c2e29; binding SHA256 9c4a47dc149c7d32647ed9f05c07444bb36dfabfe2e20426c49028ed3a48380e. Oracolo indipendente SymPy, unità esatte con Pint e Fraction; aritmetica di risposta con AST limitato, senza eval né sympify di testo candidato. π e radicali restano simbolici. Valori del contratto: EXACT_ORACLE e AI_CONCEPTUAL; il secondo conserva la specifica prova fisica e non equivale ad assenza di ragionamento.

Finding originale 125-02: la frase definiva erroneamente il joule come newton per metro. L’autore ha corretto in 15fd7152 «un joule è il prodotto di un newton per un metro». Ho riletto il blocco completo nella copia ROOT e confrontato il pin finale: solo quel testo e il binding 02 sono cambiati; gli altri 15 record e tutte le chiavi, formule e figure sono identici. J=N·m e J/m²=N/m sono ora coerenti. Nessun giudizio finale riferito all’edizione difettosa.

Ipotesi del lotto: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Figura: XML e rendering completo letti. Raggi 40/80 px a 40 px/mm per 1/2 mm; tensioni 20/40 mN/m danno Δp=40 Pa in entrambe. Semisfera e forze sono dichiarate schematiche. Grafico origine (100,1340), endpoint (500,1140), scale 400 px per u e 5 px/(mN/m): γ_p=40u. Punto (300,1240) dà u=1/2,γ_p=20; estremi aperti. Nessuna inferenza clinica o di stabilità.

## AR-u3-alveolar-surfactant-balance-01

I salti uguali danno 2γ_p/R_p=2γ_g/R_g. Cancellare due e moltiplicare per R_p: γ_p=γ_g u=40·1/2=20 mN/m.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 40 copia γ_g; 10 dimezza ancora e zero annulla una tensione necessaria a curvatura finita. La relazione deve conservare il salto uguale.

Esito AI: PASS_AI. Risultato esatto: 20. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8a6d5f4aab695d116e2459076f910a107be1f855bfc3fa744060e01575c58a9c; candidato SHA256 4d14f609a3437d086db7243ecf55584be6dd5b53d31fbd632fab91a41d3894d9; firma di lettura b467d02aae09600df39a21cfa8e81645dadffc70e5bf4be892e1bec8ab8e19c8.

## AR-u3-alveolar-surfactant-balance-02

[γ]=F/L; J=N·m, dunque J/m²=N/m. mN/m è una tensione, non pressione. Nessun calcolo numerico autonomo richiesto; la giustificazione dimensionale resta necessaria.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: Pa è F/L², mN forza, m lunghezza, J energia. Il finding originale J=N/m è corretto dall’autore in J=N·m e riletto separatamente.

Esito AI: PASS_AI. Risultato esatto: mN/m. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 3c5e632a4e34903b5cbd21b2e1731874934c7318c9b410ca6787c00754ab58c9; candidato SHA256 fe056dbeb96b7b76cc1569679e3a5c6ff84e5ad8072efdd334522cac443eba7d; firma di lettura 09d19aaf8556405feba21d18bdeba207dab8d88348b847496944c2616ac60bc5.

## AR-u3-alveolar-surfactant-balance-03

Con esterno comune, p_p=p_g equivale a γ_p/R_p=γ_g/R_g. Moltiplicare per R_p produce γ_p=γ_g u, non una previsione di stabilità.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: Dividere per u capovolge l’effetto dei raggi; fattore due superfluo, u² altera la legge, γ_g da sola ignora i raggi diversi.

Esito AI: PASS_AI. Risultato esatto: γ_p = γ_g u. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 c72d13dacbe15609e77d9a955f0db676c361e5f5b90a1805d58bea9f969725a3; candidato SHA256 045e0a6b9a48ab211fbae8cd1fe7993157e0e026296cd0836925cc00f9eba3a0; firma di lettura 4e5b3ba455318575aa1f972406642205918f71aec031e1f5e34828ecbfd75e4e.

## AR-u3-alveolar-surfactant-balance-04

A u=1/2, γ_g passa da 40 a 30: γ_p passa da 20 a 15 mN/m, fattore 3/4.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 30 copia la tensione grande; 40/20 non applicano la variazione; 10 dimezza senza il fattore 3/4 corretto.

Esito AI: PASS_AI. Risultato esatto: Da 20 a 15 mN/m. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e71d683fa6cd1bf40ac5f33a209df6bcfa3a0dd34bac42a28656a186737ed06d; candidato SHA256 0ec7cc8a7769ffa65b0fffe549846ff069940ecf35c5a982b1178b8009c1f77c; firma di lettura c4e50ddf176dc5444b108cbf366e651a1ae2859772b588d4129fb78cf6bb9f49.

## AR-u3-alveolar-surfactant-balance-05

Dividere γ_p=γ_g u per u>0: γ_g=20/(1/2)=40 mN/m. Ricomposizione 40·1/2=20.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 20 copia γ_p senza dividere per il rapporto; un valore sotto γ_p è incompatibile con u<1.

Esito AI: PASS_AI. Risultato esatto: 40. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ea3a163b1c7f18148db9b1659bade609478199853639295f63bac7015bd51615; candidato SHA256 05c3953aa79ceb2250cb86fc633666291a6ae899404152e73abfe23411fa7663; firma di lettura 658b94506a1bb765f2111525ca5b9fcf917dc04efbf8c3c7913408dcc9bf0caa.

## AR-u3-alveolar-surfactant-balance-06

u=γ_p/γ_g=20/40=1/2, positivo e minore di uno come richiesto dai raggi ordinati.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 2 inverte il rapporto e viola u<1; 1/4 quadra inutilmente; 1 uguaglia i raggi; 20 copia una tensione come rapporto.

Esito AI: PASS_AI. Risultato esatto: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8c33c7212b9449e99578ee966f41d446e5461546e4b1ade59a513ff71659a0c4; candidato SHA256 7df63119f95601a668b88519dd90871b4d0ff69d6d8ed6df751bb008d1101486; firma di lettura cf5e11da7261819ead580873462208fe93fd8f87f3459c7c7eb23e2819122342.

## AR-u3-alveolar-surfactant-balance-07

A γ_g=40, u_B=1/3 dà γ_p,B=40/3. Rapporto (40/3)/20=2/3, senza decimalizzare.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 3/2 reciproco, 1/3 copia u_B, 1/2 ignora il confronto fra u, 1 ignora la variazione.

Esito AI: PASS_AI. Risultato esatto: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 9c680d27caa9253978fbd94f47b4307ea9bf07e142cf2171bb45c6b5a13fa3db; candidato SHA256 caf1304c6b8670dc2f40f8de5e173f1838d708111d4a27e937fd81f4c4f9be9b; firma di lettura 9d26cece1a19c582d554a53d368c37307bf74c35c86f97105b5040a10081587d.

## AR-u3-alveolar-surfactant-balance-08

Proposta meno corretta: 40−20=+20 mN/m. Il segno positivo indica una sovrastima, non il verso di una forza.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: −20 inverte la sottrazione, 40 è la proposta, zero la accetta e 10 dimezza lo scarto.

Esito AI: PASS_AI. Risultato esatto: 20. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c90860296d9710f787e626791c9298b9d062ab76f2c86e5790e865017ef3299e; candidato SHA256 ee1f63bb3ca0e05eaf8c66de56c8bfa706d6561b11e7a5f3d2713e00453e167c; firma di lettura 433b8276d9a47802e2bd9f964d7f51174c90575971875c6ae9a57102e69a06ef.

## AR-u3-alveolar-surfactant-balance-09

Da γ_p=γ_g u, isolare γ_g=γ_p/u. Dimensione N/m perché u è puro; prodotto γ_p u non inverte la legge.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: γ_p u moltiplica anziché dividere; u/γ_p è tensione inversa; u² introduce una potenza indebita; γ_p−u sottrae dimensioni diverse.

Esito AI: PASS_AI. Risultato esatto: γ_g = γ_p / u. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 9e3ec12c9ef7bbdb03f1e005c534d6d7f913038f2bac5330388260418a5a144d; candidato SHA256 f52feba6d918f34fcc01a943f93cb1236688ec9af04ddebf223c440cea4623b7; firma di lettura 7146237ae8f78143438b318af48c0d163935e5b9b5c117376e732bf38c412273.

## AR-u3-alveolar-surfactant-balance-10

Sostituzione fra prove: γ_p,B=κ₁γ_g,A κ₂u_A. Diviso γ_p,A dà κ₁κ₂; occorre κ₂u_A<1.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: I quozienti invertono un fattore diretto, il quadrato extra non deriva da Laplace, la somma dà due per prove identiche.

Esito AI: PASS_AI. Risultato esatto: κ₁ κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 d66afe1d38d3fbc4d338bdc869989afdfbf0bc858d74d3bc4439eb6939c3af8d; candidato SHA256 1a2f05a3863e2cc0b029a25572a3d015986c90b741a78b810bd27bf84f3b35ad; firma di lettura 5f7fa42aa6c53b1b93260f5cd1d7ef344d696da86c51fa37cdd8cc0ed916ddd5.

## AR-u3-alveolar-surfactant-balance-11

B: 30·1/3=10 mN/m. Rapporto 10/20=1/2, uguale al prodotto (3/4)(2/3).

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 2 è il reciproco; 3/4 segue solo γ_g e 2/3 solo u; 1/4 aggiunge un dimezzamento inesistente.

Esito AI: PASS_AI. Risultato esatto: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d3fa4a0b77833fccafed4c1fd24b5314cd053fd384de655eb2defbf980463d96; candidato SHA256 d6f32aa234cd68054d16eeaaf74b6bb8d17d538ac61ca0dd867088dc01263ab0; firma di lettura 192b2d75dc2e29e42e53bf091af29072609197e0654f7ccfe5e0079c3d98cd40.

## AR-u3-alveolar-surfactant-balance-12

Media (20+10)/2=15 mN/m. Ingressi medi 35 e 5/12 danno 175/12; differenza 15−175/12=5/12 mN/m.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 30 è somma; 175/12 è il modello agli ingressi medi; 10/20 copiano una sola uscita. La discrepanza è 5/12, non arrotondamento.

Esito AI: PASS_AI. Risultato esatto: 15. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e8644642f2909a623006738cf48ada3615e68a03bf4c1a6bdf7552749820e14c; candidato SHA256 3a60525270bf8f5a581cdb17bfea1f3484ff5796e586b28ec2181c016573b92d; firma di lettura 51d7a2645d14c8ce83b0461306f5a0f66b8839b58b5a4ad5492d710cd65458b0.

## AR-u3-alveolar-surfactant-balance-13

Target γ_p,B=10 a γ_g,B=30: u_B=1/3. Rapporto con u_A=1/2: (1/3)/(1/2)=2/3.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 3/2 reciproco, 1/2 copia il rapporto fra le tensioni piccole, 3/4 solo γ_g; 1/3 è u_B e non il rapporto richiesto.

Esito AI: PASS_AI. Risultato esatto: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 dc83fd48d03101b17668a4935592b85d0469868bd5f0911d52e528ddbb9d326e; candidato SHA256 fe402ffef4e120dbc6d973f60418b9c795a5d729cafa914e90e7f0d6539331b3; firma di lettura 0a9959bbc7c1c1f3a214ea5910cbfba8eb521ac9c159a73f37f839ff505678fd.

## AR-u3-alveolar-surfactant-balance-14

Riferimento γ_p=20 e S=60: q=3 m/mN. S_B=30 dà γ_p,B=10; dividere per u_B=1/3 restituisce γ_g,B=30 mN/m.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: Il display 30 è adimensionale; qui coincide numericamente con la risposta solo dopo due operazioni diverse. Prima calibrare, poi imporre il rapporto.

Esito AI: PASS_AI. Risultato esatto: 30. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 98a81225bfc8721654f1b9c11e3ee97d8e30cbc7076ef3040c4aba582465cff8; candidato SHA256 5251053911bb8ebefa0a74cc53fce7f89c35400a8cbad4354b23f986dc5beba3; firma di lettura b6f49e3dd267915f2caf1afcdd67982832f2fce1f2ec7e45e4e614ecc8460cd0.

## AR-u3-alveolar-surfactant-balance-15

Riferimenti γ_p=20,10 e S=41,21: q=2 m/mN, z=1. S_C=31 dà γ_p,C=15; u_C=1/2 porta γ_g,C=30 mN/m.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: 15 è γ_p,C; 20/40 sono parametri della prova A; 31 è S_C. Soltanto 30 con u=1/2 ricostruisce S=31.

Esito AI: PASS_AI. Risultato esatto: 30. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 35dea95b446e7af3d298d0eef8f40415a72c9fb4f11ff2384bf1ad45bcd5108f; candidato SHA256 3c06e1541f0f8c1fded4c01e3539b3428346f22a90d637cc6dab4f68c8574792; firma di lettura 1bca60d8ba68185e66e4dfd251790c0ea78a106c1b66b5b7a2f4c9e44098f8b4.

## AR-u3-alveolar-surfactant-balance-16

γ_g=c u, c=80 mN/m: γ_p=c u². Dato 20, u²=1/4; u=1/2 è l’unica radice in (0,1), mentre −1/2 viola il dominio. γ_g=40 mN/m.

Ipotesi applicate: Due cavità sferiche statiche a singola interfaccia, stesso esterno e interni richiesti uguali. 0<R_p<R_g, u=R_p/R_g in (0,1), tensioni positive uniformi; gravità, tessuto e dinamica trascurati. Nessuna deduzione di stabilità o efficacia clinica. I parametri cambiano solo fra prove.

Alternative e feedback: −1/2 fuori dominio; 1/4 è u²; 2 e 1 non sono rapporti di raggi ammessi. Unicità dalla monotonia di u² su u>0.

Esito AI: PASS_AI. Risultato esatto: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3b09a5c156299b49f717c63cf93c4b7c5ca8c0a5f16a857729277b76e912a63b; candidato SHA256 819fd418e898db6dff5a8ac0db10ed93ee045a71f27b6caa2df1e350bb2303ce; firma di lettura b0cf429b14ac8656f7b3a240780432cf015714b8d41d9943f9035ede0cc9196f.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo rinnovo del binding, dei token e di ogni guardia d’edizione esclusivamente in memoria nel test: resta attivo l’oracolo distinto. Prove aggiuntive coprono fonte falsa, unità errata, lotti vuoti/parziali/duplicati, testo fisico falso a chiave corretta e SVG incorporato o locale mutato. Le guardie di testo/figura certificano l’edizione letta, non una comprensione semantica universale delle mutazioni.

Identità canonica verificata con assert_record_identity sui report fresh e salvati contro package e binding reali ROOT. I test Hypothesis esplorano ulteriori configurazioni dei cinque modelli; i controlli geometrici leggono i cinque XML. La suite generale e le anteprime finali spettano all’integratore. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.
