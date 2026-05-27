# Hidden Experiments — Documentazione Ripristino

**Data**: 2026-05-25
**Andrea verbatim**: "nascondi tutti quelli (con possibilità di farli tornare tutti) tranne i primi 3 volume 1 + pwm crea tuo colore, volume 2 i primi 2 sul condensatore volume tre lampeggiante e semaforo. ASSICURATI DI POTERE RESUSCITARE TUTTO. DOCUMENTA QUESTE COSE NEL MINIMO DETTAGLIO."

## Meccanismo

ZERO modifica ai file `experiments-vol1.js`, `experiments-vol2.js`, `experiments-vol3.js`. I dati esperimento restano INTATTI. Il filtro è applicato SOLO a livello UI (pickers Lavagna).

Fonte unica di verità: [`src/data/experiment-visibility.js`](../src/data/experiment-visibility.js)

## Esperimenti VISIBILI (8)

### Volume 1 — Le Basi
| ID | Titolo | Lezione |
|---|---|---|
| `v1-cap6-esp1` | Accendi il tuo primo LED | v1-accendi-led |
| `v1-cap6-esp2` | LED senza resistore (cosa NON fare!) | v1-accendi-led |
| `v1-cap6-esp3` | Cambia luminosità con resistenze diverse | v1-accendi-led |
| `v1-cap9-esp6` | Lampada RGB con 3 potenziometri (PWM mix R+G+B) | v1-potenziometro |

### Volume 2 — Approfondiamo
| ID | Titolo | Lezione |
|---|---|---|
| `v2-cap7-esp1` | Scarica del condensatore con multimetro | v2-condensatori-rc |
| `v2-cap7-esp2` | Scarica con LED rosso | v2-condensatori-rc |

### Volume 3 — Programmazione Arduino
| ID | Titolo | Lezione |
|---|---|---|
| `v3-cap6-esp4` | Due LED che si alternano (tipo sirena pin 6+9) | v3-cap6-digitali |
| `v3-cap6-esp5` | Costruiamo un semaforo | v3-cap6-digitali |

## Esperimenti NASCOSTI (86)

### Volume 1 — 34 nascosti

**Lesson `v1-led-rgb` (6 nascosti)**:
- v1-cap7-esp1 — Accendi il rosso del RGB
- v1-cap7-esp2 — Accendi il verde del RGB
- v1-cap7-esp3 — Accendi il blu del RGB
- v1-cap7-esp4 — Mescola 2 colori: il viola!
- v1-cap7-esp5 — Tutti e 3: bianco!
- v1-cap7-esp6 — Crea il tuo colore!

**Lesson `v1-pulsanti` (5 nascosti)**:
- v1-cap8-esp1, v1-cap8-esp2, v1-cap8-esp3, v1-cap8-esp4, v1-cap8-esp5

**Lesson `v1-potenziometro` (5 nascosti, 1 visibile = esp6 PWM 3 pot RGB)**:
- v1-cap9-esp1 — Dimmer LED con potenziometro
- v1-cap9-esp2 — Inverti la rotazione
- v1-cap9-esp3 — LED di colore diverso con pot
- v1-cap9-esp4 — Dimmer RGB azzurrino
- v1-cap9-esp5 — Pot miscelatore blu/rosso

**Lesson `v1-sfide-pot` (3 nascosti)**: v1-cap9-esp7/8/9
**Lesson `v1-sensore-luce` (6 nascosti)**: v1-cap10-esp1/2/3/4/5/6
**Lesson `v1-buzzer` (2 nascosti)**: v1-cap11-esp1/2
**Lesson `v1-reed-switch` (4 nascosti)**: v1-cap12-esp1/2/3/4
**Lesson `v1-plastilina` (2 nascosti)**: v1-cap13-esp1/2
**Lesson `v1-robot` (1 nascosto)**: v1-cap14-esp1

### Volume 2 — 25 nascosti

**Lesson `v2-multimetro` (4 nascosti)**: v2-cap3-esp1/2/3/4
**Lesson `v2-resistenze-serie-parallelo` (3 nascosti)**: v2-cap4-esp1/2/3
**Lesson `v2-batterie-serie` (2 nascosti)**: v2-cap5-esp1/2
**Lesson `v2-led-vf-resistore` (4 nascosti)**: v2-cap6-esp1/2/3/4
**Lesson `v2-condensatori-rc` (2 nascosti, 2 visibili)**:
- v2-cap7-esp3 (nascosto)
- v2-cap7-esp4 (nascosto)
**Lesson `v2-transistor` (3 nascosti)**: v2-cap8-esp1/2/3
**Lesson `v2-fototransistor` (2 nascosti)**: v2-cap9-esp1/2
**Lesson `v2-motore` (4 nascosti)**: v2-cap10-esp1/2/3/4
**Lesson `v2-robot-segui-luce` (1 nascosto)**: v2-cap12-esp1

### Volume 3 — 27 nascosti

**Lesson `v3-cap5-blink` (1 nascosto, 1 visibile)**:
- v3-cap5-esp2 — Modificare il delay del Blink

**Lesson `v3-cap6-digitali` (7 nascosti, 1 visibile = semaforo esp5)**:
- v3-cap6-esp1, v3-cap6-esp2, v3-cap6-esp3, v3-cap6-esp4, v3-cap6-esp6, v3-cap6-esp7, v3-cap6-esp8

**Lesson `v3-cap7-analogici` (7 nascosti)**: v3-cap7-esp1/2/3/4/5/6/7
**Lesson `v3-cap8-seriale` (6 nascosti)**: v3-cap8-esp1/2/3/4/5/6

## Come ripristinare

### Opzione A — Ripristino di UN solo esperimento
Aprire `src/data/experiment-visibility.js`, aggiungere l'ID dell'esperimento all'array `VISIBLE_EXP_IDS`. Esempio:

```js
export const VISIBLE_EXP_IDS = Object.freeze([
  // ... esistenti ...
  'v1-cap7-esp4', // <-- aggiunto: viola RGB mix
]);
```

Poi `npm run build` e deploy.

### Opzione B — Ripristino TOTALE (tutti gli 94 esperimenti)
In `src/data/experiment-visibility.js`, sostituire l'export di `VISIBLE_EXP_IDS` con:

```js
import EXPERIMENTS_VOL1 from './experiments-vol1';
import EXPERIMENTS_VOL2 from './experiments-vol2';
import EXPERIMENTS_VOL3 from './experiments-vol3';

export const VISIBLE_EXP_IDS = Object.freeze([
  ...EXPERIMENTS_VOL1.experiments.map((e) => e.id),
  ...EXPERIMENTS_VOL2.experiments.map((e) => e.id),
  ...EXPERIMENTS_VOL3.experiments.map((e) => e.id),
]);
```

Oppure più rapido — impostare flag debug:

```js
export const VISIBILITY_FILTER_DISABLED = true;
```

E poi modificare i consumer (`lesson-groups.js getLessonsForVolume` + `ExperimentPicker.jsx`) a rispettare il flag.

### Opzione C — Git revert questo commit
Il filtro è introdotto in commit dedicato. `git revert <sha>` annulla l'intera meccanica.

## Componenti UI affetti

Il filtro è applicato in:

1. **`src/data/lesson-groups.js`** — `getLessonsForVolume()` esclude lessons con zero esperimenti visibili + filtra l'array `experiments` di ogni lesson restituita.
2. **`src/components/lavagna/ExperimentPicker.jsx`** — quando elenca esperimenti per volume, applica `filterVisibleExperiments()` sui dati VOL1/VOL2/VOL3.
3. **`src/components/lavagna/PercorsoCapitoloView.jsx`** — eredita da `lesson-groups` quindi automaticamente filtrato.

`findExperimentById()` NON è filtrato — un esperimento nascosto resta accessibile programmaticamente (es. quando UNLIM lo carica via API). Questo per evitare regression su `__ELAB_API.mountExperiment(id)` chiamate con ID nascosti.

## Nota tecnica anti-regressione

I dati `experiments-vol*.js` restano INVARIATI rispetto a `origin/main` (revert 25/05). Le pinAssignments, connections, buildSteps, code, layout di ogni esperimento sono PRESERVATI. Per la "vecchia versione" di costruzione (Andrea verbatim "vecchia versione esperimenti") basta che gli ID restino nei file. Il filter UI è puramente cosmetico.

## Future espansioni

- `experiment-visibility.js` può evolvere a una "named profile" system (es. `DEMO_25MAY`, `CORSO_PRIMARIA`, `CORSO_MEDIA`) ciascuno con sua whitelist.
- Filter potrebbe spostarsi a livello service-side via Supabase config se serve gestione runtime senza redeploy.
