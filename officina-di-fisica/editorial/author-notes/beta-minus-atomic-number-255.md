# beta-minus-atomic-number-255 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json`, SHA `43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7`. Tutti gli 80 prompt B255–259 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B255–259 commit d0628ef6, SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4, ricevuta solo come hash/percorso e mai aperta; B per A250–254 commit 7518f76e, SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L08 nuclei e transizioni, L09 rifrazione e angolo limite (prereq L06), L10 lenti (prereq L09), tutti letti integralmente.

Riferimenti primari consultati per le leggi: [OpenStax, trasformazioni nucleari](https://openstax.org/books/university-physics-volume-3/pages/10-key-equations), [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello didattico, non una prescrizione clinica o una garanzia di realizzabilità di catene nucleari.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello2: n0/1/2 a x170/320/470, Z20/21/22 a y730/645/560, scala150 coordinate per passo e85 per incremento Z; frecce logiche fra punti, non interpolazione fisica. Barre pannello3: origine150, scala12 coordinate/unità Z, larghezze252/312/282 per21/26/47/2. Pannello1 schematico senza misura di distanza.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-beta-minus-atomic-number-01 — Un protone in più

Ipotesi e percorso manuale d’autore: Il numero atomico conta i protoni. La trasformazione di un neutrone aggiunge un protone al nucleo senza aggiungere nucleoni: dopo un β⁻ Z aumenta di uno e A resta invariato. Sommando un passo a venti ottengo ventuno.

Passaggi: n_{\rm nuc}\to p+e^-+\bar\nu_e;  Z_f=Z_0+n;  Z_f=20+1;  Z_f=21

Risposta proposta: 21 1.

Distrattori: Diciannove avrebbe il segno del β⁺, venti ignorerebbe il cambiamento di specie e ventiquattro attribuirebbe al β⁻ i quattro nucleoni dell’α. Quarantadue non rispetta il passo unitario.

## AR-u7-beta-minus-atomic-number-02 — Il numero atomico non è una massa

Ipotesi e percorso manuale d’autore: Z è un conteggio intero e non una massa. La carica del nucleo è invece Ze e si misura in coulomb; Z è il coefficiente puro che moltiplica la carica elementare positiva e.

Passaggi: [Z]=1;  q_{\rm nuc}=Ze

Risposta proposta: 1, numero puro.

Distrattori: kg misura massa, C la carica Ze, Bq un’attività e keV un’energia. La presenza di protoni carichi non trasforma il loro numero nell’unità di carica.

## AR-u7-beta-minus-atomic-number-03 — La trasformazione β⁻

Ipotesi e percorso manuale d’autore: Il β⁻ cambia la natura di un nucleone: il neutrone iniziale è sostituito da un protone. L’elettrone emesso non era un elettrone orbitale espulso. La carica si conserva perché al protone positivo si accompagna un elettrone negativo; l’antineutrino completa il processo debole.

Passaggi: n_{\rm nuc}\to p+e^-+\bar\nu_e;  \Delta A=0;  \Delta Z=+1

Risposta proposta: Un neutrone diventa protone ed emette elettrone e antineutrino elettronico.

Distrattori: La trasformazione con positrone è β⁺; la particella con quattro nucleoni è α. Un salto orbitale appartiene all’atomo e non descrive questo mutamento nucleare. L’ultima descrizione non conserva il bilancio di un β⁻.

## AR-u7-beta-minus-atomic-number-04 — Cambiare il nucleo iniziale

Ipotesi e percorso manuale d’autore: In entrambe le catene si aggiunge un solo protone. L’aumento di quattro nel numero iniziale si conserva come aumento di quattro nel numero finale: ventuno diventa venticinque. Un incremento additivo non richiede di moltiplicare l’uscita per il rapporto degli ingressi.

Passaggi: Z_{f,A}=20+1;  Z_{f,A}=21;  Z_{f,B}=24+1;  Z_{f,B}=25

Risposta proposta: Da 21 a 25.

Distrattori: Ventiquattro copia Z₀,B senza il passo β⁻; ventinove aggiunge cinque invece di uno. La risposta invariata ignora il nuovo nucleo e 105/4 non è neppure un conteggio intero.

## AR-u7-beta-minus-atomic-number-05 — Risalire ai protoni iniziali

Ipotesi e percorso manuale d’autore: L’osservazione include già il protone prodotto dal decadimento. Per ricostruire il nucleo di partenza tolgo il numero di trasformazioni: ventuno meno uno vale venti. Il risultato è un intero positivo e ricostruisce il dato finale.

Passaggi: Z_0=Z_f-n;  Z_0=21-1;  Z_0=20;  20+1=21

Risposta proposta: 20 1.

Distrattori: Ventidue aggiungerebbe ancora il protone invece di rimuoverlo. Ventuno lo ignorerebbe; diciassette sottrarrebbe quattro come nel bilancio di massa di un α.

## AR-u7-beta-minus-atomic-number-06 — Quanti passi sono avvenuti?

Ipotesi e percorso manuale d’autore: La differenza dei numeri atomici conta i passi perché ciascun β⁻ aumenta Z esattamente di uno. Sottraggo venti da ventuno e ottengo un decadimento. Il controllo di interezza è parte del dominio, non una scelta di arrotondamento.

Passaggi: n=Z_f-Z_0;  n=21-20;  n=1

Risposta proposta: 1 1.

Distrattori: Meno uno avrebbe il segno opposto. Ventuno copia il valore finale e quarantuno somma i due numeri invece di contarne l’aumento. Un numero frazionario di trasformazioni non è ammesso.

## AR-u7-beta-minus-atomic-number-07 — Due passi sullo stesso nucleo iniziale

Ipotesi e percorso manuale d’autore: Un passo produce ventuno, due passi ventidue. Il rapporto è quindi ventidue ventunesimi, appena maggiore di uno. Raddoppia il numero di trasformazioni, non il numero totale di protoni finali, che comprende i venti già presenti.

Passaggi: Z_{f,A}=21;  Z_{f,B}=22;  Z_{f,B}/Z_{f,A}=\frac{22}{21}

Risposta proposta: 22/21.

Distrattori: Due confronta i soli n; 21/22 inverte B/A. Uno non vede il secondo passo e 44/21 raddoppia anche il valore finale B senza motivo.

## AR-u7-beta-minus-atomic-number-08 — Il segno dello scarto

Ipotesi e percorso manuale d’autore: Il bilancio dà ventuno. La proposta quarantadue supera il corretto di ventuno: lo scarto ordinato è positivo. Non si chiede il rapporto fra i due numeri, che sarebbe due.

Passaggi: Z_f=21;  \delta Z=42-21;  \delta Z=21

Risposta proposta: 21.

Distrattori: −21 scambia l’ordine; quarantadue ripete la proposta; due è il rapporto e zero accetta un conteggio incompatibile con il solo passo assegnato.

## AR-u7-beta-minus-atomic-number-09 — L’inversa simbolica e il dominio

Ipotesi e percorso manuale d’autore: Sottraggo n da entrambi i membri di Z_f=Z₀+n. Ottengo Z₀=Z_f−n e richiedo Z_f>n, oltre all’interezza dei conteggi. La disponibilità dei neutroni resta un’ipotesi sulla catena assegnata.

Passaggi: Z_f=Z_0+n;  Z_0=Z_f-n;  Z_f>n

Risposta proposta: Z₀ = Z_f − n.

Distrattori: La somma ripete il processo in avanti. Il quoziente non annulla una somma, n−Z_f sarebbe negativo nel dominio e il fattore quattro appartiene a un’altra trasformazione.

## AR-u7-beta-minus-atomic-number-10 — Due cambiamenti fra catene

Ipotesi e percorso manuale d’autore: Sostituisco ogni fattore nel suo addendo, poi divido per il conteggio finale iniziale positivo. Non esiste un unico prodotto di fattori per una legge che somma due contributi. Il vincolo di interezza riguarda sia κ₁Z₀ sia κ₂n.

Passaggi: Z_{f,B}=\kappa_1 Z_0+\kappa_2n;  R=\frac{\kappa_1 Z_0+\kappa_2n}{Z_0+n}

Risposta proposta: (κ₁ Z₀ + κ₂ n) / (Z₀ + n).

Distrattori: I quozienti o prodotti dei soli fattori trascurano i pesi Z₀ e n. Il segno meno farebbe diminuire Z per il β⁻; la somma κ₁+κ₂ darebbe due anche lasciando entrambi gli ingressi invariati.

## AR-u7-beta-minus-atomic-number-11 — Due conteggi cambiano insieme

Ipotesi e percorso manuale d’autore: A termina a ventuno protoni, B a ventisei. Il rapporto richiesto è 26/21; non coincide né con il rapporto dei nuclei iniziali 24/20 né con quello dei numeri di passi 2/1.

Passaggi: Z_{f,A}=20+1;  Z_{f,A}=21;  Z_{f,B}=24+2;  Z_{f,B}=26;  R=\frac{26}{21}

Risposta proposta: 26/21.

Distrattori: 21/26 inverte il confronto; 6/5 segue solo Z₀ e due solo n. Ventisei copia l’uscita B senza dividerla per quella A.

## AR-u7-beta-minus-atomic-number-12 — Una media non è un singolo nucleo

Ipotesi e percorso manuale d’autore: Le uscite sono ventuno e ventisei. La loro media aritmetica è 47/2: una statistica di due nuclei può essere semintera senza assegnare mezzo protone a un nucleo. La legge lineare darebbe formalmente lo stesso valore dagli ingressi medi Z₀=22,n=3/2, ma n=3/2 non descrive una terza catena ammissibile.

Passaggi: \overline Z_f=\frac{21+26}{2};  \overline Z_f=\frac{47}{2};  \overline n=\frac32

Risposta proposta: 47/2.

Distrattori: Quarantasette omette la divisione per due. Ventidue media soltanto Z₀, 3/2 soltanto n; ventiquattro non è la media delle due uscite. Nessun arrotondamento a un intero è richiesto per la statistica.

## AR-u7-beta-minus-atomic-number-13 — Il nuovo numero di trasformazioni

Ipotesi e percorso manuale d’autore: Il bersaglio è ventisei perché il valore A è ventuno. Tolgo i ventiquattro protoni iniziali di B: servono due trasformazioni. Divido per l’unica trasformazione di A e ottengo due; entrambi i conteggi sono interi.

Passaggi: Z_{f,B}=\frac{26}{21}\,21;  Z_{f,B}=26;  n_B=26-24;  n_B=2;  n_B/n_A=2

Risposta proposta: 2.

Distrattori: Un mezzo inverte il rapporto. 26/21 è il rapporto delle uscite, ventisei l’uscita stessa; uno porterebbe B soltanto a venticinque.

## AR-u7-beta-minus-atomic-number-14 — Un display proporzionale

Ipotesi e percorso manuale d’autore: Il riferimento ha Z_f=21, quindi il guadagno vale tre unità strumentali per unità di Z. La lettura settantotto indica Z_f=26. Tolgo i due protoni creati nei due passi e ricostruisco Z₀=24.

Passaggi: g=63/21;  g=3;  Z_f=78/3;  Z_f=26;  Z_0=26-2;  Z_0=24

Risposta proposta: 24 1.

Distrattori: Settantasei sottrarrebbe n direttamente al display ancora amplificato. Ventisei dimenticherebbe di tornare al nucleo iniziale; ventotto aggiungerebbe invece di sottrarre i due passi.

## AR-u7-beta-minus-atomic-number-15 — Separare guadagno e offset

Ipotesi e percorso manuale d’autore: I riferimenti corrispondono a Z_f=21 e 26. La differenza dei display è dieci per una differenza fisica cinque: g=2; poi b=1. Per C tolgo l’offset e divido per due, ottenendo Z_f=25; sottraendo un passo ottengo ventiquattro.

Passaggi: g=\frac{53-43}{26-21};  g=2;  b=1;  Z_{f,C}=\frac{51-1}{2};  Z_{f,C}=25;  Z_{0,C}=24

Risposta proposta: 24 1.

Distrattori: 49/2 risulterebbe omettendo b prima di sottrarre n ed è anche non intero. Cinquanta toglierebbe solo l’offset, venticinque sarebbe ancora Z_f e ventisei avrebbe il verso inverso.

## AR-u7-beta-minus-atomic-number-16 — Un vincolo fissa la scala discreta

Ipotesi e percorso manuale d’autore: Sostituisco il vincolo nel bilancio della catena: Z_f=20 n+n=21 n. La misura fissa n=1 e di conseguenza Z₀=20. Qui il dato assoluto non è ridondante: valori n=2,3,… produrrebbero uscite diverse.

Passaggi: Z_f=20n+n;  Z_f=21n;  21n=21;  n=1;  Z_0=20

Risposta proposta: 1 1.

Distrattori: Due darebbe Z_f=42. Zero non rispetta n>0 e non dà la misura; una famiglia continua di n non è ammessa per un conteggio. Il bilancio rimane distinto dalla prova che una particolare transizione sia consentita.
