# Sorgenti, diritti e riproducibilità

La biblioteca usa i moduli ES di Three.js r180 e il suo controllo orbitale. La scena, il modello, la geometria di ogni apparato, i materiali, le etichette, le tavole, i grafici e i testi degli esperimenti sono definiti nell’app. Le risorse di identità e i caratteri sono quelli già distribuiti da Officina. [Licenze degli asset esistenti](../fonti-e-licenze.md)

## Componenti consegnati

Pacchetto npm `three@0.180.0`, commit `0af9729d0c143a86a1d725d6e2c3ad83301f3f34`, licenza MIT, copyright © 2010–2025 three.js authors. La copia integrale dell’avviso accompagna i file distribuiti. I materiali, le texture delle etichette e le ombre sono generati sul dispositivo. Il banco non acquisisce modelli, fotografie, campioni, font o simulazioni da queste piattaforme. [Release r180](https://github.com/mrdoob/three.js/releases/tag/r180) · [Licenza distribuita](../../static/vendor/three-r180/LICENSE)

| File nel repository sorgente | Destinazione in `static/vendor/three-r180/` | Modifiche e dipendenze |
| --- | --- | --- |
| [build/three.core.min.js](https://github.com/mrdoob/three.js/blob/r180/build/three.core.min.js) | three.core.min.js | File originale, nucleo delle primitive e della matematica. |
| [build/three.module.min.js](https://github.com/mrdoob/three.js/blob/r180/build/three.module.min.js) | three.module.min.js | File originale, importa il core locale. Rendering WebGL 2. |
| [examples/jsm/controls/OrbitControls.js](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/controls/OrbitControls.js) | OrbitControls.js | Unica sostituzione dello specificatore `'three'` con `'./three.module.min.js'`. |
| [LICENSE](https://github.com/mrdoob/three.js/blob/r180/LICENSE) | LICENSE | Copia integrale. |

I tre file JavaScript e la licenza Three.js si possono rigenerare in una directory temporanea e confrontare byte per byte. Una copia della distribuzione già installata funziona con il solo server locale. Per ripetere l’acquisizione serve il tarball originale, ottenibile anche da un archivio offline.

```sh
npm pack three@0.180.0 --ignore-scripts
openssl dgst -sha512 -binary three-0.180.0.tgz | openssl base64 -A
tar -xzf three-0.180.0.tgz
mkdir riprodotto
cp package/build/three.core.min.js package/build/three.module.min.js package/LICENSE riprodotto/
sed "s/from 'three';/from '.\/three.module.min.js';/" package/examples/jsm/controls/OrbitControls.js > riprodotto/OrbitControls.js
curl -fsSL https://raw.githubusercontent.com/mapbox/earcut/4814c8c97ee3965d03e2c7e5f68a0dc4700458c1/LICENSE -o riprodotto/LICENSE-earcut
curl -fsSL https://raw.githubusercontent.com/mrdoob/eventdispatcher.js/f31179e964ce6cd76818fd25f4152d4bcc82040c/LICENSE -o riprodotto/LICENSE-eventdispatcher
curl -fsSL https://www.boost.org/LICENSE_1_0.txt -o riprodotto/LICENSE-boost
diff -qr riprodotto /percorso/officina-di-fisica/static/vendor/three-r180
```

SHA-512 del tarball (base64) `o+qycAMZrh+TsE01GqWUxUIKR1AL0S8pq7zDkYOQw8GqfX8b8VoCKYUoHbhiX5j+7hr8XsuHDVU6+gkQJQKg9w==`. SHA-256 dei file finali, in ordine core, modulo, controlli e licenza.

```text
61ba0df005b05991361d040d8ff670e1aadfd0ce7aeebd1fdb0725957a8957de
e2b5ee6bccd38fd6d8a2428546b83c5f2426d84b152ef82be8055556e3b40eb6
6c860c6b342200f8aef65493319c12bfb2d652107355b1d25eb2154371128391
bfe119ea4fd413f5f7ca3fcd63adb0c4a073ed39daa2fe7d3e6b769e21272601
```

### Provenienza interna del bundle

Il core r180 include la triangolazione di poligoni di Mapbox Earcut v3.0.1 (`src/extras/lib/earcut.js` di Three.js, a monte `src/earcut.js`, commit `4814c8c97ee3965d03e2c7e5f68a0dc4700458c1`). La distribuzione conserva l’avviso ISC, copyright © 2024 Mapbox. [Sorgente](https://github.com/mapbox/earcut/tree/v3.0.1) · [Avviso ISC](../../static/vendor/three-r180/LICENSE-earcut)

Il gestore di eventi r180 rimanda al progetto EventDispatcher dell’autore di Three.js. Per il riferimento esterno è conservata la licenza MIT del commit `f31179e964ce6cd76818fd25f4152d4bcc82040c`. I metodi di intersezione di `src/math/Ray.js` attribuiscono gli algoritmi a Geometric Tools, David Eberly, copyright © 1998–2018, Boost Software License 1.0. Il commento di `src/math/Triangle.js` accredita l’algoritmo del punto più vicino a Christer Ericson, *Real-Time Collision Detection*, Morgan Kaufmann, 2005, § 5.1.5. Questi riferimenti riguardano il bundle distribuito dal progetto Three.js. [EventDispatcher](../../static/vendor/three-r180/LICENSE-eventdispatcher) · [Header Geometric Tools](https://github.com/pmjoniak/GeometricTools/blob/ae6e933f9ab3a5474d830700ea8d9445cc78ef4b/GTEngine/Include/Mathematics/GteDistRaySegment.h) · [Licenza Boost](../../static/vendor/three-r180/LICENSE-boost) · [Attribuzione Triangle](https://github.com/mrdoob/three.js/blob/r180/src/math/Triangle.js)

## Confronto tecnico ed editoriale

Le licenze riportate sono quelle dei repository consultati. La misura del carico su telefono riguarda il codice effettivamente integrato e il viewport emulato. Per gli altri progetti i costi sono valutazioni architetturali. Nessun benchmark comparativo tra motori è stato eseguito.

| Progetto e licenza controllata | Oggetto della valutazione | Decisione per questi banchi |
| --- | --- | --- |
| [3ducation · MIT](https://github.com/atbt-ops/3ducation/blob/main/LICENSE) | Strumenti per pendolo, pressione, circuiti e gas. App Vite con catalogo, quiz e sincronizzazione Firebase opzionale. | Riferimento per una domanda prima dell’esperimento. L’integrazione dell’intera app aggiungerebbe interfaccia e progressi propri. |
| [ScienceLab 3D · MIT](https://github.com/rudra496/sciencelab3d/blob/main/LICENSE) | Piattaforma Next.js/React/TypeScript, presentazione di esperimenti interdisciplinari. | Riferimento per strumenti manipolabili. La struttura applicativa e le dipendenze richiederebbero un secondo frontend. |
| [Three.js · MIT](https://github.com/mrdoob/three.js/blob/r180/LICENSE) | Geometrie indicizzate, ortografia, materiali trasparenti, controlli orbitali. Nessun modello fisico implicito. | Adottato. Un caricamento del motore, seguito dal solo modulo del banco aperto. Si può fermare il rendering degli apparati statici. |
| [Babylon.js · Apache-2.0](https://github.com/BabylonJS/Babylon.js/blob/master/license.md) | Motore completo con editor, materiali, telecamere e strumenti di gioco. | Possibile per scene più ampie. Qui bastano primitive e una camera ortografica per banco. |
| [cannon-es · MIT](https://github.com/pmndrs/cannon-es/blob/master/LICENSE) | Dinamica a corpi rigidi JavaScript, integrazione temporale, urti e vincoli. | Candidato per urti futuri. La soglia di attrito e il moto a accelerazione costante si calcolano in forma chiusa e si controllano a mano. |
| [Rapier · Apache-2.0](https://github.com/dimforge/rapier/blob/master/LICENSE) | Solutore di contatti e collisioni, Rust con binding WASM per il web. | Candidato per vincoli complessi. Il modulo WASM e l’inizializzazione sarebbero un costo ulteriore al primo accesso. |
| [BN Lab Simulations · MIT](https://github.com/4mser/bn-lab-simulations/blob/main/LICENSE) | Simulazioni modulari di onde, fluidi, ottica e termodinamica con risultati di validazione e avvisi di terzi separati. | Riferimento per i controlli scientifici. Il profilo assiale analitico del capillare rende direttamente verificabile la legge in R⁴. [Validazione](https://github.com/4mser/bn-lab-simulations/tree/main/validation) |
| [IlliniOpenEdu PhysicsSims · MIT](https://github.com/IlliniOpenEdu/PhysicsSims/blob/main/LICENSE) | Simulazioni universitarie di meccanica ed elettromagnetismo, frontend e materiale multimediale propri. | Riferimento per i confronti vettoriali. La geometria del campo e delle equipotenziali di Officina nasce dalle stesse cariche puntiformi delle letture. |
| [Ray Optics Simulation · Apache-2.0](https://github.com/ricktu288/ray-optics/blob/master/LICENSE) | Tracciamento ottico nel piano, lenti, raggi e prolungamenti, percorso ottico arbitrario. | Riferimento per il banco laterale. Le due rette parassiali bastano per i punti coniugati richiesti dal MUR. |
| [uPlot · MIT](https://github.com/leeoniya/uPlot/blob/master/LICENSE) | Plot Canvas per molte serie temporali e campioni densi. | Candidato per acquisizioni più grandi. Qui bastano pochi punti e un cursore SVG sincronizzato allo stesso tempo fisico. |

Il riferimento scientifico per la selezione dei fenomeni è il testo del 2026 archiviato nell’app. La numerazione usata nel catalogo è quella dell’inventario didattico locale. [Syllabus archiviato](../sources/MUR-syllabus-fisica-2026.pdf) · [Fonte MUR](https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf) · [Corrispondenze degli obiettivi](../../tools/inventario.py)
