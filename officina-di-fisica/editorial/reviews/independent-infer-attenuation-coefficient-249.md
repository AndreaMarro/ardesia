# Revisione indipendente — infer-attenuation-coefficient-249

Tutti gli 80 originali sono stati derivati nella primaria prompt-only SHA 6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08 prima di opzioni/chiavi/candidati. Modelli propri eseguiti e congelati in 24cf4060 prima della prima lettura candidata. Il modello iniziale rimane conservato; dopo lettura è stata aggiunta soltanto la guardia che rifiuta B ricostruito negativo nel caso di fondo. Non sono stati importati moduli autore o aperta la primaria B dei miei quesiti.

Lettura integrale successiva di tutti i 16 prompt, alternative, blocchi, formule, hint, feedback e metadata. C5-L06/L07 reali rilette integralmente, C1-L001/L002 verificati nel catalogo. I tre chiarimenti autore 24501/24603/24704 in 539e12af sono stati riletti integralmente e confrontati con strictdiff; altre 45 schede e tutte le chiavi/formule/SVG immutate. Nessuna mia modifica ai candidati.

Cinque SVG XML e nuovi PNG indipendenti completi effettivamente letti dopo processo reale exit 0. UI prodotto NOT_RUN. SCI è una review AI distinta, human NOT_RUN, DRAFT, publicationAction NONE; integrazione ROOT ancora PENDING.

## AR-u7-infer-attenuation-coefficient-01

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. Con I=4 mW/m² e d=1 cm, quanto vale a in cm⁻¹?

Derivazione e conti manuali: La legge I=I₀exp(−μd), I₀ = 64 mW/m², dà a=μ/ln 2=log₂(I₀/I)/d. Con I 4 e d 1 cm, rapporto 64/4=16=2⁴: a 4 cm⁻¹. L’argomento del logaritmo è un rapporto puro, non una intensità dimensionata.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: a = 4 cm^-1: 64/4=2^4, d = 1. Il valore 16 copia rapporto, 2→I 16, 8→I 1/4.

Figura: XML e nuovo native completo 640 × 1600 letti. Prime barre 320/160/80/40/20 per 64/32/16/8/4 a spessori 0, 1/4, 1/2, 3/4, 1 cm; tutte stessa scala 5. Coefficienti a 4/1/5/2 con barre 320/80/200, scala 80. Caso autonomo fondo: barre totali 240/160/120 per 24/16/12, scala 10 e tratto grigio 80 comune per B 8. Contributi blu 160/80/40 per 16/8/4, differenze 8/4 e q 1/2. Nessuna imposizione dell’I₀ = 64 di altre domande.

Esito indipendente: 4. Fonte SHA256 39505106c95ecc814c0937a8306bd8b38c5ee58c56a38ec48f46aee7f6be11da. Candidato SHA256 d0ad96c5ac623734bbde30e4c98654b904efd9a1cdd2c53e2ca1d3c8ce54f8f7. Firma sulla sola edizione letta: ec42d3aa67b43cf04aa1d3b2bf954897e4b17f45a2e1930a747873475da342d6.

## AR-u7-infer-attenuation-coefficient-02

Quale unità è adatta ad a=μ/(ln 2), se μ è un coefficiente lineare di attenuazione?

Derivazione e conti manuali: a=μ/ln 2 ha inverso di lunghezza, non il numero normalizzato α. Nella primaria nessuna alternativa era aperta; dopo il congelamento tutte e cinque sono state lette individualmente.

Ipotesi e dominio: Caso dimensionale autonomo; tutte le alternative confrontate dopo la primaria.

Alternative e controprove: a inverso di lunghezza perché ln 2 puro; cm d, 1 alpha, W/m² I, J energia.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: cm⁻¹. Fonte SHA256 ca3bb01db561d0f566c0e88b5a8ca12eb6ebbbbd731dd3f59a448f5220cd3fbd. Candidato SHA256 dc8b7717553375479da07c0406cc645838246098b5b91ef5dce39018df528a70. Firma sulla sola edizione letta: 7c58c775d7ff2cd5d47c08c3bcad24625a39b4cbf9e2162eabfeed5ece23561b.

## AR-u7-infer-attenuation-coefficient-03

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. Quale formula dà il numero α del coefficiente nelle unità assegnate?

Derivazione e conti manuali: La relazione fisica è a=ln(I₀/I)/(d ln 2), con I₀ = 64 mW/m² e 0<I<I₀. In numeri i=I/(1 mW/m²), x=d/(1 cm), a/(1 cm⁻¹)=log₂(64/i)/x. μ=(ln 2)a: non si aggiunge un secondo cm⁻¹ a un a che ha già quell’unità.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: log₂(I₀/I)/x: rapporto inverso negativo, prodotto con x non inversa, rapporto senza logaritmo confonde esponente, quadrato assente.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: α = log₂(I₀ / I) / x. Fonte SHA256 cc0067214bc6474d154e49ccf5f32ca747878a5eabd228607cd3a0673d061420. Candidato SHA256 29c318bc9472990ce15df2c4584b38aeb79a94f28a60f3689c3d833bab23f9e2. Firma sulla sola edizione letta: 8ef6e30c91713614bce578100e1fee4db8df0e556db9dab2cd788bc3a25630b8.

## AR-u7-infer-attenuation-coefficient-04

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. A usa I=4 mW/m² e d=1 cm. B usa I=16 mW/m² allo stesso d. Come cambia a?

Derivazione e conti manuali: A d 1 cm, I 4→16 mW/m² riduce log₂(64/I) da 4 a 2, quindi a 4→2 cm⁻¹. Una maggiore intensità trasmessa a parità di incidente e spessore indica minore attenuazione.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: a 4→2 a stesso d. 16 segue I direttamente, 1 proporzione 1/I erronea, 4 ignora, negativo amplifica.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: Da 4 cm⁻¹ a 2 cm⁻¹. Fonte SHA256 5dcc1a734b9454276acaaec22b5e2a9d3e1d4f73ba36f4c896a662add1f39074. Candidato SHA256 8476ea28e88952bfc4b79457b651c6e4249b33d5be0a9a72f887ec0fb76d671b. Firma sulla sola edizione letta: 9cf19ef1ad1999a57f0cd822817008976e3af74e41cc0747f86f32e1801c0641.

## AR-u7-infer-attenuation-coefficient-05

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. Si conoscono a=4 cm⁻¹ e d=1 cm. Quanto vale I in mW/m²?

Derivazione e conti manuali: Da a d=log₂(I₀/I), I=I₀ 2^{-ad}. Per a 4 cm⁻¹, d 1 cm l’esponente è 4 e I=64/16=4 mW/m². Il prodotto ad è puro.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: I 4=64/16; 16→esponente 2, 1024 segno+, 64 nessuno strato.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 4. Fonte SHA256 fe13a13c0fd54acdf5794204b1be9f219cf1a6ca8bd1648f3bce18b321a1580c. Candidato SHA256 4f55a79a874109e56b92282bf2f00d83f4abfe62f6df8839fd3fb27fdc47fa9a. Firma sulla sola edizione letta: 475abac15946636d67015012d465754da1fefb7ffc23d9d3fd19515108cb02d7.

## AR-u7-infer-attenuation-coefficient-06

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. Si conoscono a=4 cm⁻¹ e I=4 mW/m². Quanto vale d in cm?

Derivazione e conti manuali: Isolo d=log₂(I₀/I)/a. Con I 4 mW/m², logaritmo 4 e a 4 cm⁻¹, segue d 1 cm. Tutti i denominatori sono positivi finiti.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: d 1 cm=4/(4 cm^-1); 4 dà 16 dimezzamenti, 1/4→I 32, 2→1/4.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 1. Fonte SHA256 48b22cf515f30372c264791c2946e02cfb88b1e70e88296b24447b661fbad560. Candidato SHA256 f55897ee1069e838fd4ef5e8fda8de987ecb1519b3c7b196bd670863f2d06724. Firma sulla sola edizione letta: 7e5611617798f990f915e259870e634bd1e755fd0972884e5e72dee8115de67a.

## AR-u7-infer-attenuation-coefficient-07

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. A usa I=4 mW/m², d=1 cm. B ha lo stesso I ma d=2 cm. Quanto vale a_B/a_A?

Derivazione e conti manuali: A a 4 cm⁻¹. A I 4 fissata ma d 2 cm, B dà a 2 cm⁻¹. Rapporto 1/2: le prove descrivono coefficienti inferiti diversi, non lo stesso materiale a spessori diversi con identica trasmissione imposta senza spiegazione.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: 1/2 da a 2/a 4; 2 reciproco, 1 forza lo stesso μ, 1/4 e 4 quadrati.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 1/2. Fonte SHA256 284212e34bb6873678ff0d11888ffee146396508ff778ebfa1a3ce101de74e9b. Candidato SHA256 f95b3ddc5bb39ffe2bc20e2d9b4a7b46e374e19b9aaa608d039ce2a707939667. Firma sulla sola edizione letta: 8c7758e9f40f4047327cb459e1e461f43b8ef3bd304557cb3944ecd5f4a6239f.

## AR-u7-infer-attenuation-coefficient-08

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. Per I=4 mW/m² e d=1 cm viene proposto a=8 cm⁻¹. Quanto vale proposta meno corretto?

Derivazione e conti manuali: Proposto 8 cm⁻¹ meno corretto 4 cm⁻¹=+4 cm⁻¹. Il numero puro 2 è il rapporto delle proposte, non lo scarto del coefficiente.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: +4 cm^-1=8−4; −4 ordine, 2 rapporto, 8 proposta, 0 ignora la verifica I 1/4.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 4. Fonte SHA256 b988150cd9b98c697add032ef4400b7f66405ada94b658ebfbffe0cc9feaba8e. Candidato SHA256 4ddc64ef217067596970681eba473b2adb0adbdbc050ffc613b80ddd3de64398. Firma sulla sola edizione letta: 8d95b15a8f5d4001639e5b467dcc6b456a6497e93d36e149293af56fd2c7fa90.

## AR-u7-infer-attenuation-coefficient-09

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. a e d sono noti. Quale formula isola I?

Derivazione e conti manuali: Da a d=log₂(I₀/I), esponenzio: I₀/I=2^{ad}, perciò I=I₀ 2^{-ad}. Nelle unità assegnate I/(1 mW/m²)=64·2^{-ad}. Con a, d>0 risulta strettamente 0<I<64 mW/m².

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: I₀ 2^-ad; segno+ amplifica, 1/ad non esponenziale, I₀−ad dimensioni diverse, 1/I₀ intensità inversa.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: I = I₀ 2^(−ad). Fonte SHA256 52f962d8bd6d62dd1231ba60c2ce920725b44d9d947a6419e13b6fe86b8bfaa0. Candidato SHA256 95f5762ae05cedaf6396462c38a68aab1948e3924441389f0b40bcb995c7947c. Firma sulla sola edizione letta: 94800d38f8947db36d00c11508d7cf0be66f82d6fd461476ee515a53bde1a1b9.

## AR-u7-infer-attenuation-coefficient-10

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. I_B=κ₁I_A e d_B=κ₂d_A, con κ₁,κ₂>0 e 0<κ₁I_A<I₀. Poniamo L=log₂(I₀/I_A)>0. Qual è a_B/a_A?

Derivazione e conti manuali: Con I_B=κ₁I_A e d_B=κ₂d_A, a_B/a_A=[ln(I₀/(κ₁I_A))]/[κ₂ln(I₀/I_A)]=[ln(I₀/I_A)−lnκ₁]/[κ₂ln(I₀/I_A)]. Occorre 0<κ₁I_A<I₀, oltre aκ₂>0. I logaritmi restano esatti; non è una semplice potenzaκ₁/κ₂.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: (L−log₂κ₁)/(κ₂L); rapporto direttoκ₁/κ₂ falso, κ₂/κ₁ inverso nonsalva, segno+ falso, prodotto senza logaritmo.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: (L − log₂ κ₁) / (κ₂ L). Fonte SHA256 02bb3d4aa4221f1eb11867ff4f43c796cb91aa3d3cf4ed20054014789db2f49c. Candidato SHA256 b453178721e1a4a48352a24e1e577cf42b51a925ad541c3e806ac008add50f4c. Firma sulla sola edizione letta: 395be7674ea22d7050f60fcb5aed4317ca94f464b86fbb01505cbbd1ec5deb04.

## AR-u7-infer-attenuation-coefficient-11

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. A usa I=4 mW/m², d=1 cm. B usa I=16 mW/m², d=2 cm. Quanto vale a_B/a_A?

Derivazione e conti manuali: A:I 4, d 1→a 4 cm⁻¹. B:I 16, d 2→a=2/2=1 cm⁻¹. Rapporto 1/4. I due cambiamenti riducono entrambi il coefficiente inferito.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: 1/4=aB 1/aA 4. 4 reciproco, 1/2 solo effetto, 2 rende diretto d, 1 ignora.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 1/4. Fonte SHA256 3d4bbcfec1a94aa807ec7947fd44058a478e3d8089b5ad3fc274c49512e47243. Candidato SHA256 2ce48fe5579376a2419553e30acfea09adfb6c2554ee34463ee2ea8f3d1ad710. Firma sulla sola edizione letta: 470742decdc46d1c48e91f41d9d9d18b85ceca59815403a7b4320d1de3af3774.

## AR-u7-infer-attenuation-coefficient-12

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. A usa I=4 mW/m², d=1 cm. B usa I=16 mW/m², d=2 cm. Qual è la media aritmetica dei due a con uguali pesi?

Derivazione e conti manuali: Media(4+1)/2=5/2 cm⁻¹. Ai dati medi I 10 mW/m², d 3/2 cm si avrebbe(2/3)log₂(32/5) cm⁻¹, forma simbolica esatta diversa. Poiché 4<32/5<8, quel valore è fra 4/3 e 2, quindi inferiore a 5/2 senza calcolatrice.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: 5/2 media 4/1; 3/2 semidifferenza,  5 somma, 4/1 una prova.

Figura: XML e nuovo native completo 640 × 1600 letti. Prime barre 320/160/80/40/20 per 64/32/16/8/4 a spessori 0, 1/4, 1/2, 3/4, 1 cm; tutte stessa scala 5. Coefficienti a 4/1/5/2 con barre 320/80/200, scala 80. Caso autonomo fondo: barre totali 240/160/120 per 24/16/12, scala 10 e tratto grigio 80 comune per B 8. Contributi blu 160/80/40 per 16/8/4, differenze 8/4 e q 1/2. Nessuna imposizione dell’I₀ = 64 di altre domande.

Esito indipendente: 5/2. Fonte SHA256 9be0bb8eefe2d1b1fcf78b84ce3620d5feab68ce3524cb4fa0c4690d183e0e95. Candidato SHA256 c73f2aca020ee9e471b9563b686ec364a973bdb6e5200ba6ad5417bfb85ff69c. Firma sulla sola edizione letta: 93a560da9fa085c464b039d3b9749033605ecbe0b8ba5e93ab9cf3934fde6345.

## AR-u7-infer-attenuation-coefficient-13

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. A usa I=4 mW/m², d=1 cm. B deve avere I=16 mW/m² e a_B=a_A/4. Quanto vale d_B/d_A?

Derivazione e conti manuali: Bersaglioa_B=(1/4)·4=1 cm⁻¹. Con I_B 16 mW/m², log₂(64/16)=2 e d_B=2 cm. Rapporto d_B/d_A=2.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: dB 2 cm, rapporto 2. 1→a 2, 4→a 1/2; 1/4 copia target, 1/2 reciproco.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 2. Fonte SHA256 4d91ee3d57681aee6391b0ce16e7e6e26f22360c13fb53437b658cb221dbe5bc. Candidato SHA256 24fae6a35047749955f0ced4a79a44e3907a21ca7bcabeecdb042a03c8928fab. Firma sulla sola edizione letta: a2ebf20d01c3a4dc04dea83034449ba539bca0db6bb129608416661037b16900.

## AR-u7-infer-attenuation-coefficient-14

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. Un display continuo D=gα senza offset legge 12 per I=4 mW/m² e d=1 cm. Poi legge 3 per d=2 cm. Quanto vale la nuova I in mW/m²?

Derivazione e conti manuali: Attenzione al testo fonte: la catena S=a_cal·a=μ/(ln 2) confonde la taratura con la definizione della grandezza. Interpreto separatamente a=μ/ln 2 e il modello strumentale inteso D=g a, da rendere esplicito in nuova edizione. Riferimento a 4 e lettura 12→g 3; nuova lettura 3→a 1 cm⁻¹. Con d 2 cm, I=64·2⁻²=16 mW/m². Non approvo la catena letterale ambigua.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: g 3, D 3→alpha 1, d 2→I 16; I 1→D 9, 4→D 6. Separata definizione fisicaa da guadagno g.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 16. Fonte SHA256 b79ab0a030e463cd67302ee3d890a31ac45c9dfcc88228c750ada7951fb888be. Candidato SHA256 0f2899e1e4571065b9989dd8286ce2f32c9ca7f98b3737a3d67ded05512db3f9. Firma sulla sola edizione letta: 0b61e2d8948426c7b821afede1604d6980468a5feb422b12fe53dd6f4d087a52.

## AR-u7-infer-attenuation-coefficient-15

Ogni prova usa un fascio monocromatico di intensità incidente I₀=64 mW/m² e uno strato omogeneo di spessore d>0. Il rivelatore seleziona il fascio diretto, senza riflessione o sorgenti secondarie raccolte. Il coefficiente μ è costante nella singola lastra, ma può cambiare fra prove. Definiamo a=μ/(ln 2), con unità cm⁻¹, α=a/(1 cm⁻¹) e x=d/(1 cm). Si ha I/I₀=2^(−αx), con 0<I<I₀. La taratura è D=gα+b. A: I=4 mW/m², d=1 cm, D=9. B: I=16 mW/m², d=2 cm, D=3. C: d=1 cm, D=5. Quanto vale I_C in mW/m²?

Derivazione e conti manuali: La fonte scrive la catena S=a_cal·a=μ/(ln 2)+b: la nuova edizione deve separare a=μ/ln 2 dal displayD=g a+b. Nell’interpretazione strumentale: a_A 4, a_B 1, D_A 9, D_B 3→g 2, b 1. D_C 5→a_C 2 cm⁻¹; d 1 cm dàI=64/4=16 mW/m². La precisazione è parte della derivazione, non un’approvazione della prosa fonte.

Ipotesi e dominio: I₀ = 64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀ = 64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.

Alternative e controprove: g 2, b 1, D 5→alpha 2, d 1→I 16. Omettereb dà 5/2; I 4→D 9, I 32→D 3.

Figura: Nessuna figura collegata a questo record; testi e formule letti integralmente.

Esito indipendente: 16. Fonte SHA256 3ae2f06cddea090335a7c2b98627fcb97249c40c2e6cb9ca9ccee7ef35db6ee7. Candidato SHA256 26f7a9c12cfa8b0033e372410fe99c06b698b2bf0831cd87ddded07c4560fc28. Firma sulla sola edizione letta: 56acd67a4f5f8e9b005f25e348ad0561c40d1eb012b52e30e777c8667c37bbbb.

## AR-u7-infer-attenuation-coefficient-16

Caso autonomo: un rivelatore misura S(d)=A exp(−μd)+B, con ampiezza A>0 e fondo B≥0 costanti ignoti. Tutte le letture sono nella stessa unità coerente. Per d=1, 2, 3 cm si osservano S=24, 16, 12. Quanto vale a=μ/(ln 2) in cm⁻¹? Qui non è assegnata un’intensità iniziale di 64 mW/m².

Derivazione e conti manuali: Caso autonomo con fondo: S(d)=I₀exp(−μd)+B. Le differenze 24−16=8 e 16−12=4 eliminano B. Con passo 1 cm, il rapporto delle differenze èexp(−μ·1 cm)=4/8=1/2. Quindi μ=(ln 2)cm⁻¹, a 1 cm⁻¹. Si può verificare I₀32 e B 8: letture 16+8, 8+8, 4+8. Non si applica il rapporto diretto 24/16 perché il fondo non è nullo.

Ipotesi e dominio: Caso autonomo S(d)=Aexp(-μd)+B, A>0, B≥0 costanti ignoti; letture 24/16/12 nella stessa unità, d 1/2/3 cm equidistanti. L’incidente 64 non si applica; μ positivo ricostruito dalle differenze.

Alternative e controprove: Differenze 8, 4→q 1/2, a 1 cm^-1. A 32, B 8 riproducono 24/16/12; rapporti grezzi 16/24, 12/16 includonoB; a 2 darebbeq 1/4.

Figura: XML e nuovo native completo 640 × 1600 letti. Prime barre 320/160/80/40/20 per 64/32/16/8/4 a spessori 0, 1/4, 1/2, 3/4, 1 cm; tutte stessa scala 5. Coefficienti a 4/1/5/2 con barre 320/80/200, scala 80. Caso autonomo fondo: barre totali 240/160/120 per 24/16/12, scala 10 e tratto grigio 80 comune per B 8. Contributi blu 160/80/40 per 16/8/4, differenze 8/4 e q 1/2. Nessuna imposizione dell’I₀ = 64 di altre domande.

Esito indipendente: 1. Fonte SHA256 69ad6d1778b85fb2a631d400ad0c88993c236c2f00539df8b68a8004642ebc5b. Candidato SHA256 512069183586fecc32f1f6311641eb510c4f881a08beb1a0d5b2076a46c0b4ef. Firma sulla sola edizione letta: 512695c6cd7432e49950981afeb647e858bc8b2e734f59b8b6de2811949a540c.
