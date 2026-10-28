# Atlante di riferimenti — simulazioni di fisica 3D

> 27 ottobre 2026. **Ricerca e riferimenti esterni**, non implementazioni Ardesia. Le immagini visualizzate qui sono caricate dai siti citati, senza copiarne il file nel repository. Le licenze del materiale illustrato NON sono assunte libere. Non importare codice né asset senza audit delle licenze.

## Verdetto tecnico

Il benchmark competitivo non è avere «un simulatore»: occorre consentire manipolazione diretta, modello fisico quantitativo, controlli e misure, feedback immediato, annotazione sulla lavagna, snapshot stabile, integrazione con le lezioni e rigore scientifico. Distinguere **3D fisico**, **3D solamente grafico**, **2D scientifico** e **render statico**. Non inseguire ogni 3D indiscriminatamente.

## Galleria visiva (screenshot di terzi, riprodotti da URL originali esterni)

### 1. 3D: campo magnetico e laboratorio

![3D: campo magnetico e laboratorio](https://electromagnetism3d.com/screenshots/full-app.webp)

Fonte e credito: [Magnetism 3D Lab](https://electromagnetism3d.com/). Anteprima remota non ospitata da Ardesia.

### 2. 3D: onda elettromagnetica e vettore di Poynting

![3D: onda elettromagnetica e vettore di Poynting](https://simuphysics.com/simulations/screenshots/poynting-vector-3d-visualization.png)

Fonte e credito: [SimuPhysics](https://www.simuphysics.com/). Anteprima remota non ospitata da Ardesia.

### 3. 3D: interferenza di onde

![3D: interferenza di onde](https://sciencesimulations.com/assets/images/og_previews/wave-superposition-3-d.png)

Fonte e credito: [Science Simulations](https://sciencesimulations.com/es/simulaciones/ciencias-fisicas/superposicion-de-ondas-3d/). Anteprima remota non ospitata da Ardesia.

### 4. 3D: densità di probabilità orbitale

![3D: densità di probabilità orbitale](https://virtual-labs.github.io/exp-hydrogen-atom-dei/images/image6.png)

Fonte e credito: [Virtual Labs](https://virtual-labs.github.io/exp-hydrogen-atom-dei/procedure.html). Anteprima remota non ospitata da Ardesia.

### 5. 3D: orbitali quantistici

![3D: orbitali quantistici](https://www.vidyaadmire.com/assets/AtomicOrbitalWeb-qjAEqxvy.webp)

Fonte e credito: [vidyaAdmire](https://www.vidyaadmire.com/). Anteprima remota non ospitata da Ardesia.

### 6. 3D: gas ideale, visualizzazione

![3D: gas ideale, visualizzazione](https://www.mozaweb.com/en/mozaik3D/FIZ/termo/ideal_gases/960.jpg)

Fonte e credito: [Mozaik](https://www.mozaweb.com/Extra-3D_scenes-Internal_energy_of_ideal_gases-661713). Anteprima remota non ospitata da Ardesia.

### 7. 3D: ottica geometrica e lente

![3D: ottica geometrica e lente](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/570/924/datas/original.png)

Fonte e credito: [ExperimentAI](https://devpost.com/software/experimentai-1zspj7). Anteprima remota non ospitata da Ardesia.

### 8. 3D: modello orbitale

![3D: modello orbitale](https://ronitpai.in/_next/static/media/project1.02m-i0q1pc3oe.png)

Fonte e credito: [Ronit Pai](https://ronitpai.in/). Anteprima remota non ospitata da Ardesia.

### 9. WebGL: visualizzazione di un fluido

![WebGL: visualizzazione di un fluido](https://lh4.ggpht.com/Ft5xLXnTf4hg184mBlSi47k9HuNH2DfE_pqZCFbPBeSqO-8RsvhiCFv7QqZ6KJTRVq1wMBTA2Jnl5oF3tAr0zRc1eDY_HDj-46xhwQ)

Fonte e credito: [Experiments with Google](https://experiments.withgoogle.com/fluid-and-particles-in-webgl). Anteprima remota non ospitata da Ardesia.

### 10. 3D: studio della deformazione di una trave

![3D: studio della deformazione di una trave](https://cccp3d.ru/uploads/monthly_03_2015/post-29001-0-70612800-1425327137.jpg)

Fonte e credito: [Forum SolidWorks (sola ispirazione visiva)](https://cccp3d.ru/topic/72411-%D1%80%D0%B0%D1%81%D1%87%D0%B5%D1%82-%D0%BF%D1%80%D0%BE%D1%81%D1%82%D0%BE%D0%B9-%D0%B1%D0%B0%D0%BB%D0%BA%D0%B8-%D0%BD%D0%B0-%D0%B8%D0%B7%D0%B3%D0%B8%D0%B1/). Anteprima remota non ospitata da Ardesia.

---

## Catalogo di demo, modelli e toolkit da esplorare

**Legenda:** `3D` = camera/proiezione 3D; `2D` = utile per didattica o solver ma non per benchmark 3D; `misto` = raccolta eterogenea. **Priorità** significa potenziale valore, non difficoltà o stato di implementazione.

### A · Meccanica, vincoli, corpi rigidi e moto

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [VistaKine — laboratorio meccanico 3D](https://www.vistakine.com/) | 3D interattivo | Oggetti su piani inclinati, forze, grafici, collisioni; ispezionare drag, vettori fisici e slow-motion. | Alta |
| [three.js Rapier, Jolt, Ammo](https://threejs.org/examples/) | Esempi di motori 3D | Corpi rigidi, tessuti, giunti, terreno; progettare modello fisico separato dalla scena. | Alta |
| [WebVR laboratory — pendolo, massa-molla, controllo](https://github.com/ldmo-cidetec/webvr-laboratory/) | 3D open source | Controlli e modello dinamico integrati in una scena 3D; progetto accademico 2026. | Alta |
| [three.js WebGPU — tessuti e molle](https://threejs.org/examples/webgpu_compute_cloth.html) | 3D WebGPU | Griglia deformabile, constraints, tempo e restituzione visiva; richiede WebGPU. | Alta |
| [myPhysicsLab — rigore dei solver](https://www.myphysicslab.com/) | Principalmente 2D | Conservazione dell'energia, parametri, grafici; fonte metodologica 2D, non demo 3D. | Alta |
| [Tellurion — atlante trasversale](https://tellurion.dev/) | Misto 2D/SVG/WebGL | Confronto di centinaia di esperienze variabili: testare realismo e fedeltà caso per caso. | Alta |

### B · Fluidodinamica, acqua e particelle

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [three.js MLS-MPM compute fluid](https://threejs.org/examples/webgpu_compute_particles_fluid.html) | 3D WebGPU | Particelle come fluido, GPGPU, manipolazione dei volumi; controllare stabilità. | Alta |
| [three.js onde d'acqua / compute](https://threejs.org/examples/) | 3D WebGPU | Superfici d'acqua, disturbi e animazione; onde superficiali non equivalgono a CFD 3D. | Alta |
| [three.js volume clouds](https://threejs.org/examples/) | 3D volumetrico | Rendering volumetrico, raymarching, trasparenze; tecnica visiva, non modello fisico. | Media |
| [Physics Lab — galleria aerodinamica D3Q19](https://github.com/Banegasn/physics-lab) | 3D dichiarato nel progetto | Flusso attorno a ostacoli e mesh importate; verificare funzionamento e accuratezza solver. | Alta |
| [BN Lab — fluidi numerici](https://github.com/4mser/bn-lab-simulations) | 2D GPU e matematico | Metodo Navier–Stokes verificabile; patrimonio di solver, non sostituto di 3D. | Alta |
| [Fluid & Particles WebGL](https://experiments.withgoogle.com/fluid-and-particles-in-webgl) | WebGL visuale | Tracce di flusso, vortici, performance, palette: modello da validare prima di riutilizzare. | Media |

### C · Elettromagnetismo, campi e onde

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [Magnetism 3D Lab](https://electromagnetism3d.com/) | 2D+3D interattivo | Magneti, spire, solenoidi, linee B, particelle e legge di Ampère; editor diretto. | Alta |
| [SimuFísica — carica in campi E/B](https://simufisica.com/it/carica-campo-elettromagnetico/) | 3D interattivo | Forza di Lorentz, traiettoria elicoidale, vettori E/B/F, RK4, camera orbitale. | Alta |
| [UCLA — traiettorie particelle](https://spacephysics.ucla.edu/ParticleMotion/ParticleMotion.html) | 3D e proiezioni | Drift E×B, specchio magnetico, dipolo, massa e carica; preset didattici. | Alta |
| [SimuPhysics — onda EM e Poynting](https://www.simuphysics.com/) | 3D interattivo | Onde ortogonali E e B, vettore di Poynting, viste 3D, significato matematico. | Alta |
| [GeoGebra — forza di Lorentz](https://www.geogebra.org/m/xpRMzPgc) | 2D+3D | Confronto di traiettorie, parametri e componenti della velocità. | Media |
| [Magnetism 3D — campo su geometrie](https://advlabs.aapt.org/items/detail.cfm?ID=17282) | Valutazione didattica | Descrizione dell'esperienza e ambiti universitari, fonte indipendente. | Media |

### D · Onde meccaniche, interferenza e acustica

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [Sciencesimulations — interferenza 3D](https://sciencesimulations.com/es/simulaciones/ciencias-fisicas/superposicion-de-ondas-3d/) | Superficie 3D | Sovrapposizione, nodi e antinodi, velocità, parete riflettente; mostrare il confronto teoria/scena. | Alta |
| [three.js GPU waves](https://threejs.org/examples/) | 3D/GPU visuale | Height-field, superfici e prospettiva; associare lunghezza d'onda, fase e ampiezza. | Alta |
| [PhET — Fourier: Making Waves](https://phet.colorado.edu/en/simulations/filter?subjects=physics) | 2D pedagogico | Controlli semplici, decomposizione armonica; ottimo paradigma UX, non 3D. | Media |
| [Tellurion — onde e acustica](https://tellurion.dev/) | Misto | Libreria di pattern didattici da provare, senza attestare tutte le simulazioni come 3D. | Media |

### E · Ottica geometrica, lenti e fotonica

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [ExperimentAI — ottica lente convessa](https://devpost.com/software/experimentai-1zspj7) | Showcase 3D | Lente trasparente, raggi, oggetto e schermo. È una vetrina progetto: stato della demo da verificare. | Alta |
| [PhET — Geometric Optics](https://phet.colorado.edu/en/simulations/filter?subjects=physics) | 2D pedagogico | Movimento oggetto/lente, distanza focale e raggi; riferimento interazione, non 3D. | Alta |
| [three.js — refraction/transmission](https://threejs.org/examples/) | 3D rendering | Rifrazione e materiali trasparenti; per fisica aggiungere Snell e verifiche quantitative. | Media |

### F · Termodinamica, gas e cinetica

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [Mozaik — energia interna gas ideali](https://www.mozaweb.com/Extra-3D_scenes-Internal_energy_of_ideal_gases-661713) | 3D educational scene | Urti di particelle, volume e temperatura: distinguere moto illustrativo da dinamica cinetica. | Alta |
| [PhET — Gas Properties](https://phet.colorado.edu/en/simulations/filter?subjects=physics) | 2D pedagogico | Controllo P/V/T, istogrammi, misure e relazioni; UX trasferibile. | Alta |
| [VistaKine — forze e misure 3D](https://www.vistakine.com/) | 3D meccanica | Studio di come far vedere vettori e grafici in un ambiente di manipolazione. | Media |

### G · Quantistica e struttura della materia

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [Hydrogen Orbital Visualizer](https://virtual-labs.github.io/exp-hydrogen-atom-dei/procedure.html) | 3D orbitale | Numeri quantici, lobi, nodi, livelli; spiegare probabilità, non orbite classiche. | Alta |
| [Quantum orbital browser (UQ)](https://cosc-3000-orbitals.vercel.app/) | 3D volumetrico | Iso-superfici, point cloud e tagli 2D sincronizzati; n≤3 dichiarato. | Alta |
| [Quantum Mechanics Visualizer](https://barakhirshberg.github.io/qcb_demos/index.html) | 2D+3D analitico | Stati stazionari, armoniche sferiche, molecole e fasi; controllo normalizzazione. | Alta |
| [QuantumAtom](https://github.com/steeve-pix/QuantumAtom) | 3D desktop open source | Rendering densità, isosuperfici e sezioni; non browser-native, utile come reference tecnica. | Media |
| [Mol* / RCSB PDB](https://www1.rcsb.org/3d-view) | 3D interattivo molecolare | Proteine, selezione atomi, superfici, misure e annotazioni; biologia molecolare. | Alta |

### H · Astrofisica, gravità e spazio

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [NASA Eyes — sistema solare](https://science.nasa.gov/eyes/) | 3D dati NASA | Orbite, spacecraft, tempi e camera; distinguere dati reali da dinamica inventata. | Alta |
| [NASA Eyes — asteroidi](https://www.nasa.gov/interactives/) | 3D dati NASA | Corpi minori, traiettorie, zoom continuo e timeline. | Alta |
| [NASA Eyes — esopianeti e Terra](https://www.nasa.gov/interactives/) | 3D dati NASA | Scale multiple, transizioni e contesto scientifico. | Alta |
| [PhET — My Solar System](https://phet.colorado.edu/en/simulations/filter?subjects=physics) | 2D pedagogico | Editor gravitazionale facile da usare; le leggi fisiche prima dello spettacolo. | Media |

### I · Matematica 3D e ingegneria

| Riferimento | Tipo verificabile dalla fonte | Cosa studiare | Priorità |
|---|---|---|---|
| [GeoGebra 3D Calculator](https://www.geogebra.org/3d) | 3D parametrico | Superfici, piani, curve, sezioni: formula e manipolazione simultanee. | Alta |
| [PhysicsLab (Angular) — Lorenz 3D](https://github.com/Banegasn/physics-lab) | 3D numerico | Attrattore caotico, transizioni, condizioni iniziali; test sensitività. | Alta |
| [three.js WebGPU geometry/volume](https://threejs.org/examples/) | 3D rendering | Campi scalari, slice 3D e geometria: visualizzazione da integrare con solver. | Media |
| [myPhysicsLab — architettura solver](https://github.com/myphysicslab/myphysicslab) | 2D sorgente open | Separazione solutore/UI e validazione matematica; codice Apache 2.0, non asset 3D. | Alta |

**Totale: 41 riferimenti interdisciplinari, 10 immagini di anteprima esterne.**

## Scelta della roadmap 3D — zero eLab

| Priorità | Fenomeno | Requisiti scientifici e 3D | Test di accettazione |
|---|---|---|---|
| P0 | **Meccanica 3D**: corpo, piano, pendolo, collisione | massa, forze, attrito, energia, vettori in scena | confronto analitico limite, conservazione nel caso ideale, telecamera e drag |
| P0 | **Elettromagnetismo 3D**: campo E/B e traiettoria | Maxwell/Lorentz per domini dichiarati, integratore controllabile, misura del raggio e velocità | r = mv/(qB), senso della forza, unità e dimensioni, condizioni degeneri |
| P0 | **Onde 3D**: superficie, sorgenti, interferenza | frequenza, velocità, ampiezza, fase, nodi/antinodi, sezione e misure | λ=v/f, sovrapposizione e limite monofrequenza |
| P1 | **Fluidi 3D**: particelle e campo | solver definito, limiti dominio, boundary conditions, conservazione, performance | portata, Bernoulli dove applicabile, convergenza mesh e step |
| P1 | **Orbitali 3D**: densità di probabilità | numeri quantici, nodi, densità e normalizzazione; non elettroni-orbite | confronto funzione teorica, controllo integral=1 |
| P1 | **Ottica 3D**: raggi e lenti | rifrazione Snell, specchi, focali, diagramma e immagine | 1/f = 1/p + 1/q, TIR, casi limite |
| P2 | **Termodinamica**: gas ed energia | ensemble statistico coerente, collisioni, variabili P,V,T | limiti cinetici, relazione PV=nRT, distribuzioni coerenti |
| P2 | **Spazio, gravità, campi e matematica** | N-body, orbite, sezioni 3D, campi scalari/vettoriali | Keplero, energia, unità, tolleranze |

## UX condivisa dei futuri laboratori

1. L'utente non deve scegliere un «plugin»: un docente trascina **un esperimento** direttamente nella lavagna; lo studente può interagire solo secondo permessi.
2. Ogni esperimento espone **modello → controlli → grandezze misurate → grafico → ipotesi → confronto**; in una schermata, con layout responsivo.
3. Rendering 3D e solver sono separati. Esportazione di parametri, seed, unità, tempo e revisione; replay deterministico dove scientificamente appropriato.
4. Ogni scena può diventare una prova, un'annotazione, una lezione salvata e un esercizio successivo; nessuna nuova entità autorevole parallela al Core.
5. Modalità essenziale / avanzata. Accessibilità tastiera/touch; fallback WebGL/Canvas ove possibile. Non rendere WebGPU requisito universale senza un percorso compatibile.
6. **Nessuna dipendenza eLab**: non clonare il pacchetto né ri-etichettarlo. Solo componenti indipendenti, legali, verificati e manutenibili.

## REA: criterio oggettivo per il recupero open-source

Per ogni candidata integrazione registrare: URL upstream, licenza e dipendenze; demo cliccabile; costo di integrazione; fedeltà fisica; controlli accessibili; API di stato; performance; test; ownership e aggiornabilità. L'integrazione conta come **DONE** soltanto se appare nel percorso Ardesia distribuito e può essere salvata, riaperta e utilizzata realmente. Una schermata/render o una PR isolata non contano.

## Licenze

Links/immagini sono riferimenti a scopo di confronto visivo. Nessuna autorizzazione a riprodurre siti, programmi, sorgenti, contenuti o screenshot; verificare caso per caso. Software open source e immagini associate possono avere licenze differenti.
