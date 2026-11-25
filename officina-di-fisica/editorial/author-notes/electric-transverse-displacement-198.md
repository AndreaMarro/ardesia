# electric-transverse-displacement-198 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json. SHA256 del file a981cd7c03f402ee7b2f66e1de79e9f2cea686ffe3178cd19bcb8d17b66c122a. Letti tutti gli 80 prompt originali B195–199 prima del primo candidato, con allowlist id/prompt/familyId/lawFamily e senza opzioni, chiavi, solutionSteps o hints sorgente. Snapshot allowlist dei 160 prompt SHA256 a7eb73daa238bba50af405409954cda487f97caf396a67922d7bdb3f087def1b.

Prima dei candidati il verificatore distinto A ha congelato gli 80 svolgimenti prompt-only B195–199, SHA256 3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9. L’autore B non ha aperto quella primaria, né verificatori o risultati attesi altrui. Anche la primaria indipendente B sui soli originali A190–194 era stata congelata prima di candidature A.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c: lette le lezioni reali C4-L01/L02/L03/L04 con formule e prerequisiti effettivi. Primary C4-L02, con riferimenti meccanici effettivi C1-L003/C1-L004 per il tempo e il moto accelerato e C1-L005 per Newton. Iniziali, origine trasversale e campo costante entro prova sono dichiarati. Nessun ID di lezione inventato.

Si usa esclusivamente assemble_family della pipeline esistente, course C4/unit u6, astra/1 e ID AR-<sourceId>. Stati autore DRAFT, independentReview NOT_RUN, humanApproval NOT_RUN. Nessuna pubblicazione, nessun registro/ledger/runtime o verificatore altrui modificato. I calcoli qui riportati sono dell’autore e non costituiscono review indipendente.

Controlli tecnici reali sui byte finali: due assembly identici, binding source/candidate/provenance validati e importatore canonico con SQLite temporaneo 16 nuove bozze, poi 0 nuove e 16 invariati. I 991 pubblicati restano byte identici e non appaiono nuove teste live. Le operazioni locali sono serializzate con flock su /private/tmp/cric-bounded-local-work.lock e guardia interna almeno 2 GiB prima dei child. Nessuna full suite locale.

SVG finale letto integralmente in XML e rendering nativo asset-only; PNG completo e manifest conservati in editorial/author-evidence/electric-transverse-displacement-198-asset-only. Nessun testo SVG risulta fuori dal viewBox nel controllo di bounding box. Questo non è una prova del lettore del prodotto, di axe o di overflow a 320 px: UI prodotto NOT_RUN, nessun report o marker sintetico.

Geometria per la review, espressa soltanto nelle note in coordinate intrinseche, non pixel CSS visibili: La scena iniziale è una vista dall’alto del piano del moto; frecce di campo, forza e velocità sono schematiche e hanno unità diverse. Il peso è compensato fuori dal piano. La Bézier centrale M100830 Q300830 500590 ha parametro a tra0 e1: t=2a s e y=4a² m, dunque y=(t/(1 s))² m per E=2 kN/C. Assi indipendenti200 unità/s e60 unità/m; punti(1 s,1 m) e(2 s,4 m). Le barre finali1,2,3/2 m hanno lunghezze 160,320,240 dal comune x130 (160 unità/m); B usa E=1 kN/C e non appartiene alla curva. Nel caso16 il campo è preparato dal parametro T e resta costante durante τ: non è una rampa temporale.

## 01 — Una componente inizialmente ferma

La forza nel piano è qE lungo +y. In SI qE=2·10⁻³ N e m=10⁻³ kg, quindi a_y=2 m/s². L’accelerazione è costante e v_y iniziale è nulla: s=a_yt²/2=1 m. La componente x non entra in questo spostamento trasversale.

Passaggi: `F_y=qE=2\cdot10^{-3}\,\mathrm N\qquad a_y=F_y/m=2\,\mathrm{m/s^2}\qquad s=\frac12a_yt^2\qquad s=1\,\mathrm m`

Distrattori: Due metri ometterebbero il mezzo nella legge oraria. Due m/s è invece v_y finale, non uno spostamento. Il percorso totale include anche il moto lungo x e non è determinato dal solo s.

## 02 — La dimensione dello spostamento

s è una componente di spostamento, quindi ha dimensione di lunghezza. Nel prodotto a_yt² le unità m/s² e s² danno m; il fattore un mezzo è puro. La lettera s usata per la grandezza non va confusa col simbolo di unità del secondo.

Passaggi: `[s]=[a_y][t]^2\qquad [s]=\mathrm{m/s^2}\cdot\mathrm{s^2}\qquad [s]=\mathrm m`

Distrattori: m/s misura velocità, m/s² accelerazione e N/C campo. Il secondo misura tempo. Nessuna di queste grandezze sostituisce la lunghezza richiesta.

## 03 — Newton e legge oraria insieme

Newton dà a_y=qE/m. L’origine y(0)=0 e v_y(0)=0 eliminano i due termini iniziali della legge oraria, lasciando s=qEt²/(2m). La costanza di E entro la prova permette di usare una sola accelerazione. Non si deve confondere il tempo al quadrato con la sola variazione di velocità.

Passaggi: `a_y=\frac{qE}{m}\qquad y(0)=0\qquad v_y(0)=0\qquad s=\frac{qEt^2}{2m}`

Distrattori: qEt/m è una velocità. Omettere due mantiene la dimensione ma raddoppia lo spostamento. Il quoziente con m al numeratore e la forma con t² al denominatore non seguono né Newton né la legge oraria e hanno dimensioni sbagliate.

## 04 — Raddoppiare il campo alla stessa durata

Il campo e l’accelerazione raddoppiano mentre la durata resta uguale. La dipendenza da E è lineare: A ha a_y=2 m/s² e s=1 m; B ha a_y=4 m/s² e s=2 m. Il quadrato riguarda il tempo, non il campo.

Passaggi: `a_{y,A}=2\,\mathrm{m/s^2}\qquad a_{y,B}=4\,\mathrm{m/s^2}\qquad s_A=1\,\mathrm m\qquad s_B=2\,\mathrm m`

Distrattori: Quattro introduce un quadrato su E. Un mezzo rende inversa la dipendenza dal campo; uno ignora il cambiamento e zero contraddice l’accelerazione positiva per tempo positivo.

## 05 — Il campo da una deviazione

Isoliamo E=2ms/(qt²). Il rapporto 2s/t² è l’accelerazione necessaria, 2 m/s². La forza m a_y vale 2·10⁻³ N; dividendo per 10⁻⁶ C si trova 2·10³ N/C, cioè 2 kN/C. La carica è fissata, non un parametro da ritarare.

Passaggi: `a_y=2s/t^2\qquad a_y=2\,\mathrm{m/s^2}\qquad E=\frac{2ms}{qt^2}\qquad E=2\,\mathrm{kN/C}`

Distrattori: Un kN/C ometterebbe il fattore due nell’inversa. Due N/C perderebbero il prefisso kilo. Non si ricava E dalla sola lunghezza senza la durata e il rapporto m/q.

## 06 — Il tempo è la radice positiva

Il campo dà a_y=2 m/s². Dalla legge s=a_yt²/2 segue t²=2s/a_y=1 s². Il tempo trascorso dall’ingresso è positivo, quindi t=1 s. Il valore negativo dell’equazione quadratica non è una durata ammessa.

Passaggi: `a_y=2\,\mathrm{m/s^2}\qquad t^2=\frac{2s}{a_y}\qquad t^2=1\,\mathrm{s^2}\qquad t=1\,\mathrm s`

Distrattori: Due secondi darebbero 4 m, mezzo secondo 1/4 m. Scrivere t=2s/a_y senza radice restituirebbe una quantità in s², anche se qui il numero del quadrato è uno.

## 07 — Tre volte il tempo

L’accelerazione è la stessa. A ha s=1 m e B ha s=(2 m/s²)(3 s)²/2=9 m. Il rapporto è nove: il tempo agisce al quadrato. Si assume che il corpo rimanga nel campo uniforme per tutti i tre secondi.

Passaggi: `s_A=1\,\mathrm m\qquad s_B=9\,\mathrm m\qquad s_B/s_A=(t_B/t_A)^2\qquad s_B/s_A=9`

Distrattori: Tre usa una dipendenza lineare nel tempo, un terzo o un nono invertono il confronto e uno ignora il tempo diverso. Non si sostituisce la lunghezza del campo al tempo senza conoscere anche il moto lungo x.

## 08 — Uno scarto trasversale

La legge con il mezzo dà s=1 m. La proposta di due metri supera il risultato di un metro. Il numero due sarebbe invece il rapporto fra proposta e corretto, non la differenza.

Passaggi: `s=1\,\mathrm m\qquad e=s_{\rm proposto}-s\qquad e=(2-1)\,\mathrm m\qquad e=1\,\mathrm m`

Distrattori: −1 m inverte l’ordine, due metri copia la proposta e zero la accetta. Il rapporto puro due non ha l’unità dello scarto richiesto.

## 09 — Isolare E senza perdere t²

Moltiplichiamo s=qEt²/(2m) per 2m e dividiamo per qt²>0. Si ha E=2ms/(qt²). Le unità sono kg·m/(C·s²)=N/C. Insieme ai valori fissati q e m, questa è l’inversa che nelle unità assegnate dà il numero E/(1 kN/C)=2[s/(1 m)]/[t/(1 s)]².

Passaggi: `2ms=qEt^2\qquad E=\frac{2ms}{qt^2}\qquad [E]=\frac{\mathrm{kg\,m}}{\mathrm{C\,s^2}}\qquad [E]=\mathrm{N/C}`

Distrattori: La prima alternativa sbagliata omette due e dimezza il campo. Moltiplicare per t² invece di dividere altera la dimensione di quattro potenze del tempo; scambiare q e m non inverte la relazione. Il solo t al denominatore lascia una dimensione temporale in più.

## 10 — Il tempo si scala due volte

La stessa q e la stessa m compaiono in entrambe le prove. Il campo porta un fattore κ₁; il tempo al quadrato ne porta κ₂². Nel rapporto rimane κ₁κ₂². Entro ciascuna prova il campo è comunque costante.

Passaggi: `s_B=\frac{q(\kappa_1E_A)(\kappa_2t_A)^2}{2m}\qquad s_B/s_A=\kappa_1\kappa_2^2`

Distrattori: κ₁κ₂ perde una potenza del tempo; κ₁²κ₂ mette il quadrato sulla grandezza sbagliata. I quozienti rendono inversa una dipendenza che nella legge oraria è diretta.

## 11 — Un campo dimezzato per il doppio tempo

A dà 1 m. B ha accelerazione 1 m/s² e spostamento 1·2²/2=2 m. Il rapporto è due: metà campo moltiplicato per quattro dal tempo al quadrato. Il campo più debole non implica sempre deviazione minore se cambia anche la durata.

Passaggi: `s_A=1\,\mathrm m\qquad a_{y,B}=1\,\mathrm{m/s^2}\qquad s_B=2\,\mathrm m\qquad s_B/s_A=2`

Distrattori: Un mezzo considera solo il campo; uno tratterebbe il tempo linearmente e cancellerebbe i fattori. Quattro considera solo t², otto raddoppia il campo invece di dimezzarlo.

## 12 — Media di due deviazioni

Gli spostamenti sono 1 e 2 m, quindi la loro media è 3/2 m. Ai dati medi E=3/2 kN/C e t=3/2 s si avrebbe s=(3/2)(9/4)/2=27/16 m. Non coincide con la media delle uscite, che vale 24/16 m. Non occorre usare decimali.

Passaggi: `\overline s=\frac{1+2}{2}\,\mathrm m\qquad \overline s=3/2\,\mathrm m\qquad s(\overline E,\overline t)=27/16\,\mathrm m`

Distrattori: 27/16 m usa gli ingressi medi. Tre non dimezza la somma, un mezzo dimezza la differenza e due copia B. La media statistica non è una deviazione ottenuta unendo le due traiettorie.

## 13 — La durata per una deviazione doppia

Il bersaglio è 2 m e l’accelerazione B è 1 m/s². L’equazione 2 m=(1 m/s²)t_B²/2 impone t_B²=4 s² e t_B=2 s. Il rapporto con un secondo iniziale è due. La scelta positiva è necessaria per una durata.

Passaggi: `s_B=2\,\mathrm m\qquad t_B^2=4\,\mathrm{s^2}\qquad t_B=2\,\mathrm s\qquad t_B/t_A=2`

Distrattori: Quattro copia il rapporto dei quadrati. Un mezzo inverte B/A; √2 dimentica che anche il campo è dimezzato. Uno darebbe soltanto 1/2 m e non il bersaglio.

## 14 — Tarare la deviazione

A ha s=1 m, quindi a=3 m⁻¹. La lettura B indica 2 m. In due secondi serve accelerazione 2s/t²=1 m/s²; con il rapporto q/m fissato ciò richiede E_B=1 kN/C. Il display non misura direttamente il campo.

Passaggi: `a=3\,\mathrm{m^{-1}}\qquad s_B=2\,\mathrm m\qquad a_{y,B}=1\,\mathrm{m/s^2}\qquad E_B=1\,\mathrm{kN/C}`

Distrattori: Usare D=6 come metri darebbe E=3 kN/C. Due kN/C conserverebbero il campo A e predirebbero s=4 m, D=12. Mezzo kN/C darebbe s=1 m e D=3.

## 15 — L’offset prima dell’accelerazione

I riferimenti hanno s_A=1 m e s_B=2 m. Il guadagno è a=(5−3)/(2−1)=2 m⁻¹ e b=1. C ha s_C=(2−1)/2=1/2 m. In un secondo serve a_y=1 m/s², dunque E_C=1 kN/C.

Passaggi: `a=2\,\mathrm{m^{-1}}\qquad b=1\qquad s_C=1/2\,\mathrm m\qquad E_C=1\,\mathrm{kN/C}`

Distrattori: Due kN/C omettono b e danno s=1 m, D=3 anziché due. Mezzo kN/C darebbe s=1/4 m e D=3/2; quattro darebbe D=5. Zero renderebbe nullo s e lascerebbe solo il display b=1, oltre a violare E>0.

## 16 — Un campo scelto prima della prova

La legge interna è y(τ)=qEτ²/(2m), con E già fissato dal valore prescelto di T. Alla fine y(T)=qβT³/(2m). Il coefficiente qβ/(2m) vale 1 m/s³, quindi (T/(1 s))³=1. L’unica durata positiva è un secondo. Non si integra un campo che cresce come τ: quello sarebbe un modello diverso.

Passaggi: `E=\beta T\qquad y(\tau)=\frac{qE\tau^2}{2m}\qquad s(T)=\frac{q\beta T^3}{2m}\qquad \left(\frac T{1\,\mathrm s}\right)^3=1\qquad T=1\,\mathrm s`

Distrattori: −1 s non risolve la cubica e non è una durata positiva. Due secondi darebbero 8 m, mezzo secondo 1/8 m. La misura aggiunge un vincolo indipendente: la scala del tempo non resta libera. Sostituire E=βτ durante il moto cambierebbe la legge, non sarebbe un’altra soluzione di questa prova.
