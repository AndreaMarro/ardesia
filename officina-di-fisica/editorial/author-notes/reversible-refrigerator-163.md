# reversible-refrigerator-163 — note dell’autore

Fonte Git 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U5-02.json; SHA256 del file sorgente 66ade7951eecbdbea93c529a628b01c2e8bf393959f757a2cf82aeb03cabb95c. Letti individualmente tutti gli 80 prompt e le ipotesi assegnate 163–167 prima della scrittura. Rilette le lezioni reali C3-L01, L02, L03, L06, L07, L08 e L09. Si usa il solo assemble_family esistente, course C3, unit u5.

DRAFT. Revisione scientifica indipendente NOT_RUN. Approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per la futura revisione distinta: non contengono firme scientifiche o approvazioni.

Sono mantenuti i parametri numerici dei quesiti sorgente. I trasferimenti Q e W sono distinti dalle funzioni di stato. Le convenzioni di segno e le unità sono esplicite nei prompt; i confronti riguardano prove separate. Capacità totale, capacità molare e calore specifico sono distinti quando presenti. Il vincolo fra parametri della prova16 riguarda preparazioni diverse e non introduce una legge variabile lungo il processo.

SVG letto integralmente in XML e rendering nativo; scale e posizioni delle etichette controllate dall’autore. Formula steps separati usando law_steps. Due assembly confrontati, legami source/candidate/provenance riletti e import canonico in SQLite temporaneo, senza pubblicazione. Le anteprime usano browser-batches, helper di resume e browser-drafts canonici immutati in uno snapshot privato del runtime integratore, con package d’autore e un piccolo registro privato che dichiara esattamente i loro ID. Report e completion sono copiati byte per byte solo dopo il vero exit0; il marker non viene costruito da report precedenti. Tali controlli sono tecnici e non costituiscono revisione scientifica indipendente.

## 01 — Il calore utile viene dalla sorgente fredda

La reversibilità impone Q_h/Q_c=T_h/T_c=2. Se si prelevano venti joule dalla sorgente fredda, se ne devono cedere quaranta alla calda e occorrono venti joule di lavoro. Il rapporto utile è quindi uno. Anche direttamente, la differenza delle temperature è duecento kelvin e coincide con il numeratore.

Passaggi: `Q_h/Q_c=T_h/T_c\qquad W_{\rm in}=Q_h-Q_c\qquad C=\frac{T_c}{T_h-T_c}\qquad C=\frac{200}{400-200}=1`

Errori e controllo: Due è qui il coefficiente della pompa di calore Q_h/W_in, che conta anche il lavoro entrato. Un mezzo sarebbe il rendimento del motore reversibile fra queste temperature, un dispositivo con uno scopo diverso. C non misura una frazione di energia trasformata in lavoro.

## 02 — Due energie nello stesso rapporto

Q_c e W_in sono entrambi energie, misurate nella stessa unità. I joule si cancellano. La forma termica conferma il risultato: al numeratore e al denominatore vi sono kelvin. Un numero puro può essere maggiore di uno perché si trasferisce calore usando lavoro, non si converte in lavoro tutto quel calore.

Passaggi: `[C]=\frac{\mathrm J}{\mathrm J}=1\qquad [C]=\frac{\mathrm K}{\mathrm K}=1`

Errori e controllo: J misura un singolo trasferimento energetico; K una temperatura. J/K sarebbe una capacità termica, W un trasferimento per unità di tempo. Nessuna di queste unità rimane nel quoziente richiesto.

## 03 — Bilancio del ciclo e reversibilità

Sul ciclo la variazione di energia interna è nulla. Il lavoro ricevuto copre la differenza fra calore scaricato e calore sottratto alla sorgente fredda. Dividendo il bilancio per Q_c e usando il rapporto reversibile dei calori otteniamo l’inverso di T_h/T_c−1, ossia T_c/(T_h−T_c). Le temperature sono assolute: i loro rapporti non si calcolano in gradi Celsius.

Passaggi: `W_{\rm in}=Q_h-Q_c\qquad \frac{W_{\rm in}}{Q_c}=\frac{T_h}{T_c}-1\qquad C=\frac{T_c}{T_h-T_c}`

Errori e controllo: T_h al numeratore riguarda la pompa di calore; 1−T_c/T_h è il rendimento del motore. Il quoziente (T_h−T_c)/T_c è il lavoro necessario per unità di calore freddo, cioè 1/C. T_c/T_h confronta i calori, senza sottrarre il lavoro.

## 04 — Una sorgente calda più calda

La temperatura fredda è invariata, mentre il salto da superare passa da duecento a trecento kelvin. A parità di calore prelevato serve più lavoro, perciò il coefficiente diminuisce. Duecento su trecento si riduce a due terzi, senza approssimazioni.

Passaggi: `C_A=\frac{200}{400-200}=1\qquad C_B=\frac{200}{500-200}\qquad C_B=\frac23`

Errori e controllo: Tre mezzi inverte il coefficiente B; cinque quarti confronta soltanto le temperature calde e ignora la differenza al denominatore. Il coefficiente resta positivo perché T_h>T_c.

## 05 — Ricostruire la temperatura calda

Un coefficiente pari a uno richiede che il salto termico sia uguale alla temperatura fredda. A duecento kelvin di salto aggiungiamo i duecento kelvin della sorgente fredda: la calda è a quattrocento kelvin. La temperatura ottenuta è maggiore di T_c, come deve essere.

Passaggi: `T_h-T_c=\frac{T_c}{C}\qquad T_h=T_c+\frac{T_c}{C}\qquad T_h=(200+200)\,\mathrm K\qquad T_h=400\,\mathrm K`

Errori e controllo: Duecento K annullerebbe il salto e non darebbe C=1. Sottrarre il salto darebbe zero, fuori dominio; il reciproco di C non sostituisce una temperatura.

## 06 — Ricostruire la temperatura fredda

L’incognita compare sia al numeratore sia nella differenza. Moltiplichiamo per il denominatore e riuniamo i termini contenenti T_c. Con C=1, quattrocento è due volte la temperatura fredda; segue duecento kelvin. Il risultato soddisfa entrambi i vincoli di positività e ordinamento.

Passaggi: `C(T_h-T_c)=T_c\qquad CT_h=(1+C)T_c\qquad T_c=\frac{CT_h}{1+C}\qquad T_c=200\,\mathrm K`

Errori e controllo: Usare T_h/C darebbe quattrocento K e salto nullo. Dividere per 1−C sarebbe qui impossibile e deriva dal portare il termine nel membro sbagliato.

## 07 — Avvicinare la sorgente fredda alla calda

A ha coefficiente uno. In B il numeratore cresce a trecento e il salto si riduce a cento: il coefficiente diventa tre. Agiscono insieme sia il cambiamento del numeratore sia quello del denominatore; il rapporto finale è tre.

Passaggi: `C_A=1\qquad C_B=\frac{300}{400-300}=3\qquad C_B/C_A=3`

Errori e controllo: Tre mezzi considera soltanto il numeratore; due considera soltanto la riduzione del salto. Un terzo scambia B e A, uno ignora entrambi i cambiamenti.

## 08 — Lo scarto della proposta due

La legge frigorifera restituisce uno. Due supera questo valore di una unità, quindi lo scarto richiesto è positivo. La proposta corrisponderebbe al coefficiente della pompa di calore, non a quello frigorifero definito nel quesito.

Passaggi: `C=1\qquad e=C_{\rm proposto}-C\qquad e=2-1=1`

Errori e controllo: Meno uno scambia l’ordine della sottrazione; due ripete la proposta. Zero tratterebbe la proposta come corretta e un mezzo richiama il rendimento del motore anziché lo scarto.

## 09 — L’inversa mantiene la differenza termica

Moltiplichiamo la definizione per T_h−T_c, dividiamo per C>0 e infine aggiungiamo T_c. Il fattore fra parentesi è maggiore di uno, quindi l’inversa produce automaticamente una temperatura calda maggiore di quella fredda. Per C=1 il fattore è due.

Passaggi: `C(T_h-T_c)=T_c\qquad T_h-T_c=T_c/C\qquad T_h=T_c(1+1/C)`

Errori e controllo: T_c/C restituisce il solo salto. Il segno meno abbassa T_h rispetto a T_c e viola l’ordine termico. C T_c e T_c/(1+C) non ricostruiscono la legge: con C=1 darebbero rispettivamente T_c e T_c/2.

## 10 — Due riscalamenti, un dominio da conservare

La differenza delle temperature di B deve essere costruita prima di dividere. Formiamo C_B e lo moltiplichiamo per l’inverso di C_A; T_c si cancella lasciando κ₂ al numeratore. Se i due fattori sono uguali, si cancellano anche nel salto e il rapporto è uno: una scala termica comune non cambia il coefficiente.

Passaggi: `C_A=\frac{T_c}{T_h-T_c}\qquad C_B=\frac{\kappa_2T_c}{\kappa_1T_h-\kappa_2T_c}\qquad \frac{C_B}{C_A}=\frac{\kappa_2(T_h-T_c)}{\kappa_1T_h-\kappa_2T_c}`

Errori e controllo: κ₂/κ₁ trascura che il denominatore è una differenza, non T_h da solo. Il rapporto dei soli salti omette il numeratore e ha il verso sbagliato. κ₁κ₂ fallisce anche per un riscalamento comune diverso da uno.

## 11 — Cambiano entrambe le sorgenti

Entrambi i salti sono duecento kelvin. Il coefficiente di A è uno e quello di B è trecento su duecento, cioè tre mezzi. Qui il salto comune consente di confrontare direttamente le temperature fredde; è una proprietà di questi dati, non una regola per due prove qualsiasi.

Passaggi: `C_A=200/200=1\qquad C_B=300/200=3/2\qquad C_B/C_A=3/2`

Errori e controllo: Due terzi inverte il confronto. Cinque quarti confronta le temperature calde anziché i coefficienti, uno guarda soltanto i salti comuni e cinque mezzi usa T_h,B al numeratore.

## 12 — Media di due coefficienti misurati

Le letture sono uno e tre mezzi. Sommiamo ottenendo cinque mezzi e dividiamo ancora per due: cinque quarti. Le temperature medie sarebbero 450 K e 250 K; qui danno lo stesso risultato perché le due prove hanno uguale salto termico. Non è una proprietà generale: fra 400/200 K e 400/300 K la media dei coefficienti è due, mentre gli ingressi medi danno cinque terzi.

Passaggi: `\overline C=\frac{1+3/2}{2}\qquad \overline C=\frac54\qquad \frac{250}{450-250}=\frac54`

Errori e controllo: Cinque mezzi è la somma, tre quarti dimezza solo la seconda lettura. Uno e tre mezzi ripetono un singolo riferimento, senza dare peso uguale a entrambi. La coincidenza con gli ingressi medi va motivata, non generalizzata.

## 13 — La sorgente fredda per un bersaglio

Il riferimento dà C_A=1, quindi il bersaglio è tre mezzi. Nell’inversa per la temperatura fredda, (3/2) volte 500 K si divide per 5/2 e restituisce 300 K. Questa temperatura è positiva e inferiore ai 500 K della sorgente calda; rispetto ai 200 K iniziali il rapporto è tre mezzi.

Passaggi: `C_B=3/2\qquad T_{c,B}=\frac{C_BT_{h,B}}{1+C_B}\qquad T_{c,B}=300\,\mathrm K\qquad T_{c,B}/T_{c,A}=3/2`

Errori e controllo: Scalare direttamente T_c senza controllare il nuovo salto non costituisce un’inversa. Il rapporto qui coincide con quello dei coefficienti soltanto perché l’inversa porta di nuovo a un salto di 200 K. Due terzi scambia i riferimenti.

## 14 — Una taratura senza offset

Nel riferimento C_A=1: la lettura tre fissa q=3, adimensionale. Dividendo nove mezzi per tre ricaviamo C_B=3/2. Il salto è T_c/C=200 K; sommato ai 300 K della sorgente fredda dà 500 K. La lettura del display non va inserita direttamente come coefficiente fisico.

Passaggi: `C_A=1\qquad q=3\qquad C_B=\frac{9/2}{3}=3/2\qquad T_{h,B}=T_{c,B}(1+1/C_B)\qquad T_{h,B}=500\,\mathrm K`

Errori e controllo: Usare C=9/2 trascurerebbe la taratura e darebbe 1100/3 K. Restituire 200 K significherebbe fermarsi al salto e violerebbe T_h>T_c.

## 15 — Guadagno e offset del display

I riferimenti hanno coefficienti uno e tre mezzi. La differenza delle letture è uno e quella dei coefficienti è un mezzo, dunque q=2; da A segue b=1. Tolto l’offset alla lettura di C, quattro terzi diviso due dà due terzi. Il salto è 200/(2/3)=300 K e la temperatura calda è 500 K.

Passaggi: `q=\frac{4-3}{3/2-1}=2\qquad b=1\qquad C_C=\frac{7/3-1}{2}=2/3\qquad T_{h,C}=200(1+3/2)\,\mathrm K\qquad T_{h,C}=500\,\mathrm K`

Errori e controllo: 400 K produrrebbero C=1 e S=3; 300 K darebbero C=2 e S=5. A 450 K si avrebbe C=4/5 e S=13/5. 200 K annulla il salto e non è ammesso. Queste sostituzioni controllano l’inversa senza approssimare.

## 16 — Un rapporto non fissa la scala assoluta

Il vincolo sostituito nella legge cancella completamente T_c: il coefficiente diventa uno per ogni temperatura fredda positiva. Le due informazioni sono quindi ridondanti e non fissano una scala termica assoluta. Le coppie 400/200 K e 600/300 K, per esempio, rispettano entrambe i dati. Occorre un’ulteriore misura indipendente di una temperatura o di un salto.

Passaggi: `T_h=2T_c\qquad C=\frac{T_c}{2T_c-T_c}\qquad C=1\quad(T_c>0)`

Errori e controllo: Le coppie numeriche proposte sono esempi leciti ma non uniche. Scambiare le sorgenti renderebbe T_h<T_c e violerebbe il dominio. Nessuna coppia non è corretto, perché ogni scala positiva costruisce una soluzione.
