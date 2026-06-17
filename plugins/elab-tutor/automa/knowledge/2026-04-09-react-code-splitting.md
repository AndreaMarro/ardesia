# Research: React Code Splitting + Vite Performance

Data: 2026-04-09

## Fonti
- [OneUptime: React Code Splitting + Lazy Loading](https://oneuptime.com/blog/post/2026-01-15-react-code-splitting-lazy-loading/view)
- [Medium: Code Splitting in React with Vite](https://medium.com/@akashsdas_dev/code-splitting-in-react-w-vite-eae8a9c39f6e)
- [Medium: Reducing Vite Bundle Size](https://shaxadd.medium.com/optimizing-your-react-react-application-a-guide-to-reducing-bundle-size-6b7e93891c96)
- [AgustinMaggi: 3x Bundle Reduction Case Study](https://agustinmaggi.com/achieving-3x-reduction-in-react-bundle-size)

## Key Findings

1. **40-60% reduction in initial load** con code splitting. ELAB ha chunk da 1298KB (NewElabSimulator) e 1911KB (react-pdf) — candidati perfetti.

2. **Vite supporta code splitting nativo** via dynamic import(). ELAB ha gia' manual chunks in vite.config.js ma i 2 chunk piu' grandi non sono lazy.

3. **Soglia: splitta chunk > 30-50KB**. ELAB ha 6 chunk > 100KB. Almeno 3 sono lazy-loadabili.

4. **Non over-splittare**: solo feature grandi e route. Il simulatore puo' essere lazy (si carica quando l'utente lo apre), react-pdf puo' essere lazy (si carica solo per report).

5. **rollup-plugin-visualizer**: gia' usato in ELAB? Se no, aggiungere per capire cosa pesa.

## Applicabilita' ELAB

I 2 target per code splitting:
- **react-pdf (1911KB)**: usato SOLO nel report fumetto. Lazy load con `React.lazy(() => import('react-pdf'))` quando l'utente clicca "report".
- **NewElabSimulator (1298KB)**: il componente piu' grande. Potrebbe essere lazy-loaded quando l'utente entra nella pagina simulatore.

## Action Items

1. [P2] Lazy load react-pdf: `const PDFViewer = React.lazy(() => import('./UnlimReport'))`
2. [P2] Lazy load NewElabSimulator al route change
3. [P3] Aggiungere rollup-plugin-visualizer per analisi bundle
4. [P3] Impostare Lighthouse performance budget in CI (target ≥75)
