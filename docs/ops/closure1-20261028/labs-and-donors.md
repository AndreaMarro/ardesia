# Laboratori e donor — registro 1C

Fotografia del 2026-10-28T11:08:57+00:00; base HEAD `97ad038332e012a97ce7b26a79a273dd38307825` con implementazione root concorrente nel working tree. **Stato: NON_DONE**. Questo registro documenta provenienza e accettazione; non pubblica lezioni e non attribuisce voti. Il JSON adiacente conserva i digest dei file letti e i dettagli per modello.

Sono presenti 16 modelli originali e 32 preset, con 48 collegamenti a 45 atomici distinti. `definitions.ts` e `fluid_catalog.json` concordano sugli ID. Le indagini REA funzionali sono **12**, con **65 azioni dichiarate** (incluse attese esplicite), **77 stati iniziali/step** e **155 controlli di integrità**. I tentativi aggiuntivi falliti non aumentano il conteggio. Le assimilazioni accettate sono **0**: le 14 corrispondenze sotto sono `PENDING_CONSUMER_ACCEPTANCE`.

## Stato delle prove

| Prova | Esito riferito alla fotografia | Limite |
| --- | --- | --- |
| Numerica, snapshot e geometria locale | 29 PASS, log `vitest-models.log`, ore 11:32:15 | Prova storica precedente agli ultimi cambiamenti; non certifica il working tree corrente. |
| Suite combinata UI | 49 PASS, 1 FAIL sul lazy import 3D | Correzione da rieseguire e verificare dal root. |
| CI HEAD `97ad0383` | Web e Studio SUCCESS; Engine 5 FAIL; API 6 FAIL | Cinque hash attesi obsoleti; API anche cardinalità 4 contro 20. Fix non ancora certificati qui. |
| Browser Ardesia | NOT_PASS | Rilevati problemi di stato e WebGL/StrictMode; correzioni in corso. Nessuna scena 3D o dispositivo dichiarato PASS. |
| Consumer Core/lezioni | PENDING_1A / PENDING_CONSUMER_ACCEPTANCE | ID di lezione dalla mappa 1B; route pubblicate e prova save/reopen ancora mancanti. |

I log privati e i loro SHA256 sono nel JSON. La CI della HEAD storica non trasferisce il proprio esito ai byte modificati. La mappa 1B è stata letta con digest; è una review del source, non un’accettazione di tutti i sotto-obiettivi. Gli atomici definitivi qui sotto provengono dal catalogo attuale.

## Contratto e consumer

Un solo plugin: `io.ardesia.fluid-thermo` versione `1.0.0`, modello/versione configurazione `1`, snapshot `ardesia.fluid-thermo.snapshot/1`. Gli `activityId` corrispondono ai capability ID della matrice. I risultati autorevoli sono ricalcolati da `activities.py` → `science_library/models.py` → `fluid_models.py`; persistenza e accesso appartengono al Core canonico. Il plugin conserva soltanto la bozza aperta. `authoringTools` è disattivato di default e abilitato esplicitamente dal consumer Studio.

Consumer condiviso `apps/studio/plugins/fluid-thermo/FluidThermoLab.tsx`; confine Web `apps/web/src/features/science-library/FluidThermoActivity.tsx`; registrazione Studio `apps/studio/plugins/fluid-thermo/register.tsx`. La presenza di questi confini non prova il montaggio nelle lezioni. Installazioni, wrapper e re-export non sono assimilazioni scientifiche.

## Matrice dei 16 modelli

Tutte le righe restano **NON_DONE**. `3D candidata` indica un flag di catalogo e un’implementazione da verificare, non una scena già accettata. La vista 2D e i dati equivalenti usano lo stesso risultato analitico.

| Modello / activityId | Atomici definitivi | Viste | Lezione proposta da 1B | REA di comportamento |
| --- | --- | --- | --- | --- |
| `manometer` / `manometer-lab-v1` | U3-02.06 | 2D | ds-2026-u3-02 | C1 |
| `hydrostatic` / `hydrostatic-lab-v1` | U3-02.01, U3-01.02 | 2D | ds-2026-u3-02 | C1 |
| `pascal` / `pascal-lab-v1` | U3-02.02 | 2D + 3D candidata | ds-2026-u3-02 | Nessun nuovo donor runtime |
| `buoyancy` / `buoyancy-lab-v1` | U3-02.03, U3-02.04 | 2D + 3D candidata | ds-2026-u3-02 | C3 |
| `continuity` / `continuity-lab-v1` | U3-03.01, U3-03.04 | 2D + 3D candidata | ds-2026-u3-03 | C4 |
| `venturi` / `venturi-lab-v1` | U3-03.04, U3-03.05 | 2D + 3D candidata | ds-2026-u3-03 | C4, C5 |
| `poiseuille` / `poiseuille-lab-v1` | U3-04.01, U3-04.02, U3-04.03, U3-04.04 | 2D + 3D candidata | ds-2026-u3-04 | C6 |
| `hydraulic-network` / `hydraulic-network-lab-v1` | U3-04.05 | 2D | ds-2026-u3-04 | C7 |
| `capillary` / `capillary-lab-v1` | U3-05.01, U3-05.03, U3-05.04, U3-05.05 | 2D + 3D candidata | ds-2026-u3-05 | Nessun nuovo donor runtime |
| `ideal-gas` / `ideal-gas-lab-v1` | U5-01.02, U5-01.04, U5-01.05 | 2D + 3D candidata | ds-2026-u5-01 | C9 |
| `calorimetry` / `calorimetry-lab-v1` | U5-02.01, U5-02.02, U5-02.03, U5-02.07 | 2D | ds-2026-u5-02 | C10 |
| `phase-change` / `phase-change-lab-v1` | U5-02.05, U5-02.06 | 2D | ds-2026-u5-02 | C11 |
| `heat-transfer` / `heat-transfer-lab-v1` | U5-03.01, U5-03.02, U5-03.03 | 2D | ds-2026-u5-03 | C12 |
| `process` / `process-lab-v1` | U5-02.04, U5-04.01, U5-04.02, U5-04.03, U5-04.04, U5-04.05, U5-04.06, U5-04.07, U5-04.08, U5-05.02, U5-05.06 | 2D + 3D candidata | ds-2026-u5-04 | C9 |
| `carnot` / `carnot-lab-v1` | U5-05.03, U5-05.04, U5-05.05 | 2D | ds-2026-u5-05 | C15 |
| `entropy` / `entropy-lab-v1` | U5-05.02, U5-05.06, U5-05.08 | 2D | ds-2026-u5-05 | C16 |

Modello TS: `apps/studio/plugins/fluid-thermo/models.ts`; modello Python indipendente: `packages/engine/lessonos/study/science_library/fluid_models.py`; definizioni: `apps/studio/plugins/fluid-thermo/definitions.ts`; proiezione catalogo: `packages/engine/lessonos/study/science_library/fluid_catalog.json`. Test mirati: `apps/studio/plugins/fluid-thermo/models.test.ts`, `packages/engine/tests/study/test_fluid_thermo_models.py`, `apps/studio/plugins/fluid-thermo/snapshot.test.ts` e `apps/studio/plugins/fluid-thermo/sceneGeometry.test.ts`. Il JSON indica i singoli casi, preset, vincoli e percorsi per ogni riga.

Le dichiarazioni scientifiche restano delimitate: immersione imposta distinta da equilibrio libero; Venturi ideale senza perdita viscosa; Poiseuille con vincolo Δp/Q esplicito e rifiuto Re > 2300; capillare limitato dal numero di Bond; libera espansione isolata con soli due stati di equilibrio separati, Q=W=ΔU=0 e ΔS=nR ln(V2/V1)>0. Il golden di libera espansione con n=1 mol, T=300 K e V2/V1=2 è ΔS=5.763146321644 J/K. Nessuna curva intermedia o area di lavoro viene inferita.

## Corrispondenze candidate da accettare

Ogni riga è `PENDING_CONSUMER_ACCEPTANCE`, con consumer Web/Studio presenti come confini di source e route Core ancora `PENDING_1A`. Due righe possono derivare dallo stesso scope REA: il numero di righe non aumenta le 12 indagini e non equivale ad assimilazioni accettate. I test indicati verificano il modello originale Ardesia, non certificano globalmente il donor.

| ID / REA | Comportamento → implementazione visibile | Test e consumer |
| --- | --- | --- |
| A01 / C1 | Profondità e densità aggiornano insieme pressione e misura leggibile. → **hydrostatic**: Sezione del recipiente, profondità, pressione assoluta e gauge sullo stesso risultato. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-02. |
| A02 / C1 | Differenza di livello e segno della lettura manometrica. → **manometer**: Rami a U, Δh firmato e p1−p2; controlli numerici originali. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-02. |
| A03 / C3 | Volume spostato, spinta e peso visibili insieme. → **buoyancy**: Diagramma e scena mostrano f imposta, V spostato e due forze distinte. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-02. |
| A04 / C4 | La variazione della sezione aggiorna la velocità a portata comune. → **continuity**: Sezioni e frecce medie condividono Q, A1, A2, v1, v2. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-03. |
| A05 / C4 | Pressione, quota e termine cinetico appartengono allo stesso bilancio. → **venturi**: p1, p2, velocità e altezza nel diagramma 2D e nelle misure. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-03. |
| A06 / C5 | La strozzatura collega sezione e pressione nella stessa esperienza. → **venturi**: Controlli A1/A2 e speed1, pressioni assolute e confronto sul risultato ideale. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-03. |
| A07 / C6 | Profilo locale con massimo sull’asse, no slip e dominio laminare. → **poiseuille**: Curva e frecce u(s), u_max, u_media, Re; selezione del vincolo Δp o Q. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-04. |
| A08 / C7 | Topologia, portate per ramo e conservazione leggibili insieme. → **hydraulic-network**: Rete serie/parallelo con R note, cadute e portate dei due rami. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u3-04. |
| A09 / C9 | Pistone e quantità PVT rispondono allo stesso vincolo. → **ideal-gas**: Volume e altezza lineari, pV=nRT e isoterma con kelvin e pressione assoluta. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u5-01. |
| A10 / C10 | Condizioni iniziali riconoscibili e reset riproducibile. → **calorimetry**: Parametri dei due corpi, previsione, equilibrio e bilancio; reset alla baseline della configurazione. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u5-02. |
| A11 / C11 | Plateau e quantità di fase sono collegati alla rappresentazione energetica. → **phase-change**: Temperatura contro Q e frazione fusa condividono lo stesso stato. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u5-02. |
| A12 / C12 | Materiale/spessore modificano il trasferimento nella stessa rappresentazione. → **heat-transfer**: Conduzione kAΔT/L nel confronto con due configurazioni separate di convezione e irraggiamento. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u5-03. |
| A13 / C15 | Ciclo orientato e flussi collegati ai serbatoi. → **carnot**: Ciclo p–V costruito e bilanci per ciclo, rendimento in temperature assolute. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u5-05. |
| A14 / C16 | Contributi separati e totale con processo e condizioni iniziali dichiarati. → **entropy**: ΔS dei due corpi finiti, somma e bilancio energetico contro frazione dello scambio. | `models.test.ts` / `test_fluid_thermo_models.py`; `FluidThermoLab` via Web/Studio, ds-2026-u5-05. |

Il JSON conserva per ogni candidata Evidence ID, digest, caso di test, percorsi e limite. Sono esclusi i piezometri o il toggle attrito non implementati, una vista T–S non presente, le etichette sbagliate del donor Carnot e qualsiasi equivalenza tra la rete Bernoulli donor e il solver viscoso originale.

## Dodici indagini REA funzionali

REA CLI 6.7.0, Node esplicito 24.19.0 e Chromium 148.0.7778.96; un solo browser alla volta. Doctor Codex allineato; MCP assente nella sessione attiva. Nessuna reinstallazione o modifica della configurazione. Il doctor riporta Node 26.5.1 nel proprio check: non è la versione esplicitamente usata per le catture. I motori binari opzionali mancanti non erano richiesti da queste prove browser.

| Scope | Evidenza | Azioni | Durata REA (ms) | Osservazione delimitata |
| --- | --- | ---: | ---: | --- |
| C1 — Pressione e manometro | `ev_08c7e466841acda60006d1a75beb006c21a5159279235f3a01d431da6a23726f` | 8 | 47793 | h=2 cm in acqua: 2.0 hPa; h=4 cm: 3.9 hPa; densità raddoppiata: 7.8 hPa. Il testo digitato cambia prima del risultato; Enter conferma il calcolo e aggiorna il manometro. |
| C3 — Galleggiamento e volume spostato | `ev_dc248b5d72760f6548e123738b191b13950cff885e34d10e8a5673b8b05066ad` | 5 | 14143 | PVC con densità relativa1.33 in acqua: Vimmerso1.00m³, peso13.05kN, spinta9.81kN; il corpo affonda. Il parametro densità minima fa galleggiare il corpo; selezione legno e benzina cambia volume spostato e quota. |
| C4 — Continuità e ripartizione di Bernoulli | `ev_f74d8217c672a58e62b19397868386f89e32070b329b41c728207a0111a366b1` | 4 | 56779 | Diametro uscita2.5→12.5cm aggiorna geometria e velocità; ingresso5.0cm e1.0m/s, uscita larga mostra0.2m/s arrotondato. Vista energia a quota2.7m mostra ingresso100.0+0.5+0 e uscita74.0+0.0+26.5kJ/m³. |
| C5 — Venturi e prese piezometriche | `ev_cf25a448c569c91597edb51ef8d4f8d06a5c0f8c326d5ad660b783de24bfd610` | 5 | 11767 | Valvola0→100%; portata visualizzata50mL/s. Senza attrito: piezometri138/89/138mm, tubo20mm e strozzatura8mm. |
| C6 — Poiseuille e profilo locale | `ev_3a34cee2ce42a7a6c2f465eb0a490d4d6e78e86eeed84aa0c5d55d7d1258f4a4` | 5 | 11564 | Raggio0.5→2.5cm: Q0.142→88.6cm³/s; vmax≈2vmedia. Viscosità1Pa·s: Q0.100cm³/s, vmedia0.0051cm/s, vmax0.010cm/s, Re0.0025. Il donor modifica i limiti del gradiente per mantenere Re<2100 e il range di velocità. |
| C7 — Ripartizione nei rami di una rete | `ev_f3c7aa637276b83670e28fa0ef6a4bb5520126b91a30270e8eb5df5cecb59684` | 4 | 8706 | Pressione10kPa e raggi0.6/0.2m modificano SVG, diametri1.20/0.40m, velocità dei rami4.9m/s e ingresso2.0m/s arrotondati. Il source calcola Qinizio=Qsinistra+Qdestra con Bernoulli ideale e uguale velocità alle due uscite. |
| C9 — Gas ideale e vincoli PVT | `ev_dc26fd99f0d070d53b90c30dd0c020fe0e41943f25d9fd212a6890e0ba2e5788` | 7 | 12278 | Selezionate modalità volume costante, pressione costante e temperatura costante; controlli di calore/pressione manipolati. A T273K, P4.00atm: n2.29mol,V12.8L,Qtotale−7.20kJ nella vista isoterma. |
| C10 — Calorimetria, avvio e reset | `ev_1582ee3fe5698dca4f99b31e355303579989072d166dd8c5277183acbb6d664b` | 6 | 33042 | Impostati blocco60°C e500g; drop metal disabilita i controlli iniziali. Reset restituisce blocco30°C,400g e acqua4°C; il workflow è stato esercitato. |
| C11 — Fusione e rappresentazioni collegate | `ev_ce8ab55c5ef86182cb5dd08d7acff0b31e00448fab984b4074995c3c3f290d59` | 6 | 21158 | Avvio, osservazione, scelta grafico temperatura, scelta entrambi i grafici e reset eseguiti. Acqua0.0°C, blocchi inizialmente30/80°C poi circa20/38°C mentre massa fusa cresce. |
| C12 — Conduzione attraverso strati | `ev_6374840ea85ee26afb21826e617768f27a05ee0fa78d0c3f60bda5f94f894b1c` | 4 | 25117 | Temperatura sinistra100°C, lato destro fisso45°C, materiale destro piombo, vetro2.5cm. Vista finale: flusso1555W/m² e profilo continuo a pendenze diverse nei quattro strati. |
| C15 — Ciclo termico e viste PV/TS | `ev_d33700d3a6847094463b5a7cab9d9f0790497341d4fec390edc48f3453f3b809` | 5 | 13462 | Modificati TH650K,TC350K; scelti diagrammaTS e modalità heat pump. Flussi visibili: QH−5.94,Qc3.2,W2.74kJ/mol; il donor mostraCOP1.17 comeQc/|W|. |
| C16 — Entropia di miscelazione | `ev_cf40255c100bf38e7cac373adc127df723aa32f5f198b7124e37fb4db3c0ff53` | 6 | 14252 | PressioneA1.00bar,B0.50bar,rapporto volumi2; rimossa la barriera e osservata la miscelazione. Durante evoluzione il display mostra contributi positivi e somma crescente (screenshot257J/K,AX272J/K a istante successivo). Reset ripristina pressioni0.5/0.5bar e rapporto1.0. |

I 12 record del JSON conservano URL primari, digest dell’envelope e della richiesta, durata, osservazioni, inferenze e ignoti. Non contengono raw DOM o immagini. Le misure nel canvas sono state lette dalle catture visuali; non sono presentate come output accessibile nel PDOM. AX e screenshot delle scene animate sono seriali e possono riferirsi a istanti diversi.

PhET Buoyancy è rimasto una discovery senza manipolazione, 532.848 s e `cleanup_incomplete`: escluso dai 12 scope, poi sostituito da LearnChemE dopo verifica dell’assenza di processi browser residui. Il primo C4 ha fallito un selettore del toggle energia; il recupero della stessa domanda è quello contato. C10 prova configurazione, avvio e reset, non equilibrio quantitativo. C16 osserva miscelazione di gas, mentre il modello Ardesia usa due corpi finiti: è assimilabile soltanto la lettura di contributi e totale.

### Errori del donor Carnot da non assimilare

Con TH=650 K e TC=350 K la modalità “heat pump” del donor mostra Qc/|W|=1.17, cioè il COP frigorifero; il COP di riscaldamento è 2.17. Inoltre l’asse S è etichettato kJ/(mol K), ma i valori del source sono nella scala J/(mol K). La ricostruzione originale non copia né queste formule/etichette né una vista T–S non implementata.

## Recupero storico Ardesia

- Registro `registry/TARGETS.json`: 139 target letti, con stato storico `NOT_RUN`. La mappa `ARDESIA-REA-DEPTH-139` distingue tentativi d’ingresso, review e limiti; non sono 139 indagini funzionali.
- I 139 envelope sono localizzati come metadati iCloud `compressed,dataless`. Byte e hash non sono stati recuperati integralmente; nessun download massivo. Percorso e limiti esatti sono nel JSON.
- S12/S13 non localizzati nei percorsi handoff esaminati: limite di ricerca, non assenza globale. S14 ha evidenze storiche Excalidraw, S15 è riuso indiretto e non conta come laboratorio. S16 fornisce geometrie originali ora referenziate dal renderer; il manifest storico continua a dire consumer non verificato.
- Atlante e 36 PNG originali non localizzati nella ricerca delimitata; zero immagini originali dell’atlante ispezionate. Nessuna ricostruzione o visualizzazione dell’atlante viene rivendicata.
- JSXGraph 1.14.0 ed Excalidraw ^0.18.1 erano già presenti. Three.js 0.186.1 è ora dichiarato nei manifest Web/Studio: è un motore di rendering, non un’ulteriore assimilazione scientifica.

## Geometria originale e calibrazione

Sono riusati `assets/scientific3d/calibrated-vessel.glb` (29,116 byte, 704 triangoli) e `piston-cylinder.glb` (39,240 byte, 1,156 triangoli), con digest e provenienza S16 nel JSON e nel manifest originale. Nessuna texture o risorsa esterna. La trasformazione nel renderer usa unità di scena normalizzate: le graduazioni sono illustrative, non misure in ml della geometria trasformata; i vettori hanno scala relativa.

Per il pistone, `sceneGeometry.ts` mantiene altezza lineare con il volume e posizione coerente fra S16 e geometria parametrica. S16 è usato solo nella corsa geometrica dichiarata; fuori corsa resta la geometria originale parametrica. Il test delle coordinate non sostituisce la prova visuale. Otto modelli dichiarano una vista 3D: almeno cinque scene utili e i relativi fallback devono ancora essere accettati dal root. GPU, tablet e dispositivo fisico restano NOT_RUN.

## Diritti e fonti primarie

Decisione comune: osservazione UX e ricostruzione originale; **nessuna copia di codice, asset, DOM o iframe donor nel prodotto**. Source e screenshot donor restano nel work privato. Le licenze non sono estese automaticamente a tutti gli asset o alle dipendenze.

- [FENDT](https://www.walter-fendt.de/html5/phen/hydrostaticpressure_en.htm): Footer osservato CC BY-NC-SA 4.0; source con uso non commerciale. Nessun riuso di codice o asset.
- [PHET_LICENSE](https://phet.colorado.edu/en/licensing): La build Buoyancy osservata dichiara CC BY-NC 4.0 e licenza commerciale necessaria. Discovery parziale esclusa dai 12 scope.
- [PHET_SOURCE](https://github.com/phetsims/buoyancy): Il repository corrente rinvia a monorepo privato; source attuale completo non disponibile al pubblico in questa ricognizione.
- [LEARNCHEME_SOURCE](https://github.com/LearnChemE/LearnChemE.github.io/tree/f0fd5c6ac6a6bf0529cefc7911151a5c903e6f3d): Source pubblico esaminato prima del runtime; pin f0fd5c6a. Bundle distribuito non riconciliato per hash con quel commit. Alcuni package dichiarano ISC, nessun grant globale per asset o dipendenze asserito.
- [VENTURI_PRIMARY](https://learncheme.com/simulations/fluid-mechanics/venturi-meter/): Pagina ufficiale della simulazione; osservazione di comportamento e ricostruzione originale.
- [THREE](https://github.com/mrdoob/three.js/blob/r186/LICENSE): Three.js 0.186.1 dichiarato nei manifest Web/Studio; MIT, motore di rendering. Dipendenza non conteggiata come assimilazione scientifica.
- [GLTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html): Specifica glTF 2.0; GLB originali Ardesia, senza texture o risorse esterne.

I GLB originali sono regolati da `assets/scientific3d/RIGHTS.md`: `LicenseRef-Ardesia-Original` attesta provenienza e consegna autorizzata al progetto, non una licenza open source per la distribuzione esterna. Il proprietario decide tale distribuzione.

## Tempi, prestazioni e prossima accettazione

Somma delle durate REA delle 12 catture accettate: **270,061 ms (270.061 s)**. La somma dei wall time CLI disponibili è **263.000 s su 11 scope**; C1 non ha quel dato. Sono orologi e coperture diversi, quindi non si sommano tra loro. A parte: discovery PhET fallita 532.848 s; primo C4 fallito 36.552 s di wall time CLI. Il tempo totale di indagine e il costo controfattuale rimangono **UNKNOWN**. Queste misure includono navigazione/artefatti e non misurano la reattività di Ardesia.

p95 dei controlli Ardesia, fps desktop/tablet e prestazioni su hardware: **NOT_RUN**. Beneficio didattico e risparmio controfattuale: **NOT_MEASURED / UNKNOWN**.

Restano: prove verdi delle correzioni sulla nuova SHA; verifica reale delle scene e del fallback; route 1A esatte e save/reopen nel Core; accettazione di almeno otto corrispondenze visibili; CI e merge tree coerenti. Questo worker si ferma ai due registri assegnati e non avvia nuovi donor.
