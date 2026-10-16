# Ardesia Studio

Studio è la lavagna web del monorepo: React 19, TypeScript, Vite 8 ed Excalidraw 0.18, con MathLive/MathJax per le formule e pdfjs per le pagine PDF. I contratti e le versioni effettive sono nel codice e nei lockfile.

## Stato della consegna

Il [registro del 16 ottobre 2026](../../docs/ops/CONSEGNA-2026-10-16.md) distingue il main b124eee0 dai candidati archiviati per storage, identità dei post-it, misure LED e chiusura/materiale. Questi candidati sono pubblicati su GitHub e testati separatamente; non sono stati composti o integrati nel main. Il precedente README descriveva il prototipo del 9 giugno: la sua separazione assoluta da LessonOS e il piano cloud non descrivevano più questo checkout.

Studio possiede lavagna e journal; il ToolHost governa i plugin e i consumer leggono la memoria della lezione. Formule e PDF possono richiedere risorse o conversioni dedicate. Il salvataggio locale e l'esportazione vanno distinti da garanzie di durata dopo crash o da collaborazione remota, che questa consegna non attesta.

## Avvio

Dalla radice del monorepo:

```sh
cd apps/studio
npm ci
npm run dev
```

## Controlli

Dalla directory Studio:

```sh
npm run typecheck
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm run build
```

Il gate originale in `apps/studio/eval/gate.sh` include il replay reale nel browser. I risultati si attribuiscono sempre al commit su cui sono stati eseguiti. Nel candidato 1a71d913 il gate riporta 2258 controlli PASS, il percorso docente–destinatario passa su desktop/mobile e il PDF sintetico ha una pagina; le figure restano un'omissione visibile nell'HTML. Non è una prova del prodotto completo.

React è deduplicato nella configurazione Vite. Si preservano byte e MIME dei file; il journal resta append-only. Le modifiche ai formati sono additive e i gate non si indeboliscono. Cloud, penna, accessibilità completa, pilot e integrazione con altri prodotti richiedono prove proprie.
