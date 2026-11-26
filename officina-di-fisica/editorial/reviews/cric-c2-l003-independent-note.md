# Revisione indipendente cric-c2-l003

Dieci problemi distinti: primaria prompt-only di tutti i cinquanta A congelata in 9dc54dba, SHA 34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; modello realmente eseguito prima dei candidati in e37686ebab9f1ac50919592f189ab8cf7f37184f, SHA 02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc. Le due funzioni originali del modello restano identiche nell’AST. Nessuna chiave originale o candidata ha fornito la derivazione primaria.

Tutti i dieci record finali b2115d947dbd12a419a8b0c128584f121d4dd341 letti integralmente: prompt, risposte, opzioni, hint, passaggi, formule e feedback; lezione reale C2-L003 al pin Cric e prerequisiti letti. Ciascuna famiglia, difficoltà, versione e flag exam originale è preservata e controllata anche dopo retoken ostile.

XML e nuovo PNG indipendente640×1450 letti per intero. Primo pannello:rettangoli area con profondità comune65 e larghezze30/270, rapporto9; sono dichiarati aree,non diametri. Frecce forze lunghe20/180 per25/225N,scala comune0,8coordinate/N. Secondo esempio autonomo:corse24/3cm in lunghezze240/30, stessa scala10coordinate/cm, piccolo entrante verso il basso e grande uscente verso l’alto; rapporto aree8 reciproco delle corse, nessuna uguaglianza di lavori finiti dedotta. Terzo:prisma schematico con facciaA12cm² e profonditàs0,5cm,volume6cm³=6mL, senza altre dimensioni assegnate o comune scala tridimensionale dichiarata. Testi e quantità leggibili,nessuna sovrapposizione residua rilevata.

Il decoder canonico conserva i lessemi decimali e la virgola viene normalizzata senza float binari. Le opzioni numeriche sono controllate con dimensioni e segni; eventuali concetti restano AI_CONCEPTUAL, separati dall’oracolo esatto. Le controprove rinnovano candidati, binding, token e pin di test senza alterare le firme definitive. Nessuna importazione del modulo autore.

Resa nativa soltanto asset-only: vera conclusione 0 e lettura integrale. Nessuna UI prodotto o approvazione umana; tutto DRAFT e human NOT_RUN. Il manifest Git con snapshot verbatim conserva il modello storico per CI.

## C2-Q021

Ipotesi: Liquido confinato fermo,densità e quote invariate,incremento7kPa imposto in un punto;non si uguagliano le pressioni assolute a quote diverse.

Derivazione manuale: A geometria, quote e densità invariati, p(z)=p_riferimento+termine idrostatico. Un incremento7 kPa trasmesso nel liquido confinato aumenta anche di7 kPa la pressione nel punto inferiore, mantenendo la differenza idrostatica fra quote.

Distrattori: Forza,peso e volume non aumentano di kPa. Il termine idrostatico fra quote resta costante;è la pressione di entrambi i punti ad aumentare.

Didattica: Due stati alla stessa coppia di quote sottratti prima di confrontare incrementi.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 0bfb4468bfbff6d664130c9e4e0a21880ec9af1c3962b84c244c74e7c7e5ec15.

## C2-Q022

Ipotesi: Pistoni ideali circolari diametri2/6cm,medesima quota e atmosfera,forze aggiuntive nette25N sul piccolo;confronto di equilibri.

Derivazione manuale: Le aree sono proporzionali ai quadrati dei diametri. A_grande/A_piccola=(6/2)²=9, quindi F_grande=25·9=225 N, a pari quota e con lo stesso riferimento di pressione sulle facce esterne. È una relazione di equilibrio istantaneo, non da sola un bilancio di lavori su corse finite.

Distrattori: 75N usa diametri senza quadrato;25N uguaglia forze anziché pressione;25/9N inverte il rapporto;675N usa la potenza cubica3³.

Didattica: Quadrato del rapporto diametri prima del guadagno di forza.

Modalità distinta: EXACT_ORACLE; esito True. Firma 9fd1acafbc0c5afa5971a844e7324925dd6f19ad18a07aab5bb6b60d72a0e1f6.

## C2-Q023

Ipotesi: Pistoni ideali stessa quota e atmosfera,aree6/90cm²,carico aggiuntivo300N sul grande;attriti esclusi.

Derivazione manuale: A pari quota p=F/A, dunque F_piccola=300·6/90=20 N. I centimetri quadrati si cancellano nel rapporto. Il modello ideale trascura pesi dei pistoni o li considera già inclusi nelle forze assegnate.

Distrattori: 4500N inverte aree;300N ignora la differenza;50N divide per6 senza usare90;1800N moltiplica per6 invece del rapporto completo.

Didattica: Inversa area-carico e controllo della minore forza sul piccolo.

Modalità distinta: EXACT_ORACLE; esito True. Firma 46bef8146cdb74f4e2966764460a49e7d7f186100a276539a849af99c333611e.

## C2-Q024

Ipotesi: Circuito senza perdite,liquido incomprimibile ma bolla che si comprime durante avvio;spostamenti entrante/uscente e accumulo della bolla dichiarati.

Derivazione manuale: Quando una bolla si comprime, parte del volume spinto dal primo pistone riduce il volume del gas. La relazione semplice A₁Δx₁=A₂Δx₂ non vale durante quella fase: occorre includere la variazione di volume della bolla, con segni coerenti. Non viene meno la conservazione della massa.

Distrattori: La massa si conserva anche comprimendo gas. Definizioni di pressione e massa/volume non cambiano;non scompare la pressione. Serve il termine positivoδV_b nel bilancio dei volumi spinti.

Didattica: Accumulo volumetrico della bolla distinto da perdita di materia.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 16911d6fcdc2ee46d0f91a782198d59b7f8fd6b42f47aed55e50b1091356b434.

## C2-Q025

Ipotesi: Liquido incomprimibile senza bolle né perdite,rapporto aree8,corsa piccola0,24m;si chiede soltanto la corsa geometrica grande.

Derivazione manuale: Per liquido incomprimibile senza perdite o accumuli, A₁s₁=A₂s₂. Con rapporto8 e corsa piccola0,24 m, s₂=0,24/8=0,03 m=3 cm. Non si deduce da questa sola continuità l’uguaglianza dei lavori finiti se cambiano le quote.

Distrattori: 192cm moltiplica per8 e richiederebbe64volte il volume disponibile;24cm ignora il rapporto aree;0,03cm non converte metri;0,3cm perde un fattore10.

Didattica: Bilancio geometrico senza dedurre uguaglianza di lavori finiti a quote diverse.

Modalità distinta: EXACT_ORACLE; esito True. Firma f06616c702d474051727e271c2e303eb44e757ef4a6ae18dd92206a67c0ce088.

## C2-Q026

Ipotesi: Principio di equilibrio per incremento di pressione in fluido confinato a geometria invariata;non omogeneità della pressione assoluta a quote diverse.

Derivazione manuale: Il principio è quello di Pascal: un incremento di pressione applicato a un fluido confinato viene trasmesso, nel modello statico appropriato, senza aggiungere la stessa forza su aree diverse. Pressione e forza vanno distinte.

Distrattori: Archimede è spinta;Torricelli barometro oefflusso;Bernoulli energia di corrente;Hooke elasticità. Nessuno è il principio di trasmissione dell’incremento assegnato.

Didattica: Cognome collegato al principio e limiti idrostatici espliciti.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma a8783a77c036fae6de947f0a182c22c03e81f174e7e059858dab266ef169bba3.

## C2-Q027

Ipotesi: Pistone area12cm²,corsa5mm,liquido senza perdite,volume geometrico spostato;nessuna pressione richiesta.

Derivazione manuale: Cinque millimetri sono mezzo centimetro. ΔV=12 cm²·(1/2 cm)=6 cm³=6 mL. La conversione della corsa va fatta prima di moltiplicare per l’area.

Distrattori: 60mL interpreta5mm come5cm;0,6mL introduce un fattore10opposto;24è coefficiente di area/corsa con dimensione errata;12copia il coefficiente di area senza una lunghezza.

Didattica: Conversione5mm→0,5cm prima del prodotto area per corsa.

Modalità distinta: EXACT_ORACLE; esito True. Firma 57700dfc73cd6c8096d7e9571cefa73ee350dbb3c1e0c2a00a6e2f60b5c43b33.

## C2-Q028

Ipotesi: Pressa reale con attriti,manovra lenta,lavoro in ingresso maggiore dell’utile e accumulo di energia meccanica nullo;considerati macchina,fluido,carico e ambiente.

Derivazione manuale: La differenza fra lavoro fornito e utile può aumentare l’energia interna delle parti e del fluido per attrito, ed eventualmente essere trasferita come calore. Un dispositivo reale non trasforma automaticamente tutta l’energia fornita in lavoro sul carico; il sistema va definito per il bilancio.

Distrattori: L’energia non scompare né crea lavoro extra;attrito non implica fuga di massa. Il bilancio dei volumi continua a vincolare le corse,non le rende uguali.

Didattica: Sistema esteso per distinguere dissipazione da perdita di energia totale.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 26437419aea5b12cc70374f31e5061b7339cbfc413e81aded2345321ac848ee1.

## C2-Q029

Ipotesi: Membrana area2cm²,differenza uniforme interno-esterno150kPa;forza netta e non forza della sola pressione assoluta.

Derivazione manuale: La forza netta sulla membrana èΔp A. Area2 cm²=2·10⁻⁴ m² eΔp150 kPa=150000 Pa: F=30 N. La pressione atmosferica comune è già eliminata dalla sovrapressione; non va aggiunta di nuovo.

Distrattori: 300000N non converte area;0,03N usa150Pa anziché150kPa;75 non ricostruisceΔpA;150N copia il coefficiente in kPa come newton.

Didattica: Differenza di pressioni e conversione quadratica dell’area.

Modalità distinta: EXACT_ORACLE; esito True. Firma 0edfc582ed70ba84673d14e55e9838f179e01b5eac6dddb1ce0cbe3a34b593bd.

## C2-Q030

Ipotesi: Manometri con stesso riferimento,stessa quota e unico liquido connesso fermo;aree dei pistoni diverse,forze non necessariamente uguali.

Derivazione manuale: In un liquido fermo collegato, alla stessa quota la pressione è uguale; con identico riferimento i manometri mostrano la stessa lettura. Aree diverse dei pistoni richiedono eventualmente forze diverse, non pressioni diverse a pari quota.

Distrattori: Rapporto aree vale per forze,non pressioni alla stessa quota;quiete non significa pressione relativa nulla. Pascal misura pressione e non forza.

Didattica: Riferimenti dei manometri e direzione normale prima della forza.

Modalità distinta: AI_CONCEPTUAL; esito True. Firma 48d3e2f62add6796dce600c66e2f4f715f3a088096265a0e85b7e96942aa0294.
