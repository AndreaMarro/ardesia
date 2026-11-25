# Revisione indipendente — couette-force-115

Revisore distinto dall’autore. Nessuna importazione del modulo autore e nessuna modifica ai candidati. Tutti gli 80 prompt originali U3-04 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Nessuna chiave originale usata per concludere la verifica. Successivamente letti tutti i 16 record di questo lotto: consegna, alternative, ogni formula, hint, feedback, didascalie e metadati C2. Le lezioni reali C2-L005/L006/L007/L008/L009 sono state rilette nel lavoro U3-04.

Edizione candidata congelata solo dopo la lettura: bd85f8e9e1d2429d751c817b9e6df6fcbbffdcd5. Package SHA256 3162c51890e5785c9a79a161f2da49e2347080966019d0b3458f3b827593ef5a; binding SHA256 f0199634ea1d6823483934ed6a69f29456799490a7f61554ee63b5a47150067b. Oracolo SymPy distinto dal calcolo dell’autore; unità SI controllate con Pint e Fraction, scelte numeriche lette con AST aritmetico limitato. EXACT_ORACLE e AI_CONCEPTUAL sono i soli valori del contratto, senza equiparare una firma a una prova matematica.

Finding originale nel feedback 02: «Pa è lo sforzo per area» introduceva una divisione per area ulteriore. Correzione dell’autore bd85f8e9 riletta: «Pa è l’unità dello sforzo tangenziale». Soli feedback/error e binding del record 02 modificati; altri 15 record, tutte le chiavi, formule e SVG identici. Distinzione dimensionale forza/sforzo verificata separatamente.

Ipotesi del lotto: Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.

Figura: XML e rendering completo letti. Separazione 180 px a 180 px/mm, frecce velocità a 50 px/(m/s): lunghezze 100,75,50,25 a quote 240,285,330,375 e zero 420; punte su retta da (200,420) a (300,240), profilo esattamente lineare. Diagramma isolato piastra: frecce opposte 100 px a 5 px/N per ±20 N, risultante nulla, non terzo principio. Grafico a η=1: origine(100,1510), v 50 px/(m/s), F 5 px/N, retta fino(300,1310) passa per (2,20),(4,40).

## AR-u3-couette-force-01

A/d=10⁻²/10⁻³=10 m. Profilo w(y)=vy/d, gradiente v/d; τ=ηv/d e F=τA=20 N per η=1, v=2. Forza liquido −20 N, applicata +20 N sulla stessa piastra.

Controllo delle alternative e del feedback: La forza esterna non è la risultante. Forza del liquido e applicata agiscono sulla stessa piastra, senza formare una coppia di azione e reazione.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 20. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a6cc3bcb38438a73fdfd47c11bd697130e3a915b1562826106004939876a0833; candidato SHA256 5d4020af07dd9808bbe7fea48a858dc26c51cbe9e207bb65c3ffa53212eb48f7; firma di lettura 75e0478712b60039d27889dea999e9ccb335a4ffdfcc0df950868f612a18c5e1.

## AR-u3-couette-force-02

Gradiente v/d ha unità s⁻¹, η Pa·s produce τ Pa e moltiplicare A dà N. Pa è già unità dello sforzo, cioè forza per area; nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: Pa misura lo sforzo, Pa·s la viscosità, m/s una velocità e N/m una forza per lunghezza. Omettere A lascia uno sforzo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: N. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 bcda8496856556bc73e37b5c95f78bcd847e08aac98d3819d129bb44eedceaf9; candidato SHA256 a2663fdd0be5e9a399faf0abe65fdfad5443f40502eac3adf5ea990d9518e2bc; firma di lettura 0a7a0db18946154790142e5bbaf1a6b532373ca2bd11a2e0c33af91568124402.

## AR-u3-couette-force-03

Fluido τ=ηγ̇ con η finita e τ≠0 impone γ̇≠0, quindi deformazione continua. Solido ideale τ=Gγ, G>0, può equilibrare con γ=τ/G finita. Distinguere tasso s⁻¹ e deformazione pura, nessun calcolo numerico autonomo richiesto.

Controllo delle alternative e del feedback: Il fluido può sostenere pressioni normali e scorrere con η>0. Una risposta statica finita è elastica, non viscosa newtoniana.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Il fluido continua a deformarsi; il solido può equilibrare lo sforzo con una deformazione finita. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 f5c77c5b57bbe8fea63eeb9c56c9c06336d947b43e6049c798d17b0d7f7cd852; candidato SHA256 c07b2c737884ff4d2c0120f1985750d78918c3e9cc3cda39823752183a97984e; firma di lettura 0dd70622af2baf595c31a1c38423e13b0e05cd6fc65beb8e53569e8b6d446000.

## AR-u3-couette-force-04

η da 1 a 2 a v=2 e geometria invariata: F 20→40 N. La forza viscosa opposta cambia allo stesso modulo.

Controllo delle alternative e del feedback: 10 usa una dipendenza inversa; 80 quadra il fattore; 20 ignora η; zero non equilibra l’attrito positivo.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: Da 20 a 40 N. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e4af820b9a4aaf2f6826db7d55752d21151edacc990bd13b3750da0e15895f78; candidato SHA256 666d9ec7c000bad86effb66de41668d6fadf8380cf96124037717d9b1dcc8f76; firma di lettura bc76db129d1e76a965bf206fd0a42de6724b691096d9dc8e4aac704bdc928a15.

## AR-u3-couette-force-05

η=Fd/(Av)=20·0,001/(0,01·2)=1 Pa·s. F/v da solo richiede ancora d/A.

Controllo delle alternative e del feedback: F/v senza d/A non è viscosità. Moltiplicare per A/d dà unità diverse.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 37fc02b79506250e0c969ecdfb323a4d92453905d48e86aa2261895a341f78b0; candidato SHA256 4eccde8dd2c0b0814ed278896740971ce65be13c5e8fcc37ab69b5310bdae3fb; firma di lettura bcc4ccfb2c644ad8845a7e28d11cd643e2f2c8364034f9d3c052334ee9bf52af.

## AR-u3-couette-force-06

v=Fd/(ηA)=20·0,001/(1·0,01)=2 m/s. Coefficiente ηA/d=10 N·s/m, non massa.

Controllo delle alternative e del feedback: 20 è il numero della forza. F/m non è il passaggio richiesto, perché la forza assegnata non è la risultante.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 9e2af366991c2687703b68e73aec7f9990a7f02d37fbb16b6c26ca55b16b0acc; candidato SHA256 221dd985d7b82fb087165f5f48121ad36fbb89b8d952830626696f43893f051c; firma di lettura f6d550b0af52c88092d00810327735beaa804dc29131ae35f4a38f13e6f0184a.

## AR-u3-couette-force-07

v=2→1 dimezza gradiente, τ e F:20→10 N. Rapporto 1/2; potenza Fv invece scala 1/4.

Controllo delle alternative e del feedback: 2 è il reciproco; 1/4 descrive la potenza Fv; 4 ne è l’inverso; 1 ignora la velocità nuova.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 1/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3ca45cd34969bee1aee63d9403b6ec057fc0ef1858e079e5e53864dda017d540; candidato SHA256 4e1e99da512f48c7c85c1ac4cc0de58b382628259f1296c4654082fbf2f04d5f; firma di lettura d75d9d82bb1add8abadc5aeb5e6aa71a5f68483c80dca0ec47276a7801f355b1.

## AR-u3-couette-force-08

Forza corretta 20 N; scarto 40−20=+20 N. Forza non bilanciata 40 N romperebbe lo stato stazionario assegnato.

Controllo delle alternative e del feedback: −20 inverte l’ordine; 40 copia la proposta; 0 la accetta; 10 dimezza lo scarto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 20. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8da9cd39f094971ac693f355ded0a99685cc1cc82a6f6b3347de36093b0b6051; candidato SHA256 0b2fed93d26072a9fb2a9d77935c042e158e9c696ba5f0b9a02478860718f619; firma di lettura ddbe5460e21e84cff0c1e30f97633c69a7d0bfaf54fad462872cd44bf7b42fbf.

## AR-u3-couette-force-09

Fd=ηAv; dividere per Av>0 dà η=Fd/(Av), unità N·s/m²=Pa·s. Conversione d=1 mm→0,001 m necessaria.

Controllo delle alternative e del feedback: Scambiare A e d capovolge la geometria; v al numeratore è errato. La reciproca è 1/η e omettere v altera le dimensioni.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: η = F d / (A v). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 6ee73ca5c3886a562c7cb1d7d6eb5863cd738f2a5e2054e051993bcbab38e725; candidato SHA256 a492cdfb68cdec4ec9dc1751ac62c9e98f6ed341eb57a27ca32db9fdaa084d42; firma di lettura 19715ab300d4ce1dc1e6410d502821e476faeafa37950a323a2834756e8331e1.

## AR-u3-couette-force-10

F_B=κ₁η_A A κ₂v_A/d; cancellare geometria e dati A restituisce κ₁κ₂.

Controllo delle alternative e del feedback: I quozienti invertono una dipendenza diretta; κ₂² appartiene alla potenza; la somma darebbe due per stati identici.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: κ₁ κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 4d7ea557979f7866de6fcc636b778ad5b05bb6b71ba7238fdfd659f3333982f7; candidato SHA256 076f49e53cfab42dd835c5510ae8ed32548028460a6c23326bce20c0fe89ee19; firma di lettura ce8ac6a1d21fa186164a5297f772e8adfd91371c8562b9f2d2c2101e5c07413b.

## AR-u3-couette-force-11

η=2, v=4 danno F 80 N contro 20; rapporto 4. Forza maggiore non significa risultante accelerante.

Controllo delle alternative e del feedback: 1/4 è il reciproco; 2 varia un dato; 8 quadra v; 80 è la forza numerica finale, non il rapporto.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 cc83883c246cddf62d69f040a6f80f56476be95678ed0bdf94c0b62366bdfc61; candidato SHA256 da20892d4d54ecc26828e74a8b8740153b310e6bdcc4e40aee631f895544fee6; firma di lettura 8e36c0773f2880a1fbb752acae2b3924270e259419fe7137858b1a5dcc009112.

## AR-u3-couette-force-12

Media(20+80)/2=50 N. Ingressi medi η 3/2, v 3 danno 45 N, inferiori di 5 N.

Controllo delle alternative e del feedback: 100 è la somma; 25 dimezza ancora; 45 usa ingressi medi; 60 è la differenza.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 50. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 c043f6bb79750ca825fd65675e847863b0ef856259254050b61c65ae6ba4ffbe; candidato SHA256 9ba0c527996ff26e2c91e37df877b867c7e10f95af528bf69e47ec7d2bb26d1f; firma di lettura 22035f7bcc5393387aa576123c4f62b89e40e5faed42be463009d1d10eac46da.

## AR-u3-couette-force-13

Target 4·20=80 N a η=2 richiede v=4 m/s; rapporto con v_A=2 uguale 2.

Controllo delle alternative e del feedback: 1/2 è il reciproco; 4 ignora il contributo di η; 1 produrrebbe 40 N; 8 produrrebbe sedici volte F_A.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a01a781fecdb5ffec574a002dd00fd73c4e67a6030ce5671458567daccfe1615; candidato SHA256 4c45522ce4c31c9ff975c5ab1283f6514c9b6fcfea5591ae74b5b816c739be94; firma di lettura 838bb488fbfddf9fc6c0dfa5aafc1de6574fc7a88897d7e0aa31bb00a03f08f8.

## AR-u3-couette-force-14

Gain 60/20=3 N⁻¹; S_B 240→F 80 N. η=80/(10·4)=2 Pa·s.

Controllo delle alternative e del feedback: S grezzo 240 trattato come N dà η=6 Pa·s, non 2. Nel confronto varia anche v.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a5b9be942ab150614aa6542e26e65814f55a029d99412e48d72a72feadebea49; candidato SHA256 6ead89c88cb578efae7e839160eb16c8700a2c18f173ce1fbdd86ee0e720dff5; firma di lettura 4b78a86d080a03e244ec5babe0f2783bf53a373c3fddcdf270a62d6ebbbefb84.

## AR-u3-couette-force-15

Gain(161−41)/(80−20)=2 N⁻¹, z 1. S_C 81→F 40 N a v=2, quindi η 40/(10·2)=2 Pa·s.

Controllo delle alternative e del feedback: Viscosità 1,4,1/2,3 Pa·s a v=2 m/s generano letture 41,161,21,121. Solo 2 Pa·s dà 81.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3ac609ce751ebd68da006eeee41681a7ce51182730a58789add6f251e2d10b45; candidato SHA256 78ca9d8d232430a04dad12be51da2b39d0c355d0e4d9d3c2d5acab7b69c58c10; firma di lettura 6b6fc2c3032481480dde39925ee65b95f9b141273c1ea4b0e942d78df5730a23.

## AR-u3-couette-force-16

η=cv con c 1/2 Pa·s²/m dà F=c(A/d)v². Coefficiente 5 N·s²/m²;20/5=4 m²/s², radice positiva v=2 e η 1. Radice negativa anche η negativa: fuori dominio.

Controllo delle alternative e del feedback: 4 è il valore numerico di v²; il ramo negativo viola sia v>0 sia η>0. Il coefficiente ha unità fisiche e il vincolo vale fra prove.

Esito AI della lettura e dell’oracolo: PASS_AI. Risultato esatto atteso: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 d87a6552e5b870aa94594558045f0e26e947741e75d27f68d74cea7f74737d6b; candidato SHA256 b01c62c7ee4e992b6228d6a7639b54636c70aa6891a4d40a36786440c1a6b5f8; firma di lettura 7129931baefaca71f8b9e6c94fa643230eef27fc10f4f0e156205702d587d60b.

Controprove riproducibili: 24 per questo lotto, incluse tutte le 16 chiavi sbagliate con binding e ogni token/guardia d’edizione rinnovati esclusivamente in memoria dal test. Queste chiavi falliscono l’oracolo matematico o la risposta concettuale motivata anche dopo la sostituzione delle firme. Prove distinte per falsa fisica a chiave corretta, fonte falsa con token sostituiti, unità errata, lotti vuoti/parziali/duplicati e SVG incorporato o locale mutato. Le prove su testo e figura sono guardie dell’edizione riletta, non risolutori semantici universali.

assert_record_identity controllato sui report fresh e salvati contro i pacchetti e binding canonici reali. Le proprietà Hypothesis esercitano ulteriori configurazioni fisiche e i test leggono coordinate dei grafici, senza scritture nel registro o nei candidati. La suite completa e le anteprime finali sono responsabilità dell’integratore; questo report non le sostituisce. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana simulata.

Prova finale sui byte consegnati: `python -m unittest tests.corpus.test_cross_review_viscosity_networks -v` con runtime recovery, 11 test PASS in 3,504 s. Le cinque proprietà Hypothesis hanno 35 esempi ciascuna (175 configurazioni); gli altri test comprendono 80 identità fresh/saved, 80 hash fonte riletti da Git, unicità esatta delle alternative numeriche, AST limitato e geometria dei grafici. Tutti i 21 file di questa consegna controllati per singola newline finale e assenza di whitespace finale; SHA dei verificatori coerenti con i report salvati.
