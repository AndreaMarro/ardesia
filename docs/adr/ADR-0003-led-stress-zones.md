# ADR-0003 — Zone di stress LED nel wrapper del solve (risoluzione D4-2)

- **Stato**: ACCEPTED (decisione autonoma con evidenza, governance NOTTE-13)
- **Data**: 2026-07-14
- **Contesto**: sessione FABLE NOTTE-13; conflitto D4-2 scoperto in NOTTE-12 (PR #133)

## Problema

Il motore vendored (`CircuitSolver.js`, MNA) ha un burn BINARIO: LED bruciato
quando I > 30mA (`LED_BURN_CURRENT = 0.03`, riga 1791). Questo contraddice il
libro su cui il prodotto è costruito:

- Vol.1 p.33: 220Ω sul LED verde (I = (9−2.2)/220 = **30.9mA**) è presentato
  come "il LED si illumina di più" — il motore lo BRUCIAVA.
- Vol.1 p.33: "NON scendere mai al di sotto dei 100 Ohm" — il pavimento di
  sicurezza del libro (68mA) — il motore lo bruciava comunque.

Con il binario, la scena esp3 non poteva essere mostrata onestamente
(runtime "acceso" vs motore "bruciato") → `blocked-by-gate`.

## Fisica (fonte alta: datasheet + testo volume)

LED 5mm indicatore tipico: 20mA nominale continuo, ~30mA massimo continuo
assoluto, ~100mA picco impulsivo (<10ms). Tra 30 e 100mA il LED **si degrada
nel tempo** (vita ridotta, surriscaldamento), non esplode all'istante.
Il burn istantaneo è fisicamente difendibile solo oltre il picco impulsivo.
Il libro è coerente con questa fisica: 220Ω = più luminoso (vero, con vita
ridotta), sotto 100Ω = pericolo concreto.

## Decisione

**Zone di stress calcolate nel wrapper** (`apps/studio/sim/solver/elabSolver.ts`,
`ledStressZone` + `reinterpretLedStress`), applicate ai soli componenti `led`
dell'esperimento:

| Zona | Corrente | Verdetto |
|---|---|---|
| `nominale` | ≤ 25mA | acceso |
| `overdrive` | 25–50mA | acceso, più luminoso, warning "vita del LED ridotta" |
| `pericolo` | 50–100mA | acceso, warning severo (il pavimento del libro vive qui) |
| `bruciato` | > 100mA | bruciato (il caso "senza resistore", ~1A — esp2 invariato) |

Le grandezze elettriche NON vengono toccate: il burn del motore non altera la
soluzione MNA (il LED bruciato conserva la caduta diretta, CircuitSolver.js:1810),
quindi reinterpretare i soli flag visivi (`burned`/`on`/`brightness` +
`stressZone`) è sano. Ogni reinterpretazione emette un warning STRUTTURATO in
`diagnostics.overloadWarnings` — mai un downgrade silenzioso.

## Perché nel wrapper e non nel motore

Il motore è una copia vendored byte-identica protetta da drift-guard (la
stessa copia vive nel plugin elab-tutor). Toccarlo = rompere il drift-guard e
biforcare le due copie. Il wrapper tipizzato è NOSTRO codice, testato, e la
decisione resta in un punto solo.

## Conseguenze

- esp3 esce da `blocked-by-gate`: electrical = "pass" CALCOLATO (overdrive,
  acceso, mai bruciato), scena nel catalogo onestà (3/88) e sul post-it
  (toolbar "sim esp3"), zona visibile nella diagnostica.
- esp2 invariato: ~1A > 100mA → bruciato.
- I vecchi test di caratterizzazione D4-2 si sono rotti come da loro contratto
  e sono stati sostituiti dalla caratterizzazione delle zone
  (ElabSceneEsp3.test.ts).
- La UI può mostrare "acceso ma in overdrive/pericolo" — pedagogicamente più
  ricco del binario (il libro insegna esattamente questo gradiente).

## Rollback

Rimuovere `reinterpretLedStress` e le soglie da `elabSolver.ts`: il verdetto
torna al binario del motore. Nessun dato persistito dipende dalle zone.
