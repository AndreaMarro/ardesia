# Catalogo editoriale dei banchi

Il progetto comprende 40 banchi, distribuiti tra le sette unità MUR. Dieci sono accessibili agli studenti, due per ciascun microcorso C1–C5. Ogni riga associa una domanda sperimentale al modello che la rende verificabile. Le sigle Q nelle righe si riferiscono al corso della prima lezione indicata. [Indice delle singole voci di lezione](voci.md) · [Fonti e licenze dei candidati](fonti.md)

Il pendolo è un’applicazione a piccoli angoli dell’oscillatore armonico dell’unità 4.1. Il profilo di viscosità fa già parte del capillare. Nella selezione compaiono capillarità, intensità acustica e campi elettromagnetici, espliciti nel syllabus. Per le verifiche a nodi e maglie, Kirchhoff esplicita i bilanci di carica ed energia implicati nel collegamento dei resistori. [Syllabus MUR archiviato](../sources/MUR-syllabus-fisica-2026.pdf)


## Strumenti e meccanica

| Progetto | Obiettivo MUR e modello | Lezioni · esercizi | Cosa permette di vedere il 3D | Candidati OSS · complessità | Stato |
| --- | --- | --- | --- | --- | --- |
| 01 · Vettori e componenti nello spazio | 1.3–1.4 · Prodotti, proiezioni e somma punta-coda | C1-L002 · Q011 Q013 | Ruotare assi e piano generato dai vettori | Three.js · media | Progettato |
| 02 · Moto rettilineo e grafici | 2.1 · x(t), v(t), area con segno e pendenza | C1-L003 · Q021 Q027 | Confrontare pista, sensore e grafico nel tempo | Three.js, uPlot · media | Progettato |
| 03 · Moto parabolico | 2.1 · Composizione di moto uniforme orizzontale e verticale con g costante | C1-L004 · Q032 Q034 | Seguire lo stesso punto nello spazio e nelle sue proiezioni | Three.js · media | Disponibile · LAB3D-02 |
| 04 · Piano inclinato e attrito | 1.4, 2.2 · Equilibrio normale, soglia statica e seconda legge lungo il piano | C1-L005 C1-L006 · Q050 Q052 | Distinguere peso verticale e assi solidali con la guida | Three.js · media | Disponibile · LAB3D-01 |
| 05 · Molla, lavoro ed energia elastica | 2.2–2.3 · F = −kx, U = kx²/2 e lavoro | C1-L006 C1-L008 · Q056 Q073 | Collegare deformazione, vettore di richiamo ed energia | Three.js, PhysicsSims · media | Progettato |
| 06 · Pendolo e oscillatore | 4.1 · Piccole oscillazioni, T ≈ 2π√(ℓ/g) | C5-L01 · Q001 Q005 | Confrontare arco reale e proiezione armonica | Three.js, 3ducation · media | Progettato |
| 07 · Urti e centro di massa | 2.4–2.5 · Quantità di moto, impulso e centro di massa | C1-L009 C1-L010 · Q083 Q096 | Separare traiettoria del sistema e traiettorie individuali | cannon-es, Rapier · alta | Progettato |
| 08 · Leve e bilancia dei momenti | 2.5 · Momento r × F e condizioni di equilibrio | C1-L010 · Q095 Q098 | Individuare in spazio braccio, asse e verso | Three.js, PhysicsSims · media | Progettato |

## Fluidi

| Progetto | Obiettivo MUR e modello | Lezioni · esercizi | Cosa permette di vedere il 3D | Candidati OSS · complessità | Stato |
| --- | --- | --- | --- | --- | --- |
| 09 · Pressione idrostatica | 3.1–3.2 · p = p₀ + ρgh | C2-L001 C2-L002 · Q011 Q014 | Confrontare profondità e direzione orizzontale di prese differenti | Three.js · media | Disponibile · LAB3D-03 |
| 10 · Pressa idraulica e manometro | 3.2 · Pascal, Δp e volume spostato dai pistoni | C2-L002 C2-L003 · Q016 Q021 | Seguire superfici, dislivelli e sezioni | Three.js, 3ducation · media | Progettato |
| 11 · Archimede e galleggiamento | 3.1–3.2 · Peso del fluido spostato e bilancio verticale | C2-L004 · Q033 Q035 | Vedere volume immerso e linea di galleggiamento | Three.js, 3ducation · media | Progettato |
| 12 · Continuità e reti di condotti | 3.3–3.4 · ΣρAv ai nodi e resistenze idrauliche equivalenti | C2-L005 C2-L009 · Q042 Q081 | Seguire sezioni e biforcazioni reali | Three.js, BN Lab · alta | Progettato |
| 13 · Venturi e bilancio energetico | 3.3 · Quote, pressione e velocità lungo una linea di corrente | C2-L006 · Q051 Q058 | Leggere quota dei piezometri e restringimento del lume | Three.js, BN Lab · media | Progettato |
| 14 · Poiseuille nel capillare | 3.4 · Poiseuille, profilo laminare e controllo di Reynolds | C2-L007 C2-L008 · Q071 Q076 | Vedere sia il diametro sia l’avanzamento assiale dei traccianti | Three.js · alta | Disponibile · LAB3D-04 |
| 15 · Menisco, gocce e capillarità | 3.5 · Curvatura, tensione superficiale e pressione di Laplace | C2-L010 · Q094 Q099 | Ruotare il menisco e distinguere le curvature principali | Three.js · alta | Progettato |

## Termodinamica

| Progetto | Obiettivo MUR e modello | Lezioni · esercizi | Cosa permette di vedere il 3D | Candidati OSS · complessità | Stato |
| --- | --- | --- | --- | --- | --- |
| 16 · Gas ideale e pistone | 5.1, 5.4 · pV = nRT in stati di equilibrio | C3-L02 C3-L07 · Q011 Q012 | Collegare volume della camera, altezza e punto p–V | Three.js · media | Disponibile · LAB3D-05 |
| 17 · Trasformazioni del gas | 5.4 · Isocora, isobara, isoterma, adiabatica reversibile | C3-L07 · Q061 Q066 | Collegare i vincoli reali del pistone al percorso termodinamico | Three.js, uPlot · alta | Progettato |
| 18 · Primo principio e lavoro | 5.4 · ΔU = Q − W e lavoro di espansione | C3-L06 · Q051 Q056 | Seguire il confine mobile e gli scambi attraverso di esso | Three.js · media | Progettato |
| 19 · Calorimetria e capacità termiche | 5.2 · Bilancio ΣQ = 0, capacità dei campioni e del recipiente | C3-L03 · Q021 Q029 | Distinguere sistema, ambiente, campioni e termometro | Three.js, 3ducation · media | Progettato |
| 20 · Passaggi di fase | 5.2 · Tratti mcΔT e mL con frazione di fase | C3-L04 · Q031 Q035 | Collegare le regioni di fase al plateau della temperatura | Three.js · media | Progettato |
| 21 · Conduzione del calore | 5.3 · Fourier in regime stazionario, profilo lineare | C3-L05 · Q042 Q044 | Cambiare separatamente distanza tra le facce e area trasversale | Three.js · media | Disponibile · LAB3D-06 |
| 22 · Macchine termiche e cicli | 5.4–5.5 · Bilanci sul ciclo, rendimento, serbatoi | C3-L08 C3-L09 · Q071 Q081 | Distinguere calore entrante, uscente e moto del pistone | Three.js, uPlot · alta | Progettato |

## Elettricità e magnetismo

| Progetto | Obiettivo MUR e modello | Lezioni · esercizi | Cosa permette di vedere il 3D | Candidati OSS · complessità | Stato |
| --- | --- | --- | --- | --- | --- |
| 23 · Coulomb e forza di prova | 6.1 · Forze di coppia e accelerazione della carica di prova | C4-L01 C4-L02 · Q002 Q004 | Confrontare forze su corpi diversi e campo locale | Three.js, PhysicsSims · media | Progettato |
| 24 · Campo elettrico di due cariche | 6.1–6.2 · Somma vettoriale dei campi e scalare dei potenziali | C4-L02 C4-L03 · Q014 Q018 | Ruotare intorno alle cariche e ispezionare la superficie V costante | Three.js · alta | Disponibile · LAB3D-07 |
| 25 · Conduttori ed equipotenziali | 6.2–6.3 · Equilibrio elettrostatico e redistribuzione superficiale | C4-L03 C4-L04 · Q022 Q031 | Distinguere interno, superficie e campo esterno | Three.js, PhysicsSims · alta | Progettato |
| 26 · Condensatore piano e collegamenti | 6.3, 6.5 · C = εA/d, dielettrico, energia e carica dei nodi | C4-L07 C4-L08 · Q061 Q071 | Seguire le armature in profondità e inserire una lastra | Three.js · media | Progettato |
| 27 · Circuiti in serie e parallelo | 6.4 · Ohm, rami, potenze e leggi di Kirchhoff | C4-L05 C4-L06 · Q055 Q059 | Distinguere nodi e incroci ruotando la basetta | Three.js · media | Disponibile · LAB3D-08 |
| 28 · Reti elettriche e leggi di Kirchhoff | 6.4 · Equazioni ai nodi e alle maglie, linee equipotenziali ideali | C4-L06 · Q053 Q058 | Seguire maglie distinte con più derivazioni | Three.js, PhysicsSims · alta | Progettato |
| 29 · Campo magnetico del filo | 6.6 · Simmetria circolare e verso di Oersted | C4-L09 · Q081 Q090 | Ruotare intorno a filo, bussola e campo | Three.js · media | Progettato |
| 30 · Forza di Lorentz | 6.6 · q v × B, traiettoria elicoidale e caso circolare | C4-L09 · Q083 Q086 | Vedere tre direzioni ortogonali e proiezione dell’elica | Three.js, PhysicsSims · alta | Progettato |
| 31 · Induzione in una spira | 6.7 · Flusso BA cosθ, Faraday e segno di Lenz | C4-L10 · Q091 Q093 | Ruotare la normale della spira rispetto al campo | Three.js · media | Progettato |

## Onde, ottica e radiazioni

| Progetto | Obiettivo MUR e modello | Lezioni · esercizi | Cosa permette di vedere il 3D | Candidati OSS · complessità | Stato |
| --- | --- | --- | --- | --- | --- |
| 32 · Onde trasversali e longitudinali | 4.1 · Propagazione armonica, spostamento del mezzo | C5-L01 C5-L02 · Q011 Q018 | Separare oscillazione locale e direzione di propagazione | Three.js, BN Lab · media | Progettato |
| 33 · Sorgente acustica, intensità e ricevitore | 4.3–4.4 · Potenza, superfici sferiche, I = P/(4πr²) e livello in dB | C5-L04 C5-L05 · Q032 Q041 | Spostare il ricevitore su sfere di uguale intensità | Three.js · media | Progettato |
| 34 · Interferenza di due sorgenti | 4.2 · Somma armonica con differenza di cammino e fase | C5-L03 · Q021 Q025 | Confrontare superficie, creste in pianta e sezione alla sonda | Three.js · alta | Disponibile · LAB3D-10 |
| 35 · Doppler e tempo di volo | 4.4–4.5 · Fronti emessi a istanti distinti e ricevitore in moto | C5-L05 · Q045 Q046 | Osservare compressione e rarefazione secondo la direzione | Three.js, BN Lab · media | Progettato |
| 36 · Riflessione e rifrazione | 7.7 · Piano di incidenza, normale e legge di Snell | C5-L09 · Q081 Q086 | Costruire il piano di incidenza rispetto alla superficie | Three.js, Ray Optics · media | Progettato |
| 37 · Banco ottico | 7.7 · Lente convergente sottile e ingrandimento con segno | C5-L10 · Q093 Q098 | Passare dal montaggio reale alla costruzione laterale ortografica | Three.js · media | Disponibile · LAB3D-09 |
| 38 · Onda elettromagnetica e spettro | 7.1–7.3, 7.6 · E e B ortogonali, c = λν ed energia hν | C5-L06 C5-L07 · Q051 Q061 | Separare campi e direzione di propagazione su tre assi | Three.js, PhysicsSims · media | Progettato |
| 39 · Attenuazione attraverso strati | 7.4 · Lambert–Beer, spessore e trasmissione | C5-L07 · Q064 Q069 | Confrontare cammino nel volume e intensità emergente | Three.js · media | Progettato |
| 40 · Popolazioni e decadimenti | 7.5 · N(t), attività, emivita e variazioni di A e Z | C5-L08 · Q075 Q079 | Seguire un campione e successive popolazioni con conteggio verificabile | Three.js, BN Lab · media | Progettato |
