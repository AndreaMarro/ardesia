# Rilettura prompt-only del revisore A: C4 Q051–100

Questa è una rilettura individuale prima della MIA apertura delle chiavi candidate B, non una sostituzione della primaria Root487d congelata prima dell’autoria B. Ho letto tutti cinquanta enunciati tramite allowlist id/prompt e annotato qui i conti e i limiti. Non ho ancora aperto il modello o la primaria Root né candidati, opzioni, chiavi, svolgimenti o figure B C4. La precedente esposizione Root sul soloQ091 è mantenuta; la mia compensazione db4f4c7e è anteriore al suo modello e alle candidate. Nessun credito o approvazione deriva da questa nota.

## C4-Q051

Due resistori da 30 Ω e 60 Ω sono in parallelo. L’insieme è in serie con 10 Ω ai capi di 9 V. Trova la corrente totale in A.

Il parallelo vale20Ω; aggiungo10Ω in serie e divido9V per30Ω: corrente3/10A.

## C4-Q052

Due resistori positivi di valori diversi sono in parallelo su un generatore ideale. Quale dissipa maggiore potenza?

Con la medesima tensione non nulla, P=V²/R: dissipa di più il resistore minore. Se V=0 entrambe le potenze sono zero, quindi il confronto stretto richiede tensione non nulla.

## C4-Q053

Nel linguaggio dei circuiti ideali, come si chiama l’insieme di estremi collegati fra loro da filo ideale e aventi lo stesso potenziale? Usa il singolare.

Il termine è nodo: conta la connessione tramite fili ideali, non la vicinanza grafica.

## C4-Q054

Un resistore da 100 Ω porta 20 mA costanti per 30 s. Calcola l’energia dissipata in J.

I=20mA=1/50A; energia I²Rt=(1/2500)·100·30J=6/5J.

## C4-Q055

Un resistore da 12 Ω è in parallelo a un resistore incognito. L’equivalente misurata è 4 Ω. Calcola la resistenza incognita in Ω.

1/R=1/4−1/12=1/6Ω⁻¹: R=6Ω, positivo e maggiore dell’equivalente.

## C4-Q056

Due resistori sono in parallelo direttamente ai morsetti di una sorgente ideale di tensione. Si apre un ramo. Nel ramo che resta collegato cosa accade alla corrente?

Sul ramo rimasto la tensione ideale e la sua resistenza restano uguali: la corrente è invariata. Cambia la corrente totale, non quella del ramo superstite.

## C4-Q057

Come si chiama l’effetto per cui un resistore trasforma l’energia elettrica ricevuta in energia interna? Completa «effetto …».

L’effetto è Joule: l’energia elettrica ricevuta diventa energia interna e può poi essere ceduta come calore.

## C4-Q058

Un generatore ideale da 12 V alimenta due resistori in serie. Sul primo da 80 Ω si vogliono 4 V. Trova R₂ in Ω.

I=4V/80Ω=1/20A. Il secondo resistore riceve8V: R₂=160Ω.

## C4-Q059

Uno schema disegna due resistori vicini e alla stessa altezza. Quale informazione serve per stabilire con certezza se sono in parallelo?

Occorre sapere se i due resistori sono collegati agli stessi due nodi, non solo se sono disegnati alla stessa altezza.

## C4-Q060

Un resistore ohmico dissipa 8,0 W. Il generatore riduce la tensione ai suoi capi alla metà, mantenendo R invariata. Trova la nuova potenza in W.

A R fissata, P∝V². Dimezzare la tensione divide8W per quattro:2W.

## C4-Q061

Aumentando la tensione di un condensatore lineare da 2 a 5 V, il modulo della carica su un’armatura aumenta di 18 μC. Trova C in μF.

Capacità lineare costante: ΔQ=CΔV, quindi18μC/3V=6μF.

## C4-Q062

Un condensatore piano scollegato dal generatore conserva la propria carica. Le armature vengono allontanate, senza cambiare area o dielettrico e trascurando i bordi. Che cosa succede alla tensione?

Per piastre grandi a carica libera fissata, C=εA/d diminuisce e |V|=|Q|/C aumenta se Q non è nulla. Per Q=0 resterebbe zero: controllare il dominio del candidato.

## C4-Q063

Come si chiama l’unità SI corrispondente a un coulomb per volt?

L’unità C/V si chiama farad.

## C4-Q064

Un condensatore piano nel vuoto ha distanza 1,0 mm e capacità 88,5 pF. Usa ε₀ = 8,85 × 10⁻¹² F/m e trascura i bordi. Trova l’area affacciata in cm².

A=Cd/ε₀=(88,5·10⁻¹²F)(10⁻³m)/(8,85·10⁻¹²F/m)=10⁻²m²=100cm².

## C4-Q065

Quale grafico consente di ricavare l’energia del condensatore ideale inizialmente scarico come area di un triangolo?

Per il lavoro reversibile di carica uso U=∫VdQ: retta V(Q) di pendenza1/C dal condensatore scarico. Per capacità lineare anche l’area sotto Q(V) vale CV²/2; le eventuali alternative vanno lette per escludere due risposte equivalenti.

## C4-Q066

Un condensatore da 5,0 μF passa da 2,0 a 4,0 V. Quanto aumenta l’energia in μJ?

ΔU=C(V_f²−V_i²)/2=(5μF/2)(16−4)V²=30μJ.

## C4-Q067

Inseriamo un dielettrico tra le piastre di un condensatore mantenuto collegato a un generatore ideale. Quale grandezza elettrica resta fissata ai capi?

La sorgente ideale collegata mantiene la tensione fra le armature, mentre Q e U possono cambiare.

## C4-Q068

Un condensatore collegato a 8 V immagazzina 16 μJ. Un dielettrico che riempie tutto lo spazio raddoppia la capacità. Qual è l’energia finale in μJ?

A tensione fissata U=CV²/2. Raddoppiando C si passa da16 a32μJ; non si conserva l’energia del solo condensatore.

## C4-Q069

Un condensatore porta +7 μC su una piastra e −7 μC sull’altra. Quale valore di Q usi per il modulo in C = Q/|ΔV|?

Q è il modulo su una sola armatura:7μC. Non è né14μC né la carica netta zero dell’intero condensatore.

## C4-Q070

Un condensatore da 8,0 μF immagazzina 100 μJ. Trova il modulo della differenza di potenziale in V.

|V|=√(2U/C)=√(200/8)V=5V; ramo positivo perché si chiede un modulo.

## C4-Q071

Tre condensatori distinti da 2, 3 e 5 μF sono in parallelo su 4 V. Trova la carica totale fornita al nodo positivo in μC.

In parallelo C_tot=(2+3+5)μF=10μF; Q=10μF·4V=40μC.

## C4-Q072

Due condensatori di diversa capacità sono in serie con nodo centrale isolato inizialmente neutro. Quale sostiene la maggiore tensione in modulo dopo la carica?

Il nodo centrale inizialmente neutro impone uguali moduli Q sulle armature in serie. Con carica non nulla |V|=Q/C è maggiore sul C minore; tensione totale nulla darebbe entrambe zero.

## C4-Q073

All’inizio il nodo isolato fra due condensatori in serie è neutro. Quale grandezza algebrica totale di quel nodo si conserva durante la carica del circuito? Rispondi con il nome.

Si conserva la carica algebrica netta del nodo isolato, inizialmente zero.

## C4-Q074

Un condensatore da 9 μF in serie con uno ignoto dà capacità equivalente 3 μF. Trova la capacità ignota in μF.

1/C_x=1/3−1/9=2/9μF⁻¹, dunque C_x=9/2μF.

## C4-Q075

Due condensatori identici da C, inizialmente caricati entrambi a V, sono scollegati dalle sorgenti. Si connette la piastra positiva di ciascuno a quella negativa dell’altro. Dopo il transitorio reale qual è il modulo della tensione comune?

Ogni nuovo nodo riceve +CV e−CV, quindi carica netta zero. Dopo un transitorio reale dissipativo, la tensione comune è zero; nel circuito ideale privo di smorzamento non si assumerebbe senza condizioni uno stato finale statico.

## C4-Q076

Due condensatori da 3 μF e 6 μF sono in parallelo. Il loro insieme è in serie con 9 μF. Trova Ceq in μF.

Il parallelo3+6 vale9μF; in serie con9μF dà9/2μF.

## C4-Q077

Qual è il nome del collegamento in cui due condensatori hanno gli stessi due nodi e la medesima tensione?

Il collegamento agli stessi due nodi è parallelo.

## C4-Q078

Un condensatore da 2 μF a 8 V e uno da 6 μF a 4 V sono scollegati dalle sorgenti e connessi in parallelo con le armature positive insieme. Trova la tensione finale in V.

La carica al nodo positivo è(2·8+6·4)μC=40μC; C_tot=8μF e V_f=5V. Le batterie sono scollegate e le polarità collegate concordemente.

## C4-Q079

Un condensatore carico viene collegato in parallelo a uno identico scarico, senza batterie. La tensione finale si dimezza. Come cambia l’energia totale immagazzinata rispetto a prima?

Per due C identici la capacità finale è2C e V_f=V_i/2. U_f=(2C)(V_i/2)²/2=U_i/2; il resto va ad altre forme durante il transitorio.

## C4-Q080

Due condensatori da 4 μF e 12 μF possono essere collegati tra gli stessi morsetti in parallelo o in serie. Calcola il rapporto Cp/Cs.

Cp=16μF; Cs=48/16μF=3μF; il rapporto richiesto è16/3, non una nuova capacità.

## C4-Q081

In prossimità di un lungo filo rettilineo la corrente viene invertita. Che cosa succede al contributo magnetico prodotto dal filo in un punto fisso?

Il contributo del filo è lineare nella corrente: invertendone il verso si inverte B nel punto fisso. Se il modulo della corrente è mantenuto, anche il modulo del campo è mantenuto.

## C4-Q082

Una particella passa perpendicolarmente a B = 0,50 T alla velocità 400 m/s e subisce forza magnetica di 2,0 μN. Trova il modulo della carica in nC.

Moto perpendicolare: |q|=F/(vB)=2·10⁻⁶/(400·0,50)C=10nC.

## C4-Q083

Una particella carica con velocità non nulla attraversa un campo magnetico non nullo senza forza magnetica. Completa: la velocità è parallela o … al campo.

Con q, v e B non nulli, qv×B=0 richiede velocità parallela o antiparallela al campo.

## C4-Q084

Un tratto di filo lungo 0,30 m porta 4,0 A in B = 0,20 T. L’angolo fra filo e B è 30°. Calcola il modulo della forza in N.

F=IℓBsin30°=4·0,30·0,20·1/2N=3/25N=0,12N.

## C4-Q085

Una particella negativa si muove verso destra in B entrante perpendicolare al foglio. In quale verso punta la forza magnetica?

Con destra+x e fuori dal foglio+z, B è−z e v×B è+y. La carica negativa inverte il verso: forza verso il basso.

## C4-Q086

Una particella non relativistica impiega 0,40 ms per percorrere un quarto di circonferenza a velocità costante in B uniforme. Trova la frequenza di rotazione in Hz.

Il periodo è quattro volte0,40ms:1,60ms. La frequenza è1/T=625Hz.

## C4-Q087

In B uniforme, senza altre forze, una particella carica ha velocità con componenti non nulle parallela e perpendicolare al campo. Qual è la forma della traiettoria?

Le componenti parallela e perpendicolare non nulle danno un’elica a passo costante in campo uniforme, senza altre forze.

## C4-Q088

Una particella passa in un campo magnetico statico uniforme e il suo vettore velocità ruota di 90°. È soggetta solo alla forza magnetica. Calcola in J la variazione dell’energia cinetica.

La forza magnetica è perpendicolare alla velocità e non compie lavoro: ΔK=0J anche quando il vettore velocità ruota.

## C4-Q089

Due particelle entrano perpendicolarmente nello stesso B con la stessa quantità di moto in modulo. Una porta carica +e, l’altra +2e. Quale ha il raggio più piccolo?

r=p/(|q|B). Con uguali p e B non nulli, +2e dà raggio dimezzato rispetto a+e.

## C4-Q090

Una particella positiva attraversa senza deviazione campi uniformi E e B perpendicolari fra loro e alla velocità. Le due forze hanno versi opposti. Se E = 1200 V/m e B = 0,040 T, qual è la velocità in m/s?

Le forze si cancellano se qE=qvB: v=1200/0,040m/s=30000m/s, nel regime non relativistico.

## C4-Q091

Una spira piana di area 0,020 m² è in B = 0,30 T. L’angolo fra B e la normale scelta è 60°. Calcola il flusso in mWb.

Compensazione indipendente già congelata db4f4c7e: Φ=BAcos60°=(0,30T)(0,020m²)/2=0,003Wb=3mWb, con segno positivo rispetto alla normale scelta.

## C4-Q092

Una spira conduttrice chiusa resta ferma con area e orientamento fissi in un campo magnetico uniforme costante. Qual è la f.e.m. dovuta a quel campo?

Area, orientamento e campo fissi rendono costante il flusso: la f.e.m. dovuta a quel campo è zero.

## C4-Q093

Quale cognome identifica la regola secondo cui l’induzione contrasta la variazione di flusso che l’ha generata?

Il cognome richiesto è Lenz: si contrasta la variazione del flusso, non sempre il campo preesistente.

## C4-Q094

Una bobina di 80 spire identiche presenta una f.e.m. media di modulo 1,6 V. Quanto vale il modulo della variazione di flusso per spira al secondo, in Wb/s?

Per80spire identiche |ε_media|=80|ΔΦ/Δt|: variazione media di flusso per spira1,6/80=1/50Wb/s.

## C4-Q095

Un osservatore vede una corrente indotta antioraria in una spira. Un osservatore che la guarda dal lato opposto descrive la stessa corrente come …

Guardando la medesima spira dal lato opposto si scambia la descrizione antioraria/oraria. Non si è invertita fisicamente la corrente.

## C4-Q096

Una sola spira di area 0,010 m² ruota di mezzo giro in B uniforme di 0,50 T in 0,10 s. La normale scelta, inizialmente concorde con B, termina discorde. Trova il modulo della f.e.m. media in V.

La normale passa da concorde a discorde: flusso da+0,005 a−0,005Wb. Il modulo della variazione è0,010Wb e la f.e.m. media ha modulo1/10V.

## C4-Q097

Una spira presenta un’interruzione isolante e un flusso magnetico variabile. Quale grandezza, possibile in una spira chiusa resistiva, manca come circolazione continua di carica lungo tutta la spira aperta?

L’interruzione isolante impedisce una corrente continua di conduzione attorno all’intera spira. Può restare una f.e.m. o una tensione ai capi del taglio e possono esserci transitori.

## C4-Q098

Una spira singola di resistenza 5,0 Ω, con autoinduzione trascurabile, subisce una variazione monotona di flusso di modulo 0,030 Wb. Qual è il modulo della carica transitata in mC?

Con resistenza costante e autoinduzione trascurata, ∫I dt=−ΔΦ/R. Variazione monotona: modulo carica0,030/5C=6mC.

## C4-Q099

Una spira conduttrice viene spinta in una regione con B entrante uniforme, partendo completamente fuori. Durante l’ingresso l’area immersa cresce. Quale verso ha la corrente vista dal davanti?

Durante l’ingresso aumenta il flusso entrante. La corrente indotta produce campo uscente, quindi è antioraria vista dal davanti.

## C4-Q100

Una spira singola concatena un flusso che sale linearmente da 0 a 8 mWb nei primi 4 ms e resta poi costante per 4 ms. Calcola il modulo della f.e.m. media sull’intero intervallo di 8 ms in V.

La f.e.m. media sull’intero8ms usa il salto totale8mWb: modulo1V. Nei primi4ms il modulo istantaneo è2V, nei successivi4ms è0; qui gli intervalli sono uguali.
