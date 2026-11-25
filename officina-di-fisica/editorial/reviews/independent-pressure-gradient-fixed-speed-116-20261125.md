# Revisione indipendente — pressure-gradient-fixed-speed-116

Revisore distinto dall’autore. Nessuna importazione del modulo autore e nessuna modifica ai candidati. Tutti gli 80 prompt originali U3-04 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Nessuna chiave originale usata per concludere la verifica. Successivamente letti tutti i 16 record di questo lotto: consegna, alternative, ogni formula, hint, feedback, didascalie e metadati C2. Le lezioni reali C2-L005/L006/L007/L008/L009 sono state rilette nel lavoro U3-04.

Edizione candidata congelata solo dopo la lettura: 22ce296b900b571eb8cceed138c4255908569869. Package SHA256 9dffb9c8dadf490d92205c047d0f3a1abc2367f083bdbd03f39139a1880f8c18; binding SHA256 65b8bbe7fe3090e431db60f31c45f52dfbc415c8525b1ae1f95ecea98b9fd775. Oracolo SymPy distinto dal calcolo dell’autore; unità SI controllate con Pint e Fraction, scelte numeriche lette con AST aritmetico limitato. EXACT_ORACLE e AI_CONCEPTUAL sono i soli valori del contratto, senza equiparare una firma a una prova matematica.

Ipotesi del lotto: Tubo diritto orizzontale rigido circolare, liquido omogeneo newtoniano incomprimibile, η uniforme positiva. Laminare stazionario pienamente sviluppato e no-slip. Velocità media d’area imposta 0,01 m/s, non Q. Asse verso flusso, G=Δp/L>0 e dp/dx=−G. Prefissi mPa·s/mm convertiti in SI. Record 03: incomprimibilità costitutiva; 08: Re formula fornita senza soglia universale.

Figura: XML e rendering completo letti. Raggi disegnati di 40 e 80 px a 40 px/mm per raggi fisici di 1 e 2 mm. Segmenti radiali e due frecce esterne delle velocità medie, lunghe 100 px a 10000 px/(m/s), non un profilo uniforme. Barre di area normalizzata lunghe 80 e 320 px a 80 px per unità: rapporto quattro e stessa scalatura di Q. Grafico della pressione assoluta meno 99900 Pa, origine (100,1540), asse x a 300 px/m e verticale a 3 px/Pa. Ingresso (100,1240) pari a 100000 Pa; uscite (400,1480) e (400,1300) pari a 99920 e 99980 Pa. Pendenze −80 e −20 Pa/m, moduli 80 e 20 Pa/m, offset esplicito.

## AR-u3-pressure-gradient-fixed-speed-01

Q=πr²v̄ e Q=πr⁴G/(8η) danno G=8ηv̄/r². Conversioni: η=10⁻³ Pa·s, v̄=10⁻² m/s e r²=10⁻⁶ m². Pertanto G=8·10^(−3−2+6)=80 Pa/m. Il gradiente orientato dp/dx=−80 Pa/m è distinto dal modulo.

Controllo delle alternative e del feedback: −80 Pa/m è il gradiente orientato, mentre G è un modulo. 8000 e 0,08 risultano da prefissi o quadrati convertiti in modo incoerente.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 80. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f20e95bdc078ceaf0a9acbd4ec695f2e4080bb9273c00dc284037ba2562bbb78; candidato SHA256 90284e8273ad9fa3aab1b9d18fa232fa1b6a0cea658fba6d6f5118d15deb36f2; firma di lettura ed29d49711b06af4bd29c37bed9c0a4ab989c99687e4fb4b17ee4f73e00fef1a.

## AR-u3-pressure-gradient-fixed-speed-02

G è caduta di pressione su lunghezza, unità Pa/m e dimensione ML⁻²T⁻². Anche ηv̄/r² dà Pa/m. Nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: Pa è caduta di pressione; N forza; m/s velocità; Pa·s viscosità. G e Δp differiscono per una lunghezza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Pa/m. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 905fff01fb813cd1ba520e3dd061c7971d4a9e38934c8cb89fe2bf038b5888a2; candidato SHA256 451f7951cdab9c51d5db6d1e0cb22b341bbb49cb38bf6f7b2937c8a8d4b2d8df; firma di lettura a5754c14c4015e63fb0fbac56ed53cf030a557769dc902ca623162a78c7af601.

## AR-u3-pressure-gradient-fixed-speed-03

Massa di elemento materiale costante e incomprimibilità impongono volume e densità costanti lungo il moto. Non impongono η 0, né pressione o velocità spazialmente uniformi. Nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: η=0 è ipotesi inviscida. Pressione uniforme e profilo piatto non seguono dall’incomprimibilità; volume materiale fisso non impedisce la traslazione.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: La densità di ciascun elemento materiale resta costante; la viscosità può essere non nulla. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 32f68414554199f5108b678906b43e04801bde9164f4a36bf78f6c05511a20f7; candidato SHA256 72496da2cbe23ca0fb383d0eeb1762324565ee764d5a942c88df0f90e317f3dc; firma di lettura 2625eb307641ea42697e69f9cbe08608d8211e56ceb26ce6bb3a7ea747dedce5.

## AR-u3-pressure-gradient-fixed-speed-04

η=1→2 a r 1 e v̄ fissi: G 80→160 Pa/m. Area invariata, quindi Q invariata soltanto in questo confronto.

Controllo delle alternative e del feedback: 40 usa la viscosità al denominatore, 320 ne quadra il fattore. 80 o zero non mantengono la velocità media assegnata.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Da 80 a 160 Pa/m. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f5df5b10626dff39f19654d3d979ca5af0e7b9c2efdbbf3e2b908423497ad151; candidato SHA256 94255523a90626f8f14e4282d0c79504343654accaa2df45c01b982b5fe6834b; firma di lettura 7380c4fc153d86fb9a0a0dd65b2639179027e227e2581c201d28225f29292822.

## AR-u3-pressure-gradient-fixed-speed-05

η=Gr²/(8 v̄)=80·10⁻⁶/(8·10⁻²)=10⁻³ Pa·s=1 mPa·s.

Controllo delle alternative e del feedback: 10⁻³ è il valore in Pa·s, non in mPa·s. Il quadrato del millimetro introduce 10⁻⁶ nelle unità SI.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 5aa45fdc0c505a5a35ec26cf9af437a976afc68d0e16924e7bb0fb5b71430106; candidato SHA256 2fcc45c5b5f56ff88d2f9cf7b2b3ae1848414d1d4343a337996e712083eb7b1a; firma di lettura 531e664bec05f4297ac0dbc4d7aae17a7695776fa97289f48bcebac3f351c264.

## AR-u3-pressure-gradient-fixed-speed-06

r²=8 ηv̄/G=10⁻⁶ m². Radice positiva r 10⁻³m=1 mm; r² non raggio.

Controllo delle alternative e del feedback: 1 mm² esprime r², non il raggio. La radice negativa è incompatibile con la geometria.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 cf867ccebf85ef8067a91ef4f39e4d31e70be6388edfadfb9f583689870682fe; candidato SHA256 c78b01399b974ec3bf42fe7cf0a10b8ed5d5415298579f7d31978dd5d00f88ae; firma di lettura 09e60ea744e6c9d810b709bb5276c89395f43ace82d9ad79abf36324faab9665.

## AR-u3-pressure-gradient-fixed-speed-07

r 1→2 mm a η fissa: G scala 1/4,80→20 Pa/m; Q cresce 4 perchév̄ fissa. La quarta potenza inversa richiederebbe Q fissa.

Controllo delle alternative e del feedback: 4 inverte il verso della dipendenza. 1/16 varrebbe a portata imposta; 1/2 perde il quadrato e 1 ignora la modifica del raggio.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 fa4d08a924474aa0261145c5b456955ff6c3e1a9bce87d7968a294e7e0934554; candidato SHA256 85b78252c52384e4ad9a9a8854a84cbe32ebb4a9cd8145c64e36ee08f990474c; firma di lettura 47c7ca0c17bb41c8da6da89b5454e37f396d58df30584bedcfabf48b9be92483.

## AR-u3-pressure-gradient-fixed-speed-08

[ρv̄D]=(kg/m³)(m/s)m=kg/(m·s)=[η]. Re puro 1, senza calcolo numerico autonomo o soglia di transizione.

Controllo delle alternative e del feedback: Pa, m/s, kg/m³ e Pa·s sono unità dimensionali. La cancellazione delle unità di Re non prova che il regime sia laminare.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 fa1abfdac1dd5f7d5821815a817d28a2221ba8666261c9a8b8fb7e09760f00b5; candidato SHA256 0ab04da4524701337422a73aa4f48b3f9fe763f22e59887e5b2023b16d5a88bb; firma di lettura 8857c050d91797dabd1f45ffdd00b6f53f841ed9413854c9dc2238707cb4f4a0.

## AR-u3-pressure-gradient-fixed-speed-09

Moltiplicare G=8 ηv̄/r² per r² e dividere 8 v̄: η=Gr²/(8 v̄), unità Pa·s in SI. Per valori η in mPa·s e r inmm: η_num=G_num r_num²/80.

Controllo delle alternative e del feedback: Rimettere r² sotto inverte l’isolamento; un solo r perde una lunghezza. La frazione reciproca è 1/η; perdere otto sovrastima la viscosità di otto volte.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: η = G r² / (8 v̄). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 2cca8f35f5cbfb68c746fb4793a9c0ec5278490e205b82deb6c209a6404f5ba7; candidato SHA256 f479744cf1e4b8f926294e42d65c5b89623af9fbd82085c930e44c2038a836ee; firma di lettura 19e339e9082e4fd996ac8dd0249c2d01ca64a04aaac3e116d5c854401e2823d8.

## AR-u3-pressure-gradient-fixed-speed-10

η_B=κ₁η_A, r_B=κ₂r_A a v̄ fissata danno rapporto κ₁/κ₂².

Controllo delle alternative e del feedback: Il prodotto inverte l’effetto del raggio. La quarta potenza corrisponde a un controllo diverso, Q imposta. Il quadrato di η è errato e l’ultima scelta è il reciproco.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: κ₁ / κ₂². Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 21dd07ba4a29c9d80aff9a9bdd27469621c5bb56b76ff887ca996503f2d01fcb; candidato SHA256 1b57bcc89e72963acde80de22fc1d1bec978f1f13cc8d29835dd21df88dd008e; firma di lettura cc7bfef34b2e52d578977e39e692ce90b139e63c74916dc2953ef2822195f92f.

## AR-u3-pressure-gradient-fixed-speed-11

η 2, r 2: G=80·2/4=40 Pa/m; rapporto 1/2.

Controllo delle alternative e del feedback: 2 considera solo η; 1/4 solo il raggio;  1/8 usa r⁴. 40 è il valore finale numerico del gradiente, non il rapporto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e32cfc4419e386d4db0e27c553dea723d68257d76b86329eb234c93f34fc31f7; candidato SHA256 d4556eed86e2ef31e4f75b422d802e6ac7b6a9954cdca40b6d4adff8e49c4fbd; firma di lettura 05b76542b1a4ab4272b2f710b98e7fce97c5eadc0f191e7670fb7551e2fad7c0.

## AR-u3-pressure-gradient-fixed-speed-12

Media(80+40)/2=60 Pa/m. Ingressi medi η 3/2, r 3/2 danno 80·(3/2)/(9/4)=160/3; differenza 60−160/3=20/3.

Controllo delle alternative e del feedback: 120 è la somma; 30 dimezza ancora; 160/3 applica il modello agli ingressi medi. 40 è sia la seconda lettura sia la differenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 60. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a7729fe4c3f588d9d937d25f8ad24460c9bd6b16be3c19420277f7a08d0e45e2; candidato SHA256 3dda90e4c145dd61fc430e5c10dc4c3394e8b012a9e7309b9088de7f5756113f; firma di lettura 4e07e00dcea8f0ca1896e85f7a1531bb3c62f0aa05f280483d49d15738f0f011.

## AR-u3-pressure-gradient-fixed-speed-13

Target 40 Pa/m con η 2: (r_B/r_A)²=2/(1/2)=4, radice positiva 2.

Controllo delle alternative e del feedback: 1/2 è il reciproco; 4 è il rapporto dei quadrati. 3/2 darebbe G_B/G_A=8/9; 1 ignora il cambio geometrico.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 73c8a480e4af9ea71c4540a7d3499c5745c8578fab6a52ebf0969e879d4f4c9c; candidato SHA256 fabe470edb11e1d640ed9dd15e50e6efebb093f5a12be6ad0c10d3e290dafc5a; firma di lettura 40b5376319da3ef39d1b33600c24e68440edfb1ecdc22be01b31d048f05b6c66.

## AR-u3-pressure-gradient-fixed-speed-14

Gain 240/80=3 m/Pa. S_B 120→G 40 Pa/m; r=2 mm, η=40·4/80=2 mPa·s.

Controllo delle alternative e del feedback: Usare direttamente S=120 come Pa/m inferisce η=6 mPa·s. Prima si corregge la taratura, poi si applica l’inversa fisica.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 750c0658bfb5378def2a930914d81a379b79cecc90eda67319299af982c0c591; candidato SHA256 5733733695f8103b69a683f50fab5dc169e9d7b4ed8d631aecbdd709b8fe617b; firma di lettura fdd99fef1149c6f20ed9da9f80a603acfdafa1fef350003427e0097ec445a98a.

## AR-u3-pressure-gradient-fixed-speed-15

Gain(161−81)/(80−40)=2 m/Pa, z 1. S_C 321→G 160 Pa/m; r=1 mm richiede η=2 mPa·s.

Controllo delle alternative e del feedback: Viscosità 1,4,1/2,3 mPa·s generano letture 161,641,81,481. Solo 2 mPa·s genera 321.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 80c0e1d88d574c1d98ac21fcda8b9022a68112c1d1c5b8555187d233fcfac465; candidato SHA256 06468179eded83e49d2bc8bef3941ff6ee9cec419985e24ab86212ecbd654fad; firma di lettura 7f5ea2c9719f6c5e95fede63f026d49112c52ada6733e490ac36ede15a40a581.

## AR-u3-pressure-gradient-fixed-speed-16

c 1 mPa·s/mm=1 Pa·s/m. Sostituire η=cr dà G=8 cv̄/r; r=(8/100 Pa)/(80 Pa/m)=10⁻³m=1 mm. η=1 mPa·s, unica soluzione positiva; nessuna radice residua.

Controllo delle alternative e del feedback: Zero è fuori dominio; un raggio negativo imporrebbe anche viscosità negativa. Il vincolo vale fra prove, senza variazione di viscosità lungo il tubo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 af5928066c9be77d7837c3669592b77fc1197bd362640b7a0647534ffb8bdd79; candidato SHA256 8e915a48db3d24259c721d8ff0eac4ed825f23c547c85c9373ea8a1e34474055; firma di lettura 67220b329c8bb1534c7b34850fe071c01a8205e723ab33c1b6c2df9347459748.

Controprove riproducibili: 24 per questo lotto, incluse tutte le 16 chiavi sbagliate con binding e ogni token/guardia d’edizione rinnovati esclusivamente in memoria dal test. Queste chiavi falliscono l’oracolo matematico o la risposta concettuale motivata anche dopo la sostituzione delle firme. Prove distinte per falsa fisica a chiave corretta, fonte falsa con token sostituiti, unità errata, lotti vuoti/parziali/duplicati e SVG incorporato o locale mutato. Le prove su testo e figura sono guardie dell’edizione riletta, non risolutori semantici universali.

assert_record_identity controllato sui report fresh e salvati contro i pacchetti e binding canonici reali. Le proprietà Hypothesis esercitano ulteriori configurazioni fisiche e i test leggono coordinate dei grafici, senza scritture nel registro o nei candidati. La suite completa e le anteprime finali sono responsabilità dell’integratore; questo report non le sostituisce. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana simulata.

Prova finale sui byte consegnati: `python -m unittest tests.corpus.test_cross_review_viscosity_networks -v` con runtime recovery, 11 test PASS in 3,504 s. Le cinque proprietà Hypothesis hanno 35 esempi ciascuna (175 configurazioni); gli altri test comprendono 80 identità fresh/saved, 80 hash fonte riletti da Git, unicità esatta delle alternative numeriche, AST limitato e geometria dei grafici. Tutti i 21 file di questa consegna controllati per singola newline finale e assenza di whitespace finale; SHA dei verificatori coerenti con i report salvati.
