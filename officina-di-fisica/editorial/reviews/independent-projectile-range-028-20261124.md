# Revisione indipendente projectile-range-028

Revisore AI separato dall'autore B: letti tutti i 16 enunciati,opzioni,blocchi di soluzione,hint/feedback,originali fissati da Git e SVG scientifico. Snapshot autore d4016e15,root f505b086. Nessun import autore nell'oracolo;nessun candidato,binding o asset modificato dal revisore.

**16/16 PASS_AI; nessun finding aperto. DRAFT / HUMAN_APPROVAL_NOT_RUN; nessuna pubblicazione.** Non è calibrazione con studenti né approvazione umana.

Fonte `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`,SHA-256 file `542b01ce15f3e735f4ae83c2dece4c597c31626d083b851b82942e060740715f`. Ogni `AR-u2-projectile-range-NN` confrontato con l'effettivo originale `u2-projectile-range-NN`,hash sorgente/candidato e provenienza. ID06 è il problema originale individuale fino all'apice,non una sostituzione generica di inverse. Le firme comprendono record completo,asset effettivo e origine;congelate soltanto dopo lettura.

## Modello indipendente

Integrare separatamente le accelerazioni `(0,−g)` con componenti iniziali positive `(u,w)` dà x=ut e y=wt−gt²/2. Il primo zero verticale futuro diverso dal lancio è T=2w/g,quindi gittata R=2uw/g. All'apice t=w/g,la velocità verticale è zero ma resta u;avanzamento orizzontale uw/g=R/2 e quota w²/(2g). Campo uniforme assegnato,aria assente,ritorno alla stessa quota per la gittata completa;ID06 termina invece all'apice. Nessuna ricostruzione numerica dell'angolo necessaria.

SymPy controlla integrazione,radici,inverse,scaling,tarature e intera parabola SVG;Pint/Fraction unità e frazioni esatte. I valori richiesti si ottengono con aritmetica elementare e radici perfette,non da una chiave importata dall'autore.

## Controlli per ID

|ID|Calcolo manuale e risultato|Opzioni,ipotesi e distinzione fisica|
|---|---|---|
|01|u=w2,g10:T=4/10=2/5s;R=2×2/5=**4/5m**.|2/5m usa solo salita,8/5m raddoppia ancora,4m ignora denominatore con unità,1/5m introduce fattore spurio.|
|02|(L/T)(L/T)/(L/T²)=L;unità **m**.|s durata,m/s velocità,m² superficie,1 rapporto puro. Non è lunghezza dell'intera traiettoria.|
|03|T=2w/g e x=uT⇒**R=2uw/g**.|uw/g solo apice;2u/g tempo;g/(2uw) inversa lunghezza;2w²/g corretta solo caso particolare u=w,non legge generale per componenti indipendenti.|
|04|w2,g10 fissi:T2/5s;u2→4,R4/5→8/5m;**raddoppia**.|Resta,quadruplica,dimezza,zero non descrivono il cambiamento. Non si mantiene la direzione iniziale fissata cambiando solo u.|
|05|u=gR/(2w)=10×(4/5)/4=**2m/s**.|Lineare in u,nessuna radice. Usare solo tempo all'apice darebbe u doppia.|
|06|Eccezione:u4,w5,g10,t_apice=5/10=1/2s;Δx=4×1/2=**2m**.|Ritorno alla stessa quota dopo1s darebbe4m,non richiesto. All'apice velocità totale non zero:u resta4. Quota verticale25/20=5/4m distinta dall'avanzamento orizzontale.|
|07|u2 fisso,w2→4:T2/5→4/5s,R4/5→8/5m;rapporto **2**.|1/2 inverso,1 ignora w,4 confonde con quota massima quadratica,−2 incompatibile con R positive lungo+x.|
|08|Proposta8/5 meno corretta4/5=(8−4)/5=**4/5m**.|−4/5 inverte sottrazione,8/5 ripete proposta,12/5 somma,0 equipara valori diversi. Due è già incluso in T totale.|
|09|gR=2uw⇒**u=gR/(2w)**.|gR/w doppio;2wR/g distanza×tempo,2w/(gR) reciproco di velocità;negativo contraddice u>0 e R>0.|
|10|Fattori κ₁ su u eκ₂ su w danno **κ₁κ₂** a g comune.|Quozienti sbagliano una dipendenza;κ₁²κ₂ quadra u senza motivo;somma darebbe2 senza variazioni. Direzione iniziale conservata soltanto se i due fattori sono uguali.|
|11|A:R4/5m;B:R2×4×4/10=16/5m;rapporto **4**.|Quattro è fattore puro,non nuova gittata4m. Due componenti doppie danno velocità orizzontale e durata entrambe doppie.|
|12|Media uscite `(4/5+16/5)/2=(20/5)/2=2m`.|4/5 e16/5 singole prove,4m somma,9/5m uscita con ingressi medi3,3. Uguali pesi statistici non richiedono durate uguali.|
|13|Obiettivo16/5m,u_B4:w_B=10×16/5/(2×4)=4m/s;rapporto w_B/w_A=**2**.|w invariata solo gittata doppia,w quadrupla gittata otto volte. Distinguere rapporto2 da componente assoluta4m/s.|
|14|Gain(12/5)/(4/5m)=3m⁻¹;S48/5→R16/5m;u=10×16/5/8=**4m/s**.|Conteggi puri,offset nullo;T_B4/5s ricostruisce R16/5m e S48/5. Lettura grezza non è distanza in metri.|
|15|Differenze:gain[(37−13)/5]/[(16−4)/5m]=2m⁻¹,offset1. R_C=(21/5−1)/2=8/5m;u_C=10×8/5/4=**4m/s**.|1,2,3,8m/s darebbero S9/5,13/5,17/5,37/5 anziché21/5. Rapporti grezzi non eliminano offset.|
|16|u=w>0⇒R=2w²/g,w²=10×4/5/2=4;**w=2m/s**,ancheu2.|−2 fuori dominio direzioni iniziali;1 darebbeR1/5m,4 darebbe16/5m;2/5m/s scambia numero della durata2/5s con una componente. Ramo positivo unico.|

## SVG scientifico

Asset `projectile-range-progressive.svg`,SHA-256 `eb72be57f1dd1e5b69726f0d7ad2d335c943f87d23990bfb9e509d759c3373bb`,upload Base64 e riferimento `/asset/hash` controllati sui byte effettivi. Intero XML letto e figura intera visionata tramite copia temporanea che omette soltanto width/height esterni per il viewport Quick Look;viewBox,elementi e originale invariati. Nessuna prova browser completa a tre larghezze rivendicata.

Pannello componenti:freccia orizzontale80px e verticale100px su scala comune20px/(m/s)→u4,w5. Accelerazioni e velocità all'apice correttamente distinte. Pannello traiettoria:scala80px/m identica su x e y. Bézier da(100,550),controllo(260,350),fine(420,550),parametroq:t=q s,x=4q m,y=5q−5q² m. Identità dell'intera curva verificata simbolicamente,non solo punti. A q=1/2,apice(2m,5/4m),a q=1 ritorno(4m,0). Linea temporale400px/s:apice200px dal lancio→1/2s,ritorno400px→1s. Testo finale separaΔx fino all'apice2m dalla gittata completa4m;nessun finding.

## Impronte e test riproducibili

|Artefatto|SHA-256 canonico|SHA-256 byte|
|---|---|---|
|package028|`5e45b287f020fe483d114a8dce0a5c59397a63ffdc6ddb858cb95b10569bd308`|`fd7abba663e17b8b52e700a265cdcf25308c6d000b9cce4bf777fb53fab30a87`|
|bindings028|`c89cac01c2a9293cbb7b971a5c79aec50a569aac476056ecc1613171e15e6b30`|`8b32c15a6af01ed6d5a71ea851a823f7ea2cde807a73279ba820451c1855e2fb`|
|science report028|`6c9223ee39a894fe1be2cf0966017fc603971efb745af28076f4f3c02dc8ad8d`|`cf6ff3c69b83e1bfb6e962af482477f0cafbf3feb127fe5b6cf355872af89a34`|

Verificatore `projectile_range_verifier.py`,SHA-256 byte `ea07748d602fd198dc0c5addc480d9635a58ffa5ab7351d7fb7a38dbe9aa8bd5`.

`test_u2_orbits_freefall.py`,snapshot SHA-256 `7656f56b87713a734fb3ac712cf85733741e96f74a7555ac48059bb6369d015a`: **9/9 PASS in8,759s** con runtime `/private/tmp/cric-recovery-venv/bin/python` e prefisso cache temporaneo esterno. Copre i sette lotti112ID:112risposte errate,ma opzioni esistenti o numeri con unità invariata,falliscono l'oracolo dopo rebinding e rinnovo simulato del token in memoria;112prompt cambiati con solo rebinding falliscono freeze. Verificati insiemi completi/unici,sorgenti ribindate,figure mancanti,replay e DRAFT/NOT_RUN. Quattro proprietà Hypothesis con max_examples50 ciascuna,inclusa distanza all'apice metà gittata e durata indipendente da u mentreR scala conu.

Non sono stati rinnovati token per adattarli a test errati o modificati candidati. Nessuna pubblicazione,approvazione umana,calibrazione studenti o CI/browser completo attestati. Questi sono hash datati;rigenerare report con nuovo contratto deve dichiarare la dipendenza attuale senza far passare contenuti non riletti.
