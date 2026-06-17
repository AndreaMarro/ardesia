# Lighthouse Baseline Analysis — ELAB Tutor

**Data**: 25/03/2026 (aggiornamento da baseline 24/03)
**URL testato**: https://www.elabtutor.school → funny-pika-3d1029.netlify.app/vetrina.html
**Versione Lighthouse**: 12.8.2 (preset: desktop)

## Punteggi Baseline (25/03/2026)

| Categoria | Punteggio | Precedente | Target | Status |
|-----------|-----------|------------|--------|--------|
| **Performance** | 94% | 61% | 85%+ | ✅ +33 punti! SOPRA TARGET |
| **Accessibility** | 94% | 94% | 90%+ | ✅ SOPRA TARGET |
| **Best Practices** | 96% | 96% | 90%+ | ✅ SOPRA TARGET |
| **SEO** | 100% | 100% | 90%+ | ✅ ECCELLENTE |

## Metriche Core Web Vitals

| Metrica | Valore | Score |
|---------|--------|-------|
| FCP (First Contentful Paint) | 1.1s | 0.78 |
| LCP (Largest Contentful Paint) | 1.3s | 0.88 |
| CLS (Cumulative Layout Shift) | 0 | 1.00 |
| TBT (Total Blocking Time) | 0ms | 1.00 |
| Speed Index | 1.1s | 0.94 |

## Analisi del Miglioramento Performance (+33 punti)

I fix applicati nei cicli 52-65 hanno avuto impatto massiccio:
- **Font self-hosting** (ciclo 52): eliminato render-blocking Google Fonts
- **Lazy loading immagini** (ciclo 53-54): defer non-critical images
- **Code splitting** (Sprint 3): manualChunks per CodeMirror/AVR/React
- **CLS = 0**: nessun layout shift — ottimo per LIM Promethean

## Aree di Miglioramento Residue

### FCP 1.1s (score 0.78) — margine per sub-1s
- Potenziale: preload font critico, inline critical CSS
- Impatto LIM: su connessione 10Mbps scuola, FCP potrebbe essere 1.5-2s

### LCP 1.3s (score 0.88) — buono ma migliorabile
- Target ideale: < 1.0s per "primo wow moment" immediato

## Monitoring Setup
- Baseline: `lighthouse-baseline.json` (aggiornato 25/03/2026)
- Storico: `lighthouse-baseline-20260324.json` (primo baseline)
- Comando: `npx lighthouse https://www.elabtutor.school --output=json --preset=desktop`
- Frequenza: ogni AUDIT cycle + pre-deploy

---
**Autore**: Andrea Marro — ELAB Autoresearch
**Ciclo**: 4 (25/03/2026)
