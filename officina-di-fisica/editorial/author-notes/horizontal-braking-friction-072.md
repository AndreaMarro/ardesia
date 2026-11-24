# Authoring — horizontal-braking-friction-072

Letti tutti i 16 originali `u2-horizontal-braking-friction` al commit fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, file `questions/U2-06.json`. Nuovi svolgimenti per ID e SVG, assemblati dalla pipeline astra/1 esistente. DRAFT; scientific review indipendente NOT_RUN; human approval NOT_RUN. I calcoli seguenti sono note dell’autore per il revisore.

Piano orizzontale fisso, laboratorio inerziale, massa classica costante, g=10 m/s², coefficiente dinamico μ>0 costante durante ogni scorrimento. Nessuna spinta dopo l’inizio, nessuna altra resistenza. N=mg, lavoro dinamico−μmgD e variazione cinetica−mv²/2: D=v²/(2μg). Si considera soltanto il primo arresto; dopo l’arresto la forza orizzontale richiesta per mantenere la quiete è nulla. Non si prolunga un’accelerazione negativa oltre il dominio dinamico. Skill esistente L008 per il bilancio dissipativo, prereq L001,L002,L004,L005,L006,L007,L008, reuse C6. Nessun limite universale μ≤1 introdotto.

| ID | Calcoli e aspetti da rileggere |
|---|---|
|01|v2,μ1/5→D1 m. Caso illustrativo m2 kg: f4 N, K_i4 J,W_f−4 J.|
|02|v²/g: (m²/s²)/(m/s²)=m.|
|03|Segni negativi su lavoro e ΔK; massa si cancella per questa resistenza μmg.|
|04|v2→4 a μ1/5 dà D1→4 m.|
|05|v²4 m²/s²; radici±2 in blocchi distinti, solo2 rapidità.|
|06|μ=v²/(2gD)=4/20=1/5, puro.|
|07|μ1/5→2/5 a v2: D1→1/2 m, rapporto1/2.|
|08|2−1=+1 m.|
|09|v=√(2μgD), ramo positivo.|
|10|Rapporto κ₁²/κ₂, fattori positivi; κ₂=κ₁² mantiene D.|
|11|B v4,μ2/5→D2 m; rapporto2.|
|12|Media (1+2)/2=3/2 m. Le medie ingressi v3,μ3/10 danno proprio3/2 m in questi dati. Controesempio non universale a μ1/5,v2/4: media distanze5/2, risposta alla velocità media9/4.|
|13|D_B2 m,v_B4→μ_B2/5,rapporto2.|
|14|c3 m⁻¹,S6→D2 m,μ2/5→v4 m/s.|
|15|c2 m⁻¹,d1,S9→D4 m,μ1/5→v4 m/s. Alternative v2,3,5,8 danno S3,11/2,27/2,33.|
|16|v=(10 m/s)μ fra prove. D=[c²/(2g)]μ=(5 m)μ; μ1/5,v2 m/s unici. μ resta costante durante ogni prova.|

SVG letto XML e rendering completo: forze in pannello separato con scala5 px/N, N/P20 N100 px e f4 N20 px verso sinistra. Distanza240 px/m, un metro fra posizioni omologhe. Grafico v_x(t):240 px/s,80 px per m/s; retta da(0,2) a(1,0), area triangolare1 m, poi velocità0 senza ramo negativo. Istante0 e primo arresto a1 s espliciti. Preview canonica16×3 larghezze1440,768,320:48 casi senza failure. Import tecnico temporaneo16 poi0 nuovi/16 invariati;991 pubblicati invariati, nessun live head. Nessun registro o CSS modificato.
