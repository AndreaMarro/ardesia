# Research: Karpathy Autoresearch per Web App Optimization

Data: 2026-04-07 04:23
Ciclo: Research Task 4, ciclo 1

## Fonti
- [Karpathy autoresearch GitHub](https://github.com/karpathy/autoresearch)
- [Mager.co: Blueprint for Self-Improving Agents](https://www.mager.co/blog/2026-03-14-autoresearch-pattern/)
- [MindStudio: AutoResearch Loop for Business](https://www.mindstudio.ai/blog/what-is-autoresearch-loop-karpathy-business-optimization)
- [DataCamp: Guide to AutoResearch](https://www.datacamp.com/tutorial/guide-to-autoresearch)
- [VentureBeat: Hundreds of experiments a night](https://venturebeat.com/technology/andrej-karpathys-new-open-source-autoresearch-lets-you-run-hundreds-of-ai)
- [Medium: Universal Autoresearch Skill](https://medium.com/@k.balu124/i-turned-andrej-karpathys-autoresearch-into-a-universal-skill-1cb3d44fc669)

## Key Findings

1. **Shopify Liquid: 53% faster, 61% fewer allocations** da 93 commit automatici.
   Pattern: modify liquid engine → benchmark → keep/discard. RISULTATO REALE su codice production.

2. **Landing page: 41% → 92% conversion** in 4 round.
   3 cambiamenti tenuti, 1 revertato automaticamente. Dimostra che il pattern funziona su web UX.

3. **Marketing: da 30 a 36,500 esperimenti/anno** teorici.
   Il pattern automatizza A/B testing su subject line, CTA, landing page.

4. **La ricetta e' SEMPLICE**: UN file, UNA metrica, UN budget fisso, keep/discard.
   Non serve framework complesso. Basta un loop bash.

5. **Lighthouse come metrica autoresearch**: Performance score, a11y score, CLS, LCP sono numeri.
   Un agent puo' fare: modifica CSS → corri Lighthouse → score migliore? keep : discard.

## Applicabilita' a ELAB

ELAB ha evaluate-v3.sh che produce UN numero (0-100). Questo e' gia' il pattern Karpathy.
Ma possiamo POTENZIARLO:

- **Performance loop**: modifica 1 file → npm run build → confronta bundle size → keep/discard
- **A11y loop**: modifica 1 componente → corri axe-core → violations diminuite? keep : discard
- **Test loop**: scrivi test → npm test → count aumentato? keep (attuale Test Factory)
- **Lighthouse loop**: modifica 1 file → deploy preview → Lighthouse → score migliore? keep

Il VERO salto: invece di "fix generico", ogni sessione ha UNA METRICA da ottimizzare.

## ACTION ITEMS

1. **IMMEDIATE**: Il Ralph Loop gia' attivo segue il pattern. Verificare che stia effettivamente
   misurando prima/dopo con evaluate-v3.sh.

2. **QUESTA SETTIMANA**: Aggiungere Lighthouse CI nel quality-gate.yml come metrica autoresearch.
   Target: performance >= 75, a11y >= 80.

3. **PROSSIMO SPRINT**: Creare "micro-loops" specializzati:
   - a11y-loop: UN componente alla volta, axe-core come metrica
   - perf-loop: UN chunk alla volta, bundle size come metrica
   - test-loop: UN servizio alla volta, test count come metrica (gia' attivo)

4. **FUTURO**: Il Mac Mini potrebbe girare 3 micro-loops in parallelo con git worktree,
   ciascuno ottimizzando una metrica diversa senza conflitti.
