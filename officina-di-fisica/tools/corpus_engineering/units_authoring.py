"""Authored revisions. Assembly only: scientific answers come from the independent verifier."""
import json
import base64
from pathlib import Path

from .pipeline import canonical, digest, git_bytes, sha


def text(value): return {"type": "text", "text": value}
def formula(value): return {"type": "formula", "text": value}


def law_steps(value):
    """Each equality is an explicit readable step, rather than one phone-wide chain."""
    steps = []
    for equation in value.replace(r"\quad\Rightarrow\quad", r"\qquad").split(r"\qquad"):
        parts = equation.split("=")
        if len(parts) == 1:
            steps.append(formula(equation))
        else:
            steps.extend(formula(a + "=" + b) for a, b in zip(parts, parts[1:]))
    return steps


# Each tuple is a complete authored task, not prose padded from a common template.
# Choices contain the correct value once; symbolic answers are presented as a choice
# because the existing numeric grader intentionally does not evaluate algebra.
AREA = [
 ("Le caselle cambiano, la superficie resta", "Un rettangolo copre 2 vecchie unità di area. Ogni vecchia unità di lunghezza contiene 2 nuove unità di lunghezza. Quante nuove unità di area coprono lo stesso rettangolo?", 8,
  "Una vecchia casella ha due lati da suddividere. Due intervalli lungo la base e due lungo l’altezza formano quattro caselle nuove. Il rettangolo contiene due vecchie caselle: contiamo quindi due gruppi da quattro. La superficie del rettangolo è invariata; cambia il campione con cui la misuriamo.", r"B=A c^2=2\times2^2=2\times4=8",
  "Il numero 8 è un conteggio di unità di area, non una lunghezza. Riconvertendo, 8/4=2 vecchie unità: il percorso inverso ricostruisce il dato."),
 ("Unità di un valore numerico", "L’area fisica si scrive S=B·u², dove u è una lunghezza usata come unità. La domanda riguarda B, cioè il solo valore numerico. Quale unità è dimensionalmente compatibile con B?", ["m²", "m", "1", "kg", "s"],
  "La grandezza S possiede dimensione di area. Questa dimensione è già contenuta nel fattore u². Dividendo S per u² otteniamo il numero di caselle, che è adimensionale. Se invece si chiedesse l’unità di S, m² sarebbe appropriato: qui si chiede esplicitamente B.", r"B=\frac{S}{u^2},\qquad [B]=\frac{L^2}{L^2}=1",
  "Un prefisso può cambiare il numero di caselle ma non trasforma B in una lunghezza o in una massa. La risposta è 1; nella scrittura ordinaria di un semplice numero si omette spesso questo simbolo."),
 ("Il fattore va applicato due volte", "A è il valore numerico di un’area nella vecchia unità. Ogni vecchia unità di lunghezza contiene c nuove unità, con c>0. Quale relazione dà il nuovo valore numerico B?", ["B=A c", "B=A/c²", "B=A c²", "B=A+c²", "B=A² c"],
  "La conversione deve riguardare entrambe le direzioni della superficie. Su ogni lato il conteggio cresce di c; il prodotto dei due conteggi cresce di c·c. A rimane il numero iniziale di unità di area, non un lato da elevare al quadrato.", r"S=A u_{\rm vecchia}^2=A(c u_{\rm nuova})^2=A c^2u_{\rm nuova}^2",
  "Confrontando i coefficienti della stessa nuova unità quadrata troviamo B=A c². A c applicherebbe un solo fattore lineare; A/c² descriverebbe la conversione nel verso opposto."),
 ("Confrontare a unità fissate", "Il fattore lineare di conversione resta c=2. Il valore iniziale A passa da 2 a 4. Che cosa accade al valore convertito B?", ["Raddoppia", "Si dimezza", "Quadruplica", "Resta uguale", "Diventa nullo"],
  "Poiché la coppia di unità resta la stessa, anche il fattore c² resta 4. Nel primo caso B vale 2·4=8; nel secondo 4·4=16. È cambiata la quantità di superficie misurata nella vecchia unità, non la scala della conversione.", r"\frac{B_2}{B_1}=\frac{4\times4}{2\times4}=2",
  "B raddoppia. L’esponente due riguarda il fattore di lunghezza c, non ogni variabile della formula. Elevare al quadrato il raddoppio di A confonde il ruolo dei due dati."),
 ("Tornare alla vecchia misura", "Un’area occupa 8 nuove unità di area. Ogni vecchia unità di lunghezza contiene 2 nuove unità di lunghezza. Qual era il valore numerico A nella vecchia unità di area?", 2,
  "Per passare al nuovo conteggio avevamo moltiplicato per c². Per tornare indietro dividiamo entrambi i membri della stessa uguaglianza per c². La divisione è lecita perché c=2 è diverso da zero.", r"B=A c^2\quad\Rightarrow\quad\frac{B}{c^2}=A\quad\Rightarrow\quad A=\frac{8}{2^2}=\frac84=2",
  "Due vecchie caselle contengono ciascuna quattro caselle nuove e ricostruiscono le otto date. Dividere soltanto per due farebbe la conversione di una lunghezza, non di una superficie."),
 ("Ricostruire la scala lineare", "La stessa area ha valore numerico A=2 nella vecchia unità e B=8 nella nuova unità. Quante nuove unità di lunghezza contiene una vecchia unità di lunghezza?", 2,
  "Il rapporto fra i conteggi delle aree è 8/2=4. Questo rapporto è c²: il fattore lineare è la radice quadrata, non il rapporto stesso. Dividiamo per A e poi scegliamo la radice positiva, perché un rapporto fra lunghezze delle unità è positivo.", r"\frac BA=c^2\quad\Rightarrow\quad c=\sqrt{\frac BA}=\sqrt{\frac82}=\sqrt4=2",
  "Non occorre una calcolatrice: 2·2=4. Il controllo diretto dà 2·2²=8. La radice negativa risolverebbe l’equazione algebrica ma non rappresenterebbe la lunghezza di un’unità."),
 ("Dimezzare il lato della casella", "La superficie è fissa. Una prima scelta di unità dà c=2; una seconda dà c=4, sempre rispetto alla stessa vecchia unità. Qual è il rapporto fra il secondo e il primo valore numerico dell’area?", ["2", "1/2", "4", "8", "1"],
  "Il secondo fattore lineare è doppio del primo. Le nuove caselle hanno lati dimezzati e area ridotta a un quarto: per ricoprire la medesima superficie ne servono quattro volte tante. Possiamo eliminare A prima di usare i numeri.", r"\frac{B_2}{B_1}=\frac{A c_2^2}{A c_1^2}=\left(\frac{c_2}{c_1}\right)^2=\left(\frac42\right)^2=4",
  "Il rapporto è adimensionale. Non è la superficie fisica a quadruplicare: è il numero delle unità più piccole necessarie a descriverla."),
 ("Concentrazione di massa in SI", "Una soluzione contiene 6 g di soluto in un volume finale di 2 cm³. La concentrazione di massa è massa del soluto divisa per volume finale della soluzione. Usa 1 g=10⁻³ kg e 1 cm=10⁻² m. Qual è la concentrazione in kg/m³?", ["3", "30", "300", "3000", "30000"],
  "Il volume è già quello della soluzione finale: non va ricostruito sommando volumi di soluto e solvente. Convertiamo massa e volume separatamente. Il centimetro entra tre volte nel centimetro cubo, quindi il volume è 2·10⁻⁶ m³. La massa è 6·10⁻³ kg.", r"C_m=\frac{6\times10^{-3}\,\mathrm{kg}}{2\times10^{-6}\,\mathrm{m^3}}=\frac62\times10^{3}\,\mathrm{kg/m^3}=3000\,\mathrm{kg/m^3}",
  "Abbiamo diviso 6 per 2 e sottratto gli esponenti: −3−(−6)=3. Un controllo utile è 1 g/cm³=1000 kg/m³. La concentrazione di soluto non va confusa con la densità dell’intera soluzione."),
 ("Isolare il conteggio iniziale", "La relazione fra i valori numerici di un’area è B=A c², con c>0. Si conoscono B e c. Quale formula permette di trovare A?", ["A=B/c", "A=B c²", "A=B/c²", "A=√(B/c)", "A=B²/c"],
  "L’incognita A è moltiplicata per c². Per lasciarla sola dobbiamo fare l’operazione inversa su entrambi i membri: dividere per c². Questo passaggio conserva l’uguaglianza e non richiede di spostare simboli cambiandoli a memoria.", r"\frac{B}{c^2}=\frac{A c^2}{c^2}=A",
  "Sostituendo A=B/c² nella relazione iniziale otteniamo (B/c²)c²=B. La semplificazione è valida soltanto per c diverso da zero, condizione già garantita da c>0."),
 ("Due cambiamenti, due fattori", "Fra due misure A₂=κ₁A₁ e c₂=κ₂c₁, con tutti i fattori positivi. La legge è B=A c². Qual è B₂/B₁?", ["κ₁κ₂", "κ₁²κ₂", "κ₁κ₂²", "κ₁/κ₂²", "κ₂²/κ₁"],
  "Scriviamo la legge due volte. Nella seconda misura sostituiamo sia A₂ sia c₂. Il quadrato di un prodotto è il prodotto dei quadrati: κ₂ è quindi elevato al quadrato insieme a c₁. Il fattore κ₁ resta alla prima potenza.", r"\frac{B_2}{B_1}=\frac{(\kappa_1 A_1)(\kappa_2 c_1)^2}{A_1 c_1^2}=\kappa_1\kappa_2^2",
  "Se κ₁=κ₂=1 il rapporto vale 1, come deve essere per due misure uguali. Se cambia soltanto A si recupera la proporzionalità diretta con A."),
 ("Aumentare area e scala", "Nella prima prova A₁=2 e c₁=2; nella seconda A₂=4 e c₂=4. Con B=A c², quanto vale B₂/B₁?", 8,
  "Qui A raddoppia e anche c raddoppia. Il primo cambiamento dà un fattore 2; il secondo dà un fattore 2²=4. Il prodotto dei fattori permette di evitare di calcolare due numeri grandi.", r"\frac{B_2}{B_1}=\frac42\left(\frac42\right)^2=2\times4=8",
  "Controlliamo anche direttamente: B₁=2·4=8 e B₂=4·16=64; 64/8=8. I due calcoli coincidono. Sommare i due fattori di variazione non descrive una legge moltiplicativa."),
 ("La media delle indicazioni", "Un convertitore visualizza soltanto il numero B=A c². Le due registrazioni sono (A=2,c=2) e (A=4,c=4), con lo stesso peso statistico. Qual è la media aritmetica dei due numeri visualizzati? Non si chiede una superficie media: le due conversioni usano unità di uscita diverse.", ["27", "32", "36", "64", "72"],
  "Prima costruiamo ciascuna indicazione: 2·2²=8 e 4·4²=64. Poi facciamo la media dei numeri visualizzati. L’operazione riguarda un registro di numeri, non due superfici da sommare in unità diverse. Questa distinzione è necessaria perché c cambia fra le registrazioni.", r"\overline B=\frac{8+64}{2}=\frac{72}{2}=36",
  "Inserire nella legge le medie A=3 e c=3 darebbe 27: è un’operazione diversa. In generale la media dell’uscita di una legge non lineare non coincide con l’uscita calcolata sulle medie degli ingressi."),
 ("Trovare il secondo cambiamento", "Il convertitore usa B=A c². A passa da 2 a 4; si vuole che B diventi 8 volte il valore iniziale. Quale rapporto c₂/c₁ serve, sapendo che c è positivo?", 2,
  "Il raddoppio di A fornisce già un fattore due. Il fattore ancora necessario nell’uscita è 8/2=4. Questo fattore deve essere il quadrato del rapporto fra le scale lineari.", r"8=2\left(\frac{c_2}{c_1}\right)^2\quad\Rightarrow\quad4=\left(\frac{c_2}{c_1}\right)^2\quad\Rightarrow\quad\frac{c_2}{c_1}=2",
  "La soluzione positiva è unica. Verifichiamo moltiplicando i contributi: 2·2²=8. Scegliere un rapporto quattro trasformerebbe il suo contributo in sedici e farebbe crescere B di trentadue volte."),
 ("Tarare con un riferimento", "Un convertitore usa B=A c²; un display indica S=aB, con a>0 costante e offset nullo. Per A=2,c=2 il display indica 24. In una nuova prova, con c=4, indica 192. Quanto vale A nella nuova prova? Le due letture S hanno la stessa unità strumentale.", 4,
  "Nel riferimento B=2·2²=8, quindi il display moltiplica il numero vero per a=24/8=3. Nella nuova prova togliamo prima questo fattore strumentale: B=192/3=64. Solo allora invertiamo la conversione di area.", r"a=\frac{24}{8}=3,\qquad B_{\rm nuovo}=\frac{192}{3}=64,\qquad A_{\rm nuovo}=\frac{64}{4^2}=4",
  "Per dividere 192 per 3 basta scomporre 192=180+12: si ottiene 60+4. Ricostruendo il display troviamo 3·(4·16)=192. Usare direttamente 192 come B confonderebbe indicazione e valore convertito."),
 ("Separare guadagno e offset", "Un display segue S=aB+b e il convertitore segue B=A c². I riferimenti sono (A=2,c=2,S=17) e (A=4,c=4,S=129). Nella prova ignota c=2 e S=33. a e b sono costanti: quanto vale A?", ["2", "3", "4", "8", "16"],
  "I due riferimenti corrispondono a B=8 e B=64. Sottraendo le letture eliminiamo b: 129−17=112 e 64−8=56, quindi a=112/56=2. Nel primo riferimento 17=2·8+b lascia b=1. La lettura ignota va corretta sia per l’offset sia per il guadagno.", r"B=\frac{33-1}{2}=16,\qquad A=\frac{16}{2^2}=4",
  "Il controllo completo dà S=2·(4·4)+1=33. Un rapporto fra letture non elimina un offset additivo: per questo la taratura con due riferimenti richiede prima una sottrazione."),
 ("Un vincolo rende unico il risultato", "I numeri positivi A e c soddisfano A=c. Il convertitore segue B=A c² e indica B=8. Quanto vale c? A e c sono qui valori numerici, non grandezze di dimensioni diverse.", ["−2", "1", "2", "4", "8"],
  "La sola uscita B lascerebbe molte coppie possibili: per esempio A=8,c=1. Il vincolo A=c elimina una delle incognite. Sostituendolo nella legge rimane c·c²=c³. Dobbiamo quindi riconoscere il numero positivo il cui cubo è otto.", r"8=c\,c^2=c^3,\qquad2\times2\times2=8\quad\Rightarrow\quad c=2",
  "Per c>0 la funzione c³ cresce strettamente, quindi la soluzione è unica. Il controllo con A=2 dà B=2·4=8. Senza il vincolo iniziale non sarebbe lecito dichiarare determinato c.")
]


VOLUME = [
 ("Contare i cubetti", "Un volume occupa 2 vecchie unità cubiche. Una vecchia unità di lunghezza contiene 2 nuove unità di lunghezza. Quante nuove unità cubiche descrivono lo stesso volume?", 16,
  "Ogni vecchio cubo si divide in due parti lungo ciascuna delle tre direzioni: larghezza, profondità e altezza. Uno strato contiene 2·2=4 cubetti e gli strati sono due. Ogni vecchio cubo contiene dunque otto cubetti nuovi; i vecchi cubi sono due.", r"W=V c^3=2\times2^3=2\times8=16",
  "Il volume occupato resta identico. Tornando indietro, 16/8=2 vecchie unità cubiche. Il fattore quattro riguarderebbe solo due direzioni e lascerebbe fuori l’altezza."),
 ("Il numero di unità cubiche", "Il volume fisico è Q=W·u³, dove u è la lunghezza scelta come unità. Quale unità è dimensionalmente compatibile con il solo numero W?", ["m³", "m", "1", "kg", "K"],
  "Q ha dimensione di volume e u³ ha la stessa dimensione. Il rapporto Q/u³ conta le unità cubiche: è un numero puro. Non si sta chiedendo l’unità del volume fisico Q, che potrebbe essere m³.", r"W=\frac{Q}{u^3},\qquad[W]=\frac{L^3}{L^3}=1",
  "La risposta 1 indica l’adimensionalità. Cambiando u cambia W, ma il prodotto W·u³ continua a descrivere lo stesso volume."),
 ("Raddoppiare un campione omogeneo", "Due porzioni identiche della stessa sostanza omogenea, alla stessa temperatura e pressione, vengono considerate insieme, senza spazi vuoti o variazioni di stato. Quali grandezze raddoppiano rispetto a una porzione?", ["Massa, volume e densità", "Solo la densità", "Massa e volume; la densità resta uguale", "Massa e densità; il volume resta uguale", "Volume e densità; la massa resta uguale"],
  "Le masse delle due porzioni si sommano e anche i volumi sono additivi nelle condizioni assegnate. La densità è invece il rapporto fra massa e volume: numeratore e denominatore raddoppiano insieme e il fattore due si semplifica.", r"\rho_{\rm insieme}=\frac{2m}{2V}=\frac mV=\rho",
  "Massa e volume sono grandezze estensive; la densità, in queste condizioni, è intensiva. Non è una regola per qualsiasi miscela: mescolare sostanze diverse può comportare un volume finale diverso dalla somma dei volumi iniziali."),
 ("Il volume a scala fissata", "Il convertitore usa W=V c³. Mantenendo c=2, V passa da 2 a 4. Che cosa accade a W?", ["Raddoppia", "Quadruplica", "Aumenta di otto volte", "Si dimezza", "Resta uguale"],
  "Il cubo riguarda c e c non cambia. Il moltiplicatore resta c³=8. Il primo numero convertito è 2·8=16 e il secondo è 4·8=32. La legge è lineare rispetto a V.", r"\frac{W_2}{W_1}=\frac{4\times8}{2\times8}=2",
  "W raddoppia. Un aumento di otto volte si avrebbe raddoppiando soltanto il fattore lineare c, non il valore numerico iniziale V."),
 ("Invertire la conversione cubica", "Un volume occupa 16 nuove unità cubiche. Ogni vecchia unità di lunghezza contiene 2 nuove unità di lunghezza. Quante vecchie unità cubiche occupa?", 2,
  "La relazione W=V c³ moltiplica il conteggio iniziale per otto. Dividiamo entrambi i membri per c³, che è positivo. Non serve estrarre una radice: l’incognita V compare alla prima potenza.", r"\frac{W}{c^3}=V,\qquad V=\frac{16}{2^3}=\frac{16}{8}=2",
  "Due vecchi cubi, con otto nuovi cubetti ciascuno, danno sedici cubetti. La radice cubica servirebbe se l’incognita fosse c."),
 ("Dal rapporto dei volumi al lato", "Lo stesso volume ha valore numerico V=2 nella vecchia unità e W=16 nella nuova. Il fattore lineare c è positivo e W=V c³. Quanto vale c?", 2,
  "Dividendo per V troviamo il rapporto fra i conteggi cubici: 16/2=8. Per ottenere il rapporto fra le lunghezze delle unità dobbiamo estrarre la radice cubica. Il numero due produce esattamente otto quando viene moltiplicato per sé tre volte.", r"c^3=\frac{W}{V}=8,\qquad c=\sqrt[3]{8}=2",
  "La conversione ricostruita è 2·2³=16. Rispondere otto confonderebbe il rapporto fra volumi unitari con quello fra lunghezze unitarie."),
 ("Cambiare solo la scala del cubo", "V resta fisso. Il fattore lineare di conversione passa da c₁=2 a c₂=4. Con W=V c³, quanto vale W₂/W₁?", ["2", "4", "8", "16", "1/8"],
  "Le unità nuove della seconda conversione hanno lati dimezzati rispetto a quelle della prima. Ogni vecchio cubetto si divide in due lungo tre direzioni, quindi contiene otto cubetti nuovi. Nel rapporto V si elimina.", r"\frac{W_2}{W_1}=\left(\frac{c_2}{c_1}\right)^3=\left(\frac42\right)^3=2^3=8",
  "Il risultato è un rapporto senza unità. La superficie di una faccia aumenterebbe il proprio conteggio di quattro volte; il volume richiede anche la terza direzione."),
 ("Da decimetri cubici a millilitri", "Un recipiente contiene 3/4 dm³ di acqua. Usa 1 dm³=1 L e 1 L=1000 mL. Quanti millilitri contiene?", ["75", "7500", "3/4", "3/4000", "750"],
  "Il decimetro cubo e il litro rappresentano esattamente lo stesso volume. Tre quarti di decimetro cubo sono dunque tre quarti di litro. Per trovare tre quarti di mille, dividiamo prima mille per quattro e poi moltiplichiamo per tre.", r"\frac34\,\mathrm{dm^3}=\frac34\,\mathrm L=\frac{1000}{4}\times3\,\mathrm{mL}=250\times3\,\mathrm{mL}=750\,\mathrm{mL}",
  "Tre quarti di litro devono essere meno di mille millilitri e più di mezzo litro, cioè cinquecento millilitri. Questo controllo esclude sia 7500 sia 75."),
 ("Isolare V senza radici", "La conversione è W=V c³ e c>0. Quale relazione esprime V in funzione di W e c?", ["V=W/c", "V=W/c³", "V=W c³", "V=∛(W/c)", "V=W³/c"],
  "V moltiplica l’intero fattore c³. Dividere entrambi i membri per quel fattore lascia V da solo. Il fatto che nella formula compaia un cubo non impone una radice per qualsiasi incognita: dipende da quale simbolo è elevato al cubo.", r"\frac{W}{c^3}=\frac{V c^3}{c^3}=V",
  "Inserendo l’inversa nella formula originale, (W/c³)c³=W. La condizione c>0 garantisce che il denominatore non sia nullo."),
 ("La legge dei fattori nel volume", "La legge è W=V c³. Fra due stati V₂=κ₁V₁ e c₂=κ₂c₁, con fattori positivi. Qual è W₂/W₁?", ["κ₁κ₂", "κ₁³κ₂", "κ₁κ₂³", "κ₁/κ₂³", "κ₂³/κ₁"],
  "Sostituiamo i due nuovi valori nella stessa legge e dividiamo per l’uscita iniziale. Il fattore κ₁ moltiplica V una volta, mentre κ₂ compare tre volte perché moltiplica il lato di un’unità cubica.", r"\frac{W_2}{W_1}=\frac{(\kappa_1V_1)(\kappa_2c_1)^3}{V_1c_1^3}=\kappa_1\kappa_2^3",
  "Se i due fattori sono entrambi due si ottiene 2·8=16. Se κ₂=1 si conserva la sola proporzionalità diretta con V: è un controllo del caso limite."),
 ("Due raddoppi diversi", "Nella prima conversione V₁=2,c₁=2; nella seconda V₂=4,c₂=4. Con W=V c³, trova W₂/W₁.", 16,
  "Il valore iniziale V raddoppia e fornisce un fattore due. Il fattore lineare c raddoppia e il suo cubo fornisce un fattore otto. Il rapporto complessivo è il prodotto dei due contributi.", r"\frac{W_2}{W_1}=\frac42\left(\frac42\right)^3=2\times8=16",
  "Un controllo diretto dà W₁=2·8=16 e W₂=4·64=256; 256/16=16. Sommare due e otto darebbe dieci, che non rispetta la legge di conversione."),
 ("Media di due numeri visualizzati", "Un convertitore registra solo il numero W=V c³. Le due registrazioni, con uguale peso, sono (V=2,c=2) e (V=4,c=4). Qual è la media aritmetica dei numeri W? Si media il registro numerico, non il volume fisico: le unità di uscita delle due conversioni sono diverse.", ["81", "128", "136", "256", "272"],
  "Nella prima registrazione W vale 2·8=16; nella seconda vale 4·64=256. Facciamo la media soltanto dopo avere ottenuto i due numeri. Per il calcolo mentale è comodo dividere ciascun addendo per due prima di sommarli.", r"\overline W=\frac{16+256}{2}=\frac{16}{2}+\frac{256}{2}=8+128=136",
  "Usare le medie V=3,c=3 nella formula produrrebbe 81, non la media richiesta. Il cambiamento di unità impedisce inoltre di interpretare questa media di indicazioni come una media di volumi senza prima fissare un’unità comune."),
 ("Compensazione in tre direzioni", "W=V c³. V raddoppia da 2 a 4 e si vuole che W cresca di un fattore 16. Quale rapporto positivo c₂/c₁ occorre?", 2,
  "Il cambiamento di V produce già un fattore due. Dividiamo l’aumento richiesto per questo contributo: 16/2=8. Il cubo del rapporto fra i fattori lineari deve quindi essere otto.", r"16=2\left(\frac{c_2}{c_1}\right)^3\quad\Rightarrow\quad\left(\frac{c_2}{c_1}\right)^3=8\quad\Rightarrow\quad\frac{c_2}{c_1}=2",
  "Il controllo è immediato: 2·2³=16. Il vincolo di positività esclude scale nulle o negative e la funzione cubica dà una sola soluzione positiva."),
 ("Taratura di un convertitore cubico", "Un convertitore usa W=V c³; il display indica S=aW, con a>0 costante e offset nullo. Il riferimento V=2,c=2 dà S=48. La nuova prova ha c=4 e S=768. Quanto vale V? Le letture S usano la stessa unità strumentale.", 4,
  "Nel riferimento W=2·8=16, perciò il fattore del display è a=48/16=3. La lettura nuova corrisponde a W=768/3=256. Per trovare V dividiamo ora per c³=64.", r"a=3,\qquad W=\frac{768}{3}=256,\qquad V=\frac{256}{4^3}=\frac{256}{64}=4",
  "La divisione per tre si può fare come (600+168)/3=200+56. Il controllo completo ricompone 3·(4·64)=768. La taratura deve essere rimossa prima di interpretare l’indicazione come numero di unità cubiche."),
 ("Due riferimenti per il volume", "Un convertitore usa W=V c³ e un display usa S=aW+b. I riferimenti sono (V=2,c=2,S=33) e (V=4,c=4,S=513). Nella prova ignota c=2 e S=65. I coefficienti a,b sono costanti. Quanto vale V?", ["2", "3", "4", "8", "16"],
  "I numeri convertiti dei riferimenti sono 16 e 256. Sottraendo le letture eliminiamo l’offset: 513−33=480 e 256−16=240. Il guadagno è quindi a=480/240=2. Dal primo riferimento b=33−2·16=1.", r"W=\frac{65-1}{2}=32,\qquad V=\frac{32}{2^3}=\frac{32}{8}=4",
  "Rimettendo V nella catena troviamo W=4·8=32 e S=2·32+1=65. Usare 65/33 come rapporto fra volumi lascerebbe dentro l’offset e darebbe una taratura errata."),
 ("Il vincolo porta alla quarta potenza", "I valori numerici positivi V e c soddisfano V=c. La legge del convertitore è W=V c³ e si misura W=16. Quanto vale c?", ["−2", "1", "2", "4", "16"],
  "Il vincolo permette di sostituire V con c. La legge diventa W=c·c³=c⁴. Il numero positivo due soddisfa l’equazione perché 2²=4 e 4²=16. La quarta potenza ha anche una radice negativa, ma una scala lineare di unità non può essere negativa.", r"16=c^4,\qquad 2^4=(2^2)^2=4^2=16\quad\Rightarrow\quad c=2\;(c>0)",
  "La funzione c⁴ è strettamente crescente sul dominio positivo, quindi il valore è unico. Da V=2 otteniamo W=2·2³=16. Senza il vincolo V=c l’uscita da sola non determinerebbe entrambi gli ingressi.")
]

# Correct authored choice indices, independent of the upstream answer letters.
AREA_CHOICES = {2: 2, 3: 2, 4: 0, 7: 2, 8: 3, 9: 2, 10: 2, 12: 2, 15: 2, 16: 2}
VOLUME_CHOICES = {2: 2, 3: 2, 4: 0, 7: 2, 8: 4, 9: 1, 10: 2, 12: 2, 15: 2, 16: 2}


def assemble(repo, source_ref):
    path = "packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json"
    originals = {r["id"]: r for r in json.loads(git_bytes(repo, source_ref, path))}
    assets = {}
    for name in ("area", "volume"):
        file = Path(__file__).resolve().parents[2] / "editorial/assets" / ("corpus-" + name + "-units.svg")
        raw = file.read_bytes()
        assets[name] = {"id": sha(raw), "name": file.name, "mime": "image/svg+xml", "data": base64.b64encode(raw).decode()}
    records, bindings = [], []
    for kind, tasks, choices in (("area", AREA, AREA_CHOICES), ("volume", VOLUME, VOLUME_CHOICES)):
        for number, (title, prompt, answer, before, law, after) in enumerate(tasks, 1):
            source_id = f"u1-{kind}-conversion-{number:02}"
            key = "AR-" + source_id
            if isinstance(answer, list):
                value = answer[choices[number]]
                target_answer = {"type": "choice", "options": answer, "value": value}
            else:
                target_answer = {"type": "numeric", "value": answer, "unit": "1", "tolerance": 0}
            family = "units-" + kind
            if number == 8: family = "mass-concentration-si" if kind == "area" else "litre-cubic-decimetre"
            if kind == "volume" and number == 3: family = "intensive-extensive"
            row = {"id": key, "kind": "question", "course": "C1", "section": "Misura e rappresentazione",
                   "order": 2000 + len(records), "title": title, "version": 1, "baseVersion": 0,
                   "skill": "C1-L001", "prerequisites": ["C1-L001"], "reuse": ["C6"],
                   "family": family, "difficulty": 1 if number <= 4 else 2 if number <= 12 else 3,
                   "prompt": prompt, "answer": target_answer, "blocks": [text(before), *law_steps(law), text(after)],
                   "hints": [before.split(". ")[0] + ".", "Riprendi la relazione e lascia sola l’incognita prima dei numeri."],
                   "error": {"category": "unità", "message": after, "target": "C1-L001"},
                   "coverage": ["Unità e conversioni", "Potenze e rapporti"],
                   "review": "Revisione AI con evidenze individuali; approvazione umana NOT_RUN; DRAFT"}
            if number in (1, 3) and not (kind == "volume" and number == 3):
                row["blocks"].insert(1, {"type": "figure", "src": "/asset/" + assets[kind]["id"],
                    "text": "Leggi le tre tappe dall’alto verso il basso. " + ("Ogni vecchia casella contiene 2 righe per 2 colonne; due caselle contengono 8 nuove unità di area." if kind == "area" else "Ogni vecchio cubo ha 2 strati da 4 cubetti; due cubi contengono 16 nuove unità di volume.")})
            records.append(row)
            asset_checksums = {assets[kind]["name"]: assets[kind]["id"]} if any(b["type"] == "figure" for b in row["blocks"]) else {}
            bindings.append({"id": key, "sourceId": source_id, "sourceSha256": digest(originals[source_id]),
                             "candidateSha256": digest(row), "assetChecksums": asset_checksums, "sourceRef": source_ref})
    return {"schema": "astra/1", "records": records, "assets": list(assets.values())}, bindings


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--source-ref", required=True)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    package, bindings = assemble(args.repo, args.source_ref)
    args.destination.mkdir(parents=True, exist_ok=True)
    (args.destination / "units-001.json").write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n")
    (args.destination / "units-001-bindings.json").write_text(canonical(bindings) + "\n")
    print(canonical({"questions": len(package["records"]), "status": "DRAFT", "humanApproval": "NOT_RUN"}))
