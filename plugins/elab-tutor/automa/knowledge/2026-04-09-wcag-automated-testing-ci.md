# Research: WCAG 2.2 Automated Testing in CI

Data: 2026-04-09

## Fonti
- [CivicActions: GitHub Actions + pa11y-ci + axe](https://accessibility.civicactions.com/posts/automated-accessibility-testing-leveraging-github-actions-and-pa11y-ci-with-axe)
- [Accesify: axe + pa11y + Lighthouse CI in DevOps](https://www.accesify.io/blog/accessibility-testing-automation-axe-pa11y-lighthouse-ci/)
- [Medium: WCAG compliance axe-core + GitHub Actions](https://medium.com/@SkorekM/from-theory-to-automation-wcag-compliance-using-axe-core-next-js-and-github-actions-b9f63af8e155)
- [Crosscheck: 10 Best WCAG 2.2 Tools 2026](https://crosscheck.cloud/blogs/best-accessibility-testing-tools-wcag)
- [axe-core GitHub](https://github.com/dequelabs/axe-core)

## Key Findings

1. **axe-core trova 57% problemi WCAG** automaticamente. Il resto richiede test manuale. Ma 57% e' meglio di 0% (ELAB attuale).

2. **axe-core 4.5+ supporta WCAG 2.2**: touch target size, focus appearance — esattamente quello che serve a ELAB (iPad/LIM).

3. **pa11y wrappa axe-core**: gestisce browser automation, page loading, aggregazione risultati. Piu' facile da integrare in CI di axe-core puro.

4. **GitHub Actions setup semplice**: workflow che lancia pa11y-ci su URL di preview Vercel. ~5 righe di YAML.

5. **30-40% WCAG automatizzabile**: il resto serve test manuale con screen reader. Ma il 30-40% cattura contrast ratio, aria-label, touch target — i problemi piu' frequenti di ELAB.

## Applicabilita' ELAB

ELAB ha gap A11y 5→7. Aggiungere axe-core/pa11y in CI catturerebbe automaticamente:
- Contrast ratio sotto 4.5:1 (problema ricorrente)
- Bottoni senza aria-label
- Touch target < 44px (critico per iPad)
- Focus visible mancante
- Skip-to-content assente

## Action Items

1. **P1**: Aggiungere `@axe-core/cli` o `pa11y-ci` al workflow CI
   ```yaml
   - name: A11y audit
     run: npx pa11y-ci --config .pa11yci.json
   ```
2. **P2**: Creare `.pa11yci.json` con URL del preview Vercel
3. **P2**: Aggiungere `vitest-axe` per test a11y nei component test
4. **P3**: Integrare `eslint-plugin-jsx-a11y` nel linter
