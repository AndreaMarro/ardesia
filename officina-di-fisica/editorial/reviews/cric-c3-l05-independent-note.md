# Revisione indipendente cric-c3-l05

Dieci problemi distinti, risolti prima delle candidate nella primaria C3 A50 commit030d4658, SHA 34cdd1eb8b9f296a638c2fa1e3874ffbace49c48e907257c063fe1f0f7ad0b80. Modello realmente eseguito prima dei candidati, SHA 9b870976c03b6578eeac6f6e4c2e89cebc6c53d2a6a0ef0b806e749b36c88e1f, con Git-inputs e snapshot verbatim dichiarati. Tutte le sue funzioni conservano AST identico. Nessun modulo autore importato.

Tutti10 record finali 9b64b8b29f0aa12a86d0b95ca2ada4ec61db1b9b letti per intero: dati, risposte, opzioni, hint, blocchi, formule, errori e metadati. Lezione reale C3-L05 letta nel catalogo pinned; identità/versioni/famiglie/difficoltà/prerequisiti/exam controllati individualmente. I risultati numerici derivano dalla primaria, non dalle chiavi.

XML e nuovo PNG indipendente 640×1500 letti per intero. Prima lastra schematica con s 5 cm,A 0,75 m²,λ0,040 W/(mK),ΔT 20 K e 12 W; non è assegnata una metrica 3 D al disegno. Secondo pannello: sezioni schematiche 50×100 e 100×200 con etichette A,s e 2 A,2 s,flussi 9 W rappresentati da frecce concordi di pari 125 coordinate. Il raddoppio di A è dato fisico,non l’area 2 D dell’intero rettangolo,che include lo spessore. Barre emesse a 300/450 K: 60 e 303,75 coordinate,rapporto 81/16 eorigine comune 140. Emissione distinta dal saldo netto. Nessun taglio o contatto residuo.

Il decoder canonico mantiene il lessema decimale senza float intermedi. Intervalli in kelvin e letture Celsius sono distinti: il confronto di opzioni equivalenti applica l’offset soltanto alle temperature assolute, non agli intervalli. Le risposte numeric JSON devono essere interi esatti; i risultati frazionari sono scelte letterali esatte, non float.

Le mutazioni ostili rinnovano binding, hash, token e pin soltanto nel test e lasciano ripristinate le firme finali. EXACT_ORACLE e AI_CONCEPTUAL sono modalità separate. Nuova resa nativa è asset-only: nessuna UI prodotto o approvazione umana; stati DRAFT/NOT_RUN.

## C3-Q041

Ipotesi: Piastra più calda dell’aria; ventilatore impone moto del fluido,non una condizione di isolamento.

Derivazione: Viene potenziata direttamente la convezione forzata: il ventilatore rinnova l’aria a contatto e modifica il coefficiente convettivo. Non crea un requisito di contatto materiale per l’irraggiamento.

Distrattori: Convezione forzata riguarda moto dell’aria; vuoto non contiene quel fluido; irraggiamento può coesistere ma non è l’effetto direttamente imposto.

Didattica: Movimento del fluido distinto dalla conduzione nel sottile strato vicino alla parete.

Modalità: AI_CONCEPTUAL; esito True; firma abbe57b28374eca30642a64364e2e6d5e6af40d50f905a0d2f5d1987149513e8.

## C3-Q042

Ipotesi: Lastra omogenea,regime stazionario 1 D,λ0,040,A 0,75 m²,ΔT 20 K; spessore minimo per P≤12 W.

Derivazione: In conduzione piana stazionaria P=λAΔT/s. s=(1/25)(3/4)·20/12=1/20 m=5 cm. Si assumono materiale uniforme, temperatura delle facce assegnata e perdite laterali trascurabili.

Distrattori: 0,05 cm omette m→cm; 50 cm è fattore 10; maggiore s riduce il gradiente e P,non aumenta il flusso.

Didattica: Monotonia con s e soglia resa univoca dal minimo richiesto.

Modalità: EXACT_ORACLE; esito True; firma 98c4585ff4b53df667704a1b65f393eef06140a21cbfece4e10ae50364162f2d.

## C3-Q043

Ipotesi: Tratto vuoto fra superfici; nessun gas materiale lungo il percorso.

Derivazione: È l’irraggiamento elettromagnetico. Conduzione materiale e convezione non trasportano calore attraverso un vuoto ideale.

Distrattori: Convezione e conduzione materiali non attraversano un vuoto ideale; fusione è proprietà della materia.

Didattica: Meccanismo radiativo distinto dal trasporto materiale.

Modalità: AI_CONCEPTUAL; esito True; firma 4de80060ca6b798eb6687ebf96a336d41788e9f111772384f44589ff61136dbd.

## C3-Q044

Ipotesi: Stessi λ eΔT,A e s entrambi raddoppiati,P iniziale 9 W.

Derivazione: La potenza è proporzionale ad A/s. Raddoppiare insieme area e spessore lascia invariato il rapporto, quindi resta 9 W nelle medesime condizioni stazionarie.

Distrattori: 18 W soloA,4,5 W solos,36 W tratta scomeproporzionalitàdiretta invece che inversa.

Didattica: Rapporto A/s prima di contare raddoppi indipendenti.

Modalità: EXACT_ORACLE; esito True; firma 33d9b1c0e726aa65a041a9c07141553e1c1f314a3a6fcbfff8700804aaed0f30.

## C3-Q045

Ipotesi: Sezioni e lunghezze uguali,conducibilità positive,ΔT>0 comune,regime 1 D stazionario senza perdite.

Derivazione: Il manico metallico porta più potenza in conduzione perché P=λAΔT/s e la geometria è uguale. Il confronto richiede le medesime condizioni alle facce, come dichiarato, e non dice che i materiali abbiano temperature diverse in equilibrio completo.

Distrattori: Geometria uguale non cancella λ; λ minore aumenta resistenza; condizione iniziale non fissa il profilo stazionario.

Didattica: Confronto a differenza termica non nulla e condizioni al contorno identiche.

Modalità: AI_CONCEPTUAL; esito True; firma fabcf8aa6595fddb7e843dedd5ed1dcfc660564c855bb99b48d4d8284df2bdd5.

## C3-Q046

Ipotesi: Area edemissività positive e costanti,T 300→450 K,solo potenza emessa e non assorbimento.

Derivazione: La potenza emessa è εσAT⁴. Il rapporto è (450/300)⁴=(3/2)⁴=81/16. Si tratta dell’emissione, non del bilancio netto che richiederebbe l’assorbimento dall’ambiente.

Distrattori: 3/2 lineare,9/4 quadrato,16/81 inverso,1 ignora nuovaT; Celsius non va alla quarta nella legge.

Didattica: Emissione distinta dal bilancio con l’ambiente, rapporto Kelvin.

Modalità: EXACT_ORACLE; esito True; firma 083b118c82c628c0c6486b51151817b7f1a1b09f2775373f12d4b08c5b506d28.

## C3-Q047

Ipotesi: Profilo termico invariato nel tempo,flusso entrante e uscente bilanciati; non necessariamente T uniforme.

Derivazione: Il regime è stazionario: il profilo e il flusso sono invarianti nel tempo. La potenza può essere non nulla, dunque stazionario non coincide con equilibrio termico uniforme.

Distrattori: Stazionario non significa Q 0 néadiabatico,non imponeU 0; periodico può variare dentro il periodo.

Didattica: Invarianza temporale distinta da equilibrio senza flusso.

Modalità: AI_CONCEPTUAL; esito True; firma f3f0854de16f7a32d13bcacc7bf5570000a0e856d2d8b450ba870e895298c78c.

## C3-Q048

Ipotesi: Liquido con dilatazione positiva riscaldato dal basso in gravità; si chiede un meccanismo possibile,non universalità.

Derivazione: Il riscaldamento dal basso può creare instabilità di galleggiamento: il liquido caldo meno denso tende a salire, quello più freddo a scendere, innescando convezione naturale. L’effettivo insorgere dipende dal superamento della soglia e dai vincoli del recipiente; il prompt dice può.

Distrattori: Dilatazione a massa fissa abbassaρ; conduzione può coesistere con moto; serve una condizione di instabilità oltre al semplice riscaldamento.

Didattica: Tendenza di galleggiamento condizionata a viscosità,diffusione e geometria.

Modalità: AI_CONCEPTUAL; esito True; firma e1fb315ce3dab9ab0b42c1c5de478b69cdcdca8ae162dcf188574d6a6a944db0.

## C3-Q049

Ipotesi: Lastra 1 D stazionaria senza perdite,A 0,40 m²,s 0,020 m,P 18 W,T 30/15°C.

Derivazione: Dalla conduzione piana ricavo λ=Ps/(AΔT). ΔT=15 K e λ=(18·0,020)/(0,40·15)=0,06 W/(m·K)=3/50 W/(m·K), nel modello stazionario senza perdite laterali.

Distrattori: 30 anziché 15 confonderebbe lettura e intervallo; invertire s/A non ricostruisce P; s è già inmetri.

Didattica: Legge isolata prima delle conversioni e differenza di temperatura.

Modalità: EXACT_ORACLE; esito True; firma 8fe1c539f11b01dc28fe47915960595633e47ac05ae989b53fd6d094c8a317d9.

## C3-Q050

Ipotesi: Superficie con emissività positiva eT>0 in grande cavitàisoterma alla stessaT,equilibrio radiativo.

Derivazione: All’equilibrio con la cavità alla stessa temperatura, emissione e assorbimento sono entrambi presenti e si compensano. Il bilancio radiativo netto è zero, non l’emissione termica del corpo.

Distrattori: Saldo 0 non annulla flussi; soloemissione raffredda,soloassorbimento scalda; potenze emessa/assorbita sono moduli positivi nel ramo dato.

Didattica: Due processi non nulli con saldo nullo.

Modalità: AI_CONCEPTUAL; esito True; firma f9b9b7eff23629464a7b908f798fa8aab9d85efa76a6eed6eeaeb606a973e534.
