# snell-refracted-sine-257 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json`, SHA `43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7`. Tutti gli 80 prompt B255–259 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B255–259 commit d0628ef6, SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4, ricevuta solo come hash/percorso e mai aperta; B per A250–254 commit 7518f76e, SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L08 nuclei e transizioni, L09 rifrazione e angolo limite (prereq L06), L10 lenti (prereq L09), tutti letti integralmente.

Riferimenti primari consultati per le leggi: [OpenStax, trasformazioni nucleari](https://openstax.org/books/university-physics-volume-3/pages/10-key-equations), [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello didattico, non una prescrizione clinica o una garanzia di realizzabilità di catene nucleari.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello1 entrambi raggi lunghi160: seno incidente80/160=1/2, trasmesso40/160=1/4; vettori verticali80√3 e40√15. Lastra pannello2 altezza150, spostamento interno300/√21: seno interno2/5; esterni dx90,dy120, seno3/5. Barre pannello3 scala640 per seno, larghezze160/320/240. Nessuna indicazione di coordinate intrinseche nei testi studente.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-snell-refracted-sine-01 — Il seno oltre l’interfaccia

Ipotesi e percorso manuale d’autore: La legge di Snell conserva n sinθ fra i due mezzi. Sul lato aria il fattore di indice è uno; sul lato di arrivo è due. Divido quindi un mezzo per due e ottengo un quarto. È il seno esatto: non serve cercare un angolo decimale con una calcolatrice.

Passaggi: 1\,s_i=ns_r;  s_r=\frac{s_i}{n};  s_r=\frac{1/2}{2};  s_r=\frac14

Risposta proposta: 1/4.

Distrattori: Uno moltiplica per n invece di dividere, un mezzo ignora la rifrazione. Due non è un seno reale e il ramo negativo non appartiene agli angoli fra zero e 90° dichiarati.

## AR-u7-snell-refracted-sine-02 — Il seno non si misura in gradi

Ipotesi e percorso manuale d’autore: Il seno è un rapporto fra lunghezze nel triangolo di una direzione e dunque un numero puro. L’angolo di cui si prende il seno può essere espresso in gradi o radianti, ma il seno non eredita quelle indicazioni di angolo.

Passaggi: s_r=\sin\theta_r;  [s_r]=1

Risposta proposta: 1, adimensionale.

Distrattori: Gradi e radianti esprimono l’angolo, non il valore della sua funzione seno. Metri e inversi di metro descriverebbero altre grandezze ottiche come lunghezze o numeri d’onda.

## AR-u7-snell-refracted-sine-03 — La relazione prima dei numeri

Ipotesi e percorso manuale d’autore: Parto da s_i=n s_r, perché l’indice di partenza è uno. Dividendo per n positivo trovo s_r=s_i/n. Il dominio garantisce un seno fisico non maggiore di uno e, per n>1, non maggiore di quello incidente.

Passaggi: s_i=ns_r;  s_r=\frac{s_i}{n};  0<s_r\leq1

Risposta proposta: s_r = s_i / n.

Distrattori: Il prodotto n s_i può superare uno per dati ammessi; n/s_i può farlo ancora più facilmente. La differenza darebbe un seno non positivo nel dominio e il quadrato dell’indice non compare nella legge di Snell.

## AR-u7-snell-refracted-sine-04 — Un’incidenza diversa sullo stesso mezzo

Ipotesi e percorso manuale d’autore: Con lo stesso mezzo divido entrambi i seni incidenti per due. Il seno trasmesso passa da un quarto a tre ottavi, aumentando di un fattore 3/2. Questo rapporto vale per i seni; non autorizza a moltiplicare gli angoli stessi per 3/2.

Passaggi: s_{r,A}=\frac14;  s_{r,B}=\frac{3/4}{2};  s_{r,B}=\frac38;  s_{r,B}/s_{r,A}=\frac32

Risposta proposta: Da 1/4 a 3/8.

Distrattori: Un sesto seguirebbe una falsa dipendenza inversa da s_i. Tre mezzi non è un seno ammissibile; il valore invariato ignora l’incidenza e 9/16 eleva al quadrato il dato nuovo senza legge fisica.

## AR-u7-snell-refracted-sine-05 — Risalire al seno incidente

Ipotesi e percorso manuale d’autore: Moltiplico il seno rifratto per l’indice del mezzo di arrivo. Due volte un quarto vale un mezzo. L’inversa deve anche soddisfare n s_r≤1, altrimenti non descriverebbe un raggio incidente reale dall’aria.

Passaggi: s_i=ns_r;  s_i=2\cdot\frac14;  s_i=\frac12

Risposta proposta: 1/2.

Distrattori: Un ottavo dividerebbe ancora per n. Due supera il massimo del seno, un quarto omette il fattore e il valore negativo viola il ramo degli angoli dichiarato.

## AR-u7-snell-refracted-sine-06 — Due facce parallele, due rifrazioni

Ipotesi e percorso manuale d’autore: Alla prima faccia Snell dà seno interno due quinti. Le due normali sono parallele, quindi quello stesso angolo interno è l’incidenza sulla seconda faccia. Tornando in aria moltiplico due quinti per 3/2 e recupero tre quinti. Il raggio emergente è parallelo all’incidente, pur essendo spostato lateralmente. Il seno interno 2/5 è sotto il limite 2/3 per l’uscita.

Passaggi: \sin\theta_{\rm int}=\frac{3/5}{3/2};  \sin\theta_{\rm int}=\frac25;  \sin\theta_{\rm out}=\frac32\,\frac25;  \sin\theta_{\rm out}=\frac35

Risposta proposta: 3/5.

Distrattori: Due quinti si ferma dentro la lastra dopo la prima faccia.9/10 moltiplica direttamente il seno esterno per l’indice senza la prima divisione; uno e zero non ricostruiscono il raggio incidente assegnato.

## AR-u7-snell-refracted-sine-07 — Un indice più piccolo all’arrivo

Ipotesi e percorso manuale d’autore: I seni trasmessi sono un quarto e un terzo. Il rapporto B/A è(1/3)/(1/4)=4/3: diminuendo l’indice di arrivo il raggio si allontana dalla normale rispetto alla prova A, restando ancora più vicino alla normale del raggio in aria.

Passaggi: s_{r,A}=\frac14;  s_{r,B}=\frac{1/2}{3/2};  s_{r,B}=\frac13;  R=\frac43

Risposta proposta: 4/3.

Distrattori: Tre quarti segue il rapporto degli indici invece del suo inverso. Un terzo e un quarto sono le singole uscite, mentre uno ignora il cambiamento di mezzo.

## AR-u7-snell-refracted-sine-08 — Scarto di un seno sovrastimato

Ipotesi e percorso manuale d’autore: Il seno corretto è un quarto. Il proposto un mezzo gli toglie soltanto un quarto quando si fa la differenza richiesta: lo scarto è+1/4. Tutti i termini sono puri; non si sottraggono direttamente gli angoli.

Passaggi: s_r=\frac14;  \delta s=\frac12-\frac14;  \delta s=\frac14

Risposta proposta: 1/4.

Distrattori: −1/4 inverte l’ordine e un mezzo copia la proposta. Due è il rapporto proposta/corretto, zero ignora la necessaria divisione per l’indice due.

## AR-u7-snell-refracted-sine-09 — L’inversa con il limite fisico

Ipotesi e percorso manuale d’autore: La forma s_i=n s_r è già Snell riordinata per questo verso di passaggio. Per un’inversa fisica occorre 0<n s_r≤1; la sola positività non basta. Con n≥1 essa implica anche s_r≤1/n.

Passaggi: s_i=ns_r;  0<ns_r\leq1;  s_r\leq\frac1n

Risposta proposta: s_i = n s_r.

Distrattori: La divisione applicherebbe una seconda volta la trasformazione in avanti. Il reciproco e il quadrato dell’indice non soddisfano Snell in generale; la differenza è non positiva per s_r≤1,n≥1.

## AR-u7-snell-refracted-sine-10 — Variare incidenza e indice

Ipotesi e percorso manuale d’autore: La variazione del numeratore entra direttamente e quella del denominatore inversamente. Sostituisco i due fattori e divido per s_i,A/n_A, che è positivo. Rimane κ₁/κ₂; vanno comunque mantenuti il limiteκ₁s_i,A≤1 e l’indiceκ₂n_A≥1.

Passaggi: s_{r,B}=\frac{\kappa_1s_i}{\kappa_2n};  R=\frac{\kappa_1}{\kappa_2}

Risposta proposta: κ₁ / κ₂.

Distrattori: Il prodotto rende diretto anche l’indice, il rapporto inverso scambia i due ruoli e il quadrato di κ₁ non compare. La somma darebbe due se entrambi i fattori fossero uno.

## AR-u7-snell-refracted-sine-11 — Cambiano entrambi i dati

Ipotesi e percorso manuale d’autore: A trasmette con seno un quarto; B con seno(3/4)/(3/2)=un mezzo. Il rapporto delle uscite è due. Il fattore incidente 3/2 e quello inverso dell’indice 4/3 si combinano proprio in due.

Passaggi: s_{r,A}=\frac14;  s_{r,B}=\frac12;  R=\frac{1/2}{1/4};  R=2

Risposta proposta: 2.

Distrattori: Un mezzo inverte il confronto,3/2 considera soltanto l’incidenza e 4/3 soltanto l’indice. Tre quarti è la somma dei due seni, non il loro rapporto.

## AR-u7-snell-refracted-sine-12 — Mediare due seni trasmessi

Ipotesi e percorso manuale d’autore: La media delle uscite un quarto e un mezzo vale tre ottavi. I dati medi s_i=5/8,n=7/4 darebbero invece 5/14, minore di 3/8 di 1/56. Il seno dell’angolo medio non è neppure definito da questa richiesta: si mediano direttamente i seni osservati.

Passaggi: \overline s_r=\frac{1/4+1/2}{2};  \overline s_r=\frac38;  s_{r,\rm dati\ medi}=\frac{5/8}{7/4};  s_{r,\rm dati\ medi}=\frac5{14}

Risposta proposta: 3/8.

Distrattori: 5/14 usa le medie degli ingressi;3/4 somma senza dimezzare. Un quarto e un mezzo conservano una sola lettura. La non linearità nel denominatore impedisce la sostituzione indiscriminata delle medie.

## AR-u7-snell-refracted-sine-13 — L’indice richiesto dal nuovo seno

Ipotesi e percorso manuale d’autore: Il bersaglio è s_r,B=un mezzo. Dall’inversa n_B=s_i,B/s_r,B ricavo(3/4)/(1/2)=3/2. Divido per l’indice A pari a due e ottengo tre quarti, mantenendo n_B≥1.

Passaggi: s_{r,B}=\frac12;  n_B=\frac{3/4}{1/2};  n_B=\frac32;  n_B/n_A=\frac34

Risposta proposta: 3/4.

Distrattori: 4/3 inverte il confronto; due copia il fattore dell’uscita,3/2 il nuovo indice senza dividerlo per quello iniziale. Uno darebbe s_r,B=3/8, non un mezzo.

## AR-u7-snell-refracted-sine-14 — Un display del seno

Ipotesi e percorso manuale d’autore: Il riferimento ha s_r=un quarto: il guadagno è tre. La nuova lettura 3/2 divisa per tre dà seno rifratto un mezzo; moltiplicando per l’indice 3/2 ricavo seno incidente 3/4. Il controllo del limite uno è soddisfatto.

Passaggi: g=\frac{3/4}{1/4};  g=3;  s_r=\frac{3/2}{3};  s_r=\frac12;  s_i=\frac34

Risposta proposta: 3/4.

Distrattori: 9/4 moltiplicherebbe direttamente il display per n e sarebbe impossibile come seno. Un mezzo è solo s_r, un quarto il riferimento; uno non riproduce la lettura del display.

## AR-u7-snell-refracted-sine-15 — Offset prima di Snell

Ipotesi e percorso manuale d’autore: I seni di riferimento sono un quarto e un mezzo. La differenza del display è un mezzo, quella fisica un quarto: g=2 e b=1. Per C sottraggo uno da 7/4 e divido per due: s_r=3/8. Con indice due il seno incidente è 3/4.

Passaggi: g=\frac{2-3/2}{1/2-1/4};  g=2;  b=1;  s_{r,C}=\frac{7/4-1}{2};  s_{r,C}=\frac38;  s_{i,C}=\frac34

Risposta proposta: 3/4.

Distrattori: 7/4 ometterebbe l’offset e porterebbe fuori dall’intervallo dei seni.3/8 si ferma al valore rifratto, un mezzo ripete una vecchia incidenza e uno produrrebbe un display diverso.

## AR-u7-snell-refracted-sine-16 — Il vincolo non fissa l’indice

Ipotesi e percorso manuale d’autore: Sostituendo s_i=n/4 in Snell ottengo s_r=(n/4)/n=1/4: la misura ripete il vincolo e non fissa la scala. Il dominio però restringe n: da n≥1 e s_i≤1 segue 1≤n≤4. Per esempio(1/4,1) e(1/2,2) sono due coppie distinte; l’intervallo continuo fornisce infinite soluzioni.

Passaggi: s_r=\frac{n/4}{n};  s_r=\frac14;  1\leq n\leq4;  s_i=n/4

Risposta proposta: Infinite coppie, con 1 ≤ n ≤ 4 e s_i = n/4.

Distrattori: Una o due coppie non esauriscono l’intervallo. La risposta «Nessuna coppia» è smentita dagli esempi; ammettere qualsiasi n positivo includerebbe n<1 o s_i>1, fuori dal modello.
