# Revisione indipendente cric-c2-l004

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in 9dc54dba, SHA 34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; modello realmente eseguito prima dei candidati in e37686ebab9f1ac50919592f189ab8cf7f37184f, SHA 02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali 701f42eccce775559f0379a37071b22b36c91f33 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C2-L004 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente 640×1460 letti interamente. Tre vettori traslati, non punti di applicazione: spinta 2 N lunga 200, peso 1,2 N lungo 120, forza 0,8 N lunga 80, scala comune 100 coordinate/N e 200=120+80; versi corretti. Barre pontone 100/260/360 per 5/13/18 kg, scala 20 coordinate/kg. Barre due liquidi 240/128/368 per 60/32/92 g, scala 4 coordinate/g. Massa distinta da forza; testi e frecce visibili per intero, nessuna sovrapposizione residua.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C2-Q031

Ipotesi: Volume rigido completamente immerso 75 cm³, acquaρ1000 kg/m³, g 10, situazione idrostatica senza contatti o capillarità.

Derivazione manuale: La spinta valeρgV_spostato.75 cm³=75·10⁻⁶ m³, quindi massa d’acqua spostata 3/40 kg e spinta 3/4 N=0,75 N. La forma irregolare non altera il risultato per il volume completamente immerso.

Distrattori: 7,5 e 0,075 N sbagliano fattore 10; 75 e 750 N richiederebbero 7500/75000 cm³ di acqua, non 75. La massa del corpo non serve per la spinta a volume noto.

Didattica: Volume immerso convertito prima del peso del liquido equivalente; vecchia attribuzione dei distrattori ricalcolata e corretta prima freeze.

Modalità distinta: EXACT_ORACLE; esito True. Firma 1a175ca58657369aa248162c85339eaae6217e3e61513c669a52fa65172ceb75.

## C2-Q032

Ipotesi: Sfera rigida totalmente immersa, densità uniforme e g costante, spostata in profondità senza cambiare volume e senza pareti vicine.

Derivazione manuale: Per un corpo rigido completamente immerso in liquido omogeneo incomprimibile, il volume spostato eρ non cambiano scendendo. La spintaρgV resta uguale, se g è uniforme; le pressioni assolute sulle singole facce aumentano ma la loro risultante non cresce.

Distrattori: Pressione locale maggiore non cambia la risultante su volume chiuso rigido. Nessuna necessità di aria; pressione e spinta hanno unità diverse.

Didattica: Aumento comune delle pressioni distinto dalla loro risultante.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 0417d6a7dc287dbe22f8c1125e48bce931662fa7d2be4a2e8a5b45e3c1f98199.

## C2-Q033

Ipotesi: Galleggiante rigido 0,12 kg e 200 cm³, interamente in acquaρ1000, g 10; equilibrio con peso, spinta e forza esterna verso il basso.

Derivazione manuale: La spinta sul volume 200 cm³ è 2 N e il peso è 0,12·10=1,2 N. Per la quiete completamente sott’acqua serve una forza esterna verso il basso di 2−1,2=0,8 N. La direzione assegnata è coerente con la densità media minore dell’acqua.

Distrattori: 2 N è spinta e 1,2 N peso,3,2 N somma forze opposte; −0,80 N non è un modulo, con verso già dichiarato.

Didattica: Diagramma di tre forze e modulo della forza esterna.

Modalità distinta: EXACT_ORACLE; esito True. Firma f19624cc0332cdf4a4b2671bca5bdc88036a277198fe6e7d8a08ca5e2bf452dd.

## C2-Q034

Ipotesi: Stesso cubetto libero galleggia in entrambi i liquidi; olio meno denso, geometria/massa invariate, aria e capillarità trascurate.

Derivazione manuale: Galleggiando liberamente il peso è uguale alla spinta: V_imm=m/ρ. Lo stesso corpo ha dunque volume immerso maggiore nel liquido meno denso, l’olio, purché il volume disponibile basti a sostenerlo come esplicitamente dato.

Distrattori: Stesso peso impone stessa spinta, non uguali volumi se cambia densità; non è necessaria immersione totale e due liquidi possono entrambi sostenere il corpo.

Didattica: Peso comune confrontato con densità del fluido, non con volume totale.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 7d7255b094d4ea3e710d40b4dbbbd3409eee0a0fee774929272a7e705267447b.

## C2-Q035

Ipotesi: Sfera omogenea rigida alla stessa densità del liquido uniforme, immersione totale e assenza di vincoli; stabilità solo per traslazione verticale.

Derivazione manuale: Densità del corpo uguale a quella del liquido implica peso uguale a spinta per immersione completa. Il galleggiamento è neutro o indifferente: la quiete non seleziona una quota in un liquido omogeneo, trascurando altre interazioni.

Distrattori: Peso e spinta non sono nulli, ma uguali. Nel modello rigido omogeneo non nasce né richiamo né instabilità verticale dopo piccolo spostamento.

Didattica: Equilibrio neutro verticale distinto da assenza di forze.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 74d57d7d0cfa95ddcd2ddf4f5bda0c63544ebe3eb59d25092d3646a89cae8703.

## C2-Q036

Ipotesi: Pontone 5 kg, volume massimo ammesso 0,018 m³ in acquaρ1000, carico aggiuntivo al limite geometrico; equilibrio libero.

Derivazione manuale: Il volume massimo spostabile sostiene massa totaleρV=1000·0,018=18 kg. Tolgo i 5 kg del pontone: massa aggiuntiva massima 13 kg. È il limite teorico al livello assegnato, non una portata operativa con margini di sicurezza.

Distrattori: 18 kg include il pontone; 23 somma la sua massa invece di sottrarla; 5 copia il pontone; 130 copia il peso numerico inN per g 10 senza conservare unità.

Didattica: Massa utile aggiuntiva distinta dalla massa totale sostenibile.

Modalità distinta: EXACT_ORACLE; esito True. Firma c9ad770e94c975b6dd16cdbf6bddbc16a97e9796e360894822e6f268f2a11df0.

## C2-Q037

Ipotesi: Uguale volume immerso, masse m₂>m₁, due corpi che affonderebbero; dinamometri dall’alto in equilibrio, tensioni positive.

Derivazione manuale: Uguale volume immerso nello stesso liquido dà la stessa spinta. Ogni dinamometro dall’alto misura T=mg−B, positivo perché entrambi affonderebbero liberi. L’oggetto più pesante produce lettura maggiore; la differenza delle tensioni è la differenza dei pesi, non una differenza di spinta.

Distrattori: Volumi uguali danno spinta uguale, non tensione. Maggiore massa non cambia la spinta a volume fisso; il peso completo ignora spinta, zero è incompatibile con affondamento libero.

Didattica: Sottrazione di due equilibri per cancellare spinta comune.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 881382550f38077cd4c8736bf5d53f01d6806d9ddbcf92891e9261a9ec296b6f.

## C2-Q038

Ipotesi: Due liquidi immiscibili stabili, acqua sotto olio, densità 1 e 0,8 g/cm³, volumi esclusi 60/40 cm³; corpo libero senza capillarità.

Derivazione manuale: Senza altre forze e trascurando tensione interfacciale, la quiete richiede m=ρ_acqua V_acqua+ρ_olio V_olio. In grammi: 60·1+40·(4/5)=92 g. La densità media 0,92 g/cm³ è fra 0,8 e 1, compatibile col sostegno all’interfaccia stabile acqua sotto olio. Il modello deve dichiarare trascurabili le forze capillari se serve una massa univoca.

Distrattori: 100 g usa tutta acqua,80 g tutto olio,90 g media semplice su volumi disuguali,28 g sottrae due contributi entrambi verso l’alto.

Didattica: Due volumi e densità sommati nella stratificazione stabile.

Modalità distinta: EXACT_ORACLE; esito True. Firma 42f2898eb9167dfc9e1004074af3a503fe4455f3c78ec6a01d2b42a90041877c.

## C2-Q039

Ipotesi: Galleggiante 60 g libero in liquidoρ1,20 g/cm³; volume immerso richiesto, non volume totale né parte emersa.

Derivazione manuale: Per galleggiamento liberoρV= m. V=60/(6/5)=50 cm³, con unità grammi e centimetri cubici coerenti. Non serve g, che si cancella fra peso e spinta.

Distrattori: 72 è coefficiente di massa per densità, dimensione non volumetrica; 60 cm³ userebbeρ1 anziché 1,2; 0,05 e 50000 cm³ errano fattori 1000.

Didattica: Inversa della densità con unità coerenti senza inventare volume emerso.

Modalità distinta: EXACT_ORACLE; esito True. Firma f244e54e0815a8b30183299b79e76e5009142e9b38b859046bd0dca728c438e8.

## C2-Q040

Ipotesi: Ciotola aperta asciutta con bordo emerso, pallina compatta dello stesso metallo; volume esterno escluso rispetto a massa totale, aria e capillarità trascurate.

Derivazione manuale: La ciotola trattiene un volume d’aria e può spostare molta acqua rispetto alla propria massa, così la densità media del corpo più volume racchiuso è minore di quella dell’acqua. La pallina compatta ha densità del metallo maggiore dell’acqua e spinta insufficiente al suo peso. Conta il volume esterno immerso, non il solo volume di metallo.

Distrattori: Forma non cambia densità intrinseca del metallo; anche la pallina riceve spinta verso l’alto. Cavità non basta se entra acqua o se il carico supera la capacità geometrica.

Didattica: Interno asciutto e bordo emerso fanno parte dell’ipotesi geometrica.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma b8f8c09ea1326ffd7cef9d400b114ee07c25205c8886dbfc2ec7fa4b882f4b4e.
