# parallel-thermal-panels-180 — revisione indipendente per ID

Primaria completa degli 80 originali dei lotti 178–182 congelata prima di candidati, opzioni, chiavi e figure: editorial/reviews/u5-transfer-178-182-primary-source-only.md, SHA256 c94597eaf8e1bf35eace5928002151d2b6bc85dfe886e3a4322180ecf4ccbe5c. Le riformulazioni sono poi state risolte nuovamente sui dati effettivi. Nessun modulo autore importato e nessun candidato modificato.

Letti tutti i campi di ogni candidato, opzioni, passaggi discorsivi, formule, hint, feedback, competenze e prerequisiti. Package, binding e SVG ROOT confrontati con i byte finali dell’autore alla SHA cceb5d0b6a3ad3e917031691acb1a1a3e96da523. Firme congelate soltanto dopo questa lettura completa. La geometria dello SVG è stata letta sia in XML sia nel rendering completo indipendente conservato con checksum. Si tratta di resa asset-only, non UI del prodotto, accettazione di un runtime o prova di overflow mobile.

Gli esiti EXACT_ORACLE derivano da SymPy/Pint/Fraction e calcoli manuali separati; AI_CONCEPTUAL identifica enunciati o leggi simboliche controllati con lettura distinta. Le controprove rinnovano binding, pin e token soltanto nel test per provare gli oracoli; una prosa fisica falsa con chiave corretta è respinta dalla firma della lettura, senza pretendere comprensione semantica automatica.

Approvazione umana NOT_RUN. Pubblicazione DRAFT. Nessuna evidenza browser del prodotto attribuita da questi risultati.

## AR-u5-parallel-thermal-panels-01

Derivazione e calcolo manuale: G₁=1 W/K e G₂=2 W/K; contributi 10 e 20 W sul medesimo salto 10 K, totale 30 W.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 10 e 20 W tengono un solo ramo; la serie ha potenza comune e salti ripartiti, modello diverso.

Didattica: Legge motivata dalle ipotesi prima del risultato, con unità conservate.

Figura: Due collegamenti schematici fra medesimi nodi, non scala delle aree; due punte del verso energetico distinte. Barre dei contributi 10 e 20 W lunghe 100 e 200; totale affiancato 300, scala comune 10 unità/W. Ultimo pannello 30/60/45 W lungo 150/300/225 da x130 (5 unità/W). XML e rendering integrale asset-only letti; nessuna sovrapposizione di testi e assi rilevata.

Modalità EXACT_ORACLE. Risultato indipendente: `30`. Firma: `a71d8c072e8e89db77338a3ea76a137610fbaf98adabeabef62ef9da334dafac`.

## AR-u5-parallel-thermal-panels-02

Derivazione e calcolo manuale: P è somma di potenze; (W/K)·K=W e non J o area.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: J energia, m² area, W/K conduttanza, W/(m·K) conducibilità.

Didattica: Distinzione fra potenza, energia, proprietà del materiale e grandezze di rete.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `W`. Firma: `6e2acceb6e117752621dd33449a2d2eecabc129a3e3b6a219a7795f64d24773b`.

## AR-u5-parallel-thermal-panels-03

Derivazione e calcolo manuale: P=P₁+P₂=ΔT G₁+ΔT G₂=ΔT(G₁+G₂), per collegamenti diretti agli stessi nodi.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: Dividere ΔT per G non dà W; sottrarre inverte un ramo; prodotto aggiunge fattore G e dividere per ΔT dà W/K².

Didattica: Legge o meccanismo fisico ricostruiti separatamente dalla chiave.

Figura: Due collegamenti schematici fra medesimi nodi, non scala delle aree; due punte del verso energetico distinte. Barre dei contributi 10 e 20 W lunghe 100 e 200; totale affiancato 300, scala comune 10 unità/W. Ultimo pannello 30/60/45 W lungo 150/300/225 da x130 (5 unità/W). XML e rendering integrale asset-only letti; nessuna sovrapposizione di testi e assi rilevata.

Modalità AI_CONCEPTUAL. Risultato indipendente: `P = ΔT (G₁ + G₂)`. Firma: `ec036a94fdcf7217a1d0846a1eed495d4efcfc341210738a3d3ae5999ef26f9b`.

## AR-u5-parallel-thermal-panels-04

Derivazione e calcolo manuale: A conduce 10+20=30 W. B cambia solo il primo contributo a 20 W: totale 40 W.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 60 raddoppia anche il ramo fisso, 15 inverte la dipendenza, 30 ignora il cambio, 20 perde un ramo.

Didattica: Confronto controllato fra prove mantenendo fissi i parametri dichiarati.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `Da 30 a 40 W`. Firma: `4f5374b43250c84d3ffb61ce19f0a4d68351d00ef85b185daaec1280c267a316`.

## AR-u5-parallel-thermal-panels-05

Derivazione e calcolo manuale: P₁=30−20=10 W; A₁=P₁ L/(k₁ ΔT)=1 m².

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 3 m² attribuisce tutto al primo; 2 m² dà totale 40 W. Non si sottrae area da potenza.

Didattica: Inversa derivata prima della sostituzione, con dominio strettamente positivo.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `048c94e6bef385f532e3d70da0b01a7a2810f2fd6ee0b48234a00cd1dda1310f`.

## AR-u5-parallel-thermal-panels-06

Derivazione e calcolo manuale: P₂=30−10=20 W; A₂=P₂ L/(k₂ ΔT)=1 m².

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 3/2 usa tutto P nel secondo; 2 usa k₁ e predice totale 50 W; zero perde il contributo necessario.

Didattica: Seconda inversa e verifica dimensionale del residuo o del denominatore.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `38e69d30d34b6f891f5471da7b2dd644786112369c7c87cc72a323069db57da6`.

## AR-u5-parallel-thermal-panels-07

Derivazione e calcolo manuale: A conduce 30 W; B con area seconda doppia conduce 10+40=50 W: rapporto 5/3.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 2 raddoppia tutto; 3/5 è reciproco; 1/2 inverte la dipendenza e 1 ignora incremento.

Didattica: Le due prove ricostruite prima del rapporto adimensionale.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `5/3`. Firma: `182a8713f11b9ebfc975a825421d6591f40e432b7b6558a41b87bf9058263927`.

## AR-u5-parallel-thermal-panels-08

Derivazione e calcolo manuale: Proposta 60 meno valore corretto 30 dà +30 W, mentre due è un rapporto puro.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: −30 inverte ordine; 60 copia proposta; zero accetta errore; 2 è rapporto.

Didattica: Ordine dello scarto mantenuto e distinto da un rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `30`. Firma: `f19900a22d935d91cc5d733de33dcf565e3a40d6134c728b951a11fa4bcd4704`.

## AR-u5-parallel-thermal-panels-09

Derivazione e calcolo manuale: G₁=P/ΔT−G₂>0; A₁=L G₁/k₁. Unità m² e residuo positivo necessari.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: Più aggiunge ramo noto; PL/(k₁ΔT) perde il secondo; scambio k₁/L altera dimensione; solo G₂ ignora P.

Didattica: Inversa simbolica con geometria e divisioni lecite.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `A₁ = L (P/ΔT − G₂) / k₁`. Firma: `8e1d9956c2af4022304ccc75124e9cf302eb4e0d9822fba555fccd24edfa4dbe`.

## AR-u5-parallel-thermal-panels-10

Derivazione e calcolo manuale: G_B=a G₁+b G₂; rapporto (a G₁+b G₂)/(G₁+G₂). Fattore comune a dà a.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: Prodotto sbaglia somma di rami; reciproco inverte; soli fattori senza pesi non ricostruiscono il totale.

Didattica: Scalature sostituite nel modello completo, senza cancellare pesi diversi.

Figura: not attached to this record

Modalità AI_CONCEPTUAL. Risultato indipendente: `(κ₁ G₁ + κ₂ G₂) / (G₁ + G₂)`. Firma: `34eaccf656a0f23e727295b9699f7eb18b9dccc772d1510f38918be90266f577`.

## AR-u5-parallel-thermal-panels-11

Derivazione e calcolo manuale: Con aree entrambe doppie il totale è 20+40=60 W; rapporto con 30 W uguale 2.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 4 moltiplica raddoppi invece di distribuirli; 1/2 inverte; 3 confonde coefficienti con rapporto; 1 ignora entrambi.

Didattica: Entrambi gli ingressi variati inclusi nel medesimo bilancio.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `6c37d9d0117698651768fc0fe2f80788f5418c9c23d584bb0567dabdc8d668c5`.

## AR-u5-parallel-thermal-panels-12

Derivazione e calcolo manuale: (30+60)/2=45 W. Anche aree medie 3/2 e 3/2 m² danno 15+30=45 W per linearità, non per regola universale.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 90 non dimezza; 15 dimezza differenza; 30 e 60 copiano un solo dato. Coincidenza agli ingressi medi è verificata separatamente.

Didattica: Media delle uscite distinta dalla risposta agli ingressi medi.

Figura: Due collegamenti schematici fra medesimi nodi, non scala delle aree; due punte del verso energetico distinte. Barre dei contributi 10 e 20 W lunghe 100 e 200; totale affiancato 300, scala comune 10 unità/W. Ultimo pannello 30/60/45 W lungo 150/300/225 da x130 (5 unità/W). XML e rendering integrale asset-only letti; nessuna sovrapposizione di testi e assi rilevata.

Modalità EXACT_ORACLE. Risultato indipendente: `45`. Firma: `11c274fd88f237e16200b4fab4ea06a1f8e847e927d48c92e93662d14d384c75`.

## AR-u5-parallel-thermal-panels-13

Derivazione e calcolo manuale: Target 60 W meno primo ramo 20 dà secondo 40 W; servono 2 m², rapporto 2.

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 1/2 inverte; 4 m² nel secondo darebbe 100 W totali; 1 dà 40 W; 60 copia watt.

Didattica: Bersaglio decodificato prima dell’inversa; ingresso distinto dal rapporto.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `47602d2916435776037fb4f5b129237dbe90230028cf48dbf1f39c8d9d5063a7`.

## AR-u5-parallel-thermal-panels-14

Derivazione e calcolo manuale: q=90/(30 W)=3 W⁻¹. S180 decodifica 60 W; ramo noto 40 W, residuo 20 W e A₁=2 m².

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 180 usato come watt dà residuo 140 e area 14 m²; 1 m² prevede S150, non 180.

Didattica: Display continuo tarato prima di invertire la relazione fisica.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `fc76ede3a99608000c601decfee7b79bf8e1e77007bc8a577916f32c4a514803`.

## AR-u5-parallel-thermal-panels-15

Derivazione e calcolo manuale: q=(121−61)/(60−30)=2 W⁻¹, b=1. S81 dà 40 W, ramo noto 20 W e A₁=2 m².

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 41/20 m² omette b e predice S82; 1 torna ad A; 4 predice S121; 40 copia watt.

Didattica: Offset e guadagno ricavati da due riferimenti, poi applicati anche alla prova incognita.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `2`. Firma: `cc459a0a49627461ab453f18517debbba8e7f7a4835b0e52ea071b3b241ac831`.

## AR-u5-parallel-thermal-panels-16

Derivazione e calcolo manuale: A₁=A₂ dà P=(30 W/m²) A₂. Misura 30 W impone unica area positiva 1 m².

Ipotesi e dominio: Pannelli in parallelo fra gli stessi nodi mantenuti a salto 10 K; spessore comune 1 m, conducibilità costanti 1 e 2 W/(m·K), aree positive variabili fra apparati senza vincolo di area totale. Regime stazionario monodimensionale in ciascun ramo, sorgenti assenti e scambi laterali trascurati. Si sommano potenze a salto comune. Inverse con residuo strettamente positivo; display continuo.

Distrattori: 2 e 3 m² danno 60 e 90 W; 30 copia potenza. Misura totale fissa la scala comune, rapporto da solo no.

Didattica: Vincolo fra preparazioni sostituito prima di decidere ramo e unicità.

Figura: not attached to this record

Modalità EXACT_ORACLE. Risultato indipendente: `1`. Firma: `2d99ce6bc1c5595a051a4a621959e688fee2fd4dd6f1795285f38b28cfd6566a`.
