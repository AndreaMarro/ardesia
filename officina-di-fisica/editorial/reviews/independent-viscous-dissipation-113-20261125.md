# Revisione indipendente — viscous-dissipation-113

Revisore distinto dall’autore. Nessuna importazione del modulo autore e nessuna modifica ai candidati. Tutti gli 80 prompt originali U3-04 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Nessuna chiave originale usata per concludere la verifica. Successivamente letti tutti i 16 record di questo lotto: consegna, alternative, ogni formula, hint, feedback, didascalie e metadati C2. Le lezioni reali C2-L005/L006/L007/L008/L009 sono state rilette nel lavoro U3-04.

Edizione candidata congelata solo dopo la lettura: bd85f8e9e1d2429d751c817b9e6df6fcbbffdcd5. Package SHA256 cf11d0679d6fecf271cce52b6638dd6c36964bd0d67e64b4a708af6f39c6ec6c; binding SHA256 b4ad452f1bc4c5f3d1229da2e5ef089f5868c1db37e9748e53f4fc01948b32b7. Oracolo SymPy distinto dal calcolo dell’autore; unità SI controllate con Pint e Fraction, scelte numeriche lette con AST aritmetico limitato. EXACT_ORACLE e AI_CONCEPTUAL sono i soli valori del contratto, senza equiparare una firma a una prova matematica.

Finding originale nel feedback 16: nove era attribuito impropriamente a una radice dei ventisette ottenuti. Correzione dell’autore bd85f8e9 riletta: Q=9 L/s nel vincolo dà (2/3)·9³=486 W, non 18 W. Soli feedback/error e binding del record 16 modificati; altri 15 record, tutte le chiavi, formule e SVG identici. Le firme precedenti non approvano la nuova edizione.

Ipotesi del lotto: Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.

Figura: XML e rendering completo letti. Due frecce da 120 px a 40 px/(L/s) per Q=3, pressioni assolute 106/100 kPa. Diciotto caselle da 1 J in tre gruppi di sei per tre litri in 1 s: conteggi energetici, non geometria. Grafico a R=2: Q 50 px/(L/s), P 10 px/W, origine(100,1500); Bezier(100,1500),(200,1500),(300,1180) dà esattamente P=2 Q² con Q=4 t, P=32 t², punti(2,8),(3,18),(4,32).

## AR-u3-viscous-dissipation-01

R=2, Q=3: Δp=6 kPa e P_d=Δp Q=18 kPa·L/s=18 W. Esatto 1 kPa·L=1000·10⁻³ Pa·m³=1 J.

Controllo delle alternative e del feedback: 6 è Δp, 9 è solo Q² numerico. Potenza dissipata positiva distinta dal contributo resistente negativo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 18. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d620bb0860462ee89177a2f2b1a6792cda7b5a6f7d2e07c314f2ecf260d1cf3e; candidato SHA256 ab065def106b64cc20393536bdd54e1ed88db8ebb950702f6ae42af6fd270288; firma di lettura a79c3207dd514b2ca86c08d983a621b9aaa2db40129aa5a72ee89a1a8c10fb30.

## AR-u3-viscous-dissipation-02

Pressione per volume al secondo dà energia per tempo, ML²/T³. I prefissi kPa e L si cancellano: 1 kPa·L/s=1 W. Nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: J energia, kPa pressione, L/s portata, kPa·s/L resistenza; per energia occorre anche durata.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: W. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 50d77dee057b7cc24a17e60316056555b90c0d2b81c622e879f2d3376b9097d4; candidato SHA256 2ed94ed84d0640c09552138eddb84c09e0f4fdd786c9f1fdf346c4f82bb2fb29; firma di lettura bf16f16f26c74dab6be553271a9b79eb36b6fcfb024bb54d58276e1ecbcb054e.

## AR-u3-viscous-dissipation-03

Lavoro pressorio netto d W=Δp d V. Dividendo per dt: P_d=Δp Q. Sostituire Δp=RQ produce RQ²; le due Q hanno ruoli fisici distinti.

Controllo delle alternative e del feedback: RQ è pressione; R/Q² e Q²/R hanno dipendenza e dimensioni errate; fattore 2 non richiesto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: P_d = R Q². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 56cc8135b0b33268bbca566059fe1c6d5f2eb7135f58f15295e9d611e972b366; candidato SHA256 41f541affd48edf7dc4fea5fae2d72032022c3c0d4d33e144883dc49557d11a6; firma di lettura d5ca7bc11adfab071f7df262d1eed41ccc164c3057d78d9eece616a748a2d806.

## AR-u3-viscous-dissipation-04

Q=3 costante, R da 2 a 3: P_d=2·9=18 e 3·9=27 W. Δp da 6 a 9 kPa.

Controllo delle alternative e del feedback: 12 inverte fattore R; 81/2 quadra erroneamente 3/2; invariata e nulla non rispettano RQ² positivo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Da 18 a 27 W. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c556b6685fe75011f2b2a0ad569352e8758f1d75eb3f6ca6efece1f093758f6d; candidato SHA256 7bac4a4b077f677cf8aff0df19348e3614c4cce2338102184d98d5685525e616; firma di lettura 5c718733605710b2f57a0d7c7ffe587e4a16f8d4a42d876fa58ab42fdada8a4c.

## AR-u3-viscous-dissipation-05

R=P_d/Q²=18/9=2 kPa·s/L, perché W/(L²/s²)=kPa·s/L.

Controllo delle alternative e del feedback: Dividere solo per Q dà 6 kPa, non resistenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8ab1f2faffe8966480574b7d8f7a4356731c45b93a78f70a5b7458a8cffa4691; candidato SHA256 d1dd26a6173f956689833d8a90b48aff1c99ea7c05b95bac0b7f824f9e90da8e; firma di lettura d0f6b418bd2ac9a39fd17ec0ab12fabe743f61f437815e564b515c51ac62a15a.

## AR-u3-viscous-dissipation-06

Q²=P_d/R=18/2=9 L²/s². Q=3 L/s, selezionata positiva dal verso dichiarato e non dalla sola dissipazione.

Controllo delle alternative e del feedback: 9 è Q²; −3 viola Q>0, anche se RQ² resta positivo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d46e1b2a25f071d64c583db1a06778f6300844805f77973c561353b071d3e156; candidato SHA256 7cf0031b89681f3e027602916060b38969e26b8083cd13e09adc2fc09d91f7ef; firma di lettura 89c2a39e12c546ae8c088297fea1decdf0e923c474a6b32c94b181239eb423f7.

## AR-u3-viscous-dissipation-07

R=2, Q_B=2: P_B=8 contro P_A=18 W. Rapporto 8/18=4/9.

Controllo delle alternative e del feedback: 9/4 reciproco; 2/3 solo rapporto Q; 3/2 inverso di Q; 1 ignora variazione.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 4/9. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a3e9544b727374016bc17e405309e13951c85b01f8b64c592f8d66664186ca2d; candidato SHA256 247af5aa0949eb0dac3e723ab03374a0c0cdd2fa8765cef1d7c55ff17de8728b; firma di lettura e047054b9a6bde588cd412a4941adc053b3709c25590ab06695f4747773522c5.

## AR-u3-viscous-dissipation-08

Scarto 36−18=+18 W. Non confondere segno dell’errore con potenza resistente −18 W nel bilancio meccanico.

Controllo delle alternative e del feedback: −18 ordine invertito; 36 proposta; 0 accetta; 9 dimezza errore.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 18. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d11cfd1a5b46ba046c9d25c28a522c2714d86583363705a711ec9652ef8502fe; candidato SHA256 e800482bc4648b5013d98a8a3180f30b8f1a62ad81c7974a76365f34b18a8ab5; firma di lettura a169039523b5062eb20bebf4aeebc07467b9df42c0b2fc6c00a78ac189dcfbe8.

## AR-u3-viscous-dissipation-09

R compare linearmente: dividere P_d=RQ² per Q²>0 dà R=P_d/Q², senza radici.

Controllo delle alternative e del feedback: P/Q pressione; P Q² operazione inversa; Q²/P conduttanza; radice altera dimensione.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: R = P_d / Q². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 2f0f8ab82c2f2582b0a72332d788096276f5a33c1b886905d6c9152a48d410b6; candidato SHA256 db7f0c9c467b5f743ed855faaf2bb8efac5ae036dc5b94b7f565d8a1c6f06163; firma di lettura 2db3a9fa120b9d3f2183fbbfaca7ed9a911e5887adeeabafd17fd63df0b54b5e.

## AR-u3-viscous-dissipation-10

Scalare R→κ₁R e Q→κ₂Q dà P_B=κ₁κ₂² P_A. Il quadrato riguarda Q e non R.

Controllo delle alternative e del feedback: κ₁κ₂ perde Q; κ₁²κ₂ quadra variabile errata; quozienti invertono dipendenze.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: κ₁ κ₂². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 a93233489d1d7299d891a28259cf3cab9e0ade1447b94eb0596cebcea9eb8fe2; candidato SHA256 6ae8b2e73af1a2471697fbbfc16ccd377c2ad07e09a7d06809854841ff409531; firma di lettura 1923ee1aa845e62ed3a80148349703f41e3360326b39bc61809884b8709223d9.

## AR-u3-viscous-dissipation-11

B: R=3, Q=2, potenza 12 W; rapporto 12/18=2/3=(3/2)(4/9).

Controllo delle alternative e del feedback: 3/2 solo R; 4/9 solo Q²; 1 compensazione falsa; 12 è potenza numerica.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 1a2d255271f8c6fe2e8e9fa1711f6ed36449824c70aa2ef0c49d5697d261d228; candidato SHA256 52f31eba7f23335ae40f36139a0c4cf4c491824a4042f63b4ecbb7cc479e0283; firma di lettura 14e7dbcc68a9965118923d0ad1877d75f8673b3fde71ba388b9686708d32c469.

## AR-u3-viscous-dissipation-12

Media (18+12)/2=15 W. R_media=5/2, Q_media=5/2 dà 125/8 W, maggiore di 15 per 5/8 W.

Controllo delle alternative e del feedback: 30 somma; 15/2 doppia metà; 125/8 ingressi medi; 6 differenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 15. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d04879d8ae0739c57b1470ee126c1eb5e3f5a77322769ba9b31639fdcb818b3e; candidato SHA256 c5321ebe1812f46a6d646ef9996a2adf26f110638b8469a0cf6b9cc68b2e70cf; firma di lettura 016c67fd3831cc024a59097c68c4d5fa4cfdf071464f1adba76b91232424c287.

## AR-u3-viscous-dissipation-13

Target (2/3)18=12 W, R_B=3: Q_B²=4, Q_B=2 L/s e rapporto 2/3.

Controllo delle alternative e del feedback: 3/2 reciproco; 4/9 quadrato del rapporto; 2 copia Q_B; 1 produrrebbe 27 W.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2/3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7400db3fcf15d182ec07f808c47100d666f7b27f44c20c049cedf6f8f8ee289f; candidato SHA256 16e855391651a9a5a699fa8c4c915fd9f03e81faf39b2a4000484fa290d86178; firma di lettura ba54808c805d8c0482e475817dab65d5aa6e6d1d4dc583fae6f4f17ecec17a47.

## AR-u3-viscous-dissipation-14

Gain 54/(18 W)=3 W⁻¹. S_B=36 dà P_B=12 W; Q_B²=4 lascia R_B=3 kPa·s/L.

Controllo delle alternative e del feedback: S grezzo 36 W darebbe R=9, triplo; quadrato di Q resta necessario dopo decodifica.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e8eb0d450311057b6ed208b11d9986361ca8dc044b5638f6ef3f203806822c47; candidato SHA256 f0842f17b515d06a6e5ecbdca26cb6bcee015d0ee3d2330c7caa405bcc956541; firma di lettura 7bfe14db2988aee04761dbe51595bbb7a4115a2dbc6458e68982ce8319bb296b.

## AR-u3-viscous-dissipation-15

Gain (37−25)/(18−12)=2 W⁻¹, offset 1. S_C=55 dà P_C=27 W; Q_C=3 porta R_C=27/9=3 kPa·s/L.

Controllo delle alternative e del feedback: R=2,4,1,6 con Q=3 danno S=37,73,19,109; solo R=3 restituisce 55.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c9196eea7497f247acc381818b2060510fcb4a3d70b26f1785959546f868fea6; candidato SHA256 94e5fd1724622a521c26f0f1a62ed2d7bfa74f92d8f74d9329b10053284e08ab; firma di lettura 0661555e2ee626b22d11984a2a20a47f3a52f5d170e3d50bc873dee351ff132a.

## AR-u3-viscous-dissipation-16

R=c Q con c=2/3 kPa·s²/L². P_d=c Q³; 18/(2/3)=27 L³/s³ e Q=3 L/s, R=2. Cubo positivo crescente: unica soluzione. Controprova Q=9 dà c Q³=486 W, non 18.

Controllo delle alternative e del feedback: 27 è il cubo numerico, −3 non risolve il cubo positivo. Q=9 L/s produce 486 W, escluso dal bilancio; non attribuire 9 a √27.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 3. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7447a485d0618578cdc66a2af734ec77f07a3f735316952f91e828d836d0b9f3; candidato SHA256 ada015fceb48c470611c14bcffa83f48c32119dad3d0194583bb91d2c7dd8fd9; firma di lettura 0a4b8240e12bd82656ff544a34282f84cea4d5a28064e8115b1c2e1a6fa54421.

Controprove riproducibili: 24 per questo lotto, incluse tutte le 16 chiavi sbagliate con binding e ogni token/guardia d’edizione rinnovati esclusivamente in memoria dal test. Queste chiavi falliscono l’oracolo matematico o la risposta concettuale motivata anche dopo la sostituzione delle firme. Prove distinte per falsa fisica a chiave corretta, fonte falsa con token sostituiti, unità errata, lotti vuoti/parziali/duplicati e SVG incorporato o locale mutato. Le prove su testo e figura sono guardie dell’edizione riletta, non risolutori semantici universali.

assert_record_identity controllato sui report fresh e salvati contro i pacchetti e binding canonici reali. Le proprietà Hypothesis esercitano ulteriori configurazioni fisiche e i test leggono coordinate dei grafici, senza scritture nel registro o nei candidati. La suite completa e le anteprime finali sono responsabilità dell’integratore; questo report non le sostituisce. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana simulata.

Prova finale sui byte consegnati: `python -m unittest tests.corpus.test_cross_review_viscosity_networks -v` con runtime recovery, 11 test PASS in 3,504 s. Le cinque proprietà Hypothesis hanno 35 esempi ciascuna (175 configurazioni); gli altri test comprendono 80 identità fresh/saved, 80 hash fonte riletti da Git, unicità esatta delle alternative numeriche, AST limitato e geometria dei grafici. Tutti i 21 file di questa consegna controllati per singola newline finale e assenza di whitespace finale; SHA dei verificatori coerenti con i report salvati.
