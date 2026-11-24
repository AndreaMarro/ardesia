# Revisione indipendente vertical-flight-027

Revisore AI separato dall'autore B. Letti tutti i 16 enunciati, opzioni presenti, soluzioni complete, hint/feedback, corrispondenti originali nel Git e SVG scientifico. Autore53fb033e, integrato dal root comeecfb3dfa. Nessun import da authoring nell'oracolo; nessun candidato, binding o asset modificato dal revisore.

**Esito finale:16/16 PASS_AI e controprove riproducibili8/8 PASS; nessun finding aperto.** L'attesa iCloud descritta sotto è stata risolta con runtime temporaneo esterno e stessa versione delle dipendenze. DRAFT / HUMAN_APPROVAL_NOT_RUN sempre; nessuna pubblicazione. Non è calibrazione empirica con studenti o approvazione umana.

Fonte fissata `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`, SHA-256 file `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Ogni mappa `AR-u2-vertical-flight-NN`→`u2-vertical-flight-NN` è stata verificata con gli effettivi record Git e digest di sorgente/candidato, non soltanto fidandosi del binding autore. Firme indipendenti congelate dopo la lettura, con fonte, record e asset.

## Derivazione indipendente

Campo assegnato uniforme e costante nella prova, aria assente, velocità iniziale positiva verso l'alto. Integrare aᵧ=−g dà vᵧ=v₀−gt, poi y=v₀t−gt²/2 rispetto al lancio. y=0 ha radici0 e2v₀/g: il primo ritorno futuro esclude0. All'apice t=v₀/g, quindi salita e discesa alla stessa quota hanno uguale durata. Al ritorno vᵧ=−v₀, accelerazione ancora−g. L'integrale con segno di vᵧ sul volo è zero; quello del modulo dà distanza v₀²/g, due volte il guadagno massimo. Tutte le inverse mantengono durata e campo strettamente positivi.

## Lettura individuale

|ID|Calcolo manuale e risultato|Opzioni e limiti del modello|
|---|---|---|
|01|y=2t−t²=t(2−t):radici0 e2s, primo ritorno **2s**. Apice1s,vᵧ(2)=−2m/s.|Non scegliere0 o solo apice;continuazione a4s dà−8m,non ritorno. g2m/s² assegnato esatto,non terrestre implicito.|
|02|(m/s)/(m/s²)=**s**,due puro.|m quota,m/s velocità,s² altro radicando,1/s frequenza. Nessuna seconda unità compatibile.|
|03|PerT>0,0=T(v₀−gT/2)⇒**T=2v₀/g**.|v₀/g solo salita;g/(2v₀) frequenza;ramo negativo fuori dominio;v₀²/(2g) quota. Simmetria richiede stessa quota e assenza aria.|
|04|Stesso g2:2×2/2=2s,2×4/2=4s;**raddoppia2→4s**.|Resta,quadruplica,dimezza,negativa non rispettano i dati. La quota invece quadruplicherebbe: oggetti distinti.|
|05|v₀=gT/2=2×2/2=**2m/s**.|T/2=1s è durata di salita;4m/s usarebbe erroneamente gT e darebbe ritorno4s.|
|06|g=2v₀/T=4/2=**2m/s²**.|Componente cambia da+2 a−2m/s in2s, variazione−4. v₀/T conterebbe metà variazione. All'apice velocità0 non significa campo0.|
|07|A:T2s;B:4/4=1s;T_B/T_A=**1/2**.|2 reciproco,1 ignora g,4 introduce quadrato,−1/2 confonde durata con verso discendente.|
|08|T corretto2s;proposto4−2=**+2s**.|Scarto e tempo corretto hanno stesso numero soltanto qui;ordine sottrazione esplicito. Proposta4 non è tempo fino all'apice.|
|09|gT=2v₀⇒**v₀=gT/2**.|gT doppio,2T/g eT/(2g) dimensioni T³/L non velocità;negativo non modulo richiesto.|
|10|T_B/T_A=(κ₁v₀)/(κ₂g)/(v₀/g)=**κ₁/κ₂**.|Prodotto sbaglia g;reciproco inverte prove;κ₁²/κ₂ rapporto quote;1/κ₂ ignora v₀. Leggi diverse anche con coincidenze particolari.|
|11|A:4/2=2s;B:12/4=3s;rapporto **3/2**.|3 ignora campo,2 non rapporto completo,2/3 reciproco,6 prodotto anziché quoziente. Rapporto puro.|
|12|Media uguali pesi `(2+3)/2=5/2s`.|2 o3 singola prova,5 somma,8/3 uscita sugli ingressi medi v₀4,g3: altro esperimento. Distinzione esatta 5/2≠8/3.|
|13|T_B=(3/2)×2=3s;g_B=2×6/3=4m/s²,rapporto g_B/g_A=**2**.|Non rispondere4 come rapporto;campo triplo manterrebbeT invariato,campo invariato triplicherebbeT. Costante nella prova.|
|14|RiferimentoT2,S6⇒c3s⁻¹;S9⇒T3s;v₀=4×3/2=**6m/s**.|Conteggi puri,offset nullo;scambiare9tacche per9s darebbe18m/s. Rapporti letture leciti solo per offset nullo.|
|15|T riferimenti2,3s,S5,7⇒c2s⁻¹,d1;S9⇒T4s;v₀=2×4/2=**4m/s**.|2 ripeteA;3,6,9m/s inC darebberoS7,13,19 anziché9. Rapporto grezzo9/5 non elimina offset.|
|16|Per ogniλ>0,g=λm/s²,v₀=λm/s soddisfano v₀=(1s)g eT=2s: **infinite coppie**.|Nessuna,una,esattamente due false; (0,0) esclusa e divisione per g non definita. Vincolo fra dati iniziali,non campo variabile. MisuraT ripete lo stesso rapporto,rango1.|

## Figura scientifica

`vertical-flight-progressive.svg`, SHA-256 `bb568c15f1e05bdb413b87cc468986f1f84a31e4715d679e0335f3a41c1cc5da`. Letto intero SVG e visualizzato intero disegno in Quick Look su copia temporanea che omette soltanto width/height esterni per adattare il viewport;viewBox,tutti elementi e contenuto invariati. Asset originale mai modificato. Non è test browser completo delle schede a tutte le larghezze.

Zero al lancio e asse verso l'alto. Nel grafico y–t, scale120px/s e120px/m, Bézier(100,520),controllo(220,280),fine(340,520): parametro q dà t=2q e y=4q−4q²=2t−t². Apice a(220,400)→(1s,1m), zeri(0s,0m),(2s,0m),tangente apice orizzontale. Controllo simbolico dell'intera curva nell'oracolo. Nel grafico vᵧ–t scala120px/s e50px/(m/s):retta da(100,720) a(340,920),zero a(220,820),quindi+2→−2m/s. Le due aree triangolari,base120px altezza100px,divise per scale,danno+1 e−1m;spostamento0,distanza2m corretti. Caption e desc coerenti,nessun finding grafico emerso.

## Impronte e riproducibilità

|Artefatto|SHA-256 canonico|SHA-256 byte|
|---|---|---|
|package027|`23465a709dafd4e83d11b9ddb0b8c6b4cd42a2346cd6b8149e9aa9fe5a824c13`|`b739553f7ab57cde3e5c75be95efefb008db5baff49ffbfb2feb97dd7060c165`|
|bindings027|`b9d4e500d80057ca89a153fd65cbfed31e7ce81fdd422fb0aca653836c2f2c6c`|`c7f5cd7e46561c642254fab71bc3e3db2c20e3d1a235d2e55d21948a47062016`|
|scientific report027|`29d845730d98ca24d92b1ab10feb8bc62b3d2cb8847ca2615754ce592b47957a`|`65917c7bbc14ce89a83156fe5fe505a30ab2adc589686dd362470e72e8693b50`|

Verificatore `vertical_flight_verifier.py` SHA-256 byte `b294d3c015ef54c0edd993bdaaa24eb8c264f9d4871ef6a5ccc935d322c57489`. Test comune `test_u2_orbits_freefall.py` esteso con questo lotto e proprietà di ritorno futuro/riscalamento comune di v₀,g. Non si attribuisce un PASS automatico ai run bloccati: due tentativi iniziali e quello con prefisso cache nuovo sono stati terminati dal revisore con exit143 prima dell'oracolo per lettura di file cache/dipendenze evase da iCloud. Nessun controllo indebolito o dipendenza scientifica cambiata per superarli.

Chiusura reale: report generato correttamente con `/private/tmp/cric-recovery-venv/bin/python`, SymPy1.14.0/Pint0.25.2, `PYTHONPYCACHEPREFIX=/private/tmp/cric-recovery-pycache` e `PYTHONDONTWRITEBYTECODE=1`. Il test comune aggiornato, SHA-256 `16e335f0715283308075cef9325e0e15ff2f978a351f0ee64fc6892ee6576a2c`, ha concluso **8/8 PASS in26,381s**:96risposte errate (opzione valida o numero/unità) con binding e token rinnovati soltanto in memoria falliscono l'oracolo,senza errore di firma/chiave;96prompt cambiati con solo rebinding falliscono freeze;insiemi ID,source,figure,replay e DRAFT/NOT_RUN verificati. Tre proprietà fisiche Hypothesis con max_examples50 ciascuna,inclusa selezione del ritorno futuro non nullo e invarianza del tempo sotto riscalamento comune v₀,g. Nessuna approvazione umana,CI o rendering browser completo attribuiti a questi test.
